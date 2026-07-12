// Self-contained UI strings for the Imsakiyah Ramadhan calendar, same
// pattern as zakat-labels.ts / waris-labels.ts. English is the fallback.

export interface ImsakiyahLabels {
  title: string;
  subtitle: string;
  locating: string;
  dayLabel: string;
  imsakLabel: string;
  fajrLabel: string;
  maghribLabel: string;
  countingDown: string;
  disclaimer: string;
}

const EN: ImsakiyahLabels = {
  title: "Ramadan Imsakiyah",
  subtitle: "Daily Imsak, Fajr, and Maghrib (iftar) times for the whole month, for your detected location.",
  locating: "Detecting your location…",
  dayLabel: "Day",
  imsakLabel: "Imsak",
  fajrLabel: "Fajr",
  maghribLabel: "Maghrib (iftar)",
  countingDown: "Ramadan hasn't started yet — showing the upcoming month.",
  disclaimer:
    "Imsak here is shown as 10 minutes before Fajr, a common precautionary convention (ihtiyat) in many printed imsakiyah calendars — some communities instead treat Fajr itself as the imsak boundary. Times are computed the same way as the Jadwal Sholat widget (adhan.js, your detected location) and can differ by a minute or two from your local mosque's own schedule — follow your local mosque/authority when they differ.",
};

const ID: ImsakiyahLabels = {
  title: "Imsakiyah Ramadhan",
  subtitle: "Jadwal Imsak, Subuh, dan Maghrib (buka puasa) untuk satu bulan penuh, sesuai lokasi Anda.",
  locating: "Mendeteksi lokasi…",
  dayLabel: "Hari",
  imsakLabel: "Imsak",
  fajrLabel: "Subuh",
  maghribLabel: "Maghrib (buka puasa)",
  countingDown: "Ramadhan belum dimulai — menampilkan bulan Ramadhan yang akan datang.",
  disclaimer:
    "Imsak di sini ditampilkan 10 menit sebelum Subuh, konvensi ihtiyat (kehati-hatian) yang umum dipakai banyak kalender imsakiyah cetak — sebagian masjid/daerah justru menjadikan waktu Subuh itu sendiri sebagai batas imsak. Waktu dihitung dengan cara yang sama seperti widget Jadwal Sholat (adhan.js, lokasi terdeteksi Anda) dan bisa berbeda satu-dua menit dari jadwal masjid setempat — ikuti jadwal masjid/otoritas setempat bila berbeda.",
};

const MAP: Record<string, ImsakiyahLabels> = { en: EN, id: ID };

export function imsakiyahLabels(locale: string): ImsakiyahLabels {
  return MAP[locale] ?? EN;
}
