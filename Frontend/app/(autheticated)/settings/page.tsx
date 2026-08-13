"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Languages, LogOut, Info } from "lucide-react";
import { useSabiMarketStore } from "@/lib/store";
import { clearSession } from "@/lib/session";

export default function SettingsPage() {
  const language = useSabiMarketStore((s) => s.language);
  const setLanguage = useSabiMarketStore((s) => s.setLanguage);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await clearSession();
    router.replace("/");
  }

  return (
    <div className="px-5 pt-5">
      <h1 className="font-display text-xl font-semibold">Settings</h1>

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
                  ? "flex-1 rounded-full bg-primary text-primary-foreground py-2 text-sm font-semibold capitalize text-cream"
                  : "flex-1 rounded-full border border-indigo/15 py-2 text-sm font-semibold capitalize text-indigo/60"
              }
            >
              {lang}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold">
          Controls the wording used across the app.
        </p>
      </section>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white p-4 text-sm font-semibold text-pepper shadow-card disabled:opacity-60"
      >
        <LogOut size={16} /> {loggingOut ? "Logging out…" : "Log out"}
      </button>

      <section className="mt-4 flex items-start gap-2 rounded-card bg-indigo/5 p-4 text-xs text-indigo/60">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>
          Your data syncs with your SabiMarket account. Log in on another
          device to see the same transactions, inventory and market data.
        </p>
      </section>
    </div>
  );
}
