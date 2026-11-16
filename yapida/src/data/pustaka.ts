/**
 * Katalog perpustakaan gabungan: buku bawaan (aset Worker, dibangkitkan scripts/buat-pustaka.ts), buku tulisan lembaga
 * (koleksi `buku` di R2, ditulis di portal), dan katalog dunia (jenius.es + Project Gutenberg, disalin ke R2 saat dibaca).
 * Pengaturan rak (buku bawaan yang disembunyikan, buku unggulan) di k/pustaka-atur.json — diatur Super Admin.
 */
import type { Env } from '../env.ts';
import type { Store } from '../lib/store.ts';
import { ambil, daftar, type Dok, type IxItem } from './koleksi.ts';
import { hitungKata, menitBaca, RAK_ID, ringkasBab, uraiNaskah, type Bab, type BukuMeta } from './buku.ts';
import { babLuar, bukuLuar, katalogJenius, salinanLuar, type KartuLuar } from './luar.ts';
import type { Suara } from './model.ts';

export type AsalBuku = 'bawaan' | 'lembaga' | 'jenius' | 'gutenberg';

/** Ringkasan buku untuk kartu, rak, pencarian, dan peringkat. */
export interface KartuBuku {
  id: string;
  judul: string;
  judulAr?: string;
  penulis: string;
  rak: string[];
  suara: Suara;
  kelas?: string;
  mapel?: string;
  unit?: string;
  bahasa: string;
  menit?: number;
  bab?: number;
  sampul?: string;
  /** Sampul bergambar buku luar (jalur di situs ini). */
  sampulUrl?: string;
  asal: AsalBuku;
}

export interface AturPustaka { sembunyi: string[]; unggulan: string[]; ubah?: number }
export const ATUR_KEY = 'k/pustaka-atur.json';

/* ── buku bawaan (aset) ─────────────────────────────────────────────────── */

let bawaanMemo: Promise<BukuMeta[]> | null = null;
export function katalogBawaan(env: Env): Promise<BukuMeta[]> {
  if (!bawaanMemo) {
    bawaanMemo = env.ASSETS.fetch(new Request('https://aset.local/assets/pustaka/katalog.json'))
      .then(async (r) => (r.ok ? ((await r.json()) as { buku: BukuMeta[] }).buku : []))
      .catch(() => []);
    bawaanMemo.then((b) => { if (!b.length) bawaanMemo = null; }).catch(() => { bawaanMemo = null; });
  }
  return bawaanMemo;
}

/** Buku bawaan (aset statis): `k-` koleksi bawaan, `s-` buku pelajaran BSE (scripts/bse-ambil.ts). */
export const bukuBawaan = (id: string) => /^[ks]-[a-z0-9-]{1,80}$/.test(id);

async function babBawaan(env: Env, id: string, n: number): Promise<Bab | null> {
  if (!bukuBawaan(id) || !Number.isInteger(n) || n < 1 || n > 2000) return null;
  const r = await env.ASSETS.fetch(new Request(`https://aset.local/assets/pustaka/b/${id}/${n}.json`));
  return r.ok ? ((await r.json()) as Bab) : null;
}

const kartuDariMeta = (m: BukuMeta, asal: AsalBuku): KartuBuku => ({
  id: m.id, judul: m.judul, ...(m.judulAr ? { judulAr: m.judulAr } : {}), penulis: m.penulis, rak: m.rak, suara: m.suara,
  ...(m.kelas ? { kelas: m.kelas } : {}), ...(m.mapel ? { mapel: m.mapel } : {}), ...(m.unit ? { unit: m.unit } : {}),
  bahasa: m.bahasa, menit: m.menit, bab: m.bab.length, ...(m.sampul ? { sampul: m.sampul } : {}), ...(m.sampulLuar ? { sampulUrl: m.sampulLuar } : {}), asal,
});

/* ── buku tulisan lembaga (portal) ──────────────────────────────────────── */

const SUARA: Suara[] = ['balita', 'anak', 'remaja', 'dewasa'];
const asSuara = (v: unknown): Suara => (SUARA.includes(v as Suara) ? (v as Suara) : 'anak');
const LISENSI: Record<string, string> = { milik: 'Karya lembaga — dipakai di lingkungan Yayasan Al-Huda Yapida', 'cc-by-sa': 'CC BY-SA 4.0', 'cc-by': 'CC BY 4.0', pd: 'Domain publik' };

function rakDok(x: Record<string, unknown>): string[] {
  const r = [x.rak, x.rak2].filter((v): v is string => typeof v === 'string' && Boolean(RAK_ID[v]));
  return r.length ? [...new Set(r)] : ['umum'];
}

function kartuPortal(it: IxItem): KartuBuku {
  const x = it.x ?? {};
  return {
    id: `p-${it.id}`, judul: it.j, penulis: String(x.penulis ?? ''), rak: rakDok(x), suara: asSuara(x.suara),
    ...(x.kelas ? { kelas: String(x.kelas).split('|').join(', ') } : {}), ...(x.mapel ? { mapel: String(x.mapel) } : {}),
    unit: it.u, bahasa: String(x.bahasa ?? 'id'), ...(it.g ? { sampul: it.g } : {}), asal: 'lembaga',
  };
}

