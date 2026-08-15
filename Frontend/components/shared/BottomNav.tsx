"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Package, Users2, Settings, Mic, Receipt } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/market", label: "Market", icon: LineChart },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/community", label: "Community", icon: Users2 },
  { href: "/transactions", label: "Transactions", icon: Receipt},
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const recordActive = pathname === "/record";

  return (
    <>
      {/* Floating Record button */}
      <Link
        href="/record"
        aria-label="Record — log a sale or purchase by voice"
        className={clsx(
          "safe-bottom-offset fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-card transition-transform active:scale-95",
          recordActive
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <Mic size={24} className="text-indigo" strokeWidth={2.4} />
      </Link>

      <nav
        aria-label="Primary"
        className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-indigo/10 bg-cream/95 backdrop-blur"
      >
        <ul className="flex items-end justify-between px-2 pb-2 pt-2">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href} className="flex-1 text-center">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5"
                >
                  <Icon
                    size={22}
                    strokeWidth={2.2}
                    className={active ? "text-primary" : "text-foreground"}
                  />
                  <span
                    className={clsx(
                      "text-[11px] font-medium",
                      active ? "text-primary" : "text-foreground",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
