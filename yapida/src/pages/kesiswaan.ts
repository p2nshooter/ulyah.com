/** Tampilan portal Kesiswaan: data siswa, profil siswa, impor file master pintar, pekerjaan bertahap, tagihan, laporan. */
import { html, raw, type Raw } from '../lib/html.ts';
import { rupiah, tanggal } from '../lib/text.ts';
import type { UnitItem } from '../data/site.ts';
import type { Dok } from '../data/koleksi.ts';
import { JENJANG, labelStatus, posisi, samarkan, type Jenjang } from '../data/siswa.ts';
import { type Kerja, type RekapTagihan, type SiswaRingkas } from '../data/kesiswaan.ts';
import { LABEL_KOLOM, type BarisSiswa, type LaporanLembar } from '../data/master.ts';
import { labelJenis, labelUntuk, UNTUK_KWITANSI } from '../data/dokumen.ts';
import { statusTagihan } from '../data/kait.ts';
import { batangMendatar, batangSegmen, kolomTegak, ubin, angka, type Butir } from './grafik.ts';

const qs = (o: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== '' && v !== 0) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : '';
};
const pilih = (nilai: string, cocok: string) => raw(nilai === cocok ? ' selected' : '');
const inisial = (n: string) => n.replace(/^(muhammad|moh\.?|m\.)\s+/i, '').charAt(0).toUpperCase() || '•';
export const STATUS_KELAS: Record<string, string> = { aktif: 'st-aktif', lulus: 'st-lulus', pindah: 'st-pindah', keluar: 'st-keluar' };
export const lencanaSiswa = (s: string) => html`<span class="ks-st ${STATUS_KELAS[s] ?? 'st-aktif'}">${labelStatus(s)}</span>`;
const IKON_TAGIHAN: Record<string, string> = { lunas: '✓', sebagian: '◐', belum: '○', telat: '!' };
export const lencanaTagihan = (kode: string, label: string) => html`<span class="ks-tg tg-${kode}"><b aria-hidden="true">${IKON_TAGIHAN[kode] ?? '○'}</b>${label}</span>`;

/* ── daftar siswa ─────────────────────────────────────────────────────── */

export interface SaringanSiswa { unit: string; tingkat: string; rombel: string; status: string; jk: string; q: string }

