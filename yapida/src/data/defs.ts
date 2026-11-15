/** Definisi koleksi isi. Formulir portal, pemeriksaan isian, ringkasan indeks, dan halaman publik dibangkitkan dari sini. */
import type { Koleksi } from './koleksi.ts';
import { PERAN } from './users.ts';
import { RAK } from './buku.ts';

export const GOLONGAN: [string, string][] = [
  ['pendiri', 'Pendiri'], ['pembina', 'Pembina'], ['pengurus', 'Pengurus'], ['pengawas', 'Pengawas'],
  ['pimpinan', 'Pimpinan lembaga'], ['guru', 'Guru / ustadz / ustadzah'], ['staf', 'Staf & tenaga kependidikan'],
];
export const NAMA_GOLONGAN: Record<string, string> = Object.fromEntries(GOLONGAN);

export const SDM: Koleksi = {
  id: 'sdm', nama: 'Struktur & SDM', satu: 'orang', labelJudul: 'Nama lengkap (dengan gelar)', urut: 'nomor', tanpaTanggal: true, sampul: 'foto', ringkasDari: 'bio',
  tingkat: PERAN.lembaga.tingkat,
  bidang: [
    { k: 'golongan', label: 'Kelompok', jenis: 'pilih', pilihan: GOLONGAN, wajib: true, indeks: true, bantuan: 'Menentukan di bagian mana orang ini tampil pada struktur.' },
    { k: 'jabatan', label: 'Jabatan', jenis: 'teks', wajib: true, maks: 120, indeks: true, bantuan: 'Mis. Kepala Madrasah, Wali Kelas 3, Guru Fikih, Bendahara.' },
    { k: 'bidang', label: 'Mata pelajaran / bidang tugas', jenis: 'teks', maks: 100, indeks: true },
    { k: 'foto', label: 'Foto', jenis: 'gambar', bantuan: 'Foto setengah badan, wajah terlihat jelas. Dikecilkan otomatis sebelum diunggah.' },
    { k: 'urut', label: 'Nomor urut tampil', jenis: 'angka', bantuan: 'Angka kecil tampil lebih dulu (mis. kepala = 1).' },
    { k: 'pendidikan', label: 'Pendidikan terakhir', jenis: 'teks', maks: 120 },
    { k: 'bio', label: 'Riwayat singkat', jenis: 'markdown', maks: 8000, bantuan: 'Pendidikan, pengabdian, atau kata pengantar singkat. Boleh dikosongkan.' },
  ],
};

export const KABAR: Koleksi = {
  id: 'kabar', nama: 'Kabar & kegiatan', satu: 'kabar', labelJudul: 'Judul', urut: 'baru', sampul: 'sampul', ringkasDari: 'ringkasan',
  bidang: [
    { k: 'kategori', label: 'Kategori', jenis: 'pilih', indeks: true, pilihan: [['kegiatan', 'Kegiatan'], ['prestasi', 'Prestasi'], ['pengumuman', 'Pengumuman'], ['artikel', 'Artikel & kajian']], wajib: true },
    { k: 'sampul', label: 'Foto sampul', jenis: 'gambar' },
    { k: 'ringkasan', label: 'Ringkasan', jenis: 'paragraf', maks: 280, wajib: true, bantuan: 'Satu-dua kalimat untuk kartu kabar dan mesin pencari.' },
    { k: 'isi', label: 'Isi', jenis: 'markdown', wajib: true },
  ],
};

export const GALERI: Koleksi = {
  id: 'galeri', nama: 'Galeri foto', satu: 'album', labelJudul: 'Judul album', urut: 'baru', sampul: 'foto', ringkasDari: 'ket',
  bidang: [
    { k: 'foto', label: 'Foto kegiatan', jenis: 'galeri', wajib: true, bantuan: 'Pilih banyak foto sekaligus. Seret untuk mengurutkan, ketuk untuk memberi keterangan.' },
    { k: 'tempat', label: 'Tempat', jenis: 'teks', maks: 120 },
    { k: 'ket', label: 'Keterangan', jenis: 'paragraf', maks: 600 },
  ],
};

