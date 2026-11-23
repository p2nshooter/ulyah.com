/**
 * Panduan interaktif (pemilik, perintah 40: „termasuk panduanya … panduan interaktif setiap menu portal“; „Termasuk bank
 * soal dan portal siswa dan cara login siswa … bagaimana siswa mengisi latihan soal“; 17 Nov 2026: „Masih berantakan
 * bangat panduanya, kurang interaktif“).
 *   /portal/panduan  kartu setiap menu: langkah satu per satu, „▶ Tur langsung“ (menyorot tombol asli di menunya, lihat
 *                    pages/tur.ts), saring kelompok, cari, dan lingkaran kemajuan „sudah dipelajari“ (tersimpan di perangkat).
 *                    Disaring menurut peran akun (bisa lihat semua); tombol „?“ di setiap halaman membuka kartu menunya.
 *   /siswa/panduan   panduan siswa tanpa masuk + simulasi masuk (pembaca tanggal yang sama dengan halaman masuk asli) dan
 *                    soal contoh yang bisa diserahkan, dinilai, dan dibahas — persis alur latihan sungguhan.
 * Isi panduan hanya menjelaskan fitur yang benar-benar ada; tidak memuat akun, PIN, atau data pribadi.
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { ASSET_V } from './layout.ts';

export type KatPanduan = 'dasar' | 'isi' | 'belajar' | 'siswa' | 'dokumen' | 'atur';
export const KAT_PANDUAN: Record<KatPanduan, string> = { dasar: 'Dasar', isi: 'Isi situs', belajar: 'Pembelajaran', siswa: 'Kesiswaan', dokumen: 'Dokumen & cetak', atur: 'Pengaturan & akun' };

export interface BagianPanduan {
  id: string;
  judul: string;
  ikon: string;
  /** Alamat menu (untuk tombol „Buka menu ini“ dan pencocokan tombol ?). */
  menu?: string;
  /** Awalan alamat lain yang memakai bagian ini (mis. /portal/k/kabar). */
  cocok?: string[];
  /** Tingkat peran minimal (lihat PERAN di data/users.ts). */
  tingkat: number;
  /** Kelompok di halaman panduan (saringan). */
  kat: KatPanduan;
  /** Alamat tur langsung bila berbeda dari menu (tanpa ?tur=1). */
  tur?: string;
  ringkas: string;
  langkah: string[];
  kiat?: string[];
}

/** Tingkat peran (sama dengan PERAN di data/users.ts; ditulis ulang agar modul ini tidak bergantung pada data). */
const T = { kontributor: 20, lembaga: 40, kepala: 50, yayasan: 70, ketua: 80, super: 100 } as const;

