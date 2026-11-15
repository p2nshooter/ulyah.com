/**
 * Mesin koleksi: satu cara menyimpan semua isi yang dikelola portal (SDM, kabar, galeri, video, dokumen, PPDB, pustaka …).
 *
 *   c/<kol>/<id>.json            dokumen (sumber kebenaran)
 *   i/<kol>/a/<urut>~<id>        indeks semua status  — ringkasan di customMetadata (daftar portal = satu list)
 *   i/<kol>/t/<urut>~<id>        indeks yang tayang   — daftar halaman publik
 *   u/slug/<kol>/<slug>          penjaga slug unik (create-once) → { id }
 *
 * Tidak ada kunci panas: setiap dokumen punya kuncinya sendiri; indeks ditulis ulang hanya ketika dokumennya berubah.
 * Dokumen menyimpan kunci indeks yang sedang berlaku (`ix`), jadi entri lama dihapus tepat saat urutannya berganti.
 */
import { invTs, type Store } from '../lib/store.ts';
import { newId } from '../lib/crypto.ts';
import { renderMarkdown, safeUrl } from '../lib/markdown.ts';
import { hariIni, polos, ringkas, slugify } from '../lib/text.ts';

export type Status = 'draf' | 'tinjau' | 'tayang' | 'arsip';
export const STATUS: Record<Status, string> = { draf: 'Draf', tinjau: 'Menunggu tinjauan', tayang: 'Tayang', arsip: 'Arsip' };

export type JenisBidang = 'teks' | 'paragraf' | 'markdown' | 'tanggal' | 'waktu' | 'pilih' | 'angka' | 'url' | 'gambar' | 'galeri' | 'berkas' | 'daftar' | 'centang' | 'kelas';

export interface Bidang {
  k: string;
  label: string;
  jenis: JenisBidang;
  wajib?: boolean;
  maks?: number;
  pilihan?: [string, string][];
  bantuan?: string;
  /** Ikut disalin ke ringkasan indeks (nilai pendek saja). */
  indeks?: boolean;
  /** Tidak tampil di formulir (nilai dibawa sebagai input tersembunyi), mis. tautan tagihan pada kwitansi. */
  sembunyi?: boolean;
}

export interface Koleksi {
  id: string;
  nama: string;
  satu: string;
  /** Label kolom judul di formulir, mis. "Nama lengkap" untuk SDM. */
  labelJudul: string;
  bidang: Bidang[];
  urut: 'baru' | 'nomor' | 'judul';
  /** Tingkat peran minimum untuk mengelola koleksi ini (bawaan: kontributor). */
  tingkat?: number;
  /** Hanya untuk tingkat yayasan (unit selalu "yayasan"). */
  hanyaYayasan?: boolean;
  /** Tidak pernah tampil di halaman publik (kotak masuk, pendaftar). */
  privat?: boolean;
  /** Bidang gambar yang menjadi sampul di ringkasan. */
  sampul?: string;
  /** Bidang yang diringkas untuk kartu dan meta description. */
  ringkasDari?: string;
  /** Tanpa kolom tanggal di formulir (mis. SDM). */
  tanpaTanggal?: boolean;
  /** Dibuat dan dikelola di portal, tetapi tidak pernah tampil di halaman publik (kwitansi, surat, kop). Tanpa pilihan status. */
  tanpaPublik?: boolean;
  /** Dokumen siap cetak: ukuran kertasnya (A4 mendatar / tegak) — portal menampilkan pratinjau langsung dan tombol cetak. */
  cetak?: 'a4l' | 'a4p';
  /** Bidang nomor yang diisi otomatis saat pertama disimpan bila dikosongkan (src/data/dokumen.ts nomorBerikut). */
  nomorOtomatis?: string;
  /** Kelompok menu portal (bawaan: Isi). */
  menu?: 'isi' | 'dokumen' | 'siswa';
}

export interface FotoGaleri { f: string; k?: string; ket?: string }

