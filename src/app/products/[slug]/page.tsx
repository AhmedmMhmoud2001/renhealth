import Image from "next/image";
import { notFound } from "next/navigation";
import {
  fetchProductBySlugOrId,
  fetchProducts,
  money,
  productImage,
  productPrice,
  mediaUrl,
  api,
  unwrapList,
  API_BASE,
} from "@/lib/api";
import type { Offer } from "@/lib/api";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductCard } from "@/components/commerce/ProductCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { WishlistButton } from "@/components/commerce/WishlistButton";
import { RateProduct, ReportProduct } from "@/components/commerce/RateProduct";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetchProductBySlugOrId(slug);
  return { title: res.ok ? res.product.name : "Product" };
}

function StarRating({ rating, count }: { rating?: number | string; count?: number }) {
  const stars = Number(rating ?? 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${i <= Math.round(stars) ? "text-gold" : "text-line"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </div>
  );
}

function ProductGallery({
  product,
  mainImg,
}: {
  product: { name: string; images?: Array<string | { url?: string; path?: string }>; image?: string | null; thumbnail?: string | null; thumb_image?: string | null };
  mainImg: string | null;
}) {
  const allImages: string[] = [];
  if (mainImg) allImages.push(mainImg);
  if (product.images) {
    for (const img of product.images) {
      const url = typeof img === "string" ? img : img.url || img.path || null;
      const resolved = url ? mediaUrl(url) : null;
      if (resolved && !allImages.includes(resolved)) allImages.push(resolved);
    }
  }
  if (allImages.length <= 1) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface-muted">
        {mainImg ? (
          <Image
            src={mainImg}
            alt={product.name}
            fill
            className="object-contain p-8"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-2xl tracking-[0.3em] text-gold">
            REN
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface-muted">
        <Image
          src={allImages[0]}
          alt={product.name}
          fill
          className="object-contain p-8"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImages.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted"
            >
              <Image
                src={url}
                alt={`${product.name} ${i + 1}`}
                fill
                className="object-contain p-2"
                sizes="120px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetchProductBySlugOrId(slug);
  if (!res.ok) {
    if (!API_BASE) {
      return (
        <div className="section-max section-pad py-20">
          <PageHeader
            title="Product unavailable"
            subtitle="Set NEXT_PUBLIC_API_BASE_URL to load products from the backend."
          />
        </div>
      );
    }
    notFound();
  }

  const product = res.product;
  const img = productImage(product);
  const { price: listPrice, compareAt: listCompareAt } = productPrice(product);
  const related = await fetchProducts({
    category_id: product.category_id,
    per_page: 4,
    status: "active",
  });

  // Fetch offers to check if this product has an active discount
  let offerDiscount: { discounted: number; original: number } | null = null;
  const offersRes = await api.offers();
  if (offersRes.ok) {
    const offerItems = unwrapList<Offer>(offersRes.data);
    const match = offerItems.find(
      (o) => String(o.offerable?.id) === String(product.id),
    );
    if (match && match.total_price_after != null) {
      offerDiscount = {
        discounted: Number(match.total_price_after),
        original: Number(match.total_price_before ?? match.total_price_after ?? 0),
      };
    }
  }

  const price = offerDiscount?.discounted ?? listPrice;
  const compareAt = offerDiscount?.original ?? listCompareAt;

  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || null;
  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || null;
  const stock = product.stock ?? product.quantity ?? null;
  const reviewsCount = product.reviews_count ?? product.rates_count ?? 0;
  const isNew = product.is_new;
  const isFeatured = product.is_featured || product.featured;
  const units = product.units || [];

  return (
    <div>
      <PageHeader
        title={product.name}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(categoryName ? [{ label: categoryName, href: "/shop" }] : []),
          { label: product.name },
        ]}
      />

      <div className="section-max section-pad grid gap-10 py-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery product={product} mainImg={img} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {isNew ? (
              <span className="inline-block rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                New
              </span>
            ) : null}
            {isFeatured ? (
              <span className="inline-block rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-soft">
                Featured
              </span>
            ) : null}
          </div>

          {brandName && (
            <p className="mt-3 text-xs tracking-[0.22em] uppercase text-gold">
              {brandName}
            </p>
          )}

          <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4">
            <StarRating rating={product.rating} count={reviewsCount} />
          </div>

          <div className="mt-5 flex items-end gap-3">
            <p className="text-2xl font-medium text-ink">{money(price)}</p>
            {compareAt ? (
              <>
                <p className="pb-1 text-sm text-muted line-through">
                  {money(compareAt)}
                </p>
                <span className="mb-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  {Math.round(((compareAt - price) / compareAt) * 100)}% OFF
                </span>
              </>
            ) : null}
          </div>

          {units.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-ink">Available Units</p>
              <div className="flex flex-wrap gap-2">
                {units.map((unit, i) => (
                  <span
                    key={String(unit.unit_id ?? unit.id ?? i)}
                    className={`inline-block rounded-lg border px-4 py-2 text-sm transition ${
                      unit.is_default
                        ? "border-gold bg-gold/5 text-ink"
                        : "border-line bg-surface-card text-muted hover:border-gold/50"
                    }`}
                  >
                    {unit.name || `Unit ${i + 1}`}
                    {unit.price !== undefined && (
                      <span className="ml-1.5 text-xs text-muted">
                        {money(unit.price)}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {stock !== null && (
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  stock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted">
                {stock > 0 ? `In Stock (${stock} available)` : "Out of Stock"}
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AddToCartButton
              product={product}
              label="Add to cart"
              className="inline-flex min-w-[160px] items-center justify-center rounded-md bg-ink px-6 py-3.5 text-white transition hover:bg-ink-soft disabled:opacity-60"
            />
            <WishlistButton product={product} />
          </div>

          <div className="mt-8 flex items-center gap-6 border-t border-line pt-6">
            <RateProduct productId={product.id} />
            <ReportProduct productId={product.id} />
          </div>
        </div>
      </div>

      {(product.short_description || product.description) && (
        <section className="border-t border-line">
          <div className="section-max section-pad py-12">
            <h2 className="font-serif text-2xl text-ink">Product Details</h2>
            <div
              className="prose prose-sm mt-6 max-w-none text-muted"
              dangerouslySetInnerHTML={{
                __html: String(
                  product.short_description || product.description || "",
                ),
              }}
            />
          </div>
        </section>
      )}

      {related.items.filter((p) => String(p.id) !== String(product.id)).length >
      0 ? (
        <section className="border-t border-line bg-surface-deep">
          <div className="section-max section-pad py-14">
            <h2 className="font-serif text-2xl text-ink">You may also like</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.items
                .filter((p) => String(p.id) !== String(product.id))
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={String(p.id)} product={p} />
                ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
