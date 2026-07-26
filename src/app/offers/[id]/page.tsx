import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, mediaUrl, money, unwrapData, type Offer, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Offer" };

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

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await api.offer(id);
  if (!res.ok) {
    if (!API_BASE) {
      return (
        <div className="section-max section-pad py-20">
          <PageHeader title="Offer unavailable" subtitle="Set NEXT_PUBLIC_API_BASE_URL to load offers." />
        </div>
      );
    }
    notFound();
  }

  const offer = unwrapData<Offer>(res.data);
  const img = offerImage(offer);
  const savings = offer.total_price_before && offer.total_price_after
    ? Number(offer.total_price_before) - Number(offer.total_price_after)
    : 0;
  const relatedName = offer.offerable?.name;

  return (
    <div>
      <PageHeader
        title={offer.name || "Offer"}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Offers", href: "/offers" },
          { label: offer.name || "Offer" },
        ]}
      />
      <div className="section-max section-pad py-12">
        <Link
          href="/offers"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
            <path d="m15 6-6 6 6 6" />
          </svg>
          Back to Offers
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface-muted">
            {img ? (
              <Image
                src={img}
                alt={offer.name || "Offer"}
                fill
                className="object-contain p-8"
                sizes="50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-3xl tracking-[0.3em] text-gold/20">
                {offer.name?.[0] || "R"}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.15em] text-gold">
              {offer.type === "package" ? "Bundle Deal" : `${offer.type || "Limited"} Offer`}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
              {offer.name}
            </h1>
            {relatedName && relatedName !== offer.name ? (
              <p className="mt-1 text-sm text-muted">on {relatedName}</p>
            ) : null}

            <div className="mt-6 flex items-baseline gap-4">
              {offer.total_price_after ? (
                <span className="text-3xl font-medium text-ink">
                  {money(offer.total_price_after)}
                </span>
              ) : null}
              {offer.total_price_before &&
                Number(offer.total_price_after ?? 0) < Number(offer.total_price_before) ? (
                <span className="text-lg text-muted line-through">
                  {money(offer.total_price_before)}
                </span>
              ) : null}
            </div>

            {savings > 0 ? (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                You save {money(savings)}
              </p>
            ) : null}

            {offer.description ? (
              <p className="mt-6 leading-relaxed text-muted">{offer.description}</p>
            ) : null}

            {offer.offerable?.slug ? (
              <Link
                href={`/products/${offer.offerable.slug}`}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white transition-all hover:bg-ink/90"
              >
                View Product
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
