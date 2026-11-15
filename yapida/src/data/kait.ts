/**
 * Kait simpan/hapus koleksi yang saling bertaut (perintah pemilik 22):
 *   siswa        — NISN/NIS dinormalkan dan dijaga unik (create-once) sebelum disimpan.
 *   penghargaan, kwitansi, tagihan — berisi NISN/NIS siswa → indeks `i/nomor/<nomor>/<kol>~<id>` supaya portal siswa
 *                  langsung menemukan penghargaan, kwitansi, dan tagihannya tanpa membaca seluruh koleksi.
 *   kwitansi → tagihan — setiap pembayaran tercatat di `i/bayar/<tagihan>/<kwitansi>`; „sudah dibayar“ dan status
 *                  tagihan (Lunas/Sebagian/Belum) dihitung ulang dari situ.
 * Semua jalur penyimpanan (portal, sertifikat massal, impor, tagihan massal) memakai `simpanTerkait`.
 */
import type { Store } from '../lib/store.ts';
import { newId, sha256Hex } from '../lib/crypto.ts';
import { ambil, hapus, simpan, type Dok, type Koleksi, type Masukan } from './koleksi.ts';
import { digit, lepasPenjaga, normalNisn, pasangPenjaga, periksaPenjaga } from './siswa.ts';

export const KOL_BERNOMOR = ['penghargaan', 'kwitansi', 'tagihan'];
const kunciNomor = (nomor: string, kol: string, id: string) => `i/nomor/${nomor}/${kol}~${id}`;
const kunciBayar = (tagihan: string, kwitansi: string) => `i/bayar/${tagihan}/${kwitansi}`;
const teks = (v: unknown) => (typeof v === 'string' ? v : '');

/** Penjaga satu tagihan per siswa per jenis & periode — tagihan massal aman dijalankan ulang tanpa menggandakan. */
export const kunciTagihan = async (nomor: string, untuk: string, periode: string) => `u/tagihan/${nomor}/${(await sha256Hex(`${untuk}|${periode.trim().toLowerCase()}`)).slice(0, 20)}`;

/** Status tagihan dari jumlah & yang sudah dibayar. */
export function statusTagihan(d: Record<string, unknown>, hari: string): { kode: 'lunas' | 'sebagian' | 'belum' | 'telat'; label: string; sisa: number } {
  const jumlah = Number(d.jumlah) || 0, dibayar = Number(d.dibayar) || 0;
  const sisa = Math.max(0, jumlah - dibayar);
  if (jumlah > 0 && dibayar >= jumlah) return { kode: 'lunas', label: 'Lunas', sisa: 0 };
  const telat = typeof d.jatuhTempo === 'string' && d.jatuhTempo && d.jatuhTempo < hari;
  if (dibayar > 0) return { kode: telat ? 'telat' : 'sebagian', label: telat ? 'Sebagian · lewat jatuh tempo' : 'Dibayar sebagian', sisa };
  return { kode: telat ? 'telat' : 'belum', label: telat ? 'Belum dibayar · lewat jatuh tempo' : 'Belum dibayar', sisa };
}

/** Normalisasi & pemeriksaan tambahan sebelum menyimpan. Mengubah `d` di tempat; mengembalikan galat per bidang. */
export async function sebelumSimpan(store: Store, def: Koleksi, id: string, d: Record<string, unknown>): Promise<Record<string, string>> {
  const galat: Record<string, string> = {};
  if (def.id === 'siswa') {
    if (d.nisn !== undefined) { const n = normalNisn(d.nisn); if (n) d.nisn = n; else { galat.nisn = 'NISN harus 10 angka.'; } }
    for (const k of ['nis', 'nik', 'kk', 'nsm']) if (typeof d[k] === 'string') d[k] = digit(d[k]);
    if (!d.nisn && !d.nis) galat.nis = 'Isi NISN atau NIS (dipakai untuk masuk portal siswa).';
    if (typeof d.tahunAcuan === 'string' && !/^\d{4}\/\d{4}$/.test(d.tahunAcuan)) galat.tahunAcuan = 'Tulis seperti 2026/2027.';
    else if (typeof d.tahunAcuan === 'string') { const [a, b] = d.tahunAcuan.split('/').map(Number); if (b !== a! + 1) galat.tahunAcuan = 'Tahun kedua harus tahun pertama + 1.'; }
    Object.assign(galat, await periksaPenjaga(store, id, d));
  }
  if (KOL_BERNOMOR.includes(def.id) && typeof d.nisn === 'string') d.nisn = digit(d.nisn);
  if (def.id === 'tagihan' && !(Number(d.jumlah) > 0)) galat.jumlah = 'Jumlah harus lebih dari 0.';
  return galat;
}

