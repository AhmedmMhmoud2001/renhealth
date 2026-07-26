"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";

export function RateProduct({ productId }: { productId: string | number }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast("Sign in to rate", "err");
      return;
    }
    setPending(true);
    const res = await api.rateProduct(productId, { rating, comment: comment.trim() || undefined });
    setPending(false);
    if (!res.ok) {
      toast(res.error || "Failed to submit rating", "err");
      return;
    }
    toast("Rating submitted");
    setOpen(false);
    setComment("");
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="text-xs uppercase tracking-[0.14em] text-gold">
        {open ? "Cancel" : "Rate this product"}
      </button>
      {open ? (
        <form onSubmit={onSubmit} className="mt-3 space-y-3 rounded-xl border border-line bg-surface-card p-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s)} className="text-lg">
                <Icon name="star" className={`h-5 w-5 ${s <= rating ? "text-gold" : "text-muted/30"}`} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your review (optional)"
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            rows={3}
          />
          <button type="submit" disabled={pending} className="rounded-md bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-60">
            {pending ? "Submitting…" : "Submit"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function ReportProduct({ productId }: { productId: string | number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setPending(true);
    const res = await api.reportProduct(productId, { reason: reason.trim() });
    setPending(false);
    if (!res.ok) {
      toast(res.error || "Failed to report", "err");
      return;
    }
    toast("Report submitted");
    setOpen(false);
    setReason("");
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="text-xs text-muted hover:text-ink">
        {open ? "Cancel" : "Report"}
      </button>
      {open ? (
        <form onSubmit={onSubmit} className="mt-2 space-y-2 rounded-xl border border-line bg-surface-card p-4">
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for report…"
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            rows={2}
          />
          <button type="submit" disabled={pending} className="rounded-md bg-red-700 px-3 py-1.5 text-xs text-white disabled:opacity-60">
            {pending ? "Sending…" : "Send report"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
