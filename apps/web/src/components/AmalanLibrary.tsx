"use client";

import { useMemo, useState } from "react";
import { NarrateButton } from "@/components/NarrateButton";

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

const GROUPS: { key: string; label: string; icon: string }[] = [
  { key: "doa", label: "Doa Harian", icon: "📿" },
  { key: "dzikir", label: "Dzikir", icon: "☀️" },
  { key: "thibb", label: "Pengobatan (Thibbun Nabawi)", icon: "🌿" },
  { key: "kecantikan", label: "Kebersihan & Keindahan", icon: "✨" },
];

/**
 * The Amalan Harian library — daily du'a (waking → sleeping), dzikir,
 * prophetic medicine, and grooming/self-care sunnah. A group filter, a
 * category rail, and each item rendered as Arabic + Latin + terjemah +
 * catatan + sumber. Every item (and the whole category) is narratable aloud
 * with the zero-key browser voice.
 */
export function AmalanLibrary({ locale, categories }: { locale: string; categories: AmalanCategory[] }) {
  const [group, setGroup] = useState("doa");
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

  // Narrate the whole open category: title + terjemah + catatan per item.
  const categoryNarration = useMemo(() => {
    if (!current) return [];
    const out: string[] = [];
    for (const it of current.items) {
      out.push(it.title_id);
      if (it.translation_id) out.push(it.translation_id);
      if (it.note_id) out.push(it.note_id);
    }
    return out;
  }, [current]);

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
          <p className="mb-2 px-2 font-heading text-sm">Kategori</p>
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
                {categoryNarration.length > 0 && (
                  <NarrateButton
                    paragraphs={categoryNarration}
                    listenLabel="🔊 Dengarkan semua"
                    stopLabel="⏹ Berhenti"
                    lang={locale}
                  />
                )}
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
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">Catatan</p>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{it.note_id}</p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {it.source && (
                        <p className="text-[11px] italic text-[var(--color-text-secondary)]/70">📖 {it.source}</p>
                      )}
                      {(it.translation_id || it.note_id || it.latin) && (
                        <NarrateButton
                          paragraphs={[it.latin ?? "", it.translation_id ?? "", it.note_id ?? ""].filter(Boolean)}
                          listenLabel="🔊 Dengarkan"
                          stopLabel="⏹"
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
