"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Category, Brand } from "@/lib/api";

type FilterParams = {
  search?: string;
  category_id?: string;
  brand_id?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
  is_new?: string;
  wishlisted?: string;
  has_offers?: string;
};

type Props = {
  categories: Category[];
  brands: Brand[];
  params: FilterParams;
};

const MAX_PRICE = 10000;

const SORT_OPTIONS = [
  { value: "latest", label: "Latest", icon: "clock" },
  { value: "price_asc", label: "Price: Low to High", icon: "trendUp" },
  { value: "price_desc", label: "Price: High to Low", icon: "trendDown" },
] as const;

const PRICE_CHIPS = [
  { label: "All", min: "", max: "" },
  { label: "0 - 500", min: "0", max: "500" },
  { label: "500 - 1000", min: "500", max: "1000" },
  { label: "1000 - 2000", min: "1000", max: "2000" },
  { label: "2000+", min: "2000", max: "" },
] as const;

function buildQs(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") q.set(k, v); });
  const s = q.toString();
  return s;
}

function GridIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function PillIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <rect x="8" y="2" width="8" height="20" rx="4" />
      <path d="M8 12h8" />
    </svg>
  );
}

function DumbbellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 5v14M18 5v14M6 12h12M3 8v8M21 8v8" />
    </svg>
  );
}

function CapsuleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}

function FitnessIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="5" r="2" />
      <path d="M10 22l-2-6 4-2 4 2-2 6M8 10V7M16 10V7" />
    </svg>
  );
}

function BagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function GiftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M12 8v13M3 12h18M7.5 8c-1.5 0-3-1-3-3.5S6 2 7.5 2c2.5 0 4.5 3 4.5 6M16.5 8c1.5 0 3-1 3-3.5S18 2 16.5 2c-2.5 0-4.5 3-4.5 6" />
    </svg>
  );
}

function ChevronIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FilterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="8" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function TrendUpIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </svg>
  );
}

function TrendDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="m3 7 6 6 4-4 8 8" />
      <path d="M17 17h4v-4" />
    </svg>
  );
}

function TagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

function FireIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 12c2-3 4-4 5-7-2 2-4 3-5 7Z" />
      <path d="M12 12c-2-3-4-4-5-7 2 2 4 3 5 7Z" />
      <path d="M8.5 16.5c0 2.5 1.5 4.5 3.5 4.5s3.5-2 3.5-4.5c0-1.5-1-3-3.5-4.5-2.5 1.5-3.5 3-3.5 4.5Z" />
    </svg>
  );
}

function HeartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M19.5 12.6 12 20l-7.5-7.4a4.5 4.5 0 0 1 6.4-6.3L12 7l1.1-.7a4.5 4.5 0 0 1 6.4 6.3Z" />
    </svg>
  );
}

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3Z" />
    </svg>
  );
}

function SparkleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" />
    </svg>
  );
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("vitamin")) return <PillIcon />;
  if (lower.includes("protein")) return <DumbbellIcon />;
  if (lower.includes("supplement")) return <CapsuleIcon />;
  if (lower.includes("fitness")) return <FitnessIcon />;
  if (lower.includes("accessor")) return <BagIcon />;
  if (lower.includes("bundle") || lower.includes("wellness")) return <GiftIcon />;
  return <GridIcon />;
}

function getSortIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("clock") || lower === "latest") return <ClockIcon />;
  if (lower.includes("up") || lower.includes("low")) return <TrendUpIcon />;
  if (lower.includes("down") || lower.includes("high")) return <TrendDownIcon />;
  return <ClockIcon />;
}

