// Self-contained UI strings for the Amalan Harian (Daily Practices) page and
// library — the chrome was hardcoded Indonesian and rendered Indonesian on
// every locale, including the German/French sibling sites (owner: "daily
// practise semua website make bahasa Indonesia"). English is the fallback.
// (The item CONTENT — du'a text, translations — is translated server-side by
// the content API; this only covers the surrounding UI.)

export interface AmalanLabels {
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDesc: string;
  loadError: string;
  categories: string;
  note: string;
  listen: string;
  playSequence: string;
  stop: string;
  audioAll: string;
  audioArabic: string;
  audioMeaning: string;
  groups: { doa: string; dzikir: string; asmaul: string; thibb: string; kecantikan: string };
}

const EN: AmalanLabels = {
  title: "Daily Practices",
  subtitle:
    "Du'a from waking to sleeping, dhikr, prophetic medicine (thibb an-nabawi), and the etiquette of cleanliness & grooming — all from authentic sources, with Arabic, transliteration, translation, and audio.",
  metaTitle: "Daily Practices — Du'a, Dhikr, Prophetic Medicine",
  metaDesc:
    "A tidy collection of daily practices: du'a from waking to sleeping, morning & evening dhikr, authentic prophetic medicine, and the etiquette of cleanliness & self-care — with Arabic, transliteration, translation, and audio.",
  loadError: "Failed to load the collection — please reload this page.",
  categories: "Categories",
  note: "Note",
  listen: "🔊 Listen",
  playSequence: "▶ Play in sequence",
  stop: "⏹ Stop",
  audioAll: "🔊 All",
  audioArabic: "﴿ Arabic",
  audioMeaning: "📖 Meaning",
  groups: {
    doa: "Daily Du'a",
    dzikir: "Dhikr",
    asmaul: "99 Names of Allah",
    thibb: "Prophetic Medicine",
    kecantikan: "Cleanliness & Grooming",
  },
};

const ID: AmalanLabels = {
  title: "Amalan Harian",
  subtitle:
    "Doa dari bangun tidur sampai tidur lagi, dzikir, thibbun nabawi (pengobatan Nabi ﷺ), dan adab kebersihan & keindahan — semua bersumber sahih, lengkap Arab, latin, terjemah, dan bisa didengarkan.",
  metaTitle: "Amalan Harian — Doa, Dzikir, Thibbun Nabawi",
  metaDesc:
    "Kumpulan amalan harian tersusun rapi: doa dari bangun tidur sampai tidur lagi, dzikir pagi-petang, pengobatan ala Nabi (thibbun nabawi) yang sahih, serta adab kebersihan & keindahan diri — lengkap Arab, latin, terjemah, dan suara.",
  loadError: "Gagal memuat koleksi — silakan muat ulang halaman ini.",
  categories: "Kategori",
  note: "Catatan",
  listen: "🔊 Dengarkan",
  playSequence: "▶ Putar berurutan",
  stop: "⏹ Berhenti",
  audioAll: "🔊 Semua",
  audioArabic: "﴿ Arab",
  audioMeaning: "📖 Arti",
  groups: {
    doa: "Doa Harian",
    dzikir: "Dzikir",
    asmaul: "99 Asmaul Husna",
    thibb: "Pengobatan (Thibbun Nabawi)",
    kecantikan: "Kebersihan & Keindahan",
  },
};

const AR: AmalanLabels = {
  title: "الأعمال اليومية",
  subtitle:
    "أدعية من الاستيقاظ إلى النوم، والأذكار، والطب النبوي، وآداب النظافة والجمال — كلها من مصادر صحيحة، مع العربية والحروف اللاتينية والترجمة والصوت.",
  metaTitle: "الأعمال اليومية — أدعية وأذكار وطب نبوي",
  metaDesc: "مجموعة منظمة من الأعمال اليومية: أدعية الاستيقاظ والنوم، أذكار الصباح والمساء، الطب النبوي الصحيح، وآداب النظافة والعناية.",
  loadError: "تعذّر تحميل المجموعة — يرجى إعادة تحميل الصفحة.",
  categories: "الفئات",
  note: "ملاحظة",
  listen: "🔊 استمع",
  playSequence: "▶ تشغيل بالتسلسل",
  stop: "⏹ إيقاف",
  audioAll: "🔊 الكل",
  audioArabic: "﴿ العربية",
  audioMeaning: "📖 المعنى",
  groups: {
    doa: "الأدعية اليومية",
    dzikir: "الأذكار",
    asmaul: "أسماء الله الحسنى",
    thibb: "الطب النبوي",
    kecantikan: "النظافة والجمال",
  },
};

