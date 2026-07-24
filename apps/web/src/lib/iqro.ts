// A six-level "belajar membaca" (learn-to-read) ladder for Al-Qur'an Kids.
//
// The content here is GENERATED from the Arabic alphabet and the standard
// harakat — the language's own canonical building blocks (letters, fathah,
// kasrah, dhammah, tanwin, mad, sukun, tasydid) — following the ordinary
// beginner qiraah progression that every teacher uses. It is NOT a reproduction
// of any particular published primer; the drills are assembled programmatically
// below. Every unit is a real, correct Arabic syllable, spoken on tap with an
// Arabic voice.

const FATHAH = "َ"; // -a
const KASRAH = "ِ"; // -i
const DHAMMAH = "ُ"; // -u
const SUKUN = "ْ"; // consonant, no vowel
const TAN_FAT = "ً"; // -an
const TAN_KAS = "ٍ"; // -in
const TAN_DAM = "ٌ"; // -un
const SHADDA = "ّ"; // doubled consonant
const ALIF = "ا";
const YA = "ي";
const WAW = "و";

interface Letter {
  g: string; // glyph
  c: string; // consonant transliteration
}

// 28 letters with a simple Latin consonant value for the transliteration line.
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
const vowelled = (mark: string, suffix: string): IqroUnit[] =>
  L.map((x) => ({ ar: x.g + mark, latin: (x.c === "a" && suffix === "a" ? "aa" : x.c + suffix) }));

// Jilid 1 — every letter with fathah.
const jilid1: IqroUnit[][] = chunk(vowelled(FATHAH, "a"), 6);

// Jilid 2 — joined pairs (huruf sambung), fathah on both, so the child reads
// two connected letters as one little word: بَتَ ثَجَ …
const jilid2Units: IqroUnit[] = [];
for (let i = 0; i + 1 < L.length; i += 2) {
  const a = L[i]!;
  const b = L[i + 1]!;
  jilid2Units.push({ ar: a.g + FATHAH + b.g + FATHAH, latin: `${a.c}a${b.c}a` });
}
const jilid2: IqroUnit[][] = chunk(jilid2Units, 4);

// Jilid 3 — kasrah and dhammah.
const jilid3: IqroUnit[][] = [...chunk(vowelled(KASRAH, "i"), 6), ...chunk(vowelled(DHAMMAH, "u"), 6)];

// Jilid 4 — tanwin (an / in / un).
const jilid4Units: IqroUnit[] = [];
for (const x of L) {
  jilid4Units.push({ ar: x.g + TAN_FAT, latin: `${x.c === "a" ? "a" : x.c}an` });
  jilid4Units.push({ ar: x.g + TAN_KAS, latin: `${x.c === "a" ? "i" : x.c}in` });
  jilid4Units.push({ ar: x.g + TAN_DAM, latin: `${x.c === "a" ? "u" : x.c}un` });
}
const jilid4: IqroUnit[][] = chunk(jilid4Units, 6);

// Jilid 5 — mad (long vowels): letter + fathah + alif (aa), + kasrah + ya (ii),
// + dhammah + waw (uu).
const jilid5Units: IqroUnit[] = [];
for (const x of L) {
  if (x.g === "ا") continue;
  jilid5Units.push({ ar: x.g + FATHAH + ALIF, latin: `${x.c}aa` });
  jilid5Units.push({ ar: x.g + KASRAH + YA, latin: `${x.c}ii` });
  jilid5Units.push({ ar: x.g + DHAMMAH + WAW, latin: `${x.c}uu` });
}
const jilid5: IqroUnit[][] = chunk(jilid5Units, 6);

// Jilid 6 — sukun (closed syllable) and tasydid (doubled), the last steps
// before reading full āyāt. أَبْ (ab), بَبّ (babb) …
const jilid6Units: IqroUnit[] = [];
for (const x of L) {
  if (x.g === "ا") continue;
  jilid6Units.push({ ar: ALIF + FATHAH + x.g + SUKUN, latin: `a${x.c}` });
  jilid6Units.push({ ar: x.g + FATHAH + x.g + SHADDA, latin: `${x.c}a${x.c}${x.c}` });
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
