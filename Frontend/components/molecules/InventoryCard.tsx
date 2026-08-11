import { Package } from "lucide-react";

interface InventoryCardProps {
  totalItems: number;
  totalQuantity: number;
  inventoryValue: number;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function InventoryCard({
  totalItems,
  totalQuantity,
  inventoryValue,
}: InventoryCardProps) {
  return (
    <div className="rounded-lg bg-grey p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo/50">
          Inventory
        </p>
        <span className="rounded-full bg-secondary p-1.5 text-secondary-foreground">
          <Package size={14} />
        </span>
      </div>

      <p className="mt-2 font-mono text-2xl font-bold text-secondary-foreground">
        {formatNaira(inventoryValue)}
      </p>
      <p className="text-xs text-indigo/60">estimated value</p>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-indigo/10 pt-3">
        <div>
          <p className="font-mono text-sm font-semibold text-secondary-foreground">
            {totalItems}
          </p>
          <p className="text-[11px] text-indigo/50">items tracked</p>
        </div>
        <div>
          <p className="font-mono text-sm font-semibold text-secondary-foreground">
            {totalQuantity}
          </p>
          <p className="text-[11px] text-indigo/50">total units</p>
        </div>
      </div>
    </div>
  );
}
