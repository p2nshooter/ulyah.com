/* LUAJA — pengerjaan paket latihan. Kunci jawaban hanya datang dari server setelah semua soal dikumpulkan.
 * Semua elemen dibangun lewat DOM (textContent), tidak pernah dari string HTML. */
(function () {
  'use strict';
  var root = document.querySelector('[data-practice]'); if (!root) return;
  var set = JSON.parse(document.getElementById('pset').textContent);
  var meta = JSON.parse(document.getElementById('pmeta').textContent);
  var lang = root.getAttribute('data-lang');
  var KEY = 'lj_lat_' + set.id;
  var answers = {}; try { answers = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { answers = {}; }
  var $ = function (s, c) { return (c || document).querySelector(s); };

  /* pembangun DOM: h('div', {class: 'x'}, 'teks', anak, ...) — teks selalu menjadi node teks */
  function h(tag, attrs) {
    var el = document.createElement(tag), k;
    if (attrs) for (k in attrs) { if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue; if (k === 'class') el.className = attrs[k]; else el.setAttribute(k, attrs[k] === true ? '' : String(attrs[k])); }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; } el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
  /* 【kata】 digarisbawahi, ___ menjadi rumpang, baris baru dipertahankan */
  function marked(text) {
    var out = [], parts = String(text == null ? '' : text).split(/(【[^】]*】|___|\n)/);
    parts.forEach(function (p) {
      if (!p) return;
      if (p === '\n') out.push(h('br'));
      else if (p === '___') out.push(h('span', { class: 'blank' }, '＿＿＿'));
      else if (p.charAt(0) === '【') out.push(h('u', { class: 'mark' }, p.slice(1, -1)));
      else out.push(p);
    });
    return out;
  }
  var letter = function (k) { return String.fromCharCode(65 + k); };

  var listEl = $('[data-questions]'), navEl = $('[data-qnav]'), submit = $('[data-submit]'), left = $('[data-left]'), resultEl = $('[data-result]');
  var n = set.questions.length, shownPassage = {};
  set.questions.forEach(function (q, i) {
    if (q.passage && !shownPassage[q.passage] && set.passages[q.passage]) {
      shownPassage[q.passage] = 1;
      var p = set.passages[q.passage];
      listEl.appendChild(h('article', { class: 'passage card' }, h('h3', null, p.title || 'Bacaan'), h('div', { class: 'passage-text', lang: lang.slice(0, 2) }, marked(p.text)), h('button', { class: 'btn btn-ghost btn-sm', type: 'button', 'data-say': p.text, 'data-lang': lang }, '▶ Dengarkan')));
    }
    listEl.appendChild(h('div', { class: 'exercise pq', id: q.id, 'data-i': i },
      h('div', { class: 'q' }, h('small', null, q.section + (q.hint ? ' · ' + q.hint : '')), h('span', { lang: lang.slice(0, 2) }, marked(q.stem))),
      h('div', { class: 'opts', role: 'radiogroup' }, q.options.map(function (op, k) { return h('button', { type: 'button', class: 'opt', role: 'radio', 'aria-checked': 'false', 'data-q': q.id, 'data-k': k }, h('span', { class: 'k' }, letter(k)), h('span', null, marked(op))); })),
      h('div', { class: 'fb', 'data-fb': true })));
    navEl.appendChild(h('a', { href: '#' + q.id, 'data-nav': q.id }, String(i + 1)));
  });

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
    fetch('/api/latihan/' + encodeURIComponent(set.id), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers: answers, seconds: Math.round((Date.now() - t0) / 1000) }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) { if (!res.ok) throw new Error(res.j.error || 'Gagal menilai'); show(res.j); })
      .catch(function (err) { submit.disabled = false; submit.textContent = 'Kumpulkan & lihat hasil'; if (window.ljToast) window.ljToast(err.message); });
  });

  function show(g) {
    locked = true; try { sessionStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
    $('[data-submitbar]').hidden = true;
    var pct = Math.round(g.pct * 100);
    g.items.forEach(function (it) {
      var box = document.getElementById(it.id); if (!box) return;
      box.classList.add(it.ok ? 'ok' : 'bad');
      box.querySelectorAll('.opt').forEach(function (b) { var k = Number(b.getAttribute('data-k')); if (k === it.answer) b.classList.add('ok'); else if (k === it.chosen) b.classList.add('bad'); b.disabled = true; });
      var fb = box.querySelector('[data-fb]'); fb.textContent = '';
      add(fb, [h('b', null, it.ok ? 'Benar. ' : 'Kunci: ' + letter(it.answer) + '. '), it.why]);
      var nv = navEl.querySelector('[data-nav="' + it.id + '"]'); if (nv) nv.classList.add(it.ok ? 'right' : 'wrong');
    });
    var actions = h('div', { class: 'row', style: 'margin-top:22px;flex-wrap:wrap' },
      meta.next ? h('a', { class: 'btn btn-gold', href: '/latihan/' + encodeURIComponent(meta.next) }, 'Latihan berikutnya →') : null,
      h('button', { class: 'btn btn-ghost', type: 'button', 'data-review': true }, 'Pelajari kunci & pembahasan'),
      h('a', { class: 'btn btn-ghost', href: '/latihan/' + encodeURIComponent(set.id) }, 'Ulangi paket ini'),
      h('button', { class: 'btn btn-ghost', type: 'button', 'data-report': true }, 'Unduh laporan'),
      h('button', { class: 'btn btn-ghost', type: 'button', 'data-print': true }, 'Cetak / PDF'));
    var card = h('div', { class: 'result card' },
      h('div', { class: 'score' + (g.prediction.pass ? ' pass' : '') }, h('div', { class: 'ring', style: '--p:' + pct }, h('span', null, pct + '%')), h('div', null, h('p', { class: 'eyebrow', style: 'margin:0 0 4px' }, 'Hasil Anda'), h('h2', { style: 'margin:0' }, g.correct + ' dari ' + g.total + ' benar'), h('p', { style: 'margin:6px 0 0' }, meta.course + ' · ' + meta.level))),
      h('div', { class: 'predict' }, h('div', null, h('small', null, 'Prediksi nilai sementara'), h('b', null, g.prediction.score), h('span', null, g.prediction.scale)), g.prediction.pass === undefined ? null : h('span', { class: 'pill ' + (g.prediction.pass ? 'pill-ok' : 'pill-warn') }, g.prediction.pass ? 'Di atas ambang' : 'Belum mencapai ambang')),
      h('p', { class: 'small muted', style: 'margin:0 0 16px' }, g.prediction.note),
      h('blockquote', { class: 'motivate' }, h('b', null, g.message.title), h('span', null, g.message.text)),
      h('h3', { style: 'font-size:var(--fs-3);margin-top:22px' }, 'Per bagian'),
      h('div', { class: 'sections' }, g.sections.map(function (s) { var p = Math.round(s.correct / s.total * 100); return h('div', { class: 'sec' }, h('div', { class: 'row between' }, h('span', null, s.section), h('b', null, s.correct + '/' + s.total)), h('div', { class: 'progress' }, h('i', { style: '--p:' + p + '%' }))); })),
      actions,
      meta.loggedIn ? h('p', { class: 'small muted', style: 'margin:14px 0 0' }, 'Hasil ini tersimpan di ', h('a', { href: '/portal/latihan' }, 'riwayat latihan'), ' Anda.') : h('p', { class: 'small muted', style: 'margin:14px 0 0' }, h('a', { href: '/daftar' }, 'Buat akun'), ' agar riwayat dan perkembangan nilai tersimpan.'));
    resultEl.textContent = ''; resultEl.appendChild(card); resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    card.querySelector('[data-review]').addEventListener('click', function () { var first = document.querySelector('.pq'); if (first) first.scrollIntoView({ behavior: 'smooth' }); });
    card.querySelector('[data-print]').addEventListener('click', function () { window.print(); });
    card.querySelector('[data-report]').addEventListener('click', function () { download(g); });
  }

  /* Laporan: dokumen terpisah yang dibangun lewat DOM lalu diserialisasi menjadi berkas .html untuk diunduh. */
  function download(g) {
    var now = new Date(), date = now.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    var doc = document.implementation.createHTMLDocument('Laporan latihan — ' + set.title);
    var D = function (tag, attrs) { var el = doc.createElement(tag), k; if (attrs) for (k in attrs) el.setAttribute(k, attrs[k]); for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c === null || c === undefined) continue; (Array.isArray(c) ? c : [c]).forEach(function (x) { el.appendChild(typeof x === 'object' ? x : doc.createTextNode(String(x))); }); } return el; };
    var meta1 = doc.createElement('meta'); meta1.setAttribute('charset', 'utf-8'); doc.head.insertBefore(meta1, doc.head.firstChild);
    doc.documentElement.setAttribute('lang', 'id');
    doc.head.appendChild(D('style', null, 'body{font:15px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#121a2e;max-width:980px;margin:32px auto;padding:0 20px}h1{font-family:Georgia,serif;color:#0b1f4d;margin:0}header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #f5b301;padding-bottom:12px;margin-bottom:20px}.brand{font:700 22px Georgia,serif;color:#0b1f4d}.kpi{display:flex;gap:14px;flex-wrap:wrap;margin:16px 0}.kpi div{border:1px solid #e6e2d7;border-radius:12px;padding:12px 16px;min-width:160px}.kpi b{display:block;font:700 22px Georgia,serif;color:#0b1f4d}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border-bottom:1px solid #e6e2d7;padding:8px;text-align:left;vertical-align:top}th{background:#f1f5ff}.bad td.r{color:#c0392b;font-weight:700}.ok td.r{color:#1f8a5b;font-weight:700}blockquote{border-left:4px solid #f5b301;background:#fff7dc;margin:16px 0;padding:12px 16px;border-radius:8px}footer{margin-top:24px;color:#6b7390;font-size:12px}'));
    var b = doc.body;
    b.appendChild(D('header', null, D('div', null, D('div', { class: 'brand' }, 'LUAJA'), D('h1', null, 'Laporan latihan soal')), D('div', null, date)));
    b.appendChild(D('p', null, D('b', null, set.title), ' · ' + set.examName + ' · ' + meta.course + ' ' + meta.level));
    b.appendChild(D('div', { class: 'kpi' }, D('div', null, 'Benar', D('b', null, g.correct + ' / ' + g.total)), D('div', null, 'Persentase', D('b', null, Math.round(g.pct * 100) + '%')), D('div', null, 'Prediksi nilai', D('b', null, g.prediction.score), D('small', null, g.prediction.scale))));
    b.appendChild(D('blockquote', null, D('b', null, g.message.title), D('br'), g.message.text));
    b.appendChild(D('h2', null, 'Per bagian'));
    b.appendChild(D('table', null, D('tr', null, D('th', null, 'Bagian'), D('th', null, 'Benar')), g.sections.map(function (s) { return D('tr', null, D('td', null, s.section), D('td', null, s.correct + ' / ' + s.total)); })));
    b.appendChild(D('h2', null, 'Rincian jawaban'));
    b.appendChild(D('table', null, D('tr', null, ['#', 'Bagian', 'Soal', 'Jawaban Anda', 'Kunci', '', 'Pembahasan'].map(function (t) { return D('th', null, t); })), set.questions.map(function (q, i) {
      var it = g.items[i];
      return D('tr', { class: it.ok ? 'ok' : 'bad' }, D('td', null, String(i + 1)), D('td', null, q.section), D('td', null, q.stem.replace(/[【】]/g, '')), D('td', null, q.options[it.chosen]), D('td', null, q.options[it.answer]), D('td', { class: 'r' }, it.ok ? '✓' : '✗'), D('td', null, it.why));
    })));
    b.appendChild(D('footer', null, g.prediction.note + ' · luaja.com'));
    var blob = new Blob(['<!doctype html>\n' + doc.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'laporan-luaja-' + set.id + '-' + now.toISOString().slice(0, 10) + '.html';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
})();
