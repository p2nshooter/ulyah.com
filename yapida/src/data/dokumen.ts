/**
 * Dokumen lembaga (perintah pemilik 13 & 17): kop surat, sertifikat & piagam penghargaan, kwitansi pembayaran, surat
 * berkop. Semua CRUD lewat mesin koleksi (R2, src/data/koleksi.ts); berkas ini memuat daftar desain, jenis, kalimat
 * otomatis, nomor otomatis (create-once per nomor — aman dari balapan), dan kop yang dipakai setiap dokumen.
 */
import { rinciSitus, tulisAlamat } from '../lib/alamat.ts';
import type { Store } from '../lib/store.ts';
import { bulanRomawi } from '../lib/text.ts';
import { ambil, daftar, type Dok } from './koleksi.ts';
import { labelStatistik, type Kontak, type Situs, type Unit } from './model.ts';

/* ── desain sertifikat ──────────────────────────────────────────────────── */

export interface Desain { id: string; nama: string; ket: string; kelompok: 'klasik' | 'islami' | 'anak' | 'modern' }
export const DESAIN: Desain[] = [
  { id: 'zamrud', nama: 'Zamrud & Emas', ket: 'Klasik yayasan: hijau zamrud, bingkai emas ganda, sudut berukir.', kelompok: 'klasik' },
  { id: 'safir', nama: 'Biru Safir', ket: 'Biru tua berwibawa dengan garis emas tipis.', kelompok: 'klasik' },
  { id: 'marun', nama: 'Marun Kerajaan', ket: 'Merah marun dan emas, bingkai tebal bergaya piagam resmi.', kelompok: 'klasik' },
  { id: 'perkamen', nama: 'Krem Perkamen', ket: 'Seperti kertas tua: krem hangat, huruf serif klasik.', kelompok: 'klasik' },
  { id: 'arabesque', nama: 'Arabesque Hijau', ket: 'Pola geometris islami di seluruh latar, hijau dan krem.', kelompok: 'islami' },
  { id: 'kaligrafi', nama: 'Zaitun Kaligrafi', ket: 'Basmalah besar di atas, nuansa zaitun dan tembaga — cocok untuk tahfidz.', kelompok: 'islami' },
  { id: 'malam', nama: 'Hitam Emas', ket: 'Latar gelap mewah dengan tulisan emas berkilau.', kelompok: 'modern' },
  { id: 'minimal', nama: 'Putih Minimal', ket: 'Bersih dan modern: banyak ruang putih, satu garis emas.', kelompok: 'modern' },
  { id: 'tosca', nama: 'Tosca Geometris', ket: 'Tosca segar dengan bidang-bidang geometris di sudut.', kelompok: 'modern' },
  { id: 'mawar', nama: 'Mawar Emas', ket: 'Merah jambu lembut dan emas mawar — elegan untuk santriwati.', kelompok: 'modern' },
  { id: 'lavender', nama: 'Ungu Lavender', ket: 'Lembut dan ceria untuk RA/TK: ungu muda, sudut membulat.', kelompok: 'anak' },
  { id: 'ceria', nama: 'Pelangi Ceria', ket: 'Warna-warni dengan taburan bintang — untuk anak-anak.', kelompok: 'anak' },
];
export const DESAIN_ID: Record<string, Desain> = Object.fromEntries(DESAIN.map((d) => [d.id, d]));
export const PILIHAN_DESAIN: [string, string][] = DESAIN.map((d) => [d.id, d.nama]);

/* ── jenis penghargaan ──────────────────────────────────────────────────── */

export const JENIS_PENGHARGAAN: [string, string][] = [
  ['tahfidz', 'Tahfidz Al-Qur’an'], ['lomba', 'Juara lomba'], ['ranking', 'Peringkat / ranking kelas'], ['kelulusan', 'Kelulusan'],
  ['teladan', 'Siswa / santri teladan'], ['kehadiran', 'Kehadiran sempurna'], ['peserta', 'Peserta kegiatan'], ['lainnya', 'Penghargaan lainnya'],
];
export const JUDUL_PENGHARGAAN: Record<string, string> = {
  tahfidz: 'Sertifikat Tahfidz Al-Qur’an', lomba: 'Piagam Penghargaan', ranking: 'Piagam Prestasi', kelulusan: 'Sertifikat Kelulusan',
  teladan: 'Piagam Siswa Teladan', kehadiran: 'Piagam Kehadiran', peserta: 'Sertifikat Peserta', lainnya: 'Piagam Penghargaan',
};
const KODE_JENIS: Record<string, string> = { tahfidz: 'THF', lomba: 'LMB', ranking: 'RKL', kelulusan: 'LLS', teladan: 'TLD', kehadiran: 'HDR', peserta: 'PST', lainnya: 'PGH' };
export const labelJenis = (j: unknown): string => JENIS_PENGHARGAAN.find(([k]) => k === j)?.[1] ?? 'Penghargaan';

