/** Halaman publik isi lembaga: kabar, galeri, video & siaran langsung, agenda, dokumen, karya tulis, PPDB, struktur & guru. */
import { html, raw, type Raw } from '../lib/html.ts';
import type { Dok, FotoGaleri, IxItem } from '../data/koleksi.ts';
import type { UnitItem } from '../data/site.ts';
import { NAMA_GOLONGAN, KABAR, DOKUMEN, KARYA, PENDAFTAR } from '../data/defs.ts';
import { kenaliVideo, NAMA_LAYANAN } from '../lib/video.ts';
import type { VideoKanal } from '../data/yt.ts';
import { hariIni, tanggal } from '../lib/text.ts';
import { hiasan, icon } from './layout.ts';
import { kepalaHalaman } from './public.ts';

export type Media = (f: string | undefined | null) => string;
export interface Ctx { media: Media; kecil: (f: string | undefined | null) => string; units: UnitItem[] }

export const namaUnit = (x: Ctx, slug: string) => (slug === 'yayasan' ? 'Yayasan' : x.units.find((u) => u.slug === slug)?.singkat ?? slug);
const tautUnit = (x: Ctx, slug: string): Raw => (slug === 'yayasan' ? html`<a href="/profil">Yayasan</a>` : html`<a href="/lembaga/${slug}">${namaUnit(x, slug)}</a>`);
const label = (pilihan: [string, string][] | undefined, k: unknown) => (pilihan ?? []).find(([a]) => a === k)?.[1] ?? '';

export const kepalaBagian = (kicker: string, judul: string, lead?: string): Raw => html`<header class="bagian-kepala muncul"><p class="kicker">${kicker}</p><h2>${judul}</h2>${lead ? html`<p class="lead">${lead}</p>` : ''}${hiasan}</header>`;

/** Gambar pengganti bermotif bila isi tidak punya foto. */
const polaKosong = (teks: string): Raw => html`<span class="gbr-kosong" aria-hidden="true"><span>${teks.replace(/^(H\.|Hj\.|Dr\.|KH\.|Ust\.)\s+/i, '').slice(0, 1).toUpperCase()}</span></span>`;

function saringUnit(x: Ctx, dasar: string, pilih: string, ada: Set<string>): Raw {
  const opsi = [{ slug: '', nama: 'Semua' }, ...(ada.has('yayasan') ? [{ slug: 'yayasan', nama: 'Yayasan' }] : []), ...x.units.filter((u) => ada.has(u.slug)).map((u) => ({ slug: u.slug, nama: u.singkat }))];
  if (opsi.length <= 2) return raw('');
  return html`<nav class="saring saring-taut" aria-label="Saring menurut lembaga">${opsi.map((o) => html`<a class="saring-tbl" href="${dasar}${o.slug ? `?lembaga=${o.slug}` : ''}"${raw(o.slug === pilih ? ' aria-current="true"' : '')}>${o.nama}</a>`)}</nav>`;
}

/* ── kabar ─────────────────────────────────────────────────────────────── */

export function kartuKabar(x: Ctx, it: IxItem): Raw {
  return html`<a class="kartu-isi muncul" href="/kabar/${it.sl}" data-miring>
    <span class="kartu-isi-gbr">${it.g ? html`<img src="${x.media(x.kecil(it.g))}" alt="" loading="lazy" decoding="async">` : polaKosong(it.j)}</span>
    <span class="kartu-isi-teks"><span class="kartu-meta"><b>${label(KABAR.bidang[0]!.pilihan, it.x?.kategori) || 'Kabar'}</b> · ${namaUnit(x, it.u)} · ${tanggal(it.t)}</span><strong>${it.j}</strong>${it.r ? html`<span class="kartu-isi-ringkas">${it.r}</span>` : ''}</span>
  </a>`;
}

export function kabarIndex(x: Ctx, items: IxItem[], pilih: string, ada: Set<string>): Raw {
  return html`${kepalaHalaman('Kabar & Kegiatan', 'Kegiatan, prestasi, pengumuman, dan kajian dari seluruh lembaga Yayasan Al-Huda Yapida.', [['Kabar', '/kabar']], 'Dari lembaga kami')}
<section class="bagian"><div class="wadah">${saringUnit(x, '/kabar', pilih, ada)}
  ${items.length ? html`<div class="kisi-isi">${items.map((it) => kartuKabar(x, it))}</div>` : html`<p class="kosong-teks muncul">Belum ada kabar${pilih ? ' dari lembaga ini' : ''}. Kabar ditulis admin setiap lembaga melalui portal.</p>`}
</div></section>`;
}

