/** Halaman publik. Semua isi datang dari dokumen R2 (pengaturan situs, lembaga, halaman) — tidak ada teks lembaga di sini. */
import { html, raw, type Raw } from '../lib/html.ts';
import { KELOMPOK, URUTAN_KELOMPOK, type Halaman, type Kelompok, type Situs, type Unit } from '../data/model.ts';
import type { UnitItem } from '../data/site.ts';
import { tanggal } from '../lib/text.ts';
import { alamatLengkap, hiasan, icon } from './layout.ts';

const kepalaBagian = (kicker: string, judul: string, lead?: string, id?: string): Raw => html`<header class="bagian-kepala muncul">
  <p class="kicker">${kicker}</p>
  <h2${id ? raw(` id="${id}"`) : ''}>${judul}</h2>
  ${lead ? html`<p class="lead">${lead}</p>` : ''}
  ${hiasan}
</header>`;

/** Kartu lembaga: medali bintang delapan + nama + ringkasan. Miring mengikuti kursor (app.js). */
export function kartuUnit(u: UnitItem): Raw {
  return html`<a class="kartu-unit muncul" href="/lembaga/${u.slug}" data-kelompok="${u.kelompok}" data-miring>
    <span class="medali" aria-hidden="true">${icon(KELOMPOK[u.kelompok].ikon)}</span>
    <span class="kartu-unit-jenis">${u.jenis}</span>
    <strong>${u.singkat}</strong>
    <span class="kartu-unit-ringkas">${u.ringkas}</span>
    <span class="kartu-unit-lanjut">Lihat profil ${icon('panah')}</span>
  </a>`;
}

function heroBeranda(s: Situs, units: UnitItem[]): Raw {
  return html`<section class="hero">
  <canvas class="hero-langit" data-langit aria-hidden="true"></canvas>
  <div class="hero-pola" aria-hidden="true"></div>
  <div class="wadah hero-isi">
    <div class="hero-teks">
      <p class="kicker kicker-emas">Sukakarya · Kabupaten Bekasi · sejak 1967</p>
      <h1>${s.nama}<span>Ibadah, pendidikan, ekonomi, dan sosial dalam satu naungan</span></h1>
      <p class="hero-lead">${s.slogan}</p>
      <div class="hero-aksi">
        <a class="tbl tbl-emas" href="#lembaga">Jelajahi ${units.length} lembaga ${icon('panah')}</a>
        <a class="tbl tbl-kaca" href="/profil">Profil yayasan</a>
      </div>
      <figure class="hero-ayat">
        <blockquote class="arab" lang="ar" dir="rtl">رَبِّ زِدْنِي عِلْمًا</blockquote>
        <figcaption>“Ya Tuhanku, tambahkanlah ilmu kepadaku.” <cite>QS. Thaha: 114</cite></figcaption>
      </figure>
    </div>
    <div class="hero-mihrab" data-paralaks>
      <svg class="lentera lentera-1" viewBox="0 0 60 150" aria-hidden="true"><path d="M30 0v38" class="tali"/><path d="M22 38h16l3 8H19Zm-3 8h22l6 18v34l-6 14H19l-6-14V64Z" class="rangka"/><path d="M19 64h22v34H19Z" class="nyala"/><path d="M23 112h14l-3 12h-8Z" class="rangka"/><path d="M30 46v66M19 81h22" class="jeruji"/></svg>
      <svg class="lentera lentera-2" viewBox="0 0 60 150" aria-hidden="true"><path d="M30 0v38" class="tali"/><path d="M22 38h16l3 8H19Zm-3 8h22l6 18v34l-6 14H19l-6-14V64Z" class="rangka"/><path d="M19 64h22v34H19Z" class="nyala"/><path d="M23 112h14l-3 12h-8Z" class="rangka"/><path d="M30 46v66M19 81h22" class="jeruji"/></svg>
      <div class="mihrab">
        <div class="mihrab-dalam">
          <img src="/assets/logo-512.webp" width="252" height="320" alt="Lambang Yayasan Al-Huda Yapida" fetchpriority="high">
          <p class="mihrab-nama arab" lang="ar" dir="rtl">مؤسسة الهدى</p>
        </div>
      </div>
      <svg class="sabit" viewBox="0 0 80 80" aria-hidden="true"><path d="M58 52a28 28 0 1 1-18-44 22 22 0 1 0 18 44Z"/><path d="M60 14l2.400 5.200 5.600.600-4.200 3.800 1.200 5.600-5-2.900-5 2.900 1.200-5.600-4.200-3.800 5.600-.600Z"/></svg>
    </div>
  </div>
  <svg class="hero-lengkung" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90V52c120 0 120-40 240-40s120 40 240 40 120-40 240-40 120 40 240 40 120-40 240-40 120 40 240 40v38Z"/></svg>
</section>`;
}

