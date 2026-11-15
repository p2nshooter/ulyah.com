/* Dokumen lembaga: terbilang & rupiah, nomor otomatis (create-once, aman bersamaan), kalimat penghargaan, kop, cetak,
 * pratinjau, sertifikat massal, dan Prestasi publik (penghargaan tayang wajib tampil, NISN tidak pernah bocor). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker from '../src/index.ts';
import { Store } from '../src/lib/store.ts';
import { b64url, hmac } from '../src/lib/crypto.ts';
import type { Env } from '../src/env.ts';
import { bulanRomawi, rupiah, tahunPelajaran, terbilang } from '../src/lib/text.ts';
import { DESAIN, formatNomor, kalimatPenghargaan, kodeUnit, kopDariProfil, nomorBerikut } from '../src/data/dokumen.ts';
import { createUser } from '../src/data/users.ts';
import { ensureSeed, getSitus, getUnit } from '../src/data/site.ts';
import { simpan } from '../src/data/koleksi.ts';
import { KOLEKSI } from '../src/data/defs.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const RAHASIA = 'rahasia-uji-0123456789abcdef';
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: RAHASIA });
const minta = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://yapida.sch.id${path}`, init) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);

/** Cookie sesi portal yang sah untuk akun uji (format sama dengan src/lib/session.ts). */
async function masukSebagai(e: Env, peran: 'super' | 'lembaga', units: string[] = []): Promise<string> {
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const u = await createUser(store, { nama: `Uji ${peran} ${units.join(',')}`, peran, units, pin: '40917', pepper: 'p', wajibGanti: false });
  const body = b64url(new TextEncoder().encode(JSON.stringify({ u: u.id, v: u.sv, x: Date.now() + 3_600_000 })));
  return `__Host-yp=${body}.${await hmac(RAHASIA, body)}`;
}
const kirim = (e: Env, path: string, kue: string, data: Record<string, string>) => minta(e, path, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString(), redirect: 'manual' });

test('terbilang, rupiah, bulan Romawi, tahun pelajaran', () => {
  assert.equal(terbilang(0), 'nol');
  assert.equal(terbilang(11), 'sebelas');
  assert.equal(terbilang(19), 'sembilan belas');
  assert.equal(terbilang(100), 'seratus');
  assert.equal(terbilang(1000), 'seribu');
  assert.equal(terbilang(150_000), 'seratus lima puluh ribu');
  assert.equal(terbilang(1_250_500), 'satu juta dua ratus lima puluh ribu lima ratus');
  assert.equal(terbilang(2_000_000_000), 'dua miliar');
  assert.equal(rupiah(1250000), 'Rp 1.250.000');
  assert.equal(rupiah(500), 'Rp 500');
  assert.equal(bulanRomawi(10), 'XI');
  assert.equal(tahunPelajaran(Date.UTC(2026, 10, 15)), '2026/2027');
  assert.equal(tahunPelajaran(Date.UTC(2027, 2, 1)), '2026/2027');
  assert.equal(tahunPelajaran(Date.UTC(2027, 6, 2)), '2027/2028');
});

test('nomor otomatis: urut per koleksi, lembaga, tahun; tidak pernah ganda walau disimpan bersamaan', async () => {
  const store = new Store(new FakeR2() as unknown as R2Bucket);
  const t = Date.UTC(2026, 10, 15, 3);
  const nomor = await Promise.all(Array.from({ length: 12 }, () => nomorBerikut(store, 'kwitansi', 'mi-al-huda', {}, t)));
  assert.equal(new Set(nomor).size, 12, 'semua nomor berbeda');
  assert.ok(nomor.every((n) => /^KW\/MI\/2026\/\d{4}$/.test(n)), nomor.join(','));
  assert.equal(await nomorBerikut(store, 'kwitansi', 'mts-al-huda', {}, t), 'KW/MTS/2026/0001', 'urut terpisah per lembaga');
  assert.equal(await nomorBerikut(store, 'penghargaan', 'mi-al-huda', { jenis: 'tahfidz' }, t), '001/THF/MI/XI/2026');
  assert.equal(formatNomor('surat', 7, 'yayasan', {}, t), '007/YAPIDA/XI/2026');
  assert.equal(kodeUnit('al-huda-mart'), 'MART');
});