function tombolDengar(): Raw {
  return html`<div class="dengar muncul" data-dengar><button class="tbl tbl-emas tbl-kecil" type="button" data-dengar-putar>${icon('surya')}<span>Dengarkan</span></button><span class="p-kecil" data-dengar-status>Dibacakan suara perangkat Anda — Arab dengan suara Arab, Inggris dengan suara Inggris.</span></div>`;
}

export function kabarDetail(x: Ctx, d: Dok, terkait: IxItem[]): Raw {
  const sampul = typeof d.d.sampul === 'string' ? d.d.sampul : '';
  return html`${kepalaHalaman(d.judul, String(d.d.ringkasan ?? ''), [['Kabar', '/kabar'], [d.judul.slice(0, 40), `/kabar/${d.slug}`]], `${label(KABAR.bidang[0]!.pilihan, d.d.kategori)} · ${namaUnit(x, d.unit)}`)}
<section class="bagian"><div class="wadah sempit">
  <p class="artikel-meta muncul">${tautUnit(x, d.unit)} · ${tanggal(d.tanggal, true)} · ditulis ${d.penulisNama}</p>
  ${sampul ? html`<figure class="artikel-sampul muncul"><img src="${x.media(sampul)}" alt="${d.judul}" decoding="async"></figure>` : ''}
  ${tombolDengar()}
  <article class="prosa muncul" data-baca-isi>${raw(d.html.isi ?? '')}</article>
</div></section>
${terkait.length ? html`<section class="bagian bagian-gading"><div class="wadah">${kepalaBagian('Baca juga', 'Kabar lainnya')}<div class="kisi-isi">${terkait.map((it) => kartuKabar(x, it))}</div></div></section>` : ''}`;
}

/* ── galeri ────────────────────────────────────────────────────────────── */

export function kartuAlbum(x: Ctx, it: IxItem): Raw {
  return html`<a class="kartu-album muncul" href="/galeri/${it.sl}" data-miring>
    <span class="kartu-album-gbr">${it.g ? html`<img src="${x.media(x.kecil(it.g))}" alt="" loading="lazy" decoding="async">` : polaKosong(it.j)}</span>
    <span class="kartu-album-teks"><strong>${it.j}</strong><span>${namaUnit(x, it.u)} · ${tanggal(it.t)}</span></span>
  </a>`;
}

export function galeriIndex(x: Ctx, items: IxItem[], pilih: string, ada: Set<string>): Raw {
  return html`${kepalaHalaman('Galeri Kegiatan', 'Foto kegiatan santri, guru, dan jamaah dari setiap lembaga Yayasan Al-Huda Yapida.', [['Galeri', '/galeri']], 'Galeri foto')}
<section class="bagian"><div class="wadah">${saringUnit(x, '/galeri', pilih, ada)}
  ${items.length ? html`<div class="kisi-album">${items.map((it) => kartuAlbum(x, it))}</div>` : html`<p class="kosong-teks muncul">Belum ada album foto. Album diunggah admin setiap lembaga melalui portal.</p>`}
</div></section>`;
}

export function galeriDetail(x: Ctx, d: Dok): Raw {
  const foto = (Array.isArray(d.d.foto) ? d.d.foto : []) as FotoGaleri[];
  return html`${kepalaHalaman(d.judul, String(d.d.ket ?? `${foto.length} foto kegiatan ${namaUnit(x, d.unit)}.`), [['Galeri', '/galeri'], [d.judul.slice(0, 40), `/galeri/${d.slug}`]], `${namaUnit(x, d.unit)} · ${tanggal(d.tanggal)}${d.d.tempat ? ` · ${String(d.d.tempat)}` : ''}`)}
<section class="bagian"><div class="wadah">
  <div class="kisi-foto" data-lightbox>${foto.map((p, i) => html`<a class="foto-butir muncul" href="${x.media(p.f)}" data-indeks="${i}" data-ket="${p.ket ?? ''}"><img src="${x.media(p.k ?? x.kecil(p.f))}" alt="${p.ket ?? `${d.judul} — foto ${i + 1}`}" loading="lazy" decoding="async">${p.ket ? html`<span>${p.ket}</span>` : ''}</a>`)}</div>
  <p class="artikel-meta">${tautUnit(x, d.unit)} · <a href="/galeri">Semua album</a></p>
</div></section>`;
}

