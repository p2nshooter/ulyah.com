"use client";

import { useEffect, useMemo, useState } from "react";
import { HIJAIYAH } from "@/lib/hijaiyah";
import { speakArabic, primeVoices } from "@/lib/arabic-voice";
import { hijaiyahCode } from "@/lib/kids-audio";
import { hasRealAudio, playKidsSequence } from "@/lib/kids-audio-play";

// A colourful grid of the 28 hijaiyah letters. Tapping a letter speaks its name
// with the browser's built-in speech (no network, no tracking — safe for a
// child page) and gives it a little bounce. Deliberately simple and offline.
const TINTS = [
  "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
  "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-200",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200",
];

export function KidsHijaiyah({ tapHint, filled = [] }: { tapHint: string; filled?: string[] }) {
  const [active, setActive] = useState<number | null>(null);
  const filledSet = useMemo(() => new Set(filled), [filled]);

  useEffect(() => primeVoices(), []);

  function say(i: number, arName: string) {
    setActive(i);
    window.setTimeout(() => setActive((v) => (v === i ? null : v)), 450);
    // Prefer the real recorded voice for this letter when it exists; otherwise
    // pronounce it with an Arabic voice (never a local accent).
    const code = hijaiyahCode(i);
    if (hasRealAudio([code], filledSet)) {
      playKidsSequence([code], () => speakArabic(arName));
    } else {
      speakArabic(arName);
    }
  }

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
      {HIJAIYAH.map((h, i) => (
        <button
          key={h.ar}
          onClick={() => say(i, h.arName)}
          title={`${tapHint}: ${h.name}`}
          aria-label={h.name}
          className={`flex aspect-square flex-col items-center justify-center rounded-2xl ${
            TINTS[i % TINTS.length]
          } shadow-sm ring-1 ring-black/5 transition-transform duration-150 hover:scale-105 ${
            active === i ? "scale-110" : ""
          }`}
        >
          <span dir="rtl" className="font-arabic text-3xl leading-none sm:text-4xl">{h.ar}</span>
          <span className="mt-1 text-[10px] font-semibold opacity-80">{h.name}</span>
        </button>
      ))}
    </div>
  );
}
