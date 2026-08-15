"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncTransaction } from "../api/requests";
import { transactionKeys } from "../api/queryKeys";
import { inventoryKeys } from "@/features/inventory/api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useSyncTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncTransaction,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
