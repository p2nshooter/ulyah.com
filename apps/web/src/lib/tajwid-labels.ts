import { fillLabels } from "./fill-labels";
import type { TajwidRule } from "./tajwid";

// Names and explanations for the tajwid rules. These used to live as nameId /
// nameEn / descId / descEn inside TAJWID_RULES and were read with
// `locale === "id" ? … : …`, which meant the other 26 languages silently got
// English. English is the source here; every locale that is not hand-authored
// below is filled from the generated UI_I18N table instead.

export interface TajwidRuleText {
  name: string;
  desc: string;
}
export type TajwidRuleTexts = Record<TajwidRule, TajwidRuleText>;

const EN: TajwidRuleTexts = {
  "ghunnah": { name: "Ghunnah", desc: "Nun or mim with shadda (نّ / مّ) is read with a two-count nasal sound." },
  "idgham-bighunnah": { name: "Idgham with ghunnah", desc: "Nun sakinah/tanwin followed by ي ن م و merges into the next letter with a nasal sound." },
  "idgham-bilaghunnah": { name: "Idgham without ghunnah", desc: "Nun sakinah/tanwin followed by ل or ر merges without a nasal sound." },
  "ikhfa": { name: "Ikhfa", desc: "Nun sakinah/tanwin before one of the 15 ikhfa letters is read lightly concealed, with a nasal sound." },
  "iqlab": { name: "Iqlab", desc: "Nun sakinah/tanwin before ب converts to a mim sound with a nasal sound." },
  "ikhfa-syafawi": { name: "Ikhfa shafawi", desc: "Mim sakinah before ب is read lightly concealed at the lips with a nasal sound." },
  "idgham-mimi": { name: "Idgham mimi", desc: "Mim sakinah before م merges into a doubled mim with a nasal sound." },
  "idgham-syamsiyah": { name: "Idgham shamsiyyah (sun-letter lam)", desc: "The definite article ال before a 'sun letter': the lam is silent and merges into the next (doubled) letter." },
  "qalqalah": { name: "Qalqalah", desc: "The letters ق ط ب ج د with sukun are read with an echoing bounce (kubra at a stop, sughra mid-word)." },
  "madd": { name: "Madd", desc: "The madd sign (ٓ) or alef-madda (آ): the vowel is lengthened. Natural madd is 2 counts; see the guide for the other types." },
  "madd-wajib-muttasil": { name: "Madd wajib muttasil", desc: "Madd followed by hamza (ء) within the same word: obligatorily lengthened 4–5 counts." },
  "madd-jaiz-munfasil": { name: "Madd jaiz munfasil", desc: "Madd at a word's end with hamza at the start of the next word: may be lengthened 2, 4, or 5 counts." },
  "madd-lazim": { name: "Madd lazim", desc: "Madd followed by a letter carrying shadda or sukun: lengthened a full 6 counts." },
};

const ID: TajwidRuleTexts = {
  "ghunnah": { name: "Ghunnah", desc: "Nun atau mim bertasydid (نّ / مّ) dibaca berdengung dua harakat." },
  "idgham-bighunnah": { name: "Idgham Bighunnah", desc: "Nun sukun/tanwin bertemu ي ن م و: dileburkan ke huruf berikutnya dengan dengung." },
  "idgham-bilaghunnah": { name: "Idgham Bilaghunnah", desc: "Nun sukun/tanwin bertemu ل atau ر: dileburkan tanpa dengung." },
  "ikhfa": { name: "Ikhfa Haqiqi", desc: "Nun sukun/tanwin bertemu salah satu 15 huruf ikhfa: dibaca samar-samar dengan dengung." },
  "iqlab": { name: "Iqlab", desc: "Nun sukun/tanwin bertemu ب: bunyinya berubah menjadi mim dengan dengung." },
  "ikhfa-syafawi": { name: "Ikhfa Syafawi", desc: "Mim sukun bertemu ب: dibaca samar di bibir dengan dengung." },
  "idgham-mimi": { name: "Idgham Mimi", desc: "Mim sukun bertemu م: dileburkan menjadi mim bertasydid dengan dengung." },
  "idgham-syamsiyah": { name: "Idgham Syamsiyah (Lam Syamsiyah)", desc: "Alif-lam (ال) bertemu huruf syamsiah: huruf lam tidak dibaca, langsung ke huruf berikutnya yang bertasydid." },
  "qalqalah": { name: "Qalqalah", desc: "Huruf ق ط ب ج د bersukun: dibaca memantul. (Di akhir waqaf disebut qalqalah kubra, di tengah kata qalqalah sughra.)" },
  "madd": { name: "Madd", desc: "Tanda madd (ٓ) atau alif madd (آ): bacaan dipanjangkan. Mad thabi'i 2 harakat; jenis mad lain lihat panduan." },
  "madd-wajib-muttasil": { name: "Mad Wajib Muttasil", desc: "Mad bertemu hamzah (ء) dalam satu kata: wajib dipanjangkan 4–5 harakat." },
  "madd-jaiz-munfasil": { name: "Mad Jaiz Munfasil", desc: "Mad di akhir kata dan hamzah (ء) di awal kata berikutnya: boleh dipanjangkan 2, 4, atau 5 harakat." },
  "madd-lazim": { name: "Mad Lazim", desc: "Mad bertemu huruf bertasydid atau bersukun: dipanjangkan 6 harakat." },
};

