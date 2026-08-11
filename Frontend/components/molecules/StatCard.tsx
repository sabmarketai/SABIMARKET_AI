import { ReactNode } from "react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "gold" | "cassava" | "pepper" | "indigo";
  icon?: ReactNode;
  sub?: string;
  compact?: boolean;
}

const TONE_MAP: Record<NonNullable<StatCardProps["tone"]>, string> = {
  gold: "bg-amber text-secondary-foreground",
  cassava: "bg-secondary text-secondary-foreground",
  pepper: "bg-red text-primary-foreground",
  indigo: "bg-secondary text-secondary-foreground",
};

export default function StatCard({
  label,
  value,
  tone = "indigo",
  icon,
  sub,
  compact = false,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg bg-grey text-secondary-foreground shadow-card",
        compact ? "p-3" : "p-4",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo/50">
          {label}
        </p>
        {icon && (
          <span className={clsx("rounded-full p-1.5", TONE_MAP[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p
        className={clsx(
          "mt-2 font-mono font-bold",
          compact ? "text-lg" : "text-2xl",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-indigo/60">{sub}</p>}
    </div>
  );
}
