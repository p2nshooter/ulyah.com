/**
 * Rute Kamus LUAJA: /kamus (beranda & pencarian), /kamus/:bahasa/:kata (halaman kata, terindeks), dan API ringkas untuk
 * pembaca pustaka (/api/kamus/cari, /awal, /pecah). Data dibaca dari paket di R2 MEDIA (src/kamus/reader.ts).
 */
import { Hono } from 'hono';
import type { HonoEnv, Ctx } from '../lib/session.ts';
import { base, render } from '../lib/render.ts';
import { t, type Lang } from '../lib/i18n.ts';
import { limit } from '../lib/ratelimit.ts';
import { getSite } from '../data/settings.ts';
import { crumbs } from '../pages/layout.ts';
import { kamusEntryPage, kamusIndexPage, kamusResultsPage, kLangName } from '../pages/kamus.ts';
import { entryPath, isKLang, Kamus, keyOf, meaningOf, ARTICLE, type Entry, type KLang, type UiLang } from '../kamus/reader.ts';

export const kamus = new Hono<HonoEnv>();
const L = (c: Ctx): Lang => c.get('lang');
const defaultK = (lang: Lang): KLang => (lang === 'ja' ? 'en' : 'de');
const uiOf = (c: Ctx): UiLang => { const q = c.req.query('ui'); return q === 'id' || q === 'en' || q === 'ja' ? q : L(c); };
const ip = (c: Ctx) => c.req.header('cf-connecting-ip') ?? 'local';

/** Ringkasan entri untuk popup pembaca. */
function brief(l: KLang, e: Entry, ui: UiLang) {
  const m = meaningOf(e, ui, 6);
  return { w: e.w, ipa: e.ipa, art: l === 'de' && e.g ? ARTICLE[e.g] : undefined, pl: e.pl, r: e.r?.[0], lv: e.lv, pos: e.b.map((b) => b.p).slice(0, 3), m: m.m, ml: m.ml, url: entryPath(l, e.w) };
}

kamus.get('/kamus', async (c) => {
  const lang = L(c), site = await getSite(c.get('store'));
  const lq = c.req.query('l');
  const l: KLang = isKLang(lq) ? lq : defaultK(lang);
  const q = (c.req.query('q') ?? '').trim().slice(0, 80);
  const k = await Kamus.open(c.env.MEDIA);
  if (q) {
    if (!(await limit(c.env, `kamus:${ip(c)}`, 240, 60))) return c.text('Too many requests', 429);
    const hit = k ? await k.lookup(l, q, 1, lang) : { entries: [] };
    if (hit.entries.length) {
      const w = hit.entries[0].w;
      return c.redirect(entryPath(l, w) + (hit.from ? `?dari=${encodeURIComponent(q)}` : ''), 302);
    }
    const similar = k ? await k.prefix(l, q.slice(0, Math.max(2, Math.ceil(q.length * 0.6))), 12) : [];
    return render(c, {
      path: `/kamus?l=${l}&q=${encodeURIComponent(q)}`, site, theme: l === 'id' ? 'id' : l, active: 'kamus', noindex: true,
      title: `${t(lang, 'kamus.results', { q })} | ${site.name}`, desc: t(lang, 'kamus.index.desc'),
      body: kamusResultsPage({ lang, l, q, ready: !!k, similar }),
    }, 404);
  }
  return render(c, {
    path: lq ? `/kamus?l=${l}` : '/kamus', site, theme: l === 'id' ? 'id' : l, active: 'kamus',
    title: t(lang, 'kamus.index.title', { site: site.name }), desc: t(lang, 'kamus.index.desc'),
    body: kamusIndexPage({ lang, l, meta: k?.info ?? null }),
    jsonLd: [crumbs(base(c), [[t(lang, 'kamus.home'), '/kamus']], lang)],
  });
});

