"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NarrateButton } from "@/components/NarrateButton";
import { narrateLabels } from "@/lib/narrate-labels";
import { speak, splitSentences, speechAvailable, type NarrationHandle } from "@/lib/speech";
import { useRadioStore } from "@/lib/radio-store";
import { api } from "@/lib/api";

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
type AudioMode = "semua" | "arab" | "arti";

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: "text-lg leading-[2]",
  md: "text-2xl leading-[2.3]",
  lg: "text-3xl leading-[2.4]",
  xl: "text-4xl leading-[2.5]",
};
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

// Every visible reader string per site language — a sibling site must never
// show Indonesian chrome (owner rule + AdSense language purity).
interface ReaderLabels {
  back: string;
  resume: (order: number, name: string) => string;
  toc: string;
  chapter: string;
  display: string;
  fontSize: string;
  theme: string;
  sizes: Record<FontSize, string>;
  themes: Record<Theme, string>;
  translation: string;
  explanation: string;
  died: string;
  prevChapter: string;
  nextChapter: string;
  readAll: string;
  arabicOnly: string;
  translationOnly: string;
  autoRead: string;
  stopReading: string;
  reading: string;
  nextBook: string;
}
const READER_L: Record<string, ReaderLabels> = {
  id: {
    back: "← Kitab Pesantren",
    resume: (o, n) => `📑 Melanjutkan dari bacaan terakhir — Bab ${o}: ${n}`,
    toc: "Daftar Bab",
    chapter: "Bab",
    display: "🎨 Tampilan",
    fontSize: "Ukuran teks:",
    theme: "Tema:",
    sizes: { sm: "Kecil", md: "Sedang", lg: "Besar", xl: "XL" },
    themes: { light: "☀️ Terang", sepia: "📜 Sepia", dark: "🌙 Gelap" },
    translation: "Terjemah",
    explanation: "Penjelasan",
    died: "wafat",
    prevChapter: "Bab sebelumnya",
    nextChapter: "Bab berikutnya",
    readAll: "🔊 Baca semua",
    arabicOnly: "﴿ Arab saja",
    translationOnly: "📖 Terjemahan saja",
    autoRead: "▶ Baca otomatis",
    stopReading: "⏹ Berhenti",
    reading: "Sedang membacakan… halaman & bab berpindah otomatis sampai dihentikan.",
    nextBook: "Kitab selesai — berpindah ke kitab berikutnya…",
  },
  en: {
    back: "← Classical Texts",
    resume: (o, n) => `📑 Resuming where you left off — Chapter ${o}: ${n}`,
    toc: "Chapters",
    chapter: "Chapter",
    display: "🎨 Display",
    fontSize: "Text size:",
    theme: "Theme:",
    sizes: { sm: "Small", md: "Medium", lg: "Large", xl: "XL" },
    themes: { light: "☀️ Light", sepia: "📜 Sepia", dark: "🌙 Dark" },
    translation: "Translation",
    explanation: "Commentary",
    died: "died",
    prevChapter: "Previous chapter",
    nextChapter: "Next chapter",
    readAll: "🔊 Read everything",
    arabicOnly: "﴿ Arabic only",
    translationOnly: "📖 Translation only",
    autoRead: "▶ Auto-read",
    stopReading: "⏹ Stop",
    reading: "Reading aloud… pages & chapters advance automatically until stopped.",
    nextBook: "Book finished — moving to the next book…",
  },
  fr: {
    back: "← Textes Classiques",
    resume: (o, n) => `📑 Reprise de votre lecture — Chapitre ${o} : ${n}`,
    toc: "Chapitres",
    chapter: "Chapitre",
    display: "🎨 Affichage",
    fontSize: "Taille du texte :",
    theme: "Thème :",
    sizes: { sm: "Petit", md: "Moyen", lg: "Grand", xl: "XL" },
    themes: { light: "☀️ Clair", sepia: "📜 Sépia", dark: "🌙 Sombre" },
    translation: "Traduction",
    explanation: "Commentaire",
    died: "décédé",
    prevChapter: "Chapitre précédent",
    nextChapter: "Chapitre suivant",
    readAll: "🔊 Tout lire",
    arabicOnly: "﴿ Arabe seul",
    translationOnly: "📖 Traduction seule",
    autoRead: "▶ Lecture auto",
    stopReading: "⏹ Arrêter",
    reading: "Lecture en cours… pages et chapitres avancent automatiquement jusqu'à l'arrêt.",
    nextBook: "Livre terminé — passage au livre suivant…",
  },
  de: {
    back: "← Klassische Werke",
    resume: (o, n) => `📑 Weiterlesen bei — Kapitel ${o}: ${n}`,
    toc: "Kapitel",
    chapter: "Kapitel",
    display: "🎨 Ansicht",
    fontSize: "Textgröße:",
    theme: "Thema:",
    sizes: { sm: "Klein", md: "Mittel", lg: "Groß", xl: "XL" },
    themes: { light: "☀️ Hell", sepia: "📜 Sepia", dark: "🌙 Dunkel" },
    translation: "Übersetzung",
    explanation: "Erläuterung",
    died: "gest.",
    prevChapter: "Vorheriges Kapitel",
    nextChapter: "Nächstes Kapitel",
    readAll: "🔊 Alles vorlesen",
    arabicOnly: "﴿ Nur Arabisch",
    translationOnly: "📖 Nur Übersetzung",
    autoRead: "▶ Automatisch vorlesen",
    stopReading: "⏹ Stopp",
    reading: "Vorlesen läuft… Seiten & Kapitel wechseln automatisch bis zum Stopp.",
    nextBook: "Buch beendet — weiter zum nächsten Buch…",
  },
  es: {
    back: "← Textos Clásicos",
    resume: (o, n) => `📑 Continuando donde lo dejaste — Capítulo ${o}: ${n}`,
    toc: "Capítulos",
    chapter: "Capítulo",
    display: "🎨 Pantalla",
    fontSize: "Tamaño del texto:",
    theme: "Tema:",
    sizes: { sm: "Pequeño", md: "Mediano", lg: "Grande", xl: "XL" },
    themes: { light: "☀️ Claro", sepia: "📜 Sepia", dark: "🌙 Oscuro" },
    translation: "Traducción",
    explanation: "Comentario",
    died: "fallecido",
    prevChapter: "Capítulo anterior",
    nextChapter: "Capítulo siguiente",
    readAll: "🔊 Leer todo",
    arabicOnly: "﴿ Solo árabe",
    translationOnly: "📖 Solo traducción",
    autoRead: "▶ Lectura automática",
    stopReading: "⏹ Detener",
    reading: "Leyendo en voz alta… páginas y capítulos avanzan automáticamente hasta detenerse.",
    nextBook: "Libro terminado — pasando al siguiente libro…",
  },
};
function readerLabels(locale: string): ReaderLabels {
  return READER_L[locale] ?? READER_L.en!;
}

