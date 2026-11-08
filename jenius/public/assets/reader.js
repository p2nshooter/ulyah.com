/* jenius.es — pembaca AUTO (docs/JENIUS-BLUEPRINT.md §0.3).
 * Tekan Putar sekali: suara sintetis perangkat membacakan halaman, kata yang diucapkan disorot, halaman berganti sendiri
 * dengan animasi, berlanjut sampai akhir bab atau akhir buku. Buku bergambar: mode slide layar penuh.
 * Tanpa iklan, tanpa pelacak. Posisi baca disimpan di perangkat (localStorage jen:pos:{id}). */
(function () {
  'use strict';
  var root = document.querySelector('[data-reader]');
  var dataEl = document.getElementById('reader-data');
  if (!root || !dataEl) return;
  var D = JSON.parse(dataEl.textContent || '{}');
  var T = D.i18n || {};
  var $ = function (s) { return root.querySelector(s); };
  var pageEl = $('[data-r-page]'), playBtn = $('[data-r-play]'), playIc = $('[data-r-play-ic]'), countEl = $('[data-r-count]'), barEl = $('[data-r-bar]');
  var rateSel = $('[data-r-rate]'), panel = $('[data-r-panel]'), voiceSel = $('[data-r-voice]'), untilSel = $('[data-r-until]'), modeSel = $('[data-r-mode]');
  var sizeIn = $('[data-r-size]'), dysIn = $('[data-r-dys]'), nightIn = $('[data-r-night]'), contrastIn = $('[data-r-contrast]'), settingsBtn = $('[data-r-settings]');
  var synth = window.speechSynthesis || null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── penyimpanan aman (bisa gagal di mode privat) ── */
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }

  var S = Object.assign({ rate: 1, voice: D.voice || 'narrator', until: 'chapter', mode: 'listen', size: 21, dys: false, night: false, contrast: false }, load('jen:reader', {}));
  var pages = [], idx = 0, playing = false, utter = null, timer = 0, words = [], wordAt = 0, autostart = false, busy = false;

  /* ── pengaturan ── */
  function applySettings() {
    rateSel.value = String(S.rate); voiceSel.value = S.voice; untilSel.value = S.until; modeSel.value = S.mode; sizeIn.value = String(S.size);
    dysIn.checked = !!S.dys; nightIn.checked = !!S.night; contrastIn.checked = !!S.contrast;
    root.classList.toggle('dys', !!S.dys); root.classList.toggle('night', !!S.night); root.classList.toggle('contrast', !!S.contrast);
    pageEl.style.fontSize = S.size + 'px';
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = S.night ? '#111318' : '#0b2a6b';
  }
  function setS(k, v) { S[k] = v; save('jen:reader', S); applySettings(); }
  rateSel.addEventListener('change', function () { setS('rate', Number(rateSel.value)); restartPage(); });
  voiceSel.addEventListener('change', function () { setS('voice', voiceSel.value); restartPage(); });
  untilSel.addEventListener('change', function () { setS('until', untilSel.value); });
  modeSel.addEventListener('change', function () { setS('mode', modeSel.value); restartPage(); });
  sizeIn.addEventListener('input', function () { setS('size', Number(sizeIn.value)); });
  dysIn.addEventListener('change', function () { setS('dys', dysIn.checked); });
  nightIn.addEventListener('change', function () { setS('night', nightIn.checked); });
  contrastIn.addEventListener('change', function () { setS('contrast', contrastIn.checked); });
  function openPanel(open) { panel.hidden = !open; settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) panel.querySelector('select,input,button').focus(); else settingsBtn.focus(); }
  settingsBtn.addEventListener('click', function () { openPanel(panel.hidden); });
  $('[data-r-close]').addEventListener('click', function () { openPanel(false); });

  /* ── suara ── */
  var voices = [];
  function listVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) { listVoices(); if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', listVoices); }
  var FEMALE = /female|woman|wanita|perempuan|gadis|damayanti|zira|samantha|karen|moira|tessa|serena|victoria|fiona|susan|hazel|aria|jenny|libby|sonia|natasha|ava|allison|kathy|siti/i;
  var MALE = /\bmale\b|\bman\b|pria|laki|david|mark|daniel|alex|fred|tom|george|ryan|guy|thomas|aaron|arthur|oliver|james|rizwan|ardi\b|andika/i;
  function pickVoice() {
    // Cocokkan bahasa utama (en-GB → semua suara en-*), suara dengan wilayah yang sama didahulukan.
    var full = (D.lang || 'id').toLowerCase().replace('_', '-'), base = full.split('-')[0];
    var norm = function (v) { return (v.lang || '').toLowerCase().replace('_', '-'); };
    var pool = voices.filter(function (v) { return norm(v).split('-')[0] === base; })
      .sort(function (a, b) { return Number(norm(b) === full) - Number(norm(a) === full); });
    if (!pool.length) return null;
    var pref = S.voice, best = null;
    if (pref === 'teacher-m') best = pool.find(function (v) { return MALE.test(v.name) && !/female/i.test(v.name); });
    else if (pref === 'teacher-f' || pref === 'child') best = pool.find(function (v) { return FEMALE.test(v.name); });
    if (!best) best = pool.find(function (v) { return v.localService; }) || pool[0];
    return best;
  }
  function voiceParams() {
    switch (S.voice) {
      case 'child': return { pitch: 1.35, rate: 0.95 };
      case 'teacher-f': return { pitch: 1.1, rate: 0.95 };
      case 'teacher-m': return { pitch: 0.9, rate: 0.95 };
      default: return { pitch: 1, rate: 1 };
    }
  }
  function canSpeak() { return !!(synth && window.SpeechSynthesisUtterance) && (voices.length === 0 || !!pickVoice()); }

  /* ── tampilan halaman ── */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function wrapWords(text) {
    return esc(text).split(/(\s+)/).map(function (part) { return /\S/.test(part) ? '<span class="w">' + part + '</span>' : part; }).join('');
  }
  function renderPage() {
    var blocks = pages[idx] || [];
    var out = blocks.map(function (b) {
      if (b.t === 'h') return '<h2>' + wrapWords(b.text) + '</h2>';
      if (b.t === 'verse') return '<p class="verse">' + wrapWords(b.text) + '</p>';
      if (b.t === 'img') return '<figure class="r-img"><img src="' + esc(b.src) + '" alt="' + esc(b.alt || '') + '" loading="eager" decoding="async"></figure>' + (b.text ? '<p>' + wrapWords(b.text) + '</p>' : '');
      return '<p>' + wrapWords(b.text) + '</p>';
    }).join('');
    pageEl.innerHTML = out || '<p class="muted">…</p>';
    words = Array.prototype.slice.call(pageEl.querySelectorAll('.w'));
    wordAt = 0;
    countEl.textContent = (T.page || 'Hlm') + ' ' + (idx + 1) + ' ' + (T.of || '/') + ' ' + pages.length;
    var chs = D.chapters || [D.ch], pos = chs.indexOf(D.ch);
    var frac = chs.length > 1 ? (pos + (idx + 1) / Math.max(1, pages.length)) / chs.length : (idx + 1) / Math.max(1, pages.length);
    barEl.style.width = Math.min(100, Math.round(frac * 1000) / 10) + '%';
    save('jen:pos:' + D.id, { ch: D.ch, p: idx, at: Date.now(), href: location.pathname });
    preloadNext();
  }
  function preloadNext() {
    var nx = pages[idx + 1]; if (!nx) return;
    nx.forEach(function (b) { if (b.t === 'img') { var im = new Image(); im.src = b.src; } });
  }
  function turn(dir, cb) {
    if (reduce) { cb(); return; }
    pageEl.classList.remove('turn-in', 'turn-out', 'back-out');
    void pageEl.offsetWidth;
    pageEl.classList.add(dir > 0 ? 'turn-out' : 'back-out');
    setTimeout(function () {
      pageEl.classList.remove('turn-out', 'back-out');
      cb();
      pageEl.classList.add('turn-in');
      setTimeout(function () { pageEl.classList.remove('turn-in'); }, 520);
    }, dir > 0 ? 520 : 430);
  }
  function go(to, dir) {
    if (busy) return;
    if (to < 0) { if (D.prev) location.href = D.prev + '#akhir'; return; }
    if (to >= pages.length) { endOfChapter(); return; }
    busy = true;
    stopVoice();
    turn(dir || 1, function () { idx = to; renderPage(); busy = false; if (playing) speakPage(); });
  }
  function toast(msg, ms) {
    var t = document.createElement('div'); t.className = 'r-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, ms || 2600);
  }

  /* ── membaca ── */
  function pageText() { return words.map(function (w) { return w.textContent; }).join(' '); }
  function highlight(i) {
    if (words[wordAt]) words[wordAt].classList.remove('on');
    wordAt = i;
    var w = words[i]; if (!w) return;
    w.classList.add('on');
    var r = w.getBoundingClientRect(), pr = pageEl.getBoundingClientRect();
    if (r.bottom > pr.bottom - 20 || r.top < pr.top) w.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }
  function clearHighlight() { words.forEach(function (w) { w.classList.remove('on'); }); }
  function stopVoice() {
    clearTimeout(timer); timer = 0;
    if (utter) { utter.onend = utter.onboundary = utter.onerror = null; utter = null; }
    if (synth) synth.cancel();
    clearHighlight();
  }
  function speakPage() {
    stopVoice();
    if (!words.length) { timer = setTimeout(nextAuto, 2500); return; }
    if (S.mode === 'silent' || !canSpeak()) return silentPage();
    // offsets of every word in the spoken string
    var text = '', starts = [];
    words.forEach(function (w, i) { if (i) text += ' '; starts.push(text.length); text += w.textContent; });
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = /^en/i.test(D.lang || '') ? 'en-US' : 'id-ID';
    var vp = voiceParams(); u.pitch = vp.pitch; u.rate = Math.max(0.5, Math.min(2, vp.rate * S.rate));
    var gotBoundary = false, fallbackTick = 0;
    u.onboundary = function (e) {
      if (e.name && e.name !== 'word') return;
      gotBoundary = true; clearInterval(fallbackTick);
      var ci = e.charIndex, lo = 0, hi = starts.length - 1;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (starts[mid] <= ci) lo = mid; else hi = mid - 1; }
      highlight(lo);
    };
    u.onstart = function () {
      // Sebagian perangkat tidak mengirim batas kata: sorot dengan perkiraan waktu.
      var per = 60000 / (165 * u.rate), i = 0;
      fallbackTick = setInterval(function () { if (gotBoundary) return clearInterval(fallbackTick); if (i < words.length) highlight(i++); }, per);
    };
    u.onend = function () { clearInterval(fallbackTick); if (utter !== u) return; utter = null; clearHighlight(); timer = setTimeout(nextAuto, D.picture ? 900 : 450); };
    u.onerror = function (e) { clearInterval(fallbackTick); if (utter !== u) return; utter = null; if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; silentPage(); };
    utter = u;
    // Chrome menghentikan ucapan panjang setelah ±15 detik tanpa jeda; pause/resume menjaga tetap berjalan.
    synth.speak(u);
    keepAlive(u);
  }
  function keepAlive(u) {
    if (!/Chrome/.test(navigator.userAgent) || /Android/.test(navigator.userAgent)) return;
    var k = setInterval(function () { if (utter !== u || !synth.speaking) return clearInterval(k); synth.pause(); synth.resume(); }, 12000);
  }
  function silentPage() {
    // Baca sendiri: ±180 kata per menit (anak: 110), dikali kecepatan; sorot kata berjalan pelan sebagai penanda.
    var wpm = (S.voice === 'child' || D.picture ? 110 : 180) * S.rate, per = 60000 / wpm, i = 0;
    (function step() {
      if (!playing) return;
      if (i < words.length) { highlight(i++); timer = setTimeout(step, per); }
      else { clearHighlight(); timer = setTimeout(nextAuto, 700); }
    })();
  }
  function nextAuto() { if (!playing) return; if (idx + 1 < pages.length) go(idx + 1, 1); else endOfChapter(); }
  function endOfChapter() {
    var last = (D.chapters || []).indexOf(D.ch) === (D.chapters || []).length - 1;
    if (last || !D.next) {
      setPlaying(false);
      pageEl.innerHTML = '<div class="done"><p style="font-size:56px;margin:0">🎉</p><h2>' + esc(T.bookDone || 'Selesai') + '</h2><p><a class="btn btn-primary" href="' + esc(D.book) + '">←</a></p></div>';
      save('jen:pos:' + D.id, { ch: D.ch, p: 0, at: Date.now(), done: true });
      return;
    }
    if (playing && S.until === 'book') {
      save('jen:autoplay', { id: D.id, at: Date.now() });
      toast(T.chapterDone || '✓', 1400);
      setTimeout(function () { location.href = D.next; }, 1200);
      return;
    }
    setPlaying(false);
    pageEl.innerHTML = '<div class="done"><p style="font-size:56px;margin:0">✅</p><h2>' + esc(T.chapterDone || '✓') + '</h2><p><a class="btn btn-primary" href="' + esc(D.next) + '" data-r-nextch>' + esc(T.next || '→') + ' →</a></p></div>';
    var a = pageEl.querySelector('[data-r-nextch]');
    if (a) a.addEventListener('click', function () { save('jen:autoplay', { id: D.id, at: Date.now() }); });
  }
  function setPlaying(on) {
    playing = on;
    playBtn.classList.toggle('playing', on);
    playIc.textContent = on ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', on ? (T.pause || 'Pause') : (T.play || 'Play'));
    if (!on) stopVoice();
    if (on && D.picture) root.classList.add('slides');
  }
  function restartPage() { if (playing) speakPage(); }
  playBtn.addEventListener('click', function () {
    if (playing) { setPlaying(false); return; }
    if (S.mode === 'listen' && synth && voices.length && !pickVoice()) { toast(T.noVoice, 4200); }
    setPlaying(true);
    if (idx >= pages.length) idx = 0;
    speakPage();
  });
  $('[data-r-prev]').addEventListener('click', function () { go(idx - 1, -1); });
  $('[data-r-next]').addEventListener('click', function () { go(idx + 1, 1); });

  /* ── keyboard & sentuh ── */
  document.addEventListener('keydown', function (e) {
    if (!panel.hidden && e.key === 'Escape') { openPanel(false); return; }
    var tag = (e.target && e.target.tagName) || '';
    if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); playBtn.click(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1, 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1, -1); }
    else if (e.key === 'f' && D.picture) root.classList.toggle('slides');
  });
  var sx = 0, sy = 0;
  pageEl.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  pageEl.addEventListener('touchend', function (e) {
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing && S.mode === 'silent') setPlaying(false); });
  window.addEventListener('pagehide', function () { if (synth) synth.cancel(); });

  /* ── muat bab ── */
  function fail() {
    pageEl.innerHTML = '<p>' + esc(T.loadErr || 'Error') + '</p><p><button class="btn btn-ghost" type="button" data-r-retry>↻</button></p>';
    pageEl.querySelector('[data-r-retry]').addEventListener('click', start);
  }
  function start() {
    fetch('/api/book/' + encodeURIComponent(D.id) + '/ch/' + D.ch, { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (j) {
        pages = j.pages && j.pages.length ? j.pages : [[]];
        var pos = load('jen:pos:' + D.id, null);
        idx = 0;
        if (location.hash === '#akhir') idx = pages.length - 1;
        else if (pos && pos.ch === D.ch && !pos.done && pos.p > 0 && pos.p < pages.length) {
          idx = pos.p;
          toast((T.resume || '') + ' ' + (idx + 1), 2200);
        }
        renderPage();
        root.setAttribute('data-ready', '1');
        var ap = load('jen:autoplay', null);
        autostart = !!(ap && ap.id === D.id && Date.now() - ap.at < 60000);
        if (autostart) {
          save('jen:autoplay', null);
          setPlaying(true);
          // Peramban bisa menolak suara tanpa sentuhan; mode baca sendiri tetap berjalan.
          setTimeout(speakPage, 300);
        }
      })
      .catch(fail);
  }
  applySettings();
  start();
})();
