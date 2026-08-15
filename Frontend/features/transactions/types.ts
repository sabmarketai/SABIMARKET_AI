export type TransactionType =
  | "buy"
  | "sell"
  | "debt_owed"
  | "debt_paid"
  | "expense"
  | "waste";

export interface TransactionItem {
  id: string;
  transaction_id: string;
  item_name: string | null;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
  total_price: number | null;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  transaction_type: string | null;
  transaction_date: string | null;
  total_amount: number | null;
  profit: number | null;
  currency: string | null;
  note: string | null;
  synced: boolean | null;
  created_at: string | null;
  transaction_items?: TransactionItem[];
}

export interface CreateTransactionItemPayload {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface CreateTransactionPayload {
  transactionType: TransactionType | string;
  totalAmount: number;
  profit?: number;
  currency?: string;
  note?: string;
  items: CreateTransactionItemPayload[];
}

export interface UpdateTransactionPayload {
  note?: string;
}
