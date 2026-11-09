/**
 * jenius.es — E-Book with Voice (docs/JENIUS-BLUEPRINT.md). Satu Worker: situs publik ID/EN, pembaca AUTO, API bab,
 * media buku, SEO (sitemap, robots, ads.txt), PWA, dan cron impor buku terbuka. Data hanya di R2 (tidak pernah D1).
 */
import { Hono, type Context } from 'hono';
import type { Env } from './env.ts';
import { Store } from './lib/store.ts';
import { tr, pick, P, PAGES, bookPath, readPath, lanePath, articlePath, toolPath, other, type Lang, type PageKey } from './lib/i18n.ts';
import { ADS_TXT } from './lib/adsense.ts';
import { page, crumbs, pageHead, ASSET_V } from './pages/layout.ts';
import { homePage, lanesPage, lanePage, bookPage, bookJsonLd, coverSvg, licensesPage, laneBySlugOrNull, isShelf, bookCard, type Card } from './pages/catalog.ts';
import { readerPage } from './pages/reader.ts';
import { articlesIndex, articlePage, articleJsonLd, infoPage, teachersPage } from './pages/content.ts';
import { toolsIndex, toolPage, toolBySlug } from './pages/tools.ts';
import { infoDoc } from './pages/info.ts';
import { ARTICLES, articleBySlug, CLUSTERS, type ClusterId } from './content/articles.ts';
import { LANES, laneById, type LaneId } from './catalog/lanes.ts';
import { getBook, getChapter, laneBooks, allBookIds, mediaKey, type BookMeta } from './catalog/books.ts';
import { paginate } from './catalog/parse.ts';
import { tick, lazyTick, opsKeyValid } from './ops.ts';
import { html, raw } from './lib/html.ts';
import { html as h } from './lib/html.ts';

type HonoEnv = { Bindings: Env; Variables: { store: Store; L: Lang } };
type Ctx = Context<HonoEnv>;
const app = new Hono<HonoEnv>();

const origin = (c: { env: Env; req: { url: string } }) => (c.env.CANONICAL_HOST ? `https://${c.env.CANONICAL_HOST}` : new URL(c.req.url).origin);
const isCrawler = (ua: string) => /bot\b|bot\/|crawl|spider|slurp|mediapartners|adsbot|google|bingpreview|yandex|baidu|duckduck|facebookexternalhit|lighthouse|headlesschrome|applebot|petalbot/i.test(ua);

/* ── ringkasan jalur (satu dokumen, diperbarui cron impor) ───────────────── */

interface LaneSummary {
  at: number;
  counts: Record<string, number>;
  top: Record<string, Card[]>;
}
const SUMMARY = 'k/lanes.json';

export async function refreshSummary(store: Store): Promise<LaneSummary> {
  const counts: Record<string, number> = {};
  const top: Record<string, Card[]> = {};
  for (const l of LANES) {
    const books = await laneBooks(store, l.id, 1000);
    counts[l.id] = books.length;
    top[l.id] = books.slice(0, 12);
  }
  const s: LaneSummary = { at: Date.now(), counts, top };
  await store.put(SUMMARY, s);
  return s;
}

async function summary(store: Store): Promise<LaneSummary> {
  return (await store.get<LaneSummary>(SUMMARY)) ?? refreshSummary(store);
}

/* ── middleware ─────────────────────────────────────────────────────────── */

