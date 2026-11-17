/**
 * Pesan & Saran pengunjung (pemilik, 17 Nov 2026): „Buatkan pesan dan saran untuk pengunjung, dan saran masuk ke lembaga yg
 * di arahkan pengunjung, tapi super admin dan yayasan mengetahui itu dan bisa membalas sebagai lembaga yg d tuju, bisa di
 * show hidden oleh super admin jika ingin menampilkan“.
 *
 * - Pengunjung memilih lembaga tujuan (atau pengurus yayasan), jenis (saran, pertanyaan, kesan, keluhan), dan menulis pesan.
 *   Ia mendapat tautan pribadi untuk membaca balasan dan menanggapi kembali — tanpa akun, tanpa kontak wajib.
 * - Pengelola lembaga tujuan melihat dan membalas; super admin & yayasan melihat SEMUA pesan dan bisa membalas atas nama
 *   lembaga yang dituju (balasan selalu ditandatangani nama lembaga, siapa yang menulis tercatat untuk pengelola saja).
 * - Hanya super admin yang bisa menampilkan / menyembunyikan pesan di situs (bawaan: tersembunyi). Yang tampil: nama (atau
 *   „Hamba Allah“ bila disamarkan), jenis, lembaga, isi, dan balasan lembaga. Kontak tidak pernah tampil.
 *
 * Penyimpanan (aturan tetap: hanya R2, tidak pernah D1):
 *   c/saran/<id>.json            dokumen (sumber kebenaran, diubah lewat compare-and-swap)
 *   i/saran/a/<invTs>~<id>       indeks semua pesan (ringkasan pengelola di metadata)
 *   i/saran/t/<invTs>~<id>       indeks pesan yang ditampilkan (ringkasan publik saja)
 *   k/saran-pindah.json          penanda: pesan formulir kontak lama (koleksi „pesan“) sudah disalin dengan id yang sama
 */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { newId, timingSafeEqual } from '../lib/crypto.ts';
import { lingkupSemua, PERAN, tingkat, type User } from './users.ts';
import { daftar, ambil } from './koleksi.ts';

export type KategoriSaran = 'saran' | 'pertanyaan' | 'apresiasi' | 'keluhan';
export const KATEGORI: Record<KategoriSaran, { label: string; ikon: string; ajakan: string }> = {
  saran: { label: 'Saran', ikon: '💡', ajakan: 'Usul perbaikan atau gagasan baru' },
  pertanyaan: { label: 'Pertanyaan', ikon: '❓', ajakan: 'PPDB, biaya, jadwal, kegiatan' },
  apresiasi: { label: 'Kesan & terima kasih', ikon: '💚', ajakan: 'Pengalaman baik yang ingin dibagikan' },
  keluhan: { label: 'Keluhan', ikon: '📣', ajakan: 'Hal yang perlu segera diperbaiki' },
};
export const URUT_KATEGORI = Object.keys(KATEGORI) as KategoriSaran[];
export const SEBAGAI: [string, string][] = [['wali', 'Orang tua / wali murid'], ['alumni', 'Alumni'], ['siswa', 'Siswa / santri'], ['masyarakat', 'Masyarakat umum'], ['lainnya', 'Lainnya']];
export type StatusSaran = 'baru' | 'dibaca' | 'dibalas' | 'selesai';
export const STATUS_SARAN: Record<StatusSaran, string> = { baru: 'Baru', dibaca: 'Sudah dibaca', dibalas: 'Sudah dibalas', selesai: 'Selesai' };

export interface Ucapan { dari: 'lembaga' | 'pengunjung'; isi: string; t: number; unit?: string; oleh?: string; olehNama?: string }
export interface Saran {
  id: string;
  unit: string;
  kategori: KategoriSaran;
  nama: string;
  /** Disamarkan bila ditampilkan di situs („Hamba Allah“). */
  anonim: boolean;
  /** WhatsApp atau e-mail — hanya untuk pengelola, tidak pernah tampil. */
  kontak: string;
  sebagai: string;
  isi: string;
  t: number;
  ubah: number;
  status: StatusSaran;
  percakapan: Ucapan[];
  tampil: boolean;
  tampilOleh?: string;
  tampilT?: number;
  /** Kode tautan pribadi pengunjung (/saran/lacak/<id>/<kode>). */
  kode: string;
  dibacaOleh?: string;
  dibacaT?: number;
  riwayat?: { aksi: string; oleh: string; t: number; ket?: string }[];
}

