/* LUAJA — pengerjaan simulasi ujian penuh. Bagian demi bagian dengan batas waktu sendiri (bagian yang ditutup tidak bisa
 * dibuka lagi), audio dengar dibacakan mesin suara perangkat sebanyak aturan resmi, kunci & pembahasan baru datang dari
 * server setelah seluruh simulasi dinilai. DOM dibangun lewat textContent (tanpa HTML mentah). */
(function () {
  'use strict';
  var root = document.querySelector('[data-sim]'); if (!root) return;
  var M = JSON.parse(document.getElementById('mock').textContent);
  var C = JSON.parse(document.getElementById('simcfg').textContent);
  var d = document, $ = function (s, c) { return (c || d).querySelector(s); };
  var T = function (k, v) { var s = (window.LJ && window.LJ.t && window.LJ.t[k]) || k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  function h(tag, attrs) { var el = d.createElement(tag), k; if (attrs) for (k in attrs) { if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue; if (k === 'class') el.className = attrs[k]; else el.setAttribute(k, attrs[k] === true ? '' : String(attrs[k])); } for (var i = 2; i < arguments.length; i++) add(el, arguments[i]); return el; }
  function add(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; } el.appendChild(typeof c === 'object' ? c : d.createTextNode(String(c))); }

  var KEY = 'lj_sim_' + M.id;
  var st = { sec: -1, answers: {}, plays: {}, ends: null };
  try { var raw = sessionStorage.getItem(KEY); if (raw) st = Object.assign(st, JSON.parse(raw)); } catch (e) { /* abaikan */ }
  var keep = function () { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* abaikan */ } };
  var body = $('[data-sim-body]'), intro = $('[data-sim-intro]'), result = $('[data-sim-result]'), timerEl = $('[data-sim-timer]'), secEl = $('[data-sim-sec]'), prog = $('[data-sim-prog]');
  var total = M.sections.reduce(function (n, s) { return n + s.parts.reduce(function (m, p) { return m + p.items.length; }, 0); }, 0);

  /* ── suara: laki-laki / perempuan / narator ─────────────────────────── */
  var synth = window.speechSynthesis, voices = [];
  var loadVoices = function () { voices = synth ? synth.getVoices().filter(function (v) { return v.lang && v.lang.replace('_', '-').toLowerCase().indexOf(C.locale.slice(0, 2)) === 0; }) : []; };
  if (synth) { loadVoices(); if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices; }
  function voiceFor(s) {
    if (!voices.length) return null;
    var male = voices.filter(function (v) { return /male|otoya|ichiro|keita|kenji|takumi|daniel|hans|stefan/i.test(v.name) && !/female/i.test(v.name); });
    var female = voices.filter(function (v) { return voices.indexOf(v) >= 0 && male.indexOf(v) < 0; });
    if (s === 'M') return male[0] || voices[1] || voices[0];
    if (s === 'F') return female[0] || voices[0];
    return voices[0];
  }
  function speakLines(lines, done) {
    if (!synth) { if (window.ljToast) window.ljToast(T('js.noVoice')); done(); return; }
    synth.cancel();
    var i = 0;
    (function next() {
      if (i >= lines.length) { done(); return; }
      var ln = lines[i++], u = new SpeechSynthesisUtterance(ln.t);
      u.lang = C.locale; var v = voiceFor(ln.s); if (v) u.voice = v;
      u.rate = 0.95; u.pitch = ln.s === 'M' ? 0.85 : ln.s === 'F' ? 1.15 : 1;
      u.onend = function () { setTimeout(next, 450); }; u.onerror = function () { setTimeout(next, 100); };
      synth.speak(u);
    })();
  }

  /* ── soal ───────────────────────────────────────────────────────────── */
  var shownPassages = {};
  function item(it, part, no) {
    var box = h('div', { class: 'sim-q', id: 'q-' + it.id });
    add(box, h('div', { class: 'sim-qh' }, h('span', { class: 'sim-no' }, String(no)), h('p', { class: 'sim-stem', lang: C.locale.slice(0, 2) }, it.stem)));
    if (it.audio) {
      var max = part.plays || 1, btn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm sim-play' });
      var used = st.plays[it.id] || 0;
      var label = function () { btn.textContent = used >= max ? T('js.sim.played') : T('js.sim.play') + (max > 1 ? ' (' + (max - used) + '×)' : ''); btn.disabled = used >= max; };
      label();
      btn.addEventListener('click', function () {
        if (used >= max) return;
        used++; st.plays[it.id] = used; keep();
        btn.disabled = true; btn.textContent = T('js.sim.playing');
        var lines = it.audio.slice();
        if (it.spoken) it.spoken.forEach(function (o, i) { lines.push({ s: 'N', t: (i + 1) + '. ' + o }); });
        speakLines(lines, label);
      });
      add(box, btn);
    }
    if (it.kind === 'gap') {
      var inp = h('input', { type: 'text', class: 'sim-gap', autocomplete: 'off', spellcheck: 'false', 'aria-label': it.stem });
      if (typeof st.answers[it.id] === 'string') inp.value = st.answers[it.id];
      inp.addEventListener('input', function () { if (inp.value.trim()) st.answers[it.id] = inp.value; else delete st.answers[it.id]; keep(); count(); });
      add(box, h('div', { class: 'sim-opts' }, inp));
      return box;
    }
    if (it.kind === 'write' || it.kind === 'speak') {
      var cur = st.answers[it.id] && typeof st.answers[it.id] === 'object' ? st.answers[it.id] : {};
      var ta = null, wc = null;
      if (it.kind === 'write') {
        ta = h('textarea', { class: 'sim-write', rows: 7, lang: C.locale.slice(0, 2), placeholder: T('js.sim.writeHere') });
        ta.value = cur.text || '';
        wc = h('span', { class: 'small muted' });
        var words = function () { var n = (ta.value.trim().match(/\S+/g) || []).length; wc.textContent = T('js.sim.words', { n: n }); };
        words();
        add(box, h('div', { class: 'sim-opts' }, ta, wc));
      }
      if (it.cues && it.cues.length) add(box, h('div', { class: 'sim-cues' }, h('small', null, T('js.sim.cards')), h('ul', null, it.cues.map(function (c) { return h('li', { lang: C.locale.slice(0, 2) }, c); }))));
      var rub = h('fieldset', { class: 'sim-rubric' }, h('legend', null, T('js.sim.selfCheck', { n: it.points })));
      var checks = [];
      (it.rubric || []).forEach(function (r, i) {
        var cb = h('input', { type: 'checkbox', id: it.id + '-r' + i });
        if (cur.checks && cur.checks[i]) cb.checked = true;
        checks.push(cb);
        add(rub, h('label', { for: it.id + '-r' + i, class: 'sim-rc' }, cb, h('span', null, r.t), h('b', null, '+' + r.pts)));
      });
      var save = function () {
        var score = 0, marks = checks.map(function (cb, i) { if (cb.checked) score += it.rubric[i].pts; return cb.checked; });
        var o = { score: score, checks: marks };
        if (ta) { o.text = ta.value; if (!ta.value.trim()) { delete st.answers[it.id]; keep(); count(); return; } }
        st.answers[it.id] = o; keep(); count();
      };
      checks.forEach(function (cb) { cb.addEventListener('change', save); });
      if (ta) ta.addEventListener('input', function () { words(); save(); });
      add(box, rub);
      if (it.kind === 'speak') {
        var done = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, T('js.sim.spoken'));
        done.addEventListener('click', function () { save(); done.textContent = '✓ ' + T('js.sim.spoken'); });
        add(box, done);
      }
      return box;
    }
    var opts = h('div', { class: 'sim-opts' + (it.spoken ? ' row' : '') });
    it.options.forEach(function (o, i) {
      var id = it.id + '-' + i;
      var inp = h('input', { type: 'radio', name: it.id, id: id, value: String(i) });
      if (st.answers[it.id] === i) inp.checked = true;
      inp.addEventListener('change', function () { st.answers[it.id] = i; keep(); count(); });
      add(opts, h('label', { class: 'sim-opt', for: id }, inp, h('span', { class: 'k' }, String(i + 1)), it.spoken ? null : h('span', { lang: C.locale.slice(0, 2) }, o)));
    });
    add(box, opts);
    return box;
  }
  function count() {
    var n = Object.keys(st.answers).length;
    if (prog) prog.style.setProperty('--p', (n / total * 100).toFixed(1) + '%');
  }

  /* ── bagian & waktu ─────────────────────────────────────────────────── */
  var tick = null;
  function fmt(ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function startTimer() {
    clearInterval(tick);
    var step = function () {
      var left = st.ends - Date.now();
      timerEl.textContent = fmt(left);
      timerEl.classList.toggle('low', left < 5 * 60000);
      if (left <= 0) { clearInterval(tick); if (window.ljToast) window.ljToast(T('js.sim.timeUp'), 3000); closeSection(true); }
    };
    step();
    tick = setInterval(step, 500);
  }
  function showSection(i) {
    if (synth) synth.cancel();
    st.sec = i; keep();
    var s = M.sections[i];
    if (!st.ends || st.endsFor !== i) { st.ends = Date.now() + s.minutes * 60000; st.endsFor = i; keep(); }
    secEl.textContent = ' · ' + T('js.sim.sectionOf', { a: i + 1, b: M.sections.length }) + ' · ' + s.name;
    body.textContent = ''; body.hidden = false; intro.hidden = true; shownPassages = {};
    add(body, h('h2', { class: 'sim-sec', lang: C.locale.slice(0, 2) }, s.name));
    var no = 0;
    s.parts.forEach(function (p) {
      var part = h('section', { class: 'sim-part' }, h('h3', null, h('span', { lang: C.locale.slice(0, 2) }, p.name)), h('p', { class: 'small muted', lang: 'id' }, p.about));
      p.items.forEach(function (it) {
        if (it.passage && !shownPassages[it.passage]) { shownPassages[it.passage] = 1; add(part, h('div', { class: 'sim-passage', lang: C.locale.slice(0, 2) }, M.passages[it.passage] || '')); }
        add(part, item(it, p, ++no));
      });
      add(body, part);
    });
    var last = i === M.sections.length - 1;
    var btn = h('button', { type: 'button', class: 'btn btn-gold btn-lg' }, last ? T('js.sim.finish') : T('js.sim.next'));
    btn.addEventListener('click', function () { closeSection(false); });
    add(body, h('div', { class: 'sim-foot' }, btn));
    count(); startTimer(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function closeSection(auto) {
    var s = M.sections[st.sec];
    var missing = s.parts.reduce(function (n, p) { return n + p.items.filter(function (it) { return st.answers[it.id] === undefined; }).length; }, 0);
    if (!auto && missing && !window.confirm(T('js.sim.confirm', { n: missing }))) return;
    st.ends = null; keep();
    if (st.sec < M.sections.length - 1) showSection(st.sec + 1); else finish();
  }

  /* ── nilai & hasil ──────────────────────────────────────────────────── */
  function finish() {
    clearInterval(tick); if (synth) synth.cancel();
    body.hidden = true; timerEl.textContent = '✓';
    result.hidden = false; result.textContent = T('js.sim.grading');
    fetch('/api/simulasi/' + encodeURIComponent(M.id) + '/nilai', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers: st.answers }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || 'x'); try { sessionStorage.removeItem(KEY); } catch (e) { /* abaikan */ } render(j.result); })
      .catch(function () { result.textContent = T('common.gradeFail'); });
  }
  function render(r) {
    result.textContent = '';
    var why = [];
    if (r.total < r.passMark) why.push(T('js.sim.reasonTotal', { pass: r.passMark }));
    r.groups.forEach(function (g) { if (!g.ok) why.push(g.attempted === false ? T('js.sim.reasonMissing', { name: g.name }) : T('js.sim.reasonGroup', { name: g.name, min: g.min })); });
    add(result, h('div', { class: 'sim-score ' + (r.pass ? 'ok' : 'bad') },
      h('div', null, h('small', null, T('js.sim.total')), h('b', null, r.total + ' / ' + r.max)),
      h('span', { class: 'sim-badge' }, (r.pass ? '🎉 ' + T('js.sim.pass') : T('js.sim.fail')) + (r.grade ? ' · ' + r.grade : ''))));
    if (r.factor) add(result, h('p', { class: 'small muted' }, T('js.sim.factor', { f: r.factor })));
    if (why.length) add(result, h('p', { class: 'notice' }, T('js.sim.why') + ': ' + why.join(' · ')));
    var gl = h('div', { class: 'sim-groups-res' });
    r.groups.forEach(function (g) {
      add(gl, h('div', { class: 'card ' + (g.ok ? '' : 'sim-low') }, h('small', { lang: C.locale.slice(0, 2) }, g.name), h('b', null, g.score + ' / ' + g.max), g.min !== null && g.min !== undefined ? h('span', { class: 'small muted' }, T('js.sim.groupMin', { n: g.min })) : null, h('div', { class: 'progress' }, h('i', { style: '--p:' + Math.round(g.score / g.max * 100) + '%' }))));
    });
    add(result, gl);
    var pt = h('table', { class: 'table' }, h('tr', null, h('th', null, T('js.sim.parts')), h('th', null, '✓')));
    r.parts.forEach(function (p) { add(pt, h('tr', null, h('td', { lang: C.locale.slice(0, 2) }, p.name), h('td', null, p.correct + ' / ' + p.items))); });
    add(result, h('div', { class: 'table-wrap', style: 'margin:18px 0' }, pt));
    var rev = h('details', { class: 'sim-review', open: true }, h('summary', null, T('js.sim.review')));
    var no = 0, byId = {};
    r.items.forEach(function (x) { byId[x.id] = x; });
    M.sections.forEach(function (s) { s.parts.forEach(function (p) { p.items.forEach(function (it) {
      var x = byId[it.id], opts = x.options || it.options; no++;
      var lng = C.locale.slice(0, 2), body;
      if (x.kind === 'gap') body = h('p', null, (x.ok ? '✓ ' : '✗ ') + T('js.yourAnswer') + ': ', h('b', null, x.text || T('js.sim.unanswered')), x.ok ? null : [' · ' + T('js.keyCol') + ': ', h('b', { lang: lng }, (x.accept || []).join(' / '))]);
      else if (x.kind === 'write' || x.kind === 'speak') body = [
        x.text ? h('p', { class: 'sim-mytext', lang: lng }, x.text) : null,
        h('p', null, T('js.sim.selfScore') + ': ', h('b', null, x.earned + ' / ' + x.max)),
        x.model ? h('p', { class: 'small' }, h('b', null, T('js.sim.model') + ': '), h('span', { lang: lng }, x.model)) : null];
      else body = h('p', null, (x.ok ? '✓ ' : '✗ ') + T('js.yourAnswer') + ': ', h('b', null, x.chosen >= 0 ? opts[x.chosen] : T('js.sim.unanswered')), x.ok ? null : [' · ' + T('js.keyCol') + ': ', h('b', null, opts[x.answer])]);
      add(rev, h('div', { class: 'sim-rq ' + (x.kind === 'write' || x.kind === 'speak' ? 'self' : x.ok ? 'ok' : 'bad') },
        h('p', { class: 'sim-stem', lang: lng }, no + '. ' + it.stem),
        it.audio ? h('p', { class: 'small muted', lang: lng }, '🎧 ' + it.audio.map(function (l) { return l.t; }).join(' ／ ')) : null,
        body, h('p', { class: 'small' }, x.why)));
    }); }); });
    add(result, rev);
    var acts = h('div', { class: 'row', style: 'gap:10px;margin-top:18px;flex-wrap:wrap' });
    var pr = h('button', { type: 'button', class: 'btn btn-ghost' }, T('js.sim.print')); pr.addEventListener('click', function () { window.print(); });
    add(acts, pr);
    if (C.next) add(acts, h('a', { class: 'btn btn-gold', href: C.next }, T('js.sim.nextMock') + ' →'));
    add(result, acts);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('[data-sim-start]').addEventListener('click', function () { showSection(st.sec >= 0 ? st.sec : 0); });
  if (st.sec >= 0) showSection(st.sec);
})();
