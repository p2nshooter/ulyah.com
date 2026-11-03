/* AI Content Analyzer — interaksi antarmuka. Tanpa pustaka luar; semua bekerja juga tanpa animasi. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* diblokir */ } }
  };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'id';
  var T = function (id, en) { return LANG === 'en' ? en : id; };
  var fmt = function (n) { return Number(n || 0).toLocaleString(LANG === 'en' ? 'en-US' : 'id-ID'); };
  var jsonOf = function (id) { var el = document.getElementById(id); try { return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; } };

  function toast(msg, err) {
    var box = $('.toasts'); if (!box) return;
    var t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg; box.appendChild(t);
    setTimeout(function () { t.remove(); }, 4200);
  }

  async function api(url, body, method) {
    var res = await fetch(url, { method: method || (body === undefined ? 'GET' : 'POST'), headers: body === undefined ? {} : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), credentials: 'same-origin' });
    var data = {};
    try { data = await res.json(); } catch (e) { /* bukan JSON */ }
    if (!res.ok) { var err = new Error(data.error || ('HTTP ' + res.status)); err.status = res.status; throw err; }
    return data;
  }
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ── muncul saat digulir + hitung naik ───────────────────── */
  function countUp(el) {
    var to = Number(el.getAttribute('data-count')); if (!isFinite(to)) return;
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = performance.now(), dur = 1100;
    (function step(t) { var p = Math.min(1, (t - t0) / dur); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 }) : null;
  $$('.reveal, .ring, .cbar').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
  window.addEventListener('beforeprint', function () { $$('.reveal, .ring, .cbar').forEach(function (el) { el.classList.add('in'); }); });

  var top = $('[data-elevate]');
  if (top) window.addEventListener('scroll', function () { top.classList.toggle('elevated', window.scrollY > 8); }, { passive: true });

  /* ── klik umum ───────────────────────────────────────────── */
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var tog = t.closest('[data-toggle]');
    if (tog) { var target = document.getElementById(tog.getAttribute('data-toggle')) || $('.' + tog.getAttribute('data-toggle')); if (target) target.classList.toggle('open'); }
    if (t.closest('[data-print]')) { $$('.reveal, .ring, .cbar').forEach(function (el) { el.classList.add('in'); }); window.print(); }
    var cp = t.closest('[data-copy]');
    if (cp) { var src = $(cp.getAttribute('data-copy')); var text = src ? src.textContent.replace(/\s+/g, ' ').trim() : ''; if (cp.getAttribute('data-copy') === '#totpSecret') text = text.replace(/\s/g, ''); if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast(T('Disalin ✓', 'Copied ✓')); }); }
    var conf = t.closest('[data-confirm]');
    if (conf && !conf.hasAttribute('data-review') && !window.confirm(conf.getAttribute('data-confirm'))) { ev.preventDefault(); return; }
    var gx = t.closest('[data-guide-close]');
    if (gx) { var g = gx.closest('[data-guide]'); if (g) { g.classList.add('gone'); store.set('guide:' + g.getAttribute('data-guide'), '1'); } }
    // Baris tabel yang bisa diklik meneruskan klik ke tautan di dalam barisnya sendiri (tanpa membaca URL dari atribut).
    var row = t.closest('tr[data-href]');
    if (row && !t.closest('a, button, form, input, select, textarea')) { var link = row.querySelector('a[href]'); if (link) link.click(); }
    var rv = t.closest('[data-review]');
    if (rv) {
      ev.preventDefault();
      if (!window.confirm(rv.getAttribute('data-confirm'))) return;
      rv.setAttribute('aria-busy', 'true');
      api('/api/reports/' + encodeURIComponent(rv.getAttribute('data-review')) + '/review', {}).then(function (d) { location.href = '/app/proses/' + encodeURIComponent(d.id); }).catch(function (e) { rv.removeAttribute('aria-busy'); toast(e.message, true); });
    }
  });
  $$('[data-guide]').forEach(function (g) { if (store.get('guide:' + g.getAttribute('data-guide'))) g.classList.add('gone'); });

  /* ── formulir: tombol sibuk, kekuatan sandi, keluaran rentang ── */
  document.addEventListener('submit', function (ev) {
    var f = ev.target; if (f.hasAttribute('data-no-busy')) return;
    var b = f.querySelector('button[type="submit"][data-busy], button[data-busy]:not([type])') || f.querySelector('button[type="submit"]');
    if (b && !ev.defaultPrevented) setTimeout(function () { b.setAttribute('aria-busy', 'true'); }, 0);
  });
  $$('[data-strength]').forEach(function (inp) {
    var bar = inp.closest('form').querySelector('.strength');
    inp.addEventListener('input', function () {
      var v = inp.value, s = 0;
      if (v.length >= 8) s += 30; if (v.length >= 12) s += 20; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s += 20; if (/\d/.test(v)) s += 15; if (/[^A-Za-z0-9]/.test(v)) s += 15;
      if (bar) bar.style.setProperty('--s', Math.min(100, s) + '%');
    });
  });
  $$('[data-sync]').forEach(function (r) {
    var num = document.getElementById(r.getAttribute('data-sync')); if (!num) return;
    r.addEventListener('input', function () { num.value = r.value; });
    num.addEventListener('input', function () { r.value = num.value; });
  });
  $$('[data-preset]').forEach(function (b) { b.addEventListener('click', function () { var t = document.getElementById(b.getAttribute('data-target')); if (!t) return; t.value = b.getAttribute('data-preset'); t.dispatchEvent(new Event('input', { bubbles: true })); var r = document.querySelector('[data-sync="' + t.id + '"]'); if (r) r.value = t.value; }); });
  $$('[data-range-out]').forEach(function (r) { var o = document.getElementById(r.getAttribute('data-range-out')); r.addEventListener('input', function () { if (o) o.textContent = r.value + '×'; }); });

  /* ── ekstraksi teks berkas (.txt, .md, .docx) di peramban ── */
  /** Teks dari word/document.xml lewat pengurai XML peramban (bukan regex): paragraf, tab, ganti baris. */
  function docxXmlText(xml) {
    var W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('docx');
    var paras = doc.getElementsByTagNameNS(W, 'p'), out = [];
    var ownerP = function (el) { var x = el.parentNode; while (x && !(x.namespaceURI === W && x.localName === 'p')) x = x.parentNode; return x; };
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i], text = '', els = p.getElementsByTagNameNS(W, '*');
      for (var j = 0; j < els.length; j++) {
        var el = els[j];
        if (ownerP(el) !== p) continue; // paragraf bersarang (kotak teks) diambil sendiri
        if (el.localName === 't') text += el.textContent;
        else if (el.localName === 'tab') text += '\t';
        else if (el.localName === 'br' || el.localName === 'cr') text += '\n';
      }
      out.push(text);
    }
    return out.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  async function inflateRaw(bytes) {
    var ds = new DecompressionStream('deflate-raw');
    var out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function docxText(buf) {
    var u8 = new Uint8Array(buf), dv = new DataView(buf);
    var eocd = -1;
    for (var i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error('docx');
    var n = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true);
    for (var k = 0; k < n; k++) {
      var nameLen = dv.getUint16(off + 28, true), extra = dv.getUint16(off + 30, true), comment = dv.getUint16(off + 32, true);
      var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true), local = dv.getUint32(off + 42, true);
      var name = new TextDecoder().decode(u8.subarray(off + 46, off + 46 + nameLen));
      if (name === 'word/document.xml') {
        var lnl = dv.getUint16(local + 26, true), lex = dv.getUint16(local + 28, true);
        var data = u8.subarray(local + 30 + lnl + lex, local + 30 + lnl + lex + csize);
        var xml = new TextDecoder().decode(method === 0 ? data : await inflateRaw(data));
        return docxXmlText(xml);
      }
      off += 46 + nameLen + extra + comment;
    }
    throw new Error('docx');
  }
  async function fileText(file) {
    var name = file.name.toLowerCase();
    if (name.endsWith('.docx')) return docxText(await file.arrayBuffer());
    if (name.endsWith('.txt') || name.endsWith('.md')) return file.text();
    throw new Error(T('Format belum didukung — gunakan .docx atau .txt.', 'Unsupported format — use .docx or .txt.'));
  }
  var words = function (s) { var m = (s || '').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu); return m ? m.length : 0; };
  function parseName(fname) {
    var base = fname.replace(/\.[^.]+$/, '');
    var parts = base.split(/_+/);
    if (parts.length >= 3 && /^\d+$/.test(parts[0])) return { author: parts[1].trim(), title: parts.slice(2).join(' ').trim() };
    if (parts.length === 2) return { author: parts[0].trim(), title: parts[1].trim() };
    return { author: '', title: base.replace(/[-_]+/g, ' ').trim() };
  }
  function wireDrop(zone, onFiles) {
    if (!zone) return;
    ['dragenter', 'dragover'].forEach(function (e) { zone.addEventListener(e, function (ev) { ev.preventDefault(); zone.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (e) { zone.addEventListener(e, function (ev) { ev.preventDefault(); zone.classList.remove('drag'); }); });
    zone.addEventListener('drop', function (ev) { if (ev.dataTransfer && ev.dataTransfer.files.length) onFiles(ev.dataTransfer.files); });
    var inp = zone.querySelector('input[type=file]');
    if (inp) inp.addEventListener('change', function () { if (inp.files.length) onFiles(inp.files); });
  }

  /* ── formulir periksa: hitung kata + perkiraan token dari server ── */
  var form = $('[data-check-form]');
  if (form) {
    var ta = form.querySelector('textarea[name=text]');
    var wc = $('#wc'), pg = $('#pg'), box = $('[data-estimate-box]');
    var timer = null;
    function estimate() {
      var w = words(ta.value);
      if (wc) wc.textContent = fmt(w);
      if (pg) pg.textContent = (w / 300).toLocaleString(LANG === 'en' ? 'en-US' : 'id-ID', { maximumFractionDigits: 1 });
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (w < 1) return;
        var mode = (form.querySelector('input[name=mode]:checked') || {}).value || 'auto';
        var rub = form.querySelector('select[name=rubric]').value ? '1' : '0';
        api('/api/estimate?words=' + w + '&mode=' + mode + '&rubric=' + rub).then(function (e) {
          $('#estLo').textContent = fmt(e.min); $('#estTy').textContent = fmt(e.typical); $('#estRes').textContent = fmt(e.reserve);
          if (e.modes) $$('[data-mode-est]', form).forEach(function (el) { var x = e.modes[el.getAttribute('data-mode-est')]; if (x) el.textContent = '≈ ' + fmt(x.min) + '–' + fmt(x.typical) + ' token · ' + T('dipesan ', 'reserved ') + fmt(x.reserve); });
          if (pg) pg.textContent = String(e.pages).replace('.', LANG === 'en' ? '.' : ',');
          if (box) { box.classList.add('updated'); setTimeout(function () { box.classList.remove('updated'); }, 600); }
        }).catch(function () { /* diam */ });
      }, 350);
    }
    ta.addEventListener('input', estimate);
    form.addEventListener('change', estimate);
    estimate();
    wireDrop(form.querySelector('[data-drop]'), async function (files) {
      try {
        var f = files[0]; ta.value = await fileText(f); estimate();
        var title = form.querySelector('input[name=title]'); var meta = parseName(f.name);
        if (title && !title.value) title.value = meta.title;
        var au = form.querySelector('input[name=author]'); if (au && !au.value && meta.author) au.value = meta.author;
        toast(T('Teks diambil dari ', 'Text extracted from ') + f.name);
      } catch (e) { toast(e.message === 'docx' ? T('Berkas .docx tidak terbaca.', 'Could not read the .docx file.') : e.message, true); }
    });
  }

  /* ── animasi tahap kaskade + penggerak /advance ───────────── */
  var ORDER = ['prep', 't1', 't2', 't3', 'fuse', 'rubric2', 'done'];
  function paintStages(root, st, i18n) {
    var idx = ORDER.indexOf(st.stage);
    $$('[data-stage]', root).forEach(function (li) {
      var k = li.getAttribute('data-stage'), i = ORDER.indexOf(k);
      li.classList.remove('active', 'done', 'skipped', 'failed');
      var note = li.querySelector('.st-note'); if (note) note.textContent = '';
      if ((st.skipped || []).indexOf(k) >= 0) { li.classList.add('skipped'); if (note) note.textContent = i18n.skipped; return; }
      if (st.stage === 'failed') { if (i <= 0 || li.classList.contains('active')) li.classList.add('failed'); return; }
      if (i < idx || st.stage === 'done') li.classList.add('done'); else if (i === idx) li.classList.add('active');
      if (k === 't2' && st.t2n) note && (note.textContent = st.t2n + ' ' + i18n.sentences);
      if (k === 't3' && st.t3n) note && (note.textContent = st.t3n + ' ' + i18n.sentences);
    });
  }
  async function drive(id, onState) {
    var st = null, fails = 0;
    for (;;) {
      try { st = await api('/api/checks/' + id + '/advance', {}); fails = 0; }
      catch (e) { fails++; if (fails > 6) throw e; await sleep(3000 * fails); continue; }
      if (onState) onState(st);
      if (st.stage === 'done' || st.stage === 'failed') return st;
      await sleep(st.retryAt ? Math.min(20000, Math.max(1500, st.retryAt - Date.now())) : 700);
    }
  }
  var proc = $('[data-process]');
  if (proc) {
    var i18n = jsonOf('i18n-process') || {};
    var errBox = $('[data-err]', proc);
    drive(proc.getAttribute('data-process'), function (st) {
      paintStages(proc, st, i18n);
      if (st.error && st.stage !== 'failed') { var m = $('[data-msg]', proc); if (m) m.textContent = i18n.retry; }
    }).then(function (st) {
      if (st.stage === 'done' && st.reportId) { proc.classList.add('done'); setTimeout(function () { location.href = '/app/laporan/' + encodeURIComponent(st.reportId); }, reduce ? 0 : 700); }
      else if (st.stage === 'failed') { errBox.hidden = false; errBox.textContent = '⚠ ' + i18n.failed + ': ' + (st.error ? st.error.msg : '') + ' ' + i18n.refunded; }
    }).catch(function (e) { errBox.hidden = false; errBox.textContent = '⚠ ' + e.message; });
  }

  /* ── sesi lomba: unggah banyak, jalankan, kemajuan ────────── */
  var batch = $('[data-batch]');
  if (batch) {
    var bi18n = jsonOf('i18n-batch') || {};
    var queue = [];
    var qBox = $('[data-queue]', batch), qBody = $('[data-queue-body]', batch), qTotal = $('[data-queue-total]', batch);
    var bErr = $('[data-batch-err]', batch), bProg = $('[data-batch-progress]', batch);
    function renderQueue() {
      qBox.hidden = queue.length === 0;
      qBody.innerHTML = '';
      var total = 0;
      queue.forEach(function (e, i) {
        total += e.words;
        var tr = document.createElement('tr');
        var cell = function (child, cls) { var td = document.createElement('td'); if (cls) td.className = cls; td.appendChild(child); tr.appendChild(td); return child; };
        var inA = document.createElement('input'); inA.setAttribute('data-k', 'author'); inA.value = e.author; cell(inA);
        var inT = document.createElement('input'); inT.setAttribute('data-k', 'title'); inT.value = e.title; cell(inT);
        cell(document.createTextNode(fmt(e.words)), 'n');
        var rm = document.createElement('button'); rm.type = 'button'; rm.className = 'btn btn-ghost btn-sm'; rm.textContent = bi18n.remove; cell(rm);
        tr.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () { e[inp.getAttribute('data-k')] = inp.value; }); });
        tr.querySelector('button').addEventListener('click', function () { queue.splice(i, 1); renderQueue(); });
        qBody.appendChild(tr);
      });
      qTotal.textContent = fmt(total);
    }
    wireDrop($('[data-drop]', batch), async function (files) {
      for (var i = 0; i < files.length; i++) {
        try { var text = await fileText(files[i]); var m = parseName(files[i].name); queue.push({ title: m.title, author: m.author, text: text, words: words(text) }); }
        catch (e) { toast(files[i].name + ': ' + (e.message === 'docx' ? 'docx?' : e.message), true); }
      }
      renderQueue();
    });
    async function runIds(ids) {
      bProg.hidden = false;
      var done = 0, bar = $('[data-bp]', bProg), txt = $('[data-bp-text]', bProg);
      var update = function () { bar.style.setProperty('--w', (ids.length ? (done / ids.length) * 100 : 100) + '%'); txt.textContent = bi18n.running + ' ' + done + ' ' + bi18n.of + ' ' + ids.length; };
      update();
      var next = 0;
      async function worker() { while (next < ids.length) { var id = ids[next++]; try { await drive(id); } catch (e) { /* lanjut */ } done++; update(); } }
      await Promise.all([worker(), worker()]);
      try { await api('/api/batches/' + batch.getAttribute('data-batch') + '/finalize', {}); } catch (e) { /* cron menyelesaikan */ }
      txt.textContent = bi18n.done;
      setTimeout(function () { location.reload(); }, 800);
    }
    var runBtn = $('[data-run]', batch);
    if (runBtn) runBtn.addEventListener('click', async function () {
      bErr.hidden = true;
      if (!$('[data-agree]', batch).checked) { toast(bi18n.agree, true); return; }
      runBtn.setAttribute('aria-busy', 'true');
      try {
        var modeSel = $('[data-batch-mode]', batch);
        var res = await api('/api/batches/' + batch.getAttribute('data-batch') + '/run', { agree: true, mode: modeSel ? modeSel.value : 'auto', entries: queue.map(function (e) { return { title: e.title, author: e.author, text: e.text }; }) });
        queue = []; renderQueue(); await runIds(res.ids);
      } catch (e) { bErr.hidden = false; bErr.textContent = '⚠ ' + e.message; }
      runBtn.removeAttribute('aria-busy');
    });
    var pending = jsonOf('batch-pending') || [];
    if (pending.length) runIds(pending);
  }

  /* ── benchmark admin ─────────────────────────────────────── */
  var bench = $('[data-bench]');
  if (bench) {
    var startBtn = $('[data-bench-start]', bench);
    var bt = jsonOf('i18n-bench') || {};
    startBtn.addEventListener('click', async function () {
      var set = bench.getAttribute('data-bench'), n = Number(bench.getAttribute('data-bench-n')) || 0;
      var run = bench.getAttribute('data-bench-run') || ('r' + Date.now().toString(36));
      var prog = $('[data-bench-progress]', bench); prog.hidden = false;
      var bar = $('[data-bp]', prog), txt = $('[data-bp-text]', prog);
      startBtn.setAttribute('aria-busy', 'true');
      var idx = 0, done = 0;
      async function worker() { while (idx < n) { var i = idx++; try { var r = await api('/api/admin/bench/' + set + '/' + i + '?run=' + run, {}); if (r.id) await drive(r.id); } catch (e) { /* lanjut */ } done++; bar.style.setProperty('--w', (done / n) * 100 + '%'); txt.textContent = bt.running + ' ' + done + ' ' + bt.of + ' ' + n; } }
      await Promise.all([worker(), worker(), worker()]);
      txt.textContent = bt.done;
      location.href = '/admin/benchmark?set=' + encodeURIComponent(set) + '&run=' + encodeURIComponent(run);
    });
  }
  /* ── chip isi cepat (nominal deposit) ─────────────────────── */
  document.addEventListener('click', function (ev) {
    var chip = ev.target.closest('[data-set]');
    if (chip) { var inp = $(chip.getAttribute('data-set')); if (inp) { inp.value = chip.getAttribute('data-value'); inp.dispatchEvent(new Event('input', { bubbles: true })); } }
  });

  /* ── pratinjau tukar deposit → token ─────────────────────── */
  $$('[data-convert]').forEach(function (f) {
    var tp = Number(f.getAttribute('data-tp')) || 1, inp = $('[data-convert-in]', f), out = $('[data-convert-out]', f);
    if (!inp || !out) return;
    var upd = function () { out.textContent = fmt(Math.floor((Number(inp.value) || 0) / tp)); };
    inp.addEventListener('input', upd); upd();
  });

  /* ── Admin → Harga: pratinjau langsung (rumus sama dengan server: engine/pricing.ts) ── */
  var pf = $('[data-pricing]');
  if (pf) {
    var fx = Number(pf.getAttribute('data-fx')) || 16500, aff = Number(pf.getAttribute('data-aff')) || 0;
    var mk = $('#markupNum', pf), range = $('[data-sync]', pf), unitIn = $('[data-unit-input]', pf);
    var nice = function (x) { if (x >= 100000) return Math.round(x / 1000) * 1000; if (x >= 10000) return Math.round(x / 500) * 500; return Math.max(100, Math.round(x / 100) * 100); };
    var rp = function (x) { return 'Rp ' + fmt(Math.round(x)); };
    var recalc = function () {
      var m = Math.min(500, Math.max(10, Number(mk.value) || 10)), unit = Number(unitIn && unitIn.value) || Number(pf.getAttribute('data-unit')) || 0.001;
      var tPrice = unit * fx * m, tCost = unit * fx;
      $$('[data-out="tokenPrice"]', pf).forEach(function (el) { el.textContent = rp(tPrice); });
      $$('[data-pkg-row]', pf).forEach(function (row) {
        var tok = Number($('[data-tokens]', row).value) || 0, disc = Math.min(50, Math.max(0, Number($('[data-disc]', row).value) || 0)) / 100;
        var price = nice(tok * tPrice * (1 - disc)), cost = Math.round(tok * tCost), cut = Math.floor(price * aff / 100);
        var set = function (k, v) { var el = $('[data-out="' + k + '"]', row); if (el) el.textContent = v; };
        set('price', rp(price)); set('cost', rp(cost)); set('profit', rp(price - cost)); set('profitAff', rp(price - cost - cut));
      });
      $$('[data-page-row]', pf).forEach(function (row) {
        var lo = Number(row.getAttribute('data-lo')), hi = Number(row.getAttribute('data-hi'));
        var el = $('[data-out="pagePrice"]', row); if (el) el.textContent = rp(lo * tPrice) + '–' + fmt(Math.round(hi * tPrice));
      });
    };
    if (range) range.addEventListener('input', function () { mk.value = range.value; recalc(); });
    mk.addEventListener('input', function () { if (range) range.value = mk.value; recalc(); });
    pf.addEventListener('input', function (ev) { if (ev.target.hasAttribute('data-live')) recalc(); });
  }
})();