/* ── video & siaran langsung ───────────────────────────────────────────── */

export function pemutar(url: string, judul: string, gambar?: string): Raw {
  const v = kenaliVideo(url);
  if (!v) return html`<a class="pemutar pemutar-taut" href="${url}" target="_blank" rel="noopener"><span>${judul}</span><b>Buka video ↗</b></a>`;
  if (!v.embed) return html`<a class="pemutar pemutar-taut" href="${v.asli}" target="_blank" rel="noopener"><span>${judul}</span><b>Tonton di ${NAMA_LAYANAN[v.layanan]} ↗</b></a>`;
  const g = gambar ?? v.gambar;
  // Iframe disiapkan server di <template>; skrip hanya menyalin simpulnya saat tombol putar ditekan.
  return html`<div class="pemutar${v.tegak ? ' pemutar-tegak' : ''}" data-pemutar data-layanan="${v.layanan}">
    <template><iframe src="${v.embed}" title="Pemutar video: ${judul}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></template>
    ${g ? html`<img src="${g}" alt="" loading="lazy" decoding="async">` : html`<span class="pemutar-pola" aria-hidden="true"></span>`}
    <button class="pemutar-putar" type="button" aria-label="Putar: ${judul}"><span aria-hidden="true">▶</span></button>
    <span class="pemutar-layanan">${NAMA_LAYANAN[v.layanan]}</span>
    <a class="pemutar-asli" href="${v.asli}" target="_blank" rel="noopener">Buka di ${NAMA_LAYANAN[v.layanan]} ↗</a>
  </div>`;
}

export function kartuVideo(x: Ctx, o: { judul: string; url: string; unit: string; tanggal?: string; ket?: string; live?: boolean }): Raw {
  return html`<figure class="kartu-video muncul">${pemutar(o.url, o.judul)}<figcaption>${o.live ? html`<b class="lencana-live">LIVE</b> ` : ''}<strong>${o.judul}</strong><span>${tautUnit(x, o.unit)}${o.tanggal ? html` · ${tanggal(o.tanggal)}` : ''}</span>${o.ket ? html`<small>${o.ket}</small>` : ''}</figcaption></figure>`;
}

export function videoPage(x: Ctx, o: { live?: { url: string; judul: string }; items: IxItem[]; kanal: { unit: string; video: VideoKanal[] }[] }): Raw {
  const liveItems = o.items.filter((it) => it.x?.jenis === 'live');
  const biasa = o.items.filter((it) => it.x?.jenis !== 'live');
  const dariKanal = o.kanal.flatMap((k) => k.video.map((v) => ({ ...v, unit: k.unit }))).sort((a, b) => (a.terbit < b.terbit ? 1 : -1)).slice(0, 24);
  return html`${kepalaHalaman('Video & Siaran Langsung', 'Video kegiatan dan siaran langsung pengajian, wisuda, dan peringatan hari besar dari lembaga-lembaga Yapida.', [['Video', '/video']], 'YouTube · Facebook · TikTok')}
<section class="bagian" id="live"><div class="wadah">
  ${o.live ? html`<div class="live-utama muncul"><p class="kicker kicker-merah"><b class="lencana-live">LIVE</b> Sedang berlangsung</p><h2>${o.live.judul || 'Siaran langsung'}</h2>${pemutar(o.live.url, o.live.judul || 'Siaran langsung')}</div>` : ''}
  ${liveItems.length ? html`${kepalaBagian('Siaran langsung', 'Jadwal & rekaman siaran')}<div class="kisi-video">${liveItems.map((it) => kartuVideo(x, { judul: it.j, url: String(it.x?.url ?? ''), unit: it.u, tanggal: String(it.x?.mulai ?? it.t).slice(0, 10), ket: it.r, live: true }))}</div>` : ''}
  ${biasa.length ? html`${kepalaBagian('Video kegiatan', 'Dokumentasi kegiatan')}<div class="kisi-video">${biasa.map((it) => kartuVideo(x, { judul: it.j, url: String(it.x?.url ?? ''), unit: it.u, tanggal: it.t, ket: it.r }))}</div>` : ''}
  ${dariKanal.length ? html`${kepalaBagian('Dari kanal YouTube lembaga', 'Unggahan terbaru')}<div class="kisi-video">${dariKanal.map((v) => kartuVideo(x, { judul: v.judul, url: `https://www.youtube.com/watch?v=${v.id}`, unit: v.unit, tanggal: v.terbit }))}</div>` : ''}
  ${!o.live && !o.items.length && !dariKanal.length ? html`<p class="kosong-teks muncul">Belum ada video. Admin lembaga menambahkannya cukup dengan menempelkan tautan YouTube, Facebook, atau TikTok di portal.</p>` : ''}
</div></section>`;
}

