"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMarketPrice } from "../api/requests";
import { marketKeys } from "../api/queryKeys";

export const useCreateMarketPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMarketPrice,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.prices() });
      queryClient.invalidateQueries({ queryKey: marketKeys.all });
    },
  });
};
