/** Tampilan Portal Siswa: masuk (NISN/NIS + tanggal lahir) dan beranda siswa. Tanpa iklan, tidak diindeks. */
import { html, raw, type Raw } from '../lib/html.ts';
import type { IndeksPaket } from '../data/soal.ts';
import { rupiah, tanggal } from '../lib/text.ts';
import { labelStatus, samarkan, type Posisi } from '../data/siswa.ts';
import { statusTagihan } from '../data/kait.ts';
import { labelJenis, labelUntuk } from '../data/dokumen.ts';
import { lencanaTagihan } from './kesiswaan.ts';

export function masukSiswaPage(o: { galat?: string; nomor?: string; pesan?: string }): Raw {
  return html`<section class="sw-masuk">
  <div class="sw-masuk-kartu">
    <img class="sw-masuk-logo" src="/assets/logo-192.webp" width="64" height="81" alt="">
    <p class="kicker">Yayasan Al-Huda Yapida</p>
    <h1>Portal Siswa</h1>
    <p class="sw-lead">Masuk dengan <b>NISN</b> (atau NIS lokal) dan <b>tanggal lahir</b>. Tidak perlu mendaftar.</p>
    ${o.pesan ? html`<p class="sw-kilat sw-ok" role="status">${o.pesan}</p>` : ''}${o.galat ? html`<p class="sw-kilat sw-galat" role="alert">${o.galat}</p>` : ''}
    <form method="post" action="/siswa/masuk" class="sw-form" autocomplete="off">
      <label><span>NISN / NIS</span><input name="nomor" inputmode="numeric" autocomplete="username" maxlength="20" required value="${o.nomor ?? ''}" placeholder="mis. 0151234567"></label>
      <label><span>Tanggal lahir</span><input name="sandi" type="password" autocomplete="current-password" maxlength="40" required placeholder="mis. 30/04/2015 atau 300415"><small>Boleh ditulis 30/04/2015, 30-04-2015, 300415, atau 30 April 2015.</small></label>
      <button class="tbl tbl-emas" type="submit">Masuk</button>
    </form>
    <p class="sw-kecil">Belum bisa masuk? Hubungi wali kelas atau admin madrasah — data siswa diisi oleh lembaga. Siswa yang sudah lulus, pindah, atau keluar tidak dapat masuk lagi.</p>
    <div class="sw-bantu"><button class="tbl-tur" type="button" data-tur-mulai aria-label="Mulai tur cara masuk"><span aria-hidden="true">▶</span> Tur cara masuk</button></div>
    <a class="sw-panduan-taut" href="/siswa/panduan">📘 Panduan siswa: simulasi masuk, soal contoh, dan cara mengerjakan latihan →</a>
  </div>
</section>`;
}

interface Terkait { id: string; j: string; t: string; u: string; s: string; sl: string; x: Record<string, unknown> }

