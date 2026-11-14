/**
 * Isi awal situs — ditulis SEKALI ke R2 (create-once), lalu sepenuhnya milik portal: suntingan admin tidak pernah
 * ditimpa. Sumber: dokumen yayasan yang dikirim pemilik (14 Nov 2026) — akta pendirian, SK pengesahan badan hukum,
 * NPWP, buku rekening, dan lembar "Latar Belakang dan Profil Madrasah" MI Al Huda. NIK, nomor telepon pribadi, dan
 * gambar dokumennya tidak dimuat. Lembaga yang datanya belum ada hanya diberi penjelasan jenis lembaganya — angka,
 * nama kepala, dan tahun diisi admin lembaga lewat portal, tidak dikarang di sini.
 */
import type { Halaman, Situs, Unit } from './data/model.ts';
import { renderMarkdown } from './lib/markdown.ts';

export const SEED_VERSION = 1;

const ALAMAT = 'Jl. Yapida No. 3, Kp. Kuda-kuda RT 003 RW 002, Desa Sukakarya, Kecamatan Sukakarya, Kabupaten Bekasi, Jawa Barat 17641';

const SEJARAH = `Yayasan Al-Huda Yapida tumbuh dari sebuah pengajian anak-anak di Kampung Kuda-kuda, Sukakarya. Pada tahun 1967 H. Moh. Hilwani membuka pengajian di rumahnya: mulai pukul 14.00 sampai waktu shalat Ashar, lalu dilanjutkan selepas Maghrib sampai Isya.

Di pengajian itu anak-anak belajar membaca Al-Qur'an dengan metode Baghdadi, lalu membaca dan memahami kitab kuning: fikih dari *Safinatun Najah*, nahwu dan sharaf dari *Al-Jurumiyyah* dan *Kailani*, akidah dari *Tijan ad-Darari*, dan tuntunan ibadah dari *Maraqil 'Ubudiyyah*.

Dukungan warga dan semangat anak-anak membuat pengajian terus membesar. Pelajaran umum ditambahkan, murid dibagi per tingkat, dan kegiatan belajar menjadi sekolah. Pada tahun 1970 pengajian itu diresmikan menjadi madrasah dengan nama awal MI Hidayatush Shibyan, di atas sebidang tanah kurang lebih 1.500 m².

Pada tahun 1993 berdiri Yayasan Perguruan Islam Al Huda, dan nama madrasah berubah menjadi MI Al Huda. Pada 24 Desember 2015 dibuat akta pendirian **Yayasan Al-Huda Yapida**, yang disahkan sebagai badan hukum oleh Menteri Hukum dan Hak Asasi Manusia pada 26 Desember 2015.

Dari satu pengajian sore, Yapida kini menaungi sarana ibadah, pendidikan formal dan nonformal, unit ekonomi, dan layanan sosial untuk warga Sukakarya dan sekitarnya.`;

