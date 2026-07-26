import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface-card px-6 py-16 text-center">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      {body ? <p className="mx-auto mt-3 max-w-md text-sm text-muted">{body}</p> : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-md bg-ink px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
