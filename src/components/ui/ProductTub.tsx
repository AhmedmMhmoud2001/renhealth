/**
 * Editorial product tub — black & gold packaging against light site surfaces.
 * Used until dedicated studio product photography is available.
 */
export function ProductTub({
  className = "",
  label = "SUPER MULTI\nCOLLAGEN",
  detail,
  decorative = false,
}: {
  className?: string;
  label?: string;
  detail?: string;
  decorative?: boolean;
}) {
  return (
    <div
      className={`relative ${className}`}
      aria-hidden={decorative ? true : undefined}
    >
      <div className="relative mx-auto w-[min(100%,280px)]">
        <div className="absolute -bottom-4 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-[100%] bg-ink/15 blur-xl" />

        <div className="relative z-10 mx-auto h-7 w-[88%] rounded-t-[18px] bg-gradient-to-b from-[#e8d5a8] via-[#c5a368] to-[#9a7a3e] shadow-sm" />
        <div className="relative z-10 mx-auto -mt-1 h-2.5 w-[92%] rounded-full bg-gradient-to-b from-[#d4bc8a] to-[#a8864a]" />

        <div className="relative overflow-hidden rounded-b-[22px] rounded-t-[10px] bg-gradient-to-b from-[#2a2a2a] via-[#141414] to-[#0a0a0a] px-6 pb-8 pt-10 shadow-[0_28px_60px_rgba(26,26,26,0.28)]">
          <div className="pointer-events-none absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col items-center text-center">
            <svg
              viewBox="0 0 24 24"
              className="mb-1 h-3.5 w-3.5 text-gold"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              aria-hidden
            >
              <path d="M12 3c4 3 6 6.5 6 10a6 6 0 1 1-12 0c0-3.5 2-7 6-10Z" />
            </svg>
            <p className="font-serif text-sm tracking-[0.28em] text-gold">REN</p>
            <p className="mt-0.5 text-[8px] tracking-[0.32em] text-white/55">
              HEALTH
            </p>
            <p className="mt-3 text-[7px] tracking-[0.2em] text-gold/70">
              FOUNDED IN SWEDEN
            </p>

            <div className="my-5 h-px w-16 bg-gold/40" />

            <p className="whitespace-pre-line font-serif text-[1.15rem] leading-tight tracking-[0.06em] text-gold">
              {label}
            </p>

            {detail ? (
              <p className="mt-3 text-[8px] tracking-[0.12em] text-white/65">
                {detail}
              </p>
            ) : null}

            <div className="mt-6 flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 text-[8px] tracking-wider text-gold">
              30
            </div>
          </div>
        </div>
      </div>
      {!decorative ? (
        <span className="sr-only">REN Health {label.replace(/\n/g, " ")}</span>
      ) : null}
    </div>
  );
}