const teks = (d: Record<string, unknown>, k: string) => (typeof d[k] === 'string' ? (d[k] as string).replace(/\s+/g, ' ').trim() : '');

/** Kalimat penghargaan — terisi otomatis dari jenis dan isian; bidang `kalimat` menimpanya bila diisi. */
export function kalimatPenghargaan(d: Record<string, unknown>): string {
  if (teks(d, 'kalimat')) return teks(d, 'kalimat');
  const capaian = teks(d, 'capaian'), predikat = teks(d, 'predikat'), kegiatan = teks(d, 'kegiatan'), tahun = teks(d, 'tahun');
  const th = tahun ? ` ${/^\d{4}\/\d{4}$/.test(tahun) ? `Tahun Pelajaran ${tahun}` : tahun}` : '';
  const pred = predikat ? ` dengan predikat ${predikat}` : '';
  const pada = kegiatan ? ` pada ${kegiatan}` : '';
  switch (teks(d, 'jenis')) {
    case 'tahfidz': return `atas keberhasilannya menyelesaikan hafalan ${capaian || 'Al-Qur’an'}${pred}${kegiatan ? pada : ' pada ujian tahfidz'}${th}.`;
    case 'lomba': return `sebagai ${predikat || 'Juara'} ${capaian}${pada}${th}.`.replace(/\s+/g, ' ');
    case 'ranking': return `atas prestasinya meraih ${capaian || 'peringkat terbaik di kelas'}${kegiatan ? ` ${kegiatan}` : ''}${th}.`;
    case 'kelulusan': return `telah menyelesaikan pendidikan ${capaian}${pred}${th} dan dinyatakan LULUS.`.replace(/\s+/g, ' ');
    case 'teladan': return `sebagai ${capaian || 'Siswa Teladan'}${kegiatan ? ` ${kegiatan}` : ''}${th}.`;
    case 'kehadiran': return `atas kehadiran sempurna ${capaian}${kegiatan ? ` ${kegiatan}` : ''}${th}.`.replace(/\s+/g, ' ');
    case 'peserta': return `telah mengikuti ${kegiatan || capaian}${capaian && kegiatan ? ` sebagai ${capaian}` : ''}${th}.`;
    default: return `atas ${capaian || 'prestasi dan dedikasinya'}${pada}${pred}${th}.`;
  }
}

/* ── kwitansi ───────────────────────────────────────────────────────────── */

export const UNTUK_KWITANSI: [string, string][] = [
  ['spp', 'SPP / syahriah'], ['pendaftaran', 'Pendaftaran murid baru'], ['daftar-ulang', 'Daftar ulang'], ['seragam', 'Seragam'], ['buku', 'Buku & alat tulis'],
  ['kegiatan', 'Kegiatan / study tour'], ['ujian', 'Ujian / evaluasi'], ['infaq', 'Infaq & sedekah'], ['zakat', 'Zakat'], ['wakaf', 'Wakaf'], ['lainnya', 'Lainnya'],
];
export const METODE_BAYAR: [string, string][] = [['tunai', 'Tunai'], ['transfer', 'Transfer bank'], ['qris', 'QRIS'], ['lainnya', 'Lainnya']];
export const labelUntuk = (k: unknown): string => UNTUK_KWITANSI.find(([a]) => a === k)?.[1] ?? 'Pembayaran';
export const labelMetode = (k: unknown): string => METODE_BAYAR.find(([a]) => a === k)?.[1] ?? 'Tunai';

/* ── kop surat ──────────────────────────────────────────────────────────── */

export const GAYA_KOP: [string, string][] = [['tengah', 'Logo kiri, teks di tengah'], ['kiri', 'Logo kiri, teks rata kiri'], ['dua', 'Dua logo (kiri & kanan)'], ['pita', 'Pita berwarna penuh'], ['islami', 'Bingkai islami dengan nama Arab']];
export const WARNA_KOP: [string, string][] = [['zamrud', 'Zamrud & emas'], ['safir', 'Biru safir'], ['marun', 'Marun'], ['arang', 'Hitam elegan']];

export interface Kop {
  logo?: string;
  logoKanan?: string;
  /** Nama induk (yayasan) di baris atas; kosong untuk kop yayasan sendiri. */
  induk: string;
  nama: string;
  arab?: string;
  ket?: string;
  nsm?: string;
  alamat: string;
  kontak: string;
  gaya: string;
  warna: string;
  /** Kota untuk „Sukakarya, 15 November 2026“. */
  kota: string;
}

const kontakTeks = (k?: Kontak) => [k?.telepon && `Telp. ${k.telepon}`, k?.wa && `WA ${k.wa}`, k?.email].filter(Boolean).join(' · ');
const alamatSitus = (s: Situs) => tulisAlamat(rinciSitus(s.alamat), { singkat: false });