/* ── agenda ────────────────────────────────────────────────────────────── */

const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export function butirAgenda(x: Ctx, it: IxItem): Raw {
  const [y, m, dd] = it.t.split('-');
  return html`<li class="agenda-butir muncul" id="${it.sl}"><span class="agenda-tgl"><b>${Number(dd)}</b><i>${BLN[Number(m) - 1] ?? ''} ${y}</i></span><span class="agenda-teks"><strong>${it.j}</strong><span>${it.x?.jam ? html`${String(it.x.jam)} · ` : ''}${it.x?.tempat ? html`${String(it.x.tempat)} · ` : ''}${tautUnit(x, it.u)}</span>${it.r ? html`<small>${it.r}</small>` : ''}</span></li>`;
}

export function agendaPage(x: Ctx, items: IxItem[], pilih: string, ada: Set<string>): Raw {
  const kini = hariIni();
  const datang = items.filter((it) => it.t >= kini).sort((a, b) => (a.t < b.t ? -1 : 1));
  const lalu = items.filter((it) => it.t < kini);
  return html`${kepalaHalaman('Agenda Kegiatan', 'Jadwal pengajian, ujian, wisuda, PPDB, dan kegiatan lain di lingkungan Yayasan Al-Huda Yapida.', [['Agenda', '/agenda']], 'Agenda')}
<section class="bagian"><div class="wadah sempit">${saringUnit(x, '/agenda', pilih, ada)}
  <h2 class="judul-kecil">Akan datang</h2>
  ${datang.length ? html`<ol class="agenda">${datang.map((it) => butirAgenda(x, it))}</ol>` : html`<p class="kosong-teks">Belum ada agenda yang akan datang.</p>`}
  ${lalu.length ? html`<h2 class="judul-kecil">Sudah berlangsung</h2><ol class="agenda agenda-lalu">${lalu.slice(0, 30).map((it) => butirAgenda(x, it))}</ol>` : ''}
</div></section>`;
}

/* ── dokumen ───────────────────────────────────────────────────────────── */

export function dokumenPage(x: Ctx, items: IxItem[], pilih: string, ada: Set<string>): Raw {
  const jenis = DOKUMEN.bidang.find((b) => b.k === 'jenis')!.pilihan!;
  return html`${kepalaHalaman('Dokumen Publik', 'Legalitas, akreditasi, brosur, kurikulum, dan laporan yang boleh dibaca umum.', [['Dokumen', '/dokumen']], 'Keterbukaan informasi')}
<section class="bagian"><div class="wadah sempit">${saringUnit(x, '/dokumen', pilih, ada)}
  ${items.length ? jenis.map(([k, l]) => {
    const isi = items.filter((it) => it.x?.jenis === k);
    return isi.length ? html`<h2 class="judul-kecil">${l}</h2><ul class="dokumen">${isi.map((it) => html`<li class="muncul" id="${it.sl}"><a href="${x.media(String(it.x?.berkas ?? ''))}" target="_blank" rel="noopener"><span class="dok-ikon" aria-hidden="true">PDF</span><span><strong>${it.j}</strong><small>${namaUnit(x, it.u)} · ${tanggal(it.t)}${it.r ? ` · ${it.r}` : ''}</small></span></a></li>`)}</ul>` : '';
  }) : html`<p class="kosong-teks muncul">Belum ada dokumen yang dipublikasikan.</p>`}
</div></section>`;
}

/* ── karya tulis ───────────────────────────────────────────────────────── */

export function kartuKarya(x: Ctx, it: IxItem): Raw {
  return html`<a class="kartu-karya muncul" href="/karya/${it.sl}" data-miring>
    <span class="kartu-karya-jenis">${label(KARYA.bidang.find((b) => b.k === 'jenis')!.pilihan, it.x?.jenis) || 'Karya'}</span>
    <strong>${it.j}</strong>
    <span class="kartu-karya-oleh">${String(it.x?.penulis ?? '')}${it.x?.kelas ? ` · ${String(it.x.kelas)}` : ''}</span>
    ${it.r ? html`<span class="kartu-isi-ringkas">${it.r}</span>` : ''}
    <span class="kartu-meta">${namaUnit(x, it.u)} · ${tanggal(it.t)}</span>
  </a>`;
}

