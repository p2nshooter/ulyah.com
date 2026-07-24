// A six-level "belajar membaca" (learn-to-read) ladder for Al-Qur'an Kids.
//
// The content is GENERATED from the Arabic alphabet and the standard harakat —
// the language's own canonical building blocks (letters, fathah, kasrah,
// dhammah, tanwin, mad, sukun, tasydid) — following the ordinary beginner
// qiraah progression that every teacher uses: single letters → doubles →
// connected pairs/triples → mixed vowels → tanwin/mad/sukun/tasydid. It is NOT
// a reproduction of any particular published primer; every drill is assembled
// programmatically below and is a real, correct Arabic syllable/word.
//
// Each unit carries `codes`: the base-syllable audio slots (lib/kids-audio.ts)
// that voice it. When those slots hold real recorded audio the reader plays
// them in sequence; otherwise it falls back to an Arabic voice.

import { syllableCode, FATHAH, KASRAH, DHAMMAH } from "./kids-audio";

const SUKUN = "ْ";
const TAN_FAT = "ً";
const TAN_KAS = "ٍ";
const TAN_DAM = "ٌ";
const SHADDA = "ّ";
const ALIF = "ا";
const YA = "ي";
const WAW = "و";

type Hk = "a" | "i" | "u";
const MARK: Record<Hk, string> = { a: FATHAH, i: KASRAH, u: DHAMMAH };

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
const N = L.length;
const at = (i: number): Letter => L[((i % N) + N) % N]!;

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

