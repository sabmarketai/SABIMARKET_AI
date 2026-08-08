"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import Button from "@/components/atoms/Button";
import { AppDialog } from "@/components/molecules/Dialog";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/molecules/DataTable";
import { useGetInventory } from "@/features/inventory/hooks/useGetInventory";
import { useDeleteInventory } from "@/features/inventory/hooks/useDeleteInventory";
import type {
  InventoryItem,
  CreateInventoryItemPayload,
} from "@/features/inventory/types";
import { useUpdateInventory } from "@/features/inventory/hooks/useUpdateInventoryItems";
import { useCreateInventory } from "@/features/inventory/hooks/useCreateInventoryItems";

// ---------- Types ----------

type ItemFormState = {
  item_name: string;
  quantity: string;
  unit: string;
  average_cost: string;
};

const emptyForm: ItemFormState = {
  item_name: "",
  quantity: "",
  unit: "",
  average_cost: "",
};

// ---------- Helpers ----------

const currency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const toPayload = (form: ItemFormState): CreateInventoryItemPayload => ({
  itemName: form.item_name,
  quantity: Number(form.quantity) || 0,
  unit: form.unit,
  averageCost: Number(form.average_cost) || 0,
});

// ---------- Component ----------

export default function InventoryPage() {
  const { data: items, isLoading, isError, error } = useGetInventory();
  console.log("items shape:", items);

  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const deleteMutation = useDeleteInventory();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(
    null,
  );
  const [form, setForm] = React.useState<ItemFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = React.useState<InventoryItem | null>(
    null,
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const isEditing = editingItem !== null;

  const paginatedItems = React.useMemo(() => {
    if (!items) return [];
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page]);

  const openAddDialog = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      item_name: item.item_name,
      quantity: String(item.quantity),
      unit: item.unit,
      average_cost: String(item.average_cost),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSave = async () => {
    setFormError(null);
    const payload = toPayload(form);

    try {
      if (isEditing && editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeDialog();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // keep the dialog open so the user can retry / see the failure
    }
  };

  const columns: Column<InventoryItem>[] = [
    { header: "Name", accessor: "item_name" },
    {
      header: "Quantity",
      accessor: "quantity",
      render: (value, row) => `${Number(value)} ${row.unit}`,
    },
    {
      header: "Avg. Cost",
      accessor: "average_cost",
      render: (value) => currency(Number(value)),
    },
    {
      header: "Updated",
      accessor: "updated_at",
      render: (value) => formatDate(value as string),
    },
  ];

  const isFormValid =
    form.item_name.trim().length > 0 &&
    form.quantity.trim().length > 0 &&
    form.unit.trim().length > 0;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your products
          </p>
        </div>
        <Button icon={<Plus size={18} />} onClick={openAddDialog}>
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-md border border-border p-10 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Loading inventory…
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle size={16} />
          {error instanceof Error
            ? error.message
            : "Failed to load inventory. Please try again."}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={paginatedItems}
          total={items?.length ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No products in inventory yet"
          actions={(row) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => openEditDialog(row)}
                aria-label={`Edit ${row.item_name}`}
                className="rounded-md p-2 text-foreground hover:bg-muted"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(row)}
                aria-label={`Delete ${row.item_name}`}
                className="rounded-md p-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        />
      )}

      {/* Add / Edit dialog */}
      <AppDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={isEditing ? "Edit Product" : "Add Product"}
        description={
          isEditing
            ? "Update the details for this product."
            : "Add a new product to your inventory."
        }
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid || isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </span>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
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
            <label className="text-sm font-medium text-foreground">
              Product name
            </label>
            <Input
              value={form.item_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, item_name: e.target.value }))
              }
              placeholder="e.g. Macbook Pro"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Quantity
              </label>
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Unit
              </label>
              <Input
                value={form.unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value }))
                }
                placeholder="pcs, kg, box..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Average cost (₦)
            </label>
            <Input
              type="number"
              min={0}
              value={form.average_cost}
              onChange={(e) =>
                setForm((f) => ({ ...f, average_cost: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
        </div>
      </AppDialog>

      {/* Delete confirmation dialog */}
      <AppDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.item_name}"? This can't be undone.`
            : undefined
        }
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
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Deleting…
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        }
      >
        <></>
      </AppDialog>
    </div>
  );
}
