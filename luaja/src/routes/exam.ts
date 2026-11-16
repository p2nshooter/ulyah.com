/** Rute simulasi ujian penuh. Kunci jawaban hanya di server; dinilai setelah seluruh simulasi selesai. */
import { Hono } from 'hono';
import type { HonoEnv, Ctx } from '../lib/session.ts';
import { base, render } from '../lib/render.ts';
import { t, type Lang } from '../lib/i18n.ts';
import { getSite } from '../data/settings.ts';
import { hasAccess } from '../data/users.ts';
import { COURSE_META } from '../data/model.ts';
import { crumbs } from '../pages/layout.ts';
import { examPage, runnerPage, simIndexPage } from '../pages/exam.ts';
import { getExam } from '../exam/specs.ts';
import { getMock, gradeMock, mocksOf, readyExams } from '../exam/mocks.ts';
import { invTs } from '../lib/store.ts';
import { newId } from '../lib/crypto.ts';
import { limit } from '../lib/ratelimit.ts';

export const exam = new Hono<HonoEnv>();
const L = (c: Ctx): Lang => c.get('lang');

exam.get('/simulasi', async (c) => {
  const lang = L(c), site = await getSite(c.get('store'));
  return render(c, { path: '/simulasi', site, active: 'latihan', title: `${t(lang, 'sim.indexTitle')} | ${site.name}`, desc: t(lang, 'sim.lead'), body: simIndexPage({ lang }), jsonLd: [crumbs(base(c), [[t(lang, 'sim.eyebrow'), '/simulasi']], lang)] });
});

exam.get('/simulasi/:exam', async (c) => {
  const e = getExam(c.req.param('exam'));
  if (!e || !readyExams().includes(e)) return c.notFound();
  const lang = L(c), site = await getSite(c.get('store'));
  return render(c, {
    path: `/simulasi/${e.id}`, site, theme: e.course, active: 'latihan',
    title: `${t(lang, 'sim.title', { exam: e.name })} | ${site.name}`, desc: t(lang, 'sim.lead'),
    body: examPage({ exam: e, unlocked: hasAccess(c.get('subs'), e.course, c.get('user')), lang }),
    jsonLd: [crumbs(base(c), [[t(lang, 'sim.eyebrow'), '/simulasi'], [e.name, `/simulasi/${e.id}`]], lang)],
  });
});

exam.get('/simulasi/:exam/:n{[0-9]+}', async (c) => {
  const e = getExam(c.req.param('exam'));
  const m = e && getMock(`${e.id}-s${c.req.param('n')}`);
  if (!e || !m) return c.notFound();
  if (!m.free && !hasAccess(c.get('subs'), e.course, c.get('user'))) return c.redirect(`/simulasi/${e.id}?kunci=${m.n}`, 302);
  const lang = L(c), site = await getSite(c.get('store'));
  const next = m.n < mocksOf(e.id).length ? `/simulasi/${e.id}/${m.n + 1}` : null;
  return render(c, { path: `/simulasi/${e.id}/${m.n}`, site, theme: e.course, active: 'latihan', noAds: true, noindex: true, title: `${m.title} | ${site.name}`, desc: t(lang, 'sim.lead'), body: runnerPage({ mock: m, exam: e, loggedIn: Boolean(c.get('user')), nextUrl: next, lang }) });
});

exam.post('/api/simulasi/:id/nilai', async (c) => {
  const m = getMock(c.req.param('id'));
  if (!m) return c.json({ ok: false }, 404);
  const e = getExam(m.exam)!;
  if (!m.free && !hasAccess(c.get('subs'), e.course, c.get('user'))) return c.json({ ok: false, error: t(L(c), 'practice.memberSet', { name: COURSE_META[e.course].names[L(c)] }) }, 403);
  if (!(await limit(c.env, `sim:${c.req.header('cf-connecting-ip') ?? 'x'}`, 30, 600))) return c.json({ ok: false }, 429);
  const body = (await c.req.json().catch(() => ({}))) as { answers?: Record<string, unknown> };
  const r = gradeMock(m, body.answers ?? {});
  const u = c.get('user');
  if (u) {
    const id = newId('sim');
    await c.get('store').put(`c/simulasi/${id}.json`, { id, uid: u.id, mock: m.id, at: Date.now(), total: r.total, pass: r.pass, groups: r.groups.map((g) => ({ id: g.id, score: g.score })), answers: body.answers ?? {} });
    await c.get('store').createOnce(`i/sim/${u.id}/${invTs()}~${id}`, {}, { mock: m.id, total: r.total, pass: r.pass ? 1 : 0 });
  }
  return c.json({ ok: true, result: r });
});
