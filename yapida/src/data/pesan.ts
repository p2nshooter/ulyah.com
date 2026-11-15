/**
 * Pesan antarlembaga (pemilik, 15 Nov 2026): „pesan antar lembaga, di arahkan ke siapa, misal ke super admin, atau ke
 * yayasan dll secara privasi dan ada chat group seluruh lembaga … notifnya jika ada chat privasi atau group masuk, catat
 * tgl nya permintaanya apa, untuk chat group setiap hari bersih … maximal 2 minggu riwayat chat group yg bisa d lihat dan
 * di bersihkan otomatis tanpa jejak … chat pribadi bisa dalam bentuk tiket atau japri“.
 *
 * Semua di R2 (tidak pernah D1, tidak di KV):
 *   grup   o/grup/<YYYY-MM-DD>/<ts>-<acak>   satu objek per pesan, isi di metadata (satu daftar = satu hari obrolan);
 *          hari yang lebih tua dari 14 hari dihapus permanen saat obrolan dibuka pertama kali setiap hari
 *          (Worker gratis tanpa cron) — tidak ada salinan, cache, atau log isi pesan.
 *   japri  o/dm/<percakapan>/<ts>-<acak>      + o/kotak/<akun>/<percakapan> (ringkasan untuk kotak masuk)
 *   tiket  o/tiket/<id>.json (perihal, tujuan, status, tanggal) + o/tm/<id>/<ts>-<acak>
 *          + o/tiket-ke/<tujuan>/<id> (kotak tujuan) + o/kotak/<pembuat>/<id>
 *   baca   o/baca/<akun>.json — penanda terakhir dibaca (notifikasi belum dibaca).
 * Setiap pesan objek sendiri (tidak ada kunci panas); ringkasan kotak ditimpa per pesan (jauh di bawah 1 tulis/detik).
 */
import type { Store } from '../lib/store.ts';
import { metaStr } from '../lib/store.ts';
import { newId, sha256Hex } from '../lib/crypto.ts';
import { hariIni } from '../lib/text.ts';
import { PERAN, type Peran, type User } from './users.ts';

export const SIMPAN_GRUP_HARI = 14;
export const MAKS_PESAN = 2000;

export interface Pesan { id: string; d: string; n: string; l: string; x: string; t: number }
interface MetaPesan { d: string; n: string; l: string; x: string; t: number; p?: 1 }

const acak = () => Math.random().toString(36).slice(2, 8);
const ts13 = (t: number) => String(t).padStart(13, '0');
export const labelAkun = (u: Pick<User, 'peran' | 'units'>, namaUnit: (s: string) => string) => (u.units.length && PERAN[u.peran].lingkup === 'lembaga' ? `${PERAN[u.peran].nama} · ${u.units.map(namaUnit).join(', ')}` : PERAN[u.peran].nama);

/** Menulis satu pesan: isi di metadata bila muat (daftar sekali baca), selain itu isi lengkap di badan objek. */
async function tulisPesan(store: Store, awalan: string, m: Omit<MetaPesan, 'p'>): Promise<Pesan> {
  const id = `${ts13(m.t)}-${acak()}`;
  let meta: MetaPesan = m;
  if (metaStr(m).length > 1800) meta = { ...m, x: `${m.x.slice(0, 120)}…`, p: 1 };
  await store.put(`${awalan}${id}`, { x: m.x }, meta as unknown as Record<string, unknown>);
  return { id, d: m.d, n: m.n, l: m.l, x: m.x, t: m.t };
}

/** Pesan di bawah awalan, urut waktu, sesudah `setelah` (ms). Pesan panjang dibaca utuh dari badannya. */
async function bacaPesan(store: Store, awalan: string, setelah = 0, maks = 600): Promise<Pesan[]> {
  const out: Pesan[] = [];
  let cursor: string | undefined;
  do {
    const r = await store.list<MetaPesan>(awalan, { limit: 1000, cursor });
    for (const it of r.items) if (it.meta?.t > setelah) out.push({ id: it.id, d: it.meta.d, n: it.meta.n, l: it.meta.l, x: it.meta.x, t: it.meta.t, ...(it.meta.p ? { p: 1 } : {}) } as Pesan & { p?: 1 });
    cursor = r.cursor;
  } while (cursor && out.length < maks);
  const akhir = out.sort((a, b) => a.t - b.t).slice(-maks);
  for (const p of akhir as (Pesan & { p?: 1 })[]) if (p.p) { const isi = await store.get<{ x: string }>(`${awalan}${p.id}`); if (isi?.x) p.x = isi.x; delete p.p; }
  return akhir;
}

