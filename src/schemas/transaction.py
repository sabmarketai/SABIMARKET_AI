from typing import Literal

from pydantic import BaseModel


class TransactionEntry(BaseModel):
    action: Literal["buy", "sell"]
    item: str
    quantity: float
    unit: str | None = None  # e.g. "pieces", "kg", "basket" — omitted if not mentioned
    amount: float  # naira amount mentioned for this line
    currency: str = "NGN"


class VoiceTransactionResponse(BaseModel):
    transcript: str
    date: str  # ISO date, e.g. "2026-07-24"
    transactions: list[TransactionEntry]
