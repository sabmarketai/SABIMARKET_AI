import { authRequest } from "@/lib/authRequest";
import { Notification } from "../types";

export const getNotifications = () =>
  authRequest<Notification[]>("/api/notifications", { method: "GET" });

export const getUnreadNotifications = () =>
  authRequest<Notification[]>("/api/notifications/unread", { method: "GET" });

export const markNotificationAsRead = (id: string) =>
  authRequest<Notification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsAsRead = () =>
  authRequest<{ message: string }>("/api/notifications/read-all", {
    method: "PATCH",
  });