export function seedSitus(now: number): Situs {
  return {
    nama: 'Yayasan Al-Huda Yapida',
    singkatan: 'YAPIDA',
    slogan: 'Dari pengajian sore tahun 1967 menjadi rumah ibadah, sekolah, pesantren, usaha, dan layanan sosial bagi warga Sukakarya.',
    deskripsi: 'Yayasan Al-Huda Yapida di Sukakarya, Kabupaten Bekasi, menaungi masjid dan musholla, RA, MI, MTs, pondok pesantren, TPQ, majelis taklim, BLKK, BMT, koperasi, minimarket, LKSA, santunan, dan UPZ.',
    alamat: { jalan: 'Jl. Yapida No. 3, Kp. Kuda-kuda RT 003 RW 002', desa: 'Sukakarya', kecamatan: 'Sukakarya', kabupaten: 'Kabupaten Bekasi', provinsi: 'Jawa Barat', kodepos: '17641' },
    kontak: {},
    sosmed: {},
    legal: {
      akta: { nomor: '16', tanggal: '2015-12-24', notaris: 'Yatin Rufiatina, S.H., M.H. — Notaris di Kabupaten Bekasi' },
      sk: { nomor: 'AHU-0033503.AH.01.04.Tahun 2015', tanggal: '2015-12-26', tentang: 'Keputusan Menteri Hukum dan Hak Asasi Manusia Republik Indonesia tentang Pengesahan Pendirian Badan Hukum Yayasan Al-Huda Yapida' },
      daftar: 'AHU-0033503.AH.01.12.Tahun 2015',
      npwp: '74.836.712.5-414.000',
      kpp: 'KPP Pratama Cikarang Utara',
    },
    pendiri: ['Fadli Robbi, S.Ag.', 'H. Karnada', 'H. Suherman', 'Hj. Latifah', 'Yayah Hipdiyah, S.Pd.I.'],
    organ: [
      { organ: 'Pembina', jabatan: 'Ketua', nama: 'Hj. Latifah' },
      { organ: 'Pembina', jabatan: 'Anggota', nama: 'H. Karnada' },
      { organ: 'Pengurus', jabatan: 'Ketua', nama: 'Fadli Robbi, S.Ag.' },
      { organ: 'Pengurus', jabatan: 'Sekretaris', nama: 'H. Suherman' },
      { organ: 'Pengurus', jabatan: 'Bendahara', nama: 'Linda Maulida ‘Aini, S.E.' },
      { organ: 'Pengawas', jabatan: 'Ketua', nama: 'Yayah Hipdiyah, S.Pd.I.' },
      { organ: 'Pengawas', jabatan: 'Anggota', nama: 'Hamdani Darusalam' },
    ],
    organCatatan: 'Susunan organ menurut lampiran SK pengesahan badan hukum, 26 Desember 2015.',
    sejarah: SEJARAH,
    sejarahHtml: renderMarkdown(SEJARAH),
    linimasa: [
      { tahun: '1967', judul: 'Pengajian sore di rumah H. Moh. Hilwani', isi: 'Anak-anak Kampung Kuda-kuda mengaji dari pukul 14.00 sampai Ashar, lalu selepas Maghrib sampai Isya: Al-Qur’an dengan metode Baghdadi dan kitab kuning.' },
      { tahun: '1970', judul: 'Pengajian menjadi madrasah', isi: 'Pelajaran umum ditambahkan dan murid dibagi per tingkat. Madrasah diresmikan dengan nama awal MI Hidayatush Shibyan, di atas tanah kurang lebih 1.500 m².' },
      { tahun: '1993', judul: 'Yayasan Perguruan Islam Al Huda berdiri', isi: 'Madrasah berganti nama menjadi MI Al Huda dan bernaung di bawah yayasan.' },
      { tahun: '2015', judul: 'Berbadan hukum sebagai Yayasan Al-Huda Yapida', isi: 'Akta pendirian No. 16 tanggal 24 Desember 2015, disahkan Menteri Hukum dan HAM pada 26 Desember 2015.' },
    ],
    donasi: {
      tampil: true,
      rekening: [{ bank: 'bank bjb — KCP Cikarang', nomor: '0120766066100', atasNama: 'Yayasan Al-Huda Yapida' }],
      catatan: 'Rekening resmi atas nama yayasan. Mohon tidak mengirim ke rekening atas nama perorangan.',
    },
    ubah: now,
  };
}

interface UnitAwal extends Omit<Unit, 'ubah' | 'aktif' | 'profilHtml' | 'sejarahHtml'> {}

