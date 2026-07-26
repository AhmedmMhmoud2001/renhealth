import { footerTrust } from "@/data/home";
import { Icon } from "@/components/ui/Icon";

export function TrustFooter() {
  return (
    <section className="border-y border-line bg-surface-deep">
      <div className="section-max section-pad grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {footerTrust.map((item) => (
          <div key={item.title} className="flex items-start gap-3.5">
            <Icon name={item.icon} className="mt-0.5 h-6 w-6 shrink-0 text-ink-soft" />
            <div>
              <h3 className="text-[13px] font-medium text-ink">{item.title}</h3>
              <p className="mt-0.5 text-sm text-muted">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
