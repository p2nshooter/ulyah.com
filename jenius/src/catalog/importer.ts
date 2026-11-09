/**
 * Impor otomatis buku terbuka ke R2 (cron tiap menit, sedikit demi sedikit, aman diulang):
 *  - Book Dash: metadata + teks + gambar disalin ke R2 (atribusi CC BY 4.0 lengkap);
 *  - Standard Ebooks: metadata + daftar isi, lalu bab demi bab (maks. `CHAPTERS_PER_TICK` per menit).
 * Buku baru tampil di katalog hanya setelah semua babnya tersimpan. Gagal = dicatat, dicoba lagi besok, tidak menghentikan
 * buku lain.
 */
import type { Env } from '../env.ts';
import { Store } from '../lib/store.ts';
import { allSources, sourceId, type BookDashSource, type SeSource, type Source } from './sources.ts';
import { parseOpf, parseToc, xhtmlToBlocks, isReadable, parseBookDashMeta, parseBookDashMd, countWords, type Block } from './parse.ts';
import { chapterKey, mediaKey, publishBook, type BookMeta, type ChapterInfo } from './books.ts';

const CHAPTERS_PER_TICK = 25;
const RETRY_AFTER_MS = 24 * 3600_000;
const UA = { 'user-agent': 'jenius.es-importer (+https://jenius.es/lisensi)' };

interface QueueDoc {
  status: 'working' | 'done' | 'failed';
  at: number;
  error?: string;
  /** Standard Ebooks: berkas bab yang tersisa dan bab yang sudah disimpan. */
  spine?: string[];
  titles?: Record<string, string>;
  next?: number;
  chapters?: ChapterInfo[];
  meta?: Partial<BookMeta>;
}

const qKey = (id: string) => `q/${id}.json`;

async function fetchText(url: string): Promise<string> {
  let last = '';
  for (let i = 0; i < 3; i += 1) {
    const r = await fetch(url, { headers: UA });
    if (r.ok) return r.text();
    last = `${r.status} ${url}`;
    if (r.status === 404) break;
    await new Promise((res) => setTimeout(res, 400 * (i + 1)));
  }
  throw new Error(`Gagal mengambil ${last}`);
}

/** Bab sangat panjang yang berisi banyak judul (mis. kumpulan puisi dalam satu berkas) dipecah per judul. */
export function splitLarge(blocks: Block[], title: string, maxWords = 9000): { title: string; blocks: Block[] }[] {
  const words = blocks.reduce((a, b) => a + ('text' in b && b.text ? countWords(b.text) : 0), 0);
  const heads = blocks.filter((b) => b.t === 'h').length;
  if (words <= maxWords || heads < 2) return [{ title, blocks }];
  const out: { title: string; blocks: Block[] }[] = [];
  let cur: { title: string; blocks: Block[] } | null = null;
  for (const b of blocks) {
    if (b.t === 'h') {
      if (cur && cur.blocks.length) out.push(cur);
      cur = { title: b.text, blocks: [] };
      continue;
    }
    if (!cur) cur = { title, blocks: [] };
    cur.blocks.push(b);
  }
  if (cur && cur.blocks.length) out.push(cur);
  return out;
}

const minutesOf = (words: number) => Math.max(1, Math.round(words / 150));