const chunk = (arr: IqroUnit[], n = 6): IqroUnit[][] => {
  const out: IqroUnit[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

// Latin reading hint for a letter + short vowel.
const lat = (x: Letter, h: Hk): string => (x.c === "a" ? (h === "a" ? "aa" : h) : x.c + h);

// ── building blocks ───────────────────────────────────────────────────────
const single = (i: number, h: Hk): IqroUnit => ({ ar: at(i).g + MARK[h], latin: lat(at(i), h), codes: [syllableCode(((i % N) + N) % N, h)] });

const seq = (parts: Array<{ i: number; h: Hk; tail?: string }>): IqroUnit => {
  let ar = "";
  let latin = "";
  const codes: string[] = [];
  for (const p of parts) {
    const idx = ((p.i % N) + N) % N;
    ar += at(idx).g + MARK[p.h] + (p.tail ?? "");
    latin += lat(at(idx), p.h);
    codes.push(syllableCode(idx, p.h));
  }
  return { ar, latin, codes };
};

const singles = (h: Hk): IqroUnit[] => L.map((_, i) => single(i, h));
const doubles = (h: Hk): IqroUnit[] => L.map((_, i) => seq([{ i, h }, { i, h }]));
const pairs = (h: Hk, step = 1): IqroUnit[] => L.map((_, i) => seq([{ i, h }, { i: i + step, h }]));
const triples = (h: Hk, step = 1): IqroUnit[] => L.map((_, i) => seq([{ i, h }, { i: i + step, h }, { i: i + 2 * step, h }]));

// ── Jilid 1 — fathah: letters, then doubles, then joined pairs ─────────────
const jilid1 = [...singles("a"), ...doubles("a"), ...pairs("a")];

// ── Jilid 2 — huruf sambung: pairs (step 1 & 3) and triples ────────────────
const jilid2 = [...pairs("a", 1), ...pairs("a", 3), ...triples("a", 1)];

// ── Jilid 3 — kasrah & dhammah: singles, doubles, joined ───────────────────
const jilid3 = [
  ...singles("i"),
  ...singles("u"),
  ...doubles("i"),
  ...doubles("u"),
  ...pairs("i"),
  ...pairs("u"),
  // mixed vowels within a word
  ...L.map((_, i) => seq([{ i, h: "a" }, { i: i + 1, h: "i" }])),
  ...L.map((_, i) => seq([{ i, h: "u" }, { i: i + 1, h: "a" }])),
];

// ── Jilid 4 — tanwin, incl. two-letter words ending in tanwin ──────────────
const tanwinSingles: IqroUnit[] = [];
for (let i = 0; i < N; i++) {
  tanwinSingles.push({ ar: at(i).g + TAN_FAT, latin: `${lat(at(i), "a")}n`, codes: [syllableCode(i, "a")] });
  tanwinSingles.push({ ar: at(i).g + TAN_KAS, latin: `${lat(at(i), "i")}n`, codes: [syllableCode(i, "i")] });
  tanwinSingles.push({ ar: at(i).g + TAN_DAM, latin: `${lat(at(i), "u")}n`, codes: [syllableCode(i, "u")] });
}
const tanwinWords: IqroUnit[] = L.map((_, i) => {
  const a = ((i % N) + N) % N;
  const b = (a + 1) % N;
  return {
    ar: at(a).g + FATHAH + at(b).g + TAN_FAT,
    latin: `${lat(at(a), "a")}${lat(at(b), "a")}n`,
    codes: [syllableCode(a, "a"), syllableCode(b, "a")],
  };
});
const jilid4 = [...tanwinSingles, ...tanwinWords];

// ── Jilid 5 — mad (long vowels): base + mad, and words containing mad ──────
const madSingles: IqroUnit[] = [];
for (let i = 0; i < N; i++) {
  if (at(i).g === "ا") continue;
  madSingles.push({ ar: at(i).g + FATHAH + ALIF, latin: `${at(i).c}aa`, codes: [syllableCode(i, "a")] });
  madSingles.push({ ar: at(i).g + KASRAH + YA, latin: `${at(i).c}ii`, codes: [syllableCode(i, "i")] });
  madSingles.push({ ar: at(i).g + DHAMMAH + WAW, latin: `${at(i).c}uu`, codes: [syllableCode(i, "u")] });
}
const madWords: IqroUnit[] = L.map((_, i) => {
  const a = ((i % N) + N) % N;
  const b = (a + 1) % N;
  return {
    ar: at(a).g + FATHAH + at(b).g + FATHAH + ALIF,
    latin: `${lat(at(a), "a")}${at(b).c}aa`,
    codes: [syllableCode(a, "a"), syllableCode(b, "a")],
  };
});
const jilid5 = [...madSingles, ...madWords];

// ── Jilid 6 — sukun & tasydid, incl. three-letter closed words ─────────────
const j6: IqroUnit[] = [];
for (let i = 0; i < N; i++) {
  if (at(i).g === "ا") continue;
  j6.push({ ar: ALIF + FATHAH + at(i).g + SUKUN, latin: `a${at(i).c}`, codes: [syllableCode(0, "a"), syllableCode(i, "a")] });
  j6.push({ ar: at(i).g + FATHAH + at(i).g + SHADDA, latin: `${at(i).c}a${at(i).c}${at(i).c}`, codes: [syllableCode(i, "a")] });
}
// three-letter words with a sukun in the middle: (i)a (i+1)ْ (i+2)a
for (let i = 0; i < N; i++) {
  const a = ((i % N) + N) % N;
  const b = (a + 1) % N;
  const cc = (a + 2) % N;
  j6.push({
    ar: at(a).g + FATHAH + at(b).g + SUKUN + at(cc).g + FATHAH,
    latin: `${lat(at(a), "a")}${at(b).c}${lat(at(cc), "a")}`,
    codes: [syllableCode(a, "a"), syllableCode(b, "a"), syllableCode(cc, "a")],
  });
}
const jilid6 = j6;

export const IQRO: IqroJilid[] = [
  { no: 1, title: "Jilid 1", focus: "Huruf berharakat fathah (a)", rows: chunk(jilid1) },
  { no: 2, title: "Jilid 2", focus: "Huruf sambung", rows: chunk(jilid2) },
  { no: 3, title: "Jilid 3", focus: "Kasrah (i), dhammah (u) & campuran", rows: chunk(jilid3) },
  { no: 4, title: "Jilid 4", focus: "Tanwin (an, in, un)", rows: chunk(jilid4) },
  { no: 5, title: "Jilid 5", focus: "Mad — bacaan panjang", rows: chunk(jilid5) },
  { no: 6, title: "Jilid 6", focus: "Sukun & tasydid", rows: chunk(jilid6) },
];

export const getJilid = (no: number): IqroJilid | undefined => IQRO.find((j) => j.no === no);
