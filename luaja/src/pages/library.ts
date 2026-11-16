/**
 * Pustaka interaktif: rak per bahasa & jenjang, halaman buku (sampul, daftar isi, sumber & lisensi) dan cangkang pembaca.
 * Isi halaman buku dimuat pembaca (`/assets/pustaka.js`) dari `/p/b/<id>.json` — Worker memutuskan pratinjau atau penuh.
 */
import { html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { COURSE_META, COURSES, type Course } from '../data/model.ts';
import { fmtNum, t, type Key, type Lang } from '../lib/i18n.ts';
import { breadcrumbs, icon } from './layout.ts';
import { scene } from './scene.ts';
import { booksOf, coverStyle, libStats, PREVIEW_PAGES, sources, type BookMeta } from '../library/index.ts';

const CAT_ICON: Record<string, string> = { kursus: 'buku', grammatik: 'tangga', wortschatz: 'kartu', kalimat: 'suara', video: 'video', arbeitsbuch: 'ujian', bacaan: 'buku', kamus: 'dunia' };
export const catLabel = (L: Lang, cat: string) => t(L, `lib.cat.${cat}` as Key);
export const levelLabel = (course: Course, level: string) => COURSE_META[course].levels.find((l) => l.id === level)?.name ?? level.toUpperCase();

/** Sampul buku: dibuat dengan CSS (warna per bahasa & kategori), judul asli, jenjang, ikon kategori. */
export function cover(b: BookMeta, L: Lang, size: 'sm' | 'lg' = 'sm'): Raw {
  return html`<div class="bk-cover bk-${size}" style="${coverStyle(b)}" aria-hidden="true">
    <span class="bk-spine"></span>
    <span class="bk-top"><i class="flag-${b.lang}"></i>${levelLabel(b.lang, b.level)}</span>
    <span class="bk-icon">${icon(CAT_ICON[b.cat] ?? 'buku')}</span>
    <span class="bk-title">${b.title.replace(/^(Deutsch im Blick|Grimm Grammar) · /, '')}</span>
    <span class="bk-series">${b.title.includes(' · ') && /^(Deutsch im Blick|Grimm Grammar)/.test(b.title) ? b.title.split(' · ')[0] : catLabel(L, b.cat)}</span>
    <span class="bk-brand">LUAJA · ${catLabel(L, b.cat)}</span>
  </div>`;
}

function chips(b: BookMeta, L: Lang): Raw {
  return html`<span class="bk-chips">
    <span>${t(L, 'lib.pages', { n: fmtNum(L, b.pages) })}</span>
    ${b.exercises ? html`<span>${t(L, 'lib.exercises', { n: fmtNum(L, b.exercises) })}</span>` : ''}
    ${b.media ? html`<span>${t(L, 'lib.media', { n: fmtNum(L, b.media) })}</span>` : ''}
    ${b.words ? html`<span>${t(L, 'lib.words', { n: fmtNum(L, b.words) })}</span>` : ''}
    ${b.sentences ? html`<span>${t(L, 'lib.sentences', { n: fmtNum(L, b.sentences) })}</span>` : ''}
  </span>`;
}

function bookCard(b: BookMeta, L: Lang): Raw {
  return html`<a class="bk-card lift reveal" href="/pustaka/${b.id}">
    ${cover(b, L)}
    <span class="bk-meta"><span class="pill pill-line">${catLabel(L, b.cat)}</span><b>${b.title}</b><small>${b.sub}</small>${chips(b, L)}</span>
  </a>`;
}

export function libraryIndexPage(o: { course: Course; level?: string; lang: Lang }): Raw {
  const L = o.lang, m = COURSE_META[o.course], name = m.names[L];
  const all = booksOf(o.course);
  const levels = m.levels.filter((l) => all.some((b) => b.level === l.id));
  const shown = o.level ? levels.filter((l) => l.id === o.level) : levels;
  const st = libStats(o.course);
  const q = (lv?: string) => `/pustaka?bahasa=${o.course}${lv ? `&jenjang=${lv}` : ''}`;
  return html`<link rel="stylesheet" href="/assets/pustaka.css?v=3">
<section class="page-hero"><div class="scene">${raw(scene(o.course, 'siang', { id: 'lib-hero', seed: 11 }))}</div><div class="wrap page-hero-in">
  ${breadcrumbs([[t(L, 'lib.home'), '/pustaka'], [name, q()]], L)}
  <p class="eyebrow">${t(L, 'lib.eyebrow')}</p>
  <h1>${t(L, 'lib.title', { name })}</h1>
  <p class="lead">${t(L, 'lib.lead')}</p>
  <nav class="tabs" aria-label="${t(L, 'lib.langs')}">${COURSES.map((c) => html`<a href="/pustaka?bahasa=${c}" ${c === o.course ? raw('aria-current="page"') : ''}>${COURSE_META[c].names[L]}</a>`)}</nav>
</div></section>
<section class="section-tight"><div class="wrap">
  <div class="ribbon reveal" style="margin-bottom:22px">
    <div class="stat"><b data-count-to="${st.books}">${fmtNum(L, st.books)}</b><span>${t(L, 'lib.stat.books')}</span></div>
    <div class="stat"><b data-count-to="${st.pages}">${fmtNum(L, st.pages)}</b><span>${t(L, 'lib.stat.pages')}</span></div>
    ${st.exercises ? html`<div class="stat"><b data-count-to="${st.exercises}">${fmtNum(L, st.exercises)}</b><span>${t(L, 'lib.stat.ex')}</span></div>` : ''}
    ${st.media ? html`<div class="stat"><b data-count-to="${st.media}">${fmtNum(L, st.media)}</b><span>${t(L, 'lib.stat.media')}</span></div>` : ''}
    ${st.sentences ? html`<div class="stat"><b data-count-to="${st.sentences}">${fmtNum(L, st.sentences)}</b><span>${t(L, 'lib.stat.sentences')}</span></div>` : ''}
  </div>
  <div class="chip-row" role="group" aria-label="${t(L, 'lib.levelAll')}">
    <a class="chip" href="${q()}" ${!o.level ? raw('aria-current="true"') : ''}>${t(L, 'lib.levelAll')}</a>
    ${levels.map((l) => html`<a class="chip" href="${q(l.id)}" ${o.level === l.id ? raw('aria-current="true"') : ''}>${l.name}</a>`)}
  </div>
  <p class="notice" style="margin:18px 0 8px">${t(L, 'lib.langNote')}</p>
  ${shown.length ? shown.map((l) => {
    const list = all.filter((b) => b.level === l.id);
    return html`<div class="shelf-head reveal" id="${l.id}"><h2><span class="pill pill-flag"><i class="flag-${o.course}"></i>${m.native}</span> ${l.name}</h2><span class="muted small">${t(L, 'lib.pages', { n: fmtNum(L, list.reduce((n, b) => n + b.pages, 0)) })} · ${list.length} ${t(L, 'lib.stat.books')}</span></div>
    <div class="bk-grid">${list.map((b) => bookCard(b, L))}</div>`;
  }) : html`<div class="card" style="margin-top:20px"><p style="margin:0">${t(L, 'lib.empty')}</p></div>`}
  <div class="card card-tint" style="margin-top:34px"><h2 style="font-size:var(--fs-4);margin-top:0">${t(L, 'lib.licence')}</h2>
    <ul class="src-list">${sources().filter((s) => all.some((b) => b.source === s.source)).map((s) => html`<li><a href="${s.url}" rel="noopener" target="_blank">${s.source}</a> — <a href="${s.licenceUrl}" rel="noopener license" target="_blank">${s.licence}</a></li>`)}</ul>
  </div>
</div></section>`;
}

export function bookPage(o: { book: BookMeta; open: boolean; lastPage?: number; lang: Lang }): Raw {
  const L = o.lang, b = o.book, m = COURSE_META[b.lang], name = m.names[L];
  const related = booksOf(b.lang, b.level).filter((x) => x.id !== b.id).slice(0, 8);
  const start = o.lastPage && o.lastPage > 0 ? o.lastPage : 0;
  return html`<link rel="stylesheet" href="/assets/pustaka.css?v=3">
<section class="section-tight book-hero"><div class="wrap">
  ${breadcrumbs([[t(L, 'lib.home'), '/pustaka'], [name, `/pustaka?bahasa=${b.lang}`], [levelLabel(b.lang, b.level), `/pustaka?bahasa=${b.lang}&jenjang=${b.level}`], [b.title, `/pustaka/${b.id}`]], L)}
  <div class="book-head">
    <div class="book-cover-wrap" data-tilt>${cover(b, L, 'lg')}</div>
    <div>
      <p class="eyebrow">${catLabel(L, b.cat)} · ${name} ${levelLabel(b.lang, b.level)}</p>
      <h1 style="font-size:var(--fs-6)">${b.title}</h1>
      <p class="lead" style="margin-top:0">${b.sub}</p>
      <p lang="id">${b.about}</p>
      ${chips(b, L)}
      <div class="row" style="margin-top:20px;gap:12px;flex-wrap:wrap">
        <a class="btn btn-gold btn-lg" href="/baca/${b.id}${start ? `?h=${start + 1}` : ''}">${icon('buku')} ${start ? t(L, 'lib.continue', { n: start + 1 }) : t(L, 'lib.read')}</a>
        ${o.open ? html`<span class="pill pill-ok">${icon('cek')} ${t(L, 'lib.open')}</span>` : html`<span class="pill pill-gold">${t(L, 'lib.preview', { n: PREVIEW_PAGES })}</span>`}
      </div>
      ${o.open ? '' : html`<p class="small muted" style="margin:10px 0 0">${t(L, 'lib.memberAll', { n: fmtNum(L, b.pages), name })} <a href="/harga">${t(L, 'js.lib.join')}</a></p>`}
    </div>
  </div>
</div></section>
<section class="section-tight"><div class="wrap book-body">
  <div class="card">
    <h2 style="font-size:var(--fs-4);margin-top:0">${t(L, 'lib.toc')}</h2>
    <ol class="toc">${b.toc.map(([title, page]) => html`<li><a href="/baca/${b.id}?h=${page + 1}"><span>${title}</span><span class="toc-dots"></span><span class="toc-pg">${page + 1}</span></a></li>`)}</ol>
    ${b.chapters > b.toc.length ? html`<p class="small muted">… ${t(L, 'lib.chapters', { n: b.chapters })}</p>` : ''}
  </div>
  <aside class="stack">
    <div class="card card-tint"><h3 style="margin-top:0">${t(L, 'lib.licence')}</h3>
      <p class="small" style="margin:0 0 8px">${t(L, 'lib.licenceText', { source: b.source, licence: b.licence })}</p>
      <p class="small" style="margin:0"><a href="${b.sourceUrl}" rel="noopener" target="_blank">${b.author}</a> · <a href="${b.licenceUrl}" rel="noopener license" target="_blank">${b.licence}</a></p>
    </div>
    ${related.length ? html`<div class="card"><h3 style="margin-top:0">${t(L, 'lib.related')}</h3><ul class="rel-list">${related.map((x) => html`<li><a href="/pustaka/${x.id}">${cover(x, L)}<span><b>${x.title}</b><small>${t(L, 'lib.pages', { n: x.pages })}</small></span></a></li>`)}</ul></div>` : ''}
  </aside>
</div></section>`;
}

/** Cangkang pembaca: isi halaman dirender skrip dari JSON buku; tanpa iklan, tanpa indeks. */
export function readerPage(o: { book: BookMeta; open: boolean; start: number; loggedIn: boolean; xp: number; streak: number; lang: Lang }): Raw {
  const L = o.lang, b = o.book, m = COURSE_META[b.lang];
  return html`<link rel="stylesheet" href="/assets/pustaka.css?v=3"><section class="reader" data-reader>
  <div class="rd-bar">
    <a class="rd-back" href="/pustaka/${b.id}" aria-label="${t(L, 'lib.toc')}">${icon('panah')}</a>
    <div class="rd-title"><b>${b.title}</b><span data-pg-label>${t(L, 'js.lib.loading')}</span></div>
    <div class="rd-tools">
      <button type="button" class="rd-btn" data-read title="${t(L, 'js.lib.readPage')}">${icon('suara')}<span>${t(L, 'js.lib.readPage')}</span></button>
      <button type="button" class="rd-btn" data-hide-tr aria-pressed="false" title="${t(L, 'js.lib.hideTr')}">${icon('kartu')}<span>${t(L, 'js.lib.hideTr')}</span></button>
      <button type="button" class="rd-btn" data-toc-open title="${t(L, 'lib.toc')}">${icon('menu')}<span>${t(L, 'lib.toc')}</span></button>
      <span class="rd-xp" title="${t(L, 'lib.xp')}">⭐ <b data-xp>${o.xp}</b>${o.streak ? html` · 🔥 <b>${o.streak}</b>` : ''}</span>
    </div>
    <div class="rd-progress"><i data-progress style="--p:0%"></i></div>
  </div>
  <div class="rd-stage">
    <article class="rd-page" data-page lang="${b.lang}" aria-live="polite"><p class="muted">${t(L, 'js.lib.loading')}</p></article>
  </div>
  <nav class="rd-nav">
    <button type="button" class="btn btn-ghost" data-prev>← ${t(L, 'js.lib.prev')}</button>
    <label class="rd-goto"><span class="sr-only">${t(L, 'js.lib.goto')}</span><input type="number" min="1" max="${b.pages}" value="${o.start + 1}" data-goto inputmode="numeric"> / ${b.pages}</label>
    <button type="button" class="btn btn-gold" data-next>${t(L, 'js.lib.next')} →</button>
  </nav>
  <dialog class="rd-toc" data-toc><form method="dialog"><h2>${t(L, 'lib.toc')}</h2><ol>${b.toc.map(([title, page]) => html`<li><button type="submit" value="${page}" data-jump="${page}"><span>${title}</span><span class="toc-pg">${page + 1}</span></button></li>`)}</ol><button class="btn btn-ghost" value="close">✕</button></form></dialog>
  <div class="rd-pop" data-pop hidden></div>
  <div class="rd-toast" data-rd-toast hidden></div>
  ${jsonScript('book', { id: b.id, lang: b.lang, locale: m.locale, pages: b.pages, toc: b.toc, start: o.start, open: o.open, loggedIn: o.loggedIn, preview: PREVIEW_PAGES })}
</section>
<script src="/assets/pustaka.js?v=4" defer></script>`;
}
