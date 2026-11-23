/**
 * Halaman cetak mandiri (tanpa kepala/kaki situs): sertifikat & piagam (A4 mendatar, 12 desain), kwitansi dua rangkap,
 * surat berkop, dan contoh kertas berkop. Dipakai portal (pratinjau langsung + cetak) dan halaman Prestasi publik.
 */
import { esc, html, raw, type Raw } from '../lib/html.ts';
import { renderMarkdown } from '../lib/markdown.ts';
import { rupiah, tanggal, terbilang } from '../lib/text.ts';
import type { Dok } from '../data/koleksi.ts';
import { DESAIN_ID, JUDUL_PENGHARGAAN, kalimatPenghargaan, labelMetode, labelUntuk, type Kop } from '../data/dokumen.ts';
import { ASSET_V } from './layout.ts';
import { duaBaris, tulisAlamat, uraiAlamat } from '../lib/alamat.ts';

export type Media = (f: string | undefined | null) => string;
/** Alamat kop: dua baris (jalan sampai desa | kecamatan sampai kode pos) dengan ejaan baku. */
const barisKop = (alamat: string) => duaBaris(uraiAlamat(alamat), { singkat: false }).filter(Boolean);
/** Alamat di sertifikat: satu baris ringkas bersekat titik tengah. */
const alamatSert = (alamat: string) => tulisAlamat(uraiAlamat(alamat), { singkat: true, pisah: '  ·  ' }) || alamat;
const LOGO_YAYASAN = '/assets/logo-512.webp';
/** Dokumen yang dicetak: tersimpan (Dok) atau pratinjau dari formulir (belum punya id/slug/html). */
export type DokCetak = Pick<Dok, 'judul' | 'tanggal' | 'd' | 'unit'> & Partial<Pick<Dok, 'id' | 'slug' | 'html' | 'status'>>;

const t = (d: DokCetak, k: string) => (typeof d.d[k] === 'string' ? (d.d[k] as string).replace(/\s+/g, ' ').trim() : '');

export function halamanCetak(o: { judul: string; isi: Raw; ukuran: 'a4l' | 'a4p'; pratinjau?: boolean; bingkai?: boolean; kembali?: string; info?: string }): string {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(o.judul)}</title>
<link rel="stylesheet" href="/assets/cetak.css?v=${ASSET_V}">
<style>@page{size:A4 ${o.ukuran === 'a4l' ? 'landscape' : 'portrait'};margin:0}</style>
</head>
<body class="cetak uk-${o.ukuran}${o.pratinjau || o.bingkai ? ' muat' : ''}">
${o.pratinjau || o.bingkai
    ? (o.pratinjau ? '<div class="pita-pratinjau" aria-hidden="true">PRATINJAU</div>' : '')
    : `<div class="alat"><button type="button" class="alat-tbl utama" data-cetak>🖨️ Cetak / simpan PDF</button>${o.kembali ? `<a class="alat-tbl" href="${esc(o.kembali)}">← Kembali</a>` : ''}<span class="alat-ket">${o.info ? `${o.info} ` : ''}Kertas ${o.ukuran === 'a4l' ? 'A4 mendatar' : 'A4 tegak'} tanpa margin. Di dialog cetak pilih „Simpan sebagai PDF“ untuk berkas PDF.</span></div>`}
<div class="panggung">${o.isi.s}</div>
<script src="/assets/cetak.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── kop ────────────────────────────────────────────────────────────────── */

