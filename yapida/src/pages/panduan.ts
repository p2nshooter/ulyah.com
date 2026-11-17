/**
 * Panduan interaktif (pemilik, perintah 40: „termasuk panduanya … panduan interaktif setiap menu portal, dibaca langsung di
 * portal“; „Termasuk bank soal dan portal siswa dan cara login siswa … bagaimana siswa mengisi latihan soal“).
 *   /portal/panduan  setiap menu portal pengelola: gunanya, langkah, dan kiat — disaring menurut peran akun (bisa lihat semua);
 *                    tombol „?“ di kepala setiap halaman portal membuka bagian panduan menu itu (jangkarPanduan).
 *   /siswa/panduan   panduan siswa tanpa masuk: cara masuk, beranda, mengerjakan latihan, buku pelajaran, tagihan, sertifikat.
 * Isi panduan hanya menjelaskan fitur yang benar-benar ada; tidak memuat akun, PIN, atau data pribadi.
 */
import { html, raw, type Raw } from '../lib/html.ts';

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
  ringkas: string;
  langkah: string[];
  kiat?: string[];
}

/** Tingkat peran (sama dengan PERAN di data/users.ts; ditulis ulang agar modul ini tidak bergantung pada data). */
const T = { kontributor: 20, lembaga: 40, kepala: 50, yayasan: 70, ketua: 80, super: 100 } as const;

