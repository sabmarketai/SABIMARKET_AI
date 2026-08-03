from fastapi import HTTPException

from src.schemas.inventory import AdjustStockRequest, CreateInventoryItemRequest, UpdateInventoryItemRequest
from src.services.supabase_client import get_supabase_client


def create_item(user_id: str, body: CreateInventoryItemRequest) -> dict:
    client = get_supabase_client()
    result = (
        client.table("inventory_items")
        .insert(
            {
                "user_id": user_id,
                "item_name": body.item_name,
                "quantity": body.quantity,
                "unit": body.unit,
                "average_cost": body.average_cost,
            }
        )
        .execute()
    )
    return result.data[0]


def find_all_items(user_id: str) -> list[dict]:
    client = get_supabase_client()
    result = (
        client.table("inventory_items")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


def find_item(item_id: int) -> dict:
    client = get_supabase_client()
    result = client.table("inventory_items").select("*").eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return result.data[0]


def update_item(item_id: int, body: UpdateInventoryItemRequest) -> dict:
    client = get_supabase_client()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    result = client.table("inventory_items").update(updates).eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return result.data[0]


def delete_item(item_id: int) -> dict:
    client = get_supabase_client()
    result = client.table("inventory_items").delete().eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return result.data[0]


def adjust_stock(item_id: int, body: AdjustStockRequest) -> dict:
    item = find_item(item_id)
    new_quantity = float(item["quantity"] or 0) + body.quantity

    client = get_supabase_client()
    result = client.table("inventory_items").update({"quantity": new_quantity}).eq("id", item_id).execute()
    return result.data[0]
