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

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      await queryClient.invalidateQueries({ queryKey: inventoryKeys.list() });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