export function kopHtml(k: Kop, media: Media, o: { kecil?: boolean } = {}): Raw {
  // Tanpa logo unggahan, kop memakai logo Yayasan Al-Huda Yapida.
  const logo = (f: string | undefined, kelas: string) => html`<img class="kop-logo ${kelas}" src="${f ? media(f) : LOGO_YAYASAN}" alt="">`;
  const kanan = k.logoKanan || k.gaya === 'dua' ? logo(k.logoKanan, 'kop-kanan') : '';
  return html`<header class="kop g-${k.gaya} w-${k.warna}${o.kecil ? ' kop-kecil' : ''}${kanan ? ' kop-dua' : ''}">
  ${logo(k.logo, 'kop-kiri')}
  <div class="kop-teks">${k.induk ? html`<p class="kop-induk">${k.induk}</p>` : ''}<p class="kop-nama">${k.nama}</p>${k.arab ? html`<p class="kop-arab" lang="ar" dir="rtl">${k.arab}</p>` : ''}${k.ket || k.nsm ? html`<p class="kop-ket">${[k.ket, k.nsm].filter(Boolean).join(' · ')}</p>` : ''}<p class="kop-alamat">${barisKop(k.alamat).map((b, i) => html`${i ? raw('<br>') : ''}${b}`)}</p><p class="kop-kontak">${k.kontak}</p></div>
  ${kanan}
</header><div class="kop-garis w-${k.warna}" aria-hidden="true"></div>`;
}

export function kopContohHtml(k: Kop, media: Media): Raw {
  const lebar = [92, 88, 95, 70, 0, 90, 86, 93, 60, 0, 88, 91, 75, 40];
  return html`<article class="lembar a4p surat contoh-kop w-${k.warna}" lang="id">${kopHtml(k, media)}
  <div class="contoh-isi" aria-hidden="true">${lebar.map((w) => html`<p style="width:${w}%"></p>`)}</div>
  <p class="contoh-ket">Contoh kertas berkop — isi surat ditulis di menu <b>Surat</b>, sertifikat di <b>Sertifikat &amp; piagam</b>, kwitansi di <b>Kwitansi</b>.</p>
</article>`;
}

/* ── sertifikat & piagam ────────────────────────────────────────────────── */

/** Hiasan pemisah di bawah judul: garis, belah ketupat, bunga delapan kelopak. */
const HIAS = raw('<svg class="sert-hias" viewBox="0 0 240 16" aria-hidden="true"><path d="M8 8H96M144 8H232" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M96 8l6-4 6 4-6 4zM132 8l6-4 6 4-6 4z" fill="currentColor"/><g transform="translate(120 8)" fill="currentColor"><circle r="2.2"/><path d="M0-7.5l1.6 4.4L0-1.6-1.6-3.1zM0 7.5l1.6-4.4L0 1.6-1.6 3.1zM-7.5 0l4.4 1.6L-1.6 0-3.1-1.6zM7.5 0L3.1 1.6 1.6 0 3.1-1.6z"/><path d="M-5.3-5.3l3.6 1.9-1.3 1.3zM5.3 5.3L1.7 3.4l1.3-1.3zM5.3-5.3L3.4-1.7 2.1-3zM-5.3 5.3l1.9-3.6 1.3 1.3z" opacity=".7"/></g></svg>');

/* ── unsur premium: emas foil, sudut arabesque, segel bertulisan melingkar, garis hias ── */

/** Gradasi emas foil — dipakai sudut, segel, dan garis hias (satu definisi per lembar). */
const FOIL = '<svg class="sert-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><linearGradient id="yp-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5a0c"/><stop offset=".2" stop-color="#e9cf7a"/><stop offset=".38" stop-color="#fff4c7"/><stop offset=".52" stop-color="#c9a227"/><stop offset=".7" stop-color="#f7e3a1"/><stop offset=".86" stop-color="#9c7414"/><stop offset="1" stop-color="#e2c063"/></linearGradient><radialGradient id="yp-foil-r" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff7d6"/><stop offset=".35" stop-color="#f1d27a"/><stop offset=".7" stop-color="#c9a227"/><stop offset="1" stop-color="#7a5a0c"/></radialGradient></defs></svg>';

