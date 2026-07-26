export const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Health Goals", href: "/goals" },
  { label: "Our Story", href: "/story" },
  { label: "Swedish Formula™", href: "/swedish-formula" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Journal", href: "/journal" },
] as const;

export const trustMessages = [
  { label: "Founded in Sweden", icon: "sweden" },
  { label: "Evidence-Based Formulas", icon: "shieldLeaf" },
  { label: "Fast Delivery Across Saudi Arabia", icon: "truck" },
  { label: "100% Authentic & Quality Verified", icon: "shieldCheck" },
] as const;

export const whyRen = [
  {
    title: "Founded in Sweden",
    body: "Rooted in Swedish values of science, quality and trust.",
    icon: "sweden" as const,
  },
  {
    title: "Swedish Formula™",
    body: "Developed in Sweden with precision and backed by science.",
    icon: "beaker" as const,
  },
  {
    title: "Swedish Promise™",
    body: "Transparency, premium ingredients and uncompromising quality.",
    icon: "shieldLeaf" as const,
  },
] as const;

export const healthGoals = [
  {
    slug: "healthy-skin",
    title: "Healthy Skin",
    icon: "goalSkin" as const,
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "performance",
    title: "Muscle & Performance",
    icon: "goalMuscle" as const,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "bones-joints",
    title: "Bones & Joints",
    icon: "goalJoints" as const,
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "heart",
    title: "Heart Health",
    icon: "goalHeart" as const,
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "better-sleep",
    title: "Better Sleep",
    icon: "goalSleep" as const,
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "pregnancy",
    title: "Pregnancy & Prenatal",
    icon: "goalPregnancy" as const,
    image:
      "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "kids",
    title: "Kids Health",
    icon: "goalKids" as const,
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
  },
] as const;

export const featuredProducts = [
  {
    id: "1",
    name: "Super Multi Collagen",
    brand: "REN",
    detail: "Types I, II & III",
    benefit: "Hair · Skin · Nails · Joints",
    price: 189,
    currency: "SAR",
    rating: 4.9,
    reviews: 198,
    bestseller: true,
  },
  {
    id: "2",
    name: "Magnesium Bisglycinate",
    brand: "REN",
    detail: "Muscle & Nerve Support",
    benefit: "Calm · Sleep · Recovery",
    price: 129,
    currency: "SAR",
    rating: 4.9,
    reviews: 162,
    bestseller: false,
  },
  {
    id: "3",
    name: "Omega-3 Fish Oil",
    brand: "REN",
    detail: "EPA & DHA Complex",
    benefit: "Heart · Brain · Vision",
    price: 149,
    currency: "SAR",
    rating: 4.8,
    reviews: 124,
    bestseller: false,
  },
  {
    id: "4",
    name: "Vitamin D3 + K2",
    brand: "REN",
    detail: "Bone & Immune Support",
    benefit: "Bones · Immunity · Mood",
    price: 99,
    currency: "SAR",
    rating: 4.9,
    reviews: 211,
    bestseller: false,
  },
  {
    id: "5",
    name: "Probiotic Complex",
    brand: "REN",
    detail: "Gut Health Formula",
    benefit: "Digestion · Balance · Vitality",
    price: 139,
    currency: "SAR",
    rating: 4.7,
    reviews: 96,
    bestseller: false,
  },
] as const;

export const journalArticles = [
  {
    slug: "swedish-guide-daily-wellness",
    category: "Lifestyle",
    title: "The Swedish Guide to Daily Wellness",
    excerpt:
      "Small rituals, clear priorities, and a quieter approach to feeling well every day.",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "how-we-develop-swedish-formulas",
    category: "Science",
    title: "How We Develop Swedish Formulas",
    excerpt:
      "From ingredient selection to verified dosages — the quiet craft behind every formula.",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "power-of-nature-swedish-health",
    category: "Wellness",
    title: "The Power of Nature in Swedish Health",
    excerpt:
      "Scandinavian landscapes teach us purity, balance, and respect for what the body needs.",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1448375240586-8824747fcc0b?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

export const footerTrust = [
  {
    title: "Fast & Reliable Shipping",
    body: "Across Saudi Arabia",
    icon: "truck",
  },
  {
    title: "Secure Payments",
    body: "100% safe & encrypted",
    icon: "shieldCheck",
  },
  {
    title: "Customer Care",
    body: "We're here to help",
    icon: "care",
  },
  {
    title: "Easy Returns",
    body: "14-day return policy",
    icon: "return",
  },
] as const;

/** Hero slider slides — bright Scandinavian mornings */
export const heroSlides = [
  {
    id: "lake-dawn",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80",
    alt: "Misty lake at sunrise surrounded by mountains",
  },
  {
    id: "alpine-boat",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80",
    alt: "Turquoise alpine lake with wooden boat",
  },
  {
    id: "forest-shore",
    image:
      "https://images.unsplash.com/photo-1448375240586-8824747fcc0b?auto=format&fit=crop&w=2400&q=80",
    alt: "Sunlit Scandinavian forest path",
  },
  {
    id: "calm-water",
    image:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2400&q=80",
    alt: "Calm northern lake reflecting morning light",
  },
] as const;

/** Bright Scandinavian lake morning — airy, not winter-dark */
export const heroImage = heroSlides[0].image;

/** Place studio product PNG at: public/images/hero-product.png */
export const heroProductPath = "/images/hero-product.png";
