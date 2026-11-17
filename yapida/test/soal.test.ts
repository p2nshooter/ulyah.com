/* Bank Soal (perintah pemilik 22 & 37): format teks paket, penilaian (isian toleran ejaan), kunci tidak pernah terkirim
 * sebelum diserahkan, paket berkunci tidak bisa diunduh, siswa masuk → hasil tersimpan & bisa dicetak hanya olehnya,
 * guru membuat paket (draf tidak terlihat siswa), cetak legal berkop, Word, dan rekap nilai. */
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
import { simpanTerkait } from '../src/data/kait.ts';
import { KOLEKSI } from '../src/data/defs.ts';
import { cocokIsian, nilaiPaket, uraiSoal, CONTOH_FORMAT, type Paket } from '../src/data/soal.ts';

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
const PAKET = 'b-mi4-fikih-ganjil-pas'; // bank soal guru (ujian)
const LATIHAN = 'b-mi4-fikih-ganjil-latihan'; // bank soal siswa (dari Buku Pelajaran Yapida Fikih Kelas 4)
const muatPaket = (id: string) => JSON.parse(fs.readFileSync(`${PUB}assets/soal/p/${id}.json`, 'utf8')) as Paket;

test('bank soal: format teks baku, galat jelas, isian toleran ejaan', () => {
  const h = uraiSoal(CONTOH_FORMAT);
  assert.ok(h.paket, h.galat.join(' '));
  assert.equal(h.paket!.pg[0]!.k, 1);
  assert.ok(h.peringatan.length > 0, 'contoh pendek diberi peringatan format baku 15/5/10/5');
  const rusak = uraiSoal('@jenjang mi\n@kelas 4\n@mapel Fikih\n[PILIHAN GANDA]\n1. Soal tanpa kunci?\na. satu\nb. dua\nc. tiga');
  assert.equal(rusak.paket, null);
  assert.match(rusak.galat.join(' '), /tandai jawaban benar/);
  assert.ok(cocokIsian('Idul Fitri', ['Idulfitri', 'Idul Fitri']));
  assert.ok(cocokIsian('  sha’  ', ["sha'"]), 'tanda petik apa pun');
  assert.ok(cocokIsian('2,5', ['2.5']));
  assert.ok(!cocokIsian('', ['x']));
  assert.ok(cocokIsian('Nabi Muhammad saw', ['Nabi Muhammad']), 'jawaban sedikit lebih panjang yang memuat kunci utuh');
  // semua paket bawaan memenuhi format baku dan nilai maksimal 100
  const indeks = JSON.parse(fs.readFileSync(`${PUB}assets/soal/indeks.json`, 'utf8')).paket as { id: string; jenjang: string }[];
  assert.ok(indeks.length >= 9);
  for (const it of indeks.filter((x) => x.jenjang !== 'ra')) {
    const p = muatPaket(it.id);
    if (p.jenis === 'latihan') assert.ok(p.pg.length >= 5, `${it.id}: latihan siswa minimal 5 soal`);
    else assert.deepEqual([p.pg.length, p.jodoh.kiri.length, p.isian.length, p.uraian.length], [15, 5, 10, 5], it.id);
    const sempurna = nilaiPaket(p, { pg: p.pg.map((s) => s.k), jodoh: p.jodoh.kiri.map((s) => s.k), isian: p.isian.map((s) => s.k[0]!), uraian: p.uraian.map(() => 'x'), diri: p.uraian.map(() => 2) });
    assert.equal(sempurna.nilai, 100, it.id);
  }
});

test('bank soal publik: hanya latihan siswa; soal ujian guru 404; kunci tidak terkirim sebelum diserahkan; penilaian di server', async () => {
  const e = env();
  const idx = await minta(e, '/bank-soal');
  assert.equal(idx.status, 200);
  const hIdx = await idx.text();
  assert.match(hIdx, new RegExp(`/bank-soal/${LATIHAN}`), 'latihan siswa tampil di halaman publik');
  assert.doesNotMatch(hIdx, new RegExp(`/bank-soal/${PAKET}`), 'soal ujian PTS/PAS tidak tampil di publik');
  assert.equal((await minta(e, `/bank-soal/${PAKET}`)).status, 404, 'tamu tidak bisa membuka soal ujian guru');
  assert.equal((await minta(e, `/api/soal/${PAKET}/nilai`, { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: '{}' })).status, 404);
  const p = muatPaket(LATIHAN);
  const hal = await minta(e, `/bank-soal/${LATIHAN}`);
  assert.equal(hal.status, 200);
  const h = await hal.text();
  const json = JSON.parse(/<script type="application\/json" id="paket">([\s\S]*?)<\/script>/.exec(h)![1]!.replace(/\\u003c/g, '<')) as { pg: { k?: number }[] };
  assert.equal(json.pg.length, p.pg.length);
  assert.ok(json.pg.every((x) => x.k === undefined), 'tidak ada kunci PG di halaman');
  const bahas = p.pg.find((x) => x.b)!.b!;
  assert.ok(!h.includes(bahas.slice(0, 40)), 'pembahasan tidak ada sebelum diserahkan');
  assert.equal((await minta(e, `/assets/soal/p/${LATIHAN}.json`)).status, 404, 'paket berkunci tidak bisa diunduh');
  const nilai = await minta(e, `/api/soal/${LATIHAN}/nilai`, { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: JSON.stringify({ jawaban: { pg: p.pg.map((x) => x.k), jodoh: p.jodoh.kiri.map((x) => x.k), isian: [], uraian: [] } }) });
  assert.equal(nilai.status, 200);
  const r = (await nilai.json()) as { nilai: number; kunci: { pg: number[] }; bahas: { pg: (string | null)[] }; hasil?: string };
  assert.equal(r.kunci.pg.length, p.pg.length);
  assert.ok(r.bahas.pg.some(Boolean), 'pembahasan dikirim sesudah diserahkan');
  assert.equal(r.hasil, undefined, 'tamu: tidak disimpan');
  assert.equal(r.nilai, 100);
  assert.equal((await minta(e, `/api/soal/${LATIHAN}/nilai`, { method: 'POST', headers: { 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }, body: '{}' })).status, 403);
});

