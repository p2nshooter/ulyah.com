/** Rute publik isi lembaga (kabar, galeri, video, agenda, dokumen, karya, PPDB + formulir, struktur & guru) dan berkas media. */
import { infoPage } from '../pages/info.ts';
import { rentangInfo } from '../data/site.ts';
import { Hono } from 'hono';
import type { Ctx, HonoEnv } from '../lib/session.ts';
import { asalSama } from '../lib/session.ts';
import { bersihTeks, kirimSaran, MAKS_ISI, URUT_KATEGORI, type KategoriSaran } from '../data/saran.ts';
import { crumbs } from '../pages/layout.ts';
import { kecil, media, origin, render, tidakAda } from '../lib/render.ts';
import { getSitus, getUnit, listUnits } from '../data/site.ts';
import { ambil, ambilSlug, bacaBidang, daftar, simpan, type Dok, type IxItem } from '../data/koleksi.ts';
import { PENDAFTAR } from '../data/defs.ts';
import { BERKAS_RE } from '../data/koleksi.ts';
import { videoKanal } from '../data/yt.ts';
import { limit } from '../lib/ratelimit.ts';
import { polos, ringkas } from '../lib/text.ts';
import {
  agendaPage, dokumenPage, galeriDetail, galeriIndex, kabarDetail, kabarIndex, karyaDetail, karyaIndex, pendiriPage, ppdbDetail, ppdbIndex, sdmDetail,
  strukturPage, videoPage, type Ctx as VCtx,
} from '../pages/konten.ts';

export const konten = new Hono<HonoEnv>();

/** Alamat publik sebuah dokumen koleksi (dipakai portal untuk tombol „Lihat di situs“ dan sitemap). */
export function publikDok(kol: string, slug: string): string {
  switch (kol) {
    case 'kabar': case 'galeri': case 'karya': case 'ppdb': return `/${kol}/${slug}`;
    case 'sdm': return `/sdm/${slug}`;
    case 'penghargaan': return `/prestasi/${slug}`;
    case 'video': return '/video';
    case 'agenda': return `/agenda#${slug}`;
    case 'info': return `/informasi#${slug}`;
    case 'dokumen': return `/dokumen#${slug}`;
    default: return '/';
  }
}

async function vctx(c: Ctx): Promise<VCtx> {
  return { media: media(c), kecil, units: await listUnits(c.get('store')) };
}
const pilihLembaga = (c: Ctx, x: VCtx) => {
  const q = c.req.query('lembaga') ?? '';
  return q === 'yayasan' || x.units.some((u) => u.slug === q) ? q : '';
};
const unitAda = (items: IxItem[]) => new Set(items.map((it) => it.u));
/** Isi dari lembaga yang dinonaktifkan tidak tampil di halaman publik. */
const aktifSaja = (x: VCtx, items: IxItem[]) => items.filter((it) => it.u === 'yayasan' || x.units.some((u) => u.slug === it.u));

async function daftarPublik(c: Ctx, kol: string, x: VCtx, lim = 120) {
  const semua = aktifSaja(x, await daftar(c.get('store'), kol, { tayang: true, limit: 600 }));
  const pilih = pilihLembaga(c, x);
  return { semua, pilih, items: (pilih ? semua.filter((it) => it.u === pilih) : semua).slice(0, lim) };
}

async function dokPublik(c: Ctx, kol: string): Promise<Dok | null> {
  const d = await ambilSlug(c.get('store'), kol, c.req.param('slug') ?? '');
  if (!d || d.status !== 'tayang') return null;
  if (d.unit !== 'yayasan' && !(await listUnits(c.get('store'))).some((u) => u.slug === d.unit)) return null;
  return d;
}

const ld = (o: string, tipe: string, d: Dok, path: string, gambar?: string) => ({
  '@context': 'https://schema.org', '@type': tipe, headline: d.judul.slice(0, 110), datePublished: d.tanggal, dateModified: new Date(d.ubah).toISOString(),
  author: { '@type': 'Person', name: String(d.d.penulis ?? d.penulisNama) }, publisher: { '@id': `${o}/#yayasan` }, mainEntityOfPage: `${o}${path}`, inLanguage: 'id',
  ...(gambar ? { image: gambar } : {}),
});

/* ── kabar ─────────────────────────────────────────────────────────────── */

