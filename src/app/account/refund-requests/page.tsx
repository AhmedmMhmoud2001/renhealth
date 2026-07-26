"use client";

import { useEffect, useState } from "react";
import { api, unwrapList, money, type RefundRequest } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function RefundRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const res = await api.refundRequests();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRequests(unwrapList<RefundRequest>(res.data));
    })();
  }, [token]);

  if (!token) {
    return (
      <div>
        <PageHeader title="Refund requests" />
        <div className="section-max section-pad py-12">
          <EmptyState title="Sign in" actionHref="/login?next=/account/refund-requests" actionLabel="Sign in" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Refund requests"
        crumbs={[{ label: "Account", href: "/account" }, { label: "Refund requests" }]}
      />
      <div className="section-max section-pad py-12">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {requests.length === 0 && !error ? (
          <EmptyState title="No refund requests" body="Request a refund from your order detail page." actionHref="/account/orders" actionLabel="View orders" />
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {requests.map((r) => (
              <div key={String(r.id)} className="rounded-2xl border border-line bg-surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{r.reason || "Refund request"}</p>
                    <p className="mt-1 text-sm text-muted">{r.details || ""}</p>
                    {r.order_id ? <p className="mt-1 text-xs text-muted">Order #{r.order_id}</p> : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-muted px-3 py-1 text-xs capitalize">
                    {r.status || "pending"}
                  </span>
                </div>
                {r.created_at ? (
                  <p className="mt-2 text-xs text-muted">{r.created_at}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
