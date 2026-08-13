import { useQuery } from "@tanstack/react-query";
import { predictPrice } from "../api/requests";

export const usePredictPrice = (item?: string, market?: string) => {
  return useQuery({
    queryKey: ["ai", "predict", item, market ?? null],
    queryFn: () => predictPrice(item as string, market),
    enabled: !!item,
  });
};
