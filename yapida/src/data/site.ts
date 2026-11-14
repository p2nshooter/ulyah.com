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
import { SEED_UNITS, SEED_VERSION, seedHalaman, seedSitus, seedUnit } from '../seed.ts';

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

export async function listHalaman(store: Store): Promise<{ slug: string; judul: string; kaki: boolean }[]> {
  await siap(store);
  return memo(store, 'halaman', async () => {
    const r = await store.list<{ judul: string; kaki: boolean }>('c/halaman/', { limit: 200 });
    return r.items.map((x) => ({ slug: x.id, judul: x.meta.judul ?? x.id, kaki: Boolean(x.meta.kaki) }));
  });
}

export async function putHalaman(store: Store, h: Halaman): Promise<void> {
  await store.put(halamanKey(h.slug), h, { judul: h.judul, kaki: h.kaki });
  lupakan(store);
}
