/**
 * Bank Soal Yapida (perintah pemilik 37, 16–17 Nov 2026): paket PTS & PAS, semester Ganjil & Genap, per jenjang, kelas,
 * dan mata pelajaran — Kurikulum Berbasis Cinta (KBC) pada Kurikulum Merdeka madrasah. Format baku satu paket:
 * 15 pilihan ganda · 5 menjodohkan · 10 isian singkat · 5 uraian, dicetak paling banyak 2 lembar kertas legal berkop lembaga.
 * Siswa berlatih di situs; kunci & pembahasan baru dikirim sesudah lembar jawaban diserahkan (dinilai di server).
 *
 * Penyimpanan (aturan tetap: hanya R2):
 * - Paket bawaan ditulis sebagai teks (yapida/soal/**.txt) → scripts/buat-soal.ts → public/assets/soal/indeks.json (publik,
 *   tanpa kunci) dan public/assets/soal/p/<id>.json (berkunci; jalur ini dijaga Worker sehingga tidak bisa diunduh langsung).
 * - Paket buatan guru: c/soal/<id>.json + indeks i/soal/<unit>/<invTs>~<id> (ringkasan di metadata).
 * - Hasil latihan siswa: c/hasil/<paket>/<invTs>~<siswa>.json (metadata: lembaga, kelas, nilai) + i/hasil-siswa/<siswa>/…
 */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { newId } from '../lib/crypto.ts';
import type { Dok } from './koleksi.ts';
import { jenjangUnit, levelTingkat, posisi } from './siswa.ts';

export type JenjangSoal = 'ra' | 'mi' | 'mts';
export type Semester = 'ganjil' | 'genap';
export type JenisUjian = 'pts' | 'pas' | 'latihan';

export interface ButirPG { t: string; o: string[]; k: number; b?: string }
export interface ButirJodoh { t: string; k: number; b?: string }
export interface ButirIsian { t: string; k: string[]; b?: string }
export interface ButirUraian { t: string; k: string; b?: string }
/** Soal RA (TK A & B): permainan bergambar kartun yang dibacakan — dinilai di perangkat (latihan, bukan ujian). */
export interface ButirRA { m: 'hitung' | 'pilih' | 'hijaiyah' | 'cerita'; t: string; g?: string; n?: number; o: string[]; k: number; cerita?: string }

export interface Paket {
  id: string;
  jenjang: JenjangSoal;
  kelas: number;
  mapel: string;
  semester: Semester;
  jenis: JenisUjian;
  judul: string;
  tahun: string;
  kurikulum: string;
  /** Lembaga pemilik (paket buatan guru); kosong = paket bawaan yayasan. */
  unit?: string;
  /** Paket guru: draf (hanya pengelola) atau tayang (dikerjakan siswa). Paket bawaan selalu tayang. */
  status?: 'draf' | 'tayang';
  penulis?: string;
  buat?: number;
  ubah?: number;
  pg: ButirPG[];
  jodoh: { kiri: ButirJodoh[]; kanan: string[] };
  isian: ButirIsian[];
  uraian: ButirUraian[];
  ra?: ButirRA[];
}

export interface IndeksPaket { id: string; jenjang: JenjangSoal; kelas: number; mapel: string; semester: Semester; jenis: JenisUjian; judul: string; jumlah: number; unit?: string; ubah?: number; st?: 'draf' | 'tayang' }

export const NAMA_JENJANG: Record<JenjangSoal, string> = { ra: 'RA', mi: 'MI', mts: 'MTs' };
export const NAMA_JENIS: Record<JenisUjian, string> = { pts: 'Penilaian Tengah Semester (PTS)', pas: 'Penilaian Akhir Semester (PAS)', latihan: 'Latihan' };
export const SINGKAT_JENIS: Record<JenisUjian, string> = { pts: 'PTS', pas: 'PAS', latihan: 'Latihan' };
export const NAMA_SEMESTER: Record<Semester, string> = { ganjil: 'Ganjil', genap: 'Genap' };
export const KURIKULUM_SOAL = 'Kurikulum Berbasis Cinta (KBC) · Kurikulum Merdeka';
/** Format baku satu paket PTS/PAS (pemilik): PG 15 · menjodohkan 5 · isian 10 · uraian 5. */
export const FORMAT = { pg: 15, jodoh: 5, isian: 10, uraian: 5 } as const;
/** Bobot per butir: PG 2 · menjodohkan 2 · isian 2 · uraian 8 → paket baku bernilai 100. */
export const BOBOT = { pg: 2, jodoh: 2, isian: 2, uraian: 8 } as const;

export const slugMapel = (m: string) => m.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const ID_PAKET = /^(b-[a-z0-9-]{3,80}|soal_[0-9A-Z]{20})$/;
export const idBawaan = (p: Pick<Paket, 'jenjang' | 'kelas' | 'mapel' | 'semester' | 'jenis'>) => `b-${p.jenjang}${p.kelas}-${slugMapel(p.mapel)}-${p.semester}-${p.jenis}`;
export const namaKelasSoal = (j: JenjangSoal, k: number) => (j === 'ra' ? (k <= 1 ? 'Kelompok A' : 'Kelompok B') : `Kelas ${k}`);
export function judulPaket(p: Pick<Paket, 'jenjang' | 'kelas' | 'mapel' | 'semester' | 'jenis'>): string {
  return `${SINGKAT_JENIS[p.jenis]} ${p.jenis === 'latihan' ? '' : `${NAMA_SEMESTER[p.semester]} `}${p.mapel} ${namaKelasSoal(p.jenjang, p.kelas)} ${NAMA_JENJANG[p.jenjang]}`.replace(/\s+/g, ' ').trim();
}
export const jumlahButir = (p: Pick<Paket, 'pg' | 'jodoh' | 'isian' | 'uraian' | 'ra'>) => p.pg.length + p.jodoh.kiri.length + p.isian.length + p.uraian.length + (p.ra?.length ?? 0);
export const ringkasPaket = (p: Paket): IndeksPaket => ({ id: p.id, jenjang: p.jenjang, kelas: p.kelas, mapel: p.mapel, semester: p.semester, jenis: p.jenis, judul: p.judul, jumlah: jumlahButir(p), ...(p.unit ? { unit: p.unit, st: p.status ?? 'draf' } : {}), ...(p.ubah ? { ubah: p.ubah } : {}) });

