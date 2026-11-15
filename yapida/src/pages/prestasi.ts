/** Halaman publik Prestasi & Penghargaan (perintah 13): kartu berfoto per lembaga/jenis/tahun, detail dengan sertifikatnya. */
import { html, type Raw } from '../lib/html.ts';
import type { Dok, IxItem } from '../data/koleksi.ts';
import type { UnitItem } from '../data/site.ts';
import { JENIS_PENGHARGAAN, labelJenis } from '../data/dokumen.ts';
import { tanggal } from '../lib/text.ts';
import { kepalaBagian, namaUnit, type Ctx } from './konten.ts';
import { kepalaHalaman } from './public.ts';

const inisial = (n: string) => n.replace(/^(H\.|Hj\.|Dr\.|KH\.|Ust\.|Ustadz|Ustadzah)\s+/i, '').slice(0, 1).toUpperCase();
const teks = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '');

export function kartuPrestasi(x: Ctx, it: IxItem): Raw {
  const k = it.x ?? {};
  return html`<a class="kartu-prestasi muncul j-${teks(k.jenis) || 'lainnya'}" href="/prestasi/${it.sl}" data-miring>
    <span class="kp-foto">${it.g ? html`<img src="${x.media(x.kecil(it.g))}" alt="" loading="lazy" decoding="async">` : html`<span class="kp-inisial" aria-hidden="true">${inisial(it.j)}</span>`}<span class="kp-pita">${labelJenis(k.jenis)}</span></span>
    <span class="kp-teks"><strong>${it.j}</strong><span class="kp-capaian">${teks(k.capaian) || it.r || ''}</span><span class="kp-meta">${namaUnit(x, it.u)}${teks(k.kelas) ? html` · ${teks(k.kelas)}` : ''}${teks(k.tahun) ? html` · ${teks(k.tahun)}` : ''}</span></span>
  </a>`;
}

export interface SaringPrestasi { pilihUnit: string; pilihJenis: string; pilihTahun: string; ada: Set<string>; jenisAda: string[]; tahunAda: string[] }

export function prestasiIndex(x: Ctx, items: IxItem[], o: SaringPrestasi): Raw {
  const taut = (ubah: Partial<Record<'lembaga' | 'jenis' | 'tahun', string>>) => {
    const q = new URLSearchParams();
    const v = { lembaga: o.pilihUnit, jenis: o.pilihJenis, tahun: o.pilihTahun, ...ubah };
    for (const [k, val] of Object.entries(v)) if (val) q.set(k, val);
    const s = q.toString();
    return `/prestasi${s ? `?${s}` : ''}`;
  };
  const unitOpsi = [{ slug: '', nama: 'Semua lembaga' }, ...(o.ada.has('yayasan') ? [{ slug: 'yayasan', nama: 'Yayasan' }] : []), ...x.units.filter((u) => o.ada.has(u.slug)).map((u) => ({ slug: u.slug, nama: u.singkat }))];
  const jenisOpsi = [['', 'Semua jenis'] as [string, string], ...JENIS_PENGHARGAAN.filter(([k]) => o.jenisAda.includes(k))];
  return html`${kepalaHalaman('Prestasi & Penghargaan', 'Sertifikat tahfidz, piagam juara lomba, peringkat kelas, dan penghargaan lain untuk santri dan siswa seluruh lembaga Yayasan Al-Huda Yapida — selamat kepada para bintang kami.', [['Prestasi', '/prestasi']], 'Bangga pada anak-anak kami')}
<section class="bagian"><div class="wadah">
  ${unitOpsi.length > 2 ? html`<nav class="saring saring-taut" aria-label="Saring menurut lembaga">${unitOpsi.map((u) => html`<a class="saring-tbl" href="${taut({ lembaga: u.slug })}"${u.slug === o.pilihUnit ? html` aria-current="true"` : ''}>${u.nama}</a>`)}</nav>` : ''}
  ${jenisOpsi.length > 2 ? html`<nav class="saring saring-taut saring-jenis" aria-label="Saring menurut jenis penghargaan">${jenisOpsi.map(([k, l]) => html`<a class="saring-tbl" href="${taut({ jenis: k })}"${k === o.pilihJenis ? html` aria-current="true"` : ''}>${l}</a>`)}</nav>` : ''}
  ${o.tahunAda.length > 1 ? html`<nav class="saring saring-taut saring-tahun" aria-label="Saring menurut tahun"><a class="saring-tbl" href="${taut({ tahun: '' })}"${o.pilihTahun ? '' : html` aria-current="true"`}>Semua tahun</a>${o.tahunAda.map((th) => html`<a class="saring-tbl" href="${taut({ tahun: th })}"${th === o.pilihTahun ? html` aria-current="true"` : ''}>${th}</a>`)}</nav>` : ''}
  ${items.length
    ? html`<p class="kecil-abu prestasi-jumlah">${items.length} penghargaan</p><div class="kisi-prestasi">${items.map((it) => kartuPrestasi(x, it))}</div>`
    : html`<p class="kosong-teks">Belum ada penghargaan yang ditampilkan${o.pilihUnit || o.pilihJenis || o.pilihTahun ? ' untuk saringan ini' : ''}. Admin setiap lembaga menerbitkannya dari portal (menu Sertifikat &amp; piagam).</p>`}
</div></section>`;
}

