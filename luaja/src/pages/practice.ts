/** Halaman bank latihan soal: indeks per bahasa & jenjang, dan halaman pengerjaan paket (kunci tidak pernah ikut terkirim). */
import { html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { COURSE_META, COURSES, type Course } from '../data/model.ts';
import { icon, breadcrumbs } from './layout.ts';
import { publicSet, type PSet } from '../practice/types.ts';
import { practiceLevels, setsOf, levelName, totalQuestions, SETS } from '../practice/index.ts';
import { scene } from './scene.ts';

const flag = (c: Course) => html`<span class="pill pill-flag"><i class="flag-${c}"></i>${COURSE_META[c].native}</span>`;

function setCard(s: PSet, unlocked: boolean, done?: { pct: number }): Raw {
  const open = s.free || unlocked;
  return html`<a class="card lift pset ${s.kind}" href="/latihan/${s.id}">
    <div class="row between"><span class="pill ${s.kind === 'simulasi' ? 'pill-info' : 'pill-line'}">${s.kind === 'simulasi' ? 'Simulasi ujian' : 'Penguatan'}</span>${open ? (s.free ? html`<span class="pill pill-gold">Gratis</span>` : html`<span class="pill pill-ok">Terbuka</span>`) : html`<span class="pill pill-line">${icon('gembok')} Member</span>`}</div>
    <h3>${s.title}</h3>
    <p class="muted small" style="margin:0">${s.examName}</p>
    <p class="small" style="margin:0;color:var(--ink-2)">${s.desc}</p>
    <div class="row between small muted" style="margin-top:auto"><span>${s.questions.length} soal · ±${s.minutes} menit</span>${done ? html`<span class="pill ${done.pct >= 0.75 ? 'pill-ok' : 'pill-warn'}">Terbaik ${Math.round(done.pct * 100)}%</span>` : ''}</div>
  </a>`;
}

export function practiceIndexPage(o: { course: Course; unlocked: boolean; best: Record<string, number> }): Raw {
  const m = COURSE_META[o.course];
  const levels = practiceLevels(o.course).filter((l) => setsOf(o.course, l.id).length);
  return html`
<section class="page-hero"><div class="scene">${raw(scene(o.course, 'siang', { id: 'lat-hero', seed: 7 }))}</div><div class="wrap page-hero-in">
  ${breadcrumbs([['Latihan soal', '/latihan'], [m.name, `/latihan?bahasa=${o.course}`]])}
  <p class="eyebrow">Bank latihan soal</p>
  <h1>Latihan soal ${m.name}</h1>
  <p class="lead">Paket simulasi mengikuti format ujian resmi tiap jenjang, ditambah seri penguatan. Kunci jawaban dan pembahasan terbuka setelah semua soal dijawab, lengkap dengan prediksi nilai pada skala ujian sebenarnya.</p>
  <nav class="tabs" aria-label="Bahasa">${COURSES.map((c) => html`<a href="/latihan?bahasa=${c}" ${c === o.course ? raw('aria-current="page"') : ''}>${COURSE_META[c].name}</a>`)}</nav>
</div></section>
<section class="section-tight"><div class="wrap">
  <div class="ribbon reveal" style="margin-bottom:28px"><div class="stat"><b>${SETS.length}</b><span>paket soal</span></div><div class="stat"><b>${totalQuestions().toLocaleString('id-ID')}</b><span>butir soal</span></div><div class="stat"><b>100%</b><span>dengan kunci & pembahasan</span></div><div class="stat"><b>${icon('cek')}</b><span>prediksi nilai otomatis</span></div></div>
  ${levels.map((l) => {
    const sets = setsOf(o.course, l.id);
    const sim = sets.filter((s) => s.kind === 'simulasi');
    const dr = sets.filter((s) => s.kind === 'drill');
    return html`<div class="shelf-head reveal" id="${l.id}"><h2>${flag(o.course)} ${l.name}</h2><span class="muted small">${sets.length} paket · ${sets.reduce((n, s) => n + s.questions.length, 0)} soal</span></div>
    ${sim.length ? html`<div class="grid g3">${sim.map((s) => setCard(s, o.unlocked, o.best[s.id] !== undefined ? { pct: o.best[s.id]! } : undefined))}</div>` : ''}
    ${dr.length ? html`<details class="drills"><summary>${dr.length} seri penguatan (${dr.reduce((n, s) => n + s.questions.length, 0)} soal) — artikel, konjugasi, kosakata, huruf</summary><div class="grid g4" style="margin-top:14px">${dr.map((s) => setCard(s, o.unlocked, o.best[s.id] !== undefined ? { pct: o.best[s.id]! } : undefined))}</div></details>` : ''}`;
  })}
  <div class="notice" style="margin-top:28px">Soal disusun tim LUAJA mengikuti deskripsi format ujian resmi (Goethe-Institut, Cambridge, ETS, IDP/British Council, JLPT) — bukan salinan soal ujian. Prediksi nilai adalah perkiraan dari latihan, bukan skor resmi.</div>
</div></section>`;
}

export function practiceSetPage(o: { set: PSet; unlocked: boolean; loggedIn: boolean; nextId?: string }): Raw {
  const s = o.set, m = COURSE_META[s.course];
  const open = s.free || o.unlocked;
  const crumbs = breadcrumbs([['Latihan soal', '/latihan'], [m.name, `/latihan?bahasa=${s.course}`], [s.title, `/latihan/${s.id}`]]);
  if (!open) {
    const pub = publicSet(s);
    return html`<section class="section"><div class="wrap-narrow">${crumbs}
      <p class="eyebrow">${s.examName}</p><h1 style="font-size:var(--fs-5)">${s.title}</h1><p class="lead">${s.desc}</p>
      <div class="card card-tint" style="margin:20px 0"><div class="row" style="gap:16px;align-items:flex-start"><span class="icon-tile">${icon('gembok')}</span><div><h3 style="margin:0 0 6px">Paket khusus member ${m.name}</h3><p style="margin:0">Paket ini berisi ${s.questions.length} soal dengan kunci jawaban, pembahasan dan prediksi nilai. Tersedia untuk member paket ${m.name} atau paket 3 bahasa.</p><div class="row" style="margin-top:14px"><a class="btn btn-gold" href="/harga">Lihat paket</a>${o.loggedIn ? '' : html`<a class="btn btn-ghost" href="/masuk?lanjut=/latihan/${s.id}">Sudah member? Masuk</a>`}</div></div></div></div>
      <h2 style="font-size:var(--fs-4)">Contoh soal</h2>
      <div class="ex-list">${pub.questions.slice(0, 2).map((x) => html`<div class="exercise"><div class="q"><small>${x.section}</small>${x.stem}</div><div class="opts">${x.options.map((op, i) => html`<div class="opt"><span class="k">${String.fromCharCode(65 + i)}</span>${op}</div>`)}</div></div>`)}</div>
    </div></section>`;
  }
  return html`<section class="section-tight practice" data-practice="${s.id}" data-lang="${m.locale}">
  <div class="wrap">${crumbs}
    <div class="practice-head">
      <div><p class="eyebrow">${s.examName}</p><h1>${s.title}</h1><p class="muted" style="margin:0">${s.questions.length} soal · ±${s.minutes} menit · ${s.desc}</p></div>
      <div class="practice-meter"><div class="ring" style="--p:0" data-ring><span data-count>0/${s.questions.length}</span></div><div class="small muted">terjawab</div><div class="timer" data-timer data-minutes="${s.minutes}">${s.minutes}:00</div></div>
    </div>
    ${o.loggedIn ? '' : html`<div class="notice" style="margin-bottom:16px">Anda berlatih sebagai tamu. <a href="/masuk?lanjut=/latihan/${s.id}">Masuk</a> agar riwayat dan perkembangan nilai tersimpan di portal.</div>`}
    <div class="practice-body">
      <aside class="qnav" aria-label="Nomor soal"><div class="qnav-grid" data-qnav></div><p class="small muted" style="margin:10px 0 0">Kunci jawaban terbuka setelah semua soal dijawab dan dikumpulkan.</p></aside>
      <div>
        <div class="ex-list" data-questions></div>
        <div class="submit-bar" data-submitbar><span data-left>Jawab semua soal untuk mengumpulkan.</span><button class="btn btn-gold btn-lg" type="button" data-submit disabled>Kumpulkan & lihat hasil</button></div>
        <div data-result hidden></div>
      </div>
    </div>
  </div>
  ${jsonScript('pset', publicSet(s))}
  ${jsonScript('pmeta', { next: o.nextId ?? null, loggedIn: o.loggedIn, level: levelName(s.course, s.level), course: m.name })}
</section>
<script src="/assets/latihan.js?v=1" defer></script>`;
}
