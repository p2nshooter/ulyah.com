/* Kamus LUAJA: format paket (blok + range read), urutan kunci, pencarian bentuk → lema, urutan hasil, awalan, pemecahan
 * kalimat Jepang, rute halaman & API, dan popup pembaca yang tidak lagi melempar ke situs kamus luar. Jalankan: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { cmp, Kamus, keyOf, meaningOf, resetKamusCache, weak, type Entry, type KLang } from '../src/kamus/reader.ts';
import type { Env } from '../src/env.ts';

const E = (w: string, o: Partial<Entry> & { gl?: string[]; p?: string } = {}): Entry => ({ w, b: [{ p: o.p ?? 'noun', s: (o.gl ?? [`gloss of ${w}`]).map((g) => ({ g })) }], ...o });

/** Penulis paket kecil dengan format yang sama dengan scripts/kamus/build.py (blok & bagian sengaja kecil). */
function pack(r2: FakeR2, ver: string, lang: KLang, kind: 'e' | 'f', rows: Record<string, unknown>, block = 120, part = 400) {
  const keys = Object.keys(rows).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  const blocks: [string, number, number, number][] = [];
  const parts: Buffer[] = [];
  let cur: Buffer[] = [], pos = 0, bKey: string | null = null, bStart = 0, bLen = 0, p = 0;
  const closeBlock = () => { if (bKey !== null && bLen) blocks.push([bKey, p, bStart, bLen]); bKey = null; bLen = 0; };
  const closePart = () => { parts.push(Buffer.concat(cur)); cur = []; pos = 0; p += 1; };
  for (const k of keys) {
    const line = Buffer.from(`${k}\t${JSON.stringify(rows[k])}\n`);
    if (bLen && bLen + line.length > block) { closeBlock(); if (pos >= part) closePart(); }
    if (bKey === null) { bKey = k; bStart = pos; }
    cur.push(line); pos += line.length; bLen += line.length;
  }
  closeBlock(); closePart();
  parts.forEach((b, i) => r2.m.set(`kamus/${ver}/${lang}/${kind}-${i}.txt`, { v: b.toString('utf8'), etag: 'x', up: new Date() }));
  r2.m.set(`kamus/${ver}/${lang}/${kind}.idx.json`, { v: JSON.stringify({ parts: parts.length, blocks }), etag: 'x', up: new Date() });
  return blocks.length;
}

