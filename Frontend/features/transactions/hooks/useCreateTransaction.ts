"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "../api/requests";
import { transactionKeys } from "../api/queryKeys";
import { inventoryKeys } from "@/features/inventory/api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { CreateTransactionPayload, Transaction } from "../types";

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CreateTransactionPayload>({
    mutationFn: createTransaction,

    onSuccess: async () => {
      // The backend syncs inventory as part of creating the transaction, so
      // we only need to refetch — never adjust inventory locally here.
     await  queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      await queryClient.invalidateQueries({ queryKey: inventoryKeys.list() });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
