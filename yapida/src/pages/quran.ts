/** Al-Qur'an mushaf Utsmani: daftar surah & juz, baca per surah (terjemah, tafsir, murottal), dan halaman mushaf. */
import { html, jsonScript, raw, type Raw } from '../lib/html.ts';
import { hiasan, icon } from './layout.ts';
import { kepalaHalaman } from './public.ts';

export interface SurahMeta { n: number; ar: string; lt: string; id: string; en: string; ayat: number; tempat: 'makki' | 'madani'; hal: number; g: number }
export interface QuranMeta { v: 1; surah: SurahMeta[]; juz: { n: number; hal: number; mulai: string }[]; halaman: string[]; basmalah: string }
export interface Ayat { a: number; ar: string; tr: string; lt: string; h: number; j: number; g: number; sj?: 1 }
export interface SurahData { n: number; basmalah: boolean; ayat: Ayat[] }
export type Token = [string, string, number];
export interface HalamanData { p: number; juz: number; surat: number[]; baris: ({ t: 'surat'; n: number } | { t: 'basmalah' } | { t: 'b'; k: Token[] })[] }

/** Qari murottal per ayat (everyayah.com; Alafasy cadangan dari cdn.islamic.network). */
export const QARI: { id: string; nama: string }[] = [
  { id: 'Alafasy_128kbps', nama: 'Mishary Rasyid Al-Afasy' },
  { id: 'Husary_128kbps', nama: 'Mahmoud Khalil Al-Husary' },
  { id: 'Abdul_Basit_Murattal_192kbps', nama: 'Abdul Basit (murattal)' },
  { id: 'Minshawy_Murattal_128kbps', nama: 'Muhammad Siddiq Al-Minshawi' },
  { id: 'Abdullah_Basfar_192kbps', nama: 'Abdullah Basfar' },
];

const AR_DIGIT = '٠١٢٣٤٥٦٧٨٩';
export const angkaArab = (n: number) => String(n).replace(/\d/g, (x) => AR_DIGIT[Number(x)]!);
const TEMPAT = { makki: 'Makkiyah', madani: 'Madaniyah' } as const;
const nomorBintang = (n: number | string, kelas = '') => html`<span class="q-bintang ${kelas}" aria-hidden="true"><span>${n}</span></span>`;
const SUMBER = html`<p class="q-sumber">Teks dan tata letak mushaf: <a href="https://quran.ws" rel="noopener nofollow">quran-text</a> (CC BY 4.0) dari rilis KFGQPC Uthmanic Hafs v3 · font KFGQPC HAFS Uthmanic Script © Kompleks Percetakan Al-Qur’an Raja Fahd, disalin tanpa perubahan · terjemah Indonesia & latin: <a href="https://github.com/risan/quran-json" rel="noopener nofollow">quran-json</a> (CC BY 4.0) · tafsir: Tafsir Kemenag RI lewat equran.id · murottal: everyayah.com.</p>`;

const PILIHAN: [string, string, string][] = [
  ['Yasin', '/quran/36', 'يس'], ['Al-Kahfi', '/quran/18', 'الكهف'], ['Al-Mulk', '/quran/67', 'الملك'], ['Al-Waqi’ah', '/quran/56', 'الواقعة'],
  ['Ar-Rahman', '/quran/55', 'الرحمن'], ['Ayat Kursi', '/quran/2#ayat-255', 'آية الكرسي'], ['Juz ’Amma', '/quran/halaman/582', 'جزء عم'],
];