export function karyaIndex(x: Ctx, items: IxItem[], pilih: string, ada: Set<string>): Raw {
  return html`${kepalaHalaman('Karya Tulis', 'Cerpen, puisi, artikel, esai, dan kajian karya santri, siswa, guru, dan lembaga di bawah Yayasan Al-Huda Yapida.', [['Karya Tulis', '/karya']], 'Pojok literasi')}
<section class="bagian"><div class="wadah">${saringUnit(x, '/karya', pilih, ada)}
  ${items.length ? html`<div class="kisi-karya">${items.map((it) => kartuKarya(x, it))}</div>` : html`<p class="kosong-teks muncul">Belum ada karya tulis. Karya diunggah admin setiap lembaga melalui portal.</p>`}
</div></section>`;
}

export function karyaDetail(x: Ctx, d: Dok, suara: string): Raw {
  const sampul = typeof d.d.sampul === 'string' ? d.d.sampul : '';
  return html`${kepalaHalaman(d.judul, `${label(KARYA.bidang.find((b) => b.k === 'jenis')!.pilihan, d.d.jenis)} karya ${String(d.d.penulis ?? '')}${d.d.kelas ? `, ${String(d.d.kelas)}` : ''} — ${namaUnit(x, d.unit)}.`, [['Karya Tulis', '/karya'], [d.judul.slice(0, 40), `/karya/${d.slug}`]], 'Karya tulis')}
<section class="bagian"><div class="wadah sempit">
  <p class="artikel-meta muncul">Oleh <strong>${String(d.d.penulis ?? '')}</strong>${d.d.kelas ? html` · ${String(d.d.kelas)}` : ''} · ${tautUnit(x, d.unit)} · ${tanggal(d.tanggal)}</p>
  ${sampul ? html`<figure class="artikel-sampul muncul"><img src="${x.media(sampul)}" alt="" decoding="async"></figure>` : ''}
  ${tombolDengar()}
  <article class="prosa prosa-karya muncul" data-baca-isi data-suara="${suara}">${raw(d.html.isi ?? '')}</article>
</div></section>`;
}

/* ── PPDB ──────────────────────────────────────────────────────────────── */

export const ppdbBuka = (it: Pick<IxItem, 'x'>, kini = hariIni()) => String(it.x?.buka ?? '') <= kini && kini <= String(it.x?.tutup ?? '');

export function kartuPpdb(x: Ctx, it: IxItem): Raw {
  const kini = hariIni();
  const status = ppdbBuka(it, kini) ? html`<b class="ppdb-status ppdb-buka">Pendaftaran dibuka</b>` : String(it.x?.buka ?? '') > kini ? html`<b class="ppdb-status ppdb-segera">Dibuka ${tanggal(String(it.x?.buka))}</b>` : html`<b class="ppdb-status ppdb-tutup">Ditutup</b>`;
  return html`<a class="kartu-ppdb muncul" href="/ppdb/${it.sl}" data-miring>
    ${it.g ? html`<span class="kartu-ppdb-gbr"><img src="${x.media(x.kecil(it.g))}" alt="" loading="lazy"></span>` : ''}
    <span class="kartu-ppdb-teks">${status}<strong>${it.j}</strong><span>${namaUnit(x, it.u)} · Tahun ajaran ${String(it.x?.tahun ?? '')}</span>
    <span class="kartu-meta">${tanggal(String(it.x?.buka ?? ''))} – ${tanggal(String(it.x?.tutup ?? ''))}${it.x?.kuota ? ` · kuota ${String(it.x.kuota)}` : ''}</span>${it.r ? html`<span class="kartu-isi-ringkas">${it.r}</span>` : ''}</span>
  </a>`;
}

