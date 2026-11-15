/**
 * Mengambil sumber buku terbuka dari GitHub ke yapida/pustaka/ (dijalankan ulang bila sumber diperbarui):
 *  - Book Dash (github.com/bookdash/bookdash-books, CC BY 4.0): teks + daftar gambar 54 buku cerita bergambar anak
 *    berbahasa Inggris. Gambarnya TIDAK disalin ke repo — Worker menyalinnya ke R2 saat pertama dibuka.
 *  Buku berbentuk PDF tidak dipakai (pemilik, 15 Nov 2026: „Perpustakaan digital nya ga usah bisa di download dan jgn
 *  dalam bentuk PDF“) — semua buku dibaca sebagai halaman interaktif.
 *   node scripts/ambil-sumber.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'pustaka');
const RAW = 'https://raw.githubusercontent.com';
const ambil = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.text(); };

/* ── Book Dash ── */
const meta = await ambil(`${RAW}/bookdash/bookdash-books/gh-pages/_data/meta.yml`);
const judul = [];
let cur = null;
for (const line of meta.split('\n')) {
  const m = /^ {2}([a-z0-9-]+):\s*$/.exec(line);
  if (m) { cur = { slug: m[1] }; judul.push(cur); continue; }
  const f = /^ {4}(title|subtitle|creator|description|date|language|subject):\s*"(.*)"/.exec(line);
  if (cur && f) cur[f[1]] = f[2];
}
const bookdash = [];
for (const b of judul.filter((x) => x.title && (x.language ?? 'en') === 'en')) {
  try {
    const md = await ambil(`${RAW}/bookdash/bookdash-books/gh-pages/${b.slug}/en/index.md`);
    const halaman = [];
    for (const blok of md.replace(/^---[\s\S]*?---\s*/, '').split(/\n\s*\n/)) {
      const t = blok.trim();
      if (!t || t.startsWith('# ')) continue;
      const g = /^!\[([^\]]*)\]\(\{\{\s*site\.image-set\s*\}\}\/([\w.-]+)\)/.exec(t);
      if (g) { halaman.push({ img: g[2], alt: g[1], teks: [] }); continue; }
      if (/^[{<]/.test(t)) continue;
      const bersih = t.replace(/\s+/g, ' ').replace(/\*\*?/g, '').trim();
      if (!bersih) continue;
      if (!halaman.length) halaman.push({ img: '', alt: '', teks: [] });
      halaman.at(-1).teks.push(bersih);
    }
    if (halaman.length >= 3) bookdash.push({ ...b, halaman });
  } catch (e) { console.warn('lewati', b.slug, e.message); }
}
writeFileSync(join(OUT, 'bookdash.json'), JSON.stringify({ sumber: 'https://github.com/bookdash/bookdash-books', lisensi: 'CC BY 4.0', buku: bookdash }));
console.log(`Book Dash: ${bookdash.length} buku`);