test('bank soal siswa: masuk NISN + tanggal lahir → paket kelasnya, hasil tersimpan, cetak hanya miliknya; guru merekap', async () => {
  const e = env();
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const kSuper = await akun(e, 'Uji Super', 'super');
  await simpanTerkait(store, KOLEKSI.siswa!, { unit: 'mi-al-huda', status: 'tayang', judul: 'Siswa Uji Empat', d: { jenjang: 'MI', tingkat: 'Kelas 4', rombel: '4-A', tahunAcuan: '2026/2027', nisn: '0161112223', jk: 'L', tanggalLahir: '2016-04-30', statusSiswa: 'aktif' }, penulis: 'uji', penulisNama: 'Uji' }, KOLEKSI);
  const masuk = await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: 'nomor=0161112223&sandi=30%2F04%2F2016' });
  const kue = (masuk.headers.get('set-cookie') ?? '').split(';')[0]!;
  assert.match(kue, /^__Host-ysw=/);
  const beranda = await (await minta(e, '/siswa', { headers: { cookie: kue } })).text();
  assert.match(beranda, new RegExp(`/siswa/bank-soal/${LATIHAN}`), 'beranda siswa menampilkan latihan kelasnya');
  let daftar = await (await minta(e, '/siswa/bank-soal', { headers: { cookie: kue } })).text();
  assert.match(daftar, /Kelasku/);
  assert.match(daftar, /Fikih/);
  assert.doesNotMatch(daftar, new RegExp(PAKET), 'soal ujian belum dibagikan → tidak terlihat siswa');
  assert.equal((await minta(e, `/siswa/bank-soal/${PAKET}`, { headers: { cookie: kue } })).status, 404);
  // guru (kontributor) tidak boleh membagikan; admin lembaga membagikan sesudah ujian
  const kGuru = await akun(e, 'Uji Guru Bagi', 'kontributor', ['mi-al-huda']);
  const kMi = await akun(e, 'Uji Admin MI Bagi', 'lembaga', ['mi-al-huda']);
  const bagi = (kueA: string, b: string) => minta(e, `/portal/bank-soal/${PAKET}/bagikan`, { method: 'POST', headers: { cookie: kueA, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ unit: 'mi-al-huda', bagi: b }).toString() });
  assert.equal((await bagi(kGuru, '1')).status, 403);
  assert.equal((await bagi(kMi, '1')).status, 303);
  assert.match(await (await minta(e, `/portal/bank-soal/${PAKET}`, { headers: { cookie: kMi } })).text(), /Sudah dibagikan/);
  daftar = await (await minta(e, '/siswa/bank-soal', { headers: { cookie: kue } })).text();
  assert.match(daftar, new RegExp(PAKET), 'sesudah dibagikan, soal ujian muncul di Portal Siswa');
  const p = muatPaket(PAKET);
  const kirim = await minta(e, `/api/soal/${PAKET}/nilai`, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: JSON.stringify({ jawaban: { pg: p.pg.map((s) => s.k), jodoh: p.jodoh.kiri.map((s) => s.k), isian: p.isian.map((s) => s.k[0]), uraian: p.uraian.map(() => 'jawabanku') } }) });
  const r = (await kirim.json()) as { nilai: number; hasil: string };
  assert.equal(r.nilai, 100, 'semua otomatis benar, uraian belum dinilai → 100 dari bagian otomatis');
  assert.match(r.hasil, new RegExp(`^${PAKET}/`));
  const diri = await minta(e, `/api/soal/hasil/${r.hasil}/diri`, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: JSON.stringify({ diri: [2, 2, 1, 0, 2] }) });
  assert.equal(((await diri.json()) as { nilai: number }).nilai, 88, '60 + (4×8 + 4)/… → 88');
  const cetak = await minta(e, `/siswa/bank-soal/hasil/${r.hasil}`, { headers: { cookie: kue } });
  assert.equal(cetak.status, 200);
  const hc = await cetak.text();
  assert.match(hc, /Hasil Latihan/);
  assert.match(hc, /www\.yapida\.sch\.id/);
  assert.match(hc, /size:8\.5in 14in/);
  assert.equal((await minta(e, `/siswa/bank-soal/hasil/${r.hasil}`)).status, 302, 'tanpa sesi → ke halaman masuk');
  // guru (super) melihat rekap + CSV
  const rekap = await (await minta(e, `/portal/bank-soal/${PAKET}/hasil`, { headers: { cookie: kSuper } })).text();
  assert.match(rekap, /Siswa Uji Empat/);
  assert.match(rekap, /88/);
  const csv = await minta(e, `/portal/bank-soal/${PAKET}/hasil?csv=1`, { headers: { cookie: kSuper } });
  assert.match(csv.headers.get('content-type') ?? '', /text\/csv/);
  assert.match(await csv.text(), /Siswa Uji Empat/);
});

