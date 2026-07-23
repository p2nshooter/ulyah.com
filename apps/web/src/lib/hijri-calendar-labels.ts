import { fillLabels } from "./fill-labels";
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

const FR: HijriCalendarLabels = {
  title: "Calendrier hégirien",
  subtitle: "Les dates grégoriennes aux côtés de leur équivalent hégirien (Umm al-Qura).",
  todayLabel: "Aujourd'hui",
  prev: "◀ Précédent",
  next: "Suivant ▶",
  today: "Aujourd'hui",
  disclaimer:
    "Calculé selon le calendrier Umm al-Qura (le système officiel de l'Arabie saoudite), et non l'observation locale du croissant — le début réel du mois annoncé dans votre pays peut différer d'un jour.",
};

const DE: HijriCalendarLabels = {
  title: "Hidschri-Kalender",
  subtitle: "Gregorianische Daten neben ihrer hidschri (Umm-al-Qura-)Entsprechung.",
  todayLabel: "Heute",
  prev: "◀ Zurück",
  next: "Weiter ▶",
  today: "Heute",
  disclaimer:
    "Berechnet nach dem Umm-al-Qura-Kalender (das offizielle System Saudi-Arabiens), nicht nach lokaler Mondsichtung — der tatsächliche Monatsbeginn in Ihrem Land kann um einen Tag abweichen.",
};

const ES: HijriCalendarLabels = {
  title: "Calendario hegiriano",
  subtitle: "Las fechas gregorianas junto a su equivalente hegiriano (Umm al-Qura).",
  todayLabel: "Hoy",
  prev: "◀ Anterior",
  next: "Siguiente ▶",
  today: "Hoy",
  disclaimer:
    "Calculado con el calendario Umm al-Qura (el sistema oficial de Arabia Saudí), no con el avistamiento local de la luna — el inicio real del mes anunciado en tu país puede diferir en un día.",
};

const MAP: Record<string, HijriCalendarLabels> = { en: EN, id: ID, ar: AR, fr: FR, de: DE, es: ES };

export function hijriCalendarLabels(locale: string): HijriCalendarLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
