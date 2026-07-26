"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, unwrapList, type Address, type DeliveryZone } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddressForm } from "@/components/commerce/AddressForm";
import { toast } from "@/components/ui/Toast";

export default function AddressesPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "", city: "", state: "" });
  const [editPending, setEditPending] = useState(false);

  const load = useCallback(async () => {
    const [aRes, zRes] = await Promise.all([api.addresses(), api.zones()]);
    if (!aRes.ok) {
      setError(aRes.error);
    } else {
      setError(null);
      setAddresses(unwrapList<Address>(aRes.data));
    }
    if (zRes.ok) setZones(unwrapList<DeliveryZone>(zRes.data));
  }, []);

  useEffect(() => {
    if (token) void load();
  }, [token, load]);

  if (!token) {
    return (
      <div>
        <PageHeader title="Addresses" />
        <div className="section-max section-pad py-12">
          <EmptyState
            title="Sign in"
            actionHref="/login?next=/account/addresses"
            actionLabel="Sign in"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Addresses"
        subtitle={
          zones.length === 0
            ? "Delivery zones are not configured yet"
            : `${zones.length} delivery area${zones.length === 1 ? "" : "s"} available`
        }
        crumbs={[
          { label: "Account", href: "/account" },
          { label: "Addresses" },
        ]}
      />
      <div className="section-max section-pad grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-3">
          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {zones.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
              <p className="font-medium">Available areas: None</p>
              <p className="mt-2 text-amber-900/85">
                Backend <code className="text-xs">GET /api/v1/zones</code> currently
                returns an empty list. Without at least one active delivery zone,
                the API rejects every new address — so checkout cannot continue.
              </p>
              <p className="mt-2 text-amber-900/85">
                Fix in the REN Health admin dashboard: create a zone polygon that
                covers your customers (the Main Branch is set to Nasr City, Cairo).
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface-card p-5 text-sm">
              <p className="font-medium text-ink">Available delivery areas</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                {zones.map((z) => (
                  <li key={String(z.id)}>{z.name}</li>
                ))}
              </ul>
            </div>
          )}

          {addresses.length === 0 ? (
            <p className="text-sm text-muted">No saved addresses yet.</p>
          ) : (
            addresses.map((a) => (
              <div
                key={String(a.id)}
                className="rounded-2xl border border-line bg-surface-card p-5"
              >
                {editingId === String(a.id) ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setEditPending(true);
                      const res = await api.updateAddress(a.id, editForm);
                      setEditPending(false);
                      if (!res.ok) { toast(res.error || "Update failed", "err"); return; }
                      toast("Address updated");
                      setEditingId(null);
                      void load();
                    }}
                    className="space-y-3"
                  >
                    {(["name", "phone", "address", "city", "state"] as const).map((field) => (
                      <label key={field} className="block text-sm">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                        <input
                          required
                          value={editForm[field]}
                          onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                          className="mt-1 w-full rounded-md border border-line px-3 py-2"
                        />
                      </label>
                    ))}
                    <div className="flex gap-2">
                      <button type="submit" disabled={editPending} className="rounded-md bg-ink px-4 py-2 text-xs text-white disabled:opacity-60">
                        {editPending ? "Saving…" : "Save"}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-md border border-line px-4 py-2 text-xs">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {a.address}
                        {a.city ? `, ${a.city}` : ""}
                      </p>
                      {a.phone ? (
                        <p className="mt-1 text-sm text-muted">{a.phone}</p>
                      ) : null}
                      {a.in_delivery_zone === false ? (
                        <p className="mt-2 text-xs text-red-700">Outside delivery zone</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="text-xs uppercase tracking-[0.12em] text-gold hover:text-ink"
                        onClick={() => {
                          setEditingId(String(a.id));
                          setEditForm({ name: a.name, phone: a.phone || "", address: a.address, city: a.city || "", state: a.state || "" });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs uppercase tracking-[0.12em] text-muted hover:text-ink"
                        onClick={() => void api.deleteAddress(a.id).then(load)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <p className="pt-2 text-xs text-muted">
            Need checkout?{" "}
            <Link href="/checkout" className="text-gold">
              Continue to checkout
            </Link>
          </p>
        </div>

        <AddressForm onSaved={() => void load()} />
      </div>
    </div>
  );
}
