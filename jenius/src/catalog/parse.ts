/**
 * Pengurai sumber terbuka (fungsi murni, diuji dengan berkas asli di test/fixtures):
 *  - Standard Ebooks: content.opf (metadata + urutan bab), toc.xhtml (judul bab), text/*.xhtml (isi bab);
 *  - Book Dash: _data/meta.yml (judul, pencipta, deskripsi, lisensi) dan {slug}/en/index.md (gambar + teks per halaman).
 */

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'verse'; text: string }
  | { t: 'img'; src: string; alt: string; text?: string };

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}

/** Teks bersih: tanpa tag, entitas diurai, tanda khusus tata letak (word joiner, hair space, soft hyphen) dibuang. */
export function cleanText(htmlFrag: string): string {
  // Baris baru di sumber hanya format; baris sajak ditandai <br/>.
  return decodeEntities(htmlFrag.replace(/\s+/g, ' ').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
    .replace(/[⁠­​]/g, '')
    .replace(/[   ]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

export const countWords = (s: string): number => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;

/* ── Standard Ebooks ─────────────────────────────────────────────────── */

export interface OpfMeta {
  title: string;
  author: string;
  translator?: string;
  illustrator?: string;
  lang: string;
  description: string;
  subjects: string[];
  /** Berkas teks sesuai urutan baca (`text/chapter-1.xhtml`). */
  spine: string[];
}

function tagText(xml: string, re: RegExp): string | undefined {
  const m = re.exec(xml);
  return m ? cleanText(decodeEntities(m[1]!)) : undefined;
}

export function parseOpf(xml: string): OpfMeta {
  const title = tagText(xml, /<dc:title id="title">([\s\S]*?)<\/dc:title>/) ?? tagText(xml, /<dc:title[^>]*>([\s\S]*?)<\/dc:title>/) ?? '';
  const creators = [...xml.matchAll(/<dc:creator id="([^"]+)">([\s\S]*?)<\/dc:creator>/g)].map((m) => ({ id: m[1]!, name: cleanText(m[2]!) }));
  const contributors = [...xml.matchAll(/<dc:contributor id="([^"]+)">([\s\S]*?)<\/dc:contributor>/g)].map((m) => ({ id: m[1]!, name: cleanText(m[2]!) }));
  const roleOf = (id: string) => [...xml.matchAll(new RegExp(`<meta property="role" refines="#${id}"[^>]*>([a-z]+)</meta>`, 'g'))].map((m) => m[1]);
  const authors = creators.filter((c) => roleOf(c.id).includes('aut') || c.id.startsWith('author')).map((c) => c.name);
  const translators = [...creators, ...contributors].filter((c) => roleOf(c.id).includes('trl') || c.id.startsWith('translator')).map((c) => c.name);
  const illustrators = [...creators, ...contributors].filter((c) => roleOf(c.id).includes('ill') || c.id.startsWith('illustrator')).map((c) => c.name);
  const longDesc = /<meta id="long-description" property="se:long-description"[^>]*>([\s\S]*?)<\/meta>/.exec(xml)?.[1];
  const dcDesc = /<dc:description[^>]*>([\s\S]*?)<\/dc:description>/.exec(xml)?.[1];
  // Deskripsi disimpan sebagai HTML yang di-escape: urai dua kali (entitas → tag → teks).
  const description = cleanText(decodeEntities(dcDesc ?? '')) || cleanText(decodeEntities(longDesc ?? ''));
  const subjects = [...xml.matchAll(/<dc:subject[^>]*>([\s\S]*?)<\/dc:subject>/g)].map((m) => cleanText(m[1]!)).filter(Boolean);
  const lang = (tagText(xml, /<dc:language>([\s\S]*?)<\/dc:language>/) ?? 'en').slice(0, 10);
  const manifest = new Map([...xml.matchAll(/<item\b([^>]*)\/?>/g)].map((m) => {
    const a = m[1]!;
    return [/\bid="([^"]+)"/.exec(a)?.[1] ?? '', /\bhref="([^"]+)"/.exec(a)?.[1] ?? ''] as const;
  }));
  const spine = [...xml.matchAll(/<itemref\b[^>]*idref="([^"]+)"/g)].map((m) => manifest.get(m[1]!) ?? '').filter((h) => h.endsWith('.xhtml'));
  return {
    title,
    author: authors.join(', ') || creators.map((c) => c.name).join(', '),
    translator: translators.join(', ') || undefined,
    illustrator: illustrators.join(', ') || undefined,
    lang,
    description,
    subjects,
    spine,
  };
}

/** Judul bab dari toc.xhtml (href → label), mis. „I: Down the Rabbit-Hole“. */
export function parseToc(xml: string): Map<string, string> {
  const nav = /<nav[^>]*epub:type="toc"[^>]*>([\s\S]*?)<\/nav>/.exec(xml)?.[1] ?? xml;
  const out = new Map<string, string>();
  for (const m of nav.matchAll(/<a href="([^"#]+)(?:#[^"]*)?"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = m[1]!;
    if (!out.has(href)) out.set(href, cleanText(m[2]!));
  }
  return out;
}

/** Bagian depan/belakang yang bukan isi bacaan. */
const SKIP = /^text\/(titlepage|imprint|halftitlepage|colophon|uncopyright|toc|loi|endnotes|frontispiece|dedication|epigraph|copyright|acknowledg|index|glossary)/;
export const isReadable = (href: string): boolean => !SKIP.test(href);

/** Isi satu berkas bab → blok paragraf/judul/sajak. Gambar, catatan kaki, dan tabel dilewati. */
export function xhtmlToBlocks(xhtml: string): Block[] {
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(xhtml)?.[1] ?? xhtml;
  const cleaned = body
    .replace(/<figure[\s\S]*?<\/figure>/g, '')
    .replace(/<table[\s\S]*?<\/table>/g, '')
    .replace(/<a [^>]*epub:type="noteref"[^>]*>[\s\S]*?<\/a>/g, '')
    .replace(/<hgroup[\s\S]*?<\/hgroup>/g, '')
    .replace(/<header[\s\S]*?<\/header>/g, '');
  const out: Block[] = [];
  const re = /<(h[2-6]|p)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  for (const m of cleaned.matchAll(re)) {
    const tag = m[1]!;
    const attrs = m[2] ?? '';
    const inner = m[3] ?? '';
    const text = cleanText(inner);
    if (!text) continue;
    if (tag !== 'p') {
      out.push({ t: 'h', text });
      continue;
    }
    // Baris sajak: <span>…</span><br/> di dalam blockquote/poem → pertahankan baris.
    const verse = /<br\s*\/?>/.test(inner) || /z3998:(poem|verse|song)/.test(attrs);
    out.push(verse ? { t: 'verse', text } : { t: 'p', text });
  }
  return out;
}

/* ── Book Dash ───────────────────────────────────────────────────────── */

export interface BookDashMeta {
  title: string;
  creator: string;
  description: string;
  date: string;
  translator?: string;
}

/** Bagian `titles:` dari _data/meta.yml (YAML sederhana dua tingkat; komentar & baris kosong diabaikan). */
export function parseBookDashMeta(yml: string): Map<string, BookDashMeta> {
  const out = new Map<string, BookDashMeta>();
  const start = yml.indexOf('\ntitles:');
  if (start < 0) return out;
  let cur: { slug: string; m: Record<string, string> } | null = null;
  const flush = () => {
    if (cur) out.set(cur.slug, { title: cur.m.title ?? cur.slug, creator: cur.m.creator ?? '', description: cur.m.description ?? '', date: cur.m.date ?? '', translator: cur.m.translator || undefined });
  };
  for (const line of yml.slice(start + 8).split('\n')) {
    if (/^\S/.test(line) && !line.startsWith('#')) break; // kunci tingkat atas berikutnya
    const slug = /^ {2}([a-z0-9-]+):\s*$/.exec(line);
    if (slug) {
      flush();
      cur = { slug: slug[1]!, m: {} };
      continue;
    }
    const kv = /^ {4}([a-z-]+):\s*"?(.*?)"?\s*(?:#.*)?$/.exec(line);
    if (kv && cur && !(kv[1]! in cur.m)) cur.m[kv[1]!] = kv[2]!.replace(/\\"/g, '"');
  }
  flush();
  return out;
}

/** index.md Book Dash → halaman bergambar: setiap gambar memulai halaman baru, teks di bawahnya ikut halaman itu. */
export function parseBookDashMd(md: string): { title: string; pages: { src: string; alt: string; text: string }[] } {
  const body = md.replace(/^---[\s\S]*?---\s*/, '');
  const title = /^#\s+(.+)$/m.exec(body)?.[1]?.trim() ?? '';
  const pages: { src: string; alt: string; text: string }[] = [];
  let cur: { src: string; alt: string; text: string[] } | null = null;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    const img = /^!\[([^\]]*)\]\((?:\{\{[^}]*\}\}\/)?(?:images\/)?([\w.-]+\.(?:jpg|jpeg|png))\)/i.exec(line);
    if (img) {
      if (cur) pages.push({ src: cur.src, alt: cur.alt, text: cur.text.join('\n').trim() });
      cur = { src: img[2]!, alt: img[1]!.trim(), text: [] };
      continue;
    }
    if (!cur || !line || line.startsWith('#') || line.startsWith('{:')) continue;
    cur.text.push(cleanText(line.replace(/\*\*?|__?/g, '')));
  }
  if (cur) pages.push({ src: cur.src, alt: cur.alt, text: cur.text.join('\n').trim() });
  return { title, pages };
}

/* ── halaman baca ─────────────────────────────────────────────────────── */

/** Memecah blok bab menjadi halaman ±`target` kata; paragraf sangat panjang dipecah di batas kalimat. */
export function paginate(blocks: Block[], target: number): Block[][] {
  const pages: Block[][] = [];
  let cur: Block[] = [];
  let words = 0;
  const push = () => {
    if (cur.length) pages.push(cur);
    cur = [];
    words = 0;
  };
  for (const b of blocks) {
    if (b.t === 'img') {
      push();
      pages.push([b]);
      continue;
    }
    const w = countWords(b.text);
    if (b.t === 'p' && w > target * 1.4) {
      const sentences = b.text.match(/[^.!?…]+[.!?…]+["”’)]*\s*|[^.!?…]+$/g) ?? [b.text];
      let part = '';
      for (const s of sentences) {
        if (countWords(part + s) > target && part) {
          if (words + countWords(part) > target) push();
          cur.push({ t: 'p', text: part.trim() });
          words += countWords(part);
          push();
          part = '';
        }
        part += s;
      }
      if (part.trim()) {
        cur.push({ t: 'p', text: part.trim() });
        words += countWords(part);
      }
      continue;
    }
    if (words > 0 && words + w > target) push();
    cur.push(b);
    words += w;
    if (b.t === 'h' && cur.length === 1) words += 0;
  }
  push();
  return pages;
}
