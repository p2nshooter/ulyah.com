/**
 * The complete tajwid reference behind /quran/tajwid — every classical rule
 * group, each with a plain definition, its trigger letters, how it is read, and
 * example ayat. Content is authored in Indonesian + English (id primary on
 * ulyah.com; en is the fallback for other locales, matching the mushaf-labels
 * pattern).
 *
 * Honesty note (docs/CONTENT-POLICY.md): rules the Mushaf actually AUTO-COLORS
 * carry `colored: true` + a `color` matching apps/web/src/lib/tajwid.ts. Rules
 * that depend on recitation/waqf context a plain text cannot decide (mad 'aridh,
 * qalqalah kubra, hukum ra/lam jalalah) are marked `colored: false` and carry a
 * short note — they are taught here but never auto-colored, so the colouring is
 * never wrong.
 */

export interface GuideExample {
  ar: string;
  latin: string;
  ref: string;
}
export interface GuideRule {
  key: string;
  colored: boolean;
  color?: string;
  ar: string; // Arabic name
  huruf?: string; // trigger letters
  name: { id: string; en: string };
  def: { id: string; en: string };
  cara: { id: string; en: string };
  examples: GuideExample[];
  note?: { id: string; en: string };
}
export interface GuideGroup {
  key: string;
  title: { id: string; en: string };
  intro: { id: string; en: string };
  rules: GuideRule[];
}

