"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Mic, Users2, Settings } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home, isCenter: false },
  { href: "/market", label: "Market", icon: LineChart, isCenter: false },
  { href: "/record", label: "Record", icon: Mic, isCenter: true },
  { href: "/community", label: "Community", icon: Users2, isCenter: false },
  { href: "/settings", label: "Settings", icon: Settings, isCenter: false },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-indigo/10 bg-cream/95 backdrop-blur"
    >
      <ul className="flex items-end justify-between px-2 pb-2 pt-2">
        {TABS.map(({ href, label, icon: Icon, isCenter }) => {
          const active = pathname === href;
          if (isCenter) {
            return (
              <li
                key={href}
                className="flex-1 -translate-y-4  rounded-full text-center"
              >
                <Link
                  href={href}
                  aria-label={`${label} — log a sale or purchase by voice`}
                  className={clsx(
                    "mx-auto flex h-16 w-16 flex-col items-center justify-center rounded-full shadow-card transition-transform active:scale-95",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon size={26} className="text-indigo" strokeWidth={2.4} />
                </Link>
                <span className="mt-1 block text-[11px] font-semibold text-indigo">
                  {label}
                </span>
              </li>
            );
          }
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
                    active ? "text-primary" : "foreground",
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
  );
}
