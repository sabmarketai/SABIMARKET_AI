import { useQuery } from "@tanstack/react-query";
import { getMarketPrices } from "../api/requests";
import { marketKeys } from "../api/queryKeys";
import { QueryMarketPricesParams } from "../types";

export const useGetMarketPrices = (params: QueryMarketPricesParams = {}) => {
  return useQuery({
    queryKey: marketKeys.priceList(params),
    queryFn: () => getMarketPrices(params),
  });
};
