import Image from "next/image";
import Link from "next/link";
import { fetchGoals, mediaUrl, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiBanner } from "@/components/ui/ApiBanner";
import { healthGoals } from "@/data/home";

export const metadata = { title: "Health Goals" };

export default async function GoalsPage() {
  const res = await fetchGoals();
  const items =
    res.items.length > 0
      ? res.items
      : healthGoals.map((g, i) => ({
          id: g.slug,
          name: g.title,
          slug: g.slug,
          image: g.image,
          description: null,
        }));

  return (
    <div>
      <PageHeader
        title="Shop by Health Goal"
        subtitle="Find solutions for what your body needs — not just ingredient names."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Health Goals" },
        ]}
      />
      {!API_BASE ? (
        <ApiBanner message="Connect NEXT_PUBLIC_API_BASE_URL to load goals from /api/v1/goals." />
      ) : null}
      {!res.ok && API_BASE ? <ApiBanner message={res.error} /> : null}

      <div className="section-max section-pad py-12">
        {items.length === 0 ? (
          <EmptyState title="No goals yet" body="Goals will appear once the API is available." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((goal) => {
              const href = `/goals/${goal.slug || goal.id}`;
              const img = mediaUrl(goal.image) || undefined;
              return (
                <Link
                  key={String(goal.id)}
                  href={href}
                  className="group overflow-hidden rounded-2xl bg-surface-muted"
                >
                  <div className="relative aspect-[4/5]">
                    {img ? (
                      <Image
                        src={img}
                        alt={String(goal.name || ("title" in goal ? goal.title : "") || "Goal")}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-beige text-gold">
                        REN
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h2 className="font-serif text-xl text-white">
                        {String(goal.name || ("title" in goal ? goal.title : "Goal"))}
                      </h2>
                    </div>
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
