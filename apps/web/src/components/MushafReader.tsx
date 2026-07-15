"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { resolveTranslationLang, LOCALES } from "@ulyah/shared/i18n";
import { usePlayerStore, type QueueItem } from "@/lib/player-store";
import { mushafLabels } from "@/lib/mushaf-labels";

interface MushafAyahDTO {
  surahId: number;
  surahNameAr: string;
  surahName: string;
  number: number;
  textAr: string;
  translation: string | null;
  isFirstOfSurah: boolean;
}
interface MushafPageResponse {
  pageNumber: number;
  totalPages: number;
  juz: number | null;
  ayahs: MushafAyahDTO[];
}
interface SurahMeta {
  id: number;
  name_ar: string;
  name_transliteration: string;
}

const TOTAL_PAGES = 604;
const JUZ_LIST = Array.from({ length: 30 }, (_, i) => i + 1);

type FlipPhase = "idle" | "out" | "in";
type FlipDirection = "next" | "prev";

/**
 * Mushaf Utsmani — the full 604-page Madinah Mushaf layout, one page at a
 * time, with a book-like page-turn animation (see globals.css). Deliberately
 * fills the whole viewport: this is meant to feel like opening a real Mushaf,
 * not a boxed widget inside the usual page chrome.
 *
 * Reuses existing site infrastructure rather than building a parallel one:
 * recitation audio goes through the SAME global player (usePlayerStore +
 * GlobalPlayerBar, already mounted site-wide) that every other reader uses,
 * translations reuse the site's own translation table, and tafsir reuses
 * /quran/tafsir-editions + /quran/tafsir/:edition/:surah/:number — including
 * Tafsir Kemenag RI for Indonesian readers — exactly as QuranReaderWidget
 * does.
 */
