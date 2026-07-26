import re

from pydantic import BaseModel
from word2number import w2n

import anthropic
from openai import OpenAI
from src.config.settings import settings
from src.schemas.transaction import TransactionEntry, VoiceTransactionResponse

_SYSTEM_PROMPT = (
    "You are extracting structured records from a Nigerian trader's voice note transcript "
    "(English/Pidgin mix). For each distinct record mentioned, output one entry with: action, "
    "item, quantity, unit (if mentioned, else omit), amount, currency \"NGN\" (treat \"5k\" as "
    "5000). action is one of: \"buy\" (trader purchased goods), \"sell\" (trader sold goods), "
    "\"debt_owed\" (a customer owes the trader money, e.g. \"customer owe me three thousand\"), "
    "\"debt_paid\" (a customer paid off a debt, e.g. \"customer don pay me the three thousand\"), "
    "\"expense\" (trader spent money on something other than goods, e.g. rent, transport), "
    "\"waste\" (goods lost/spoiled/thrown away — amount is 0 since no cash changed hands). For "
    "buy/sell/waste, item is the goods name and quantity is how many; for debt/expense, item is "
    "a short description (e.g. \"customer\", \"shop rent\", \"transport\") and quantity is 1. A "
    "single transcript can contain multiple records. If an item is not repeated for a later "
    "action, infer it refers to the most recently mentioned item. Only extract things that "
    "should be recorded — ignore questions or requests for information (e.g. \"how much profit "
    "did I make today?\", \"show me what sold this week\", \"find someone selling pepper "
    "nearby\") since those require reading existing data, not logging a new record."
)

_ACTION_WORDS = {"buy": "buy", "bought": "buy", "buying": "buy", "sell": "sell", "sold": "sell", "selling": "sell"}
_UNIT_WORDS = ["basket", "baskets", "bag", "bags", "piece", "pieces", "crate", "crates", "bunch", "bunches"]
_NUMBER_WORDS = {
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
    "nineteen", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
    "hundred", "thousand", "million",
}
_EXPENSE_STOPWORDS = {"i", "pay", "spend", "spent", "paid", "naira", "the", "on", "a", "an"}


class _ExtractedTransactions(BaseModel):
    transactions: list[TransactionEntry]


def extract_transactions(transcript: str, date: str) -> VoiceTransactionResponse:
    if settings.llm_provider == "mock":
        transactions = _extract_mock(transcript)
    elif settings.llm_provider == "anthropic":
        transactions = _extract_anthropic(transcript)
    elif settings.llm_provider in ("openai", "grok"):
        transactions = _extract_openai_compatible(transcript)
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {settings.llm_provider}")

    return VoiceTransactionResponse(transcript=transcript, date=date, transactions=transactions)


def _parse_amount(text: str) -> float:
    match = re.search(r"(\d+(?:\.\d+)?)\s*(k)?", text)
    if not match:
        return 0.0
    value = float(match.group(1))
    return value * 1000 if match.group(2) else value


def _words_to_digits(text: str) -> str:
    """Converts spelled-out numbers ("five thousand") to digits ("5000") so the
    rest of the mock parser only ever has to deal with digit patterns."""
    tokens = text.split()
    result: list[str] = []
    i = 0
    while i < len(tokens):
        if tokens[i] in _NUMBER_WORDS:
            j = i
            while j < len(tokens) and tokens[j] in _NUMBER_WORDS:
                j += 1
            phrase = " ".join(tokens[i:j])
            try:
                result.append(str(w2n.word_to_num(phrase)))
            except ValueError:
                result.extend(tokens[i:j])
            i = j
        else:
            result.append(tokens[i])
            i += 1
    return " ".join(result)


def _extract_unit(item_candidate: str) -> tuple[str | None, str]:
    for unit_word in _UNIT_WORDS:
        for prefix in (f"{unit_word} of ", f"{unit_word} "):
            if item_candidate.startswith(prefix):
                return unit_word, item_candidate[len(prefix):]
    return None, item_candidate


def _extract_amount_anywhere(text: str) -> float:
    match = re.search(r"(\d+(?:\.\d+)?\s*k?)", text)
    return _parse_amount(match.group(1)) if match else 0.0


