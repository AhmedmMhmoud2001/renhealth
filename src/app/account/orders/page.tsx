"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, money, unwrapList, type Order } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OrdersPage() {
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    void (async () => {
      const res = await api.orders();
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOrders(unwrapList<Order>(res.data));
    })();
  }, [token, authLoading]);

  if (!authLoading && !token) {
    return (
      <div>
        <PageHeader title="Orders" />
        <div className="section-max section-pad py-12">
          <EmptyState title="Sign in" actionHref="/login?next=/account/orders" actionLabel="Sign in" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        crumbs={[
          { label: "Account", href: "/account" },
          { label: "Orders" },
        ]}
      />
      <div className="section-max section-pad py-12">
        {loading ? (
          <p className="text-sm text-muted">Loading orders…</p>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" actionHref="/shop" actionLabel="Start shopping" />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={String(order.id)}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl border border-line bg-surface-card px-5 py-4"
              >
                <div>
                  <p className="font-medium text-ink">
                    Order #{order.number || order.id}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {order.status || "—"} · {order.created_at || ""}
                  </p>
                </div>
                <p className="font-medium">{money(order.total)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
