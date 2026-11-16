/**
 * Buku Sekolah Elektronik (BSE) → buku interaktif Pustaka Yapida (perintah pemilik 15: „Yg di pdf anda copy semua text nya
 * dan anda custom sesuai permintaan sy“; perintah 14: tanpa PDF, tanpa unduhan).
 *
 * Masukan: teks hasil `pdftotext` (halaman dipisah \f). Keluaran: { meta, bab } dengan blok yang sama seperti buku bawaan.
 * - Hanya buku yang halaman hak ciptanya mengizinkan „dialihmediakan“ (BSE 2008–2011: „dapat diunduh, digandakan,
 *   dicetak, dialihmediakan, atau difotokopi oleh masyarakat“). Buku tanpa kalimat itu (mis. Kurikulum 2013) dilewati.
 * - Buku agama selain Islam dilewati (perpustakaan yayasan Islam; madrasah memakai buku PAI).
 * - Kepala/kaki halaman yang berulang, nomor halaman, potongan label gambar, dan daftar pustaka/indeks dibuang.
 * - Bab dipotong dari judul bab tertulis; bila tidak ada, dari penomoran Gambar/Tabel/Kegiatan X.Y dengan judul dari daftar
 *   isi; bila tetap tidak ada, per beberapa halaman.
 * - Glosarium menjadi kartu balik di bab yang memakai istilahnya; setiap bab diberi „Uji Pemahaman“ (kuis isian) dari
 *   kalimat bab itu sendiri. Paragraf berbahasa Inggris menjadi blok Inggris (dibacakan dengan suara Inggris).
 */
import { hitungKata, menitBaca, pecahPanjang, ringkasBab, type Bab, type Blok, type BukuMeta } from '../src/data/buku.ts';
import type { Suara } from '../src/data/model.ts';
import { permainanPelajaran } from '../src/data/aktif.ts';

export interface ItemBse { id: number; title: string; class: string; year: string; catalogHref?: string; fileHref?: string }
export type HasilBse = { ok: true; meta: BukuMeta; bab: Bab[] } | { ok: false; alasan: string };

export const IZIN_RE = /dialih\s*-?\s*mediakan/i;
const AGAMA_LAIN = /\b(hindu|buddha|budha|kristen|katolik|katholik|konghucu|khonghucu)\b/i;

const MAPEL: [RegExp, string][] = [
  [/agama islam|\bpai\b|akidah|fikih|fiqih|qur.?an hadits|sejarah kebudayaan islam/i, 'Pendidikan Agama Islam'],
  [/bahasa arab/i, 'Bahasa Arab'],
  [/matematika/i, 'Matematika'],
  [/fisika/i, 'Fisika'], [/kimia/i, 'Kimia'], [/biologi/i, 'Biologi'],
  [/ilmu pengetahuan alam|\bipa\b|sains|science/i, 'IPA'],
  [/ilmu pengetahuan sosial|\bips\b/i, 'IPS'],
  [/ekonomi/i, 'Ekonomi'], [/akuntansi/i, 'Akuntansi'], [/sejarah/i, 'Sejarah'], [/geografi/i, 'Geografi'],
  [/sosiologi/i, 'Sosiologi'], [/antropologi/i, 'Antropologi'],
  [/bahasa (dan sastra )?indonesia|bahasa kita|bahasaku/i, 'Bahasa Indonesia'],
  [/bahasa inggris|english/i, 'Bahasa Inggris'],
  [/bahasa (jerman|perancis|prancis|jepang|mandarin)/i, 'Bahasa Asing'],
  [/bahasa (jawa|sunda|bali|daerah)/i, 'Bahasa Daerah'],
  [/kewarganegaraan|\bpkn\b|pancasila/i, 'PPKn'],
  [/jasmani|olahraga|penjas|berolahraga/i, 'PJOK'],
  [/seni|budaya|kerajinan|keterampilan|prakarya|musik|tari/i, 'Seni Budaya & Prakarya'],
  [/teknologi informasi|komputer|\btik\b/i, 'TIK'],
  [/tematik|\btema\b/i, 'Tematik'],
];
export const mapelDari = (judul: string, kelas: number) => MAPEL.find(([re]) => re.test(judul))?.[1] ?? (kelas >= 10 ? 'Kejuruan & Umum' : 'Umum');