function angkaBeranda(s: Situs, units: UnitItem[]): Raw {
  const a: [string, string][] = [
    [String(units.length), 'lembaga di bawah satu yayasan'],
    [String(new Set(units.map((u) => u.kelompok)).size), 'bidang: ibadah, pendidikan, ekonomi, sosial'],
    ...(s.linimasa[0] ? [[s.linimasa[0].tahun, 'pengajian pertama dimulai'] as [string, string]] : []),
    [s.legal.akta.tanggal.slice(0, 4), 'disahkan sebagai badan hukum'],
  ];
  return html`<section class="angka" aria-label="Yapida dalam angka"><div class="wadah angka-isi">
    ${a.map(([n, l]) => html`<div class="angka-butir muncul"><strong data-hitung="${n}">${n}</strong><span>${l}</span></div>`)}
  </div></section>`;
}

function jelajahLembaga(units: UnitItem[]): Raw {
  const ada = URUTAN_KELOMPOK.filter((k) => units.some((u) => u.kelompok === k));
  return html`<section class="bagian" id="lembaga"><div class="wadah">
    ${kepalaBagian('Lembaga kami', 'Lima bidang, satu naungan', 'Pilih bidang untuk menyaring, lalu buka profil lembaganya.')}
    <div class="saring" role="tablist" aria-label="Saring lembaga menurut bidang" data-saring>
      <button class="saring-tbl" type="button" role="tab" aria-selected="true" data-saring-nilai="semua">Semua <b>${units.length}</b></button>
      ${ada.map((k) => html`<button class="saring-tbl" type="button" role="tab" aria-selected="false" data-saring-nilai="${k}">${icon(KELOMPOK[k].ikon)}${KELOMPOK[k].nama} <b>${units.filter((u) => u.kelompok === k).length}</b></button>`)}
    </div>
    <div class="kisi-unit" data-saring-daftar>${units.map(kartuUnit)}</div>
  </div></section>`;
}

/** Jalur belajar: jenjang formal berurutan, dari yang termuda. */
function jalurBelajar(units: UnitItem[]): Raw {
  const formal = units.filter((u) => u.kelompok === 'formal');
  if (formal.length < 2) return raw('');
  return html`<section class="bagian bagian-gelap"><div class="pola-bintang" aria-hidden="true"></div><div class="wadah">
    ${kepalaBagian('Jalur belajar', 'Dari usia dini sampai mondok, tanpa pindah lingkungan', 'Setiap jenjang menyambung ke jenjang berikutnya di kampus yang sama.')}
    <ol class="jalur">${formal.map((u, i) => html`<li class="jalur-butir muncul"><a href="/lembaga/${u.slug}"><span class="jalur-nomor">${i + 1}</span><strong>${u.singkat}</strong><span>${u.jenis}</span></a></li>`)}</ol>
  </div></section>`;
}

