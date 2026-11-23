/**
 * Rute Bank Soal (perintah pemilik 22 & 37; src/data/soal.ts):
 *   publik   /bank-soal, /bank-soal/:id (latihan tamu: dinilai, kunci & pembahasan sesudah diserahkan, tidak disimpan)
 *   API      POST /api/soal/:id/nilai (penilaian di server; siswa yang masuk → hasil tersimpan), POST /api/soal/hasil/…/diri
 *   siswa    /siswa/bank-soal (paket kelasnya + riwayat), /siswa/bank-soal/:id, /siswa/bank-soal/hasil/:paket/:key (cetak/PDF)
 *   portal   /portal/bank-soal (daftar, buat/ubah naskah, periksa langsung, cetak legal berkop, kunci, Word, rekap + grafik)
 * Paket berkunci tidak pernah dikirim ke peramban sebelum diserahkan; /assets/soal/p/* selalu 404 bagi peramban.
 */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { asalSama } from '../lib/session.ts';
import { limit } from '../lib/ratelimit.ts';
import { media, origin, render, tidakAda } from '../lib/render.ts';
import { html } from '../lib/html.ts';
import { crumbs } from '../pages/layout.ts';
import { getSitus, getUnit, listUnits } from '../data/site.ts';
import { bolehTayang, bolehUnit, lingkupSemua, PERAN, tingkat, type User } from '../data/users.ts';
import { kopUntuk } from '../data/dokumen.ts';
import type { Dok } from '../data/koleksi.ts';
import {
  ambilHasil, ambilPaket, bersihkanJawaban, daftarPaketLembaga, hapusPaketLembaga, hasilPaket, ID_PAKET, indeksBawaan, judulPaket, jumlahButir, nilaiPaket,
  aturBagi, dibagikan, kelasSiswa, paketSiswa, paketTanpaKunci, templatSoal, unitJenjang, untukGuru, perbaruiDiri, riwayatSiswa, simpanHasil, simpanPaketLembaga, teksPaket, uraiSoal, CONTOH_FORMAT, NAMA_JENJANG, type JenisUjian, type JenjangSoal, type Paket, type Semester,
} from '../data/soal.ts';
import { bankSoalPage, bankSoalSiswaPage, cetakSoalDok, detailSoalPage, docSoal, editorSoalPage, hasilSiswaDok, kerjakanPage, portalBankSoalPage, rekapSoalPage, type TabSoal } from '../pages/soal.ts';
import { sesiSiswa } from './siswa.ts';
import { jaga, tampil, tanpaCache, tolak } from './portal.ts';

export const soal = new Hono<HonoEnv>();
const ip = (c: Ctx) => c.req.header('cf-connecting-ip') ?? 'lokal';
/**
 * Siapa boleh membuka paket:
 * - pengelola (guru ke atas): semua paket bawaan & paket lembaganya (untuk pratinjau);
 * - soal ujian PTS/PAS (bank soal guru): siswa hanya bila guru lembaganya sudah membagikannya sesudah ujian;
 * - latihan (bank soal siswa): bawaan terbuka untuk semua; latihan buatan guru hanya siswa lembaga itu (tayang).
 */
async function bolehBuka(c: Ctx, p: Paket, siswa: Dok | null): Promise<boolean> {
  const u = c.get('user');
  if (u && tingkat(u) >= PERAN.kontributor.tingkat && (!p.unit || bolehUnit(u, p.unit))) return true;
  if (untukGuru(p)) return Boolean(siswa && (!p.unit || (siswa.unit === p.unit && p.status === 'tayang')) && (await dibagikan(c.get('store'), siswa.unit)).has(p.id));
  if (!p.unit) return true;
  return Boolean(siswa && siswa.unit === p.unit && p.status === 'tayang');
}

/* ── publik ──────────────────────────────────────────────────────────────────────────────────────────────────── */

soal.get('/assets/soal/p/*', (c) => c.text('Tidak ditemukan', 404, { 'cache-control': 'no-store' }));