/** Sudut arabesque: garis ganda, sulur ganda, daun, bintang delapan. */
const SUDUT_PREMIUM = '<svg class="sert-sudut" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="url(#yp-foil)" stroke-linecap="round"><path d="M4 116V30Q4 4 30 4H116" stroke-width="2.6"/><path d="M11 116V34Q11 11 34 11H116" stroke-width="1"/><path d="M17 96V40Q17 17 40 17H96" stroke-width=".7" stroke-dasharray="1.6 2.4"/><path d="M26 26c14-10 34-8 40 6s-2 28-15 27-17-14-8-20 18 0 16 9" stroke-width="2"/><path d="M26 26c-10 14-8 34 6 40s28-2 27-15-14-17-20-8 0 18 9 16" stroke-width="2"/><path d="M58 22q18-3 30 6M22 58q-3 18 6 30" stroke-width="1.2"/><path d="M70 13q10 4 16 0M13 70q4 10 0 16" stroke-width="1"/></g><g fill="url(#yp-foil)"><path d="M26 15l3.2 7.8L37 26l-7.8 3.2L26 37l-3.2-7.8L15 26l7.8-3.2z"/><path d="M26 18.5l5.3 2.2 2.2 5.3-2.2 5.3-5.3 2.2-5.3-2.2-2.2-5.3 2.2-5.3z" opacity=".55"/><ellipse cx="90" cy="27" rx="5" ry="2.2" transform="rotate(25 90 27)"/><ellipse cx="27" cy="90" rx="5" ry="2.2" transform="rotate(65 27 90)"/><circle cx="66" cy="40" r="1.8"/><circle cx="40" cy="66" r="1.8"/><circle cx="101" cy="11" r="1.6"/><circle cx="11" cy="101" r="1.6"/></g></svg>';
const sudutP = (n: number) => raw(SUDUT_PREMIUM.replace('class="sert-sudut"', `class="sert-sudut s${n}"`));

/** Garis hias (swash) di bawah nama penerima. */
const SWASH = raw('<svg class="sert-swash" viewBox="0 0 400 24" aria-hidden="true"><path d="M8 14C70 4 130 22 200 12S330 4 392 14" fill="none" stroke="url(#yp-foil)" stroke-width="1.6" stroke-linecap="round"/><path d="M60 16c30-6 60-6 90 2M250 18c30-8 60-8 90-2" fill="none" stroke="url(#yp-foil)" stroke-width=".8" stroke-linecap="round"/><path d="M200 5l4 7-4 7-4-7z" fill="url(#yp-foil)"/><circle cx="8" cy="14" r="2" fill="url(#yp-foil)"/><circle cx="392" cy="14" r="2" fill="url(#yp-foil)"/></svg>');

/** Segel emas bergerigi dengan tulisan melingkar, logo di tengah, dan dua pita berwarna desain. */
function segel(logo: string, teksMelingkar: string, idUnik: string): Raw {
  const gerigi = Array.from({ length: 48 }, (_, i) => { const a = (i * Math.PI) / 24, r = i % 2 ? 84 : 92; return `${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`; }).join(' ');
  return html`<div class="sert-segel" aria-hidden="true"><svg viewBox="0 0 200 250"><path class="pita-segel" d="M72 150 46 244l20-12 14 18 20-92Z"/><path class="pita-segel" d="M128 150l26 94-20-12-14 18-20-92Z"/><path class="pita-segel-lipat" d="M72 150 66 172l14-2 4-14Z M128 150l6 22-14-2-4-14Z"/>
<polygon points="${gerigi}" fill="url(#yp-foil-r)" stroke="#7a5a0c" stroke-width="1"/><circle cx="100" cy="100" r="78" fill="url(#yp-foil)" stroke="#7a5a0c" stroke-width="1.2"/><circle cx="100" cy="100" r="71" fill="none" stroke="rgba(255,248,220,.75)" stroke-width="1" stroke-dasharray="1.2 2.2"/><path id="${idUnik}" d="M100 100m-60 0a60 60 0 1 1 120 0a60 60 0 1 1-120 0" fill="none"/><text class="segel-teks"><textPath href="#${idUnik}" startOffset="0" textLength="372">${teksMelingkar}</textPath></text><circle cx="100" cy="100" r="45" fill="#fffdf3" stroke="#7a5a0c" stroke-width="1"/><image href="${logo}" x="66" y="66" width="68" height="68" preserveAspectRatio="xMidYMid meet"/></svg></div>`;
}