export function halamanSiswa(o: {
  list: SiswaRingkas[]; jumlah: number; hal: number; perHal: number; units: UnitItem[]; s: SaringanSiswa; ringkas: { aktif: number; L: number; P: number; lulus: number; lain: number; semua: number };
  tingkatAda: string[]; rombelAda: string[]; namaUnit: (slug: string) => string;
}): Raw {
  const s = o.s;
  const dasar = { unit: s.unit, tingkat: s.tingkat, rombel: s.rombel, status: s.status, jk: s.jk, q: s.q };
  const halaman = Math.max(1, Math.ceil(o.jumlah / o.perHal));
  const awal = (o.hal - 1) * o.perHal;
  const unduh = qs(dasar);
  return html`
  <section class="ks-kepala p-kartu">
    <div class="ks-ubin-baris">
      ${ubin('Siswa aktif', angka(o.ringkas.aktif), `${angka(o.ringkas.L)} laki-laki · ${angka(o.ringkas.P)} perempuan`, `/portal/siswa${qs({ ...dasar, status: 'aktif', hal: undefined })}`)}
      ${ubin('Lulus', angka(o.ringkas.lulus), 'otomatis setelah kelas tertinggi', `/portal/siswa${qs({ ...dasar, status: 'lulus' })}`)}
      ${ubin('Pindah / keluar', angka(o.ringkas.lain), 'tidak bisa masuk portal siswa', `/portal/siswa${qs({ ...dasar, status: 'nonaktif' })}`)}
      ${ubin('Semua data', angka(o.ringkas.semua), 'di lembaga yang Anda kelola', `/portal/siswa${qs({ ...dasar, status: 'semua' })}`)}
    </div>
    <div class="ks-alat">
      <a class="tbl tbl-emas tbl-kecil" href="/portal/k/siswa/baru${qs({ unit: s.unit })}">＋ Tambah siswa</a>
      <a class="tbl tbl-garis tbl-kecil" href="/portal/siswa/impor">⇪ Impor file master</a>
      <a class="tbl tbl-garis tbl-kecil" href="/portal/siswa/unduh.xlsx${unduh}" data-unduh>⬇ Excel format Kemenag</a>
      <a class="tbl tbl-garis tbl-kecil" href="/portal/siswa/cetak${unduh}" target="_blank" rel="noopener">🖨 Cetak daftar</a>
      <a class="tbl-teks" href="/portal/siswa/unduh.csv${unduh}">CSV</a>
      <a class="tbl-teks" href="/portal/siswa/templat.xlsx">Templat kosong</a>
    </div>
  </section>
  <form method="get" class="p-saring ks-saring" data-saring-otomatis>
    <select name="unit" aria-label="Lembaga"><option value="">Semua lembaga</option>${o.units.map((u) => html`<option value="${u.slug}"${pilih(s.unit, u.slug)}>${u.singkat}</option>`)}</select>
    <select name="tingkat" aria-label="Kelas"><option value="">Semua kelas</option>${o.tingkatAda.map((t) => html`<option${pilih(s.tingkat, t)}>${t}</option>`)}</select>
    <select name="rombel" aria-label="Rombel"><option value="">Semua rombel</option>${o.rombelAda.map((t) => html`<option${pilih(s.rombel, t)}>${t}</option>`)}</select>
    <select name="status" aria-label="Status"><option value="aktif"${pilih(s.status, 'aktif')}>Aktif</option><option value="lulus"${pilih(s.status, 'lulus')}>Lulus</option><option value="pindah"${pilih(s.status, 'pindah')}>Pindah</option><option value="keluar"${pilih(s.status, 'keluar')}>Keluar</option><option value="nonaktif"${pilih(s.status, 'nonaktif')}>Lulus/pindah/keluar</option><option value="semua"${pilih(s.status, 'semua')}>Semua status</option></select>
    <select name="jk" aria-label="Jenis kelamin"><option value="">L &amp; P</option><option value="L"${pilih(s.jk, 'L')}>Laki-laki</option><option value="P"${pilih(s.jk, 'P')}>Perempuan</option></select>
    <input type="search" name="q" value="${s.q}" placeholder="Cari nama, NISN, NIS…" aria-label="Cari siswa">
    <button class="tbl tbl-garis tbl-kecil" type="submit">Saring</button>
    ${s.unit || s.tingkat || s.rombel || s.jk || s.q || s.status !== 'aktif' ? html`<a class="tbl-teks" href="/portal/siswa">Hapus saringan</a>` : ''}
  </form>
  <p class="ks-hitung">${o.jumlah ? html`Menampilkan <b>${angka(awal + 1)}–${angka(Math.min(o.jumlah, awal + o.perHal))}</b> dari <b>${angka(o.jumlah)}</b> siswa · kelas dihitung untuk tahun pelajaran berjalan (naik otomatis setiap Juli)` : ''}</p>
  ${o.list.length ? html`<div class="p-tabel ks-tabel"><table>
    <thead><tr><th>No</th><th>Siswa</th><th>Lembaga</th><th>Kelas</th><th>L/P</th><th>Status</th></tr></thead>
    <tbody>${o.list.map((x, i) => html`<tr>
      <td class="ks-no">${awal + i + 1}</td>
      <td><a class="p-butir" href="/portal/siswa/${x.id}"><span class="p-inisial ks-inisial-${x.jk || 'x'}" aria-hidden="true">${inisial(x.nama)}</span><span><strong>${x.nama}</strong><small>${[x.nisn && `NISN ${x.nisn}`, x.nis && `NIS ${x.nis}`].filter(Boolean).join(' · ') || 'tanpa NISN/NIS'}</small></span></a></td>
      <td>${o.namaUnit(x.unit)}</td>
      <td><span class="ks-kelas">${x.p.tingkat}</span>${x.p.rombel ? html` <span class="ks-rombel">${x.p.rombel}</span>` : ''}${x.p.lulusTp ? html`<small class="ks-ket">lulus ${x.p.lulusTp}</small>` : ''}</td>
      <td>${x.jk || '–'}</td>
      <td>${lencanaSiswa(x.p.status)}</td>
    </tr>`)}</tbody></table></div>
    ${halaman > 1 ? html`<nav class="ks-halaman" aria-label="Halaman">${Array.from({ length: halaman }, (_, i) => i + 1).filter((h) => h === 1 || h === halaman || Math.abs(h - o.hal) <= 2).map((h, i, arr) => html`${i && h - arr[i - 1]! > 1 ? raw('<span>…</span>') : ''}<a href="/portal/siswa${qs({ ...dasar, hal: h === 1 ? undefined : h })}"${raw(h === o.hal ? ' aria-current="page"' : '')}>${h}</a>`)}</nav>` : ''}`
    : html`<div class="p-kosong"><p>${o.ringkas.semua ? 'Tidak ada siswa yang cocok dengan saringan ini.' : 'Belum ada data siswa. Impor file master dari Excel, atau tambahkan satu per satu.'}</p><a class="tbl tbl-emas" href="/portal/siswa/impor">Impor file master</a></div>`}`;
}

/* ── profil siswa ─────────────────────────────────────────────────────── */

interface Terkait { id: string; j: string; t: string; u: string; s: string; sl: string; x: Record<string, unknown> }

