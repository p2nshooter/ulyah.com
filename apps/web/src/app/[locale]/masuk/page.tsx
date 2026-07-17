"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api, ApiError } from "@/lib/api";

export default function MasukPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Prefill the email if we arrived here from "Daftar → sudah punya akun".
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("email");
    if (q) setEmail(q);
  }, []);
  // When the email simply isn't registered yet, guide the user straight to
  // "Daftar" (carrying the email over) instead of leaving them re-typing a
  // password for an account that doesn't exist.
  const [notRegistered, setNotRegistered] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotRegistered(false);
    setBusy(true);
    try {
      await api.post("/client/login", { email, password });
      router.push(`/${locale}/akun`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "email_not_found") setNotRegistered(true);
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="font-heading text-2xl">{dict.auth.loginTitle}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.auth.email} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={dict.auth.password} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        {error && <p className="text-xs text-danger">{error}</p>}
        {notRegistered && (
          <Link
            href={`/${locale}/daftar?email=${encodeURIComponent(email)}`}
            className="block rounded-lg border border-accent bg-accent/10 px-4 py-2.5 text-center text-sm font-medium text-accent"
          >
            {dict.auth.registerButton} →
          </Link>
        )}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent dark:text-primary">
          {busy ? "..." : dict.auth.loginButton}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
        {dict.auth.noAccount}{" "}
        <Link href={`/${locale}/daftar`} className="text-accent hover:underline">
          {dict.auth.registerButton}
        </Link>
      </p>
    </div>
  );
}
