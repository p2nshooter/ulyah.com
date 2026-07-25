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
  { g: "ظ", c: "zh" }, { g: "ع", c: "'" }, { g: "غ", c: "gh" }, { g: "ف", c: "f" },
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
  /** Rows of six drills. The level's TITLE and FOCUS text are not stored here:
   *  they are language, and live in lib/iqro-labels.ts so every locale gets them. */
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
const buildJilid1 = () => [...singles("a"), ...doubles("a"), ...pairs("a")];

// ── Jilid 2 — huruf sambung: pairs (step 1 & 3) and triples ────────────────
const buildJilid2 = () => [...pairs("a", 1), ...pairs("a", 3), ...triples("a", 1)];

// ── Jilid 3 — kasrah & dhammah: singles, doubles, joined ───────────────────
const buildJilid3 = () => [
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
const buildJilid4 = (): IqroUnit[] => {
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
  return [...tanwinSingles, ...tanwinWords];
};

// ── Jilid 5 — mad (long vowels): base + mad, and words containing mad ──────
const buildJilid5 = (): IqroUnit[] => {
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
  return [...madSingles, ...madWords];
};

// ── Jilid 6 — sukun & tasydid, incl. three-letter closed words ─────────────
const buildJilid6 = (): IqroUnit[] => {
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
  return j6;
};

// ── Jilid 7-10 — the tajwid practice ladder ───────────────────────────────
// The classic primer ends at six. A child who finishes it still has to learn
// how letters actually SOUND together, so the ladder continues into the
// reading rules the Mushaf colours (see lib/tajwid.ts): nun & mim sakinah,
// qalqalah, ghunnah, and the branch madd. Same principle as levels 1-6 —
// every drill is generated from the canonical building blocks and is a real,
// correct Arabic syllable, not a reproduction of any published book.
const idxOf = (g: string): number => L.findIndex((x) => x.g === g);
const NUN_I = idxOf("ن");
const MIM_I = idxOf("م");

/** base(a) + nun sukun + trigger(a) — e.g. مَنْتَ, the shape every nun-sakinah
 *  rule is drilled on. */
const nunSukunDrills = (triggers: string[], baseGlyph = "م"): IqroUnit[] => {
  const b = idxOf(baseGlyph);
  return triggers.map((t) => {
    const ti = idxOf(t);
    return {
      ar: at(b).g + MARK.a + "ن" + SUKUN + at(ti).g + MARK.a,
      latin: `${lat(at(b), "a")}n${lat(at(ti), "a")}`,
      codes: [syllableCode(b, "a"), syllableCode(NUN_I, "a"), syllableCode(ti, "a")],
    };
  });
};

/** base(a) + mim sukun + trigger(a) — e.g. مَمْبَ. */
const mimSukunDrills = (triggers: string[], baseGlyph = "م"): IqroUnit[] => {
  const b = idxOf(baseGlyph);
  return triggers.map((t) => {
    const ti = idxOf(t);
    return {
      ar: at(b).g + MARK.a + "م" + SUKUN + at(ti).g + MARK.a,
      latin: `${lat(at(b), "a")}m${lat(at(ti), "a")}`,
      codes: [syllableCode(b, "a"), syllableCode(MIM_I, "a"), syllableCode(ti, "a")],
    };
  });
};

/** base(a) + qalqalah letter with sukun — e.g. مَقْ, read with a bounce. */
const qalqalahDrills = (): IqroUnit[] =>
  ["ق", "ط", "ب", "ج", "د"].flatMap((g) =>
    ["م", "ب", "ي"].map((baseGlyph) => {
      const b = idxOf(baseGlyph);
      const qi = idxOf(g);
      return {
        ar: at(b).g + MARK.a + at(qi).g + SUKUN,
        latin: `${lat(at(b), "a")}${at(qi).c}`,
        codes: [syllableCode(b, "a"), syllableCode(qi, "a")],
      };
    })
  );

/** base(a) + nun/mim with shadda + fathah — e.g. بَنَّ, held with a hum. */
const ghunnahDrills = (): IqroUnit[] =>
  ["ب", "ت", "ج", "س", "ك", "ل"].flatMap((baseGlyph) =>
    [NUN_I, MIM_I].map((gi) => {
      const b = idxOf(baseGlyph);
      return {
        ar: at(b).g + MARK.a + at(gi).g + SHADDA + MARK.a,
        latin: `${lat(at(b), "a")}${at(gi).c}${at(gi).c}a`,
        codes: [syllableCode(b, "a"), syllableCode(gi, "a")],
      };
    })
  );

/** mad + hamzah in one word — e.g. جَاءَ (mad wajib muttasil, 4-5 harakat). */
const maddMuttasilDrills = (): IqroUnit[] =>
  ["ج", "س", "ش", "ب", "ن", "م", "د"].map((g) => {
    const i = idxOf(g);
    return {
      ar: at(i).g + MARK.a + ALIF + "ء" + MARK.a,
      latin: `${lat(at(i), "a")}a'a`,
      codes: [syllableCode(i, "a")],
    };
  });

/** mad followed by a doubled letter — e.g. مَالِّ (mad lazim, 6 harakat). */
const maddLazimDrills = (): IqroUnit[] =>
  ["ل", "م", "ن", "ب", "ت", "س"].map((g) => {
    const i = idxOf(g);
    const b = idxOf("م");
    return {
      ar: at(b).g + MARK.a + ALIF + at(i).g + SHADDA + MARK.i,
      latin: `maa${at(i).c}${at(i).c}i`,
      codes: [syllableCode(b, "a"), syllableCode(i, "i")],
    };
  });

/** tanwin + trigger — the SAME nun-sakinah rule, written the other way, which
 *  is the half most beginners never get drilled on. e.g. مًا تَ → مًا تَ. */
const tanwinDrills = (triggers: string[], baseGlyph = "م", tan = TAN_FAT): IqroUnit[] => {
  const b = idxOf(baseGlyph);
  const h: Hk = tan === TAN_FAT ? "a" : tan === TAN_KAS ? "i" : "u";
  return triggers.map((t) => {
    const ti = idxOf(t);
    return {
      ar: at(b).g + MARK[h] + tan + " " + at(ti).g + MARK.a,
      latin: `${lat(at(b), h)}n ${lat(at(ti), "a")}`,
      codes: [syllableCode(b, h), syllableCode(ti, "a")],
    };
  });
};

/** base(a) + qalqalah letter with sukun + closing letter — qalqalah sughra,
 *  the bounce that happens in the MIDDLE of a word. */
const qalqalahSughra = (bases: string[]): IqroUnit[] =>
  QALQALAH_L.flatMap((g) =>
    bases.map((baseGlyph) => {
      const b = idxOf(baseGlyph);
      const qi = idxOf(g);
      const c = (b + 3) % N;
      return {
        ar: at(b).g + MARK.a + at(qi).g + SUKUN + at(c).g + MARK.a,
        latin: `${lat(at(b), "a")}${at(qi).c}${lat(at(c), "a")}`,
        codes: [syllableCode(b, "a"), syllableCode(qi, "a"), syllableCode(c, "a")],
      };
    })
  );

/** base + qalqalah letter carrying shadda + sukun at a stop — qalqalah kubra
 *  in its strongest form (as at the end of سورة المسد). */
const qalqalahKubraShadda = (bases: string[]): IqroUnit[] =>
  QALQALAH_L.flatMap((g) =>
    bases.map((baseGlyph) => {
      const b = idxOf(baseGlyph);
      const qi = idxOf(g);
      return {
        ar: at(b).g + MARK.a + at(qi).g + SHADDA + SUKUN,
        latin: `${lat(at(b), "a")}${at(qi).c}${at(qi).c}`,
        codes: [syllableCode(b, "a"), syllableCode(qi, "a")],
      };
    })
  );

/** nun/mim with shadda across all three vowels — ghunnah held two harakat. */
const ghunnahVowels = (bases: string[]): IqroUnit[] =>
  bases.flatMap((baseGlyph) =>
    [NUN_I, MIM_I].flatMap((gi) =>
      (["a", "i", "u"] as Hk[]).map((h) => {
        const b = idxOf(baseGlyph);
        return {
          ar: at(b).g + MARK.a + at(gi).g + SHADDA + MARK[h],
          latin: `${lat(at(b), "a")}${at(gi).c}${at(gi).c}${h}`,
          codes: [syllableCode(b, "a"), syllableCode(gi, h)],
        };
      })
    )
  );

/** The plain 2-harakat mad, all three forms — the base every branch mad grows
 *  from, so jilid 10 starts by re-grounding it. */
const madThabiiDrills = (letters: string[]): IqroUnit[] =>
  letters.flatMap((g) => {
    const i = idxOf(g);
    return [
      { ar: at(i).g + FATHAH + ALIF, latin: `${at(i).c}aa`, codes: [syllableCode(i, "a")] },
      { ar: at(i).g + KASRAH + YA + SUKUN, latin: `${at(i).c}ii`, codes: [syllableCode(i, "i")] },
      { ar: at(i).g + DHAMMAH + WAW + SUKUN, latin: `${at(i).c}uu`, codes: [syllableCode(i, "u")] },
    ];
  });

/** mad at the end of a word meeting a hamzah at the start of the next —
 *  mad jaiz munfasil, 4-5 harakat. */
const maddMunfasilDrills = (letters: string[]): IqroUnit[] =>
  letters.map((g) => {
    const i = idxOf(g);
    return {
      ar: at(i).g + FATHAH + ALIF + " " + "أ" + FATHAH + at(i).g + MARK.a,
      latin: `${at(i).c}aa a${lat(at(i), "a")}`,
      codes: [syllableCode(i, "a"), syllableCode(i, "a")],
    };
  });

/** tanwin fathah read as a long "aa" when you stop on it — mad 'iwadh. */
const maddIwadhDrills = (letters: string[]): IqroUnit[] =>
  letters.map((g) => {
    const i = idxOf(g);
    return {
      ar: at(i).g + FATHAH + at(i).g + TAN_FAT + ALIF,
      latin: `${lat(at(i), "a")}${at(i).c}aa`,
      codes: [syllableCode(i, "a"), syllableCode(i, "a")],
    };
  });

/** hamzah followed by its own mad — mad badal, 2 harakat. */
const maddBadalDrills = (letters: string[]): IqroUnit[] =>
  letters.map((g) => {
    const i = idxOf(g);
    return {
      ar: "آ" + at(i).g + MARK.a + at(i).g + MARK.a,
      latin: `aa${lat(at(i), "a")}${lat(at(i), "a")}`,
      codes: [syllableCode(0, "a"), syllableCode(i, "a")],
    };
  });

/** mad meeting a sukun only because you stopped there — mad 'aridh lissukun,
 *  2, 4 or 6 harakat at the reader's choice. */
const AR_CLOSERS = ["ب", "ت", "د", "ر", "س", "ك", "ل", "م", "ن"];
const maddAridhDrills = (letters: string[]): IqroUnit[] =>
  letters.map((g, k) => {
    const i = idxOf(g);
    const c = idxOf(AR_CLOSERS[(k + 1) % AR_CLOSERS.length]!);
    return {
      ar: at(i).g + FATHAH + ALIF + at(c).g + SUKUN,
      latin: `${at(i).c}aa${at(c).c}`,
      codes: [syllableCode(i, "a"), syllableCode(c, "a")],
    };
  });

/** the ه of a pronoun stretched before the next word — mad shilah shughra. */
const maddShilahDrills = (letters: string[]): IqroUnit[] =>
  letters.map((g) => {
    const i = idxOf(g);
    const hi = idxOf("ه");
    return {
      ar: at(i).g + MARK.a + at(hi).g + DHAMMAH + WAW + SUKUN,
      latin: `${lat(at(i), "a")}huu`,
      codes: [syllableCode(i, "a"), syllableCode(hi, "u")],
    };
  });

const IKHFA_L = ["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"];
const IDGHAM_GH_L = ["ي", "ن", "م", "و"];
const IDGHAM_NOGH_L = ["ل", "ر"];
const IZHAR_L = ["ه", "ع", "ح", "غ", "خ"];
const QALQALAH_L = ["ق", "ط", "ب", "ج", "د"];
/** Every letter EXCEPT ب and م — mim sukun before any of these is izhar syafawi. */
const IZHAR_SYAFAWI_L = L.map((x) => x.g).filter((g) => g !== "ب" && g !== "م");

// Jilid 7 — ikhfa, the biggest single nun-sakinah rule (15 of the 28 letters).
// Drilled on four different opening letters and in BOTH spellings (nun sukun
// and tanwin), which is what makes the level as long and as thorough as the
// classic jilid 6 rather than a token page.
const buildJilid7 = () => [
  ...nunSukunDrills(IKHFA_L, "م"),
  ...nunSukunDrills(IKHFA_L, "ب"),
  ...nunSukunDrills(IKHFA_L, "ع"),
  ...nunSukunDrills(IKHFA_L, "ك"),
  ...tanwinDrills(IKHFA_L, "م", TAN_FAT),
  ...tanwinDrills(IKHFA_L, "ب", TAN_KAS),
];

// Jilid 8 — the remaining nun-sakinah rules (idgham with and without ghunnah,
// iqlab, izhar halqi) in both spellings, then the three mim-sakinah rules.
const buildJilid8 = () => [
  ...nunSukunDrills(IDGHAM_GH_L, "م"),
  ...nunSukunDrills(IDGHAM_GH_L, "ب"),
  ...nunSukunDrills(IDGHAM_GH_L, "ك"),
  ...nunSukunDrills(IDGHAM_NOGH_L, "م"),
  ...nunSukunDrills(IDGHAM_NOGH_L, "ب"),
  ...nunSukunDrills(IDGHAM_NOGH_L, "ك"),
  ...nunSukunDrills(["ب"], "م"), // iqlab: nun sukun before ب becomes a mim
  ...nunSukunDrills(["ب"], "ع"),
  ...nunSukunDrills(["ب"], "ك"),
  ...nunSukunDrills(IZHAR_L, "م"),
  ...nunSukunDrills(IZHAR_L, "ب"),
  ...nunSukunDrills(IZHAR_L, "ك"),
  ...tanwinDrills(IDGHAM_GH_L, "م", TAN_FAT),
  ...tanwinDrills(IDGHAM_NOGH_L, "م", TAN_KAS),
  ...tanwinDrills(["ب"], "م", TAN_DAM),
  ...tanwinDrills(IZHAR_L, "ب", TAN_FAT),
  // mim sakinah: ikhfa syafawi (before ب), idgham mimi (before م), then izhar
  // syafawi — every OTHER letter, read plainly with the lips closed.
  ...mimSukunDrills(["ب"], "م"),
  ...mimSukunDrills(["ب"], "ع"),
  ...mimSukunDrills(["ب"], "ك"),
  ...mimSukunDrills(["م"], "ع"),
  ...mimSukunDrills(["م"], "ك"),
  ...mimSukunDrills(IZHAR_SYAFAWI_L, "م"),
];

// Jilid 9 — qalqalah in both strengths (sughra in the middle of a word, kubra
// at a stop, and the doubled kubra) and ghunnah across all three vowels.
const buildJilid9 = () => [
  ...qalqalahDrills(),
  ...qalqalahSughra(["م", "ي", "ع", "ك", "ت"]),
  ...qalqalahKubraShadda(["م", "ي"]),
  ...ghunnahDrills(),
  ...ghunnahVowels(["م", "ع", "ك", "ي", "ت", "س"]),
];

// Jilid 10 — the mad family end to end: the plain 2-harakat mad first, then
// every branch mad a reader actually meets, up to the 6-harakat mad lazim.
const buildJilid10 = () => [
  ...madThabiiDrills(["ب", "ت", "ج", "د", "ر", "س", "ك", "ل", "م", "ن"]),
  ...maddMuttasilDrills(),
  ...maddMunfasilDrills(["ب", "ت", "ج", "د", "ر", "س", "ك", "م"]),
  ...maddIwadhDrills(["ب", "ت", "ج", "د", "ر", "س", "ك", "ل", "م", "ن"]),
  ...maddBadalDrills(["ب", "ت", "ج", "د", "ر", "س", "ك", "م"]),
  ...maddAridhDrills(["ب", "ت", "ج", "د", "ر", "س", "ك", "ل", "م", "ن"]),
  ...maddShilahDrills(["ب", "ت", "ج", "د", "ر", "س", "ك", "م"]),
  ...maddLazimDrills(),
];

/**
 * Each level is built ON DEMAND, and only once.
 *
 * Building all ten eagerly at import cost 37 ms of CPU — and Cloudflare's free
 * plan allows 10 ms per request. Both the Kids page and the landing page import
 * this module just to print "10 jilid", so every cold isolate spent its entire
 * budget assembling a thousand drills nobody had asked for and the page died
 * with Error 1102. The count is a plain number now, and a level is only
 * assembled when somebody actually opens it.
 */
const BUILDERS: Record<number, () => IqroUnit[]> = {
  1: buildJilid1,
  2: buildJilid2,
  3: buildJilid3,
  4: buildJilid4,
  5: buildJilid5,
  6: buildJilid6,
  7: buildJilid7,
  8: buildJilid8,
  9: buildJilid9,
  10: buildJilid10,
};

/** The level numbers, for menus and generateStaticParams — costs nothing. */
export const JILID_NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** How many levels there are. Use this instead of IQRO.length to show a count:
 *  it needs no drills built. */
export const IQRO_COUNT = JILID_NUMBERS.length;

const built = new Map<number, IqroJilid>();

export const getJilid = (no: number): IqroJilid | undefined => {
  const build = BUILDERS[no];
  if (!build) return undefined;
  const hit = built.get(no);
  if (hit) return hit;
  const jilid: IqroJilid = { no, rows: chunk(build()) };
  built.set(no, jilid);
  return jilid;
};
