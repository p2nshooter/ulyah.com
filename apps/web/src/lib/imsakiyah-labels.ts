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

const FR: ImsakiyahLabels = {
  title: "Imsakiya du Ramadan",
  subtitle: "Les horaires quotidiens de l'Imsak, du Fajr et du Maghrib (iftar) pour tout le mois, selon votre position détectée.",
  locating: "Détection de votre position…",
  dayLabel: "Jour",
  imsakLabel: "Imsak",
  fajrLabel: "Fajr",
  maghribLabel: "Maghrib (iftar)",
  countingDown: "Le Ramadan n'a pas encore commencé — affichage du mois à venir.",
  disclaimer:
    "L'Imsak est affiché ici 10 minutes avant le Fajr, une convention de précaution (ihtiyat) courante dans de nombreux calendriers imprimés — certaines communautés considèrent le Fajr lui-même comme la limite de l'imsak. Les horaires sont calculés comme dans le widget des heures de prière (adhan.js, votre position détectée) et peuvent différer d'une ou deux minutes du calendrier de votre mosquée — suivez votre mosquée/autorité locale en cas de différence.",
};

const DE: ImsakiyahLabels = {
  title: "Ramadan-Imsākīya",
  subtitle: "Tägliche Imsak-, Fadschr- und Maghrib-Zeiten (Iftar) für den ganzen Monat, für deinen erkannten Standort.",
  locating: "Standort wird erkannt…",
  dayLabel: "Tag",
  imsakLabel: "Imsak",
  fajrLabel: "Fadschr",
  maghribLabel: "Maghrib (Iftar)",
  countingDown: "Der Ramadan hat noch nicht begonnen — der kommende Monat wird angezeigt.",
  disclaimer:
    "Imsak wird hier 10 Minuten vor Fadschr angezeigt — eine verbreitete Vorsichtskonvention (Ihtiyat) vieler gedruckter Kalender; manche Gemeinden betrachten stattdessen Fadschr selbst als Imsak-Grenze. Die Zeiten werden wie im Gebetszeiten-Widget berechnet (adhan.js, dein erkannter Standort) und können um ein bis zwei Minuten vom Kalender deiner Moschee abweichen — folge im Zweifel deiner örtlichen Moschee/Autorität.",
};

const ES: ImsakiyahLabels = {
  title: "Imsakiya de Ramadán",
  subtitle: "Horarios diarios de Imsak, Fayr y Magrib (iftar) para todo el mes, según tu ubicación detectada.",
  locating: "Detectando tu ubicación…",
  dayLabel: "Día",
  imsakLabel: "Imsak",
  fajrLabel: "Fayr",
  maghribLabel: "Magrib (iftar)",
  countingDown: "El Ramadán aún no ha comenzado — se muestra el mes próximo.",
  disclaimer:
    "El Imsak se muestra aquí 10 minutos antes del Fayr, una convención de precaución (ihtiyat) habitual en muchos calendarios impresos — algunas comunidades consideran el propio Fayr como el límite del imsak. Los horarios se calculan igual que en el widget de horarios de oración (adhan.js, tu ubicación detectada) y pueden diferir en uno o dos minutos del calendario de tu mezquita — sigue a tu mezquita/autoridad local si difieren.",
};

const MAP: Record<string, ImsakiyahLabels> = { en: EN, id: ID, fr: FR, de: DE, es: ES };

export function imsakiyahLabels(locale: string): ImsakiyahLabels {
  return MAP[locale] ?? EN;
}
