// Self-contained acknowledgments content, same pattern as privacy-labels.ts —
// Indonesian and English are hand-written in full; other locales fall back
// to English.

export interface ThanksSection {
  heading: string;
  body: string[];
}

export interface ThanksLabels {
  title: string;
  subtitle: string;
  intro: string;
  sections: ThanksSection[];
  closingDua: string;
}

const EN: ThanksLabels = {
  title: "A Word of Gratitude",
  subtitle: "ULYAH.COM stands on the shoulders of many hands, open hearts, and quiet generosity.",
  intro:
    "All praise belongs first to Allah ﷻ, who alone makes any good work possible. What follows is our sincere gratitude to everyone whose knowledge, code, generosity, and trust gave this platform its shape — a debt we can only ever repay with prayer.",
  sections: [
    {
      heading: "To Maktabah Syamela",
      body: [
        "Long before ULYAH.COM existed, Maktabah Syamela had already spent years patiently digitizing and preserving thousands of works of classical Islamic scholarship — tafsir, hadith, fiqh, aqidah, and the writings of countless scholars across the centuries — and making that treasury freely reachable to anyone who sought it.",
        "The nearly five-thousand classical works in our own Kitab Library exist only because that foundation was laid first, with a patience and generosity of spirit ULYAH.COM did nothing to earn but everything to be grateful for. We built a narrated, translated, searchable home for this library; Maktabah Syamela built the library itself. May Allah reward every hand that contributed to preserving this heritage, and make it a continuing benefit (sadaqah jariyah) that outlives us all.",
      ],
    },
    {
      heading: "To the open-source community",
      body: [
        "This platform also stands on freely-shared work from developers around the world who chose to release their labor for others to build upon — among them the maintainers of fawazahmed0/quran-hadith-api and gadingnst/hadith-api for hadith texts made openly available, the quran-json project for a clean, structured Qur'an dataset, and the adhan.js library for astronomically accurate prayer times used with no fee and no key required.",
        "None of them asked for anything in return but attribution and good use of their work — a quiet generosity we try to honor by never claiming as our own what was given freely, and by putting it to use in service of something meaningful.",
      ],
    },
    {
      heading: "To our donors",
      body: [
        "To everyone who has ever given — whether a certificate-bearing donation, a donated AI key that kept the content engine running, or simply a prayer said quietly on our behalf — thank you. ULYAH.COM has no advertising budget behind it and no institution funding it; it exists because ordinary people decided a free, ad-light, voice-narrated Islamic platform was worth supporting. Every rupiah, every dollar, every dirham finds its way directly into keeping the Qur'an, hadith, and this library reachable for someone who may never be able to give anything back — and that, God willing, is exactly the point.",
      ],
    },
    {
      heading: "To everyone who has contributed",
      body: [
        "To everyone who reported a bug, suggested a feature, translated a phrase, corrected a mistake, or simply took the time to write in with honest feedback — this platform is better for your candor, even (especially) when it was hard to hear. Every correction made ULYAH.COM a little more trustworthy than it was the day before.",
      ],
    },
    {
      heading: "To you, our listener",
      body: [
        "And to you, reading this now — whoever and wherever you are — thank you for choosing to spend a moment of your time here. Whether you came for a single ayah, a single hadith, or stayed long enough to finish an entire book, you are the reason any of this was ever built. May whatever you found here be a means of good for you, in this life and the next.",
      ],
    },
  ],
  closingDua: "May Allah accept this small effort, forgive its shortcomings, and make it a source of benefit that reaches far beyond what any of us can see.",
};

