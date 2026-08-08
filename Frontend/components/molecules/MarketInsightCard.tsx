import { TrendingUp, Info } from "lucide-react";

interface MarketInsightCardProps {
  type: "info" | "warning" | "opportunity" | string;
  message: string;
}

export default function MarketInsightCard({
  type,
  message,
}: MarketInsightCardProps) {
  // "No market insights available" isn't worth a card — skip it
  if (type === "info") return null;

  const isOpportunity = type === "opportunity";

  return (
    <div className="rounded-lg bg-amber/15 p-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-amber">
          {isOpportunity ? <TrendingUp size={16} /> : <Info size={16} />}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber">
            Market insight
          </p>
          <p className="mt-1 text-sm text-secondary-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
