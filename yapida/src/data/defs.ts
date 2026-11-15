/** Definisi koleksi isi. Formulir portal, pemeriksaan isian, ringkasan indeks, dan halaman publik dibangkitkan dari sini. */
import type { Bidang, Koleksi } from './koleksi.ts';
import { PERAN } from './users.ts';
import { RAK } from './buku.ts';
import { GAYA_KOP, JENIS_PENGHARGAAN, METODE_BAYAR, PILIHAN_DESAIN, UNTUK_KWITANSI, WARNA_KOP } from './dokumen.ts';

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

/* ── dokumen lembaga (perintah 13 & 17): kop surat, sertifikat & piagam, kwitansi, surat ─────────────────── */

const TTD: Bidang[] = [
  { k: 'ttd1Nama', label: 'Penanda tangan kanan — nama', jenis: 'teks', maks: 80, bantuan: 'Biasanya kepala lembaga. Terisi otomatis dari profil lembaga.' },
  { k: 'ttd1Jabatan', label: 'Penanda tangan kanan — jabatan', jenis: 'teks', maks: 80 },
  { k: 'ttd2Nama', label: 'Penanda tangan kiri — nama (opsional)', jenis: 'teks', maks: 80, bantuan: 'Mis. wali kelas, pembimbing tahfidz, atau ketua panitia. Kosongkan bila hanya satu tanda tangan.' },
  { k: 'ttd2Jabatan', label: 'Penanda tangan kiri — jabatan', jenis: 'teks', maks: 80 },
];

export const PENGHARGAAN: Koleksi = {
  // Pemilik: „Setiap penghargaan siswa wajib di expose di publik“ — yang berstatus Tayang selalu tampil di /prestasi.
  id: 'penghargaan', nama: 'Sertifikat & piagam', satu: 'sertifikat', labelJudul: 'Nama penerima', urut: 'baru', sampul: 'foto', ringkasDari: 'capaian',
  tingkat: PERAN.lembaga.tingkat, cetak: 'a4l', nomorOtomatis: 'nomor', menu: 'dokumen',
  bidang: [
    { k: 'jenis', label: 'Jenis penghargaan', jenis: 'pilih', pilihan: JENIS_PENGHARGAAN, wajib: true, indeks: true },
    { k: 'nisn', label: 'NISN penerima', jenis: 'teks', maks: 20, indeks: true, bantuan: 'Isi NISN (atau NIS untuk RA) siswa — penghargaan langsung muncul di portal siswanya. Tidak pernah ditampilkan di halaman publik.' },
    { k: 'desain', label: 'Desain', jenis: 'pilih', pilihan: PILIHAN_DESAIN, wajib: true, indeks: true, bantuan: '12 desain siap cetak — lihat pratinjau di samping saat memilih.' },
    { k: 'capaian', label: 'Capaian', jenis: 'teks', maks: 140, wajib: true, indeks: true, bantuan: 'Mis. „Juz 30 (An-Naba’ – An-Nas)“, „Lomba Adzan tingkat Kecamatan Sukakarya“, „Peringkat 1 Kelas 5“.' },
    { k: 'predikat', label: 'Predikat / juara', jenis: 'teks', maks: 60, indeks: true, bantuan: 'Mis. „Mumtaz“, „Juara 1“, „Sangat Baik“.' },
    { k: 'kegiatan', label: 'Kegiatan / acara', jenis: 'teks', maks: 140, bantuan: 'Mis. „Wisuda Tahfidz ke-5“, „Semester Ganjil“, „MTQ Pelajar Kab. Bekasi“.' },
    { k: 'kelas', label: 'Kelas', jenis: 'teks', maks: 40, indeks: true },
    { k: 'tahun', label: 'Tahun pelajaran', jenis: 'teks', maks: 20, indeks: true, bantuan: 'Mis. 2026/2027.' },
    { k: 'foto', label: 'Foto penerima', jenis: 'gambar', bantuan: 'Foto wajah tegak, akan tampil di sertifikat dan di menu Prestasi.' },
    ...TTD,
    { k: 'tempat', label: 'Tempat penerbitan', jenis: 'teks', maks: 60, bantuan: 'Kosongkan untuk memakai kota pada kop.' },
    { k: 'nomor', label: 'Nomor sertifikat', jenis: 'teks', maks: 80, indeks: true, bantuan: 'Kosongkan — nomor dibuat otomatis saat disimpan.' },
    { k: 'judulSertifikat', label: 'Judul sertifikat (opsional)', jenis: 'teks', maks: 80, bantuan: 'Kosongkan untuk judul otomatis sesuai jenis (mis. „Sertifikat Tahfidz Al-Qur’an“).' },
    { k: 'kalimat', label: 'Kalimat penghargaan (opsional)', jenis: 'paragraf', maks: 400, bantuan: 'Kosongkan — kalimat disusun otomatis dari jenis, capaian, predikat, kegiatan, dan tahun.' },
  ],
};

