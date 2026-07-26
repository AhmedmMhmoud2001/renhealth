import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchJournalArticles, mediaUrl } from "@/lib/api";
import { journalArticles } from "@/data/home";

export const metadata = { title: "Swedish Journal" };

export default async function JournalPage() {
  const res = await fetchJournalArticles({ per_page: 12 });

  const apiArticles =
    res.ok && res.items.length > 0
      ? res.items.map((a) => ({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt || "",
          category: a.category || "General",
          image: mediaUrl(a.image) || journalArticles[0]?.image || "",
          readTime: a.read_time || a.readTime || "5 min read",
        }))
      : journalArticles.map((a) => ({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          category: a.category,
          image: a.image,
          readTime: a.readTime,
        }));

  return (
    <div>
      <PageHeader
        title="Swedish Journal"
        subtitle="Science, health and inspiration from Sweden."
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal" }]}
      />
      <div className="section-max section-pad grid gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
        {apiArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/journal/${article.slug}`}
            className="group overflow-hidden rounded-2xl border border-line bg-surface-card"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="33vw"
              />
            </div>
            <div className="p-5">
              <p className="text-[11px] tracking-[0.16em] uppercase text-gold">
                {article.category}
              </p>
              <h2 className="mt-2 font-serif text-xl text-ink">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{article.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
