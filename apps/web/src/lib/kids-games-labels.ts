import { fillLabels } from "./fill-labels";

// Labels for the Al-Qur'an Kids games. English is the source of truth: every
// locale that isn't hand-authored here is filled from the generated UI_I18N
// table (scripts/generate-ui-i18n.ts, `pnpm gen:ui-i18n`), so a new language
// never silently falls back to English — that fallback is exactly what left
// the ecosystem inconsistent when strings were written inline in components.

export interface KidsGamesLabels {
  title: string;
  subtitle: string;
  guessName: string;
  guessDesc: string;
  findName: string;
  findDesc: string;
  matchName: string;
  matchDesc: string;
  orderName: string;
  orderDesc: string;
  score: string;
  streak: string;
  best: string;
  correct: string;
  wrong: string;
  play: string;
  again: string;
  back: string;
  listen: string;
  done: string;
  moves: string;
  hint: string;
  orderHint: string;
}

const EN: KidsGamesLabels = {
  title: "Qur'an Learning Games",
  subtitle: "Learn the hijaiyah letters by playing",
  guessName: "Guess the Letter",
  guessDesc: "See the letter, pick its name",
  findName: "Find the Letter",
  findDesc: "Hear the name, pick the letter",
  matchName: "Matching Cards",
  matchDesc: "Match each letter to its name",
  orderName: "Put in Order",
  orderDesc: "Arrange them in hijaiyah order",
  score: "Score",
  streak: "Streak",
  best: "Best",
  correct: "Correct!",
  wrong: "Try again",
  play: "Play",
  again: "Play again",
  back: "Choose another game",
  listen: "Listen",
  done: "Great! Finished",
  moves: "Moves",
  hint: "Tap a card to flip it",
  orderHint: "Tap the letters in order",
};

const ID: KidsGamesLabels = {
  title: "Game Belajar Qur'an",
  subtitle: "Belajar huruf hijaiyah sambil bermain",
  guessName: "Tebak Huruf",
  guessDesc: "Lihat hurufnya, pilih namanya",
  findName: "Cari Huruf",
  findDesc: "Dengar namanya, pilih hurufnya",
  matchName: "Kartu Pasangan",
  matchDesc: "Cocokkan huruf dengan namanya",
  orderName: "Urutkan Huruf",
  orderDesc: "Susun sesuai urutan hijaiyah",
  score: "Skor",
  streak: "Beruntun",
  best: "Terbaik",
  correct: "Benar!",
  wrong: "Coba lagi ya",
  play: "Main",
  again: "Main lagi",
  back: "Pilih game lain",
  listen: "Dengarkan",
  done: "Hebat! Selesai",
  moves: "Langkah",
  hint: "Ketuk kartu untuk membukanya",
  orderHint: "Ketuk huruf sesuai urutan",
};

const AR: KidsGamesLabels = {
  title: "ألعاب تعلّم القرآن",
  subtitle: "تعلّم الحروف الهجائية باللعب",
  guessName: "خمّن الحرف",
  guessDesc: "انظر إلى الحرف واختر اسمه",
  findName: "ابحث عن الحرف",
  findDesc: "استمع للاسم واختر الحرف",
  matchName: "بطاقات متطابقة",
  matchDesc: "طابق كل حرف مع اسمه",
  orderName: "رتّب الحروف",
  orderDesc: "رتّبها حسب ترتيب الحروف الهجائية",
  score: "النقاط",
  streak: "متتالية",
  best: "الأفضل",
  correct: "أحسنت!",
  wrong: "حاول مرة أخرى",
  play: "العب",
  again: "العب مرة أخرى",
  back: "اختر لعبة أخرى",
  listen: "استمع",
  done: "رائع! انتهيت",
  moves: "الحركات",
  hint: "انقر البطاقة لقلبها",
  orderHint: "انقر الحروف بالترتيب",
};

const MAP: Record<string, KidsGamesLabels> = { en: EN, id: ID, ar: AR };

export function kidsGamesLabels(locale: string): KidsGamesLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
