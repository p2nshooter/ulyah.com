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
  reciterLineup: string;
  liveBadge: string;
  khatamCompleted: string;
  khatamInProgress: string;
  khatamRotationNote: string;
  tapToUnmute: string;
  installStandalone: string;
  pageIntro: string;
  brandTagline: string;
  brandCta: string;
  openRadioPage: string;
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
  reciterLineup: "🎙️ Reciter lineup",
  liveBadge: "LIVE",
  khatamCompleted: "khatam completed",
  khatamInProgress: "now on khatam #",
  khatamRotationNote: "Once every reciter has taken a turn, the rotation loops back to the first — forever.",
  tapToUnmute: "The radio is live — tap to hear it",
  installStandalone: "Install as a standalone app",
  pageIntro: "A live Qur'an radio that never stops — install it and keep the recitation with you, one tap from your home screen.",
  brandTagline: "Listen, understand, and bring the Qur'an to life every day with Ulyah.",
  brandCta: "Explore ULYAH.COM",
  openRadioPage: "Open Radio · install as app",
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
  reciterLineup: "🎙️ Urutan qori",
  liveBadge: "LIVE",
  khatamCompleted: "kali khatam selesai",
  khatamInProgress: "sedang khataman ke-",
  khatamRotationNote: "Setelah seluruh qori kebagian giliran, rotasi kembali ke qori paling atas — begitu seterusnya.",
  tapToUnmute: "Radio sudah live — ketuk untuk dengar suaranya",
  installStandalone: "Pasang sebagai aplikasi tersendiri",
  pageIntro: "Radio Al-Qur'an yang hidup tanpa henti — pasang di ponsel Anda, murottal selalu menemani hanya dengan satu ketukan dari layar depan.",
  brandTagline: "Dengarkan, pahami, dan hidupkan Al-Qur'an setiap hari bersama Ulyah.",
  brandCta: "Jelajahi ULYAH.COM",
  openRadioPage: "Buka Radio · pasang jadi aplikasi",
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
  reciterLineup: "🎙️ ترتيب القراء",
  liveBadge: "مباشر",
  khatamCompleted: "ختمة مكتملة",
  khatamInProgress: "الختمة الحالية رقم",
  khatamRotationNote: "بعد أن يأخذ كل قارئ دوره، يعود الترتيب إلى القارئ الأول — وهكذا إلى الأبد.",
  tapToUnmute: "الراديو يعمل الآن مباشرة — اضغط للاستماع",
  installStandalone: "ثبّته كتطبيق مستقل",
  pageIntro: "راديو قرآني حي لا يتوقف — ثبّته على هاتفك لتبقى التلاوة معك بضغطة واحدة من الشاشة الرئيسية.",
  brandTagline: "استمع وافهم وأحيِ القرآن كل يوم مع أُليَه.",
  brandCta: "استكشف ULYAH.COM",
  openRadioPage: "افتح الراديو · ثبّته كتطبيق",
};

const MAP: Record<string, RadioLabels> = { en: EN, id: ID, ar: AR };

export function radioLabels(locale: string): RadioLabels {
  return MAP[locale] ?? EN;
}