function CollapsibleSection({
  id,
  title,
  icon,
  defaultOpen = true,
  children,
  openSections,
  toggleSection,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  openSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
}) {
  const isOpen = openSections[id] ?? defaultOpen;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
          {icon}
          {title}
        </span>
        <ChevronIcon
          className={`h-4 w-4 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

export function ShopFilter({ categories, brands, params }: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    sort: true,
    brand: true,
    price: true,
    other: true,
  });

  const [minVal, setMinVal] = useState(params.min_price || "0");
  const [maxVal, setMaxVal] = useState(params.max_price || String(MAX_PRICE));
  const [activeChip, setActiveChip] = useState(() => {
    if (!params.min_price && !params.max_price) return 0;
    const m = PRICE_CHIPS.findIndex(
      (c) => c.min === (params.min_price || "") && c.max === (params.max_price || ""),
    );
    return m >= 0 ? m : -1;
  });

  useEffect(() => {
    setMinVal(params.min_price || "0");
    setMaxVal(params.max_price || String(MAX_PRICE));
  }, [params.min_price, params.max_price]);

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const navigate = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const qs = buildQs(newParams);
      router.push(qs ? `/shop?${qs}` : "/shop");
      setMobileOpen(false);
    },
    [router],
  );

  const baseParams: FilterParams = {
    search: params.search,
    category_id: params.category_id,
    brand_id: params.brand_id,
    min_price: params.min_price,
    max_price: params.max_price,
    is_new: params.is_new,
    wishlisted: params.wishlisted,
    has_offers: params.has_offers,
    sort: params.sort,
  };

  const hasFilters =
    params.search ||
    params.category_id ||
    params.brand_id ||
    params.min_price ||
    params.max_price ||
    params.is_new ||
    params.wishlisted ||
    params.has_offers;

  function applyPrice() {
    navigate({
      ...baseParams,
      min_price: minVal && minVal !== "0" ? minVal : undefined,
      max_price: maxVal && maxVal !== String(MAX_PRICE) ? maxVal : undefined,
      page: "1",
    });
  }

  function clearAll() {
    router.push("/shop");
    setMinVal("0");
    setMaxVal(String(MAX_PRICE));
    setActiveChip(0);
    setMobileOpen(false);
  }

  const minPercent = (Number(minVal) / MAX_PRICE) * 100;
  const maxPercent = (Number(maxVal) / MAX_PRICE) * 100;

  function FilterContent({ onClose }: { onClose?: () => void }) {
    return (
      <div className="space-y-4">
        {/* Clear All */}
        {hasFilters ? (
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
              {[
                params.category_id && "Category",
                params.brand_id && "Brand",
                (params.min_price || params.max_price) && "Price",
                params.is_new && "New",
                params.wishlisted && "Wishlisted",
                params.has_offers && "On Offer",
                params.sort && params.sort !== "latest" && "Sorted",
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-gold transition-colors hover:text-gold-deep"
            >
              Clear All
            </button>
          </div>
        ) : null}

        {/* Categories */}
        <CollapsibleSection
          id="categories"
          title="Categories"
          icon={<TagIcon className="h-3.5 w-3.5" />}
          openSections={openSections}
          toggleSection={toggleSection}
        >
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() =>
                  navigate({
                    ...baseParams,
                    category_id: undefined,
                    page: "1",
                  })
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  !params.category_id
                    ? "bg-gold/10 font-medium text-gold-deep"
                    : "text-ink hover:bg-neutral-50"
                }`}
              >
                <GridIcon className="h-4 w-4 flex-shrink-0 opacity-60" />
                <span className="flex-1">All Products</span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={String(cat.id)}>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      ...baseParams,
                      category_id: String(cat.id),
                      page: "1",
                    })
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    String(params.category_id) === String(cat.id)
                      ? "bg-gold/10 font-medium text-gold-deep"
                      : "text-ink hover:bg-neutral-50"
                  }`}
                >
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center opacity-60">
                    {getCategoryIcon(cat.name)}
                  </span>
                  <span className="flex-1">{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Sort */}
        <CollapsibleSection
          id="sort"
          title="Sort"
          icon={<ClockIcon className="h-3.5 w-3.5" />}
          openSections={openSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-1">
            {SORT_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  navigate({
                    ...baseParams,
                    sort: value,
                    page: "1",
                  })
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  params.sort === value || (!params.sort && value === "latest")
                    ? "bg-gold/10 font-medium text-gold-deep"
                    : "text-ink hover:bg-neutral-50"
                }`}
              >
                <span className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  params.sort === value || (!params.sort && value === "latest")
                    ? "border-gold bg-gold"
                    : "border-neutral-300"
                }`}>
                  {params.sort === value || (!params.sort && value === "latest") ? (
                    <span className="h-[6px] w-[6px] rounded-full bg-white" />
                  ) : null}
                </span>
                <span className="opacity-60">{getSortIcon(value)}</span>
                <span className="flex-1 text-left">{label}</span>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Brand */}
        <CollapsibleSection
          id="brand"
          title="Brand"
          icon={<TagIcon className="h-3.5 w-3.5" />}
          openSections={openSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-1">
            <button
              type="button"
              onClick={() =>
                navigate({
                  ...baseParams,
                  brand_id: undefined,
                  page: "1",
                })
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                !params.brand_id
                  ? "bg-gold/10 font-medium text-gold-deep"
                  : "text-ink hover:bg-neutral-50"
              }`}
            >
              <span className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${
                !params.brand_id ? "border-gold bg-gold" : "border-neutral-300"
              }`}>
                {!params.brand_id ? (
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="m4 12 5 5 11-11" />
                  </svg>
                ) : null}
              </span>
              <span className="flex-1">All</span>
            </button>
            {brands.map((b) => (
              <button
                key={String(b.id)}
                type="button"
                onClick={() =>
                  navigate({
                    ...baseParams,
                    brand_id: String(b.id),
                    page: "1",
                  })
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  String(params.brand_id) === String(b.id)
                    ? "bg-gold/10 font-medium text-gold-deep"
                    : "text-ink hover:bg-neutral-50"
                }`}
              >
                <span className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${
                  String(params.brand_id) === String(b.id)
                    ? "border-gold bg-gold"
                    : "border-neutral-300"
                }`}>
                  {String(params.brand_id) === String(b.id) ? (
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="m4 12 5 5 11-11" />
                    </svg>
                  ) : null}
                </span>
                <span className="flex-1">{b.name}</span>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Price */}
        <CollapsibleSection
          id="price"
          title="Price"
          icon={<span className="text-xs font-semibold">L.E.</span>}
          openSections={openSections}
          toggleSection={toggleSection}
        >
          <p className="mb-4 text-xs text-muted">Select your price range</p>

          {/* Range slider */}
          <div className="relative mb-6 h-10 px-1">
            <div className="absolute top-[15px] left-1 right-1 h-[6px] rounded-full bg-neutral-200" />
            <div
              className="absolute top-[15px] h-[6px] rounded-full bg-gold transition-all duration-150"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(maxPercent - minPercent, 1)}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={50}
              value={minVal}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v <= Number(maxVal)) {
                  setMinVal(String(v));
                  setActiveChip(-1);
                }
              }}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.18)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[2.5px] [&::-moz-range-thumb]:border-gold [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.18)] [&::-moz-range-thumb]:active:cursor-grabbing"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={50}
              value={maxVal}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= Number(minVal)) {
                  setMaxVal(String(v));
                  setActiveChip(-1);
                }
              }}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.18)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[2.5px] [&::-moz-range-thumb]:border-gold [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.18)] [&::-moz-range-thumb]:active:cursor-grabbing"
              aria-label="Maximum price"
            />
          </div>

          {/* Min/Max inputs */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">Min</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={MAX_PRICE}
                  step={50}
                  value={minVal}
                  onChange={(e) => { setMinVal(e.target.value); setActiveChip(-1); }}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold/40"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">L.E.</span>
              </div>
            </div>
            <span className="mt-5 text-neutral-300">&mdash;</span>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-muted">Max</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={MAX_PRICE}
                  step={50}
                  value={maxVal}
                  onChange={(e) => { setMaxVal(e.target.value); setActiveChip(-1); }}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold/40"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">L.E.</span>
              </div>
            </div>
          </div>

          {/* Quick chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {PRICE_CHIPS.map((chip, i) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setMinVal(chip.min || "0");
                  setMaxVal(chip.max || String(MAX_PRICE));
                  setActiveChip(i);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-200 ${
                  activeChip === i
                    ? "border-gold bg-gold/10 font-medium text-gold-deep"
                    : "border-neutral-200 text-muted hover:border-neutral-300 hover:text-ink"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Apply */}
          <button
            type="button"
            onClick={applyPrice}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-ink/90 active:scale-[0.98]"
          >
            <FilterIcon className="h-4 w-4" />
            Apply Filter
          </button>
        </CollapsibleSection>

        {/* Other */}
        <CollapsibleSection
          id="other"
          title="Other"
          icon={<SparkleIcon className="h-3.5 w-3.5" />}
          openSections={openSections}
          toggleSection={toggleSection}
        >
          <div className="space-y-1">
            <button
              type="button"
              onClick={() =>
                navigate({
                  ...baseParams,
                  is_new: "1",
                  wishlisted: undefined,
                  has_offers: undefined,
                  page: "1",
                })
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                params.is_new === "1"
                  ? "bg-gold/10 font-medium text-gold-deep"
                  : "text-ink hover:bg-neutral-50"
              }`}
            >
              <StarIcon className="h-4 w-4 flex-shrink-0 opacity-60" />
              <span className="flex-1 text-left">New arrivals</span>
              <svg className="h-4 w-4 text-muted/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                navigate({
                  ...baseParams,
                  wishlisted: "1",
                  is_new: undefined,
                  has_offers: undefined,
                  page: "1",
                })
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                params.wishlisted === "1"
                  ? "bg-gold/10 font-medium text-gold-deep"
                  : "text-ink hover:bg-neutral-50"
              }`}
            >
              <HeartIcon className="h-4 w-4 flex-shrink-0 opacity-60" />
              <span className="flex-1 text-left">Wishlisted</span>
              <svg className="h-4 w-4 text-muted/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                navigate({
                  ...baseParams,
                  has_offers: "1",
                  is_new: undefined,
                  wishlisted: undefined,
                  page: "1",
                })
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                params.has_offers === "1"
                  ? "bg-gold/10 font-medium text-gold-deep"
                  : "text-ink hover:bg-neutral-50"
              }`}
            >
              <FireIcon className="h-4 w-4 flex-shrink-0 opacity-60" />
              <span className="flex-1 text-left">On Offer</span>
              <svg className="h-4 w-4 text-muted/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile Filter Button ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl lg:hidden"
        aria-label="Open filters"
      >
        <FilterIcon className="h-4 w-4" />
        Filters
        {hasFilters ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-medium">
            {[
              params.category_id,
              params.brand_id,
              (params.min_price || params.max_price) && "price",
              params.is_new,
              params.wishlisted,
              params.has_offers,
            ].filter(Boolean).length}
          </span>
        ) : null}
      </button>

      {/* ── Mobile Drawer ── */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-[360px] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 sm:w-[340px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur-md">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
                aria-label="Close filters"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FilterContent onClose={() => setMobileOpen(false)} />
            </div>
            <div className="sticky bottom-0 border-t border-neutral-100 bg-white/95 px-4 py-3 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-xl border border-neutral-200 py-3 text-sm font-medium text-ink transition-colors hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Desktop Sidebar ── */}
      <aside className="sticky top-[100px] hidden w-[300px] flex-shrink-0 space-y-4 self-start lg:block">
        <FilterContent />
      </aside>
    </>
  );
}
