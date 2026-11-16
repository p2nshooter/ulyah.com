/**
 * Buku pelajaran formal MI (kelas 1–6) & MTs (kelas 7–9) untuk Pustaka Yapida — pemilik: „Pelajaran formalnya kok g ada
 * ra, mi, mts … sangat penting“, „Perpustakaan digital pelajaran formal untuk madrasah juga g ada … full seluruh pelajaran“.
 *
 * Sumber: Buku Sekolah Elektronik 2008–2011 (indeks CC BY github.com/Hans5958/Indeks-BSE → jenius/data/bse.json). Hanya
 * buku yang halaman hak ciptanya mengizinkan „dialihmediakan“ yang diubah (scripts/bse-ubah.ts) — PDF tidak disimpan,
 * teksnya disusun ulang menjadi buku interaktif (dibacakan, kartu istilah, uji pemahaman).
 * Untuk setiap kelas & mata pelajaran dipilih buku terbaru yang lolos, sampai `--per` buku. Hasil: pustaka/bse/<id>.json
 * (dibaca scripts/buat-pustaka.ts). Idempoten: buku yang sudah ada dilewati; buku yang gagal dicatat agar tidak dicoba ulang.
 *
 * Pakai: npx tsx scripts/bse-ambil.ts [--per 1] [--kelas 1,2,3] [--batas 80] [--ulang 377,1005] [--pdf <folder cache PDF>]
 *   --ulang: id BSE yang diubah ulang walau sudah ada (aturan pengubah berubah); --pdf: PDF disimpan/dipakai dari folder itu.
 * Berjalan di mesin pengembang atau runner GitHub Actions (butuh pdftotext). Tidak memakai kuota Claude.
 */
import { execFileSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { idBse, mapelDari, ubahBuku, type ItemBse } from './bse-ubah.ts';

const DIR = dirname(fileURLToPath(import.meta.url));
const INDEKS = join(DIR, '..', '..', 'jenius', 'data', 'bse.json');
const KELUAR = join(DIR, '..', 'pustaka', 'bse');
const GAGAL = join(KELUAR, '_gagal.json');
const arg = (k: string, d: string) => { const i = process.argv.indexOf(`--${k}`); return i >= 0 ? process.argv[i + 1] ?? d : d; };
const PER = Number(arg('per', '1'));
const BATAS = Number(arg('batas', '200'));
const KELAS = new Set(arg('kelas', '1,2,3,4,5,6,7,8,9').split(',').map(Number));
const ULANG = new Set(arg('ulang', '').split(',').filter(Boolean).map(Number));
const CACHE = arg('pdf', '');
const bisaDibuka = (f: string) => { try { closeSync(openSync(f, 'r')); return true; } catch { return false; } };
/** Mata pelajaran inti madrasah yang diisi dari BSE (PAI/Bahasa Arab khas madrasah tidak ada di BSE umum). */
const INTI = ['Pendidikan Agama Islam', 'Bahasa Arab', 'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'PPKn', 'Bahasa Inggris', 'PJOK', 'Seni Budaya & Prakarya', 'TIK', 'Tematik'];

interface Baris { id: number; title: string; grade: number; level: string; subject: string; year: number; file: string; page: string }

async function unduh(url: string, ke: string): Promise<void> {
  for (let coba = 0; coba < 3; coba += 1) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (pustaka yapida; buku sekolah elektronik)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      writeFileSync(ke, new Uint8Array(await r.arrayBuffer()));
      return;
    } catch (err) {
      if (coba === 2) throw err;
      await new Promise((s) => setTimeout(s, 2000 * (coba + 1)));
    }
  }
}

