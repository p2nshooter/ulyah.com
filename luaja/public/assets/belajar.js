/* LUAJA — mesin pelajaran 10 langkah. Jawaban diperiksa server; kunci kuis baru datang setelah semua soal dikumpulkan.
 * Semua elemen dibangun lewat DOM (textContent), tidak pernah dari string HTML. */
(function () {
  'use strict';
  var wrap = document.querySelector('[data-lesson]'); if (!wrap) return;
  var L = JSON.parse(document.getElementById('lesson').textContent);
  var loc = L.locale, lang2 = loc.slice(0, 2), rate = 1, d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var toast = function (m) { if (window.ljToast) window.ljToast(m); };
  var T = function (k, v) { var s = (window.LJ && window.LJ.t && window.LJ.t[k]) || k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  function h(tag, attrs) {
    var el = d.createElement(tag), k;
    if (attrs) for (k in attrs) { if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue; if (k === 'class') el.className = attrs[k]; else el.setAttribute(k, attrs[k] === true ? '' : String(attrs[k])); }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; } el.appendChild(typeof c === 'object' ? c : d.createTextNode(String(c))); }
  function setText(el, parts) { el.textContent = ''; add(el, parts); }

  /* suara: kecepatan & putar seluruh dialog */
  $$('[data-rate]').forEach(function (b) { b.addEventListener('click', function () { rate = parseFloat(b.getAttribute('data-rate')); $$('[data-rate]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $$('[data-say]').forEach(function (x) { if (!x.hasAttribute('data-fixed-rate')) x.setAttribute('data-rate', String(rate)); }); }); });
  var playAll = $('[data-play-all]');
  if (playAll) playAll.addEventListener('click', function () {
    var lines = $$('#langkah-2 .line'), i = 0;
    (function next() { $$('.line.playing').forEach(function (x) { x.classList.remove('playing'); }); if (i >= lines.length) return; var ln = lines[i++]; ln.classList.add('playing'); ln.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); window.ljSay(ln.querySelector('.fo').textContent, loc, rate, function () { setTimeout(next, 350); }); })();
  });
  var trBtn = $('[data-toggle-tr]'), trOn = true;
  if (trBtn) trBtn.addEventListener('click', function () { trOn = !trOn; $$('[data-tr]').forEach(function (x) { x.style.visibility = trOn ? '' : 'hidden'; }); trBtn.textContent = trOn ? T('lesson.hideTr') : T('lesson.showTr'); });
  var focusBtn = $('[data-focus]');
  if (focusBtn) focusBtn.addEventListener('click', function () { d.body.classList.toggle('focus-mode'); focusBtn.textContent = d.body.classList.contains('focus-mode') ? T('lesson.focusOff') : T('lesson.focus'); });
  $$('.prose .s').forEach(function (s) { s.addEventListener('click', function () { $$('.prose .s.on').forEach(function (x) { x.classList.remove('on'); }); s.classList.add('on'); }); });

  /* penanda langkah aktif */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var n = e.target.id.split('-')[1]; $$('.stepper a').forEach(function (a) { a.classList.toggle('now', a.getAttribute('data-step') === n); }); } }); }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.panel[id^="langkah-"]').forEach(function (p) { io.observe(p); });
  }

  /* render latihan */
  var textInput = function (cls, label) { return h('input', { type: 'text', class: cls, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': label }); };
  function render(ex, part, i) {
    var box = h('div', { class: 'exercise', 'data-part': part, 'data-i': i, id: part + '-' + i }, h('div', { class: 'q' }, ex.prompt, ex.promptId ? h('small', null, ex.promptId) : null));
    if (ex.type === 'choice') box.appendChild(h('div', { class: 'opts' }, ex.options.map(function (o, k) { return h('button', { type: 'button', class: 'opt', 'data-k': k }, h('span', { class: 'k' }, String.fromCharCode(65 + k)), h('span', { lang: lang2 }, o)); })));
    if (ex.type === 'gap') box.appendChild(h('div', { class: 'gapline', lang: lang2 }, ex.before, ' ', textInput('', T('js.fill')), ' ', ex.after));
    if (ex.type === 'translate') { box.appendChild(h('div', { class: 'src' }, ex.source)); box.appendChild(textInput('input', T('js.translation'))); }
    if (ex.type === 'dictation') {
      box.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', 'data-say': ex.say, 'data-lang': loc }, '▶ ' + T('common.play')), h('button', { class: 'btn btn-ghost btn-sm', type: 'button', 'data-say': ex.say, 'data-lang': loc, 'data-rate': '0.7', 'data-fixed-rate': true }, '▶ ' + T('common.slow'))));
      var inp = textInput('input', T('js.heard')); inp.style.marginTop = '10px'; box.appendChild(inp);
    }
    if (ex.type === 'order') { box.appendChild(h('div', { class: 'chips target', 'data-target': true })); box.appendChild(h('div', { class: 'chips', 'data-pool': true }, ex.words.map(function (w, k) { return h('button', { type: 'button', class: 'chip', 'data-w': k }, w); }))); }
    if (ex.type === 'match') box.appendChild(h('div', { class: 'match' }, ex.left.map(function (a, k) { return [h('button', { type: 'button', class: 'm', 'data-side': 'l', 'data-v': a }, a), h('button', { type: 'button', class: 'm', 'data-side': 'r', 'data-v': ex.right[k] }, ex.right[k])]; })));
    if (ex.type === 'speak') {
      box.appendChild(h('div', { class: 'src', lang: lang2 }, ex.say));
      box.appendChild(h('p', { class: 'small muted', style: 'margin:0 0 10px' }, ex.id));
      box.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', 'data-say': ex.say, 'data-lang': loc }, '▶ ' + T('js.example')), h('button', { class: 'mic', type: 'button', 'data-mic': true, 'aria-label': T('js.record') }, '🎤'), h('span', { class: 'heard', 'data-heard': true })));
    }
    if (part !== 'quiz' && ex.type !== 'choice' && ex.type !== 'match') box.appendChild(h('div', { class: 'ex-actions' }, h('button', { class: 'btn btn-sm', type: 'button', 'data-check': true }, T('js.check'))));
    box.appendChild(h('div', { class: 'fb', 'data-fb': true }));
    return box;
  }
  ['practice', 'independent', 'quiz'].forEach(function (part) { var c = $('[data-ex="' + part + '"]'); if (c) L[part].forEach(function (ex, i) { c.appendChild(render(ex, part, i)); }); });

  var quizAns = {};
  function valueOf(box, ex) {
    if (ex.type === 'choice') { var p = box.querySelector('.opt[aria-pressed="true"]'); return p ? Number(p.getAttribute('data-k')) : null; }
    if (ex.type === 'order') return $$('[data-target] .chip', box).map(function (c) { return c.textContent; }).join(' ');
    if (ex.type === 'match') return box._pairs || {};
    if (ex.type === 'speak') return box._heard || '';
    var inp = box.querySelector('input'); return inp ? inp.value : '';
  }
  function check(box) {
    var part = box.getAttribute('data-part'), i = Number(box.getAttribute('data-i')), ex = L[part][i], v = valueOf(box, ex);
    if (v === null || v === '' || (ex.type === 'match' && Object.keys(v).length < ex.left.length)) { toast(T('js.answerFirst')); return; }
    fetch('/api/pelajaran/' + encodeURIComponent(L.code) + '/cek', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ part: part, i: i, answer: v }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (j.error) return toast(j.error);
        box.classList.remove('ok', 'bad'); void box.offsetWidth; box.classList.add(j.ok ? 'ok' : 'bad');
        setText(box.querySelector('[data-fb]'), j.ok ? [h('b', null, T('js.correct')), h('span', { lang: 'id' }, j.why || '')] : [h('b', null, T('js.incorrect')), T('js.answer'), h('b', null, j.shown), '. ', h('span', { lang: 'id' }, j.why || '')]);
        if (ex.type === 'choice') $$('.opt', box).forEach(function (b) { b.classList.remove('ok', 'bad'); if (Number(b.getAttribute('data-k')) === Number(v)) b.classList.add(j.ok ? 'ok' : 'bad'); });
      }).catch(function () { toast(T('common.offline')); });
  }

  wrap.addEventListener('click', function (e) {
    var box = e.target.closest('.exercise'); if (!box) return;
    var part = box.getAttribute('data-part'), i = Number(box.getAttribute('data-i')), ex = L[part][i];
    if (part === 'quiz' && box.classList.contains('locked')) return;
    var opt = e.target.closest('.opt');
    if (opt) { $$('.opt', box).forEach(function (b) { b.setAttribute('aria-pressed', String(b === opt)); }); if (part === 'quiz') { quizAns[i] = Number(opt.getAttribute('data-k')); quizPaint(); } else check(box); return; }
    var chip = e.target.closest('.chip');
    if (chip) { var tgt = box.querySelector('[data-target]'), pool = box.querySelector('[data-pool]'); (chip.parentNode === pool ? tgt : pool).appendChild(chip); if (part === 'quiz') { quizAns[i] = valueOf(box, ex); quizPaint(); } return; }
    var m = e.target.closest('.m');
    if (m && !m.classList.contains('ok')) {
      var side = m.getAttribute('data-side'); $$('.m[data-side="' + side + '"]', box).forEach(function (x) { if (x !== m) x.setAttribute('aria-pressed', 'false'); }); m.setAttribute('aria-pressed', String(m.getAttribute('aria-pressed') !== 'true'));
      var l = box.querySelector('.m[data-side="l"][aria-pressed="true"]'), r = box.querySelector('.m[data-side="r"][aria-pressed="true"]');
      if (l && r) { box._pairs = box._pairs || {}; box._pairs[l.getAttribute('data-v')] = r.getAttribute('data-v'); l.classList.add('ok'); r.classList.add('ok'); l.setAttribute('aria-pressed', 'false'); r.setAttribute('aria-pressed', 'false'); if (Object.keys(box._pairs).length === ex.left.length) check(box); }
      return;
    }
    if (e.target.closest('[data-check]')) { check(box); return; }
    if (e.target.closest('[data-mic]')) listen(box);
  });
  wrap.addEventListener('input', function (e) { var box = e.target.closest('.exercise[data-part="quiz"]'); if (!box) return; quizAns[Number(box.getAttribute('data-i'))] = e.target.value; quizPaint(); });
  wrap.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.matches('.exercise:not([data-part="quiz"]) input')) { e.preventDefault(); check(e.target.closest('.exercise')); } });

  /* pengenal suara peramban */
  function listen(box) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast(T('js.noSR')); return; }
    var rec = new SR(), mic = box.querySelector('[data-mic]'); rec.lang = loc; rec.interimResults = false; rec.maxAlternatives = 1;
    mic.classList.add('on'); rec.onresult = function (ev) { box._heard = ev.results[0][0].transcript; box.querySelector('[data-heard]').textContent = '„' + box._heard + '“'; check(box); };
    rec.onend = function () { mic.classList.remove('on'); }; rec.onerror = function () { mic.classList.remove('on'); toast(T('js.notHeard')); };
    rec.start();
  }

  /* kuis */
  var qBtn = $('[data-quizsubmit]'), qLeft = $('[data-quizleft]');
  function quizPaint() { var n = L.quiz.length, c = 0; for (var k = 0; k < n; k++) { var v = quizAns[k]; if (v !== undefined && v !== null && String(v).trim() !== '') c++; } qBtn.disabled = c < n; qLeft.textContent = c < n ? T('js.quizLeft', { n: n - c }) : T('js.allAnswered'); }
  quizPaint();
  qBtn.addEventListener('click', function () {
    qBtn.disabled = true; qBtn.textContent = T('common.grading');
    var answers = L.quiz.map(function (_, k) { return quizAns[k]; });
    fetch('/api/pelajaran/' + encodeURIComponent(L.code) + '/kuis', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers: answers }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || T('common.gradeFail'));
        var g = res.j, pct = Math.round(g.pct * 100);
        $('[data-quizbar]').hidden = true;
        g.items.forEach(function (it, k) {
          var box = d.getElementById('quiz-' + k); box.classList.add('locked', it.ok ? 'ok' : 'bad');
          setText(box.querySelector('[data-fb]'), [h('b', null, it.ok ? T('js.right') : T('js.key') + it.shown + '. '), h('span', { lang: 'id' }, it.why)]);
          $$('input,button', box).forEach(function (x) { x.disabled = true; });
          if (L.quiz[k].type === 'choice') $$('.opt', box).forEach(function (b) { if (b.getAttribute('aria-pressed') === 'true') b.classList.add(it.ok ? 'ok' : 'bad'); });
        });
        var nextLink = $('[data-next]');
        var out = $('[data-quizresult]'); out.hidden = false;
        setText(out, h('div', { class: 'score' + (g.passed ? ' pass' : '') },
          h('div', { class: 'ring', style: '--p:' + pct }, h('span', null, pct + '%')),
          h('div', null, h('h3', { style: 'margin:0' }, g.passed ? T('js.passed') : T('js.notPassed')), h('p', { style: 'margin:6px 0 0' }, g.message),
            L.loggedIn ? null : h('p', { class: 'small muted', style: 'margin:6px 0 0' }, h('a', { href: '/masuk' }, T('practice.guest.login')), ' ', T('js.loginSave')),
            h('div', { class: 'row', style: 'margin-top:12px' }, g.passed ? (nextLink ? h('a', { class: 'btn btn-gold', href: nextLink.getAttribute('href') }, T('js.nextLesson')) : null) : h('a', { class: 'btn btn-gold', href: location.pathname }, T('js.retryLesson'))))));
        out.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(function (err) { qBtn.disabled = false; qBtn.textContent = T('lesson.quizSubmit'); toast(err.message); });
  });
})();
