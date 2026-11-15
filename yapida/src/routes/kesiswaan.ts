/**
 * Portal Kesiswaan (perintah pemilik 22, 24–27): data siswa (daftar, saringan, profil, cetak biodata), impor file
 * master pintar dengan pratinjau dan penyimpanan bertahap, unduhan format nasional (Excel berkop + logo, CSV, cetak
 * daftar peserta didik), tagihan (massal per kelas, status otomatis dari kwitansi), dan laporan bergrafik.
 * Kepala & admin lembaga: lembaganya; tingkat yayasan: semua; super admin: semua + ubah apa pun. Data hanya di R2.
 */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { html, raw } from '../lib/html.ts';
import { limit } from '../lib/ratelimit.ts';
import { hariIni, rupiah, tahunPelajaran, tanggal } from '../lib/text.ts';
import { bacaCsv, bacaXlsx, BukanXlsx, tulisCsv, tulisXlsx, type LembarTulis } from '../lib/xlsx.ts';
import { duaBaris, uraiAlamat } from '../lib/alamat.ts';
import { PERAN, bolehUnit, lingkupSemua, tingkat, type User } from '../data/users.ts';
import { getSitus, getUnit, listUnits, putUnit, type UnitItem } from '../data/site.ts';
import { ambil, type Dok } from '../data/koleksi.ts';
import { KOLEKSI } from '../data/defs.ts';
import { kopUntuk, labelJenis, labelUntuk, type Kop } from '../data/dokumen.ts';
import { milikSiswa, statusTagihan } from '../data/kait.ts';
import { JENJANG, KOLOM_LEMBAGA, KOLOM_SISWA, cariSiswa, jenjangDari, kunciGagal, jenjangUnit, labelStatus, levelTingkat, normalTanggal, periksaBaris, posisi, samarkan, type Jenjang } from '../data/siswa.ts';
import { bacaMaster, type BarisSiswa } from '../data/master.ts';
import { simpanBarisGuru, type BarisGuruSimpan } from '../data/guru.ts';
import {
  ambilKerja, buatKerja, daftarSiswa, langkahKerja, rekapKosong, riwayatKelas, saringSiswa, semuaIndeks, simpanBarisImpor, simpanBarisTagihan, tambahRekap,
  urutSiswa, type BarisImpor, type BarisTagihan, type Kerja, type SiswaRingkas,
} from '../data/kesiswaan.ts';
import { halamanImpor, halamanKerja, halamanLaporan, halamanPratinjau, halamanProfilSiswa, halamanSiswa, halamanTagihan, type BarisTagihanTampil, type DataLaporan } from '../pages/kesiswaan.ts';
import { biodataHtml, daftarPesertaHtml, halamanCetak, type KelompokDaftar, type Ttd } from '../pages/cetak.ts';
import { media } from '../lib/render.ts';
import { catat, jaga, mediaUrl, tampil, tanpaCache, tolak, unitsBoleh } from './portal.ts';

export const kesiswaan = new Hono<HonoEnv>();
const pastikan = async (c: Ctx, next: () => Promise<void>) => (c.get('user') ? next() : jaga(c, next));
for (const p of ['/portal/siswa', '/portal/siswa/*', '/portal/tagihan', '/portal/tagihan/*', '/portal/laporan', '/portal/laporan/*', '/portal/kerja/*']) kesiswaan.use(p, pastikan);

const bolehKesiswaan = (u: User) => tingkat(u) >= PERAN.lembaga.tingkat;
const lingkup = (u: User) => (lingkupSemua(u) ? undefined : u.units);
const MAKS_UNDUH = 900;
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Lembaga yang tampil di saringan kesiswaan: lembaga formal (RA/MI/MTs/MA) yang dikelola + lembaga lain yang punya data siswa. */
async function unitsSiswa(c: Ctx, list?: SiswaRingkas[]): Promise<UnitItem[]> {
  const units = await unitsBoleh(c);
  const ada = new Set((list ?? []).map((x) => x.unit));
  return units.filter((u) => jenjangUnit(u.slug) || ada.has(u.slug));
}
const pemberiNama = (units: UnitItem[]) => (slug: string) => (slug === 'yayasan' ? 'Yayasan' : units.find((u) => u.slug === slug)?.singkat ?? slug);
const urutanUnit = (units: UnitItem[]) => (slug: string) => { const u = units.find((x) => x.slug === slug); return u ? u.urut : 999; };
const tingkatTerurut = (list: SiswaRingkas[]) => [...new Set(list.map((x) => x.p.tingkat).filter(Boolean))].sort((a, b) => (levelTingkat(a) ?? 99) - (levelTingkat(b) ?? 99));

function saringanDari(c: Ctx) {
  const q = (k: string) => (c.req.query(k) ?? '').trim().slice(0, 80);
  return { unit: q('unit'), tingkat: q('tingkat'), rombel: q('rombel'), status: q('status') || 'aktif', jk: q('jk') === 'L' || q('jk') === 'P' ? q('jk') : '', q: q('q') };
}

/* ── daftar siswa ─────────────────────────────────────────────────────── */

