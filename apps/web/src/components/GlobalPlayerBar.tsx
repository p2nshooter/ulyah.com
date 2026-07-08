"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/lib/player-store";
import { speak, speechAvailable, type NarrationHandle } from "@/lib/speech";
import type { Dictionary } from "@/dictionaries";

const QORI_LIST = [
  { id: 1, name: "Mishary Rashid Alafasy" },
  { id: 2, name: "Abdul Rahman Al-Sudais" },
  { id: 3, name: "Saad Al-Ghamdi" },
  { id: 4, name: "Mahmoud Khalil Al-Husary" },
];

export function GlobalPlayerBar({ dict }: { dict: Dictionary }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    queue,
    currentIndex,
    storyTrack,
    isPlaying,
    qoriId,
    playbackRate,
    repeatMode,
    sleepAt,
    currentAudioSrc,
    play,
    pause,
    toggle,
    next,
    prev,
    setQori,
    setPlaybackRate,
    setRepeatMode,
  } = usePlayerStore();

  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [showQoriMenu, setShowQoriMenu] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const narrationRef = useRef<NarrationHandle | null>(null);
  const mode = usePlayerStore((s) => s.mode);
  const src = currentAudioSrc();
  const current = queue[currentIndex];
  const uiLang = typeof document !== "undefined" ? document.documentElement.lang || "id" : "id";

  /** Speak the current ayah's translation, then advance. The always-available
   * voice layer: runs after recitation in full mode, instead of it in
   * translation mode, and as the fallback when murottal audio is missing. */
  function narrateThenNext() {
    const text = current?.translation;
    if (!text || !speechAvailable()) {
      next();
      return;
    }
    setNarrating(true);
    narrationRef.current?.cancel();
    const handle = speak(text, uiLang);
    narrationRef.current = handle;
    handle.done.then(() => {
      setNarrating(false);
      next();
    });
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src || !current) return;
    narrationRef.current?.cancel();
    setNarrating(false);
    if (mode === "translation") {
      // Narration-only mode — no recitation audio involved.
      audio.pause();
      if (isPlaying) narrateThenNext();
      return;
    }
    if (audio.src !== src) {
      audio.src = src;
      audio.playbackRate = playbackRate;
      if (isPlaying) audio.play().catch(() => {});
    }
  }, [src, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => narrationRef.current?.cancel(), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      if (mode === "translation") narrateThenNext();
      else audio.play().catch(() => {});
    } else {
      audio.pause();
      narrationRef.current?.cancel();
      setNarrating(false);
    }
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!sleepAt) return;
    const t = setTimeout(() => pause(), Math.max(0, sleepAt - Date.now()));
    return () => clearTimeout(t);
  }, [sleepAt, pause]);

  if (!src) return null;

  const title = storyTrack?.title ?? (current ? `${current.surahName} : ${current.number}` : "");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur px-3 py-2 sm:px-6">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) =>
          setProgress({ current: e.currentTarget.currentTime, duration: e.currentTarget.duration || 0 })
        }
        onEnded={() => (mode === "full" ? narrateThenNext() : next())}
        onError={() => {
          // Murottal for this qori/ayah not imported yet — narrate the
          // translation instead of going silent, then keep the queue moving.
          if (isPlaying) narrateThenNext();
        }}
      />
      {narrating && (
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-accent/90 px-3 py-0.5 text-[10px] text-white">
          {dict.reader.translationLabel} 🔊
        </span>
      )}
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
              {formatTime(progress.current)}
            </span>
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
            <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
              {formatTime(progress.duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {!storyTrack && (
            <button aria-label="previous" onClick={prev} className="p-2 text-lg">
              ⏮
            </button>
          )}
          <button
            aria-label={isPlaying ? "pause" : "play"}
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white dark:bg-accent dark:text-primary"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          {!storyTrack && (
            <button aria-label="next" onClick={() => next()} className="p-2 text-lg">
              ⏭
            </button>
          )}

          {!storyTrack && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowQoriMenu((v) => !v)}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs"
              >
                {dict.reader.qariLabel}: {QORI_LIST.find((q) => q.id === qoriId)?.name.split(" ")[0]}
              </button>
              {showQoriMenu && (
                <div className="absolute bottom-full mb-2 right-0 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg">
                  {QORI_LIST.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setQori(q.id);
                        setShowQoriMenu(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-black/5 ${q.id === qoriId ? "text-accent" : ""}`}
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
            className="hidden rounded border border-[var(--color-border)] bg-transparent px-1 py-1 text-xs sm:block"
          >
            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>

          <button
            aria-label="repeat"
            onClick={() => setRepeatMode(repeatMode === "off" ? "ayah" : repeatMode === "ayah" ? "surah" : "off")}
            className={`hidden p-2 text-sm sm:block ${repeatMode !== "off" ? "text-accent" : ""}`}
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