function fixture(): FakeR2 {
  const r2 = new FakeR2();
  const ver = 't1';
  const de: Record<string, Entry[]> = {
    haus: [E('Haus', { g: 'n', pl: 'Häuser', ipa: '[haʊ̯s]', gl: ['house, building', 'home'], m: { id: ['rumah', 'gedung'], ja: ['家'], en: ['house, building', 'home'] }, d: ['zum Wohnen dienendes Gebäude'] })],
    gehen: [E('Gehen', { m: { id: ['jalan kaki'], en: ['walking'] } }), E('gehen', { p: 'verb', gl: ['to go, to walk'], m: { id: ['pergi', 'berjalan'], en: ['to go, to walk'] } })],
    bank: [E('Bank', { g: 'f', m: { id: ['bangku', 'bank'], en: ['bench', 'bank'] } })],
    schön: [E('schön', { p: 'adj', m: { id: ['indah', 'cantik'], en: ['beautiful'] } })],
    straße: [E('Straße', { g: 'f', m: { id: ['jalan'], en: ['street'] } })],
  };
  for (let i = 0; i < 30; i += 1) de[`hausaufgabe${String(i).padStart(2, '0')}`] = [E(`Hausaufgabe${String(i).padStart(2, '0')}`, { m: { id: ['pekerjaan rumah'] } })];
  const blocks = pack(r2, ver, 'de', 'e', de);
  assert.ok(blocks > 5, 'fixture harus memecah beberapa blok');
  pack(r2, ver, 'de', 'f', { hauses: ['Haus'], häuser: ['Haus'], ging: ['gehen'], gegangen: ['gehen'] });
  pack(r2, ver, 'en', 'e', {
    went: [E('went', { gl: ['A course; a way'], b: [{ p: 'noun', s: [{ g: 'A course; a way', t: ['obsolete'] }] }], m: { id: ['jalan'] } })],
    go: [E('go', { p: 'verb', m: { id: ['pergi'], ja: ['行く'], en: ['to move'] } })],
    house: [E('house', { m: { id: ['rumah'], ja: ['家'], en: ['a building'] } })],
  });
  pack(r2, ver, 'en', 'f', { went: ['go'], houses: ['house'] });
  pack(r2, ver, 'ja', 'e', {
    '私': [E('私', { r: ['わたし'], m: { id: ['saya'], en: ['I'] } })],
    'は': [E('は', { p: 'particle', m: { id: ['(penanda topik)'], en: ['topic marker'] } })],
    '日本': [E('日本', { m: { id: ['Jepang'] } })],
    '日本語': [E('日本語', { lv: 'N5', r: ['にほんご'], m: { id: ['bahasa Jepang'], en: ['Japanese language'] } })],
    'を': [E('を', { p: 'particle', m: { id: ['(penanda objek)'] } })],
    '勉強': [E('勉強', { m: { id: ['belajar'] } })],
    '食べる': [E('食べる', { p: 'verb', lv: 'N5', r: ['たべる'], m: { id: ['makan'], en: ['to eat'] } })],
    '𠮷野家': [E('𠮷野家', { m: { id: ['(nama toko)'] } })],
  });
  pack(r2, ver, 'ja', 'f', { 'たべる': ['食べる'], '食べた': ['食べる'], 'します': ['する'] });
  pack(r2, ver, 'id', 'e', { rumah: [E('rumah', { m: { ja: ['家'], en: ['house'] }, to: { de: ['Haus'], en: ['house'], ja: ['家'] } })] });
  pack(r2, ver, 'id', 'f', {});
  r2.m.set('kamus/current.json', { v: JSON.stringify({ ver, built: '2026-11-16T00:00:00Z', langs: { de: { entries: 35, id: 35, ja: 1, en: 5, forms: 4, bytes: 1 }, en: { entries: 3, id: 3, ja: 2, en: 3, forms: 2, bytes: 1 } }, sources: [{ name: 'Wiktionary', licence: 'CC BY-SA 4.0', url: 'https://www.wiktionary.org/' }] }), etag: 'x', up: new Date() });
  return r2;
}

test('kamus: urutan kunci = urutan byte UTF-8 (sama dengan sort LC_ALL=C), termasuk huruf di luar BMP', () => {
  const words = ['zebra', 'Äpfel', 'äpfel', 'apfel', 'ß', 'ｱ', '𠮷', '日本', '日本語', 'ab', 'a'];
  const byBytes = [...words].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  assert.deepEqual([...words].sort(cmp), byBytes);
  assert.equal(keyOf('  „Hauses!“ '), 'hauses');
  assert.equal(keyOf('Straße'), 'straße');
});

