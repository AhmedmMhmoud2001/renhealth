import { PageHeader } from "@/components/ui/PageHeader";
import { fetchCmsPage, API_BASE } from "@/lib/api";
import type { CmsSection } from "@/lib/api/types";

export const metadata = { title: "Swedish Formula™" };

const fallbackSections: CmsSection[] = [
  {
    title: "Science first",
    body: "Evidence-informed development guided by Swedish clarity.",
  },
  {
    title: "Exact dosages",
    body: "Meaningful amounts — never underdosed marketing blends.",
  },
  {
    title: "Transparent labels",
    body: "What you see is what you take, with no unnecessary noise.",
  },
];

export default async function SwedishFormulaPage() {
  const res = await fetchCmsPage("swedish-formula");

  const title = res.ok && res.page?.title ? res.page.title : "Swedish Formula™";
  const subtitle =
    res.ok && res.page?.subtitle
      ? res.page.subtitle
      : "Every formula developed with precision — ingredients and dosages chosen with care.";
  const sections =
    res.ok && res.page?.sections?.length ? res.page.sections : fallbackSections;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Swedish Formula™" },
        ]}
      />
      <div className="section-max section-pad grid gap-6 py-14 md:grid-cols-3">
        {sections.map((s, i) => (
          <article
            key={s.title || i}
            className="rounded-2xl border border-line bg-surface-card p-6"
          >
            <h2 className="font-serif text-xl text-ink">{s.title}</h2>
            <p className="mt-3 text-sm text-muted">{s.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
