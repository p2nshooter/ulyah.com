/** Bagian yang disisipkan ke halaman lembaga, profil, beranda, dan kontak — dibangun dari koleksi isi. */
import { html, raw, type Raw } from '../lib/html.ts';
import type { IxItem } from '../data/koleksi.ts';
import type { VideoKanal } from '../data/yt.ts';
import type { Situs } from '../data/model.ts';
import type { UnitItem } from '../data/site.ts';
import { kartuAlbum, kartuKabar, kartuKarya, kartuPpdb, kartuVideo, kelompokOrang, kepalaBagian, ppdbBuka, butirAgenda, type Ctx } from './konten.ts';
import { hariIni } from '../lib/text.ts';

export interface IsiUnit { sdm: IxItem[]; kabar: IxItem[]; galeri: IxItem[]; video: IxItem[]; kanal: VideoKanal[]; ppdb: IxItem[]; dokumen: IxItem[]; karya: IxItem[]; agenda: IxItem[] }

export function bagianUnit(x: Ctx, slug: string, nama: string, i: IsiUnit): Raw {
  const kini = hariIni();
  const ppdbAktif = i.ppdb.filter((it) => String(it.x?.tutup ?? '') >= kini);
  const vid = [
    ...i.video.map((it) => ({ judul: it.j, url: String(it.x?.url ?? ''), tanggal: it.t, live: it.x?.jenis === 'live' })),
    ...i.kanal.map((v) => ({ judul: v.judul, url: `https://www.youtube.com/watch?v=${v.id}`, tanggal: v.terbit, live: false })),
  ].slice(0, 6);
  const agenda = i.agenda.filter((it) => it.t >= kini).sort((a, b) => (a.t < b.t ? -1 : 1)).slice(0, 5);
  return html`
${ppdbAktif.length ? html`<section class="bagian bagian-ppdb"><div class="wadah">${kepalaBagian('Penerimaan murid baru', `PPDB ${nama}`, ppdbAktif.some((it) => ppdbBuka(it)) ? 'Pendaftaran sedang dibuka — bisa daftar langsung dari situs ini.' : undefined)}<div class="kisi-ppdb">${ppdbAktif.map((it) => kartuPpdb(x, it))}</div></div></section>` : ''}
${i.sdm.length ? html`<section class="bagian" id="struktur"><div class="wadah">${kepalaBagian('Struktur & guru', `Keluarga ${nama}`)}${kelompokOrang(x, i.sdm, ['pimpinan', 'guru', 'staf'])}</div></section>` : ''}
${i.kabar.length ? html`<section class="bagian bagian-gading"><div class="wadah">${kepalaBagian('Kabar', `Kabar terbaru ${nama}`)}<div class="kisi-isi">${i.kabar.map((it) => kartuKabar(x, it))}</div><p class="tengah"><a class="tbl tbl-garis tbl-kecil" href="/kabar?lembaga=${slug}">Semua kabar →</a></p></div></section>` : ''}
${i.galeri.length ? html`<section class="bagian"><div class="wadah">${kepalaBagian('Galeri', 'Foto kegiatan')}<div class="kisi-album">${i.galeri.map((it) => kartuAlbum(x, it))}</div><p class="tengah"><a class="tbl tbl-garis tbl-kecil" href="/galeri?lembaga=${slug}">Semua album →</a></p></div></section>` : ''}
${vid.length ? html`<section class="bagian bagian-gading"><div class="wadah">${kepalaBagian('Video', 'Video & siaran langsung')}<div class="kisi-video">${vid.map((v) => kartuVideo(x, { ...v, unit: slug }))}</div></div></section>` : ''}
${agenda.length ? html`<section class="bagian"><div class="wadah sempit">${kepalaBagian('Agenda', 'Kegiatan yang akan datang')}<ol class="agenda">${agenda.map((it) => butirAgenda(x, it))}</ol></div></section>` : ''}
${i.karya.length ? html`<section class="bagian bagian-gading"><div class="wadah">${kepalaBagian('Karya tulis', `Karya santri & guru ${nama}`)}<div class="kisi-karya">${i.karya.map((it) => kartuKarya(x, it))}</div></div></section>` : ''}
${i.dokumen.length ? html`<section class="bagian"><div class="wadah sempit">${kepalaBagian('Dokumen', 'Dokumen publik')}<ul class="dokumen">${i.dokumen.map((it) => html`<li><a href="${x.media(String(it.x?.berkas ?? ''))}" target="_blank" rel="noopener"><span class="dok-ikon" aria-hidden="true">PDF</span><span><strong>${it.j}</strong></span></a></li>`)}</ul></div></section>` : ''}`;
}

