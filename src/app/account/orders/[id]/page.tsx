"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { api, money, unwrapData, productImage, type Order, type CartItem } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";

function formatDate(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      " \u2022 " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return raw;
  }
}

function statusStyle(status?: string) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "paid") return "bg-green-50 text-green-700 border-green-200";
  if (s === "processing") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "delivered" || s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "cancelled" || s === "canceled") return "bg-red-50 text-red-700 border-red-200";
  if (s === "refunded" || s === "refund_requested") return "bg-gray-50 text-gray-700 border-gray-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

function statusLabel(status?: string): string {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "paid") return "Paid";
  if (s === "processing") return "Processing";
  if (s === "delivered" || s === "completed") return "Delivered";
  if (s === "cancelled" || s === "canceled") return "Cancelled";
  if (s === "refunded" || s === "refund_requested") return "Refunded";
  return status || "—";
}

function CalendarIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}

function CreditCardIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M7 15h4" />
    </svg>
  );
}

function PackageIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z" />
      <path d="M4 8l8 5 8-5M12 22V13" />
    </svg>
  );
}

function ReceiptIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2Z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}

function RefreshIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 5v5h5" />
    </svg>
  );
}

function TruckIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7V10z" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </svg>
  );
}

function HeadphonesIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Z" />
      <path d="M20 14v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

