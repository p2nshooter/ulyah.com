/* LUAJA — Kamus: isian otomatis saat mengetik (arti singkat dalam bahasa antarmuka), pilihan bahasa kamus, papan tombol
 * panah/Enter. DOM dibangun lewat textContent (tanpa HTML mentah). */
(function () {
  'use strict';
  var form = document.querySelector('[data-k-search]'); if (!form) return;
  var input = form.querySelector('[data-k-q]'), list = form.querySelector('[data-k-list]');
  var UI = (window.LJ && window.LJ.lang) || document.documentElement.lang || 'id';
  var EX = { de: 'Haus', en: 'house', ja: '家', id: 'rumah' };
  var LANGS = ['de', 'en', 'ja', 'id'];
  var lang = function () { var r = form.querySelector('input[name="l"]:checked'), v = r ? r.value : 'de'; return LANGS.indexOf(v) >= 0 ? v : 'de'; };
  var timer = null, seq = 0, active = -1, items = [];

  function close() { list.hidden = true; list.textContent = ''; active = -1; items = []; input.setAttribute('aria-expanded', 'false'); }
  function go(w) { var u = new URL('/kamus/' + lang() + '/' + encodeURIComponent(String(w)), window.location.origin); if (u.origin === window.location.origin) window.location.assign(u.pathname); }
  function mark() { items.forEach(function (li, i) { li.classList.toggle('on', i === active); li.setAttribute('aria-selected', i === active ? 'true' : 'false'); }); }
  function show(data) {
    list.textContent = '';
    items = (data.items || []).map(function (it) {
      var li = document.createElement('li'); li.setAttribute('role', 'option');
      var b = document.createElement('b'); b.textContent = it.w; b.lang = lang();
      var s = document.createElement('span'); s.textContent = it.m || '';
      li.appendChild(b); li.appendChild(s);
      li.addEventListener('mousedown', function (e) { e.preventDefault(); go(it.w); });
      li._w = it.w;
      list.appendChild(li);
      return li;
    });
    list.hidden = !items.length; active = -1; input.setAttribute('aria-expanded', items.length ? 'true' : 'false');
  }
  input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var q = input.value.trim();
    if (q.length < 1) { close(); return; }
    timer = setTimeout(function () {
      var my = ++seq;
      fetch('/api/kamus/awal?l=' + lang() + '&ui=' + UI + '&q=' + encodeURIComponent(q)).then(function (r) { return r.ok ? r.json() : { items: [] }; }).then(function (d) { if (my === seq) show(d); }).catch(close);
    }, 140);
  });
  input.addEventListener('keydown', function (e) {
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % items.length; mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + items.length) % items.length; mark(); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); go(items[active]._w); }
    else if (e.key === 'Escape') close();
  });
  input.addEventListener('blur', function () { setTimeout(close, 150); });
  form.addEventListener('change', function (e) {
    if (e.target.name !== 'l') return;
    input.lang = lang(); input.placeholder = input.placeholder.replace(/(?:Haus|house|家|rumah)/, EX[lang()]);
    close(); input.focus();
    if (input.value.trim()) input.dispatchEvent(new Event('input'));
  });
})();
