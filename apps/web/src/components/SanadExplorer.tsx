"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { sanadLabels } from "@/lib/sanad-labels";
import { NarrateButton } from "@/components/NarrateButton";

interface Collection {
  slug: string;
  name_id: string;
  name_ar: string;
  author: string | null;
}
interface SanadLink {
  order: number;
  name: string;
  marker: string;
}
interface SampleRow {
  id: number;
  hadith_number: number;
  chain: SanadLink[];
}

/**
 * Public "Sanad Explorer" — the chain of narrators carried in a hadith's own
 * Arabic text, for any of the site's collections. The chain is a
 * pattern-based extraction from text already in the database (see
 * worker-api/lib/sanad.ts) — labelled plainly as automatic so nobody
 * mistakes it for a curated ʻilm ar-rijāl reference.
 *
 * Each chain renders as an animated vertical isnad: narrator nodes cascade
 * in one after another down a golden connector line (CSS only — the same
 * lightweight animation approach used across the site), and the whole chain
 * can be listened to via the narration engine.
 */
export function SanadExplorer({ locale }: { locale: string }) {
  const t = sanadLabels(locale);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState("");
  const [sample, setSample] = useState<SampleRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<{ collections: Collection[] }>("/content/hadits/collections")
      .then((r) => {
        setCollections(r.collections);
        if (r.collections.length) setSelected(r.collections[0]!.slug);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setSample(null);
    setOpenId(null);
    api
      .get<{ sample: SampleRow[] }>(`/content/hadits/${selected}/sanad-sample?limit=25`)
      .then((r) => setSample(r.sample.filter((s) => s.chain.length > 0)))
      .catch(() => setSample([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">{t.chooseCollection}:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        >
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name_id} {c.author ? `— ${c.author}` : ""}
            </option>
          ))}
        </select>
      </div>

      <p className="rounded-xl border border-accent/25 bg-accent/5 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        ℹ️ {t.disclaimer}
      </p>

      {loading && <p className="text-sm text-[var(--color-text-secondary)]">…</p>}

      {sample && sample.length === 0 && !loading && <p className="text-sm text-[var(--color-text-secondary)]">{t.noChain}</p>}

      {sample && sample.length > 0 && (
        <div className="reveal-stagger grid gap-4 sm:grid-cols-2">
          {sample.map((row) => {
            const isOpen = openId === row.id;
            return (
              <div
                key={row.id}
                className="card-premium overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
              >
                <button onClick={() => setOpenId(isOpen ? null : row.id)} className="flex w-full items-center justify-between gap-2 text-left">
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    {t.hadithNo} {row.hadith_number} · {row.chain.length} {t.narrators}
                  </p>
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs text-accent">{isOpen ? "▲" : "🌳 ▼"}</span>
                </button>

                {/* Collapsed: compact inline chain */}
                {!isOpen && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {row.chain.slice(0, 4).map((link, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span dir="rtl" className="rounded-lg bg-black/5 px-2.5 py-1.5 font-arabic text-sm dark:bg-white/5">
                          {link.name}
                        </span>
                        {i < Math.min(row.chain.length, 4) - 1 && <span className="text-accent">←</span>}
                      </span>
                    ))}
                    {row.chain.length > 4 && <span className="text-xs text-[var(--color-text-secondary)]">+{row.chain.length - 4}</span>}
                  </div>
                )}

                {/* Expanded: animated vertical isnad tree */}
                {isOpen && (
                  <div className="mt-4">
                    <NarrateButton
                      paragraphs={row.chain.map((l) => l.name)}
                      listenLabel={t.listenChain}
                      stopLabel={t.stopChain}
                      lang="ar"
                    />
                    <div className="relative mt-4 pl-6">
                      {/* the golden isnad line, growing downward */}
                      <span aria-hidden className="sanad-line absolute bottom-2 left-[9px] top-2 w-0.5 rounded-full" />
                      <div className="space-y-3">
                        {row.chain.map((link, i) => (
                          <div
                            key={i}
                            className="sanad-node relative"
                            style={{ animationDelay: `${i * 160}ms` }}
                          >
                            <span
                              aria-hidden
                              className="absolute -left-6 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-accent bg-[var(--color-card)] shadow-[0_0_10px_rgba(184,137,43,0.5)]"
                            />
                            <div className="rounded-xl border border-accent/20 bg-gradient-to-l from-accent/[0.07] to-transparent px-3 py-2">
                              <p dir="rtl" className="font-arabic text-base leading-relaxed">
                                {link.name}
                              </p>
                              {link.marker && (
                                <p dir="rtl" className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
                                  {link.marker}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  href={`/${locale}/hadits/${selected}`}
                  className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                >
                  {t.viewFull}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
