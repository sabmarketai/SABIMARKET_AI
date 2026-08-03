from fastapi import APIRouter, Depends

from src.schemas.transaction import (
    CreateTransactionItemRequest,
    CreateTransactionRequest,
    UpdateTransactionItemRequest,
    UpdateTransactionRequest,
)
from src.services import transactions_service
from src.services.supabase_client import verify_user

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.post("")
def create_transaction(body: CreateTransactionRequest, user: dict = Depends(verify_user)) -> dict:
    return transactions_service.create_transaction(user["id"], body)


@router.get("")
def list_transactions(user: dict = Depends(verify_user)) -> list[dict]:
    return transactions_service.find_all_transactions(user["id"])


@router.get("/{transaction_id}")
def get_transaction(transaction_id: int, user: dict = Depends(verify_user)) -> dict:
    return transactions_service.find_transaction(transaction_id)


@router.patch("/{transaction_id}")
def update_transaction(
    transaction_id: int, body: UpdateTransactionRequest, user: dict = Depends(verify_user)
) -> dict:
    return transactions_service.update_transaction(transaction_id, body)


@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, user: dict = Depends(verify_user)) -> dict:
    return transactions_service.delete_transaction(transaction_id)


@router.post("/{transaction_id}/items")
def create_transaction_item(
    transaction_id: int, body: CreateTransactionItemRequest, user: dict = Depends(verify_user)
) -> dict:
    return transactions_service.create_transaction_item(transaction_id, body)


@router.get("/{transaction_id}/items")
def get_transaction_items(transaction_id: int, user: dict = Depends(verify_user)) -> list[dict]:
    return transactions_service.find_transaction_items(transaction_id)


@router.patch("/items/{item_id}")
def update_transaction_item(
    item_id: int, body: UpdateTransactionItemRequest, user: dict = Depends(verify_user)
) -> dict:
    return transactions_service.update_transaction_item(item_id, body)


@router.delete("/items/{item_id}")
def delete_transaction_item(item_id: int, user: dict = Depends(verify_user)) -> dict:
    return transactions_service.delete_transaction_item(item_id)
