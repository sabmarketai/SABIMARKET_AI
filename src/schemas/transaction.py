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


# --- Below: requests for the persisted transactions table (Supabase), as opposed
# --- to TransactionEntry above, which is only the AI's in-memory extraction result.


class CreateTransactionRequest(BaseModel):
    transaction_type: str  # "buy" | "sell" | "debt_owed" | "debt_paid" | "expense" | "waste"
    total_amount: float
    profit: float | None = None
    note: str | None = None


class UpdateTransactionRequest(BaseModel):
    transaction_type: str | None = None
    total_amount: float | None = None
    profit: float | None = None
    note: str | None = None
    synced: bool | None = None


class CreateTransactionItemRequest(BaseModel):
    item_name: str
    quantity: float
    unit: str
    unit_price: float


class UpdateTransactionItemRequest(BaseModel):
    item_name: str | None = None
    quantity: float | None = None
    unit: str | None = None
    unit_price: float | None = None
