"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";

function isUnverifiedError(message?: string) {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("not verified") || m.includes("verify before");
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
  const [loginValue, setLoginValue] = useState(search.get("login") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (search.get("verified") === "1") {
      setInfo("تم تفعيل الحساب بنجاح. سجّل الدخول الآن.");
    }
  }, [search]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);
    const res = await login(loginValue, password);
    setPending(false);
    if (!res.ok) {
      if (isUnverifiedError(res.error)) {
        router.push(
          `/verify?login=${encodeURIComponent(loginValue.trim())}&next=${encodeURIComponent(next)}`,
        );
        return;
      }
      setError(res.error || "Login failed");
      return;
    }
    router.push(next);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 max-w-md rounded-2xl border border-line bg-surface-card p-6 md:p-8"
    >
      <label className="block text-sm">
        Email or phone
        <input
          required
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          className="mt-2 w-full rounded-md border border-line px-3 py-2.5"
        />
      </label>
      <label className="mt-4 block text-sm">
        Password
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-md border border-line px-3 py-2.5"
        />
      </label>
      {error ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-red-700">{error}</p>
          {isUnverifiedError(error) ? (
            <Link
              href={`/verify?login=${encodeURIComponent(loginValue.trim())}`}
              className="inline-block text-sm text-gold"
            >
              Verify your account →
            </Link>
          ) : null}
        </div>
      ) : null}
      {info ? <p className="mt-3 text-sm text-ink-soft">{info}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-md bg-ink py-3 text-xs tracking-[0.18em] uppercase text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="text-gold">
          Create account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-ink">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link href="/verify" className="text-muted hover:text-ink">
          Need to verify account?
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div>
      <PageHeader
        title="Sign in"
        subtitle="Welcome back to REN Health."
        crumbs={[{ label: "Home", href: "/" }, { label: "Sign in" }]}
      />
      <div className="section-max section-pad pb-16">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