async function indeksNomor(store: Store, kol: string, dok: Dok, lama: Dok | null): Promise<void> {
  const baru = teks(dok.d.nisn), sebelumnya = teks(lama?.d.nisn);
  if (sebelumnya && sebelumnya !== baru) await store.del(kunciNomor(sebelumnya, kol, dok.id));
  if (!baru) return;
  const x: Record<string, unknown> = {};
  for (const k of ['jenis', 'capaian', 'predikat', 'kelas', 'tahun', 'untuk', 'periode', 'jumlah', 'dibayar', 'jatuhTempo', 'nomor', 'lunas', 'keterangan', 'tagihan']) if (dok.d[k] !== undefined && dok.d[k] !== '') x[k] = typeof dok.d[k] === 'string' ? (dok.d[k] as string).slice(0, 80) : dok.d[k];
  await store.put(kunciNomor(baru, kol, dok.id), {}, { j: dok.judul.slice(0, 120), t: dok.tanggal, u: dok.unit, s: dok.status, sl: dok.slug, x });
}

/** Menghitung ulang „sudah dibayar“ sebuah tagihan dari kwitansi yang tertaut. */
export async function hitungTagihan(store: Store, def: Koleksi, tagihanId: string): Promise<void> {
  const t = await ambil(store, 'tagihan', tagihanId);
  if (!t) return;
  let total = 0, cursor: string | undefined;
  do {
    const r = await store.list<{ n?: number }>(`i/bayar/${tagihanId}/`, { limit: 1000, cursor });
    for (const it of r.items) total += Number(it.meta.n) || 0;
    cursor = r.cursor;
  } while (cursor);
  if ((Number(t.d.dibayar) || 0) === total) return;
  const dok = await simpan(store, def, { id: t.id, unit: t.unit, status: t.status, judul: t.judul, tanggal: t.tanggal, d: { ...t.d, dibayar: total }, penulis: t.penulis, penulisNama: t.penulisNama });
  await indeksNomor(store, 'tagihan', dok, t);
}

/** Setelah kwitansi disimpan/dihapus: catat atau lepas pembayarannya pada tagihan, lalu hitung ulang. */
async function bayarTagihan(store: Store, tagihanDef: Koleksi | undefined, kw: Dok, lama: Dok | null, hapusKw = false): Promise<void> {
  if (!tagihanDef) return;
  const t0 = teks(lama?.d.tagihan), t1 = hapusKw ? '' : teks(kw.d.tagihan);
  if (t0 && t0 !== t1) { await store.del(kunciBayar(t0, kw.id)); await hitungTagihan(store, tagihanDef, t0); }
  if (t1) { await store.put(kunciBayar(t1, kw.id), {}, { n: Number(kw.d.jumlah) || 0, t: kw.tanggal }); await hitungTagihan(store, tagihanDef, t1); }
}

export interface HasilSimpan { dok?: Dok; galat?: Record<string, string> }

/**
 * Simpan dengan semua kaitannya. `koleksi` = definisi lain yang mungkin perlu ikut diperbarui (tagihan).
 */