export const PANDUAN_PORTAL: BagianPanduan[] = [
  {
    id: 'masuk', kat: 'dasar', tur: '/portal', judul: 'Masuk portal & keamanan PIN', ikon: '🔐', tingkat: 0,
    ringkas: 'Portal pengelola dibuka dari logo situs. Setiap akun memakai PIN 5 angka pada papan angka yang posisinya selalu diacak.',
    langkah: [
      'Buka www.yapida.sch.id, ketuk logo Yapida di kiri atas 3 kali (atau buka alamat /masuk).',
      'Pilih nama akun Anda dari daftar.',
      'Ketik PIN 5 angka pada papan angka. Posisi angka diacak setiap kali agar PIN tidak mudah diintip.',
      'Akun baru wajib mengganti PIN awal: buka menu Akun → Ganti PIN, ketik PIN lama lalu PIN baru dua kali.',
      'Selesai bekerja, tekan Keluar (pojok kanan atas atau bawah menu).',
    ],
    kiat: ['Jangan memakai PIN yang mudah ditebak seperti 12345 atau tanggal lahir.', 'Lupa PIN? Minta Super Admin (atau kepala lembaga untuk akun di lembaganya) mengatur ulang PIN Anda di menu Akun & PIN.'],
  },
  {
    id: 'dasbor', kat: 'dasar', judul: 'Dasbor', ikon: '⭐', menu: '/portal', tingkat: 0,
    ringkas: 'Halaman pertama setelah masuk: ringkasan isi lembaga dan jalan pintas ke pekerjaan yang paling sering dilakukan.',
    langkah: ['Lihat ringkasan jumlah isi dan pesan baru.', 'Ketuk kartu atau menu di kiri untuk mulai bekerja. Di ponsel, buka menu dengan tombol ☰ di kiri atas.'],
  },
  {
    id: 'pesan', kat: 'dasar', judul: 'Pesan antarlembaga', ikon: '✉️', menu: '/portal/pesan', tingkat: 0,
    ringkas: 'Japri (tiket) yang privat ke Super Admin, yayasan, atau lembaga lain, dan obrolan grup seluruh lembaga.',
    langkah: [
      'Buka Pesan, pilih Japri untuk menulis kepada tujuan tertentu; percakapan tersimpan dan hanya terlihat oleh pihak terkait.',
      'Pilih Grup untuk berbicara dengan seluruh pengelola lembaga.',
      'Angka di samping menu menandakan pesan yang belum dibaca.',
    ],
    kiat: ['Obrolan grup dibersihkan setiap hari; riwayat per tanggal tersimpan paling lama 14 hari lalu terhapus permanen. Simpan informasi penting di japri atau dokumen.'],
  },
  {
    id: 'saran', kat: 'dasar', judul: 'Pesan & Saran pengunjung', ikon: '💬', menu: '/portal/saran', tingkat: T.lembaga,
    ringkas: 'Pesan, saran, pertanyaan, dan keluhan dari pengunjung situs (/saran) yang ditujukan ke lembaga tertentu.',
    langkah: [
      'Buka Pesan & Saran; saring menurut status: Baru, Sudah dibaca, Sudah dibalas, Selesai, Ditampilkan.',
      'Buka sebuah pesan lalu tulis balasan. Balasan selalu ditandatangani atas nama lembaga yang dituju.',
      'Ubah status menjadi Selesai bila urusan sudah tuntas.',
      'Yayasan dapat meneruskan pesan ke lembaga lain. Super Admin dapat menampilkan atau menyembunyikan pesan beserta balasannya di halaman publik, atau menghapusnya.',
    ],
    kiat: ['Pengirim membaca balasan lewat tautan pribadi yang ia terima saat mengirim pesan; kontak pengirim tidak pernah tampil di publik.'],
  },
  {
    id: 'lembaga', kat: 'isi', judul: 'Profil lembaga', ikon: '🕌', menu: '/portal/lembaga', tingkat: T.lembaga,
    ringkas: 'Data resmi lembaga: nama, alamat terstruktur, kepala, NSM, sampul, dan ringkasan yang tampil di halaman lembaga.',
    langkah: ['Buka Profil lembaga, ubah data yang perlu, lalu simpan.', 'Alamat diisi per bagian (jalan, RT/RW, desa, kecamatan, kabupaten, provinsi, kode pos) agar rapi di kop, sertifikat, dan formulir.'],
  },
  {
    id: 'isi', kat: 'isi', tur: '/portal/k/kabar', judul: 'Isi situs: kabar, galeri, video, agenda, dokumen, karya, SDM', ikon: '📰', cocok: ['/portal/k/'], tingkat: T.kontributor,
    ringkas: 'Semua isi publik lembaga ditulis di sini dan langsung tampil rapi di situs bila ditayangkan.',
    langkah: [
      'Pilih jenis isi di menu Isi, misalnya Kabar & kegiatan atau Galeri foto, lalu tekan Tambah.',
      'Isi judul, isi, dan foto sampul. Untuk galeri, unggah beberapa foto sekaligus.',
      'Simpan sebagai Draf untuk diperiksa, atau Tayang agar terlihat publik (menayangkan hanya untuk admin lembaga ke atas).',
      'Struktur & SDM berisi data guru dan staf; data pribadi seperti NUPTK dan kontak tidak pernah tampil di publik.',
    ],
    kiat: ['Kontributor menyimpan draf; admin lembaga memeriksa lalu menayangkannya.', 'Gunakan foto yang terang dan judul yang jelas agar mudah ditemukan di Google.'],
  },
  {
    id: 'ppdb', kat: 'isi', tur: '/portal/k/ppdb', judul: 'PPDB: penerimaan murid baru', ikon: '📝', cocok: ['/portal/k/ppdb', '/portal/k/pendaftar'], tingkat: T.lembaga,
    ringkas: 'Membuka gelombang pendaftaran, menerima formulir calon murid, dan mengelola daftar pendaftar.',
    langkah: [
      'Buka Isi → Penerimaan murid baru, tambah gelombang (tanggal buka dan tutup, syarat, biaya).',
      'Formulir pendaftaran di situs hanya menerima isian selama gelombang dibuka.',
      'Lihat dan kelola calon murid di Isi → Pendaftar PPDB (data ini privat, hanya untuk pengelola).',
    ],
  },
  {
    id: 'bank-soal', kat: 'belajar', judul: 'Bank Soal', ikon: '📚', menu: '/portal/bank-soal', cocok: ['/portal/bank-soal'], tingkat: T.kontributor,
    ringkas: 'Bank soal guru (PTS & PAS Ganjil/Genap) dan latihan siswa, lengkap dengan cetak legal berkop, kunci, Word, dan rekap nilai.',
    langkah: [
      'Tab Soal ujian guru (PTS/PAS) hanya terlihat oleh pengelola — tidak tampil di situs maupun Portal Siswa.',
      'Tab Latihan siswa berisi latihan Ganjil/Genap yang dikerjakan siswa di situs dan Portal Siswa.',
      'Tab Peta kelengkapan menunjukkan 6 slot setiap mapel per kelas. Ketuk + Buat pada slot kosong: editor terbuka dengan kepala paket dan kerangka soal sudah terisi.',
      'Menulis soal: [PILIHAN GANDA] tandai jawaban benar dengan * (mis. *b.), pembahasan diawali >; [MENJODOHKAN] tulis pernyataan = jawaban; [ISIAN] soal = jawaban | jawaban lain; [URAIAN] soal lalu = jawaban model. Pemeriksa otomatis memberi tahu bila ada yang salah.',
      'Di halaman paket: Cetak soal (kertas legal, maks. 2 lembar, berkop lembaga), Kunci & pedoman skor, Unduh Word, Rekap nilai siswa (grafik dan unduh CSV/Excel).',
      'Sesudah ujian selesai, admin lembaga dapat menekan Bagikan agar soal ujian muncul di Portal Siswa sebagai latihan; tekan Tarik kembali untuk menyembunyikannya lagi.',
    ],
    kiat: ['Paket bawaan yayasan bisa disalin (Salin & ubah) lalu disesuaikan menjadi paket lembaga Anda.', 'Format baku PTS/PAS: 15 pilihan ganda, 5 menjodohkan, 10 isian, 5 uraian (nilai 100).'],
  },
  {
    id: 'siswa', kat: 'siswa', judul: 'Data siswa & impor file master', ikon: '🎒', menu: '/portal/siswa', cocok: ['/portal/siswa'], tingkat: T.lembaga,
    ringkas: 'Data induk siswa per lembaga: identitas, kelas dan rombel, status (aktif, lulus, pindah, keluar), dan akses Portal Siswa.',
    langkah: [
      'Buka Data siswa untuk mencari, menambah, atau mengubah data seorang siswa.',
      'Impor file master: unggah berkas Excel sesuai format yayasan; pembaca pintar mencocokkan kolom lalu menampilkan pratinjau sebelum disimpan.',
      'Kenaikan kelas berjalan otomatis mengikuti tahun pelajaran; siswa yang lulus, pindah, atau keluar tidak dapat lagi masuk Portal Siswa.',
      'Siswa masuk Portal Siswa dengan NISN atau NIS dan tanggal lahir — pastikan keduanya benar.',
    ],
    kiat: ['NISN, NIK, dan KK tidak pernah tampil di halaman publik.'],
  },
  {
    id: 'tagihan', kat: 'siswa', judul: 'Tagihan, pembayaran & kwitansi', ikon: '💳', menu: '/portal/tagihan', cocok: ['/portal/tagihan', '/portal/k/kwitansi'], tingkat: T.lembaga,
    ringkas: 'Tagihan siswa (SPP dan lainnya) dibuat massal per kelas; statusnya berubah otomatis ketika pembayarannya dicatat dengan kwitansi.',
    langkah: ['Buka Tagihan & pembayaran, isi bagian Tagihan massal: jenis tagihan, periode, jumlah, jatuh tempo, lalu pilih lembaga dan kelas.', 'Ketika siswa membayar, ketuk Bayar di samping tagihannya: formulir kwitansi terbuka sudah tertaut ke tagihan itu. Simpan — status tagihan dihitung ulang otomatis (Lunas atau Sebagian, sesuai jumlah yang dibayar) dan kwitansi bernomor siap dicetak.', 'Unduh rekap tagihan sebagai Excel. Siswa dan wali melihat tagihan serta kwitansinya di Portal Siswa.'],
  },
  {
    id: 'laporan', kat: 'siswa', judul: 'Laporan & grafik', ikon: '📊', menu: '/portal/laporan', tingkat: T.lembaga,
    ringkas: 'Rekap siswa, tagihan, dan pembayaran dalam tabel dan grafik.',
    langkah: ['Buka Laporan & grafik untuk membaca grafik dan tabel lembaga yang Anda kelola.', 'Unduh laporan sebagai Excel untuk rapat atau arsip.'],
  },
  {
    id: 'guru', kat: 'siswa', judul: 'Impor data guru (GTK)', ikon: '👩‍🏫', menu: '/portal/guru/impor', tingkat: T.lembaga,
    ringkas: 'Memasukkan banyak data guru dan tenaga kependidikan sekaligus beserta fotonya.',
    langkah: ['Unduh templat, isi di Excel, lalu tempel atau unggah kembali.', 'Unggah banyak foto sekaligus; pembaca pintar mencocokkan foto dengan nama.', 'Guru tampil di halaman guru yayasan dan lembaga; data privat tetap tersembunyi.'],
  },
  {
    id: 'dokumen', kat: 'dokumen', tur: '/portal/k/penghargaan', judul: 'Sertifikat, piagam, surat & kop', ikon: '🏅', cocok: ['/portal/k/penghargaan', '/portal/k/surat', '/portal/k/kop', '/portal/penghargaan'], tingkat: T.lembaga,
    ringkas: 'Dokumen resmi siap cetak: lebih dari 10 desain sertifikat/piagam (tahfidz, lomba, ranking), surat berkop, dan kop surat per lembaga.',
    langkah: [
      'Kop surat: atur logo, nama, dan alamat lembaga sekali; semua cetakan memakai kop ini.',
      'Sertifikat & piagam: pilih desain, isi nama penerima, capaian, dan penanda tangan; nomor dibuat otomatis. Sertifikat dengan NISN juga tampil di Portal Siswa.',
      'Sertifikat massal: buat banyak sertifikat sekaligus dari daftar nama.',
      'Surat berkop: tulis perihal, tujuan, dan isi surat lalu cetak.',
    ],
  },
  {
    id: 'halaman', kat: 'isi', judul: 'Halaman', ikon: '📄', menu: '/portal/halaman', tingkat: T.lembaga,
    ringkas: 'Halaman tetap seperti visi-misi, sejarah, atau kebijakan privasi.',
    langkah: ['Tambah atau ubah halaman, tulis isinya, lalu tayangkan.', 'Tautkan halaman dari menu atau kabar agar mudah ditemukan.'],
  },
  {
    id: 'situs', kat: 'atur', judul: 'Pengaturan situs & rak perpustakaan', ikon: '⚙️', menu: '/portal/situs', cocok: ['/portal/situs', '/portal/pustaka'], tingkat: T.yayasan,
    ringkas: 'Identitas yayasan, tampilan beranda, donasi, serta pengaturan rak perpustakaan digital.',
    langkah: ['Pengaturan situs: ubah identitas, kontak, dan bagian beranda.', 'Rak perpustakaan: sembunyikan buku tertentu atau jadikan unggulan di beranda perpustakaan.'],
  },
  {
    id: 'akun', kat: 'atur', judul: 'Akun & PIN', ikon: '🗝️', menu: '/portal/pengguna', tingkat: T.kepala,
    ringkas: 'Membuat akun pengelola, mengatur peran dan lembaganya, serta mengatur ulang PIN.',
    langkah: [
      'Tambah akun: isi nama, pilih peran (Ketua Yayasan, Admin Yayasan, Kepala Lembaga, Admin Lembaga, atau Kontributor/Guru) dan lembaganya.',
      'Berikan PIN awal secara langsung kepada pemilik akun; ia wajib menggantinya saat pertama masuk.',
      'Atur ulang PIN bila pemilik akun lupa, buka kunci akun yang terkunci karena salah PIN berkali-kali, atau nonaktifkan akun yang tidak dipakai lagi.',
    ],
    kiat: ['Kepala lembaga hanya mengelola akun kontributor di lembaganya sendiri.'],
  },
  {
    id: 'log', kat: 'atur', judul: 'Log aktivitas', ikon: '📿', menu: '/portal/log', tingkat: T.ketua,
    ringkas: 'Catatan siapa melakukan apa dan kapan di portal, untuk pengawasan.',
    langkah: ['Buka Log aktivitas untuk melihat 300 aktivitas terbaru: waktu, akun, aksi, dan rinciannya.'],
  },
  {
    id: 'ganti-pin', kat: 'dasar', judul: 'Ganti PIN', ikon: '🔑', menu: '/portal/akun', tingkat: 0,
    ringkas: 'Mengganti PIN akun Anda sendiri.',
    langkah: ['Buka Akun → Ganti PIN.', 'Ketik PIN lama, lalu PIN baru dua kali pada papan angka yang diacak.'],
  },
];

