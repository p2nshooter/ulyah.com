// Straggler UI strings that were hardcoded in Indonesian inside a handful of
// secondary pages/components (kitab-pesantren, nasakh, anak, widget, hajj,
// crypto-donation, reader status). The main chrome lives in the type-enforced
// dictionaries; these are the leftovers the owner flagged ("termasuk yg di
// hardcore"). Kept as a lightweight, per-string table so a language can be
// completed and switched on ONE AT A TIME: `t()` returns the requested
// locale, else English, else Indonesian — so a not-yet-translated (still
// struck-through) language never shows a broken blank, and an ENABLED language
// only goes live once its column here is filled in.
//
// To open a new language later: add its code to each entry below (and to
// READY_LOCALES in @ulyah/shared/i18n), then verify the whole site in it.
type Strings = Record<string, string> & { en: string; id: string };

const T: Record<string, Strings> = {
  // kitab-pesantren
  kitabHeroDesc: {
    id: "Kitab klasik pesantren tersusun rapi per bidang: fiqih, akidah, akhlak, nahwu-shorof. Lengkap dengan nama pengarang, bab per bab, teks Arab, terjemah, dan penjelasan.",
    en: "Classic pesantren books, neatly arranged by field: fiqh, creed, character, and Arabic grammar — each with its author, chapter by chapter, the Arabic text, a translation, and an explanation.",
  },
  kitabLoadError: {
    id: "Gagal memuat koleksi — silakan muat ulang halaman ini.",
    en: "Could not load the collection — please reload this page.",
  },
  kitabFootnote: {
    id: "Teks dikutip dari matan kitab klasik. Terjemah & penjelasan disusun ringkas untuk memudahkan santri dan pembaca umum.",
    en: "Text is quoted from the classical works. Translations and explanations are kept concise to help students and general readers alike.",
  },
  // nasakh
  nasakhHeroDesc: {
    id: "Kumpulan kasus nasakh (penghapus) dan mansukh (dihapus) dalam Al-Qur'an, tersusun rapi: ayat yang dinasakh, ayat penggantinya, jenis naskh, penjelasan, dan sumber. Bisa didengarkan.",
    en: "A collected study of abrogating (nasikh) and abrogated (mansukh) cases in the Qur'an, neatly laid out: the abrogated verse, its replacement, the type, an explanation, and the source. Listenable.",
  },
  nasakhIntro: {
    id: "Ilmu ayat penghapus (nasikh) dan yang dihapus (mansukh) — tersusun rapi: yang dinasakh, penggantinya, jenisnya, penjelasan & sumber. Bisa didengarkan.",
    en: "The science of abrogating (nasikh) and abrogated (mansukh) verses — neatly laid out: what was abrogated, its replacement, the type, an explanation and the source. Listenable.",
  },
  // anak (kids)
  anakHeroDesc: {
    id: "Film animasi pendek dengan karakter bergerak dan narasi suara — setiap kisah mengajarkan satu akhlak dari Al-Qur'an dan Sunnah. Langsung tonton, tanpa unduh.",
    en: "Short animated films with moving characters and voice narration — each story teaches one virtue from the Qur'an and Sunnah. Watch straight away, no download.",
  },
  anakIntro: {
    id: "Film animasi pendek untuk anak: karakter bergerak, dibacakan dengan suara, mengajarkan akhlak Islami — langsung tonton tanpa unduh.",
    en: "Short animated films for children: moving characters, read aloud, teaching Islamic character — watch straight away, no download.",
  },
  // widget hub
  widgetMushaf: {
    id: "Mushaf yang bisa dibalik halamannya seperti buku asli, langsung di browser.",
    en: "A mushaf whose pages turn like a real book, right in your browser.",
  },
  widgetPrayer: {
    id: "Jadwal sholat sesuai lokasi Anda, plus Radio Qori Dunia yang selalu hidup.",
    en: "Prayer times for your location, plus the always-on World Reciters Radio.",
  },
  widgetKids: {
    id: "Kisah pendek berurutan untuk anak, aman ditonton, tanpa gambar yang dilarang.",
    en: "Short story episodes for children, safe to watch, with no forbidden imagery.",
  },
  widgetStandalone: {
    id: "Setiap widget bisa dipasang mandiri ke layar utama HP Anda — seperti aplikasi sendiri, terpisah dari yang lain.",
    en: "Each widget can be installed on its own to your phone's home screen — like its own separate app.",
  },
  // reader status
  readerReading: {
    id: "Sedang membacakan… halaman & bab berpindah otomatis sampai dihentikan.",
    en: "Reading aloud… pages and chapters advance automatically until you stop it.",
  },
  // hajj / umrah hub
  hajjEmpty: {
    id: "Belum ada paket yang tersedia saat ini.",
    en: "No packages are available at the moment.",
  },
  hajjSpaceTitle: {
    id: "Ruang terhormat untuk mitra travel Haji & Umroh",
    en: "An honoured space for Hajj & Umrah travel partners",
  },
  hajjSpaceBody: {
    id: "Tampilkan layanan Haji & Umroh Anda di halaman ini kepada pengunjung yang nyata dan bersungguh-sungguh. Sewa dengan ringan hati — hanya $1 per hari. Sebuah kehormatan bagi kami untuk menyambut Anda.",
    en: "Show your Hajj & Umrah services on this page to real, sincere visitors. Rent it with an easy heart — just $1 per day. It would be an honour for us to welcome you.",
  },
  hajjRent: {
    id: "Sewa halaman ini — salam@ulyah.com",
    en: "Rent this page — salam@ulyah.com",
  },
  // crypto donation
  cryptoThanks: {
    id: "Selesaikan transfer, lalu simpan bukti transfer Anda. Semoga Allah membalas kebaikan Anda dengan berlipat ganda.",
    en: "Complete the transfer, then keep your proof of transfer. May Allah reward your kindness many times over.",
  },
};

/** Localized straggler string with graceful fallback: requested locale → English → Indonesian. */
export function t(key: keyof typeof T, locale: string): string {
  const e = T[key];
  if (!e) return "";
  return e[locale] ?? e.en ?? e.id;
}