test('bank soal guru: buat paket (draf tak terlihat siswa), cetak legal berkop, Word, hapus', async () => {
  const e = env();
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const kMi = await akun(e, 'Uji Admin MI', 'lembaga', ['mi-al-huda']);
  const kGuru = await akun(e, 'Uji Guru', 'kontributor', ['mi-al-huda']);
  const daftar = await (await minta(e, '/portal/bank-soal', { headers: { cookie: kGuru } })).text();
  assert.match(daftar, /Paket bawaan yayasan/);
  assert.match(daftar, /Soal ujian guru/);
  const peta = await (await minta(e, '/portal/bank-soal?tab=peta&jenjang=mi&kelas=4', { headers: { cookie: kGuru } })).text();
  assert.match(peta, /Peta kelengkapan/);
  assert.match(peta, /Nahwu Sharaf/, 'muatan lokal MI ikut dipetakan');
  assert.match(peta, /\+ Buat/, 'slot kosong bisa langsung dibuat');
  const templat = await (await minta(e, '/portal/bank-soal/baru?jenjang=mi&kelas=5&mapel=Matematika&semester=genap&jenis=pts', { headers: { cookie: kGuru } })).text();
  assert.match(templat, /@mapel Matematika/);
  assert.match(templat, /@jenis pts/);
  assert.match(templat, /@semester genap/);
  const periksa = await minta(e, '/portal/bank-soal/periksa', { method: 'POST', headers: { cookie: kGuru, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: JSON.stringify({ teks: CONTOH_FORMAT }) });
  const pj = (await periksa.json()) as { galat: string[]; ringkas: string };
  assert.equal(pj.galat.length, 0);
  assert.match(pj.ringkas, /PAS Ganjil Fikih Kelas 4 MI/);
  // kontributor hanya bisa menyimpan draf walau memilih tayang
  const simpan = await minta(e, '/portal/bank-soal/simpan', { method: 'POST', headers: { cookie: kGuru, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ teks: CONTOH_FORMAT, unit: 'mi-al-huda', status: 'tayang' }).toString() });
  assert.equal(simpan.status, 303);
  const id = simpan.headers.get('location')!.split('/').pop()!;
  assert.match(id, /^soal_[0-9A-Z]{20}$/);
  const detail = await (await minta(e, `/portal/bank-soal/${id}`, { headers: { cookie: kGuru } })).text();
  assert.match(detail, /Draf/);
  assert.equal((await minta(e, `/bank-soal/${id}`)).status, 404, 'paket guru tidak publik');
  // cetak legal berkop + Word
  const cetak = await minta(e, `/portal/bank-soal/${PAKET}/cetak?unit=mi-al-huda`, { headers: { cookie: kMi } });
  const hc = await cetak.text();
  assert.match(hc, /size:8\.5in 14in/);
  assert.match(hc, /class="kop/);
  assert.match(hc, /Berilah tanda silang/);
  assert.doesNotMatch(hc, /class="bs-kunci"/);
  const kunci = await (await minta(e, `/portal/bank-soal/${PAKET}/cetak?unit=mi-al-huda&kunci=1`, { headers: { cookie: kMi } })).text();
  assert.match(kunci, /KUNCI JAWABAN/);
  const doc = await minta(e, `/portal/bank-soal/${PAKET}/doc?unit=mi-al-huda`, { headers: { cookie: kMi } });
  assert.match(doc.headers.get('content-type') ?? '', /application\/msword/);
  assert.match(doc.headers.get('content-disposition') ?? '', /\.doc"/);
  // admin lembaga menayangkan lalu menghapus
  const tayang = await minta(e, '/portal/bank-soal/simpan', { method: 'POST', headers: { cookie: kMi, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ teks: CONTOH_FORMAT, unit: 'mi-al-huda', status: 'tayang', id }).toString() });
  assert.equal(tayang.status, 303);
  assert.match(await (await minta(e, `/portal/bank-soal/${id}`, { headers: { cookie: kMi } })).text(), /Tayang/);
  assert.equal((await minta(e, `/portal/bank-soal/${id}/hapus`, { method: 'POST', headers: { cookie: kMi, 'sec-fetch-site': 'same-origin' } })).status, 303);
  assert.notEqual((await minta(e, `/portal/bank-soal/${id}`, { headers: { cookie: kMi } })).status, 200);
});