/** Bagian panduan untuk halaman portal yang sedang dibuka (tombol „?“ di kepala portal). */
export function jangkarPanduan(aktif: string): string {
  if (!aktif) return '';
  const pas = PANDUAN_PORTAL.find((b) => b.menu === aktif);
  if (pas) return pas.id;
  const panjang = (b: BagianPanduan) => Math.max(0, ...(b.cocok ?? []).map((c) => (aktif.startsWith(c) ? c.length : 0)));
  const awal = PANDUAN_PORTAL.filter((b) => panjang(b) > 0).sort((a, b) => panjang(b) - panjang(a));
  return awal[0]?.id ?? '';
}

/** Siapa yang bisa memakai menu (label di kartu panduan dan gambar panduan besar). */
export const LABEL_TINGKAT: Record<number, string> = { 0: 'Semua akun', 20: 'Guru / kontributor ke atas', 40: 'Admin lembaga ke atas', 50: 'Kepala lembaga ke atas', 70: 'Yayasan & Super Admin', 80: 'Ketua Yayasan & Super Admin' };

const kartuPanduan = (b: BagianPanduan, tingkat: number) => {
  const boleh = b.tingkat <= tingkat;
  const tur = b.tur ?? b.menu;
  return html`<article class="pd-kartu" id="${b.id}" data-pd-kartu data-kat="${b.kat}" data-cari="${`${b.judul} ${b.ringkas} ${b.langkah.join(' ')} ${(b.kiat ?? []).join(' ')}`.toLowerCase()}">
  <header class="pd-kartu-kepala"><span class="pd-ikon" aria-hidden="true">${b.ikon}</span><div class="pd-kartu-judul"><h3>${b.judul}</h3><p>${b.ringkas}</p></div><span class="pd-centang" data-pd-centang title="Sudah dipelajari" hidden>✓</span></header>
  <p class="pd-meta"><span class="pd-peran">${LABEL_TINGKAT[b.tingkat] ?? ''}</span><span>${b.langkah.length} langkah</span></p>
  <details class="pd-detail" data-pd-detail>
    <summary class="pd-pelajari"><span class="pd-pelajari-teks">📖 Pelajari langkahnya</span><span class="pd-panah" aria-hidden="true">⌄</span></summary>
    <ol class="pd-ol" data-pd-ol>${b.langkah.map((l, i) => html`<li data-pd-li><span class="pd-no" aria-hidden="true">${i + 1}</span><p>${l}</p></li>`)}</ol>
    <div class="pd-nav" data-pd-nav hidden><button type="button" class="pd-nav-k" data-pd-k>← Sebelumnya</button><span class="pd-nav-no" data-pd-no aria-live="polite"></span><button type="button" class="pd-nav-l" data-pd-l>Berikutnya →</button></div>
    ${b.kiat?.length ? html`<div class="pd-kiat"><b>💡 Kiat</b><ul>${b.kiat.map((k) => html`<li>${k}</li>`)}</ul></div>` : ''}
  </details>
  <div class="pd-kartu-aksi">${boleh && tur ? html`<a class="tbl tbl-emas tbl-kecil" href="${tur}?tur=1">▶ Tur langsung</a>` : ''}${boleh && b.menu ? html`<a class="tbl tbl-garis tbl-kecil" href="${b.menu}">Buka menu</a>` : ''}${boleh ? '' : html`<span class="pd-terkunci">🔒 Tidak tersedia untuk peran Anda</span>`}</div>
</article>`;
};

