import { useEffect, useRef, useState } from "react";
import { Bell, Building2, CheckCircle2, Trash2 } from "lucide-react";
import { listNotifications, markNotificationRead } from "../../lib/notificationsApi";
import type { Notification } from "../../types/notification";

const typeIcon: Record<string, typeof Building2> = {
  property_created: Building2,
  property_sold: CheckCircle2,
  property_deleted: Trash2,
};

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const res = await listNotifications();
      setNotifications(res.data);
      setUnreadCount(res.meta.unreadCount);
    } catch {
      // silently ignore — the bell just won't update this cycle
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkRead(notification: Notification) {
    if (notification.isRead) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    try {
      await markNotificationRead(notification.id);
    } catch {
      refresh();
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setIsOpen((v) => !v)}
        className="relative text-slate-500 hover:text-slate-700"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type] ?? Building2;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleMarkRead(n)}
                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50 ${
                      n.isRead ? "" : "bg-blue-50/40"
                    }`}
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-xs leading-snug ${n.isRead ? "text-slate-500" : "font-medium text-slate-800"}`}>
                        {n.message}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-navy-700" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
