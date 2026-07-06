import { apiFetch } from "./api";
import type { Notification } from "../types/notification";

interface ListResponse {
  data: Notification[];
  meta: { unreadCount: number };
}

export function listNotifications() {
  return apiFetch<ListResponse>("/notifications");
}

export function markNotificationRead(id: number) {
  return apiFetch(`/notifications/${id}/read`, { method: "POST" });
}
