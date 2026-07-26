"use client";

import { useMemo } from "react";
import { type Product } from "@/lib/api";
import { ProductCard } from "@/components/commerce/ProductCard";
import { useWishlist } from "@/providers/WishlistProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WishlistPage() {
  const { products, localItems, ids, loading } = useWishlist();

  const displayProducts = useMemo(() => {
    if (products.length > 0) return products;
    return localItems.map(
      (item): Product => ({
        id: item.productId,
        name: item.name || `Product #${item.productId}`,
        slug: item.slug,
        price: item.price ?? 0,
        thumb_image: item.image,
        image: item.image,
      }),
    );
  }, [products, localItems]);

  return (
    <div>
      <PageHeader
        title="Wishlist"
        subtitle={loading ? "Updating…" : `${ids.length} saved`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />
      <div className="section-max section-pad py-12">
        {displayProducts.length === 0 ? (
          <EmptyState
            title="No saved items"
            body="Tap the heart on any product to save it here."
            actionHref="/shop"
            actionLabel="Browse shop"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayProducts.map((p) => (
              <ProductCard key={String(p.id)} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
