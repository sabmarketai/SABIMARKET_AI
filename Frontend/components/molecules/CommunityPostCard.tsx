import { CommunityPost } from "@/features/community/types";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

interface CommunityPostCardProps {
  post: CommunityPost;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CommunityPostCard({
  post,
  isOwner,
  onEdit,
  onDelete,
}: CommunityPostCardProps) {
  return (
    <div className="rounded-lg bg-grey text-primary-foreground p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo">
            {post.users?.full_name ?? "Trader"}
          </p>
          <p className="text-[11px] text-indigo/50">
            {post.users?.market_location ?? ""}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-foreground px-2 py-1 text-[11px] font-semibold text-primary-foreground">
          <MessageCircle size={12} /> Post
        </span>
      </div>
      {post.title && (
        <p className="text-sm font-semibold text-indigo/90">{post.title}</p>
      )}
      <p className="mt-1 text-sm leading-relaxed text-indigo/80">{post.content}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-indigo/40">
          {post.created_at ? timeAgo(post.created_at) : ""}
        </p>
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              aria-label="Edit post"
              className="text-indigo/50 hover:text-indigo"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              aria-label="Delete post"
              className="text-destructive/70 hover:text-destructive"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
