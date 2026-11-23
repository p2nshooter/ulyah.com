/**
 * Soal dari buku BSE (pemilik, 23 Nov 2026: „Klo susah download aja dari sumber manapun soalnya, trus rapihin“).
 *
 * Sumber: bagian „Uji Kompetensi / Evaluasi / Latihan“ buku BSE Kemendikbud di pustaka/bse — buku yang hak ciptanya
 * dibeli pemerintah dan boleh digandakan & disebarkan masyarakat. Soal dari blog/situs soal TIDAK diambil (berhak cipta).
 *
 * Langkah (tanpa AI, tetap sama setiap build):
 *  1. Potong bagian soal pilihan ganda („Pilihlah …“, „Berilah tanda silang …“) dan uraian („Jawablah …“) tiap bab.
 *  2. Urai butir PG: pokok soal + opsi a–d (juga tata letak dua kolom „a. … c. … b. … d. …“).
 *  3. Rapikan: buang soal bergambar/tabel, soal „kecuali/bukan“, opsi bernomor („1 dan 2“), opsi kosong/terlalu panjang.
 *  4. Tentukan kunci dari isi buku itu sendiri: opsi yang muncul dalam satu kalimat materi bersama kata-kata pokok soal.
 *     Kunci hanya dipakai bila satu opsi unggul jelas; selain itu soal dibuang (lebih baik sedikit daripada salah).
 *  5. Jawaban model uraian: kalimat materi yang paling cocok dengan pertanyaan, hanya bila cocok kuat.
 */
import fs from 'node:fs';
import path from 'node:path';

const LONGGAR = process.env.SOAL_BSE_LONGGAR === '1';
const SARAN_TAYANG = process.env.SOAL_BSE_SARAN === '1';
/** Kunci hasil tinjauan manual: „<id> <a|b|c|d|x>“ per baris (x = soal dibuang). Menimpa kunci otomatis. */
let kunciManual: Map<string, string> | null = null;
function kunciTinjau(): Map<string, string> {
  if (!kunciManual) {
    kunciManual = new Map();
    const f = path.join(path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), 'soal', 'kunci-bse.list');
    if (fs.existsSync(f)) for (const l of fs.readFileSync(f, 'utf8').split('\n')) { const m = /^([0-9a-z]{8})\s+([a-dx])\b/.exec(l.trim()); if (m) kunciManual.set(m[1]!, m[2]!); }
  }
  return kunciManual;
}
/** Jawaban model uraian hasil tinjauan: „<id> ok“ (kalimat buku diterima), „<id> = jawaban“ (ditulis ulang), „<id> x“. */
let jawabManual: Map<string, string> | null = null;
function jawabTinjau(): Map<string, string> {
  if (!jawabManual) {
    jawabManual = new Map();
    const f = path.join(path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), 'soal', 'kunci-bse.list');
    if (fs.existsSync(f)) for (const l of fs.readFileSync(f, 'utf8').split('\n')) { const m = /^([0-9a-z]{8})\s+(ok|x|=\s*(.+))$/.exec(l.trim()); if (m) jawabManual.set(m[1]!, m[3]?.trim() ?? m[2]!); }
  }
  return jawabManual;
}
const sidik = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36).padStart(7, '0').slice(-7) + (s.length % 36).toString(36); };
const AKAR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

export interface ButirBse { id: string; t: string; o: string[]; k: number; bukti: string; bab: number; manual?: boolean }
/** Butir yang lolos saring tetapi kuncinya belum pasti — untuk ditinjau (`--tinjau`). */
export interface CalonBse { id: string; t: string; o: string[]; saran: number; bukti: string; bab: number }
export interface UraianBse { id: string; t: string; j: string; bab: number; ok?: boolean }
export interface SoalBuku { berkas: string; judul: string; jumlahBab: number; pg: ButirBse[]; calon: CalonBse[]; uraian: UraianBse[]; istilah: { kata: string; arti: string; bab: number }[] }