function prefsKey(slug: string) {
  return `ulyah_kitab_prefs_${slug}`;
}
function bookmarkKey(slug: string) {
  return `ulyah_kitab_bookmark_${slug}`;
}
const AUTOREAD_KEY = "ulyah_kitab_autoread";

interface ReadingPos {
  matnId: number;
  part: "ar" | "tr" | "ex";
  idx: number;
}

/** Renders prose as sentence spans so the sentence currently being narrated
 * can be highlighted — the "reading marker" that follows the voice. */
function SentenceText({
  text,
  active,
  activeIdx,
  className,
}: {
  text: string;
  active: boolean;
  activeIdx: number;
  className?: string;
}) {
  const sentences = useMemo(() => splitSentences(text), [text]);
  if (!active) return <p className={className}>{text}</p>;
  return (
    <p className={className}>
      {sentences.map((s, i) => (
        <span
          key={i}
          className={i === activeIdx ? "rounded bg-accent/25 text-inherit shadow-[0_0_0_3px_rgba(0,0,0,0.02)]" : undefined}
        >
          {s}{" "}
        </span>
      ))}
    </p>
  );
}

/**
 * Reads one pesantren kitab as a proper library book, with reading
 * preferences (font size, page theme), a per-kitab bookmark, and a
 * continuous auto-read voice mode: pick "read everything / Arabic only /
 * translation only" and press play — sentences highlight as they are
 * spoken, the view scrolls itself, chapters turn automatically, and when
 * the book ends the reader moves to the NEXT kitab in the library, looping
 * through the whole collection until the visitor presses stop — even if
 * that takes days.
 */
