// Self-contained UI strings for the Kitab Hadits reader, same pattern as
// kitab-labels.ts — keeps a focused surface from threading ~12 keys through
// every locale dictionary. English is the fallback for any locale not listed.

export interface HaditsLabels {
  title: string;
  subtitle: string;
  books: string;
  hadithCount: string;
  author: string;
  read: string;
  backToBooks: string;
  hadithNo: string;
  narrator: string;
  grade: string;
  listen: string;
  stop: string;
  playAll: string;
  pause: string;
  prev: string;
  next: string;
  page: string;
  of: string;
  translatedNote: string;
  noResults: string;
}

const EN: HaditsLabels = {
  title: "Hadith Library",
  subtitle:
    "The nine books of the Sunnah plus the Forty Hadith of an-Nawawi and the Hadith Qudsi — read in full, Arabic with translation, every hadith narratable aloud.",
  books: "books",
  hadithCount: "hadith",
  author: "Compiler",
  read: "Read",
  backToBooks: "All books",
  hadithNo: "Hadith",
  narrator: "Narrator",
  grade: "Grade",
  listen: "Listen",
  stop: "Stop",
  playAll: "Play all",
  pause: "Pause",
  prev: "Previous",
  next: "Next",
  page: "Page",
  of: "of",
  translatedNote: "Indonesian translation generated automatically from the Arabic.",
  noResults: "No hadith found.",
};

const ID: HaditsLabels = {
  title: "Perpustakaan Hadits",
  subtitle:
    "Sembilan kitab hadits utama ditambah Arba'in An-Nawawi dan Hadits Qudsi — dibaca lengkap, teks Arab beserta terjemahan, setiap hadits bisa didengarkan dengan suara.",
  books: "kitab",
  hadithCount: "hadits",
  author: "Penyusun",
  read: "Baca",
  backToBooks: "Semua kitab",
  hadithNo: "Hadits",
  narrator: "Perawi",
  grade: "Derajat",
  listen: "Dengarkan",
  stop: "Hentikan",
  playAll: "Putar Semua",
  pause: "Jeda",
  prev: "Sebelumnya",
  next: "Berikutnya",
  page: "Halaman",
  of: "dari",
  translatedNote: "Terjemahan Indonesia dihasilkan otomatis dari teks Arab.",
  noResults: "Tidak ada hadits ditemukan.",
};

const AR: HaditsLabels = {
  title: "مكتبة الحديث",
  subtitle: "الكتب التسعة مع الأربعين النووية والأحاديث القدسية — تُقرأ كاملة مع الترجمة، ويمكن الاستماع إلى كل حديث.",
  books: "كتاب",
  hadithCount: "حديث",
  author: "المؤلف",
  read: "اقرأ",
  backToBooks: "كل الكتب",
  hadithNo: "حديث",
  narrator: "الراوي",
  grade: "الدرجة",
  listen: "استماع",
  stop: "إيقاف",
  playAll: "تشغيل الكل",
  pause: "إيقاف مؤقت",
  prev: "السابق",
  next: "التالي",
  page: "صفحة",
  of: "من",
  translatedNote: "",
  noResults: "لا توجد أحاديث.",
};

const MAP: Record<string, HaditsLabels> = { en: EN, id: ID, ar: AR };

export function haditsLabels(locale: string): HaditsLabels {
  return MAP[locale] ?? EN;
}
