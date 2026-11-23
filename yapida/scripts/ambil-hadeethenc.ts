/**
 * Ensiklopedia Hadits Terjemah (HadeethEnc.com — Markaz Ruwwad At-Tarjamah, lembaga yang sama dengan QuranEnc) →
 * yapida/pustaka/hadeethenc/<akar>.json. Pemilik (18 Nov 2026): „tambahin dari ulyah.com kitab2 haditsnya dan
 * terjemahin serta penjelasanya make bahasa indonesia“ · (23 Nov 2026) „di yapida kitab2 hadits belum masuk“.
 *
 * Kitab hadits lengkap (Bukhari, Muslim, …) sudah datang dari seed ulyah.com dengan terjemah Indonesia; yang belum ada
 * adalah PENJELASAN. Penjelasan hadits tidak pernah dikarang mesin: ia diambil utuh dari HadeethEnc bahasa Indonesia —
 * matan Arab, terjemah, takhrij, derajat, syarah (penjelasan), faedah (pelajaran), dan arti kosakata — tanpa diubah,
 * dengan kredit dan tautan ke sumbernya (syarat penerbitan ulang HadeethEnc).
 *
 * Jalan di GitHub Actions (.github/workflows/yapida-hadits-syarah.yml) — dari sandbox hostnya tertutup.
 * Tahan gangguan: hasil disimpan setiap 50 hadits; jalan berikutnya hanya mengambil yang belum ada (`--segar` mengambil
 * ulang semuanya agar mengikuti versi terbaru). Satu hadits yang gagal diperiksa tidak menghentikan yang lain.
 *
 *   npx tsx scripts/ambil-hadeethenc.ts [--menit=120] [--segar] [--bahasa=id]
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const KELUAR = join(DIR, '..', 'pustaka', 'hadeethenc');
const API = 'https://hadeethenc.com/api/v1';
const arg = (k: string, d: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d;
const BAHASA = arg('bahasa', 'id');
const BATAS = Date.now() + Number(arg('menit', '120')) * 60_000;
const SEGAR = process.argv.includes('--segar');

export interface HaditsHE {
  id: string;
  judul: string;
  ar: string;
  terjemah: string;
  takhrij?: string;
  derajat?: string;
  penjelasan: string;
  faedah: string[];
  kosakata: { kata: string; arti: string }[];
  kategori: string[];
}
export interface KategoriHE { id: string; judul: string; induk: string | null; jumlah: number }
export interface BerkasAkar { akar: KategoriHE; anak: KategoriHE[]; hadits: HaditsHE[]; diambil: string; sumber: string }

const ARAB = /[؀-ۿ]/;
const teks = (v: unknown): string => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim() : '');
const daftar = (v: unknown): string[] => (Array.isArray(v) ? v.map(teks).filter(Boolean) : []);

async function ambil<T>(jalur: string, coba = 5): Promise<T> {
  let galat: unknown;
  for (let i = 0; i < coba; i++) {
    try {
      const r = await fetch(`${API}${jalur}`, { headers: { accept: 'application/json', 'user-agent': 'yapida-pustaka (+https://yapida.sch.id)' } });
      if (r.status === 404) throw Object.assign(new Error(`404 ${jalur}`), { tetap: true });
      if (!r.ok) throw new Error(`${r.status} ${jalur}`);
      return (await r.json()) as T;
    } catch (e) {
      galat = e;
      if ((e as { tetap?: boolean }).tetap) break;
      await new Promise((ok) => setTimeout(ok, 1500 * (i + 1) ** 2));
    }
  }
  throw galat;
}

/** Satu hadits dari jawaban /hadeeths/one — ditolak bila matan Arab, terjemah, atau penjelasannya kosong. */
export function uraiHadits(j: Record<string, unknown>): HaditsHE | string {
  const h: HaditsHE = {
    id: String(j.id ?? ''),
    judul: teks(j.title),
    ar: teks(j.hadeeth_ar),
    terjemah: teks(j.hadeeth),
    takhrij: teks(j.attribution) || undefined,
    derajat: teks(j.grade) || undefined,
    penjelasan: teks(j.explanation),
    faedah: daftar(j.hints),
    kosakata: (Array.isArray(j.words_meanings) ? j.words_meanings : [])
      .map((w: { word?: unknown; meaning?: unknown }) => ({ kata: teks(w?.word), arti: teks(w?.meaning) }))
      .filter((w) => w.kata && w.arti),
    kategori: (Array.isArray(j.categories) ? j.categories : []).map(String),
  };
  if (!/^\d+$/.test(h.id)) return 'id tidak sah';
  if (!h.ar || !ARAB.test(h.ar)) return 'matan Arab kosong';
  if (!/[A-Za-z]{3}/.test(h.terjemah)) return 'terjemah Indonesia kosong';
  if (!/[A-Za-z]{3}/.test(h.penjelasan)) return 'penjelasan kosong';
  return h;
}

