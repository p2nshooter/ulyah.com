/**
 * yapida.sch.id — situs Yayasan Al-Huda Yapida (docs/YAPIDA-BLUEPRINT.md). Satu Worker: halaman publik yang seluruh
 * isinya dibaca dari R2, berkas teknis (ads.txt, robots, sitemap, manifest, service worker). Data hanya di R2 —
 * tidak pernah D1.
 */
import { Hono } from 'hono';
import type { Env } from './env.ts';
import { Store } from './lib/store.ts';
import type { Ctx, HonoEnv } from './lib/session.ts';
import { kecil, media, origin, render, tidakAda } from './lib/render.ts';
import { konten, publikDok } from './routes/konten.ts';
import { portal } from './routes/portal.ts';
import { quran } from './routes/quran.ts';
import { radio } from './routes/radio.ts';
import { pustaka } from './routes/pustaka.ts';
import { dokumen, tampilDiPrestasi } from './routes/dokumen.ts';
import { kesiswaan } from './routes/kesiswaan.ts';
import { siswa } from './routes/siswa.ts';
import { guru } from './routes/guru.ts';
import { pesan } from './routes/pesan.ts';
import { bagianPrestasiUnit, etalaseSertifikat } from './pages/prestasi.ts';
import { CONTOH_SERTIFIKAT } from './routes/dokumen.ts';
import { katalog, urutkan } from './data/pustaka.ts';
import { peringkat, sepuluh } from './data/statistik.ts';
import { RAK } from './data/buku.ts';
import { KURIKULUM } from './data/kurikulum.ts';
import { jenjangDariSlug, petaPelajaranSisip, pitaPustaka, rakSisipUnit, rakUntukUnit, selPelajaran } from './pages/pustaka.ts';
import { daftar, type IxItem } from './data/koleksi.ts';
import { videoKanal } from './data/yt.ts';
import { bagianUnit, beritaBeranda, organYayasan } from './pages/sisipan.ts';
import { formSaran } from './pages/saran.ts';
import { saran } from './routes/saran.ts';
import { soal } from './routes/soal.ts';
import { indeksBawaan } from './data/soal.ts';
import { ADS_TXT } from './lib/adsense.ts';
import { ensureSeed, getHalaman, getSitus, getUnit, listHalaman, listUnits } from './data/site.ts';
import { ASSET_V, crumbs } from './pages/layout.ts';
import { berandaPage, donasiPage, halamanLembaga, halamanPage, kontakPage, lembagaIndexPage, profilPage, unitPage } from './pages/public.ts';
import type { Unit } from './data/model.ts';
import { ibadahPage, jadwalPage, kalenderPage, kiblatPage, pitaAplikasi, radioPage, haramainPage } from './pages/ibadah.ts';
import { raw } from './lib/html.ts';

const app = new Hono<HonoEnv>();

app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const canonical = c.env.CANONICAL_HOST?.trim();
  if (canonical && url.host !== canonical && url.pathname !== '/api/health' && (url.host.endsWith('.workers.dev') || url.host === `www.${canonical}`)) {
    return c.redirect(`https://${canonical}${url.pathname}${url.search}`, 301);
  }
  c.set('store', new Store(c.env.DATA));
  c.set('user', null);
  await next();
  const hd = c.res.headers;
  hd.set('X-Content-Type-Options', 'nosniff');
  hd.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Lokasi hanya untuk halaman kita sendiri (jadwal sholat dan kiblat memintanya atas tombol pembaca).
  hd.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  hd.set('X-Frame-Options', 'SAMEORIGIN');
  if (!canonical && (hd.get('content-type') ?? '').includes('text/html')) hd.set('X-Robots-Tag', 'noindex');
});


/* ── berkas teknis ──────────────────────────────────────────────────────── */

app.get('/api/health', (c) => c.json({ ok: true, service: 'yapida.sch.id', v: ASSET_V }));
app.get('/ads.txt', (c) => c.text(ADS_TXT, 200, { 'cache-control': 'public, max-age=3600' }));