export function metaDok(d: Dok): { meta: BukuMeta; bab: Bab[] } {
  const naskah = typeof d.d.naskah === 'string' ? d.d.naskah : '';
  const { bab } = uraiNaskah(naskah, d.judul);
  const kata = bab.reduce((a, b) => a + hitungKata(b.blok), 0);
  const lis = typeof d.d.lisensi === 'string' ? d.d.lisensi : 'milik';
  const meta: BukuMeta = {
    id: `p-${d.id}`, judul: d.judul, ...(typeof d.d.judulAr === 'string' && d.d.judulAr ? { judulAr: d.d.judulAr } : {}),
    penulis: String(d.d.penulis ?? d.penulisNama), rak: rakDok(d.d), suara: asSuara(d.d.suara),
    ...(Array.isArray(d.d.kelas) && d.d.kelas.length ? { kelas: (d.d.kelas as string[]).join(', ') } : {}),
    ...(typeof d.d.mapel === 'string' && d.d.mapel ? { mapel: d.d.mapel } : {}), unit: d.unit, bahasa: String(d.d.bahasa ?? 'id'),
    ringkasan: String(d.d.ringkasan ?? ''), sumber: typeof d.d.sumber === 'string' && d.d.sumber ? d.d.sumber : `Ditulis oleh ${d.penulisNama}`,
    lisensi: LISENSI[lis] ?? LISENSI.milik!, bab: ringkasBab(bab), kata, menit: menitBaca(kata),
    ...(typeof d.d.sampul === 'string' && d.d.sampul ? { sampul: d.d.sampul } : {}),
  };
  return { meta, bab };
}

/* ── gabungan ───────────────────────────────────────────────────────────── */

export interface Katalog {
  semua: KartuBuku[];
  peta: Map<string, KartuBuku>;
  atur: AturPustaka;
  jumlahBab: number;
}

const kartuLuar = (k: KartuLuar): KartuBuku => ({ id: k.id, judul: k.judul, penulis: k.penulis, rak: k.rak, suara: k.suara, bahasa: k.bahasa, ...(k.menit ? { menit: k.menit } : {}), ...(k.kelas ? { kelas: k.kelas } : {}), ...(k.mapel ? { mapel: k.mapel } : {}), ...(k.sampulUrl ? { sampulUrl: k.sampulUrl } : {}), asal: k.sumber });

/** Semua buku yang bisa dibaca di situs (bawaan yang tidak disembunyikan, lembaga yang tayang, jenius.es, salinan luar). */
export async function katalog(env: Env, store: Store): Promise<Katalog> {
  const [bawaan, portal, jen, salinan, atur] = await Promise.all([
    katalogBawaan(env), daftar(store, 'buku', { tayang: true, limit: 3000 }), katalogJenius(env, store), salinanLuar(store), store.get<AturPustaka>(ATUR_KEY),
  ]);
  const a: AturPustaka = { sembunyi: atur?.sembunyi ?? [], unggulan: atur?.unggulan ?? [] };
  const semua: KartuBuku[] = [
    ...portal.map(kartuPortal),
    ...bawaan.filter((b) => !a.sembunyi.includes(b.id)).map((b) => kartuDariMeta(b, 'bawaan')),
    ...jen.map(kartuLuar),
  ];
  const peta = new Map(semua.map((b) => [b.id, b]));
  for (const s of salinan) if (!peta.has(s.id)) { const k = kartuLuar(s); semua.push(k); peta.set(k.id, k); }
  const jumlahBab = bawaan.reduce((n, b) => n + b.bab.length, 0);
  return { semua, peta, atur: a, jumlahBab };
}

/** Metadata lengkap satu buku (dengan daftar bab). */
export async function ambilBuku(env: Env, store: Store, id: string): Promise<BukuMeta | null> {
  if (bukuBawaan(id)) {
    const atur = await store.get<AturPustaka>(ATUR_KEY);
    if (atur?.sembunyi.includes(id)) return null;
    return (await katalogBawaan(env)).find((b) => b.id === id) ?? null;
  }
  if (id.startsWith('p-')) {
    const d = await ambil(store, 'buku', id.slice(2));
    return d && d.status === 'tayang' ? metaDok(d).meta : null;
  }
  if (/^[jg]-/.test(id)) return bukuLuar(env, store, id);
  return null;
}

export async function ambilBab(env: Env, store: Store, id: string, n: number): Promise<Bab | null> {
  if (bukuBawaan(id)) return babBawaan(env, id, n);
  if (id.startsWith('p-')) {
    const d = await ambil(store, 'buku', id.slice(2));
    if (!d || d.status !== 'tayang') return null;
    return metaDok(d).bab.find((b) => b.n === n) ?? null;
  }
  if (/^[jg]-/.test(id)) return babLuar(store, id, n);
  return null;
}

/** Pencarian sederhana: semua kata kueri harus ada di judul, penulis, mapel, atau kelas (tanpa membedakan huruf). */
export function cocok(b: KartuBuku, q: string): boolean {
  const kata = q.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean);
  if (!kata.length) return true;
  const teks = `${b.judul} ${b.judulAr ?? ''} ${b.penulis} ${b.mapel ?? ''} ${b.kelas ?? ''} ${b.rak.map((r) => RAK_ID[r]?.nama ?? r).join(' ')}`.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  return kata.every((k) => teks.includes(k));
}

/** Urutan tampil dalam rak: unggulan, buku lembaga, bawaan, lalu katalog dunia. */
export function urutkan(buku: KartuBuku[], atur: AturPustaka, unit?: string): KartuBuku[] {
  const bobot = (b: KartuBuku) => (atur.unggulan.includes(b.id) ? 0 : unit && b.unit === unit ? 1 : b.asal === 'lembaga' ? 2 : b.asal === 'bawaan' ? 3 : 4);
  return [...buku].sort((a, b) => bobot(a) - bobot(b) || a.judul.localeCompare(b.judul, 'id'));
}
