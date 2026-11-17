/**
 * Panduan siswa interaktif (dibundel ke /assets/panduan-siswa.js oleh `npm run klien`):
 *   - simulasi masuk: NISN/NIS dan tanggal lahir dibaca dengan kode yang SAMA dengan halaman masuk asli (lib/tanggal.ts);
 *     tidak ada yang dikirim ke server.
 *   - soal contoh: pilihan ganda, isian, dan uraian → Serahkan → nilai, kunci, pembahasan, dan nilai-sendiri untuk uraian,
 *     seperti latihan sungguhan.
 *   - jalur langkah: penanda bagian yang sedang dibaca.
 */
import { digit, normalTanggal } from '../lib/tanggal.ts';

const d = document;
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tglIndonesia = (iso: string) => { const [y, m, h] = iso.split('-').map(Number); return `${h} ${BULAN[(m ?? 1) - 1]} ${y}`; };

/** Teks dengan **tebal** → node (tanpa innerHTML). */
function tulis(el: Element, s: string) {
  el.textContent = '';
  s.split(/\*\*(.+?)\*\*/).forEach((bag, i) => {
    if (!bag) return;
    if (i % 2) { const b = d.createElement('b'); b.textContent = bag; el.appendChild(b); } else el.appendChild(d.createTextNode(bag));
  });
}
const ket = (el: Element | null, s: string, jenis: '' | 'ok' | 'galat') => {
  if (!el) return;
  tulis(el, s);
  el.classList.toggle('ok', jenis === 'ok');
  el.classList.toggle('galat', jenis === 'galat');
};

/* ── simulasi masuk ── */
function simulasiMasuk() {
  const akar = d.querySelector<HTMLElement>('[data-sim-masuk]');
  if (!akar) return;
  akar.hidden = false;
  const nomor = akar.querySelector<HTMLInputElement>('[data-sim-nomor]')!;
  const tgl = akar.querySelector<HTMLInputElement>('[data-sim-tgl]')!;
  const kNomor = akar.querySelector('[data-sim-nomor-ket]');
  const kTgl = akar.querySelector('[data-sim-tgl-ket]');
  const hasil = akar.querySelector<HTMLElement>('[data-sim-hasil]')!;
  const cekNomor = () => {
    const v = nomor.value, x = digit(v);
    if (!v.trim()) { ket(kNomor, 'Ketik 10 angka NISN, atau NIS lokal.', ''); return false; }
    if (x.length < 3) { ket(kNomor, 'Terlalu pendek — NISN berisi **10 angka**.', 'galat'); return false; }
    const lain = /\D/.test(v) ? ' Selain angka diabaikan.' : '';
    if (x.length === 10) { ket(kNomor, `✓ NISN 10 angka: **${x}**.${lain}`, 'ok'); return true; }
    ket(kNomor, `✓ Dibaca sebagai NIS lokal **${x}** (${x.length} angka) — pakai nomor yang tercatat di madrasah.${lain}`, 'ok');
    return true;
  };
  const cekTgl = () => {
    const v = tgl.value;
    if (!v.trim()) { ket(kTgl, 'Coba beberapa cara menulis tanggal — lihat cara membacanya.', ''); return false; }
    const iso = normalTanggal(v);
    if (!iso) { ket(kTgl, '✗ Belum terbaca sebagai tanggal. Contoh: **30/04/2015**, **300415**, atau **30 April 2015**.', 'galat'); return false; }
    ket(kTgl, `✓ Dibaca: **${tglIndonesia(iso)}**`, 'ok');
    return true;
  };
  nomor.addEventListener('input', () => { cekNomor(); hasil.hidden = true; });
  tgl.addEventListener('input', () => { cekTgl(); hasil.hidden = true; });
  akar.querySelector('[data-sim-coba]')!.addEventListener('click', () => {
    const a = cekNomor(), b = cekTgl();
    hasil.hidden = false;
    hasil.classList.toggle('ok', a && b);
    hasil.textContent = '';
    const p = d.createElement('p');
    if (a && b) {
      tulis(p, '🎉 **Format sudah benar!** Di halaman masuk yang asli, tekan **Masuk** — portal mencocokkan NISN/NIS dan tanggal lahir ini dengan data madrasah.');
      hasil.appendChild(p);
      const t = d.createElement('a');
      t.className = 'tbl tbl-emas tbl-kecil';
      t.href = '/siswa';
      t.textContent = 'Ke halaman masuk →';
      hasil.appendChild(t);
    } else {
      tulis(p, !a && !b ? 'Isi **NISN/NIS** dan **tanggal lahir** dulu.' : !a ? 'Periksa lagi **NISN/NIS**-nya.' : 'Periksa lagi **tanggal lahir**-nya.');
      hasil.appendChild(p);
    }
  });
}

