/* Vorlesen · Leer en voz alta · Listen — shared by every article site (docs/ADSENSE-BLUEPRINT.md §28–29).
 * Owner, 8 Nov 2026: „seluruh website artikel pakein voice, auto scroll, auto slide“; 9 Nov 2026: „pakein voice biar di
 * bacain setiap artikelnya sampai tuntas, auto pindah, auto scroll, suara mengikuti lagam bahasa masing2“.
 *  - Listen: the browser's own speech engine reads the whole article — headline, then every paragraph, list, table and
 *    the sources — sentence by sentence (one long utterance stops silently on Chrome), in a voice of the page's own
 *    language and region (de-DE, es-ES, es-419, en-GB …), natural voices first; the visitor may pick another voice of
 *    that language. The paragraph being read is highlighted and kept in view (auto scroll follows the voice).
 *  - Next article: at the end the voice names the next article and the page moves on to it by itself and keeps
 *    reading (the engine writes the reading order into the page: the rest of the topic, then the next topic). A
 *    countdown with Cancel comes first; it can be switched off. Where a browser will not speak on a page the visitor
 *    has not touched (Safari), one tap on "Continue listening" carries on.
 *  - Auto scroll: the page scrolls by itself at an adjustable speed, without voice, and moves on to the next article
 *    too; any wheel, touch or key stops it.
 *  - Slides: the article as full-screen slides, one section (h2) per slide, turning by themselves (with or without
 *    the voice); arrows, swipe, Space and Esc work.
 * No server, no cost, no tracking; nothing is shown to crawlers (everything is built by this script), and all motion
 * respects prefers-reduced-motion. The bar sits above the article text, never over an ad. */
