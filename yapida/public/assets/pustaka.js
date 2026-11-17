/* yapida.sch.id — Pustaka Yapida: rak interaktif, suka, lanjutkan membaca, pembaca buku (halaman membalik, suara per bahasa,
   lanjut bab sampai khatam), dan aktivitas ala Wordwall di dalam buku (kuis, kartu balik, pasangkan). Tidak ada isi yang
   disisipkan sebagai HTML: semua dirakit dengan textContent. */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var simpan = {
    get: function (k, b) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : b; } catch (e) { return b; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
  };
  var ID_RE = /^[a-z]-[A-Za-z0-9_-]{1,80}$/;
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var halusPointer = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
  var el = function (tag, kelas, teks) { var x = d.createElement(tag); if (kelas) x.className = kelas; if (teks !== undefined) x.textContent = teks; return x; };
  // Alamat buku hanya dirakit dari id yang lolos pola ketat (id datang dari halaman/penyimpanan, bukan tepercaya).
  var ID_BUKU = /^[a-z]-[A-Za-z0-9_-]{1,80}$/;
  var tautBuku = function (id) { var s = String(id || ''); return ID_BUKU.test(s) ? '/pustaka/b/' + s : '/pustaka'; };
  var tautBab = function (id, n) { var s = String(id || ''), k = Math.floor(Number(n)); return ID_BUKU.test(s) && k > 0 && k < 5000 ? '/pustaka/b/' + s + '/' + k : '/pustaka'; };

  /* ── bunyi kecil (dibangkitkan, tanpa berkas) ── */
  var ac = null;
  function bunyi(jenis) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var nada = jenis === 'benar' ? [660, 880, 1175] : jenis === 'menang' ? [523, 659, 784, 1047] : [220, 180];
      nada.forEach(function (f, i) {
        var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.09;
        o.type = jenis === 'salah' ? 'sawtooth' : 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.25);
      });
    } catch (e) { /* abaikan */ }
  }
  function percik(x, y, n) {
    if (tenang) return;
    for (var i = 0; i < (n || 14); i += 1) {
      var s = el('span', 'percik-bintang', ['★', '✦', '✧', '❋'][i % 4]);
      var a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 120;
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px');
      d.body.appendChild(s); setTimeout(function (z) { return function () { z.remove(); }; }(s), 1700);
    }
  }
  /* Ucapan singkat (kata/kartu yang diketuk) memakai pencerita & logat yang sama dengan pembaca buku (suara.js). */
  var ucap = function (teks, bahasa) {
    if (!teks || !window.YapidaSuara) return;
    var profil = (d.querySelector('[data-pencerita]') || {}).value || (d.querySelector('[data-suara]') || { getAttribute: function () { return 'anak'; } }).getAttribute('data-suara') || 'anak';
    window.YapidaSuara.ucap(teks, AR.test(teks) ? 'ar' : bahasa || 'id', profil, simpan.get('yp-suara-pilih', {}));
  };

  /* ── rak: geser, buku miring mengikuti kursor ── */
  $$('[data-rak-geser]').forEach(function (b) {
    b.addEventListener('click', function () {
      var g = $('[data-rak-gulir]', b.parentNode); if (!g) return;
      g.scrollBy({ left: Number(b.getAttribute('data-rak-geser')) * g.clientWidth * 0.8, behavior: tenang ? 'auto' : 'smooth' });
    });
  });
  if (halusPointer && !tenang) {
    $$('[data-miring]').forEach(function (bk) {
      bk.addEventListener('pointermove', function (e) {
        var r = bk.getBoundingClientRect();
        bk.style.setProperty('--rx', (((e.clientX - r.left) / r.width - 0.5) * 30).toFixed(1));
        bk.style.setProperty('--ry', (((e.clientY - r.top) / r.height - 0.5) * -16).toFixed(1));
      });
      bk.addEventListener('pointerleave', function () { bk.style.removeProperty('--rx'); bk.style.removeProperty('--ry'); });
    });
  }
  /* Ilustrasi sampul buku pelajaran bergerak hanya saat bukunya terlihat di layar (hemat baterai, terasa hidup di HP). */
  if (!tenang && 'IntersectionObserver' in window) {
    var hidupkan = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('hidup', e.isIntersecting); }); }, { threshold: 0.55 });
    $$('.buku3d').forEach(function (bk) { if (bk.querySelector('.ilu')) hidupkan.observe(bk); });
  }
  $$('[data-kirim-otomatis]').forEach(function (s) { s.addEventListener('change', function () { if (s.form) s.form.submit(); }); });

  /* ── suka ── */
  function pasangSuka(b) {
    var id = b.getAttribute('data-suka'); if (!ID_RE.test(id)) return;
    var n = $('[data-suka-n]', b);
    fetch('/pustaka/api/suka/' + encodeURIComponent(id), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { b.setAttribute('aria-pressed', String(Boolean(j.suka))); }).catch(function () {});
    b.addEventListener('click', function (e) {
      var mau = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(mau));
      if (mau) { bunyi('benar'); percik(e.clientX, e.clientY, 10); }
      fetch('/pustaka/api/suka', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: id, suka: mau }) })
        .then(function (r) { return r.json(); }).then(function (j) { if (j && j.ok) { b.setAttribute('aria-pressed', String(j.suka)); if (n) n.textContent = String(j.n); } }).catch(function () {});
    });
  }
  $$('[data-suka]').forEach(pasangSuka);

  /* ── lanjutkan membaca ── */
  var progres = simpan.get('yp-baca', {});
  if (typeof progres !== 'object' || !progres) progres = {};
  var lanjut = $('[data-lanjut]');
  if (lanjut) {
    var daftar = Object.keys(progres).filter(function (k) { return ID_RE.test(k) && progres[k] && progres[k].judul; })
      .sort(function (a, b) { return (progres[b].t || 0) - (progres[a].t || 0); }).slice(0, 8);
    if (daftar.length) {
      var wadah = $('[data-lanjut-daftar]', lanjut);
      daftar.forEach(function (id) {
        var p = progres[id], n = Math.max(1, Math.floor(Number(p.n) || 1));
        var a = el('a', 'lanjut-butir'); a.href = tautBab(id, n);
        a.appendChild(el('span', 'lanjut-ikon', '📖'));
        var teks = el('span'); teks.appendChild(el('b', '', String(p.judul).slice(0, 80))); teks.appendChild(el('small', '', 'Bab ' + n + (p.total ? ' dari ' + p.total : '')));
        var pr = el('progress'); pr.max = 1; pr.value = Math.min(1, Number(p.k) || 0); teks.appendChild(pr);
        a.appendChild(teks); wadah.appendChild(a);
      });
      lanjut.hidden = false;
    }
  }
  $$('[data-mulai-baca]').forEach(function (a) {
    var id = a.getAttribute('data-mulai-baca'), p = progres[id];
    if (p && p.n > 1 && /\/1$/.test(a.getAttribute('href'))) { a.href = tautBab(id, p.n); var s = $('span', a); if (s) s.textContent = 'Lanjutkan bab ' + Math.floor(Number(p.n)); }
  });

  /* ── aktivitas ala Wordwall ── */
  function acak(a) { for (var i = a.length - 1; i > 0; i -= 1) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function teksBahasa(x, t) { x.textContent = t; if (AR.test(t)) { x.lang = 'ar'; x.dir = 'rtl'; x.classList.add('arab-in'); } }
  var bahasaBuku = 'id';
  function hidupkanAktivitas(akar) {
    if (window.YapidaAdegan) $$('[data-akt="adegan"]', akar).forEach(window.YapidaAdegan.pasang);
    $$('[data-akt="kuis"]', akar).forEach(function (k) {
      if (k.__hidup) return; k.__hidup = true;
      var pil = []; try { pil = JSON.parse(k.getAttribute('data-pilihan') || '[]'); } catch (e) { pil = []; }
      var isi = $('[data-akt-isi]', k), salah = 0, selesai = false;
      acak(pil.map(function (p) { return { benar: p.charAt(0) === '*', t: p.replace(/^\*/, '').trim() }; })).forEach(function (o) {
        var b = el('button', 'akt-pil'); b.type = 'button'; teksBahasa(b, o.t); if (o.benar) b.setAttribute('data-benar', '1');
        b.addEventListener('click', function (e) {
          if (selesai) return;
          ucap(o.t, bahasaBuku);
          if (o.benar) {
            selesai = true; b.classList.add('benar'); k.classList.add('selesai'); bunyi('benar'); percik(e.clientX, e.clientY);
            var bh = k.getAttribute('data-bahas'); if (bh && !$('.akt-bahas', k)) { var pb = el('p', 'akt-bahas'); pb.appendChild(el('b', '', '💡 ')); pb.appendChild(document.createTextNode(bh)); k.appendChild(pb); }
            k.dispatchEvent(new CustomEvent('yp:skor', { bubbles: true, detail: { benar: salah === 0 } }));
          } else {
            salah += 1; b.classList.add('salah'); b.disabled = true; bunyi('salah');
            if (salah >= 2) $$('.akt-pil[data-benar="1"]', isi).forEach(function (x) { x.classList.add('petunjuk'); });
          }
        });
        isi.appendChild(b);
      });
    });
    $$('[data-akt="urut"]', akar).forEach(function (k) {
      if (k.__hidup) return; k.__hidup = true;
      var butir = []; try { butir = JSON.parse(k.getAttribute('data-urut') || '[]'); } catch (e) { butir = []; }
      var isi = $('[data-akt-isi]', k), hasil = $('[data-urut-hasil]', k);
      if (!isi || !hasil || butir.length < 2) return;
      var ulang = el('button', 'urut-ulang', '↺ Ulangi'); ulang.type = 'button'; ulang.hidden = true; k.appendChild(ulang);
      var berikut = 0;
      function susun() {
        berikut = 0; isi.textContent = ''; hasil.textContent = ''; k.classList.remove('selesai'); ulang.hidden = true;
        var urutan = butir.map(function (t, i) { return i; });
        do { acak(urutan); } while (urutan.every(function (v, i) { return v === i; }));
        urutan.forEach(function (i) {
          var b = el('button', 'urut-kotak'); b.type = 'button'; teksBahasa(b, butir[i]); b.setAttribute('data-i', String(i));
          b.addEventListener('click', function (e) {
            if (b.disabled) return;
            ucap(butir[i], bahasaBuku);
            if (i === berikut) {
              berikut += 1; b.disabled = true; b.classList.add('benar'); bunyi('benar'); percik(e.clientX, e.clientY, 8);
              var li = el('li', 'urut-butir'); teksBahasa(li, butir[i]); hasil.appendChild(li);
              setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, tenang ? 0 : 260);
              if (berikut === butir.length) { k.classList.add('selesai'); bunyi('menang'); ulang.hidden = false; var r = k.getBoundingClientRect(); percik(r.left + r.width / 2, r.top + r.height / 2, 26); k.dispatchEvent(new CustomEvent('yp:skor', { bubbles: true, detail: { benar: true } })); }
            } else {
              b.classList.add('goyang'); bunyi('salah'); setTimeout(function () { b.classList.remove('goyang'); }, 450);
            }
          });
          isi.appendChild(b);
        });
      }
      ulang.addEventListener('click', susun);
      susun();
    });
    $$('[data-akt="kartu"]', akar).forEach(function (k) {
      if (k.__hidup) return; k.__hidup = true;
      k.addEventListener('click', function () {
        var balik = !k.classList.contains('balik'); k.classList.toggle('balik', balik); k.setAttribute('aria-pressed', String(balik));
        var muka = $(balik ? '.belakang' : '.depan', k); if (muka) ucap(muka.textContent, bahasaBuku);
        if (balik) bunyi('benar');
      });
    });
    $$('[data-akt="cocok"]', akar).forEach(function (k) {
      if (k.__hidup) return; k.__hidup = true;
      var pasang = []; try { pasang = JSON.parse(k.getAttribute('data-pasang') || '[]'); } catch (e) { pasang = []; }
      var papan = $('[data-akt-isi]', k), kiri = el('div', 'cocok-kol'), kanan = el('div', 'cocok-kol'), pilih = null, sisa = pasang.length;
      var tombol = function (t, sisi, i) { var b = el('button', 'cocok-kotak'); b.type = 'button'; teksBahasa(b, t); b.setAttribute('data-i', String(i)); b.setAttribute('data-sisi', sisi); return b; };
      pasang.forEach(function (p, i) { kiri.appendChild(tombol(p[0], 'kiri', i)); });
      acak(pasang.map(function (p, i) { return [p[1], i]; })).forEach(function (p) { kanan.appendChild(tombol(p[0], 'kanan', p[1])); });
      papan.appendChild(kiri); papan.appendChild(kanan);
      papan.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('.cocok-kotak'); if (!b || b.classList.contains('cocok')) return;
        ucap(b.textContent, bahasaBuku);
        if (!pilih || pilih.getAttribute('data-sisi') === b.getAttribute('data-sisi')) { if (pilih) pilih.classList.remove('dipilih'); pilih = b; b.classList.add('dipilih'); return; }
        if (pilih.getAttribute('data-i') === b.getAttribute('data-i')) {
          pilih.classList.remove('dipilih'); pilih.classList.add('cocok'); b.classList.add('cocok'); bunyi('benar'); percik(e.clientX, e.clientY, 8); sisa -= 1;
          if (!sisa) { k.classList.add('selesai'); bunyi('menang'); var r = k.getBoundingClientRect(); percik(r.left + r.width / 2, r.top + r.height / 2, 26); k.dispatchEvent(new CustomEvent('yp:skor', { bubbles: true, detail: { benar: true } })); }
        } else {
          var a1 = pilih; a1.classList.add('goyang'); b.classList.add('goyang'); bunyi('salah');
          setTimeout(function () { a1.classList.remove('goyang', 'dipilih'); b.classList.remove('goyang'); }, 450);
        }
        pilih = null;
      });
    });
  }
  hidupkanAktivitas(d);

  /* ── pembaca ── */
  var baca = $('[data-baca]');
  if (!baca) return;
  var data = null; try { data = JSON.parse(($('#data-baca') || {}).textContent || 'null'); } catch (e) { data = null; }
  if (!data || !ID_RE.test(data.id)) return;
  bahasaBuku = data.bahasa === 'ar' ? 'id' : data.bahasa || 'id';
  var lembar = $('[data-lembar]', baca), isi = $('[data-isi]', baca);
  var atur = simpan.get('yp-baca-atur', {});
  var mode = atur.mode === 'gulir' ? 'gulir' : 'halaman', hal = 0, jumlah = 1, lebar = 1;
  var babKini = data.n;
  var sumber = new URLSearchParams(location.search);

  function terapkanAtur() {
    baca.setAttribute('data-mode', mode);
    baca.style.setProperty('--huruf', (atur.huruf || (innerWidth < 700 ? 17.5 : 19)) + 'px');
    baca.setAttribute('data-kertas', atur.kertas || 'terang');
    baca.setAttribute('data-terjemah', atur.terjemah === false ? 'sembunyi' : 'tampil');
    var tm = $('[data-baca-mode]', baca); if (tm) tm.setAttribute('aria-pressed', String(mode === 'gulir'));
    var tt = $('[data-baca-terjemah]', baca); if (tt) tt.setAttribute('aria-pressed', String(atur.terjemah !== false));
  }
  function tata() {
    if (mode !== 'halaman') { isi.style.columnWidth = ''; isi.style.columnGap = ''; isi.style.transform = ''; jumlah = 1; hal = 0; posisi(); return; }
    lebar = lembar.clientWidth;
    var cs = getComputedStyle(isi), px = parseFloat(cs.paddingLeft) || 24, kol = lebar >= 980 ? 2 : 1, gap = px * 2;
    lembar.classList.toggle('dua-hal', kol === 2);
    isi.style.columnGap = gap + 'px';
    isi.style.columnWidth = Math.floor((lebar - px * 2 - gap * (kol - 1)) / kol) + 'px';
    var akhir = isi.lastElementChild;
    jumlah = akhir ? Math.max(1, Math.floor((akhir.offsetLeft + akhir.offsetWidth - 2) / lebar) + 1) : 1;
    hal = Math.min(hal, jumlah - 1);
    isi.style.transform = 'translateX(' + (-hal * lebar) + 'px)';
    posisi();
  }
  function posisi() {
    var p = $('[data-posisi]', baca), k = $('[data-kemajuan]', baca);
    var frac = mode === 'halaman' ? (jumlah > 1 ? hal / (jumlah - 1) : 1) : Math.min(1, Math.max(0, (scrollY - baca.offsetTop) / Math.max(1, baca.offsetHeight - innerHeight)));
    if (p) p.textContent = mode === 'halaman' ? 'Halaman ' + (hal + 1) + ' / ' + jumlah + ' · Bab ' + babKini + ' / ' + data.bab.length : 'Bab ' + babKini + ' / ' + data.bab.length;
    var total = data.bab.length || 1, kemajuan = ((babKini - 1) + frac) / total;
    if (k) k.value = kemajuan;
    $$('[data-hal]', baca).forEach(function (b) { var arah = Number(b.getAttribute('data-hal')); b.disabled = mode === 'halaman' && ((arah < 0 && hal === 0 && babKini === 1) || (arah > 0 && hal >= jumlah - 1 && babKini >= total)); });
    progres = simpan.get('yp-baca', {}) || {};
    progres[data.id] = { n: babKini, f: frac, k: kemajuan, total: total, judul: data.judul, t: Date.now() };
    var kunci = Object.keys(progres); if (kunci.length > 60) kunci.sort(function (a, b) { return progres[a].t - progres[b].t; }).slice(0, kunci.length - 60).forEach(function (x) { delete progres[x]; });
    simpan.set('yp-baca', progres);
  }
  function balik(ke, arah) {
    if (mode !== 'halaman' || ke === hal || ke < 0 || ke >= jumlah) return;
    if (!tenang) {
      var daun = el('div', 'daun ' + (arah > 0 ? 'buka' : 'tutup')), salin = isi.cloneNode(true);
      $$('[id]', salin).forEach(function (x) { x.removeAttribute('id'); });
      salin.removeAttribute('data-isi'); $$('[data-b]', salin).forEach(function (x) { x.removeAttribute('data-b'); });
      salin.style.transform = 'translateX(' + (-(arah > 0 ? hal : ke) * lebar) + 'px)';
      daun.appendChild(salin); lembar.appendChild(daun);
      daun.addEventListener('animationend', function () { daun.remove(); });
      setTimeout(function () { if (daun.parentNode) daun.remove(); }, 900);
    }
    hal = ke; isi.style.transform = 'translateX(' + (-hal * lebar) + 'px)'; posisi();
  }
  function ke(arah) {
    if (mode !== 'halaman') return;
    if (hal + arah >= 0 && hal + arah < jumlah) { balik(hal + arah, arah); return; }
    if (arah > 0 && babKini < data.bab.length) gantiBab(babKini + 1, false, 0);
    else if (arah < 0 && babKini > 1) gantiBab(babKini - 1, false, -1);
  }
  $$('[data-hal]', baca).forEach(function (b) { b.addEventListener('click', function () { henti(); ke(Number(b.getAttribute('data-hal'))); }); });
  d.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.nodeName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); ke(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); ke(-1); }
  });
  var x0 = null;
  lembar.addEventListener('pointerdown', function (e) { if (e.target.closest('.akt')) return; x0 = e.clientX; });
  lembar.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) ke(dx < 0 ? 1 : -1); });

  /* ── merakit bab dari data (lanjut bab tanpa memuat ulang) ── */
  var AR_RUN = /([؀-ۿﭐ-﷿ﹰ-﻿][؀-ۿﭐ-﷿ﹰ-﻿\s،؛؟.,:;!?()«»ـ-]*[؀-ۿﭐ-﷿ﹰ-﻿]|[؀-ۿﭐ-﷿ﹰ-﻿])/;
  function sebaris(wadah, t, bungkus) {
    var bagian = t.split(/\*\*(.+?)\*\*/);
    bagian.forEach(function (s, i) {
      if (!s) return;
      var target = i % 2 ? wadah.appendChild(el('b')) : wadah;
      if (!bungkus) { target.appendChild(d.createTextNode(s)); return; }
      s.split(AR_RUN).forEach(function (p, j) {
        if (!p) return;
        if (j % 2) { var sp = el('span', 'arab-in', p); sp.lang = 'ar'; sp.dir = 'rtl'; target.appendChild(sp); } else target.appendChild(d.createTextNode(p));
      });
    });
  }
  function rakitBlok(b) {
    var x, kelas = { h: 'b-h', ar: 'b-ar', tr: 'b-tr', en: 'b-en', lt: 'b-lt', cat: 'b-cat', q: 'b-q', li: 'b-li' }[b.t] || '';
    if (b.t === 'img') {
      if (!/^\/pustaka\/m\/[a-z0-9-]+\/[\w.-]+$/.test(b.x)) return null;
      x = el('figure', 'b-img'); var im = el('img'); im.src = b.x; im.alt = b.a || ''; im.loading = 'lazy'; x.appendChild(im); return x;
    }
    if (b.t === 'adegan') {
      var ad = b.x.split('|').map(function (s) { return s.trim(); });
      x = el('figure', 'akt adegan'); x.setAttribute('data-akt', 'adegan'); x.setAttribute('data-adegan', ad[0] || ''); x.setAttribute('data-ket', ad[1] || '');
      var pg = el('div', 'adegan-panggung'); pg.setAttribute('data-adegan-isi', ''); pg.setAttribute('role', 'img'); pg.setAttribute('aria-label', ad[1] || 'Gambar interaktif'); x.appendChild(pg);
      var fc = el('figcaption'); fc.appendChild(el('span', '', ad[1] || '')); var rs = el('button', 'adegan-reset', '↺ Kembalikan'); rs.type = 'button'; rs.setAttribute('data-adegan-reset', ''); fc.appendChild(rs); x.appendChild(fc);
      return x;
    }
    if (b.t === 'kuis') {
      var kx = b.x.split(/\s*>>\s*/), bag = kx[0].split('|').map(function (s) { return s.trim(); });
      x = el('div', 'akt akt-kuis'); x.setAttribute('data-akt', 'kuis'); x.setAttribute('data-pilihan', JSON.stringify(bag.slice(1)));
      if (kx[1]) x.setAttribute('data-bahas', kx[1]);
      x.appendChild(el('p', 'akt-label', '❓ Tebak!')); var tq = el('p', 'akt-tanya'); tq.setAttribute('data-b', ''); sebaris(tq, bag[0] || '', true); x.appendChild(tq);
      var wi = el('div', 'akt-pilihan'); wi.setAttribute('data-akt-isi', ''); x.appendChild(wi); return x;
    }
    if (b.t === 'kartu') {
      var kb = b.x.split('|').map(function (s) { return s.trim(); });
      x = el('button', 'akt akt-kartu'); x.type = 'button'; x.setAttribute('data-akt', 'kartu'); x.setAttribute('aria-pressed', 'false');
      var dp = el('span', 'kartu-muka depan'); sebaris(dp, kb[0] || '', true); var bl = el('span', 'kartu-muka belakang'); sebaris(bl, kb[1] || '', true);
      x.appendChild(dp); x.appendChild(bl); x.appendChild(el('span', 'kartu-ketuk', 'ketuk untuk membalik ↻')); return x;
    }
    if (b.t === 'urut') {
      var ub = b.x.split('|'), uisi = (ub[1] || '').split(';;').map(function (s) { return s.trim(); }).filter(Boolean);
      x = el('div', 'akt akt-urut'); x.setAttribute('data-akt', 'urut'); x.setAttribute('data-urut', JSON.stringify(uisi));
      x.appendChild(el('p', 'akt-label', '🔢 Urutkan!')); var ut = el('p', 'akt-tanya'); ut.setAttribute('data-b', ''); sebaris(ut, (ub[0] || '').trim(), true); x.appendChild(ut);
      var uh = el('ol', 'urut-hasil'); uh.setAttribute('data-urut-hasil', ''); x.appendChild(uh);
      var up = el('div', 'urut-pilihan'); up.setAttribute('data-akt-isi', ''); x.appendChild(up); return x;
    }
    if (b.t === 'cocok') {
      var ps = b.x.split(';').map(function (p) { return p.split('=').map(function (s) { return s.trim(); }); }).filter(function (p) { return p.length === 2 && p[0] && p[1]; });
      x = el('div', 'akt akt-cocok'); x.setAttribute('data-akt', 'cocok'); x.setAttribute('data-pasang', JSON.stringify(ps));
      x.appendChild(el('p', 'akt-label', '🧩 Pasangkan!')); x.appendChild(el('p', 'akt-tanya', 'Ketuk satu kotak di kiri, lalu pasangannya di kanan.'));
      var pp = el('div', 'cocok-papan'); pp.setAttribute('data-akt-isi', ''); x.appendChild(pp); return x;
    }
    x = el(b.t === 'h' ? 'h3' : b.t === 'q' ? 'blockquote' : 'p', kelas);
    if (b.t === 'ar') { x.lang = 'ar'; x.dir = 'rtl'; }
    if (b.t === 'en') x.lang = 'en';
    if (b.t === 'tr' || b.t === 'lt') x.setAttribute('data-tr', '');
    if (b.t !== 'lt' && b.t !== 'cat') x.setAttribute('data-b', '');
    sebaris(x, b.x, b.t !== 'ar' && b.t !== 'lt');
    return x;
  }
  function pasangBab(bab) {
    isi.textContent = '';
    var kep = el('header', 'baca-kepala-bab'); kep.setAttribute('data-b', '');
    kep.appendChild(el('p', 'bkb-n', 'Bab ' + bab.n + ' dari ' + data.bab.length)); kep.appendChild(el('h1', 'bkb-j', bab.judul));
    if (bab.judulAr) { var ja = el('p', 'bkb-ar', bab.judulAr); ja.lang = 'ar'; ja.dir = 'rtl'; kep.appendChild(ja); }
    isi.appendChild(kep);
    bab.blok.forEach(function (b) { var x = rakitBlok(b); if (x) isi.appendChild(x); });
    hidupkanAktivitas(isi);
    babKini = bab.n;
    var sel = $('[data-baca-bab]', baca); if (sel) sel.value = String(bab.n);
    history.replaceState(null, '', tautBab(data.id, bab.n));
    d.title = bab.judul + ' — ' + data.judul + ' | Pustaka Yapida';
    var nav = $('.baca-babnav', baca);
    if (nav) {
      nav.textContent = '';
      var sb = data.bab[bab.n - 2], ss = data.bab[bab.n];
      var a1 = sb ? el('a', '', '‹ ' + sb.j.slice(0, 50)) : el('span'); if (sb) a1.href = tautBab(data.id, sb.n);
      var a2 = el('a', '', ss ? ss.j.slice(0, 50) + ' ›' : 'Selesai — kembali ke buku ›'); a2.href = ss ? tautBab(data.id, ss.n) : tautBuku(data.id);
      nav.appendChild(a1); nav.appendChild(a2);
    }
  }
  var muatBab = {};
  function ambilBab(n) {
    if (!muatBab[n]) muatBab[n] = fetch('/pustaka/api/b/' + encodeURIComponent(data.id) + '/' + n).then(function (r) { if (!r.ok) throw new Error('bab'); return r.json(); });
    return muatBab[n];
  }
  function gantiBab(n, lanjutBaca, halAwal) {
    return ambilBab(n).then(function (bab) {
      pasangBab(bab); hal = 0; tata();
      if (halAwal === -1) { hal = jumlah - 1; isi.style.transform = 'translateX(' + (-hal * lebar) + 'px)'; posisi(); }
      window.scrollTo({ top: baca.offsetTop - 10, behavior: 'auto' });
      if (n < data.bab.length) ambilBab(n + 1).catch(function () {});
      if (lanjutBaca) dengar(0);
    }).catch(function () { location.href = tautBab(data.id, n); });
  }

  /* ── pengaturan ── */
  var tMode = $('[data-baca-mode]', baca);
  if (tMode) tMode.addEventListener('click', function () { mode = mode === 'halaman' ? 'gulir' : 'halaman'; atur.mode = mode; simpan.set('yp-baca-atur', atur); terapkanAtur(); hal = 0; tata(); });
  $$('[data-baca-huruf]', baca).forEach(function (b) { b.addEventListener('click', function () { var f = (atur.huruf || 19) + Number(b.getAttribute('data-baca-huruf')) * 1.5; atur.huruf = Math.max(14, Math.min(32, f)); simpan.set('yp-baca-atur', atur); terapkanAtur(); tata(); }); });
  var tTema = $('[data-baca-tema]', baca);
  if (tTema) tTema.addEventListener('click', function () { var u = ['terang', 'sepia', 'malam']; atur.kertas = u[(u.indexOf(atur.kertas || 'terang') + 1) % 3]; simpan.set('yp-baca-atur', atur); terapkanAtur(); });
  var tTr = $('[data-baca-terjemah]', baca);
  if (tTr) tTr.addEventListener('click', function () { atur.terjemah = atur.terjemah === false; simpan.set('yp-baca-atur', atur); terapkanAtur(); tata(); });
  var tLayar = $('[data-baca-layar]', baca);
  if (tLayar) tLayar.addEventListener('click', function () { if (d.fullscreenElement) d.exitFullscreen(); else if (baca.requestFullscreen) baca.requestFullscreen().then(function () { setTimeout(tata, 200); }).catch(function () {}); });
  var selBab = $('[data-baca-bab]', baca);
  if (selBab) selBab.addEventListener('change', function () { henti(); var n = Number(selBab.value); if (n >= 1 && n <= data.bab.length) gantiBab(n, false, 0); });
  var tunda = 0;
  window.addEventListener('resize', function () { clearTimeout(tunda); tunda = setTimeout(tata, 150); });
  window.addEventListener('scroll', function () { if (mode === 'gulir') { clearTimeout(tunda); tunda = setTimeout(posisi, 200); } }, { passive: true });

  /* ── suara ── */
  var S = window.YapidaSuara, kendali = null, tDengar = $('[data-baca-dengar]', baca), lDengar = $('[data-dengar-label]', baca);
  var selPencerita = $('[data-pencerita]', baca), selCepat = $('[data-kecepatan]', baca);
  if (atur.pencerita && selPencerita) selPencerita.value = atur.pencerita;
  if (atur.kecepatan && selCepat) selCepat.value = String(atur.kecepatan);
  if (selPencerita) selPencerita.addEventListener('change', function () { atur.pencerita = selPencerita.value; simpan.set('yp-baca-atur', atur); if (kendali) dengar(); });
  if (selCepat) selCepat.addEventListener('change', function () { atur.kecepatan = Number(selCepat.value); simpan.set('yp-baca-atur', atur); if (kendali) dengar(); });
  var panel = $('[data-suara-panel]', baca), tPanel = $('[data-suara-atur]', baca);
  function isiPanel() {
    var semua = S && S.daftar ? S.daftar() : [], pilihan = simpan.get('yp-suara-pilih', {});
    $$('[data-suara-bhs]', panel).forEach(function (s) {
      var YS = window.YapidaSuara, b = s.getAttribute('data-suara-bhs'), kode = (YS && YS.kodeBahasa && YS.kodeBahasa[b]) || [b];
      s.textContent = ''; s.appendChild(el('option', '', 'Otomatis')).value = '';
      semua.filter(function (v) { return kode.some(function (k) { return YS && YS.cocokKode ? YS.cocokKode(v, k) : (v.lang || '').toLowerCase().indexOf(k) === 0; }); }).forEach(function (v) { var o = el('option', '', v.name + ' (' + v.lang + ')'); o.value = v.voiceURI; if (pilihan[b] === v.voiceURI) o.selected = true; s.appendChild(o); });
      s.onchange = function () { var p = simpan.get('yp-suara-pilih', {}); p[b] = s.value; simpan.set('yp-suara-pilih', p); };
    });
    var ket = $('[data-suara-ket]', panel);
    var adaId = semua.some(function (v) { return /^(id|in)([-_]|$)/i.test(v.lang); }), adaAr = semua.some(function (v) { return /^ar/i.test(v.lang); });
    if (ket) ket.textContent = (adaId ? 'Suara Indonesia (id-ID) tersedia — tidak memakai suara Melayu. ' : 'Suara Indonesia belum terpasang — pasang „Bahasa Indonesia“ di pengaturan teks-ke-ucapan HP agar logatnya Indonesia, bukan Melayu. ') + (adaAr ? 'Suara Arab tersedia.' : 'Suara Arab belum terpasang — pasang paket suara Arab di pengaturan teks-ke-ucapan HP.');
  }
  if (tPanel) tPanel.addEventListener('click', function () { panel.hidden = !panel.hidden; tPanel.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) isiPanel(); });
  var aktifBlok = null, tanda = S && S.penanda ? S.penanda() : null;
  function bersih() { if (aktifBlok) aktifBlok.classList.remove('dibaca'); aktifBlok = null; if (tanda) tanda.ulang(); }
  function halamanDari(x) { return mode === 'halaman' && lebar ? Math.max(0, Math.min(jumlah - 1, Math.floor((x.offsetLeft + 4) / lebar))) : 0; }
  function blokTerlihat() { return $$('[data-b]', isi).filter(function (x) { return x.offsetParent !== null && x.textContent.trim(); }); }
  /* Kata yang dibaca disorot; bila kata itu sudah di halaman berikutnya (hadits/paragraf panjang), halaman membalik
     sendiri — pemilik: „di hadits panjang tidak otomatis pindah ke halaman berikutnya, harus nya otomatis“. */
  function sorotKata(x, idx, p) {
    if (!tanda) return;
    var r = tanda.tandai(x, idx, p);
    if (!r) return;
    var rc = r.getBoundingClientRect();
    if (!rc.width && !rc.height) return;
    if (mode === 'halaman') {
      var kotak = lembar.getBoundingClientRect();
      if (rc.left >= kotak.right - 4 && hal < jumlah - 1) balik(Math.min(jumlah - 1, hal + Math.max(1, Math.floor((rc.left - kotak.left) / Math.max(1, lebar)))), 1);
      else if (rc.right <= kotak.left + 4 && hal > 0) balik(hal - 1, -1);
    } else if (rc.bottom > innerHeight - 90 || rc.top < 80) scrollBy({ top: rc.top - innerHeight * 0.4, behavior: tenang ? 'auto' : 'smooth' });
  }
  /* Perangkat tanpa suara Indonesia (sebagian HP memakai mesin suara bawaan pabrik) akan membaca dengan logat lain —
     beri petunjuk sekali per kunjungan agar pembaca memasang „Bahasa Indonesia“ (pemilik: „banyak yg make voice Malaysia“). */
  var sudahPetunjuk = false;
  function petunjukSuara() {
    if (sudahPetunjuk || !S || !S.siap) return;
    S.siap(function () {
      var bhs = (data && data.bahasa) || 'id';
      if (sudahPetunjuk || S.adaSuara(bhs === 'ar' ? 'id' : bhs)) return;
      sudahPetunjuk = true;
      var k = el('div', 'baca-petunjuk-suara');
      k.setAttribute('role', 'status');
      k.innerHTML = '<strong>Suara Indonesia belum terpasang di perangkat ini.</strong> Agar logatnya Indonesia (bukan Melayu): buka <em>Setelan → Bahasa → Keluaran teks-ke-ucapan</em>, pilih mesin <em>Google</em>, lalu unduh <em>Bahasa Indonesia</em>. Di komputer, Microsoft Edge sudah memiliki suara Indonesia yang jernih.';
      var x = el('button', 'baca-petunjuk-tutup', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Tutup petunjuk');
      x.addEventListener('click', function () { k.remove(); });
      k.appendChild(x);
      (baca || d.body).appendChild(k);
    });
  }
  function dengar(dari) {
    if (!S || !S.tersedia) return;
    petunjukSuara();
    if (kendali) kendali.henti();
    window.dispatchEvent(new Event('yp:audio-lain'));
    var blok = blokTerlihat(), mulai = typeof dari === 'number' ? dari : 0;
    if (typeof dari !== 'number' && mode === 'halaman') { mulai = 0; for (var i = 0; i < blok.length; i += 1) if (halamanDari(blok[i]) >= hal) { mulai = i; break; } }
    tDengar.setAttribute('aria-pressed', 'true'); lDengar.textContent = 'Jeda'; tDengar.firstElementChild.textContent = '❚❚';
    kendali = S.bacakan(blok, isi, {
      profil: selPencerita ? selPencerita.value : data.suara, kecepatan: selCepat ? Number(selCepat.value) : 1, mulai: mulai, pilihan: simpan.get('yp-suara-pilih', {}),
      saatBlok: function (i, x) {
        bersih(); aktifBlok = x; x.classList.add('dibaca');
        if (mode === 'halaman') { var h = halamanDari(x); if (h !== hal) balik(h, h > hal ? 1 : -1); }
        else x.scrollIntoView({ block: 'center', behavior: tenang ? 'auto' : 'smooth' });
      },
      saatKata: sorotKata,
      saatPotong: function (x, p) { sorotKata(x, 0, p); },
      saatSelesai: function () {
        bersih(); kendali = null;
        if (babKini < data.bab.length) { gantiBab(babKini + 1, true, 0); return; }
        selesaiDengar(); khatam();
      },
    });
  }
  function selesaiDengar() { tDengar.setAttribute('aria-pressed', 'false'); lDengar.textContent = 'Dengarkan'; tDengar.firstElementChild.textContent = '▶'; }
  function henti() { if (kendali) { kendali.henti(); kendali = null; } bersih(); selesaiDengar(); }
  function khatam() {
    var k = $('[data-khatam]', baca); if (!k) return;
    k.hidden = false; bunyi('menang'); percik(innerWidth / 2, innerHeight / 2, 34);
    k.addEventListener('click', function (e) { if (e.target === k) k.hidden = true; }, { once: true });
  }
  if (!S || !S.tersedia) { tDengar.disabled = true; lDengar.textContent = 'Suara tidak tersedia di peramban ini'; }
  else tDengar.addEventListener('click', function () {
    if (kendali && kendali.sedang()) { kendali.jeda(); lDengar.textContent = 'Lanjutkan'; tDengar.firstElementChild.textContent = '▶'; return; }
    if (kendali) { kendali.lanjut(); lDengar.textContent = 'Jeda'; tDengar.firstElementChild.textContent = '❚❚'; return; }
    dengar();
  });
  window.addEventListener('pagehide', function () { if (kendali) kendali.henti(); });

  /* ── mulai ── */
  terapkanAtur();
  var siap = function () {
    tata();
    var p = progres[data.id];
    if (p && p.n === data.n && mode === 'halaman' && p.f > 0 && p.f < 1) { hal = Math.round(p.f * (jumlah - 1)); isi.style.transform = 'translateX(' + (-hal * lebar) + 'px)'; posisi(); }
    if (data.n < data.bab.length) ambilBab(data.n + 1).catch(function () {});
  };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(siap); else siap();
  var hariIni = new Date().toISOString().slice(0, 10), log = simpan.get('yp-baca-log', {});
  if (log[data.id] !== hariIni) {
    fetch('/pustaka/api/baca', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: data.id }) }).then(function (r) { if (r.ok) { log[data.id] = hariIni; simpan.set('yp-baca-log', log); } }).catch(function () {});
  }
  if (sumber.get('dengar') === '1' && S && S.tersedia) {
    var m = $('[data-mulai-dengar]', baca);
    if (m) { m.hidden = false; $('button', m).addEventListener('click', function () { m.hidden = true; dengar(); }); }
  }
  baca.addEventListener('yp:skor', function () {
    var semua = $$('.akt-kuis, .akt-cocok', isi), beres = $$('.akt-kuis.selesai, .akt-cocok.selesai', isi);
    if (semua.length && semua.length === beres.length) { var r = baca.getBoundingClientRect(); setTimeout(function () { bunyi('menang'); percik(r.left + r.width / 2, innerHeight / 2, 30); }, 300); }
  });
})();
