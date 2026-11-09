/* Vorlesen · Leer en voz alta · Listen — shared by every article site (docs/ADSENSE-BLUEPRINT.md §28).
 * Owner, 8 Nov 2026: „seluruh website artikel pakein voice, auto scroll, auto slide“.
 *  - Listen: the browser's own speech engine reads the article paragraph by paragraph in the page's language; the
 *    paragraph being read is highlighted and kept in view (auto scroll follows the voice).
 *  - Auto scroll: the page scrolls by itself at an adjustable speed, without voice; any wheel, touch or key stops it.
 *  - Slides: the article as full-screen slides, one section (h2) per slide, turning by themselves (with or without the
 *    voice); arrows, swipe, Space and Esc work.
 * No server, no cost, no tracking; nothing is shown to crawlers (the bar is built by this script), and everything
 * respects prefers-reduced-motion. The bar sits above the article text, never over an ad. */
(function () {
  'use strict';
  var mark = document.querySelector('[data-engine-reader]');
  if (!mark) return;
  var root = mark.parentElement;
  var lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
  var W = {
    de: { listen: 'Vorlesen', stop: 'Stopp', pause: 'Pause', resume: 'Weiter', scroll: 'Automatisch scrollen', slides: 'Als Folien', speed: 'Tempo', close: 'Schließen', prev: 'Zurück', next: 'Weiter', play: 'Abspielen', voice: 'Mit Stimme', bar: 'Artikel vorlesen und anzeigen', slide: 'Folie', of: 'von' },
    es: { listen: 'Escuchar', stop: 'Detener', pause: 'Pausa', resume: 'Seguir', scroll: 'Desplazamiento automático', slides: 'Ver en diapositivas', speed: 'Velocidad', close: 'Cerrar', prev: 'Anterior', next: 'Siguiente', play: 'Reproducir', voice: 'Con voz', bar: 'Escuchar y ver el artículo', slide: 'Diapositiva', of: 'de' },
    fr: { listen: 'Écouter', stop: 'Arrêter', pause: 'Pause', resume: 'Reprendre', scroll: 'Défilement automatique', slides: 'En diapositives', speed: 'Vitesse', close: 'Fermer', prev: 'Précédent', next: 'Suivant', play: 'Lecture', voice: 'Avec la voix', bar: "Écouter et afficher l'article", slide: 'Diapositive', of: 'sur' },
    en: { listen: 'Listen', stop: 'Stop', pause: 'Pause', resume: 'Resume', scroll: 'Auto scroll', slides: 'View as slides', speed: 'Speed', close: 'Close', prev: 'Previous', next: 'Next', play: 'Play', voice: 'With voice', bar: 'Listen to and view the article', slide: 'Slide', of: 'of' },
  };
  var T = W[lang] || W.en;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var synth = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  var S = Object.assign({ rate: 1, scroll: 40 }, load('engine-reader', {}));

  /* ── styles: neutral, inherit the theme's fonts and colours ── */
  var css = '.engine-reader{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 1.4em;padding:10px 12px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:14px;font-size:15px;line-height:1.2}' +
    '.engine-reader button,.engine-reader select{font:inherit;color:inherit;background:color-mix(in srgb,currentColor 6%,transparent);border:1px solid color-mix(in srgb,currentColor 22%,transparent);border-radius:999px;padding:7px 13px;cursor:pointer}' +
    '.engine-reader button[aria-pressed=true]{background:color-mix(in srgb,currentColor 18%,transparent);font-weight:700}' +
    '.engine-reader label{display:inline-flex;align-items:center;gap:6px;margin-left:auto}' +
    '.engine-speaking{background:color-mix(in srgb,#ffd84d 38%,transparent);box-shadow:0 0 0 6px color-mix(in srgb,#ffd84d 38%,transparent);border-radius:6px;transition:background .2s}' +
    '.engine-float{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147483000;font:600 15px system-ui,sans-serif;background:#111;color:#fff;border:0;border-radius:999px;padding:11px 18px;box-shadow:0 10px 28px rgba(0,0,0,.3);cursor:pointer}' +
    '.engine-slides{position:fixed;inset:0;z-index:2147483001;display:flex;flex-direction:column;background:var(--engine-slide-bg,#fff);color:var(--engine-slide-ink,#111)}' +
    '.engine-slides__bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(0,0,0,.1);font:600 15px system-ui,sans-serif}' +
    '.engine-slides__bar span{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
    '.engine-slides button{font:600 15px system-ui,sans-serif;background:#f1f1f1;color:#111;border:0;border-radius:999px;padding:9px 15px;cursor:pointer}' +
    '.engine-slides button[aria-pressed=true]{background:#111;color:#fff}' +
    '.engine-slides__stage{flex:1;overflow:hidden;display:grid;place-items:center;padding:18px;perspective:1400px}' +
    '.engine-slides__card{width:min(860px,100%);max-height:100%;overflow-y:auto;overscroll-behavior:contain;padding:clamp(18px,4vw,48px);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.14);background:#fff;color:#111;font-size:clamp(18px,2.1vw,22px);line-height:1.65}' +
    '.engine-slides__card h2{margin-top:0;font-size:1.5em;line-height:1.2}.engine-slides__card img{max-width:100%;height:auto}' +
    '.engine-slides__card table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse;font-size:.85em}.engine-slides__card td,.engine-slides__card th{padding:6px 8px;border-bottom:1px solid rgba(0,0,0,.1);vertical-align:top}' +
    '@media (max-width:640px){.engine-slides__bar:first-child span{display:none}.engine-slides__bar:first-child{justify-content:flex-end;flex-wrap:wrap}.engine-slides button{padding:8px 12px;font-size:14px}.engine-slides__stage{padding:10px}.engine-slides__card{font-size:17px}}' +
    '.engine-slides__card.in{animation:engine-in .45s ease both}@keyframes engine-in{from{opacity:0;transform:translateX(40px) rotateY(-12deg)}to{opacity:1;transform:none}}' +
    '.engine-slides__dots{display:flex;justify-content:center;gap:6px;padding:10px;flex-wrap:wrap}.engine-slides__dots i{width:8px;height:8px;border-radius:50%;background:rgba(0,0,0,.18)}.engine-slides__dots i.on{background:#111}' +
    '.engine-slides__progress{height:4px;background:rgba(0,0,0,.08)}.engine-slides__progress i{display:block;height:100%;width:0;background:#111}' +
    '@media (prefers-reduced-motion:reduce){.engine-slides__card.in{animation:none}.engine-speaking{transition:none}}' +
    '@media print{.engine-reader,.engine-float{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ── the bar ── */
  var bar = document.createElement('div');
  bar.className = 'engine-reader';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', T.bar);
  function btn(label, icon) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.innerHTML = '<span aria-hidden="true">' + icon + '</span> ' + label; return b; }
  var bListen = btn(T.listen, '🔊'), bScroll = btn(T.scroll, '⇣'), bSlides = btn(T.slides, '▶');
  var speed = document.createElement('label');
  speed.innerHTML = '<span>' + T.speed + '</span>';
  var sel = document.createElement('select');
  [0.75, 0.9, 1, 1.15, 1.3, 1.5].forEach(function (r) { var o = document.createElement('option'); o.value = String(r); o.textContent = r + '×'; if (r === S.rate) o.selected = true; sel.appendChild(o); });
  speed.appendChild(sel);
  if (synth) bar.appendChild(bListen);
  bar.appendChild(bScroll);
  bar.appendChild(bSlides);
  bar.appendChild(speed);
  mark.replaceWith(bar);
  sel.addEventListener('change', function () { S.rate = Number(sel.value); save('engine-reader', S); });

  /* ── the readable blocks of the article ── */
  function blocks(scope) {
    return Array.prototype.slice.call((scope || root).querySelectorAll('h2,h3,h4,p,li,blockquote,figcaption,td,dd,dt'))
      .filter(function (el) {
        if (el.closest('.engine-reader,nav,aside,.toc,[aria-hidden=true],script,style,ins')) return false;
        if (el.tagName !== 'LI' && el.closest('li')) return false; // a <p> inside a list item is read with the item
        if (el.tagName === 'P' && el.closest('blockquote')) return false;
        return /\S/.test(el.textContent || '');
      });
  }
  function voiceFor() {
    var vs = synth.getVoices().filter(function (v) { return (v.lang || '').toLowerCase().slice(0, 2) === lang; });
    var full = (document.documentElement.lang || '').toLowerCase();
    return vs.find(function (v) { return v.lang.toLowerCase() === full; }) || vs.find(function (v) { return v.localService; }) || vs[0] || null;
  }
  function say(text, done) {
    var u = new SpeechSynthesisUtterance(text), v = voiceFor();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = document.documentElement.lang || lang;
    u.rate = S.rate;
    u.onend = function () { done(); };
    u.onerror = function (e) { if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; done(); };
    synth.speak(u);
    // Chrome on desktop stops long speech after ~15 s; a pause/resume keeps it going.
    if (/Chrome/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent)) {
      var k = setInterval(function () { if (!synth.speaking) return clearInterval(k); synth.pause(); synth.resume(); }, 12000);
    }
  }
  function into(el) { el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); }

  /* ── listen ── */
  var reading = false, list = [], at = 0, floatBtn = null;
  function clearMarks() { list.forEach(function (el) { el.classList.remove('engine-speaking'); }); }
  function stopListen() {
    if (!reading) return;
    reading = false; synth.cancel(); clearMarks();
    bListen.setAttribute('aria-pressed', 'false');
    if (floatBtn) { floatBtn.remove(); floatBtn = null; }
  }
  function nextBlock() {
    if (!reading) return;
    clearMarks();
    if (at >= list.length) { stopListen(); return; }
    var el = list[at++];
    el.classList.add('engine-speaking');
    into(el);
    say((el.textContent || '').replace(/\s+/g, ' ').trim(), nextBlock);
  }
  bListen.addEventListener('click', function () {
    if (reading) { stopListen(); return; }
    stopScroll();
    list = blocks();
    // Start at the first block in view, so a reader halfway down hears what is in front of them.
    at = 0;
    for (var i = 0; i < list.length; i++) { if (list[i].getBoundingClientRect().bottom > 60) { at = i; break; } }
    reading = true;
    bListen.setAttribute('aria-pressed', 'true');
    // The bar scrolls away with the page: a floating Stop stays in reach.
    floatBtn = document.createElement('button');
    floatBtn.type = 'button'; floatBtn.className = 'engine-float'; floatBtn.textContent = '■ ' + T.stop;
    floatBtn.addEventListener('click', stopListen);
    document.body.appendChild(floatBtn);
    synth.cancel();
    nextBlock();
  });

  /* ── auto scroll ── */
  var scrolling = false, raf = 0, last = 0, acc = 0, scrollFloat = null;
  function stopScroll() {
    if (!scrolling) return;
    scrolling = false; cancelAnimationFrame(raf);
    bScroll.setAttribute('aria-pressed', 'false');
    if (scrollFloat) { scrollFloat.remove(); scrollFloat = null; }
  }
  function tick(t) {
    if (!scrolling) return;
    if (last) {
      acc += ((t - last) / 1000) * S.scroll * S.rate;
      var px = Math.floor(acc);
      if (px >= 1) { acc -= px; window.scrollBy(0, px); }
      var end = root.getBoundingClientRect().bottom < window.innerHeight * 0.6 || window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (end) { stopScroll(); return; }
    }
    last = t;
    raf = requestAnimationFrame(tick);
  }
  bScroll.addEventListener('click', function () {
    if (scrolling) { stopScroll(); return; }
    stopListen();
    scrolling = true; last = 0; acc = 0;
    bScroll.setAttribute('aria-pressed', 'true');
    scrollFloat = document.createElement('button');
    scrollFloat.type = 'button'; scrollFloat.className = 'engine-float'; scrollFloat.textContent = '■ ' + T.stop;
    scrollFloat.addEventListener('click', stopScroll);
    document.body.appendChild(scrollFloat);
    raf = requestAnimationFrame(tick);
  });
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function (e) { if (scrolling && !(e.target && e.target.closest && e.target.closest('.engine-float'))) stopScroll(); }, { passive: true });
  });

  /* ── slides ── */
  function sections() {
    var out = [], cur = null;
    var h1 = document.querySelector('h1');
    Array.prototype.slice.call(root.children).forEach(function (el) {
      if (el === bar || el.matches('nav,aside,script,style,ins,.toc') || el.querySelector('ins.adsbygoogle')) return;
      if (el.tagName === 'H2' || !cur) {
        cur = { title: el.tagName === 'H2' ? el.textContent : (h1 ? h1.textContent : document.title), nodes: [] };
        out.push(cur);
      }
      cur.nodes.push(el);
    });
    return out.filter(function (s) { return s.nodes.some(function (n) { return /\S/.test(n.textContent || '') || n.querySelector('img'); }); });
  }
  bSlides.addEventListener('click', function () {
    stopListen(); stopScroll();
    var secs = sections();
    if (!secs.length) return;
    var idx = 0, playing = false, withVoice = false, timer = 0, startedAt = 0, dur = 0, speakList = [], speakAt = 0;
    var box = document.createElement('div');
    box.className = 'engine-slides'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', T.slides);
    var title = (document.querySelector('h1') || {}).textContent || document.title;
    box.innerHTML = '<div class="engine-slides__bar"><span></span><button type="button" data-k="play" aria-pressed="false">▶ ' + T.play + '</button>' +
      (synth ? '<button type="button" data-k="voice" aria-pressed="false">🔊 ' + T.voice + '</button>' : '') +
      '<button type="button" data-k="close">✕ ' + T.close + '</button></div><div class="engine-slides__progress"><i></i></div>' +
      '<div class="engine-slides__stage"><div class="engine-slides__card" tabindex="-1"></div></div>' +
      '<div class="engine-slides__bar"><button type="button" data-k="prev">← ' + T.prev + '</button><span class="engine-slides__count" style="text-align:center"></span><button type="button" data-k="next">' + T.next + ' →</button></div>' +
      '<div class="engine-slides__dots" aria-hidden="true"></div>';
    box.querySelector('span').textContent = title;
    var card = box.querySelector('.engine-slides__card'), prog = box.querySelector('.engine-slides__progress i'), count = box.querySelector('.engine-slides__count'), dots = box.querySelector('.engine-slides__dots');
    var bPlay = box.querySelector('[data-k=play]'), bVoice = box.querySelector('[data-k=voice]');
    dots.innerHTML = secs.map(function () { return '<i></i>'; }).join('');
    document.body.appendChild(box);
    var prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    function words(s) { return s.nodes.reduce(function (n, el) { return n + ((el.textContent || '').match(/\S+/g) || []).length; }, 0); }
    function show(i) {
      idx = Math.max(0, Math.min(secs.length - 1, i));
      clearTimeout(timer); if (synth) synth.cancel();
      card.innerHTML = '';
      secs[idx].nodes.forEach(function (n) { var c = n.cloneNode(true); c.removeAttribute && c.removeAttribute('id'); card.appendChild(c); });
      card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
      card.scrollTop = 0;
      count.textContent = T.slide + ' ' + (idx + 1) + ' ' + T.of + ' ' + secs.length;
      Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === idx); });
      prog.style.width = ((idx + 1) / secs.length * 100) + '%';
      if (playing) run();
    }
    function advance() { if (!playing) return; if (idx < secs.length - 1) show(idx + 1); else setPlay(false); }
    function run() {
      clearTimeout(timer);
      if (withVoice && synth) {
        speakList = blocks(card); speakAt = 0;
        (function go() {
          if (!playing || !withVoice) return;
          speakList.forEach(function (el) { el.classList.remove('engine-speaking'); });
          if (speakAt >= speakList.length) { timer = setTimeout(advance, 700); return; }
          var el = speakList[speakAt++];
          el.classList.add('engine-speaking');
          var r = el.getBoundingClientRect(), cr = card.getBoundingClientRect();
          if (r.bottom > cr.bottom || r.top < cr.top) card.scrollTop += r.top - cr.top - 40;
          say((el.textContent || '').replace(/\s+/g, ' ').trim(), go);
        })();
      } else {
        // Silent: time on the slide follows its length (about 200 words a minute at 1×), at least six seconds.
        dur = Math.max(6000, words(secs[idx]) / (200 * S.rate) * 60000);
        startedAt = Date.now();
        var scrollable = card.scrollHeight - card.clientHeight;
        (function glide() {
          if (!playing || withVoice) return;
          var f = Math.min(1, (Date.now() - startedAt) / dur);
          if (scrollable > 0) card.scrollTop = scrollable * Math.max(0, (f - 0.15) / 0.8);
          if (f >= 1) { advance(); return; }
          timer = setTimeout(glide, 120);
        })();
      }
    }
    function setPlay(on) {
      playing = on;
      bPlay.setAttribute('aria-pressed', on ? 'true' : 'false');
      bPlay.textContent = on ? '❚❚ ' + T.pause : '▶ ' + T.play;
      clearTimeout(timer); if (synth) synth.cancel();
      if (on) run();
    }
    function close() {
      playing = false; clearTimeout(timer); if (synth) synth.cancel();
      box.remove(); document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      bSlides.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); show(idx + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(idx - 1); }
      else if (e.key === ' ' && !(e.target && /BUTTON|SELECT/.test(e.target.tagName))) { e.preventDefault(); setPlay(!playing); }
    }
    document.addEventListener('keydown', onKey);
    box.addEventListener('click', function (e) {
      var k = e.target && e.target.closest && e.target.closest('[data-k]');
      if (!k) return;
      var w = k.getAttribute('data-k');
      if (w === 'close') close();
      else if (w === 'prev') show(idx - 1);
      else if (w === 'next') show(idx + 1);
      else if (w === 'play') setPlay(!playing);
      else if (w === 'voice') { withVoice = !withVoice; bVoice.setAttribute('aria-pressed', withVoice ? 'true' : 'false'); if (!playing) setPlay(true); else run(); }
    });
    var sx = 0, sy = 0;
    card.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    card.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    show(0);
    setPlay(true);
    bPlay.focus();
  });
  window.addEventListener('pagehide', function () { if (synth) synth.cancel(); });
})();
