import { fillLabels } from "./fill-labels";

// Landing-page bands (kitab treasury + Al-Qur'an Kids). English is the source;
// every locale not hand-authored below is filled from the generated UI_I18N
// table, so these never fall back to English on the other 25 languages.

export interface HomeLabels {
  kitabTitle: string;
  kitabDesc: string;
  kitabCta: string;
  kidsTitle: string;
  kidsDesc: string;
  kidsCta: string;
  kidsIqro: string;
  install: string;
}

const EN: HomeLabels = {
  kitabTitle: "The Kitab Treasury — Digital Library",
  kitabDesc: "Explore the classical works across every discipline — tafsir, hadith, fiqh, creed, grammar, rhetoric, spirituality and more. Browse by field in one tap.",
  kitabCta: "Open",
  kidsTitle: "Al-Qur'an Kids",
  kidsDesc: "Learn to read from zero: the hijaiyah, voiced Iqro levels, Juz 'Amma memorisation, and Islamic films for children.",
  kidsCta: "Start learning",
  kidsIqro: "Iqro levels",
  install: "Install the app so it opens faster",
};

const ID: HomeLabels = {
  kitabTitle: "Bendahara Kitab — Perpustakaan Digital",
  kitabDesc: "Jelajahi kitab-kitab klasik dari seluruh bidang ilmu — tafsir, hadits, fikih, akidah, nahwu-sharaf, balaghah, tasawuf, dan lainnya. Klik langsung per bidang.",
  kitabCta: "Buka",
  kidsTitle: "Al-Qur'an Kids",
  kidsDesc: "Belajar mengaji dari nol: hijaiyah, jilid Iqro bersuara, hafalan Juz 'Amma, dan film anak islami.",
  kidsCta: "Mulai belajar",
  kidsIqro: "jilid Iqro",
  install: "Pasang aplikasinya biar lebih cepat dibuka",
};

const AR: HomeLabels = {
  kitabTitle: "خزانة الكتب — المكتبة الرقمية",
  kitabDesc: "تصفّح الكتب الكلاسيكية في كل الفنون — التفسير والحديث والفقه والعقيدة والنحو والبلاغة والتصوف وغيرها.",
  kitabCta: "افتح",
  kidsTitle: "القرآن للأطفال",
  kidsDesc: "تعلّم القراءة من الصفر: الحروف الهجائية، ومستويات إقرأ الصوتية، وحفظ جزء عمّ، وأفلام إسلامية للأطفال.",
  kidsCta: "ابدأ التعلّم",
  kidsIqro: "مستويات إقرأ",
  install: "ثبّت التطبيق ليفتح أسرع",
};

const MAP: Record<string, HomeLabels> = { en: EN, id: ID, ar: AR };

export function homeLabels(locale: string): HomeLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
