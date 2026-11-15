/** Tampilan portal: masuk (daftar akun + papan PIN acak), kerangka, formulir dari definisi bidang, tabel. Tanpa iklan. */
import { html, raw, esc, type Raw } from '../lib/html.ts';
import { ASSET_V, icon } from './layout.ts';
import { PERAN, tingkat, type Peran, type User, type UserItem } from '../data/users.ts';
import { STATUS, type Bidang, type Dok, type FotoGaleri, type IxItem, type Koleksi, type Status } from '../data/koleksi.ts';
import { KOLEKSI } from '../data/defs.ts';
import type { UnitItem } from '../data/site.ts';
import { tanggal } from '../lib/text.ts';

export interface Kilat { ok?: string; galat?: string }

function kepalaDok(judul: string, ekstra = ''): string {
  return `<!doctype html>
<html lang="id" data-tema="siang">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#053727">
<title>${esc(judul)} — Portal Yapida</title>
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="stylesheet" href="/assets/app.css?v=${ASSET_V}">
<link rel="stylesheet" href="/assets/portal.css?v=${ASSET_V}">
<script src="/assets/tema.js?v=${ASSET_V}"></script>
${ekstra}
</head>`;
}

/* ── masuk ─────────────────────────────────────────────────────────────── */

export function masukPage(o: { akun: UserItem[]; units: UnitItem[]; papan: Raw; pilih?: string; galat?: string; pesan?: string }): string {
  const namaUnit = (s: string) => o.units.find((u) => u.slug === s)?.singkat ?? s;
  const yayasan = o.akun.filter((a) => PERAN[a.peran].lingkup === 'semua');
  const perUnit = new Map<string, UserItem[]>();
  for (const a of o.akun.filter((x) => PERAN[x.peran].lingkup === 'lembaga')) {
    const k = a.units[0] ?? '';
    perUnit.set(k, [...(perUnit.get(k) ?? []), a]);
  }
  const urutUnit = o.units.map((u) => u.slug).filter((s) => perUnit.has(s));
  const opsi = (a: UserItem) => html`<option value="${a.id}"${raw(a.id === o.pilih ? ' selected' : '')}>${a.nama}</option>`;
  return `${kepalaDok('Masuk')}
<body class="p-masuk">
<div class="pola-bintang" aria-hidden="true"></div>
<main class="p-masuk-kartu">
  <a href="/" class="p-masuk-logo" aria-label="Kembali ke beranda"><img src="/assets/logo-512.webp" width="80" height="102" alt=""></a>
  <h1>Portal pengelola</h1>
  ${o.pesan ? `<p class="p-kilat p-kilat-ok" role="status">${esc(o.pesan)}</p>` : ''}${o.galat ? `<p class="p-kilat p-kilat-galat" role="alert">${esc(o.galat)}</p>` : ''}
  <form method="post" action="/masuk" class="p-masuk-form" data-pin-form>
    <label class="p-bidang"><span>Akun</span>
      <select name="u" required data-pin-akun>
        <option value="">— pilih akun —</option>
        ${yayasan.length ? html`<optgroup label="Yayasan">${yayasan.map(opsi)}</optgroup>` : ''}
        ${urutUnit.map((s) => html`<optgroup label="${namaUnit(s)}">${(perUnit.get(s) ?? []).map(opsi)}</optgroup>`)}
      </select>
    </label>
    ${o.papan}
  </form>
  <p class="p-kecil">PIN 5 angka. Letak angka diacak setiap kali papan muncul. Lima kali salah, akun dikunci sementara.</p>
</main>
<script src="/assets/portal.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

export function pasangPage(o: { papan: Raw; galat?: string; nama?: string }): string {
  return `${kepalaDok('Pemasangan pertama')}
<body class="p-masuk">
<div class="pola-bintang" aria-hidden="true"></div>
<main class="p-masuk-kartu">
  <a href="/" class="p-masuk-logo" aria-label="Kembali ke beranda"><img src="/assets/logo-512.webp" width="80" height="102" alt=""></a>
  <h1>Pemasangan pertama</h1>
  <p class="lead">Buat akun Super Admin. Halaman ini hanya muncul sekali, sebelum akun pertama ada.</p>
  ${o.galat ? `<p class="p-kilat p-kilat-galat" role="alert">${esc(o.galat)}</p>` : ''}
  <form method="post" action="/masuk/pasang" class="p-masuk-form" data-pin-form>
    <label class="p-bidang"><span>Kode pemasangan</span><input type="text" name="kode" autocomplete="off" autocapitalize="characters" spellcheck="false" required placeholder="XXXXX-XXXXX-XXXXX-XXXXX"></label>
    <label class="p-bidang"><span>Nama akun</span><input type="text" name="nama" value="${esc(o.nama ?? 'Super Admin')}" maxlength="60" required></label>
    ${o.papan}
  </form>
</main>
<script src="/assets/portal.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── kerangka portal ───────────────────────────────────────────────────── */

const NAV_ISI = ['sdm', 'kabar', 'galeri', 'video', 'agenda', 'dokumen', 'karya', 'ppdb', 'pendaftar', 'pesan'];

export function portalPage(o: { user: User; judul: string; aktif: string; body: Raw; kilat?: Kilat; aksi?: Raw; hitung?: Record<string, number> }): string {
  const t = tingkat(o.user);
  const tautan = (href: string, label: string, ik: string, badge?: number) => `<a href="${href}"${o.aktif === href ? ' aria-current="page"' : ''}>${icon(ik).s}<span>${esc(label)}</span>${badge ? `<b class="p-lencana">${badge}</b>` : ''}</a>`;
  const isi = NAV_ISI.map((k) => KOLEKSI[k]!).filter((k) => t >= (k.tingkat ?? 0));
  return `${kepalaDok(o.judul)}
<body class="portal">
<aside class="p-sisi" data-sisi>
  <a class="merek" href="/portal"><img src="/assets/logo-192.webp" width="38" height="48" alt=""><span class="merek-teks"><b>YAPIDA</b><small>Portal pengelola</small></span></a>
  <div class="p-aku"><strong>${esc(o.user.nama)}</strong><span>${esc(PERAN[o.user.peran].nama)}</span></div>
  <nav aria-label="Menu portal">
    <p>Utama</p>
    ${tautan('/portal', 'Dasbor', 'bintang')}
    ${t >= PERAN.lembaga.tingkat ? tautan('/portal/lembaga', 'Profil lembaga', 'kubah') : ''}
    <p>Isi</p>
    ${isi.map((k) => tautan(`/portal/k/${k.id}`, k.nama, k.privat ? 'surat' : 'pena', o.hitung?.[k.id])).join('')}
    ${t >= PERAN.yayasan.tingkat ? `<p>Yayasan</p>${tautan('/portal/situs', 'Pengaturan situs', 'buku')}${tautan('/portal/halaman', 'Halaman', 'buku')}` : ''}
    ${t >= PERAN.kepala.tingkat ? `<p>Akses</p>${tautan('/portal/pengguna', 'Akun & PIN', 'tangan')}` : ''}
    ${t >= PERAN.ketua.tingkat ? tautan('/portal/log', 'Log aktivitas', 'tasbih') : ''}
    <p>Akun</p>
    ${tautan('/portal/akun', 'Ganti PIN', 'masuk')}
    <a href="/" target="_blank" rel="noopener">${icon('panah').s}<span>Lihat situs</span></a>
    <form method="post" action="/keluar"><button type="submit">${icon('tutup').s}<span>Keluar</span></button></form>
  </nav>
</aside>
<main class="p-isi">
  <header class="p-kepala"><button class="tbl-ikon p-buka" type="button" data-sisi-buka aria-label="Buka menu">${icon('menu').s}</button><h1>${esc(o.judul)}</h1><div class="p-aksi">${o.aksi?.s ?? ''}</div></header>
  ${o.kilat?.ok ? `<p class="p-kilat p-kilat-ok" role="status">${esc(o.kilat.ok)}</p>` : ''}${o.kilat?.galat ? `<p class="p-kilat p-kilat-galat" role="alert">${esc(o.kilat.galat)}</p>` : ''}
  ${o.body.s}
</main>
<script src="/assets/portal.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── bidang formulir ───────────────────────────────────────────────────── */

const alatMd = raw('<div class="p-md-alat"><button type="button" data-md-sisip="**|**" title="Tebal"><b>B</b></button><button type="button" data-md-sisip="*|*" title="Miring"><i>I</i></button><button type="button" data-md-awal="## " title="Subjudul">Subjudul</button><button type="button" data-md-awal="- " title="Daftar">• Daftar</button><button type="button" data-md-awal="1. " title="Daftar bernomor">1. Daftar</button><button type="button" data-md-awal="> " title="Kutipan">Kutipan</button><button type="button" data-md-awal="::ar " title="Paragraf berbahasa Arab">ع Arab</button><button type="button" data-md-awal="::en " title="Paragraf berbahasa Inggris">EN</button><button type="button" data-md-sisip="[|](https://)" title="Tautan">Tautan</button><button type="button" data-md-gambar title="Sisipkan foto">Foto</button></div>');

function kontrolUnggah(nama: string, nilai: string, jenis: 'gambar' | 'pdf', mediaUrl: (f: string) => string): Raw {
  const pratinjau = nilai ? (jenis === 'gambar' ? html`<img src="${mediaUrl(nilai)}" alt="">` : html`<a href="${mediaUrl(nilai)}" target="_blank" rel="noopener">Lihat PDF tersimpan</a>`) : '';
  return html`<div class="p-unggah" data-unggah="${jenis}"><input type="hidden" name="${nama}" value="${nilai}"><div class="${jenis === 'gambar' ? 'p-pratinjau' : 'p-berkas'}" data-pratinjau>${pratinjau}</div><div class="p-unggah-aksi"><label class="tbl tbl-garis tbl-kecil">${jenis === 'gambar' ? 'Pilih foto' : 'Pilih PDF'}<input type="file" accept="${jenis === 'gambar' ? 'image/*' : 'application/pdf'}" hidden></label><button class="tbl-teks" type="button" data-unggah-hapus${raw(nilai ? '' : ' hidden')}>Hapus</button><span class="p-kecil" data-unggah-status></span></div></div>`;
}

function bidangHtml(b: Bidang, v: unknown, galat: string | undefined, mediaUrl: (f: string) => string, kelasUnit: string[]): Raw {
  const nama = `d_${b.k}`;
  const s = typeof v === 'string' || typeof v === 'number' ? String(v) : '';
  let kontrol: Raw;
  switch (b.jenis) {
    case 'paragraf': kontrol = html`<textarea name="${nama}" rows="3"${raw(b.maks ? ` maxlength="${b.maks}"` : '')}>${s}</textarea>`; break;
    case 'markdown': kontrol = html`<div class="p-md" data-md>${alatMd}<textarea name="${nama}" rows="14">${s}</textarea></div>`; break;
    case 'tanggal': kontrol = html`<input type="date" name="${nama}" value="${s}">`; break;
    case 'waktu': kontrol = html`<input type="datetime-local" name="${nama}" value="${s}">`; break;
    case 'angka': kontrol = html`<input type="number" name="${nama}" value="${s}" step="any" inputmode="decimal">`; break;
    case 'url': kontrol = html`<input type="url" name="${nama}" value="${s}" placeholder="https://">`; break;
    case 'pilih': kontrol = html`<select name="${nama}"><option value="">— pilih —</option>${(b.pilihan ?? []).map(([k, l]) => html`<option value="${k}"${raw(k === s ? ' selected' : '')}>${l}</option>`)}</select>`; break;
    case 'centang': kontrol = html`<label class="p-centang"><input type="checkbox" name="${nama}" value="1"${raw(v === true ? ' checked' : '')}><span>Ya</span></label>`; break;
    case 'daftar': kontrol = html`<textarea name="${nama}" rows="5" placeholder="Satu butir per baris">${Array.isArray(v) ? (v as string[]).join('\n') : ''}</textarea>`; break;
    case 'kelas': kontrol = kelasUnit.length ? html`<div class="p-pilihan">${kelasUnit.map((k) => html`<label class="p-centang"><input type="checkbox" name="${nama}" value="${k}"${raw(Array.isArray(v) && (v as string[]).includes(k) ? ' checked' : '')}><span>${k}</span></label>`)}</div>` : html`<p class="p-kecil">Lembaga ini belum punya daftar kelas — isi dulu di Profil lembaga.</p>`; break;
    case 'gambar': kontrol = kontrolUnggah(nama, s, 'gambar', mediaUrl); break;
    case 'berkas': kontrol = kontrolUnggah(nama, s, 'pdf', mediaUrl); break;
    case 'galeri': {
      const foto = Array.isArray(v) ? (v as FotoGaleri[]) : [];
      kontrol = html`<div class="p-galeri" data-galeri><input type="hidden" name="${nama}" value="${JSON.stringify(foto)}"><div class="p-galeri-kisi" data-galeri-kisi></div><div class="p-unggah-aksi"><label class="tbl tbl-garis tbl-kecil">Tambah foto<input type="file" accept="image/*" multiple hidden></label><span class="p-kecil" data-unggah-status></span></div></div>`;
      break;
    }
    default: kontrol = html`<input type="text" name="${nama}" value="${s}"${raw(b.maks ? ` maxlength="${b.maks}"` : '')}>`;
  }
  return html`<div class="p-bidang${galat ? ' p-bidang-galat' : ''}"><span>${b.label}${b.wajib ? raw(' <i aria-hidden="true">*</i>') : ''}</span>${kontrol}${b.bantuan ? html`<small>${b.bantuan}</small>` : ''}${galat ? html`<small class="p-galat">${galat}</small>` : ''}</div>`;
}

export interface FormDok {
  def: Koleksi;
  dok: Partial<Dok> & { d: Record<string, unknown> };
  galat: Record<string, string>;
  units: UnitItem[];
  bolehYayasan: boolean;
  statusBoleh: Status[];
  mediaUrl: (f: string) => string;
  kelasUnit: string[];
  tautPublik?: string;
}

export function formDok(o: FormDok): Raw {
  const d = o.dok;
  const baru = !d.id;
  return html`<form method="post" class="p-form p-kartu" data-form-jaga>
  <div class="p-bidang${o.galat.judul ? ' p-bidang-galat' : ''}"><span>${o.def.labelJudul} <i aria-hidden="true">*</i></span><input type="text" name="judul" value="${d.judul ?? ''}" maxlength="160" required>${o.galat.judul ? html`<small class="p-galat">${o.galat.judul}</small>` : ''}</div>
  <div class="p-baris">
    ${o.def.hanyaYayasan ? '' : html`<label class="p-bidang${o.galat.unit ? ' p-bidang-galat' : ''}"><span>Lembaga <i aria-hidden="true">*</i></span><select name="unit" required>${o.bolehYayasan ? html`<option value="yayasan"${raw(d.unit === 'yayasan' ? ' selected' : '')}>Yayasan Al-Huda Yapida</option>` : ''}${o.units.map((u) => html`<option value="${u.slug}"${raw(d.unit === u.slug ? ' selected' : '')}>${u.singkat}</option>`)}</select>${o.galat.unit ? html`<small class="p-galat">${o.galat.unit}</small>` : ''}</label>`}
    ${o.def.tanpaTanggal ? '' : html`<label class="p-bidang"><span>Tanggal</span><input type="date" name="tanggal" value="${d.tanggal ?? ''}"></label>`}
    ${o.def.privat ? '' : html`<label class="p-bidang"><span>Status</span><select name="status">${o.statusBoleh.map((s) => html`<option value="${s}"${raw((d.status ?? o.statusBoleh[0]) === s ? ' selected' : '')}>${STATUS[s]}</option>`)}</select></label>`}
  </div>
  ${o.def.bidang.map((b) => bidangHtml(b, d.d[b.k], o.galat[b.k], o.mediaUrl, o.kelasUnit))}
  <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">${baru ? 'Simpan' : 'Simpan perubahan'}</button><a class="tbl tbl-garis" href="/portal/k/${o.def.id}">Kembali</a>${o.tautPublik ? html`<a class="tbl-teks" href="${o.tautPublik}" target="_blank" rel="noopener">Lihat di situs ↗</a>` : ''}</div>
</form>
${baru ? '' : html`<form method="post" action="/portal/k/${o.def.id}/${d.id}/hapus" class="p-hapus" data-yakin="Hapus ${o.def.satu} ini selamanya? Tindakan ini tidak bisa dibatalkan."><button class="tbl-teks p-bahaya" type="submit">Hapus ${o.def.satu} ini</button></form>`}`;
}

export const lencana = (s: Status): Raw => html`<span class="p-status p-status-${s}">${STATUS[s]}</span>`;

export function daftarDok(o: { def: Koleksi; items: IxItem[]; units: UnitItem[]; unit: string; status: string; mediaUrl: (f: string) => string; bolehYayasan: boolean; boleh: (it: IxItem) => boolean }): Raw {
  const nama = (slug: string) => (slug === 'yayasan' ? 'Yayasan' : o.units.find((u) => u.slug === slug)?.singkat ?? slug);
  const ket = (it: IxItem) => {
    const x = it.x ?? {};
    if (o.def.id === 'sdm') return [x.jabatan, x.bidang].filter(Boolean).join(' · ');
    if (o.def.id === 'pendaftar') return `${x.ppdb ?? ''}${x.wali ? ` · wali ${x.wali}` : ''}`;
    if (o.def.id === 'pesan') return String(x.kontak ?? '');
    return it.r ?? '';
  };
  const tahap = (it: IxItem) => (o.def.id === 'pendaftar' ? html`<span class="p-status p-tahap-${String(it.x?.tahap ?? 'baru')}">${String(it.x?.tahap ?? 'baru')}</span>` : o.def.privat ? '' : lencana(it.s));
  return html`<form method="get" class="p-saring">
    <select name="unit" aria-label="Lembaga"><option value="">Semua lembaga</option>${o.bolehYayasan ? html`<option value="yayasan"${raw(o.unit === 'yayasan' ? ' selected' : '')}>Yayasan</option>` : ''}${o.units.map((u) => html`<option value="${u.slug}"${raw(o.unit === u.slug ? ' selected' : '')}>${u.singkat}</option>`)}</select>
    ${o.def.privat ? '' : html`<select name="status" aria-label="Status"><option value="">Semua status</option>${(Object.keys(STATUS) as Status[]).map((s) => html`<option value="${s}"${raw(o.status === s ? ' selected' : '')}>${STATUS[s]}</option>`)}</select>`}
    <button class="tbl tbl-garis tbl-kecil" type="submit">Saring</button>
    ${o.def.id === 'pendaftar' ? html`<a class="tbl tbl-garis tbl-kecil" href="/portal/k/pendaftar/csv${o.unit ? `?unit=${o.unit}` : ''}">Unduh CSV</a>` : ''}
  </form>
  ${o.items.length ? html`<div class="p-tabel"><table>
    <thead><tr><th>${o.def.labelJudul.replace(/\s*\(.*\)$/, '')}</th><th>Lembaga</th>${o.def.tanpaTanggal ? '' : raw('<th>Tanggal</th>')}<th>${o.def.id === 'pendaftar' ? 'Tahap' : o.def.privat ? '' : 'Status'}</th></tr></thead>
    <tbody>${o.items.map((it) => html`<tr>
      <td>${o.boleh(it) ? html`<a class="p-butir" href="/portal/k/${o.def.id}/${it.id}">` : raw('<span class="p-butir">')}${it.g ? html`<img src="${o.mediaUrl(it.g)}" alt="" loading="lazy">` : html`<span class="p-inisial" aria-hidden="true">${it.j.replace(/^(H\.|Hj\.|Dr\.|Drs\.|Ust\.|Ustadz|Ustadzah|K\.H\.|KH\.)\s+/i, '').charAt(0).toUpperCase()}</span>`}<span><strong>${it.j}</strong>${ket(it) ? html`<small>${ket(it)}</small>` : ''}</span>${raw(o.boleh(it) ? '</a>' : '</span>')}</td>
      <td>${nama(it.u)}</td>${o.def.tanpaTanggal ? '' : html`<td>${tanggal(it.t)}</td>`}<td>${tahap(it)}</td>
    </tr>`)}</tbody>
  </table></div>` : html`<div class="p-kosong"><p>Belum ada ${o.def.satu} di sini.</p>${o.def.privat ? '' : html`<a class="tbl tbl-emas" href="/portal/k/${o.def.id}/baru${o.unit ? `?unit=${o.unit}` : ''}">Tambah ${o.def.satu} pertama</a>`}</div>`}`;
}

/* ── formulir sederhana (profil lembaga, pengaturan situs, akun) ─────────── */

export function isian(label: string, nama: string, nilai: string | number | undefined, o: { jenis?: string; baris?: number; bantuan?: string; wajib?: boolean; md?: boolean; maks?: number } = {}): Raw {
  const v = nilai === undefined ? '' : String(nilai);
  const kontrol = o.baris
    ? (o.md ? html`<div class="p-md" data-md>${alatMd}<textarea name="${nama}" rows="${o.baris}">${v}</textarea></div>` : html`<textarea name="${nama}" rows="${o.baris}"${raw(o.maks ? ` maxlength="${o.maks}"` : '')}>${v}</textarea>`)
    : html`<input type="${o.jenis ?? 'text'}" name="${nama}" value="${v}"${raw(o.wajib ? ' required' : '')}${raw(o.maks ? ` maxlength="${o.maks}"` : '')}${raw(o.jenis === 'number' ? ' step="any"' : '')}>`;
  return html`<div class="p-bidang"><span>${label}${o.wajib ? raw(' <i aria-hidden="true">*</i>') : ''}</span>${kontrol}${o.bantuan ? html`<small>${o.bantuan}</small>` : ''}</div>`;
}

export function unggahTunggal(label: string, nama: string, nilai: string, mediaUrl: (f: string) => string, bantuan?: string): Raw {
  return html`<div class="p-bidang"><span>${label}</span>${kontrolUnggah(nama, nilai, 'gambar', mediaUrl)}${bantuan ? html`<small>${bantuan}</small>` : ''}</div>`;
}

export const pilihan = (label: string, nama: string, nilai: string, opsi: [string, string][], bantuan?: string): Raw =>
  html`<label class="p-bidang"><span>${label}</span><select name="${nama}">${opsi.map(([k, l]) => html`<option value="${k}"${raw(k === nilai ? ' selected' : '')}>${l}</option>`)}</select>${bantuan ? html`<small>${bantuan}</small>` : ''}</label>`;

export const centang = (label: string, nama: string, nyala: boolean, bantuan?: string): Raw =>
  html`<div class="p-bidang"><label class="p-centang"><input type="checkbox" name="${nama}" value="1"${raw(nyala ? ' checked' : '')}><span>${label}</span></label>${bantuan ? html`<small>${bantuan}</small>` : ''}</div>`;

export const bagian = (judul: string, isi: Raw, ket?: string): Raw => html`<fieldset class="p-bagian"><legend>${judul}</legend>${ket ? html`<p class="p-kecil">${ket}</p>` : ''}${isi}</fieldset>`;

export function tabelAkun(o: { akun: UserItem[]; units: UnitItem[]; aktor: User; boleh: (a: UserItem) => boolean }): Raw {
  const nama = (s: string) => o.units.find((u) => u.slug === s)?.singkat ?? s;
  return html`<div class="p-tabel"><table><thead><tr><th>Akun</th><th>Peran</th><th>Lembaga</th><th>Status</th></tr></thead><tbody>
  ${o.akun.map((a) => html`<tr><td>${o.boleh(a) ? html`<a class="p-butir" href="/portal/pengguna/${a.id}"><span class="p-inisial" aria-hidden="true">${a.nama.charAt(0)}</span><strong>${a.nama}</strong></a>` : html`<span class="p-butir"><span class="p-inisial" aria-hidden="true">${a.nama.charAt(0)}</span><strong>${a.nama}</strong>${a.id === o.aktor.id ? html`<small>(Anda)</small>` : ''}</span>`}</td><td>${PERAN[a.peran as Peran].nama}</td><td>${a.units.length ? a.units.map(nama).join(', ') : 'Semua'}</td><td>${a.aktif ? html`<span class="p-status p-status-tayang">Aktif</span>` : html`<span class="p-status p-status-arsip">Nonaktif</span>`}</td></tr>`)}
  </tbody></table></div>`;
}

/** Kartu PIN yang baru dibuat — tampil sekali, siap dicetak atau difoto. */
export function kartuPin(baris: { nama: string; peran: string; pin: string }[]): Raw {
  return html`<div class="p-kartu p-pin-baru" role="status">
    <h2>PIN baru — catat sekarang</h2>
    <p class="p-kecil">PIN ini hanya ditampilkan sekali. Serahkan kepada pemilik akun; saat pertama masuk mereka wajib menggantinya.</p>
    <div class="p-tabel"><table><thead><tr><th>Akun</th><th>Peran</th><th>PIN</th></tr></thead><tbody>${baris.map((b) => html`<tr><td><strong>${b.nama}</strong></td><td>${b.peran}</td><td class="p-pin-angka">${b.pin}</td></tr>`)}</tbody></table></div>
    <button class="tbl tbl-garis tbl-kecil" type="button" data-cetak>Cetak</button>
  </div>`;
}
