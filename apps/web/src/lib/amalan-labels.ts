// Self-contained UI strings for the Amalan Harian page + its nav label, same
// pattern as radio-labels.ts / prayer-labels.ts. Previously this entire page
// (nav label, H1, subtitle, meta title/description, loading message) was
// hardcoded Indonesian regardless of the visitor's chosen locale — a real
// inconsistency on a site whose whole point is multi-language. English is
// the fallback for locales not listed below.

export interface AmalanLabels {
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  loading: string;
  groupDoa: string;
  groupDzikir: string;
  groupThibb: string;
  groupKecantikan: string;
  categoryLabel: string;
  audioAll: string;
  audioArabic: string;
  audioMeaning: string;
  listenAll: string;
  listen: string;
  stop: string;
  stopAll: string;
  note: string;
}

const EN: AmalanLabels = {
  navLabel: "Daily Practices",
  metaTitle: "Daily Practices — Duas, Dhikr, Prophetic Medicine · ULYAH.COM",
  metaDescription:
    "A well-organized collection of daily practices: duas from waking to sleeping, morning/evening dhikr, authentic Prophetic medicine (thibbun nabawi), and etiquette of cleanliness and beauty — complete with Arabic, transliteration, translation, and narration.",
  title: "Daily Practices",
  subtitle:
    "Duas from the moment you wake until you sleep, dhikr, Prophetic medicine (thibbun nabawi ﷺ), and the etiquette of cleanliness and beauty — all authentically sourced, complete with Arabic, transliteration, translation, and narration.",
  loading: "The collection is being prepared, please reload in a moment.",
  groupDoa: "Daily Du'a",
  groupDzikir: "Dhikr",
  groupThibb: "Prophetic Medicine",
  groupKecantikan: "Cleanliness & Beauty",
  categoryLabel: "Category",
  audioAll: "🔊 All",
  audioArabic: "﴿ Arabic",
  audioMeaning: "📖 Meaning",
  listenAll: "🔊 Listen to all",
  listen: "🔊 Listen",
  stop: "⏹",
  stopAll: "⏹ Stop",
  note: "Note",
};

const ID: AmalanLabels = {
  navLabel: "Amalan",
  metaTitle: "Amalan Harian — Doa, Dzikir, Thibbun Nabawi · ULYAH.COM",
  metaDescription:
    "Kumpulan amalan harian tersusun rapi: doa dari bangun tidur sampai tidur lagi, dzikir pagi-petang, pengobatan ala Nabi (thibbun nabawi) yang sahih, serta adab kebersihan & keindahan diri — lengkap Arab, latin, terjemah, dan suara.",
  title: "Amalan Harian",
  subtitle:
    "Doa dari bangun tidur sampai tidur lagi, dzikir, thibbun nabawi (pengobatan Nabi ﷺ), dan adab kebersihan & keindahan — semua bersumber sahih, lengkap Arab, latin, terjemah, dan bisa didengarkan.",
  loading: "Koleksi sedang disiapkan, coba muat ulang sebentar lagi.",
  groupDoa: "Doa Harian",
  groupDzikir: "Dzikir",
  groupThibb: "Pengobatan (Thibbun Nabawi)",
  groupKecantikan: "Kebersihan & Keindahan",
  categoryLabel: "Kategori",
  audioAll: "🔊 Semua",
  audioArabic: "﴿ Arab",
  audioMeaning: "📖 Arti",
  listenAll: "🔊 Dengarkan semua",
  listen: "🔊 Dengarkan",
  stop: "⏹",
  stopAll: "⏹ Berhenti",
  note: "Catatan",
};

const AR: AmalanLabels = {
  navLabel: "الأذكار اليومية",
  metaTitle: "الأذكار اليومية — أدعية، أذكار، الطب النبوي · ULYAH.COM",
  metaDescription:
    "مجموعة مرتبة من الأذكار اليومية: أدعية من الاستيقاظ إلى النوم، أذكار الصباح والمساء، الطب النبوي الصحيح، وآداب النظافة والجمال — كاملة بالعربية والنقل الصوتي والترجمة والصوت.",
  title: "الأذكار اليومية",
  subtitle:
    "أدعية من لحظة استيقاظك حتى نومك، أذكار، الطب النبوي ﷺ، وآداب النظافة والجمال — كلها موثقة، كاملة بالعربية والنقل الصوتي والترجمة والصوت.",
  loading: "المجموعة قيد الإعداد، يرجى إعادة التحميل بعد قليل.",
  groupDoa: "الأدعية اليومية",
  groupDzikir: "الأذكار",
  groupThibb: "الطب النبوي",
  groupKecantikan: "النظافة والجمال",
  categoryLabel: "الفئة",
  audioAll: "🔊 الكل",
  audioArabic: "﴿ العربية",
  audioMeaning: "📖 المعنى",
  listenAll: "🔊 استمع للكل",
  listen: "🔊 استمع",
  stop: "⏹",
  stopAll: "⏹ إيقاف",
  note: "ملاحظة",
};

const MAP: Record<string, AmalanLabels> = { en: EN, id: ID, ar: AR };

export function amalanLabels(locale: string): AmalanLabels {
  return MAP[locale] ?? EN;
}