export function halamanProfilSiswa(o: {
  d: Dok; namaUnit: (s: string) => string; mediaUrl: (f: string) => string; riwayat: { tp: string; tingkat: string; rombel: string; status: string }[];
  tagihan: Terkait[]; kwitansi: Terkait[]; penghargaan: Terkait[]; hari: string; bolehUbah: boolean; terkunci: boolean;
}): Raw {
  const { d } = o;
  const p = posisi(d.d, d.unit);
  const t = (k: string) => String(d.d[k] ?? '');
  const foto = t('foto');
  const nomor = t('nisn') || t('nis');
  const riwayatLama = Array.isArray(d.d.riwayat) ? (d.d.riwayat as { unit: string; tingkat: string; rombel: string; status: string; sampai: string }[]) : [];
  const sisa = o.tagihan.reduce((n, x) => n + statusTagihan(x.x, o.hari).sisa, 0);
  const isian = (label: string, nilai: string | Raw) => html`<div><dt>${label}</dt><dd>${nilai || raw('<span class="ks-kosong">—</span>')}</dd></div>`;
  return html`
  <section class="ks-profil p-kartu">
    <div class="ks-profil-foto">${foto ? html`<img src="${o.mediaUrl(foto)}" alt="">` : html`<span class="ks-profil-inisial ks-inisial-${t('jk') || 'x'}" aria-hidden="true">${inisial(d.judul)}</span>`}</div>
    <div class="ks-profil-teks">
      <p class="kicker">${o.namaUnit(d.unit)} · ${p.tp}</p>
      <h2>${d.judul}</h2>
      <p class="ks-profil-kelas"><span class="ks-kelas">${p.tingkat}</span>${p.rombel ? html` <span class="ks-rombel">${p.rombel}</span>` : ''} ${lencanaSiswa(p.status)}${p.lulusTp ? html` <small>lulus tahun pelajaran ${p.lulusTp}</small>` : ''}</p>
      <p class="ks-profil-masuk">${p.status === 'aktif' && nomor && t('tanggalLahir') ? html`🔑 Masuk portal siswa: <b>${nomor}</b> + tanggal lahir (mis. <b>${tanggal(t('tanggalLahir'))}</b> ditulis ${t('tanggalLahir').slice(8, 10)}/${t('tanggalLahir').slice(5, 7)}/${t('tanggalLahir').slice(0, 4)} atau ${t('tanggalLahir').slice(8, 10)}${t('tanggalLahir').slice(5, 7)}${t('tanggalLahir').slice(2, 4)})` : 'Portal siswa tidak aktif untuk siswa ini (lulus/pindah/keluar, atau NISN/NIS/tanggal lahir belum diisi).'}${o.terkunci ? html` · <b class="ks-awas">Sedang dikunci karena salah sandi berulang.</b>` : ''}</p>
    </div>
    <div class="ks-profil-aksi">
      ${o.bolehUbah ? html`<a class="tbl tbl-emas tbl-kecil" href="/portal/k/siswa/${d.id}">✎ Ubah data</a>` : ''}
      <a class="tbl tbl-garis tbl-kecil" href="/portal/siswa/${d.id}/cetak" target="_blank" rel="noopener">🖨 Cetak biodata</a>
      <a class="tbl tbl-garis tbl-kecil" href="/portal/siswa/unduh.xlsx?id=${d.id}">⬇ Excel</a>
      ${o.terkunci ? html`<form method="post" action="/portal/siswa/${d.id}/buka" class="p-sebaris"><button class="tbl tbl-garis tbl-kecil" type="submit">🔓 Buka kunci masuk</button></form>` : ''}
    </div>
  </section>
  <div class="ks-dua">
    <section class="p-kartu"><h2>Biodata</h2><dl class="ks-data">
      ${isian('NISN', t('nisn'))}${isian('NIS lokal', t('nis'))}${isian('NIK', t('nik'))}${isian('No. KK', t('kk'))}
      ${isian('Jenis kelamin', t('jk') === 'L' ? 'Laki-laki' : t('jk') === 'P' ? 'Perempuan' : '')}${isian('Tempat, tanggal lahir', [t('tempatLahir'), t('tanggalLahir') ? tanggal(t('tanggalLahir')) : ''].filter(Boolean).join(', '))}
      ${isian('Nama ayah kandung', t('ayah'))}${isian('Nama ibu kandung', t('ibu'))}
      ${isian('Alamat', t('alamat'))}${isian('Jenjang · NSM', [t('jenjang'), t('nsm')].filter(Boolean).join(' · '))}
      ${isian('Tahun pelajaran acuan', html`${t('tahunAcuan')} <small>(${t('tingkat')}${t('rombel') ? ` ${t('rombel')}` : ''})</small>`)}
      ${t('catatan') ? isian('Catatan pengelola', t('catatan')) : ''}
    </dl></section>
    <section class="p-kartu"><h2>Perjalanan kelas</h2>
      <ol class="ks-lini">${riwayatLama.map((r) => html`<li class="ks-lini-lama"><b>${o.namaUnit(r.unit)}</b><span>${r.tingkat}${r.rombel ? ` · ${r.rombel}` : ''} — ${labelStatus(r.status)} ${r.sampai}</span></li>`)}
      ${o.riwayat.map((r, i) => html`<li${raw(i === o.riwayat.length - 1 ? ' class="ks-lini-kini"' : '')}><b>${r.tp}</b><span>${r.tingkat}${r.rombel ? ` · ${r.rombel}` : ''}${r.status !== 'aktif' ? ` — ${labelStatus(r.status)}` : ''}</span></li>`)}</ol>
      <p class="p-kecil">Kelas naik satu tingkat setiap awal tahun pelajaran (Juli), nomor/huruf rombel ikut naik. Tinggal kelas: ubah tingkat & tahun acuan di <b>Ubah data</b>.</p>
    </section>
  </div>
  <section class="p-kartu"><div class="ks-judul-aksi"><h2>Tagihan &amp; pembayaran</h2><span>${sisa ? html`Sisa tagihan <b>${rupiah(sisa)}</b>` : o.tagihan.length ? html`<b class="ks-lunas">Semua lunas ✓</b>` : ''}</span>
    ${o.bolehUbah ? html`<a class="tbl tbl-garis tbl-kecil" href="/portal/k/tagihan/baru?siswa=${d.id}">＋ Tagihan</a><a class="tbl tbl-garis tbl-kecil" href="/portal/k/kwitansi/baru?siswa=${d.id}">＋ Kwitansi</a>` : ''}</div>
    ${o.tagihan.length ? html`<div class="p-tabel"><table><thead><tr><th>Tagihan</th><th>Jumlah</th><th>Dibayar</th><th>Status</th><th></th></tr></thead><tbody>${o.tagihan.map((x) => {
      const st = statusTagihan(x.x, o.hari);
      return html`<tr><td><strong>${labelUntuk(x.x.untuk)}</strong><small class="ks-ket">${String(x.x.periode ?? '')}${x.x.jatuhTempo ? ` · jatuh tempo ${tanggal(String(x.x.jatuhTempo))}` : ''}</small></td><td>${rupiah(Number(x.x.jumlah) || 0)}</td><td>${rupiah(Number(x.x.dibayar) || 0)}</td><td>${lencanaTagihan(st.kode, st.label)}</td>
        <td class="ks-aksi-sel">${st.kode !== 'lunas' && o.bolehUbah ? html`<a class="tbl tbl-emas tbl-kecil" href="/portal/k/kwitansi/baru?tagihan=${x.id}">Bayar</a>` : ''}<a class="tbl-teks" href="/portal/k/tagihan/${x.id}">Ubah</a></td></tr>`;
    })}</tbody></table></div>` : html`<p class="p-kecil">Belum ada tagihan.</p>`}
    ${o.kwitansi.length ? html`<h3 class="ks-sub">Kwitansi</h3><ul class="ks-kw">${o.kwitansi.map((x) => html`<li><a href="/portal/cetak/kwitansi/${x.id}" target="_blank" rel="noopener"><b>${String(x.x.nomor ?? 'Kwitansi')}</b><span>${labelUntuk(x.x.untuk)}${x.x.keterangan ? ` · ${String(x.x.keterangan)}` : ''}</span><strong>${rupiah(Number(x.x.jumlah) || 0)}</strong><small>${tanggal(x.t)}</small></a></li>`)}</ul>` : ''}
  </section>
  <section class="p-kartu"><div class="ks-judul-aksi"><h2>Penghargaan</h2>${o.bolehUbah ? html`<a class="tbl tbl-garis tbl-kecil" href="/portal/k/penghargaan/baru?siswa=${d.id}">＋ Sertifikat</a>` : ''}</div>
    ${o.penghargaan.length ? html`<ul class="ks-kw">${o.penghargaan.map((x) => html`<li><a href="/portal/cetak/penghargaan/${x.id}" target="_blank" rel="noopener"><b>🏅 ${labelJenis(x.x.jenis)}</b><span>${[x.x.capaian, x.x.predikat].filter(Boolean).join(' · ')}</span><small>${String(x.x.tahun ?? tanggal(x.t))}</small></a></li>`)}</ul>` : html`<p class="p-kecil">Belum ada penghargaan. Isi NISN/NIS siswa di sertifikat supaya tampil di sini dan di portal siswanya.</p>`}
  </section>`;
}

