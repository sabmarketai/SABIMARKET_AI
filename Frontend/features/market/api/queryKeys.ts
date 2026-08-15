import { QueryMarketPricesParams } from "../types";

export const marketKeys = {
  all: ["market"] as const,

  prices: () => [...marketKeys.all, "prices"] as const,
  priceList: (params?: QueryMarketPricesParams) =>
    [...marketKeys.prices(), "list", params ?? {}] as const,
  priceDetail: (id: string) => [...marketKeys.prices(), "detail", id] as const,
  recent: (limit?: number) => [...marketKeys.prices(), "recent", limit ?? null] as const,

  insights: (item?: string) => [...marketKeys.all, "insights", item ?? null] as const,
};
