"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/providers/CartProvider";
import type { Product } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

export function AddToCartButton({
  product,
  productId,
  quantity = 1,
  className = "",
  label,
}: {
  product?: Product;
  productId?: string | number;
  quantity?: number;
  className?: string;
  label?: string;
}) {
  const { addItem } = useCart();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onClick() {
    const target = product ?? productId;
    if (target == null) return;
    setPending(true);
    const res = await addItem(target, quantity);
    setPending(false);
    if (res.ok) {
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } else {
      toast(res.error || "Could not add to cart", "err");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={pending}
      className={
        className ||
        "flex h-9 w-9 items-center justify-center rounded-full bg-gold text-white transition hover:bg-gold-deep disabled:opacity-60"
      }
      aria-label={label || "Add to cart"}
    >
      {label ? (
        <span className="text-xs tracking-[0.16em] uppercase">
          {pending ? "..." : done ? "Added" : label}
        </span>
      ) : (
        <Icon name="plus" className="h-4 w-4" />
      )}
    </button>
  );
}