// Pemilik: „jgn ada satupun yg memblokir crawler google“ — setiap crawler Google mendapat grup Allow sendiri, sehingga
// grup "Disallow: /" yang mungkin disisipkan Cloudflare untuk crawler AI tidak pernah menutup crawler Google.
export const GOOGLE_CRAWLERS = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video', 'Mediapartners-Google', 'AdsBot-Google', 'AdsBot-Google-Mobile', 'Google-InspectionTool', 'Storebot-Google', 'GoogleOther', 'GoogleOther-Image', 'GoogleOther-Video', 'Google-Extended', 'Google-CloudVertexBot', 'Google-Agent', 'Google-GeminiNotebook', 'Google-NotebookLM', 'APIs-Google', 'FeedFetcher-Google', 'Google-Read-Aloud', 'Google-Site-Verification'];
app.get('/robots.txt', (c) => c.text([
  ...GOOGLE_CRAWLERS.map((g) => `User-agent: ${g}\nAllow: /\n`),
  'User-agent: Bingbot\nAllow: /\n',
  'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /portal\nDisallow: /masuk\nDisallow: /siswa\n',
  `Sitemap: ${origin(c)}/sitemap.xml\n`,
].join('\n'), 200, { 'cache-control': 'public, max-age=3600' }));

app.get('/sitemap.xml', async (c) => {
  const store = c.get('store');
  const [situs, units, halaman] = await Promise.all([getSitus(store), listUnits(store), listHalaman(store)]);
  const o = origin(c);
  const store2 = c.get('store');
  const isi = await Promise.all(['kabar', 'galeri', 'karya', 'ppdb', 'sdm', 'penghargaan'].map(async (k) => (await daftar(store2, k, { tayang: true, limit: 900, ...(k === 'penghargaan' ? { saring: tampilDiPrestasi } : {}) })).filter((it) => it.u === 'yayasan' || units.some((u) => u.slug === it.u)).map((it) => publikDok(k, it.sl))));
  const urls = ['/', '/profil', '/profil/pendiri', '/struktur', '/lembaga', '/kabar', '/galeri', '/video', '/informasi', '/agenda', '/dokumen', '/karya', '/ppdb', '/prestasi', '/ibadah', '/quran', ...Array.from({ length: 114 }, (_, i) => `/quran/${i + 1}`), '/jadwal-sholat', '/kiblat', '/kalender-hijriah', '/radio-quran', '/live-haramain', '/pustaka', '/pustaka/dunia', ...RAK.map((r) => `/pustaka/rak/${r.id}`), ...(Object.keys(KURIKULUM) as (keyof typeof KURIKULUM)[]).flatMap((j) => [`/pustaka/pelajaran/${j}`, ...KURIKULUM[j].kelas.flatMap((k) => KURIKULUM[j].mapel.filter((m) => m.kelas.includes(k)).map((m) => `/pustaka/pelajaran/${j}/${k}/${m.slug}`))]), ...units.map((u) => `/pustaka/lembaga/${u.slug}`), ...(await katalog(c.env, store)).semua.filter((b) => b.asal === 'bawaan' || b.asal === 'lembaga').map((b) => `/pustaka/b/${b.id}`), '/kontak', '/saran', '/bank-soal', ...['ra', 'mi', 'mts'].map((j) => `/bank-soal?jenjang=${j}`), ...(await indeksBawaan(c.env)).filter((p) => p.jenis === 'latihan').map((p) => `/bank-soal/${p.id}`), ...(situs.donasi.tampil ? ['/donasi'] : []), ...units.map((u) => `/lembaga/${u.slug}`), ...halaman.map((h) => `/h/${h.slug}`), ...new Set(isi.flat())];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${o}${u}</loc></url>`).join('\n')}\n</urlset>`;
  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' });
});

