/**
 * Markdown aman untuk isi yang ditulis admin: SEMUA HTML di-escape, hanya sintaks di bawah yang dikenali, dan tautan
 * dibatasi ke http(s), mailto, tel, serta jalur situs sendiri. Hasilnya disimpan bersama dokumen saat disimpan, jadi
 * halaman publik tidak merender ulang (hemat CPU Worker).
 *
 * Bahasa per blok (dipakai pembaca bersuara agar pelafalan sesuai bahasanya):
 *   - paragraf beraksara Arab otomatis menjadi lang="ar" dir="rtl";
 *   - awalan `::ar `, `::en `, `::id ` memaksa bahasa satu paragraf;
 *   - potongan Arab di tengah kalimat Latin dibungkus <span lang="ar">.
 */
import { esc } from './html.ts';
import { arab, slugify } from './text.ts';

const AR_RUN = /([؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿\s،؛؟.,:;!?()«»ـ-]*[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]|[؀-ۿﭐ-﷿ﹰ-﻿])/g;

export function safeUrl(u: string): string | null {
  const t = u.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(t)) return t;
  if (/^\/(?!\/)/.test(t) || t.startsWith('#')) return t;
  return null;
}

function inline(s: string, wrapArab: boolean): string {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const href = safeUrl(url.replace(/&amp;/g, '&'));
    if (!href) return label;
    const ext = /^https?:/i.test(href);
    return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener nofollow"' : ''}>${label}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  if (wrapArab) t = t.replace(AR_RUN, '<span class="arab-in" lang="ar" dir="rtl">$1</span>');
  return t;
}

function langOf(text: string): { lang: string | null; body: string } {
  const m = text.match(/^::(ar|en|id)\s+/);
  if (m) return { lang: m[1]!, body: text.slice(m[0].length) };
  return { lang: arab(text) ? 'ar' : null, body: text };
}

function open(tag: string, lang: string | null, cls = ''): string {
  const c = lang === 'ar' ? `arab${cls ? ` ${cls}` : ''}` : cls;
  return `<${tag}${c ? ` class="${c}"` : ''}${lang ? ` lang="${lang}"` : ''}${lang === 'ar' ? ' dir="rtl"' : ''}>`;
}

function imageLine(line: string): string | null {
  const m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
  if (!m) return null;
  const src = safeUrl(m[2]!);
  if (!src || /^(mailto|tel):/i.test(src)) return null;
  const alt = esc(m[1]!);
  return `<figure><img src="${esc(src)}" alt="${alt}" loading="lazy" decoding="async">${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
}

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  const used = new Set<string>();
  let i = 0;
  const blank = (l: string | undefined) => l === undefined || l.trim() === '';
  while (i < lines.length) {
    const line = lines[i]!;
    if (blank(line)) { i += 1; continue; }
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      const level = Math.min(4, Math.max(2, h[1]!.length));
      const { lang, body } = langOf(h[2]!.trim());
      let id = slugify(body, 50) || 'bagian';
      while (used.has(id)) id += '-2';
      used.add(id);
      out.push(`${open(`h${level}`, lang).replace('>', ` id="${id}">`)}${inline(body, lang !== 'ar')}</h${level}>`);
      i += 1; continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { out.push('<hr>'); i += 1; continue; }
    const img = imageLine(line.trim());
    if (img) { out.push(img); i += 1; continue; }
    if (line.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('>')) { buf.push(lines[i]!.replace(/^>\s?/, '')); i += 1; }
      const { lang, body } = langOf(buf.join(' ').trim());
      out.push(`<blockquote>${open('p', lang)}${inline(body, lang !== 'ar')}</p></blockquote>`);
      continue;
    }
    if (/^\s*([-*]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+[.)])\s+/.test(lines[i]!)) {
        let item = lines[i]!.replace(/^\s*([-*]|\d+[.)])\s+/, '');
        i += 1;
        while (i < lines.length && !blank(lines[i]) && /^\s{2,}\S/.test(lines[i]!) && !/^\s*([-*]|\d+[.)])\s+/.test(lines[i]!)) { item += ` ${lines[i]!.trim()}`; i += 1; }
        const { lang, body } = langOf(item);
        items.push(`${open('li', lang)}${inline(body, lang !== 'ar')}</li>`);
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1]!)) {
      const row = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = row(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i]!.trim().startsWith('|')) { body.push(row(lines[i]!)); i += 1; }
      const cell = (tag: string, c: string) => { const { lang, body: b } = langOf(c); return `${open(tag, lang)}${inline(b, lang !== 'ar')}</${tag}>`; };
      out.push(`<div class="tabel"><table><thead><tr>${head.map((c) => cell('th', c)).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => cell('td', c)).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && !blank(lines[i]) && !/^(#{1,4})\s+/.test(lines[i]!) && !lines[i]!.startsWith('>') && !/^\s*([-*]|\d+[.)])\s+/.test(lines[i]!) && !/^(-{3,}|\*{3,})$/.test(lines[i]!.trim())) {
      // Baris yang memulai blok bahasa baru memutus paragraf.
      if (buf.length && /^::(ar|en|id)\s+/.test(lines[i]!)) break;
      buf.push(lines[i]!.trim());
      i += 1;
    }
    const { lang, body } = langOf(buf.join(' '));
    out.push(`${open('p', lang)}${inline(body, lang !== 'ar')}</p>`);
  }
  return out.join('\n');
}