test('kalimat penghargaan terisi otomatis dari jenis dan isian; kalimat manual menimpanya', () => {
  assert.equal(kalimatPenghargaan({ jenis: 'tahfidz', capaian: 'Juz 30', predikat: 'Mumtaz', kegiatan: 'Wisuda Tahfidz ke-5', tahun: '2026/2027' }), 'atas keberhasilannya menyelesaikan hafalan Juz 30 dengan predikat Mumtaz pada Wisuda Tahfidz ke-5 Tahun Pelajaran 2026/2027.');
  assert.equal(kalimatPenghargaan({ jenis: 'lomba', capaian: 'Lomba Adzan', predikat: 'Juara 1', kegiatan: 'MTQ Pelajar Kecamatan', tahun: '2026' }), 'sebagai Juara 1 Lomba Adzan pada MTQ Pelajar Kecamatan 2026.');
  assert.equal(kalimatPenghargaan({ jenis: 'ranking', capaian: 'Peringkat 1 Kelas 5', kegiatan: 'Semester Ganjil' }), 'atas prestasinya meraih Peringkat 1 Kelas 5 Semester Ganjil.');
  assert.equal(kalimatPenghargaan({ jenis: 'tahfidz', kalimat: 'Kalimat buatan sendiri.' }), 'Kalimat buatan sendiri.');
  assert.ok(DESAIN.length >= 10, 'minimal 10 desain');
  assert.equal(new Set(DESAIN.map((d) => d.id)).size, DESAIN.length);
  const css = fs.readFileSync(PUB + 'assets/cetak.css', 'utf8');
  for (const d of DESAIN) assert.ok(css.includes(`.d-${d.id}`), `gaya desain ${d.id}`);
});

test('kop dari profil lembaga: induk yayasan, nama lembaga; kop yayasan tanpa induk', async () => {
  const store = new Store(new FakeR2() as unknown as R2Bucket);
  await ensureSeed(store);
  const s = await getSitus(store);
  const mi = await getUnit(store, 'mi-al-huda');
  const k = kopDariProfil(mi, s);
  assert.equal(k.induk, s.nama.toUpperCase());
  assert.equal(k.nama, mi!.nama.toUpperCase());
  assert.equal(kopDariProfil(null, s).induk, '');
});

