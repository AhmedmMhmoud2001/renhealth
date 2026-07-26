import { api, mediaUrl, unwrapList, type Branch, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiBanner } from "@/components/ui/ApiBanner";

export const metadata = { title: "Our branches" };

export default async function BranchesPage() {
  const res = await api.branches();
  const branches = res.ok ? unwrapList<Branch>(res.data) : [];

  return (
    <div>
      <PageHeader
        title="Our branches"
        subtitle="Visit us at any of our locations."
        crumbs={[{ label: "Home", href: "/" }, { label: "Branches" }]}
      />
      {!API_BASE ? <ApiBanner message="Set NEXT_PUBLIC_API_BASE_URL to load branches." /> : null}
      <div className="section-max section-pad py-12">
        {branches.length === 0 ? (
          <EmptyState title="No branches listed" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <div key={String(b.id)} className="rounded-2xl border border-line bg-surface-card p-6">
                <h2 className="font-serif text-xl text-ink">{b.name}</h2>
                {b.address ? <p className="mt-2 text-sm text-muted">{b.address}</p> : null}
                {b.phone ? <p className="mt-1 text-sm text-muted">{b.phone}</p> : null}
                {b.latitude && b.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs uppercase tracking-[0.14em] text-gold"
                  >
                    View on map
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
