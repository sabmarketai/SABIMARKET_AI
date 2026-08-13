"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustInventoryStock } from "../api/requests";
import { inventoryKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      adjustInventoryStock(id, quantity),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