/** Mutiara hikmah di sertifikat — hadits sahih yang masyhur, teksnya tetap (tidak pernah disusun mesin). */
const MOTTO: Record<string, [string, string]> = {
  tahfidz: ['خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', 'Sebaik-baik kalian adalah yang mempelajari Al-Qur’an dan mengajarkannya. (HR. Bukhari)'],
  teladan: ['إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلَاقًا', 'Sesungguhnya yang terbaik di antara kalian adalah yang paling baik akhlaknya. (HR. Bukhari dan Muslim)'],
  ilmu: ['مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللّٰهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ', 'Barang siapa menempuh jalan untuk mencari ilmu, Allah mudahkan baginya jalan menuju surga. (HR. Muslim)'],
  anak: ['بَارَكَ اللّٰهُ فِيْكَ', 'Semoga Allah memberkahimu.'],
};

export function sertifikatHtml(d: DokCetak, k: Kop, media: Media, o: { verifikasi?: string } = {}): Raw {
  const jenis = JUDUL_PENGHARGAAN[t(d, 'jenis')] ? t(d, 'jenis') : 'lainnya';
  const desain = DESAIN_ID[t(d, 'desain')] ? t(d, 'desain') : 'zamrud';
  const anak = DESAIN_ID[desain]!.kelompok === 'anak';
  const judul = t(d, 'judulSertifikat') || JUDUL_PENGHARGAAN[jenis]!;
  const foto = t(d, 'foto');
  const logo = k.logo ? media(k.logo) : LOGO_YAYASAN;
  const idSegel = `segel-${(d.id ?? d.judul).replace(/[^A-Za-z0-9]/g, '').slice(-12) || 'x'}`;
  const melingkar = `✦ ${(k.induk || k.nama).replace(/\s+/g, ' ').trim()} ✦ ${k.kota.toUpperCase()} `;
  const motto = MOTTO[anak ? 'anak' : jenis === 'tahfidz' ? 'tahfidz' : jenis === 'teladan' ? 'teladan' : 'ilmu']!;
  const predikat = t(d, 'predikat');
  const ttd = (nama: string, jabatan: string) => (nama ? html`<div class="sert-ttd-blok"><p class="sert-ttd-jab">${jabatan || ' '}</p><div class="sert-ttd-ruang"></div><p class="sert-ttd-nama">${nama}</p></div>` : html`<div class="sert-ttd-blok kosong"></div>`);
  return html`<article class="lembar a4l sert premium d-${desain} j-${jenis}${foto ? ' berfoto' : ''}" lang="id">${raw(FOIL)}
  <div class="sert-latar" aria-hidden="true"><div class="sert-tanda"><img class="tanda-bayang" src="${logo}" alt=""><img class="tanda-terang" src="${logo}" alt=""><img class="tanda-logo" src="${logo}" alt=""></div></div>
  <div class="sert-bingkai" aria-hidden="true"></div>
  <div class="sert-motif" aria-hidden="true"></div>
  <div class="sert-garis" aria-hidden="true"></div>
  <div class="sert-sudut-wadah" aria-hidden="true">${sudutP(1)}${sudutP(2)}${sudutP(3)}${sudutP(4)}</div>
  <div class="sert-isi">
    <header class="sert-kop"><img class="sert-logo" src="${logo}" alt=""><div><p class="sert-induk">${k.induk || k.nama}</p>${k.induk ? html`<p class="sert-lembaga">${k.nama}</p>` : ''}${k.arab ? html`<p class="sert-arab" lang="ar" dir="rtl">${k.arab}</p>` : ''}<p class="sert-alamat">${alamatSert(k.alamat)}</p></div>${k.logoKanan ? html`<img class="sert-logo" src="${media(k.logoKanan)}" alt="">` : ''}</header>
    <p class="sert-bismillah" lang="ar" dir="rtl">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
    <h1 class="sert-judul"><span>${judul}</span></h1>
    ${t(d, 'nomor') ? html`<p class="sert-nomor">Nomor: ${t(d, 'nomor')}</p>` : ''}
    ${HIAS}
    <div class="sert-tengah">
      ${foto ? html`<figure class="sert-foto"><img src="${media(foto)}" alt=""></figure>` : ''}
      <div class="sert-teks">
        <p class="sert-diberikan">${anak ? 'dengan bangga diberikan kepada' : 'diberikan kepada'}</p>
        <p class="sert-nama">${d.judul}</p>
        ${SWASH}
        ${t(d, 'kelas') ? html`<p class="sert-kelas">${t(d, 'kelas')}${k.induk ? html` · ${k.nama}` : ''}</p>` : ''}
        ${predikat ? html`<p class="sert-predikat"><span>Predikat</span><b>${predikat}</b></p>` : ''}
        <p class="sert-kalimat">${kalimatPenghargaan(d.d)}</p>
        <p class="sert-motto"><span class="sert-motto-ar" lang="ar" dir="rtl">${motto[0]}</span><span class="sert-motto-arti">${motto[1]}</span></p>
      </div>
    </div>
    <footer class="sert-kaki">
      <p class="sert-tempat">${t(d, 'tempat') || k.kota}, ${tanggal(d.tanggal)}</p>
      <div class="sert-ttd">${ttd(t(d, 'ttd2Nama'), t(d, 'ttd2Jabatan'))}${segel(logo, melingkar, idSegel)}${ttd(t(d, 'ttd1Nama'), t(d, 'ttd1Jabatan'))}</div>
    </footer>
    ${o.verifikasi ? html`<p class="sert-verif">Verifikasi keaslian: ${o.verifikasi}</p>` : ''}
  </div>
</article>`;
}