export const KWITANSI: Koleksi = {
  id: 'kwitansi', nama: 'Kwitansi pembayaran', satu: 'kwitansi', labelJudul: 'Diterima dari (nama pembayar)', urut: 'baru', ringkasDari: 'keterangan',
  tingkat: PERAN.lembaga.tingkat, tanpaPublik: true, cetak: 'a4p', nomorOtomatis: 'nomor', menu: 'dokumen',
  bidang: [
    { k: 'untuk', label: 'Untuk pembayaran', jenis: 'pilih', pilihan: UNTUK_KWITANSI, wajib: true, indeks: true },
    { k: 'keterangan', label: 'Keterangan / periode', jenis: 'teks', maks: 140, indeks: true, bantuan: 'Mis. „SPP bulan November 2026“ atau „Daftar ulang kelas 4“.' },
    { k: 'jumlah', label: 'Jumlah (rupiah)', jenis: 'angka', wajib: true, indeks: true, bantuan: 'Angka saja, mis. 150000 — terbilang ditulis otomatis.' },
    { k: 'kelas', label: 'Murid / kelas (opsional)', jenis: 'teks', maks: 80, indeks: true, bantuan: 'Mis. „Ahmad Fauzan — Kelas 3B“ bila pembayarnya wali murid.' },
    { k: 'metode', label: 'Cara bayar', jenis: 'pilih', pilihan: METODE_BAYAR, wajib: true, indeks: true },
    { k: 'lunas', label: 'Lunas', jenis: 'centang', indeks: true },
    { k: 'penerima', label: 'Nama penerima', jenis: 'teks', maks: 80, bantuan: 'Bendahara atau petugas yang menerima.' },
    { k: 'jabatanPenerima', label: 'Jabatan penerima', jenis: 'teks', maks: 60 },
    { k: 'tempat', label: 'Tempat', jenis: 'teks', maks: 60, bantuan: 'Kosongkan untuk memakai kota pada kop.' },
    { k: 'nomor', label: 'Nomor kwitansi', jenis: 'teks', maks: 60, indeks: true, bantuan: 'Kosongkan — nomor dibuat otomatis saat disimpan (urut per lembaga per tahun).' },
    { k: 'catatan', label: 'Catatan (opsional)', jenis: 'paragraf', maks: 300 },
  ],
};

