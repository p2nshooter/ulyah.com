"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { usePlayerStore, LAYERS, MODE_PRESETS, type Layer, type QueueItem } from "@/lib/player-store";
import type { Dictionary } from "@/dictionaries";

interface SurahMeta {
  id: number;
  name_ar: string;
  name_id: string;
  name_transliteration: string;
  revelation_place: "meccan" | "medinan";
  ayah_count: number;
}

interface AyatRow {
  id: number;
  number: number;
  text_ar: string;
  text_translit: string | null;
  translation: string | null;
}

interface Bundle {
  translation: { text: string } | null;
  tafsir: { text: string; source: string }[];
  asbabun_nuzul: { text: string; source: string }[];
  hadits: { text_id: string; narrator: string | null; source: string }[];
  stories: { id: number; title: string; slug: string }[];
}

const PRESETS: { key: keyof typeof MODE_PRESETS; label: (d: Dictionary) => string; desc: (d: Dictionary) => string }[] = [
  { key: "full", label: (d) => d.reader.modeAll, desc: (d) => d.reader.modeAllDesc },
  { key: "ayah", label: (d) => d.reader.modeAyahOnly, desc: (d) => d.reader.modeAyahOnlyDesc },
  { key: "translation", label: (d) => d.reader.modeTranslationOnly, desc: (d) => d.reader.modeTranslationOnlyDesc },
  { key: "tafsir", label: (d) => d.reader.modeTafsirOnly, desc: (d) => d.reader.modeTafsirOnlyDesc },
  { key: "hikmah", label: (d) => d.reader.modeHikmah, desc: (d) => d.reader.modeHikmahDesc },
];

const LAYER_LABEL: Record<Layer, (d: Dictionary) => string> = {
  ayah: (d) => d.reader.layerAyah,
  translation: (d) => d.reader.translationLabel,
  tafsir: (d) => d.reader.tafsirLabel,
  asbabun: (d) => d.reader.asbabunNuzulLabel,
  hadits: (d) => d.reader.haditsLabel,
};

const LAYER_ICON: Record<Layer, string> = {
  ayah: "۝",
  translation: "🌍",
  tafsir: "📖",
  asbabun: "📜",
  hadits: "🕌",
};

function layersMatchPreset(layers: Layer[], preset: Layer[]): boolean {
  return layers.length === preset.length && preset.every((l) => layers.includes(l));
}

