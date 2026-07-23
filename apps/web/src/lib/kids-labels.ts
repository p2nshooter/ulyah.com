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
  hifzTitle: string;
  hifzDesc: string;
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
  metaTitle: "Al-Qur'an Kids — memorize the short surahs, learn the letters",
  metaDesc:
    "A bright, gentle corner for children: memorize the short surahs of Juz 30 with repeat-audio, and get to know the hijaiyah letters.",
  title: "Al-Qur'an Kids",
  subtitle: "Let's memorize and learn — gently, one little step at a time 🌱",
  hifzTitle: "Memorize Juz 30",
  hifzDesc: "The short surahs, from An-Nas upward — listen, repeat, and memorize.",
  hijaiyahTitle: "Hijaiyah Letters",
  hijaiyahDesc: "Get to know the Arabic letters — tap a letter to hear its name.",
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
  metaTitle: "Al-Qur'an Kids — hafal surat pendek, kenal huruf hijaiyah",
  metaDesc:
    "Sudut cerah dan lembut untuk anak: hafalkan surat-surat pendek Juz 30 dengan audio ulang-ulang, dan kenali huruf hijaiyah.",
  title: "Al-Qur'an Kids",
  subtitle: "Yuk menghafal dan belajar — pelan-pelan, satu langkah kecil 🌱",
  hifzTitle: "Hafalan Juz 30",
  hifzDesc: "Surat-surat pendek, mulai dari An-Nas — dengar, ulangi, lalu hafalkan.",
  hijaiyahTitle: "Huruf Hijaiyah",
  hijaiyahDesc: "Kenali huruf-huruf Arab — ketuk satu huruf untuk mendengar namanya.",
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
  metaTitle: "أطفال القرآن — احفظ قصار السور وتعلّم الحروف",
  metaDesc: "ركن لطيف ومشرق للأطفال: احفظ قصار سور جزء عمّ مع تكرار الصوت، وتعرّف على الحروف الهجائية.",
  title: "أطفال القرآن",
  subtitle: "هيّا نحفظ ونتعلّم — بلطف، خطوة صغيرة تلو الأخرى 🌱",
  hifzTitle: "حفظ جزء عمّ",
  hifzDesc: "قصار السور، ابتداءً من الناس — استمع وكرّر ثم احفظ.",
  hijaiyahTitle: "الحروف الهجائية",
  hijaiyahDesc: "تعرّف على الحروف العربية — انقر حرفًا لتسمع اسمه.",
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