export function ppdbIndex(x: Ctx, items: IxItem[]): Raw {
  const kini = hariIni();
  const aktif = items.filter((it) => String(it.x?.tutup ?? '') >= kini);
  const lalu = items.filter((it) => String(it.x?.tutup ?? '') < kini);
  return html`${kepalaHalaman('Penerimaan Murid Baru', 'PPDB RA, MI, MTs, pondok pesantren, TPQ, dan lembaga lain di bawah Yayasan Al-Huda Yapida — tahun ajaran 2027/2028 dan seterusnya.', [['PPDB', '/ppdb']], 'PPDB')}
<section class="bagian"><div class="wadah">
  ${aktif.length ? html`<div class="kisi-ppdb">${aktif.map((it) => kartuPpdb(x, it))}</div>` : html`<div class="kosong-teks muncul"><p>Belum ada gelombang pendaftaran yang dibuka. Jadwal PPDB tiap lembaga diumumkan di sini begitu panitia menetapkannya.</p><p><a class="tbl tbl-garis" href="/lembaga">Lihat lembaga</a></p></div>`}
  ${lalu.length ? html`<h2 class="judul-kecil">Gelombang sebelumnya</h2><div class="kisi-ppdb">${lalu.map((it) => kartuPpdb(x, it))}</div>` : ''}
</div></section>`;
}

export function ppdbDetail(x: Ctx, d: Dok, o: { galat?: Record<string, string>; isian?: Record<string, unknown>; terkirim?: string }): Raw {
  const kini = hariIni();
  const buka = String(d.d.buka ?? '') <= kini && kini <= String(d.d.tutup ?? '');
  const sampul = typeof d.d.sampul === 'string' ? d.d.sampul : '';
  const v = (k: string) => String(o.isian?.[k] ?? '');
  const g = o.galat ?? {};
  const f = (k: string, lab: string, kontrol: Raw) => html`<label class="p-bidang${g[k] ? ' p-bidang-galat' : ''}"><span>${lab}</span>${kontrol}${g[k] ? html`<small class="p-galat">${g[k]}</small>` : ''}</label>`;
  const formulir = html`<form method="post" action="/ppdb/${d.slug}#daftar" class="formulir p-form" id="daftar">
    <h2>Formulir pendaftaran</h2>
    ${Object.keys(g).length ? html`<p class="p-kilat p-kilat-galat" role="alert">Periksa kembali isian yang ditandai.</p>` : ''}
    ${f('nama', 'Nama lengkap calon murid *', html`<input name="nama" value="${v('nama')}" required maxlength="160" autocomplete="off">`)}
    <div class="p-baris">${f('kelamin', 'Jenis kelamin *', html`<select name="d_kelamin" required><option value="">— pilih —</option><option value="L"${raw(v('kelamin') === 'L' ? ' selected' : '')}>Laki-laki</option><option value="P"${raw(v('kelamin') === 'P' ? ' selected' : '')}>Perempuan</option></select>`)}
    ${f('tempatLahir', 'Tempat lahir *', html`<input name="d_tempatLahir" value="${v('tempatLahir')}" required maxlength="80">`)}${f('tanggalLahir', 'Tanggal lahir *', html`<input type="date" name="d_tanggalLahir" value="${v('tanggalLahir')}" required>`)}</div>
    ${f('asal', 'Asal sekolah (bila ada)', html`<input name="d_asal" value="${v('asal')}" maxlength="120">`)}
    <div class="p-baris">${f('wali', 'Nama orang tua / wali *', html`<input name="d_wali" value="${v('wali')}" required maxlength="100" autocomplete="name">`)}${f('telepon', 'Nomor WhatsApp *', html`<input type="tel" name="d_telepon" value="${v('telepon')}" required maxlength="20" inputmode="tel" autocomplete="tel">`)}</div>
    ${f('alamat', 'Alamat lengkap *', html`<textarea name="d_alamat" rows="3" required maxlength="400">${v('alamat')}</textarea>`)}
    ${f('catatan', 'Catatan (opsional)', html`<textarea name="d_catatan" rows="2" maxlength="1000">${v('catatan')}</textarea>`)}
    <label class="jebakan" aria-hidden="true">Jangan diisi <input name="situsweb" tabindex="-1" autocomplete="off"></label>
    <p class="p-kecil">Data hanya dibaca panitia ${namaUnit(x, d.unit)} dan pengurus yayasan untuk keperluan pendaftaran.</p>
    <button class="tbl tbl-emas" type="submit">Kirim pendaftaran</button>
  </form>`;
  return html`${kepalaHalaman(d.judul, String(d.d.ringkasan ?? ''), [['PPDB', '/ppdb'], [d.judul.slice(0, 40), `/ppdb/${d.slug}`]], `${namaUnit(x, d.unit)} · Tahun ajaran ${String(d.d.tahun ?? '')}`)}
<section class="bagian"><div class="wadah dua-kolom">
  <article class="prosa muncul">
    ${o.terkirim ? html`<div class="terkirim" role="status"><h2>Pendaftaran terkirim ✓</h2><p>Terima kasih. Nomor pendaftaran <strong>${o.terkirim}</strong>. Panitia akan menghubungi nomor WhatsApp yang Anda tulis.</p></div>` : ''}
    ${sampul ? html`<figure><img src="${x.media(sampul)}" alt="" decoding="async"></figure>` : ''}
    ${Array.isArray(d.d.syarat) && d.d.syarat.length ? html`<h2>Persyaratan</h2><ul>${(d.d.syarat as string[]).map((s) => html`<li>${s}</li>`)}</ul>` : ''}
    ${Array.isArray(d.d.alur) && d.d.alur.length ? html`<h2>Alur pendaftaran</h2><ol class="alur">${(d.d.alur as string[]).map((s) => html`<li>${s}</li>`)}</ol>` : ''}
    ${d.html.biaya ? html`<h2>Biaya</h2>${raw(d.html.biaya)}` : ''}
    ${d.html.info ? html`<h2>Informasi lain</h2>${raw(d.html.info)}` : ''}
    ${buka && d.d.formulir === true && !o.terkirim ? formulir : ''}
  </article>
  <aside class="samping">
    <div class="panel muncul"><h2>Sekilas</h2><dl class="rinci"><dt>Lembaga</dt><dd>${tautUnit(x, d.unit)}</dd><dt>Tahun ajaran</dt><dd>${String(d.d.tahun ?? '')}</dd><dt>Pendaftaran</dt><dd>${tanggal(String(d.d.buka))} – ${tanggal(String(d.d.tutup))}</dd>${d.d.kuota ? html`<dt>Kuota</dt><dd>${String(d.d.kuota)} murid</dd>` : ''}${d.d.kontak ? html`<dt>Narahubung</dt><dd>${String(d.d.kontak)}</dd>` : ''}</dl>
      ${buka && d.d.formulir === true && !o.terkirim ? html`<a class="tbl tbl-emas" href="#daftar">Daftar sekarang</a>` : html`<p class="p-kecil">${buka ? 'Pendaftaran dilakukan langsung di sekretariat.' : String(d.d.buka ?? '') > kini ? `Pendaftaran dibuka ${tanggal(String(d.d.buka))}.` : 'Pendaftaran gelombang ini sudah ditutup.'}</p>`}
      ${typeof d.d.brosur === 'string' && d.d.brosur ? html`<p><a class="tbl tbl-garis tbl-kecil" href="${x.media(d.d.brosur)}" target="_blank" rel="noopener">Unduh brosur (PDF)</a></p>` : ''}
      ${buka ? html`<div class="mundur-mini" data-mundur-sampai="${String(d.d.tutup)}T23:59:59+07:00"><span>Ditutup dalam</span><b data-mundur-teks>—</b></div>` : ''}
    </div>
  </aside>
</div></section>`;
}
export const BIDANG_DAFTAR = PENDAFTAR.bidang.filter((b) => b.k !== 'tahap' && b.k !== 'ppdb').map((b) => b.k);

