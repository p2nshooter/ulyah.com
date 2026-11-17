/**
 * Tampilan Pesan & Saran (src/data/saran.ts): formulir publik, dinding pesan yang ditampilkan super admin, halaman pribadi
 * pengunjung (baca balasan & menanggapi), kotak masuk portal, dan halaman detail pengelola (balas atas nama lembaga,
 * status, teruskan, tampil/sembunyi, hapus).
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { tanggal } from '../lib/text.ts';
import type { UnitItem } from '../data/site.ts';
import { KELOMPOK, URUTAN_KELOMPOK } from '../data/model.ts';
import { kepalaHalaman } from './public.ts';
import {
  KATEGORI, MAKS_ISI, NAMA_SAMARAN, SEBAGAI, STATUS_SARAN, URUT_KATEGORI, balasanLembaga, namaTampil, type ItemSaran, type KategoriSaran, type MetaTampil,
  type Saran, type StatusSaran,
} from '../data/saran.ts';

export const NAMA_YAYASAN = 'Pengurus Yayasan Al-Huda Yapida';
export const namaUnitSaran = (units: Pick<UnitItem, 'slug' | 'nama'>[], slug: string) => (slug === 'yayasan' ? NAMA_YAYASAN : units.find((u) => u.slug === slug)?.nama ?? slug);
const singkatUnit = (units: Pick<UnitItem, 'slug' | 'singkat'>[], slug: string) => (slug === 'yayasan' ? 'Yayasan' : units.find((u) => u.slug === slug)?.singkat ?? slug);
const inisial = (n: string) => (n.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/).slice(0, 2).map((x) => x[0] ?? '').join('') || '•').toUpperCase();
const waktu = (t: number) => `${tanggal(t)} · ${new Date(t + 7 * 3600_000).toISOString().slice(11, 16)} WIB`;
const paragraf = (t: string) => t.split(/\n{2,}/).map((p) => html`<p>${p.split('\n').map((l, i) => (i ? html`<br>${l}` : l))}</p>`);
const chipJenis = (k: KategoriSaran) => html`<span class="sr-jenis-chip sr-k-${k}"><span aria-hidden="true">${KATEGORI[k].ikon}</span>${KATEGORI[k].label}</span>`;

/* ── formulir publik ─────────────────────────────────────────────────────────────────────────────────────────── */

const PESAN_KIRIM: Record<string, [string, string]> = {
  kurang: ['galat', 'Nama, jenis pesan, dan isi pesan (minimal 10 huruf) wajib diisi.'],
  batas: ['galat', 'Terlalu banyak pesan dari jaringan ini. Silakan coba lagi satu jam lagi.'],
  tujuan: ['galat', 'Lembaga tujuan tidak dikenal. Pilih lagi dari daftar.'],
};

export function opsiTujuan(units: UnitItem[], pilih?: string): Raw {
  return html`<option value="yayasan"${raw(pilih === 'yayasan' || !pilih ? ' selected' : '')}>${NAMA_YAYASAN}</option>
    ${URUTAN_KELOMPOK.map((k) => {
      const isi = units.filter((u) => u.kelompok === k);
      return isi.length ? html`<optgroup label="${KELOMPOK[k].nama}">${isi.map((u) => html`<option value="${u.slug}"${raw(pilih === u.slug ? ' selected' : '')}>${u.nama}</option>`)}</optgroup>` : '';
    })}`;
}