async function importBookDash(env: Env, store: Store, s: BookDashSource, id: string, base: string): Promise<void> {
  const root = `${base}/bookdash/bookdash-books/gh-pages`;
  let metas = await store.get<Record<string, { title: string; creator: string; description: string; date: string }>>('k/bookdash-meta.json');
  if (!metas) {
    metas = Object.fromEntries(parseBookDashMeta(await fetchText(`${root}/_data/meta.yml`)));
    await store.put('k/bookdash-meta.json', metas);
  }
  const m = metas[s.slug];
  const book = parseBookDashMd(await fetchText(`${root}/${s.slug}/en/index.md`));
  if (!book.pages.length) throw new Error('Buku bergambar tanpa halaman');
  const blocks: Block[] = [];
  for (const p of [{ src: 'cover.jpg', alt: '', text: '' }, ...book.pages]) {
    const key = mediaKey(id, p.src);
    if (!(await env.DATA.head(key))) {
      const r = await fetch(`${root}/${s.slug}/en/images/${p.src}`, { headers: UA });
      if (!r.ok) {
        if (p.src === 'cover.jpg') continue;
        throw new Error(`Gambar ${p.src}: ${r.status}`);
      }
      const buf = await r.arrayBuffer();
      if (buf.byteLength > 2_500_000) throw new Error(`Gambar ${p.src} terlalu besar`);
      await env.DATA.put(key, buf, { httpMetadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' } });
    }
    if (p.src !== 'cover.jpg') blocks.push({ t: 'img', src: p.src, alt: p.alt, text: p.text });
  }
  const words = blocks.reduce((a, b) => a + ('text' in b && b.text ? countWords(b.text) : 0), 0);
  const title = m?.title || book.title;
  await store.put(chapterKey(id, 1), { n: 1, title, blocks });
  const creator = m?.creator || 'Book Dash volunteers';
  await publishBook(store, {
    id,
    title,
    author: creator,
    lanes: s.lanes,
    shelf: s.shelf,
    lang: 'en',
    source: 'bookdash',
    sourceUrl: `https://bookdash.org/`,
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: `“${title}” oleh/by ${creator}, Book Dash (bookdash.org), CC BY 4.0. Teks dan gambar tidak diubah; suara dibacakan perangkat Anda. / Text and pictures unchanged; read aloud by your device.`,
    description: m?.description ?? '',
    subjects: ['Picture book'],
    chapters: [{ n: 1, title, words }],
    words,
    minutes: Math.max(1, Math.round(words / 90)),
    picture: true,
    cover: (await env.DATA.head(mediaKey(id, 'cover.jpg'))) ? 'cover.jpg' : blocks[0] && blocks[0].t === 'img' ? blocks[0].src : undefined,
    importedAt: Date.now(),
  });
}

async function stepStandardEbooks(store: Store, s: SeSource, id: string, q: QueueDoc, base: string): Promise<QueueDoc> {
  const root = `${base}/standardebooks/${s.repo}/master/src/epub`;
  if (!q.spine) {
    const opf = parseOpf(await fetchText(`${root}/content.opf`));
    const toc = parseToc(await fetchText(`${root}/toc.xhtml`));
    const spine = opf.spine.filter(isReadable);
    if (!spine.length) throw new Error('Tidak ada bab yang bisa dibaca');
    return {
      ...q,
      status: 'working',
      spine,
      titles: Object.fromEntries(spine.map((h) => [h, toc.get(h) ?? ''])),
      next: 0,
      chapters: [],
      meta: { title: opf.title, author: opf.author, translator: opf.translator, illustrator: opf.illustrator, lang: opf.lang, description: opf.description, subjects: opf.subjects },
    };
  }
  const spine = q.spine;
  const chapters = [...(q.chapters ?? [])];
  let next = q.next ?? 0;
  const end = Math.min(spine.length, next + CHAPTERS_PER_TICK);
  const files = await Promise.all(spine.slice(next, end).map((h) => fetchText(`${root}/${h}`)));
  for (let k = 0; k < files.length; k += 1) {
    const href = spine[next + k]!;
    const blocks = xhtmlToBlocks(files[k]!);
    const firstHead = blocks.find((b) => b.t === 'h');
    const baseTitle = q.titles?.[href] || (firstHead && 'text' in firstHead ? firstHead.text : '') || `${chapters.length + 1}`;
    for (const part of splitLarge(blocks, baseTitle)) {
      const words = part.blocks.reduce((a, b) => a + ('text' in b && b.text ? countWords(b.text) : 0), 0);
      if (words < 20) continue; // halaman kosong / hanya judul
      const n = chapters.length + 1;
      await store.put(chapterKey(id, n), { n, title: part.title, blocks: part.blocks });
      chapters.push({ n, title: part.title, words });
    }
  }
  next = end;
  if (next < spine.length) return { ...q, status: 'working', next, chapters, at: Date.now() };
  const meta = q.meta ?? {};
  const words = chapters.reduce((a, c) => a + c.words, 0);
  const people = [meta.author, meta.translator ? `terj./trans. ${meta.translator}` : ''].filter(Boolean).join(', ');
  await publishBook(store, {
    id,
    title: meta.title || id,
    author: meta.author || '',
    translator: meta.translator,
    illustrator: meta.illustrator,
    lanes: s.lanes,
    shelf: s.shelf,
    lang: meta.lang || 'en',
    source: 'standardebooks',
    sourceUrl: `https://github.com/standardebooks/${s.repo}`,
    license: 'Domain publik / Public domain (CC0)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: `${meta.title ?? id} — ${people}. Teks domain publik; edisi Standard Ebooks (standardebooks.org, CC0). / Public-domain text; Standard Ebooks edition (CC0).`,
    description: meta.description ?? '',
    subjects: meta.subjects ?? [],
    chapters,
    words,
    minutes: minutesOf(words),
    picture: false,
    importedAt: Date.now(),
  });
  return { status: 'done', at: Date.now() };
}

export interface ImportResult {
  worked: string | null;
  done: number;
  failed: number;
  total: number;
}

/** Satu langkah impor (cron tiap menit). `budgetMs` membatasi waktu dinding. */
export async function runImport(env: Env, opts: { budgetMs?: number; now?: number; sources?: Source[] } = {}): Promise<ImportResult> {
  const store = new Store(env.DATA);
  const now = opts.now ?? Date.now();
  const started = Date.now();
  const budget = opts.budgetMs ?? 20_000;
  const base = env.SOURCE_BASE || 'https://raw.githubusercontent.com';
  const sources = opts.sources ?? allSources(new Date(now).getUTCFullYear());
  // Status setiap buku dibaca dari ringkasan daftar (customMetadata), bukan dokumen per buku — murah setiap menit.
  const status = new Map<string, { status: QueueDoc['status']; at: number }>();
  let cursor: string | undefined;
  do {
    const r = await store.list<{ s?: QueueDoc['status']; at?: number }>('q/', { limit: 1000, cursor });
    for (const it of r.items) status.set(it.id, { status: it.meta.s ?? 'working', at: it.meta.at ?? 0 });
    cursor = r.cursor;
  } while (cursor);
  let worked: string | null = null;
  for (const s of sources) {
    if (Date.now() - started > budget) break;
    const id = sourceId(s);
    const st = status.get(id);
    if (st?.status === 'done') continue;
    if (st?.status === 'failed' && now - st.at < RETRY_AFTER_MS) continue;
    let q: QueueDoc = st?.status === 'working' ? ((await store.get<QueueDoc>(qKey(id))) ?? { status: 'working', at: 0 }) : { status: 'working', at: 0 };
    worked = id;
    try {
      if (s.kind === 'bookdash') {
        await importBookDash(env, store, s, id, base);
        q = { status: 'done', at: Date.now() };
      } else {
        q = await stepStandardEbooks(store, s, id, q.status === 'failed' ? { status: 'working', at: 0 } : q, base);
      }
    } catch (err) {
      q = { status: 'failed', at: Date.now(), error: String(err instanceof Error ? err.message : err).slice(0, 300) };
    }
    await store.put(qKey(id), q, { s: q.status, at: q.at });
    status.set(id, { status: q.status, at: q.at });
    // Satu buku per langkah, kecuali buku bergambar yang ringan (sampai anggaran waktu habis).
    if (s.kind !== 'bookdash' || q.status === 'failed') break;
  }
  const all = sources.map((s) => status.get(sourceId(s)));
  const res: ImportResult = { worked, done: all.filter((q) => q?.status === 'done').length, failed: all.filter((q) => q?.status === 'failed').length, total: sources.length };
  await store.put('k/import.json', { ...res, at: Date.now() });
  return res;
}