const ROMAWI: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 };
export function angka(teks: string): number {
  const s = teks.toUpperCase();
  if (/^\d+$/.test(s)) return Number(s);
  let n = 0;
  for (let i = 0; i < s.length; i += 1) {
    const a = ROMAWI[s[i]!] ?? 0, b = ROMAWI[s[i + 1]!] ?? 0;
    n += a < b ? -a : a;
  }
  return n;
}

const STOP_EN = /\b(the|and|is|are|you|your|this|that|what|with|for|they|have|can|do|does|please|of|to|in|it|my|i|am|he|she|we)\b/gi;
const STOP_ID = /\b(yang|dan|di|ke|dari|itu|ini|dengan|untuk|pada|adalah|dalam|tidak|kamu|kita|akan|juga)\b/gi;
export const inggris = (s: string) => {
  const en = s.match(STOP_EN)?.length ?? 0, id = s.match(STOP_ID)?.length ?? 0, kata = s.split(/\s+/).length;
  return kata >= 4 && en >= 2 && en > id * 2 && en / kata > 0.18;
};

const normal = (l: string) => l.toLowerCase().replace(/\d+/g, '#').replace(/[^\p{L}#]+/gu, ' ').trim();
const nomorHalaman = (l: string) => /^\s*(\d{1,4}|[ivxlcdm]{1,6})\s*$/i.test(l);

/** Buang kepala/kaki halaman yang berulang (≥ 12% halaman) dan nomor halaman. */
export function bersihkanHalaman(halaman: string[]): string[][] {
  const baris = halaman.map((h) => h.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()));
  const hitung = new Map<string, number>();
  for (const b of baris) {
    const isi = b.filter(Boolean);
    for (const l of new Set([...isi.slice(0, 3), ...isi.slice(-3)].map(normal))) if (l) hitung.set(l, (hitung.get(l) ?? 0) + 1);
  }
  const batas = Math.max(4, Math.floor(halaman.length * 0.12));
  const ulang = new Set([...hitung].filter(([, n]) => n >= batas).map(([l]) => l));
  return baris.map((b) => {
    const isi = b.filter(Boolean);
    const tepi = new Set([...isi.slice(0, 3), ...isi.slice(-3)]);
    return b.filter((l) => !(l && (nomorHalaman(l) || (tepi.has(l) && ulang.has(normal(l))))));
  });
}

const JUDUL_BAB = /^(BAB|Bab|bab|PELAJARAN|Pelajaran|pelajaran|UNIT|Unit|unit|TEMA|Tema|tema|CHAPTER|Chapter|BAGIAN|Bagian|bagian)\s+(\d{1,2}|[IVXLivxl]{1,6})\b\s*[:.\-–—]?\s*(.*)$/;
const TITIK_DAFTAR = /\.{4,}|…{2,}|\s\d{1,3}$/;
const AKHIR_BUKU = /^(GLOSARIUM|Glosarium|DAFTAR PUSTAKA|Daftar Pustaka|DAFTAR ISTILAH|Daftar Istilah|INDEKS|Indeks|KUNCI JAWABAN|Kunci Jawaban|LAMPIRAN|Lampiran)\s*$/;

interface Awal { hal: number; baris: number; n: number; judul: string }

const rapikanJudul = (s: string) => {
  // Baris daftar isi: titik-titik pengarah dan nomor halaman di ujung dibuang („gerak kaki dan tangan....... . 1“).
  const t = s.replace(/[.·…]{3,}.*$/, '').replace(TITIK_DAFTAR, '').replace(/[\s.·…]*\s\d{1,3}\s*$/, '').replace(/\s+/g, ' ').trim().replace(/[:.\-–—]+$/, '').trim();
  const r = t === t.toUpperCase() && /[A-Z]/.test(t) ? t.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase()) : t;
  return r.charAt(0).toUpperCase() + r.slice(1);
};