const ID: ThanksLabels = {
  title: "Ucapan Terima Kasih",
  subtitle: "ULYAH.COM berdiri di atas jasa banyak tangan, hati yang terbuka, dan kebaikan yang tak terhitung.",
  intro:
    "Segala puji pertama-tama hanya milik Allah ﷻ, yang semata karena izin-Nya sebuah kebaikan bisa terwujud. Berikut adalah ucapan terima kasih kami yang tulus kepada setiap pihak yang ilmunya, kodenya, kemurahan hatinya, dan kepercayaannya telah membentuk platform ini — sebuah utang budi yang hanya sanggup kami balas dengan doa.",
  sections: [
    {
      heading: "Kepada Maktabah Syamela",
      body: [
        "Jauh sebelum ULYAH.COM ada, Maktabah Syamela telah bertahun-tahun dengan sabar mendigitalkan dan menjaga ribuan karya khazanah keilmuan Islam klasik — tafsir, hadits, fiqih, akidah, dan tulisan-tulisan tak terhitung banyaknya ulama sepanjang zaman — serta menjadikannya dapat diakses secara bebas oleh siapa pun yang mencarinya.",
        "Hampir lima ribu kitab klasik yang ada di Perpustakaan Kitab kami hari ini hanya mungkin ada karena fondasi itu telah lebih dahulu diletakkan, dengan kesabaran dan kelapangan hati yang tidak pernah kami usahakan namun senantiasa kami syukuri. Kami membangun rumah yang dibacakan suara, diterjemahkan, dan dapat dicari untuk perpustakaan ini; Maktabah Syamela-lah yang membangun perpustakaannya. Semoga Allah membalas setiap tangan yang berjasa menjaga khazanah ini, dan menjadikannya sadaqah jariyah yang terus mengalir melampaui usia kita semua.",
      ],
    },
    {
      heading: "Kepada komunitas sumber terbuka",
      body: [
        "Platform ini juga berdiri di atas karya yang dibagikan secara cuma-cuma oleh para pengembang di berbagai penjuru dunia yang memilih agar jerih payah mereka dapat dibangun kembali oleh orang lain — di antaranya para pengelola fawazahmed0/quran-hadith-api dan gadingnst/hadith-api yang membuka teks-teks hadits secara bebas, proyek quran-json untuk data Al-Qur'an yang rapi dan terstruktur, serta pustaka adhan.js untuk perhitungan waktu sholat yang akurat secara astronomis, tanpa biaya dan tanpa kunci akses.",
        "Tak satu pun dari mereka meminta balasan selain penyebutan sumber dan penggunaan yang baik atas karyanya — sebuah kemurahan hati yang kami coba hormati dengan tidak pernah mengklaim sebagai milik kami apa yang telah diberikan secara cuma-cuma, dan dengan mendayagunakannya untuk sesuatu yang bermanfaat.",
      ],
    },
    {
      heading: "Kepada para donatur kami",
      body: [
        "Kepada setiap orang yang pernah memberi — baik berupa donasi yang tercatat dalam sertifikat, kunci AI yang didonasikan untuk menjaga mesin konten tetap berjalan, atau sekadar doa yang dipanjatkan diam-diam untuk kami — terima kasih. ULYAH.COM tidak memiliki anggaran iklan di baliknya dan tidak dibiayai lembaga mana pun; ia ada karena orang-orang biasa memutuskan bahwa sebuah platform Islam yang gratis, minim iklan, dan dibacakan dengan suara layak untuk didukung. Setiap rupiah, setiap dolar, setiap dirham yang diberikan mengalir langsung untuk menjaga Al-Qur'an, hadits, dan perpustakaan ini tetap dapat dijangkau oleh seseorang yang mungkin tidak akan pernah bisa membalasnya — dan insyaAllah, itulah tujuannya.",
      ],
    },
    {
      heading: "Kepada semua yang telah berpartisipasi",
      body: [
        "Kepada setiap orang yang melaporkan kesalahan, mengusulkan fitur, menerjemahkan sebuah kalimat, mengoreksi sebuah kekeliruan, atau sekadar meluangkan waktu untuk menulis masukan yang jujur — platform ini menjadi lebih baik berkat kejujuran Anda, bahkan (terutama) ketika masukan itu terasa berat untuk didengar. Setiap koreksi menjadikan ULYAH.COM sedikit lebih layak dipercaya dibanding hari sebelumnya.",
      ],
    },
    {
      heading: "Kepada Anda, para pendengar kami",
      body: [
        "Dan kepada Anda yang sedang membaca ini sekarang — siapa pun dan di mana pun Anda berada — terima kasih telah memilih untuk meluangkan sedikit waktu di sini. Baik Anda datang hanya untuk satu ayat, satu hadits, atau bertahan cukup lama hingga menyelesaikan satu kitab utuh, Andalah alasan mengapa semua ini dibangun. Semoga apa pun yang Anda temukan di sini menjadi jalan kebaikan bagi Anda, di dunia maupun di akhirat.",
      ],
    },
  ],
  closingDua: "Semoga Allah menerima usaha kecil ini, mengampuni segala kekurangannya, dan menjadikannya sumber manfaat yang menjangkau jauh melampaui apa yang mampu kita lihat.",
};

