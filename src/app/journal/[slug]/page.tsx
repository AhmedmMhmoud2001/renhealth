import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchJournalArticle, mediaUrl } from "@/lib/api";
import { journalArticles } from "@/data/home";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await fetchJournalArticle(slug);

  let article: {
    title: string;
    category: string;
    readTime: string;
    image: string;
    excerpt: string;
    body?: string;
  } | null = null;

  if (res.ok && res.article) {
    const a = res.article;
    article = {
      title: a.title,
      category: a.category || "General",
      readTime: a.read_time || a.readTime || "5 min read",
      image: mediaUrl(a.image) || "",
      excerpt: a.excerpt || "",
      body: a.body || undefined,
    };
  } else {
    const fallback = journalArticles.find((a) => a.slug === slug);
    if (fallback) {
      article = {
        title: fallback.title,
        category: fallback.category,
        readTime: fallback.readTime,
        image: fallback.image,
        excerpt: fallback.excerpt,
      };
    }
  }

  if (!article) notFound();

  return (
    <div>
      <PageHeader
        title={article.title}
        subtitle={`${article.category} · ${article.readTime}`}
        crumbs={[
          { label: "Journal", href: "/journal" },
          { label: article.title },
        ]}
      />
      <div className="section-max section-pad py-12">
        {article.image && (
          <div className="relative mx-auto aspect-[21/9] max-w-4xl overflow-hidden rounded-3xl">
            <Image
              src={article.image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}
        <article className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-muted">
          {article.body ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          ) : (
            <>
              <p>{article.excerpt}</p>
              <p className="mt-5">
                At REN Health, we believe wellness is built quietly — through
                clear science, premium ingredients, and daily habits inspired by
                Swedish living.
              </p>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