konten.get('/kabar', async (c) => {
  const x = await vctx(c);
  const { semua, pilih, items } = await daftarPublik(c, 'kabar', x);
  return render(c, { path: pilih ? `/kabar?lembaga=${pilih}` : '/kabar', aktif: 'kabar', title: 'Kabar & Kegiatan Yayasan Al-Huda Yapida Sukakarya', desc: 'Kabar kegiatan, prestasi, pengumuman, dan kajian dari masjid, RA, MI, MTs, pesantren, TPQ, dan lembaga lain di bawah Yayasan Al-Huda Yapida.', body: kabarIndex(x, items, pilih, unitAda(semua)), jsonLd: [crumbs(origin(c), [['Kabar', '/kabar']])] });
});

konten.get('/kabar/:slug', async (c) => {
  const d = await dokPublik(c, 'kabar');
  if (!d) return tidakAda(c);
  const x = await vctx(c);
  const terkait = aktifSaja(x, await daftar(c.get('store'), 'kabar', { tayang: true, limit: 8 })).filter((it) => it.id !== d.id).slice(0, 3);
  const o = origin(c);
  const sampul = typeof d.d.sampul === 'string' && d.d.sampul ? x.media(d.d.sampul) : undefined;
  return render(c, { path: `/kabar/${d.slug}`, aktif: 'kabar', title: `${d.judul} | Yapida`.slice(0, 90), desc: ringkas(String(d.d.ringkasan ?? polos(String(d.d.isi ?? ''))), 200), body: kabarDetail(x, d, terkait), ogType: 'article', ogImage: sampul ? (sampul.startsWith('http') ? sampul : `${o}${sampul}`) : undefined, js: ['suara.js'], jsonLd: [crumbs(o, [['Kabar', '/kabar'], [d.judul, `/kabar/${d.slug}`]]), ld(o, 'NewsArticle', d, `/kabar/${d.slug}`, sampul)] });
});

/* ── galeri ────────────────────────────────────────────────────────────── */

konten.get('/galeri', async (c) => {
  const x = await vctx(c);
  const { semua, pilih, items } = await daftarPublik(c, 'galeri', x);
  return render(c, { path: pilih ? `/galeri?lembaga=${pilih}` : '/galeri', aktif: 'kabar', title: 'Galeri Foto Kegiatan — Yayasan Al-Huda Yapida', desc: 'Album foto kegiatan santri, siswa, guru, dan jamaah dari setiap lembaga Yayasan Al-Huda Yapida, Sukakarya, Bekasi.', body: galeriIndex(x, items, pilih, unitAda(semua)), jsonLd: [crumbs(origin(c), [['Galeri', '/galeri']])] });
});

konten.get('/galeri/:slug', async (c) => {
  const d = await dokPublik(c, 'galeri');
  if (!d) return tidakAda(c);
  const x = await vctx(c);
  const foto = Array.isArray(d.d.foto) ? (d.d.foto as { f: string }[]) : [];
  const o = origin(c);
  return render(c, { path: `/galeri/${d.slug}`, aktif: 'kabar', title: `${d.judul} — Galeri Yapida`.slice(0, 90), desc: ringkas(String(d.d.ket ?? `${foto.length} foto kegiatan ${d.judul}.`), 200), body: galeriDetail(x, d), ogImage: foto[0] ? `${o}${x.media(foto[0].f)}` : undefined, jsonLd: [crumbs(o, [['Galeri', '/galeri'], [d.judul, `/galeri/${d.slug}`]]), { '@context': 'https://schema.org', '@type': 'ImageGallery', name: d.judul, datePublished: d.tanggal, image: foto.slice(0, 20).map((p) => `${o}${x.media(p.f)}`) }] });
});

/* ── video ─────────────────────────────────────────────────────────────── */

konten.get('/video', async (c) => {
  const x = await vctx(c);
  const store = c.get('store');
  const [s, items] = await Promise.all([getSitus(store), daftar(store, 'video', { tayang: true, limit: 120 })]);
  const kanalUnit = (await Promise.all(x.units.map((u) => getUnit(store, u.slug)))).filter((u) => u?.ytKanal);
  const kanal = await Promise.all(kanalUnit.slice(0, 8).map(async (u) => ({ unit: u!.slug, video: (await videoKanal(c.env, store, u!.ytKanal)).slice(0, 6) })));
  return render(c, { path: '/video', aktif: 'kabar', title: 'Video & Siaran Langsung — Yayasan Al-Huda Yapida', desc: 'Video kegiatan dan siaran langsung pengajian, wisuda, dan hari besar Islam dari lembaga-lembaga Yayasan Al-Huda Yapida.', body: videoPage(x, { live: s.live?.aktif && s.live.url ? { url: s.live.url, judul: s.live.judul } : undefined, items: aktifSaja(x, items), kanal }), jsonLd: [crumbs(origin(c), [['Video', '/video']])] });
});

