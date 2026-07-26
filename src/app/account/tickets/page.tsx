"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { api, unwrapList } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "open") return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  if (s === "pending") return "bg-amber-100 text-amber-700 ring-amber-200";
  if (s === "resolved" || s === "closed")
    return "bg-sky-100 text-sky-700 ring-sky-200";
  return "bg-gray-100 text-gray-600 ring-gray-200";
}

function formatRelative(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Array<Record<string, unknown>>>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"complaint" | "recommendation">(
    "recommendation"
  );
  const [attachment, setAttachment] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    const res = await api.tickets();
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTickets(unwrapList(res.data));
  }

  useEffect(() => {
    if (token) void load();
  }, [token]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.append("subject", subject);
    fd.append("description", description);
    fd.append("type", type);
    if (attachment) fd.append("attachment[0]", attachment);
    const res = await api.createTicket(fd);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSubject("");
    setDescription("");
    setAttachment(null);
    setShowNew(false);
    await load();
  }

  if (!token) {
    return (
      <div>
        <PageHeader title="Support" />
        <div className="section-max section-pad py-12">
          <EmptyState
            title="Sign in"
            actionHref="/login?next=/account/tickets"
            actionLabel="Sign in"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-surface-deep">
      <div className="mx-auto max-w-[900px] px-4 py-6 md:px-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-muted">
          <Link href="/account" className="transition hover:text-ink">
            Account
          </Link>
          <span>/</span>
          <span className="text-ink">Support</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-ink md:text-4xl">
              Support Tickets
            </h1>
            <p className="mt-1 text-sm text-muted">
              {tickets.length === 0
                ? "No tickets yet"
                : `${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-ink/90"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Ticket
          </button>
        </div>

        {/* New Ticket Form */}
        {showNew ? (
          <form
            onSubmit={onCreate}
            className="mb-8 space-y-4 rounded-2xl border border-line bg-surface-card p-6 shadow-sm animate-[fadeIn_0.3s_ease-out]"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">
                Create a new ticket
              </h2>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="rounded-lg p-1 text-muted transition hover:text-ink"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "complaint" | "recommendation")
                }
                className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
              >
                <option value="recommendation">Recommendation</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue or suggestion\u2026"
              rows={4}
              className="w-full resize-none rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-muted px-4 py-2.5 text-sm text-muted transition hover:border-gold/50 hover:text-ink">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.375 12.739 3.675 3.675a.75.75 0 0 1-1.06 1.06l-3.675-3.675a4.5 4.5 0 1 1 1.06-1.06ZM11.25 12.739l3.675 3.675a.75.75 0 0 1-1.06 1.06l-3.675-3.675a4.5 4.5 0 1 1 1.06-1.06Z"
                  />
                </svg>
                {attachment ? attachment.name : "Attach file"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-ink/90 disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating\u2026
                  </>
                ) : (
                  "Create Ticket"
                )}
              </button>
            </div>
          </form>
        ) : null}

        {/* Tickets List */}
        {tickets.length === 0 && !showNew ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface-card py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <svg
                className="h-8 w-8 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 20.105V4.875A1.875 1.875 0 0 1 5.625 3h12.75A1.875 1.875 0 0 1 20.25 4.875v10.5A1.875 1.875 0 0 1 18.375 17.25H7.5l-3.75 2.855Z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-ink">No tickets yet</p>
            <p className="mt-1 text-sm text-muted">
              Create your first support ticket to get help.
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-ink/90"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New Ticket
            </button>
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((t, i) => {
              const status = String(t.status || "open");
              return (
                <Link
                  key={i}
                  href={`/account/tickets/${t.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-surface-card p-5 shadow-sm transition-all hover:border-gold/40 hover:shadow-md animate-[fadeIn_0.3s_ease-out]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-sm font-semibold text-ink group-hover:bg-gold/10 group-hover:text-gold">
                    #{String(t.id)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink group-hover:text-gold">
                          {String(t.subject || t.title || `Ticket ${t.id}`)}
                        </p>
                        {t.description ? (
                          <p className="mt-1 line-clamp-1 text-xs text-muted">
                            {String(t.description)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusBadge(status)}`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                      {t.type ? (
                        <span className="flex items-center gap-1 capitalize">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                            />
                          </svg>
                          {String(t.type)}
                        </span>
                      ) : null}
                      <span>
                        {formatRelative(
                          String(t.updated_at || t.created_at)
                        )}
                      </span>
                    </div>
                  </div>
                  <svg
                    className="mt-1 h-4 w-4 shrink-0 text-muted/40 transition group-hover:text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