/** Judul sesudah „Bab N“: sisa baris, atau baris berikutnya yang pendek (judul yang terpenggal dua baris digabung). */
function judulSesudah(b: string[], i: number, sisa: string): string {
  if (sisa && sisa.length > 2) return rapikanJudul(sisa);
  for (let j = i + 1; j < Math.min(b.length, i + 4); j += 1) {
    const l = b[j]!;
    if (l && l.length <= 90 && !nomorHalaman(l) && !JUDUL_BAB.test(l)) {
      const lanjut = b[j + 1];
      const gabung = lanjut && /^\p{Ll}/u.test(lanjut) && !/^[a-h](\s|$)/.test(lanjut) && !/[.?!:]$/.test(l) && !/[.·…]{3,}/.test(lanjut) && lanjut.split(' ').length <= 5 && (l.length + lanjut.length) <= 90 && !nomorHalaman(lanjut);
      return rapikanJudul(gabung ? `${l} ${lanjut}` : l);
    }
  }
  return '';
}

/** Daftar isi: judul per nomor bab (dari halaman yang memuat ≥ 3 judul bab). */
/** Daftar isi ada di bagian depan buku (kunci jawaban/indeks di belakang juga menyebut „bab n“ — bukan daftar isi). */
const batasDepan = (hal: string[][]) => Math.max(12, Math.ceil(hal.length * 0.25));

interface IsiBab { judul: string; cetak?: number }
const NOMOR_UJUNG = /(?:^|[\s.·…])(\d{1,3})\s*$/;

/** Daftar isi: judul (dan nomor halaman cetak) per nomor bab. */
function daftarIsi(hal: string[][]): Map<number, IsiBab> {
  const peta = new Map<number, IsiBab>();
  let sebelumDaftar = false;
  for (const b of hal.slice(0, batasDepan(hal)).map((x) => x.filter(Boolean))) {
    const calon = b.map((l, i) => [JUDUL_BAB.exec(l), i] as const).filter(([m]) => m);
    // Halaman daftar isi: ≥ 3 judul bab, atau lanjutan halaman daftar isi sebelumnya.
    const daftar = calon.length >= 3 || (sebelumDaftar && calon.length >= 1);
    sebelumDaftar = daftar;
    if (!daftar) continue;
    for (const [m, i] of calon) {
      const n = angka(m![2]!);
      const j = judulSesudah(b, i, m![3]!);
      // Nomor halaman di ujung judul pada baris itu (bukan nomor bab „BAB 1“), atau di ujung baris-baris judul berikutnya.
      let c = m![3] ? NOMOR_UJUNG.exec(m![3]) : null;
      for (let k = i + 1; !c && k <= i + 3 && k < b.length && !JUDUL_BAB.test(b[k]!); k += 1) c = NOMOR_UJUNG.exec(b[k]!);
      if (n && j && !peta.has(n)) peta.set(n, { judul: j, ...(c ? { cetak: Number(c[1]) } : {}) });
    }
  }
  return peta;
}

/** Nomor halaman cetak tiap halaman PDF (baris berisi angka saja di tepi atas/bawah halaman), null bila tidak ada. */
export function nomorCetak(halaman: string[]): (number | null)[] {
  return halaman.map((h) => {
    const isi = h.split('\n').map((l) => l.trim()).filter(Boolean);
    const tepi = [...isi.slice(0, 3), ...isi.slice(-3)].map((l) => /^(\d{1,3})$/.exec(l)).filter((m): m is RegExpExecArray => Boolean(m));
    return tepi.length ? Number(tepi[tepi.length - 1]![1]) : null;
  });
}

/** Halaman PDF yang nomor cetaknya `p`: dicari yang selisihnya dengan nomor cetak konsisten (median selisih seluruh buku). */
function halamanCetak(cetak: (number | null)[], p: number, sesudah: number): number | null {
  const selisih = cetak.map((c, i) => (c === null ? null : i - c)).filter((x): x is number => x !== null).sort((a, b) => a - b);
  if (selisih.length < 5) return null;
  const off = selisih[Math.floor(selisih.length / 2)]!;
  const cocok = cetak.map((c, i) => (c === p && i > sesudah && Math.abs(i - p - off) <= 3 ? i : -1)).filter((i) => i >= 0);
  if (cocok.length) return cocok[0]!;
  const kira = p + off;
  return kira > sesudah && kira < cetak.length ? kira : null;
}

