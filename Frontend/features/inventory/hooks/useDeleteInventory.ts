import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInventoryItem } from "../api/requests";
import { inventoryKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInventoryItem,

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
