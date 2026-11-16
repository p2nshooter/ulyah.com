/** Registri pustaka: katalog buku hasil impor (tanpa isi halaman) + pembantu rak. */
import type { Course } from '../data/model.ts';
import { COURSE_META } from '../data/model.ts';
import { BOOKS } from './catalog.gen.ts';
import type { BookCat, BookMeta } from './types.ts';

export { BOOKS };
export type { BookMeta, BookCat };

/** Halaman yang terbuka untuk semua orang (pratinjau); sisanya untuk member bahasa itu dan pengelola. */
export const PREVIEW_PAGES = 3;

const BY_ID = new Map(BOOKS.map((b) => [b.id, b]));
export const getBook = (id: string): BookMeta | undefined => BY_ID.get(id);

/** Urutan kategori di rak (dari fondasi ke latihan). */
export const CAT_ORDER: BookCat[] = ['kursus', 'grammatik', 'wortschatz', 'kalimat', 'video', 'arbeitsbuch', 'bacaan', 'kamus'];

export function levelOrder(course: Course): string[] {
  return COURSE_META[course].levels.map((l) => l.id);
}

export function booksOf(course: Course, level?: string): BookMeta[] {
  const order = levelOrder(course);
  return BOOKS.filter((b) => b.lang === course && (!level || b.level === level))
    .sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level) || CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || a.id.localeCompare(b.id));
}

export interface LibStats { books: number; pages: number; exercises: number; media: number; words: number; sentences: number }
export function libStats(course?: Course): LibStats {
  const list = course ? BOOKS.filter((b) => b.lang === course) : BOOKS;
  return {
    books: list.length,
    pages: list.reduce((n, b) => n + b.pages, 0),
    exercises: list.reduce((n, b) => n + b.exercises, 0),
    media: list.reduce((n, b) => n + b.media, 0),
    words: list.reduce((n, b) => n + b.words, 0),
    sentences: list.reduce((n, b) => n + b.sentences, 0),
  };
}

/** Sumber unik (untuk halaman kredit dan rak). */
export function sources(): { source: string; url: string; licence: string; licenceUrl: string; books: number }[] {
  const m = new Map<string, { source: string; url: string; licence: string; licenceUrl: string; books: number }>();
  for (const b of BOOKS) {
    const k = `${b.source}|${b.licence}`;
    const cur = m.get(k) ?? { source: b.source, url: b.sourceUrl.replace(/toc\.php\?k=\d+$/, ''), licence: b.licence, licenceUrl: b.licenceUrl, books: 0 };
    cur.books += 1;
    m.set(k, cur);
  }
  return [...m.values()];
}

/** Warna sampul: per bahasa + kategori (deterministik, tanpa gambar). */
const HUES: Record<Course, number> = { de: 28, en: 210, ja: 350 };
const CAT_SHIFT: Record<BookCat, number> = { kursus: 0, grammatik: 40, wortschatz: 120, kalimat: 170, video: 260, arbeitsbuch: 80, bacaan: 300, kamus: 200 };
export function coverStyle(b: BookMeta): string {
  const h = (HUES[b.lang] + CAT_SHIFT[b.cat]) % 360;
  return `--c1:hsl(${h} 82% 62%);--c2:hsl(${(h + 38) % 360} 86% 72%);--c3:hsl(${(h + 200) % 360} 70% 96%)`;
}