export function quranIndex(m: QuranMeta): Raw {
  return html`<section class="q-hero">
  <div class="pola-bintang" aria-hidden="true"></div>
  <div class="wadah q-hero-isi">
    <nav class="remah" aria-label="Remah roti"><a href="/">Beranda</a><a href="/ibadah">Ibadah</a><span aria-current="page">Al-Qur’an</span></nav>
    <p class="q-hero-ar" lang="ar" dir="rtl">ٱلۡقُرۡءَانُ ٱلۡكَرِيمُ</p>
    <h1>Al-Qur’an Mushaf Utsmani</h1>
    <p class="lead">Rasm Utsmani riwayat Hafs, 604 halaman persis mushaf Madinah — dengan terjemah, tafsir Kemenag, dan murottal per ayat yang menyorot ayat yang sedang dibaca.</p>
    <div class="q-hero-aksi">
      <a class="tbl tbl-emas" href="/quran/halaman/1">${icon('buku')}<span>Buka mushaf</span></a>
      <a class="tbl tbl-kaca" href="/quran/1" data-q-lanjut hidden>${icon('panah')}<span data-q-lanjut-label>Lanjutkan membaca</span></a>
    </div>
    <form class="q-lompat" data-q-lompat role="search">
      <label class="sr" for="q-cari">Cari surah atau lompat ke ayat</label>
      <input id="q-cari" type="search" placeholder="Cari surah (mis. Yasin) atau ketik 2:255 / hal 50" autocomplete="off" data-q-cari>
      <button class="tbl tbl-emas" type="submit">Buka</button>
    </form>
  </div>
  <svg class="hero-lengkung" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90V52c120 0 120-40 240-40s120 40 240 40 120-40 240-40 120 40 240 40 120-40 240-40 120 40 240 40v38Z"/></svg>
</section>
<section class="bagian"><div class="wadah">
  <div class="q-pilihan muncul">${PILIHAN.map(([l, h, ar]) => html`<a class="q-pil" href="${h}"><span lang="ar" dir="rtl">${ar}</span><b>${l}</b></a>`)}</div>
  <div class="q-tab" role="tablist">
    <button type="button" role="tab" aria-selected="true" data-q-tab="surah">Surah</button>
    <button type="button" role="tab" aria-selected="false" data-q-tab="juz">Juz</button>
  </div>
  <div class="q-kisi" data-q-panel="surah">${m.surah.map((s) => html`<a class="q-surah muncul" href="/quran/${s.n}" data-q-nama="${`${s.lt} ${s.id} ${s.en} ${s.n}`.toLowerCase()}">
    ${nomorBintang(s.n)}
    <span class="q-surah-teks"><b>${s.lt}</b><small>${s.id} · ${s.ayat} ayat · ${TEMPAT[s.tempat]}</small></span>
    <span class="q-surah-ar" lang="ar" dir="rtl">${s.ar}</span>
  </a>`)}</div>
  <div class="q-kisi q-kisi-juz" data-q-panel="juz" hidden>${m.juz.map((j) => {
    const [sn, an] = j.mulai.split(':').map(Number) as [number, number];
    const s = m.surah[sn - 1]!;
    return html`<a class="q-surah" href="/quran/halaman/${j.hal}">${nomorBintang(j.n)}<span class="q-surah-teks"><b>Juz ${j.n}</b><small>Mulai ${s.lt} ayat ${an} · hal. ${j.hal}</small></span><span class="q-surah-ar" lang="ar" dir="rtl">الجزء ${angkaArab(j.n)}</span></a>`;
  })}</div>
  ${hiasan}
  ${SUMBER}
</div></section>
${jsonScript('q-meta', m.surah.map((s) => [s.n, s.lt, s.ayat, s.hal]))}`;
}

/* ── per surah ─────────────────────────────────────────────────────────── */

