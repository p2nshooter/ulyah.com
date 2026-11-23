/**
 * Rute dokumen lembaga: cetak & pratinjau di portal (/portal/cetak/…, dijaga middleware portal karena dipasang sesudahnya)
 * dan halaman Prestasi publik (/prestasi, /prestasi/:slug, /prestasi/:slug/sertifikat).
 */
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { kecil, media, origin, render, tidakAda } from '../lib/render.ts';
import { hariIni } from '../lib/text.ts';
import { getSitus, getUnit, listUnits } from '../data/site.ts';
import { ambil, ambilSlug, bacaBidang, daftar, type IxItem, type Koleksi } from '../data/koleksi.ts';
import { KOLEKSI, koleksi } from '../data/defs.ts';
import { kopDariDok, kopDariProfil, kopUntuk, labelJenis } from '../data/dokumen.ts';
import { bolehUnit, tingkat, type User } from '../data/users.ts';
import { halamanCetak, kopContohHtml, kwitansiHtml, sertifikatHtml, suratHtml, type DokCetak } from '../pages/cetak.ts';
import { prestasiDetail, prestasiIndex } from '../pages/prestasi.ts';
import { crumbs } from '../pages/layout.ts';
import { jaga } from './portal.ts';
import { esc, raw } from '../lib/html.ts';

export const dokumen = new Hono<HonoEnv>();
// Rute cetak di portal hanya untuk pengguna yang masuk (penjaga yang sama dengan portal: sesi + asal permintaan).
dokumen.use('/portal/cetak/*', jaga);
dokumen.use('/portal/cetak-banyak/*', jaga);
const tanpaCache = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' };
const bolehDef = (u: User, def: Koleksi) => tingkat(u) >= (def.tingkat ?? 0);
/** Semua penghargaan yang tayang tampil di publik (perintah pemilik). Disimpan sebagai fungsi agar satu tempat. */
export const tampilDiPrestasi = (_it: IxItem) => true;

async function renderDok(c: Ctx, def: Koleksi, d: DokCetak, o: { pratinjau?: boolean | string; bingkai?: boolean; verifikasi?: string; kembali?: string } = {}): Promise<string> {
  const store = c.get('store');
  const [s, u] = await Promise.all([getSitus(store), d.unit === 'yayasan' ? null : getUnit(store, d.unit)]);
  const k = def.id === 'kop' ? kopDariDok(d, kopDariProfil(u, s)) : await kopUntuk(store, d.unit, s, u);
  const m = media(c);
  const isi = def.id === 'penghargaan' ? sertifikatHtml(d, k, m, { verifikasi: o.verifikasi }) : def.id === 'kwitansi' ? kwitansiHtml(d, k, m) : def.id === 'surat' ? suratHtml(d, k, m) : kopContohHtml(k, m);
  return halamanCetak({ judul: `${d.judul} — ${def.satu}`, isi, ukuran: def.cetak ?? 'a4p', pratinjau: o.pratinjau, bingkai: o.bingkai, kembali: o.kembali });
}

const verifikasi = (c: Ctx, d: DokCetak) => (d.status === 'tayang' && d.slug ? `${new URL(origin(c)).host}/prestasi/${d.slug}` : undefined);

/* ── portal: cetak & pratinjau ──────────────────────────────────────────── */

dokumen.get('/portal/cetak/:kol/:id', async (c) => {
  const u = c.get('user')!;
  const def = koleksi(c.req.param('kol'));
  if (!def?.cetak) return c.notFound();
  if (!bolehDef(u, def)) return c.text('Anda tidak berhak membuka dokumen ini.', 403);
  const d = await ambil(c.get('store'), def.id, c.req.param('id'));
  if (!d) return c.notFound();
  if (!bolehUnit(u, d.unit)) return c.text('Anda tidak berhak membuka dokumen ini.', 403);
  return c.html(await renderDok(c, def, d, { verifikasi: def.id === 'penghargaan' ? verifikasi(c, d) : undefined, kembali: `/portal/k/${def.id}/${d.id}` }), 200, tanpaCache);
});