/** Kop dari profil (tanpa kop tersimpan): lembaga memakai nama yayasan sebagai induk; yayasan memakai namanya sendiri. */
export function kopDariProfil(u: Unit | null, s: Situs): Kop {
  const kota = s.alamat.kecamatan || s.alamat.kabupaten || 'Sukakarya';
  if (!u) return { induk: '', nama: s.nama.toUpperCase(), ket: s.singkatan ? `(${s.singkatan})` : undefined, alamat: alamatSitus(s), kontak: kontakTeks(s.kontak) || 'yapida.sch.id', gaya: 'tengah', warna: 'zamrud', kota };
  return { induk: s.nama.toUpperCase(), nama: u.nama.toUpperCase(), ket: u.jenis, nsm: u.nsm ? `${labelStatistik(u).split(' (')[0]}: ${u.nsm}` : undefined, alamat: (u.alamatRinci ? tulisAlamat(u.alamatRinci, { singkat: false }) : u.alamat) || alamatSitus(s), kontak: kontakTeks(u.kontak) || kontakTeks(s.kontak) || 'yapida.sch.id', gaya: 'tengah', warna: 'zamrud', kota };
}

/** Kop dari dokumen koleksi `kop`; bidang kosong diambil dari kop profil. */
export function kopDariDok(d: Pick<Dok, 'judul' | 'd'>, dasar: Kop): Kop {
  const t = (k: string) => teks(d.d, k);
  return {
    ...dasar, nama: d.judul.toUpperCase(), induk: t('induk') || dasar.induk, arab: t('arab') || undefined, ket: t('ket') || dasar.ket, nsm: t('nsm') || dasar.nsm,
    alamat: t('alamat') || dasar.alamat, kontak: t('kontak') || dasar.kontak, gaya: GAYA_KOP.some(([k]) => k === t('gaya')) ? t('gaya') : 'tengah',
    warna: WARNA_KOP.some(([k]) => k === t('warna')) ? t('warna') : 'zamrud', logo: t('logo') || undefined, logoKanan: t('logoKanan') || undefined, kota: t('kota') || dasar.kota,
  };
}

/** Kop yang dipakai dokumen lembaga ini: kop tersimpan yang ditandai utama (atau yang pertama tayang), kalau tidak ada → profil. */
export async function kopUntuk(store: Store, unit: string, s: Situs, u: Unit | null): Promise<Kop> {
  const dasar = kopDariProfil(unit === 'yayasan' ? null : u, s);
  const tersimpan = await daftar(store, 'kop', { unit, status: 'tayang', limit: 20 });
  const pilih = tersimpan.find((it) => it.x?.utama === true) ?? tersimpan[0];
  if (!pilih) return dasar;
  const d = await ambil(store, 'kop', pilih.id);
  return d ? kopDariDok(d, dasar) : dasar;
}

/* ── nomor otomatis ─────────────────────────────────────────────────────── */

/** Kode lembaga untuk nomor: mi-al-huda → MI, al-huda-mart → MART, yayasan → YAPIDA. */
export const kodeUnit = (slug: string): string => (slug === 'yayasan' ? 'YAPIDA' : slug.split('-').filter((t) => t && t !== 'al' && t !== 'huda').join('').toUpperCase().slice(0, 8) || 'LBG');

const WIB = 7 * 3600_000;
export function formatNomor(kol: string, n: number, unit: string, d: Record<string, unknown>, now: number): string {
  const t = new Date(now + WIB);
  const tahun = t.getUTCFullYear();
  const bulan = bulanRomawi(t.getUTCMonth());
  const u = kodeUnit(unit);
  if (kol === 'kwitansi') return `KW/${u}/${tahun}/${String(n).padStart(4, '0')}`;
  if (kol === 'penghargaan') return `${String(n).padStart(3, '0')}/${KODE_JENIS[teks(d, 'jenis')] ?? 'PGH'}/${u}/${bulan}/${tahun}`;
  return `${String(n).padStart(3, '0')}/${u}/${bulan}/${tahun}`;
}

/**
 * Nomor urut berikutnya per koleksi, lembaga, dan tahun. Setiap nomor adalah objek create-once
 * (`u/nomor/<kol>/<unit>/<tahun>/<n>`), jadi dua penyimpanan bersamaan tidak pernah mendapat nomor yang sama;
 * `k/nomor/…` hanya petunjuk awal pencarian.
 */
export async function nomorBerikut(store: Store, kol: string, unit: string, d: Record<string, unknown>, now = Date.now()): Promise<string> {
  const tahun = new Date(now + WIB).getUTCFullYear();
  const petunjuk = `k/nomor/${kol}-${unit}-${tahun}.json`;
  const awal = (await store.get<{ n: number }>(petunjuk))?.n ?? 0;
  for (let n = awal + 1; n < awal + 500; n += 1) {
    if (await store.createOnce(`u/nomor/${kol}/${unit}/${tahun}/${n}`, { at: now })) {
      await store.put(petunjuk, { n });
      return formatNomor(kol, n, unit, d, now);
    }
  }
  throw new Error('Nomor otomatis tidak bisa dibuat — coba lagi.');
}