export const VIDEO: Koleksi = {
  id: 'video', nama: 'Video & siaran langsung', satu: 'video', labelJudul: 'Judul video', urut: 'baru', ringkasDari: 'ket',
  bidang: [
    { k: 'url', label: 'Tautan video', jenis: 'url', wajib: true, indeks: true, bantuan: 'Tempel tautan YouTube, Facebook, atau TikTok — termasuk tautan siaran langsung.' },
    { k: 'jenis', label: 'Jenis', jenis: 'pilih', indeks: true, pilihan: [['video', 'Video kegiatan'], ['live', 'Siaran langsung']], wajib: true },
    { k: 'mulai', label: 'Jadwal siaran (untuk siaran langsung)', jenis: 'waktu', indeks: true },
    { k: 'ket', label: 'Keterangan', jenis: 'paragraf', maks: 600 },
  ],
};

export const AGENDA: Koleksi = {
  id: 'agenda', nama: 'Agenda', satu: 'agenda', labelJudul: 'Nama kegiatan', urut: 'baru', sampul: 'sampul', ringkasDari: 'ket',
  bidang: [
    { k: 'jam', label: 'Jam', jenis: 'teks', maks: 40, indeks: true, bantuan: 'Mis. 08.00–11.00 WIB. Tanggal kegiatan diisi pada kolom Tanggal di atas.' },
    { k: 'tempat', label: 'Tempat', jenis: 'teks', maks: 120, indeks: true },
    { k: 'sampul', label: 'Pamflet / foto', jenis: 'gambar' },
    { k: 'ket', label: 'Keterangan', jenis: 'markdown', maks: 6000 },
  ],
};

export const DOKUMEN: Koleksi = {
  id: 'dokumen', nama: 'Dokumen publik', satu: 'dokumen', labelJudul: 'Nama dokumen', urut: 'baru', ringkasDari: 'ket',
  tingkat: PERAN.lembaga.tingkat,
  bidang: [
    { k: 'berkas', label: 'Berkas PDF', jenis: 'berkas', wajib: true, indeks: true, bantuan: 'PDF sampai 25 MB. Hanya dokumen yang memang boleh dibaca umum.' },
    { k: 'jenis', label: 'Jenis', jenis: 'pilih', indeks: true, pilihan: [['legalitas', 'Legalitas & perizinan'], ['akreditasi', 'Akreditasi'], ['brosur', 'Brosur & profil'], ['laporan', 'Laporan'], ['kurikulum', 'Kurikulum & kalender'], ['lainnya', 'Lainnya']], wajib: true },
    { k: 'ket', label: 'Keterangan', jenis: 'paragraf', maks: 500 },
  ],
};

export const KARYA: Koleksi = {
  id: 'karya', nama: 'Karya tulis', satu: 'karya', labelJudul: 'Judul karya', urut: 'baru', sampul: 'sampul', ringkasDari: 'isi',
  bidang: [
    { k: 'penulis', label: 'Nama penulis', jenis: 'teks', wajib: true, maks: 100, indeks: true, bantuan: 'Nama santri, siswa, guru, atau lembaga.' },
    { k: 'kelas', label: 'Kelas / jabatan penulis', jenis: 'teks', maks: 60, indeks: true },
    { k: 'jenis', label: 'Jenis', jenis: 'pilih', indeks: true, pilihan: [['cerpen', 'Cerpen'], ['puisi', 'Puisi'], ['artikel', 'Artikel'], ['esai', 'Esai & opini'], ['laporan', 'Laporan kegiatan'], ['kajian', 'Kajian'], ['lainnya', 'Lainnya']], wajib: true },
    { k: 'sampul', label: 'Gambar', jenis: 'gambar' },
    { k: 'isi', label: 'Isi karya', jenis: 'markdown', wajib: true, bantuan: 'Baris berbahasa Arab otomatis dibacakan dengan suara Arab; awali baris dengan ::en untuk bahasa Inggris.' },
  ],
};

