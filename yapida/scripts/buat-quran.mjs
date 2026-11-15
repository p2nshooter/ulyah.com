/**
 * Membangkitkan aset Al-Qur'an mushaf Utsmani di public/assets/quran/ (pemilik: „Quran mushaf ustmani nya kok g ada“).
 *
 * Sumber (hanya DATA yang dibaca — kode paketnya tidak dijalankan):
 *  - @quran.ws/text 0.1.0 (CC BY 4.0): teks Hafs rasm Utsmani KFGQPC v3, 604 halaman × baris mushaf Madinah, tanda
 *    waqaf/sajdah, juz. Font KFGQPC HAFS Uthmanic Script v3 disalin APA ADANYA (lisensinya melarang diubah).
 *  - quran-json 3.1.2 (CC BY 4.0, data yang sama dengan ulyah.com): terjemah Indonesia dan transliterasi.
 *
 * Ambil datanya ke folder kosong, lalu jalankan dari folder yapida:
 *   npm pack @quran.ws/text@0.1.0 quran-json@3.1.2 && tar xzf … (masing-masing ke foldernya sendiri)
 *   node scripts/buat-quran.mjs <folder-paket-quran.ws> <folder-paket-quran-json>
 */
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [qws, qjson] = process.argv.slice(2);
if (!qws || !qjson) { console.error('pakai: node scripts/buat-quran.mjs <paket @quran.ws/text> <paket quran-json>'); process.exit(1); }
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'quran');
const d = JSON.parse(readFileSync(join(qws, 'data', 'hafs.json'), 'utf8'));
const W = d.words;
const N = W.length;

const AR_DIGIT = '٠١٢٣٤٥٦٧٨٩';
const angkaArab = (n) => String(n).replace(/\d/g, (x) => AR_DIGIT[Number(x)]);

/* Tanda per kata: „before“ (۞) ditulis di depan dengan spasi, „after“ (waqaf, ۩) ditempel tanpa spasi. */
const sebelum = new Map(), sesudah = new Map();
for (const [pos, t] of d.marks) {
  const m = d.mark_types[t];
  const peta = m.side === 'before' ? sebelum : sesudah;
  peta.set(pos, (peta.get(pos) ?? '') + m.sign);
}
const sajdah = new Set(d.marks.filter(([, t]) => d.mark_types[t].kind === 'sajdah').map(([p]) => p));
const kata = (i) => `${sebelum.has(i) ? `${sebelum.get(i)} ` : ''}${W[i]}${sesudah.get(i) ?? ''}`;

/* Peta kata → surah, ayat, halaman, juz. */
const akhir = (arr, i) => (i + 1 < arr.length ? arr[i + 1] : N);
const ayahKata = new Int32Array(N).fill(-1);
const surahAyah = []; // ordinal ayat → [surah, nomor]
for (const s of d.surahs) for (let k = 0; k < s.ayah_count; k += 1) surahAyah[s.first_ayah + k] = [s.number, k + 1];
for (let a = 0; a < d.ayah_starts.length; a += 1) for (let i = d.ayah_starts[a]; i < akhir(d.ayah_starts, a); i += 1) ayahKata[i] = a;
// Basmalah tak bernomor (sebelum ayat 1 surah selain Al-Fatihah) tidak termasuk ayat mana pun.
for (const s of d.surahs) {
  const awal = d.surah_starts[s.number - 1];
  for (let i = awal; i < d.ayah_starts[s.first_ayah]; i += 1) ayahKata[i] = -1;
}
const halamanKata = new Int32Array(N), juzKata = new Int32Array(N);
for (let p = 0; p < d.page_starts.length; p += 1) for (let i = d.page_starts[p]; i < akhir(d.page_starts, p); i += 1) halamanKata[i] = p + 1;
for (let j = 0; j < d.juz_starts.length; j += 1) for (let i = d.juz_starts[j]; i < akhir(d.juz_starts, j); i += 1) juzKata[i] = j + 1;
const awalAyat = new Set(d.ayah_starts);
const akhirAyat = new Set(d.ayah_starts.map((_, a) => akhir(d.ayah_starts, a) - 1));
const awalSurah = new Map(d.surah_starts.map((w, i) => [w, i + 1]));

/* Terjemah & transliterasi (quran-json). Rujukan catatan kaki „Kursi-Nya96)“ dibuang. */
const bersihTr = (t) => String(t ?? '').replace(/([^\s\d(])\d{1,4}\)/g, '$1').replace(/\s+/g, ' ').trim();
const qj = new Map();
for (let s = 1; s <= 114; s += 1) qj.set(s, JSON.parse(readFileSync(join(qjson, 'dist', 'chapters', 'id', `${s}.json`), 'utf8')));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 's'), { recursive: true });
mkdirSync(join(OUT, 'h'), { recursive: true });