const MAP: Record<string, TajwidRuleTexts> = { en: EN, id: ID };

export function tajwidRuleTexts(locale: string): TajwidRuleTexts {
  return MAP[locale] ?? fillLabels(locale, EN);
}

// Small UI chrome around the tajwid feature (toggle button, guide link).
export interface TajwidUiLabels {
  tajwid: string;
  tajwidTitle: string;
  guide: string;
  guideFull: string;
}
const UI_EN: TajwidUiLabels = { tajwid: "Tajwid", tajwidTitle: "Colour the tajwid rules", guide: "Guide", guideFull: "Full guide" };
const UI_ID: TajwidUiLabels = { tajwid: "Tajwid", tajwidTitle: "Tandai hukum tajwid", guide: "Panduan", guideFull: "Panduan lengkap" };
const UI_AR: TajwidUiLabels = { tajwid: "التجويد", tajwidTitle: "تلوين أحكام التجويد", guide: "الدليل", guideFull: "الدليل الكامل" };
const UI_MAP: Record<string, TajwidUiLabels> = { en: UI_EN, id: UI_ID, ar: UI_AR };

export function tajwidUiLabels(locale: string): TajwidUiLabels {
  return UI_MAP[locale] ?? fillLabels(locale, UI_EN);
}

// Chrome for the /quran/tajwid guide page.
export interface TajwidPageLabels {
  title: string; subtitle: string; legend: string; coloredBadge: string; explainedBadge: string;
  huruf: string; cara: string; contoh: string; tryTitle: string; trySub: string; tryCta: string; note: string;
}
const P_EN: TajwidPageLabels = {
  title: "Complete Tajwid Guide",
  subtitle: "Every tajwid rule — nun & mim sakinah, madd, qalqalah, ghunnah, the definite article, ra, and the waqf signs — with definitions, letters, how to read, and example verses.",
  legend: "Colour key used in the Mushaf", coloredBadge: "Coloured in the Mushaf", explainedBadge: "Explained only",
  huruf: "Letters", cara: "How to read", contoh: "Examples",
  tryTitle: "Try it live in the Uthmani Mushaf", trySub: "Turn on the Tajwid button, then tap a coloured letter for its explanation.",
  tryCta: "Open the Mushaf", note: "Note",
};
const P_ID: TajwidPageLabels = {
  title: "Panduan Tajwid Lengkap",
  subtitle: "Seluruh hukum tajwid — nun & mim sukun, mad, qalqalah, ghunnah, lam ta'rif, hukum ra, dan tanda waqaf — dengan definisi, huruf, cara membaca, dan contoh ayat.",
  legend: "Keterangan warna di Mushaf", coloredBadge: "Diwarnai di Mushaf", explainedBadge: "Dijelaskan saja",
  huruf: "Huruf", cara: "Cara membaca", contoh: "Contoh",
  tryTitle: "Coba langsung di Mushaf Utsmani", trySub: "Aktifkan tombol Tajwid lalu ketuk huruf berwarna untuk penjelasannya.",
  tryCta: "Buka Mushaf", note: "Catatan",
};
const P_MAP: Record<string, TajwidPageLabels> = { en: P_EN, id: P_ID };
export function tajwidPageLabels(locale: string): TajwidPageLabels {
  return P_MAP[locale] ?? fillLabels(locale, P_EN);
}
