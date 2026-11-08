/**
 * AI Content Analyzer — detektor artikel AI & penilai tulisan (ID/EN) di Cloudflare Workers.
 * Data hanya di R2 (aturan tetap pemilik). Satu Worker: situs publik, portal member, portal admin, API, cron.
 */
import { Hono } from 'hono';
import type { Env } from './env.ts';
import { loadSession, chosenLang, countryLang, isCrawler, type HonoEnv, type Ctx } from './lib/session.ts';
import type { Lang } from './lib/i18n.ts';
import { homePage, howPage, accuracyPage, pricingPage, samplePage, policyPage, verifyPage, notFoundPage, PATHS, type PageKey, type PublishedAccuracy, type VerifyRecord } from './pages/public.ts';
import { auth } from './routes/auth.ts';
import { app as memberApp } from './routes/app.ts';
import { admin } from './routes/admin.ts';
import { checks } from './routes/checks.ts';
import { registerPublicAffiliate } from './routes/affiliate.ts';
import { getBilling, getEngine, measuredCostPer1k } from './data/settings.ts';
import { getAffiliateSettings } from './data/affiliate.ts';
import { scheduled } from './cron.ts';
import { page, ADS_TXT } from './pages/ui.ts';
import { html } from './lib/html.ts';
import { tr } from './lib/i18n.ts';
import { limit } from './lib/ratelimit.ts';

const app = new Hono<HonoEnv>();

/** Portal member/admin & API: CSP ketat, tanpa skrip pihak ketiga. */
const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "script-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

/**
 * Halaman publik: AdSense (Auto ads) memuat skrip, iklan dan bingkai dari banyak domain Google yang berubah-ubah,
 * jadi sumber https diizinkan di sini saja — portal member/admin tetap memakai CSP ketat di atas.
 */
const CSP_PUBLIC = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "font-src 'self' https://fonts.gstatic.com",
  "script-src 'self' 'unsafe-inline' https:",
  "connect-src 'self' https:",
  "frame-src https:",
  "fenced-frame-src https:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const PRIVATE_AREA = /^\/(app|admin|api|masuk|daftar|keluar|2fa|lupa|r\/)/;

app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const canonical = c.env.CANONICAL_HOST?.trim();
  // Setelah domain sendiri dipasang: workers.dev dan www dialihkan permanen (301) ke satu alamat kanonik,
  // supaya Google hanya mengindeks satu versi setiap halaman (kecuali health check untuk pemantauan).
  if (canonical && url.host !== canonical && (url.host.endsWith('.workers.dev') || url.host === `www.${canonical}`) && url.pathname !== '/api/health') {
    return c.redirect(`https://${canonical}${url.pathname}${url.search}`, 301);
  }
  // CSRF: tolak POST lintas situs (cookie juga SameSite=Lax).
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    const origin = c.req.header('origin');
    const site = c.req.header('sec-fetch-site');
    if ((origin && new URL(origin).host !== url.host) || site === 'cross-site') return c.text('Forbidden', 403);
  }
  await loadSession(c as Ctx);
  await next();
  const h = c.res.headers;
  // Laporan Cek Gratis memuat AdSense (pemilik, 7 Nov 2026): satu-satunya halaman area member dengan CSP publik.
  const adsPage = h.get('x-ads-page') === '1' && /^\/app\/laporan\/rpt_[A-Za-z0-9]+$/.test(url.pathname);
  h.delete('x-ads-page');
  h.set('Content-Security-Policy', PRIVATE_AREA.test(url.pathname) && !adsPage ? CSP : CSP_PUBLIC);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-Frame-Options', 'DENY');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (url.pathname.startsWith('/app') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) h.set('Cache-Control', 'no-store');
});

app.get('/api/health', (c) => c.json({ ok: true }));

const originOf = (c: Ctx) => (c.env.CANONICAL_HOST ? `https://${c.env.CANONICAL_HOST}` : new URL(c.req.url).origin);
const pubCtx = (c: Ctx, L: Lang) => ({ L, user: c.get('user'), origin: originOf(c), noindex: false });

/**
 * Halaman publik berpasangan (ID ↔ EN). Pengunjung manusia dibawa ke bahasanya: pilihan manual (akun/cookie) bila ada,
 * bila belum memilih menurut negara (Indonesia → ID, negara lain → EN). Crawler tidak pernah dialihkan, dan hreflang
 * menautkan kedua versi, jadi keduanya tetap terindeks. Setelah member memilih lewat tombol bahasa, bahasanya tidak
 * berubah lagi di halaman mana pun sampai ia memilih lagi.
 */
function both(key: PageKey, render: (c: Ctx, L: Lang) => Promise<string> | string) {
  const [idp, enp] = PATHS[key];
  const serve = (L: Lang) => async (c: Ctx) => {
    const want = isCrawler(c) ? null : chosenLang(c) ?? countryLang(c);
    if (want && want !== L) {
      const q = new URL(c.req.url).search;
      return c.redirect(`${want === 'en' ? enp : idp}${q}`, 302);
    }
    return c.html(await render(c, L));
  };
  app.get(idp, (c) => serve('id')(c as Ctx));
  app.get(enp, (c) => serve('en')(c as Ctx));
}

