/** Halaman perpustakaan digital: beranda pustaka, rak, rak lembaga, katalog dunia, detail buku, dan pembaca bersuara. */
import { esc, html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { PALET, RAK, RAK_ID, type Bab, type Blok, type BukuMeta, type Rak } from '../data/buku.ts';
import { hidupkanBab } from '../data/aktif.ts';
import type { KartuBuku } from '../data/pustaka.ts';
import type { UnitItem } from '../data/site.ts';
import type { Suara } from '../data/model.ts';
import { hiasan, icon } from './layout.ts';
import { kepalaHalaman } from './public.ts';
import { KURIKULUM, namaKelas, type JenjangPel, type Mapel } from '../data/kurikulum.ts';

export type Media = (f: string | undefined | null) => string;
export interface PCtx { media: Media; kecil: (f: string | undefined | null) => string; units: UnitItem[] }

/** Pencerita per jenjang — suara dipilih suara.js: anak-anak bernada tinggi, remaja lembut, dewasa berwibawa. */
export const PENCERITA: Record<Suara, { nama: string; gaya: string }> = {
  balita: { nama: 'Kak Ara', gaya: 'suara anak, ceria — RA & TK' },
  anak: { nama: 'Kak Nisa', gaya: 'suara anak, riang — MI & TPQ' },
  remaja: { nama: 'Ustadzah Salma', gaya: 'lembut & jernih — MTs & pesantren' },
  dewasa: { nama: 'Ustadz Hafidz', gaya: 'tenang & berwibawa — kitab, hadits, kajian' },
};
const NAMA_BAHASA: Record<string, string> = { id: 'Indonesia', ar: 'Arab', en: 'Inggris' };
const ASAL: Record<KartuBuku['asal'], string> = { bawaan: 'Pustaka Yapida', lembaga: 'Tulisan lembaga', jenius: 'jenius.es', gutenberg: 'Katalog dunia' };

function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Warna dan motif sampul: dasar dari raknya, variasi dari id buku — buku satu rak tetap beragam. */
function gaya(b: { id: string; rak: string[] }): { w: [string, string, string]; motif: number } {
  const h = fnv(b.id);
  const dasar = RAK_ID[b.rak[0] ?? '']?.warna ?? h % PALET.length;
  return { w: PALET[(dasar + (h % 3)) % PALET.length]!, motif: (h >>> 3) % 4 };
}

const tautBuku = (id: string) => `/pustaka/b/${encodeURIComponent(id)}`;

/** Buku 3D: sampul tipografi berornamen (atau sampul unggahan), punggung, dan tepi halaman. Miring mengikuti kursor. */
export function sampul3d(b: Pick<KartuBuku, 'id' | 'judul' | 'judulAr' | 'penulis' | 'rak' | 'sampul' | 'sampulUrl'>, x: PCtx, o: { besar?: boolean; href?: string | null } = {}): Raw {
  const g = gaya(b);
  const rak = RAK_ID[b.rak[0] ?? ''];
  const gambar = b.sampul ? x.media(o.besar ? b.sampul : x.kecil(b.sampul)) : b.sampulUrl && (b.sampulUrl.startsWith('/pustaka/m/')) ? b.sampulUrl : '';
  const isi = html`<span class="b3-badan">
    <span class="b3-depan motif-${g.motif}${gambar ? ' b3-bergambar' : ''}">
      ${gambar ? html`<img src="${gambar}" alt="" loading="lazy" decoding="async">` : html`<span class="b3-bingkai" aria-hidden="true"></span>
      <span class="b3-ikon" aria-hidden="true">${rak?.ikon ?? '📖'}</span>
      ${b.judulAr ? html`<span class="b3-ar" lang="ar" dir="rtl">${b.judulAr}</span>` : ''}
      <span class="b3-judul">${b.judul}</span>
      <span class="b3-penulis">${b.penulis}</span>
      <span class="b3-cap" aria-hidden="true">Pustaka Yapida</span>`}
    </span>
    <span class="b3-punggung" aria-hidden="true"><span>${b.judul}</span></span>
    <span class="b3-halaman" aria-hidden="true"></span>
  </span>`;
  const style = `--w1:${g.w[0]};--w2:${g.w[1]};--emas:${g.w[2]}`;
  const kelas = `buku3d${o.besar ? ' buku3d-besar' : ''}`;
  return o.href === null
    ? html`<span class="${kelas}" style="${style}" data-miring>${isi}</span>`
    : html`<a class="${kelas}" style="${style}" href="${o.href ?? tautBuku(b.id)}" data-miring aria-label="${b.judul}">${isi}</a>`;
}

export function kartuBuku(b: KartuBuku, x: PCtx, o: { n?: number; satuan?: string } = {}): Raw {
  return html`<div class="kartu-buku">
    ${sampul3d(b, x)}
    <a class="kb-judul" href="${tautBuku(b.id)}">${b.judul}</a>
    <span class="kb-penulis">${b.penulis}</span>
    <span class="kb-meta">${b.menit ? html`${b.menit} mnt · ` : ''}${b.kelas ? html`${b.kelas} · ` : ''}${NAMA_BAHASA[b.bahasa] ?? b.bahasa}${o.n !== undefined ? html` · <b>${o.n.toLocaleString('id-ID')} ${o.satuan ?? ''}</b>` : ''}</span>
  </div>`;
}

/** Satu rak: buku berdiri berjajar di atas papan, digeser ke samping. */
export function rakBuku(r: { judul: string; ringkas?: string; ikon?: string; href?: string }, buku: KartuBuku[], x: PCtx): Raw {
  if (!buku.length) return raw('');
  return html`<section class="rak muncul">
    <div class="rak-kepala">
      <h2>${r.ikon ? html`<span class="rak-ikon" aria-hidden="true">${r.ikon}</span>` : ''}${r.judul}</h2>
      ${r.ringkas ? html`<p>${r.ringkas}</p>` : ''}
      ${r.href ? html`<a class="tbl tbl-garis tbl-kecil" href="${r.href}">Lihat semua (${buku.length})</a>` : ''}
    </div>
    <div class="rak-bingkai">
      <button class="rak-geser kiri" type="button" data-rak-geser="-1" aria-label="Geser ke kiri">‹</button>
      <div class="rak-gulir" data-rak-gulir>${buku.slice(0, 18).map((b) => kartuBuku(b, x))}</div>
      <button class="rak-geser kanan" type="button" data-rak-geser="1" aria-label="Geser ke kanan">›</button>
      <div class="rak-papan" aria-hidden="true"></div>
    </div>
  </section>`;
}

function peringkat(judul: string, ket: string, ikon: string, daftar: { b: KartuBuku; n: number }[], satuan: string, x: PCtx): Raw {
  return html`<div class="peringkat muncul">
    <h3><span aria-hidden="true">${ikon}</span> ${judul}</h3>
    <p class="peringkat-ket">${ket}</p>
    ${daftar.length ? html`<ol class="peringkat-daftar">${daftar.map(({ b, n }, i) => html`<li class="${i < 3 ? `juara juara-${i + 1}` : ''}">
      <span class="pk-no">${i + 1}</span>
      ${sampul3d(b, x)}
      <span class="pk-teks"><a href="${tautBuku(b.id)}">${b.judul}</a><small>${b.penulis}</small></span>
      <span class="pk-n"><b>${n.toLocaleString('id-ID')}</b> ${satuan}</span>
    </li>`)}</ol>` : html`<p class="kosong-teks">Belum ada data minggu ini — jadilah pembaca pertama! Buka buku mana saja di bawah ini.</p>`}
  </div>`;
}

function formCari(q = '', aksi = '/pustaka/cari', ph = 'Cari judul, penulis, mapel, atau kelas…'): Raw {
  return html`<form class="pustaka-cari" action="${aksi}" method="get" role="search">
    <label class="sr" for="q-pustaka">Cari buku</label>
    <input id="q-pustaka" name="q" type="search" value="${q}" placeholder="${ph}" maxlength="80" autocomplete="off">
    <button class="tbl tbl-emas" type="submit">${icon('panah')}<span>Cari</span></button>
  </form>`;
}

export interface DataBeranda {
  jumlah: number;
  jumlahBab: number;
  dunia: number;
  baca: { b: KartuBuku; n: number }[];
  suka: { b: KartuBuku; n: number }[];
  rak: { r: Rak; buku: KartuBuku[] }[];
  unggulan: KartuBuku[];
}

export function pustakaBeranda(d: DataBeranda, x: PCtx): Raw {
  return html`<section class="pustaka-hero">
  <div class="pola-bintang" aria-hidden="true"></div>
  <div class="wadah pustaka-hero-isi">
    <div>
      <nav class="remah" aria-label="Remah roti"><a href="/">Beranda</a><span aria-current="page">Perpustakaan</span></nav>
      <p class="kicker kicker-emas">Perpustakaan Digital Bersuara</p>
      <h1>Pustaka Yapida</h1>
      <p class="lead">Buku untuk RA, MI, MTs, pesantren, TPQ, majelis taklim, dan para guru — setiap buku bisa <strong>dibacakan</strong>: Arab dengan suara Arab, Inggris dengan suara Inggris, halaman berganti sendiri sampai buku selesai.</p>
      ${formCari()}
      <ul class="pustaka-angka">
        <li><b>${d.jumlah.toLocaleString('id-ID')}</b><span>buku di rak</span></li>
        <li><b>${d.jumlahBab.toLocaleString('id-ID')}</b><span>bab bawaan</span></li>
        <li><b>${d.dunia > 0 ? `${Math.floor(d.dunia / 1000).toLocaleString('id-ID')} rb+` : '70 rb+'}</b><span>katalog dunia</span></li>
        <li><b>3</b><span>bahasa bersuara</span></li>
      </ul>
    </div>
    <div class="pustaka-hero-rak" aria-hidden="true">${d.unggulan.slice(0, 5).map((b) => sampul3d(b, x, { href: null }))}</div>
  </div>
  <svg class="hero-lengkung" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90V52c120 0 120-40 240-40s120 40 240 40 120-40 240-40 120 40 240 40 120-40 240-40 120 40 240 40v38Z"/></svg>
</section>

<section class="bagian lanjut-baca" data-lanjut hidden><div class="wadah"><h2 class="judul-kecil">Lanjutkan membaca</h2><div class="lanjut-daftar" data-lanjut-daftar></div></div></section>

<section class="bagian"><div class="wadah">
  <div class="bagian-kepala muncul"><p class="kicker">10 besar</p><h2>Paling sering dibaca &amp; paling difavoritkan</h2></div>
  <div class="dua-peringkat">
    ${peringkat('Paling sering dibaca', 'Dihitung dari setiap kali buku dibuka untuk dibaca.', '📚', d.baca, 'kali', x)}
    ${peringkat('Paling difavoritkan', 'Tekan ♥ di halaman buku untuk memilih favoritmu.', '💛', d.suka, 'suka', x)}
  </div>
</div></section>

<section class="bagian bagian-rak"><div class="wadah">
  ${hiasan}
  ${d.rak.map(({ r, buku }) => rakBuku({ judul: r.nama, ringkas: r.ringkas, ikon: r.ikon, href: `/pustaka/rak/${r.id}` }, buku, x))}
</div></section>

<section class="bagian"><div class="wadah">
  <div class="bagian-kepala muncul"><p class="kicker">Per lembaga</p><h2>Rak setiap lembaga</h2><p>Buku pilihan untuk setiap lembaga Yayasan Al-Huda Yapida, termasuk buku yang ditulis guru dan admin lembaganya sendiri.</p></div>
  <div class="chip-lembaga muncul">${x.units.map((u) => html`<a class="chip" href="/pustaka/lembaga/${u.slug}">${u.singkat}</a>`)}</div>
</div></section>

<section class="bagian bagian-dunia"><div class="wadah dunia-ajak muncul">
  <div><p class="kicker kicker-emas">Katalog dunia</p><h2>Puluhan ribu buku domain publik</h2>
  <p>Cari karya klasik dari Project Gutenberg dan buku bersuara jenius.es. Hanya karya yang penulis dan penerjemahnya wafat lebih dari 70 tahun lalu (domain publik di Indonesia) yang ditampilkan; buku disalin ke perpustakaan saat pertama dibuka, lengkap dengan sumber dan lisensinya.</p>
  ${formCari('', '/pustaka/dunia', 'Mis. Arabian Nights, fables, science…')}</div>
</div></section>

<section class="bagian"><div class="wadah sempit panduan-suara muncul">
  <h2>Cara kerja suara</h2>
  <p>Pembaca memakai suara yang terpasang di HP atau komputer Anda. Pencerita mengikuti jenjang bukunya — <strong>Kak Ara</strong> dan <strong>Kak Nisa</strong> bersuara anak yang riang (RA, MI & TPQ), <strong>Ustadzah Salma</strong> lembut (MTs & pesantren), <strong>Ustadz Hafidz</strong> tenang dan berwibawa (kitab, hadits & kajian). Logatnya selalu Indonesia — tidak pernah Melayu — dan suara tiap bahasa bisa dipilih sendiri.</p>
  <p>Bila teks Arab terdengar dibaca dengan logat Indonesia, pasang paket suara Arab: di Android buka <em>Setelan → Bahasa & masukan → Keluaran teks-ke-ucapan</em>, di iPhone <em>Setelan → Aksesibilitas → Konten Lisan → Suara</em>.</p>
</div></section>`;
}

export function rakPage(judul: string, lead: string, remah: [string, string][], buku: KartuBuku[], x: PCtx, o: { kelas?: string[]; pilihKelas?: string; mapel?: string[]; pilihMapel?: string; dasar?: string; q?: string; hal?: number; total?: number; perHal?: number } = {}): Raw {
  const qs = (h: number) => { const p = new URLSearchParams(); if (o.pilihKelas) p.set('kelas', o.pilihKelas); if (o.pilihMapel) p.set('mapel', o.pilihMapel); if (h > 1) p.set('hal', String(h)); const t = p.toString(); return `${o.dasar ?? ''}${t ? `?${t}` : ''}`; };
  const jumlahHal = o.total && o.perHal ? Math.ceil(o.total / o.perHal) : 1;
  return html`${kepalaHalaman(judul, lead, remah, 'Perpustakaan')}
<section class="bagian"><div class="wadah">
  ${formCari(o.q ?? '')}
  ${o.kelas && o.kelas.length > 1 ? html`<nav class="saring saring-taut muncul" aria-label="Saring kelas"><a class="saring-tbl" href="${o.dasar}"${!o.pilihKelas ? raw(' aria-current="true"') : ''}>Semua</a>${o.kelas.map((k) => html`<a class="saring-tbl" href="${o.dasar}?kelas=${encodeURIComponent(k)}"${o.pilihKelas === k ? raw(' aria-current="true"') : ''}>${k}</a>`)}</nav>` : ''}
  ${o.mapel && o.mapel.length > 1 ? html`<form class="saring-mapel muncul" method="get" action="${o.dasar}">${o.pilihKelas ? html`<input type="hidden" name="kelas" value="${o.pilihKelas}">` : ''}<label>Mata pelajaran <select name="mapel" data-kirim-otomatis><option value="">Semua mata pelajaran</option>${o.mapel.map((m) => html`<option value="${m}"${o.pilihMapel === m ? raw(' selected') : ''}>${m}</option>`)}</select></label><noscript><button class="tbl tbl-garis tbl-kecil" type="submit">Saring</button></noscript></form>` : ''}
  ${o.total !== undefined ? html`<p class="kecil-abu">${o.total.toLocaleString('id-ID')} buku${jumlahHal > 1 ? html` · halaman ${o.hal ?? 1} dari ${jumlahHal}` : ''}</p>` : ''}
  ${buku.length ? html`<div class="kisi-buku">${buku.map((b) => kartuBuku(b, x))}</div>` : html`<p class="kosong-teks muncul">Belum ada buku di sini. Admin lembaga bisa menambah buku melalui portal.</p>`}
  ${jumlahHal > 1 ? html`<p class="halaman-nav">${(o.hal ?? 1) > 1 ? html`<a class="tbl tbl-garis tbl-kecil" href="${qs((o.hal ?? 1) - 1)}">‹ Sebelumnya</a>` : ''}${(o.hal ?? 1) < jumlahHal ? html`<a class="tbl tbl-garis tbl-kecil" href="${qs((o.hal ?? 1) + 1)}">Berikutnya ›</a>` : ''}</p>` : ''}
</div></section>`;
}

export function lembagaPustaka(u: UnitItem, rak: { r: Rak; buku: KartuBuku[] }[], milik: KartuBuku[], x: PCtx): Raw {
  return html`${kepalaHalaman(`Rak ${u.singkat}`, `Buku pilihan dan tulisan ${u.nama} di Pustaka Yapida — semuanya bisa dibacakan.`, [['Perpustakaan', '/pustaka'], [u.singkat, `/pustaka/lembaga/${u.slug}`]], 'Perpustakaan')}
<section class="bagian bagian-rak"><div class="wadah">
  ${milik.length ? rakBuku({ judul: `Tulisan ${u.singkat}`, ringkas: 'Buku yang ditulis guru dan admin lembaga ini.', ikon: '✍️' }, milik, x) : ''}
  ${rak.map(({ r, buku }) => rakBuku({ judul: r.nama, ringkas: r.ringkas, ikon: r.ikon, href: `/pustaka/rak/${r.id}` }, buku, x))}
  ${!milik.length && !rak.some((r) => r.buku.length) ? html`<p class="kosong-teks">Belum ada buku untuk lembaga ini.</p>` : ''}
  <p class="muncul"><a class="tbl tbl-garis" href="/lembaga/${u.slug}">Profil ${u.singkat}</a> <a class="tbl tbl-garis" href="/pustaka">Semua rak</a></p>
</div></section>`;
}

export function duniaPage(q: string, hasil: { jumlah: number; buku: KartuBuku[]; berikut: boolean; hal: number }, jen: KartuBuku[], x: PCtx): Raw {
  const nav = (h: number, l: string) => html`<a class="tbl tbl-garis tbl-kecil" href="/pustaka/dunia?${q ? `q=${encodeURIComponent(q)}&` : ''}hal=${h}">${l}</a>`;
  return html`${kepalaHalaman('Katalog Dunia', 'Karya domain publik dari Project Gutenberg dan buku bersuara jenius.es — dibaca dan dibacakan langsung di Pustaka Yapida.', [['Perpustakaan', '/pustaka'], ['Katalog dunia', '/pustaka/dunia']], 'Perpustakaan')}
<section class="bagian"><div class="wadah">
  ${formCari(q, '/pustaka/dunia', 'Mis. Arabian Nights, fables, science, Hikayat…')}
  ${jen.length ? rakBuku({ judul: q ? `jenius.es: “${q}”` : 'Pilihan jenius.es', ringkas: 'Buku bersuara dari situs mitra jenius.es (Standard Ebooks CC0, BSE, OpenStax).', ikon: '🎧' }, jen, x) : ''}
  <h2 class="judul-kecil">${q ? html`Project Gutenberg: “${q}”` : 'Project Gutenberg — paling banyak diunduh'}</h2>
  <p class="kecil-abu">${hasil.jumlah ? html`${hasil.jumlah.toLocaleString('id-ID')} judul ditemukan; yang tampil hanya yang domain publik di Indonesia.` : 'Katalog sedang tidak bisa dihubungi. Coba beberapa saat lagi.'}</p>
  ${hasil.buku.length ? html`<div class="kisi-buku">${hasil.buku.map((b) => kartuBuku(b, x))}</div>` : ''}
  <p class="halaman-nav">${hasil.hal > 1 ? nav(hasil.hal - 1, '‹ Sebelumnya') : ''} ${hasil.berikut ? nav(hasil.hal + 1, 'Berikutnya ›') : ''}</p>
</div></section>`;
}

/* ── detail buku ─────────────────────────────────────────────────────────── */

export function bukuDetail(m: BukuMeta, asal: KartuBuku['asal'], x: PCtx, o: { baca: number; suka: number; disukai: boolean; serak: KartuBuku[]; unitNama?: string }): Raw {
  const p = PENCERITA[m.suara];
  return html`<section class="buku-hero">
  <div class="pola-bintang" aria-hidden="true"></div>
  <div class="wadah buku-hero-isi">
    <div class="buku-hero-sampul">${sampul3d(m, x, { besar: true, href: null })}</div>
    <div class="buku-hero-teks">
      <nav class="remah" aria-label="Remah roti"><a href="/">Beranda</a><a href="/pustaka">Perpustakaan</a>${m.rak[0] && RAK_ID[m.rak[0]] ? html`<a href="/pustaka/rak/${m.rak[0]}">${RAK_ID[m.rak[0]]!.nama}</a>` : ''}<span aria-current="page">${m.judul.slice(0, 40)}</span></nav>
      ${m.judulAr ? html`<p class="buku-ar" lang="ar" dir="rtl">${m.judulAr}</p>` : ''}
      <h1>${m.judul}</h1>
      <p class="buku-penulis">${m.penulis}${m.penerjemah ? html` · terjemah ${m.penerjemah}` : ''}</p>
      <ul class="buku-chip">${m.rak.map((r) => (RAK_ID[r] ? html`<li><a href="/pustaka/rak/${r}">${RAK_ID[r]!.ikon} ${RAK_ID[r]!.nama}</a></li>` : ''))}${m.kelas ? html`<li>${m.kelas}</li>` : ''}${m.mapel ? html`<li>${m.mapel}</li>` : ''}${o.unitNama ? html`<li>${o.unitNama}</li>` : ''}</ul>
      <p class="buku-ringkas">${m.ringkasan}</p>
      <div class="buku-aksi">
        ${m.bab.length ? html`<a class="tbl tbl-emas" href="${tautBuku(m.id)}/1" data-mulai-baca="${m.id}">${icon('buku')}<span>Baca</span></a>
        <a class="tbl tbl-garis-terang" href="${tautBuku(m.id)}/1?dengar=1">▶ <span>Dengarkan</span></a>` : ''}
        <button class="tbl tbl-suka" type="button" data-suka="${m.id}" aria-pressed="${o.disukai ? 'true' : 'false'}"><span aria-hidden="true">♥</span> <span data-suka-n>${o.suka}</span><span class="sr"> suka</span></button>
      </div>
      <ul class="buku-fakta">
        <li><b>${m.bab.length}</b><span>bab</span></li>
        <li><b>${m.menit}</b><span>menit baca</span></li>
        <li><b>${o.baca.toLocaleString('id-ID')}</b><span>kali dibaca</span></li>
        <li><b>${NAMA_BAHASA[m.bahasa] ?? m.bahasa}</b><span>bahasa</span></li>
      </ul>
    </div>
  </div>
</section>
<section class="bagian"><div class="wadah buku-dua">
  <div>
    <h2 class="judul-kecil">Daftar isi</h2>
    ${m.bab.length ? html`<ol class="daftar-isi">${m.bab.map((b) => html`<li><a href="${tautBuku(m.id)}/${b.n}"><span class="di-n">${b.n}</span><span class="di-j">${b.judul}</span><span class="di-m">${Math.max(1, Math.round(b.kata / 150))} mnt</span></a></li>`)}</ol>` : ''}
  </div>
  <aside class="buku-info">
    <h2 class="judul-kecil">Tentang buku</h2>
    <dl>
      <dt>Pencerita</dt><dd>${p.nama} <small>(${p.gaya})</small></dd>
      <dt>Jumlah kata</dt><dd>${m.kata.toLocaleString('id-ID')}</dd>
      <dt>Sumber</dt><dd>${m.sumberUrl ? html`<a href="${m.sumberUrl}" target="_blank" rel="noopener nofollow">${m.sumber}</a>` : m.sumber}</dd>
      <dt>Lisensi</dt><dd>${m.lisensiUrl ? html`<a href="${m.lisensiUrl}" target="_blank" rel="noopener nofollow">${m.lisensi}</a>` : m.lisensi}</dd>
      <dt>Koleksi</dt><dd>${ASAL[asal]}</dd>
    </dl>
  </aside>
</div></section>
${o.serak.length ? html`<section class="bagian bagian-rak"><div class="wadah">${rakBuku({ judul: 'Buku lain di rak ini', ikon: RAK_ID[m.rak[0] ?? '']?.ikon }, o.serak, x)}</div></section>` : ''}`;
}

/* ── pembaca ─────────────────────────────────────────────────────────────── */

const AR_RUN = /([؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿\s،؛؟.,:;!?()«»ـ-]*[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]|[؀-ۿﭐ-﷿ﹰ-﻿])/g;

/** Teks sebaris: di-escape, **tebal** dikenali, sisipan Arab dibungkus lang="ar" agar dilafalkan dengan suara Arab. */
export function sebaris(x: string, bungkusArab = true): string {
  let t = esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  if (bungkusArab) t = t.replace(AR_RUN, '<span class="arab-in" lang="ar" dir="rtl">$1</span>');
  return t;
}

/** Isi aktivitas ala Wordwall dikirim sebagai data (atribut), dirakit jadi permainan oleh pustaka.js. */
const attr = (s: string) => esc(s);
export function blokHtml(b: Blok): string {
  switch (b.t) {
    case 'adegan': {
      const [nama, ket] = b.x.split('|').map((v) => v.trim());
      return `<figure class="akt adegan" data-akt="adegan" data-adegan="${attr(nama ?? '')}" data-ket="${attr(ket ?? '')}"><div class="adegan-panggung" data-adegan-isi role="img" aria-label="${attr(ket || 'Gambar interaktif')}"></div><figcaption><span>${sebaris(ket ?? '')}</span><button type="button" class="adegan-reset" data-adegan-reset>↺ Kembalikan</button></figcaption></figure>`;
    }
    case 'img': return b.x.startsWith('/pustaka/m/') ? `<figure class="b-img"><img src="${attr(b.x)}" alt="${attr(b.a ?? '')}" loading="lazy" decoding="async"></figure>` : '';
    case 'kuis': {
      const [tanya, ...pil] = b.x.split('|').map((s) => s.trim());
      return `<div class="akt akt-kuis" data-akt="kuis" data-pilihan="${attr(JSON.stringify(pil))}"><p class="akt-label">❓ Tebak!</p><p class="akt-tanya" data-b>${sebaris(tanya ?? '')}</p><div class="akt-pilihan" data-akt-isi></div></div>`;
    }
    case 'kartu': {
      const [depan, belakang] = b.x.split('|').map((s) => s.trim());
      return `<button type="button" class="akt akt-kartu" data-akt="kartu" aria-pressed="false"><span class="kartu-muka depan">${sebaris(depan ?? '')}</span><span class="kartu-muka belakang">${sebaris(belakang ?? '')}</span><span class="kartu-ketuk" aria-hidden="true">ketuk untuk membalik ↻</span></button>`;
    }
    case 'cocok': {
      const pasang = b.x.split(';').map((p) => p.split('=').map((s) => s.trim())).filter((p) => p.length === 2 && p[0] && p[1]);
      return `<div class="akt akt-cocok" data-akt="cocok" data-pasang="${attr(JSON.stringify(pasang))}"><p class="akt-label">🧩 Pasangkan!</p><p class="akt-tanya">Ketuk satu kotak di kiri, lalu pasangannya di kanan.</p><div class="cocok-papan" data-akt-isi></div></div>`;
    }
    case 'urut': {
      const [tanya, isi] = b.x.split('|').map((s) => s.trim());
      const butir = (isi ?? '').split(';;').map((s) => s.trim()).filter(Boolean);
      return `<div class="akt akt-urut" data-akt="urut" data-urut="${attr(JSON.stringify(butir))}"><p class="akt-label">🔢 Urutkan!</p><p class="akt-tanya" data-b>${sebaris(tanya ?? '')}</p><ol class="urut-hasil" data-urut-hasil></ol><div class="urut-pilihan" data-akt-isi></div></div>`;
    }
    case 'h': return `<h3 class="b-h" data-b>${sebaris(b.x)}</h3>`;
    case 'ar': return `<p class="b-ar" lang="ar" dir="rtl" data-b>${sebaris(b.x, false)}</p>`;
    case 'tr': return `<p class="b-tr" data-b data-tr>${sebaris(b.x)}</p>`;
    case 'en': return `<p class="b-en" lang="en" data-b>${sebaris(b.x)}</p>`;
    case 'lt': return `<p class="b-lt" data-tr>${sebaris(b.x, false)}</p>`;
    case 'cat': return `<p class="b-cat">${sebaris(b.x)}</p>`;
    case 'q': return `<blockquote class="b-q" data-b>${sebaris(b.x)}</blockquote>`;
    case 'li': return `<p class="b-li" data-b>${sebaris(b.x)}</p>`;
    default: return `<p data-b>${sebaris(b.x)}</p>`;
  }
}

export function pembacaPage(m: BukuMeta, babAsli: Bab, x: PCtx): Raw {
  const bab = hidupkanBab(babAsli, m);
  const sebelum = m.bab.find((b) => b.n === bab.n - 1);
  const sesudah = m.bab.find((b) => b.n === bab.n + 1);
  const adaTr = bab.blok.some((b) => b.t === 'tr' || b.t === 'lt');
  const g = gaya(m);
  return html`<div class="baca" data-baca style="--w1:${g.w[0]};--w2:${g.w[1]};--emas:${g.w[2]}">
  <header class="baca-atas">
    <a class="baca-kembali" href="${tautBuku(m.id)}" title="Kembali ke halaman buku"><span aria-hidden="true">‹</span><span class="baca-kembali-j">${m.judul}</span></a>
    <label class="baca-pilih-bab"><span class="sr">Pilih bab</span><select data-baca-bab>${m.bab.map((b) => html`<option value="${b.n}"${b.n === bab.n ? raw(' selected') : ''}>${b.n}. ${b.judul.slice(0, 60)}</option>`)}</select></label>
    <div class="baca-alat" role="toolbar" aria-label="Pengaturan baca">
      <button type="button" data-baca-mode title="Ganti mode halaman / gulir" aria-pressed="false"><span aria-hidden="true">⇅</span><span class="sr">Mode gulir</span></button>
      <button type="button" data-baca-huruf="-1" title="Huruf lebih kecil">A−</button>
      <button type="button" data-baca-huruf="1" title="Huruf lebih besar">A+</button>
      <button type="button" data-baca-tema title="Ganti warna kertas"><span aria-hidden="true">◐</span><span class="sr">Warna kertas</span></button>
      ${adaTr ? html`<button type="button" data-baca-terjemah aria-pressed="true" title="Tampilkan / sembunyikan terjemah & latin">Terjemah</button>` : ''}
      <button type="button" data-baca-layar title="Layar penuh"><span aria-hidden="true">⛶</span><span class="sr">Layar penuh</span></button>
    </div>
  </header>
  <div class="baca-panggung" data-panggung>
    <div class="baca-lembar" data-lembar>
      <article class="baca-isi" data-isi lang="${m.bahasa === 'ar' ? 'id' : m.bahasa}" data-suara="${m.suara}">
        <header class="baca-kepala-bab" data-b>
          <p class="bkb-n">Bab ${bab.n} dari ${m.bab.length}</p>
          <h1 class="bkb-j">${bab.judul}</h1>
          ${bab.judulAr ? html`<p class="bkb-ar" lang="ar" dir="rtl">${bab.judulAr}</p>` : ''}
        </header>
        ${raw(bab.blok.map(blokHtml).join(''))}
      </article>
    </div>
    <button class="baca-panah kiri" type="button" data-hal="-1" aria-label="Halaman sebelumnya">‹</button>
    <button class="baca-panah kanan" type="button" data-hal="1" aria-label="Halaman berikutnya">›</button>
  </div>
  <footer class="baca-bawah">
    <button class="baca-dengar" type="button" data-baca-dengar aria-pressed="false"><span class="bd-ikon" aria-hidden="true">▶</span><span data-dengar-label>Dengarkan</span></button>
    <label class="baca-sel"><span>Pencerita</span><select data-pencerita>${(Object.keys(PENCERITA) as Suara[]).map((k) => html`<option value="${k}"${k === m.suara ? raw(' selected') : ''}>${PENCERITA[k].nama} — ${PENCERITA[k].gaya}</option>`)}</select></label>
    <label class="baca-sel"><span>Kecepatan</span><select data-kecepatan><option value="0.75">0,75×</option><option value="1" selected>1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select></label>
    <button class="baca-ikon" type="button" data-suara-atur title="Pilih suara tiap bahasa" aria-expanded="false">🗣️<span class="sr">Pilih suara</span></button>
    <div class="baca-posisi"><span data-posisi>Bab ${bab.n}</span><progress data-kemajuan max="1" value="0"></progress></div>
    <button class="baca-ikon tbl-suka" type="button" data-suka="${m.id}" aria-pressed="false" title="Suka buku ini">♥<span class="sr">Suka</span></button>
  </footer>
  <div class="baca-suara-panel" data-suara-panel hidden>
    <p><strong>Suara tiap bahasa</strong> — dipilih otomatis dari suara terbaik di perangkat ini (suara neural lebih dulu). Paling jernih: Microsoft Edge („Gadis“ & „Ardi“ Natural), Chrome („Google Bahasa Indonesia“), iPhone („Damayanti“).</p>
    <label>Indonesia <select data-suara-bhs="id"></select></label>
    <label>Arab <select data-suara-bhs="ar"></select></label>
    <label>Inggris <select data-suara-bhs="en"></select></label>
    <p class="kecil-abu" data-suara-ket></p>
  </div>
  <div class="baca-mulai" data-mulai-dengar hidden><button class="tbl tbl-emas" type="button">▶ Mulai dengarkan</button></div>
  <div class="baca-khatam" data-khatam hidden role="status"><div><p class="bk-ar" lang="ar" dir="rtl">الْحَمْدُ لِلَّهِ</p><h2>Buku selesai dibacakan!</h2><p>Masya Allah, satu buku sudah tamat. Pilih buku berikutnya di rak.</p><a class="tbl tbl-emas" href="/pustaka">Kembali ke rak</a></div></div>
  <nav class="baca-babnav" aria-label="Bab">
    ${sebelum ? html`<a href="${tautBuku(m.id)}/${sebelum.n}" rel="prev" data-bab-pindah="${sebelum.n}">‹ ${sebelum.judul.slice(0, 50)}</a>` : html`<span></span>`}
    ${sesudah ? html`<a href="${tautBuku(m.id)}/${sesudah.n}" rel="next" data-bab-pindah="${sesudah.n}">${sesudah.judul.slice(0, 50)} ›</a>` : html`<a href="${tautBuku(m.id)}">Selesai — kembali ke buku ›</a>`}
  </nav>
</div>
${jsonScript('data-baca', { id: m.id, judul: m.judul, n: bab.n, bab: m.bab.map((b) => ({ n: b.n, j: b.judul })), suara: m.suara, bahasa: m.bahasa })}`;
}

export const rakUntukUnit = (slug: string): Rak[] => RAK.filter((r) => r.unit.includes(slug));

/** Pita perpustakaan di beranda: buku pilihan + peringkat singkat. */
export function pitaPustaka(buku: KartuBuku[], top: { b: KartuBuku; n: number }[], x: PCtx): Raw {
  if (!buku.length) return raw('');
  return html`<section class="bagian bagian-rak pita-pustaka"><div class="wadah">
    <header class="bagian-kepala muncul"><p class="kicker">Perpustakaan digital bersuara</p><h2>Pustaka Yapida</h2><p class="lead">Kitab, doa, cerita bergambar, dan buku pelajaran TK–MI–MTs — semua bisa dibacakan, banyak yang bisa dimainkan.</p>${hiasan}</header>
    ${rakBuku({ judul: top.length ? 'Paling sering dibaca' : 'Pilihan pustaka', ikon: top.length ? '📚' : '✨', href: '/pustaka' }, top.length ? top.map((t) => t.b) : buku, x)}
    <p class="tengah muncul"><a class="tbl tbl-emas" href="/pustaka">${icon('buku')}<span>Masuk perpustakaan</span></a></p>
  </div></section>`;
}

/** Rak buku di halaman profil lembaga. */
export function rakSisipUnit(u: UnitItem, buku: KartuBuku[], x: PCtx): Raw {
  if (!buku.length) return raw('');
  return html`<section class="bagian bagian-rak"><div class="wadah">${rakBuku({ judul: `Rak pustaka ${u.singkat}`, ringkas: 'Buku bacaan, kitab, dan buku pelajaran pilihan — bisa dibaca dan dibacakan.', ikon: '📚', href: `/pustaka/lembaga/${u.slug}` }, buku, x)}</div></section>`;
}


/* ── Pelajaran Madrasah: peta mata pelajaran RA, MI, MTs per kelas (perintah pemilik 31) ─────────────────────── */

export interface SelMapel { m: Mapel; kelas: number; jumlah: number; dukung: number }

export function pelajaranBeranda(j: JenjangPel, sel: SelMapel[], x: PCtx): Raw {
  const k = KURIKULUM[j];
  void x;
  return html`${kepalaHalaman(`Pelajaran ${k.nama}`, `${k.ringkas} Semua buku dibacakan dengan suara yang pas, berpenanda kata, dan bisa dibaca tanpa unduhan.`, [['Perpustakaan', '/pustaka'], ['Pelajaran madrasah', '/pustaka/pelajaran'], [k.nama, `/pustaka/pelajaran/${j}`]], 'Perpustakaan formal')}
<section class="bagian"><div class="wadah">
  <nav class="pel-jenjang muncul" aria-label="Jenjang">${(Object.keys(KURIKULUM) as JenjangPel[]).map((x2) => html`<a href="/pustaka/pelajaran/${x2}"${raw(x2 === j ? ' aria-current="page"' : '')}><b>${x2.toUpperCase().replace('MTS', 'MTs')}</b><span>${KURIKULUM[x2].nama.replace(/^\w+ /, '')}</span></a>`)}</nav>
  ${k.kelas.map((kl) => {
    const isi = sel.filter((s) => s.kelas === kl);
    return html`<section class="pel-kelas muncul" id="kelas-${kl}"><header><span class="pel-kelas-angka">${j === 'ra' ? 'RA' : kl}</span><div><h2>${namaKelas(j, kl)}</h2><p>${isi.length} mata pelajaran · ${isi.reduce((n, s) => n + s.jumlah, 0)} buku pelajaran · ${isi.reduce((n, s) => n + s.dukung, 0)} bacaan pendukung</p></div></header>
      <div class="pel-kisi">${isi.map((s) => html`<a class="pel-mapel${s.jumlah ? '' : ' pel-dukung'}" href="/pustaka/pelajaran/${j}/${kl}/${s.m.slug}"><span class="pel-ikon" aria-hidden="true">${s.m.ikon}</span><strong>${s.m.nama}</strong><small>${s.m.ket}</small><em>${s.jumlah ? `${s.jumlah} buku pelajaran` : s.dukung ? `${s.dukung} bacaan pendukung` : 'segera'}</em></a>`)}</div>
    </section>`;
  })}
  <p class="kecil-abu muncul">Struktur mata pelajaran mengikuti Kurikulum Merdeka pada madrasah (KMA 347/2022 dan pembaruannya) serta mata pelajaran PAI &amp; Bahasa Arab madrasah (KMA 183/2019). Buku pelajaran umum berasal dari Buku Sekolah Elektronik yang hak ciptanya dibeli Depdiknas dan boleh dialihmediakan — teksnya disusun ulang menjadi buku interaktif.</p>
</div></section>`;
}

export function pelajaranMapel(j: JenjangPel, kelas: number, m: Mapel, isi: { pelajaran: KartuBuku[]; dukung: KartuBuku[] }, x: PCtx): Raw {
  const k = KURIKULUM[j];
  const lain = k.mapel.filter((y) => y.kelas.includes(kelas) && y.slug !== m.slug);
  return html`${kepalaHalaman(`${m.ikon} ${m.nama} — ${namaKelas(j, kelas)} ${j === 'ra' ? 'RA' : j.toUpperCase().replace('MTS', 'MTs')}`, `${m.ket} Buku pelajaran dan bacaan pendukung, dibacakan dengan penanda kata.`, [['Perpustakaan', '/pustaka'], ['Pelajaran madrasah', '/pustaka/pelajaran'], [k.nama, `/pustaka/pelajaran/${j}`], [m.nama, `/pustaka/pelajaran/${j}/${kelas}/${m.slug}`]], 'Perpustakaan formal')}
<section class="bagian"><div class="wadah">
  ${m.taut?.length ? html`<p class="pel-taut muncul">${m.taut.map(([l, h]) => html`<a class="tbl tbl-emas tbl-kecil" href="${h}">${l} →</a>`)}</p>` : ''}
  ${isi.pelajaran.length ? html`<h2 class="judul-kecil">Buku pelajaran ${namaKelas(j, kelas)}</h2><div class="kisi-buku">${isi.pelajaran.map((b) => kartuBuku(b, x))}</div>` : j === 'ra' ? '' : html`<p class="kosong-teks muncul">Buku pelajaran ${m.nama} ${namaKelas(j, kelas)} sedang disusun — sementara gunakan bacaan pendukung di bawah.</p>`}
  ${isi.dukung.length ? html`<h2 class="judul-kecil">Bacaan pendukung</h2><div class="kisi-buku">${isi.dukung.map((b) => kartuBuku(b, x))}</div>` : ''}
  <nav class="pel-lain muncul" aria-label="Mata pelajaran lain"><h2 class="judul-kecil">Mata pelajaran lain ${namaKelas(j, kelas)}</h2>${lain.map((y) => html`<a href="/pustaka/pelajaran/${j}/${kelas}/${y.slug}"><span aria-hidden="true">${y.ikon}</span>${y.nama}</a>`)}</nav>
  ${j !== 'ra' ? html`<nav class="pel-lain muncul" aria-label="Kelas lain"><h2 class="judul-kecil">${m.nama} kelas lain</h2>${m.kelas.filter((y) => y !== kelas).map((y) => html`<a href="/pustaka/pelajaran/${j}/${y}/${m.slug}">${namaKelas(j, y)}</a>`)}</nav>` : ''}
</div></section>`;
}