export function panduanPortalPage(o: { tingkat: number; semua: boolean }): Raw {
  const daftar = PANDUAN_PORTAL.filter((b) => o.semua || b.tingkat <= o.tingkat);
  const tersembunyi = PANDUAN_PORTAL.length - daftar.length;
  const kat = (Object.keys(KAT_PANDUAN) as KatPanduan[]).filter((k) => daftar.some((b) => b.kat === k));
  return html`<div class="pd" data-pd>
  <section class="pd-mulai">
    <div class="pd-mulai-teks">
      <p class="pd-kicker">Panduan interaktif</p>
      <h2>Belajar memakai portal, langkah demi langkah</h2>
      <p>Pilih sebuah menu, lalu ketuk <b>Pelajari langkahnya</b> untuk membaca satu langkah demi satu langkah — atau <b>▶ Tur langsung</b>: Anda dibawa ke menu itu dan tombol-tombolnya disorot satu per satu.</p>
      <div class="pd-mulai-aksi"><a class="tbl tbl-emas" href="/portal?tur=1">▶ Mulai tur dasbor</a><a class="tbl tbl-garis" href="/siswa/panduan" target="_blank" rel="noopener">🎒 Panduan siswa</a></div>
    </div>
    <div class="pd-cincin" data-pd-cincin>
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="pd-cincin-dasar" cx="60" cy="60" r="52"></circle><circle class="pd-cincin-isi" cx="60" cy="60" r="52" pathLength="100" stroke-dasharray="0 100" data-pd-cincin-isi></circle></svg>
      <div class="pd-cincin-angka"><b data-pd-paham>0</b><span>dari ${daftar.length} menu<br>sudah dipelajari</span></div>
    </div>
  </section>
  <div class="pd-alat">
    <label class="pd-cari"><span aria-hidden="true">🔎</span><span class="sr-only">Cari panduan</span><input type="search" placeholder="Cari: PIN, sertifikat, bagikan soal…" data-pd-cari autocomplete="off" enterkeyhint="search"></label>
    <div class="pd-saring" role="group" aria-label="Saring kelompok menu"><button type="button" aria-pressed="true" data-pd-kat="">Semua</button>${kat.map((k) => html`<button type="button" aria-pressed="false" data-pd-kat="${k}">${KAT_PANDUAN[k]}</button>`)}</div>
  </div>
  <p class="pd-hasil" data-pd-hasil aria-live="polite"></p>
  <div class="pd-kisi" id="pd-kartu">${daftar.map((b) => kartuPanduan(b, o.tingkat))}</div>
  <p class="pd-kosong" data-pd-kosong hidden>Tidak ada panduan yang cocok. Coba kata lain, atau pilih „Semua“.</p>
  ${tersembunyi && !o.semua ? html`<p class="pd-semua">Menampilkan ${daftar.length} menu untuk akun Anda. <a href="/portal/panduan?semua=1">Lihat panduan semua menu (${PANDUAN_PORTAL.length}) →</a></p>` : ''}
  <section class="pd-siswa">
    <span class="pd-siswa-ikon" aria-hidden="true">🎒</span>
    <div><h2>Panduan untuk siswa &amp; wali</h2><p>Cara masuk Portal Siswa, mengerjakan latihan soal sampai melihat pembahasan, membaca buku pelajaran, serta tagihan dan sertifikat — lengkap dengan <b>simulasi masuk</b> dan <b>soal contoh</b> yang bisa dicoba.</p></div>
    <a class="tbl tbl-emas tbl-kecil" href="/siswa/panduan" target="_blank" rel="noopener">Buka panduan siswa →</a>
  </section>
</div>
<script src="/assets/panduan.js?v=${ASSET_V}" defer></script>`;
}

