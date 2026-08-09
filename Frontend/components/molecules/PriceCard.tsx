import { MarketPrice } from "@/lib/types";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import clsx from "clsx";

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

const TREND_META = {
  up: { icon: TrendingUp, tone: "text-secondary-foreground bg-secondary", label: "rising" },
  down: { icon: TrendingDown, tone: "text-secondary-foreground bg-red", label: "falling" },
  flat: { icon: Minus, tone: "text-secondary-foreground bg-amber", label: "steady" },
} as const;

export default function PriceCard({ price }: { price: MarketPrice }) {
  const meta = TREND_META[price.trend];
  const Icon = meta.icon;
  return (
    <div className="rounded-lg bg-grey text-primary-foreground p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-base font-semibold text-indigo">
            {price.item}
          </p>
          <p className="text-xs text-indigo/50">{price.market}</p>
        </div>
        <span
          className={clsx(
            "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
            meta.tone
          )}
        >
          <Icon size={12} />
          {price.changePercent > 0 ? `${price.changePercent}%` : meta.label}
        </span>
      </div>
      <p className="mt-3 font-mono text-xl font-bold text-indigo">
        {formatNaira(price.pricePerUnit)}
        <span className="ml-1 text-xs font-normal text-indigo/40">/ {price.unit}</span>
      </p>
      {price.note && (
        <p className="mt-2 rounded-lg bg-gold/10 px-2.5 py-1.5 text-xs text-indigo/70">
          💬 {price.note}
        </p>
      )}
    </div>
  );
}