kamus.get('/kamus/:l/:w', async (c) => {
  const lang = L(c), l = c.req.param('l');
  if (!isKLang(l)) return c.notFound();
  const word = decodeURIComponent(c.req.param('w')).normalize('NFC').slice(0, 80);
  const k = await Kamus.open(c.env.MEDIA);
  const site = await getSite(c.get('store'));
  if (!k) {
    return render(c, { path: entryPath(l, word), site, active: 'kamus', noindex: true, title: `${word} | ${site.name}`, desc: t(lang, 'kamus.index.desc'), body: kamusResultsPage({ lang, l, q: word, ready: false, similar: [] }) }, 404);
  }
  if (!(await limit(c.env, `kamus:${ip(c)}`, 240, 60))) return c.text('Too many requests', 429);
  let entries = await k.exact(l, keyOf(word));
  let from: string | undefined;
  if (entries.length) entries.sort((a, b) => Number(b.w === word) - Number(a.w === word));
  else {
    const hit = await k.lookup(l, word, 4, lang);
    entries = hit.entries;
    from = hit.from ?? word;
  }
  if (!entries.length) {
    const similar = await k.prefix(l, word.slice(0, Math.max(2, Math.ceil(word.length * 0.6))), 12);
    return render(c, { path: entryPath(l, word), site, active: 'kamus', noindex: true, title: `${word} | ${site.name}`, desc: t(lang, 'kamus.index.desc'), body: kamusResultsPage({ lang, l, q: word, ready: true, similar }) }, 404);
  }
  const dari = c.req.query('dari');
  if (dari && !from) from = dari.slice(0, 80);
  const main = entries[0];
  const mm = meaningOf(main, lang, 3);
  const langName = kLangName(lang, l);
  const url = `${base(c)}${entryPath(l, main.w)}`;
  return render(c, {
    path: entryPath(l, main.w), site, theme: l === 'id' ? 'id' : l, active: 'kamus', noindex: !!from && !entries.some((e) => e.w === word),
    title: t(lang, 'kamus.page.title', { w: main.w, lang: langName, site: site.name }),
    desc: t(lang, 'kamus.page.desc', { w: main.w, lang: langName, m: mm.m.join(', ') }).slice(0, 158),
    body: kamusEntryPage({ lang, l, word, entries, from, meta: k.info }),
    jsonLd: [
      crumbs(base(c), [[t(lang, 'kamus.home'), '/kamus'], [langName, `/kamus?l=${l}`], [main.w, entryPath(l, main.w)]], lang),
      { '@context': 'https://schema.org', '@type': 'DefinedTerm', name: main.w, description: mm.m.join('; '), inLanguage: l, url, inDefinedTermSet: { '@type': 'DefinedTermSet', name: `${t(lang, 'kamus.eyebrow')} — ${langName}`, url: `${base(c)}/kamus?l=${l}` } },
    ],
  });
});

/* ── API untuk pembaca & isian otomatis ───────────────────────────────── */
const api = async (c: Ctx, fn: (k: Kamus, l: KLang, q: string) => Promise<unknown>) => {
  const l = c.req.query('l') ?? 'de', q = (c.req.query('q') ?? '').trim().slice(0, 120);
  if (!isKLang(l) || !q) return c.json({ ok: false, error: 'bad-request' }, 400);
  if (!(await limit(c.env, `kamusapi:${ip(c)}`, 600, 60))) return c.json({ ok: false, error: 'rate' }, 429);
  const k = await Kamus.open(c.env.MEDIA);
  if (!k) return c.json({ ok: false, error: 'not-ready' }, 503);
  const body = await fn(k, l, q);
  return c.json({ ok: true, ver: k.info.ver, ...(body as object) }, 200, { 'cache-control': 'public, max-age=3600' });
};

kamus.get('/api/kamus/cari', (c) => api(c, async (k, l, q) => {
  const hit = await k.lookup(l, q, 3, uiOf(c));
  return { q, l, from: hit.from, hits: hit.entries.map((e) => brief(l, e, uiOf(c))) };
}));

kamus.get('/api/kamus/awal', (c) => api(c, async (k, l, q) => ({ items: (await k.prefix(l, q, 10)).map((e) => ({ w: e.w, m: meaningOf(e, uiOf(c), 2).m.join(' · ') })) })));

kamus.get('/api/kamus/pecah', (c) => api(c, async (k, _l, q) => {
  const ui = uiOf(c);
  return {
    tokens: (await k.segment(q)).map((x) => {
      if (!x.e) return { t: x.t };
      const mm = meaningOf(x.e, ui, 6);
      return { t: x.t, w: x.w, r: x.e.r?.[0], lv: x.e.lv, m: mm.m, ml: mm.ml, url: entryPath('ja', x.e.w) };
    }),
  };
}));
