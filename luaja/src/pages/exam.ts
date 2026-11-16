/** Halaman simulasi ujian penuh: indeks, format resmi + daftar simulasi, dan cangkang pengerjaan (kunci tidak pernah dikirim). */
import { html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { COURSE_META, type Course } from '../data/model.ts';
import { fmtNum, t, type Lang } from '../lib/i18n.ts';
import { breadcrumbs, icon } from './layout.ts';
import { examMinutes, examTotalItems, type ExamSpec } from '../exam/specs.ts';
import { mocksOf, publicMock, readyExams } from '../exam/mocks.ts';
import type { Mock } from '../exam/types.ts';

const CSS = html`<link rel="stylesheet" href="/assets/simulasi.css?v=2">`;

export function examCard(e: ExamSpec, L: Lang): Raw {
  return html`<a class="card lift sim-card" href="/simulasi/${e.id}">
    <span class="pill pill-info">${t(L, 'sim.eyebrow')}</span>
    <h3>${e.name}</h3>
    <p class="small muted" style="margin:0">${t(L, 'sim.total', { n: examTotalItems(e), m: examMinutes(e) })} · ${t(L, 'sim.count', { n: mocksOf(e.id).length })}</p>
    <p class="small" style="margin:0">${e.sections.map((s) => `${s.name} (${s.minutes}′)`).join(' · ')}</p>
  </a>`;
}

export function simIndexPage(o: { lang: Lang }): Raw {
  const L = o.lang, exams = readyExams();
  return html`${CSS}<section class="section"><div class="wrap">
  ${breadcrumbs([[t(L, 'sim.eyebrow'), '/simulasi']], L)}
  <p class="eyebrow">${t(L, 'sim.eyebrow')}</p>
  <h1 style="font-size:var(--fs-6)">${t(L, 'sim.indexTitle')}</h1>
  <p class="lead">${t(L, 'sim.lead')}</p>
  <div class="grid g3" style="margin-top:22px">${exams.map((e) => examCard(e, L))}</div>
  <p class="notice" style="margin-top:22px">${t(L, 'sim.coming')}</p>
</div></section>`;
}

export function examPage(o: { exam: ExamSpec; unlocked: boolean; lang: Lang }): Raw {
  const L = o.lang, e = o.exam, name = COURSE_META[e.course].names[L];
  const mocks = mocksOf(e.id);
  return html`${CSS}<section class="section"><div class="wrap">
  ${breadcrumbs([[t(L, 'sim.eyebrow'), '/simulasi'], [e.name, `/simulasi/${e.id}`]], L)}
  <p class="eyebrow">${name} · ${t(L, 'sim.eyebrow')}</p>
  <h1 style="font-size:var(--fs-6)">${t(L, 'sim.title', { exam: e.name })}</h1>
  <p class="lead">${t(L, 'sim.lead')}</p>
  <div class="sim-grid">
    <div class="card">
      <h2 style="font-size:var(--fs-4);margin-top:0">${t(L, 'sim.format')}</h2>
      <div class="table-wrap"><table class="table sim-format">
        <tr><th>${t(L, 'sim.section')}</th><th>${t(L, 'sim.part')}</th><th>${t(L, 'sim.itemsH')}</th></tr>
        ${e.sections.map((s) => s.parts.map((p, i) => html`<tr>${i === 0 ? html`<td rowspan="${s.parts.length}"><b lang="${e.course}">${s.name}</b><br><span class="small muted">${t(L, 'common.minutes', { n: s.minutes })}</span></td>` : ''}<td><span lang="${e.course}">${p.name}</span><br><span class="small muted" lang="id">${p.about}</span></td><td class="num">${p.items}${p.points ? html`<br><span class="small">${t(L, 'sim.pointsN', { n: p.points })}</span>` : ''}</td></tr>`))}
        <tr class="sum"><td colspan="2"><b>${t(L, 'sim.totalRow')}</b></td><td class="num"><b>${examTotalItems(e)}</b><br><span class="small">${t(L, 'common.minutes', { n: examMinutes(e) })}</span></td></tr>
      </table></div>
      <p class="small muted" style="margin:10px 0 0">${t(L, 'sim.source')}: <a href="${e.source}" rel="noopener" target="_blank">${new URL(e.source).host}</a></p>
    </div>
    <div class="stack">
      <div class="card card-tint"><h2 style="font-size:var(--fs-4);margin-top:0">${t(L, 'sim.scoring')}</h2>
        <ul class="sim-groups">${e.groups.map((g) => html`<li><span lang="${e.course}">${g.name}</span><b>0–${g.max}</b>${g.min !== undefined ? html`<small>${t(L, 'sim.min', { n: g.min })}</small>` : ''}</li>`)}
          <li class="sum"><span>${t(L, 'sim.totalRow')}</span><b>0–${e.total.max}</b><small>${t(L, 'sim.passmark', { pass: e.total.pass, max: e.total.max })}</small></li></ul>
        <ul class="small sim-policy" lang="id">${e.policy.map((p) => html`<li>${p}</li>`)}</ul>
      </div>
      <div class="card"><h3 style="margin-top:0">${t(L, 'sim.rulesTitle')}</h3><ol class="small">${(['sim.rule1', 'sim.rule2', 'sim.rule3', 'sim.rule4'] as const).map((k) => html`<li>${t(L, k)}</li>`)}</ol></div>
    </div>
  </div>
  <h2 style="font-size:var(--fs-5);margin:34px 0 14px">${t(L, 'sim.list')}</h2>
  <div class="sim-list">${mocks.map((id, i) => { const free = i === 0, open = free || o.unlocked; return html`<a class="sim-tile ${open ? '' : 'locked'}" href="/simulasi/${e.id}/${i + 1}"><b>${i + 1}</b><span>${t(L, 'sim.mockN', { n: i + 1 })}</span><small>${free ? t(L, 'common.free') : open ? t(L, 'common.open') : t(L, 'sim.memberOnly', { name })}</small></a>`; })}</div>
  <p class="notice" style="margin-top:22px">${t(L, 'sim.honest')}</p>
</div></section>`;
}

export function runnerPage(o: { mock: Mock; exam: ExamSpec; loggedIn: boolean; nextUrl: string | null; lang: Lang }): Raw {
  const L = o.lang, e = o.exam;
  const locale = COURSE_META[e.course].locale;
  return html`${CSS}<section class="sim" data-sim>
  <div class="sim-bar">
    <div><b>${o.mock.title}</b><span data-sim-sec>—</span></div>
    <div class="sim-timer" data-sim-timer aria-live="polite">--:--</div>
    <div class="sim-prog"><i data-sim-prog style="--p:0%"></i></div>
  </div>
  <div class="wrap-narrow sim-stage">
    <div class="sim-intro card" data-sim-intro>
      <h1 style="font-size:var(--fs-5);margin-top:0">${o.mock.title}</h1>
      <p>${t(L, 'sim.total', { n: examTotalItems(e), m: examMinutes(e) })}</p>
      <ol class="small">${(['sim.rule1', 'sim.rule2', 'sim.rule3', 'sim.rule4'] as const).map((k) => html`<li>${t(L, k)}</li>`)}</ol>
      ${o.loggedIn ? '' : html`<p class="notice small">${raw(t(L, 'practice.guest', { login: `<a href="/masuk?lanjut=/simulasi/${e.id}/${o.mock.n}">${t(L, 'practice.guest.login')}</a>` }))}</p>`}
      <button type="button" class="btn btn-gold btn-lg" data-sim-start>${icon('jam')} ${t(L, 'sim.start')}</button>
    </div>
    <div data-sim-body hidden></div>
    <div data-sim-result hidden></div>
  </div>
  ${jsonScript('mock', publicMock(o.mock))}
  ${jsonScript('simcfg', { locale, exam: e.id, next: o.nextUrl, loggedIn: o.loggedIn, groups: e.groups.map((g) => ({ id: g.id, name: g.name, max: g.max, min: g.min ?? null })), pass: e.total.pass, max: e.total.max })}
</section>
<script src="/assets/simulasi.js?v=2" defer></script>`;
}

/** Tautan ringkas untuk halaman jenjang & latihan. */
export function examLinks(course: Course, level: string | undefined, L: Lang): Raw {
  const list = readyExams().filter((e) => e.course === course && (!level || e.level === level));
  if (!list.length) return html``;
  return html`<div class="cta-band reveal" style="margin-top:28px"><div><h2>🎓 ${t(L, 'sim.eyebrow')}</h2><p>${list.map((e) => `${e.name}: ${t(L, 'sim.count', { n: mocksOf(e.id).length })} × ${t(L, 'sim.total', { n: fmtNum(L, examTotalItems(e)), m: examMinutes(e) })}`).join(' · ')}</p><div class="row" style="margin-top:16px">${list.map((e) => html`<a class="btn btn-gold" href="/simulasi/${e.id}">${e.name}</a>`)}</div></div></div>`;
}
