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

import type { Lang, Tri } from '../lib/i18n.ts';

/* ── bahasa yang diajarkan ───────────────────────────────────────────────── */

export type Course = 'de' | 'en' | 'ja';
export const COURSES: readonly Course[] = ['de', 'en', 'ja'];

export interface CourseMeta {
  code: Course;
  /** Nama Indonesia (bawaan), nama dalam tiga bahasa antarmuka, dan nama asli. */
  name: string;
  names: Tri;
  native: string;
  slug: string;
  /** Locale untuk suara peramban. */
  locale: string;
  flag: string;
  /** Jenjang berurutan. */
  levels: { id: string; name: string; sub: Tri; hours: Tri }[];
  accent: string;
}

export const COURSE_META: Record<Course, CourseMeta> = {
  de: {
    code: 'de', name: 'Bahasa Jerman', names: { id: 'Bahasa Jerman', en: 'German', ja: 'ドイツ語' }, native: 'Deutsch', slug: 'jerman', locale: 'de-DE', flag: 'de', accent: '#d61f26',
    levels: [
      { id: 'a1', name: 'A1', sub: { id: 'Anfänger · Pemula', en: 'Anfänger · Beginner', ja: 'Anfänger · 入門' }, hours: { id: '80–100 jam', en: '80–100 hours', ja: '80〜100時間' } },
      { id: 'a2', name: 'A2', sub: { id: 'Grundlegende Kenntnisse · Dasar', en: 'Grundlegende Kenntnisse · Elementary', ja: 'Grundlegende Kenntnisse · 基礎' }, hours: { id: '100–150 jam', en: '100–150 hours', ja: '100〜150時間' } },
      { id: 'b1', name: 'B1', sub: { id: 'Fortgeschrittene Sprachverwendung · Menengah', en: 'Fortgeschrittene Sprachverwendung · Intermediate', ja: 'Fortgeschrittene Sprachverwendung · 中級' }, hours: { id: '150–200 jam', en: '150–200 hours', ja: '150〜200時間' } },
      { id: 'b2', name: 'B2', sub: { id: 'Selbstständige Sprachverwendung · Menengah-atas', en: 'Selbstständige Sprachverwendung · Upper-intermediate', ja: 'Selbstständige Sprachverwendung · 中上級' }, hours: { id: '200–250 jam', en: '200–250 hours', ja: '200〜250時間' } },
      { id: 'c1', name: 'C1', sub: { id: 'Fachkundige Sprachkenntnisse · Mahir', en: 'Fachkundige Sprachkenntnisse · Advanced', ja: 'Fachkundige Sprachkenntnisse · 上級' }, hours: { id: '250–300 jam', en: '250–300 hours', ja: '250〜300時間' } },
      { id: 'c2', name: 'C2', sub: { id: 'Annähernd muttersprachlich · Nyaris penutur asli', en: 'Annähernd muttersprachlich · Near-native', ja: 'Annähernd muttersprachlich · ネイティブに近い' }, hours: { id: '300+ jam', en: '300+ hours', ja: '300時間以上' } },
    ],
  },
  en: {
    code: 'en', name: 'Bahasa Inggris', names: { id: 'Bahasa Inggris', en: 'English', ja: '英語' }, native: 'English', slug: 'inggris', locale: 'en-GB', flag: 'gb', accent: '#1746b8',
    levels: [
      { id: 'beginner', name: '01 Beginner', sub: { id: 'Pengenalan bahasa Inggris dari nol', en: 'English from zero', ja: 'ゼロから始める英語' }, hours: { id: '60–80 jam', en: '60–80 hours', ja: '60〜80時間' } },
      { id: 'elementary', name: '02 Elementary', sub: { id: 'Kosakata dan percakapan sederhana', en: 'Basic vocabulary and simple conversation', ja: '基本語彙と簡単な会話' }, hours: { id: '80–100 jam', en: '80–100 hours', ja: '80〜100時間' } },
      { id: 'pre-intermediate', name: '03 Pre-Intermediate', sub: { id: 'Mulai memahami percakapan dan teks', en: 'Understanding everyday conversation and texts', ja: '日常会話と文章の理解' }, hours: { id: '100–120 jam', en: '100–120 hours', ja: '100〜120時間' } },
      { id: 'intermediate', name: '04 Intermediate', sub: { id: 'Komunikasi sehari-hari lebih lancar', en: 'Fluent everyday communication', ja: 'より流暢な日常コミュニケーション' }, hours: { id: '120–150 jam', en: '120–150 hours', ja: '120〜150時間' } },
      { id: 'upper-intermediate', name: '05 Upper-Intermediate', sub: { id: 'Komunikasi kompleks dan profesional', en: 'Complex and professional communication', ja: '複雑で専門的なコミュニケーション' }, hours: { id: '150–200 jam', en: '150–200 hours', ja: '150〜200時間' } },
      { id: 'advanced', name: '06 Advanced', sub: { id: 'Bahasa Inggris tingkat lanjut', en: 'Advanced English', ja: '上級英語' }, hours: { id: '200–250 jam', en: '200–250 hours', ja: '200〜250時間' } },
      { id: 'proficiency', name: '07 Proficiency', sub: { id: 'Penguasaan bahasa tingkat sangat tinggi', en: 'Near-native mastery', ja: 'ネイティブに近い習熟' }, hours: { id: '250+ jam', en: '250+ hours', ja: '250時間以上' } },
    ],
  },
  ja: {
    code: 'ja', name: 'Bahasa Jepang', names: { id: 'Bahasa Jepang', en: 'Japanese', ja: '日本語' }, native: '日本語', slug: 'jepang', locale: 'ja-JP', flag: 'jp', accent: '#bc002d',
    levels: [
      { id: 'n5', name: 'N5', sub: { id: 'Dasar · hiragana, katakana, ±100 kanji', en: 'Basic · hiragana, katakana, ≈100 kanji', ja: '基礎 · ひらがな・カタカナ・漢字約100字' }, hours: { id: '150–200 jam', en: '150–200 hours', ja: '150〜200時間' } },
      { id: 'n4', name: 'N4', sub: { id: 'Percakapan sehari-hari · ±300 kanji', en: 'Everyday conversation · ≈300 kanji', ja: '日常会話 · 漢字約300字' }, hours: { id: '200–300 jam', en: '200–300 hours', ja: '200〜300時間' } },
      { id: 'n3', name: 'N3', sub: { id: 'Menengah · ±650 kanji', en: 'Intermediate · ≈650 kanji', ja: '中級 · 漢字約650字' }, hours: { id: '300–450 jam', en: '300–450 hours', ja: '300〜450時間' } },
      { id: 'n2', name: 'N2', sub: { id: 'Menengah-atas · ±1.000 kanji', en: 'Upper-intermediate · ≈1,000 kanji', ja: '中上級 · 漢字約1,000字' }, hours: { id: '450–600 jam', en: '450–600 hours', ja: '450〜600時間' } },
      { id: 'n1', name: 'N1', sub: { id: 'Mahir · ±2.000 kanji', en: 'Advanced · ≈2,000 kanji', ja: '上級 · 漢字約2,000字' }, hours: { id: '600+ jam', en: '600+ hours', ja: '600時間以上' } },
    ],
  },
};

