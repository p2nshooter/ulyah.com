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

const MAP: Record<string, ThanksLabels> = { en: EN, id: ID };

export function thanksLabels(locale: string): ThanksLabels {
  return MAP[locale] ?? EN;
}