const MI_PROFIL = `MI Al Huda adalah madrasah ibtidaiyah swasta di Kampung Kuda-kuda, Desa Sukakarya. Kegiatan belajar berlangsung pagi hari, mulai pukul 06.30 sampai 13.00 WIB, dengan kurikulum Dinas Pendidikan, Kementerian Agama, dan muatan lokal madrasah.

Ciri khas MI Al Huda ada dua: pembiasaan yang membentuk karakter santri sehari-hari, dan penguasaan tahfidz Al-Qur'an.

## Lingkungan madrasah

Madrasah berdiri di tengah permukiman berpenduduk sekitar 2.000 jiwa. Seluruh warganya beragama Islam, dan sebagian besar bekerja sebagai petani dan buruh tani. Madrasah lahir dari dukungan warga itu sendiri, dan sampai hari ini menjadi tempat anak-anak mereka belajar.

## Sarana

Madrasah memiliki enam ruang kelas, satu sarana ibadah, satu ruang guru, dan enam toilet. Semuanya masih perlu ditingkatkan, dan madrasah membutuhkan ruang tambahan untuk perpustakaan, tata usaha, dan UKS.`;

const MI_SEJARAH = `MI Al Huda berawal dari pengajian anak-anak yang dipelopori H. Moh. Hilwani pada tahun 1967. Pengajian diadakan di rumah beliau, dari pukul 14.00 sampai waktu shalat Ashar, lalu dilanjutkan selepas Maghrib sampai Isya.

Beliau mengajarkan cara membaca Al-Qur'an dengan metode Baghdadi, serta membaca dan memahami kitab kuning: fikih (*Safinah*), ilmu alat nahwu dan sharaf (*Jurumiyyah* dan *Kailani*), akidah (*Tijan ad-Darari*), dan ibadah (*Maraqil 'Ubudiyyah*).

Karena dukungan masyarakat dan antusiasme anak-anak, pengajian itu berkembang: pelajaran umum ditambahkan dan murid dibedakan per tingkat, sampai berbentuk sekolah. Pada tahun 1970 pengajian diresmikan menjadi madrasah dengan nama awal MI Hidayatush Shibyan, di atas tanah kurang lebih 1.500 m².

Pada tahun 1993 berdiri Yayasan Perguruan Islam Al Huda, dan nama madrasah pun berubah menjadi MI Al Huda.`;

const awal = (u: Partial<UnitAwal> & Pick<UnitAwal, 'slug' | 'nama' | 'singkat' | 'jenis' | 'kelompok' | 'urut' | 'ringkas' | 'profil'>): UnitAwal => ({ suara: 'dewasa', ...u });

