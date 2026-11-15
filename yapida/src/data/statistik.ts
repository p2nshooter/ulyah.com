/**
 * Peringkat 10 buku paling sering dibaca dan paling difavoritkan (perintah pemilik 5) — tanpa kunci panas (R2 menerima
 * satu tulisan per detik per kunci) dan tanpa cron (kuota cron akun sudah habis):
 *
 *   l/baca/<YYYYMMDDHH>/<buku>~<acak>.json        satu objek per pembacaan (hanya-tambah)
 *   l/suka/<YYYYMMDDHH>/<buku>~<p|m>~<acak>.json  satu objek per suka (p) / batal suka (m)
 *   u/suka/<buku>/<pengunjung>                     penjaga create-once: satu suka per pengunjung per buku
 *   k/peringkat.json                               rekap jam-jam yang sudah selesai (ditulis compare-and-swap)
 *
 * Rekap berjalan sendiri ketika halaman perpustakaan dibuka dan rekapnya sudah lebih dari 5 menit: jam-jam yang sudah
 * lewat dijumlahkan ke rekap, jam yang sedang berjalan dihitung langsung dari lognya (tersimpan 60 detik di memori).
 */
import type { Store } from '../lib/store.ts';

export interface Rekap { v: 1; at: number; jam: string; baca: Record<string, number>; suka: Record<string, number> }
export interface Peringkat { baca: Record<string, number>; suka: Record<string, number> }

const KUNCI = 'k/peringkat.json';
const JEDA_REKAP = 5 * 60_000;
const MAKS_JAM_SEKALI = 48;
const ID_RE = /^[a-z]-[A-Za-z0-9_-]{1,80}$/;

export const jamDari = (ms: number) => new Date(ms).toISOString().slice(0, 13).replace(/[-T]/g, '');
const jamBerikut = (jam: string) => jamDari(Date.UTC(+jam.slice(0, 4), +jam.slice(4, 6) - 1, +jam.slice(6, 8), +jam.slice(8, 10) + 1));
const acak = () => crypto.randomUUID().replace(/-/g, '').slice(0, 10);

export async function catatBaca(store: Store, id: string, now = Date.now()): Promise<void> {
  if (!ID_RE.test(id)) return;
  await store.put(`l/baca/${jamDari(now)}/${id}~${acak()}.json`, {});
}

export async function sudahSuka(store: Store, id: string, pengunjung: string): Promise<boolean> {
  if (!ID_RE.test(id) || !pengunjung) return false;
  return (await store.b.head(`u/suka/${id}/${pengunjung}`)) !== null;
}

/** Menyetel suka; mengembalikan keadaan akhirnya. Suka ganda dari pengunjung yang sama tidak dihitung dua kali. */
export async function setelSuka(store: Store, id: string, pengunjung: string, suka: boolean, now = Date.now()): Promise<boolean> {
  if (!ID_RE.test(id) || !pengunjung) return false;
  const jaga = `u/suka/${id}/${pengunjung}`;
  if (suka) {
    if (await store.createOnce(jaga, { at: now })) await store.put(`l/suka/${jamDari(now)}/${id}~p~${acak()}.json`, {});
    return true;
  }
  if (await store.b.head(jaga)) {
    await store.del(jaga);
    await store.put(`l/suka/${jamDari(now)}/${id}~m~${acak()}.json`, {});
  }
  return false;
}

async function hitungJam(store: Store, jam: string, out: Peringkat): Promise<void> {
  for (const [jenis, peta] of [['baca', out.baca], ['suka', out.suka]] as const) {
    let cursor: string | undefined;
    let hal = 0;
    do {
      const r = await store.b.list({ prefix: `l/${jenis}/${jam}/`, cursor, limit: 1000 });
      for (const o of r.objects) {
        const ekor = o.key.slice(`l/${jenis}/${jam}/`.length).replace(/\.json$/, '');
        const bagian = ekor.split('~');
        const id = bagian[0]!;
        if (!ID_RE.test(id)) continue;
        const d = jenis === 'suka' && bagian[1] === 'm' ? -1 : 1;
        peta[id] = (peta[id] ?? 0) + d;
      }
      cursor = r.truncated ? r.cursor : undefined;
      hal += 1;
    } while (cursor && hal < 20);
  }
}

