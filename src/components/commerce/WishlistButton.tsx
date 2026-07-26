"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useWishlist } from "@/providers/WishlistProvider";
import type { Product } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

export function WishlistButton({
  product,
  productId,
  variant = "button",
}: {
  product?: Product;
  productId?: string | number;
  variant?: "button" | "icon";
}) {
  const { isWishlisted, toggle } = useWishlist();
  const id = product?.id ?? productId;
  const active = id != null ? isWishlisted(id) : false;
  const [pending, setPending] = useState(false);

  async function onToggle() {
    const target = product ?? productId;
    if (target == null) return;
    setPending(true);
    const res = await toggle(target);
    setPending(false);
    if (!res.ok) toast(res.error || "Wishlist failed", "err");
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void onToggle();
        }}
        disabled={pending}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-60 ${
          active
            ? "border-gold bg-gold text-white"
            : "border-line/80 bg-white/90 text-ink hover:border-gold hover:text-gold"
        }`}
      >
        <Icon name="heart" className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void onToggle()}
      disabled={pending}
      className={`rounded-md border px-5 py-3.5 text-xs tracking-[0.16em] uppercase transition disabled:opacity-60 ${
        active
          ? "border-gold bg-gold/10 text-gold-deep"
          : "border-line text-ink hover:border-gold"
      }`}
    >
      {active ? "Wishlisted" : "Add to wishlist"}
    </button>
  );
}