/* ── impor ────────────────────────────────────────────────────────────── */

export function halamanImpor(o: { galat?: string }): Raw {
  return html`
  ${o.galat ? html`<p class="p-kilat p-kilat-galat" role="alert">${o.galat}</p>` : ''}
  <form method="post" action="/portal/siswa/impor" enctype="multipart/form-data" class="p-kartu ks-impor" data-impor data-impor-klien="siswa">
    <div class="ks-jatuh" data-jatuh>
      <span class="ks-jatuh-ikon" aria-hidden="true">⇪</span>
      <strong>Pilih atau seret file master ke sini</strong>
      <span>Excel (.xlsx) atau CSV · maksimal 8 MB · semua lembar dibaca</span>
      <input type="file" name="berkas" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" required>
      <em data-jatuh-nama></em>
    </div>
    <fieldset class="p-bagian"><legend>Siswa yang sudah ada (NISN/NIS sama)</legend>
      <label class="p-centang"><input type="radio" name="mode" value="perbarui" checked><span><b>Perbarui datanya</b> — isian kosong di file tidak menghapus data lama; foto &amp; catatan tetap.</span></label>
      <label class="p-centang"><input type="radio" name="mode" value="lewati"><span><b>Lewati</b> — hanya menambah siswa baru.</span></label>
    </fieldset>
    <label class="p-centang"><input type="checkbox" name="lembaga" value="1" checked><span>Lengkapi NSM, NPSN, dan NIP kepala di profil lembaga dari lembar Master Lembaga (hanya bila masih kosong).</span></label>
    <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">Baca &amp; periksa file</button><span class="p-kecil">Belum ada yang disimpan sebelum Anda menyetujui pratinjaunya.</span></div>
  </form>
  <section class="p-kartu ks-pintar"><h2>Upload pintar — file tidak harus rapi</h2>
    <ul>
      <li><b>Judul kolom bebas &amp; urutan bebas</b>: „Nama Lengkap Siswa“, „NAMA PESERTA DIDIK“, „Nama“, „JK“, „L/P“, „TTL“, „No Induk“, „Kls“ … dikenali semua, di baris mana pun — juga judul dua tingkat (mis. <i>Data Ayah → Nama, NIK</i>; <i>Tanggal Lahir → Tgl, Bln, Thn</i>).</li>
      <li><b>Kolom tanpa judul dikenali dari isinya</b>: 10 angka = NISN, 16 angka = NIK/No. KK, L/P, tanggal, kelas, nama.</li>
      <li><b>Kolom gabungan dipecah</b>: „Bekasi, 30 April 2015“ → tempat + tanggal lahir; „3A“ / „VII-B“ → kelas + rombel. Alamat yang terpecah (RT, RW, desa, kecamatan …) disatukan dengan ejaan baku.</li>
      <li><b>Tanggal bentuk apa pun</b>: 30/04/2015, 30-4-15, 300415, 30042015, 30 Apr 2015, 30 april 2015, 30 Feb → bulan otomatis jadi angka.</li>
      <li><b>Tata letak berantakan tetap terbaca</b>: judul laporan di atas tabel, beberapa lembar, satu tabel per kelas, baris pemisah „KELAS 1-A“ atau „MI Al Huda“, baris kosong, baris jumlah &amp; tanda tangan.</li>
      <li><b>Masuk lembaganya masing-masing</b> lewat NSM, nama lembaga, jenjang, judul lembar, atau tingkat kelasnya — lalu diurutkan rapi per lembaga, kelas, rombel, dan nama.</li>
      <li><b>Langsung bisa masuk portal siswa</b>: NISN atau NIS + tanggal lahir (mis. 30/04/2015 atau 300415).</li>
    </ul>
    <p class="p-kecil">Butuh contoh susunan? <a href="/portal/siswa/templat.xlsx">Unduh templat kosong</a> (kolom sesuai file master yayasan, tanpa data contoh).</p>
  </section><script src="/assets/impor.js" defer></script>`;
}

