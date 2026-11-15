/* Al-Qur'an mushaf Utsmani: keutuhan aset (114 surah, 6.236 ayat, 604 halaman), rute, dan tafsir Kemenag yang disimpan
 * di R2 (sumber tiruan). Jalankan: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import type { Env } from '../src/env.ts';
import type { HalamanData, QuranMeta, SurahData } from '../src/pages/quran.ts';

const PUB = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const baca = <T>(p: string): T => JSON.parse(fs.readFileSync(path.join(PUB, 'assets', 'quran', p), 'utf8')) as T;
const ASSETS = {
  fetch: async (req: Request) => {
    const f = path.join(PUB, new URL(req.url).pathname);
    return f.startsWith(PUB) && fs.existsSync(f) && fs.statSync(f).isFile() ? new Response(fs.readFileSync(f)) : new Response('tidak ada', { status: 404 });
  },
} as unknown as Fetcher;
const env = (extra: Partial<Env> = {}): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: 'rahasia-uji-0123456789abcdef', ...extra });
const get = (e: Env, p: string) => worker.fetch(new Request(`https://yapida.sch.id${p}`) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);

test('aset mushaf: 114 surah, 6.236 ayat, 604 halaman, 30 juz, 15 ayat sajdah', () => {
  const m = baca<QuranMeta>('meta.json');
  assert.equal(m.surah.length, 114);
  assert.equal(m.surah.reduce((a, s) => a + s.ayat, 0), 6236);
  assert.equal(m.halaman.length, 604);
  assert.equal(m.juz.length, 30);
  assert.deepEqual(m.juz[29], { n: 30, hal: 582, mulai: '78:1' });
  let sajdah = 0;
  for (let n = 1; n <= 114; n += 1) {
    const s = baca<SurahData>(`s/${n}.json`);
    assert.equal(s.ayat.length, m.surah[n - 1]!.ayat, `jumlah ayat surah ${n}`);
    assert.equal(s.basmalah, n !== 1 && n !== 9, `basmalah surah ${n}`);
    for (const a of s.ayat) { assert.ok(a.ar && a.tr, `${n}:${a.a} berisi teks & terjemah`); if (a.sj) sajdah += 1; }
  }
  assert.equal(sajdah, 15);
  assert.ok(baca<SurahData>('s/2.json').ayat[254]!.tr.startsWith('Allah, tidak ada tuhan selain Dia'), 'Ayat Kursi');
  assert.ok(!/[a-z]\d+\)/i.test(baca<SurahData>('s/2.json').ayat[254]!.tr), 'rujukan catatan kaki dibuang');
});

test('aset mushaf: setiap halaman paling banyak 15 baris; halaman 1 = kepala surah + 7 baris Al-Fatihah', () => {
  for (let p = 1; p <= 604; p += 1) {
    const h = baca<HalamanData>(`h/${p}.json`);
    assert.ok(h.baris.length <= 15 && h.baris.length >= 6, `halaman ${p}: ${h.baris.length} baris`);
  }
  const h1 = baca<HalamanData>('h/1.json');
  assert.deepEqual(h1.baris.map((b) => b.t), ['surat', 'b', 'b', 'b', 'b', 'b', 'b', 'b']);
  const h604 = baca<HalamanData>('h/604.json');
  assert.deepEqual(h604.surat, [112, 113, 114]);
  // Tanda akhir ayat: ayat terakhir Al-Fatihah di baris terakhir halaman 1.
  const akhir = (h1.baris.at(-1) as { k: [string, string, number][] }).k.at(-1)!;
  assert.deepEqual([akhir[1], akhir[2]], ['1:7', 7]);
});

test('rute Al-Qur’an: daftar, surah, halaman mushaf, pengalihan ayat & juz, 404', async () => {
  const e = env();
  const idx = await (await get(e, '/quran')).text();
  assert.equal((idx.match(/class="q-surah muncul"/g) ?? []).length, 114);
  assert.ok(idx.includes('Al-Qur’an Mushaf Utsmani'));
  const yasin = await get(e, '/quran/36');
  assert.equal(yasin.status, 200);
  const ty = await yasin.text();
  assert.equal((ty.match(/class="q-ayat"/g) ?? []).length, 83);
  assert.ok(ty.includes('class="q-basmalah"') && ty.includes('"@type":"Chapter"'));
  const h = await (await get(e, '/quran/halaman/50')).text();
  assert.ok(h.includes('class="m-surat"') && h.includes('class="m-basmalah"') && (h.match(/class="m-baris"/g) ?? []).length === 13);
  assert.ok(h.includes('/assets/quran.css') && !/adsbygoogle\.js/.test(h), 'mushaf tanpa loader iklan');
  assert.equal((await get(e, '/quran/2/255')).headers.get('location'), '/quran/2#ayat-255');
  assert.equal((await get(e, '/quran/juz/30')).headers.get('location'), '/quran/halaman/582');
  for (const p of ['/quran/0', '/quran/115', '/quran/halaman/0', '/quran/halaman/605', '/quran/abc']) assert.equal((await get(e, p)).status, 404, p);
  const sm = await (await get(e, '/sitemap.xml')).text();
  assert.ok(sm.includes('/quran/114</loc>') && sm.includes('/quran</loc>'));
});

test('tafsir Kemenag: diambil sekali dari sumber, lalu dilayani dari R2', async () => {
  const e = env({ EQURAN_BASE: 'https://equran.uji' });
  const asli = globalThis.fetch;
  let panggil = 0;
  globalThis.fetch = (async (u: string | URL | Request) => {
    const url = String(u instanceof Request ? u.url : u);
    if (url === 'https://equran.uji/api/v2/tafsir/112') { panggil += 1; return Response.json({ code: 200, data: { nomor: 112, tafsir: [{ ayat: 1, teks: 'Katakanlah: Dialah Allah Yang Maha Esa…' }, { ayat: 2, teks: 'Allah tempat meminta.' }] } }); }
    return asli(u as RequestInfo);
  }) as typeof fetch;
  try {
    const r1 = await (await get(e, '/quran/api/tafsir/112')).json() as { ayat: Record<string, string>; sumber: string };
    assert.equal(r1.ayat['2'], 'Allah tempat meminta.');
    assert.match(r1.sumber, /Kemenag/);
    const r2 = await (await get(e, '/quran/api/tafsir/112')).json() as { ayat: Record<string, string> };
    assert.equal(r2.ayat['1'], 'Katakanlah: Dialah Allah Yang Maha Esa…');
    assert.equal(panggil, 1, 'sumber hanya dipanggil sekali');
    assert.ok(await (e.DATA as unknown as FakeR2).get('k/tafsir/kemenag/112.json'));
    assert.equal((await get(e, '/quran/api/tafsir/115')).status, 404);
  } finally {
    globalThis.fetch = asli;
  }
});
