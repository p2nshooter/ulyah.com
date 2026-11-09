/* jenius.es — skrip situs: animasi muncul, menu, cookie, PWA, lanjutkan baca, alat gratis, dengarkan artikel, cetak.
 * Semua berjalan di peramban; tidak ada data pengunjung yang dikirim ke server. */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || 'id').indexOf('en') === 0;
  var t = function (id, en) { return EN ? en : id; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* mode privat */ } }
  function json(id) { var el = document.getElementById(id); try { return el ? JSON.parse(el.textContent || 'null') : null; } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── animasi muncul ── */
  var rev = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('in'); });

  /* ── menu ponsel ── */
  var menuBtn = $('[data-menu]'), nav = $('.main-nav');
  if (menuBtn && nav) menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? '✕' : '☰';
  });

  /* ── pemberitahuan cookie ── */
  var ck = $('[data-cookie]');
  if (ck && !load('jen:cookie', false)) {
    ck.hidden = false;
    var ok = $('[data-cookie-ok]', ck);
    if (ok) ok.addEventListener('click', function () { save('jen:cookie', true); ck.hidden = true; });
  }

  /* ── PWA: pasang di HP + service worker ── */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () { /* abaikan */ }); });
  }
  var pwa = $('[data-pwa]'), installBtn = $('[data-pwa-install]'), deferred = null;
  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  var dismissed = load('jen:pwa-off', 0);
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    if (pwa && !standalone && Date.now() - dismissed > 14 * 864e5) { pwa.hidden = false; if (installBtn) installBtn.hidden = false; }
  });
  if (installBtn) installBtn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; if (pwa) pwa.hidden = true; });
  });
  var pwaClose = $('[data-pwa-close]');
  if (pwaClose) pwaClose.addEventListener('click', function () { save('jen:pwa-off', Date.now()); if (pwa) pwa.hidden = true; });
  // iOS tidak punya beforeinstallprompt: tampilkan petunjuk sekali di halaman depan.
  if (pwa && !standalone && /iPhone|iPad/.test(navigator.userAgent) && !window.navigator.standalone && Date.now() - dismissed > 14 * 864e5 && /^\/(en)?$/.test(location.pathname)) {
    var sp = $('span', pwa);
    if (sp) sp.innerHTML = '<b>' + esc(t('Pasang jenius.es di HP', 'Install jenius.es on your phone')) + '</b> ' + esc(t('— ketuk Bagikan lalu „Tambah ke Layar Utama“.', '— tap Share, then “Add to Home Screen”.'));
    pwa.hidden = false;
  }

  /* ── lanjutkan membaca ── */
  $$('[data-resume-link]').forEach(function (a) {
    var id = a.getAttribute('data-resume-link'), pos = load('jen:pos:' + id, null);
    if (!pos || pos.done || (!pos.p && pos.ch <= 1) || !pos.href) return;
    a.href = pos.href;
    a.textContent = '▶ ' + t('Lanjutkan membaca', 'Continue reading');
    var hint = $('[data-resume-hint="' + id + '"]');
    if (hint) hint.textContent = t('Bab ' + pos.ch + ', halaman ' + (pos.p + 1), 'Chapter ' + pos.ch + ', page ' + (pos.p + 1));
  });

  /* ── cetak ── */
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ── suara (artikel, kosakata) ── */
  var synth = window.speechSynthesis || null;
  function voiceFor(lang) {
    if (!synth) return null;
    var vs = synth.getVoices().filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(lang) === 0; });
    return vs.find(function (v) { return v.localService; }) || vs[0] || null;
  }
  function speak(text, lang, opts) {
    var u = new SpeechSynthesisUtterance(text), v = voiceFor(lang);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === 'en' ? 'en-US' : 'id-ID';
    u.rate = (opts && opts.rate) || 1;
    if (opts) { u.onboundary = opts.onboundary || null; u.onend = opts.onend || null; u.onerror = opts.onerror || null; }
    synth.speak(u);
    return u;
  }

  /* ── dengarkan artikel: suara + sorot paragraf + gulir otomatis ── */
  var listenBtn = $('[data-listen-article]'), artText = $('[data-article-text]');
  if (listenBtn && artText) {
    if (!synth || !window.SpeechSynthesisUtterance) listenBtn.hidden = true;
    var blocks = [], at = 0, on = false, label = listenBtn.textContent;
    var stop = function () {
      on = false; synth.cancel();
      blocks.forEach(function (b) { b.classList.remove('speaking'); });
      listenBtn.textContent = label; listenBtn.setAttribute('aria-pressed', 'false'); listenBtn.classList.remove('floating');
    };
    var next = function () {
      if (!on) return;
      blocks.forEach(function (b) { b.classList.remove('speaking'); });
      if (at >= blocks.length) { stop(); return; }
      var el = blocks[at++], txt = (el.textContent || '').trim();
      if (!txt) { next(); return; }
      el.classList.add('speaking');
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      speak(txt, EN ? 'en' : 'id', { onend: next, onerror: function (e) { if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; next(); } });
    };
    listenBtn.addEventListener('click', function () {
      if (on) { stop(); return; }
      blocks = $$('h2, h3, p, li, blockquote', artText).filter(function (el) { return !el.closest('li p') && !(el.tagName === 'P' && el.closest('li')); });
      // mulai dari paragraf yang sedang terlihat
      at = 0;
      for (var i = 0; i < blocks.length; i++) { if (blocks[i].getBoundingClientRect().bottom > 80) { at = i; break; } }
      on = true; listenBtn.textContent = '■ ' + t('Berhenti', 'Stop'); listenBtn.setAttribute('aria-pressed', 'true');
      // Tombol melayang selama dibacakan agar selalu bisa dihentikan walau halaman bergulir otomatis.
      listenBtn.classList.add('floating');
      synth.cancel(); next();
    });
    window.addEventListener('pagehide', function () { if (on) synth.cancel(); });
  }

  /* ── alat: uji kecepatan baca ── */
  var speed = $('[data-tool="speed"]');
  if (speed) {
    var t0 = 0, sBtn = $('[data-speed-start]', speed), eBtn = $('[data-speed-stop]', speed), out = $('[data-speed-out]', speed), txtEl = $('[data-speed-text]', speed);
    var bands = json('speed-bands') || [];
    var n = ((txtEl && txtEl.textContent) || '').trim().split(/\s+/).filter(Boolean).length;
    sBtn.addEventListener('click', function () { t0 = performance.now(); sBtn.disabled = true; eBtn.disabled = false; out.hidden = true; txtEl.classList.add('reading'); eBtn.focus(); });
    eBtn.addEventListener('click', function () {
      if (!t0) return;
      var sec = (performance.now() - t0) / 1000, wpm = Math.round(n / (sec / 60));
      t0 = 0; sBtn.disabled = false; eBtn.disabled = true; txtEl.classList.remove('reading');
      var band = bands.find(function (b) { return wpm <= b.max; }) || bands[bands.length - 1] || { text: '' };
      out.innerHTML = '<p style="font-size:30px;font-weight:800;margin:0">' + wpm + ' ' + esc(t('kata per menit', 'words per minute')) + '</p><p class="muted">' + n + ' ' + esc(t('kata', 'words')) + ' · ' + Math.round(sec) + ' ' + esc(t('detik', 'seconds')) + '</p><p>' + esc(band.text) + '</p>';
      out.hidden = false;
      var hist = load('jen:speed', []); hist.push({ at: Date.now(), wpm: wpm }); save('jen:speed', hist.slice(-20));
      if (hist.length > 1) out.innerHTML += '<p class="muted small">' + esc(t('Hasil sebelumnya', 'Previous results')) + ': ' + hist.slice(-6, -1).map(function (h) { return h.wpm; }).join(' · ') + '</p>';
    });
  }

  /* ── alat: rencana baca mingguan ── */
  var plan = $('[data-tool="plan"]');
  if (plan) {
    var books = json('plan-books') || {}, pi = json('plan-i18n') || {}, pout = $('[data-plan-out]');
    var build = function () {
      var f = new FormData(plan), lane = String(f.get('lane')), mins = Math.max(5, Math.min(120, Number(f.get('minutes')) || 20));
      var days = Math.max(1, Math.min(7, Number(f.get('days')) || 5)), weeks = Math.max(1, Math.min(12, Number(f.get('weeks')) || 4)), who = String(f.get('who') || '').trim();
      var list = books[lane] || [];
      if (!list.length) { pout.innerHTML = '<p class="card">' + esc(pi.none) + '</p>'; return; }
      // Bagikan buku berurutan: setiap sesi membaca `mins` menit dari sisa buku saat ini.
      var bi = 0, left = Math.max(5, list[0].minutes || 30), rows = '';
      for (var w = 1; w <= weeks; w++) {
        for (var d = 1; d <= days; d++) {
          var b = list[bi % list.length], part = Math.min(mins, left);
          rows += '<tr><td>' + esc(pi.week) + ' ' + w + '</td><td>' + esc(pi.day) + ' ' + d + '</td><td><a href="' + esc(b.href) + '">' + esc(b.title) + '</a></td><td>' + mins + ' ' + esc(pi.minutes) + '</td><td>☐</td></tr>';
          left -= mins;
          if (left <= 0 || part < mins) { bi++; var nb = list[bi % list.length]; left = Math.max(5, nb.minutes || 30); }
        }
      }
      pout.innerHTML = '<h2>' + esc(pi.plan) + (who ? ' — ' + esc(who) : '') + '</h2><table><thead><tr><th>' + esc(pi.week) + '</th><th>' + esc(pi.day) + '</th><th>' + esc(pi.book) + '</th><th>⏱</th><th>' + esc(pi.done) + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
      save('jen:plan', { lane: lane, mins: mins, days: days, weeks: weeks, who: who });
    };
    var prev = load('jen:plan', null);
    if (prev) { ['lane', 'mins', 'days', 'weeks', 'who'].forEach(function (k) { var el = plan.elements[k === 'mins' ? 'minutes' : k]; if (el && prev[k] != null) el.value = prev[k]; }); }
    plan.addEventListener('submit', function (e) { e.preventDefault(); build(); pout.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
  }

  /* ── alat: pemilih buku ── */
  var picker = $('[data-tool="picker"]');
  if (picker) {
    var pd = json('picker-data') || { lanes: [], books: {}, i18n: {} }, kout = $('[data-picker-out]');
    var laneOf = function (age, eng) { return eng ? 'lintas' : age <= 7 ? 'tunas' : age <= 11 ? 'tumbuh' : age <= 17 ? 'jelajah' : age <= 23 ? 'kampus' : 'santai'; };
    var pick = function () {
      var f = new FormData(picker), age = Number(f.get('age')) || 8, minat = String(f.get('minat') || ''), dur = Number(f.get('durasi')) || 99999, eng = f.get('belajar') === '1';
      var id = laneOf(age, eng), lane = pd.lanes.find(function (l) { return l.id === id; }) || pd.lanes[0];
      var all = (pd.books[id] || []), list = all.filter(function (b) { return (!minat || b.shelf === minat) && (b.minutes || 0) <= dur; });
      if (!list.length) list = all.filter(function (b) { return (b.minutes || 0) <= dur; });
      var longer = false;
      if (!list.length && all.length) {
        // Tidak ada yang cukup pendek: tampilkan yang paling pendek, didengarkan per bab.
        longer = true;
        list = all.filter(function (b) { return !minat || b.shelf === minat; });
        if (!list.length) list = all.slice();
        list.sort(function (a, b) { return (a.minutes || 0) - (b.minutes || 0); });
      }
      var html = '<div class="card result"><p class="eyebrow">' + esc(pd.i18n.lane) + '</p><h2><a href="' + esc(lane.href) + '">' + esc(lane.icon + ' ' + lane.name) + '</a></h2>';
      if (longer) html += '<p class="muted">' + esc(pd.i18n.longer) + '</p>';
      html += list.length ? '<ul class="clean">' + list.slice(0, 8).map(function (b) { return '<li><a href="' + esc(b.href) + '"><b>' + esc(b.title) + '</b></a> — <span class="muted">' + esc(b.author) + ' · ' + esc(b.label) + '</span></li>'; }).join('') + '</ul>' : '<p>' + esc(pd.i18n.none) + '</p>';
      kout.innerHTML = html + '</div>';
    };
    picker.addEventListener('submit', function (e) { e.preventDefault(); pick(); kout.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); });
  }

  /* ── alat: kartu kosakata ── */
  var vocab = $('[data-tool="vocab"]');
  if (vocab) {
    var vout = $('[data-vocab-out]'), say = $('[data-vocab-say]');
    var parse = function () {
      return String(new FormData(vocab).get('words') || '').split(/\n+/).map(function (l) {
        var m = l.split(/\s*[=:–-]\s*/); return { w: (m[0] || '').trim(), d: m.slice(1).join(' – ').trim() };
      }).filter(function (x) { return x.w; }).slice(0, 60);
    };
    var draw = function () {
      var items = parse();
      vout.innerHTML = items.map(function (x) { return '<div class="vocab-card"><div>' + esc(x.w) + '</div><div>' + esc(x.d || '…') + '</div></div>'; }).join('');
      try { localStorage.setItem('jen:vocab', String(new FormData(vocab).get('words') || '')); } catch (e) { /* abaikan */ }
    };
    try { var saved = localStorage.getItem('jen:vocab'); if (saved) vocab.elements.words.value = saved; } catch (e) { /* abaikan */ }
    vocab.addEventListener('submit', function (e) { e.preventDefault(); draw(); });
    draw();
    if (say) {
      if (!synth) say.hidden = true;
      else say.addEventListener('click', function () {
        synth.cancel();
        // Kata (bahasa Inggris) lalu artinya (bahasa halaman).
        parse().forEach(function (x) { speak(x.w, 'en', { rate: 0.85 }); if (x.d) speak(x.d, EN ? 'en' : 'id', { rate: 0.95 }); });
      });
    }
  }
})();
