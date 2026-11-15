/* LUAJA — mesin pelajaran 10 langkah. Jawaban diperiksa server; kunci kuis baru datang setelah semua soal dikumpulkan. */
(function () {
  'use strict';
  var wrap = document.querySelector('[data-lesson]'); if (!wrap) return;
  var L = JSON.parse(document.getElementById('lesson').textContent);
  var loc = L.locale, rate = 1, d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var toast = function (m) { window.ljToast && window.ljToast(m); };

  /* suara: kecepatan & putar seluruh dialog */
  $$('[data-rate]').forEach(function (b) { b.addEventListener('click', function () { rate = parseFloat(b.getAttribute('data-rate')); $$('[data-rate]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $$('[data-say]').forEach(function (x) { x.setAttribute('data-rate', String(rate)); }); }); });
  var playAll = $('[data-play-all]');
  if (playAll) playAll.addEventListener('click', function () {
    var lines = $$('#langkah-2 .line'), i = 0;
    (function next() { $$('.line.playing').forEach(function (x) { x.classList.remove('playing'); }); if (i >= lines.length) return; var ln = lines[i++]; ln.classList.add('playing'); ln.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); window.ljSay(ln.querySelector('.fo').textContent, loc, rate, function () { setTimeout(next, 350); }); })();
  });
  var trBtn = $('[data-toggle-tr]'), trOn = true;
  if (trBtn) trBtn.addEventListener('click', function () { trOn = !trOn; $$('[data-tr]').forEach(function (x) { x.style.visibility = trOn ? '' : 'hidden'; }); trBtn.textContent = trOn ? 'Sembunyikan terjemahan' : 'Tampilkan terjemahan'; });
  var focusBtn = $('[data-focus]');
  if (focusBtn) focusBtn.addEventListener('click', function () { d.body.classList.toggle('focus-mode'); focusBtn.textContent = d.body.classList.contains('focus-mode') ? 'Keluar mode fokus' : 'Mode fokus'; });
  $$('.prose .s').forEach(function (s) { s.addEventListener('click', function () { $$('.prose .s.on').forEach(function (x) { x.classList.remove('on'); }); s.classList.add('on'); }); });

  /* penanda langkah aktif */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var n = e.target.id.split('-')[1]; $$('.stepper a').forEach(function (a) { a.classList.toggle('now', a.getAttribute('data-step') === n); }); } }); }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.panel[id^="langkah-"]').forEach(function (p) { io.observe(p); });
  }

  /* render latihan */
  function render(ex, part, i) {
    var id = part + '-' + i, h = '<div class="exercise" data-part="' + part + '" data-i="' + i + '" id="' + id + '"><div class="q">' + esc(ex.prompt) + (ex.promptId ? '<small>' + esc(ex.promptId) + '</small>' : '') + '</div>';
    if (ex.type === 'choice') h += '<div class="opts">' + ex.options.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '"><span class="k">' + String.fromCharCode(65 + k) + '</span><span lang="' + loc.slice(0, 2) + '">' + esc(o) + '</span></button>'; }).join('') + '</div>';
    if (ex.type === 'gap') h += '<div class="gapline" lang="' + loc.slice(0, 2) + '">' + esc(ex.before) + ' <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Isian"> ' + esc(ex.after) + '</div>';
    if (ex.type === 'translate') h += '<div class="src">' + esc(ex.source) + '</div><input type="text" class="input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terjemahan">';
    if (ex.type === 'dictation') h += '<div class="row"><button class="btn btn-ghost btn-sm" type="button" data-say="' + esc(ex.say) + '" data-lang="' + loc + '">▶ Putar</button><button class="btn btn-ghost btn-sm" type="button" data-say="' + esc(ex.say) + '" data-lang="' + loc + '" data-rate="0.7">▶ Lambat</button></div><input type="text" class="input" style="margin-top:10px" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Yang Anda dengar">';
    if (ex.type === 'order') h += '<div class="chips target" data-target></div><div class="chips" data-pool>' + ex.words.map(function (w, k) { return '<button type="button" class="chip" data-w="' + k + '">' + esc(w) + '</button>'; }).join('') + '</div>';
    if (ex.type === 'match') h += '<div class="match">' + ex.left.map(function (a, k) { return '<button type="button" class="m" data-side="l" data-v="' + esc(a) + '">' + esc(a) + '</button><button type="button" class="m" data-side="r" data-v="' + esc(ex.right[k]) + '">' + esc(ex.right[k]) + '</button>'; }).join('') + '</div>';
    if (ex.type === 'speak') h += '<div class="src" lang="' + loc.slice(0, 2) + '">' + esc(ex.say) + '</div><p class="small muted" style="margin:0 0 10px">' + esc(ex.id) + '</p><div class="row"><button class="btn btn-ghost btn-sm" type="button" data-say="' + esc(ex.say) + '" data-lang="' + loc + '">▶ Contoh</button><button class="mic" type="button" data-mic aria-label="Rekam ucapan">🎤</button><span class="heard" data-heard></span></div>';
    if (part !== 'quiz' && ex.type !== 'choice' && ex.type !== 'match') h += '<div class="ex-actions"><button class="btn btn-sm" type="button" data-check>Periksa</button></div>';
    return h + '<div class="fb" data-fb></div></div>';
  }
  ['practice', 'independent', 'quiz'].forEach(function (part) { var box = $('[data-ex="' + part + '"]'); if (box) box.innerHTML = L[part].map(function (ex, i) { return render(ex, part, i); }).join(''); });

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
    if (v === null || v === '' || (ex.type === 'match' && Object.keys(v).length < ex.left.length)) { toast('Jawab dulu, lalu periksa.'); return; }
    fetch('/api/pelajaran/' + L.code + '/cek', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ part: part, i: i, answer: v }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (j.error) return toast(j.error);
        box.classList.remove('ok', 'bad'); void box.offsetWidth; box.classList.add(j.ok ? 'ok' : 'bad');
        box.querySelector('[data-fb]').innerHTML = (j.ok ? '<b>Tepat!</b> ' : '<b>Belum tepat.</b> Jawaban: <b>' + esc(j.shown) + '</b>. ') + esc(j.why || '');
        if (ex.type === 'choice') $$('.opt', box).forEach(function (b) { b.classList.remove('ok', 'bad'); if (Number(b.getAttribute('data-k')) === Number(v)) b.classList.add(j.ok ? 'ok' : 'bad'); });
      }).catch(function () { toast('Koneksi terputus. Coba lagi.'); });
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
  wrap.addEventListener('input', function (e) { var box = e.target.closest('.exercise[data-part="quiz"]'); if (!box) return; var i = Number(box.getAttribute('data-i')); quizAns[i] = e.target.value; quizPaint(); });
  wrap.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.matches('.exercise:not([data-part="quiz"]) input')) { e.preventDefault(); check(e.target.closest('.exercise')); } });

  /* pengenal suara peramban */
  function listen(box) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Peramban ini belum mendukung pengenal suara. Coba Chrome di Android/desktop.'); return; }
    var rec = new SR(), mic = box.querySelector('[data-mic]'); rec.lang = loc; rec.interimResults = false; rec.maxAlternatives = 1;
    mic.classList.add('on'); rec.onresult = function (ev) { box._heard = ev.results[0][0].transcript; box.querySelector('[data-heard]').textContent = '„' + box._heard + '“'; check(box); };
    rec.onend = function () { mic.classList.remove('on'); }; rec.onerror = function () { mic.classList.remove('on'); toast('Suara tidak tertangkap. Coba lagi.'); };
    rec.start();
  }

  /* kuis */
  var qBtn = $('[data-quizsubmit]'), qLeft = $('[data-quizleft]');
  function quizPaint() { var n = L.quiz.length, c = 0; for (var k = 0; k < n; k++) { var v = quizAns[k]; if (v !== undefined && v !== null && String(v).trim() !== '') c++; } qBtn.disabled = c < n; qLeft.textContent = c < n ? (n - c) + ' soal lagi — kunci terbuka setelah semua dijawab.' : 'Semua soal terjawab.'; }
  quizPaint();
  qBtn.addEventListener('click', function () {
    qBtn.disabled = true; qBtn.textContent = 'Menilai…';
    var answers = L.quiz.map(function (_, k) { return quizAns[k]; });
    fetch('/api/pelajaran/' + L.code + '/kuis', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers: answers }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || 'Gagal menilai');
        var g = res.j, pct = Math.round(g.pct * 100);
        $('[data-quizbar]').hidden = true;
        g.items.forEach(function (it, k) { var box = d.getElementById('quiz-' + k); box.classList.add('locked', it.ok ? 'ok' : 'bad'); box.querySelector('[data-fb]').innerHTML = (it.ok ? '<b>Benar.</b> ' : '<b>Kunci: ' + esc(it.shown) + '.</b> ') + esc(it.why); $$('input,button', box).forEach(function (x) { x.disabled = true; }); if (L.quiz[k].type === 'choice') $$('.opt', box).forEach(function (b) { var kk = Number(b.getAttribute('data-k')); if (b.getAttribute('aria-pressed') === 'true') b.classList.add(it.ok ? 'ok' : 'bad'); }); });
        var out = $('[data-quizresult]'); out.hidden = false;
        out.innerHTML = '<div class="score ' + (g.passed ? 'pass' : '') + '"><div class="ring" style="--p:' + pct + '"><span>' + pct + '%</span></div><div><h3 style="margin:0">' + (g.passed ? 'Lulus! Pelajaran berikutnya terbuka.' : 'Belum mencapai 80 %') + '</h3><p style="margin:6px 0 0">' + esc(g.message) + '</p>' + (L.loggedIn ? '' : '<p class="small muted" style="margin:6px 0 0"><a href="/masuk">Masuk</a> agar kemajuan tersimpan.</p>') + '<div class="row" style="margin-top:12px">' + (g.passed ? ($('[data-next]') ? '<a class="btn btn-gold" href="' + $('[data-next]').getAttribute('href') + '">Pelajaran berikutnya →</a>' : '') : '<button class="btn btn-gold" type="button" onclick="location.reload()">Ulangi pelajaran</button>') + '</div></div></div>';
        out.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(function (err) { qBtn.disabled = false; qBtn.textContent = 'Kumpulkan kuis'; toast(err.message); });
  });
})();
