/* yapida.sch.id — portal: papan PIN acak, unggah foto (dikecilkan di perangkat), album, alat Markdown, penjaga formulir. */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  d.documentElement.classList.add('js');

  /* ── papan PIN ─────────────────────────────────────────── */
  $$('[data-pinpad]').forEach(function (papan) {
    var form = papan.closest('form'), mode = papan.getAttribute('data-pinpad');
    var titik = $$('[data-pin-titik] i', papan), judul = $('[data-pin-judul]', papan), ket = $('[data-pin-ket]', papan);
    var k1 = $('[data-pin-k]', papan), k2 = $('[data-pin-k2]', papan), akun = form && $('[data-pin-akun]', form);
    var isi = [], tahap = 1, kirim = false, judulAsli = judul.textContent, ketAsli = ket.textContent;
    var lukis = function () { titik.forEach(function (t, i) { t.classList.toggle('isi', i < isi.length); }); };
    var goyang = function (pesan) { papan.classList.remove('goyang'); void papan.offsetWidth; papan.classList.add('goyang'); if (pesan) ket.textContent = pesan; if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate([40, 30, 40]); };
    var siap = function () { return !akun || akun.value; };
    var mati = function () { papan.classList.toggle('mati', !siap()); };
    if (akun) { akun.addEventListener('change', function () { mati(); isi = []; lukis(); ket.textContent = ketAsli; }); mati(); }
    var selesai = function () {
      if (mode === 'buat' && tahap === 1) {
        k1.value = isi.join(''); isi = []; tahap = 2; lukis();
        judul.textContent = 'Ulangi PIN'; ket.textContent = 'Ketuk 5 angka yang sama sekali lagi.';
        return;
      }
      (mode === 'buat' ? k2 : k1).value = isi.join('');
      kirim = true; papan.classList.add('kirim'); ket.textContent = 'Memeriksa…';
      var kode = form.querySelector('[name="kode"]');
      if (kode && !kode.value.trim()) { kirim = false; papan.classList.remove('kirim'); isi = []; tahap = 1; k1.value = ''; lukis(); judul.textContent = judulAsli; goyang('Isi kode pemasangan dulu.'); kode.focus(); return; }
      form.submit();
    };
    papan.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || kirim) return;
      if (!siap()) { goyang('Pilih akun dulu.'); if (akun) akun.focus(); return; }
      if (b.hasAttribute('data-pin-hapus')) { isi.pop(); lukis(); return; }
      if (b.hasAttribute('data-pin-ulang')) { isi = []; lukis(); return; }
      var pos = b.getAttribute('data-pos');
      if (pos === null || isi.length >= 5) return;
      isi.push(pos); lukis();
      b.classList.remove('ketuk'); void b.offsetWidth; b.classList.add('ketuk');
      if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(10);
      if (isi.length === 5) { if (mode === 'buat' && tahap === 1) selesai(); else { kirim = true; setTimeout(function () { kirim = false; selesai(); }, 160); } }
    });
    if (form) form.addEventListener('submit', function (e) { if (!kirim) e.preventDefault(); });
    if (d.querySelector('.p-kilat-galat')) goyang();
  });

  /* ── menu samping ──────────────────────────────────────── */
  var sisi = $('[data-sisi]');
  $$('[data-sisi-buka]').forEach(function (b) { b.addEventListener('click', function () { sisi.classList.toggle('buka'); }); });
  d.addEventListener('click', function (e) { if (sisi && sisi.classList.contains('buka') && !e.target.closest('[data-sisi],[data-sisi-buka]')) sisi.classList.remove('buka'); });

  /* ── konfirmasi, cetak ─────────────────────────────────── */
  $$('form[data-yakin]').forEach(function (f) { f.addEventListener('submit', function (e) { if (!window.confirm(f.getAttribute('data-yakin'))) e.preventDefault(); }); });
  $$('[data-cetak]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ── penjaga formulir ──────────────────────────────────── */
  var kotor = false;
  $$('form[data-form-jaga]').forEach(function (f) {
    f.addEventListener('input', function () { kotor = true; });
    f.addEventListener('submit', function () { kotor = false; });
  });
  window.addEventListener('beforeunload', function (e) { if (kotor) { e.preventDefault(); e.returnValue = ''; } });

  /* ── unggah: foto dikecilkan di perangkat (EXIF ikut terbuang), PDF dikirim apa adanya ── */
  function kecilkan(file, maks, mutu) {
    return new Promise(function (ok, gagal) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var s = Math.min(1, maks / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
        var cv = d.createElement('canvas'); cv.width = w; cv.height = h;
        var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { b ? ok(b) : gagal(new Error('Foto tidak bisa diproses.')); }, 'image/jpeg', mutu);
      };
      img.onerror = function () { URL.revokeObjectURL(url); gagal(new Error('Berkas ini bukan foto yang bisa dibaca.')); };
      img.src = url;
    });
  }
  var unitForm = function (el) { var f = el.closest('form'); var s = f && f.querySelector('[name="unit"]'); return s ? s.value : ''; };
  function kirimBerkas(file, jenis, unit) {
    var siapkan = jenis === 'pdf' ? Promise.resolve([file, null]) : Promise.all([kecilkan(file, 1920, 0.86), kecilkan(file, 640, 0.8)]);
    return siapkan.then(function (b) {
      var fd = new FormData(); fd.append('berkas', b[0], 'berkas'); if (b[1]) fd.append('kecil', b[1], 'kecil'); fd.append('jenis', jenis); fd.append('unit', unit);
      return fetch('/portal/unggah', { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Unggahan gagal.'); return j; }); });
    });
  }
  window.YapidaUnggah = { kirimBerkas: kirimBerkas };
  $$('[data-unggah]').forEach(function (w) {
    var jenis = w.getAttribute('data-unggah'), inp = $('input[type="hidden"]', w), pra = $('[data-pratinjau]', w), st = $('[data-unggah-status]', w), hapus = $('[data-unggah-hapus]', w);
    $('input[type="file"]', w).addEventListener('change', function () {
      var file = this.files && this.files[0]; this.value = '';
      if (!file) return;
      st.textContent = 'Mengunggah…';
      kirimBerkas(file, jenis, unitForm(w)).then(function (j) {
        inp.value = j.f; kotor = true; hapus.hidden = false; st.textContent = 'Tersimpan ✓ — jangan lupa tekan Simpan.';
        pra.innerHTML = jenis === 'pdf' ? '<a target="_blank" rel="noopener"></a>' : '<img alt="">';
        var el = pra.firstChild; if (jenis === 'pdf') { el.href = j.url; el.textContent = 'PDF terunggah — lihat'; } else el.src = j.urlKecil || j.url;
      }).catch(function (e) { st.textContent = e.message; });
    });
    hapus.addEventListener('click', function () { inp.value = ''; pra.innerHTML = ''; hapus.hidden = true; kotor = true; st.textContent = ''; });
  });

  /* ── album foto: tambah banyak, keterangan, urutkan, hapus ── */
  $$('[data-galeri]').forEach(function (g) {
    var inp = $('input[type="hidden"]', g), kisi = $('[data-galeri-kisi]', g), st = $('[data-unggah-status]', g);
    var BERKAS = /^\d{4}\/\d{2}\/[0-9a-z]{16,40}(_k)?\.(jpg|png|webp)$/;
    var pratinjau = function (f) { var n = String(f || ''); return BERKAS.test(n) ? '/f/' + n.split('/').map(encodeURIComponent).join('/') : ''; };
    var foto = []; try { foto = JSON.parse(inp.value || '[]'); } catch (e) { foto = []; }
    var simpanNilai = function () { inp.value = JSON.stringify(foto); kotor = true; };
    var tarik = null;
    var lukis = function () {
      kisi.innerHTML = '';
      foto.forEach(function (p, i) {
        var el = d.createElement('div'); el.className = 'p-galeri-butir'; el.draggable = true;
        el.innerHTML = '<img alt=""><input type="text" maxlength="200" placeholder="Keterangan (opsional)"><div class="p-galeri-alat"><button type="button" data-a="kiri" aria-label="Geser ke kiri">‹</button><button type="button" data-a="kanan" aria-label="Geser ke kanan">›</button><button type="button" data-a="hapus" aria-label="Hapus foto">✕</button></div>';
        el.querySelector('img').src = pratinjau(p.k || p.f);
        var ket = el.querySelector('input'); ket.value = p.ket || '';
        ket.addEventListener('input', function () { p.ket = ket.value; simpanNilai(); });
        el.addEventListener('click', function (e) {
          var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
          if (a === 'hapus') foto.splice(i, 1);
          if (a === 'kiri' && i > 0) foto.splice(i - 1, 0, foto.splice(i, 1)[0]);
          if (a === 'kanan' && i < foto.length - 1) foto.splice(i + 1, 0, foto.splice(i, 1)[0]);
          simpanNilai(); lukis();
        });
        el.addEventListener('dragstart', function () { tarik = i; el.classList.add('tarik'); });
        el.addEventListener('dragend', function () { el.classList.remove('tarik'); });
        el.addEventListener('dragover', function (e) { e.preventDefault(); });
        el.addEventListener('drop', function (e) { e.preventDefault(); if (tarik === null || tarik === i) return; foto.splice(i, 0, foto.splice(tarik, 1)[0]); tarik = null; simpanNilai(); lukis(); });
        kisi.appendChild(el);
      });
    };
    lukis();
    $('input[type="file"]', g).addEventListener('change', function () {
      var files = Array.prototype.slice.call(this.files || []); this.value = '';
      var n = 0, gagal = 0;
      var berikut = function () {
        if (!files.length) { st.textContent = n + ' foto ditambahkan' + (gagal ? ', ' + gagal + ' gagal' : '') + ' — tekan Simpan.'; return; }
        var f = files.shift(); st.textContent = 'Mengunggah ' + (n + gagal + 1) + '…';
        kirimBerkas(f, 'gambar', unitForm(g)).then(function (j) { foto.push({ f: j.f, k: j.k }); n++; simpanNilai(); lukis(); }, function () { gagal++; }).then(berikut);
      };
      berikut();
    });
  });

  /* ── alat Markdown ─────────────────────────────────────── */
  $$('[data-md]').forEach(function (w) {
    var ta = $('textarea', w);
    var sisip = function (sebelum, sesudah) {
      var a = ta.selectionStart, b = ta.selectionEnd, v = ta.value, pilih = v.slice(a, b);
      ta.value = v.slice(0, a) + sebelum + pilih + sesudah + v.slice(b);
      ta.focus(); ta.selectionStart = a + sebelum.length; ta.selectionEnd = a + sebelum.length + pilih.length; kotor = true;
    };
    $$('[data-md-sisip]', w).forEach(function (b) { b.addEventListener('click', function () { var p = b.getAttribute('data-md-sisip').split('|'); sisip(p[0], p[1] || ''); }); });
    $$('[data-md-awal]', w).forEach(function (b) {
      b.addEventListener('click', function () {
        var pre = b.getAttribute('data-md-awal'), a = ta.selectionStart, b2 = ta.selectionEnd, v = ta.value;
        var awal = v.lastIndexOf('\n', a - 1) + 1, akhir = v.indexOf('\n', b2); if (akhir < 0) akhir = v.length;
        var blok = v.slice(awal, akhir).split('\n').map(function (l) { return l.indexOf(pre) === 0 ? l : pre + l; }).join('\n');
        ta.value = v.slice(0, awal) + blok + v.slice(akhir); ta.focus(); kotor = true;
      });
    });
    $$('[data-md-gambar]', w).forEach(function (b) {
      b.addEventListener('click', function () {
        var fi = d.createElement('input'); fi.type = 'file'; fi.accept = 'image/*';
        fi.addEventListener('change', function () {
          var f = fi.files && fi.files[0]; if (!f) return;
          b.textContent = 'Mengunggah…';
          kirimBerkas(f, 'gambar', unitForm(w)).then(function (j) { sisip('\n![Keterangan foto](' + j.url + ')\n', ''); b.textContent = 'Foto'; }, function (e) { b.textContent = 'Foto'; window.alert(e.message); });
        });
        fi.click();
      });
    });
  });
})();

