"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NarrateButton } from "@/components/NarrateButton";
import { narrateLabels } from "@/lib/narrate-labels";
import { InstallAppButton } from "@/components/InstallAppButton";

interface QuranRef {
  s: number;
  v: number;
  label?: string;
}
interface Matn {
  id: number;
  order: number;
  title_id: string | null;
  title_ar: string | null;
  text_ar: string;
  translation_id: string | null;
  explanation_id: string | null;
  quran_refs: QuranRef[];
  hadits_refs: string[];
}
interface Chapter {
  id: number;
  order: number;
  name_id: string;
  name_ar: string | null;
  matn: Matn[];
}
export interface KitabDetail {
  slug: string;
  title_ar: string;
  title_id: string;
  author: string | null;
  author_death_year: string | null;
  description_id: string | null;
  category_name: string | null;
  category_icon: string | null;
}

type FontSize = "sm" | "md" | "lg" | "xl";
type Theme = "light" | "sepia" | "dark";

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: "text-lg leading-[2]",
  md: "text-2xl leading-[2.3]",
  lg: "text-3xl leading-[2.4]",
  xl: "text-4xl leading-[2.5]",
};
const FONT_SIZE_LABEL: Record<FontSize, string> = { sm: "Kecil", md: "Sedang", lg: "Besar", xl: "XL" };
const THEME_LABEL: Record<Theme, string> = { light: "☀️ Terang", sepia: "📜 Sepia", dark: "🌙 Gelap" };
// Inline styles, not Tailwind classes: .card-premium-static's own
// background-color rule sits below `@tailwind utilities` in globals.css, so
// it wins the cascade over same-specificity utility classes and would
// silently swallow a class-based theme override. An inline style always
// wins regardless of stylesheet order, so the theme toggle reliably applies.
const THEME_STYLE: Record<Theme, React.CSSProperties | undefined> = {
  light: undefined,
  sepia: { backgroundColor: "#f6ecd9", color: "#3b2f1e" },
  dark: { backgroundColor: "#0f1a14", color: "#e8f0ea" },
};

function prefsKey(slug: string) {
  return `ulyah_kitab_prefs_${slug}`;
}
function bookmarkKey(slug: string) {
  return `ulyah_kitab_bookmark_${slug}`;
}

/**
 * Reads one pesantren kitab as a proper library book — now installable as
 * its OWN standalone app ("widget per buku", see manifest-kitab route.ts),
 * with reading preferences (font size, page theme) and a bookmark that
 * remembers exactly where a visitor left off, both persisted per-kitab in
 * localStorage so returning to "Safinatun Najah" tomorrow picks up right
 * where "Ta'lim Muta'allim" left off yesterday, independently.
 */
