import { Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, CloudOff } from "lucide-react";
import clsx from "clsx";

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
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

export default function TransactionReceipt({ txn }: { txn: Transaction }) {
  const isSell = txn.kind === "sell";

  return (
    <div className="rounded-xl border border-indigo/10 border-grey text-foreground px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={clsx(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              isSell ? "bg-cassava/10 text-cassava" : "bg-clay/10 text-clay",
            )}
          >
            {isSell ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
          </span>

          <div>
            <p className="font-semibold text-indigo">
              {isSell ? "Sold" : "Bought"} {txn.quantity} {txn.unit} {txn.item}
            </p>
            <p className="text-xs text-indigo/50">
              {txn.market} · {timeAgo(txn.createdAt)}
            </p>
            {txn.transcript && (
              <p className="mt-1 text-xs italic text-indigo/40">
                &ldquo;{txn.transcript}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <p
            className={clsx(
              "font-mono text-sm font-bold",
              isSell ? "text-cassava" : "text-clay",
            )}
          >
            {isSell ? "+" : "-"}
            {formatNaira(txn.amount)}
          </p>
          {!txn.synced && (
            <span className="mt-1 flex items-center gap-1 text-[10px] text-indigo/40">
              <CloudOff size={11} /> pending sync
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
