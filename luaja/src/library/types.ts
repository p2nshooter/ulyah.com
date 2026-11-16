/**
 * Pustaka interaktif (docs/LUAJA-BLUEPRINT.md §4, §6.2): buku berlisensi terbuka yang diurai menjadi halaman interaktif.
 * Isi halaman (JSON per buku) ada di `public/p/b/<id>.json` dan HANYA dilayani lewat Worker (lihat `assets.run_worker_first`)
 * agar pratinjau publik dan akses member bisa dibedakan. Katalog (tanpa isi halaman) dibangkitkan ke `catalog.gen.ts`.
 */
import type { Course } from '../data/model.ts';

export type BookCat = 'grammatik' | 'wortschatz' | 'video' | 'arbeitsbuch' | 'kalimat' | 'bacaan' | 'kursus' | 'kamus';

export interface BookMeta {
  id: string;
  lang: Course;
  level: string;
  cat: BookCat;
  title: string;
  sub: string;
  author: string;
  source: string;
  sourceUrl: string;
  licence: string;
  licenceUrl: string;
  /** Uraian singkat (Indonesia). */
  about: string;
  /** Daftar isi: [judul bab, indeks halaman]. */
  toc: [string, number][];
  pages: number;
  chapters: number;
  exercises: number;
  media: number;
  words: number;
  sentences: number;
}

/** Blok isi halaman. `l` = bahasa teks (untuk suara & ketuk kata); bawaan = bahasa buku. */
export type Block =
  | { k: 'h'; t: string }
  | { k: 'p'; t: string; l?: string }
  | { k: 'tip'; t: string; l?: string }
  | { k: 'ex'; t: string; g?: string }
  /** Kosakata: [kata, arti, bacaan?]. */
  | { k: 'voc'; a?: string | null; i: [string, string, string?][] }
  /** Kartu kanji: huruf, arti, on, kun, jumlah goresan, contoh [kata, bacaan, arti]. */
  | { k: 'kj'; c: string; m: string; on: string; kun: string; s: number; ex: [string, string, string][] }
  | { k: 'tbl'; r: string[][] }
  | { k: 'aud'; src: string; t: string }
  | { k: 'vid'; src: string; t: string; d?: string }
  | { k: 'sen'; t: string; id: string; n?: number }
  | { k: 'gap'; n?: number; s: string[]; a: string[]; alt?: string[][] }
  | { k: 'mc'; n?: number; q: string; o: string[]; a: number }
  /** Pilihan ganda dengar: naskah dibacakan (au), teksnya tampil setelah dijawab. */
  | { k: 'lmc'; n?: number; au: string; o: string[]; a: number };

export interface BookPage {
  t: string;
  b: Block[];
}

export interface BookDoc extends Omit<BookMeta, 'pages' | 'chapters' | 'exercises' | 'media' | 'words' | 'sentences'> {
  pages: BookPage[];
}
