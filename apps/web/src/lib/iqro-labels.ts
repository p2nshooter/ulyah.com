import { fillLabels } from "./fill-labels";

// What each Iqro level teaches, in the reader's own language. This text used to
// live inside lib/iqro.ts as Indonesian string literals shown verbatim on every
// site — one of the hardcodes that left the ecosystem mixed-language. English is
// the source; any locale not hand-authored here is filled from the generated
// UI_I18N table (`pnpm gen:ui-i18n`).

export interface IqroFocusLabels {
  /** Indexed by jilid number − 1. */
  focus: string[];
}

const EN: IqroFocusLabels = {
  focus: [
    "Letters with fathah (a)",
    "Joining letters together",
    "Kasrah (i), dhammah (u) and mixed vowels",
    "Tanwin (an, in, un)",
    "Mad — the long vowels",
    "Sukun and tasydid",
    "Ikhfa — the letter nuun with sukuun is read softly",
    "Idgham, iqlab, izhar and a silent miim",
    "Qalqalah (bouncing) and ghunnah (humming)",
    "Mad wajib and mad lazim — 4 to 6 harakat",
  ],
};

const ID: IqroFocusLabels = {
  focus: [
    "Huruf berharakat fathah (a)",
    "Huruf sambung",
    "Kasrah (i), dhammah (u) & campuran",
    "Tanwin (an, in, un)",
    "Mad — bacaan panjang",
    "Sukun & tasydid",
    "Ikhfa — nun sukun dibaca samar",
    "Idgham, iqlab, izhar & mim sukun",
    "Qalqalah (memantul) & ghunnah (dengung)",
    "Mad wajib & mad lazim — panjang 4-6 harakat",
  ],
};

const AR: IqroFocusLabels = {
  focus: [
    "الحروف بالفتحة (a)",
    "الحروف المتصلة",
    "الكسرة (i) والضمة (u) والمزج بينها",
    "التنوين (an, in, un)",
    "المدّ — الحركات الطويلة",
    "السكون والشدّة",
    "الإخفاء — النون الساكنة تُقرأ مخفاة",
    "الإدغام والإقلاب والإظهار والميم الساكنة",
    "القلقلة (الارتداد) والغنّة (الهمهمة)",
    "المدّ الواجب والمدّ اللازم — من ٤ إلى ٦ حركات",
  ],
};

const MAP: Record<string, IqroFocusLabels> = { en: EN, id: ID, ar: AR };

export function iqroFocusLabels(locale: string): IqroFocusLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}

/** The one-line description of what jilid `no` (1-based) teaches. */
export function iqroFocus(locale: string, no: number): string {
  return iqroFocusLabels(locale).focus[no - 1] ?? "";
}
