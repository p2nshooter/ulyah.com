// Deterministic tajwid rule detection over Uthmani Qur'an text.
//
// This is a rule engine, not a lookup table: it walks the Arabic string as
// (base letter + combining marks) units and flags the CLASSICAL, textually
// decidable rules — nun sakinah/tanwin rules (idgham, ikhfa, iqlab, izhar),
// mim sakinah rules (ikhfa syafawi, idgham mimi), ghunnah on nun/mim
// musyaddadah, qalqalah, and the explicit madd sign (~). Izhar is detected
// but NOT colored (in printed tajwid mushaf convention, izhar reads clear
// and stays black). Rules that need recitation context a text cannot carry
// (e.g. waqf-dependent madd 'aridh) are deliberately out of scope — better
// to mark less and be right than mark more and mislead.

export type TajwidRule =
  | "ghunnah"
  | "idgham-bighunnah"
  | "idgham-bilaghunnah"
  | "ikhfa"
  | "iqlab"
  | "ikhfa-syafawi"
  | "idgham-mimi"
  | "idgham-syamsiyah"
  | "qalqalah"
  | "madd"
  | "madd-wajib-muttasil"
  | "madd-jaiz-munfasil"
  | "madd-lazim";

export interface TajwidSegment {
  text: string;
  rule: TajwidRule | null;
}

export interface TajwidRuleInfo {
  color: string;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
}

// Colors follow the familiar Indonesian tajwid-mushaf palette family:
// distinct, dark enough to read on cream paper.
export const TAJWID_RULES: Record<TajwidRule, TajwidRuleInfo> = {
  ghunnah: {
    color: "#15803d",
    nameId: "Ghunnah",
    nameEn: "Ghunnah",
    descId: "Nun atau mim bertasydid (نّ / مّ) dibaca berdengung dua harakat.",
    descEn: "Nun or mim with shadda (نّ / مّ) is read with a two-count nasal sound.",
  },
  "idgham-bighunnah": {
    color: "#1d4ed8",
    nameId: "Idgham Bighunnah",
    nameEn: "Idgham with ghunnah",
    descId: "Nun sukun/tanwin bertemu ي ن م و: dileburkan ke huruf berikutnya dengan dengung.",
    descEn: "Nun sakinah/tanwin followed by ي ن م و merges into the next letter with a nasal sound.",
  },
  "idgham-bilaghunnah": {
    color: "#0f766e",
    nameId: "Idgham Bilaghunnah",
    nameEn: "Idgham without ghunnah",
    descId: "Nun sukun/tanwin bertemu ل atau ر: dileburkan tanpa dengung.",
    descEn: "Nun sakinah/tanwin followed by ل or ر merges without a nasal sound.",
  },
  ikhfa: {
    color: "#7e22ce",
    nameId: "Ikhfa Haqiqi",
    nameEn: "Ikhfa",
    descId: "Nun sukun/tanwin bertemu salah satu 15 huruf ikhfa: dibaca samar-samar dengan dengung.",
    descEn: "Nun sakinah/tanwin before one of the 15 ikhfa letters is read lightly concealed, with a nasal sound.",
  },
  iqlab: {
    color: "#c2410c",
    nameId: "Iqlab",
    nameEn: "Iqlab",
    descId: "Nun sukun/tanwin bertemu ب: bunyinya berubah menjadi mim dengan dengung.",
    descEn: "Nun sakinah/tanwin before ب converts to a mim sound with a nasal sound.",
  },
  "ikhfa-syafawi": {
    color: "#a21caf",
    nameId: "Ikhfa Syafawi",
    nameEn: "Ikhfa shafawi",
    descId: "Mim sukun bertemu ب: dibaca samar di bibir dengan dengung.",
    descEn: "Mim sakinah before ب is read lightly concealed at the lips with a nasal sound.",
  },
  "idgham-mimi": {
    color: "#0e7490",
    nameId: "Idgham Mimi",
    nameEn: "Idgham mimi",
    descId: "Mim sukun bertemu م: dileburkan menjadi mim bertasydid dengan dengung.",
    descEn: "Mim sakinah before م merges into a doubled mim with a nasal sound.",
  },
  "idgham-syamsiyah": {
    color: "#be185d",
    nameId: "Idgham Syamsiyah (Lam Syamsiyah)",
    nameEn: "Idgham shamsiyyah (sun-letter lam)",
    descId: "Alif-lam (ال) bertemu huruf syamsiah: huruf lam tidak dibaca, langsung ke huruf berikutnya yang bertasydid.",
    descEn: "The definite article ال before a 'sun letter': the lam is silent and merges into the next (doubled) letter.",
  },
  qalqalah: {
    color: "#b91c1c",
    nameId: "Qalqalah",
    nameEn: "Qalqalah",
    descId: "Huruf ق ط ب ج د bersukun: dibaca memantul. (Di akhir waqaf disebut qalqalah kubra, di tengah kata qalqalah sughra.)",
    descEn: "The letters ق ط ب ج د with sukun are read with an echoing bounce (kubra at a stop, sughra mid-word).",
  },
  madd: {
    color: "#92400e",
    nameId: "Madd",
    nameEn: "Madd",
    descId: "Tanda madd (ٓ) atau alif madd (آ): bacaan dipanjangkan. Mad thabi'i 2 harakat; jenis mad lain lihat panduan.",
    descEn: "The madd sign (ٓ) or alef-madda (آ): the vowel is lengthened. Natural madd is 2 counts; see the guide for the other types.",
  },
  "madd-wajib-muttasil": {
    color: "#9a3412",
    nameId: "Mad Wajib Muttasil",
    nameEn: "Madd wajib muttasil",
    descId: "Mad bertemu hamzah (ء) dalam satu kata: wajib dipanjangkan 4–5 harakat.",
    descEn: "Madd followed by hamza (ء) within the same word: obligatorily lengthened 4–5 counts.",
  },
  "madd-jaiz-munfasil": {
    color: "#b45309",
    nameId: "Mad Jaiz Munfasil",
    nameEn: "Madd jaiz munfasil",
    descId: "Mad di akhir kata dan hamzah (ء) di awal kata berikutnya: boleh dipanjangkan 2, 4, atau 5 harakat.",
    descEn: "Madd at a word's end with hamza at the start of the next word: may be lengthened 2, 4, or 5 counts.",
  },
  "madd-lazim": {
    color: "#7c2d12",
    nameId: "Mad Lazim",
    nameEn: "Madd lazim",
    descId: "Mad bertemu huruf bertasydid atau bersukun: dipanjangkan 6 harakat.",
    descEn: "Madd followed by a letter carrying shadda or sukun: lengthened a full 6 counts.",
  },
};