kesiswaan.get('/portal/siswa', async (c) => {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const store = c.get('store');
  const s = saringanDari(c);
  if (s.unit && !bolehUnit(u, s.unit)) return tolak(c, 'Anda tidak mengelola lembaga ini.');
  const semua = await daftarSiswa(store, lingkup(u));
  const units = await unitsSiswa(c, semua);
  const diUnit = s.unit ? semua.filter((x) => x.unit === s.unit) : semua;
  const status = s.status === 'semua' ? undefined : s.status;
  const cocok = urutSiswa(saringSiswa(semua, { ...s, status }), urutanUnit(units));
  const perHal = 100;
  const hal = Math.max(1, Math.min(Math.ceil(cocok.length / perHal) || 1, Number(c.req.query('hal')) || 1));
  const aktif = diUnit.filter((x) => x.p.status === 'aktif');
  return tampil(c, {
    judul: 'Data siswa', aktif: '/portal/siswa',
    body: halamanSiswa({
      list: cocok.slice((hal - 1) * perHal, hal * perHal), jumlah: cocok.length, hal, perHal, units, s,
      ringkas: { aktif: aktif.length, L: aktif.filter((x) => x.jk === 'L').length, P: aktif.filter((x) => x.jk === 'P').length, lulus: diUnit.filter((x) => x.p.status === 'lulus').length, lain: diUnit.filter((x) => x.p.status === 'pindah' || x.p.status === 'keluar').length, semua: diUnit.length },
      tingkatAda: tingkatTerurut(diUnit), rombelAda: [...new Set(diUnit.filter((x) => !s.tingkat || x.p.tingkat === s.tingkat).map((x) => x.p.rombel).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id', { numeric: true })),
      namaUnit: pemberiNama(units),
    }),
  });
});

/* ── unduhan: Excel format nasional berkop + logo, CSV, cetak ─────────── */

/** Siswa yang akan diunduh/dicetak sesuai saringan (atau satu siswa `id`), urut lembaga-kelas-rombel-nama. */
async function pilihanUnduh(c: Ctx): Promise<{ list: SiswaRingkas[]; units: UnitItem[]; s: ReturnType<typeof saringanDari> } | Response> {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const store = c.get('store');
  const s = saringanDari(c);
  if (s.unit && !bolehUnit(u, s.unit)) return tolak(c, 'Anda tidak mengelola lembaga ini.');
  const semua = await daftarSiswa(store, lingkup(u));
  const units = await unitsSiswa(c, semua);
  const id = c.req.query('id');
  const list = id ? semua.filter((x) => x.id === id) : urutSiswa(saringSiswa(semua, { ...s, status: s.status === 'semua' ? undefined : s.status }), urutanUnit(units));
  return { list, units, s };
}

async function bacaDok(c: Ctx, list: SiswaRingkas[]): Promise<Dok[]> {
  const store = c.get('store');
  const out: Dok[] = [];
  for (let i = 0; i < list.length; i += 25) out.push(...(await Promise.all(list.slice(i, i + 25).map((x) => ambil(store, 'siswa', x.id)))).filter((d): d is Dok => Boolean(d)));
  return out;
}

interface KopLembaga { kop: Kop; unit: Awaited<ReturnType<typeof getUnit>>; ttd: Ttd; logo?: { data: Uint8Array; jenis: 'png' | 'jpeg' } }

async function kopLembaga(c: Ctx, slug: string): Promise<KopLembaga> {
  const store = c.get('store');
  const [s, unit] = await Promise.all([getSitus(store), slug === 'yayasan' ? null : getUnit(store, slug)]);
  const kop = await kopUntuk(store, slug, s, unit);
  const ketua = s.organ.find((o) => /ketua/i.test(o.jabatan));
  const ttd: Ttd = { kota: kop.kota, tanggal: tanggal(hariIni()), jabatan: unit?.kepala?.jabatan ?? ketua?.jabatan ?? 'Kepala', nama: unit?.kepala?.nama ?? ketua?.nama ?? '', nip: unit?.nipKepala };
  return { kop, unit, ttd };
}

/** Logo untuk Excel: logo kop lembaga bila PNG/JPG, selain itu logo yayasan (PNG). */
async function logoExcel(c: Ctx, k: Kop): Promise<{ data: Uint8Array; jenis: 'png' | 'jpeg' } | undefined> {
  try {
    if (k.logo && /\.(png|jpe?g)$/i.test(k.logo)) {
      const o = await c.env.MEDIA.get(`f/${k.logo}`);
      if (o) return { data: new Uint8Array(await o.arrayBuffer()), jenis: /\.png$/i.test(k.logo) ? 'png' : 'jpeg' };
    }
    const r = await c.env.ASSETS.fetch(new Request(new URL('/assets/logo-dok.png', c.req.url)));
    if (r.ok) return { data: new Uint8Array(await r.arrayBuffer()), jenis: 'png' };
  } catch { /* tanpa logo */ }
  return undefined;
}

const barisKop = (k: Kop, unit: KopLembaga['unit']) => {
  const alamat = duaBaris(uraiAlamat(k.alamat), { singkat: true });
  const nomor = [unit?.nsm || k.nsm ? `NSM ${unit?.nsm || k.nsm}` : '', unit?.npsn ? `NPSN ${unit.npsn}` : ''].filter(Boolean).join('  ·  ');
  return [k.induk, k.nama, [k.ket, nomor].filter(Boolean).join('  ·  '), alamat.filter(Boolean).join(', '), k.kontak].filter(Boolean);
};

const nilaiSiswa = (d: Dok, no: number, nsm: string): (string | number)[] => {
  const p = posisi(d.d, d.unit);
  const t = (k: string) => String(d.d[k] ?? '');
  return [no, t('nsm') || nsm, t('jenjang') || (jenjangUnit(d.unit) ?? ''), p.tingkat, p.rombel, t('nis'), t('nisn'), t('nik'), d.judul, t('jk'), t('tempatLahir'), t('tanggalLahir'), t('ayah'), t('ibu'), t('kk'), t('alamat'), labelStatus(p.status)];
};
const LEBAR_SISWA = [5, 15, 8, 13, 10, 11, 14, 19, 30, 5, 15, 13, 24, 24, 19, 44, 10];

kesiswaan.get('/portal/siswa/unduh.xlsx', async (c) => {
  const pil = await pilihanUnduh(c);
  if (pil instanceof Response) return pil;
  const bagian = Math.max(1, Number(c.req.query('bagian')) || 1);
  const potong = pil.list.slice((bagian - 1) * MAKS_UNDUH, bagian * MAKS_UNDUH);
  if (!potong.length) return c.text('Tidak ada siswa untuk diunduh dengan saringan ini.', 404);
  const doks = await bacaDok(c, potong);
  const perUnit = new Map<string, Dok[]>();
  for (const d of doks) perUnit.set(d.unit, [...(perUnit.get(d.unit) ?? []), d]);
  const tp = tahunPelajaran();
  const lembar: LembarTulis[] = [];
  const rekap: (string | number)[][] = [];
  const lembagaBaris: (string | number)[][] = [];
  for (const [slug, list] of perUnit) {
    const kl = await kopLembaga(c, slug);
    const nsm = kl.unit?.nsm ?? '';
    const L = list.filter((d) => d.d.jk === 'L').length;
    const kelas = pil.s.tingkat ? ` · ${pil.s.tingkat}${pil.s.rombel ? ` ${pil.s.rombel}` : ''}` : '';
    lembar.push({
      nama: (kl.unit?.singkat ?? slug).slice(0, 31), kop: { baris: barisKop(kl.kop, kl.unit), logo: await logoExcel(c, kl.kop) },
      subjudul: ['DAFTAR PESERTA DIDIK', `Tahun Pelajaran ${tp}${kelas} · ${list.length} peserta didik (L ${L}, P ${list.length - L})`],
      kepala: KOLOM_SISWA, lebar: LEBAR_SISWA, baris: list.map((d, i) => nilaiSiswa(d, i + 1, nsm)),
      kaki: [`${kl.ttd.kota}, ${kl.ttd.tanggal}`, `${kl.ttd.jabatan},`, '', '', '', `**${kl.ttd.nama || '……………………'}`, kl.ttd.nip ? `NIP/NUPTK. ${kl.ttd.nip}` : ''],
    });
    const perKelas = new Map<string, { L: number; P: number }>();
    for (const d of list) { const p = posisi(d.d, d.unit); const k = `${p.tingkat}|${p.rombel}`; const x = perKelas.get(k) ?? { L: 0, P: 0 }; if (d.d.jk === 'P') x.P += 1; else x.L += 1; perKelas.set(k, x); }
    for (const [k, x] of [...perKelas].sort((a, b) => a[0].localeCompare(b[0], 'id', { numeric: true }))) { const [t1, r1] = k.split('|'); rekap.push([kl.unit?.singkat ?? slug, t1!, r1!, x.L, x.P, x.L + x.P]); }
    lembagaBaris.push([lembagaBaris.length + 1, jenjangUnit(slug) ?? '', nsm, kl.unit?.npsn ?? '', kl.unit?.nama ?? slug, /swasta/i.test(kl.unit?.jenis ?? kl.unit?.nama ?? '') || /^mis\b/i.test(kl.unit?.nama ?? '') ? 'Swasta' : '', kl.kop.alamat, '', '', '', kl.unit?.kepala?.nama ?? '', kl.unit?.nipKepala ?? '', tp]);
  }
  const k0 = lembar[0]!.kop!;
  lembar.push({ nama: 'Rekap', kop: k0, subjudul: ['REKAPITULASI PESERTA DIDIK', `Tahun Pelajaran ${tp}`], kepala: ['Lembaga', 'Kelas', 'Rombel', 'L', 'P', 'Jumlah'], lebar: [26, 14, 12, 8, 8, 10], baris: rekap, tegak: true });
  lembar.push({ nama: 'Master Lembaga', judul: 'MASTER LEMBAGA', kepala: KOLOM_LEMBAGA, baris: lembagaBaris, lebar: [5, 8, 16, 12, 28, 10, 50, 14, 16, 14, 26, 20, 14] });
  await catat(c, 'siswa.unduh', `${doks.length} siswa (Excel${pil.list.length > MAKS_UNDUH ? `, bagian ${bagian}` : ''})`);
  const nama = `data-siswa-${pil.s.unit || 'semua'}-${tp.replace('/', '-')}${pil.list.length > MAKS_UNDUH ? `-bagian${bagian}` : ''}.xlsx`;
  return c.body(tulisXlsx(lembar), 200, { 'content-type': XLSX_TYPE, 'content-disposition': `attachment; filename="${nama}"`, ...tanpaCache });
});

kesiswaan.get('/portal/siswa/unduh.csv', async (c) => {
  const pil = await pilihanUnduh(c);
  if (pil instanceof Response) return pil;
  const doks = await bacaDok(c, pil.list.slice(0, MAKS_UNDUH));
  await catat(c, 'siswa.unduh', `${doks.length} siswa (CSV)`);
  return c.body(tulisCsv(KOLOM_SISWA, doks.map((d, i) => nilaiSiswa(d, i + 1, ''))), 200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="data-siswa-${pil.s.unit || 'semua'}.csv"`, ...tanpaCache });
});

kesiswaan.get('/portal/siswa/cetak', async (c) => {
  const pil = await pilihanUnduh(c);
  if (pil instanceof Response) return pil;
  const doks = await bacaDok(c, pil.list.slice(0, 600));
  if (!doks.length) return c.text('Tidak ada siswa untuk dicetak dengan saringan ini.', 404);
  const perUnit = new Map<string, Dok[]>();
  for (const d of doks) perUnit.set(d.unit, [...(perUnit.get(d.unit) ?? []), d]);
  const isi: string[] = [];
  const tp = tahunPelajaran();
  for (const [slug, list] of perUnit) {
    const kl = await kopLembaga(c, slug);
    const kelompok = new Map<string, KelompokDaftar>();
    for (const d of list) {
      const p = posisi(d.d, d.unit);
      const kunci = `${p.tingkat}${p.rombel ? ` · Rombel ${p.rombel}` : ''}`;
      const g = kelompok.get(kunci) ?? { judul: kunci, sub: `${kl.unit?.nama ?? ''} · Tahun Pelajaran ${tp}`, baris: [] };
      const t = (k: string) => String(d.d[k] ?? '');
      g.baris.push({ no: g.baris.length + 1, nisn: t('nisn'), nis: t('nis'), nama: d.judul, jk: t('jk'), ttl: [t('tempatLahir'), t('tanggalLahir') ? tanggal(t('tanggalLahir')) : ''].filter(Boolean).join(', '), ayah: t('ayah'), ibu: t('ibu'), alamat: t('alamat'), status: p.status === 'aktif' ? '' : labelStatus(p.status) });
      kelompok.set(kunci, g);
    }
    isi.push(daftarPesertaHtml([...kelompok.values()], kl.kop, media(c), kl.ttd).s);
  }
  return c.html(halamanCetak({ judul: 'Daftar peserta didik', isi: raw(isi.join('')), ukuran: 'a4l', kembali: '/portal/siswa', info: `${doks.length} peserta didik, satu rombel per halaman.` }), 200, tanpaCache);
});

kesiswaan.get('/portal/siswa/templat.xlsx', async (c) => {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const units = (await unitsBoleh(c)).filter((x) => jenjangUnit(x.slug));
  const lembaga = await Promise.all(units.map((x) => getUnit(c.get('store'), x.slug)));
  const tp = tahunPelajaran();
  const petunjuk: (string | number)[][] = [
    ['1', 'Satu baris = satu siswa. Kolom boleh diurutkan ulang, ditambah, atau diberi judul lain — sistem mengenali judulnya (atau isinya).'],
    ['2', 'Lembaga dikenali dari NSM Lembaga, nama lembaga, Jenjang (RA/MI/MTs), atau tingkat kelasnya.'],
    ['3', 'Tingkat/Kelompok: Kelompok A/B (RA), Kelas 1–6 (MI), Kelas 7–9 (MTs). Boleh ditulis gabungan dengan rombel, mis. 3A atau VII-B.'],
    ['4', `Tingkat & rombel ditulis untuk tahun pelajaran di lembar Master Lembaga (bawaan ${tp}); setiap Juli kelas naik otomatis, melewati kelas tertinggi = lulus.`],
    ['5', 'NISN 10 angka dan NIK/No. KK 16 angka: format kolomnya sebagai Teks supaya angka 0 di depan dan digit terakhir tidak hilang.'],
    ['6', 'Tanggal lahir bentuk apa pun: 2015-04-30, 30/04/2015, 300415, 30 April 2015, 30 Apr 2015.'],
    ['7', 'Siswa masuk portal siswa dengan NISN (atau NIS lokal) + tanggal lahirnya, mis. 30/04/2015 atau 300415.'],
    ['8', 'Status Siswa: Aktif, Lulus, Pindah, atau Keluar (kosong = Aktif).'],
  ];
  const x = tulisXlsx([
    { nama: 'Master Siswa', judul: 'DATABASE MASTER SISWA', kepala: KOLOM_SISWA, baris: [], lebar: LEBAR_SISWA },
    { nama: 'Master Lembaga', judul: 'MASTER LEMBAGA', kepala: KOLOM_LEMBAGA, lebar: [5, 8, 16, 12, 28, 10, 50, 14, 16, 14, 26, 20, 14], baris: lembaga.filter(Boolean).map((l, i) => [i + 1, jenjangUnit(l!.slug) ?? '', l!.nsm ?? '', l!.npsn ?? '', l!.nama, /swasta|^mis\b/i.test(`${l!.jenis} ${l!.nama}`) ? 'Swasta' : '', l!.alamat ?? '', '', '', '', l!.kepala?.nama ?? '', l!.nipKepala ?? '', tp]) },
    { nama: 'Petunjuk', judul: 'PETUNJUK PENGISIAN', kepala: ['No', 'Petunjuk'], baris: petunjuk, lebar: [5, 130], tegak: true },
  ]);
  return c.body(x, 200, { 'content-type': XLSX_TYPE, 'content-disposition': 'attachment; filename="templat-master-siswa.xlsx"', ...tanpaCache });
});

/* ── impor file master pintar ──────────────────────────────────────────── */

kesiswaan.get('/portal/siswa/impor', (c) => {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  return tampil(c, { judul: 'Impor file master siswa', aktif: '/portal/siswa/impor', body: halamanImpor({}) });
});

kesiswaan.post('/portal/siswa/impor', async (c) => {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  if (!(await limit(c.env, `impor:${u.id}`, 30, 3600))) return tampil(c, { judul: 'Impor file master siswa', aktif: '/portal/siswa/impor', body: halamanImpor({ galat: 'Terlalu banyak unggahan dalam satu jam. Coba lagi nanti.' }), status: 429 });
  const f = await c.req.parseBody();
  const berkas = f.berkas;
  const ulang = (galat: string) => tampil(c, { judul: 'Impor file master siswa', aktif: '/portal/siswa/impor', body: halamanImpor({ galat }), status: 400 });
  if (!(berkas instanceof File) || !berkas.size) return ulang('Pilih file master (.xlsx atau .csv) dulu.');
  if (berkas.size > 8 * 1024 * 1024) return ulang('File lebih dari 8 MB. Pisahkan per lembaga atau hapus lembar yang tidak perlu.');
  const buf = new Uint8Array(await berkas.arrayBuffer());
  let lembar;
  try {
    lembar = /\.csv$/i.test(berkas.name) || (buf[0] !== 0x50 && buf[1] !== 0x4b) ? [{ nama: berkas.name.replace(/\.[^.]+$/, '') || 'CSV', baris: bacaCsv(new TextDecoder().decode(buf)) }] : await bacaXlsx(buf);
  } catch (err) {
    if (err instanceof BukanXlsx) return ulang('File tidak terbaca sebagai Excel (.xlsx). Bila masih .xls lama, simpan ulang sebagai .xlsx atau CSV.');
    throw err;
  }
  const store = c.get('store');
  const units = await listUnits(store, true);
  const lengkap = await Promise.all(units.map(async (x) => ({ ...x, nsm: (await getUnit(store, x.slug))?.nsm ?? x.nsm })));
  const baca = bacaMaster(lembar);
  const rows = periksaBaris(baca.siswa, baca.lembaga, lengkap, (slug) => bolehUnit(u, slug));
  // Lengkapi NSM/NPSN/NIP kepala lembaga dari lembar Master Lembaga (hanya yang masih kosong, hanya lembaga yang dikelola).
  const lembagaDiisi: string[] = [];
  if (f.lembaga === '1') {
    for (const l of baca.lembaga) {
      const j = jenjangDari(l.jenjang || l.nama);
      const cocok = lengkap.filter((x) => (l.nsm && x.nsm === l.nsm) || (j && jenjangUnit(x.slug) === j));
      if (cocok.length !== 1 || !bolehUnit(u, cocok[0]!.slug)) continue;
      const un = await getUnit(store, cocok[0]!.slug);
      if (!un) continue;
      const tambah: Partial<typeof un> = {};
      if (!un.nsm && l.nsm.length === 12) tambah.nsm = l.nsm;
      if (!un.npsn && l.npsn.length === 8) tambah.npsn = l.npsn;
      if (!un.nipKepala && l.nipKepala) tambah.nipKepala = l.nipKepala.slice(0, 30);
      if (Object.keys(tambah).length) { await putUnit(store, { ...un, ...tambah, ubah: Date.now() }); lembagaDiisi.push(`${un.singkat}: ${Object.keys(tambah).map((k) => k.toUpperCase().replace('NIPKEPALA', 'NIP kepala')).join(', ')}`); }
    }
  }
  // Siswa yang sudah ada (NISN/NIS) — dari indeks, tanpa membaca tiap dokumen.
  const ix = await semuaIndeks(store, 'siswa');
  const nisnAda = new Set(ix.map((x) => String(x.x?.nisn ?? '')).filter(Boolean));
  const nisAda = new Set(ix.map((x) => String(x.x?.nis ?? '')).filter(Boolean));
  const ada = (r: BarisSiswa) => (r.nisn && nisnAda.has(r.nisn)) || (r.nis && nisAda.has(r.nis)) || false;
  const sah = rows.filter((r) => !r.galat.length).sort((a, b) => (a.unit ?? '').localeCompare(b.unit ?? '') || (levelTingkat(a.tingkat) ?? 99) - (levelTingkat(b.tingkat) ?? 99) || a.rombel.localeCompare(b.rombel, 'id', { numeric: true }) || a.nama.localeCompare(b.nama, 'id'));
  const mode = f.mode === 'lewati' ? 'lewati' : 'perbarui';
  const baris: BarisImpor[] = sah.map(({ galat: _g, peringatan: _p, petunjuk: _t, sumber: _s, lembagaTeks: _l, ...r }) => ({ ...r, unit: r.unit! }));
  const kerja = sah.length ? await buatKerja(store, { jenis: 'impor', judul: `Menyimpan ${sah.length} siswa dari ${berkas.name}`.slice(0, 160), oleh: u.id, olehNama: u.nama, lingkup: lingkupSemua(u) ? null : u.units, kembali: '/portal/siswa?status=semua', opsi: { mode } }, baris) : null;
  await catat(c, 'siswa.impor.periksa', `${berkas.name}: ${rows.length} baris, ${sah.length} sah`);
  const namaUnit = pemberiNama(units);
  return tampil(c, { judul: 'Pratinjau impor', aktif: '/portal/siswa/impor', body: halamanPratinjau({ kerjaId: kerja?.id ?? null, rows: [...sah, ...rows.filter((r) => r.galat.length)], laporan: baca.laporan, pesan: baca.pesan, namaUnit, ada, mode, lembagaDiisi }) });
});

/* ── pekerjaan bertahap ───────────────────────────────────────────────── */

async function kerjaMilik(c: Ctx): Promise<Kerja | null> {
  const k = await ambilKerja(c.get('store'), c.req.param('id') ?? '');
  const u = c.get('user')!;
  return k && (k.oleh === u.id || tingkat(u) >= PERAN.super.tingkat) ? k : null;
}

kesiswaan.get('/portal/kerja/:id', async (c) => {
  const k = await kerjaMilik(c);
  if (!k) return c.notFound();
  return tampil(c, { judul: k.jenis === 'impor' ? 'Menyimpan data siswa' : k.jenis === 'guru' ? 'Menyimpan data guru' : 'Membuat tagihan', aktif: k.jenis === 'impor' ? '/portal/siswa/impor' : k.jenis === 'guru' ? '/portal/guru/impor' : '/portal/tagihan', body: halamanKerja(k) });
});

kesiswaan.post('/portal/kerja/:id/lanjut', async (c) => {
  const k0 = await kerjaMilik(c);
  if (!k0) return c.json({ galat: 'Pekerjaan tidak ditemukan.' }, 404);
  const store = c.get('store');
  const def = k0.jenis === 'impor' ? KOLEKSI.siswa! : k0.jenis === 'guru' ? KOLEKSI.sdm! : KOLEKSI.tagihan!;
  const k = await langkahKerja(store, k0.id, (b, _i, kerja) => (kerja.jenis === 'impor' ? simpanBarisImpor(store, def, KOLEKSI, b as BarisImpor, kerja) : kerja.jenis === 'guru' ? simpanBarisGuru(store, def, KOLEKSI, b as BarisGuruSimpan, kerja) : simpanBarisTagihan(store, def, KOLEKSI, b as BarisTagihan, kerja)));
  if (k?.selesai && !k0.selesai) await catat(c, `${k.jenis}.selesai`, `${k.judul}: ${k.hasil.baru} baru, ${k.hasil.ubah} diperbarui, ${k.hasil.lewat} dilewati, ${k.hasil.gagalN} gagal`);
  if ((c.req.header('accept') ?? '').includes('application/json')) return c.json({ pos: k?.pos ?? 0, total: k?.total ?? 0, selesai: k?.selesai ?? true, hasil: k?.hasil, kembali: k?.kembali }, 200, tanpaCache);
  return c.redirect(`/portal/kerja/${k0.id}`);
});

/* ── profil siswa ─────────────────────────────────────────────────────── */

async function siswaBoleh(c: Ctx): Promise<Dok | Response> {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const d = await ambil(c.get('store'), 'siswa', c.req.param('id') ?? '');
  if (!d) return c.notFound();
  if (!bolehUnit(u, d.unit)) return tolak(c, 'Siswa ini bukan di lembaga yang Anda kelola.');
  return d;
}


kesiswaan.get('/portal/siswa/:id', async (c) => {
  const d = await siswaBoleh(c);
  if (d instanceof Response) return d;
  const store = c.get('store');
  const nomor = [String(d.d.nisn ?? ''), String(d.d.nis ?? '')].filter(Boolean);
  const [tagihan, kwitansi, penghargaan, units] = await Promise.all([milikSiswa(store, nomor, 'tagihan'), milikSiswa(store, nomor, 'kwitansi'), milikSiswa(store, nomor, 'penghargaan'), listUnits(store, true)]);
  const kunci = await Promise.all(nomor.map(kunciGagal));
  const terkunci = (await Promise.all(kunci.map((k) => store.get<{ sampai: number }>(k)))).some((x) => x && x.sampai > Date.now());
  return tampil(c, {
    judul: d.judul, aktif: '/portal/siswa',
    body: halamanProfilSiswa({ d, namaUnit: pemberiNama(units), mediaUrl: mediaUrl(c), riwayat: riwayatKelas(d.d, d.unit), tagihan, kwitansi, penghargaan, hari: hariIni(), bolehUbah: true, terkunci }),
  });
});

kesiswaan.post('/portal/siswa/:id/buka', async (c) => {
  const d = await siswaBoleh(c);
  if (d instanceof Response) return d;
  const store = c.get('store');
  for (const n of [String(d.d.nisn ?? ''), String(d.d.nis ?? '')].filter(Boolean)) await store.del(await kunciGagal(n));
  await catat(c, 'siswa.buka', d.judul);
  return c.redirect(`/portal/siswa/${d.id}?ok=buka`);
});

kesiswaan.get('/portal/siswa/:id/cetak', async (c) => {
  const d = await siswaBoleh(c);
  if (d instanceof Response) return d;
  const kl = await kopLembaga(c, d.unit);
  return c.html(halamanCetak({ judul: `Biodata ${d.judul}`, isi: biodataSiswa(d, kl, media(c), false), ukuran: 'a4p', kembali: `/portal/siswa/${d.id}` }), 200, tanpaCache);
});

/** Biodata cetak; `samar` = NIK & KK disamarkan (portal siswa). */
export function biodataSiswa(d: Dok, kl: KopLembaga, m: (f: string | undefined | null) => string, samar: boolean) {
  const p = posisi(d.d, d.unit);
  const t = (k: string) => String(d.d[k] ?? '');
  return biodataHtml({
    nama: d.judul, foto: t('foto') || undefined, lembaga: kl.unit?.nama ?? d.unit, kelas: `${p.tingkat}${p.rombel ? ` · ${p.rombel}` : ''}`, tp: p.tp, status: labelStatus(p.status),
    isian: [['NISN', t('nisn')], ['NIS lokal', t('nis')], ['NIK', samar ? samarkan(t('nik')) : t('nik')], ['Jenis kelamin', t('jk') === 'L' ? 'Laki-laki' : t('jk') === 'P' ? 'Perempuan' : ''],
      ['Tempat, tanggal lahir', [t('tempatLahir'), t('tanggalLahir') ? tanggal(t('tanggalLahir')) : ''].filter(Boolean).join(', ')], ['Nama ayah kandung', t('ayah')], ['Nama ibu kandung', t('ibu')],
      ['No. Kartu Keluarga', samar ? samarkan(t('kk')) : t('kk')], ['Alamat', t('alamat')], ['Jenjang · NSM lembaga', [t('jenjang'), kl.unit?.nsm || t('nsm')].filter(Boolean).join(' · ')]],
    riwayat: riwayatKelas(d.d, d.unit).map((r) => ({ tp: r.tp, kelas: `${r.tingkat}${r.rombel ? ` ${r.rombel}` : ''}` })),
  }, kl.kop, m, kl.ttd);
}
export { kopLembaga, type KopLembaga };

/* ── tagihan ──────────────────────────────────────────────────────────── */

async function dataTagihan(c: Ctx) {
  const u = c.get('user')!;
  const store = c.get('store');
  const q = (k: string) => (c.req.query(k) ?? '').trim().slice(0, 80);
  const s = { unit: q('unit'), status: q('status'), untuk: q('untuk'), q: q('q') };
  const scope = s.unit ? (bolehUnit(u, s.unit) ? [s.unit] : ['-']) : lingkup(u);
  const semua = await semuaIndeks(store, 'tagihan', scope);
  const hari = hariIni();
  const cari = s.q.toLowerCase();
  const cocok = semua.filter((it) => {
    const x = it.x ?? {};
    const st = statusTagihan(x, hari).kode;
    if (s.status === 'belum-lunas' ? st === 'lunas' : s.status && st !== s.status) return false;
    if (s.untuk && x.untuk !== s.untuk) return false;
    if (cari && !`${it.j} ${x.nisn ?? ''} ${x.periode ?? ''} ${x.kelas ?? ''}`.toLowerCase().includes(cari)) return false;
    return true;
  });
  const rekap = cocok.reduce((r, it) => tambahRekap(r, it.x ?? {}, hari), rekapKosong());
  return { s, semua, cocok, rekap, hari };
}

kesiswaan.get('/portal/tagihan', async (c) => {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const { s, cocok, rekap, hari } = await dataTagihan(c);
  const siswa = await daftarSiswa(c.get('store'), lingkup(u));
  const units = await unitsSiswa(c, siswa);
  const list: BarisTagihanTampil[] = cocok.slice(0, 400).map((it) => ({ id: it.id, nama: it.j, unit: it.u, x: it.x ?? {} }));
  return tampil(c, {
    judul: 'Tagihan & pembayaran', aktif: '/portal/tagihan',
    body: halamanTagihan({ list, jumlah: cocok.length, units, namaUnit: pemberiNama(units), rekap, hari, s, tingkatAda: tingkatTerurut(siswa.filter((x) => x.p.status === 'aktif' && (!s.unit || x.unit === s.unit))), tpKini: tahunPelajaran() }),
  });
});

kesiswaan.post('/portal/tagihan/massal', async (c) => {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const f = await c.req.parseBody();
  const t = (k: string, n = 80) => String(f[k] ?? '').trim().slice(0, n);
  const unit = t('unit', 60);
  if (!bolehUnit(u, unit)) return tolak(c, 'Anda tidak mengelola lembaga ini.');
  const untuk = t('untuk', 30), periode = t('periode'), jumlah = Math.round(Number(t('jumlah', 15)));
  const jatuhTempo = /^\d{4}-\d{2}-\d{2}$/.test(t('jatuhTempo', 10)) ? t('jatuhTempo', 10) : undefined;
  if (!untuk || !periode || !(jumlah > 0)) return c.redirect('/portal/tagihan?galat=1#massal');
  const siswa = (await daftarSiswa(c.get('store'), [unit])).filter((x) => x.p.status === 'aktif' && (!t('tingkat') || x.p.tingkat === t('tingkat')) && (!t('rombel', 20) || x.p.rombel.toLowerCase() === t('rombel', 20).toLowerCase()));
  const units = await listUnits(c.get('store'), true);
  const baris: BarisTagihan[] = urutSiswa(siswa, urutanUnit(units)).map((x) => ({ id: x.id, nama: x.nama, unit: x.unit, nisn: x.nisn || x.nis, kelas: `${x.p.tingkat}${x.p.rombel ? ` · ${x.p.rombel}` : ''}` }));
  if (!baris.length) return tampil(c, { judul: 'Tagihan & pembayaran', aktif: '/portal/tagihan', body: html`<div class="p-kartu"><p>Tidak ada siswa aktif di pilihan itu.</p><a class="tbl tbl-garis" href="/portal/tagihan#massal">Kembali</a></div>`, status: 400 });
  const kerja = await buatKerja(c.get('store'), { jenis: 'tagihan', judul: `Tagihan ${labelUntuk(untuk)} ${periode} untuk ${baris.length} siswa`, oleh: u.id, olehNama: u.nama, lingkup: lingkupSemua(u) ? null : u.units, kembali: `/portal/tagihan?unit=${unit}&untuk=${untuk}&q=${encodeURIComponent(periode)}`, opsi: { untuk, periode, jumlah, jatuhTempo, catatan: t('catatan', 300) || undefined } }, baris);
  await catat(c, 'tagihan.massal', kerja.judul);
  return c.redirect(`/portal/kerja/${kerja.id}`);
});

kesiswaan.get('/portal/tagihan/unduh.xlsx', async (c) => {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const { s, cocok, hari, rekap } = await dataTagihan(c);
  const kl = await kopLembaga(c, s.unit || (lingkupSemua(u) ? 'yayasan' : u.units[0] ?? 'yayasan'));
  const units = await listUnits(c.get('store'), true);
  const nama = pemberiNama(units);
  const baris = cocok.map((it, i) => { const x = it.x ?? {}; const st = statusTagihan(x, hari); return [i + 1, it.j, String(x.nisn ?? ''), nama(it.u), String(x.kelas ?? ''), labelUntuk(x.untuk), String(x.periode ?? ''), Number(x.jumlah) || 0, Number(x.dibayar) || 0, st.sisa, st.label, x.jatuhTempo ? tanggal(String(x.jatuhTempo)) : '']; });
  const x = tulisXlsx([{ nama: 'Tagihan', kop: { baris: barisKop(kl.kop, kl.unit), logo: await logoExcel(c, kl.kop) }, subjudul: ['DAFTAR TAGIHAN SISWA', `Per ${tanggal(hari)} · total ${rupiah(rekap.jumlah)} · dibayar ${rupiah(rekap.dibayar)} · sisa ${rupiah(rekap.sisa)}`], kepala: ['No', 'Nama siswa', 'NISN/NIS', 'Lembaga', 'Kelas', 'Jenis', 'Periode', 'Jumlah', 'Dibayar', 'Sisa', 'Status', 'Jatuh tempo'], lebar: [5, 30, 14, 16, 14, 18, 20, 13, 13, 13, 26, 16], baris, kaki: [`${kl.ttd.kota}, ${kl.ttd.tanggal}`, 'Bendahara,', '', '', '', '**……………………'] }]);
  await catat(c, 'tagihan.unduh', `${baris.length} tagihan`);
  return c.body(x, 200, { 'content-type': XLSX_TYPE, 'content-disposition': `attachment; filename="tagihan-${s.unit || 'semua'}-${hari}.xlsx"`, ...tanpaCache });
});

/* ── laporan ──────────────────────────────────────────────────────────── */

const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

async function dataLaporan(c: Ctx): Promise<DataLaporan | Response> {
  const u = c.get('user')!;
  if (!bolehKesiswaan(u)) return tolak(c);
  const store = c.get('store');
  const unit = (c.req.query('unit') ?? '').slice(0, 60);
  if (unit && !bolehUnit(u, unit)) return tolak(c, 'Anda tidak mengelola lembaga ini.');
  const scope = unit ? [unit] : lingkup(u);
  const [siswa, tagihan, kwitansi, penghargaan] = await Promise.all([daftarSiswa(store, scope), semuaIndeks(store, 'tagihan', scope), semuaIndeks(store, 'kwitansi', scope), semuaIndeks(store, 'penghargaan', scope)]);
  const units = await unitsSiswa(c, siswa);
  const namaUnit = pemberiNama(units);
  const tp = tahunPelajaran();
  const aktif = siswa.filter((x) => x.p.status === 'aktif');
  const lp = (l: SiswaRingkas[]) => [l.filter((x) => x.jk !== 'P').length, l.filter((x) => x.jk === 'P').length];
  const perUnit = units.filter((x) => aktif.some((s) => s.unit === x.slug)).map((x) => ({ label: x.singkat, nilai: lp(aktif.filter((s) => s.unit === x.slug)), href: `/portal/siswa?unit=${x.slug}` }));
  const tingkatList = tingkatTerurut(aktif);
  const perKelas = tingkatList.map((t) => ({ label: t.replace('Kelompok ', 'Kel. '), nilai: lp(aktif.filter((s) => s.p.tingkat === t)), href: `/portal/siswa?${unit ? `unit=${unit}&` : ''}tingkat=${encodeURIComponent(t)}` }));
  const rombelMap = new Map<string, { unit: string; kelas: string; rombel: string; L: number; P: number }>();
  for (const s of aktif) { const k = `${s.unit}|${s.p.tingkat}|${s.p.rombel}`; const x = rombelMap.get(k) ?? { unit: s.unit, kelas: s.p.tingkat, rombel: s.p.rombel, L: 0, P: 0 }; if (s.jk === 'P') x.P += 1; else x.L += 1; rombelMap.set(k, x); }
  const urut = urutanUnit(units);
  const perRombel = [...rombelMap.values()].sort((a, b) => urut(a.unit) - urut(b.unit) || (levelTingkat(a.kelas) ?? 99) - (levelTingkat(b.kelas) ?? 99) || a.rombel.localeCompare(b.rombel, 'id', { numeric: true }));
  const status: Record<string, number> = { aktif: 0, lulus: 0, pindah: 0, keluar: 0 };
  for (const s of siswa) status[s.p.status] = (status[s.p.status] ?? 0) + 1;
  const tpAkhir = `${Number(tp.slice(0, 4)) - 1}/${tp.slice(0, 4)}`;
  const lulusTpIni = siswa.filter((s) => s.p.lulusTp === tpAkhir || s.p.lulusTp === tp).length;
  const hari = hariIni();
  const rekap = tagihan.reduce((r, it) => tambahRekap(r, it.x ?? {}, hari), rekapKosong());
  // Pembayaran 12 bulan terakhir (dari tanggal kwitansi)
  const kini = new Date(`${hari}T00:00:00Z`);
  const bulan: { kunci: string; label: string; n: number }[] = [];
  for (let i = 11; i >= 0; i -= 1) { const t = new Date(Date.UTC(kini.getUTCFullYear(), kini.getUTCMonth() - i, 1)); bulan.push({ kunci: t.toISOString().slice(0, 7), label: `${BULAN_PENDEK[t.getUTCMonth()]}${t.getUTCMonth() === 0 || i === 11 ? ` ${String(t.getUTCFullYear()).slice(2)}` : ''}`, n: 0 }); }
  for (const k of kwitansi) { const b = bulan.find((x) => x.kunci === (k.t ?? '').slice(0, 7)); if (b) b.n += Number(k.x?.jumlah) || 0; }
  const tunggakan = new Map<string, number>();
  for (const it of tagihan) { const sisa = statusTagihan(it.x ?? {}, hari).sisa; if (!sisa) continue; const k = unit ? String(it.x?.kelas ?? '').split(' · ')[0] || 'Tanpa kelas' : it.u; tunggakan.set(k, (tunggakan.get(k) ?? 0) + sisa); }
  const jenis = new Map<string, number>();
  for (const p of penghargaan) { const k = labelJenis(p.x?.jenis); jenis.set(k, (jenis.get(k) ?? 0) + 1); }
  return {
    unit, units, namaUnit, tp, aktif: aktif.length, L: lp(aktif)[0]!, P: lp(aktif)[1]!, rombel: rombelMap.size, lulusTpIni, status, perUnit, perKelas, perRombel,
    tagihan: rekap, bayarBulan: bulan.map((b) => ({ label: b.label, nilai: [b.n] })), bayarBulanIni: bulan[bulan.length - 1]!.n,
    tunggakanPer: [...tunggakan].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => ({ label: unit ? k : namaUnit(k), nilai: [n], href: `/portal/tagihan?status=belum-lunas${unit ? `&unit=${unit}&q=${encodeURIComponent(k)}` : `&unit=${k}`}` })),
    penghargaanJenis: [...jenis].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ label: k, nilai: [n] })), penghargaanTpIni: penghargaan.filter((p) => String(p.x?.tahun ?? '') === tp || (p.t ?? '') >= `${tp.slice(0, 4)}-07-01`).length,
  };
}

kesiswaan.get('/portal/laporan', async (c) => {
  const d = await dataLaporan(c);
  if (d instanceof Response) return d;
  return tampil(c, { judul: 'Laporan & grafik', aktif: '/portal/laporan', body: halamanLaporan(d) });
});

kesiswaan.get('/portal/laporan/unduh.xlsx', async (c) => {
  const d = await dataLaporan(c);
  if (d instanceof Response) return d;
  const kl = await kopLembaga(c, d.unit || 'yayasan');
  const kop = { baris: barisKop(kl.kop, kl.unit), logo: await logoExcel(c, kl.kop) };
  const sub = (judul: string) => [judul, `Tahun Pelajaran ${d.tp} · per ${tanggal(hariIni())}`];
  const x = tulisXlsx([
    { nama: 'Ringkasan', kop, subjudul: sub('LAPORAN KESISWAAN'), tegak: true, kepala: ['Ukuran', 'Nilai'], lebar: [40, 30], baris: [['Siswa aktif', d.aktif], ['Laki-laki', d.L], ['Perempuan', d.P], ['Rombel aktif', d.rombel], ['Lulus tahun ini', d.lulusTpIni], ['Pindah', d.status.pindah ?? 0], ['Keluar', d.status.keluar ?? 0], ['Total tagihan (Rp)', d.tagihan.jumlah], ['Sudah dibayar (Rp)', d.tagihan.dibayar], ['Tunggakan (Rp)', d.tagihan.sisa], ['Tagihan lunas', d.tagihan.lunas], ['Tagihan lewat jatuh tempo', d.tagihan.telat], ['Terkumpul bulan ini (Rp)', d.bayarBulanIni], ['Penghargaan tahun ini', d.penghargaanTpIni]] },
    { nama: 'Per rombel', kop, subjudul: sub('REKAP SISWA PER ROMBEL'), tegak: true, kepala: ['Lembaga', 'Kelas', 'Rombel', 'L', 'P', 'Jumlah'], lebar: [24, 14, 12, 8, 8, 10], baris: d.perRombel.map((r) => [d.namaUnit(r.unit), r.kelas, r.rombel, r.L, r.P, r.L + r.P]) },
    { nama: 'Pembayaran', kop, subjudul: sub('PEMBAYARAN 12 BULAN TERAKHIR'), tegak: true, kepala: ['Bulan', 'Jumlah (Rp)'], lebar: [20, 20], baris: d.bayarBulan.map((b) => [b.label, b.nilai[0]!]) },
    { nama: 'Tunggakan', kop, subjudul: sub('TUNGGAKAN'), tegak: true, kepala: [d.unit ? 'Kelas' : 'Lembaga', 'Sisa (Rp)'], lebar: [30, 20], baris: d.tunggakanPer.map((b) => [b.label, b.nilai[0]!]) },
    { nama: 'Penghargaan', kop, subjudul: sub('PENGHARGAAN PER JENIS'), tegak: true, kepala: ['Jenis', 'Jumlah'], lebar: [30, 12], baris: d.penghargaanJenis.map((b) => [b.label, b.nilai[0]!]) },
  ]);
  await catat(c, 'laporan.unduh', d.unit || 'yayasan');
  return c.body(x, 200, { 'content-type': XLSX_TYPE, 'content-disposition': `attachment; filename="laporan-kesiswaan-${d.unit || 'yayasan'}-${hariIni()}.xlsx"`, ...tanpaCache });
});

export { cariSiswa, normalTanggal, JENJANG, type Jenjang };
