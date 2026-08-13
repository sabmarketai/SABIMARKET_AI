"use client";

import { useState } from "react";
import clsx from "clsx";
import { AlertCircle, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import TransactionReceipt from "@/components/molecules/TransactionReceipt";
import { AppDialog } from "@/components/molecules/Dialog";
import Button from "@/components/atoms/Button";
import { useGetTransactions } from "@/features/transactions/hooks/useGetTransactions";
import { useDeleteTransaction } from "@/features/transactions/hooks/useDeleteTransaction";
import { useUpdateTransaction } from "@/features/transactions/hooks/useUpdateTransaction";
import { useSyncTransaction } from "@/features/transactions/hooks/useSyncTransaction";
import type { Transaction } from "@/features/transactions/types";

type Filter = "all" | "buy" | "sell";

export default function TransactionsPage() {
  const { data: transactions, isLoading, isError, error } = useGetTransactions();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();
  const syncMutation = useSyncTransaction();

  const [filter, setFilter] = useState<Filter>("all");
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [note, setNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const filtered = (transactions ?? []).filter(
    (t) => filter === "all" || t.transaction_type === filter,
  );

  const openEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setNote(txn.note ?? "");
  };

  const saveNote = async () => {
    if (!editingTxn) return;
    await updateMutation.mutateAsync({ id: editingTxn.id, payload: { note } });
    setEditingTxn(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // keep dialog open so the user can retry
    }
  };

  return (
    <div className="px-5 pt-5">
      <h1 className="font-display text-xl font-semibold text-indigo">
        All transactions
      </h1>

      <div className="mt-4 flex gap-2">
        {(["all", "buy", "sell"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-full px-4 py-1.5 text-xs text-secondary-foreground font-semibold capitalize",
              filter === f
                ? "bg-secondary text-cream"
                : "bg-grey text-indigo/60 shadow-card",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-card bg-white p-8 text-sm text-indigo/50 shadow-card">
            <Loader2 size={16} className="animate-spin" />
            Loading transactions…
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-card bg-red/10 p-4 text-sm text-red">
            <AlertCircle size={16} />
            {error instanceof Error
              ? error.message
              : "Failed to load transactions. Please try again."}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-card bg-white p-4 text-center text-sm text-indigo/50 shadow-card">
            Nothing here yet.
          </p>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="relative group">
              <TransactionReceipt txn={t} />
              <div className="mt-1 flex justify-end gap-1">
                {t.synced === false && (
                  <button
                    onClick={() => syncMutation.mutate(t.id)}
                    disabled={syncMutation.isPending}
                    aria-label="Sync transaction"
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-indigo/50 hover:bg-muted"
                  >
                    <RefreshCw size={12} /> Sync
                  </button>
                )}
                <button
                  onClick={() => openEdit(t)}
                  aria-label="Edit note"
                  className="rounded-md p-1.5 text-indigo/50 hover:bg-muted"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  aria-label="Delete transaction"
                  className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AppDialog
        open={editingTxn !== null}
        onClose={() => setEditingTxn(null)}
        title="Edit note"
        description="Only the note can be edited after a transaction is created."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingTxn(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={saveNote} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-indigo/15 p-2 text-sm"
          rows={3}
          placeholder="Add a note"
        />
      </AppDialog>

      <AppDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete transaction"
        description="Are you sure you want to delete this transaction? This can't be undone."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        }
      >
        <></>
      </AppDialog>
    </div>
  );
}