export function prestasiDetail(x: Ctx, d: Dok, o: { url: string }): Raw {
  const v = (k: string) => teks(d.d[k]);
  const baris: [string, string][] = [
    ['Jenis', labelJenis(d.d.jenis)], ['Capaian', v('capaian')], ['Predikat', v('predikat')], ['Kegiatan', v('kegiatan')], ['Kelas', v('kelas')],
    ['Tahun pelajaran', v('tahun')], ['Lembaga', namaUnit(x, d.unit)], ['Tanggal', tanggal(d.tanggal)], ['Nomor', v('nomor')],
  ];
  const pesan = `Alhamdulillah, ${d.judul} meraih ${labelJenis(d.d.jenis)}: ${v('capaian')} — ${namaUnit(x, d.unit)}. ${o.url}`;
  return html`${kepalaHalaman(d.judul, `${labelJenis(d.d.jenis)} — ${v('capaian')}`, [['Prestasi', '/prestasi'], [d.judul, `/prestasi/${d.slug}`]], namaUnit(x, d.unit))}
<section class="bagian"><div class="wadah">
  <div class="prestasi-bingkai muncul"><iframe class="prestasi-sert" src="/prestasi/${d.slug}/sertifikat?bingkai=1" title="Sertifikat ${d.judul}" loading="lazy"></iframe></div>
  <div class="prestasi-aksi">
    <a class="tbl tbl-emas" href="/prestasi/${d.slug}/sertifikat" target="_blank" rel="noopener">Lihat ukuran penuh / cetak</a>
    <a class="tbl tbl-garis" href="https://wa.me/?text=${encodeURIComponent(pesan)}" target="_blank" rel="noopener">Bagikan ke WhatsApp</a>
  </div>
  <div class="prestasi-dua">
    <div class="prestasi-foto">${typeof d.d.foto === 'string' && d.d.foto ? html`<img src="${x.media(d.d.foto)}" alt="${d.judul}">` : html`<span class="kp-inisial besar" aria-hidden="true">${inisial(d.judul)}</span>`}</div>
    <dl class="prestasi-rinci">${baris.filter(([, val]) => val).map(([l, val]) => html`<dt>${l}</dt><dd>${val}</dd>`)}</dl>
  </div>
  <p class="kecil-abu">Keaslian dapat diperiksa lewat alamat halaman ini, yang tercetak di bagian bawah sertifikat.</p>
</div></section>`;
}

/** Pita „Bintang Yapida“ di beranda. */
export function pitaPrestasi(x: Ctx, items: IxItem[]): Raw {
  if (!items.length) return html``;
  return html`<section class="bagian bagian-gading pita-prestasi"><div class="wadah">
  ${kepalaBagian('Prestasi', 'Bintang-bintang Yapida', 'Tahfidz, juara lomba, dan peringkat kelas dari seluruh lembaga.')}
  <div class="kisi-prestasi">${items.slice(0, 6).map((it) => kartuPrestasi(x, it))}</div>
  <p class="tengah"><a class="tbl tbl-garis" href="/prestasi">Semua prestasi →</a></p>
</div></section>`;
}

/** Bagian prestasi di halaman lembaga. */
export function bagianPrestasiUnit(x: Ctx, u: UnitItem, items: IxItem[]): Raw {
  if (!items.length) return html``;
  return html`<section class="bagian bagian-gading" id="prestasi"><div class="wadah">
  ${kepalaBagian('Prestasi', `Penghargaan ${u.singkat}`)}
  <div class="kisi-prestasi">${items.slice(0, 8).map((it) => kartuPrestasi(x, it))}</div>
  <p class="tengah"><a class="tbl tbl-garis" href="/prestasi?lembaga=${u.slug}">Semua prestasi ${u.singkat} →</a></p>
</div></section>`;
}