export function formSaran(units: UnitItem[], o: { untuk?: string; pesan?: string; jenis?: string } = {}): Raw {
  const p = o.pesan ? PESAN_KIRIM[o.pesan] : undefined;
  const jenis = (URUT_KATEGORI as string[]).includes(o.jenis ?? '') ? (o.jenis as KategoriSaran) : 'saran';
  return html`<form method="post" action="/saran" class="sr-form" id="tulis" data-sr-form>
    <div class="sr-form-kepala"><span class="sr-segel" aria-hidden="true">✉</span><div><h2>Tulis pesan &amp; saran</h2><p>Langsung diterima lembaga yang Anda tuju dan diketahui pengurus yayasan.</p></div></div>
    ${p ? html`<p class="sr-kilat sr-kilat-${p[0]}" role="alert">${p[1]}</p>` : ''}
    <fieldset class="sr-pilih-jenis"><legend>Jenis pesan</legend>
      ${URUT_KATEGORI.map((k) => html`<label class="sr-jenis sr-k-${k}"><input type="radio" name="kategori" value="${k}"${raw(k === jenis ? ' checked' : '')}><span class="sr-jenis-ikon" aria-hidden="true">${KATEGORI[k].ikon}</span><b>${KATEGORI[k].label}</b><small>${KATEGORI[k].ajakan}</small></label>`)}
    </fieldset>
    <label class="sr-bidang"><span>Untuk</span><select name="unit" required>${opsiTujuan(units, o.untuk)}</select></label>
    <div class="sr-baris">
      <label class="sr-bidang"><span>Nama Anda *</span><input name="nama" required minlength="2" maxlength="80" autocomplete="name"></label>
      <label class="sr-bidang"><span>Saya sebagai</span><select name="sebagai">${SEBAGAI.map(([v, l]) => html`<option value="${v}">${l}</option>`)}</select></label>
    </div>
    <label class="sr-bidang"><span>WhatsApp atau e-mail <i>(boleh dikosongkan)</i></span><input name="kontak" maxlength="120" inputmode="email" autocomplete="email" placeholder="0812… atau nama@contoh.com"><small>Hanya dilihat pengelola untuk membalas Anda. Tidak pernah ditampilkan.</small></label>
    <label class="sr-bidang"><span>Pesan *</span><textarea name="isi" rows="6" required minlength="10" maxlength="${MAKS_ISI}" data-sr-isi placeholder="Tuliskan saran, pertanyaan, kesan, atau keluhan Anda…"></textarea><small data-sr-sisa>Maksimal ${MAKS_ISI} huruf.</small></label>
    <label class="sr-centang"><input type="checkbox" name="anonim" value="1"><span>Samarkan nama saya bila pesan ini ditampilkan di situs (tampil sebagai „${NAMA_SAMARAN}“).</span></label>
    <label class="jebakan" aria-hidden="true">Jangan diisi <input name="situsweb" tabindex="-1" autocomplete="off"></label>
    <button class="tbl tbl-emas sr-kirim" type="submit">Kirim pesan</button>
    <p class="sr-privasi">🔒 Setelah terkirim, Anda mendapat <b>tautan pribadi</b> untuk membaca balasan lembaga dan menanggapinya. Pesan tampil di halaman ini hanya bila dipilih pengurus.</p>
  </form>`;
}

/* ── dinding pesan yang ditampilkan ──────────────────────────────────────────────────────────────────────────── */

export interface KartuTampil { meta: MetaTampil & { id: string }; doc: Saran | null }

function kartuTampil(units: UnitItem[], k: KartuTampil): Raw {
  const s = k.doc;
  const nama = s ? namaTampil(s) : k.meta.n;
  const balasan = s ? balasanLembaga(s) : [];
  return html`<article class="sr-kartu muncul" id="p-${k.meta.id}">
    <header class="sr-kartu-kepala"><span class="sr-av" aria-hidden="true">${nama === NAMA_SAMARAN ? '☾' : inisial(nama)}</span>
      <div><b>${nama}</b>${s && s.sebagai && s.sebagai !== 'lainnya' ? html`<small>${SEBAGAI.find(([v]) => v === s.sebagai)?.[1] ?? ''}</small>` : ''}<small>untuk <a href="${k.meta.u === 'yayasan' ? '/profil' : `/lembaga/${k.meta.u}`}">${singkatUnit(units, k.meta.u)}</a> · ${tanggal(k.meta.t)}</small></div>
      ${chipJenis(k.meta.k)}
    </header>
    <div class="sr-kartu-isi">${s ? paragraf(s.isi) : html`<p>${k.meta.c}</p>`}</div>
    ${balasan.map((b) => html`<div class="sr-balas"><span class="sr-balas-lencana" aria-hidden="true">${inisial(singkatUnit(units, b.unit ?? k.meta.u))}</span><div><p class="sr-balas-dari">Balasan ${namaUnitSaran(units, b.unit ?? k.meta.u)} <time>${tanggal(b.t)}</time></p>${paragraf(b.isi)}</div></div>`)}
  </article>`;
}

