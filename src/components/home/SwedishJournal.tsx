import Image from "next/image";
import Link from "next/link";
import { journalArticles } from "@/data/home";

export function SwedishJournal() {
  return (
    <section className="bg-surface">
      <div className="section-max section-pad py-14 md:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-ink md:text-[2.35rem]">
              Swedish Journal
            </h2>
            <p className="mt-2 text-sm text-muted md:text-[15px]">
              Science, health and inspiration from Sweden.
            </p>
          </div>
          <Link
            href="/journal"
            className="text-[11px] tracking-[0.18em] uppercase text-gold transition hover:text-gold-deep"
          >
            View all articles →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {journalArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              className="group flex gap-4 rounded-2xl border border-line/50 bg-surface-card p-3 shadow-[0_2px_16px_rgba(26,26,26,0.04)] transition hover:shadow-[0_8px_28px_rgba(26,26,26,0.06)] sm:gap-5 sm:p-4"
            >
              <div className="relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-xl sm:h-[128px] sm:w-[140px]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="140px"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col py-0.5">
                <span className="text-[11px] tracking-[0.14em] uppercase text-gold">
                  {article.category}
                </span>
                <h3 className="mt-1.5 font-serif text-[1.05rem] leading-snug text-ink transition-colors group-hover:text-gold-deep sm:text-lg">
                  {article.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                  {article.excerpt}
                </p>
                <span className="mt-auto pt-2 text-xs text-muted">
                  {article.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
