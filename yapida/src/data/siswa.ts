/**
 * Data siswa (perintah pemilik 22): satu dokumen per siswa di R2 (koleksi `siswa`, privat), NISN dan NIS dijaga unik
 * dengan objek create-once, kelas berjalan dihitung dari tahun pelajaran (naik otomatis setiap Juli, yang lulus atau
 * keluar tidak bisa masuk), masuk portal siswa dengan NISN (atau NIS untuk RA) + tanggal lahir, dan impor file master
 * (urutan kolom pemilik). Tidak ada data contoh yang dimasukkan.
 */
import { digit, normalTanggal } from '../lib/tanggal.ts';
import type { Store } from '../lib/store.ts';
import { sha256Hex } from '../lib/crypto.ts';
import { tahunPelajaran } from '../lib/text.ts';
import type { BarisLembaga, BarisSiswa } from './master.ts';
import { ambil, type Dok } from './koleksi.ts';
import type { UnitItem } from './site.ts';

/* ── tingkat, jenjang, kenaikan kelas ──────────────────────────────────── */

export type Jenjang = 'RA' | 'MI' | 'MTs' | 'MA';
export const JENJANG: Record<Jenjang, { min: number; max: number; nama: string }> = {
  RA: { min: 0, max: 1, nama: 'Raudhatul Athfal' }, MI: { min: 1, max: 6, nama: 'Madrasah Ibtidaiyah' },
  MTs: { min: 7, max: 9, nama: 'Madrasah Tsanawiyah' }, MA: { min: 10, max: 12, nama: 'Madrasah Aliyah' },
};
export const TINGKAT_SEMUA = ['Kelompok A', 'Kelompok B', ...Array.from({ length: 12 }, (_, i) => `Kelas ${i + 1}`)];
export const STATUS_SISWA: [string, string][] = [['aktif', 'Aktif'], ['lulus', 'Lulus'], ['pindah', 'Pindah'], ['keluar', 'Keluar']];
export const labelStatus = (s: string) => STATUS_SISWA.find(([k]) => k === s)?.[1] ?? 'Aktif';

const ROMAWI: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };

/** „Kelompok B“ → 1, „Kelas 7“ / „7“ / „VII“ / „VII-B“ / „1A“ → 7 / 1 (RA: Kelompok A = 0, B = 1). */
export function levelTingkat(t: string): number | null {
  const s = t.trim();
  if (/kelompok\s*a\b|^tk\s*a\b|^a(?:\s*[-.]?\s*\d)?$/i.test(s)) return 0;
  if (/kelompok\s*b\b|^tk\s*b\b|^b(?:\s*[-.]?\s*\d)?$/i.test(s)) return 1;
  const r = /^(?:kelas\s*)?([IVX]{1,4})(?![a-z])/i.exec(s);
  if (r && ROMAWI[r[1]!.toUpperCase()]) return ROMAWI[r[1]!.toUpperCase()]!;
  const n = /^(?:kelas\s*|kls\.?\s*)?(\d{1,2})(?!\d)/i.exec(s) ?? /kelas\s*(\d{1,2})(?!\d)/i.exec(s);
  return n && Number(n[1]) >= 1 && Number(n[1]) <= 12 ? Number(n[1]) : null;
}

/** Nilai kelas gabungan („1A“, „VII-B“, „7 B“, „Kelas 3.2“, „A1“) → rombel baku „1-A“, „7-B“, „3-2“, „A-1“; null bila tanpa akhiran. */
export function rombelDariKelas(t: string): string | null {
  const s = t.trim().replace(/^kelas\s*|^kls\.?\s*/i, '');
  const ra = /^([AB])\s*[-./]?\s*(\d{1,2})$/i.exec(s);
  if (ra) return `${ra[1]!.toUpperCase()}-${ra[2]}`;
  const m = /^(\d{1,2}|[IVX]{1,4})\s*[-./]?\s*([A-Z]{1,2}|\d{1,2})$/i.exec(s);
  if (!m) return null;
  const lv = levelTingkat(m[1]!);
  return lv === null ? null : `${lv}-${m[2]!.toUpperCase()}`;
}
export const namaTingkat = (level: number, j: Jenjang) => (j === 'RA' ? (level <= 0 ? 'Kelompok A' : 'Kelompok B') : `Kelas ${level}`);