(function () {
  'use strict';
  var mark = document.querySelector('[data-engine-reader]');
  if (!mark) return;
  var root = mark.parentElement;
  var pageLang = (document.documentElement.lang || 'en').toLowerCase();
  var lang = pageLang.slice(0, 2);
  var want = (mark.getAttribute('data-voice-lang') || pageLang).toLowerCase().replace('_', '-');
  // Only a page of this same site can be the next one (a path, never another origin or a script URL).
  var nextUrl = (function (u) {
    if (!/^\/(?!\/)/.test(u)) return '';
    try { var x = new URL(u, location.href); return x.origin === location.origin ? x.pathname + x.search + x.hash : ''; } catch (e) { return ''; }
  })(mark.getAttribute('data-next') || '');
  var nextTitle = mark.getAttribute('data-next-title') || '';
  // The link to the next article that the build wrote into the mark: following it is how the reader moves on.
  var nextLink = nextUrl ? mark.querySelector('a[data-engine-next]') : null;
  if (!nextLink) nextUrl = '';
  var W = {
    de: { listen: 'Vorlesen', stop: 'Stopp', pause: 'Pause', resume: 'Weiter', scroll: 'Automatisch scrollen', slides: 'Als Folien', speed: 'Tempo', close: 'Schließen', prev: 'Zurück', next: 'Weiter', play: 'Abspielen', voice: 'Mit Stimme', bar: 'Artikel vorlesen und anzeigen', slide: 'Folie', of: 'von', settings: 'Einstellungen', voiceName: 'Stimme', auto: 'Automatisch (beste Stimme)', autoNext: 'Danach den nächsten Artikel', nextIs: 'Nächster Artikel', inSec: 'in', sec: 's', cancel: 'Abbrechen', goNow: 'Jetzt', skip: 'Nächster Artikel', cont: 'Weiter vorlesen', contScroll: 'Weiter scrollen', noVoice: 'Auf diesem Gerät ist keine Stimme für diese Sprache installiert. Die Seite scrollt stattdessen langsam mit.', done: 'Alle Artikel gelesen.' },
    es: { listen: 'Escuchar', stop: 'Detener', pause: 'Pausa', resume: 'Seguir', scroll: 'Desplazamiento automático', slides: 'Ver en diapositivas', speed: 'Velocidad', close: 'Cerrar', prev: 'Anterior', next: 'Siguiente', play: 'Reproducir', voice: 'Con voz', bar: 'Escuchar y ver el artículo', slide: 'Diapositiva', of: 'de', settings: 'Ajustes', voiceName: 'Voz', auto: 'Automática (la mejor voz)', autoNext: 'Después, el siguiente artículo', nextIs: 'Siguiente artículo', inSec: 'en', sec: 's', cancel: 'Cancelar', goNow: 'Ya', skip: 'Siguiente artículo', cont: 'Seguir escuchando', contScroll: 'Seguir desplazando', noVoice: 'Este dispositivo no tiene una voz instalada para este idioma. En su lugar, la página se desplaza despacio.', done: 'Has escuchado todos los artículos.' },
    fr: { listen: 'Écouter', stop: 'Arrêter', pause: 'Pause', resume: 'Reprendre', scroll: 'Défilement automatique', slides: 'En diapositives', speed: 'Vitesse', close: 'Fermer', prev: 'Précédent', next: 'Suivant', play: 'Lecture', voice: 'Avec la voix', bar: "Écouter et afficher l'article", slide: 'Diapositive', of: 'sur', settings: 'Réglages', voiceName: 'Voix', auto: 'Automatique (meilleure voix)', autoNext: "Ensuite, l'article suivant", nextIs: 'Article suivant', inSec: 'dans', sec: 's', cancel: 'Annuler', goNow: 'Maintenant', skip: 'Article suivant', cont: "Continuer l'écoute", contScroll: 'Continuer le défilement', noVoice: "Cet appareil n'a pas de voix pour cette langue. La page défile lentement à la place.", done: 'Tous les articles ont été lus.' },
    en: { listen: 'Listen', stop: 'Stop', pause: 'Pause', resume: 'Resume', scroll: 'Auto scroll', slides: 'View as slides', speed: 'Speed', close: 'Close', prev: 'Previous', next: 'Next', play: 'Play', voice: 'With voice', bar: 'Listen to and view the article', slide: 'Slide', of: 'of', settings: 'Settings', voiceName: 'Voice', auto: 'Automatic (best voice)', autoNext: 'Then the next article', nextIs: 'Next article', inSec: 'in', sec: 's', cancel: 'Cancel', goNow: 'Now', skip: 'Next article', cont: 'Continue listening', contScroll: 'Continue scrolling', noVoice: 'This device has no voice installed for this language. The page scrolls slowly instead.', done: 'You have heard every article.' },
  };
  var T = W[lang] || W.en;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var synth = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  function sget(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function sset(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  var S = Object.assign({ rate: 1, scroll: 40, autoNext: true, voices: {} }, load('engine-reader', {}));
  if (!S.voices || typeof S.voices !== 'object') S.voices = {};
  function keep() { save('engine-reader', S); }

  /* ── styles: neutral, inherit the theme's fonts and colours ── */
  var css = '.engine-reader{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 1.4em;padding:10px 12px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:14px;font-size:15px;line-height:1.2}' +
    '.engine-reader button,.engine-reader select,.engine-dock button{font:inherit;color:inherit;background:color-mix(in srgb,currentColor 6%,transparent);border:1px solid color-mix(in srgb,currentColor 22%,transparent);border-radius:999px;padding:7px 13px;cursor:pointer}' +
    '.engine-reader button[aria-pressed=true]{background:color-mix(in srgb,currentColor 18%,transparent);font-weight:700}' +
    '.engine-reader__set{display:none;flex-basis:100%;flex-wrap:wrap;gap:10px 16px;align-items:center;padding-top:6px}.engine-reader__set.on{display:flex}' +
    '.engine-reader__set label{display:inline-flex;align-items:center;gap:6px}.engine-reader__set select{max-width:min(320px,70vw)}' +
    '.engine-speaking{background:color-mix(in srgb,#ffd84d 38%,transparent);box-shadow:0 0 0 6px color-mix(in srgb,#ffd84d 38%,transparent);border-radius:6px;transition:background .2s}' +
    '.engine-dock{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147483000;display:flex;align-items:center;gap:6px;max-width:calc(100vw - 24px);font:600 15px system-ui,sans-serif;background:#111;color:#fff;border-radius:999px;padding:6px;box-shadow:0 10px 28px rgba(0,0,0,.3)}' +
    '.engine-dock button{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.25);color:#fff;padding:9px 14px;white-space:nowrap}.engine-dock button:hover{background:rgba(255,255,255,.22)}' +
    '.engine-dock__info{padding:0 6px;font-weight:500;font-size:13px;opacity:.85;max-width:34vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.engine-dock--big{left:50%;right:auto;transform:translateX(-50%);bottom:calc(24px + env(safe-area-inset-bottom))}.engine-dock--big button{font-size:17px;padding:13px 22px;background:#ffd84d;color:#111;border-color:#ffd84d}' +
    '.engine-toast{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483002;max-width:min(560px,calc(100vw - 32px));background:#111;color:#fff;font:500 15px/1.4 system-ui,sans-serif;border-radius:16px;padding:14px 16px;box-shadow:0 14px 34px rgba(0,0,0,.35)}' +
    '.engine-toast strong{display:block;margin:2px 0 10px;font-size:16px}.engine-toast__row{display:flex;gap:8px;flex-wrap:wrap}.engine-toast button{font:600 15px system-ui,sans-serif;border-radius:999px;border:0;padding:9px 16px;cursor:pointer;background:#ffd84d;color:#111}.engine-toast button+button{background:rgba(255,255,255,.14);color:#fff}' +
    '.engine-toast__bar{height:3px;margin-top:10px;background:rgba(255,255,255,.18);border-radius:3px;overflow:hidden}.engine-toast__bar i{display:block;height:100%;width:100%;background:#ffd84d;transform-origin:left}' +
    '@media (max-width:640px){.engine-dock{left:12px;right:12px;justify-content:center;flex-wrap:wrap;border-radius:22px}.engine-dock--big{transform:none;left:12px;right:12px}.engine-dock--big button:first-child{flex:1}.engine-dock__info{max-width:100%;flex-basis:100%;text-align:center}}' +
    '.engine-slides{position:fixed;inset:0;z-index:2147483001;display:flex;flex-direction:column;background:var(--engine-slide-bg,#fff);color:var(--engine-slide-ink,#111)}' +
    '.engine-slides__bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(0,0,0,.1);font:600 15px system-ui,sans-serif}' +
    '.engine-slides__bar span{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
    '.engine-slides button{font:600 15px system-ui,sans-serif;background:#f1f1f1;color:#111;border:0;border-radius:999px;padding:9px 15px;cursor:pointer}' +
    '.engine-slides button[aria-pressed=true]{background:#111;color:#fff}' +
    '.engine-slides__stage{flex:1;overflow:hidden;display:grid;place-items:center;padding:18px;perspective:1400px}' +
    '.engine-slides__card{width:min(860px,100%);max-height:100%;overflow-y:auto;overscroll-behavior:contain;padding:clamp(18px,4vw,48px);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.14);background:#fff;color:#111;font-size:clamp(18px,2.1vw,22px);line-height:1.65}' +
    '.engine-slides__card h2{margin-top:0;font-size:1.5em;line-height:1.2}.engine-slides__card img,.engine-slides__card svg{max-width:100%;height:auto}' +
    '.engine-slides__card table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse;font-size:.85em}.engine-slides__card td,.engine-slides__card th{padding:6px 8px;border-bottom:1px solid rgba(0,0,0,.1);vertical-align:top}' +
    '@media (max-width:640px){.engine-slides__bar:first-child span{display:none}.engine-slides__bar:first-child{justify-content:flex-end;flex-wrap:wrap}.engine-slides button{padding:8px 12px;font-size:14px}.engine-slides__stage{padding:10px}.engine-slides__card{font-size:17px}}' +
    '.engine-slides__card.in{animation:engine-in .45s ease both}@keyframes engine-in{from{opacity:0;transform:translateX(40px) rotateY(-12deg)}to{opacity:1;transform:none}}' +
    '.engine-slides__dots{display:flex;justify-content:center;gap:6px;padding:10px;flex-wrap:wrap}.engine-slides__dots i{width:8px;height:8px;border-radius:50%;background:rgba(0,0,0,.18)}.engine-slides__dots i.on{background:#111}' +
    '.engine-slides__progress{height:4px;background:rgba(0,0,0,.08)}.engine-slides__progress i{display:block;height:100%;width:0;background:#111}' +
    '@media (prefers-reduced-motion:reduce){.engine-slides__card.in{animation:none}.engine-speaking{transition:none}}' +
    '@media print{.engine-reader,.engine-dock,.engine-toast{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ── voices: the page's own language and region, natural voices first ── */
  var voices = [];
  function norm(l) { return String(l || '').toLowerCase().replace('_', '-'); }
  var region = want.split('-')[1] || '';
  // Spanish of Latin America ("es-419"): any American Spanish voice comes before the voice of Spain.
  var AMERICAS = /^es-(419|mx|us|ar|co|cl|pe|ve|uy|py|bo|ec|gt|cr|pa|do|pr|hn|ni|sv|cu)$/;
  var NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|rocko|shelley|reed|sandy|flo|eddy/i;
  function score(v) {
    var L = norm(v.lang), s = 0;
    if (L.slice(0, 2) !== lang) return -1;
    if (L === want) s += 50;
    else if (region === '419' && AMERICAS.test(L)) s += 42;
    else if (region === 'gb' && /^en-(ie|au|nz)$/.test(L)) s += 20;
    else s += 10;
    if (/natural|neural|online|premium|enhanced|wavenet|studio|siri/i.test(v.name)) s += 30;
    if (/google/i.test(v.name)) s += 18;
    if (v.localService) s += 3;
    if (/compact|espeak|eloquence/i.test(v.name)) s -= 25;
    if (NOVELTY.test(v.name)) s -= 60;
    return s;
  }
  function langVoices() {
    return voices.filter(function (v) { return score(v) >= 0; }).sort(function (a, b) { return score(b) - score(a); });
  }
  function pickVoice() {
    var pool = langVoices();
    var chosen = S.voices[want];
    if (chosen) { var hit = pool.find(function (v) { return v.voiceURI === chosen || v.name === chosen; }); if (hit) return hit; }
    return pool[0] || null;
  }
  function listVoices() { voices = synth ? synth.getVoices() : []; fillVoiceSelect(); }

  /* ── the bar ── */
  var bar = document.createElement('div');
  bar.className = 'engine-reader';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', T.bar);
  function btn(label, icon) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.innerHTML = '<span aria-hidden="true">' + icon + '</span> '; b.appendChild(document.createTextNode(label)); return b; }
  var bListen = btn(T.listen, '🔊'), bScroll = btn(T.scroll, '⇣'), bSlides = btn(T.slides, '▶'), bSet = btn(T.settings, '⚙');
  bSet.setAttribute('aria-expanded', 'false');
  var setBox = document.createElement('div');
  setBox.className = 'engine-reader__set';
  setBox.id = 'engine-reader-set';
  bSet.setAttribute('aria-controls', setBox.id);
  var speedLabel = document.createElement('label'), sel = document.createElement('select');
  speedLabel.appendChild(document.createTextNode(T.speed));
  [0.75, 0.9, 1, 1.15, 1.3, 1.5].forEach(function (r) { var o = document.createElement('option'); o.value = String(r); o.textContent = r + '×'; if (r === S.rate) o.selected = true; sel.appendChild(o); });
  speedLabel.appendChild(sel);
  var voiceLabel = document.createElement('label'), vSel = document.createElement('select');
  voiceLabel.appendChild(document.createTextNode(T.voiceName));
  voiceLabel.appendChild(vSel);
  var nextLabel = document.createElement('label'), nextBox = document.createElement('input');
  nextBox.type = 'checkbox'; nextBox.checked = !!S.autoNext;
  nextLabel.appendChild(nextBox); nextLabel.appendChild(document.createTextNode(T.autoNext));
  setBox.appendChild(speedLabel);
  if (synth) setBox.appendChild(voiceLabel);
  if (nextUrl) setBox.appendChild(nextLabel);
  if (synth) bar.appendChild(bListen);
  bar.appendChild(bScroll);
  bar.appendChild(bSlides);
  bar.appendChild(bSet);
  bar.appendChild(setBox);
  mark.replaceWith(bar);
  sel.addEventListener('change', function () { S.rate = Number(sel.value); keep(); });
  nextBox.addEventListener('change', function () { S.autoNext = nextBox.checked; keep(); });
  bSet.addEventListener('click', function () { var on = !setBox.classList.contains('on'); setBox.classList.toggle('on', on); bSet.setAttribute('aria-pressed', on ? 'true' : 'false'); bSet.setAttribute('aria-expanded', on ? 'true' : 'false'); });
  function fillVoiceSelect() {
    if (!synth) return;
    var pool = langVoices(), cur = S.voices[want] || '';
    vSel.innerHTML = '';
    var o = document.createElement('option'); o.value = ''; o.textContent = T.auto; vSel.appendChild(o);
    pool.forEach(function (v) { var x = document.createElement('option'); x.value = v.voiceURI || v.name; x.textContent = v.name + ' (' + v.lang + ')'; if (x.value === cur) x.selected = true; vSel.appendChild(x); });
  }
  vSel.addEventListener('change', function () {
    if (vSel.value) S.voices[want] = vSel.value; else delete S.voices[want];
    keep();
    if (reading) { var i = Math.max(0, at - 1); speakFrom(i, 0); }
  });
  if (synth) { listVoices(); if (synth.addEventListener) synth.addEventListener('voiceschanged', listVoices); else synth.onvoiceschanged = listVoices; }

  /* ── the readable blocks of the article ── */
  function blocks(scope) {
    return Array.prototype.slice.call((scope || root).querySelectorAll('h2,h3,h4,p,li,blockquote,figcaption,td,th,dd,dt'))
      .filter(function (el) {
        if (el.closest('.engine-reader,.engine-dock,nav,aside,.toc,[aria-hidden=true],script,style,ins,svg')) return false;
        if (el.tagName !== 'LI' && el.closest('li')) return false; // a <p> inside a list item is read with the item
        if (el.tagName === 'P' && el.closest('blockquote')) return false;
        return /\S/.test(el.textContent || '');
      });
  }
  function textOf(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }
  // Sentences of at most ~220 characters: a long utterance stops silently on Chrome (desktop and Android). A sentence
  // ends at . ! ? … followed by a space and a capital, digit or quote, and at ; or : followed by a space — never inside
  // "1.5", "10:30", "z. B.", "p. ej." or "Dr." (short abbreviations are not sentence ends).
  var ABBR = /(?:^|\s)(?:[a-zäöüß]{1,2}|[A-ZÄÖÜ]|bzw|usw|vgl|ggf|inkl|etc|ca|Nr|Dr|Sr|Sra|Hr|Fr|St|aprox|pág|núm|mín|máx|approx|incl|e\.g|i\.e|ej|vs|Mio|Mrd|Jh)\.$/;
  function chunks(text) {
    var out = [], cur = '', i = 0, n = text.length;
    for (; i < n; i++) {
      var c = text[i];
      cur += c;
      var end = false;
      if (/[.!?…]/.test(c) && /\s/.test(text[i + 1] || '') && /[A-ZÄÖÜÁÉÍÓÚÑ¿¡"„«“(0-9]/.test((text.slice(i + 1).match(/\S/) || [''])[0])) end = c !== '.' || !ABBR.test(cur);
      else if (/[;:]/.test(c) && /\s/.test(text[i + 1] || '') && cur.length > 24) end = true;
      if (end || i === n - 1) { if (cur.trim()) out.push(cur.trim()); cur = ''; }
    }
    var res = [];
    out.forEach(function (p) {
      while (p.length > 220) {
        var cut = p.lastIndexOf(', ', 220); if (cut < 80) cut = p.lastIndexOf(' ', 220); if (cut < 40) cut = 220;
        res.push(p.slice(0, cut + 1).trim()); p = p.slice(cut + 1).trim();
      }
      if (p) res.push(p);
    });
    return res;
  }
  function into(el) {
    var r = el.getBoundingClientRect(), h = window.innerHeight;
    if (r.top < h * 0.18 || r.bottom > h * 0.78) el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ── speaking one piece, with a watchdog: a voice that never starts is retried once, then given up ── */
  var session = 0, current = null, spoke = false, arrived = false;
  function utter(text, onEnd, onFail, useDefault) {
    var my = session, started = false, u = new SpeechSynthesisUtterance(text), v = useDefault ? null : pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = want;
    u.rate = Math.max(0.5, Math.min(2, S.rate));
    u.onstart = function () { started = true; spoke = true; };
    u.onend = function () { if (my !== session) return; current = null; onEnd(); };
    u.onerror = function (e) {
      if (my !== session) return;
      var err = e && e.error;
      if (err === 'interrupted' || err === 'canceled') return;
      current = null;
      onFail(err === 'not-allowed' ? 'not-allowed' : 'error', started);
    };
    current = u;
    synth.speak(u);
    setTimeout(function () {
      if (my !== session || started || current !== u) return;
      if (synth.speaking && !synth.pending) return; // speaking without a start event (some engines): fine
      if (!useDefault) { synth.cancel(); session++; var s2 = session; setTimeout(function () { if (s2 === session) utter(text, onEnd, onFail, true); }, 120); return; }
      onFail('silent', false);
    }, 3000);
  }

  /* ── listen ── */
  var reading = false, paused = false, list = [], at = 0, piece = 0, dock = null, wake = null;
  function lockScreen(on) {
    try {
      if (on && navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(function (w) { wake = w; }, function () {});
      if (!on && wake) { wake.release(); wake = null; }
    } catch (e) { /* not supported */ }
  }
  function clearMarks() { list.forEach(function (el) { if (el && el.classList) el.classList.remove('engine-speaking'); }); }
  function showDock(info, buttons, big) {
    if (dock) dock.remove();
    dock = document.createElement('div');
    dock.className = 'engine-dock' + (big ? ' engine-dock--big' : '');
    dock.setAttribute('role', 'group');
    if (info) { var i = document.createElement('span'); i.className = 'engine-dock__info'; i.textContent = info; dock.appendChild(i); }
    buttons.forEach(function (b) { var x = document.createElement('button'); x.type = 'button'; x.textContent = b[0]; x.addEventListener('click', b[1]); dock.appendChild(x); });
    document.body.appendChild(dock);
    return dock;
  }
  function hideDock() { if (dock) { dock.remove(); dock = null; } }
  function listenDock() {
    var b = [[paused ? '▶ ' + T.resume : '❚❚ ' + T.pause, togglePause], ['■ ' + T.stop, stopListen]];
    if (nextUrl) b.push(['⏭ ' + T.skip, function () { stopListen(); goNext('listen', true); }]);
    showDock('', b);
  }
  function stopListen() {
    if (!reading) return;
    reading = false; paused = false; session++;
    if (synth) synth.cancel();
    clearMarks(); hideDock(); cancelCountdown(); lockScreen(false);
    bListen.setAttribute('aria-pressed', 'false');
    sset('engine-reader-go', null);
  }
  function togglePause() {
    if (!reading) return;
    if (!paused) { paused = true; session++; synth.cancel(); }
    else { paused = false; speakFrom(Math.max(0, at - 1), piece); }
    listenDock();
  }
  function speakFrom(i, p) {
    session++; synth.cancel();
    var s = session;
    // Chrome can drop a speak() that follows cancel() at once: a moment's pause first.
    setTimeout(function () { if (s === session) { at = i; nextBlock(p || 0); } }, 80);
  }
  function nextBlock(fromPiece) {
    if (!reading || paused) return;
    clearMarks();
    if (at >= list.length) { finished(); return; }
    var el = list[at++], parts = el === 'title' ? chunks(headline()) : chunks(textOf(el)), k = fromPiece || 0;
    if (el !== 'title') { el.classList.add('engine-speaking'); into(el); }
    (function go() {
      if (!reading || paused) return;
      piece = k;
      if (k >= parts.length) { nextBlock(0); return; }
      utter(parts[k++], go, failed);
    })();
  }
  function headline() { var h = document.querySelector('h1'); return h ? textOf(h) : document.title; }
  function failed(why, started) {
    if (!reading) return;
    if (why === 'not-allowed') { stopListen(); offerContinue('listen'); return; }
    if (started) { nextBlock(0); return; } // one sentence failed: carry on with the next block
    // Safari stays silent on a page the visitor has not touched yet: one tap carries on.
    if (arrived && !spoke) { stopListen(); offerContinue('listen'); return; }
    // No voice at all on this device: say so and let the page scroll instead.
    stopListen(); toast(T.noVoice, null, 6000); startScroll();
  }
  function startListen(fromTop) {
    if (!synth) { startScroll(); return; }
    // Voices are known and none speaks this language: say so and scroll instead of reading in a foreign accent.
    if (voices.length && !langVoices().length) { toast(T.noVoice, null, 6000); startScroll(); return; }
    stopScroll(); cancelCountdown();
    list = ['title'].concat(blocks());
    at = 0;
    if (!fromTop) {
      // Start at the first block in view, so a reader halfway down hears what is in front of them.
      var top = bar.getBoundingClientRect().top;
      if (top < 0) for (var i = 1; i < list.length; i++) { if (list[i].getBoundingClientRect().bottom > 60) { at = i; break; } }
    } else window.scrollTo({ top: 0, behavior: 'auto' });
    reading = true; paused = false;
    bListen.setAttribute('aria-pressed', 'true');
    listenDock(); lockScreen(true);
    session++;
    if (synth.speaking || synth.pending) synth.cancel();
    nextBlock(0); // inside the tap itself: iOS and Chrome only allow sound that a gesture started
  }
  function finished() {
    stopListen();
    goNext('listen');
  }
  bListen.addEventListener('click', function () { arrived = false; if (reading) stopListen(); else { sset('engine-reader-flow', null); startListen(false); } });

  /* ── on to the next article ── */
  var countdown = null;
  function cancelCountdown() { if (countdown) { clearInterval(countdown.timer); countdown.el.remove(); countdown = null; } }
  function toast(msg, buttons, ms) {
    var t = document.createElement('div');
    t.className = 'engine-toast'; t.setAttribute('role', 'status');
    t.textContent = msg;
    if (buttons) {
      var row = document.createElement('div'); row.className = 'engine-toast__row';
      buttons.forEach(function (b) { var x = document.createElement('button'); x.type = 'button'; x.textContent = b[0]; x.addEventListener('click', b[1]); row.appendChild(x); });
      t.appendChild(row);
    }
    document.body.appendChild(t);
    if (ms) setTimeout(function () { t.remove(); }, ms);
    return t;
  }
  function goNext(mode, now, slidesVoice) {
    var flow = sget('engine-reader-flow') || {};
    if (!nextUrl || (!S.autoNext && !now)) return;
    if (flow.start && flow.start === nextUrl && !now) { toast(T.done, null, 5000); sset('engine-reader-flow', null); return; } // round the whole library
    var go = function () {
      cancelCountdown();
      sset('engine-reader-flow', { start: flow.start || location.pathname });
      sset('engine-reader-go', { mode: mode, to: nextUrl, t: Date.now(), voice: !!slidesVoice });
      if (!nextLink.isConnected) { nextLink.hidden = true; document.body.appendChild(nextLink); }
      nextLink.click();
    };
    if (now) { go(); return; }
    var secs = 6, t = toast(T.nextIs + ':', [['▶ ' + T.goNow, go], ['✕ ' + T.cancel, function () { cancelCountdown(); sset('engine-reader-flow', null); }]]);
    var strong = document.createElement('strong'); strong.textContent = nextTitle; t.insertBefore(strong, t.firstChild.nextSibling);
    var line = document.createElement('div'); line.className = 'engine-toast__bar'; line.innerHTML = '<i></i>'; t.appendChild(line);
    var fill = line.firstChild, left = secs * 10;
    countdown = { el: t, timer: setInterval(function () {
      left--; fill.style.transform = 'scaleX(' + Math.max(0, left / (secs * 10)) + ')';
      if (left <= 0) go();
    }, 100) };
    // The voice names the next article while the countdown runs.
    if (mode === 'listen' && synth) { session++; utter(T.nextIs + ': ' + nextTitle, function () {}, function () {}); }
  }
  // A big button when the browser will not start the voice on a page the visitor has not touched yet.
  function offerContinue(mode, voiceSlides) {
    showDock('', [['▶ ' + (mode === 'scroll' ? T.contScroll : T.cont), function () {
      hideDock();
      if (mode === 'slides') openSlides(true, voiceSlides); else if (mode === 'scroll') startScroll(); else startListen(true);
    }], ['✕', function () { hideDock(); sset('engine-reader-flow', null); }]], true);
    arrived = false;
  }

  /* ── auto scroll ── */
  var scrolling = false, raf = 0, last = 0, acc = 0;
  function stopScroll() {
    if (!scrolling) return;
    scrolling = false; cancelAnimationFrame(raf);
    bScroll.setAttribute('aria-pressed', 'false');
    hideDock(); lockScreen(false);
  }
  function tick(t) {
    if (!scrolling) return;
    if (last) {
      acc += ((t - last) / 1000) * S.scroll * S.rate;
      var px = Math.floor(acc);
      if (px >= 1) { acc -= px; window.scrollBy(0, px); }
      var end = root.getBoundingClientRect().bottom < window.innerHeight * 0.6 || window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (end) { stopScroll(); goNext('scroll'); return; }
    }
    last = t;
    raf = requestAnimationFrame(tick);
  }
  function startScroll() {
    stopListen(); cancelCountdown();
    scrolling = true; last = 0; acc = 0;
    bScroll.setAttribute('aria-pressed', 'true');
    var b = [['■ ' + T.stop, stopScroll]];
    if (nextUrl) b.push(['⏭ ' + T.skip, function () { stopScroll(); goNext('scroll', true); }]);
    showDock('', b); lockScreen(true);
    raf = requestAnimationFrame(tick);
  }
  bScroll.addEventListener('click', function () { if (scrolling) stopScroll(); else { sset('engine-reader-flow', null); startScroll(); } });
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function (e) { if (scrolling && !(e.target && e.target.closest && e.target.closest('.engine-dock,.engine-toast'))) stopScroll(); }, { passive: true });
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
    return out.filter(function (s) { return s.nodes.some(function (n) { return /\S/.test(n.textContent || '') || n.querySelector('img,svg'); }); });
  }
  function openSlides(autoplay, voiceOn) {
    stopListen(); stopScroll(); cancelCountdown();
    var secs = sections();
    if (!secs.length) return;
    var idx = 0, playing = false, withVoice = !!voiceOn && !!synth, timer = 0, startedAt = 0, dur = 0, speakList = [], speakAt = 0;
    var box = document.createElement('div');
    box.className = 'engine-slides'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', T.slides);
    var title = headline();
    box.innerHTML = '<div class="engine-slides__bar"><span></span><button type="button" data-k="play" aria-pressed="false">▶ ' + T.play + '</button>' +
      (synth ? '<button type="button" data-k="voice" aria-pressed="' + (withVoice ? 'true' : 'false') + '">🔊 ' + T.voice + '</button>' : '') +
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
    lockScreen(true);
    function words(s) { return s.nodes.reduce(function (n, el) { return n + ((el.textContent || '').match(/\S+/g) || []).length; }, 0); }
    function show(i) {
      idx = Math.max(0, Math.min(secs.length - 1, i));
      clearTimeout(timer); session++; if (synth) synth.cancel();
      card.innerHTML = '';
      secs[idx].nodes.forEach(function (n) { var c = n.cloneNode(true); if (c.removeAttribute) c.removeAttribute('id'); card.appendChild(c); });
      card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
      card.scrollTop = 0;
      count.textContent = T.slide + ' ' + (idx + 1) + ' ' + T.of + ' ' + secs.length;
      Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === idx); });
      prog.style.width = ((idx + 1) / secs.length * 100) + '%';
      if (playing) run();
    }
    function advance() {
      if (!playing) return;
      if (idx < secs.length - 1) show(idx + 1);
      else if (nextUrl && S.autoNext) { close(true); goNext('slides', false, withVoice); }
      else setPlay(false);
    }
    function run() {
      clearTimeout(timer);
      if (withVoice && synth) {
        speakList = blocks(card); speakAt = 0;
        var parts = [], pk = 0;
        if (idx === 0) parts = chunks(title);
        (function go() {
          if (!playing || !withVoice) return;
          if (pk < parts.length) { utter(parts[pk++], go, onFail); return; }
          speakList.forEach(function (el) { el.classList.remove('engine-speaking'); });
          if (speakAt >= speakList.length) { timer = setTimeout(advance, 700); return; }
          var el = speakList[speakAt++];
          el.classList.add('engine-speaking');
          var r = el.getBoundingClientRect(), cr = card.getBoundingClientRect();
          if (r.bottom > cr.bottom || r.top < cr.top) card.scrollTop += r.top - cr.top - 40;
          parts = chunks(textOf(el)); pk = 0;
          go();
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
    function onFail(why, started) {
      if (why === 'not-allowed') { setPlay(false); offerContinue('slides', true); close(); return; }
      if (!started) { withVoice = false; if (bVoice) bVoice.setAttribute('aria-pressed', 'false'); toast(T.noVoice, null, 5000); }
      run();
    }
    function setPlay(on) {
      playing = on;
      bPlay.setAttribute('aria-pressed', on ? 'true' : 'false');
      bPlay.textContent = on ? '❚❚ ' + T.pause : '▶ ' + T.play;
      clearTimeout(timer); session++; if (synth) synth.cancel();
      if (on) run();
    }
    function close(keepFlow) {
      playing = false; clearTimeout(timer); session++; if (synth) synth.cancel();
      box.remove(); document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      lockScreen(false);
      if (!keepFlow) bSlides.focus();
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
      else if (w === 'voice') { withVoice = !withVoice; bVoice.setAttribute('aria-pressed', withVoice ? 'true' : 'false'); if (!playing) setPlay(true); else { session++; synth.cancel(); run(); } }
    });
    var sx = 0, sy = 0;
    card.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    card.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    show(0);
    if (autoplay !== false) setPlay(true);
    bPlay.focus();
  }
  bSlides.addEventListener('click', function () { sset('engine-reader-flow', null); openSlides(true, false); });
  window.addEventListener('pagehide', function () { session++; if (synth) synth.cancel(); });

  /* ── arriving from the previous article: carry on by itself ── */
  var go = sget('engine-reader-go');
  if (go && go.to === location.pathname && Date.now() - go.t < 120000) {
    sset('engine-reader-go', null);
    var begin = function () {
      arrived = true;
      if (go.mode === 'scroll') { window.scrollTo(0, 0); startScroll(); return; }
      if (go.mode === 'slides') { openSlides(true, go.voice); return; }
      if (!synth) { startScroll(); return; }
      startListen(true);
    };
    // Voices load a moment after the page on Chrome: wait for them (at most 1.5 s) so the right accent is chosen.
    if (synth && !synth.getVoices().length && go.mode !== 'scroll') {
      var started = false, kick = function () { if (!started) { started = true; listVoices(); begin(); } };
      if (synth.addEventListener) synth.addEventListener('voiceschanged', kick);
      setTimeout(kick, 1500);
    } else setTimeout(begin, 400);
  } else if (go) sset('engine-reader-go', null);
})();
