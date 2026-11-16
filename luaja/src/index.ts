/**
 * luaja.com — LUAJA (docs/LUAJA-BLUEPRINT.md). Satu Worker Hono: halaman publik, pelajaran interaktif, bank latihan soal,
 * portal member (paket & bukti bayar), panel pengelola, berkas teknis. Semua data di R2 (aturan tetap pemilik: tidak pernah D1).
 *
 * Tiga bahasa antarmuka (pemilik, 15 Nov 2026): halaman publik Indonesia di `/…`, Inggris di `/en/…`, Jepang di `/ja/…`.
 * Kunjungan pertama dari Indonesia → Indonesia, dari Jepang → Jepang, selain itu → Inggris (kode negara Cloudflare).
 * Pilihan manual (?lang=) disimpan di cookie dan akun dan selalu menang. Perayap mesin pencari tidak dialihkan.
 */
import { Hono } from 'hono';
import type { Env } from './env.ts';
import { loadSession, setLangCookie, type Ctx, type HonoEnv } from './lib/session.ts';
import { ADS_TXT } from './lib/adsense.ts';
import { base, isPublicPath, origin, pathFor, render } from './lib/render.ts';
import { isLang, langForCountry, LANGS, PREFIX, t, type Lang } from './lib/i18n.ts';
import { isAdmin, updateUser } from './data/users.ts';
import { limit } from './lib/ratelimit.ts';
import { getPricing, getSite } from './data/settings.ts';
import { hasAccess } from './data/users.ts';
import { COURSE_META, COURSES, siteFor, unitPrices, money, type Course } from './data/model.ts';
import { getProgress, recordQuiz, saveAttempt } from './data/progress.ts';
import { ASSET_V, courseJsonLd, crumbs, faqJsonLd, logoMark } from './pages/layout.ts';
import { cobaPage, coursePage, CUR_FOR, homePage, notFoundPage } from './pages/public.ts';
import { lessonPage, levelPage, type LessonState } from './pages/lesson.ts';
import { practiceIndexPage, practiceSetPage } from './pages/practice.ts';
import { infoPage, INFO_SLUGS, pricingPage } from './pages/info.ts';
import { autoMood, MOODS, scene, type Country, type Mood } from './pages/scene.ts';
import { figure, type Pose } from './pages/figure.ts';
import { getLesson, LESSONS, neighbours } from './course/index.ts';
import type { Lesson } from './course/schema.ts';
import type { Progress } from './data/progress.ts';
import { grade, shownAnswer } from './course/schema.ts';
import { getSet, nextSet, SETS } from './practice/index.ts';
import { gradeSet, IncompleteError } from './practice/types.ts';
import { account } from './routes/account.ts';
import { admin } from './routes/admin.ts';
import { pay } from './routes/pay.ts';
import { library } from './routes/library.ts';
import { exam } from './routes/exam.ts';
import { kamus } from './routes/kamus.ts';
import { readyExams, mocksOf } from './exam/mocks.ts';
import { BOOKS } from './library/index.ts';

const app = new Hono<HonoEnv>();

/** Header internal pembawa awalan bahasa (/en, /ja) dari pintu masuk ke aplikasi; nilai dari luar selalu dibuang. */
const UI_HDR = 'x-luaja-ui';
/** Perayap dan pratinjau tautan: tidak pernah dialihkan bahasa (setiap versi bahasa punya URL sendiri + hreflang). */
const BOT = /bot|crawl|spider|slurp|mediapartners|adsbot|google-|googleother|bingpreview|facebookexternalhit|embedly|whatsapp|telegram|lighthouse|pagespeed|validator/i;

