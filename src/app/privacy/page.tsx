import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal information."
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      />
      <div className="section-max section-pad max-w-3xl py-14 text-sm leading-relaxed text-muted">
        <h2 className="font-serif text-xl text-ink">Information We Collect</h2>
        <p className="mt-3">
          We collect information you provide directly: name, email, phone number,
          delivery address, and payment details. We also collect usage data such
          as browsing behavior and order history to improve our services.
        </p>

        <h2 className="mt-8 font-serif text-xl text-ink">How We Use Your Information</h2>
        <p className="mt-3">
          Your information is used to process orders, deliver products, provide
          customer support, send order updates, and improve your shopping
          experience. We do not sell your personal data to third parties.
        </p>

        <h2 className="mt-8 font-serif text-xl text-ink">Data Protection</h2>
        <p className="mt-3">
          We implement industry-standard security measures to protect your
          personal data. All payment transactions are encrypted and processed
          through secure payment providers.
        </p>

        <h2 className="mt-8 font-serif text-xl text-ink">Your Rights</h2>
        <p className="mt-3">
          You can access, update, or delete your personal information from your
          account settings. For any privacy-related requests, contact us through
          Account → Tickets.
        </p>
      </div>
    </div>
  );
}