/* ── panduan siswa (publik, tanpa masuk) ──────────────────────────────────────────────────────────────────────── */

const LANGKAH_SISWA: { id: string; ikon: string; judul: string; isi: Raw }[] = [
  {
    id: 'masuk', ikon: '🔐', judul: 'Cara masuk Portal Siswa',
    isi: html`<ol class="psw-langkah">
      <li>Buka <b>www.yapida.sch.id/siswa</b> di HP atau komputer.</li>
      <li>Ketik <b>NISN</b> (10 angka) atau <b>NIS</b> lokal dari madrasah.</li>
      <li>Ketik <b>tanggal lahir</b>. Boleh ditulis <b>30/04/2015</b>, <b>30-04-2015</b>, <b>300415</b>, atau <b>30 April 2015</b>.</li>
      <li>Tekan <b>Masuk</b>. Tidak perlu mendaftar — data siswa diisi oleh madrasah.</li>
    </ol>
    <div class="psw-sim" id="simulasi" data-sim-masuk hidden>
      <p class="psw-sim-label"><span aria-hidden="true">🧪</span> Simulasi — coba dulu di sini. Tidak dikirim ke mana pun.</p>
      <div class="psw-sim-form">
        <label><span>NISN / NIS</span><input inputmode="numeric" maxlength="20" autocomplete="off" placeholder="mis. 0151234567" data-sim-nomor></label>
        <small class="psw-sim-ket" data-sim-nomor-ket>Ketik 10 angka NISN, atau NIS lokal.</small>
        <label><span>Tanggal lahir</span><input autocomplete="off" maxlength="40" placeholder="mis. 30/04/2015 atau 300415" data-sim-tgl></label>
        <small class="psw-sim-ket" data-sim-tgl-ket>Coba beberapa cara menulis tanggal — lihat cara membacanya.</small>
        <button class="tbl tbl-emas" type="button" data-sim-coba>Coba masuk</button>
      </div>
      <div class="psw-sim-hasil" data-sim-hasil role="status" hidden></div>
    </div>
    <p class="psw-catatan">Tidak bisa masuk? Pastikan NISN/NIS dan tanggal lahir benar, lalu hubungi wali kelas atau admin madrasah. Siswa yang sudah lulus, pindah, atau keluar tidak dapat masuk lagi.</p>`,
  },
  {
    id: 'beranda', ikon: '🏠', judul: 'Beranda siswa',
    isi: html`<p>Sesudah masuk, beranda menampilkan identitas dan kelasmu, perjalanan kelas dari tahun ke tahun, latihan soal untuk kelasmu, tagihan dan kwitansi, sertifikat atau piagam yang kamu terima, serta tautan ke rak buku jenjangmu di perpustakaan digital.</p>
    <p class="psw-catatan">Saat pertama masuk, tur singkat menunjukkan isi beranda. Tombol <b>▶ Tur</b> di beranda memutarnya lagi kapan saja.</p>`,
  },
  {
    id: 'latihan', ikon: '✏️', judul: 'Mengerjakan latihan soal',
    isi: html`<ol class="psw-langkah">
      <li>Di beranda, ketuk <b>Bank soal</b> atau salah satu paket di bagian latihan. Paket semester yang sedang berjalan tampil paling atas.</li>
      <li>Kerjakan semua bagian: <b>pilihan ganda</b> (ketuk satu jawaban), <b>menjodohkan</b> (pilih pasangan yang cocok), <b>isian</b> (ketik jawaban singkat), dan <b>uraian</b> (tulis jawabanmu sendiri). Jawaban tersimpan otomatis di perangkatmu.</li>
      <li>Tekan <b>Serahkan</b>. Nilai langsung keluar, lalu <b>kunci jawaban dan pembahasan</b> tampil untuk setiap soal.</li>
      <li>Untuk soal uraian, bandingkan jawabanmu dengan <b>jawaban model</b>, lalu nilai sendiri dengan jujur: Sesuai, Sebagian, atau Belum. Nilaimu diperbarui.</li>
      <li>Buka <b>Riwayat latihan</b> untuk melihat, mencetak, atau menyimpan hasilmu sebagai PDF. Hasil latihan juga terlihat oleh gurumu.</li>
      <li>Boleh mengulang latihan untuk memperbaiki nilai — pelajari dulu pembahasannya.</li>
    </ol>
    <div class="psw-contoh" id="contoh" data-contoh hidden>
      <p class="psw-sim-label"><span aria-hidden="true">✏️</span> Soal contoh — rasakan cara kerjanya. Tidak dinilai dan tidak disimpan.</p>
      <form class="psw-contoh-form" data-contoh-form novalidate>
        <fieldset class="psw-soal" data-soal="pg"><legend><span class="psw-no">1</span> Air yang suci dan dapat menyucikan, sehingga sah dipakai untuk berwudhu, disebut air …</legend>
          <div class="psw-opsi">${['musta’mal', 'mutlak', 'mutanajjis', 'teh'].map((x, i) => html`<label><input type="radio" name="c1" value="${i}"><span><b>${'abcd'[i]}.</b> air ${x}</span></label>`)}</div>
          <div class="psw-bahas" data-bahas hidden></div></fieldset>
        <fieldset class="psw-soal" data-soal="isian"><legend><span class="psw-no">2</span> Rukun Islam ada … perkara.</legend>
          <input class="psw-isian" name="c2" autocomplete="off" maxlength="20" placeholder="Ketik jawaban singkat">
          <div class="psw-bahas" data-bahas hidden></div></fieldset>
        <fieldset class="psw-soal" data-soal="uraian"><legend><span class="psw-no">3</span> Sebutkan dua sunnah wudhu!</legend>
          <textarea class="psw-uraian" name="c3" rows="3" maxlength="400" placeholder="Tulis jawabanmu sendiri"></textarea>
          <div class="psw-bahas" data-bahas hidden></div></fieldset>
        <div class="psw-contoh-kaki"><button class="tbl tbl-emas" type="submit" data-contoh-serah>Serahkan</button><span class="psw-sim-ket" data-contoh-ket>Jawab semua soal, lalu tekan Serahkan.</span></div>
      </form>
      <div class="psw-nilai" data-contoh-nilai role="status" hidden></div>
    </div>
    <p class="psw-catatan">Soal ujian PTS dan PAS hanya muncul bila gurumu sudah membagikannya sesudah ujian selesai.</p>`,
  },
  {
    id: 'buku', ikon: '📚', judul: 'Membaca buku pelajaran',
    isi: html`<ol class="psw-langkah">
      <li>Buka menu <b>Belajar → Pelajaran madrasah</b>, pilih jenjang dan kelasmu.</li>
      <li>Ketuk mata pelajaran, lalu buku pelajarannya. Setiap bab bisa <b>dibacakan</b> dengan penanda kata.</li>
      <li>Jawab <b>kuis</b> di setiap bab; pembahasan muncul sesudah kamu menjawab benar. Kuis yang sama menjadi latihan semesteran di Bank Soal.</li>
    </ol>
    <p><a class="tbl tbl-garis tbl-kecil" href="/pustaka/pelajaran/mi">Buka Pelajaran madrasah →</a></p>`,
  },
  {
    id: 'tagihan', ikon: '💳', judul: 'Tagihan dan kwitansi',
    isi: html`<p>Bagian <b>Tagihan</b> menunjukkan kewajiban pembayaran, periode, dan jatuh temponya. Setelah madrasah mencatat pembayaran, <b>kwitansi</b> bernomor muncul dan bisa dicetak. Tanyakan ke bagian administrasi madrasah bila ada yang tidak sesuai.</p>`,
  },
  {
    id: 'sertifikat', ikon: '🏅', judul: 'Sertifikat dan piagam',
    isi: html`<p>Sertifikat tahfidz, lomba, atau peringkat yang diterbitkan madrasah atas namamu tampil di bagian <b>Penghargaan</b> dan dapat dibuka serta dicetak.</p>`,
  },
  {
    id: 'aman', ikon: '🛡️', judul: 'Menjaga keamanan akun',
    isi: html`<ul class="psw-langkah">
      <li>Jangan memberitahukan NISN dan tanggal lahirmu kepada orang lain untuk masuk portal.</li>
      <li>Tekan <b>Keluar</b> setelah selesai, terutama di HP atau komputer bersama.</li>
      <li>Kerjakan latihan dengan jujur — tujuannya untuk belajar, bukan sekadar nilai.</li>
    </ul>`,
  },
];

