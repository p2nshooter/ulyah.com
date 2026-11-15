/**
 * luaja.com — LUAJA (docs/LUAJA-BLUEPRINT.md). Satu Worker Hono: halaman publik, pelajaran interaktif, bank latihan soal,
 * portal member (paket & bukti bayar), panel pengelola, berkas teknis. Semua data di R2 (aturan tetap pemilik: tidak pernah D1).
 */
import { Hono } from 'hono';
import type { Env } from './env.ts';
import { loadSession, setLangCookie, type HonoEnv } from './lib/session.ts';
import { ADS_TXT } from './lib/adsense.ts';
import { origin, render } from './lib/render.ts';
import { limit } from './lib/ratelimit.ts';
import { getPricing, getSite } from './data/settings.ts';
import { hasAccess } from './data/users.ts';
import { COURSE_META, COURSES, type Course } from './data/model.ts';
import { getProgress, recordQuiz, saveAttempt } from './data/progress.ts';
import { ASSET_V, courseJsonLd, crumbs, faqJsonLd, logoMark } from './pages/layout.ts';
import { cobaPage, coursePage, homePage, notFoundPage } from './pages/public.ts';
import { lessonPage, levelPage } from './pages/lesson.ts';
import { practiceIndexPage, practiceSetPage } from './pages/practice.ts';
import { infoPage, INFO_SLUGS, pricingPage } from './pages/info.ts';
import { autoMood, MOODS, scene, type Country, type Mood } from './pages/scene.ts';
import { figure, type Pose } from './pages/figure.ts';
import { getLesson, LESSONS, neighbours } from './course/index.ts';
import { grade, shownAnswer } from './course/schema.ts';
import { getSet, nextSet, SETS } from './practice/index.ts';
import { gradeSet, IncompleteError } from './practice/types.ts';
import { account } from './routes/account.ts';
import { admin } from './routes/admin.ts';
import { pay } from './routes/pay.ts';

const app = new Hono<HonoEnv>();

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
  const lang = url.searchParams.get('lang');
  if (lang === 'id' || lang === 'en') {
    setLangCookie(c, lang);
    url.searchParams.delete('lang');
    return c.redirect(url.pathname + (url.search || ''), 302);
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
const can = (c: Parameters<typeof render>[0], course: Course) => hasAccess(c.get('subs'), course, c.get('user'));

/* ── berkas teknis ──────────────────────────────────────────────────────── */
app.get('/api/health', (c) => c.json({ ok: true, service: 'luaja.com', v: ASSET_V, lessons: LESSONS.length, sets: SETS.length }));
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
    ...LESSONS.filter((l) => l.free).map((l) => [`/belajar/${l.code}`, 'monthly', '0.8'] as [string, string, string]),
    ...SETS.filter((s) => s.free && s.kind === 'simulasi').map((s) => [`/latihan/${s.id}`, 'monthly', '0.7'] as [string, string, string]),
    ...INFO_SLUGS.map((s) => [`/${s}`, 'yearly', '0.3'] as [string, string, string]),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, f, pr]) => `  <url><loc>${o}${p.replace(/&/g, '&amp;')}</loc><lastmod>${today}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`;
  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' });
});
app.get('/manifest.webmanifest', (c) => c.json({ name: 'LUAJA — Belajar Bahasa Jerman, Inggris & Jepang', short_name: 'LUAJA', start_url: '/?src=pwa', scope: '/', display: 'standalone', background_color: '#fbf8f1', theme_color: '#0b1f4d', lang: 'id', description: 'Pelajaran interaktif Jerman A1–C2, Inggris Beginner–Proficiency, Jepang N5–N1, latihan soal TOEFL, IELTS, Goethe & JLPT.', icons: [{ src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] }, 200, { 'content-type': 'application/manifest+json', 'cache-control': 'public, max-age=86400' }));
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
  if (!s) return c.json({ error: 'Paket tidak ditemukan.' }, 404);
  if (!s.free && !can(c, s.course)) return c.json({ error: 'Paket ini khusus member.' }, 403);
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  if (!(await limit(c.env, `lat:${ip}`, 120, 3600))) return c.json({ error: 'Terlalu banyak pengumpulan. Coba lagi nanti.' }, 429);
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
    if (err instanceof IncompleteError) return c.json({ error: `${err.missing} soal belum dijawab. Kunci jawaban terbuka setelah semua soal terjawab.` }, 400);
    throw err;
  }
});

