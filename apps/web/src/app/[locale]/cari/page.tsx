"use client";

import { use as usePromise, useState } from "react";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";

interface SearchResults {
  ayah?: { surah_id: number; number: number; translation: string; surah_name: string }[];
  tafsir?: { ayah_id: number; text: string; source: string }[];
  kisah?: { slug: string; title: string }[];
  ebook?: { id: number; title: string }[];
}

export default function CariPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(false);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await api.get<{ results: SearchResults }>(
        `/quran/search?q=${encodeURIComponent(q)}&lang=${locale}`
      );
      setResults(res.results);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{dict.nav.searchPlaceholder}</h1>
      <form onSubmit={runSearch} className="mt-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.nav.searchPlaceholder}
          className="w-full rounded-full border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm"
        />
        <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm text-white dark:bg-accent dark:text-primary">
          🔍
        </button>
      </form>

      {loading && <p className="mt-6 text-sm text-[var(--color-text-secondary)]">{dict.common.loading}</p>}

      {results.ayah && results.ayah.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-accent">{dict.reader.allSurah}</h2>
          <div className="mt-2 space-y-2">
            {results.ayah.map((r, i) => (
              <p key={i} className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
                <span className="font-medium text-accent">{r.surah_name} : {r.number}</span> — {r.translation}
              </p>
            ))}
          </div>
        </section>
      )}

      {results.kisah && results.kisah.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-accent">{dict.nav.kisah}</h2>
          <div className="mt-2 space-y-2">
            {results.kisah.map((r) => (
              <Link key={r.slug} href={`/${locale}/kisah/${r.slug}`} className="block rounded-lg border border-[var(--color-border)] p-3 text-sm hover:border-accent">
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