export function MushafReader({ locale }: { locale: string }) {
  const t = mushafLabels(locale);
  const isRtl = locale === "ar";

  const [pageNumber, setPageNumber] = useState(1);
  const [pageData, setPageData] = useState<MushafPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipPhase, setFlipPhase] = useState<FlipPhase>("idle");
  const [flipDirection, setFlipDirection] = useState<FlipDirection>("next");

  const [showTranslation, setShowTranslation] = useState(true);
  const [translationLocale, setTranslationLocale] = useState(locale);

  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [pageInput, setPageInput] = useState("1");

  const [tafsirFor, setTafsirFor] = useState<{ surahId: number; number: number } | null>(null);
  const [tafsirEditions, setTafsirEditions] = useState<{ slug: string; name: string; author: string }[]>([]);
  const [tafsirEdition, setTafsirEdition] = useState<string | null>(null);
  const [tafsirText, setTafsirText] = useState<{ text: string; source: string } | null | "loading">("loading");

  const loadSurahQueue = usePlayerStore((s) => s.loadSurahQueue);
  const setLayers = usePlayerStore((s) => s.setLayers);
  const pause = usePlayerStore((s) => s.pause);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translationLang = resolveTranslationLang(translationLocale);

  const fetchPage = useCallback(
    async (n: number): Promise<MushafPageResponse | null> => {
      try {
        return await api.get<MushafPageResponse>(`/quran/mushaf/page/${n}?lang=${translationLocale}`);
      } catch {
        return null;
      }
    },
    [translationLocale]
  );

  // Initial load + reload when the translation language changes (Arabic text
  // itself never changes, only which translation is attached per ayah).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPage(pageNumber).then((data) => {
      if (!cancelled) {
        setPageData(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationLocale]);

  useEffect(() => {
    api
      .get<{ surah: SurahMeta[] }>("/quran/surah")
      .then((d) => setSurahList(d.surah))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  function goToPage(n: number, direction: FlipDirection) {
    if (n < 1 || n > TOTAL_PAGES || flipPhase !== "idle") return;
    setFlipDirection(direction);
    setFlipPhase("out");
    setPageInput(String(n));
    // Fetch the new page WHILE the flip-out animation plays, so the network
    // round-trip overlaps the animation instead of adding to it. The swap
    // waits for BOTH the animation timing AND the fetch — on a slow
    // connection the page just stays flipped-out a little longer rather than
    // flipping "in" with stale/missing content.
    const animDelay = new Promise<void>((resolve) => {
      flipTimeoutRef.current = setTimeout(resolve, 260);
    });
    Promise.all([fetchPage(n), animDelay]).then(([data]) => {
      setPageNumber(n);
      setPageData(data);
      setFlipPhase("in");
      flipTimeoutRef.current = setTimeout(() => setFlipPhase("idle"), 280);
    });
  }

  function playPage() {
    if (!pageData) return;
    setLayers(["ayah"]);
    const items: QueueItem[] = pageData.ayahs.map((a) => ({
      surahId: a.surahId,
      surahName: a.surahName,
      number: a.number,
      textAr: a.textAr,
      translation: a.translation,
      tafsir: null,
      asbabun: null,
      hadits: null,
      kisah: null,
      bundleLoaded: false,
    }));
    loadSurahQueue(items, 0);
  }

  function openTafsir(surahId: number, number: number) {
    setTafsirFor({ surahId, number });
    setTafsirText("loading");
    api
      .get<{ editions: { slug: string; name: string; author: string }[] }>(`/quran/tafsir-editions?lang=${locale}`)
      .then((d) => {
        setTafsirEditions(d.editions);
        const first = d.editions[0]?.slug ?? null;
        setTafsirEdition(first);
        if (first) loadTafsirText(first, surahId, number);
        else setTafsirText(null);
      })
      .catch(() => setTafsirText(null));
  }

  function loadTafsirText(edition: string, surahId: number, number: number) {
    setTafsirText("loading");
    api
      .get<{ tafsir: { text: string; source: string } | null }>(`/quran/tafsir/${edition}/${surahId}/${number}?lang=${locale}`)
      .then((d) => setTafsirText(d.tafsir))
      .catch(() => setTafsirText(null));
  }

  const flipClass =
    flipPhase === "out"
      ? flipDirection === "next"
        ? "mushaf-page-flip-next-out"
        : "mushaf-page-flip-prev-out"
      : flipPhase === "in"
        ? flipDirection === "next"
          ? "mushaf-page-flip-next-in"
          : "mushaf-page-flip-prev-in"
        : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06251b] via-[#0B3D2E] to-[#06251b] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-accent sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#f4efe3]/70">{t.subtitle}</p>
        </div>

        {/* Controls bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-accent/25 bg-[#0B3D2E]/60 p-3 backdrop-blur-sm">
          <button
            onClick={playPage}
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary shadow-lg transition hover:brightness-110"
          >
            {t.playPage}
          </button>
          {isPlaying && (
            <button
              onClick={pause}
              className="rounded-full border border-accent/40 px-4 py-2 text-xs font-medium text-accent"
            >
              {t.stopPage}
            </button>
          )}

          <button
            onClick={() => setShowTranslation((v) => !v)}
            className="rounded-full border border-accent/40 px-4 py-2 text-xs font-medium text-accent"
          >
            {showTranslation ? t.hideTranslation : t.showTranslation}
          </button>

          <select
            value={translationLocale}
            onChange={(e) => setTranslationLocale(e.target.value)}
            aria-label={t.translationLanguage}
            className="rounded-full border border-accent/40 bg-transparent px-3 py-2 text-xs text-accent"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code} className="text-primary">
                {l.label}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              const id = Number(e.target.value);
              if (!id) return;
              api
                .get<{ page: number }>(`/quran/mushaf/jump?type=surah&id=${id}`)
                .then((d) => goToPage(d.page, d.page >= pageNumber ? "next" : "prev"));
            }}
            aria-label={t.jumpToSurah}
            className="rounded-full border border-accent/40 bg-transparent px-3 py-2 text-xs text-accent"
          >
            <option value="" className="text-primary">
              {t.jumpToSurah}
            </option>
            {surahList.map((s) => (
              <option key={s.id} value={s.id} className="text-primary">
                {s.id}. {s.name_transliteration}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              const id = Number(e.target.value);
              if (!id) return;
              api
                .get<{ page: number }>(`/quran/mushaf/jump?type=juz&id=${id}`)
                .then((d) => goToPage(d.page, d.page >= pageNumber ? "next" : "prev"));
            }}
            aria-label={t.jumpToJuz}
            className="rounded-full border border-accent/40 bg-transparent px-3 py-2 text-xs text-accent"
          >
            <option value="" className="text-primary">
              {t.jumpToJuz}
            </option>
            {JUZ_LIST.map((j) => (
              <option key={j} value={j} className="text-primary">
                {t.juzLabel} {j}
              </option>
            ))}
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(pageInput);
              if (n >= 1 && n <= TOTAL_PAGES) goToPage(n, n > pageNumber ? "next" : "prev");
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="number"
              min={1}
              max={TOTAL_PAGES}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              aria-label={t.pageInputLabel}
              className="w-16 rounded-full border border-accent/40 bg-transparent px-3 py-2 text-center text-xs text-accent"
            />
            <button type="submit" className="rounded-full border border-accent/40 px-3 py-2 text-xs text-accent">
              {t.goButton}
            </button>
          </form>
        </div>

        <p className="mt-3 text-center text-xs text-accent/80">
          {t.pageOf(pageNumber, TOTAL_PAGES)}
          {pageData?.juz ? ` · ${t.juzLabel} ${pageData.juz}` : ""}
        </p>

        {/* The page itself */}
        <div className="relative mt-4" style={{ perspective: "2000px" }}>
          <button
            onClick={() => goToPage(pageNumber - 1, "prev")}
            disabled={pageNumber <= 1 || flipPhase !== "idle"}
            aria-label={t.prevPage}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-accent/40 bg-[#0B3D2E]/80 p-3 text-accent shadow-lg transition hover:bg-accent/20 disabled:opacity-30"
          >
            {isRtl ? "→" : "←"}
          </button>
          <button
            onClick={() => goToPage(pageNumber + 1, "next")}
            disabled={pageNumber >= TOTAL_PAGES || flipPhase !== "idle"}
            aria-label={t.nextPage}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-accent/40 bg-[#0B3D2E]/80 p-3 text-accent shadow-lg transition hover:bg-accent/20 disabled:opacity-30"
          >
            {isRtl ? "←" : "→"}
          </button>

          <div
            key={pageNumber}
            className={`mushaf-page-surface mx-auto min-h-[70vh] max-w-3xl rounded-[2rem] border-[6px] border-double border-accent/50 bg-[#fdf8ec] p-6 shadow-2xl sm:min-h-[75vh] sm:p-10 dark:bg-[#fdf8ec] ${flipClass}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {loading && !pageData ? (
              <p className="py-24 text-center text-sm text-[#0B3D2E]/60">{t.loadingPage}</p>
            ) : pageData ? (
              <div dir="rtl" className="space-y-1">
                {pageData.ayahs.map((a) => (
                  <div key={`${a.surahId}:${a.number}`}>
                    {a.isFirstOfSurah && (
                      <div className="my-4 rounded-xl border border-accent/40 bg-accent/10 py-3 text-center">
                        <p className="font-heading text-lg text-[#0B3D2E]">{a.surahNameAr}</p>
                        <p className="text-xs text-[#0B3D2E]/60">{a.surahName}</p>
                      </div>
                    )}
                    <span
                      className="font-arabic cursor-pointer text-2xl leading-[2.4] text-[#0B3D2E] transition hover:bg-accent/10 sm:text-3xl"
                      onClick={() => openTafsir(a.surahId, a.number)}
                    >
                      {a.textAr}
                      <span className="mx-1 inline-block rounded-full border border-accent/50 px-2 text-base text-accent">
                        {toArabicNumeral(a.number)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-24 text-center text-sm text-danger">—</p>
            )}

            {showTranslation && pageData && (
              <div className="mt-6 space-y-2 border-t border-accent/20 pt-4 text-left" dir={isRtl ? "rtl" : "ltr"}>
                {pageData.ayahs.map((a) =>
                  a.translation ? (
                    <p key={`t-${a.surahId}:${a.number}`} className="text-sm leading-relaxed text-[#0B3D2E]/80">
                      <span className="font-medium text-accent">
                        {a.surahId}:{a.number}
                      </span>{" "}
                      {a.translation}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {tafsirFor && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
          onClick={() => setTafsirFor(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-accent/30 bg-[var(--color-card)] p-5 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-lg">
                {t.tafsirTitle} — {tafsirFor.surahId}:{tafsirFor.number}
              </p>
              <button onClick={() => setTafsirFor(null)} className="text-sm text-[var(--color-text-secondary)]">
                {t.closeButton} ✕
              </button>
            </div>
            {tafsirEditions.length > 0 && (
              <select
                value={tafsirEdition ?? ""}
                onChange={(e) => {
                  setTafsirEdition(e.target.value);
                  loadTafsirText(e.target.value, tafsirFor.surahId, tafsirFor.number);
                }}
                className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              >
                {tafsirEditions.map((ed) => (
                  <option key={ed.slug} value={ed.slug}>
                    {ed.name} — {ed.author}
                  </option>
                ))}
              </select>
            )}
            <div className="mt-4 text-sm leading-relaxed">
              {tafsirText === "loading" ? (
                <p className="text-[var(--color-text-secondary)]">{t.tafsirLoading}</p>
              ) : tafsirText ? (
                <>
                  <p>{tafsirText.text}</p>
                  <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                    {t.tafsirSource}: {tafsirText.source}
                  </p>
                </>
              ) : (
                <p className="text-[var(--color-text-secondary)]">{t.tafsirEmpty}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumeral(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_DIGITS[Number(d)] ?? d)
    .join("");
}
