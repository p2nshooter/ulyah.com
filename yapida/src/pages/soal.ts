/**
 * Tampilan Bank Soal (src/data/soal.ts): indeks publik /bank-soal, halaman mengerjakan (siswa & tamu), hasil siswa yang bisa
 * dicetak/diunduh, portal guru (daftar, editor teks, detail, rekap nilai + grafik), lembar soal kertas legal maksimal 2
 * halaman berkop lembaga, lembar kunci, dan unduhan Word (.doc). Semua cetakan mempromosikan www.yapida.sch.id.
 */
import { esc, html, raw, type Raw } from '../lib/html.ts';
import { tanggal } from '../lib/text.ts';
import type { Kop } from '../data/dokumen.ts';
import type { UnitItem } from '../data/site.ts';
import { kepalaHalaman } from './public.ts';
import { kopHtml, type Media } from './cetak.ts';
import { ASSET_V } from './layout.ts';
import { KURIKULUM, type Mapel } from '../data/kurikulum.ts';
import {
  BOBOT, CONTOH_FORMAT, FORMAT, KURIKULUM_SOAL, NAMA_JENIS, NAMA_JENJANG, NAMA_SEMESTER, SINGKAT_JENIS, SLOT_SOAL, kunciSlot, namaKelasSoal, namaMapelSoal, slugKurikulum, slugMapel, untukGuru, type Hasil, type IndeksPaket,
  type JenjangSoal, type MetaHasil, type Paket, type PaketSiswa,
} from '../data/soal.ts';

const HURUF = 'abcde';
const IKON: Record<string, string> = {
  fikih: '🕌', 'al-quran-hadis': '📖', 'al-quran-hadits': '📖', 'akidah-akhlak': '🤲', ski: '🏛️', 'sejarah-kebudayaan-islam': '🏛️', 'bahasa-arab': 'ع',
  'pendidikan-pancasila': '🦅', ppkn: '🦅', 'bahasa-indonesia': '✍️', ipas: '🔬', ipa: '🔬', ips: '🌏', matematika: '➗', 'bahasa-inggris': '🇬🇧',
  pjok: '⚽', 'seni-budaya': '🎨', 'seni-rupa': '🎨', informatika: '💻', 'mengenal-angka': '🔢', 'mengenal-huruf-hijaiyah': 'ب', 'mengenal-alam': '🌳', 'hewan-dan-alam': '🐔',
};
export const ikonMapel = (m: string) => IKON[slugMapel(m)] ?? '📝';
/** Baris soal; baris berhuruf Arab (ayat) ditulis kanan-ke-kiri dengan huruf mushaf Utsmani. */
const AR = /[\u0600-\u06FF]/;
const baris = (t: string) => t.split('\n').map((l, i) => (AR.test(l) && !/[A-Za-z]{3}/.test(l) ? html`<span class="ls-arab" lang="ar" dir="rtl">${l}</span>` : html`${i ? raw('<br>') : ''}<span dir="auto">${l}</span>`));
const tglWaktu = (t: number) => `${tanggal(t)} · ${new Date(t + 7 * 3600_000).toISOString().slice(11, 16)} WIB`;

/* ── indeks publik ───────────────────────────────────────────────────────────────────────────────────────────── */

export function bankSoalPage(o: { indeks: IndeksPaket[]; jenjang: JenjangSoal | ''; kelas: number | null; mapel: string; siswaMasuk: boolean }): Raw {
  const jj: JenjangSoal[] = ['ra', 'mi', 'mts'];
  const ada = (j: JenjangSoal) => o.indeks.some((p) => p.jenjang === j);
  const pilih = o.indeks.filter((p) => (!o.jenjang || p.jenjang === o.jenjang) && (o.kelas === null || p.kelas === o.kelas) && (!o.mapel || slugMapel(p.mapel) === o.mapel));
  const kelompok = new Map<string, IndeksPaket[]>();
  for (const p of pilih) { const k = `${p.jenjang}|${p.kelas}`; kelompok.set(k, [...(kelompok.get(k) ?? []), p]); }
  const q = (j: string, k?: number | null) => `/bank-soal${j ? `?jenjang=${j}${k ? `&kelas=${k}` : ''}` : ''}#daftar`;
  const kelasAda = o.jenjang ? [...new Set(o.indeks.filter((p) => p.jenjang === o.jenjang).map((p) => p.kelas))].sort((a, b) => a - b) : [];
  return html`${kepalaHalaman('Bank Soal', `Latihan soal PTS & PAS ${KURIKULUM_SOAL} untuk RA, MI, dan MTs — langsung dinilai, lengkap dengan kunci dan pembahasan.`, [['Bank Soal', '/bank-soal']], 'Latihan & ujian')}
<section class="bagian"><div class="wadah">
  <div class="bs-cara muncul">
    <h2>Cara mengerjakan</h2>
    <ol class="bs-langkah">
      <li><b>1</b><span><strong>Pilih paket</strong> sesuai jenjang, kelas, dan mata pelajaran.</span></li>
      <li><b>2</b><span><strong>Jawab semua soal</strong>: pilihan ganda, menjodohkan, isian singkat, dan uraian. Jawaban tersimpan otomatis di perangkat.</span></li>
      <li><b>3</b><span><strong>Serahkan</strong> — nilai langsung keluar; kunci dan pembahasan baru tampil sesudah diserahkan.</span></li>
      <li><b>4</b><span><strong>Nilai uraian sendiri</strong> dengan jawaban model, lalu <strong>unduh hasilnya</strong>.</span></li>
    </ol>
    <p class="bs-catatan">${o.siswaMasuk ? html`Anda masuk sebagai siswa — hasil latihan tersimpan di <a href="/siswa/bank-soal">Portal Siswa</a> dan bisa dilihat guru.` : html`Siswa Yayasan Al-Huda Yapida: <a href="/siswa">masuk Portal Siswa</a> (NISN/NIS + tanggal lahir) supaya hasil latihan tersimpan dan dilihat guru.`}</p>
  </div>
  <nav class="saring saring-taut" aria-label="Jenjang" id="daftar"><a class="saring-tbl" href="${q('')}"${raw(o.jenjang ? '' : ' aria-selected="true"')}>Semua <b>${o.indeks.length}</b></a>${jj.filter(ada).map((j) => html`<a class="saring-tbl" href="${q(j)}"${raw(o.jenjang === j ? ' aria-selected="true"' : '')}>${NAMA_JENJANG[j]} <b>${o.indeks.filter((p) => p.jenjang === j).length}</b></a>`)}</nav>
  ${kelasAda.length > 1 ? html`<nav class="saring saring-taut bs-saring-kelas" aria-label="Kelas"><a class="saring-tbl" href="${q(o.jenjang)}"${raw(o.kelas === null ? ' aria-selected="true"' : '')}>Semua kelas</a>${kelasAda.map((k) => html`<a class="saring-tbl" href="${q(o.jenjang, k)}"${raw(o.kelas === k ? ' aria-selected="true"' : '')}>${namaKelasSoal(o.jenjang as JenjangSoal, k)}</a>`)}</nav>` : ''}
  ${[...kelompok.entries()].map(([k, isi]) => { const [j, kl] = k.split('|'); return html`<section class="bs-kelompok"><h2>${NAMA_JENJANG[j as JenjangSoal]} · ${namaKelasSoal(j as JenjangSoal, Number(kl))}</h2>
    <div class="bs-kisi">${isi.map((p) => html`<a class="bs-kartu muncul" href="/bank-soal/${p.id}"><span class="bs-ikon" aria-hidden="true">${ikonMapel(p.mapel)}</span><span class="bs-kartu-isi"><b>${p.mapel}</b><small>${p.jenjang === 'ra' ? 'Permainan bergambar' : `${SINGKAT_JENIS[p.jenis]} · Semester ${NAMA_SEMESTER[p.semester]}`}</small><span class="bs-jumlah">${p.jumlah} soal</span></span><span class="bs-mulai" aria-hidden="true">Kerjakan →</span></a>`)}</div></section>`; })}
  ${pilih.length ? '' : html`<p class="bs-kosong">Belum ada paket untuk pilihan ini.</p>`}
</div></section>`;
}