function linimasa(s: Situs): Raw {
  if (!s.linimasa.length) return raw('');
  return html`<section class="bagian"><div class="wadah">
    ${kepalaBagian('Jejak langkah', 'Dari satu pengajian sore', 'Geser atau ketuk tahunnya untuk mengikuti perjalanan Yapida.')}
    <div class="linimasa" data-linimasa>
      <div class="linimasa-tahun" role="tablist" aria-label="Tonggak sejarah">${s.linimasa.map((t, i) => html`<button type="button" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" data-linimasa-tbl="${i}"><span>${t.tahun}</span></button>`)}</div>
      <div class="linimasa-panel">${s.linimasa.map((t, i) => html`<article class="linimasa-butir${i === 0 ? ' aktif' : ''}" role="tabpanel" data-linimasa-panel="${i}"><p class="linimasa-angka" aria-hidden="true">${t.tahun}</p><div><h3>${t.judul}</h3><p>${t.isi}</p></div></article>`)}</div>
    </div>
    <p class="tengah"><a class="tbl tbl-garis" href="/profil#sejarah">Baca sejarah lengkap ${icon('panah')}</a></p>
  </div></section>`;
}

function ajakan(s: Situs): Raw {
  return html`<section class="bagian bagian-ajakan"><div class="wadah ajakan muncul">
    <div class="ajakan-teks">
      <p class="kicker kicker-emas">Legalitas</p>
      <h2>Yayasan berbadan hukum</h2>
      <p>Akta pendirian No. ${s.legal.akta.nomor} tanggal ${tanggal(s.legal.akta.tanggal)}; disahkan dengan SK Menteri Hukum dan HAM No. ${s.legal.sk.nomor}.</p>
      <div class="hero-aksi"><a class="tbl tbl-emas" href="/profil#legalitas">Lihat legalitas & pengurus</a>${s.donasi.tampil ? html`<a class="tbl tbl-kaca" href="/donasi">Salurkan donasi</a>` : ''}</div>
    </div>
    <ul class="ajakan-daftar">
      <li>${icon('pin')}<span>${alamatLengkap(s)}</span></li>
      ${s.legal.npwp ? html`<li>${icon('bintang')}<span>NPWP ${s.legal.npwp}</span></li>` : ''}
    </ul>
  </div></section>`;
}

export function berandaPage(s: Situs, units: UnitItem[]): Raw {
  return html`${heroBeranda(s, units)}${angkaBeranda(s, units)}${jelajahLembaga(units)}${jalurBelajar(units)}${linimasa(s)}${ajakan(s)}`;
}

/** Kepala halaman dalam (bukan beranda): remah roti + judul di atas pola bintang. */
export function kepalaHalaman(judul: string, lead: string, remah: [string, string][], kicker?: string): Raw {
  return html`<section class="kepala-hal">
  <div class="pola-bintang" aria-hidden="true"></div>
  <div class="wadah">
    <nav class="remah" aria-label="Remah roti"><a href="/">Beranda</a>${remah.map(([l, h], i) => (i === remah.length - 1 ? html`<span aria-current="page">${l}</span>` : html`<a href="${h}">${l}</a>`))}</nav>
    ${kicker ? html`<p class="kicker kicker-emas">${kicker}</p>` : ''}
    <h1>${judul}</h1>
    <p class="lead">${lead}</p>
  </div>
  <svg class="hero-lengkung" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90V52c120 0 120-40 240-40s120 40 240 40 120-40 240-40 120 40 240 40 120-40 240-40 120 40 240 40v38Z"/></svg>
</section>`;
}

export function profilPage(s: Situs): Raw {
  const organ = (['Pembina', 'Pengurus', 'Pengawas'] as const).map((o) => ({ o, list: s.organ.filter((x) => x.organ === o) })).filter((g) => g.list.length);
  return html`${kepalaHalaman(`Profil ${s.nama}`, s.deskripsi, [['Profil', '/profil']], 'Tentang yayasan')}
<section class="bagian"><div class="wadah dua-kolom">
  <article class="prosa muncul" id="sejarah">
    <h2>Sejarah</h2>
    ${raw(s.sejarahHtml ?? '')}
    ${s.visi ? html`<h2 id="visi">Visi</h2><p class="kutipan">${s.visi}</p>` : ''}
    ${s.misi?.length ? html`<h2 id="misi">Misi</h2><ol>${s.misi.map((m) => html`<li>${m}</li>`)}</ol>` : ''}
    ${s.sambutan ? html`<h2 id="sambutan">Sambutan ${s.sambutan.jabatan}</h2>${raw(s.sambutan.isiHtml ?? '')}<p><strong>${s.sambutan.nama}</strong></p>` : ''}
  </article>
  <aside class="samping">
    <div class="panel muncul" id="legalitas">
      <h2>Legalitas</h2>
      <dl class="rinci">
        <dt>Nama badan hukum</dt><dd>${s.nama}</dd>
        <dt>Akta pendirian</dt><dd>No. ${s.legal.akta.nomor}, ${tanggal(s.legal.akta.tanggal)}<br><small>${s.legal.akta.notaris}</small></dd>
        <dt>Pengesahan badan hukum</dt><dd>SK Menkumham No. ${s.legal.sk.nomor}<br><small>${tanggal(s.legal.sk.tanggal)}</small></dd>
        ${s.legal.daftar ? html`<dt>Daftar yayasan</dt><dd>No. ${s.legal.daftar}</dd>` : ''}
        ${s.legal.npwp ? html`<dt>NPWP</dt><dd>${s.legal.npwp}${s.legal.kpp ? html`<br><small>${s.legal.kpp}</small>` : ''}</dd>` : ''}
        <dt>Kedudukan</dt><dd>${alamatLengkap(s)}</dd>
      </dl>
    </div>
    ${s.pendiri.length ? html`<div class="panel muncul"><h2>Pendiri</h2><ul class="daftar-nama">${s.pendiri.map((p) => html`<li>${p}</li>`)}</ul></div>` : ''}
  </aside>
</div></section>
${organ.length ? html`<section class="bagian bagian-gading" id="organ"><div class="wadah">
  ${kepalaBagian('Organ yayasan', 'Pembina, pengurus, dan pengawas', s.organCatatan)}
  <div class="organ">${organ.map((g) => html`<div class="organ-kol muncul"><h3>${g.o}</h3><ul>${g.list.map((x) => html`<li><strong>${x.nama}</strong><span>${x.jabatan}</span></li>`)}</ul></div>`)}</div>
</div></section>` : ''}
${linimasa(s)}`;
}

export function lembagaIndexPage(s: Situs, units: UnitItem[]): Raw {
  return html`${kepalaHalaman(`Lembaga di bawah ${s.nama}`, `${units.length} lembaga dalam lima bidang: sarana ibadah, pendidikan formal, pendidikan nonformal, ekonomi, dan sosial.`, [['Lembaga', '/lembaga']], 'Lembaga')}
${URUTAN_KELOMPOK.filter((k) => units.some((u) => u.kelompok === k)).map((k, i) => html`<section class="bagian${i % 2 ? ' bagian-gading' : ''}" id="${k}"><div class="wadah">
  ${kepalaBagian(`Bidang ${i + 1}`, KELOMPOK[k].nama, KELOMPOK[k].ringkas)}
  <div class="kisi-unit">${units.filter((u) => u.kelompok === k).map(kartuUnit)}</div>
</div></section>`)}`;
}

const tautSosmed = (label: string, url?: string): Raw => (url ? html`<a class="pil" href="${url}" target="_blank" rel="noopener">${label}</a>` : raw(''));

export function unitPage(u: Unit, sebidang: UnitItem[]): Raw {
  const k = KELOMPOK[u.kelompok as Kelompok];
  const fakta: [string, string][] = [];
  if (u.berdiri) fakta.push(['Berdiri', u.berdiri]);
  if (u.pendiri) fakta.push(['Pendiri', u.pendiri]);
  if (u.kepala) fakta.push([u.kepala.jabatan, u.kepala.nama]);
  if (u.jadwal) fakta.push(['Waktu belajar', u.jadwal]);
  if (u.kurikulum) fakta.push(['Kurikulum', u.kurikulum]);
  if (u.alamat) fakta.push(['Alamat', u.alamat]);
  const ko = u.kontak ?? {};
  const so = u.sosmed ?? {};
  const adaKontak = Boolean(ko.telepon || ko.wa || ko.email || so.youtube || so.facebook || so.instagram || so.tiktok || so.situs);
  return html`${kepalaHalaman(u.nama, u.ringkas, [['Lembaga', '/lembaga'], [k.nama, `/lembaga#${u.kelompok}`], [u.singkat, `/lembaga/${u.slug}`]], `${k.nama} · ${u.jenis}`)}
${u.angka?.length ? html`<section class="angka angka-unit" aria-label="${u.singkat} dalam angka"><div class="wadah angka-isi">${u.angka.map((a) => html`<div class="angka-butir muncul"><strong data-hitung="${a.nilai}">${a.nilai}</strong><span>${a.label}</span></div>`)}</div></section>` : ''}
<section class="bagian"><div class="wadah dua-kolom">
  <article class="prosa muncul">
    <h2 id="profil">Profil</h2>
    ${raw(u.profilHtml ?? '')}
    ${u.sejarahHtml ? html`<h2 id="sejarah">Sejarah</h2>${raw(u.sejarahHtml)}` : ''}
    ${u.visi ? html`<h2 id="visi">Visi</h2><p class="kutipan">${u.visi}</p>` : ''}
    ${u.misi?.length ? html`<h2 id="misi">Misi</h2><ol>${u.misi.map((m) => html`<li>${m}</li>`)}</ol>` : ''}
  </article>
  <aside class="samping">
    ${fakta.length ? html`<div class="panel muncul"><h2>Sekilas</h2><dl class="rinci">${fakta.map(([l, v]) => html`<dt>${l}</dt><dd>${v}</dd>`)}</dl></div>` : ''}
    ${u.program?.length ? html`<div class="panel muncul"><h2>Program unggulan</h2><ul class="centang">${u.program.map((p) => html`<li>${p}</li>`)}</ul></div>` : ''}
    ${u.kelas?.length ? html`<div class="panel muncul"><h2>Kelas</h2><p class="pil-baris">${u.kelas.map((p) => html`<span class="pil">${p}</span>`)}</p></div>` : ''}
    ${u.fasilitas?.length ? html`<div class="panel muncul"><h2>Sarana</h2><ul class="centang">${u.fasilitas.map((p) => html`<li>${p}</li>`)}</ul></div>` : ''}
    ${adaKontak ? html`<div class="panel muncul"><h2>Kontak & media sosial</h2><p class="pil-baris">
      ${ko.wa ? html`<a class="pil" href="https://wa.me/${ko.wa.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}
      ${ko.telepon ? html`<a class="pil" href="tel:${ko.telepon.replace(/[^\d+]/g, '')}">${icon('telepon')}${ko.telepon}</a>` : ''}
      ${ko.email ? html`<a class="pil" href="mailto:${ko.email}">${icon('surat')}${ko.email}</a>` : ''}
      ${tautSosmed('YouTube', so.youtube)}${tautSosmed('Facebook', so.facebook)}${tautSosmed('Instagram', so.instagram)}${tautSosmed('TikTok', so.tiktok)}${tautSosmed('Situs', so.situs)}
    </p></div>` : ''}
  </aside>
</div></section>
${sebidang.length ? html`<section class="bagian bagian-gading"><div class="wadah">
  ${kepalaBagian(k.nama, `Lembaga lain di bidang ${k.nama.toLowerCase()}`)}
  <div class="kisi-unit">${sebidang.map(kartuUnit)}</div>
</div></section>` : ''}`;
}

export function donasiPage(s: Situs): Raw {
  return html`${kepalaHalaman('Donasi', `Salurkan infak, sedekah, dan wakaf Anda melalui rekening resmi ${s.nama}.`, [['Donasi', '/donasi']], 'Berbagi')}
<section class="bagian"><div class="wadah sempit">
  <div class="rekening">${s.donasi.rekening.map((r) => html`<div class="rekening-kartu muncul" data-miring>
    <p class="rekening-bank">${r.bank}</p>
    <p class="rekening-nomor" data-salin-teks>${r.nomor}</p>
    <p class="rekening-nama">a.n. ${r.atasNama}</p>
    <button class="tbl tbl-emas tbl-kecil" type="button" data-salin="${r.nomor}">Salin nomor rekening</button>
  </div>`)}</div>
  ${s.donasi.catatan ? html`<p class="catatan muncul">${s.donasi.catatan}</p>` : ''}
  <div class="prosa muncul"><h2>Ke mana donasi disalurkan</h2><p>Donasi menopang kegiatan lembaga-lembaga di bawah yayasan: sarana ibadah, pendidikan, dan layanan sosial. Kabar penyaluran diumumkan pengurus melalui situs ini.</p></div>
</div></section>`;
}

export function kontakPage(s: Situs): Raw {
  const peta = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.nama}, ${s.alamat.desa}, ${s.alamat.kecamatan}, ${s.alamat.kabupaten}`)}`;
  const so = s.sosmed;
  return html`${kepalaHalaman('Kontak', `Alamat dan cara menghubungi ${s.nama}.`, [['Kontak', '/kontak']], 'Hubungi kami')}
<section class="bagian"><div class="wadah sempit">
  <div class="panel muncul">
    <h2>Alamat</h2>
    <p>${alamatLengkap(s)}</p>
    <p class="pil-baris"><a class="pil" href="${peta}" target="_blank" rel="noopener">${icon('pin')}Buka di Google Maps</a>
      ${s.kontak.wa ? html`<a class="pil" href="https://wa.me/${s.kontak.wa.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}
      ${s.kontak.telepon ? html`<a class="pil" href="tel:${s.kontak.telepon.replace(/[^\d+]/g, '')}">${icon('telepon')}${s.kontak.telepon}</a>` : ''}
      ${s.kontak.email ? html`<a class="pil" href="mailto:${s.kontak.email}">${icon('surat')}${s.kontak.email}</a>` : ''}
      ${tautSosmed('YouTube', so.youtube)}${tautSosmed('Facebook', so.facebook)}${tautSosmed('Instagram', so.instagram)}${tautSosmed('TikTok', so.tiktok)}
    </p>
  </div>
  <div class="panel muncul"><h2>Menghubungi lembaga</h2><p>Setiap lembaga mencantumkan kontaknya sendiri di halaman profilnya. Pilih lembaganya di <a href="/lembaga">daftar lembaga</a>.</p></div>
</div></section>`;
}

export function halamanPage(h: Halaman): Raw {
  return html`${kepalaHalaman(h.judul, h.ringkas, [[h.judul, `/h/${h.slug}`]])}
<section class="bagian"><div class="wadah sempit"><article class="prosa muncul">${raw(h.isiHtml)}<p class="diperbarui">Diperbarui ${tanggal(h.ubah)}</p></article></div></section>`;
}

export function tidakAdaPage(): Raw {
  return html`<section class="kepala-hal kepala-hal-tinggi"><div class="pola-bintang" aria-hidden="true"></div><div class="wadah tengah">
    <p class="angka-404" aria-hidden="true">404</p>
    <h1>Halaman tidak ditemukan</h1>
    <p class="lead">Alamat yang Anda buka tidak ada atau sudah dipindahkan.</p>
    <p class="hero-aksi tengah"><a class="tbl tbl-emas" href="/">Ke beranda</a><a class="tbl tbl-kaca" href="/lembaga">Daftar lembaga</a></p>
  </div></section>`;
}
