"use client";

import { useEffect, useMemo, useState } from "react";
import { speakArabic, primeVoices } from "@/lib/arabic-voice";
import { hasRealAudio, playKidsSequence } from "@/lib/kids-audio-play";
import type { IqroUnit } from "@/lib/iqro";

// A jilid page: colourful cards of Arabic syllables. Tapping a card ALWAYS
// pronounces it with an Arabic voice (both the Arabic and its Latin helper read
// the same Arabic sound — the transliteration is only a reading aid, never read
// in a local accent). Big, bright, offline.
const TINTS = [
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100",
  "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-100",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-100",
];

export function IqroReader({ rows, tapHint, filled = [] }: { rows: IqroUnit[][]; tapHint: string; filled?: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  const filledSet = useMemo(() => new Set(filled), [filled]);

  useEffect(() => primeVoices(), []);

  function tap(u: IqroUnit) {
    setActive(u.ar);
    window.setTimeout(() => setActive((v) => (v === u.ar ? null : v)), 450);
    // Real recorded audio when every base sound of this unit is filled; else
    // fall back to an Arabic voice.
    if (hasRealAudio(u.codes, filledSet)) {
      playKidsSequence(u.codes, () => speakArabic(u.ar));
    } else {
      speakArabic(u.ar);
    }
  }

  let colorIdx = 0;
  return (
    <div className="space-y-3">
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {row.map((u) => {
            const tint = TINTS[colorIdx++ % TINTS.length];
            return (
              <button
                key={u.ar}
                onClick={() => tap(u)}
                title={`${tapHint}: ${u.latin}`}
                aria-label={u.latin}
                className={`flex aspect-square flex-col items-center justify-center rounded-2xl ${tint} shadow-sm ring-1 ring-black/5 transition-transform duration-150 hover:scale-105 ${
                  active === u.ar ? "scale-110" : ""
                }`}
              >
                <span dir="rtl" className="font-arabic text-3xl leading-none sm:text-4xl">{u.ar}</span>
                <span className="mt-1 text-[10px] font-semibold opacity-70">{u.latin}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