test('kamus: bentuk → lema, arti dalam bahasa antarmuka, entri usang kalah dari lema umum', async () => {
  resetKamusCache();
  const k = (await Kamus.open(fixture()))!;
  const a = await k.lookup('de', 'Hauses', 3, 'id');
  assert.equal(a.entries[0].w, 'Haus');
  assert.equal(a.from, 'Hauses');
  assert.deepEqual(meaningOf(a.entries[0], 'id').m, ['rumah', 'gedung']);
  const g = await k.lookup('de', 'gehen', 3, 'id');
  assert.equal(g.entries[0].w, 'gehen', 'huruf persis sama didahulukan (gehen, bukan Gehen)');
  assert.equal((await k.lookup('de', 'ging', 3, 'id')).entries[0].w, 'gehen');
  const went = await k.lookup('en', 'went', 3, 'id');
  assert.ok(weak((await k.exact('en', 'went'))[0]));
  assert.deepEqual(went.entries.map((e) => e.w), ['go'], '„went“ (makna usang) disembunyikan, lema go ditampilkan');
  assert.equal((await k.lookup('ja', 'たべる', 3, 'id')).entries[0].w, '食べる');
  assert.equal((await k.lookup('de', 'Strasse', 3, 'id')).entries[0]?.w, 'Straße', 'ss → ß');
  assert.equal((await k.lookup('de', 'tidakada', 3, 'id')).entries.length, 0);
  // arti cadangan: bahasa antarmuka tidak ada → bahasa Inggris (ditandai)
  const m = meaningOf((await k.exact('de', 'haus'))[0], 'ja');
  assert.deepEqual([m.m[0], m.ml], ['家', 'ja']);
  assert.equal(meaningOf((await k.exact('de', 'schön'))[0], 'ja').ml, 'en');
});

test('kamus: awalan melintasi blok, pecah kalimat Jepang (termasuk huruf di luar BMP)', async () => {
  resetKamusCache();
  const k = (await Kamus.open(fixture()))!;
  const pre = (await k.prefix('de', 'hausauf', 12)).map((e) => e.w);
  assert.equal(pre.length, 12);
  assert.deepEqual(pre.slice(0, 3), ['Hausaufgabe00', 'Hausaufgabe01', 'Hausaufgabe02']);
  assert.deepEqual((await k.prefix('de', 'zzz', 5)), []);
  const seg = await k.segment('私は日本語を勉強します。');
  assert.deepEqual(seg.filter((x) => x.w).map((x) => x.t), ['私', 'は', '日本語', 'を', '勉強']);
  assert.equal(seg.map((x) => x.t).join(''), '私は日本語を勉強します。', 'tidak ada huruf yang hilang');
  assert.deepEqual((await k.segment('𠮷野家で食べた')).filter((x) => x.w).map((x) => [x.t, x.w]), [['𠮷野家', '𠮷野家'], ['食べた', '食べる']]);
});

function env(media: FakeR2): Env {
  return { DATA: new FakeR2() as unknown as R2Bucket, MEDIA: media as unknown as R2Bucket, ASSETS: {} as Fetcher, CANONICAL_HOST: 'luaja.com', SESSION_SECRET: 'test-secret-0123456789abcdef' };
}
const get = (e: Env, path: string) => worker.fetch(new Request(`https://luaja.com${path}`, { redirect: 'manual' }) as never, e, {} as ExecutionContext);

