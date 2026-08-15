"use client";

import { AlertCircle, Bell, BellOff, Check, Loader2 } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/atoms/Button";
import { useGetNotifications } from "@/features/notifications/hooks/useGetNotifications";
import { useMarkNotificationAsRead } from "@/features/notifications/hooks/useMarkNotificationAsRead";
import { useMarkAllNotificationsAsRead } from "@/features/notifications/hooks/useMarkAllNotificationsAsRead";

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const { data: notifications, isLoading, isError, error } = useGetNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length;

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-indigo">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? "Marking…" : "Mark all as read"}
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-2 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-card bg-white p-8 text-sm text-indigo/50 shadow-card">
            <Loader2 size={16} className="animate-spin" />
            Loading notifications…
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-card bg-red/10 p-4 text-sm text-red">
            <AlertCircle size={16} />
            {error instanceof Error
              ? error.message
              : "Failed to load notifications."}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card bg-white p-8 text-center text-sm text-indigo/50 shadow-card">
            <BellOff size={20} className="text-indigo/30" />
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={clsx(
                "flex items-start justify-between gap-3 rounded-lg p-4 shadow-card",
                n.is_read ? "bg-white" : "bg-amber/10",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={clsx(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    n.is_read ? "bg-grey text-indigo/40" : "bg-amber/20 text-amber",
                  )}
                >
                  <Bell size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-indigo">{n.title}</p>
                  <p className="mt-0.5 text-sm text-indigo/70">{n.message}</p>
                  <p className="mt-1 text-[11px] text-indigo/40">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markAsRead.mutate(n.id)}
                  disabled={markAsRead.isPending}
                  aria-label="Mark as read"
                  className="shrink-0 rounded-full p-1.5 text-indigo/50 hover:bg-muted"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