export function PesantrenKitabReader({
  locale,
  kitab,
  chapters,
  autoPromptInstall = false,
}: {
  locale: string;
  kitab: KitabDetail;
  chapters: Chapter[];
  autoPromptInstall?: boolean;
}) {
  const [activeBab, setActiveBab] = useState(chapters[0]?.id ?? 0);
  const [resumeHint, setResumeHint] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [theme, setTheme] = useState<Theme>("light");
  const [showPrefs, setShowPrefs] = useState(false);
  const [pageTurn, setPageTurn] = useState(false);

  // Restore reading preferences + bookmark for THIS kitab only, once, after
  // mount (client-only — avoids an SSR/CSR hydration mismatch, same
  // precaution as the Qur'an player's qori/layers preferences).
  useEffect(() => {
    try {
      const savedPrefs = window.localStorage.getItem(prefsKey(kitab.slug));
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs) as { fontSize?: FontSize; theme?: Theme };
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.theme) setTheme(parsed.theme);
      }
      const savedBab = window.localStorage.getItem(bookmarkKey(kitab.slug));
      if (savedBab) {
        const babId = Number(savedBab);
        if (chapters.some((c) => c.id === babId) && babId !== chapters[0]?.id) {
          setActiveBab(babId);
          setResumeHint(true);
        }
      }
    } catch {
      /* localStorage unavailable (private mode, etc.) — reader still works, just without memory */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitab.slug]);

  function persistPrefs(next: { fontSize?: FontSize; theme?: Theme }) {
    const merged = { fontSize, theme, ...next };
    try {
      window.localStorage.setItem(prefsKey(kitab.slug), JSON.stringify(merged));
    } catch {
      /* non-fatal */
    }
  }

  function goToBab(id: number) {
    setPageTurn(true);
    setTimeout(() => {
      setActiveBab(id);
      setResumeHint(false);
      setPageTurn(false);
      try {
        window.localStorage.setItem(bookmarkKey(kitab.slug), String(id));
      } catch {
        /* non-fatal */
      }
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }, 180);
  }

  const current = useMemo(() => chapters.find((c) => c.id === activeBab) ?? chapters[0], [chapters, activeBab]);

  // Audio mode: what the "Dengarkan" button reads, and in which voice.
  //  - semua: Arabic matn (Arabic voice) → terjemah + penjelasan (UI voice)
  //  - arab : only the Arabic matn, Arabic voice
  //  - arti : only terjemah + penjelasan, UI-language voice
  const [audioMode, setAudioMode] = useState<"semua" | "arab" | "arti">("semua");
  const AUDIO_MODES: { key: "semua" | "arab" | "arti"; label: string }[] = [
    { key: "semua", label: "🔊 Baca semua" },
    { key: "arab", label: "﴿ Arab saja" },
    { key: "arti", label: "📖 Arti saja" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/${locale}/kitab-pesantren`} className="text-xs text-accent hover:underline">
          ← Kitab Pesantren
        </Link>
        <div className="flex items-center gap-2">
          <InstallAppButton app="kitab" labeled autoPrompt={autoPromptInstall} />
        </div>
      </div>

      {/* Kitab header card — author, category, description */}
      <div className="mt-3 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-[#06251b] to-[#0B3D2E] p-6 text-[#f4efe3] sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          {kitab.category_icon ?? "📗"} {kitab.category_name}
        </p>
        <p dir="rtl" className="font-arabic mt-3 text-3xl leading-tight text-accent sm:text-4xl">
          {kitab.title_ar}
        </p>
        <h1 className="mt-2 font-heading text-2xl sm:text-3xl">{kitab.title_id}</h1>
        {kitab.author && (
          <p className="mt-3 text-sm text-[#f4efe3]/80">
            ✍️ {kitab.author}
            {kitab.author_death_year ? ` — wafat ${kitab.author_death_year}` : ""}
          </p>
        )}
        {kitab.description_id && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#f4efe3]/70">{kitab.description_id}</p>
        )}
      </div>

      {resumeHint && current && (
        <p className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs text-accent">
          📑 Melanjutkan dari bacaan terakhir — Bab {current.order}: {current.name_id}
        </p>
      )}

      {/* Ad after the kitab title/header (per Kitab placement plan) */}
      <div className="mt-5">
      </div>

      <div className="mt-6 grid gap-6 desktop:grid-cols-[240px_1fr]">
        {/* Daftar bab (table of contents) */}
        <aside className="card-premium-static h-max p-3">
          <p className="mb-2 px-2 font-heading text-sm">Daftar Bab</p>
          <ol className="space-y-1">
            {chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  onClick={() => goToBab(ch.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-accent/5 ${
                    ch.id === activeBab ? "bg-accent/10 font-medium text-accent" : ""
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-accent/30 text-[10px] text-accent">
                    {ch.order}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{ch.name_id}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        {/* Bab content */}
        <div className="min-w-0">
          {current && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-xl">
                  Bab {current.order}: {current.name_id}
                </h2>
                {current.name_ar && (
                  <span dir="rtl" className="font-arabic text-lg text-[var(--color-text-secondary)]">
                    {current.name_ar}
                  </span>
                )}
              </div>

              {/* Audio mode + reading preferences */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex flex-wrap gap-1.5 rounded-full border border-[var(--color-border)] p-1">
                  {AUDIO_MODES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setAudioMode(m.key)}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        audioMode === m.key ? "bg-accent text-primary" : "text-[var(--color-text-secondary)] hover:text-accent"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowPrefs((v) => !v)}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs transition hover:border-accent"
                >
                  🎨 Tampilan
                </button>
              </div>

              {showPrefs && (
                <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--color-border)] bg-black/5 p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Ukuran teks:</span>
                    {(Object.keys(FONT_SIZE_LABEL) as FontSize[]).map((fs) => (
                      <button
                        key={fs}
                        onClick={() => {
                          setFontSize(fs);
                          persistPrefs({ fontSize: fs });
                        }}
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${fontSize === fs ? "border-accent bg-accent/15 text-accent" : "border-[var(--color-border)]"}`}
                      >
                        {FONT_SIZE_LABEL[fs]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Tema:</span>
                    {(Object.keys(THEME_LABEL) as Theme[]).map((th) => (
                      <button
                        key={th}
                        onClick={() => {
                          setTheme(th);
                          persistPrefs({ theme: th });
                        }}
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${theme === th ? "border-accent bg-accent/15 text-accent" : "border-[var(--color-border)]"}`}
                      >
                        {THEME_LABEL[th]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`mt-5 space-y-5 rounded-2xl transition-opacity duration-200 ${pageTurn ? "opacity-0" : "opacity-100"} ${theme !== "light" ? "p-4" : ""}`}
                style={THEME_STYLE[theme]}
              >
                {current.matn.map((m) => (
                  <Fragment key={m.id}>
                  <article
                    className={`card-premium-static p-5 ${theme !== "light" ? "border-accent/20" : ""}`}
                    style={THEME_STYLE[theme]}
                  >
                    {(m.title_id || m.title_ar) && (
                      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--color-border)] pb-2">
                        {m.title_id && <p className="font-heading text-sm text-primary dark:text-accent">{m.title_id}</p>}
                        {m.title_ar && (
                          <p dir="rtl" className="font-arabic text-sm text-[var(--color-text-secondary)]">
                            {m.title_ar}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Matan (Arabic source) — font size follows reading preference */}
                    <p dir="rtl" className={`font-arabic ${FONT_SIZE_CLASS[fontSize]}`}>
                      {m.text_ar}
                    </p>

                    {/* Terjemah */}
                    {m.translation_id && (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3 dark:bg-white/[0.02]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">Terjemah</p>
                        <p className="mt-1 text-sm leading-relaxed">{m.translation_id}</p>
                      </div>
                    )}

                    {/* Penjelasan */}
                    {m.explanation_id && (
                      <div className="mt-3 rounded-xl border border-[var(--color-border)] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">Penjelasan</p>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                          {m.explanation_id}
                        </p>
                      </div>
                    )}

                    {/* Linked ayat / hadits */}
                    {(m.quran_refs.length > 0 || m.hadits_refs.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.quran_refs.map((q, i) => (
                          <Link
                            key={`q${i}`}
                            href={`/${locale}/quran?s=${q.s}&a=${q.v}`}
                            className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[11px] text-accent hover:bg-accent/10"
                          >
                            📖 QS {q.s}:{q.v}
                            {q.label ? ` — ${q.label}` : ""}
                          </Link>
                        ))}
                        {m.hadits_refs.map((h, i) => (
                          <span
                            key={`h${i}`}
                            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-secondary)]"
                          >
                            🕌 {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Listen — obeys the audio-mode selector, with the voice
                        matching each part's language (Arabic matn vs terjemah). */}
                    {(m.text_ar || m.translation_id || m.explanation_id) && (
                      <div className="mt-3">
                        <NarrateButton
                          key={audioMode}
                          paragraphs={
                            audioMode === "arti" ? [m.translation_id ?? "", m.explanation_id ?? ""].filter(Boolean) : []
                          }
                          segments={
                            audioMode === "arab"
                              ? [{ text: m.text_ar, lang: "ar" }]
                              : audioMode === "semua"
                                ? [
                                    { text: m.text_ar, lang: "ar" },
                                    { text: m.translation_id ?? "", lang: locale },
                                    { text: m.explanation_id ?? "", lang: locale },
                                  ].filter((s) => s.text)
                                : undefined
                          }
                          listenLabel={narrateLabels(locale).listen}
                          stopLabel={narrateLabels(locale).stop}
                          lang={locale}
                        />
                      </div>
                    )}
                  </article>
                  </Fragment>
                ))}

                {/* Ad at the end of the bab, before prev/next (per plan) */}
              </div>

              {/* Prev / next bab */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <BabNav chapters={chapters} currentOrder={current.order} dir="prev" onGo={goToBab} />
                <BabNav chapters={chapters} currentOrder={current.order} dir="next" onGo={goToBab} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BabNav({
  chapters,
  currentOrder,
  dir,
  onGo,
}: {
  chapters: Chapter[];
  currentOrder: number;
  dir: "prev" | "next";
  onGo: (id: number) => void;
}) {
  const target = chapters.find((c) => c.order === currentOrder + (dir === "next" ? 1 : -1));
  if (!target) return <span />;
  return (
    <button
      onClick={() => onGo(target.id)}
      className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs hover:border-accent"
    >
      {dir === "prev" ? "← " : ""}
      {dir === "prev" ? "Bab sebelumnya" : "Bab berikutnya"}
      {dir === "next" ? " →" : ""}
    </button>
  );
}