export function saranPage(o: { units: UnitItem[]; form: Raw; kartu: KartuTampil[]; lembaga: string; jumlahPer: Record<string, number>; hal: number; lanjut: boolean }): Raw {
  const pilihan = Object.keys(o.jumlahPer).sort((a, b) => (a === 'yayasan' ? -1 : b === 'yayasan' ? 1 : singkatUnit(o.units, a).localeCompare(singkatUnit(o.units, b))));
  const total = Object.values(o.jumlahPer).reduce((n, x) => n + x, 0);
  const q = (l: string, h = 1) => `/saran${l || h > 1 ? `?${[l ? `lembaga=${encodeURIComponent(l)}` : '', h > 1 ? `hal=${h}` : ''].filter(Boolean).join('&')}` : ''}#dinding`;
  return html`${kepalaHalaman('Pesan & Saran', 'Sampaikan saran, pertanyaan, kesan, atau keluhan langsung kepada lembaga yang Anda tuju. Setiap pesan dibaca pengelola lembaga itu dan diketahui pengurus yayasan.', [['Pesan & Saran', '/saran']], 'Suara Anda berarti')}
<section class="bagian"><div class="wadah">
  <ol class="sr-alur muncul" aria-label="Cara kerja">
    <li><b>1</b><span>Pilih lembaga tujuan &amp; jenis pesan</span></li>
    <li><b>2</b><span>Pesan masuk ke lembaga itu; pengurus yayasan ikut mengetahui</span></li>
    <li><b>3</b><span>Balasan lembaga dibaca lewat tautan pribadi Anda</span></li>
  </ol>
  <div class="sr-tata">
    ${o.form}
    <section class="sr-dinding" id="dinding" aria-labelledby="judul-dinding">
      <h2 id="judul-dinding">Pesan yang ditampilkan <span class="sr-hitung">${total}</span></h2>
      ${pilihan.length > 1 ? html`<nav class="saring saring-taut sr-saring" aria-label="Saring menurut lembaga"><a class="saring-tbl" href="${q('')}"${raw(o.lembaga ? '' : ' aria-selected="true"')}>Semua <b>${total}</b></a>${pilihan.map((l) => html`<a class="saring-tbl" href="${q(l)}"${raw(o.lembaga === l ? ' aria-selected="true"' : '')}>${singkatUnit(o.units, l)} <b>${o.jumlahPer[l]}</b></a>`)}</nav>` : ''}
      ${o.kartu.length ? o.kartu.map((k) => kartuTampil(o.units, k)) : html`<div class="sr-kosong"><span aria-hidden="true">🕊️</span><p>Belum ada pesan yang ditampilkan${o.lembaga ? ' untuk lembaga ini' : ''}. Jadilah yang pertama menulis — pesan pilihan akan tampil di sini bersama balasan lembaga.</p></div>`}
      ${o.hal > 1 || o.lanjut ? html`<nav class="sr-halaman" aria-label="Halaman">${o.hal > 1 ? html`<a class="tbl tbl-garis tbl-kecil" href="${q(o.lembaga, o.hal - 1)}">← Lebih baru</a>` : html`<span></span>`}${o.lanjut ? html`<a class="tbl tbl-garis tbl-kecil" href="${q(o.lembaga, o.hal + 1)}">Lebih lama →</a>` : ''}</nav>` : ''}
    </section>
  </div>
</div></section>
<script>(function(){var f=document.querySelector('[data-sr-form]');if(!f)return;var t=f.querySelector('[data-sr-isi]'),s=f.querySelector('[data-sr-sisa]');if(t&&s){var u=function(){var n=${MAKS_ISI}-t.value.length;s.textContent=n+' huruf tersisa';s.classList.toggle('sr-hampir',n<120)};t.addEventListener('input',u)}})();</script>`;
}

/* ── halaman pribadi pengunjung ──────────────────────────────────────────────────────────────────────────────── */

