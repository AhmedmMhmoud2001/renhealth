import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <div className="border-b border-line bg-surface-deep">
      <div className="section-max section-pad py-10 md:py-12">
        {crumbs?.length ? (
          <nav className="mb-3 flex flex-wrap gap-2 text-xs tracking-[0.12em] uppercase text-muted">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-2">
                {i > 0 ? <span>/</span> : null}
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="font-serif text-3xl text-ink md:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
