import type { ApiEnvelope, Paginated } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const TOKEN_KEY = "ren_auth_token";
export const SESSION_TOKEN = "session";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function isSessionAuth(token?: string | null) {
  return (token ?? getStoredToken()) === SESSION_TOKEN;
}

/** Resolve request URL: session auth goes through Next.js BFF (same as backend website login). */
export function resolveApiUrl(path: string, token?: string | null) {
  if (isSessionAuth(token) && typeof window !== "undefined") {
    return `/api/backend${path.startsWith("/") ? path : `/${path}`}`;
  }
  if (!API_BASE) return null;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function unwrapData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

export function unwrapList<T>(json: unknown): T[] {
  const data = unwrapData<unknown>(json);
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.products)) return obj.products as T[];
  }
  return [];
}

export function unwrapPaginated<T>(json: unknown): Paginated<T> {
  if (json && typeof json === "object") {
    const root = json as Record<string, unknown>;
    if (Array.isArray(root.data)) {
      return json as Paginated<T>;
    }
    if (root.data && typeof root.data === "object") {
      const inner = root.data as Record<string, unknown>;
      if (Array.isArray(inner.data)) {
        return {
          data: inner.data as T[],
          meta: (inner.meta as Paginated<T>["meta"]) ?? (root.meta as Paginated<T>["meta"]),
        };
      }
    }
  }
  return { data: unwrapList<T>(json) };
}

export type ApiResult<T> =
  | { ok: true; data: T; raw: unknown }
  | { ok: false; error: string; status?: number; raw?: unknown };

type FetchOptions = {
  method?: string;
  body?: BodyInit | null;
  token?: string | null;
  revalidate?: number | false;
  headers?: HeadersInit;
  formData?: FormData;
  json?: unknown;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResult<T>> {
  const token = options.token === undefined ? getStoredToken() : options.token;
  const url = resolveApiUrl(path, token);

  if (!url) {
    return {
      ok: false,
      error: "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.",
    };
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body = options.body ?? null;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  } else if (options.formData) {
    body = options.formData;
  }

  // Bearer only for real API tokens — session auth uses httpOnly cookie via BFF
  if (token && token !== SESSION_TOKEN) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body,
      credentials: isSessionAuth(token) ? "same-origin" : "omit",
      ...(options.revalidate === false
        ? { cache: "no-store" as const }
        : typeof window === "undefined"
          ? { next: { revalidate: options.revalidate ?? 60 } }
          : { cache: "no-store" as const }),
    });

    const text = await res.text();
    let raw: unknown = null;
    try {
      raw = text ? JSON.parse(text) : null;
    } catch {
      raw = text;
    }

    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      if (raw && typeof raw === "object") {
        const obj = raw as {
          message?: unknown;
          error?: unknown;
          errors?: Record<string, string[] | string>;
        };
        const candidate = obj.message ?? obj.error;
        if (typeof candidate === "string" && candidate) message = candidate;
        if (obj.errors && typeof obj.errors === "object") {
          const details = Object.entries(obj.errors)
            .map(([key, val]) => {
              const text = Array.isArray(val) ? val.join(", ") : String(val);
              return `${key}: ${text}`;
            })
            .filter(Boolean);
          if (details.length) {
            message =
              message === "Validation failed." || message === "Validation failed"
                ? details.join(" · ")
                : `${message} (${details.join(" · ")})`;
          }
        }
      }
      return { ok: false, error: message, status: res.status, raw };
    }

    return { ok: true, data: raw as T, raw };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export function toQuery(params: Record<string, unknown | undefined | null>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    q.set(key, String(value));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path;
  return `${API_BASE.replace(/\/api\/?$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function money(
  value: number | string | null | undefined,
  currency = "L.E.",
) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return String(value ?? "");
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
}

type ProductMedia = {
  image?: string | null;
  thumbnail?: string | null;
  thumb_image?: string | null;
  images?: Array<string | { url?: string; path?: string }>;
};

export function productImage(product: ProductMedia) {
  const first = product.images?.[0];
  const fromGallery =
    typeof first === "string" ? first : first?.url || first?.path || null;
  return mediaUrl(
    product.thumb_image ||
      product.image ||
      product.thumbnail ||
      fromGallery,
  );
}

export function productPrice(product: {
  price?: number | string;
  final_price?: number | string | null;
  sale_price?: number | string | null;
  discount_price?: number | string | null;
}) {
  const base = Number(product.price ?? 0);
  const final = product.final_price != null ? Number(product.final_price) : null;
  const sale = product.sale_price ?? product.discount_price;
  const saleN = sale != null && sale !== "" ? Number(sale) : null;

  if (final != null && !Number.isNaN(final) && final > 0) {
    return {
      price: final,
      compareAt: final < base ? base : null,
    };
  }
  if (saleN != null && !Number.isNaN(saleN) && saleN > 0 && saleN < base) {
    return { price: saleN, compareAt: base };
  }
  return { price: base, compareAt: null as number | null };
}

export function defaultUnitId(product: {
  units?: Array<{ id?: number | string; is_default?: boolean; unit_id?: string | number }>;
}) {
  const units = product.units || [];
  const def = units.find((u) => u.is_default) || units[0];
  return def?.unit_id ?? def?.id ?? null;
}

function toNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Best-effort center point for a delivery zone (for address lat/lng). */
export function zoneCenter(zone: {
  latitude?: string | number | null;
  longitude?: string | number | null;
  center_lat?: string | number | null;
  center_lng?: string | number | null;
  polygon?: Array<
    | [number | string, number | string]
    | {
        lat?: number | string;
        lng?: number | string;
        latitude?: number | string;
        longitude?: number | string;
      }
  >;
  coordinates?: Array<[number | string, number | string]>;
}): { latitude: string; longitude: string } | null {
  const directLat = toNum(zone.center_lat ?? zone.latitude);
  const directLng = toNum(zone.center_lng ?? zone.longitude);
  if (directLat != null && directLng != null) {
    return { latitude: String(directLat), longitude: String(directLng) };
  }

  const ring = zone.polygon || zone.coordinates || [];
  const points: Array<[number, number]> = [];
  for (const p of ring) {
    if (Array.isArray(p) && p.length >= 2) {
      const a = toNum(p[0]);
      const b = toNum(p[1]);
      if (a == null || b == null) continue;
      // Heuristic: if first looks like lng (|val|>90), swap
      if (Math.abs(a) > 90 && Math.abs(b) <= 90) points.push([b, a]);
      else points.push([a, b]);
    } else if (p && typeof p === "object") {
      const obj = p as {
        lat?: number | string;
        lng?: number | string;
        latitude?: number | string;
        longitude?: number | string;
      };
      const lat = toNum(obj.lat ?? obj.latitude);
      const lng = toNum(obj.lng ?? obj.longitude);
      if (lat != null && lng != null) points.push([lat, lng]);
    }
  }
  if (points.length === 0) return null;
  const lat =
    points.reduce((s, [la]) => s + la, 0) / points.length;
  const lng =
    points.reduce((s, [, lo]) => s + lo, 0) / points.length;
  return { latitude: String(lat), longitude: String(lng) };
}