/* ── pengacak tetap (urutan pilihan menjodohkan sama di layar & kertas) ──────────────────────────────────────────── */

function benih(teks: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < teks.length; i += 1) { h ^= teks.charCodeAt(i); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ── format teks paket (dipakai paket bawaan dan editor guru di portal) ─────────────────────────────────────────── */

export const CONTOH_FORMAT = `@jenjang mi
@kelas 4
@mapel Fikih
@semester ganjil
@jenis pas

[PILIHAN GANDA]
1. Zakat fitrah wajib dikeluarkan pada bulan ....
a. Syawal
*b. Ramadan
c. Zulhijah
d. Muharam
> Zakat fitrah wajib dibayar di bulan Ramadan, paling lambat sebelum salat Idulfitri.

[MENJODOHKAN]
1. Orang yang berhak menerima zakat = mustahik
2. Orang yang wajib membayar zakat = muzaki
~ amil

[ISIAN]
1. Besar zakat fitrah adalah 1 sha’, kira-kira ... kg beras. = 2,5 | 2.5 | dua setengah

[URAIAN]
1. Sebutkan tiga hikmah membayar zakat fitrah!
= Membersihkan diri dari perbuatan sia-sia, membantu fakir miskin agar ikut bergembira di hari raya, dan menumbuhkan rasa peduli.`;

const NOMOR = /^\s*(\d{1,2})\s*[.)]\s*/;
const BAGIAN: [RegExp, 'pg' | 'jodoh' | 'isian' | 'uraian' | 'ra'][] = [
  [/^\[?\s*(A\.\s*)?(PG|PILIHAN\s+GANDA)\s*\]?$/i, 'pg'],
  [/^\[?\s*(B\.\s*)?(MENJODOHKAN|JODOHKAN)\s*\]?$/i, 'jodoh'],
  [/^\[?\s*(C\.\s*)?(ISIAN(\s+SINGKAT)?|ISIAN)\s*\]?$/i, 'isian'],
  [/^\[?\s*(D\.\s*)?(URAIAN|ESAI|ESSAY)\s*\]?$/i, 'uraian'],
  [/^\[?\s*(RA|PERMAINAN\s+RA)\s*\]?$/i, 'ra'],
];

export interface HasilUrai { paket: Omit<Paket, 'id'> | null; galat: string[]; peringatan: string[] }

