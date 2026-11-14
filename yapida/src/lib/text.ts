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
