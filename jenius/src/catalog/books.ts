/**
 * Katalog di R2 (tidak pernah D1):
 *  - `b/{id}.json`            metadata buku + daftar bab;
 *  - `b/{id}/{n}.json`        isi bab (blok);
 *  - `m/{id}/{file}`          gambar buku bergambar (salinan dari sumber, bukan hotlink);
 *  - `i/lane/{lane}/{key}~{id}` indeks per jalur dengan ringkasan di customMetadata (daftar tanpa membaca tiap buku);
 *  - `i/book/{id}`            semua buku (sitemap, halaman lisensi);
 *  - `q/{id}.json`            status impor per buku; `k/import.json` ringkasan impor.
 */
import type { Store } from '../lib/store.ts';
import type { Block } from './parse.ts';
import type { LaneId, LevelId, ShelfId } from './lanes.ts';

export interface ChapterInfo {
  n: number;
  title: string;
  words: number;
}

export interface BookMeta {
  id: string;
  title: string;
  author: string;
  translator?: string;
  illustrator?: string;
  lanes: LaneId[];
  shelf: ShelfId;
  lang: string;
  source: 'standardebooks' | 'bookdash' | 'bse' | 'openstax' | 'asp';
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  /** Kalimat atribusi lengkap (wajib untuk CC BY). */
  attribution: string;
  description: string;
  subjects: string[];
  chapters: ChapterInfo[];
  words: number;
  /** Menit dengar (±150 kata/menit). */
  minutes: number;
  picture: boolean;
  cover?: string;
  importedAt: number;
  /** Buku pelajaran: jenjang, kelas, mata pelajaran, jilid. */
  level?: LevelId;
  grade?: number;
  subject?: string;
  part?: number;
  /** Halaman anak (tanpa iklan) — bila tidak diisi, mengikuti jalurnya. */
  kids?: boolean;
}

export interface Chapter {
  n: number;
  title: string;
  blocks: Block[];
}

export interface LaneEntry {
  title: string;
  author: string;
  minutes: number;
  shelf: ShelfId;
  lang: string;
  picture: boolean;
  cover?: string;
  level?: LevelId;
  grade?: number;
  subject?: string;
}

export const bookKey = (id: string) => `b/${id}.json`;
export const chapterKey = (id: string, n: number) => `b/${id}/${n}.json`;
export const mediaKey = (id: string, file: string) => `m/${id}/${file}`;

/** Urutan dalam jalur: judul (abjad), tanpa awalan „The/A/An“. */
export function sortKey(title: string): string {
  return title.toLowerCase().replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9]+/g, '-').slice(0, 60);
}

export async function getBook(store: Store, id: string): Promise<BookMeta | null> {
  if (!/^[a-z0-9-]{1,90}$/.test(id)) return null;
  return store.get<BookMeta>(bookKey(id));
}

export async function getChapter(store: Store, id: string, n: number): Promise<Chapter | null> {
  if (!/^[a-z0-9-]{1,90}$/.test(id) || !Number.isInteger(n) || n < 1 || n > 5000) return null;
  return store.get<Chapter>(chapterKey(id, n));
}

export async function laneBooks(store: Store, lane: LaneId, limit = 200): Promise<{ id: string; meta: LaneEntry }[]> {
  const out: { id: string; meta: LaneEntry }[] = [];
  let cursor: string | undefined;
  do {
    const r = await store.list<LaneEntry>(`i/lane/${lane}/`, { limit: Math.min(1000, limit), cursor });
    out.push(...r.items.map((i) => ({ id: i.id, meta: i.meta })));
    cursor = r.cursor;
  } while (cursor && out.length < limit);
  return out.slice(0, limit);
}

export async function allBookIds(store: Store): Promise<string[]> {
  const out: string[] = [];
  for await (const k of store.keys('i/book/')) out.push(k.key.slice('i/book/'.length));
  return out;
}

/** Kunci indeks jalur sebuah buku (buku pelajaran berurutan per jenjang lalu kelas, baru judul). */
export function laneIndexKeys(meta: Pick<BookMeta, 'id' | 'title' | 'lanes' | 'level' | 'grade'>): string[] {
  const order = meta.level ? `${['sd', 'smp', 'sma', 'smk', 'pt'].indexOf(meta.level)}-${String(meta.grade ?? 0).padStart(2, '0')}-` : '';
  return meta.lanes.map((lane) => `i/lane/${lane}/${order}${sortKey(meta.title)}~${meta.id}`);
}

/** Menyimpan buku yang selesai diimpor: metadata dulu, lalu indeks (buku tampil setelah semua babnya ada). */
export async function publishBook(store: Store, meta: BookMeta): Promise<void> {
  const summary: LaneEntry = { title: meta.title, author: meta.author, minutes: meta.minutes, shelf: meta.shelf, lang: meta.lang, picture: meta.picture, cover: meta.cover, level: meta.level, grade: meta.grade, subject: meta.subject };
  // Unggah ulang (judul/kelas berubah): entri indeks lama dihapus agar buku tidak tampil dua kali.
  const old = await store.get<BookMeta>(bookKey(meta.id));
  await store.put(bookKey(meta.id), meta);
  const keys = laneIndexKeys(meta);
  if (old) {
    const stale = laneIndexKeys(old).filter((k) => !keys.includes(k));
    if (stale.length) await store.del(stale);
  }
  for (const k of keys) await store.put(k, {}, summary as unknown as Record<string, unknown>);
  await store.put(`i/book/${meta.id}`, {}, { title: meta.title, lanes: meta.lanes.join(',') });
}
