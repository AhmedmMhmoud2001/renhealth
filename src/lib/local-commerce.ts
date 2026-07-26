/** Guest cart / wishlist persisted in localStorage until API auth is available. */

export type LocalCartItem = {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string | null;
  slug?: string;
};

export type LocalWishlistItem = {
  productId: string;
  name?: string;
  price?: number;
  image?: string | null;
  slug?: string;
};

const CART_KEY = "ren_local_cart";
const WISH_KEY = "ren_local_wishlist";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalCart(): LocalCartItem[] {
  return read<LocalCartItem[]>(CART_KEY, []);
}

export function setLocalCart(items: LocalCartItem[]) {
  write(CART_KEY, items);
}

export function addLocalCartItem(item: LocalCartItem): LocalCartItem[] {
  const items = getLocalCart();
  const idx = items.findIndex((i) => i.productId === String(item.productId));
  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      ...item,
      quantity: items[idx].quantity + item.quantity,
    };
  } else {
    items.push({ ...item, productId: String(item.productId) });
  }
  setLocalCart(items);
  return items;
}

export function updateLocalCartQty(productId: string | number, quantity: number) {
  const id = String(productId);
  let items = getLocalCart();
  if (quantity <= 0) items = items.filter((i) => i.productId !== id);
  else {
    items = items.map((i) => (i.productId === id ? { ...i, quantity } : i));
  }
  setLocalCart(items);
  return items;
}

export function removeLocalCartItem(productId: string | number) {
  const items = getLocalCart().filter((i) => i.productId !== String(productId));
  setLocalCart(items);
  return items;
}

export function clearLocalCart() {
  setLocalCart([]);
}

/** Normalize legacy string[] wishlist to object items */
export function getLocalWishlist(): LocalWishlistItem[] {
  const raw = read<unknown>(WISH_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    if (typeof entry === "string" || typeof entry === "number") {
      return { productId: String(entry) };
    }
    const item = entry as LocalWishlistItem;
    return { ...item, productId: String(item.productId) };
  });
}

export function getLocalWishlistIds(): string[] {
  return getLocalWishlist().map((i) => i.productId);
}

export function setLocalWishlist(items: LocalWishlistItem[] | string[]) {
  const normalized: LocalWishlistItem[] = items.map((entry) =>
    typeof entry === "string" || typeof entry === "number"
      ? { productId: String(entry) }
      : { ...entry, productId: String(entry.productId) },
  );
  write(WISH_KEY, normalized);
}

export function toggleLocalWishlist(
  productId: string | number,
  meta?: Omit<LocalWishlistItem, "productId">,
) {
  const id = String(productId);
  const items = getLocalWishlist();
  const exists = items.some((i) => i.productId === id);
  const next = exists
    ? items.filter((i) => i.productId !== id)
    : [...items, { productId: id, ...meta }];
  setLocalWishlist(next);
  return { items: next, ids: next.map((i) => i.productId), active: !exists };
}

export function isLocalWishlisted(productId: string | number) {
  return getLocalWishlistIds().includes(String(productId));
}