/** Banyak dokumen dalam satu halaman cetak (sertifikat massal, atau semua sertifikat lembaga yang dipilih). */
dokumen.get('/portal/cetak-banyak/:kol', async (c) => {
  const u = c.get('user')!;
  const def = koleksi(c.req.param('kol'));
  if (!def?.cetak) return c.notFound();
  if (!bolehDef(u, def)) return c.text('Anda tidak berhak membuka dokumen ini.', 403);
  const store = c.get('store');
  let ids = (c.req.queries('id') ?? []).slice(0, 150);
  const unit = c.req.query('unit') ?? '';
  if (!ids.length && unit) {
    if (!bolehUnit(u, unit)) return c.text('Anda tidak mengelola lembaga ini.', 403);
    const tahun = c.req.query('tahun') ?? '';
    const jenis = c.req.query('jenis') ?? '';
    ids = (await daftar(store, def.id, { unit, limit: 150, saring: (it) => (!tahun || String(it.x?.tahun ?? '') === tahun) && (!jenis || String(it.x?.jenis ?? '') === jenis) })).map((it) => it.id);
  }
  const doks = (await Promise.all(ids.map((id) => ambil(store, def.id, id)))).filter((d): d is NonNullable<typeof d> => Boolean(d && bolehUnit(u, d.unit)));
  if (!doks.length) return c.text('Tidak ada dokumen untuk dicetak.', 404);
  const lembar = await Promise.all(doks.map(async (d) => {
    const halaman = await renderDok(c, def, d, { verifikasi: def.id === 'penghargaan' ? verifikasi(c, d) : undefined });
    return /<div class="panggung">([\s\S]*)<\/div>\s*<script/.exec(halaman)?.[1] ?? '';
  }));
  return c.html(halamanCetak({ judul: `${doks.length} ${def.satu}`, isi: raw(lembar.join('\n')), ukuran: def.cetak, kembali: `/portal/k/${def.id}`, info: `${doks.length} ${esc(def.satu)} siap dicetak — satu lembar per ${esc(def.satu)}.` }), 200, tanpaCache);
});

/** Pratinjau langsung dari isian formulir (belum disimpan). Dikirim formulir portal ke iframe bernama „pratinjau-dok“. */
dokumen.post('/portal/cetak/:kol/pratinjau', async (c) => {
  const u = c.get('user')!;
  const def = koleksi(c.req.param('kol'));
  if (!def?.cetak) return c.notFound();
  if (!bolehDef(u, def)) return c.text('Anda tidak berhak membuka dokumen ini.', 403);
  const f = (await c.req.parseBody({ all: true })) as Record<string, unknown>;
  const form: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) if (k.startsWith('d_')) form[k.slice(2)] = Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v : '';
  const unit = String(f.unit ?? '');
  if (!bolehUnit(u, unit)) return c.text('Anda tidak mengelola lembaga ini.', 403);
  const { d } = bacaBidang(def, form);
  if (def.nomorOtomatis && typeof d[def.nomorOtomatis] !== 'string') d[def.nomorOtomatis] = '(nomor otomatis saat disimpan)';
  const tgl = String(f.tanggal ?? '');
  const dok: DokCetak = { judul: String(f.judul ?? '').trim() || '(nama belum diisi)', tanggal: /^\d{4}-\d{2}-\d{2}$/.test(tgl) ? tgl : hariIni(), d, unit };
  return c.html(await renderDok(c, def, dok, { pratinjau: true }), 200, tanpaCache);
});

/* ── publik: prestasi ───────────────────────────────────────────────────── */

