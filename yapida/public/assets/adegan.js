/* yapida.sch.id — adegan interaktif di dalam buku (§5, perintah pemilik: „punya animasi2 yg berkaitan dengan tema dan halaman
   yg d baca … bisa di mainkan atau di tarik di putar2 tp bisa kembali ke asalnya jika di klik tombol tertentu“).
   Setiap adegan adalah SVG yang dirakit di sini (tanpa berkas gambar, tanpa makhluk bernyawa): benda bisa diseret, diketuk
   dua kali untuk diputar, dan tombol „↺ Kembalikan“ mengembalikan semuanya ke tempat asal dengan animasi.
   Adegan: padi, hujan, langit, masjid, kebun, buah, laut, gurun, gunung, rumah, sholat, huruf. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var d = document;
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function s(tag, at, induk) {
    var e = d.createElementNS(NS, tag);
    for (var k in at) if (Object.prototype.hasOwnProperty.call(at, k)) e.setAttribute(k, String(at[k]));
    if (induk) induk.appendChild(e);
    return e;
  }
  function teks(induk, x, y, t, at) { var e = s('text', Object.assign({ x: x, y: y, 'text-anchor': 'middle', class: 'ad-teks' }, at || {}), induk); e.textContent = t; return e; }
  function ucap(t, lang) {
    if (!window.speechSynthesis || !t) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = lang || 'id-ID'; u.rate = 0.9; u.pitch = 1.15; speechSynthesis.speak(u); } catch (e) { /* abaikan */ }
  }
  function bunyi(f) {
    try {
      var ac = bunyi.ac = bunyi.ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = 'triangle'; o.frequency.value = f || 660; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.3);
    } catch (e) { /* abaikan */ }
  }
  var ANGKA_ID = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];

  /* ── benda yang bisa diseret & diputar ── */
  function geser(svg, el, o) {
    o = o || {};
    el.classList.add('ad-seret');
    el.__p = { x: 0, y: 0, r: 0 };
    var mulai = null;
    var titik = function (e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    var tulis = function () { el.style.transform = 'translate(' + el.__p.x + 'px,' + el.__p.y + 'px) rotate(' + el.__p.r + 'deg)'; };
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
      var t = titik(e); mulai = { x: t.x - el.__p.x, y: t.y - el.__p.y, wx: t.x, wy: t.y }; el.classList.add('ad-pegang'); el.style.transition = 'none';
    });
    el.addEventListener('pointermove', function (e) { if (!mulai) return; var t = titik(e); el.__p.x = t.x - mulai.x; el.__p.y = t.y - mulai.y; tulis(); if (o.saatGeser) o.saatGeser(el, t); });
    var lepas = function (e) {
      if (!mulai) return;
      var t = titik(e), jarak = Math.hypot(t.x - mulai.wx, t.y - mulai.wy);
      mulai = null; el.classList.remove('ad-pegang'); el.style.transition = '';
      if (jarak < 4 && o.saatKetuk) o.saatKetuk(el);
      if (o.saatLepas) o.saatLepas(el, t);
    };
    el.addEventListener('pointerup', lepas); el.addEventListener('pointercancel', lepas);
    el.addEventListener('dblclick', function (e) { e.preventDefault(); el.__p.r += 45; tulis(); bunyi(520); });
    el.addEventListener('wheel', function (e) { e.preventDefault(); el.__p.r += e.deltaY > 0 ? 15 : -15; tulis(); }, { passive: false });
    el.__reset = function () { el.__p = { x: 0, y: 0, r: 0 }; el.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)'; tulis(); };
    return el;
  }

  /* ── unsur gambar ── */
  function langit(g, a, b) { var id = 'lg' + Math.random().toString(36).slice(2, 7); var df = s('defs', {}, g); var lg = s('linearGradient', { id: id, x1: 0, y1: 0, x2: 0, y2: 1 }, df); s('stop', { offset: 0, 'stop-color': a }, lg); s('stop', { offset: 1, 'stop-color': b }, lg); return s('rect', { x: 0, y: 0, width: 400, height: 240, fill: 'url(#' + id + ')' }, g); }
  function matahari(g, x, y) { var m = s('g', { class: 'ad-matahari' }, g); var sinar = s('g', { class: 'ad-sinar' }, m); for (var i = 0; i < 12; i += 1) { var a = i * Math.PI / 6; s('line', { x1: x + Math.cos(a) * 24, y1: y + Math.sin(a) * 24, x2: x + Math.cos(a) * 34, y2: y + Math.sin(a) * 34, stroke: '#f6b93b', 'stroke-width': 4, 'stroke-linecap': 'round' }, sinar); } s('circle', { cx: x, cy: y, r: 19, fill: '#fcd34d', stroke: '#f59e0b', 'stroke-width': 3 }, m); return m; }
  function awan(g, x, y, k) { k = k || 1; var a = s('g', { class: 'ad-awan' }, g); [[0, 0, 22], [22, -8, 18], [40, 2, 16], [18, 8, 18]].forEach(function (c) { s('circle', { cx: x + c[0] * k, cy: y + c[1] * k, r: c[2] * k, fill: '#ffffff' }, a); }); return a; }
  function bintang(g, x, y, r) { var p = []; for (var i = 0; i < 10; i += 1) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push((x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1)); } return s('polygon', { points: p.join(' '), fill: '#fde68a', class: 'ad-kerlip' }, g); }

  /* ── adegan ── */
  var ADEGAN = {
    padi: function (svg, ui) {
      var TAHAP = ['Benih padi direndam', 'Persemaian: benih berkecambah', 'Bibit ditanam di sawah', 'Padi tumbuh hijau', 'Padi berbunga dan bunting', 'Padi menguning, bulirnya berisi', 'Panen! Alhamdulillah'];
      langit(svg, '#bfe7ff', '#eaf8ff');
      geser(svg, matahari(svg, 345, 42));
      geser(svg, awan(svg, 60, 38)); geser(svg, awan(svg, 180, 28, 0.8));
      s('path', { d: 'M0 150 Q100 135 200 150 T400 148 V240 H0Z', fill: '#7cc576' }, svg);
      s('rect', { x: 20, y: 160, width: 300, height: 70, rx: 10, fill: '#8d6e4a', class: 'ad-sasaran' }, svg);
      s('rect', { x: 20, y: 160, width: 300, height: 14, rx: 6, fill: '#6fb3d9', opacity: 0.55 }, svg);
      var tanaman = s('g', {}, svg), tahap = 0;
      var label = teks(svg, 170, 152, TAHAP[0], { class: 'ad-label' });
      function lukis() {
        while (tanaman.firstChild) tanaman.removeChild(tanaman.firstChild);
        for (var i = 0; i < 6; i += 1) {
          var x = 50 + i * 48, dasar = 205;
          if (tahap === 0) { for (var j = 0; j < 4; j += 1) s('ellipse', { cx: x - 6 + j * 4, cy: dasar, rx: 2.2, ry: 1.4, fill: '#e3c16f' }, tanaman); continue; }
          if (tahap === 6) { s('path', { d: 'M' + (x - 8) + ' ' + dasar + ' l3 -10 M' + x + ' ' + dasar + ' l0 -12 M' + (x + 8) + ' ' + dasar + ' l-3 -10', stroke: '#c9a227', 'stroke-width': 3, 'stroke-linecap': 'round' }, tanaman); continue; }
          var tinggi = [0, 12, 24, 44, 58, 62][tahap], warna = tahap >= 5 ? '#d4a017' : '#2f9e44';
          for (var k = -1; k <= 1; k += 1) s('path', { d: 'M' + x + ' ' + dasar + ' Q' + (x + k * 10) + ' ' + (dasar - tinggi * 0.6) + ' ' + (x + k * 14) + ' ' + (dasar - tinggi), stroke: warna, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', class: 'ad-goyang' }, tanaman);
          if (tahap >= 4) for (var m = 0; m < 5; m += 1) s('ellipse', { cx: x + 12 + (tahap >= 5 ? 4 : 0), cy: dasar - tinggi + 6 + m * 5, rx: 3, ry: 2, fill: tahap >= 5 ? '#f2c94c' : '#9ad48f' }, tanaman);
        }
        if (tahap === 6) { [[250, 214], [282, 216]].forEach(function (k) { s('path', { d: 'M' + (k[0] - 12) + ' ' + (k[1] + 12) + ' Q' + k[0] + ' ' + (k[1] - 22) + ' ' + (k[0] + 12) + ' ' + (k[1] + 12) + 'Z', fill: '#d9b98a', stroke: '#8d6e4a', 'stroke-width': 2 }, tanaman); teks(tanaman, k[0], k[1] + 6, 'beras', { class: 'ad-mini' }); }); }
        label.textContent = (tahap + 1) + '. ' + TAHAP[tahap];
        ui.status(TAHAP[tahap]);
      }
      function siram() {
        if (tahap >= 6) return;
        var hujan = s('g', {}, svg);
        for (var i = 0; i < 14; i += 1) s('line', { x1: 40 + i * 20, y1: 150, x2: 36 + i * 20, y2: 162, stroke: '#4aa3df', 'stroke-width': 2.5, 'stroke-linecap': 'round', class: 'ad-tetes', style: 'animation-delay:' + (i % 5) * 0.08 + 's' }, hujan);
        setTimeout(function () { hujan.remove(); tahap = Math.min(6, tahap + 1); lukis(); bunyi(tahap === 6 ? 990 : 700); ucap(TAHAP[tahap]); }, tenang ? 50 : 650);
      }
      var gembor = s('g', {}, svg);
      s('path', { d: 'M350 190 h28 v24 h-28z', fill: '#3b82f6', rx: 3 }, gembor);
      s('path', { d: 'M350 196 l-22 -12 l3 -4 l21 10', fill: '#60a5fa' }, gembor);
      s('path', { d: 'M378 194 q12 2 10 14 q-2 6 -10 4', fill: 'none', stroke: '#1d4ed8', 'stroke-width': 3 }, gembor);
      teks(gembor, 364, 232, 'seret ke sawah', { class: 'ad-mini' });
      geser(svg, gembor, { saatLepas: function (el, t) { if (t.x >= 20 && t.x <= 320 && t.y >= 140 && t.y <= 235) siram(); el.__reset(); } });
      ui.tombol('💧 Siram', siram);
      ui.reset(function () { tahap = 0; lukis(); });
      lukis();
    },
    hujan: function (svg, ui) {
      langit(svg, '#a5d8ff', '#e7f5ff');
      var mth = geser(svg, matahari(svg, 60, 45));
      s('path', { d: 'M230 240 L300 110 L340 160 L370 120 L400 170 V240Z', fill: '#6b8f71' }, svg);
      s('path', { d: 'M0 190 Q60 180 120 192 T240 190 V240 H0Z', fill: '#4aa3df', class: 'ad-ombak' }, svg);
      s('path', { d: 'M300 150 Q270 190 230 200 Q180 210 140 205', fill: 'none', stroke: '#4aa3df', 'stroke-width': 6, 'stroke-linecap': 'round', class: 'ad-alir' }, svg);
      var awn = geser(svg, awan(svg, 230, 60, 1.1), { saatKetuk: function () { turun(); } });
      var uap = s('g', {}, svg), rintik = s('g', {}, svg);
      var LANGKAH = ['Penguapan: matahari memanaskan air laut menjadi uap', 'Pengembunan: uap air berkumpul menjadi awan', 'Hujan: awan menurunkan air ke bumi', 'Air mengalir lewat sungai kembali ke laut'];
      var lab = teks(svg, 200, 20, 'Ketuk matahari, lalu ketuk awan', { class: 'ad-label' });
      function uapkan() { while (uap.firstChild) uap.removeChild(uap.firstChild); for (var i = 0; i < 8; i += 1) s('circle', { cx: 30 + i * 25, cy: 185, r: 3, fill: '#ffffff', class: 'ad-naik', style: 'animation-delay:' + i * 0.15 + 's' }, uap); lab.textContent = LANGKAH[0]; ucap(LANGKAH[0]); setTimeout(function () { awn.querySelectorAll('circle').forEach(function (c) { c.setAttribute('fill', '#cfd8e3'); }); lab.textContent = LANGKAH[1]; }, 1800); }
      function turun() { while (rintik.firstChild) rintik.removeChild(rintik.firstChild); var dx = awn.__p.x, dy = awn.__p.y; for (var i = 0; i < 16; i += 1) s('line', { x1: 220 + dx + (i % 8) * 9, y1: 80 + dy, x2: 216 + dx + (i % 8) * 9, y2: 92 + dy, stroke: '#3b82f6', 'stroke-width': 2.5, 'stroke-linecap': 'round', class: 'ad-jatuh', style: 'animation-delay:' + (i * 0.07) + 's' }, rintik); lab.textContent = LANGKAH[2]; ucap(LANGKAH[2]); setTimeout(function () { lab.textContent = LANGKAH[3]; }, 2200); }
      mth.addEventListener('click', uapkan);
      ui.tombol('☀️ Uapkan', uapkan); ui.tombol('🌧️ Hujan', turun);
      ui.reset(function () { while (uap.firstChild) uap.removeChild(uap.firstChild); while (rintik.firstChild) rintik.removeChild(rintik.firstChild); awn.querySelectorAll('circle').forEach(function (c) { c.setAttribute('fill', '#ffffff'); }); lab.textContent = 'Ketuk matahari, lalu ketuk awan'; });
    },
    langit: function (svg, ui) {
      var bg = s('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#87ceeb' }, svg);
      var bintangG = s('g', { opacity: 0 }, svg); for (var i = 0; i < 16; i += 1) geser(svg, bintang(bintangG, 20 + (i * 53) % 370, 20 + (i * 37) % 110, 4 + (i % 3)));
      var mth = matahari(svg, 0, 0), bln = s('g', {}, svg);
      s('circle', { cx: 0, cy: 0, r: 16, fill: '#fef3c7' }, bln); s('circle', { cx: 7, cy: -4, r: 14, fill: '#87ceeb', class: 'ad-bayang' }, bln);
      s('path', { d: 'M0 200 Q100 185 200 200 T400 195 V240 H0Z', fill: '#3f7d4e' }, svg);
      var lab = teks(svg, 200, 228, '', { class: 'ad-label ad-terang' });
      function jam(h) {
        var t = (h - 6) / 12, a = Math.PI * (1 - t);
        mth.setAttribute('transform', 'translate(' + (200 + Math.cos(a) * 170) + ' ' + (200 - Math.sin(a) * 160) + ')');
        var tm = ((h + 12) % 24 - 6) / 12, b = Math.PI * (1 - tm);
        bln.setAttribute('transform', 'translate(' + (200 + Math.cos(b) * 170) + ' ' + (200 - Math.sin(b) * 160) + ')');
        var siang = h >= 6 && h <= 18, senja = (h > 5 && h < 7) || (h > 17 && h < 19);
        var warna = senja ? '#f4a261' : siang ? '#87ceeb' : '#0b1d3a';
        bg.setAttribute('fill', warna); bln.querySelector('.ad-bayang').setAttribute('fill', warna);
        bintangG.setAttribute('opacity', siang && !senja ? 0 : senja ? 0.4 : 1);
        lab.textContent = 'Pukul ' + String(Math.floor(h)).padStart(2, '0') + '.00 — ' + (h < 4 || h >= 19 ? 'malam, bintang bertaburan' : h < 6 ? 'menjelang subuh' : h < 11 ? 'pagi, matahari terbit' : h < 15 ? 'siang hari' : h < 18 ? 'sore hari' : 'senja, matahari terbenam');
      }
      var geserJam = ui.slider('Jam', 0, 23, 9, jam);
      ui.reset(function () { geserJam(9); });
      jam(9);
    },
    masjid: function (svg, ui) {
      langit(svg, '#0b2a4a', '#2c5f8a');
      for (var i = 0; i < 12; i += 1) bintang(svg, 20 + i * 33, 18 + (i * 29) % 70, 3 + (i % 2));
      var bulanSabit = s('g', {}, svg); s('circle', { cx: 330, cy: 45, r: 18, fill: '#fde68a' }, bulanSabit); s('circle', { cx: 338, cy: 40, r: 16, fill: '#174a73' }, bulanSabit); geser(svg, bulanSabit);
      var m = s('g', {}, svg);
      s('rect', { x: 120, y: 140, width: 160, height: 80, fill: '#f8f3e6' }, m);
      var kubah = s('path', { d: 'M150 140 Q200 60 250 140Z', fill: '#2f9e44', stroke: '#c9a227', 'stroke-width': 3, class: 'ad-kubah' }, m);
      s('path', { d: 'M200 80 v-14', stroke: '#c9a227', 'stroke-width': 3 }, m); s('circle', { cx: 200, cy: 62, r: 5, fill: '#c9a227' }, m);
      [92, 308].forEach(function (x) { s('rect', { x: x - 9, y: 95, width: 18, height: 125, fill: '#f8f3e6' }, m); s('path', { d: 'M' + (x - 12) + ' 95 L' + x + ' 70 L' + (x + 12) + ' 95Z', fill: '#2f9e44' }, m); });
      s('path', { d: 'M185 220 v-34 q15 -20 30 0 v34Z', fill: '#8d6e4a' }, m);
      [150, 250].forEach(function (x) { s('path', { d: 'M' + (x - 12) + ' 185 v-18 q12 -16 24 0 v18Z', fill: '#fbbf24', opacity: 0.85 }, m); });
      s('rect', { x: 0, y: 220, width: 400, height: 20, fill: '#1f3b2a' }, svg);
      [60, 340].forEach(function (x) { var l = s('g', { class: 'ad-ayun' }, svg); s('line', { x1: x, y1: 100, x2: x, y2: 130, stroke: '#c9a227', 'stroke-width': 2 }, l); s('rect', { x: x - 10, y: 130, width: 20, height: 26, rx: 5, fill: '#f59e0b', stroke: '#c9a227', 'stroke-width': 2, class: 'ad-nyala' }, l); geser(svg, l); });
      kubah.addEventListener('click', function () { kubah.classList.toggle('ad-bercahaya'); bunyi(880); ucap('Masjid, rumah Allah'); });
      ui.status('Ketuk kubah masjid, seret lentera dan bulan sabit');
    },
    kebun: function (svg, ui) {
      langit(svg, '#c7ecff', '#f1fbff'); geser(svg, matahari(svg, 350, 40)); geser(svg, awan(svg, 40, 40, 0.9));
      s('path', { d: 'M0 190 Q120 175 220 190 T400 185 V240 H0Z', fill: '#76b852' }, svg);
      s('rect', { x: 112, y: 120, width: 18, height: 80, fill: '#8d6e4a' }, svg);
      s('circle', { cx: 121, cy: 95, r: 55, fill: '#3f9a3f' }, svg); s('circle', { cx: 85, cy: 110, r: 35, fill: '#4caf50' }, svg); s('circle', { cx: 160, cy: 110, r: 35, fill: '#4caf50' }, svg);
      var keranjang = s('g', {}, svg); s('path', { d: 'M260 195 h90 l-10 35 h-70z', fill: '#c48a46', stroke: '#8d5a2b', 'stroke-width': 3 }, keranjang); teks(keranjang, 305, 186, 'keranjang', { class: 'ad-mini' });
      var hitung = 0, lab = teks(svg, 305, 225, '0', { class: 'ad-angka' });
      [[90, 80], [130, 70], [160, 100], [100, 120], [140, 125], [70, 100]].forEach(function (p) {
        var b = s('g', {}, svg); s('circle', { cx: p[0], cy: p[1], r: 9, fill: '#e63946' }, b); s('path', { d: 'M' + p[0] + ' ' + (p[1] - 9) + ' q3 -6 7 -6', stroke: '#2f6b2f', 'stroke-width': 2, fill: 'none' }, b);
        geser(svg, b, { saatLepas: function (el, t) { if (t.x > 255 && t.x < 355 && t.y > 175 && t.y < 235) { if (!el.__masuk) { el.__masuk = true; hitung += 1; lab.textContent = String(hitung); bunyi(600 + hitung * 60); ucap(ANGKA_ID[hitung] || String(hitung)); } } else if (el.__masuk) { el.__masuk = false; hitung -= 1; lab.textContent = String(hitung); } } });
      });
      ui.status('Petik buahnya, masukkan ke keranjang, dan hitung bersama!');
      ui.reset(function () { hitung = 0; lab.textContent = '0'; svg.querySelectorAll('.ad-seret').forEach(function (e) { e.__masuk = false; }); });
    },
    laut: function (svg, ui) {
      langit(svg, '#9bd3f5', '#e9f7ff'); geser(svg, matahari(svg, 60, 45)); geser(svg, awan(svg, 250, 40));
      s('rect', { x: 340, y: 90, width: 20, height: 100, fill: '#f8f3e6', stroke: '#c0392b', 'stroke-width': 3 }, svg); s('path', { d: 'M336 90 h28 l-14 -18z', fill: '#c0392b' }, svg); s('circle', { cx: 350, cy: 82, r: 6, fill: '#fde047', class: 'ad-nyala' }, svg);
      var perahu = s('g', {}, svg); s('path', { d: 'M120 170 h80 l-14 18 h-52z', fill: '#8d5a2b' }, perahu); s('path', { d: 'M160 168 v-50 l30 44z', fill: '#fff8e1', stroke: '#c9a227', 'stroke-width': 2 }, perahu); geser(svg, perahu);
      for (var i = 0; i < 3; i += 1) s('path', { d: 'M0 ' + (185 + i * 16) + ' Q50 ' + (175 + i * 16) + ' 100 ' + (185 + i * 16) + ' T200 ' + (185 + i * 16) + ' T300 ' + (185 + i * 16) + ' T400 ' + (185 + i * 16) + ' V240 H0Z', fill: ['#4aa3df', '#2f86c5', '#1f6fa8'][i], opacity: 0.9, class: 'ad-ombak', style: 'animation-delay:' + i * 0.4 + 's' }, svg);
      ui.status('Seret perahu dan awan, ketuk dua kali untuk memutar');
    },
    gurun: function (svg, ui) {
      langit(svg, '#ffd9a0', '#fff4dc'); geser(svg, matahari(svg, 330, 45));
      s('path', { d: 'M0 175 Q80 140 170 170 T330 160 T400 168 V240 H0Z', fill: '#e9b872' }, svg);
      s('path', { d: 'M0 200 Q110 178 220 198 T400 192 V240 H0Z', fill: '#d9a35b' }, svg);
      var tenda = s('g', {}, svg); s('path', { d: 'M250 196 L290 140 L330 196Z', fill: '#f8f3e6', stroke: '#8d5a2b', 'stroke-width': 3 }, tenda); s('path', { d: 'M282 196 L290 160 L298 196Z', fill: '#8d5a2b' }, tenda); geser(svg, tenda);
      s('rect', { x: 66, y: 110, width: 12, height: 90, fill: '#8d6e4a' }, svg);
      [[-40, -14], [40, -14], [-34, 8], [34, 8], [0, -30]].forEach(function (d) { s('path', { d: 'M72 108 q' + d[0] / 2 + ' ' + (d[1] - 20) + ' ' + d[0] + ' ' + d[1], stroke: '#2f7d32', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, svg); });
      var sumur = s('g', {}, svg); s('rect', { x: 160, y: 178, width: 44, height: 26, rx: 4, fill: '#a1887f', stroke: '#6d4c41', 'stroke-width': 3 }, sumur); s('path', { d: 'M164 178 v-28 M200 178 v-28 M160 150 h44', stroke: '#6d4c41', 'stroke-width': 3, fill: 'none' }, sumur);
      var timba = s('rect', { x: 176, y: 154, width: 12, height: 10, fill: '#8d6e4a' }, sumur); teks(sumur, 182, 218, 'sumur', { class: 'ad-mini' });
      var keranjang = s('g', {}, svg); s('path', { d: 'M110 205 h60 l-8 24 h-44z', fill: '#c48a46', stroke: '#8d5a2b', 'stroke-width': 3 }, keranjang);
      var hitung = 0, lab = teks(svg, 140, 236, '0', { class: 'ad-angka' });
      [[58, 116], [86, 116], [66, 124], [80, 126], [72, 112]].forEach(function (p) {
        var k = s('ellipse', { cx: p[0], cy: p[1], rx: 4, ry: 6, fill: '#7b3f00' }, svg);
        geser(svg, k, { saatLepas: function (el, t) { var di = t.x > 105 && t.x < 175 && t.y > 195 && t.y < 235; if (di && !el.__masuk) { el.__masuk = true; hitung += 1; bunyi(600 + hitung * 60); ucap(ANGKA_ID[hitung] + ' kurma'); } else if (!di && el.__masuk) { el.__masuk = false; hitung -= 1; } lab.textContent = String(hitung); } });
      });
      sumur.addEventListener('click', function () { timba.setAttribute('fill', '#4aa3df'); bunyi(520); ucap('Air dari sumur, alhamdulillah'); ui.status('Air ditimba dari sumur — air adalah nikmat Allah di padang pasir'); });
      ui.status('Petik kurma ke keranjang, ketuk sumur, seret tendanya');
      ui.reset(function () { hitung = 0; lab.textContent = '0'; timba.setAttribute('fill', '#8d6e4a'); svg.querySelectorAll('.ad-seret').forEach(function (e) { e.__masuk = false; }); ui.status('Petik kurma ke keranjang, ketuk sumur, seret tendanya'); });
    },
    gunung: function (svg, ui) {
      langit(svg, '#b8e1ff', '#eef8ff'); geser(svg, matahari(svg, 60, 45)); geser(svg, awan(svg, 230, 50)); geser(svg, awan(svg, 300, 90, 0.7));
      s('path', { d: 'M40 220 L170 60 L300 220Z', fill: '#7d8a6a' }, svg);
      s('path', { d: 'M150 85 L170 60 L190 85 L178 80 L170 90 L162 80Z', fill: '#ffffff' }, svg);
      s('path', { d: 'M220 220 L320 100 L400 200 V220Z', fill: '#6b7a58' }, svg);
      var gua = s('path', { d: 'M148 190 q22 -36 44 0z', fill: '#2b2b2b', class: 'ad-kubah' }, svg);
      s('rect', { x: 0, y: 215, width: 400, height: 25, fill: '#5b8c3a' }, svg);
      var bendera = s('g', {}, svg); s('line', { x1: 360, y1: 230, x2: 360, y2: 196, stroke: '#5d4037', 'stroke-width': 3 }, bendera); s('path', { d: 'M360 196 l22 7 l-22 7z', fill: '#2f9e44' }, bendera);
      geser(svg, bendera, { saatLepas: function (el, t) { if (Math.hypot(t.x - 170, t.y - 75) < 34) { bunyi(990); ucap('Sampai di puncak! Allahu akbar'); ui.status('Sampai di puncak gunung — Allah Maha Besar!'); } } });
      gua.addEventListener('click', function () { gua.classList.toggle('ad-bercahaya'); gua.setAttribute('fill', gua.classList.contains('ad-bercahaya') ? '#fbbf24' : '#2b2b2b'); bunyi(700); ucap('Gua di gunung'); });
      ui.status('Seret bendera ke puncak gunung, ketuk guanya');
      ui.reset(function () { gua.classList.remove('ad-bercahaya'); gua.setAttribute('fill', '#2b2b2b'); ui.status('Seret bendera ke puncak gunung, ketuk guanya'); });
    },
    rumah: function (svg, ui) {
      var bg = s('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#bfe7ff' }, svg);
      geser(svg, matahari(svg, 340, 42)); geser(svg, awan(svg, 50, 40, 0.9));
      s('path', { d: 'M0 205 Q120 195 220 205 T400 200 V240 H0Z', fill: '#76b852' }, svg);
      s('rect', { x: 110, y: 110, width: 180, height: 100, fill: '#fff3d6', stroke: '#8d5a2b', 'stroke-width': 3 }, svg);
      s('path', { d: 'M96 112 L200 50 L304 112Z', fill: '#c0392b', stroke: '#7b241c', 'stroke-width': 3 }, svg);
      var pintu = s('rect', { x: 182, y: 150, width: 36, height: 60, rx: 4, fill: '#8d5a2b', style: 'transform-box:fill-box;transform-origin:left center;transition:transform .5s' }, svg);
      var jendela = [130, 238].map(function (x) { var j = s('rect', { x: x, y: 128, width: 34, height: 30, rx: 3, fill: '#9ad0ec', stroke: '#8d5a2b', 'stroke-width': 3 }, svg); j.addEventListener('click', function () { var nyala = j.getAttribute('fill') !== '#fde68a'; j.setAttribute('fill', nyala ? '#fde68a' : '#9ad0ec'); bunyi(nyala ? 880 : 440); }); return j; });
      var terbuka = false;
      pintu.addEventListener('click', function () { terbuka = !terbuka; pintu.style.transform = terbuka ? 'scaleX(.25)' : ''; bunyi(660); if (terbuka) { ucap('Assalamu alaikum'); ui.status('Masuk rumah mengucap salam: Assalamu‘alaikum'); } });
      var malam = false;
      ui.tombol('🌙 Siang / Malam', function () { malam = !malam; bg.setAttribute('fill', malam ? '#0b1d3a' : '#bfe7ff'); jendela.forEach(function (j) { j.setAttribute('fill', malam ? '#fde68a' : '#9ad0ec'); }); ucap(malam ? 'Malam hari, waktunya istirahat' : 'Pagi hari, bismillah'); });
      ui.status('Ketuk pintu dan jendela, lalu tekan Siang / Malam');
      ui.reset(function () { malam = false; terbuka = false; bg.setAttribute('fill', '#bfe7ff'); pintu.style.transform = ''; jendela.forEach(function (j) { j.setAttribute('fill', '#9ad0ec'); }); ui.status('Ketuk pintu dan jendela, lalu tekan Siang / Malam'); });
    },
    sholat: function (svg, ui) {
      var bg = s('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#87ceeb' }, svg);
      s('path', { d: 'M30 200 Q200 -40 370 200', fill: 'none', stroke: 'rgba(255,255,255,.6)', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, svg);
      var WAKTU = [['Subuh', 30, 200, '#24345a'], ['Dzuhur', 200, 80, '#87ceeb'], ['Ashar', 300, 120, '#9ecbe8'], ['Maghrib', 370, 200, '#f4a261'], ['Isya', 370, 230, '#0b1d3a']];
      WAKTU.forEach(function (w) { s('circle', { cx: w[1], cy: Math.min(w[2], 205), r: 4, fill: '#fff' }, svg); teks(svg, w[1], Math.min(w[2], 205) - 10, w[0], { class: 'ad-mini ad-terang' }); });
      s('path', { d: 'M0 205 Q100 195 200 205 T400 200 V240 H0Z', fill: '#2f6b3f' }, svg);
      geser(svg, awan(svg, 70, 60, 0.7)); geser(svg, awan(svg, 250, 40, 0.6));
      var sajadah = s('g', {}, svg); s('rect', { x: 300, y: 208, width: 56, height: 26, rx: 4, fill: '#9b2226', stroke: '#c9a227', 'stroke-width': 2 }, sajadah); s('path', { d: 'M310 228 v-10 q18 -12 36 0 v10', fill: 'none', stroke: '#c9a227', 'stroke-width': 2 }, sajadah); geser(svg, sajadah);
      var mth = matahari(svg, 0, 0), lab = teks(svg, 200, 228, '', { class: 'ad-label ad-terang' });
      function ke(i) { var w = WAKTU[i]; mth.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1)'; mth.style.transform = 'translate(' + w[1] + 'px,' + Math.min(w[2], 205) + 'px)'; mth.style.opacity = i === 4 ? 0 : 1; bg.setAttribute('fill', w[3]); lab.textContent = 'Waktu ' + w[0]; ucap('Waktu ' + w[0]); }
      var setel = ui.slider('Waktu', 0, 4, 1, ke, function (v) { return WAKTU[v][0]; });
      ui.reset(function () { setel(1); });
      ke(1);
    },
    huruf: function (svg, ui, ket) {
      langit(svg, '#fff7e6', '#fdebc8');
      var daftar = (ket && /[؀-ۿ]/.test(ket) ? ket.match(/[؀-ۿ]/g) : ['ا', 'ب', 'ت', 'ث', 'ج', 'ح']).slice(0, 8);
      daftar.forEach(function (h, i) {
        var g = s('g', {}, svg), x = 40 + (i % 4) * 95, y = 50 + Math.floor(i / 4) * 95;
        s('rect', { x: x - 30, y: y - 30, width: 60, height: 60, rx: 14, fill: ['#2f9e44', '#3b82f6', '#e76f51', '#9b5de5'][i % 4], stroke: '#c9a227', 'stroke-width': 3 }, g);
        teks(g, x, y + 14, h, { class: 'ad-huruf' });
        geser(svg, g, { saatKetuk: function () { ucap(h, 'ar-SA'); bunyi(700); } });
      });
      ui.status('Ketuk huruf untuk mendengar, seret untuk menyusun');
    },
  };
  ADEGAN.buah = ADEGAN.kebun;

  function pasang(fig) {
    if (fig.__adegan) return;
    var nama = fig.getAttribute('data-adegan'), buat = ADEGAN[nama];
    var wadah = fig.querySelector('[data-adegan-isi]');
    if (!buat || !wadah) return;
    fig.__adegan = true;
    var svg = s('svg', { viewBox: '0 0 400 240', class: 'ad-svg', 'aria-hidden': 'true' }, wadah);
    var panel = d.createElement('div'); panel.className = 'adegan-alat'; wadah.appendChild(panel);
    var stat = d.createElement('p'); stat.className = 'adegan-status'; stat.setAttribute('aria-live', 'polite'); wadah.appendChild(stat);
    var penata = [];
    var ui = {
      status: function (t) { stat.textContent = t; },
      tombol: function (label, fn) { var b = d.createElement('button'); b.type = 'button'; b.className = 'adegan-tbl'; b.textContent = label; b.addEventListener('click', fn); panel.appendChild(b); return b; },
      slider: function (label, min, max, awal, fn, fmt) {
        var l = d.createElement('label'); l.className = 'adegan-geser'; var sp = d.createElement('span'); sp.textContent = label; var r = d.createElement('input');
        r.type = 'range'; r.min = String(min); r.max = String(max); r.value = String(awal); r.step = '1';
        var out = d.createElement('b'); var tulis = function () { out.textContent = fmt ? fmt(Number(r.value)) : r.value; };
        r.addEventListener('input', function () { fn(Number(r.value)); tulis(); }); tulis();
        l.appendChild(sp); l.appendChild(r); l.appendChild(out); panel.appendChild(l);
        return function (v) { r.value = String(v); fn(v); tulis(); };
      },
      reset: function (fn) { penata.push(fn); },
    };
    buat(svg, ui, fig.getAttribute('data-ket') || '');
    var tReset = fig.querySelector('[data-adegan-reset]');
    if (tReset) tReset.addEventListener('click', function () {
      svg.querySelectorAll('.ad-seret').forEach(function (el) { if (el.__reset) el.__reset(); });
      penata.forEach(function (f) { f(); });
      bunyi(440);
    });
  }

  window.YapidaAdegan = { pasang: pasang, nama: Object.keys(ADEGAN) };
  Array.prototype.slice.call(d.querySelectorAll('[data-adegan]')).forEach(pasang);
})();