/** Jenjang dari teks bebas: „MI“, „MIS Al Huda“, „Madrasah Ibtidaiyah“, „SMP“, „RA/BA“ … (kata pertama yang dikenali). */
export function jenjangDari(s: string): Jenjang | null {
  const t = ` ${s.toLowerCase().replace(/[^a-z0-9/ ]+/g, ' ')} `;
  const calon: [Jenjang, RegExp][] = [
    ['RA', /\b(ra|tk|ba|paud|raudhatul|raudlatul|raudatul|athfal|kelompok)\b/],
    ['MTs', /\b(mts|mtsn|mtss|smp|tsanawiyah|tsanawiyyah)\b/],
    ['MI', /\b(mi|mis|min|sd|ibtidaiyah|ibtidaiyyah)\b/],
    ['MA', /\b(ma|man|mas|sma|aliyah|aliyyah)\b/],
  ];
  let pilih: Jenjang | null = null, posisi = Infinity;
  for (const [j, re] of calon) { const m = re.exec(t); if (m && m.index < posisi) { posisi = m.index; pilih = j; } }
  return pilih;
}
/** Jenjang dari tingkat: Kelompok A/B → RA, Kelas 1–6 → MI, 7–9 → MTs, 10–12 → MA. */
export const jenjangDariTingkat = (t: string): Jenjang | null => {
  if (/kelompok|^tk\s*[ab]\b|^[ab](\s*[-.]?\s*\d)?$/i.test(t.trim())) return 'RA';
  const lv = levelTingkat(t);
  return lv === null ? null : lv <= 6 ? 'MI' : lv <= 9 ? 'MTs' : 'MA';
};
/** Jenjang lembaga dari slug-nya (ra-…, mi-…, mts-…, ma-…). */
export const jenjangUnit = (slug: string): Jenjang | null => (/^ra-/.test(slug) ? 'RA' : /^mi-/.test(slug) ? 'MI' : /^mts-/.test(slug) ? 'MTs' : /^ma-/.test(slug) ? 'MA' : null);

export const tpAwal = (tp: string) => Number(/(\d{4})/.exec(tp)?.[1] ?? NaN);

export interface Posisi { tingkat: string; rombel: string; status: string; naik: number; tp: string; lulusTp?: string }

/**
 * Posisi siswa pada tahun pelajaran berjalan. Data master menyimpan tingkat & rombel pada `tahunAcuan`; setiap tahun
 * pelajaran baru (Juli) tingkat naik satu, nomor/huruf di depan nama rombel ikut naik (1-A → 2-A, A-1 → B-1).
 * Melewati tingkat tertinggi jenjangnya = lulus. Status manual pindah/keluar/lulus membekukan posisinya.
 */
export function posisi(d: Record<string, unknown>, unit: string, now = Date.now()): Posisi {
  const tp = tahunPelajaran(now);
  const tingkat = String(d.tingkat ?? '');
  const rombel = String(d.rombel ?? '');
  const status = String(d.statusSiswa ?? 'aktif');
  const j = (jenjangDari(String(d.jenjang ?? '')) ?? jenjangUnit(unit)) as Jenjang | null;
  const lv = levelTingkat(tingkat);
  if (status !== 'aktif' || lv === null || !j) return { tingkat, rombel, status, naik: 0, tp };
  const acuan = tpAwal(String(d.tahunAcuan ?? '')) || tpAwal(tp);
  const naik = Math.max(0, tpAwal(tp) - acuan);
  const level = lv + naik;
  if (level > JENJANG[j].max) {
    const th = acuan + (JENJANG[j].max - lv) + 1;
    return { tingkat: namaTingkat(JENJANG[j].max, j), rombel, status: 'lulus', naik, tp, lulusTp: `${th - 1}/${th}` };
  }
  const geser = (r: string) => (naik === 0 ? r : j === 'RA' ? r.replace(/^[AB](?=\b|[-\s.]|\d)/i, level >= 1 ? 'B' : 'A') : r.replace(/^\d{1,2}/, String(level)));
  return { tingkat: namaTingkat(level, j), rombel: geser(rombel), status: 'aktif', naik, tp };
}

/* ── normalisasi isian ─────────────────────────────────────────────────── */

