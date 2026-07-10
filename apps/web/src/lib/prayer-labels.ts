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
};

const MAP: Record<string, PrayerLabels> = { en: EN, id: ID, ar: AR };

export function prayerLabels(locale: string): PrayerLabels {
  return MAP[locale] ?? EN;
}
