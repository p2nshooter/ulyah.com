/**
 * Format buku perpustakaan (docs/YAPIDA-BLUEPRINT.md §5). Satu format untuk semua sumber — buku bawaan (kitab, doa,
 * karya yayasan), buku tulisan lembaga di portal, dan buku katalog dunia yang disalin ke R2 — sehingga satu pembaca
 * bersuara melayani semuanya.
 *
 * Setiap blok membawa bahasanya sendiri, jadi pembaca bersuara melafalkan Arab dengan suara Arab, Inggris dengan suara
 * Inggris, dan Indonesia dengan suara Indonesia (perintah pemilik: „Arab ya bahasa Arab, Inggris ya speling Inggris“).
 */
import type { Suara } from './model.ts';

/** Jenis blok: h judul kecil · p paragraf Indonesia · ar Arab · tr terjemah · en Inggris · lt transliterasi (tidak
 *  dibacakan) · cat catatan/sumber · q kutipan · li butir daftar · img gambar (x = alamat, a = keterangan) ·
 *  aktivitas ala Wordwall: kuis „Tanya? | *benar | salah | salah“, kartu „depan | belakang“ (dibalik),
 *  cocok „kiri = kanan ; kiri = kanan“ (pasangkan) · adegan „nama | keterangan“: gambar animasi bertema yang bisa
 *  diseret dan diputar lalu dikembalikan (public/assets/adegan.js). */
export type JenisBlok = 'h' | 'p' | 'ar' | 'tr' | 'en' | 'lt' | 'cat' | 'q' | 'li' | 'img' | 'kuis' | 'kartu' | 'cocok' | 'adegan';
export interface Blok { t: JenisBlok; x: string; a?: string }
export const AKTIVITAS: JenisBlok[] = ['kuis', 'kartu', 'cocok', 'adegan'];
export interface Bab { n: number; judul: string; judulAr?: string; blok: Blok[] }
export interface BabRingkas { n: number; judul: string; kata: number }

export interface BukuMeta {
  /** k-… bawaan · p-… portal · j-… jenius.es · g-… Gutenberg */
  id: string;
  judul: string;
  judulAr?: string;
  penulis: string;
  penerjemah?: string;
  rak: string[];
  suara: Suara;
  kelas?: string;
  mapel?: string;
  /** Lembaga pemilik (buku portal) — rak lembaganya menampilkannya lebih dulu. */
  unit?: string;
  bahasa: string;
  ringkasan: string;
  sumber: string;
  sumberUrl?: string;
  lisensi: string;
  lisensiUrl?: string;
  bab: BabRingkas[];
  kata: number;
  menit: number;
  /** Berkas sampul unggahan (opsional) — tanpa ini sampul tipografi dibangkitkan. */
  sampul?: string;
  /** Sampul gambar dari sumber luar (jenius.es / Gutenberg), dilayani lewat Worker. */
  sampulLuar?: string;
  /** Buku cerita bergambar: setiap gambar memulai halaman baru. */
  bergambar?: boolean;
  tag?: string[];
}

export interface Rak {
  id: string;
  nama: string;
  ringkas: string;
  suara: Suara;
  /** Warna dasar sampul rak ini. */
  warna: number;
  ikon: string;
  /** Lembaga yang memakai rak ini (urutan rak di halaman lembaga). */
  unit: string[];
}

