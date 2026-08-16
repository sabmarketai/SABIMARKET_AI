"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import TransactionReceipt from "@/components/molecules/TransactionReceipt";
import { AppDialog } from "@/components/molecules/Dialog";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { SelectItem } from "@/components/ui/select";
import { useGetTransactions } from "@/features/transactions/hooks/useGetTransactions";
import { useDeleteTransaction } from "@/features/transactions/hooks/useDeleteTransaction";
import { useUpdateTransaction } from "@/features/transactions/hooks/useUpdateTransaction";
import { useSyncTransaction } from "@/features/transactions/hooks/useSyncTransaction";
import { useCreateTransaction } from "@/features/transactions/hooks/useCreateTransaction";
import { useSearchParam } from "@/hooks/useSearchParams";
import type {
  Transaction,
  TransactionType,
  CreateTransactionPayload,
} from "@/features/transactions/types";

type Filter = "all" | "buy" | "sell";

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "sell", label: "Sale" },
  { value: "buy", label: "Purchase" },
  { value: "debt_owed", label: "Debt owed to me" },
  { value: "debt_paid", label: "Debt paid" },
  { value: "expense", label: "Expense" },
  { value: "waste", label: "Waste / loss" },
];

type ItemFormRow = {
  itemName: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

const emptyItemRow: ItemFormRow = {
  itemName: "",
  quantity: "",
  unit: "",
  unitPrice: "",
};

const emptyLogForm = {
  transactionType: "sell" as TransactionType,
  note: "",
  profit: "",
  items: [emptyItemRow],
};

export default function TransactionsPage() {
  const {
    data: transactions,
    isLoading,
    isError,
    error,
  } = useGetTransactions();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();
  const syncMutation = useSyncTransaction();
  const createMutation = useCreateTransaction();

  const { getParam, setParam, removeParam } = useSearchParam();
  const isLogOpen = getParam("logTransaction") === "true";

  const [filter, setFilter] = useState<Filter>("all");
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [note, setNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [logForm, setLogForm] = useState(emptyLogForm);
  const [logError, setLogError] = useState<string | null>(null);

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

  const openLogDialog = () => {
    setLogForm(emptyLogForm);
    setLogError(null);
    setParam("logTransaction", "true");
  };

  const closeLogDialog = () => {
    removeParam("logTransaction");
    setLogForm(emptyLogForm);
    setLogError(null);
  };

  const updateItemRow = (index: number, patch: Partial<ItemFormRow>) => {
    setLogForm((f) => ({
      ...f,
      items: f.items.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    }));
  };

  const addItemRow = () => {
    setLogForm((f) => ({ ...f, items: [...f.items, emptyItemRow] }));
  };

  const removeItemRow = (index: number) => {
    setLogForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  };

  const computedTotal = logForm.items.reduce((sum, row) => {
    const qty = Number(row.quantity) || 0;
    const price = Number(row.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const isLogFormValid =
    logForm.items.length > 0 &&
    logForm.items.every(
      (row) =>
        row.itemName.trim().length > 0 &&
        row.quantity.trim().length > 0 &&
        row.unit.trim().length > 0 &&
        row.unitPrice.trim().length > 0,
    );

  const handleLogTransaction = async () => {
    setLogError(null);

    const payload: CreateTransactionPayload = {
      transactionType: logForm.transactionType,
      totalAmount: computedTotal,
      currency: "NGN",
      note: logForm.note.trim() ? logForm.note.trim() : undefined,
      ...(logForm.transactionType === "sell" && logForm.profit.trim()
        ? { profit: Number(logForm.profit) || 0 }
        : {}),
      items: logForm.items.map((row) => ({
        itemName: row.itemName,
        quantity: Number(row.quantity) || 0,
        unit: row.unit,
        unitPrice: Number(row.unitPrice) || 0,
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      closeLogDialog();
    } catch (err) {
      setLogError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-indigo hidden md:block">
          All transactions
        </h1>
        <h1 className="font-display text-xl font-semibold text-indigo md:hidden">
          Transactions
        </h1>
        
        <Button
          icon={<Plus size={16} />}
          onClick={openLogDialog}
          className="px-4 py-2.5 text-sm"
        >
          Log transaction
        </Button>
      </div>

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

      {/* Log transaction dialog */}
      <AppDialog
        open={isLogOpen}
        onClose={closeLogDialog}
        title="Log transaction"
        description="Record a sale, purchase, expense, or other activity."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeLogDialog}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogTransaction}
              disabled={!isLogFormValid || createMutation.isPending}
            >
              {createMutation.isPending ? "Saving…" : "Log transaction"}
            </Button>
          </div>
        }
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {logError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle size={14} />
              {logError}
            </div>
          )}

          <Select
            label="Type"
            value={logForm.transactionType}
            onValueChange={(value) =>
              setLogForm((f) => ({
                ...f,
                transactionType: value as TransactionType,
              }))
            }
          >
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </Select>

          <div className="space-y-3">
            {logForm.items.map((row, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-indigo/10 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-indigo/50">
                    Item {index + 1}
                  </p>
                  {logForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      aria-label={`Remove item ${index + 1}`}
                      className="rounded-md p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <Input
                  label="Item name"
                  value={row.itemName}
                  onChange={(e) =>
                    updateItemRow(index, { itemName: e.target.value })
                  }
                  placeholder="e.g. Rice (50kg bag)"
                />

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Quantity"
                    type="number"
                    min={0}
                    value={row.quantity}
                    onChange={(e) =>
                      updateItemRow(index, { quantity: e.target.value })
                    }
                    placeholder="0"
                  />
                  <Input
                    label="Unit"
                    value={row.unit}
                    onChange={(e) =>
                      updateItemRow(index, { unit: e.target.value })
                    }
                    placeholder="pcs, kg…"
                  />
                  <Input
                    label="Unit price (₦)"
                    type="number"
                    min={0}
                    value={row.unitPrice}
                    onChange={(e) =>
                      updateItemRow(index, { unitPrice: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItemRow}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo/20 py-2 text-xs font-semibold text-indigo/60 hover:bg-muted"
            >
              <Plus size={14} /> Add another item
            </button>
          </div>

          {logForm.transactionType === "sell" && (
            <Input
              label="Profit (₦, optional)"
              type="number"
              min={0}
              value={logForm.profit}
              onChange={(e) =>
                setLogForm((f) => ({ ...f, profit: e.target.value }))
              }
              placeholder="0.00"
            />
          )}

          <Input
            label="Note (optional)"
            value={logForm.note}
            onChange={(e) =>
              setLogForm((f) => ({ ...f, note: e.target.value }))
            }
            placeholder="Add a note"
          />

          <div className="flex items-center justify-between rounded-lg bg-grey px-3 py-2">
            <span className="text-xs font-semibold text-indigo/60">Total</span>
            <span className="font-mono text-sm font-bold text-secondary-foreground">
              ₦{computedTotal.toLocaleString("en-NG")}
            </span>
          </div>
        </div>
      </AppDialog>

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
