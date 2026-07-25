"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useSabiMarketStore } from "@/lib/store";

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Header() {
  const language = useSabiMarketStore((s) => s.language);
  const setLanguage = useSabiMarketStore((s) => s.setLanguage);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-indigo/10 bg-cream/95 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-indigo/50">
          {timeGreeting()}
        </p>
        <h1 className="font-display text-xl font-semibold text-indigo">
          SabiMarket <span className="text-gold-dark">AI</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {!online && (
          <span className="flex items-center gap-1 rounded-full bg-pepper/10 px-2.5 py-1 text-[11px] font-semibold text-pepper">
            <WifiOff size={13} /> Offline
          </span>
        )}
        <button
          onClick={() => setLanguage(language === "pidgin" ? "english" : "pidgin")}
          className="rounded-full border border-indigo/15 bg-white px-3 py-1.5 text-xs font-semibold text-indigo"
        >
          {language === "pidgin" ? "Pidgin" : "English"}
        </button>
      </div>
    </header>
  );
}