async function prestasiTayang(c: Ctx) {
  const store = c.get('store');
  const units = await listUnits(store);
  const semua = (await daftar(store, 'penghargaan', { tayang: true, limit: 900, saring: tampilDiPrestasi })).filter((it) => it.u === 'yayasan' || units.some((u) => u.slug === it.u));
  return { units, semua, x: { media: media(c), kecil, units } };
}

dokumen.get('/prestasi', async (c) => {
  const { units, semua, x } = await prestasiTayang(c);
  const q = (k: string) => c.req.query(k) ?? '';
  const pilihUnit = ['yayasan', ...units.map((u) => u.slug)].includes(q('lembaga')) ? q('lembaga') : '';
  const jenisAda = [...new Set(semua.map((it) => String(it.x?.jenis ?? 'lainnya')))];
  const pilihJenis = jenisAda.includes(q('jenis')) ? q('jenis') : '';
  const tahunAda = [...new Set(semua.map((it) => String(it.x?.tahun ?? '')).filter(Boolean))].sort().reverse();
  const pilihTahun = tahunAda.includes(q('tahun')) ? q('tahun') : '';
  const items = semua.filter((it) => (!pilihUnit || it.u === pilihUnit) && (!pilihJenis || String(it.x?.jenis ?? 'lainnya') === pilihJenis) && (!pilihTahun || String(it.x?.tahun ?? '') === pilihTahun)).slice(0, 240);
  const disaring = Boolean(pilihUnit || pilihJenis || pilihTahun);
  return render(c, {
    path: '/prestasi', aktif: 'kabar', noindex: disaring,
    title: 'Prestasi & Penghargaan Santri — Yayasan Al-Huda Yapida Sukakarya',
    desc: 'Sertifikat tahfidz Al-Qur’an, piagam juara lomba, peringkat kelas, dan penghargaan santri RA, MI, MTs, pesantren, dan TPQ Al Huda Yapida, Sukakarya, Bekasi.',
    body: prestasiIndex(x, items, { pilihUnit, pilihJenis, pilihTahun, ada: new Set(semua.map((it) => it.u)), jenisAda, tahunAda, contoh: CONTOH_SERTIFIKAT }),
    jsonLd: [crumbs(origin(c), [['Prestasi', '/prestasi']])],
  });
});

async function penghargaanPublik(c: Ctx) {
  const store = c.get('store');
  const d = await ambilSlug(store, 'penghargaan', c.req.param('slug') ?? '');
  if (!d || d.status !== 'tayang') return null;
  if (d.unit !== 'yayasan' && !(await listUnits(store)).some((u) => u.slug === d.unit)) return null;
  return d;
}

dokumen.get('/prestasi/:slug', async (c) => {
  const d = await penghargaanPublik(c);
  if (!d) return tidakAda(c);
  const units = await listUnits(c.get('store'));
  const x = { media: media(c), kecil, units };
  const o = origin(c);
  const foto = typeof d.d.foto === 'string' && d.d.foto ? x.media(d.d.foto) : undefined;
  return render(c, {
    path: `/prestasi/${d.slug}`, aktif: 'kabar',
    title: `${d.judul} — ${labelJenis(d.d.jenis)} | Prestasi Yapida`.slice(0, 90),
    desc: `${d.judul} meraih ${labelJenis(d.d.jenis).toLowerCase()}: ${String(d.d.capaian ?? '')} (${String(d.d.tahun ?? '')}) — ${x.units.find((u) => u.slug === d.unit)?.nama ?? 'Yayasan Al-Huda Yapida'}.`.slice(0, 220),
    body: prestasiDetail(x, d, { url: `${o}/prestasi/${d.slug}` }), ogImage: foto ? (foto.startsWith('http') ? foto : `${o}${foto}`) : undefined,
    jsonLd: [crumbs(o, [['Prestasi', '/prestasi'], [d.judul, `/prestasi/${d.slug}`]]), { '@context': 'https://schema.org', '@type': 'EducationalOccupationalCredential', name: `${labelJenis(d.d.jenis)} — ${d.judul}`, credentialCategory: labelJenis(d.d.jenis), description: String(d.d.capaian ?? ''), dateCreated: d.tanggal, recognizedBy: { '@id': `${o}/#yayasan` }, url: `${o}/prestasi/${d.slug}` }],
  });
});

