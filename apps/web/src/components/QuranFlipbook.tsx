"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { flipbookLabels } from "@/lib/flipbook-labels";

interface SurahMeta {
  id: number;
  name_ar: string;
  name_transliteration: string;
  ayah_count: number;
}
interface AyatRow {
  number: number;
  text_ar: string;
  translation: string | null;
}

const AYAT_PER_PAGE = 5;

function paginate(ayat: AyatRow[]): AyatRow[][] {
  const pages: AyatRow[][] = [];
  for (let i = 0; i < ayat.length; i += AYAT_PER_PAGE) pages.push(ayat.slice(i, i + AYAT_PER_PAGE));
  return pages.length ? pages : [[]];
}

/**
 * A real page-turning Mushaf reader — CSS 3D transforms rotate the current
 * leaf away to reveal the next, like an actual book. Pages are chunked into
 * readable groups of ayat (real pagination requires the exact Mushaf Utsmani
 * typeset, which isn't data this project has — chunking by ayat count is the
 * honest alternative, same principle as any digital reader that isn't a
 * scan of a specific print edition).
 */
export function QuranFlipbook({ locale }: { locale: string }) {
  const t = flipbookLabels(locale);
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [selectedId, setSelectedId] = useState(1);
  const [ayat, setAyat] = useState<AyatRow[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);

  useEffect(() => {
    api.get<{ surah: SurahMeta[] }>("/quran/surah").then((r) => setSurahs(r.surah)).catch(() => {});
  }, []);

  useEffect(() => {
    setPageIndex(0);
    api
      .get<{ ayat: AyatRow[] }>(`/quran/surah/${selectedId}?lang=${locale}`)
      .then((r) => setAyat(r.ayat))
      .catch(() => setAyat([]));
  }, [selectedId, locale]);

  const pages = useMemo(() => paginate(ayat), [ayat]);
  const selectedSurah = surahs.find((s) => s.id === selectedId);

  function turn(dir: "next" | "prev") {
    if (flipping) return;
    const target = pageIndex + (dir === "next" ? 1 : -1);
    if (target < 0 || target >= pages.length) return;
    setFlipping(dir);
    setTimeout(() => {
      setPageIndex(target);
      setFlipping(null);
    }, 420);
  }

  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (dx < -40) turn("next");
    else if (dx > 40) turn("prev");
    touchStartX.current = null;
  }

  const currentPage = pages[pageIndex] ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">{t.chooseSurah}:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm"
        >
          {surahs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}. {s.name_transliteration}
            </option>
          ))}
        </select>
      </div>

      <div style={{ perspective: "1800px" }} className="relative">
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className={`relative min-h-[420px] overflow-hidden rounded-2xl border-4 border-accent/30 bg-gradient-to-br from-[#fdf8ec] to-[#f4ecd8] p-6 shadow-2xl transition-transform duration-[420ms] ease-in-out dark:from-[#1c2b22] dark:to-[#0f1a14] sm:p-10 ${
            flipping === "next" ? "[transform:rotateY(-14deg)_scale(0.97)] opacity-70" : flipping === "prev" ? "[transform:rotateY(14deg)_scale(0.97)] opacity-70" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {selectedSurah && (
            <p className="mb-4 text-center font-heading text-sm text-accent">
              {selectedSurah.name_transliteration} — {selectedSurah.name_ar}
            </p>
          )}
          <div className="space-y-5">
            {currentPage.map((a) => (
              <div key={a.number} className="text-center">
                <p dir="rtl" className="font-arabic text-2xl leading-[2.2] text-[var(--color-text-primary)] sm:text-3xl">
                  {a.text_ar} <span className="text-accent">﴿{a.number}﴾</span>
                </p>
                {a.translation && (
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
                    {a.translation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Tap zones — left/right edges turn the page, matching a real book */}
          <button
            aria-label={t.prevPage}
            onClick={() => turn("prev")}
            disabled={pageIndex === 0}
            className="absolute inset-y-0 left-0 w-1/6 cursor-w-resize disabled:cursor-default"
          />
          <button
            aria-label={t.nextPage}
            onClick={() => turn("next")}
            disabled={pageIndex >= pages.length - 1}
            className="absolute inset-y-0 right-0 w-1/6 cursor-e-resize disabled:cursor-default"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => turn("prev")}
          disabled={pageIndex === 0}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm disabled:opacity-30"
        >
          ‹ {t.prevPage}
        </button>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {t.pageOf} {pageIndex + 1} / {pages.length}
        </span>
        <button
          onClick={() => turn("next")}
          disabled={pageIndex >= pages.length - 1}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm disabled:opacity-30"
        >
          {t.nextPage} ›
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-[var(--color-text-secondary)]">{t.tapHint}</p>
    </div>
  );
}