test('kamus: halaman & API — pencarian dialihkan ke halaman kata, arti Indonesia, JSON-LD, kamus belum siap', async () => {
  resetKamusCache();
  const e = env(fixture());
  const home = await get(e, '/kamus');
  assert.equal(home.status, 200);
  const hh = await home.text();
  assert.match(hh, /data-k-search/);
  assert.match(hh, /Wiktionary/);
  const r = await get(e, '/kamus?l=de&q=Hauses');
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/kamus/de/Haus?dari=Hauses');
  const page = await get(e, '/kamus/de/Haus?dari=Hauses');
  assert.equal(page.status, 200);
  const ph = await page.text();
  assert.match(ph, /rumah/);
  assert.match(ph, /k-art-n">das</);
  assert.match(ph, /"@type":"DefinedTerm"/);
  assert.match(ph, /die Häuser/);
  const en = await (await get(e, '/en/kamus/de/Haus')).text();
  assert.match(en, /house, building/);
  const api = await (await get(e, '/api/kamus/cari?l=de&q=ging&ui=id')).json() as { ok: boolean; hits: { w: string; m: string[]; url: string }[] };
  assert.deepEqual([api.ok, api.hits[0].w, api.hits[0].m[0], api.hits[0].url], [true, 'gehen', 'pergi', '/kamus/de/gehen']);
  const art = await (await get(e, '/api/kamus/cari?l=de&q=Haus&ui=id')).json() as { hits: { art?: string }[] };
  assert.equal(art.hits[0].art, 'das');
  const seg = await (await get(e, '/api/kamus/pecah?l=ja&q=' + encodeURIComponent('私は日本語を勉強します') + '&ui=id')).json() as { tokens: { t: string; m?: string[] }[] };
  assert.deepEqual(seg.tokens.find((x) => x.t === '日本語')?.m, ['bahasa Jepang']);
  const awal = await (await get(e, '/api/kamus/awal?l=de&q=hau&ui=id')).json() as { items: { w: string }[] };
  assert.equal(awal.items[0].w, 'Haus');
  const miss = await get(e, '/kamus?l=de&q=Hausauf');
  assert.equal(miss.status, 404);
  assert.match(await miss.text(), /Hausaufgabe00/);
  assert.equal((await get(e, '/kamus/xx/Haus')).status, 404);
  assert.equal((await get(e, '/api/kamus/cari?l=de')).status, 400);
  // reverse: Indonesia → Jerman/Inggris/Jepang
  assert.match(await (await get(e, '/kamus/id/rumah')).text(), /href="\/kamus\/de\/Haus"/);
  // kamus belum diunggah: API 503, halaman tetap tampil dengan pemberitahuan
  resetKamusCache();
  const empty = env(new FakeR2());
  assert.equal((await get(empty, '/api/kamus/cari?l=de&q=Haus')).status, 503);
  const eh = await get(empty, '/kamus');
  assert.equal(eh.status, 200);
  assert.match(await eh.text(), /Kamus sedang diperbarui/);
  resetKamusCache();
});

test('kamus: popup pembaca memakai kamus sendiri (bukan situs kamus luar) dan menu memuat Kamus', async () => {
  const js = fs.readFileSync(new URL('../public/assets/pustaka.js', import.meta.url), 'utf8');
  for (const outside of ['wiktionary.org', 'jisho.org']) assert.ok(!js.includes(outside), `pustaka.js masih menyebut ${outside}`);
  assert.ok(js.includes('/api/kamus/cari') && js.includes('/api/kamus/pecah'));
  resetKamusCache();
  const h = await (await get(env(fixture()), '/')).text();
  assert.match(h, /href="\/kamus"/);
  const sm = await (await get(env(fixture()), '/sitemap.xml')).text();
  assert.match(sm, /\/kamus</);
});

test('pustaka: semua penjelasan berbahasa Inggris di buku Jerman/Jepang punya terjemahan Indonesia; kosakata ber-arti Indonesia', () => {
  let explain = 0, missing = 0, voc = 0, vocId = 0;
  for (const f of fs.readdirSync(new URL('../public/p/b/', import.meta.url))) {
    const d = JSON.parse(fs.readFileSync(new URL(`../public/p/b/${f}`, import.meta.url), 'utf8')) as { lang: string; pages: { b: Record<string, unknown>[] }[] };
    if (d.lang === 'en') continue;
    for (const pg of d.pages) for (const b of pg.b) {
      if ((b.k === 'p' || b.k === 'tip') && b.l === 'en') { explain += 1; if (!b.t_id) missing += 1; }
      if (b.k === 'voc' && Array.isArray(b.i)) { voc += (b.i as unknown[]).length; vocId += ((b.tr as { id?: string[] } | undefined)?.id ?? []).filter(Boolean).length; }
    }
  }
  assert.ok(explain > 1000, `paragraf penjelasan: ${explain}`);
  assert.equal(missing, 0, `${missing} paragraf penjelasan belum diterjemahkan`);
  assert.ok(vocId / voc > 0.8, `kosakata ber-arti Indonesia ${vocId}/${voc}`);
});