export const SURAT: Koleksi = {
  id: 'surat', nama: 'Surat berkop', satu: 'surat', labelJudul: 'Perihal', urut: 'baru', ringkasDari: 'kepada',
  tingkat: PERAN.lembaga.tingkat, tanpaPublik: true, cetak: 'a4p', nomorOtomatis: 'nomor', menu: 'dokumen',
  bidang: [
    { k: 'nomor', label: 'Nomor surat', jenis: 'teks', maks: 80, indeks: true, bantuan: 'Kosongkan — nomor dibuat otomatis (urut/LEMBAGA/bulan Romawi/tahun).' },
    { k: 'lampiran', label: 'Lampiran', jenis: 'teks', maks: 60 },
    { k: 'kepada', label: 'Kepada', jenis: 'paragraf', maks: 400, wajib: true, bantuan: 'Mis. „Yth. Bapak/Ibu Wali Murid Kelas 6\ndi Tempat“.' },
    { k: 'isi', label: 'Isi surat', jenis: 'markdown', wajib: true, maks: 20_000 },
    { k: 'ttdNama', label: 'Penanda tangan — nama', jenis: 'teks', maks: 80, wajib: true },
    { k: 'ttdJabatan', label: 'Penanda tangan — jabatan', jenis: 'teks', maks: 80 },
    { k: 'tembusan', label: 'Tembusan (opsional)', jenis: 'daftar' },
    { k: 'tempat', label: 'Tempat', jenis: 'teks', maks: 60, bantuan: 'Kosongkan untuk memakai kota pada kop.' },
  ],
};

export const KOP: Koleksi = {
  id: 'kop', nama: 'Kop surat', satu: 'kop surat', labelJudul: 'Nama lembaga pada kop', urut: 'judul', tanpaTanggal: true, sampul: 'logo', ringkasDari: 'alamat',
  tingkat: PERAN.lembaga.tingkat, tanpaPublik: true, cetak: 'a4p', menu: 'dokumen',
  bidang: [
    { k: 'induk', label: 'Nama induk (baris atas)', jenis: 'teks', maks: 120, bantuan: 'Mis. „YAYASAN AL-HUDA YAPIDA“. Kosongkan untuk kop yayasan sendiri.' },
    { k: 'arab', label: 'Nama Arab (opsional)', jenis: 'teks', maks: 120 },
    { k: 'ket', label: 'Keterangan', jenis: 'teks', maks: 140, bantuan: 'Mis. „Terakreditasi A“ atau jenis lembaga.' },
    { k: 'nsm', label: 'NSM / NPSN / izin operasional', jenis: 'teks', maks: 120 },
    { k: 'alamat', label: 'Alamat', jenis: 'paragraf', maks: 240, wajib: true },
    { k: 'kontak', label: 'Kontak', jenis: 'teks', maks: 160, bantuan: 'Telepon, WhatsApp, surel, situs — dalam satu baris.' },
    { k: 'kota', label: 'Kota untuk tanggal surat', jenis: 'teks', maks: 40, bantuan: 'Mis. „Sukakarya“ → „Sukakarya, 15 November 2026“.' },
    { k: 'logo', label: 'Logo kiri', jenis: 'gambar' },
    { k: 'logoKanan', label: 'Logo kanan (opsional)', jenis: 'gambar', bantuan: 'Mis. logo Kemenag atau Tut Wuri Handayani.' },
    { k: 'gaya', label: 'Gaya tata letak', jenis: 'pilih', pilihan: GAYA_KOP, wajib: true, indeks: true },
    { k: 'warna', label: 'Warna', jenis: 'pilih', pilihan: WARNA_KOP, wajib: true, indeks: true },
    { k: 'utama', label: 'Jadikan kop utama lembaga ini', jenis: 'centang', indeks: true, bantuan: 'Kop utama dipakai otomatis oleh surat, sertifikat, dan kwitansi lembaga ini.' },
  ],
};

export const KOLEKSI: Record<string, Koleksi> = { sdm: SDM, kabar: KABAR, galeri: GALERI, video: VIDEO, agenda: AGENDA, dokumen: DOKUMEN, karya: KARYA, buku: BUKU, ppdb: PPDB, pendaftar: PENDAFTAR, pesan: PESAN, penghargaan: PENGHARGAAN, kwitansi: KWITANSI, surat: SURAT, kop: KOP };
export const koleksi = (id: string): Koleksi | null => KOLEKSI[id] ?? null;
