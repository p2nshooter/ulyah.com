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
  enableCompass: string;
  compassLive: string;
  compassHint: string;
  turnToKaaba: string;
  facingKaaba: string;
  compassUnsupported: string;
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
  enableCompass: "Enable live compass",
  compassLive: "Live compass — turn your phone until the arrow points straight up",
  compassHint: "Hold your phone flat and turn slowly; the gold arrow tracks the qibla in real time. If it drifts, wave the phone in a figure-8 to recalibrate.",
  turnToKaaba: "Turn to face the arrow",
  facingKaaba: "You are facing the qibla 🕋",
  compassUnsupported: "Your device has no compass sensor — use the fixed bearing above with a real compass instead.",
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
  enableCompass: "Aktifkan kompas langsung",
  compassLive: "Kompas langsung — putar HP hingga panah menunjuk lurus ke atas",
  compassHint: "Pegang HP mendatar dan putar perlahan; panah emas mengikuti arah kiblat secara langsung. Jika meleset, gerakkan HP membentuk angka 8 untuk kalibrasi.",
  turnToKaaba: "Putar badan mengikuti panah",
  facingKaaba: "Anda sudah menghadap kiblat 🕋",
  compassUnsupported: "Perangkat Anda tidak punya sensor kompas — gunakan sudut tetap di atas dengan kompas asli.",
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
  enableCompass: "تفعيل البوصلة المباشرة",
  compassLive: "بوصلة مباشرة — أدر هاتفك حتى يشير السهم إلى الأعلى",
  compassHint: "امسك هاتفك أفقيًا وأدره ببطء؛ يتتبع السهم الذهبي اتجاه القبلة مباشرة. إذا انحرف، حرّك الهاتف على شكل رقم 8 لإعادة المعايرة.",
  turnToKaaba: "استدر باتجاه السهم",
  facingKaaba: "أنت تواجه القبلة 🕋",
  compassUnsupported: "جهازك لا يحتوي على مستشعر بوصلة — استخدم الزاوية الثابتة أعلاه مع بوصلة حقيقية.",
};

const DE: QiblaLabels = {
  title: "Qibla-Richtung",
  subtitle: "Die Richtung und Entfernung zur Kaaba von deinem aktuellen Standort.",
  locating: "Standort wird ermittelt…",
  locationLabel: "Dein Standort",
  bearingLabel: "Qibla-Winkel (von geografisch Nord)",
  distanceLabel: "Entfernung zur Kaaba",
  howToUse:
    "Lege einen echten Kompass flach hin, finde Norden und drehe dich dann zum oben angezeigten Winkel (im Uhrzeigersinn von Norden) — das ist die Qibla-Richtung von deinem Standort aus.",
  manualNote: "Der Standort wird aus deinem Netzwerk/IP geschätzt und kann um eine Stadtbreite abweichen — genau genug für einen Kompasswinkel, nicht für punktgenaue Karten.",
  errorLabel: "Standort konnte nicht ermittelt werden — bitte gleich noch einmal versuchen.",
  enableCompass: "Live-Kompass aktivieren",
  compassLive: "Live-Kompass — drehe dein Telefon, bis der Pfeil gerade nach oben zeigt",
  compassHint: "Halte das Telefon flach und drehe dich langsam; der goldene Pfeil folgt der Qibla in Echtzeit. Bei Ungenauigkeit das Telefon in einer Acht bewegen zum Kalibrieren.",
  turnToKaaba: "Dreh dich in Pfeilrichtung",
  facingKaaba: "Du bist zur Qibla ausgerichtet 🕋",
  compassUnsupported: "Dein Gerät hat keinen Kompasssensor — nutze den festen Winkel oben mit einem echten Kompass.",
};

const FR: QiblaLabels = {
  title: "Direction de la Qibla",
  subtitle: "La direction et la distance vers la Kaaba depuis votre position actuelle.",
  locating: "Détection de votre position…",
  locationLabel: "Votre position",
  bearingLabel: "Angle de la Qibla (depuis le Nord géographique)",
  distanceLabel: "Distance jusqu'à la Kaaba",
  howToUse:
    "Posez une vraie boussole à plat, trouvez le Nord, puis tournez-vous vers l'angle indiqué ci-dessus (dans le sens horaire depuis le Nord) — c'est la direction de la Qibla depuis votre position.",
  manualNote: "La position est estimée d'après votre réseau/IP ; elle peut varier de la largeur d'une ville — suffisant pour un angle de boussole, pas pour une carte précise.",
  errorLabel: "Impossible de détecter votre position — réessayez dans un instant.",
  enableCompass: "Activer la boussole en direct",
  compassLive: "Boussole en direct — tournez votre téléphone jusqu'à ce que la flèche pointe droit vers le haut",
  compassHint: "Tenez le téléphone à plat et tournez lentement ; la flèche dorée suit la Qibla en temps réel. En cas d'imprécision, faites un huit avec le téléphone pour le calibrer.",
  turnToKaaba: "Tournez-vous vers la flèche",
  facingKaaba: "Vous êtes face à la Qibla 🕋",
  compassUnsupported: "Votre appareil n'a pas de capteur de boussole — utilisez l'angle fixe ci-dessus avec une vraie boussole.",
};

const MAP: Record<string, QiblaLabels> = { en: EN, id: ID, ar: AR, de: DE, fr: FR };

export function qiblaLabels(locale: string): QiblaLabels {
  return MAP[locale] ?? EN;
}