export const PPDB: Koleksi = {
  id: 'ppdb', nama: 'Penerimaan murid baru', satu: 'gelombang PPDB', labelJudul: 'Judul (mis. PPDB MI Al Huda 2027/2028)', urut: 'baru', sampul: 'sampul', ringkasDari: 'ringkasan',
  tingkat: PERAN.lembaga.tingkat,
  bidang: [
    { k: 'tahun', label: 'Tahun ajaran', jenis: 'teks', wajib: true, maks: 20, indeks: true, bantuan: 'Mis. 2027/2028.' },
    { k: 'buka', label: 'Pendaftaran dibuka', jenis: 'tanggal', wajib: true, indeks: true },
    { k: 'tutup', label: 'Pendaftaran ditutup', jenis: 'tanggal', wajib: true, indeks: true },
    { k: 'kuota', label: 'Kuota', jenis: 'angka', indeks: true },
    { k: 'formulir', label: 'Terima pendaftaran daring di situs', jenis: 'centang', indeks: true },
    { k: 'sampul', label: 'Pamflet / foto', jenis: 'gambar' },
    { k: 'ringkasan', label: 'Ringkasan', jenis: 'paragraf', maks: 280, wajib: true },
    { k: 'syarat', label: 'Persyaratan', jenis: 'daftar', bantuan: 'Satu syarat per baris.' },
    { k: 'alur', label: 'Alur pendaftaran', jenis: 'daftar', bantuan: 'Satu langkah per baris.' },
    { k: 'biaya', label: 'Biaya', jenis: 'markdown', maks: 4000 },
    { k: 'info', label: 'Informasi lain', jenis: 'markdown', maks: 8000 },
    { k: 'brosur', label: 'Brosur (PDF)', jenis: 'berkas' },
    { k: 'kontak', label: 'Narahubung', jenis: 'teks', maks: 120, bantuan: 'Nama dan nomor WhatsApp panitia.' },
  ],
};

export const TAHAP: [string, string][] = [['baru', 'Baru masuk'], ['diverifikasi', 'Berkas diverifikasi'], ['diterima', 'Diterima'], ['cadangan', 'Cadangan'], ['ditolak', 'Tidak diterima']];

export const PENDAFTAR: Koleksi = {
  id: 'pendaftar', nama: 'Pendaftar PPDB', satu: 'pendaftar', labelJudul: 'Nama lengkap calon murid', urut: 'baru', privat: true, tingkat: PERAN.lembaga.tingkat,
  bidang: [
    { k: 'tahap', label: 'Tahap', jenis: 'pilih', pilihan: TAHAP, wajib: true, indeks: true },
    { k: 'ppdb', label: 'Gelombang', jenis: 'teks', maks: 160, indeks: true },
    { k: 'kelamin', label: 'Jenis kelamin', jenis: 'pilih', pilihan: [['L', 'Laki-laki'], ['P', 'Perempuan']], wajib: true, indeks: true },
    { k: 'tempatLahir', label: 'Tempat lahir', jenis: 'teks', maks: 80, wajib: true },
    { k: 'tanggalLahir', label: 'Tanggal lahir', jenis: 'tanggal', wajib: true },
    { k: 'asal', label: 'Asal sekolah', jenis: 'teks', maks: 120 },
    { k: 'wali', label: 'Nama orang tua / wali', jenis: 'teks', maks: 100, wajib: true, indeks: true },
    { k: 'telepon', label: 'Nomor WhatsApp orang tua', jenis: 'teks', maks: 20, wajib: true, indeks: true },
    { k: 'alamat', label: 'Alamat', jenis: 'paragraf', maks: 400, wajib: true },
    { k: 'catatan', label: 'Catatan', jenis: 'paragraf', maks: 1000 },
  ],
};

export const PESAN: Koleksi = {
  id: 'pesan', nama: 'Pesan masuk', satu: 'pesan', labelJudul: 'Nama pengirim', urut: 'baru', privat: true, tingkat: PERAN.lembaga.tingkat, ringkasDari: 'isi',
  bidang: [
    { k: 'kontak', label: 'Kontak pengirim', jenis: 'teks', maks: 120, wajib: true, indeks: true },
    { k: 'isi', label: 'Isi pesan', jenis: 'paragraf', maks: 3000, wajib: true },
  ],
};

const PILIH_RAK: [string, string][] = RAK.map((r) => [r.id, r.nama]);