export function lacakPage(o: { s: Saran; units: UnitItem[]; url: string; baru: boolean; kilat?: string }): Raw {
  const s = o.s;
  const tujuan = namaUnitSaran(o.units, s.unit);
  const wa = `https://wa.me/?text=${encodeURIComponent(`Tautan pribadi pesan saya untuk ${tujuan} (Yayasan Al-Huda Yapida): ${o.url}`)}`;
  return html`${kepalaHalaman('Pesan Anda', `Untuk ${tujuan} · dikirim ${tanggal(s.t)}`, [['Pesan & Saran', '/saran'], ['Pesan Anda', '/saran']], 'Tautan pribadi')}
<section class="bagian"><div class="wadah sempit">
  ${o.baru ? html`<div class="sr-terkirim" role="status"><span class="sr-centang-besar" aria-hidden="true">✓</span><div><h2>Pesan terkirim</h2><p>Terima kasih. Pesan Anda sudah diterima <b>${tujuan}</b> dan diketahui pengurus yayasan. <b>Simpan tautan halaman ini</b> — balasan lembaga akan muncul di sini.</p>
    <div class="sr-salin"><input readonly value="${o.url}" aria-label="Tautan pribadi" data-sr-tautan><button class="tbl tbl-emas tbl-kecil" type="button" data-sr-salin>Salin tautan</button><a class="tbl tbl-garis tbl-kecil" href="${wa}" target="_blank" rel="noopener">Simpan ke WhatsApp</a></div></div></div>` : ''}
  ${o.kilat ? html`<p class="sr-kilat sr-kilat-ok" role="status">${o.kilat}</p>` : ''}
  <div class="sr-utas">
    <div class="sr-status-baris">${chipJenis(s.kategori)}<span class="sr-status sr-s-${s.status}">${STATUS_SARAN[s.status]}</span>${s.tampil ? html`<span class="sr-status sr-s-tampil">Ditampilkan di situs</span>` : ''}</div>
    <div class="sr-gelembung sr-dari-saya"><p class="sr-gelembung-dari">${s.nama} <time>${waktu(s.t)}</time></p>${paragraf(s.isi)}</div>
    ${s.percakapan.map((u) => (u.dari === 'lembaga'
      ? html`<div class="sr-gelembung sr-dari-lembaga"><p class="sr-gelembung-dari">${namaUnitSaran(o.units, u.unit ?? s.unit)} <time>${waktu(u.t)}</time></p>${paragraf(u.isi)}</div>`
      : html`<div class="sr-gelembung sr-dari-saya"><p class="sr-gelembung-dari">${s.nama} <time>${waktu(u.t)}</time></p>${paragraf(u.isi)}</div>`))}
    ${balasanLembaga(s).length ? '' : html`<p class="sr-menunggu">⏳ Belum ada balasan. Lembaga biasanya membalas dalam beberapa hari kerja — buka lagi tautan ini nanti.</p>`}
  </div>
  <form method="post" action="${o.url.replace(/^https?:\/\/[^/]+/, '')}" class="sr-form sr-tanggap">
    <h2>Tanggapi</h2>
    <label class="sr-bidang"><span>Tambahan atau tanggapan Anda</span><textarea name="isi" rows="4" required minlength="2" maxlength="${MAKS_ISI}"></textarea></label>
    <label class="jebakan" aria-hidden="true">Jangan diisi <input name="situsweb" tabindex="-1" autocomplete="off"></label>
    <button class="tbl tbl-emas" type="submit">Kirim tanggapan</button>
    <p class="sr-privasi">🔒 Halaman ini hanya bisa dibuka dengan tautan pribadi Anda. Tanggapan Anda hanya dibaca pengelola.</p>
  </form>
</div></section>
<script>(function(){var b=document.querySelector('[data-sr-salin]'),i=document.querySelector('[data-sr-tautan]');if(!b||!i)return;b.addEventListener('click',function(){i.select();(navigator.clipboard?navigator.clipboard.writeText(i.value):Promise.reject()).catch(function(){document.execCommand('copy')}).then(function(){b.textContent='Tersalin ✓'})})})();</script>`;
}

