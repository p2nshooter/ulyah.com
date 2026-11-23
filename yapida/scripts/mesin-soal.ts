/**
 * Mesin bank soal TANPA AI (pemilik, 23 Nov 2026: „Coba bikin engine tanpa AI yg mampu membuat soal seperti yg lu bikin,
 * bersumber dari buku2 pelajaran, total bank soal sesuai ketentuan yapida … hasil akhirnya seperti yg lu bikin manual“).
 *
 * Aturan, bukan model bahasa: setiap soal diambil dari kalimat buku pelajaran kelas & mapel yang sama.
 *  - Buku Pelajaran Yapida (pelajaran/<jenjang>/<kelas>/<mapel>.md): kuis berpembahasan (::kuis), pasangan (::cocok),
 *    daftar istilah („Muzaki: orang yang membayar zakat“), kalimat definisi („X adalah …“), daftar butir per subjudul.
 *  - Buku BSE (pustaka/bse): kalimat definisi dan rumpang („… yang disebut sistem rangka“), daftar „…, yaitu A, B, dan C“.
 *  - Matematika: soal hitungan berjenjang per kelas dari templat (angka dari pengacak tetap), kunci dihitung, pembahasan
 *    berisi langkah hitungnya.
 * Keluarannya teks dalam format baku bank soal (15 PG · 5 menjodohkan · 10 isian · 5 uraian, kunci & pembahasan),
 * diperiksa parser yang sama dengan paket buatan tangan. Hanya slot kosong yang diisi; paket manual tidak pernah ditimpa.
 * Ayat Al-Qur'an tidak pernah disusun mesin: baris ::surah/::ar dilewati dan kalimat berhuruf Arab panjang dibuang.
 */
import fs from 'node:fs';
import path from 'node:path';
import { KURIKULUM, type Mapel } from '../src/data/kurikulum.ts';
import { FORMAT, namaMapelSoal } from '../src/data/soal.ts';
import { semuaNaskah, type NaskahPelajaran } from './pelajaran.ts';
import { soalBse, uraianTulis, type ButirBse } from './soal-bse.ts';

export type JenisSlot = 'pts' | 'pas' | 'latihan';
export interface Slot { jenjang: 'mi' | 'mts'; kelas: number; m: Mapel; semester: 'ganjil' | 'genap'; jenis: JenisSlot }
export interface HasilMesin { teks: string; sumber: string }

const AKAR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

/* ── pengacak tetap ───────────────────────────────────────────────────────────────────────────────────────── */
function benih(s: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1_000_000) / 1_000_000; };
}
const acak = <T>(arr: T[], r: () => number): T[] => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; };
const huruf = ['a', 'b', 'c', 'd'];

/* ── bahan dari buku ──────────────────────────────────────────────────────────────────────────────────────── */
interface Kuis { t: string; o: string[]; k: number; b?: string }
interface Istilah { kata: string; arti: string; kalimat: string; bab: number }
interface Rumpang { kalimat: string; jawab: string; bab: number }
interface Daftar { judul: string; butir: string[]; kalimat?: string }
interface Bahan { bab: number; ketat?: boolean; kuis: Kuis[]; cocok: [string, string][]; istilah: Istilah[]; rumpang: Rumpang[]; daftar: Daftar[]; paragraf: { judul: string; teks: string }[]; sumber: string }

