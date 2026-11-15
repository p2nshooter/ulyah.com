/**
 * Kesiswaan (perintah pemilik 22): daftar siswa dari indeks R2 (kelas berjalan dihitung, tanpa membaca tiap dokumen),
 * riwayat kelas, pekerjaan bertahap (impor file master, tagihan massal) yang aman diulang, dan rekap untuk laporan.
 * Semua data di R2 — tidak pernah D1.
 */
import type { Store } from '../lib/store.ts';
import { newId } from '../lib/crypto.ts';
import { tahunPelajaran } from '../lib/text.ts';
import { ambil, type Dok, type IxItem, type IxMeta, type Koleksi } from './koleksi.ts';
import { JENJANG, cariSiswa, digit, jenjangDari, jenjangUnit, labelStatus, levelTingkat, posisi, tpAwal, type Jenjang, type Posisi } from './siswa.ts';
import type { BarisSiswa } from './master.ts';
import { kunciTagihan, simpanTerkait, statusTagihan } from './kait.ts';

/* ── indeks lengkap ────────────────────────────────────────────────────── */

/** Seluruh indeks sebuah koleksi (semua halaman daftar R2), disaring per lembaga. Satu panggilan daftar per 1.000 entri. */
export async function semuaIndeks(store: Store, kol: string, unit?: string[]): Promise<IxItem[]> {
  const boleh = unit ? new Set(unit) : null;
  const out: IxItem[] = [];
  let cursor: string | undefined;
  do {
    const r = await store.list<IxMeta>(`i/${kol}/a/`, { limit: 1000, cursor });
    for (const x of r.items) {
      if (!x.meta?.j) continue;
      if (boleh && !boleh.has(x.meta.u)) continue;
      out.push({ id: x.id, ...x.meta });
    }
    cursor = r.cursor;
  } while (cursor);
  return out;
}

/* ── siswa dari indeks ─────────────────────────────────────────────────── */

export interface SiswaRingkas {
  id: string; nama: string; unit: string; nisn: string; nis: string; jk: string; jenjang: string; foto?: string;
  /** Posisi pada tahun pelajaran berjalan (kelas naik otomatis, lulus otomatis). */
  p: Posisi;
  /** Urutan tingkat (RA A = 0 … MTs 9) untuk pengurutan dan grafik. */
  level: number;
}

const teks = (v: unknown) => (v === undefined || v === null ? '' : String(v));

export function ringkasSiswa(it: IxItem, now = Date.now()): SiswaRingkas {
  const x = it.x ?? {};
  const d = { jenjang: x.jenjang, tingkat: x.tingkat, rombel: x.rombel, tahunAcuan: x.tahunAcuan, statusSiswa: x.statusSiswa };
  const p = posisi(d, it.u, now);
  const j = (jenjangDari(teks(x.jenjang)) ?? jenjangUnit(it.u)) as Jenjang | null;
  return { id: it.id, nama: it.j, unit: it.u, nisn: teks(x.nisn), nis: teks(x.nis), jk: teks(x.jk), jenjang: j ?? teks(x.jenjang), foto: it.g, p, level: levelTingkat(p.tingkat) ?? 99 };
}

export async function daftarSiswa(store: Store, unit?: string[], now = Date.now()): Promise<SiswaRingkas[]> {
  return (await semuaIndeks(store, 'siswa', unit)).map((it) => ringkasSiswa(it, now));
}

export interface SaringSiswa { unit?: string; tingkat?: string; rombel?: string; status?: string; jk?: string; q?: string }

export function saringSiswa(list: SiswaRingkas[], s: SaringSiswa): SiswaRingkas[] {
  const q = (s.q ?? '').trim().toLowerCase();
  const qd = digit(q);
  return list.filter((x) =>
    (!s.unit || x.unit === s.unit)
    && (!s.tingkat || x.p.tingkat === s.tingkat)
    && (!s.rombel || x.p.rombel.toLowerCase() === s.rombel.toLowerCase())
    && (!s.status || (s.status === 'nonaktif' ? x.p.status !== 'aktif' : x.p.status === s.status))
    && (!s.jk || x.jk === s.jk)
    && (!q || x.nama.toLowerCase().includes(q) || (qd.length >= 3 && (x.nisn.includes(qd) || x.nis.includes(qd)))));
}