export const courseBySlug = (slug: string): CourseMeta | undefined => COURSES.map((c) => COURSE_META[c]).find((m) => m.slug === slug);
/** Nama jalur dalam bahasa antarmuka. */
export const courseName = (L: Lang, c: Course): string => COURSE_META[c].names[L];

/* ── harga & promo ───────────────────────────────────────────────────────── */

export type Tier = 'umum' | 'pelajar' | 'juara';
/** Mata uang pembayaran (pemilik, 15 Nov 2026: „pastikan pembayaran menggunakan idr, yen dan USD serta PayPal“). */
export type Currency = 'IDR' | 'USD' | 'JPY';
export const CURRENCIES: readonly Currency[] = ['IDR', 'USD', 'JPY'];

export interface TierPrice { one: number; three: number; label: string; note: string; requires: string | null; enabled: boolean; usd: { one: number; three: number }; jpy: { one: number; three: number } }
export interface Pricing {
  /** Harga per tahun: one/three dalam Rupiah, usd/jpy dalam dolar AS dan yen (diatur pengelola). */
  tiers: Record<Tier, TierPrice>;
  /** Masa aktif langganan, hari. */
  days: number;
  updatedAt: number;
}

export const DEFAULT_PRICING: Pricing = {
  tiers: {
    // USD/JPY awal ≈ kurs Nov 2026 (Rp15.800/USD, Rp105/JPY), dibulatkan; pengelola bisa mengubah di Admin → Harga.
    umum: { one: 500_000, three: 1_300_000, usd: { one: 32, three: 82 }, jpy: { one: 4_800, three: 12_400 }, label: 'Umum', note: 'Untuk semua orang.', requires: null, enabled: true },
    pelajar: { one: 350_000, three: 1_000_000, usd: { one: 22, three: 63 }, jpy: { one: 3_300, three: 9_500 }, label: 'Promo pelajar', note: 'Pelajar sampai kelas 12 / 3 SMK sederajat, dengan surat keterangan pelajar terbaru.', requires: 'Surat keterangan pelajar terbaru (foto/PDF)', enabled: true },
    juara: { one: 200_000, three: 500_000, usd: { one: 13, three: 32 }, jpy: { one: 1_900, three: 4_800 }, label: 'Promo juara kelas', note: 'Juara 1, 2 atau 3 di kelas, dengan bukti juara kelas tahun berjalan saat mendaftar.', requires: 'Bukti juara kelas tahun ini (rapor/piagam, foto/PDF)', enabled: true },
  },
  days: 365,
  updatedAt: 0,
};

