/* LUAJA — pembaca pustaka interaktif. Halaman buku dirender dari JSON lewat DOM (textContent saja, tidak pernah HTML mentah).
 * Dengarkan per paragraf/kalimat atau seluruh halaman, ketuk kata (dengar · simpan · kamus), uji diri (sembunyikan arti),
 * kartu hafalan, latihan isian & pilihan ganda yang langsung dinilai, XP dan runtun harian, geser/tombol panah untuk berpindah. */
(function () {
  'use strict';
  var root = document.querySelector('[data-reader]'); if (!root) return;
  var B = JSON.parse(document.getElementById('book').textContent);
  var d = document, rate = 1;
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var T = function (k, v) { var s = (window.LJ && window.LJ.t && window.LJ.t[k]) || k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  var toast = function (m, ms) { var t = $('[data-rd-toast]'); if (!t) return; t.textContent = m; t.hidden = false; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); t.hidden = true; }, ms || 2400); };
  function h(tag, attrs) {
    var el = d.createElement(tag), k;
    if (attrs) for (k in attrs) { if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue; if (k === 'class') el.className = attrs[k]; else el.setAttribute(k, attrs[k] === true ? '' : String(attrs[k])); }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; } el.appendChild(typeof c === 'object' ? c : d.createTextNode(String(c))); }

  var LOC = { de: 'de-DE', en: 'en-GB', ja: 'ja-JP' };
  var WIKI = { de: 'German', en: 'English', ja: 'Japanese' };
  var locOf = function (l) { return LOC[l] || B.locale; };
  var stopSpeech = function () { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* tanpa suara */ } };
  var say = function (text, l, onEnd) { if (window.ljSay) window.ljSay(text, locOf(l), rate, onEnd); else if (onEnd) onEnd(); };

  var pageEl = $('[data-page]'), label = $('[data-pg-label]'), bar = $('[data-progress]'), gotoIn = $('[data-goto]'), xpEl = $('[data-xp]');
  var doc = null, total = B.pages, cur = Math.max(0, Math.min(B.pages - 1, B.start || 0));
  var KEY = 'lj_rd_' + B.id, st = { seen: [], ok: 0, tried: 0 };
  try { var raw = localStorage.getItem(KEY); if (raw) st = Object.assign(st, JSON.parse(raw)); } catch (e) { /* penyimpanan lokal tidak tersedia */ }
  var keep = function () { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* abaikan */ } };
  var chapterStarts = (B.toc || []).map(function (x) { return x[1]; });

  /* ── kata yang bisa diketuk ─────────────────────────────────────────── */
  var pop = $('[data-pop]');
  function closePop() { pop.hidden = true; pop.textContent = ''; }
  function openPop(word, l, anchor) {
    var clean = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (!clean) return;
    pop.textContent = '';
    var saved = false;
    try { saved = (JSON.parse(localStorage.getItem('lj_words') || '[]')).some(function (w) { return w.w === clean && w.l === l; }); } catch (e) { /* abaikan */ }
    var dict = l === 'ja' ? 'https://jisho.org/search/' + encodeURIComponent(clean) : 'https://en.wiktionary.org/wiki/' + encodeURIComponent(l === 'de' ? clean : clean.toLowerCase()) + '#' + WIKI[l];
    var saveBtn = h('button', { type: 'button', class: 'pop-btn' }, saved ? T('js.lib.saved') : T('js.lib.save'));
    saveBtn.addEventListener('click', function () {
      try { var list = JSON.parse(localStorage.getItem('lj_words') || '[]'); if (!list.some(function (w) { return w.w === clean && w.l === l; })) list.unshift({ w: clean, l: l, b: B.id, at: Date.now() }); localStorage.setItem('lj_words', JSON.stringify(list.slice(0, 2000))); } catch (e) { /* abaikan */ }
      saveBtn.textContent = T('js.lib.saved');
    });
    var listen = h('button', { type: 'button', class: 'pop-btn' }, '🔊 ' + T('js.lib.listen'));
    listen.addEventListener('click', function () { say(clean, l); });
    add(pop, [h('b', { lang: l }, clean), h('div', { class: 'pop-row' }, listen, saveBtn, h('a', { class: 'pop-btn', href: dict, target: '_blank', rel: 'noopener' }, T('js.lib.dict') + ' ↗'))]);
    pop.hidden = false;
    var r = anchor.getBoundingClientRect(), pw = Math.min(320, window.innerWidth - 24);
    pop.style.width = pw + 'px';
    pop.style.left = Math.max(12, Math.min(window.innerWidth - pw - 12, r.left + r.width / 2 - pw / 2)) + 'px';
    pop.style.top = (r.bottom + 8 + 120 > window.innerHeight ? r.top - 128 : r.bottom + 8) + 'px';
    say(clean, l);
  }
  d.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target) && !e.target.classList.contains('w')) closePop(); });
  window.addEventListener('scroll', closePop, { passive: true });

  /** Teks bahasa sasaran → kata yang bisa diketuk (Jepang: per kalimat). */
  function words(text, l) {
    if (l === 'ja') return [h('span', { class: 'w', lang: 'ja', 'data-w': text }, text)];
    var out = [];
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { out.push(part); return; }
      out.push(h('span', { class: 'w', 'data-w': part }, part));
    });
    return out;
  }
  pageEl.addEventListener('click', function (e) {
    var w = e.target.closest && e.target.closest('.w');
    if (w && pageEl.contains(w)) { e.stopPropagation(); var l = (w.closest('[data-l]') || {}).getAttribute ? w.closest('[data-l]').getAttribute('data-l') : B.lang; openPop(w.getAttribute('data-w'), l || B.lang, w); return; }
    var tr = e.target.closest && e.target.closest('.tr');
    if (tr && d.body.classList.contains('rd-hide-tr')) tr.classList.toggle('shown');
  });
  function speakBtn(text, l, el) {
    var b = h('button', { type: 'button', class: 'say', 'aria-label': T('js.lib.listen') }, '🔊');
    b.addEventListener('click', function (e) { e.stopPropagation(); (el || b).classList.add('speaking'); say(text, l, function () { (el || b).classList.remove('speaking'); }); });
    return b;
  }

  /* ── latihan ───────────────────────────────────────────────────────── */
  var pageScore = { ok: 0, tried: 0 }, scoreEl = null;
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFC').replace(/[„“”"'’‚.,!?;:]/g, '').replace(/\s+/g, ' ').trim(); };
  function scored(ok) {
    pageScore.tried++; if (ok) pageScore.ok++;
    st.tried++; if (ok) st.ok++; keep();
    if (scoreEl) scoreEl.textContent = T('js.lib.score', { ok: pageScore.ok, n: pageScore.tried });
    if (ok) bump(0, true);
    sync();
  }
  function gapBlock(b) {
    var inputs = [], line = h('p', { class: 'gap-line', 'data-l': B.lang });
    b.s.forEach(function (seg, i) {
      if (seg) add(line, [seg, ' ']);
      if (i < b.a.length) { var inp = h('input', { type: 'text', class: 'gap-in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': T('js.lib.typeAnswer'), size: Math.max(4, b.a[i].length + 1) }); inputs.push(inp); add(line, [inp, ' ']); }
    });
    var fb = h('p', { class: 'fb', 'aria-live': 'polite' }), done = false;
    var btn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, T('js.lib.check'));
    var check = function () {
      if (done) return;
      var allOk = inputs.every(function (inp, i) { var alts = (b.alt && b.alt[i]) || [b.a[i]]; var ok = alts.some(function (a) { return norm(a) === norm(inp.value); }); inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok); return ok; });
      done = true; btn.disabled = true; inputs.forEach(function (inp) { inp.readOnly = true; });
      fb.className = 'fb ' + (allOk ? 'ok' : 'bad');
      fb.textContent = allOk ? T('js.lib.correct') : T('js.lib.wrong', { a: b.a.join(' · ') });
      scored(allOk);
    };
    btn.addEventListener('click', check);
    inputs.forEach(function (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });
    return h('div', { class: 'ex-item' }, b.n ? h('span', { class: 'ex-n' }, String(b.n)) : null, line, h('div', { class: 'row' }, btn, fb));
  }
  function mcBlock(b) {
    var opts = h('div', { class: 'mc-opts' }), done = false;
    b.o.forEach(function (o, i) {
      var btn = h('button', { type: 'button', class: 'mc-opt' }, h('span', { class: 'k' }, String.fromCharCode(65 + i)), o);
      btn.addEventListener('click', function () {
        if (done) return; done = true;
        var ok = i === b.a;
        btn.classList.add(ok ? 'ok' : 'bad');
        $$('.mc-opt', opts).forEach(function (x, j) { x.disabled = true; if (j === b.a) x.classList.add('ok'); });
        scored(ok);
      });
      add(opts, btn);
    });
    return h('div', { class: 'ex-item' }, b.n ? h('span', { class: 'ex-n' }, String(b.n)) : null, h('p', { class: 'mc-q', 'data-l': B.lang }, words(b.q, B.lang)), opts);
  }

  /* ── kartu hafalan ─────────────────────────────────────────────────── */
  function cards(items, l) {
    var i = 0, known = 0, again = 0, flipped = false;
    var face = h('button', { type: 'button', class: 'fc-card' }), meta = h('p', { class: 'small muted' });
    var dlg = h('dialog', { class: 'fc' }, h('h2', null, T('js.lib.cards')), meta, face);
    var kBtn = h('button', { type: 'button', class: 'btn btn-gold' }, '✓ ' + T('js.lib.known'));
    var aBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, '↻ ' + T('js.lib.again'));
    var close = h('button', { type: 'button', class: 'btn btn-ghost btn-sm fc-x' }, '✕');
    add(dlg, [h('div', { class: 'row', style: 'justify-content:center;gap:10px' }, aBtn, kBtn), close]);
    var draw = function () {
      if (i >= items.length) { face.textContent = T('js.lib.cardsDone', { k: known, a: again }); kBtn.hidden = aBtn.hidden = true; bump(Math.min(10, known), true); return; }
      flipped = false; face.classList.remove('flip'); face.textContent = items[i][0]; face.setAttribute('lang', l); meta.textContent = (i + 1) + ' / ' + items.length; say(items[i][0], l);
    };
    face.addEventListener('click', function () { if (i >= items.length) return; flipped = !flipped; face.classList.toggle('flip', flipped); face.textContent = flipped ? items[i][1] : items[i][0]; face.setAttribute('lang', flipped ? 'und' : l); });
    kBtn.addEventListener('click', function () { known++; i++; draw(); });
    aBtn.addEventListener('click', function () { again++; items.push(items[i]); i++; draw(); });
    close.addEventListener('click', function () { dlg.close(); dlg.remove(); });
    d.body.appendChild(dlg); dlg.showModal(); draw();
  }

  /* ── blok halaman ──────────────────────────────────────────────────── */
  function block(b) {
    var l = b.l || B.lang;
    switch (b.k) {
      case 'h': return h('h2', { class: 'rd-h' }, b.t);
      case 'p': { var p = h('p', { class: 'rd-p', 'data-l': l, 'data-say': b.t }); add(p, [speakBtn(b.t, l, p), ' ', l === B.lang ? words(b.t, l) : b.t]); return p; }
      case 'tip': return h('div', { class: 'rd-tip', 'data-l': l, 'data-say': b.t }, speakBtn(b.t, l), ' ', b.t);
      case 'ex': { var ex = h('div', { class: 'rd-ex', 'data-l': B.lang, 'data-say': b.t }, speakBtn(b.t, B.lang), h('span', { class: 'tgt' }, words(b.t, B.lang))); if (b.g) add(ex, h('span', { class: 'tr' }, b.g)); return ex; }
      case 'voc': {
        var list = h('ul', { class: 'voc-list' });
        b.i.forEach(function (it) { var li = h('li', { 'data-l': B.lang, 'data-say': it[0] }, speakBtn(it[0], B.lang), h('span', { class: 'tgt' }, words(it[0], B.lang)), h('span', { class: 'tr' }, it[1])); add(list, li); });
        var fc = h('button', { type: 'button', class: 'btn btn-gold btn-sm' }, '🃏 ' + T('js.lib.cards') + ' (' + b.i.length + ')');
        fc.addEventListener('click', function () { cards(b.i.slice(), B.lang); });
        return h('section', { class: 'voc' }, h('div', { class: 'voc-head' }, b.a ? h('div', { class: 'native' }, h('small', null, '🎧 ' + T('js.lib.native')), h('audio', { controls: true, preload: 'none', src: b.a })) : null, fc), list);
      }
      case 'tbl': {
        var tb = h('table', { class: 'rd-tbl' });
        b.r.forEach(function (r) { var tr = h('tr', { 'data-l': B.lang, 'data-say': r[0] }); r.forEach(function (c, j) { add(tr, h('td', j === 0 ? null : { class: 'tr-cell' }, j === 0 ? [speakBtn(c, B.lang), ' ', words(c, B.lang)] : c)); }); add(tb, tr); });
        return h('div', { class: 'table-wrap' }, tb);
      }
      case 'aud': return h('div', { class: 'rd-aud' }, h('small', null, '🎧 ' + (b.t || T('js.lib.native'))), h('audio', { controls: true, preload: 'none', src: b.src }));
      case 'vid': return h('figure', { class: 'rd-vid' }, h('video', { controls: true, preload: 'metadata', playsinline: true, src: b.src }), h('figcaption', null, '🎬 ' + b.t + (b.d ? ' · ' + b.d : '')));
      case 'sen': {
        var c = h('div', { class: 'sen', 'data-l': B.lang, 'data-say': b.t }, speakBtn(b.t, B.lang), h('div', null, h('p', { class: 'tgt' }, words(b.t, B.lang)), h('p', { class: 'tr', lang: 'id' }, b.id)));
        if (b.n) add(c, h('a', { class: 'src', href: 'https://tatoeba.org/sentences/show/' + b.n, target: '_blank', rel: 'noopener' }, '#' + b.n));
        return c;
      }
      case 'gap': return gapBlock(b);
      case 'mc': return mcBlock(b);
      default: return null;
    }
  }

  /* ── XP & progres ──────────────────────────────────────────────────── */
  var xp = Number(xpEl ? xpEl.textContent : 0) || 0, syncT = null;
  function bump(n, quiet) {
    if (!n) n = 3;
    if (!B.loggedIn) return;
    xp += n; if (xpEl) { xpEl.textContent = xp; xpEl.parentNode.classList.remove('pulse'); void xpEl.offsetWidth; xpEl.parentNode.classList.add('pulse'); }
    if (!quiet) toast(T('js.lib.xpGain', { n: n }), 1200);
  }
  function sync() {
    if (!B.loggedIn) return;
    clearTimeout(syncT);
    syncT = setTimeout(function () {
      fetch('/api/pustaka/progres', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ book: B.id, page: cur, ok: st.ok, tried: st.tried }) })
        .then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.ok && xpEl) { xp = j.xp; xpEl.textContent = j.xp; } }).catch(function () { /* luring: dicoba lagi pada halaman berikutnya */ });
    }, 1200);
  }

  /* ── halaman ───────────────────────────────────────────────────────── */
  function lockedView() {
    var box = h('div', { class: 'rd-locked' }, h('div', { class: 'lock-ic' }, '🔒'), h('p', null, T('js.lib.locked', { n: total })),
      h('div', { class: 'row', style: 'justify-content:center;gap:10px' }, h('a', { class: 'btn btn-gold', href: '/harga' }, T('js.lib.join')), B.loggedIn ? null : h('a', { class: 'btn btn-ghost', href: '/masuk?lanjut=' + encodeURIComponent(location.pathname + location.search) }, T('practice.guest.login'))));
    return box;
  }
  function show(n, dir) {
    stopSpeech(); reading = false; closePop();
    cur = Math.max(0, Math.min(total - 1, n));
    pageEl.textContent = '';
    pageEl.classList.remove('turn-l', 'turn-r'); void pageEl.offsetWidth; pageEl.classList.add(dir < 0 ? 'turn-l' : 'turn-r');
    pageScore = { ok: 0, tried: 0 }; scoreEl = null;
    var pg = doc.pages[cur];
    if (!pg) add(pageEl, lockedView());
    else {
      add(pageEl, h('h1', { class: 'rd-pt' }, pg.t));
      pg.b.forEach(function (b) { var el = block(b); if (el) add(pageEl, el); });
      if (pg.b.some(function (b) { return b.k === 'gap' || b.k === 'mc'; })) { scoreEl = h('p', { class: 'rd-score' }, T('js.lib.score', { ok: 0, n: 0 })); add(pageEl, scoreEl); }
      if (st.seen.indexOf(cur) < 0) { st.seen.push(cur); keep(); if (B.loggedIn) bump(2, true); }
      if (cur === total - 1) toast('🏆 ' + T('js.lib.bookDone'), 3200);
      else if (chapterStarts.indexOf(cur + 1) >= 0 && dir > 0) toast('🎉 ' + T('js.lib.chapterDone'), 2600);
      sync();
    }
    label.textContent = T('js.lib.pageOf', { a: cur + 1, b: total });
    if (bar) bar.style.setProperty('--p', ((cur + 1) / total * 100).toFixed(1) + '%');
    if (gotoIn) gotoIn.value = String(cur + 1);
    $('[data-prev]').disabled = cur === 0; $('[data-next]').disabled = cur >= total - 1;
    try { history.replaceState(null, '', location.pathname + '?h=' + (cur + 1)); } catch (e) { /* abaikan */ }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── bacakan seluruh halaman ───────────────────────────────────────── */
  var reading = false, readBtn = $('[data-read]');
  function readAll() {
    if (reading) { reading = false; stopSpeech(); $$('.speaking', pageEl).forEach(function (x) { x.classList.remove('speaking'); }); readBtn.lastChild.textContent = T('js.lib.readPage'); return; }
    var items = $$('[data-say]', pageEl), i = 0;
    if (!items.length) return;
    reading = true; readBtn.lastChild.textContent = T('js.lib.stop');
    (function next() {
      $$('.speaking', pageEl).forEach(function (x) { x.classList.remove('speaking'); });
      if (!reading || i >= items.length) { reading = false; readBtn.lastChild.textContent = T('js.lib.readPage'); return; }
      var el = items[i++]; el.classList.add('speaking'); el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      say(el.getAttribute('data-say'), el.getAttribute('data-l') || B.lang, function () { setTimeout(next, 250); });
    })();
  }
  if (readBtn) readBtn.addEventListener('click', readAll);

  var hideBtn = $('[data-hide-tr]');
  if (hideBtn) hideBtn.addEventListener('click', function () {
    var on = d.body.classList.toggle('rd-hide-tr');
    hideBtn.setAttribute('aria-pressed', String(on)); hideBtn.lastChild.textContent = on ? T('js.lib.showTr') : T('js.lib.hideTr');
    $$('.tr.shown', pageEl).forEach(function (x) { x.classList.remove('shown'); });
  });

  var toc = $('[data-toc]');
  $('[data-toc-open]').addEventListener('click', function () { if (toc.showModal) toc.showModal(); });
  $$('[data-jump]', toc).forEach(function (b) { b.addEventListener('click', function () { var n = Number(b.getAttribute('data-jump')); setTimeout(function () { show(n, n >= cur ? 1 : -1); }, 0); }); });
  $('[data-prev]').addEventListener('click', function () { show(cur - 1, -1); });
  $('[data-next]').addEventListener('click', function () { show(cur + 1, 1); });
  if (gotoIn) gotoIn.addEventListener('change', function () { var n = Number(gotoIn.value) - 1; if (n >= 0) show(n, n >= cur ? 1 : -1); });
  d.addEventListener('keydown', function (e) {
    if (!doc || /input|textarea|select/i.test((e.target && e.target.tagName) || '') || (d.querySelector('dialog[open]'))) return;
    if (e.key === 'ArrowRight') show(cur + 1, 1); else if (e.key === 'ArrowLeft') show(cur - 1, -1);
  });
  var tx = null, ty = null;
  pageEl.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
  pageEl.addEventListener('touchend', function (e) {
    if (tx === null || /input/i.test((e.target && e.target.tagName) || '')) return;
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty; tx = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) { if (dx < 0) show(cur + 1, 1); else show(cur - 1, -1); }
  }, { passive: true });

  fetch('/p/b/' + encodeURIComponent(B.id) + '.json', { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (j) { doc = j; total = j.total || j.pages.length; show(cur, 1); })
    .catch(function () { pageEl.textContent = ''; add(pageEl, h('p', { class: 'notice' }, T('js.lib.error'))); });
})();