/** Urut: lembaga (urutan profil), tingkat, rombel, nama. */
export function urutSiswa(list: SiswaRingkas[], urutUnit: (slug: string) => number): SiswaRingkas[] {
  return [...list].sort((a, b) => urutUnit(a.unit) - urutUnit(b.unit) || a.level - b.level || a.p.rombel.localeCompare(b.p.rombel, 'id', { numeric: true }) || a.nama.localeCompare(b.nama, 'id'));
}

/** Riwayat kelas sejak tahun pelajaran acuan sampai sekarang (atau sampai lulus). */
export function riwayatKelas(d: Record<string, unknown>, unit: string, now = Date.now()): { tp: string; tingkat: string; rombel: string; status: string }[] {
  const acuan = tpAwal(teks(d.tahunAcuan));
  const kini = tpAwal(tahunPelajaran(now));
  if (!Number.isFinite(acuan) || !Number.isFinite(kini)) return [];
  const out: { tp: string; tingkat: string; rombel: string; status: string }[] = [];
  for (let th = acuan; th <= kini && out.length < 14; th += 1) {
    const p = posisi(d, unit, Date.UTC(th, 7, 1));
    out.push({ tp: `${th}/${th + 1}`, tingkat: p.tingkat, rombel: p.rombel, status: p.status });
    if (p.status !== 'aktif') break;
  }
  return out;
}

/* ── pekerjaan bertahap (impor, tagihan massal) ────────────────────────── */

export interface HasilKerja { baru: number; ubah: number; lewat: number; gagalN: number; gagal: { baris: number; nama: string; alasan: string }[] }
export interface Kerja {
  id: string;
  jenis: 'impor' | 'tagihan' | 'guru';
  judul: string;
  oleh: string;
  olehNama: string;
  /** Lembaga yang boleh disentuh pekerjaan ini (lingkup pembuatnya); null = semua. */
  lingkup: string[] | null;
  total: number;
  pos: number;
  selesai: boolean;
  dibuat: number;
  ubah: number;
  kembali: string;
  opsi: Record<string, unknown>;
  hasil: HasilKerja;
}

const kKerja = (id: string) => `k/kerja/${id}.json`;
const kBaris = (id: string) => `k/kerja/${id}.baris.json`;
export const ID_KERJA = /^krj_[0-9A-Z]{20}$/;
/** Baris per panggilan: aman untuk batas sub-permintaan Workers (≈12 operasi R2 per baris). */
export const PER_LANGKAH = 20;

export async function buatKerja(store: Store, k: Omit<Kerja, 'id' | 'pos' | 'selesai' | 'dibuat' | 'ubah' | 'hasil' | 'total'>, baris: unknown[], now = Date.now()): Promise<Kerja> {
  // Bersih-bersih pekerjaan lama (> 2 hari): isinya data pribadi, tidak boleh tertinggal.
  const lama = await store.list(`k/kerja/`, { limit: 200 });
  const usang = lama.items.filter((x) => now - x.uploaded.getTime() > 2 * 86_400_000).map((x) => x.key);
  if (usang.length) await store.del(usang);
  const kerja: Kerja = { ...k, id: newId('krj'), total: baris.length, pos: 0, selesai: baris.length === 0, dibuat: now, ubah: now, hasil: { baru: 0, ubah: 0, lewat: 0, gagalN: 0, gagal: [] } };
  await store.put(kBaris(kerja.id), baris);
  await store.put(kKerja(kerja.id), kerja);
  return kerja;
}

export const ambilKerja = (store: Store, id: string) => (ID_KERJA.test(id) ? store.get<Kerja>(kKerja(id)) : Promise.resolve(null));

export type Pemroses = (baris: unknown, nomor: number, kerja: Kerja) => Promise<{ hasil: 'baru' | 'ubah' | 'lewat' } | { gagal: string; nama: string; baris?: number }>;

/**
 * Satu langkah: memproses baris berikutnya lalu memajukan posisi dengan compare-and-swap. Bila dua tab menjalankan
 * pekerjaan yang sama, langkah yang kalah tidak dihitung (pemrosesannya sendiri aman diulang: penjaga create-once).
 */