/* ── mengerjakan ─────────────────────────────────────────────────────────────────────────────────────────────── */

export function kerjakanPage(o: { paket: PaketSiswa; siswa?: { nama: string; kelas: string }; kembali: string; simpan: boolean }): Raw {
  const p = o.paket;
  const ra = Boolean(p.ra?.length);
  const total = p.pg.length + p.jodoh.kiri.length + p.isian.length + p.uraian.length + (p.ra?.length ?? 0);
  return html`<section class="bs-kepala"><div class="wadah">
    <p class="bs-remah"><a href="${o.kembali}">← ${o.kembali.startsWith('/siswa') ? 'Bank soal kelasku' : 'Bank Soal'}</a></p>
    <div class="bs-judul"><span class="bs-ikon bs-ikon-besar" aria-hidden="true">${ikonMapel(p.mapel)}</span><div><p class="kicker">${ra ? `${NAMA_JENJANG[p.jenjang]} · ${namaKelasSoal(p.jenjang, p.kelas)}` : `${NAMA_JENIS[p.jenis]} · Semester ${NAMA_SEMESTER[p.semester]}`}</p><h1>${p.mapel}</h1><p class="bs-sub">${namaKelasSoal(p.jenjang, p.kelas)} ${NAMA_JENJANG[p.jenjang]} · ${total} soal${ra ? ' · dibacakan' : ` · PG ${p.pg.length} · menjodohkan ${p.jodoh.kiri.length} · isian ${p.isian.length} · uraian ${p.uraian.length}`}</p>
    ${o.siswa ? html`<p class="bs-siswa">👤 ${o.siswa.nama} · ${o.siswa.kelas}${o.simpan ? ' · hasil tersimpan untuk gurumu' : ''}</p>` : ''}</div></div>
  </div></section>
  <section class="bagian bs-ruang"><div class="wadah bs-wadah">
    <div id="soal-app" data-soal="${p.id}" data-simpan="${o.simpan ? '1' : '0'}" class="${ra ? 'bs-ra' : ''}"><noscript><p class="bs-kosong">Aktifkan JavaScript untuk mengerjakan soal.</p></noscript><p class="bs-muat">Menyiapkan soal…</p></div>
  </div></section>
  <script type="application/json" id="paket">${raw(JSON.stringify(p).replace(/</g, '\\u003c'))}</script>
  <script src="/assets/suara.js?v=${ASSET_V}" defer></script>
  <script src="/assets/soal.js?v=${ASSET_V}" defer></script>`;
}

/* ── hasil siswa (bisa dicetak / disimpan sebagai PDF) ───────────────────────────────────────────────────────── */

export function hasilSiswaDok(o: { h: Hasil; p: Paket; kop: Kop; media: Media; lembaga: string }): string {
  const { h, p } = o;
  const benarPG = h.benar.pg.filter(Boolean).length, benarJ = h.benar.jodoh.filter(Boolean).length, benarI = h.benar.isian.filter(Boolean).length;
  const isi = html`<article class="ls-kertas ls-hasil">
    ${kopHtml(o.kop, o.media, { kecil: true })}<div class="kop-garis"></div>
    <h1 class="ls-judul">Hasil Latihan ${p.judul}</h1>
    <table class="ls-identitas"><tr><td>Nama</td><td>: <b>${h.nama}</b></td><td>Kelas</td><td>: ${h.kelas}${h.rombel ? ` · ${h.rombel}` : ''}</td></tr><tr><td>Lembaga</td><td>: ${o.lembaga}</td><td>Dikerjakan</td><td>: ${tglWaktu(h.t)}</td></tr></table>
    <div class="ls-nilai"><div class="ls-nilai-besar"><span>Nilai</span><b>${h.nilai}</b></div>
      <ul><li>Pilihan ganda: <b>${benarPG}/${p.pg.length}</b> benar</li><li>Menjodohkan: <b>${benarJ}/${p.jodoh.kiri.length}</b> benar</li><li>Isian singkat: <b>${benarI}/${p.isian.length}</b> benar</li><li>Uraian: ${h.skor.uraian === null ? 'belum dinilai' : html`<b>${Math.round(h.skor.uraian)}</b> dari ${p.uraian.length * BOBOT.uraian} poin (nilai diri)`}</li></ul></div>
    <h2 class="ls-bagian">A. Pilihan ganda</h2>
    <ol class="ls-hasil-daftar">${p.pg.map((s, i) => html`<li class="${h.benar.pg[i] ? 'ok' : 'salah'}"><p>${baris(s.t)}</p><p class="ls-jwb">Jawabanmu: <b>${h.jawaban.pg[i] === null || h.jawaban.pg[i] === undefined ? '—' : `${HURUF[h.jawaban.pg[i]!]}. ${s.o[h.jawaban.pg[i]!] ?? ''}`}</b> ${h.benar.pg[i] ? '✓' : html`✗ · Kunci: <b>${HURUF[s.k]}. ${s.o[s.k]}</b>`}</p>${s.b ? html`<p class="ls-bahas">${s.b}</p>` : ''}</li>`)}</ol>
    <h2 class="ls-bagian">B. Menjodohkan</h2>
    <ol class="ls-hasil-daftar">${p.jodoh.kiri.map((s, i) => html`<li class="${h.benar.jodoh[i] ? 'ok' : 'salah'}"><p>${s.t}</p><p class="ls-jwb">Jawabanmu: <b>${h.jawaban.jodoh[i] === null || h.jawaban.jodoh[i] === undefined ? '—' : p.jodoh.kanan[h.jawaban.jodoh[i]!] ?? '—'}</b> ${h.benar.jodoh[i] ? '✓' : html`✗ · Kunci: <b>${p.jodoh.kanan[s.k]}</b>`}</p></li>`)}</ol>
    <h2 class="ls-bagian">C. Isian singkat</h2>
    <ol class="ls-hasil-daftar">${p.isian.map((s, i) => html`<li class="${h.benar.isian[i] ? 'ok' : 'salah'}"><p>${s.t}</p><p class="ls-jwb">Jawabanmu: <b>${h.jawaban.isian[i] || '—'}</b> ${h.benar.isian[i] ? '✓' : html`✗ · Kunci: <b>${s.k[0]}</b>`}</p>${s.b ? html`<p class="ls-bahas">${s.b}</p>` : ''}</li>`)}</ol>
    <h2 class="ls-bagian">D. Uraian</h2>
    <ol class="ls-hasil-daftar">${p.uraian.map((s, i) => html`<li><p>${baris(s.t)}</p><p class="ls-jwb">Jawabanmu: ${h.jawaban.uraian[i] || '—'}</p><p class="ls-bahas"><b>Jawaban model:</b> ${s.k}</p></li>`)}</ol>
    <p class="ls-promo">Latihan soal gratis lainnya di <b>www.yapida.sch.id/bank-soal</b> · Yayasan Al-Huda Yapida</p>
  </article>`;
  return dokumenLegal(`Hasil ${p.judul} — ${h.nama}`, isi, '/siswa/bank-soal');
}

