"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Toast = { id: number; message: string; tone?: "ok" | "err" };

let pushToast: ((message: string, tone?: "ok" | "err") => void) | null = null;

export function toast(message: string, tone: "ok" | "err" = "ok") {
  pushToast?.(message, tone);
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    pushToast = (message, tone = "ok") => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl px-4 py-3 text-sm shadow-lg ${
            t.tone === "err"
              ? "bg-red-700 text-white"
              : "bg-ink text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