def _extract_mock(transcript: str) -> list[TransactionEntry]:
    text = _words_to_digits(re.sub(r"[.,!?]", "", transcript.lower()))

    if re.search(r"\b(buy|bought|buying|sell|sold|selling)\b", text):
        return _extract_buy_sell(text)
    if "owe" in text:
        return [TransactionEntry(action="debt_owed", item="customer", quantity=1.0, amount=_extract_amount_anywhere(text))]
    if re.search(r"\bpay\b", text) and "customer" in text:
        return [TransactionEntry(action="debt_paid", item="customer", quantity=1.0, amount=_extract_amount_anywhere(text))]
    if re.search(r"\b(spend|pay)\b", text):
        return [_extract_expense(text)]
    if re.search(r"\b(spoil|spoilt|throw away|thrown away)\b", text):
        return [_extract_waste(text)]

    return []


def _extract_buy_sell(text: str) -> list[TransactionEntry]:
    parts = re.split(r"\b(buy|bought|buying|sell|sold|selling)\b", text)

    transactions: list[TransactionEntry] = []
    last_item = "unknown"
    for i in range(1, len(parts) - 1, 2):
        action = _ACTION_WORDS[parts[i]]
        clause = parts[i + 1]

        for_match = re.search(r"for\s+(\d+(?:\.\d+)?\s*k?)", clause)
        amount = _parse_amount(for_match.group(1)) if for_match else 0.0
        pre_for = clause[: for_match.start()] if for_match else clause

        qty_match = re.search(r"(\d+(?:\.\d+)?)", pre_for)
        quantity = float(qty_match.group(1)) if qty_match else 1.0

        item_candidate = pre_for[qty_match.end():] if qty_match else pre_for
        item_candidate = item_candidate.strip()

        if amount == 0.0:
            trailing_num_match = re.search(r"(\d+(?:\.\d+)?)\s*$", item_candidate)
            if trailing_num_match:
                amount = _parse_amount(trailing_num_match.group(1))
                item_candidate = item_candidate[: trailing_num_match.start()].strip()

        item_candidate = re.sub(r"^\s*of\s+", "", item_candidate)
        item_candidate = re.sub(r"\btoday\b", "", item_candidate).strip()
        unit, item_candidate = _extract_unit(item_candidate) if item_candidate else (None, item_candidate)
        item_candidate = item_candidate.strip()
        item = item_candidate if item_candidate else last_item
        last_item = item

        transactions.append(TransactionEntry(action=action, item=item, quantity=quantity, unit=unit, amount=amount))

    return transactions


def _extract_expense(text: str) -> TransactionEntry:
    amount = _extract_amount_anywhere(text)
    words = [w for w in re.findall(r"[a-z]+", text) if w not in _EXPENSE_STOPWORDS]
    item = " ".join(words).strip() or "expense"
    return TransactionEntry(action="expense", item=item, quantity=1.0, amount=amount)


_WASTE_STOPWORDS = {"of", "because", "dem", "spoil", "spoilt", "rain", "the"}


def _extract_waste(text: str) -> TransactionEntry:
    qty_match = re.search(r"(\d+(?:\.\d+)?)", text)
    quantity = float(qty_match.group(1)) if qty_match else 1.0

    item_candidate = text[qty_match.end():].strip() if qty_match else text
    unit, item_candidate = _extract_unit(item_candidate) if item_candidate else (None, item_candidate)
    words = [w for w in re.findall(r"[a-z]+", item_candidate) if w not in _WASTE_STOPWORDS]
    item = " ".join(words).strip() or "goods"

    return TransactionEntry(action="waste", item=item, quantity=quantity, unit=unit, amount=0.0)


def _extract_anthropic(transcript: str) -> list[TransactionEntry]:
    client = anthropic.Anthropic(api_key=settings.llm_api_key)
    response = client.messages.parse(
        model=settings.llm_model or "claude-opus-4-8",
        max_tokens=2048,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": transcript}],
        output_format=_ExtractedTransactions,
    )
    return response.parsed_output.transactions


def _extract_openai_compatible(transcript: str) -> list[TransactionEntry]:
    is_grok = settings.llm_provider == "grok"
    client = OpenAI(api_key=settings.llm_api_key, base_url="https://api.x.ai/v1" if is_grok else None)
    default_model = "grok-2-latest" if is_grok else "gpt-4o-mini"

    response = client.chat.completions.create(
        model=settings.llm_model or default_model,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": transcript},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "extracted_transactions",
                "schema": _ExtractedTransactions.model_json_schema(),
            },
        },
    )
    content = response.choices[0].message.content
    return _ExtractedTransactions.model_validate_json(content).transactions
