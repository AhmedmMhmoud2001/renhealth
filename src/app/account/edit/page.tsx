"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";

export default function EditProfilePage() {
  const { user, token, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("name", name);
    fd.append("email", email);
    fd.append("phone", phone);
    if (birthdate) fd.append("birthdate", birthdate);
    if (password) {
      fd.append("password", password);
      fd.append("password_confirmation", passwordConfirmation);
    }
    if (image) fd.append("image", image);

    const res = await api.updateProfile(fd);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess("Profile updated successfully");
    await refresh();
  }

  if (!token) {
    return (
      <div>
        <PageHeader title="Edit profile" />
        <div className="section-max section-pad py-12">
          <EmptyState title="Sign in" actionHref="/login?next=/account/edit" actionLabel="Sign in" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit profile"
        crumbs={[{ label: "Account", href: "/account" }, { label: "Edit profile" }]}
      />
      <div className="section-max section-pad py-12">
        <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-line bg-surface-card p-6">
          <label className="block text-sm">
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Birthdate
            <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="mt-1.5 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Profile image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm"
            />
          </label>
          <hr className="border-line" />
          <p className="text-xs text-muted">Leave blank to keep current password</p>
          <label className="block text-sm">
            New password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Confirm password
            <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="mt-1.5 w-full rounded-md border border-line px-3 py-2" />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}
          <button type="submit" disabled={pending} className="w-full rounded-md bg-ink py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60">
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
