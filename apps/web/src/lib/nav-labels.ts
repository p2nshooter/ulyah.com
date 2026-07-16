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
    { label: "Apps", path: "/widget" },
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
    { label: "Aplikasi", path: "/widget" },
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
    { label: "التطبيقات", path: "/widget" },
    { label: "من نحن", path: "/tentang" },
  ],
};

const MAP: Record<string, NavLabels> = { en: EN, id: ID, ar: AR };

export function navLabels(locale: string): NavLabels {
  return MAP[locale] ?? EN;
}