export function halamanPratinjau(o: {
  kerjaId: string | null; rows: BarisSiswa[]; laporan: LaporanLembar[]; pesan: string[]; namaUnit: (s: string) => string; ada: (r: BarisSiswa) => boolean; mode: string; lembagaDiisi: string[];
}): Raw {
  const sah = o.rows.filter((r) => !r.galat.length);
  const salah = o.rows.filter((r) => r.galat.length);
  const baru = sah.filter((r) => !o.ada(r)).length;
  const per = new Map<string, { n: number; kelas: Map<string, number> }>();
  for (const r of sah) {
    const k = r.unit ?? '-';
    const x = per.get(k) ?? { n: 0, kelas: new Map() };
    x.n += 1; x.kelas.set(`${r.tingkat}${r.rombel ? ` · ${r.rombel}` : ''}`, (x.kelas.get(`${r.tingkat}${r.rombel ? ` · ${r.rombel}` : ''}`) ?? 0) + 1);
    per.set(k, x);
  }
  const peringatan = sah.filter((r) => r.peringatan.length);
  return html`
  <section class="p-kartu ks-pratinjau">
    <div class="ks-ubin-baris">
      ${ubin('Baris siswa terbaca', angka(o.rows.length))}
      ${ubin('Siap disimpan', angka(sah.length), `${angka(baru)} baru · ${angka(sah.length - baru)} sudah ada (${o.mode === 'lewati' ? 'dilewati' : 'diperbarui'})`)}
      ${ubin('Perlu diperbaiki', angka(salah.length), salah.length ? 'tidak ikut disimpan' : 'tidak ada')}
      ${ubin('Peringatan', angka(peringatan.length), 'tetap disimpan')}
    </div>
    ${o.pesan.map((p) => html`<p class="p-kilat p-kilat-galat">${p}</p>`)}
    ${o.lembagaDiisi.length ? html`<p class="p-kilat p-kilat-ok">Profil lembaga dilengkapi: ${o.lembagaDiisi.join('; ')}.</p>` : ''}
    <div class="p-form-kaki">${o.kerjaId && sah.length ? html`<a class="tbl tbl-emas" href="/portal/kerja/${o.kerjaId}" data-mulai>Simpan ${angka(sah.length)} siswa sekarang</a>` : ''}<a class="tbl tbl-garis" href="/portal/siswa/impor">Pilih file lain</a></div>
  </section>
  <section class="p-kartu"><h2>Cara file Anda dibaca</h2>
    ${o.laporan.map((l) => html`<details class="ks-lembar"${raw(l.jenis === 'siswa' ? ' open' : '')}><summary><b>Lembar „${l.nama}“</b> — ${l.jenis === 'siswa' ? html`${angka(l.siswa)} siswa${l.barisJudul ? html`, judul kolom di baris ${l.barisJudul}` : html`, tanpa baris judul (dikenali dari isi)`}${l.tabel && l.tabel > 1 ? html`, ${l.tabel} tabel` : ''}` : l.jenis === 'lembaga' ? 'Master Lembaga (NSM, NPSN, kepala, tahun pelajaran)' : html`dilewati: ${l.alasan ?? ''}`}</summary>
      ${l.kolom.length ? html`<ul class="ks-peta">${l.kolom.map((k) => html`<li><b>${LABEL_KOLOM[k.kunci]}</b><span>← ${k.dari}</span></li>`)}</ul>` : ''}</details>`)}
  </section>
  ${per.size ? html`<section class="p-kartu"><h2>Masuk ke lembaga &amp; kelas</h2><div class="ks-per">${[...per].map(([u, x]) => html`<div class="ks-per-unit"><h3>${o.namaUnit(u)} <small>${angka(x.n)} siswa</small></h3><ul>${[...x.kelas].sort((a, b) => a[0].localeCompare(b[0], 'id', { numeric: true })).map(([k, n]) => html`<li><span>${k}</span><b>${n}</b></li>`)}</ul></div>`)}</div></section>` : ''}
  ${salah.length ? html`<section class="p-kartu"><h2>Perlu diperbaiki (${angka(salah.length)})</h2><p class="p-kecil">Perbaiki di file lalu unggah lagi — baris yang sudah tersimpan akan diperbarui, bukan digandakan.</p><div class="p-tabel"><table><thead><tr><th>Lembar · baris</th><th>Nama</th><th>Masalah</th></tr></thead><tbody>${salah.slice(0, 300).map((r) => html`<tr><td>${r.sumber} · ${r.baris}</td><td>${r.nama}</td><td>${r.galat.join(' ')}</td></tr>`)}</tbody></table></div></section>` : ''}
  ${sah.length ? html`<section class="p-kartu"><h2>Contoh data yang akan disimpan</h2><div class="p-tabel"><table><thead><tr><th>Nama</th><th>Lembaga · kelas</th><th>NISN / NIS</th><th>Lahir</th><th>Orang tua</th><th>Catatan</th></tr></thead><tbody>${sah.slice(0, 60).map((r) => html`<tr><td><strong>${r.nama}</strong> <small>${r.jk}</small>${o.ada(r) ? html` <span class="ks-st st-pindah">sudah ada</span>` : html` <span class="ks-st st-aktif">baru</span>`}</td><td>${o.namaUnit(r.unit ?? '')} · ${r.tingkat}${r.rombel ? ` ${r.rombel}` : ''}</td><td>${r.nisn || '—'} / ${r.nis || '—'}</td><td>${r.tempatLahir ? `${r.tempatLahir}, ` : ''}${tanggal(r.tanggalLahir)}</td><td>${[r.ayah, r.ibu].filter(Boolean).join(' & ')}</td><td>${r.peringatan.join(' ')}${r.nik ? html`<small class="ks-ket">NIK ${samarkan(r.nik)}</small>` : ''}</td></tr>`)}</tbody></table></div>${sah.length > 60 ? html`<p class="p-kecil">… dan ${angka(sah.length - 60)} siswa lainnya.</p>` : ''}</section>` : ''}`;
}