/* ── portal ──────────────────────────────────────────────────────────────────────────────────────────────────── */

export function kotakSaranPage(o: { items: ItemSaran[]; units: UnitItem[]; status: string; unit: string; semuaLembaga: boolean; hitung: Record<string, number> }): Raw {
  const tab = (st: string, label: string, n?: number) => html`<a class="p-tab" href="/portal/saran${st ? `?status=${st}` : ''}${o.unit ? `${st ? '&' : '?'}unit=${o.unit}` : ''}"${raw(o.status === st ? ' aria-current="page"' : '')}>${label}${n ? html` <b>${n}</b>` : ''}</a>`;
  return html`<div class="sr-p">
  <p class="p-kecil sr-p-ket">Pesan dari pengunjung situs untuk lembaga ${o.semuaLembaga ? 'mana pun (Anda melihat semua lembaga)' : 'Anda'}. <b>Balasan selalu tampil atas nama lembaga yang dituju.</b> ${o.semuaLembaga ? 'Super admin bisa menampilkan pesan pilihan di halaman publik /saran.' : ''}</p>
  <nav class="p-tabs" aria-label="Saring status">${tab('', 'Semua')}${tab('baru', 'Baru', o.hitung.baru)}${tab('dibaca', 'Sudah dibaca')}${tab('dibalas', 'Sudah dibalas')}${tab('selesai', 'Selesai')}${tab('tampil', 'Ditampilkan', o.hitung.tampil)}</nav>
  ${o.semuaLembaga ? html`<form method="get" action="/portal/saran" class="sr-p-saring">${o.status ? html`<input type="hidden" name="status" value="${o.status}">` : ''}<label class="p-bidang"><span>Lembaga tujuan</span><select name="unit" onchange="this.form.submit()"><option value="">Semua lembaga</option>${opsiTujuan(o.units, o.unit || '-')}</select></label><noscript><button class="tbl tbl-garis tbl-kecil">Saring</button></noscript></form>` : ''}
  ${o.items.length ? html`<ul class="sr-p-daftar">${o.items.map((x) => html`<li class="${x.s === 'baru' ? 'baru' : ''}"><a href="/portal/saran/${x.id}">
      <span class="sr-p-ikon sr-k-${x.k}" aria-hidden="true">${KATEGORI[x.k].ikon}</span>
      <span class="sr-p-isi"><strong>${x.n}</strong> <small>untuk ${singkatUnit(o.units, x.u)} · ${KATEGORI[x.k].label}</small><span>${x.c}</span></span>
      <span class="sr-p-meta"><time>${tanggal(x.t).replace(/ \d{4}$/, '')}</time><span class="sr-status sr-s-${x.s}">${STATUS_SARAN[x.s]}</span>${x.tp ? html`<span class="sr-status sr-s-tampil" title="Ditampilkan di situs">🌐</span>` : ''}${x.b ? html`<small>${x.b} balasan</small>` : ''}</span>
    </a></li>`)}</ul>` : html`<div class="p-kartu sr-p-kosong"><p>Belum ada pesan${o.status ? ' dengan status ini' : ''}. Pesan pengunjung dari halaman <a href="/saran" target="_blank" rel="noopener">Pesan &amp; Saran</a> dan <a href="/kontak" target="_blank" rel="noopener">Kontak</a> masuk ke sini.</p></div>`}
</div>`;
}

