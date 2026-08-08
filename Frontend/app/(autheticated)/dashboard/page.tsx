"use client";

import Link from "next/link";
import {
  Wallet,
  CloudOff,
  Mic,
  ArrowRight,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import StatCard from "@/components/molecules/StatCard";
import InventoryCard from "@/components/molecules/InventoryCard";
import AlertBanner from "@/components/molecules/AlertBanner";
import MarketInsightCard from "@/components/molecules/MarketInsightCard";
import TransactionReceipt from "@/components/molecules/TransactionReceipt";
import { unsyncedCount, useSabiMarketStore } from "@/lib/store";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

function formatNaira(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₦${Math.abs(amount).toLocaleString("en-NG")}`;
}

export default function DashboardPage() {
  const localTransactions = useSabiMarketStore((s) => s.transactions);
  const pending = unsyncedCount(localTransactions);

  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  if (!data) {
    return <div>No dashboard data</div>;
  }

  const { user, today, inventory, alerts, recent, market } = data;
  const recentTxns =
    recent.length > 0 ? recent.slice(0, 3) : localTransactions.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <h1 className="font-display text-lg font-semibold sm:text-xl">
          {user.full_name.split(" ")[0]}&apos;s shop
        </h1>
        <p className="text-xs text-indigo/50">{user.market_location}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Today's profit"
              value={formatNaira(today.totalProfit)}
              tone={today.totalProfit >= 0 ? "cassava" : "pepper"}
              icon={<Wallet size={14} />}
            />
            <StatCard
              label="Pending sync"
              value={String(pending)}
              tone="gold"
              icon={<CloudOff size={14} />}
              sub={pending > 0 ? "will sync when online" : "all caught up"}
            />
            <StatCard
              label="Sales today"
              value={String(today.salesCount)}
              tone="indigo"
              icon={<ShoppingBag size={14} />}
              sub={formatNaira(today.totalSales)}
              compact
            />
            <StatCard
              label="Expenses today"
              value={String(today.expenseCount)}
              tone="indigo"
              icon={<Receipt size={14} />}
              sub={formatNaira(today.totalExpenses)}
              compact
            />
          </div>

          <Link
            href="/record"
            className="flex items-center justify-between rounded-lg bg-primary px-5 py-4 text-primary-foreground shadow-card"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grey">
                <Mic size={18} className="text-indigo" />
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

          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">
                Recent activity
              </h2>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-gold-dark"
              >
                See all
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {recentTxns.length === 0 ? (
                <p className="rounded-card bg-white p-4 text-center text-sm text-foreground shadow-card">
                  No transactions yet. Tap the mic below to log your first one.
                </p>
              ) : (
                recentTxns.map((t: any) => (
                  <TransactionReceipt key={t.id} txn={t} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (stacks below main content on mobile/tablet) */}
        <div className="space-y-3">
          <AlertBanner count={alerts.count} message={alerts.message} />
          <InventoryCard
            totalItems={inventory.totalItems}
            totalQuantity={inventory.totalQuantity}
            inventoryValue={inventory.inventoryValue}
          />
          <MarketInsightCard type={market.type} message={market.message} />
        </div>
      </div>
    </div>
  );
}
