import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Offers", href: "/offers" },
      { label: "Health Goals", href: "/goals" },
      { label: "Bestsellers", href: "/shop?sort=bestsellers" },
      { label: "New Arrivals", href: "/shop?sort=new" },
    ],
  },
  {
    title: "Brand",
    links: [
      { label: "Our Story", href: "/story" },
      { label: "Swedish Formula™", href: "/swedish-formula" },
      { label: "Swedish Promise™", href: "/promise" },
      { label: "Ingredients", href: "/ingredients" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/account/refund-requests" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/account/tickets" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-surface-deep">
      <div className="section-max section-pad grid gap-12 py-16 md:grid-cols-[1.1fr_2fr] md:gap-16">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            The Swedish way of better health — evidence-based formulas,
            premium ingredients, and quiet precision.
          </p>
          <p className="mt-5 text-[11px] tracking-[0.22em] uppercase text-gold">
            Founded in Sweden
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-ink">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="section-max section-pad flex flex-col gap-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} REN Health AB. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-ink">
              Terms
            </Link>
            <span className="tracking-[0.12em]">www.renhealth.se</span>
          </div>
        </div>
        <div className="border-t border-line/60">
          <div className="section-max section-pad flex flex-col items-center gap-2 py-4 text-center text-[11px] text-muted sm:flex-row sm:justify-center sm:gap-3">
            <span>Developed by</span>
            <a
              href="https://www.qeematech.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
              aria-label="Qeema Tech — website development"
            >
              <Image
                src="/images/qeematech-logo.png"
                alt="Qeema Tech"
                width={72}
                height={28}
                className="h-6 w-auto object-contain"
              />
            </a>
            <span className="hidden sm:inline">·</span>
            <span>
              © {new Date().getFullYear()}{" "}
              <a
                href="https://www.qeematech.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-soft transition hover:text-ink"
              >
                Qeema Tech
              </a>
              . All rights reserved.
            </span>
          </div>
        </div>
      </div>    </footer>
  );
}
