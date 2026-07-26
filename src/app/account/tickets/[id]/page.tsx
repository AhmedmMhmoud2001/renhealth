"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, unwrapData, type TicketMessage } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { EmptyState } from "@/components/ui/EmptyState";

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "open") return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  if (s === "pending") return "bg-amber-100 text-amber-700 ring-amber-200";
  if (s === "resolved" || s === "closed")
    return "bg-sky-100 text-sky-700 ring-sky-200";
  return "bg-gray-100 text-gray-600 ring-gray-200";
}

function priorityBadge(priority: string) {
  const p = priority?.toLowerCase();
  if (p === "urgent" || p === "high")
    return "bg-red-100 text-red-700 ring-red-200";
  if (p === "medium")
    return "bg-amber-100 text-amber-700 ring-amber-200";
  if (p === "low") return "bg-sky-100 text-sky-700 ring-sky-200";
  return "bg-gray-100 text-gray-600 ring-gray-200";
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) +
    " \u00b7 " +
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
}

function getSenderName(sender: unknown): string {
  if (!sender) return "Support";
  if (typeof sender === "object" && sender !== null) {
    return String((sender as Record<string, unknown>).name ?? "Support");
  }
  return String(sender);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isUserMessage(m: TicketMessage, currentUserName?: string) {
  const name = getSenderName(m.sender).toLowerCase().trim();
  const supportNames = ["support", "admin", "agent", "system", "ren health"];
  if (supportNames.includes(name)) return false;
  if (currentUserName && name === currentUserName.toLowerCase().trim()) return true;
  const t = m.sender_type?.toLowerCase();
  if (t === "user" || t === "customer" || t === "client") return true;
  return false;
}

function SkeletonBubble({ right }: { right?: boolean }) {
  return (
    <div className={`flex ${right ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end gap-2 max-w-[75%]">
        {!right && (
          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 animate-pulse" />
        )}
        <div>
          <div className="mb-1 h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="space-y-1.5 rounded-2xl bg-gray-100 p-4">
            <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token, user } = useAuth();
  const currentUserName = user?.name ?? "";
  const [id, setId] = useState<string>("");
  const [ticket, setTicket] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void params.then((p) => setId(p.id));
  }, [params]);

  function scrollToBottom(smooth = true) {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
  }

  async function load() {
    if (!token || !id) return;
    setLoading(true);
    const tRes = await api.ticket(id);
    setLoading(false);
    if (!tRes.ok) return;
    const data = unwrapData<Record<string, unknown>>(tRes.data);
    setTicket(data);
    const raw = data.messages ?? data.replies ?? [];
    if (Array.isArray(raw)) setMessages(raw as TicketMessage[]);
  }

  useEffect(() => {
    void load();
  }, [token, id]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;
    setPending(true);
    const res = await api.createTicketMessage(id, { message: text });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNewMessage("");
    setError(null);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        message: text,
        sender_type: "user",
        created_at: new Date().toISOString(),
      },
    ]);
    setTimeout(() => scrollToBottom(), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit(e as unknown as FormEvent);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-20">
        <EmptyState
          title="Sign in"
          actionHref="/login"
          actionLabel="Sign in"
        />
      </div>
    );
  }

  const ticketStatus = String(ticket?.status || "open");
  const ticketPriority = String(ticket?.priority || "medium");
  const createdAt = ticket?.created_at
    ? formatTime(String(ticket.created_at))
    : "";
  const updatedAt = ticket?.updated_at
    ? formatTime(String(ticket.updated_at))
    : createdAt;

  return (
    <div className="min-h-[80vh] bg-surface-deep">
      <div className="mx-auto max-w-[900px] px-4 py-6 md:px-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-muted">
          <Link href="/account" className="transition hover:text-ink">
            Account
          </Link>
          <span>/</span>
          <Link href="/account/tickets" className="transition hover:text-ink">
            Support
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">
            {String(ticket?.subject || `#${id}`)}
          </span>
        </nav>

        {/* Ticket Info Card */}
        <div className="mb-6 rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl text-ink md:text-3xl">
                {String(ticket?.subject || ticket?.title || `Ticket #${id}`)}
              </h1>
              {ticket?.description ? (
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                  {String(ticket.description)}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusBadge(ticketStatus)}`}
              >
                {ticketStatus}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${priorityBadge(ticketPriority)}`}
              >
                {ticketPriority}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-xs text-muted">
            <span>
              <span className="font-medium text-ink">ID</span> #{id}
            </span>
            {createdAt ? (
              <span>
                <span className="font-medium text-ink">Created</span>{" "}
                {createdAt}
              </span>
            ) : null}
            {updatedAt !== createdAt && updatedAt ? (
              <span>
                <span className="font-medium text-ink">Updated</span>{" "}
                {updatedAt}
              </span>
            ) : null}
          </div>
        </div>

        {/* Conversation Card */}
        <div className="flex flex-col rounded-2xl border border-line bg-surface-card shadow-sm overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6" style={{ maxHeight: "70vh" }}>
            {loading ? (
              <div className="space-y-5">
                <SkeletonBubble />
                <SkeletonBubble right />
                <SkeletonBubble />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
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
                <p className="text-sm font-medium text-ink">No replies yet</p>
                <p className="mt-1 text-sm text-muted">
                  Start the conversation below.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => {
                  const isUser = isUserMessage(m, currentUserName);
                  const senderName = getSenderName(m.sender);
                  const prevMsg = i > 0 ? messages[i - 1] : null;
                  const sameSender =
                    prevMsg &&
                    isUserMessage(prevMsg, currentUserName) === isUser &&
                    getSenderName(prevMsg.sender) === senderName;
                  const showTime = !sameSender;

                  return (
                    <div
                      key={String(m.id)}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-[fadeIn_0.3s_ease-out]`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!sameSender ? (
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
                              isUser ? "bg-ink" : "bg-gold"
                            }`}
                          >
                            {getInitials(senderName)}
                          </div>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                        <div>
                          {showTime ? (
                            <p
                              className={`mb-1 flex items-center gap-1.5 text-[11px] text-muted ${isUser ? "justify-end" : "justify-start"}`}
                            >
                              <span className="font-medium text-ink">
                                {senderName}
                              </span>
                              <span>\u00b7</span>
                              <span>{formatTime(m.created_at)}</span>
                            </p>
                          ) : null}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              isUser
                                ? "bg-ink text-white rounded-br-md"
                                : "bg-surface-muted text-ink rounded-bl-md"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.message}</p>
                            {m.attachment ? (
                              <a
                                href={m.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`mt-2 inline-flex items-center gap-1 text-xs ${isUser ? "text-white/80 hover:text-white" : "text-gold hover:text-gold/80"}`}
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m18.375 12.739 3.675 3.675a.75.75 0 0 1-1.06 1.06l-3.675-3.675a4.5 4.5 0 1 1 1.06-1.06ZM11.25 12.739l3.675 3.675a.75.75 0 0 1-1.06 1.06l-3.675-3.675a4.5 4.5 0 1 1 1.06-1.06ZM9 12l3 3m0 0 3-3m-3 3V3"
                                  />
                                </svg>
                                Attachment
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-line bg-surface-card p-4 md:p-5">
            {error ? (
              <p className="mb-3 text-xs text-red-600">{error}</p>
            ) : null}
            <form onSubmit={onSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your reply\u2026"
                  rows={1}
                  className="w-full resize-none rounded-xl border border-line bg-surface-muted px-4 py-3 pr-12 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 120) + "px";
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={pending || !newMessage.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition-all hover:bg-ink/90 disabled:opacity-40 disabled:hover:bg-ink"
              >
                {pending ? (
                  <svg
                    className="h-5 w-5 animate-spin"
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
                ) : (
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
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                )}
              </button>
            </form>
            <p className="mt-2 text-[11px] text-muted">
              Press <kbd className="rounded bg-surface-muted px-1 py-0.5 text-[10px] font-medium text-ink">Enter</kbd> to
              send, <kbd className="rounded bg-surface-muted px-1 py-0.5 text-[10px] font-medium text-ink">Shift+Enter</kbd> for
              new line
            </p>
          </div>
        </div>
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