export const SEED_UNITS: UnitAwal[] = [
  awal({
    slug: 'masjid-jami-al-huda', nama: 'Masjid Jami’ Al Huda', singkat: 'Masjid Jami’ Al Huda', jenis: 'Masjid jami’', kelompok: 'ibadah', urut: 1,
    ringkas: 'Masjid jami’ di lingkungan Yapida: tempat shalat berjamaah, shalat Jumat, dan pengajian warga Sukakarya.',
    profil: 'Masjid Jami’ Al Huda adalah masjid utama di lingkungan Yayasan Al-Huda Yapida. Di sinilah jamaah menunaikan shalat lima waktu berjamaah dan shalat Jumat, dan di sini pula santri, siswa madrasah, dan warga berkumpul untuk mengaji.\n\nJadwal kajian, khutbah, dan kegiatan hari besar Islam diumumkan pengurus masjid melalui halaman ini.',
  }),
  awal({
    slug: 'musholla-al-huda', nama: 'Musholla Al Huda', singkat: 'Musholla Al Huda', jenis: 'Musholla', kelompok: 'ibadah', urut: 2,
    ringkas: 'Musholla di lingkungan Yapida: tempat shalat berjamaah harian bagi warga dan santri di sekitarnya.',
    profil: 'Musholla Al Huda adalah tempat shalat berjamaah harian bagi warga dan santri di sekitarnya.\n\nKegiatan musholla diumumkan pengurusnya melalui halaman ini.',
  }),
  awal({
    slug: 'ra-al-huda', nama: 'RA Al Huda', singkat: 'RA Al Huda', jenis: 'Raudhatul Athfal', kelompok: 'formal', urut: 3, suara: 'balita',
    ringkas: 'Raudhatul Athfal — pendidikan anak usia dini bercirikan Islam, setara taman kanak-kanak, di bawah Yayasan Al-Huda Yapida.',
    profil: 'RA Al Huda adalah Raudhatul Athfal, jenjang pendidikan anak usia dini bercirikan Islam yang setara dengan taman kanak-kanak. Anak belajar sambil bermain: mengenal huruf dan angka, huruf hijaiyah, doa harian, dan pembiasaan akhlak, sebagai bekal sebelum masuk madrasah ibtidaiyah.\n\nLulusan RA Al Huda dapat melanjutkan ke MI Al Huda yang berada di lingkungan yang sama.',
    kelas: ['Kelompok A', 'Kelompok B'],
  }),
  awal({
    slug: 'mi-al-huda', nama: 'MIS Al Huda', singkat: 'MI Al Huda', jenis: 'Madrasah Ibtidaiyah Swasta', kelompok: 'formal', urut: 4, suara: 'anak',
    ringkas: 'Madrasah ibtidaiyah yang berdiri sejak 1970: kurikulum Dinas Pendidikan dan Kemenag, pembiasaan karakter, dan tahfidz Al-Qur’an.',
    profil: MI_PROFIL,
    sejarah: MI_SEJARAH,
    kepala: { nama: 'Fadli Robbi', jabatan: 'Kepala Madrasah' },
    berdiri: '1970',
    pendiri: 'H. Moh. Hilwani',
    angka: [{ label: 'Santri', nilai: '153' }, { label: 'Ustadz & ustadzah', nilai: '11' }, { label: 'Ruang kelas', nilai: '6' }, { label: 'Berdiri', nilai: '1970' }],
    program: ['Tahfidz Al-Qur’an', 'Pembiasaan karakter'],
    kelas: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
    fasilitas: ['6 ruang kelas', '1 sarana ibadah', '1 ruang guru', '6 toilet'],
    jadwal: 'Pagi hari, pukul 06.30–13.00 WIB',
    kurikulum: 'Kurikulum Dinas Pendidikan, Kementerian Agama, dan muatan lokal',
    alamat: 'Jl. Yapida, Kp. Kuda-kuda RT 003 RW 002, Desa Sukakarya, Kecamatan Sukakarya, Kabupaten Bekasi 17641',
  }),
  awal({
    slug: 'mts-al-huda', nama: 'MTs Al Huda', singkat: 'MTs Al Huda', jenis: 'Madrasah Tsanawiyah', kelompok: 'formal', urut: 5, suara: 'remaja',
    ringkas: 'Madrasah Tsanawiyah — jenjang menengah pertama bercirikan Islam, kelanjutan MI di lingkungan Yapida.',
    profil: 'MTs Al Huda adalah Madrasah Tsanawiyah, jenjang pendidikan menengah pertama bercirikan Islam yang setara dengan SMP. Selain mata pelajaran umum, siswa mendalami Al-Qur’an Hadis, Akidah Akhlak, Fikih, Sejarah Kebudayaan Islam, dan Bahasa Arab.\n\nMTs Al Huda menjadi kelanjutan bagi lulusan MI Al Huda dan sekolah dasar di sekitar Sukakarya.',
    kelas: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  }),
  awal({
    slug: 'ponpes-al-huda', nama: 'Pondok Pesantren Al Huda', singkat: 'Ponpes Al Huda', jenis: 'Pondok pesantren', kelompok: 'formal', urut: 6, suara: 'remaja',
    ringkas: 'Pondok pesantren Yapida: santri mendalami Al-Qur’an dan kitab kuning, meneruskan tradisi pengajian sejak 1967.',
    profil: 'Pondok Pesantren Al Huda meneruskan tradisi yang menjadi awal mula Yapida: mengaji Al-Qur’an dan kitab kuning. Sejak pengajian pertama tahun 1967, kitab yang dipelajari mencakup fikih (*Safinatun Najah*), nahwu dan sharaf (*Al-Jurumiyyah*, *Kailani*), akidah (*Tijan ad-Darari*), dan ibadah (*Maraqil ‘Ubudiyyah*).\n\nProgram, jadwal mengaji, dan penerimaan santri diumumkan pengurus pesantren melalui halaman ini.',
  }),
  awal({
    slug: 'tpq-al-huda', nama: 'TPQ Al Huda', singkat: 'TPQ Al Huda', jenis: 'Taman Pendidikan Al-Qur’an', kelompok: 'nonformal', urut: 7, suara: 'anak',
    ringkas: 'Taman Pendidikan Al-Qur’an: tempat anak-anak di sekitar Yapida belajar membaca Al-Qur’an tahap demi tahap.',
    profil: 'TPQ Al Huda adalah Taman Pendidikan Al-Qur’an bagi anak-anak di sekitar Yapida. Di TPQ, anak belajar mengenal huruf hijaiyah dan membaca Al-Qur’an dengan tajwid, tahap demi tahap.\n\nJadwal mengaji dan pendaftaran diumumkan pengurus TPQ melalui halaman ini.',
  }),
  awal({
    slug: 'majlis-talim-al-huda', nama: 'Majlis Ta’lim Al Huda', singkat: 'Majlis Ta’lim Al Huda', jenis: 'Majelis taklim', kelompok: 'nonformal', urut: 8,
    ringkas: 'Majelis taklim Yapida: pengajian rutin tempat warga Sukakarya memperdalam ilmu agama.',
    profil: 'Majlis Ta’lim Al Huda adalah wadah pengajian rutin bagi warga — majelis ilmu tempat jamaah memperdalam Al-Qur’an, tuntunan ibadah, dan akhlak.\n\nJadwal pengajian dan pengisi kajian diumumkan pengurus majelis melalui halaman ini.',
  }),
  awal({
    slug: 'blkk-al-huda', nama: 'BLKK Al Huda', singkat: 'BLKK Al Huda', jenis: 'Balai Latihan Kerja Komunitas', kelompok: 'nonformal', urut: 9,
    ringkas: 'Balai Latihan Kerja Komunitas: pelatihan keterampilan kerja bagi santri dan warga sekitar Yapida.',
    profil: 'BLKK Al Huda adalah Balai Latihan Kerja Komunitas, tempat santri dan warga sekitar mengikuti pelatihan keterampilan kerja agar siap bekerja atau membuka usaha sendiri.\n\nKejuruan yang dibuka, jadwal angkatan, dan cara mendaftar diumumkan pengelola BLKK melalui halaman ini.',
  }),
  awal({
    slug: 'bmt-al-huda', nama: 'BMT Al Huda', singkat: 'BMT Al Huda', jenis: 'Baitul Maal wat Tamwil', kelompok: 'ekonomi', urut: 10,
    ringkas: 'Baitul Maal wat Tamwil: simpanan dan pembiayaan dengan akad syariah untuk anggota dan usaha kecil warga.',
    profil: 'BMT Al Huda adalah Baitul Maal wat Tamwil, lembaga keuangan mikro syariah. Sisi *tamwil* melayani simpanan dan pembiayaan anggota dengan akad syariah; sisi *maal* menyalurkan dana kebajikan.\n\nProduk, syarat keanggotaan, dan jam layanan diumumkan pengelola BMT melalui halaman ini.',
  }),
  awal({
    slug: 'koperasi-al-huda', nama: 'Koperasi Al Huda', singkat: 'Koperasi Al Huda', jenis: 'Koperasi', kelompok: 'ekonomi', urut: 11,
    ringkas: 'Koperasi Yapida: usaha bersama yang dimiliki dan dikelola para anggotanya.',
    profil: 'Koperasi Al Huda adalah usaha bersama milik para anggotanya: dikelola anggota, untuk kebutuhan anggota, dan hasil usahanya kembali kepada anggota.\n\nUnit usaha, syarat menjadi anggota, dan laporan tahunan diumumkan pengurus koperasi melalui halaman ini.',
  }),
  awal({
    slug: 'al-huda-mart', nama: 'Al Huda Mart', singkat: 'Al Huda Mart', jenis: 'Minimarket', kelompok: 'ekonomi', urut: 12,
    ringkas: 'Toko swalayan Yapida: kebutuhan harian santri, wali santri, dan warga sekitar.',
    profil: 'Al Huda Mart adalah toko swalayan di lingkungan Yapida yang menyediakan kebutuhan harian santri, wali santri, dan warga sekitar.\n\nJam buka dan informasi produk diumumkan pengelola melalui halaman ini.',
  }),
  awal({
    slug: 'lksa-al-huda', nama: 'LKSA Al Huda', singkat: 'LKSA Al Huda', jenis: 'Lembaga Kesejahteraan Sosial Anak', kelompok: 'sosial', urut: 13,
    ringkas: 'Lembaga Kesejahteraan Sosial Anak: pengasuhan dan perlindungan bagi anak yatim, piatu, dan dhuafa.',
    profil: 'LKSA Al Huda adalah Lembaga Kesejahteraan Sosial Anak. Lembaga ini menyelenggarakan pengasuhan dan perlindungan bagi anak yang membutuhkan — seperti anak yatim, piatu, dan anak dari keluarga dhuafa — agar mereka tumbuh dengan pendidikan dan kasih sayang yang layak.\n\nKegiatan anak asuh dan cara berdonasi diumumkan pengurus LKSA melalui halaman ini.',
  }),
  awal({
    slug: 'santunan', nama: 'Santunan Al Huda', singkat: 'Santunan', jenis: 'Program santunan', kelompok: 'sosial', urut: 14,
    ringkas: 'Program santunan Yapida untuk anak yatim, dhuafa, dan warga yang membutuhkan.',
    profil: 'Santunan adalah program sosial Yapida untuk anak yatim, keluarga dhuafa, dan warga yang sedang membutuhkan uluran tangan. Dana berasal dari donatur dan disalurkan pada waktu-waktu yang diumumkan pengurus.\n\nLaporan penyaluran dan jadwal santunan diumumkan melalui halaman ini.',
  }),
  awal({
    slug: 'upz-al-huda', nama: 'UPZ Al Huda', singkat: 'UPZ Al Huda', jenis: 'Unit Pengumpul Zakat', kelompok: 'sosial', urut: 15,
    ringkas: 'Unit Pengumpul Zakat: membantu warga menunaikan zakat, infak, dan sedekah sampai kepada yang berhak.',
    profil: 'UPZ Al Huda adalah Unit Pengumpul Zakat. Unit ini membantu jamaah dan warga menunaikan zakat, infak, dan sedekah, agar sampai kepada mereka yang berhak menerimanya (*mustahik*).\n\nCara menunaikan zakat dan laporan penyaluran diumumkan pengurus UPZ melalui halaman ini.',
  }),
];

