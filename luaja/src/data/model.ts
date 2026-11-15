/**
 * Model data luaja.com (docs/LUAJA-BLUEPRINT.md). Semua dokumen disimpan sebagai JSON di R2 (lib/store.ts).
 *
 * Kunci:
 *   k/site.json                       pengaturan & konten situs (teks beranda, FAQ, menu, SEO) — dinamis dari admin
 *   k/pricing.json                    harga, promo, masa aktif
 *   k/payment.json                    rekening tujuan (hanya tampil ke member yang punya tagihan)
 *   c/users/<id>.json                 akun;  u/email/<sha256>  penjaga e-mail unik
 *   c/subs/<userId>.json              langganan per member: { de?: until, en?: until, ja?: until }
 *   c/invoices/<id>.json              tagihan; i/inv-open/<urut>~<id> antrean admin; i/inv-user/<uid>/<urut>~<id>
 *   p/proof/<invoiceId>/<file>        bukti bayar & dokumen promo (privat)
 *   c/progress/<uid>/<lessonCode>.json progres pelajaran; c/vocab/<uid>/<lang>.json antrean kosakata (SRS)
 *   c/lessons/<code>.json             pelajaran yang diterbitkan dari admin (menimpa bawaan kode)
 *   c/books/<id>.json                 buku pustaka; b/<id>/<n>.json isi bab; t/<lang>/<hash>.json terjemahan kalimat
 *   c/videos/<id>.json                video + transkrip/kata kunci
 *   c/guides/<slug>.json              artikel panduan
 *   l/audit/<hari>/…                  jejak audit; l/events/<hari>/… kejadian (statistik dihitung dari sini)
 */

/* ── bahasa yang diajarkan ───────────────────────────────────────────────── */

export type Course = 'de' | 'en' | 'ja';
export const COURSES: readonly Course[] = ['de', 'en', 'ja'];

export interface CourseMeta {
  code: Course;
  /** Nama Indonesia dan nama asli. */
  name: string;
  native: string;
  slug: string;
  /** Locale untuk suara peramban. */
  locale: string;
  flag: string;
  /** Jenjang berurutan. */
  levels: { id: string; name: string; sub: string; hours: string }[];
  accent: string;
}

export const COURSE_META: Record<Course, CourseMeta> = {
  de: {
    code: 'de', name: 'Bahasa Jerman', native: 'Deutsch', slug: 'jerman', locale: 'de-DE', flag: 'de', accent: '#d61f26',
    levels: [
      { id: 'a1', name: 'A1', sub: 'Anfänger · Pemula', hours: '80–100 jam' },
      { id: 'a2', name: 'A2', sub: 'Grundlegende Kenntnisse · Dasar', hours: '100–150 jam' },
      { id: 'b1', name: 'B1', sub: 'Fortgeschrittene Sprachverwendung · Menengah', hours: '150–200 jam' },
      { id: 'b2', name: 'B2', sub: 'Selbstständige Sprachverwendung · Menengah-atas', hours: '200–250 jam' },
      { id: 'c1', name: 'C1', sub: 'Fachkundige Sprachkenntnisse · Mahir', hours: '250–300 jam' },
      { id: 'c2', name: 'C2', sub: 'Annähernd muttersprachlich · Nyaris penutur asli', hours: '300+ jam' },
    ],
  },
  en: {
    code: 'en', name: 'Bahasa Inggris', native: 'English', slug: 'inggris', locale: 'en-GB', flag: 'gb', accent: '#1746b8',
    levels: [
      { id: 'beginner', name: '01 Beginner', sub: 'Pengenalan bahasa Inggris dari nol', hours: '60–80 jam' },
      { id: 'elementary', name: '02 Elementary', sub: 'Kosakata dan percakapan sederhana', hours: '80–100 jam' },
      { id: 'pre-intermediate', name: '03 Pre-Intermediate', sub: 'Mulai memahami percakapan dan teks', hours: '100–120 jam' },
      { id: 'intermediate', name: '04 Intermediate', sub: 'Komunikasi sehari-hari lebih lancar', hours: '120–150 jam' },
      { id: 'upper-intermediate', name: '05 Upper-Intermediate', sub: 'Komunikasi kompleks dan profesional', hours: '150–200 jam' },
      { id: 'advanced', name: '06 Advanced', sub: 'Bahasa Inggris tingkat lanjut', hours: '200–250 jam' },
      { id: 'proficiency', name: '07 Proficiency', sub: 'Penguasaan bahasa tingkat sangat tinggi', hours: '250+ jam' },
    ],
  },
  ja: {
    code: 'ja', name: 'Bahasa Jepang', native: '日本語', slug: 'jepang', locale: 'ja-JP', flag: 'jp', accent: '#bc002d',
    levels: [
      { id: 'n5', name: 'N5', sub: 'Dasar · hiragana, katakana, 100 kanji', hours: '150–200 jam' },
      { id: 'n4', name: 'N4', sub: 'Percakapan sehari-hari · 300 kanji', hours: '200–300 jam' },
      { id: 'n3', name: 'N3', sub: 'Menengah · 650 kanji', hours: '300–450 jam' },
      { id: 'n2', name: 'N2', sub: 'Menengah-atas · 1.000 kanji', hours: '450–600 jam' },
      { id: 'n1', name: 'N1', sub: 'Mahir · 2.000 kanji', hours: '600+ jam' },
    ],
  },
};

