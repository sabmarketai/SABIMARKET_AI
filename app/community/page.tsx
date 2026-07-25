import CommunityPostCard from "@/components/CommunityPostCard";
import { seedCommunityPosts } from "@/lib/mockData";
import { Plus } from "lucide-react";

// FILLER DATA — replace seedCommunityPosts with a real-time feed (Firestore
// listener or websocket) once the backend exists.
export default function CommunityPage() {
  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-indigo">Community</h1>
          <p className="mt-1 text-sm text-indigo/50">
            Alerts, suppliers and buyers from your market associations.
          </p>
        </div>
        <button
          aria-label="New post"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-indigo shadow-card"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {seedCommunityPosts.map((p) => (
          <CommunityPostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