export async function simpanTerkait(store: Store, def: Koleksi, m: Masukan & { lama?: Dok | null; sebelumTulis?: (d: Record<string, unknown>) => Promise<void> }, koleksi: Record<string, Koleksi>, now = Date.now()): Promise<HasilSimpan> {
  const lama = m.lama ?? (m.id ? await ambil(store, def.id, m.id) : null);
  const id = lama?.id ?? m.idBaru ?? (def.id === 'siswa' ? newId('sisw') : undefined);
  const d = { ...m.d };
  // Bidang internal yang tidak ada di formulir (mis. riwayat lembaga siswa) tidak hilang saat disunting.
  if (lama) for (const [k, v] of Object.entries(lama.d)) if (!def.bidang.some((b) => b.k === k) && d[k] === undefined) d[k] = v;
  if (def.id === 'tagihan') d.dibayar = Number(lama?.d.dibayar) || 0; // hanya dihitung dari kwitansi
  const galat = await sebelumSimpan(store, def, id ?? '', d);
  if (Object.keys(galat).length) return { galat };
  if (def.id === 'siswa') {
    const salah = await pasangPenjaga(store, id!, d, lama?.d);
    if (salah) return { galat: { nisn: salah } };
  }
  if (m.sebelumTulis) await m.sebelumTulis(d);
  const { sebelumTulis: _abaikan, lama: _lama, ...masukan } = m;
  const dok = await simpan(store, def, { ...masukan, id: lama?.id, idBaru: lama ? undefined : id, d }, now);
  if (KOL_BERNOMOR.includes(def.id)) await indeksNomor(store, def.id, dok, lama);
  if (def.id === 'kwitansi') await bayarTagihan(store, koleksi.tagihan, dok, lama);
  return { dok };
}

export async function hapusTerkait(store: Store, def: Koleksi, id: string, koleksi: Record<string, Koleksi>): Promise<Dok | null> {
  const d = await hapus(store, def, id);
  if (!d) return null;
  if (def.id === 'siswa') await lepasPenjaga(store, d.id, d.d);
  if (KOL_BERNOMOR.includes(def.id) && teks(d.d.nisn)) await store.del(kunciNomor(teks(d.d.nisn), def.id, d.id));
  if (def.id === 'kwitansi') await bayarTagihan(store, koleksi.tagihan, d, d, true);
  if (def.id === 'tagihan') {
    if (teks(d.d.nisn) && teks(d.d.untuk) && teks(d.d.periode)) {
      const kunci = await kunciTagihan(teks(d.d.nisn), teks(d.d.untuk), teks(d.d.periode));
      const g = await store.get<{ id: string }>(kunci);
      if (g?.id === d.id) await store.del(kunci);
    }
    let cursor: string | undefined;
    do { const r = await store.list(`i/bayar/${d.id}/`, { limit: 1000, cursor }); if (r.items.length) await store.del(r.items.map((x) => x.key)); cursor = r.cursor; } while (cursor);
  }
  return d;
}

/** Penghargaan, kwitansi, dan tagihan milik seorang siswa (dicari dengan NISN dan NIS-nya). */
export async function milikSiswa(store: Store, nomor: string[], kol: string): Promise<{ id: string; j: string; t: string; u: string; s: string; sl: string; x: Record<string, unknown> }[]> {
  const out: { id: string; j: string; t: string; u: string; s: string; sl: string; x: Record<string, unknown> }[] = [];
  const sudah = new Set<string>();
  for (const n of [...new Set(nomor.filter(Boolean))]) {
    const r = await store.list<{ j: string; t: string; u: string; s: string; sl: string; x: Record<string, unknown> }>(`i/nomor/${n}/${kol}~`, { limit: 1000 });
    for (const it of r.items) if (!sudah.has(it.id)) { sudah.add(it.id); out.push({ id: it.id, ...it.meta, x: it.meta.x ?? {} }); }
  }
  return out.sort((a, b) => (b.t ?? '').localeCompare(a.t ?? ''));
}
