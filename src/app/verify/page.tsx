"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";

function looksLikeEmail(value: string) {
  return value.includes("@");
}

function VerifyForm() {
  const router = useRouter();
  const search = useSearchParams();
  const initial = search.get("login") || search.get("email") || "";
  const next = search.get("next") || "/account";

  const [login, setLogin] = useState(initial);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    initial
      ? "حسابك غير مفعّل. أدخل رمز التحقق، أو اضغط إعادة الإرسال إذا لم يصلك الرمز."
      : null,
  );

  const mode = useMemo(
    () => (looksLikeEmail(login.trim()) ? "email" : "phone"),
    [login],
  );

  async function sendCode(target = login.trim()) {
    if (!target) {
      setError("أدخل البريد الإلكتروني أو رقم الجوال أولاً");
      return false;
    }
    setResending(true);
    setError(null);
    const body: Record<string, string> = looksLikeEmail(target)
      ? { email: target }
      : { phone: target };
    const res = await api.resendVerification(body);
    setResending(false);
    if (!res.ok) {
      setError(res.error);
      return false;
    }
    setMessage("تم إرسال رمز التحقق. راجع بريدك أو رسائل الجوال.");
    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!login.trim() || !code.trim()) return;
    setPending(true);
    setError(null);

    const res = looksLikeEmail(login.trim())
      ? await api.verifyEmail({ email: login.trim(), code: code.trim() })
      : await api.verifyPhone({ phone: login.trim(), code: code.trim() });

    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    setMessage("تم تفعيل الحساب بنجاح. يمكنك تسجيل الدخول الآن.");
    router.push(
      `/login?verified=1&login=${encodeURIComponent(login.trim())}&next=${encodeURIComponent(next)}`,
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-line bg-surface-card p-6 md:p-8"
      dir="rtl"
    >
      <p className="text-sm text-muted">
        فعّل حسابك عبر رمز التحقق المرسل إلى{" "}
        {mode === "email" ? "البريد الإلكتروني" : "رقم الجوال"}.
      </p>

      <label className="block text-sm">
        البريد أو الجوال
        <input
          required
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="mt-2 w-full rounded-md border border-line px-3 py-2.5 text-left"
          dir="ltr"
          placeholder="you@email.com أو +966..."
        />
      </label>

      <label className="block text-sm">
        رمز التحقق
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-2 w-full rounded-md border border-line px-3 py-2.5 tracking-[0.2em] text-left"
          dir="ltr"
          placeholder="رمز مكون من 6 أرقام"
          inputMode="numeric"
          autoFocus
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-ink-soft">{message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-ink py-3 text-xs tracking-[0.18em] uppercase text-white disabled:opacity-60"
      >
        {pending ? "جاري التحقق…" : "تفعيل الحساب"}
      </button>

      <button
        type="button"
        onClick={() => void sendCode()}
        disabled={resending}
        className="w-full rounded-md border border-line py-3 text-xs tracking-[0.18em] uppercase text-ink disabled:opacity-60"
      >
        {resending ? "جاري الإرسال…" : "إعادة إرسال الرمز"}
      </button>

      <p className="text-center text-sm text-muted">
        تم التفعيل؟{" "}
        <Link href="/login" className="text-gold">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}

export default function VerifyPage() {
  return (
    <div>
      <PageHeader
        title="تفعيل الحساب"
        subtitle="أدخل رمز التحقق لإكمال تسجيل الدخول."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Sign in", href: "/login" },
          { label: "Verify" },
        ]}
      />
      <div className="section-max section-pad pb-16">
        <Suspense>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
