"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { money, productImage } from "@/lib/api";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const {
    items,
    cart,
    loading,
    updateQty,
    removeItem,
    applyCoupon,
    count,
    isLocal,
    offerPriceMap,
  } = useCart();
  const { token } = useAuth();
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const localSubtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => {
          const pid = String(item.product_id ?? item.product?.id ?? "");
          const offer = offerPriceMap[pid];
          const unit = offer?.discounted ?? Number(item.price ?? item.product?.price ?? 0);
          return sum + unit * Number(item.quantity ?? 1);
        },
        0,
      ),
    [items, offerPriceMap],
  );

  async function onCoupon(e: FormEvent) {
    e.preventDefault();
    const res = await applyCoupon(coupon.trim());
    setMsg(res.ok ? "Coupon applied" : res.error || "Failed");
  }

  return (
    <div>
      <PageHeader
        title="Your Cart"
        subtitle={loading ? "Updating…" : `${count} item${count === 1 ? "" : "s"}`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
      />

      <div className="section-max section-pad py-12">
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            body="Discover Swedish formulas crafted for better daily health."
            actionHref="/shop"
            actionLabel="Continue shopping"
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.product;
                const img = product ? productImage(product) : null;
                const name = product?.name || `Product #${item.product_id || item.id}`;
                const pid = item.product_id || product?.id || item.id;
                const offer = offerPriceMap[String(pid)];
                const displayPrice = offer?.discounted ?? item.price ?? product?.price;
                return (
                  <div
                    key={String(item.id)}
                    className="flex gap-4 rounded-2xl border border-line bg-surface-card p-4"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                      {img ? (
                        <Image src={img} alt={name} fill className="object-contain p-2" sizes="96px" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${product?.slug || pid}`}
                        className="font-serif text-lg text-ink"
                      >
                        {name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm font-medium text-ink">{money(displayPrice)}</p>
                        {offer && offer.original !== offer.discounted ? (
                          <p className="text-xs text-muted line-through">{money(offer.original)}</p>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          Qty
                          <input
                            type="number"
                            min={1}
                            defaultValue={item.quantity}
                            className="w-16 rounded-md border border-line bg-white px-2 py-1"
                            onBlur={(e) => {
                              const q = Number(e.target.value);
                              if (q >= 1) void updateQty(pid, q);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="text-xs tracking-[0.14em] uppercase text-muted hover:text-ink"
                          onClick={() => void removeItem(pid)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-line bg-surface-card p-6">
              <h2 className="font-serif text-xl text-ink">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>
                    {money(
                      !isLocal
                        ? (cart?.subtotal ?? cart?.total ?? localSubtotal)
                        : localSubtotal,
                    )}
                  </dd>
                </div>
                {!isLocal && cart?.discount ? (
                  <div className="flex justify-between">
                    <dt className="text-muted">Discount</dt>
                    <dd>-{money(cart.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                  <dt>Total</dt>
                  <dd>
                    {money(
                      !isLocal
                        ? (cart?.total ?? cart?.subtotal ?? localSubtotal)
                        : localSubtotal,
                    )}
                  </dd>
                </div>
              </dl>

              {!isLocal && token ? (
                <form onSubmit={onCoupon} className="mt-5 flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 rounded-md border border-line px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-beige px-3 py-2 text-xs tracking-[0.12em] uppercase"
                  >
                    Apply
                  </button>
                </form>
              ) : null}
              {msg ? <p className="mt-2 text-xs text-muted">{msg}</p> : null}

              {token ? (
                <Link
                  href="/checkout"
                  className="mt-6 flex items-center justify-center rounded-md bg-ink px-5 py-3.5 text-xs tracking-[0.18em] uppercase text-white"
                >
                  Checkout
                </Link>
              ) : (
                <Link
                  href="/login?next=/checkout"
                  className="mt-6 flex items-center justify-center rounded-md bg-ink px-5 py-3.5 text-xs tracking-[0.18em] uppercase text-white"
                >
                  Sign in to checkout
                </Link>
              )}
              {isLocal ? (
                <p className="mt-3 text-center text-xs text-muted">
                  Cart is saved on this device. Sign in to sync and checkout.
                </p>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