test('portal: sertifikat bernomor otomatis, cetak & pratinjau; Prestasi publik tanpa NISN; kwitansi tidak pernah publik', async () => {
  const e = env();
  const kue = await masukSebagai(e, 'lembaga', ['mi-al-huda']);
  // Formulir baru terisi otomatis (penanda tangan dari profil, tahun pelajaran).
  const form = await (await minta(e, '/portal/k/penghargaan/baru?unit=mi-al-huda', { headers: { cookie: kue } })).text();
  assert.ok(form.includes('data-pratinjau="/portal/cetak/penghargaan/pratinjau"'), 'formulir punya pratinjau langsung');
  assert.ok(form.includes(`value="${tahunPelajaran()}"`), 'tahun pelajaran terisi');
  assert.equal((form.match(/class="p-desain-butir /g) ?? []).length, DESAIN.length, 'pemilih desain berisi semua desain');
  // Pratinjau tanpa menyimpan.
  const pra = await kirim(e, '/portal/cetak/penghargaan/pratinjau', kue, { judul: 'Santri Uji', unit: 'mi-al-huda', d_jenis: 'tahfidz', d_desain: 'malam', d_capaian: 'Juz 30', d_predikat: 'Mumtaz' });
  const praH = await pra.text();
  assert.equal(pra.status, 200);
  assert.ok(praH.includes('d-malam') && praH.includes('Santri Uji') && praH.includes('PRATINJAU'));
  // Simpan → nomor otomatis → cetak.
  const r = await kirim(e, '/portal/k/penghargaan/baru', kue, { judul: 'Santri Uji', unit: 'mi-al-huda', status: 'tayang', tanggal: '2026-11-15', d_jenis: 'tahfidz', d_desain: 'zamrud', d_capaian: 'Juz 30', d_predikat: 'Mumtaz', d_kelas: 'Kelas 5A', d_nisn: '0123456789' });
  assert.equal(r.status, 302);
  const id = /\/portal\/k\/penghargaan\/([^?]+)/.exec(r.headers.get('location') ?? '')?.[1];
  assert.ok(id);
  const cetak = await (await minta(e, `/portal/cetak/penghargaan/${id}`, { headers: { cookie: kue } })).text();
  assert.match(cetak, /Nomor: 001\/THF\/MI\/[IVX]+\/20\d\d/);
  assert.ok(cetak.includes('Sertifikat Tahfidz Al-Qur’an') && cetak.includes('menyelesaikan hafalan Juz 30'));
  assert.ok(cetak.includes('yapida.sch.id/prestasi/santri-uji'), 'tautan verifikasi');
  // Prestasi publik: tampil walau tanpa centang apa pun, NISN tidak bocor.
  for (const p of ['/prestasi', '/prestasi/santri-uji', '/prestasi/santri-uji/sertifikat', '/']) {
    const h = await (await minta(e, p)).text();
    assert.ok(h.includes('Santri Uji'), `${p}: penerima tampil`);
    assert.ok(!h.includes('0123456789'), `${p}: NISN tidak tampil`);
  }
  assert.ok((await (await minta(e, '/sitemap.xml')).text()).includes('/prestasi/santri-uji'));
  // Kwitansi: terbilang otomatis, nomor otomatis, tidak publik.
  const k = await kirim(e, '/portal/k/kwitansi/baru', kue, { judul: 'Wali Murid Uji', unit: 'mi-al-huda', tanggal: '2026-11-15', d_untuk: 'spp', d_keterangan: 'SPP November 2026', d_jumlah: '150000', d_metode: 'tunai', d_lunas: '1', d_penerima: 'Bendahara Uji' });
  assert.equal(k.status, 302);
  const kid = /\/portal\/k\/kwitansi\/([^?]+)/.exec(k.headers.get('location') ?? '')?.[1];
  const kh = await (await minta(e, `/portal/cetak/kwitansi/${kid}`, { headers: { cookie: kue } })).text();
  assert.ok(kh.includes('seratus lima puluh ribu rupiah') && /KW\/MI\/20\d\d\/0001/.test(kh) && kh.includes('LUNAS'));
  assert.equal((kh.match(/class="kw /g) ?? []).length, 2, 'dua rangkap');
  assert.equal((await minta(e, `/portal/cetak/kwitansi/${kid}`)).status, 302, 'cetak tanpa masuk → ke halaman masuk');
  // Admin lembaga lain tidak bisa membuka dokumen MI.
  const kueRa = await masukSebagai(e, 'lembaga', ['ra-al-huda']);
  assert.equal((await minta(e, `/portal/cetak/kwitansi/${kid}`, { headers: { cookie: kueRa } })).status, 403);
});

test('sertifikat massal: satu baris satu sertifikat bernomor, langsung siap cetak', async () => {
  const e = env();
  const kue = await masukSebagai(e, 'lembaga', ['mi-al-huda']);
  const r = await kirim(e, '/portal/penghargaan/massal', kue, { unit: 'mi-al-huda', jenis: 'tahfidz', tanggal: '2026-11-15', desain: 'kaligrafi', kegiatan: 'Wisuda Tahfidz', tahun: '2026/2027', ttd1Nama: 'Kepala Uji', ttd1Jabatan: 'Kepala Madrasah', daftar: 'Santri Satu ; Juz 30 ; Mumtaz ; Kelas 5A ; 0011223344\nSantri Dua ; Juz 29 ; Jayyid\nSantri Tiga ; Juz 28' });
  assert.equal(r.status, 302);
  const loc = r.headers.get('location') ?? '';
  assert.ok(loc.startsWith('/portal/cetak-banyak/penghargaan?'));
  const h = await (await minta(e, loc, { headers: { cookie: kue } })).text();
  assert.equal((h.match(/class="lembar a4l sert /g) ?? []).length, 3);
  assert.ok(h.includes('Santri Satu') && h.includes('Santri Tiga'));
  const salah = await kirim(e, '/portal/penghargaan/massal', kue, { unit: 'mi-al-huda', jenis: 'tahfidz', desain: 'zamrud', daftar: 'Tanpa Capaian' });
  assert.equal(salah.status, 400);
});

test('koleksi tanpaPublik (kwitansi, surat, kop) tidak pernah masuk indeks tayang', async () => {
  const store = new Store(new FakeR2() as unknown as R2Bucket);
  const d = await simpan(store, KOLEKSI.kwitansi!, { unit: 'mi-al-huda', status: 'tayang', judul: 'X', d: { jumlah: 1 }, penulis: 'u', penulisNama: 'U' });
  assert.ok(d.ix.every((k) => !k.includes('/t/')));
});