interface BukuBse { meta: { judul: string; kelas?: string; mapel?: string }; bab: { judul: string; blok: { t: string; x: string }[] }[] }

const ARAB = /[؀-ۿ]/;
const HENTI = new Set(('yang dan di ke dari untuk dengan pada dalam oleh adalah ini itu tersebut atau juga akan dapat bisa harus ' +
  'sebagai karena agar supaya maka jika bila kita kamu mereka kami saya dia ia nya pun lah kah tidak bukan sangat lebih paling ' +
  'disebut merupakan ialah yaitu antara lain seperti berikut contoh salah satu hal cara macam jenis bagian ada telah sudah sedang ' +
  'para sebuah suatu seorang setiap semua banyak beberapa serta namun tetapi apabila ketika saat waktu dimaksud manakah apakah ' +
  'siapakah dimanakah mengapa bagaimana berapa berupa memiliki mempunyai terdapat orang kecil besar baik').split(' '));
const PENANDA_PG = /(Pilihlah|Berilah tanda (?:silang|X|x)|Pilih(?:lah)? (?:satu )?jawaban|Silanglah)/;
const PENANDA_LAIN = /(Isilah|Lengkapilah|Jawablah|Kerjakan(?:lah)? soal|Jodohkanlah|Pasangkanlah|Tugas|Refleksi|Rangkuman|Uji Kompetensi|Evaluasi|Latihan Ulangan)/;
const BURUK_POKOK = /gambar|tabel|grafik|diagram|peta di|kecuali|bukan\b|tidak termasuk|tidak benar|salah\b|pernyataan|nomor|di samping|di bawah ini|di atas|berikut ini|perhatikan|bacaan|teks|puisi|cerita|paragraf|kalimat|dialog|percakapan/i;

const bersih = (s: string) => s.replace(/\s+/g, ' ').replace(/\s*(…+|\.{3,}|(?:\. ){3,}\.?)\s*/g, ' .... ').replace(/\s+/g, ' ').trim();
const akarKata = (w: string) => w.toLowerCase().replace(/^(meng|meny|mem|men|me|peng|peny|pem|pen|pe|ber|be|ter|di|ke|se)(?=[a-z]{4,})/, '').replace(/(kan|an|nya|lah|kah|i)$/, '').slice(0, 6);
const kataIsi = (s: string) => [...new Set((s.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []).filter((w) => !HENTI.has(w)).map(akarKata))];