/* ── agenda, dokumen ───────────────────────────────────────────────────── */

konten.get('/informasi', async (c) => {
  const store = c.get('store');
  const now = Date.now();
  const semua = await daftar(store, 'info', { tayang: true, limit: 60 });
  const docs = (await Promise.all(semua.slice(0, 40).map((it) => ambil(store, 'info', it.id)))).filter((d): d is Dok => Boolean(d && d.status === 'tayang'));
  const masih = (d: Dok) => now < rentangInfo({ tanggal: d.tanggal, mulai: d.d.mulai, sampai: d.d.sampai })[1];
  const aktif = docs.filter(masih).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const arsip = docs.filter((d) => !masih(d)).sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 20);
  return render(c, { path: '/informasi', aktif: 'kabar', title: 'Informasi Akbar — Pengajian, Maulid, Kenaikan Kelas & Siaran Langsung | Yapida', desc: 'Pengumuman pengajian akbar, peringatan hari besar Islam, kenaikan kelas, wisuda, dan PPDB Yayasan Al-Huda Yapida beserta siaran langsung YouTube dan Facebook.', body: infoPage({ aktif, arsip, media: media(c) }), css: ['ibadah.css'], jsonLd: [crumbs(origin(c), [['Informasi', '/informasi']])] });
});

konten.get('/agenda', async (c) => {
  const x = await vctx(c);
  const { semua, pilih, items } = await daftarPublik(c, 'agenda', x, 300);
  return render(c, { path: pilih ? `/agenda?lembaga=${pilih}` : '/agenda', aktif: 'kabar', title: 'Agenda Kegiatan — Yayasan Al-Huda Yapida', desc: 'Jadwal pengajian, ujian, wisuda, PPDB, dan kegiatan lain di lingkungan Yayasan Al-Huda Yapida, Sukakarya, Bekasi.', body: agendaPage(x, items, pilih, unitAda(semua)), jsonLd: [crumbs(origin(c), [['Agenda', '/agenda']])] });
});

konten.get('/dokumen', async (c) => {
  const x = await vctx(c);
  const { semua, pilih, items } = await daftarPublik(c, 'dokumen', x, 300);
  return render(c, { path: pilih ? `/dokumen?lembaga=${pilih}` : '/dokumen', aktif: 'kabar', title: 'Dokumen Publik — Yayasan Al-Huda Yapida', desc: 'Legalitas, akreditasi, brosur, kurikulum, dan laporan lembaga-lembaga Yayasan Al-Huda Yapida yang terbuka untuk umum.', body: dokumenPage(x, items, pilih, unitAda(semua)), jsonLd: [crumbs(origin(c), [['Dokumen', '/dokumen']])] });
});

/* ── karya tulis ───────────────────────────────────────────────────────── */

konten.get('/karya', async (c) => {
  const x = await vctx(c);
  const { semua, pilih, items } = await daftarPublik(c, 'karya', x);
  return render(c, { path: pilih ? `/karya?lembaga=${pilih}` : '/karya', aktif: 'belajar', title: 'Karya Tulis Santri, Siswa & Guru — Yapida', desc: 'Cerpen, puisi, artikel, esai, dan kajian karya santri, siswa, dan guru lembaga-lembaga Yayasan Al-Huda Yapida.', body: karyaIndex(x, items, pilih, unitAda(semua)), jsonLd: [crumbs(origin(c), [['Karya Tulis', '/karya']])] });
});

konten.get('/karya/:slug', async (c) => {
  const d = await dokPublik(c, 'karya');
  if (!d) return tidakAda(c);
  const x = await vctx(c);
  const unit = d.unit === 'yayasan' ? null : await getUnit(c.get('store'), d.unit);
  const o = origin(c);
  return render(c, { path: `/karya/${d.slug}`, aktif: 'belajar', title: `${d.judul} — karya ${String(d.d.penulis ?? '')}`.slice(0, 90), desc: ringkas(polos(String(d.d.isi ?? '')), 200), body: karyaDetail(x, d, unit?.suara ?? 'dewasa'), ogType: 'article', js: ['suara.js'], jsonLd: [crumbs(o, [['Karya Tulis', '/karya'], [d.judul, `/karya/${d.slug}`]]), ld(o, 'Article', d, `/karya/${d.slug}`)] });
});