export const PANDUAN_PORTAL: BagianPanduan[] = [
  {
    id: 'masuk', judul: 'Masuk portal & keamanan PIN', ikon: '🔐', tingkat: 0,
    ringkas: 'Portal pengelola dibuka dari logo situs. Setiap akun memakai PIN 5 angka pada papan angka yang posisinya selalu diacak.',
    langkah: [
      'Buka www.yapida.sch.id, ketuk logo Yapida di kiri atas 5 kali (atau buka alamat /masuk).',
      'Pilih nama akun Anda dari daftar.',
      'Ketik PIN 5 angka pada papan angka. Posisi angka diacak setiap kali agar PIN tidak mudah diintip.',
      'Akun baru wajib mengganti PIN awal: buka menu Akun → Ganti PIN, ketik PIN lama lalu PIN baru dua kali.',
      'Selesai bekerja, tekan Keluar (pojok kanan atas atau bawah menu).',
    ],
    kiat: ['Jangan memakai PIN yang mudah ditebak seperti 12345 atau tanggal lahir.', 'Lupa PIN? Minta Super Admin (atau kepala lembaga untuk akun di lembaganya) mengatur ulang PIN Anda di menu Akun & PIN.'],
  },
  {
    id: 'dasbor', judul: 'Dasbor', ikon: '⭐', menu: '/portal', tingkat: 0,
    ringkas: 'Halaman pertama setelah masuk: ringkasan isi lembaga dan jalan pintas ke pekerjaan yang paling sering dilakukan.',
    langkah: ['Lihat ringkasan jumlah isi dan pesan baru.', 'Ketuk kartu atau menu di kiri untuk mulai bekerja. Di ponsel, buka menu dengan tombol ☰ di kiri atas.'],
  },
  {
    id: 'pesan', judul: 'Pesan antarlembaga', ikon: '✉️', menu: '/portal/pesan', tingkat: 0,
    ringkas: 'Japri (tiket) yang privat ke Super Admin, yayasan, atau lembaga lain, dan obrolan grup seluruh lembaga.',
    langkah: [
      'Buka Pesan, pilih Japri untuk menulis kepada tujuan tertentu; percakapan tersimpan dan hanya terlihat oleh pihak terkait.',
      'Pilih Grup untuk berbicara dengan seluruh pengelola lembaga.',
      'Angka di samping menu menandakan pesan yang belum dibaca.',
    ],
    kiat: ['Obrolan grup dibersihkan setiap hari; riwayat per tanggal tersimpan paling lama 14 hari lalu terhapus permanen. Simpan informasi penting di japri atau dokumen.'],
  },
  {
    id: 'saran', judul: 'Pesan & Saran pengunjung', ikon: '💬', menu: '/portal/saran', tingkat: T.lembaga,
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
    id: 'lembaga', judul: 'Profil lembaga', ikon: '🕌', menu: '/portal/lembaga', tingkat: T.lembaga,
    ringkas: 'Data resmi lembaga: nama, alamat terstruktur, kepala, NSM, sampul, dan ringkasan yang tampil di halaman lembaga.',
    langkah: ['Buka Profil lembaga, ubah data yang perlu, lalu simpan.', 'Alamat diisi per bagian (jalan, RT/RW, desa, kecamatan, kabupaten, provinsi, kode pos) agar rapi di kop, sertifikat, dan formulir.'],
  },
  {
    id: 'isi', judul: 'Isi situs: kabar, galeri, video, agenda, dokumen, karya, SDM', ikon: '📰', cocok: ['/portal/k/'], tingkat: T.kontributor,
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
    id: 'ppdb', judul: 'PPDB: penerimaan murid baru', ikon: '📝', cocok: ['/portal/k/ppdb', '/portal/k/pendaftar'], tingkat: T.lembaga,
    ringkas: 'Membuka gelombang pendaftaran, menerima formulir calon murid, dan mengelola daftar pendaftar.',
    langkah: [
      'Buka Isi → Penerimaan murid baru, tambah gelombang (tanggal buka dan tutup, syarat, biaya).',
      'Formulir pendaftaran di situs hanya menerima isian selama gelombang dibuka.',
      'Lihat dan kelola calon murid di Isi → Pendaftar PPDB (data ini privat, hanya untuk pengelola).',
    ],
  },
  {
    id: 'bank-soal', judul: 'Bank Soal', ikon: '📚', menu: '/portal/bank-soal', cocok: ['/portal/bank-soal'], tingkat: T.kontributor,
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
    id: 'siswa', judul: 'Data siswa & impor file master', ikon: '🎒', menu: '/portal/siswa', cocok: ['/portal/siswa'], tingkat: T.lembaga,
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
    id: 'tagihan', judul: 'Tagihan, pembayaran & kwitansi', ikon: '💳', menu: '/portal/tagihan', cocok: ['/portal/tagihan', '/portal/k/kwitansi'], tingkat: T.lembaga,
    ringkas: 'Tagihan siswa (SPP dan lainnya) dibuat massal per kelas; statusnya berubah otomatis ketika pembayarannya dicatat dengan kwitansi.',
    langkah: ['Buka Tagihan & pembayaran, isi bagian Tagihan massal: jenis tagihan, periode, jumlah, jatuh tempo, lalu pilih lembaga dan kelas.', 'Ketika siswa membayar, ketuk Bayar di samping tagihannya: formulir kwitansi terbuka sudah tertaut ke tagihan itu. Simpan — status tagihan dihitung ulang otomatis (Lunas atau Sebagian, sesuai jumlah yang dibayar) dan kwitansi bernomor siap dicetak.', 'Unduh rekap tagihan sebagai Excel. Siswa dan wali melihat tagihan serta kwitansinya di Portal Siswa.'],
  },
  {
    id: 'laporan', judul: 'Laporan & grafik', ikon: '📊', menu: '/portal/laporan', tingkat: T.lembaga,
    ringkas: 'Rekap siswa, tagihan, dan pembayaran dalam tabel dan grafik.',
    langkah: ['Buka Laporan & grafik untuk membaca grafik dan tabel lembaga yang Anda kelola.', 'Unduh laporan sebagai Excel untuk rapat atau arsip.'],
  },
  {
    id: 'guru', judul: 'Impor data guru (GTK)', ikon: '👩‍🏫', menu: '/portal/guru/impor', tingkat: T.lembaga,
    ringkas: 'Memasukkan banyak data guru dan tenaga kependidikan sekaligus beserta fotonya.',
    langkah: ['Unduh templat, isi di Excel, lalu tempel atau unggah kembali.', 'Unggah banyak foto sekaligus; pembaca pintar mencocokkan foto dengan nama.', 'Guru tampil di halaman guru yayasan dan lembaga; data privat tetap tersembunyi.'],
  },
  {
    id: 'dokumen', judul: 'Sertifikat, piagam, surat & kop', ikon: '🏅', cocok: ['/portal/k/penghargaan', '/portal/k/surat', '/portal/k/kop', '/portal/penghargaan'], tingkat: T.lembaga,
    ringkas: 'Dokumen resmi siap cetak: lebih dari 10 desain sertifikat/piagam (tahfidz, lomba, ranking), surat berkop, dan kop surat per lembaga.',
    langkah: [
      'Kop surat: atur logo, nama, dan alamat lembaga sekali; semua cetakan memakai kop ini.',
      'Sertifikat & piagam: pilih desain, isi nama penerima, capaian, dan penanda tangan; nomor dibuat otomatis. Sertifikat dengan NISN juga tampil di Portal Siswa.',
      'Sertifikat massal: buat banyak sertifikat sekaligus dari daftar nama.',
      'Surat berkop: tulis perihal, tujuan, dan isi surat lalu cetak.',
    ],
  },
  {
    id: 'halaman', judul: 'Halaman', ikon: '📄', menu: '/portal/halaman', tingkat: T.lembaga,
    ringkas: 'Halaman tetap seperti visi-misi, sejarah, atau kebijakan privasi.',
    langkah: ['Tambah atau ubah halaman, tulis isinya, lalu tayangkan.', 'Tautkan halaman dari menu atau kabar agar mudah ditemukan.'],
  },
  {
    id: 'situs', judul: 'Pengaturan situs & rak perpustakaan', ikon: '⚙️', menu: '/portal/situs', cocok: ['/portal/situs', '/portal/pustaka'], tingkat: T.yayasan,
    ringkas: 'Identitas yayasan, tampilan beranda, donasi, serta pengaturan rak perpustakaan digital.',
    langkah: ['Pengaturan situs: ubah identitas, kontak, dan bagian beranda.', 'Rak perpustakaan: sembunyikan buku tertentu atau jadikan unggulan di beranda perpustakaan.'],
  },
  {
    id: 'akun', judul: 'Akun & PIN', ikon: '🗝️', menu: '/portal/pengguna', tingkat: T.kepala,
    ringkas: 'Membuat akun pengelola, mengatur peran dan lembaganya, serta mengatur ulang PIN.',
    langkah: [
      'Tambah akun: isi nama, pilih peran (Ketua Yayasan, Admin Yayasan, Kepala Lembaga, Admin Lembaga, atau Kontributor/Guru) dan lembaganya.',
      'Berikan PIN awal secara langsung kepada pemilik akun; ia wajib menggantinya saat pertama masuk.',
      'Atur ulang PIN bila pemilik akun lupa, buka kunci akun yang terkunci karena salah PIN berkali-kali, atau nonaktifkan akun yang tidak dipakai lagi.',
    ],
    kiat: ['Kepala lembaga hanya mengelola akun kontributor di lembaganya sendiri.'],
  },
  {
    id: 'log', judul: 'Log aktivitas', ikon: '📿', menu: '/portal/log', tingkat: T.ketua,
    ringkas: 'Catatan siapa melakukan apa dan kapan di portal, untuk pengawasan.',
    langkah: ['Buka Log aktivitas untuk melihat 300 aktivitas terbaru: waktu, akun, aksi, dan rinciannya.'],
  },
  {
    id: 'ganti-pin', judul: 'Ganti PIN', ikon: '🔑', menu: '/portal/akun', tingkat: 0,
    ringkas: 'Mengganti PIN akun Anda sendiri.',
    langkah: ['Buka Akun → Ganti PIN.', 'Ketik PIN lama, lalu PIN baru dua kali pada papan angka yang diacak.'],
  },
];

