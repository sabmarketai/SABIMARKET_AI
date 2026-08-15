"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import Button from "@/components/atoms/Button";
import { AppDialog } from "@/components/molecules/Dialog";
import { Input } from "@/components/ui/input";
import CommunityPostCard from "@/components/molecules/CommunityPostCard";
import { useGetCommunityPosts } from "@/features/community/hooks/useGetCommunityPosts";
import { useCreateCommunityPost } from "@/features/community/hooks/useCreateCommunityPost";
import { useUpdateCommunityPost } from "@/features/community/hooks/useUpdateCommunityPost";
import { useDeleteCommunityPost } from "@/features/community/hooks/useDeleteCommunityPost";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import type { CommunityPost } from "@/features/community/types";

export default function CommunityPage() {
  const { data: posts, isLoading, isError, error } = useGetCommunityPosts();
  const currentUserId = useCurrentUserId();

  const createMutation = useCreateCommunityPost();
  const updateMutation = useUpdateCommunityPost();
  const deleteMutation = useDeleteCommunityPost();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommunityPost | null>(null);

  const isEditing = editingPost !== null;

  const openCreate = () => {
    setEditingPost(null);
    setForm({ title: "", content: "" });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (post: CommunityPost) => {
    setEditingPost(post);
    setForm({ title: post.title ?? "", content: post.content ?? "" });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Title and content are required");
      return;
    }
    try {
      if (isEditing && editingPost) {
        await updateMutation.mutateAsync({ id: editingPost.id, payload: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold ">Community</h1>
          <p className="mt-1 text-sm text-indigo/50 max-w-70">
            Alerts, suppliers and buyers from your market associations.
          </p>
        </div>
        <Button
          aria-label="New post"
          onClick={openCreate}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-indigo shadow-card"
        >
          <Plus size={20} color="white" />
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-card bg-white p-8 text-sm text-indigo/50 shadow-card">
            <Loader2 size={16} className="animate-spin" />
            Loading community posts…
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-card bg-red/10 p-4 text-sm text-red">
            <AlertCircle size={16} />
            {error instanceof Error
              ? error.message
              : "Failed to load community posts."}
          </div>
        ) : !posts || posts.length === 0 ? (
          <p className="rounded-card bg-white p-4 text-center text-sm text-indigo/50 shadow-card">
            No posts yet. Be the first to share something with your market.
          </p>
        ) : (
          posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              isOwner={!!currentUserId && post.user_id === currentUserId}
              onEdit={() => openEdit(post)}
              onDelete={() => setDeleteTarget(post)}
            />
          ))
        )}
      </div>

      <AppDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={isEditing ? "Edit post" : "New post"}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : isEditing ? "Save changes" : "Post"}
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
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Best price for tomatoes today?"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full rounded-lg border border-input bg-transparent p-2 text-sm"
              rows={4}
              placeholder="Share the details..."
            />
          </div>
        </div>
      </AppDialog>

      <AppDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete post"
        description="Are you sure you want to delete this post? This can't be undone."
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
