"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { routePath } from "@/lib/paths";
import { ayahAudioSourcesSync } from "@/lib/qori-cdn";

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

// Mishary Al-Afasy — clear, gentle tartil, a good first voice for children.
//
// It plays from the reciter's own CDN, like every other player on the site
// (owner: "hilangin audio2 alquran murottal ganti dengan cdn"). This page was
// the last one still asking api.ulyah.com for the bytes, and asking through
// the LEGACY /audio/qori/ path with no version token — the one prefix whose
// old objects were the muffled low-bitrate encodes. Nothing serves those any
// more, but a browser or edge entry cached under that exact url can, and a
// child's page is the last place to discover it.
const RECITER_KEY = "ar.alafasy";
/** Give up on an ayah after this many sources fail, and on the surah after
 *  this many ayat fail in a row — a repeat loop must never spin on a network
 *  that is simply down. */
const MAX_FAIL_STREAK = 3;

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
  /** The sources for the ayah playing now, and which one is being tried. */
  const sourcesRef = useRef<string[]>([]);
  const sourceIdxRef = useRef(0);
  const failStreakRef = useRef(0);

  /** Point the element at the source being tried and start it. */
  function playSource() {
    const el = audioRef.current;
    const src = sourcesRef.current[sourceIdxRef.current];
    if (!el || !src) {
      setPlaying(false);
      return;
    }
    el.src = src;
    el.play().catch((err: unknown) => {
      // WHICH rejection this is decides everything.
      //
      // NotAllowedError means the browser wants a gesture: stop, and let the
      // child press play. Everything else is a source that will not load —
      // and the element fires its own `error` for that, which is already
      // moving to the next source. Calling setPlaying(false) on those would
      // leave the button saying "play" over audio that is playing. (AbortError
      // is the most ordinary of them: it is what a pending play() rejects with
      // when the fallback sets a new src.)
      if ((err as { name?: string })?.name === "NotAllowedError") setPlaying(false);
    });
  }

  // Play ayah at index i (or stop when past the end / restart when repeating).
  //
  // Synchronous on purpose: the sources come from a formula, so `src` is set
  // and `play()` called inside the tap that asked for it. An await here would
  // spend the gesture and the browser would refuse the first play.
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
    sourcesRef.current = ayahAudioSourcesSync(RECITER_KEY, surahId, ayat[i]!.number);
    sourceIdxRef.current = 0;
    playSource();
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
    const onEnded = () => {
      failStreakRef.current = 0;
      playIndex(current + 1);
    };
    /**
     * A source that will not load.
     *
     * Nothing handled this before, and `error` is the one media event that
     * does not lead to `ended`: a single 404 left the play-all stopped on that
     * ayah with no way to tell it had. Now the next source is tried, then the
     * next ayah — a voice missing one file never ends the session, and a
     * network that is down stops the loop instead of spinning on it.
     */
    const onError = () => {
      sourceIdxRef.current += 1;
      if (sourceIdxRef.current < sourcesRef.current.length) {
        playSource();
        return;
      }
      failStreakRef.current += 1;
      if (failStreakRef.current >= MAX_FAIL_STREAK) {
        setPlaying(false);
        setCurrent(-1);
        return;
      }
      playIndex(current + 1);
    };
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, repeat, ayat.length]);

  // Auto-scroll: follow the playing verse; when the loop restarts at the first
  // verse (repeat), glide back to the very top on its own — over and over until
  // the child stops it (owner: "saat ngulang juga auto ke atas sendiri begitu
  // terus sebelum di stop").
  useEffect(() => {
    if (current < 0) return;
    if (current === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const node = document.getElementById(`kids-ayah-${ayat[current]?.number}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current, ayat]);

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-amber-50 to-rose-50 pb-24 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <Link
          href={routePath(locale, `/kids`)}
          className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-slate-200"
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
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-emerald-400 to-lime-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg ring-1 ring-black/10 transition hover:brightness-105"
          >
            <span aria-hidden>{playing ? "⏸" : "▶️"}</span>
            {playing ? labels.pause : labels.playAll}
          </button>
          <button
            onClick={() => setRepeat((v) => !v)}
            aria-pressed={repeat}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold shadow-xs ring-1 transition ${
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
              id={`kids-ayah-${a.number}`}
              className={`scroll-mt-24 rounded-3xl p-4 shadow-xs ring-1 transition ${
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