export async function langkahKerja(store: Store, id: string, proses: Pemroses): Promise<Kerja | null> {
  const k = await ambilKerja(store, id);
  if (!k || k.selesai) return k;
  const semua = (await store.get<unknown[]>(kBaris(id))) ?? [];
  const mulai = k.pos;
  const potong = semua.slice(mulai, mulai + PER_LANGKAH);
  const h: HasilKerja = { baru: 0, ubah: 0, lewat: 0, gagalN: 0, gagal: [] };
  for (let i = 0; i < potong.length; i += 1) {
    try {
      const r = await proses(potong[i], mulai + i, k);
      if ('gagal' in r) { h.gagalN += 1; h.gagal.push({ baris: r.baris ?? mulai + i + 1, nama: r.nama, alasan: r.gagal }); } else h[r.hasil] += 1;
    } catch (err) {
      h.gagalN += 1;
      h.gagal.push({ baris: mulai + i + 1, nama: '', alasan: err instanceof Error ? err.message.slice(0, 160) : 'Galat tak dikenal.' });
    }
  }
  const baru = await store.cas<Kerja>(kKerja(id), (cur) => {
    if (!cur || cur.pos !== mulai) return null; // langkah lain sudah memajukan posisi
    const pos = Math.min(cur.total, mulai + potong.length);
    return {
      ...cur, pos, selesai: pos >= cur.total, ubah: Date.now(),
      hasil: { baru: cur.hasil.baru + h.baru, ubah: cur.hasil.ubah + h.ubah, lewat: cur.hasil.lewat + h.lewat, gagalN: cur.hasil.gagalN + h.gagalN, gagal: [...cur.hasil.gagal, ...h.gagal].slice(0, 500) },
    };
  }, 'Pekerjaan');
  if (baru?.selesai) await store.del(kBaris(id)); // data pribadi pekerjaan dihapus begitu selesai
  return baru;
}

/* ── impor file master: satu baris ─────────────────────────────────────── */

export interface BarisImpor extends Omit<BarisSiswa, 'galat' | 'peringatan' | 'petunjuk' | 'sumber' | 'lembagaTeks'> { unit: string }

/**
 * Menyimpan satu siswa dari file master. Dicari dulu lewat NISN lalu NIS: ada → diperbarui (nilai kosong di file tidak
 * menghapus data lama; foto & catatan tetap), atau dilewati bila mode „lewati“. NISN yang sama boleh pindah lembaga
 * (lulus MI → masuk MTs) bila di lembaga lamanya sudah tidak aktif; riwayatnya disimpan.
 */
export async function simpanBarisImpor(store: Store, def: Koleksi, koleksi: Record<string, Koleksi>, r: BarisImpor, k: Kerja, now = Date.now()): ReturnType<Pemroses> {
  const lama = (r.nisn ? await cariSiswa(store, r.nisn) : null) ?? (r.nis ? await cariSiswa(store, r.nis) : null);
  if (lama && k.opsi.mode === 'lewati') return { hasil: 'lewat' };
  const d: Record<string, unknown> = {};
  for (const [kunci, v] of Object.entries({ nsm: r.nsm, jenjang: r.jenjang, tingkat: r.tingkat, rombel: r.rombel, nis: r.nis, nisn: r.nisn, nik: r.nik, jk: r.jk, tempatLahir: r.tempatLahir, tanggalLahir: r.tanggalLahir, ayah: r.ayah, ibu: r.ibu, kk: r.kk, alamat: r.alamat, statusSiswa: r.statusSiswa, tahunAcuan: r.tahunAcuan })) {
    if (v !== undefined && v !== '') d[kunci] = v;
  }
  if (lama) {
    if (lama.unit !== r.unit) {
      if (k.lingkup && !k.lingkup.includes(lama.unit)) {
        const p = posisi(lama.d, lama.unit, now);
        if (p.status === 'aktif') return { gagal: `NISN/NIS ini masih tercatat aktif di lembaga lain (${lama.unit}).`, nama: r.nama, baris: r.baris };
      }
      const p0 = posisi(lama.d, lama.unit, now);
      const riwayat = Array.isArray(lama.d.riwayat) ? (lama.d.riwayat as unknown[]) : [];
      d.riwayat = [...riwayat, { unit: lama.unit, jenjang: teks(lama.d.jenjang), tingkat: p0.tingkat, rombel: p0.rombel, status: p0.status, sampai: p0.lulusTp ?? p0.tp }].slice(-6);
    }
    const gabung = { ...lama.d, ...d };
    const h = await simpanTerkait(store, def, { id: lama.id, lama, unit: r.unit, status: 'tayang', judul: r.nama, d: gabung, penulis: k.oleh, penulisNama: k.olehNama }, koleksi, now);
    if (h.galat) return { gagal: Object.values(h.galat).join(' '), nama: r.nama, baris: r.baris };
    return { hasil: 'ubah' };
  }
  const h = await simpanTerkait(store, def, { unit: r.unit, status: 'tayang', judul: r.nama, d, penulis: k.oleh, penulisNama: k.olehNama }, koleksi, now);
  if (h.galat) return { gagal: Object.values(h.galat).join(' '), nama: r.nama, baris: r.baris };
  return { hasil: 'baru' };
}

