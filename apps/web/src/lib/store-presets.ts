/**
 * Ready-made shelves, one set per marketplace.
 *
 * The owner asked not to have to write anything ("ga usah nulis deskripsi"),
 * and the honest way to grant that is to write it FOR him rather than to drop
 * the text — a category page with no words of its own is the "little or no
 * added value" pattern that risks both AdSense and a manual search penalty.
 *
 * So each preset carries a real sentence, in the marketplace's own language,
 * about what the category is for. Original text, written once, editable in the
 * admin, and it exists nowhere else on the web — which is the only part of an
 * affiliate page a search engine has any reason to count.
 *
 * Keywords are in the marketplace's language too, because that is what the
 * search on that Amazon actually understands: "coran" on amazon.fr, not
 * "quran".
 *
 * Content rule, per the owner: physical goods only, halal, nothing digital and
 * nothing touching gambling, forex/index trading or adult material.
 */

export interface ShelfPreset {
  icon: string;
  label: string;
  blurb: string;
  keywords: string;
  department: string;
}

const EN: ShelfPreset[] = [
  {
    icon: "📖",
    label: "Qur'an and translations",
    blurb:
      "Printed mushaf in several sizes and scripts, with and without translation — the kind you keep on a shelf and open every day rather than read on a screen.",
    keywords: "quran arabic english translation hardcover",
    department: "stripbooks",
  },
  {
    icon: "📚",
    label: "Hadith and Islamic scholarship",
    blurb:
      "The major hadith collections and the classical works of tafsir, fiqh and sirah, in editions meant for long study rather than a quick look.",
    keywords: "hadith sahih bukhari muslim tafsir fiqh sirah",
    department: "stripbooks",
  },
  {
    icon: "🧒",
    label: "Islamic books for children",
    blurb:
      "Stories of the prophets, first books of Arabic letters, and activity books — chosen for the age where reading is still something you do together.",
    keywords: "islamic books for kids prophet stories arabic alphabet",
    department: "stripbooks",
  },
  {
    icon: "🕌",
    label: "Prayer mats and equipment",
    blurb:
      "Prayer mats, travel mats with a compass, prayer beads and thobes — the everyday things that wear out and get replaced.",
    keywords: "prayer mat islamic prayer rug tasbih misbaha",
    department: "",
  },
  {
    icon: "🧳",
    label: "Hajj and Umrah travel",
    blurb:
      "Ihram, money belts, unscented toiletries, foldable mats and light luggage — what people actually pack, and forget to pack, for the journey.",
    keywords: "ihram hajj umrah travel essentials unscented",
    department: "",
  },
  {
    icon: "🔊",
    label: "Qur'an players and audio",
    blurb:
      "Digital Qur'an players, portable speakers and headphones for listening to recitation at home, in the car or while walking.",
    keywords: "quran speaker digital quran player bluetooth headphones",
    department: "electronics",
  },
  {
    icon: "🧭",
    label: "Qibla compasses and clocks",
    blurb:
      "Qibla compasses, azan clocks and prayer-time watches — useful when travelling or when the phone is not the thing you want to reach for.",
    keywords: "qibla compass azan clock prayer time watch",
    department: "",
  },
  {
    icon: "🏠",
    label: "Islamic home and decor",
    blurb:
      "Arabic calligraphy wall art, Ramadan lanterns and gift sets — for the house, and for the occasions when something has to be given.",
    keywords: "islamic wall art arabic calligraphy ramadan lantern",
    department: "",
  },
];

