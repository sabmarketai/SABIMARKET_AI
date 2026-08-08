"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInventoryItem } from "../api/requests";
import { inventoryKeys } from "../api/queryKeys";
import { CreateInventoryItemPayload, InventoryItem } from "../types";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation<InventoryItem, Error, CreateInventoryItemPayload>({
    mutationFn: createInventoryItem,

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
