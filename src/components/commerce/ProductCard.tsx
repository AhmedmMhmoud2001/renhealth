"use client";

import Link from "next/link";
import Image from "next/image";
import {
  money,
  productImage,
  productPrice,
  type Product,
} from "@/lib/api";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { WishlistButton } from "@/components/commerce/WishlistButton";

export function ProductCard({ product, offerPrice }: { product: Product; offerPrice?: { discounted: number; original: number } }) {
  const img = productImage(product);
  const { price: listPrice, compareAt } = productPrice(product);
  const price = offerPrice?.discounted ?? listPrice;
  const originalPrice = offerPrice?.original ?? compareAt;
  const hasOffer = !!offerPrice;
  const href = `/products/${product.slug || product.id}`;
  const rating = Number(product.rating ?? 0);
  const reviews = Number(product.reviews_count ?? product.rates_count ?? 0);
  const brand =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || "REN";

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line/60 bg-surface-card p-4 shadow-[0_2px_16px_rgba(26,26,26,0.04)]">
      {hasOffer && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-red-600 px-2 py-1 text-[9px] font-medium tracking-[0.12em] uppercase text-white">
          Sale
        </span>
      )}
      {!hasOffer && (product.is_featured || product.featured) && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-gold px-2 py-1 text-[9px] font-medium tracking-[0.12em] uppercase text-white">
          Bestseller
        </span>
      )}

      <div className="absolute right-3 top-3 z-10">
        <WishlistButton product={product} variant="icon" />
      </div>

      <Link href={href} className="block flex-1">
        <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-xl bg-surface-muted">
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              className="object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
              sizes="240px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] uppercase text-muted">
              REN
            </div>
          )}
        </div>

        <p className="mt-4 font-serif text-[11px] tracking-[0.2em] text-gold">
          {brand}
        </p>
        <h3 className="mt-1 font-serif text-[1.05rem] leading-snug tracking-wide text-ink">
          {product.name}
        </h3>
        {product.short_description ? (
          <p className="mt-1 line-clamp-1 text-[11px] text-muted">
            {product.short_description}
          </p>
        ) : null}

        {rating > 0 ? (
          <p className="mt-2.5 text-xs text-ink-soft">
            <span className="text-gold">★</span> {rating.toFixed(1)}
            {reviews > 0 ? (
              <span className="text-muted"> ({reviews})</span>
            ) : null}
          </p>
        ) : null}
      </Link>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[15px] font-medium text-ink">{money(price)}</p>
          {originalPrice && originalPrice !== price ? (
            <p className="text-xs text-muted line-through">{money(originalPrice)}</p>
          ) : null}
        </div>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
