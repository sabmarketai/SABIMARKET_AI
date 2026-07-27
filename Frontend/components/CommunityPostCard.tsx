import { CommunityPost } from "@/lib/types";
import { AlertTriangle, Handshake, ShoppingBasket, MessageCircle } from "lucide-react";
import clsx from "clsx";

const TYPE_META = {
  alert: { icon: AlertTriangle, tone: "bg-pepper/10 text-pepper", label: "Alert" },
  supplier: { icon: ShoppingBasket, tone: "bg-cassava/10 text-cassava", label: "Supplier" },
  buyer: { icon: Handshake, tone: "bg-gold/15 text-gold-dark", label: "Buyer" },
  general: { icon: MessageCircle, tone: "bg-indigo/10 text-indigo", label: "General" },
} as const;

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function CommunityPostCard({ post }: { post: CommunityPost }) {
  const meta = TYPE_META[post.type];
  const Icon = meta.icon;
  return (
    <div className="rounded-card bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo">{post.authorName}</p>
          <p className="text-[11px] text-indigo/50">{post.associationName}</p>
        </div>
        <span className={clsx("flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold", meta.tone)}>
          <Icon size={12} /> {meta.label}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-indigo/80">{post.message}</p>
      <p className="mt-2 text-[11px] text-indigo/40">{timeAgo(post.createdAt)}</p>
    </div>
  );
}