export const courseBySlug = (slug: string): CourseMeta | undefined => COURSES.map((c) => COURSE_META[c]).find((m) => m.slug === slug);

/* ── harga & promo ───────────────────────────────────────────────────────── */

export type Tier = 'umum' | 'pelajar' | 'juara';

export interface Pricing {
  /** Harga per tahun, Rupiah. */
  tiers: Record<Tier, { one: number; three: number; label: string; note: string; requires: string | null; enabled: boolean }>;
  /** Masa aktif langganan, hari. */
  days: number;
  updatedAt: number;
}

export const DEFAULT_PRICING: Pricing = {
  tiers: {
    umum: { one: 500_000, three: 1_300_000, label: 'Umum', note: 'Untuk semua orang.', requires: null, enabled: true },
    pelajar: { one: 350_000, three: 1_000_000, label: 'Promo pelajar', note: 'Pelajar sampai kelas 12 / 3 SMK sederajat, dengan surat keterangan pelajar terbaru.', requires: 'Surat keterangan pelajar terbaru (foto/PDF)', enabled: true },
    juara: { one: 200_000, three: 500_000, label: 'Promo juara kelas', note: 'Juara 1, 2 atau 3 di kelas, dengan bukti juara kelas tahun berjalan saat mendaftar.', requires: 'Bukti juara kelas tahun ini (rapor/piagam, foto/PDF)', enabled: true },
  },
  days: 365,
  updatedAt: 0,
};

/** Harga paket: 1 bahasa = harga satuan; 3 bahasa = harga paket; 2 bahasa = 2 × satuan (turunan, bisa diubah admin). */
export function priceFor(p: Pricing, tier: Tier, courses: Course[]): number {
  const t = p.tiers[tier];
  const n = new Set(courses).size;
  if (n >= 3) return t.three;
  return t.one * n;
}

/* ── rekening ────────────────────────────────────────────────────────────── */

export interface Payment {
  bank: string;
  account: string;
  holder: string;
  note: string;
  whatsapp: string;
}

/** Pemilik, 14 Nov 2026: rekening SeaBank a.n. Yusron Efendi. Hanya ditampilkan kepada member yang sudah masuk dan punya tagihan. */
export const DEFAULT_PAYMENT: Payment = {
  bank: 'SeaBank',
  account: '901592737762',
  holder: 'Yusron Efendi',
  note: 'Transfer tepat sesuai nominal tagihan, lalu unggah bukti transfer di portal.',
  whatsapp: '',
};

/* ── akun & langganan ────────────────────────────────────────────────────── */

export type Role = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  pass: string;
  /** Versi sesi: naik = keluar dari semua perangkat. */
  sv: number;
  createdAt: number;
  lastLoginAt?: number;
  suspended?: boolean;
  /** Bahasa antarmuka pilihan. */
  ui?: 'id' | 'en';
}