export { bulanDari, digit, normalTanggal } from '../lib/tanggal.ts';
/** NISN: 10 angka (angka 0 di depan yang hilang karena Excel dikembalikan). */
export function normalNisn(s: unknown): string | null {
  const x = digit(s);
  if (!x) return null;
  return x.length > 10 || x.length < 6 ? null : x.padStart(10, '0');
}
export const normalJk = (s: unknown) => (/^(l|lk|laki)/i.test(String(s ?? '').trim()) ? 'L' : /^(p|pr|perempuan|wanita)/i.test(String(s ?? '').trim()) ? 'P' : '');
export function normalStatus(s: unknown): string {
  const t = String(s ?? '').trim().toLowerCase();
  return !t || /aktif/.test(t) ? 'aktif' : /lulus|alumni/.test(t) ? 'lulus' : /pindah|mutasi/.test(t) ? 'pindah' : /keluar|berhenti|drop/.test(t) ? 'keluar' : 'aktif';
}
/** 3216011505200001 → 321601••••••0001 (portal siswa dan daftar). */
export const samarkan = (s: unknown) => { const x = String(s ?? ''); return x.length > 10 ? `${x.slice(0, 6)}${'•'.repeat(x.length - 10)}${x.slice(-4)}` : x ? '••••' : ''; };

/* ── penjaga NISN/NIS & pencarian ──────────────────────────────────────── */

const kunciNisn = (n: string) => `u/nisn/${n}`;
const kunciNis = (n: string) => `u/nis/${n}`;

export async function cariSiswa(store: Store, nomor: string): Promise<Dok | null> {
  const x = digit(nomor);
  if (!x) return null;
  for (const k of [kunciNisn(x.padStart(10, '0')), kunciNisn(x), kunciNis(x)]) {
    const g = await store.get<{ id: string }>(k);
    if (g) { const d = await ambil(store, 'siswa', g.id); if (d) return d; }
  }
  return null;
}

/** Galat bila NISN/NIS sudah dipakai siswa lain. */
export async function periksaPenjaga(store: Store, id: string, d: Record<string, unknown>): Promise<Record<string, string>> {
  const galat: Record<string, string> = {};
  for (const [k, kunci] of [['nisn', kunciNisn], ['nis', kunciNis]] as const) {
    const v = typeof d[k] === 'string' ? (d[k] as string) : '';
    if (!v) continue;
    const g = await store.get<{ id: string }>(kunci(v));
    if (g && g.id !== id && (await ambil(store, 'siswa', g.id))) galat[k] = `${k.toUpperCase()} ini sudah dipakai siswa lain.`;
  }
  return galat;
}

/** Klaim NISN/NIS (create-once) sebelum menyimpan; lepas yang lama bila berubah. */
export async function pasangPenjaga(store: Store, id: string, d: Record<string, unknown>, lama?: Record<string, unknown>): Promise<string | null> {
  for (const [k, kunci] of [['nisn', kunciNisn], ['nis', kunciNis]] as const) {
    const v = typeof d[k] === 'string' ? (d[k] as string) : '';
    const v0 = typeof lama?.[k] === 'string' ? (lama[k] as string) : '';
    if (v && !(await store.createOnce(kunci(v), { id }))) {
      const g = await store.get<{ id: string }>(kunci(v));
      if (g && g.id !== id) {
        if (await ambil(store, 'siswa', g.id)) return `${k.toUpperCase()} ${v} sudah dipakai siswa lain.`;
        await store.put(kunci(v), { id }); // penjaga yatim (siswanya sudah dihapus)
      }
    }
    if (v0 && v0 !== v) { const g = await store.get<{ id: string }>(kunci(v0)); if (g?.id === id) await store.del(kunci(v0)); }
  }
  return null;
}
export async function lepasPenjaga(store: Store, id: string, d: Record<string, unknown>): Promise<void> {
  for (const [k, kunci] of [['nisn', kunciNisn], ['nis', kunciNis]] as const) {
    const v = typeof d[k] === 'string' ? (d[k] as string) : '';
    if (!v) continue;
    const g = await store.get<{ id: string }>(kunci(v));
    if (g?.id === id) await store.del(kunci(v));
  }
}

/* ── masuk portal siswa: NISN/NIS + tanggal lahir, dikunci bertahap ────── */

