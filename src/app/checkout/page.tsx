"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  apiFetch,
  money,
  productImage,
  unwrapList,
  type Address,
  type DeliveryZone,
} from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddressForm } from "@/components/commerce/AddressForm";

const SHIPPING_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function defaultShippingDay() {
  // Prefer tomorrow so the chosen day is upcoming
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return SHIPPING_DAYS[tomorrow.getDay()];
}

export default function CheckoutPage() {
  const { token } = useAuth();
  const { cart, items, itemsSubtotal, refresh, isLocal, offerPriceMap } = useCart();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [shippingDay, setShippingDay] = useState(defaultShippingDay);
  const [fastShipping, setFastShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const orderTotal = useMemo(() => {
    const fromCart = Number(cart?.total ?? cart?.subtotal ?? NaN);
    // Use offer prices when available
    const offerSubtotal = items.reduce((sum, item) => {
      const pid = String(item.product_id ?? item.product?.id ?? "");
      const offer = offerPriceMap[pid];
      const unit = offer?.discounted ?? Number(item.price ?? item.product?.price ?? 0);
      return sum + unit * Number(item.quantity ?? 1);
    }, 0);
    if (offerSubtotal > 0) return offerSubtotal;
    if (Number.isFinite(fromCart) && fromCart > 0) return fromCart;
    return itemsSubtotal;
  }, [cart, itemsSubtotal, items, offerPriceMap]);

  const loadAddresses = useCallback(async () => {
    const [aRes, zRes] = await Promise.all([api.addresses(), api.zones()]);
    if (zRes.ok) setZones(unwrapList<DeliveryZone>(zRes.data));
    if (aRes.ok) {
      const list = unwrapList<Address>(aRes.data);
      setAddresses(list);
      const def = list.find((a) => a.is_default) || list[0];
      if (def) setAddressId(String(def.id));
      setShowForm(list.length === 0);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    void loadAddresses();
    void refresh();
  }, [token, loadAddresses, refresh]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!addressId) {
      setError("Please select an address");
      return;
    }
    if (!shippingDay) {
      setError("Please choose a delivery day");
      return;
    }
    if (isLocal) {
      setError(
        "Cart is saved on this device only. Add items again while signed in so they sync to the server cart before placing the order.",
      );
      return;
    }
    if (paymentMethod === "online" && !proofFile) {
      setError("Please upload payment proof screenshot");
      return;
    }
    setPending(true);
    setError(null);

    if (paymentMethod === "online" && proofFile) {
      const fd = new FormData();
      fd.append("address_id", addressId);
      fd.append("shipping_day", shippingDay);
      fd.append("payment_method", "online");
      fd.append("notes", notes);
      fd.append("is_fast_shipping", String(fastShipping));
      fd.append("use_wallet", "false");
      fd.append("payment_proof", proofFile);
      fd.append("item_notes", JSON.stringify([]));
      const offerCode = Object.values(offerPriceMap).find((o) => o.code)?.code;
      if (offerCode) fd.append("offer_code", offerCode);
      const res = await apiFetch("/api/v1/orders", { method: "POST", formData: fd });
      setPending(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      await refresh();
      router.push("/account/orders");
      return;
    }

    const res = await api.checkout({
      address_id: addressId,
      shipping_day: shippingDay,
      payment_method: paymentMethod,
      notes,
      is_fast_shipping: fastShipping,
      use_wallet: paymentMethod === "wallet",
      offer_code: Object.values(offerPriceMap).find((o) => o.code)?.code ?? null,
      item_notes: [],
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await refresh();
    router.push("/account/orders");
  }

  if (!token) {
    return (
      <div>
        <PageHeader title="Checkout" />
        <div className="section-max section-pad py-12">
          <EmptyState
            title="Sign in to checkout"
            actionHref="/login?next=/checkout"
            actionLabel="Sign in"
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Checkout" />
        <div className="section-max section-pad py-12">
          <EmptyState title="Cart is empty" actionHref="/shop" actionLabel="Shop" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Checkout"
        subtitle="Secure payment and delivery."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <form
        onSubmit={onSubmit}
        className="section-max section-pad grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-8">
          {zones.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
              <p className="font-medium">Available areas: None</p>
              <p className="mt-2 text-amber-900/85">
                No delivery zones are active on the backend, so addresses cannot be
                saved and orders cannot be placed. Ask admin to add a zone covering
                your city (Main Branch is Nasr City, Cairo).
              </p>
            </div>
          ) : null}

          {isLocal ? (
            <div className="rounded-2xl border border-line bg-surface-muted p-5 text-sm text-ink-soft">
              Showing your device cart. For checkout to succeed, items must sync to
              the server cart after sign-in. You can still review products below.
            </div>
          ) : null}

          <section className="rounded-2xl border border-line bg-surface-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl">Order items</h2>
              <Link
                href="/cart"
                className="text-xs uppercase tracking-[0.14em] text-gold"
              >
                Edit cart
              </Link>
            </div>
            <ul className="mt-5 space-y-4">
              {items.map((item) => {
                const product = item.product;
                const img = product ? productImage(product) : null;
                const name =
                  product?.name || `Product #${item.product_id || item.id}`;
                const pid = String(item.product_id ?? product?.id ?? "");
                const offer = offerPriceMap[pid];
                const qty = Number(item.quantity ?? 1);
                const unit = offer?.discounted ?? Number(
                  item.price ??
                    product?.final_price ??
                    product?.price ??
                    0,
                );
                return (
                  <li
                    key={String(item.id)}
                    className="flex gap-3 border-b border-line/70 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      {img ? (
                        <Image
                          src={img}
                          alt={name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{name}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="text-muted">{qty} × {money(unit)}</span>
                        {offer && offer.original !== offer.discounted ? (
                          <span className="text-xs text-muted line-through">{money(offer.original)}</span>
                        ) : null}
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-ink">
                      {money(unit * qty)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-surface-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl">Delivery address</h2>
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="text-xs uppercase tracking-[0.14em] text-gold"
              >
                {showForm ? "Hide form" : "Add address"}
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No saved addresses.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((a) => (
                  <label
                    key={String(a.id)}
                    className="flex cursor-pointer gap-3 rounded-xl border border-line p-4"
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === String(a.id)}
                      onChange={() => setAddressId(String(a.id))}
                    />
                    <span>
                      <span className="block font-medium">{a.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {a.address}
                        {a.city ? `, ${a.city}` : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {showForm ? (
              <div className="mt-5">
                <AddressForm
                  compact
                  embedded
                  onSaved={() => {
                    void loadAddresses();
                    setShowForm(false);
                  }}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-line bg-surface-card p-6">
            <h2 className="font-serif text-xl">Delivery day</h2>
            <p className="mt-1 text-sm text-muted">
              Required by the store for zone-based shipping.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SHIPPING_DAYS.map((day) => (
                <label
                  key={day}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm capitalize transition ${
                    shippingDay === day
                      ? "border-gold bg-gold/10 text-ink"
                      : "border-line text-muted hover:border-gold/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping_day"
                    className="sr-only"
                    checked={shippingDay === day}
                    onChange={() => setShippingDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fastShipping}
                onChange={(e) => setFastShipping(e.target.checked)}
              />
              Fast shipping
            </label>
          </section>

            <section className="rounded-2xl border border-line bg-surface-card p-6">
            <h2 className="font-serif text-xl">Payment</h2>
            <div className="mt-4 space-y-2 text-sm">
              {(
                [
                  ["cash_on_delivery", "Cash on delivery"],
                  ["wallet", "Wallet"],
                  ["online", "Online (card / wallet)"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {paymentMethod === "online" ? (
              <label className="mt-4 block text-sm">
                Payment proof screenshot
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                  className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted">Upload a screenshot of your bank transfer or card payment.</p>
              </label>
            ) : null}
            <label className="mt-5 block text-sm">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 w-full rounded-md border border-line p-3"
                rows={3}
              />
            </label>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface-card p-6">
          <h2 className="font-serif text-xl">Order total</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">
                Subtotal ({items.length} item{items.length === 1 ? "" : "s"})
              </dt>
              <dd>{money(itemsSubtotal || orderTotal)}</dd>
            </div>
            {cart?.shipping != null && Number(cart.shipping) > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{money(cart.shipping)}</dd>
              </div>
            ) : null}
            {cart?.discount != null && Number(cart.discount) > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted">Discount</dt>
                <dd>-{money(cart.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd className="text-2xl">{money(orderTotal)}</dd>
            </div>
          </dl>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={
              pending ||
              !addressId ||
              !shippingDay ||
              zones.length === 0 ||
              isLocal
            }
            className="mt-6 w-full rounded-md bg-ink py-3.5 text-xs tracking-[0.18em] uppercase text-white disabled:opacity-50"
          >
            {pending ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            <Link href="/account/addresses" className="text-gold">
              Manage addresses
            </Link>
          </p>
        </aside>
      </form>
    </div>
  );
}