both('home', async (c, L) => {
  const store = c.get('store');
  const aff = await getAffiliateSettings(store);
  return homePage(pubCtx(c, L), await getBilling(store), await getEngine(store), await measuredCostPer1k(store), aff.enabled ? aff.ratePct : null);
});
both('how', (c, L) => howPage(pubCtx(c, L)));
both('acc', async (c, L) => accuracyPage(pubCtx(c, L), await c.get('store').get<PublishedAccuracy>('k/accuracy.json')));
both('price', async (c, L) => {
  const store = c.get('store');
  return pricingPage(pubCtx(c, L), await getBilling(store), await getEngine(store), await measuredCostPer1k(store));
});
both('sample', (c, L) => samplePage(pubCtx(c, L)));
both('privacy', (c, L) => policyPage(pubCtx(c, L), 'privacy'));
both('terms', (c, L) => policyPage(pubCtx(c, L), 'terms'));
both('ethics', (c, L) => policyPage(pubCtx(c, L), 'ethics'));

async function verify(c: Ctx, raw: string | null) {
  const L: Lang = c.req.query('lang') === 'en' ? 'en' : 'id';
  if (raw && !(await limit(c.env, `verify:${c.req.header('cf-connecting-ip') ?? 'local'}`, 120, 3600))) return c.text('Too many requests', 429);
  const code = raw ? raw.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(.{4})(.{4}).*$/, '$1-$2') : null;
  const rec = code ? await c.get('store').get<VerifyRecord>(`c/verify/${code}.json`) : null;
  return c.html(verifyPage(L, c.get('user'), code, rec), code && !rec ? 404 : 200);
}
app.get('/verifikasi', (c) => verify(c as Ctx, c.req.query('kode') ?? null));
app.get('/en/verify', (c) => verify(c as Ctx, c.req.query('kode') ?? null));
app.get('/v/:code', (c) => verify(c as Ctx, c.req.param('code')));

// Pemilik, 2 Nov 2026: tidak boleh ada robot yang menghambat crawler Google (SEO + AdSense). Semua crawler Google
// diizinkan penuh; untuk crawler lain hanya ruang pribadi yang dilewati (halamannya juga bertanda noindex).
app.get('/robots.txt', (c) => {
  const o = originOf(c as Ctx);
  const google = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video', 'Mediapartners-Google', 'AdsBot-Google', 'AdsBot-Google-Mobile', 'Google-InspectionTool', 'GoogleOther', 'Google-Extended', 'Storebot-Google'];
  const body = [
    ...google.map((g) => `User-agent: ${g}\nAllow: /\n`),
    'User-agent: *\nAllow: /\nDisallow: /app/\nDisallow: /admin\nDisallow: /api/\n',
    `Sitemap: ${o}/sitemap.xml\n`,
  ].join('\n');
  return c.text(body, 200, { 'cache-control': 'public, max-age=3600' });
});

app.get('/ads.txt', (c) => c.text(ADS_TXT, 200, { 'cache-control': 'public, max-age=3600' }));

app.get('/sitemap.xml', (c) => {
  const o = originOf(c as Ctx);
  const urls = Object.values(PATHS)
    .map(([id, en]) => `<url><loc>${o}${id}</loc><xhtml:link rel="alternate" hreflang="id" href="${o}${id}"/><xhtml:link rel="alternate" hreflang="en" href="${o}${en}"/></url><url><loc>${o}${en}</loc><xhtml:link rel="alternate" hreflang="id" href="${o}${id}"/><xhtml:link rel="alternate" hreflang="en" href="${o}${en}"/></url>`)
    .join('');
  return c.body(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`, 200, { 'content-type': 'application/xml' });
});

registerPublicAffiliate(app);
app.route('/', auth);
app.route('/', checks);
app.route('/', memberApp);
app.route('/', admin);

app.notFound((c) => {
  const L: Lang = c.req.path.startsWith('/en') ? 'en' : 'id';
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'not found' }, 404);
  return c.html(notFoundPage(L, (c as Ctx).get('user') ?? null), 404);
});

app.onError((err, c) => {
  console.error('error', c.req.method, c.req.path, err instanceof Error ? err.stack : err);
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Terjadi kesalahan di server. Coba lagi.' }, 500);
  const L: Lang = c.req.path.startsWith('/en') ? 'en' : 'id';
  return c.html(page({ L, title: '500', area: 'public', noindex: true, body: html`<section class="section"><div class="wrap narrow center"><div class="big404">500</div><h1>${tr(L, 'Ada yang salah di sisi kami', 'Something went wrong on our side')}</h1><p class="muted">${tr(L, 'Coba lagi sebentar lagi. Bila berulang, hubungi hello@axto.io.', 'Try again shortly. If it keeps happening, contact hello@axto.io.')}</p><a class="btn btn-primary" href="${L === 'en' ? '/en' : '/'}">${tr(L, 'Ke beranda', 'Go home')}</a></div></section>` }), 500);
});

export default {
  fetch: app.fetch,
  scheduled: (event: ScheduledController, env: Env, ctx: ExecutionContext) => ctx.waitUntil(scheduled(event, env)),
} satisfies ExportedHandler<Env>;