/** Contoh desain sertifikat untuk beranda & menu Prestasi (pemilik, 23 Nov 2026: „Sertifikat2 nya tampilin jg di homepage,
 *  contoh2 sertifikat yg d keluarkan lembaga“). Nama contoh „Fulanah binti Fulan“ dan pita CONTOH — bukan penghargaan sungguhan. */
export const CONTOH_SERTIFIKAT: { desain: string; jenis: string; capaian: string; predikat: string; kegiatan: string; unit: string; kelas: string }[] = [
  { desain: 'zamrud', jenis: 'tahfidz', capaian: 'Juz 30 (An-Naba’ – An-Nas)', predikat: 'Mumtaz', kegiatan: 'Wisuda Tahfidz', unit: 'mi-al-huda', kelas: 'Kelas 5' },
  { desain: 'kaligrafi', jenis: 'tahfidz', capaian: 'Juz 29 (Al-Mulk – Al-Mursalat)', predikat: 'Jayyid Jiddan', kegiatan: 'Wisuda Tahfidz', unit: 'mts-al-huda', kelas: 'Kelas 8' },
  { desain: 'malam', jenis: 'lomba', capaian: 'Lomba Adzan tingkat Kecamatan Sukakarya', predikat: 'Juara 1', kegiatan: 'Peringatan Maulid Nabi ﷺ', unit: 'mi-al-huda', kelas: 'Kelas 6' },
  { desain: 'safir', jenis: 'ranking', capaian: 'Peringkat 1 Kelas 7', predikat: 'Terbaik', kegiatan: 'Semester Ganjil', unit: 'mts-al-huda', kelas: 'Kelas 7' },
  { desain: 'arabesque', jenis: 'teladan', capaian: 'Santri Teladan Pondok Pesantren', predikat: 'Teladan', kegiatan: 'Haflah Akhirussanah', unit: 'ponpes-al-huda', kelas: '' },
  { desain: 'ceria', jenis: 'tahfidz', capaian: 'Hafalan Surah Pendek', predikat: 'Mumtaz', kegiatan: 'Wisuda Iqra’', unit: 'tpq-al-huda', kelas: 'Jilid 6' },
];

dokumen.get('/prestasi/contoh/:n', async (c) => {
  const n = Number(c.req.param('n'));
  const ct = CONTOH_SERTIFIKAT[n];
  if (!Number.isInteger(n) || !ct) return c.notFound();
  const d: DokCetak = { judul: 'Fulanah binti Fulan', tanggal: hariIni(), unit: ct.unit, d: { jenis: ct.jenis, desain: ct.desain, capaian: ct.capaian, predikat: ct.predikat, kegiatan: ct.kegiatan, kelas: ct.kelas, tahun: '2026/2027', nomor: 'CONTOH', ttd1Nama: 'Kepala Lembaga', ttd1Jabatan: 'Kepala', ttd2Nama: 'Ketua Yayasan', ttd2Jabatan: 'Ketua Yayasan Al-Huda Yapida' } };
  const res = c.html(await renderDok(c, KOLEKSI.penghargaan!, d, { pratinjau: 'CONTOH', bingkai: true }), 200, { 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'noindex' });
  return res;
});

dokumen.get('/prestasi/:slug/sertifikat', async (c) => {
  const d = await penghargaanPublik(c);
  if (!d) return c.notFound();
  return c.html(await renderDok(c, KOLEKSI.penghargaan!, d, { verifikasi: verifikasi(c, d), kembali: `/prestasi/${d.slug}`, bingkai: c.req.query('bingkai') === '1' }), 200, { 'cache-control': 'public, max-age=300' });
});