soal.get('/bank-soal', async (c) => {
  // halaman publik = bank soal SISWA (latihan); soal ujian PTS/PAS hanya di portal guru
  const indeks = (await indeksBawaan(c.env)).filter((p) => !untukGuru(p));
  const jq = c.req.query('jenjang') ?? '';
  const jenjang = (['ra', 'mi', 'mts'] as string[]).includes(jq) ? (jq as JenjangSoal) : '';
  const kq = Number(c.req.query('kelas'));
  const kelas = jenjang && Number.isInteger(kq) && kq >= 1 && kq <= 9 ? kq : null;
  const siswa = await sesiSiswa(c);
  return render(c, {
    path: jenjang ? `/bank-soal?jenjang=${jenjang}${kelas ? `&kelas=${kelas}` : ''}` : '/bank-soal', aktif: 'belajar', css: ['soal.css'],
    title: `Latihan Soal ${jenjang ? NAMA_JENJANG[jenjang] : 'RA, MI, MTs'}${kelas ? ` Kelas ${kelas}` : ''} — Kunci & Pembahasan | Bank Soal Yapida`,
    desc: 'Latihan soal Kurikulum Berbasis Cinta untuk RA, MI, dan MTs per kelas dan mata pelajaran (Fikih, Al-Qur\'an Hadis, Akidah Akhlak, SKI, Pendidikan Pancasila, Bahasa Indonesia, IPAS, dan lainnya) — langsung dinilai, lengkap dengan kunci jawaban dan pembahasan.',
    body: bankSoalPage({ indeks, jenjang, kelas, mapel: c.req.query('mapel') ?? '', siswaMasuk: Boolean(siswa) }),
    jsonLd: [crumbs(origin(c), [['Bank Soal', '/bank-soal']])],
  });
});

soal.get('/bank-soal/:id', async (c) => {
  const store = c.get('store');
  const p = await ambilPaket(c.env, store, c.req.param('id'));
  const siswa = await sesiSiswa(c);
  if (!p || !(await bolehBuka(c, p, siswa))) return tidakAda(c);
  const k = siswa ? kelasSiswa(siswa) : null;
  const o = origin(c);
  return render(c, {
    path: `/bank-soal/${p.id}`, aktif: 'belajar', css: ['soal.css'], noindex: Boolean(p.unit), noStore: Boolean(siswa),
    title: `${p.judul} — Soal, Kunci Jawaban & Pembahasan | Yapida`,
    desc: `Latihan ${p.judul} (${jumlahButir(p)} soal): pilihan ganda, menjodohkan, isian, dan uraian. Kerjakan langsung, nilai keluar otomatis, kunci jawaban dan pembahasan tampil setelah selesai.`,
    body: kerjakanPage({ paket: paketTanpaKunci(p), siswa: siswa && k ? { nama: siswa.judul, kelas: k.nama } : undefined, kembali: '/bank-soal', simpan: Boolean(siswa) }),
    jsonLd: [crumbs(o, [['Bank Soal', '/bank-soal'], [p.judul, `/bank-soal/${p.id}`]]), { '@context': 'https://schema.org', '@type': 'Quiz', name: p.judul, educationalLevel: `${p.jenjang.toUpperCase()} ${p.kelas}`, about: p.mapel, inLanguage: 'id', url: `${o}/bank-soal/${p.id}`, provider: { '@id': `${o}/#yayasan` }, numberOfQuestions: jumlahButir(p) }],
  });
});

soal.post('/api/soal/:id/nilai', async (c) => {
  if (!asalSama(c)) return c.json({ error: 'asal' }, 403);
  if (!(await limit(c.env, `soal:${ip(c)}`, 120, 3600))) return c.json({ error: 'Terlalu sering. Coba lagi nanti.' }, 429);
  const store = c.get('store');
  const p = await ambilPaket(c.env, store, c.req.param('id'));
  const siswa = await sesiSiswa(c);
  if (!p || p.ra?.length || !(await bolehBuka(c, p, siswa))) return c.json({ error: 'Paket tidak ditemukan.' }, 404);
  const body = (await c.req.json().catch(() => ({}))) as { jawaban?: unknown };
  const j = bersihkanJawaban(body.jawaban, p);
  const n = nilaiPaket(p, j);
  let hasil: string | undefined;
  if (siswa) {
    const k = kelasSiswa(siswa);
    const key = await simpanHasil(store, { paket: p.id, judul: p.judul, siswa: siswa.id, nama: siswa.judul, unit: siswa.unit, kelas: k.nama, rombel: k.rombel, nilai: n.nilai, skor: n.skor, benar: n.benar, jawaban: j, t: Date.now() });
    hasil = `${p.id}/${key}`;
  }
  return c.json({ ...n, ...(hasil ? { hasil } : {}) }, 200, tanpaCache);
});

