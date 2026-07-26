import Link from "next/link";

export function Logo({
  className = "",
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "ink";
}) {
  const color = tone === "gold" ? "text-gold" : "text-ink";

  return (
    <Link
      href="/"
      className={`group inline-flex flex-col items-center leading-none ${color} ${className}`}
      aria-label="REN Health — Home"
    >
      <span className="relative font-serif text-[1.85rem] tracking-[0.2em]">
        <svg
          viewBox="0 0 24 24"
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-[55%] transition-transform duration-500 group-hover:-translate-y-[70%]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden
        >
          <path d="M12 3c4 3 6 6.5 6 10a6 6 0 1 1-12 0c0-3.5 2-7 6-10Z" />
          <path d="M12 8v9" />
        </svg>
        REN
      </span>
      <span className="mt-1.5 flex items-center gap-2">
        <span className="h-px w-4 bg-current opacity-50" />
        <span className="font-sans text-[0.62rem] tracking-[0.38em]">
          HEALTH
        </span>
        <span className="h-px w-4 bg-current opacity-50" />
      </span>
    </Link>
  );
}
