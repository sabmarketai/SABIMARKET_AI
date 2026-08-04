from typing import Literal

from pydantic import BaseModel


class TransactionEntry(BaseModel):
    action: Literal["buy", "sell", "debt_owed", "debt_paid", "expense", "waste"]
    item: str  # goods name, or a short description for debt/expense/waste (e.g. "customer", "shop rent")
    quantity: float
    unit: str | None = None  # e.g. "pieces", "kg", "basket" — omitted if not mentioned
    amount: float  # naira amount mentioned for this line (0 if none, e.g. plain waste with no cash value)
    currency: str = "NGN"


class VoiceTransactionResponse(BaseModel):
    transcript: str
    date: str  # ISO date, e.g. "2026-07-24"
    transactions: list[TransactionEntry]


class TranscriptRequest(BaseModel):
    transcript: str
