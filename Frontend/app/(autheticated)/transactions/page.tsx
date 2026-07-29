"use client";

import { useState } from "react";
import clsx from "clsx";
import TransactionReceipt from "@/components/TransactionReceipt";
import { useSabiMarketStore } from "@/lib/store";

type Filter = "all" | "buy" | "sell";

export default function TransactionsPage() {
  const transactions = useSabiMarketStore((s) => s.transactions);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = transactions.filter((t) => filter === "all" || t.kind === filter);

  return (
    <div className="px-5 pt-5">
      <h1 className="font-display text-xl font-semibold text-indigo">All transactions</h1>

      <div className="mt-4 flex gap-2">
        {(["all", "buy", "sell"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-full px-4 py-1.5 text-xs text-secondary-foreground font-semibold capitalize",
              filter === f ? "bg-secondary text-cream" : "bg-grey text-indigo/60 shadow-card"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3 pb-4">
        {filtered.length === 0 ? (
          <p className="rounded-card bg-white p-4 text-center text-sm text-indigo/50 shadow-card">
            Nothing here yet.
          </p>
        ) : (
          filtered.map((t) => <TransactionReceipt key={t.id} txn={t} />)
        )}
      </div>
    </div>
  );
}