/** Rak: jenjang (TK/RA, MI, MTs, SMA/MA/SMK), pesantren, buku anak per bahasa, kisah, hadits, doa, guru, umum. */
export const RAK: Rak[] = [
  { id: 'ra', nama: 'TK / RA', ringkas: 'Huruf, angka, warna, adab, dan cerita bergambar untuk anak usia dini — dibacakan dengan suara ceria.', suara: 'balita', warna: 4, ikon: '🌱', unit: ['ra-al-huda', 'tpq-al-huda'] },
  { id: 'cerita', nama: 'Buku Anak & Cerita', ringkas: 'Cerita anak berbahasa Indonesia yang menanamkan akhlak — dengan permainan di akhir buku.', suara: 'anak', warna: 9, ikon: '📖', unit: ['ra-al-huda', 'mi-al-huda', 'tpq-al-huda', 'lksa-al-huda'] },
  { id: 'anak-en', nama: 'Buku Anak Berbahasa Inggris', ringkas: 'Cerita bergambar dan percakapan berbahasa Inggris, dilafalkan dengan suara Inggris.', suara: 'anak', warna: 7, ikon: '🔤', unit: ['ra-al-huda', 'mi-al-huda', 'mts-al-huda'] },
  { id: 'anak-ar', nama: 'Buku Anak Berbahasa Arab', ringkas: 'Huruf hijaiyah, kosakata, dan nama-nama Allah — dilafalkan dengan suara Arab.', suara: 'anak', warna: 5, ikon: 'ع', unit: ['ra-al-huda', 'tpq-al-huda', 'mi-al-huda'] },
  { id: 'tpq', nama: 'TPQ — Iqra’ & Hafalan', ringkas: 'Huruf hijaiyah, doa harian, dan hafalan pendek untuk santri TPQ.', suara: 'anak', warna: 6, ikon: '🕌', unit: ['tpq-al-huda'] },
  { id: 'mi', nama: 'MI / SD — Kelas 1–6', ringkas: 'Buku pelajaran interaktif madrasah ibtidaiyah — dengan gambar yang bisa dimainkan, kuis, dan kartu.', suara: 'anak', warna: 1, ikon: '📗', unit: ['mi-al-huda'] },
  { id: 'mts', nama: 'MTs / SMP — Kelas 7–9', ringkas: 'Bacaan dan buku pelajaran interaktif madrasah tsanawiyah, per kelas dan mata pelajaran.', suara: 'remaja', warna: 2, ikon: '📘', unit: ['mts-al-huda'] },
  { id: 'kitab', nama: 'Kitab Pesantren', ringkas: 'Kitab kuning yang diajarkan di pondok pesantren: matan Arab, terjemah, dan penjelasan.', suara: 'remaja', warna: 0, ikon: '📜', unit: ['ponpes-al-huda', 'mts-al-huda', 'majlis-talim-al-huda'] },
  { id: 'kisah', nama: 'Kisah Nabi & Teladan', ringkas: 'Kisah 25 nabi, kisah dalam Al-Qur’an, para sahabat, tabi’in, dan ulama — berdasarkan Al-Qur’an dan hadits.', suara: 'anak', warna: 10, ikon: '🌙', unit: ['ra-al-huda', 'mi-al-huda', 'mts-al-huda', 'tpq-al-huda', 'majlis-talim-al-huda', 'lksa-al-huda'] },
  { id: 'hadits', nama: 'Hadits', ringkas: 'Kitab-kitab hadits lengkap — Bukhari, Muslim, Abu Dawud, Tirmidzi, Nasa’i, Ibnu Majah, dan lainnya — Arab dan terjemah.', suara: 'dewasa', warna: 3, ikon: '🌿', unit: ['majlis-talim-al-huda', 'ponpes-al-huda', 'masjid-jami-al-huda'] },
  { id: 'doa', nama: 'Doa & Dzikir', ringkas: 'Doa sehari-hari dan dzikir dengan teks Arab, latin, dan arti.', suara: 'anak', warna: 6, ikon: '🤲', unit: ['tpq-al-huda', 'ra-al-huda', 'mi-al-huda', 'majlis-talim-al-huda', 'masjid-jami-al-huda', 'musholla-al-huda'] },
  { id: 'bahasa', nama: 'Bahasa Arab & Inggris', ringkas: 'Kosakata, nahwu, dan percakapan — dilafalkan dengan suara bahasanya masing-masing.', suara: 'anak', warna: 7, ikon: '🗣️', unit: ['mi-al-huda', 'mts-al-huda', 'ponpes-al-huda'] },
  { id: 'guru', nama: 'Guru & Ustadz', ringkas: 'Bacaan pendidik: adab mengajar, membacakan buku, kitab akhlak, dan hadits.', suara: 'dewasa', warna: 8, ikon: '🎓', unit: [] },
  { id: 'umum', nama: 'Bacaan Umum & Keterampilan', ringkas: 'Wawasan, keterampilan kerja, ekonomi, dan karya klasik dunia.', suara: 'dewasa', warna: 10, ikon: '🧭', unit: ['blkk-al-huda', 'bmt-al-huda', 'koperasi-al-huda', 'al-huda-mart', 'lksa-al-huda', 'santunan', 'upz-al-huda'] },
];
export const RAK_ID: Record<string, Rak> = Object.fromEntries(RAK.map((r) => [r.id, r]));

