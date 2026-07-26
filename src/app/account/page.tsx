"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

const links = [
  { href: "/account/orders", label: "Orders", body: "Track and reorder" },
  { href: "/account/addresses", label: "Addresses", body: "Delivery details" },
  { href: "/wishlist", label: "Wishlist", body: "Saved formulas" },
  { href: "/account/wallet", label: "Wallet", body: "Balance history" },
  { href: "/account/tickets", label: "Support", body: "Open a ticket" },
];

export default function AccountPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="section-max section-pad py-20 text-sm text-muted">
        Loading account…
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageHeader title="Account" />
        <div className="section-max section-pad py-12">
          <EmptyState
            title="Sign in to continue"
            actionHref="/login?next=/account"
            actionLabel="Sign in"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Hello, ${user.name}`}
        subtitle={user.email || user.phone || undefined}
        crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />
      <div className="section-max section-pad py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-2xl border border-line bg-surface-card p-6 transition hover:border-gold/40"
            >
              <h2 className="font-serif text-xl text-ink">{l.label}</h2>
              <p className="mt-2 text-sm text-muted">{l.body}</p>
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-10 text-xs tracking-[0.18em] uppercase text-muted hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