async function utama(): Promise<void> {
  mkdirSync(KELUAR, { recursive: true });
  const semua = (JSON.parse(readFileSync(INDEKS, 'utf8')) as { books: Baris[] }).books
    .filter((b) => (b.level === 'sd' || b.level === 'smp') && KELAS.has(b.grade) && /^https:\/\/assets\.annibuku\.com\//.test(b.file));
  let gagal: Record<string, string> = {};
  try { gagal = JSON.parse(readFileSync(GAGAL, 'utf8')); } catch (err) { if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err; }
  /** Buku yang sudah diubah (dibaca sekali dari folder, bukan dicek satu per satu). */
  const sudah = new Set(readdirSync(KELUAR).filter((n) => n.endsWith('.json')).map((n) => n.slice(0, -5)));
  for (const b of semua) if (ULANG.has(b.id)) { sudah.delete(idBse({ id: b.id, title: b.title })); delete gagal[String(b.id)]; }
  const grup = new Map<string, Baris[]>();
  for (const b of semua) {
    const m = mapelDari(b.title, b.grade);
    if (!INTI.includes(m)) continue;
    const k = `${b.grade}|${m}`;
    grup.set(k, [...(grup.get(k) ?? []), b]);
  }
  let dikerjakan = 0, berhasil = 0;
  const tmp = join(tmpdir(), 'bse-yapida');
  mkdirSync(tmp, { recursive: true });
  for (const [k, calon] of [...grup].sort((a, b) => a[0].localeCompare(b[0], 'id', { numeric: true }))) {
    calon.sort((a, b) => b.year - a.year || a.id - b.id);
    let ada = calon.filter((b) => sudah.has(idBse({ id: b.id, title: b.title }))).length;
    for (const b of calon) {
      if (ada >= PER || dikerjakan >= BATAS) break;
      const id = idBse({ id: b.id, title: b.title });
      if (sudah.has(id) || gagal[String(b.id)]) continue;
      if (ULANG.size && !ULANG.has(b.id)) continue; // mode ulang: hanya buku yang disebut
      dikerjakan += 1;
      const pdf = join(CACHE || tmp, `${b.id}.pdf`);
      try {
        if (!CACHE || !bisaDibuka(pdf)) await unduh(b.file, pdf);
        const teks = execFileSync('pdftotext', ['-enc', 'UTF-8', pdf, '-'], { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
        const it: ItemBse = { id: b.id, title: b.title, class: String(b.grade), year: String(b.year || ''), catalogHref: b.page, fileHref: b.file };
        // Bab tertulis tidak terbaca (mis. buku Matematika penuh rumus) → dipotong per 12 halaman; dipilih yang isinya terbanyak.
        let h = ubahBuku(it, teks);
        if (!h.ok ? h.alasan === 'bab tidak ditemukan' : h.bab.length < 3) { const h2 = ubahBuku(it, teks, { paksa: true }); if (h2.ok && (!h.ok || h2.meta.kata > h.meta.kata * 1.3)) h = h2; }
        // Mutu: buku hasil pindaian (gambar) hampir tanpa teks — dilewati, dicoba buku lain untuk kelas & mapel ini.
        if (h.ok && (h.meta.kata < 4000 || h.bab.length < 3)) h = { ok: false, alasan: `isi terlalu sedikit (${h.meta.kata} kata, ${h.bab.length} bab — kemungkinan pindaian)` };
        if (h.ok) {
          writeFileSync(join(KELUAR, `${id}.json`), JSON.stringify({ meta: h.meta, bab: h.bab }), { flag: ULANG.has(b.id) ? 'w' : 'wx' });
          sudah.add(id); ada += 1; berhasil += 1;
          console.log(`✓ ${k} — ${b.title} (${h.bab.length} bab, ${h.meta.kata} kata)`);
        } else {
          gagal[String(b.id)] = h.alasan;
          console.log(`· ${k} — ${b.title}: ${h.alasan}`);
        }
      } catch (err) {
        // Gangguan jaringan tidak dicatat sebagai gagal (akan dicoba lagi pada jalan berikutnya).
        const pesan = err instanceof Error ? err.message.slice(0, 80) : 'tak dikenal';
        if (!/fetch failed|ECONN|ETIMEDOUT|HTTP 5\d\d/.test(pesan)) gagal[String(b.id)] = `galat: ${pesan}`;
        console.log(`✗ ${k} — ${b.title}: galat: ${pesan}`);
      } finally {
        if (!CACHE) rmSync(pdf, { force: true });
        writeFileSync(GAGAL, `${JSON.stringify(gagal, null, 1)}\n`);
      }
    }
  }
  console.log(`selesai: ${berhasil} buku baru dari ${dikerjakan} percobaan → ${KELUAR}`);
}

await utama();