app.get('/manifest.webmanifest', async (c) => {
  const s = await getSitus(c.get('store'));
  return c.json({
    id: '/', name: s.nama, short_name: s.singkatan.charAt(0) + s.singkatan.slice(1).toLowerCase(), lang: 'id', dir: 'ltr', start_url: '/?pwa=1', scope: '/', display: 'standalone', orientation: 'portrait',
    background_color: '#03241a', theme_color: '#053727', description: s.deskripsi, categories: ['education', 'books'],
    icons: [{ src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
    shortcuts: [{ name: 'Al-Qur’an', url: '/quran' }, { name: 'Jadwal Sholat', url: '/jadwal-sholat' }, { name: 'Radio Qur’an', url: '/radio-quran' }, { name: 'Arah Kiblat', url: '/kiblat' }, { name: 'Lembaga', url: '/lembaga' }],
  }, 200, { 'content-type': 'application/manifest+json', 'cache-control': 'public, max-age=3600' });
});

// Service worker: aset statis dari cache (berganti bersama ASSET_V); halaman selalu dari jaringan dulu, cache sebagai
// cadangan saat luring. Portal dan API tidak pernah disimpan.
app.get('/sw.js', (c) => c.body(`// yapida.sch.id service worker ${ASSET_V}
const V='yp-${ASSET_V}';const SHELL=['/assets/app.css?v=${ASSET_V}','/assets/app.js?v=${ASSET_V}','/assets/tema.js?v=${ASSET_V}','/assets/ibadah.css?v=${ASSET_V}','/assets/konten.css?v=${ASSET_V}','/assets/suara.js?v=${ASSET_V}','/assets/ibadah.js?v=${ASSET_V}','/assets/vendor/adhan.min.js?v=${ASSET_V}','/assets/data/surat.json','/assets/logo-192.webp','/assets/logo-512.webp','/assets/icon-192.png','/assets/fonts/jakarta.woff2','/assets/fonts/fraunces.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/portal')||u.pathname.startsWith('/masuk')||u.pathname.startsWith('/siswa')||u.pathname==='/keluar')return;
if(u.pathname.startsWith('/assets/')||u.pathname.startsWith('/f/')){e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}));return}
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))))}});
`, 200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache' }));

/* ── halaman ────────────────────────────────────────────────────────────── */

app.get('/', async (c) => {
  const store = c.get('store');
  const [s, units, kabar, galeri, ppdb, kat, pk, prestasi] = await Promise.all([getSitus(store), listUnits(store), daftar(store, 'kabar', { tayang: true, limit: 6 }), daftar(store, 'galeri', { tayang: true, limit: 4 }), daftar(store, 'ppdb', { tayang: true, limit: 20 }), katalog(c.env, store), peringkat(store), daftar(store, 'penghargaan', { tayang: true, limit: 12, saring: tampilDiPrestasi })]);
  const topBaca = sepuluh(pk.baca, (id) => kat.peta.has(id)).map(({ id, n }) => ({ b: kat.peta.get(id)!, n }));
  const pilihanPustaka = urutkan(kat.semua.filter((b) => b.asal === 'bawaan' || b.asal === 'lembaga' || b.sampulUrl), kat.atur).slice(0, 14);
  const x = { media: media(c), kecil, units };
  const aktif = (it: IxItem) => it.u === 'yayasan' || units.some((u) => u.slug === it.u);
  return render(c, {
    path: '/', aktif: 'beranda',
    title: `${s.nama} — Pendidikan Islam Terpadu di Sukakarya, Bekasi`,
    desc: s.deskripsi,
    body: berandaPage(s, units, raw(beritaBeranda(x, kabar.filter(aktif).slice(0, 3), galeri.filter(aktif).slice(0, 4), ppdb.filter(aktif)).s + etalaseSertifikat(x, prestasi.filter(aktif), CONTOH_SERTIFIKAT).s + pitaPustaka(pilihanPustaka, topBaca, x).s + pitaAplikasi(s).s)), css: [...IBADAH_CSS, 'pustaka.css'], js: [...IBADAH_JS, 'pustaka.js'],
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: s.nama, alternateName: s.singkatan, url: `${origin(c)}/`, inLanguage: 'id' }],
  });
});

app.get('/profil', async (c) => {
  const store = c.get('store');
  const [s, units, sdm] = await Promise.all([getSitus(store), listUnits(store), daftar(store, 'sdm', { tayang: true, unit: 'yayasan', limit: 200 })]);
  return render(c, {
    path: '/profil', aktif: 'profil',
    title: `Profil, Sejarah & Legalitas — ${s.nama}`,
    desc: `Sejarah ${s.nama} sejak pengajian tahun 1967, akta pendirian dan pengesahan badan hukum, serta susunan pembina, pengurus, dan pengawas.`,
    body: profilPage(s, organYayasan({ media: media(c), kecil, units }, s, sdm)), jsonLd: [crumbs(origin(c), [['Profil', '/profil']])],
  });
});

app.get('/lembaga', async (c) => {
  const store = c.get('store');
  const [s, units] = await Promise.all([getSitus(store), listUnits(store)]);
  return render(c, {
    path: '/lembaga', aktif: 'lembaga',
    title: `${units.length} Lembaga: Masjid, RA, MI, MTs, Pesantren, BMT, LKSA — ${s.singkatan}`,
    desc: `Daftar ${units.length} lembaga di bawah ${s.nama}: sarana ibadah, pendidikan formal dan nonformal, unit ekonomi, dan layanan sosial di Sukakarya, Bekasi.`,
    body: lembagaIndexPage(s, units), jsonLd: [crumbs(origin(c), [['Lembaga', '/lembaga']])],
  });
});

/** Jenis schema.org per lembaga, agar mesin pencari memahami apa lembaga itu. */
function unitLd(o: string, u: Unit, yayasan: string): unknown {
  const type = u.kelompok === 'ibadah' ? 'Mosque' : ({ 'ra-al-huda': 'Preschool', 'mi-al-huda': 'ElementarySchool', 'mts-al-huda': 'MiddleSchool' } as Record<string, string>)[u.slug] ?? (u.kelompok === 'formal' || u.kelompok === 'nonformal' ? 'EducationalOrganization' : 'Organization');
  return {
    '@context': 'https://schema.org', '@type': type, name: u.nama, alternateName: u.singkat, url: `${o}/lembaga/${u.slug}`, description: u.ringkas,
    ...(u.berdiri ? { foundingDate: u.berdiri } : {}),
    ...(u.alamat ? { address: { '@type': 'PostalAddress', streetAddress: u.alamat, addressCountry: 'ID' } } : {}),
    parentOrganization: { '@id': `${o}/#yayasan`, name: yayasan },
  };
}

app.get('/lembaga/:slug', async (c) => {
  const store = c.get('store');
  const u = await getUnit(store, c.req.param('slug'));
  if (!u || !u.aktif) return tidakAda(c);
  const [s, units, sdm, kabar, galeri, video, kanal, ppdb, dokumen, karya, agenda] = await Promise.all([
    getSitus(store), listUnits(store),
    daftar(store, 'sdm', { tayang: true, unit: u.slug, limit: 300 }), daftar(store, 'kabar', { tayang: true, unit: u.slug, limit: 3 }),
    daftar(store, 'galeri', { tayang: true, unit: u.slug, limit: 3 }), daftar(store, 'video', { tayang: true, unit: u.slug, limit: 6 }),
    videoKanal(c.env, store, u.ytKanal), daftar(store, 'ppdb', { tayang: true, unit: u.slug, limit: 10 }),
    daftar(store, 'dokumen', { tayang: true, unit: u.slug, limit: 12 }), daftar(store, 'karya', { tayang: true, unit: u.slug, limit: 3 }),
    daftar(store, 'agenda', { tayang: true, unit: u.slug, limit: 40 }),
  ]);
  const [prestasiU, halamanU] = await Promise.all([daftar(store, 'penghargaan', { tayang: true, unit: u.slug, limit: 8, saring: tampilDiPrestasi }), listHalaman(store)]);
  const o = origin(c);
  const kat = await katalog(c.env, store);
  const rakU = rakUntukUnit(u.slug).map((r) => r.id);
  const bukuU = urutkan(kat.semua.filter((b) => b.unit === u.slug || b.rak.some((r) => rakU.includes(r))), kat.atur, u.slug).slice(0, 16);
  const uItem = units.find((x) => x.slug === u.slug);
  // RA, MI, MTs: pelajaran formal per kelas & mata pelajaran tampil di halaman lembaganya (di atas kabar & galeri).
  const jU = jenjangDariSlug(u.slug);
  const pelajaranU = jU ? petaPelajaranSisip(jU, selPelajaran(jU, kat.semua), { judul: `Pelajaran ${u.singkat}` }).s : '';
  const isi = raw(pelajaranU + bagianUnit({ media: media(c), kecil, units }, u.slug, u.singkat, { sdm, kabar, galeri, video, kanal: kanal.slice(0, 6), ppdb, dokumen, karya, agenda }).s + (uItem ? halamanLembaga(u.singkat, halamanU.filter((h) => h.unit === u.slug)).s + bagianPrestasiUnit({ media: media(c), kecil, units }, uItem, prestasiU).s + rakSisipUnit(uItem, bukuU, { media: media(c), kecil, units }).s : ''));
  return render(c, {
    path: `/lembaga/${u.slug}`, aktif: 'lembaga',
    title: `${u.nama} — ${u.jenis} di Sukakarya, Bekasi | ${s.singkatan}`,
    desc: u.ringkas,
    body: unitPage(u, units.filter((x) => x.kelompok === u.kelompok && x.slug !== u.slug), isi), css: ['pustaka.css'], js: ['suara.js', 'pustaka.js'],
    jsonLd: [crumbs(o, [['Lembaga', '/lembaga'], [u.singkat, `/lembaga/${u.slug}`]]), unitLd(o, u, s.nama)],
  });
});

/* ── aplikasi ibadah ────────────────────────────────────────────────────── */

const IBADAH_CSS = ['ibadah.css'];
const IBADAH_JS = ['vendor/adhan.min.js', 'ibadah.js'];
const remahIbadah = (o: string, nama: string, path: string) => crumbs(o, [['Aplikasi Ibadah', '/ibadah'], [nama, path]]);
const appLd = (o: string, nama: string, path: string, desc: string) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name: nama, url: `${o}${path}`, description: desc, applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', inLanguage: 'id', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' } });

