import { fillLabels } from "./fill-labels";
import { TENANT } from "./tenant";
// Grouped navigation structure — the single source of truth for the header
// dropdowns AND the footer columns, so the two can never drift apart again
// (the old flat 13-link nav plus an differently-organised footer was exactly
// the inconsistency the owner flagged). Self-contained labels, same pattern
// as mushaf-labels.ts: EN is the fallback for locales not listed.

export interface NavItem {
  label: string;
  /** Path WITHOUT the locale prefix, e.g. "/quran/mushaf". */
  path: string;
}
export interface NavGroup {
  key: string;
  label: string;
  icon: string;
  items: NavItem[];
}
export interface NavLabels {
  home: string;
  groups: NavGroup[];
  /** Direct (ungrouped) links shown after the groups. */
  direct: NavItem[];
}

const EN: NavLabels = {
  home: "Home",
  groups: [
    {
      key: "quran",
      label: "Al-Qur'an",
      icon: "📖",
      items: [
        { label: "Read the Qur'an", path: "/quran" },
        { label: "Mushaf Utsmani", path: "/quran/mushaf" },
        { label: "Qur'an Radio", path: "/radio" },
        { label: "Nasakh & Mansukh", path: "/nasakh" },
      ],
    },
    {
      key: "kajian",
      label: "Hadits & Kitab",
      icon: "📚",
      items: [
        { label: "Hadith Collections", path: "/hadits" },
        { label: "Sanad Tree", path: "/sanad" },
        { label: "Kitab Library", path: "/kitab" },
        { label: "Kitab Pesantren", path: "/kitab-pesantren" },
      ],
    },
    {
      key: "kisah",
      label: "Stories & Audio",
      icon: "🎧",
      items: [
        { label: "Al-Qur'an Kids", path: "/kids" },
        { label: "Islamic Stories", path: "/kisah" },
        { label: "Kids' Animated Films", path: "/anak" },
        { label: "Audiobook", path: "/audiobook" },
        { label: "Daily Content", path: "/harian" },
      ],
    },
    {
      key: "ibadah",
      label: "Worship & Tools",
      icon: "🕌",
      items: [
        { label: "Hajj & Umrah", path: "/haji-umroh" },
        { label: "Daily Practices", path: "/amalan" },
        { label: "Prayer Times", path: "/jadwal-sholat" },
        { label: "Ramadan Imsakiyah", path: "/imsakiyah" },
        { label: "Qibla Direction", path: "/kiblat" },
        { label: "Hijri Calendar", path: "/kalender-hijriyah" },
        { label: "Zakat Calculator", path: "/zakat" },
        { label: "Inheritance (Faraid)", path: "/waris" },
      ],
    },
  ],
  direct: [
    { label: "🔴 Live", path: "/live" },
    { label: "About", path: "/tentang" },
  ],
};

const ID: NavLabels = {
  home: "Beranda",
  groups: [
    {
      key: "quran",
      label: "Al-Qur'an",
      icon: "📖",
      items: [
        { label: "Baca Al-Qur'an", path: "/quran" },
        { label: "Mushaf Utsmani", path: "/quran/mushaf" },
        { label: "Radio Qur'an", path: "/radio" },
        { label: "Nasakh & Mansukh", path: "/nasakh" },
      ],
    },
    {
      key: "kajian",
      label: "Hadits & Kitab",
      icon: "📚",
      items: [
        { label: "Koleksi Hadits", path: "/hadits" },
        { label: "Pohon Sanad", path: "/sanad" },
        { label: "Perpustakaan Kitab", path: "/kitab" },
        { label: "Kitab Pesantren", path: "/kitab-pesantren" },
      ],
    },
    {
      key: "kisah",
      label: "Kisah & Audio",
      icon: "🎧",
      items: [
        { label: "Al-Qur'an Kids", path: "/kids" },
        { label: "Kisah Islami", path: "/kisah" },
        { label: "Film Animasi Anak", path: "/anak" },
        { label: "Audiobook", path: "/audiobook" },
        { label: "Konten Harian", path: "/harian" },
      ],
    },
    {
      key: "ibadah",
      label: "Ibadah & Alat",
      icon: "🕌",
      items: [
        { label: "Haji & Umroh", path: "/haji-umroh" },
        { label: "Amalan Harian", path: "/amalan" },
        { label: "Jadwal Sholat", path: "/jadwal-sholat" },
        { label: "Imsakiyah Ramadhan", path: "/imsakiyah" },
        { label: "Arah Kiblat", path: "/kiblat" },
        { label: "Kalender Hijriyah", path: "/kalender-hijriyah" },
        { label: "Kalkulator Zakat", path: "/zakat" },
        { label: "Waris (Faraid)", path: "/waris" },
      ],
    },
  ],
  direct: [
    { label: "🔴 Live", path: "/live" },
    { label: "Tentang", path: "/tentang" },
  ],
};