const DE: AmalanLabels = {
  title: "Tägliche Praktiken",
  subtitle:
    "Bittgebete vom Aufwachen bis zum Schlafengehen, Dhikr, prophetische Medizin (Tibb an-Nabawi) und die Etikette von Sauberkeit & Pflege — alles aus authentischen Quellen, mit Arabisch, Umschrift, Übersetzung und Audio.",
  metaTitle: "Tägliche Praktiken — Bittgebete, Dhikr, Prophetische Medizin",
  metaDesc:
    "Eine übersichtliche Sammlung täglicher Praktiken: Bittgebete vom Aufwachen bis zum Schlafengehen, Morgen- & Abend-Dhikr, authentische prophetische Medizin und die Etikette von Sauberkeit & Selbstpflege — mit Arabisch, Umschrift, Übersetzung und Audio.",
  loadError: "Die Sammlung konnte nicht geladen werden — bitte laden Sie die Seite neu.",
  categories: "Kategorien",
  note: "Hinweis",
  listen: "🔊 Anhören",
  playSequence: "▶ Nacheinander abspielen",
  stop: "⏹ Stopp",
  audioAll: "🔊 Alle",
  audioArabic: "﴿ Arabisch",
  audioMeaning: "📖 Bedeutung",
  groups: {
    doa: "Tägliche Bittgebete",
    dzikir: "Dhikr",
    asmaul: "Die 99 Namen Allahs",
    thibb: "Prophetische Medizin",
    kecantikan: "Sauberkeit & Pflege",
  },
};

const FR: AmalanLabels = {
  title: "Pratiques quotidiennes",
  subtitle:
    "Invocations du réveil au coucher, dhikr, médecine prophétique (tibb an-nabawi) et l'étiquette de la propreté & du soin — toutes de sources authentiques, avec l'arabe, la translittération, la traduction et l'audio.",
  metaTitle: "Pratiques quotidiennes — Invocations, Dhikr, Médecine prophétique",
  metaDesc:
    "Une collection soignée de pratiques quotidiennes : invocations du réveil au coucher, dhikr du matin & du soir, médecine prophétique authentique, et l'étiquette de la propreté & du soin — avec l'arabe, la translittération, la traduction et l'audio.",
  loadError: "Échec du chargement de la collection — veuillez recharger cette page.",
  categories: "Catégories",
  note: "Note",
  listen: "🔊 Écouter",
  playSequence: "▶ Lire à la suite",
  stop: "⏹ Arrêter",
  audioAll: "🔊 Tout",
  audioArabic: "﴿ Arabe",
  audioMeaning: "📖 Sens",
  groups: {
    doa: "Invocations quotidiennes",
    dzikir: "Dhikr",
    asmaul: "Les 99 noms d'Allah",
    thibb: "Médecine prophétique",
    kecantikan: "Propreté & soin",
  },
};

const ES: AmalanLabels = {
  title: "Prácticas diarias",
  subtitle:
    "Súplicas desde el despertar hasta el dormir, dikr, medicina profética (tibb an-nabawi) y la etiqueta de la limpieza y el cuidado — todo de fuentes auténticas, con árabe, transliteración, traducción y audio.",
  metaTitle: "Prácticas diarias — Súplicas, Dikr, Medicina profética",
  metaDesc:
    "Una colección ordenada de prácticas diarias: súplicas desde el despertar hasta el dormir, dikr de la mañana y la tarde, medicina profética auténtica y la etiqueta de la limpieza y el cuidado personal — con árabe, transliteración, traducción y audio.",
  loadError: "No se pudo cargar la colección — recarga esta página.",
  categories: "Categorías",
  note: "Nota",
  listen: "🔊 Escuchar",
  playSequence: "▶ Reproducir en orden",
  stop: "⏹ Detener",
  audioAll: "🔊 Todo",
  audioArabic: "﴿ Árabe",
  audioMeaning: "📖 Significado",
  groups: {
    doa: "Súplicas diarias",
    dzikir: "Dikr",
    asmaul: "Los 99 nombres de Alá",
    thibb: "Medicina profética",
    kecantikan: "Limpieza y cuidado",
  },
};

const MAP: Record<string, AmalanLabels> = { en: EN, id: ID, ar: AR, de: DE, fr: FR, es: ES };

export function amalanLabels(locale: string): AmalanLabels {
  return MAP[locale] ?? EN;
}