/** Teks paket → paket terstruktur, dengan galat (paket ditolak) dan peringatan (format baku tidak terpenuhi). */
export function uraiSoal(teks: string, dasar: Partial<Paket> = {}): HasilUrai {
  const galat: string[] = [];
  const peringatan: string[] = [];
  const meta: Record<string, string> = {};
  const pg: ButirPG[] = [];
  const kiri: { t: string; jawab: string; b?: string }[] = [];
  const pengecoh: string[] = [];
  const isian: ButirIsian[] = [];
  const uraian: ButirUraian[] = [];
  const ra: ButirRA[] = [];
  let bagian: 'pg' | 'jodoh' | 'isian' | 'uraian' | 'ra' | '' = '';
  let pgKini: { t: string; o: string[]; k: number; b?: string } | null = null;
  let uraianKini: ButirUraian | null = null;
  let isianKini: ButirIsian | null = null;
  const tutupPG = () => {
    if (!pgKini) return;
    if (pgKini.o.length < 3) galat.push(`PG „${pgKini.t.slice(0, 40)}…“: pilihan jawaban kurang dari 3.`);
    else if (pgKini.k < 0) galat.push(`PG „${pgKini.t.slice(0, 40)}…“: tandai jawaban benar dengan * di depan hurufnya (mis. *b.).`);
    else pg.push({ t: pgKini.t.trim(), o: pgKini.o, k: pgKini.k, ...(pgKini.b ? { b: pgKini.b } : {}) });
    pgKini = null;
  };
  const tutup = () => { tutupPG(); if (uraianKini) { uraian.push(uraianKini); uraianKini = null; } if (isianKini) { isian.push(isianKini); isianKini = null; } };
  const baris = teks.replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < baris.length; i += 1) {
    const mentah = baris[i]!;
    const l = mentah.trim();
    if (!l || l.startsWith('//')) continue;
    const m = /^@(\w+)\s+(.+)$/.exec(l);
    if (m) { meta[m[1]!.toLowerCase()] = m[2]!.trim(); continue; }
    const b = BAGIAN.find(([re]) => re.test(l));
    if (b) { tutup(); bagian = b[1]; continue; }
    if (l.startsWith('>')) {
      const x = l.slice(1).trim();
      if (pgKini) pgKini.b = pgKini.b ? `${pgKini.b} ${x}` : x;
      else if (uraianKini) uraianKini.b = uraianKini.b ? `${uraianKini.b} ${x}` : x;
      else if (isianKini) isianKini.b = isianKini.b ? `${isianKini.b} ${x}` : x;
      else if (bagian === 'jodoh' && kiri.length) kiri[kiri.length - 1]!.b = x;
      continue;
    }
    if (bagian === 'pg') {
      const op = /^(\*)?\s*([a-eA-E])\s*[.)]\s*(\*)?\s*(.+)$/.exec(l);
      if (op && pgKini && !NOMOR.test(l)) {
        if (op[1] || op[3]) pgKini.k = pgKini.o.length;
        pgKini.o.push(op[4]!.trim());
        continue;
      }
      if (NOMOR.test(l)) { tutupPG(); pgKini = { t: l.replace(NOMOR, ''), o: [], k: -1 }; continue; }
      if (pgKini && !pgKini.o.length) { pgKini.t += `\n${l}`; continue; }
      galat.push(`Baris tak dikenali di bagian pilihan ganda: „${l.slice(0, 50)}“`);
      continue;
    }
    if (bagian === 'jodoh') {
      if (l.startsWith('~')) { pengecoh.push(l.slice(1).trim()); continue; }
      const isi = l.replace(NOMOR, '');
      const p = isi.split(/\s+=\s+/);
      if (p.length >= 2) { kiri.push({ t: p[0]!.trim(), jawab: p.slice(1).join(' = ').trim() }); continue; }
      galat.push(`Menjodohkan: tulis „pernyataan = jawaban“ (baris „${l.slice(0, 50)}“).`);
      continue;
    }
    if (bagian === 'isian') {
      if (NOMOR.test(l)) {
        if (isianKini) isian.push(isianKini);
        const isi = l.replace(NOMOR, '');
        const p = isi.split(/\s+=\s+/);
        if (p.length < 2) { galat.push(`Isian: tulis „soal = jawaban | jawaban lain“ (baris „${l.slice(0, 50)}“).`); isianKini = null; continue; }
        isianKini = { t: p[0]!.trim(), k: p.slice(1).join(' = ').split('|').map((x) => x.trim()).filter(Boolean) };
        continue;
      }
      galat.push(`Baris tak dikenali di bagian isian: „${l.slice(0, 50)}“`);
      continue;
    }
    if (bagian === 'uraian') {
      if (NOMOR.test(l)) { if (uraianKini) uraian.push(uraianKini); uraianKini = { t: l.replace(NOMOR, ''), k: '' }; continue; }
      if (l.startsWith('=') && uraianKini) { uraianKini.k = uraianKini.k ? `${uraianKini.k} ${l.slice(1).trim()}` : l.slice(1).trim(); continue; }
      if (uraianKini) { if (uraianKini.k) uraianKini.k += ` ${l}`; else uraianKini.t += `\n${l}`; continue; }
      galat.push(`Baris tak dikenali di bagian uraian: „${l.slice(0, 50)}“`);
      continue;
    }
    if (bagian === 'ra') {
      // 1. hitung | ayam | 3 | Ada berapa ayam? | 2 ; *3 ; 4
      const isi = l.replace(NOMOR, '');
      const p = isi.split('|').map((x) => x.trim());
      const mode = p[0] as ButirRA['m'];
      if (!['hitung', 'pilih', 'hijaiyah', 'cerita'].includes(mode) || p.length < 3) { galat.push(`RA: format „jenis | gambar | pertanyaan | pilihan“ (baris „${l.slice(0, 50)}“).`); continue; }
      const opsiTeks = p[p.length - 1]!.split(';').map((x) => x.trim()).filter(Boolean);
      const k = opsiTeks.findIndex((x) => x.startsWith('*'));
      const o = opsiTeks.map((x) => x.replace(/^\*/, '').trim());
      if (k < 0) { galat.push(`RA: tandai jawaban benar dengan * (baris „${l.slice(0, 50)}“).`); continue; }
      if (mode === 'hitung') ra.push({ m: mode, g: p[1]!, n: Number(p[2]) || 1, t: p[3] ?? 'Ada berapa?', o, k });
      else if (mode === 'cerita') ra.push({ m: mode, g: p[1]!, cerita: p[2]!, t: p[3] ?? '', o, k });
      else ra.push({ m: mode, g: p[1]!, t: p[2]!, o, k });
      continue;
    }
    galat.push(`Baris di luar bagian soal: „${l.slice(0, 50)}“ — awali dengan [PILIHAN GANDA], [MENJODOHKAN], [ISIAN], atau [URAIAN].`);
  }
  tutup();
  const jenjang = (meta.jenjang ?? dasar.jenjang ?? '').toLowerCase() as JenjangSoal;
  const kelas = Number(meta.kelas ?? dasar.kelas);
  const mapel = (meta.mapel ?? dasar.mapel ?? '').trim();
  const semester = (meta.semester ?? dasar.semester ?? 'ganjil').toLowerCase() as Semester;
  const jenis = (meta.jenis ?? dasar.jenis ?? 'pas').toLowerCase() as JenisUjian;
  if (!['ra', 'mi', 'mts'].includes(jenjang)) galat.push('@jenjang harus ra, mi, atau mts.');
  const batasKelas = jenjang === 'ra' ? [1, 2] : jenjang === 'mts' ? [7, 9] : [1, 6];
  if (!Number.isInteger(kelas) || kelas < batasKelas[0]! || kelas > batasKelas[1]!) galat.push(`@kelas untuk ${jenjang.toUpperCase() || 'jenjang ini'} harus ${batasKelas[0]}–${batasKelas[1]}${jenjang === 'ra' ? ' (1 = Kelompok A, 2 = Kelompok B)' : ''}.`);
  if (!mapel || mapel.length > 60) galat.push('@mapel wajib diisi (maks. 60 huruf).');
  if (!['ganjil', 'genap'].includes(semester)) galat.push('@semester harus ganjil atau genap.');
  if (!['pts', 'pas', 'latihan'].includes(jenis)) galat.push('@jenis harus pts, pas, atau latihan.');
  // Menjodohkan: jawaban + pengecoh diacak tetap (urutan sama di layar dan di kertas).
  const acak = benih(`${jenjang}${kelas}${mapel}${semester}${jenis}${kiri.map((x) => x.t).join('|')}`);
  const kanan = [...new Set([...kiri.map((x) => x.jawab), ...pengecoh])];
  for (let i = kanan.length - 1; i > 0; i -= 1) { const j = Math.floor(acak() * (i + 1)); [kanan[i], kanan[j]] = [kanan[j]!, kanan[i]!]; }
  const jodoh = { kiri: kiri.map((x) => ({ t: x.t, k: kanan.indexOf(x.jawab), ...(x.b ? { b: x.b } : {}) })), kanan };
  for (const u of uraian) if (!u.k) galat.push(`Uraian „${u.t.slice(0, 40)}…“: tulis jawaban model pada baris yang diawali „=“.`);
  if (jenjang === 'ra') {
    if (!ra.length) galat.push('Paket RA berisi soal permainan di bagian [RA].');
  } else if (jenis !== 'latihan') {
    const cek: [keyof typeof FORMAT, number, string][] = [['pg', pg.length, 'pilihan ganda'], ['jodoh', jodoh.kiri.length, 'menjodohkan'], ['isian', isian.length, 'isian singkat'], ['uraian', uraian.length, 'uraian']];
    for (const [k, n, nama] of cek) if (n !== FORMAT[k]) peringatan.push(`Format baku ${nama} ${FORMAT[k]} soal — paket ini ${n} soal.`);
  }
  if (!pg.length && !jodoh.kiri.length && !isian.length && !uraian.length && !ra.length) galat.push('Belum ada soal.');
  if (galat.length) return { paket: null, galat, peringatan };
  const judul = (meta.judul ?? dasar.judul ?? '').trim() || judulPaket({ jenjang, kelas, mapel, semester, jenis });
  return {
    paket: { jenjang, kelas, mapel, semester, jenis, judul, tahun: meta.tahun ?? dasar.tahun ?? '2026/2027', kurikulum: meta.kurikulum ?? KURIKULUM_SOAL, pg, jodoh, isian, uraian, ...(ra.length ? { ra } : {}), ...(dasar.unit ? { unit: dasar.unit } : {}) },
    galat, peringatan,
  };
}

