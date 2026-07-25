import re

from pydantic import BaseModel

import anthropic
from openai import OpenAI
from src.config.settings import settings
from src.schemas.transaction import TransactionEntry, VoiceTransactionResponse

_SYSTEM_PROMPT = (
    "You are extracting structured trading transactions from a Nigerian trader's voice "
    "note transcript (English/Pidgin mix). For each distinct buy or sell mentioned, output "
    "one entry with: action (\"buy\" or \"sell\"), item, quantity, unit (if mentioned, else "
    "omit), amount (naira value mentioned for that line — treat \"5k\" as 5000), "
    "currency \"NGN\". A single transcript can contain multiple transactions. If an item is "
    "not repeated for a later action (e.g. \"sell 2 for 200\" after \"buy 50 oranges\"), infer "
    "it refers to the most recently mentioned item."
)

_ACTION_WORDS = {"buy": "buy", "bought": "buy", "buying": "buy", "sell": "sell", "sold": "sell", "selling": "sell"}


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


def _extract_mock(transcript: str) -> list[TransactionEntry]:
    text = transcript.lower().replace(",", "")
    parts = re.split(r"\b(buy|bought|buying|sell|sold|selling)\b", text)

    transactions: list[TransactionEntry] = []
    last_item = "unknown"
    for i in range(1, len(parts) - 1, 2):
        action = _ACTION_WORDS[parts[i]]
        clause = parts[i + 1]

        qty_match = re.search(r"(\d+(?:\.\d+)?)", clause)
        quantity = float(qty_match.group(1)) if qty_match else 1.0

        item_match = re.search(r"\d+(?:\.\d+)?\s+(?:of\s+)?([a-z\s]+?)\s+for\b", clause)
        item = item_match.group(1).strip() if item_match else last_item
        last_item = item

        amount = 0.0
        for_match = re.search(r"for\s+(\d+(?:\.\d+)?\s*k?)", clause)
        if for_match:
            amount = _parse_amount(for_match.group(1))

        transactions.append(TransactionEntry(action=action, item=item, quantity=quantity, amount=amount))

    return transactions


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