export function QuranReaderWidget({ locale, dict }: { locale: string; dict: Dictionary }) {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [surahFilter, setSurahFilter] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [ayat, setAyat] = useState<AyatRow[]>([]);
  const [focus, setFocus] = useState(1); // focused ayah number (1-based)
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loadingAyat, setLoadingAyat] = useState(true);
  const [copied, setCopied] = useState(false);
  const arabicRef = useRef<HTMLDivElement>(null);

  const { layers, applyPreset, toggleLayer, loadSurahQueue, queue, currentIndex, isPlaying, activeLayer } =
    usePlayerStore();

  // Load surah index once.
  useEffect(() => {
    api
      .get<{ surah: SurahMeta[] }>("/quran/surah")
      .then((r) => {
        setSurahs(r.surah);
        setSelectedSurah((prev) => prev ?? r.surah.find((s) => s.id === 2) ?? r.surah[0] ?? null);
      })
      .catch(() => {});
  }, []);

  // Load the selected surah's ayat.
  useEffect(() => {
    if (!selectedSurah) return;
    setLoadingAyat(true);
    setFocus(1);
    api
      .get<{ ayat: AyatRow[] }>(`/quran/surah/${selectedSurah.id}?lang=${locale}`)
      .then((r) => setAyat(r.ayat))
      .finally(() => setLoadingAyat(false));
  }, [selectedSurah, locale]);

  // Keep the focused ayah in sync with the player when it's reciting this surah.
  useEffect(() => {
    const cur = queue[currentIndex];
    if (cur && selectedSurah && cur.surahId === selectedSurah.id) setFocus(cur.number);
  }, [currentIndex, queue, selectedSurah]);

  // Load the rich bundle (tafsir/asbabun/hadits/story) for the focused ayah.
  useEffect(() => {
    if (!selectedSurah) return;
    let cancelled = false;
    setBundle(null);
    api
      .get<Bundle>(`/quran/ayah/${selectedSurah.id}/${focus}?lang=${locale}`)
      .then((b) => {
        if (!cancelled) setBundle(b);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedSurah, focus, locale]);

  const focusRow = useMemo(() => ayat.find((a) => a.number === focus) ?? null, [ayat, focus]);

  const filteredSurahs = useMemo(
    () =>
      surahs.filter((s) =>
        `${s.id} ${s.name_transliteration} ${s.name_id}`.toLowerCase().includes(surahFilter.toLowerCase())
      ),
    [surahs, surahFilter]
  );

  function buildQueue(startNumber: number) {
    if (!selectedSurah) return;
    const items: QueueItem[] = ayat.map((a) => ({
      surahId: selectedSurah.id,
      surahName: selectedSurah.name_transliteration,
      number: a.number,
      textAr: a.text_ar,
      translation: a.translation,
      tafsir: null,
      asbabun: null,
      hadits: null,
      bundleLoaded: false,
    }));
    const startIndex = Math.max(0, items.findIndex((i) => i.number === startNumber));
    loadSurahQueue(items, startIndex);
  }

  /** Focus an ayah AND start reading it immediately — clicking any ayah (or
   * navigating to it) should never leave the player silent ("diem aja"). */
  function focusAndPlay(n: number) {
    setFocus(n);
    buildQueue(n);
  }

  function shareAyah() {
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://ulyah.com"}/${locale}/quran?s=${selectedSurah?.id}&a=${focus}`;
    if (navigator.share) {
      navigator.share({ title: `${selectedSurah?.name_transliteration} : ${focus}`, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }

  const isThisAyahActive =
    queue[currentIndex]?.surahId === selectedSurah?.id && queue[currentIndex]?.number === focus && isPlaying;

  const summary: { layer: Layer; icon: string; label: string; text: string | null }[] = [
    { layer: "translation", icon: LAYER_ICON.translation, label: dict.reader.translationLabel, text: focusRow?.translation ?? bundle?.translation?.text ?? null },
    { layer: "tafsir", icon: LAYER_ICON.tafsir, label: dict.reader.tafsirLabel, text: bundle?.tafsir[0]?.text ?? null },
    { layer: "asbabun", icon: LAYER_ICON.asbabun, label: dict.reader.asbabunNuzulLabel, text: bundle?.asbabun_nuzul[0]?.text ?? null },
    { layer: "hadits", icon: LAYER_ICON.hadits, label: dict.reader.haditsLabel, text: bundle?.hadits[0] ? `“${bundle.hadits[0].text_id}” — ${bundle.hadits[0].narrator ?? ""} (${bundle.hadits[0].source})` : null },
  ];

  return (
    <div className="grid gap-4 desktop:grid-cols-[236px_1fr_300px]">
      {/* ── Surah list ─────────────────────────────────────────── */}
      <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-heading text-sm">{dict.nav.quran}</p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">{dict.reader.allSurah}</span>
        </div>
        <input
          value={surahFilter}
          onChange={(e) => setSurahFilter(e.target.value)}
          placeholder={dict.nav.searchPlaceholder}
          className="mb-2 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm"
        />
        <div className="scrollbar-thin max-h-72 overflow-y-auto pr-1 desktop:max-h-[520px]">
          {filteredSurahs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSurah(s)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-accent/5 ${
                selectedSurah?.id === s.id ? "bg-accent/10 font-medium text-accent" : ""
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-accent/30 text-[10px] text-accent">
                {s.id}
              </span>
              <span className="truncate">{s.name_transliteration}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Ayah focus + player ────────────────────────────────── */}
      <div className="min-w-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-6">
        {selectedSurah && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  aria-label="previous surah"
                  onClick={() => setSelectedSurah(surahs.find((s) => s.id === selectedSurah.id - 1) ?? selectedSurah)}
                  disabled={selectedSurah.id <= 1}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] text-sm disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  aria-label="next surah"
                  onClick={() => setSelectedSurah(surahs.find((s) => s.id === selectedSurah.id + 1) ?? selectedSurah)}
                  disabled={selectedSurah.id >= 114}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] text-sm disabled:opacity-30"
                >
                  ›
                </button>
                <div>
                  <p className="font-heading text-lg leading-tight">
                    {dict.nav.quran.includes("Sur") ? "" : ""}
                    {selectedSurah.name_transliteration}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {selectedSurah.ayah_count} {dict.reader.ayahLabel} ·{" "}
                    {selectedSurah.revelation_place === "meccan" ? dict.reader.meccan : dict.reader.medinan}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="jump to ayah"
                  value={focus}
                  onChange={(e) => focusAndPlay(Number(e.target.value))}
                  className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
                >
                  {Array.from({ length: selectedSurah.ayah_count }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {dict.reader.ayahLabel} {n}
                    </option>
                  ))}
                </select>
                <button
                  onClick={shareAyah}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs hover:border-accent"
                >
                  {copied ? "✓" : "⤴"} {dict.reader.share}
                </button>
              </div>
            </div>

            {/* Arabic + translation — click the verse to read it right now */}
            <div
              ref={arabicRef}
              onClick={() => focusRow && buildQueue(focus)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && focusRow && buildQueue(focus)}
              title={dict.reader.autoPlay}
              className={`mt-6 cursor-pointer rounded-2xl px-2 py-6 text-center transition hover:bg-accent/5 ${isThisAyahActive && activeLayer === "ayah" ? "ayah-active-highlight" : ""}`}
            >
              {loadingAyat ? (
                <p className="py-8 text-sm text-[var(--color-text-secondary)]">{dict.common.loading}</p>
              ) : (
                <>
                  <p dir="rtl" className="font-arabic text-3xl leading-[2.4] text-[var(--color-text-primary)] sm:text-4xl">
                    {focusRow?.text_ar}{" "}
                    <span className="text-accent">﴿{toArabicNumber(focus)}﴾</span>
                  </p>
                  {focusRow?.translation ? (
                    <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                      {focusRow.translation}
                    </p>
                  ) : (
                    <p className="mt-5 text-sm text-[var(--color-text-secondary)]">{dict.reader.translationNotAvailable}</p>
                  )}
                  <p className="mt-3 text-xs font-medium text-accent">
                    — {selectedSurah.name_transliteration} : {focus}
                  </p>
                </>
              )}
            </div>

            {/* Transport for this ayah */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-4 py-3 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => (isThisAyahActive ? usePlayerStore.getState().pause() : buildQueue(focus))}
                  className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white shadow-md transition hover:scale-105 dark:bg-accent dark:text-primary"
                >
                  {isThisAyahActive ? "⏸" : "▶"}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => focusAndPlay(Math.max(1, focus - 1))}
                    disabled={focus <= 1}
                    className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] text-sm disabled:opacity-30"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={() => focusAndPlay(Math.min(selectedSurah.ayah_count, focus + 1))}
                    disabled={focus >= selectedSurah.ayah_count}
                    className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] text-sm disabled:opacity-30"
                  >
                    ⏭
                  </button>
                </div>
              </div>
              <button
                onClick={() => buildQueue(focus)}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-md transition hover:brightness-105"
              >
                ▶ {dict.reader.autoPlay}
              </button>
            </div>

            {/* Mode presets + fine-grained layer chips */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">{dict.reader.modeSectionTitle}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 desktop:grid-cols-5">
                {PRESETS.map((p) => {
                  const active = layersMatchPreset(layers, MODE_PRESETS[p.key]);
                  return (
                    <button
                      key={p.key}
                      onClick={() => applyPreset(p.key)}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                        active ? "border-accent bg-accent/10" : "border-[var(--color-border)] hover:border-accent/50"
                      }`}
                    >
                      <span className="block font-medium">{p.label(dict)}</span>
                      <span className="mt-0.5 block text-[10px] leading-tight text-[var(--color-text-secondary)]">
                        {p.desc(dict)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mb-2 mt-4 text-xs text-[var(--color-text-secondary)]">{dict.reader.chooseLayers}</p>
              <div className="flex flex-wrap gap-2">
                {LAYERS.map((l) => {
                  const on = layers.includes(l);
                  return (
                    <button
                      key={l}
                      onClick={() => toggleLayer(l)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        on ? "border-accent bg-accent text-primary" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {LAYER_LABEL[l](dict)}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Ringkasan Ayat Ini ─────────────────────────────────── */}
      <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="mb-3 font-heading text-sm">{dict.reader.ayahSummaryTitle}</p>
        <div className="space-y-3">
          {summary.map((s) => (
            <div
              key={s.layer}
              className={`rounded-xl border p-3 transition ${
                activeLayer === s.layer && isPlaying ? "border-accent bg-accent/10" : "border-[var(--color-border)]"
              }`}
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-primary dark:text-accent">
                <span>{s.icon}</span>
                {s.label}
              </p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {s.text ?? dict.reader.noContentYet}
              </p>
            </div>
          ))}
          {bundle?.stories && bundle.stories.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-primary dark:text-accent">
                <span>✨</span>
                {dict.reader.storyLabel}
              </p>
              <a
                href={`/${locale}/kisah/${bundle.stories[0]!.slug}`}
                className="mt-1 block text-xs text-accent hover:underline"
              >
                {bundle.stories[0]!.title}
              </a>
            </div>
          )}
        </div>
        <button
          onClick={() => buildQueue(focus)}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110 dark:bg-accent dark:text-primary"
        >
          ▶ {dict.reader.autoPlay}
        </button>
      </aside>
    </div>
  );
}

function toArabicNumber(n: number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n)
    .split("")
    .map((d) => map[Number(d)] ?? d)
    .join("");
}
