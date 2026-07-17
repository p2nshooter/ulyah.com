// Self-contained UI strings for the Jadwal Sholat widget, same pattern as
// radio-labels.ts. English is the fallback for locales not listed.

export interface PrayerLabels {
  title: string;
  subtitle: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayer: string;
  yourLocation: string;
  worldClocks: string;
  hijriDate: string;
  countdownToRamadan: string;
  countdownToNuzul: string;
  nuzulPassedNote: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  locating: string;
  installStandalone: string;
  brandTagline: string;
  brandCta: string;
  untilNext: string;
  now: string;
}

const EN: PrayerLabels = {
  title: "Prayer Schedule",
  subtitle: "Locked to your own location — prayer times where you are, right now.",
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  nextPrayer: "Next prayer",
  yourLocation: "Your location",
  worldClocks: "World Clocks",
  hijriDate: "Hijri date",
  countdownToRamadan: "Countdown to Ramadan",
  countdownToNuzul: "Countdown to Nuzul al-Qur'an (17 Ramadan)",
  nuzulPassedNote: "Nuzul al-Qur'an has passed — may the rest of Ramadan be blessed.",
  days: "days",
  hours: "hrs",
  minutes: "min",
  seconds: "sec",
  locating: "Locating you…",
  installStandalone: "Install as a standalone reminder app",
  brandTagline:
    "Prayer Schedule and Radio Qori Dunia are part of ULYAH.COM — a digital home for the Qur'an, tafsir, hadith, classical texts, and Islamic stories, all narrated aloud for every listener.",
  brandCta: "Discover the full ULYAH.COM app →",
  untilNext: "Until",
  now: "now",
};

const ID: PrayerLabels = {
  title: "Jadwal Sholat",
  subtitle: "Terkunci ke lokasi Anda — waktu sholat di tempat Anda, saat ini juga.",
  fajr: "Subuh",
  sunrise: "Terbit",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
  nextPrayer: "Sholat berikutnya",
  yourLocation: "Lokasi Anda",
  worldClocks: "Jam Dunia",
  hijriDate: "Tanggal Hijriah",
  countdownToRamadan: "Hitung Mundur Menuju Ramadhan",
  countdownToNuzul: "Hitung Mundur Menuju Nuzulul Qur'an (17 Ramadhan)",
  nuzulPassedNote: "Nuzulul Qur'an telah berlalu — semoga sisa Ramadhan penuh berkah.",
  days: "hari",
  hours: "jam",
  minutes: "mnt",
  seconds: "dtk",
  locating: "Mendeteksi lokasi Anda…",
  installStandalone: "Pasang sebagai aplikasi pengingat terpisah",
  brandTagline:
    "Jadwal Sholat dan Radio Qori Dunia adalah bagian dari ULYAH.COM — rumah digital Al-Qur'an, tafsir, hadits, kitab klasik, dan kisah-kisah Islami, yang seluruhnya dibacakan dengan suara untuk setiap pendengarnya.",
  brandCta: "Jelajahi aplikasi lengkap ULYAH.COM →",
  untilNext: "Menuju",
  now: "sekarang",
};

const AR: PrayerLabels = {
  title: "مواقيت الصلاة",
  subtitle: "مقفلة على موقعك — مواقيت الصلاة في مكانك الآن.",
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
  nextPrayer: "الصلاة القادمة",
  yourLocation: "موقعك",
  worldClocks: "ساعات العالم",
  hijriDate: "التاريخ الهجري",
  countdownToRamadan: "العد التنازلي لرمضان",
  countdownToNuzul: "العد التنازلي لنزول القرآن (17 رمضان)",
  nuzulPassedNote: "مضى يوم نزول القرآن — تقبل الله بقية رمضان.",
  days: "يوم",
  hours: "س",
  minutes: "د",
  seconds: "ث",
  locating: "جارٍ تحديد موقعك…",
  installStandalone: "ثبّت كتطبيق تذكير مستقل",
  brandTagline:
    "مواقيت الصلاة وراديو القرّاء المباشر جزء من ULYAH.COM — بيت رقمي للقرآن الكريم والتفسير والحديث والكتب التراثية والقصص الإسلامية، جميعها متلوّة بصوت هادئ لكل مستمع.",
  brandCta: "اكتشف تطبيق ULYAH.COM الكامل ←",
  untilNext: "حتى",
  now: "الآن",
};

const FR: PrayerLabels = {
  title: "Horaires de prière",
  subtitle: "Calés sur votre position — les horaires de prière là où vous êtes, maintenant.",
  fajr: "Fajr",
  sunrise: "Lever du soleil",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  nextPrayer: "Prochaine prière",
  yourLocation: "Votre position",
  worldClocks: "Horloges mondiales",
  hijriDate: "Date hégirienne",
  countdownToRamadan: "Compte à rebours vers le Ramadan",
  countdownToNuzul: "Compte à rebours vers Nuzul al-Qur'an (17 Ramadan)",
  nuzulPassedNote: "Nuzul al-Qur'an est passé — que le reste du Ramadan soit béni.",
  days: "jours",
  hours: "h",
  minutes: "min",
  seconds: "s",
  locating: "Localisation en cours…",
  installStandalone: "Installer comme application de rappel autonome",
  brandTagline:
    "Les horaires de prière et la Radio des récitateurs du monde font partie de ce portail — une maison numérique pour le Coran, le tafsir, le hadith, les textes classiques et les récits islamiques, tous narrés à voix haute.",
  brandCta: "Découvrir l'application complète →",
  untilNext: "Dans",
  now: "maintenant",
};

const DE: PrayerLabels = {
  title: "Gebetszeiten",
  subtitle: "An Ihren Standort gebunden — die Gebetszeiten dort, wo Sie gerade sind.",
  fajr: "Fadschr",
  sunrise: "Sonnenaufgang",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Ischa",
  nextPrayer: "Nächstes Gebet",
  yourLocation: "Ihr Standort",
  worldClocks: "Weltuhren",
  hijriDate: "Hidschri-Datum",
  countdownToRamadan: "Countdown bis zum Ramadan",
  countdownToNuzul: "Countdown bis Nuzul al-Qur'an (17. Ramadan)",
  nuzulPassedNote: "Nuzul al-Qur'an ist vorüber — möge der Rest des Ramadan gesegnet sein.",
  days: "Tage",
  hours: "Std",
  minutes: "Min",
  seconds: "Sek",
  locating: "Standort wird ermittelt…",
  installStandalone: "Als eigenständige Erinnerungs-App installieren",
  brandTagline:
    "Gebetszeiten und das weltweite Rezitatoren-Radio sind Teil dieses Portals — ein digitales Zuhause für Koran, Tafsir, Hadith, klassische Texte und islamische Geschichten, alle laut vorgetragen.",
  brandCta: "Die vollständige App entdecken →",
  untilNext: "In",
  now: "jetzt",
};

const MAP: Record<string, PrayerLabels> = { en: EN, id: ID, ar: AR, fr: FR, de: DE };

export function prayerLabels(locale: string): PrayerLabels {
  return MAP[locale] ?? EN;
}
