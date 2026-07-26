"use client";

import { useCallback, useEffect, useState } from "react";
import { api, unwrapList, type Notification } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

function BellIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="m4 12 5 5 11-11" />
    </svg>
  );
}

function formatDate(raw?: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return raw;
  }
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.notifications();
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNotifications(unwrapList<Notification>(res.data));
    setError(null);
  }, []);

  useEffect(() => {
    if (token) void load();
    else setLoading(false);
  }, [token, load]);

  async function markAllRead() {
    await api.markAllNotificationsRead();
    await load();
  }

  async function markRead(id: string | number) {
    const res = await api.markNotificationRead(id);
    if (res.ok) await load();
  }

  const unread = notifications.filter((n) => !n.is_read && !n.read_at);
  const read = notifications.filter((n) => n.is_read || n.read_at);

  if (!token) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <div className="section-max section-pad py-12">
          <EmptyState title="Sign in" actionHref="/login?next=/account/notifications" actionLabel="Sign in" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        crumbs={[{ label: "Account", href: "/account" }, { label: "Notifications" }]}
      />
      <div className="section-max section-pad py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!loading && notifications.length === 0 && !error ? (
            <EmptyState title="No notifications" body="You're all caught up!" />
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            </div>
          ) : null}

          {notifications.length > 0 ? (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-muted">
                  {unread.length > 0
                    ? `${unread.length} unread notification${unread.length > 1 ? "s" : ""}`
                    : "All caught up"}
                </p>
                {unread.length > 0 ? (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-deep"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    Mark all as read
                  </button>
                ) : null}
              </div>

              <div className="space-y-2">
                {notifications.map((n) => {
                  const isUnread = !n.is_read && !n.read_at;
                  return (
                    <button
                      key={String(n.id)}
                      type="button"
                      onClick={() => { if (isUnread) void markRead(n.id); }}
                      className={`group relative w-full rounded-2xl border p-5 text-left transition-all hover:shadow-sm ${
                        isUnread
                          ? "border-gold/20 bg-gold/[0.03]"
                          : "border-line/70 bg-surface-card"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                            isUnread
                              ? "bg-gold/10 text-gold"
                              : "bg-surface-muted text-muted/60"
                          }`}
                        >
                          <BellIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={`text-sm ${
                                isUnread ? "font-medium text-ink" : "text-ink/80"
                              }`}
                            >
                              {n.title || n.body || n.message || "Notification"}
                            </p>
                            {isUnread ? (
                              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gold" />
                            ) : null}
                          </div>
                          {(n.body && n.title) || (n.message && n.title) ? (
                            <p className="mt-1 text-sm text-muted">
                              {n.body || n.message}
                            </p>
                          ) : null}
                          {n.created_at ? (
                            <p className="mt-2 text-xs text-muted/60">
                              {formatDate(n.created_at)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
