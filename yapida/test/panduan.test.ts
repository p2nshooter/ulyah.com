/* Panduan (perintah pemilik 40): panduan portal per menu disaring menurut peran + tombol ? kontekstual, panduan siswa publik. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import { b64url, hmac } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';
import { createUser, type Peran } from '../src/data/users.ts';
import { ensureSeed } from '../src/data/site.ts';
import { jangkarPanduan, PANDUAN_PORTAL } from '../src/pages/panduan.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const RAHASIA = 'rahasia-uji-0123456789abcdef';
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: RAHASIA });
const minta = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://yapida.sch.id${path}`, { redirect: 'manual', ...init }) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
async function akun(e: Env, nama: string, peran: Peran, units: string[] = []) {
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const u = await createUser(store, { nama, peran, units, pin: '40917', pepper: 'p', wajibGanti: false });
  const body = b64url(new TextEncoder().encode(JSON.stringify({ u: u.id, v: u.sv, x: Date.now() + 3_600_000 })));
  return `__Host-yp=${body}.${await hmac(RAHASIA, body)}`;
}

test('panduan siswa publik: cara masuk dan mengerjakan latihan; ditautkan dari halaman masuk', async () => {
  const e = env();
  const h = await (await minta(e, '/siswa/panduan')).text();
  assert.match(h, /Cara masuk Portal Siswa/);
  assert.match(h, /NISN/);
  assert.match(h, /Serahkan/);
  assert.match(h, /pembahasan/);
  assert.match(await (await minta(e, '/siswa')).text(), /href="\/siswa\/panduan"/);
});

test('panduan portal: menurut peran, bisa lihat semua, tombol ? membuka bagian menu yang sedang dibuka', async () => {
  const e = env();
  const kGuru = await akun(e, 'Uji Guru Panduan', 'kontributor', ['mi-al-huda']);
  assert.equal((await minta(e, '/portal/panduan')).status, 302, 'harus masuk dulu');
  const h = await (await minta(e, '/portal/panduan', { headers: { cookie: kGuru } })).text();
  assert.match(h, /id="bank-soal"/);
  assert.doesNotMatch(h, /id="akun"/, 'menu Akun & PIN tidak untuk kontributor');
  assert.match(h, /panduan\?semua=1/);
  assert.match(await (await minta(e, '/portal/panduan?semua=1', { headers: { cookie: kGuru } })).text(), /id="akun"/);
  const bs = await (await minta(e, '/portal/bank-soal', { headers: { cookie: kGuru } })).text();
  assert.match(bs, /href="\/portal\/panduan#bank-soal"/);
  assert.equal(jangkarPanduan('/portal/k/kabar'), 'isi');
  assert.equal(jangkarPanduan('/portal/k/ppdb'), 'ppdb');
  assert.equal(jangkarPanduan('/portal/bank-soal/baru'), 'bank-soal');
  assert.ok(PANDUAN_PORTAL.every((b) => b.langkah.length > 0));
});
