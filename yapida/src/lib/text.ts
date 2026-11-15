/** Alat teks kecil: slug, tanggal Indonesia (WIB), potongan ringkas. */

export function slugify(s: string, max = 70): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '');
}

const WIB = 7 * 3600_000;
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** "2026-11-14" atau milidetik → "14 November 2026". */
export function tanggal(v: number | string, denganHari = false): string {
  const d = typeof v === 'number' ? new Date(v + WIB) : new Date(`${v.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  const t = `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return denganHari ? `${HARI[d.getUTCDay()]}, ${t}` : t;
}

/** Tanggal hari ini di WIB, "YYYY-MM-DD". */
export const hariIni = (ms = Date.now()): string => new Date(ms + WIB).toISOString().slice(0, 10);

/** Jam WIB "HH.MM" dari milidetik. */
export const jamWib = (ms: number): string => new Date(ms + WIB).toISOString().slice(11, 16).replace(':', '.');

/** Potong di batas kata, tambah elipsis. */
export function ringkas(s: string, max = 160): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(' ');
  return `${(i > max * 0.6 ? cut.slice(0, i) : cut).replace(/[.,;:!?–-]+$/, '')}…`;
}

/** Teks polos dari Markdown (untuk ringkasan & pencarian). */
export function polos(md: string): string {
  return md
    .replace(/^::(ar|en|id)\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*\d.\s|]+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Apakah teks ini berbahasa Arab: hampir semua hurufnya aksara Arab (sisipan Latin paling banyak seperempatnya). */
export function arab(s: string): boolean {
  const ar = (s.match(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g) ?? []).length;
  const lat = (s.match(/[A-Za-z]/g) ?? []).length;
  return ar > 0 && lat * 4 <= ar;
}

/* ── angka untuk dokumen (kwitansi, nomor surat) ─────────────────────────── */

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
/** Angka → kata bahasa Indonesia: 1.250.000 → "satu juta dua ratus lima puluh ribu". Pecahan dibulatkan ke bawah. */
export function terbilang(n: number): string {
  const x = Math.floor(Math.abs(Number(n) || 0));
  if (x === 0) return 'nol';
  const t = (v: number): string => {
    if (v < 12) return SATUAN[v]!;
    if (v < 20) return `${SATUAN[v - 10]} belas`;
    if (v < 100) return `${SATUAN[Math.floor(v / 10)]} puluh${v % 10 ? ` ${SATUAN[v % 10]}` : ''}`;
    if (v < 200) return `seratus${v % 100 ? ` ${t(v % 100)}` : ''}`;
    if (v < 1000) return `${SATUAN[Math.floor(v / 100)]} ratus${v % 100 ? ` ${t(v % 100)}` : ''}`;
    if (v < 2000) return `seribu${v % 1000 ? ` ${t(v % 1000)}` : ''}`;
    if (v < 1e6) return `${t(Math.floor(v / 1000))} ribu${v % 1000 ? ` ${t(v % 1000)}` : ''}`;
    if (v < 1e9) return `${t(Math.floor(v / 1e6))} juta${v % 1e6 ? ` ${t(v % 1e6)}` : ''}`;
    if (v < 1e12) return `${t(Math.floor(v / 1e9))} miliar${v % 1e9 ? ` ${t(v % 1e9)}` : ''}`;
    return `${t(Math.floor(v / 1e12))} triliun${v % 1e12 ? ` ${t(v % 1e12)}` : ''}`;
  };
  return t(x);
}

/** 1250000 → "Rp 1.250.000" (tanpa bergantung pada data lokal mesin). */
export const rupiah = (n: number): string => `Rp ${String(Math.round(Math.abs(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const ROMAWI_BULAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
/** Bulan (0–11) → angka Romawi untuk nomor surat. */
export const bulanRomawi = (bulan0: number): string => ROMAWI_BULAN[Math.max(0, Math.min(11, bulan0))]!;

/** Tahun pelajaran yang sedang berjalan (ganti tiap Juli, WIB): "2026/2027". */
export function tahunPelajaran(ms = Date.now()): string {
  const d = new Date(ms + WIB);
  const th = d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return `${th}/${th + 1}`;
}