/* ── lembar soal & kunci (kertas legal, maks. 2 halaman) ─────────────────────────────────────────────────────── */

function lembarSoal(p: Paket, kop: Kop, media: Media): Raw {
  const jenisLengkap = p.jenis === 'latihan' ? 'LATIHAN SOAL' : NAMA_JENIS[p.jenis].replace(/\s*\(.*\)$/, '').toUpperCase();
  return html`<article class="ls-kertas">
    ${kopHtml(kop, media, { kecil: true })}<div class="kop-garis"></div>
    <h1 class="ls-judul">${jenisLengkap}<br><span>SEMESTER ${NAMA_SEMESTER[p.semester].toUpperCase()} · TAHUN PELAJARAN ${p.tahun}</span></h1>
    <table class="ls-identitas"><tr><td>Mata pelajaran</td><td>: <b>${p.mapel}</b></td><td>Nama</td><td>: ................................................</td></tr><tr><td>Kelas</td><td>: ${namaKelasSoal(p.jenjang, p.kelas)} ${NAMA_JENJANG[p.jenjang]}</td><td>No. absen</td><td>: ............  Nilai: ............</td></tr></table>
    <p class="ls-petunjuk"><b>Petunjuk:</b> Bacalah basmalah sebelum mengerjakan. Kerjakan soal yang mudah lebih dahulu. Periksa kembali jawabanmu sebelum diserahkan.</p>
    <h2 class="ls-bagian">A. Berilah tanda silang (×) pada huruf a, b, c, atau d di depan jawaban yang paling tepat!</h2>
    <ol class="ls-pg">${p.pg.map((s) => html`<li><p>${baris(s.t)}</p><ol class="ls-opsi">${s.o.map((x) => html`<li><span dir="auto">${x}</span></li>`)}</ol></li>`)}</ol>
    <h2 class="ls-bagian">B. Jodohkan pernyataan di kiri dengan jawaban yang tepat di kanan!</h2>
    <div class="ls-jodoh"><ol>${p.jodoh.kiri.map((s) => html`<li>${s.t} <span class="ls-isi-titik">( .... )</span></li>`)}</ol><ol class="ls-kanan">${p.jodoh.kanan.map((x) => html`<li>${x}</li>`)}</ol></div>
    <h2 class="ls-bagian">C. Isilah titik-titik di bawah ini dengan jawaban yang benar!</h2>
    <ol class="ls-isian">${p.isian.map((s) => html`<li>${s.t.includes('....') ? s.t : `${s.t} ....`}</li>`)}</ol>
    <h2 class="ls-bagian">D. Jawablah pertanyaan berikut dengan benar!</h2>
    <ol class="ls-uraian">${p.uraian.map((s) => html`<li>${baris(s.t)}</li>`)}</ol>
    <p class="ls-promo">Kerjakan soal ini secara daring dan langsung dinilai di <b>www.yapida.sch.id/bank-soal</b> · ${KURIKULUM_SOAL}</p>
  </article>`;
}

function lembarKunci(p: Paket, kop: Kop, media: Media): Raw {
  return html`<article class="ls-kertas ls-kunci">
    ${kopHtml(kop, media, { kecil: true })}<div class="kop-garis"></div>
    <h1 class="ls-judul">KUNCI JAWABAN &amp; PEDOMAN PENSKORAN<br><span>${p.judul} · ${p.tahun}</span></h1>
    <h2 class="ls-bagian">A. Pilihan ganda (${p.pg.length} × ${BOBOT.pg} poin)</h2>
    <ol class="ls-kunci-pg">${p.pg.map((s) => html`<li><b>${HURUF[s.k]}</b>${s.b ? html` — <span>${s.b}</span>` : ''}</li>`)}</ol>
    <h2 class="ls-bagian">B. Menjodohkan (${p.jodoh.kiri.length} × ${BOBOT.jodoh} poin)</h2>
    <ol class="ls-kunci-isian">${p.jodoh.kiri.map((s) => html`<li><b>${String.fromCharCode(65 + s.k)}. ${p.jodoh.kanan[s.k]}</b></li>`)}</ol>
    <h2 class="ls-bagian">C. Isian singkat (${p.isian.length} × ${BOBOT.isian} poin)</h2>
    <ol class="ls-kunci-isian">${p.isian.map((s) => html`<li><b>${s.k[0]}</b>${s.k.length > 1 ? html` <small>(juga diterima: ${s.k.slice(1).join(', ')})</small>` : ''}</li>`)}</ol>
    <h2 class="ls-bagian">D. Uraian (${p.uraian.length} × ${BOBOT.uraian} poin)</h2>
    <ol class="ls-uraian">${p.uraian.map((s) => html`<li><p>${baris(s.t)}</p><p class="ls-bahas">${s.k}</p></li>`)}</ol>
    <p class="ls-rumus">Nilai = jumlah poin (maks. ${p.pg.length * BOBOT.pg + p.jodoh.kiri.length * BOBOT.jodoh + p.isian.length * BOBOT.isian + p.uraian.length * BOBOT.uraian}). Uraian: jawaban lengkap & benar ${BOBOT.uraian} poin, sebagian benar ${BOBOT.uraian / 2} poin.</p>
    <p class="ls-promo">www.yapida.sch.id · Bank Soal Yayasan Al-Huda Yapida</p>
  </article>`;
}

function dokumenLegal(judul: string, isi: Raw, kembali: string): string {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(judul)}</title>
<link rel="stylesheet" href="/assets/cetak.css?v=${ASSET_V}">
<link rel="stylesheet" href="/assets/soal-cetak.css?v=${ASSET_V}">
<style>@page{size:8.5in 14in;margin:12mm 13mm 12mm}</style>
</head>
<body class="cetak cetak-legal">
<div class="alat"><button type="button" class="alat-tbl utama" data-cetak>🖨️ Cetak / simpan PDF</button><a class="alat-tbl" href="${esc(kembali)}">← Kembali</a><span class="alat-ket">Kertas legal (F4/Folio 8,5 × 14 inci). Di dialog cetak pilih ukuran kertas „Legal“, lalu „Simpan sebagai PDF“ untuk berkas PDF.</span></div>
<div class="panggung panggung-legal">${isi.s}</div>
<script src="/assets/cetak.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

