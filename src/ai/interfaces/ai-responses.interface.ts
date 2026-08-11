/**
 * These mirror the schemas defined in swagger-ai.json (the Python AI backend's
 * OpenAPI contract). Do not add fields that are not present there.
 */

export type AiTransactionAction =
  | 'buy'
  | 'sell'
  | 'debt_owed'
  | 'debt_paid'
  | 'expense'
  | 'waste';

export type AiTrend = 'up' | 'down' | 'stable';

export interface AiTransactionEntry {
  action: AiTransactionAction;
  item: string;
  quantity: number;
  unit?: string | null;
  amount: number;
  currency: string;
}

export interface AiVoiceTransactionResponse {
  transcript: string;
  date: string;
  transactions: AiTransactionEntry[];
}

export interface AiWeatherInfo {
  market: string;
  temperature_c: number;
  condition: string;
  rain_expected: boolean;
  rain_probability_percent: number;
}

export interface AiMarketOption {
  market: string;
  current_avg_price: number;
  trend: AiTrend;
  percent_change: number;
  weather: AiWeatherInfo;
}

export interface AiPricePrediction {
  item: string;
  market: string;
  unit: string;
  current_avg_price: number;
  trend: AiTrend;
  percent_change: number;
  confidence: 'low' | 'medium' | 'high';
  advice: string;
  data_source: string;
  weather?: AiWeatherInfo | null;
}

export interface AiMarketRecommendation {
  item: string;
  action: 'buy' | 'sell';
  recommended_market: string;
  reason: string;
  options: AiMarketOption[];
}
