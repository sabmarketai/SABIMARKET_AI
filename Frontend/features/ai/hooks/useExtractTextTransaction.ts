"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { extractTextTransaction } from "../api/requests";
import { transactionKeys } from "@/features/transactions/api/queryKeys";
import { inventoryKeys } from "@/features/inventory/api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useExtractTextTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extractTextTransaction,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