export interface HasilMasuk { ok: boolean; d?: Dok; pesan?: string }
/** Kunci penghitung salah sandi per nomor (NISN/NIS tanpa nol di depan) — admin lembaga bisa membukanya. */
export const kunciGagal = async (nomor: string) => `k/siswa-gagal/${(await sha256Hex(`siswa:${digit(nomor).replace(/^0+/, '')}`)).slice(0, 32)}.json`;

export async function masukSiswa(store: Store, nomor: string, sandi: string, now = Date.now()): Promise<HasilMasuk> {
  const kunci = await kunciGagal(nomor);
  const kini = await store.get<{ n: number; sampai: number }>(kunci);
  if (kini && kini.sampai > now) {
    const menit = Math.ceil((kini.sampai - now) / 60_000);
    return { ok: false, pesan: `Terlalu banyak percobaan salah. Coba lagi dalam ${menit} menit, atau hubungi admin lembaga.` };
  }
  const d = await cariSiswa(store, nomor);
  const tgl = normalTanggal(sandi);
  if (!d || !tgl || d.d.tanggalLahir !== tgl) {
    const n = (kini?.n ?? 0) + 1;
    const kunciSampai = n >= 5 ? now + Math.min(24 * 60, 15 * 2 ** Math.min(6, n - 5)) * 60_000 : 0;
    await store.put(kunci, { n, sampai: kunciSampai });
    return { ok: false, pesan: n >= 5 ? 'Terlalu banyak percobaan salah — akun dikunci sementara.' : `NISN/NIS atau tanggal lahir salah. Sisa percobaan ${5 - n}.` };
  }
  const p = posisi(d.d, d.unit, now);
  if (p.status !== 'aktif') return { ok: false, pesan: p.status === 'lulus' ? 'Selamat, Anda sudah lulus — akun portal siswa tidak aktif lagi.' : 'Akun ini tidak aktif (pindah/keluar). Hubungi admin lembaga.' };
  if (kini) await store.del(kunci);
  return { ok: true, d };
}

/* ── file master: kolom pemilik ────────────────────────────────────────── */