const AR: NavLabels = {
  home: "الرئيسية",
  groups: [
    {
      key: "quran",
      label: "القرآن الكريم",
      icon: "📖",
      items: [
        { label: "قراءة القرآن", path: "/quran" },
        { label: "المصحف العثماني", path: "/quran/mushaf" },
        { label: "إذاعة القرآن", path: "/radio" },
        { label: "الناسخ والمنسوخ", path: "/nasakh" },
      ],
    },
    {
      key: "kajian",
      label: "الحديث والكتب",
      icon: "📚",
      items: [
        { label: "كتب الحديث", path: "/hadits" },
        { label: "شجرة السند", path: "/sanad" },
        { label: "مكتبة الكتب", path: "/kitab" },
        { label: "كتب المعاهد", path: "/kitab-pesantren" },
      ],
    },
    {
      key: "kisah",
      label: "القصص والصوتيات",
      icon: "🎧",
      items: [
        { label: "أطفال القرآن", path: "/kids" },
        { label: "قصص إسلامية", path: "/kisah" },
        { label: "أفلام الأطفال المتحركة", path: "/anak" },
        { label: "كتاب صوتي", path: "/audiobook" },
        { label: "المحتوى اليومي", path: "/harian" },
      ],
    },
    {
      key: "ibadah",
      label: "العبادة والأدوات",
      icon: "🕌",
      items: [
        { label: "الحج والعمرة", path: "/haji-umroh" },
        { label: "الأذكار اليومية", path: "/amalan" },
        { label: "مواقيت الصلاة", path: "/jadwal-sholat" },
        { label: "إمساكية رمضان", path: "/imsakiyah" },
        { label: "اتجاه القبلة", path: "/kiblat" },
        { label: "التقويم الهجري", path: "/kalender-hijriyah" },
        { label: "حاسبة الزكاة", path: "/zakat" },
        { label: "المواريث (الفرائض)", path: "/waris" },
      ],
    },
  ],
  direct: [
    { label: "🔴 مباشر", path: "/live" },
    { label: "من نحن", path: "/tentang" },
  ],
};

