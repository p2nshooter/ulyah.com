import { fillLabels } from "./fill-labels";

// UI strings for Al-Qur'an Kids (/kids) — a separate, bright, child-safe corner
// (owner concept in the admin Roadmap). Authored in id/en/ar; every other
// ecosystem language is filled from the generated MT table via fillLabels, same
// as the rest of the site chrome. Nothing here is scripture — the surah text and
// audio come from the verified Qur'an data, never fabricated.

export interface KidsLabels {
  metaTitle: string;
  metaDesc: string;
  title: string;
  subtitle: string;
  iqroTitle: string;
  iqroDesc: string;
  jilid: string;
  hifzTitle: string;
  hifzDesc: string;
  juz29Title: string;
  juz29Desc: string;
  pilihanTitle: string;
  pilihanDesc: string;
  hijaiyahTitle: string;
  hijaiyahDesc: string;
  letters: string;
  surahs: string;
  listen: string;
  repeat: string;
  repeatOn: string;
  playAll: string;
  pause: string;
  back: string;
  ayahMeaning: string;
  tapToHear: string;
  loading: string;
}

const EN: KidsLabels = {
  metaTitle: "Al-Qur'an Kids — learn to read, memorize the short surahs",
  metaDesc:
    "A bright, gentle corner for children: learn to read step by step, get to know the hijaiyah letters, and memorize the short surahs with repeat-audio.",
  title: "Al-Qur'an Kids",
  subtitle: "Let's read, memorize and learn — gently, one little step at a time 🌱",
  iqroTitle: "Learn to Read (Iqro)",
  iqroDesc: "Six little levels, from single letters to full words — tap any letter to hear it in Arabic.",
  jilid: "Level",
  hifzTitle: "Memorize Juz 30",
  hifzDesc: "The short surahs, from An-Nas upward — listen, repeat, and memorize.",
  juz29Title: "Memorize Juz 29",
  juz29Desc: "The next set — Al-Mulk and its neighbours, with the same repeat-and-scroll player.",
  pilihanTitle: "Favourite Surahs",
  pilihanDesc: "The surahs families love to recite — Yasin, Ar-Rahman, Al-Waqi'ah, Al-Mulk and more.",
  hijaiyahTitle: "Hijaiyah Letters",
  hijaiyahDesc: "Get to know the Arabic letters — tap a letter to hear its name in Arabic.",
  letters: "letters",
  surahs: "surahs",
  listen: "Listen",
  repeat: "Repeat",
  repeatOn: "Repeat: on",
  playAll: "Play all",
  pause: "Pause",
  back: "Back",
  ayahMeaning: "Meaning",
  tapToHear: "Tap to hear",
  loading: "Loading…",
};

const ID: KidsLabels = {
  metaTitle: "Al-Qur'an Kids — belajar membaca, hafal surat pendek",
  metaDesc:
    "Sudut cerah dan lembut untuk anak: belajar membaca langkah demi langkah, kenali huruf hijaiyah, dan hafalkan surat-surat pendek dengan audio ulang-ulang.",
  title: "Al-Qur'an Kids",
  subtitle: "Yuk membaca, menghafal dan belajar — pelan-pelan, satu langkah kecil 🌱",
  iqroTitle: "Belajar Membaca (Iqro)",
  iqroDesc: "Enam jilid kecil, dari satu huruf sampai kata utuh — ketuk huruf untuk mendengarnya dalam bahasa Arab.",
  jilid: "Jilid",
  hifzTitle: "Hafalan Juz 30",
  hifzDesc: "Surat-surat pendek, mulai dari An-Nas — dengar, ulangi, lalu hafalkan.",
  juz29Title: "Hafalan Juz 29",
  juz29Desc: "Lanjutannya — Al-Mulk dan sekitarnya, dengan pemutar ulang-ulang & gulir otomatis yang sama.",
  pilihanTitle: "Surat Pilihan",
  pilihanDesc: "Surat yang biasa dibaca keluarga — Yasin, Ar-Rahman, Al-Waqi'ah, Al-Mulk, dan lainnya.",
  hijaiyahTitle: "Huruf Hijaiyah",
  hijaiyahDesc: "Kenali huruf-huruf Arab — ketuk satu huruf untuk mendengar namanya dalam bahasa Arab.",
  letters: "huruf",
  surahs: "surat",
  listen: "Dengar",
  repeat: "Ulangi",
  repeatOn: "Ulang-ulang: aktif",
  playAll: "Putar semua",
  pause: "Jeda",
  back: "Kembali",
  ayahMeaning: "Arti",
  tapToHear: "Ketuk untuk dengar",
  loading: "Memuat…",
};

const AR: KidsLabels = {
  metaTitle: "أطفال القرآن — تعلّم القراءة واحفظ قصار السور",
  metaDesc: "ركن لطيف ومشرق للأطفال: تعلّم القراءة خطوة بخطوة، وتعرّف على الحروف الهجائية، واحفظ قصار السور مع تكرار الصوت.",
  title: "أطفال القرآن",
  subtitle: "هيّا نقرأ ونحفظ ونتعلّم — بلطف، خطوة صغيرة تلو الأخرى 🌱",
  iqroTitle: "تعلّم القراءة",
  iqroDesc: "ستّ مراحل صغيرة، من الحرف المفرد إلى الكلمة الكاملة — انقر أيّ حرف لتسمعه بالعربية.",
  jilid: "المرحلة",
  hifzTitle: "حفظ جزء عمّ",
  hifzDesc: "قصار السور، ابتداءً من الناس — استمع وكرّر ثم احفظ.",
  juz29Title: "حفظ جزء تبارك",
  juz29Desc: "المجموعة التالية — سورة الملك وما حولها، بنفس مشغّل التكرار والتمرير التلقائي.",
  pilihanTitle: "سور مختارة",
  pilihanDesc: "السور التي تحب العائلات تلاوتها — يس والرحمن والواقعة والملك وغيرها.",
  hijaiyahTitle: "الحروف الهجائية",
  hijaiyahDesc: "تعرّف على الحروف العربية — انقر حرفًا لتسمع اسمه بالعربية.",
  letters: "حرفًا",
  surahs: "سورة",
  listen: "استمع",
  repeat: "كرّر",
  repeatOn: "التكرار: مفعّل",
  playAll: "تشغيل الكل",
  pause: "إيقاف",
  back: "رجوع",
  ayahMeaning: "المعنى",
  tapToHear: "انقر لتسمع",
  loading: "جارٍ التحميل…",
};

const MAP: Record<string, KidsLabels> = { en: EN, id: ID, ar: AR };

export function kidsLabels(locale: string): KidsLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