/** Ringkasan pengelola di indeks i/saran/a/. */
export interface MetaSaran { n: string; u: string; k: KategoriSaran; s: StatusSaran; c: string; t: number; tp: 0 | 1; b: number }
/** Ringkasan publik di indeks i/saran/t/ (tanpa kontak, nama sudah disamarkan bila diminta). */
export interface MetaTampil { n: string; u: string; k: KategoriSaran; c: string; t: number; b: number }
export interface ItemSaran extends MetaSaran { id: string }

export const ID_SARAN = /^[a-z]{2,6}_[0-9A-Z]{20}$/;
export const KODE_RE = /^[0-9A-Z]{16}$/;
export const MAKS_ISI = 2000;
export const NAMA_SAMARAN = 'Hamba Allah';
const kunciDok = (id: string) => `c/saran/${id}.json`;
const kunciA = (s: Pick<Saran, 't' | 'id'>) => `i/saran/a/${invTs(s.t)}~${s.id}`;
const kunciT = (s: Pick<Saran, 't' | 'id'>) => `i/saran/t/${invTs(s.t)}~${s.id}`;

export const namaTampil = (s: Pick<Saran, 'nama' | 'anonim'>) => (s.anonim ? NAMA_SAMARAN : s.nama);
export const balasanLembaga = (s: Pick<Saran, 'percakapan'>) => s.percakapan.filter((x) => x.dari === 'lembaga');
export const cuplik = (t: string, n: number) => { const x = t.replace(/\s+/g, ' ').trim(); return x.length > n ? `${x.slice(0, n - 1).trimEnd()}…` : x; };

function buatKode(): string {
  const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => A[b % 32]).join('');
}

/** Teks bersih: baris rapi, tanpa karakter kendali, dipotong. */
export const bersihTeks = (x: unknown, maks: number) => String(x ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, maks);

/* ── hak akses ───────────────────────────────────────────────────────────────────────────────────────────────── */

/** Pengelola lembaga ke atas. Pesan untuk „yayasan“ hanya untuk super admin, ketua & admin yayasan. */
export function bolehLihat(u: Pick<User, 'peran' | 'units'>, s: Pick<Saran, 'unit'>): boolean {
  if (tingkat(u) < PERAN.lembaga.tingkat) return false;
  if (lingkupSemua(u)) return true;
  return s.unit !== 'yayasan' && u.units.includes(s.unit);
}
/** Menampilkan / menyembunyikan di situs dan menghapus: hanya super admin (perintah pemilik). */
export const bolehTampilkan = (u: Pick<User, 'peran'>) => tingkat(u) >= PERAN.super.tingkat;
/** Meneruskan ke lembaga lain: yayasan ke atas. */
export const bolehTeruskan = (u: Pick<User, 'peran' | 'units'>) => lingkupSemua(u);

/* ── tulis ───────────────────────────────────────────────────────────────────────────────────────────────────── */

async function tulisIndeks(store: Store, s: Saran): Promise<void> {
  const meta: MetaSaran = { n: cuplik(s.nama, 60), u: s.unit, k: s.kategori, s: s.status, c: cuplik(s.isi, 110), t: s.t, tp: s.tampil ? 1 : 0, b: balasanLembaga(s).length };
  await store.put(kunciA(s), {}, meta as unknown as Record<string, unknown>);
  if (s.tampil) {
    const pub: MetaTampil = { n: cuplik(namaTampil(s), 60), u: s.unit, k: s.kategori, c: cuplik(s.isi, 180), t: s.t, b: balasanLembaga(s).length };
    await store.put(kunciT(s), {}, pub as unknown as Record<string, unknown>);
  } else await store.del(kunciT(s));
}

export interface MasukanSaran { unit: string; kategori: KategoriSaran; nama: string; anonim: boolean; kontak: string; sebagai: string; isi: string }

