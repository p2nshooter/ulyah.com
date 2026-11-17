/**
 * Tur interaktif (pemilik, 17 Nov 2026: „Masih berantakan bangat panduanya, kurang interaktif“): di setiap halaman
 * portal dan Portal Siswa, tombol „Tur“ menyorot tombol dan menu ASLI di halaman itu satu per satu (/assets/tur.js).
 * Halaman tanpa tur khusus memakai tur umum dari panduan menu itu (PANDUAN_PORTAL), jadi tidak ada halaman tanpa tur.
 * Elemen yang tidak tampil (mis. menu samping di ponsel yang tertutup) dibuka otomatis; yang tidak ada → kartu di tengah.
 * Isi tur hanya teks tetap dari kode ini — tidak memuat data pengguna.
 */
import { raw, type Raw } from '../lib/html.ts';
import { jangkarPanduan, PANDUAN_PORTAL } from './panduan.ts';

export interface LangkahTur {
  /** Pemilih CSS elemen yang disorot; kosong = kartu di tengah layar. */
  el?: string;
  /** Elemen ada di menu samping (di ponsel menu dibuka dulu). */
  sisi?: true;
  /** Hanya di layar sempit (hp, ≤ 900 px) atau lebar (pc). */
  hanya?: 'hp' | 'pc';
  judul: string;
  /** Teks; **tebal** didukung. */
  teks: string;
}
export interface Tur {
  id: string;
  judul: string;
  /** Bagian panduan yang ditandai „sudah dipelajari“ setelah tur selesai. */
  bagian?: string;
  /** Diputar sendiri sekali per perangkat. */
  otomatis?: boolean;
  langkah: LangkahTur[];
}

const menu = (href: string) => `.p-sisi nav a[href="${href}"]`;
const BANTU: LangkahTur = { el: '.p-bantu', judul: 'Butuh penjelasan lagi?', teks: 'Tombol **?** membuka panduan lengkap menu ini. Tombol **Tur** di sebelahnya memutar tur ini lagi kapan saja.' };