const ARAB = /[؀-ۿ]/;
const KATA_GANTI = /^(ini|itu|hal|mereka|kita|kami|kamu|dia|ia|berikut|contoh|salah satu|cara|pada|dalam|dengan|untuk|jika|apabila|karena|ayo|mari|perhatikan|gambar|tabel|coba|setelah|sebelum|oleh|dari|di|ke|yang|dan|atau|namun|tetapi|selain|semua|setiap|beberapa|banyak|kegiatan|tugas|soal|jawab)\b/i;
const bersih = (s: string) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SINGKAT = /(?:\b(?:QS|HR|Q\.S|H\.R|SAW|saw|swt|SWT|as|ra|dll|dsb|dst|No|hlm|Kel|km|cm|kg|m|Rp|dr|Prof|H|Hj|K\.H|M|S\.Pd|St|Jl|t\.t)|\d)\.$/;
const kalimatDari = (t: string) => {
  const potong = bersih(t).match(/[^.!?]+[.!?]+/g) ?? [];
  const hasil: string[] = [];
  for (const x of potong) { if (hasil.length && SINGKAT.test(hasil[hasil.length - 1]!)) hasil[hasil.length - 1] += x; else hasil.push(x); }
  return hasil.map((x) => x.trim()).filter((x) => x.length > 12 && !SINGKAT.test(x) && (x.match(/\(/g) ?? []).length === (x.match(/\)/g) ?? []).length);
};
const jumlahKata = (s: string) => s.split(/\s+/).filter(Boolean).length;
const hurufBesar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hurufKecil = (s: string) => (/^[A-Z][a-z]/.test(s) && !/^(Allah|Al-|Nabi|Rasul|Islam|Indonesia|Al)/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const layak = (s: string) => !ARAB.test(s) && !/gambar|tabel|halaman|kegiatan \d|perhatikan|amatilah|tuliskan|jawablah|berikut ini|di bawah ini|di atas/i.test(s) && !/[()[\]{}]$/.test(s);

/* Saringan mutu: istilah = kata benda pendek tanpa kata berulang; arti = frasa utuh yang tidak memuat istilahnya sendiri. */
const SANDANG = /^(sebuah|suatu|seorang|para|sang|bagian|hal|cara|jenis|bentuk|macam|contoh|salah|beberapa|banyak|semua)\b/i;
const UJUNG_GANTUNG = /\b(dan|atau|yang|di|ke|dari|untuk|dengan|pada|dalam|oleh|sebagai|adalah|ini|itu|tersebut)$/i;
function istilahBaik(kata: string, arti: string): boolean {
  const k = kata.trim(), a = arti.trim().replace(/[.]$/, '');
  const kk = k.toLowerCase().split(/[\s-]+/);
  if (k.length < 3 || kk.length > 4 || /\d/.test(k) || new Set(kk).size !== kk.length || KATA_GANTI.test(k) || SANDANG.test(k)) return false;
  if (/^bab\b|^bagian\b|^subbab\b/i.test(k)) return false;
  if (jumlahKata(a) < 3 || jumlahKata(a) > 30 || UJUNG_GANTUNG.test(a) || /^(dan|atau|yang|di|ke|dari)\b/i.test(a)) return false;
  if (/\b(adalah|merupakan|ialah)\b/i.test(a) && jumlahKata(a) < 12) return false;
  if (a.toLowerCase().includes(kk[0]!) && kk[0]!.length > 3) return false;
  return !ARAB.test(k + a);
}

function tambahDariKalimat(b: Bahan, k: string): void {
  if (!layak(k) || k.length > 260) return;
  let m = /^(.{8,170}?)\s+(?:yang\s+)?(?:disebut(?: juga)?|dinamakan|dikenal dengan(?: nama)?|diberi nama)\s+([A-Za-z][\w' -]{1,40}?)(?:[,.;]|$)/.exec(k);
  if (m && jumlahKata(m[2]!) <= 3 && !KATA_GANTI.test(m[2]!) && !SANDANG.test(m[2]!) && !/^(dengan|sebagai)$/i.test(m[2]!)) {
    const arti = m[1]!.replace(/\s+yang$/, '').trim();
    if (!istilahBaik(m[2]!, arti) || jumlahKata(m[1]!) < 5) return;
    b.rumpang.push({ kalimat: k.replace(m[2]!, '....'), jawab: m[2]!.trim(), bab: b.bab });
    if (!KATA_GANTI.test(arti)) b.istilah.push({ kata: m[2]!.trim(), arti: hurufKecil(arti), kalimat: k, bab: b.bab });
    return;
  }
  m = /^([A-Z][\w' -]{1,40}?)\s+(adalah|merupakan|artinya|berarti|ialah)\s+(.{12,200})[.]$/.exec(k);
  if (m && jumlahKata(m[1]!) <= 4 && !KATA_GANTI.test(m[1]!) && jumlahKata(m[3]!) >= 3 && !/^(salah satu|contoh|cara)/i.test(m[3]!) && istilahBaik(m[1]!, m[3]!)) {
    b.istilah.push({ kata: m[1]!.trim(), arti: m[3]!.trim(), kalimat: k, bab: b.bab });
    return;
  }
  m = /^(.{10,140}?),?\s+yaitu\s+(.+)[.]$/.exec(k);
  if (m) {
    const butir = m[2]!.split(/,\s*(?:dan\s+)?|\s+dan\s+/).map((x) => x.trim()).filter(Boolean);
    if (butir.length >= 3 && butir.length <= 8 && butir.every((x) => jumlahKata(x) <= 6 && jumlahKata(x) >= 1 && !UJUNG_GANTUNG.test(x)) && !KATA_GANTI.test(m[1]!) && jumlahKata(m[1]!) >= 3) b.daftar.push({ judul: m[1]!.trim(), butir, kalimat: k });
  }
}

function bahanNaskah(n: NaskahPelajaran, smt: 'ganjil' | 'genap', jenis: JenisSlot): Bahan {
  const bab = n.bab.filter((x) => x.smt === smt);
  const pakai = jenis === 'pts' ? bab.slice(0, Math.max(1, Math.ceil(bab.length / 2))) : bab;
  const b: Bahan = { bab: 0, kuis: [], cocok: [], istilah: [], rumpang: [], daftar: [], paragraf: [], sumber: `Buku Pelajaran Yapida ${n.meta.judul ?? ''}`.trim() };
  for (const x of pakai) {
    b.bab += 1;
    let sub = '', butir: string[] = [];
    const tutup = () => { if (sub && butir.length >= 3) b.daftar.push({ judul: sub, butir: butir.map((y) => y.split(':')[0]!.trim()).filter((y) => jumlahKata(y) <= 7) }); butir = []; };
    for (const baris of x.teks.split('\n').map((l) => l.trim()).filter(Boolean)) {
      if (baris.startsWith('::kuis')) {
        const isi = baris.replace(/^::kuis\s+/, '');
        const [q, bahas] = isi.split('>>');
        const bag = q!.split('|').map((y) => y.trim()).filter(Boolean);
        const o = bag.slice(1), k = o.findIndex((y) => y.startsWith('*'));
        if (o.length >= 4 && k >= 0 && !ARAB.test(q!)) b.kuis.push({ t: bag[0]!.replace(/\s*…\?$|\s*\.\.\.\?$|…$/, ' ....').replace(/\?$/, ''), o: o.slice(0, 4).map((y) => y.replace(/^\*/, '').trim()), k: k < 4 ? k : 0, ...(bahas ? { b: bahas.trim() } : {}) });
        continue;
      }
      if (baris.startsWith('::cocok')) { for (const p of baris.replace(/^::cocok\s+/, '').split(';')) { const [a, z] = p.split('=').map((y) => y.trim()); if (a && z && !ARAB.test(a + z)) b.cocok.push([a, z]); } continue; }
      if (baris.startsWith('::') || baris.startsWith('|')) continue;
      if (/^#{3,}\s/.test(baris)) { tutup(); sub = baris.replace(/^#+\s*/, ''); continue; }
      if (/^#{1,2}\s/.test(baris)) { tutup(); sub = ''; continue; }
      if (/^[-*]\s/.test(baris)) {
        const t = bersih(baris.slice(2));
        butir.push(t);
        const m = /^([A-Z][\w' -]{1,40}?):\s+(.{8,200})$/.exec(t);
        if (m && jumlahKata(m[1]!) <= 5 && !ARAB.test(t) && istilahBaik(m[1]!, m[2]!)) b.istilah.push({ kata: m[1]!, arti: m[2]!.replace(/[.]$/, ''), kalimat: t, bab: b.bab });
        continue;
      }
      tutup();
      for (const k of kalimatDari(baris)) tambahDariKalimat(b, k);
    }
    tutup();
    const p = x.teks.split('\n').find((l) => l.trim() && !/^[-*#:|]/.test(l.trim()) && !ARAB.test(l));
    if (p) b.paragraf.push({ judul: x.judul.split('|')[0]!.trim(), teks: kalimatDari(p).slice(0, 2).join(' ') });
  }
  return b;
}

interface BukuBse { meta: { judul: string; kelas?: string; mapel?: string }; bab: { judul: string; blok: { t: string; x: string }[] }[] }
let bseCache: BukuBse[] | null = null;
function semuaBse(): BukuBse[] {
  if (!bseCache) {
    const dir = path.join(AKAR, 'pustaka', 'bse');
    bseCache = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^s-.*\.json$/.test(f)).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as BukuBse) : [];
  }
  return bseCache;
}
const NAMA_BSE: Record<string, string[]> = {
  'pendidikan-pancasila': ['PPKn'], 'bahasa-indonesia': ['Bahasa Indonesia'], ipas: ['IPA', 'IPS'], ipa: ['IPA'], ips: ['IPS'], pjok: ['PJOK'],
  'seni-budaya': ['Seni Budaya & Prakarya'], 'seni-prakarya': ['Seni Budaya & Prakarya'], informatika: ['TIK'], matematika: ['Matematika'],
};

function bahanBse(m: Mapel, kelas: number, smt: 'ganjil' | 'genap', jenis: JenisSlot): Bahan | null {
  const nama = NAMA_BSE[m.slug] ?? m.bse ?? [];
  const buku = semuaBse().filter((x) => x.meta.kelas === `Kelas ${kelas}` && nama.includes(x.meta.mapel ?? ''));
  if (!buku.length) return null;
  const b: Bahan = { bab: 0, ketat: true, kuis: [], cocok: [], istilah: [], rumpang: [], daftar: [], paragraf: [], sumber: buku.map((x) => x.meta.judul).join('; ') + ' (BSE)' };
  for (const bk of buku) {
    const separuh = Math.ceil(bk.bab.length / 2);
    const semester = smt === 'ganjil' ? bk.bab.slice(0, separuh) : bk.bab.slice(separuh);
    const pakai = jenis === 'pts' ? semester.slice(0, Math.max(1, Math.ceil(semester.length / 2))) : semester;
    for (const bab of pakai) {
      b.bab += 1;
      const teks = bab.blok.filter((x) => x.t === 'p' || x.t === 'li').map((x) => x.x);
      for (const t of teks) for (const k of kalimatDari(t)) tambahDariKalimat(b, k);
      const p = teks.find((t) => jumlahKata(t) > 15 && layak(t));
      const jb = bab.judul.replace(/\s*\(bagian \d+\)/, '').replace(/^(bab|unit|tema|pelajaran)\s*\d+\s*[:.–-]?\s*/i, '').replace(/^\d+\.\s*/, '').trim();
      if (p && jumlahKata(jb) >= 2 && !/^\d+$/.test(jb)) b.paragraf.push({ judul: jb, teks: kalimatDari(p).slice(0, 2).join(' ') });
    }
  }
  return b;
}

/* ── penyusun soal dari bahan ─────────────────────────────────────────────────────────────────────────────── */
const unik = <T>(arr: T[], kunci: (x: T) => string) => { const s = new Set<string>(); return arr.filter((x) => { const k = kunci(x).toLowerCase(); if (s.has(k)) return false; s.add(k); return true; }); };

function pengecoh(benar: string, kolam: string[], r: () => number, n = 3): string[] | null {
  const b = benar.toLowerCase();
  const calon = unik(kolam.filter((x) => x && x.toLowerCase() !== b && !x.toLowerCase().includes(b) && !b.includes(x.toLowerCase()) && Math.abs(jumlahKata(x) - jumlahKata(benar)) <= 3), (x) => x);
  if (calon.length < n) return null;
  return acak(calon, r).slice(0, n);
}

function susun(slot: Slot, b: Bahan): HasilMesin | null {
  const r = benih(`${slot.jenjang}${slot.kelas}${slot.m.slug}${slot.semester}${slot.jenis}`);
  // tokoh/orang bukan „istilah“ (tidak ditanya „Jelaskan pengertian Abu Bakar!“) — tetap boleh di menjodohkan
  const TOKOH = /^(sahabat|nabi|rasul|budak|tokoh|orang yang (?:pertama|dimerdekakan)|putra|putri|istri|paman|kakek|ayah|ibu|khalifah|raja|pahlawan|penemu|pendiri|ulama|imam)\b/i;
  b.istilah = unik(b.istilah.filter((x) => jumlahKata(x.kata) <= 5 && x.arti.length <= 200), (x) => x.kata.toLowerCase());
  const tokoh = new Set(b.istilah.filter((x) => TOKOH.test(x.arti) || /\b(bin|binti|ibnu)\b|^(Abu|Umar|Utsman|Ali|Khalid|Bilal|Siti)\b/.test(x.kata)).map((x) => x.kata));
  const konsep = b.istilah.filter((x) => !tokoh.has(x.kata));
  const sudah = new Set<string>();
  const baru = (t: string) => { const k = t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); if (sudah.has(k)) return false; sudah.add(k); return true; };
  b.rumpang = unik(b.rumpang, (x) => x.kalimat);
  b.kuis = unik(b.kuis, (x) => x.t);
  const istilahKata = konsep.map((x) => x.kata);
  const kolamJawab = [...istilahKata, ...b.rumpang.map((x) => x.jawab), ...b.kuis.map((x) => x.o[x.k]!)];
  const pakai = new Set<string>();
  const pg: string[] = [];
  const tambahPg = (t: string, benar: string, salah: string[], bahas: string) => {
    if (pg.length >= FORMAT.pg || !baru(t)) return;
    const sama = /^[A-Z]/.test(benar);
    salah = salah.map((x) => (sama ? hurufBesar(x) : hurufKecil(x)));
    const opsi = acak([benar, ...salah], r);
    pg.push(`${pg.length + 1}. ${t}\n${opsi.map((o, i) => `${o === benar ? '*' : ''}${huruf[i]}. ${o}`).join('\n')}\n> ${bahas}`);
  };
  for (const k of acak(b.kuis, r)) { if (pakai.has(k.t)) continue; pakai.add(k.t); pakai.add(`i:${k.o[k.k]!.toLowerCase()}`); tambahPg(k.t, k.o[k.k]!, k.o.filter((_, i) => i !== k.k), k.b ?? `Jawaban yang benar: ${k.o[k.k]}.`); }
  // pengecoh: utamakan istilah dari bab yang sama, lalu bab tetangga — supaya pilihan jawaban sekelompok materi
  const kolamBab = (bab: number) => [...konsep.filter((x) => x.bab === bab).map((x) => x.kata), ...b.rumpang.filter((x) => x.bab === bab).map((x) => x.jawab), ...konsep.filter((x) => Math.abs(x.bab - bab) === 1).map((x) => x.kata), ...(b.ketat ? [] : istilahKata)];
  for (const s of acak(konsep, r)) {
    if (pg.length >= FORMAT.pg) break;
    if (pakai.has(`i:${s.kata.toLowerCase()}`)) continue;
    const p = pengecoh(s.kata, kolamBab(s.bab), r) ?? (b.ketat ? null : pengecoh(s.kata, istilahKata.length >= 6 ? istilahKata : kolamJawab, r));
    if (!p) continue;
    pakai.add(`i:${s.kata.toLowerCase()}`);
    tambahPg(`${hurufBesar(s.arti.replace(/[.]$/, ''))} disebut ....`, s.kata, p, `${s.kata}: ${s.arti.replace(/[.]$/, '')}.`);
  }
  for (const s of acak(b.rumpang, r)) {
    if (pg.length >= FORMAT.pg) break;
    const p = pengecoh(s.jawab, kolamBab(s.bab), r) ?? (b.ketat ? null : pengecoh(s.jawab, kolamJawab, r));
    if (!p || pakai.has(`r:${s.kalimat}`)) continue;
    pakai.add(`r:${s.kalimat}`);
    tambahPg(s.kalimat.replace(/[.]$/, ''), s.jawab, p, s.kalimat.replace('....', s.jawab));
  }
  if (pg.length < FORMAT.pg) return null;

  // menjodohkan: pasangan ::cocok lalu istilah berarti pendek
  const pasang = unik([...b.cocok, ...b.istilah.filter((x) => x.arti.length <= 70).map((x) => [x.kata, x.arti.replace(/[.]$/, '')] as [string, string])], (x) => x[0]);
  const pilihPasang = acak(pasang, r).slice(0, FORMAT.jodoh);
  if (pilihPasang.length < FORMAT.jodoh) return null;
  const sisaArti = pasang.filter((x) => !pilihPasang.includes(x)).map((x) => x[1]);
  const jodoh = [...pilihPasang.map(([a, z], i) => `${i + 1}. ${a.replace(/=/g, '-')} = ${z.replace(/=/g, '-')}`), `~ ${(sisaArti[0] ?? 'tidak ada pasangannya').replace(/=/g, '-')}`];

  // isian: rumpang, istilah, kuis berjawaban pendek
  const isian: string[] = [];
  const tambahIsian = (t: string, j: string[]) => { if (isian.length < FORMAT.isian && !t.includes(' = ') && baru(t)) isian.push(`${isian.length + 1}. ${t} = ${j.join(' | ')}`); };
  for (const s of acak(b.rumpang, r)) if (!pakai.has(`r:${s.kalimat}`)) { pakai.add(`r:${s.kalimat}`); tambahIsian(s.kalimat.replace(/[.]$/, '.'), [s.jawab]); }
  for (const s of acak(b.istilah, r)) if (!pakai.has(`i:${s.kata.toLowerCase()}`)) { pakai.add(`i:${s.kata.toLowerCase()}`); tambahIsian(`${hurufBesar(s.arti.replace(/[.]$/, ''))} ${tokoh.has(s.kata) ? 'adalah' : 'disebut'} ....`, [s.kata]); }
  for (const k of acak(b.kuis, r)) { const j = k.o[k.k]!; if (jumlahKata(j) <= 4 && k.t.includes('....')) tambahIsian(k.t, [j]); }
  if (isian.length < FORMAT.isian) return null;

  // uraian: daftar → sebutkan; istilah → jelaskan; paragraf bab → jelaskan
  const uraian: [string, string][] = [];
  for (const d of acak(unik(b.daftar, (x) => x.judul), r)) {
    if (uraian.length >= 2) break;
    const t = d.kalimat ? `${d.judul.replace(/[,.:]$/, '')}. Sebutkan!` : `Sebutkan ${hurufKecil(d.judul.replace(/[:.]$/, ''))}!`;
    uraian.push([t, `${d.butir.join(', ')}.`]);
  }
  for (const s of acak(konsep.filter((x) => jumlahKata(x.arti) >= 5), r)) { if (uraian.length >= 4) break; if (!baru(`Jelaskan pengertian ${s.kata}`)) continue; uraian.push([`Jelaskan pengertian ${s.kata}!`, `${s.kata} adalah ${s.arti.replace(/[.]$/, '')}.`]); }
  for (const p of acak(b.paragraf.filter((x) => x.teks.length > 40), r)) { if (uraian.length >= FORMAT.uraian) break; uraian.push([`Jelaskan secara singkat tentang ${hurufKecil(p.judul)}!`, p.teks]); }
  for (const s of acak(konsep, r)) { if (uraian.length >= FORMAT.uraian) break; if (!uraian.some((u) => u[0].includes(s.kata))) uraian.push([`Apa yang dimaksud dengan ${s.kata}?`, `${s.kata} adalah ${s.arti.replace(/[.]$/, '')}.`]); }
  if (uraian.length < FORMAT.uraian) return null;

  const teks = `[PILIHAN GANDA]\n${pg.join('\n')}\n[MENJODOHKAN]\n${jodoh.join('\n')}\n[ISIAN]\n${isian.join('\n')}\n[URAIAN]\n${uraian.map(([t, j], i) => `${i + 1}. ${t}\n= ${j}`).join('\n')}\n`;
  return { teks, sumber: b.sumber };
}

/* ── matematika: templat hitungan berjenjang ──────────────────────────────────────────────────────────────── */
type Hitung = { t: string; j: number | string; s: (number | string)[]; b: string };
const rb = (r: () => number, a: number, z: number) => a + Math.floor(r() * (z - a + 1));
const fmt = (n: number | string) => (typeof n === 'number' ? (Number.isInteger(n) ? n.toLocaleString('id-ID') : n.toLocaleString('id-ID', { maximumFractionDigits: 2 })) : n);
const sekitar = (j: number, r: () => number): number[] => { const d = new Set<number>(); const lang = Math.max(1, Math.round(Math.abs(j) * 0.1)); while (d.size < 3) { const x = j + (rb(r, 1, 4) * lang) * (r() < 0.5 ? -1 : 1); if (x !== j && (j < 0 || x >= 0)) d.add(x); } return [...d]; };

function templatMtk(kelas: number, smt: 'ganjil' | 'genap', r: () => number): (() => Hitung)[] {
  const tambah = (maks: number) => () => { const a = rb(r, 1, maks), b = rb(r, 1, maks); return { t: `${fmt(a)} + ${fmt(b)} = ....`, j: a + b, s: sekitar(a + b, r), b: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` }; };
  const kurang = (maks: number) => () => { const a = rb(r, 2, maks), b = rb(r, 1, a - 1); return { t: `${fmt(a)} – ${fmt(b)} = ....`, j: a - b, s: sekitar(a - b, r), b: `${fmt(a)} – ${fmt(b)} = ${fmt(a - b)}.` }; };
  const kali = (a1: number, a2: number, b1: number, b2: number) => () => { const a = rb(r, a1, a2), b = rb(r, b1, b2); return { t: `${fmt(a)} × ${fmt(b)} = ....`, j: a * b, s: sekitar(a * b, r), b: `${fmt(a)} × ${fmt(b)} = ${fmt(a * b)}.` }; };
  const bagi = (b1: number, b2: number, h1: number, h2: number) => () => { const b = rb(r, b1, b2), h = rb(r, h1, h2); return { t: `${fmt(b * h)} : ${fmt(b)} = ....`, j: h, s: sekitar(h, r), b: `${fmt(b * h)} : ${fmt(b)} = ${fmt(h)}, karena ${fmt(b)} × ${fmt(h)} = ${fmt(b * h)}.` }; };
  const cerita = (maks: number) => () => { const n = ['Ani', 'Budi', 'Siti', 'Rudi', 'Fatimah', 'Hasan'][rb(r, 0, 5)]!, ben = ['kelereng', 'buku', 'pensil', 'jeruk', 'permen', 'kue'][rb(r, 0, 5)]!; const a = rb(r, 2, maks), b = rb(r, 1, Math.max(1, Math.floor(maks / 2))); return { t: `${n} mempunyai ${fmt(a)} ${ben}, lalu diberi ${fmt(b)} ${ben} lagi. Banyak ${ben} ${n} sekarang ....`, j: a + b, s: sekitar(a + b, r), b: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)} ${ben}.` }; };
  const sisa = (maks: number) => () => { const n = ['Ibu', 'Ayah', 'Kakak', 'Paman'][rb(r, 0, 3)]!, ben = ['telur', 'apel', 'roti', 'buku'][rb(r, 0, 3)]!; const a = rb(r, 5, maks), b = rb(r, 1, a - 1); return { t: `${n} mempunyai ${fmt(a)} ${ben}. Sebanyak ${fmt(b)} ${ben} diberikan kepada tetangga. Sisa ${ben} ${n.toLowerCase()} ....`, j: a - b, s: sekitar(a - b, r), b: `${fmt(a)} – ${fmt(b)} = ${fmt(a - b)} ${ben}.` }; };
  const kelilingPersegi = () => { const s = rb(r, 3, 25); return { t: `Keliling persegi dengan panjang sisi ${s} cm adalah .... cm`, j: 4 * s, s: [s * s, 2 * s, 4 * s + 2], b: `Keliling persegi = 4 × sisi = 4 × ${s} = ${4 * s} cm.` }; };
  const luasPP = () => { const p = rb(r, 5, 30), l = rb(r, 2, p - 1); return { t: `Luas persegi panjang dengan panjang ${p} cm dan lebar ${l} cm adalah .... cm²`, j: p * l, s: [2 * (p + l), p + l, p * l + p], b: `Luas = p × l = ${p} × ${l} = ${p * l} cm².` }; };
  const kpk = () => { const pas = [[4, 6], [6, 8], [3, 5], [8, 12], [9, 12], [10, 15], [6, 9], [4, 10]][rb(r, 0, 7)]!; const g = (a: number, b: number): number => (b ? g(b, a % b) : a); const k = (pas[0]! * pas[1]!) / g(pas[0]!, pas[1]!); return { t: `KPK dari ${pas[0]} dan ${pas[1]} adalah ....`, j: k, s: [pas[0]! * pas[1]!, g(pas[0]!, pas[1]!), k + pas[0]!].filter((x) => x !== k), b: `Kelipatan persekutuan terkecil ${pas[0]} dan ${pas[1]} adalah ${k}.` }; };
  const fpb = () => { const pas = [[12, 18], [16, 24], [20, 30], [15, 25], [18, 27], [24, 36], [14, 21], [30, 45]][rb(r, 0, 7)]!; const g = (a: number, b: number): number => (b ? g(b, a % b) : a); const f = g(pas[0]!, pas[1]!); return { t: `FPB dari ${pas[0]} dan ${pas[1]} adalah ....`, j: f, s: [f * 2, Math.max(1, f / 2 | 0) === f ? f + 1 : Math.max(1, f / 2 | 0), f + 3], b: `Faktor persekutuan terbesar ${pas[0]} dan ${pas[1]} adalah ${f}.` }; };
  const pecahanTambah = () => { const d = [2, 3, 4, 5, 6, 8, 10][rb(r, 0, 6)]!, a = rb(r, 1, d - 1), b = rb(r, 1, d - 1); return { t: `${a}/${d} + ${b}/${d} = ....`, j: `${a + b}/${d}`, s: [`${a + b}/${d * 2}`, `${a * b}/${d}`, `${Math.abs(a - b) || 1}/${d}`], b: `Penyebut sama, pembilang dijumlahkan: ${a} + ${b} = ${a + b}, jadi ${a + b}/${d}.` }; };
  const persen = () => { const p = [10, 20, 25, 50, 75][rb(r, 0, 4)]!, n = rb(r, 2, 20) * 20; return { t: `${p}% dari ${fmt(n)} adalah ....`, j: (p * n) / 100, s: sekitar((p * n) / 100, r), b: `${p}/100 × ${fmt(n)} = ${fmt((p * n) / 100)}.` }; };
  const volumeKubus = () => { const s = rb(r, 2, 15); return { t: `Volume kubus dengan rusuk ${s} cm adalah .... cm³`, j: s ** 3, s: [s * s, 6 * s * s, 12 * s], b: `V = s × s × s = ${s} × ${s} × ${s} = ${s ** 3} cm³.` }; };
  const volumeBalok = () => { const p = rb(r, 4, 20), l = rb(r, 2, 10), t = rb(r, 2, 10); return { t: `Volume balok dengan panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm adalah .... cm³`, j: p * l * t, s: [p * l + t, 2 * (p * l + p * t + l * t), p + l + t], b: `V = p × l × t = ${p} × ${l} × ${t} = ${p * l * t} cm³.` }; };
  const kecepatan = () => { const v = rb(r, 3, 12) * 10, w = rb(r, 2, 5); return { t: `Sebuah mobil melaju dengan kecepatan ${v} km/jam selama ${w} jam. Jarak yang ditempuh .... km`, j: v * w, s: [v + w, v * w + 10, Math.round(v / w)], b: `Jarak = kecepatan × waktu = ${v} × ${w} = ${v * w} km.` }; };
  const luasLingkaran = () => { const jr = rb(r, 1, 5) * 7; return { t: `Luas lingkaran dengan jari-jari ${jr} cm (π = 22/7) adalah .... cm²`, j: (22 / 7) * jr * jr, s: [2 * (22 / 7) * jr, (22 / 7) * jr, (22 / 7) * jr * jr * 2], b: `L = π × r × r = 22/7 × ${jr} × ${jr} = ${fmt((22 / 7) * jr * jr)} cm².` }; };
  const kelilingLingkaran = () => { const d = rb(r, 1, 6) * 14; return { t: `Keliling lingkaran dengan diameter ${d} cm (π = 22/7) adalah .... cm`, j: (22 / 7) * d, s: [(22 / 7) * d * 2, (22 / 7) * (d / 2) ** 2, d * 3], b: `K = π × d = 22/7 × ${d} = ${fmt((22 / 7) * d)} cm.` }; };
  const bulat = () => { const a = rb(r, -20, 20), b = rb(r, -20, 20); return { t: `(${a}) + (${b}) = ....`, j: a + b, s: sekitar(a + b, r).map((x) => (x === a + b ? x + 1 : x)), b: `${a} + (${b}) = ${a + b}.` }; };
  const rata = () => { const n = Array.from({ length: 5 }, () => rb(r, 5, 10)); const s = n.reduce((x, y) => x + y, 0); return { t: `Rata-rata dari data ${n.join(', ')} adalah ....`, j: s / 5, s: [s, Math.max(...n), Math.min(...n)].filter((x) => x !== s / 5), b: `Jumlah data ${s} dibagi 5 = ${fmt(s / 5)}.` }; };
  const persamaan = () => { const a = rb(r, 2, 6), x = rb(r, 1, 12), b = rb(r, 1, 20); return { t: `Nilai x yang memenuhi ${a}x + ${b} = ${a * x + b} adalah ....`, j: x, s: sekitar(x, r), b: `${a}x = ${a * x + b} – ${b} = ${a * x}, jadi x = ${a * x} : ${a} = ${x}.` }; };
  const sederhana = () => { const a = rb(r, 2, 9), b = rb(r, 2, 9), c = rb(r, 1, 9); return { t: `Bentuk sederhana dari ${a}x + ${b}x – ${c} adalah ....`, j: `${a + b}x – ${c}`, s: [`${a * b}x – ${c}`, `${a + b}x + ${c}`, `${a + b - c}x`], b: `Suku sejenis dijumlahkan: ${a}x + ${b}x = ${a + b}x, jadi ${a + b}x – ${c}.` }; };
  const pythagoras = () => { const t = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20]][rb(r, 0, 5)]!; return { t: `Segitiga siku-siku dengan sisi siku-siku ${t[0]} cm dan ${t[1]} cm. Panjang sisi miringnya .... cm`, j: t[2]!, s: [t[0]! + t[1]!, t[2]! + 1, t[1]! + 1].filter((x) => x !== t[2]), b: `c² = ${t[0]}² + ${t[1]}² = ${t[0]! ** 2 + t[1]! ** 2}, c = ${t[2]} cm.` }; };
  const gradien = () => { const x1 = rb(r, 0, 5), y1 = rb(r, 0, 5), m = rb(r, 1, 4), dx = rb(r, 1, 4); return { t: `Gradien garis yang melalui titik (${x1}, ${y1}) dan (${x1 + dx}, ${y1 + m * dx}) adalah ....`, j: m, s: [m + 1, -m, dx].filter((x) => x !== m), b: `m = (${y1 + m * dx} – ${y1}) : (${x1 + dx} – ${x1}) = ${m * dx} : ${dx} = ${m}.` }; };
  const pangkat = () => { const a = rb(r, 2, 5), p = rb(r, 2, 4), q = rb(r, 1, 3); return { t: `Hasil dari ${a}^${p} × ${a}^${q} = ${a}^....`, j: p + q, s: [p * q, Math.abs(p - q) || p + q + 1, p + q + 1], b: `Pangkat dijumlahkan: ${p} + ${q} = ${p + q}.` }; };
  const akarKuadrat = () => { const a = rb(r, 1, 6), b = rb(r, 1, 6); return { t: `Akar-akar persamaan x² – ${a + b}x + ${a * b} = 0 adalah ....`, j: `x = ${Math.min(a, b)} atau x = ${Math.max(a, b)}`, s: [`x = –${a} atau x = –${b}`, `x = ${a + b} atau x = ${a * b}`, `x = ${a * b} atau x = 1`], b: `(x – ${a})(x – ${b}) = 0, jadi x = ${a} atau x = ${b}.` }; };
  const volTabung = () => { const jr = 7, t = rb(r, 2, 10) * 5; return { t: `Volume tabung dengan jari-jari ${jr} cm dan tinggi ${t} cm (π = 22/7) adalah .... cm³`, j: 154 * t, s: [44 * t, 154 + t, 22 * t], b: `V = π × r² × t = 22/7 × 49 × ${t} = ${154 * t} cm³.` }; };
  const MI1 = smt === 'ganjil' ? [tambah(5), kurang(10), cerita(5), sisa(10)] : [tambah(10), kurang(20), cerita(10), sisa(20)];
  if (kelas === 1) return MI1;
  if (kelas === 2) return smt === 'ganjil' ? [tambah(50), kurang(99), cerita(50), sisa(99)] : [kali(1, 5, 1, 10), tambah(500), kurang(999), cerita(200)];
  if (kelas === 3) return smt === 'ganjil' ? [kali(2, 10, 2, 10), bagi(2, 10, 2, 10), tambah(999), sisa(999)] : [kali(2, 12, 10, 50), bagi(2, 9, 10, 30), kelilingPersegi, luasPP];
  if (kelas === 4) return smt === 'ganjil' ? [kpk, fpb, kali(11, 99, 2, 9), bagi(2, 12, 10, 99)] : [kelilingPersegi, luasPP, pecahanTambah, cerita(500)];
  if (kelas === 5) return smt === 'ganjil' ? [pecahanTambah, persen, kecepatan, kali(12, 99, 11, 30)] : [volumeKubus, volumeBalok, persen, kecepatan];
  if (kelas === 6) return smt === 'ganjil' ? [bulat, luasLingkaran, kelilingLingkaran, kpk] : [rata, volTabung, volumeBalok, bulat];
  if (kelas === 7) return smt === 'ganjil' ? [bulat, pecahanTambah, sederhana, persen] : [persamaan, sederhana, kelilingPersegi, luasPP];
  if (kelas === 8) return smt === 'ganjil' ? [gradien, persamaan, pangkat, sederhana] : [pythagoras, luasLingkaran, kelilingLingkaran, rata];
  return smt === 'ganjil' ? [pangkat, akarKuadrat, persamaan, gradien] : [volTabung, volumeKubus, pythagoras, rata];
}

function susunMatematika(slot: Slot): HasilMesin {
  const r = benih(`${slot.jenjang}${slot.kelas}mtk${slot.semester}${slot.jenis}`);
  const tpl = templatMtk(slot.kelas, slot.semester, r);
  const pakai = slot.jenis === 'pts' ? tpl.slice(0, 2) : tpl;
  const ambil = (i: number) => { const h = pakai[i % pakai.length]!(); return h; };
  const dilihat = new Set<string>();
  const baru = (i: number): Hitung => { for (let c = 0; c < 20; c++) { const h = ambil(i + c * 7); if (!dilihat.has(h.t)) { dilihat.add(h.t); return h; } } return ambil(i); };
  const pg = Array.from({ length: FORMAT.pg }, (_, i) => {
    const h = baru(i);
    const opsi = acak([fmt(h.j), ...[...new Set(h.s.map(fmt))].filter((x) => x !== fmt(h.j)).slice(0, 3)], r);
    while (opsi.length < 4) opsi.push(fmt(typeof h.j === 'number' ? h.j + opsi.length * 3 + 1 : `${h.j} `));
    return `${i + 1}. ${h.t}\n${opsi.map((o, k) => `${String(o) === String(fmt(h.j)) ? '*' : ''}${huruf[k]}. ${o}`).join('\n')}\n> ${h.b}`;
  });
  const jod = Array.from({ length: FORMAT.jodoh }, (_, i) => baru(100 + i));
  const jodoh = [...jod.map((h, i) => `${i + 1}. ${h.t.replace(/ = \.\.\.\.$/, '').replace(/ = /g, ' sama dengan ').replace(/\s*\.\.\.\..*$/, '')} = ${fmt(h.j)}`), `~ ${fmt(typeof jod[0]!.j === 'number' ? (jod[0]!.j as number) + 11 : '0')}`];
  const isian = Array.from({ length: FORMAT.isian }, (_, i) => { const h = baru(200 + i); return `${i + 1}. ${h.t.replace(/ = \.\.\.\.$/, ' hasilnya ....').replace(/ = /g, ' sama dengan ')} = ${fmt(h.j)}`; });
  const uraian = Array.from({ length: FORMAT.uraian }, (_, i) => { const h = baru(300 + i); return `${i + 1}. ${h.t.replace(/ = \.\.\.\.$/, ' = ?').replace(/\.\.\.\./g, '?')} Tuliskan cara penyelesaiannya!\n= ${h.b}`; });
  return { teks: `[PILIHAN GANDA]\n${pg.join('\n')}\n[MENJODOHKAN]\n${jodoh.join('\n')}\n[ISIAN]\n${isian.join('\n')}\n[URAIAN]\n${uraian.join('\n')}\n`, sumber: `templat hitungan Matematika kelas ${slot.kelas} (Kurikulum Merdeka)` };
}

/* ── soal Uji Kompetensi BSE yang kuncinya sudah ditinjau (soal/kunci-bse.list) ─────────────────────────────── */
type ButirPos = ButirBse & { pos: number };
const UJUNG_ISIAN = /\s*(?:adalah|ialah|disebut|dinamakan|yaitu|merupakan)?\s*\.\.\.\.\s*[.]?$/;
const bisaIsian = (x: ButirPos) => /\.\.\.\./.test(x.t) && jumlahKata(x.o[x.k]!) <= 3 && !/^[a-d]\b/i.test(x.o[x.k]!);
const bisaJodoh = (x: ButirPos) => UJUNG_ISIAN.test(x.t) && (x.t.match(/\.\.\.\./g) ?? []).length === 1 && jumlahKata(x.t) <= 14 && jumlahKata(x.o[x.k]!) <= 4;
/** Pembahasan: kalimat soal yang dilengkapi jawabannya. */
const bahasBse = (x: ButirBse) => {
  const j = x.o[x.k]!;
  const lengkap = x.t.includes('....') ? hurufBesar(x.t.replace('....', j).replace(/\s*\.\.\.\./g, '').replace(/\s+([.,;:])/g, '$1').replace(/[.?!:]*$/, '.')) : `Jawaban: ${j}.`;
  // kalimat buku sebagai tambahan TIDAK dipakai: hasil ekstraksi PDF dua kolom kadang tercampur kalimat kolom sebelah
  return lengkap;
};
const alokasiCache = new Map<string, Record<JenisSlot, { pg: ButirPos[]; isian: ButirPos[]; jodoh: ButirPos[]; pengecoh?: string; uraian: [string, string][] } | null>>();

function alokasiBse(slot: Slot): ReturnType<typeof alokasiCache.get> | null {
  const nama = NAMA_BSE[slot.m.slug] ?? slot.m.bse ?? [];
  const kunci = `${slot.jenjang}${slot.kelas}${slot.m.slug}${slot.semester}`;
  if (alokasiCache.has(kunci)) return alokasiCache.get(kunci)!;
  const buku = nama.flatMap((n) => soalBse(n, slot.kelas));
  const ganjil = slot.semester === 'ganjil';
  const semua: ButirPos[] = buku.flatMap((b) => b.pg.map((x) => ({ ...x, pos: (x.bab + 0.5) / Math.max(1, b.jumlahBab) })))
    .filter((x) => (ganjil ? x.pos < 0.5 : x.pos >= 0.5));
  const urRaw = [...buku.flatMap((b) => b.uraian.filter((u) => u.ok).map((u) => ({ t: u.t, j: u.j, pos: (u.bab + 0.5) / Math.max(1, b.jumlahBab) })).filter((u) => (ganjil ? u.pos < 0.5 : u.pos >= 0.5))),
    ...uraianTulis(slot.m.slug, slot.kelas, slot.semester).map((u) => ({ ...u, pos: u.pts ? (ganjil ? 0.1 : 0.6) : (ganjil ? 0.4 : 0.9) }))];
  const awal = (pos: number) => (ganjil ? pos < 0.25 : pos < 0.75);
  const r = benih(kunci);
  const dipakai = new Set<string>();
  const hasil: Record<JenisSlot, { pg: ButirPos[]; isian: ButirPos[]; jodoh: ButirPos[]; pengecoh?: string; uraian: [string, string][] } | null> = { pts: null, pas: null, latihan: null };
  const urDipakai = new Set<string>();
  const ambilUraian = (lebihDulu: (p: number) => boolean, n: number) => {
    const u = [...acak(urRaw.filter((x) => lebihDulu(x.pos) && !urDipakai.has(x.t)), r), ...acak(urRaw.filter((x) => !lebihDulu(x.pos) && !urDipakai.has(x.t)), r), ...acak(urRaw, r)];
    const out: [string, string][] = [];
    for (const x of u) { if (out.length >= n) break; if (out.some((y) => y[0] === x.t)) continue; urDipakai.add(x.t); out.push([x.t, x.j]); }
    return out;
  };
  const susunSatu = (urutan: ButirPos[], jenis: JenisSlot) => {
    const daftar = unik(urutan, (x) => x.id);
    const isian: ButirPos[] = [], jodoh: ButirPos[] = [], pg: ButirPos[] = [];
    const kanan = new Set<string>();
    for (const x of daftar) if (jodoh.length < FORMAT.jodoh && bisaJodoh(x) && !kanan.has(x.o[x.k]!.toLowerCase())) { jodoh.push(x); kanan.add(x.o[x.k]!.toLowerCase()); }
    for (const x of daftar) if (isian.length < FORMAT.isian && !jodoh.includes(x) && bisaIsian(x)) isian.push(x);
    for (const x of daftar) if (pg.length < FORMAT.pg && !jodoh.includes(x) && !isian.includes(x)) pg.push(x);
    const lebih = daftar.find((x) => !jodoh.includes(x) && !isian.includes(x) && !pg.includes(x) && jumlahKata(x.o[x.k]!) <= 4 && !kanan.has(x.o[x.k]!.toLowerCase()));
    const pengecoh = lebih?.o[lebih.k];
    const penuh = pg.length === FORMAT.pg && isian.length === FORMAT.isian && jodoh.length === FORMAT.jodoh;
    if (jenis !== 'latihan' && !penuh) return null;
    if (jenis === 'latihan' && pg.length < 10) return null;
    for (const x of [...pg, ...isian, ...jodoh]) dipakai.add(x.id);
    const uraian = ambilUraian(jenis === 'pts' ? awal : (p) => !awal(p), FORMAT.uraian);
    if (jenis !== 'latihan' && uraian.length < FORMAT.uraian) return null;
    return { pg, isian, jodoh, ...(pengecoh ? { pengecoh } : {}), uraian };
  };
  const belum = (xs: ButirPos[]) => xs.filter((x) => !dipakai.has(x.id));
  const depan = acak(semua.filter((x) => awal(x.pos)), r), belakang = acak(semua.filter((x) => !awal(x.pos)), r);
  hasil.pts = susunSatu([...depan, ...belakang], 'pts');
  hasil.pas = susunSatu([...belum(belakang), ...belum(depan), ...belakang, ...depan], 'pas');
  hasil.latihan = susunSatu([...belum(depan), ...belum(belakang), ...acak(semua, r)], 'latihan');
  alokasiCache.set(kunci, hasil);
  return hasil;
}

function susunBse(slot: Slot): HasilMesin | null {
  const a = alokasiBse(slot)?.[slot.jenis];
  if (!a) return null;
  const pg = a.pg.map((x, i) => `${i + 1}. ${x.t}\n${x.o.map((o, j) => `${j === x.k ? '*' : ''}${huruf[j]}. ${o}`).join('\n')}\n> ${bahasBse(x)}`);
  const kiri = (t: string) => hurufBesar(t.replace(UJUNG_ISIAN, '').replace(/[,:]$/, '').replace(/\s+(?:yang|ialah|adalah|disebut|bernama|dinamakan)$/i, '').trim());
  const jodoh = a.jodoh.length ? [...a.jodoh.map((x, i) => `${i + 1}. ${kiri(x.t).replace(/=/g, '-')} = ${x.o[x.k]!.replace(/=/g, '-')}`), ...(a.pengecoh ? [`~ ${a.pengecoh.replace(/=/g, '-')}`] : [])] : [];
  const isian = a.isian.map((x, i) => `${i + 1}. ${x.t.replace(/=/g, '-')} = ${x.o[x.k]!.replace(/=/g, '-')}`);
  const uraian = a.uraian.map(([t, j], i) => `${i + 1}. ${t}\n= ${j}`);
  const buku = [...new Set((NAMA_BSE[slot.m.slug] ?? slot.m.bse ?? []).flatMap((n) => soalBse(n, slot.kelas).map((b) => b.judul)))].join('; ');
  const teks = [`[PILIHAN GANDA]`, ...pg, ...(jodoh.length ? ['[MENJODOHKAN]', ...jodoh] : []), ...(isian.length ? ['[ISIAN]', ...isian] : []), ...(uraian.length ? ['[URAIAN]', ...uraian] : [])].join('\n') + '\n';
  return { teks, sumber: `Uji Kompetensi buku BSE ${buku} (kunci ditinjau)` };
}

/* ── titik masuk ──────────────────────────────────────────────────────────────────────────────────────────── */
let naskahCache: NaskahPelajaran[] | null = null;
/** `bse: true` hanya untuk draf guru: ekstraksi kalimat BSE belum selalu benar secara fakta, jadi tidak ikut bank soal tayang. */
export function buatPaketMesin(slot: Slot, o: { bse?: boolean } = {}): HasilMesin | null {
  if (slot.m.slug === 'matematika') return susunMatematika(slot);
  const dariBse = susunBse(slot);
  if (dariBse) return dariBse;
  naskahCache ??= semuaNaskah();
  const n = naskahCache.find((x) => x.jenjang === slot.jenjang && x.kelas === slot.kelas && x.slug === slot.m.slug);
  const coba: (Bahan | null)[] = [];
  if (n) coba.push(bahanNaskah(n, slot.semester, slot.jenis), bahanNaskah(n, slot.semester, 'pas'));
  if (o.bse) coba.push(bahanBse(slot.m, slot.kelas, slot.semester, slot.jenis), bahanBse(slot.m, slot.kelas, slot.semester, 'pas'));
  for (const b of coba) { if (!b) continue; const h = susun(slot, b); if (h) return h; }
  // gabungan naskah + BSE sebagai cadangan terakhir
  const gab = coba.filter((x): x is Bahan => Boolean(x));
  if (gab.length > 1) {
    const b: Bahan = { bab: 0, ketat: gab.some((x) => x.ketat), kuis: gab.flatMap((x) => x.kuis), cocok: gab.flatMap((x) => x.cocok), istilah: gab.flatMap((x) => x.istilah), rumpang: gab.flatMap((x) => x.rumpang), daftar: gab.flatMap((x) => x.daftar), paragraf: gab.flatMap((x) => x.paragraf), sumber: [...new Set(gab.map((x) => x.sumber))].join('; ') };
    return susun(slot, b);
  }
  return null;
}

export const kepalaMesin = (slot: Slot, sumber: string) =>
  `// Disusun mesin bank soal yapida (tanpa AI) dari: ${sumber}. Guru dapat menyalin dan menyuntingnya di portal.\n@jenjang ${slot.jenjang}\n@kelas ${slot.kelas}\n@mapel ${namaMapelSoal(slot.m.nama)}\n@semester ${slot.semester}\n@jenis ${slot.jenis}\n@tahun 2026/2027\n@asal mesin\n\n`;

export { KURIKULUM };
