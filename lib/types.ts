export type TransactionKind = "buy" | "sell";

export interface Transaction {
  id: string;
  kind: TransactionKind;
  item: string;
  quantity: number;
  unit: string; // e.g. "paint rubber", "basket", "piece"
  amount: number; // naira
  market: string;
  createdAt: string; // ISO string
  synced: boolean; // false while waiting to sync to backend
  transcript?: string; // raw voice transcript, if voice-logged
}

export interface MarketPrice {
  id: string;
  item: string;
  market: string;
  pricePerUnit: number;
  unit: string;
  trend: "up" | "down" | "flat";
  changePercent: number;
  note?: string; // e.g. "go now before rain"
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  associationName: string;
  message: string;
  type: "alert" | "supplier" | "buyer" | "general";
  createdAt: string;
}

export type Language = "english" | "pidgin";
