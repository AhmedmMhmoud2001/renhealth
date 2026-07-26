import { trustMessages } from "@/data/home";
import { Icon } from "@/components/ui/Icon";

export function TrustBar() {
  return (
    <div className="border-b border-line bg-surface-deep text-ink-soft">
      <div className="section-max section-pad flex flex-wrap items-center justify-center gap-y-2 py-2.5 text-[11px] tracking-[0.06em] md:justify-center md:gap-0 md:text-[12px]">
        {trustMessages.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 ? (
              <span
                className="mx-3 hidden h-3 w-px bg-line md:mx-5 md:block lg:mx-7"
                aria-hidden
              />
            ) : null}
            <div className="flex items-center gap-2 px-2 md:px-0">
              {item.icon === "sweden" ? (
                <span
                  className="inline-flex h-3.5 w-[1.15rem] overflow-hidden rounded-[2px] border border-line shadow-sm"
                  aria-hidden
                >
                  <svg viewBox="0 0 16 10" className="h-full w-full">
                    <rect width="16" height="10" fill="#006AA7" />
                    <rect x="5" width="2" height="10" fill="#FECC00" />
                    <rect y="4" width="16" height="2" fill="#FECC00" />
                  </svg>
                </span>
              ) : (
                <Icon name={item.icon} className="h-3.5 w-3.5 text-gold" />
              )}
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
