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

export type Media = (f: string | undefined | null) => string;
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
  <div class="kop-teks">${k.induk ? html`<p class="kop-induk">${k.induk}</p>` : ''}<p class="kop-nama">${k.nama}</p>${k.arab ? html`<p class="kop-arab" lang="ar" dir="rtl">${k.arab}</p>` : ''}${k.ket || k.nsm ? html`<p class="kop-ket">${[k.ket, k.nsm].filter(Boolean).join(' · ')}</p>` : ''}<p class="kop-alamat">${k.alamat}</p><p class="kop-kontak">${k.kontak}</p></div>
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

const SUDUT = '<svg class="sert-sudut" viewBox="0 0 100 100" aria-hidden="true"><path d="M2 98V40Q2 2 40 2H98" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M11 90V46Q11 11 46 11H90" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M22 22c9-7 22-5 28 5s3 22-7 25-19-7-13-16 16-5 19 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="3.4" fill="currentColor"/><path d="M32 9q13 2 20 15M9 32q2 13 15 20" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><circle cx="54" cy="24" r="1.6" fill="currentColor"/><circle cx="24" cy="54" r="1.6" fill="currentColor"/></svg>';
const sudut = (n: number) => raw(SUDUT.replace('class="sert-sudut"', `class="sert-sudut s${n}"`));

export function sertifikatHtml(d: DokCetak, k: Kop, media: Media, o: { verifikasi?: string } = {}): Raw {
  const jenis = JUDUL_PENGHARGAAN[t(d, 'jenis')] ? t(d, 'jenis') : 'lainnya';
  const desain = DESAIN_ID[t(d, 'desain')] ? t(d, 'desain') : 'zamrud';
  const anak = DESAIN_ID[desain]!.kelompok === 'anak';
  const judul = t(d, 'judulSertifikat') || JUDUL_PENGHARGAAN[jenis]!;
  const foto = t(d, 'foto');
  const ttd = (nama: string, jabatan: string) => (nama ? html`<div class="sert-ttd-blok"><p class="sert-ttd-jab">${jabatan || ' '}</p><div class="sert-ttd-ruang"></div><p class="sert-ttd-nama">${nama}</p></div>` : '');
  return html`<article class="lembar a4l sert d-${desain} j-${jenis}${foto ? ' berfoto' : ''}" lang="id">
  <div class="sert-latar" aria-hidden="true"></div>
  <div class="sert-bingkai" aria-hidden="true">${sudut(1)}${sudut(2)}${sudut(3)}${sudut(4)}</div>
  <div class="sert-isi">
    <header class="sert-kop"><img class="sert-logo" src="${k.logo ? media(k.logo) : LOGO_YAYASAN}" alt=""><div><p class="sert-induk">${k.induk || k.nama}</p>${k.induk ? html`<p class="sert-lembaga">${k.nama}</p>` : ''}<p class="sert-alamat">${k.alamat}</p></div>${k.logoKanan ? html`<img class="sert-logo" src="${media(k.logoKanan)}" alt="">` : ''}</header>
    <p class="sert-bismillah" lang="ar" dir="rtl">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
    <h1 class="sert-judul">${judul}</h1>
    ${t(d, 'nomor') ? html`<p class="sert-nomor">Nomor: ${t(d, 'nomor')}</p>` : ''}
    <div class="sert-tengah">
      ${foto ? html`<figure class="sert-foto"><img src="${media(foto)}" alt=""></figure>` : ''}
      <div class="sert-teks">
        <p class="sert-diberikan">${anak ? 'dengan bangga diberikan kepada' : 'diberikan kepada'}</p>
        <p class="sert-nama">${d.judul}</p>
        ${t(d, 'kelas') ? html`<p class="sert-kelas">${t(d, 'kelas')}${k.induk ? html` · ${k.nama}` : ''}</p>` : ''}
        <p class="sert-kalimat">${kalimatPenghargaan(d.d)}</p>
      </div>
    </div>
    <footer class="sert-kaki">
      <p class="sert-tempat">${t(d, 'tempat') || k.kota}, ${tanggal(d.tanggal)}</p>
      <div class="sert-ttd">${ttd(t(d, 'ttd2Nama'), t(d, 'ttd2Jabatan'))}${ttd(t(d, 'ttd1Nama'), t(d, 'ttd1Jabatan'))}</div>
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
