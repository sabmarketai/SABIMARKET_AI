import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface AlertBannerProps {
  count: number;
  message: string;
}

export default function AlertBanner({ count, message }: AlertBannerProps) {
  if (count === 0) return null;

  return (
    <Link
      href="/inventory?filter=low-stock"
      className="flex items-center justify-between rounded-lg bg-red/10 px-4 py-3 text-red"
    >
      <span className="flex items-center gap-2">
        <AlertTriangle size={16} />
        <span className="text-sm font-medium">{message}</span>
      </span>
      <ChevronRight size={16} />
    </Link>
  );
}