const FR: ThanksLabels = {
  title: "Un mot de gratitude",
  subtitle: "ULYAH.COM repose sur de nombreuses mains, des cœurs ouverts et une générosité discrète.",
  intro:
    "Toute louange revient d'abord à Allah ﷻ, qui seul rend possible toute bonne œuvre. Voici notre sincère gratitude envers tous ceux dont le savoir, le code, la générosité et la confiance ont donné forme à cette plateforme — une dette que nous ne pourrons jamais rembourser autrement que par la prière.",
  sections: [
    {
      heading: "À Maktabah Syamela",
      body: [
        "Bien avant l'existence de cette plateforme, Maktabah Syamela avait déjà passé des années à numériser et préserver patiemment des milliers d'œuvres de la science islamique classique — tafsir, hadith, fiqh, aqida et les écrits d'innombrables savants à travers les siècles — en rendant ce trésor librement accessible à quiconque le cherchait.",
        "Les presque cinq mille œuvres classiques de notre bibliothèque n'existent que parce que cette fondation a été posée en premier, avec une patience et une générosité d'esprit que nous n'avons rien fait pour mériter mais pour lesquelles nous sommes infiniment reconnaissants. Qu'Allah récompense chaque main qui a contribué à préserver cet héritage et en fasse une aumône continue (sadaqa jâriya) qui nous survive à tous.",
      ],
    },
    {
      heading: "À la communauté open source",
      body: [
        "Cette plateforme repose aussi sur le travail librement partagé de développeurs du monde entier — parmi eux les mainteneurs de fawazahmed0/quran-hadith-api et gadingnst/hadith-api pour les textes de hadith mis à disposition, le projet quran-json pour un jeu de données coranique propre et structuré, et la bibliothèque adhan.js pour des horaires de prière astronomiquement précis, sans frais ni clé.",
        "Aucun d'eux n'a rien demandé en retour, sinon l'attribution et le bon usage de son travail — une générosité discrète que nous essayons d'honorer en ne revendiquant jamais comme nôtre ce qui a été donné librement.",
      ],
    },
    {
      heading: "À nos donateurs",
      body: [
        "À tous ceux qui ont un jour donné — un don avec certificat, une clé d'IA donnée qui a fait tourner le moteur de contenu, ou simplement une prière dite en silence pour nous — merci. Cette plateforme n'a derrière elle aucun budget publicitaire ni institution : elle existe parce que des gens ordinaires ont décidé qu'une plateforme islamique gratuite et narrée à voix haute méritait d'être soutenue. Chaque euro, chaque dollar, chaque dirham sert directement à garder le Coran, les hadiths et cette bibliothèque accessibles à quelqu'un qui ne pourra peut-être jamais rien rendre — et c'est exactement, si Dieu le veut, le but.",
      ],
    },
    {
      heading: "À tous ceux qui ont contribué",
      body: [
        "À tous ceux qui ont signalé un bug, suggéré une fonctionnalité, traduit une phrase, corrigé une erreur ou simplement pris le temps d'écrire un retour honnête — cette plateforme est meilleure grâce à votre franchise, même (surtout) quand elle était difficile à entendre.",
      ],
    },
    {
      heading: "À vous, notre auditeur",
      body: [
        "Et à vous qui lisez ceci — qui que vous soyez et où que vous soyez — merci d'avoir choisi de passer un moment ici. Que vous soyez venu pour un seul verset, un seul hadith, ou resté assez longtemps pour terminer un livre entier, vous êtes la raison pour laquelle tout cela a été construit. Que ce que vous avez trouvé ici soit une source de bien pour vous, dans cette vie et dans l'autre.",
      ],
    },
  ],
  closingDua: "Qu'Allah accepte ce modeste effort, pardonne ses manquements et en fasse une source de bienfait qui dépasse de loin ce qu'aucun de nous ne peut voir.",
};

