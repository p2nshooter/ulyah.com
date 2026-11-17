/* yapida.sch.id — Bank Soal: mengerjakan paket (pilihan ganda, menjodohkan, isian, uraian), jawaban tersimpan otomatis di
   perangkat, diserahkan → dinilai di server, lalu kunci & pembahasan tampil, uraian dinilai sendiri dengan jawaban model,
   hasil bisa dicetak/diunduh. Paket RA: permainan bergambar kartun yang bergerak dan dibacakan (pohon yang bercerita).
   Kunci jawaban paket MI/MTs tidak pernah ada di halaman sebelum diserahkan. */
(function () {
  'use strict';
  var d = document, app = d.getElementById('soal-app');
  if (!app) return;
  var P = JSON.parse(d.getElementById('paket').textContent);
  var SIMPAN = app.getAttribute('data-simpan') === '1';
  var KUNCI = 'yp-soal-' + P.id;
  var HURUF = 'ABCDE';
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // pita kemajuan menempel tepat di bawah kepala situs yang juga menempel
  var kepala = d.querySelector('.kepala');
  var atur = function () { app.style.setProperty('--atas', (kepala ? kepala.offsetHeight : 0) + 'px'); };
  atur(); window.addEventListener('resize', atur);

  function h(tag, at) {
    var el = d.createElement(tag), k;
    if (at) for (k in at) { if (at[k] === null || at[k] === undefined || at[k] === false) continue; if (k === 'class') el.className = at[k]; else if (k === 'html') el.innerHTML = at[k]; else el.setAttribute(k, at[k] === true ? '' : String(at[k])); }
    for (var i = 2; i < arguments.length; i++) tambah(el, arguments[i]);
    return el;
  }
  function tambah(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { tambah(el, x); }); return; } el.appendChild(typeof c === 'object' ? c : d.createTextNode(String(c))); }
  /** Teks soal: baris baru dipertahankan, baris Arab ditulis kanan-ke-kiri dengan huruf mushaf. */
  function teks(t) { return String(t).split('\n').map(function (b, i) { var ar = /[؀-ۿ]/.test(b) && !/[A-Za-z]{3}/.test(b); return [i ? h('br') : null, h('span', { dir: 'auto', class: ar ? 'bs-arab' : null, lang: ar ? 'ar' : null }, b)]; }); }
  function ucap(t, profil) { try { if (window.YapidaSuara && window.YapidaSuara.ucap) window.YapidaSuara.ucap(t, 'id', profil || 'balita'); } catch (e) { /* tanpa suara */ } }

  if (P.ra && P.ra.length) { mainRA(); return; }

  /* ── keadaan jawaban (tersimpan di perangkat sampai diserahkan) ───────────────────────────────────────────── */
  var J = { pg: P.pg.map(function () { return null; }), jodoh: P.jodoh.kiri.map(function () { return null; }), isian: P.isian.map(function () { return ''; }), uraian: P.uraian.map(function () { return ''; }) };
  try { var lama = JSON.parse(localStorage.getItem(KUNCI) || 'null'); if (lama && lama.pg && lama.pg.length === J.pg.length && lama.isian.length === J.isian.length) J = lama; } catch (e) { /* penyimpanan lokal tidak tersedia */ }
  var simpanLokal = function () { try { localStorage.setItem(KUNCI, JSON.stringify(J)); } catch (e) { /* abaikan */ } segar(); };
  var TOTAL = J.pg.length + J.jodoh.length + J.isian.length + J.uraian.length;
  function terjawab() {
    var n = 0;
    J.pg.forEach(function (x) { if (x !== null) n++; }); J.jodoh.forEach(function (x) { if (x !== null) n++; });
    J.isian.forEach(function (x) { if (String(x).trim()) n++; }); J.uraian.forEach(function (x) { if (String(x).trim()) n++; });
    return n;
  }

  var mulai = Date.now(), batang, hitungEl, waktuEl, kirimTbl;
  function segar() {
    var n = terjawab();
    if (hitungEl) hitungEl.textContent = n + ' / ' + TOTAL + ' terjawab';
    if (batang) batang.style.width = Math.round((n / TOTAL) * 100) + '%';
  }

  function bagian(judul, ket, isi) { return h('section', { class: 'bs-bagian' }, h('h2', null, judul), ket ? h('p', { class: 'bs-ket' }, ket) : null, isi); }

  function lembar() {
    app.textContent = '';
    batang = h('i');
    hitungEl = h('span', { class: 'bs-hitung' });
    waktuEl = h('span', { class: 'bs-waktu', 'aria-hidden': 'true' });
    kirimTbl = h('button', { type: 'button', class: 'tbl tbl-emas tbl-kecil' }, 'Serahkan');
    kirimTbl.addEventListener('click', serahkan);
    tambah(app, h('div', { class: 'bs-pita' }, h('div', { class: 'bs-pita-isi' }, hitungEl, waktuEl, kirimTbl), h('div', { class: 'bs-maju' }, batang)));
    var no = 0;
    // A. pilihan ganda
    tambah(app, bagian('A. Pilihan ganda', 'Pilih satu jawaban yang paling tepat.', P.pg.map(function (s, i) {
      no++;
      var opsi = h('div', { class: 'bs-opsi', role: 'radiogroup', 'aria-label': 'Pilihan soal ' + no });
      s.o.forEach(function (o, j) {
        var b = h('button', { type: 'button', role: 'radio', class: 'bs-pilih', 'aria-checked': J.pg[i] === j ? 'true' : 'false' }, h('b', null, HURUF[j]), h('span', { dir: 'auto' }, o));
        b.addEventListener('click', function () { J.pg[i] = j; [].forEach.call(opsi.children, function (x, k) { x.setAttribute('aria-checked', k === j ? 'true' : 'false'); }); simpanLokal(); });
        tambah(opsi, b);
      });
      return h('article', { class: 'bs-soal', id: 'pg' + i }, h('span', { class: 'bs-no' }, no), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, teks(s.t)), opsi));
    })));
    // B. menjodohkan
    if (P.jodoh.kiri.length) {
      var kanan = h('ol', { class: 'bs-kanan', type: 'A' }, P.jodoh.kanan.map(function (x) { return h('li', null, x); }));
      tambah(app, bagian('B. Menjodohkan', 'Pasangkan setiap pernyataan dengan jawaban yang tepat dari kotak pilihan.', [h('div', { class: 'bs-kotak-kanan' }, h('p', null, 'Pilihan jawaban'), kanan), P.jodoh.kiri.map(function (t, i) {
        no++;
        var sel = h('select', { class: 'bs-pilih-jodoh', 'aria-label': 'Jawaban soal ' + no }, h('option', { value: '' }, '— pilih —'), P.jodoh.kanan.map(function (x, j) { return h('option', { value: j, selected: J.jodoh[i] === j }, HURUF[j] + '. ' + x); }));
        sel.addEventListener('change', function () { J.jodoh[i] = sel.value === '' ? null : Number(sel.value); simpanLokal(); });
        return h('article', { class: 'bs-soal bs-soal-baris' }, h('span', { class: 'bs-no' }, no), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, teks(t)), sel));
      })]));
    }
    // C. isian
    if (P.isian.length) tambah(app, bagian('C. Isian singkat', 'Tulis jawaban singkat yang tepat.', P.isian.map(function (t, i) {
      no++;
      var inp = h('input', { type: 'text', class: 'bs-isian', autocomplete: 'off', maxlength: 200, 'aria-label': 'Jawaban soal ' + no, value: J.isian[i] || '' });
      inp.addEventListener('input', function () { J.isian[i] = inp.value; simpanLokal(); });
      return h('article', { class: 'bs-soal' }, h('span', { class: 'bs-no' }, no), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, teks(t)), inp));
    })));
    // D. uraian
    if (P.uraian.length) tambah(app, bagian('D. Uraian', 'Jawab dengan kalimatmu sendiri. Setelah diserahkan, bandingkan dengan jawaban model lalu nilai jawabanmu sendiri.', P.uraian.map(function (t, i) {
      no++;
      var ta = h('textarea', { class: 'bs-uraian', rows: 4, maxlength: 3000, 'aria-label': 'Jawaban soal ' + no });
      ta.value = J.uraian[i] || '';
      ta.addEventListener('input', function () { J.uraian[i] = ta.value; simpanLokal(); });
      return h('article', { class: 'bs-soal' }, h('span', { class: 'bs-no' }, no), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, teks(t)), ta));
    })));
    var akhir = h('button', { type: 'button', class: 'tbl tbl-emas bs-serahkan' }, 'Serahkan jawaban');
    akhir.addEventListener('click', serahkan);
    tambah(app, h('div', { class: 'bs-akhir' }, h('p', null, SIMPAN ? 'Nilaimu tersimpan dan bisa dilihat gurumu.' : 'Latihan tamu: nilai tidak disimpan. Siswa Yapida masuk Portal Siswa agar nilainya tersimpan.'), akhir));
    segar();
    setInterval(function () { var s = Math.floor((Date.now() - mulai) / 1000); waktuEl.textContent = '⏱ ' + Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }, 1000);
  }

  function serahkan() {
    var kosong = TOTAL - terjawab();
    if (kosong > 0 && !window.confirm('Masih ada ' + kosong + ' soal yang belum dijawab. Tetap serahkan sekarang?')) return;
    kirimTbl.disabled = true;
    app.classList.add('bs-memuat');
    fetch('/api/soal/' + encodeURIComponent(P.id) + '/nilai', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ jawaban: J }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Gagal menilai.'); return j; }); })
      .then(function (hasil) { try { localStorage.removeItem(KUNCI); } catch (e) { /* abaikan */ } tampilHasil(hasil); })
      .catch(function (e) { app.classList.remove('bs-memuat'); kirimTbl.disabled = false; window.alert((e && e.message) || 'Koneksi terputus. Jawabanmu tetap tersimpan di perangkat ini — coba serahkan lagi.'); });
  }

  /* ── hasil, kunci & pembahasan ─────────────────────────────────────────────────────────────────────────────── */
  function tampilHasil(R) {
    app.classList.remove('bs-memuat');
    app.textContent = '';
    window.scrollTo({ top: Math.max(0, app.getBoundingClientRect().top + window.scrollY - 90), behavior: tenang ? 'auto' : 'smooth' });
    var diri = P.uraian.map(function () { return null; });
    var nilaiEl = h('b', { class: 'bs-nilai-angka' }, '0');
    var cincin = h('div', { class: 'bs-cincin', style: '--p:0' }, nilaiEl, h('span', null, 'nilai'));
    var pesan = h('p', { class: 'bs-pesan' });
    function hitungNilai() {
      if (!P.uraian.length) return R.nilai;
      var semua = diri.every(function (x) { return x !== null; });
      if (!semua) return R.nilai;
      var dapat = R.skor.pg + R.skor.jodoh + R.skor.isian, total = R.maks.pg + R.maks.jodoh + R.maks.isian + R.maks.uraian, per = R.maks.uraian / P.uraian.length;
      diri.forEach(function (x) { dapat += (x / 2) * per; });
      return Math.round((dapat / total) * 100);
    }
    function pasangNilai(v, animasi) {
      var mulaiV = Number(nilaiEl.textContent) || 0, t0 = performance.now(), dur = animasi && !tenang ? 900 : 0;
      (function langkah(t) {
        var k = dur ? Math.min(1, (t - t0) / dur) : 1, x = Math.round(mulaiV + (v - mulaiV) * (1 - Math.pow(1 - k, 3)));
        nilaiEl.textContent = x; cincin.style.setProperty('--p', x);
        if (k < 1) requestAnimationFrame(langkah);
      })(t0);
      cincin.className = 'bs-cincin ' + (v >= 85 ? 'bs-cincin-emas' : v >= 70 ? 'bs-cincin-hijau' : 'bs-cincin-merah');
      pesan.textContent = v >= 85 ? 'Masya Allah, luar biasa! 🌟' : v >= 70 ? 'Alhamdulillah, tuntas! Pertahankan. 👍' : 'Jangan menyerah — pelajari pembahasan lalu ulangi, ya. 💪';
    }
    var benarPG = R.benar.pg.filter(Boolean).length, benarJ = R.benar.jodoh.filter(Boolean).length, benarI = R.benar.isian.filter(Boolean).length;
    var cetak = h('a', { class: 'tbl tbl-emas', href: R.hasil ? '/siswa/bank-soal/hasil/' + R.hasil : '#', target: R.hasil ? '_blank' : null, rel: 'noopener' }, R.hasil ? '⬇ Unduh / cetak hasil' : '🖨️ Cetak hasil');
    if (!R.hasil) cetak.addEventListener('click', function (e) { e.preventDefault(); window.print(); });
    var ulang = h('button', { type: 'button', class: 'tbl tbl-garis' }, '↻ Ulangi latihan');
    ulang.addEventListener('click', function () { J = { pg: P.pg.map(function () { return null; }), jodoh: P.jodoh.kiri.map(function () { return null; }), isian: P.isian.map(function () { return ''; }), uraian: P.uraian.map(function () { return ''; }) }; mulai = Date.now(); lembar(); window.scrollTo(0, 0); });
    tambah(app, h('section', { class: 'bs-ringkas' }, cincin, h('div', null, h('h2', null, 'Hasil latihanmu'), pesan,
      h('ul', { class: 'bs-skor' }, h('li', null, 'Pilihan ganda ', h('b', null, benarPG + '/' + P.pg.length)), P.jodoh.kiri.length ? h('li', null, 'Menjodohkan ', h('b', null, benarJ + '/' + P.jodoh.kiri.length)) : null, P.isian.length ? h('li', null, 'Isian ', h('b', null, benarI + '/' + P.isian.length)) : null, P.uraian.length ? h('li', null, 'Uraian ', h('b', { 'data-uraian-skor': true }, 'nilai sendiri ↓')) : null),
      h('div', { class: 'bs-tombol' }, cetak, ulang, h('a', { class: 'tbl tbl-garis', href: SIMPAN ? '/siswa/bank-soal' : '/bank-soal' }, '← Paket lain')))));
    pasangNilai(R.nilai, true);
    // uraian: nilai diri
    if (P.uraian.length) {
      var catat = null;
      var kotak = h('section', { class: 'bs-bagian bs-diri' }, h('h2', null, 'Nilai uraianmu sendiri'), h('p', { class: 'bs-ket' }, 'Bandingkan jawabanmu dengan jawaban model, lalu pilih yang paling jujur. Nilaimu dihitung ulang otomatis.'));
      P.uraian.forEach(function (t, i) {
        var tombol = h('div', { class: 'bs-diri-tombol', role: 'radiogroup', 'aria-label': 'Nilai diri uraian ' + (i + 1) });
        [['2', '✓ Sesuai'], ['1', '≈ Sebagian'], ['0', '✗ Belum']].forEach(function (x) {
          var b = h('button', { type: 'button', role: 'radio', class: 'bs-diri-' + x[0], 'aria-checked': 'false' }, x[1]);
          b.addEventListener('click', function () {
            diri[i] = Number(x[0]);
            [].forEach.call(tombol.children, function (y) { y.setAttribute('aria-checked', y === b ? 'true' : 'false'); });
            var v = hitungNilai(); pasangNilai(v, true);
            var lengkap = diri.every(function (y) { return y !== null; });
            var sk = app.querySelector('[data-uraian-skor]'); if (sk) sk.textContent = lengkap ? 'sudah dinilai' : 'nilai sendiri ↓';
            if (R.hasil && lengkap) { clearTimeout(catat); catat = setTimeout(function () { fetch('/api/soal/hasil/' + R.hasil + '/diri', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ diri: diri }) }).catch(function () { /* coba lagi nanti */ }); }, 500); }
          });
          tambah(tombol, b);
        });
        tambah(kotak, h('article', { class: 'bs-soal bs-tinjau' }, h('span', { class: 'bs-no' }, P.pg.length + P.jodoh.kiri.length + P.isian.length + i + 1), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, teks(t)),
          h('p', { class: 'bs-jwbmu' }, h('span', null, 'Jawabanmu: '), J.uraian[i] ? J.uraian[i] : h('i', null, 'kosong')),
          h('p', { class: 'bs-model' }, h('b', null, 'Jawaban model: '), R.kunci.uraian[i]), R.bahas.uraian[i] ? h('p', { class: 'bs-bahas' }, R.bahas.uraian[i]) : null, tombol)));
      });
      tambah(app, kotak);
    }
    // pembahasan PG, menjodohkan, isian
    var no = 0;
    tambah(app, h('section', { class: 'bs-bagian' }, h('h2', null, 'Kunci & pembahasan'), P.pg.map(function (s, i) {
      no++;
      var ok = R.benar.pg[i];
      return h('article', { class: 'bs-soal bs-tinjau ' + (ok ? 'bs-ok' : 'bs-salah') }, h('span', { class: 'bs-no' }, no), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, teks(s.t)),
        h('ul', { class: 'bs-opsi-tinjau' }, s.o.map(function (o, j) { return h('li', { class: j === R.kunci.pg[i] ? 'kunci' : j === J.pg[i] ? 'dipilih' : null }, h('b', null, HURUF[j]), h('span', { dir: 'auto' }, o), j === R.kunci.pg[i] ? h('em', null, ' ✓ kunci') : j === J.pg[i] ? h('em', null, ' ✗ jawabanmu') : null); })),
        J.pg[i] === null ? h('p', { class: 'bs-jwbmu' }, 'Tidak dijawab.') : null, R.bahas.pg[i] ? h('p', { class: 'bs-bahas' }, '💡 ' + R.bahas.pg[i]) : null));
    }), P.jodoh.kiri.map(function (t, i) {
      no++;
      var ok = R.benar.jodoh[i];
      return h('article', { class: 'bs-soal bs-tinjau ' + (ok ? 'bs-ok' : 'bs-salah') }, h('span', { class: 'bs-no' }, no), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, t),
        h('p', { class: 'bs-jwbmu' }, 'Jawabanmu: ', h('b', null, J.jodoh[i] === null ? '—' : P.jodoh.kanan[J.jodoh[i]]), ok ? ' ✓' : [' ✗ · Kunci: ', h('b', null, P.jodoh.kanan[R.kunci.jodoh[i]])]), R.bahas.jodoh[i] ? h('p', { class: 'bs-bahas' }, '💡 ' + R.bahas.jodoh[i]) : null));
    }), P.isian.map(function (t, i) {
      no++;
      var ok = R.benar.isian[i];
      return h('article', { class: 'bs-soal bs-tinjau ' + (ok ? 'bs-ok' : 'bs-salah') }, h('span', { class: 'bs-no' }, no), h('div', { class: 'bs-soal-isi' }, h('p', { class: 'bs-tanya' }, teks(t)),
        h('p', { class: 'bs-jwbmu' }, 'Jawabanmu: ', h('b', null, J.isian[i] || '—'), ok ? ' ✓' : [' ✗ · Kunci: ', h('b', null, R.kunci.isian[i][0])]), R.bahas.isian[i] ? h('p', { class: 'bs-bahas' }, '💡 ' + R.bahas.isian[i]) : null));
    })));
  }

  lembar();

  /* ── RA: permainan bergambar yang bergerak & dibacakan ─────────────────────────────────────────────────────── */
  function mainRA() {
    var GAMBAR = {
      ayam: '<ellipse cx="50" cy="60" rx="26" ry="22" fill="#fff8ec" stroke="#e7cfa3" stroke-width="2"/><circle cx="66" cy="38" r="13" fill="#fff8ec" stroke="#e7cfa3" stroke-width="2"/><path d="M60 24c2-6 6-6 7 0 2-5 6-4 6 2" fill="#e8483c"/><path d="M78 38l9 3-9 3z" fill="#f2a52b"/><circle cx="69" cy="35" r="2.2" fill="#3b2b1d"/><path d="M42 82v8M56 82v8" stroke="#f2a52b" stroke-width="3" stroke-linecap="round"/><path d="M30 56c6 4 14 4 20 0" stroke="#e7cfa3" stroke-width="2" fill="none"/>',
      bebek: '<ellipse cx="48" cy="62" rx="27" ry="20" fill="#ffd84a"/><circle cx="66" cy="38" r="13" fill="#ffd84a"/><path d="M77 40l12 2-12 4z" fill="#f28a1c"/><circle cx="69" cy="35" r="2.2" fill="#3b2b1d"/><path d="M30 60c8 6 18 6 26 0" stroke="#e6b923" stroke-width="2" fill="none"/>',
      kucing: '<circle cx="50" cy="55" r="27" fill="#f4a34a"/><path d="M28 40l4-22 16 14zM72 40l-4-22-16 14z" fill="#f4a34a"/><circle cx="40" cy="52" r="3" fill="#2d2016"/><circle cx="60" cy="52" r="3" fill="#2d2016"/><path d="M47 60h6l-3 3z" fill="#e86b6b"/><path d="M50 63c-3 4-7 4-9 1M50 63c3 4 7 4 9 1" stroke="#2d2016" stroke-width="1.6" fill="none"/><path d="M24 58h14M24 63h14M62 58h14M62 63h14" stroke="#7a4b1d" stroke-width="1.2"/>',
      ikan: '<path d="M18 50c14-18 44-20 58 0-14 20-44 18-58 0z" fill="#4aa8e8"/><path d="M74 50l16-12v24z" fill="#2f86c8"/><circle cx="32" cy="46" r="3" fill="#fff"/><circle cx="32" cy="46" r="1.5" fill="#1d2b3b"/><path d="M44 40c4 6 4 14 0 20" stroke="#bfe2fb" stroke-width="2" fill="none"/>',
      burung: '<ellipse cx="50" cy="56" rx="24" ry="18" fill="#6bc3e6"/><circle cx="68" cy="40" r="11" fill="#6bc3e6"/><path d="M78 41l9 2-9 3z" fill="#f2a52b"/><circle cx="70" cy="38" r="2" fill="#1d2b3b"/><path d="M36 50c8-14 22-14 24 0z" fill="#3e9ccc"/><path d="M28 60l-12 6 14 2z" fill="#3e9ccc"/>',
      kupu: '<ellipse cx="34" cy="40" rx="16" ry="20" fill="#f07ab0"/><ellipse cx="66" cy="40" rx="16" ry="20" fill="#f07ab0"/><ellipse cx="36" cy="66" rx="12" ry="14" fill="#f6a8cf"/><ellipse cx="64" cy="66" rx="12" ry="14" fill="#f6a8cf"/><rect x="47" y="30" width="6" height="44" rx="3" fill="#5a3b2a"/><path d="M48 30c-4-8-8-10-12-10M52 30c4-8 8-10 12-10" stroke="#5a3b2a" stroke-width="1.6" fill="none"/>',
      apel: '<circle cx="50" cy="56" r="28" fill="#e53b3b"/><path d="M50 30c0-8 4-12 8-14" stroke="#6b4325" stroke-width="3" fill="none"/><path d="M54 26c8-8 18-6 20 0-8 6-16 6-20 0z" fill="#4caf50"/><ellipse cx="40" cy="46" rx="6" ry="9" fill="#ff8a80" opacity=".6"/>',
      pisang: '<path d="M22 30c6 34 34 50 60 44-6 10-34 12-50-4C20 60 16 44 22 30z" fill="#ffd84a" stroke="#e0b52a" stroke-width="2"/><path d="M22 30l-4-6" stroke="#6b4325" stroke-width="3"/>',
      jeruk: '<circle cx="50" cy="56" r="28" fill="#ff9f1c"/><path d="M50 28c2-6 8-8 12-6-2 6-8 8-12 6z" fill="#4caf50"/><circle cx="42" cy="48" r="2" fill="#ffc46b"/><circle cx="58" cy="60" r="2" fill="#ffc46b"/><circle cx="48" cy="66" r="2" fill="#ffc46b"/>',
      bintang: '<path d="M50 12l10 24 26 2-20 17 7 26-23-14-23 14 7-26-20-17 26-2z" fill="#ffcf33" stroke="#e6a800" stroke-width="2" stroke-linejoin="round"/>',
      balok: '<path d="M50 20l28 14-28 14-28-14z" fill="#ff7b72"/><path d="M22 34l28 14v32L22 66z" fill="#e5534b"/><path d="M78 34L50 48v32l28-14z" fill="#c93c37"/>',
      bunga: '<circle cx="50" cy="34" r="11" fill="#ff8fb1"/><circle cx="36" cy="44" r="11" fill="#ff8fb1"/><circle cx="64" cy="44" r="11" fill="#ff8fb1"/><circle cx="41" cy="60" r="11" fill="#ff8fb1"/><circle cx="59" cy="60" r="11" fill="#ff8fb1"/><circle cx="50" cy="48" r="9" fill="#ffd84a"/><path d="M50 70v22" stroke="#4caf50" stroke-width="4"/>',
      pohon: '<rect x="44" y="56" width="12" height="34" rx="3" fill="#8d5a2b"/><circle cx="50" cy="40" r="26" fill="#43a047"/><circle cx="34" cy="50" r="14" fill="#4caf50"/><circle cx="66" cy="50" r="14" fill="#4caf50"/><circle cx="58" cy="30" r="5" fill="#e53b3b"/><circle cx="40" cy="36" r="5" fill="#e53b3b"/>',
      matahari: '<circle cx="50" cy="50" r="20" fill="#ffcf33"/><g stroke="#ffb300" stroke-width="5" stroke-linecap="round"><path d="M50 14v10M50 76v10M14 50h10M76 50h10M25 25l7 7M68 68l7 7M75 25l-7 7M32 68l-7 7"/></g>',
      bulan: '<path d="M62 18a32 32 0 1 0 20 52 26 26 0 1 1-20-52z" fill="#ffe082"/>',
      telur: '<ellipse cx="50" cy="54" rx="22" ry="28" fill="#fff6e8" stroke="#e7d3b5" stroke-width="2"/>',
      kambing: '<ellipse cx="46" cy="58" rx="26" ry="16" fill="#f3efe7" stroke="#cfc7b8" stroke-width="2"/><circle cx="72" cy="44" r="11" fill="#f3efe7" stroke="#cfc7b8" stroke-width="2"/><path d="M68 34c-2-8 2-12 6-12M76 34c4-6 8-6 10-2" stroke="#9e8f78" stroke-width="2.5" fill="none"/><circle cx="75" cy="43" r="1.8" fill="#2d2016"/><path d="M74 54l2 6" stroke="#cfc7b8" stroke-width="3"/><path d="M30 72v14M42 72v14M54 72v14" stroke="#9e8f78" stroke-width="3"/>',
      unta: '<path d="M18 70c4-20 14-30 26-30 6-12 18-12 22 0 6-4 12 0 12 8v22" fill="#d9a25f"/><path d="M76 48c0-14 4-22 12-22" stroke="#d9a25f" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="90" cy="26" r="6" fill="#d9a25f"/><path d="M28 70v18M40 70v18M62 70v18M72 70v18" stroke="#b3803f" stroke-width="4"/>',
    };
    var kartun = function (g, kelas) { return '<svg viewBox="0 0 100 100" class="ra-g ' + (kelas || '') + '" aria-hidden="true">' + (GAMBAR[g] || GAMBAR.bintang) + '</svg>'; };
    var ANGKA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];
    var i = 0, benar = 0;
    var bintang = h('div', { class: 'ra-bintang', 'aria-hidden': 'true' });
    function tampil() {
      app.textContent = '';
      if (i >= P.ra.length) {
        tambah(app, h('section', { class: 'ra-selesai' }, h('div', { class: 'ra-piala', html: kartun('bintang', 'ra-goyang') }), h('h2', null, 'Alhamdulillah, hebat!'), h('p', null, 'Kamu menjawab benar ' + benar + ' dari ' + P.ra.length + ' soal.'),
          h('div', { class: 'bs-tombol' }, (function () { var b = h('button', { type: 'button', class: 'tbl tbl-emas' }, '↻ Main lagi'); b.addEventListener('click', function () { i = 0; benar = 0; tampil(); }); return b; })(), h('a', { class: 'tbl tbl-garis', href: SIMPAN ? '/siswa/bank-soal' : '/bank-soal' }, '← Permainan lain'))));
        ucap('Alhamdulillah, hebat! Kamu menjawab benar ' + benar + ' dari ' + P.ra.length + ' soal.');
        return;
      }
      var r = P.ra[i], adegan = h('div', { class: 'ra-adegan ra-' + r.m });
      var bicara = r.m === 'cerita' ? r.cerita + ' ' + r.t : r.m === 'hitung' ? r.t : r.t;
      if (r.m === 'hitung') {
        for (var k = 0; k < r.n; k++) (function (k) {
          var e = h('button', { type: 'button', class: 'ra-benda', style: 'animation-delay:' + (k * 0.18) + 's', 'aria-label': ANGKA[k + 1] || String(k + 1), html: kartun(r.g, 'ra-goyang') });
          e.addEventListener('click', function () { e.classList.remove('ra-lompat'); void e.offsetWidth; e.classList.add('ra-lompat'); ucap(ANGKA[k + 1] || String(k + 1)); });
          tambah(adegan, e);
        })(k);
      } else if (r.m === 'hijaiyah') {
        var huruf = h('button', { type: 'button', class: 'ra-huruf', lang: 'ar', dir: 'rtl' }, r.g);
        huruf.addEventListener('click', function () { ucap(r.t); });
        tambah(adegan, huruf);
      } else if (r.m === 'cerita') {
        var mulut = h('i', { class: 'ra-mulut' });
        var pohon = h('div', { class: 'ra-pohon-bicara' }, h('div', { html: kartun('pohon') }), h('span', { class: 'ra-mata' }, h('i'), h('i')), mulut);
        tambah(adegan, [pohon, h('p', { class: 'ra-cerita' }, r.cerita), r.g && r.g !== 'pohon' ? h('div', { class: 'ra-teman', html: kartun(r.g, 'ra-goyang') }) : null]);
        var bicaraAnim = function () { pohon.classList.add('ra-berbicara'); setTimeout(function () { pohon.classList.remove('ra-berbicara'); }, Math.min(14000, 900 + r.cerita.length * 75)); };
        pohon.addEventListener('click', function () { ucap(r.cerita + ' ' + r.t); bicaraAnim(); });
        setTimeout(bicaraAnim, 200);
      } else {
        tambah(adegan, h('div', { class: 'ra-tokoh', html: kartun(r.g, 'ra-goyang') }));
      }
      var opsi = h('div', { class: 'ra-opsi' });
      var umpan = h('p', { class: 'ra-umpan', 'aria-live': 'polite' });
      r.o.forEach(function (o, j) {
        var b = h('button', { type: 'button', class: 'ra-pilih' + (r.m === 'hijaiyah' ? '' : '') }, o);
        b.addEventListener('click', function () {
          if (opsi.classList.contains('selesai')) return;
          if (j === r.k) {
            opsi.classList.add('selesai'); b.classList.add('benar'); benar++;
            umpan.textContent = 'Hebat! Jawabanmu benar. ⭐'; ucap('Hebat! Jawabanmu benar.');
            meriah();
            setTimeout(function () { i++; tampil(); }, 2200);
          } else {
            b.classList.remove('goyang'); void b.offsetWidth; b.classList.add('goyang', 'salah');
            umpan.textContent = 'Coba lagi, ya!'; ucap('Coba lagi, ya!');
          }
        });
        tambah(opsi, b);
      });
      var dengar = h('button', { type: 'button', class: 'tbl tbl-garis tbl-kecil ra-dengar' }, '🔊 Dengarkan');
      dengar.addEventListener('click', function () { ucap(bicara); });
      tambah(app, h('section', { class: 'ra-kartu' }, h('div', { class: 'ra-kemajuan' }, P.ra.map(function (_x, k) { return h('i', { class: k < i ? 'sudah' : k === i ? 'kini' : null }); })), h('h2', { class: 'ra-tanya' }, r.t), adegan, opsi, umpan, dengar, bintang));
      setTimeout(function () { ucap(bicara); }, 350);
    }
    function meriah() {
      if (tenang) return;
      bintang.textContent = '';
      for (var k = 0; k < 14; k++) { var s = h('span', { style: '--x:' + (Math.random() * 200 - 100) + 'px;--y:' + (-60 - Math.random() * 140) + 'px;--r:' + Math.round(Math.random() * 360) + 'deg;animation-delay:' + (k * 0.03) + 's' }, ['⭐', '✨', '🌟'][k % 3]); tambah(bintang, s); }
    }
    tampil();
  }
})();