export function panduanSiswaPage(o: { masuk: boolean }): Raw {
  return html`<section class="sw-hero sw-hero-kecil psw-hero"><div class="sw-hero-isi"><div><p class="kicker">Portal Siswa</p><h1>Panduan siswa</h1><p class="sw-kelas">Cara masuk, mengerjakan latihan soal, membaca buku pelajaran, serta melihat tagihan dan sertifikat — dengan simulasi yang bisa langsung dicoba.</p>
    <div class="psw-hero-aksi"><a class="tbl tbl-emas tbl-kecil" href="#simulasi">🧪 Coba simulasi masuk</a><a class="tbl tbl-kaca tbl-kecil" href="#contoh">✏️ Coba soal contoh</a><a class="tbl tbl-kaca tbl-kecil" href="/siswa">${o.masuk ? '← Beranda siswa' : 'Masuk Portal Siswa →'}</a></div></div></div></section>
<div class="wadah sw-isi psw" data-psw>
  <nav class="psw-jalur" aria-label="Langkah panduan">${LANGKAH_SISWA.map((l, i) => html`<a href="#${l.id}" data-psw-jalur="${l.id}"><span class="psw-jalur-no">${i + 1}</span><span>${l.judul}</span></a>`)}</nav>
  ${LANGKAH_SISWA.map((l, i) => html`<section class="sw-kartu psw-bagian" id="${l.id}" data-psw-bagian><h2><span class="psw-no">${i + 1}</span><span aria-hidden="true">${l.ikon}</span> ${l.judul}</h2>${l.isi}</section>`)}
  <p class="sw-kecil">${raw('Pertanyaan lain? Kirim lewat <a href="/saran">Pesan &amp; Saran</a> dan pilih lembagamu.')}</p>
</div>
<script src="/assets/panduan-siswa.js?v=${ASSET_V}" defer></script>`;
}