const lessonAccess = (c: Parameters<typeof render>[0], code: string) => {
  const l = getLesson(code);
  return l && (l.free || can(c, l.course)) ? l : null;
};
app.post('/api/pelajaran/:code/cek', async (c) => {
  const l = lessonAccess(c, c.req.param('code'));
  if (!l) return c.json({ error: 'Pelajaran tidak tersedia.' }, 403);
  const b = (await c.req.json().catch(() => null)) as { part?: string; i?: number; answer?: unknown } | null;
  const list = b?.part === 'practice' ? l.practice : b?.part === 'independent' ? l.independent : null;
  const e = list?.[Number(b?.i)];
  if (!e) return c.json({ error: 'Latihan tidak ditemukan.' }, 400);
  const ok = grade(e, b!.answer);
  return c.json({ ok, shown: shownAnswer(e), why: 'why' in e ? e.why : '' });
});
app.post('/api/pelajaran/:code/kuis', async (c) => {
  const l = lessonAccess(c, c.req.param('code'));
  if (!l) return c.json({ error: 'Pelajaran tidak tersedia.' }, 403);
  const b = (await c.req.json().catch(() => null)) as { answers?: unknown[] } | null;
  const ans = Array.isArray(b?.answers) ? b!.answers : [];
  const missing = l.quiz.filter((_, i) => ans[i] === undefined || ans[i] === null || String(ans[i]).trim() === '').length;
  if (missing) return c.json({ error: `${missing} soal kuis belum dijawab.` }, 400);
  const items = l.quiz.map((e, i) => ({ ok: grade(e, ans[i]), shown: shownAnswer(e), why: 'why' in e ? e.why : '' }));
  const pct = items.filter((x) => x.ok).length / items.length;
  const passed = pct >= 0.8;
  const u = c.get('user');
  if (u) await recordQuiz(c.get('store'), u.id, l.code, pct);
  const message = passed ? 'Fondasi Anda kokoh — lanjutkan ke pelajaran berikutnya dengan percaya diri.' : 'Pelajari pembahasan di setiap soal, ulangi langkah 4–6, lalu coba lagi. Anda pasti bisa.';
  return c.json({ pct, passed, items, message });
});

