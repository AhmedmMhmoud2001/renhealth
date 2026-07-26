"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  api,
  unwrapList,
  zoneCenter,
  type Address,
  type Branch,
  type DeliveryZone,
} from "@/lib/api";
import { toast } from "@/components/ui/Toast";

type AddressFormProps = {
  onSaved?: (address?: Address) => void;
  compact?: boolean;
  /** When true, render fields without a <form> (for nesting inside checkout). */
  embedded?: boolean;
};

const FALLBACK = {
  latitude: "30.06857688631472",
  longitude: "31.336199295502478",
  city: "Cairo",
  state: "Nasr City",
};

export function AddressForm({ onSaved, compact, embedded }: AddressFormProps) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zonesLoaded, setZonesLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "Home",
    phone: "",
    address: "",
    city: FALLBACK.city,
    state: FALLBACK.state,
    latitude: FALLBACK.latitude,
    longitude: FALLBACK.longitude,
    is_default: 1 as number,
    zone_id: "" as string,
  });

  useEffect(() => {
    void (async () => {
      const [zRes, bRes] = await Promise.all([api.zones(), api.branches()]);
      const list = zRes.ok ? unwrapList<DeliveryZone>(zRes.data) : [];
      setZones(list);
      setZonesLoaded(true);

      if (list.length > 0) {
        const first = list[0];
        const center = zoneCenter(first);
        setForm((f) => ({
          ...f,
          zone_id: String(first.id),
          latitude: center?.latitude ?? f.latitude,
          longitude: center?.longitude ?? f.longitude,
          city: first.name || f.city,
          state: first.name || f.state,
        }));
        return;
      }

      if (bRes.ok) {
        const branches = unwrapList<Branch>(bRes.data);
        const main = branches[0];
        if (main?.latitude && main?.longitude) {
          setForm((f) => ({
            ...f,
            latitude: String(main.latitude),
            longitude: String(main.longitude),
            city: f.city || "Cairo",
            address: f.address || main.address || "",
          }));
        }
      }
    })();
  }, []);

  function selectZone(zoneId: string) {
    const zone = zones.find((z) => String(z.id) === zoneId);
    if (!zone) {
      setForm((f) => ({ ...f, zone_id: zoneId }));
      return;
    }
    const center = zoneCenter(zone);
    setForm((f) => ({
      ...f,
      zone_id: zoneId,
      latitude: center?.latitude ?? f.latitude,
      longitude: center?.longitude ?? f.longitude,
      state: zone.name || f.state,
      city: f.city || zone.name,
    }));
  }

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (zonesLoaded && zones.length === 0) {
      setError(
        "No delivery zones are configured on the store yet. Ask admin to add an active zone in the dashboard — until then addresses cannot be saved.",
      );
      return;
    }

    setPending(true);
    setError(null);

    const body: Record<string, unknown> = {
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      latitude: form.latitude,
      longitude: form.longitude,
      is_default: form.is_default,
    };
    if (form.zone_id) body.zone_id = form.zone_id;

    const res = await api.createAddress(body);
    setPending(false);

    if (!res.ok) {
      setError(res.error);
      toast(res.error || "Could not save address", "err");
      return;
    }

    toast("Address saved");
    setForm((f) => ({
      ...f,
      address: "",
      phone: f.phone,
    }));
    onSaved?.(undefined);
  }

  const noZones = zonesLoaded && zones.length === 0;

  const fields = (
    <>
      <h2 className="font-serif text-xl">Add address</h2>

      {noZones ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Delivery areas: None</p>
          <p className="mt-1 text-amber-900/80">
            The API returned zero active zones (<code className="text-xs">/api/v1/zones</code>).
            Addresses must sit inside a zone, so saving will keep failing until an admin
            creates a delivery zone (e.g. covering Nasr City / Cairo near the Main Branch).
          </p>
        </div>
      ) : null}

      {zones.length > 0 ? (
        <label className="block text-sm">
          Delivery area
          <select
            value={form.zone_id}
            onChange={(e) => selectZone(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2"
            required
          >
            {zones.map((z) => (
              <option key={String(z.id)} value={String(z.id)}>
                {z.name}
                {z.delivery_fees != null || z.delivery_fee != null
                  ? ` — fee ${z.delivery_fees ?? z.delivery_fee}`
                  : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {(
        [
          ["name", "Label"],
          ["phone", "Phone"],
          ["address", "Street address"],
          ["city", "City"],
          ["state", "Area / district"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          {label}
          <input
            required={key === "name" || key === "address" || key === "phone"}
            value={String(form[key])}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2"
            placeholder={
              key === "address" ? "Street, building, floor…" : undefined
            }
          />
        </label>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          Latitude
          <input
            required
            value={form.latitude}
            onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="block text-sm">
          Longitude
          <input
            required
            value={form.longitude}
            onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2 font-mono text-xs"
          />
        </label>
      </div>
      <p className="text-xs text-muted">
        Pin must fall inside an active delivery zone. Defaults follow the Main Branch
        (Nasr City, Cairo) from the store API.
      </p>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type={embedded ? "button" : "submit"}
        onClick={embedded ? () => void onSubmit() : undefined}
        disabled={pending || noZones}
        className="w-full rounded-md bg-ink py-3 text-xs tracking-[0.18em] uppercase text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : noZones ? "Zones required first" : "Save address"}
      </button>
    </>
  );

  const shellClass = `space-y-3 rounded-2xl border border-line bg-surface-card ${compact ? "p-5" : "p-6"}`;

  if (embedded) {
    return <div className={shellClass}>{fields}</div>;
  }

  return (
    <form onSubmit={onSubmit} className={shellClass}>
      {fields}
    </form>
  );
}
