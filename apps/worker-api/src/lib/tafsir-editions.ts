// AUTO-DERIVED from the spa5k/tafsir_api README table (118 editions). This is
// the full catalogue the site "absorbs" — every edition here is reachable on
// demand via lib/tafsir-source.ts (fetched from GitHub raw, KV-cached per
// surah, never bulk-imported into D1). FEATURED_TAFSIR below is the curated
// subset actually offered in the reader's source picker right now; more slugs
// can be promoted into it in later batches without any data migration.

export interface TafsirEdition {
  /** upstream numeric id, kept for traceability to the source table */
  id: number;
  /** URL path segment under tafsir/ on the CDN */
  slug: string;
  /** spa5k language name, lowercase */
  lang: string;
  /** human-facing edition name */
  name: string;
  /** author / compiler */
  author: string;
}

export const TAFSIR_EDITIONS: TafsirEdition[] = [
  { id: 22, slug: "ar-tafsir-ibn-kathir", lang: "arabic", name: "Tafsir Ibn Kathir", author: "Hafiz Ibn Kathir" },
  { id: 23, slug: "ar-tafseer-al-qurtubi", lang: "arabic", name: "Tafseer Al Qurtubi", author: "Qurtubi" },
  { id: 24, slug: "ar-tafseer-al-saddi", lang: "arabic", name: "Tafseer Al Saadi - Arabic", author: "Saddi" },
  { id: 25, slug: "ar-tafseer-tahrir-al-tanwir", lang: "arabic", name: "Tafsir al-Tahrir wa al-Tanwir", author: "Tafsir al-Tahrir wa al-Tanwir" },
  { id: 26, slug: "ar-tafsir-al-wasit", lang: "arabic", name: "Tafsir Al Wasit", author: "Waseet" },
  { id: 27, slug: "ar-tafsir-al-baghawi", lang: "arabic", name: "Tafseer Al-Baghawi", author: "Baghawy" },
  { id: 28, slug: "tafsir-fe-zalul-quran-syed-qatab", lang: "urdu", name: "Fi Zilal al-Quran", author: "Fi Zilal al-Quran" },
  { id: 29, slug: "tafsir-bayan-ul-quran", lang: "urdu", name: "Tafsir Bayan ul Quran", author: "Tafsir Bayan ul Quran" },
  { id: 30, slug: "tafseer-ibn-e-kaseer-urdu", lang: "urdu", name: "Tafsir Ibn Kathir", author: "Tafsir Ibn Kathir" },
  { id: 31, slug: "bn-tafseer-ibn-e-kaseer", lang: "bengali", name: "Tafseer ibn Kathir", author: "Tawheed Publication" },
  { id: 32, slug: "bn-tafsir-ahsanul-bayaan", lang: "bengali", name: "Tafsir Ahsanul Bayaan", author: "Bayaan Foundation" },
  { id: 33, slug: "bn-tafsir-abu-bakr-zakaria", lang: "bengali", name: "Tafsir Abu Bakr Zakaria", author: "King Fahd Quran Printing Complex" },
  { id: 34, slug: "en-tafsir-maarif-ul-quran", lang: "english", name: "Maarif-ul-Quran", author: "Mufti Muhammad Shafi" },
  { id: 35, slug: "en-tafisr-ibn-kathir", lang: "english", name: "Tafsir Ibn Kathir", author: "Hafiz Ibn Kathir" },
  { id: 36, slug: "ru-tafseer-al-saddi", lang: "russian", name: "Tafseer Al Saadi - Russian", author: "Saddi" },
  { id: 37, slug: "ar-tafsir-al-tabari", lang: "arabic", name: "Tafsir al-Tabari", author: "Tabari" },
  { id: 38, slug: "ar-tafsir-muyassar", lang: "arabic", name: "Tafsir Muyassar", author: "المیسر" },
  { id: 39, slug: "tafisr-fathul-majid-bn", lang: "bengali", name: "Tafsir Fathul Majid", author: "Tafsir Fathul Majid" },
  { id: 40, slug: "kurd-tafsir-rebar", lang: "kurdish", name: "Rebar Kurdish Tafsir", author: "Rebar Kurdish Tafsir" },
  { id: 41, slug: "in-tafsir-jalalayn", lang: "indonesian", name: "Tafsir Jalalayn", author: "Tafsir Jalalayn" },
  { id: 42, slug: "tazkirul-quran-en", lang: "english", name: "Tazkirul Quran(Maulana Wahiduddin Khan)", author: "Tazkirul Quran(Maulana Wahiduddin Khan)" },
  { id: 43, slug: "tazkiru-quran-ur", lang: "urdu", name: "Tazkirul Quran(Maulana Wahiduddin Khan)", author: "Tazkirul Quran(Maulana Wahiduddin Khan)" },
  { id: 73, slug: "en-tafsir-ibn-abbas", lang: "english", name: "Tanwîr al-Miqbâs min Tafsîr Ibn ‘Abbâs", author: "Tanwîr al-Miqbâs min Tafsîr Ibn ‘Abbâs" },
  { id: 74, slug: "en-al-jalalayn", lang: "english", name: "Al-Jalalayn", author: "Al-Jalalayn" },
  { id: 86, slug: "en-asbab-al-nuzul-by-al-wahidi", lang: "english", name: "Asbab Al-Nuzul by Al-Wahidi", author: "Asbab Al-Nuzul by Al-Wahidi" },
  { id: 92, slug: "ar-tafseer-tanwir-al-miqbas", lang: "arabic", name: "Tafseer Tanwir al-Miqbas", author: "Tanweer" },
  { id: 93, slug: "en-tafsir-al-tustari", lang: "english", name: "Tafsir al-Tustari", author: "Tafsir al-Tustari" },
  { id: 107, slug: "en-kashani-tafsir", lang: "english", name: "Kashani Tafsir", author: "Kashani Tafsir" },
  { id: 108, slug: "en-al-qushairi-tafsir", lang: "english", name: "Al Qushairi Tafsir", author: "Al Qushairi Tafsir" },
  { id: 109, slug: "en-kashf-al-asrar-tafsir", lang: "english", name: "Kashf Al-Asrar Tafsir", author: "Kashf Al-Asrar Tafsir" },
  { id: 157, slug: "ur-tafsir-fe-zalul-quran-syed-qatab", lang: "urdu", name: "Fi Zilal al-Quran", author: "Sayyid Ibrahim Qutb" },
  { id: 159, slug: "ur-tafsir-bayan-ul-quran", lang: "urdu", name: "Tafsir Bayan ul Quran", author: "Dr. Israr Ahmad" },
  { id: 160, slug: "ur-tafseer-ibn-e-kaseer", lang: "urdu", name: "Tafsir Ibn Kathir", author: "Hafiz Ibn Kathir" },
  { id: 250, slug: "asseraj-fi-bayan-gharib-alquran", lang: "arabic", name: "Asseraj fi Bayan Gharib AlQuran", author: "Asseraj fi Bayan Gharib AlQuran" },
  { id: 251, slug: "ar-tafsir-al-mukhtasar", lang: "arabic", name: "Arabic Al-Mukhtasar in interpreting the Noble Quran", author: "Tafsir Center for Quranic Studies" },
  { id: 252, slug: "bosnian-mokhtasar", lang: "bosnian", name: "Bosnian Abridged Explanation of the Quran", author: "Bosnian Abridged Explanation of the Quran" },
  { id: 253, slug: "italian-mokhtasar", lang: "italian", name: "Italian Al-Mukhtasar in interpreting the Noble Quran", author: "Italian Al-Mukhtasar in interpreting the Noble Quran" },
  { id: 254, slug: "tagalog-mokhtasar", lang: "tagalog", name: "Filipino (Tagalog) Al-Mukhtasar in interpreting the Noble Quran", author: "Filipino (Tagalog) Al-Mukhtasar in interpreting the Noble Quran" },
  { id: 255, slug: "assamese-mokhtasar", lang: "assamese", name: "Assamese Abridged Explanation of the Quran", author: "Assamese Abridged Explanation of the Quran" },
  { id: 256, slug: "malayalam-mokhtasar", lang: "malayalam", name: "Malayalam Abridged Explanation of the Quran", author: "Malayalam Abridged Explanation of the Quran" },
  { id: 257, slug: "khmer-mokhtasar", lang: "central khmer", name: "Khmer Abridged Explanation of the Quran", author: "Khmer Abridged Explanation of the Quran" },
  { id: 258, slug: "turkish-mokhtasar", lang: "turkish", name: "Turkish Al-Mukhtasar in Interpreting the Noble Quran", author: "Turkish Al-Mukhtasar in Interpreting the Noble Quran" },
  { id: 259, slug: "french-mokhtasar", lang: "french", name: "French Abridged Explanation of the Quran", author: "French Abridged Explanation of the Quran" },
  { id: 260, slug: "indonesian-mokhtasar", lang: "indonesian", name: "Indoniesua Al-Mukhtasar in Interpreting the Noble Quran", author: "Indoniesua Al-Mukhtasar in Interpreting the Noble Quran" },
  { id: 261, slug: "vietnamese-mokhtasar", lang: "vietnamese", name: "Vietnamese Al-Mukhtasar in interpreting the Noble Quran", author: "Vietnamese Al-Mukhtasar in interpreting the Noble Quran" },
  { id: 262, slug: "russian-mokhtasar", lang: "russian", name: "Russian Al-Mukhtasar", author: "Russian Al-Mukhtasar" },
  { id: 263, slug: "persian-mokhtasar", lang: "persian", name: "Persian Al-Mukhtasar in interpreting the Noble Quran", author: "Persian Al-Mukhtasar in interpreting the Noble Quran" },
  { id: 264, slug: "chinese-mokhtasar", lang: "chinese", name: "Chinese Abridged Explanation of the Quran", author: "Chinese Abridged Explanation of the Quran" },
  { id: 265, slug: "japanese-mokhtasar", lang: "japanese", name: "Japanese Abridged Explanation of the Quran", author: "Japanese Abridged Explanation of the Quran" },
  { id: 266, slug: "en-tafsir-al-mukhtasar", lang: "english", name: "English Al-Mukhtasar", author: "Tafsir Center for Quranic Studies" },
  { id: 267, slug: "bengali-mokhtasar", lang: "bengali", name: "Bengali Abridged Explanation of the Quran", author: "Bengali Abridged Explanation of the Quran" },
  { id: 268, slug: "spanish-mokhtasar", lang: "spanish", name: "Spanish Abridged Explanation of the Quran", author: "Spanish Abridged Explanation of the Quran" },
  { id: 283, slug: "sq-saadi", lang: "albanian", name: "Tafsir As-Saadi", author: "Tafsir As-Saadi" },
  { id: 306, slug: "tr-tafsir-ibne-kathir", lang: "turkish", name: "Tafsir Ibne Kathir", author: "Tafsir Ibne Kathir" },
  { id: 307, slug: "ru-tafsir-ibne-kahtir", lang: "russian", name: "Tafsir Ibne Kathir", author: "Tafsir Ibne Kathir" },
  { id: 308, slug: "ar-tafsir-as-saadi", lang: "arabic", name: "Tafsir As-Saadi", author: "Tafsir As-Saadi" },
  { id: 309, slug: "ur-tafsir-as-saadi-urdu", lang: "urdu", name: "Tafsir As-Saadi - Urdu", author: "Tafsir As-Saadi - Urdu" },
  { id: 310, slug: "tafsir-as-saadi-russian", lang: "russian", name: "Tafsir As-Saadi", author: "Tafsir As-Saadi" },
  { id: 381, slug: "bn-tafisr-fathul-majid", lang: "bengali", name: "Tafsir Fathul Majid", author: "AbdulRahman Bin Hasan Al-Alshaikh" },
  { id: 453, slug: "sinhalese-mokhtasar", lang: "sinhala", name: "Sinhalese Mokhtasar", author: "Sinhalese Mokhtasar" },
  { id: 484, slug: "turkish-tafsir-as-saadi-turkish", lang: "turkish", name: "Tafsir As-Saadi - Turkish", author: "Tafsir As-Saadi - Turkish" },
  { id: 485, slug: "fr-tafsir-as-saadi", lang: "persian", name: "Tafsir As-Saadi - Persian", author: "Tafsir As-Saadi - Persian" },
  { id: 486, slug: "tafsir-ibn-uthaymeen", lang: "arabic", name: "Tafsir Ibn Uthaymeen", author: "Tafsir Ibn Uthaymeen" },
  { id: 487, slug: "tahlil-kalimat-al-qur-an", lang: "arabic", name: "Tahlil Kalimat al-Qur'an", author: "Tahlil Kalimat al-Qur'an" },
  { id: 488, slug: "tafsir-al-razi", lang: "arabic", name: "Tafsir Al-Razi", author: "Tafsir Al-Razi" },
  { id: 489, slug: "al-wajiz-wahidi", lang: "arabic", name: "Al-Wajiz Wahidi", author: "Al-Wajiz Wahidi" },
  { id: 490, slug: "tafsir-makhi", lang: "arabic", name: "Tafsir Makhi", author: "Tafsir Makhi" },
  { id: 491, slug: "tafsir-ibn-juzay", lang: "arabic", name: "Tafsir Ibn Juzay", author: "Tafsir Ibn Juzay" },
  { id: 492, slug: "mawsoo-at-al-tafsir-al-ma-thoor", lang: "arabic", name: "Mawsoo'at Al-Tafsir Al-Ma'thoor", author: "Mawsoo'at Al-Tafsir Al-Ma'thoor" },
  { id: 493, slug: "al-durr-al-manthur", lang: "arabic", name: "Al-Durr Al-Manthur", author: "Al-Durr Al-Manthur" },
  { id: 494, slug: "fath-al-qadir-al-shawkani", lang: "arabic", name: "Fath Al-Qadir Al-Shawkani", author: "Fath Al-Qadir Al-Shawkani" },
  { id: 496, slug: "tafsir-ibn-al-jawzi", lang: "arabic", name: "Tafsir Ibn Al-Jawzi", author: "Tafsir Ibn Al-Jawzi" },
  { id: 498, slug: "nazam-al-durar-al-biqa-i", lang: "arabic", name: "Nazam Al-Durar Al-Biqa'i", author: "Nazam Al-Durar Al-Biqa'i" },
  { id: 499, slug: "tafsir-ibn-abi-zamanin", lang: "arabic", name: "Tafsir Ibn Abi Zamanin", author: "Tafsir Ibn Abi Zamanin" },
  { id: 500, slug: "tafsir-ibn-al-qayyim", lang: "arabic", name: "Tafsir Ibn Al-Qayyim", author: "Tafsir Ibn Al-Qayyim" },
  { id: 501, slug: "tafsir-al-alusi", lang: "arabic", name: "Tafsir Al-Alusi", author: "Tafsir Al-Alusi" },
  { id: 502, slug: "tafsir-ibn-abi-hatim", lang: "arabic", name: "Tafsir Ibn Abi Hatim", author: "Tafsir Ibn Abi Hatim" },
  { id: 503, slug: "id-tafsir-as-saadi", lang: "indonesian", name: "Tafsir As-Saadi - Indonesian", author: "Tafsir As-Saadi - Indonesian" },
  { id: 504, slug: "al-i-rab-al-muyassar", lang: "arabic", name: "Iraab Al-Muyassar", author: "Iraab Al-Muyassar" },
  { id: 505, slug: "al-dur-al-masun-lil-samin-al-halabi", lang: "arabic", name: "Al Dur Al Masun Lil Samin Al Halabi", author: "Al Dur Al Masun Lil Samin Al Halabi" },
  { id: 506, slug: "i-rab-al-quran-li-al-darwish", lang: "arabic", name: "I'rab Al Quran li Al Darwish", author: "I'rab Al Quran li Al Darwish" },
  { id: 507, slug: "abu-bakr-jabir-al-jazairi", lang: "arabic", name: "Abu Bakr Jabir Al-Jazairi", author: "Abu Bakr Jabir Al-Jazairi" },
  { id: 508, slug: "jamia-al-bayan-aliji", lang: "arabic", name: "Jamia Al-Bayan AlIji", author: "Jamia Al-Bayan AlIji" },
  { id: 509, slug: "al-muharrar-al-wajiz-ibn-atiyyah", lang: "arabic", name: "Al-Muharrar Al-Wajiz Ibn Atiyyah", author: "Al-Muharrar Al-Wajiz Ibn Atiyyah" },
  { id: 511, slug: "al-basit", lang: "arabic", name: "Al-Basit", author: "Al-Basit" },
  { id: 513, slug: "tafsir-al-samarqandi", lang: "arabic", name: "Tafsir Al-Samarqandi", author: "Tafsir Al-Samarqandi" },
  { id: 514, slug: "tafsir-al-nasafi", lang: "arabic", name: "Tafsir Al-Nasafi", author: "Tafsir Al-Nasafi" },
  { id: 515, slug: "alrab-al-quran-li-da-as", lang: "arabic", name: "Alrab Al-Quran li-Da'as", author: "Alrab Al-Quran li-Da'as" },
  { id: 516, slug: "al-lubab-fi-ulum-al-kitab", lang: "arabic", name: "Al Lubab fi Ulum Al Kitab", author: "Al Lubab fi Ulum Al Kitab" },
  { id: 517, slug: "tadabbur-wa-amal", lang: "arabic", name: "Tadabbur wa 'Amal", author: "Tadabbur wa 'Amal" },
  { id: 518, slug: "tafsir-al-baydawi", lang: "arabic", name: "Tafsir Al-Baydawi", author: "Tafsir Al-Baydawi" },
  { id: 519, slug: "al-muyassar-fi-al-gharib", lang: "arabic", name: "Al-Muyassar fi Al-Gharib", author: "Al-Muyassar fi Al-Gharib" },
  { id: 520, slug: "al-jadwal-fi-i-rab-al-quran", lang: "arabic", name: "Al Jadwal fi I'rab Al Quran", author: "Al Jadwal fi I'rab Al Quran" },
  { id: 521, slug: "al-qira-at-al-mawsoo-ah-al-qur-aniyyah", lang: "arabic", name: "Al Qira'at Al Mawsoo'ah Al Qur'aniyyah", author: "Al Qira'at Al Mawsoo'ah Al Qur'aniyyah" },
  { id: 522, slug: "al-nashr-li-ibn-al-jazari", lang: "arabic", name: "Al Nashr li Ibn Al Jazari", author: "Al Nashr li Ibn Al Jazari" },
  { id: 523, slug: "ar-tafsir-al-jalalayn", lang: "arabic", name: "Tafsir Jalalayn", author: "Jalal al-Din al-Mahalli and Jalal al-Din al-Suyuti" },
  { id: 524, slug: "mahasin-al-ta-wil-al-qasimi", lang: "arabic", name: "Mahasin Al-Ta'wil Al-Qasimi", author: "Mahasin Al-Ta'wil Al-Qasimi" },
  { id: 525, slug: "adwa-al-bayan", lang: "arabic", name: "Adwa' Al-Bayan", author: "Adwa' Al-Bayan" },
  { id: 526, slug: "al-bahr-al-muhit", lang: "arabic", name: "Al-Bahr Al-Muhit", author: "Al-Bahr Al-Muhit" },
  { id: 527, slug: "ar-tafsir-al-tha-alibi-527", lang: "arabic", name: "Tafsir Al-Tha'alibi", author: "Tafsir Al-Tha'alibi" },
  { id: 528, slug: "ar-tafsir-al-tha-alibi", lang: "arabic", name: "Tafsir Al-Tha'alibi", author: "Tafsir Al-Tha'alibi" },
  { id: 529, slug: "tafsir-al-sam-ani", lang: "arabic", name: "Tafsir Al-Sam'ani", author: "Tafsir Al-Sam'ani" },
  { id: 533, slug: "pashto-mokhtasar", lang: "pashto", name: "Pashto Mokhtasar", author: "Pashto Mokhtasar" },
  { id: 534, slug: "fulani-mokhtasar", lang: "fulah", name: "Fulani Mokhtasar", author: "Fulani Mokhtasar" },
  { id: 535, slug: "hindi-mokhtasar", lang: "hindi", name: "Hindi Mokhtasar", author: "Hindi Mokhtasar" },
  { id: 536, slug: "kyrgyz-mokhtasar", lang: "kyrgyz", name: "Kyrgyz Mokhtasar", author: "Kyrgyz Mokhtasar" },
  { id: 537, slug: "azeri-mokhtasar", lang: "azeri", name: "Azeri Mokhtasar", author: "Azeri Mokhtasar" },
  { id: 538, slug: "uzbek-mokhtasar", lang: "uzbek", name: "Uzbek Mokhtasar", author: "Uzbek Mokhtasar" },
  { id: 539, slug: "uyghur-mokhtasar", lang: "uighur", name: "Uyghur Mokhtasar", author: "Uyghur Mokhtasar" },
  { id: 540, slug: "telugu-mokhtasar", lang: "telugu", name: "Telugu Mokhtasar", author: "Telugu Mokhtasar" },
  { id: 541, slug: "thai-mokhtasar", lang: "thai", name: "Thai Mokhtasar", author: "Thai Mokhtasar" },
  { id: 542, slug: "kurdish-mokhtasar", lang: "kurdish", name: "Kurdish Mokhtasar", author: "Kurdish Mokhtasar" },
  { id: 543, slug: "serbian-mokhtasar", lang: "serbian", name: "Serbian Mokhtasar", author: "Serbian Mokhtasar" },
  { id: 554, slug: "tamil-mokhtasar", lang: "tamil", name: "Tamil Mokhtasar", author: "Tamil Mokhtasar" },
  { id: 563, slug: "ayah-dependency-graphs", lang: "arabic", name: "Ayah Dependency Graphs", author: "Ayah Dependency Graphs" },
  { id: 573, slug: "tafsir-al-jalalayn", lang: "english", name: "Tafsir Al Jalalayn - English", author: "Tafsir Al Jalalayn - English" },
  { id: 817, slug: "en-tazkirul-quran", lang: "english", name: "Tazkirul Quran(Maulana Wahiduddin Khan)", author: "Maulana Wahid Uddin Khan" },
  { id: 818, slug: "ur-tazkirul-quran", lang: "urdu", name: "Tazkirul Quran(Maulana Wahiduddin Khan)", author: "Maulana Wahid Uddin Khan" },
];

export function findEdition(slug: string): TafsirEdition | undefined {
  return TAFSIR_EDITIONS.find((e) => e.slug === slug);
}

/**
 * The tafsir editions actually surfaced in the reader source picker, grouped
 * by the ULYAH UI locale that should see them first. Each slug was verified to
 * return real per-ayah text (not an empty or graph-only edition). Ordered
 * best-first: the first entry is the default when the panel opens. Indonesian
 * readers also get Tafsir Kemenag RI (equran.id) prepended at runtime in
 * tafsir-source.ts — it is not a spa5k edition so it is not listed here.
 */
export const FEATURED_TAFSIR: Record<string, string[]> = {
  id: ["id-tafsir-as-saadi", "indonesian-mokhtasar"],
  en: ["en-tafisr-ibn-kathir", "en-al-jalalayn", "en-tafsir-al-mukhtasar", "en-tafsir-maarif-ul-quran"],
  ar: ["ar-tafsir-ibn-kathir", "ar-tafsir-muyassar", "ar-tafseer-al-saddi"],
  ru: ["russian-mokhtasar", "ru-tafsir-ibne-kahtir"],
  fr: ["french-mokhtasar"],
  zh: ["chinese-mokhtasar"],
  ja: ["japanese-mokhtasar"],
};
