import { PageHeader } from "@/components/ui/PageHeader";
import { fetchCmsPage } from "@/lib/api";
import type { CmsSection } from "@/lib/api/types";

export const metadata = { title: "Ingredients" };

const fallbackSections: CmsSection[] = [
  {
    title: "Hydrolyzed Collagen Peptides",
    body: "Types I, II & III for hair, skin, nails and joints.",
  },
  {
    title: "Bromelain",
    body: "Enzyme support selected for complementary daily use.",
  },
  {
    title: "Chromium & Biotin",
    body: "Micronutrients chosen for targeted wellness goals.",
  },
  {
    title: "Vitamins & Minerals",
    body: "Carefully dosed essentials for everyday vitality.",
  },
];

export default async function IngredientsPage() {
  const res = await fetchCmsPage("ingredients");

  const title = res.ok && res.page?.title ? res.page.title : "Ingredients";
  const subtitle =
    res.ok && res.page?.subtitle
      ? res.page.subtitle
      : "Premium raw materials, carefully sourced and clearly disclosed.";
  const sections =
    res.ok && res.page?.sections?.length ? res.page.sections : fallbackSections;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        crumbs={[{ label: "Home", href: "/" }, { label: "Ingredients" }]}
      />
      <div className="section-max section-pad py-14">
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((s, i) => (
            <article
              key={s.title || i}
              className="rounded-2xl bg-surface-muted p-6"
            >
              <h2 className="font-serif text-xl text-ink">{s.title}</h2>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
