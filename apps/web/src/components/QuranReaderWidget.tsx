"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { usePlayerStore, type PlaybackMode, type QueueAyah } from "@/lib/player-store";
import { AyahCard, type AyahBundleView } from "@/components/AyahCard";
import type { Dictionary } from "@/dictionaries";

interface SurahMeta {
  id: number;
  name_ar: string;
  name_id: string;
  name_transliteration: string;
  ayah_count: number;
}

interface AyatRow {
  id: number;
  number: number;
  text_ar: string;
  text_translit: string | null;
  translation: string | null;
}

const MODES: { key: PlaybackMode; labelKey: "modeAll" | "modeAyahOnly" | "modeTranslationOnly" | "modeTafsirOnly" | "modeStory"; descKey: "modeAllDesc" | "modeAyahOnlyDesc" | "modeTranslationOnlyDesc" | "modeTafsirOnlyDesc" | "modeStoryDesc" }[] = [
  { key: "full", labelKey: "modeAll", descKey: "modeAllDesc" },
  { key: "ayah", labelKey: "modeAyahOnly", descKey: "modeAyahOnlyDesc" },
  { key: "translation", labelKey: "modeTranslationOnly", descKey: "modeTranslationOnlyDesc" },
  { key: "tafsir", labelKey: "modeTafsirOnly", descKey: "modeTafsirOnlyDesc" },
];

