import { authRequest } from "@/lib/authRequest"
import { CreateInventoryItemPayload, InventoryItem, InventoryResponse } from "../types"

export const getInventory = () =>{
    return authRequest<InventoryResponse>("/api/inventory", {
        method: "GET"
    })
}

export const createInventoryItem = (
  payload: CreateInventoryItemPayload
) => {
  return authRequest<InventoryItem>("/api/inventory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteInventoryItem = (id: string) => {
  return authRequest(`/api/inventory/${id}`, {
    method: "DELETE",
  });
};

export const updateInventoryItem = (
  id: string,
  payload: CreateInventoryItemPayload
) => {
  return authRequest(`/api/inventory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};