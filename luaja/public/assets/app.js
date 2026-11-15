/* LUAJA — antarmuka */
(function () {
  'use strict';
  var d = document, root = d.documentElement, $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  window.ljToast = function (msg, ms) { var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, ms || 2600); };

  /* kepala: bayangan saat digulir, menu HP */
  var head = $('.site-head');
  if (head) { var onS = function () { head.classList.toggle('scrolled', window.scrollY > 8); }; onS(); window.addEventListener('scroll', onS, { passive: true }); }
  var tog = $('[data-nav-toggle]'), nav = $('#nav');
  if (tog && nav) tog.addEventListener('click', function () { var open = nav.classList.toggle('open'); tog.setAttribute('aria-expanded', String(open)); });

  var logo = $('[data-logo]'), taps = [], tapT;
  if (logo) logo.addEventListener('click', function (e) {
    e.preventDefault();
    var now = Date.now(); taps = taps.filter(function (t) { return now - t < 4000; }); taps.push(now);
    clearTimeout(tapT);
    if (taps.length >= 5) { taps = []; location.href = '/admin'; return; }
    tapT = setTimeout(function () { taps = []; location.href = logo.getAttribute('href') || '/'; }, 700);
  });

  /* ukuran huruf & mode gelap */
  $$('[data-fs]').forEach(function (b) { b.addEventListener('click', function () { var cur = parseInt(store('lj_fs') || '100', 10); cur = Math.max(85, Math.min(130, cur + (b.getAttribute('data-fs') === '+' ? 7 : -7))); root.style.setProperty('--base-size', cur + '%'); store('lj_fs', String(cur)); }); });
  $$('[data-dark]').forEach(function (b) { b.addEventListener('click', function () { var cur = root.getAttribute('data-dark'); var dark = cur === '1' ? '0' : (cur === '0' ? '1' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? '0' : '1')); root.setAttribute('data-dark', dark); store('lj_dark', dark); }); });

  /* muncul saat digulir */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else $$('.reveal').forEach(function (el) { el.classList.add('in'); });

  /* salam bergulir di hero */
  $$('.greeting').forEach(function (g) {
    var items = $$('span', g); if (items.length < 2) { if (items[0]) items[0].classList.add('on'); return; }
    var i = 0; items[0].classList.add('on');
    if (reduce) return;
    setInterval(function () { items[i].classList.remove('on'); i = (i + 1) % items.length; items[i].classList.add('on'); }, 3800);
  });

  /* FAQ: tutup yang lain */
  $$('.faq').forEach(function (f) { $$('details', f).forEach(function (dt) { dt.addEventListener('toggle', function () { if (dt.open) $$('details', f).forEach(function (o) { if (o !== dt) o.open = false; }); }); }); });

  /* salin ke papan klip */
  $$('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-copy'); if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { window.ljToast('Disalin: ' + v); }); }); });

  /* suara: tombol [data-say] membacakan teks dengan locale */
  var synth = window.speechSynthesis;
  function pickVoice(lang) { if (!synth) return null; var vs = synth.getVoices(); var exact = vs.filter(function (v) { return v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase(); }); var pre = vs.filter(function (v) { return v.lang.toLowerCase().indexOf(lang.slice(0, 2).toLowerCase()) === 0; }); var pool = exact.length ? exact : pre; if (!pool.length) return null; var fav = pool.filter(function (v) { return /Google|Natural|Premium|Siri|Enhanced/i.test(v.name); }); return (fav[0] || pool[0]); }
  window.ljSay = function (text, lang, rate, onEnd) { if (!synth) { window.ljToast('Peramban ini belum mendukung suara.'); return; } synth.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = lang; var v = pickVoice(lang); if (v) u.voice = v; u.rate = rate || 1; if (onEnd) u.onend = onEnd; synth.speak(u); };
  d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-say]'); if (!b) return; e.preventDefault(); window.ljSay(b.getAttribute('data-say'), b.getAttribute('data-lang') || 'de-DE', parseFloat(b.getAttribute('data-rate') || '1')); });
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};

  /* kartu kosakata: buka contoh */
  d.addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('.vcard'); if (!c || e.target.closest('button')) return; c.classList.toggle('open'); });

  /* pasang PWA */
  var deferred; window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; $$('[data-install]').forEach(function (b) { b.hidden = false; }); });
  $$('[data-install]').forEach(function (b) { b.addEventListener('click', function () { if (deferred) { deferred.prompt(); deferred = null; b.hidden = true; } }); });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(function () {});
})();
