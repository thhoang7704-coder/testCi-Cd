import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import {
  notificationService,
  type BackendNotificationResponse,
  type BroadcastNotificationRequest,
} from "@/services/notification.service";

const decodeJwtPayload = (token: string): any => {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const hasSystemAdminRole = (): boolean => {
  try {
    const token = String(localStorage.getItem("token") || "");
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    const raw = payload?.roles ?? payload?.authorities ?? payload?.role ?? [];
    const roles: string[] = Array.isArray(raw)
      ? raw.map((x) => String(x))
      : [String(raw)];
    return roles.some((r) => r === "SYSTEM_ADMIN" || r === "ROLE_SYSTEM_ADMIN");
  } catch {
    return false;
  }
};

const BROADCAST_ROLE_OPTIONS = [
  "LAB_ADMIN",
  "COMPANY",
  "MENTOR",
  "TALENT",
  "USER",
] as const;

const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BackendNotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

  const [notifyForm, setNotifyForm] = useState<BroadcastNotificationRequest>({
    title: "",
    message: "",
    type: "SYSTEM_ANNOUNCEMENT",
    sendToAll: true,
    roles: [],
  });
  const [sendingNotify, setSendingNotify] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [list, count] = await Promise.all([
        notificationService.listMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setItems(list || []);
      setUnreadCount(count || 0);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load notifications");
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsSystemAdmin(hasSystemAdminRole());
    void load();
  }, [load]);

  const handleBroadcastNotification = useCallback(async () => {
    if (!isSystemAdmin) return;
    if (!notifyForm.title?.trim()) {
      toast.error("Please enter a notification title");
      return;
    }
    if (
      !notifyForm.sendToAll &&
      (!notifyForm.roles || notifyForm.roles.length === 0)
    ) {
      toast.error(
        "Please select at least one role to send the notification to",
      );
      return;
    }

    try {
      setSendingNotify(true);
      const count = await notificationService.broadcast({
        title: notifyForm.title.trim(),
        message: (notifyForm.message || "").trim() || undefined,
        type: (notifyForm.type || "").trim() || undefined,
        sendToAll: Boolean(notifyForm.sendToAll),
        roles: notifyForm.sendToAll ? [] : notifyForm.roles || [],
      });
      toast.success(`Sent notification to ${count} users`);
      setNotifyForm((p) => ({ ...p, title: "", message: "" }));
    } catch (e: any) {
      toast.error(e?.message || "Failed to send notification");
    } finally {
      setSendingNotify(false);
    }
  }, [isSystemAdmin, notifyForm]);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success("All notifications marked as read");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Mark all read failed");
    }
  }, [load]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        await notificationService.markAsRead(id);
        await load();
      } catch (e: any) {
        toast.error(e?.message || "Mark read failed");
      }
    },
    [load],
  );

  const rows = useMemo(() => {
    return (items || []).map((n) => {
      const created = n.createdAt ? new Date(n.createdAt) : null;
      const createdText =
        created && !Number.isNaN(created.getTime())
          ? created.toLocaleString()
          : "";
      return { ...n, createdText };
    });
  }, [items]);

  return (
    <div className="space-y-6">
      {isSystemAdmin ? (
        <Card title="Create Notification" subtitle="SYSTEM_ADMIN only">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Send to all roles, or choose specific roles.
              </div>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={() => void handleBroadcastNotification()}
                disabled={sendingNotify}
              >
                {sendingNotify ? "Sending…" : "Send"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  value={notifyForm.title}
                  onChange={(e) =>
                    setNotifyForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Enter a title..."
                  disabled={sendingNotify}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  value={notifyForm.type || ""}
                  onChange={(e) =>
                    setNotifyForm((p) => ({ ...p, type: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="SYSTEM_ANNOUNCEMENT"
                  disabled={sendingNotify}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={notifyForm.message || ""}
                onChange={(e) =>
                  setNotifyForm((p) => ({ ...p, message: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="Nội dung thông báo..."
                disabled={sendingNotify}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={Boolean(notifyForm.sendToAll)}
                  onChange={() =>
                    setNotifyForm((p) => ({ ...p, sendToAll: true, roles: [] }))
                  }
                  disabled={sendingNotify}
                />
                Send to all roles
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!notifyForm.sendToAll}
                  onChange={() =>
                    setNotifyForm((p) => ({ ...p, sendToAll: false }))
                  }
                  disabled={sendingNotify}
                />
                Choose roles
              </label>
            </div>

            {!notifyForm.sendToAll ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {BROADCAST_ROLE_OPTIONS.map((role) => {
                  const checked = (notifyForm.roles || []).includes(role);
                  return (
                    <label
                      key={role}
                      className="inline-flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(notifyForm.roles || []);
                          if (e.target.checked) next.add(role);
                          else next.delete(role);
                          setNotifyForm((p) => ({
                            ...p,
                            roles: Array.from(next),
                          }));
                        }}
                        disabled={sendingNotify}
                      />
                      {role}
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card
        title={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        subtitle="Recent updates and alerts"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {loading ? "Loading…" : `${items.length} notifications`}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={() => void load()}
            >
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-slate-600 dark:text-slate-300">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded border ${n.isRead ? "border-gray-200 bg-white" : "border-blue-200 bg-blue-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {n.title || "Notification"}
                    </div>
                    {n.createdText ? (
                      <div className="text-xs text-gray-500 mt-1">
                        {n.createdText}
                      </div>
                    ) : null}
                  </div>
                  {!n.isRead ? (
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm"
                      onClick={() => void markRead(n.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
                {n.message ? (
                  <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                    {n.message}
                  </div>
                ) : null}
                {n.type ? (
                  <div className="text-xs text-gray-500 mt-2">{n.type}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