export interface Dok {
  id: string;
  kol: string;
  slug: string;
  /** Slug lembaga, atau "yayasan" untuk isi tingkat yayasan. */
  unit: string;
  status: Status;
  judul: string;
  /** YYYY-MM-DD (WIB). */
  tanggal: string;
  penulis: string;
  penulisNama: string;
  buat: number;
  ubah: number;
  d: Record<string, unknown>;
  /** Hasil render bidang Markdown — halaman publik tidak merender ulang. */
  html: Record<string, string>;
  ix: string[];
}

export interface IxMeta {
  j: string;
  u: string;
  s: Status;
  t: string;
  sl: string;
  g?: string;
  r?: string;
  x?: Record<string, string | number | boolean>;
}
export interface IxItem extends IxMeta { id: string }

export const dokKey = (kol: string, id: string) => `c/${kol}/${id}.json`;
const slugGuard = (kol: string, slug: string) => `u/slug/${kol}/${slug}`;
const ID_RE = /^[a-z]{2,6}_[0-9A-Z]{20}$/;
/** Kunci berkas di bucket media: 2026/11/<id>.<ext> (+ _k untuk versi kecil). */
export const BERKAS_RE = /^\d{4}\/\d{2}\/[0-9a-z]{16,40}(_k)?\.(jpg|png|webp|pdf)$/;

function urutKey(def: Koleksi, d: Dok): string {
  if (def.urut === 'nomor') return `${String(Math.max(0, Math.min(99_999, Math.round(Number(d.d.urut) || 0)))).padStart(5, '0')}-${invTs(d.buat)}`;
  if (def.urut === 'judul') return `${slugify(d.judul, 40) || 'x'}-${invTs(d.buat)}`;
  const hari = Date.parse(`${d.tanggal}T00:00:00Z`);
  return invTs((Number.isFinite(hari) ? hari : d.buat) + (d.buat % 86_400_000));
}

function meta(def: Koleksi, d: Dok): IxMeta {
  const m: IxMeta = { j: d.judul.slice(0, 140), u: d.unit, s: d.status, t: d.tanggal, sl: d.slug };
  const g = def.sampul ? d.d[def.sampul] : undefined;
  if (typeof g === 'string' && g) m.g = g;
  else if (def.sampul && Array.isArray(g) && g[0] && typeof (g[0] as FotoGaleri).f === 'string') m.g = (g[0] as FotoGaleri).k ?? (g[0] as FotoGaleri).f;
  const r = def.ringkasDari ? d.d[def.ringkasDari] : undefined;
  if (typeof r === 'string' && r) m.r = ringkas(polos(r), 150);
  const x: Record<string, string | number | boolean> = {};
  for (const b of def.bidang) {
    if (!b.indeks) continue;
    const v = d.d[b.k];
    if (typeof v === 'string' && v) x[b.k] = v.slice(0, 80);
    else if (typeof v === 'number' || typeof v === 'boolean') x[b.k] = v;
    else if (Array.isArray(v) && v.length) x[b.k] = v.filter((y) => typeof y === 'string').join('|').slice(0, 120);
  }
  if (Object.keys(x).length) m.x = x;
  return m;
}

/* ── membaca formulir ───────────────────────────────────────────────────── */

export interface HasilForm {
  d: Record<string, unknown>;
  galat: Record<string, string>;
}