soal.post('/api/soal/hasil/:paket/:key/diri', async (c) => {
  if (!asalSama(c)) return c.json({ error: 'asal' }, 403);
  const siswa = await sesiSiswa(c);
  if (!siswa) return c.json({ error: 'Masuk Portal Siswa dulu.' }, 401);
  const store = c.get('store');
  const h = await ambilHasil(store, c.req.param('paket'), c.req.param('key'));
  const p = h ? await ambilPaket(c.env, store, h.paket) : null;
  if (!h || !p || h.siswa !== siswa.id) return c.json({ error: 'Hasil tidak ditemukan.' }, 404);
  const body = (await c.req.json().catch(() => ({}))) as { diri?: unknown };
  const baru = await perbaruiDiri(store, p, c.req.param('key'), Array.isArray(body.diri) ? (body.diri as (number | null)[]) : []);
  return c.json({ nilai: baru?.nilai ?? h.nilai, skor: baru?.skor ?? h.skor }, 200, tanpaCache);
});

/* ── portal siswa ────────────────────────────────────────────────────────────────────────────────────────────── */

soal.get('/siswa/bank-soal', async (c) => {
  const siswa = await sesiSiswa(c);
  if (!siswa) return c.redirect('/siswa');
  const [daftar, riwayat] = await Promise.all([paketSiswa(c.env, c.get('store'), siswa), riwayatSiswa(c.get('store'), siswa.id)]);
  return render(c, { path: '/siswa/bank-soal', title: `Bank Soal ${daftar.kelas} — Portal Siswa Yapida`, desc: 'Bank soal Portal Siswa.', noindex: true, noAds: true, noStore: true, kelas: 'hal-siswa', css: ['siswa.css', 'soal.css'], body: bankSoalSiswaPage({ ...daftar, riwayat }) });
});

soal.get('/siswa/bank-soal/:id', async (c) => {
  const siswa = await sesiSiswa(c);
  if (!siswa) return c.redirect('/siswa');
  const p = await ambilPaket(c.env, c.get('store'), c.req.param('id'));
  if (!p || !(await bolehBuka(c, p, siswa))) return tidakAda(c);
  const k = kelasSiswa(siswa);
  return render(c, { path: `/siswa/bank-soal/${p.id}`, title: `${p.judul} — Portal Siswa Yapida`, desc: p.judul, noindex: true, noAds: true, noStore: true, kelas: 'hal-siswa', css: ['siswa.css', 'soal.css'], body: kerjakanPage({ paket: paketTanpaKunci(p), siswa: { nama: siswa.judul, kelas: k.nama }, kembali: '/siswa/bank-soal', simpan: true }) });
});

soal.get('/siswa/bank-soal/hasil/:paket/:key', async (c) => {
  const siswa = await sesiSiswa(c);
  if (!siswa) return c.redirect('/siswa');
  const store = c.get('store');
  const h = await ambilHasil(store, c.req.param('paket'), c.req.param('key'));
  const p = h ? await ambilPaket(c.env, store, h.paket) : null;
  if (!h || !p || h.siswa !== siswa.id) return tidakAda(c);
  const [s, unit, units] = await Promise.all([getSitus(store), getUnit(store, siswa.unit), listUnits(store, true)]);
  const kop = await kopUntuk(store, siswa.unit, s, unit);
  return c.html(hasilSiswaDok({ h, p, kop, media: media(c), lembaga: units.find((u) => u.slug === siswa.unit)?.nama ?? siswa.unit }), 200, { ...tanpaCache });
});

/* ── portal guru ─────────────────────────────────────────────────────────────────────────────────────────────── */

const pastikan = async (c: Ctx, next: () => Promise<void>) => (c.get('user') ? next() : jaga(c, next));
soal.use('/portal/bank-soal', pastikan);
soal.use('/portal/bank-soal/*', pastikan);
const bolehLihat = (u: User) => tingkat(u) >= PERAN.kontributor.tingkat;
const unitsMilik = async (c: Ctx) => (await listUnits(c.get('store'), true)).filter((x) => bolehUnit(c.get('user')!, x.slug));

/** Paket yang boleh dikelola akun ini (bawaan: lihat & cetak; paket guru: lembaganya). */
async function muatPaket(c: Ctx): Promise<Paket | null> {
  const id = c.req.param('id') ?? '';
  if (!ID_PAKET.test(id)) return null;
  const p = await ambilPaket(c.env, c.get('store'), id);
  if (!p) return null;
  return !p.unit || bolehUnit(c.get('user')!, p.unit) ? p : null;
}

