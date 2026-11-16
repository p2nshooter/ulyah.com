/**
 * Halaman jenjang (modul & pelajaran) dan halaman pelajaran 10 langkah, dengan antarmuka tiga bahasa.
 * Kunci latihan/kuis tidak pernah ikut terkirim. Urutan berlaku: pelajaran terbuka bila gratis, atau member dan pelajaran
 * sebelumnya lulus (kuis ≥ 80 %); pengelola selalu terbuka.
 */
import { html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { renderMarkdown } from '../lib/markdown.ts';
import { COURSE_META, type Course } from '../data/model.ts';
import { t, tri, type Lang } from '../lib/i18n.ts';
import { icon, breadcrumbs } from './layout.ts';
import { clientLesson, type Lesson } from '../course/schema.ts';
import { getLesson, modulesOf, OUTLINE } from '../course/index.ts';
import { setsOf } from '../practice/index.ts';
import { scene, autoMood } from './scene.ts';
import type { Progress } from '../data/progress.ts';

const STEP_KEYS = ['lesson.step.1', 'lesson.step.2', 'lesson.step.3', 'lesson.step.4', 'lesson.step.5', 'lesson.step.6', 'lesson.step.7', 'lesson.step.8', 'lesson.step.9', 'lesson.step.10'] as const;

/** Status buka sebuah pelajaran untuk pengunjung ini. */
export type LessonState = 'free' | 'open' | 'passed' | 'seq' | 'member';

export function levelPage(o: { course: Course; level: string; unlocked: boolean; progress?: Progress; lang: Lang; state: (code: string) => LessonState }): Raw {
  const L = o.lang, m = COURSE_META[o.course], name = m.names[L];
  const lv = m.levels.find((l) => l.id === o.level)!;
  const mods = modulesOf(o.course, o.level);
  const outline = OUTLINE[`${o.course}-${o.level}`] ?? [];
  const sets = setsOf(o.course, o.level);
  const pill = (s: LessonState) => s === 'free' ? html`<span class="pill pill-gold">${t(L, 'common.free')}</span>`
    : s === 'passed' ? html`<span class="pill pill-ok">${icon('cek')} ${t(L, 'common.passed')}</span>`
      : s === 'open' ? html`<span class="pill pill-line">${t(L, 'common.start')}</span>`
        : s === 'seq' ? html`<span class="pill pill-line" title="${t(L, 'level.locked.seq')}">${icon('gembok')} ${t(L, 'level.locked.seq')}</span>`
          : html`<span class="pill pill-line">${icon('gembok')} ${t(L, 'common.member')}</span>`;
  return html`
<section class="page-hero"><div class="scene">${raw(scene(o.course, autoMood(o.course), { id: 'lv-hero', seed: 5 }))}</div><div class="wrap page-hero-in">
  ${breadcrumbs([[name, `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`]], L)}
  <p class="eyebrow">${name} · ${m.native}</p>
  <h1>${name} ${lv.name}</h1>
  <p class="lead">${t(L, 'level.lead', { sub: tri(L, lv.sub), hours: tri(L, lv.hours) })}</p>
</div></section>
<section class="section-tight"><div class="wrap">
  ${L === 'id' ? '' : html`<p class="notice" style="margin-bottom:18px">${t(L, 'content.idNotice')}</p>`}
  ${mods.length ? mods.map((mod) => html`<div class="module card reveal">
    <div class="row between"><div><p class="eyebrow" style="margin:0">${t(L, 'common.module')} ${mod.n}</p><h2 style="font-size:var(--fs-4);margin:4px 0">${mod.title} <span class="muted italic serif" style="font-weight:400">· ${mod.native}</span></h2></div><span class="pill pill-info">${t(L, 'common.lessons', { n: mod.lessons.length })}</span></div>
    <p class="muted" style="margin:0 0 6px"><b>${t(L, 'level.focus')}</b> ${mod.focus}</p><p class="muted" style="margin:0 0 14px"><b>${t(L, 'level.outcome')}</b> ${mod.outcome}</p>
    <ol class="lesson-list">${mod.lessons.map((code) => { const l = getLesson(code)!; const st = o.state(code); return html`<li><a href="/belajar/${code}" class="${st === 'passed' ? 'done' : ''}"><span class="num">${l.index}</span><span class="t"><b>${l.title}</b><small>${l.native} · ${t(L, 'common.minutes', { n: l.minutes })}</small></span>${pill(st)}</a></li>`; })}</ol>
  </div>`) : html`<div class="notice">${t(L, 'level.empty', { level: lv.name })}</div>`}
  ${outline.length > mods.length ? html`<div class="card reveal" style="margin-top:18px"><h3 style="margin-top:0">${t(L, 'level.map', { level: lv.name })}</h3><ol class="outline">${outline.map((x) => html`<li class="${mods.some((mm) => mm.n === x.n) ? 'live' : ''}"><b>${t(L, 'common.module')} ${x.n}</b> ${x.title} <span class="muted">· ${x.native}</span>${mods.some((mm) => mm.n === x.n) ? html` <span class="pill pill-ok">${t(L, 'level.available')}</span>` : html` <span class="pill pill-line">${t(L, 'level.coming')}</span>`}</li>`)}</ol></div>` : ''}
  ${sets.length ? html`<div class="cta-band reveal" style="margin-top:28px"><div><h2>${t(L, 'level.practice.title', { level: lv.name })}</h2><p>${t(L, 'level.practice.text', { packs: t(L, 'common.packs', { n: sets.length }), questions: t(L, 'common.questions', { n: sets.reduce((n, s) => n + s.questions.length, 0) }) })}</p><div class="row" style="margin-top:16px"><a class="btn btn-gold" href="/latihan?bahasa=${o.course}#${o.level}">${t(L, 'level.practice.btn')}</a></div></div></div>` : ''}
</div></section>`;
}

function lineHtml(ln: Lesson['scene']['lines'][number], i: number, locale: string, L: Lang): Raw {
  const right = i % 2 === 1;
  return html`<div class="line ${right ? 'right' : ''}" data-line="${i}"><span class="who" aria-hidden="true">${ln.who.slice(0, 2)}</span><div class="txt"><span class="fo" lang="${locale.slice(0, 2)}">${ln.text}</span>${ln.kana && ln.kana !== ln.text ? html`<span class="kana">${ln.kana}</span>` : ''}<span class="id" data-tr lang="id">${ln.id}</span>${ln.note ? html`<span class="note">${ln.note}</span>` : ''}</div><button class="play" type="button" data-say="${ln.text}" data-lang="${locale}" aria-label="${t(L, 'common.listen')}">${icon('main')}</button></div>`;
}

export function lessonPage(o: { lesson: Lesson; state: LessonState; loggedIn: boolean; passed?: boolean; prev?: Lesson; next?: Lesson; lang: Lang }): Raw {
  const L = o.lang, l = o.lesson, m = COURSE_META[l.course], lv = m.levels.find((x) => x.id === l.level)!, name = m.names[L];
  const crumbs = breadcrumbs([[name, `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`], [`${l.module}.${l.index} ${l.title}`, `/belajar/${l.code}`]], L);
  const head = html`<div class="lesson-head"><div class="scene-mini">${raw(scene(l.course, autoMood(l.course), { id: 'ls', seed: l.index + 3 }))}</div>
    <div class="meta"><span class="pill">${name} ${lv.name}</span><span class="pill">${t(L, 'lesson.meta', { m: l.module, i: l.index })}</span><span class="pill">${t(L, 'common.minutes', { n: l.minutes })}</span>${l.free ? html`<span class="pill">${t(L, 'common.free')}</span>` : ''}</div>
    <h1>${l.title}</h1><div class="native" lang="${m.locale.slice(0, 2)}">${l.native}</div></div>`;
  if (o.state === 'member') {
    return html`<section class="section-tight"><div class="wrap-narrow">${crumbs}${head}
      <div class="panel"><h2><span class="n">${icon('gembok')}</span>${t(L, 'lesson.memberOnly')}</h2><p>${t(L, 'lesson.memberText', { name })}</p>
      <h3 style="font-size:var(--fs-3)">${t(L, 'lesson.goals')}</h3><ul class="goals">${l.goals.map((g) => html`<li>${g}</li>`)}</ul>
      <div class="row" style="margin-top:18px"><a class="btn btn-gold" href="/harga">${t(L, 'lesson.viewPlans')}</a>${o.loggedIn ? '' : html`<a class="btn btn-ghost" href="/masuk?lanjut=/belajar/${l.code}">${t(L, 'nav.signin')}</a>`}${o.prev ? html`<a class="btn btn-ghost" href="/belajar/${o.prev.code}">← ${t(L, 'lesson.prev')}</a>` : ''}</div></div>
    </div></section>`;
  }
  if (o.state === 'seq') {
    return html`<section class="section-tight"><div class="wrap-narrow">${crumbs}${head}
      <div class="panel"><h2><span class="n">${icon('gembok')}</span>${t(L, 'lesson.seqTitle')}</h2><p>${t(L, 'lesson.seqText')}</p>
      <h3 style="font-size:var(--fs-3)">${t(L, 'lesson.goals')}</h3><ul class="goals">${l.goals.map((g) => html`<li>${g}</li>`)}</ul>
      ${o.prev ? html`<div class="row" style="margin-top:18px"><a class="btn btn-gold" href="/belajar/${o.prev.code}">${t(L, 'lesson.seqBtn')}: ${o.prev.title}</a></div>` : ''}</div>
    </div></section>`;
  }
  const loc = m.locale, l2 = loc.slice(0, 2);
  return html`<section class="lesson-wrap" data-lesson="${l.code}" data-lang="${loc}"><div class="wrap lesson">
  <div>
    ${crumbs}${head}
    ${L === 'id' ? '' : html`<p class="notice" style="margin:0 0 14px">${t(L, 'content.idNotice')}</p>`}
    <div class="audio-bar" role="group" aria-label="${t(L, 'lesson.audio')}"><span class="small"><b>${t(L, 'lesson.voice')}</b> ${loc}</span><button class="btn btn-ghost btn-sm" type="button" data-toggle-tr>${t(L, 'lesson.hideTr')}</button><span class="rate"><button type="button" data-rate="0.8">${L === 'id' ? '0,8×' : '0.8×'}</button><button type="button" data-rate="1" aria-pressed="true">1×</button></span><button class="btn btn-ghost btn-sm" type="button" data-focus>${t(L, 'lesson.focus')}</button></div>

    <article class="panel" id="langkah-1"><h2><span class="n">1</span>${t(L, STEP_KEYS[0])}</h2><ul class="goals">${l.goals.map((g) => html`<li>${g}</li>`)}</ul></article>

    <article class="panel" id="langkah-2"><h2><span class="n">2</span>${t(L, STEP_KEYS[1])}: ${l.scene.title}</h2><p class="muted">${l.scene.setting}</p>
      <div class="row" style="margin-bottom:12px"><button class="btn btn-gold btn-sm" type="button" data-play-all>${icon('main')} ${t(L, 'lesson.playAll')}</button></div>
      <div class="dialog">${l.scene.lines.map((ln, i) => lineHtml(ln, i, loc, L))}</div></article>

    <article class="panel" id="langkah-3"><h2><span class="n">3</span>${t(L, STEP_KEYS[2])}</h2><p class="muted">${t(L, 'lesson.readHint')}</p>
      <div class="prose" lang="${l2}">${(l.reading?.sentences ?? l.scene.lines.map((x) => ({ text: x.text, id: x.id, kana: x.kana }))).map((s) => html`<span class="s" tabindex="0" role="button" data-say="${s.text}" data-lang="${loc}">${s.text}</span><span class="tr" data-tr lang="id">${s.id}</span>`)}</div></article>

    <article class="panel" id="langkah-4"><h2><span class="n">4</span>${t(L, STEP_KEYS[3])}</h2><p class="muted">${t(L, 'lesson.vocabHint')}</p>
      <div class="vocab">${l.vocab.map((v) => html`<div class="vcard" tabindex="0"><button class="snd" type="button" data-say="${v.term}" data-lang="${loc}" aria-label="${t(L, 'common.listen')}">${icon('suara')}</button><div class="term" lang="${l2}">${v.gender ? html`<span class="g g-${v.gender}">${v.gender === 'm' ? 'der' : v.gender === 'f' ? 'die' : 'das'}</span>` : ''}${v.term}</div><div class="id" lang="id">${v.id}</div>${v.extra ? html`<div class="extra">${v.extra}</div>` : ''}<div class="ex"><span lang="${l2}">${v.example}</span><br><span class="muted" lang="id">${v.exampleId}</span></div></div>`)}</div></article>

    <article class="panel" id="langkah-5"><h2><span class="n">5</span>${t(L, STEP_KEYS[4])}</h2><div class="gram">${l.grammar.map((g) => html`<article><h3>${g.title}</h3>${raw(renderMarkdown(g.body))}${g.examples.map((e) => html`<div class="ex"><b lang="${l2}">${e.text}</b><span lang="id">${e.id}</span><button class="btn btn-ghost btn-sm" type="button" data-say="${e.text}" data-lang="${loc}" style="justify-self:start">▶ ${t(L, 'common.listen')}</button></div>`)}</article>`)}</div></article>

    <article class="panel" id="langkah-6"><h2><span class="n">6</span>${t(L, STEP_KEYS[5])}</h2><p class="muted">${t(L, 'lesson.practiceHint')}</p><div class="ex-list" data-ex="practice"></div></article>

    <article class="panel" id="langkah-7"><h2><span class="n">7</span>${t(L, STEP_KEYS[6])}: ${l.pronunciation.focus}</h2><ul class="goals">${l.pronunciation.tips.map((x) => html`<li>${x}</li>`)}</ul>
      <div class="dialog" style="margin-top:14px">${l.pronunciation.drill.map((d, i) => html`<div class="line" data-line="d${i}"><span class="who">${i + 1}</span><div class="txt"><span class="fo" lang="${l2}">${d.text}</span>${d.kana && d.kana !== d.text ? html`<span class="kana">${d.kana}</span>` : ''}<span class="id" data-tr lang="id">${d.id}</span></div><button class="play" type="button" data-say="${d.text}" data-lang="${loc}" aria-label="${t(L, 'common.listen')}">${icon('main')}</button></div>`)}</div></article>

    <article class="panel" id="langkah-8"><h2><span class="n">8</span>${t(L, STEP_KEYS[7])}</h2><p class="muted">${t(L, 'lesson.indepHint')}</p><div class="ex-list" data-ex="independent"></div></article>

    <article class="panel" id="langkah-9"><h2><span class="n">9</span>${t(L, STEP_KEYS[8])}</h2><p class="muted">${t(L, 'lesson.quizHint')}</p>
      <div class="ex-list" data-ex="quiz"></div>
      <div class="submit-bar" data-quizbar><span data-quizleft>${t(L, 'lesson.quizLeft')}</span><button class="btn btn-gold" type="button" data-quizsubmit disabled>${t(L, 'lesson.quizSubmit')}</button></div>
      <div data-quizresult hidden></div></article>

    <article class="panel" id="langkah-10"><h2><span class="n">10</span>${t(L, STEP_KEYS[9])}</h2><ol class="recap">${l.recap.map((r) => html`<li>${r}</li>`)}</ol>
      <div class="lesson-nav">${o.prev ? html`<a class="btn btn-ghost" href="/belajar/${o.prev.code}">← ${o.prev.title}</a>` : html`<span></span>`}${o.next ? html`<a class="btn btn-gold" href="/belajar/${o.next.code}" data-next>${o.next.title} →</a>` : html`<a class="btn btn-gold" href="/latihan?bahasa=${l.course}">${t(L, 'lesson.nextPractice')}</a>`}</div></article>
  </div>
  <aside class="lesson-aside"><nav class="stepper card" aria-label="${t(L, 'lesson.stepsLabel')}">${STEP_KEYS.map((k, i) => html`<a href="#langkah-${i + 1}" data-step="${i + 1}">${t(L, k)}</a>`)}</nav>
    <div class="card small"><b>${t(L, 'lesson.tips')}</b><p style="margin:6px 0 0" class="muted">${t(L, 'lesson.tipsText')}</p></div></aside>
</div>
${jsonScript('lesson', { ...clientLesson(l), locale: loc, loggedIn: o.loggedIn, passed: Boolean(o.passed) })}
</section>
<script src="/assets/belajar.js?v=3" defer></script>`;
}