const FR: ShelfPreset[] = [
  {
    icon: "📖",
    label: "Corans et traductions",
    blurb:
      "Des corans imprimés en plusieurs formats et calligraphies, avec ou sans traduction — de ceux qu'on garde sur une étagère et qu'on ouvre chaque jour, plutôt que de lire sur un écran.",
    keywords: "coran arabe français traduction relié",
    department: "stripbooks",
  },
  {
    icon: "📚",
    label: "Hadith et sciences islamiques",
    blurb:
      "Les grands recueils de hadith et les ouvrages classiques de tafsir, de fiqh et de sîra, dans des éditions faites pour l'étude longue et non pour un survol.",
    keywords: "hadith sahih boukhari mouslim tafsir fiqh sira",
    department: "stripbooks",
  },
  {
    icon: "🧒",
    label: "Livres islamiques pour enfants",
    blurb:
      "Histoires des prophètes, premiers livres de lettres arabes et cahiers d'activités — choisis pour l'âge où lire est encore quelque chose qu'on fait ensemble.",
    keywords: "livre islamique enfant histoires des prophètes alphabet arabe",
    department: "stripbooks",
  },
  {
    icon: "🕌",
    label: "Tapis et articles de prière",
    blurb:
      "Tapis de prière, tapis de voyage avec boussole, chapelets et qamis — les objets du quotidien, ceux qui s'usent et qu'on remplace.",
    keywords: "tapis de prière tapis de voyage tasbih chapelet",
    department: "",
  },
  {
    icon: "🧳",
    label: "Voyage Hajj et Omra",
    blurb:
      "Ihram, ceintures porte-monnaie, produits d'hygiène sans parfum, tapis pliants et bagages légers — ce qu'on emporte vraiment, et ce qu'on oublie.",
    keywords: "ihram hajj omra accessoires voyage sans parfum",
    department: "",
  },
  {
    icon: "🔊",
    label: "Lecteurs de Coran et audio",
    blurb:
      "Lecteurs de Coran numériques, enceintes portables et casques pour écouter la récitation à la maison, en voiture ou en marchant.",
    keywords: "lecteur coran numérique enceinte coran casque bluetooth",
    department: "electronics",
  },
  {
    icon: "🧭",
    label: "Boussoles qibla et horloges",
    blurb:
      "Boussoles qibla, horloges azan et montres de prière — utiles en voyage, ou quand le téléphone n'est pas ce vers quoi on veut se tourner.",
    keywords: "boussole qibla horloge azan montre prière",
    department: "",
  },
  {
    icon: "🏠",
    label: "Décoration et maison",
    blurb:
      "Calligraphie arabe murale, lanternes de Ramadan et coffrets cadeaux — pour la maison, et pour les occasions où il faut offrir quelque chose.",
    keywords: "calligraphie arabe décoration murale lanterne ramadan",
    department: "",
  },
];

const DE: ShelfPreset[] = [
  {
    icon: "📖",
    label: "Koran und Übersetzungen",
    blurb:
      "Gedruckte Korane in mehreren Formaten und Schriften, mit und ohne Übersetzung — die Sorte, die im Regal steht und täglich aufgeschlagen wird, statt am Bildschirm gelesen zu werden.",
    keywords: "koran arabisch deutsch übersetzung gebunden",
    department: "stripbooks",
  },
  {
    icon: "📚",
    label: "Hadith und islamische Wissenschaft",
    blurb:
      "Die großen Hadithsammlungen und die klassischen Werke zu Tafsir, Fiqh und Sira, in Ausgaben für langes Studium statt für einen kurzen Blick.",
    keywords: "hadith sahih buchari muslim tafsir fiqh sira",
    department: "stripbooks",
  },
  {
    icon: "🧒",
    label: "Islamische Kinderbücher",
    blurb:
      "Prophetengeschichten, erste Bücher mit arabischen Buchstaben und Mitmachhefte — für das Alter, in dem Lesen noch etwas Gemeinsames ist.",
    keywords: "islamische kinderbücher prophetengeschichten arabisches alphabet",
    department: "stripbooks",
  },
  {
    icon: "🕌",
    label: "Gebetsteppiche und Zubehör",
    blurb:
      "Gebetsteppiche, Reiseteppiche mit Kompass, Gebetsketten und Thobes — die Dinge des Alltags, die sich abnutzen und ersetzt werden.",
    keywords: "gebetsteppich reisegebetsteppich tasbih gebetskette",
    department: "",
  },
  {
    icon: "🧳",
    label: "Hadsch- und Umra-Reise",
    blurb:
      "Ihram, Gürteltaschen, parfümfreie Pflegeprodukte, faltbare Teppiche und leichtes Gepäck — was wirklich eingepackt wird, und was vergessen wird.",
    keywords: "ihram hadsch umra reisezubehör parfümfrei",
    department: "",
  },
  {
    icon: "🔊",
    label: "Koran-Player und Audio",
    blurb:
      "Digitale Koran-Player, tragbare Lautsprecher und Kopfhörer, um die Rezitation zu Hause, im Auto oder beim Gehen zu hören.",
    keywords: "koran player digital lautsprecher koran bluetooth kopfhörer",
    department: "electronics",
  },
  {
    icon: "🧭",
    label: "Qibla-Kompass und Uhren",
    blurb:
      "Qibla-Kompasse, Azan-Uhren und Gebetszeituhren — nützlich auf Reisen, oder wenn das Telefon nicht das ist, wonach man greifen möchte.",
    keywords: "qibla kompass azan uhr gebetszeiten uhr",
    department: "",
  },
  {
    icon: "🏠",
    label: "Wohnen und Dekoration",
    blurb:
      "Arabische Kalligrafie fürs Wandbild, Ramadan-Laternen und Geschenksets — für die Wohnung, und für die Anlässe, zu denen etwas geschenkt wird.",
    keywords: "arabische kalligrafie wandbild ramadan laterne geschenkset",
    department: "",
  },
];

