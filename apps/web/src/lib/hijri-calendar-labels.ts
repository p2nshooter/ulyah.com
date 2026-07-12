// Self-contained UI strings for the Hijri calendar page, same pattern as
// contact-labels.ts / zakat-labels.ts / qibla-labels.ts. English is the
// fallback for locales not listed.

export interface HijriCalendarLabels {
  title: string;
  subtitle: string;
  todayLabel: string;
  prev: string;
  next: string;
  today: string;
  disclaimer: string;
}

const EN: HijriCalendarLabels = {
  title: "Hijri Calendar",
  subtitle: "Gregorian dates alongside their Hijri (Umm al-Qura) equivalent.",
  todayLabel: "Today",
  prev: "◀ Previous",
  next: "Next ▶",
  today: "Today",
  disclaimer:
    "Calculated using the Umm al-Qura calendar (the same system Saudi Arabia uses officially), not local moon sighting — the actual start of a month announced in your country may differ by a day.",
};

const ID: HijriCalendarLabels = {
  title: "Kalender Hijriyah",
  subtitle: "Tanggal Masehi berdampingan dengan padanan Hijriyah (Umm al-Qura).",
  todayLabel: "Hari ini",
  prev: "◀ Sebelumnya",
  next: "Berikutnya ▶",
  today: "Hari ini",
  disclaimer:
    "Dihitung memakai kalender Umm al-Qura (sistem resmi yang dipakai Arab Saudi), bukan rukyatul hilal lokal — awal bulan yang diumumkan di negara Anda bisa berbeda 1 hari.",
};

const AR: HijriCalendarLabels = {
  title: "التقويم الهجري",
  subtitle: "التواريخ الميلادية إلى جانب ما يقابلها بالتقويم الهجري (أم القرى).",
  todayLabel: "اليوم",
  prev: "◀ السابق",
  next: "التالي ▶",
  today: "اليوم",
  disclaimer: "محسوب وفق تقويم أم القرى (النظام الرسمي في السعودية)، وليس الرؤية المحلية للهلال — قد يختلف بداية الشهر المعلن في بلدك بيوم واحد.",
};

const MAP: Record<string, HijriCalendarLabels> = { en: EN, id: ID, ar: AR };

export function hijriCalendarLabels(locale: string): HijriCalendarLabels {
  return MAP[locale] ?? EN;
}
