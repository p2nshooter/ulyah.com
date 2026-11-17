/**
 * Buku Pelajaran Yapida (pemilik, 17 Nov 2026: „g ada bukunya saat di klik … Tolong yg bener bukunya, yg antara menu
 * pelajaran madrasah dengan rak“): satu naskah per mata pelajaran per kelas — pelajaran/<jenjang>/<kelas>/<slug>.md,
 * slug = slug mapel di src/data/kurikulum.ts. Naskah yang sama menjadi:
 *   1. buku di rak MI/MTs dan di peta Pelajaran Madrasah (scripts/buat-pustaka.ts) — id k-pel-<jenjang>-<kelas>-<slug>;
 *   2. paket „Latihan Ganjil/Genap“ bank soal siswa (scripts/buat-soal.ts) dari kuis & pasangan di tiap bab.
 *
 * Aturan naskah (di atas format Markdown pustaka — src/data/buku.ts):
 *   # Semester Ganjil | # Semester Genap      bab-bab sesudahnya milik semester itu
 *   ::surah 105        teks mushaf + terjemah per ayat dari public/assets/quran (tidak pernah diketik ulang)
 *   ::surah 2:183-184  potongan ayat
 *   ::sambung 105      tiga kuis „lanjutan ayat“ dibangkitkan dari mushaf
 *   ::kuis Soal? | *jawaban benar | pengecoh | pengecoh >> pembahasan (tampil sesudah menjawab)
 *   ::cocok kiri = kanan; kiri = kanan          ::kartu depan | belakang
 */
import fs from 'node:fs';
import path from 'node:path';

const AKAR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const DIR_PELAJARAN = path.join(AKAR, 'pelajaran');
const QURAN = path.join(AKAR, 'public', 'assets', 'quran');

interface Ayat { a: number; ar: string; tr: string }
interface SurahMeta { n: number; ar: string; lt: string; id: string; ayat: number; tempat: 'makki' | 'madani' }
let metaSurah: SurahMeta[] | null = null;
const surahCache = new Map<number, { basmalah: boolean; ayat: Ayat[] }>();
export function surahInfo(n: number): SurahMeta {
  metaSurah ??= (JSON.parse(fs.readFileSync(path.join(QURAN, 'meta.json'), 'utf8')) as { surah: SurahMeta[] }).surah;
  const m = metaSurah.find((x) => x.n === n);
  if (!m) throw new Error(`surah ${n} tidak ada`);
  return m;
}
export function ayatSurah(n: number): { basmalah: boolean; ayat: Ayat[] } {
  if (!surahCache.has(n)) surahCache.set(n, JSON.parse(fs.readFileSync(path.join(QURAN, 's', `${n}.json`), 'utf8')) as { basmalah: boolean; ayat: Ayat[] });
  return surahCache.get(n)!;
}
const ANGKA_AR = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]!);
/** Terjemah mushaf (teks polos, tanpa tag) dirapikan spasinya. */
const bersihTr = (s: string) => s.replace(/\s+/g, ' ').trim();
export const namaSurah = (n: number) => { const m = surahInfo(n); return `QS. ${m.lt}`; };