/** Paket → teks format (untuk menyalin paket bawaan ke editor guru). */
export function teksPaket(p: Paket): string {
  const h = 'abcde';
  const out = [`@jenjang ${p.jenjang}`, `@kelas ${p.kelas}`, `@mapel ${p.mapel}`, `@semester ${p.semester}`, `@jenis ${p.jenis}`, `@tahun ${p.tahun}`, ''];
  if (p.ra?.length) {
    out.push('[RA]');
    p.ra.forEach((r, i) => {
      const opsi = r.o.map((o, j) => (j === r.k ? `*${o}` : o)).join(' ; ');
      out.push(`${i + 1}. ${r.m === 'hitung' ? `hitung | ${r.g} | ${r.n} | ${r.t}` : r.m === 'cerita' ? `cerita | ${r.g} | ${r.cerita} | ${r.t}` : `${r.m} | ${r.g} | ${r.t}`} | ${opsi}`);
    });
    return out.join('\n');
  }
  if (p.pg.length) {
    out.push('[PILIHAN GANDA]');
    p.pg.forEach((s, i) => { out.push(`${i + 1}. ${s.t}`); s.o.forEach((o, j) => out.push(`${j === s.k ? '*' : ''}${h[j]}. ${o}`)); if (s.b) out.push(`> ${s.b}`); out.push(''); });
  }
  if (p.jodoh.kiri.length) {
    out.push('[MENJODOHKAN]');
    p.jodoh.kiri.forEach((s, i) => { out.push(`${i + 1}. ${s.t} = ${p.jodoh.kanan[s.k]}`); if (s.b) out.push(`> ${s.b}`); });
    const dipakai = new Set(p.jodoh.kiri.map((s) => s.k));
    p.jodoh.kanan.forEach((x, i) => { if (!dipakai.has(i)) out.push(`~ ${x}`); });
    out.push('');
  }
  if (p.isian.length) {
    out.push('[ISIAN]');
    p.isian.forEach((s, i) => { out.push(`${i + 1}. ${s.t} = ${s.k.join(' | ')}`); if (s.b) out.push(`> ${s.b}`); });
    out.push('');
  }
  if (p.uraian.length) {
    out.push('[URAIAN]');
    p.uraian.forEach((s, i) => { out.push(`${i + 1}. ${s.t}`); out.push(`= ${s.k}`); if (s.b) out.push(`> ${s.b}`); out.push(''); });
  }
  return out.join('\n').trim();
}

/* ── untuk peramban: paket tanpa kunci & pembahasan ──────────────────────────────────────────────────────────────── */