/* ── pekerjaan bertahap ───────────────────────────────────────────────── */

export function halamanKerja(k: Kerja): Raw {
  const persen = k.total ? Math.round((k.pos / k.total) * 100) : 100;
  const h = k.hasil;
  return html`
  <section class="p-kartu ks-kerja" data-kerja="${k.id}" data-selesai="${k.selesai ? '1' : '0'}">
    <h2>${k.judul}</h2>
    <div class="ks-progres" role="progressbar" aria-valuemin="0" aria-valuemax="${k.total}" aria-valuenow="${k.pos}"><span style="width:${persen}%"></span></div>
    <p class="ks-progres-teks" data-kerja-teks>${k.selesai ? html`<b>Selesai.</b> ${angka(k.total)} baris diproses.` : html`Memproses <b>${angka(k.pos)}</b> dari <b>${angka(k.total)}</b> baris… jangan tutup halaman ini.`}</p>
    <div class="ks-ubin-baris">${ubin('Baru', angka(h.baru))}${ubin('Diperbarui', angka(h.ubah))}${ubin('Dilewati', angka(h.lewat))}${ubin('Gagal', angka(h.gagalN))}</div>
    ${k.selesai ? html`<div class="p-form-kaki"><a class="tbl tbl-emas" href="${k.kembali}">Lihat hasilnya</a></div>` : html`<form method="post" action="/portal/kerja/${k.id}/lanjut" class="ks-kerja-lanjut"><noscript><p>JavaScript mati — tekan tombol ini berulang sampai selesai.</p></noscript><button class="tbl tbl-garis" type="submit">Lanjutkan</button></form>`}
    ${h.gagal.length ? html`<h3>Baris yang gagal</h3><div class="p-tabel"><table><thead><tr><th>Baris</th><th>Nama</th><th>Alasan</th></tr></thead><tbody>${h.gagal.map((g) => html`<tr><td>${g.baris}</td><td>${g.nama}</td><td>${g.alasan}</td></tr>`)}</tbody></table></div>` : ''}
  </section>`;
}

/* ── tagihan ──────────────────────────────────────────────────────────── */

export interface BarisTagihanTampil { id: string; nama: string; unit: string; x: Record<string, unknown> }

