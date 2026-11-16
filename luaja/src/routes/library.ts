/**
 * Rute pustaka: rak publik, halaman buku publik (terindeks), pembaca (tanpa indeks) dan data halaman buku.
 * Data buku `/p/b/<id>.json` selalu lewat Worker (`assets.run_worker_first`): member bahasa itu dan pengelola menerima
 * seluruh halaman; selain itu hanya pratinjau PREVIEW_PAGES halaman pertama.
 */
import { Hono } from 'hono';
import type { HonoEnv, Ctx } from '../lib/session.ts';
import { base, render } from '../lib/render.ts';
import { t, type Lang } from '../lib/i18n.ts';
import { getSite } from '../data/settings.ts';
import { hasAccess } from '../data/users.ts';
import { COURSE_META, COURSES, type Course } from '../data/model.ts';
import { crumbs } from '../pages/layout.ts';
import { bookPage, libraryIndexPage, levelLabel, readerPage } from '../pages/library.ts';
import { getBook, PREVIEW_PAGES } from '../library/index.ts';
import type { BookDoc } from '../library/types.ts';
import { getReading, recordReading, streak } from '../data/reading.ts';

export const library = new Hono<HonoEnv>();
const can = (c: Ctx, course: Course) => hasAccess(c.get('subs'), course, c.get('user'));
const L = (c: Ctx): Lang => c.get('lang');

library.get('/pustaka', async (c) => {
  const q = c.req.query('bahasa'), lang = L(c);
  const course = (COURSES as readonly string[]).includes(q ?? '') ? (q as Course) : 'de';
  const lv = c.req.query('jenjang');
  const level = COURSE_META[course].levels.some((l) => l.id === lv) ? lv : undefined;
  const name = COURSE_META[course].names[lang];
  const site = await getSite(c.get('store'));
  const path = q ? `/pustaka?bahasa=${course}${level ? `&jenjang=${level}` : ''}` : '/pustaka';
  return render(c, {
    path, site, theme: course, active: 'pustaka',
    title: t(lang, 'lib.index.title', { name, site: site.name }), desc: t(lang, 'lib.index.desc', { name }),
    body: libraryIndexPage({ course, level, lang }),
    jsonLd: [crumbs(base(c), [[t(lang, 'lib.home'), '/pustaka'], [name, `/pustaka?bahasa=${course}`]], lang)],
  });
});

library.get('/pustaka/:id', async (c) => {
  const b = getBook(c.req.param('id'));
  if (!b) return c.notFound();
  const lang = L(c), u = c.get('user');
  const site = await getSite(c.get('store'));
  const reading = u ? await getReading(c.get('store'), u.id) : undefined;
  const lv = levelLabel(b.lang, b.level);
  const book = {
    '@context': 'https://schema.org', '@type': 'Book', name: b.title, description: b.about, inLanguage: COURSE_META[b.lang].locale.slice(0, 2),
    numberOfPages: b.pages, educationalLevel: lv, author: { '@type': 'Organization', name: b.author }, license: b.licenceUrl, isBasedOn: b.sourceUrl,
    publisher: { '@type': 'Organization', name: site.name }, url: `${base(c)}/pustaka/${b.id}`,
  };
  return render(c, {
    path: `/pustaka/${b.id}`, site, theme: b.lang, active: 'pustaka',
    title: t(lang, 'lib.book.title', { title: b.title, level: `${COURSE_META[b.lang].names[lang]} ${lv}`, site: site.name }),
    desc: `${b.sub}. ${b.about}`.slice(0, 158),
    body: bookPage({ book: b, open: can(c, b.lang), lastPage: reading?.books[b.id]?.page, lang }),
    jsonLd: [crumbs(base(c), [[t(lang, 'lib.home'), '/pustaka'], [COURSE_META[b.lang].names[lang], `/pustaka?bahasa=${b.lang}`], [b.title, `/pustaka/${b.id}`]], lang), book],
  });
});

library.get('/baca/:id', async (c) => {
  const b = getBook(c.req.param('id'));
  if (!b) return c.notFound();
  const lang = L(c), u = c.get('user');
  const site = await getSite(c.get('store'));
  const reading = u ? await getReading(c.get('store'), u.id) : undefined;
  const h = Number(c.req.query('h'));
  const start = Number.isInteger(h) && h >= 1 && h <= b.pages ? h - 1 : (reading?.books[b.id]?.page ?? 0);
  return render(c, {
    path: `/baca/${b.id}`, site, theme: b.lang, active: 'pustaka', noAds: true, noindex: true,
    title: `${b.title} — ${t(lang, 'lib.reader')} | ${site.name}`, desc: b.about,
    body: readerPage({ book: b, open: can(c, b.lang), start, loggedIn: Boolean(u), xp: reading?.xp ?? 0, streak: reading ? streak(reading) : 0, lang }),
  });
});

library.get('/p/b/:file', async (c) => {
  const id = c.req.param('file').replace(/\.json$/, '');
  const b = getBook(id);
  if (!b) return c.json({ ok: false }, 404);
  const res = await c.env.ASSETS.fetch(new Request(new URL(`/p/b/${b.id}.json`, c.req.url)));
  if (!res.ok) return c.json({ ok: false }, 404);
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, max-age=300', vary: 'Cookie', 'x-robots-tag': 'noindex' };
  if (can(c, b.lang)) return new Response(res.body, { headers });
  const doc = (await res.json()) as BookDoc;
  return new Response(JSON.stringify({ ...doc, pages: doc.pages.slice(0, PREVIEW_PAGES), total: doc.pages.length, locked: true }), { headers });
});

/** Progres membaca (member yang masuk). Halaman di luar pratinjau hanya dicatat bila punya akses bahasa itu. */
library.post('/api/pustaka/progres', async (c) => {
  const u = c.get('user');
  if (!u) return c.json({ ok: false }, 401);
  const body = (await c.req.json().catch(() => ({}))) as { book?: string; page?: number; ok?: number; tried?: number };
  const b = getBook(String(body.book ?? ''));
  const page = Number(body.page);
  if (!b || !Number.isInteger(page) || page < 0 || page >= b.pages) return c.json({ ok: false }, 400);
  if (page >= PREVIEW_PAGES && !can(c, b.lang)) return c.json({ ok: false }, 403);
  const r = await recordReading(c.get('store'), u.id, { book: b.id, page, pages: b.pages, ok: Number.isInteger(body.ok) ? body.ok : undefined, tried: Number.isInteger(body.tried) ? body.tried : undefined });
  return c.json({ ok: true, xp: r.xp, streak: streak(r) });
});
