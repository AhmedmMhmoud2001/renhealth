import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Our Story" };

export default function StoryPage() {
  return (
    <div>
      <PageHeader
        title="Our Story"
        subtitle="Born in Sweden — built on science, prevention, and quiet precision."
        crumbs={[{ label: "Home", href: "/" }, { label: "Our Story" }]}
      />
      <div className="section-max section-pad max-w-3xl py-14 text-base leading-relaxed text-muted">
        <p>
          REN Health was founded in Sweden with a simple belief: better health
          should feel calm, clear, and trustworthy — never noisy or exaggerated.
        </p>
        <p className="mt-5">
          We combine Swedish scientific expertise with carefully selected
          ingredients and transparent formulas, so every daily ritual supports
          the body with integrity.
        </p>
        <p className="mt-5">
          From prevention to purity, our promise is the same: premium quality
          without compromise.
        </p>
      </div>
    </div>
  );
}