/** Pecah teks bagian PG menjadi butir {pokok, opsi}. */
export function uraiPg(teks: string): { t: string; o: string[] }[] {
  const keluar: { t: string; o: string[] }[] = [];
  // potongan: tiap nomor soal baru („12. Huruf besar …“) atau batas blok
  const potong = teks.split(/\n|\s(?=\d{1,2}\.\s+[A-Z“"(])/).map((x) => x.trim()).filter(Boolean);
  let sisa = '';
  for (const p0 of potong) {
    const p = (sisa ? `${sisa} ` : '') + p0;
    const lab = [...p.matchAll(/(?:^|\s)([a-dA-D])[.)]\s+/g)];
    const a = lab.findIndex((x) => x[1]!.toLowerCase() === 'a');
    if (a < 0) { sisa = /\.\.\.\.|\?$/.test(p0) || p0.length < 220 ? p : ''; continue; }
    sisa = '';
    const grup = lab.slice(a);
    const huruf = grup.map((x) => x[1]!.toLowerCase());
    const n = huruf.includes('d') ? 4 : 3;
    if (new Set(huruf.slice(0, n)).size !== n || !['a', 'b', 'c', 'd'].slice(0, n).every((h) => huruf.slice(0, n).includes(h))) continue;
    const pokok = bersih(p.slice(0, grup[0]!.index).replace(/^\d{1,2}\.\s*/, '').replace(/^[A-E]\.\s+/, ''));
    const opsi: string[] = [];
    for (let i = 0; i < n; i++) {
      const awal = grup[i]!.index! + grup[i]![0].length;
      const akhir = i + 1 < grup.length ? grup[i + 1]!.index! : p.length;
      opsi[['a', 'b', 'c', 'd'].indexOf(huruf[i]!)] = bersih(p.slice(awal, akhir)).replace(/\s*(Perhatikan|Bacalah|Amatilah)\b.*$/, '').replace(/[.;,]$/, '').trim();
    }
    keluar.push({ t: pokok, o: opsi });
  }
  return keluar;
}

/** Pecah bagian „Jawablah …“ menjadi pertanyaan. */
function uraiTanya(teks: string): string[] {
  return teks.replace(/\n/g, ' ').split(/\s(?=\d{1,2}\.\s+[A-Z])/).map((x) => bersih(x.replace(/^\d{1,2}\.\s*/, ''))).filter((x) => /[?!]$/.test(x) && x.length >= 12 && x.length <= 160);
}

/** Buang sisa instruksi, judul halaman berjalan, dan nomor soal yang ikut terbawa di depan pokok soal. */
function rapikanPokok(t0: string): string {
  let t = t0.replace(/^.*?(?:benar|tepat|tugasmu|bukumu|jawaban)[!.]\s*/i, (m) => (m.length < 160 ? '' : m));
  t = t.replace(/^(?:[A-Z][\w&'.-]*\s){1,7}(?:Kelas|untuk SD|untuk SMP|SD\/MI|SMP\/MTs)\b[^.]*?\s(?=\d{1,2}\.\s)/, '');
  t = t.replace(/^.*\s(\d{1,2})\.\s+(?=[A-Z])/, (m) => (m.length < 120 ? '' : m)).replace(/^\d{1,2}\.\s*/, '');
  t = t.replace(/(\s*\.\.\.\.)+/g, ' ....').replace(/\s*\.\.\.\.\s*(\.\.\.\.)?\s*$/, ' ....').replace(/\s+/g, ' ').trim();
  return t;
}

const NAMA_DIRI = /^(Allah|Nabi|Rasul|Al-|Islam|Indonesia|Pancasila|Tuhan|Bung|Ir\.|Dr\.|Sultan|Kerajaan|Gunung|Sungai|Pulau|Selat|Laut|Samudra|Danau|Candi|Masjid|Kota|Provinsi|Jawa|Sumatra|Kalimantan|Sulawesi|Papua|Bali|Jakarta|Belanda|Jepang|Portugis|Inggris|Asia|Eropa|Afrika|Amerika|Australia|Microsoft|Windows|Word|Excel|Internet)/;
const hurufAwalOpsi = (x: string) => (x.charAt(0).toLowerCase() === x.charAt(0) || /^[A-Z]{2}/.test(x) || NAMA_DIRI.test(x) || /^[A-Z][a-z]+ [A-Z]/.test(x) ? x : x.charAt(0).toLowerCase() + x.slice(1));

/** Rapikan tampilan pokok soal (setelah sidik dihitung — sidik tidak berubah): „…. .“ → „….“. */
const rapiTampil = (t: string) => t.replace(/\s*⁄\.?/g, ' ....').replace(/\.\.\.\.(\s*\.\.\.\.)+/g, '....').replace(/\.\.\.\.\s*\.\s*$/, '....').replace(/\s{2,}/g, ' ').trim();

function rapikanOpsi(o: string) {
  return o.replace(/^[\s:–-]+/, '')
    .replace(/\s+(?:[A-Z][\w&'.-]*\s){1,6}(?:Kelas|untuk SD|untuk SMP|SD\/MI|SMP\/MTs)\b.*$/, '') // judul halaman berjalan
    .replace(/\s+[A-E]\.?$/, '') // huruf bagian soal berikutnya („ayam B“)
    .replace(/\s+\d{1,2}$/, '').trim();
}

function bukuSoal(bk: BukuBse, berkas: string): SoalBuku {
  const korpus: { s: string; w: Set<string>; bab: number }[] = [];
  const pgMentah: { t: string; o: string[]; bab: number }[] = [];
  const tanya: { t: string; bab: number }[] = [];
  bk.bab.forEach((bab, bi) => {
    const teks = bab.blok.filter((x) => x.t === 'p' || x.t === 'li' || x.t === 'h').map((x) => x.x).join('\n');
    // bagian soal: dari penanda PG sampai penanda bagian lain
    let i = 0;
    const materi: string[] = [];
    while (i < teks.length) {
      const sisa = teks.slice(i);
      const m = PENANDA_PG.exec(sisa);
      const mj = /Jawablah(?: pertanyaan| soal)?[^!.\n]{0,60}[!.]/.exec(sisa);
      const pertama = [m, mj].filter((x): x is RegExpExecArray => Boolean(x)).sort((x, y) => x.index - y.index)[0];
      if (!pertama) { materi.push(sisa); break; }
      materi.push(sisa.slice(0, pertama.index));
      const mulai = pertama.index + pertama[0].length;
      const lanjut = sisa.slice(mulai);
      const henti = new RegExp(`(?:^|\\s)(?:[A-E]\\.\\s*)?${PENANDA_LAIN.source}|${PENANDA_PG.source}`).exec(lanjut.slice(5));
      const ujung = henti ? henti.index + 5 : Math.min(lanjut.length, 6000);
      const bagian = lanjut.slice(0, ujung);
      if (pertama === m) for (const b of uraiPg(bagian)) pgMentah.push({ ...b, bab: bi });
      else for (const t of uraiTanya(bagian)) tanya.push({ t, bab: bi });
      i += mulai + ujung;
    }
    for (const k of materi.join('\n').replace(/\n/g, ' ').match(/[^.!?]+[.!?]/g) ?? []) {
      const s = bersih(k);
      if (s.length < 25 || s.length > 400 || s.includes('....') || /\s[.,]\s|\s[.]$|adalah\s*[.]$/.test(s) || /\s[a-d]\.\s.*\s[b-d]\.\s/.test(s) || ARAB.test(s)) continue;
      korpus.push({ s, w: new Set(kataIsi(s)), bab: bi });
    }
  });

  // kunci dari isi buku
  const pg: ButirBse[] = [];
  const calon: CalonBse[] = [];
  const tinjau = kunciTinjau();
  const hit = { mentah: pgMentah.length, saring: 0, kunci: 0, tanya: tanya.length };
  const dilihat = new Set<string>();
  for (const b of pgMentah) {
    const t = rapikanPokok(b.t);
    const o = b.o.map(rapikanOpsi);
    if (t.length < 15 || t.length > 220 || BURUK_POKOK.test(t) || ARAB.test(t + o.join(''))) continue;
    if (o.some((x) => !x || x.length > 70 || /^\d+(\s*(,|dan)\s*\d+)+$/.test(x) || /\.\.\.\./.test(x) || BURUK_POKOK.test(x) || /semua (jawaban )?benar|a dan b|b dan c|a, b/i.test(x))) continue;
    if (new Set(o.map((x) => x.toLowerCase())).size !== o.length) continue;
    const kunciTeks = t.toLowerCase();
    if (dilihat.has(kunciTeks)) continue;
    const ws = kataIsi(t);
    if (ws.length < 2) continue;
    hit.saring += 1;
    const skor = o.map((x) => {
      const wo = kataIsi(x);
      if (!wo.length) return { n: 0, s: '' };
      let terbaik = { n: 0, s: '' };
      for (const k of korpus) {
        const ada = wo.filter((w) => k.w.has(w)).length / wo.length;
        if (ada < (LONGGAR ? 0.66 : 1)) continue;
        const n = (ws.filter((w) => k.w.has(w) && !wo.includes(w)).length + (k.bab === b.bab ? 0.5 : 0)) * ada;
        if (n > terbaik.n) terbaik = { n, s: k.s };
      }
      return terbaik;
    });
    const urut = [...skor].map((x, i) => ({ ...x, i })).sort((x, y) => y.n - x.n);
    const juara = urut[0]!, kedua = urut[1]!;
    const perlu = Math.min(3, Math.max(2, Math.ceil(ws.length * 0.5)));
    const ketat = juara.n >= perlu && juara.n - kedua.n >= 1.5;
    const id = sidik(`${t}|${o.join('|')}`.toLowerCase());
    const manual = tinjau.get(id);
    if (manual === 'x') continue;
    if (manual) {
      dilihat.add(kunciTeks);
      const k = 'abcd'.indexOf(manual);
      if (k >= o.length) continue;
      pg.push({ id, t: rapiTampil(/\.\.\.\.|[?]$/.test(t) ? t : `${t.replace(/[.:]$/, '')} ....`), o: o.map(hurufAwalOpsi), k, bukti: skor[k]!.s, bab: b.bab, manual: true });
      continue;
    }
    // Kunci otomatis hanya SARAN untuk peninjau (uji: ±15% saran „pasti“ masih keliru) — yang tayang hanya kunci tinjauan.
    const yakin = ketat || (LONGGAR && juara.n >= 2 && juara.n - kedua.n >= 1);
    if (!SARAN_TAYANG || !yakin) { calon.push({ id, t, o, saran: yakin ? juara.i : -1, bukti: juara.s, bab: b.bab }); continue; }
    if (!ketat && process.env.SOAL_BSE_DEBUG === '2') console.error(`~ ${t}\n   ${o.map((x, i) => (i === juara.i ? '*' : '') + x).join(' | ')}\n   ⟶ ${juara.s.slice(0, 140)}`);
    dilihat.add(kunciTeks);
    const opsi = o;
    pg.push({ id, t: rapiTampil(/\.\.\.\.|[?]$/.test(t) ? t : `${t.replace(/[.:]$/, '')} ....`), o: opsi.map(hurufAwalOpsi), k: juara.i, bukti: juara.s, bab: b.bab });
  }

  // jawaban model uraian: kalimat materi paling cocok (kuat saja)
  const uraian: UraianBse[] = [];
  for (const q of tanya) {
    if (BURUK_POKOK.test(q.t) || /\b(kamu|mu|pendapatmu|menurutmu|pengalamanmu|lingkunganmu|rumahmu|keluargamu|sekolahmu|temanmu)\b/i.test(q.t)) continue;
    const ws = kataIsi(q.t);
    if (ws.length < 2) continue;
    const calon = korpus.map((k) => ({ k, n: ws.filter((w) => k.w.has(w)).length + (k.bab === q.bab ? 0.5 : 0) })).sort((x, y) => y.n - x.n);
    const c = calon[0];
    if (!c || (c.n < Math.max(2, ws.length * 0.75) && !jawabTinjau().has(sidik(`u|${q.t}`.toLowerCase()))) || (calon[1] && calon[1].n === c.n && calon[1].k.s !== c.k.s && /^(apa|jelaskan|sebutkan)/i.test(q.t) === false)) continue;
    let j = c.k.s;
    const lanjut = korpus[korpus.indexOf(c.k) + 1];
    if (/yaitu:?$|antara lain:?$|sebagai berikut/.test(j) && lanjut) j += ` ${lanjut.s}`;
    const id = sidik(`u|${q.t}`.toLowerCase());
    const tj = jawabTinjau().get(id);
    if (tj === 'x') continue;
    uraian.push({ id, t: q.t, j: tj && tj !== 'ok' ? tj : j, bab: q.bab, ...(tj ? { ok: true } : {}) });
  }

  // istilah definisi „X adalah …“ (untuk menjodohkan)
  const istilah: SoalBuku['istilah'] = [];
  for (const k of korpus) {
    const m = /^([A-Z][a-z]+(?: [a-z]+){0,2}) (?:adalah|ialah|merupakan) ((?:[a-z]+,? ){2,13}[a-z]+)\.$/.exec(k.s);
    if (m && !HENTI.has(m[1]!.toLowerCase()) && !m[2]!.toLowerCase().includes(m[1]!.toLowerCase().split(' ')[0]!) && !/^(salah satu|contoh|cara|bagian|hal)\b/.test(m[2]!)) istilah.push({ kata: m[1]!, arti: m[2]!.trim(), bab: k.bab });
  }
  if (process.env.SOAL_BSE_DEBUG) console.error(bk.meta.mapel, bk.meta.kelas, JSON.stringify(hit), 'kunci', pg.length);
  return { berkas, calon, judul: bk.meta.judul, jumlahBab: bk.bab.length, pg, uraian, istilah };
}

let cache: Map<string, SoalBuku[]> | null = null;
/** Soal BSE per „Mapel BSE|Kelas n“. */
export function soalBse(mapelBse: string, kelas: number): SoalBuku[] {
  if (!cache) {
    cache = new Map();
    const dir = path.join(AKAR, 'pustaka', 'bse');
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter((x) => /^s-.*\.json$/.test(x)).sort()) {
      const bk = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as BukuBse;
      const k = `${bk.meta.mapel}|${bk.meta.kelas}`;
      cache.set(k, [...(cache.get(k) ?? []), bukuSoal(bk, f)]);
    }
  }
  return cache.get(`${mapelBse}|Kelas ${kelas}`) ?? [];
}

/* Tinjau: npx tsx scripts/soal-bse.ts "IPA" 4 — cetak butir yang kuncinya belum pasti (dengan saran), untuk ditulis ke soal/kunci-bse.list. */
if (process.argv[1] && /soal-bse\.ts$/.test(process.argv[1]) && process.argv[2]) {
  for (const b of soalBse(process.argv[2], Number(process.argv[3]))) {
    console.log(`# ${b.judul} — ${b.pg.length} berkunci, ${b.calon.length} calon`);
    for (const c of b.calon) console.log(`${c.id} [${c.bab}] ${c.t} ‖ ${c.o.map((o, i) => `${'abcd'[i]}) ${o}`).join(' ')}${c.saran >= 0 ? ` ‖ ~${'abcd'[c.saran]}` : ''}`);
    for (const u of b.uraian) console.log(`${u.id} [${u.bab}] U ${u.t} ‖ ${u.ok ? '✓ ' : ''}${u.j.slice(0, 220)}`);
    if (process.argv[4] === 'semua') for (const p of b.pg) console.log(`${p.id} [${p.bab}] ${p.t} ‖ ${p.o.map((o, i) => `${i === p.k ? '*' : ''}${'abcd'[i]}) ${o}`).join(' ')} ‖ =${'abcd'[p.k]}`);
  }
}

/** Uraian tulisan peninjau (bila uraian buku kurang): „u <mapel> <kelas> <ganjil|genap> <pts|pas> <pertanyaan> = <jawaban model>“. */
export function uraianTulis(mapel: string, kelas: number, smt: 'ganjil' | 'genap'): { t: string; j: string; pts: boolean }[] {
  const f = path.join(AKAR, 'soal', 'kunci-bse.list');
  if (!fs.existsSync(f)) return [];
  const out: { t: string; j: string; pts: boolean }[] = [];
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = /^u\s+([a-z-]+)\s+(\d)\s+(ganjil|genap)\s+(pts|pas)\s+(.+?)\s+=\s+(.+)$/.exec(l.trim());
    if (m && m[1] === mapel && Number(m[2]) === kelas && m[3] === smt) out.push({ t: m[5]!, j: m[6]!, pts: m[4] === 'pts' });
  }
  return out;
}