export function PesantrenKitabReader({
  locale,
  kitab: kitabProp,
  chapters: chaptersProp,
  autoReadStart = false,
  autoReadMode = "semua",
  translationPending = false,
}: {
  locale: string;
  kitab: KitabDetail;
  chapters: Chapter[];
  /** Arrived here from the auto-reader finishing the previous kitab — keep
   * reading without any click (same document, so speech stays allowed). */
  autoReadStart?: boolean;
  autoReadMode?: AudioMode;
  /** The API is translating this kitab into `locale` in the background —
   * refetch shortly so the visitor sees their own language without a manual
   * refresh (the ISR-cached page itself can't change for a few minutes). */
  translationPending?: boolean;
}) {
  const router = useRouter();
  const t = readerLabels(locale);
  const [kitab, setKitab] = useState(kitabProp);
  const [chapters, setChapters] = useState(chaptersProp);

  // Quiet client-side refetches (~12s apart, max 3 tries) while the worker
  // writes the translated blob — the reader swaps to the visitor's own
  // language as soon as it exists.
  useEffect(() => {
    if (!translationPending) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      tries++;
      try {
        const d = await api.get<{ kitab: KitabDetail; chapters: Chapter[]; translationPending?: boolean }>(
          `/content/pesantren/kitab/${kitabProp.slug}?lang=${locale}`
        );
        if (d && !d.translationPending) {
          setKitab(d.kitab);
          setChapters(d.chapters);
          return;
        }
      } catch {
        /* keep polling */
      }
      if (tries < 3) timer = setTimeout(poll, 12_000);
    };
    timer = setTimeout(poll, 12_000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationPending, kitabProp.slug, locale]);

  const [activeBab, setActiveBab] = useState(chapters[0]?.id ?? 0);
  const [resumeHint, setResumeHint] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [theme, setTheme] = useState<Theme>("light");
  const [showPrefs, setShowPrefs] = useState(false);
  const [pageTurn, setPageTurn] = useState(false);

  // Restore reading preferences + bookmark for THIS kitab only, once, after
  // mount (client-only — avoids an SSR/CSR hydration mismatch).
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
      /* localStorage unavailable — reader still works, just without memory */
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

  // ── Continuous auto-read engine ────────────────────────────────────────
  const [audioMode, setAudioMode] = useState<AudioMode>(autoReadMode);
  const [autoReading, setAutoReading] = useState(false);
  const [switchingBook, setSwitchingBook] = useState(false);
  const [readingPos, setReadingPos] = useState<ReadingPos | null>(null);
  const readingRef = useRef(false);
  const handleRef = useRef<NarrationHandle | null>(null);
  const wakeLockRef = useRef<{ release?: () => Promise<void> } | null>(null);
  const [speechOk, setSpeechOk] = useState(false);
  useEffect(() => {
    setSpeechOk(speechAvailable());
  }, []);

  const AUDIO_MODES: { key: AudioMode; label: string }[] = [
    { key: "semua", label: t.readAll },
    { key: "arab", label: t.arabicOnly },
    { key: "arti", label: t.translationOnly },
  ];

  // Keep the screen awake for marathon sessions ("berhari-hari") — best
  // effort; re-acquired when the tab becomes visible again.
  async function acquireWakeLock() {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<{ release?: () => Promise<void> }> } };
      wakeLockRef.current = (await nav.wakeLock?.request("screen")) ?? null;
    } catch {
      /* unsupported — narration still runs while the tab lives */
    }
  }
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && readingRef.current) void acquireWakeLock();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Follow the voice: keep the sentence being read in the middle of the view.
  useEffect(() => {
    if (!readingPos) return;
    document.getElementById(`matn-${readingPos.matnId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [readingPos?.matnId, readingPos?.part]); // eslint-disable-line react-hooks/exhaustive-deps

  const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Narrate one matn per the chosen mode. Returns false when stopped. */
  async function readMatn(m: Matn, mode: AudioMode): Promise<boolean> {
    const parts: { part: "ar" | "tr" | "ex"; text: string; lang: string }[] = [];
    if (mode !== "arti" && m.text_ar) parts.push({ part: "ar", text: m.text_ar, lang: "ar" });
    if (mode !== "arab") {
      if (m.translation_id) parts.push({ part: "tr", text: m.translation_id, lang: locale });
      if (mode === "semua" && m.explanation_id) parts.push({ part: "ex", text: m.explanation_id, lang: locale });
    }
    for (const p of parts) {
      const sentences = splitSentences(p.text);
      for (let i = 0; i < sentences.length; i++) {
        if (!readingRef.current) return false;
        setReadingPos({ matnId: m.id, part: p.part, idx: i });
        const h = speak(sentences[i]!, p.lang, { rate: 0.9 });
        handleRef.current = h;
        await h.done;
      }
    }
    return readingRef.current;
  }

  /** When this kitab is fully read, continue into the next kitab in the
   * library (wrapping at the end) — the whole menu plays like one long,
   * unending recitation until the visitor stops it. */
  async function advanceToNextKitab(mode: AudioMode) {
    setSwitchingBook(true);
    try {
      const res = await api.get<{ kitab: { slug: string }[] }>(`/content/pesantren/kitab?lang=${locale}`);
      const slugs = res.kitab.map((k) => k.slug);
      const cur = slugs.indexOf(kitab.slug);
      const next = slugs[(cur + 1) % slugs.length];
      if (next && next !== kitab.slug) {
        try {
          window.sessionStorage.setItem(AUTOREAD_KEY, mode);
        } catch {
          /* non-fatal */
        }
        // Soft App-Router navigation: same document, so speech permission and
        // the reading session survive into the next book.
        router.push(`/${locale}/kitab-pesantren/${next}?autoread=1&mode=${mode}`);
        return;
      }
    } catch {
      /* list unavailable — end gracefully */
    }
    stopAutoRead();
  }

  async function startAutoRead(mode: AudioMode) {
    if (readingRef.current) return;
    // The radio and the narration voice must never sound together — stop the
    // always-on radio the moment auto-read begins (it only resumes on a manual
    // press, matching the existing "other audio stops the radio" rule).
    try {
      if (useRadioStore.getState().playing) useRadioStore.getState().stop();
    } catch {
      /* radio store unavailable — narration still runs */
    }
    readingRef.current = true;
    setAutoReading(true);
    setSwitchingBook(false);
    void acquireWakeLock();

    let babIdx = chapters.findIndex((c) => c.id === activeBab);
    if (babIdx < 0) babIdx = 0;
    for (; babIdx < chapters.length; babIdx++) {
      const bab = chapters[babIdx]!;
      if (bab.id !== activeBab) {
        goToBab(bab.id);
        await sleepMs(500);
      }
      for (const m of bab.matn) {
        const ok = await readMatn(m, mode);
        if (!ok) return;
      }
      await sleepMs(400);
    }
    if (readingRef.current) await advanceToNextKitab(mode);
  }

  function stopAutoRead() {
    readingRef.current = false;
    handleRef.current?.cancel();
    setReadingPos(null);
    setAutoReading(false);
    setSwitchingBook(false);
    try {
      window.sessionStorage.removeItem(AUTOREAD_KEY);
    } catch {
      /* non-fatal */
    }
    void wakeLockRef.current?.release?.();
    wakeLockRef.current = null;
  }

  // Cancel narration when the reader unmounts mid-session.
  useEffect(() => {
    return () => {
      readingRef.current = false;
      handleRef.current?.cancel();
    };
  }, []);

  // Continue the marathon: arriving with ?autoread=1 (or the sessionStorage
  // flag) means the PREVIOUS kitab just finished — keep reading, no click.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem(AUTOREAD_KEY);
    } catch {
      /* private mode */
    }
    if (!autoReadStart && !stored) return;
    const mode = (autoReadStart ? autoReadMode : (stored as AudioMode)) || "semua";
    setAudioMode(mode);
    const timer = setTimeout(() => void startAutoRead(mode), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/${locale}/kitab-pesantren`} className="text-xs text-accent hover:underline">
          {t.back}
        </Link>
      </div>

      {/* Kitab header card — author, category, description */}
      <div className="mt-3 app-hero overflow-hidden rounded-3xl border border-accent/30 p-6 sm:p-8">
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
            {kitab.author_death_year ? ` — ${t.died} ${kitab.author_death_year}` : ""}
          </p>
        )}
        {kitab.description_id && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#f4efe3]/70">{kitab.description_id}</p>
        )}
      </div>

      {resumeHint && current && (
        <p className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs text-accent">
          {t.resume(current.order, current.name_id)}
        </p>
      )}

      {/* Ad after the kitab title/header (per Kitab placement plan) */}
      <div className="mt-5">
      </div>

      <div className="mt-6 grid gap-6 desktop:grid-cols-[240px_1fr]">
        {/* Table of contents */}
        <aside className="card-premium-static h-max p-3">
          <p className="mb-2 px-2 font-heading text-sm">{t.toc}</p>
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

        {/* Chapter content */}
        <div className="min-w-0">
          {current && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-xl">
                  {t.chapter} {current.order}: {current.name_id}
                </h2>
                {current.name_ar && (
                  <span dir="rtl" className="font-arabic text-lg text-[var(--color-text-secondary)]">
                    {current.name_ar}
                  </span>
                )}
              </div>

              {/* Voice mode + continuous auto-read + reading preferences */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex flex-wrap gap-1.5 rounded-full border border-[var(--color-border)] p-1">
                  {AUDIO_MODES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setAudioMode(m.key)}
                      disabled={autoReading}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        audioMode === m.key ? "bg-accent text-primary" : "text-[var(--color-text-secondary)] hover:text-accent"
                      } ${autoReading ? "opacity-60" : ""}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {speechOk && (
                  <button
                    onClick={() => (autoReading ? stopAutoRead() : void startAutoRead(audioMode))}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium shadow-md transition ${
                      autoReading
                        ? "bg-red-600 text-white hover:brightness-110"
                        : "bg-accent text-primary hover:brightness-105"
                    }`}
                  >
                    {autoReading ? t.stopReading : t.autoRead}
                  </button>
                )}
                <button
                  onClick={() => setShowPrefs((v) => !v)}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs transition hover:border-accent"
                >
                  {t.display}
                </button>
              </div>

              {autoReading && (
                <p className="mt-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-xs text-accent">
                  {switchingBook ? t.nextBook : t.reading}
                </p>
              )}

              {showPrefs && (
                <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--color-border)] bg-black/5 p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{t.fontSize}</span>
                    {(Object.keys(t.sizes) as FontSize[]).map((fs) => (
                      <button
                        key={fs}
                        onClick={() => {
                          setFontSize(fs);
                          persistPrefs({ fontSize: fs });
                        }}
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${fontSize === fs ? "border-accent bg-accent/15 text-accent" : "border-[var(--color-border)]"}`}
                      >
                        {t.sizes[fs]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{t.theme}</span>
                    {(Object.keys(t.themes) as Theme[]).map((th) => (
                      <button
                        key={th}
                        onClick={() => {
                          setTheme(th);
                          persistPrefs({ theme: th });
                        }}
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${theme === th ? "border-accent bg-accent/15 text-accent" : "border-[var(--color-border)]"}`}
                      >
                        {t.themes[th]}
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
                    id={`matn-${m.id}`}
                    className={`card-premium-static p-5 transition-shadow ${theme !== "light" ? "border-accent/20" : ""} ${
                      readingPos?.matnId === m.id ? "ring-2 ring-accent shadow-lg" : ""
                    }`}
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

                    {/* Matan (Arabic source) — font size follows reading preference;
                        the sentence being narrated is highlighted live. */}
                    <div dir="rtl">
                      <SentenceText
                        text={m.text_ar}
                        active={readingPos?.matnId === m.id && readingPos.part === "ar"}
                        activeIdx={readingPos?.part === "ar" && readingPos.matnId === m.id ? readingPos.idx : -1}
                        className={`font-arabic ${FONT_SIZE_CLASS[fontSize]}`}
                      />
                    </div>

                    {/* Translation */}
                    {m.translation_id && (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3 dark:bg-white/[0.02]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">{t.translation}</p>
                        <SentenceText
                          text={m.translation_id}
                          active={readingPos?.matnId === m.id && readingPos.part === "tr"}
                          activeIdx={readingPos?.part === "tr" && readingPos.matnId === m.id ? readingPos.idx : -1}
                          className="mt-1 text-sm leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Commentary */}
                    {m.explanation_id && (
                      <div className="mt-3 rounded-xl border border-[var(--color-border)] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">{t.explanation}</p>
                        <SentenceText
                          text={m.explanation_id}
                          active={readingPos?.matnId === m.id && readingPos.part === "ex"}
                          activeIdx={readingPos?.part === "ex" && readingPos.matnId === m.id ? readingPos.idx : -1}
                          className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                        />
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

                    {/* Per-passage listen — obeys the voice-mode selector, with
                        the voice matching each part's language. */}
                    {!autoReading && (m.text_ar || m.translation_id || m.explanation_id) && (
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

              {/* Prev / next chapter */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <BabNav chapters={chapters} currentOrder={current.order} dir="prev" onGo={goToBab} labels={t} />
                <BabNav chapters={chapters} currentOrder={current.order} dir="next" onGo={goToBab} labels={t} />
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
  labels,
}: {
  chapters: Chapter[];
  currentOrder: number;
  dir: "prev" | "next";
  onGo: (id: number) => void;
  labels: ReaderLabels;
}) {
  const target = chapters.find((c) => c.order === currentOrder + (dir === "next" ? 1 : -1));
  if (!target) return <span />;
  return (
    <button
      onClick={() => onGo(target.id)}
      className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs hover:border-accent"
    >
      {dir === "prev" ? "← " : ""}
      {dir === "prev" ? labels.prevChapter : labels.nextChapter}
      {dir === "next" ? " →" : ""}
    </button>
  );
}