app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const canonical = c.env.CANONICAL_HOST?.trim();
  if (canonical && url.host !== canonical && url.pathname !== '/api/health' && (url.host.endsWith('.workers.dev') || url.host === `www.${canonical}`)) {
    return c.redirect(`https://${canonical}${url.pathname}${url.search}`, 301);
  }
  c.set('store', new Store(c.env.DATA));
  c.set('L', url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'id');
  await next();
  // Pekerjaan berkala tanpa cron (src/ops.ts): satu langkah di latar setelah halaman terkirim, paling sering sekali per menit.
  if (c.req.method === 'GET' && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/assets/')) {
    try {
      c.executionCtx.waitUntil(lazyTick(c.env, refreshSummary).catch((err) => console.error('jenius tick', err)));
    } catch {
      /* tanpa ExecutionContext (uji di dalam proses): lewati */
    }
  }
  const hd = c.res.headers;
  hd.set('X-Content-Type-Options', 'nosniff');
  hd.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  hd.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  hd.set('X-Frame-Options', 'SAMEORIGIN');
  if (!canonical && (hd.get('content-type') ?? '').includes('text/html')) hd.set('X-Robots-Tag', 'noindex');
});

const render = (c: Ctx, o: Omit<Parameters<typeof page>[0], 'origin'>) => page({ ...o, origin: origin(c), noindex: o.noindex || !c.env.CANONICAL_HOST });

function htmlRes(body: string, status = 200, L?: Lang): Response {
  const headers: Record<string, string> = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' };
  if (L) headers['set-cookie'] = `jl=${L}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  return new Response(body, { status, headers });
}

/* ── berkas teknis ──────────────────────────────────────────────────────── */

app.get('/api/health', (c) => c.json({ ok: true, service: 'jenius.es' }));
app.get('/ads.txt', (c) => c.text(ADS_TXT, 200, { 'cache-control': 'public, max-age=3600' }));
// Pemilik: „jgn ada satupun yg memblokir crawler google“. Cloudflare bisa menyisipkan grup „Disallow: /“ untuk crawler AI
// (Google-Extended, GoogleOther, …) di depan robots.txt ini; setiap crawler Google mendapat grup „Allow: /“ sendiri, dan
// Google menggabungkan grup dengan nama yang sama lalu memakai aturan yang paling longgar bila seri.
export const GOOGLE_CRAWLERS = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video', 'Mediapartners-Google', 'AdsBot-Google', 'AdsBot-Google-Mobile', 'Google-InspectionTool', 'Storebot-Google', 'GoogleOther', 'GoogleOther-Image', 'GoogleOther-Video', 'Google-Extended', 'Google-CloudVertexBot', 'Google-Agent', 'Google-GeminiNotebook', 'Google-NotebookLM', 'APIs-Google', 'FeedFetcher-Google', 'Google-Read-Aloud', 'Google-Site-Verification'];
app.get('/robots.txt', (c) => c.text([
  ...GOOGLE_CRAWLERS.map((g) => `User-agent: ${g}\nAllow: /\n`),
  'User-agent: Bingbot\nAllow: /\n',
  'User-agent: *\nAllow: /\nDisallow: /api/\n',
  `Sitemap: ${origin(c)}/sitemap.xml\n`,
].join('\n'), 200, { 'cache-control': 'public, max-age=3600' }));

app.get('/sitemap.xml', async (c) => {
  const o = origin(c);
  const urls: { loc: string; alt?: string }[] = [];
  for (const k of Object.keys(PAGES) as PageKey[]) urls.push({ loc: PAGES[k][0], alt: PAGES[k][1] }, { loc: PAGES[k][1], alt: PAGES[k][0] });
  for (const l of LANES) urls.push({ loc: lanePath('id', l.slug), alt: lanePath('en', l.slug) }, { loc: lanePath('en', l.slug), alt: lanePath('id', l.slug) });
  for (const a of ARTICLES) urls.push({ loc: articlePath('id', a.slug), alt: articlePath('en', a.slug) }, { loc: articlePath('en', a.slug), alt: articlePath('id', a.slug) });
  for (const t of (await import('./pages/tools.ts')).TOOLS) urls.push({ loc: toolPath('id', t.slug), alt: toolPath('en', t.slug) }, { loc: toolPath('en', t.slug), alt: toolPath('id', t.slug) });
  for (const id of await allBookIds(c.get('store'))) urls.push({ loc: bookPath('id', id), alt: bookPath('en', id) }, { loc: bookPath('en', id), alt: bookPath('id', id) });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls
    .map((u) => `<url><loc>${o}${u.loc}</loc>${u.alt ? `<xhtml:link rel="alternate" hreflang="${u.alt.startsWith('/en') ? 'en' : 'id'}" href="${o}${u.alt}"/>` : ''}</url>`)
    .join('\n')}\n</urlset>`;
  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' });
});

