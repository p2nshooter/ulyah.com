/* Kesiswaan & Portal Siswa (perintah pemilik 22, 24–26): pembaca file master pintar, tanggal bentuk apa pun, alamat
 * rapi, impor bertahap, kelas naik otomatis & lulus terkunci, masuk portal siswa dengan NISN/NIS + tanggal lahir,
 * tagihan massal → kwitansi → lunas, laporan, dan unduhan Excel berkop. Tidak ada data siswa sungguhan di uji ini. */
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
import { bacaXlsx, tulisXlsx } from '../src/lib/xlsx.ts';
import { normalTanggal, posisi, rombelDariKelas, levelTingkat } from '../src/data/siswa.ts';
import { bacaMaster, kenaliJudul } from '../src/data/master.ts';
import { rapikanAlamat, tulisAlamat } from '../src/lib/alamat.ts';

const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = { fetch: async (req: Request) => { try { return new Response(fs.readFileSync(PUB + new URL(req.url).pathname.replace(/^\/+/, ''))); } catch { return new Response('tidak ada', { status: 404 }); } } } as unknown as Fetcher;
const RAHASIA = 'rahasia-uji-0123456789abcdef';
const env = (): Env => ({ DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: RAHASIA });
const minta = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://yapida.sch.id${path}`, init) as never, e, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
async function masukSebagai(e: Env, peran: 'super' | 'lembaga', units: string[] = []): Promise<string> {
  const store = new Store(e.DATA);
  await ensureSeed(store);
  const u = await createUser(store, { nama: `Uji ${peran} ${units.join(',')}`, peran, units, pin: '40917', pepper: 'p', wajibGanti: false });
  const body = b64url(new TextEncoder().encode(JSON.stringify({ u: u.id, v: u.sv, x: Date.now() + 3_600_000 })));
  return `__Host-yp=${body}.${await hmac(RAHASIA, body)}`;
}
const kirim = (e: Env, path: string, kue: string, data: Record<string, string>, extra: Record<string, string> = {}) => minta(e, path, { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded', ...extra }, body: new URLSearchParams(data).toString(), redirect: 'manual' });
const kueDari = (r: Response) => (r.headers.get('set-cookie') ?? '').split(';')[0]!;

test('tanggal lahir bentuk apa pun → YYYY-MM-DD; nama bulan & singkatannya jadi angka', () => {
  const kini = Date.UTC(2026, 10, 15);
  for (const [masuk, hasil] of [['300400', '2000-04-30'], ['30/04/2000', '2000-04-30'], ['30-4-00', '2000-04-30'], ['30042000', '2000-04-30'], ['2000-04-30', '2000-04-30'], ['20000430', '2000-04-30'],
    ['3 feb 2016', '2016-02-03'], ['3 Februari 2016', '2016-02-03'], ['28 Pebruari 2016', '2016-02-28'], ['7 Agt 2015', '2015-08-07'], ['7 Agustus 2015', '2015-08-07'], ['12 Des 2014', '2014-12-12'],
    ['April 30, 2000', '2000-04-30'], ['Bekasi, 30 April 2015', '2015-04-30'], ['15.05.2017', '2017-05-15'], ['05/30/2000', '2000-05-30'], ['43687', '2019-08-10']] as const) {
    assert.equal(normalTanggal(masuk, kini), hasil, masuk);
  }
  for (const salah of ['30 feb 2016', '31/04/2015', 'kemarin', '', '123']) assert.equal(normalTanggal(salah, kini), null, salah);
});

test('kelas gabungan, tingkat Romawi, kenaikan kelas otomatis dan lulus', () => {
  assert.equal(rombelDariKelas('3A'), '3-A');
  assert.equal(rombelDariKelas('VII-B'), '7-B');
  assert.equal(rombelDariKelas('A1'), 'A-1');
  assert.equal(levelTingkat('VII B'), 7);
  assert.equal(levelTingkat('Kelompok B'), 1);
  const d = { jenjang: 'MI', tingkat: 'Kelas 5', rombel: '5-A', tahunAcuan: '2025/2026', statusSiswa: 'aktif' };
  assert.deepEqual([posisi(d, 'mi-al-huda', Date.UTC(2026, 10, 1)).tingkat, posisi(d, 'mi-al-huda', Date.UTC(2026, 10, 1)).rombel], ['Kelas 6', '6-A']);
  const lulus = posisi(d, 'mi-al-huda', Date.UTC(2027, 7, 1));
  assert.equal(lulus.status, 'lulus');
  assert.equal(lulus.lulusTp, '2026/2027');
});

test('alamat ditulis dengan ejaan baku (kop, sertifikat, formulir)', () => {
  assert.equal(rapikanAlamat('KP. KUDA-KUDA RT 03/02 DS. SUKAKARYA KEC. SUKAKARYA KAB. BEKASI JAWA BARAT'), 'Kp. Kuda-kuda RT 003/RW 002, Desa Sukakarya, Kec. Sukakarya, Kab. Bekasi, Jawa Barat');
  assert.equal(rapikanAlamat('jln raya sukakarya no 12 rt 1 rw 4 desa sukakarya kec sukakarya kab bekasi 17641'), 'Jl. Raya Sukakarya No. 12, RT 001/RW 004, Desa Sukakarya, Kec. Sukakarya, Kab. Bekasi 17641');
  assert.equal(tulisAlamat({ jalan: 'Jl. Yapida No. 3', kampung: 'Kuda-kuda', rt: '3', rw: '2', desa: 'Sukakarya', kecamatan: 'Sukakarya', kabupaten: 'Bekasi', provinsi: 'Jawa Barat', kodepos: '17641' }, { singkat: false }), 'Jl. Yapida No. 3, Kp. Kuda-kuda RT 003/RW 002, Desa Sukakarya, Kecamatan Sukakarya, Kabupaten Bekasi, Jawa Barat 17641');
});

test('pembaca file master pintar: judul bebas, judul dua tingkat, TTL, pemisah kelas, tanpa judul', () => {
  for (const [h, k] of [['Nama Lengkap Siswa', 'nama'], ['NAMA PESERTA DIDIK', 'nama'], ['JK', 'jk'], ['L/P', 'jk'], ['TTL', 'ttl'], ['No Induk', 'nis'], ['NISN (10 Digit)', 'nisn'], ['NIK Ayah', 'abaikan'], ['Nama Ayah Kandung', 'ayah'], ['No. KK (16 Digit)', 'kk'], ['Kls', 'kelas'], ['Tingkat/Kelompok', 'tingkat'], ['Nama Rombel', 'rombel']] as const) assert.equal(kenaliJudul(h), k, h);
  const h = bacaMaster([
    { nama: 'Sheet1', baris: [['', 'DAFTAR PESERTA DIDIK'], ['', 'MADRASAH IBTIDAIYAH AL HUDA'], ['', 'TAHUN PELAJARAN 2026/2027'], [], ['NO', 'NAMA PESERTA DIDIK', 'JK', 'TTL', 'NISN', 'NO INDUK'], ['KELAS 1-A'], ['1', 'ANAK UJI SATU', 'P', 'Bekasi, 30 April 2019', '19234567', '2301'], ['KELAS 2 B'], ['1', "MA'RUF UJI", 'L', 'BEKASI, 12-12-2018', '0181234567', '2201'], ['', 'Jumlah', '2'], ['', 'Mengetahui, Kepala Madrasah']] },
    { nama: 'MTs 7', baris: [['No', 'Nama Siswa', 'L/P', 'Tanggal Lahir', '', '', 'Data Ayah', '', 'Kelas', 'NISN'], ['', '', '', 'Tgl', 'Bln', 'Thn', 'Nama', 'NIK', '', ''], ['1', 'SISWA UJI EMPAT', 'P', '7', 'Agustus', '2013', 'Ayah Uji', '3216000000000009', '7B', '0131111111']] },
    { nama: 'RA', baris: [['1', 'ANAK UJI ENAM', 'P', 'Bekasi', '30/04/2021', 'Kelompok A', '2101'], ['2', 'ANAK UJI TUJUH', 'L', 'Bekasi', '01-05-2021', 'Kelompok B', '2102'], ['3', 'ANAK UJI DELAPAN', 'P', 'Bekasi', '2 Mei 2021', 'Kelompok A', '2103']] },
  ]);
  const nama = h.siswa.map((s) => s.nama);
  assert.deepEqual(nama, ['Anak Uji Satu', "Ma'ruf Uji", 'Siswa Uji Empat', 'Anak Uji Enam', 'Anak Uji Tujuh', 'Anak Uji Delapan']);
  const satu = h.siswa[0]!;
  assert.equal(satu.tempatLahir, 'Bekasi');
  assert.equal(satu.tingkat, 'Kelas 1');
  assert.equal(satu.rombel, '1-A');
  assert.equal(satu.petunjuk.tp, '2026/2027');
  assert.equal(h.siswa[1]!.rombel, '2-B');
  const empat = h.siswa[2]!;
  assert.equal(empat.ayah, 'Ayah Uji');
  assert.equal(empat.nik, '', 'NIK ayah tidak masuk ke NIK siswa');
  assert.equal(empat.rombel, '7-B');
  assert.equal(normalTanggal(empat.tanggalLahir), '2013-08-07');
  assert.equal(h.siswa[3]!.tingkat, 'Kelompok A');
  assert.ok(h.laporan.some((l) => l.nama === 'RA' && l.kolom.some((k) => k.kunci === 'nama' && k.dari.includes('dikenali dari isi'))));
});

test('impor bertahap → daftar siswa → portal siswa (NISN/NIS + tanggal lahir) → tagihan massal → bayar → lunas → laporan & unduhan', async () => {
  const e = env();
  const kue = await masukSebagai(e, 'lembaga', ['mi-al-huda']);
  // File „berantakan“: judul di atas, kolom acak, kelas gabungan, tanggal campur.
  const berkas = tulisXlsx([{ nama: 'Data MI', judul: 'DATA SISWA MI AL HUDA TAHUN PELAJARAN 2026/2027', kepala: ['NAMA PESERTA DIDIK', 'Kls', 'JK', 'TTL', 'NISN', 'NO INDUK', 'NAMA IBU', 'ALAMAT'], baris: [
    ['ANAK UJI SATU', '3A', 'L', 'Bekasi, 30 April 2018', '0181111111', '3001', 'IBU UJI', 'kp kuda-kuda rt 3 rw 2 desa sukakarya kec sukakarya'],
    ['ANAK UJI DUA', '6B', 'P', 'Bekasi 7 agt 2015', '0152222222', '3002', 'Ibu Dua', ''],
    ['ANAK UJI TIGA', 'Kelas 9', 'L', '01-01-2012', '0123333333', '3003', '', ''], // kelas 9 bukan MI → ditolak
  ] }]);
  const fd = new FormData();
  fd.set('berkas', new File([berkas], 'master-uji.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  fd.set('mode', 'perbarui');
  const r = await minta(e, '/portal/siswa/impor', { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin' }, body: fd });
  assert.equal(r.status, 200);
  const prat = await r.text();
  assert.match(prat, /Siap disimpan/);
  assert.match(prat, /tidak ada di jenjang MI|Bukan lembaga yang Anda kelola/);
  const id = /\/portal\/kerja\/(krj_[0-9A-Z]{20})/.exec(prat)?.[1];
  assert.ok(id, 'pekerjaan dibuat');
  let j: { selesai: boolean; hasil: { baru: number; gagalN: number } } = { selesai: false, hasil: { baru: 0, gagalN: 0 } };
  for (let i = 0; i < 5 && !j.selesai; i += 1) j = await (await kirim(e, `/portal/kerja/${id}/lanjut`, kue, {}, { accept: 'application/json' })).json() as typeof j;
  assert.equal(j.selesai, true);
  assert.equal(j.hasil.baru, 2);
  // Impor ulang file yang sama tidak menggandakan (diperbarui)
  const fd2 = new FormData(); fd2.set('berkas', new File([berkas], 'master-uji.xlsx')); fd2.set('mode', 'perbarui');
  const id2 = /\/portal\/kerja\/(krj_[0-9A-Z]{20})/.exec(await (await minta(e, '/portal/siswa/impor', { method: 'POST', headers: { cookie: kue, 'sec-fetch-site': 'same-origin' }, body: fd2 })).text())?.[1];
  const j2 = await (await kirim(e, `/portal/kerja/${id2}/lanjut`, kue, {}, { accept: 'application/json' })).json() as { hasil: { baru: number; ubah: number } };
  assert.deepEqual([j2.hasil.baru, j2.hasil.ubah], [0, 2]);

  const daftar = await (await minta(e, '/portal/siswa', { headers: { cookie: kue } })).text();
  assert.match(daftar, /Anak Uji Satu/);
  assert.match(daftar, /Kelas 3/);
  assert.match(daftar, /3-A/);
  assert.doesNotMatch(daftar, /Anak Uji Tiga/);

  // Portal siswa: NISN + „300418“ (ddmmyy) dan NIS + „30 April 2018“ sama-sama bisa
  const salah = await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: 'nomor=0181111111&sandi=010101', redirect: 'manual' });
  assert.equal(salah.status, 400);
  const benar = await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: 'nomor=0181111111&sandi=300418', redirect: 'manual' });
  assert.equal(benar.status, 302);
  const ks = kueDari(benar);
  const lewatNis = await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: `nomor=3001&sandi=${encodeURIComponent('30 April 2018')}`, redirect: 'manual' });
  assert.equal(lewatNis.status, 302);

  // Tagihan massal kelas 3 → muncul di portal siswa → bayar lewat kwitansi → lunas
  const tm = await kirim(e, '/portal/tagihan/massal', kue, { unit: 'mi-al-huda', tingkat: 'Kelas 3', rombel: '', untuk: 'spp', periode: 'Desember 2026', jumlah: '150000', jatuhTempo: '2026-12-10' });
  const idT = /\/portal\/kerja\/(krj_[0-9A-Z]{20})/.exec(tm.headers.get('location') ?? '')?.[1];
  assert.ok(idT);
  const jt = await (await kirim(e, `/portal/kerja/${idT}/lanjut`, kue, {}, { accept: 'application/json' })).json() as { hasil: { baru: number } };
  assert.equal(jt.hasil.baru, 1, 'hanya siswa kelas 3');
  const ulangT = await kirim(e, '/portal/tagihan/massal', kue, { unit: 'mi-al-huda', tingkat: 'Kelas 3', rombel: '', untuk: 'spp', periode: 'Desember 2026', jumlah: '150000' });
  const jt2 = await (await kirim(e, `/portal/kerja/${/krj_[0-9A-Z]{20}/.exec(ulangT.headers.get('location') ?? '')![0]}/lanjut`, kue, {}, { accept: 'application/json' })).json() as { hasil: { baru: number; lewat: number } };
  assert.deepEqual([jt2.hasil.baru, jt2.hasil.lewat], [0, 1], 'tagihan massal aman diulang');
  let beranda = await (await minta(e, '/siswa', { headers: { cookie: ks } })).text();
  assert.match(beranda, /Anak Uji Satu/);
  assert.match(beranda, /Belum dibayar/);
  assert.match(beranda, /Rp 150\.000/);
  assert.doesNotMatch(beranda, /adsbygoogle/);
  const tagihanHal = await (await minta(e, '/portal/tagihan', { headers: { cookie: kue } })).text();
  const idTagihan = /\/portal\/k\/kwitansi\/baru\?tagihan=(tagi_[0-9A-Z]{20})/.exec(tagihanHal)?.[1];
  assert.ok(idTagihan, 'tombol Bayar');
  const formKw = await (await minta(e, `/portal/k/kwitansi/baru?tagihan=${idTagihan}`, { headers: { cookie: kue } })).text();
  assert.match(formKw, /value="150000"/);
  const simpanKw = await kirim(e, '/portal/k/kwitansi/baru', kue, { unit: 'mi-al-huda', judul: 'Anak Uji Satu', status: 'tayang', d_untuk: 'spp', d_keterangan: 'Desember 2026', d_jumlah: '150000', d_metode: 'tunai', d_lunas: '1', d_nisn: '0181111111', d_tagihan: idTagihan! });
  assert.equal(simpanKw.status, 302);
  beranda = await (await minta(e, '/siswa', { headers: { cookie: ks } })).text();
  assert.match(beranda, /Lunas/);
  const idKw = /\/siswa\/kwitansi\/(kwit_[0-9A-Z]{20})/.exec(beranda)?.[1];
  assert.ok(idKw, 'kwitansi tampil di portal siswa');
  assert.equal((await minta(e, `/siswa/kwitansi/${idKw}`, { headers: { cookie: ks } })).status, 200);
  assert.equal((await minta(e, `/siswa/kwitansi/${idKw}`)).status, 302, 'tanpa sesi siswa');

  // Laporan bergrafik + unduhan Excel berkop (dibaca ulang oleh pembaca pintar)
  const lap = await (await minta(e, '/portal/laporan?unit=mi-al-huda', { headers: { cookie: kue } })).text();
  assert.match(lap, /<svg viewBox/);
  assert.match(lap, /Siswa aktif per kelas/);
  assert.match(lap, /data-tip=/);
  const x = await minta(e, '/portal/siswa/unduh.xlsx?unit=mi-al-huda', { headers: { cookie: kue } });
  assert.equal(x.status, 200);
  const lembar = await bacaXlsx(new Uint8Array(await x.arrayBuffer()));
  assert.ok(lembar[0]!.baris.some((b) => b.some((s) => /DAFTAR PESERTA DIDIK/.test(s))));
  const ulang = bacaMaster(lembar);
  assert.deepEqual(ulang.siswa.map((s) => s.nama).sort(), ['Anak Uji Dua', 'Anak Uji Satu']);
  assert.equal((await minta(e, '/portal/siswa/cetak?unit=mi-al-huda', { headers: { cookie: kue } })).status, 200);

  // Admin lembaga lain tidak bisa melihat siswa MI
  const kueMts = await masukSebagai(e, 'lembaga', ['mts-al-huda']);
  assert.doesNotMatch(await (await minta(e, '/portal/siswa', { headers: { cookie: kueMts } })).text(), /Anak Uji Satu/);
});