export function detailSaranPage(o: { s: Saran; units: UnitItem[]; lacak: string; wa: string | null; mail: string | null; bolehTampil: boolean; bolehTeruskan: boolean; csrf?: string }): Raw {
  const s = o.s;
  const tujuan = namaUnitSaran(o.units, s.unit);
  const sebagai = SEBAGAI.find(([v]) => v === s.sebagai)?.[1] ?? '';
  const tombolStatus = (st: StatusSaran, label: string) => (s.status === st ? '' : html`<button class="tbl tbl-garis tbl-kecil" name="status" value="${st}">${label}</button>`);
  return html`<div class="sr-p-detail">
  <div class="sr-p-utama">
    <div class="p-kartu sr-utas">
      <div class="sr-status-baris">${chipJenis(s.kategori)}<span class="sr-status sr-s-${s.status}">${STATUS_SARAN[s.status]}</span>${s.tampil ? html`<span class="sr-status sr-s-tampil">🌐 Ditampilkan di situs</span>` : ''}</div>
      <div class="sr-gelembung sr-dari-tamu"><p class="sr-gelembung-dari">${s.nama}${sebagai ? html` · ${sebagai}` : ''} <time>${waktu(s.t)}</time></p>${paragraf(s.isi)}</div>
      ${s.percakapan.map((u) => (u.dari === 'lembaga'
        ? html`<div class="sr-gelembung sr-dari-lembaga"><p class="sr-gelembung-dari">${namaUnitSaran(o.units, u.unit ?? s.unit)} <time>${waktu(u.t)}</time></p>${paragraf(u.isi)}<p class="sr-penulis">ditulis oleh ${u.olehNama ?? '—'} (hanya terlihat pengelola)</p></div>`
        : html`<div class="sr-gelembung sr-dari-tamu"><p class="sr-gelembung-dari">${s.nama} — tanggapan <time>${waktu(u.t)}</time></p>${paragraf(u.isi)}</div>`))}
    </div>
    <form method="post" action="/portal/saran/${s.id}/balas" class="p-kartu sr-p-balas">
      <h2>Balas sebagai ${tujuan}</h2>
      <p class="p-kecil">Balasan ditandatangani <b>${tujuan}</b>. Pengunjung membacanya lewat tautan pribadinya${s.tampil ? ', dan balasan ikut tampil di halaman publik karena pesan ini ditampilkan' : ''}.</p>
      <label class="p-bidang"><span>Isi balasan</span><textarea name="isi" rows="5" required minlength="2" maxlength="2000"></textarea></label>
      <div class="sr-p-baris-tbl"><button class="tbl tbl-emas" type="submit">Kirim balasan</button>${o.wa ? html`<a class="tbl tbl-garis" href="${o.wa}" target="_blank" rel="noopener">Kabari lewat WhatsApp</a>` : ''}${o.mail ? html`<a class="tbl tbl-garis" href="${o.mail}">Kabari lewat e-mail</a>` : ''}</div>
    </form>
  </div>
  <aside class="sr-p-sisi">
    <div class="p-kartu">
      <h2>Pengirim</h2>
      <dl class="sr-p-dl"><dt>Nama</dt><dd>${s.nama}${s.anonim ? html` <small>(minta disamarkan bila ditampilkan)</small>` : ''}</dd>${sebagai ? html`<dt>Sebagai</dt><dd>${sebagai}</dd>` : ''}<dt>Kontak</dt><dd>${s.kontak || html`<i>tidak diisi</i>`}</dd><dt>Untuk</dt><dd>${tujuan}</dd><dt>Dikirim</dt><dd>${waktu(s.t)}</dd>${s.dibacaOleh ? html`<dt>Dibuka</dt><dd>${s.dibacaOleh}${s.dibacaT ? html`, ${tanggal(s.dibacaT)}` : ''}</dd>` : ''}</dl>
      <p class="p-kecil">Tautan pribadi pengunjung (kirimkan bila ia kehilangan tautannya):</p>
      <div class="sr-salin"><input readonly value="${o.lacak}" aria-label="Tautan pribadi pengunjung" data-sr-tautan><button class="tbl tbl-garis tbl-kecil" type="button" data-sr-salin>Salin</button></div>
    </div>
    <form method="post" action="/portal/saran/${s.id}/status" class="p-kartu"><h2>Status</h2><div class="sr-p-baris-tbl">${tombolStatus('selesai', 'Tandai selesai')}${tombolStatus('dibaca', 'Buka lagi')}${tombolStatus('baru', 'Tandai belum dibaca')}</div></form>
    ${o.bolehTeruskan ? html`<form method="post" action="/portal/saran/${s.id}/teruskan" class="p-kartu"><h2>Teruskan ke lembaga lain</h2><p class="p-kecil">Bila pengunjung salah memilih tujuan.</p><label class="p-bidang"><span>Lembaga tujuan</span><select name="unit">${opsiTujuan(o.units, s.unit)}</select></label><button class="tbl tbl-garis tbl-kecil" type="submit">Teruskan</button></form>` : ''}
    ${o.bolehTampil ? html`<form method="post" action="/portal/saran/${s.id}/tampil" class="p-kartu sr-p-tampil"><h2>Tampil di situs</h2>
      <p class="p-kecil">${s.tampil ? 'Pesan ini sedang tampil di halaman publik Pesan & Saran beserta balasan lembaga. Kontak tidak pernah tampil.' : 'Pesan ini tersembunyi. Tampilkan bila layak dibaca umum (misalnya kesan baik atau jawaban yang berguna bagi banyak orang).'}</p>
      <label class="sr-centang"><input type="checkbox" name="anonim" value="1"${raw(s.anonim ? ' checked' : '')}><span>Samarkan nama („${NAMA_SAMARAN}“)</span></label>
      <button class="tbl ${s.tampil ? 'tbl-garis' : 'tbl-emas'} tbl-kecil" name="tampil" value="${s.tampil ? '0' : '1'}">${s.tampil ? 'Sembunyikan dari situs' : 'Tampilkan di situs'}</button>
      ${s.tampil ? html`<button class="tbl-teks" name="tampil" value="1">Simpan pilihan nama</button>` : ''}</form>
    <form method="post" action="/portal/saran/${s.id}/hapus" class="p-kartu sr-p-hapus" onsubmit="return confirm('Hapus pesan ini untuk selamanya?')"><h2>Hapus</h2><p class="p-kecil">Untuk pesan iklan / spam. Tidak bisa dibatalkan.</p><button class="tbl tbl-garis tbl-kecil sr-tbl-bahaya" type="submit">Hapus pesan</button></form>` : ''}
    ${s.riwayat?.length ? html`<div class="p-kartu"><h2>Riwayat</h2><ul class="sr-p-riwayat">${s.riwayat.slice().reverse().slice(0, 12).map((r) => html`<li><b>${r.oleh}</b> ${({ balas: 'membalas', tampilkan: 'menampilkan di situs', sembunyikan: 'menyembunyikan dari situs', teruskan: 'meneruskan', pindah: 'memindahkan' } as Record<string, string>)[r.aksi] ?? r.aksi.replace('status:', 'mengubah status → ')}${r.ket ? html` <small>(${r.ket})</small>` : ''} <time>${tanggal(r.t)}</time></li>`)}</ul></div>` : ''}
  </aside>
</div>
<script>(function(){var b=document.querySelector('[data-sr-salin]'),i=document.querySelector('[data-sr-tautan]');if(!b||!i)return;b.addEventListener('click',function(){i.select();(navigator.clipboard?navigator.clipboard.writeText(i.value):Promise.reject()).catch(function(){document.execCommand('copy')}).then(function(){b.textContent='Tersalin ✓'})})})();</script>`;
}

/** Kartu ringkas di beranda Pesan portal (menggantikan kartu formulir kontak lama). */
export function kartuSaranPesan(o: { baru: number; terakhir: (ItemSaran & { unitNama: string })[] }): Raw {
  return html`<section class="p-kartu ps-pengunjung"><div class="ps-kepala"><h2>Pesan &amp; saran pengunjung${o.baru ? html` <b class="ps-belum">${o.baru}</b>` : ''}</h2><a class="tbl tbl-garis tbl-kecil" href="/portal/saran">Buka kotak →</a></div>
    ${o.terakhir.length ? html`<ul class="ps-daftar">${o.terakhir.map((k) => html`<li${raw(k.s === 'baru' ? ' class="belum"' : '')}><a href="/portal/saran/${k.id}"><span class="ps-av ps-av-tamu" aria-hidden="true">${KATEGORI[k.k].ikon}</span><span class="ps-isi"><strong>${k.n}</strong><small>untuk ${k.unitNama} · ${k.c}</small></span><time>${tanggal(k.t).replace(/ \d{4}$/, '')}</time></a></li>`)}</ul>` : html`<p class="p-kecil">Belum ada pesan dari pengunjung.</p>`}
  </section>`;
}
