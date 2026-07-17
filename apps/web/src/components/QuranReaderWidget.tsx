"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { usePlayerStore, type Layer, type QueueItem } from "@/lib/player-store";
import { RECITERS, COUNTRIES } from "@/lib/qori-cdn";
import { radioLabels } from "@/lib/radio-labels";
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

// The three plainly-labelled listening modes the reader offers, replacing the
// old grid of five "understanding presets" + separate auto-play buttons that
// visitors found confusing ("terlalu banyak tombol play"). Each one both sets
// the narration layers AND starts playback in a single tap:
//   • Baca Semua      → real qori murottal, then the translation is spoken
//   • Baca Arab Saja  → only the imam's recitation
//   • Baca Arti Saja  → only the spoken translation
// "Baca Semua" recites the Arabic then narrates the meaning AND the tafsir /
// asbabun / hadith explanation; "Baca Arti Saja" narrates that same
// understanding (terjemah + tafsir + penjelasan) WITHOUT the Arabic audio;
// "Baca Arab Saja" is the pure murottal. This matches the request that tafsir
// & penjelasan be read under both "arti saja" and "baca semua".
const VOICE_MODES: {
  key: string;
  layers: Layer[];
  label: (d: Dictionary) => string;
  hint: (d: Dictionary) => string;
  icon: string;
}[] = [
  { key: "all", layers: ["ayah", "translation", "tafsir", "asbabun", "hadits"], label: (d) => d.reader.voiceAll, hint: (d) => d.reader.voiceAllHint, icon: "🔊" },
  { key: "arabic", layers: ["ayah"], label: (d) => d.reader.voiceArabic, hint: (d) => d.reader.voiceArabicHint, icon: "🕋" },
  { key: "translation", layers: ["translation", "tafsir", "asbabun", "hadits"], label: (d) => d.reader.voiceTranslation, hint: (d) => d.reader.voiceTranslationHint, icon: "🌍" },
];

const LAYER_ICON: Record<Layer, string> = {
  ayah: "۝",
  translation: "🌍",
  tafsir: "📖",
  asbabun: "📜",
  hadits: "🕌",
  kisah: "✨",
};

function sameLayers(a: Layer[], b: Layer[]): boolean {
  return a.length === b.length && b.every((l) => a.includes(l));
}

// Last-read position, persisted per device ("bacaan terakhir masih di situ",
// not a reset to Al-Baqarah 1 on every visit). Deep links still win over it.
const LAST_READ_KEY = "ulyah_quran_last_read";

function loadLastRead(): { surah: number; ayah: number } | null {
  try {
    const raw = window.localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { surah?: number; ayah?: number };
    if (typeof p.surah === "number" && p.surah >= 1 && p.surah <= 114 && typeof p.ayah === "number" && p.ayah >= 1) {
      return { surah: p.surah, ayah: p.ayah };
    }
  } catch {
    /* corrupt/blocked storage — fall back to the default */
  }
  return null;
}

/** Honest per-layer "nothing for this ayah" copy. Translation + tafsir cover
 * every ayah, so an empty one there is a transient fetch hiccup, framed as a
 * loading failure (not "still being prepared" — the content itself already
 * exists in full). Asbabun nuzul and a mapped hadith genuinely don't exist
 * for most ayat — say so plainly rather than implying content is coming. */
function emptyStates(locale: string): { translation: string; tafsir: string; asbabun: string; hadits: string } {
  const ID = {
    translation: "Gagal memuat terjemahan — coba muat ulang halaman ini.",
    tafsir: "Gagal memuat tafsir — coba muat ulang halaman ini.",
    asbabun: "Tidak ada sebab nuzul khusus yang diriwayatkan untuk ayat ini.",
    hadits: "Belum ada hadits khusus yang dikaitkan dengan ayat ini.",
  };
  const EN = {
    translation: "Failed to load the translation — please reload this page.",
    tafsir: "Failed to load the tafsir — please reload this page.",
    asbabun: "No specific occasion of revelation is narrated for this ayah.",
    hadits: "No specific hadith is linked to this ayah yet.",
  };
  const AR = {
    translation: "تعذّر تحميل الترجمة — يرجى إعادة تحميل الصفحة.",
    tafsir: "تعذّر تحميل التفسير — يرجى إعادة تحميل الصفحة.",
    asbabun: "لم يُروَ سبب نزول خاص لهذه الآية.",
    hadits: "لا يوجد حديث خاص مرتبط بهذه الآية بعد.",
  };
  const FR = {
    translation: "Échec du chargement de la traduction — veuillez recharger cette page.",
    tafsir: "Échec du chargement du tafsir — veuillez recharger cette page.",
    asbabun: "Aucune circonstance de révélation particulière n'est rapportée pour ce verset.",
    hadits: "Aucun hadith particulier n'est encore associé à ce verset.",
  };
  const DE = {
    translation: "Übersetzung konnte nicht geladen werden — bitte laden Sie diese Seite neu.",
    tafsir: "Tafsir konnte nicht geladen werden — bitte laden Sie diese Seite neu.",
    asbabun: "Für diesen Vers ist kein besonderer Offenbarungsanlass überliefert.",
    hadits: "Diesem Vers ist noch kein besonderer Hadith zugeordnet.",
  };
  const MAP: Record<string, typeof EN> = { id: ID, en: EN, ar: AR, fr: FR, de: DE };
  return MAP[locale] ?? EN;
}

