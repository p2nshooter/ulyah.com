"use client";

import { create } from "zustand";
import { audioUrl, storyAudioUrl } from "./api";

export const PLAYBACK_MODES = ["full", "ayah", "translation", "tafsir", "story"] as const;
export type PlaybackMode = (typeof PLAYBACK_MODES)[number];

export interface QueueAyah {
  surahId: number;
  surahName: string;
  number: number;
  textAr: string;
  translation: string | null;
}

interface PlayerState {
  queue: QueueAyah[];
  currentIndex: number;
  qoriId: number;
  mode: PlaybackMode;
  isPlaying: boolean;
  playbackRate: number;
  repeatMode: "off" | "ayah" | "surah";
  sleepAt: number | null;
  storyTrack: { id: number; title: string } | null;
  audioUnavailableNotice: string | null;

  loadSurahQueue: (ayat: QueueAyah[], startIndex?: number) => void;
  playStory: (id: number, title: string) => void;
  setMode: (m: PlaybackMode) => void;
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

  currentAudioSrc: () => string | null;
}

const QORI_STORAGE_KEY = "ulyah_qori_id";

function loadStoredQori(): number {
  if (typeof window === "undefined") return 1;
  const stored = window.localStorage.getItem(QORI_STORAGE_KEY);
  return stored ? Number(stored) : 1;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  qoriId: loadStoredQori(),
  mode: "ayah",
  isPlaying: false,
  playbackRate: 1,
  repeatMode: "off",
  sleepAt: null,
  storyTrack: null,
  audioUnavailableNotice: null,

  loadSurahQueue: (ayat, startIndex = 0) => {
    set({ queue: ayat, currentIndex: startIndex, storyTrack: null, isPlaying: true, audioUnavailableNotice: null });
  },

  playStory: (id, title) => {
    set({ storyTrack: { id, title }, queue: [], isPlaying: true, mode: "story", audioUnavailableNotice: null });
  },

  setMode: (m) => set({ mode: m }),

  setQori: (id) => {
    if (typeof window !== "undefined") window.localStorage.setItem(QORI_STORAGE_KEY, String(id));
    set({ qoriId: id });
  },

  setPlaybackRate: (r) => set({ playbackRate: r }),
  setRepeatMode: (m) => set({ repeatMode: m }),
  setSleepMinutes: (m) => set({ sleepAt: m ? Date.now() + m * 60_000 : null }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;
    if (repeatMode === "ayah") {
      set({ isPlaying: true }); // signal GlobalPlayerBar to replay same track
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "surah") {
        set({ currentIndex: 0, isPlaying: true });
      } else {
        set({ isPlaying: false });
      }
      return;
    }
    set({ currentIndex: nextIndex });
  },

  prev: () => {
    const { currentIndex } = get();
    set({ currentIndex: Math.max(0, currentIndex - 1) });
  },

  seekToIndex: (i) => {
    const { queue } = get();
    if (i < 0 || i >= queue.length) return;
    set({ currentIndex: i, isPlaying: true });
  },

  clearNotice: () => set({ audioUnavailableNotice: null }),

  currentAudioSrc: () => {
    const { storyTrack, queue, currentIndex, qoriId } = get();
    if (storyTrack) return storyAudioUrl(storyTrack.id);
    const current = queue[currentIndex];
    if (!current) return null;
    return audioUrl(qoriId, current.surahId, current.number);
  },
}));