/** Masa aktif per bahasa (ms epoch). Akses = sekarang < until. */
export type Subs = Partial<Record<Course, { until: number; tier: Tier; invoiceId: string }>>;

/* ── tagihan ─────────────────────────────────────────────────────────────── */

export type InvoiceStatus = 'unpaid' | 'review' | 'approved' | 'rejected' | 'cancelled';

export interface ProofFile {
  key: string;
  name: string;
  type: string;
  size: number;
  /** 'payment' bukti transfer · 'promo' surat pelajar / bukti juara */
  kind: 'payment' | 'promo';
  at: number;
}

export interface Invoice {
  id: string;
  /** Nomor tagihan yang dibaca manusia: LJ-2026-000123 */
  number: string;
  userId: string;
  courses: Course[];
  tier: Tier;
  amount: number;
  status: InvoiceStatus;
  createdAt: number;
  /** Diisi saat bukti diunggah. */
  submittedAt?: number;
  decidedAt?: number;
  decidedBy?: string;
  reason?: string;
  files: ProofFile[];
  /** Tanggal mulai & akhir langganan setelah disetujui. */
  activeFrom?: number;
  activeUntil?: number;
  /** Catatan member saat mengunggah. */
  note?: string;
}

/* ── konten situs (dinamis dari admin) ───────────────────────────────────── */

export interface Faq {
  q: string;
  a: string;
}

export interface SiteContent {
  name: string;
  tagline: string;
  slogan: string;
  description: string;
  hero: { kicker: string; title: string; em: string; lead: string; cta: string; cta2: string };
  /** Kalimat sapaan yang berganti di hero: [bahasa, teks, terjemahan] */
  greetings: { lang: Course; text: string; id: string }[];
  why: { title: string; items: { icon: string; title: string; text: string }[] };
  steps: { title: string; items: { n: string; title: string; text: string }[] };
  faq: Faq[];
  contact: { email: string; whatsapp: string; address: string };
  social: { youtube?: string; instagram?: string; tiktok?: string; facebook?: string };
  /** Teks halaman wajib dalam Markdown. */
  pages: Record<string, { title: string; body: string; updated: string }>;
  adsEnabled: boolean;
  updatedAt: number;
}

