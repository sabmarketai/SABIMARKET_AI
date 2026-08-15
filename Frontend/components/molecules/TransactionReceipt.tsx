import { Transaction } from "@/features/transactions/types";
import { ArrowDownLeft, ArrowUpRight, CloudOff, Receipt } from "lucide-react";
import clsx from "clsx";

function formatNaira(amount: number, currency: string): string {
  const symbol = currency === "NGN" ? "₦" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-NG")}`;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function describeItems(txn: Transaction): string {
  const items = txn.transaction_items ?? [];
  if (items.length === 0) return "";
  if (items.length === 1) {
    const item = items[0];
    return `${item.quantity ?? ""} ${item.unit ?? ""} ${item.item_name ?? ""}`.trim();
  }
  return `${items.length} items`;
}

export default function TransactionReceipt({ txn }: { txn: Transaction }) {
  const isSell = txn.transaction_type === "sell";
  const isBuy = txn.transaction_type === "buy";
  const amount = txn.total_amount ?? 0;
  const currency = txn.currency ?? "NGN";
  const date = txn.transaction_date ?? txn.created_at ?? new Date().toISOString();

  return (
    <div className="rounded-xl border border-indigo/10 border-grey text-foreground px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={clsx(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              isSell
                ? "bg-cassava/10 text-cassava"
                : isBuy
                  ? "bg-clay/10 text-clay"
                  : "bg-indigo/10 text-indigo",
            )}
          >
            {isSell ? (
              <ArrowUpRight size={16} />
            ) : isBuy ? (
              <ArrowDownLeft size={16} />
            ) : (
              <Receipt size={16} />
            )}
          </span>

          <div>
            <p className="font-semibold text-indigo capitalize">
              {(txn.transaction_type ?? "transaction").replace("_", " ")}{" "}
              {describeItems(txn)}
            </p>
            <p className="text-xs text-indigo/50">{timeAgo(date)}</p>
            {txn.note && (
              <p className="mt-1 text-xs italic text-indigo/40">
                &ldquo;{txn.note}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <p
            className={clsx(
              "font-mono text-sm font-bold",
              isSell ? "text-cassava" : isBuy ? "text-clay" : "text-indigo",
            )}
          >
            {isSell ? "+" : isBuy ? "-" : ""}
            {formatNaira(amount, currency)}
          </p>
          {txn.synced === false && (
            <span className="mt-1 flex items-center gap-1 text-[10px] text-indigo/40">
              <CloudOff size={11} /> pending sync
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
