/* Upload data guru (pemilik 15 Nov 2026): templat, judul kolom bebas, foto yang ditempel di Excel masuk ke baris gurunya,
 * tampil di Struktur & Guru yayasan dan halaman lembaganya, data kepegawaian (NUPTK, HP, lahir …) tidak pernah tampil publik. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import { b64url, hmac } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';
import { createUser } from '../src/data/users.ts';
import { ensureSeed } from '../src/data/site.ts';
import { bacaXlsx, gambarXlsx } from '../src/lib/xlsx.ts';
import { bacaGuru, cocokFoto, kenaliJudulGuru, golonganDari } from '../src/data/guru.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const FIX = new URL('./fixtures/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const RAHASIA = 'rahasia-uji-0123456789abcdef';
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: RAHASIA });
const minta = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://yapida.sch.id${path}`, init) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
async function masukSebagai(e: Env, units: string[]): Promise<string> {
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const u = await createUser(store, { nama: `Uji ${units.join(',')}`, peran: 'lembaga', units, pin: '40917', pepper: 'p', wajibGanti: false });
  const body = b64url(new TextEncoder().encode(JSON.stringify({ u: u.id, v: u.sv, x: Date.now() + 3_600_000 })));
  return `__Host-yp=${body}.${await hmac(RAHASIA, body)}`;
}

test('judul kolom guru dikenali, golongan ditebak dari jabatan, foto dicocokkan dari nama file', () => {
  for (const [h, k] of [['Nama PTK', 'nama'], ['NUPTK', 'nuptk'], ['Peg ID', 'pegId'], ['NPK', 'npk'], ['Tugas Tambahan', 'jabatan'], ['Mapel', 'fokus'], ['Fokus Mengajar / Mata Pelajaran', 'fokus'], ['Foto (tempel di sel ini)', 'foto'], ['Nama File Foto', 'namaFoto'], ['No HP', 'hp'], ['Tempat, Tgl Lahir', 'ttl']] as const) assert.equal(kenaliJudulGuru(h), k, h);
  assert.equal(golonganDari('', 'Kepala Madrasah'), 'pimpinan');
  assert.equal(golonganDari('', 'Operator'), 'staf');
  assert.equal(golonganDari('', 'Guru Kelas 3'), 'guru');
  const r = { nama: 'Hilda Fauziyah Laily, S.Sos.', namaFoto: '', nuptk: '1234567890123456', nip: '', pegId: '', npk: '' } as never;
  assert.equal(cocokFoto(r, ['lain.jpg', 'Hilda Fauziyah Laily.JPG']), 'Hilda Fauziyah Laily.JPG');
  assert.equal(cocokFoto(r, ['1234567890123456.png']), '1234567890123456.png');
});

test('foto yang ditempel di sel Excel masuk ke baris gurunya', async () => {
  const buf = new Uint8Array(fs.readFileSync(`${FIX}guru-foto.xlsx`));
  const g = await gambarXlsx(buf);
  assert.equal(g.length, 1);
  const h = bacaGuru(await bacaXlsx(buf), g);
  assert.deepEqual(h.guru.map((x) => x.nama), ['Guru Uji Satu, S.Pd.', 'Guru Uji Dua', 'Guru Uji Tiga']);
  assert.equal(h.guru[1]!.gambar, 0, 'foto di B4 milik guru baris ke-2');
  assert.equal(h.guru[0]!.gambar, undefined);
  assert.equal(h.guru[0]!.tanggalLahir, '1990-05-03');
});

test('impor guru → tampil di Struktur & Guru dan halaman lembaga; data privat tidak pernah tampil', async () => {
  const e = env();
  const kue = await masukSebagai(e, ['mi-al-huda']);
  assert.match(await (await minta(e, '/portal/guru/impor', { headers: { cookie: kue } })).text(), /Format data guru/);
  const t = await minta(e, '/portal/guru/templat.xlsx', { headers: { cookie: kue } });
  const lembar = await bacaXlsx(new Uint8Array(await t.arrayBuffer()));
  assert.ok(lembar[0]!.baris.some((b) => b.includes('Foto (tempel di sel ini)')));
  const fd = new FormData();
  fd.set('berkas', new File([fs.readFileSync(`${FIX}guru-foto.xlsx`)], 'guru-mi.xlsx'));
  fd.set('mode', 'perbarui');
  const r = await minta(e, '/portal/guru/impor', { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin' }, body: fd });
  const prat = await r.text();
  assert.equal(r.status, 200);
  assert.match(prat, /Guru Uji Dua/);
  assert.match(prat, /Dengan foto/);
  const id = /\/portal\/kerja\/(krj_[0-9A-Z]{20})/.exec(prat)?.[1];
  assert.ok(id);
  const j = await (await minta(e, `/portal/kerja/${id}/lanjut`, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', accept: 'application/json' } })).json() as { selesai: boolean; hasil: { baru: number } };
  assert.equal(j.selesai, true);
  assert.equal(j.hasil.baru, 3);
  const struktur = await (await minta(e, '/struktur')).text();
  for (const s of ['Guru Uji Satu, S.Pd.', 'Guru Kelas 3', 'Guru Tahfidz', 'Komputer &amp; Pemrograman']) assert.ok(struktur.includes(s), s);
  for (const rahasia of ['1111222233334444', '081200000001', '1990-05-03', 'Mei 1990']) assert.ok(!struktur.includes(rahasia), `tidak bocor: ${rahasia}`);
  const lembaga = await (await minta(e, '/lembaga/mi-al-huda')).text();
  assert.match(lembaga, /Guru Uji Dua/);
  const slug = /href="\/sdm\/([^"]+)"(?:(?!<\/a>)[\s\S])*Guru Uji Dua/.exec(struktur)?.[1];
  assert.ok(slug);
  const detail = await (await minta(e, `/sdm/${slug}`)).text();
  assert.match(detail, /Tahfidz Al-Qur’an/);
  assert.doesNotMatch(detail, /5555666677778888/);
  assert.match(detail, /\/f\/\d{4}\/\d{2}\/[0-9a-z]+\.png/, 'foto dari Excel terpasang');
  // Impor ulang: diperbarui lewat NUPTK, tidak ganda
  const fd2 = new FormData(); fd2.set('berkas', new File([fs.readFileSync(`${FIX}guru-foto.xlsx`)], 'guru-mi.xlsx')); fd2.set('mode', 'perbarui');
  const id2 = /\/portal\/kerja\/(krj_[0-9A-Z]{20})/.exec(await (await minta(e, '/portal/guru/impor', { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin' }, body: fd2 })).text())?.[1];
  const j2 = await (await minta(e, `/portal/kerja/${id2}/lanjut`, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', accept: 'application/json' } })).json() as { hasil: { baru: number; ubah: number } };
  assert.deepEqual([j2.hasil.baru, j2.hasil.ubah], [0, 3]);
  // Data privat terlihat di portal (formulir pengelola) dan unduhan privat
  const unduh = await bacaXlsx(new Uint8Array(await (await minta(e, '/portal/guru/unduh.xlsx', { headers: { cookie: kue } })).arrayBuffer()));
  assert.ok(unduh[0]!.baris.some((b) => b.includes('1111222233334444')));
});