/** Palet sampul (zamrud, lazuardi, delima, nila, emas tua, toska, mawar, jingga, tinta, ungu, cokelat). */
export const PALET: [string, string, string][] = [
  ['#0b4a35', '#062a1e', '#e9c46a'], ['#0f4c81', '#08294a', '#f2d492'], ['#7a1f2b', '#430f17', '#f4c38b'],
  ['#2d3a7c', '#161d45', '#e8cf8f'], ['#7a5a12', '#3e2d07', '#fbe6a6'], ['#0d6e6e', '#063c3c', '#f6dc9c'],
  ['#9c3d5a', '#561f31', '#f8d6a0'], ['#a4521a', '#5a2b0b', '#fde3b4'], ['#1d2b2f', '#0c1416', '#d9b45b'],
  ['#5b2a86', '#30144a', '#f1d38d'], ['#5d4630', '#33261a', '#efd9a8'],
];

/** Tahun ini dikurangi 71: penulis yang wafat sebelum itu karyanya domain publik di Indonesia (UU 28/2014). */
export const batasDomainPublik = (tahun = new Date().getUTCFullYear()) => tahun - 71;

const AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const LATIN = /[A-Za-zÀ-ÿ]/g;
export const beraksaraArab = (s: string) => (s.match(AR)?.length ?? 0) * 3 >= Math.max(1, s.match(LATIN)?.length ?? 0) * 2 && (s.match(AR)?.length ?? 0) > 0;

export function hitungKata(blok: Blok[]): number {
  let n = 0;
  for (const b of blok) if (b.t !== 'lt' && b.t !== 'img' && !AKTIVITAS.includes(b.t)) n += b.x.split(/\s+/).filter(Boolean).length;
  return n;
}

/** Menit baca: 150 kata per menit (blok Arab dihitung lebih lambat). */
export const menitBaca = (kata: number) => Math.max(1, Math.round(kata / 150));

