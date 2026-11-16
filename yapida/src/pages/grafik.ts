/**
 * Grafik laporan portal (SVG dari server, tanpa pustaka). Aturan: warna kategori berurutan tetap (seri 1 biru, 2 jingga,
 * 3 aqua, 4 kuning — palet yang lolos uji buta warna), satu sumbu, batang tipis berujung bulat 4px dan pangkal persegi,
 * celah 2px antarsegmen, legenda untuk ≥ 2 seri, label langsung secukupnya, keterangan saat disorot/difokus
 * (data-tip, portal.js), dan tabel data di bawah setiap grafik. Warna status (lunas/sebagian/belum/telat) hanya untuk
 * status dan selalu bersama ikon + label. Warna ditentukan di CSS (.grafik) untuk tema siang dan malam.
 */
import { html, raw, esc, type Raw } from '../lib/html.ts';

export interface Seri { nama: string; kelas: string }
export interface Butir { label: string; nilai: number[]; href?: string; ket?: string }

const angka = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ringkasAngka = (n: number) => (n >= 1e9 ? `${angka(n / 1e9)} M` : n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',')} jt` : n >= 1e4 ? `${angka(n / 1e3)} rb` : angka(n));

/** Skala sumbu yang bulat: 0, 5, 10 …, 0, 50 rb, 100 rb … */
function skala(maks: number): { atas: number; langkah: number } {
  if (maks <= 0) return { atas: 4, langkah: 1 };
  const kasar = maks / 4;
  const pangkat = 10 ** Math.floor(Math.log10(kasar));
  const langkah = [1, 2, 2.5, 5, 10].map((m) => m * pangkat).find((x) => x >= kasar) ?? 10 * pangkat;
  return { atas: Math.ceil(maks / langkah) * langkah, langkah };
}

/** Batang berujung bulat di sisi data saja (pangkal persegi). */
function batangH(x0: number, x1: number, y: number, h: number, bulat: boolean): string {
  const w = Math.max(0, x1 - x0);
  if (w <= 0) return '';
  const r = bulat ? Math.min(4, w, h / 2) : 0;
  return `M${x0},${y}H${x1 - r}${r ? `Q${x1},${y} ${x1},${y + r}V${y + h - r}Q${x1},${y + h} ${x1 - r},${y + h}` : `V${y + h}`}H${x0}Z`;
}
function batangV(x: number, w: number, y0: number, y1: number, bulat: boolean): string {
  const h = Math.max(0, y0 - y1);
  if (h <= 0) return '';
  const r = bulat ? Math.min(4, h, w / 2) : 0;
  return `M${x},${y0}V${y1 + r}${r ? `Q${x},${y1} ${x + r},${y1}H${x + w - r}Q${x + w},${y1} ${x + w},${y1 + r}` : `H${x + w}`}V${y0}Z`;
}

function legenda(seri: Seri[]): Raw {
  return seri.length < 2 ? raw('') : html`<ul class="g-legenda">${seri.map((s) => html`<li><i class="g-kunci ${s.kelas}" aria-hidden="true"></i>${s.nama}</li>`)}</ul>`;
}

function tabelData(seri: Seri[], data: Butir[], kepala: string, format: (n: number) => string): Raw {
  return html`<details class="g-tabel"><summary>Lihat tabel data</summary><div class="p-tabel"><table><thead><tr><th>${kepala}</th>${seri.map((s) => html`<th>${s.nama}</th>`)}${seri.length > 1 ? raw('<th>Jumlah</th>') : ''}</tr></thead>
    <tbody>${data.map((d) => html`<tr><td>${d.href ? html`<a href="${d.href}">${d.label}</a>` : d.label}</td>${d.nilai.map((v) => html`<td>${format(v)}</td>`)}${seri.length > 1 ? html`<td><strong>${format(d.nilai.reduce((a, b) => a + b, 0))}</strong></td>` : ''}</tr>`)}</tbody></table></div></details>`;
}

/** Batang mendatar (bertumpuk bila ≥ 2 seri): perbandingan antarkategori dengan label panjang (lembaga, kelas). */
export function batangMendatar(o: { judul: string; sub?: string; seri: Seri[]; data: Butir[]; format?: (n: number) => string; kosong?: string; kepala?: string }): Raw {
  const f = o.format ?? angka;
  if (!o.data.length || o.data.every((d) => d.nilai.every((v) => !v))) return html`<figure class="grafik g-kartu"><figcaption><h3>${o.judul}</h3>${o.sub ? html`<p>${o.sub}</p>` : ''}</figcaption><p class="g-kosong">${o.kosong ?? 'Belum ada data.'}</p></figure>`;
  const kiri = Math.min(190, Math.max(80, Math.max(...o.data.map((d) => d.label.length)) * 7.2 + 12));
  const lebar = 680, tinggiBaris = 34, tebal = 20, atas = 8, kanan = 64;
  const tinggi = atas + o.data.length * tinggiBaris + 26;
  const total = o.data.map((d) => d.nilai.reduce((a, b) => a + b, 0));
  const { atas: maks, langkah } = skala(Math.max(...total));
  const sx = (v: number) => kiri + (v / maks) * (lebar - kiri - kanan);
  const grid: string[] = [];
  for (let v = 0; v <= maks + 1e-9; v += langkah) grid.push(`<line class="g-grid" x1="${sx(v)}" x2="${sx(v)}" y1="${atas - 4}" y2="${tinggi - 22}"/><text class="g-sumbu" x="${sx(v)}" y="${tinggi - 6}" text-anchor="middle">${esc(ringkasAngka(v))}</text>`);
  const baris = o.data.map((d, i) => {
    const y = atas + i * tinggiBaris + (tinggiBaris - tebal) / 2;
    let x = kiri;
    const terakhir = d.nilai.reduce((t, v, k) => (v > 0 ? k : t), -1);
    const seg = d.nilai.map((v, k) => {
      if (v <= 0) return '';
      const x1 = sx(d.nilai.slice(0, k + 1).reduce((a, b) => a + b, 0));
      const p = batangH(x + (x > kiri ? 1 : 0), x1 - (k < terakhir ? 1 : 0), y, tebal, k === terakhir);
      x = x1;
      const tip = `${d.label} · ${o.seri[k]?.nama ?? ''}: ${f(v)}${o.seri.length > 1 ? ` dari ${f(total[i]!)}` : ''}`;
      return `<path class="g-isi ${o.seri[k]?.kelas ?? 's1'}" d="${p}" data-tip="${esc(tip)}" tabindex="0"><title>${esc(tip)}</title></path>`;
    }).join('');
    const label = `<text class="g-label" x="${kiri - 8}" y="${y + tebal / 2 + 4}" text-anchor="end">${esc(d.label.length > 26 ? `${d.label.slice(0, 25)}…` : d.label)}</text>`;
    const nilai = `<text class="g-nilai" x="${sx(total[i]!) + 6}" y="${y + tebal / 2 + 4}">${esc(f(total[i]!))}</text>`;
    const tautan = d.href ? [`<a href="${esc(d.href)}" class="g-tautan" aria-label="${esc(`${d.label}: ${f(total[i]!)}`)}">`, '</a>'] : ['', ''];
    return `${tautan[0]}<rect class="g-hit" x="0" y="${y - 6}" width="${lebar}" height="${tebal + 12}"/>${label}${seg}${nilai}${tautan[1]}`;
  }).join('');
  return html`<figure class="grafik g-kartu"><figcaption><h3>${o.judul}</h3>${o.sub ? html`<p>${o.sub}</p>` : ''}</figcaption>${legenda(o.seri)}
    <svg viewBox="0 0 ${lebar} ${tinggi}" role="img" aria-label="${o.judul}" preserveAspectRatio="xMinYMin meet">${raw(grid.join(''))}<line class="g-dasar" x1="${kiri}" x2="${kiri}" y1="${atas - 4}" y2="${tinggi - 22}"/>${raw(baris)}</svg>
    ${tabelData(o.seri, o.data, o.kepala ?? 'Kategori', f)}</figure>`;
}

/** Kolom tegak (bertumpuk bila ≥ 2 seri): urutan berjenjang (kelas) atau waktu (bulan). */
export function kolomTegak(o: { judul: string; sub?: string; seri: Seri[]; data: Butir[]; format?: (n: number) => string; kosong?: string; kepala?: string; labelSemua?: boolean }): Raw {
  const f = o.format ?? angka;
  if (!o.data.length || o.data.every((d) => d.nilai.every((v) => !v))) return html`<figure class="grafik g-kartu"><figcaption><h3>${o.judul}</h3>${o.sub ? html`<p>${o.sub}</p>` : ''}</figcaption><p class="g-kosong">${o.kosong ?? 'Belum ada data.'}</p></figure>`;
  const lebar = 680, tinggi = 280, kiri = 52, bawah = 34, atas = 22;
  const total = o.data.map((d) => d.nilai.reduce((a, b) => a + b, 0));
  const { atas: maks, langkah } = skala(Math.max(...total));
  const slot = (lebar - kiri - 8) / o.data.length;
  const tebal = Math.min(24, slot * 0.6);
  const sy = (v: number) => tinggi - bawah - (v / maks) * (tinggi - bawah - atas);
  const grid: string[] = [];
  for (let v = 0; v <= maks + 1e-9; v += langkah) grid.push(`<line class="g-grid" x1="${kiri}" x2="${lebar - 4}" y1="${sy(v)}" y2="${sy(v)}"/><text class="g-sumbu" x="${kiri - 8}" y="${sy(v) + 4}" text-anchor="end">${esc(ringkasAngka(v))}</text>`);
  const iMaks = total.indexOf(Math.max(...total));
  const kol = o.data.map((d, i) => {
    const x = kiri + i * slot + (slot - tebal) / 2;
    let y = sy(0);
    const terakhir = d.nilai.reduce((t, v, k) => (v > 0 ? k : t), -1);
    const seg = d.nilai.map((v, k) => {
      if (v <= 0) return '';
      const y1 = sy(d.nilai.slice(0, k + 1).reduce((a, b) => a + b, 0));
      const p = batangV(x, tebal, y - (y < sy(0) ? 1 : 0), y1 + (k < terakhir ? 1 : 0), k === terakhir);
      y = y1;
      const tip = `${d.label} · ${o.seri[k]?.nama ?? ''}: ${f(v)}${o.seri.length > 1 ? ` dari ${f(total[i]!)}` : ''}`;
      return `<path class="g-isi ${o.seri[k]?.kelas ?? 's1'}" d="${p}" data-tip="${esc(tip)}" tabindex="0"><title>${esc(tip)}</title></path>`;
    }).join('');
    const tampilNilai = o.labelSemua || i === iMaks || i === o.data.length - 1;
    const nilai = tampilNilai && total[i] ? `<text class="g-nilai" x="${x + tebal / 2}" y="${sy(total[i]!) - 6}" text-anchor="middle">${esc(f(total[i]!))}</text>` : '';
    const label = `<text class="g-label" x="${x + tebal / 2}" y="${tinggi - bawah + 18}" text-anchor="middle">${esc(d.label)}</text>`;
    const tautan = d.href ? [`<a href="${esc(d.href)}" class="g-tautan" aria-label="${esc(`${d.label}: ${f(total[i]!)}`)}">`, '</a>'] : ['', ''];
    return `${tautan[0]}<rect class="g-hit" x="${kiri + i * slot}" y="${atas - 10}" width="${slot}" height="${tinggi - atas}"/>${seg}${nilai}${label}${tautan[1]}`;
  }).join('');
  return html`<figure class="grafik g-kartu"><figcaption><h3>${o.judul}</h3>${o.sub ? html`<p>${o.sub}</p>` : ''}</figcaption>${legenda(o.seri)}
    <svg viewBox="0 0 ${lebar} ${tinggi}" role="img" aria-label="${o.judul}" preserveAspectRatio="xMinYMin meet">${raw(grid.join(''))}<line class="g-dasar" x1="${kiri}" x2="${lebar - 4}" y1="${sy(0)}" y2="${sy(0)}"/>${raw(kol)}</svg>
    ${tabelData(o.seri, o.data, o.kepala ?? 'Kategori', f)}</figure>`;
}

/** Batang tersegmen (satu keseluruhan dibagi bagian): status siswa, status tagihan. `ikon` wajib untuk warna status. */
export function batangSegmen(o: { judul: string; sub?: string; bagian: { label: string; nilai: number; kelas: string; ikon?: string; href?: string }[]; format?: (n: number) => string; satuan?: string }): Raw {
  const f = o.format ?? angka;
  const total = o.bagian.reduce((a, b) => a + b.nilai, 0);
  if (!total) return html`<figure class="grafik g-kartu"><figcaption><h3>${o.judul}</h3>${o.sub ? html`<p>${o.sub}</p>` : ''}</figcaption><p class="g-kosong">Belum ada data.</p></figure>`;
  const ada = o.bagian.filter((b) => b.nilai > 0);
  return html`<figure class="grafik g-kartu"><figcaption><h3>${o.judul}</h3>${o.sub ? html`<p>${o.sub}</p>` : ''}</figcaption>
    <div class="g-segmen" role="img" aria-label="${o.judul}">${ada.map((b, i) => {
      const persen = (b.nilai / total) * 100;
      const tip = `${b.label}: ${f(b.nilai)} (${persen.toFixed(persen < 10 ? 1 : 0).replace('.', ',')}%)`;
      return html`<span class="g-isi ${b.kelas}${i === 0 ? ' g-awal' : ''}${i === ada.length - 1 ? ' g-akhir' : ''}" style="flex-grow:${b.nilai}" data-tip="${tip}" tabindex="0" title="${tip}"></span>`;
    })}</div>
    <ul class="g-legenda g-legenda-angka">${o.bagian.map((b) => html`<li>${b.href ? raw(`<a href="${esc(b.href)}">`) : ''}<i class="g-kunci ${b.kelas}" aria-hidden="true"></i>${b.ikon ? html`<b class="g-ikon" aria-hidden="true">${b.ikon}</b>` : ''}<span>${b.label}</span><strong>${f(b.nilai)}${o.satuan ?? ''}</strong><small>${total ? `${Math.round((b.nilai / total) * 100)}%` : ''}</small>${b.href ? raw('</a>') : ''}</li>`)}</ul>
  </figure>`;
}

/** Ubin angka utama: label, nilai, keterangan pendek. */
export function ubin(label: string, nilai: string, ket?: string, href?: string): Raw {
  const isi = html`<span class="g-ubin-label">${label}</span><strong class="g-ubin-nilai">${nilai}</strong>${ket ? html`<small>${ket}</small>` : ''}`;
  return href ? html`<a class="g-ubin" href="${href}">${isi}</a>` : html`<div class="g-ubin">${isi}</div>`;
}

export { angka, ringkasAngka };