/* ── grup seluruh lembaga ─────────────────────────────────────────────── */

export const TGL_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Tanggal yang masih boleh dilihat: hari ini dan 13 hari sebelumnya (WIB). */
export function hariGrup(now = Date.now()): string[] {
  return Array.from({ length: SIMPAN_GRUP_HARI }, (_, i) => hariIni(now - i * 86_400_000));
}

export async function kirimGrup(store: Store, u: { id: string; nama: string; label: string }, teks: string, now = Date.now()): Promise<Pesan> {
  return tulisPesan(store, `o/grup/${hariIni(now)}/`, { d: u.id, n: u.nama, l: u.label, x: teks, t: now });
}
export const bacaGrup = (store: Store, tgl: string, setelah = 0) => bacaPesan(store, `o/grup/${tgl}/`, setelah);

/** Menghapus obrolan grup yang lebih tua dari 14 hari — sekali sehari (penanda create-once), permanen. */
export async function bersihkanGrup(store: Store, now = Date.now()): Promise<number> {
  const hari = hariIni(now);
  if (!(await store.createOnce(`o/grup-bersih/${hari}`, { t: now }))) return 0;
  const boleh = new Set(hariGrup(now));
  const hapus: string[] = [];
  for await (const k of store.keys('o/grup/')) { const tgl = k.key.slice(7, 17); if (!boleh.has(tgl)) hapus.push(k.key); }
  for await (const k of store.keys('o/grup-bersih/')) if (k.key !== `o/grup-bersih/${hari}`) hapus.push(k.key);
  if (hapus.length) await store.del(hapus);
  return hapus.length;
}

/* ── japri ────────────────────────────────────────────────────────────── */

export const percakapanDm = async (a: string, b: string) => `dm-${(await sha256Hex([a, b].sort().join('|'))).slice(0, 24)}`;
export interface Kotak { id: string; j: 'dm' | 'tiket'; w?: string; wn?: string; p?: string; s?: string; tj?: string; t: number; c: string; d: string }

export async function kirimDm(store: Store, dari: { id: string; nama: string; label: string }, ke: { id: string; nama: string }, teks: string, now = Date.now()): Promise<Pesan> {
  const conv = await percakapanDm(dari.id, ke.id);
  await store.createOnce(`o/dm-anggota/${conv}.json`, { a: [dari.id, ke.id].sort() });
  const p = await tulisPesan(store, `o/dm/${conv}/`, { d: dari.id, n: dari.nama, l: dari.label, x: teks, t: now });
  const cuplikan = teks.replace(/\s+/g, ' ').slice(0, 90);
  await store.put(`o/kotak/${dari.id}/${conv}`, {}, { j: 'dm', w: ke.id, wn: ke.nama, t: now, c: cuplikan, d: dari.id });
  await store.put(`o/kotak/${ke.id}/${conv}`, {}, { j: 'dm', w: dari.id, wn: dari.nama, t: now, c: cuplikan, d: dari.id });
  return p;
}
export const bacaDm = async (store: Store, a: string, b: string, setelah = 0) => bacaPesan(store, `o/dm/${await percakapanDm(a, b)}/`, setelah);

export async function kotakMasuk(store: Store, akun: string): Promise<Kotak[]> {
  const r = await store.list<Omit<Kotak, 'id'>>(`o/kotak/${akun}/`, { limit: 1000 });
  return r.items.filter((x) => x.meta?.t).map((x) => ({ id: x.id, ...x.meta })).sort((a, b) => b.t - a.t);
}

/* ── tiket ────────────────────────────────────────────────────────────── */

export type StatusTiket = 'baru' | 'diproses' | 'selesai';
export const LABEL_STATUS_TIKET: Record<StatusTiket, string> = { baru: 'Baru', diproses: 'Diproses', selesai: 'Selesai' };
export interface Tiket { id: string; perihal: string; tujuan: string; dari: string; dariNama: string; dariLabel: string; status: StatusTiket; buat: number; ubah: number; n: number }

export const ID_TIKET = /^tkt_[0-9A-Z]{20}$/;
export const TUJUAN_RE = /^(super|ketua|yayasan|unit:[a-z0-9-]{1,60})$/;