app.get('/ibadah', async (c) => {
  const s = await getSitus(c.get('store'));
  return render(c, { path: '/ibadah', aktif: 'ibadah', title: 'Aplikasi Ibadah: Jadwal Sholat, Kiblat, Kalender Hijriah, Radio Qur’an', desc: 'Jadwal sholat Sukakarya Bekasi, kompas arah kiblat, kalender hijriah, hitung mundur Ramadhan, radio Qur’an 114 surah, dan tasbih digital — gratis.', body: ibadahPage(s), css: IBADAH_CSS, js: IBADAH_JS, jsonLd: [crumbs(origin(c), [['Aplikasi Ibadah', '/ibadah']])] });
});

app.get('/jadwal-sholat', async (c) => {
  const s = await getSitus(c.get('store'));
  const desc = 'Jadwal sholat hari ini untuk Sukakarya, Kabupaten Bekasi: Imsak, Subuh, Dzuhur, Ashar, Maghrib, Isya, hitung mundur adzan, dan jadwal 30 hari.';
  return render(c, { path: '/jadwal-sholat', aktif: 'ibadah', title: 'Jadwal Sholat Sukakarya Bekasi Hari Ini — Yapida', desc, body: jadwalPage(s), css: IBADAH_CSS, js: IBADAH_JS, jsonLd: [remahIbadah(origin(c), 'Jadwal Sholat', '/jadwal-sholat'), appLd(origin(c), 'Jadwal Sholat Yapida', '/jadwal-sholat', desc)] });
});