/** Tur khusus per alamat halaman portal. */
const KHUSUS: Record<string, Omit<Tur, 'id'>> = {
  '/portal': {
    judul: 'Tur dasbor', bagian: 'dasbor', otomatis: true,
    langkah: [
      { judul: 'Selamat datang di Portal Yapida 👋', teks: 'Tur singkat ini menunjukkan tombol-tombol penting di portal. Tekan **Lanjut** (atau tombol panah di keyboard). Tur bisa diulang kapan saja.' },
      { el: '.p-sambut', judul: 'Jalan pintas', teks: 'Pekerjaan yang paling sering — tulis kabar, unggah foto kegiatan, buat sertifikat — langsung dari kartu ini.' },
      { el: '.p-kisi-angka', judul: 'Ringkasan isi', teks: 'Jumlah isi setiap menu. Ketuk sebuah angka untuk membuka daftarnya.' },
      { el: '[data-sisi-buka]', hanya: 'hp', judul: 'Menu di ponsel', teks: 'Di ponsel, semua menu tersimpan di balik tombol **☰** ini.' },
      { el: '.p-sisi nav', sisi: true, judul: 'Semua menu portal', teks: 'Menu tersusun per kelompok: Isi, Pembelajaran, Kesiswaan, Dokumen & cetak, dan Akun. Yang tampil menyesuaikan peran akun Anda.' },
      { el: menu('/portal/pesan'), sisi: true, judul: 'Pesan', teks: 'Japri privat ke Super Admin, yayasan, atau lembaga lain, dan obrolan grup seluruh lembaga. Angka di samping menu = pesan belum dibaca.' },
      { el: menu('/portal/bank-soal'), sisi: true, judul: 'Bank soal', teks: 'Soal ujian PTS & PAS untuk guru, dan latihan Ganjil/Genap untuk siswa.' },
      { el: menu('/portal/akun'), sisi: true, judul: 'Ganti PIN', teks: 'Buat PIN pribadi Anda di sini. Jangan memakai tanggal lahir atau 12345.' },
      { el: menu('/portal/panduan'), sisi: true, judul: 'Panduan', teks: 'Semua menu dijelaskan langkah demi langkah, lengkap dengan tur langsung.' },
      { el: '.p-bantu', judul: 'Tombol bantuan ?', teks: 'Ada di setiap halaman portal: membuka panduan untuk menu yang sedang dibuka.' },
      { el: '[data-tur-mulai]', judul: 'Putar ulang tur', teks: 'Tombol **Tur** ada di setiap halaman dan menunjukkan cara memakai halaman itu. Selamat bekerja! 🌿' },
    ],
  },
  '/portal/panduan': {
    judul: 'Tur panduan', bagian: 'masuk',
    langkah: [
      { el: '.pd-mulai', judul: 'Panduan interaktif', teks: 'Lingkaran ini menunjukkan berapa menu yang sudah Anda pelajari. Tersimpan di perangkat ini.' },
      { el: '.pd-cari', judul: 'Cari cepat', teks: 'Ketik kata kunci, mis. **PIN**, **sertifikat**, atau **bagikan soal** — kartu yang cocok langsung tersaring.' },
      { el: '.pd-saring', judul: 'Saring per kelompok', teks: 'Pilih kelompok menu: Dasar, Isi situs, Pembelajaran, Kesiswaan, Dokumen, atau Pengaturan.' },
      { el: '.pd-kartu', judul: 'Kartu menu', teks: 'Ketuk **Pelajari** untuk membaca langkahnya satu per satu, atau **Tur langsung** untuk dibawa ke menunya dan ditunjukkan tombol-tombolnya.' },
      { el: '.pd-siswa', judul: 'Panduan siswa', teks: 'Bagikan tautan ini kepada siswa dan wali: cara masuk Portal Siswa dan mengerjakan latihan, lengkap dengan simulasi.' },
    ],
  },
  '/portal/bank-soal': {
    judul: 'Tur Bank Soal', bagian: 'bank-soal',
    langkah: [
      { el: '.bs-p-kepala', judul: 'Bank Soal', teks: 'Semua paket soal lembaga Anda dan paket bawaan yayasan ada di sini.' },
      { el: '.p-tabs .p-tab:nth-child(1)', judul: 'Soal ujian guru (PTS/PAS)', teks: 'Khusus pengelola: **tidak tampil** di situs maupun Portal Siswa. Cetak legal berkop, kunci, Word, rekap nilai.' },
      { el: '.p-tabs .p-tab:nth-child(2)', judul: 'Latihan siswa', teks: 'Latihan Ganjil/Genap yang dikerjakan siswa di situs dan Portal Siswa — nilai dan pembahasan keluar langsung.' },
      { el: '.p-tabs .p-tab:nth-child(3)', judul: 'Peta kelengkapan', teks: 'Enam slot untuk setiap mapel di setiap kelas. Slot kosong punya tombol **+ Buat**: kerangka soal langsung terisi.' },
      { el: '.bs-p-saring', judul: 'Saring paket', teks: 'Pilih jenjang, kelas, mapel, atau semester untuk mempersempit daftar.' },
      { el: '.bs-p-daftar, .bs-peta-gulir', judul: 'Daftar paket', teks: 'Ketuk sebuah paket untuk mencetak, mengunduh Word, melihat rekap nilai, atau **membagikannya ke siswa** sesudah ujian.' },
      BANTU,
    ],
  },
  '/portal/saran': {
    judul: 'Tur Pesan & Saran', bagian: 'saran',
    langkah: [
      { el: '.p-tabs', judul: 'Saring menurut status', teks: 'Baru, Sudah dibaca, Sudah dibalas, Selesai, dan Ditampilkan di situs.' },
      { el: '.sr-p-daftar, .p-kartu', judul: 'Daftar pesan', teks: 'Ketuk sebuah pesan untuk membaca dan membalas. Balasan selalu atas nama lembaga yang dituju.' },
      BANTU,
    ],
  },
  '/portal/akun': {
    judul: 'Tur Ganti PIN', bagian: 'ganti-pin',
    langkah: [
      { el: '[data-pinpad]', judul: 'Papan PIN acak', teks: 'Ketuk PIN lama, lalu PIN baru **dua kali**. Letak angka diacak setiap kali agar tidak mudah diintip.' },
      { judul: 'PIN yang kuat', teks: 'Hindari **12345**, angka kembar, atau tanggal lahir. Jangan membagikan PIN — Super Admin tidak pernah memintanya.' },
      BANTU,
    ],
  },
  '/portal/pengguna': {
    judul: 'Tur Akun & PIN', bagian: 'akun',
    langkah: [
      { el: '.p-aksi', judul: 'Tambah akun', teks: 'Buat akun pengelola baru: isi nama, pilih peran dan lembaganya. PIN sementara tampil **satu kali** — catat dan serahkan langsung.' },
      { el: '.p-tabel', judul: 'Daftar akun', teks: 'Ketuk nama akun untuk mengubah peran, mengatur ulang PIN, membuka akun yang terkunci, atau menonaktifkannya.' },
      BANTU,
    ],
  },
  '/portal/tagihan': {
    judul: 'Tur Tagihan & pembayaran', bagian: 'tagihan',
    langkah: [
      { el: '.ks-alat', judul: 'Alat tagihan', teks: '**Tagihan massal per kelas** untuk SPP dan lainnya, **Satu tagihan** untuk siswa tertentu, dan unduh **Excel**.' },
      { el: '.ks-aksi-sel', judul: 'Bayar', teks: 'Saat siswa membayar, ketuk **Bayar**: kwitansi tertaut ke tagihannya dan status berubah otomatis (Lunas/Sebagian).' },
      { el: '#massal', judul: 'Tagihan massal', teks: 'Isi jenis, periode, jumlah, dan jatuh tempo, lalu pilih lembaga dan kelas. Aman dijalankan ulang — tidak ada tagihan ganda.' },
      BANTU,
    ],
  },
  '/portal/siswa': {
    judul: 'Tur Data siswa', bagian: 'siswa',
    langkah: [
      { el: '.p-kepala h1', judul: 'Data induk siswa', teks: 'Identitas, kelas dan rombel, status, serta akses Portal Siswa setiap siswa lembaga Anda.' },
      { el: menu('/portal/siswa/impor'), sisi: true, judul: 'Impor file master', teks: 'Unggah Excel format yayasan; kolom dicocokkan otomatis dan ada pratinjau sebelum disimpan.' },
      { el: '.p-tabel, .ks-tabel', judul: 'Daftar siswa', teks: 'Ketuk nama siswa untuk mengubah data, menambah tagihan atau kwitansi, dan membuka kunci masuk portal siswa.' },
      { judul: 'Masuk Portal Siswa', teks: 'Siswa masuk dengan **NISN/NIS** dan **tanggal lahir** — pastikan keduanya benar. Bagikan panduan siswa: **/siswa/panduan**.' },
      BANTU,
    ],
  },
};

