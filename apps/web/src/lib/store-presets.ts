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
  {
    icon: "🌙",
    label: "Ramadan and Eid",
    blurb:
      "Lanterns, wall decorations, gift boxes and countdown calendars — the things that come out of the cupboard once a year and make the house feel like it knows what month it is.",
    keywords: "ramadan decorations eid gift box lantern countdown calendar",
    department: "",
  },
  {
    icon: "🪔",
    label: "Bakhoor, oud and incense",
    blurb:
      "Bakhoor, oud chips and the burners to put them on, electric or charcoal — the scent most Muslim homes reach for when guests are expected.",
    keywords: "bakhoor oud incense burner electric mabkhara",
    department: "",
  },
  {
    icon: "💧",
    label: "Wudu and travel purification",
    blurb:
      "Portable bidet bottles, travel lotas, wudu-friendly socks and small basins — the practical side of staying clean away from home.",
    keywords: "portable bidet travel lota wudu socks khuff",
    department: "",
  },
  {
    icon: "🪒",
    label: "Beard care and grooming",
    blurb:
      "Combs, trimmers, alcohol-free balms and oils — for keeping a beard neat rather than merely long.",
    keywords: "beard oil alcohol free balm comb trimmer grooming kit",
    department: "beauty",
  },
  {
    icon: "🏹",
    label: "Archery, swimming and riding",
    blurb:
      "Bows and targets, goggles and swim gear, riding gloves and helmets — the three sports Muslim families have long made a point of teaching their children.",
    keywords: "archery bow target swimming goggles horse riding helmet",
    department: "sporting",
  },
  {
    icon: "🧩",
    label: "Educational toys and games",
    blurb:
      "Arabic letter blocks, puzzles, prayer-teaching toys and board games — the kind of play that leaves something behind when it is over.",
    keywords: "arabic alphabet toys islamic educational games kids puzzle",
    department: "toys-and-games",
  },
  {
    icon: "🎁",
    label: "Wedding and walima gifts",
    blurb:
      "Gift sets, decorated Qur'an cases, dinnerware and keepsakes — for the invitations that arrive with a date on them and a month to prepare.",
    keywords: "islamic wedding gift set nikah walima present",
    department: "",
  },
  {
    icon: "✏️",
    label: "School and study stationery",
    blurb:
      "Notebooks, pens, Arabic ruled paper, desk lamps and folders — for the madrasah year, and for anyone memorising something long.",
    keywords: "arabic notebook pen desk lamp study stationery folder",
    department: "office-products",
  },
  {
    icon: "🍲",
    label: "Kitchen and hospitality",
    blurb:
      "Tagines, pressure cookers, dallah coffee pots, tea glasses and serving trays — the equipment behind the meals people are actually invited to.",
    keywords: "tagine arabic coffee dallah tea glasses serving tray cookware",
    department: "kitchen",
  },
  {
    icon: "🏃",
    label: "Modest sportswear and swimwear",
    blurb:
      "Burkinis, long-sleeved sports tops, sports hijabs and loose trousers — so that covering up and moving properly are not two separate decisions.",
    keywords: "burkini modest swimwear sports hijab long sleeve activewear",
    department: "fashion",
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
  {
    icon: "🌙",
    label: "Ramadan et Aïd",
    blurb:
      "Lanternes, décorations murales, coffrets cadeaux et calendriers du compte à rebours — ce qu'on sort du placard une fois par an et qui fait que la maison sait quel mois on est.",
    keywords: "decoration ramadan aid coffret cadeau lanterne calendrier",
    department: "",
  },
  {
    icon: "🪔",
    label: "Bakhoor, oud et encens",
    blurb:
      "Bakhoor, copeaux d'oud et les brûleurs qui vont avec, électriques ou à charbon — le parfum vers lequel se tourne la plupart des foyers musulmans quand on attend des invités.",
    keywords: "bakhoor oud encens brule encens electrique mabkhara",
    department: "",
  },
  {
    icon: "💧",
    label: "Ablutions et hygiène en voyage",
    blurb:
      "Douchettes portatives, bouteilles d'istinja, chaussettes pour les ablutions et petites bassines — le côté pratique de rester propre loin de chez soi.",
    keywords: "douchette portative bouteille istinja chaussettes ablution bassine",
    department: "",
  },
  {
    icon: "🪒",
    label: "Soin de la barbe",
    blurb:
      "Peignes, tondeuses, baumes et huiles sans alcool — pour entretenir une barbe plutôt que simplement la laisser pousser.",
    keywords: "huile barbe sans alcool baume peigne tondeuse coffret",
    department: "beauty",
  },
  {
    icon: "🏹",
    label: "Tir à l'arc, natation et équitation",
    blurb:
      "Arcs et cibles, lunettes et maillots, gants et casques d'équitation — les trois sports que les familles musulmanes tiennent depuis longtemps à transmettre.",
    keywords: "tir arc cible natation lunettes equitation casque gants",
    department: "sporting",
  },
  {
    icon: "🧩",
    label: "Jeux éducatifs pour enfants",
    blurb:
      "Cubes de lettres arabes, puzzles, jouets pour apprendre la prière et jeux de société — le genre de jeu qui laisse quelque chose une fois rangé.",
    keywords: "jeu educatif arabe alphabet enfant puzzle jouet islamique",
    department: "toys-and-games",
  },
  {
    icon: "🎁",
    label: "Cadeaux de mariage et walima",
    blurb:
      "Coffrets, étuis à Coran décorés, vaisselle et souvenirs — pour les invitations qui arrivent avec une date dessus et un mois pour s'organiser.",
    keywords: "cadeau mariage musulman coffret nikah walima etui coran",
    department: "",
  },
  {
    icon: "✏️",
    label: "Papeterie et fournitures d'étude",
    blurb:
      "Cahiers, stylos, papier réglé pour l'arabe, lampes de bureau et classeurs — pour l'année de madrasa, et pour quiconque mémorise quelque chose de long.",
    keywords: "cahier arabe stylo lampe bureau fournitures scolaires classeur",
    department: "office-products",
  },
  {
    icon: "🍲",
    label: "Cuisine et art de recevoir",
    blurb:
      "Tajines, autocuiseurs, dallah à café, verres à thé et plateaux de service — le matériel derrière les repas auxquels on est réellement invité.",
    keywords: "tajine cafetiere dallah verres the plateau service ustensiles",
    department: "kitchen",
  },
  {
    icon: "🏃",
    label: "Sport et natation couvrants",
    blurb:
      "Burkinis, hauts de sport à manches longues, hijabs de sport et pantalons amples — pour que se couvrir et bouger correctement ne soient pas deux décisions séparées.",
    keywords: "burkini maillot couvrant hijab sport manches longues legging",
    department: "fashion",
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
  {
    icon: "🌙",
    label: "Ramadan und Eid",
    blurb:
      "Laternen, Wanddekoration, Geschenkboxen und Countdown-Kalender — was einmal im Jahr aus dem Schrank kommt und dem Haus ansehen lässt, welcher Monat gerade ist.",
    keywords: "ramadan deko eid geschenkbox laterne countdown kalender",
    department: "",
  },
  {
    icon: "🪔",
    label: "Bakhoor, Oud und Räucherwerk",
    blurb:
      "Bakhoor, Oud-Späne und die passenden Brenner, elektrisch oder mit Kohle — der Duft, zu dem die meisten muslimischen Haushalte greifen, wenn Gäste erwartet werden.",
    keywords: "bakhoor oud raeucherwerk raeucherbrenner elektrisch mabkhara",
    department: "",
  },
  {
    icon: "💧",
    label: "Wudu und Hygiene unterwegs",
    blurb:
      "Reisebidets, Istinja-Flaschen, wudu-taugliche Socken und kleine Schüsseln — die praktische Seite davon, auch außer Haus sauber zu bleiben.",
    keywords: "reisebidet istinja flasche wudu socken waschschuessel",
    department: "",
  },
  {
    icon: "🪒",
    label: "Bartpflege",
    blurb:
      "Kämme, Trimmer, alkoholfreie Balsame und Öle — um einen Bart zu pflegen, statt ihn nur wachsen zu lassen.",
    keywords: "bartoel alkoholfrei balsam kamm trimmer bartpflege set",
    department: "beauty",
  },
  {
    icon: "🏹",
    label: "Bogenschießen, Schwimmen und Reiten",
    blurb:
      "Bögen und Zielscheiben, Brillen und Badesachen, Reithandschuhe und Helme — die drei Sportarten, die muslimische Familien ihren Kindern seit jeher beibringen.",
    keywords: "bogenschiessen zielscheibe schwimmbrille reiten helm handschuhe",
    department: "sporting",
  },
  {
    icon: "🧩",
    label: "Lernspielzeug für Kinder",
    blurb:
      "Buchstabenwürfel, Puzzles, Spielzeug zum Gebet-Lernen und Gesellschaftsspiele — die Art Spiel, die etwas zurücklässt, wenn sie vorbei ist.",
    keywords: "lernspielzeug arabisch alphabet kinder puzzle islamisch spiel",
    department: "toys-and-games",
  },
  {
    icon: "🎁",
    label: "Hochzeits- und Walima-Geschenke",
    blurb:
      "Geschenksets, verzierte Koran-Etuis, Geschirr und Andenken — für die Einladungen, die mit einem Datum kommen und einem Monat Vorlauf.",
    keywords: "hochzeitsgeschenk muslimisch geschenkset nikah walima koran etui",
    department: "",
  },
  {
    icon: "✏️",
    label: "Schreibwaren und Lernbedarf",
    blurb:
      "Hefte, Stifte, liniertes Papier für Arabisch, Schreibtischlampen und Ordner — für das Madrasa-Jahr, und für jeden, der etwas Langes auswendig lernt.",
    keywords: "heft arabisch stift schreibtischlampe schreibwaren ordner",
    department: "office-products",
  },
  {
    icon: "🍲",
    label: "Küche und Gastfreundschaft",
    blurb:
      "Tajines, Schnellkochtöpfe, Dallah-Kannen, Teegläser und Serviertabletts — das Gerät hinter den Essen, zu denen man tatsächlich eingeladen wird.",
    keywords: "tajine schnellkochtopf dallah kanne teeglaeser serviertablett",
    department: "kitchen",
  },
  {
    icon: "🏃",
    label: "Bedeckende Sport- und Badebekleidung",
    blurb:
      "Burkinis, langärmelige Sportoberteile, Sport-Hijabs und weite Hosen — damit Bedecken und richtiges Bewegen nicht zwei getrennte Entscheidungen sind.",
    keywords: "burkini badebekleidung bedeckt sport hijab langarm leggings",
    department: "fashion",
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
  {
    icon: "🌙",
    label: "Ramadán y Eid",
    blurb:
      "Farolillos, decoración de pared, cajas de regalo y calendarios de cuenta atrás — lo que sale del armario una vez al año y hace que la casa sepa en qué mes está.",
    keywords: "decoracion ramadan eid caja regalo farolillo calendario",
    department: "",
  },
  {
    icon: "🪔",
    label: "Bajur, oud e incienso",
    blurb:
      "Bajur, virutas de oud y los quemadores que los acompañan, eléctricos o de carbón — el aroma al que recurre la mayoría de las casas musulmanas cuando se espera visita.",
    keywords: "bakhoor oud incienso quemador electrico mabkhara",
    department: "",
  },
  {
    icon: "💧",
    label: "Ablución e higiene en viaje",
    blurb:
      "Duchas portátiles, botellas de istinya, calcetines aptos para el wudu y palanganas pequeñas — el lado práctico de mantenerse limpio fuera de casa.",
    keywords: "ducha portatil botella istinya calcetines wudu palangana",
    department: "",
  },
  {
    icon: "🪒",
    label: "Cuidado de la barba",
    blurb:
      "Peines, recortadoras, bálsamos y aceites sin alcohol — para cuidar una barba en lugar de simplemente dejarla crecer.",
    keywords: "aceite barba sin alcohol balsamo peine recortadora kit",
    department: "beauty",
  },
  {
    icon: "🏹",
    label: "Tiro con arco, natación y equitación",
    blurb:
      "Arcos y dianas, gafas y bañadores, guantes y cascos de montar — los tres deportes que las familias musulmanas llevan mucho tiempo empeñadas en enseñar.",
    keywords: "tiro con arco diana natacion gafas equitacion casco guantes",
    department: "sporting",
  },
  {
    icon: "🧩",
    label: "Juguetes educativos para niños",
    blurb:
      "Cubos de letras árabes, puzles, juguetes para aprender la oración y juegos de mesa — el tipo de juego que deja algo cuando se recoge.",
    keywords: "juguete educativo arabe alfabeto ninos puzle islamico juego",
    department: "toys-and-games",
  },
  {
    icon: "🎁",
    label: "Regalos de boda y walima",
    blurb:
      "Sets de regalo, estuches de Corán decorados, vajilla y recuerdos — para las invitaciones que llegan con una fecha encima y un mes para prepararse.",
    keywords: "regalo boda musulmana set nikah walima estuche coran",
    department: "",
  },
  {
    icon: "✏️",
    label: "Papelería y material de estudio",
    blurb:
      "Cuadernos, bolígrafos, papel pautado para árabe, flexos y archivadores — para el curso de madrasa, y para quien memoriza algo largo.",
    keywords: "cuaderno arabe boligrafo flexo material escolar archivador",
    department: "office-products",
  },
  {
    icon: "🍲",
    label: "Cocina y hospitalidad",
    blurb:
      "Tayines, ollas a presión, dallahs de café, vasos de té y bandejas — el equipo detrás de las comidas a las que de verdad te invitan.",
    keywords: "tajin olla presion dallah cafe vasos te bandeja utensilios",
    department: "kitchen",
  },
  {
    icon: "🏃",
    label: "Ropa deportiva y de baño modesta",
    blurb:
      "Burkinis, camisetas deportivas de manga larga, hiyabs deportivos y pantalones holgados — para que cubrirse y moverse bien no sean dos decisiones distintas.",
    keywords: "burkini bano modesto hiyab deportivo manga larga mallas",
    department: "fashion",
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