const ES: ShelfPreset[] = [
  {
    icon: "📖",
    label: "Coranes y traducciones",
    blurb:
      "Coranes impresos en varios tamaños y caligrafías, con y sin traducción — de los que se guardan en la estantería y se abren a diario, no de los que se leen en pantalla.",
    keywords: "coran arabe español traducción tapa dura",
    department: "stripbooks",
  },
  {
    icon: "📚",
    label: "Hadiz y ciencias islámicas",
    blurb:
      "Las grandes colecciones de hadiz y las obras clásicas de tafsir, fiqh y sira, en ediciones pensadas para el estudio largo y no para una ojeada.",
    keywords: "hadiz sahih bujari muslim tafsir fiqh sira",
    department: "stripbooks",
  },
  {
    icon: "🧒",
    label: "Libros islámicos para niños",
    blurb:
      "Historias de los profetas, primeros libros de letras árabes y cuadernos de actividades — elegidos para la edad en que leer es todavía algo que se hace juntos.",
    keywords: "libros islamicos niños historias de los profetas alfabeto arabe",
    department: "stripbooks",
  },
  {
    icon: "🕌",
    label: "Alfombras y artículos de oración",
    blurb:
      "Alfombras de oración, esterillas de viaje con brújula, rosarios y túnicas — las cosas de cada día, las que se gastan y se reponen.",
    keywords: "alfombra de oracion alfombra viaje tasbih rosario musulman",
    department: "",
  },
  {
    icon: "🧳",
    label: "Viaje de Hach y Umra",
    blurb:
      "Ihram, riñoneras, aseo sin perfume, esterillas plegables y equipaje ligero — lo que de verdad se lleva, y lo que se olvida llevar.",
    keywords: "ihram hach umra accesorios viaje sin perfume",
    department: "",
  },
  {
    icon: "🔊",
    label: "Reproductores de Corán y audio",
    blurb:
      "Reproductores de Corán digitales, altavoces portátiles y auriculares para escuchar la recitación en casa, en el coche o caminando.",
    keywords: "reproductor coran digital altavoz coran auriculares bluetooth",
    department: "electronics",
  },
  {
    icon: "🧭",
    label: "Brújulas qibla y relojes",
    blurb:
      "Brújulas qibla, relojes de azán y relojes de oración — útiles al viajar, o cuando el móvil no es lo que uno quiere coger.",
    keywords: "brujula qibla reloj azan reloj oracion musulman",
    department: "",
  },
  {
    icon: "🏠",
    label: "Hogar y decoración",
    blurb:
      "Caligrafía árabe para la pared, farolillos de Ramadán y sets de regalo — para la casa, y para las ocasiones en que hay que regalar algo.",
    keywords: "caligrafia arabe cuadro pared farol ramadan set regalo",
    department: "",
  },
];

/**
 * Keyed by the Amazon DOMAIN, not by a language code.
 *
 * Three of the four marketplaces happen to share a name with a locale
 * ("fr", "de", "es"), which made this look like a translation table to the
 * i18n consistency patrol — it asked, reasonably, where Indonesian and English
 * had gone. They are not missing: there is no amazon.co.id at all, and English
 * is amazon.com. Spelling the host out says what this really is and leaves the
 * patrol free to keep guarding the maps that ARE about language.
 */
const PRESETS_BY_STORE: Record<string, ShelfPreset[]> = {
  "amazon.com": EN,
  "amazon.fr": FR,
  "amazon.de": DE,
  "amazon.es": ES,
};

/** Ready-made shelves for one marketplace ("com" | "fr" | "de" | "es"). */
export function shelfPresets(marketplace: string): ShelfPreset[] {
  return PRESETS_BY_STORE[`amazon.${marketplace}`] ?? [];
}