export interface PaketSiswa { id: string; judul: string; jenjang: JenjangSoal; kelas: number; mapel: string; semester: Semester; jenis: JenisUjian; pg: { t: string; o: string[] }[]; jodoh: { kiri: string[]; kanan: string[] }; isian: string[]; uraian: string[]; ra?: ButirRA[] }
export function paketTanpaKunci(p: Paket): PaketSiswa {
  return {
    id: p.id, judul: p.judul, jenjang: p.jenjang, kelas: p.kelas, mapel: p.mapel, semester: p.semester, jenis: p.jenis,
    pg: p.pg.map((s) => ({ t: s.t, o: s.o })), jodoh: { kiri: p.jodoh.kiri.map((s) => s.t), kanan: p.jodoh.kanan },
    isian: p.isian.map((s) => s.t), uraian: p.uraian.map((s) => s.t),
    // RA: permainan latihan untuk anak usia dini — kunci ikut dikirim karena dinilai langsung di perangkat (bukan ujian).
    ...(p.ra ? { ra: p.ra } : {}),
  };
}

/* ── penilaian ───────────────────────────────────────────────────────────────────────────────────────────────────── */

export interface Jawaban { pg: (number | null)[]; jodoh: (number | null)[]; isian: string[]; uraian: string[]; /** Penilaian diri uraian: 2 sesuai, 1 sebagian, 0 belum. */ diri?: (number | null)[] }

const HARAKAT = /[ً-ٰٟۖ-ۭـ]/g;
export const normalJawab = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(HARAKAT, '')
  .replace(/(\d)[.,](?=\d)/g, '$1').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

export function cocokIsian(jawab: string, kunci: string[]): boolean {
  const j = normalJawab(jawab);
  if (!j) return false;
  return kunci.some((k) => {
    const n = normalJawab(k);
    if (!n) return false;
    if (j === n) return true;
    // Jawaban sedikit lebih panjang yang memuat kunci utuh (≥ 5 huruf) tetap benar: „nabi muhammad saw“ ⊃ „nabi muhammad“.
    return n.length >= 5 && ` ${j} `.includes(` ${n} `) && j.length <= n.length + 24;
  });
}

export interface HasilNilai {
  nilai: number;
  skor: { pg: number; jodoh: number; isian: number; uraian: number | null };
  maks: { pg: number; jodoh: number; isian: number; uraian: number };
  benar: { pg: boolean[]; jodoh: boolean[]; isian: boolean[] };
  kunci: { pg: number[]; jodoh: number[]; isian: string[][]; uraian: string[] };
  bahas: { pg: (string | null)[]; jodoh: (string | null)[]; isian: (string | null)[]; uraian: (string | null)[] };
  kosong: number;
}

export function nilaiPaket(p: Paket, j: Jawaban): HasilNilai {
  const bPG = p.pg.map((s, i) => j.pg[i] === s.k);
  const bJd = p.jodoh.kiri.map((s, i) => j.jodoh[i] === s.k);
  const bIs = p.isian.map((s, i) => cocokIsian(String(j.isian[i] ?? ''), s.k));
  const skor = {
    pg: bPG.filter(Boolean).length * BOBOT.pg,
    jodoh: bJd.filter(Boolean).length * BOBOT.jodoh,
    isian: bIs.filter(Boolean).length * BOBOT.isian,
    uraian: j.diri && j.diri.some((x) => x !== null && x !== undefined) ? p.uraian.reduce((n, _s, i) => n + (Math.max(0, Math.min(2, Number(j.diri![i] ?? 0))) / 2) * BOBOT.uraian, 0) : null,
  };
  const maks = { pg: p.pg.length * BOBOT.pg, jodoh: p.jodoh.kiri.length * BOBOT.jodoh, isian: p.isian.length * BOBOT.isian, uraian: p.uraian.length * BOBOT.uraian };
  const total = maks.pg + maks.jodoh + maks.isian + maks.uraian;
  // Nilai: bila uraian belum dinilai, nilai dihitung dari bagian yang dinilai otomatis saja (skala 0–100).
  const dapat = skor.pg + skor.jodoh + skor.isian + (skor.uraian ?? 0);
  const dasar = skor.uraian === null ? total - maks.uraian : total;
  const kosong = p.pg.filter((_s, i) => j.pg[i] === null || j.pg[i] === undefined).length + p.jodoh.kiri.filter((_s, i) => j.jodoh[i] === null || j.jodoh[i] === undefined).length
    + p.isian.filter((_s, i) => !String(j.isian[i] ?? '').trim()).length + p.uraian.filter((_s, i) => !String(j.uraian[i] ?? '').trim()).length;
  return {
    nilai: dasar ? Math.round((dapat / dasar) * 100) : 0, skor, maks,
    benar: { pg: bPG, jodoh: bJd, isian: bIs },
    kunci: { pg: p.pg.map((s) => s.k), jodoh: p.jodoh.kiri.map((s) => s.k), isian: p.isian.map((s) => s.k), uraian: p.uraian.map((s) => s.k) },
    bahas: { pg: p.pg.map((s) => s.b ?? null), jodoh: p.jodoh.kiri.map((s) => s.b ?? null), isian: p.isian.map((s) => s.b ?? null), uraian: p.uraian.map((s) => s.b ?? null) },
    kosong,
  };
}