app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const canonical = c.env.CANONICAL_HOST?.trim();
  if (canonical && url.host !== canonical && url.pathname !== '/api/health' && (url.host.endsWith('.workers.dev') || url.host === `www.${canonical}`)) {
    return c.redirect(`https://${canonical}${url.pathname}${url.search}`, 301);
  }
  // Formulir & API hanya dari situs sendiri (lapisan CSRF selain token formulir).
  if (c.req.method === 'POST') {
    const o = c.req.header('origin');
    if (o && new URL(o).host !== url.host) return c.text('Asal permintaan tidak sah.', 403);
  }
  await loadSession(c);
  const path = url.pathname.replace(/^\/{2,}/, '/');
  const pub = isPublicPath(path);
  const prefixed = c.req.header(UI_HDR);
  const urlLang: Lang = isLang(prefixed) ? prefixed : 'id';
  // /en/portal, /ja/masuk … → tanpa awalan (bahasanya mengikuti pilihan tersimpan).
  if (prefixed && !pub) return c.redirect(path + url.search, 302);

  // Pilihan manual: simpan (cookie + akun), lalu kembali ke halaman yang sama dalam bahasa itu.
  const want = url.searchParams.get('lang');
  if (isLang(want)) {
    setLangCookie(c, want);
    const u = c.get('user');
    if (u && u.ui !== want) await updateUser(c.get('store'), u.id, (x) => ({ ...x, ui: want }));
    url.searchParams.delete('lang');
    const to = (pub ? pathFor(want, path) : path) + (url.search || '');
    return c.redirect(to, 302);
  }

  const pref = c.get('langPref');
  const cc = c.req.header('cf-ipcountry');
  const human = !BOT.test(c.req.header('user-agent') ?? '');
  if (pub) {
    c.set('lang', urlLang);
    // Kunjungan manusia ke halaman HTML dalam bahasa yang berbeda dari pilihannya (atau, bila belum memilih, dari negaranya)
    // dialihkan ke versi bahasanya. Pilihan dari negara disimpan agar navigasi berikutnya konsisten.
    const accept = c.req.header('accept') ?? '';
    if (c.req.method === 'GET' && human && accept.includes('text/html')) {
      const desired = pref ?? (cc && cc !== 'XX' && cc !== 'T1' ? langForCountry(cc) : null);
      if (desired && desired !== urlLang) {
        if (!pref) setLangCookie(c, desired);
        return c.redirect(pathFor(desired, path) + url.search, 302);
      }
      if (!pref && desired) setLangCookie(c, desired);
    }
  } else {
    c.set('lang', pref ?? (cc && cc !== 'XX' && cc !== 'T1' ? langForCountry(cc) : 'id'));
  }
  await next();
  const hd = c.res.headers;
  hd.set('X-Content-Type-Options', 'nosniff');
  hd.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  hd.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
  hd.set('X-Frame-Options', 'SAMEORIGIN');
  if (!canonical && (hd.get('content-type') ?? '').includes('text/html')) hd.set('X-Robots-Tag', 'noindex');
});

const moodParam = (q: string | undefined, country: Country): Mood => (q && MOODS.includes(q as Mood) ? (q as Mood) : autoMood(country));
const can = (c: Ctx, course: Course) => hasAccess(c.get('subs'), course, c.get('user'));
const L = (c: Ctx): Lang => c.get('lang');

/**
 * Status buka pelajaran: gratis → terbuka; tanpa langganan → khusus member; dengan langganan → terbuka bila pelajaran
 * sebelumnya di jalur yang sama sudah lulus (kuis ≥ 80 %) atau pelajaran ini pembuka jenjang; pengelola selalu terbuka.
 */
function lessonState(c: Ctx, l: Lesson, prog: Progress | undefined): LessonState {
  if (prog?.lessons[l.code]?.passed) return 'passed';
  if (l.free) return 'free';
  if (!can(c, l.course)) return 'member';
  if (isAdmin(c.get('user'))) return 'open';
  const { prev } = neighbours(l.code);
  if (!prev || prev.level !== l.level || prev.free || prog?.lessons[prev.code]?.passed) return 'open';
  return 'seq';
}

