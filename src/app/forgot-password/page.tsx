"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    const res = await api.resetSendCode({ email });
    if (!res.ok) return setError(res.error);
    setError(null);
    setMessage("Code sent");
    setStep(2);
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    const res = await api.resetVerifyCode({ email, code });
    if (!res.ok) return setError(res.error);
    setError(null);
    const data = res.data && typeof res.data === "object" ? res.data as Record<string, unknown> : null;
    const token = data?.reset_token || data?.token || "";
    setResetToken(String(token));
    setStep(3);
  }

  async function setNew(e: FormEvent) {
    e.preventDefault();
    const res = await api.resetSetPassword({
      reset_token: resetToken,
      password,
      password_confirmation: password,
    });
    if (!res.ok) return setError(res.error);
    setError(null);
    setMessage("Password updated. You can sign in.");
  }

  return (
    <div>
      <PageHeader title="Reset password" crumbs={[{ label: "Sign in", href: "/login" }, { label: "Reset" }]} />
      <div className="section-max section-pad pb-16">
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-line bg-surface-card p-6">
          {step === 1 ? (
            <form onSubmit={sendCode} className="space-y-4">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-md border border-line px-3 py-2.5"
              />
              <button type="submit" className="w-full rounded-md bg-ink py-3 text-xs uppercase tracking-[0.18em] text-white">
                Send code
              </button>
            </form>
          ) : null}
          {step === 2 ? (
            <form onSubmit={verify} className="space-y-4">
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Verification code"
                className="w-full rounded-md border border-line px-3 py-2.5"
              />
              <button type="submit" className="w-full rounded-md bg-ink py-3 text-xs uppercase tracking-[0.18em] text-white">
                Verify code
              </button>
            </form>
          ) : null}
          {step === 3 ? (
            <form onSubmit={setNew} className="space-y-4">
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-md border border-line px-3 py-2.5"
              />
              <button type="submit" className="w-full rounded-md bg-ink py-3 text-xs uppercase tracking-[0.18em] text-white">
                Update password
              </button>
            </form>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
