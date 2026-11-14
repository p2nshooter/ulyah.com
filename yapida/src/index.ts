/**
 * yapida.sch.id — situs Yayasan Al-Huda Yapida (docs/YAPIDA-BLUEPRINT.md). Satu Worker: halaman publik yang seluruh
 * isinya dibaca dari R2, berkas teknis (ads.txt, robots, sitemap, manifest, service worker). Data hanya di R2 —
 * tidak pernah D1.
 */
import { Hono, type Context } from 'hono';
import type { Env } from './env.ts';
import { Store } from './lib/store.ts';
import { ADS_TXT } from './lib/adsense.ts';
import { ensureSeed, getHalaman, getSitus, getUnit, listHalaman, listUnits } from './data/site.ts';
import { ASSET_V, crumbs, page, type PageOpts } from './pages/layout.ts';
import { berandaPage, donasiPage, halamanPage, kontakPage, lembagaIndexPage, profilPage, tidakAdaPage, unitPage } from './pages/public.ts';
import type { Unit } from './data/model.ts';

type HonoEnv = { Bindings: Env; Variables: { store: Store } };
type Ctx = Context<HonoEnv>;
const app = new Hono<HonoEnv>();

const origin = (c: Ctx) => (c.env.CANONICAL_HOST ? `https://${c.env.CANONICAL_HOST}` : new URL(c.req.url).origin);

app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const canonical = c.env.CANONICAL_HOST?.trim();
  if (canonical && url.host !== canonical && url.pathname !== '/api/health' && (url.host.endsWith('.workers.dev') || url.host === `www.${canonical}`)) {
    return c.redirect(`https://${canonical}${url.pathname}${url.search}`, 301);
  }
  c.set('store', new Store(c.env.DATA));
  await next();
  const hd = c.res.headers;
  hd.set('X-Content-Type-Options', 'nosniff');
  hd.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  hd.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  hd.set('X-Frame-Options', 'SAMEORIGIN');
  if (!canonical && (hd.get('content-type') ?? '').includes('text/html')) hd.set('X-Robots-Tag', 'noindex');
});

/** Merender halaman publik: pengaturan situs dan daftar lembaga selalu ikut (kepala, menu, kaki). */
async function render(c: Ctx, o: Omit<PageOpts, 'origin' | 'situs' | 'units'>, status: 200 | 404 = 200): Promise<Response> {
  const store = c.get('store');
  const [situs, units] = await Promise.all([getSitus(store), listUnits(store)]);
  const body = page({ ...o, origin: origin(c), situs, units, noindex: o.noindex || !c.env.CANONICAL_HOST });
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': status === 200 ? 'public, max-age=60' : 'no-store' } });
}

/* ── berkas teknis ──────────────────────────────────────────────────────── */

app.get('/api/health', (c) => c.json({ ok: true, service: 'yapida.sch.id', v: ASSET_V }));
app.get('/ads.txt', (c) => c.text(ADS_TXT, 200, { 'cache-control': 'public, max-age=3600' }));

// Pemilik: „jgn ada satupun yg memblokir crawler google“ — setiap crawler Google mendapat grup Allow sendiri, sehingga
// grup "Disallow: /" yang mungkin disisipkan Cloudflare untuk crawler AI tidak pernah menutup crawler Google.
export const GOOGLE_CRAWLERS = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video', 'Mediapartners-Google', 'AdsBot-Google', 'AdsBot-Google-Mobile', 'Google-InspectionTool', 'Storebot-Google', 'GoogleOther', 'GoogleOther-Image', 'GoogleOther-Video', 'Google-Extended', 'Google-CloudVertexBot', 'Google-Agent', 'Google-GeminiNotebook', 'Google-NotebookLM', 'APIs-Google', 'FeedFetcher-Google', 'Google-Read-Aloud', 'Google-Site-Verification'];
app.get('/robots.txt', (c) => c.text([
  ...GOOGLE_CRAWLERS.map((g) => `User-agent: ${g}\nAllow: /\n`),
  'User-agent: Bingbot\nAllow: /\n',
  'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /portal\n',
  `Sitemap: ${origin(c)}/sitemap.xml\n`,
].join('\n'), 200, { 'cache-control': 'public, max-age=3600' }));

