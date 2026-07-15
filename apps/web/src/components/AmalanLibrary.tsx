"use client";

import { useMemo, useState } from "react";
import { NarrateButton } from "@/components/NarrateButton";
import { amalanLabels } from "@/lib/amalan-labels";

interface Item {
  category_slug: string;
  item_order: number;
  title_id: string;
  arabic: string | null;
  latin: string | null;
  translation_id: string | null;
  note_id: string | null;
  repeat_count: number | null;
  source: string | null;
}
export interface AmalanCategory {
  slug: string;
  grp: string;
  name_id: string;
  name_ar: string | null;
  icon: string | null;
  sort_order: number;
  items: Item[];
}

/**
 * The Amalan Harian library — daily du'a (waking → sleeping), dzikir,
 * prophetic medicine, and grooming/self-care sunnah. A group filter, a
 * category rail, and each item rendered as Arabic + Latin + terjemah +
 * catatan + sumber. Every item (and the whole category) is narratable aloud
 * with the zero-key browser voice.
 */
export function AmalanLibrary({ locale, categories }: { locale: string; categories: AmalanCategory[] }) {
  const t = amalanLabels(locale);
  const GROUPS: { key: string; label: string; icon: string }[] = [
    { key: "doa", label: t.groupDoa, icon: "📿" },
    { key: "dzikir", label: t.groupDzikir, icon: "☀️" },
    { key: "thibb", label: t.groupThibb, icon: "🌿" },
    { key: "kecantikan", label: t.groupKecantikan, icon: "✨" },
  ];
  const [group, setGroup] = useState("doa");
  const [audioMode, setAudioMode] = useState<"semua" | "arab" | "arti">("semua");
  const AUDIO_MODES: { key: "semua" | "arab" | "arti"; label: string }[] = [
    { key: "semua", label: t.audioAll },
    { key: "arab", label: t.audioArabic },
    { key: "arti", label: t.audioMeaning },
  ];
  // Build the {text,lang} narration script for one item per the chosen mode.
  const itemSegments = (it: Item) => {
    if (audioMode === "arab") return it.arabic ? [{ text: it.arabic, lang: "ar" }] : [];
    if (audioMode === "arti")
      return [it.translation_id ?? "", it.note_id ?? ""].filter(Boolean).map((text) => ({ text, lang: locale }));
    return [
      it.arabic ? { text: it.arabic, lang: "ar" } : null,
      it.translation_id ? { text: it.translation_id, lang: locale } : null,
      it.note_id ? { text: it.note_id, lang: locale } : null,
    ].filter(Boolean) as { text: string; lang: string }[];
  };
  const inGroup = useMemo(() => categories.filter((c) => c.grp === group), [categories, group]);
  const [activeSlug, setActiveSlug] = useState(inGroup[0]?.slug ?? "");
  const current = useMemo(
    () => inGroup.find((c) => c.slug === activeSlug) ?? inGroup[0],
    [inGroup, activeSlug]
  );

  function pickGroup(g: string) {
    setGroup(g);
    const first = categories.find((c) => c.grp === g);
    setActiveSlug(first?.slug ?? "");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Group tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => pickGroup(g.key)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              group === g.key
                ? "border-accent bg-accent text-primary"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-accent/50"
            }`}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 desktop:grid-cols-[220px_1fr]">
        {/* Category rail */}
        <aside className="card-premium-static h-max p-3">
          <p className="mb-2 px-2 font-heading text-sm">{t.categoryLabel}</p>
          <ul className="space-y-1">
            {inGroup.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => setActiveSlug(c.slug)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-accent/5 ${
                    c.slug === activeSlug ? "bg-accent/10 font-medium text-accent" : ""
                  }`}
                >
                  <span>{c.icon ?? "•"}</span>
                  <span className="min-w-0 flex-1 truncate">{c.name_id}</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">{c.items.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Items */}
        <div className="min-w-0">
          {current && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl">
                    {current.icon} {current.name_id}
                  </h2>
                  {current.name_ar && (
                    <p dir="rtl" className="font-arabic text-sm text-[var(--color-text-secondary)]">
                      {current.name_ar}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex gap-1 rounded-full border border-[var(--color-border)] p-1">
                    {AUDIO_MODES.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setAudioMode(m.key)}
                        className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                          audioMode === m.key ? "bg-accent text-primary" : "text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {current.items.length > 0 && (
                    <NarrateButton
                      key={audioMode}
                      paragraphs={[]}
                      segments={current.items.flatMap((it) => itemSegments(it))}
                      listenLabel={t.listenAll}
                      stopLabel={t.stopAll}
                      lang={locale}
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {current.items.map((it) => (
                  <article key={it.item_order} className="card-premium-static p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-heading text-base text-primary dark:text-accent">{it.title_id}</p>
                      {it.repeat_count ? (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                          {it.repeat_count}×
                        </span>
                      ) : null}
                    </div>

                    {it.arabic && (
                      <p dir="rtl" className="font-arabic mt-3 text-2xl leading-[2.2] text-[var(--color-text-primary)]">
                        {it.arabic}
                      </p>
                    )}
                    {it.latin && <p className="mt-2 text-sm italic text-[var(--color-text-secondary)]">{it.latin}</p>}
                    {it.translation_id && <p className="mt-2 text-sm leading-relaxed">{it.translation_id}</p>}

                    {it.note_id && (
                      <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3 dark:bg-white/[0.02]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">{t.note}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{it.note_id}</p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {it.source && (
                        <p className="text-[11px] italic text-[var(--color-text-secondary)]/70">📖 {it.source}</p>
                      )}
                      {(it.arabic || it.translation_id || it.note_id) && (
                        <NarrateButton
                          key={audioMode}
                          paragraphs={[]}
                          segments={itemSegments(it)}
                          listenLabel={t.listen}
                          stopLabel={t.stop}
                          lang={locale}
                        />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
