/* „Semua wajib bisa CRUD atau dynamic page di masing2 lembaga dan pastikan full akses di super admin“ (pemilik):
 * halaman bebas per lembaga (buat, ubah, hapus) dengan hak akses yang benar, kaki situs dari pengaturan portal,
 * rak perpustakaan (unggulan/sembunyi) untuk tingkat yayasan, dan perbaikan nama di isi awal. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import { b64url, hmac } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';
import { createUser, type Peran } from '../src/data/users.ts';
import { ensureSeed, getSitus, getUnit } from '../src/data/site.ts';
import { ambil } from '../src/data/koleksi.ts';
import type { Situs, Unit } from '../src/data/model.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const RAHASIA = 'rahasia-uji-0123456789abcdef';
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: RAHASIA });
const minta = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://yapida.sch.id${path}`, init) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
async function masuk(e: Env, peran: Peran, units: string[] = []): Promise<string> {
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const u = await createUser(store, { nama: `Uji ${peran} ${units.join(',')}`, peran, units, pin: '40917', pepper: 'p', wajibGanti: false });
  const body = b64url(new TextEncoder().encode(JSON.stringify({ u: u.id, v: u.sv, x: Date.now() + 3_600_000 })));
  return `__Host-yp=${body}.${await hmac(RAHASIA, body)}`;
}
const kirim = (e: Env, path: string, kue: string, data: Record<string, string | string[]>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) for (const x of Array.isArray(v) ? v : [v]) p.append(k, x);
  return minta(e, path, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: p.toString(), redirect: 'manual' });
};

test('halaman bebas per lembaga: admin MI buat/ubah/hapus halaman MI, tidak bisa halaman RA atau yayasan; super admin semua', async () => {
  const e = env();
  const mi = await masuk(e, 'lembaga', ['mi-al-huda']);
  const sup = await masuk(e, 'super');
  // Admin MI membuat halaman MI.
  const r = await kirim(e, '/portal/halaman/baru', mi, { unit: 'mi-al-huda', judul: 'Ekstrakurikuler MI', ringkas: 'Pramuka, tahfidz, kaligrafi, dan marawis setiap Sabtu.', isi: '## Pramuka\n\nSetiap Sabtu pagi.' });
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/portal/halaman/ekstrakurikuler-mi?ok=simpan');
  // Tampil publik dengan remah lembaga, dan di halaman lembaga MI.
  const pub = await (await minta(e, '/h/ekstrakurikuler-mi')).text();
  assert.ok(pub.includes('Setiap Sabtu pagi') && pub.includes('href="/lembaga/mi-al-huda"'));
  assert.ok((await (await minta(e, '/lembaga/mi-al-huda')).text()).includes('href="/h/ekstrakurikuler-mi"'), 'tertaut di halaman lembaga');
  assert.ok(!(await (await minta(e, '/lembaga/ra-al-huda')).text()).includes('ekstrakurikuler-mi'), 'tidak muncul di lembaga lain');
  // Admin MI tidak bisa membuat halaman untuk RA atau yayasan.
  assert.equal((await kirim(e, '/portal/halaman/baru', mi, { unit: 'ra-al-huda', judul: 'Halaman RA', ringkas: 'Uji hak akses lembaga lain.' })).status, 400);
  assert.equal((await kirim(e, '/portal/halaman/baru', mi, { unit: 'yayasan', judul: 'Halaman Yayasan', ringkas: 'Uji hak akses tingkat yayasan.' })).status, 400);
  assert.equal((await minta(e, '/portal/halaman/kebijakan-privasi', { headers: { cookie: mi } })).status, 403, 'halaman yayasan tertutup bagi admin lembaga');
  // Admin RA tidak bisa menyunting/menghapus halaman MI.
  const ra = await masuk(e, 'lembaga', ['ra-al-huda']);
  assert.equal((await minta(e, '/portal/halaman/ekstrakurikuler-mi', { headers: { cookie: ra } })).status, 403);
  assert.equal((await kirim(e, '/portal/halaman/ekstrakurikuler-mi/hapus', ra, {})).status, 403);
  // Daftar portal admin MI hanya berisi halamannya.
  const daftarMi = await (await minta(e, '/portal/halaman', { headers: { cookie: mi } })).text();
  assert.ok(daftarMi.includes('Ekstrakurikuler MI') && !daftarMi.includes('Kebijakan Privasi'));
  // Super admin melihat semuanya, mengubah halaman MI, lalu menghapusnya.
  const daftarSup = await (await minta(e, '/portal/halaman', { headers: { cookie: sup } })).text();
  assert.ok(daftarSup.includes('Ekstrakurikuler MI') && daftarSup.includes('Kebijakan Privasi'));
  assert.equal((await kirim(e, '/portal/halaman/ekstrakurikuler-mi', sup, { unit: 'mi-al-huda', judul: 'Ekstrakurikuler MI Al Huda', ringkas: 'Diperbarui super admin.', isi: 'Isi baru.' })).status, 302);
  assert.ok((await (await minta(e, '/h/ekstrakurikuler-mi')).text()).includes('Isi baru.'));
  assert.equal((await kirim(e, '/portal/halaman/ekstrakurikuler-mi/hapus', sup, {})).status, 302);
  assert.equal((await minta(e, '/h/ekstrakurikuler-mi')).status, 404, 'halaman terhapus');
});

test('kaki situs mengikuti pilihan „Tautkan di kaki situs“ (hanya halaman yayasan)', async () => {
  const e = env();
  const sup = await masuk(e, 'super');
  await kirim(e, '/portal/halaman/baru', sup, { unit: 'yayasan', judul: 'Biaya Pendidikan', ringkas: 'Rincian biaya pendidikan di lembaga Yayasan Al-Huda Yapida.', kaki: '1' });
  await kirim(e, '/portal/halaman/kebijakan-privasi', sup, { unit: 'yayasan', judul: 'Kebijakan Privasi', ringkas: 'Kebijakan privasi Yayasan Al-Huda Yapida untuk pengunjung situs.' });
  const h = await (await minta(e, '/profil')).text();
  const kaki = h.slice(h.indexOf('class="kaki-taut"'));
  assert.ok(kaki.includes('href="/h/biaya-pendidikan"'), 'halaman baru masuk kaki situs');
  assert.ok(!kaki.includes('href="/h/kebijakan-privasi"'), 'centang dilepas → keluar dari kaki situs');
  assert.ok(kaki.includes('href="/h/syarat-penggunaan"'));
});

test('rak perpustakaan: hanya tingkat yayasan; unggulan tampil di depan, buku bawaan bisa disembunyikan dan dimunculkan lagi', async () => {
  const e = env();
  const mi = await masuk(e, 'lembaga', ['mi-al-huda']);
  const sup = await masuk(e, 'super');
  assert.equal((await minta(e, '/portal/pustaka', { headers: { cookie: mi } })).status, 403);
  const form = await (await minta(e, '/portal/pustaka', { headers: { cookie: sup } })).text();
  assert.ok(form.includes('value="k-menanam-padi"') && form.includes('data-saring-baris'));
  assert.equal((await kirim(e, '/portal/pustaka', sup, { unggulan: ['k-menanam-padi'], sembunyi: ['k-hadits-nawawi', 'k-tidak-ada'] })).status, 302);
  const rak = await (await minta(e, '/pustaka/rak/ra')).text();
  const pertama = /href="\/pustaka\/b\/([^"]+)"/.exec(rak.slice(rak.indexOf('kisi-buku')))?.[1];
  assert.equal(pertama, 'k-menanam-padi', 'unggulan di depan');
  assert.equal((await minta(e, '/pustaka/b/k-hadits-nawawi')).status, 404, 'disembunyikan');
  await kirim(e, '/portal/pustaka', sup, { unggulan: [] as string[] });
  assert.equal((await minta(e, '/pustaka/b/k-hadits-nawawi')).status, 200, 'dimunculkan lagi');
});

test('isi awal v3: nama pimpinan asli, dan tambalan tidak menimpa suntingan admin', async () => {
  const store = new Store(new FakeR2() as unknown as R2Bucket);
  await ensureSeed(store);
  assert.equal((await getUnit(store, 'mi-al-huda'))?.kepala?.nama, 'Fadli Robbi, S.Ag.');
  assert.equal((await getUnit(store, 'ra-al-huda'))?.kepala?.nama, 'Hani Nurmawati');
  assert.equal((await getUnit(store, 'mts-al-huda'))?.kepala?.nama, 'Fahmi Yazid');
  assert.ok((await getSitus(store)).organ.some((o) => o.nama === 'Yayah Hifdiyah, S.Pd.I.'));
  assert.equal((await ambil(store, 'sdm', 'sdm_0000000000000000A001'))?.judul, 'Hani Nurmawati');

  // Data live lama (isi awal v2) dengan satu suntingan admin: tambalan hanya mengganti nilai lama.
  const r2 = new FakeR2();
  const lama = new Store(r2 as unknown as R2Bucket);
  await ensureSeed(lama);
  const mi = (await lama.get<Unit>('c/unit/mi-al-huda.json'))!;
  await lama.put('c/unit/mi-al-huda.json', { ...mi, kepala: { nama: 'Fadli Robbi', jabatan: 'Kepala Madrasah' } });
  const mts = (await lama.get<Unit>('c/unit/mts-al-huda.json'))!;
  await lama.put('c/unit/mts-al-huda.json', { ...mts, kepala: { nama: 'Nama Isian Admin', jabatan: 'Kepala' } });
  const s = (await lama.get<Situs>('k/situs.json'))!;
  await lama.put('k/situs.json', { ...s, organ: s.organ.map((o) => ({ ...o, nama: o.nama.replace('Hifdiyah', 'Hipdiyah') })) });
  await lama.put('k/seed.json', { v: 2, at: 0 });
  const baru = new Store(r2 as unknown as R2Bucket);
  await ensureSeed(baru);
  assert.equal((await baru.get<Unit>('c/unit/mi-al-huda.json'))?.kepala?.nama, 'Fadli Robbi, S.Ag.', 'nilai isi awal lama diganti');
  assert.equal((await baru.get<Unit>('c/unit/mts-al-huda.json'))?.kepala?.nama, 'Nama Isian Admin', 'suntingan admin tidak ditimpa');
  assert.ok((await baru.get<Situs>('k/situs.json'))!.organ.some((o) => o.nama === 'Yayah Hifdiyah, S.Pd.I.'));
});
