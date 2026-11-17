/**
 * Bank Soal bawaan (perintah pemilik 37): berkas teks soal/<jenjang>/<…>.txt → aset Worker.
 *   public/assets/soal/indeks.json     daftar paket (tanpa kunci) — dibaca halaman publik & portal
 *   public/assets/soal/p/<id>.json     paket lengkap (kunci & pembahasan) — DIJAGA Worker (assets.run_worker_first),
 *                                      tidak pernah bisa diunduh langsung; dibaca server lewat binding ASSETS saja.
 * Paket yang galat format → pembangunan gagal (tidak ada paket rusak yang terpasang). Teks Arab ayat di soal Al-Qur'an
 * Hadis diperiksa dengan teks mushaf di public/assets/quran/s/<surah>.json (penanda „{{QS surah:ayat}}“).
 * Jalankan: npx tsx scripts/buat-soal.ts (ikut `npm run pustaka`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { FORMAT, idBawaan, ringkasPaket, uraiSoal, type IndeksPaket, type Paket } from '../src/data/soal.ts';

const AKAR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SUMBER = path.join(AKAR, 'soal');
const KELUAR = path.join(AKAR, 'public', 'assets', 'soal');
const QURAN = path.join(AKAR, 'public', 'assets', 'quran', 's');

function semuaBerkas(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? semuaBerkas(path.join(dir, e.name)) : e.name.endsWith('.txt') ? [path.join(dir, e.name)] : [])).sort();
}

/** {{QS 105:1}} → teks Arab ayat dari mushaf di repo (tidak pernah diketik ulang dengan tangan). */
const ayatCache = new Map<number, { a: number; ar: string }[]>();
function sisipAyat(teks: string, berkas: string): string {
  return teks.replace(/\{\{QS (\d{1,3}):(\d{1,3})\}\}/g, (_m, s, a) => {
    const surah = Number(s);
    if (!ayatCache.has(surah)) {
      const f = path.join(QURAN, `${surah}.json`);
      if (!fs.existsSync(f)) throw new Error(`${berkas}: data surah ${surah} tidak ada`);
      ayatCache.set(surah, (JSON.parse(fs.readFileSync(f, 'utf8')) as { ayat: { a: number; ar: string }[] }).ayat);
    }
    const ayat = ayatCache.get(surah)!.find((x) => x.a === Number(a));
    if (!ayat) throw new Error(`${berkas}: QS ${surah}:${a} tidak ada`);
    return ayat.ar.trim();
  });
}

const berkas = semuaBerkas(SUMBER);
fs.rmSync(KELUAR, { recursive: true, force: true });
fs.mkdirSync(path.join(KELUAR, 'p'), { recursive: true });
const indeks: IndeksPaket[] = [];
const id = new Set<string>();
let galat = 0, butir = 0;
for (const f of berkas) {
  const rel = path.relative(AKAR, f);
  let teks = fs.readFileSync(f, 'utf8');
  try { teks = sisipAyat(teks, rel); } catch (e) { console.error(String(e)); galat += 1; continue; }
  const h = uraiSoal(teks);
  if (!h.paket) { console.error(`✗ ${rel}\n  ${h.galat.join('\n  ')}`); galat += 1; continue; }
  const p: Paket = { ...h.paket, id: idBawaan(h.paket), status: 'tayang' };
  if (id.has(p.id)) { console.error(`✗ ${rel}: paket ganda ${p.id}`); galat += 1; continue; }
  id.add(p.id);
  if (h.peringatan.length && p.jenjang !== 'ra') { console.error(`✗ ${rel}: format baku ${FORMAT.pg}/${FORMAT.jodoh}/${FORMAT.isian}/${FORMAT.uraian} — ${h.peringatan.join(' ')}`); galat += 1; continue; }
  fs.writeFileSync(path.join(KELUAR, 'p', `${p.id}.json`), JSON.stringify(p));
  const r = ringkasPaket(p);
  delete r.st;
  indeks.push(r);
  butir += r.jumlah;
}
if (galat) { console.error(`buat-soal: ${galat} paket galat`); process.exit(1); }
const urut = { ra: 0, mi: 1, mts: 2 } as const;
indeks.sort((a, b) => urut[a.jenjang] - urut[b.jenjang] || a.kelas - b.kelas || a.mapel.localeCompare(b.mapel, 'id') || a.semester.localeCompare(b.semester) || a.jenis.localeCompare(b.jenis));
fs.writeFileSync(path.join(KELUAR, 'indeks.json'), JSON.stringify({ dibuat: new Date().toISOString().slice(0, 10), paket: indeks }));
console.log(`bank soal: ${indeks.length} paket, ${butir} butir`);