/** Bagian panduan untuk halaman portal yang sedang dibuka (tombol „?“ di kepala portal). */
export function jangkarPanduan(aktif: string): string {
  if (!aktif) return '';
  const pas = PANDUAN_PORTAL.find((b) => b.menu === aktif);
  if (pas) return pas.id;
  const awal = PANDUAN_PORTAL.filter((b) => b.cocok?.some((c) => aktif.startsWith(c))).sort((a, b) => Math.max(...(b.cocok ?? ['']).map((c) => (aktif.startsWith(c) ? c.length : 0))) - Math.max(...(a.cocok ?? ['']).map((c) => (aktif.startsWith(c) ? c.length : 0))));
  return awal[0]?.id ?? '';
}

const kartu = (b: BagianPanduan) => html`<details class="pd-bagian" id="${b.id}" data-pd-bagian data-cari="${`${b.judul} ${b.ringkas} ${b.langkah.join(' ')}`.toLowerCase()}">
  <summary><span class="pd-ikon" aria-hidden="true">${b.ikon}</span><span class="pd-judul"><strong>${b.judul}</strong><small>${b.ringkas}</small></span><span class="pd-panah" aria-hidden="true">⌄</span></summary>
  <div class="pd-isi">
    <ol class="pd-langkah">${b.langkah.map((l) => html`<li>${l}</li>`)}</ol>
    ${b.kiat?.length ? html`<div class="pd-kiat"><b>Kiat</b><ul>${b.kiat.map((k) => html`<li>${k}</li>`)}</ul></div>` : ''}
    ${b.menu ? html`<a class="tbl tbl-garis tbl-kecil" href="${b.menu}">Buka menu ini →</a>` : ''}
  </div>
</details>`;

