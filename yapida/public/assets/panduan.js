/* yapida.sch.id — halaman /portal/panduan: cari, saring kelompok, langkah satu per satu, lingkaran kemajuan.
   Kemajuan „sudah dipelajari“ tersimpan di perangkat (localStorage yp-pd-paham) — juga diisi tur.js saat tur selesai. */
(function () {
  'use strict';
  var d = document, w = window;
  var akar = d.querySelector('[data-pd]');
  if (!akar) return;
  var kartu = [].slice.call(akar.querySelectorAll('[data-pd-kartu]'));
  var cari = akar.querySelector('[data-pd-cari]');
  var tombolKat = [].slice.call(akar.querySelectorAll('[data-pd-kat]'));
  var hasil = akar.querySelector('[data-pd-hasil]');
  var kosong = akar.querySelector('[data-pd-kosong]');
  var kat = '';

  var baca = function () { try { var a = JSON.parse(w.localStorage.getItem('yp-pd-paham') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  var simpan = function (a) { try { w.localStorage.setItem('yp-pd-paham', JSON.stringify(a)); } catch (e) { /* tidak tersedia */ } };

  function segarKemajuan() {
    var paham = baca(), n = 0;
    kartu.forEach(function (k) {
      var ok = paham.indexOf(k.id) >= 0;
      if (ok) n++;
      k.classList.toggle('paham', ok);
      var c = k.querySelector('[data-pd-centang]');
      if (c) c.hidden = !ok;
    });
    var angka = akar.querySelector('[data-pd-paham]');
    if (angka) angka.textContent = String(n);
    var isi = akar.querySelector('[data-pd-cincin-isi]');
    if (isi) { isi.setAttribute('stroke-dasharray', (kartu.length ? Math.round((n / kartu.length) * 100) : 0) + ' 100'); isi.style.opacity = n ? '1' : '0'; }
    var cincin = akar.querySelector('[data-pd-cincin]');
    if (cincin) cincin.setAttribute('aria-label', n + ' dari ' + kartu.length + ' menu sudah dipelajari');
  }
  function tandai(id) {
    var a = baca();
    if (a.indexOf(id) < 0) { a.push(id); simpan(a); }
    segarKemajuan();
  }

  function saring() {
    var q = (cari && cari.value || '').trim().toLowerCase(), n = 0;
    kartu.forEach(function (k) {
      var ok = (!kat || k.getAttribute('data-kat') === kat) && (!q || (k.getAttribute('data-cari') || '').indexOf(q) >= 0);
      k.hidden = !ok;
      if (ok) n++;
    });
    if (kosong) kosong.hidden = n > 0;
    if (hasil) hasil.textContent = q || kat ? n + ' panduan cocok' : '';
  }
  if (cari) cari.addEventListener('input', saring);
  tombolKat.forEach(function (b) {
    b.addEventListener('click', function () {
      kat = b.getAttribute('data-pd-kat') || '';
      tombolKat.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      saring();
    });
  });

  /* langkah satu per satu: <details> berisi semua langkah (tetap terbaca tanpa JavaScript); dengan JavaScript tampil satu-satu */
  kartu.forEach(function (k) {
    var det = k.querySelector('[data-pd-detail]');
    var ol = k.querySelector('[data-pd-ol]');
    var li = [].slice.call(k.querySelectorAll('[data-pd-li]'));
    var nav = k.querySelector('[data-pd-nav]');
    if (!det || !ol || !li.length || !nav) return;
    var bK = nav.querySelector('[data-pd-k]'), bL = nav.querySelector('[data-pd-l]'), no = nav.querySelector('[data-pd-no]');
    var i = 0;
    ol.classList.add('pd-satu');
    nav.hidden = false;
    function tampil(n) {
      i = n;
      li.forEach(function (x, j) { x.classList.toggle('aktif', j === i); x.classList.toggle('lewat', j < i); });
      no.textContent = 'Langkah ' + (i + 1) + ' dari ' + li.length;
      bK.disabled = i === 0;
      bL.textContent = i === li.length - 1 ? '✓ Saya paham' : 'Berikutnya →';
    }
    bK.addEventListener('click', function () { if (i > 0) tampil(i - 1); });
    bL.addEventListener('click', function () {
      if (i < li.length - 1) { tampil(i + 1); return; }
      tandai(k.id);
      k.classList.add('baru-paham');
      w.setTimeout(function () { k.classList.remove('baru-paham'); }, 1200);
      bL.textContent = '✓ Sudah dipelajari';
    });
    det.addEventListener('toggle', function () { if (det.open) tampil(0); });
    tampil(0);
  });

  /* #bank-soal (tombol ? di halaman portal) → buka kartunya */
  function bukaHash() {
    var id = decodeURIComponent(w.location.hash.slice(1));
    if (!id) return;
    var k = d.getElementById(id);
    if (!k || kartu.indexOf(k) < 0) return;
    if (k.hidden) { kat = ''; tombolKat.forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-pd-kat') === '' ? 'true' : 'false'); }); if (cari) cari.value = ''; saring(); }
    var det = k.querySelector('[data-pd-detail]');
    if (det) det.open = true;
    k.classList.add('sorot');
    w.setTimeout(function () { k.classList.remove('sorot'); }, 2200);
    k.scrollIntoView({ block: 'start', behavior: w.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  w.addEventListener('hashchange', bukaHash);
  w.addEventListener('storage', function (e) { if (e.key === 'yp-pd-paham') segarKemajuan(); });
  segarKemajuan();
  saring();
  bukaHash();
})();
