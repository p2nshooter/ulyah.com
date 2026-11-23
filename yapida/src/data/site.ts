/**
 * Pengaturan situs, lembaga, dan halaman — semuanya dokumen R2:
 *   k/situs.json            identitas, legalitas, organ, sejarah, donasi
 *   c/unit/<slug>.json      satu lembaga (ringkasannya di customMetadata → daftar = satu operasi list)
 *   c/halaman/<slug>.json   halaman bebas (kebijakan privasi, syarat, PPDB, …)
 *   k/seed.json             versi isi awal yang sudah ditulis
 *
 * Bacaan yang dipakai hampir setiap halaman (situs + daftar lembaga) diingat 30 detik per isolate supaya satu
 * kunjungan tidak selalu berarti beberapa bacaan R2; simpanan dari portal langsung mengosongkan ingatan itu.
 */
import type { Store } from '../lib/store.ts';
import { unitRingkas, type Halaman, type Situs, type Unit, type UnitRingkas } from './model.ts';
import { SEED_SDM, SEED_UNITS, SEED_VERSION, TAMBALAN_KEPALA, TAMBALAN_NAMA, TAMBALAN_NSM, seedHalaman, seedSitus, seedUnit } from '../seed.ts';
import { ambil, daftar, simpan } from './koleksi.ts';
import { SDM } from './defs.ts';

const K_SITUS = 'k/situs.json';
const K_SEED = 'k/seed.json';
export const unitKey = (slug: string) => `c/unit/${slug}.json`;
export const halamanKey = (slug: string) => `c/halaman/${slug}.json`;

const TTL = 30_000;
const ingat = new WeakMap<object, Map<string, { at: number; v: unknown }>>();

function memo<T>(store: Store, key: string, fn: () => Promise<T>): Promise<T> {
  let m = ingat.get(store.b);
  if (!m) { m = new Map(); ingat.set(store.b, m); }
  const hit = m.get(key);
  if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.v as T);
  return fn().then((v) => { m!.set(key, { at: Date.now(), v }); return v; });
}

export function lupakan(store: Store): void {
  ingat.delete(store.b);
}

/**
 * Isi awal dipastikan ada SEBELUM bacaan apa pun — sekali per isolate. Tanpa ini, permintaan pertama ke bucket kosong
 * membaca daftar lembaga bersamaan dengan penulisan isi awal dan mengingat daftar kosong selama 30 detik.
 */
const sudahSiap = new WeakMap<object, Promise<void>>();
function siap(store: Store): Promise<void> {
  let p = sudahSiap.get(store.b);
  if (!p) {
    p = ensureSeed(store).then(() => undefined);
    p.catch(() => sudahSiap.delete(store.b));
    sudahSiap.set(store.b, p);
  }
  return p;
}

/** Menulis isi awal yang belum ada. Aman diulang dan aman bila dua permintaan menjalankannya bersamaan. */
export async function ensureSeed(store: Store, now = Date.now()): Promise<boolean> {
  const cur = await store.get<{ v: number }>(K_SEED);
  if (cur && cur.v >= SEED_VERSION) return false;
  await store.createOnce(K_SITUS, seedSitus(now));
  for (const u of SEED_UNITS) {
    const doc = seedUnit(u, now);
    await store.createOnce(unitKey(doc.slug), doc, unitRingkas(doc) as unknown as Record<string, unknown>);
  }
  for (const h of seedHalaman(now)) await store.createOnce(halamanKey(h.slug), h, { judul: h.judul, kaki: h.kaki });
  for (const o of SEED_SDM) {
    if (await ambil(store, 'sdm', o.id)) continue;
    await simpan(store, SDM, { idBaru: o.id, unit: o.unit, status: 'tayang', judul: o.nama, d: { golongan: o.golongan, jabatan: o.jabatan, urut: o.urut, ...(o.bio ? { bio: o.bio } : {}) }, penulis: 'sistem', penulisNama: 'Isi awal' }, now);
  }
  await tambalIsiAwal(store, now);
  await store.put(K_SEED, { v: SEED_VERSION, at: now });
  lupakan(store);
  return true;
}

export async function getSitus(store: Store): Promise<Situs> {
  await siap(store);
  return memo(store, 'situs', async () => {
    const s = await store.get<Situs>(K_SITUS);
    if (!s) throw new Error('Pengaturan situs tidak terbaca.');
    return s;
  });
}

export async function putSitus(store: Store, fn: (s: Situs) => Situs): Promise<Situs> {
  const next = await store.cas<Situs>(K_SITUS, (cur) => (cur ? { ...fn(cur), ubah: Date.now() } : null), 'Pengaturan situs');
  lupakan(store);
  if (!next) throw new Error('Pengaturan situs belum ada.');
  return next;
}

export interface UnitItem extends UnitRingkas {
  slug: string;
}

/** Semua lembaga (ringkasan), urut menurut `urut`. */
export async function listUnits(store: Store, semua = false): Promise<UnitItem[]> {
  await siap(store);
  const all = await memo(store, 'units', async () => {
    const r = await store.list<UnitRingkas>('c/unit/', { limit: 200 });
    return r.items.map((x) => ({ slug: x.id, ...x.meta })).filter((u) => u.nama).sort((a, b) => a.urut - b.urut);
  });
  return semua ? all : all.filter((u) => u.aktif);
}

export async function getUnit(store: Store, slug: string): Promise<Unit | null> {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  await siap(store);
  return store.get<Unit>(unitKey(slug));
}

export async function putUnit(store: Store, unit: Unit): Promise<void> {
  await store.put(unitKey(unit.slug), unit, unitRingkas(unit) as unknown as Record<string, unknown>);
  lupakan(store);
}