/* ── dokumen cetak: pratinjau langsung (sertifikat, kwitansi, surat, kop) ── */
(function () {
  'use strict';
  var d = document;
  Array.prototype.slice.call(d.querySelectorAll('form[data-pratinjau]')).forEach(function (form) {
    // Alamat tujuan dipilih dari daftar tetap (atribut halaman hanya menyebut jenis dokumennya).
    var TUJUAN = { penghargaan: '/portal/cetak/penghargaan/pratinjau', kwitansi: '/portal/cetak/kwitansi/pratinjau', surat: '/portal/cetak/surat/pratinjau', kop: '/portal/cetak/kop/pratinjau' };
    var jenisDok = (/^\/portal\/cetak\/([a-z]+)\/pratinjau$/.exec(form.getAttribute('data-pratinjau') || '') || [])[1];
    var url = Object.prototype.hasOwnProperty.call(TUJUAN, jenisDok) ? TUJUAN[jenisDok] : '';
    if (!url) return;
    var bingkai = d.querySelector('[data-pratinjau-bingkai]'), wadah = bingkai && bingkai.parentNode, st = d.querySelector('[data-pratinjau-status]');
    if (!bingkai) return;
    var tunda = null;
    bingkai.addEventListener('load', function () { if (wadah) wadah.classList.remove('muat-ulang'); if (st) st.textContent = 'Berubah otomatis saat Anda mengetik.'; });
    function kirim() {
      // Salinan isian dikirim lewat formulir tersembunyi ke bingkai pratinjau (tanpa menyusun HTML di peramban).
      var f = d.createElement('form'); f.method = 'post'; f.action = url; f.target = 'pratinjau-dok'; f.hidden = true;
      Array.prototype.slice.call(form.elements).forEach(function (el) {
        if (!el.name || el.disabled || el.type === 'file' || el.type === 'submit' || el.type === 'button') return;
        if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
        var x = d.createElement('input'); x.type = 'hidden'; x.name = el.name; x.value = el.value; f.appendChild(x);
      });
      d.body.appendChild(f);
      if (wadah) wadah.classList.add('muat-ulang');
      if (st) st.textContent = 'Memperbarui…';
      f.submit();
      d.body.removeChild(f);
    }
    var jadwal = function () { clearTimeout(tunda); tunda = setTimeout(kirim, 450); };
    form.addEventListener('input', jadwal);
    form.addEventListener('change', jadwal);
    // Foto yang baru diunggah mengubah input tersembunyi tanpa memicu „input“: periksa berkala dengan murah.
    var jejak = '';
    setInterval(function () { var v = Array.prototype.slice.call(form.querySelectorAll('input[type="hidden"]')).map(function (x) { return x.value; }).join('|'); if (v !== jejak) { if (jejak) jadwal(); jejak = v; } }, 1200);
    kirim();
  });
})();