/** Urutan kolom file master pemilik — dipakai templat kosong dan unduhan (dibaca ulang oleh src/data/master.ts). */
export const KOLOM_SISWA = ['No', 'NSM Lembaga', 'Jenjang', 'Tingkat/Kelompok', 'Nama Rombel', 'NIS Lokal', 'NISN (10 Digit)', 'NIK Siswa (16 Digit)', 'Nama Lengkap Siswa', 'L/P', 'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'Nama Ayah Kandung', 'Nama Ibu Kandung', 'No. KK (16 Digit)', 'Alamat Lengkap Siswa', 'Status Siswa'];
export const KOLOM_LEMBAGA = ['No', 'Jenjang', 'NSM (12 Digit)', 'NPSN (8 Digit)', 'Nama Lembaga', 'Status', 'Alamat Lengkap', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nama Kepala Madrasah', 'NIP/NUPTK Kepala', 'Tahun Pelajaran'];

type UnitImpor = UnitItem & { nsm?: string };

/** Lembaga sebuah baris: NSM → nama lembaga di kolom → jenjang → petunjuk lembar/baris pemisah → tingkatnya. */
export function lembagaBaris(r: BarisSiswa, units: UnitImpor[]): string | undefined {
  const formal = units.filter((u) => jenjangUnit(u.slug));
  if (r.nsm) { const u = units.find((x) => x.nsm && x.nsm === r.nsm); if (u) return u.slug; }
  const teks = r.lembagaTeks || '';
  if (teks) {
    const t = teks.toLowerCase().replace(/\s+/g, ' ');
    const persis = units.find((u) => u.nama.toLowerCase() === t || u.singkat.toLowerCase() === t);
    if (persis) return persis.slug;
  }
  const j = jenjangDari(teks) ?? jenjangDari(r.jenjang) ?? (r.petunjuk.jenjang as Jenjang | undefined) ?? jenjangDariTingkat(r.tingkat);
  return j ? formal.find((u) => jenjangUnit(u.slug) === j)?.slug : undefined;
}

/**
 * Memeriksa dan menormalkan setiap baris: lembaga, NISN 10 angka, tanggal lahir (bentuk apa pun), tingkat sesuai
 * jenjang, NIK/KK 16 angka (peringatan bila bukan), NISN/NIS ganda di file. `boleh` = lembaga yang dikelola pengimpor.
 */
export function periksaBaris(rows: BarisSiswa[], lembaga: BarisLembaga[], units: UnitImpor[], boleh: (slug: string) => boolean, now = Date.now()): BarisSiswa[] {
  const tpDefault = tahunPelajaran(now);
  const nisnDipakai = new Map<string, string>(), nisDipakai = new Map<string, string>();
  return rows.map((r) => {
    const g: string[] = [], w: string[] = [];
    const unit = lembagaBaris(r, units);
    if (!unit) g.push('Lembaga tidak dikenali — isi NSM di profil lembaga, atau kolom Jenjang/Nama Lembaga (RA/MI/MTs).');
    else if (!boleh(unit)) g.push('Bukan lembaga yang Anda kelola.');
    const j = (unit ? jenjangUnit(unit) : null) ?? jenjangDari(r.jenjang);
    const lv = levelTingkat(r.tingkat);
    if (!r.tingkat) g.push('Tingkat/kelas kosong.');
    else if (lv === null) g.push(`Tingkat/Kelompok „${r.tingkat}“ tidak dikenali.`);
    else if (j && (lv < JENJANG[j].min || lv > JENJANG[j].max)) g.push(`${r.tingkat} tidak ada di jenjang ${j}.`);
    const nisn = r.nisn ? normalNisn(r.nisn) : '';
    if (r.nisn && !nisn) g.push(`NISN „${r.nisn}“ harus 10 angka.`);
    if (!nisn && !r.nis) g.push('NISN atau NIS Lokal wajib diisi (untuk masuk portal siswa).');
    const tgl = normalTanggal(r.tanggalLahir, now);
    if (!tgl) g.push(r.tanggalLahir ? `Tanggal lahir „${r.tanggalLahir}“ tidak terbaca.` : 'Tanggal lahir kosong (dipakai sebagai kata sandi portal siswa).');
    const nik = digit(r.nik), kk = digit(r.kk);
    if (r.nik && nik.length !== 16) w.push(`NIK ${nik.length} angka (seharusnya 16) — di Excel format kolomnya sebagai Teks.`);
    if (r.kk && kk.length !== 16) w.push(`No. KK ${kk.length} angka (seharusnya 16).`);
    const jk = normalJk(r.jk);
    if (!jk) w.push('L/P kosong atau tidak dikenali.');
    const tanda = `${r.sumber} baris ${r.baris}`;
    if (nisn) { if (nisnDipakai.has(nisn)) g.push(`NISN sama dengan ${nisnDipakai.get(nisn)}.`); else nisnDipakai.set(nisn, tanda); }
    if (r.nis) { if (nisDipakai.has(r.nis)) g.push(`NIS sama dengan ${nisDipakai.get(r.nis)}.`); else nisDipakai.set(r.nis, tanda); }
    const tpLembaga = lembaga.find((l) => (l.nsm && l.nsm === r.nsm) || (j && jenjangDari(l.jenjang) === j))?.tp;
    const tahunAcuan = tpLembaga || r.petunjuk.tp || tpDefault;
    return { ...r, unit, nisn: nisn || '', nik, kk, jk, tanggalLahir: tgl ?? r.tanggalLahir, tingkat: lv !== null && j ? namaTingkat(lv, j) : r.tingkat, jenjang: j ?? r.jenjang, statusSiswa: normalStatus(r.statusSiswa), tahunAcuan, galat: g, peringatan: w };
  });
}

/** Nilai dokumen siswa dari satu baris impor yang sah. */
export const dokDariBaris = (r: BarisSiswa): Record<string, unknown> => ({
  nsm: r.nsm, jenjang: r.jenjang, tingkat: r.tingkat, rombel: r.rombel, nis: r.nis, nisn: r.nisn, nik: r.nik, jk: r.jk, tempatLahir: r.tempatLahir, tanggalLahir: r.tanggalLahir,
  ayah: r.ayah, ibu: r.ibu, kk: r.kk, alamat: r.alamat, statusSiswa: r.statusSiswa, tahunAcuan: r.tahunAcuan,
});
