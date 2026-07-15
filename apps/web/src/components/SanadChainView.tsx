"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { sanadLabels } from "@/lib/sanad-labels";
import { NarrateButton } from "@/components/NarrateButton";

interface Link {
  position: number;
  perawi_id: number;
  name_ar: string;
  bio_id: string | null;
  bio_en: string | null;
  generation: string | null;
  reliability_grade: string | null;
  death_year_hijri: number | null;
}
interface ChainResponse {
  hadits: { id: number; text_ar: string; text_id: string | null; source: string; collection: string | null };
  chain: { id: number; links: Link[] } | null;
}
interface OtherChain {
  hadits_id: number;
  source: string;
  collection: string | null;
}

/**
 * The animated Sanad chain view for one hadith — narrators reveal one by
 * one from the Prophet ﷺ (top) down to the compiler's own teacher
 * (bottom), connected by a line that "grows" into place, each node
 * clickable for biographical detail + which other verified chains that
 * narrator also appears in (the closest thing to a "tree" without a full
 * graph engine — see content.ts's /sanad/perawi/:id/chains).
 */
export function SanadChainView({ haditsId, locale }: { haditsId: number; locale: string }) {
  const t = sanadLabels(locale);
  const [data, setData] = useState<ChainResponse | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [selected, setSelected] = useState<Link | null>(null);
  const [otherChains, setOtherChains] = useState<OtherChain[] | null>(null);

  useEffect(() => {
    api
      .get<ChainResponse>(`/content/sanad/${haditsId}`)
      .then(setData)
      .catch(() => setData(null));
  }, [haditsId]);

  useEffect(() => {
    if (!data?.chain) return;
    setRevealed(0);
    const total = data.chain.links.length;
    const id = setInterval(() => {
      setRevealed((r) => {
        if (r >= total) {
          clearInterval(id);
          return r;
        }
        return r + 1;
      });
    }, 220);
    return () => clearInterval(id);
  }, [data]);

  function openNarrator(link: Link) {
    setSelected(link);
    setOtherChains(null);
    api
      .get<{ chains: OtherChain[] }>(`/content/sanad/perawi/${link.perawi_id}/chains`)
      .then((d) => setOtherChains(d.chains.filter((c) => c.hadits_id !== haditsId)))
      .catch(() => setOtherChains([]));
  }

  if (!data) return <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">…</p>;
  if (!data.chain) {
    return <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">{t.emptyList}</p>;
  }

  // Display order: highest position (nearest the Prophet ﷺ) first (top),
  // down to position 0 (nearest the compiler) last (bottom) — the
  // traditional top-to-bottom sanad diagram convention.
  const ordered = [...data.chain.links].sort((a, b) => b.position - a.position);
  const bio = (l: Link) => (locale === "id" ? l.bio_id : l.bio_en) ?? l.bio_id ?? l.bio_en;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-accent/25 bg-[var(--color-card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t.hadithText}</p>
        <p dir="rtl" className="font-arabic mt-2 text-xl leading-relaxed text-[var(--color-text-primary)]">
          {data.hadits.text_ar}
        </p>
        {data.hadits.text_id && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{data.hadits.text_id}</p>}
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
          {data.hadits.source} {data.hadits.collection ? `· ${data.hadits.collection}` : ""}
        </p>
      </div>

      <div className="relative mt-8 flex flex-col items-center">
        {/* The vertical connecting line, drawn from the very first frame
            behind the nodes; each node's own reveal animation is what
            actually creates the "growing chain" feel as more nodes appear
            along it in sequence. */}
        <div
          aria-hidden
          className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-0.5 -translate-x-1/2 bg-gradient-to-b from-accent/60 via-accent/30 to-accent/60"
        />

        {ordered.map((link, i) => {
          const isProphet = link.position === ordered[0]!.position && i === 0;
          const visible = i < revealed;
          return (
            <div
              key={link.perawi_id}
              className={`relative z-10 mb-6 flex w-full flex-col items-center transition-all duration-500 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <button
                onClick={() => openNarrator(link)}
                className={`rounded-2xl border-2 px-5 py-3 text-center shadow-lg transition hover:scale-105 hover:brightness-110 ${
                  isProphet
                    ? "border-accent bg-gradient-to-br from-accent to-[#8a6420] text-primary"
                    : "border-accent/40 bg-[var(--color-card)] text-[var(--color-text-primary)]"
                }`}
              >
                <p dir="rtl" className="font-arabic text-lg">
                  {isProphet ? t.prophetLabel : link.name_ar}
                </p>
                {link.generation && <p className="mt-0.5 text-[10px] opacity-80">{link.generation}</p>}
              </button>
              {i < ordered.length - 1 && <span aria-hidden className="mt-1 text-accent">↓</span>}
            </div>
          );
        })}

        <p className="mt-2 text-xs font-medium text-accent">{t.compilerLabel}: {data.hadits.source}</p>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-accent/30 bg-[var(--color-card)] p-5 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-lg">{t.narratorDetail}</p>
              <button onClick={() => setSelected(null)} className="text-sm text-[var(--color-text-secondary)]">
                ✕
              </button>
            </div>
            <p dir="rtl" className="font-arabic mt-3 text-xl text-[var(--color-text-primary)]">
              {selected.name_ar}
            </p>

            <dl className="mt-3 space-y-1 text-sm">
              {selected.generation && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-text-secondary)]">{t.generation}</dt>
                  <dd>{selected.generation}</dd>
                </div>
              )}
              {selected.reliability_grade && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-text-secondary)]">{t.reliabilityGrade}</dt>
                  <dd>{selected.reliability_grade}</dd>
                </div>
              )}
              {selected.death_year_hijri && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-text-secondary)]">{t.deathYear}</dt>
                  <dd>{selected.death_year_hijri} H</dd>
                </div>
              )}
            </dl>

            <div className="mt-3 border-t border-[var(--color-border)] pt-3">
              {bio(selected) ? (
                <>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{bio(selected)}</p>
                  <div className="mt-2">
                    <NarrateButton
                      paragraphs={[bio(selected)!]}
                      lang={locale}
                      listenLabel={t.listenBio}
                      stopLabel={t.stopListening}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm italic text-[var(--color-text-secondary)]">{t.bioPending}</p>
              )}
            </div>

            <div className="mt-4 border-t border-[var(--color-border)] pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t.otherChains}</p>
              {otherChains === null ? (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">…</p>
              ) : otherChains.length === 0 ? (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t.otherChainsEmpty}</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {otherChains.map((c) => (
                    <li key={c.hadits_id}>
                      <a href={`/${locale}/sanad/${c.hadits_id}`} className="text-xs text-accent hover:underline">
                        {c.source} {c.collection ? `(${c.collection})` : ""} →
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