/** ::surah 105 | ::surah 2:183-184 → blok Arab (dengan nomor ayat) + terjemah per ayat. */
function bukaSurah(arg: string, berkas: string): string[] {
  const m = /^(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?$/.exec(arg.trim());
  if (!m) throw new Error(`${berkas}: ::surah ${arg} tidak dikenali`);
  const n = Number(m[1]);
  const info = surahInfo(n);
  const { basmalah, ayat } = ayatSurah(n);
  const dari = m[2] ? Number(m[2]) : 1, sampai = m[3] ? Number(m[3]) : m[2] ? Number(m[2]) : info.ayat;
  const pilih = ayat.filter((x) => x.a >= dari && x.a <= sampai);
  if (!pilih.length) throw new Error(`${berkas}: QS ${n}:${dari}-${sampai} kosong`);
  const utuh = dari === 1 && sampai === info.ayat;
  const out = [`### ${namaSurah(n)} (${info.id})${utuh ? ` — ${info.ayat} ayat, ${info.tempat === 'makki' ? 'Makkiyah' : 'Madaniyah'}` : ` ayat ${dari}${sampai > dari ? `–${sampai}` : ''}`}`];
  if (utuh && basmalah && n !== 1 && n !== 9) out.push('::ar بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
  for (const x of pilih) out.push(`::ar ${x.ar.trim()} ﴿${ANGKA_AR(x.a)}﴾`, `::tr (${x.a}) ${bersihTr(x.tr)}`);
  return out;
}

/** Bilangan semu tetap dari teks (pilihan pengecoh yang sama setiap kali dibangun). */
function benih(s: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}
const pendek = (s: string, n = 90) => { const t = s.trim(); return t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')} …` : t; };

/** ::sambung 105 → tiga kuis „lanjutan ayat“: pertanyaan = ayat k, jawaban = ayat k+1, pengecoh = ayat lain surah itu. */
function sambungAyat(arg: string, berkas: string): string[] {
  const n = Number(arg.trim());
  if (!Number.isInteger(n) || n < 1 || n > 114) throw new Error(`${berkas}: ::sambung ${arg} tidak dikenali`);
  const { ayat } = ayatSurah(n);
  if (ayat.length < 3) return [];
  const acak = benih(`sambung-${n}`);
  const k = Math.min(3, ayat.length - 1);
  const awal: number[] = [];
  while (awal.length < k) { const i = Math.floor(acak() * (ayat.length - 1)); if (!awal.includes(i)) awal.push(i); }
  return awal.sort((a, b) => a - b).map((i) => {
    const benar = ayat[i + 1]!;
    const lain = ayat.filter((x, j) => j !== i + 1 && j !== i && pendek(x.ar, 70) !== pendek(benar.ar, 70));
    const peng: string[] = [];
    while (peng.length < 2 && lain.length) peng.push(pendek(lain.splice(Math.floor(acak() * lain.length), 1)[0]!.ar, 70));
    return `::kuis Lanjutan ayat berikut adalah …  ${pendek(ayat[i]!.ar, 90)} | *${pendek(benar.ar, 70)} | ${peng.join(' | ')} >> ${namaSurah(n)} ayat ${benar.a}: „${pendek(bersihTr(benar.tr), 120)}“`;
  });
}

/** „isi >> pembahasan“ → [isi, pembahasan] tanpa regex (indexOf) agar aman untuk teks panjang. */
export function pisahBahas(x: string): [string, string] {
  const i = x.indexOf('>>');
  return i < 0 ? [x.trim(), ''] : [x.slice(0, i).trim(), x.slice(i + 2).trim()];
}

export interface BabPelajaran { judul: string; judulAr?: string; smt: 'ganjil' | 'genap'; teks: string }
export interface NaskahPelajaran { berkas: string; jenjang: 'mi' | 'mts'; kelas: number; slug: string; meta: Record<string, string>; bab: BabPelajaran[] }

/** Satu naskah → bab per semester dengan semua perintah :: sudah dibuka (teks Markdown pustaka biasa). */
export function bacaNaskah(file: string): NaskahPelajaran {
  const rel = path.relative(AKAR, file);
  const m = /pelajaran\/(mi|mts)\/(\d)\/([a-z0-9-]+)\.md$/.exec(rel.replace(/\\/g, '/'));
  if (!m) throw new Error(`${rel}: nama berkas harus pelajaran/<mi|mts>/<kelas>/<slug>.md`);
  let src = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  const meta: Record<string, string> = {};
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (fm) { for (const l of fm[1]!.split('\n')) { const x = /^([A-Za-z]+):\s*(.*)$/.exec(l); if (x) meta[x[1]!] = x[2]!.trim(); } src = src.slice(fm[0].length); }
  const bab: BabPelajaran[] = [];
  let smt: 'ganjil' | 'genap' = 'ganjil';
  let kini: BabPelajaran | null = null;
  for (const baris of src.split('\n')) {
    const s = /^#\s+Semester\s+(Ganjil|Genap|1|2)\s*$/i.exec(baris.trim());
    if (s) { smt = /genap|2/i.test(s[1]!) ? 'genap' : 'ganjil'; continue; }
    const b = /^##\s+(.+)$/.exec(baris);
    if (b && !baris.startsWith('###')) {
      const [judul, judulAr] = b[1]!.split(/\s+\|\s+/);
      kini = { judul: judul!.trim(), ...(judulAr ? { judulAr: judulAr.trim() } : {}), smt, teks: '' };
      bab.push(kini);
      continue;
    }
    if (!kini) { if (baris.trim()) throw new Error(`${rel}: teks sebelum bab pertama („${baris.slice(0, 40)}“)`); continue; }
    // kuis wajib rapi: ≥ 3 pilihan, tidak ada pilihan kosong, tepat satu jawaban benar bertanda *
    const kz = /^::kuis\s+(.+)$/.exec(baris.trim());
    if (kz) {
      const opsi = pisahBahas(kz[1]!)[0].split('|').slice(1).map((x) => x.trim());
      if (opsi.length < 3 || opsi.some((x) => !x || x === '*') || opsi.filter((x) => x.startsWith('*')).length !== 1) throw new Error(`${rel}: kuis tidak rapi („${kz[1]!.slice(0, 60)}…“) — perlu ≥ 3 pilihan terisi dan tepat satu jawaban bertanda *`);
    }
    const p = /^::(surah|sambung)\s+(.+)$/.exec(baris.trim());
    const isi = p ? (p[1] === 'surah' ? bukaSurah(p[2]!, rel) : sambungAyat(p[2]!, rel)).join('\n\n') : baris;
    kini.teks += `${isi}\n`;
  }
  if (!bab.length) throw new Error(`${rel}: belum ada bab (## Judul bab)`);
  return { berkas: rel, jenjang: m[1] as 'mi' | 'mts', kelas: Number(m[2]), slug: m[3]!, meta, bab };
}

export function semuaNaskah(): NaskahPelajaran[] {
  const out: NaskahPelajaran[] = [];
  const jalan = (d: string) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const f = path.join(d, e.name); if (e.isDirectory()) jalan(f); else if (e.name.endsWith('.md')) out.push(bacaNaskah(f)); } };
  jalan(DIR_PELAJARAN);
  return out;
}

/** Naskah → Markdown pustaka (bab berurutan, judul Arab ikut). */
export const naskahKeMd = (n: NaskahPelajaran) => n.bab.map((b) => `## ${b.judul}${b.judulAr ? ` | ${b.judulAr}` : ''}\n\n${b.teks.trim()}\n`).join('\n');

export interface KuisLatihan { t: string; o: string[]; k: number; b?: string }
/** Kuis & pasangan satu semester (bahan paket latihan siswa). */
export function bahanLatihan(n: NaskahPelajaran, smt: 'ganjil' | 'genap'): { pg: KuisLatihan[]; jodoh: [string, string][] } {
  const pg: KuisLatihan[] = [];
  const jodoh: [string, string][] = [];
  for (const b of n.bab.filter((x) => x.smt === smt)) {
    for (const l of b.teks.split('\n')) {
      const k = /^::kuis\s+(.+)$/.exec(l.trim());
      if (k) {
        const [isi, bahas] = pisahBahas(k[1]!);
        const bag = isi.split('|').map((x) => x.trim()).filter(Boolean);
        const o = bag.slice(1);
        const benar = o.findIndex((x) => x.startsWith('*'));
        if (o.length >= 3 && benar >= 0) pg.push({ t: bag[0]!, o: o.map((x) => x.replace(/^\*/, '').trim()), k: benar, ...(bahas ? { b: bahas.trim() } : {}) });
        continue;
      }
      const c = /^::cocok\s+(.+)$/.exec(l.trim());
      if (c) for (const p of c[1]!.split(';')) { const [a, z] = p.split('=').map((x) => x.trim()); if (a && z) jodoh.push([a, z]); }
    }
  }
  return { pg, jodoh };
}
