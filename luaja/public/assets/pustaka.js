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

  var LOC = { de: 'de-DE', en: 'en-GB', ja: 'ja-JP', id: 'id-ID' };
  var locOf = function (l) { return LOC[l] || B.locale; };
  var stopSpeech = function () { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* tanpa suara */ } };
  var RUBY = /｜([^《｜]+)《([^》]+)》/g;
  var plain = function (t) { return String(t).replace(RUBY, '$1'); };
  var say = function (text, l, onEnd) { text = plain(text); if (window.ljSay) window.ljSay(text, locOf(l), rate, onEnd); else if (onEnd) onEnd(); };

  var pageEl = $('[data-page]'), label = $('[data-pg-label]'), bar = $('[data-progress]'), gotoIn = $('[data-goto]'), xpEl = $('[data-xp]');
  var doc = null, total = B.pages, cur = Math.max(0, Math.min(B.pages - 1, B.start || 0));
  var KEY = 'lj_rd_' + B.id, st = { seen: [], ok: 0, tried: 0 };
  try { var raw = localStorage.getItem(KEY); if (raw) st = Object.assign(st, JSON.parse(raw)); } catch (e) { /* penyimpanan lokal tidak tersedia */ }
  var keep = function () { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* abaikan */ } };
  var chapterStarts = (B.toc || []).map(function (x) { return x[1]; });

  /* ── kata yang bisa diketuk: arti langsung dari Kamus LUAJA dalam bahasa antarmuka ─────────────── */
  var pop = $('[data-pop]');
  var UI = (window.LJ && window.LJ.lang) || 'id', kcache = {};
  function closePop() { pop.hidden = true; pop.textContent = ''; }
  function place(anchor) {
    var r = anchor.getBoundingClientRect(), pw = Math.min(360, window.innerWidth - 24), ph = pop.offsetHeight || 140;
    pop.style.width = pw + 'px';
    pop.style.left = Math.max(12, Math.min(window.innerWidth - pw - 12, r.left + r.width / 2 - pw / 2)) + 'px';
    var below = r.bottom + 8, above = r.top - 8 - ph;
    pop.style.top = Math.max(8, below + ph > window.innerHeight - 8 && above > 8 ? above : Math.min(below, window.innerHeight - ph - 8)) + 'px';
  }
  function kfetch(path) {
    if (kcache[path]) return kcache[path];
    kcache[path] = fetch(path, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) { var er = new Error(String(r.status)); er.status = r.status; throw er; } return r.json(); });
    kcache[path].catch(function () { delete kcache[path]; });
    return kcache[path];
  }
  function savedHas(w, l) { try { return (JSON.parse(localStorage.getItem('lj_words') || '[]')).some(function (x) { return x.w === w && x.l === l; }); } catch (e) { return false; } }
  function saveWord(w, l, m) { try { var list = JSON.parse(localStorage.getItem('lj_words') || '[]'); if (!list.some(function (x) { return x.w === w && x.l === l; })) list.unshift({ w: w, l: l, b: B.id, at: Date.now(), m: m || '' }); localStorage.setItem('lj_words', JSON.stringify(list.slice(0, 2000))); } catch (e) { /* abaikan */ } }
  function meaningBlock(hit, l) {
    var head = h('div', { class: 'pop-lemma' }, hit.art ? h('span', { class: 'pop-art' }, hit.art + ' ') : null, h('b', { lang: l }, hit.w),
      hit.r && hit.r !== hit.w ? h('span', { class: 'pop-ipa', lang: 'ja' }, ' ' + hit.r) : null, hit.ipa ? h('span', { class: 'pop-ipa' }, ' ' + hit.ipa) : null,
      hit.lv ? h('span', { class: 'pop-lv' }, 'JLPT ' + hit.lv) : null);
    var list = h('ol', { class: 'pop-m', lang: hit.ml || UI }, (hit.m || []).map(function (x) { return h('li', null, x); }));
    return [head, list, hit.ml && hit.ml !== UI ? h('small', { class: 'pop-note' }, T('js.kamus.enNote')) : null];
  }
  function openPop(word, l, anchor) {
    var clean = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (!clean) return;
    pop.textContent = '';
    var body = h('div', { class: 'pop-body', 'aria-live': 'polite' }, h('span', { class: 'pop-wait' }, T('js.kamus.loading')));
    var listen = h('button', { type: 'button', class: 'pop-btn' }, '🔊 ' + T('js.lib.listen'));
    var full = h('a', { class: 'pop-btn pop-full', href: '/kamus?l=' + l + '&q=' + encodeURIComponent(clean) }, T('js.kamus.full') + ' →');
    var lemma = clean, meaning = '';
    var saveBtn = h('button', { type: 'button', class: 'pop-btn' }, savedHas(clean, l) ? T('js.lib.saved') : T('js.lib.save'));
    saveBtn.addEventListener('click', function () { saveWord(lemma, l, meaning); saveBtn.textContent = T('js.lib.saved'); });
    listen.addEventListener('click', function () { say(clean, l); });
    var wordHead = l === 'ja' ? null : h('div', { class: 'pop-word' }, h('b', { lang: l }, clean));
    add(pop, [wordHead, body, h('div', { class: 'pop-row' }, listen, saveBtn, full)]);
    pop.hidden = false;
    place(anchor);
    say(clean, l);
    if (navigator.onLine === false) { body.textContent = T('js.kamus.offline'); place(anchor); return; }
    if (l === 'ja') {
      kfetch('/api/kamus/pecah?l=ja&ui=' + UI + '&q=' + encodeURIComponent(clean)).then(function (d) {
        body.textContent = '';
        var detail = h('div', { class: 'pop-detail' });
        var chips = h('div', { class: 'pop-chips', role: 'group', 'aria-label': T('js.kamus.words') });
        var first = null;
        function pick(b, tk, speak) {
          $$('.pop-chip', chips).forEach(function (x) { x.classList.toggle('on', x === b); });
          detail.textContent = '';
          add(detail, meaningBlock({ w: tk.w, r: tk.r, m: tk.m }, 'ja'));
          lemma = tk.w; meaning = (tk.m || []).join(', ');
          full.setAttribute('href', tk.url);
          saveBtn.textContent = savedHas(tk.w, 'ja') ? T('js.lib.saved') : T('js.lib.save');
          if (speak) say(tk.t, 'ja');
          place(anchor);
        }
        (d.tokens || []).forEach(function (tk) {
          if (!tk.w) { if (/\S/.test(tk.t)) add(chips, h('span', { class: 'pop-sep', lang: 'ja' }, tk.t)); return; }
          var b = h('button', { type: 'button', class: 'pop-chip', lang: 'ja' }, tk.t);
          b.addEventListener('click', function (e) { e.stopPropagation(); pick(b, tk, true); });
          if (!first) first = { b: b, tk: tk };
          add(chips, b);
        });
        add(body, [h('small', { class: 'pop-note' }, T('js.kamus.words')), chips, detail]);
        if (first) pick(first.b, first.tk, false);
        else { body.textContent = T('js.kamus.none'); place(anchor); }
      }).catch(function (er) { body.textContent = T(er && er.status === 503 ? 'js.kamus.updating' : 'js.kamus.none'); place(anchor); });
      return;
    }
    kfetch('/api/kamus/cari?l=' + l + '&ui=' + UI + '&q=' + encodeURIComponent(clean)).then(function (d) {
      body.textContent = '';
      var hits = d.hits || [];
      if (!hits.length) { body.textContent = T('js.kamus.none'); place(anchor); return; }
      var top = hits[0];
      lemma = top.w; meaning = (top.m || []).slice(0, 3).join(', ');
      full.setAttribute('href', top.url);
      if (top.w.toLowerCase() !== clean.toLowerCase()) add(body, h('small', { class: 'pop-note' }, T('js.kamus.formOf', { w: top.w })));
      else if (wordHead && wordHead.parentNode) wordHead.parentNode.removeChild(wordHead);
      add(body, meaningBlock(top, l));
      hits.slice(1, 3).forEach(function (x) {
        add(body, h('a', { class: 'pop-more', href: x.url }, h('b', { lang: l }, (x.art ? x.art + ' ' : '') + x.w), ' — ' + (x.m || []).slice(0, 2).join(', ')));
      });
      saveBtn.textContent = savedHas(top.w, l) || savedHas(clean, l) ? T('js.lib.saved') : T('js.lib.save');
      place(anchor);
    }).catch(function (er) { body.textContent = T(er && er.status === 503 ? 'js.kamus.updating' : 'js.kamus.none'); place(anchor); });
  }
  d.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target) && !e.target.classList.contains('w')) closePop(); });
  window.addEventListener('scroll', closePop, { passive: true });

  /** Kalimat Jepang di titik ketukan (paragraf panjang dipotong di 。！？ agar kamus memecah kalimat itu saja). */
  function sentenceAt(w, ev) {
    var full = w.getAttribute('data-w') || '', idx = -1;
    try {
      var r = d.caretRangeFromPoint ? d.caretRangeFromPoint(ev.clientX, ev.clientY) : null;
      var pos = !r && d.caretPositionFromPoint ? d.caretPositionFromPoint(ev.clientX, ev.clientY) : null;
      var node = r ? r.startContainer : pos ? pos.offsetNode : null, off = r ? r.startOffset : pos ? pos.offset : 0;
      if (node && w.contains(node)) {
        var walker = d.createTreeWalker(w, NodeFilter.SHOW_TEXT), n, count = 0;
        while ((n = walker.nextNode())) { if (n.parentNode && n.parentNode.nodeName === 'RT') continue; if (n === node) { idx = count + off; break; } count += n.nodeValue.length; }
      }
    } catch (x) { idx = -1; }
    if (idx < 0) idx = 0;
    var start = idx, end = idx, stop = /[。！？!?\n]/;
    while (start > 0 && !stop.test(full.charAt(start - 1))) start--;
    while (end < full.length && !stop.test(full.charAt(end))) end++;
    var s = full.slice(start, Math.min(full.length, end + 1)).trim();
    return (s || full).slice(0, 100);
  }

  /** Teks bahasa sasaran → kata yang bisa diketuk (Jepang: per kalimat). */
  function words(text, l) {
    if (l === 'ja') {
      var parts = [], last = 0, m; RUBY.lastIndex = 0;
      while ((m = RUBY.exec(text))) { if (m.index > last) parts.push(text.slice(last, m.index)); parts.push(h('ruby', null, m[1], h('rt', null, m[2]))); last = m.index + m[0].length; }
      if (last < text.length) parts.push(text.slice(last));
      return [h('span', { class: 'w', lang: 'ja', 'data-w': plain(text) }, parts)];
    }
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
    if (w && pageEl.contains(w)) { e.stopPropagation(); var l = (w.closest('[data-l]') || {}).getAttribute ? w.closest('[data-l]').getAttribute('data-l') : B.lang; l = l || B.lang; openPop(l === 'ja' ? sentenceAt(w, e) : w.getAttribute('data-w'), l, w); return; }
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
    var oo = UI === 'id' && b.o_id && b.o_id.length === b.o.length ? b.o_id : b.o;
    oo.forEach(function (o, i) {
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
    return h('div', { class: 'ex-item' }, b.n ? h('span', { class: 'ex-n' }, String(b.n)) : null, UI === 'id' && b.q_id ? h('p', { class: 'mc-q', lang: 'id' }, b.q_id) : h('p', { class: 'mc-q', 'data-l': B.lang }, words(b.q, B.lang)), opts);
  }
  /** Pilihan ganda dengar: naskah dibacakan; teksnya baru tampil setelah dijawab. */
  function lmcBlock(b) {
    var item = mcBlock({ n: b.n, q: '🎧', o: b.o, o_id: b.o_id, a: b.a });
    var play = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, '▶ ' + T('js.lib.listen'));
    play.addEventListener('click', function () { say(b.au, B.lang); });
    var script = h('p', { class: 'small muted', hidden: true, 'data-l': B.lang }, b.au);
    $$('.mc-opt', item).forEach(function (x) { x.addEventListener('click', function () { script.hidden = false; }); });
    var q = $('.mc-q', item); q.textContent = ''; add(q, play);
    add(item, script);
    return item;
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

  /* ── bahasa antarmuka: penjelasan & arti dalam bahasa pelajar ─────────── */
  /** Teks blok dalam bahasa antarmuka bila terjemahannya ada (t_id, g_id, q_id, o_id …), selain itu teks asli. */
  var loc = function (b, f) { return UI === 'id' && b[f + '_id'] ? b[f + '_id'] : b[f]; };
  /** Arti butir kosakata/tabel/kanji dalam bahasa antarmuka; arti Inggris asli tetap terlihat kecil di bawahnya. */
  function meaningCell(b, i, en) {
    var t = b.tr && b.tr[UI] && b.tr[UI][i];
    if (!t || t === en) return en;
    return [h('span', { lang: UI }, t), UI !== 'en' && en ? h('small', { class: 'tr-en', lang: 'en' }, en) : null];
  }
  var meaningText = function (b, i, en) { return (b.tr && b.tr[UI] && b.tr[UI][i]) || en; };
  /** Paragraf penjelasan: terjemahan Indonesia (tidak diketuk sebagai kata asing) atau teks asli. */
  function explain(b, l, cls) {
    if (UI === 'id' && b.t_id) { var e = h(cls === 'p' ? 'p' : 'div', { class: cls === 'p' ? 'rd-p rd-expl' : 'rd-tip', 'data-l': 'id', 'data-rs': b.t_id, lang: 'id' }); add(e, [speakBtn(b.t_id, 'id', e), ' ', b.t_id]); return e; }
    if (cls === 'p') { var p = h('p', { class: 'rd-p', 'data-l': l, 'data-rs': b.t }); add(p, [speakBtn(b.t, l, p), ' ', l === B.lang ? words(b.t, l) : b.t]); return p; }
    return h('div', { class: 'rd-tip', 'data-l': l, 'data-rs': b.t }, speakBtn(b.t, l), ' ', b.t);
  }

  /* ── blok halaman ──────────────────────────────────────────────────── */
  function block(b) {
    var l = b.l || B.lang;
    switch (b.k) {
      case 'h': return h('h2', { class: 'rd-h' }, loc(b, 't'));
      case 'p': return explain(b, l, 'p');
      case 'tip': return explain(b, l, 'tip');
      case 'ex': { var ex = h('div', { class: 'rd-ex', 'data-l': B.lang, 'data-rs': b.t }, speakBtn(b.t, B.lang), h('span', { class: 'tgt' }, words(b.t, B.lang))); if (b.g) add(ex, h('span', { class: 'tr', lang: UI === 'id' && b.g_id ? 'id' : 'en' }, loc(b, 'g'))); return ex; }
      case 'voc': {
        var list = h('ul', { class: 'voc-list' });
        b.i.forEach(function (it, n) { var li = h('li', { 'data-l': B.lang, 'data-rs': it[0] }, speakBtn(it[0], B.lang), h('span', { class: 'tgt' }, words(it[0], B.lang), it[2] ? h('small', { class: 'rd', lang: B.lang }, it[2]) : null), h('span', { class: 'tr' }, meaningCell(b, n, it[1]))); add(list, li); });
        var fc = h('button', { type: 'button', class: 'btn btn-gold btn-sm' }, '🃏 ' + T('js.lib.cards') + ' (' + b.i.length + ')');
        fc.addEventListener('click', function () { cards(b.i.map(function (x, n) { var m = meaningText(b, n, x[1]); return [x[0], x[2] ? x[2] + ' — ' + m : m]; }), B.lang); });
        return h('section', { class: 'voc' }, h('div', { class: 'voc-head' }, b.a ? h('div', { class: 'native' }, h('small', null, '🎧 ' + T('js.lib.native')), h('audio', { controls: true, preload: 'none', src: b.a })) : null, fc), list);
      }
      case 'tbl': {
        var tb = h('table', { class: 'rd-tbl' });
        b.r.forEach(function (r, ri) { var tr = h('tr', { 'data-l': B.lang, 'data-rs': r[0] }); r.forEach(function (c, j) { add(tr, h('td', j === 0 ? null : { class: 'tr-cell' }, j === 0 ? [speakBtn(c, B.lang), ' ', words(c, B.lang)] : j === 1 ? meaningCell(b, ri, c) : c)); }); add(tb, tr); });
        return h('div', { class: 'table-wrap' }, tb);
      }
      case 'aud': return h('div', { class: 'rd-aud' }, h('small', null, '🎧 ' + (b.t || T('js.lib.native'))), h('audio', { controls: true, preload: 'none', src: b.src }));
      case 'vid': return h('figure', { class: 'rd-vid' }, h('video', { controls: true, preload: 'metadata', playsinline: true, src: b.src }), h('figcaption', null, '🎬 ' + b.t + (b.d ? ' · ' + b.d : '')));
      case 'sen': {
        var c = h('div', { class: 'sen', 'data-l': B.lang, 'data-rs': b.t }, speakBtn(b.t, B.lang), h('div', null, h('p', { class: 'tgt' }, words(b.t, B.lang)), h('p', { class: 'tr', lang: 'id' }, b.id)));
        if (b.n) add(c, h('a', { class: 'src', href: 'https://tatoeba.org/sentences/show/' + b.n, target: '_blank', rel: 'noopener' }, '#' + b.n));
        return c;
      }
      case 'kj': {
        var exl = h('ul', { class: 'kj-ex' });
        (b.ex || []).forEach(function (x) { add(exl, h('li', { 'data-l': 'ja', 'data-rs': x[0] }, speakBtn(x[0], 'ja'), h('b', { lang: 'ja' }, x[0]), x[1] ? h('small', { lang: 'ja' }, x[1]) : null, h('span', { class: 'tr' }, x[2]))); });
        var big = h('button', { type: 'button', class: 'kj-char', lang: 'ja', 'aria-label': T('js.lib.listen') }, b.c);
        big.addEventListener('click', function () { say((b.kun || b.on || b.c).split('、')[0].replace(/[.-]/g, ''), 'ja'); });
        return h('div', { class: 'kj' }, big, h('div', { class: 'kj-info' }, h('p', { class: 'kj-m tr' }, meaningCell(b, 0, b.m)), b.on ? h('p', null, h('span', { class: 'kj-tag' }, 'ON'), ' ', h('span', { lang: 'ja' }, b.on)) : null, b.kun ? h('p', null, h('span', { class: 'kj-tag kun' }, 'KUN'), ' ', h('span', { lang: 'ja' }, b.kun)) : null, b.s ? h('p', { class: 'small muted' }, '✍️ ' + b.s) : null, exl));
      }
      case 'gap': return gapBlock(b);
      case 'mc': return mcBlock(b);
      case 'lmc': return lmcBlock(b);
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
    var items = $$('[data-rs]', pageEl), i = 0;
    if (!items.length) return;
    reading = true; readBtn.lastChild.textContent = T('js.lib.stop');
    (function next() {
      $$('.speaking', pageEl).forEach(function (x) { x.classList.remove('speaking'); });
      if (!reading || i >= items.length) { reading = false; readBtn.lastChild.textContent = T('js.lib.readPage'); return; }
      var el = items[i++]; el.classList.add('speaking'); el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      say(el.getAttribute('data-rs'), el.getAttribute('data-l') || B.lang, function () { setTimeout(next, 250); });
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