export function seedUnit(u: UnitAwal, now: number): Unit {
  return { ...u, aktif: true, ubah: now, profilHtml: renderMarkdown(u.profil), sejarahHtml: u.sejarah ? renderMarkdown(u.sejarah) : undefined, alamat: u.alamat ?? ALAMAT };
}

const PRIVASI = `Halaman ini menjelaskan data apa yang diproses ketika Anda membuka yapida.sch.id, untuk apa, dan pilihan yang Anda miliki.

## Data yang Anda kirim sendiri

- **Pesan.** Jika Anda mengirim pesan lewat formulir kontak, kami menyimpan nama, kontak yang Anda tulis, dan isi pesannya supaya pengurus bisa membalas.
- **Akun portal.** Pengurus, admin lembaga, dan kontributor masuk dengan e-mail dan sandi. Sandi disimpan dalam bentuk hash, bukan teks aslinya.
- **Karya dan foto kegiatan.** Karya tulis dan foto yang tayang diunggah oleh admin lembaga. Bila ada nama atau foto yang ingin Anda ubah atau turunkan, hubungi lembaga terkait atau pengurus yayasan.

## Data teknis

Situs berjalan di jaringan Cloudflare. Seperti semua situs web, server menerima alamat IP dan jenis peramban Anda saat halaman diminta; kami memakainya untuk keamanan dan pembatasan penyalahgunaan (misalnya percobaan masuk berulang), tidak untuk mengenali Anda secara pribadi.

Pilihan tampilan (tema terang atau malam, ukuran huruf, suara pembaca) disimpan di peramban Anda sendiri, bukan di server kami.

## Iklan Google AdSense

Sebagian halaman memuat iklan dari Google AdSense. Google dan mitranya memakai cookie untuk menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain. Anda dapat mematikan iklan yang dipersonalisasi di [Setelan Iklan Google](https://adssettings.google.com/), dan membaca cara Google memakai data di [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

Portal pengurus serta halaman baca dan latihan untuk jenjang anak tidak memuat iklan.

## Video dan siaran langsung

Video YouTube, Facebook, dan TikTok baru dimuat setelah Anda menekan tombol putar. Setelah itu, layanan tersebut dapat memasang cookie-nya sendiri sesuai kebijakan masing-masing.

## Menghubungi kami

Permintaan melihat, memperbaiki, atau menghapus data dapat disampaikan lewat halaman [Kontak](/kontak).`;