export function surahPage(m: QuranMeta, d: SurahData): Raw {
  const s = m.surah[d.n - 1]!;
  const sebelum = m.surah[d.n - 2];
  const sesudah = m.surah[d.n];
  return html`<section class="q-kepala-surah">
  <div class="pola-bintang" aria-hidden="true"></div>
  <div class="wadah">
    <nav class="remah" aria-label="Remah roti"><a href="/">Beranda</a><a href="/quran">Al-Qur’an</a><span aria-current="page">${s.lt}</span></nav>
    <div class="q-bingkai-surah">
      <p class="q-nama-ar" lang="ar" dir="rtl">سُورَةُ ${s.ar}</p>
      <h1>Surat ${s.lt}</h1>
      <p class="q-info">${s.id} · ${s.ayat} ayat · ${TEMPAT[s.tempat]} · juz ${d.ayat[0]!.j} · <a href="/quran/halaman/${s.hal}">mushaf hal. ${s.hal}</a></p>
    </div>
  </div>
</section>
<div class="q-alat" data-q-alat>
  <div class="wadah q-alat-isi">
    <button class="tbl tbl-emas tbl-kecil" type="button" data-q-putar-semua>▶ <span>Putar surah</span></button>
    <label class="q-sel"><span>Qari</span><select data-q-qari>${QARI.map((q) => html`<option value="${q.id}">${q.nama}</option>`)}</select></label>
    <label class="q-sel"><span>Ulangi</span><select data-q-ulang><option value="1">1×</option><option value="3">3×</option><option value="5">5×</option><option value="10">10×</option></select></label>
    <div class="q-tukar" role="group" aria-label="Tampilan">
      <button type="button" data-q-tampil="lt" aria-pressed="false">Latin</button>
      <button type="button" data-q-tampil="tr" aria-pressed="true">Terjemah</button>
      <button type="button" data-q-tampil="hafal" aria-pressed="false">Hafalan</button>
      <button type="button" data-q-huruf="-1" aria-label="Huruf Arab lebih kecil">A−</button>
      <button type="button" data-q-huruf="1" aria-label="Huruf Arab lebih besar">A+</button>
    </div>
  </div>
</div>
<section class="bagian q-baca" data-q-surah="${d.n}" data-q-jumlah="${s.ayat}" data-q-awal="${s.g}" data-q-tampil-lt="0" data-q-tampil-tr="1"><div class="wadah q-sempit">
  ${d.basmalah ? html`<p class="q-basmalah" lang="ar" dir="rtl">${m.basmalah}</p>` : ''}
  ${d.ayat.map((a) => html`<article class="q-ayat" id="ayat-${a.a}" data-a="${a.a}" data-g="${a.g}">
    <div class="q-ayat-atas">
      ${nomorBintang(a.a)}
      <span class="q-ayat-letak">juz ${a.j} · hal. ${a.h}${a.sj ? html` · <b class="q-sajdah">ayat sajdah ۩</b>` : ''}</span>
      <span class="q-ayat-aksi">
        <button type="button" data-q-putar="${a.a}" aria-label="Putar ayat ${a.a}">▶</button>
        <button type="button" data-q-tafsir="${a.a}" aria-expanded="false">Tafsir</button>
        <button type="button" data-q-tanda="${a.a}" aria-pressed="false" aria-label="Tandai ayat ${a.a}">🔖</button>
        <button type="button" data-q-salin="${a.a}" aria-label="Salin ayat ${a.a}">⧉</button>
      </span>
    </div>
    <p class="q-ar" lang="ar" dir="rtl">${a.ar} <span class="q-akhir">۝${angkaArab(a.a)}</span></p>
    <p class="q-lt" data-q-lt>${a.lt}</p>
    <p class="q-tr" data-q-tr><b>${a.a}.</b> ${a.tr}</p>
    <div class="q-tafsir" data-q-tafsir-isi hidden></div>
  </article>`)}
  <nav class="q-nav-surah">
    ${sebelum ? html`<a class="tbl tbl-garis" href="/quran/${sebelum.n}">‹ ${sebelum.lt}</a>` : html`<span></span>`}
    <a class="tbl tbl-garis" href="/quran">Daftar surah</a>
    ${sesudah ? html`<a class="tbl tbl-garis" href="/quran/${sesudah.n}">${sesudah.lt} ›</a>` : html`<span></span>`}
  </nav>
  ${SUMBER}
</div></section>
<div class="q-pemutar" data-q-pemutar hidden><span data-q-pemutar-label>—</span><button type="button" data-q-jeda>❚❚</button><button type="button" data-q-henti>■</button></div>
${jsonScript('q-data', { n: d.n, lt: s.lt, ayat: s.ayat, sesudah: sesudah ? sesudah.n : null })}`;
}

/* ── halaman mushaf ────────────────────────────────────────────────────── */

