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
    var goyang = function (pesan) { papan.classList.remove('goyang'); void papan.offsetWidth; papan.classList.add('goyang'); if (pesan) ket.textContent = pesan; if (navigator.vibrate) navigator.vibrate([40, 30, 40]); };
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
      if (navigator.vibrate) navigator.vibrate(10);
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
    var inp = $('input[type="hidden"]', g), kisi = $('[data-galeri-kisi]', g), st = $('[data-unggah-status]', g), dasar = g.getAttribute('data-dasar');
    var foto = []; try { foto = JSON.parse(inp.value || '[]'); } catch (e) { foto = []; }
    var simpanNilai = function () { inp.value = JSON.stringify(foto); kotor = true; };
    var tarik = null;
    var lukis = function () {
      kisi.innerHTML = '';
      foto.forEach(function (p, i) {
        var el = d.createElement('div'); el.className = 'p-galeri-butir'; el.draggable = true;
        el.innerHTML = '<img alt=""><input type="text" maxlength="200" placeholder="Keterangan (opsional)"><div class="p-galeri-alat"><button type="button" data-a="kiri" aria-label="Geser ke kiri">‹</button><button type="button" data-a="kanan" aria-label="Geser ke kanan">›</button><button type="button" data-a="hapus" aria-label="Hapus foto">✕</button></div>';
        el.querySelector('img').src = dasar + (p.k || p.f);
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