/** Harga paket: 1 bahasa = harga satuan; 3 bahasa = harga paket; 2 bahasa = 2 × satuan (turunan, bisa diubah admin). */
export function unitPrices(t: TierPrice, cur: Currency): { one: number; three: number } {
  return cur === 'USD' ? t.usd : cur === 'JPY' ? t.jpy : { one: t.one, three: t.three };
}
export function priceFor(p: Pricing, tier: Tier, courses: Course[], cur: Currency = 'IDR'): number {
  const u = unitPrices(p.tiers[tier], cur);
  const n = new Set(courses).size;
  if (n >= 3) return u.three;
  return u.one * n;
}
/** Format uang menurut mata uangnya: Rp500.000 · US$32.00 · ¥4,800. */
export function money(n: number, cur: Currency): string {
  if (cur === 'USD') return `US$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (cur === 'JPY') return `¥${Math.round(n).toLocaleString('ja-JP')}`;
  return `Rp${Math.round(n).toLocaleString('id-ID')}`;
}

/* ── rekening ────────────────────────────────────────────────────────────── */

/**
 * Metode pembayaran manual (transfer bank domestik, SWIFT, dan layanan internasional seperti Wise/Payoneer/Revolut/Skrill).
 * Semuanya dikelola dari Admin → Metode bayar (tambah, ubah, hapus). Sebuah metode **hanya tampil** kepada member bila aktif
 * dan datanya lengkap — templat internasional yang belum diisi tetap tersembunyi. Bisnis ini bisa berpindah tangan tanpa
 * mengubah kode: semua rekening dan kredensial ada di R2, bukan di sini (nilai di bawah hanya bawaan awal).
 */
export type MethodKind = 'bank' | 'swift' | 'wise' | 'payoneer' | 'revolut' | 'skrill' | 'other';
export const METHOD_KINDS: Record<MethodKind, { label: string; account: string; holderRequired: boolean; hint: string }> = {
  bank: { label: 'Bank domestik', account: 'Nomor rekening', holderRequired: true, hint: 'Transfer antarbank di dalam negeri.' },
  swift: { label: 'Bank internasional (SWIFT)', account: 'Nomor rekening / IBAN', holderRequired: true, hint: 'Transfer internasional; isi SWIFT/BIC dan alamat bank.' },
  wise: { label: 'Wise', account: 'E-mail akun Wise atau detail rekening Wise', holderRequired: false, hint: 'Pembeli mengirim dari aplikasi Wise.' },
  payoneer: { label: 'Payoneer', account: 'E-mail akun Payoneer', holderRequired: false, hint: 'Permintaan/kiriman pembayaran Payoneer.' },
  revolut: { label: 'Revolut', account: 'Revtag (@nama) atau nomor telepon', holderRequired: false, hint: 'Kiriman antarpengguna Revolut.' },
  skrill: { label: 'Skrill', account: 'E-mail akun Skrill', holderRequired: false, hint: 'Kiriman dompet Skrill.' },
  other: { label: 'Lainnya', account: 'Nomor / alamat akun', holderRequired: false, hint: 'Metode lain dengan petunjuk sendiri.' },
};

export interface PayMethod {
  id: string;
  kind: MethodKind;
  /** Nama yang dilihat pembeli, mis. „SeaBank“, „BNI (USD)“, „Wise“. */
  name: string;
  /** Mata uang tagihan yang dilayani. */
  currencies: Currency[];
  /** Nomor rekening / IBAN / e-mail akun. */
  account: string;
  holder: string;
  /** Nama resmi bank (untuk SWIFT). */
  bankName: string;
  swift: string;
  code: string;
  address: string;
  /** Petunjuk tambahan (satu langkah per baris). */
  instructions: string;
  enabled: boolean;
}

export interface Payment {
  methods: PayMethod[];
  /** Catatan umum di bawah rekening. */
  note: string;
  whatsapp: string;
}

const pm = (o: Partial<PayMethod> & Pick<PayMethod, 'id' | 'kind' | 'name' | 'currencies'>): PayMethod => ({ account: '', holder: '', bankName: '', swift: '', code: '', address: '', instructions: '', enabled: false, ...o });
const BNI = { bankName: 'PT Bank Negara Indonesia (Persero) Tbk.', swift: 'BNINIDJA', code: '009', holder: 'YUSRON EFENDI', address: 'Jakarta, Indonesia' };

/** Templat layanan internasional: tersembunyi sampai pemilik mengisi akun dan menyalakannya. */
export const METHOD_TEMPLATES: PayMethod[] = [
  pm({ id: 'wise', kind: 'wise', name: 'Wise', currencies: ['USD', 'JPY', 'IDR'] }),
  pm({ id: 'payoneer', kind: 'payoneer', name: 'Payoneer', currencies: ['USD'] }),
  pm({ id: 'revolut', kind: 'revolut', name: 'Revolut', currencies: ['USD', 'JPY'] }),
  pm({ id: 'skrill', kind: 'skrill', name: 'Skrill', currencies: ['USD'] }),
];

/** Pemilik, 14–15 Nov 2026: SeaBank a.n. Yusron Efendi + BNI multimata uang (sama dengan ulyah.com). */
export const DEFAULT_PAYMENT: Payment = {
  methods: [
    pm({ id: 'seabank', kind: 'bank', name: 'SeaBank', currencies: ['IDR'], account: '901592737762', holder: 'Yusron Efendi', enabled: true }),
    pm({ id: 'bni-idr', kind: 'bank', name: 'BNI', currencies: ['IDR'], account: '2090571484', ...BNI, enabled: true }),
    pm({ id: 'bni-usd', kind: 'swift', name: 'BNI (USD)', currencies: ['USD'], account: '2090571495', ...BNI, enabled: true }),
    pm({ id: 'bni-jpy', kind: 'swift', name: 'BNI (JPY)', currencies: ['JPY'], account: '2090571564', ...BNI, enabled: true }),
    ...METHOD_TEMPLATES,
  ],
  note: 'Transfer tepat sesuai nominal tagihan, lalu unggah bukti transfer di portal.',
  whatsapp: '',
};

/** Tampil kepada member? Aktif + akun terisi (+ atas nama untuk bank/SWIFT, + SWIFT untuk transfer internasional). */
export function methodLive(m: PayMethod): boolean {
  if (!m.enabled || !m.account.trim() || !m.currencies.length) return false;
  if (METHOD_KINDS[m.kind]?.holderRequired && !m.holder.trim()) return false;
  if (m.kind === 'swift' && !m.swift.trim()) return false;
  return true;
}
export const methodsFor = (p: Payment, cur: Currency): PayMethod[] => p.methods.filter((m) => methodLive(m) && m.currencies.includes(cur));

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
  ui?: Lang;
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
  /** Mata uang tagihan (tagihan lama tanpa nilai ini = IDR). */
  currency: Currency;
  /** Cara bayar yang terkonfirmasi. */
  method?: 'bank' | 'paypal' | 'stripe' | 'xendit' | 'midtrans';
  paypal?: { orderId: string; captureId?: string; mode: 'live' | 'sandbox'; payer?: string };
  /** Gerbang redirect (Stripe/Xendit/Midtrans): referensi pembayaran terakhir dan modenya. */
  gateway?: { id: 'stripe' | 'xendit' | 'midtrans'; ref: string; mode: 'live' | 'test'; payer?: string };
  paidAt?: number;
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

/** Salinan beranda yang diterjemahkan manual per bahasa antarmuka (Inggris & Jepang). */
export interface SiteCopy {
  description: string;
  hero: { kicker: string; title: string; em: string; lead: string; cta: string; cta2: string };
  why: { title: string; items: { icon: string; title: string; text: string }[] };
  steps: { title: string; items: { n: string; title: string; text: string }[] };
  faq: Faq[];
}

export interface SiteContent extends SiteCopy {
  name: string;
  tagline: string;
  slogan: string;
  /** Kalimat sapaan yang berganti di hero: bahasa, teks, terjemahan tiga bahasa. */
  greetings: { lang: Course; text: string; tr: Tri }[];
  contact: { email: string; whatsapp: string; address: string };
  social: { youtube?: string; instagram?: string; tiktok?: string; facebook?: string };
  /** Teks halaman wajib dalam Markdown; kunci `<slug>` (Indonesia), `<slug>.en`, `<slug>.ja`. */
  pages: Record<string, { title: string; body: string; updated: string }>;
  /** Terjemahan manual salinan beranda. Pemilik, 15 Nov 2026: „jgn gunakan autotranslate, wajib di translate manual“. */
  i18n: { en: SiteCopy; ja: SiteCopy };
  adsEnabled: boolean;
  updatedAt: number;
}

/** Konten situs dalam bahasa antarmuka L (Indonesia = teks utama; en/ja dari terjemahan manual). */
export function siteFor(site: SiteContent, L: Lang): SiteContent {
  if (L === 'id') return site;
  const c = site.i18n?.[L];
  return c ? { ...site, description: c.description, hero: c.hero, why: c.why, steps: c.steps, faq: c.faq } : site;
}

const WHY_ICONS = ['tangga', 'suara', 'buku', 'ujian', 'kartu', 'ujian'];
const why = (title: string, items: [string, string][]) => ({ title, items: items.map(([t, x], i) => ({ icon: WHY_ICONS[i]!, title: t, text: x })) });
const steps = (title: string, items: [string, string][]) => ({ title, items: items.map(([t, x], i) => ({ n: String(i + 1), title: t, text: x })) });
const faq = (items: [string, string][]): Faq[] => items.map(([q, a]) => ({ q, a }));

const COPY_ID: SiteCopy = {
  description:
    'LUAJA adalah kursus online bahasa Jerman, Inggris dan Jepang untuk penutur Indonesia: pelajaran interaktif berurutan dari nol dengan penjelasan Indonesia dan audio berlogat asli, serta bank latihan soal format Goethe, Cambridge, TOEFL, IELTS dan JLPT lengkap dengan kunci, pembahasan dan prediksi nilai.',
  hero: {
    kicker: 'Jerman · Inggris · Jepang · TOEFL · IELTS',
    title: 'Belajar bahasa tanpa batas,',
    em: 'satu langkah yang runtut setiap hari.',
    lead: 'Jalur A1–C2, Beginner–Proficiency dan N5–N1 yang diterbitkan bertahap: pelajaran interaktif sepuluh langkah dengan penjelasan Indonesia dan audio berlogat asli, ditambah bank ratusan soal format ujian resmi dengan kunci jawaban, pembahasan dan prediksi nilai.',
    cta: 'Ikuti pelajaran gratis',
    cta2: 'Lihat harga & promo',
  },
  why: why('Mengapa LUAJA berbeda', [
    ['Satu jalur yang runtut', 'Jenjang → modul → pelajaran → langkah. Pelajaran berikutnya terbuka setelah kuis ≥ 80 %, sehingga fondasi selalu kokoh.'],
    ['Audio berlogat asli di setiap baris', 'Setiap dialog, kalimat dan kosakata dibacakan dengan suara digital berlogat Jerman, Inggris atau Jepang dari perangkat Anda; dapat diperlambat hingga 0,8×.'],
    ['Bank latihan soal format ujian', 'Ratusan soal mengikuti format Goethe-Zertifikat, Cambridge, TOEFL ITP, IELTS dan JLPT — disusun per jenjang, dari simulasi hingga seri penguatan.'],
    ['Kunci dibuka setelah selesai', 'Kunci jawaban dan pembahasan terbuka setelah seluruh soal dikumpulkan — melatih kejujuran dan ketelitian seperti ujian sungguhan.'],
    ['Prediksi nilai & laporan', 'Setiap hasil dikonversi ke skala ujian sebenarnya — Goethe 0–100, TOEFL ITP, IELTS band, JLPT — dan laporannya dapat diunduh.'],
    ['Persiapan TOEFL & IELTS termasuk', 'Paket Bahasa Inggris mencakup latihan TOEFL ITP dan IELTS Academic dengan kunci, pembahasan dan prediksi skor.'],
  ]),
  steps: steps('Cara mulai', [
    ['Ikuti pelajaran gratis', 'Pelajaran pertama setiap jalur terbuka untuk semua, tanpa registrasi.'],
    ['Pilih bahasa & paket', 'Satu bahasa atau tiga bahasa sekaligus, dalam IDR, USD atau JPY; pelajar dan juara kelas memperoleh harga khusus.'],
    ['Bayar & mulai belajar', 'Bayar otomatis (PayPal, kartu, QRIS/VA bila tersedia) dan akses terbuka seketika, atau transfer bank lalu unggah bukti. Seluruh materi terbuka satu tahun penuh.'],
  ]),
  faq: faq([
    ['Apakah sesuai untuk pemula yang benar-benar dari nol?', 'Ya. Jenjang pertama setiap bahasa (A1, Beginner, N5) dimulai dari alfabet, bunyi dan sapaan, dengan penjelasan berbahasa Indonesia pada setiap langkah.'],
    ['Materi apa yang sudah tersedia sekarang?', 'Modul pertama Jerman A1, Inggris Beginner dan Jepang N5 (masing-masing lima pelajaran sepuluh langkah) serta bank latihan soal: Goethe A1–B1, Cambridge A1–A2, TOEFL ITP, IELTS Academic Reading, JLPT N5–N4 dan seri penguatan. Modul dan jenjang berikutnya terbit bertahap; jumlah terkini selalu tampil di halaman jalur dan latihan.'],
    ['Apa yang termasuk dalam satu paket bahasa?', 'Seluruh materi bahasa tersebut yang tersedia dan yang terbit selama masa aktif — pelajaran, kosakata, latihan, kuis dan seluruh paket latihan soal — selama satu tahun. Paket Bahasa Inggris juga mencakup latihan TOEFL dan IELTS.'],
    ['Bagaimana cara membayar?', 'Pilih paket di portal, lalu tagihan menampilkan semua cara bayar yang tersedia: pembayaran otomatis (PayPal, kartu, QRIS/VA bila aktif) membuka akses seketika; transfer bank diikuti unggah bukti dan akses terbuka setelah terverifikasi. Pembayaran dapat dalam IDR, USD atau JPY dan setiap tagihan memiliki invoice.'],
    ['Bagaimana memperoleh harga pelajar atau juara kelas?', 'Pilih kategori yang sesuai saat memesan, lalu unggah surat keterangan pelajar terbaru atau bukti juara kelas tahun berjalan bersama bukti pembayaran. Harga khusus berlaku satu tahun; perpanjangan memerlukan dokumen terbaru.'],
    ['Bagaimana latihan soal dinilai?', 'Jawab seluruh soal dalam satu paket, lalu kumpulkan. Sistem menampilkan nilai, kunci jawaban, pembahasan berbahasa Indonesia dan prediksi nilai pada skala ujian sebenarnya. Laporan latihan dapat diunduh dan, bagi member, tersimpan di portal.'],
    ['Dari mana suara pelafalannya?', 'Suara dihasilkan mesin suara perangkat Anda (Web Speech) dengan logat Jerman, Inggris atau Jepang; kualitasnya bergantung pada suara yang terpasang di perangkat. Di Chrome, Edge dan Safari modern hasilnya jernih dan dapat diperlambat.'],
    ['Apakah tersedia aplikasi ponsel?', 'LUAJA dapat dipasang sebagai aplikasi dari peramban ponsel (ketuk „Pasang aplikasi“). Pelajaran yang pernah dibuka tetap dapat dibaca saat koneksi terbatas.'],
  ]),
};

const COPY_EN: SiteCopy = {
  description:
    'LUAJA is an online German, English and Japanese course built for Indonesian speakers: ordered interactive lessons from zero with native-accent audio, plus a bank of Goethe, Cambridge, TOEFL, IELTS and JLPT-format practice tests with answer keys, explanations and predicted scores. Interface in Indonesian, English and Japanese; lesson explanations are currently in Indonesian.',
  hero: {
    kicker: 'German · English · Japanese · TOEFL · IELTS',
    title: 'Learn languages without limits,',
    em: 'one well-ordered step every day.',
    lead: 'A1–C2, Beginner–Proficiency and N5–N1 paths published step by step: ten-step interactive lessons with native-accent audio, plus hundreds of official-format practice questions with answer keys, explanations and predicted scores. Explanations are currently written in Indonesian.',
    cta: 'Take a free lesson',
    cta2: 'See pricing & offers',
  },
  why: why('Why LUAJA is different', [
    ['One well-ordered path', 'Level → module → lesson → step. The next lesson unlocks after a quiz score of ≥ 80 %, so your foundation is always solid.'],
    ['Native-accent audio on every line', 'Every dialogue, sentence and word is read by your device\'s speech engine with a German, English or Japanese accent; slow it down to 0.8×.'],
    ['Exam-format practice bank', 'Hundreds of questions follow the Goethe-Zertifikat, Cambridge, TOEFL ITP, IELTS and JLPT formats — organised by level, from mock exams to reinforcement series.'],
    ['Keys open when you finish', 'Answer keys and explanations open only after every question is submitted — training honesty and care, just like a real exam.'],
    ['Predicted scores & reports', 'Every result is converted to the real exam scale — Goethe 0–100, TOEFL ITP, IELTS band, JLPT — and the report can be downloaded.'],
    ['TOEFL & IELTS preparation included', 'The English plan includes TOEFL ITP and IELTS Academic practice with keys, explanations and predicted scores.'],
  ]),
  steps: steps('How to start', [
    ['Take a free lesson', 'The first lesson of every path is open to everyone, no registration.'],
    ['Choose a language & plan', 'One language or all three, in IDR, USD or JPY; students and class champions get special prices.'],
    ['Pay & start learning', 'Pay instantly (PayPal, card, QRIS/VA where available) and access opens at once, or transfer by bank and upload proof. All material stays open for a full year.'],
  ]),
  faq: faq([
    ['Is it suitable for complete beginners?', 'Yes. The first level of every language (A1, Beginner, N5) starts with the alphabet, sounds and greetings, with an explanation at every step.'],
    ['What language are the explanations in?', 'Lesson explanations, translations and answer discussions are currently written in Indonesian, the language of our core audience. The interface, portal, pricing and payments are available in English and Japanese; English and Japanese explanations are being prepared.'],
    ['What is available right now?', 'The first module of German A1, English Beginner and Japanese N5 (five ten-step lessons each) and the practice bank: Goethe A1–B1, Cambridge A1–A2, TOEFL ITP, IELTS Academic Reading, JLPT N5–N4 plus reinforcement series. Further modules and levels are published in stages; current counts always show on the path and practice pages.'],
    ['What does one language plan include?', 'All material of that language available now and published during your subscription — lessons, vocabulary, practice, quizzes and every practice set — for one year. The English plan also includes TOEFL and IELTS practice.'],
    ['How do I pay?', 'Choose a plan in the portal; the invoice then shows every available method: instant payment (PayPal, card, QRIS/VA where active) opens access immediately; a bank transfer followed by an uploaded proof opens access once verified. Pay in IDR, USD or JPY; every invoice has a downloadable document.'],
    ['How do I get the student or class-champion price?', 'Pick the matching category when ordering, then upload a current student certificate or this year\'s class-ranking proof together with your payment proof. Special prices are valid for one year; renewals need fresh documents.'],
    ['How are practice tests graded?', 'Answer every question in a set and submit. You then see your score, the answer key, explanations (in Indonesian) and a predicted score on the real exam scale. Reports can be downloaded and, for members, are saved in the portal.'],
    ['Where does the pronunciation audio come from?', 'Audio is produced by your device\'s speech engine (Web Speech) with a German, English or Japanese accent; quality depends on the voices installed on your device. Modern Chrome, Edge and Safari sound clear and can be slowed down.'],
    ['Is there a mobile app?', 'LUAJA can be installed as an app from your phone\'s browser (tap “Install app”). Lessons you have opened remain readable with a limited connection.'],
  ]),
};

const COPY_JA: SiteCopy = {
  description:
    'LUAJAはインドネシア語話者向けに作られたドイツ語・英語・日本語のオンライン講座です。ゼロから順を追って学ぶインタラクティブなレッスンとネイティブ発音の音声、Goethe・Cambridge・TOEFL・IELTS・JLPT形式の模擬問題（解答・解説・予想スコア付き）。表示はインドネシア語・英語・日本語に対応。レッスンの解説は現在インドネシア語です。',
  hero: {
    kicker: 'ドイツ語 · 英語 · 日本語 · TOEFL · IELTS',
    title: '限界なく言葉を学ぶ、',
    em: '毎日ひとつ、順を追って。',
    lead: 'A1〜C2、Beginner〜Proficiency、N5〜N1のコースを段階的に公開中。ネイティブ発音の音声付き10ステップのインタラクティブなレッスンと、本番形式の数百問の模擬問題（解答・解説・予想スコア付き）。解説は現在インドネシア語で書かれています。',
    cta: '無料レッスンを受ける',
    cta2: '料金と割引を見る',
  },
  why: why('LUAJAが違う理由', [
    ['順序立てたひとつの道', 'レベル → モジュール → レッスン → ステップ。クイズで80％以上を取ると次のレッスンが開くので、土台が常にしっかりします。'],
    ['すべての行にネイティブ発音の音声', '会話・文・単語はお使いの端末の音声エンジンがドイツ語・英語・日本語のアクセントで読み上げます。0.8倍速にもできます。'],
    ['本番形式の模擬問題バンク', 'Goethe-Zertifikat、Cambridge、TOEFL ITP、IELTS、JLPTの形式に沿った数百問。レベル別に、模擬試験から強化シリーズまで。'],
    ['終わってから開く解答', '解答と解説は全問を提出した後にだけ開きます。本番と同じように、誠実さと注意深さが身につきます。'],
    ['予想スコアとレポート', '結果はGoethe 0〜100、TOEFL ITP、IELTSバンド、JLPTなど実際の試験スケールに換算され、レポートをダウンロードできます。'],
    ['TOEFL・IELTS対策込み', '英語プランにはTOEFL ITPとIELTS Academicの練習（解答・解説・予想スコア付き）が含まれます。'],
  ]),
  steps: steps('始め方', [
    ['無料レッスンを受ける', '各コースの最初のレッスンは登録不要で誰でも受講できます。'],
    ['言語とプランを選ぶ', '1言語または3言語を、IDR・USD・JPYで。学生と学年上位者には特別料金。'],
    ['支払って学習開始', '自動決済（PayPal、カード、利用可能な場合はQRIS/VA）ならすぐに利用開始。銀行振込の場合は証明をアップロード。教材は1年間すべて利用できます。'],
  ]),
  faq: faq([
    ['まったくの初心者でも大丈夫ですか？', 'はい。各言語の最初のレベル（A1、Beginner、N5）はアルファベット、発音、あいさつから始まり、各ステップに解説が付きます。'],
    ['解説は何語ですか？', 'レッスンの解説・訳・答えの説明は、主な受講者に合わせて現在インドネシア語で書かれています。表示、ポータル、料金、支払いは英語と日本語に対応しており、英語・日本語の解説は準備中です。'],
    ['今利用できる教材は？', 'ドイツ語A1・英語Beginner・日本語N5の最初のモジュール（各10ステップのレッスン5回）と模擬問題バンク（Goethe A1〜B1、Cambridge A1〜A2、TOEFL ITP、IELTS Academic Reading、JLPT N5〜N4、強化シリーズ）。以降のモジュールとレベルは順次公開され、最新の数はコースと模擬問題のページに表示されます。'],
    ['1言語プランには何が含まれますか？', 'その言語の公開済み教材と受講期間中に公開される教材すべて（レッスン、語彙、演習、クイズ、模擬問題）を1年間。英語プランにはTOEFLとIELTSの練習も含まれます。'],
    ['支払い方法は？', 'ポータルでプランを選ぶと、請求書に利用できる支払い方法が表示されます。自動決済（PayPal、カード、有効な場合はQRIS/VA）ならすぐに利用開始。銀行振込は証明をアップロードし、確認後に利用開始。IDR・USD・JPYで支払え、請求書ごとに書類をダウンロードできます。'],
    ['学生割引・学年上位者割引を受けるには？', '注文時に該当する区分を選び、最新の在学証明書または今年度のクラス順位の証明を支払い証明と一緒にアップロードしてください。特別料金は1年間有効で、更新時には新しい書類が必要です。'],
    ['模擬問題はどう採点されますか？', 'セットの全問に答えて提出すると、得点、解答、解説（インドネシア語）、実際の試験スケールでの予想スコアが表示されます。レポートはダウンロードでき、会員はポータルに保存されます。'],
    ['発音の音声はどこから？', '音声はお使いの端末の音声エンジン（Web Speech）がドイツ語・英語・日本語のアクセントで生成します。品質は端末にインストールされた音声に依存し、最新のChrome・Edge・Safariでは明瞭で、速度も落とせます。'],
    ['スマートフォンアプリはありますか？', 'LUAJAはスマートフォンのブラウザからアプリとしてインストールできます（「アプリをインストール」をタップ）。一度開いたレッスンは通信が不安定でも読めます。'],
  ]),
};

export const DEFAULT_SITE: SiteContent = {
  name: 'LUAJA',
  tagline: 'Learning Universal for Achievement, Journey & Advancement',
  slogan: 'Learn Without Limits.',
  ...COPY_ID,
  greetings: [
    { lang: 'de', text: 'Hallo! Schön, dich kennenzulernen.', tr: { id: 'Halo! Senang berkenalan denganmu.', en: 'Hello! Nice to meet you.', ja: 'こんにちは！はじめまして。' } },
    { lang: 'en', text: 'Hello! Nice to meet you.', tr: { id: 'Halo! Senang bertemu denganmu.', en: 'Hello! Nice to meet you.', ja: 'こんにちは！はじめまして。' } },
    { lang: 'ja', text: 'こんにちは！はじめまして。', tr: { id: 'Halo! Senang berkenalan.', en: 'Hello! Nice to meet you.', ja: 'こんにちは！はじめまして。' } },
  ],
  contact: { email: 'halo@luaja.com', whatsapp: '', address: 'Indonesia' },
  social: {},
  pages: {},
  i18n: { en: COPY_EN, ja: COPY_JA },
  adsEnabled: true,
  updatedAt: 0,
};
