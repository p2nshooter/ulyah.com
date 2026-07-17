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

// The station always rotates through the world-renowned reciters in a fixed
// sequence — one full khatam per voice — never a listener-chosen channel:
// "imam nya jgn bisa d klik, biarkan saja berjalan berurutan" (the imam must
// not be clickable, just let it run in sequence). The widget only ever shows
// who is in the rotation and who is reading right now, never a picker.
// HiFi only: the always-on station must sound clean. everyayah publishes some
// reciters at 32–64 kbps, and those low-bitrate MP3s came through muffled and
// warbly on the broadcast ("dalem banget, kaya kaset kusut" — owner report).
// alquran.cloud (cdn === "aqc") streams 128 kbps, and the everyayah entries we
// keep in rotation are the 128 kbps folders; anything lower stays selectable
// elsewhere but never drives the radio.
const ROTATION_POOL = RECITERS.filter(
  (r) => r.featured && (r.cdn === "aqc" || (r.cdn === "ey" && (r.eyId ?? "").includes("128kbps")))
).map((r) => r.key);

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

// The visitor's explicit OFF is remembered across full page reloads (not just
// in-app navigation) — "klo sudah di off jgn hidup sampai di on". Once they
// stop the radio it must stay silent on every subsequent page/visit until they
// press play again, so the auto-start never overrides a deliberate off.
const OFF_STORAGE_KEY = "ulyah_radio_off";
function loadUserDisabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(OFF_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function saveUserDisabled(off: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (off) window.localStorage.setItem(OFF_STORAGE_KEY, "1");
    else window.localStorage.removeItem(OFF_STORAGE_KEY);
  } catch {
    /* private mode / storage disabled — in-memory intent still holds */
  }
}

interface RadioState {
  surahs: SurahMeta[];
  position: RadioPosition;
  playing: boolean; // the visitor's intent — survives page navigation
  userDisabled: boolean; // explicit OFF, persisted across reloads
  needsInteraction: boolean;
  muted: boolean;
  khatamCount: number;
  gen: number; // bumped on start/stop to invalidate in-flight loads

  setSurahs: (s: SurahMeta[]) => void;
  setKhatamCount: (n: number) => void;
  setPlaybackState: (p: Partial<Pick<RadioState, "playing" | "needsInteraction" | "muted">>) => void;
  start: () => void;
  stop: () => void;
  advance: () => void;
  unmuteIntent: () => void;
}

export const useRadioStore = create<RadioState>((set, get) => ({
  surahs: [],
  position: { reciterKey: DEFAULT_QORI_KEY, surahId: 1, ayahNumber: 1 },
  playing: false,
  userDisabled: loadUserDisabled(),
  needsInteraction: true,
  muted: false,
  khatamCount: 0,
  gen: 0,

  // Coerce to an array no matter what the caller passes — a malformed/empty
  // API response must never put `undefined` into the store, or every consumer
  // that does `surahs.find(...)` crashes the whole page (owner: client-side
  // exception on the live sites).
  setSurahs: (surahs) => set({ surahs: Array.isArray(surahs) ? surahs : [] }),
  setKhatamCount: (khatamCount) => set({ khatamCount }),
  setPlaybackState: (p) => set(p),

  /** Every "start" (first tap, or pressing play again after stop) rejoins
   * the live broadcast position rather than resuming wherever this device
   * last left off — see radio-clock.ts. */
  start: () => {
    const { surahs } = get();
    const b = computeLiveBroadcast(surahs, ROTATION_POOL);
    const position: RadioPosition = { reciterKey: b.reciterKey, surahId: b.surahId, ayahNumber: b.ayahNumber };
    saveUserDisabled(false);
    set((s) => ({ position, playing: true, userDisabled: false, gen: s.gen + 1 }));
  },

  /** Only stops audio for this visitor — the shared broadcast clock keeps
   * advancing regardless, so a later start() rejoins live, not here. Never
   * triggered automatically except when the visitor plays other audio (see
   * the usePlayerStore subscription below) — an auto-stop always requires a
   * manual start() again, never an auto-resume. */
  stop: () => {
    saveUserDisabled(true);
    set((s) => ({ playing: false, userDisabled: true, gen: s.gen + 1 }));
  },

  /** Natural forward progression on the audio's 'ended' event — does NOT
   * bump gen, since this continues the current playback rather than
   * superseding it. */
  advance: () => {
    const { position, surahs } = get();
    let next = nextRadioPosition(position, surahs);
    const completedKhatam = position.surahId >= 114 && next.surahId === 1 && next.ayahNumber === 1;
    if (completedKhatam && ROTATION_POOL.length > 0) {
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
    .then((r) => useRadioStore.getState().setSurahs(Array.isArray(r?.surah) ? r.surah : []))
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