/** Paragraf yang sangat panjang dipecah per kalimat agar pas di halaman dan nyaman dibacakan. */
export function pecahPanjang(b: Blok, maks = 900): Blok[] {
  if (b.x.length <= maks || b.t === 'h' || b.t === 'img' || AKTIVITAS.includes(b.t)) return [b];
  const kalimat = b.x.match(/[^.!?؟۔]+[.!?؟۔]*["”’)\]]*\s*/g) ?? [b.x];
  const out: Blok[] = [];
  let buf = '';
  for (const k of kalimat) {
    if (buf && (buf + k).length > maks) { out.push({ t: b.t, x: buf.trim() }); buf = ''; }
    buf += k;
  }
  if (buf.trim()) out.push({ t: b.t, x: buf.trim() });
  return out;
}

export interface NaskahMd { meta: Record<string, string>; bab: Bab[] }

/**
 * Naskah Markdown sederhana → bab dan blok. Dipakai buku tulisan lembaga (portal) dan karya yayasan bawaan.
 *   ## Judul bab        bab baru            ### Judul           judul kecil
 *   ::ar / ::en / ::id  bahasa paragraf     ::tr  terjemah      ::lt  transliterasi (tidak dibacakan)
 *   ::cat               catatan / sumber    > kutipan           - butir daftar
 * Paragraf beraksara Arab otomatis menjadi blok Arab. Baris kosong memisahkan paragraf.
 */
export function uraiNaskah(src: string, judulAwal = 'Pendahuluan'): NaskahMd {
  const meta: Record<string, string> = {};
  let teks = src.replace(/\r\n?/g, '\n');
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(teks);
  if (fm) {
    for (const line of fm[1]!.split('\n')) {
      const m = /^([A-Za-z]+):\s*(.*)$/.exec(line);
      if (m) meta[m[1]!] = m[2]!.trim();
    }
    teks = teks.slice(fm[0].length);
  }
  const bab: Bab[] = [];
  let cur: Bab | null = null;
  let para: string[] = [];
  let jenisPara: JenisBlok | null = null;
  const babIni = (): Bab => {
    if (!cur) { cur = { n: bab.length + 1, judul: judulAwal, blok: [] }; bab.push(cur); }
    return cur;
  };
  const tutup = () => {
    if (!para.length) return;
    const x = para.join(' ').replace(/\s+/g, ' ').trim();
    para = [];
    if (!x) { jenisPara = null; return; }
    const t: JenisBlok = jenisPara ?? (beraksaraArab(x) ? 'ar' : 'p');
    for (const b of pecahPanjang({ t, x })) babIni().blok.push(b);
    jenisPara = null;
  };
  for (const raw of teks.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) { tutup(); continue; }
    const bm = /^##\s+(.+)$/.exec(line);
    if (bm && !line.startsWith('###')) {
      tutup();
      const [judul, judulAr] = bm[1]!.split(/\s+\|\s+/);
      cur = { n: bab.length + 1, judul: judul!.trim(), ...(judulAr ? { judulAr: judulAr.trim() } : {}), blok: [] };
      bab.push(cur);
      continue;
    }
    const hm = /^###\s+(.+)$/.exec(line);
    if (hm) { tutup(); babIni().blok.push({ t: 'h', x: hm[1]!.trim() }); continue; }
    const qm = /^>\s?(.*)$/.exec(line);
    if (qm) { tutup(); if (qm[1]!.trim()) babIni().blok.push({ t: beraksaraArab(qm[1]!) ? 'ar' : 'q', x: qm[1]!.trim() }); continue; }
    const lm = /^[-*]\s+(.+)$/.exec(line);
    if (lm) { tutup(); babIni().blok.push({ t: 'li', x: lm[1]!.trim() }); continue; }
    // Baris berawalan ::xx adalah satu blok sendiri; baris biasa sesudahnya memulai paragraf baru.
    const pm = /^::(ar|en|id|tr|lt|cat|kuis|kartu|cocok|adegan)\s+(.*)$/.exec(line);
    if (pm) {
      tutup();
      const x = pm[2]!.replace(/\s+/g, ' ').trim();
      if (x) for (const b of pecahPanjang({ t: pm[1] === 'id' ? 'p' : (pm[1] as JenisBlok), x })) babIni().blok.push(b);
      continue;
    }
    para.push(line.trim());
  }
  tutup();
  return { meta, bab: bab.filter((b) => b.blok.length) };
}

/** Ringkasan bab (untuk daftar isi). */
export const ringkasBab = (bab: Bab[]): BabRingkas[] => bab.map((b) => ({ n: b.n, judul: b.judul, kata: hitungKata(b.blok) }));

/** Id buku yang aman sebagai bagian kunci R2 dan alamat. */
export const ID_BUKU_RE = /^[a-z]-[A-Za-z0-9_-]{1,80}$/;

/**
 * Adegan suasana otomatis (perintah pemilik: „animasi2 yg berkaitan dengan tema dan halaman yg d baca“): bab buku anak,
 * cerita, dan kisah yang belum punya adegan diberi satu adegan interaktif sesuai kata-kata di dalamnya.
 */
const SUASANA: [string, RegExp][] = [
  ['sholat', /\b(subuh|dzuhur|zuhur|ashar|asar|maghrib|magrib|isya|waktu (sholat|salat|shalat))\b/i],
  ['masjid', /\b(masjid|musholla|mushola|surau|adzan|azan|kiblat|ka.?bah|mosque)\b/i],
  ['padi', /\b(padi|sawah|petani|beras|panen|bercocok tanam|rice|farm(er)?)\b/i],
  ['hujan', /\b(hujan|awan|banjir|sungai|mata air|rain|cloud|river)\b/i],
  ['laut', /\b(laut|lautan|samudra|kapal|perahu|bahtera|pantai|ombak|sea|ocean|boat|ship|ark)\b/i],
  ['kebun', /\b(kebun|pohon|buah|kurma|anggur|delima|zaitun|apel|mangga|garden|tree|fruit|date palm)\b/i],
  ['huruf', /\b(huruf|hijaiyah|iqra|alif|letter)\b/i],
  ['langit', /\b(malam|bintang|bulan|langit|siang|matahari|pagi|night|star|moon|sky|sun)\b/i],
];
export function suasanaBab(bab: Bab): string | null {
  if (bab.blok.some((b) => b.t === 'adegan')) return null;
  const teks = `${bab.judul} ${bab.blok.slice(0, 40).map((b) => b.x).join(' ')}`;
  for (const [nama, re] of SUASANA) if (re.test(teks)) return nama;
  return null;
}
/** Bab dengan adegan suasana di awalnya — hanya untuk buku anak, cerita, dan kisah (suara balita/anak). */
export function denganSuasana(bab: Bab, suara: string): Bab {
  if (suara !== 'balita' && suara !== 'anak') return bab;
  const nama = suasanaBab(bab);
  return nama ? { ...bab, blok: [{ t: 'adegan', x: `${nama} | Mainkan gambarnya: seret, ketuk dua kali untuk memutar, lalu tekan ↺ Kembalikan` }, ...bab.blok] } : bab;
}