// Uthmani/Indopak texts (including our D1 ayah text) mark a resting consonant
// with a small high zero/head (U+06E1 etc.) rather than the plain sukun U+0652,
// so recognise all of them or qalqalah + mim-sakinah rules would be silently
// missed on real text.
const SUKUN_MARKS = new Set(["ْ", "ۡ", "۟", "۠"]);
const SHADDA = "ّ";
const MADDA = "ٓ";
const TANWIN = new Set(["ً", "ٌ", "ٍ"]); // fathatan, dammatan, kasratan
const HIGH_MIM = "ۢ"; // Uthmani iqlab marker (small high meem)

const QALQALAH_LETTERS = new Set(["ق", "ط", "ب", "ج", "د"]);
const IDGHAM_GHUNNAH = new Set(["ي", "ن", "م", "و"]);
const IDGHAM_NO_GHUNNAH = new Set(["ل", "ر"]);
const IKHFA_LETTERS = new Set(["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"]);
const IZHAR_LETTERS = new Set(["ء", "أ", "إ", "ه", "ع", "ح", "غ", "خ"]);
// Hamza in its various written forms — the trigger for mad muttasil/munfasil.
const HAMZA = new Set(["ء", "أ", "إ", "ئ", "ؤ"]);
// The 14 "sun letters": after the definite article ال the lam assimilates.
const SUN_LETTERS = new Set(["ت", "ث", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ل", "ن"]);
// Alef forms that begin the definite article (plain alef + alef-wasla + hamza).
const ARTICLE_ALEF = new Set(["ا", "ٱ", "أ", "إ"]);

function isCombining(ch: string): boolean {
  const c = ch.codePointAt(0)!;
  // Arabic combining marks: harakat/tanwin/sukun/shadda (0610-061A, 064B-065F),
  // superscript alef (0670), Qur'anic annotation marks (06D6-06ED).
  return (
    (c >= 0x0610 && c <= 0x061a) ||
    (c >= 0x064b && c <= 0x065f) ||
    c === 0x0670 ||
    (c >= 0x06d6 && c <= 0x06ed) ||
    (c >= 0x08d3 && c <= 0x08ff)
  );
}

interface Unit {
  base: string; // the base letter ("" for a space/other run)
  raw: string; // base + its combining marks (or the whitespace run)
  isSpace: boolean;
  marks: Set<string>;
}

function toUnits(text: string): Unit[] {
  const units: Unit[] = [];
  for (const ch of text) {
    if (isCombining(ch) && units.length > 0 && !units[units.length - 1]!.isSpace) {
      const u = units[units.length - 1]!;
      u.raw += ch;
      u.marks.add(ch);
    } else if (/\s/.test(ch)) {
      const last = units[units.length - 1];
      if (last?.isSpace) last.raw += ch;
      else units.push({ base: "", raw: ch, isSpace: true, marks: new Set() });
    } else {
      units.push({ base: ch, raw: ch, isSpace: false, marks: new Set() });
    }
  }
  return units;
}

/** The next LETTER unit after index i (skipping spaces); null at end. */
function nextLetter(units: Unit[], i: number): Unit | null {
  for (let j = i + 1; j < units.length; j++) {
    const u = units[j]!;
    if (!u.isSpace && u.base !== "") {
      // Skip ayah-end markers and ornaments (non-letters like ۝).
      if (/[ء-ي]/.test(u.base)) return u;
    }
  }
  return null;
}

/** Like nextLetter, but also reports whether a space (word boundary) was
 *  crossed on the way — needed to tell mad muttasil (same word) from mad
 *  munfasil (across a word boundary). */
function nextLetterAcross(units: Unit[], i: number): { u: Unit | null; boundary: boolean } {
  let boundary = false;
  for (let j = i + 1; j < units.length; j++) {
    const u = units[j]!;
    if (u.isSpace) {
      boundary = true;
      continue;
    }
    if (u.base !== "" && /[ء-ي]/.test(u.base)) return { u, boundary };
  }
  return { u: null, boundary };
}

/** The previous LETTER unit before index i (skipping spaces); null at start. */
function prevLetter(units: Unit[], i: number): Unit | null {
  for (let j = i - 1; j >= 0; j--) {
    const u = units[j]!;
    if (!u.isSpace && u.base !== "" && /[ء-ي]/.test(u.base)) return u;
  }
  return null;
}

function hasVowel(u: Unit): boolean {
  return ["َ", "ُ", "ِ"].some((m) => u.marks.has(m)) || u.marks.has(SHADDA);
}
/** True if the unit carries any of the Uthmani sukun-family marks. */
function hasSukun(u: Unit): boolean {
  for (const m of SUKUN_MARKS) if (u.marks.has(m)) return true;
  return false;
}

/**
 * Split one ayah's Uthmani text into contiguous segments, each either plain
 * (rule: null) or carrying a tajwid rule. Two-unit rules (e.g. nun sakinah +
 * its trigger letter) color BOTH units as one segment, matching how printed
 * tajwid mushaf shade the whole cluster.
 */
export function analyzeTajwid(text: string): TajwidSegment[] {
  const units = toUnits(text);
  const ruleAt: (TajwidRule | null)[] = new Array(units.length).fill(null);

  for (let i = 0; i < units.length; i++) {
    const u = units[i]!;
    if (u.isSpace || !u.base) continue;

    // Ghunnah: nun/mim musyaddadah.
    if ((u.base === "ن" || u.base === "م") && u.marks.has(SHADDA)) {
      ruleAt[i] = ruleAt[i] ?? "ghunnah";
    }

    // Madd sign — either the combining madda mark (ـٓ) or the precomposed
    // alef-with-madda letter (آ). Classify the branch (far'i) type by what
    // follows: hamza in the same word → wajib muttasil; hamza across a word
    // boundary → jaiz munfasil; a letter carrying shadda/sukun → lazim (6
    // counts). Anything else stays the generic madd (thabi'i/badal).
    if (u.marks.has(MADDA) || u.base === "آ") {
      let mrule: TajwidRule = "madd";
      const { u: mn, boundary } = nextLetterAcross(units, i);
      if (mn) {
        if (HAMZA.has(mn.base)) mrule = boundary ? "madd-jaiz-munfasil" : "madd-wajib-muttasil";
        else if (mn.marks.has(SHADDA) || hasSukun(mn)) mrule = "madd-lazim";
      }
      ruleAt[i] = mrule;
    }

    // Qalqalah: explicit sukun on one of the five letters.
    if (QALQALAH_LETTERS.has(u.base) && hasSukun(u)) {
      ruleAt[i] = "qalqalah";
    }

    // Lam ta'rif syamsiyah: the definite-article lam (preceded by the article
    // alef, itself unvowelled) before a "sun letter" that carries shadda — the
    // lam is silent and the cluster is read as the doubled sun letter. Only the
    // clearly-written form (alef + lam + sun-letter-with-shadda) is marked; the
    // fully-merged spelling (e.g. الَّذين) is left alone rather than risk a
    // wrong call.
    if (u.base === "ل" && !hasVowel(u) && !hasSukun(u)) {
      const prev = prevLetter(units, i);
      const nx = nextLetter(units, i);
      if (prev && ARTICLE_ALEF.has(prev.base) && nx && SUN_LETTERS.has(nx.base) && nx.marks.has(SHADDA)) {
        ruleAt[i] = ruleAt[i] ?? "idgham-syamsiyah";
        const j = units.indexOf(nx);
        ruleAt[j] = ruleAt[j] ?? "idgham-syamsiyah";
      }
    }

    // Nun sakinah / tanwin family. Uthmani script writes nun sakinah subject
    // to idgham/ikhfa WITHOUT a sukun sign (bare nun) — so treat "nun with
    // no vowel and no sukun" as sakinah too when a trigger letter follows.
    const isTanwin = [...TANWIN].some((m) => u.marks.has(m)) || u.marks.has(HIGH_MIM);
    const isNunSakinah = u.base === "ن" && !hasVowel(u) && !u.marks.has(MADDA);
    if (isTanwin || isNunSakinah) {
      const nx = nextLetter(units, i);
      if (nx) {
        const j = units.indexOf(nx);
        let rule: TajwidRule | null = null;
        if (u.marks.has(HIGH_MIM) || nx.base === "ب") rule = "iqlab";
        else if (IDGHAM_GHUNNAH.has(nx.base)) rule = "idgham-bighunnah";
        else if (IDGHAM_NO_GHUNNAH.has(nx.base)) rule = "idgham-bilaghunnah";
        else if (IKHFA_LETTERS.has(nx.base)) rule = "ikhfa";
        else if (IZHAR_LETTERS.has(nx.base)) rule = null; // izhar reads clear — stays black
        if (rule) {
          ruleAt[i] = rule;
          if (!isTanwin || rule !== null) ruleAt[j] = ruleAt[j] ?? rule;
        }
      }
    }

    // Mim sakinah family (explicit sukun or bare mim before ب/م).
    const isMimSakinah = u.base === "م" && !hasVowel(u) && (hasSukun(u) || u.marks.size === 0);
    if (isMimSakinah) {
      const nx = nextLetter(units, i);
      if (nx) {
        const j = units.indexOf(nx);
        if (nx.base === "ب") {
          ruleAt[i] = "ikhfa-syafawi";
          ruleAt[j] = ruleAt[j] ?? "ikhfa-syafawi";
        } else if (nx.base === "م") {
          ruleAt[i] = "idgham-mimi";
          ruleAt[j] = ruleAt[j] ?? "idgham-mimi";
        }
      }
    }
  }

  // Collapse consecutive units sharing the same rule into segments.
  const segments: TajwidSegment[] = [];
  for (let i = 0; i < units.length; i++) {
    const u = units[i]!;
    const rule = u.isSpace ? (segments[segments.length - 1]?.rule ?? null) : ruleAt[i];
    const last = segments[segments.length - 1];
    // A space between two units of the SAME rule stays inside the colored
    // segment (nun sakinah rules cross word boundaries); otherwise spaces
    // fall back to plain.
    const effective = u.isSpace ? (last && i + 1 < units.length && ruleAt[i + 1] === last.rule ? last.rule : null) : rule;
    if (last && last.rule === effective) last.text += u.raw;
    else segments.push({ text: u.raw, rule: effective });
  }
  return segments;
}
