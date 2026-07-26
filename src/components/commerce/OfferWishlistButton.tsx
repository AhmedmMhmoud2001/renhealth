"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";

export function OfferWishlistButton({ offerId }: { offerId: string | number }) {
  const { token } = useAuth();
  const [active, setActive] = useState(false);
  const [pending, setPending] = useState(false);

  async function onToggle() {
    if (!token) {
      toast("Sign in to wishlist", "err");
      return;
    }
    setPending(true);
    const res = await api.toggleOfferWishlist(offerId);
    setPending(false);
    if (!res.ok) {
      toast(res.error || "Failed", "err");
      return;
    }
    setActive(!active);
    toast(active ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); void onToggle(); }}
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
