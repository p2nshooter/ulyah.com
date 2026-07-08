"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerStore, LAYERS, type Layer, type QueueItem } from "@/lib/player-store";
import { api } from "@/lib/api";
import { speak, speechAvailable, type NarrationHandle } from "@/lib/speech";
import type { Dictionary } from "@/dictionaries";

const QORI_LIST = [
  { id: 1, name: "Mishary Rashid Alafasy" },
  { id: 2, name: "Abdurrahman As-Sudais" },
  { id: 3, name: "Saad Al-Ghamdi" },
  { id: 4, name: "Mahmoud Khalil Al-Husary" },
];

interface AyahBundleResponse {
  translation: { text: string } | null;
  tafsir: { text: string }[];
  asbabun_nuzul: { text: string }[];
  hadits: { text_id: string; narrator: string | null; source: string }[];
}

/** Fetch tafsir/asbabun/hadits text once and fold it into narratable strings. */
async function loadBundle(item: QueueItem, lang: string): Promise<Partial<QueueItem>> {
  try {
    const b = await api.get<AyahBundleResponse>(`/quran/ayah/${item.surahId}/${item.number}?lang=${lang}`);
    return {
      translation: item.translation ?? b.translation?.text ?? null,
      tafsir: b.tafsir.map((t) => t.text).join(" ") || null,
      asbabun: b.asbabun_nuzul.map((a) => a.text).join(" ") || null,
      hadits:
        b.hadits.map((h) => `${h.text_id}${h.narrator ? ` — ${h.narrator}` : ""} (${h.source})`).join(". ") || null,
      bundleLoaded: true,
    };
  } catch {
    return { bundleLoaded: true };
  }
}

function layerText(item: QueueItem, layer: Layer): string | null {
  switch (layer) {
    case "translation":
      return item.translation;
    case "tafsir":
      return item.tafsir;
    case "asbabun":
      return item.asbabun;
    case "hadits":
      return item.hadits;
    default:
      return null;
  }
}

