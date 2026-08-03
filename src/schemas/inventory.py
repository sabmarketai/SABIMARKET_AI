from pydantic import BaseModel


class CreateInventoryItemRequest(BaseModel):
    item_name: str
    quantity: float
    unit: str
    average_cost: float


class UpdateInventoryItemRequest(BaseModel):
    item_name: str | None = None
    quantity: float | None = None
    unit: str | None = None
    average_cost: float | None = None


class AdjustStockRequest(BaseModel):
    quantity: float  # signed delta, e.g. -3 to remove 3 units
