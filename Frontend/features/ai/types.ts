import { Transaction } from "@/features/transactions/types";

export interface AiTransactionResult {
  transcript: string;
  date: string;
  transactions: Transaction[];
}

export interface WeatherInfo {
  market: string;
  temperature_c: number;
  condition: string;
  rain_expected: boolean;
  rain_probability_percent: number;
}

export interface PricePrediction {
  item: string;
  market: string;
  unit: string;
  current_avg_price: number;
  trend: "up" | "down" | "stable";
  percent_change: number;
  confidence: "low" | "medium" | "high";
  advice: string;
  data_source: string;
  weather: WeatherInfo | null;
}

export interface MarketOption {
  market: string;
  current_avg_price: number;
  trend: "up" | "down" | "stable";
  percent_change: number;
  weather: WeatherInfo;
}

export interface MarketRecommendation {
  item: string;
  action: "buy" | "sell";
  recommended_market: string;
  reason: string;
  options: MarketOption[];
}
