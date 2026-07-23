"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { resolveTranslationLang, LOCALES } from "@ulyah/shared/i18n";
import { usePlayerStore, type QueueItem } from "@/lib/player-store";
import { mushafLabels } from "@/lib/mushaf-labels";
import { analyzeTajwid, TAJWID_RULES, type TajwidRule } from "@/lib/tajwid";

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
// Where the reader left off last visit — restored on open so nobody is ever
// thrown back to page 1 / Al-Fatihah after closing the tab.
const LAST_PAGE_KEY = "ulyah:mushaf:last-page";

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
  const [tajwidOn, setTajwidOn] = useState(true);
  const [tajwidPopup, setTajwidPopup] = useState<TajwidRule | null>(null);
  const initRef = useRef(false);

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
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Continuous-recitation mode: set when the reader starts playback, cleared
  // by its stop button. While on, finishing the last ayah of the page turns
  // the page by itself (with the flip animation) and keeps reciting.
  const continuousRef = useRef(false);
  const wasPlayingRef = useRef(false);

  // Which ayah is being recited right now (for the live pointer/highlight).
  const activeItem = isPlaying ? queue[currentIndex] : undefined;
  const activeKey = activeItem ? `${activeItem.surahId}:${activeItem.number}` : null;

  // Keep the recited ayah in view as recitation proceeds down the page.
  useEffect(() => {
    if (!activeKey) return;
    document
      .getElementById(`mushaf-ayah-${activeKey.replace(":", "-")}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeKey]);

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
  // itself never changes, only which translation is attached per ayah). On
  // the very first load, resume from the last page the visitor was reading.
  useEffect(() => {
    let cancelled = false;
    let n = pageNumber;
    if (!initRef.current) {
      initRef.current = true;
      const stored = Number(localStorage.getItem(LAST_PAGE_KEY));
      if (Number.isInteger(stored) && stored >= 1 && stored <= TOTAL_PAGES && stored !== pageNumber) {
        n = stored;
        setPageNumber(n);
        setPageInput(String(n));
      }
    }
    setLoading(true);
    fetchPage(n).then((data) => {
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

  // Every page change is the new "last read" position; the tajwid popup also
  // closes itself on page turn (it otherwise stays until closed manually).
  useEffect(() => {
    try {
      localStorage.setItem(LAST_PAGE_KEY, String(pageNumber));
    } catch {
      /* storage may be unavailable (private mode) — reading still works */
    }
    setTajwidPopup(null);
  }, [pageNumber]);

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

  function goToPage(n: number, direction: FlipDirection, autoplay = false) {
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
      flipTimeoutRef.current = setTimeout(resolve, 470);
    });
    Promise.all([fetchPage(n), animDelay]).then(([data]) => {
      setPageNumber(n);
      setPageData(data);
      setFlipPhase("in");
      flipTimeoutRef.current = setTimeout(() => setFlipPhase("idle"), 530);
      // Continuous recitation: the page has turned itself — keep reciting
      // from the first ayah of the new page.
      if (autoplay && data) startRecitation(data);
    });
  }

  function startRecitation(data: MushafPageResponse) {
    setLayers(["ayah"]);
    const items: QueueItem[] = data.ayahs.map((a) => ({
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

  function playPage() {
    if (!pageData) return;
    continuousRef.current = true;
    startRecitation(pageData);
  }

  function stopPage() {
    continuousRef.current = false;
    pause();
  }

  // Auto page-turn: when continuous recitation finishes the LAST ayah of
  // this page (the player flips isPlaying off after the final queue item),
  // turn the page with the flip animation and keep going. A manual stop
  // clears continuousRef first, so it never re-triggers. (A pause from the
  // global bar exactly on the final ayah is indistinguishable from a natural
  // finish — acceptable: the reader's own stop button is the primary stop.)
  useEffect(() => {
    const finished =
      wasPlayingRef.current &&
      !isPlaying &&
      continuousRef.current &&
      queue.length > 0 &&
      currentIndex >= queue.length - 1 &&
      queue[0]?.surahId === pageData?.ayahs[0]?.surahId &&
      queue[0]?.number === pageData?.ayahs[0]?.number;
    wasPlayingRef.current = isPlaying;
    if (finished && pageNumber < TOTAL_PAGES && flipPhase === "idle") {
      goToPage(pageNumber + 1, "next", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex, queue]);

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
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-dark)] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-accent sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#f4efe3]/70">{t.subtitle}</p>
        </div>

        {/* Controls bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-accent/25 bg-[color-mix(in_srgb,var(--color-primary)_60%,transparent)] p-3 backdrop-blur-sm">
          <button
            onClick={playPage}
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary shadow-lg transition hover:brightness-110"
          >
            {t.playPage}
          </button>
          {isPlaying && (
            <button
              onClick={stopPage}
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

          <button
            onClick={() => {
              setTajwidOn((v) => !v);
              setTajwidPopup(null);
            }}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              tajwidOn ? "bg-accent/20 text-accent ring-1 ring-accent/50" : "border border-accent/40 text-accent"
            }`}
          >
            {locale === "id" ? "Tajwid" : locale === "ar" ? "التجويد" : "Tajwid"} {tajwidOn ? "✓" : ""}
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

        {/* Colour legend + link to the full tajwid guide — only while tajwid
            colouring is on, so the reader knows what each colour means. */}
        {tajwidOn && (
          <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px]">
            {(Object.entries(TAJWID_RULES) as [TajwidRule, (typeof TAJWID_RULES)[TajwidRule]][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setTajwidPopup(key)}
                className="inline-flex items-center gap-1 text-accent/90 transition hover:text-accent"
              >
                <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                {locale === "id" ? info.nameId : info.nameEn}
              </button>
            ))}
            <a
              href={`/${locale}/quran/tajwid`}
              className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-2.5 py-0.5 font-medium text-accent transition hover:bg-accent/10"
            >
              🎨 {locale === "id" ? "Panduan lengkap" : locale === "ar" ? "الدليل الكامل" : "Full guide"} →
            </a>
          </div>
        )}

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
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-accent/40 bg-[color-mix(in_srgb,var(--color-primary)_80%,transparent)] p-3 text-accent shadow-lg transition hover:bg-accent/20 disabled:opacity-30"
          >
            {isRtl ? "→" : "←"}
          </button>
          <button
            onClick={() => goToPage(pageNumber + 1, "next")}
            disabled={pageNumber >= TOTAL_PAGES || flipPhase !== "idle"}
            aria-label={t.nextPage}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-accent/40 bg-[color-mix(in_srgb,var(--color-primary)_80%,transparent)] p-3 text-accent shadow-lg transition hover:bg-accent/20 disabled:opacity-30"
          >
            {isRtl ? "←" : "→"}
          </button>

          <div
            key={pageNumber}
            className={`mushaf-frame mx-auto min-h-[70vh] max-w-3xl p-2 sm:min-h-[75vh] sm:p-3 ${flipClass}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="mushaf-paper flex min-h-full flex-col px-4 pb-4 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
            {loading && !pageData ? (
              <p className="py-24 text-center text-sm text-[color-mix(in_srgb,var(--color-primary)_60%,transparent)]">{t.loadingPage}</p>
            ) : pageData ? (
              <div dir="rtl" className="mushaf-text flex-1">
                {pageData.ayahs.map((a) => (
                  <span key={`${a.surahId}:${a.number}`}>
                    {a.isFirstOfSurah && (
                      <span className="my-4 flex items-center justify-center gap-3 rounded-xl border-2 border-accent/60 bg-gradient-to-l from-accent/15 via-accent/5 to-accent/15 py-3 text-center">
                        <span aria-hidden className="text-accent">✦</span>
                        <span>
                          <span className="block font-heading text-xl text-[#7a1f2b]">{a.surahNameAr}</span>
                          <span className="block text-[11px] text-[color-mix(in_srgb,var(--color-primary)_60%,transparent)]">{a.surahName}</span>
                        </span>
                        <span aria-hidden className="text-accent">✦</span>
                      </span>
                    )}
                    <span
                      id={`mushaf-ayah-${a.surahId}-${a.number}`}
                      className={`font-arabic cursor-pointer px-0.5 text-2xl leading-[2.4] text-[#1a1408] transition hover:bg-accent/10 sm:text-3xl ${
                        activeKey === `${a.surahId}:${a.number}` ? "mushaf-ayah-active" : ""
                      }`}
                      onClick={() => openTafsir(a.surahId, a.number)}
                    >
                      {tajwidOn
                        ? analyzeTajwid(a.textAr).map((seg, si) =>
                            seg.rule ? (
                              <span
                                key={si}
                                role="button"
                                style={{ color: TAJWID_RULES[seg.rule].color, fontWeight: 600 }}
                                onClick={(e) => {
                                  // Explaining a rule must never interrupt the
                                  // recitation or open the tafsir sheet.
                                  e.stopPropagation();
                                  setTajwidPopup(seg.rule);
                                }}
                              >
                                {seg.text}
                              </span>
                            ) : (
                              <span key={si}>{seg.text}</span>
                            )
                          )
                        : a.textAr}
                      <span
                        className={`mx-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent/70 bg-accent/5 text-sm font-semibold text-[#7a1f2b] ${
                          activeKey === `${a.surahId}:${a.number}` ? "mushaf-ayah-live" : ""
                        }`}
                      >
                        {toArabicNumeral(a.number)}
                      </span>
                    </span>{" "}
                  </span>
                ))}
              </div>
            ) : (
              <p className="py-24 text-center text-sm text-danger">—</p>
            )}

            {/* Page-number medallion, like the roundel at the foot of a
                printed mushaf page. */}
            <div className="mt-6 text-center">
              <span className="mushaf-page-medallion text-sm">{toArabicNumeral(pageNumber)}</span>
            </div>

            {showTranslation && pageData && (
              <div className="mt-6 space-y-2 border-t border-accent/20 pt-4 text-left" dir={isRtl ? "rtl" : "ltr"}>
                {pageData.ayahs.map((a) =>
                  a.translation ? (
                    <p key={`t-${a.surahId}:${a.number}`} className="text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-primary)_80%,transparent)]">
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
      </div>

      {/* Tajwid rule popup — deliberately NON-modal: no backdrop, playback
          keeps going, the reader keeps scrolling. Stays until closed manually
          or the page turns (see the pageNumber effect). */}
      {tajwidPopup && (
        <div className="tajwid-pop fixed bottom-24 left-1/2 z-40 w-[92%] max-w-sm -translate-x-1/2 rounded-2xl border-2 bg-[var(--color-card)] p-4 shadow-2xl"
          style={{ borderColor: TAJWID_RULES[tajwidPopup].color }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-2 font-heading text-base">
              <span
                aria-hidden
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: TAJWID_RULES[tajwidPopup].color }}
              />
              {locale === "id" ? TAJWID_RULES[tajwidPopup].nameId : TAJWID_RULES[tajwidPopup].nameEn}
            </p>
            <button
              onClick={() => setTajwidPopup(null)}
              aria-label={t.closeButton}
              className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {locale === "id" ? TAJWID_RULES[tajwidPopup].descId : TAJWID_RULES[tajwidPopup].descEn}
          </p>
        </div>
      )}

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