/** Kotak tujuan yang dilihat akun ini. Super admin melihat semua. */
export function tujuanAkun(u: Pick<User, 'peran' | 'units'>): string[] | 'semua' {
  if (u.peran === 'super') return 'semua';
  const out: string[] = [];
  if (u.peran === 'ketua') out.push('ketua', 'yayasan');
  if (u.peran === 'yayasan') out.push('yayasan');
  if (u.peran === 'kepala' || u.peran === 'lembaga') out.push(...u.units.map((s) => `unit:${s}`));
  return out;
}
export const anggotaTujuan = (u: Pick<User, 'peran' | 'units'>, tujuan: string) => { const t = tujuanAkun(u); return t === 'semua' || t.includes(tujuan); };

export async function buatTiket(store: Store, dari: { id: string; nama: string; label: string }, tujuan: string, perihal: string, teks: string, now = Date.now()): Promise<Tiket> {
  const t: Tiket = { id: newId('tkt'), perihal: perihal.slice(0, 140), tujuan, dari: dari.id, dariNama: dari.nama, dariLabel: dari.label, status: 'baru', buat: now, ubah: now, n: 1 };
  await store.put(`o/tiket/${t.id}.json`, t);
  await tulisPesan(store, `o/tm/${t.id}/`, { d: dari.id, n: dari.nama, l: dari.label, x: teks, t: now });
  await indeksTiket(store, t, dari.id, teks);
  return t;
}

async function indeksTiket(store: Store, t: Tiket, dari: string, teks: string): Promise<void> {
  const ring = { j: 'tiket', p: t.perihal, s: t.status, tj: t.tujuan, t: t.ubah, c: teks.replace(/\s+/g, ' ').slice(0, 90), d: dari, dn: t.dariNama, b: t.buat };
  await store.put(`o/kotak/${t.dari}/${t.id}`, {}, ring);
  await store.put(`o/tiket-ke/${t.tujuan}/${t.id}`, {}, ring);
}

export const ambilTiket = (store: Store, id: string) => (ID_TIKET.test(id) ? store.get<Tiket>(`o/tiket/${id}.json`) : Promise.resolve(null));
export const bolehTiket = (u: Pick<User, 'id' | 'peran' | 'units'>, t: Tiket) => t.dari === u.id || anggotaTujuan(u, t.tujuan);

export async function balasTiket(store: Store, t: Tiket, dari: { id: string; nama: string; label: string }, teks: string, now = Date.now()): Promise<Pesan> {
  const p = await tulisPesan(store, `o/tm/${t.id}/`, { d: dari.id, n: dari.nama, l: dari.label, x: teks, t: now });
  const baru = await store.cas<Tiket>(`o/tiket/${t.id}.json`, (cur) => (cur ? { ...cur, ubah: now, n: cur.n + 1, status: cur.status === 'baru' && dari.id !== cur.dari ? 'diproses' : cur.status } : null), 'Tiket');
  if (baru) await indeksTiket(store, baru, dari.id, teks);
  return p;
}

export async function ubahStatusTiket(store: Store, t: Tiket, status: StatusTiket, oleh: { id: string; nama: string; label: string }, now = Date.now()): Promise<Tiket | null> {
  const baru = await store.cas<Tiket>(`o/tiket/${t.id}.json`, (cur) => (cur && cur.status !== status ? { ...cur, status, ubah: now } : null), 'Tiket');
  if (!baru || baru.status !== status) return baru;
  const teks = `— status diubah menjadi „${LABEL_STATUS_TIKET[status]}“ oleh ${oleh.nama} —`;
  await tulisPesan(store, `o/tm/${t.id}/`, { d: oleh.id, n: oleh.nama, l: oleh.label, x: teks, t: now });
  await indeksTiket(store, baru, oleh.id, teks);
  return baru;
}

export const bacaTiketPesan = (store: Store, id: string, setelah = 0) => bacaPesan(store, `o/tm/${id}/`, setelah);

