import { useQuery } from "@tanstack/react-query";
import { getRecentMarketPrices } from "../api/requests";
import { marketKeys } from "../api/queryKeys";

export const useGetRecentMarketPrices = (limit = 10) => {
  return useQuery({
    queryKey: marketKeys.recent(limit),
    queryFn: () => getRecentMarketPrices(limit),
  });
};
