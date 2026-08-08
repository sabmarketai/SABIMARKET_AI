import { useQuery } from "@tanstack/react-query";
import { getInventory } from "../api/requests";
import { inventoryKeys } from "../api/queryKeys";

export const useGetInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: getInventory,
  });
};