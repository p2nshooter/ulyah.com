"use client";

import { create } from "zustand";
import { audioUrl, storyAudioUrl } from "./api";

/**
 * Layered playback: for every ayah the listener chooses which layers to hear.
 * The Arabic recitation ("ayah") is ALWAYS real qori audio from R2 — never
 * TTS. Every other layer (translation, tafsir, asbabun nuzul, hadits) is
 * narrated by the browser voice engine in the UI language. The player walks
 * the enabled layers in this canonical order for each ayah, then advances.
 */
export const LAYERS = ["ayah", "translation", "tafsir", "asbabun", "hadits"] as const;
export type Layer = (typeof LAYERS)[number];

// "Mode Pemahaman" presets from the reference design. Each maps to a set of
// layers; the listener can still fine-tune with individual layer chips.
export const MODE_PRESETS: Record<string, Layer[]> = {
  full: ["ayah", "translation", "tafsir", "asbabun", "hadits"],
  ayah: ["ayah"],
  translation: ["translation"],
  tafsir: ["tafsir"],
  hikmah: ["hadits", "asbabun"],
};
export type PresetKey = keyof typeof MODE_PRESETS;

export interface QueueItem {
  surahId: number;
  surahName: string;
  number: number;
  textAr: string;
  translation: string | null;
  // Filled lazily from /quran/ayah/:surah/:number the first time a text layer
  // for this ayah is about to be narrated.
  tafsir: string | null;
  asbabun: string | null;
  hadits: string | null;
  bundleLoaded: boolean;
}

interface PlayerState {
  queue: QueueItem[];
  currentIndex: number;
  qoriId: number;
  layers: Layer[];
  activeLayer: Layer | null;
  isPlaying: boolean;
  playbackRate: number;
  repeatMode: "off" | "ayah" | "surah";
  sleepAt: number | null;
  storyTrack: { id: number; title: string } | null;
  audioUnavailableNotice: string | null;

  loadSurahQueue: (ayat: QueueItem[], startIndex?: number) => void;
  patchBundle: (index: number, partial: Partial<QueueItem>) => void;
  playStory: (id: number, title: string) => void;
  setLayers: (l: Layer[]) => void;
  toggleLayer: (l: Layer) => void;
  applyPreset: (p: PresetKey) => void;
  setActiveLayer: (l: Layer | null) => void;
  setQori: (id: number) => void;
  setPlaybackRate: (r: number) => void;
  setRepeatMode: (m: "off" | "ayah" | "surah") => void;
  setSleepMinutes: (m: number | null) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seekToIndex: (i: number) => void;
  clearNotice: () => void;

  ayahAudioSrc: () => string | null;
  storyAudioSrc: () => string | null;
}

const QORI_STORAGE_KEY = "ulyah_qori_id";
const LAYERS_STORAGE_KEY = "ulyah_layers";

function loadStoredQori(): number {
  if (typeof window === "undefined") return 1;
  const stored = window.localStorage.getItem(QORI_STORAGE_KEY);
  return stored ? Number(stored) : 1;
}

function loadStoredLayers(): Layer[] {
  if (typeof window === "undefined") return MODE_PRESETS.full;
  try {
    const stored = window.localStorage.getItem(LAYERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Layer[];
      const clean = LAYERS.filter((l) => parsed.includes(l));
      if (clean.length) return clean;
    }
  } catch {
    /* ignore */
  }
  return MODE_PRESETS.full;
}

function persistLayers(layers: Layer[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(LAYERS_STORAGE_KEY, JSON.stringify(layers));
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  qoriId: loadStoredQori(),
  layers: loadStoredLayers(),
  activeLayer: null,
  isPlaying: false,
  playbackRate: 1,
  repeatMode: "off",
  sleepAt: null,
  storyTrack: null,
  audioUnavailableNotice: null,

  loadSurahQueue: (ayat, startIndex = 0) => {
    set({
      queue: ayat,
      currentIndex: startIndex,
      storyTrack: null,
      isPlaying: true,
      activeLayer: null,
      audioUnavailableNotice: null,
    });
  },

  patchBundle: (index, partial) => {
    set((s) => {
      const queue = s.queue.slice();
      if (queue[index]) queue[index] = { ...queue[index], ...partial };
      return { queue };
    });
  },

  playStory: (id, title) => {
    set({ storyTrack: { id, title }, queue: [], isPlaying: true, activeLayer: null, audioUnavailableNotice: null });
  },

  setLayers: (l) => {
    const ordered = LAYERS.filter((x) => l.includes(x));
    persistLayers(ordered);
    set({ layers: ordered });
  },

  toggleLayer: (l) => {
    const cur = get().layers;
    const nextLayers = cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l];
    const ordered = LAYERS.filter((x) => nextLayers.includes(x));
    // Never allow an empty selection — fall back to the ayah recitation.
    const final = ordered.length ? ordered : (["ayah"] as Layer[]);
    persistLayers(final);
    set({ layers: final });
  },

  applyPreset: (p) => {
    const layers = MODE_PRESETS[p] ?? MODE_PRESETS.full;
    persistLayers(layers);
    set({ layers });
  },

  setActiveLayer: (l) => set({ activeLayer: l }),

  setQori: (id) => {
    if (typeof window !== "undefined") window.localStorage.setItem(QORI_STORAGE_KEY, String(id));
    set({ qoriId: id });
  },

  setPlaybackRate: (r) => set({ playbackRate: r }),
  setRepeatMode: (m) => set({ repeatMode: m }),
  setSleepMinutes: (m) => set({ sleepAt: m ? Date.now() + m * 60_000 : null }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false, activeLayer: null }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying, activeLayer: s.isPlaying ? null : s.activeLayer })),

  next: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;
    if (repeatMode === "ayah") {
      set({ isPlaying: true });
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "surah") set({ currentIndex: 0, isPlaying: true });
      else set({ isPlaying: false, activeLayer: null });
      return;
    }
    set({ currentIndex: nextIndex });
  },

  prev: () => set((s) => ({ currentIndex: Math.max(0, s.currentIndex - 1) })),

  seekToIndex: (i) => {
    const { queue } = get();
    if (i < 0 || i >= queue.length) return;
    set({ currentIndex: i, isPlaying: true });
  },

  clearNotice: () => set({ audioUnavailableNotice: null }),

  ayahAudioSrc: () => {
    const { queue, currentIndex, qoriId } = get();
    const current = queue[currentIndex];
    if (!current) return null;
    return audioUrl(qoriId, current.surahId, current.number);
  },

  storyAudioSrc: () => {
    const { storyTrack } = get();
    return storyTrack ? storyAudioUrl(storyTrack.id) : null;
  },
}));