/* ── berkas teknis ──────────────────────────────────────────────────────── */
app.get('/api/health', (c) => c.json({ ok: true, service: 'luaja.com', v: ASSET_V, lessons: LESSONS.length, sets: SETS.length, mocks: readyExams().reduce((n, e) => n + mocksOf(e.id).length, 0) }));
app.get('/ads.txt', (c) => c.text(ADS_TXT, 200, { 'cache-control': 'public, max-age=3600' }));
export const GOOGLE_CRAWLERS = ['Googlebot', 'Googlebot-Image', 'Googlebot-News', 'Googlebot-Video', 'Mediapartners-Google', 'AdsBot-Google', 'AdsBot-Google-Mobile', 'Google-InspectionTool', 'Storebot-Google', 'GoogleOther', 'GoogleOther-Image', 'GoogleOther-Video', 'Google-Extended', 'Google-CloudVertexBot', 'Google-Agent', 'Google-GeminiNotebook', 'Google-NotebookLM', 'APIs-Google', 'FeedFetcher-Google', 'Google-Read-Aloud', 'Google-Site-Verification'];
app.get('/robots.txt', (c) => c.text([
  ...GOOGLE_CRAWLERS.map((g) => `User-agent: ${g}\nAllow: /\nDisallow: /portal\nDisallow: /api/\n`),
  'User-agent: Bingbot\nAllow: /\nDisallow: /portal\nDisallow: /api/\n',
  'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /portal\n',
  `Sitemap: ${origin(c)}/sitemap.xml\n`,
].join('\n'), 200, { 'cache-control': 'public, max-age=3600' }));
app.get('/sitemap.xml', (c) => {
  const o = origin(c), today = new Date().toISOString().slice(0, 10);
  const urls: [string, string, string][] = [
    ['/', 'daily', '1.0'], ['/coba', 'weekly', '0.9'], ['/harga', 'weekly', '0.9'], ['/latihan', 'weekly', '0.9'],
    ...COURSES.map((k) => [`/${COURSE_META[k].slug}`, 'weekly', '0.9'] as [string, string, string]),
    ...COURSES.flatMap((k) => COURSE_META[k].levels.map((l) => [`/${COURSE_META[k].slug}/${l.id}`, 'weekly', '0.7'] as [string, string, string])),
    ...COURSES.map((k) => [`/latihan?bahasa=${k}`, 'weekly', '0.7'] as [string, string, string]),
    ['/simulasi', 'weekly', '0.8'], ...readyExams().map((e) => [`/simulasi/${e.id}`, 'weekly', '0.8'] as [string, string, string]),
    ['/pustaka', 'weekly', '0.8'], ['/kamus', 'weekly', '0.8'], ...(['de', 'en', 'ja', 'id'] as const).map((k) => [`/kamus?l=${k}`, 'weekly', '0.6'] as [string, string, string]), ...COURSES.map((k) => [`/pustaka?bahasa=${k}`, 'weekly', '0.7'] as [string, string, string]),
    ...BOOKS.map((b) => [`/pustaka/${b.id}`, 'monthly', '0.6'] as [string, string, string]),
    ...LESSONS.filter((l) => l.free).map((l) => [`/belajar/${l.code}`, 'monthly', '0.8'] as [string, string, string]),
    ...SETS.filter((s) => s.free && s.kind === 'simulasi').map((s) => [`/latihan/${s.id}`, 'monthly', '0.7'] as [string, string, string]),
    ...INFO_SLUGS.map((s) => [`/${s}`, 'yearly', '0.3'] as [string, string, string]),
  ];
  // Setiap halaman dalam tiga bahasa, masing-masing dengan tautan alternatif hreflang (termasuk x-default = Indonesia).
  const loc = (lng: Lang, p: string) => `${o}${PREFIX[lng]}${p}`.replace(/&/g, '&amp;');
  const alt = (p: string) => [...LANGS.map((lng) => `<xhtml:link rel="alternate" hreflang="${lng}" href="${loc(lng, p)}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${loc('id', p)}"/>`].join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.flatMap(([p, f, pr]) => LANGS.map((lng) => `  <url><loc>${loc(lng, p)}</loc>${alt(p)}<lastmod>${today}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`)).join('\n')}\n</urlset>\n`;
  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' });
});
app.get('/manifest.webmanifest', (c) => c.json({ id: '/', name: 'LUAJA — Belajar Bahasa Jerman, Inggris & Jepang', short_name: 'LUAJA', start_url: '/?src=pwa', scope: '/', display: 'standalone', display_override: ['standalone', 'minimal-ui'], orientation: 'portrait', background_color: '#fffdf9', theme_color: '#1746b8', lang: 'id', categories: ['education'],
  // Situs mengenali dirinya sendiri lewat navigator.getInstalledRelatedApps(): tanda „Pasang“ disembunyikan bila sudah terpasang.
  related_applications: [{ platform: 'webapp', url: `${origin(c)}/manifest.webmanifest` }], prefer_related_applications: false,
  shortcuts: [{ name: 'Pustaka', url: '/pustaka?src=pwa', icons: [{ src: '/assets/icon-192.png', sizes: '192x192' }] }, { name: 'Latihan soal', url: '/latihan?src=pwa', icons: [{ src: '/assets/icon-192.png', sizes: '192x192' }] }, { name: 'Portal', url: '/portal?src=pwa', icons: [{ src: '/assets/icon-192.png', sizes: '192x192' }] }], description: 'Pelajaran interaktif Jerman A1–C2, Inggris Beginner–Proficiency, Jepang N5–N1, latihan soal TOEFL, IELTS, Goethe & JLPT.', icons: [{ src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] }, 200, { 'content-type': 'application/manifest+json', 'cache-control': 'public, max-age=86400' }));
app.get('/favicon.svg', (c) => c.body(logoMark(64, false).s.replace('<svg class="logo-mark"', '<svg xmlns="http://www.w3.org/2000/svg"'), 200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=604800' }));
app.get('/favicon.ico', (c) => c.redirect('/assets/icon-192.png', 301));
app.get('/sw.js', (c) => c.body(`const V='lj-${ASSET_V}';self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['/assets/app.css?v=${ASSET_V}','/assets/app.js?v=${ASSET_V}','/assets/fonts/fraunces.woff2','/assets/fonts/jakarta.woff2'])))});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;if(u.pathname.startsWith('/assets/')){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const cp=x.clone();caches.open(V).then(c=>c.put(e.request,cp));return x})));return}if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/portal')||u.pathname.startsWith('/admin')||u.pathname.startsWith('/latihan/'))return;e.respondWith(fetch(e.request).then(x=>{if(x.ok&&x.headers.get('cache-control')?.includes('public')){const cp=x.clone();caches.open(V).then(c=>c.put(e.request,cp))}return x}).catch(()=>caches.match(e.request)))});`, 200, { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-cache' }));