/* ── PPDB ──────────────────────────────────────────────────────────────── */

konten.get('/ppdb', async (c) => {
  const x = await vctx(c);
  const items = aktifSaja(x, await daftar(c.get('store'), 'ppdb', { tayang: true, limit: 200 }));
  return render(c, { path: '/ppdb', aktif: 'ppdb', title: 'PPDB 2027/2028 RA, MI, MTs & Pesantren Al Huda Sukakarya', desc: 'Penerimaan murid baru RA, MI, MTs, pondok pesantren, dan TPQ Al Huda di bawah Yayasan Al-Huda Yapida, Sukakarya, Bekasi: jadwal, syarat, biaya, dan formulir daring.', body: ppdbIndex(x, items), jsonLd: [crumbs(origin(c), [['PPDB', '/ppdb']])] });
});

const ppdbHal = async (c: Ctx, d: Dok, o: Parameters<typeof ppdbDetail>[2], status: 200 | 201 | 400 = 200) => {
  const x = await vctx(c);
  return render(c, { path: `/ppdb/${d.slug}`, aktif: 'ppdb', title: `${d.judul} — Pendaftaran Murid Baru`.slice(0, 90), desc: ringkas(String(d.d.ringkasan ?? ''), 200), body: ppdbDetail(x, d, o), noStore: status !== 200, jsonLd: [crumbs(origin(c), [['PPDB', '/ppdb'], [d.judul, `/ppdb/${d.slug}`]])] }, status);
};

konten.get('/ppdb/:slug', async (c) => {
  const d = await dokPublik(c, 'ppdb');
  return d ? ppdbHal(c, d, {}) : tidakAda(c);
});