/* ── tagihan massal ────────────────────────────────────────────────────── */

export interface BarisTagihan { id: string; nama: string; unit: string; nisn: string; kelas: string }

export async function simpanBarisTagihan(store: Store, def: Koleksi, koleksi: Record<string, Koleksi>, r: BarisTagihan, k: Kerja, now = Date.now()): ReturnType<Pemroses> {
  const o = k.opsi as { untuk: string; periode: string; jumlah: number; jatuhTempo?: string; catatan?: string };
  if (!r.nisn) return { gagal: 'Siswa tanpa NISN/NIS.', nama: r.nama };
  const kunci = await kunciTagihan(r.nisn, o.untuk, o.periode);
  const idBaru = newId('tagi');
  if (!(await store.createOnce(kunci, { id: idBaru }))) {
    const g = await store.get<{ id: string }>(kunci);
    const ada = g ? await ambil(store, 'tagihan', g.id) : null;
    if (ada && ada.d.untuk === o.untuk && teks(ada.d.periode).trim().toLowerCase() === o.periode.trim().toLowerCase()) return { hasil: 'lewat' };
    await store.put(kunci, { id: idBaru });
  }
  const d: Record<string, unknown> = { nisn: r.nisn, kelas: r.kelas, untuk: o.untuk, periode: o.periode, jumlah: o.jumlah };
  if (o.jatuhTempo) d.jatuhTempo = o.jatuhTempo;
  if (o.catatan) d.catatan = o.catatan;
  const h = await simpanTerkait(store, def, { idBaru, unit: r.unit, status: 'tayang', judul: r.nama, d, penulis: k.oleh, penulisNama: k.olehNama }, koleksi, now);
  if (h.galat) { await store.del(kunci); return { gagal: Object.values(h.galat).join(' '), nama: r.nama }; }
  return { hasil: 'baru' };
}

/* ── rekap untuk laporan ───────────────────────────────────────────────── */

export interface RekapTagihan { jumlah: number; dibayar: number; sisa: number; n: number; lunas: number; sebagian: number; belum: number; telat: number }
export const rekapKosong = (): RekapTagihan => ({ jumlah: 0, dibayar: 0, sisa: 0, n: 0, lunas: 0, sebagian: 0, belum: 0, telat: 0 });

export function tambahRekap(r: RekapTagihan, x: Record<string, unknown>, hari: string): RekapTagihan {
  const st = statusTagihan(x, hari);
  r.jumlah += Number(x.jumlah) || 0;
  r.dibayar += Math.min(Number(x.dibayar) || 0, Number(x.jumlah) || 0);
  r.sisa += st.sisa;
  r.n += 1;
  r[st.kode] += 1;
  return r;
}

/** Nama tingkat yang berlaku untuk jenjang (urutan grafik). */
export const tingkatJenjang = (j: Jenjang) => Array.from({ length: JENJANG[j].max - JENJANG[j].min + 1 }, (_, i) => (j === 'RA' ? (i === 0 ? 'Kelompok A' : 'Kelompok B') : `Kelas ${JENJANG[j].min + i}`));

export { labelStatus };
export type { Dok };
