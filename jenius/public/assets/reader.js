/* jenius.es — pembaca AUTO (docs/JENIUS-BLUEPRINT.md §0.3).
 * Tekan Putar sekali: suara sintetis perangkat membacakan halaman kalimat demi kalimat, kata yang diucapkan disorot,
 * lembar buku membalik sendiri (animasi 3D berporos di punggung buku), dan pembacaan berlanjut ke bab berikutnya di
 * halaman yang sama sampai akhir bab atau akhir buku. Buku bergambar: mode slide layar penuh.
 * Tanpa iklan, tanpa pelacak. Posisi baca disimpan di perangkat (localStorage jen:pos:{id}). */
(function () {
  'use strict';
  var root = document.querySelector('[data-reader]');
  var dataEl = document.getElementById('reader-data');
  if (!root || !dataEl) return;
  var D = JSON.parse(dataEl.textContent || '{}');
  var T = D.i18n || {};
  var $ = function (s) { return root.querySelector(s); };
  var pageEl = $('[data-r-page]'), stage = pageEl.parentElement, playBtn = $('[data-r-play]'), playIc = $('[data-r-play-ic]'), countEl = $('[data-r-count]'), barEl = $('[data-r-bar]');
  var rateSel = $('[data-r-rate]'), panel = $('[data-r-panel]'), voiceSel = $('[data-r-voice]'), untilSel = $('[data-r-until]'), modeSel = $('[data-r-mode]');
  var sizeIn = $('[data-r-size]'), dysIn = $('[data-r-dys]'), nightIn = $('[data-r-night]'), contrastIn = $('[data-r-contrast]'), settingsBtn = $('[data-r-settings]');
  var chTitleEl = root.querySelector('.r-title small');
  var synth = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EN_UI = location.pathname.indexOf('/en/') === 0;

  /* ── penyimpanan aman (bisa gagal di mode privat) ── */
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }

  var S = Object.assign({ rate: 1, voice: D.voice || 'narrator', until: 'book', mode: 'listen', size: 21, dys: false, night: false, contrast: false }, load('jen:reader', {}));
  var pages = [], idx = 0, playing = false, timer = 0, words = [], wordAt = 0, busy = false, session = 0;

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

  /* ── suara ─────────────────────────────────────────────────────────────────────────────────────────────────
   * Hal-hal yang membuat suara „tidak keluar“ di peramban dan cara menanganinya:
   *  - iOS/Safari & Chrome hanya mengizinkan suara setelah sentuhan: saat tombol Putar ditekan, ucapan senyap
   *    diputar di dalam sentuhan itu untuk membuka suara; pindah bab terjadi di halaman yang sama (tanpa memuat ulang).
   *  - Chrome kadang membuang speak() yang dipanggil tepat setelah cancel(): diberi jeda singkat.
   *  - Ucapan panjang sering berhenti diam-diam (Chrome desktop ±15 detik, Android): dibacakan per kalimat.
   *  - Suara jaringan bisa gagal: bila ucapan tidak mulai dalam 2,5 detik, dicoba sekali lagi dengan suara bawaan
   *    bahasa itu; bila tetap tidak mulai, pembaca beralih ke mode baca sendiri dan memberi tahu pembaca. */
  var voices = [];
  function listVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) { listVoices(); if (synth.addEventListener) synth.addEventListener('voiceschanged', listVoices); else synth.onvoiceschanged = listVoices; }
  var FEMALE = /female|woman|wanita|perempuan|gadis|damayanti|zira|samantha|karen|moira|tessa|serena|victoria|fiona|susan|hazel|aria|jenny|libby|sonia|natasha|ava|allison|kathy|siti/i;
  var MALE = /\bmale\b|\bman\b|pria|laki|david|mark|daniel|alex|fred|tom|george|ryan|guy|thomas|aaron|arthur|oliver|james|rizwan|ardi\b|andika/i;
  var langFull = (D.lang || 'id').toLowerCase().replace('_', '-'), langBase = langFull.split('-')[0];
  var fallbackLang = langBase === 'en' ? 'en-US' : langBase === 'id' ? 'id-ID' : langFull;
  var useDefaultVoice = false;
  function pickVoice() {
    if (useDefaultVoice) return null;
    var norm = function (v) { return (v.lang || '').toLowerCase().replace('_', '-'); };
    var pool = voices.filter(function (v) { return norm(v).split('-')[0] === langBase; })
      .sort(function (a, b) { return (Number(norm(b) === langFull) - Number(norm(a) === langFull)) || (Number(!!b.localService) - Number(!!a.localService)); });
    if (!pool.length) return null;
    var best = null;
    if (S.voice === 'teacher-m') best = pool.find(function (v) { return MALE.test(v.name) && !/female/i.test(v.name); });
    else if (S.voice === 'teacher-f' || S.voice === 'child') best = pool.find(function (v) { return FEMALE.test(v.name); });
    return best || pool[0];
  }
  function voiceParams() {
    switch (S.voice) {
      case 'child': return { pitch: 1.3, rate: 0.95 };
      case 'teacher-f': return { pitch: 1.08, rate: 0.95 };
      case 'teacher-m': return { pitch: 0.92, rate: 0.95 };
      default: return { pitch: 1, rate: 1 };
    }
  }
  function unlockVoice() {
    if (!synth) return;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.lang = fallbackLang;
      synth.speak(u);
    } catch (e) { /* abaikan */ }
  }
  /** Kalimat-kalimat halaman: [{ text, from }] — `from` = indeks kata pertama. */
  function sentences() {
    var out = [], cur = [], from = 0;
    words.forEach(function (w, i) {
      var t = w.textContent;
      cur.push(t);
      var end = /[.!?…;:]["”’)\]]*$/.test(t) || cur.length >= 28 || i === words.length - 1 || w.nextElementSibling === null && w.parentElement !== (words[i + 1] || {}).parentElement;
      if (end) { out.push({ text: cur.join(' '), from: from }); from = i + 1; cur = []; }
    });
    return out;
  }
  function stopVoice() {
    session++;
    clearTimeout(timer); timer = 0;
    if (synth) synth.cancel();
    clearHighlight();
  }
  function speakPage() {
    stopVoice();
    if (!playing) return;
    if (!words.length) { timer = setTimeout(nextAuto, D.picture ? 2500 : 1200); return; }
    if (S.mode === 'silent' || !synth) return silentPage(0);
    var my = session, list = sentences(), k = 0, retried = false;
    // Lanjut dari kata yang terakhir disorot (setelah jeda atau ganti kecepatan).
    if (wordAt > 0) { while (k < list.length - 1 && list[k + 1].from <= wordAt) k++; }
    function sayNext() {
      if (my !== session || !playing) return;
      if (k >= list.length) { clearHighlight(); timer = setTimeout(nextAuto, D.picture ? 900 : 450); return; }
      var s = list[k], started = false;
      var u = new SpeechSynthesisUtterance(s.text);
      var v = pickVoice();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = fallbackLang;
      var vp = voiceParams(); u.pitch = vp.pitch; u.rate = Math.max(0.5, Math.min(2, vp.rate * S.rate));
      var gotBoundary = false, tick = 0, starts = [], acc = 0;
      s.text.split(' ').forEach(function (w) { starts.push(acc); acc += w.length + 1; });
      u.onstart = function () {
        if (my !== session) return;
        started = true; root.classList.remove('voice-off');
        highlight(s.from);
        // Sebagian perangkat tidak mengirim batas kata: sorot dengan perkiraan waktu.
        var per = 60000 / (165 * u.rate), i = 0;
        tick = setInterval(function () { if (gotBoundary || my !== session) return clearInterval(tick); if (i < starts.length) highlight(s.from + i++); }, per);
      };
      u.onboundary = function (e) {
        if (my !== session || (e.name && e.name !== 'word')) return;
        gotBoundary = true; clearInterval(tick);
        var ci = e.charIndex, lo = 0, hi = starts.length - 1;
        while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (starts[mid] <= ci) lo = mid; else hi = mid - 1; }
        highlight(s.from + lo);
      };
      u.onend = function () { clearInterval(tick); if (my !== session) return; k++; sayNext(); };
      u.onerror = function (e) {
        clearInterval(tick);
        if (my !== session) return;
        var err = e && e.error;
        if (err === 'interrupted' || err === 'canceled') return;
        if (err === 'not-allowed') { needTap(); return; }
        k++; sayNext();
      };
      // Jaga referensi agar ucapan tidak dibuang pengumpul sampah sebelum selesai.
      sayNext.u = u;
      timer = setTimeout(function () {
        if (my !== session) return;
        synth.speak(u);
        timer = setTimeout(function () {
          if (my !== session || started || synth.speaking) return;
          // Tidak mulai: coba sekali lagi dengan suara bawaan bahasa itu.
          if (!retried) { retried = true; useDefaultVoice = true; synth.cancel(); sayNext(); return; }
          voiceFailed();
        }, 2500);
      }, 70);
    }
    sayNext();
  }
  function needTap() {
    setPlaying(false);
    root.classList.add('voice-off');
    toast(T.tapVoice || '▶', 4500);
  }
  function voiceFailed() {
    root.classList.add('voice-off');
    toast(T.voiceFail || T.noVoice || '…', 5000);
    S.mode = 'silent'; modeSel.value = 'silent';
    silentPage(Math.max(0, wordAt));
  }
  function silentPage(from) {
    // Baca sendiri: ±180 kata per menit (anak: 110), dikali kecepatan; sorot kata berjalan pelan sebagai penanda.
    var my = session, wpm = (S.voice === 'child' || D.picture ? 110 : 180) * S.rate, per = 60000 / wpm, i = from || 0;
    (function step() {
      if (!playing || my !== session) return;
      if (i < words.length) { highlight(i++); timer = setTimeout(step, per); }
      else { clearHighlight(); timer = setTimeout(nextAuto, 700); }
    })();
  }

  /* ── tampilan halaman ── */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function wrapWords(text) {
    return esc(text).split(/(\s+)/).map(function (part) { return /\S/.test(part) ? '<span class="w">' + part + '</span>' : part; }).join('');
  }
  function pageHtml(i) {
    var out = (pages[i] || []).map(function (b) {
      if (b.t === 'h') return '<h2>' + wrapWords(b.text) + '</h2>';
      if (b.t === 'verse') return '<p class="verse">' + wrapWords(b.text) + '</p>';
      if (b.t === 'img') return '<figure class="r-img"><img src="' + esc(b.src) + '" alt="' + esc(b.alt || '') + '" loading="eager" decoding="async"></figure>' + (b.text ? '<p>' + wrapWords(b.text) + '</p>' : '');
      return '<p>' + wrapWords(b.text) + '</p>';
    }).join('');
    return (out || '<p class="muted">…</p>') + '<div class="r-folio" aria-hidden="true">' + (i + 1) + '</div>';
  }
  function renderPage() {
    pageEl.innerHTML = pageHtml(idx);
    pageEl.scrollTop = 0;
    words = Array.prototype.slice.call(pageEl.querySelectorAll('.w'));
    wordAt = 0;
    countEl.textContent = (T.page || 'Hlm') + ' ' + (idx + 1) + ' ' + (T.of || '/') + ' ' + pages.length;
    var chs = D.chapters || [D.ch], pos = chs.indexOf(D.ch);
    var frac = chs.length > 1 ? (pos + (idx + 1) / Math.max(1, pages.length)) / chs.length : (idx + 1) / Math.max(1, pages.length);
    barEl.style.width = Math.min(100, Math.round(frac * 1000) / 10) + '%';
    save('jen:pos:' + D.id, { ch: D.ch, p: idx, at: Date.now(), href: chapterPath(D.ch) });
    preload(idx + 1);
  }
  function preload(i) {
    (pages[i] || []).forEach(function (b) { if (b.t === 'img') { var im = new Image(); im.src = b.src; } });
  }

  /* ── lembar membalik (3D, berporos di punggung buku) ── */
  function leafAt(html) {
    var r = pageEl.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    var leaf = document.createElement('div');
    leaf.className = 'r-leaf';
    leaf.style.cssText = 'left:' + (r.left - sr.left) + 'px;top:' + (r.top - sr.top) + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    var front = pageEl.cloneNode(false);
    front.removeAttribute('data-r-page'); front.removeAttribute('aria-live'); front.removeAttribute('id');
    front.className = 'r-page r-leaf-front';
    front.innerHTML = html;
    var back = document.createElement('div');
    back.className = 'r-leaf-back';
    leaf.appendChild(front); leaf.appendChild(back);
    stage.appendChild(leaf);
    return { leaf: leaf, front: front };
  }
  function flip(dir, apply, done) {
    if (reduce) { apply(); done(); return; }
    var oldHtml = pageEl.innerHTML, oldTop = pageEl.scrollTop;
    if (dir > 0) {
      // Maju: lembar yang sedang dibaca terangkat dan terbalik ke kiri, halaman baru tampak di bawahnya.
      var l = leafAt(oldHtml); l.front.scrollTop = oldTop;
      apply();
      pageEl.classList.add('r-under');
      requestAnimationFrame(function () { l.leaf.classList.add('fwd'); });
      setTimeout(function () { l.leaf.remove(); pageEl.classList.remove('r-under'); done(); }, 880);
    } else {
      // Mundur: lembar sebelumnya datang dari kiri dan menutup halaman ini.
      apply();
      var newHtml = pageEl.innerHTML;
      pageEl.innerHTML = oldHtml; pageEl.scrollTop = oldTop;
      var b = leafAt(newHtml);
      b.leaf.classList.add('from-left');
      requestAnimationFrame(function () { requestAnimationFrame(function () { b.leaf.classList.add('back'); }); });
      setTimeout(function () { pageEl.innerHTML = newHtml; words = Array.prototype.slice.call(pageEl.querySelectorAll('.w')); b.leaf.remove(); done(); }, 780);
    }
  }
  var pending = null;
  /** Selesai membalik: jalankan tekanan tombol yang datang selama animasi, atau lanjutkan membaca. */
  function settle(wasPlaying) {
    busy = false;
    if (pending) { var p = pending; pending = null; go(idx + p, p); return; }
    if (wasPlaying && playing) speakPage();
  }
  function go(to, dir) {
    if (busy) { pending = (dir || 1) > 0 ? 1 : -1; return; }
    if (to < 0) { changeChapter(-1, true); return; }
    if (to >= pages.length) { endOfChapter(); return; }
    busy = true;
    var wasPlaying = playing;
    stopVoice();
    flip(dir || 1, function () { idx = to; renderPage(); }, function () { settle(wasPlaying); });
  }
  function toast(msg, ms) {
    var t = document.createElement('div'); t.className = 'r-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, ms || 2600);
  }

  /* ── sorot kata ── */
  function highlight(i) {
    if (words[wordAt]) words[wordAt].classList.remove('on');
    wordAt = i;
    var w = words[i]; if (!w) return;
    w.classList.add('on');
    var r = w.getBoundingClientRect(), pr = pageEl.getBoundingClientRect();
    if (r.bottom > pr.bottom - 24 || r.top < pr.top) pageEl.scrollTop += r.top - pr.top - pr.height / 3;
  }
  function clearHighlight() { words.forEach(function (w) { w.classList.remove('on'); }); }

  /* ── bab: berganti di halaman yang sama ── */
  function chapterPath(n) { return (EN_UI ? '/en/read/' : '/baca/') + encodeURIComponent(String(D.id)) + '/' + Math.floor(Number(n)); }
  function bookHref() { return (EN_UI ? '/en/book/' : '/buku/') + encodeURIComponent(String(D.id)); }
  function chapterAt(step) { var chs = D.chapters || [], i = chs.indexOf(D.ch) + step; return i >= 0 && i < chs.length ? chs[i] : null; }
  function fetchChapter(n) {
    return fetch('/api/book/' + encodeURIComponent(String(D.id)) + '/ch/' + Math.floor(Number(n)), { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); });
  }
  function useChapter(n, j, at) {
    D.ch = n;
    pages = j.pages && j.pages.length ? j.pages : [[]];
    idx = at === 'end' ? pages.length - 1 : Math.max(0, Math.min(pages.length - 1, at || 0));
    if (chTitleEl && j.title) chTitleEl.textContent = j.title;
    try { history.replaceState(null, '', chapterPath(n)); } catch (e) { /* abaikan */ }
    Array.prototype.forEach.call(root.querySelectorAll('.r-chapters a'), function (a) {
      if (a.getAttribute('href') === chapterPath(n)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function changeChapter(step, toEnd) {
    var n = chapterAt(step);
    if (n == null || busy) return;
    busy = true;
    var wasPlaying = playing;
    stopVoice();
    fetchChapter(n).then(function (j) {
      flip(step, function () { useChapter(n, j, toEnd ? 'end' : 0); renderPage(); }, function () { settle(wasPlaying); });
    }).catch(function () { busy = false; toast(T.loadErr || 'Error', 3500); });
  }
  function nextAuto() { if (!playing) return; if (idx + 1 < pages.length) go(idx + 1, 1); else endOfChapter(); }
  function endOfChapter() {
    var n = chapterAt(1);
    if (n == null) {
      setPlaying(false);
      donePanel('🎉', T.bookDone || '✓', T.backToBook || '←', function () { location.href = bookHref(); });
      save('jen:pos:' + D.id, { ch: D.ch, p: 0, at: Date.now(), done: true });
      return;
    }
    if (playing && S.until === 'book') {
      toast(T.chapterDone || '✓', 1400);
      changeChapter(1, false);
      return;
    }
    setPlaying(false);
    donePanel('✅', T.chapterDone || '✓', (T.next || '→') + ' →', function () {
      // Sentuhan ini juga membuka suara untuk bab berikutnya.
      unlockVoice();
      setPlaying(true);
      changeChapter(1, false);
    });
  }
  /** Panel akhir bab/buku, dibangun dengan DOM. */
  function donePanel(icon, title, label, onClick) {
    var box = document.createElement('div'), ic = document.createElement('p'), h = document.createElement('h2'), p = document.createElement('p'), b = document.createElement('button');
    box.className = 'done';
    ic.style.cssText = 'font-size:56px;margin:0'; ic.textContent = icon;
    h.textContent = title;
    b.className = 'btn btn-primary'; b.type = 'button'; b.textContent = label;
    b.addEventListener('click', onClick);
    p.appendChild(b); box.appendChild(ic); box.appendChild(h); box.appendChild(p);
    pageEl.replaceChildren(box);
    words = [];
    return b;
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
    // Di dalam sentuhan: buka suara dulu (iOS/Chrome menolak suara tanpa sentuhan).
    if (S.mode === 'listen') { unlockVoice(); useDefaultVoice = false; }
    if (S.mode === 'listen' && synth && voices.length && !voices.some(function (v) { return (v.lang || '').toLowerCase().indexOf(langBase) === 0; })) toast(T.noVoice, 4200);
    setPlaying(true);
    if (!words.length && idx >= pages.length - 1 && chapterAt(1) == null) { idx = 0; renderPage(); }
    speakPage();
  });
  $('[data-r-prev]').addEventListener('click', function () { go(idx - 1, -1); });
  $('[data-r-next]').addEventListener('click', function () { go(idx + 1, 1); });

  /* ── keyboard & sentuh ── */
  document.addEventListener('keydown', function (e) {
    if (!panel.hidden && e.key === 'Escape') { openPanel(false); return; }
    var tag = (e.target && e.target.tagName) || '';
    if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(tag) && e.key === ' ') return;
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

  /* ── muat bab pertama ── */
  function fail() {
    var msg = document.createElement('p'), wrap = document.createElement('p'), b = document.createElement('button');
    msg.textContent = T.loadErr || 'Error';
    b.className = 'btn btn-ghost'; b.type = 'button'; b.textContent = '↻';
    b.addEventListener('click', start);
    wrap.appendChild(b);
    pageEl.replaceChildren(msg, wrap);
  }
  function start() {
    fetchChapter(D.ch).then(function (j) {
      var pos = load('jen:pos:' + D.id, null), at = 0, resumed = false;
      if (location.hash === '#akhir') at = 'end';
      else if (pos && pos.ch === D.ch && !pos.done && pos.p > 0) { at = pos.p; resumed = true; }
      useChapter(D.ch, j, at);
      renderPage();
      if (resumed && idx > 0) toast((T.resume || '') + ' ' + (idx + 1), 2200);
      root.setAttribute('data-ready', '1');
      // Tautan lama „bab berikutnya“: tetap diputar (suara bisa menunggu sentuhan pertama).
      var ap = load('jen:autoplay', null);
      if (ap && ap.id === D.id && Date.now() - ap.at < 60000) {
        save('jen:autoplay', null);
        setPlaying(true);
        setTimeout(speakPage, 300);
      }
    }).catch(fail);
  }
  applySettings();
  start();
})();
