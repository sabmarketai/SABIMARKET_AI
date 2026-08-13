import { ItemInsight } from "@/features/market/types";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import clsx from "clsx";

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

const TREND_META = {
  up: { icon: TrendingUp, tone: "text-secondary-foreground bg-secondary", label: "rising" },
  down: { icon: TrendingDown, tone: "text-secondary-foreground bg-red", label: "falling" },
  stable: { icon: Minus, tone: "text-secondary-foreground bg-amber", label: "steady" },
} as const;

export default function PriceCard({ insight }: { insight: ItemInsight }) {
  if (insight.priceCount === 0 || insight.latestPrice === undefined) {
    return (
      <div className="rounded-lg bg-grey text-primary-foreground p-4 shadow-card">
        <p className="font-display text-base font-semibold text-indigo">
          {insight.item}
        </p>
        <p className="mt-1 text-xs text-indigo/50">
          {insight.message ?? "No price data available for this item"}
        </p>
      </div>
    );
  }

  const trend = insight.trend ?? "stable";
  const meta = TREND_META[trend];
  const Icon = meta.icon;

  return (
    <div className="rounded-lg bg-grey text-primary-foreground p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-base font-semibold text-indigo">
            {insight.item}
          </p>
          <p className="text-xs text-indigo/50">{insight.latestMarket}</p>
        </div>
        <span
          className={clsx(
            "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
            meta.tone
          )}
        >
          <Icon size={12} />
          {insight.percentChange != null
            ? `${insight.percentChange > 0 ? "+" : ""}${insight.percentChange}%`
            : meta.label}
        </span>
      </div>
      <p className="mt-3 font-mono text-xl font-bold text-indigo">
        {formatNaira(insight.latestPrice)}
      </p>
      {insight.lowestMarket && insight.highestMarket && (
        <p className="mt-2 rounded-lg bg-gold/10 px-2.5 py-1.5 text-xs text-indigo/70">
          Cheapest at {insight.lowestMarket.market} ({formatNaira(insight.lowestMarket.price)}) ·
          {" "}Highest at {insight.highestMarket.market} ({formatNaira(insight.highestMarket.price)})
        </p>
      )}
    </div>
  );
}
