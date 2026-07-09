// Localized UI strings for the Kitab library only. Kept out of the global
// Dictionary type on purpose — the library is a self-contained surface and
// this avoids threading ~10 new keys through all eight locale files. English
// is the fallback for any locale not listed.

export interface KitabLabels {
  title: string;
  subtitle: string;
  categories: string;
  works: string;
  browse: string;
  searchPlaceholder: string;
  author: string;
  died: string;
  topics: string;
  about: string;
  listen: string;
  stop: string;
  source: string;
  backToCategories: string;
  backToCategory: string;
  noResults: string;
  prev: string;
  next: string;
  page: string;
  worksInCategory: string;
  openWork: string;
  note: string;
  arabicOnlyNote: string;
}

const EN: KitabLabels = {
  title: "Islamic Library",
  subtitle: "Classical works of the Islamic tradition — tafsir, hadith, the four madzhab, sirah, history and the lives of the scholars. Every summary can be listened to aloud.",
  categories: "Categories",
  works: "works",
  browse: "Browse",
  searchPlaceholder: "Search a work or author…",
  author: "Author",
  died: "d.",
  topics: "Topics covered",
  about: "About this work",
  listen: "Listen",
  stop: "Stop",
  source: "Source",
  backToCategories: "All categories",
  backToCategory: "Back to category",
  noResults: "No works found.",
  prev: "Previous",
  next: "Next",
  page: "Page",
  worksInCategory: "works in this category",
  openWork: "Open",
  note: "Catalogue and summaries only, for study and reference.",
  arabicOnlyNote: "This work's description is in Arabic, the original classical source language — read aloud with an Arabic voice below.",
};

const ID: KitabLabels = {
  title: "Perpustakaan Islam",
  subtitle: "Kitab-kitab klasik khazanah Islam — tafsir, hadits, empat madzhab, sirah, sejarah, dan kisah para ulama. Setiap ringkasan bisa didengarkan dengan suara.",
  categories: "Kategori",
  works: "kitab",
  browse: "Telusuri",
  searchPlaceholder: "Cari kitab atau penulis…",
  author: "Penulis",
  died: "wafat",
  topics: "Pembahasan",
  about: "Tentang kitab ini",
  listen: "Dengarkan",
  stop: "Hentikan",
  source: "Sumber",
  backToCategories: "Semua kategori",
  backToCategory: "Kembali ke kategori",
  noResults: "Tidak ada kitab ditemukan.",
  prev: "Sebelumnya",
  next: "Berikutnya",
  page: "Halaman",
  worksInCategory: "kitab dalam kategori ini",
  openWork: "Buka",
  note: "Hanya katalog dan ringkasan, untuk studi dan rujukan.",
  arabicOnlyNote: "Ringkasan kitab ini berbahasa Arab, bahasa sumber aslinya — bisa didengarkan dengan suara Arab di bawah ini.",
};

const AR: KitabLabels = {
  title: "المكتبة الإسلامية",
  subtitle: "أمهات الكتب في التراث الإسلامي — التفسير والحديث والمذاهب الأربعة والسيرة والتاريخ وتراجم العلماء. كل تعريف يمكن الاستماع إليه.",
  categories: "التصنيفات",
  works: "كتاب",
  browse: "تصفح",
  searchPlaceholder: "ابحث عن كتاب أو مؤلف…",
  author: "المؤلف",
  died: "ت",
  topics: "الموضوعات",
  about: "عن الكتاب",
  listen: "استماع",
  stop: "إيقاف",
  source: "المصدر",
  backToCategories: "كل التصنيفات",
  backToCategory: "العودة للتصنيف",
  noResults: "لا توجد كتب.",
  prev: "السابق",
  next: "التالي",
  page: "صفحة",
  worksInCategory: "كتاب في هذا التصنيف",
  openWork: "افتح",
  note: "فهرس وتعريفات فقط، للدراسة والمراجعة.",
  arabicOnlyNote: "",
};

const MAP: Record<string, KitabLabels> = { en: EN, id: ID, ar: AR };

export function kitabLabels(locale: string): KitabLabels {
  return MAP[locale] ?? EN;
}