/** Jawaban dari peramban → bentuk aman (panjang & tipe dibatasi). */
export function bersihkanJawaban(x: unknown, p: Paket): Jawaban {
  const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
  const angka = (v: unknown, n: number) => (Array.isArray(v) ? v : []).slice(0, n).map((y) => (Number.isInteger(y) && (y as number) >= 0 && (y as number) < 10 ? (y as number) : null));
  const teks = (v: unknown, n: number, maks: number) => (Array.isArray(v) ? v : []).slice(0, n).map((y) => String(y ?? '').slice(0, maks));
  return {
    pg: angka(o.pg, p.pg.length), jodoh: angka(o.jodoh, p.jodoh.kiri.length), isian: teks(o.isian, p.isian.length, 200), uraian: teks(o.uraian, p.uraian.length, 3000),
    diri: (Array.isArray(o.diri) ? o.diri : []).slice(0, p.uraian.length).map((y) => (y === 0 || y === 1 || y === 2 ? y : null)),
  };
}

/* ── paket bawaan (aset) & paket guru (R2) ───────────────────────────────────────────────────────────────────────── */

interface EnvAset { ASSETS: Fetcher }
let indeksMemo: Promise<IndeksPaket[]> | null = null;
export function indeksBawaan(env: EnvAset): Promise<IndeksPaket[]> {
  if (!indeksMemo) {
    indeksMemo = env.ASSETS.fetch(new Request('https://aset.local/assets/soal/indeks.json'))
      .then(async (r) => (r.ok ? ((await r.json()) as { paket: IndeksPaket[] }).paket : []))
      .catch(() => []);
    indeksMemo.then((x) => { if (!x.length) indeksMemo = null; }).catch(() => { indeksMemo = null; });
  }
  return indeksMemo;
}

const kunciPaket = (id: string) => `c/soal/${id}.json`;
const kunciIndeks = (unit: string, buat: number, id: string) => `i/soal/${unit}/${invTs(buat)}~${id}`;

export async function ambilPaket(env: EnvAset, store: Store, id: string): Promise<Paket | null> {
  if (!ID_PAKET.test(id)) return null;
  if (id.startsWith('b-')) {
    const r = await env.ASSETS.fetch(new Request(`https://aset.local/assets/soal/p/${id}.json`));
    return r.ok ? ((await r.json()) as Paket) : null;
  }
  return store.get<Paket>(kunciPaket(id));
}

export async function daftarPaketLembaga(store: Store, units: string[] | null): Promise<IndeksPaket[]> {
  const out: IndeksPaket[] = [];
  const daftarUnit = units ?? (await store.list<{ u: string }>('i/soal/', { limit: 1000 })).items.map((x) => x.key.split('/')[2]!).filter((u, i, a) => a.indexOf(u) === i);
  for (const u of daftarUnit) {
    const r = await store.list<IndeksPaket>(`i/soal/${u}/`, { limit: 500 });
    for (const it of r.items) if (it.meta?.id) out.push(it.meta);
  }
  return out;
}

export async function simpanPaketLembaga(store: Store, p: Omit<Paket, 'id'> & { id?: string }, unit: string, penulis: string): Promise<Paket> {
  const now = Date.now();
  const lama = p.id ? await store.get<Paket>(kunciPaket(p.id)) : null;
  const id = lama?.id ?? newId('soal');
  const paket: Paket = { ...p, id, unit, penulis, buat: lama?.buat ?? now, ubah: now };
  await store.put(kunciPaket(id), paket);
  if (lama && lama.unit && lama.unit !== unit) await store.del(kunciIndeks(lama.unit, lama.buat ?? now, id));
  await store.put(kunciIndeks(unit, paket.buat!, id), {}, ringkasPaket(paket) as unknown as Record<string, unknown>);
  return paket;
}

export async function hapusPaketLembaga(store: Store, p: Paket): Promise<void> {
  await store.del([kunciPaket(p.id), kunciIndeks(p.unit ?? 'x', p.buat ?? 0, p.id)]);
}

/* ── hasil latihan siswa ─────────────────────────────────────────────────────────────────────────────────────────── */

export interface Hasil { paket: string; judul: string; siswa: string; nama: string; unit: string; kelas: string; rombel: string; nilai: number; skor: HasilNilai['skor']; benar: HasilNilai['benar']; jawaban: Jawaban; t: number }
export interface MetaHasil { s: string; n: string; u: string; k: string; r: string; v: number; t: number }

export async function simpanHasil(store: Store, h: Hasil): Promise<string> {
  const ts = invTs(h.t);
  const kunci = `c/hasil/${h.paket}/${ts}~${h.siswa}`;
  await store.put(`${kunci}.json`, h, { s: h.siswa, n: h.nama.slice(0, 60), u: h.unit, k: h.kelas, r: h.rombel, v: h.nilai, t: h.t } satisfies MetaHasil as unknown as Record<string, unknown>);
  await store.put(`i/hasil-siswa/${h.siswa}/${ts}~${h.paket}`, {}, { p: h.paket, j: h.judul.slice(0, 90), v: h.nilai, t: h.t, h: `${ts}~${h.siswa}` });
  return `${ts}~${h.siswa}`;
}

export async function hasilPaket(store: Store, paket: string, units: string[] | null): Promise<(MetaHasil & { key: string })[]> {
  const r = await store.list<MetaHasil>(`c/hasil/${paket}/`, { limit: 1000 });
  return r.items.filter((x) => x.meta && (!units || units.includes(x.meta.u))).map((x) => ({ ...x.meta, key: x.key.split('/').pop()!.replace(/\.json$/, '') }));
}

