// Self-contained UI strings for the Qibla compass, same pattern as
// contact-labels.ts / zakat-labels.ts. English is the fallback for locales
// not listed.

export interface QiblaLabels {
  title: string;
  subtitle: string;
  locating: string;
  locationLabel: string;
  bearingLabel: string;
  distanceLabel: string;
  howToUse: string;
  manualNote: string;
  errorLabel: string;
}

const EN: QiblaLabels = {
  title: "Qibla Direction",
  subtitle: "The direction and distance to the Kaaba from your current location.",
  locating: "Detecting your location…",
  locationLabel: "Your location",
  bearingLabel: "Qibla bearing (from true North)",
  distanceLabel: "Distance to the Kaaba",
  howToUse:
    "Lay a real compass flat, find North, then turn to face the angle shown above (measured clockwise from North) — that is the qibla direction from where you are.",
  manualNote: "Location is estimated from your network/IP, so it may be off by a city's width — fine for a compass bearing, not for pinpoint mapping.",
  errorLabel: "Couldn't detect your location — try again in a moment.",
};

const ID: QiblaLabels = {
  title: "Arah Kiblat",
  subtitle: "Arah dan jarak ke Ka'bah dari lokasi Anda saat ini.",
  locating: "Mendeteksi lokasi Anda…",
  locationLabel: "Lokasi Anda",
  bearingLabel: "Sudut kiblat (dari Utara sejati)",
  distanceLabel: "Jarak ke Ka'bah",
  howToUse:
    "Letakkan kompas asli mendatar, cari arah Utara, lalu putar badan menghadap sudut di atas (diukur searah jarum jam dari Utara) — itulah arah kiblat dari tempat Anda.",
  manualNote: "Lokasi diperkirakan dari jaringan/IP, jadi bisa meleset seukuran satu kota — cukup akurat untuk sudut kompas, bukan untuk peta presisi.",
  errorLabel: "Gagal mendeteksi lokasi — coba lagi sesaat lagi.",
};

const AR: QiblaLabels = {
  title: "اتجاه القبلة",
  subtitle: "الاتجاه والمسافة إلى الكعبة من موقعك الحالي.",
  locating: "جارٍ تحديد موقعك…",
  locationLabel: "موقعك",
  bearingLabel: "زاوية القبلة (من الشمال الحقيقي)",
  distanceLabel: "المسافة إلى الكعبة",
  howToUse: "ضع بوصلة حقيقية أفقيًا، حدد اتجاه الشمال، ثم استدر لمواجهة الزاوية أعلاه (بعقارب الساعة من الشمال) — هذا هو اتجاه القبلة من مكانك.",
  manualNote: "الموقع مقدَّر من الشبكة/IP، فقد يختلف بمقدار مدينة — كافٍ لزاوية البوصلة، وليس لخريطة دقيقة.",
  errorLabel: "تعذّر تحديد موقعك — حاول مرة أخرى بعد قليل.",
};

const MAP: Record<string, QiblaLabels> = { en: EN, id: ID, ar: AR };

export function qiblaLabels(locale: string): QiblaLabels {
  return MAP[locale] ?? EN;
}