export function halamanTagihan(o: {
  list: BarisTagihanTampil[]; jumlah: number; units: UnitItem[]; namaUnit: (s: string) => string; rekap: RekapTagihan; hari: string;
  s: { unit: string; status: string; untuk: string; q: string }; tingkatAda: string[]; tpKini: string;
}): Raw {
  const r = o.rekap;
  const s = o.s;
  const persen = r.jumlah ? Math.round((r.dibayar / r.jumlah) * 100) : 0;
  const unduh = qs({ unit: s.unit, status: s.status, untuk: s.untuk, q: s.q });
  return html`
  <section class="p-kartu">
    <div class="ks-ubin-baris">
      ${ubin('Total tagihan', rupiah(r.jumlah), `${angka(r.n)} tagihan`)}
      ${ubin('Sudah dibayar', rupiah(r.dibayar), `${persen}% terkumpul`)}
      ${ubin('Sisa / tunggakan', rupiah(r.sisa), `${angka(r.belum + r.sebagian + r.telat)} belum lunas`, `/portal/tagihan${qs({ ...s, status: 'belum-lunas' })}`)}
      ${ubin('Lewat jatuh tempo', angka(r.telat), 'tagihan', `/portal/tagihan${qs({ ...s, status: 'telat' })}`)}
    </div>
    ${batangSegmen({ judul: 'Status tagihan', bagian: [
      { label: 'Lunas', nilai: r.lunas, kelas: 'st-baik', ikon: '✓', href: `/portal/tagihan${qs({ ...s, status: 'lunas' })}` },
      { label: 'Dibayar sebagian', nilai: r.sebagian, kelas: 'st-waspada', ikon: '◐', href: `/portal/tagihan${qs({ ...s, status: 'sebagian' })}` },
      { label: 'Belum dibayar', nilai: r.belum, kelas: 'st-serius', ikon: '○', href: `/portal/tagihan${qs({ ...s, status: 'belum' })}` },
      { label: 'Lewat jatuh tempo', nilai: r.telat, kelas: 'st-kritis', ikon: '!', href: `/portal/tagihan${qs({ ...s, status: 'telat' })}` },
    ], satuan: ' tagihan' })}
    <div class="ks-alat"><a class="tbl tbl-emas tbl-kecil" href="#massal">＋ Tagihan massal per kelas</a><a class="tbl tbl-garis tbl-kecil" href="/portal/k/tagihan/baru">＋ Satu tagihan</a><a class="tbl tbl-garis tbl-kecil" href="/portal/tagihan/unduh.xlsx${unduh}">⬇ Excel</a><a class="tbl-teks" href="/portal/k/kwitansi">Semua kwitansi →</a></div>
  </section>
  <form method="get" class="p-saring" data-saring-otomatis>
    <select name="unit" aria-label="Lembaga"><option value="">Semua lembaga</option>${o.units.map((u) => html`<option value="${u.slug}"${pilih(s.unit, u.slug)}>${u.singkat}</option>`)}</select>
    <select name="status" aria-label="Status"><option value="">Semua status</option><option value="belum-lunas"${pilih(s.status, 'belum-lunas')}>Belum lunas</option><option value="lunas"${pilih(s.status, 'lunas')}>Lunas</option><option value="sebagian"${pilih(s.status, 'sebagian')}>Dibayar sebagian</option><option value="belum"${pilih(s.status, 'belum')}>Belum dibayar</option><option value="telat"${pilih(s.status, 'telat')}>Lewat jatuh tempo</option></select>
    <select name="untuk" aria-label="Jenis"><option value="">Semua jenis</option>${UNTUK_KWITANSI.map(([k, l]) => html`<option value="${k}"${pilih(s.untuk, k)}>${l}</option>`)}</select>
    <input type="search" name="q" value="${s.q}" placeholder="Cari nama, NISN, periode, kelas…" aria-label="Cari tagihan">
    <button class="tbl tbl-garis tbl-kecil" type="submit">Saring</button>
  </form>
  ${o.list.length ? html`<div class="p-tabel ks-tabel"><table><thead><tr><th>Siswa</th><th>Tagihan</th><th>Jumlah</th><th>Dibayar</th><th>Sisa</th><th>Status</th><th></th></tr></thead><tbody>${o.list.map((t) => {
    const st = statusTagihan(t.x, o.hari);
    return html`<tr><td><strong>${t.nama}</strong><small class="ks-ket">${o.namaUnit(t.unit)}${t.x.kelas ? ` · ${String(t.x.kelas)}` : ''}</small></td><td>${labelUntuk(t.x.untuk)}<small class="ks-ket">${String(t.x.periode ?? '')}${t.x.jatuhTempo ? ` · jatuh tempo ${tanggal(String(t.x.jatuhTempo))}` : ''}</small></td><td>${rupiah(Number(t.x.jumlah) || 0)}</td><td>${rupiah(Number(t.x.dibayar) || 0)}</td><td>${st.sisa ? rupiah(st.sisa) : '–'}</td><td>${lencanaTagihan(st.kode, st.label)}</td>
      <td class="ks-aksi-sel">${st.kode !== 'lunas' ? html`<a class="tbl tbl-emas tbl-kecil" href="/portal/k/kwitansi/baru?tagihan=${t.id}">Bayar</a>` : ''}<a class="tbl-teks" href="/portal/k/tagihan/${t.id}">Ubah</a></td></tr>`;
  })}</tbody></table></div>${o.jumlah > o.list.length ? html`<p class="p-kecil">Menampilkan ${angka(o.list.length)} dari ${angka(o.jumlah)} — persempit dengan saringan, atau unduh Excel untuk semuanya.</p>` : ''}` : html`<div class="p-kosong"><p>Belum ada tagihan${s.status || s.untuk || s.q ? ' yang cocok' : ''}.</p></div>`}
  <form method="post" action="/portal/tagihan/massal" class="p-kartu p-form" id="massal">
    <h2>Tagihan massal per kelas</h2>
    <p class="p-kecil">Satu tagihan untuk setiap siswa <b>aktif</b> di lembaga/kelas/rombel yang dipilih. Aman diulang: siswa yang sudah punya tagihan dengan jenis &amp; periode yang sama dilewati.</p>
    <div class="p-baris">
      <label class="p-bidang"><span>Lembaga <i aria-hidden="true">*</i></span><select name="unit" required>${o.units.map((u) => html`<option value="${u.slug}"${pilih(s.unit, u.slug)}>${u.singkat}</option>`)}</select></label>
      <label class="p-bidang"><span>Kelas (${o.tpKini})</span><select name="tingkat"><option value="">Semua kelas</option>${o.tingkatAda.map((t) => html`<option>${t}</option>`)}</select></label>
      <label class="p-bidang"><span>Rombel</span><input name="rombel" maxlength="20" placeholder="Kosongkan = semua rombel"></label>
    </div>
    <div class="p-baris">
      <label class="p-bidang"><span>Jenis tagihan <i aria-hidden="true">*</i></span><select name="untuk" required>${UNTUK_KWITANSI.map(([k, l]) => html`<option value="${k}">${l}</option>`)}</select></label>
      <label class="p-bidang"><span>Periode <i aria-hidden="true">*</i></span><input name="periode" required maxlength="80" placeholder="mis. Desember 2026"></label>
    </div>
    <div class="p-baris">
      <label class="p-bidang"><span>Jumlah per siswa (rupiah) <i aria-hidden="true">*</i></span><input name="jumlah" type="number" min="1" step="1" required inputmode="numeric"></label>
      <label class="p-bidang"><span>Jatuh tempo</span><input name="jatuhTempo" type="date"></label>
      <label class="p-bidang"><span>Catatan</span><input name="catatan" maxlength="300"></label>
    </div>
    <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">Buat tagihan</button></div>
  </form>`;
}

/* ── laporan ──────────────────────────────────────────────────────────── */

export interface DataLaporan {
  unit: string; units: UnitItem[]; namaUnit: (s: string) => string; tp: string;
  aktif: number; L: number; P: number; rombel: number; lulusTpIni: number; status: Record<string, number>;
  perUnit: Butir[]; perKelas: Butir[]; perRombel: { unit: string; kelas: string; rombel: string; L: number; P: number }[];
  tagihan: RekapTagihan; bayarBulan: Butir[]; bayarBulanIni: number; tunggakanPer: Butir[];
  penghargaanJenis: Butir[]; penghargaanTpIni: number;
}

const SERI_LP = [{ nama: 'Laki-laki', kelas: 's1' }, { nama: 'Perempuan', kelas: 's2' }];

