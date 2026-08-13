import { authRequest } from "@/lib/authRequest";
import {
  CreateMarketPricePayload,
  MarketInsightsResponse,
  MarketPrice,
  QueryMarketPricesParams,
} from "../types";

function buildQuery(params: object) {
  const search = new URLSearchParams();
  Object.entries(params as Record<string, string | number | undefined>).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== "") {
        search.set(key, String(value));
      }
    }
  );
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const getMarketPrices = (params: QueryMarketPricesParams = {}) =>
  authRequest<MarketPrice[]>(`/api/market/prices${buildQuery(params)}`, {
    method: "GET",
  });

export const getRecentMarketPrices = (limit = 10) =>
  authRequest<MarketPrice[]>(
    `/api/market/prices/recent${buildQuery({ limit })}`,
    { method: "GET" }
  );

export const getMarketPrice = (id: string) =>
  authRequest<MarketPrice>(`/api/market/prices/${id}`, { method: "GET" });

export const createMarketPrice = (payload: CreateMarketPricePayload) =>
  authRequest<MarketPrice>("/api/market/prices", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMarketInsights = (item?: string) =>
  authRequest<MarketInsightsResponse>(
    `/api/market/insights${buildQuery({ item })}`,
    { method: "GET" }
  );
