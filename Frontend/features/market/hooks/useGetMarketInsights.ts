import { useQuery } from "@tanstack/react-query";
import { getMarketInsights } from "../api/requests";
import { marketKeys } from "../api/queryKeys";

export const useGetMarketInsights = (item?: string) => {
  return useQuery({
    queryKey: marketKeys.insights(item),
    queryFn: () => getMarketInsights(item),
    enabled: !!item,
  });
};
