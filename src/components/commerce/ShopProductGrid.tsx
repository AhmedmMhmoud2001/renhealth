"use client";

import { useMemo } from "react";
import type { Product } from "@/lib/api";
import { ProductCard } from "@/components/commerce/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWishlist } from "@/providers/WishlistProvider";

type Props = {
  products: Product[];
  wishlisted?: string;
  search?: string;
  apiMissing: boolean;
  offerPriceMap?: Record<string, { discounted: number; original: number }>;
};

export function ShopProductGrid({ products, wishlisted, search, apiMissing, offerPriceMap }: Props) {
  const { ids } = useWishlist();

  const visible = useMemo(() => {
    if (wishlisted !== "1") return products;
    return products.filter((p) => ids.includes(String(p.id)));
  }, [products, wishlisted, ids]);

  if (visible.length === 0) {
    return (
      <EmptyState
        title="No products found"
        body={
          apiMissing
            ? "Connect the API base URL to load catalog data from the backend."
            : wishlisted === "1"
              ? "You haven't added any products to your wishlist yet."
              : 'Try another search or category.'
        }
        actionHref="/shop"
        actionLabel="Clear filters"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map((product) => (
        <ProductCard key={String(product.id)} product={product} offerPrice={offerPriceMap?.[String(product.id)]} />
      ))}
    </div>
  );
}