soal.get('/portal/bank-soal', async (c) => {
  const u = c.get('user')!;
  if (!bolehLihat(u)) return tolak(c);
  const store = c.get('store');
  const units = await listUnits(store, true);
  const [bawaan, milik] = await Promise.all([indeksBawaan(c.env), daftarPaketLembaga(store, lingkupSemua(u) ? null : u.units)]);
  const nama = (s: string) => units.find((x) => x.slug === s)?.singkat ?? s;
  const tq = c.req.query('tab');
  const tab: TabSoal = tq === 'siswa' || tq === 'peta' ? tq : 'guru';
  return tampil(c, {
    judul: 'Bank Soal', aktif: '/portal/bank-soal',
    body: portalBankSoalPage({ bawaan, lembaga: milik.map((p) => ({ ...p, unitNama: nama(p.unit ?? '') })), bolehBuat: (await unitsMilik(c)).length > 0, tab, filter: { jenjang: (c.req.query('jenjang') ?? '').slice(0, 4), kelas: (c.req.query('kelas') ?? '').slice(0, 2), mapel: (c.req.query('mapel') ?? '').slice(0, 60) } }),
  });
});

soal.get('/portal/bank-soal/baru', async (c) => {
  const u = c.get('user')!;
  if (!bolehLihat(u)) return tolak(c);
  const units = await unitsMilik(c);
  if (!units.length) return tolak(c);
  const salin = c.req.query('salin') ?? '';
  const asal = ID_PAKET.test(salin) ? await ambilPaket(c.env, c.get('store'), salin) : null;
  // dari peta kelengkapan: kepala paket + kerangka soal sudah terisi untuk slot yang kosong
  const q = c.req.query();
  const jenjang = (['ra', 'mi', 'mts'] as string[]).includes(q.jenjang ?? '') ? (q.jenjang as JenjangSoal) : null;
  const kelas = Number(q.kelas);
  const mapel = (q.mapel ?? '').replace(/[\r\n]/g, ' ').trim().slice(0, 60);
  const templat = jenjang && Number.isInteger(kelas) && kelas >= 1 && kelas <= 9 && mapel
    ? templatSoal({ jenjang, kelas, mapel, semester: (q.semester === 'genap' ? 'genap' : 'ganjil') as Semester, jenis: (['pts', 'pas', 'latihan'].includes(q.jenis ?? '') ? q.jenis : 'pas') as JenisUjian })
    : null;
  const unitAwal = (jenjang && units.find((x) => unitJenjang(x, jenjang))?.slug) || units[0]!.slug;
  return tampil(c, { judul: asal ? `Salin: ${asal.judul}` : 'Buat paket soal', aktif: '/portal/bank-soal', body: editorSoalPage({ teks: asal ? teksPaket(asal) : templat ?? CONTOH_FORMAT, unit: unitAwal, units, status: 'draf', bolehTayang: bolehTayang(u) }) });
});

soal.get('/portal/bank-soal/:id/ubah', async (c) => {
  const u = c.get('user')!;
  const p = await muatPaket(c);
  if (!p || !p.unit) return tolak(c);
  return tampil(c, { judul: `Ubah: ${p.judul}`, aktif: '/portal/bank-soal', body: editorSoalPage({ teks: teksPaket(p), id: p.id, unit: p.unit, units: await unitsMilik(c), status: p.status ?? 'draf', bolehTayang: bolehTayang(u) }) });
});

soal.post('/portal/bank-soal/periksa', async (c) => {
  if (!asalSama(c)) return c.json({ error: 'asal' }, 403);
  const body = (await c.req.json().catch(() => ({}))) as { teks?: unknown };
  const h = uraiSoal(String(body.teks ?? '').slice(0, 60_000));
  const p = h.paket;
  return c.json({ galat: h.galat.slice(0, 8), peringatan: h.peringatan, ringkas: p ? `${judulPaket(p)} · ${jumlahButir(p)} soal (PG ${p.pg.length} · jodoh ${p.jodoh.kiri.length} · isian ${p.isian.length} · uraian ${p.uraian.length}${p.ra ? ` · RA ${p.ra.length}` : ''})` : '' }, 200, tanpaCache);
});

