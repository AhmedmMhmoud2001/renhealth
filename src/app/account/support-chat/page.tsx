"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, unwrapList, unwrapData, type SupportChat, type SupportChatMessage } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SupportChatPage() {
  const { token } = useAuth();
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [subject, setSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadChats() {
    const res = await api.supportChats();
    if (res.ok) setChats(unwrapList<SupportChat>(res.data));
  }

  async function loadMessages(chatId: string) {
    const res = await api.supportChatMessages(chatId);
    if (res.ok) setMessages(unwrapList<SupportChatMessage>(res.data));
  }

  useEffect(() => {
    if (token) void loadChats();
  }, [token]);

  useEffect(() => {
    if (activeChat) void loadMessages(activeChat);
  }, [activeChat]);

  async function onNewChat(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    setPending(true);
    const res = await api.createSupportChat({ subject: subject.trim(), message: "" });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSubject("");
    const chat = unwrapData<SupportChat>(res.data);
    setActiveChat(String(chat.id));
    await loadChats();
  }

  async function onSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!activeChat || !newMessage.trim()) return;
    setPending(true);
    const res = await api.createSupportChatMessage(activeChat, { message: newMessage.trim() });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNewMessage("");
    await loadMessages(activeChat);
  }

  if (!token) {
    return (
      <div>
        <PageHeader title="Support chat" />
        <div className="section-max section-pad py-12">
          <EmptyState title="Sign in" actionHref="/login?next=/account/support-chat" actionLabel="Sign in" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Support chat" crumbs={[{ label: "Account", href: "/account" }, { label: "Support chat" }]} />
      <div className="section-max section-pad py-12">
        <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <h2 className="font-serif text-lg">Chats</h2>
            {chats.length === 0 ? (
              <p className="text-sm text-muted">No active chats.</p>
            ) : (
              chats.map((c) => (
                <button
                  key={String(c.id)}
                  type="button"
                  onClick={() => setActiveChat(String(c.id))}
                  className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                    activeChat === String(c.id) ? "border-gold bg-gold/5" : "border-line bg-surface-card"
                  }`}
                >
                  <p className="font-medium text-ink">{c.subject || `Chat #${c.id}`}</p>
                  {c.created_at ? <p className="mt-1 text-xs text-muted">{c.created_at}</p> : null}
                </button>
              ))
            )}
            <form onSubmit={onNewChat} className="space-y-2 pt-3">
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="New chat subject…"
                className="w-full rounded-md border border-line px-3 py-2 text-sm"
              />
              <button type="submit" disabled={pending} className="w-full rounded-md bg-ink py-2 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-60">
                {pending ? "Creating…" : "Start chat"}
              </button>
            </form>
          </div>
          <div>
            {activeChat ? (
              <div className="rounded-2xl border border-line bg-surface-card p-5">
                <div className="mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted">No messages yet.</p>
                  ) : (
                    messages.map((m) => (
                      <div key={String(m.id)} className="border-b border-line/50 pb-3 last:border-0 last:pb-0">
                        <p className="text-xs text-muted">{m.sender || m.sender_type || "Support"} · {m.created_at || ""}</p>
                        <p className="mt-1 text-sm">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={onSendMessage} className="flex gap-3">
                  <input
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-md border border-line px-3 py-2.5 text-sm"
                  />
                  <button type="submit" disabled={pending || !newMessage.trim()} className="rounded-md bg-ink px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-60">
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-line bg-surface-card text-sm text-muted">
                Select a chat or start a new one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