export function berandaSiswa(o: {
  nama: string; foto?: string; lembaga: string; p: Posisi; d: Record<string, unknown>; riwayat: { tp: string; tingkat: string; rombel: string }[];
  tagihan: Terkait[]; kwitansi: Terkait[]; penghargaan: Terkait[]; hari: string; rak?: { href: string; nama: string }; mediaUrl: (f: string) => string;
  soal?: { kelasku: IndeksPaket[]; jumlahLain: number; riwayat: { p: string; j: string; v: number; t: number; h: string }[] };
}): Raw {
  const t = (k: string) => String(o.d[k] ?? '');
  const belum = o.tagihan.filter((x) => statusTagihan(x.x, o.hari).kode !== 'lunas');
  const sisa = belum.reduce((n, x) => n + statusTagihan(x.x, o.hari).sisa, 0);
  return html`<section class="sw-hero">
    <div class="sw-hero-isi">
      <div class="sw-foto">${o.foto ? html`<img src="${o.mediaUrl(o.foto)}" alt="">` : html`<span aria-hidden="true">${o.nama.charAt(0)}</span>`}</div>
      <div><p class="kicker">Assalamu’alaikum,</p><h1>${o.nama}</h1><p class="sw-kelas"><b>${o.p.tingkat}</b>${o.p.rombel ? html` · Rombel <b>${o.p.rombel}</b>` : ''} · ${o.lembaga} · Tahun Pelajaran ${o.p.tp}</p></div>
      <div class="sw-keluar"><button class="tbl-tur" type="button" data-tur-mulai aria-label="Mulai tur Portal Siswa"><span aria-hidden="true">▶</span><span class="tur-label">Tur</span></button><form method="post" action="/siswa/keluar"><button class="tbl tbl-kaca tbl-kecil" type="submit">Keluar</button></form></div>
    </div>
    <div class="sw-ubin">
      <a href="#tagihan" class="sw-u ${sisa ? 'sw-u-awas' : 'sw-u-baik'}"><span>Tagihan</span><strong>${sisa ? rupiah(sisa) : 'Lunas ✓'}</strong><small>${sisa ? `${belum.length} belum lunas` : o.tagihan.length ? 'semua sudah dibayar' : 'belum ada tagihan'}</small></a>
      <a href="#penghargaan" class="sw-u"><span>Penghargaan</span><strong>${o.penghargaan.length}</strong><small>sertifikat & piagam</small></a>
      <a href="#soal" class="sw-u"><span>Bank soal</span><strong>${o.p.tingkat}</strong><small>sesuai kelasmu</small></a>
      ${o.rak ? html`<a href="${o.rak.href}" class="sw-u"><span>Buku pelajaran</span><strong>📚</strong><small>${o.rak.nama}</small></a>` : ''}
    </div>
  </section>
  <div class="wadah sw-isi">
    <section class="sw-kartu" id="tagihan"><h2>Tagihan &amp; pembayaran</h2>
      ${o.tagihan.length ? html`<ul class="sw-tagihan">${o.tagihan.map((x) => { const st = statusTagihan(x.x, o.hari); return html`<li><div><b>${labelUntuk(x.x.untuk)}</b><span>${String(x.x.periode ?? '')}${x.x.jatuhTempo ? ` · jatuh tempo ${tanggal(String(x.x.jatuhTempo))}` : ''}</span></div><div class="sw-angka"><strong>${rupiah(Number(x.x.jumlah) || 0)}</strong>${st.kode !== 'lunas' && Number(x.x.dibayar) ? html`<small>dibayar ${rupiah(Number(x.x.dibayar))} · sisa ${rupiah(st.sisa)}</small>` : ''}</div>${lencanaTagihan(st.kode, st.label)}</li>`; })}</ul>` : html`<p class="sw-kosong">Belum ada tagihan untukmu.</p>`}
      ${o.kwitansi.length ? html`<h3>Kwitansi pembayaran</h3><ul class="sw-kw">${o.kwitansi.map((x) => html`<li><a href="/siswa/kwitansi/${x.id}" target="_blank" rel="noopener"><span>🧾 ${String(x.x.nomor ?? 'Kwitansi')}</span><b>${rupiah(Number(x.x.jumlah) || 0)}</b><small>${labelUntuk(x.x.untuk)}${x.x.keterangan ? ` · ${String(x.x.keterangan)}` : ''} · ${tanggal(x.t)}</small></a></li>`)}</ul>` : ''}
    </section>
    <section class="sw-kartu" id="penghargaan"><h2>Penghargaanku</h2>
      ${o.penghargaan.length ? html`<ul class="sw-prestasi">${o.penghargaan.map((x) => html`<li>${x.s === 'tayang' && x.sl ? raw(`<a href="/prestasi/${encodeURIComponent(x.sl)}">`) : raw('<div>')}<span class="sw-medali" aria-hidden="true">🏅</span><b>${labelJenis(x.x.jenis)}</b><span>${[x.x.capaian, x.x.predikat].filter(Boolean).join(' · ')}</span><small>${String(x.x.tahun ?? tanggal(x.t))}</small>${raw(x.s === 'tayang' && x.sl ? '</a>' : '</div>')}</li>`)}</ul>` : html`<p class="sw-kosong">Belum ada penghargaan — terus semangat belajar! 🌱</p>`}
    </section>
    <section class="sw-kartu" id="soal"><h2>Bank soal ${o.p.tingkat}</h2>
      <ol class="sw-cara-soal"><li><b>Pilih</b> paket mata pelajaran</li><li><b>Jawab</b> semua soal — tersimpan otomatis</li><li><b>Serahkan</b> → nilai, kunci &amp; pembahasan</li><li><b>Unduh</b> hasilnya (PDF)</li></ol><p class="sw-kecil"><a href="/siswa/panduan#latihan">Panduan lengkap mengerjakan latihan →</a></p>
      ${o.soal?.kelasku.length ? html`<ul class="sw-soal">${o.soal.kelasku.slice(0, 8).map((p) => { const r = o.soal!.riwayat.find((x) => x.p === p.id); return html`<li><a href="/siswa/bank-soal/${p.id}"><b>${p.mapel}</b><span>${p.jenjang === 'ra' ? 'Permainan' : `${p.jenis.toUpperCase()} ${p.semester === 'ganjil' ? 'Ganjil' : 'Genap'}`} · ${p.jumlah} soal</span>${r ? html`<em class="${r.v >= 70 ? 'sw-lulus' : 'sw-ulang'}">Nilai ${r.v}</em>` : html`<em>Kerjakan →</em>`}</a></li>`; })}</ul>` : html`<p class="sw-kosong">Paket soal untuk ${o.p.tingkat} sedang disiapkan para guru${o.soal?.jumlahLain ? ` — sementara itu ada ${o.soal.jumlahLain} paket latihan kelas lain` : ''}.</p>`}
      <p class="sw-aksi-soal"><a class="tbl tbl-emas tbl-kecil" href="/siswa/bank-soal">Buka bank soal</a>${o.soal?.riwayat.length ? html` <span class="sw-ket">${o.soal.riwayat.length} latihan sudah dikerjakan</span>` : ''}${o.rak ? html` <a class="tbl tbl-garis tbl-kecil" href="${o.rak.href}">${o.rak.nama}</a>` : ''}</p>
    </section>
    <section class="sw-kartu"><h2>Biodataku</h2>
      <dl class="sw-data">
        <div><dt>NISN</dt><dd>${t('nisn') || '—'}</dd></div><div><dt>NIS</dt><dd>${t('nis') || '—'}</dd></div>
        <div><dt>NIK</dt><dd>${samarkan(t('nik')) || '—'}</dd></div><div><dt>No. KK</dt><dd>${samarkan(t('kk')) || '—'}</dd></div>
        <div><dt>Tempat, tanggal lahir</dt><dd>${[t('tempatLahir'), t('tanggalLahir') ? tanggal(t('tanggalLahir')) : ''].filter(Boolean).join(', ') || '—'}</dd></div>
        <div><dt>Jenis kelamin</dt><dd>${t('jk') === 'L' ? 'Laki-laki' : t('jk') === 'P' ? 'Perempuan' : '—'}</dd></div>
        <div><dt>Nama ayah</dt><dd>${t('ayah') || '—'}</dd></div><div><dt>Nama ibu</dt><dd>${t('ibu') || '—'}</dd></div>
        <div class="sw-lebar"><dt>Alamat</dt><dd>${t('alamat') || '—'}</dd></div>
      </dl>
      <p class="sw-kecil">Ada data yang salah? Sampaikan ke wali kelas atau admin madrasah. <a href="/siswa/biodata" target="_blank" rel="noopener">Cetak biodata</a></p>
    </section>
    <section class="sw-kartu"><h2>Perjalanan kelasku</h2>
      <ol class="sw-lini">${o.riwayat.map((r, i) => html`<li${raw(i === o.riwayat.length - 1 ? ' class="kini"' : '')}><b>${r.tp}</b><span>${r.tingkat}${r.rombel ? ` · ${r.rombel}` : ''}</span></li>`)}</ol>
      <p class="sw-kecil">Kelas naik otomatis setiap awal tahun pelajaran. Status: <b>${labelStatus(o.p.status)}</b>.</p>
    </section>
  </div>`;
}
