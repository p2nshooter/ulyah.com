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
  title: "Qur'an Flipbook",
  subtitle: "A page-turning Mushaf you can read right in the browser — swipe or tap to turn the page.",
  installStandalone: "Install as a standalone app",
  pageOf: "Page",
  prevPage: "Previous page",
  nextPage: "Next page",
  tapHint: "Tap the edges or swipe to turn the page",
  chooseSurah: "Choose a surah",
};

const ID: FlipbookLabels = {
  title: "Al-Qur'an Flipbook",
  subtitle: "Mushaf yang bisa dibalik halamannya langsung di browser — ketuk atau geser untuk membalik halaman.",
  installStandalone: "Pasang sebagai aplikasi tersendiri",
  pageOf: "Halaman",
  prevPage: "Halaman sebelumnya",
  nextPage: "Halaman berikutnya",
  tapHint: "Ketuk tepi halaman atau geser untuk membalik",
  chooseSurah: "Pilih surah",
};

const AR: FlipbookLabels = {
  title: "المصحف المتصفح",
  subtitle: "مصحف يمكنك تقليب صفحاته مباشرة في المتصفح — اضغط أو مرر لتقليب الصفحة.",
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
