/** Halaman jenjang (modul & pelajaran) dan halaman pelajaran 10 langkah. Kunci latihan/kuis tidak pernah ikut terkirim. */
import { html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { renderMarkdown } from '../lib/markdown.ts';
import { COURSE_META, type Course } from '../data/model.ts';
import { icon, breadcrumbs } from './layout.ts';
import { clientLesson, type Lesson } from '../course/schema.ts';
import { getLesson, modulesOf, OUTLINE } from '../course/index.ts';
import { setsOf } from '../practice/index.ts';
import { scene, autoMood } from './scene.ts';
import type { Progress } from '../data/progress.ts';

const STEPS = ['Tujuan', 'Adegan', 'Teks & audio', 'Kosakata', 'Tata bahasa', 'Latihan terbimbing', 'Lafal', 'Latihan mandiri', 'Kuis', 'Rekap'];

export function levelPage(o: { course: Course; level: string; unlocked: boolean; progress?: Progress }): Raw {
  const m = COURSE_META[o.course];
  const lv = m.levels.find((l) => l.id === o.level)!;
  const mods = modulesOf(o.course, o.level);
  const outline = OUTLINE[`${o.course}-${o.level}`] ?? [];
  const sets = setsOf(o.course, o.level);
  const done = (code: string) => o.progress?.lessons[code]?.passed;
  return html`
<section class="page-hero"><div class="scene">${raw(scene(o.course, autoMood(o.course), { id: 'lv-hero', seed: 5 }))}</div><div class="wrap page-hero-in">
  ${breadcrumbs([[m.name, `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`]])}
  <p class="eyebrow">${m.name} · ${m.native}</p>
  <h1>${m.name} ${lv.name}</h1>
  <p class="lead">${lv.sub} · perkiraan ${lv.hours} belajar terbimbing. Setiap modul berisi lima pelajaran sepuluh langkah dan satu tes modul.</p>
</div></section>
<section class="section-tight"><div class="wrap">
  ${mods.length ? mods.map((mod) => html`<div class="module card reveal">
    <div class="row between"><div><p class="eyebrow" style="margin:0">Modul ${mod.n}</p><h2 style="font-size:var(--fs-4);margin:4px 0">${mod.title} <span class="muted italic serif" style="font-weight:400">· ${mod.native}</span></h2></div><span class="pill pill-info">${mod.lessons.length} pelajaran</span></div>
    <p class="muted" style="margin:0 0 6px"><b>Fokus:</b> ${mod.focus}</p><p class="muted" style="margin:0 0 14px"><b>Setelah modul ini:</b> ${mod.outcome}</p>
    <ol class="lesson-list">${mod.lessons.map((code) => { const l = getLesson(code)!; const open = l.free || o.unlocked; return html`<li><a href="/belajar/${code}" class="${done(code) ? 'done' : ''}"><span class="num">${l.index}</span><span class="t"><b>${l.title}</b><small>${l.native} · ±${l.minutes} menit</small></span>${l.free ? html`<span class="pill pill-gold">Gratis</span>` : open ? (done(code) ? html`<span class="pill pill-ok">${icon('cek')} Lulus</span>` : html`<span class="pill pill-line">Mulai</span>`) : html`<span class="pill pill-line">${icon('gembok')} Member</span>`}</a></li>`; })}</ol>
  </div>`) : html`<div class="notice">Pelajaran jenjang ini sedang disusun. Mulailah dari jenjang sebelumnya atau kerjakan latihan soal ${lv.name}.</div>`}
  ${outline.length > mods.length ? html`<div class="card reveal" style="margin-top:18px"><h3 style="margin-top:0">Peta modul ${lv.name}</h3><ol class="outline">${outline.map((x) => html`<li class="${mods.some((mm) => mm.n === x.n) ? 'live' : ''}"><b>Modul ${x.n}</b> ${x.title} <span class="muted">· ${x.native}</span>${mods.some((mm) => mm.n === x.n) ? html` <span class="pill pill-ok">Tersedia</span>` : html` <span class="pill pill-line">Terbit bertahap</span>`}</li>`)}</ol></div>` : ''}
  ${sets.length ? html`<div class="cta-band reveal" style="margin-top:28px"><div><h2>Latihan soal ${lv.name}</h2><p>${sets.length} paket · ${sets.reduce((n, s) => n + s.questions.length, 0)} soal dengan kunci, pembahasan dan prediksi nilai.</p><div class="row" style="margin-top:16px"><a class="btn btn-gold" href="/latihan?bahasa=${o.course}#${o.level}">Buka latihan soal</a></div></div></div>` : ''}
</div></section>`;
}

function lineHtml(ln: Lesson['scene']['lines'][number], i: number, locale: string): Raw {
  const right = i % 2 === 1;
  return html`<div class="line ${right ? 'right' : ''}" data-line="${i}"><span class="who" aria-hidden="true">${ln.who.slice(0, 2)}</span><div class="txt"><span class="fo" lang="${locale.slice(0, 2)}">${ln.text}</span>${ln.kana && ln.kana !== ln.text ? html`<span class="kana">${ln.kana}</span>` : ''}<span class="id" data-tr>${ln.id}</span>${ln.note ? html`<span class="note">${ln.note}</span>` : ''}</div><button class="play" type="button" data-say="${ln.text}" data-lang="${locale}" aria-label="Dengarkan">${icon('main')}</button></div>`;
}

export function lessonPage(o: { lesson: Lesson; unlocked: boolean; loggedIn: boolean; passed?: boolean; prev?: Lesson; next?: Lesson }): Raw {
  const l = o.lesson, m = COURSE_META[l.course], lv = m.levels.find((x) => x.id === l.level)!;
  const open = l.free || o.unlocked;
  const crumbs = breadcrumbs([[m.name, `/${m.slug}`], [lv.name, `/${m.slug}/${lv.id}`], [`${l.module}.${l.index} ${l.title}`, `/belajar/${l.code}`]]);
  const head = html`<div class="lesson-head"><div class="scene-mini">${raw(scene(l.course, autoMood(l.course), { id: 'ls', seed: l.index + 3 }))}</div>
    <div class="meta"><span class="pill">${m.name} ${lv.name}</span><span class="pill">Modul ${l.module} · Pelajaran ${l.index}</span><span class="pill">±${l.minutes} menit</span>${l.free ? html`<span class="pill">Gratis</span>` : ''}</div>
    <h1>${l.title}</h1><div class="native" lang="${m.locale.slice(0, 2)}">${l.native}</div></div>`;
  if (!open) {
    return html`<section class="section-tight"><div class="wrap-narrow">${crumbs}${head}
      <div class="panel"><h2><span class="n">${icon('gembok')}</span>Pelajaran khusus member</h2><p>Pelajaran ini bagian dari paket ${m.name}. Setelah bergabung, seluruh jenjang ${m.levels[0]!.name}–${m.levels[m.levels.length - 1]!.name}, dan seluruh latihan soal ${m.name} terbuka selama satu tahun.</p>
      <h3 style="font-size:var(--fs-3)">Yang akan Anda kuasai</h3><ul class="goals">${l.goals.map((g) => html`<li>${g}</li>`)}</ul>
      <div class="row" style="margin-top:18px"><a class="btn btn-gold" href="/harga">Lihat paket</a>${o.loggedIn ? '' : html`<a class="btn btn-ghost" href="/masuk?lanjut=/belajar/${l.code}">Masuk</a>`}${o.prev ? html`<a class="btn btn-ghost" href="/belajar/${o.prev.code}">← Pelajaran sebelumnya</a>` : ''}</div></div>
    </div></section>`;
  }
  const loc = m.locale;
  return html`<section class="lesson-wrap" data-lesson="${l.code}" data-lang="${loc}"><div class="wrap lesson">
  <div>
    ${crumbs}${head}
    <div class="audio-bar" role="group" aria-label="Pengaturan suara"><span class="small"><b>Suara</b> ${loc}</span><button class="btn btn-ghost btn-sm" type="button" data-toggle-tr>Sembunyikan terjemahan</button><span class="rate"><button type="button" data-rate="0.8">0,8×</button><button type="button" data-rate="1" aria-pressed="true">1×</button></span><button class="btn btn-ghost btn-sm" type="button" data-focus>Mode fokus</button></div>

    <article class="panel" id="langkah-1"><h2><span class="n">1</span>${STEPS[0]}</h2><ul class="goals">${l.goals.map((g) => html`<li>${g}</li>`)}</ul></article>

    <article class="panel" id="langkah-2"><h2><span class="n">2</span>${STEPS[1]}: ${l.scene.title}</h2><p class="muted">${l.scene.setting}</p>
      <div class="row" style="margin-bottom:12px"><button class="btn btn-gold btn-sm" type="button" data-play-all>${icon('main')} Putar seluruh dialog</button></div>
      <div class="dialog">${l.scene.lines.map((ln, i) => lineHtml(ln, i, loc))}</div></article>

    <article class="panel" id="langkah-3"><h2><span class="n">3</span>${STEPS[2]}</h2><p class="muted">Baca kalimat demi kalimat; ketuk kalimat untuk mendengarkan, terjemahannya muncul di bawahnya.</p>
      <div class="prose" lang="${loc.slice(0, 2)}">${(l.reading?.sentences ?? l.scene.lines.map((x) => ({ text: x.text, id: x.id, kana: x.kana }))).map((s) => html`<span class="s" tabindex="0" role="button" data-say="${s.text}" data-lang="${loc}">${s.text}</span><span class="tr" data-tr>${s.id}</span>`)}</div></article>

    <article class="panel" id="langkah-4"><h2><span class="n">4</span>${STEPS[3]}</h2><p class="muted">Ketuk kartu untuk contoh kalimat; tombol ▶ untuk lafal.</p>
      <div class="vocab">${l.vocab.map((v) => html`<div class="vcard" tabindex="0"><button class="snd" type="button" data-say="${v.term.replace(/^(der|die|das) /, (a) => a)}" data-lang="${loc}" aria-label="Dengarkan">${icon('suara')}</button><div class="term" lang="${loc.slice(0, 2)}">${v.gender ? html`<span class="g g-${v.gender}">${v.gender === 'm' ? 'der' : v.gender === 'f' ? 'die' : 'das'}</span>` : ''}${v.term}</div><div class="id">${v.id}</div>${v.extra ? html`<div class="extra">${v.extra}</div>` : ''}<div class="ex"><span lang="${loc.slice(0, 2)}">${v.example}</span><br><span class="muted">${v.exampleId}</span></div></div>`)}</div></article>

    <article class="panel" id="langkah-5"><h2><span class="n">5</span>${STEPS[4]}</h2><div class="gram">${l.grammar.map((g) => html`<article><h3>${g.title}</h3>${raw(renderMarkdown(g.body))}${g.examples.map((e) => html`<div class="ex"><b lang="${loc.slice(0, 2)}">${e.text}</b><span>${e.id}</span><button class="btn btn-ghost btn-sm" type="button" data-say="${e.text}" data-lang="${loc}" style="justify-self:start">▶ Dengarkan</button></div>`)}</article>`)}</div></article>

    <article class="panel" id="langkah-6"><h2><span class="n">6</span>${STEPS[5]}</h2><p class="muted">Setiap jawaban langsung diperiksa beserta penjelasannya. Boleh dicoba lagi.</p><div class="ex-list" data-ex="practice"></div></article>

    <article class="panel" id="langkah-7"><h2><span class="n">7</span>${STEPS[6]}: ${l.pronunciation.focus}</h2><ul class="goals">${l.pronunciation.tips.map((t) => html`<li>${t}</li>`)}</ul>
      <div class="dialog" style="margin-top:14px">${l.pronunciation.drill.map((d, i) => html`<div class="line" data-line="d${i}"><span class="who">${i + 1}</span><div class="txt"><span class="fo" lang="${loc.slice(0, 2)}">${d.text}</span>${d.kana && d.kana !== d.text ? html`<span class="kana">${d.kana}</span>` : ''}<span class="id" data-tr>${d.id}</span></div><button class="play" type="button" data-say="${d.text}" data-lang="${loc}" aria-label="Dengarkan">${icon('main')}</button></div>`)}</div></article>

    <article class="panel" id="langkah-8"><h2><span class="n">8</span>${STEPS[7]}</h2><p class="muted">Dengar lalu ketik, ucapkan, dan tulis sendiri.</p><div class="ex-list" data-ex="independent"></div></article>

    <article class="panel" id="langkah-9"><h2><span class="n">9</span>${STEPS[8]}</h2><p class="muted">Delapan soal. Kunci dan pembahasan terbuka setelah semua soal dijawab dan dikumpulkan. Nilai ≥ 80 % membuka pelajaran berikutnya.</p>
      <div class="ex-list" data-ex="quiz"></div>
      <div class="submit-bar" data-quizbar><span data-quizleft>Jawab semua soal kuis.</span><button class="btn btn-gold" type="button" data-quizsubmit disabled>Kumpulkan kuis</button></div>
      <div data-quizresult hidden></div></article>

    <article class="panel" id="langkah-10"><h2><span class="n">10</span>${STEPS[9]}</h2><ol class="recap">${l.recap.map((r) => html`<li>${r}</li>`)}</ol>
      <div class="lesson-nav">${o.prev ? html`<a class="btn btn-ghost" href="/belajar/${o.prev.code}">← ${o.prev.title}</a>` : html`<span></span>`}${o.next ? html`<a class="btn btn-gold" href="/belajar/${o.next.code}" data-next>${o.next.title} →</a>` : html`<a class="btn btn-gold" href="/latihan?bahasa=${l.course}">Lanjut ke latihan soal →</a>`}</div></article>
  </div>
  <aside class="lesson-aside"><nav class="stepper card" aria-label="Langkah pelajaran">${STEPS.map((s, i) => html`<a href="#langkah-${i + 1}" data-step="${i + 1}">${s}</a>`)}</nav>
    <div class="card small"><b>Tips</b><p style="margin:6px 0 0" class="muted">Gunakan headset, ulangi setiap baris dengan suara keras (shadowing), lalu kerjakan kuis tanpa melihat catatan.</p></div></aside>
</div>
${jsonScript('lesson', { ...clientLesson(l), locale: loc, loggedIn: o.loggedIn, passed: Boolean(o.passed) })}
</section>
<script src="/assets/belajar.js?v=1" defer></script>`;
}