export const TAJWID_GUIDE: GuideGroup[] = [
  {
    key: "nun-sukun-tanwin",
    title: { id: "Hukum Nun Sukun & Tanwin", en: "Rules of Nun Sakinah & Tanwin" },
    intro: {
      id: "Apabila nun mati (نْ) atau tanwin (ــًــٍــٌ) bertemu huruf hijaiah, ada lima hukum bacaan.",
      en: "When a silent nun (نْ) or tanwin meets a following letter, one of five rules applies.",
    },
    rules: [
      {
        key: "izhar-halqi",
        colored: false,
        ar: "إِظْهَار حَلْقِي",
        huruf: "ء ه ع ح غ خ",
        name: { id: "Izhar Halqi", en: "Izhar Halqi (clear)" },
        def: {
          id: "Nun mati/tanwin bertemu salah satu enam huruf halqi (tenggorokan).",
          en: "Nun sakinah/tanwin meets one of the six throat letters.",
        },
        cara: { id: "Dibaca jelas tanpa dengung.", en: "Read clearly, with no nasal sound." },
        examples: [
          { ar: "أَنْعَمْتَ", latin: "an'amta", ref: "Al-Fatihah 1:7" },
          { ar: "مِنْ خَوْفٍ", latin: "min khauf", ref: "Quraisy 106:4" },
        ],
        note: { id: "Dibaca jelas — sesuai kaidah mushaf, tidak diberi warna.", en: "Read clear — by mushaf convention it is left uncoloured." },
      },
      {
        key: "idgham-bighunnah",
        colored: true,
        color: "#1d4ed8",
        ar: "إِدْغَام بِغُنَّة",
        huruf: "ي ن م و",
        name: { id: "Idgham Bighunnah", en: "Idgham with ghunnah" },
        def: { id: "Nun mati/tanwin bertemu ya, nun, mim, wau (يَنْمُو).", en: "Nun sakinah/tanwin meets ya, nun, mim, or wau." },
        cara: { id: "Dileburkan ke huruf berikutnya dengan dengung dua harakat.", en: "Merged into the next letter with a two-count nasal sound." },
        examples: [
          { ar: "مَن يَعْمَلْ", latin: "may ya'mal", ref: "Az-Zalzalah 99:7" },
          { ar: "مِن نِّعْمَةٍ", latin: "min ni'mah", ref: "An-Nahl 16:53" },
        ],
      },
      {
        key: "idgham-bilaghunnah",
        colored: true,
        color: "#0f766e",
        ar: "إِدْغَام بِلَا غُنَّة",
        huruf: "ل ر",
        name: { id: "Idgham Bilaghunnah", en: "Idgham without ghunnah" },
        def: { id: "Nun mati/tanwin bertemu lam atau ra.", en: "Nun sakinah/tanwin meets lam or ra." },
        cara: { id: "Dileburkan tanpa dengung.", en: "Merged with no nasal sound." },
        examples: [
          { ar: "مِن رَّبِّهِمْ", latin: "mir rabbihim", ref: "Al-Baqarah 2:5" },
          { ar: "مِن لَّدُنْهُ", latin: "mil ladunhu", ref: "Al-Kahf 18:2" },
        ],
      },
      {
        key: "iqlab",
        colored: true,
        color: "#c2410c",
        ar: "إِقْلَاب",
        huruf: "ب",
        name: { id: "Iqlab", en: "Iqlab" },
        def: { id: "Nun mati/tanwin bertemu ba.", en: "Nun sakinah/tanwin meets ba." },
        cara: { id: "Bunyi nun berubah menjadi mim disertai dengung.", en: "The nun turns into a mim sound with a nasal sound." },
        examples: [
          { ar: "مِنۢ بَعْدِ", latin: "mim ba'di", ref: "Al-Baqarah 2:27" },
          { ar: "أَنۢبِئْهُم", latin: "ambi'hum", ref: "Al-Baqarah 2:33" },
        ],
      },
      {
        key: "ikhfa-haqiqi",
        colored: true,
        color: "#7e22ce",
        ar: "إِخْفَاء حَقِيقِي",
        huruf: "ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك",
        name: { id: "Ikhfa Haqiqi", en: "Ikhfa Haqiqi" },
        def: { id: "Nun mati/tanwin bertemu salah satu 15 huruf ikhfa.", en: "Nun sakinah/tanwin meets one of the 15 ikhfa letters." },
        cara: { id: "Dibaca samar-samar antara izhar dan idgham, disertai dengung.", en: "Read lightly concealed between clear and merged, with a nasal sound." },
        examples: [
          { ar: "أَنفُسَكُمْ", latin: "anfusakum", ref: "Al-Baqarah 2:44" },
          { ar: "مِن قَبْلِ", latin: "min qabli", ref: "Al-Baqarah 2:4" },
        ],
      },
    ],
  },
  {
    key: "mim-sukun",
    title: { id: "Hukum Mim Sukun", en: "Rules of Mim Sakinah" },
    intro: {
      id: "Apabila mim mati (مْ) bertemu huruf hijaiah, ada tiga hukum bacaan.",
      en: "When a silent mim (مْ) meets a following letter, one of three rules applies.",
    },
    rules: [
      {
        key: "ikhfa-syafawi",
        colored: true,
        color: "#a21caf",
        ar: "إِخْفَاء شَفَوِي",
        huruf: "ب",
        name: { id: "Ikhfa Syafawi", en: "Ikhfa Shafawi" },
        def: { id: "Mim mati bertemu ba.", en: "Mim sakinah meets ba." },
        cara: { id: "Dibaca samar di bibir disertai dengung.", en: "Read lightly concealed at the lips with a nasal sound." },
        examples: [
          { ar: "تَرْمِيهِم بِحِجَارَةٍ", latin: "tarmihim bihijarah", ref: "Al-Fil 105:4" },
          { ar: "وَمَا لَهُم بِذَٰلِكَ", latin: "wa ma lahum bidzalika", ref: "" },
        ],
      },
      {
        key: "idgham-mimi",
        colored: true,
        color: "#0e7490",
        ar: "إِدْغَام مِيمِي",
        huruf: "م",
        name: { id: "Idgham Mimi (Mutamatsilain)", en: "Idgham mimi (mutamathilayn)" },
        def: { id: "Mim mati bertemu mim.", en: "Mim sakinah meets mim." },
        cara: { id: "Dileburkan menjadi mim bertasydid disertai dengung.", en: "Merged into a doubled mim with a nasal sound." },
        examples: [
          { ar: "لَهُم مَّا يَشَاءُونَ", latin: "lahum ma yasya'un", ref: "Az-Zumar 39:34" },
          { ar: "كَم مِّن فِئَةٍ", latin: "kam min fi'ah", ref: "Al-Baqarah 2:249" },
        ],
      },
      {
        key: "izhar-syafawi",
        colored: false,
        ar: "إِظْهَار شَفَوِي",
        huruf: "selain ب dan م",
        name: { id: "Izhar Syafawi", en: "Izhar Shafawi" },
        def: { id: "Mim mati bertemu huruf selain ba dan mim.", en: "Mim sakinah meets any letter other than ba and mim." },
        cara: { id: "Dibaca jelas di bibir, tanpa dengung.", en: "Read clearly at the lips, no nasal sound." },
        examples: [
          { ar: "الْحَمْدُ", latin: "al-hamdu", ref: "Al-Fatihah 1:2" },
          { ar: "أَمْ لَمْ", latin: "am lam", ref: "Al-Baqarah 2:6" },
        ],
        note: { id: "Dibaca jelas — tidak diberi warna.", en: "Read clear — left uncoloured." },
      },
    ],
  },
  {
    key: "ghunnah",
    title: { id: "Ghunnah Musyaddadah", en: "Ghunnah Mushaddadah" },
    intro: {
      id: "Nun atau mim yang bertasydid wajib dibaca berdengung.",
      en: "A nun or mim carrying shadda must be read with a nasal hum.",
    },
    rules: [
      {
        key: "ghunnah",
        colored: true,
        color: "#15803d",
        ar: "غُنَّة",
        huruf: "نّ مّ",
        name: { id: "Ghunnah", en: "Ghunnah" },
        def: { id: "Setiap nun atau mim bertasydid (نّ / مّ).", en: "Every nun or mim with shadda (نّ / مّ)." },
        cara: { id: "Ditahan dengan dengung selama dua harakat.", en: "Held with a nasal hum for two counts." },
        examples: [
          { ar: "إِنَّ", latin: "inna", ref: "—" },
          { ar: "ثُمَّ", latin: "tsumma", ref: "—" },
          { ar: "الْجَنَّةِ", latin: "al-jannah", ref: "—" },
        ],
      },
    ],
  },
  {
    key: "mad",
    title: { id: "Hukum Mad (Panjang Bacaan)", en: "Rules of Madd (prolongation)" },
    intro: {
      id: "Mad adalah memanjangkan bunyi huruf mad (ا و ي). Mad asli (thabi'i) 2 harakat; mad far'i (cabang) memiliki sebab tambahan (hamzah, sukun, tasydid) dan panjang yang berbeda.",
      en: "Madd is lengthening a vowel over the madd letters (ا و ي). Natural madd is 2 counts; the branch (far'i) types have an extra cause (hamza, sukun, shadda) and differing lengths.",
    },
    rules: [
      {
        key: "mad-thabii",
        colored: false,
        ar: "مَدّ طَبِيعِي",
        name: { id: "Mad Thabi'i (Asli)", en: "Madd Thabi'i (natural)" },
        def: { id: "Huruf mad tanpa sebab hamzah atau sukun sesudahnya.", en: "A madd letter with no following hamza or sukun." },
        cara: { id: "Dipanjangkan dua harakat.", en: "Lengthened two counts." },
        examples: [
          { ar: "قَالَ", latin: "qāla", ref: "—" },
          { ar: "يَقُولُ", latin: "yaqūlu", ref: "—" },
          { ar: "قِيلَ", latin: "qīla", ref: "—" },
        ],
        note: { id: "Panjang dasar 2 harakat — tidak diberi warna khusus.", en: "The 2-count baseline — not specially coloured." },
      },
      {
        key: "mad-wajib-muttasil",
        colored: true,
        color: "#9a3412",
        ar: "مَدّ وَاجِب مُتَّصِل",
        name: { id: "Mad Wajib Muttasil", en: "Madd Wajib Muttasil" },
        def: { id: "Huruf mad bertemu hamzah (ء) dalam satu kata.", en: "A madd letter meets a hamza (ء) within the same word." },
        cara: { id: "Wajib dipanjangkan 4–5 harakat.", en: "Obligatorily lengthened 4–5 counts." },
        examples: [
          { ar: "جَآءَ", latin: "jā'a", ref: "—" },
          { ar: "السَّمَآءِ", latin: "as-samā'i", ref: "Al-Baqarah 2:22" },
        ],
      },
      {
        key: "mad-jaiz-munfasil",
        colored: true,
        color: "#b45309",
        ar: "مَدّ جَائِز مُنْفَصِل",
        name: { id: "Mad Jaiz Munfasil", en: "Madd Jaiz Munfasil" },
        def: { id: "Huruf mad di akhir kata dan hamzah di awal kata berikutnya.", en: "A madd letter at a word's end, with a hamza starting the next word." },
        cara: { id: "Boleh dipanjangkan 2, 4, atau 5 harakat.", en: "May be lengthened 2, 4, or 5 counts." },
        examples: [
          { ar: "بِمَآ أُنزِلَ", latin: "bimā unzila", ref: "Al-Baqarah 2:4" },
          { ar: "قُوٓا۟ أَنفُسَكُمْ", latin: "qū anfusakum", ref: "At-Tahrim 66:6" },
        ],
      },
      {
        key: "mad-lazim",
        colored: true,
        color: "#7c2d12",
        ar: "مَدّ لَازِم",
        name: { id: "Mad Lazim", en: "Madd Lazim" },
        def: {
          id: "Huruf mad bertemu huruf bertasydid atau bersukun tetap. Empat jenis: kilmi mutsaqqal, kilmi mukhaffaf, harfi mutsaqqal, harfi mukhaffaf.",
          en: "A madd letter meets a letter with a permanent shadda or sukun. Four kinds: kilmi/harfi × mutsaqqal/mukhaffaf.",
        },
        cara: { id: "Dipanjangkan enam harakat.", en: "Lengthened a full six counts." },
        examples: [
          { ar: "الضَّآلِّينَ", latin: "aḍ-ḍāllīn", ref: "Al-Fatihah 1:7" },
          { ar: "الٓمٓ", latin: "alif-lām-mīm", ref: "Al-Baqarah 2:1" },
        ],
      },
      {
        key: "mad-aridh",
        colored: false,
        ar: "مَدّ عَارِض لِلسُّكُون",
        name: { id: "Mad 'Aridh Lissukun", en: "Madd 'Aridh Lissukun" },
        def: { id: "Huruf mad thabi'i sebelum huruf terakhir yang diwaqafkan (dimatikan karena berhenti).", en: "A natural madd before the last letter when one stops (waqf) on it." },
        cara: { id: "Boleh 2, 4, atau 6 harakat.", en: "May be 2, 4, or 6 counts." },
        examples: [
          { ar: "الْعَالَمِينَ", latin: "al-'ālamīn", ref: "Al-Fatihah 1:2" },
          { ar: "الرَّحِيمِ", latin: "ar-raḥīm", ref: "Al-Fatihah 1:3" },
        ],
        note: {
          id: "Bergantung pada waqaf (berhenti), tidak bisa dipastikan dari teks — dijelaskan, tidak diwarnai otomatis.",
          en: "Depends on where one stops, undecidable from text — taught but not auto-coloured.",
        },
      },
      {
        key: "mad-iwad",
        colored: false,
        ar: "مَدّ عِوَض",
        name: { id: "Mad 'Iwad", en: "Madd 'Iwad" },
        def: { id: "Tanwin fathah (ــً) di akhir kata yang diwaqafkan.", en: "Fathatan (ــً) at a word's end when stopped upon." },
        cara: { id: "Dibaca panjang dua harakat sebagai ganti tanwin.", en: "Read two counts long in place of the tanwin." },
        examples: [{ ar: "عَلِيمًا ← عَلِيمَا", latin: "'alīmā", ref: "An-Nisa 4:11" }],
        note: { id: "Bergantung waqaf — tidak diwarnai otomatis.", en: "Waqf-dependent — not auto-coloured." },
      },
      {
        key: "mad-badal",
        colored: false,
        ar: "مَدّ بَدَل",
        name: { id: "Mad Badal", en: "Madd Badal" },
        def: { id: "Hamzah bertemu huruf mad dalam satu kata (hamzah lebih dulu).", en: "A hamza followed by a madd letter within a word (hamza first)." },
        cara: { id: "Dipanjangkan dua harakat.", en: "Lengthened two counts." },
        examples: [
          { ar: "ءَامَنُوا", latin: "āmanū", ref: "Al-Baqarah 2:25" },
          { ar: "إِيمَانًا", latin: "īmānā", ref: "Al-Anfal 8:2" },
        ],
      },
      {
        key: "mad-lin",
        colored: false,
        ar: "مَدّ لِين",
        name: { id: "Mad Lin (Layyin)", en: "Madd Lin" },
        def: { id: "Wau atau ya sukun didahului huruf berharakat fathah, lalu diwaqafkan.", en: "A silent wau or ya preceded by a fathah, when stopped upon." },
        cara: { id: "Dibaca lembut 2, 4, atau 6 harakat saat waqaf.", en: "Read softly 2, 4, or 6 counts at a stop." },
        examples: [
          { ar: "خَوْفٍ", latin: "khauf", ref: "Quraisy 106:4" },
          { ar: "الْبَيْتِ", latin: "al-bait", ref: "Quraisy 106:3" },
        ],
        note: { id: "Bergantung waqaf — tidak diwarnai otomatis.", en: "Waqf-dependent — not auto-coloured." },
      },
    ],
  },
  {
    key: "lam-tarif",
    title: { id: "Hukum Lam Ta'rif (Alif Lam)", en: "Rules of the Definite Article (Alif Lam)" },
    intro: {
      id: "Alif-lam (ال) di awal kata dibaca berbeda tergantung huruf sesudahnya: qamariyah (jelas) atau syamsiyah (lebur).",
      en: "The article ال is read differently by the letter after it: qamariyah (clear) or shamsiyyah (assimilated).",
    },
    rules: [
      {
        key: "izhar-qamariyah",
        colored: false,
        ar: "إِظْهَار قَمَرِيَّة",
        huruf: "ا ب غ ح ج ك و خ ف ع ق ي م ه",
        name: { id: "Izhar Qamariyah", en: "Izhar Qamariyyah" },
        def: { id: "Alif-lam bertemu salah satu 14 huruf qamariyah.", en: "The article meets one of the 14 moon letters." },
        cara: { id: "Lam dibaca jelas (al-).", en: "The lam is pronounced clearly (al-)." },
        examples: [
          { ar: "الْقَمَرُ", latin: "al-qamar", ref: "—" },
          { ar: "الْحَمْدُ", latin: "al-hamd", ref: "Al-Fatihah 1:2" },
        ],
        note: { id: "Dibaca jelas — tidak diberi warna.", en: "Read clear — left uncoloured." },
      },
      {
        key: "idgham-syamsiyah",
        colored: true,
        color: "#be185d",
        ar: "إِدْغَام شَمْسِيَّة",
        huruf: "ت ث د ذ ر ز س ش ص ض ط ظ ل ن",
        name: { id: "Idgham Syamsiyah", en: "Idgham Shamsiyyah" },
        def: { id: "Alif-lam bertemu salah satu 14 huruf syamsiah.", en: "The article meets one of the 14 sun letters." },
        cara: { id: "Lam tidak dibaca; langsung ke huruf berikutnya yang bertasydid.", en: "The lam is silent; read straight into the next (doubled) letter." },
        examples: [
          { ar: "الشَّمْسُ", latin: "asy-syams", ref: "—" },
          { ar: "الرَّحْمَٰنُ", latin: "ar-rahman", ref: "Al-Fatihah 1:1" },
        ],
      },
    ],
  },
  {
    key: "qalqalah",
    title: { id: "Qalqalah", en: "Qalqalah" },
    intro: {
      id: "Lima huruf qalqalah (ق ط ب ج د) bila bersukun dibaca memantul.",
      en: "The five qalqalah letters (ق ط ب ج د), when carrying sukun, are read with a bounce.",
    },
    rules: [
      {
        key: "qalqalah-sughra",
        colored: true,
        color: "#b91c1c",
        ar: "قَلْقَلَة صُغْرَى",
        huruf: "ق ط ب ج د",
        name: { id: "Qalqalah Sughra", en: "Qalqalah Sughra" },
        def: { id: "Huruf qalqalah bersukun asli di tengah kata.", en: "A qalqalah letter with an original sukun mid-word." },
        cara: { id: "Dibaca memantul ringan.", en: "Read with a light bounce." },
        examples: [
          { ar: "يَقْطَعُونَ", latin: "yaqṭa'ūn", ref: "Al-Baqarah 2:27" },
          { ar: "أَبْصَارِهِمْ", latin: "abṣārihim", ref: "Al-Baqarah 2:7" },
        ],
      },
      {
        key: "qalqalah-kubra",
        colored: false,
        ar: "قَلْقَلَة كُبْرَى",
        huruf: "ق ط ب ج د",
        name: { id: "Qalqalah Kubra", en: "Qalqalah Kubra" },
        def: { id: "Huruf qalqalah di akhir kata yang diwaqafkan.", en: "A qalqalah letter at a word's end when stopped upon." },
        cara: { id: "Dibaca memantul lebih kuat.", en: "Read with a stronger bounce." },
        examples: [
          { ar: "الْفَلَقِ", latin: "al-falaq", ref: "Al-Falaq 113:1" },
          { ar: "أَحَدٌ ← أَحَدْ", latin: "aḥad", ref: "Al-Ikhlas 112:1" },
        ],
        note: { id: "Muncul saat waqaf — tidak diwarnai otomatis.", en: "Appears at a stop — not auto-coloured." },
      },
    ],
  },
  {
    key: "hukum-ra",
    title: { id: "Hukum Ra", en: "Rules of Ra" },
    intro: {
      id: "Huruf ra dibaca tebal (tafkhim) atau tipis (tarqiq) tergantung harakatnya dan huruf sekitarnya.",
      en: "The letter ra is read heavy (tafkhim) or light (tarqiq) depending on its vowel and surroundings.",
    },
    rules: [
      {
        key: "ra-tafkhim",
        colored: false,
        ar: "تَفْخِيم",
        name: { id: "Ra Tafkhim (Tebal)", en: "Ra Tafkhim (heavy)" },
        def: { id: "Ra berharakat fathah/dhammah, atau ra sukun didahului fathah/dhammah.", en: "Ra with fathah/dammah, or silent ra preceded by fathah/dammah." },
        cara: { id: "Dibaca tebal.", en: "Read heavy/full." },
        examples: [
          { ar: "رَبَّنَا", latin: "rabbanā", ref: "—" },
          { ar: "الرَّزَّاقُ", latin: "ar-razzāq", ref: "Adz-Dzariyat 51:58" },
        ],
        note: { id: "Bergantung harakat sekitar — dijelaskan, tidak diwarnai otomatis.", en: "Depends on surrounding vowels — taught, not auto-coloured." },
      },
      {
        key: "ra-tarqiq",
        colored: false,
        ar: "تَرْقِيق",
        name: { id: "Ra Tarqiq (Tipis)", en: "Ra Tarqiq (light)" },
        def: { id: "Ra berharakat kasrah, atau ra sukun didahului kasrah asli.", en: "Ra with kasrah, or silent ra preceded by an original kasrah." },
        cara: { id: "Dibaca tipis.", en: "Read light/thin." },
        examples: [
          { ar: "رِزْقًا", latin: "rizqā", ref: "Al-Baqarah 2:25" },
          { ar: "فِرْعَوْنَ", latin: "fir'auna", ref: "—" },
        ],
        note: { id: "Bergantung harakat sekitar — tidak diwarnai otomatis.", en: "Depends on surrounding vowels — not auto-coloured." },
      },
    ],
  },
  {
    key: "lam-jalalah",
    title: { id: "Hukum Lam Jalalah", en: "Rules of Lam in the Name of Allah" },
    intro: {
      id: "Lam pada lafaz الله dibaca tebal atau tipis tergantung harakat huruf sebelumnya.",
      en: "The lam in the name الله is read heavy or light depending on the preceding vowel.",
    },
    rules: [
      {
        key: "lam-tafkhim",
        colored: false,
        ar: "تَفْخِيم",
        name: { id: "Lam Jalalah Tafkhim", en: "Lam Jalalah heavy" },
        def: { id: "Lafaz الله didahului harakat fathah atau dhammah.", en: "الله preceded by fathah or dammah." },
        cara: { id: "Lam dibaca tebal.", en: "The lam is read heavy." },
        examples: [
          { ar: "قَالَ اللَّهُ", latin: "qālallāh", ref: "—" },
          { ar: "عَبْدُ اللَّهِ", latin: "'abdullāh", ref: "—" },
        ],
        note: { id: "Bergantung harakat sebelumnya — tidak diwarnai otomatis.", en: "Depends on the preceding vowel — not auto-coloured." },
      },
      {
        key: "lam-tarqiq",
        colored: false,
        ar: "تَرْقِيق",
        name: { id: "Lam Jalalah Tarqiq", en: "Lam Jalalah light" },
        def: { id: "Lafaz الله didahului harakat kasrah.", en: "الله preceded by kasrah." },
        cara: { id: "Lam dibaca tipis.", en: "The lam is read light." },
        examples: [
          { ar: "بِسْمِ اللَّهِ", latin: "bismillāh", ref: "Al-Fatihah 1:1" },
          { ar: "لِلَّهِ", latin: "lillāh", ref: "—" },
        ],
        note: { id: "Bergantung harakat sebelumnya — tidak diwarnai otomatis.", en: "Depends on the preceding vowel — not auto-coloured." },
      },
    ],
  },
  {
    key: "idgham-lain",
    title: { id: "Idgham Lain (Mutamatsilain, Mutajanisain, Mutaqaribain)", en: "Other Idgham" },
    intro: {
      id: "Peleburan dua huruf yang sama, sejenis, atau berdekatan makhraj.",
      en: "Merging two letters that are identical, of the same articulation family, or of nearby articulation.",
    },
    rules: [
      {
        key: "mutamatsilain",
        colored: false,
        ar: "إِدْغَام مُتَمَاثِلَيْن",
        name: { id: "Idgham Mutamatsilain", en: "Idgham Mutamathilayn" },
        def: { id: "Dua huruf sama; yang pertama sukun.", en: "Two identical letters; the first is silent." },
        cara: { id: "Dilebur jadi satu huruf bertasydid.", en: "Merged into one doubled letter." },
        examples: [{ ar: "قَد دَّخَلُوا", latin: "qad dakhalū", ref: "Al-Ma'idah 5:61" }],
        note: { id: "Dijelaskan; sebagian sudah tercakup pada idgham mimi.", en: "Taught here; the mim case is already covered by idgham mimi." },
      },
      {
        key: "mutajanisain",
        colored: false,
        ar: "إِدْغَام مُتَجَانِسَيْن",
        name: { id: "Idgham Mutajanisain", en: "Idgham Mutajanisayn" },
        def: { id: "Dua huruf sama makhraj beda sifat (mis. ت-ط, د-ت, ذ-ظ).", en: "Same articulation point, different traits (e.g. ت-ط, د-ت, ذ-ظ)." },
        cara: { id: "Huruf pertama dilebur ke huruf kedua.", en: "The first letter merges into the second." },
        examples: [{ ar: "قَالَت طَّآئِفَةٌ", latin: "qālaṭ ṭā'ifah", ref: "Ali 'Imran 3:72" }],
      },
      {
        key: "mutaqaribain",
        colored: false,
        ar: "إِدْغَام مُتَقَارِبَيْن",
        name: { id: "Idgham Mutaqaribain", en: "Idgham Mutaqaribayn" },
        def: { id: "Dua huruf berdekatan makhraj/sifat (mis. ل-ر, ق-ك).", en: "Two letters of nearby articulation/traits (e.g. ل-ر, ق-ك)." },
        cara: { id: "Huruf pertama dilebur ke huruf kedua.", en: "The first letter merges into the second." },
        examples: [{ ar: "بَل رَّفَعَهُ", latin: "bar rafa'ahu", ref: "An-Nisa 4:158" }],
      },
    ],
  },
  {
    key: "waqaf",
    title: { id: "Tanda Waqaf (Berhenti)", en: "Waqf (stopping) Signs" },
    intro: {
      id: "Tanda-tanda kecil di atas ayat yang mengatur di mana sebaiknya berhenti atau terus membaca.",
      en: "The small marks above the text that guide where to stop or continue.",
    },
    rules: [
      {
        key: "waqf-lazim",
        colored: false,
        ar: "مـ (لَازِم)",
        name: { id: "Waqaf Lazim (مـ)", en: "Necessary stop (مـ)" },
        def: { id: "Harus berhenti; jika diteruskan bisa mengubah makna.", en: "Must stop; continuing may change the meaning." },
        cara: { id: "Berhenti.", en: "Stop." },
        examples: [],
      },
      {
        key: "waqf-mamnu",
        colored: false,
        ar: "لا (لَا وَقْف)",
        name: { id: "Waqaf Mamnu' (لا)", en: "No stop (لا)" },
        def: { id: "Sebaiknya tidak berhenti (jika di tengah ayat).", en: "Preferably do not stop (mid-verse)." },
        cara: { id: "Terus.", en: "Continue." },
        examples: [],
      },
      {
        key: "waqf-jaiz",
        colored: false,
        ar: "ج / صلى / قلى",
        name: { id: "Waqaf Jaiz (ج, صلى, قلى)", en: "Permissible stop (ج, صلى, قلى)" },
        def: {
          id: "Boleh berhenti atau terus; صلى lebih baik terus, قلى lebih baik berhenti.",
          en: "Either is allowed; صلى prefers continuing, قلى prefers stopping.",
        },
        cara: { id: "Pilih sesuai anjuran tandanya.", en: "Choose per the sign's preference." },
        examples: [],
      },
      {
        key: "waqf-muanaqah",
        colored: false,
        ar: "∴ ... ∴ (مُعَانَقَة)",
        name: { id: "Waqaf Mu'anaqah (titik tiga berpasangan)", en: "Embracing stop (paired dots)" },
        def: { id: "Berhenti pada salah satu dari dua titik, tidak pada keduanya.", en: "Stop at one of the two marks, not both." },
        cara: { id: "Pilih satu tempat berhenti.", en: "Pick one place to stop." },
        examples: [],
      },
    ],
  },
];
