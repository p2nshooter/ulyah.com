import { fillLabels } from "./fill-labels";
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
  /** Shown when the library could not be loaded right now (error boundary). */
  unavailable: string;
  retry: string;
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
  unavailable: "The hadith library could not be loaded just now. Please try again in a moment.",
  retry: "Try again",
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
  unavailable: "Perpustakaan hadits sedang tidak dapat dimuat. Silakan coba lagi sebentar lagi.",
  retry: "Coba lagi",
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
  unavailable: "تعذّر تحميل مكتبة الحديث الآن. يرجى المحاولة بعد قليل.",
  retry: "أعد المحاولة",
};

const FR: HaditsLabels = {
  title: "Bibliothèque de hadiths",
  subtitle:
    "Les neuf livres de la Sunna, plus les Quarante Hadiths de an-Nawawî et les Hadiths Qudsî — à lire en entier, en arabe avec traduction, chaque hadith pouvant être écouté à voix haute.",
  books: "livres",
  hadithCount: "hadiths",
  author: "Compilateur",
  read: "Lire",
  backToBooks: "Tous les livres",
  hadithNo: "Hadith",
  narrator: "Rapporteur",
  grade: "Degré",
  listen: "Écouter",
  stop: "Arrêter",
  playAll: "Tout lire",
  pause: "Pause",
  prev: "Précédent",
  next: "Suivant",
  page: "Page",
  of: "sur",
  translatedNote: "Traduction générée automatiquement à partir de l'arabe.",
  noResults: "Aucun hadith trouvé.",
  unavailable: "La bibliothèque de hadiths n’a pas pu être chargée pour le moment. Veuillez réessayer dans un instant.",
  retry: "Réessayer",
};

const DE: HaditsLabels = {
  title: "Hadith-Bibliothek",
  subtitle:
    "Die neun Bücher der Sunna sowie die Vierzig Hadithe von an-Nawawî und die Hadith Qudsî — vollständig zu lesen, Arabisch mit Übersetzung, jeder Hadith laut vorlesbar.",
  books: "Bücher",
  hadithCount: "Hadithe",
  author: "Verfasser",
  read: "Lesen",
  backToBooks: "Alle Bücher",
  hadithNo: "Hadith",
  narrator: "Überlieferer",
  grade: "Grad",
  listen: "Anhören",
  stop: "Stopp",
  playAll: "Alle abspielen",
  pause: "Pause",
  prev: "Zurück",
  next: "Weiter",
  page: "Seite",
  of: "von",
  translatedNote: "Übersetzung automatisch aus dem Arabischen erstellt.",
  noResults: "Keine Hadithe gefunden.",
  unavailable: "Die Hadith-Bibliothek konnte gerade nicht geladen werden. Bitte versuchen Sie es gleich noch einmal.",
  retry: "Erneut versuchen",
};

const ES: HaditsLabels = {
  title: "Biblioteca de hadices",
  subtitle:
    "Los nueve libros de la Sunna, más los Cuarenta Hadices de an-Nawawi y los Hadices Qudsí — para leer completos, en árabe con traducción, y cada hadiz puede escucharse en voz alta.",
  books: "libros",
  hadithCount: "hadices",
  author: "Compilador",
  read: "Leer",
  backToBooks: "Todos los libros",
  hadithNo: "Hadiz",
  narrator: "Transmisor",
  grade: "Grado",
  listen: "Escuchar",
  stop: "Detener",
  playAll: "Reproducir todo",
  pause: "Pausa",
  prev: "Anterior",
  next: "Siguiente",
  page: "Página",
  of: "de",
  translatedNote: "Traducción generada automáticamente a partir del árabe.",
  noResults: "No se encontraron hadices.",
  unavailable: "No se pudo cargar la biblioteca de hadices en este momento. Inténtelo de nuevo en un instante.",
  retry: "Reintentar",
};

const MAP: Record<string, HaditsLabels> = { en: EN, id: ID, ar: AR, fr: FR, de: DE, es: ES };

export function haditsLabels(locale: string): HaditsLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