const SYARAT = `Dengan memakai yapida.sch.id Anda menyetujui ketentuan berikut.

## Isi situs

Profil lembaga, kabar, galeri, video, dan pengumuman diisi oleh pengurus yayasan dan admin tiap lembaga. Kami berusaha menjaga isinya benar dan terbaru; bila Anda menemukan kekeliruan, sampaikan lewat halaman [Kontak](/kontak).

## Perpustakaan digital dan bank soal

Bahan di perpustakaan berasal dari tiga jalur: tulisan dan modul milik lembaga, karya domain publik atau berlisensi terbuka yang mencantumkan sumber dan lisensinya, dan tautan ke situs resmi penerbitnya. Hak cipta setiap bahan tetap pada pemiliknya; lisensi yang tertulis di halaman bahan itulah yang berlaku.

Soal latihan disusun guru dan admin lembaga untuk belajar mandiri. Nilai latihan di situs ini bukan nilai rapor.

## Karya tulis

Karya tulis santri, siswa, guru, dan lembaga tayang atas nama penulisnya. Karya boleh dikutip dengan menyebut nama penulis dan lembaganya; untuk menerbitkan ulang secara utuh, mintalah izin kepada lembaga terkait.

## Pemakaian yang wajar

Jangan memakai situs ini untuk mengirim spam, mencoba masuk ke akun orang lain, atau mengganggu layanan. Akun portal yang disalahgunakan dapat dinonaktifkan.

## Perubahan

Ketentuan ini dapat diperbarui. Tanggal pembaruan terakhir tertera di bawah halaman ini.`;

export function seedHalaman(now: number): Halaman[] {
  const h = (slug: string, judul: string, ringkas: string, isi: string): Halaman => ({ slug, judul, ringkas, isi, isiHtml: renderMarkdown(isi), kaki: true, ubah: now });
  return [
    h('kebijakan-privasi', 'Kebijakan Privasi', 'Data apa yang diproses ketika Anda membuka yapida.sch.id, untuk apa, dan pilihan yang Anda miliki.', PRIVASI),
    h('syarat-penggunaan', 'Syarat Penggunaan', 'Ketentuan memakai situs, perpustakaan digital, bank soal, dan karya tulis di yapida.sch.id.', SYARAT),
  ];
}
