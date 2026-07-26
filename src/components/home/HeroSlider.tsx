"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ProductTub } from "@/components/ui/ProductTub";

const badges = [
  { label: "Swedish Formula™", icon: "formula" as const },
  { label: "Swedish Promise™", icon: "promise" as const },
  { label: "Quality Verified", icon: "verified" as const },
];

const SLIDE_MS = 6500;

export type HeroSlide = {
  id: string;
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  link?: string;
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const list = slides.length > 0 ? slides : [];
  const [index, setIndex] = useState(0);
  const [hasProductImage, setHasProductImage] = useState(true);
  const [badgesReady, setBadgesReady] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      if (!list.length) return;
      setIndex((i + list.length) % list.length);
    },
    [list.length],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setBadgesReady(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (list.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % list.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [list.length]);

  const slide = list[index] ?? list[0];

  return (
    <section className="relative min-h-[min(92vh,820px)] overflow-hidden bg-ink">
      {list.map((item, i) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={item.image}
            alt={item.alt}
            fill
            priority={i === 0}
            className={`object-cover object-[center_45%] ${
              i === index ? "animate-hero-ken-burns" : "scale-105"
            }`}
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

      <div className="section-max section-pad relative grid min-h-[min(92vh,820px)] items-center gap-8 py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-4">
        <div className="relative z-10 max-w-xl text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
          <h1 className="animate-fade-up font-serif text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.35rem]">
            {slide?.title || (
              <>
                The Swedish Way <span className="text-gold-soft">of Better</span>{" "}
                Health
              </>
            )}
          </h1>

          <div className="animate-fade-up-delay-1 mt-6 flex flex-col items-start gap-3">
            <Icon name="crown" className="h-4 w-4 text-gold" />
            <span className="h-px w-16 bg-gold animate-reveal-line" />
          </div>

          <p className="animate-fade-up-delay-1 mt-5 text-sm font-semibold tracking-[0.04em] text-white sm:text-base">
            Founded in Sweden. Crafted with Swedish Precision.
          </p>

          <p className="animate-fade-up-delay-2 mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-[15px]">
            {slide?.subtitle ||
              "Evidence-based supplements made with premium ingredients to support your health, every day."}
          </p>

          <Link
            href={slide?.link || "/story"}
            className="animate-fade-up-delay-2 group mt-9 inline-flex items-center gap-3 rounded-md border border-white/15 bg-ink px-7 py-3.5 text-xs tracking-[0.22em] uppercase text-white shadow-lg transition hover:bg-ink/80"
          >
            Discover REN
            <Icon
              name="chevron"
              className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-xl items-center justify-center pb-10 lg:justify-end lg:pr-16">
          <div className="animate-soft-float relative aspect-[3/4] w-full max-w-[380px]">
            {hasProductImage ? (
              <Image
                src="/images/hero-product.png"
                alt="REN Health Super Multi Collagen"
                fill
                priority
                className="object-contain object-center drop-shadow-[0_28px_50px_rgba(0,0,0,0.45)]"
                sizes="(max-width: 1024px) 85vw, 380px"
                onError={() => setHasProductImage(false)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ProductTub detail="10,000 mg COLLAGEN PEPTIDES · TYPES I, II & III" />
              </div>
            )}
          </div>

          <div className="absolute -right-1 top-[10%] hidden flex-col gap-4 lg:flex xl:-right-2">
            {badges.map((badge, i) => (
              <div
                key={badge.label}
                className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/80 bg-white px-2.5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)] xl:h-28 xl:w-28 xl:px-3 ${
                  badgesReady ? "animate-slide-in-right" : "opacity-0"
                }`}
                style={
                  badgesReady
                    ? { animationDelay: `${0.35 + i * 0.18}s` }
                    : undefined
                }
              >
                <Icon
                  name={badge.icon}
                  className="mb-1.5 h-6 w-6 text-gold xl:h-7 xl:w-7"
                />
                <span className="text-[9px] font-medium leading-tight tracking-[0.06em] uppercase text-ink-soft xl:text-[10px]">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {list.length > 1 ? (
        <div
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5"
          role="tablist"
          aria-label="Hero slides"
        >
          {list.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                i === index
                  ? "w-7 bg-gold"
                  : "w-2.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