/* ── struktur & guru ───────────────────────────────────────────────────── */

export function kartuOrang(x: Ctx, it: IxItem, tampilUnit = false): Raw {
  return html`<a class="kartu-orang muncul" href="/sdm/${it.sl}" data-miring>
    <span class="kartu-orang-foto">${it.g ? html`<img src="${x.media(x.kecil(it.g))}" alt="" loading="lazy" decoding="async">` : polaKosong(it.j)}</span>
    <strong>${it.j}</strong><span class="kartu-orang-jabatan">${String(it.x?.jabatan ?? '')}</span>
    ${it.x?.bidang ? html`<span class="kartu-orang-bidang">${String(it.x.bidang)}</span>` : ''}
    ${tampilUnit ? html`<span class="kartu-orang-unit">${namaUnit(x, it.u)}</span>` : ''}
  </a>`;
}

const URUT_GOL = ['pendiri', 'pembina', 'pengurus', 'pengawas', 'pimpinan', 'guru', 'staf'];
export function kelompokOrang(x: Ctx, items: IxItem[], gol: string[]): Raw {
  return html`${gol.map((g) => {
    const isi = items.filter((it) => it.x?.golongan === g);
    return isi.length ? html`<div class="orang-kelompok"><h3 class="judul-kecil">${NAMA_GOLONGAN[g] ?? g}</h3><div class="kisi-orang">${isi.map((it) => kartuOrang(x, it))}</div></div>` : '';
  })}`;
}

