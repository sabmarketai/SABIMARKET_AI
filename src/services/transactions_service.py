from fastapi import HTTPException

from src.schemas.transaction import (
    CreateTransactionItemRequest,
    CreateTransactionRequest,
    UpdateTransactionItemRequest,
    UpdateTransactionRequest,
)
from src.services.supabase_client import get_supabase_client

_ITEMS_SELECT = "*, transaction_items(*)"


def create_transaction(user_id: str, body: CreateTransactionRequest) -> dict:
    client = get_supabase_client()
    result = (
        client.table("transactions")
        .insert(
            {
                "user_id": user_id,
                "transaction_type": body.transaction_type,
                "total_amount": body.total_amount,
                "profit": body.profit,
                "note": body.note,
            }
        )
        .execute()
    )
    return result.data[0]


def find_all_transactions(user_id: str) -> list[dict]:
    client = get_supabase_client()
    result = (
        client.table("transactions")
        .select(_ITEMS_SELECT)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def find_transaction(transaction_id: int) -> dict:
    client = get_supabase_client()
    result = client.table("transactions").select(_ITEMS_SELECT).eq("id", transaction_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result.data[0]


def update_transaction(transaction_id: int, body: UpdateTransactionRequest) -> dict:
    client = get_supabase_client()
    updates = {k: v for k, v in body.model_dump(by_alias=False).items() if v is not None}
    result = client.table("transactions").update(updates).eq("id", transaction_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result.data[0]


def delete_transaction(transaction_id: int) -> dict:
    client = get_supabase_client()
    result = client.table("transactions").delete().eq("id", transaction_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result.data[0]


def create_transaction_item(transaction_id: int, body: CreateTransactionItemRequest) -> dict:
    client = get_supabase_client()
    result = (
        client.table("transaction_items")
        .insert(
            {
                "transaction_id": transaction_id,
                "item_name": body.item_name,
                "quantity": body.quantity,
                "unit": body.unit,
                "unit_price": body.unit_price,
                "total_price": body.quantity * body.unit_price,
            }
        )
        .execute()
    )
    return result.data[0]


def find_transaction_items(transaction_id: int) -> list[dict]:
    client = get_supabase_client()
    result = client.table("transaction_items").select("*").eq("transaction_id", transaction_id).execute()
    return result.data


def update_transaction_item(item_id: int, body: UpdateTransactionItemRequest) -> dict:
    client = get_supabase_client()

    existing = client.table("transaction_items").select("*").eq("id", item_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Transaction item not found")
    current = existing.data[0]

    quantity = body.quantity if body.quantity is not None else current["quantity"]
    unit_price = body.unit_price if body.unit_price is not None else current["unit_price"]

    updates = {
        "item_name": body.item_name if body.item_name is not None else current["item_name"],
        "quantity": quantity,
        "unit": body.unit if body.unit is not None else current["unit"],
        "unit_price": unit_price,
        "total_price": quantity * unit_price,
    }
    result = client.table("transaction_items").update(updates).eq("id", item_id).execute()
    return result.data[0]


def delete_transaction_item(item_id: int) -> dict:
    client = get_supabase_client()
    result = client.table("transaction_items").delete().eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction item not found")
    return result.data[0]
