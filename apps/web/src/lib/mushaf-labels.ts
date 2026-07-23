import { fillLabels } from "./fill-labels";
// Self-contained UI strings for the Mushaf Utsmani reader, same pattern as
// radio-labels.ts / prayer-labels.ts. English is the fallback for locales
// not listed below.

export interface MushafLabels {
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  pageOf: (page: number, total: number) => string;
  juzLabel: string;
  jumpToSurah: string;
  jumpToJuz: string;
  prevPage: string;
  nextPage: string;
  playPage: string;
  stopPage: string;
  showTranslation: string;
  hideTranslation: string;
  translationLanguage: string;
  tafsirButton: string;
  tafsirTitle: string;
  tafsirSource: string;
  tafsirLoading: string;
  tafsirEmpty: string;
  closeButton: string;
  loadingPage: string;
  pageInputLabel: string;
  goButton: string;
}

const EN: MushafLabels = {
  navLabel: "Mushaf",
  metaTitle: "Mushaf Utsmani — Full Qur'an Reader with Page-Flip · ULYAH.COM",
  metaDescription:
    "Read the complete Qur'an in the standard 604-page Mushaf Utsmani layout, with a beautiful page-turn animation, translations in every site language, recitation audio, and tafsir from sources around the world including Indonesia's official Tafsir Kemenag.",
  title: "Mushaf Utsmani",
  subtitle: "The complete Qur'an, page by page, exactly as printed — with recitation, translation, and tafsir.",
  pageOf: (page, total) => `Page ${page} of ${total}`,
  juzLabel: "Juz",
  jumpToSurah: "Jump to Surah",
  jumpToJuz: "Jump to Juz",
  prevPage: "Previous page",
  nextPage: "Next page",
  playPage: "🔊 Listen to this page",
  stopPage: "⏹ Stop",
  showTranslation: "Show translation",
  hideTranslation: "Hide translation",
  translationLanguage: "Translation language",
  tafsirButton: "📖 Tafsir",
  tafsirTitle: "Tafsir",
  tafsirSource: "Source",
  tafsirLoading: "Loading tafsir…",
  tafsirEmpty: "No tafsir available for this ayah from this source.",
  closeButton: "Close",
  loadingPage: "Loading page…",
  pageInputLabel: "Page",
  goButton: "Go",
};

const ID: MushafLabels = {
  navLabel: "Mushaf",
  metaTitle: "Mushaf Utsmani — Baca Al-Qur'an Lengkap dengan Animasi Balik Halaman · ULYAH.COM",
  metaDescription:
    "Baca Al-Qur'an lengkap 604 halaman sesuai layout Mushaf Utsmani standar, dengan animasi balik halaman yang indah, terjemah dalam semua bahasa situs, murottal, dan tafsir dari berbagai sumber dunia termasuk Tafsir Kemenag RI resmi.",
  title: "Mushaf Utsmani",
  subtitle: "Al-Qur'an lengkap, halaman demi halaman, persis seperti mushaf cetak — dengan murottal, terjemah, dan tafsir.",
  pageOf: (page, total) => `Halaman ${page} dari ${total}`,
  juzLabel: "Juz",
  jumpToSurah: "Lompat ke Surah",
  jumpToJuz: "Lompat ke Juz",
  prevPage: "Halaman sebelumnya",
  nextPage: "Halaman berikutnya",
  playPage: "🔊 Dengarkan halaman ini",
  stopPage: "⏹ Berhenti",
  showTranslation: "Tampilkan terjemah",
  hideTranslation: "Sembunyikan terjemah",
  translationLanguage: "Bahasa terjemah",
  tafsirButton: "📖 Tafsir",
  tafsirTitle: "Tafsir",
  tafsirSource: "Sumber",
  tafsirLoading: "Memuat tafsir…",
  tafsirEmpty: "Tafsir dari sumber ini belum tersedia untuk ayat ini.",
  closeButton: "Tutup",
  loadingPage: "Memuat halaman…",
  pageInputLabel: "Halaman",
  goButton: "Buka",
};

const AR: MushafLabels = {
  navLabel: "المصحف",
  metaTitle: "المصحف العثماني — قراءة القرآن الكامل بتقليب صفحات · ULYAH.COM",
  metaDescription:
    "اقرأ القرآن الكريم كاملاً بتخطيط المصحف العثماني القياسي المكوّن من 604 صفحة، مع حركة تقليب صفحات جميلة، وترجمات بكل لغات الموقع، وتلاوة صوتية، وتفاسير من مصادر حول العالم.",
  title: "المصحف العثماني",
  subtitle: "القرآن الكريم كاملاً، صفحة بصفحة، تماماً كما يُطبع — مع التلاوة والترجمة والتفسير.",
  pageOf: (page, total) => `صفحة ${page} من ${total}`,
  juzLabel: "الجزء",
  jumpToSurah: "انتقل إلى سورة",
  jumpToJuz: "انتقل إلى جزء",
  prevPage: "الصفحة السابقة",
  nextPage: "الصفحة التالية",
  playPage: "🔊 استمع لهذه الصفحة",
  stopPage: "⏹ إيقاف",
  showTranslation: "إظهار الترجمة",
  hideTranslation: "إخفاء الترجمة",
  translationLanguage: "لغة الترجمة",
  tafsirButton: "📖 التفسير",
  tafsirTitle: "التفسير",
  tafsirSource: "المصدر",
  tafsirLoading: "جارٍ تحميل التفسير…",
  tafsirEmpty: "لا يوجد تفسير متاح لهذه الآية من هذا المصدر.",
  closeButton: "إغلاق",
  loadingPage: "جارٍ تحميل الصفحة…",
  pageInputLabel: "الصفحة",
  goButton: "اذهب",
};

