/** Bentuk data situs. Semua dokumen tinggal di R2 (src/lib/store.ts) dan diubah lewat portal — tidak ada isi yang dikunci di kode. */

export type Kelompok = 'ibadah' | 'formal' | 'nonformal' | 'ekonomi' | 'sosial';

export const KELOMPOK: Record<Kelompok, { nama: string; ringkas: string; ikon: string }> = {
  ibadah: { nama: 'Sarana Ibadah', ringkas: 'Masjid dan musholla tempat jamaah, santri, dan warga beribadah serta mengaji.', ikon: 'kubah' },
  formal: { nama: 'Pendidikan Formal', ringkas: 'Jenjang berkesinambungan dari Raudhatul Athfal sampai pondok pesantren.', ikon: 'buku' },
  nonformal: { nama: 'Pendidikan Nonformal', ringkas: 'Mengaji Al-Qur’an, majelis ilmu, dan pelatihan keterampilan kerja.', ikon: 'pena' },
  ekonomi: { nama: 'Ekonomi', ringkas: 'Usaha dan keuangan syariah untuk kemandirian yayasan dan warga.', ikon: 'niaga' },
  sosial: { nama: 'Sosial', ringkas: 'Pengasuhan anak, santunan, dan pengelolaan zakat.', ikon: 'tangan' },
};
export const URUTAN_KELOMPOK: Kelompok[] = ['ibadah', 'formal', 'nonformal', 'ekonomi', 'sosial'];

/** Profil suara pembaca bersuara: menentukan nada dan kecepatan sesuai usia pembaca lembaga itu. */
export type Suara = 'balita' | 'anak' | 'remaja' | 'dewasa';

export interface Kontak {
  telepon?: string;
  wa?: string;
  email?: string;
}

export interface Sosmed {
  youtube?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  situs?: string;
}

export interface Unit {
  slug: string;
  nama: string;
  /** Nama pendek untuk menu dan kartu, mis. "MI Al Huda". */
  singkat: string;
  /** Kepanjangan jenis lembaga, mis. "Madrasah Ibtidaiyah Swasta". */
  jenis: string;
  kelompok: Kelompok;
  urut: number;
  /** Satu kalimat (≤ 180 huruf) untuk kartu dan meta description. */
  ringkas: string;
  /** Profil (Markdown) dan hasil rendernya. */
  profil: string;
  profilHtml?: string;
  sejarah?: string;
  sejarahHtml?: string;
  visi?: string;
  misi?: string[];
  kepala?: { nama: string; jabatan: string };
  berdiri?: string;
  pendiri?: string;
  /** Angka singkat, mis. { label: 'Santri', nilai: '153' }. */
  angka?: { label: string; nilai: string }[];
  program?: string[];
  /** Kelas/tingkat — dipakai rak pustaka dan bank soal lembaga ini. */
  kelas?: string[];
  fasilitas?: string[];
  jadwal?: string;
  kurikulum?: string;
  alamat?: string;
  kontak?: Kontak;
  sosmed?: Sosmed;
  /** ID kanal YouTube (UC…) untuk menarik video kegiatan otomatis. */
  ytKanal?: string;
  sampul?: string;
  suara: Suara;
  aktif: boolean;
  ubah: number;
}

/** Ringkasan lembaga di customMetadata — daftar lembaga terbaca dengan satu operasi list. */
export interface UnitRingkas {
  nama: string;
  singkat: string;
  jenis: string;
  kelompok: Kelompok;
  urut: number;
  ringkas: string;
  suara: Suara;
  aktif: boolean;
  sampul?: string;
}

export interface Organ {
  organ: 'Pembina' | 'Pengurus' | 'Pengawas';
  jabatan: string;
  nama: string;
}

export interface Rekening {
  bank: string;
  nomor: string;
  atasNama: string;
}

export interface Situs {
  nama: string;
  singkatan: string;
  /** Kalimat pembuka beranda. */
  slogan: string;
  deskripsi: string;
  alamat: { jalan: string; desa: string; kecamatan: string; kabupaten: string; provinsi: string; kodepos: string };
  kontak: Kontak;
  sosmed: Sosmed;
  legal: {
    akta: { nomor: string; tanggal: string; notaris: string };
    sk: { nomor: string; tanggal: string; tentang: string };
    daftar?: string;
    npwp?: string;
    kpp?: string;
  };
  pendiri: string[];
  organ: Organ[];
  organCatatan?: string;
  sejarah: string;
  sejarahHtml?: string;
  /** Tonggak sejarah untuk linimasa interaktif. */
  linimasa: { tahun: string; judul: string; isi: string }[];
  visi?: string;
  misi?: string[];
  sambutan?: { nama: string; jabatan: string; isi: string; isiHtml?: string };
  donasi: { tampil: boolean; rekening: Rekening[]; catatan?: string };
  ubah: number;
}

export interface Halaman {
  slug: string;
  judul: string;
  ringkas: string;
  isi: string;
  isiHtml: string;
  /** Tampil di kaki situs. */
  kaki: boolean;
  ubah: number;
}

export const unitRingkas = (u: Unit): UnitRingkas => ({
  nama: u.nama, singkat: u.singkat, jenis: u.jenis, kelompok: u.kelompok, urut: u.urut, ringkas: u.ringkas.slice(0, 180), suara: u.suara, aktif: u.aktif, sampul: u.sampul,
});