app.get('/sitemap.xml', async (c) => {
  const store = c.get('store');
  const [situs, units, halaman] = await Promise.all([getSitus(store), listUnits(store), listHalaman(store)]);
  const o = origin(c);
  const urls = ['/', '/profil', '/lembaga', '/kontak', ...(situs.donasi.tampil ? ['/donasi'] : []), ...units.map((u) => `/lembaga/${u.slug}`), ...halaman.map((h) => `/h/${h.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${o}${u}</loc></url>`).join('\n')}\n</urlset>`;
  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' });
});

app.get('/manifest.webmanifest', async (c) => {
  const s = await getSitus(c.get('store'));
  return c.json({
    id: '/', name: s.nama, short_name: s.singkatan.charAt(0) + s.singkatan.slice(1).toLowerCase(), lang: 'id', dir: 'ltr', start_url: '/?pwa=1', scope: '/', display: 'standalone', orientation: 'portrait',
    background_color: '#03241a', theme_color: '#053727', description: s.deskripsi, categories: ['education', 'books'],
    icons: [{ src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
    shortcuts: [{ name: 'Lembaga', url: '/lembaga' }, { name: 'Profil yayasan', url: '/profil' }],
  }, 200, { 'content-type': 'application/manifest+json', 'cache-control': 'public, max-age=3600' });
});

// Service worker: aset statis dari cache (berganti bersama ASSET_V); halaman selalu dari jaringan dulu, cache sebagai
// cadangan saat luring. Portal dan API tidak pernah disimpan.
app.get('/sw.js', (c) => c.body(`// yapida.sch.id service worker ${ASSET_V}
const V='yp-${ASSET_V}';const SHELL=['/assets/app.css?v=${ASSET_V}','/assets/app.js?v=${ASSET_V}','/assets/tema.js?v=${ASSET_V}','/assets/logo-192.webp','/assets/logo-512.webp','/assets/icon-192.png','/assets/fonts/jakarta.woff2','/assets/fonts/fraunces.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/portal')||u.pathname==='/masuk'||u.pathname==='/keluar')return;
if(u.pathname.startsWith('/assets/')||u.pathname.startsWith('/f/')){e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}));return}
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))))}});
`, 200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache' }));

/* ── halaman ────────────────────────────────────────────────────────────── */

app.get('/', async (c) => {
  const store = c.get('store');
  const [s, units] = await Promise.all([getSitus(store), listUnits(store)]);
  return render(c, {
    path: '/', aktif: 'beranda',
    title: `${s.nama} — Pendidikan Islam Terpadu di Sukakarya, Bekasi`,
    desc: s.deskripsi,
    body: berandaPage(s, units),
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: s.nama, alternateName: s.singkatan, url: `${origin(c)}/`, inLanguage: 'id' }],
  });
});

app.get('/profil', async (c) => {
  const s = await getSitus(c.get('store'));
  return render(c, {
    path: '/profil', aktif: 'profil',
    title: `Profil, Sejarah & Legalitas — ${s.nama}`,
    desc: `Sejarah ${s.nama} sejak pengajian tahun 1967, akta pendirian dan pengesahan badan hukum, serta susunan pembina, pengurus, dan pengawas.`,
    body: profilPage(s), jsonLd: [crumbs(origin(c), [['Profil', '/profil']])],
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
  const [s, units] = await Promise.all([getSitus(store), listUnits(store)]);
  const o = origin(c);
  return render(c, {
    path: `/lembaga/${u.slug}`, aktif: 'lembaga',
    title: `${u.nama} — ${u.jenis} di Sukakarya, Bekasi | ${s.singkatan}`,
    desc: u.ringkas,
    body: unitPage(u, units.filter((x) => x.kelompok === u.kelompok && x.slug !== u.slug)),
    jsonLd: [crumbs(o, [['Lembaga', '/lembaga'], [u.singkat, `/lembaga/${u.slug}`]]), unitLd(o, u, s.nama)],
  });
});

app.get('/donasi', async (c) => {
  const s = await getSitus(c.get('store'));
  if (!s.donasi.tampil) return tidakAda(c);
  return render(c, { path: '/donasi', title: `Donasi — Rekening Resmi ${s.nama}`, desc: `Salurkan infak, sedekah, dan wakaf melalui rekening resmi atas nama ${s.nama}.`, body: donasiPage(s), jsonLd: [crumbs(origin(c), [['Donasi', '/donasi']])] });
});

app.get('/kontak', async (c) => {
  const s = await getSitus(c.get('store'));
  return render(c, { path: '/kontak', aktif: 'kontak', title: `Kontak & Alamat — ${s.nama}`, desc: `Alamat ${s.nama} di Desa Sukakarya, Kabupaten Bekasi, dan cara menghubungi pengurus serta tiap lembaga.`, body: kontakPage(s), jsonLd: [crumbs(origin(c), [['Kontak', '/kontak']])] });
});

app.get('/h/:slug', async (c) => {
  const h = await getHalaman(c.get('store'), c.req.param('slug'));
  if (!h) return tidakAda(c);
  const s = await getSitus(c.get('store'));
  return render(c, { path: `/h/${h.slug}`, title: `${h.judul} — ${s.nama}`, desc: h.ringkas, body: halamanPage(h), jsonLd: [crumbs(origin(c), [[h.judul, `/h/${h.slug}`]])] });
});

const tidakAda = (c: Ctx) => render(c, { path: new URL(c.req.url).pathname, title: 'Halaman tidak ditemukan — Yayasan Al-Huda Yapida', desc: 'Halaman yang Anda cari tidak ada.', body: tidakAdaPage(), noindex: true, noAds: true }, 404);

app.notFound((c) => (c.req.path.startsWith('/api/') ? c.json({ error: 'not found' }, 404) : tidakAda(c as Ctx)));

app.onError((err, c) => {
  console.error('yapida error', c.req.method, c.req.path, err instanceof Error ? err.stack : err);
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Terjadi kesalahan di server. Coba lagi.' }, 500);
  return c.html('<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sedang ada gangguan</title><body style="font-family:system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:#03241a;color:#fdf8e6;text-align:center;padding:2rem"><div><h1 style="font-size:2rem">Sedang ada gangguan</h1><p>Halaman belum bisa ditampilkan. Coba muat ulang sebentar lagi.</p><p><a href="/" style="color:#ecd990">Ke beranda</a></p></div></body></html>', 500);
});

export { ensureSeed };
export default { fetch: app.fetch } satisfies ExportedHandler<Env>;