export function halamanLaporan(o: DataLaporan): Raw {
  const t = o.tagihan;
  const fRp = (n: number) => rupiah(n).replace('Rp ', 'Rp');
  return html`
  <form method="get" class="p-saring ks-saring-laporan" data-saring-otomatis>
    <select name="unit" aria-label="Lembaga"><option value="">Seluruh yayasan</option>${o.units.map((u) => html`<option value="${u.slug}"${pilih(o.unit, u.slug)}>${u.singkat}</option>`)}</select>
    <span class="ks-tp">Tahun pelajaran <b>${o.tp}</b></span>
    <span class="ks-alat-kanan"><a class="tbl tbl-garis tbl-kecil" href="/portal/laporan/unduh.xlsx${qs({ unit: o.unit })}">⬇ Unduh laporan (Excel)</a><button class="tbl tbl-garis tbl-kecil" type="button" data-cetak-halaman>🖨 Cetak</button></span>
  </form>
  <section class="ks-ubin-baris ks-ubin-besar">
    ${ubin('Siswa aktif', angka(o.aktif), `${angka(o.L)} L · ${angka(o.P)} P · ${angka(o.rombel)} rombel`, `/portal/siswa${qs({ unit: o.unit })}`)}
    ${ubin('Lulus tahun ini', angka(o.lulusTpIni), `akhir tahun pelajaran ${o.tp}`)}
    ${ubin('Terkumpul bulan ini', rupiah(o.bayarBulanIni), 'dari kwitansi')}
    ${ubin('Tunggakan', rupiah(t.sisa), `${t.jumlah ? Math.round((t.dibayar / t.jumlah) * 100) : 0}% tagihan sudah terbayar`, `/portal/tagihan${qs({ unit: o.unit, status: 'belum-lunas' })}`)}
    ${ubin('Penghargaan tahun ini', angka(o.penghargaanTpIni), 'sertifikat & piagam', '/prestasi')}
  </section>
  <div class="ks-grafik-kisi">
    ${o.unit ? '' : batangMendatar({ judul: 'Siswa aktif per lembaga', sub: 'Klik batang untuk membuka daftar siswanya.', seri: SERI_LP, data: o.perUnit, kepala: 'Lembaga' })}
    ${kolomTegak({ judul: o.unit ? `Siswa aktif per kelas — ${o.namaUnit(o.unit)}` : 'Siswa aktif per kelas', sub: 'Kelas berjalan, naik otomatis setiap Juli.', seri: SERI_LP, data: o.perKelas, kepala: 'Kelas', labelSemua: o.perKelas.length <= 9 })}
    ${batangSegmen({ judul: 'Status siswa', sub: 'Lulus dihitung otomatis; pindah/keluar dari data siswa.', bagian: [
      { label: 'Aktif', nilai: o.status.aktif ?? 0, kelas: 's1', href: `/portal/siswa${qs({ unit: o.unit, status: 'aktif' })}` },
      { label: 'Lulus', nilai: o.status.lulus ?? 0, kelas: 's2', href: `/portal/siswa${qs({ unit: o.unit, status: 'lulus' })}` },
      { label: 'Pindah', nilai: o.status.pindah ?? 0, kelas: 's3', href: `/portal/siswa${qs({ unit: o.unit, status: 'pindah' })}` },
      { label: 'Keluar', nilai: o.status.keluar ?? 0, kelas: 's4', href: `/portal/siswa${qs({ unit: o.unit, status: 'keluar' })}` },
    ], satuan: ' siswa' })}
    ${kolomTegak({ judul: 'Pembayaran 12 bulan terakhir', sub: 'Jumlah kwitansi per bulan.', seri: [{ nama: 'Pembayaran', kelas: 's1' }], data: o.bayarBulan, format: fRp, kepala: 'Bulan' })}
    ${batangSegmen({ judul: 'Status tagihan', bagian: [
      { label: 'Lunas', nilai: t.lunas, kelas: 'st-baik', ikon: '✓' }, { label: 'Dibayar sebagian', nilai: t.sebagian, kelas: 'st-waspada', ikon: '◐' },
      { label: 'Belum dibayar', nilai: t.belum, kelas: 'st-serius', ikon: '○' }, { label: 'Lewat jatuh tempo', nilai: t.telat, kelas: 'st-kritis', ikon: '!' },
    ], satuan: ' tagihan' })}
    ${batangMendatar({ judul: o.unit ? 'Tunggakan per kelas' : 'Tunggakan per lembaga', sub: 'Sisa tagihan yang belum dibayar.', seri: [{ nama: 'Tunggakan', kelas: 's1' }], data: o.tunggakanPer, format: fRp, kosong: 'Tidak ada tunggakan. Alhamdulillah.', kepala: o.unit ? 'Kelas' : 'Lembaga' })}
    ${batangMendatar({ judul: 'Penghargaan per jenis', sub: 'Semua sertifikat & piagam yang tercatat.', seri: [{ nama: 'Penghargaan', kelas: 's1' }], data: o.penghargaanJenis, kepala: 'Jenis' })}
  </div>
  ${o.perRombel.length ? html`<section class="p-kartu"><h2>Rekap rombel</h2><div class="p-tabel"><table><thead><tr><th>Lembaga</th><th>Kelas</th><th>Rombel</th><th>L</th><th>P</th><th>Jumlah</th><th></th></tr></thead><tbody>${o.perRombel.map((r) => html`<tr><td>${o.namaUnit(r.unit)}</td><td>${r.kelas}</td><td>${r.rombel || '–'}</td><td>${r.L}</td><td>${r.P}</td><td><strong>${r.L + r.P}</strong></td><td><a class="tbl-teks" href="/portal/siswa${qs({ unit: r.unit, tingkat: r.kelas, rombel: r.rombel })}">Daftar</a> · <a class="tbl-teks" href="/portal/siswa/cetak${qs({ unit: r.unit, tingkat: r.kelas, rombel: r.rombel })}" target="_blank" rel="noopener">Cetak</a></td></tr>`)}</tbody></table></div></section>` : ''}`;
}

export const urutJenjang = (j: Jenjang) => JENJANG[j].min;