/** Mengubah isian formulir (teks) menjadi nilai bidang yang sudah diperiksa. Tidak pernah melempar. */
export function bacaBidang(def: Koleksi, form: Record<string, unknown>, kelasUnit: string[] = []): HasilForm {
  const d: Record<string, unknown> = {};
  const galat: Record<string, string> = {};
  for (const b of def.bidang) {
    const mentah = form[b.k];
    const s = typeof mentah === 'string' ? mentah.replace(/\r\n?/g, '\n').trim() : '';
    const maks = b.maks ?? (b.jenis === 'markdown' ? 60_000 : b.jenis === 'paragraf' ? 2_000 : 300);
    let v: unknown;
    switch (b.jenis) {
      case 'angka': {
        if (s === '') break;
        const n = Number(s.replace(',', '.'));
        if (!Number.isFinite(n)) galat[b.k] = 'Harus berupa angka.';
        else v = n;
        break;
      }
      case 'tanggal':
        if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) galat[b.k] = 'Tanggal tidak sah.';
        else if (s) v = s;
        break;
      case 'waktu':
        if (s && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) galat[b.k] = 'Tanggal dan jam tidak sah.';
        else if (s) v = s;
        break;
      case 'url':
        if (s) {
          const u = /^https?:\/\//i.test(s) ? safeUrl(s) : null;
          if (!u || s.length > 500) galat[b.k] = 'Tautan harus diawali https:// atau http://.';
          else v = u;
        }
        break;
      case 'pilih':
        if (s && !(b.pilihan ?? []).some(([k]) => k === s)) galat[b.k] = 'Pilihan tidak dikenal.';
        else if (s) v = s;
        break;
      case 'gambar':
      case 'berkas':
        if (s && !BERKAS_RE.test(s)) galat[b.k] = 'Berkas tidak sah — unggah ulang.';
        else if (s) v = s;
        break;
      case 'galeri': {
        if (!s) break;
        try {
          const arr = JSON.parse(s) as unknown;
          if (!Array.isArray(arr)) throw new Error('bukan daftar');
          const foto: FotoGaleri[] = [];
          for (const it of arr.slice(0, 120)) {
            const o = it as FotoGaleri;
            if (!o || typeof o.f !== 'string' || !BERKAS_RE.test(o.f)) continue;
            foto.push({ f: o.f, ...(typeof o.k === 'string' && BERKAS_RE.test(o.k) ? { k: o.k } : {}), ...(typeof o.ket === 'string' && o.ket.trim() ? { ket: o.ket.trim().slice(0, 200) } : {}) });
          }
          if (foto.length) v = foto;
        } catch {
          galat[b.k] = 'Daftar foto tidak terbaca — muat ulang halaman.';
        }
        break;
      }
      case 'daftar': {
        const baris = s.split('\n').map((x) => x.trim().slice(0, 200)).filter(Boolean).slice(0, 60);
        if (baris.length) v = baris;
        break;
      }
      case 'kelas': {
        const pilih = (Array.isArray(mentah) ? mentah : s ? s.split('\n') : []).map((x) => String(x).trim()).filter((x) => kelasUnit.includes(x));
        if (pilih.length) v = [...new Set(pilih)];
        break;
      }
      case 'centang':
        v = s === '1' || s === 'on' || s === 'true';
        break;
      default:
        if (s.length > maks) galat[b.k] = `Paling banyak ${maks} huruf.`;
        else if (s) v = s;
    }
    if (v === undefined && b.wajib && !galat[b.k]) galat[b.k] = 'Wajib diisi.';
    if (v !== undefined) d[b.k] = v;
  }
  return { d, galat };
}

/* ── baca & tulis ───────────────────────────────────────────────────────── */

export async function ambil(store: Store, kol: string, id: string): Promise<Dok | null> {
  return ID_RE.test(id) ? store.get<Dok>(dokKey(kol, id)) : null;
}

export async function ambilSlug(store: Store, kol: string, slug: string): Promise<Dok | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const g = await store.get<{ id: string }>(slugGuard(kol, slug));
  return g ? ambil(store, kol, g.id) : null;
}

async function slugUnik(store: Store, kol: string, dasar: string, id: string): Promise<string> {
  const pangkal = slugify(dasar, 64) || 'tanpa-judul';
  for (let n = 1; n < 40; n += 1) {
    const s = n === 1 ? pangkal : `${pangkal}-${n}`;
    if (await store.createOnce(slugGuard(kol, s), { id })) return s;
    const punya = await store.get<{ id: string }>(slugGuard(kol, s));
    if (punya?.id === id) return s;
  }
  const s = `${pangkal}-${id.slice(-6).toLowerCase()}`;
  await store.createOnce(slugGuard(kol, s), { id });
  return s;
}