app.get('/kiblat', async (c) => {
  const s = await getSitus(c.get('store'));
  const desc = 'Kompas arah kiblat daring: sudut kiblat dari Sukakarya Bekasi atau dari lokasi Anda, jarak ke Ka’bah, dan cara memakainya di HP.';
  return render(c, { path: '/kiblat', aktif: 'ibadah', title: 'Arah Kiblat: Kompas Kiblat Online dari Lokasi Anda — Yapida', desc, body: kiblatPage(s), css: IBADAH_CSS, js: IBADAH_JS, jsonLd: [remahIbadah(origin(c), 'Arah Kiblat', '/kiblat'), appLd(origin(c), 'Kompas Kiblat Yapida', '/kiblat', desc)] });
});

app.get('/kalender-hijriah', async (c) => {
  const s = await getSitus(c.get('store'));
  const desc = 'Kalender hijriah hari ini dengan padanan Masehi, hari besar Islam, puasa sunnah Senin-Kamis dan Ayyamul Bidh, serta hitung mundur Ramadhan.';
  return render(c, { path: '/kalender-hijriah', aktif: 'ibadah', title: 'Kalender Hijriah, Hari Besar Islam & Hitung Mundur Ramadhan', desc, body: kalenderPage(s), css: IBADAH_CSS, js: IBADAH_JS, jsonLd: [remahIbadah(origin(c), 'Kalender Hijriah', '/kalender-hijriah'), appLd(origin(c), 'Kalender Hijriah Yapida', '/kalender-hijriah', desc)] });
});

app.get('/live-haramain', async (c) => {
  const s = await getSitus(c.get('store'));
  const desc = 'Live streaming 24 jam Masjidil Haram Makkah dan Masjid Nabawi Madinah — siaran langsung resmi Saudi Quran TV dan Saudi Sunnah TV tanpa henti, gratis di Yayasan Al-Huda Yapida.';
  return render(c, { path: '/live-haramain', aktif: 'ibadah', title: 'Live 24 Jam Masjidil Haram & Masjid Nabawi — Siaran Langsung Makkah Madinah | Yapida', desc, body: haramainPage(s), css: IBADAH_CSS, js: IBADAH_JS, jsonLd: [remahIbadah(origin(c), 'Live Makkah & Madinah', '/live-haramain')] });
});

