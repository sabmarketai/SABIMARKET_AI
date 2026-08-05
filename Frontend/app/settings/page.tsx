"use client";

import { useSabiMarketStore, unsyncedCount } from "@/lib/store";
import { seedTransactions } from "@/lib/mockData";
import { Languages, RotateCcw, Info } from "lucide-react";

export default function SettingsPage() {
  const language = useSabiMarketStore((s) => s.language);
  const setLanguage = useSabiMarketStore((s) => s.setLanguage);
  const transactions = useSabiMarketStore((s) => s.transactions);
  const addTransactions = useSabiMarketStore((s) => s.addTransactions);
  const pending = unsyncedCount(transactions);

  function resetDemoData() {
    // FILLER — clears local state back to the seed data. Once the backend
    // exists this becomes "sign out" / "clear local cache" instead.
    useSabiMarketStore.setState({ transactions: seedTransactions });
  }

  return (
    <div className="px-5 pt-5">
      <h1 className="font-display text-xl font-semibold text-indigo">Settings</h1>

      <section className="mt-5 rounded-card bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2 text-indigo">
          <Languages size={16} />
          <h2 className="text-sm font-semibold">Language</h2>
        </div>
        <div className="flex gap-2">
          {(["pidgin", "english"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={
                language === lang
                  ? "flex-1 rounded-full bg-indigo py-2 text-sm font-semibold capitalize text-cream"
                  : "flex-1 rounded-full border border-indigo/15 py-2 text-sm font-semibold capitalize text-indigo/60"
              }
            >
              {lang}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-indigo/40">
          Controls the wording used across the app and voice prompts.
        </p>
      </section>

      <section className="mt-4 rounded-card bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-indigo">Sync status</h2>
            <p className="mt-0.5 text-xs text-indigo/40">
              {pending > 0
                ? `${pending} transaction${pending > 1 ? "s" : ""} waiting to sync`
                : "Everything is backed up"}
            </p>
          </div>
          <span
            className={
              pending > 0
                ? "h-2.5 w-2.5 rounded-full bg-gold"
                : "h-2.5 w-2.5 rounded-full bg-cassava"
            }
          />
        </div>
      </section>

      <button
        onClick={resetDemoData}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-card bg-white p-4 text-sm font-semibold text-pepper shadow-card"
      >
        <RotateCcw size={16} /> Reset demo data
      </button>

      <section className="mt-4 flex items-start gap-2 rounded-card bg-indigo/5 p-4 text-xs text-indigo/60">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>
          This build runs entirely on your device with sample data — no account or backend
          yet. Data lives in this browser only. See the project README for how the real
          sync, auth, and price-aggregation services plug in.
        </p>
      </section>
    </div>
  );
}