/** Buku perpustakaan tulisan lembaga (§5). Isi ditulis dengan naskah sederhana sehingga bisa dibacakan per bahasa. */
export const BUKU: Koleksi = {
  id: 'buku', nama: 'Perpustakaan', satu: 'buku', labelJudul: 'Judul buku', urut: 'judul', tanpaTanggal: true, sampul: 'sampul', ringkasDari: 'ringkasan',
  bidang: [
    { k: 'penulis', label: 'Penulis / penyusun', jenis: 'teks', wajib: true, maks: 120, indeks: true },
    { k: 'rak', label: 'Rak', jenis: 'pilih', pilihan: PILIH_RAK, wajib: true, indeks: true, bantuan: 'Rak utama tempat buku ini dipajang di perpustakaan.' },
    { k: 'rak2', label: 'Rak tambahan (opsional)', jenis: 'pilih', pilihan: [['', '— tidak ada —'], ...PILIH_RAK], indeks: true },
    { k: 'kelas', label: 'Kelas', jenis: 'kelas', indeks: true, bantuan: 'Kosongkan bila untuk semua kelas.' },
    { k: 'mapel', label: 'Mata pelajaran / program', jenis: 'teks', maks: 80, indeks: true, bantuan: 'Mis. Fikih, Bahasa Arab, Tahfidz, Literasi.' },
    { k: 'suara', label: 'Suara pembaca', jenis: 'pilih', wajib: true, indeks: true, pilihan: [['balita', 'Ceria — RA / TK'], ['anak', 'Anak — MI / TPQ'], ['remaja', 'Remaja — MTs / pesantren'], ['dewasa', 'Dewasa — guru, kajian, umum']] },
    { k: 'bahasa', label: 'Bahasa utama', jenis: 'pilih', indeks: true, pilihan: [['id', 'Indonesia'], ['ar', 'Arab'], ['en', 'Inggris']] },
    { k: 'judulAr', label: 'Judul Arab (opsional)', jenis: 'teks', maks: 120 },
    { k: 'sampul', label: 'Sampul (opsional)', jenis: 'gambar', bantuan: 'Tanpa gambar, sampul berornamen dibuat otomatis dari judulnya.' },
    { k: 'ringkasan', label: 'Ringkasan', jenis: 'paragraf', wajib: true, maks: 400 },
    {
      k: 'naskah', label: 'Isi buku', jenis: 'markdown', maks: 400_000,
      bantuan: '„## Judul bab“ memulai bab baru · „### Judul“ judul kecil · paragraf beraksara Arab otomatis dibacakan dengan suara Arab · awali baris dengan „::en “ untuk bahasa Inggris, „::tr “ untuk terjemah, „::lt “ untuk tulisan latin (tidak dibacakan), „::cat “ untuk catatan/sumber · aktivitas: „::kuis Tanya? | *benar | salah“, „::kartu depan | belakang“, „::cocok a = b ; c = d“, „::urut Perintah | kejadian 1 ;; kejadian 2 ;; kejadian 3“, „::adegan padi | keterangan“ (gambar interaktif: padi, hujan, langit, masjid, kebun, buah, laut, gurun, gunung, rumah, sholat, huruf). Buku anak yang belum diberi permainan otomatis mendapat adegan dan „Ayo Bermain!“ dari isi babnya.',
    },
    { k: 'sumber', label: 'Sumber', jenis: 'teks', maks: 200, bantuan: 'Mis. „Disusun guru MI Al Huda“ atau alamat sumber terbuka.' },
    { k: 'lisensi', label: 'Hak cipta', jenis: 'pilih', pilihan: [['milik', 'Karya lembaga sendiri'], ['cc-by-sa', 'CC BY-SA 4.0'], ['cc-by', 'CC BY 4.0'], ['pd', 'Domain publik']] },
  ],
};

export const KOLEKSI: Record<string, Koleksi> = { sdm: SDM, kabar: KABAR, galeri: GALERI, video: VIDEO, agenda: AGENDA, dokumen: DOKUMEN, karya: KARYA, buku: BUKU, ppdb: PPDB, pendaftar: PENDAFTAR, pesan: PESAN };
export const koleksi = (id: string): Koleksi | null => KOLEKSI[id] ?? null;