export function strukturPage(x: Ctx, items: IxItem[]): Raw {
  const yay = items.filter((it) => it.u === 'yayasan');
  const unitAda = x.units.filter((u) => items.some((it) => it.u === u.slug));
  return html`${kepalaHalaman('Struktur, Pengurus & Guru', 'Seluruh pengurus yayasan, pimpinan lembaga, guru, ustadz, ustadzah, dan staf Yayasan Al-Huda Yapida — semuanya bagian dari satu keluarga yayasan.', [['Profil', '/profil'], ['Struktur & Guru', '/struktur']], 'Keluarga besar Yapida')}
<section class="bagian"><div class="wadah">
  ${yay.length ? html`${kepalaBagian('Yayasan', 'Pendiri, pembina, pengurus & pengawas')}${kelompokOrang(x, yay, URUT_GOL.slice(0, 4))}` : ''}
</div></section>
${unitAda.map((u, i) => html`<section class="bagian${i % 2 ? '' : ' bagian-gading'}" id="${u.slug}"><div class="wadah">
  ${kepalaBagian(u.jenis, u.nama)}${kelompokOrang(x, items.filter((it) => it.u === u.slug), URUT_GOL.slice(4))}
  <p class="tengah"><a class="tbl tbl-garis tbl-kecil" href="/lembaga/${u.slug}">Profil ${u.singkat} →</a></p>
</div></section>`)}
${!items.length ? html`<section class="bagian"><div class="wadah"><p class="kosong-teks">Data pengurus dan guru sedang dilengkapi oleh admin setiap lembaga.</p></div></section>` : ''}`;
}

export function sdmDetail(x: Ctx, d: Dok): Raw {
  const foto = typeof d.d.foto === 'string' ? d.d.foto : '';
  return html`${kepalaHalaman(d.judul, `${String(d.d.jabatan ?? '')} — ${d.unit === 'yayasan' ? 'Yayasan Al-Huda Yapida' : namaUnit(x, d.unit)}.`, [['Struktur & Guru', '/struktur'], [d.judul.slice(0, 40), `/sdm/${d.slug}`]], NAMA_GOLONGAN[String(d.d.golongan)] ?? '')}
<section class="bagian"><div class="wadah sdm-profil">
  <figure class="sdm-foto muncul">${foto ? html`<img src="${x.media(foto)}" alt="${d.judul}" decoding="async">` : polaKosong(d.judul)}</figure>
  <div class="muncul"><dl class="rinci"><dt>Jabatan</dt><dd>${String(d.d.jabatan ?? '')}</dd><dt>Lembaga</dt><dd>${tautUnit(x, d.unit)}</dd>${d.d.bidang ? html`<dt>Bidang</dt><dd>${String(d.d.bidang)}</dd>` : ''}${d.d.pendidikan ? html`<dt>Pendidikan</dt><dd>${String(d.d.pendidikan)}</dd>` : ''}</dl>
  ${d.html.bio ? html`<div class="prosa">${raw(d.html.bio)}</div>` : ''}<p><a class="tbl tbl-garis tbl-kecil" href="/struktur${d.unit === 'yayasan' ? '' : `#${d.unit}`}">← Struktur & guru</a></p></div>
</div></section>`;
}

export function pendiriPage(x: Ctx, items: IxItem[], sejarahHtml: string): Raw {
  return html`${kepalaHalaman('Para Pendiri', 'Mereka yang merintis pengajian sore tahun 1967 dan menegakkan Yayasan Al-Huda Yapida.', [['Profil', '/profil'], ['Pendiri', '/profil/pendiri']], 'Jejak para perintis')}
<section class="bagian"><div class="wadah">${items.length ? html`<div class="kisi-orang kisi-orang-besar">${items.map((it) => kartuOrang(x, it))}</div>` : ''}</div></section>
<section class="bagian bagian-gading"><div class="wadah sempit"><article class="prosa muncul"><h2>Riwayat singkat</h2>${raw(sejarahHtml)}</article></div></section>`;
}