/* ── per surah ─────────────────────────────────────────────────────────── */
const meta = { v: 1, surah: [], juz: [], halaman: [] };
let global = 0;
for (const s of d.surahs) {
  const j = qj.get(s.number);
  if (j.total_verses !== s.ayah_count) throw new Error(`jumlah ayat surah ${s.number} berbeda`);
  const ayat = [];
  for (let k = 0; k < s.ayah_count; k += 1) {
    const ord = s.first_ayah + k;
    const dari = d.ayah_starts[ord], sampai = akhir(d.ayah_starts, ord);
    const teks = [];
    let sj = false;
    for (let i = dari; i < sampai; i += 1) { teks.push(kata(i)); if (sajdah.has(i)) sj = true; }
    global += 1;
    ayat.push({ a: k + 1, ar: teks.join(' '), tr: bersihTr(j.verses[k].translation), lt: j.verses[k].transliteration, h: halamanKata[dari], j: juzKata[dari], g: global, ...(sj ? { sj: 1 } : {}) });
  }
  const basmalah = s.has_basmalah && s.number !== 1;
  writeFileSync(join(OUT, 's', `${s.number}.json`), JSON.stringify({ n: s.number, basmalah, ayat }));
  meta.surah.push({ n: s.number, ar: s.name_ar, lt: j.transliteration, id: j.translation, en: s.name_en, ayat: s.ayah_count, tempat: s.revelation, hal: halamanKata[d.surah_starts[s.number - 1]], g: global - s.ayah_count + 1 });
}
for (let jz = 0; jz < d.juz_starts.length; jz += 1) {
  const w = d.juz_starts[jz];
  const [sn, an] = surahAyah[ayahKata[w]];
  meta.juz.push({ n: jz + 1, hal: halamanKata[w], mulai: `${sn}:${an}` });
}

/* ── per halaman: baris mushaf, kepala surah, basmalah ────────────────────── */
// Basmalah kepala surah memakai kata-kata ayat 1 Al-Fatihah dari rilis yang sama (titik kode sesuai font).
meta.basmalah = W.slice(d.ayah_starts[0], d.ayah_starts[1]).join(' ');
for (let p = 0; p < d.page_starts.length; p += 1) {
  const dari = d.page_starts[p], sampai = akhir(d.page_starts, p);
  const garis = d.line_starts.filter((x) => x >= dari && x < sampai);
  const baris = [];
  const surat = new Set();
  for (let li = 0; li < garis.length; li += 1) {
    const ls = garis[li];
    const le = li + 1 < garis.length ? garis[li + 1] : sampai;
    // Kepala surah (dan basmalah) sebelum baris yang dimulai dengan kata pertama surah.
    if (awalSurah.has(ls)) {
      const sn = awalSurah.get(ls);
      const s = d.surahs[sn - 1];
      baris.push({ t: 'surat', n: sn });
      if (s.has_basmalah && sn !== 1) {
        // Basmalah sebagai kata tak bernomor di data: dilewati di sini karena dicetak sebagai baris sendiri.
        baris.push({ t: 'basmalah' });
      }
    }
    const token = [];
    for (let i = ls; i < le; i += 1) {
      const a = ayahKata[i];
      if (a < 0) continue; // basmalah tak bernomor: sudah dicetak sebagai baris basmalah
      const [sn, an] = surahAyah[a];
      surat.add(sn);
      token.push([kata(i), `${sn}:${an}`, akhirAyat.has(i) ? an : 0]);
    }
    if (token.length) baris.push({ t: 'b', k: token });
  }
  const pertama = d.ayah_starts.findIndex((x) => x >= dari);
  const [fs, fa] = surahAyah[ayahKata[d.page_starts[p]] >= 0 ? ayahKata[d.page_starts[p]] : pertama];
  meta.halaman.push(`${fs}:${fa}`);
  writeFileSync(join(OUT, 'h', `${p + 1}.json`), JSON.stringify({ p: p + 1, juz: juzKata[dari], surat: [...surat], baris }));
}
writeFileSync(join(OUT, 'meta.json'), JSON.stringify(meta));
copyFileSync(join(qws, 'data', d.font.file), join(OUT, 'uthmani-hafs.ttf'));
writeFileSync(join(OUT, 'SUMBER.txt'), [
  'Teks & tata letak mushaf: quran-text (@quran.ws/text 0.1.0, https://quran.ws), CC BY 4.0 — KFGQPC Uthmanic Hafs v3 (Kompleks Percetakan Al-Qur’an Raja Fahd).',
  'Font: KFGQPC HAFS Uthmanic Script v3 © King Fahd Glorious Quran Printing Complex — disalin tanpa perubahan sesuai lisensinya (boleh dipakai, disalin, disebarkan gratis; tidak boleh diubah atau dijual).',
  'Terjemah Indonesia & transliterasi: quran-json 3.1.2 (https://github.com/risan/quran-json), CC BY 4.0.',
  `Simbol akhir ayat: U+06DD + angka Arab, mis. ۝${angkaArab(255)}.`,
  '',
].join('\n'));
console.log(`114 surah, ${global} ayat, ${d.page_starts.length} halaman → ${OUT}`);
