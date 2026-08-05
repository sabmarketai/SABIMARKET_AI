"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, CloudOff, Mic, ArrowRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import TransactionReceipt from "@/components/TransactionReceipt";
import { todaysProfit, unsyncedCount, useSabiMarketStore } from "@/lib/store";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/supabase";

function formatNaira(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₦${Math.abs(amount).toLocaleString("en-NG")}`;
}

export default function DashboardPage() {
  const transactions = useSabiMarketStore((s) => s.transactions);
  const profit = todaysProfit(transactions);
  const pending = unsyncedCount(transactions);
  const recent = transactions.slice(0, 4);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleEmailAuth(mode: "login" | "register") {
    setMessage("");
    try {
      const result =
        mode === "login"
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      setMessage(mode === "login" ? "Signed in successfully" : "Check your email to confirm the account");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  async function handleGoogleAuth() {
    setMessage("");
    const { error } = await signInWithGoogle();
    if (error) setMessage(error.message);
  }

  return (
    <div className="px-5 pt-5">
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
        className="mt-4 flex items-center justify-between rounded-card bg-indigo px-5 py-4 text-cream shadow-card"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold">
            <Mic size={18} className="text-indigo" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Log a sale or buy</span>
            <span className="block text-xs text-cream/60">Just talk — no typing needed</span>
          </span>
        </span>
        <ArrowRight size={18} />
      </Link>

      <div className="mt-6 rounded-card border border-indigo/10 bg-white p-4 shadow-card">
        <h2 className="font-display text-sm font-semibold text-indigo">Quick auth</h2>
        <p className="mt-1 text-xs text-indigo/60">
          Sign in or register with Supabase. Google sign-in is also available.
        </p>
        <div className="mt-3 space-y-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-indigo/10 bg-cream px-3 py-2 text-sm text-indigo"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-lg border border-indigo/10 bg-cream px-3 py-2 text-sm text-indigo"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleEmailAuth("login")}
              className="flex-1 rounded-lg bg-indigo px-3 py-2 text-sm font-semibold text-cream"
            >
              Log in
            </button>
            <button
              onClick={() => handleEmailAuth("register")}
              className="flex-1 rounded-lg border border-indigo/20 px-3 py-2 text-sm font-semibold text-indigo"
            >
              Register
            </button>
          </div>
          <button
            onClick={handleGoogleAuth}
            className="w-full rounded-lg border border-gold-dark/20 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold-dark"
          >
            Continue with Google
          </button>
          {message ? <p className="text-xs text-indigo/70">{message}</p> : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-indigo">Recent activity</h2>
        <Link href="/transactions" className="text-xs font-semibold text-gold-dark">
          See all
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {recent.length === 0 ? (
          <p className="rounded-card bg-white p-4 text-center text-sm text-indigo/50 shadow-card">
            No transactions yet. Tap the mic below to log your first one.
          </p>
        ) : (
          recent.map((t) => <TransactionReceipt key={t.id} txn={t} />)
        )}
      </div>
    </div>
  );
}