const DE: ThanksLabels = {
  title: "Ein Wort des Dankes",
  subtitle: "ULYAH.COM steht auf den Schultern vieler Hände, offener Herzen und stiller Großzügigkeit.",
  intro:
    "Alles Lob gebührt zuerst Allah ﷻ, der allein jedes gute Werk möglich macht. Es folgt unser aufrichtiger Dank an alle, deren Wissen, Code, Großzügigkeit und Vertrauen dieser Plattform ihre Gestalt gegeben haben — eine Schuld, die wir nur mit Gebet begleichen können.",
  sections: [
    {
      heading: "An Maktabah Syamela",
      body: [
        "Lange bevor es diese Plattform gab, hatte Maktabah Syamela bereits Jahre damit verbracht, Tausende Werke der klassischen islamischen Gelehrsamkeit geduldig zu digitalisieren und zu bewahren — Tafsir, Hadith, Fiqh, Aqida und die Schriften unzähliger Gelehrter über die Jahrhunderte — und diesen Schatz frei zugänglich zu machen.",
        "Die fast fünftausend klassischen Werke unserer eigenen Bibliothek existieren nur, weil dieses Fundament zuerst gelegt wurde — mit einer Geduld und Großzügigkeit, die wir uns nicht verdient haben, für die wir aber zutiefst dankbar sind. Möge Allah jede Hand belohnen, die zur Bewahrung dieses Erbes beigetragen hat, und es zu einer fortlaufenden Wohltat (Sadaqa dschāriya) machen, die uns alle überdauert.",
      ],
    },
    {
      heading: "An die Open-Source-Gemeinschaft",
      body: [
        "Diese Plattform steht auch auf frei geteilter Arbeit von Entwicklern aus aller Welt — darunter die Betreuer von fawazahmed0/quran-hadith-api und gadingnst/hadith-api für offen verfügbare Hadith-Texte, das Projekt quran-json für einen sauberen, strukturierten Koran-Datensatz und die Bibliothek adhan.js für astronomisch genaue Gebetszeiten, ohne Gebühr und ohne Schlüssel.",
        "Keiner von ihnen verlangte etwas außer Namensnennung und gutem Gebrauch seiner Arbeit — eine stille Großzügigkeit, die wir ehren, indem wir nie als unser Eigen beanspruchen, was frei gegeben wurde.",
      ],
    },
    {
      heading: "An unsere Spender",
      body: [
        "An alle, die je gegeben haben — sei es eine Spende mit Zertifikat, ein gespendeter KI-Schlüssel, der die Inhalts-Engine am Laufen hielt, oder einfach ein still gesprochenes Gebet für uns — danke. Hinter dieser Plattform steht kein Werbebudget und keine Institution; es gibt sie, weil gewöhnliche Menschen entschieden, dass eine freie, vorgelesene islamische Plattform Unterstützung verdient. Jeder Euro, jeder Dollar, jeder Dirham fließt direkt dahin, den Koran, die Hadithe und diese Bibliothek für jemanden erreichbar zu halten, der vielleicht nie etwas zurückgeben kann — und genau das, so Gott will, ist der Sinn.",
      ],
    },
    {
      heading: "An alle, die beigetragen haben",
      body: [
        "An alle, die einen Fehler gemeldet, eine Funktion vorgeschlagen, einen Satz übersetzt, einen Irrtum korrigiert oder sich einfach die Zeit für ehrliches Feedback genommen haben — diese Plattform ist durch eure Offenheit besser geworden, auch (gerade) wenn sie schwer zu hören war.",
      ],
    },
    {
      heading: "An dich, unseren Hörer",
      body: [
        "Und an dich, der du dies gerade liest — wer und wo immer du bist — danke, dass du einen Moment deiner Zeit hier verbringst. Ob du für einen einzigen Vers, einen einzigen Hadith gekommen bist oder lange genug geblieben, um ein ganzes Buch zu beenden: Du bist der Grund, warum all dies gebaut wurde. Möge das, was du hier gefunden hast, ein Mittel des Guten für dich sein, in diesem Leben und im nächsten.",
      ],
    },
  ],
  closingDua: "Möge Allah diese kleine Anstrengung annehmen, ihre Mängel vergeben und sie zu einer Quelle des Nutzens machen, die weit über das hinausreicht, was einer von uns sehen kann.",
};

