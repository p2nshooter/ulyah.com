/** Halaman bank latihan soal: indeks per bahasa & jenjang, dan halaman pengerjaan paket (kunci tidak pernah ikut terkirim). */
import { html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { COURSE_META, COURSES, type Course } from '../data/model.ts';
import { t, UI_LOCALE, type Lang } from '../lib/i18n.ts';
import { icon, breadcrumbs } from './layout.ts';
import { publicSet, type PSet } from '../practice/types.ts';
import { practiceLevels, setsOf, levelName, totalQuestions, SETS } from '../practice/index.ts';
import { scene } from './scene.ts';
import { examLinks } from './exam.ts';

const flag = (c: Course) => html`<span class="pill pill-flag"><i class="flag-${c}"></i>${COURSE_META[c].native}</span>`;

function setCard(s: PSet, unlocked: boolean, L: Lang, done?: { pct: number }): Raw {
  const open = s.free || unlocked;
  return html`<a class="card lift pset ${s.kind}" href="/latihan/${s.id}">
    <div class="row between"><span class="pill ${s.kind === 'simulasi' ? 'pill-info' : 'pill-line'}">${s.kind === 'simulasi' ? t(L, 'practice.mock') : t(L, 'practice.drill')}</span>${open ? (s.free ? html`<span class="pill pill-gold">${t(L, 'common.free')}</span>` : html`<span class="pill pill-ok">${t(L, 'common.open')}</span>`) : html`<span class="pill pill-line">${icon('gembok')} ${t(L, 'common.member')}</span>`}</div>
    <h3>${s.title}</h3>
    <p class="muted small" style="margin:0">${s.examName}</p>
    <p class="small" style="margin:0;color:var(--ink-2)" lang="id">${s.desc}</p>
    <div class="row between small muted" style="margin-top:auto"><span>${t(L, 'common.questions', { n: s.questions.length })} · ${t(L, 'common.minutes', { n: s.minutes })}</span>${done ? html`<span class="pill ${done.pct >= 0.75 ? 'pill-ok' : 'pill-warn'}">${t(L, 'practice.best', { p: Math.round(done.pct * 100) })}</span>` : ''}</div>
  </a>`;
}

export function practiceIndexPage(o: { course: Course; unlocked: boolean; best: Record<string, number>; lang: Lang }): Raw {
  const L = o.lang, m = COURSE_META[o.course], name = m.names[L];
  const levels = practiceLevels(o.course).filter((l) => setsOf(o.course, l.id).length);
  return html`
<section class="page-hero"><div class="scene">${raw(scene(o.course, 'siang', { id: 'lat-hero', seed: 7 }))}</div><div class="wrap page-hero-in">
  ${breadcrumbs([[t(L, 'menu.practice'), '/latihan'], [name, `/latihan?bahasa=${o.course}`]], L)}
  <p class="eyebrow">${t(L, 'practice.eyebrow')}</p>
  <h1>${t(L, 'practice.title', { name })}</h1>
  <p class="lead">${t(L, 'practice.lead')}</p>
  <nav class="tabs" aria-label="${t(L, 'practice.langs')}">${COURSES.map((c) => html`<a href="/latihan?bahasa=${c}" ${c === o.course ? raw('aria-current="page"') : ''}>${COURSE_META[c].names[L]}</a>`)}</nav>
</div></section>
<section class="section-tight"><div class="wrap">
  <div class="ribbon reveal" style="margin-bottom:28px"><div class="stat"><b>${SETS.length}</b><span>${t(L, 'practice.stat.sets')}</span></div><div class="stat"><b>${totalQuestions().toLocaleString(UI_LOCALE[L])}</b><span>${t(L, 'practice.stat.q')}</span></div><div class="stat"><b>100%</b><span>${t(L, 'practice.stat.keys')}</span></div><div class="stat"><b>${icon('cek')}</b><span>${t(L, 'practice.stat.predict')}</span></div></div>
  ${L === 'id' ? '' : html`<p class="notice" style="margin-bottom:22px">${t(L, 'content.idNotice')}</p>`}
  ${examLinks(o.course, undefined, L)}
  ${levels.map((l) => {
    const sets = setsOf(o.course, l.id);
    const sim = sets.filter((s) => s.kind === 'simulasi');
    const dr = sets.filter((s) => s.kind === 'drill');
    const card = (s: PSet) => setCard(s, o.unlocked, L, o.best[s.id] !== undefined ? { pct: o.best[s.id]! } : undefined);
    return html`<div class="shelf-head reveal" id="${l.id}"><h2>${flag(o.course)} ${l.name}</h2><span class="muted small">${t(L, 'common.packs', { n: sets.length })} · ${t(L, 'common.questions', { n: sets.reduce((n, s) => n + s.questions.length, 0) })}</span></div>
    ${sim.length ? html`<div class="grid g3">${sim.map(card)}</div>` : ''}
    ${dr.length ? html`<details class="drills"><summary>${t(L, 'practice.drills', { n: dr.length, q: t(L, 'common.questions', { n: dr.reduce((n, s) => n + s.questions.length, 0) }) })}</summary><div class="grid g4" style="margin-top:14px">${dr.map(card)}</div></details>` : ''}`;
  })}
  <div class="notice" style="margin-top:28px">${t(L, 'practice.notice')}</div>
</div></section>`;
}

export function practiceSetPage(o: { set: PSet; unlocked: boolean; loggedIn: boolean; nextId?: string; lang: Lang }): Raw {
  const L = o.lang, s = o.set, m = COURSE_META[s.course], name = m.names[L];
  const open = s.free || o.unlocked;
  const crumbs = breadcrumbs([[t(L, 'menu.practice'), '/latihan'], [name, `/latihan?bahasa=${s.course}`], [s.title, `/latihan/${s.id}`]], L);
  const q = t(L, 'common.questions', { n: s.questions.length });
  if (!open) {
    const pub = publicSet(s);
    return html`<section class="section"><div class="wrap-narrow">${crumbs}
      <p class="eyebrow">${s.examName}</p><h1 style="font-size:var(--fs-5)">${s.title}</h1><p class="lead" lang="id">${s.desc}</p>
      <div class="card card-tint" style="margin:20px 0"><div class="row" style="gap:16px;align-items:flex-start"><span class="icon-tile">${icon('gembok')}</span><div><h3 style="margin:0 0 6px">${t(L, 'practice.memberSet', { name })}</h3><p style="margin:0">${t(L, 'practice.memberText', { q, name })}</p><div class="row" style="margin-top:14px"><a class="btn btn-gold" href="/harga">${t(L, 'lesson.viewPlans')}</a>${o.loggedIn ? '' : html`<a class="btn btn-ghost" href="/masuk?lanjut=/latihan/${s.id}">${t(L, 'practice.memberLogin')}</a>`}</div></div></div></div>
      <h2 style="font-size:var(--fs-4)">${t(L, 'practice.sample')}</h2>
      <div class="ex-list">${pub.questions.slice(0, 2).map((x) => html`<div class="exercise"><div class="q"><small>${x.section}</small>${x.stem}</div><div class="opts">${x.options.map((op, i) => html`<div class="opt"><span class="k">${String.fromCharCode(65 + i)}</span>${op}</div>`)}</div></div>`)}</div>
    </div></section>`;
  }
  return html`<section class="section-tight practice" data-practice="${s.id}" data-lang="${m.locale}">
  <div class="wrap">${crumbs}
    <div class="practice-head">
      <div><p class="eyebrow">${s.examName}</p><h1>${s.title}</h1><p class="muted" style="margin:0">${q} · ${t(L, 'common.minutes', { n: s.minutes })} · <span lang="id">${s.desc}</span></p></div>
      <div class="practice-meter"><div class="ring" style="--p:0" data-ring><span data-count>0/${s.questions.length}</span></div><div class="small muted">${t(L, 'practice.answered')}</div><div class="timer" data-timer data-minutes="${s.minutes}">${s.minutes}:00</div></div>
    </div>
    ${L === 'id' ? '' : html`<p class="notice" style="margin-bottom:16px">${t(L, 'content.idNotice')}</p>`}
    ${o.loggedIn ? '' : html`<div class="notice" style="margin-bottom:16px">${raw(t(L, 'practice.guest', { login: `<a href="/masuk?lanjut=/latihan/${s.id}">${t(L, 'practice.guest.login')}</a>` }))}</div>`}
    <div class="practice-body">
      <aside class="qnav" aria-label="${t(L, 'practice.qnav')}"><div class="qnav-grid" data-qnav></div><p class="small muted" style="margin:10px 0 0">${t(L, 'practice.keyHint')}</p></aside>
      <div>
        <div class="ex-list" data-questions></div>
        <div class="submit-bar" data-submitbar><span data-left>${t(L, 'practice.left0')}</span><button class="btn btn-gold btn-lg" type="button" data-submit disabled>${t(L, 'practice.submit')}</button></div>
        <div data-result hidden></div>
      </div>
    </div>
  </div>
  ${jsonScript('pset', publicSet(s))}
  ${jsonScript('pmeta', { next: o.nextId ?? null, loggedIn: o.loggedIn, level: levelName(s.course, s.level), course: name })}
</section>
<script src="/assets/latihan.js?v=3" defer></script>`;
}