export function panduanPortalPage(o: { tingkat: number; semua: boolean }): Raw {
  const daftar = PANDUAN_PORTAL.filter((b) => o.semua || b.tingkat <= o.tingkat);
  const tersembunyi = PANDUAN_PORTAL.length - daftar.length;
  return html`<div class="pd">
  <div class="p-kartu pd-kepala">
    <div><h2>Panduan portal pengelola</h2><p class="p-kecil">Setiap menu dijelaskan langkah demi langkah. Ketuk sebuah judul untuk membuka. Di setiap halaman portal, tombol <b>?</b> di kepala halaman langsung membuka panduan menu tersebut.</p></div>
    <label class="pd-cari"><span class="sr-only">Cari panduan</span><input type="search" placeholder="Cari: PIN, cetak sertifikat, bagikan soal…" data-pd-cari></label>
  </div>
  <nav class="pd-daftar" aria-label="Daftar isi panduan">${daftar.map((b) => html`<a href="#${b.id}" data-pd-tautan="${b.id}"><span aria-hidden="true">${b.ikon}</span>${b.judul}</a>`)}</nav>
  <div class="pd-kumpulan">${daftar.map(kartu)}</div>
  <p class="pd-kosong p-kecil" data-pd-kosong hidden>Tidak ada panduan yang cocok. Coba kata lain.</p>
  ${tersembunyi && !o.semua ? html`<p class="p-kecil">Menampilkan menu yang tersedia untuk akun Anda. <a href="/portal/panduan?semua=1">Lihat panduan semua menu (${PANDUAN_PORTAL.length})</a>.</p>` : ''}
  <div class="p-kartu pd-siswa"><h2>Panduan untuk siswa</h2><p class="p-kecil">Bagikan tautan ini kepada siswa dan wali: cara masuk Portal Siswa, mengerjakan latihan soal, membaca buku pelajaran, serta melihat tagihan dan sertifikat.</p><a class="tbl tbl-emas tbl-kecil" href="/siswa/panduan" target="_blank" rel="noopener">Buka panduan siswa →</a></div>
</div>
<script>(function(){var c=document.querySelector('[data-pd-cari]');var b=[].slice.call(document.querySelectorAll('[data-pd-bagian]'));var k=document.querySelector('[data-pd-kosong]');function buka(){var h=location.hash.slice(1);if(!h)return;var d=document.getElementById(h);if(d&&d.tagName==='DETAILS'){d.open=true;d.scrollIntoView({block:'start'});}}window.addEventListener('hashchange',buka);buka();if(c)c.addEventListener('input',function(){var q=c.value.trim().toLowerCase();var n=0;b.forEach(function(x){var ok=!q||x.getAttribute('data-cari').indexOf(q)>=0;x.hidden=!ok;if(ok)n++;if(q&&ok)x.open=true;});document.querySelectorAll('[data-pd-tautan]').forEach(function(a){var d=document.getElementById(a.getAttribute('data-pd-tautan'));a.hidden=!!(d&&d.hidden);});if(k)k.hidden=n>0;});})();</script>`;
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
    <p class="psw-catatan">Tidak bisa masuk? Pastikan NISN/NIS dan tanggal lahir benar, lalu hubungi wali kelas atau admin madrasah. Siswa yang sudah lulus, pindah, atau keluar tidak dapat masuk lagi.</p>`,
  },
  {
    id: 'beranda', ikon: '🏠', judul: 'Beranda siswa',
    isi: html`<p>Sesudah masuk, beranda menampilkan identitas dan kelasmu, perjalanan kelas dari tahun ke tahun, latihan soal untuk kelasmu, tagihan dan kwitansi, sertifikat atau piagam yang kamu terima, serta tautan ke rak buku jenjangmu di perpustakaan digital.</p>`,
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
    <p class="psw-catatan">Soal ujian PTS dan PAS hanya muncul bila gurumu sudah membagikannya sesudah ujian selesai.</p>`,
  },
  {
    id: 'buku', ikon: '📚', judul: 'Membaca buku pelajaran',
    isi: html`<ol class="psw-langkah">
      <li>Buka menu <b>Belajar → Pelajaran madrasah</b>, pilih jenjang dan kelasmu.</li>
      <li>Ketuk mata pelajaran, lalu buku pelajarannya. Setiap bab bisa <b>dibacakan</b> dengan penanda kata.</li>
      <li>Jawab <b>kuis</b> di setiap bab; pembahasan muncul sesudah kamu menjawab benar. Kuis yang sama menjadi latihan semesteran di Bank Soal.</li>
    </ol>`,
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
  return html`<section class="sw-hero sw-hero-kecil"><div class="sw-hero-isi"><div><p class="kicker">Portal Siswa</p><h1>Panduan siswa</h1><p class="sw-kelas">Cara masuk, mengerjakan latihan soal, membaca buku pelajaran, dan melihat tagihan serta sertifikat.</p></div><a class="tbl tbl-kaca tbl-kecil" href="/siswa">${o.masuk ? '← Beranda siswa' : 'Masuk Portal Siswa →'}</a></div></section>
<div class="wadah sw-isi psw">
  <nav class="psw-daftar" aria-label="Daftar isi">${LANGKAH_SISWA.map((l) => html`<a href="#${l.id}"><span aria-hidden="true">${l.ikon}</span>${l.judul}</a>`)}</nav>
  ${LANGKAH_SISWA.map((l, i) => html`<section class="sw-kartu psw-bagian" id="${l.id}"><h2><span class="psw-no">${i + 1}</span><span aria-hidden="true">${l.ikon}</span> ${l.judul}</h2>${l.isi}</section>`)}
  <p class="sw-kecil">${raw('Pertanyaan lain? Kirim lewat <a href="/saran">Pesan &amp; Saran</a> dan pilih lembagamu.')}</p>
</div>`;
}
