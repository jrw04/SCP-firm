"use client";

import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";

export function useNotifications() {
  const { staffUser } = useAuth();
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  const mine = staffUser
    ? notifications
        .filter((n) => n.userId === staffUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const unreadCount = mine.filter((n) => !n.read).length;

  return {
    notifications: mine,
    unreadCount,
    markRead,
    markAllRead: () => staffUser && markAllRead(staffUser.id),
  };
}
