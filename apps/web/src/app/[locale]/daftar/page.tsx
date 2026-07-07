"use client";

import { use as usePromise, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";

export default function DaftarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/client/register", { name, email, password });
      router.push(`/${locale}/akun`);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="font-heading text-2xl">{dict.auth.registerTitle}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.auth.name} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.auth.email} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={dict.auth.password} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        {error && <p className="text-xs text-danger">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent dark:text-primary">
          {busy ? "..." : dict.auth.registerButton}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
        {dict.auth.hasAccount}{" "}
        <Link href={`/${locale}/masuk`} className="text-accent hover:underline">
          {dict.auth.loginButton}
        </Link>
      </p>
    </div>
  );
}