// tilawa.de ships German-first; the nav must be fully German, never the EN
// fallback that leaked into the header (owner: "semua inkonsisten").
const DE: NavLabels = {
  home: "Startseite",
  groups: [
    {
      key: "quran",
      label: "Der Koran",
      icon: "📖",
      items: [
        { label: "Koran lesen", path: "/quran" },
        { label: "Uthmani-Mushaf", path: "/quran/mushaf" },
        { label: "Koran-Radio", path: "/radio" },
        { label: "Nāsikh & Mansūkh", path: "/nasakh" },
      ],
    },
    {
      key: "kajian",
      label: "Hadith & Kitāb",
      icon: "📚",
      items: [
        { label: "Hadith-Sammlungen", path: "/hadits" },
        { label: "Sanad-Baum", path: "/sanad" },
        { label: "Kitāb-Bibliothek", path: "/kitab" },
        { label: "Pesantren-Kitāb", path: "/kitab-pesantren" },
      ],
    },
    {
      key: "kisah",
      label: "Geschichten & Audio",
      icon: "🎧",
      items: [
        { label: "Al-Qur'an Kids", path: "/kids" },
        { label: "Islamische Geschichten", path: "/kisah" },
        { label: "Zeichentrickfilme für Kinder", path: "/anak" },
        { label: "Hörbuch", path: "/audiobook" },
        { label: "Täglicher Inhalt", path: "/harian" },
      ],
    },
    {
      key: "ibadah",
      label: "Gottesdienst & Werkzeuge",
      icon: "🕌",
      items: [
        { label: "Hadsch & Umrah", path: "/haji-umroh" },
        { label: "Tägliche Andachten", path: "/amalan" },
        { label: "Gebetszeiten", path: "/jadwal-sholat" },
        { label: "Ramadan-Imsākīya", path: "/imsakiyah" },
        { label: "Qibla-Richtung", path: "/kiblat" },
        { label: "Hidschri-Kalender", path: "/kalender-hijriyah" },
        { label: "Zakāt-Rechner", path: "/zakat" },
        { label: "Erbrecht (Farāʾid)", path: "/waris" },
      ],
    },
  ],
  direct: [
    { label: "🔴 Live", path: "/live" },
    { label: "Über uns", path: "/tentang" },
  ],
};

// 1fr.fr ships French-first — same requirement, no EN fallback in the nav.
const FR: NavLabels = {
  home: "Accueil",
  groups: [
    {
      key: "quran",
      label: "Le Coran",
      icon: "📖",
      items: [
        { label: "Lire le Coran", path: "/quran" },
        { label: "Mushaf Uthmani", path: "/quran/mushaf" },
        { label: "Radio Coran", path: "/radio" },
        { label: "Nâsikh & Mansûkh", path: "/nasakh" },
      ],
    },
    {
      key: "kajian",
      label: "Hadith & Kitâb",
      icon: "📚",
      items: [
        { label: "Recueils de hadiths", path: "/hadits" },
        { label: "Arbre du Sanad", path: "/sanad" },
        { label: "Bibliothèque de Kitâb", path: "/kitab" },
        { label: "Kitâb Pesantren", path: "/kitab-pesantren" },
      ],
    },
    {
      key: "kisah",
      label: "Récits & Audio",
      icon: "🎧",
      items: [
        { label: "Al-Qur'an Kids", path: "/kids" },
        { label: "Récits islamiques", path: "/kisah" },
        { label: "Dessins animés pour enfants", path: "/anak" },
        { label: "Livre audio", path: "/audiobook" },
        { label: "Contenu quotidien", path: "/harian" },
      ],
    },
    {
      key: "ibadah",
      label: "Adoration & Outils",
      icon: "🕌",
      items: [
        { label: "Hajj & Omra", path: "/haji-umroh" },
        { label: "Pratiques quotidiennes", path: "/amalan" },
        { label: "Heures de prière", path: "/jadwal-sholat" },
        { label: "Imsakiya du Ramadan", path: "/imsakiyah" },
        { label: "Direction de la Qibla", path: "/kiblat" },
        { label: "Calendrier hégirien", path: "/kalender-hijriyah" },
        { label: "Calculateur de Zakât", path: "/zakat" },
        { label: "Héritage (Farâ'id)", path: "/waris" },
      ],
    },
  ],
  direct: [
    { label: "🔴 En direct", path: "/live" },
    { label: "À propos", path: "/tentang" },
  ],
};

