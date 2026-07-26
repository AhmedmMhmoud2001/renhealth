import Image from "next/image";
import Link from "next/link";
import { fetchGoals, mediaUrl } from "@/lib/api";
import { healthGoals as fallbackGoals } from "@/data/home";
import { Icon } from "@/components/ui/Icon";

export async function HealthGoals() {
  const res = await fetchGoals();
  const goals =
    res.items.length > 0
      ? res.items.map((g) => ({
          slug: String(g.slug || g.id),
          title: String(g.name || g.title || "Goal"),
          image:
            mediaUrl(g.image) ||
            fallbackGoals[0]?.image ||
            "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
          icon: "goalSkin" as const,
        }))
      : fallbackGoals.map((g) => ({
          slug: g.slug,
          title: g.title,
          image: g.image,
          icon: g.icon,
        }));

  return (
    <section className="bg-surface">
      <div className="section-max section-pad pb-16 pt-4 md:pb-20 md:pt-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink md:text-[2.35rem]">
            Shop by Health Goal
          </h2>
          <Link
            href="/goals"
            className="hidden text-[11px] tracking-[0.18em] uppercase text-gold transition hover:text-gold-deep sm:inline-flex"
          >
            View all goals →
          </Link>
        </div>

        <div className="mt-9 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible lg:grid-cols-7 lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {goals.map((goal) => (
            <Link
              key={goal.slug}
              href={`/goals/${goal.slug}`}
              className="group flex w-[148px] shrink-0 flex-col overflow-hidden rounded-2xl bg-surface-muted transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(26,26,26,0.06)] md:w-auto"
            >
              <div className="relative h-[150px] overflow-hidden sm:h-[170px]">
                <Image
                  src={goal.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 148px, 14vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-muted via-surface-muted/80 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col items-center px-3 pb-5 pt-1 text-center">
                <span className="mb-2.5 text-gold">
                  <Icon name={goal.icon} className="h-7 w-7" />
                </span>
                <h3 className="text-[13px] font-medium leading-snug text-ink">
                  {goal.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