export const DEFAULT_SITE: SiteContent = {
  name: 'LUAJA',
  tagline: 'Learning Universal for Achievement, Journey & Advancement',
  slogan: 'Learn Without Limits.',
  description:
    'LUAJA adalah kursus online bahasa Jerman, Inggris dan Jepang untuk penutur Indonesia: pelajaran interaktif berurutan dari nol sampai mahir dengan audio penutur asli, serta bank latihan soal format Goethe, TOEFL, IELTS dan JLPT lengkap dengan kunci, pembahasan dan prediksi nilai.',
  hero: {
    kicker: 'Jerman · Inggris · Jepang · TOEFL · IELTS',
    title: 'Belajar bahasa tanpa batas,',
    em: 'satu langkah yang runtut setiap hari.',
    lead: 'Pelajaran interaktif A1–C2, Beginner–Proficiency dan N5–N1 dengan penjelasan Indonesia dan audio penutur asli — dilengkapi bank latihan soal format ujian resmi, kunci jawaban, pembahasan dan prediksi nilai.',
    cta: 'Ikuti pelajaran gratis',
    cta2: 'Lihat harga & promo',
  },
  greetings: [
    { lang: 'de', text: 'Hallo! Schön, dich kennenzulernen.', id: 'Halo! Senang berkenalan denganmu.' },
    { lang: 'en', text: 'Hello! Nice to meet you.', id: 'Halo! Senang bertemu denganmu.' },
    { lang: 'ja', text: 'こんにちは！はじめまして。', id: 'Halo! Senang berkenalan.' },
  ],
  why: {
    title: 'Mengapa LUAJA berbeda',
    items: [
      { icon: 'tangga', title: 'Satu jalur yang runtut', text: 'Jenjang → modul → pelajaran → langkah. Pelajaran berikutnya terbuka setelah kuis ≥ 80 %, sehingga fondasi selalu kokoh.' },
      { icon: 'suara', title: 'Audio penutur asli di setiap baris', text: 'Setiap dialog, kosakata dan buku dibacakan dengan suara berlogat Jerman, Inggris atau Jepang; dapat diperlambat hingga 0,8×.' },
      { icon: 'buku', title: 'Bank latihan soal format ujian', text: 'Ratusan soal mengikuti format Goethe-Zertifikat, Cambridge, TOEFL ITP, IELTS dan JLPT — disusun per jenjang, dari simulasi hingga seri penguatan.' },
      { icon: 'ujian', title: 'Kunci dibuka setelah selesai', text: 'Kunci jawaban dan pembahasan berbahasa Indonesia terbuka setelah seluruh soal dikumpulkan — melatih kejujuran dan ketelitian seperti ujian sungguhan.' },
      { icon: 'kartu', title: 'Prediksi nilai & laporan', text: 'Setiap hasil dikonversi ke skala ujian sebenarnya — Goethe 0–100, TOEFL ITP 310–677, IELTS band, JLPT — dan laporannya dapat diunduh.' },
      { icon: 'ujian', title: 'Persiapan TOEFL & IELTS termasuk', text: 'Paket Bahasa Inggris mencakup persiapan TOEFL dan IELTS: strategi per bagian, latihan berjangka waktu dan simulasi.' },
    ],
  },
  steps: {
    title: 'Cara mulai',
    items: [
      { n: '1', title: 'Ikuti pelajaran gratis', text: 'Pelajaran pertama setiap jenjang terbuka untuk semua, tanpa registrasi.' },
      { n: '2', title: 'Pilih bahasa & paket', text: 'Satu bahasa atau tiga bahasa sekaligus; pelajar dan juara kelas memperoleh harga khusus.' },
      { n: '3', title: 'Transfer & konfirmasi', text: 'Transfer ke rekening resmi yang tertera di portal, unggah bukti pembayaran, dan akses terbuka satu tahun penuh setelah terverifikasi.' },
    ],
  },
  faq: [
    { q: 'Apakah sesuai untuk pemula yang benar-benar dari nol?', a: 'Ya. Jenjang pertama setiap bahasa (A1, Beginner, N5) dimulai dari alfabet, bunyi dan sapaan, dengan penjelasan berbahasa Indonesia pada setiap langkah.' },
    { q: 'Apa yang termasuk dalam satu paket bahasa?', a: 'Seluruh jenjang bahasa tersebut (misalnya A1 sampai C2), seluruh paket latihan soal, kosakata, latihan dan kuis, selama satu tahun. Paket Bahasa Inggris juga mencakup persiapan TOEFL dan IELTS.' },
    { q: 'Bagaimana cara membayar?', a: 'Setelah memilih paket di portal, rekening resmi LUAJA ditampilkan beserta nominal tagihan. Transfer sesuai nominal, unggah bukti pembayaran, dan tim kami memverifikasinya — akses terbuka segera setelah terverifikasi.' },
    { q: 'Bagaimana memperoleh harga pelajar atau juara kelas?', a: 'Pilih kategori yang sesuai saat memesan, lalu unggah surat keterangan pelajar terbaru atau bukti juara kelas tahun berjalan bersama bukti pembayaran. Harga khusus berlaku satu tahun; perpanjangan memerlukan dokumen terbaru.' },
    { q: 'Bagaimana latihan soal dinilai?', a: 'Jawab seluruh soal dalam satu paket, lalu kumpulkan. Sistem menampilkan nilai, kunci jawaban, pembahasan berbahasa Indonesia dan prediksi nilai pada skala ujian sebenarnya. Laporan latihan dapat diunduh dan, bagi member, tersimpan di portal.' },
    { q: 'Apakah tersedia aplikasi ponsel?', a: 'LUAJA dapat dipasang sebagai aplikasi dari peramban ponsel (ketuk „Pasang aplikasi“). Pelajaran dan kosakata yang pernah dibuka tetap dapat dibaca saat koneksi terbatas.' },
  ],
  contact: { email: 'halo@luaja.com', whatsapp: '', address: 'Indonesia' },
  social: {},
  pages: {},
  adsEnabled: true,
  updatedAt: 0,
};
