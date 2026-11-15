/* yapida.sch.id — Radio Qur'an LIVE 24 jam (§5c). Siaran ditentukan server; peramban hanya ikut mendengarkan pada posisi
   yang sama dengan semua pendengar. Tidak ada pilihan surah/qari — hanya nyala/mati di perangkat ini (tersimpan di sini).
   Pemberitahuan siapa yang membaca: pita di halaman, layar kunci (Media Session), dan notifikasi bila diizinkan. */
(function () {
  'use strict';
  var d = document;
  var KUNCI = 'yp-radio-nyala';
  var baca = function () { try { return localStorage.getItem(KUNCI); } catch (e) { return null; } };
  var tulis = function (v) { try { localStorage.setItem(KUNCI, v); } catch (e) { /* abaikan */ } };
  // Bawaan: menyala (pemilik: „pastiin hidup 24 jam … tp bisa di matikan di device masing2“).
  var nyala = baca() !== '0';
  var live = d.querySelector('[data-radio-live]');
  // Halaman yang punya suaranya sendiri (murottal per ayat, pembaca buku) tidak memutar radio otomatis.
  var audioLain = Boolean(d.querySelector('[data-q-surah],[data-mushaf],[data-baca]'));
  var audio = new Audio();
  audio.preload = 'none';
  var info = null, selisih = 0, timer = 0, terhalang = false;
  var menit = function (s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + '.' + ('0' + (s % 60)).slice(-2); };
  var posisi = function () { return info ? (Date.now() + selisih - info.mulai) / 1000 : 0; };

  /* ── pemutar mini ── */
  var rm = null, rmJudul, rmKet, rmTbl;
  if (!live) {
    rm = d.createElement('div'); rm.className = 'rm'; rm.hidden = true; rm.setAttribute('role', 'region'); rm.setAttribute('aria-label', 'Radio Qur’an LIVE');
    var lencana = d.createElement('span'); lencana.className = 'rm-live'; lencana.textContent = 'LIVE';
    var teks = d.createElement('a'); teks.className = 'rm-teks'; teks.href = '/radio-quran';
    rmJudul = d.createElement('b'); rmKet = d.createElement('small'); teks.appendChild(rmJudul); teks.appendChild(rmKet);
    rmTbl = d.createElement('button'); rmTbl.type = 'button'; rmTbl.className = 'rm-tbl';
    rm.appendChild(lencana); rm.appendChild(teks); rm.appendChild(rmTbl);
    d.body.appendChild(rm);
    rmTbl.addEventListener('click', function () { atur(!nyala || terhalang || audio.paused); });
  }
  var kabar = d.createElement('div'); kabar.className = 'rm-kabar'; kabar.setAttribute('role', 'status'); kabar.setAttribute('aria-live', 'polite'); d.body.appendChild(kabar);
  var kabarTimer = 0;
  function umumkan(t) { kabar.textContent = t; kabar.classList.add('tampil'); clearTimeout(kabarTimer); kabarTimer = setTimeout(function () { kabar.classList.remove('tampil'); }, 6500); }

  /* ── halaman LIVE ── */
  var L = {};
  if (live) ['status', 'surah-ar', 'surah', 'qari', 'qari-ar', 'kini', 'lama', 'bilah', 'nyala', 'nyala-label', 'khatam', 'putaran', 'surah-ke', 'berikut'].forEach(function (k) { L[k] = live.querySelector('[data-rl-' + k + ']'); });
  var piring = live && live.querySelector('[data-radio-piring]');
  if (L.nyala) L.nyala.addEventListener('click', function () { atur(!nyala || terhalang || audio.paused); });

  function lukis() {
    var main = nyala && !audio.paused && !terhalang;
    if (rm) {
      rm.hidden = !info;
      rm.classList.toggle('main', main); rm.classList.toggle('mati', !nyala);
      if (info) { rmJudul.textContent = info.surah.lt + ' · ' + info.qari.nama; rmKet.textContent = 'Radio Qur’an LIVE · khatam ke-' + (info.khatam + 1) + ' sedang berjalan'; }
      rmTbl.textContent = !nyala ? '📻' : terhalang || audio.paused ? '▶' : '❚❚';
      rmTbl.setAttribute('aria-label', !nyala ? 'Nyalakan radio di perangkat ini' : terhalang || audio.paused ? 'Dengarkan radio LIVE' : 'Matikan radio di perangkat ini');
    }
    if (live && info) {
      L['surah-ar'].textContent = info.surah.ar; L.surah.textContent = 'Surah ' + info.surah.lt + (info.surah.arti ? ' — ' + info.surah.arti : '');
      L.qari.textContent = info.qari.nama; L['qari-ar'].textContent = info.qari.namaAr || '';
      L.khatam.textContent = String(info.khatam); L.putaran.textContent = String(info.putaran); L['surah-ke'].textContent = String(info.surah.n);
      L.berikut.textContent = info.berikut ? info.berikut.surah.lt : '—';
      L.status.textContent = main ? 'Sedang mengudara · ' + (info.jumlahQari || 'puluhan') + ' qari dunia bergiliran' : !nyala ? 'Radio dimatikan di perangkat ini — siaran tetap berjalan' : 'Siaran berjalan — ketuk untuk mendengarkan';
      L.nyala.setAttribute('aria-pressed', String(main));
      L['nyala-label'].textContent = main ? 'Matikan di perangkat ini' : 'Dengarkan LIVE';
      L.nyala.firstElementChild.textContent = main ? '■' : '▶';
      if (piring) piring.classList.toggle('putar', main);
    }
  }
  function detik() {
    if (!live || !info) return;
    var p = Math.min(info.durasi, posisi());
    L.kini.textContent = menit(p); L.lama.textContent = menit(info.durasi);
    L.bilah.style.width = (info.durasi ? Math.min(100, (p / info.durasi) * 100) : 0) + '%';
  }

  function mediaSesi() {
    if (!('mediaSession' in navigator) || !info) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: 'Surah ' + info.surah.lt + ' — LIVE', artist: info.qari.nama, album: 'Radio Qur’an Yapida 24 jam', artwork: [{ src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }] });
      navigator.mediaSession.setActionHandler('play', function () { atur(true); });
      navigator.mediaSession.setActionHandler('pause', function () { atur(false); });
      ['seekbackward', 'seekforward', 'seekto', 'previoustrack', 'nexttrack'].forEach(function (a) { try { navigator.mediaSession.setActionHandler(a, null); } catch (e) { /* abaikan */ } });
    } catch (e) { /* abaikan */ }
  }
  function beriTahu(j) {
    var t = 'Kini dibacakan: Surah ' + j.surah.lt + ' oleh ' + j.qari.nama;
    umumkan(t);
    if (nyala && d.hidden && window.Notification && Notification.permission === 'granted' && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(function (reg) { reg.showNotification('Radio Qur’an LIVE', { body: 'Surah ' + j.surah.lt + ' — ' + j.qari.nama, tag: 'yp-radio', silent: true, icon: '/assets/icon-192.png', badge: '/assets/icon-192.png', data: { url: '/radio-quran' } }); }).catch(function () {});
    }
  }

  function mainkan() {
    if (!info || !nyala) return;
    if (audioLain && !live && !mainkan.diminta) return;
    if (posisi() > info.durasi + 1) { segarkan(); return; }
    if (audio.src !== info.url) { audio.src = info.url; audio.preload = 'auto'; }
    var setel = function () { try { audio.currentTime = Math.max(0, Math.min(info.durasi - 1, posisi())); } catch (e) { /* abaikan */ } };
    if (audio.readyState >= 1) setel(); else audio.addEventListener('loadedmetadata', setel, { once: true });
    audio.play().then(function () { terhalang = false; lukis(); }).catch(function () { terhalang = true; lukis(); });
  }
  function atur(v) {
    nyala = v; tulis(v ? '1' : '0');
    if (v) { mainkan.diminta = true; terhalang = false; mainkan(); } else { audio.pause(); }
    lukis();
  }
  function pasang(j) {
    if (!j || !j.live) { timer = setTimeout(segarkan, 20000); return; }
    var baru = !info || info.url !== j.url || info.mulai !== j.mulai;
    info = j;
    if (baru) { mediaSesi(); if (rm || live) { if (pasang.sudah) beriTahu(j); } }
    pasang.sudah = true;
    lukis(); detik();
    if (nyala && (baru || audio.paused)) mainkan();
    clearTimeout(timer);
    var sisa = info.mulai + info.durasi * 1000 + 2800 - (Date.now() + selisih);
    timer = setTimeout(segarkan, Math.max(2000, Math.min(sisa, 5 * 60000)));
  }
  function segarkan() {
    var t0 = Date.now();
    fetch('/api/radio', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      var t1 = Date.now();
      if (j && j.sekarang) selisih = j.sekarang - (t0 + t1) / 2;
      pasang(j);
    }).catch(function () { clearTimeout(timer); timer = setTimeout(segarkan, 15000); });
  }
  audio.addEventListener('ended', function () { segarkan(); });
  audio.addEventListener('play', lukis);
  audio.addEventListener('pause', lukis);
  // Koreksi geser: bila tertinggal/terdepan lebih dari 4 detik dari siaran, posisinya disamakan lagi.
  setInterval(function () {
    detik();
    if (info && nyala && !audio.paused && Math.abs(audio.currentTime - posisi()) > 4 && posisi() < info.durasi) { try { audio.currentTime = posisi(); } catch (e) { /* abaikan */ } }
  }, 1000);
  // Suara lain di halaman (murottal per ayat, pembaca buku) menghentikan radio sementara.
  window.addEventListener('yp:audio-lain', function () { if (!audio.paused) audio.pause(); });
  d.addEventListener('visibilitychange', function () { if (!d.hidden && info && posisi() > info.durasi) segarkan(); });
  segarkan();
})();
