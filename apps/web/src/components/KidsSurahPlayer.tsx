"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface KidsAyah {
  number: number;
  ar: string;
  meaning: string;
}

interface Labels {
  back: string;
  playAll: string;
  pause: string;
  repeat: string;
  repeatOn: string;
  ayahMeaning: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";
const pad3 = (n: number) => String(n).padStart(3, "0");
// Mishary Al-Afasy — clear, gentle tartil, a good first voice for children.
// The audio API self-heals from R2 → the reciter's CDN, so this always plays.
const RECITER = "alafasy";
const audioUrl = (surah: number, ayah: number) =>
  `${API_BASE}/audio/qori/${RECITER}/${pad3(surah)}${pad3(ayah)}.mp3`;

// A bright, child-safe surah player: big Arabic, simple meaning, and a
// play-all with a "repeat" mode for memorization (the concept's Modul 1 —
// "audio ulang-ulang untuk menghafal"). No links out to adult content.
export function KidsSurahPlayer({
  locale,
  surahId,
  nameAr,
  nameLatin,
  ayat,
  labels,
}: {
  locale: string;
  surahId: number;
  nameAr: string;
  nameLatin: string;
  ayat: KidsAyah[];
  labels: Labels;
}) {
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [current, setCurrent] = useState<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play ayah at index i (or stop when past the end / restart when repeating).
  function playIndex(i: number) {
    if (i >= ayat.length) {
      if (repeat) {
        i = 0;
      } else {
        setPlaying(false);
        setCurrent(-1);
        return;
      }
    }
    setCurrent(i);
    const el = audioRef.current;
    if (!el) return;
    el.src = audioUrl(surahId, ayat[i]!.number);
    el.play().catch(() => {
      // Autoplay/network hiccup — skip to the next ayah rather than stall.
      setPlaying(false);
    });
  }

  function togglePlay() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      setPlaying(true);
      playIndex(current < 0 ? 0 : current);
    }
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => playIndex(current + 1);
    el.addEventListener("ended", onEnded);
    return () => el.removeEventListener("ended", onEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, repeat, ayat.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-rose-50 pb-24 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <Link
          href={`/${locale}/kids`}
          className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-slate-200"
        >
          ← {labels.back}
        </Link>

        <div className="mt-6 text-center">
          <p dir="rtl" className="font-arabic text-4xl text-slate-800 dark:text-amber-100">{nameAr}</p>
          <p className="mt-1 font-heading text-lg font-bold text-slate-700 dark:text-amber-200">
            {surahId}. {nameLatin}
          </p>
        </div>

        {/* Controls */}
        <div className="sticky top-2 z-10 mt-5 flex items-center justify-center gap-3">
          <button
            onClick={togglePlay}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg ring-1 ring-black/10 transition hover:brightness-105"
          >
            <span aria-hidden>{playing ? "⏸" : "▶️"}</span>
            {playing ? labels.pause : labels.playAll}
          </button>
          <button
            onClick={() => setRepeat((v) => !v)}
            aria-pressed={repeat}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm ring-1 transition ${
              repeat
                ? "bg-amber-400 text-white ring-black/10"
                : "bg-white/70 text-slate-600 ring-black/5 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            <span aria-hidden>🔁</span>
            {repeat ? labels.repeatOn : labels.repeat}
          </button>
        </div>

        {/* Ayat */}
        <ol className="mt-6 space-y-3">
          {ayat.map((a, i) => (
            <li
              key={a.number}
              className={`rounded-3xl p-4 shadow-sm ring-1 transition ${
                current === i
                  ? "bg-amber-100 ring-amber-300 dark:bg-amber-500/20 dark:ring-amber-400/40"
                  : "bg-white/80 ring-black/5 dark:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/90 text-xs font-bold text-white">
                  {a.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p dir="rtl" className="font-arabic text-2xl leading-loose text-slate-800 dark:text-amber-50">{a.ar}</p>
                  {a.meaning && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold opacity-70">{labels.ayahMeaning}: </span>
                      {a.meaning}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="none" />
    </div>
  );
}