export async function riwayatSiswa(store: Store, siswa: string): Promise<{ p: string; j: string; v: number; t: number; h: string }[]> {
  const r = await store.list<{ p: string; j: string; v: number; t: number; h: string }>(`i/hasil-siswa/${siswa}/`, { limit: 200 });
  return r.items.map((x) => x.meta).filter(Boolean);
}

export async function ambilHasil(store: Store, paket: string, key: string): Promise<Hasil | null> {
  if (!ID_PAKET.test(paket) || !/^[0-9a-z]+~[a-z]{2,6}_[0-9A-Z]{20}$/i.test(key)) return null;
  return store.get<Hasil>(`c/hasil/${paket}/${key}.json`);
}

/** Nilai diri uraian dari siswa (0 belum · 1 sebagian · 2 sesuai) → nilai dihitung ulang; hanya hasil milik siswa itu. */
export async function perbaruiDiri(store: Store, p: Paket, key: string, diri: (number | null)[]): Promise<Hasil | null> {
  const k = `c/hasil/${p.id}/${key}.json`;
  let baru: Hasil | null = null;
  await store.cas<Hasil>(k, (h) => {
    if (!h) return null;
    const jawaban: Jawaban = { ...h.jawaban, diri: p.uraian.map((_s, i) => (diri[i] === 0 || diri[i] === 1 || diri[i] === 2 ? diri[i]! : null)) };
    const n = nilaiPaket(p, jawaban);
    baru = { ...h, jawaban, nilai: n.nilai, skor: n.skor, benar: n.benar };
    return baru;
  }, 'Hasil latihan');
  if (!baru) return null;
  const h = baru as Hasil;
  const ts = key.split('~')[0]!;
  await store.put(k, h, { s: h.siswa, n: h.nama.slice(0, 60), u: h.unit, k: h.kelas, r: h.rombel, v: h.nilai, t: h.t } satisfies MetaHasil as unknown as Record<string, unknown>);
  await store.put(`i/hasil-siswa/${h.siswa}/${ts}~${h.paket}`, {}, { p: h.paket, j: h.judul.slice(0, 90), v: h.nilai, t: h.t, h: key });
  return h;
}

/** Jenjang & kelas siswa sekarang (naik kelas otomatis) dalam penomoran bank soal (RA: 1 = Kelompok A, 2 = Kelompok B). */
export function kelasSiswa(d: Pick<Dok, 'd' | 'unit'>): { jenjang: JenjangSoal | null; kelas: number | null; nama: string; rombel: string } {
  const p = posisi(d.d, d.unit);
  const j = ({ RA: 'ra', MI: 'mi', MTs: 'mts' } as Record<string, JenjangSoal>)[jenjangUnit(d.unit) ?? ''] ?? null;
  const lv = levelTingkat(p.tingkat);
  return { jenjang: j, kelas: lv === null ? null : j === 'ra' ? lv + 1 : lv, nama: p.tingkat, rombel: p.rombel };
}

/** Paket untuk siswa: paket guru lembaganya (tayang) + paket bawaan, jenjangnya; dipisah kelasnya & kelas lain. */
export async function paketSiswa(env: EnvAset, store: Store, d: Pick<Dok, 'd' | 'unit'>): Promise<{ kelasku: IndeksPaket[]; lain: IndeksPaket[]; kelas: string }> {
  const k = kelasSiswa(d);
  const [bawaan, milik, bagi] = await Promise.all([indeksBawaan(env), daftarPaketLembaga(store, [d.unit]), dibagikan(store, d.unit)]);
  // latihan (bank soal siswa) + soal ujian yang sudah dibagikan guru lembaganya
  const semua = [...milik.filter((p) => p.st === 'tayang' && (p.jenis === 'latihan' || bagi.has(p.id))), ...bawaan.filter((p) => p.jenis === 'latihan' || bagi.has(p.id))].filter((p) => p.jenjang === k.jenjang);
  return { kelasku: semua.filter((p) => p.kelas === k.kelas), lain: semua.filter((p) => p.kelas !== k.kelas), kelas: k.nama };
}

/* ── bank soal guru vs latihan siswa (pemilik, 17 Nov 2026: „bedain antara bank soal siswa dan guru“) ─────────────── */

/** PTS & PAS = bank soal GURU (soal ujian; tidak terlihat siswa & publik). Latihan = bank soal SISWA. */
export const untukGuru = (p: Pick<Paket | IndeksPaket, 'jenis'>) => p.jenis !== 'latihan';
const kunciBagi = (unit: string, id: string) => `i/soal-bagi/${unit}/${id}`;

/** Paket ujian yang dibagikan guru kepada siswa lembaganya sebagai latihan (sesudah ujian selesai). */
export async function dibagikan(store: Store, unit: string): Promise<Set<string>> {
  const r = await store.list(`i/soal-bagi/${unit}/`, { limit: 1000 });
  return new Set(r.items.map((x) => x.key.split('/').pop()!));
}
export async function aturBagi(store: Store, unit: string, id: string, bagi: boolean, oleh: string): Promise<void> {
  if (bagi) await store.put(kunciBagi(unit, id), {}, { oleh: oleh.slice(0, 60), t: Date.now() });
  else await store.del(kunciBagi(unit, id));
}