soal.post('/portal/bank-soal/simpan', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const u = c.get('user')!;
  if (!bolehLihat(u)) return tolak(c);
  const f = await c.req.parseBody();
  const teks = String(f.teks ?? '').slice(0, 60_000);
  const unit = String(f.unit ?? '');
  const units = await unitsMilik(c);
  if (!units.some((x) => x.slug === unit)) return tolak(c);
  const id = String(f.id ?? '');
  const lama = id && ID_PAKET.test(id) && !id.startsWith('b-') ? await ambilPaket(c.env, c.get('store'), id) : null;
  if (id && (!lama || !lama.unit || !bolehUnit(u, lama.unit))) return tolak(c);
  const h = uraiSoal(teks, { unit });
  const status = f.status === 'tayang' && bolehTayang(u) ? 'tayang' : 'draf';
  if (!h.paket) return tampil(c, { judul: 'Periksa naskah soal', aktif: '/portal/bank-soal', status: 400, body: editorSoalPage({ teks, id: id || undefined, unit, units, status, bolehTayang: bolehTayang(u), galat: h.galat, peringatan: h.peringatan }) });
  const p = await simpanPaketLembaga(c.get('store'), { ...h.paket, ...(lama ? { id: lama.id } : {}), status }, unit, u.nama);
  return c.redirect(`/portal/bank-soal/${p.id}`, 303);
});

soal.get('/portal/bank-soal/:id', async (c) => {
  const u = c.get('user')!;
  if (!bolehLihat(u)) return tolak(c);
  const p = await muatPaket(c);
  if (!p) return tolak(c);
  const units = await unitsMilik(c);
  const unitCetak = pilihUnitCetak(units, p, c.req.query('unit'));
  const store = c.get('store');
  const hasil = await hasilPaket(store, p.id, lingkupSemua(u) ? null : u.units);
  // soal ujian: lembaga (jenjang paket) yang boleh dibagikan oleh akun ini + statusnya
  const sasaran = untukGuru(p) && bolehTayang(u) ? units.filter((x) => (p.unit ? x.slug === p.unit : unitJenjang(x, p.jenjang))) : [];
  const bagi = await Promise.all(sasaran.map(async (x) => ({ unit: x.slug, nama: x.nama, aktif: (await dibagikan(store, x.slug)).has(p.id) })));
  return tampil(c, {
    judul: p.judul, aktif: '/portal/bank-soal', aksi: html`<a class="tbl tbl-garis tbl-kecil" href="/portal/bank-soal?tab=${untukGuru(p) ? 'guru' : 'siswa'}">← Bank Soal</a>`,
    body: detailSoalPage({ p, bawaan: !p.unit, units: units.length ? units : [{ slug: 'yayasan', nama: 'Yayasan Al-Huda Yapida' }], unitCetak, bolehUbah: true, bolehHapus: Boolean(p.unit) && bolehTayang(u), jumlahHasil: hasil.length, bagi }),
  });
});

/** Lembaga untuk kop cetak: pilihan di halaman → lembaga pemilik paket → lembaga sejenjang (MI untuk paket MI, MTs untuk
 *  paket MTs, RA untuk paket RA) → lembaga pertama akun. Sebelumnya paket bawaan dicetak dengan kop lembaga pertama
 *  di daftar (Masjid Jami’), bukan madrasahnya. */
function pilihUnitCetak(units: { slug: string; jenis?: string }[], p: Pick<Paket, 'unit' | 'jenjang'>, minta?: string): string {
  if (minta && units.some((x) => x.slug === minta)) return minta;
  if (p.unit) return p.unit;
  return units.find((x) => unitJenjang(x, p.jenjang))?.slug ?? units[0]?.slug ?? 'yayasan';
}

async function kopCetak(c: Ctx, p: Paket) {
  const store = c.get('store');
  const units = await unitsMilik(c);
  const unit = pilihUnitCetak(units, p, c.req.query('unit'));
  const [s, ud] = await Promise.all([getSitus(store), unit === 'yayasan' ? Promise.resolve(null) : getUnit(store, unit)]);
  return kopUntuk(store, unit, s, ud);
}

soal.get('/portal/bank-soal/:id/cetak', async (c) => {
  const p = await muatPaket(c);
  if (!p || p.ra?.length) return tolak(c);
  const kop = await kopCetak(c, p);
  return c.html(cetakSoalDok({ p, kop, media: media(c), kunci: c.req.query('kunci') === '1', kembali: `/portal/bank-soal/${p.id}` }), 200, tanpaCache);
});