/** Awal setiap bab. `cetak` = nomor halaman cetak per halaman PDF (nomorCetak), untuk strategi daftar isi. */
export function cariBab(hal: string[][], paksa = false, cetak: (number | null)[] = [], mentah?: string[][]): Awal[] {
  // Daftar isi dibaca dari halaman mentah: nomor halaman yang berdiri sendiri di baris berikutnya masih ada di sana.
  const isi = daftarIsi(mentah ?? hal);
  const halDaftar = new Set(hal.map((b, i) => [b.filter((l) => JUDUL_BAB.test(l)).length, i] as const).filter(([n, i]) => n >= 3 && i < batasDepan(hal)).map(([, i]) => i));
  const akhirDaftar = Math.max(-1, ...halDaftar);
  // 1) Judul bab tertulis di badan buku: rantai terpanjang „bab 1, bab 2, …“ berurutan dengan jarak ≥ 2 halaman
  //    (penyebutan „bab 3“ yang nyasar di tengah kalimat tidak memutus rantai).
  const calonBab: Awal[] = [];
  hal.forEach((b, h) => {
    if (h <= akhirDaftar) return;
    b.forEach((l, i) => {
      const m = JUDUL_BAB.exec(l);
      // Baris daftar isi (titik-titik pengarah atau judul diakhiri nomor halaman) bukan awal bab; „BAB 7“ sendirian adalah.
      if (!m || /\.{4,}|…{2,}/.test(l) || (m[3] && /\s\d{1,3}$/.test(` ${m[3]}`)) || i > 8) return;
      const n = angka(m[2]!);
      if (n >= 1 && n <= 40) calonBab.push({ hal: h, baris: i, n, judul: isi.get(n)?.judul || judulSesudah(b, i, m[3]!) || `Bab ${n}` });
    });
  });
  let tertulis: Awal[] = [];
  for (const mulai of calonBab.filter((a) => a.n <= 2)) {
    const rantai = [mulai];
    for (const a of calonBab) { const t = rantai[rantai.length - 1]!; if (a.n === t.n + 1 && a.hal - t.hal >= 2) rantai.push(a); }
    if (rantai.length > tertulis.length) tertulis = rantai;
  }
  if (tertulis.length >= 2 && !paksa) return tertulis;
  // 2) Daftar isi + nomor halaman cetak: bab dimulai di halaman PDF yang nomor cetaknya tertulis di daftar isi
  //    (judul bab di badan buku sering berupa gambar atau huruf kecil terpisah).
  if (!paksa && cetak.length) {
    const dariIsi: Awal[] = [];
    for (const [n, x] of [...isi].sort((a, b) => a[0] - b[0])) {
      if (x.cetak === undefined || n > 40) continue;
      const terakhir = dariIsi[dariIsi.length - 1];
      if (terakhir && n !== terakhir.n + 1) break;
      const h = halamanCetak(cetak, x.cetak, terakhir ? terakhir.hal : akhirDaftar);
      if (h === null) { if (terakhir) break; continue; }
      dariIsi.push({ hal: h, baris: 0, n, judul: x.judul });
    }
    // Dipakai hanya bila meyakinkan: mencakup sebagian besar bab daftar isi dan halamannya naik dengan jarak wajar.
    const naik = dariIsi.every((a, k) => k === 0 || a.hal - dariIsi[k - 1]!.hal >= 2);
    if (dariIsi.length >= Math.max(2, Math.ceil(isi.size * 0.6)) && naik) return dariIsi;
  }
  // 3) Penomoran Gambar/Tabel/Kegiatan X.Y: angka depan naik = bab baru.
  const nomor: Awal[] = [];
  hal.forEach((b, h) => {
    if (h <= akhirDaftar) return;
    for (const l of b) {
      const m = /^(Gambar|Tabel|Kegiatan|Tugas|Latihan|Contoh|Uji Kompetensi|Aktivitas)\s+(\d{1,2})\.\d{1,2}\b/.exec(l);
      if (!m) continue;
      const n = Number(m[2]);
      const terakhir = nomor[nomor.length - 1];
      if ((terakhir ? n === terakhir.n + 1 : n === 1) && n <= 30) nomor.push({ hal: Math.max(akhirDaftar + 1, terakhir ? h : h - 2), baris: 0, n, judul: isi.get(n) ? `${n}. ${isi.get(n)!.judul}` : `Bab ${n}` });
    }
  });
  if (nomor.length >= 2 && !paksa) {
    // Bab ditandai pada halaman nomor pertamanya muncul; mundur ke halaman sebelumnya yang kosong/berjudul (pembuka bab).
    return nomor.map((a, k) => (k === 0 ? a : { ...a, hal: Math.max(nomor[k - 1]!.hal + 1, a.hal - 1) }));
  }
  // 4) Per 12 halaman.
  const mulai = akhirDaftar + 1;
  const out: Awal[] = [];
  for (let h = mulai, n = 1; h < hal.length; h += 12, n += 1) out.push({ hal: h, baris: 0, n, judul: `Bagian ${n}` });
  return out;
}