/** Satu halaman mushaf: 15 baris rata kanan-kiri, kepala surah berbingkai, basmalah, tanda akhir ayat. */
export function halamanMushaf(m: QuranMeta, h: HalamanData): Raw {
  const awal = h.p <= 2;
  const baris = h.baris.map((b) => {
    if (b.t === 'surat') return html`<div class="m-surat"><span lang="ar" dir="rtl">سُورَةُ ${m.surah[b.n - 1]!.ar}</span></div>`;
    if (b.t === 'basmalah') return html`<div class="m-basmalah" lang="ar" dir="rtl">${m.basmalah}</div>`;
    return html`<div class="m-baris" lang="ar" dir="rtl">${b.k.map(([w, k, akhir]) => html`<span class="w" data-a="${k}">${w}</span>${akhir ? html` <span class="m-akhir" data-a="${k}">۝${angkaArab(akhir)}</span>` : ''} `)}</div>`;
  });
  const nama = h.surat.map((n) => m.surah[n - 1]!);
  return html`<div class="mushaf-wadah" data-mushaf="${h.p}">
  <div class="mushaf-alat">
    <a class="mushaf-kembali" href="/quran" aria-label="Daftar surah">‹ Al-Qur’an</a>
    <label><span class="sr">Surah</span><select data-m-surah>${m.surah.map((s) => html`<option value="${s.hal}"${raw(nama[0]?.n === s.n ? ' selected' : '')}>${s.n}. ${s.lt}</option>`)}</select></label>
    <label><span class="sr">Juz</span><select data-m-juz>${m.juz.map((j) => html`<option value="${j.hal}"${raw(j.n === h.juz ? ' selected' : '')}>Juz ${j.n}</option>`)}</select></label>
    <label class="m-hal-isian"><span>Hal.</span><input type="number" min="1" max="604" value="${h.p}" data-m-hal inputmode="numeric"></label>
    <button class="tbl tbl-emas tbl-kecil" type="button" data-m-putar>▶ <span>Dengarkan</span></button>
    <label class="m-qari"><span class="sr">Qari</span><select data-q-qari>${QARI.map((q) => html`<option value="${q.id}">${q.nama}</option>`)}</select></label>
  </div>
  <div class="mushaf-panggung">
    <a class="m-panah m-berikut" href="${h.p < 604 ? `/quran/halaman/${h.p + 1}` : '/quran'}" data-m-ke="${h.p + 1}" aria-label="Halaman berikutnya" rel="next">‹</a>
    <article class="mushaf${awal ? ' mushaf-awal' : ''}" data-m-halaman lang="ar" dir="rtl" aria-label="Mushaf halaman ${h.p}">
      <header class="m-kepala"><span>${nama.map((s) => s.ar).join(' · ')}</span><span>الجزء ${angkaArab(h.juz)}</span></header>
      <div class="m-isi" data-m-isi>${baris}</div>
      <footer class="m-kaki"><span>${angkaArab(h.p)}</span></footer>
    </article>
    <a class="m-panah m-sebelum" href="${h.p > 1 ? `/quran/halaman/${h.p - 1}` : '/quran'}" data-m-ke="${h.p - 1}" aria-label="Halaman sebelumnya" rel="prev">›</a>
  </div>
  <p class="m-keterangan">Halaman ${h.p} dari 604 · juz ${h.juz} · ${nama.map((s) => s.lt).join(', ')} — ketuk sebuah ayat untuk terjemah, tafsir, dan murottalnya. Geser atau pakai panah untuk membalik halaman.</p>
  <div class="m-lembar-ayat" data-m-ayat hidden role="dialog" aria-label="Ayat terpilih">
    <button type="button" class="m-tutup" data-m-tutup aria-label="Tutup">✕</button>
    <p class="m-ayat-judul" data-m-ayat-judul></p>
    <p class="q-ar" lang="ar" dir="rtl" data-m-ayat-ar></p>
    <p class="q-tr" data-m-ayat-tr></p>
    <div class="m-ayat-aksi"><button class="tbl tbl-emas tbl-kecil" type="button" data-m-ayat-putar>▶ Putar ayat</button><button class="tbl tbl-garis tbl-kecil" type="button" data-m-ayat-tafsir>Tafsir</button><a class="tbl tbl-garis tbl-kecil" data-m-ayat-buka href="/quran">Baca per surah</a></div>
    <div class="q-tafsir" data-m-ayat-tafsir-isi hidden></div>
  </div>
  <div class="wadah">${SUMBER}</div>
</div>
${jsonScript('m-meta', { p: h.p, surah: m.surah.map((s) => [s.n, s.lt, s.ar, s.g, s.ayat]), basmalah: m.basmalah })}`;
}

export function surahIndexJudul(s: SurahMeta): { title: string; desc: string } {
  return {
    title: `Surat ${s.lt} (${s.ar}) — ${s.ayat} Ayat, Arab Utsmani, Latin, Terjemah & Tafsir | Yapida`,
    desc: `Baca Surat ${s.lt} (${s.id}) ${s.ayat} ayat lengkap: teks Arab rasm Utsmani, latin, terjemah Indonesia, tafsir Kemenag, dan murottal per ayat — mushaf halaman ${s.hal}.`,
  };
}

export const quranHeader = (judul: string, lead: string) => kepalaHalaman(judul, lead, [['Al-Qur’an', '/quran']], 'Al-Qur’an');
