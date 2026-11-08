/**
 * Markdown kecil & aman untuk artikel dan halaman wajib: judul (##, ###), paragraf, daftar (- / 1.), kutipan (>),
 * **tebal**, *miring*, [tautan](url) — semua teks di-escape lebih dulu; tautan hanya http(s), / atau #.
 * Mengembalikan HTML dan daftar isi (judul ##) untuk navigasi artikel.
 */
import { esc } from './html.ts';

export interface Toc {
  id: string;
  text: string;
}

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    const u = url.replace(/&amp;/g, '&');
    if (!/^(https?:\/\/|\/|#)/.test(u)) return text;
    const ext = /^https?:\/\//.test(u);
    return `<a href="${esc(u)}"${ext ? ' rel="noopener" target="_blank"' : ''}>${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return out;
}

export function renderMarkdown(md: string): { html: string; toc: Toc[]; words: number } {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  const toc: Toc[] = [];
  const used = new Set<string>();
  let para: string[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let quote: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.type}>`);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = /^(#{2,3})\s+(.+)$/.exec(line);
    if (h) {
      flushAll();
      const level = h[1]!.length;
      const text = h[2]!.trim();
      let id = slugify(text) || `bagian-${toc.length + 1}`;
      while (used.has(id)) id += '-2';
      used.add(id);
      if (level === 2) toc.push({ id, text });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }
    const ul = /^[-*]\s+(.+)$/.exec(line);
    const ol = /^\d+[.)]\s+(.+)$/.exec(line);
    if (ul || ol) {
      flushPara();
      flushQuote();
      const type = ul ? 'ul' : 'ol';
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ul ?? ol)![1]!);
      continue;
    }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) {
      flushPara();
      flushList();
      quote.push(q[1]!);
      continue;
    }
    if (!line.trim()) {
      flushAll();
      continue;
    }
    flushList();
    flushQuote();
    para.push(line.trim());
  }
  flushAll();
  const words = (md.replace(/[#>*\-[\]()]/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
  return { html: out.join('\n'), toc, words };
}