export async function getHalaman(store: Store, slug: string): Promise<Halaman | null> {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  await siap(store);
  return store.get<Halaman>(halamanKey(slug));
}

export async function listHalaman(store: Store): Promise<{ slug: string; judul: string; kaki: boolean; unit: string }[]> {
  await siap(store);
  return memo(store, 'halaman', async () => {
    const r = await store.list<{ judul: string; kaki: boolean; u?: string }>('c/halaman/', { limit: 1000 });
    return r.items.map((x) => ({ slug: x.id, judul: x.meta.judul ?? x.id, kaki: Boolean(x.meta.kaki), unit: x.meta.u || 'yayasan' }));
  });
}

export async function hapusHalaman(store: Store, slug: string): Promise<void> {
  await store.del(halamanKey(slug));
  lupakan(store);
}

export async function putHalaman(store: Store, h: Halaman): Promise<void> {
  await store.put(halamanKey(h.slug), h, { judul: h.judul, kaki: h.kaki, u: h.unit ?? 'yayasan' });
  lupakan(store);
}

/** Menerapkan TAMBALAN_* (src/seed.ts) ke data yang sudah ada — hanya nilai yang belum pernah diubah admin. */
async function tambalIsiAwal(store: Store, now: number): Promise<void> {
  const ganti = (n: string) => TAMBALAN_NAMA.find((t) => t.lama === n)?.baru ?? n;
  await store.cas<Situs>(K_SITUS, (s) => {
    if (!s) return null;
    const organ = s.organ.map((o) => ({ ...o, nama: ganti(o.nama) }));
    const pendiri = s.pendiri.map(ganti);
    if (JSON.stringify(organ) === JSON.stringify(s.organ) && JSON.stringify(pendiri) === JSON.stringify(s.pendiri)) return null;
    return { ...s, organ, pendiri, ubah: now };
  }, 'Pengaturan situs');
  for (const [slug, t] of Object.entries(TAMBALAN_KEPALA)) {
    const u = await store.get<Unit>(unitKey(slug));
    if (!u || (u.kepala?.nama && u.kepala.nama !== t.lama)) continue;
    const baru: Unit = { ...u, kepala: t.baru };
    await store.put(unitKey(slug), baru, unitRingkas(baru) as unknown as Record<string, unknown>);
  }
  for (const [slug, nsm] of Object.entries(TAMBALAN_NSM)) {
    const u = await store.get<Unit>(unitKey(slug));
    if (!u || u.nsm) continue;
    const baru: Unit = { ...u, nsm, ubah: now };
    await store.put(unitKey(slug), baru, unitRingkas(baru) as unknown as Record<string, unknown>);
  }
  for (const o of SEED_SDM) {
    const d = await ambil(store, 'sdm', o.id);
    if (!d || d.judul === o.nama || ganti(d.judul) !== o.nama) continue;
    await simpan(store, SDM, { id: d.id, unit: d.unit, status: d.status, judul: o.nama, tanggal: d.tanggal, d: d.d, penulis: d.penulis, penulisNama: d.penulisNama }, now);
  }
}

/* ── Informasi akbar di kepala situs (koleksi `info`) ─────────────────────────────────────────────────────────────── */

export interface InfoAkbar { slug: string; judul: string; jenis: string; tanggal: string; jam?: string; tempat?: string; tautan?: string }
const HARI = 86_400_000;
const tgl = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? Date.parse(`${v}T00:00:00+07:00`) : NaN);

/** Rentang tayang sebuah informasi: mulai (bawaan 14 hari sebelum acara) sampai akhir hari `sampai` (bawaan sehari sesudah acara). */
export function rentangInfo(x: { tanggal?: string; mulai?: unknown; sampai?: unknown }): [number, number] {
  const acara = tgl(x.tanggal);
  const mulai = Number.isFinite(tgl(x.mulai)) ? tgl(x.mulai) : Number.isFinite(acara) ? acara - 14 * HARI : -Infinity;
  const sampai = Number.isFinite(tgl(x.sampai)) ? tgl(x.sampai) + HARI : Number.isFinite(acara) ? acara + 2 * HARI : Infinity;
  return [mulai, sampai];
}

/** Informasi yang sedang tayang (paling banyak 5, acara terdekat dulu) — diingat 30 detik per isolate. */
export function infoAkbar(store: Store, now = Date.now()): Promise<InfoAkbar[]> {
  return memo(store, 'info-akbar', async () => {
    const items = (await daftar(store, 'info', { tayang: true, limit: 60 })).filter((it) => {
      const [a, b] = rentangInfo({ tanggal: it.t, mulai: it.x?.mulai, sampai: it.x?.sampai });
      return now >= a && now < b;
    });
    const docs = await Promise.all(items.slice(0, 5).map((it) => ambil(store, 'info', it.id)));
    return docs.filter((d): d is NonNullable<typeof d> => Boolean(d && d.status === 'tayang')).map((d) => ({
      slug: d.slug, judul: d.judul, jenis: String(d.d.jenis ?? 'lain'), tanggal: d.tanggal,
      ...(typeof d.d.jam === 'string' && d.d.jam ? { jam: d.d.jam } : {}),
      ...(typeof d.d.tempat === 'string' && d.d.tempat ? { tempat: d.d.tempat } : {}),
      ...(typeof d.d.tautan === 'string' && /^https:\/\//.test(d.d.tautan) ? { tautan: d.d.tautan } : {}),
    })).sort((a, b) => Math.abs(Date.parse(a.tanggal) - now) - Math.abs(Date.parse(b.tanggal) - now));
  });
}
