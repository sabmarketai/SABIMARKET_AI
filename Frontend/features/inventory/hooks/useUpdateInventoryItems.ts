"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInventoryItem } from "../api/requests";
import { inventoryKeys } from "../api/queryKeys";
import { CreateInventoryItemPayload, InventoryItem } from "../types";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateInventoryItemPayload;
    }) => updateInventoryItem(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.overview(),
      });
    },
  });
};
