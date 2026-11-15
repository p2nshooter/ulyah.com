/* Pesan antarlembaga (pemilik 15 Nov 2026): grup seluruh lembaga (bersih tiap hari, riwayat 14 hari lalu terhapus permanen),
 * japri pribadi, tiket ke tujuan tertentu (privat), notifikasi belum dibaca. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import { b64url, hmac } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';
import { createUser, type Peran, type User } from '../src/data/users.ts';
import { ensureSeed } from '../src/data/site.ts';
import { bacaGrup, bersihkanGrup, hariGrup, kirimGrup } from '../src/data/pesan.ts';
import { hariIni } from '../src/lib/text.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const RAHASIA = 'rahasia-uji-0123456789abcdef';
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: RAHASIA });
const minta = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://yapida.sch.id${path}`, init) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
async function akun(e: Env, nama: string, peran: Peran, units: string[] = []): Promise<{ u: User; kue: string }> {
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const u = await createUser(store, { nama, peran, units, pin: '40917', pepper: 'p', wajibGanti: false });
  const body = b64url(new TextEncoder().encode(JSON.stringify({ u: u.id, v: u.sv, x: Date.now() + 3_600_000 })));
  return { u, kue: `__Host-yp=${body}.${await hmac(RAHASIA, body)}` };
}
const kirimJson = (e: Env, path: string, kue: string, data: unknown) => minta(e, path, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(data) });
const kirimForm = (e: Env, path: string, kue: string, data: Record<string, string>) => minta(e, path, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString(), redirect: 'manual' });
const hitung = async (e: Env, kue: string) => (await (await minta(e, '/portal/pesan/hitung', { headers: { cookie: kue } })).json()) as { grup: number; japri: number; tiket: number; total: number };

test('grup: riwayat 14 hari, lebih tua terhapus permanen sekali sehari', async () => {
  const store = new Store(new FakeR2() as unknown as R2Bucket);
  const kini = Date.UTC(2026, 10, 15, 3);
  for (const hari of [0, 5, 13, 14, 20]) await kirimGrup(store, { id: 'usr_A', nama: 'Uji A', label: 'Admin' }, `pesan ${hari} hari lalu`, kini - hari * 86_400_000);
  assert.equal(hariGrup(kini).length, 14);
  const dihapus = await bersihkanGrup(store, kini);
  assert.ok(dihapus >= 2);
  assert.equal(await bersihkanGrup(store, kini), 0, 'hanya sekali sehari');
  assert.equal((await bacaGrup(store, hariIni(kini - 13 * 86_400_000))).length, 1);
  assert.equal((await bacaGrup(store, hariIni(kini - 14 * 86_400_000))).length, 0, 'hari ke-15 hilang');
  assert.equal((await bacaGrup(store, hariIni(kini - 20 * 86_400_000))).length, 0);
});

test('grup, japri, tiket: privat, notifikasi belum dibaca, status tiket', async () => {
  const e = env();
  const super_ = await akun(e, 'Uji Super', 'super');
  const mi = await akun(e, 'Uji Admin MI', 'lembaga', ['mi-al-huda']);
  const mts = await akun(e, 'Uji Admin MTs', 'lembaga', ['mts-al-huda']);
  const yay = await akun(e, 'Uji Admin Yayasan', 'yayasan');

  // Grup
  const g = await kirimJson(e, '/portal/pesan/api/grup', mi.kue, { teks: 'Assalamu’alaikum semua <b>tebal</b>' });
  assert.equal(g.status, 201);
  assert.equal((await hitung(e, mts.kue)).grup, 1);
  assert.equal((await hitung(e, mi.kue)).grup, 0, 'pesan sendiri tidak dihitung');
  const hal = await (await minta(e, '/portal/pesan/grup', { headers: { cookie: mts.kue } })).text();
  assert.match(hal, /Assalamu’alaikum semua &lt;b&gt;tebal&lt;\/b&gt;/, 'teks di-escape');
  assert.equal((await hitung(e, mts.kue)).grup, 0, 'membuka grup = dibaca');
  assert.equal((await minta(e, '/portal/pesan/grup', { headers: { cookie: mts.kue } })).headers.get('cache-control'), 'no-store');

  // Japri: hanya berdua
  const j = await kirimJson(e, `/portal/pesan/api/japri/${mts.u.id}`, mi.kue, { teks: 'Japri rahasia MI ke MTs' });
  assert.equal(j.status, 201);
  assert.equal((await hitung(e, mts.kue)).japri, 1);
  const japriMts = await (await minta(e, `/portal/pesan/api/japri/${mi.u.id}`, { headers: { cookie: mts.kue, accept: 'application/json' } })).json() as { pesan: { x: string }[] };
  assert.equal(japriMts.pesan[0]!.x, 'Japri rahasia MI ke MTs');
  assert.equal((await hitung(e, mts.kue)).japri, 0);
  const lain = await (await minta(e, `/portal/pesan/api/japri/${mi.u.id}`, { headers: { cookie: yay.kue, accept: 'application/json' } })).json() as { pesan: unknown[] };
  assert.equal(lain.pesan.length, 0, 'akun ketiga tidak melihat japri orang lain');

  // Tiket MI → pengelola MTs: MTs & super melihat, yayasan tidak
  const t = await kirimForm(e, '/portal/pesan/tiket', mi.kue, { tujuan: 'unit:mts-al-huda', perihal: 'Pinjam ruang kelas', teks: 'Mohon izin pinjam ruang untuk lomba.' });
  assert.equal(t.status, 302);
  const idT = /\/portal\/pesan\/tiket\/(tkt_[0-9A-Z]{20})/.exec(t.headers.get('location') ?? '')?.[1]!;
  assert.ok(idT);
  assert.equal((await hitung(e, mts.kue)).tiket, 1);
  assert.equal((await minta(e, `/portal/pesan/tiket/${idT}`, { headers: { cookie: yay.kue } })).status, 404, 'yayasan tidak dituju');
  assert.equal((await minta(e, `/portal/pesan/tiket/${idT}`, { headers: { cookie: super_.kue } })).status, 200, 'super admin melihat semua');
  const balas = await kirimJson(e, `/portal/pesan/api/tiket/${idT}`, mts.kue, { teks: 'Silakan, ruang 2 kosong.' });
  assert.equal(balas.status, 201);
  assert.equal((await hitung(e, mi.kue)).tiket, 1, 'pembuat diberi tahu balasan');
  await kirimForm(e, `/portal/pesan/tiket/${idT}/status`, mts.kue, { status: 'selesai' });
  const halT = await (await minta(e, `/portal/pesan/tiket/${idT}`, { headers: { cookie: mi.kue } })).text();
  assert.match(halT, /Selesai/);
  assert.match(halT, /Pinjam ruang kelas/);
  const tolak = await kirimForm(e, `/portal/pesan/tiket/${idT}/status`, mi.kue, { status: 'baru' });
  assert.equal(tolak.status, 403, 'pembuat tidak bisa mengubah status');
  const beranda = await (await minta(e, '/portal/pesan', { headers: { cookie: mts.kue } })).text();
  assert.match(beranda, /Grup seluruh lembaga/);
  assert.match(beranda, /Uji Admin MI/);
});