export interface Masukan {
  id?: string;
  /** Hanya isi awal: id tetap supaya penulisan ulang tidak menggandakan dokumen. */
  idBaru?: string;
  unit: string;
  status: Status;
  judul: string;
  tanggal?: string;
  d: Record<string, unknown>;
  penulis: string;
  penulisNama: string;
}

/** Membuat atau memperbarui dokumen berikut indeksnya. Slug dibuat sekali dari judul pertama dan tidak berubah lagi. */
export async function simpan(store: Store, def: Koleksi, m: Masukan, now = Date.now()): Promise<Dok> {
  const lama = m.id ? await ambil(store, def.id, m.id) : null;
  if (m.id && !lama) throw new Error('Dokumen tidak ditemukan.');
  const id = lama?.id ?? m.idBaru ?? newId(def.id.slice(0, 4).replace(/[^a-z]/g, 'x').padEnd(2, 'x'));
  const html: Record<string, string> = {};
  for (const b of def.bidang) if (b.jenis === 'markdown' && typeof m.d[b.k] === 'string') html[b.k] = renderMarkdown(m.d[b.k] as string);
  const dok: Dok = {
    id, kol: def.id, slug: lama?.slug ?? await slugUnik(store, def.id, m.judul, id),
    unit: def.hanyaYayasan ? 'yayasan' : m.unit, status: m.status, judul: m.judul.trim().slice(0, 160),
    tanggal: m.tanggal && /^\d{4}-\d{2}-\d{2}$/.test(m.tanggal) ? m.tanggal : lama?.tanggal ?? hariIni(now),
    penulis: lama?.penulis ?? m.penulis, penulisNama: lama?.penulisNama ?? m.penulisNama,
    buat: lama?.buat ?? now, ubah: now, d: m.d, html, ix: [],
  };
  const sort = urutKey(def, dok);
  const mt = meta(def, dok) as unknown as Record<string, unknown>;
  dok.ix = [`i/${def.id}/a/${sort}~${id}`, ...(dok.status === 'tayang' && !def.privat && !def.tanpaPublik ? [`i/${def.id}/t/${sort}~${id}`] : [])];
  await store.put(dokKey(def.id, id), dok);
  for (const k of dok.ix) await store.put(k, {}, mt);
  const usang = (lama?.ix ?? []).filter((k) => !dok.ix.includes(k));
  if (usang.length) await store.del(usang);
  return dok;
}

export async function hapus(store: Store, def: Koleksi, id: string): Promise<Dok | null> {
  const d = await ambil(store, def.id, id);
  if (!d) return null;
  await store.del([...d.ix, slugGuard(def.id, d.slug), dokKey(def.id, id)]);
  return d;
}

export interface OpsiDaftar {
  /** true = hanya yang tayang (halaman publik). */
  tayang?: boolean;
  unit?: string | string[];
  status?: Status;
  limit?: number;
  /** Saring tambahan pada ringkasan. */
  saring?: (it: IxItem) => boolean;
}

/** Daftar dari indeks (tanpa membaca tiap dokumen). Membaca paling banyak tiga halaman indeks (3.000 entri). */
export async function daftar(store: Store, kol: string, o: OpsiDaftar = {}): Promise<IxItem[]> {
  const prefix = `i/${kol}/${o.tayang ? 't' : 'a'}/`;
  const units = o.unit === undefined ? null : new Set(Array.isArray(o.unit) ? o.unit : [o.unit]);
  const limit = o.limit ?? 60;
  const out: IxItem[] = [];
  let cursor: string | undefined;
  for (let hal = 0; hal < 3 && out.length < limit; hal += 1) {
    const r = await store.list<IxMeta>(prefix, { limit: 1000, cursor });
    for (const x of r.items) {
      if (!x.meta || !x.meta.j) continue;
      const it: IxItem = { id: x.id, ...x.meta };
      if (units && !units.has(it.u)) continue;
      if (o.status && it.s !== o.status) continue;
      if (o.saring && !o.saring(it)) continue;
      out.push(it);
      if (out.length >= limit) break;
    }
    cursor = r.cursor;
    if (!cursor) break;
  }
  return out;
}
