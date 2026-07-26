"use client";

import { useEffect, useState } from "react";
import { api, money, unwrapList } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

type WalletRow = {
  id: number | string;
  amount?: number | string;
  type?: string;
  description?: string;
  created_at?: string;
  [key: string]: unknown;
};

export default function WalletPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<WalletRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const res = await api.walletHistory();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRows(unwrapList<WalletRow>(res.data));
    })();
  }, [token]);

  if (!token) {
    return (
      <div>
        <PageHeader title="Wallet" />
        <div className="section-max section-pad py-12">
          <EmptyState title="Sign in" actionHref="/login?next=/account/wallet" actionLabel="Sign in" />
        </div>
      </div>
    );
  }

  const balance = rows.reduce((sum, r) => {
    const amt = Number(r.amount ?? 0);
    if (Number.isNaN(amt)) return sum;
    if (r.type === "withdrawal" || r.type === "debit" || r.type === "payment") return sum - Math.abs(amt);
    if (r.type === "deposit" || r.type === "credit" || r.type === "refund") return sum + Math.abs(amt);
    return sum + amt;
  }, 0);

  return (
    <div>
      <PageHeader title="Wallet" crumbs={[{ label: "Account", href: "/account" }, { label: "Wallet" }]} />
      <div className="section-max section-pad py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 rounded-2xl border border-line bg-surface-card p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Current balance</p>
            <p className="mt-1 font-serif text-3xl text-ink">{money(balance)}</p>
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {rows.length === 0 && !error ? (
            <EmptyState title="No wallet activity yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-muted">
                    <th className="pb-3 pr-3">Date</th>
                    <th className="pb-3 pr-3">Type</th>
                    <th className="pb-3 pr-3">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const amt = Number(r.amount ?? 0);
                    const isNegative = r.type === "withdrawal" || r.type === "debit" || r.type === "payment" || amt < 0;
                    return (
                      <tr key={String(r.id)} className="border-b border-line/50 last:border-0">
                        <td className="py-3 pr-3 text-muted">{r.created_at || "—"}</td>
                        <td className="py-3 pr-3 capitalize">{r.type || "—"}</td>
                        <td className="py-3 pr-3 text-muted">{r.description || "—"}</td>
                        <td className={`py-3 text-right font-medium ${isNegative ? "text-red-700" : "text-green-700"}`}>
                          {isNegative ? `-${money(Math.abs(amt))}` : money(amt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
