"use client";

import Link from "next/link";
import { Wallet, CloudOff, Mic, ArrowRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import TransactionReceipt from "@/components/TransactionReceipt";
import { todaysProfit, unsyncedCount, useSabiMarketStore } from "@/lib/store";

function formatNaira(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₦${Math.abs(amount).toLocaleString("en-NG")}`;
}

export default function DashboardPage() {
  const transactions = useSabiMarketStore((s) => s.transactions);
  const profit = todaysProfit(transactions);
  const pending = unsyncedCount(transactions);
  const recent = transactions.slice(0, 4);

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Today's profit"
          value={formatNaira(profit)}
          tone={profit >= 0 ? "cassava" : "pepper"}
          icon={<Wallet size={14} />}
        />
        <StatCard
          label="Pending sync"
          value={String(pending)}
          tone="gold"
          icon={<CloudOff size={14} />}
          sub={pending > 0 ? "will sync when online" : "all caught up"}
        />
      </div>

      <Link
        href="/record"
        className="mt-4 flex items-center justify-between rounded-lg bg-primary px-5 py-4 text-primary-foreground shadow-card"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grey">
            <Mic size={18} className="text-indig  o" />
          </span>
          <span>
            <span className="block text-sm font-semibold">
              Log a sale or buy
            </span>
            <span className="block text-xs text-cream/60">
              Just talk — no typing needed
            </span>
          </span>
        </span>
        <ArrowRight size={18} />
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">
          Recent activity
        </h2>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-gold-dark text-primary"
        >
          See all
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {recent.length === 0 ? (
          <p className="rounded-card bg-white p-4 text-center text-sm text-foreground shadow-card">
            No transactions yet. Tap the mic below to log your first one.
          </p>
        ) : (
          recent.map((t) => <TransactionReceipt key={t.id} txn={t} />)
        )}
      </div>
    </div>
  );
}