/* ── kwitansi ───────────────────────────────────────────────────────────── */

export function kwitansiHtml(d: DokCetak, k: Kop, media: Media, o: { rangkap?: 1 | 2 } = {}): Raw {
  const jumlah = Number(d.d.jumlah) || 0;
  const lunas = d.d.lunas !== false;
  const satu = (label: string) => html`<section class="kw w-${k.warna}">
    ${kopHtml(k, media, { kecil: true })}
    <div class="kw-judul"><h1>Kwitansi</h1><p>No. <b>${t(d, 'nomor') || '—'}</b></p></div>
    <dl class="kw-isi">
      <dt>Sudah terima dari</dt><dd><b>${d.judul}</b>${t(d, 'kelas') ? html` <small>(${t(d, 'kelas')})</small>` : ''}</dd>
      <dt>Uang sejumlah</dt><dd class="kw-terbilang">${terbilang(jumlah)} rupiah</dd>
      <dt>Untuk pembayaran</dt><dd>${labelUntuk(d.d.untuk)}${t(d, 'keterangan') ? html` — ${t(d, 'keterangan')}` : ''}</dd>
      <dt>Cara bayar</dt><dd>${labelMetode(d.d.metode)}</dd>
    </dl>
    <div class="kw-bawah">
      <p class="kw-jumlah"><span>Rp</span><b>${rupiah(jumlah).replace('Rp ', '')}</b></p>
      ${lunas ? html`<p class="kw-lunas">LUNAS</p>` : html`<p class="kw-lunas kw-belum">BELUM LUNAS</p>`}
      <div class="kw-ttd"><p>${t(d, 'tempat') || k.kota}, ${tanggal(d.tanggal)}</p><p>Penerima,</p><div class="kw-ttd-ruang"></div><p class="kw-ttd-nama">${t(d, 'penerima') || '…'}</p>${t(d, 'jabatanPenerima') ? html`<p class="kw-ttd-jab">${t(d, 'jabatanPenerima')}</p>` : ''}</div>
    </div>
    ${t(d, 'catatan') ? html`<p class="kw-catatan">${t(d, 'catatan')}</p>` : ''}
    <p class="kw-label">${label}</p>
  </section>`;
  return html`<article class="lembar a4p kwitansi" lang="id">${satu('Asli — untuk pembayar')}${(o.rangkap ?? 2) === 2 ? html`<div class="potong" aria-hidden="true"><span>✂ potong di sini</span></div>${satu('Arsip lembaga')}` : ''}</article>`;
}

