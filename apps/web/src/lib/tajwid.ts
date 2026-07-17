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
  | "qalqalah"
  | "madd";

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
  qalqalah: {
    color: "#b91c1c",
    nameId: "Qalqalah",
    nameEn: "Qalqalah",
    descId: "Huruf ق ط ب ج د bersukun: dibaca memantul.",
    descEn: "The letters ق ط ب ج د with sukun are read with an echoing bounce.",
  },
  madd: {
    color: "#92400e",
    nameId: "Madd (tanda ~)",
    nameEn: "Madd (the ~ sign)",
    descId: "Tanda madd (ٓ): bacaan dipanjangkan 4–6 harakat.",
    descEn: "The madd sign (ٓ) lengthens the vowel to 4–6 counts.",
  },
};

const SUKUN = "ْ";
const SHADDA = "ّ";
const MADDA = "ٓ";
const TANWIN = new Set(["ً", "ٌ", "ٍ"]); // fathatan, dammatan, kasratan
const HIGH_MIM = "ۢ"; // Uthmani iqlab marker (small high meem)

const QALQALAH_LETTERS = new Set(["ق", "ط", "ب", "ج", "د"]);
const IDGHAM_GHUNNAH = new Set(["ي", "ن", "م", "و"]);
const IDGHAM_NO_GHUNNAH = new Set(["ل", "ر"]);
const IKHFA_LETTERS = new Set(["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"]);
const IZHAR_LETTERS = new Set(["ء", "أ", "إ", "ه", "ع", "ح", "غ", "خ"]);

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

function hasVowel(u: Unit): boolean {
  return ["َ", "ُ", "ِ"].some((m) => u.marks.has(m)) || u.marks.has(SHADDA);
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
    // alef-with-madda letter (آ), depending on how the source text encodes it.
    if (u.marks.has(MADDA) || u.base === "آ") {
      ruleAt[i] = "madd";
    }

    // Qalqalah: explicit sukun on one of the five letters.
    if (QALQALAH_LETTERS.has(u.base) && u.marks.has(SUKUN)) {
      ruleAt[i] = "qalqalah";
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
    const isMimSakinah = u.base === "م" && !hasVowel(u) && (u.marks.has(SUKUN) || u.marks.size === 0);
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