/* ── soal contoh ── */
interface Bahas { benar: boolean | null; teks: string }
function soalContoh() {
  const akar = d.querySelector<HTMLElement>('[data-contoh]');
  if (!akar) return;
  akar.hidden = false;
  const form = akar.querySelector<HTMLFormElement>('[data-contoh-form]')!;
  const nilaiEl = akar.querySelector<HTMLElement>('[data-contoh-nilai]')!;
  const ketEl = akar.querySelector('[data-contoh-ket]');
  const tombol = akar.querySelector<HTMLButtonElement>('[data-contoh-serah]')!;
  let uraian: number | null = null, dasar = 0, selesai = false;

  const tampilNilai = () => {
    const total = dasar + (uraian ?? 0);
    nilaiEl.hidden = false;
    nilaiEl.textContent = '';
    const angka = d.createElement('b');
    angka.className = `psw-nilai-angka ${total >= 70 ? 'tuntas' : 'belum'}`;
    angka.textContent = String(total);
    const p = d.createElement('p');
    tulis(p, uraian === null ? 'Nilai sementara. Soal uraian menunggu **penilaianmu sendiri** — bandingkan jawabanmu dengan jawaban model di soal 3.' : total >= 70 ? 'Bagus! Di latihan sungguhan, hasil ini tersimpan di **Riwayat latihan** dan terlihat oleh gurumu.' : 'Pelajari pembahasannya, lalu coba lagi — boleh mengulang untuk memperbaiki nilai.');
    const ulang = d.createElement('button');
    ulang.type = 'button';
    ulang.className = 'tbl tbl-garis tbl-kecil';
    ulang.textContent = '↺ Ulangi soal contoh';
    ulang.addEventListener('click', reset);
    nilaiEl.appendChild(angka);
    nilaiEl.appendChild(p);
    nilaiEl.appendChild(ulang);
  };

  const bahas = (fs: Element, b: Bahas) => {
    fs.classList.toggle('benar', b.benar === true);
    fs.classList.toggle('salah', b.benar === false);
    const el = fs.querySelector<HTMLElement>('[data-bahas]')!;
    el.hidden = false;
    tulis(el, b.teks);
  };

  function reset() {
    selesai = false; uraian = null; dasar = 0;
    form.reset();
    form.querySelectorAll('fieldset').forEach((fs) => { fs.classList.remove('benar', 'salah'); fs.querySelector<HTMLElement>('[data-bahas]')!.hidden = true; fs.querySelectorAll('input,textarea').forEach((x) => { (x as HTMLInputElement).disabled = false; }); });
    form.querySelector('.psw-nilai-sendiri')?.remove();
    nilaiEl.hidden = true;
    tombol.hidden = false;
    ket(ketEl, 'Jawab semua soal, lalu tekan Serahkan.', '');
    form.querySelector<HTMLElement>('legend')?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (selesai) return;
    const pg = form.querySelector<HTMLInputElement>('input[name="c1"]:checked');
    const isian = (form.querySelector<HTMLInputElement>('[name="c2"]')!.value || '').trim().toLowerCase();
    const urai = (form.querySelector<HTMLTextAreaElement>('[name="c3"]')!.value || '').trim();
    if (!pg || !isian || !urai) { ket(ketEl, '✗ Masih ada soal yang kosong. Di latihan sungguhan, soal kosong dinilai salah — jawab dulu semuanya.', 'galat'); return; }
    selesai = true;
    const benarPg = pg.value === '1', benarIsian = /^(5|lima)(\s*perkara)?$/.test(isian);
    dasar = (benarPg ? 40 : 0) + (benarIsian ? 30 : 0);
    const [f1, f2, f3] = Array.from(form.querySelectorAll('fieldset'));
    bahas(f1!, { benar: benarPg, teks: `${benarPg ? '✓ Benar.' : '✗ Kurang tepat — kunci: **b. air mutlak**.'} Air mutlak (air hujan, sumur, sungai, laut) suci dan menyucikan. Air musta’mal sudah dipakai bersuci, air mutanajjis terkena najis, dan air teh suci tetapi tidak menyucikan.` });
    bahas(f2!, { benar: benarIsian, teks: `${benarIsian ? '✓ Benar.' : '✗ Kurang tepat — kunci: **5 (lima)**.'} Rukun Islam: syahadat, shalat, zakat, puasa Ramadhan, dan haji bagi yang mampu.` });
    bahas(f3!, { benar: null, teks: 'Jawaban model: **membaca basmalah, bersiwak, berkumur, mendahulukan anggota yang kanan, membasuh tiga kali** (cukup dua). Bandingkan dengan jawabanmu, lalu nilai sendiri dengan jujur:' });
    form.querySelectorAll('input,textarea').forEach((x) => { (x as HTMLInputElement).disabled = true; });
    const pilih = d.createElement('div');
    pilih.className = 'psw-nilai-sendiri';
    pilih.setAttribute('role', 'group');
    pilih.setAttribute('aria-label', 'Nilai sendiri jawaban uraian');
    ([['30', '✓ Sesuai'], ['15', '≈ Sebagian'], ['0', '✗ Belum']] as const).forEach(([v, label]) => {
      const b = d.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        uraian = Number(v);
        pilih.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        f3!.classList.toggle('benar', v === '30');
        f3!.classList.toggle('salah', v === '0');
        tampilNilai();
      });
      pilih.appendChild(b);
    });
    const bahasUraian = f3!.querySelector('[data-bahas]')!;
    bahasUraian.parentNode!.insertBefore(pilih, bahasUraian.nextSibling);
    tombol.hidden = true;
    ket(ketEl, '', '');
    tampilNilai();
    nilaiEl.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}

/* ── jalur langkah: bagian yang sedang dibaca ── */
function jalur() {
  const tautan = new Map<string, HTMLElement>();
  d.querySelectorAll<HTMLElement>('[data-psw-jalur]').forEach((a) => tautan.set(a.getAttribute('data-psw-jalur')!, a));
  const bagian = Array.from(d.querySelectorAll<HTMLElement>('[data-psw-bagian]'));
  if (!bagian.length || !('IntersectionObserver' in window)) return;
  const lewat = new Set<string>();
  const io = new IntersectionObserver((isi) => {
    isi.forEach((x) => {
      if (!x.isIntersecting) return;
      const id = (x.target as HTMLElement).id;
      lewat.add(id);
      tautan.forEach((a, k) => { a.classList.toggle('aktif', k === id); a.classList.toggle('lewat', lewat.has(k) && k !== id); });
      const a = tautan.get(id);
      if (a && a.parentElement) a.parentElement.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  bagian.forEach((b) => io.observe(b));
}

simulasiMasuk();
soalContoh();
jalur();
