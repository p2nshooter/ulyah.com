/* yapida.sch.id — ruang obrolan portal (grup, japri, tiket): pesan baru diambil tiap beberapa detik selama halaman
   terlihat, kirim tanpa memuat ulang, Enter mengirim (Shift+Enter baris baru). Teks pesan selalu lewat textContent. */
(function () {
  'use strict';
  var ruang = document.querySelector('[data-obrolan]');
  if (!ruang) return;
  var api = ruang.getAttribute('data-api'), saya = ruang.getAttribute('data-saya'), setelah = Number(ruang.getAttribute('data-setelah')) || 0;
  var daftar = ruang.querySelector('[data-pesan]'), form = ruang.querySelector('[data-tulis]');
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sudah = {};
  Array.prototype.slice.call(daftar.querySelectorAll('.ps-msg')).forEach(function (li) { sudah[li.getAttribute('data-t') + '|' + li.querySelector('.ps-siapa b').textContent] = 1; });
  var jam = function (t) { var d = new Date(t + 7 * 3600000); return String(d.getUTCHours()).padStart(2, '0') + '.' + String(d.getUTCMinutes()).padStart(2, '0'); };
  var inisial = function (n) { return (n.replace(/^(admin|kepala|ketua|super)\s+/i, '').charAt(0) || '•').toUpperCase(); };
  var warna = function (id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h % 6; };
  var keBawah = function () { daftar.scrollTop = daftar.scrollHeight; };

  function tambah(p) {
    var kunci = p.t + '|' + p.n;
    if (sudah[kunci]) return;
    sudah[kunci] = 1;
    var kosong = daftar.querySelector('[data-kosong]'); if (kosong) kosong.remove();
    var li = document.createElement('li');
    li.className = 'ps-msg' + (p.d === saya ? ' saya' : '') + (/^— status/.test(p.x) ? ' sistem' : '') + ' baru';
    li.setAttribute('data-t', p.t);
    var av = document.createElement('span'); av.className = 'ps-av av-' + warna(p.d); av.setAttribute('aria-hidden', 'true'); av.textContent = inisial(p.n);
    var gel = document.createElement('div'); gel.className = 'ps-gel';
    var siapa = document.createElement('p'); siapa.className = 'ps-siapa';
    var b = document.createElement('b'); b.textContent = p.n; var l = document.createElement('span'); l.textContent = p.l;
    siapa.appendChild(b); siapa.appendChild(l);
    var teks = document.createElement('p'); teks.className = 'ps-teks'; teks.textContent = p.x;
    var w = document.createElement('time'); w.textContent = jam(p.t); w.setAttribute('datetime', new Date(p.t).toISOString());
    gel.appendChild(siapa); gel.appendChild(teks); gel.appendChild(w);
    li.appendChild(av); li.appendChild(gel);
    daftar.appendChild(li);
    if (p.t > setelah) setelah = p.t;
  }

  var sibuk = false;
  function tarik() {
    if (sibuk || document.hidden) return;
    sibuk = true;
    var sep = api.indexOf('?') >= 0 ? '&' : '?';
    fetch(api + sep + 'setelah=' + setelah, { headers: { accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.pesan && j.pesan.length) { var bawah = daftar.scrollHeight - daftar.scrollTop - daftar.clientHeight < 120; j.pesan.forEach(tambah); if (bawah) keBawah(); } })
      .catch(function () { /* coba lagi nanti */ })
      .then(function () { sibuk = false; });
  }
  keBawah();
  setInterval(tarik, 4000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tarik(); });

  if (!form) return;
  var ta = form.querySelector('textarea'), tombol = form.querySelector('button');
  var tinggi = function () { ta.style.height = 'auto'; ta.style.height = Math.min(180, ta.scrollHeight) + 'px'; };
  ta.addEventListener('input', tinggi);
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true })); } });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var teks = ta.value.trim();
    if (!teks) return;
    tombol.disabled = true;
    fetch(form.getAttribute('action'), { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ teks: teks }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.galat || 'Gagal mengirim.'); return j; }); })
      .then(function (j) { ta.value = ''; tinggi(); tambah(j.pesan); keBawah(); ta.focus(); })
      .catch(function (err) { alert(err.message); })
      .then(function () { tombol.disabled = false; });
  });
  if (!tenang) ta.focus({ preventScroll: true });
})();
