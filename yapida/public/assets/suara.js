/* yapida.sch.id — pembaca bersuara (pemilik: „Buku wajib bisa di bacakan dengan suara yg pas sesuai dengan kelas nya … Arab ya
   bahasa Arab, Inggris ya speling Inggris“). Memakai suara perangkat (Web Speech API): setiap blok dan potongan dibacakan
   dengan suara bahasanya sendiri (lang="ar" → suara Arab, lang="en" → suara Inggris, lainnya → Indonesia); nada dan
   kecepatan mengikuti jenjang (balita, anak, remaja, dewasa). Blok yang sedang dibaca disorot dan digulir ke tengah layar,
   lalu berlanjut sendiri sampai habis. Mesin yang sama dipakai pembaca buku perpustakaan (window.YapidaSuara). */
(function () {
  'use strict';
  var ss = window.speechSynthesis;
  /* Pencerita per jenjang (pemilik: „suaranya nyaman d dengar, elegan, berwibawa dan sesuai jenjang, misal buku anak di
     bacakan suara anak“): balita & anak — suara perempuan dengan nada tinggi (terdengar seperti anak/kakak), remaja —
     lembut dan jernih, dewasa (kitab, hadits, kajian, kabar) — suara laki-laki yang tenang dan berwibawa. */
  var PROFIL = {
    balita: { rate: 0.86, pitch: 1.36, jenis: 'p' },
    anak: { rate: 0.92, pitch: 1.24, jenis: 'p' },
    remaja: { rate: 0.97, pitch: 1.03, jenis: 'p' },
    dewasa: { rate: 0.93, pitch: 0.9, jenis: 'l' },
  };
  /* Logat (pemilik: „make logat bahasa indonesia bukan Melayu, klo Arab make logat Arab, Inggris ya logat inggris“):
     Indonesia hanya suara id-ID (Android lama melaporkannya sebagai in-ID) — suara Melayu (ms) tidak pernah dipakai;
     Inggris logat Inggris (en-GB) lalu Amerika; Arab logat Arab (ar-SA lalu ar-* lain). */
  var KODE = { ar: ['ar-SA', 'ar-AE', 'ar-EG', 'ar'], en: ['en-GB', 'en-US', 'en-AU', 'en'], id: ['id-ID', 'in-ID', 'id', 'in'] };
  var LANG_UTTER = { ar: 'ar-SA', en: 'en-GB', id: 'id-ID' };
  var cocokKode = function (v, kode) { var l = (v.lang || '').toLowerCase().replace('_', '-'); return l.indexOf(kode.toLowerCase()) === 0 && !(kode.length === 2 && l.charAt(2) && l.charAt(2) !== '-'); };
  /* Mutu & jenis suara dari namanya: suara neural (Edge „Natural“, Chrome „Google“, Apple „Premium/Enhanced“) dulu. */
  var BAGUS = /natural|neural|online|premium|enhanced|google|siri/i;
  var PEREMPUAN = /female|wanita|perempuan|gadis|damayanti|siti|sari|nisa|zira|samantha|sonia|libby|maisie|jenny|aria|kate|serena|zariyah|hoda|laila|amina|salma|id-id-x-idc|id-id-x-dfz|google bahasa indonesia|google uk english female/i;
  var LAKI = /\bmale\b|laki|pria|ardi|andika|ryan|guy|thomas|daniel|oliver|hamed|naayf|shakir|maged|tarik|id-id-x-idd|id-id-x-ide|google uk english male/i;
  var suara = [];
  var muatSuara = function () { suara = ss ? ss.getVoices() : []; };
  if (ss) { muatSuara(); if (typeof ss.addEventListener === 'function') ss.addEventListener('voiceschanged', muatSuara); else ss.onvoiceschanged = muatSuara; }
  /** Menunggu daftar suara termuat (Chrome/Safari mengisinya sesudah halaman siap) — maks. 1,5 detik. */
  function siapSuara(cb) {
    if (!ss || suara.length) { cb(); return; }
    var sudah = false, jalan = function () { if (sudah) return; sudah = true; muatSuara(); cb(); };
    try { ss.addEventListener('voiceschanged', jalan, { once: true }); } catch (e) { /* abaikan */ }
    setTimeout(jalan, 1500);
  }

  function nilai(v, profil, urutan) {
    var n = 40 - urutan * 8;
    if (BAGUS.test(v.name)) n += 50;
    var mau = (PROFIL[profil] || PROFIL.dewasa).jenis;
    var p = PEREMPUAN.test(v.name), l = !p && LAKI.test(v.name);
    if ((mau === 'p' && p) || (mau === 'l' && l)) n += 30; else if (p || l) n -= 12;
    if (v.localService === false) n += 4;
    return n;
  }
  function pilihSuara(bhs, profil, pilihan) {
    if (pilihan && pilihan[bhs]) { var tetap = suara.filter(function (v) { return v.voiceURI === pilihan[bhs] && (KODE[bhs] || KODE.id).some(function (k) { return cocokKode(v, k); }); })[0]; if (tetap) return tetap; }
    var calon = KODE[bhs] || KODE.id, terbaik = null, skor = -1e9;
    for (var i = 0; i < calon.length; i++) {
      suara.forEach(function (v) { if (!cocokKode(v, calon[i])) return; var n = nilai(v, profil, i); if (n > skor) { skor = n; terbaik = v; } });
    }
    return terbaik;
  }
  var adaSuara = function (bhs) { return suara.some(function (v) { return (KODE[bhs] || KODE.id).some(function (k) { return cocokKode(v, k); }); }); };
  /** Ucapan singkat (kata yang diketuk, adegan kartun) dengan pencerita & logat yang sama seperti pembaca buku. */
  function ucap(teks, bhs, profil, pilihan) {
    if (!ss || !teks) return;
    siapSuara(function () {
      try {
        ss.cancel();
        var b = (bhs || 'id').slice(0, 2), pr = PROFIL[profil] || PROFIL.anak, u = new SpeechSynthesisUtterance(teks), v = pilihSuara(b, profil || 'anak', pilihan);
        u.lang = v ? v.lang : LANG_UTTER[b] || LANG_UTTER.id; if (v) u.voice = v;
        u.rate = pr.rate * (b === 'ar' ? 0.88 : 1); u.pitch = pr.pitch;
        ss.speak(u);
      } catch (e) { /* abaikan */ }
    });
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
   * o.saatSelesai(), o.saatKata(el, charIndex, potongan), o.pilihan ({ id|ar|en: voiceURI } pilihan pembaca).
   * Mengembalikan pengendali { jeda, lanjut, henti, sedang, indeks }.
   */
  function bacakan(blok, wadah, o) {
    o = o || {};
    var i = o.mulai || 0, j = 0, bagian = null, berhenti = false, dijeda = false, jam = null;
    var hentiJam = function () { if (jam) { clearInterval(jam); jam = null; } };
    var profil = PROFIL[o.profil] || PROFIL.dewasa;
    var lanjutBlok = function () {
      if (berhenti) return;
      if (i >= blok.length) { if (o.saatSelesai) o.saatSelesai(); return; }
      if (!bagian) { bagian = potongan(blok[i], wadah); j = 0; if (o.saatBlok) o.saatBlok(i, blok[i]); }
      if (j >= bagian.length) { i++; bagian = null; setTimeout(lanjutBlok, 220); return; }
      var p = bagian[j], u = new SpeechSynthesisUtterance(p.teks), v = pilihSuara(p.lang, o.profil, o.pilihan);
      u.lang = v ? v.lang : LANG_UTTER[p.lang] || LANG_UTTER.id;
      if (v) u.voice = v;
      u.rate = Math.max(0.5, Math.min(2, profil.rate * (o.kecepatan || 1) * (p.lang === 'ar' ? 0.9 : 1)));
      u.pitch = profil.pitch;
      var elBlok = blok[i], adaBatas = false;
      u.onend = function () { hentiJam(); j++; lanjutBlok(); };
      u.onerror = function (e) { hentiJam(); if (e.error === 'interrupted' || e.error === 'canceled') return; j++; lanjutBlok(); };
      if (o.saatPotong) o.saatPotong(elBlok, p);
      if (o.saatKata) {
        u.onboundary = function (e) { if (e.name === 'word' || e.name === undefined) { adaBatas = true; hentiJam(); o.saatKata(elBlok, e.charIndex, p); } };
        /* Banyak suara (mis. Android) tidak mengirim batas kata: posisi kata diperkirakan dari kecepatan ucapan,
           supaya penanda kata dan perpindahan halaman tetap berjalan di semua perangkat. */
        u.onstart = function () {
          hentiJam();
          var awal = [], re = /\S+/g, m; while ((m = re.exec(p.teks))) awal.push(m.index);
          var cps = (p.lang === 'ar' ? 8.5 : 13.5) * (u.rate || 1), t0 = Date.now(), k = 0;
          jam = setInterval(function () {
            if (adaBatas || berhenti) { hentiJam(); return; }
            if (dijeda) { t0 += 150; return; }
            var c = (Date.now() - t0) / 1000 * cps;
            while (k < awal.length - 1 && awal[k + 1] <= c) k++;
            o.saatKata(elBlok, awal[k] || 0, p);
          }, 150);
        };
      }
      ss.speak(u);
    };
    ss.cancel();
    siapSuara(function () { setTimeout(lanjutBlok, 60); });
    return {
      jeda: function () { dijeda = true; ss.pause(); },
      lanjut: function () { dijeda = false; ss.resume(); },
      henti: function () { berhenti = true; hentiJam(); ss.cancel(); },
      sedang: function () { return !berhenti && !dijeda; },
      indeks: function () { return i; },
    };
  }

  /* ── penanda kata (pemilik: „wajib ada penanda setiap kata yg di baca di setiap buku“) ─────────────────
     Kata yang sedang diucapkan disorot: CSS Custom Highlight bila peramban mendukung, selain itu kotak penanda
     melayang di atas kata. Teks blok diringkas spasinya dan dipetakan ke simpul teks aslinya, lalu setiap potongan
     ucapan dicari mulai dari akhir potongan sebelumnya (kalimat yang berulang tidak salah tempat). */
  function petaTeks(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node, teks = '', peta = [], spasi = true;
    while ((node = w.nextNode())) {
      if (node.parentNode && /^(SCRIPT|STYLE|BUTTON)$/i.test(node.parentNode.nodeName)) continue;
      var v = node.nodeValue;
      for (var x = 0; x < v.length; x++) {
        if (/\s/.test(v.charAt(x))) { if (spasi) continue; teks += ' '; peta.push([node, x]); spasi = true; }
        else { teks += v.charAt(x); peta.push([node, x]); spasi = false; }
      }
    }
    return { teks: teks, peta: peta };
  }
  var lapis = null;
  function penanda() {
    var kini = null, dukung = !!(window.CSS && CSS.highlights && window.Highlight);
    var hapus = function () { try { if (dukung) CSS.highlights.delete('yp-kata'); } catch (e) { /* abaikan */ } if (lapis) lapis.hidden = true; };
    var tandai = function (el, idx, p) {
      if (!el || !p) return null;
      if (!kini || kini.el !== el) kini = { el: el, data: petaTeks(el), kursor: 0, p: null, dasar: 0 };
      if (kini.p !== p) {
        var kunci = p.teks.replace(/\s+/g, ' ').trim(), t = kini.data.teks;
        var pos = t.indexOf(kunci.slice(0, 40), Math.max(0, kini.kursor - 2));
        if (pos < 0) pos = t.indexOf(kunci.slice(0, 14), Math.max(0, kini.kursor - 2));
        if (pos < 0) pos = t.indexOf(kunci.slice(0, 14));
        if (pos < 0) return null;
        kini.p = p; kini.dasar = pos; kini.kursor = pos + kunci.length;
      }
      var s = kini.data.teks, mulai = Math.min(s.length - 1, kini.dasar + Math.max(0, idx || 0));
      while (mulai > kini.dasar && !/\s/.test(s.charAt(mulai - 1))) mulai--;
      while (mulai < s.length && /\s/.test(s.charAt(mulai))) mulai++;
      var akhir = mulai; while (akhir < s.length && !/\s/.test(s.charAt(akhir))) akhir++;
      var a = kini.data.peta[mulai], b = kini.data.peta[akhir - 1];
      if (!a || !b) return null;
      var r = document.createRange();
      try { r.setStart(a[0], a[1]); r.setEnd(b[0], b[1] + 1); } catch (e) { return null; }
      if (dukung) { try { CSS.highlights.set('yp-kata', new Highlight(r)); } catch (e) { /* abaikan */ } }
      else {
        var rc = r.getBoundingClientRect();
        if (!lapis) { lapis = document.createElement('span'); lapis.className = 'yp-penanda'; lapis.setAttribute('aria-hidden', 'true'); document.body.appendChild(lapis); }
        lapis.hidden = false;
        lapis.style.left = (rc.left + window.scrollX - 3) + 'px'; lapis.style.top = (rc.top + window.scrollY - 1) + 'px';
        lapis.style.width = (rc.width + 6) + 'px'; lapis.style.height = (rc.height + 2) + 'px';
      }
      return r;
    };
    return { tandai: tandai, hapus: hapus, ulang: function () { kini = null; hapus(); } };
  }

  var BLOK = 'p, li, h1, h2, h3, h4, blockquote > p, figcaption, td, th';
  function blokDari(wadah) {
    return Array.prototype.slice.call(wadah.querySelectorAll(BLOK)).filter(function (el) {
      if (el.closest('blockquote') && el.nodeName !== 'P') return false;
      if (el.nodeName === 'LI' && el.querySelector('p')) return false;
      return el.textContent.trim().length > 0;
    });
  }

  window.YapidaSuara = { tersedia: Boolean(ss && window.SpeechSynthesisUtterance), bacakan: bacakan, penanda: penanda, blokDari: blokDari, potongan: potongan, pilihSuara: pilihSuara, ucap: ucap, adaSuara: adaSuara, siap: siapSuara, profil: PROFIL, kodeBahasa: KODE, cocokKode: cocokKode, langUcap: LANG_UTTER, daftar: function () { if (ss) muatSuara(); return suara.slice(); }, kode: KODE };

  /* ── tombol „Dengarkan“ pada kabar dan karya tulis ─────── */
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.slice.call(document.querySelectorAll('[data-dengar]')).forEach(function (bar) {
    var isi = document.querySelector('[data-baca-isi]'), tb = bar.querySelector('[data-dengar-putar]'), st = bar.querySelector('[data-dengar-status]'), label = tb.querySelector('span');
    if (!isi) return;
    if (!window.YapidaSuara.tersedia) { tb.disabled = true; st.textContent = 'Peramban ini belum mendukung suara pembaca.'; return; }
    var kendali = null, blok = blokDari(isi), profil = isi.getAttribute('data-suara') || 'dewasa', tanda = penanda();
    var bersih = function () { blok.forEach(function (b) { b.classList.remove('dibaca'); }); tanda.hapus(); };
    var ikuti = function (el, idx, p) {
      var r = tanda.tandai(el, idx, p); if (!r) return;
      var rc = r.getBoundingClientRect();
      if (rc.height && (rc.bottom > innerHeight - 90 || rc.top < 80)) window.scrollBy({ top: rc.top - innerHeight * 0.4, behavior: tenang ? 'auto' : 'smooth' });
    };
    tb.addEventListener('click', function () {
      if (kendali && kendali.sedang()) { kendali.jeda(); label.textContent = 'Lanjutkan'; bar.classList.remove('main'); return; }
      if (kendali && !kendali.sedang()) { kendali.lanjut(); label.textContent = 'Jeda'; bar.classList.add('main'); return; }
      bar.classList.add('main'); label.textContent = 'Jeda';
      kendali = bacakan(blok, isi, {
        profil: profil,
        saatBlok: function (i, el) { bersih(); el.classList.add('dibaca'); el.scrollIntoView({ block: 'center', behavior: tenang ? 'auto' : 'smooth' }); st.textContent = 'Membaca bagian ' + (i + 1) + ' dari ' + blok.length; },
        saatKata: ikuti,
        saatSelesai: function () { bersih(); kendali = null; bar.classList.remove('main'); label.textContent = 'Dengarkan lagi'; st.textContent = 'Selesai dibacakan.'; },
      });
    });
    window.addEventListener('pagehide', function () { if (kendali) kendali.henti(); });
  });
})();