const KEPALA_KOTAK = /^(Info\s+\p{L}+|Tugas(\s+\d+(\.\d+)?)?|Kegiatan(\s+\d+(\.\d+)?)?|Latihan(\s+\d+(\.\d+)?)?|Rangkuman|Ringkasan|Uji Kompetensi.*|Evaluasi.*|Refleksi|Tahukah Kamu\??|Kata Kunci|Peta Konsep|Tujuan Pembelajaran|Ayo\s+\p{L}+.*|Mari\s+\p{L}+.*|Contoh(\s+(Soal\s+)?\d+(\.\d+)?)?|Aktivitas(\s+\d+(\.\d+)?)?|Let'?s\s+\p{L}+.*|Exercise\s*\d*|Activity\s*\d*)$/u;

/* ── buku pembaca pemula (BSE kelas 1–2): huruf kecil semua, tanpa tanda baca; satu baris = satu kalimat ───────── */

const SAMBUNG_AKHIR = /\s(dan|yang|dengan|di|ke|untuk|atau|karena|adalah|pada|dari|serta|agar|supaya|sebagai|oleh|bila|jika|kalau|saat|ketika|tetapi|tapi|namun|sambil|seperti|sampai|hingga|maupun|baik|akan|dapat|bisa|harus|sudah|belum|tidak|sangat|lebih|paling|setiap|semua|para|sebuah|seorang|suatu|ada|yaitu|antara|misalnya|contohnya|menjadi)$/u;
const SAMBUNG_AWAL = /^(dan|atau|yang|dengan|untuk|ke|di|dari|serta|sehingga|karena|adalah|juga|akan|pada|agar|supaya|maupun|hingga|sampai|seperti|kepada|oleh|secara|tentang|tanpa|tetapi|tapi|namun|yaitu|menjadi)\b/u;
const TANYA = /^(apa|apakah|siapa|siapakah|mengapa|kenapa|bagaimana|bagaimanakah|di ?mana|ke ?mana|dari ?mana|kapan|berapa|bolehkah|manakah|mana|adakah)\b/i;
const PILIHAN = /^([a-e])\s+(\p{L}.*)$/u;

/**
 * Kalimat dari satu kelompok baris buku pembaca pemula: baris sambungan (kolom sempit, kata sambung di ujung/awal, sisa
 * satu–dua kata) digabung; tiap kalimat diberi huruf kapital dan titik/tanda tanya agar enak dibaca dan dibacakan dengan
 * jeda; pilihan jawaban „a daun“ menjadi „a. daun“.
 */
export function kalimatPemula(g: string[]): string[] {
  const rerata = g.reduce((n, l) => n + l.split(' ').length, 0) / g.length;
  const baris = g.length >= 3 && rerata < 3.5 && !g.some((l) => PILIHAN.test(l)) ? [g.join(' ')] : g;
  const out: string[] = [];
  let buf = '';
  baris.forEach((l, i) => {
    if (PILIHAN.test(l)) { if (buf) { out.push(buf); buf = ''; } out.push(l.replace(PILIHAN, '$1. $2')); return; }
    buf = buf ? `${buf} ${l}` : l;
    const next = baris[i + 1];
    const lanjut = next !== undefined && !PILIHAN.test(next) && !/[.!?…:]$/.test(buf)
      && (SAMBUNG_AKHIR.test(buf) || SAMBUNG_AWAL.test(next) || /[,;]$/.test(buf) || (next.split(' ').length <= 2 && buf.length >= 30));
    if (!lanjut) { out.push(buf); buf = ''; }
  });
  if (buf) out.push(buf);
  return out.map((k) => {
    const s = k.replace(/\s+/g, ' ').trim().replace(/\s*(\.{3,}|…+)$/, ' …');
    if (/^[a-e]\.\s/.test(s)) return s; // pilihan jawaban „a. daun“ dibiarkan
    const akhir = /[.!?…:]$/.test(s) ? '' : TANYA.test(s) ? '?' : '.';
    return s.charAt(0).toUpperCase() + s.slice(1) + akhir;
  });
}

/** Buku pembaca pemula: kurang dari 35% paragraf diawali huruf kapital (dihitung dari baris pertama tiap kelompok). */
export function bukuPemula(hal: string[][]): boolean {
  const awal = hal.flatMap((b) => b.filter((l, i, arr) => l && (i === 0 || !arr[i - 1]) && l.split(' ').length >= 3));
  return awal.length >= 50 && awal.filter((l) => /^\p{Lu}/u.test(l)).length / awal.length < 0.35;
}

/** Baris satu bab → blok. */
export function keBlok(baris: string[], o: { pemula?: boolean } = {}): Blok[] {
  // Kelompok = baris berurutan tanpa baris kosong.
  const kelompok: string[][] = [];
  let cur: string[] = [];
  for (const l of baris) { if (!l) { if (cur.length) kelompok.push(cur); cur = []; } else cur.push(l); }
  if (cur.length) kelompok.push(cur);
  const blok: Blok[] = [];
  let tunda = '';
  for (let k = 0; k < kelompok.length; k += 1) {
    const g = kelompok[k]!;
    // Nomor soal sendirian („4.“) atau huruf bagian sendirian („A“) digabung dengan kelompok berikutnya.
    if (g.length === 1 && /^(\d{1,2}\.|[A-H]\.?)$/.test(g[0]!)) { tunda = g[0]!.replace(/^([A-H])$/, '$1.'); continue; }
    if (o.pemula && g.every((l) => /^[\p{Ll}\d]/u.test(l))) {
      const awal = tunda;
      tunda = '';
      if (!awal && /^sumber\b/i.test(g[0]!) && g.join(' ').split(' ').length <= 6) continue;
      const kal = kalimatPemula(awal ? [`${awal} ${g[0]!}`, ...g.slice(1)] : g);
      if (kal.length === 1) {
        const s = kal[0]!;
        const n = s.split(' ').length;
        if (/^(gambar|tabel)\s+\d/i.test(s)) { if (n <= 30) blok.push({ t: 'cat', x: s.replace(/\.$/, '') }); continue; }
        if (g.length === 1 && !awal) {
          if (n < 2) continue;
          // Judul bagian: dua–empat kata tanpa tanda baca, bukan awal kalimat sambungan.
          if (n <= 4 && !/[.?!…:]$/.test(g[0]!) && !SAMBUNG_AWAL.test(g[0]!)) { blok.push({ t: 'h', x: s.replace(/\.$/, '') }); continue; }
        }
      }
      let par: string[] = [];
      const tutup = () => { if (par.length) { for (const b of pecahPanjang({ t: 'p', x: par.join(' ') })) blok.push(b); par = []; } };
      for (const s of kal) {
        if (/^(\d{1,2}\.|[a-e]\.)\s/.test(s)) { tutup(); blok.push({ t: 'li', x: s }); } else par.push(s);
      }
      tutup();
      continue;
    }
    let teks = '';
    for (const l of g) {
      if (!teks) teks = l;
      else if (/\p{L}-$/u.test(teks) && /^\p{Ll}/u.test(l)) teks = teks.slice(0, -1) + l;
      else teks += ` ${l}`;
    }
    teks = (tunda ? `${tunda} ${teks}` : teks).replace(/\s+/g, ' ').trim();
    const huruf = tunda;
    tunda = '';
    const kata = teks.split(' ').length;
    if (/^Sumber\s*:/i.test(teks) || /^(www\.|https?:)/i.test(teks)) continue;
    if (/^(Gambar|Tabel|Figure|Picture)\s+\d+(\.\d+)?/i.test(teks)) { if (kata <= 30) blok.push({ t: 'cat', x: teks }); continue; }
    if (g.length === 1 && teks.length <= 70 && (KEPALA_KOTAK.test(teks) || /^[A-H]\.\s+\p{Lu}/u.test(teks) || (/^\d{1,2}\.\s+\p{Lu}/u.test(teks) && !/[.?!]$/.test(teks) && kata <= 8))) {
      blok.push({ t: 'h', x: teks }); continue;
    }
    if (/^(\d{1,2}\.|[a-e][.)])\s/.test(teks) || (huruf && /^\d/.test(huruf))) { blok.push({ t: 'li', x: teks }); continue; }
    // Potongan label gambar/sel tabel: pendek dan tanpa tanda baca akhir.
    if (kata < 5 && !/[.?!:]$/.test(teks)) continue;
    if (!/\p{L}{2}/u.test(teks)) continue;
    for (const b of pecahPanjang({ t: inggris(teks) ? 'en' : 'p', x: teks })) blok.push(b);
  }
  return blok;
}

