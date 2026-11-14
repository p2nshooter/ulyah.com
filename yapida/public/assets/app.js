/* yapida.sch.id — interaksi halaman publik. Tanpa pustaka; semua gerak menghormati prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var simpan = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* abaikan */ } } };

  /* ── tema ─────────────────────────────────────────────── */
  $$('[data-tema-ganti]').forEach(function (b) {
    b.addEventListener('click', function () {
      var malam = root.getAttribute('data-tema') !== 'malam';
      root.setAttribute('data-tema', malam ? 'malam' : 'siang');
      simpan.set('yp-tema', malam ? 'malam' : 'siang');
    });
  });

  /* ── kepala & menu ────────────────────────────────────── */
  var kepala = $('[data-kepala]');
  if (kepala) {
    var gulir = function () { kepala.classList.toggle('gulir', window.scrollY > 12); };
    gulir(); window.addEventListener('scroll', gulir, { passive: true });
  }
  var menu = $('[data-menu]'), bukaMenu = $('[data-menu-buka]');
  if (menu && bukaMenu) {
    bukaMenu.addEventListener('click', function () {
      var buka = menu.classList.toggle('buka');
      bukaMenu.setAttribute('aria-expanded', String(buka));
      $$('[data-mega]', menu).forEach(function (m) { m.hidden = !buka; });
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('buka')) bukaMenu.click(); });
  }
  $$('.menu-induk').forEach(function (induk) {
    var mega = $('[data-mega]', induk), t;
    if (!mega) return;
    var lebar = function () { return window.matchMedia('(min-width:1021px)').matches; };
    var buka = function () { if (lebar()) { clearTimeout(t); mega.hidden = false; } };
    var tutup = function () { if (lebar()) t = setTimeout(function () { mega.hidden = true; }, 160); };
    induk.addEventListener('mouseenter', buka); induk.addEventListener('mouseleave', tutup);
    induk.addEventListener('focusin', buka); induk.addEventListener('focusout', tutup);
  });

  /* ── muncul saat tergulir ─────────────────────────────── */
  var muncul = $$('.muncul');
  if ('IntersectionObserver' in window && !tenang) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('tampak'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    muncul.forEach(function (el) {
      var sdr = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--i', String(Math.min(sdr, 8)));
      io.observe(el);
    });
  } else muncul.forEach(function (el) { el.classList.add('tampak'); });

  /* ── angka menghitung ─────────────────────────────────── */
  if ('IntersectionObserver' in window && !tenang) {
    var ioA = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        ioA.unobserve(e.target);
        var el = e.target, akhir = Number(el.getAttribute('data-hitung'));
        if (!isFinite(akhir) || String(akhir) !== el.getAttribute('data-hitung')) return;
        var awal = akhir > 1000 ? akhir - 60 : 0, t0 = performance.now(), lama = 1400;
        (function langkah(t) {
          var p = Math.min(1, (t - t0) / lama), k = 1 - Math.pow(1 - p, 4);
          el.textContent = String(Math.round(awal + (akhir - awal) * k));
          if (p < 1) requestAnimationFrame(langkah);
        })(t0);
      });
    }, { threshold: 0.6 });
    $$('[data-hitung]').forEach(function (el) { ioA.observe(el); });
  }

  /* ── kartu miring mengikuti kursor ────────────────────── */
  if (!tenang && window.matchMedia('(hover:hover)').matches) {
    $$('[data-miring]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', ((x - 0.5) * 10).toFixed(2));
        el.style.setProperty('--ry', ((0.5 - y) * 8).toFixed(2));
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0'); el.style.setProperty('--ry', '0'); });
    });
    var par = $('[data-paralaks]');
    if (par) window.addEventListener('pointermove', function (e) {
      par.style.setProperty('--px', ((e.clientX / window.innerWidth - 0.5) * -22).toFixed(1));
      par.style.setProperty('--py', ((e.clientY / window.innerHeight - 0.5) * -14).toFixed(1));
    }, { passive: true });
  }

  /* ── saring lembaga ───────────────────────────────────── */
  $$('[data-saring]').forEach(function (bar) {
    var daftar = bar.parentElement && $('[data-saring-daftar]', bar.parentElement);
    if (!daftar) return;
    var tombol = $$('[data-saring-nilai]', bar);
    tombol.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-saring-nilai');
        tombol.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        var n = 0;
        $$('[data-kelompok]', daftar).forEach(function (k) {
          var cocok = v === 'semua' || k.getAttribute('data-kelompok') === v;
          k.hidden = !cocok;
          if (cocok) { k.classList.remove('tampak'); k.style.setProperty('--i', String(Math.min(n++, 8))); void k.offsetWidth; k.classList.add('tampak'); }
        });
      });
    });
  });

  /* ── linimasa ─────────────────────────────────────────── */
  $$('[data-linimasa]').forEach(function (lm) {
    var tb = $$('[data-linimasa-tbl]', lm), pn = $$('[data-linimasa-panel]', lm), kini = 0, otomatis = null;
    var pilih = function (i, olehOrang) {
      kini = (i + tb.length) % tb.length;
      tb.forEach(function (b, j) { b.setAttribute('aria-selected', String(j === kini)); b.tabIndex = j === kini ? 0 : -1; });
      pn.forEach(function (p, j) { p.classList.toggle('aktif', j === kini); });
      if (olehOrang && otomatis) { clearInterval(otomatis); otomatis = null; }
    };
    tb.forEach(function (b, i) {
      b.addEventListener('click', function () { pilih(i, true); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { pilih(kini + 1, true); tb[kini].focus(); }
        if (e.key === 'ArrowLeft') { pilih(kini - 1, true); tb[kini].focus(); }
      });
    });
    var x0 = null;
    lm.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lm.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 48) pilih(kini + (dx < 0 ? 1 : -1), true);
    });
    if (!tenang && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !otomatis && tb.length > 1) otomatis = setInterval(function () { pilih(kini + 1, false); }, 5200);
        else if (!es[0].isIntersecting && otomatis) { clearInterval(otomatis); otomatis = null; }
      }, { threshold: 0.5 }).observe(lm);
    }
  });

  /* ── langit berbintang di hero (kanvas; bintang mendekat ke kursor, ketuk = percikan) ── */
  var kanvas = $('[data-langit]');
  if (kanvas && kanvas.getContext) {
    var ctx = kanvas.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), bintang = [], percik = [], ptr = { x: -999, y: -999 }, jalan = false, raf = 0;
    var ukur = function () {
      var r = kanvas.getBoundingClientRect(); W = r.width; H = r.height;
      kanvas.width = Math.round(W * dpr); kanvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, (W * H) / 16000)); bintang = [];
      for (var i = 0; i < n; i++) bintang.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.6, f: Math.random() * 6.28, v: 0.4 + Math.random() * 1.1, a: Math.random() * 6.28, dx: 0, dy: 0 });
    };
    var gambarBintang = function (x, y, r, sudut, alfa) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(sudut); ctx.globalAlpha = alfa; ctx.beginPath();
      for (var i = 0; i < 16; i++) { var rr = i % 2 ? r * 0.46 : r, a = (i * Math.PI) / 8; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    };
    var gambar = function (t) {
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#ecd990';
      for (var i = 0; i < bintang.length; i++) {
        var b = bintang[i], jx = ptr.x - b.x, jy = ptr.y - b.y, jarak = Math.sqrt(jx * jx + jy * jy), dekat = Math.max(0, 1 - jarak / 170);
        b.dx += (jx * dekat * 0.06 - b.dx) * 0.08; b.dy += (jy * dekat * 0.06 - b.dy) * 0.08;
        var kedip = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / 1000 * b.v + b.f));
        gambarBintang(b.x + b.dx, b.y + b.dy, b.r * (1 + dekat * 2.2), b.a + t / 6000 * b.v, Math.min(1, kedip * 0.6 + dekat));
      }
      for (var j = percik.length - 1; j >= 0; j--) {
        var p = percik[j]; p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.h -= 0.016;
        if (p.h <= 0) { percik.splice(j, 1); continue; }
        gambarBintang(p.x, p.y, p.r, p.h * 6, p.h);
      }
      ctx.globalAlpha = 1;
      if (jalan) raf = requestAnimationFrame(gambar);
    };
    var mulai = function () { if (!jalan && !tenang) { jalan = true; raf = requestAnimationFrame(gambar); } };
    var henti = function () { jalan = false; cancelAnimationFrame(raf); };
    ukur(); if (tenang) gambar(0);
    window.addEventListener('resize', function () { ukur(); if (tenang) gambar(0); });
    var hero = kanvas.parentElement;
    hero.addEventListener('pointermove', function (e) { var r = kanvas.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; }, { passive: true });
    hero.addEventListener('pointerleave', function () { ptr.x = ptr.y = -999; });
    hero.addEventListener('pointerdown', function (e) {
      if (tenang || e.target.closest('a,button')) return;
      var r = kanvas.getBoundingClientRect();
      for (var i = 0; i < 14; i++) { var a = Math.random() * 6.28, v = 1 + Math.random() * 3; percik.push({ x: e.clientX - r.left, y: e.clientY - r.top, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, r: 2 + Math.random() * 3, h: 1 }); }
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? mulai() : henti(); }).observe(kanvas); else mulai();
    d.addEventListener('visibilitychange', function () { d.hidden ? henti() : mulai(); });
  }

  /* ── tanggal hijriah & jam WIB ────────────────────────── */
  var hij = $('[data-hijri]'), jam = $('[data-jam]');
  var waktu = function () {
    var kini = new Date();
    try {
      if (hij) hij.textContent = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(kini).replace(/\s*(AH|H)\.?$/, '') + ' H';
      if (jam) jam.textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(kini) + ' WIB';
    } catch (e) { if (jam) jam.textContent = kini.toLocaleDateString('id-ID'); }
  };
  if (hij || jam) { waktu(); setInterval(waktu, 30000); }
  $$('[data-tahun]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ── salin ────────────────────────────────────────────── */
  $$('[data-salin]').forEach(function (b) {
    b.addEventListener('click', function () {
      var teks = b.getAttribute('data-salin'), asli = b.textContent;
      var selesai = function () { b.textContent = 'Tersalin ✓'; setTimeout(function () { b.textContent = asli; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(teks).then(selesai, function () {});
      else { var ta = d.createElement('textarea'); ta.value = teks; d.body.appendChild(ta); ta.select(); try { d.execCommand('copy'); selesai(); } catch (e) { /* abaikan */ } d.body.removeChild(ta); }
    });
  });

  /* ── tasbih digital ───────────────────────────────────── */
  var tasbih = $('[data-tasbih]');
  if (tasbih) {
    var DZIKIR = [
      { id: 'tasbih', ar: 'سُبْحَانَ ٱللَّٰهِ', la: 'Subhanallah — Mahasuci Allah', n: 33 },
      { id: 'tahmid', ar: 'ٱلْحَمْدُ لِلَّٰهِ', la: 'Alhamdulillah — Segala puji bagi Allah', n: 33 },
      { id: 'takbir', ar: 'ٱللَّٰهُ أَكْبَرُ', la: 'Allahu Akbar — Allah Mahabesar', n: 33 },
      { id: 'tahlil', ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', la: 'La ilaha illallah — Tiada Tuhan selain Allah', n: 100 },
      { id: 'istighfar', ar: 'أَسْتَغْفِرُ ٱللَّٰهَ', la: 'Astaghfirullah — Aku memohon ampun kepada Allah', n: 100 },
      { id: 'shalawat', ar: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', la: 'Allahumma shalli ‘ala Muhammad', n: 100 }
    ];
    var NAMA = { tasbih: 'Tasbih', tahmid: 'Tahmid', takbir: 'Takbir', tahlil: 'Tahlil', istighfar: 'Istighfar', shalawat: 'Shalawat' };
    var st = { i: 0, c: 0, p: 0 };
    try { var lama = JSON.parse(simpan.get('yp-tasbih') || 'null'); if (lama && DZIKIR[lama.i]) st = lama; } catch (e) { /* mulai baru */ }
    var elAr = $('[data-tasbih-arab]', tasbih), elLa = $('[data-tasbih-latin]', tasbih), elN = $('[data-tasbih-angka]', tasbih), elT = $('[data-tasbih-target]', tasbih), elM = $('[data-tasbih-maju]', tasbih), elP = $('[data-tasbih-putaran]', tasbih), elPilih = $('[data-tasbih-pilih]', tasbih), manik = $('[data-tasbih-ketuk]', tasbih), kartu = $('.tasbih-kartu', tasbih), pemicu = null;
    DZIKIR.forEach(function (z, i) {
      var b = d.createElement('button'); b.type = 'button'; b.textContent = NAMA[z.id];
      b.addEventListener('click', function () { st = { i: i, c: 0, p: 0 }; lukis(); });
      elPilih.appendChild(b);
    });
    var lukis = function () {
      var z = DZIKIR[st.i];
      elAr.textContent = z.ar; elLa.textContent = z.la; elN.textContent = String(st.c); elT.textContent = 'dari ' + z.n; elP.textContent = 'Putaran ' + st.p;
      elM.style.strokeDashoffset = String(553 - 553 * (st.c / z.n));
      $$('button', elPilih).forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === st.i)); });
      simpan.set('yp-tasbih', JSON.stringify(st));
    };
    manik.addEventListener('click', function () {
      var z = DZIKIR[st.i]; st.c += 1;
      if (navigator.vibrate) navigator.vibrate(st.c >= z.n ? [60, 40, 120] : 12);
      if (st.c >= z.n) {
        st.c = 0; st.p += 1;
        if (st.i < 2) st.i += 1;            /* 33× tasbih → tahmid → takbir, urutan wirid selepas shalat */
        else if (st.i === 2) st.i = 0;
        kartu.classList.remove('tasbih-selesai'); void kartu.offsetWidth; kartu.classList.add('tasbih-selesai');
      }
      lukis();
    });
    var bukaT = function () { pemicu = d.activeElement; tasbih.hidden = false; lukis(); manik.focus(); };
    var tutupT = function () { tasbih.hidden = true; if (pemicu && pemicu.focus) pemicu.focus(); };
    $$('[data-tasbih-buka]').forEach(function (b) { b.addEventListener('click', bukaT); });
    $$('[data-tasbih-tutup]', tasbih).forEach(function (b) { b.addEventListener('click', tutupT); });
    $('[data-tasbih-ulang]', tasbih).addEventListener('click', function () { st.c = 0; st.p = 0; lukis(); });
    tasbih.addEventListener('click', function (e) { if (e.target === tasbih) tutupT(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !tasbih.hidden) tutupT(); });
  }

  /* ── aplikasi terpasang (PWA) ─────────────────────────────
     Spanduk "Pasang aplikasi" muncul di paling atas selama situs BELUM terpasang, hilang begitu terpasang, dan muncul lagi
     bila aplikasinya dihapus (peramban kembali mengirim beforeinstallprompt). Menutup spanduk hanya berlaku untuk kunjungan itu. */
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  (function () {
    var berdiri = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    if (berdiri) return;
    var tunda = null, spanduk = null;
    var ditutup = function () { try { return sessionStorage.getItem('yp-pasang-tutup') === '1'; } catch (e) { return false; } };
    var sembunyi = function () { if (spanduk) { spanduk.remove(); spanduk = null; } };
    var tampil = function (ios) {
      if (spanduk || ditutup()) return;
      spanduk = d.createElement('div'); spanduk.className = 'pasang'; spanduk.setAttribute('role', 'region'); spanduk.setAttribute('aria-label', 'Pasang aplikasi');
      spanduk.innerHTML = '<span class="pasang-ikon" aria-hidden="true"><img src="/assets/logo-192.webp" width="20" height="25" alt=""></span><div class="pasang-teks"><b>Pasang aplikasi Yapida di HP</b><span data-pasang-ket></span></div><button class="tbl tbl-emas tbl-kecil" type="button" data-pasang-ya></button><button class="tbl-ikon" type="button" data-pasang-tutup aria-label="Tutup">✕</button>';
      var ket = $('[data-pasang-ket]', spanduk), ya = $('[data-pasang-ya]', spanduk);
      if (ios) { ket.textContent = 'Ketuk tombol Bagikan di Safari, lalu pilih “Tambah ke Layar Utama”.'; ya.textContent = 'Mengerti'; ya.addEventListener('click', function () { try { sessionStorage.setItem('yp-pasang-tutup', '1'); } catch (e) { /* abaikan */ } sembunyi(); }); }
      else {
        ket.textContent = 'Buka langsung dari layar utama — lebih cepat, tanpa toko aplikasi.'; ya.textContent = 'Pasang';
        ya.addEventListener('click', function () {
          if (!tunda) return;
          tunda.prompt();
          tunda.userChoice.then(function (r) { if (r && r.outcome === 'accepted') sembunyi(); tunda = null; }, function () {});
        });
      }
      $('[data-pasang-tutup]', spanduk).addEventListener('click', function () { try { sessionStorage.setItem('yp-pasang-tutup', '1'); } catch (e) { /* abaikan */ } sembunyi(); });
      d.body.insertBefore(spanduk, d.body.firstChild);
    };
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); tunda = e; tampil(false); });
    window.addEventListener('appinstalled', function () { tunda = null; sembunyi(); });
    var ua = navigator.userAgent || '';
    var ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (ios && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)) tampil(true);
  })();
})();
