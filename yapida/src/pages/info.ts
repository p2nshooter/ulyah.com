/**
 * Informasi akbar (koleksi `info`): pita berganti di kepala setiap halaman dan halaman /informasi dengan siaran langsung.
 * Pemilik, 23 Nov 2026: „klo mau memberikan Informasi akbar di header, contoh kenaikan kelas, pengajian akbar, maulid dll
 * beserta live youtube/Fb dll“.
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { tanggal } from '../lib/text.ts';
import type { InfoAkbar } from '../data/site.ts';
import type { Dok } from '../data/koleksi.ts';
import { sematanYoutube } from '../data/haramain.ts';
import { kepalaHalaman } from './public.ts';

export const IKON_INFO: Record<string, string> = {
  pengajian: '🕌', maulid: '🌙', isra: '✨', hijriah: '🌙', ramadhan: '🌙', adha: '🐑', kenaikan: '🎓', wisuda: '🎓', ppdb: '📝', ujian: '✍️', libur: '🗓️', lain: '📣',
};
export const NAMA_INFO: Record<string, string> = {
  pengajian: 'Pengajian akbar', maulid: 'Maulid Nabi ﷺ', isra: 'Isra Mi’raj', hijriah: 'Tahun Baru Hijriah', ramadhan: 'Ramadhan & Idul Fitri', adha: 'Idul Adha',
  kenaikan: 'Kenaikan kelas', wisuda: 'Wisuda', ppdb: 'Penerimaan siswa baru', ujian: 'Ujian', libur: 'Libur', lain: 'Informasi penting',
};

/** Judul dengan ﷺ dan huruf Arab lain memakai huruf Arab (huruf judul Latin tidak punya glyph ﷺ). */
const judulArab = (t: string): Raw => html`${t.split(/([\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/).map((p, i) => (i % 2 ? html`<span class="arab-in" lang="ar">${p}</span>` : p))}`;

/** Nama platform sebuah tautan siaran — label tombolnya. */
export function labelTautan(url: string): string {
  try {
    const h = new URL(url).hostname.toLowerCase();
    const host = (...nama: string[]) => nama.some((n) => h === n || h.endsWith(`.${n}`));
    if (host('youtube.com', 'youtu.be')) return '▶ Tonton di YouTube';
    if (host('facebook.com', 'fb.watch')) return '▶ Live Facebook';
    if (host('tiktok.com')) return '▶ Live TikTok';
    if (host('instagram.com')) return '▶ Live Instagram';
  } catch { /* abaikan */ }
  return 'Selengkapnya ↗';
}

/** Pita informasi akbar di bawah pita bismillah — berganti setiap 6 detik bila lebih dari satu (public/assets/app.js). */
export function pitaInfo(items: InfoAkbar[]): string {
  if (!items.length) return '';
  return html`<div class="pita-info" data-info-pita role="region" aria-label="Informasi akbar" aria-live="polite">
  <div class="wadah pita-info-isi">
    <span class="pita-info-label" aria-hidden="true">✦ Informasi</span>
    <div class="pita-info-jalur">${items.map((it, i) => html`<div class="pita-info-butir${i === 0 ? ' aktif' : ''}" data-info-butir>
      <span class="pita-info-ikon" aria-hidden="true">${IKON_INFO[it.jenis] ?? '📣'}</span>
      <a class="pita-info-judul" href="/informasi#${it.slug}">${judulArab(it.judul)}</a>
      <span class="pita-info-waktu">${tanggal(it.tanggal, true)}${it.jam ? ` · ${it.jam}` : ''}</span>
      <span class="pita-info-hitung" data-info-hitung="${it.tanggal}"></span>
      ${it.tautan ? html`<a class="pita-info-live" href="${it.tautan}" target="_blank" rel="noopener" aria-label="${labelTautan(it.tautan).replace(/^▶ /, '')}"><span class="pl-panjang">${labelTautan(it.tautan)}</span><span class="pl-pendek" aria-hidden="true">${/^▶/.test(labelTautan(it.tautan)) ? '▶ LIVE' : 'Buka ↗'}</span></a>` : ''}
    </div>`)}</div>
    ${items.length > 1 ? html`<span class="pita-info-titik" aria-hidden="true">${items.map((_, i) => html`<i${raw(i === 0 ? ' class="aktif"' : '')}></i>`)}</span>` : ''}
    <button class="pita-info-tutup" type="button" data-info-tutup aria-label="Sembunyikan informasi">✕</button>
  </div>
</div>`.s;
}

/** Halaman /informasi: yang sedang berlangsung/akan datang dulu (dengan siaran YouTube tersemat), lalu arsip. */
export function infoPage(o: { aktif: Dok[]; arsip: Dok[]; media: (f?: string | null) => string }): Raw {
  const kartu = (d: Dok, besar: boolean) => {
    const tautan = typeof d.d.tautan === 'string' ? d.d.tautan : '';
    const sem = besar && tautan ? sematanYoutube(tautan) : null;
    const jenis = String(d.d.jenis ?? 'lain');
    return html`<article class="info-kartu${besar ? ' besar' : ''} muncul" id="${d.slug}">
      <header class="info-kepala"><span class="info-ikon" aria-hidden="true">${IKON_INFO[jenis] ?? '📣'}</span><div><p class="info-jenis">${NAMA_INFO[jenis] ?? 'Informasi'}</p><h2>${judulArab(d.judul)}</h2>
        <p class="info-waktu">${tanggal(d.tanggal, true)}${typeof d.d.jam === 'string' && d.d.jam ? ` · ${d.d.jam}` : ''}${typeof d.d.tempat === 'string' && d.d.tempat ? ` · ${d.d.tempat}` : ''}</p></div>
        ${besar ? html`<span class="info-hitung" data-info-hitung="${d.tanggal}"></span>` : ''}</header>
      ${sem ? html`<div class="info-layar"><iframe src="${sem}" title="Siaran ${d.judul}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>` : ''}
      ${typeof d.d.sampul === 'string' && d.d.sampul ? html`<img class="info-pamflet" src="${o.media(d.d.sampul)}" alt="Pamflet ${d.judul}" loading="lazy">` : ''}
      ${d.html.ket ? html`<div class="info-ket prosa">${raw(d.html.ket)}</div>` : ''}
      ${tautan ? html`<p><a class="tbl tbl-emas" href="${tautan}" target="_blank" rel="noopener">${labelTautan(tautan)}</a></p>` : ''}
    </article>`;
  };
  return html`${kepalaHalaman('Informasi Akbar', 'Pengajian akbar, peringatan hari besar Islam, kenaikan kelas, wisuda, dan penerimaan siswa baru di lingkungan Yayasan Al-Huda Yapida — lengkap dengan siaran langsungnya.', [['Informasi', '/informasi']], 'Pengumuman')}
<section class="bagian"><div class="wadah info-kisi">
  ${o.aktif.length ? o.aktif.map((d) => kartu(d, true)) : html`<p class="info-kosong">Belum ada informasi akbar yang sedang berlangsung. Pantau halaman ini dan kepala situs untuk pengumuman berikutnya.</p>`}
  ${o.arsip.length ? html`<h2 class="info-arsip-judul">Informasi sebelumnya</h2><div class="info-arsip">${o.arsip.map((d) => kartu(d, false))}</div>` : ''}
</div></section>`;
}
