"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTransaction } from "../api/requests";
import { transactionKeys } from "../api/queryKeys";
import { UpdateTransactionPayload } from "../types";

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTransactionPayload;
    }) => updateTransaction(id, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
    },
  });
};