/** Tur umum untuk halaman tanpa tur khusus: dibangun dari panduan menu itu. */
function turUmum(aktif: string, path: string): Omit<Tur, 'id'> | undefined {
  const id = jangkarPanduan(aktif);
  const b = PANDUAN_PORTAL.find((x) => x.id === id);
  if (!b) return undefined;
  const form = /^\/portal\/k\/[^/]+\/[^/]+$/.test(path);
  const langkah: LangkahTur[] = form
    ? [
      { el: '[name="judul"]', judul: 'Judul', teks: 'Tulis judul yang jelas — judul ini tampil di situs dan di hasil Google.' },
      { el: '.p-dok-pratinjau, .p-form .p-bidang:nth-of-type(3)', judul: 'Isi', teks: 'Lengkapi isinya. Untuk dokumen cetak, pratinjau di samping berubah langsung saat Anda mengetik.' },
      { el: '[name="status"]', judul: 'Status', teks: '**Draf** disimpan untuk diperiksa; **Tayang** langsung terlihat publik (admin lembaga ke atas).' },
      { el: '.p-form-kaki', judul: 'Simpan', teks: 'Tekan **Simpan**. Perubahan yang belum disimpan dijaga — Anda diingatkan sebelum meninggalkan halaman.' },
    ]
    : [
      { el: '.p-kepala h1', judul: b.judul, teks: b.ringkas },
      ...(path.startsWith('/portal/k/') ? [
        { el: '.p-aksi .tbl', judul: 'Tambah baru', teks: 'Mulai menulis isi baru dari tombol ini.' },
        { el: '.p-saring', judul: 'Saring', teks: 'Saring per lembaga dan status (Draf, Tinjau, Tayang, Arsip).' },
        { el: '.p-tabel', judul: 'Daftar', teks: 'Ketuk judul untuk membuka, mengubah, atau menayangkan.' },
      ] satisfies LangkahTur[] : b.langkah.slice(0, 4).map((l, i) => ({ judul: `Langkah ${i + 1}`, teks: l }))),
    ];
  return { judul: `Tur ${b.judul}`, bagian: b.id, langkah: [...langkah, BANTU] };
}

