"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Plus, Search } from "lucide-react";
import Button from "@/components/atoms/Button";
import { Input } from "@/components/ui/input";
import { AppDialog } from "@/components/molecules/Dialog";
import PriceCard from "@/components/molecules/PriceCard";
import { useGetMarketPrices } from "@/features/market/hooks/useGetMarketPrices";
import { useGetMarketInsights } from "@/features/market/hooks/useGetMarketInsights";
import { useCreateMarketPrice } from "@/features/market/hooks/useCreateMarketPrice";
import { isAllInsightsResponse } from "@/features/market/types";
import { useRecommendMarket } from "@/features/ai/hooks/useRecommendMarket";
import { Sparkles } from "lucide-react";

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MarketPage() {
  const [marketFilter, setMarketFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [insightItem, setInsightItem] = useState("");
  const [insightInput, setInsightInput] = useState("");
  const [recommendAction, setRecommendAction] = useState<"buy" | "sell" | null>(
    null,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ marketName: "", itemName: "", price: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: prices,
    isLoading,
    isError,
    error,
  } = useGetMarketPrices({
    market: marketFilter || undefined,
    item: itemFilter || undefined,
  });

  const {
    data: insightData,
    isLoading: isInsightLoading,
    isError: isInsightError,
  } = useGetMarketInsights(insightItem || undefined);

  const createMutation = useCreateMarketPrice();

  const {
    data: recommendation,
    isLoading: isRecommendLoading,
    isError: isRecommendError,
  } = useRecommendMarket(
    insightItem || undefined,
    recommendAction ?? undefined,
  );

  const insights = insightData
    ? isAllInsightsResponse(insightData)
      ? insightData.items
      : [insightData]
    : [];

  const handleCreate = async () => {
    setFormError(null);
    const price = Number(form.price);
    if (!form.marketName.trim() || !form.itemName.trim() || !price) {
      setFormError("Fill in market, item and a valid price");
      return;
    }
    try {
      await createMutation.mutateAsync({
        marketName: form.marketName,
        itemName: form.itemName,
        price,
      });
      setDialogOpen(false);
      setForm({ marketName: "", itemName: "", price: "" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">
            Smart Market Intelligence
          </h1>
          <p className="mt-1 text-sm text-indigo/50">
            Crowdsourced prices from nearby markets — know where to buy and sell
            today.
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => setDialogOpen(true)}
          className="shrink-0"
        >
          Submit
        </Button>
      </div>

      {/* Insights lookup */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold text-indigo">Item insight</h2>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setInsightItem(insightInput.trim());
          }}
        >
          <Input
            value={insightInput}
            onChange={(e) => setInsightInput(e.target.value)}
            placeholder="e.g. Tomatoes"
          />
          <Button type="submit" icon={<Search size={16} />} variant="outline">
            Look up
          </Button>
        </form>

        {isInsightLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-indigo/50">
            <Loader2 size={14} className="animate-spin" /> Loading insight…
          </div>
        )}
        {isInsightError && (
          <p className="mt-3 text-sm text-red">
            Could not load insight for this item.
          </p>
        )}
        {!isInsightLoading && insightItem && insights.length > 0 && (
          <div className="mt-3 space-y-3">
            {insights.map((insight) => (
              <PriceCard key={insight.item} insight={insight} />
            ))}
          </div>
        )}

        {insightItem && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo/50">
              <Sparkles size={12} /> Ask AI: should I buy or sell {insightItem}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRecommendAction("buy")}
                className={`flex-1 rounded-full py-2 text-xs font-semibold capitalize ${recommendAction === "buy" ? "bg-secondary text-cream" : "bg-grey text-indigo/60 shadow-card"}`}
              >
                Buy
              </button>
              <button
                onClick={() => setRecommendAction("sell")}
                className={`flex-1 rounded-full py-2 text-xs font-semibold capitalize ${recommendAction === "sell" ? "bg-secondary text-cream" : "bg-grey text-indigo/60 shadow-card"}`}
              >
                Sell
              </button>
            </div>

            {isRecommendLoading && (
              <div className="mt-3 flex items-center gap-2 text-sm text-indigo/50">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            )}
            {isRecommendError && (
              <p className="mt-3 text-sm text-black text-center">
                Couldn&apos;t get a recommendation right now.
              </p>
            )}
            {recommendation && (
              <div className="relative mt-3 overflow-hidden rounded-xl bg-primary p-4 shadow-sm">
                {/* AI glint */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-blue-300/30 to-transparent" />

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-400/30">
                      <Sparkles className="size-3.5 text-blue-100" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {recommendation.action === "buy" ? "Buy" : "Sell"} at{" "}
                        {recommendation.recommended_market}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-blue-50">
                    {recommendation.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters + price list */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-indigo">Submitted prices</h2>
        <div className="mt-2 flex gap-2">
          <Input
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            placeholder="Filter by item"
          />
          <Input
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            placeholder="Filter by market"
          />
        </div>

        <div className="mt-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-card bg-white p-8 text-sm text-indigo/50 shadow-card">
              <Loader2 size={16} className="animate-spin" />
              Loading prices…
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-card bg-red/10 p-4 text-sm text-red">
              <AlertCircle size={16} />
              {error instanceof Error
                ? error.message
                : "Failed to load market prices."}
            </div>
          ) : !prices || prices.length === 0 ? (
            <p className="rounded-card bg-white p-4 text-center text-sm text-indigo/50 shadow-card">
              No prices submitted yet.
            </p>
          ) : (
            prices.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-card"
              >
                <div>
                  <p className="text-sm font-semibold text-indigo">
                    {p.item_name}
                  </p>
                  <p className="text-xs text-indigo/50">
                    {p.market_name}
                    {p.created_at ? ` · ${formatDate(p.created_at)}` : ""}
                  </p>
                </div>
                <p className="font-mono text-sm font-bold text-indigo">
                  {formatNaira(p.price ?? 0)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <AppDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Submit a price"
        description="Share what you're seeing at your market to help other traders."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting…" : "Submit"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle size={14} />
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Item</label>
            <Input
              value={form.itemName}
              onChange={(e) =>
                setForm((f) => ({ ...f, itemName: e.target.value }))
              }
              placeholder="e.g. Orange"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Market
            </label>
            <Input
              value={form.marketName}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketName: e.target.value }))
              }
              placeholder="e.g. Mile 12"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Price (₦)
            </label>
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