test('portal siswa: lulus tidak bisa masuk, salah sandi berulang dikunci, data privat disamarkan', async () => {
  const e = env();
  const kue = await masukSebagai(e, 'super');
  const simpan = await kirim(e, '/portal/k/siswa/baru', kue, { unit: 'mi-al-huda', judul: 'Siswa Uji Lulus', d_jenjang: 'MI', d_tingkat: 'Kelas 6', d_tahunAcuan: '2024/2025', d_nisn: '0141234567', d_jk: 'L', d_tanggalLahir: '2013-03-03', d_statusSiswa: 'aktif' });
  assert.equal(simpan.status, 302);
  const lulus = await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: 'nomor=0141234567&sandi=030313' });
  assert.match(await lulus.text(), /sudah lulus/);
  const aktif = await kirim(e, '/portal/k/siswa/baru', kue, { unit: 'mi-al-huda', judul: 'Siswa Uji Aktif', d_jenjang: 'MI', d_tingkat: 'Kelas 2', d_tahunAcuan: '2026/2027', d_nisn: '0191234567', d_nik: '3216011505190001', d_kk: '3216010101010009', d_jk: 'P', d_tanggalLahir: '2019-05-15', d_statusSiswa: 'aktif' });
  assert.equal(aktif.status, 302);
  const ganda = await kirim(e, '/portal/k/siswa/baru', kue, { unit: 'mi-al-huda', judul: 'Siswa Ganda', d_jenjang: 'MI', d_tingkat: 'Kelas 2', d_tahunAcuan: '2026/2027', d_nisn: '0191234567', d_jk: 'P', d_tanggalLahir: '2019-05-15', d_statusSiswa: 'aktif' });
  assert.equal(ganda.status, 400, 'NISN ganda ditolak');
  for (let i = 0; i < 5; i += 1) await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: 'nomor=0191234567&sandi=010101' });
  const kunci = await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: 'nomor=0191234567&sandi=150519' });
  assert.match(await kunci.text(), /Terlalu banyak percobaan/);
  // Admin membuka kunci dari profil siswa
  const daftar = await (await minta(e, '/portal/siswa', { headers: { cookie: kue } })).text();
  const sid = /\/portal\/siswa\/(sisw_[0-9A-Z]{20})"[^>]*>[\s\S]{0,400}Siswa Uji Aktif/.exec(daftar)?.[1];
  assert.ok(sid);
  assert.match(await (await minta(e, `/portal/siswa/${sid}`, { headers: { cookie: kue } })).text(), /Buka kunci masuk/);
  await kirim(e, `/portal/siswa/${sid}/buka`, kue, {});
  const masuk = await minta(e, '/siswa/masuk', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded' }, body: 'nomor=191234567&sandi=15%2F05%2F2019', redirect: 'manual' });
  assert.equal(masuk.status, 302, 'NISN tanpa nol di depan + tanggal dd/mm/yyyy');
  const beranda = await (await minta(e, '/siswa', { headers: { cookie: kueDari(masuk) } })).text();
  assert.match(beranda, /321601••••••0001/);
  assert.doesNotMatch(beranda, /3216011505190001/);
  assert.match((await (await minta(e, '/robots.txt')).text()), /Disallow: \/siswa/);
});