/** Word-by-word Arabic highlight synced to the qori's actual audio progress
 * (current/duration ratio, so it self-corrects — no fixed-timer drift). Only
 * active while this ayah's recitation is the thing currently playing. */
function HighlightedArabic({ text, active }: { text: string; active: boolean }) {
  const progress = usePlayerStore((s) => s.audioProgress);
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  if (!active || !progress.duration) return <>{text}</>;

  const ratio = Math.min(progress.current / progress.duration, 1);
  const targetIdx = Math.min(Math.floor(ratio * words.length), words.length - 1);

  return (
    <>
      {words.map((w, i) => (
        <span
          key={i}
          className={
            i === targetIdx
              ? "rounded bg-accent/30 px-0.5 text-accent"
              : i < targetIdx
                ? "text-[var(--color-text-secondary)]"
                : ""
          }
        >
          {w}{" "}
        </span>
      ))}
    </>
  );
}

export function QuranReaderWidget({ locale, dict }: { locale: string; dict: Dictionary }) {
  const t = radioLabels(locale);
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [surahFilter, setSurahFilter] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [ayat, setAyat] = useState<AyatRow[]>([]);
  const [focus, setFocus] = useState(1); // focused ayah number (1-based)
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loadingAyat, setLoadingAyat] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qoriCC, setQoriCC] = useState("all"); // country filter for the reciter picker below
  const [showExplanation, setShowExplanation] = useState(true); // "Tafsir & Penjelasan" panel open by default

  // Tafsir source picker: which classical tafsir edition to show. `""` = the
  // reader's default (whatever /quran/ayah picked). Any other value is a slug
  // from /quran/tafsir-editions, fetched on demand and layered over the
  // bundle's default tafsir text.
  const [tafsirEditions, setTafsirEditions] = useState<{ slug: string; name: string; author: string }[]>([]);
  const [tafsirEdition, setTafsirEdition] = useState("");
  const [editionTafsir, setEditionTafsir] = useState<{ text: string; source: string } | null>(null);
  const [editionTafsirLoading, setEditionTafsirLoading] = useState(false);
  const arabicRef = useRef<HTMLDivElement>(null);
  const explRefs = useRef<Map<Layer, HTMLDivElement | null>>(new Map());
  // The ayah to land on once the (deep-linked or restored) surah's ayat
  // arrive. The surah-change effect always resets focus to 1, so a plain
  // setFocus() from the mount effect was silently overwritten one render
  // later — this ref survives that reset and is consumed exactly once.
  const pendingAyahRef = useRef<number | null>(null);
  // Don't persist the position until the initial restore has happened,
  // otherwise the default (Al-Baqarah:1) overwrites the saved spot on mount.
  const restoredRef = useRef(false);

  const { layers, setLayers, loadSurahQueue, queue, currentIndex, isPlaying, activeLayer, qoriId, setQori } =
    usePlayerStore();

  /** Choosing a country narrows the reciter list; if the currently selected
   * reciter falls outside it, jump to the first one in that country instead
   * of silently keeping a selection that's no longer shown. */
  function handleCountryChange(cc: string) {
    setQoriCC(cc);
    // Per-ayah picker only: exclude surah-mode reciters (e.g. Muammar ZA has
    // no per-ayah audio) — they belong to Radio Qur'an, not this reader.
    const pool = RECITERS.filter((r) => r.cdn !== "surah" && (cc === "all" || r.cc === cc));
    if (pool.length > 0 && !pool.some((r) => r.key === qoriId)) setQori(pool[0]!.key);
  }

  // Load surah index once. Priority for the opening position:
  //   1. a deep link like ?surah=2&ayah=5 (AI chat's clickable references),
  //   2. the visitor's own last-read position (localStorage) — coming back
  //      to the reader continues where they left off, never a reset to
  //      Al-Baqarah 1,
  //   3. Al-Baqarah as the first-visit default.
  useEffect(() => {
    let deepSurah: number | null = null;
    let deepAyah: number | null = null;
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = Number(sp.get("surah"));
      const a = Number(sp.get("ayah"));
      if (s >= 1 && s <= 114) deepSurah = s;
      if (a >= 1) deepAyah = a;
    }
    const last = typeof window !== "undefined" && !deepSurah ? loadLastRead() : null;
    api
      .get<{ surah: SurahMeta[] }>("/quran/surah")
      .then((r) => {
        // The API must return a surah array, but a malformed/empty 200 (e.g.
        // `{}` from an edge hiccup) would make every `r.surah.find(...)` below
        // throw. Crucially the setSelectedSurah updater runs during React's
        // render phase — OUTSIDE this promise's .catch — so an undefined
        // `r.surah` there escapes uncaught and takes the whole page down
        // ("client-side exception" on the live sites). Coerce to an array once.
        const list = Array.isArray(r?.surah) ? r.surah : [];
        setSurahs(list);
        const target = deepSurah
          ? list.find((s) => s.id === deepSurah)
          : last
            ? list.find((s) => s.id === last.surah)
            : undefined;
        pendingAyahRef.current = deepSurah ? deepAyah : (last?.ayah ?? null);
        restoredRef.current = true;
        setSelectedSurah((prev) => prev ?? target ?? list.find((s) => s.id === 2) ?? list[0] ?? null);
      })
      .catch(() => {});
  }, []);

  // Remember where the visitor is, so the next visit reopens right here.
  useEffect(() => {
    if (!restoredRef.current || !selectedSurah || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LAST_READ_KEY, JSON.stringify({ surah: selectedSurah.id, ayah: focus }));
    } catch {
      /* storage full/blocked — persistence is best-effort */
    }
  }, [selectedSurah, focus]);

  // Load the selected surah's ayat. Clear the previous surah's ayat FIRST so
  // a slow or failed fetch can never leave the reader showing the wrong
  // surah's text (the "click Al-Ikhlas, see Alif Lām Mīm" bug). A cancelled
  // flag guards against an out-of-order response overwriting a newer one.
  useEffect(() => {
    if (!selectedSurah) return;
    let cancelled = false;
    const wantId = selectedSurah.id;
    setAyat([]);
    setLoadingAyat(true);
    setLoadError(false);
    // Land on the pending ayah (deep link / restored last-read) when there is
    // one; a plain surah switch starts at ayah 1 as before. Clamped to the
    // surah's real length so a stale saved ayah can never point past the end.
    const landing = Math.min(pendingAyahRef.current ?? 1, selectedSurah.ayah_count);
    pendingAyahRef.current = null;
    setFocus(Math.max(1, landing));
    api
      .get<{ ayat: AyatRow[]; surah: { id: number } }>(`/quran/surah/${wantId}?lang=${locale}`)
      .then((r) => {
        // Ignore a response for a surah the user already navigated away from.
        if (cancelled || r.surah?.id !== wantId) return;
        setAyat(r.ayat);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingAyat(false);
      });
    return () => {
      cancelled = true;
    };
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

  // The available tafsir sources for this UI language (loaded once).
  useEffect(() => {
    api
      .get<{ editions: { slug: string; name: string; author: string }[] }>(`/quran/tafsir-editions?lang=${locale}`)
      .then((r) => setTafsirEditions(r.editions))
      .catch(() => {});
  }, [locale]);

  // When a non-default tafsir edition is chosen, fetch just that edition's
  // text for the focused ayah. Cleared back to the bundle default when the
  // picker returns to "" or the ayah changes.
  useEffect(() => {
    if (!selectedSurah || !tafsirEdition) {
      setEditionTafsir(null);
      return;
    }
    let cancelled = false;
    setEditionTafsirLoading(true);
    setEditionTafsir(null);
    api
      .get<{ tafsir: { text: string; source: string } | null }>(
        `/quran/tafsir/${tafsirEdition}/${selectedSurah.id}/${focus}?lang=${locale}`
      )
      .then((r) => {
        if (!cancelled) setEditionTafsir(r.tafsir);
      })
      .catch(() => {
        if (!cancelled) setEditionTafsir(null);
      })
      .finally(() => {
        if (!cancelled) setEditionTafsirLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSurah, focus, tafsirEdition, locale]);

  // Keep the explanation card that is currently being narrated in view and
  // marked, so a long tafsir/penjelasan auto-scrolls to follow the voice
  // ("penjelasan kasih penanda text yg sedang di baca, auto scroll klo panjang").
  useEffect(() => {
    if (!isPlaying || !activeLayer) return;
    const el = explRefs.current.get(activeLayer);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeLayer, isPlaying]);

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
      kisah: null,
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

  /** One of the three listening modes: pick the narration layers, then play. */
  function playVoiceMode(layerSet: Layer[]) {
    setLayers(layerSet);
    buildQueue(focus);
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

  const e = emptyStates(locale);
  const bundleLoading = bundle === null;
  // Deeper study material for the collapsible "Tafsir & Penjelasan" panel.
  // Translation is intentionally NOT here — it's already shown large with the
  // Arabic verse — so the panel stays focused on tafsir, asbabun & hadits.
  const explanation: { layer: Layer; icon: string; label: string; text: string | null; empty: string }[] = [
    { layer: "tafsir", icon: LAYER_ICON.tafsir, label: dict.reader.tafsirLabel, text: (tafsirEdition ? editionTafsir?.text : bundle?.tafsir[0]?.text) ?? null, empty: e.tafsir },
    { layer: "asbabun", icon: LAYER_ICON.asbabun, label: dict.reader.asbabunNuzulLabel, text: bundle?.asbabun_nuzul[0]?.text ?? null, empty: e.asbabun },
    { layer: "hadits", icon: LAYER_ICON.hadits, label: dict.reader.haditsLabel, text: bundle?.hadits[0] ? `“${bundle.hadits[0].text_id}” — ${bundle.hadits[0].narrator ?? ""} (${bundle.hadits[0].source})` : null, empty: e.hadits },
  ];

  return (
    <div className="grid gap-4 desktop:grid-cols-[236px_1fr]">
      {/* ── Surah list ─────────────────────────────────────────── */}
      <aside className="card-premium-static p-3">
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
        <div className="scrollbar-thin max-h-72 overflow-y-auto pr-1 desktop:max-h-[620px]">
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

      {/* ── Ayah focus + player + explanation ──────────────────── */}
      <div className="card-premium-static min-w-0 p-4 sm:p-6">
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
                  <p className="font-heading text-lg leading-tight">{selectedSurah.name_transliteration}</p>
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
              title={dict.reader.voiceAll}
              className={`mt-6 cursor-pointer rounded-2xl px-2 py-6 text-center transition hover:bg-accent/5 ${isThisAyahActive && activeLayer === "ayah" ? "ayah-active-highlight" : ""}`}
            >
              {loadingAyat ? (
                <p className="py-8 text-sm text-[var(--color-text-secondary)]">{dict.common.loading}</p>
              ) : loadError || !focusRow ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSurah((s) => (s ? { ...s } : s)); // re-trigger the fetch effect
                  }}
                  className="py-8 text-sm text-accent hover:underline"
                >
                  ⟳ {dict.common.loading}
                </button>
              ) : (
                <>
                  <p dir="rtl" className="font-arabic text-3xl leading-[2.4] text-[var(--color-text-primary)] sm:text-4xl">
                    <HighlightedArabic
                      text={focusRow?.text_ar ?? ""}
                      active={isThisAyahActive && activeLayer === "ayah"}
                    />{" "}
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

            {/* Reciter (Imam) picker — country + reciter, with the imam's note
                so the roster reads as complete (Imam Masjidil Haram, dst). */}
            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-4 py-3 dark:bg-white/[0.02]">
              <p className="mb-2 text-sm font-medium">🎙️ {t.chooseReciter}</p>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label={t.chooseCountry}
                  value={qoriCC}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t.chooseReciter}
                  value={qoriId}
                  onChange={(e) => setQori(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
                >
                  {RECITERS.filter((r) => r.cdn !== "surah" && (qoriCC === "all" || r.cc === qoriCC)).map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.flag} {r.name} — {r.note}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Three clear listening modes ──────────────────────
                Baca Semua / Baca Arab Saja / Baca Arti Saja. One tap sets the
                narration layers and starts playing — no separate "auto play"
                button, no five-way preset grid. */}
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">{dict.reader.voiceModeTitle}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {VOICE_MODES.map((m) => {
                  const active = sameLayers(layers, m.layers) && isThisAyahActive;
                  return (
                    <button
                      key={m.key}
                      onClick={() => playVoiceMode(m.layers)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-accent bg-accent/10 shadow-sm"
                          : "border-[var(--color-border)] hover:border-accent/50"
                      }`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{m.label(dict)}</span>
                        <span className="block text-[11px] leading-tight text-[var(--color-text-secondary)]">
                          {m.hint(dict)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimal transport — play/pause the focused ayah + step ayat. */}
            <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-4 py-3 dark:bg-white/[0.02]">
              <button
                onClick={() => focusAndPlay(Math.max(1, focus - 1))}
                disabled={focus <= 1}
                aria-label="previous ayah"
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] text-sm disabled:opacity-30"
              >
                ⏮
              </button>
              <button
                onClick={() => (isThisAyahActive ? usePlayerStore.getState().pause() : buildQueue(focus))}
                aria-label={isThisAyahActive ? "pause" : "play"}
                className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-white shadow-md transition hover:scale-105 dark:bg-accent dark:text-primary"
              >
                {isThisAyahActive ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => focusAndPlay(Math.min(selectedSurah.ayah_count, focus + 1))}
                disabled={focus >= selectedSurah.ayah_count}
                aria-label="next ayah"
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] text-sm disabled:opacity-30"
              >
                ⏭
              </button>
            </div>

            {/* ── Tafsir & Penjelasan (collapsible) ──────────────────
                Replaces the old "Ringkasan Ayat Ini" side panel (which carried
                a redundant play button and could error). Pure reading — tafsir
                with an edition picker, asbabun nuzul, supporting hadith, and a
                link to any related story. No playback controls here. */}
            <div className="mt-5 rounded-xl border border-[var(--color-border)]">
              <button
                onClick={() => setShowExplanation((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-primary dark:text-accent">
                  <span>📖</span>
                  {dict.reader.explanationTitle}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {showExplanation ? `▲ ${dict.reader.hideExplanation}` : `▼ ${dict.reader.showExplanation}`}
                </span>
              </button>

              {showExplanation && (
                <div className="space-y-3 border-t border-[var(--color-border)] p-4">
                  {explanation.map((s) => {
                    const isTafsir = s.layer === "tafsir";
                    const tafsirLoading = isTafsir && tafsirEdition ? editionTafsirLoading : bundleLoading;
                    const sourceName = isTafsir
                      ? tafsirEdition
                        ? editionTafsir?.source
                        : bundle?.tafsir[0]?.source
                      : undefined;
                    const reading = activeLayer === s.layer && isPlaying;
                    return (
                      <div
                        key={s.layer}
                        ref={(el) => {
                          explRefs.current.set(s.layer, el);
                        }}
                        className={`rounded-xl border p-3 transition ${reading ? "border-accent bg-accent/10 shadow-sm" : "border-[var(--color-border)]"}`}
                      >
                        <p className="flex items-center gap-1.5 text-xs font-medium text-primary dark:text-accent">
                          <span>{s.icon}</span>
                          {s.label}
                          {reading && <span className="ml-auto text-[10px] font-normal text-accent">🔊 sedang dibaca…</span>}
                        </p>
                        {/* Tafsir source picker — Ibn Kathir, Jalalayn, As-Sa'di,
                            Al-Mukhtasar, Kemenag … (spa5k/tafsir_api). */}
                        {isTafsir && tafsirEditions.length > 1 && (
                          <select
                            aria-label={dict.reader.tafsirLabel}
                            value={tafsirEdition}
                            onChange={(ev) => setTafsirEdition(ev.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                          >
                            <option value="">★ {dict.reader.tafsirLabel} — {tafsirEditions[0]?.name}</option>
                            {tafsirEditions.map((ed) => (
                              <option key={ed.slug} value={ed.slug}>
                                {ed.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                          {s.text ?? (tafsirLoading ? `${dict.common.loading}…` : s.empty)}
                        </p>
                        {isTafsir && sourceName && s.text && (
                          <p className="mt-1 text-[10px] italic text-[var(--color-text-secondary)]/70">— {sourceName}</p>
                        )}
                      </div>
                    );
                  })}
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
              )}
            </div>
          </>
        )}
      </div>
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