/** Glosarium: „istilah : arti“ / „istilah – arti“ / „istilah = arti“. */
export function glosarium(baris: string[]): Map<string, string> {
  const peta = new Map<string, string>();
  for (const l of baris) {
    const m = /^([\p{L}][\p{L}\s'-]{1,38}?)\s*[:=–—]\s*(\p{L}.{8,160})$/u.exec(l);
    if (m && m[1]!.split(' ').length <= 4) peta.set(m[1]!.trim(), m[2]!.trim().replace(/\s+/g, ' '));
  }
  return peta;
}

/** Penulis dari halaman hak cipta (8 halaman pertama). */
export function penulisDari(hal: string[][]): string {
  const awal = hal.slice(0, 8).map((b) => b.join('\n')).join('\n');
  const m = /Penulis\s*(?:\n\s*)?:?\s*(?:\n\s*)?:?\s*([^\n]{3,120})(?:\n([^\n:]{3,60})(?=\n))?/i.exec(awal);
  if (!m) return 'Tim Penulis BSE';
  const nama = [m[1], m[2]].filter((x): x is string => Boolean(x && !/^(editor|penyunting|ilustrator|perancang|penata|desain|layout|ukuran|cetakan)/i.test(x.trim())));
  const t = nama.join(', ').replace(/^[:\s]+/, '').replace(/\s+/g, ' ').trim();
  return t.length >= 3 && t.length <= 140 ? t : 'Tim Penulis BSE';
}

const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 56).replace(/-$/, '');
export const idBse = (it: Pick<ItemBse, 'id' | 'title'>) => `s-${it.id}-${slug(it.title.replace(/^buku\s+/i, ''))}`;

/** Satu buku BSE: teks pdftotext → buku interaktif, atau alasan dilewati. */
export function ubahBuku(it: ItemBse, teks: string, o: { paksa?: boolean } = {}): HasilBse {
  const kelas = Number(it.class);
  if (!Number.isInteger(kelas) || kelas < 1 || kelas > 12) return { ok: false, alasan: 'kelas tidak dikenal' };
  if (AGAMA_LAIN.test(it.title)) return { ok: false, alasan: 'buku agama selain Islam' };
  const halaman = teks.split('\f');
  const izinDi = [...halaman.slice(0, 14), ...halaman.slice(-6)].join('\n');
  if (!IZIN_RE.test(izinDi.replace(/-\n/g, ''))) return { ok: false, alasan: 'tanpa izin dialihmediakan' };
  const hal = bersihkanHalaman(halaman);
  const kata = hal.reduce((n, b) => n + b.join(' ').split(/\s+/).filter(Boolean).length, 0);
  if (kata < 2500) return { ok: false, alasan: 'teks tidak terbaca (hasil pindaian)' };
  const awal = cariBab(hal, o.paksa, nomorCetak(halaman), halaman.map((h) => h.split('\n').map((l) => l.replace(/\s+/g, ' ').trim())));
  // Akhir isi: glosarium/daftar pustaka/indeks sesudah bab terakhir.
  const terakhir = awal[awal.length - 1]!;
  let akhirHal = hal.length;
  let glos = new Map<string, string>();
  for (let h = terakhir.hal + 1; h < hal.length; h += 1) {
    const i = hal[h]!.findIndex((l) => AKHIR_BUKU.test(l));
    if (i >= 0) {
      if (akhirHal === hal.length) akhirHal = h;
      if (/glosarium|istilah/i.test(hal[h]![i]!)) glos = glosarium(hal.slice(h, Math.min(hal.length, h + 6)).flat());
    }
  }
  const mapel = mapelDari(it.title, kelas);
  const suara: Suara = kelas <= 6 ? 'anak' : 'remaja';
  const pemula = bukuPemula(hal);
  const bab: Bab[] = [];
  awal.forEach((a, k) => {
    const sampai = k + 1 < awal.length ? awal[k + 1]!.hal : akhirHal;
    const baris = hal.slice(a.hal, Math.max(a.hal + 1, sampai)).flatMap((b, j) => (j === 0 ? b.slice(a.baris) : b).concat(''));
    // Baris judul bab sendiri tidak diulang di isi.
    const isi = keBlok(baris.filter((l, j) => !(j < 4 && (JUDUL_BAB.test(l) || rapikanJudul(l) === a.judul))), { pemula });
    if (hitungKata(isi) < 60) return;
    // Bab sangat panjang dibagi agar nyaman dibaca (±6.000 kata per bagian).
    const bagian: Blok[][] = [];
    let buf: Blok[] = [], n = 0;
    for (const b of isi) { buf.push(b); n += b.x.split(' ').length; if (n > 6000 && (b.t === 'p' || b.t === 'en')) { bagian.push(buf); buf = []; n = 0; } }
    if (buf.length) bagian.push(buf);
    bagian.forEach((blok, j) => {
      const judul = (a.judul || `Bab ${a.n}`) + (bagian.length > 1 ? ` (bagian ${j + 1})` : '');
      const babIni: Bab = { n: bab.length + 1, judul, blok };
      const teksBab = blok.map((b) => b.x).join(' ').toLowerCase();
      const istilah = [...glos].filter(([t]) => t.length >= 4 && teksBab.includes(t.toLowerCase())).slice(0, 4);
      babIni.blok = [...blok, ...permainanPelajaran(babIni, { id: idBse(it), bahasa: mapel === 'Bahasa Inggris' ? 'en' : 'id' }, istilah)];
      bab.push(babIni);
    });
  });
  if (bab.length < 1) return { ok: false, alasan: 'bab tidak ditemukan' };
  const judul = it.title.replace(/^buku\s+/i, '').replace(/\s+/g, ' ').trim();
  const jenjang = kelas <= 6 ? 'SD/MI' : kelas <= 9 ? 'SMP/MTs' : 'SMA/MA/SMK';
  const total = bab.reduce((n, b) => n + hitungKata(b.blok), 0);
  const meta: BukuMeta = {
    id: idBse(it), judul, penulis: penulisDari(hal), rak: [kelas <= 6 ? 'mi' : kelas <= 9 ? 'mts' : 'umum'], suara,
    kelas: `Kelas ${kelas}`, mapel, bahasa: mapel === 'Bahasa Inggris' ? 'en' : 'id',
    ringkasan: `Buku pelajaran ${mapel} ${jenjang} kelas ${kelas} (BSE ${it.year || ''}) — teksnya disusun ulang menjadi buku interaktif: dibacakan, dengan kartu istilah dan uji pemahaman di setiap bab.`.replace('BSE )', 'BSE)'),
    sumber: 'Buku Sekolah Elektronik (BSE), Kementerian Pendidikan Nasional',
    ...(it.catalogHref ? { sumberUrl: it.catalogHref } : {}),
    lisensi: 'Hak cipta dibeli Depdiknas; boleh diunduh, digandakan, dicetak, dan dialihmediakan oleh masyarakat (halaman hak cipta buku)',
    bab: ringkasBab(bab), kata: total, menit: menitBaca(total), tag: ['BSE', mapel, `kelas ${kelas}`, jenjang],
  };
  return { ok: true, meta, bab };
}
