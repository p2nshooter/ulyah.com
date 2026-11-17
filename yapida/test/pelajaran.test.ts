/* Buku Pelajaran Yapida (pemilik, 17 Nov 2026: „g ada bukunya saat di klik … Tolong yg bener bukunya, yg antara menu
 * pelajaran madrasah dengan rak“): setiap mapel MI kelas 1–6 punya buku pelajaran, muatan lokal Tahfidz 1–6, BTQ 1–5,
 * Nahwu Sharaf 4–6; buku PAI umum hanya pendukung; bacaan pendukung sesuai usia; latihan siswa Ganjil & Genap. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import type { Env } from '../src/env.ts';
import { KURIKULUM, bukuMapel } from '../src/data/kurikulum.ts';
import type { KartuBuku } from '../src/data/pustaka.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: 'rahasia-uji-0123456789abcdef' });
const minta = (e: Env, path: string) => worker.fetch(new Request(`https://yapida.sch.id${path}`, { redirect: 'manual' }) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
const katalog = (JSON.parse(fs.readFileSync(`${PUB}assets/pustaka/katalog.json`, 'utf8')) as { buku: (KartuBuku & { kur?: string })[] }).buku;

test('kurikulum MI: Tahfidz 1–6, BTQ 1–5 (tidak di kelas 6), Nahwu Sharaf 4–6', () => {
  const mi = KURIKULUM.mi.mapel;
  assert.deepEqual(mi.find((m) => m.slug === 'tahfidz')?.kelas, [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(mi.find((m) => m.slug === 'btq')?.kelas, [1, 2, 3, 4, 5]);
  assert.deepEqual(mi.find((m) => m.slug === 'nahwu-sharaf')?.kelas, [4, 5, 6]);
  assert.ok(!mi.some((m) => /sunda/.test(m.slug)), 'tidak menambah mapel yang tidak diminta');
});

test('kurikulum MTs: Tahfidz, BTQ, dan Nahwu Sharaf kelas 7–9', () => {
  const mts = KURIKULUM.mts.mapel;
  for (const slug of ['tahfidz', 'btq', 'nahwu-sharaf']) assert.deepEqual(mts.find((m) => m.slug === slug)?.kelas, [7, 8, 9], slug);
});

test('setiap mapel MI 1–6 dan MTs 7–9 punya buku pelajaran (tidak ada „sedang disusun“), PAI umum hanya pendukung', () => {
  for (const j of ['mi', 'mts'] as const) {
    for (const k of KURIKULUM[j].kelas) {
      for (const m of KURIKULUM[j].mapel.filter((x) => x.kelas.includes(k))) {
        const isi = bukuMapel(katalog as KartuBuku[], j, k, m);
        assert.ok(isi.pelajaran.length > 0, `${m.nama} kelas ${k} ${j}: belum ada buku pelajaran`);
        if (m.bseDukung || ['tahfidz', 'btq', 'nahwu-sharaf'].includes(m.slug)) {
          assert.ok(isi.pelajaran.every((b) => b.mapel !== 'Pendidikan Agama Islam'), `${m.nama} kelas ${k}: buku PAI umum bukan buku pelajaran utama`);
          assert.ok(isi.pelajaran.some((b) => (b as { kur?: string }).kur === `${j}-${k}-${m.slug}`), `${m.nama} kelas ${k} ${j}: Buku Pelajaran Yapida`);
        }
        if (j === 'mi') assert.ok(isi.dukung.every((b) => b.suara !== 'dewasa' || b.rak.includes('mi')), `${m.nama} kelas ${k}: bacaan pendukung sesuai usia`);
      }
    }
  }
});

test('buku pelajaran tampil sama di peta Pelajaran Madrasah dan rak MI; latihan siswa Ganjil & Genap ada', async () => {
  const e = env();
  const hal = await minta(e, '/pustaka/pelajaran/mi/1/fikih');
  assert.equal(hal.status, 200);
  const h = await hal.text();
  assert.match(h, /Fikih Kelas 1 MI/);
  assert.doesNotMatch(h, /sedang disusun/);
  assert.doesNotMatch(h, /Minhajut Thalibin|Fathul Qarib/, 'kitab dewasa tidak muncul di pelajaran MI');
  assert.match(h, /class="h1-ikon"/, 'ikon emoji judul tidak menjadi siluet gradasi');
  const rak = await (await minta(e, '/pustaka/rak/mi')).text();
  assert.match(rak, /k-pel-mi-1-fikih/, 'buku yang sama ada di rak MI');
  const buku = await minta(e, '/pustaka/b/k-pel-mi-4-tahfidz');
  assert.equal(buku.status, 200);
  const indeks = (JSON.parse(fs.readFileSync(`${PUB}assets/soal/indeks.json`, 'utf8')) as { paket: { id: string }[] }).paket.map((x) => x.id);
  for (const id of ['b-mi1-fikih-ganjil-latihan', 'b-mi1-fikih-genap-latihan', 'b-mi4-tahfidz-ganjil-latihan', 'b-mi6-nahwu-sharaf-genap-latihan', 'b-mi5-btq-ganjil-latihan', 'b-mts7-tahfidz-ganjil-latihan', 'b-mts8-btq-genap-latihan', 'b-mts9-nahwu-sharaf-genap-latihan', 'b-mts9-fikih-ganjil-latihan']) assert.ok(indeks.includes(id), `${id} ada`);
});