app.get('/radio-quran', (c) => {
  const desc = 'Radio Qur’an LIVE 24 jam tanpa henti: surah 1 sampai 114 berurutan dibacakan qari pilihan acak dari seluruh dunia, setiap putaran satu khatam — dengarkan gratis dari Yayasan Al-Huda Yapida.';
  return render(c, { path: '/radio-quran', aktif: 'ibadah', title: 'Radio Qur’an LIVE 24 Jam — Murottal Qari Seluruh Dunia | Yapida', desc, body: radioPage(), css: IBADAH_CSS, js: IBADAH_JS, jsonLd: [remahIbadah(origin(c), 'Radio Qur’an', '/radio-quran'), appLd(origin(c), 'Radio Qur’an LIVE Yapida', '/radio-quran', desc)] });
});

app.get('/donasi', async (c) => {
  const s = await getSitus(c.get('store'));
  if (!s.donasi.tampil) return tidakAda(c);
  return render(c, { path: '/donasi', title: `Donasi — Rekening Resmi ${s.nama}`, desc: `Salurkan infak, sedekah, dan wakaf melalui rekening resmi atas nama ${s.nama}.`, body: donasiPage(s), jsonLd: [crumbs(origin(c), [['Donasi', '/donasi']])] });
});

app.get('/kontak', async (c) => {
  const s = await getSitus(c.get('store'));
  const units = await listUnits(c.get('store'));
  return render(c, { path: '/kontak', aktif: 'kontak', noStore: Boolean(c.req.query('pesan')), title: `Kontak & Alamat — ${s.nama}`, desc: `Alamat ${s.nama} di Desa Sukakarya, Kabupaten Bekasi, dan cara menghubungi pengurus serta tiap lembaga.`, body: kontakPage(s, formSaran(units, { jenis: 'pertanyaan', pesan: c.req.query('pesan') })), jsonLd: [crumbs(origin(c), [['Kontak', '/kontak']])] });
});

app.get('/h/:slug', async (c) => {
  const store = c.get('store');
  const h = await getHalaman(store, c.req.param('slug'));
  if (!h) return tidakAda(c);
  const [s, units, semua] = await Promise.all([getSitus(store), listUnits(store), listHalaman(store)]);
  const unit = h.unit && h.unit !== 'yayasan' ? units.find((x) => x.slug === h.unit) : undefined;
  if (h.unit && h.unit !== 'yayasan' && !unit) return tidakAda(c);
  const remah: [string, string][] = unit ? [['Lembaga', '/lembaga'], [unit.singkat, `/lembaga/${unit.slug}`]] : [];
  const lain = semua.filter((x) => x.unit === (h.unit || 'yayasan') && x.slug !== h.slug).slice(0, 12);
  return render(c, { path: `/h/${h.slug}`, aktif: unit ? 'lembaga' : undefined, title: `${h.judul} — ${unit ? unit.nama : s.nama}`.slice(0, 90), desc: h.ringkas, body: halamanPage(h, remah, lain), jsonLd: [crumbs(origin(c), [...remah, [h.judul, `/h/${h.slug}`]])] });
});

app.route('/', quran);
app.route('/', radio);
app.route('/', pustaka);
app.route('/', konten);
app.route('/', portal);
app.route('/', dokumen);
app.route('/', kesiswaan);
app.route('/', siswa);
app.route('/', guru);
app.route('/', pesan);
app.route('/', saran);
app.route('/', soal);

app.notFound((c) => (c.req.path.startsWith('/api/') ? c.json({ error: 'not found' }, 404) : tidakAda(c as Ctx)));

app.onError((err, c) => {
  console.error('yapida error', c.req.method, c.req.path, err instanceof Error ? err.stack : err);
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Terjadi kesalahan di server. Coba lagi.' }, 500);
  return c.html('<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sedang ada gangguan</title><body style="font-family:system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:#03241a;color:#fdf8e6;text-align:center;padding:2rem"><div><h1 style="font-size:2rem">Sedang ada gangguan</h1><p>Halaman belum bisa ditampilkan. Coba muat ulang sebentar lagi.</p><p><a href="/" style="color:#ecd990">Ke beranda</a></p></div></body></html>', 500);
});

export { ensureSeed };
export default { fetch: app.fetch } satisfies ExportedHandler<Env>;
