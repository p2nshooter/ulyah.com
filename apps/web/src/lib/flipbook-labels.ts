// Self-contained UI strings for the Quran Flipbook widget, same pattern as
// radio-labels.ts. English is the fallback for locales not listed.

export interface FlipbookLabels {
  title: string;
  subtitle: string;
  installStandalone: string;
  pageOf: string;
  prevPage: string;
  nextPage: string;
  tapHint: string;
  chooseSurah: string;
}

const EN: FlipbookLabels = {
  title: "Mushaf Utsmani (App)",
  subtitle: "The full 604-page Mushaf Utsmani with a page-turn animation — installable on your home screen as its own app.",
  installStandalone: "Install as a standalone app",
  pageOf: "Page",
  prevPage: "Previous page",
  nextPage: "Next page",
  tapHint: "Tap the edges or swipe to turn the page",
  chooseSurah: "Choose a surah",
};

const ID: FlipbookLabels = {
  title: "Mushaf Utsmani (Aplikasi)",
  subtitle: "Mushaf Utsmani lengkap 604 halaman dengan animasi balik halaman — bisa dipasang di layar utama HP sebagai aplikasi sendiri.",
  installStandalone: "Pasang sebagai aplikasi tersendiri",
  pageOf: "Halaman",
  prevPage: "Halaman sebelumnya",
  nextPage: "Halaman berikutnya",
  tapHint: "Ketuk tepi halaman atau geser untuk membalik",
  chooseSurah: "Pilih surah",
};

const AR: FlipbookLabels = {
  title: "المصحف العثماني (تطبيق)",
  subtitle: "المصحف العثماني الكامل ٦٠٤ صفحات مع تقليب الصفحات — يثبت على الشاشة الرئيسية كتطبيق مستقل.",
  installStandalone: "ثبّته كتطبيق مستقل",
  pageOf: "صفحة",
  prevPage: "الصفحة السابقة",
  nextPage: "الصفحة التالية",
  tapHint: "اضغط على الحواف أو مرر لتقليب الصفحة",
  chooseSurah: "اختر سورة",
};

const FR: FlipbookLabels = {
  title: "Mushaf Uthmani (application)",
  subtitle: "Le Mushaf Uthmani complet de 604 pages avec une animation de tourne-page — installable sur votre écran d'accueil comme application indépendante.",
  installStandalone: "Installer comme application indépendante",
  pageOf: "Page",
  prevPage: "Page précédente",
  nextPage: "Page suivante",
  tapHint: "Touchez les bords ou faites glisser pour tourner la page",
  chooseSurah: "Choisir une sourate",
};

const DE: FlipbookLabels = {
  title: "Uthmani-Mushaf (App)",
  subtitle: "Der vollständige Uthmani-Mushaf mit 604 Seiten und Umblätter-Animation — als eigene App auf dem Startbildschirm installierbar.",
  installStandalone: "Als eigenständige App installieren",
  pageOf: "Seite",
  prevPage: "Vorherige Seite",
  nextPage: "Nächste Seite",
  tapHint: "Tippe auf die Ränder oder wische, um umzublättern",
  chooseSurah: "Sure wählen",
};

const ES: FlipbookLabels = {
  title: "Mushaf Uzmani (aplicación)",
  subtitle: "El Mushaf Uzmani completo de 604 páginas con animación de paso de página — instalable en tu pantalla de inicio como aplicación independiente.",
  installStandalone: "Instalar como aplicación independiente",
  pageOf: "Página",
  prevPage: "Página anterior",
  nextPage: "Página siguiente",
  tapHint: "Toca los bordes o desliza para pasar la página",
  chooseSurah: "Elegir una sura",
};

const MAP: Record<string, FlipbookLabels> = { en: EN, id: ID, ar: AR, fr: FR, de: DE, es: ES };

export function flipbookLabels(locale: string): FlipbookLabels {
  return MAP[locale] ?? EN;
}