export function GlobalPlayerBar({ dict }: { dict: Dictionary }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const narrationRef = useRef<NarrationHandle | null>(null);
  const genRef = useRef(0);

  const {
    queue,
    currentIndex,
    storyTrack,
    isPlaying,
    qoriId,
    layers,
    activeLayer,
    playbackRate,
    repeatMode,
    sleepAt,
    ayahAudioSrc,
    storyAudioSrc,
    pause,
    toggle,
    next,
    prev,
    patchBundle,
    setActiveLayer,
    setQori,
    setPlaybackRate,
    setRepeatMode,
  } = usePlayerStore();

  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [showQoriMenu, setShowQoriMenu] = useState(false);
  const current = queue[currentIndex];
  const layersKey = layers.join(",");
  const uiLang = typeof document !== "undefined" ? document.documentElement.lang || "id" : "id";

  const cancelAll = useCallback(() => {
    genRef.current++;
    narrationRef.current?.cancel();
    narrationRef.current = null;
    const audio = audioRef.current;
    if (audio) audio.pause();
  }, []);

  /** Play the current ayah's recitation. Resolves true on natural end,
   * false if the murottal for this qori/ayah isn't imported (404) so the
   * sequence can fall through to the narrated layers instead of going silent. */
  const playAyahAudio = useCallback(
    (myGen: number): Promise<boolean> =>
      new Promise((resolve) => {
        const audio = audioRef.current;
        const src = usePlayerStore.getState().ayahAudioSrc();
        if (!audio || !src) return resolve(false);
        let settled = false;
        const cleanup = () => {
          audio.removeEventListener("ended", onEnded);
          audio.removeEventListener("error", onError);
        };
        const onEnded = () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(true);
        };
        const onError = () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(false);
        };
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);
        audio.src = src;
        audio.playbackRate = usePlayerStore.getState().playbackRate;
        audio.play().catch(() => onError());
        // If the run is superseded, stop waiting on this audio.
        const poll = setInterval(() => {
          if (myGen !== genRef.current && !settled) {
            settled = true;
            cleanup();
            clearInterval(poll);
            resolve(false);
          } else if (settled) {
            clearInterval(poll);
          }
        }, 120);
      }),
    []
  );

  const narrate = useCallback(
    (text: string, myGen: number): Promise<void> =>
      new Promise((resolve) => {
        if (!speechAvailable() || !text.trim()) return resolve();
        const rate = Math.min(1.1, Math.max(0.7, 0.95 * (usePlayerStore.getState().playbackRate || 1)));
        const handle = speak(text, uiLang, { rate });
        narrationRef.current = handle;
        handle.done.then(() => {
          if (myGen === genRef.current) resolve();
          else resolve();
        });
      }),
    [uiLang]
  );

  /** The sequence runner for one ayah: walk enabled layers, then advance. */
  const runAyah = useCallback(
    async (myGen: number) => {
      const st = usePlayerStore.getState();
      const item = st.queue[st.currentIndex];
      if (!item) return;
      const enabled = st.layers;

      let work = item;
      const needsText = enabled.some((l) => l !== "ayah");
      if (needsText && !item.bundleLoaded) {
        const patch = await loadBundle(item, uiLang);
        if (myGen !== genRef.current) return;
        patchBundle(st.currentIndex, patch);
        work = { ...item, ...patch };
      }

      for (const layer of LAYERS) {
        if (!enabled.includes(layer)) continue;
        if (myGen !== genRef.current) return;
        if (layer === "ayah") {
          setActiveLayer("ayah");
          await playAyahAudio(myGen);
        } else {
          const text = layerText(work, layer);
          if (!text) continue;
          setActiveLayer(layer);
          await narrate(text, myGen);
        }
        if (myGen !== genRef.current) return;
      }
      if (myGen !== genRef.current) return;
      setActiveLayer(null);
      next();
    },
    [uiLang, patchBundle, setActiveLayer, playAyahAudio, narrate, next]
  );

  // Main driver: (re)start the current ayah's layer sequence whenever the
  // focused ayah, the layer selection, or the qori changes while playing.
  useEffect(() => {
    if (storyTrack) return;
    cancelAll();
    if (!isPlaying || !current) return;
    const myGen = genRef.current; // cancelAll already bumped it
    runAyah(myGen);
    return () => {
      /* next effect run calls cancelAll */
    };
  }, [isPlaying, currentIndex, layersKey, qoriId, storyTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  // Story playback — a single recorded/narrated track, simple transport.
  useEffect(() => {
    if (!storyTrack) return;
    const audio = audioRef.current;
    if (!audio) return;
    const src = storyAudioSrc();
    if (!src) return;
    if (audio.src !== src) audio.src = src;
    audio.playbackRate = playbackRate;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [storyTrack, isPlaying, playbackRate, storyAudioSrc]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!sleepAt) return;
    const t = setTimeout(() => pause(), Math.max(0, sleepAt - Date.now()));
    return () => clearTimeout(t);
  }, [sleepAt, pause]);

  useEffect(() => () => cancelAll(), [cancelAll]);

  const hasTrack = Boolean(current || storyTrack);
  if (!hasTrack) return null;

  const title = storyTrack?.title ?? (current ? `${current.surahName} · ${dict.reader.ayahLabel} ${current.number}` : "");
  const layerLabelMap: Record<Layer, string> = {
    ayah: dict.reader.modeAyahOnly,
    translation: dict.reader.translationLabel,
    tafsir: dict.reader.tafsirLabel,
    asbabun: dict.reader.asbabunNuzulLabel,
    hadits: dict.reader.haditsLabel,
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-accent/20 bg-[#06251b]/97 px-3 py-2 text-[#f4efe3] backdrop-blur-md sm:px-6">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) =>
          setProgress({ current: e.currentTarget.currentTime, duration: e.currentTarget.duration || 0 })
        }
        onEnded={() => {
          if (storyTrack) next();
        }}
      />
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{title}</p>
            {activeLayer && (
              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-[#06251b]">
                🔊 {layerLabelMap[activeLayer]}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs tabular-nums text-[#f4efe3]/60">{formatTime(progress.current)}</span>
            <input
              type="range"
              min={0}
              max={progress.duration || 0}
              value={progress.current}
              onChange={(e) => {
                if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
              }}
              className="h-1 flex-1 accent-accent"
            />
            <span className="text-xs tabular-nums text-[#f4efe3]/60">{formatTime(progress.duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {!storyTrack && (
            <button aria-label="previous" onClick={prev} className="p-2 text-lg hover:text-accent">
              ⏮
            </button>
          )}
          <button
            aria-label={isPlaying ? "pause" : "play"}
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg text-[#06251b] shadow-lg transition hover:scale-105"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          {!storyTrack && (
            <button aria-label="next" onClick={() => next()} className="p-2 text-lg hover:text-accent">
              ⏭
            </button>
          )}

          {!storyTrack && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowQoriMenu((v) => !v)}
                className="rounded-full border border-accent/30 px-3 py-1 text-xs hover:border-accent"
              >
                {dict.reader.qariLabel}: {QORI_LIST.find((q) => q.id === qoriId)?.name.split(" ")[0]}
              </button>
              {showQoriMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-accent/20 bg-[#0b3d2e] shadow-xl">
                  {QORI_LIST.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setQori(q.id);
                        setShowQoriMenu(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-accent/10 ${q.id === qoriId ? "text-accent" : ""}`}
                    >
                      {q.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <select
            aria-label="playback speed"
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="hidden rounded border border-accent/30 bg-transparent px-1 py-1 text-xs sm:block"
          >
            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r} className="text-[#232323]">
                {r}x
              </option>
            ))}
          </select>

          <button
            aria-label="repeat"
            onClick={() => setRepeatMode(repeatMode === "off" ? "ayah" : repeatMode === "ayah" ? "surah" : "off")}
            className={`hidden p-2 text-sm sm:block ${repeatMode !== "off" ? "text-accent" : "text-[#f4efe3]/70"}`}
            title={repeatMode}
          >
            🔁
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