export async function kirimSaran(store: Store, m: MasukanSaran, now = Date.now(), idTetap?: string): Promise<Saran> {
  const s: Saran = {
    id: idTetap ?? newId('srn'), unit: m.unit, kategori: m.kategori, nama: m.nama, anonim: m.anonim, kontak: m.kontak, sebagai: m.sebagai,
    isi: m.isi, t: now, ubah: now, status: 'baru', percakapan: [], tampil: false, kode: buatKode(),
  };
  if (!(await store.createOnce(kunciDok(s.id), s))) throw new Error('Pesan ganda.');
  await tulisIndeks(store, s);
  return s;
}

export const ambilSaran = (store: Store, id: string) => (ID_SARAN.test(id) ? store.get<Saran>(kunciDok(id)) : Promise.resolve(null));

/** Kode tautan pribadi cocok? (perbandingan waktu-tetap) */
export const kodeCocok = (s: Pick<Saran, 'kode'>, kode: string) => KODE_RE.test(kode) && timingSafeEqual(s.kode, kode);

/** Ubah dokumen lewat compare-and-swap lalu perbarui indeks. `fn` mengembalikan null bila tidak ada yang diubah. */
async function ubah(store: Store, id: string, fn: (s: Saran) => Saran | null, now = Date.now()): Promise<Saran | null> {
  let berubah = false;
  const hasil = await store.cas<Saran>(kunciDok(id), (cur) => {
    if (!cur) return null;
    const next = fn(cur);
    if (!next) return null;
    berubah = true;
    next.ubah = now;
    return next;
  }, 'Pesan');
  if (hasil && berubah) await tulisIndeks(store, hasil);
  return hasil;
}

const catat = (s: Saran, aksi: string, oleh: string, t: number, ket?: string) => { s.riwayat = [...(s.riwayat ?? []).slice(-40), { aksi, oleh, t, ...(ket ? { ket } : {}) }]; };

/** Balasan pengelola — selalu atas nama lembaga yang dituju (super admin & yayasan juga). */
export function balas(store: Store, id: string, u: Pick<User, 'id' | 'nama'>, isi: string, now = Date.now()) {
  return ubah(store, id, (s) => {
    s.percakapan.push({ dari: 'lembaga', isi, t: now, unit: s.unit, oleh: u.id, olehNama: u.nama });
    s.status = 'dibalas';
    catat(s, 'balas', u.nama, now);
    return s;
  }, now);
}

/** Tanggapan pengunjung dari tautan pribadinya: pesan kembali „baru“ agar pengelola melihatnya. */
export function tanggapi(store: Store, id: string, isi: string, now = Date.now()) {
  return ubah(store, id, (s) => {
    if (s.percakapan.filter((x) => x.dari === 'pengunjung').length >= 20) return null;
    s.percakapan.push({ dari: 'pengunjung', isi, t: now });
    s.status = 'baru';
    return s;
  }, now);
}

export function setStatus(store: Store, id: string, status: StatusSaran, u: Pick<User, 'nama'>, now = Date.now()) {
  return ubah(store, id, (s) => {
    if (s.status === status) return null;
    s.status = status;
    catat(s, `status:${status}`, u.nama, now);
    return s;
  }, now);
}

/** Dibuka pengelola pertama kali: „baru“ → „sudah dibaca“. */
export function tandaiDibaca(store: Store, id: string, u: Pick<User, 'id' | 'nama'>, now = Date.now()) {
  return ubah(store, id, (s) => {
    if (s.status !== 'baru') return null;
    s.status = 'dibaca';
    s.dibacaOleh = u.nama;
    s.dibacaT = now;
    return s;
  }, now);
}

export function setTampil(store: Store, id: string, tampil: boolean, anonim: boolean, u: Pick<User, 'nama'>, now = Date.now()) {
  return ubah(store, id, (s) => {
    if (s.tampil === tampil && s.anonim === anonim) return null;
    s.tampil = tampil;
    s.anonim = anonim;
    s.tampilOleh = u.nama;
    s.tampilT = now;
    catat(s, tampil ? 'tampilkan' : 'sembunyikan', u.nama, now, anonim ? 'nama disamarkan' : undefined);
    return s;
  }, now);
}

export function teruskan(store: Store, id: string, ke: string, u: Pick<User, 'nama'>, now = Date.now()) {
  return ubah(store, id, (s) => {
    if (s.unit === ke) return null;
    catat(s, 'teruskan', u.nama, now, `${s.unit} → ${ke}`);
    s.unit = ke;
    if (s.status === 'selesai') s.status = 'dibaca';
    return s;
  }, now);
}

