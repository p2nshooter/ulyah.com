/**
 * Halaman Kamus LUAJA: beranda kamus (pencarian + statistik), hasil pencarian, dan halaman satu kata.
 * Arti utama selalu dalam bahasa antarmuka; makna rinci per kelas kata, definisi ekabahasa, bentuk kata, sinonim dan
 * padanan menyusul di bawahnya.
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { fmtNum, t, type Key, type Lang } from '../lib/i18n.ts';
import { breadcrumbs } from './layout.ts';
import { scene } from './scene.ts';
import { ARTICLE, entryPath, KLANGS, meaningOf, type Entry, type KLang, type Meta } from '../kamus/reader.ts';

export const KLOCALE: Record<KLang, string> = { de: 'de-DE', en: 'en-GB', ja: 'ja-JP', id: 'id-ID' };
const EXAMPLE: Record<KLang, string> = { de: 'Haus', en: 'house', ja: '家', id: 'rumah' };
const TRY: Record<KLang, string[]> = {
  de: ['gehen', 'Freund', 'schön', 'Hauses', 'ging', 'Bank'],
  en: ['house', 'went', 'beautiful', 'take off', 'children'],
  ja: ['家', '食べる', 'ありがとう', 'たべる', '行った'],
  id: ['rumah', 'makan', 'indah', 'teman', 'belajar'],
};
export const kLangName = (L: Lang, k: KLang) => t(L, k === 'id' ? 'kamus.lang.id' : (`menu.${k}` as Key));

const POS_KEY: Record<string, string> = {
  noun: 'noun', verb: 'verb', adj: 'adj', adv: 'adv', pron: 'pron', prep: 'prep', postp: 'particle', conj: 'conj', intj: 'intj',
  num: 'num', det: 'det', article: 'article', particle: 'particle', phrase: 'phrase', prep_phrase: 'phrase', proverb: 'phrase',
  prefix: 'prefix', suffix: 'suffix', abbrev: 'abbrev', contraction: 'abbrev', counter: 'suffix', infix: 'suffix',
};
export const posLabel = (L: Lang, p: string) => t(L, `kamus.pos.${POS_KEY[p] ?? 'other'}` as Key);
const TAGS = new Set(['colloquial', 'informal', 'formal', 'archaic', 'obsolete', 'dated', 'slang', 'rare', 'transitive', 'intransitive', 'reflexive', 'separable', 'countable', 'uncountable', 'polite', 'humble', 'honorific', 'figuratively', 'idiomatic', 'godan', 'ichidan']);
const tagLabel = (L: Lang, tg: string) => (TAGS.has(tg) ? t(L, `kamus.tag.${tg}` as Key) : tg);

function searchBox(L: Lang, l: KLang, q = '', compact = false): Raw {
  return html`<form class="k-search${compact ? ' k-search-sm' : ''}" action="/kamus" method="get" role="search" data-k-search>
  <div class="k-tabs" role="radiogroup" aria-label="${t(L, 'kamus.langs')}">${KLANGS.map((k) => html`<label class="k-tab"><input type="radio" name="l" value="${k}" ${k === l ? raw('checked') : ''}><span><i class="flag-${k}"></i>${k === 'id' ? t(L, 'kamus.reverse') : kLangName(L, k)}</span></label>`)}</div>
  <div class="k-field"><input type="search" name="q" value="${q}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t(L, 'kamus.placeholder', { ex: EXAMPLE[l] })}" aria-label="${t(L, 'kamus.search')}" data-k-q lang="${l}" required maxlength="80"><button class="btn btn-primary" type="submit">${t(L, 'kamus.go')}</button>
  <ul class="k-suggest" role="listbox" hidden data-k-list></ul></div>
</form>`;
}

function hero(L: Lang, l: KLang, q: string, crumbs: [string, string][], h1?: Raw | string, lead?: string): Raw {
  return html`<section class="page-hero k-hero"><div class="scene">${raw(scene(l === 'id' ? 'id' : l, 'siang', { id: 'k-hero', seed: 7 }))}</div><div class="wrap page-hero-in">
  ${breadcrumbs(crumbs, L)}
  ${h1 ? html`<p class="eyebrow">${t(L, 'kamus.eyebrow')}</p><h1>${h1}</h1>` : ''}
  ${lead ? html`<p class="lead">${lead}</p>` : ''}
  ${searchBox(L, l, q, !h1)}
</div></section>`;
}

const sourcesCard = (L: Lang, meta: Meta | null) => html`<div class="card card-tint k-src"><h2>${t(L, 'kamus.source')}</h2>
  <p class="muted small">${t(L, 'kamus.sourceText')}</p>
  <ul class="src-list">${(meta?.sources ?? []).map((s) => html`<li><a href="${s.url}" rel="noopener" target="_blank">${s.name}</a> — ${s.licence}</li>`)}</ul></div>`;

export function kamusIndexPage(o: { lang: Lang; l: KLang; meta: Meta | null }): Raw {
  const L = o.lang, uiKey = L === 'id' ? 'id' : L === 'ja' ? 'ja' : 'en';
  const st = o.meta?.langs ?? {};
  const total = (k: 'entries' | 'forms' | 'id' | 'ja' | 'en') => KLANGS.reduce((n, x) => n + (st[x]?.[k] ?? 0), 0);
  return html`<link rel="stylesheet" href="/assets/kamus.css?v=1">
${hero(L, o.l, '', [[t(L, 'kamus.home'), '/kamus']], t(L, 'kamus.title'), t(L, 'kamus.lead'))}
<section class="section-tight"><div class="wrap">
  ${o.meta ? html`<div class="ribbon reveal">
    <div class="stat"><b data-count-to="${total('entries')}">${fmtNum(L, total('entries'))}</b><span>${t(L, 'kamus.stat.entries')}</span></div>
    <div class="stat"><b data-count-to="${total(uiKey)}">${fmtNum(L, total(uiKey))}</b><span>${t(L, 'kamus.stat.ui')}</span></div>
    <div class="stat"><b data-count-to="${total('forms')}">${fmtNum(L, total('forms'))}</b><span>${t(L, 'kamus.stat.forms')}</span></div>
  </div>` : html`<p class="notice">${t(L, 'kamus.notReady')}</p>`}
  <div class="k-langs">${KLANGS.map((k) => html`<div class="card k-lang reveal"><h2><i class="flag-${k}"></i> ${k === 'id' ? t(L, 'kamus.reverse') : kLangName(L, k)}</h2>
    ${st[k] ? html`<p class="muted small">${fmtNum(L, st[k]!.entries)} ${t(L, 'kamus.stat.entries')}</p>` : ''}
    <p class="k-try"><span class="muted small">${t(L, 'kamus.try')}</span> ${TRY[k].map((w) => html`<a class="chip" lang="${k}" href="/kamus?l=${k}&q=${encodeURIComponent(w)}">${w}</a>`)}</p></div>`)}</div>
  ${sourcesCard(L, o.meta)}
</div></section>
<script src="/assets/kamus.js?v=1" defer></script>`;
}

export function kamusResultsPage(o: { lang: Lang; l: KLang; q: string; ready: boolean; similar: Entry[] }): Raw {
  const L = o.lang, ui = L;
  return html`<link rel="stylesheet" href="/assets/kamus.css?v=1">
${hero(L, o.l, o.q, [[t(L, 'kamus.home'), '/kamus'], [t(L, 'kamus.results', { q: o.q }), `/kamus?l=${o.l}&q=${encodeURIComponent(o.q)}`]])}
<section class="section-tight"><div class="wrap k-wrap">
  ${!o.ready ? html`<p class="notice">${t(L, 'kamus.notReady')}</p>` : html`<div class="card"><p style="margin-top:0"><b>${t(L, 'kamus.notFound', { q: o.q, lang: kLangName(L, o.l) })}</b></p>
  ${o.similar.length ? html`<p class="muted">${t(L, 'kamus.suggest')}</p><ul class="k-list">${o.similar.map((e) => { const m = meaningOf(e, ui); return html`<li><a lang="${o.l}" href="${entryPath(o.l, e.w)}">${e.w}</a> <span class="muted">— ${m.m.slice(0, 3).join(' · ')}</span></li>`; })}</ul>` : ''}</div>`}
</div></section>
<script src="/assets/kamus.js?v=1" defer></script>`;
}

function headLine(L: Lang, l: KLang, e: Entry): Raw {
  const art = l === 'de' && e.g ? ARTICLE[e.g] : '';
  return html`<header class="k-head">
  <h1 lang="${l}">${art ? html`<span class="k-art k-art-${e.g}">${art}</span> ` : ''}${e.w}</h1>
  <p class="k-sub">
    ${e.ipa ? html`<span class="k-ipa">${e.ipa}</span>` : ''}
    ${e.r?.length && e.r[0] !== e.w ? html`<span class="k-read" lang="ja">${t(L, 'kamus.reading')}: ${e.r.join('・')}</span>` : ''}
    ${e.ro?.length ? html`<span class="k-ro">${e.ro.join(', ')}</span>` : ''}
    ${e.g ? html`<span class="pill">${t(L, `kamus.gender.${e.g}` as Key)}</span>` : ''}
    ${e.pl ? html`<span class="k-pl">${t(L, 'kamus.plural')}: <b lang="${l}">die ${e.pl}</b></span>` : ''}
    ${e.lv ? html`<span class="pill pill-lv">JLPT ${e.lv}</span>` : ''}
    <button class="btn btn-ghost btn-sm" type="button" data-say="${e.w}" data-lang="${KLOCALE[l]}">🔊 ${t(L, 'common.listen')}</button>
  </p></header>`;
}

function entryArticle(L: Lang, l: KLang, e: Entry, first: boolean): Raw {
  const mm = meaningOf(e, L, 6);
  const others = (['de', 'en', 'ja'] as KLang[]).filter((x) => e.to?.[x]?.length);
  return html`<article class="k-entry${first ? '' : ' k-entry-more'}">
  ${headLine(L, l, e)}
  <div class="k-mean card">
    <h2>${t(L, 'kamus.meaning')}</h2>
    <ol class="k-mlist">${mm.m.map((x) => html`<li lang="${mm.ml}">${x}</li>`)}</ol>
    ${mm.ml !== L ? html`<p class="muted small k-note">${t(L, 'kamus.fallbackNote')}</p>` : ''}
  </div>
  ${others.length ? html`<div class="card k-to"><h2>${t(L, 'kamus.to')}</h2>${others.map((x) => html`<p><span class="pill"><i class="flag-${x}"></i>${kLangName(L, x)}</span> ${e.to![x]!.map((w, i) => html`${i ? ', ' : ''}<a lang="${x}" href="${entryPath(x, w)}">${w}</a>`)}</p>`)}</div>` : ''}
  ${l === 'de' && e.d?.length ? html`<div class="card k-def"><h2>${t(L, 'kamus.defDe')}</h2><ol>${e.d.map((x) => html`<li lang="de">${x}</li>`)}</ol></div>` : ''}
  ${e.jd?.length && (L === 'ja' || l === 'ja') ? html`<div class="card k-def"><h2>${t(L, 'kamus.defJa')}</h2><ol>${e.jd.map((x) => html`<li lang="ja">${x}</li>`)}</ol></div>` : ''}
  ${e.idd?.length ? html`<div class="card k-def"><h2>${t(L, 'kamus.defId')}</h2><ol>${e.idd.map((x) => html`<li lang="id">${x}</li>`)}</ol></div>` : ''}
  ${e.b.some((b) => b.s.length) ? html`<section class="k-senses-wrap"><h2>${t(L, 'kamus.senses')}</h2>${L !== 'en' ? html`<p class="muted small">${t(L, 'kamus.sensesNote')}</p>` : ''}
    ${e.b.filter((b) => b.s.length || b.f?.length).map((b) => html`<div class="k-pos">
      <h3><span class="pill">${posLabel(L, b.p)}</span></h3>
      <ol class="k-senses">${b.s.map((s) => html`<li><span class="k-g" lang="en">${s.g}</span>${s.t?.length ? html` ${s.t.map((tg) => html`<span class="k-tag">${tagLabel(L, tg)}</span>`)}` : ''}
        ${s.x ? html`<blockquote class="k-ex"><span lang="${l}">${s.x[0]}</span> <button class="k-say" type="button" data-say="${s.x[0]}" data-lang="${KLOCALE[l]}" aria-label="${t(L, 'common.listen')}">🔊</button>${s.x[1] ? html`<small lang="en">${s.x[1]}</small>` : ''}</blockquote>` : ''}</li>`)}</ol>
      ${b.f?.length ? html`<details class="k-forms"><summary>${t(L, 'kamus.forms', { n: b.f.length })}</summary><table><tbody>${b.f.slice(0, 80).map(([f, tg]) => html`<tr><td lang="${l}">${f}</td><td class="muted small">${tg}</td></tr>`)}</tbody></table></details>` : ''}
    </div>`)}</section>` : ''}
  ${e.syn?.length ? html`<p class="k-syn"><b>${t(L, 'kamus.syn')}:</b> ${e.syn.map((w, i) => html`${i ? ' · ' : ''}<a lang="${l}" href="${entryPath(l, w)}">${w}</a>`)}</p>` : ''}
</article>`;
}

export function kamusEntryPage(o: { lang: Lang; l: KLang; word: string; entries: Entry[]; from?: string; meta: Meta | null }): Raw {
  const L = o.lang;
  return html`<link rel="stylesheet" href="/assets/kamus.css?v=1">
${hero(L, o.l, '', [[t(L, 'kamus.home'), '/kamus'], [kLangName(L, o.l), `/kamus?l=${o.l}`], [o.word, entryPath(o.l, o.word)]])}
<section class="section-tight"><div class="wrap k-wrap">
  ${o.from ? html`<p class="notice">${t(L, 'kamus.from', { q: o.from })} ${o.entries.map((e, i) => html`${i ? ', ' : ''}<a lang="${o.l}" href="${entryPath(o.l, e.w)}">${e.w}</a>`)}</p>` : ''}
  ${o.entries.map((e, i) => entryArticle(L, o.l, e, i === 0))}
  ${sourcesCard(L, o.meta)}
</div></section>
<script src="/assets/kamus.js?v=1" defer></script>`;
}