soal.get('/portal/bank-soal/:id/doc', async (c) => {
  const p = await muatPaket(c);
  if (!p || p.ra?.length) return tolak(c);
  const kop = await kopCetak(c, p);
  const logo = kop.logo ? new URL(media(c)(kop.logo), origin(c)).toString() : `${origin(c)}/assets/logo-512.webp`;
  const nama = `${p.judul}${c.req.query('kunci') === '1' ? ' - Kunci' : ''}`.replace(/[^\w\s.-]+/g, '').replace(/\s+/g, '-');
  return c.body(`﻿${docSoal({ p, kop, logo, kunci: c.req.query('kunci') === '1' })}`, 200, { 'content-type': 'application/msword; charset=utf-8', 'content-disposition': `attachment; filename="${nama}.doc"`, ...tanpaCache });
});

/** Bagikan / tarik soal ujian (PTS/PAS) ke siswa satu lembaga sebagai latihan — hanya admin lembaga ke atas. */
soal.post('/portal/bank-soal/:id/bagikan', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const u = c.get('user')!;
  const p = await muatPaket(c);
  if (!p || !untukGuru(p) || !bolehTayang(u)) return tolak(c);
  const f = await c.req.parseBody();
  const unit = String(f.unit ?? '');
  const units = await unitsMilik(c);
  const x = units.find((y) => y.slug === unit);
  if (!x || (p.unit ? p.unit !== unit : !unitJenjang(x, p.jenjang))) return tolak(c);
  await aturBagi(c.get('store'), unit, p.id, f.bagi === '1', u.nama);
  return c.redirect(`/portal/bank-soal/${p.id}`, 303);
});

soal.post('/portal/bank-soal/:id/hapus', async (c) => {
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const u = c.get('user')!;
  const p = await muatPaket(c);
  if (!p || !p.unit || !bolehTayang(u)) return tolak(c);
  await hapusPaketLembaga(c.get('store'), p);
  return c.redirect('/portal/bank-soal', 303);
});

soal.get('/portal/bank-soal/:id/hasil', async (c) => {
  const u = c.get('user')!;
  if (!bolehLihat(u)) return tolak(c);
  const p = await muatPaket(c);
  if (!p) return tolak(c);
  const store = c.get('store');
  const units = await listUnits(store, true);
  const hasil = (await hasilPaket(store, p.id, lingkupSemua(u) ? null : u.units)).sort((a, b) => b.t - a.t);
  const unitNama = (s: string) => units.find((x) => x.slug === s)?.singkat ?? s;
  if (c.req.query('csv') === '1') {
    const sel = (x: unknown) => `"${String(x).replace(/"/g, '""')}"`;
    const csv = ['Nama;Lembaga;Kelas;Rombel;Nilai;Waktu', ...hasil.map((x) => [x.n, unitNama(x.u), x.k, x.r, x.v, new Date(x.t + 7 * 3600_000).toISOString().slice(0, 16).replace('T', ' ')].map(sel).join(';'))].join('\r\n');
    return c.body(`﻿${csv}`, 200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="rekap-${p.id}.csv"`, ...tanpaCache });
  }
  // ketuntasan per soal dari (paling banyak) 200 pengerjaan terbaru
  let rinci: { pg: number[]; jodoh: number[]; isian: number[] } | null = null;
  if (hasil.length && !p.ra?.length) {
    const docs = (await Promise.all(hasil.slice(0, 200).map((x) => ambilHasil(store, p.id, x.key)))).filter((x) => x !== null);
    const persen = (ambil: (h: (typeof docs)[number]) => boolean[], n: number) => Array.from({ length: n }, (_v, i) => (docs.filter((h) => ambil(h)[i]).length / Math.max(1, docs.length)) * 100);
    rinci = { pg: persen((h) => h!.benar.pg, p.pg.length), jodoh: persen((h) => h!.benar.jodoh, p.jodoh.kiri.length), isian: persen((h) => h!.benar.isian, p.isian.length) };
  }
  return tampil(c, { judul: `Rekap: ${p.judul}`, aktif: '/portal/bank-soal', aksi: html`<a class="tbl tbl-garis tbl-kecil" href="/portal/bank-soal/${p.id}">← Paket</a>`, body: rekapSoalPage({ p, hasil, rinci, unitNama }) });
});
