"use client";

import { Suspense, use as usePromise, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { NarrateButton } from "@/components/NarrateButton";

interface SearchResults {
  ayah?: { surah_id: number; number: number; translation: string; surah_name: string }[];
  tafsir?: { ayah_id: number; text: string; source: string }[];
  hadits?: { id: number; text_id: string; text_en?: string; source: string }[];
  kisah?: { slug: string; title: string }[];
  ebook?: { id: number; title: string }[];
}

// useSearchParams requires a Suspense boundary to prerender, hence the
// inner/outer split.
export default function CariPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={null}>
      <CariPageInner params={params} />
    </Suspense>
  );
}

function CariPageInner({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function doSearch(query: string) {
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await api.get<{ results: SearchResults }>(
        `/quran/search?q=${encodeURIComponent(query)}&lang=${locale}`
      );
      setResults(res.results);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  // Deep-linkable search: the header search box submits here as /cari?q=…,
  // so run that query immediately on arrival.
  useEffect(() => {
    const fromUrl = searchParams.get("q");
    if (fromUrl && fromUrl.trim().length >= 2) {
      setQ(fromUrl);
      doSearch(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    await doSearch(q);
  }

  const totalResults =
    (results.ayah?.length ?? 0) + (results.hadits?.length ?? 0) + (results.kisah?.length ?? 0) + (results.tafsir?.length ?? 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">{dict.nav.searchPlaceholder}</h1>
      <form onSubmit={runSearch} className="mx-auto mt-6 flex max-w-lg gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.nav.searchPlaceholder}
          className="w-full rounded-full border border-accent/30 bg-transparent px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-md transition hover:brightness-105"
        >
          🔍
        </button>
      </form>

      {loading && <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">{dict.common.loading}</p>}
      {searched && !loading && totalResults === 0 && (
        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>
      )}

      {results.ayah && results.ayah.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">{dict.reader.allSurah}</h2>
          <div className="mt-2 space-y-2">
            {results.ayah.map((r, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3.5 text-sm"
              >
                <p>
                  <span className="font-medium text-accent">
                    {r.surah_name} : {r.number}
                  </span>{" "}
                  — {r.translation}
                </p>
                <NarrateButton
                  paragraphs={[r.translation]}
                  listenLabel="🔊"
                  stopLabel="⏸"
                  lang={locale}
                  className="shrink-0 rounded-full border border-accent/30 px-2.5 py-1 text-xs text-accent hover:bg-accent/10"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {results.hadits && results.hadits.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">{dict.reader.haditsLabel}</h2>
          <div className="mt-2 space-y-2">
            {results.hadits.map((r) => {
              const text = locale === "en" ? r.text_en ?? r.text_id : r.text_id;
              return (
                <div
                  key={r.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3.5 text-sm"
                >
                  <p>
                    {text}
                    <span className="ml-1 text-xs text-[var(--color-text-secondary)]">({r.source})</span>
                  </p>
                  <NarrateButton
                    paragraphs={[text ?? ""]}
                    listenLabel="🔊"
                    stopLabel="⏸"
                    lang={locale}
                    className="shrink-0 rounded-full border border-accent/30 px-2.5 py-1 text-xs text-accent hover:bg-accent/10"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {results.kisah && results.kisah.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">{dict.nav.kisah}</h2>
          <div className="mt-2 space-y-2">
            {results.kisah.map((r) => (
              <Link
                key={r.slug}
                href={`/${locale}/kisah/${r.slug}`}
                className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3.5 text-sm hover:border-accent"
              >
                🎧 {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
