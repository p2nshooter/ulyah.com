/* LUAJA — pengerjaan paket latihan. Kunci jawaban hanya datang dari server setelah semua soal dikumpulkan. */
(function () {
  'use strict';
  var root = document.querySelector('[data-practice]'); if (!root) return;
  var set = JSON.parse(document.getElementById('pset').textContent);
  var meta = JSON.parse(document.getElementById('pmeta').textContent);
  var KEY = 'lj_lat_' + set.id;
  var answers = {}; try { answers = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { answers = {}; }
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var mark = function (s) { return esc(s).replace(/【(.+?)】/g, '<u class="mark">$1</u>').replace(/___/g, '<span class="blank">＿＿＿</span>').replace(/\n/g, '<br>'); };
  var listEl = $('[data-questions]'), navEl = $('[data-qnav]'), submit = $('[data-submit]'), left = $('[data-left]'), resultEl = $('[data-result]');
  var n = set.questions.length, shownPassage = {};
  var parts = [];
  set.questions.forEach(function (q, i) {
    if (q.passage && !shownPassage[q.passage] && set.passages[q.passage]) {
      shownPassage[q.passage] = 1; var p = set.passages[q.passage];
      parts.push('<article class="passage card"><h3>' + esc(p.title || 'Bacaan') + '</h3><div class="passage-text" lang="' + root.getAttribute('data-lang') + '">' + mark(p.text) + '</div><button class="btn btn-ghost btn-sm" type="button" data-say="' + esc(p.text) + '" data-lang="' + root.getAttribute('data-lang') + '">▶ Dengarkan</button></article>');
    }
    parts.push('<div class="exercise pq" id="' + q.id + '" data-i="' + i + '"><div class="q"><small>' + esc(q.section) + (q.hint ? ' · ' + esc(q.hint) : '') + '</small><span lang="' + root.getAttribute('data-lang') + '">' + mark(q.stem) + '</span></div><div class="opts" role="radiogroup">' +
      q.options.map(function (op, k) { return '<button type="button" class="opt" role="radio" aria-checked="false" data-q="' + q.id + '" data-k="' + k + '"><span class="k">' + String.fromCharCode(65 + k) + '</span><span>' + mark(op) + '</span></button>'; }).join('') +
      '</div><div class="fb" data-fb></div></div>');
  });
  listEl.innerHTML = parts.join('');
  navEl.innerHTML = set.questions.map(function (q, i) { return '<a href="#' + q.id + '" data-nav="' + q.id + '">' + (i + 1) + '</a>'; }).join('');

  function paint() {
    var c = 0;
    set.questions.forEach(function (q) {
      var v = answers[q.id], has = v !== undefined && v !== null;
      if (has) c++;
      document.querySelectorAll('[data-q="' + q.id + '"]').forEach(function (b) { var on = has && Number(b.getAttribute('data-k')) === Number(v); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-checked', String(on)); });
      var nv = navEl.querySelector('[data-nav="' + q.id + '"]'); if (nv) nv.classList.toggle('done', has);
    });
    var ring = $('[data-ring]'); if (ring) ring.style.setProperty('--p', Math.round(c / n * 100));
    var cnt = $('[data-count]'); if (cnt) cnt.textContent = c + '/' + n;
    submit.disabled = c < n;
    left.textContent = c < n ? 'Masih ' + (n - c) + ' soal belum dijawab — kunci jawaban terbuka setelah semuanya terjawab.' : 'Semua soal terjawab. Kumpulkan untuk melihat nilai, kunci dan pembahasan.';
    try { sessionStorage.setItem(KEY, JSON.stringify(answers)); } catch (e) { /* abaikan */ }
  }
  var locked = false;
  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('.opt[data-q]'); if (!b || locked) return;
    answers[b.getAttribute('data-q')] = Number(b.getAttribute('data-k')); paint();
  });
  paint();

  /* penghitung waktu (tidak mengumpulkan otomatis) */
  var tEl = $('[data-timer]'), secs = Number(tEl.getAttribute('data-minutes')) * 60, t0 = Date.now();
  var tick = setInterval(function () { if (locked) return clearInterval(tick); var s = secs - Math.floor((Date.now() - t0) / 1000); var neg = s < 0; s = Math.abs(s); tEl.textContent = (neg ? '+' : '') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); tEl.classList.toggle('over', neg); }, 1000);

  submit.addEventListener('click', function () {
    submit.disabled = true; submit.textContent = 'Menilai…';
    fetch('/api/latihan/' + set.id, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers: answers, seconds: Math.round((Date.now() - t0) / 1000) }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) { if (!res.ok) throw new Error(res.j.error || 'Gagal menilai'); show(res.j); })
      .catch(function (err) { submit.disabled = false; submit.textContent = 'Kumpulkan & lihat hasil'; window.ljToast && window.ljToast(err.message); });
  });

  function show(g) {
    locked = true; try { sessionStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
    $('[data-submitbar]').hidden = true;
    var pct = Math.round(g.pct * 100);
    g.items.forEach(function (it) {
      var box = document.getElementById(it.id); if (!box) return;
      box.classList.add(it.ok ? 'ok' : 'bad');
      box.querySelectorAll('.opt').forEach(function (b) { var k = Number(b.getAttribute('data-k')); if (k === it.answer) b.classList.add('ok'); else if (k === it.chosen) b.classList.add('bad'); b.disabled = true; });
      box.querySelector('[data-fb]').innerHTML = (it.ok ? '<b>Benar.</b> ' : '<b>Kunci: ' + String.fromCharCode(65 + it.answer) + '.</b> ') + esc(it.why);
      var nv = navEl.querySelector('[data-nav="' + it.id + '"]'); if (nv) nv.classList.add(it.ok ? 'right' : 'wrong');
    });
    resultEl.hidden = false;
    resultEl.innerHTML = '<div class="result card">' +
      '<div class="score ' + (g.prediction.pass ? 'pass' : '') + '"><div class="ring" style="--p:' + pct + '"><span>' + pct + '%</span></div><div><p class="eyebrow" style="margin:0 0 4px">Hasil Anda</p><h2 style="margin:0">' + g.correct + ' dari ' + g.total + ' benar</h2><p style="margin:6px 0 0">' + esc(meta.course) + ' · ' + esc(meta.level) + '</p></div></div>' +
      '<div class="predict"><div><small>Prediksi nilai sementara</small><b>' + esc(g.prediction.score) + '</b><span>' + esc(g.prediction.scale) + '</span></div>' + (g.prediction.pass === undefined ? '' : '<span class="pill ' + (g.prediction.pass ? 'pill-ok' : 'pill-warn') + '">' + (g.prediction.pass ? 'Di atas ambang' : 'Belum mencapai ambang') + '</span>') + '</div>' +
      '<p class="small muted" style="margin:0 0 16px">' + esc(g.prediction.note) + '</p>' +
      '<blockquote class="motivate"><b>' + esc(g.message.title) + '</b><span>' + esc(g.message.text) + '</span></blockquote>' +
      '<h3 style="font-size:var(--fs-3);margin-top:22px">Per bagian</h3><div class="sections">' + g.sections.map(function (s) { var p = Math.round(s.correct / s.total * 100); return '<div class="sec"><div class="row between"><span>' + esc(s.section) + '</span><b>' + s.correct + '/' + s.total + '</b></div><div class="progress"><i style="--p:' + p + '%"></i></div></div>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:22px;flex-wrap:wrap">' + (meta.next ? '<a class="btn btn-gold" href="/latihan/' + meta.next + '">Latihan berikutnya →</a>' : '') + '<button class="btn btn-ghost" type="button" data-review>Pelajari kunci & pembahasan</button><a class="btn btn-ghost" href="/latihan/' + set.id + '">Ulangi paket ini</a><button class="btn btn-ghost" type="button" data-report>Unduh laporan</button><button class="btn btn-ghost" type="button" data-print>Cetak / PDF</button></div>' +
      (meta.loggedIn ? '<p class="small muted" style="margin:14px 0 0">Hasil ini tersimpan di <a href="/portal/latihan">riwayat latihan</a> Anda.</p>' : '<p class="small muted" style="margin:14px 0 0"><a href="/daftar">Buat akun</a> agar riwayat dan perkembangan nilai tersimpan.</p>') +
      '</div>';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resultEl.querySelector('[data-review]').addEventListener('click', function () { var first = document.querySelector('.pq'); if (first) first.scrollIntoView({ behavior: 'smooth' }); });
    resultEl.querySelector('[data-print]').addEventListener('click', function () { window.print(); });
    resultEl.querySelector('[data-report]').addEventListener('click', function () { download(g); });
  }

  function download(g) {
    var now = new Date(), date = now.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    var rows = set.questions.map(function (q, i) {
      var it = g.items[i];
      return '<tr class="' + (it.ok ? 'ok' : 'bad') + '"><td>' + (i + 1) + '</td><td>' + esc(q.section) + '</td><td>' + mark(q.stem) + '</td><td>' + esc(q.options[it.chosen]) + '</td><td>' + esc(q.options[it.answer]) + '</td><td>' + (it.ok ? '✓' : '✗') + '</td><td>' + esc(it.why) + '</td></tr>';
    }).join('');
    var doc = '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan latihan — ' + esc(set.title) + '</title><style>body{font:15px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#121a2e;max-width:980px;margin:32px auto;padding:0 20px}h1{font-family:Georgia,serif;color:#0b1f4d;margin:0}header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #f5b301;padding-bottom:12px;margin-bottom:20px}.brand{font:700 22px Georgia,serif;color:#0b1f4d}.kpi{display:flex;gap:14px;flex-wrap:wrap;margin:16px 0}.kpi div{border:1px solid #e6e2d7;border-radius:12px;padding:12px 16px;min-width:160px}.kpi b{display:block;font:700 22px Georgia,serif;color:#0b1f4d}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border-bottom:1px solid #e6e2d7;padding:8px;text-align:left;vertical-align:top}th{background:#f1f5ff}tr.bad td:nth-child(6){color:#c0392b;font-weight:700}tr.ok td:nth-child(6){color:#1f8a5b;font-weight:700}blockquote{border-left:4px solid #f5b301;background:#fff7dc;margin:16px 0;padding:12px 16px;border-radius:8px}.mark{text-decoration:underline}footer{margin-top:24px;color:#6b7390;font-size:12px}</style></head><body>' +
      '<header><div><div class="brand">LUAJA</div><h1>Laporan latihan soal</h1></div><div>' + esc(date) + '</div></header>' +
      '<p><b>' + esc(set.title) + '</b> · ' + esc(set.examName) + ' · ' + esc(meta.course) + ' ' + esc(meta.level) + '</p>' +
      '<div class="kpi"><div>Benar<b>' + g.correct + ' / ' + g.total + '</b></div><div>Persentase<b>' + Math.round(g.pct * 100) + '%</b></div><div>Prediksi nilai<b>' + esc(g.prediction.score) + '</b><small>' + esc(g.prediction.scale) + '</small></div></div>' +
      '<blockquote><b>' + esc(g.message.title) + '</b><br>' + esc(g.message.text) + '</blockquote>' +
      '<h2>Per bagian</h2><table><tr><th>Bagian</th><th>Benar</th></tr>' + g.sections.map(function (s) { return '<tr><td>' + esc(s.section) + '</td><td>' + s.correct + ' / ' + s.total + '</td></tr>'; }).join('') + '</table>' +
      '<h2>Rincian jawaban</h2><table><tr><th>#</th><th>Bagian</th><th>Soal</th><th>Jawaban Anda</th><th>Kunci</th><th></th><th>Pembahasan</th></tr>' + rows + '</table>' +
      '<footer>' + esc(g.prediction.note) + ' · luaja.com</footer></body></html>';
    var blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'laporan-luaja-' + set.id + '-' + now.toISOString().slice(0, 10) + '.html';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
})();
