"use client";

import Link from "next/link";
import {
  Wallet,
  Star,
  Mic,
  ArrowRight,
  Receipt,
  ShoppingBag,
  AlertCircle,
  Bell,
  LogOut,
} from "lucide-react";
import StatCard from "@/components/molecules/StatCard";
import InventoryCard from "@/components/molecules/InventoryCard";
import AlertBanner from "@/components/molecules/AlertBanner";
import MarketInsightCard from "@/components/molecules/MarketInsightCard";
import TransactionReceipt from "@/components/molecules/TransactionReceipt";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useGetUnreadNotifications } from "@/features/notifications/hooks/useGetUnreadNotifications";
import Loader from "@/components/shared/Loader";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";

function formatNaira(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₦${Math.abs(amount).toLocaleString("en-NG")}`;
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();
  const { data: unread } = useGetUnreadNotifications();
  const router = useRouter();
  const unreadCount = unread?.length ?? 0;

  const logout = async () => {
    await clearSession();
    router.replace("/");
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-card bg-red/10 p-4 m-4 text-sm text-red">
        <AlertCircle size={16} />
        {error instanceof Error
          ? error.message
          : "Failed to load your dashboard. Please try again."}
      </div>
    );
  }

  if (!data) {
    return <div>No dashboard data</div>;
  }

  const { user, today, inventory, alerts, recent, market } = data;
  const recentTxns = recent.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-lg font-semibold sm:text-xl">
            {user.full_name.split(" ")[0]}&apos;s shop
          </h1>
          <p className="text-xs text-indigo/50">{user.market_location}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grey text-indigo shadow-card"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <div
            className="border p-2 bg-destructive rounded-full"
            onClick={logout}
          >
            <LogOut />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total profit"
              value={formatNaira(today.totalProfit)}
              tone={today.totalProfit >= 0 ? "cassava" : "pepper"}
              icon={<Wallet size={14} />}
            />
            <StatCard
              label="Total Purchases"
              value={String(today.purchasesCount)}
              tone="gold"
              icon={<Star size={14} />}
              // sub={`${user.purchases_today} transactions`}
            />
            <StatCard
              label="Total Sales"
              value={String(today.salesCount)}
              tone="indigo"
              icon={<ShoppingBag size={14} />}
              sub={formatNaira(today.totalSales)}
              compact
            />
            <StatCard
              label="Total Expenses"
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
                recentTxns.map((t) => <TransactionReceipt key={t.id} txn={t} />)
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
