// Self-contained UI strings for the Radio Qori Dunia widget, same pattern as
// hadits-labels.ts / kitab-labels.ts. English is the fallback for locales
// not listed.

export interface RadioLabels {
  title: string;
  subtitle: string;
  nowPlaying: string;
  wholeSurah: string;
  play: string;
  pause: string;
  clickToStart: string;
  chooseReciter: string;
  chooseCountry: string;
  featuredGroup: string;
  allGroup: string;
  liveBadge: string;
}

const EN: RadioLabels = {
  title: "World Reciters Radio",
  subtitle: "The Qur'an recited nonstop, 24 hours a day — pick any reciter you love.",
  nowPlaying: "Now reciting",
  wholeSurah: "full surah",
  play: "Play",
  pause: "Pause",
  clickToStart: "Tap to start the radio",
  chooseReciter: "Choose a reciter",
  chooseCountry: "Country",
  featuredGroup: "🏆 World-renowned reciters",
  allGroup: "All reciters",
  liveBadge: "LIVE",
};

const ID: RadioLabels = {
  title: "Radio Qori Dunia",
  subtitle: "Al-Qur'an dibacakan tanpa henti, 24 jam sehari — pilih qori kesukaan Anda.",
  nowPlaying: "Sedang membaca",
  wholeSurah: "satu surah penuh",
  play: "Putar",
  pause: "Jeda",
  clickToStart: "Ketuk untuk memulai radio",
  chooseReciter: "Pilih qori",
  chooseCountry: "Negara",
  featuredGroup: "🏆 Qori juara dunia",
  allGroup: "Semua qori",
  liveBadge: "LIVE",
};

const AR: RadioLabels = {
  title: "راديو قراء العالم",
  subtitle: "القرآن الكريم يُتلى بلا توقف، ٢٤ ساعة يوميًا — اختر القارئ الذي تحب.",
  nowPlaying: "يُتلى الآن",
  wholeSurah: "السورة كاملة",
  play: "تشغيل",
  pause: "إيقاف مؤقت",
  clickToStart: "اضغط لبدء الراديو",
  chooseReciter: "اختر القارئ",
  chooseCountry: "الدولة",
  featuredGroup: "🏆 قراء مشهورون عالميًا",
  allGroup: "كل القراء",
  liveBadge: "مباشر",
};

const MAP: Record<string, RadioLabels> = { en: EN, id: ID, ar: AR };

export function radioLabels(locale: string): RadioLabels {
  return MAP[locale] ?? EN;
}