/** Organ yayasan dengan foto (koleksi SDM, unit yayasan); bila belum diisi, susunan dari SK di pengaturan situs. */
export function organYayasan(x: Ctx, s: Situs, sdm: IxItem[]): Raw {
  const ada = sdm.filter((it) => ['pembina', 'pengurus', 'pengawas', 'pendiri'].includes(String(it.x?.golongan)));
  if (ada.length) {
    return html`<section class="bagian bagian-gading" id="organ"><div class="wadah">${kepalaBagian('Organ yayasan', 'Pendiri, pembina, pengurus & pengawas', s.organCatatan)}${kelompokOrang(x, ada, ['pendiri', 'pembina', 'pengurus', 'pengawas'])}
      <p class="tengah"><a class="tbl tbl-garis tbl-kecil" href="/struktur">Struktur lengkap & guru semua lembaga →</a></p></div></section>`;
  }
  return raw('');
}

export function beritaBeranda(x: Ctx, kabar: IxItem[], galeri: IxItem[], ppdb: IxItem[]): Raw {
  const kini = hariIni();
  const ppdbAktif = ppdb.filter((it) => String(it.x?.tutup ?? '') >= kini).slice(0, 3);
  return html`
${ppdbAktif.length ? html`<section class="bagian bagian-ppdb"><div class="wadah">${kepalaBagian('PPDB', 'Penerimaan murid baru', 'Daftar langsung dari situs ini.')}<div class="kisi-ppdb">${ppdbAktif.map((it) => kartuPpdb(x, it))}</div><p class="tengah"><a class="tbl tbl-garis tbl-kecil" href="/ppdb">Semua PPDB →</a></p></div></section>` : ''}
${kabar.length ? html`<section class="bagian"><div class="wadah">${kepalaBagian('Kabar terbaru', 'Dari lembaga-lembaga kami')}<div class="kisi-isi">${kabar.map((it) => kartuKabar(x, it))}</div><p class="tengah"><a class="tbl tbl-garis tbl-kecil" href="/kabar">Semua kabar →</a></p></div></section>` : ''}
${galeri.length ? html`<section class="bagian bagian-gading"><div class="wadah">${kepalaBagian('Galeri', 'Foto kegiatan terbaru')}<div class="kisi-album">${galeri.map((it) => kartuAlbum(x, it))}</div></div></section>` : ''}`;
}

const PESAN_KONTAK: Record<string, [string, string]> = {
  terkirim: ['ok', 'Pesan terkirim. Terima kasih — pengurus akan membalas lewat kontak yang Anda tulis.'],
  kurang: ['galat', 'Nama, kontak, dan isi pesan wajib diisi.'],
  batas: ['galat', 'Terlalu banyak pesan dari jaringan ini. Coba lagi satu jam lagi.'],
};

export function formKontak(units: UnitItem[], pesan?: string): Raw {
  const p = pesan ? PESAN_KONTAK[pesan] : undefined;
  return html`<form method="post" action="/kontak" class="formulir p-form panel muncul" id="tulis">
    <h2>Kirim pesan</h2>
    ${p ? html`<p class="p-kilat p-kilat-${p[0]}" role="status">${p[1]}</p>` : ''}
    <div class="p-baris"><label class="p-bidang"><span>Nama *</span><input name="nama" required maxlength="100" autocomplete="name"></label><label class="p-bidang"><span>WhatsApp atau e-mail *</span><input name="kontak" required maxlength="120"></label></div>
    <label class="p-bidang"><span>Untuk</span><select name="unit"><option value="yayasan">Pengurus yayasan</option>${units.map((u) => html`<option value="${u.slug}">${u.nama}</option>`)}</select></label>
    <label class="p-bidang"><span>Pesan *</span><textarea name="isi" rows="5" required maxlength="3000"></textarea></label>
    <label class="jebakan" aria-hidden="true">Jangan diisi <input name="situsweb" tabindex="-1" autocomplete="off"></label>
    <button class="tbl tbl-emas" type="submit">Kirim pesan</button>
  </form>`;
}
