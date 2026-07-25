import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language, Transaction } from "./types";
import { seedTransactions } from "./mockData";

interface SabiMarketState {
  transactions: Transaction[];
  language: Language;
  isOnline: boolean;
  addTransactions: (txns: Transaction[]) => void;
  markSynced: (ids: string[]) => void;
  setLanguage: (lang: Language) => void;
  setOnline: (online: boolean) => void;
}

export const useSabiMarketStore = create<SabiMarketState>()(
  persist(
    (set) => ({
      transactions: seedTransactions,
      language: "pidgin",
      isOnline: true,
      addTransactions: (txns) =>
        set((state) => ({ transactions: [...txns, ...state.transactions] })),
      markSynced: (ids) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            ids.includes(t.id) ? { ...t, synced: true } : t
          ),
        })),
      setLanguage: (language) => set({ language }),
      setOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: "sabimarket-storage",
      // Only persist what a trader actually needs offline; prices/community
      // feed refresh from the (future) backend instead.
      partialize: (state) => ({
        transactions: state.transactions,
        language: state.language,
      }),
    }
  )
);

// Derived helpers -----------------------------------------------------------

export function todaysProfit(transactions: Transaction[]): number {
  const today = new Date().toDateString();
  return transactions
    .filter((t) => new Date(t.createdAt).toDateString() === today)
    .reduce((sum, t) => sum + (t.kind === "sell" ? t.amount : -t.amount), 0);
}

export function unsyncedCount(transactions: Transaction[]): number {
  return transactions.filter((t) => !t.synced).length;
}
