"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await register(form);
    setPending(false);
    if (!res.ok) {
      setError(res.error || "Registration failed");
      return;
    }
    if (res.needsVerification) {
      router.push(`/verify?login=${encodeURIComponent(form.email)}`);
      return;
    }
    router.push("/account");
  }

  return (
    <div>
      <PageHeader
        title="Create account"
        subtitle="Join REN Health for a quieter standard of wellness."
        crumbs={[{ label: "Home", href: "/" }, { label: "Register" }]}
      />
      <div className="section-max section-pad pb-16">
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-line bg-surface-card p-6 md:p-8"
        >
          {(
            [
              ["name", "Full name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["password", "Password"],
              ["password_confirmation", "Confirm password"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                required
                type={key.includes("password") ? "password" : key === "email" ? "email" : "text"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-2 w-full rounded-md border border-line px-3 py-2.5"
              />
            </label>
          ))}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-ink py-3 text-xs tracking-[0.18em] uppercase text-white disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-gold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
