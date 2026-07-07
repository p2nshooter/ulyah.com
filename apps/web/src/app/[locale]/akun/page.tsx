"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";

interface Me {
  email: string;
  donations: { id: number; provider: string; amount: number | null; type: string; status: string; created_at: string }[];
  keysDonated: { id: number; provider: string; status: string; created_at: string }[];
}

export default function AkunPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Me>("/client/me")
      .then(setMe)
      .catch(() => router.push(`/${locale}/masuk`))
      .finally(() => setLoading(false));
  }, [locale, router]);

  async function logout() {
    await api.post("/client/logout");
    router.push(`/${locale}`);
  }

  if (loading) return <div className="px-6 py-20 text-center text-sm">{dict.common.loading}</div>;
  if (!me) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">{dict.auth.myDashboard}</h1>
        <button onClick={logout} className="text-sm text-danger">
          {dict.auth.logout}
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{me.email}</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-accent">{dict.auth.donationHistory}</h2>
        <div className="mt-2 space-y-2">
          {me.donations.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">—</p>}
          {me.donations.map((d) => (
            <div key={d.id} className="flex justify-between rounded-lg border border-[var(--color-border)] p-3 text-sm">
              <span>{d.provider} · {d.type}</span>
              <span className={d.status === "confirmed" ? "text-success" : "text-warning"}>
                {d.amount ? `$${d.amount}` : d.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-accent">{dict.auth.keysDonated}</h2>
        <div className="mt-2 space-y-2">
          {me.keysDonated.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">—</p>}
          {me.keysDonated.map((k) => (
            <div key={k.id} className="flex justify-between rounded-lg border border-[var(--color-border)] p-3 text-sm">
              <span>{k.provider}</span>
              <span className={k.status === "active" ? "text-success" : "text-warning"}>{k.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
