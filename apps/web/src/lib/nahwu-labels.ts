import { fillLabels } from "./fill-labels";

// Word-by-word grammar panel. English is the source; other locales are filled
// from the generated UI_I18N table rather than falling back to English.

export interface NahwuLabels {
  title: string;
  show: string;
  hide: string;
  read: string;
  stop: string;
  root: string;
  prefix: string;
  suffix: string;
  word: string;
  none: string;
  src: string;
}

const EN: NahwuLabels = {
  title: "Word-by-word — Grammar & Morphology",
  show: "Show",
  hide: "Hide",
  read: "Read aloud",
  stop: "Stop",
  root: "root",
  prefix: "prefix",
  suffix: "suffix",
  word: "Word",
  none: "No word-analysis data for this ayah yet.",
  src: "Source",
};

const ID: NahwuLabels = {
  title: "Urai Kata — Nahwu & Shorof",
  show: "Tampilkan",
  hide: "Sembunyikan",
  read: "Bacakan uraian",
  stop: "Hentikan",
  root: "akar",
  prefix: "awalan",
  suffix: "akhiran",
  word: "Kata",
  none: "Belum ada data urai kata untuk ayat ini.",
  src: "Sumber",
};

const AR: NahwuLabels = {
  title: "إعراب الكلمات — النحو والصرف",
  show: "إظهار",
  hide: "إخفاء",
  read: "اقرأ الإعراب",
  stop: "إيقاف",
  root: "جذر",
  prefix: "سابقة",
  suffix: "لاحقة",
  word: "كلمة",
  none: "لا توجد بيانات إعراب لهذه الآية بعد.",
  src: "المصدر",
};

const MAP: Record<string, NahwuLabels> = { en: EN, id: ID, ar: AR };

export function nahwuLabels(locale: string): NahwuLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
