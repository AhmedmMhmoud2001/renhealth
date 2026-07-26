import Link from "next/link";
import Image from "next/image";
import { api, mediaUrl, money, unwrapList, type Offer, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiBanner } from "@/components/ui/ApiBanner";
import { OfferWishlistButton } from "@/components/commerce/OfferWishlistButton";

export const metadata = { title: "Offers" };

function offerImage(offer: Offer): string | null {
  const thumb = offer.offerable?.thumbnail;
  if (thumb) return mediaUrl(thumb);
  const pu = (offer as any).product_units?.[0]?.unit_details?.product?.thumb_image;
  if (pu) return mediaUrl(pu);
  const pi = (offer as any).package_items?.[0]?.unit_details?.product?.thumb_image;
  if (pi) return mediaUrl(pi);
  const qt = (offer as any).quantity_tiers?.[0]?.unit_details?.product?.thumb_image;
  if (qt) return mediaUrl(qt);
  return mediaUrl(offer.image);
}

function offerLabel(offer: Offer): string {
  const s = offer.offerable?.name;
  if (s && !offer.name?.toLowerCase().includes(s.toLowerCase())) return s;
  return offer.name || offer.title || "Offer";
}

function offerDesc(offer: Offer): string | null {
  if (offer.description) return offer.description;
  if (offer.offerable?.name && offer.name) {
    const suffix = offer.offerable.name;
    return `${offer.name} \u2014 ${suffix}`;
  }
  return null;
}

export default async function OffersPage() {
  const res = await api.offers();
  const offers = res.ok ? unwrapList<Offer>(res.data) : [];

  return (
    <div>
      <PageHeader
        title="Offers"
        subtitle="Selected Swedish solutions and seasonal formulas."
        crumbs={[{ label: "Home", href: "/" }, { label: "Offers" }]}
      />
      {!API_BASE ? (
        <ApiBanner message="Set NEXT_PUBLIC_API_BASE_URL to load offers from /api/v1/offers." />
      ) : null}
      <div className="section-max section-pad py-12">
        {offers.length === 0 ? (
          <EmptyState title="No offers right now" actionHref="/shop" actionLabel="Browse shop" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const img = offerImage(offer);
              const isPackage = offer.type === "package";
              const savings = offer.total_price_before && offer.total_price_after
                ? Number(offer.total_price_before) - Number(offer.total_price_after)
                : 0;

              return (
                <Link
                  key={String(offer.id)}
                  href={`/offers/${offer.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                    {img ? (
                      <Image
                        src={img}
                        alt={offer.name || "Offer"}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-serif text-2xl tracking-[0.2em] text-gold/30">
                        {offer.name?.[0] || "O"}
                      </div>
                    )}
                    <div className="absolute right-3 top-3 z-10 opacity-0 transition group-hover:opacity-100">
                      <OfferWishlistButton offerId={offer.id} />
                    </div>
                    {savings > 0 ? (
                      <span className="absolute left-3 top-3 rounded-md bg-gold px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] uppercase text-white">
                        Save {money(savings)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-serif text-lg text-ink">{offer.name}</h2>
                    {offerLabel(offer) !== offer.name ? (
                      <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-gold">
                        {offerLabel(offer)}
                      </p>
                    ) : null}
                    {offerDesc(offer) ? (
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">
                        {offerDesc(offer)}
                      </p>
                    ) : null}
                    <div className="mt-4 flex items-center gap-3">
                      {offer.total_price_after ? (
                        <span className="text-lg font-medium text-ink">
                          {money(offer.total_price_after)}
                        </span>
                      ) : null}
                      {offer.total_price_before && offer.total_price_after &&
                        Number(offer.total_price_after) < Number(offer.total_price_before) ? (
                        <span className="text-sm text-muted line-through">
                          {money(offer.total_price_before)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted">
                      {isPackage ? "Bundle deal" : `${offer.type || "offer"} `}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
