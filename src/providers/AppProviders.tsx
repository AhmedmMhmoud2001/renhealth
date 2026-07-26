"use client";

import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";
import { ToastHost } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <ToastHost />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