export async function hapusSaran(store: Store, s: Saran): Promise<void> {
  await store.del([kunciDok(s.id), kunciA(s), kunciT(s)]);
}

/* ── baca ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Pesan yang boleh dilihat akun ini (terbaru dulu). Membaca paling banyak tiga halaman indeks. */
export async function daftarSaran(store: Store, u: Pick<User, 'peran' | 'units'>, o: { unit?: string; status?: StatusSaran | 'tampil'; limit?: number } = {}): Promise<ItemSaran[]> {
  const out: ItemSaran[] = [];
  const limit = o.limit ?? 300;
  let cursor: string | undefined;
  for (let hal = 0; hal < 3 && out.length < limit; hal += 1) {
    const r = await store.list<MetaSaran>('i/saran/a/', { limit: 1000, cursor });
    for (const x of r.items) {
      const m = x.meta;
      if (!m || !m.u) continue;
      if (!bolehLihat(u, { unit: m.u })) continue;
      if (o.unit && m.u !== o.unit) continue;
      if (o.status === 'tampil' ? !m.tp : o.status && m.s !== o.status) continue;
      out.push({ id: x.id, ...m });
      if (out.length >= limit) break;
    }
    cursor = r.cursor;
    if (!cursor) break;
  }
  return out;
}

/** Jumlah pesan „baru“ yang terlihat akun ini (lencana menu). */
export async function hitungSaranBaru(store: Store, u: Pick<User, 'peran' | 'units'>): Promise<number> {
  if (tingkat(u) < PERAN.lembaga.tingkat) return 0;
  return (await daftarSaran(store, u, { status: 'baru', limit: 999 })).length;
}

/** Pesan yang ditampilkan di situs (ringkasan publik), terbaru dulu. */
export async function daftarTampil(store: Store, o: { unit?: string; limit?: number } = {}): Promise<(MetaTampil & { id: string })[]> {
  const r = await store.list<MetaTampil>('i/saran/t/', { limit: 1000 });
  return r.items.filter((x) => x.meta?.u && (!o.unit || x.meta.u === o.unit)).slice(0, o.limit ?? 60).map((x) => ({ id: x.id, ...x.meta }));
}

/* ── pemindahan pesan formulir kontak lama (koleksi „pesan“) ─────────────────────────────────────────────────── */

/**
 * Pesan dari formulir kontak lama disalin sekali ke Pesan & Saran dengan id yang sama (create-once: aman bila berjalan
 * bersamaan atau diulang), lalu penanda ditulis. Dokumen lama tidak dihapus.
 */
export async function pindahkanPesanLama(store: Store): Promise<number> {
  if (await store.get('k/saran-pindah.json')) return 0;
  const lama = await daftar(store, 'pesan', { limit: 3000 });
  let n = 0;
  for (const it of lama) {
    if (await store.get(kunciDok(it.id))) continue;
    const d = await ambil(store, 'pesan', it.id);
    if (!d) continue;
    const isi = bersihTeks(d.d.isi, MAKS_ISI);
    if (!isi) continue;
    const s: Saran = {
      id: d.id, unit: d.unit || 'yayasan', kategori: 'pertanyaan', nama: cuplik(d.judul || 'Pengunjung', 100), anonim: false, kontak: bersihTeks(d.d.kontak, 120),
      sebagai: 'lainnya', isi, t: d.buat, ubah: d.ubah, status: d.status === 'tinjau' ? 'baru' : 'dibaca', percakapan: [], tampil: false, kode: buatKode(),
      riwayat: [{ aksi: 'pindah', oleh: 'sistem', t: Date.now(), ket: 'dari formulir kontak lama' }],
    };
    if (await store.createOnce(kunciDok(s.id), s)) { await tulisIndeks(store, s); n += 1; }
  }
  // penanda hanya ditulis bila semua pesan lama sudah ada di tempat baru
  let semua = true;
  for (const it of lama) if (!(await store.get(kunciDok(it.id)))) { semua = false; break; }
  if (semua) await store.put('k/saran-pindah.json', { t: Date.now(), n: lama.length });
  return n;
}
