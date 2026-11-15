/* yapida.sch.id — pembaca bersuara (pemilik: „Buku wajib bisa di bacakan dengan suara yg pas sesuai dengan kelas nya … Arab ya
   bahasa Arab, Inggris ya speling Inggris“). Memakai suara perangkat (Web Speech API): setiap blok dan potongan dibacakan
   dengan suara bahasanya sendiri (lang="ar" → suara Arab, lang="en" → suara Inggris, lainnya → Indonesia); nada dan
   kecepatan mengikuti jenjang (balita, anak, remaja, dewasa). Blok yang sedang dibaca disorot dan digulir ke tengah layar,
   lalu berlanjut sendiri sampai habis. Mesin yang sama dipakai pembaca buku perpustakaan (window.YapidaSuara). */
(function () {
  'use strict';
  var ss = window.speechSynthesis;
  var PROFIL = { balita: { rate: 0.8, pitch: 1.35 }, anak: { rate: 0.9, pitch: 1.2 }, remaja: { rate: 0.98, pitch: 1.05 }, dewasa: { rate: 1, pitch: 1 } };
  var KODE = { ar: ['ar-SA', 'ar'], en: ['en-US', 'en-GB', 'en'], id: ['id-ID', 'id', 'ms-MY', 'ms'] };
  var suara = [];
  var muatSuara = function () { suara = ss ? ss.getVoices() : []; };
  if (ss) { muatSuara(); if (typeof ss.addEventListener === 'function') ss.addEventListener('voiceschanged', muatSuara); else ss.onvoiceschanged = muatSuara; }

  function pilihSuara(bhs, profil) {
    var calon = KODE[bhs] || KODE.id;
    for (var i = 0; i < calon.length; i++) {
      var cocok = suara.filter(function (v) { return v.lang && v.lang.toLowerCase().replace('_', '-').indexOf(calon[i].toLowerCase()) === 0; });
      if (!cocok.length) continue;
      /* Profil anak: utamakan suara perempuan/anak bila namanya menyebutkannya; dewasa: suara alami/premium dulu. */
      var suka = profil === 'balita' || profil === 'anak' ? /female|wanita|child|kid|girl|damayanti|gadis|sari|zira|samantha/i : /natural|premium|enhanced|neural|google/i;
      return cocok.filter(function (v) { return suka.test(v.name); })[0] || cocok.filter(function (v) { return v.localService; })[0] || cocok[0];
    }
    return null;
  }

  /** Bahasa sebuah elemen: atribut lang terdekat (di dalam wadah), selain itu Indonesia. */
  function bahasa(el, wadah) {
    for (var n = el; n && n !== wadah.parentNode; n = n.parentNode) if (n.getAttribute && n.getAttribute('lang')) return n.getAttribute('lang').slice(0, 2).toLowerCase();
    return 'id';
  }

  /** Potongan sebuah blok: teks Latin dan sisipan Arab dibacakan bergantian dengan suaranya masing-masing. */
  function potongan(blok, wadah) {
    var hasil = [], dasar = bahasa(blok, wadah);
    var jalan = function (n, bhs) {
      if (n.nodeType === 3) { var t = n.nodeValue.replace(/\s+/g, ' '); if (t.trim()) { var akhir = hasil[hasil.length - 1]; if (akhir && akhir.lang === bhs) akhir.teks += t; else hasil.push({ teks: t, lang: bhs }); } return; }
      if (n.nodeType !== 1 || /^(SCRIPT|STYLE|SVG|BUTTON)$/i.test(n.nodeName)) return;
      var b = n.getAttribute('lang') ? n.getAttribute('lang').slice(0, 2).toLowerCase() : bhs;
      for (var c = n.firstChild; c; c = c.nextSibling) jalan(c, b);
    };
    jalan(blok, dasar);
    /* Kalimat panjang dipecah (Chrome memutus ucapan di atas ±15 detik). */
    var out = [];
    hasil.forEach(function (h) {
      var kalimat = h.teks.match(/[^.!?؟۔\n]+[.!?؟۔]*\s*/g) || [h.teks], buf = '';
      kalimat.forEach(function (k) { if ((buf + k).length > 200 && buf) { out.push({ teks: buf.trim(), lang: h.lang }); buf = ''; } buf += k; });
      if (buf.trim()) out.push({ teks: buf.trim(), lang: h.lang });
    });
    return out;
  }

  /**
   * Membacakan daftar blok berurutan. o.profil, o.kecepatan (pengali), o.mulai (indeks), o.saatBlok(i, el),
   * o.saatSelesai(), o.saatKata(el, charIndex). Mengembalikan pengendali { jeda, lanjut, henti, sedang }.
   */
  function bacakan(blok, wadah, o) {
    o = o || {};
    var i = o.mulai || 0, j = 0, bagian = null, berhenti = false, dijeda = false;
    var profil = PROFIL[o.profil] || PROFIL.dewasa;
    var lanjutBlok = function () {
      if (berhenti) return;
      if (i >= blok.length) { if (o.saatSelesai) o.saatSelesai(); return; }
      if (!bagian) { bagian = potongan(blok[i], wadah); j = 0; if (o.saatBlok) o.saatBlok(i, blok[i]); }
      if (j >= bagian.length) { i++; bagian = null; setTimeout(lanjutBlok, 220); return; }
      var p = bagian[j], u = new SpeechSynthesisUtterance(p.teks), v = pilihSuara(p.lang, o.profil);
      u.lang = v ? v.lang : (KODE[p.lang] || KODE.id)[0];
      if (v) u.voice = v;
      u.rate = Math.max(0.5, Math.min(2, profil.rate * (o.kecepatan || 1) * (p.lang === 'ar' ? 0.9 : 1)));
      u.pitch = profil.pitch;
      u.onend = function () { j++; lanjutBlok(); };
      u.onerror = function (e) { if (e.error === 'interrupted' || e.error === 'canceled') return; j++; lanjutBlok(); };
      if (o.saatKata) u.onboundary = function (e) { if (e.name === 'word' || e.name === undefined) o.saatKata(blok[i], e.charIndex, p); };
      ss.speak(u);
    };
    ss.cancel();
    setTimeout(lanjutBlok, 60);
    return {
      jeda: function () { dijeda = true; ss.pause(); },
      lanjut: function () { dijeda = false; ss.resume(); },
      henti: function () { berhenti = true; ss.cancel(); },
      sedang: function () { return !berhenti && !dijeda; },
      indeks: function () { return i; },
    };
  }

  var BLOK = 'p, li, h1, h2, h3, h4, blockquote > p, figcaption, td, th';
  function blokDari(wadah) {
    return Array.prototype.slice.call(wadah.querySelectorAll(BLOK)).filter(function (el) {
      if (el.closest('blockquote') && el.nodeName !== 'P') return false;
      if (el.nodeName === 'LI' && el.querySelector('p')) return false;
      return el.textContent.trim().length > 0;
    });
  }

  window.YapidaSuara = { tersedia: Boolean(ss && window.SpeechSynthesisUtterance), bacakan: bacakan, blokDari: blokDari, potongan: potongan, pilihSuara: pilihSuara };

  /* ── tombol „Dengarkan“ pada kabar dan karya tulis ─────── */
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.slice.call(document.querySelectorAll('[data-dengar]')).forEach(function (bar) {
    var isi = document.querySelector('[data-baca-isi]'), tb = bar.querySelector('[data-dengar-putar]'), st = bar.querySelector('[data-dengar-status]'), label = tb.querySelector('span');
    if (!isi) return;
    if (!window.YapidaSuara.tersedia) { tb.disabled = true; st.textContent = 'Peramban ini belum mendukung suara pembaca.'; return; }
    var kendali = null, blok = blokDari(isi), profil = isi.getAttribute('data-suara') || 'dewasa';
    var bersih = function () { blok.forEach(function (b) { b.classList.remove('dibaca'); }); };
    tb.addEventListener('click', function () {
      if (kendali && kendali.sedang()) { kendali.jeda(); label.textContent = 'Lanjutkan'; bar.classList.remove('main'); return; }
      if (kendali && !kendali.sedang()) { kendali.lanjut(); label.textContent = 'Jeda'; bar.classList.add('main'); return; }
      bar.classList.add('main'); label.textContent = 'Jeda';
      kendali = bacakan(blok, isi, {
        profil: profil,
        saatBlok: function (i, el) { bersih(); el.classList.add('dibaca'); el.scrollIntoView({ block: 'center', behavior: tenang ? 'auto' : 'smooth' }); st.textContent = 'Membaca bagian ' + (i + 1) + ' dari ' + blok.length; },
        saatSelesai: function () { bersih(); kendali = null; bar.classList.remove('main'); label.textContent = 'Dengarkan lagi'; st.textContent = 'Selesai dibacakan.'; },
      });
    });
    window.addEventListener('pagehide', function () { if (kendali) kendali.henti(); });
  });
})();