const FR: MushafLabels = {
  navLabel: "Moushaf",
  metaTitle: "Moushaf ʿUthmānī — Lecteur complet du Coran avec feuilletage",
  metaDescription:
    "Lisez le Coran complet dans la mise en page standard du Moushaf ʿUthmānī de 604 pages, avec une belle animation de feuilletage, des traductions dans toutes les langues du site, l'audio de la récitation et le tafsir de sources du monde entier.",
  title: "Moushaf ʿUthmānī",
  subtitle: "Le Coran complet, page par page, exactement comme imprimé — avec récitation, traduction et tafsir.",
  pageOf: (page, total) => `Page ${page} sur ${total}`,
  juzLabel: "Juz'",
  jumpToSurah: "Aller à la sourate",
  jumpToJuz: "Aller au Juz'",
  prevPage: "Page précédente",
  nextPage: "Page suivante",
  playPage: "🔊 Écouter cette page",
  stopPage: "⏹ Arrêter",
  showTranslation: "Afficher la traduction",
  hideTranslation: "Masquer la traduction",
  translationLanguage: "Langue de traduction",
  tafsirButton: "📖 Tafsir",
  tafsirTitle: "Tafsir",
  tafsirSource: "Source",
  tafsirLoading: "Chargement du tafsir…",
  tafsirEmpty: "Aucun tafsir disponible pour ce verset depuis cette source.",
  closeButton: "Fermer",
  loadingPage: "Chargement de la page…",
  pageInputLabel: "Page",
  goButton: "Aller",
};

const DE: MushafLabels = {
  navLabel: "Mushaf",
  metaTitle: "ʿUthmānī-Mushaf — vollständiger Koran-Leser mit Blätter-Animation",
  metaDescription:
    "Lesen Sie den vollständigen Koran im gängigen 604-seitigen ʿUthmānī-Mushaf-Layout, mit schöner Blätter-Animation, Übersetzungen in allen Sprachen der Website, Rezitations-Audio und Tafsir aus Quellen weltweit.",
  title: "ʿUthmānī-Mushaf",
  subtitle: "Der vollständige Koran, Seite für Seite, genau wie gedruckt — mit Rezitation, Übersetzung und Tafsir.",
  pageOf: (page, total) => `Seite ${page} von ${total}`,
  juzLabel: "Dschuzʾ",
  jumpToSurah: "Zur Sure springen",
  jumpToJuz: "Zum Dschuzʾ springen",
  prevPage: "Vorherige Seite",
  nextPage: "Nächste Seite",
  playPage: "🔊 Diese Seite anhören",
  stopPage: "⏹ Stopp",
  showTranslation: "Übersetzung anzeigen",
  hideTranslation: "Übersetzung ausblenden",
  translationLanguage: "Übersetzungssprache",
  tafsirButton: "📖 Tafsir",
  tafsirTitle: "Tafsir",
  tafsirSource: "Quelle",
  tafsirLoading: "Tafsir wird geladen…",
  tafsirEmpty: "Für diesen Vers ist aus dieser Quelle kein Tafsir verfügbar.",
  closeButton: "Schließen",
  loadingPage: "Seite wird geladen…",
  pageInputLabel: "Seite",
  goButton: "Los",
};

const ES: MushafLabels = {
  navLabel: "Mushaf",
  metaTitle: "Mushaf Uzmani — lector completo del Corán con paso de página",
  metaDescription:
    "Lee el Corán completo en la maquetación estándar del Mushaf Uzmani de 604 páginas, con una bella animación de paso de página, traducciones en todos los idiomas del sitio, audio de recitación y tafsir de fuentes de todo el mundo.",
  title: "Mushaf Uzmani",
  subtitle: "El Corán completo, página a página, exactamente como impreso — con recitación, traducción y tafsir.",
  pageOf: (page, total) => `Página ${page} de ${total}`,
  juzLabel: "Yuz",
  jumpToSurah: "Ir a la sura",
  jumpToJuz: "Ir al yuz",
  prevPage: "Página anterior",
  nextPage: "Página siguiente",
  playPage: "🔊 Escuchar esta página",
  stopPage: "⏹ Detener",
  showTranslation: "Mostrar la traducción",
  hideTranslation: "Ocultar la traducción",
  translationLanguage: "Idioma de la traducción",
  tafsirButton: "📖 Tafsir",
  tafsirTitle: "Tafsir",
  tafsirSource: "Fuente",
  tafsirLoading: "Cargando el tafsir…",
  tafsirEmpty: "No hay tafsir disponible para este versículo desde esta fuente.",
  closeButton: "Cerrar",
  loadingPage: "Cargando la página…",
  pageInputLabel: "Página",
  goButton: "Ir",
};

const MAP: Record<string, MushafLabels> = { en: EN, id: ID, ar: AR, fr: FR, de: DE, es: ES };

export function mushafLabels(locale: string): MushafLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
