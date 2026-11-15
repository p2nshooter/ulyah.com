/* yapida.sch.id — Al-Qur'an mushaf Utsmani: murottal per ayat dengan sorot, mushaf yang dibalik tanpa memuat ulang,
   lembar ayat (terjemah + tafsir Kemenag), mode hafalan, penanda, dan posisi terakhir dibaca (di perangkat saja). */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var simpan = {
    get: function (k, b) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : b; } catch (e) { return b; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
  };
  var AR = '٠١٢٣٤٥٦٧٨٩';
  var angkaArab = function (n) { return String(n).replace(/\d/g, function (x) { return AR[Number(x)]; }); };
  var pad3 = function (n) { return ('00' + n).slice(-3); };
  var bulat = function (v, min, max) { var n = Math.floor(Number(v)); return n >= min && n <= max ? n : null; };
  var bacaJson = function (id) { var el = d.getElementById(id); if (!el) return null; try { return JSON.parse(el.textContent); } catch (e) { return null; } };
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── murottal per ayat ── */
  var QARI_SAH = $$('[data-q-qari] option').map(function (o) { return o.value; });
  var qari = simpan.get('yp-qari', 'Alafasy_128kbps');
  if (QARI_SAH.indexOf(qari) < 0) qari = QARI_SAH[0] || 'Alafasy_128kbps';
  $$('[data-q-qari]').forEach(function (s) { s.value = qari; s.addEventListener('change', function () { if (QARI_SAH.indexOf(s.value) >= 0) { qari = s.value; simpan.set('yp-qari', qari); } }); });
  var alamat = function (s, a) { return 'https://everyayah.com/data/' + qari + '/' + pad3(s) + pad3(a) + '.mp3'; };
  var cadangan = function (g) { return 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/' + g + '.mp3'; };

  function Murottal(o) {
    var audio = new Audio(), muka = new Audio(), antre = null, ulang = 1, ke = 0, jalan = false;
    audio.preload = 'auto'; muka.preload = 'auto';
    var putar = function () {
      if (!antre) return;
      var it = antre;
      audio.src = alamat(it.s, it.a);
      audio.dataset.cadangan = String(it.g);
      audio.play().catch(function () { /* menunggu ketukan pengguna */ });
      jalan = true;
      if (o.mulai) o.mulai(it);
      var nx = o.berikut(it);
      if (nx) muka.src = alamat(nx.s, nx.a);
    };
    audio.addEventListener('error', function () {
      var g = audio.dataset.cadangan;
      if (g && audio.src.indexOf('everyayah.com') >= 0) { audio.src = cadangan(Number(g)); audio.play().catch(function () {}); }
    });
    audio.addEventListener('ended', function () {
      ke += 1;
      if (ke < ulang) { audio.currentTime = 0; audio.play().catch(function () {}); return; }
      ke = 0;
      var nx = antre && o.berikut(antre);
      if (!nx) { jalan = false; antre = null; if (o.selesai) o.selesai(); return; }
      antre = nx; putar();
    });
    return {
      mulai: function (it, u) { ulang = u || 1; ke = 0; antre = it; putar(); },
      jeda: function () { if (audio.paused) { audio.play().catch(function () {}); return false; } audio.pause(); return true; },
      henti: function () { audio.pause(); jalan = false; antre = null; if (o.selesai) o.selesai(true); },
      jalan: function () { return jalan; },
      kecepatan: function (r) { audio.playbackRate = r; },
    };
  }

  /* ── beranda Al-Qur'an ── */
  var cari = $('[data-q-cari]');
  if (cari) {
    var meta = bacaJson('q-meta') || [];
    $$('[data-q-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-q-tab]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        $$('[data-q-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-q-panel') !== b.getAttribute('data-q-tab'); });
      });
    });
    var normal = function (s) { return s.toLowerCase().replace(/[’'`\-\s]/g, ''); };
    cari.addEventListener('input', function () {
      var q = normal(cari.value);
      $$('[data-q-panel="surah"] .q-surah').forEach(function (a) { a.hidden = Boolean(q) && !/^\d/.test(q) && normal(a.getAttribute('data-q-nama') || '').indexOf(q) < 0; });
    });
    $('[data-q-lompat]').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = cari.value.trim().toLowerCase(), m;
      if ((m = /^(\d{1,3})\s*[:.]\s*(\d{1,3})$/.exec(v))) { var s = bulat(m[1], 1, 114), a = bulat(m[2], 1, 286); if (s && a) { location.href = '/quran/' + s + '#ayat-' + a; return; } }
      if ((m = /^(hal(aman)?\.?)\s*(\d{1,3})$/.exec(v))) { var p = bulat(m[3], 1, 604); if (p) { location.href = '/quran/halaman/' + p; return; } }
      if ((m = /^(\d{1,3})$/.exec(v))) { var n = bulat(m[1], 1, 114); if (n) { location.href = '/quran/' + n; return; } }
      var pertama = $('[data-q-panel="surah"] .q-surah:not([hidden])');
      if (pertama) location.href = pertama.href;
    });
    var akhir = simpan.get('yp-quran-terakhir', null), lanjut = $('[data-q-lanjut]');
    if (akhir && lanjut) {
      var hs = bulat(akhir.h, 1, 604), ss = bulat(akhir.s, 1, 114), aa = bulat(akhir.a, 1, 286);
      if (akhir.mode === 'mushaf' && hs) { lanjut.href = '/quran/halaman/' + hs; $('[data-q-lanjut-label]').textContent = 'Lanjutkan: halaman ' + hs; lanjut.hidden = false; }
      else if (ss && aa) { var nm = (meta[ss - 1] || [])[1] || ('Surah ' + ss); lanjut.href = '/quran/' + ss + '#ayat-' + aa; $('[data-q-lanjut-label]').textContent = 'Lanjutkan: ' + nm + ' : ' + aa; lanjut.hidden = false; }
    }
  }

  /* ── tafsir (dibagi halaman surah & mushaf) ── */
  var tafsirMemo = {};
  function tafsir(s) {
    if (!tafsirMemo[s]) tafsirMemo[s] = fetch('/quran/api/tafsir/' + s).then(function (r) { return r.json(); }).catch(function () { return { galat: 'Tafsir belum bisa dimuat.' }; });
    return tafsirMemo[s];
  }
  function isiTafsir(wadah, s, a) {
    wadah.hidden = false;
    wadah.textContent = 'Memuat tafsir…';
    tafsir(s).then(function (t) {
      if (!t || t.galat || !t.ayat || !t.ayat[a]) { wadah.textContent = (t && t.galat) || 'Tafsir ayat ini belum tersedia.'; delete tafsirMemo[s]; return; }
      wadah.textContent = t.ayat[a];
      var kecil = d.createElement('small'); kecil.textContent = 'Sumber: ' + (t.sumber || 'Tafsir Kemenag RI'); wadah.appendChild(kecil);
    });
  }

  /* ── halaman per surah ── */
  var baca = $('[data-q-surah]');
  if (baca) {
    var data = bacaJson('q-data') || {}, S = bulat(baca.getAttribute('data-q-surah'), 1, 114), JML = bulat(baca.getAttribute('data-q-jumlah'), 1, 286), G0 = Number(baca.getAttribute('data-q-awal')) || 1;
    var ayatEl = function (a) { return d.getElementById('ayat-' + a); };
    var tampil = simpan.get('yp-q-tampil', { lt: 0, tr: 1 });
    var setTampil = function () {
      baca.setAttribute('data-q-tampil-lt', tampil.lt ? '1' : '0');
      baca.setAttribute('data-q-tampil-tr', tampil.tr ? '1' : '0');
      baca.setAttribute('data-q-hafal', tampil.hafal ? '1' : '0');
      $$('[data-q-tampil]').forEach(function (b) { b.setAttribute('aria-pressed', String(Boolean(tampil[b.getAttribute('data-q-tampil')]))); });
    };
    setTampil();
    $$('[data-q-tampil]').forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-q-tampil'); tampil[k] = tampil[k] ? 0 : 1; simpan.set('yp-q-tampil', tampil); setTampil(); }); });
    var huruf = bulat(simpan.get('yp-q-huruf', 30), 20, 52) || 30;
    var setHuruf = function () { d.documentElement.style.setProperty('--q-huruf', huruf + 'px'); };
    setHuruf();
    $$('[data-q-huruf]').forEach(function (b) { b.addEventListener('click', function () { huruf = Math.max(20, Math.min(52, huruf + Number(b.getAttribute('data-q-huruf')) * 3)); simpan.set('yp-q-huruf', huruf); setHuruf(); }); });

    var pemutar = $('[data-q-pemutar]'), label = $('[data-q-pemutar-label]');
    var aktif = null;
    var m = Murottal({
      berikut: function (it) { return it.a < JML ? { s: S, a: it.a + 1, g: G0 + it.a } : null; },
      mulai: function (it) {
        if (aktif) aktif.classList.remove('aktif');
        aktif = ayatEl(it.a); if (aktif) { aktif.classList.add('aktif'); aktif.scrollIntoView({ block: 'center', behavior: tenang ? 'auto' : 'smooth' }); }
        pemutar.hidden = false; label.textContent = (data.lt || 'Surah') + ' : ' + it.a + ' / ' + JML;
        simpan.set('yp-quran-terakhir', { mode: 'surah', s: S, a: it.a });
      },
      selesai: function (dihentikan) {
        if (aktif) aktif.classList.remove('aktif');
        if (dihentikan) { pemutar.hidden = true; return; }
        label.textContent = 'Selesai. ';
        if (data.sesudah) { var a = d.createElement('a'); a.href = '/quran/' + bulat(data.sesudah, 1, 114); a.textContent = 'Surah berikutnya ›'; a.style.color = '#ecd990'; label.appendChild(a); }
      },
    });
    var ulang = function () { return bulat(($('[data-q-ulang]') || {}).value, 1, 10) || 1; };
    $$('[data-q-putar]').forEach(function (b) { b.addEventListener('click', function () { var a = bulat(b.getAttribute('data-q-putar'), 1, JML); if (a) m.mulai({ s: S, a: a, g: G0 + a - 1 }, ulang()); }); });
    var semua = $('[data-q-putar-semua]');
    if (semua) semua.addEventListener('click', function () { var a = aktif ? bulat(aktif.getAttribute('data-a'), 1, JML) || 1 : 1; m.mulai({ s: S, a: a, g: G0 + a - 1 }, ulang()); });
    $('[data-q-jeda]').addEventListener('click', function (e) { e.currentTarget.textContent = m.jeda() ? '▶' : '❚❚'; });
    $('[data-q-henti]').addEventListener('click', function () { m.henti(); });

    $$('[data-q-tafsir]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = bulat(b.getAttribute('data-q-tafsir'), 1, JML), w = ayatEl(a) && $('[data-q-tafsir-isi]', ayatEl(a));
        if (!w) return;
        if (b.getAttribute('aria-expanded') === 'true') { w.hidden = true; b.setAttribute('aria-expanded', 'false'); return; }
        b.setAttribute('aria-expanded', 'true'); isiTafsir(w, S, a);
      });
    });
    var tanda = simpan.get('yp-q-tanda', []);
    if (!Array.isArray(tanda)) tanda = [];
    $$('[data-q-tanda]').forEach(function (b) {
      var k = S + ':' + b.getAttribute('data-q-tanda');
      b.setAttribute('aria-pressed', String(tanda.indexOf(k) >= 0));
      b.addEventListener('click', function () {
        var i = tanda.indexOf(k);
        if (i >= 0) tanda.splice(i, 1); else tanda.unshift(k);
        tanda = tanda.slice(0, 200); simpan.set('yp-q-tanda', tanda);
        b.setAttribute('aria-pressed', String(i < 0));
      });
    });
    $$('[data-q-salin]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = bulat(b.getAttribute('data-q-salin'), 1, JML);
        var el = ayatEl(a); if (!el) return;
        var ar = $('.q-ar', el), tr = $('.q-tr', el);
        var teks = (ar ? ar.textContent.trim() : '') + '\n\n' + (tr ? tr.textContent.replace(/^\d+\.\s*/, '').trim() : '') + '\n(QS ' + (data.lt || S) + ': ' + a + ')';
        if (navigator.clipboard) navigator.clipboard.writeText(teks).then(function () { b.textContent = '✓'; setTimeout(function () { b.textContent = '⧉'; }, 1500); }).catch(function () {});
      });
    });
    baca.addEventListener('click', function (e) {
      if (baca.getAttribute('data-q-hafal') !== '1') return;
      var ar = e.target.closest && e.target.closest('.q-ar');
      if (ar) ar.parentNode.classList.toggle('buka');
    });
    if ('IntersectionObserver' in window) {
      var tunda = null;
      var io = new IntersectionObserver(function (ent) {
        ent.forEach(function (x) {
          if (!x.isIntersecting || m.jalan()) return;
          var a = bulat(x.target.getAttribute('data-a'), 1, JML);
          clearTimeout(tunda); tunda = setTimeout(function () { simpan.set('yp-quran-terakhir', { mode: 'surah', s: S, a: a }); }, 800);
        });
      }, { rootMargin: '-40% 0px -50% 0px' });
      $$('.q-ayat').forEach(function (x) { io.observe(x); });
    }
    var hash = /^#ayat-(\d{1,3})$/.exec(location.hash);
    if (hash) {
      var t = ayatEl(bulat(hash[1], 1, JML));
      if (t) {
        t.classList.add('aktif'); setTimeout(function () { t.classList.remove('aktif'); }, 2600);
        // Font mushaf mengubah tinggi baris setelah termuat: posisi ayat tujuan disetel ulang sesudahnya.
        var ke = function () { t.scrollIntoView({ block: 'start' }); };
        if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { setTimeout(ke, 30); }); else setTimeout(ke, 300);
      }
    }
  }

  /* ── halaman mushaf ── */
  var mushaf = $('[data-m-halaman]');
  if (mushaf) {
    var MM = bacaJson('m-meta') || {}, SUR = MM.surah || [], hal = bulat(MM.p, 1, 604) || 1;
    var isiM = $('[data-m-isi]'), kepala = $('.m-kepala', mushaf), kaki = $('.m-kaki span', mushaf);
    var surahMemo = {};
    var dataSurah = function (s) { if (!surahMemo[s]) surahMemo[s] = fetch('/assets/quran/s/' + s + '.json').then(function (r) { return r.json(); }); return surahMemo[s]; };
    var halMemo = {};
    var dataHal = function (p) { if (!halMemo[p]) halMemo[p] = fetch('/assets/quran/h/' + p + '.json').then(function (r) { if (!r.ok) throw new Error('hal'); return r.json(); }); return halMemo[p]; };
    var el = function (tag, kelas, teks) { var x = d.createElement(tag); if (kelas) x.className = kelas; if (teks !== undefined) x.textContent = teks; return x; };

    function lukis(h) {
      isiM.textContent = '';
      h.baris.forEach(function (b) {
        if (b.t === 'surat') { var su = el('div', 'm-surat'), sp = el('span', '', 'سُورَةُ ' + ((SUR[b.n - 1] || [])[2] || '')); sp.lang = 'ar'; sp.dir = 'rtl'; su.appendChild(sp); isiM.appendChild(su); return; }
        if (b.t === 'basmalah') { var bs = el('div', 'm-basmalah', MM.basmalah || ''); bs.lang = 'ar'; bs.dir = 'rtl'; isiM.appendChild(bs); return; }
        var ln = el('div', 'm-baris'); ln.lang = 'ar'; ln.dir = 'rtl';
        b.k.forEach(function (t) {
          var w = el('span', 'w', t[0]); w.setAttribute('data-a', t[1]); ln.appendChild(w); ln.appendChild(d.createTextNode(' '));
          if (t[2]) { var ak = el('span', 'm-akhir', '۝' + angkaArab(t[2])); ak.setAttribute('data-a', t[1]); ln.appendChild(ak); ln.appendChild(d.createTextNode(' ')); }
        });
        isiM.appendChild(ln);
      });
      mushaf.classList.toggle('mushaf-awal', h.p <= 2);
      var nama = h.surat.map(function (n) { return (SUR[n - 1] || [])[2] || ''; }).join(' · ');
      kepala.textContent = '';
      kepala.appendChild(el('span', '', nama)); kepala.appendChild(el('span', '', 'الجزء ' + angkaArab(h.juz)));
      kaki.textContent = angkaArab(h.p);
      mushaf.setAttribute('aria-label', 'Mushaf halaman ' + h.p);
      var inp = $('[data-m-hal]'); if (inp) inp.value = h.p;
      var sj = $('[data-m-juz]'); if (sj) $$('option', sj).forEach(function (o, i) { var nx = sj.options[i + 1]; if (Number(o.value) <= h.p && (!nx || Number(nx.value) > h.p)) sj.value = o.value; });
      var ss = $('[data-m-surah]'); if (ss && h.surat[0]) ss.selectedIndex = h.surat[0] - 1;
      $$('[data-m-ke]').forEach(function (a) {
        var tujuan = a.classList.contains('m-berikut') ? h.p + 1 : h.p - 1;
        a.setAttribute('data-m-ke', String(tujuan)); a.href = tujuan >= 1 && tujuan <= 604 ? '/quran/halaman/' + tujuan : '/quran';
      });
      d.title = d.title.replace(/Halaman \d+/, 'Halaman ' + h.p);
      simpan.set('yp-quran-terakhir', { mode: 'mushaf', h: h.p });
    }

    var sedang = false;
    function pergi(p, arah, tanpaRiwayat) {
      p = bulat(p, 1, 604);
      if (!p || p === hal || sedang) return Promise.resolve(false);
      sedang = true;
      return dataHal(p).then(function (h) {
        mushaf.classList.remove('balik-kiri', 'balik-kanan'); void mushaf.offsetWidth;
        if (!tenang) mushaf.classList.add(arah === 'maju' ? 'balik-kiri' : 'balik-kanan');
        lukis(h); hal = p;
        if (!tanpaRiwayat) history.pushState({ p: p }, '', '/quran/halaman/' + p);
        if (p < 604) dataHal(p + 1).catch(function () {});
        sedang = false; return true;
      }).catch(function () { sedang = false; location.href = '/quran/halaman/' + p; return false; });
    }
    $$('[data-m-ke]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var p = bulat(a.getAttribute('data-m-ke'), 1, 604); if (!p) return;
        e.preventDefault(); pergi(p, p > hal ? 'maju' : 'mundur');
      });
    });
    window.addEventListener('popstate', function () { var mm = /\/quran\/halaman\/(\d+)/.exec(location.pathname); if (mm) pergi(Number(mm[1]), 'mundur', true); });
    d.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.nodeName)) return;
      if (e.key === 'ArrowLeft') pergi(hal + 1, 'maju');
      if (e.key === 'ArrowRight') pergi(hal - 1, 'mundur');
    });
    var x0 = null, y0 = 0;
    mushaf.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    mushaf.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) pergi(dx > 0 ? hal + 1 : hal - 1, dx > 0 ? 'maju' : 'mundur');
    });
    var inp = $('[data-m-hal]');
    if (inp) inp.addEventListener('change', function () { pergi(inp.value, Number(inp.value) > hal ? 'maju' : 'mundur'); });
    ['[data-m-surah]', '[data-m-juz]'].forEach(function (s) { var x = $(s); if (x) x.addEventListener('change', function () { pergi(x.value, Number(x.value) > hal ? 'maju' : 'mundur'); }); });

    /* lembar ayat */
    var lembar = $('[data-m-ayat]'), pilihan = null;
    var sorot = function (k, kelas) { $$('.' + kelas, isiM).forEach(function (x) { x.classList.remove(kelas); }); if (k) $$('[data-a="' + k.replace(/[^0-9:]/g, '') + '"]', isiM).forEach(function (x) { x.classList.add(kelas); }); };
    isiM.addEventListener('click', function (e) {
      var w = e.target.closest && e.target.closest('[data-a]');
      if (!w) return;
      var mm = /^(\d{1,3}):(\d{1,3})$/.exec(w.getAttribute('data-a') || ''); if (!mm) return;
      var s = bulat(mm[1], 1, 114), a = bulat(mm[2], 1, 286); if (!s || !a) return;
      pilihan = { s: s, a: a, g: ((SUR[s - 1] || [])[3] || 1) + a - 1 };
      sorot(s + ':' + a, 'pilih');
      $('[data-m-ayat-judul]').textContent = 'QS ' + ((SUR[s - 1] || [])[1] || s) + ' : ' + a;
      $('[data-m-ayat-ar]').textContent = '…'; $('[data-m-ayat-tr]').textContent = '';
      $('[data-m-ayat-buka]').href = '/quran/' + s + '#ayat-' + a;
      var tf = $('[data-m-ayat-tafsir-isi]'); tf.hidden = true; tf.textContent = '';
      lembar.hidden = false;
      dataSurah(s).then(function (x) { var y = x.ayat[a - 1]; if (!y || !pilihan || pilihan.s !== s || pilihan.a !== a) return; $('[data-m-ayat-ar]').textContent = y.ar + ' ۝' + angkaArab(a); $('[data-m-ayat-tr]').textContent = y.tr; });
    });
    $('[data-m-tutup]').addEventListener('click', function () { lembar.hidden = true; sorot(null, 'pilih'); });
    $('[data-m-ayat-tafsir]').addEventListener('click', function () { if (pilihan) isiTafsir($('[data-m-ayat-tafsir-isi]'), pilihan.s, pilihan.a); });

    /* murottal mengikuti halaman */
    var berikutAyat = function (it) {
      var s = SUR[it.s - 1]; if (!s) return null;
      if (it.a < s[4]) return { s: it.s, a: it.a + 1, g: it.g + 1 };
      return it.s < 114 ? { s: it.s + 1, a: 1, g: it.g + 1 } : null;
    };
    var tombolDengar = $('[data-m-putar]');
    var mp = Murottal({
      berikut: berikutAyat,
      mulai: function (it) {
        var k = it.s + ':' + it.a;
        tombolDengar.lastElementChild.textContent = 'Jeda';
        var tampilkan = function () { sorot(k, 'aktif'); };
        if ($('[data-a="' + k + '"]', isiM)) { tampilkan(); return; }
        dataSurah(it.s).then(function (x) { var y = x.ayat[it.a - 1]; if (y && y.h !== hal) pergi(y.h, y.h > hal ? 'maju' : 'mundur').then(tampilkan); else tampilkan(); });
      },
      selesai: function () { sorot(null, 'aktif'); tombolDengar.lastElementChild.textContent = 'Dengarkan'; },
    });
    tombolDengar.addEventListener('click', function () {
      if (mp.jalan()) { var dijeda = mp.jeda(); tombolDengar.lastElementChild.textContent = dijeda ? 'Lanjutkan' : 'Jeda'; return; }
      var pertama = $('.w[data-a]', isiM); if (!pertama) return;
      var mm = /^(\d{1,3}):(\d{1,3})$/.exec(pertama.getAttribute('data-a')); if (!mm) return;
      var s = Number(mm[1]), a = Number(mm[2]);
      mp.mulai({ s: s, a: a, g: ((SUR[s - 1] || [])[3] || 1) + a - 1 }, 1);
    });
    $('[data-m-ayat-putar]').addEventListener('click', function () { if (pilihan) mp.mulai(pilihan, 1); });
    simpan.set('yp-quran-terakhir', { mode: 'mushaf', h: hal });
    if (hal < 604) dataHal(hal + 1).catch(function () {});
  }
})();
