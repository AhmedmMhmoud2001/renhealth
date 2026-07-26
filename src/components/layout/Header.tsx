"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { navLinks } from "@/data/home";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { api, unwrapList, type Notification } from "@/lib/api";

function BellIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, token } = useAuth();
  const { ids: wishlistIds } = useWishlist();
  const [notifCount, setNotifCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      const res = await api.notifications();
      if (cancelled || !res.ok) return;
      const list = unwrapList<Notification>(res.data);
      setNotifCount(list.filter((n) => !n.is_read && !n.read_at).length);
    })();
    return () => { cancelled = true; };
  }, [token]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface-card/95 backdrop-blur-md">
      <div className="section-max section-pad">
        <div className="flex items-center justify-between gap-6 py-5">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.16em] uppercase text-ink transition-colors hover:text-gold-deep"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 text-ink sm:gap-2">
            <Link
              href={user ? "/account" : "/login"}
              className="hidden rounded-full p-2 transition-colors hover:bg-beige/60 sm:inline-flex"
              aria-label="Account"
            >
              <Icon name="user" className="h-5 w-5" />
            </Link>
            <Link
              href="/wishlist"
              className="relative hidden rounded-full p-2 transition-colors hover:bg-beige/60 md:inline-flex"
              aria-label="Wishlist"
            >
              <Icon name="heart" className="h-5 w-5" />
              {wishlistIds.length > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-white">
                  {wishlistIds.length}
                </span>
              ) : null}
            </Link>
            <Link
              href="/account/notifications"
              className="relative hidden rounded-full p-2 transition-colors hover:bg-beige/60 sm:inline-flex"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {notifCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-white">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/cart"
              className="relative rounded-full p-2 transition-colors hover:bg-beige/60"
              aria-label="Cart"
            >
              <Icon name="bag" className="h-5 w-5" />
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-white">
                {count}
              </span>
            </Link>
            <button
              type="button"
              className="rounded-full p-2 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="block h-px w-5 bg-ink" />
              <span className="mt-1.5 block h-px w-5 bg-ink" />
            </button>
          </div>
        </div>

        <form onSubmit={onSearch} className="pb-5">
          <label className="relative mx-auto flex max-w-3xl items-center">
            <span className="sr-only">Search REN Health</span>
            <span className="pointer-events-none absolute left-4 text-muted">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, ingredients or health goals..."
              className="w-full rounded-full border border-line bg-white py-3.5 pl-11 pr-14 text-sm text-ink placeholder:text-muted/80 outline-none transition focus:border-gold/45"
            />
            <button
              type="submit"
              className="absolute right-3 rounded-full bg-ink px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase text-white"
            >
              Search
            </button>
          </label>
        </form>
      </div>

      {open ? (
        <div className="border-t border-line bg-surface px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm tracking-[0.14em] uppercase"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/account" className="py-2 text-sm tracking-[0.14em] uppercase" onClick={() => setOpen(false)}>
              Account
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
