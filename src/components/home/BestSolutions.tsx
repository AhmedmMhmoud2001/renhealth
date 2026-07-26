import Link from "next/link";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/commerce/ProductCard";
import { featuredProducts } from "@/data/home";
import { ProductTub } from "@/components/ui/ProductTub";
import { Icon } from "@/components/ui/Icon";
import { BestSolutionsCarousel } from "@/components/home/BestSolutionsCarousel";

export async function BestSolutions() {
  const res = await fetchProducts({
    featured: 1,
    per_page: 8,
    status: "active",
    sort: "latest",
  });

  const products = res.items;

  return (
    <section className="bg-surface">
      <div className="section-max section-pad py-14 md:py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink md:text-[2.35rem]">
            Best Swedish Solutions
          </h2>
          <Link
            href="/shop?featured=1"
            className="text-[11px] tracking-[0.18em] uppercase text-gold transition hover:text-gold-deep"
          >
            View all products →
          </Link>
        </div>

        {products.length > 0 ? (
          <BestSolutionsCarousel>
            {products.map((product) => (
              <div key={String(product.id)} className="w-[220px] shrink-0 sm:w-[240px]">
                <ProductCard product={product} />
              </div>
            ))}
          </BestSolutionsCarousel>
        ) : (
          <BestSolutionsCarousel>
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="group relative w-[220px] shrink-0 rounded-2xl border border-line/60 bg-surface-card p-4 sm:w-[240px]"
              >
                {product.bestseller ? (
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-gold px-2 py-1 text-[9px] font-medium tracking-[0.12em] uppercase text-white">
                    #1 Bestseller
                  </span>
                ) : null}
                <Link href="/shop" className="block">
                  <div className="relative mx-auto flex aspect-square items-center justify-center rounded-xl bg-surface-muted p-3">
                    <ProductTub
                      className="origin-center scale-[0.68]"
                      label={product.name.split(" ").join("\n")}
                      decorative
                    />
                  </div>
                  <p className="mt-4 font-serif text-[11px] tracking-[0.2em] text-gold">
                    {product.brand}
                  </p>
                  <h3 className="mt-1 font-serif text-[1.05rem] text-ink uppercase">
                    {product.name}
                  </h3>
                  <div className="mt-2.5 flex items-center gap-1 text-gold">
                    <Icon name="star" className="h-3.5 w-3.5" />
                    <span className="text-xs text-ink-soft">{product.rating}</span>
                  </div>
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[15px] font-medium">
                    {product.price} {product.currency}
                  </p>
                </div>
              </article>
            ))}
          </BestSolutionsCarousel>
        )}
      </div>
    </section>
  );
}
