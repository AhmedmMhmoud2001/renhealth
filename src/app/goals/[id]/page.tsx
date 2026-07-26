import { fetchGoals, fetchProducts, API_BASE } from "@/lib/api";
import { ProductCard } from "@/components/commerce/ProductCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { healthGoals } from "@/data/home";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goalsRes = await fetchGoals();
  const goal =
    goalsRes.items.find(
      (g) => String(g.id) === id || g.slug === id,
    ) ||
    healthGoals.find((g) => g.slug === id);

  const title =
    (goal && ("name" in goal ? goal.name : goal.title)) || "Health Goal";

  const productsRes = await fetchProducts({
    goal_id: goal && "id" in goal ? goal.id : undefined,
    search: typeof title === "string" ? title : undefined,
    per_page: 12,
    status: "active",
  });

  return (
    <div>
      <PageHeader
        title={String(title)}
        subtitle={
          goal && "description" in goal && goal.description
            ? String(goal.description)
            : "Formulas selected for this health goal."
        }
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Health Goals", href: "/goals" },
          { label: String(title) },
        ]}
      />

      <div className="section-max section-pad py-12">
        {productsRes.items.length === 0 ? (
          <EmptyState
            title="No products for this goal yet"
            body="Browse the full shop while we connect more formulas."
            actionHref="/shop"
            actionLabel="Browse shop"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productsRes.items.map((p) => (
              <ProductCard key={String(p.id)} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