/* ── halaman publik ────────────────────────────────────────────────────── */
app.get('/', async (c) => {
  const store = c.get('store');
  const [site, pricing] = await Promise.all([getSite(store), getPricing(store)]);
  const mood = moodParam(c.req.query('mood'), 'id');
  return render(c, {
    path: '/', site, title: `${site.name} — Kursus Online Bahasa Jerman, Inggris & Jepang dari Nol sampai Mahir`, desc: site.description, mood, active: 'beranda',
    body: homePage({ site, pricing, mood }), jsonLd: [faqJsonLd(site.faq), ...COURSES.map((k) => courseJsonLd(origin(c), site, k, pricing.tiers.umum.one))],
  });
});
for (const code of COURSES) {
  const m = COURSE_META[code];
  app.get(`/${m.slug}`, async (c) => {
    const store = c.get('store');
    const [site, pricing] = await Promise.all([getSite(store), getPricing(store)]);
    const mood = moodParam(c.req.query('mood'), code);
    const first = m.levels[0]!, last = m.levels[m.levels.length - 1]!;
    return render(c, {
      path: `/${m.slug}`, site, theme: code, mood, active: m.slug,
      title: `Kursus ${m.name} Online ${first.name}–${last.name} dengan Penjelasan Indonesia | ${site.name}`,
      desc: `Belajar ${m.name} (${m.native}) secara runtut ${m.levels.map((l) => l.name).join(', ')}: dialog bersuara penutur asli, kosakata, tata bahasa, latihan dan kuis, plus latihan soal format ujian resmi. Pelajaran pertama gratis.`,
      body: coursePage({ site, pricing, course: code, mood }), jsonLd: [crumbs(origin(c), [[m.name, `/${m.slug}`]]), courseJsonLd(origin(c), site, code, pricing.tiers.umum.one)],
    });
  });
  app.get(`/${m.slug}/:level`, async (c) => {
    const lv = m.levels.find((l) => l.id === c.req.param('level'));
    if (!lv) return c.notFound();
    const u = c.get('user');
    const progress = u ? await getProgress(c.get('store'), u.id) : undefined;
    return render(c, {
      path: `/${m.slug}/${lv.id}`, theme: code, active: m.slug,
      title: `${m.name} ${lv.name} — Modul, Pelajaran & Latihan | LUAJA`,
      desc: `Materi ${m.name} jenjang ${lv.name} (${lv.sub}): modul berurutan, pelajaran sepuluh langkah dengan audio penutur asli, dan latihan soal format ujian.`,
      body: levelPage({ course: code, level: lv.id, unlocked: can(c, code), progress }), jsonLd: [crumbs(origin(c), [[m.name, `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`]])],
    });
  });
}
app.get('/coba', async (c) => {
  const site = await getSite(c.get('store'));
  return render(c, { path: '/coba', site, title: `Pelajaran Gratis Bahasa Jerman A1, Inggris Beginner & Jepang N5 | ${site.name}`, desc: 'Ikuti pelajaran pertama setiap jenjang tanpa biaya: sepuluh langkah lengkap dengan audio penutur asli, latihan dan kuis. Tanpa registrasi.', body: cobaPage({ site }), jsonLd: [crumbs(origin(c), [['Pelajaran gratis', '/coba']])] });
});
app.get('/harga', async (c) => {
  const store = c.get('store');
  const [site, pricing] = await Promise.all([getSite(store), getPricing(store)]);
  return render(c, { path: '/harga', site, active: 'harga', title: `Harga Kursus Bahasa: ${pricing.tiers.umum.one.toLocaleString('id-ID')} Rupiah per Tahun · Promo Pelajar & Juara Kelas | LUAJA`, desc: `Satu bahasa ${pricing.tiers.umum.one.toLocaleString('id-ID')} rupiah per tahun, tiga bahasa ${pricing.tiers.umum.three.toLocaleString('id-ID')} rupiah. Harga khusus pelajar dan juara kelas. Seluruh jenjang dan latihan soal termasuk.`, body: pricingPage({ site, pricing }), jsonLd: [crumbs(origin(c), [['Harga & promo', '/harga']])] });
});
app.get('/latihan', async (c) => {
  const q = c.req.query('bahasa');
  const course = (COURSES as readonly string[]).includes(q ?? '') ? (q as Course) : 'en';
  const m = COURSE_META[course];
  return render(c, {
    path: q ? `/latihan?bahasa=${course}` : '/latihan', theme: course, active: 'latihan',
    title: `Latihan Soal ${m.name}${course === 'en' ? ' · TOEFL & IELTS' : course === 'de' ? ' · Goethe-Zertifikat' : ' · JLPT'} dengan Kunci & Prediksi Nilai | LUAJA`,
    desc: `Bank latihan soal ${m.name} format ujian resmi tiap jenjang, lengkap dengan kunci jawaban, pembahasan berbahasa Indonesia dan prediksi nilai.`,
    body: practiceIndexPage({ course, unlocked: can(c, course), best: {} }), jsonLd: [crumbs(origin(c), [['Latihan soal', '/latihan']])],
  });
});
app.get('/latihan/:id', async (c) => {
  const s = getSet(c.req.param('id'));
  if (!s) return c.notFound();
  const m = COURSE_META[s.course];
  return render(c, {
    path: `/latihan/${s.id}`, theme: s.course, active: 'latihan', noAds: true, noindex: !s.free || s.kind === 'drill',
    title: `${s.title} — ${s.examName} | Latihan Soal ${m.name} LUAJA`,
    desc: `${s.questions.length} soal ${s.examName}: ${s.desc} Kunci jawaban, pembahasan dan prediksi nilai setelah selesai.`,
    body: practiceSetPage({ set: s, unlocked: can(c, s.course), loggedIn: Boolean(c.get('user')), nextId: nextSet(s.id)?.id }),
    jsonLd: [crumbs(origin(c), [['Latihan soal', '/latihan'], [s.title, `/latihan/${s.id}`]])],
  });
});
app.get('/belajar/:code', async (c) => {
  const l = getLesson(c.req.param('code'));
  if (!l) return c.notFound();
  const m = COURSE_META[l.course], lv = m.levels.find((x) => x.id === l.level)!;
  const u = c.get('user');
  const prog = u ? await getProgress(c.get('store'), u.id) : undefined;
  const { prev, next } = neighbours(l.code);
  const unlocked = can(c, l.course);
  return render(c, {
    path: `/belajar/${l.code}`, theme: l.course, active: m.slug, noAds: !l.free, noindex: !l.free,
    title: `${l.title} (${l.native}) — ${m.name} ${lv.name} Modul ${l.module} | LUAJA`,
    desc: `Pelajaran ${m.name} ${lv.name}: ${l.goals.join('; ')}. Dialog bersuara, kosakata, tata bahasa, latihan dan kuis.`,
    body: lessonPage({ lesson: l, unlocked, loggedIn: Boolean(u), passed: prog?.lessons[l.code]?.passed, prev, next }),
    jsonLd: [crumbs(origin(c), [[m.name, `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`], [l.title, `/belajar/${l.code}`]])],
  });
});
for (const slug of INFO_SLUGS) {
  app.get(`/${slug}`, async (c) => {
    const site = await getSite(c.get('store'));
    const p = infoPage(site, slug)!;
    return render(c, { path: `/${slug}`, site, title: `${p.title} — LUAJA`, desc: p.desc, body: p.body, jsonLd: [crumbs(origin(c), [[p.title, `/${slug}`]])] });
  });
}

app.route('/', account);
app.route('/', admin);
app.route('/', pay);

app.notFound(async (c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ ok: false, error: 'Tidak ditemukan' }, 404);
  return render(c, { path: c.req.path, title: 'Halaman tidak ditemukan — LUAJA', desc: 'Halaman tidak ditemukan.', body: notFoundPage(), noindex: true, noAds: true }, 404);
});
app.onError((err, c) => {
  console.error(err);
  if (c.req.path.startsWith('/api/')) return c.json({ ok: false, error: 'Kesalahan server' }, 500);
  return c.text('Terjadi kesalahan. Coba lagi sebentar.', 500);
});

export default { fetch: app.fetch } satisfies ExportedHandler<Env>;
