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

const MAP: Record<string, FlipbookLabels> = { en: EN, id: ID, ar: AR };

export function flipbookLabels(locale: string): FlipbookLabels {
  return MAP[locale] ?? EN;
}
