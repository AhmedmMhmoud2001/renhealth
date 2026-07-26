import Link from "next/link";
import { fetchCategories, fetchProducts, fetchBrands, api, API_BASE, unwrapList } from "@/lib/api";
import type { Offer } from "@/lib/api";
import { ShopProductGrid } from "@/components/commerce/ShopProductGrid";
import { ShopFilter } from "@/components/commerce/ShopFilter";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiBanner } from "@/components/ui/ApiBanner";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function qs(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null) q.set(k, v); });
  return q.toString();
}

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const category_id =
    typeof sp.category_id === "string" ? sp.category_id : undefined;
  const brand_id =
    typeof sp.brand_id === "string" ? sp.brand_id : undefined;
  const min_price =
    typeof sp.min_price === "string" ? sp.min_price : undefined;
  const max_price =
    typeof sp.max_price === "string" ? sp.max_price : undefined;
  const is_new =
    typeof sp.is_new === "string" ? sp.is_new : undefined;
  const wishlisted =
    typeof sp.wishlisted === "string" ? sp.wishlisted : undefined;
  const has_offers =
    typeof sp.has_offers === "string" ? sp.has_offers : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "latest";
  const page = typeof sp.page === "string" ? sp.page : "1";
  const featured = sp.featured === "1" ? "1" : undefined;

  const filterParams = { search, category_id, brand_id, min_price, max_price, is_new, wishlisted, has_offers, sort };
  const hasFilters = search || category_id || brand_id || min_price || max_price || is_new || wishlisted || has_offers;

  // Don't pass wishlisted to the API (server lacks auth context) —
  // ShopProductGrid filters client-side against the user's wishlist
  const [productsRes, categoriesRes, brandsRes, offersRes] = await Promise.all([
    fetchProducts({
      search,
      category_id,
      brand_id,
      min_price,
      max_price,
      is_new,
      sort,
      page,
      per_page: wishlisted ? 100 : 12,
      status: "active",
      featured,
    }),
    fetchCategories(),
    fetchBrands(),
    api.offers(),
  ]);

  // Build a map of product ID → offer discount price
  const offerPriceMap: Record<string, { discounted: number; original: number }> = {};
  if (offersRes.ok) {
    const offerItems = unwrapList<Offer>(offersRes.data);
    for (const o of offerItems) {
      const pid = o.offerable?.id;
      if (pid != null && o.total_price_after != null) {
        const discounted = Number(o.total_price_after);
        const original = Number(o.total_price_before ?? o.total_price_after ?? 0);
        offerPriceMap[String(pid)] = { discounted, original };
      }
    }
  }

  // When "On sale" filter is active, only show products that have offers
  const filteredProducts = (has_offers === "1"
    ? productsRes.items.filter((p) => String(p.id) in offerPriceMap)
    : [...productsRes.items]
  ).sort((a, b) => {
    if (sort === "price_asc") return Number(a.final_price ?? a.price) - Number(b.final_price ?? b.price);
    if (sort === "price_desc") return Number(b.final_price ?? b.price) - Number(a.final_price ?? a.price);
    return 0;
  });

  const apiMissing = !API_BASE;

  return (
    <div>
      <PageHeader
        title="Shop"
        subtitle="Evidence-based formulas crafted with Swedish precision."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Shop" },
        ]}
      />

      {apiMissing ? (
        <ApiBanner message="Set NEXT_PUBLIC_API_BASE_URL in .env.local to connect the shop to your backend." />
      ) : null}
      {!productsRes.ok && !apiMissing ? (
        <ApiBanner message={productsRes.error} />
      ) : null}

      <div className="section-max section-pad py-10 md:py-14">
        <div className="flex flex-col gap-10 lg:flex-row">
          <ShopFilter
            categories={categoriesRes.items}
            brands={brandsRes.items}
            params={filterParams}
          />

          <div className="min-w-0 flex-1">
            {search ? (
              <p className="mb-6 text-sm text-muted">
                Results for <span className="text-ink">“{search}”</span>
              </p>
            ) : null}

            <ShopProductGrid
              products={filteredProducts}
              wishlisted={wishlisted}
              search={search}
              apiMissing={apiMissing}
              offerPriceMap={offerPriceMap}
            />

            {productsRes.meta?.last_page && productsRes.meta.last_page > 1 ? (
              <div className="mt-10 flex items-center justify-center gap-3">
                {Number(page) > 1 ? (
                  <Link
                    href={`/shop?${qs({ search, category_id, brand_id, min_price, max_price, is_new, wishlisted, has_offers, sort, page: String(Number(page) - 1) })}`}
                    className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.14em]"
                  >
                    Previous
                  </Link>
                ) : null}
                <span className="text-sm text-muted">
                  Page {page} of {productsRes.meta.last_page}
                </span>
                {Number(page) < Number(productsRes.meta.last_page) ? (
                  <Link
                    href={`/shop?${qs({ search, category_id, brand_id, min_price, max_price, is_new, wishlisted, has_offers, sort, page: String(Number(page) + 1) })}`}
                    className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.14em]"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