/** Mapel paket → slug mapel kurikulum (src/data/kurikulum.ts), agar peta kelengkapan cocok walau nama ditulis berbeda. */
const ALIAS: Record<string, string> = {
  'al-quran-hadis': 'quran-hadis', 'al-quran-hadits': 'quran-hadis', 'quran-hadis': 'quran-hadis', 'sejarah-kebudayaan-islam': 'ski', ski: 'ski',
  'ipas-ilmu-pengetahuan-alam-sosial': 'ipas', ipas: 'ipas', pkn: 'pendidikan-pancasila', ppkn: 'pendidikan-pancasila', 'pendidikan-pancasila': 'pendidikan-pancasila',
  'seni-budaya-prakarya': 'seni-prakarya', 'seni-dan-prakarya': 'seni-prakarya', 'seni-budaya': 'seni-budaya', 'seni-dan-budaya': 'seni-budaya',
  tahfidz: 'tahfidz', tahfiz: 'tahfidz', 'tahfidz-quran': 'tahfidz', 'tahfidzul-quran': 'tahfidz', btq: 'btq', 'btq-baca-tulis-al-quran': 'btq', 'baca-tulis-al-quran': 'btq', 'baca-tulis-quran': 'btq',
  'nahwu-sharaf': 'nahwu-sharaf', 'nahwu-shorof': 'nahwu-sharaf', 'nahwu-saraf': 'nahwu-sharaf', 'nahwu-dan-sharaf': 'nahwu-sharaf', informatika: 'informatika', tik: 'informatika',
};
export const slugKurikulum = (mapel: string) => { const s = slugMapel(mapel); return ALIAS[s] ?? s; };

/** Enam slot per mapel per kelas: PTS & PAS (bank soal guru) dan latihan (bank soal siswa), tiap semester. */
export const SLOT_SOAL: { jenis: JenisUjian; semester: Semester; nama: string }[] = [
  { jenis: 'pts', semester: 'ganjil', nama: 'PTS Ganjil' }, { jenis: 'pas', semester: 'ganjil', nama: 'PAS Ganjil' },
  { jenis: 'pts', semester: 'genap', nama: 'PTS Genap' }, { jenis: 'pas', semester: 'genap', nama: 'PAS Genap' },
  { jenis: 'latihan', semester: 'ganjil', nama: 'Latihan Ganjil' }, { jenis: 'latihan', semester: 'genap', nama: 'Latihan Genap' },
];
export const kunciSlot = (p: { jenjang: string; kelas: number; mapel: string; jenis: string; semester: string }) => `${p.jenjang}|${p.kelas}|${slugKurikulum(p.mapel)}|${p.jenis}|${p.semester}`;
/** Nama mapel kurikulum untuk naskah soal: tanpa keterangan dalam kurung („IPAS (…)“ → „IPAS“). */
export const namaMapelSoal = (nama: string) => nama.replace(/\s*\(.*\)\s*$/, '').trim();
/** Lembaga yang siswanya mengerjakan paket jenjang ini (RA → Raudhatul Athfal, MI → Ibtidaiyah, MTs → Tsanawiyah). */
export const unitJenjang = (u: { jenis?: string; slug: string }, j: JenjangSoal) =>
  (j === 'ra' ? /raudhatul|^ra\b/i : j === 'mts' ? /tsanawiyah|^mts\b/i : /ibtidaiyah|^mi\b/i).test(`${u.jenis ?? ''} ${u.slug}`.trim()) || u.slug.startsWith(`${j}-`);

/** Kerangka naskah untuk slot kosong (peta kelengkapan): kepala paket terisi, contoh tiap bagian, petunjuk sebagai komentar. */
export function templatSoal(o: { jenjang: JenjangSoal; kelas: number; mapel: string; semester: Semester; jenis: JenisUjian }): string {
  const kepala = [`@jenjang ${o.jenjang}`, `@kelas ${o.kelas}`, `@mapel ${o.mapel}`, `@semester ${o.semester}`, `@jenis ${o.jenis}`, '@tahun 2026/2027', ''];
  if (o.jenis === 'latihan') {
    return [...kepala, '// Latihan siswa: 10–20 soal; boleh hanya pilihan ganda dan isian. Tandai jawaban benar dengan * dan tulis pembahasan setelah >.',
      '[PILIHAN GANDA]', '1. Tulis soal pertama di sini ....', 'a. pilihan pertama', '*b. jawaban yang benar', 'c. pilihan ketiga', 'd. pilihan keempat', '> Pembahasan singkat mengapa jawaban b benar.', '',
      '[ISIAN]', '1. Tulis soal isian .... = jawaban | jawaban lain yang juga benar'].join('\n');
  }
  return [...kepala, `// ${o.jenis.toUpperCase()} (bank soal guru): format baku 15 pilihan ganda · 5 menjodohkan · 10 isian · 5 uraian (nilai 100), tercetak 2 lembar legal berkop.`,
    '// Soal ujian tidak terlihat siswa; sesudah ujian, guru boleh membagikannya sebagai latihan dari halaman paket.',
    '[PILIHAN GANDA]', '1. Tulis soal pertama di sini ....', 'a. pilihan pertama', '*b. jawaban yang benar', 'c. pilihan ketiga', 'd. pilihan keempat', '> Pembahasan singkat.', '// … lanjutkan sampai nomor 15', '',
    '[MENJODOHKAN]', '1. pernyataan pertama = jawaban pertama', '// … sampai nomor 5; tambahkan pengecoh dengan: ~ jawaban pengecoh', '',
    '[ISIAN]', '1. Tulis soal isian .... = jawaban | jawaban lain', '// … sampai nomor 10', '',
    '[URAIAN]', '1. Tulis soal uraian?', '= Jawaban model sebagai pedoman penskoran.', '// … sampai nomor 5'].join('\n');
}
