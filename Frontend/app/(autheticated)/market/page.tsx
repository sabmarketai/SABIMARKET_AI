import PriceCard from "@/components/molecules/PriceCard";
import { seedMarketPrices } from "@/lib/mockData";

// FILLER DATA — replace seedMarketPrices with a real fetch once the price
// aggregation backend exists. See README.md "Where the backend plugs in".
export default function MarketPage() {
  return (
    <div className="px-5 pt-5">
      <h1 className="font-display text-xl font-semibold text-foreground">Smart Market Intelligence</h1>
      <p className="mt-1 text-sm text-indigo/50">
        Crowdsourced prices from nearby markets — know where to buy and sell today.
      </p>
      <div className="mt-5 space-y-3">
        {seedMarketPrices.map((p) => (
          <PriceCard key={p.id} price={p} />
        ))}
      </div>
    </div>
  );
}
