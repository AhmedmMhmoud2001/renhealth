import { fetchSliders, mediaUrl } from "@/lib/api";
import { heroSlides as fallbackSlides } from "@/data/home";
import { HeroSlider } from "@/components/home/HeroSlider";

export async function Hero() {
  const res = await fetchSliders("home");
  const slides =
    res.items.length > 0
      ? res.items.map((s, i) => ({
          id: String(s.id ?? i),
          image:
            mediaUrl(s.image) ||
            fallbackSlides[i % fallbackSlides.length].image,
          alt: s.title || s.subtitle || "REN Health",
          title: s.title,
          subtitle: s.subtitle || s.description || undefined,
          link: s.link || undefined,
        }))
      : fallbackSlides.map((s) => ({
          id: s.id,
          image: s.image,
          alt: s.alt,
          title: undefined as string | undefined,
          subtitle: undefined as string | undefined,
          link: undefined as string | undefined,
        }));

  return <HeroSlider slides={slides} />;
}
