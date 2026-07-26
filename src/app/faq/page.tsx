import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "FAQ" };

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard delivery takes 3–5 business days within Egypt. Fast shipping is available for select areas at checkout.",
  },
  {
    q: "What is your return policy?",
    a: "You can request a return within 14 days of receiving your order. Go to Account → Refund Requests to submit one.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is confirmed, you can view its status under Account → Orders. We'll also send you notifications for each status update.",
  },
  {
    q: "Can I pay on delivery?",
    a: "Yes. Cash on Delivery is available for eligible areas. You can also pay online or via wallet at checkout.",
  },
  {
    q: "How do I contact support?",
    a: "Go to Account → Tickets to open a support ticket, or Account → Support Chat to start a live conversation.",
  },
  {
    q: "Are your products authentic?",
    a: "Yes. All REN Health products follow our Swedish Formula™ standards — science-backed, premium ingredients, transparent labels.",
  },
  {
    q: "How do I use a coupon?",
    a: "Enter your coupon code in the cart or at checkout. The discount will be applied to your order total.",
  },
  {
    q: "Can I change my order after placing it?",
    a: "You can cancel a pending order from Account → Orders → select the order → Cancel. Then place a new one.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageHeader
        title="FAQ"
        subtitle="Answers to common questions about orders, shipping, and returns."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />
      <div className="section-max section-pad max-w-3xl py-14">
        <div className="space-y-8">
          {faqs.map((faq) => (
            <article key={faq.q}>
              <h2 className="font-serif text-xl text-ink">{faq.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {faq.a}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