/* ── pemandangan & figur (ganti suasana tanpa muat ulang) ───────────────── */
app.get('/api/scene/:country/:mood', (c) => {
  const country = c.req.param('country') as Country, mood = c.req.param('mood') as Mood;
  if (!['id', 'de', 'en', 'ja'].includes(country) || !MOODS.includes(mood)) return c.notFound();
  return c.body(scene(country, mood, { id: 'hero' }), 200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=86400' });
});
const POSES: Pose[] = ['berlin', 'london', 'tokyo', 'jalan', 'belajar', 'sapa', 'baca'];
app.get('/api/figure/:pose/:mood', (c) => {
  const pose = c.req.param('pose') as Pose, mood = c.req.param('mood') as Mood;
  if (!POSES.includes(pose) || !MOODS.includes(mood)) return c.notFound();
  return c.body(figure(pose, { mood }), 200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=86400' });
});

/* ── API latihan & pelajaran (kunci hanya di server) ────────────────────── */
app.post('/api/latihan/:id', async (c) => {
  const s = getSet(c.req.param('id'));
  if (!s) return c.json({ error: t(L(c), 'api.setNotFound') }, 404);
  if (!s.free && !can(c, s.course)) return c.json({ error: t(L(c), 'api.setMembers') }, 403);
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  if (!(await limit(c.env, `lat:${ip}`, 120, 3600))) return c.json({ error: t(L(c), 'api.tooMany') }, 429);
  const body = (await c.req.json().catch(() => null)) as { answers?: Record<string, unknown> } | null;
  try {
    const g = gradeSet(s, body?.answers ?? {});
    const u = c.get('user');
    if (u) {
      const ans = Object.fromEntries(s.questions.map((x) => [x.id, Number(body!.answers![x.id])]));
      await saveAttempt(c.get('store'), u.id, g, ans);
    }
    return c.json(g);
  } catch (err) {
    if (err instanceof IncompleteError) return c.json({ error: t(L(c), 'api.incomplete', { n: err.missing }) }, 400);
    throw err;
  }
});

/** Pelajaran yang boleh dikerjakan pengunjung ini (gratis, atau member dan urutannya sudah sampai). */
async function lessonAccess(c: Ctx, code: string): Promise<Lesson | null> {
  const l = getLesson(code);
  if (!l) return null;
  const u = c.get('user');
  const prog = u ? await getProgress(c.get('store'), u.id) : undefined;
  const st = lessonState(c, l, prog);
  return st === 'member' || st === 'seq' ? null : l;
}
app.post('/api/pelajaran/:code/cek', async (c) => {
  const l = await lessonAccess(c, c.req.param('code'));
  if (!l) return c.json({ error: t(L(c), 'api.lessonNA') }, 403);
  const b = (await c.req.json().catch(() => null)) as { part?: string; i?: number; answer?: unknown } | null;
  const list = b?.part === 'practice' ? l.practice : b?.part === 'independent' ? l.independent : null;
  const e = list?.[Number(b?.i)];
  if (!e) return c.json({ error: t(L(c), 'api.exNotFound') }, 400);
  const ok = grade(e, b!.answer);
  return c.json({ ok, shown: shownAnswer(e), why: 'why' in e ? e.why : '' });
});
app.post('/api/pelajaran/:code/kuis', async (c) => {
  const l = await lessonAccess(c, c.req.param('code'));
  if (!l) return c.json({ error: t(L(c), 'api.lessonNA') }, 403);
  const b = (await c.req.json().catch(() => null)) as { answers?: unknown[] } | null;
  const ans = Array.isArray(b?.answers) ? b!.answers : [];
  const missing = l.quiz.filter((_, i) => ans[i] === undefined || ans[i] === null || String(ans[i]).trim() === '').length;
  if (missing) return c.json({ error: t(L(c), 'quiz.missing', { n: missing }) }, 400);
  const items = l.quiz.map((e, i) => ({ ok: grade(e, ans[i]), shown: shownAnswer(e), why: 'why' in e ? e.why : '' }));
  const pct = items.filter((x) => x.ok).length / items.length;
  const passed = pct >= 0.8;
  const u = c.get('user');
  if (u) await recordQuiz(c.get('store'), u.id, l.code, pct);
  const message = t(L(c), passed ? 'quiz.pass' : 'quiz.fail');
  return c.json({ pct, passed, items, message });
});

/* ── halaman publik (tiga bahasa; teks SEO per bahasa) ─────────────────── */
app.get('/', async (c) => {
  const store = c.get('store'), lang = L(c);
  const [site, pricing] = await Promise.all([getSite(store), getPricing(store)]);
  const mood = moodParam(c.req.query('mood'), 'id');
  const local = siteFor(site, lang);
  return render(c, {
    path: '/', site, title: t(lang, 'home.title', { name: site.name }), desc: local.description, mood, active: 'beranda',
    body: homePage({ site: local, pricing, mood, lang }), jsonLd: [faqJsonLd(local.faq), ...COURSES.map((k) => courseJsonLd(base(c), site, k, pricing.tiers.umum.one, lang))],
  });
});
for (const code of COURSES) {
  const m = COURSE_META[code];
  app.get(`/${m.slug}`, async (c) => {
    const store = c.get('store'), lang = L(c);
    const [site, pricing] = await Promise.all([getSite(store), getPricing(store)]);
    const mood = moodParam(c.req.query('mood'), code);
    const first = m.levels[0]!, last = m.levels[m.levels.length - 1]!;
    return render(c, {
      path: `/${m.slug}`, site, theme: code, mood, active: m.slug,
      title: t(lang, 'course.title', { name: m.names[lang], a: first.name, b: last.name, site: site.name }),
      desc: t(lang, 'course.desc', { name: m.names[lang], native: m.native, levels: m.levels.map((l) => l.name).join(', ') }),
      body: coursePage({ site, pricing, course: code, mood, lang }), jsonLd: [crumbs(base(c), [[m.names[lang], `/${m.slug}`]], lang), courseJsonLd(base(c), site, code, pricing.tiers.umum.one, lang)],
    });
  });
  app.get(`/${m.slug}/:level`, async (c) => {
    const lv = m.levels.find((l) => l.id === c.req.param('level'));
    if (!lv) return c.notFound();
    const u = c.get('user'), lang = L(c);
    const progress = u ? await getProgress(c.get('store'), u.id) : undefined;
    const site = await getSite(c.get('store'));
    return render(c, {
      path: `/${m.slug}/${lv.id}`, site, theme: code, active: m.slug,
      title: t(lang, 'level.title', { course: m.names[lang], level: lv.name, site: site.name }),
      desc: t(lang, 'level.desc', { course: m.names[lang], level: lv.name, sub: lv.sub[lang] }),
      body: levelPage({ course: code, level: lv.id, unlocked: can(c, code), progress, lang, state: (cd) => lessonState(c, getLesson(cd)!, progress) }),
      jsonLd: [crumbs(base(c), [[m.names[lang], `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`]], lang)],
    });
  });
}
app.get('/coba', async (c) => {
  const site = await getSite(c.get('store')), lang = L(c);
  return render(c, { path: '/coba', site, title: t(lang, 'coba.pageTitle', { site: site.name }), desc: t(lang, 'coba.desc'), body: cobaPage({ lang }), jsonLd: [crumbs(base(c), [[t(lang, 'foot.free'), '/coba']], lang)] });
});
app.get('/harga', async (c) => {
  const store = c.get('store'), lang = L(c), cur = CUR_FOR[lang];
  const [site, pricing] = await Promise.all([getSite(store), getPricing(store)]);
  const u = unitPrices(pricing.tiers.umum, cur);
  return render(c, { path: '/harga', site, active: 'harga', title: t(lang, 'pricing.pageTitle', { one: money(u.one, cur), site: site.name }), desc: t(lang, 'pricing.pageDesc', { one: money(u.one, cur), three: money(u.three, cur) }), body: pricingPage({ site, pricing, lang }), jsonLd: [crumbs(base(c), [[t(lang, 'pricing.eyebrow'), '/harga']], lang)] });
});
app.get('/latihan', async (c) => {
  const q = c.req.query('bahasa'), lang = L(c);
  const course = (COURSES as readonly string[]).includes(q ?? '') ? (q as Course) : 'en';
  const m = COURSE_META[course];
  const site = await getSite(c.get('store'));
  return render(c, {
    path: q ? `/latihan?bahasa=${course}` : '/latihan', site, theme: course, active: 'latihan',
    title: t(lang, 'practice.index.title', { name: m.names[lang], exam: course === 'en' ? ' · TOEFL & IELTS' : course === 'de' ? ' · Goethe-Zertifikat' : ' · JLPT', site: site.name }),
    desc: t(lang, 'practice.index.desc', { name: m.names[lang] }),
    body: practiceIndexPage({ course, unlocked: can(c, course), best: {}, lang }), jsonLd: [crumbs(base(c), [[t(lang, 'menu.practice'), '/latihan']], lang)],
  });
});
app.get('/latihan/:id', async (c) => {
  const s = getSet(c.req.param('id'));
  if (!s) return c.notFound();
  const m = COURSE_META[s.course], lang = L(c);
  const site = await getSite(c.get('store'));
  return render(c, {
    path: `/latihan/${s.id}`, site, theme: s.course, active: 'latihan', noAds: true, noindex: !s.free || s.kind === 'drill',
    title: t(lang, 'practice.set.title', { title: s.title, exam: s.examName, name: m.names[lang], site: site.name }),
    desc: t(lang, 'practice.set.desc', { q: t(lang, 'common.questions', { n: s.questions.length }), exam: s.examName, desc: s.desc }),
    body: practiceSetPage({ set: s, unlocked: can(c, s.course), loggedIn: Boolean(c.get('user')), nextId: nextSet(s.id)?.id, lang }),
    jsonLd: [crumbs(base(c), [[t(lang, 'menu.practice'), '/latihan'], [s.title, `/latihan/${s.id}`]], lang)],
  });
});
app.get('/belajar/:code', async (c) => {
  const l = getLesson(c.req.param('code'));
  if (!l) return c.notFound();
  const m = COURSE_META[l.course], lv = m.levels.find((x) => x.id === l.level)!, lang = L(c);
  const u = c.get('user');
  const prog = u ? await getProgress(c.get('store'), u.id) : undefined;
  const { prev, next } = neighbours(l.code);
  const state = lessonState(c, l, prog);
  const site = await getSite(c.get('store'));
  return render(c, {
    path: `/belajar/${l.code}`, site, theme: l.course, active: m.slug, noAds: !l.free, noindex: !l.free,
    title: t(lang, 'lesson.title', { title: l.title, native: l.native, course: m.names[lang], level: lv.name, m: l.module, site: site.name }),
    desc: t(lang, 'lesson.desc', { course: m.names[lang], level: lv.name, goals: l.goals.join('; ') }),
    body: lessonPage({ lesson: l, state, loggedIn: Boolean(u), passed: prog?.lessons[l.code]?.passed, prev, next, lang }),
    jsonLd: [crumbs(base(c), [[m.names[lang], `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`], [l.title, `/belajar/${l.code}`]], lang)],
  });
});
for (const slug of INFO_SLUGS) {
  app.get(`/${slug}`, async (c) => {
    const site = await getSite(c.get('store')), lang = L(c);
    const p = infoPage(site, slug, lang)!;
    return render(c, { path: `/${slug}`, site, title: `${p.title} — ${site.name}`, desc: p.desc, body: p.body, jsonLd: [crumbs(base(c), [[p.title, `/${slug}`]], lang)] });
  });
}

app.route('/', account);
app.route('/', admin);
app.route('/', pay);
app.route('/', library);
app.route('/', exam);
app.route('/', kamus);

app.notFound(async (c) => {
  const lang = L(c) ?? 'id';
  if (c.req.path.startsWith('/api/')) return c.json({ ok: false, error: t(lang, 'common.notFound') }, 404);
  return render(c, { path: c.req.path, title: `${t(lang, 'nf.title')} — LUAJA`, desc: t(lang, 'nf.title'), body: notFoundPage(lang), noindex: true, noAds: true }, 404);
});
app.onError((err, c) => {
  console.error(err);
  const lang = (c.get('lang') as Lang | undefined) ?? 'id';
  if (c.req.path.startsWith('/api/')) return c.json({ ok: false, error: t(lang, 'common.serverError') }, 500);
  return c.text(t(lang, 'common.tryLater'), 500);
});

/**
 * Pintu masuk: /en/… dan /ja/… dilepas awalannya lalu bahasanya diteruskan lewat header internal (header dari luar dibuang).
 * /en dan /ja tanpa garis miring → /en/ dan /ja/.
 */
export default {
  fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(req.url);
    // Garis miring ganda di awal (//host) dirapikan agar tidak pernah menjadi alamat lain saat dialihkan.
    url.pathname = url.pathname.replace(/^\/{2,}/, '/');
    const m = /^\/(en|ja)(\/.*)?$/.exec(url.pathname);
    if (m && !m[2]) return Response.redirect(`${url.origin}/${m[1]}/${url.search}`, 301);
    if (m) url.pathname = m[2]!.replace(/^\/{2,}/, '/');
    const r = new Request(url.toString(), req);
    r.headers.delete(UI_HDR);
    if (m) r.headers.set(UI_HDR, m[1]!);
    return app.fetch(r, env, ctx);
  },
} satisfies ExportedHandler<Env>;