/** Tiket yang masuk ke kotak tujuan akun ini (bukan buatannya sendiri). */
export async function tiketMasuk(store: Store, u: Pick<User, 'id' | 'peran' | 'units'>): Promise<(Kotak & { dn?: string; b?: number })[]> {
  const t = tujuanAkun(u);
  const awalan = t === 'semua' ? ['o/tiket-ke/'] : t.map((x) => `o/tiket-ke/${x}/`);
  const out: (Kotak & { dn?: string; b?: number })[] = [];
  for (const a of awalan) {
    let cursor: string | undefined;
    do { const r = await store.list<Omit<Kotak, 'id'> & { dn?: string; b?: number }>(a, { limit: 1000, cursor }); for (const x of r.items) if (x.meta?.t) out.push({ id: x.id, ...x.meta }); cursor = r.cursor; } while (cursor);
  }
  const unik = new Map(out.map((x) => [x.id, x]));
  return [...unik.values()].sort((a, b) => b.t - a.t);
}

/* ── penanda baca & notifikasi ────────────────────────────────────────── */

export interface Baca { grup: number; dm: Record<string, number>; tiket: Record<string, number> }
export const bacaPenanda = async (store: Store, akun: string): Promise<Baca> => ({ grup: 0, dm: {}, tiket: {}, ...((await store.get<Baca>(`o/baca/${akun}.json`)) ?? {}) });

export async function tandaiDibaca(store: Store, akun: string, jenis: 'grup' | 'dm' | 'tiket', id: string, t: number): Promise<void> {
  await store.cas<Baca>(`o/baca/${akun}.json`, (cur) => {
    const b: Baca = { grup: 0, dm: {}, tiket: {}, ...(cur ?? {}) };
    if (jenis === 'grup') { if (b.grup >= t) return null; b.grup = t; }
    else { const peta = jenis === 'dm' ? b.dm : b.tiket; if ((peta[id] ?? 0) >= t) return null; peta[id] = t; }
    return b;
  }, 'Penanda baca');
}

export interface Hitung { grup: number; japri: number; tiket: number; total: number; terbaru?: { jenis: string; dari: string; cuplikan: string; t: number; href: string } }

/** Jumlah belum dibaca: ±3–5 operasi daftar R2, dipanggil berkala oleh portal (notifikasi). */
export async function hitungBelum(store: Store, u: Pick<User, 'id' | 'peran' | 'units'>, now = Date.now()): Promise<Hitung> {
  const [baca, grup, kotak, masuk] = await Promise.all([bacaPenanda(store, u.id), store.list<MetaPesan>(`o/grup/${hariIni(now)}/`, { limit: 1000 }), kotakMasuk(store, u.id), tiketMasuk(store, u)]);
  const grupBaru = grup.items.filter((x) => x.meta?.t > baca.grup && x.meta.d !== u.id);
  const dm = kotak.filter((k) => k.j === 'dm' && k.d !== u.id && k.t > (baca.dm[k.id] ?? 0));
  const tk = [...kotak.filter((k) => k.j === 'tiket'), ...masuk].filter((k, i, arr) => arr.findIndex((y) => y.id === k.id) === i && k.d !== u.id && k.t > (baca.tiket[k.id] ?? 0));
  const calon: Hitung['terbaru'][] = [
    ...grupBaru.map((x) => ({ jenis: 'Grup', dari: x.meta.n, cuplikan: x.meta.x.slice(0, 90), t: x.meta.t, href: '/portal/pesan/grup' })),
    ...dm.map((k) => ({ jenis: 'Japri', dari: k.wn ?? '', cuplikan: k.c, t: k.t, href: `/portal/pesan/japri/${k.w}` })),
    ...tk.map((k) => ({ jenis: 'Tiket', dari: k.p ?? '', cuplikan: k.c, t: k.t, href: `/portal/pesan/tiket/${k.id}` })),
  ];
  const terbaru = calon.sort((a, b) => (b?.t ?? 0) - (a?.t ?? 0))[0];
  return { grup: grupBaru.length, japri: dm.length, tiket: tk.length, total: grupBaru.length + dm.length + tk.length, ...(terbaru ? { terbaru } : {}) };
}

export const PILIHAN_TUJUAN = (units: { slug: string; singkat: string }[]): [string, string][] => [
  ['super', 'Super Admin'], ['ketua', 'Ketua Yayasan'], ['yayasan', 'Admin Yayasan (sekretariat)'],
  ...units.map((u): [string, string] => [`unit:${u.slug}`, `Pengelola ${u.singkat} (kepala & admin)`]),
];
export const namaTujuan = (tujuan: string, units: { slug: string; singkat: string }[]) => PILIHAN_TUJUAN(units).find(([k]) => k === tujuan)?.[1] ?? tujuan;
export type { Peran };
