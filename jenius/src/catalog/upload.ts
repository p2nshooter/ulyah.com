/**
 * Buku hasil konversi di luar Worker (GitHub Actions: BSE PDF → teks) diunggah lewat POST /api/ops/book berkunci ops.
 * Isi diperiksa ketat sebelum ditulis ke R2: id, sumber, lisensi tetap per sumber, jenjang/kelas, blok bab (jenis & panjang).
 */
import type { Store } from '../lib/store.ts';
import type { Block } from './parse.ts';
import { countWords } from './parse.ts';
import { isLevel, LEVELS, type LevelId, type ShelfId } from './lanes.ts';
import { chapterKey, publishBook, type BookMeta } from './books.ts';

const SOURCES = {
  bse: {
    license: 'BSE — hak cipta dibeli Departemen Pendidikan Nasional; boleh diunduh, digandakan, dicetak, dialihmediakan',
    licenseUrl: 'https://github.com/Hans5958/Indeks-BSE',
    idPattern: /^bse-\d{1,6}$/,
  },
} as const;

export interface UploadBook {
  id: string;
  source: keyof typeof SOURCES;
  title: string;
  author: string;
  level: LevelId;
  grade: number;
  subject: string;
  part?: number;
  year?: number;
  sourceUrl: string;
  description?: string;
  chapters: { title: string; blocks: Block[] }[];
}

const str = (v: unknown, max: number): string | null => (typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null);

export function validateUpload(body: unknown): { ok: true; book: UploadBook } | { ok: false; error: string } {
  const b = body as Record<string, unknown> | null;
  if (!b || typeof b !== 'object') return { ok: false, error: 'body' };
  const src = SOURCES[b.source as keyof typeof SOURCES];
  if (!src) return { ok: false, error: 'source' };
  const id = str(b.id, 40);
  if (!id || !src.idPattern.test(id)) return { ok: false, error: 'id' };
  const title = str(b.title, 200), author = str(b.author, 300) ?? 'Pusat Perbukuan', subject = str(b.subject, 120);
  if (!title || !subject) return { ok: false, error: 'title/subject' };
  if (!isLevel(b.level)) return { ok: false, error: 'level' };
  const grade = Number(b.grade);
  if (!Number.isInteger(grade) || (LEVELS[b.level].grades.length && !LEVELS[b.level].grades.includes(grade))) return { ok: false, error: 'grade' };
  const sourceUrl = str(b.sourceUrl, 400);
  if (!sourceUrl || !/^https:\/\/[\w.-]+\/[\w\-./%]*$/.test(sourceUrl)) return { ok: false, error: 'sourceUrl' };
  if (!Array.isArray(b.chapters) || b.chapters.length < 1 || b.chapters.length > 400) return { ok: false, error: 'chapters' };
  const chapters: UploadBook['chapters'] = [];
  for (const c of b.chapters as unknown[]) {
    const ch = c as Record<string, unknown>;
    const t = str(ch?.title, 160);
    if (!t || !Array.isArray(ch.blocks) || !ch.blocks.length || ch.blocks.length > 5000) return { ok: false, error: 'chapter' };
    const blocks: Block[] = [];
    for (const x of ch.blocks as unknown[]) {
      const k = x as Record<string, unknown>;
      const text = str(k?.text, 4000);
      if (!text || (k.t !== 'p' && k.t !== 'h' && k.t !== 'verse')) return { ok: false, error: 'block' };
      blocks.push({ t: k.t, text: text.replace(/[<>]/g, '') } as Block);
    }
    chapters.push({ title: t.replace(/[<>]/g, ''), blocks });
  }
  const part = b.part === undefined ? undefined : Number(b.part);
  const year = b.year === undefined ? undefined : Number(b.year);
  return {
    ok: true,
    book: {
      id, source: b.source as keyof typeof SOURCES, title: title.replace(/[<>]/g, ''), author: author.replace(/[<>]/g, ''), level: b.level, grade, subject: subject.replace(/[<>]/g, ''),
      part: Number.isInteger(part) ? part : undefined, year: Number.isInteger(year) ? year : undefined, sourceUrl,
      description: str(b.description, 600)?.replace(/[<>]/g, '') ?? undefined, chapters,
    },
  };
}

/** Rak tema dari nama mata pelajaran. */
export function shelfOf(subject: string): ShelfId {
  const s = subject.toLowerCase();
  if (/ipa|fisika|kimia|biologi|sains|alam|pertanian|tanaman|ternak|perikanan|kesehatan|keperawatan|farmasi/.test(s)) return 'sains';
  if (/sejarah|ips|sosial|geografi|ekonomi|sosiologi|kewarganegaraan|pkn|antropologi/.test(s)) return 'sejarah';
  if (/bahasa|sastra|english|inggris|arab|jerman|jepang|mandarin|perancis/.test(s)) return 'bahasa';
  if (/teknik|teknologi|komputer|informatika|tik|otomotif|listrik|elektronika|mesin|bangunan|jaringan|multimedia/.test(s)) return 'teknologi';
  if (/seni|musik|tari|rupa|kriya|budaya/.test(s)) return 'seni';
  if (/matematika|statistika/.test(s)) return 'filsafat';
  return 'diri';
}

/** Bab dulu, metadata dan indeks terakhir (buku tampil setelah semua babnya ada). */
export async function storeUpload(store: Store, u: UploadBook, now = Date.now()): Promise<BookMeta> {
  const src = SOURCES[u.source];
  const infos = [];
  let n = 0;
  for (const c of u.chapters) {
    n += 1;
    await store.put(chapterKey(u.id, n), { n, title: c.title, blocks: c.blocks });
    infos.push({ n, title: c.title, words: c.blocks.reduce((a, x) => a + countWords('text' in x && x.text ? x.text : ''), 0) });
  }
  const words = infos.reduce((a, c) => a + c.words, 0);
  const levelName = LEVELS[u.level].name[0];
  const meta: BookMeta = {
    id: u.id, title: u.title, author: u.author, lanes: ['pelajaran'], shelf: shelfOf(u.subject), lang: 'id', source: u.source,
    sourceUrl: u.sourceUrl, license: src.license, licenseUrl: src.licenseUrl,
    attribution: `„${u.title}“ oleh ${u.author}. Buku Sekolah Elektronik (BSE)${u.year ? ` ${u.year}` : ''}, Pusat Perbukuan, Departemen Pendidikan Nasional — hak cipta dibeli pemerintah dan boleh diunduh, digandakan, dicetak, dan dialihmediakan oleh masyarakat. Teks diubah ke format baca bersuara oleh jenius.es (tanpa mengubah isi).`,
    description: u.description ?? `Buku ${u.subject} untuk ${levelName}${u.grade ? ` kelas ${u.grade}` : ''}${u.part ? `, jilid ${u.part}` : ''} — dibacakan bab demi bab.`,
    subjects: [u.subject], chapters: infos, words, minutes: Math.max(1, Math.round(words / 150)), picture: false, importedAt: now,
    level: u.level, grade: u.grade, subject: u.subject, part: u.part, kids: LEVELS[u.level].kids,
  };
  await publishBook(store, meta);
  await store.put(`q/${u.id}.json`, { status: 'done', at: now }, { s: 'done', at: now });
  return meta;
}
