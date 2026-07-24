import { HIJAIYAH } from "./hijaiyah";

// The catalog of recordable audio "slots" for Al-Qur'an Kids, and the stable
// codes that tie a slot to its R2 object / DB row. Shared by the kids pages
// (which play the real audio when a slot is filled), the admin console (which
// records/uploads into the slots) and the Iqro reader (which composes a drill
// from base-syllable slots).
//
// Codes:
//   h-<i>       hijaiyah letter i (its NAME)                       28 slots
//   s-<i>-<h>   letter i + a short vowel h ∈ {a,i,u}               84 slots
// Total 112 recordable slots.

export const HARAKAT = ["a", "i", "u"] as const;
export type Harakat = (typeof HARAKAT)[number];

export const FATHAH = "َ";
export const KASRAH = "ِ";
export const DHAMMAH = "ُ";
const MARK: Record<Harakat, string> = { a: FATHAH, i: KASRAH, u: DHAMMAH };

export const hijaiyahCode = (i: number): string => `h-${i}`;
export const syllableCode = (i: number, h: Harakat): string => `s-${i}-${h}`;

export interface AudioSlot {
  code: string;
  ar: string; // what should be recited into this slot
  latin: string; // a reading hint for the admin
  group: "hijaiyah" | "iqro";
  letterIndex: number;
  harakat?: Harakat;
}

function letterLatin(i: number): string {
  return HIJAIYAH[i]?.name ?? "";
}

/** The full, fixed catalog — 28 hijaiyah + 84 syllables. */
export const KIDS_AUDIO_CATALOG: AudioSlot[] = [
  ...HIJAIYAH.map((h, i) => ({
    code: hijaiyahCode(i),
    ar: h.arName,
    latin: h.name,
    group: "hijaiyah" as const,
    letterIndex: i,
  })),
  ...HIJAIYAH.flatMap((h, i) =>
    HARAKAT.map((k) => ({
      code: syllableCode(i, k),
      ar: h.ar + MARK[k],
      latin: (letterLatin(i).toLowerCase().replace(/['`ʼ]/g, "") + k).replace(/^a a$/, "aa"),
      group: "iqro" as const,
      letterIndex: i,
      harakat: k,
    }))
  ),
];

export const ALL_AUDIO_CODES: string[] = KIDS_AUDIO_CATALOG.map((s) => s.code);

/** Validate a code (used by the worker before touching R2). */
export function isValidAudioCode(code: string): boolean {
  return /^h-\d{1,2}$/.test(code) || /^s-\d{1,2}-[aiu]$/.test(code);
}
