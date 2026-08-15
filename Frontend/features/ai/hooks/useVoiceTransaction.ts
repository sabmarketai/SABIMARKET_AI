"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voiceTransaction } from "../api/requests";
import { transactionKeys } from "@/features/transactions/api/queryKeys";
import { inventoryKeys } from "@/features/inventory/api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useVoiceTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voiceTransaction,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
