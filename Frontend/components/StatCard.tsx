import { ReactNode } from "react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "gold" | "cassava" | "pepper" | "indigo";
  icon?: ReactNode;
  sub?: string;
}

const TONE_MAP: Record<NonNullable<StatCardProps["tone"]>, string> = {
  gold: "bg-amber text-secondary-foreground",
  cassava: "bg-secondary text-secodary-foreground",
  pepper: "bg-red text-primary-foreground",
  indigo: "bg-secondary text-secondary-foreground",
};

export default function StatCard({
  label,
  value,
  tone = "indigo",
  icon,
  sub,
}: StatCardProps) {
  return (
    <div className="rounded-lg bg-grey text-secondary-foreground p-4 shadow-card">
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
      <p className="mt-2 font-mono text-2xl font-bold ">{value}</p>
      {sub && <p className="mt-1 text-xs">{sub}</p>}
    </div>
  );
}
