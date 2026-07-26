"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  api,
  fetchCart,
  unwrapData,
  unwrapList,
  type Cart,
  type CartItem,
  type Product,
  type Offer,
  productImage,
  productPrice,
  defaultUnitId,
} from "@/lib/api";
import {
  addLocalCartItem,
  clearLocalCart,
  getLocalCart,
  removeLocalCartItem,
  setLocalCart,
  updateLocalCartQty,
  type LocalCartItem,
} from "@/lib/local-commerce";
import { useAuth } from "./AuthProvider";
import { toast } from "@/components/ui/Toast";

export type OfferPriceMap = Record<string, { discounted: number; original: number; code?: string }>;

type CartContextValue = {
  cart: Cart | null;
  items: CartItem[];
  itemsSubtotal: number;
  count: number;
  loading: boolean;
  isLocal: boolean;
  offerPriceMap: OfferPriceMap;
  refresh: () => Promise<void>;
  addItem: (
    product: Product | string | number,
    quantity?: number,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateQty: (
    productId: string | number,
    quantity: number,
  ) => Promise<{ ok: boolean; error?: string }>;
  removeItem: (
    productId: string | number,
  ) => Promise<{ ok: boolean; error?: string }>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; error?: string }>;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeItems(cart: Cart | null): CartItem[] {
  if (!cart) return [];
  if (Array.isArray(cart.items)) return cart.items;
  if (Array.isArray(cart.products)) return cart.products;
  if (Array.isArray(cart.data)) return cart.data as CartItem[];
  return unwrapList<CartItem>(cart);
}

function localAsCartItems(local: LocalCartItem[]): CartItem[] {
  return local.map((item) => ({
    id: `local-${item.productId}`,
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
    product: {
      id: item.productId,
      name: item.name || `Product #${item.productId}`,
      slug: item.slug,
      price: item.price ?? 0,
      thumb_image: item.image,
      image: item.image,
    },
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocal, setIsLocal] = useState(true);
  const [offerPriceMap, setOfferPriceMap] = useState<OfferPriceMap>({});

  const refresh = useCallback(async () => {
    const local = getLocalCart();
    setLocalItems(local);

    // Fetch offers (works for both logged-in and anonymous)
    const offersRes = await api.offers();
    if (offersRes.ok) {
      const offerItems = unwrapList<Offer>(offersRes.data);
      const map: OfferPriceMap = {};
      for (const o of offerItems) {
        const pid = o.offerable?.id;
        if (pid != null && o.total_price_after != null) {
          map[String(pid)] = {
            discounted: Number(o.total_price_after),
            original: Number(o.total_price_before ?? o.total_price_after ?? 0),
            code: typeof (o as any).code === "string" ? (o as any).code : undefined,
          };
        }
      }
      setOfferPriceMap(map);
    }

    if (!token) {
      setCart(null);
      setIsLocal(true);
      return;
    }

    setLoading(true);
    const res = await fetchCart();
    if (res.ok && res.cart) {
      const remoteItems = normalizeItems(res.cart);
      setCart(res.cart);

      if (local.length > 0) {
        const remaining: LocalCartItem[] = [];
        for (const item of local) {
          const sync = await api.addToCart(item.productId, {
            quantity: item.quantity,
          });
          if (!sync.ok) remaining.push(item);
        }
        if (remaining.length === 0) {
          clearLocalCart();
          setLocalItems([]);
          setIsLocal(false);
        } else {
          setLocalCart(remaining);
          setLocalItems(remaining);
          setIsLocal(true);
        }
        const again = await fetchCart();
        if (again.ok && again.cart) setCart(again.cart);
      } else {
        setIsLocal(remoteItems.length === 0);
      }
    } else {
      setCart(null);
      setIsLocal(true);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productOrId: Product | string | number, quantity = 1) => {
      const product: Product | null =
        typeof productOrId === "object" ? productOrId : null;
      const productId: string | number = product
        ? product.id
        : (productOrId as string | number);
      const unitId = product ? defaultUnitId(product) : null;
      const { price } = product
        ? productPrice(product)
        : { price: 0 };

      // Try API first when logged in
      if (token) {
        const payload: {
          quantity: number;
          unit_id?: string | number | null;
        } = { quantity };
        if (unitId != null) payload.unit_id = unitId;

        const res = await api.addToCart(productId, payload);
        if (res.ok) {
          const next = unwrapData<Cart>(res.data);
          if (next && typeof next === "object" && (next.items || next.products || next.data)) {
            setCart(next);
            setIsLocal(false);
          } else {
            await refresh();
          }
          toast("Added to cart");
          return { ok: true };
        }
        // Fall through to local if API rejects (e.g. session without API auth)
      }

      const next = addLocalCartItem({
        productId: String(productId),
        quantity,
        name: product?.name,
        price,
        image: product ? productImage(product) : null,
        slug: product?.slug,
      });
      setLocalItems(next);
      setIsLocal(true);
      toast(token ? "Saved to cart" : "Added to cart");
      return { ok: true };
    },
    [token, refresh],
  );

  const updateQty = useCallback(
    async (productId: string | number, quantity: number) => {
      if (token && !isLocal) {
        const res = await api.updateCartItem(productId, { quantity });
        if (res.ok) {
          await refresh();
          return { ok: true };
        }
      }
      setLocalItems(updateLocalCartQty(productId, quantity));
      setIsLocal(true);
      return { ok: true };
    },
    [token, isLocal, refresh],
  );

  const removeItem = useCallback(
    async (productId: string | number) => {
      if (token && !isLocal) {
        const res = await api.removeFromCart(productId);
        if (res.ok) {
          await refresh();
          toast("Removed from cart");
          return { ok: true };
        }
      }
      setLocalItems(removeLocalCartItem(productId));
      setIsLocal(true);
      toast("Removed from cart");
      return { ok: true };
    },
    [token, isLocal, refresh],
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!token || isLocal) {
        return { ok: false, error: "Sign in to apply coupons" };
      }
      const res = await api.applyCoupon(code);
      if (!res.ok) return { ok: false, error: res.error };
      await refresh();
      toast("Coupon applied");
      return { ok: true };
    },
    [token, isLocal, refresh],
  );

  const apiItems = normalizeItems(cart);
  const localAsItems = localAsCartItems(localItems);
  // Prefer API cart when it has lines; otherwise keep showing local lines
  const items =
    !isLocal && apiItems.length > 0
      ? apiItems
      : localAsItems.length > 0
        ? localAsItems
        : apiItems;

  const itemsSubtotal = items.reduce((sum, item) => {
    const unit = Number(item.price ?? item.product?.final_price ?? item.product?.price ?? 0);
    return sum + unit * Number(item.quantity ?? 1);
  }, 0);

  const count = items.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);

  const value = useMemo(
    () => ({
      cart,
      items,
      itemsSubtotal,
      count,
      loading,
      isLocal,
      offerPriceMap,
      refresh,
      addItem,
      updateQty,
      removeItem,
      applyCoupon,
    }),
    [
      cart,
      items,
      itemsSubtotal,
      count,
      loading,
      isLocal,
      offerPriceMap,
      refresh,
      addItem,
      updateQty,
      removeItem,
      applyCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