const ES: ThanksLabels = {
  title: "Unas palabras de gratitud",
  subtitle: "ULYAH.COM se sostiene sobre muchas manos, corazones abiertos y una generosidad silenciosa.",
  intro:
    "Toda alabanza pertenece primero a Alá ﷻ, el único que hace posible toda buena obra. Lo que sigue es nuestra sincera gratitud a todos aquellos cuyo conocimiento, código, generosidad y confianza dieron forma a esta plataforma — una deuda que solo podremos pagar con oración.",
  sections: [
    {
      heading: "A Maktabah Syamela",
      body: [
        "Mucho antes de que existiera esta plataforma, Maktabah Syamela ya había pasado años digitalizando y preservando con paciencia miles de obras de la erudición islámica clásica — tafsir, hadices, fiqh, aqida y los escritos de incontables sabios a lo largo de los siglos — poniendo ese tesoro al alcance de cualquiera que lo buscara.",
        "Las casi cinco mil obras clásicas de nuestra biblioteca existen solo porque esa base se puso primero, con una paciencia y generosidad de espíritu que no hicimos nada por merecer pero que agradecemos profundamente. Que Alá recompense cada mano que contribuyó a preservar este legado y lo convierta en una caridad continua (sadaqa yariya) que nos sobreviva a todos.",
      ],
    },
    {
      heading: "A la comunidad de código abierto",
      body: [
        "Esta plataforma también se sostiene sobre el trabajo compartido libremente por desarrolladores de todo el mundo — entre ellos los mantenedores de fawazahmed0/quran-hadith-api y gadingnst/hadith-api por los textos de hadices disponibles abiertamente, el proyecto quran-json por un conjunto de datos del Corán limpio y estructurado, y la biblioteca adhan.js por horarios de oración astronómicamente precisos, sin coste y sin clave.",
        "Ninguno de ellos pidió nada a cambio salvo la atribución y el buen uso de su trabajo — una generosidad silenciosa que intentamos honrar no reclamando nunca como nuestro lo que fue dado libremente.",
      ],
    },
    {
      heading: "A nuestros donantes",
      body: [
        "A todos los que alguna vez han dado — una donación con certificado, una clave de IA donada que mantuvo en marcha el motor de contenido, o simplemente una oración dicha en silencio por nosotros — gracias. Detrás de esta plataforma no hay presupuesto publicitario ni institución que la financie; existe porque personas corrientes decidieron que una plataforma islámica gratuita y narrada en voz alta merecía apoyo. Cada euro, cada dólar, cada dírham va directamente a mantener el Corán, los hadices y esta biblioteca al alcance de alguien que quizá nunca pueda devolver nada — y ese, si Dios quiere, es exactamente el propósito.",
      ],
    },
    {
      heading: "A todos los que han contribuido",
      body: [
        "A todos los que informaron de un error, sugirieron una función, tradujeron una frase, corrigieron una equivocación o simplemente se tomaron el tiempo de escribir una opinión honesta — esta plataforma es mejor gracias a vuestra franqueza, incluso (especialmente) cuando fue difícil de escuchar.",
      ],
    },
    {
      heading: "A ti, nuestro oyente",
      body: [
        "Y a ti, que lees esto ahora — quienquiera y dondequiera que estés — gracias por dedicar un momento de tu tiempo aquí. Tanto si viniste por un solo versículo, un solo hadiz, o te quedaste lo suficiente para terminar un libro entero, tú eres la razón por la que todo esto se construyó. Que lo que hayas encontrado aquí sea un medio de bien para ti, en esta vida y en la próxima.",
      ],
    },
  ],
  closingDua: "Que Alá acepte este pequeño esfuerzo, perdone sus carencias y lo convierta en una fuente de beneficio que llegue mucho más lejos de lo que ninguno de nosotros puede ver.",
};

const MAP: Record<string, ThanksLabels> = { en: EN, id: ID, fr: FR, de: DE, es: ES };

import { rebrandDeep } from "./rebrand";

export function thanksLabels(locale: string): ThanksLabels {
  return rebrandDeep(MAP[locale] ?? EN);
}
