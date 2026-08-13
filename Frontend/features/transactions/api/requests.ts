import { authRequest } from "@/lib/authRequest";
import {
  CreateTransactionPayload,
  Transaction,
  TransactionItem,
  UpdateTransactionPayload,
} from "../types";

export const getTransactions = () =>
  authRequest<Transaction[]>("/api/transactions", { method: "GET" });

export const getTransaction = (id: string) =>
  authRequest<Transaction>(`/api/transactions/${id}`, { method: "GET" });

export const createTransaction = (payload: CreateTransactionPayload) =>
  authRequest<Transaction>("/api/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTransaction = (
  id: string,
  payload: UpdateTransactionPayload
) =>
  authRequest<Transaction>(`/api/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteTransaction = (id: string) =>
  authRequest(`/api/transactions/${id}`, { method: "DELETE" });

export const syncTransaction = (id: string) =>
  authRequest<{ message: string; transaction: Transaction } | Transaction>(
    `/api/transactions/${id}/sync`,
    { method: "POST" }
  );

export const getTransactionItems = (id: string) =>
  authRequest<TransactionItem[]>(`/api/transactions/${id}/items`, {
    method: "GET",
  });
