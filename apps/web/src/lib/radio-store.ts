"use client";

/**
 * Global state for "Radio Qori Dunia" — deliberately NOT owned by any one
 * page's component. It must keep playing across in-app navigation until the
 * visitor explicitly stops it (see GlobalRadioPlayer, mounted once in the
 * locale layout, which owns the actual <audio> element and reacts to this
 * store rather than the other way around). Only the *decision-making* state
 * (what should be playing, whether the visitor wants it playing) lives here;
 * the actual playback side-effects live in GlobalRadioPlayer.
 */
import { create } from "zustand";
import { api } from "./api";
import { usePlayerStore } from "./player-store";
import { RECITERS, DEFAULT_QORI_KEY } from "./qori-cdn";
import { computeLivePosition, computeLiveBroadcast } from "./radio-clock";

export interface SurahMeta {
  id: number;
  name_transliteration: string;
  name_ar: string;
  ayah_count: number;
}

export interface RadioPosition {
  reciterKey: string;
  surahId: number;
  ayahNumber: number;
}

// The default "auto" station rotates through the world-renowned reciters —
// one full khatam per voice — rather than reciting forever in a single
// voice. Explicitly picking a reciter pins that channel instead and stops
// the rotation (see switchReciter).
const ROTATION_POOL = RECITERS.filter((r) => r.featured).map((r) => r.key);

const RECITER_STORAGE_KEY = "ulyah_radio_reciter";

/** null means "no pinned favorite yet" — the default rotating station. */
function loadReciterKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(RECITER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveReciterKey(key: string) {
  try {
    window.localStorage.setItem(RECITER_STORAGE_KEY, key);
  } catch {
    /* quota exceeded — fine, just won't remember the preference */
  }
}

export function nextRadioPosition(p: RadioPosition, surahs: SurahMeta[]): RadioPosition {
  const rc = RECITERS.find((r) => r.key === p.reciterKey) ?? RECITERS.find((r) => r.key === DEFAULT_QORI_KEY)!;
  if (rc.cdn === "surah") {
    const nextSurah = p.surahId >= 114 ? 1 : p.surahId + 1;
    return { ...p, surahId: nextSurah, ayahNumber: 1 };
  }
  const count = surahs.find((s) => s.id === p.surahId)?.ayah_count ?? 999;
  if (p.ayahNumber < count) return { ...p, ayahNumber: p.ayahNumber + 1 };
  const nextSurah = p.surahId >= 114 ? 1 : p.surahId + 1;
  return { ...p, surahId: nextSurah, ayahNumber: 1 };
}

interface RadioState {
  surahs: SurahMeta[];
  position: RadioPosition;
  playing: boolean; // the visitor's intent — survives page navigation
  needsInteraction: boolean;
  muted: boolean;
  khatamCount: number;
  autoRotate: boolean;
  gen: number; // bumped on start/stop/switchReciter to invalidate in-flight loads

  setSurahs: (s: SurahMeta[]) => void;
  setKhatamCount: (n: number) => void;
  setPlaybackState: (p: Partial<Pick<RadioState, "playing" | "needsInteraction" | "muted">>) => void;
  start: () => void;
  stop: () => void;
  switchReciter: (key: string) => void;
  advance: () => void;
  unmuteIntent: () => void;
}

export const useRadioStore = create<RadioState>((set, get) => ({
  surahs: [],
  position: { reciterKey: loadReciterKey() ?? DEFAULT_QORI_KEY, surahId: 1, ayahNumber: 1 },
  playing: false,
  needsInteraction: true,
  muted: false,
  khatamCount: 0,
  autoRotate: loadReciterKey() === null,
  gen: 0,

  setSurahs: (surahs) => set({ surahs }),
  setKhatamCount: (khatamCount) => set({ khatamCount }),
  setPlaybackState: (p) => set(p),

  /** Every "start" (first tap, or pressing play again after stop) rejoins
   * the live broadcast position rather than resuming wherever this device
   * last left off — see radio-clock.ts. */
  start: () => {
    const { surahs } = get();
    const pinned = loadReciterKey();
    let position: RadioPosition;
    let autoRotate: boolean;
    if (pinned) {
      autoRotate = false;
      position = { reciterKey: pinned, ...computeLivePosition(surahs) };
    } else {
      autoRotate = true;
      const b = computeLiveBroadcast(surahs, ROTATION_POOL);
      position = { reciterKey: b.reciterKey, surahId: b.surahId, ayahNumber: b.ayahNumber };
    }
    set((s) => ({ position, autoRotate, playing: true, gen: s.gen + 1 }));
  },

  /** Only stops audio for this visitor — the shared broadcast clock keeps
   * advancing regardless, so a later start() rejoins live, not here. Never
   * triggered automatically except when the visitor plays other audio (see
   * the usePlayerStore subscription below) — an auto-stop always requires a
   * manual start() again, never an auto-resume. */
  stop: () => set((s) => ({ playing: false, gen: s.gen + 1 })),

  switchReciter: (key) => {
    const { surahs, playing, needsInteraction } = get();
    saveReciterKey(key);
    const position: RadioPosition = { reciterKey: key, ...computeLivePosition(surahs) };
    const shouldPlayNow = playing || !needsInteraction;
    set((s) => ({
      position,
      autoRotate: false,
      playing: shouldPlayNow ? true : s.playing,
      gen: shouldPlayNow ? s.gen + 1 : s.gen,
    }));
  },

  /** Natural forward progression on the audio's 'ended' event — does NOT
   * bump gen, since this continues the current playback rather than
   * superseding it. */
  advance: () => {
    const { position, surahs, autoRotate } = get();
    let next = nextRadioPosition(position, surahs);
    const completedKhatam = position.surahId >= 114 && next.surahId === 1 && next.ayahNumber === 1;
    if (completedKhatam && autoRotate && ROTATION_POOL.length > 0) {
      const idx = Math.max(0, ROTATION_POOL.indexOf(position.reciterKey));
      const nextReciter = ROTATION_POOL[(idx + 1) % ROTATION_POOL.length]!;
      next = { ...next, reciterKey: nextReciter };
    }
    set({ position: next });
  },

  unmuteIntent: () => set({ muted: false }),
}));

let surahsRequested = false;
/** Fetch the surah index once, app-wide — called from GlobalRadioPlayer's
 * mount effect, safe to call redundantly from anywhere else too. */
export function ensureSurahsLoaded() {
  if (surahsRequested) return;
  surahsRequested = true;
  api
    .get<{ surah: SurahMeta[] }>("/quran/surah")
    .then((r) => useRadioStore.getState().setSurahs(r.surah))
    .catch(() => {
      surahsRequested = false;
    });
}

// Mutual exclusion: the instant the *other* player (ayah/hadits/kisah/kitab
// queue, driven by player-store.ts) starts playing, the radio must stop —
// "klo client klik menjalankan suara lain maka radio otomatis mati, wajib
// dihidupkan manual" — so this only ever calls stop(), never start().
usePlayerStore.subscribe((state, prevState) => {
  if (state.isPlaying && !prevState.isPlaying && useRadioStore.getState().playing) {
    useRadioStore.getState().stop();
  }
});
