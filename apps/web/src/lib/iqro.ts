// A six-level "belajar membaca" (learn-to-read) ladder for Al-Qur'an Kids.
//
// The content here is GENERATED from the Arabic alphabet and the standard
// harakat — the language's own canonical building blocks (letters, fathah,
// kasrah, dhammah, tanwin, mad, sukun, tasydid) — following the ordinary
// beginner qiraah progression that every teacher uses. It is NOT a reproduction
// of any particular published primer; the drills are assembled programmatically
// below. Every unit is a real, correct Arabic syllable.
//
// Each unit also carries `codes`: the base-syllable audio slots (see
// lib/kids-audio.ts) that voice it. When those slots hold real recorded audio
// the reader plays them in sequence; otherwise it falls back to an Arabic voice.

import { syllableCode, FATHAH, KASRAH, DHAMMAH } from "./kids-audio";

const SUKUN = "ْ";
const TAN_FAT = "ً";
const TAN_KAS = "ٍ";
const TAN_DAM = "ٌ";
const SHADDA = "ّ";
const ALIF = "ا";
const YA = "ي";
const WAW = "و";

interface Letter {
  g: string;
  c: string;
}

// 28 letters (same order/index as HIJAIYAH, so index i ↔ audio code s-i-*).
const L: Letter[] = [
  { g: "ا", c: "a" }, { g: "ب", c: "b" }, { g: "ت", c: "t" }, { g: "ث", c: "ts" },
  { g: "ج", c: "j" }, { g: "ح", c: "ḥ" }, { g: "خ", c: "kh" }, { g: "د", c: "d" },
  { g: "ذ", c: "dz" }, { g: "ر", c: "r" }, { g: "ز", c: "z" }, { g: "س", c: "s" },
  { g: "ش", c: "sy" }, { g: "ص", c: "sh" }, { g: "ض", c: "dh" }, { g: "ط", c: "th" },
  { g: "ظ", c: "zh" }, { g: "ع", c: "'a" }, { g: "غ", c: "gh" }, { g: "ف", c: "f" },
  { g: "ق", c: "q" }, { g: "ك", c: "k" }, { g: "ل", c: "l" }, { g: "م", c: "m" },
  { g: "ن", c: "n" }, { g: "ه", c: "h" }, { g: "و", c: "w" }, { g: "ي", c: "y" },
];

export interface IqroUnit {
  ar: string;
  latin: string;
  codes: string[];
}
export interface IqroJilid {
  no: number;
  title: string;
  focus: string;
  rows: IqroUnit[][];
}

const chunk = <T>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

// A letter carrying a short vowel, e.g. بَ / بِ / بُ.
const vowelled = (mark: string, h: "a" | "i" | "u"): IqroUnit[] =>
  L.map((x, i) => ({
    ar: x.g + mark,
    latin: x.c === "a" && h === "a" ? "aa" : x.c + h,
    codes: [syllableCode(i, h)],
  }));

// Jilid 1 — every letter with fathah.
const jilid1: IqroUnit[][] = chunk(vowelled(FATHAH, "a"), 6);

// Jilid 2 — joined pairs (huruf sambung), fathah on both.
const jilid2Units: IqroUnit[] = [];
for (let i = 0; i + 1 < L.length; i += 2) {
  const a = L[i]!;
  const b = L[i + 1]!;
  jilid2Units.push({ ar: a.g + FATHAH + b.g + FATHAH, latin: `${a.c}a${b.c}a`, codes: [syllableCode(i, "a"), syllableCode(i + 1, "a")] });
}
const jilid2: IqroUnit[][] = chunk(jilid2Units, 4);

// Jilid 3 — kasrah and dhammah.
const jilid3: IqroUnit[][] = [...chunk(vowelled(KASRAH, "i"), 6), ...chunk(vowelled(DHAMMAH, "u"), 6)];

// Jilid 4 — tanwin (an / in / un). Audio hint = the base short-vowel syllable.
const jilid4Units: IqroUnit[] = [];
for (let i = 0; i < L.length; i++) {
  const x = L[i]!;
  jilid4Units.push({ ar: x.g + TAN_FAT, latin: `${x.c === "a" ? "a" : x.c}an`, codes: [syllableCode(i, "a")] });
  jilid4Units.push({ ar: x.g + TAN_KAS, latin: `${x.c === "a" ? "i" : x.c}in`, codes: [syllableCode(i, "i")] });
  jilid4Units.push({ ar: x.g + TAN_DAM, latin: `${x.c === "a" ? "u" : x.c}un`, codes: [syllableCode(i, "u")] });
}
const jilid4: IqroUnit[][] = chunk(jilid4Units, 6);

// Jilid 5 — mad (long vowels).
const jilid5Units: IqroUnit[] = [];
for (let i = 0; i < L.length; i++) {
  const x = L[i]!;
  if (x.g === "ا") continue;
  jilid5Units.push({ ar: x.g + FATHAH + ALIF, latin: `${x.c}aa`, codes: [syllableCode(i, "a")] });
  jilid5Units.push({ ar: x.g + KASRAH + YA, latin: `${x.c}ii`, codes: [syllableCode(i, "i")] });
  jilid5Units.push({ ar: x.g + DHAMMAH + WAW, latin: `${x.c}uu`, codes: [syllableCode(i, "u")] });
}
const jilid5: IqroUnit[][] = chunk(jilid5Units, 6);

// Jilid 6 — sukun (closed syllable) and tasydid (doubled).
const jilid6Units: IqroUnit[] = [];
for (let i = 0; i < L.length; i++) {
  const x = L[i]!;
  if (x.g === "ا") continue;
  jilid6Units.push({ ar: ALIF + FATHAH + x.g + SUKUN, latin: `a${x.c}`, codes: [syllableCode(0, "a"), syllableCode(i, "a")] });
  jilid6Units.push({ ar: x.g + FATHAH + x.g + SHADDA, latin: `${x.c}a${x.c}${x.c}`, codes: [syllableCode(i, "a")] });
}
const jilid6: IqroUnit[][] = chunk(jilid6Units, 6);

export const IQRO: IqroJilid[] = [
  { no: 1, title: "Jilid 1", focus: "Huruf berharakat fathah (a)", rows: jilid1 },
  { no: 2, title: "Jilid 2", focus: "Huruf sambung", rows: jilid2 },
  { no: 3, title: "Jilid 3", focus: "Kasrah (i) & dhammah (u)", rows: jilid3 },
  { no: 4, title: "Jilid 4", focus: "Tanwin (an, in, un)", rows: jilid4 },
  { no: 5, title: "Jilid 5", focus: "Mad — bacaan panjang", rows: jilid5 },
  { no: 6, title: "Jilid 6", focus: "Sukun & tasydid", rows: jilid6 },
];

export const getJilid = (no: number): IqroJilid | undefined => IQRO.find((j) => j.no === no);
