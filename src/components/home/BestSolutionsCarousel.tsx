"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";

export function BestSolutionsCarousel({
  children,
}: {
  children: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="relative mt-9">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition hover:border-gold lg:flex"
        aria-label="Previous products"
      >
        <Icon name="chevron" className="h-4 w-4 rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition hover:border-gold lg:flex"
        aria-label="Next products"
      >
        <Icon name="chevron" className="h-4 w-4" />
      </button>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
