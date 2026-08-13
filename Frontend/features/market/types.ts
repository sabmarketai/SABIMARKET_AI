export interface MarketPrice {
  id: string;
  market_name: string | null;
  item_name: string | null;
  price: number | null;
  submitted_by: string | null;
  created_at: string | null;
}

export interface CreateMarketPricePayload {
  marketName: string;
  itemName: string;
  price: number;
}

export interface QueryMarketPricesParams {
  market?: string;
  item?: string;
  limit?: number;
}

export interface MarketComparisonEntry {
  market: string;
  price: number;
}

export interface ItemInsight {
  item: string;
  message?: string;
  priceCount: number;
  latestPrice?: number;
  latestMarket?: string | null;
  previousPrice?: number | null;
  percentChange?: number | null;
  trend?: "up" | "down" | "stable";
  lowestMarket?: MarketComparisonEntry;
  highestMarket?: MarketComparisonEntry;
  marketComparison?: MarketComparisonEntry[];
}

export interface AllInsightsResponse {
  items: ItemInsight[];
}

export type MarketInsightsResponse = ItemInsight | AllInsightsResponse;

export function isAllInsightsResponse(
  data: MarketInsightsResponse,
): data is AllInsightsResponse {
  return Array.isArray((data as AllInsightsResponse).items);
}
