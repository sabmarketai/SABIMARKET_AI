"use client";

import * as React from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import Button from "@/components/atoms/Button";
import { AppDialog } from "@/components/molecules/Dialog";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/molecules/DataTable";

// ---------- Types ----------

type InventoryItem = {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  average_cost: number;
  updated_at: string; // ISO date
};

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

// ---------- Test data (stand-in for backend) ----------

const initialItems: InventoryItem[] = [
  {
    id: 1,
    item_name: "Macbook Pro",
    quantity: 12,
    unit: "pcs",
    average_cost: 850000,
    updated_at: "2026-07-20T10:00:00Z",
  },
  {
    id: 2,
    item_name: "iPhone 14 Pro",
    quantity: 30,
    unit: "pcs",
    average_cost: 620000,
    updated_at: "2026-07-22T10:00:00Z",
  },
  {
    id: 3,
    item_name: "Zoom75",
    quantity: 8,
    unit: "pcs",
    average_cost: 145000,
    updated_at: "2026-07-24T10:00:00Z",
  },
  {
    id: 4,
    item_name: "Airpods Pro",
    quantity: 25,
    unit: "pcs",
    average_cost: 95000,
    updated_at: "2026-07-26T10:00:00Z",
  },
  {
    id: 5,
    item_name: "Samsung Galaxy Fold",
    quantity: 6,
    unit: "pcs",
    average_cost: 980000,
    updated_at: "2026-07-18T10:00:00Z",
  },
  {
    id: 6,
    item_name: "Samsung Odyssey",
    quantity: 4,
    unit: "pcs",
    average_cost: 720000,
    updated_at: "2026-07-19T10:00:00Z",
  },
  {
    id: 7,
    item_name: "Dell XPS 15",
    quantity: 10,
    unit: "pcs",
    average_cost: 780000,
    updated_at: "2026-07-15T10:00:00Z",
  },
  {
    id: 8,
    item_name: "Logitech MX Master 3S",
    quantity: 40,
    unit: "pcs",
    average_cost: 45000,
    updated_at: "2026-07-14T10:00:00Z",
  },
  {
    id: 9,
    item_name: "Keychron K8",
    quantity: 15,
    unit: "pcs",
    average_cost: 62000,
    updated_at: "2026-07-13T10:00:00Z",
  },
  {
    id: 10,
    item_name: "Sony WH-1000XM5",
    quantity: 18,
    unit: "pcs",
    average_cost: 210000,
    updated_at: "2026-07-12T10:00:00Z",
  },
  {
    id: 11,
    item_name: "iPad Air",
    quantity: 22,
    unit: "pcs",
    average_cost: 480000,
    updated_at: "2026-07-11T10:00:00Z",
  },
  {
    id: 12,
    item_name: 'LG UltraFine 27"',
    quantity: 5,
    unit: "pcs",
    average_cost: 390000,
    updated_at: "2026-07-10T10:00:00Z",
  },
  {
    id: 13,
    item_name: "Anker 733 Power Bank",
    quantity: 60,
    unit: "pcs",
    average_cost: 38000,
    updated_at: "2026-07-09T10:00:00Z",
  },
  {
    id: 14,
    item_name: "Razer DeathAdder V3",
    quantity: 35,
    unit: "pcs",
    average_cost: 28000,
    updated_at: "2026-07-08T10:00:00Z",
  },
  {
    id: 15,
    item_name: "Google Pixel 9 Pro",
    quantity: 14,
    unit: "pcs",
    average_cost: 590000,
    updated_at: "2026-07-07T10:00:00Z",
  },
  {
    id: 16,
    item_name: "Bose QuietComfort Ultra",
    quantity: 9,
    unit: "pcs",
    average_cost: 260000,
    updated_at: "2026-07-06T10:00:00Z",
  },
  {
    id: 17,
    item_name: "Steam Deck OLED",
    quantity: 7,
    unit: "pcs",
    average_cost: 340000,
    updated_at: "2026-07-05T10:00:00Z",
  },
  {
    id: 18,
    item_name: "Kindle Paperwhite",
    quantity: 28,
    unit: "pcs",
    average_cost: 85000,
    updated_at: "2026-07-04T10:00:00Z",
  },
  {
    id: 19,
    item_name: "GoPro Hero 12",
    quantity: 11,
    unit: "pcs",
    average_cost: 310000,
    updated_at: "2026-07-03T10:00:00Z",
  },
  {
    id: 20,
    item_name: "DJI Mini 4 Pro",
    quantity: 3,
    unit: "pcs",
    average_cost: 650000,
    updated_at: "2026-07-02T10:00:00Z",
  },
];
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

// ---------- Component ----------

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>(initialItems);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<ItemFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = React.useState<InventoryItem | null>(
    null,
  );
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page]);

  const isEditing = editingId !== null;

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      item_name: item.item_name,
      quantity: String(item.quantity),
      unit: item.unit,
      average_cost: String(item.average_cost),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    const quantity = Number(form.quantity) || 0;
    const average_cost = Number(form.average_cost) || 0;
    const now = new Date().toISOString();

    if (isEditing) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                item_name: form.item_name,
                quantity,
                unit: form.unit,
                average_cost,
                updated_at: now,
              }
            : item,
        ),
      );
    } else {
      const newItem: InventoryItem = {
        id: Date.now(),
        item_name: form.item_name,
        quantity,
        unit: form.unit,
        average_cost,
        updated_at: now,
      };
      setItems((prev) => [newItem, ...prev]);
    }

    closeDialog();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const columns: Column<InventoryItem>[] = [
    { header: "Name", accessor: "item_name" },
    {
      header: "Quantity",
      accessor: "quantity",
      render: (value, row) => `${value} ${row.unit}`,
    },
    {
      header: "Avg. Cost",
      accessor: "average_cost",
      render: (value) => currency(value as number),
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

      <DataTable
        columns={columns}
        data={paginatedItems}
        total={items.length}
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
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid}>
              {isEditing ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
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
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <></>
      </AppDialog>
    </div>
  );
}
