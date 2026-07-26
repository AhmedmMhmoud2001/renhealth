import { api, money, unwrapList, type Coupon, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiBanner } from "@/components/ui/ApiBanner";

export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const res = await api.coupons();
  const coupons = res.ok ? unwrapList<Coupon>(res.data) : [];

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Available discount codes for your orders."
        crumbs={[{ label: "Home", href: "/" }, { label: "Coupons" }]}
      />
      {!API_BASE ? <ApiBanner message="Set NEXT_PUBLIC_API_BASE_URL to load coupons." /> : null}
      <div className="section-max section-pad py-12">
        {coupons.length === 0 ? (
          <EmptyState title="No coupons available" body="Check back later for new offers." />
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {coupons.map((c) => (
              <div key={String(c.id)} className="rounded-2xl border border-line bg-surface-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg tracking-wider text-gold">{c.code}</p>
                    {c.discount ? (
                      <p className="mt-1 text-sm text-ink">
                        {c.discount_type === "percentage"
                          ? `${c.discount}% off`
                          : money(c.discount)}
                      </p>
                    ) : null}
                    {c.min_order_total ? (
                      <p className="mt-1 text-xs text-muted">Min. order: {money(c.min_order_total)}</p>
                    ) : null}
                    {c.expires_at ? (
                      <p className="mt-1 text-xs text-muted">Expires: {c.expires_at}</p>
                    ) : null}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs capitalize ${
                    c.is_active ? "bg-green-50 text-green-800" : "bg-surface-muted text-muted"
                  }`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
