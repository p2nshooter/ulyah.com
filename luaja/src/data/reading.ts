/**
 * Progres membaca member di pustaka (R2): satu dokumen per member, ditulis saat berpindah halaman (dibatasi di klien,
 * paling sering tiap beberapa detik) — bukan kunci panas bersama. Menyimpan halaman terakhir, halaman yang sudah dibaca,
 * skor latihan per buku, XP dan runtun harian.
 */
import type { Store } from '../lib/store.ts';

export interface BookProgress { page: number; seen: number[]; ok: number; tried: number; at: number }
export interface Reading {
  books: Record<string, BookProgress>;
  /** XP per tanggal (YYYY-MM-DD, WIB). */
  days: Record<string, number>;
  xp: number;
  last?: string;
}

export const readingKey = (uid: string) => `c/reading/${uid}.json`;
export const getReading = async (store: Store, uid: string): Promise<Reading> => (await store.get<Reading>(readingKey(uid))) ?? { books: {}, days: {}, xp: 0 };

export const dayKey = (ms = Date.now()) => new Date(ms + 7 * 3600_000).toISOString().slice(0, 10);

/** Runtun hari berturut-turut (hingga hari ini atau kemarin). */
export function streak(r: Reading, now = Date.now()): number {
  let n = 0;
  for (let d = 0; d < 400; d++) {
    const k = dayKey(now - d * 86_400_000);
    if (r.days[k]) n++;
    else if (d > 0) break;
  }
  return n;
}

export interface ReadEvent { book: string; page: number; pages: number; ok?: number; tried?: number }

/** Catat satu peristiwa membaca. XP: +2 per halaman baru, +3 per jawaban benar baru (dibatasi agar tidak bisa dipompa). */
export async function recordReading(store: Store, uid: string, ev: ReadEvent): Promise<Reading> {
  const r = await store.cas<Reading>(readingKey(uid), (cur) => {
    const x: Reading = cur ?? { books: {}, days: {}, xp: 0 };
    const b = x.books[ev.book] ?? { page: 0, seen: [], ok: 0, tried: 0, at: 0 };
    let gain = 0;
    const page = Math.max(0, Math.min(ev.pages - 1, Math.floor(ev.page)));
    if (!b.seen.includes(page)) {
      b.seen.push(page);
      gain += 2;
    }
    b.page = page;
    if (typeof ev.ok === 'number' && typeof ev.tried === 'number' && ev.tried >= 0 && ev.ok >= 0 && ev.ok <= ev.tried) {
      const okDelta = Math.max(0, Math.min(ev.ok, 200) - b.ok);
      gain += Math.min(okDelta, 20) * 3;
      b.ok = Math.max(b.ok, Math.min(ev.ok, 200));
      b.tried = Math.max(b.tried, Math.min(ev.tried, 400));
    }
    b.at = Date.now();
    if (b.seen.length > 5000) b.seen = b.seen.slice(-5000);
    x.books[ev.book] = b;
    x.xp += gain;
    const dk = dayKey();
    x.days[dk] = (x.days[dk] ?? 0) + gain;
    const keys = Object.keys(x.days).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - 400))) delete x.days[k];
    x.last = ev.book;
    return x;
  }, 'Progres membaca');
  return r ?? { books: {}, days: {}, xp: 0 };
}
