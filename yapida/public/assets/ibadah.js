/* yapida.sch.id — aplikasi ibadah: jadwal sholat, kiblat, kalender hijriah, hitung mundur Ramadhan, radio Qur'an.
   Semua hitungan di perangkat pembaca. Waktu sholat: pustaka adhan (MIT). Kalender: Umm al-Qura bawaan peramban. */
(function () {
  'use strict';
  var d = document;
  var akar = d.querySelector('[data-ibadah]');
  if (!akar) return;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var simpan = { get: function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }, del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } } };
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dua = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ── lokasi ───────────────────────────────────────────── */
  var BAWAAN = { lat: Number(akar.getAttribute('data-lat')) || -6.13, lng: Number(akar.getAttribute('data-lng')) || 107.17, nama: akar.getAttribute('data-tempat') || 'Sukakarya' };
  /* Koordinat hanya disimpan di memori halaman, tidak pernah di penyimpanan peramban. Yang diingat hanyalah pilihan
     "pakai lokasi saya"; pada kunjungan berikutnya lokasi diminta lagi dari perangkat (tanpa dialog bila izinnya sudah ada). */
  var lok = null;
  simpan.del('yp-lokasi');
  var titik = function () { return lok || BAWAAN; };
  var zona = function () { return lok ? undefined : 'Asia/Jakarta'; };
  var pendengar = [];
  var gantiLokasi = function () {
    $$('[data-lokasi-nama]').forEach(function (el) { el.textContent = lok ? 'Lokasi Anda (' + lok.lat.toFixed(2) + ', ' + lok.lng.toFixed(2) + ')' : BAWAAN.nama; });
    $$('[data-lokasi-bawaan]').forEach(function (el) { el.hidden = !lok; });
    pendengar.forEach(function (f) { f(); });
  };
  $$('[data-lokasi-saya]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!navigator.geolocation) { b.textContent = 'Perangkat tidak mendukung lokasi'; return; }
      var asli = b.textContent; b.textContent = 'Mencari lokasi…'; b.disabled = true;
      navigator.geolocation.getCurrentPosition(function (p) {
        lok = { lat: p.coords.latitude, lng: p.coords.longitude }; simpan.set('yp-pakai-lokasi', true);
        b.textContent = asli; b.disabled = false; gantiLokasi();
      }, function () { b.textContent = 'Izin lokasi ditolak'; b.disabled = false; setTimeout(function () { b.textContent = asli; }, 2500); }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
    });
  });
  $$('[data-lokasi-bawaan]').forEach(function (b) { b.addEventListener('click', function () { lok = null; simpan.del('yp-pakai-lokasi'); gantiLokasi(); }); });
  if (simpan.get('yp-pakai-lokasi') === true && navigator.geolocation && navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then(function (izin) {
      if (izin.state !== 'granted') return;
      navigator.geolocation.getCurrentPosition(function (p) { lok = { lat: p.coords.latitude, lng: p.coords.longitude }; gantiLokasi(); }, function () {}, { timeout: 12000, maximumAge: 600000 });
    }, function () {});
  }

  /* ── waktu sholat ─────────────────────────────────────── */
  var URUT = [['imsak', 'Imsak'], ['subuh', 'Subuh'], ['terbit', 'Terbit'], ['dzuhur', 'Dzuhur'], ['ashar', 'Ashar'], ['maghrib', 'Maghrib'], ['isya', 'Isya']];
  var WAJIB = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
  function waktu(tgl) {
    var A = window.adhan;
    if (!A) return null;
    var p = A.CalculationMethod.Singapore();          /* Subuh 20°, Isya 18° — kriteria Kemenag RI, sama dengan ulyah.com */
    p.madhab = A.Madhab.Shafi;
    p.adjustments = { fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 };   /* ihtiyat dua menit */
    var t = new A.PrayerTimes(new A.Coordinates(titik().lat, titik().lng), tglLokasi(tgl), p);
    return { imsak: new Date(t.fajr.getTime() - 600000), subuh: t.fajr, terbit: t.sunrise, dzuhur: t.dhuhr, ashar: t.asr, maghrib: t.maghrib, isya: t.isha };
  }
  /* adhan membaca tahun-bulan-tanggal dari jam perangkat; untuk titik bawaan dipakai tanggal WIB, supaya pembaca di zona waktu lain tetap melihat hari yang benar. */
  var fTgl = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jakarta' });
  function tglLokasi(x) {
    if (lok) return x;
    var b = fTgl.format(x).split('-');
    return new Date(Number(b[0]), Number(b[1]) - 1, Number(b[2]), 12, 0, 0);
  }
  var jam = function (x) { return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zona() }).format(x).replace(':', '.'); };
  var tambahHari = function (x, n) { var y = new Date(x); y.setDate(y.getDate() + n); return y; };
  function berikut(kini) {
    var w = waktu(kini); if (!w) return null;
    for (var i = 0; i < WAJIB.length; i++) if (w[WAJIB[i]] > kini) return { k: WAJIB[i], pada: w[WAJIB[i]], sebelum: i ? w[WAJIB[i - 1]] : waktu(tambahHari(kini, -1)).isya };
    return { k: 'subuh', pada: waktu(tambahHari(kini, 1)).subuh, sebelum: w.isya };
  }
  var NAMA = { imsak: 'Imsak', subuh: 'Subuh', terbit: 'Terbit', dzuhur: 'Dzuhur', ashar: 'Ashar', maghrib: 'Maghrib', isya: 'Isya' };
  function sisa(ms) {
    var s = Math.max(0, Math.round(ms / 1000)), j = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return j ? j + ' jam ' + m + ' menit' : m ? m + ' menit ' + (s % 60) + ' detik' : (s % 60) + ' detik';
  }

  var hJadwal = $('[data-jadwal]');
  function lukisJadwal() {
    var kini = new Date(), w = waktu(kini), b = berikut(kini);
    if (!w || !b) return;
    $$('[data-hidup="sholat"]').forEach(function (el) { el.textContent = NAMA[b.k] + ' ' + jam(b.pada) + ' · ' + sisa(b.pada - kini) + ' lagi'; });
    if (!hJadwal) return;
    $('[data-sholat-nama]').textContent = NAMA[b.k];
    $('[data-sholat-jam]').textContent = jam(b.pada);
    $('[data-sholat-sisa]').textContent = sisa(b.pada - kini) + ' lagi';
    var bagian = Math.min(1, Math.max(0, (kini - b.sebelum) / (b.pada - b.sebelum)));
    $('[data-sholat-cincin]').style.strokeDashoffset = String(616 - 616 * bagian);
    /* daftar hari ini */
    var kiniK = 'isya';
    URUT.forEach(function (u) { if (w[u[0]] <= kini) kiniK = u[0]; });
    if (kini < w.imsak) kiniK = '';
    $('[data-sholat-daftar]').innerHTML = URUT.map(function (u) {
      return '<li class="' + (u[0] === kiniK ? 'kini ' : '') + (u[0] === b.k && w[u[0]] > kini ? 'berikut ' : '') + (WAJIB.indexOf(u[0]) < 0 ? 'kecil' : '') + '"><span>' + u[1] + '</span><strong>' + jam(w[u[0]]) + '</strong></li>';
    }).join('');
    /* busur matahari */
    var f = (kini - w.terbit) / (w.maghrib - w.terbit), siang = f >= 0 && f <= 1;
    var pos = function (bag) { var th = Math.PI * (1 - bag); return [300 + 230 * Math.cos(th), 262 - 230 * Math.sin(th)]; };
    var mt = $('[data-langit-matahari]'), kotak = $('[data-langit-hari]');
    if (siang) { var xy = pos(f); mt.setAttribute('transform', 'translate(' + xy[0].toFixed(1) + ' ' + xy[1].toFixed(1) + ')'); mt.style.opacity = '1'; }
    else mt.style.opacity = '0';
    $('[data-langit-jejak]').style.strokeDasharray = (siang ? (723 * f).toFixed(0) : '0') + ' 999';
    $('[data-langit-jejak]').style.opacity = siang ? '1' : '0';
    var fase = kini < w.subuh || kini > w.isya ? 'malam' : kini < w.terbit ? 'fajar' : kini > w.maghrib ? 'senja' : (w.maghrib - kini < 2700000) ? 'senja' : 'siang';
    kotak.setAttribute('data-fase', fase);
    $('[data-langit-ket]').textContent = fase === 'malam' ? 'Malam hari. Matahari terbit pukul ' + jam(kini > w.isya ? waktu(tambahHari(kini, 1)).terbit : w.terbit) + '.' : fase === 'fajar' ? 'Waktu Subuh. Matahari terbit pukul ' + jam(w.terbit) + '.' : 'Matahari terbenam pukul ' + jam(w.maghrib) + ' — ' + sisa(Math.max(0, w.maghrib - kini)) + ' lagi.';
    $('[data-langit-tanda]').innerHTML = [['terbit', 0], ['dzuhur', (w.dzuhur - w.terbit) / (w.maghrib - w.terbit)], ['ashar', (w.ashar - w.terbit) / (w.maghrib - w.terbit)], ['maghrib', 1]].map(function (t) {
      var q = pos(t[1]);
      return '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="6" class="langit-titik"/><text x="' + q[0].toFixed(1) + '" y="' + (q[1] + (t[1] === 0 || t[1] === 1 ? 30 : -16)).toFixed(1) + '" class="langit-label">' + NAMA[t[0]] + ' ' + jam(w[t[0]]) + '</text>';
    }).join('');
  }
  function lukisBulan() {
    var tb = $('[data-sholat-tabel] tbody');
    if (!tb) return;
    var kini = new Date(), baris = '', fmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: zona() });
    for (var i = 0; i < 30; i++) {
      var h = tambahHari(kini, i), w = waktu(h);
      if (!w) return;
      baris += '<tr' + (i === 0 ? ' class="kini"' : '') + '><th scope="row">' + fmt.format(h) + '</th>' + URUT.map(function (u) { return '<td>' + jam(w[u[0]]) + '</td>'; }).join('') + '</tr>';
    }
    tb.innerHTML = baris;
    var jd = $('[data-bulan-judul]'); if (jd) jd.textContent = '30 hari — ' + (lok ? 'lokasi Anda' : BAWAAN.nama);
  }
  $$('[data-bulan-cetak]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ── kiblat ───────────────────────────────────────────── */
  var KABAH = { lat: 21.4225, lng: 39.8262 }, rad = function (x) { return x * Math.PI / 180; }, deg = function (x) { return x * 180 / Math.PI; };
  function arahKiblat() {
    var p = titik(), f1 = rad(p.lat), f2 = rad(KABAH.lat), dl = rad(KABAH.lng - p.lng);
    return (deg(Math.atan2(Math.sin(dl) * Math.cos(f2), Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl))) + 360) % 360;
  }
  function jarakKabah() {
    var p = titik(), f1 = rad(p.lat), f2 = rad(KABAH.lat), a = Math.pow(Math.sin(rad(KABAH.lat - p.lat) / 2), 2) + Math.cos(f1) * Math.cos(f2) * Math.pow(Math.sin(rad(KABAH.lng - p.lng) / 2), 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  var hKiblat = $('[data-kiblat]'), hadap = null;
  function lukisKiblat() {
    var arah = arahKiblat();
    $$('[data-hidup="kiblat"]').forEach(function (el) { el.textContent = arah.toFixed(1).replace('.', ',') + '° dari utara'; });
    if (!hKiblat) return;
    $('[data-kiblat-derajat]').textContent = arah.toFixed(1).replace('.', ',') + '°';
    $('[data-kiblat-jarak]').textContent = 'Jarak ke Ka’bah ± ' + Math.round(jarakKabah()).toLocaleString('id-ID') + ' km';
    $('[data-kompas-kiblat]').setAttribute('transform', 'rotate(' + arah.toFixed(2) + ' 160 160)');
    $('[data-kompas-piringan]').style.transform = 'rotate(' + (hadap === null ? 0 : -hadap).toFixed(1) + 'deg)';
    var kompas = $('[data-kompas]');
    if (hadap !== null) {
      var selisih = Math.abs(((arah - hadap + 540) % 360) - 180), tepat = selisih < 4;
      if (tepat && !kompas.classList.contains('tepat') && navigator.vibrate) navigator.vibrate(40);
      kompas.classList.toggle('tepat', tepat);
      $('[data-kompas-status]').textContent = tepat ? 'Anda sedang menghadap kiblat.' : 'Putar badan ' + (((arah - hadap + 360) % 360) < 180 ? 'ke kanan' : 'ke kiri') + ' ' + Math.round(selisih) + '°.';
    }
  }
  if (hKiblat) {
    var garis = '';
    for (var i = 0; i < 72; i++) garis += '<line x1="160" y1="' + (i % 6 ? 40 : 34) + '" x2="160" y2="' + (i % 6 ? 46 : 50) + '" transform="rotate(' + i * 5 + ' 160 160)" class="' + (i % 6 ? 'tik' : 'tik tik-besar') + '"/>';
    $('[data-kompas-garis]').innerHTML = garis;
    var dengarArah = function (e) {
      var h = typeof e.webkitCompassHeading === 'number' ? e.webkitCompassHeading : (e.absolute && typeof e.alpha === 'number' ? 360 - e.alpha : null);
      if (h === null || isNaN(h)) return;
      hadap = (h + 360) % 360; lukisKiblat();
    };
    $('[data-kompas-aktif]').addEventListener('click', function () {
      var tb = this, pasang = function () {
        window.addEventListener('deviceorientationabsolute', dengarArah, true);
        window.addEventListener('deviceorientation', dengarArah, true);
        tb.textContent = 'Kompas aktif'; tb.disabled = true;
        setTimeout(function () { if (hadap === null) { $('[data-kompas-status]').textContent = 'Perangkat ini tidak punya sensor kompas. Gunakan sudut di atas dengan kompas biasa.'; tb.textContent = 'Kompas tidak tersedia'; } }, 3000);
      };
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') pasang(); else $('[data-kompas-status]').textContent = 'Izin sensor ditolak.'; }, function () {});
      else if (window.DeviceOrientationEvent) pasang();
      else $('[data-kompas-status]').textContent = 'Perangkat ini tidak punya sensor kompas.';
    });
  }

  /* ── hijriah ──────────────────────────────────────────── */
  var BULAN_H = ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya’ban', 'Ramadhan', 'Syawal', 'Dzulqa’dah', 'Dzulhijjah'];
  var fH = null;
  try { fH = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }); if (fH.resolvedOptions().calendar.indexOf('islamic') < 0) fH = null; } catch (e) { fH = null; }
  function hijri(x) {
    var o = { d: 0, m: 0, y: 0 };
    fH.formatToParts(x).forEach(function (p) { if (p.type === 'day') o.d = Number(p.value); if (p.type === 'month') o.m = Number(p.value); if (p.type === 'year') o.y = Number(p.value); });
    return o;
  }
  var tengahHari = function (x) { var y = new Date(x); y.setHours(12, 0, 0, 0); return y; };
  var BESAR = { '1-1': 'Tahun Baru Hijriah', '1-10': 'Hari Asyura', '3-12': 'Maulid Nabi Muhammad ﷺ', '7-27': 'Isra Mi’raj', '8-15': 'Nisfu Sya’ban', '9-1': 'Awal Ramadhan', '9-17': 'Nuzulul Qur’an', '10-1': 'Idul Fitri', '12-9': 'Hari Arafah', '12-10': 'Idul Adha' };
  function puasa(h, hari) {
    if (h.m === 9) return 'Puasa Ramadhan';
    if ((h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13)) return '';
    if (h.m === 12 && h.d === 9) return 'Puasa Arafah';
    if (h.m === 1 && h.d === 9) return 'Puasa Tasu’a';
    if (h.m === 1 && h.d === 10) return 'Puasa Asyura';
    if (h.d >= 13 && h.d <= 15) return 'Puasa Ayyamul Bidh';
    if (hari === 1) return 'Puasa sunnah Senin';
    if (hari === 4) return 'Puasa sunnah Kamis';
    return '';
  }
  var fPanjang = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  function ramadhanBerikut(dari) {
    var x = tengahHari(dari);
    for (var i = 0; i < 400; i++) { var h = hijri(x); if (h.m === 9 && h.d === 1) return x; x = tambahHari(x, 1); }
    return null;
  }
  function lukisRamadhan() {
    if (!fH) return;
    var kini = new Date(), h = hijri(kini), target, judul, kicker;
    if (h.m === 9) {
      var x = tengahHari(kini); while (hijri(x).m === 9) x = tambahHari(x, 1);
      target = x; kicker = 'Ramadhan ' + h.y + ' H · hari ke-' + h.d; judul = 'Menuju Idul Fitri';
    } else { target = ramadhanBerikut(kini); if (!target) return; kicker = 'Menuju Ramadhan ' + hijri(target).y + ' H'; judul = 'Hitung mundur 1 Ramadhan'; }
    var awal = new Date(target); awal.setHours(0, 0, 0, 0);
    var ms = Math.max(0, awal - kini), hari = Math.floor(ms / 86400000);
    $$('[data-hidup="ramadhan"]').forEach(function (el) { el.textContent = h.m === 9 ? 'Ramadhan hari ke-' + h.d : hari + ' hari lagi'; });
    $$('[data-ramadhan]').forEach(function (k) {
      $('[data-ramadhan-kicker]', k).textContent = kicker; $('[data-ramadhan-judul]', k).textContent = judul;
      $('[data-ramadhan-ket]', k).textContent = 'Perkiraan: ' + fPanjang.format(awal) + ' (kalender Umm al-Qura). Penetapan resmi mengikuti sidang isbat Kementerian Agama.';
      $('[data-ramadhan-hari]', k).textContent = String(hari); $('[data-ramadhan-jam]', k).textContent = dua(Math.floor(ms % 86400000 / 3600000));
      $('[data-ramadhan-menit]', k).textContent = dua(Math.floor(ms % 3600000 / 60000)); $('[data-ramadhan-detik]', k).textContent = dua(Math.floor(ms % 60000 / 1000));
    });
  }
  function lukisHijriHidup() {
    if (!fH) return;
    var h = hijri(new Date());
    $$('[data-hidup="hijri"]').forEach(function (el) { el.textContent = h.d + ' ' + BULAN_H[h.m - 1] + ' ' + h.y + ' H'; });
  }
  var hKal = $('[data-kalender]');
  if (hKal && fH) {
    var awalBulan = function (x) { return tambahHari(tengahHari(x), -(hijri(x).d - 1)); };
    var tampil = awalBulan(new Date()), kunciKini = (function () { var h = hijri(new Date()); return h.y + '-' + h.m + '-' + h.d; })();
    var fPendek = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }), fBulan = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
    var lukisKal = function () {
      var h0 = hijri(tampil), sel = '', x = new Date(tampil), akhir;
      for (var k = 0; k < tampil.getDay(); k++) sel += '<span class="kal-sel kal-kosong"></span>';
      for (var n = 0; n < 31; n++) {
        var h = hijri(x); if (h.m !== h0.m) break;
        var besar = BESAR[h.m + '-' + h.d] || '', ps = puasa(h, x.getDay()), kunci = h.y + '-' + h.m + '-' + h.d;
        var ket = fPanjang.format(x) + ' · ' + h.d + ' ' + BULAN_H[h.m - 1] + ' ' + h.y + ' H' + (besar ? ' — ' + besar : '') + (ps ? ' — ' + ps : '');
        sel += '<button type="button" role="gridcell" class="kal-sel' + (besar ? ' kal-besar' : '') + (ps ? ' kal-puasa' : '') + (kunci === kunciKini ? ' kal-kini' : '') + '" data-ket="' + ket.replace(/"/g, '&quot;') + '"><b>' + h.d + '</b><i>' + fPendek.format(x) + '</i>' + (besar ? '<em>' + besar + '</em>' : '') + '</button>';
        akhir = new Date(x); x = tambahHari(x, 1);
      }
      $('[data-kal-kisi]').innerHTML = sel;
      $('[data-kal-judul]').textContent = BULAN_H[h0.m - 1] + ' ' + h0.y + ' H';
      $('[data-kal-masehi]').textContent = fBulan.format(tampil) + (akhir && akhir.getMonth() !== tampil.getMonth() ? ' – ' + fBulan.format(akhir) : '');
      var kiniSel = $('.kal-kini', hKal); $('[data-kal-detail]').textContent = kiniSel ? kiniSel.getAttribute('data-ket') : 'Ketuk tanggal untuk melihat keterangannya.';
    };
    $('[data-kal-kisi]').addEventListener('click', function (e) { var b = e.target.closest('.kal-sel[data-ket]'); if (!b) return; $$('.kal-pilih', hKal).forEach(function (y) { y.classList.remove('kal-pilih'); }); b.classList.add('kal-pilih'); $('[data-kal-detail]').textContent = b.getAttribute('data-ket'); });
    $('[data-kal-maju]').addEventListener('click', function () { var x = new Date(tampil), m = hijri(x).m; while (hijri(x).m === m) x = tambahHari(x, 1); tampil = x; lukisKal(); });
    $('[data-kal-mundur]').addEventListener('click', function () { tampil = awalBulan(tambahHari(tampil, -1)); lukisKal(); });
    $('[data-kal-kini]').addEventListener('click', function () { tampil = awalBulan(new Date()); lukisKal(); });
    lukisKal();
    var daftar = '', y = tengahHari(new Date()), kiniMs = new Date().setHours(0, 0, 0, 0), ketemu = 0;
    for (var j = 0; j < 380 && ketemu < 6; j++) {
      var hh = hijri(y), nm = BESAR[hh.m + '-' + hh.d];
      if (nm) { var lagi = Math.round((new Date(y).setHours(0, 0, 0, 0) - kiniMs) / 86400000); daftar += '<li><strong>' + nm + '</strong><span>' + hh.d + ' ' + BULAN_H[hh.m - 1] + ' ' + hh.y + ' H · ' + fPanjang.format(y) + '</span><b>' + (lagi === 0 ? 'hari ini' : lagi + ' hari lagi') + '</b></li>'; ketemu++; }
      y = tambahHari(y, 1);
    }
    $('[data-kal-besar]').innerHTML = daftar;
  } else if (hKal) $('[data-kal-detail]').textContent = 'Peramban ini tidak menyediakan kalender hijriah.';

  /* Radio Qur'an LIVE ada di radio.js (dipakai di seluruh situs). */

  /* ── jalan ────────────────────────────────────────────── */
  pendengar.push(function () { lukisJadwal(); lukisBulan(); lukisKiblat(); });
  gantiLokasi();
  lukisRamadhan(); lukisHijriHidup();
  setInterval(function () { lukisJadwal(); lukisRamadhan(); }, 1000);
})();