export function cetakSoalDok(o: { p: Paket; kop: Kop; media: Media; kunci: boolean; kembali: string }): string {
  return dokumenLegal(`${o.kunci ? 'Kunci ' : ''}${o.p.judul}`, o.kunci ? lembarKunci(o.p, o.kop, o.media) : lembarSoal(o.p, o.kop, o.media), o.kembali);
}

/** Unduhan Word (.doc): HTML yang dibuka Microsoft Word / LibreOffice, ukuran legal, kop teks + logo. */
export function docSoal(o: { p: Paket; kop: Kop; logo: string; kunci: boolean }): string {
  const p = o.p, k = o.kop;
  const isi = o.kunci ? lembarKunci(p, k, () => o.logo).s : lembarSoal(p, k, () => o.logo).s;
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${esc(p.judul)}</title>
<style>
@page WordSection1{size:8.5in 14.0in;margin:0.5in 0.55in 0.5in 0.55in}
div.WordSection1{page:WordSection1}
body{font-family:"Times New Roman",serif;font-size:11pt;line-height:1.25}
.kop{display:block;text-align:center;border-bottom:3pt double #0b5a3c;padding-bottom:4pt;margin-bottom:8pt}
.kop img{width:60px;height:60px;float:left}
.kop-induk{font-size:11pt;margin:0;font-weight:bold;color:#0b5a3c}.kop-nama{font-size:15pt;margin:0;font-weight:bold;color:#0b5a3c}
.kop-arab{font-size:13pt;margin:0;color:#8d6b12}.kop-ket,.kop-alamat,.kop-kontak{font-size:9pt;margin:0}
.kop-garis{display:none}
.ls-judul{font-size:13pt;text-align:center;margin:6pt 0}.ls-judul span{font-size:10pt;font-weight:normal}
.ls-identitas{width:100%;font-size:10.5pt;margin-bottom:6pt}.ls-petunjuk{font-size:10pt}
.ls-bagian{font-size:11pt;margin:8pt 0 4pt}
ol{margin-top:0;margin-bottom:2pt}li{margin-bottom:2pt}
.ls-opsi{list-style-type:lower-alpha}.ls-kanan{list-style-type:upper-alpha}
.ls-bahas{font-size:9.5pt;color:#333}.ls-promo{font-size:8.5pt;text-align:center;color:#555;margin-top:10pt}
</style></head>
<body><div class="WordSection1">${isi}</div></body></html>`;
}

/* ── portal guru ─────────────────────────────────────────────────────────────────────────────────────────────── */

export type TabSoal = 'guru' | 'siswa' | 'peta';

export function portalBankSoalPage(o: { bawaan: IndeksPaket[]; lembaga: (IndeksPaket & { unitNama: string })[]; bolehBuat: boolean; tab: TabSoal; filter: { jenjang: string; kelas: string; mapel: string } }): Raw {
  const f = o.filter;
  const semua = [...o.lembaga, ...o.bawaan];
  const diTab = (p: IndeksPaket) => (o.tab === 'guru' ? untukGuru(p) : !untukGuru(p));
  const cocok = (p: IndeksPaket) => diTab(p) && (!f.jenjang || p.jenjang === f.jenjang) && (!f.kelas || String(p.kelas) === f.kelas) && (!f.mapel || slugKurikulum(p.mapel) === slugKurikulum(f.mapel));
  const mapel = [...new Map(semua.filter(diTab).map((p) => [slugKurikulum(p.mapel), p.mapel] as const)).entries()].sort((a, b) => a[1].localeCompare(b[1], 'id'));
  const qs = (tab: TabSoal, x: Partial<typeof f> = {}) => { const v = { ...f, ...x }; const q = new URLSearchParams({ tab }); for (const [k, w] of Object.entries(v)) if (w) q.set(k, w); return `/portal/bank-soal?${q}`; };
  const tab = (t: TabSoal, label: string, n?: number) => html`<a class="p-tab" href="${qs(t)}"${raw(o.tab === t ? ' aria-current="page"' : '')}>${label}${n !== undefined ? html` <b>${n}</b>` : ''}</a>`;
  const baris = (p: IndeksPaket & { unitNama?: string }) => html`<li><a href="/portal/bank-soal/${p.id}"><span class="bs-ikon" aria-hidden="true">${ikonMapel(p.mapel)}</span><span class="bs-p-isi"><strong>${p.mapel}</strong><small>${namaKelasSoal(p.jenjang, p.kelas)} ${NAMA_JENJANG[p.jenjang]} · ${p.jenjang === 'ra' ? 'permainan' : `${SINGKAT_JENIS[p.jenis]} ${NAMA_SEMESTER[p.semester]}`} · ${p.jumlah} soal${p.unitNama ? ` · ${p.unitNama}` : ''}</small></span>${p.st === 'draf' ? html`<span class="sr-status sr-s-baru">Draf</span>` : ''}</a></li>`;
  const ket: Record<TabSoal, Raw> = {
    guru: html`<b>Soal ujian PTS &amp; PAS — khusus guru.</b> Tidak tampil di situs publik maupun Portal Siswa. Cetak di kertas legal berkop lembaga (maks. 2 lembar), unduh Word, dan sesudah ujian selesai boleh <b>dibagikan ke siswa</b> sebagai latihan dari halaman paketnya.`,
    siswa: html`<b>Latihan soal — untuk siswa.</b> Tampil di halaman publik <a href="/bank-soal" target="_blank" rel="noopener">Latihan Soal</a> dan di <b>Portal Siswa → Bank soal</b>. Siswa yang masuk (NISN/NIS + tanggal lahir) nilainya tersimpan dan terlihat di rekap guru.`,
    peta: html`<b>Peta kelengkapan</b> — setiap mata pelajaran tiap kelas punya 6 slot: PTS &amp; PAS Ganjil/Genap (bank soal guru) dan Latihan Ganjil/Genap (bank soal siswa). Ketuk slot kosong untuk membuat paketnya dengan kerangka yang sudah terisi.`,
  };
  const daftar = () => html`
  <form method="get" class="bs-p-saring"><input type="hidden" name="tab" value="${o.tab}">
    <label class="p-bidang"><span>Jenjang</span><select name="jenjang" onchange="this.form.submit()"><option value="">Semua</option>${(['ra', 'mi', 'mts'] as JenjangSoal[]).map((j) => html`<option value="${j}"${raw(f.jenjang === j ? ' selected' : '')}>${NAMA_JENJANG[j]}</option>`)}</select></label>
    <label class="p-bidang"><span>Kelas</span><select name="kelas" onchange="this.form.submit()"><option value="">Semua</option>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => html`<option value="${k}"${raw(f.kelas === String(k) ? ' selected' : '')}>${k <= 2 && f.jenjang === 'ra' ? (k === 1 ? 'Kelompok A' : 'Kelompok B') : `Kelas ${k}`}</option>`)}</select></label>
    <label class="p-bidang"><span>Mata pelajaran</span><select name="mapel" onchange="this.form.submit()"><option value="">Semua</option>${mapel.map(([slug, m]) => html`<option value="${slug}"${raw(slugKurikulum(f.mapel) === slug ? ' selected' : '')}>${m}</option>`)}</select></label>
    <noscript><button class="tbl tbl-garis tbl-kecil">Saring</button></noscript>
  </form>
  <section class="p-kartu"><h2>Paket guru lembaga <small>(${o.lembaga.filter(cocok).length})</small></h2>
    ${o.lembaga.filter(cocok).length ? html`<ul class="bs-p-daftar">${o.lembaga.filter(cocok).map(baris)}</ul>` : html`<p class="p-kecil">Belum ada paket buatan guru${f.jenjang || f.kelas || f.mapel ? ' untuk saringan ini' : ''}. ${o.bolehBuat ? html`<a href="${qs('peta')}">Lihat peta kelengkapan</a> untuk membuat paket yang belum ada, atau salin paket bawaan lalu ubah.` : ''}</p>`}
  </section>
  <section class="p-kartu"><h2>Paket bawaan yayasan <small>(${o.bawaan.filter(cocok).length})</small></h2>
    ${o.bawaan.filter(cocok).length ? html`<ul class="bs-p-daftar">${o.bawaan.filter(cocok).map(baris)}</ul>` : html`<p class="p-kecil">Belum ada paket bawaan untuk saringan ini.</p>`}
  </section>`;
  return html`<div class="bs-p">
  <div class="p-kartu bs-p-kepala"><div><h2>Bank Soal</h2><p class="p-kecil">${ket[o.tab]}</p></div>
    ${o.bolehBuat ? html`<a class="tbl tbl-emas" href="/portal/bank-soal/baru">+ Buat paket soal</a>` : ''}</div>
  <nav class="p-tabs" aria-label="Jenis bank soal">${tab('guru', '📝 Soal ujian guru (PTS/PAS)', semua.filter(untukGuru).length)}${tab('siswa', '🎒 Latihan siswa', semua.filter((p) => !untukGuru(p)).length)}${tab('peta', '🗺️ Peta kelengkapan')}</nav>
  ${o.tab === 'peta' ? petaSoal(semua, f, o.bolehBuat, qs) : daftar()}
</div>`;
}

/** Peta kelengkapan: per jenjang (mapel × kelas, n/6 slot) atau per kelas (mapel × 6 slot, tautan isi/buat). */
function petaSoal(semua: IndeksPaket[], f: { jenjang: string; kelas: string; mapel: string }, bolehBuat: boolean, qs: (t: TabSoal, x?: Partial<{ jenjang: string; kelas: string; mapel: string }>) => string): Raw {
  const j: 'mi' | 'mts' = f.jenjang === 'mts' ? 'mts' : 'mi';
  const kur = KURIKULUM[j];
  const hitung = new Map<string, number>();
  for (const p of semua) hitung.set(kunciSlot(p), (hitung.get(kunciSlot(p)) ?? 0) + 1);
  const isi = (m: Mapel, k: number) => SLOT_SOAL.filter((s) => hitung.get(kunciSlot({ jenjang: j, kelas: k, mapel: m.slug, jenis: s.jenis, semester: s.semester }))).length;
  const slotJenjang = (jj: 'mi' | 'mts') => KURIKULUM[jj].mapel.reduce((n, m) => n + m.kelas.length * SLOT_SOAL.length, 0);
  const terisiJenjang = (jj: 'mi' | 'mts') => KURIKULUM[jj].mapel.reduce((n, m) => n + m.kelas.reduce((a, k) => a + SLOT_SOAL.filter((s) => hitung.get(kunciSlot({ jenjang: jj, kelas: k, mapel: m.slug, jenis: s.jenis, semester: s.semester }))).length, 0), 0);
  const persen = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const kelas = Number(f.kelas);
  const kelasOk = kur.kelas.includes(kelas) ? kelas : null;
  const jumlahMapel = (k: number) => kur.mapel.filter((m) => m.kelas.includes(k)).length;
  const ra = semua.filter((p) => p.jenjang === 'ra').length;
  const ringkas = html`<div class="bs-angka-kisi">${(['mi', 'mts'] as const).map((jj) => { const a = terisiJenjang(jj), b = slotJenjang(jj); return html`<a class="p-kartu bs-peta-jj${jj === j ? ' aktif' : ''}" href="${qs('peta', { jenjang: jj, kelas: '', mapel: '' })}"><span>${NAMA_JENJANG[jj]} kelas ${KURIKULUM[jj].kelas[0]}–${KURIKULUM[jj].kelas.at(-1)}</span><b>${persen(a, b)}%</b><small>${a} dari ${b} slot</small></a>`; })}<div class="p-kartu"><span>RA (Kelompok A &amp; B)</span><b>${ra}</b><small>paket permainan bergambar</small></div></div>`;
  const pilihKelas = html`<nav class="p-tabs" aria-label="Kelas"><a class="p-tab" href="${qs('peta', { jenjang: j, kelas: '', mapel: '' })}"${raw(kelasOk === null ? ' aria-current="page"' : '')}>Semua kelas</a>${kur.kelas.map((k) => html`<a class="p-tab" href="${qs('peta', { jenjang: j, kelas: String(k), mapel: '' })}"${raw(kelasOk === k ? ' aria-current="page"' : '')}>Kelas ${k} <b>${jumlahMapel(k)}</b></a>`)}</nav>`;
  if (kelasOk === null) {
    return html`${ringkas}${pilihKelas}
  <section class="p-kartu"><h2>${kur.nama} — ${kur.mapel.length} mata pelajaran</h2>
    <p class="p-kecil">Angka = slot terisi dari 6 (PTS/PAS Ganjil-Genap + Latihan Ganjil-Genap). Ketuk kelas untuk melihat rinciannya. Jumlah mapel per kelas: ${kur.kelas.map((k) => `kelas ${k}: ${jumlahMapel(k)}`).join(' · ')}.</p>
    <div class="p-tabel-gulir"><table class="p-tabel bs-peta"><thead><tr><th scope="col">Mata pelajaran</th>${kur.kelas.map((k) => html`<th scope="col"><a href="${qs('peta', { jenjang: j, kelas: String(k), mapel: '' })}">Kelas ${k}</a></th>`)}</tr></thead>
    <tbody>${kur.mapel.map((m) => html`<tr><th scope="row"><span aria-hidden="true">${m.ikon}</span> ${namaMapelSoal(m.nama)}</th>${kur.kelas.map((k) => { if (!m.kelas.includes(k)) return html`<td class="bs-sel-tidak" title="Tidak diajarkan di kelas ${k}">—</td>`; const n = isi(m, k); return html`<td class="bs-sel bs-sel-${n === 0 ? 0 : n === SLOT_SOAL.length ? 2 : 1}"><a href="${qs('peta', { jenjang: j, kelas: String(k), mapel: '' })}#m-${m.slug}">${n}/${SLOT_SOAL.length}</a></td>`; })}</tr>`)}</tbody></table></div>
  </section>`;
  }
  const mapelKelas = kur.mapel.filter((m) => m.kelas.includes(kelasOk));
  const sel = (m: Mapel, s: (typeof SLOT_SOAL)[number]) => {
    const n = hitung.get(kunciSlot({ jenjang: j, kelas: kelasOk, mapel: m.slug, jenis: s.jenis, semester: s.semester })) ?? 0;
    if (n) return html`<td class="bs-sel bs-sel-2"><a href="${qs(s.jenis === 'latihan' ? 'siswa' : 'guru', { jenjang: j, kelas: String(kelasOk), mapel: m.slug })}" title="${n} paket">✓ ${n}</a></td>`;
    const buat = `/portal/bank-soal/baru?${new URLSearchParams({ jenjang: j, kelas: String(kelasOk), mapel: namaMapelSoal(m.nama), semester: s.semester, jenis: s.jenis })}`;
    return html`<td class="bs-sel bs-sel-0">${bolehBuat ? html`<a href="${buat}" title="Buat ${s.nama} ${namaMapelSoal(m.nama)} kelas ${kelasOk}">+ Buat</a>` : '—'}</td>`;
  };
  const a = mapelKelas.reduce((n, m) => n + isi(m, kelasOk), 0), b = mapelKelas.length * SLOT_SOAL.length;
  return html`${ringkas}${pilihKelas}
  <section class="p-kartu"><h2>${NAMA_JENJANG[j]} Kelas ${kelasOk} — ${mapelKelas.length} mata pelajaran <small>(${a}/${b} slot · ${persen(a, b)}%)</small></h2>
    <p class="p-kecil">✓ = paket sudah ada (ketuk untuk membuka daftarnya). <b>+ Buat</b> = slot kosong: editor terbuka dengan kepala paket dan kerangka soal yang sudah terisi.</p>
    <div class="p-tabel-gulir"><table class="p-tabel bs-peta"><thead><tr><th scope="col">Mata pelajaran</th>${SLOT_SOAL.map((s) => html`<th scope="col" class="${s.jenis === 'latihan' ? 'bs-kol-siswa' : 'bs-kol-guru'}">${s.nama}<small>${s.jenis === 'latihan' ? 'siswa' : 'guru'}</small></th>`)}</tr></thead>
    <tbody>${mapelKelas.map((m) => html`<tr id="m-${m.slug}"><th scope="row"><span aria-hidden="true">${m.ikon}</span> ${namaMapelSoal(m.nama)}</th>${SLOT_SOAL.map((s) => sel(m, s))}</tr>`)}</tbody></table></div>
  </section>`;
}

export function editorSoalPage(o: { teks: string; id?: string; unit: string; units: Pick<UnitItem, 'slug' | 'nama'>[]; status: 'draf' | 'tayang'; bolehTayang: boolean; galat?: string[]; peringatan?: string[] }): Raw {
  return html`<form method="post" action="/portal/bank-soal/simpan" class="bs-editor" data-bs-editor>
  ${o.id ? html`<input type="hidden" name="id" value="${o.id}">` : ''}
  <div class="bs-editor-utama p-kartu">
    ${o.galat?.length ? html`<div class="p-kilat p-kilat-galat" role="alert"><b>Paket belum bisa disimpan:</b><ul>${o.galat.map((g) => html`<li>${g}</li>`)}</ul></div>` : ''}
    ${o.peringatan?.length ? html`<div class="p-kilat bs-peringatan" role="status"><ul>${o.peringatan.map((g) => html`<li>${g}</li>`)}</ul></div>` : ''}
    <div class="p-baris">
      <label class="p-bidang"><span>Lembaga pemilik</span><select name="unit">${o.units.map((u) => html`<option value="${u.slug}"${raw(o.unit === u.slug ? ' selected' : '')}>${u.nama}</option>`)}</select></label>
      <label class="p-bidang"><span>Status</span><select name="status"><option value="draf"${raw(o.status === 'draf' ? ' selected' : '')}>Draf — belum terlihat siswa</option>${o.bolehTayang ? html`<option value="tayang"${raw(o.status === 'tayang' ? ' selected' : '')}>Tayang — dikerjakan siswa</option>` : ''}</select>${o.bolehTayang ? '' : html`<small>Kontributor menyimpan draf; admin lembaga menayangkannya.</small>`}</label>
    </div>
    <label class="p-bidang"><span>Naskah paket soal</span><textarea name="teks" rows="26" spellcheck="true" required data-bs-teks>${o.teks}</textarea></label>
    <p class="bs-editor-status" data-bs-status aria-live="polite"></p>
    <div class="sr-p-baris-tbl"><button class="tbl tbl-emas" type="submit">Simpan paket</button><a class="tbl tbl-garis" href="${o.id ? `/portal/bank-soal/${o.id}` : '/portal/bank-soal'}">Batal</a></div>
  </div>
  <aside class="bs-editor-bantu p-kartu">
    <h2>Cara menulis</h2>
    <ul class="bs-bantu">
      <li><b>@jenjang</b> ra / mi / mts · <b>@kelas</b> 1–9 (RA: 1 = Kelompok A, 2 = Kelompok B) · <b>@mapel</b> · <b>@semester</b> ganjil / genap · <b>@jenis</b> pts / pas / latihan</li>
      <li><b>[PILIHAN GANDA]</b> nomor + soal, lalu pilihan <b>a.</b>–<b>d.</b>; tandai yang benar dengan <b>*</b> (mis. <code>*b. Ramadan</code>); pembahasan diawali <b>&gt;</b></li>
      <li><b>[MENJODOHKAN]</b> <code>1. pernyataan = jawaban</code>; pengecoh: <code>~ jawaban lain</code></li>
      <li><b>[ISIAN]</b> <code>1. soal .... = jawaban | jawaban lain</code></li>
      <li><b>[URAIAN]</b> nomor + soal, lalu <code>= jawaban model</code></li>
      <li>Format baku PTS/PAS: PG ${FORMAT.pg} · menjodohkan ${FORMAT.jodoh} · isian ${FORMAT.isian} · uraian ${FORMAT.uraian} (nilai 100).</li>
    </ul>
    <details><summary>Contoh lengkap</summary><pre class="bs-contoh">${CONTOH_FORMAT}</pre></details>
  </aside>
</form>
<script>(function(){var f=document.querySelector('[data-bs-editor]');if(!f)return;var t=f.querySelector('[data-bs-teks]'),s=f.querySelector('[data-bs-status]'),h=null;function cek(){fetch('/portal/bank-soal/periksa',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({teks:t.value})}).then(function(r){return r.ok?r.json():null}).then(function(j){if(!j)return;s.className='bs-editor-status '+(j.galat.length?'bs-st-galat':j.peringatan.length?'bs-st-awas':'bs-st-ok');s.textContent=j.galat.length?('✗ '+j.galat[0]+(j.galat.length>1?' (+'+(j.galat.length-1)+' lagi)':'')):(j.ringkas?('✓ '+j.ringkas):'')+(j.peringatan.length?' · '+j.peringatan.join(' '):'')}).catch(function(){})}t.addEventListener('input',function(){clearTimeout(h);h=setTimeout(cek,700)});cek()})();</script>`;
}

export function detailSoalPage(o: { p: Paket; bawaan: boolean; units: Pick<UnitItem, 'slug' | 'nama'>[]; unitCetak: string; bolehUbah: boolean; bolehHapus: boolean; jumlahHasil: number; bagi: { unit: string; nama: string; aktif: boolean }[] }): Raw {
  const p = o.p;
  const q = (k: string) => `?unit=${encodeURIComponent(o.unitCetak)}${k}`;
  const guru = untukGuru(p);
  return html`<div class="bs-p">
  <div class="p-kartu bs-p-kepala"><div><p class="kicker">${o.bawaan ? 'Paket bawaan yayasan' : `Paket guru · ${p.status === 'tayang' ? 'Tayang' : 'Draf'}`} · <span class="bs-jenis ${guru ? 'bs-jenis-guru' : 'bs-jenis-siswa'}">${guru ? 'Bank soal guru (ujian)' : 'Latihan siswa'}</span></p><h2>${ikonMapel(p.mapel)} ${p.judul}</h2>
    <p class="p-kecil">${p.kurikulum} · Tahun pelajaran ${p.tahun} · ${p.ra?.length ? `${p.ra.length} permainan bergambar` : `PG ${p.pg.length} · menjodohkan ${p.jodoh.kiri.length} · isian ${p.isian.length} · uraian ${p.uraian.length}`}${p.penulis ? ` · disusun ${p.penulis}` : ''}</p>
    <p class="p-kecil">${guru ? 'Soal ujian ini tidak terlihat siswa maupun pengunjung. Sesudah ujian selesai, Anda bisa membagikannya ke siswa lembaga sebagai latihan (lihat di bawah).' : o.bawaan ? 'Latihan ini terbuka di halaman publik Latihan Soal dan di Portal Siswa jenjangnya.' : p.status === 'tayang' ? 'Latihan ini tampil di Portal Siswa lembaga pemiliknya.' : 'Masih draf — siswa belum melihatnya sampai ditayangkan.'}</p></div></div>
  <div class="bs-aksi-kisi">
    <a class="bs-aksi p-kartu" href="/bank-soal/${p.id}" target="_blank" rel="noopener"><span aria-hidden="true">▶</span><b>Coba kerjakan</b><small>Tampilan seperti yang dilihat siswa</small></a>
    ${p.ra?.length ? '' : html`<a class="bs-aksi p-kartu" href="/portal/bank-soal/${p.id}/cetak${q('')}" target="_blank" rel="noopener"><span aria-hidden="true">🖨️</span><b>Cetak soal</b><small>Kertas legal, maks. 2 lembar, berkop lembaga</small></a>
    <a class="bs-aksi p-kartu" href="/portal/bank-soal/${p.id}/cetak${q('&kunci=1')}" target="_blank" rel="noopener"><span aria-hidden="true">🔑</span><b>Kunci &amp; pedoman skor</b><small>Untuk guru</small></a>
    <a class="bs-aksi p-kartu" href="/portal/bank-soal/${p.id}/doc${q('')}"><span aria-hidden="true">📄</span><b>Unduh Word (.doc)</b><small>Bisa diubah di Word / LibreOffice</small></a>`}
    <a class="bs-aksi p-kartu" href="/portal/bank-soal/${p.id}/hasil"><span aria-hidden="true">📊</span><b>Rekap nilai siswa</b><small>${o.jumlahHasil} pengerjaan · grafik & unduh</small></a>
    ${o.bolehUbah ? html`<a class="bs-aksi p-kartu" href="/portal/bank-soal/${o.bawaan ? `baru?salin=${p.id}` : `${p.id}/ubah`}"><span aria-hidden="true">✏️</span><b>${o.bawaan ? 'Salin & ubah' : 'Ubah paket'}</b><small>${o.bawaan ? 'Jadi paket lembaga Anda' : 'Edit naskah soal'}</small></a>` : ''}
  </div>
  ${guru && o.bagi.length ? html`<section class="p-kartu bs-bagi"><h2>Bagikan ke siswa sebagai latihan</h2>
    <p class="p-kecil">Bagikan <b>sesudah ujian selesai</b>. Siswa lembaga yang dipilih akan melihat paket ini di Portal Siswa → Bank soal, mengerjakannya, lalu mendapat nilai, kunci, dan pembahasan. Bisa ditarik kembali kapan saja.</p>
    <ul class="bs-bagi-daftar">${o.bagi.map((b) => html`<li><span><b>${b.nama}</b><small>${b.aktif ? 'Sudah dibagikan — terlihat siswa' : 'Belum dibagikan — tidak terlihat siswa'}</small></span>
      <form method="post" action="/portal/bank-soal/${p.id}/bagikan"><input type="hidden" name="unit" value="${b.unit}"><input type="hidden" name="bagi" value="${b.aktif ? '0' : '1'}"><button class="tbl tbl-kecil ${b.aktif ? 'tbl-garis' : 'tbl-emas'}"${raw(b.aktif ? '' : ' onclick="return confirm(\'Bagikan soal ujian ini ke siswa? Pastikan ujiannya sudah selesai.\')"')}>${b.aktif ? 'Tarik kembali' : 'Bagikan'}</button></form></li>`)}</ul>
  </section>` : ''}
  ${p.ra?.length ? '' : html`<form method="get" class="p-kartu bs-p-kop"><label class="p-bidang"><span>Kop lembaga untuk cetakan &amp; Word</span><select name="unit" onchange="this.form.submit()">${o.units.map((u) => html`<option value="${u.slug}"${raw(o.unitCetak === u.slug ? ' selected' : '')}>${u.nama}</option>`)}</select></label></form>`}
  <section class="p-kartu bs-pratinjau"><h2>Pratinjau soal</h2>
    ${p.ra?.length ? html`<ol>${p.ra.map((r) => html`<li>${r.t} <small>(${r.m}: ${r.o.join(' / ')} — kunci ${r.o[r.k]})</small></li>`)}</ol>` : html`
    <h3>A. Pilihan ganda</h3><ol>${p.pg.map((s) => html`<li><p>${baris(s.t)}</p><ol type="a">${s.o.map((x, i) => html`<li class="${i === s.k ? 'bs-kunci' : ''}">${x}</li>`)}</ol></li>`)}</ol>
    <h3>B. Menjodohkan</h3><ol>${p.jodoh.kiri.map((s) => html`<li>${s.t} → <b>${p.jodoh.kanan[s.k]}</b></li>`)}</ol>
    <h3>C. Isian</h3><ol>${p.isian.map((s) => html`<li>${s.t} → <b>${s.k.join(' / ')}</b></li>`)}</ol>
    <h3>D. Uraian</h3><ol>${p.uraian.map((s) => html`<li><p>${baris(s.t)}</p><p class="p-kecil">${s.k}</p></li>`)}</ol>`}
  </section>
  ${o.bolehHapus ? html`<form method="post" action="/portal/bank-soal/${p.id}/hapus" class="p-kartu" onsubmit="return confirm('Hapus paket ini?')"><button class="tbl tbl-garis tbl-kecil sr-tbl-bahaya">Hapus paket</button></form>` : ''}
</div>`;
}

export function rekapSoalPage(o: { p: Paket; hasil: (MetaHasil & { key: string })[]; rinci: { pg: number[]; jodoh: number[]; isian: number[] } | null; unitNama: (s: string) => string }): Raw {
  const p = o.p, n = o.hasil.length;
  const nilai = o.hasil.map((x) => x.v);
  const rata = n ? Math.round(nilai.reduce((a, b) => a + b, 0) / n) : 0;
  const rentang = [[0, 59], [60, 69], [70, 79], [80, 89], [90, 100]] as const;
  const sebaran = rentang.map(([a, b]) => nilai.filter((v) => v >= a && v <= b).length);
  const maksSebar = Math.max(1, ...sebaran);
  const bar = (persen: number, label: string) => html`<div class="bs-bar"><span class="bs-bar-label">${label}</span><span class="bs-bar-jalur"><i style="width:${Math.round(persen)}%" class="${persen < 50 ? 'sulit' : persen < 75 ? 'sedang' : 'mudah'}"></i></span><b>${Math.round(persen)}%</b></div>`;
  return html`<div class="bs-p">
  <div class="p-kartu bs-p-kepala"><div><p class="kicker">Rekap nilai</p><h2>${p.judul}</h2><p class="p-kecil">Pengerjaan siswa dari Portal Siswa (lembaga yang boleh Anda lihat). Nilai = PG, menjodohkan, isian (otomatis) + uraian (nilai diri siswa).</p></div>
    ${n ? html`<a class="tbl tbl-garis" href="/portal/bank-soal/${p.id}/hasil?csv=1">⬇ Unduh CSV (Excel)</a>` : ''}</div>
  <div class="bs-angka-kisi"><div class="p-kartu"><span>Pengerjaan</span><b>${n}</b></div><div class="p-kartu"><span>Rata-rata</span><b>${rata}</b></div><div class="p-kartu"><span>Tertinggi</span><b>${n ? Math.max(...nilai) : '—'}</b></div><div class="p-kartu"><span>Terendah</span><b>${n ? Math.min(...nilai) : '—'}</b></div><div class="p-kartu"><span>Tuntas (≥ 70)</span><b>${n ? `${Math.round((nilai.filter((v) => v >= 70).length / n) * 100)}%` : '—'}</b></div></div>
  ${n ? html`<section class="p-kartu"><h2>Sebaran nilai</h2><div class="bs-sebaran">${rentang.map(([a, b], i) => html`<div class="bs-kolom"><i style="height:${Math.round((sebaran[i]! / maksSebar) * 100)}%"></i><b>${sebaran[i]}</b><small>${a}–${b}</small></div>`)}</div></section>` : ''}
  ${o.rinci && n ? html`<section class="p-kartu"><h2>Ketuntasan per soal</h2><p class="p-kecil">Persentase siswa yang menjawab benar — soal di bawah 50% perlu dibahas ulang di kelas.</p>
    <h3>A. Pilihan ganda</h3>${o.rinci.pg.map((x, i) => bar(x, `${i + 1}`))}
    <h3>B. Menjodohkan</h3>${o.rinci.jodoh.map((x, i) => bar(x, `${i + 1}`))}
    <h3>C. Isian</h3>${o.rinci.isian.map((x, i) => bar(x, `${i + 1}`))}</section>` : ''}
  <section class="p-kartu"><h2>Daftar pengerjaan</h2>
    ${n ? html`<div class="p-tabel-gulir"><table class="p-tabel"><thead><tr><th>Nama</th><th>Lembaga</th><th>Kelas</th><th>Nilai</th><th>Waktu</th></tr></thead><tbody>${o.hasil.map((x) => html`<tr><td>${x.n}</td><td>${o.unitNama(x.u)}</td><td>${x.k}${x.r ? ` · ${x.r}` : ''}</td><td><b class="${x.v >= 70 ? 'bs-tuntas' : 'bs-belum'}">${x.v}</b></td><td>${tglWaktu(x.t)}</td></tr>`)}</tbody></table></div>` : html`<p class="p-kecil">Belum ada siswa yang mengerjakan paket ini. Siswa mengerjakannya dari <b>Portal Siswa → Bank soal</b>.</p>`}
  </section>
</div>`;
}

/* ── portal siswa ────────────────────────────────────────────────────────────────────────────────────────────── */

export function bankSoalSiswaPage(o: { kelasku: IndeksPaket[]; lain: IndeksPaket[]; riwayat: { p: string; j: string; v: number; t: number; h: string }[]; kelas: string }): Raw {
  const terakhir = new Map<string, { v: number; t: number; h: string }>();
  for (const r of o.riwayat) if (!terakhir.has(r.p)) terakhir.set(r.p, r);
  const kartu = (p: IndeksPaket) => { const r = terakhir.get(p.id); return html`<a class="bs-kartu" href="/siswa/bank-soal/${p.id}"><span class="bs-ikon" aria-hidden="true">${ikonMapel(p.mapel)}</span><span class="bs-kartu-isi"><b>${p.mapel}</b><small>${p.jenjang === 'ra' ? 'Permainan bergambar' : `${SINGKAT_JENIS[p.jenis]} · ${NAMA_SEMESTER[p.semester]}`} · ${p.jumlah} soal</small>${r ? html`<span class="bs-nilai-akhir ${r.v >= 70 ? 'bs-tuntas' : 'bs-belum'}">Nilai terakhir ${r.v}</span>` : html`<span class="bs-jumlah">Belum dikerjakan</span>`}</span><span class="bs-mulai" aria-hidden="true">${r ? 'Ulangi →' : 'Kerjakan →'}</span></a>`; };
  return html`<section class="sw-hero sw-hero-kecil"><div class="sw-hero-isi"><div><p class="kicker">Portal Siswa</p><h1>Bank Soal ${o.kelas}</h1><p class="sw-kelas">Kerjakan, serahkan, lalu lihat kunci & pembahasan. Nilaimu tersimpan dan bisa dilihat gurumu.</p></div><a class="tbl tbl-kaca tbl-kecil" href="/siswa">← Beranda siswa</a></div></section>
  <div class="wadah sw-isi">
    <section class="sw-kartu"><h2>Kelasku</h2>${o.kelasku.length ? html`<div class="bs-kisi">${o.kelasku.map(kartu)}</div>` : html`<p class="sw-kosong">Paket untuk ${o.kelas} sedang disiapkan para guru. Sementara itu, coba paket kelas lain di bawah.</p>`}</section>
    ${o.riwayat.length ? html`<section class="sw-kartu"><h2>Riwayat latihan</h2><ul class="bs-riwayat">${o.riwayat.slice(0, 30).map((r) => html`<li><a href="/siswa/bank-soal/hasil/${r.p}/${r.h}" target="_blank" rel="noopener"><span>${r.j}</span><b class="${r.v >= 70 ? 'bs-tuntas' : 'bs-belum'}">${r.v}</b><time>${tanggal(r.t)}</time></a></li>`)}</ul></section>` : ''}
    ${o.lain.length ? html`<section class="sw-kartu"><h2>Latihan kelas lain</h2><div class="bs-kisi">${o.lain.map(kartu)}</div></section>` : ''}
  </div>`;
}
