"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction } from "../api/requests";
import { transactionKeys } from "../api/queryKeys";
import { inventoryKeys } from "@/features/inventory/api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