// dawa.es ships Spanish-first — same requirement, no EN fallback in the nav.
const ES: NavLabels = {
  home: "Inicio",
  groups: [
    {
      key: "quran",
      label: "El Corán",
      icon: "📖",
      items: [
        { label: "Leer el Corán", path: "/quran" },
        { label: "Mushaf Uzmani", path: "/quran/mushaf" },
        { label: "Radio del Corán", path: "/radio" },
        { label: "Násij y Mansuj", path: "/nasakh" },
      ],
    },
    {
      key: "kajian",
      label: "Hadices y Libros",
      icon: "📚",
      items: [
        { label: "Colecciones de hadices", path: "/hadits" },
        { label: "Árbol del Sanad", path: "/sanad" },
        { label: "Biblioteca de libros", path: "/kitab" },
        { label: "Libros de madrasa", path: "/kitab-pesantren" },
      ],
    },
    {
      key: "kisah",
      label: "Relatos y Audio",
      icon: "🎧",
      items: [
        { label: "Al-Qur'an Kids", path: "/kids" },
        { label: "Relatos islámicos", path: "/kisah" },
        { label: "Dibujos animados para niños", path: "/anak" },
        { label: "Audiolibro", path: "/audiobook" },
        { label: "Contenido diario", path: "/harian" },
      ],
    },
    {
      key: "ibadah",
      label: "Adoración y Herramientas",
      icon: "🕌",
      items: [
        { label: "Hach y Umra", path: "/haji-umroh" },
        { label: "Prácticas diarias", path: "/amalan" },
        { label: "Horarios de oración", path: "/jadwal-sholat" },
        { label: "Imsakiya de Ramadán", path: "/imsakiyah" },
        { label: "Dirección de la Alquibla", path: "/kiblat" },
        { label: "Calendario hegiriano", path: "/kalender-hijriyah" },
        { label: "Calculadora de Zakat", path: "/zakat" },
        { label: "Herencia (Faráid)", path: "/waris" },
      ],
    },
  ],
  direct: [
    { label: "🔴 En directo", path: "/live" },
    { label: "Quiénes somos", path: "/tentang" },
  ],
};

const MAP: Record<string, NavLabels> = { en: EN, id: ID, ar: AR, de: DE, fr: FR, es: ES };

/** Apply the admin portal's per-tenant show/hide + rename overrides to a nav
 * tree: drop hidden items (and any group left empty), and swap in custom
 * labels. Passing an empty config is a no-op, so ulyah is unaffected. */
export function applyPageOverrides(
  nav: NavLabels,
  hidden: Set<string>,
  labels: Map<string, string>
): NavLabels {
  if (hidden.size === 0 && labels.size === 0) return nav;
  const keep = (path: string) => !hidden.has(path);
  const relabel = (it: NavItem): NavItem => (labels.has(it.path) ? { ...it, label: labels.get(it.path)! } : it);
  return {
    ...nav,
    groups: nav.groups
      .map((g) => ({ ...g, items: g.items.filter((it) => keep(it.path)).map(relabel) }))
      .filter((g) => g.items.length > 0),
    direct: nav.direct.filter((it) => keep(it.path)).map(relabel),
  };
}

export function navLabels(locale: string): NavLabels {
  const base = MAP[locale] ?? fillLabels(locale, EN);
  if (!TENANT.features.forSale && !TENANT.features.donationForward) return base;
  // 1fr.fr: donation is promoted into the top-level nav ("terang-terangan")
  // and the acquisition page is openly linked. Labels per language.
  const donate =
    locale === "fr" ? "🤲 Faire un don" : locale === "de" ? "🤲 Spenden" : locale === "es" ? "🤲 Donar" : locale === "id" ? "🤲 Donasi" : locale === "ar" ? "🤲 تبرَّع" : "🤲 Donate";
  const acq =
    locale === "fr" ? "💎 Acquisition" : locale === "de" ? "💎 Übernahme" : locale === "es" ? "💎 Adquisición" : locale === "ar" ? "💎 استحواذ" : "💎 Acquisition";
  return {
    ...base,
    direct: [
      ...base.direct,
      ...(TENANT.features.donationForward ? [{ label: donate, path: "/donasi" }] : []),
      ...(TENANT.features.forSale ? [{ label: acq, path: "/acquisition" }] : []),
    ],
  };
}
