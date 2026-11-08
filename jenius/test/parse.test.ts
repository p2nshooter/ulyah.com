/* Pengurai sumber terbuka jenius.es dengan berkas asli (Standard Ebooks, Book Dash). Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseOpf, parseToc, xhtmlToBlocks, isReadable, parseBookDashMeta, parseBookDashMd, paginate, countWords, cleanText } from '../src/catalog/parse.ts';
import { SE_SOURCES, allSources, pdIndonesia, sourceId } from '../src/catalog/sources.ts';
import { LANES } from '../src/catalog/lanes.ts';

const fx = (f: string) => fs.readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8');

test('content.opf: judul, penulis, ilustrator, bahasa, deskripsi tanpa tag, urutan bab', () => {
  const m = parseOpf(fx('alice.opf'));
  assert.equal(m.title, 'Alice’s Adventures in Wonderland');
  assert.equal(m.author, 'Lewis Carroll');
  assert.equal(m.illustrator, 'John Tenniel');
  assert.equal(m.lang, 'en-GB');
  assert.ok(m.description.startsWith('Everyone’s familiar with Lewis Carroll’s famous children’s classic') && !/[<>]/.test(m.description));
  const readable = m.spine.filter(isReadable);
  assert.equal(readable[0], 'text/chapter-1.xhtml');
  assert.equal(readable.filter((h) => h.startsWith('text/chapter-')).length, 12);
  assert.ok(!readable.some((h) => /imprint|colophon|uncopyright|titlepage/.test(h)), 'bagian depan/belakang dibuang');
});

test('toc.xhtml: judul bab', () => {
  const t = parseToc(fx('alice-toc.xhtml'));
  assert.equal(t.get('text/chapter-1.xhtml'), 'I: Down the Rabbit-Hole');
  assert.equal(t.get('text/chapter-2.xhtml'), 'II: The Pool of Tears');
});

test('bab: paragraf bersih, gambar & judul hgroup dibuang, word joiner hilang', () => {
  const b = xhtmlToBlocks(fx('alice-ch1.xhtml'));
  assert.ok(b.length > 20);
  assert.ok(b[0]!.t === 'p' && (b[0] as { text: string }).text.startsWith('Alice was beginning to get very tired'));
  assert.ok(b.every((x) => x.t !== 'img' && !('text' in x && /[<>\u2060]/.test(x.text))));
  assert.ok(b.some((x) => 'text' in x && x.text.includes('I think—')), 'tanda pisah tetap, word joiner hilang');
});

test('sajak: baris dipertahankan', () => {
  const b = xhtmlToBlocks(fx('keats-head.xhtml'));
  assert.equal(b[0]!.t, 'h');
  const v = b.find((x) => x.t === 'verse') as { text: string };
  assert.ok(v.text.split('\n').length >= 9 && v.text.startsWith('Now Morning from her orient chamber came,\nAnd her first footsteps'), JSON.stringify(v.text.slice(0, 120)));
});

test('Book Dash: metadata dan halaman bergambar', () => {
  const meta = parseBookDashMeta(fx('bookdash-meta.yml'));
  assert.ok(meta.size === 3 && meta.get('a-beautiful-day')!.creator.includes('Raeesah Vawda'));
  const book = parseBookDashMd(fx('sloth.md'));
  assert.equal(book.title, 'Sleepy Mr Sloth');
  assert.equal(book.pages.length, 12);
  assert.equal(book.pages[0]!.src, '01.jpg');
  assert.ok(book.pages[0]!.alt.includes('Mr Sloth is sleepy') && book.pages[0]!.text.startsWith('One day, Mr Sloth came to visit.'));
});

test('halaman baca: sekitar target kata, paragraf panjang dipecah di batas kalimat', () => {
  const b = xhtmlToBlocks(fx('alice-ch1.xhtml'));
  const pages = paginate(b, 200);
  assert.ok(pages.length >= 8);
  for (const p of pages) assert.ok(p.reduce((a, x) => a + ('text' in x && x.text ? countWords(x.text) : 0), 0) <= 300);
  const total = (bs: typeof b) => bs.reduce((a, x) => a + ('text' in x && x.text ? countWords(x.text) : 0), 0);
  assert.equal(total(pages.flat()), total(b), 'tidak ada kata yang hilang');
});

test('domain publik Indonesia: penulis & penerjemah wafat ≥ 71 tahun lalu', () => {
  assert.equal(pdIndonesia({ kind: 'se', repo: 'x', lanes: ['santai'], shelf: 'seni', died: 1955 }, 2026), true);
  assert.equal(pdIndonesia({ kind: 'se', repo: 'x', lanes: ['santai'], shelf: 'seni', died: 1956 }, 2026), false);
  assert.equal(pdIndonesia({ kind: 'se', repo: 'x', lanes: ['santai'], shelf: 'seni', died: 1800, tDied: 1960 }, 2026), false, 'penerjemah masih dilindungi');
  const all = allSources(2026);
  assert.ok(all.length >= 150, `${all.length} sumber`);
  assert.equal(new Set(all.map(sourceId)).size, all.length, 'ID unik');
  assert.ok(SE_SOURCES.every((s) => s.lanes.every((l) => LANES.some((x) => x.id === l))));
});

test('teks bersih', () => {
  assert.equal(cleanText('a&amp;b &#8212; <i>c</i>\u2060d'), 'a&b — cd');
});
