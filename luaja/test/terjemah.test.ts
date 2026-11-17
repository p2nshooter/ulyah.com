/* Terjemahan seluruh buku (mesin MADLAD-400 lewat .github/workflows/terjemah-luaja.yml): hash & potongan halaman sama di
 * mesin.py, Worker dan pembaca; potongan pratinjau terbuka, sisanya hanya member; teks Jepang diketuk per kata. npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { BOOKS, MT_CHUNK, mtChunkOf, PREVIEW_PAGES } from '../src/library/index.ts';
import type { Env } from '../src/env.ts';

const js = fs.readFileSync(new URL('../public/assets/pustaka.js', import.meta.url), 'utf8');
const py = fs.readFileSync(new URL('../scripts/pustaka/mesin.py', import.meta.url), 'utf8');
const env = (media: FakeR2): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: media as unknown as R2Bucket, ASSETS: {} as Fetcher, CANONICAL_HOST: 'luaja.com', SESSION_SECRET: 'test-secret-0123456789abcdef' } as Env);
const get = (e: Env, path: string) => worker.fetch(new Request(`https://luaja.com${path}`) as never, e, {} as ExecutionContext);

test('terjemah: FNV-1a di pembaca sama dengan mesin.py (vektor dihitung dengan Python)', () => {
  const src = /function fnv\(str\) \{[\s\S]*?\n  \}/.exec(js)?.[0];
  assert.ok(src, 'fnv() ada di pustaka.js');
  const fnv = new Function('ENC', `${src}; return fnv;`)(new TextEncoder()) as (s: string) => string;
  assert.equal(fnv(''), '811c9dc5');
  assert.equal(fnv('a'), 'e40c292c');
  assert.equal(fnv('冬休みが来る'), 'd4b08208');
  assert.equal(fnv('Guten Morgen'), 'ceb4cd04');
});

test('terjemah: rumus potongan halaman sama di Worker, pembaca dan mesin.py', () => {
  assert.deepEqual([0, 2, 3, 27, 28, 52, 53].map(mtChunkOf), [0, 0, 1, 1, 2, 2, 3]);
  assert.match(py, new RegExp(`PREVIEW, CHUNK = ${PREVIEW_PAGES}, ${MT_CHUNK}\\b`));
  assert.ok(js.includes('1 + Math.floor((p - PREV) / CH)'));
});

test('terjemah: potongan 0 (pratinjau) terbuka, potongan berikutnya hanya member; bahasa salah atau sama 404', async () => {
  const media = new FakeR2();
  const b = BOOKS.find((x) => x.lang === 'ja')!;
  media.m.set(`pustaka/terjemah/id/${b.id}/0.json`, { v: '{"v":1,"u":{"0.0":["00000000","halo"]}}', etag: 'e', up: new Date() });
  media.m.set(`pustaka/terjemah/id/${b.id}/1.json`, { v: '{"v":1,"u":{}}', etag: 'e', up: new Date() });
  const e = env(media);
  const r0 = await get(e, `/p/t/${b.id}/id/0.json`);
  assert.equal(r0.status, 200);
  assert.match(await r0.text(), /halo/);
  assert.match(r0.headers.get('cache-control') ?? '', /public/);
  const r1 = await get(e, `/p/t/${b.id}/id/1.json`);
  assert.equal(r1.status, 403);
  assert.equal((await get(e, `/p/t/${b.id}/ja/0.json`)).status, 404);
  assert.equal((await get(e, `/p/t/${b.id}/xx/0.json`)).status, 404);
  assert.equal((await get(e, `/p/t/buku-tidak-ada/id/0.json`)).status, 404);
  assert.equal((await get(e, `/p/t/${b.id}/id/2.json`)).status, 403);
});

test('pembaca: kata Jepang diketuk satu per satu (bukan seluruh paragraf); arti hanya dalam bahasa antarmuka', () => {
  assert.ok(js.includes("new Intl.Segmenter('ja', { granularity: 'word' })"));
  assert.ok(!js.includes('sentenceAt'), 'ketukan tidak lagi mengirim seluruh kalimat ke kamus');
  assert.ok(!js.includes('tr-en'), 'arti Inggris tidak lagi ditempel di bawah arti Indonesia');
  assert.match(js, /markOn\(\[w\]\)/);
});