export function turPortal(path: string, aktif: string): Tur | undefined {
  const t = KHUSUS[path] ?? (path === aktif ? KHUSUS[aktif] : undefined) ?? turUmum(aktif, path);
  if (!t) return undefined;
  const bentuk = /^\/portal\/k\/[^/]+\/[^/]+$/.test(path) ? path.replace(/\/[^/]+$/, '/isi') : path;
  return { id: `portal${bentuk.slice('/portal'.length).replace(/[^a-z0-9]+/gi, '-')}`.replace(/-$/, ''), ...t };
}

/* ── Portal Siswa ───────────────────────────────────────────────────────── */

export const TUR_SISWA_MASUK: Tur = {
  id: 'siswa-masuk', judul: 'Tur cara masuk', otomatis: false,
  langkah: [
    { el: '[name="nomor"]', judul: '1. NISN atau NIS', teks: 'Ketik **NISN** (10 angka) atau **NIS** lokal dari madrasah.' },
    { el: '[name="sandi"]', judul: '2. Tanggal lahir', teks: 'Boleh ditulis **30/04/2015**, **30-04-2015**, **300415**, atau **30 April 2015**.' },
    { el: 'form[action="/siswa/masuk"] button[type="submit"]', judul: '3. Masuk', teks: 'Tekan **Masuk**. Tidak perlu mendaftar — data siswa diisi oleh madrasah.' },
    { el: '.sw-panduan-taut', judul: 'Panduan & simulasi', teks: 'Belum yakin? Buka panduan siswa — ada simulasi masuk dan soal contoh untuk dicoba.' },
  ],
};

export const TUR_SISWA_BERANDA: Tur = {
  id: 'siswa-beranda', judul: 'Tur Portal Siswa', otomatis: true,
  langkah: [
    { judul: 'Selamat datang di Portal Siswa 🎒', teks: 'Tur singkat ini menunjukkan isi beranda. Tekan **Lanjut**.' },
    { el: '.sw-u[href="#soal"]', judul: 'Bank soal', teks: 'Latihan soal sesuai kelasmu. Paket semester yang sedang berjalan tampil paling atas.' },
    { el: '#soal', judul: 'Kerjakan latihan', teks: 'Pilih paket, jawab semua soal, lalu tekan **Serahkan**: nilai keluar, lalu kunci dan pembahasan.' },
    { el: '.sw-u[href="#penghargaan"]', judul: 'Penghargaan', teks: 'Sertifikat dan piagam atas namamu bisa dibuka dan dicetak.' },
    { el: '.sw-panduan-taut', judul: 'Panduan lengkap', teks: 'Lupa caranya? Panduan siswa selalu bisa dibuka lagi.' },
    { el: 'form[action="/siswa/keluar"] button', judul: 'Keluar', teks: 'Tekan **Keluar** setelah selesai, terutama di HP atau komputer bersama.' },
  ],
};

/** Data tur untuk halaman (dibaca /assets/tur.js). `<` di-escape agar tidak bisa menutup tag script. */
export function dataTur(t: Tur | undefined): Raw {
  if (!t) return raw('');
  return raw(`<script type="application/json" id="tur-data">${JSON.stringify(t).replace(/</g, '\\u003c')}</script>`);
}