konten.post('/ppdb/:slug', async (c) => {
  const d = await dokPublik(c, 'ppdb');
  if (!d) return tidakAda(c);
  const kini = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  if (d.d.formulir !== true || !(String(d.d.buka ?? '') <= kini && kini <= String(d.d.tutup ?? ''))) return ppdbHal(c, d, {}, 400);
  const f = await c.req.parseBody();
  const isian: Record<string, unknown> = { nama: String(f.nama ?? '') };
  for (const [k, v] of Object.entries(f)) if (k.startsWith('d_')) isian[k.slice(2)] = typeof v === 'string' ? v : '';
  if (String(f.situsweb ?? '')) return ppdbHal(c, d, { terkirim: '—' }, 201);
  if (!(await limit(c.env, `ppdb:${c.req.header('cf-connecting-ip') ?? 'lokal'}`, 8, 3600))) return ppdbHal(c, d, { isian, galat: { nama: 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi satu jam lagi.' } }, 400);
  const { d: data, galat } = bacaBidang(PENDAFTAR, { ...isian, tahap: 'baru', ppdb: d.judul });
  const nama = String(isian.nama).replace(/\s+/g, ' ').trim().slice(0, 160);
  if (nama.length < 3) galat.nama = 'Wajib diisi.';
  if (data.telepon && !/^[+\d][\d\s-]{7,18}$/.test(String(data.telepon))) galat.telepon = 'Nomor WhatsApp tidak sah.';
  if (Object.keys(galat).length) return ppdbHal(c, d, { isian, galat }, 400);
  const dok = await simpan(c.get('store'), PENDAFTAR, { unit: d.unit, status: 'tinjau', judul: nama, d: data, penulis: 'publik', penulisNama: 'Formulir PPDB' });
  return ppdbHal(c, d, { terkirim: dok.id.slice(-8) }, 201);
});

/* ── struktur & guru, pendiri ──────────────────────────────────────────── */

konten.get('/struktur', async (c) => {
  const x = await vctx(c);
  const items = aktifSaja(x, await daftar(c.get('store'), 'sdm', { tayang: true, limit: 1500 }));
  return render(c, { path: '/struktur', aktif: 'profil', title: 'Struktur, Pengurus & Guru — Yayasan Al-Huda Yapida', desc: 'Pendiri, pembina, pengurus, pengawas Yayasan Al-Huda Yapida serta pimpinan, guru, ustadz, dan staf setiap lembaganya.', body: strukturPage(x, items), jsonLd: [crumbs(origin(c), [['Profil', '/profil'], ['Struktur & Guru', '/struktur']])] });
});

konten.get('/sdm/:slug', async (c) => {
  const d = await dokPublik(c, 'sdm');
  if (!d) return tidakAda(c);
  const x = await vctx(c);
  const o = origin(c);
  return render(c, { path: `/sdm/${d.slug}`, aktif: 'profil', title: `${d.judul} — ${String(d.d.jabatan ?? '')}`.slice(0, 90), desc: ringkas(`${d.judul}, ${String(d.d.jabatan ?? '')} di ${d.unit === 'yayasan' ? 'Yayasan Al-Huda Yapida' : x.units.find((u) => u.slug === d.unit)?.nama ?? ''}. ${polos(String(d.d.bio ?? ''))}`, 200), body: sdmDetail(x, d), jsonLd: [crumbs(o, [['Struktur & Guru', '/struktur'], [d.judul, `/sdm/${d.slug}`]]), { '@context': 'https://schema.org', '@type': 'Person', name: d.judul, jobTitle: String(d.d.jabatan ?? ''), worksFor: { '@id': `${o}/#yayasan` } }] });
});

konten.get('/profil/pendiri', async (c) => {
  const x = await vctx(c);
  const store = c.get('store');
  const [s, items] = await Promise.all([getSitus(store), daftar(store, 'sdm', { tayang: true, unit: 'yayasan', limit: 200, saring: (it) => it.x?.golongan === 'pendiri' })]);
  return render(c, { path: '/profil/pendiri', aktif: 'profil', title: 'Para Pendiri Yayasan Al-Huda Yapida', desc: 'Profil H. Moh. Hilwani, perintis pengajian 1967 dan madrasah 1970, serta para pendiri Yayasan Al-Huda Yapida menurut akta 2015.', body: pendiriPage(x, items, s.sejarahHtml ?? ''), jsonLd: [crumbs(origin(c), [['Profil', '/profil'], ['Pendiri', '/profil/pendiri']])] });
});

/* ── pesan dari halaman kontak ─────────────────────────────────────────── */

konten.post('/kontak', async (c) => {
  // Formulir kontak lama (halaman tersimpan di peramban): pesannya kini masuk Pesan & Saran (src/data/saran.ts).
  if (!asalSama(c)) return c.text('Asal permintaan tidak sah.', 403);
  const f = await c.req.parseBody();
  const kembali = (k: string) => c.redirect(`/kontak?pesan=${k}#tulis`, 303);
  if (String(f.situsweb ?? '')) return c.redirect('/kontak', 303);
  const units = await listUnits(c.get('store'));
  const unitMinta = String(f.unit ?? 'yayasan');
  const unit = units.some((u) => u.slug === unitMinta) ? unitMinta : 'yayasan';
  const nama = bersihTeks(f.nama, 80).replace(/\s+/g, ' ');
  const isi = bersihTeks(f.isi, MAKS_ISI);
  if (nama.length < 2 || isi.length < 10) return kembali('kurang');
  if (!(await limit(c.env, `saran:${c.req.header('cf-connecting-ip') ?? 'lokal'}`, 5, 3600))) return kembali('batas');
  const kat = String(f.kategori ?? 'pertanyaan');
  const s = await kirimSaran(c.get('store'), { unit, kategori: (URUT_KATEGORI as string[]).includes(kat) ? (kat as KategoriSaran) : 'pertanyaan', nama, anonim: f.anonim === '1', kontak: bersihTeks(f.kontak, 120), sebagai: 'lainnya', isi });
  return c.redirect(`/saran/lacak/${s.id}/${s.kode}?baru=1`, 303);
});

/* ── berkas media (foto, sampul, PDF) dari R2 ──────────────────────────── */

konten.get('/f/:y/:m/:nama', async (c) => {
  const kunci = `${c.req.param('y')}/${c.req.param('m')}/${c.req.param('nama')}`;
  if (!BERKAS_RE.test(kunci)) return c.notFound();
  const o = await c.env.MEDIA.get(`f/${kunci}`);
  if (!o) return c.notFound();
  const h = new Headers();
  o.writeHttpMetadata(h);
  h.set('etag', o.httpEtag);
  h.set('cache-control', 'public, max-age=31536000, immutable');
  h.set('x-content-type-options', 'nosniff');
  if (kunci.endsWith('.pdf')) h.set('content-disposition', 'inline');
  return new Response(o.body, { headers: h });
});
