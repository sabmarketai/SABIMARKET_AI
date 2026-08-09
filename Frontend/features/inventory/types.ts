export interface CreateInventoryItemPayload {
  itemName: string;
  quantity: number;
  unit: string;
  averageCost: number;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_name: string;
  quantity: string;
  unit: string;
  average_cost: string;
  updated_at: string;
}

export type InventoryResponse = InventoryItem[];