let memo: { at: number; jam: string; data: Peringkat } | null = null;

/** Jumlah baca dan suka per buku: rekap tersimpan + jam berjalan. `tunda` (waitUntil) menjalankan rekap di latar. */
export async function peringkat(store: Store, now = Date.now(), tunda?: (p: Promise<unknown>) => void): Promise<Peringkat> {
  const kini = jamDari(now);
  if (memo && memo.jam === kini && now - memo.at < 60_000) return memo.data;
  const rekap = await store.get<Rekap>(KUNCI);
  const data: Peringkat = { baca: { ...(rekap?.baca ?? {}) }, suka: { ...(rekap?.suka ?? {}) } };
  // Jam yang sudah lewat tetapi belum masuk rekap ikut dihitung langsung (paling banyak 3 jam), sisanya oleh rekap.
  const mulai = rekap ? jamBerikut(rekap.jam) : kini;
  let j = mulai;
  for (let i = 0; i < 3 && j < kini; i += 1, j = jamBerikut(j)) await hitungJam(store, j, data);
  await hitungJam(store, kini, data);
  for (const peta of [data.baca, data.suka]) for (const k of Object.keys(peta)) if ((peta[k] ?? 0) <= 0) delete peta[k];
  memo = { at: now, jam: kini, data };
  if (!rekap || now - rekap.at > JEDA_REKAP) {
    const kerja = rekapkan(store, now).catch(() => undefined);
    if (tunda) tunda(kerja); else await kerja;
  }
  return data;
}

/** Menjumlahkan jam-jam yang sudah selesai ke rekap. Aman dijalankan bersamaan: hanya satu yang berhasil menulis. */
export async function rekapkan(store: Store, now = Date.now()): Promise<Rekap | null> {
  const kini = jamDari(now);
  const lama = await store.get<Rekap>(KUNCI);
  const tambahan: Peringkat = { baca: {}, suka: {} };
  let jam = lama?.jam;
  if (!jam) {
    // Rekap pertama: mulai tepat sebelum jam log paling awal ('l/baca/' dan 'l/suka/' sama-sama 7 huruf).
    const awal = (await Promise.all(['l/baca/', 'l/suka/'].map((p) => store.b.list({ prefix: p, limit: 1 }))))
      .map((r) => r.objects[0]?.key.slice(7, 17)).filter((x): x is string => Boolean(x && /^\d{10}$/.test(x))).sort()[0];
    jam = awal ? jamDari(Date.UTC(+awal.slice(0, 4), +awal.slice(4, 6) - 1, +awal.slice(6, 8), +awal.slice(8, 10) - 1)) : jamDari(now - 3600_000);
  }
  let akhir = jam;
  for (let i = 0, j = jamBerikut(jam); i < MAKS_JAM_SEKALI && j < kini; i += 1, j = jamBerikut(j)) {
    await hitungJam(store, j, tambahan);
    akhir = j;
  }
  return store.cas<Rekap>(KUNCI, (cur) => {
    if ((cur?.jam ?? null) !== (lama?.jam ?? null)) return null; // ada rekap lain yang lebih dulu
    const next: Rekap = { v: 1, at: now, jam: akhir, baca: { ...(cur?.baca ?? {}) }, suka: { ...(cur?.suka ?? {}) } };
    for (const [id, n] of Object.entries(tambahan.baca)) next.baca[id] = (next.baca[id] ?? 0) + n;
    for (const [id, n] of Object.entries(tambahan.suka)) next.suka[id] = Math.max(0, (next.suka[id] ?? 0) + n);
    return next;
  }, 'Peringkat');
}

/** Sepuluh teratas dari sebuah peta jumlah, hanya buku yang masih ada. */
export function sepuluh(peta: Record<string, number>, ada: (id: string) => boolean, n = 10): { id: string; n: number }[] {
  return Object.entries(peta).filter(([id, v]) => v > 0 && ada(id)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map(([id, v]) => ({ id, n: v }));
}

/** Hanya untuk uji: lupakan simpanan memori. */
export const lupakanPeringkat = () => { memo = null; };