const berkasAkar = (id: string) => join(KELUAR, `${id}.json`);
function bacaAkar(id: string): BerkasAkar | null {
  try { return JSON.parse(readFileSync(berkasAkar(id), 'utf8')) as BerkasAkar; } catch { return null; }
}
function tulisAkar(b: BerkasAkar): void {
  b.hadits.sort((x, y) => Number(x.id) - Number(y.id));
  writeFileSync(berkasAkar(b.akar.id), JSON.stringify(b, null, 0) + '\n');
}

async function utama(): Promise<void> {
  mkdirSync(KELUAR, { recursive: true });
  const kat = (await ambil<Record<string, unknown>[]>(`/categories/list/?language=${BAHASA}`))
    .map((k): KategoriHE => ({ id: String(k.id), judul: teks(k.title), induk: k.parent_id == null || k.parent_id === '' ? null : String(k.parent_id), jumlah: Number(k.hadeeths_count ?? 0) }))
    .filter((k) => /^\d+$/.test(k.id) && k.judul);
  if (!kat.length) throw new Error('Daftar kategori kosong — bentuk API berubah?');
  const byId = new Map(kat.map((k) => [k.id, k]));
  const akarDari = (id: string): string => { let k = byId.get(id); for (let i = 0; k?.induk && i < 10; i++) k = byId.get(k.induk) ?? k; return k?.id ?? id; };
  const akar = kat.filter((k) => !k.induk);
  console.log(`kategori: ${kat.length} (akar ${akar.length})`);

  const sudah = new Set<string>();
  const berkas = new Map<string, BerkasAkar>();
  for (const a of akar) {
    const lama = SEGAR ? null : bacaAkar(a.id);
    const b: BerkasAkar = lama ?? { akar: a, anak: [], hadits: [], diambil: '', sumber: 'https://hadeethenc.com' };
    b.akar = a; b.anak = kat.filter((k) => k.induk && akarDari(k.id) === a.id);
    for (const h of b.hadits) sudah.add(h.id);
    berkas.set(a.id, b);
  }

  // Semua id hadits: daftar per kategori akar (hadits di subkategori ikut terdaftar di akarnya).
  const antre: { id: string; akar: string }[] = [];
  const terlihat = new Set<string>();
  for (const a of akar) {
    for (let hal = 1, akhir = 1; hal <= akhir; hal++) {
      const r = await ambil<{ data?: { id: unknown }[]; meta?: { last_page?: unknown } }>(`/hadeeths/list/?language=${BAHASA}&category_id=${a.id}&page=${hal}&per_page=100`);
      akhir = Number(r.meta?.last_page ?? 1) || 1;
      for (const x of r.data ?? []) {
        const id = String(x.id);
        if (!/^\d+$/.test(id) || terlihat.has(id)) continue;
        terlihat.add(id);
        if (!sudah.has(id)) antre.push({ id, akar: a.id });
      }
    }
  }
  console.log(`hadits terdaftar: ${terlihat.size} · sudah tersimpan: ${sudah.size} · diambil sekarang: ${antre.length}`);

  const tolak: Record<string, number> = {};
  let baru = 0, berhenti = false;
  const simpanSemua = () => { const kini = new Date().toISOString(); for (const b of berkas.values()) { b.diambil = kini; if (b.hadits.length) tulisAkar(b); } };
  for (const [i, t] of antre.entries()) {
    if (Date.now() > BATAS) { berhenti = true; break; }
    try {
      const j = await ambil<Record<string, unknown>>(`/hadeeths/one/?language=${BAHASA}&id=${t.id}`);
      const h = uraiHadits(j);
      if (typeof h === 'string') { tolak[h] = (tolak[h] ?? 0) + 1; continue; }
      const tujuan = berkas.get(akarDari(h.kategori[0] ?? t.akar)) ?? berkas.get(t.akar)!;
      tujuan.hadits.push(h); baru += 1;
    } catch (e) {
      tolak['gagal diambil'] = (tolak['gagal diambil'] ?? 0) + 1;
      console.warn(`hadits ${t.id}: ${(e as Error).message}`);
    }
    if ((i + 1) % 50 === 0) { simpanSemua(); console.log(`… ${i + 1}/${antre.length}`); }
    await new Promise((ok) => setTimeout(ok, 120));
  }
  simpanSemua();
  // Berkas akar yang tidak lagi ada di daftar kategori dibiarkan (tidak pernah menghapus isi yang sudah diperiksa).
  const total = readdirSync(KELUAR).filter((f) => f.endsWith('.json')).reduce((n, f) => n + ((bacaAkar(f.replace('.json', ''))?.hadits.length) ?? 0), 0);
  console.log(`baru: ${baru} · ditolak: ${JSON.stringify(tolak)} · total tersimpan: ${total}${berhenti ? ' · waktu habis, dilanjutkan jalan berikutnya' : ''}`);
  if (!total) process.exitCode = 1;
}

if (process.argv[1] && existsSync(process.argv[1]) && fileURLToPath(import.meta.url) === process.argv[1]) {
  utama().catch((e) => { console.error(e); process.exit(1); });
}
