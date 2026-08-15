import { useQuery } from "@tanstack/react-query";
import { recommendMarket } from "../api/requests";

export const useRecommendMarket = (item?: string, action?: "buy" | "sell") => {
  return useQuery({
    queryKey: ["ai", "recommend", item, action ?? null],
    queryFn: () => recommendMarket(item as string, action as "buy" | "sell"),
    enabled: !!item && !!action,
  });
};
