/* yapida.sch.id — tur interaktif: menyorot tombol dan menu ASLI di halaman, langkah demi langkah.
   Data: <script type="application/json" id="tur-data">{id, judul, bagian, otomatis, langkah:[{el, sisi, hanya, judul, teks}]}</script>
   Mulai: tombol [data-tur-mulai], alamat ?tur=1, atau sekali otomatis per perangkat bila „otomatis“.
   Keyboard: → / Enter lanjut, ← kembali, Esc tutup. Gerak halus mengikuti prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document, w = window;
  var sumber = d.getElementById('tur-data');
  if (!sumber) return;
  var tur;
  try { tur = JSON.parse(sumber.textContent || '{}'); } catch (e) { return; }
  if (!tur || !tur.langkah || !tur.langkah.length) return;

  var baca = function (k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } };
  var simpan = function (k, v) { try { w.localStorage.setItem(k, v); } catch (e) { /* penyimpanan lokal tidak tersedia */ } };
  var KUNCI = 'yp-tur:' + tur.id;
  var gerak = !(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var sempit = function () { return w.matchMedia('(max-width: 900px)').matches; };
  var hp = function () { return w.matchMedia('(max-width: 640px)').matches; };
  var tombolMulai = [].slice.call(d.querySelectorAll('[data-tur-mulai]'));

  /** Tandai bagian panduan „sudah dipelajari“ (dibaca halaman panduan). */
  function tandaiPaham(id) {
    if (!id) return;
    var a = [];
    try { a = JSON.parse(baca('yp-pd-paham') || '[]'); } catch (e) { a = []; }
    if (a.indexOf(id) < 0) { a.push(id); simpan('yp-pd-paham', JSON.stringify(a)); }
  }

  /** **tebal** → <b>; teks lain lewat textContent (tidak pernah innerHTML dari data). */
  function isiTeks(el, s) {
    el.textContent = '';
    String(s || '').split(/\*\*(.+?)\*\*/).forEach(function (bag, i) {
      if (!bag) return;
      if (i % 2) { var b = d.createElement('b'); b.textContent = bag; el.appendChild(b); } else el.appendChild(d.createTextNode(bag));
    });
  }

  var akar, sorot, kartu, eNo, eBar, eJudul, eTeks, eTitik, eUmum, bKembali, bLanjut, langkah = [], i = 0, aktif = false, pemicu = null, sisiDibuka = false, raf = 0, jeda = 0;

  function bangun() {
    akar = d.createElement('div');
    akar.className = 'tur';
    akar.hidden = true;
    akar.setAttribute('role', 'dialog');
    akar.setAttribute('aria-modal', 'true');
    akar.setAttribute('aria-labelledby', 'tur-judul');
    akar.setAttribute('aria-describedby', 'tur-teks');
    akar.innerHTML = '<div class="tur-tirai"></div><div class="tur-sorot" aria-hidden="true"></div>' +
      '<div class="tur-kartu"><div class="tur-atas"><span class="tur-no"></span><button type="button" class="tur-tutup" aria-label="Tutup tur">✕</button></div>' +
      '<div class="tur-bar" aria-hidden="true"><i></i></div><h2 class="tur-judul" id="tur-judul"></h2><p class="tur-teks" id="tur-teks"></p>' +
      '<div class="tur-titik" aria-hidden="true"></div>' +
      '<div class="tur-tombol"><button type="button" class="tur-lewati">Lewati tur</button><span></span><button type="button" class="tur-kembali">← Kembali</button><button type="button" class="tur-lanjut">Lanjut →</button></div>' +
      '<p class="sr-only" aria-live="polite"></p></div>';
    d.body.appendChild(akar);
    sorot = akar.querySelector('.tur-sorot');
    kartu = akar.querySelector('.tur-kartu');
    eNo = akar.querySelector('.tur-no');
    eBar = akar.querySelector('.tur-bar i');
    eJudul = akar.querySelector('.tur-judul');
    eTeks = akar.querySelector('.tur-teks');
    eTitik = akar.querySelector('.tur-titik');
    eUmum = akar.querySelector('[aria-live]');
    bKembali = akar.querySelector('.tur-kembali');
    bLanjut = akar.querySelector('.tur-lanjut');
    // klik di dalam tur tidak boleh sampai ke penutup menu samping portal (portal.js)
    akar.addEventListener('click', function (e) { e.stopPropagation(); });
    akar.querySelector('.tur-tutup').addEventListener('click', function () { tutup(false); });
    akar.querySelector('.tur-lewati').addEventListener('click', function () { tutup(false); });
    bKembali.addEventListener('click', function () { if (i > 0) tampil(i - 1); });
    bLanjut.addEventListener('click', function () { if (i < langkah.length - 1) tampil(i + 1); else tutup(true); });
  }

  function cari(sel) {
    if (!sel) return null;
    var daftar;
    try { daftar = d.querySelectorAll(sel); } catch (e) { return null; }
    for (var k = 0; k < daftar.length; k++) if (terlihat(daftar[k])) return daftar[k];
    return null;
  }
  function terlihat(el) {
    if (!el || akar.contains(el)) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = w.getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }
  function dalamTetap(el) {
    for (var n = el; n && n !== d.body; n = n.parentElement) if (w.getComputedStyle(n).position === 'fixed') return true;
    return false;
  }
  function menuSamping(buka) {
    var s = d.querySelector('[data-sisi]');
    if (!s) return false;
    if (buka && !s.classList.contains('buka')) { s.classList.add('buka'); sisiDibuka = true; return true; }
    if (!buka && sisiDibuka) { s.classList.remove('buka'); sisiDibuka = false; }
    return false;
  }
  /** Tinggi kepala halaman yang menempel di atas (situs publik: .kepala) agar sorotan tidak tertutup. */
  function tepiAtas() {
    var maks = 0;
    [].forEach.call(d.querySelectorAll('.kepala, .p-kepala, body > header'), function (n) {
      var cs = w.getComputedStyle(n), r = n.getBoundingClientRect();
      if (r.height <= 0 || r.height > w.innerHeight / 3) return;
      // sticky: tinggi saat sudah menempel (bisa belum menempel bila ada pita di atasnya); fixed: posisinya sekarang
      if (cs.position === 'sticky') { var t = parseFloat(cs.top); if (!isNaN(t) && t < 40) maks = Math.max(maks, t + r.height); }
      else if (cs.position === 'fixed' && r.top <= 1) maks = Math.max(maks, r.bottom);
    });
    return maks;
  }
  function gulirKe(el) {
    if (dalamTetap(el)) { el.scrollIntoView({ block: 'nearest', behavior: gerak ? 'smooth' : 'auto' }); return; }
    var r = el.getBoundingClientRect(), tepi = tepiAtas();
    var atas = hp() ? tepi + 22 : Math.max(tepi + 28, (w.innerHeight - Math.min(r.height, w.innerHeight * 0.6)) / 2 - 90);
    var tujuan = w.pageYOffset + r.top - atas;
    if (Math.abs(r.top - atas) > 24) w.scrollTo({ top: Math.max(0, tujuan), behavior: gerak ? 'smooth' : 'auto' });
  }

  function posisikan() {
    if (!aktif) return;
    var l = langkah[i], el = l._el, r = el && terlihat(el) ? el.getBoundingClientRect() : null;
    var vw = w.innerWidth, vh = w.innerHeight, jarak = 8;
    if (r) {
      var x0 = Math.max(4, r.left - jarak), y0 = Math.max(4, r.top - jarak);
      var x1 = Math.min(vw - 4, r.right + jarak), y1 = Math.min(vh - 4, r.bottom + jarak);
      sorot.style.display = 'block';
      sorot.style.transform = 'translate(' + x0 + 'px,' + y0 + 'px)';
      sorot.style.width = Math.max(0, x1 - x0) + 'px';
      sorot.style.height = Math.max(0, y1 - y0) + 'px';
      akar.classList.remove('tur-tengah');
    } else {
      sorot.style.display = 'none';
      akar.classList.add('tur-tengah');
    }
    var tepi = tepiAtas();
    if (hp()) {
      akar.classList.add('tur-hp');
      kartu.style.left = '';
      var kh = kartu.offsetHeight;
      // kartu di bawah layar; bila menutupi sorotan, pindah ke atas (di bawah kepala halaman yang menempel)
      var keAtas = !!(r && r.bottom > vh - kh - 20 && r.top > tepi + kh + 28);
      akar.classList.toggle('tur-hp-atas', keAtas);
      kartu.style.top = keAtas ? (tepi + 10) + 'px' : '';
      return;
    }
    akar.classList.remove('tur-hp', 'tur-hp-atas');
    var kw = kartu.offsetWidth, kh2 = kartu.offsetHeight, x, y, sela = 16;
    if (!r) { x = (vw - kw) / 2; y = (vh - kh2) / 2; }
    else if (r.bottom + sela + kh2 <= vh - 12) { y = r.bottom + sela; }
    else if (r.top - sela - kh2 >= tepi + 12) { y = r.top - sela - kh2; }
    else if (r.right + sela + kw <= vw - 12) { x = r.right + sela; y = r.top; }
    else if (r.left - sela - kw >= 12) { x = r.left - sela - kw; y = r.top; }
    else { y = vh - kh2 - 12; }
    if (x === undefined) x = r ? r.left + r.width / 2 - kw / 2 : (vw - kw) / 2;
    kartu.style.left = Math.round(Math.max(12, Math.min(x, vw - kw - 12))) + 'px';
    kartu.style.top = Math.round(Math.max(tepi + 12, Math.min(y, vh - kh2 - 12))) + 'px';
  }
  function jadwal() {
    if (raf) return;
    raf = w.requestAnimationFrame(function () { raf = 0; posisikan(); });
  }

  function tampil(n) {
    i = n;
    var l = langkah[i], perluSisi = !!(l.sisi && sempit());
    var baruDibuka = perluSisi ? menuSamping(true) : (menuSamping(false), false);
    eNo.textContent = 'Langkah ' + (i + 1) + ' dari ' + langkah.length;
    eBar.style.width = Math.round(((i + 1) / langkah.length) * 100) + '%';
    isiTeks(eJudul, l.judul);
    isiTeks(eTeks, l.teks);
    eTitik.textContent = '';
    for (var k = 0; k < langkah.length; k++) { var t = d.createElement('i'); if (k === i) t.className = 'aktif'; else if (k < i) t.className = 'lewat'; eTitik.appendChild(t); }
    bKembali.disabled = i === 0;
    bLanjut.textContent = i === langkah.length - 1 ? 'Selesai ✓' : 'Lanjut →';
    eUmum.textContent = eNo.textContent + ': ' + eJudul.textContent + '. ' + eTeks.textContent;
    akar.classList.add('tur-pindah');
    w.clearTimeout(jeda);
    jeda = w.setTimeout(function () {
      l._el = cari(l.el);
      if (l._el) gulirKe(l._el);
      posisikan();
      akar.classList.remove('tur-pindah');
      jeda = w.setTimeout(posisikan, gerak ? 450 : 0);
    }, baruDibuka && gerak ? 380 : 30);
    bLanjut.focus({ preventScroll: true });
  }

  function tombol(e) {
    if (!aktif) return;
    if (e.key === 'Escape') { e.preventDefault(); tutup(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); bLanjut.click(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (i > 0) tampil(i - 1); }
    else if (e.key === 'Tab') {
      var f = [].slice.call(kartu.querySelectorAll('button:not([disabled])'));
      if (!f.length) return;
      var k = f.indexOf(d.activeElement);
      e.preventDefault();
      f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }

  function mulai(dari) {
    if (aktif) return;
    if (!akar) bangun();
    langkah = tur.langkah.filter(function (l) { return !l.hanya || (l.hanya === 'hp' ? sempit() : !sempit()); });
    if (!langkah.length) return;
    pemicu = dari || d.activeElement;
    aktif = true;
    akar.hidden = false;
    d.documentElement.classList.add('tur-aktif');
    w.requestAnimationFrame(function () { akar.classList.add('buka'); });
    w.addEventListener('scroll', jadwal, true);
    w.addEventListener('resize', jadwal);
    d.addEventListener('keydown', tombol, true);
    tampil(0);
  }

  function tutup(selesai) {
    if (!aktif) return;
    aktif = false;
    w.clearTimeout(jeda);
    akar.classList.remove('buka');
    d.documentElement.classList.remove('tur-aktif');
    w.removeEventListener('scroll', jadwal, true);
    w.removeEventListener('resize', jadwal);
    d.removeEventListener('keydown', tombol, true);
    menuSamping(false);
    w.setTimeout(function () { if (!aktif) akar.hidden = true; }, gerak ? 220 : 0);
    simpan(KUNCI, selesai ? 'selesai' : 'lewat');
    if (selesai) tandaiPaham(tur.bagian);
    tombolMulai.forEach(function (b) { b.classList.remove('baru'); });
    if (pemicu && pemicu.focus && d.contains(pemicu)) pemicu.focus({ preventScroll: true });
  }

  tombolMulai.forEach(function (b) {
    if (!baca(KUNCI)) b.classList.add('baru');
    b.addEventListener('click', function (e) { e.preventDefault(); mulai(b); });
  });
  w.YapidaTur = { mulai: mulai };

  var q = /[?&]tur=1\b/.test(w.location.search);
  if (q && w.history && w.history.replaceState) {
    var u = new URL(w.location.href);
    u.searchParams.delete('tur');
    w.history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
  }
  // tur otomatis hanya untuk orang: peramban otomatis (navigator.webdriver — uji e2e, perayap) tidak diberi tur yang menutupi halaman
  if (q || (tur.otomatis && !baca(KUNCI) && !w.navigator.webdriver)) {
    var go = function () { w.setTimeout(function () { mulai(null); }, q ? 350 : 700); };
    if (d.readyState === 'complete') go(); else w.addEventListener('load', go);
  }
})();
