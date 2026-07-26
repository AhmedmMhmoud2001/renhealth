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
  productImage,
  productPrice,
  unwrapList,
  type Product,
} from "@/lib/api";
import {
  getLocalWishlist,
  getLocalWishlistIds,
  setLocalWishlist,
  toggleLocalWishlist,
  type LocalWishlistItem,
} from "@/lib/local-commerce";
import { useAuth } from "./AuthProvider";
import { toast } from "@/components/ui/Toast";

type WishlistContextValue = {
  ids: string[];
  localItems: LocalWishlistItem[];
  products: Product[];
  loading: boolean;
  isWishlisted: (productId: string | number) => boolean;
  toggle: (
    product: Product | string | number,
  ) => Promise<{ ok: boolean; active: boolean; error?: string }>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [localItems, setLocalItems] = useState<LocalWishlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const local = getLocalWishlist();
    setLocalItems(local);

    if (!token) {
      setIds(getLocalWishlistIds());
      setProducts([]);
      return;
    }

    setLoading(true);
    const res = await api.wishlist();
    if (res.ok) {
      const list = unwrapList<Product>(res.data);
      const remote = list.map((p) => String(p.id));
      for (const item of local) {
        if (!remote.includes(item.productId)) {
          await api.toggleWishlist(item.productId);
          remote.push(item.productId);
        }
      }
      setLocalWishlist([]);
      setLocalItems([]);
      const again = await api.wishlist();
      const finalList = again.ok ? unwrapList<Product>(again.data) : list;
      setProducts(finalList);
      setIds(finalList.map((p) => String(p.id)));
    } else {
      setIds(local.map((i) => i.productId));
      setProducts([]);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isWishlisted = useCallback(
    (productId: string | number) => ids.includes(String(productId)),
    [ids],
  );

  const toggle = useCallback(
    async (productOrId: Product | string | number) => {
      const product =
        typeof productOrId === "object" ? productOrId : null;
      const id = String(product ? product.id : productOrId);

      if (token) {
        const res = await api.toggleWishlist(id);
        if (res.ok) {
          const active = !ids.includes(id);
          setIds((prev) =>
            active ? [...prev, id] : prev.filter((x) => x !== id),
          );
          if (active && product) {
            setProducts((prev) =>
              prev.some((p) => String(p.id) === id) ? prev : [...prev, product],
            );
          } else if (!active) {
            setProducts((prev) => prev.filter((p) => String(p.id) !== id));
          }
          toast(active ? "Added to wishlist" : "Removed from wishlist");
          return { ok: true, active };
        }
      }

      const meta = product
        ? {
            name: product.name,
            price: productPrice(product).price,
            image: productImage(product),
            slug: product.slug,
          }
        : undefined;
      const result = toggleLocalWishlist(id, meta);
      setIds(result.ids);
      setLocalItems(result.items);
      toast(result.active ? "Added to wishlist" : "Removed from wishlist");
      return { ok: true, active: result.active };
    },
    [token, ids],
  );

  const value = useMemo(
    () => ({
      ids,
      localItems,
      products,
      loading,
      isWishlisted,
      toggle,
      refresh,
    }),
    [ids, localItems, products, loading, isWishlisted, toggle, refresh],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
