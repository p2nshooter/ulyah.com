/**
 * "Tumbuh Huruf" — the ladder a child actually climbs when learning to read:
 * a single letter grows into a syllable, then a word, then a whole phrase
 * (owner: "memelihara huruf dari satu sampai jadi satu kalimat").
 *
 * Each tier is a real step in qiraah, and every item here is genuine, correct
 * Arabic — the syllables are built from the canonical letters + harakat, and
 * the words/phrases at the top tiers are ones a child meets in the Qur'an
 * itself. Nothing is invented for the sake of the game.
 */

export interface GrowItem {
  /** What the child must assemble, split into the pieces they tap in order. */
  parts: string[];
  /** The finished form, shown once assembled. */
  whole: string;
  /** Plain reading hint. */
  latin: string;
  /** Short meaning, for the tiers where it helps. */
  meaning?: { id: string; en: string };
}

const FATHAH = "َ";
const KASRAH = "ِ";
const DHAMMAH = "ُ";
const SUKUN = "ْ";
const SHADDA = "ّ";

/** Tier 0 — one letter, one sound. */
export const TIER0: GrowItem[] = [
  { parts: ["ب" + FATHAH], whole: "ب" + FATHAH, latin: "ba" },
  { parts: ["ت" + FATHAH], whole: "ت" + FATHAH, latin: "ta" },
  { parts: ["ج" + FATHAH], whole: "ج" + FATHAH, latin: "ja" },
  { parts: ["د" + FATHAH], whole: "د" + FATHAH, latin: "da" },
  { parts: ["ر" + FATHAH], whole: "ر" + FATHAH, latin: "ra" },
  { parts: ["س" + FATHAH], whole: "س" + FATHAH, latin: "sa" },
  { parts: ["ك" + FATHAH], whole: "ك" + FATHAH, latin: "ka" },
  { parts: ["ل" + FATHAH], whole: "ل" + FATHAH, latin: "la" },
  { parts: ["م" + FATHAH], whole: "م" + FATHAH, latin: "ma" },
  { parts: ["ن" + FATHAH], whole: "ن" + FATHAH, latin: "na" },
];

/** Tier 1 — the same letter across the three short vowels. */
export const TIER1: GrowItem[] = [
  { parts: ["ب" + FATHAH, "ب" + KASRAH, "ب" + DHAMMAH], whole: "بَ بِ بُ", latin: "ba bi bu" },
  { parts: ["ت" + FATHAH, "ت" + KASRAH, "ت" + DHAMMAH], whole: "تَ تِ تُ", latin: "ta ti tu" },
  { parts: ["س" + FATHAH, "س" + KASRAH, "س" + DHAMMAH], whole: "سَ سِ سُ", latin: "sa si su" },
  { parts: ["ك" + FATHAH, "ك" + KASRAH, "ك" + DHAMMAH], whole: "كَ كِ كُ", latin: "ka ki ku" },
  { parts: ["م" + FATHAH, "م" + KASRAH, "م" + DHAMMAH], whole: "مَ مِ مُ", latin: "ma mi mu" },
  { parts: ["ن" + FATHAH, "ن" + KASRAH, "ن" + DHAMMAH], whole: "نَ نِ نُ", latin: "na ni nu" },
];

/** Tier 2 — two syllables joined into a short real word. */
export const TIER2: GrowItem[] = [
  { parts: ["كَ", "تَبَ"], whole: "كَتَبَ", latin: "kataba", meaning: { id: "menulis", en: "he wrote" } },
  { parts: ["قَ", "لَمٌ"], whole: "قَلَمٌ", latin: "qalamun", meaning: { id: "pena", en: "a pen" } },
  { parts: ["بَ", "يْتٌ"], whole: "بَيْتٌ", latin: "baytun", meaning: { id: "rumah", en: "a house" } },
  { parts: ["عِ", "لْمٌ"], whole: "عِلْمٌ", latin: "'ilmun", meaning: { id: "ilmu", en: "knowledge" } },
  { parts: ["نُ", "ورٌ"], whole: "نُورٌ", latin: "nurun", meaning: { id: "cahaya", en: "light" } },
  { parts: ["صَ", "بْرٌ"], whole: "صَبْرٌ", latin: "sabrun", meaning: { id: "sabar", en: "patience" } },
];

/** Tier 3 — longer words the child already hears every day. */
export const TIER3: GrowItem[] = [
  { parts: ["مَسْ", "جِ", "دٌ"], whole: "مَسْجِدٌ", latin: "masjidun", meaning: { id: "masjid", en: "a mosque" } },
  { parts: ["مُسْ", "لِ", "مٌ"], whole: "مُسْلِمٌ", latin: "muslimun", meaning: { id: "muslim", en: "a Muslim" } },
  { parts: ["رَحْ", "مَ", "ةٌ"], whole: "رَحْمَةٌ", latin: "rahmatun", meaning: { id: "rahmat", en: "mercy" } },
  { parts: ["كِ", "تَا", "بٌ"], whole: "كِتَابٌ", latin: "kitabun", meaning: { id: "kitab", en: "a book" } },
  { parts: ["صَ", "لَا", "ةٌ"], whole: "صَلَاةٌ", latin: "salatun", meaning: { id: "salat", en: "prayer" } },
];

/** Tier 4 — a whole phrase, assembled word by word. */
export const TIER4: GrowItem[] = [
  {
    parts: ["بِسْمِ", "اللَّهِ"],
    whole: "بِسْمِ اللَّهِ",
    latin: "bismillah",
    meaning: { id: "dengan nama Allah", en: "in the name of Allah" },
  },
  {
    parts: ["الْحَمْدُ", "لِلَّهِ"],
    whole: "الْحَمْدُ لِلَّهِ",
    latin: "alhamdulillah",
    meaning: { id: "segala puji bagi Allah", en: "all praise is for Allah" },
  },
  {
    parts: ["سُبْحَانَ", "اللَّهِ"],
    whole: "سُبْحَانَ اللَّهِ",
    latin: "subhanallah",
    meaning: { id: "Mahasuci Allah", en: "glory be to Allah" },
  },
  {
    parts: ["اللَّهُ", "أَكْبَرُ"],
    whole: "اللَّهُ أَكْبَرُ",
    latin: "allahu akbar",
    meaning: { id: "Allah Mahabesar", en: "Allah is the greatest" },
  },
  {
    parts: ["لَا", "إِلَٰهَ", "إِلَّا", "اللَّهُ"],
    whole: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    latin: "la ilaha illallah",
    meaning: { id: "tiada tuhan selain Allah", en: "there is no god but Allah" },
  },
];

export const GROW_TIERS: GrowItem[][] = [TIER0, TIER1, TIER2, TIER3, TIER4];

void SUKUN;
void SHADDA;
