import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div>
      <PageHeader
        title="Terms & Conditions"
        subtitle="Please read these terms carefully before using our services."
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      />
      <div className="section-max section-pad max-w-3xl py-14 text-sm leading-relaxed text-muted">
        <h2 className="font-serif text-xl text-ink">Acceptance of Terms</h2>
        <p className="mt-3">
          By accessing or using the REN Health website and services, you agree to
          be bound by these Terms & Conditions. If you do not agree, please do
          not use our services.
        </p>

        <h2 className="mt-8 font-serif text-xl text-ink">Products & Orders</h2>
        <p className="mt-3">
          All products are subject to availability. We reserve the right to
          modify or discontinue products at any time. Prices are listed in
          Egyptian Pounds (L.E.) and include applicable taxes unless stated
          otherwise.
        </p>

        <h2 className="mt-8 font-serif text-xl text-ink">Shipping & Delivery</h2>
        <p className="mt-3">
          We aim to deliver orders within the estimated timeframe. Delivery times
          may vary based on location and shipping method selected at checkout.
        </p>

        <h2 className="mt-8 font-serif text-xl text-ink">Returns & Refunds</h2>
        <p className="mt-3">
          You may request a refund within 14 days of receiving your order if the
          product is damaged or does not match the description. Refund requests
          are reviewed and processed through Account → Refund Requests.
        </p>

        <h2 className="mt-8 font-serif text-xl text-ink">User Accounts</h2>
        <p className="mt-3">
          You are responsible for maintaining the confidentiality of your account
          credentials. You agree to provide accurate and complete information
          when creating an account.
        </p>
      </div>
    </div>
  );
}
