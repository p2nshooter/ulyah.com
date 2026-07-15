"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api, ApiError } from "@/lib/api";

export default function DaftarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Carried over from the login page when the entered email wasn't registered.
  // Read after mount (not useSearchParams) so this static page needs no
  // Suspense boundary and stays hydration-safe.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("email");
    if (q) setEmail(q);
  }, []);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // The email is already taken — send them to login instead of looping here.
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAlreadyExists(false);
    setBusy(true);
    try {
      await api.post("/client/register", { name, email, password });
      router.push(`/${locale}/akun`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setAlreadyExists(true);
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="font-heading text-2xl">{dict.auth.registerTitle}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        {locale === "id"
          ? "Semua konten ULYAH.COM gratis untuk siapa saja tanpa perlu mendaftar. Akun ini hanya opsional — untuk donatur yang ingin melacak riwayat donasi dan menerima sertifikat kenang-kenangan."
          : "Every ULYAH.COM feature is free to use without an account. This is optional — only for donors who want to track their donation history and receive a keepsake certificate."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.auth.name} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.auth.email} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={dict.auth.password} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        {error && <p className="text-xs text-danger">{error}</p>}
        {alreadyExists && (
          <Link
            href={`/${locale}/masuk?email=${encodeURIComponent(email)}`}
            className="block rounded-lg border border-accent bg-accent/10 px-4 py-2.5 text-center text-sm font-medium text-accent"
          >
            {dict.auth.loginButton} →
          </Link>
        )}
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