app.get('/manifest.webmanifest', (c) => {
  const L: Lang = (c.req.header('accept-language') ?? '').toLowerCase().startsWith('id') ? 'id' : 'en';
  return c.json({
    name: 'jenius.es — E-Book with Voice', short_name: 'jenius.es', lang: L, start_url: L === 'en' ? '/en?pwa=1' : '/?pwa=1', scope: '/', display: 'standalone',
    background_color: '#f6f8ff', theme_color: '#0b2a6b', description: tr(L, 'Perpustakaan baca bersuara yang gratis.', 'A free voiced reading library.'),
    icons: [{ src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
  }, 200, { 'content-type': 'application/manifest+json', 'cache-control': 'public, max-age=86400' });
});

app.get('/sw.js', (c) => c.body(`// jenius.es service worker ${ASSET_V}
const V='jen-${ASSET_V}';const SHELL=['/assets/app.css?v=${ASSET_V}','/assets/app.js?v=${ASSET_V}','/assets/reader.js?v=${ASSET_V}','/assets/icon-192.png','/assets/badge-96.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
if(u.pathname.startsWith('/api/book/')||u.pathname.startsWith('/m/')||u.pathname.startsWith('/cover/')||u.pathname.startsWith('/assets/')){e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(e.request);const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}));return}
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))))}});
`, 200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache' }));

/* ── API buku ───────────────────────────────────────────────────────────── */

// Workflow jenius-ops.yml: satu langkah impor/ringkasan/cadangan per panggilan (kunci sekali pakai, hash di R2).
app.post('/api/ops/tick', async (c) => {
  if (!(await opsKeyValid(c.env, c.req.header('x-ops-key') ?? ''))) return c.json({ error: 'forbidden' }, 403);
  // Selama workflow bekerja, langkah latar dari kunjungan menunggu (tidak mengerjakan buku yang sama bersamaan).
  await c.get('store').put('k/tick.json', { at: Date.now() });
  return c.json(await tick(c.env, refreshSummary, { budgetMs: 20_000 }), 200, { 'cache-control': 'no-store' });
});

app.get('/api/book/:id', async (c) => {
  const b = await getBook(c.get('store'), c.req.param('id'));
  return b ? c.json(b, 200, { 'cache-control': 'public, max-age=600' }) : c.json({ error: 'not found' }, 404);
});

app.get('/api/book/:id/ch/:n', async (c) => {
  const store = c.get('store');
  const b = await getBook(store, c.req.param('id'));
  const n = Number(c.req.param('n'));
  const ch = b ? await getChapter(store, b.id, n) : null;
  if (!b || !ch) return c.json({ error: 'not found' }, 404);
  const lane = laneById(b.lanes[0] ?? 'santai');
  const pages = paginate(ch.blocks, lane?.wordsPerPage ?? 220).map((blocks) => blocks.map((x) => (x.t === 'img' ? { ...x, src: `/m/${b.id}/${encodeURIComponent(x.src)}` } : x)));
  return c.json({ id: b.id, n: ch.n, title: ch.title, pages }, 200, { 'cache-control': 'public, max-age=3600' });
});

app.get('/m/:id/:file', async (c) => {
  const id = c.req.param('id');
  const file = c.req.param('file');
  if (!/^[a-z0-9-]{1,90}$/.test(id) || !/^[\w.-]{1,120}$/.test(file)) return c.notFound();
  const o = await c.env.DATA.get(mediaKey(id, file));
  if (!o) return c.notFound();
  return new Response(o.body, { headers: { 'content-type': o.httpMetadata?.contentType ?? 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable' } });
});

app.get('/cover/:file', async (c) => {
  const id = c.req.param('file').replace(/\.svg$/, '');
  const b = await getBook(c.get('store'), id);
  if (!b) return c.notFound();
  return c.body(coverSvg(b), 200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=604800' });
});

/* ── halaman publik (ID & EN) ───────────────────────────────────────────── */

app.get('/', async (c) => {
  const cookie = c.req.header('cookie') ?? '';
  const cc = (c.req.header('cf-ipcountry') ?? '').toUpperCase();
  // Pengunjung luar Indonesia → versi Inggris (crawler tidak dialihkan agar kedua bahasa terindeks).
  if (!/(^|;\s*)jl=/.test(cookie) && cc && cc !== 'ID' && cc !== 'XX' && !isCrawler(c.req.header('user-agent') ?? '')) return c.redirect('/en', 302);
  return home(c, 'id');
});
app.get('/en', (c) => home(c, 'en'));

async function home(c: Ctx, L: Lang) {
  const s = await summary(c.get('store'));
  const featured = (['tunas', 'tumbuh', 'jelajah', 'santai'] as LaneId[]).map((id) => ({ lane: laneById(id)!, books: (s.top[id] ?? []).slice(0, 8) }));
  const o = origin(c);
  return htmlRes(render(c, {
    L, title: tr(L, 'jenius.es — Perpustakaan baca bersuara gratis untuk semua', 'jenius.es — A free voiced reading library for everyone'),
    desc: tr(L, 'Tekan Putar sekali: buku dibacakan, kata disorot, halaman berganti sendiri sampai akhir bab. Buku terbuka gratis untuk anak, pelajar, mahasiswa, guru, dan umum.', 'Press Play once: the book is read aloud, words light up and pages turn by themselves to the end of the chapter. Free open books for children, students, teachers and everyone.'),
    path: P(L, 'home'), alt: P(other(L), 'home'), ads: true, active: undefined, body: homePage(L, s.counts, featured),
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'jenius.es', url: o, inLanguage: L, potentialAction: { '@type': 'SearchAction', target: `${o}${P(L, 'search')}?q={q}`, 'query-input': 'required name=q' } },
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'jenius.es', url: o, logo: `${o}/assets/logo-main-600.webp`, email: 'halo@jenius.es' }],
  }), 200, L);
}

for (const L of ['id', 'en'] as Lang[]) {
  app.get(P(L, 'lanes'), async (c) => {
    const s = await summary(c.get('store'));
    return htmlRes(render(c, { L, title: tr(L, 'Jalur Baca — delapan jalur dari TK sampai profesor | jenius.es', 'Reading Lanes — eight lanes from preschool to professor | jenius.es'), desc: tr(L, 'Pilih jalur baca sesuai jenjang: Tunas, Tumbuh, Jelajah, Kampus, Cendekia, Profesi, Santai, dan Lintas Bahasa.', 'Choose a reading lane by level: Sprout, Grow, Explore, Campus, Scholar, Career, Leisure and Across Languages.'), path: P(L, 'lanes'), alt: P(other(L), 'lanes'), ads: true, active: 'lanes', body: lanesPage(L, s.counts) }), 200, L);
  });

  app.get(L === 'en' ? '/en/lanes/:slug' : '/jalur/:slug', async (c) => {
    const lane = laneBySlugOrNull(c.req.param('slug'));
    if (!lane) return notFound(c, L);
    const books = await laneBooks(c.get('store'), lane.id, 1000);
    const rak = c.req.query('rak');
    const shelf = isShelf(rak) ? rak : null;
    const o = origin(c);
    return htmlRes(render(c, {
      L, title: tr(L, `${pick(L, lane.name)} — buku bersuara untuk ${pick(L, lane.levels)} | jenius.es`, `${pick(L, lane.name)} — voiced books for ${pick(L, lane.levels)} | jenius.es`),
      desc: pick(L, lane.blurb), path: lanePath(L, lane.slug), alt: lanePath(other(L), lane.slug), ads: !lane.kids, active: 'lanes', body: lanePage(L, lane, books, shelf),
      jsonLd: [crumbs(o, [[tr(L, 'Jalur Baca', 'Reading Lanes'), P(L, 'lanes')], [pick(L, lane.name), lanePath(L, lane.slug)]])],
    }), 200, L);
  });

  app.get(L === 'en' ? '/en/book/:id' : '/buku/:id', async (c) => {
    const b = await getBook(c.get('store'), c.req.param('id'));
    if (!b) return notFound(c, L);
    const kids = b.lanes.some((id) => laneById(id)?.kids);
    const lane = laneById(b.lanes[0] ?? 'santai')!;
    const o = origin(c);
    return htmlRes(render(c, {
      L, title: tr(L, `${b.title} — ${b.author} | buku bersuara gratis`, `${b.title} — ${b.author} | free voiced book`),
      desc: (b.description || tr(L, `Dengarkan ${b.title} karya ${b.author}: dibacakan halaman demi halaman dengan sorotan kata.`, `Listen to ${b.title} by ${b.author}: read aloud page by page with highlighted words.`)).slice(0, 300),
      path: bookPath(L, b.id), alt: bookPath(other(L), b.id), ads: !kids, active: 'lanes', body: bookPage(L, b), ogImage: `${o}/cover/${b.id}.svg`,
      jsonLd: [bookJsonLd(o, L, b), crumbs(o, [[tr(L, 'Jalur Baca', 'Reading Lanes'), P(L, 'lanes')], [pick(L, lane.name), lanePath(L, lane.slug)], [b.title, bookPath(L, b.id)]])],
    }), 200, L);
  });

  app.get(L === 'en' ? '/en/read/:id/:n' : '/baca/:id/:n', async (c) => {
    const b = await getBook(c.get('store'), c.req.param('id'));
    const n = Number(c.req.param('n'));
    if (!b || !b.chapters.some((x) => x.n === n)) return notFound(c, L);
    const ch = b.chapters.find((x) => x.n === n)!;
    return htmlRes(render(c, {
      L, title: `${ch.title} — ${b.title} | jenius.es`, desc: tr(L, `Dengarkan dan baca ${ch.title} dari ${b.title}.`, `Listen to and read ${ch.title} from ${b.title}.`),
      path: readPath(L, b.id, n), alt: readPath(other(L), b.id, n), ads: false, active: 'reader', bodyClass: 'reader-body', body: html`${readerPage(L, b, n)}<script src="/assets/reader.js?v=${ASSET_V}" defer></script>`,
      noindex: true,
    }), 200, L);
  });

  app.get(P(L, 'articles'), (c) => {
    const t = c.req.query('topik');
    const cluster = t && t in CLUSTERS ? (t as ClusterId) : null;
    return htmlRes(render(c, { L, title: tr(L, 'Artikel tentang membaca untuk orang tua dan guru | jenius.es', 'Articles on reading for parents and teachers | jenius.es'), desc: tr(L, 'Panduan praktis: membacakan buku, kebiasaan membaca, pemahaman, disleksia, bahasa Inggris dari cerita, kelas, dan AI dalam pendidikan.', 'Practical guides: reading aloud, reading habits, comprehension, dyslexia, English through stories, classrooms and AI in education.'), path: P(L, 'articles'), alt: P(other(L), 'articles'), ads: true, active: 'articles', body: articlesIndex(L, cluster) }), 200, L);
  });

  app.get(L === 'en' ? '/en/articles/:slug' : '/artikel/:slug', (c) => {
    const hit = articleBySlug(c.req.param('slug'));
    if (!hit || hit.L !== L) {
      if (hit) return c.redirect(articlePath(L, hit.a.slug), 301);
      return notFound(c, L);
    }
    const a = hit.a;
    const o = origin(c);
    return htmlRes(render(c, {
      L, title: `${pick(L, a.title)} | jenius.es`, desc: pick(L, a.description), path: articlePath(L, a.slug), alt: articlePath(other(L), a.slug), ads: true, active: 'articles', body: articlePage(L, a),
      jsonLd: [articleJsonLd(o, L, a), crumbs(o, [[tr(L, 'Artikel', 'Articles'), P(L, 'articles')], [pick(L, a.title), articlePath(L, a.slug)]])],
    }), 200, L);
  });

  app.get(P(L, 'tools'), (c) => htmlRes(render(c, { L, title: tr(L, 'Alat gratis untuk orang tua & guru | jenius.es', 'Free tools for parents & teachers | jenius.es'), desc: tr(L, 'Uji kecepatan baca, rencana baca mingguan, pemilih buku, dan kartu kosakata cetak — gratis.', 'Reading speed test, weekly reading plan, book picker and printable vocabulary cards — free.'), path: P(L, 'tools'), alt: P(other(L), 'tools'), ads: true, active: 'tools', body: toolsIndex(L) }), 200, L));

  app.get(L === 'en' ? '/en/tools/:slug' : '/alat/:slug', async (c) => {
    const t = toolBySlug(c.req.param('slug'));
    if (!t) return notFound(c, L);
    const s = await summary(c.get('store'));
    return htmlRes(render(c, { L, title: `${pick(L, t.name)} | jenius.es`, desc: pick(L, t.blurb), path: toolPath(L, t.slug), alt: toolPath(other(L), t.slug), ads: true, active: 'tools', body: toolPage(L, t, { books: s.top }) }), 200, L);
  });

  app.get(P(L, 'teachers'), (c) => htmlRes(render(c, { L, title: tr(L, 'jenius.es untuk guru dan sekolah — gratis', 'jenius.es for teachers and schools — free'), desc: tr(L, 'Buku bersuara per jenjang, mode slide untuk layar kelas, alat siap cetak, dan ruang kelas digital — gratis untuk guru.', 'Voiced books by level, slide mode for the class screen, printable tools and a digital classroom — free for teachers.'), path: P(L, 'teachers'), alt: P(other(L), 'teachers'), ads: true, active: 'teachers', body: teachersPage(L) }), 200, L));

  app.get(P(L, 'licenses'), async (c) => {
    const store = c.get('store');
    const ids = await allBookIds(store);
    const metas = (await Promise.all(ids.slice(0, 600).map((id) => getBook(store, id)))).filter((x): x is BookMeta => Boolean(x)).sort((a, b) => a.title.localeCompare(b.title));
    return htmlRes(render(c, { L, title: tr(L, 'Lisensi & atribusi buku | jenius.es', 'Book licences & credits | jenius.es'), desc: tr(L, 'Daftar lengkap buku di jenius.es beserta penulis, ilustrator, sumber, dan lisensinya.', 'The full list of books on jenius.es with their authors, illustrators, sources and licences.'), path: P(L, 'licenses'), alt: P(other(L), 'licenses'), ads: true, body: licensesPage(L, metas.map((m) => ({ id: m.id, title: m.title })), metas) }), 200, L);
  });

  app.get(P(L, 'search'), async (c) => {
    const q = (c.req.query('q') ?? '').trim().toLowerCase().slice(0, 80);
    const s = await summary(c.get('store'));
    const seen = new Set<string>();
    const all: Card[] = [];
    for (const l of LANES) for (const b of s.top[l.id] ?? []) if (!seen.has(b.id)) { seen.add(b.id); all.push(b); }
    const store = c.get('store');
    if (q) {
      for (const l of LANES) for (const b of await laneBooks(store, l.id, 1000)) if (!seen.has(b.id)) { seen.add(b.id); all.push(b); }
    }
    const hits = q ? all.filter((b) => `${b.meta.title} ${b.meta.author}`.toLowerCase().includes(q)).slice(0, 60) : [];
    const arts = q ? ARTICLES.filter((a) => `${pick(L, a.title)} ${pick(L, a.description)}`.toLowerCase().includes(q)) : [];
    const body = html`${pageHead(tr(L, 'Cari buku & artikel', 'Search books & articles'))}<section class="section"><div class="wrap">
      <form class="search-form" method="get"><input name="q" value="${q}" placeholder="${tr(L, 'Judul, penulis, atau topik…', 'Title, author or topic…')}" aria-label="${tr(L, 'Kata kunci', 'Keyword')}" autofocus><button class="btn btn-primary" type="submit">${tr(L, 'Cari', 'Search')}</button></form>
      ${q ? html`<p class="muted">${tr(L, `${hits.length} buku, ${arts.length} artikel untuk „${q}“`, `${hits.length} books, ${arts.length} articles for “${q}”`)}</p>` : ''}
      ${hits.length ? html`<div class="book-grid">${hits.map((b) => bookCard(L, b))}</div>` : ''}
      ${arts.length ? html`<ul class="clean">${arts.map((a) => html`<li><a href="${articlePath(L, a.slug)}">${pick(L, a.title)}</a></li>`)}</ul>` : ''}
    </div></section>`;
    return htmlRes(render(c, { L, title: tr(L, 'Cari | jenius.es', 'Search | jenius.es'), desc: tr(L, 'Cari buku bersuara dan artikel di jenius.es.', 'Search voiced books and articles on jenius.es.'), path: P(L, 'search'), alt: P(other(L), 'search'), ads: false, noindex: true, body }), 200, L);
  });

  for (const k of ['about', 'contact', 'privacy', 'cookies', 'terms', 'accessibility', 'disclaimer', 'guide'] as PageKey[]) {
    app.get(P(L, k), (c) => {
      const d = infoDoc(k, L)!;
      return htmlRes(render(c, { L, title: `${d.title} | jenius.es`, desc: d.desc, path: P(L, k), alt: P(other(L), k), ads: k === 'guide' || k === 'about', body: infoPage(d.title, d.desc, d.md) }), 200, L);
    });
  }
}

function notFound(c: Ctx, L: Lang) {
  return htmlRes(render(c, { L, title: tr(L, 'Halaman tidak ditemukan | jenius.es', 'Page not found | jenius.es'), desc: tr(L, 'Halaman ini tidak ada.', 'This page does not exist.'), path: new URL(c.req.url).pathname, ads: false, noindex: true,
    body: h`${pageHead(tr(L, 'Halaman tidak ditemukan', 'Page not found'), tr(L, 'Mungkin bukunya masih diimpor atau alamatnya berubah.', 'The book may still be importing or the address has changed.'))}<section class="section"><div class="wrap"><a class="btn btn-primary" href="${P(L, 'lanes')}">${tr(L, 'Jelajahi jalur baca', 'Browse reading lanes')}</a> <a class="btn btn-ghost" href="${P(L, 'search')}">${tr(L, 'Cari', 'Search')}</a></div></section>` }), 404);
}

app.notFound((c) => notFound(c, new URL(c.req.url).pathname.startsWith('/en') ? 'en' : 'id'));
app.onError((err, c) => {
  console.error('jenius', err);
  return c.text('Terjadi gangguan. Coba lagi sebentar lagi. / Something went wrong. Please try again shortly.', 500);
});

/* ── cron ───────────────────────────────────────────────────────────────── */

export async function scheduled(_event: ScheduledController, env: Env): Promise<void> {
  // Hanya bila cron dipasang lagi (Workers Paid); sekarang pekerjaan ini berjalan lewat src/ops.ts.
  await tick(env, refreshSummary, { budgetMs: 20_000 });
}

export default {
  fetch: app.fetch,
  scheduled: (event: ScheduledController, env: Env, ctx: ExecutionContext) => ctx.waitUntil(scheduled(event, env)),
};

export { app };
void raw;