/* ── saring baris tabel (rak perpustakaan, daftar panjang) + fitur kesiswaan, pesan, grafik ── */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var kirimBerkas = function (f, j, u) { return window.YapidaUnggah.kirimBerkas(f, j, u); };
  Array.prototype.slice.call(document.querySelectorAll('input[data-saring-baris]')).forEach(function (inp) {
    var tabel = document.querySelector(inp.getAttribute('data-saring-baris'));
    if (!tabel) return;
    var baris = Array.prototype.slice.call(tabel.querySelectorAll('tbody tr'));
    inp.addEventListener('input', function () {
      var kata = inp.value.toLowerCase().split(/\s+/).filter(Boolean);
      baris.forEach(function (tr) { var t = tr.getAttribute('data-cari') || ''; tr.hidden = !kata.every(function (k) { return t.indexOf(k) >= 0; }); });
    });
  });

  /* ── kesiswaan: saringan langsung, unggah seret-lepas, pekerjaan bertahap, cetak ── */
  $$('form[data-saring-otomatis]').forEach(function (f) {
    $$('select', f).forEach(function (s) { s.addEventListener('change', function () { if (f.requestSubmit) f.requestSubmit(); else f.submit(); }); });
  });
  $$('[data-jatuh]').forEach(function (z) {
    var inp = $('input[type=file]', z), nama = $('[data-jatuh-nama]', z);
    var tampil = function () {
      var b = inp.files && inp.files[0];
      if (nama) nama.textContent = b ? (inp.files.length > 1 ? '✓ ' + inp.files.length + ' berkas dipilih' : '✓ ' + b.name + ' (' + Math.ceil(b.size / 1024) + ' KB)') : '';
      z.classList.toggle('terisi', !!b);
    };
    inp.addEventListener('change', tampil);
    ['dragenter', 'dragover'].forEach(function (e) { z.addEventListener(e, function (ev) { ev.preventDefault(); z.classList.add('seret'); }); });
    ['dragleave', 'drop'].forEach(function (e) { z.addEventListener(e, function () { z.classList.remove('seret'); }); });
    z.addEventListener('drop', function (ev) { ev.preventDefault(); if (ev.dataTransfer && ev.dataTransfer.files.length) { inp.files = ev.dataTransfer.files; tampil(); } });
  });
  $$('form[data-impor]').forEach(function (f) {
    f.addEventListener('submit', function () { var b = $('button[type=submit]', f); if (b) { b.disabled = true; b.textContent = 'Membaca file…'; } });
  });
  $$('[data-kerja]').forEach(function (kotak) {
    if (kotak.getAttribute('data-selesai') === '1') return;
    var id = kotak.getAttribute('data-kerja'), bar = $('.ks-progres span', kotak), teks = $('[data-kerja-teks]', kotak), lanjut = $('.ks-kerja-lanjut', kotak);
    if (lanjut) lanjut.hidden = true;
    var ubin = $$('.g-ubin-nilai', kotak), gagal = 0;
    var angka = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
    var langkah = function () {
      fetch('/portal/kerja/' + encodeURIComponent(id) + '/lanjut', { method: 'POST', headers: { accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) {
          gagal = 0;
          var persen = j.total ? Math.round(j.pos / j.total * 100) : 100;
          if (bar) bar.style.width = persen + '%';
          var pb = $('.ks-progres', kotak); if (pb) pb.setAttribute('aria-valuenow', j.pos);
          if (j.hasil && ubin.length >= 4) { ubin[0].textContent = angka(j.hasil.baru); ubin[1].textContent = angka(j.hasil.ubah); ubin[2].textContent = angka(j.hasil.lewat); ubin[3].textContent = angka(j.hasil.gagalN); }
          if (j.selesai) { if (teks) teks.textContent = 'Selesai — ' + angka(j.total) + ' baris diproses. Memuat hasil…'; setTimeout(function () { location.reload(); }, 600); return; }
          if (teks) teks.textContent = 'Memproses ' + angka(j.pos) + ' dari ' + angka(j.total) + ' baris… jangan tutup halaman ini.';
          langkah();
        })
        .catch(function () {
          gagal += 1;
          if (gagal > 4) { if (teks) teks.textContent = 'Koneksi terputus. Tekan Lanjutkan untuk meneruskan.'; if (lanjut) lanjut.hidden = false; return; }
          setTimeout(langkah, 1500 * gagal);
        });
    };
    langkah();
  });
  $$('[data-cetak-halaman]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ── grafik: keterangan saat disorot / difokus (teks lewat textContent) ── */
  var tip = null;
  var tunjuk = function (el, x, y) {
    if (!tip) { tip = d.createElement('div'); tip.className = 'g-tip'; tip.setAttribute('role', 'status'); d.body.appendChild(tip); }
    tip.textContent = el.getAttribute('data-tip');
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2)) + 'px';
    tip.style.top = Math.max(8, y - h - 12) + 'px';
  };
  var sembunyi = function () { if (tip) tip.hidden = true; };
  $$('[data-tip]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) { tunjuk(el, e.clientX, e.clientY); });
    el.addEventListener('pointerleave', sembunyi);
    el.addEventListener('focus', function () { var r = el.getBoundingClientRect(); tunjuk(el, r.left + r.width / 2, r.top); });
    el.addEventListener('blur', sembunyi);
  });

  /* ── impor data guru: foto banyak dikecilkan & diunggah dulu, lalu peta nama file → kunci foto dikirim ── */
  $$('form[data-impor-guru]').forEach(function (f) {
    var inp = $('input[data-foto-banyak]', f), peta = $('input[name="peta_foto"]', f), st = $('[data-foto-status]', f), siap = false;
    if (!inp || !peta) return;
    f.addEventListener('submit', function (ev) {
      if (siap || !inp.files || !inp.files.length) return;
      ev.preventDefault();
      var berkas = Array.prototype.slice.call(inp.files, 0, 300), hasil = {}, i = 0, tombol = $('button[type=submit]', f);
      if (tombol) { tombol.disabled = true; }
      var lanjut = function () {
        if (i >= berkas.length) {
          peta.value = JSON.stringify(hasil);
          inp.value = '';
          siap = true;
          if (st) st.textContent = 'Foto siap — membaca file Excel…';
          f.submit();
          return;
        }
        var b = berkas[i];
        if (st) st.textContent = 'Mengecilkan & mengunggah foto ' + (i + 1) + ' dari ' + berkas.length + '…';
        kirimBerkas(b, 'gambar', '').then(function (j) { hasil[b.name] = j.f; }).catch(function () { /* foto rusak dilewati */ }).then(function () { i += 1; lanjut(); });
      };
      lanjut();
    });
  });

  /* ── notifikasi pesan: lencana menu, judul tab, dan notifikasi perangkat bila diizinkan ── */
  (function () {
    var lencana = $('[data-lencana-pesan]');
    /* Tidak memeriksa pesan di halaman papan PIN (masuk / ganti PIN): jawaban server bisa merender ulang papan dan mengganti kuki tantangannya. */
    if (!lencana || !window.fetch || d.querySelector('[data-pinpad]')) return;
    var judulAsli = d.title, terakhir = -1, izin = $('[data-notif-izin]'), ket = $('[data-notif-ket]');
    var bisaNotif = 'Notification' in window;
    if (izin && bisaNotif && Notification.permission === 'default') { izin.hidden = false; izin.addEventListener('click', function () { Notification.requestPermission().then(function (p) { izin.hidden = p !== 'default'; if (ket) ket.textContent = p === 'granted' ? 'Notifikasi aktif di perangkat ini.' : 'Notifikasi tidak diizinkan.'; }); }); }
    else if (ket && bisaNotif && Notification.permission === 'granted') ket.textContent = 'Notifikasi pesan aktif di perangkat ini.';
    var periksa = function () {
      fetch('/portal/pesan/hitung', { headers: { accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j) return;
          lencana.hidden = !j.total; lencana.textContent = j.total > 99 ? '99+' : String(j.total);
          var ls = $('[data-lencana-saran]');
          if (ls) { ls.hidden = !j.saran; ls.textContent = j.saran > 99 ? '99+' : String(j.saran || ''); }
          d.title = (j.total ? '(' + j.total + ') ' : '') + judulAsli;
          if (terakhir >= 0 && j.total > terakhir && j.terbaru && bisaNotif && Notification.permission === 'granted' && d.hidden) {
            try { var n = new Notification('Pesan ' + j.terbaru.jenis + ' — ' + j.terbaru.dari, { body: j.terbaru.cuplikan, icon: '/assets/icon-192.png', tag: 'yapida-pesan' }); n.onclick = function () { window.focus(); location.href = j.terbaru.href; }; } catch (e) { /* abaikan */ }
          }
          terakhir = j.total;
        })
        .catch(function () { /* coba lagi nanti */ });
    };
    periksa();
    setInterval(function () { if (!d.hidden) periksa(); }, 30000);
    d.addEventListener('visibilitychange', function () { if (!d.hidden) periksa(); });
  })();

  /* ── alamat lembaga: pratinjau penulisan baku saat mengetik (server menulis versi finalnya) ── */
  $$('[data-alamat]').forEach(function (w) {
    var hasil = $('[data-alamat-hasil]', w);
    var v = function (n) { var el = $('[name="' + n + '"]', w); return el ? (el.type === 'checkbox' ? el.checked : el.value.replace(/\s+/g, ' ').trim()) : ''; };
    var judul = function (s) { return s && s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }) : s; };
    var nol = function (s) { s = String(s).replace(/\D/g, ''); return s ? ('00' + s).slice(-3) : ''; };
    var tulis = function () {
      var rt = v('a_rt') || v('a_rw') ? [v('a_rt') && 'RT ' + nol(v('a_rt')), v('a_rw') && 'RW ' + nol(v('a_rw'))].filter(Boolean).join('/') : '';
      var kp = v('a_kampung') ? (/^(kp|kampung|dusun|perum)/i.test(v('a_kampung')) ? judul(v('a_kampung')) : 'Kp. ' + judul(v('a_kampung'))) : '';
      var bag = [judul(v('a_jalan')), [kp, rt].filter(Boolean).join(' '), v('a_desa') && (v('a_kelurahan') ? 'Kelurahan ' : 'Desa ') + judul(v('a_desa').replace(/^(desa|ds\.?|kelurahan|kel\.?)\s*/i, '')), v('a_kecamatan') && 'Kecamatan ' + judul(v('a_kecamatan').replace(/^(kecamatan|kec\.?)\s*/i, '')), v('a_kabupaten') && (v('a_kota') ? 'Kota ' : 'Kabupaten ') + judul(v('a_kabupaten').replace(/^(kabupaten|kab\.?|kota)\s*/i, '')), [v('a_provinsi'), v('a_kodepos')].filter(Boolean).join(' ')].filter(Boolean);
      if (hasil) hasil.textContent = bag.join(', ') || '—';
    };
    w.addEventListener('input', tulis); w.addEventListener('change', tulis);
  });
})();
