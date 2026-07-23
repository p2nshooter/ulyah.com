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
  translationLabel: string;
  bridgeTitle: string;
  bridgeDesc: string;
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
  translationLabel: "Translation",
  bridgeTitle: "Pesantren Books — Digital Library",
  bridgeDesc: "Classical books, neatly arranged by field: Arabic text, translation & explanation, chapter by chapter — read and listened to.",
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
  translationLabel: "Terjemahan",
  bridgeTitle: "Kitab Pesantren — Perpustakaan Digital",
  bridgeDesc: "Kitab kuning tersusun rapi per bidang: teks Arab, terjemah & penjelasan, bab per bab — bisa dibaca & didengarkan.",
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
  translationLabel: "",
  bridgeTitle: "كتب المعاهد — مكتبة رقمية",
  bridgeDesc: "كتب كلاسيكية مرتبة حسب المجال: النص العربي والترجمة والشرح، بابًا بابًا — تُقرأ وتُستمع.",
};

const FR: KitabLabels = {
  title: "Bibliothèque islamique",
  subtitle: "Les ouvrages classiques de la tradition islamique — tafsir, hadith, les quatre madhhab, sîra, histoire et vies des savants. Chaque résumé peut être écouté à voix haute.",
  categories: "Catégories",
  works: "ouvrages",
  browse: "Parcourir",
  searchPlaceholder: "Rechercher un ouvrage ou un auteur…",
  author: "Auteur",
  died: "m.",
  topics: "Sujets abordés",
  about: "À propos de cet ouvrage",
  listen: "Écouter",
  stop: "Arrêter",
  source: "Source",
  backToCategories: "Toutes les catégories",
  backToCategory: "Retour à la catégorie",
  noResults: "Aucun ouvrage trouvé.",
  prev: "Précédent",
  next: "Suivant",
  page: "Page",
  worksInCategory: "ouvrages dans cette catégorie",
  openWork: "Ouvrir",
  note: "Catalogue et résumés uniquement, pour l'étude et la référence.",
  arabicOnlyNote: "La description de cet ouvrage est en arabe, la langue classique d'origine — lue à voix haute avec une voix arabe ci-dessous.",
  translationLabel: "Traduction",
  bridgeTitle: "Livres de pesantren — Bibliothèque numérique",
  bridgeDesc: "Livres classiques, classés par domaine : texte arabe, traduction et explication, chapitre par chapitre — à lire et à écouter.",
};

const DE: KitabLabels = {
  title: "Islamische Bibliothek",
  subtitle: "Die klassischen Werke der islamischen Tradition — Tafsir, Hadith, die vier Madhhab, Sīra, Geschichte und die Lebensläufe der Gelehrten. Jede Zusammenfassung kann laut vorgelesen werden.",
  categories: "Kategorien",
  works: "Werke",
  browse: "Durchsuchen",
  searchPlaceholder: "Werk oder Autor suchen…",
  author: "Autor",
  died: "gest.",
  topics: "Behandelte Themen",
  about: "Über dieses Werk",
  listen: "Anhören",
  stop: "Stopp",
  source: "Quelle",
  backToCategories: "Alle Kategorien",
  backToCategory: "Zurück zur Kategorie",
  noResults: "Keine Werke gefunden.",
  prev: "Zurück",
  next: "Weiter",
  page: "Seite",
  worksInCategory: "Werke in dieser Kategorie",
  openWork: "Öffnen",
  note: "Nur Katalog und Zusammenfassungen, zum Studium und als Referenz.",
  arabicOnlyNote: "Die Beschreibung dieses Werks ist auf Arabisch, der klassischen Originalsprache — unten mit arabischer Stimme vorgelesen.",
  translationLabel: "Übersetzung",
  bridgeTitle: "Pesantren-Bücher — Digitale Bibliothek",
  bridgeDesc: "Klassische Bücher, ordentlich nach Fach geordnet: arabischer Text, Übersetzung & Erläuterung, Kapitel für Kapitel — zum Lesen und Anhören.",
};

const ES: KitabLabels = {
  title: "Biblioteca islámica",
  subtitle: "Las obras clásicas de la tradición islámica — tafsir, hadices, las cuatro escuelas, sira, historia y las vidas de los sabios. Cada resumen puede escucharse en voz alta.",
  categories: "Categorías",
  works: "obras",
  browse: "Explorar",
  searchPlaceholder: "Busca una obra o un autor…",
  author: "Autor",
  died: "f.",
  topics: "Temas tratados",
  about: "Sobre esta obra",
  listen: "Escuchar",
  stop: "Detener",
  source: "Fuente",
  backToCategories: "Todas las categorías",
  backToCategory: "Volver a la categoría",
  noResults: "No se encontraron obras.",
  prev: "Anterior",
  next: "Siguiente",
  page: "Página",
  worksInCategory: "obras en esta categoría",
  openWork: "Abrir",
  note: "Solo catálogo y resúmenes, para estudio y referencia.",
  arabicOnlyNote: "La descripción de esta obra está en árabe, la lengua clásica original — se lee en voz alta con una voz árabe abajo.",
  translationLabel: "Traducción",
  bridgeTitle: "Libros de pesantren — Biblioteca digital",
  bridgeDesc: "Libros clásicos, ordenados por materia: texto árabe, traducción y explicación, capítulo por capítulo — para leer y escuchar.",
};

const MAP: Record<string, KitabLabels> = { en: EN, id: ID, ar: AR, fr: FR, de: DE, es: ES };

export function kitabLabels(locale: string): KitabLabels {
  return MAP[locale] ?? EN;
}