function StarIcon({ className = "h-4 w-4", fill = false }) {
  return (
    <svg className={className} fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3Z" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

function ImageIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

type Props = {
  params: Promise<{ id: string }>;
};

export default function OrderDetailPage({ params }: Props) {
  const { token } = useAuth();
  const [id, setId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundPending, setRefundPending] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratePending, setRatePending] = useState(false);
  const [payProof, setPayProof] = useState<File | null>(null);
  const [payPending, setPayPending] = useState(false);

  useEffect(() => {
    void params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!token || !id) return;
    void (async () => {
      const res = await api.order(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOrder(unwrapData<Order>(res.data));
    })();
  }, [token, id]);

  const s = (order?.status || "").toLowerCase();
  const payStatus = (order?.payment_status || "").toLowerCase();
  const payMethod = (order?.payment_method || "").toLowerCase();

  const showPayProof =
    s === "pending" &&
    payStatus !== "paid" &&
    !payMethod.includes("cod") &&
    !payMethod.includes("cash");

  const items = (order?.items || []) as CartItem[];

  const address = order?.address as Record<string, string> | null | undefined;
  const addressDisplay = address
    ? [address.address, address.city, address.state].filter(Boolean).join(", ")
    : null;

  if (!token) {
    return (
      <div className="section-max section-pad py-12">
        <EmptyState title="Sign in" actionHref="/login" actionLabel="Sign in" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Order #${order?.number || id}`}
        crumbs={[
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: String(order?.number || id) },
        ]}
      />
      <div className="section-max section-pad py-8 md:py-12">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {!order && !error ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          </div>
        ) : null}

        {order ? (
          <div className="mx-auto max-w-4xl space-y-6">
            {/* ── Header ── */}
            <div>
              <Link
                href="/account/orders"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
                Back to Orders
              </Link>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-serif text-2xl tracking-tight text-ink md:text-3xl">
                    Order #{order.number || id}
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.08em] ${statusStyle(order.status)}`}
                >
                  <PackageIcon className="h-3.5 w-3.5" />
                  {statusLabel(order.status)}
                </span>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <section className="rounded-2xl border border-line/80 bg-surface-card p-6 shadow-[0_1px_6px_rgba(26,26,26,0.04)] md:p-8">
              <h2 className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                <ReceiptIcon className="h-3.5 w-3.5" />
                Order Summary
              </h2>
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <SummaryField
                  icon={<PackageIcon />}
                  label="Status"
                  value={
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                  }
                />
                <SummaryField
                  icon={<CreditCardIcon />}
                  label="Payment Method"
                  value={order.payment_method || "—"}
                />
                <SummaryField
                  icon={<CreditCardIcon />}
                  label="Payment Status"
                  value={order.payment_status || "—"}
                />
                <SummaryField
                  icon={<CalendarIcon />}
                  label="Order Date"
                  value={formatDate(order.created_at)}
                />
                <SummaryField
                  icon={<ReceiptIcon />}
                  label="Total"
                  value={<span className="font-medium text-ink">{money(order.total)}</span>}
                />
                {addressDisplay ? (
                  <SummaryField
                    icon={<TruckIcon />}
                    label="Shipping Address"
                    value={addressDisplay}
                  />
                ) : null}
              </div>
            </section>

            {/* ── Order Items ── */}
            {items.length > 0 ? (
              <section className="rounded-2xl border border-line/80 bg-surface-card p-6 shadow-[0_1px_6px_rgba(26,26,26,0.04)] md:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  <PackageIcon className="h-3.5 w-3.5" />
                  Order Items
                </h2>
                <div className="-mx-6 md:-mx-8">
                  <table className="w-full">
                    <thead className="hidden border-b border-line/60 md:table-header-group">
                      <tr className="text-xs uppercase tracking-[0.12em] text-muted">
                        <th className="pb-3 pl-6 pr-4 text-left font-normal md:pl-8">Product</th>
                        <th className="pb-3 px-4 text-left font-normal">Qty</th>
                        <th className="pb-3 px-4 text-right font-normal">Unit Price</th>
                        <th className="pb-3 pr-6 pl-4 text-right font-normal md:pr-8">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {items.map((item) => {
                        const p = item.product;
                        const img = p ? productImage(p) : null;
                        const name = p?.name || `Product #${item.product_id}`;
                        const qty = Number(item.quantity) || 1;
                        const unitPrice = Number(item.price ?? p?.final_price ?? p?.price ?? 0);
                        const itemTotal = unitPrice * qty;
                        return (
                          <tr key={String(item.id)} className="group">
                            <td className="py-4 pl-6 pr-4 md:pl-8">
                              <div className="flex items-start gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt={name}
                                      className="h-full w-full object-contain p-1.5"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <ImageIcon className="h-5 w-5 text-muted/40" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 pt-0.5">
                                  <p className="text-sm font-medium text-ink">{name}</p>
                                  {(item as Record<string, unknown>).color ? (
                                    <p className="mt-0.5 text-xs text-muted">
                                      Color: {(item as Record<string, unknown>).color as string}
                                    </p>
                                  ) : null}
                                  {(item as Record<string, unknown>).size ? (
                                    <p className="text-xs text-muted">
                                      Size: {(item as Record<string, unknown>).size as string}
                                    </p>
                                  ) : null}
                                  <p className="mt-1 text-xs text-muted md:hidden">
                                    {qty} &times; {money(unitPrice)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="hidden px-4 py-4 text-sm text-ink md:table-cell">{qty}</td>
                            <td className="hidden px-4 py-4 text-right text-sm text-muted md:table-cell">
                              {money(unitPrice)}
                            </td>
                            <td className="hidden px-4 py-4 text-right text-sm font-medium text-ink md:table-cell md:pr-8">
                              {money(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {/* ── Order Totals ── */}
            <section className="rounded-2xl border border-line/80 bg-surface-card p-6 shadow-[0_1px_6px_rgba(26,26,26,0.04)] md:p-8">
              <h2 className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                <ReceiptIcon className="h-3.5 w-3.5" />
                Order Totals
              </h2>
              <div className="space-y-2.5">
                <TotalRow label="Subtotal" value={money((order as Record<string, unknown>).subtotal as number | string ?? order.total)} />
                {(order as Record<string, unknown>).discount ? (
                  <TotalRow label="Discount" value={money((order as Record<string, unknown>).discount as number | string)} />
                ) : null}
                {(order as Record<string, unknown>).shipping ? (
                  <TotalRow label="Shipping" value={money((order as Record<string, unknown>).shipping as number | string)} />
                ) : null}
                {(order as Record<string, unknown>).tax ? (
                  <TotalRow label="Tax" value={money((order as Record<string, unknown>).tax as number | string)} />
                ) : null}
                <div className="border-t border-line/60 pt-3">
                  <TotalRow label="Grand Total" value={money(order.total)} bold />
                </div>
              </div>
            </section>

            {/* ── Payment Proof Upload ── */}
            {showPayProof ? (
              <section className="rounded-2xl border border-line/80 bg-surface-card p-6 shadow-[0_1px_6px_rgba(26,26,26,0.04)] md:p-8">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  <CreditCardIcon className="h-3.5 w-3.5" />
                  Payment
                </h2>
                <label className="mb-3 block text-sm text-muted">
                  Upload Payment Proof
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line/80 px-4 py-2.5 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPayProof(e.target.files?.[0] ?? null)}
                      className="sr-only"
                    />
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    {payProof ? payProof.name : "Choose File"}
                  </label>
                  <button
                    type="button"
                    disabled={payPending}
                    onClick={async () => {
                      setPayPending(true);
                      const res = await api.payOrder(order.id, {
                        payment_method: "online",
                        payment_proof: payProof || undefined,
                      });
                      setPayPending(false);
                      if (!res.ok) { toast(res.error || "Payment failed", "err"); return; }
                      toast("Payment submitted");
                      const updated = await api.order(id);
                      if (updated.ok) setOrder(unwrapData<Order>(updated.data));
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-ink/90 disabled:opacity-50"
                  >
                    {payPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing&hellip;
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </button>
                </div>
              </section>
            ) : null}

            {/* ── Actions ── */}
            <section className="rounded-2xl border border-line/80 bg-surface-card p-6 shadow-[0_1px_6px_rgba(26,26,26,0.04)] md:p-8">
              <div className="flex flex-wrap gap-3">
                {s === "pending" ? (
                  <>
                    {!showPayProof ? (
                      <button
                        type="button"
                        onClick={async () => {
                          setPayPending(true);
                          const res = await api.payOrder(order.id, {
                            payment_method: "online",
                          });
                          setPayPending(false);
                          if (!res.ok) { toast(res.error || "Payment failed", "err"); return; }
                          toast("Payment submitted");
                          const updated = await api.order(id);
                          if (updated.ok) setOrder(unwrapData<Order>(updated.data));
                        }}
                        disabled={payPending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-ink/90 disabled:opacity-50"
                      >
                        {payPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing&hellip;
                          </>
                        ) : (
                          <>
                            <CreditCardIcon className="h-4 w-4" />
                            Pay Now
                          </>
                        )}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void (async () => {
                        const res = await api.cancelOrder(order.id);
                        if (!res.ok) { toast(res.error || "Cancel failed", "err"); return; }
                        toast("Order cancelled");
                        const updated = await api.order(id);
                        if (updated.ok) setOrder(unwrapData<Order>(updated.data));
                      })()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-line/80 px-6 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink/40 hover:bg-ink/5"
                    >
                      Cancel Order
                    </button>
                  </>
                ) : null}

                {(s === "paid" || s === "delivered" || s === "completed" || s === "cancelled" || s === "canceled" || s === "refunded") ? (
                  <button
                    type="button"
                    onClick={() => void api.reorder(order.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-ink/90"
                  >
                    <RefreshIcon className="h-4 w-4" />
                    Reorder
                  </button>
                ) : null}

                {s === "processing" ? (
                  <Link
                    href="/account/support-chat"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-line/80 px-6 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink/40 hover:bg-ink/5"
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Contact Support
                  </Link>
                ) : null}

                {(s === "delivered" || s === "completed") ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRefund(!showRefund)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-line/80 px-6 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink/40 hover:bg-ink/5"
                    >
                      Request Refund
                    </button>
                  </>
                ) : null}
              </div>

              {/* ── Refund Form ── */}
              {showRefund ? (
                <form
                  onSubmit={async (e: FormEvent) => {
                    e.preventDefault();
                    if (!refundReason.trim()) return;
                    setRefundPending(true);
                    const res = await api.refundRequest(order.id, { reason: refundReason.trim() });
                    setRefundPending(false);
                    if (!res.ok) { toast(res.error || "Refund request failed", "err"); return; }
                    toast("Refund requested");
                    setShowRefund(false);
                    setRefundReason("");
                  }}
                  className="mt-5 space-y-3 rounded-xl border border-line/60 bg-surface-muted/30 p-4"
                >
                  <label className="block text-xs font-medium uppercase tracking-[0.1em] text-muted">
                    Reason for refund
                  </label>
                  <textarea
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Tell us why you're requesting a refund&hellip;"
                    className="w-full rounded-xl border border-line/80 bg-surface-card px-4 py-3 text-sm placeholder:text-muted/50 focus:border-ink/30 focus:outline-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={refundPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-ink/90 disabled:opacity-50"
                  >
                    {refundPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting&hellip;
                      </>
                    ) : (
                      "Submit Refund Request"
                    )}
                  </button>
                </form>
              ) : null}
            </section>

            {/* ── Rating ── */}
            {(s === "delivered" || s === "completed") ? (
              <section className="rounded-2xl border border-line/80 bg-surface-card p-6 shadow-[0_1px_6px_rgba(26,26,26,0.04)] md:p-8">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  <StarIcon className="h-3.5 w-3.5" />
                  Rate Your Order
                </h2>
                <p className="mb-3 text-sm text-muted">
                  How was your experience? Your feedback helps us improve.
                </p>
                <div
                  className="flex gap-1.5"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={ratePending}
                      onClick={async () => {
                        setRatePending(true);
                        setRating(s);
                        const res = await api.rateOrder(order.id, { rating: s });
                        setRatePending(false);
                        if (!res.ok) { toast(res.error || "Rating failed", "err"); return; }
                        toast("Thank you for rating!");
                      }}
                      onMouseEnter={() => setHoverRating(s)}
                      className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                    >
                      <StarIcon
                        className="h-7 w-7 transition-colors"
                        fill={s <= (hoverRating || rating)}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    {rating === 5 ? "Excellent!" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted/60">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.1em] text-muted">{label}</p>
        <div className="mt-0.5 text-sm text-ink">{value}</div>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-medium text-ink" : "text-muted"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-semibold text-ink" : "text-ink"}`}>{value}</span>
    </div>
  );
}