export function QuranReaderWidget({
  locale,
  dict,
  showHadits = false,
  compact = false,
}: {
  locale: string;
  dict: Dictionary;
  showHadits?: boolean;
  compact?: boolean;
}) {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [surahFilter, setSurahFilter] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [ayat, setAyat] = useState<AyatRow[]>([]);
  const [bundles, setBundles] = useState<Record<number, AyahBundleView>>({});
  const [wordQuery, setWordQuery] = useState("");
  const [wordResults, setWordResults] = useState<{ surah_id: number; number: number; translation: string; surah_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const { mode, setMode, loadSurahQueue, currentIndex, queue, isPlaying, seekToIndex } = usePlayerStore();

  useEffect(() => {
    api
      .get<{ surah: SurahMeta[] }>("/quran/surah")
      .then((r) => {
        setSurahs(r.surah);
        setSelectedSurah(r.surah[0] ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSurah) return;
    setLoading(true);
    api
      .get<{ ayat: AyatRow[] }>(`/quran/surah/${selectedSurah.id}?lang=${locale}`)
      .then((r) => {
        setAyat(r.ayat);
        setBundles({});
      })
      .finally(() => setLoading(false));
  }, [selectedSurah, locale]);

  // Auto-scroll to the ayah currently playing, when it belongs to this surah.
  useEffect(() => {
    const current = queue[currentIndex];
    if (!current || !selectedSurah || current.surahId !== selectedSurah.id) return;
    const el = document.getElementById(`ayah-${current.number}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    loadBundleFor(current.number);
  }, [currentIndex, isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadBundleFor(number: number) {
    if (!selectedSurah || bundles[number]) return;
    try {
      const b = await api.get<AyahBundleView>(`/quran/ayah/${selectedSurah.id}/${number}?lang=${locale}`);
      setBundles((prev) => ({ ...prev, [number]: b }));
    } catch {
      // ignore — card still renders from the lightweight surah-list row
    }
  }

  function playFromAyah(index: number) {
    if (!selectedSurah) return;
    const q: QueueAyah[] = ayat.map((a) => ({
      surahId: selectedSurah.id,
      surahName: selectedSurah.name_transliteration,
      number: a.number,
      textAr: a.text_ar,
      translation: a.translation,
    }));
    loadSurahQueue(q, index);
  }

  async function runWordSearch() {
    if (wordQuery.trim().length < 2) {
      setWordResults([]);
      return;
    }
    const res = await api.get<{ results: { ayah?: typeof wordResults } }>(
      `/quran/search?q=${encodeURIComponent(wordQuery)}&type=ayah&lang=${locale}`
    );
    setWordResults(res.results.ayah ?? []);
  }

  const filteredSurahs = useMemo(
    () =>
      surahs.filter((s) =>
        `${s.id} ${s.name_transliteration} ${s.name_id}`.toLowerCase().includes(surahFilter.toLowerCase())
      ),
    [surahs, surahFilter]
  );

  return (
    <div className={`grid gap-4 ${compact ? "" : "desktop:grid-cols-[240px_1fr_260px]"}`}>
      {/* Surah list + search */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
        <input
          value={surahFilter}
          onChange={(e) => setSurahFilter(e.target.value)}
          placeholder={dict.nav.searchPlaceholder}
          className="mb-2 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm"
        />
        <div className="scrollbar-thin max-h-72 overflow-y-auto desktop:max-h-[420px]">
          {filteredSurahs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSurah(s)}
              className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 ${
                selectedSurah?.id === s.id ? "bg-accent/10 text-accent" : ""
              }`}
            >
              {s.id}. {s.name_transliteration}
            </button>
          ))}
        </div>
      </div>

      {/* Ayah reading pane */}
      <div className="min-w-0">
        {selectedSurah && (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
            <div>
              <p className="font-heading text-lg">{selectedSurah.name_transliteration}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{selectedSurah.ayah_count} {dict.reader.ayahLabel}</p>
            </div>
            <button
              onClick={() => playFromAyah(0)}
              className="rounded-full bg-primary px-4 py-2 text-sm text-white dark:bg-accent dark:text-primary"
            >
              ▶ {dict.reader.playAll}
            </button>
          </div>
        )}

        <div className={`space-y-3 ${compact ? "max-h-[520px] overflow-y-auto scrollbar-thin pr-1" : ""}`}>
          {loading && <p className="text-sm text-[var(--color-text-secondary)]">{dict.common.loading}</p>}
          {!loading &&
            ayat.map((a, idx) => {
              const bundle: AyahBundleView = bundles[a.number] ?? {
                ayah: { id: a.id, surah_id: selectedSurah!.id, number: a.number, text_ar: a.text_ar },
                translation: a.translation ? { text: a.translation } : null,
                tafsir: [],
                asbabun_nuzul: [],
              };
              const isCurrent =
                queue[currentIndex]?.surahId === selectedSurah?.id && queue[currentIndex]?.number === a.number;
              return (
                <div key={a.id} onClick={() => { playFromAyah(idx); loadBundleFor(a.number); }} className="cursor-pointer">
                  <AyahCard
                    bundle={bundle}
                    surahName={selectedSurah!.name_transliteration}
                    dict={dict}
                    showHadits={showHadits}
                    isActive={isCurrent && isPlaying}
                  />
                </div>
              );
            })}
        </div>
      </div>

      {/* Mode switcher + word search */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
          <p className="mb-2 text-sm font-medium">{dict.reader.modeSectionTitle}</p>
          <div className="space-y-1.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`block w-full rounded-lg border px-3 py-2 text-left text-xs ${
                  mode === m.key ? "border-accent bg-accent/10" : "border-[var(--color-border)]"
                }`}
              >
                <span className="font-medium">{dict.reader[m.labelKey]}</span>
                <span className="mt-0.5 block text-[var(--color-text-secondary)]">{dict.reader[m.descKey]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
          <p className="mb-2 text-sm font-medium">{dict.nav.searchPlaceholder}</p>
          <div className="flex gap-1">
            <input
              value={wordQuery}
              onChange={(e) => setWordQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runWordSearch()}
              className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
            />
            <button onClick={runWordSearch} className="rounded-lg bg-primary px-3 text-xs text-white dark:bg-accent dark:text-primary">
              🔍
            </button>
          </div>
          {wordResults.length > 0 && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto scrollbar-thin text-xs">
              {wordResults.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      const s = surahs.find((x) => x.id === r.surah_id);
                      if (s) setSelectedSurah(s);
                      setWordResults([]);
                      setWordQuery("");
                    }}
                    className="block w-full rounded px-2 py-1.5 text-left hover:bg-black/5"
                  >
                    <span className="font-medium text-accent">{r.surah_name} : {r.number}</span>
                    <span className="block truncate text-[var(--color-text-secondary)]">{r.translation}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
