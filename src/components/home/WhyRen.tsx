import { whyRen } from "@/data/home";
import { Icon } from "@/components/ui/Icon";

export function WhyRen() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="section-max section-pad py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-3 md:gap-0">
          {whyRen.map((item, index) => (
            <article
              key={item.title}
              className={`flex items-start gap-4 md:px-6 lg:px-8 ${
                index > 0 ? "md:border-l md:border-line" : ""
              }`}
            >
              {item.icon === "sweden" ? (
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white shadow-sm"
                  aria-hidden
                >
                  <svg viewBox="0 0 16 10" className="h-5 w-8">
                    <rect width="16" height="10" fill="#006AA7" />
                    <rect x="5" width="2" height="10" fill="#FECC00" />
                    <rect y="4" width="16" height="2" fill="#FECC00" />
                  </svg>
                </span>
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-white text-gold">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
              )}
              <div>
                <h3 className="text-[12px] font-medium tracking-[0.14em] uppercase text-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