/* ── surat berkop ───────────────────────────────────────────────────────── */

export function suratHtml(d: DokCetak, k: Kop, media: Media): Raw {
  const isi = d.html?.isi ?? renderMarkdown(typeof d.d.isi === 'string' ? d.d.isi : '');
  const tembusan = Array.isArray(d.d.tembusan) ? (d.d.tembusan as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  const kepada = typeof d.d.kepada === 'string' ? d.d.kepada : '';
  return html`<article class="lembar a4p surat w-${k.warna}" lang="id">${kopHtml(k, media)}
  <p class="surat-tanggal">${t(d, 'tempat') || k.kota}, ${tanggal(d.tanggal)}</p>
  <table class="surat-meta"><tr><td>Nomor</td><td>:</td><td>${t(d, 'nomor') || '—'}</td></tr><tr><td>Lampiran</td><td>:</td><td>${t(d, 'lampiran') || '—'}</td></tr><tr><td>Perihal</td><td>:</td><td><b>${d.judul}</b></td></tr></table>
  <div class="surat-kepada">${raw(esc(kepada).replace(/\n/g, '<br>'))}</div>
  <div class="surat-isi prosa">${raw(isi)}</div>
  <div class="surat-ttd"><p>${t(d, 'ttdJabatan')}</p><div class="surat-ttd-ruang"></div><p class="surat-ttd-nama">${t(d, 'ttdNama')}</p></div>
  ${tembusan.length ? html`<div class="surat-tembusan"><p>Tembusan:</p><ol>${tembusan.map((x) => html`<li>${x}</li>`)}</ol></div>` : ''}
</article>`;
}

/* ── kesiswaan: daftar peserta didik & biodata siswa ───────────────────── */

export interface BarisDaftar { no: number; nisn: string; nis: string; nama: string; jk: string; ttl: string; ayah: string; ibu: string; alamat: string; status: string }
export interface KelompokDaftar { judul: string; sub: string; baris: BarisDaftar[] }
export interface Ttd { kota: string; tanggal: string; jabatan: string; nama: string; nip?: string }

const PER_HALAMAN = 18;

/** Daftar peserta didik A4 mendatar: setiap rombel mulai di halaman baru, berkop, judul kolom diulang, tanda tangan kepala. */
export function daftarPesertaHtml(kelompok: KelompokDaftar[], k: Kop, media: Media, ttd: Ttd): Raw {
  const lembar: Raw[] = [];
  for (const g of kelompok) {
    const L = g.baris.filter((b) => b.jk === 'L').length, P = g.baris.filter((b) => b.jk === 'P').length;
    const potong: BarisDaftar[][] = [];
    for (let i = 0; i < Math.max(1, g.baris.length); i += PER_HALAMAN) potong.push(g.baris.slice(i, i + PER_HALAMAN));
    potong.forEach((isi, h) => {
      const akhir = h === potong.length - 1;
      lembar.push(html`<article class="lembar a4l dpd w-${k.warna}" lang="id">
        ${h === 0 ? kopHtml(k, media, { kecil: true }) : html`<p class="dpd-lanjut">${k.nama} — ${g.judul} (lanjutan)</p>`}
        ${h === 0 ? html`<div class="dpd-judul"><h1>Daftar Peserta Didik</h1><p>${g.judul} · ${g.sub}</p></div>` : ''}
        <table class="dpd-tabel"><thead><tr><th>No</th><th>NISN</th><th>NIS</th><th>Nama lengkap</th><th>L/P</th><th>Tempat, tanggal lahir</th><th>Nama ayah</th><th>Nama ibu</th><th>Alamat</th><th>Ket.</th></tr></thead>
          <tbody>${isi.map((b) => html`<tr><td>${b.no}</td><td>${b.nisn}</td><td>${b.nis}</td><td class="dpd-nama">${b.nama}</td><td>${b.jk}</td><td>${b.ttl}</td><td>${b.ayah}</td><td>${b.ibu}</td><td class="dpd-alamat">${b.alamat}</td><td>${b.status}</td></tr>`)}</tbody></table>
        ${akhir ? html`<div class="dpd-kaki"><p class="dpd-rekap">Jumlah: <b>${g.baris.length}</b> peserta didik — laki-laki <b>${L}</b>, perempuan <b>${P}</b>.</p>
          <div class="dpd-ttd"><p>${ttd.kota}, ${ttd.tanggal}</p><p>${ttd.jabatan},</p><div class="dpd-ttd-ruang"></div><p class="dpd-ttd-nama">${ttd.nama || '……………………'}</p>${ttd.nip ? html`<p>NIP/NUPTK. ${ttd.nip}</p>` : ''}</div></div>` : ''}
        <p class="dpd-hal">Halaman ${h + 1} dari ${potong.length}</p>
      </article>`);
    });
  }
  return html`${lembar}`;
}

export interface Biodata {
  nama: string; foto?: string; lembaga: string; kelas: string; tp: string; status: string;
  isian: [string, string][]; riwayat: { tp: string; kelas: string }[];
}

/** Biodata siswa A4 tegak berkop, dengan foto 3×4 dan riwayat kelas. */
export function biodataHtml(b: Biodata, k: Kop, media: Media, ttd: Ttd): Raw {
  return html`<article class="lembar a4p bio w-${k.warna}" lang="id">${kopHtml(k, media)}
    <div class="bio-judul"><h1>Biodata Peserta Didik</h1><p>Tahun Pelajaran ${b.tp}</p></div>
    <div class="bio-atas">
      <figure class="bio-foto">${b.foto ? html`<img src="${media(b.foto)}" alt="">` : html`<span>Pas foto<br>3 × 4</span>`}</figure>
      <div><p class="bio-nama">${b.nama}</p><p class="bio-kelas">${b.lembaga} · ${b.kelas} · <b>${b.status}</b></p></div>
    </div>
    <table class="bio-tabel">${b.isian.map(([l, v], i) => html`<tr><td class="bio-no">${i + 1}.</td><td class="bio-label">${l}</td><td>:</td><td>${v || '—'}</td></tr>`)}</table>
    ${b.riwayat.length ? html`<h2 class="bio-sub">Riwayat kelas</h2><table class="bio-riwayat"><tr>${b.riwayat.map((r) => html`<td><b>${r.tp}</b><span>${r.kelas}</span></td>`)}</tr></table>` : ''}
    <div class="dpd-ttd bio-ttd"><p>${ttd.kota}, ${ttd.tanggal}</p><p>${ttd.jabatan},</p><div class="dpd-ttd-ruang"></div><p class="dpd-ttd-nama">${ttd.nama || '……………………'}</p>${ttd.nip ? html`<p>NIP/NUPTK. ${ttd.nip}</p>` : ''}</div>
  </article>`;
}
