# yapida.sch.id — Blueprint

**Situs Yayasan Al-Huda Yapida (Sukakarya, Kabupaten Bekasi): profil yayasan dan 15 lembaga, portal berjenjang,
perpustakaan digital bersuara, bank soal, PPDB, galeri, video dan siaran langsung.**

Folder `yapida/` · Worker `yapida-sch-id` · deploy `.github/workflows/deploy-yapida.yml` · uji
`.github/workflows/yapida-ci.yml` · data hanya di R2 (`CLAUDE.md`, `docs/R2-DATA-BLUEPRINT.md`).

## 0. Perintah pemilik (14 Nov 2026) — dicatat sebelum dibangun

1. „Tolong buatin gabung di repo ulyah.com dengan nama situs yapida.sch.id tp blm sy input di CF... Bikin website Yayasan
   yg semua dynamic page 100%, punya galeri foto kegiatan, terkoneksi live yg bisa di ambil dr link youtube, facebook,
   tiktok, atau video kegiatan yg di ambil dr youtube. Punya portal super admin, portal ketua yayasan, portal admin
   yayasan, dan seterusnya setiap lembaga untuk mengisi yg profil atau kegiatan yg mau di isi...“
   Lembaga: **Sarana ibadah** — Masjid Jami' Al Huda, Musholla Al Huda · **Pendidikan formal** — RA, MIS, MTs, Ponpes
   Al Huda · **Pendidikan nonformal** — TPQ, Majlis Ta'lim, BLKK Al Huda · **Ekonomi** — BMT, Koperasi, Al Huda Mart ·
   **Sosial** — LKSA Al Huda, Santunan, UPZ Al Huda.
   „website ini harus website interaktif punya perpusatakaan digital setiap lembaga dan jenjang serta kelas dan program,
   cari dari sumber manapun yg mengizinkan datanya bisa di serap tanpa perlu izin... Lihat dari program yg yapida miliki,
   cari sumber manapun untuk mendesign website ini... Termasuk bikin karya tulis mandiri dari mulai lembaga sampai santri
   yg di upload oleh masing2 admin lembaga... Profile2 lembaga, social media dll“
2. „Kirim link worker nya dulu agar bisa d pantau, jgn pernah ninggalin PR & merge, pastikan sampe bersih.. Masukin ini jg
   di dns nya buat SEO nya, wajib niche super kuat google-site-verification=bjY3kPqlIrDvvijaNrLGVT9vevYwS0Oy0irpogXLTb8,
   juga kode adsense make yg tumpuk yg sudah ada... untuk upload document jgn make yg sy kirim krn gambarnya jelek, tp
   buatkan aja di portalnya jika lembaga ingin publik document.. Document yg sy kirim sebagai acuan awal yg anda harus isi.
   Buku wajib bisa di bacakan dengan suara yg pas sesuai dengan kelas nya, mulai dari TK, MI, MTs dan lembaga lain, dengan
   speling sesuai bahasanya, Arab ya bahasa Arab, Inggris ya speling Inggris... Perpusatakaan buku digital termasuk juga
   bank soal setiap lembaga“
3. „Masukin kode adsense ini juga di semua website google.com, pub-6701063918838796, DIRECT, f08c47fec0942fa0“ (→
   `docs/ADSENSE-BLUEPRINT.md` §23.7) · „Tolong CSS nya super premium enterprice, dan font2 indah, serta web sangat
   interaktif, bisa di mainkan. nuansa islami yg kuat.. Cover dan buku nya ubah jadi lebih interaktif“
4. „Jangan lupa untuk penerimaan siswa baru setiap lembaga 2027 dan seterusnya... Pastikan seluruh website nya dynamic
   page, dna husus super admin mampu mengelola semua dan yg lain mengelola lembaga nya masing2“
5. „Pastikan website yapida.sch.id bisa di install di HP dan hilang ketika sudah d install dan muncul lg klo install di
   hapus, dan ada hitungan 10 buku yg sering di baca, yg paling favorite. Bikin rancangan perpusatakaan se interaktif dan
   seprofesional mungkin, dengan cover2 menarik, suara2 yg unik, cari puluhan ribu-ratusan ribu buku dengan kategori yg
   sesuai, dan juga bacaan2 buat guru dan ustad ustadzah nya yg menarik, pastikan buku yg di bacakan auto scroll, auto
   pindah halaman sampai satu buku habis di bacakan. Buku pelajarannya di ubah agar lebih interaktif dan menarik, jika di
   perlukan memiliki animasi interaktif“
6. „Jgn lupa buatkan profile struktural masing2 lembaga + guru2nya yg bisa di CRUD di masing2 lembaga, tp super admin bisa
   crud seluruh lembaga... tp setiap lembaga adalah karyawan yayasan, artinya seluruhnya muncul di yayasan Al-Huda yapida
   yg ngelink ke masing2 lembaga... Foto2 profile ketua yayasan dan seluruh jajaranya termasuk kepala kepala dan guru2 di
   input manual, juga profile pendiri yayasan Al-Huda yapida...“

7. „Masukin beberapa app kaya radio quran, arah kiblat, jadwal sholat, kalender, hitung mundur puasa, tp kembangin lg biar
   lebih interaktif, ambil dr ulyah.com + alquran Utsmani dengan tafsirnya... Bikin semua lebih bagus lebih interaktif,
   lebih super premium“ · „Perpustakaanya bikin seperti wordwall“

8. „Untuk login ke masing2 lembaga, pake dropdown aja username nya, jd tinggal masukin password... Pasword nya di bulak balik aja
   dari angka 0-9 cukup 5 angka, tolong bikinin dalam bentuk gambar, untuk masuk login jgn make tombol login, tp make ketuk logo
   5x“ · „Focus ngerjain kekurangan dan menyempurnakan situs yapida.sch.id dulu, jgn ngelantur“ · „Selesaikan semuanya“

9. „Username nya make dropdown, misal ketua yayasan dan seterusnya, jd g perlu ngisi“ · „Passwordnya langsung bikinin
   aja, kirim username passwordnya dalam bentuk gambar“ · „Quran mushaf ustmani nya kok g ada“ (15 Nov 2026) — akun jabatan
   dibuat sekaligus saat pemasangan (situs live, 18 akun, diserahkan sebagai gambar di luar repo); Al-Qur'an §5a.

10. „Tolong bikinin game muslim interkatif anak sampai dewasa, iqro onvensional seperti yg ada d buku iqro.. Bikin yg
    interaktif“ · „Perpustakaan digitalnya jg ini belum ada“ · „Radio quran pastiin hidup 24 jam, dengan auto random selurum
    imam seluruh dunia, tanpa bisa di klik, haha notif siapa yg baca, dan hitung sudah berapa kali hatam, tp bisa di matikan
    di device masing2 cuma di engine jgn pernah mati, termasuk waktu adzan pastiin hidup jika sudah d install di HP walaupun
    aplikaainya sudah d tutup, dengan notif adzan yg bisa di matiin“ (15 Nov 2026) — rencana §5c–§5e.

11. „Cek lagi CSS nya, di portal super admin logut tidak muncul, bikin CSS nya situs ini dan semua aplikasi nya interaktif,
    hususnya di perpustakaan digital, bikin buku2nya interaktif, hususnya buku2 anak, bikin animasinya seperti buku wordwall,
    cari buki dari sumber manapun di github, kategorinya yg jelas, bank soal dll.. Buku pelajaran TK, MI, MTs dan umum dll“
    (15 Nov 2026) — tombol Keluar §3a; perpustakaan §5, §5f.
12. „Buku anak yg bahasa indonesia, klo itu bahasa Inggris masukan kategori buku anak berbahasa Inggris atau berbahasa
    Arab... Situs jenius.es itu masih banyak yg salah, kebanyakan modul guru, bukan buku pelajaran dan jenius.es wajib d
    perbaiki total, tp anda jgn sentuh itu cukup tandai saja bahwa perpusatakaan digital jenius masih bermasalah baik di
    konten maupun kategori... Focus ke yapida saja“ — rak „Buku Anak Berbahasa Inggris“ dan „Buku Anak Berbahasa Arab“;
    jenius.es ditandai bermasalah di `docs/JENIUS-BLUEPRINT.md` (paling atas) dan tidak lagi dipakai sebagai sumber.
13. „Cari buku pelajaran sekolah RA, TK, MI, MTs, Ponpes, Buku Cerita, Kisah2 dll dan puluhan ribu yg lain, bikin yg rapih
    dan interaktif.. Termasuk Bank Soalnya“ · „Buatkan jg kop surat setiap lembaga yg bisa di crud, Sertifikat Penghargaan
    Tahfidz, Perlombaan2 yg otomatis terisi setelah di ketik manual dan Ranking Kelas Yg Siap Cetak dengan Berbagai
    Macam2 agar bisa di pilih Lembaga.. Bikin minimal 10 Pilihan Sertifikat Yg indah2, Font Super Premium, Sertfikat2
    Penghargaan, Beserta upload Foto yg menerima penghargaan beserta tahunya, dan di tampilkan menu husus beserta lembaga
    dan jenis penghargaan yang agar orang tua bisa senang melihat anak2nya tampil.. Pastikan semua dynamic page yg bisa di
    crud oleh masing2 lembaga“ — rencana §5g (penghargaan & kop surat).
14. „Perpustakaan digital nya ga usah bisa di download dan jgn dalam bentuk PDF, ubah semuanya agar lebih interaktif,
    indah, unik, menyenangkan pembaca, punya animasi2 yg berkaitan dengan tema dan halam yg d baca dan jika ada animasinya
    bisa di mainkan atau di tarik di putar2 tp bisa kembali ke asalnya jika di klik tombol tertentu... contoh buku menanam
    padi bikin kartunya, animasinya yg interaktif dan seterusnya“ — §5f: tanpa PDF, tanpa unduhan; adegan interaktif.
15. „Yg di pdf anda copy semua text nya dan anda custom sesuai permintaan sy“ — buku sekolah BSE: teksnya disalin dari PDF
    (hanya buku yang halaman hak ciptanya mengizinkan dialihmediakan), disusun ulang menjadi buku interaktif; §5f.
16. „Semua buku anak bikin lebih interaktif bukan hanya padi“ · „Jelasinya make bhs indo aja biar sy tau progresnya sampe
    dmn“ (15 Nov 2026) — §5f: setiap bab buku anak otomatis mendapat adegan dan „Ayo Bermain!“; laporan ke pemilik dalam
    Bahasa Indonesia.
17. „Sambil jalan, cek A-Z mana yg kurang interaktif hususnya di perpustakaan digitalnya baik animasi kartun dan animasi3
    interaktif. Jgn lupa sertifikat, Piagam, kop dll dan semua yg belum di kerjakan, segera kerjakan“ · „Cek jg error bug,
    tambahin bikin kwitansi bayaran setiap lembaga“ (15 Nov 2026) — §5g (ditambah kwitansi dan surat berkop), audit
    interaktivitas perpustakaan §5f, perbaikan bug tercatat di PR.
18. „Jika sudah 100% selesai semua, bikin dalam 1 Gambar besar, seluruh fitur yg ada di website ini, dan fungsi setiap menu
    yg ada di setiap portal, agar bisa di baca sebagai panduan, dan juga bikin panduan interaktif di setiap portal cara
    penggunaanya“ (15 Nov 2026) — §10 Panduan: satu gambar besar peta fitur + fungsi menu per peran, dan tur interaktif di
    dalam portal; dikerjakan terakhir setelah semua modul selesai.
19. „Pelajaran formalnya kok g ada ra, mi, mts. Perpustakaan digital Pelajaran formal ini sangat penting, cari Dr sumber
    manapun di google/github“ (15 Nov 2026) — §5f: buku BSE (teks PDF yang boleh dialihmediakan) di rak RA/MI/MTs per
    kelas dan mapel.
20. „Logat voice nya make logat bahasa indonesia bukan Melayu, klo Arab make logat Arab, Inggris ya logat inggris“ —
    suara.js memilih suara id-ID (tidak pernah ms-MY), ar-*, en-GB/en-US.
21. „Yapida.sch.id sudah sy koneksikan ke CF, jgn lupa bikin SEO nya yg super lengkap agar mampu di index di awal google
    dan mendapatkan ratusan ribu pengunjung generik per hari Dr fitur yg ada“ — §7 SEO, domain dipasang oleh deploy.
22. Data siswa, portal siswa, bank soal, tagihan & kwitansi, penghargaan ber-NISN (15 Nov 2026), ringkas: siswa tidak
    mendaftar — masuk dengan NISN dan kata sandi tanggal lahir (tgl/bln/thn), langsung ke kelasnya, naik kelas otomatis
    tiap tahun, yang sudah lulus tidak bisa masuk; NIK, nama orang tua, dll. dari file master; kekurangan diedit manual,
    super admin akses penuh. Bank soal puluhan–ratusan per pelajaran sesuai kelas, kunci jawaban terlihat setelah satu
    sesi selesai, hasil bisa diunduh siswa, tertaut ke lembaga dan kelasnya. Piagam/sertifikat tampil di beranda;
    „Setiap penghargaan siswa wajib di expose di publik“; siswa melihat penghargaannya lewat NISN. Guru diunggah manual
    + foto per lembaga dan tetap tampil di jajaran yayasan. Kwitansi/invoice bayaran siswa diinput manual, bisa dilacak,
    siswa tahu di portalnya sudah bayar atau belum. Siswa baru diinput manual atau diunggah dari file master dan langsung
    bisa masuk. Format master (urutan kolom): No, NSM Lembaga, Jenjang, Tingkat/Kelompok, Nama Rombel, NIS Lokal, NISN,
    NIK Siswa, Nama Lengkap, L/P, Tempat Lahir, Tanggal Lahir, Nama Ayah, Nama Ibu, No. KK, Alamat Siswa, Status Siswa
    (+ sheet Master Lembaga: No, Jenjang, NSM, NPSN, Nama Lembaga, Status, Alamat, Kecamatan, Kabupaten/Kota, Provinsi,
    Nama Kepala, NIP/NUPTK Kepala, Tahun Pelajaran). „Jgn di input contoh nama siswanya … Jgn di input satu datapun,
    jika sudah hapus filenya“ — tidak ada data contoh yang dimasukkan; file contoh sudah dihapus. Data siswa bisa dicari
    di masing-masing lembaga, diunduh per siswa atau seluruhnya; yayasan melihat semua, super admin melihat dan mengedit
    semua; laporan indah, elegan, interaktif dengan grafik. §11.
23. Detektor artikel tanpa login di beranda memakai mesin xscan.es (15 Nov 2026): gratis 10 halaman per minggu per
    perangkat, maksimal 5 halaman sekali scan, teknologi gratis dan kunci AI milik xscan (tersambung ke xscan, pemakaian
    dihitung di xscan beserta situs asalnya), judul otomatis, pilih halaman yang di-scan, riwayat setiap artikel yang
    pernah di-scan (judul dll.) tanpa bisa mengunduh file unggahan — file langsung dihapus; unggahan yang 100% sama
    memakai cache (tanpa biaya di xscan); laporan hasil bisa diunduh pengunjung; hitung pemakaian mesin; profesional;
    promosikan xscan.es dan mesin-mesinnya tanpa membongkar rahasia perusahaan. §12.
24. Upload pintar (15 Nov 2026): „walaupun urutan file master yg di upload tidak berurut, data tetep masuk secara urutan,
    dan tetep rapih dan masuk ke lembaga nya masing2, dan nis/NISN serta tgl/bln/thn (contoh 300400 30/04/2000)
    bisa langsung di gunakan siswa … jika singkatan bulan misal feb atau februari otomatis jadi 02“, lalu „semuanya
    termasuk urutan judulnya, tata letak file master yg d upload jika ga rapih, tetap di kenalin dengan smart upload“ —
    src/data/master.ts (judul kolom bebas, dua tingkat, kolom tanpa judul dari isinya, TTL/kelas gabungan, tgl/bln/thn
    terpisah, baris pemisah kelas/lembaga, beberapa lembar/tabel), normalTanggal (semua bentuk tanggal), dibaca di
    peramban (paket Workers gratis) dan diperiksa ulang di server.
25. „Jika lembaga ingin download full seluruh data siswa formatnya sudah indah sesuai format nasional kemenag RI beserta
    nama lembaga, logo dll“ — Excel berkop + logo + tanda tangan kepala (kolom file master yayasan), cetak Daftar Peserta
    Didik per rombel.
26. „Bikin penulisan alamatnya lebih elegan, lebih pantes baik di sertifikat maupun form lembaga“ — src/lib/alamat.ts.
27. „Termasuk upload data guru, buatkan form formatnya + letak fotonya … langsung tampil di tampilan guru2 yayasan …
    dan tetep tampil di masing2 lembaga, NUPTK, PEG ID, NPK dan seluruh yg privasi jgn di tampilkan, cukup nama foto,
    nama guru dan focus mengajar nya“ — /portal/guru/impor, templat dengan kolom Foto, foto tempel di Excel atau unggah
    banyak, bidang kepegawaian `rahasia`.
28. „Terjemahan hadits jgn make bhs inggris, make bahasa Indonesia aja, speling / logat pembacanya make logat Indonesia jgn
    Melayu … di hadits panjang tidak otomatis pindah ke halaman berikutnya, harus nya otomatis, wajib ada penanda setiap
    kata yg di baca di setiap buku“ — scripts/terjemah-hadits.ts (Arba’in, Qudsi, Ad-Dihlawi), penanda kata + halaman
    membalik sendiri di suara.js/pustaka.js.
29. „Buatkan juga pesan antar lembaga, di arahkan ke siapa, misal ke super admin, atau ke yayasan dll secara privasi dan
    ada chat group seluruh lembaga. buatkan notifnya … catat tgl nya permintaanya apa, untuk chat group setiap hari
    bersih … maximal 2 minggu riwayat chat group … di bersihkan otomatis tanpa jejak chache dll … Kecuali chat pribadi,
    chat pribadi bisa dalam bentuk tiket atau japri“ — /portal/pesan (src/data/pesan.ts). Cadangan harian (§ cadangan)
    TIDAK boleh menyalin `o/grup/` supaya riwayat grup benar-benar hilang setelah 14 hari.
30. Desain premium: „design sertifikat, kop, perpustakaan digital yg masih sederhana buat lebih premium, berkelas, indah
    dan elegan, husus nya di perpustakaan digital, dan portal siswa, agar siswa betah untuk selalu latihan soal“.
31. „Perpustakaan digital pelajaran formal untuk madrasah juga g ada“ / „full seluruh pelajaran, cari berapa pelajaran
    setiap kelas untuk madrasah“ — rak pelajaran per kelas & mapel sesuai struktur kurikulum madrasah (KMA 450/2024).
32. Mesin terjemah gratis tanpa kuota Claude di GitHub Actions: kitab → Indonesia (ambil dari ulyah.com dulu, perbarui
    mesin bila usang); semua situs artikel berbahasa Jerman & Spanyol → juga Inggris, jalan otomatis 01.00, mutu bukan
    „abal2“, hati-hati dengan kitab agama. „Jika engine website artikel sudah di buat dan sudah 100% running tinggal kan
    karena kita focus kepada keberhasilan yapida.sch.id“. Kerjakan „secara profesional, teliti dan cepat tanpa agen“.

**16 Nov 2026**

33. „Tolong cek d github banyak yg gagal“ — CI hijau lagi: galat `$$` di portal.js, peringatan CodeQL (balapan berkas di
    skrip, regex tanpa jangkar). „Di portal ada pesan dan ada pesan masuk, jika sudah di wakili dengan pesan masuk hapus
    yg pesan kecuali beda fungsi“ — satu menu Pesan; pesan pengunjung (formulir kontak) menjadi bagian di dalamnya.
34. „Masih tidak ada buku formal di setiap kelas di perpustakaan digital“ — buku BSE per kelas 1–9 dan mapel inti
    (pustaka/bse, §5f) + Peta Pelajaran Madrasah. Buku kelas 1–2 ditulis huruf kecil satu kalimat per baris (gaya
    pembaca pemula): diubah menjadi kalimat berkapital dan bertitik, bab dari daftar isinya. „belum ada login untuk
    masuk portal siswa“ — /siswa tayang.
35. „Ubah voice jd bahasa Indonesia dengan suara yg lembut, cari voice yg memiliki suara yg berwibawa … yg penting
    suaranya nyaman d dengar, elegan, berwibawa dan sesuai jenjang, misal buku anak di bacakan suara anak dll“ — suara
    neural perangkat dipilih per jenjang (anak: lembut & ceria; remaja: jernih; dewasa/kitab: berwibawa), tidak pernah
    Melayu. Layanan suara pihak ketiga hanya lewat jalur resmi (kunci API sah), bukan meniru peramban.
36. „translate kitab menggunakan bhs Indonesia bukan bahasa yg lain“ — kitab dan hadits tampil dengan terjemah Indonesia.
37. Bank Soal (Kurikulum Berbasis Cinta 2026): guru — PTS & PAS, Ganjil & Genap, per mapel PG 15 · menjodohkan 5 ·
    isian 10 · uraian 5, maks. 2 lembar kertas legal dengan kop lembaga, unduh rapi, huruf elegan; tampil di portal super
    admin, yayasan, dan lembaga; siswa — latihan & ujian dengan kunci dan pembahasan sesudah selesai. RA (TK A & B):
    kartun interaktif (hewan, pohon, berhitung, hijaiyah, balok) yang bergerak dan bercerita.
38. „Sertififikatnya masih kurang indah, masih kurang premium, dan beberapa masih kurang interaktif, hususnya d
    perpustakaanya“ — sertifikat & perpustakaan dinaikkan lagi kelasnya. Promosi www.yapida.sch.id di kop, sertifikat, dan
    semua unduhan; laporan detektor artikel mempromosikan www.xscan.es dan www.luaja.com (kursus 3 bahasa).
    „kerjakan semua yg blm d kerjakan“.

## 1. Aturan yang berlaku

- **R2 saja, tidak pernah D1.** Dokumen di `yapida-data`, berkas unggahan di `yapida-media`, cadangan harian 35 hari di
  `yapida-backups`. KV `yapida-rl` hanya penghitung batas laju.
- **100% dinamis.** Tidak ada teks lembaga atau yayasan di kode halaman. Halaman membaca dokumen R2; isi awal
  (`yapida/src/seed.ts`) ditulis sekali dengan create-once dan sesudah itu sepenuhnya milik portal — suntingan admin
  tidak pernah ditimpa deploy.
- **Tidak mengarang.** Isi awal hanya dari dokumen pemilik: akta No. 16 (24 Des 2015), SK Menkumham
  AHU-0033503.AH.01.04.Tahun 2015, NPWP, rekening yayasan, dan lembar profil MI Al Huda. Lembaga lain hanya diberi
  penjelasan jenis lembaganya; angka, nama kepala, tahun, guru, dan foto diisi admin lembaga.
- **Data pribadi.** Repo ini publik. NIK, nomor telepon pribadi, kontak notaris, dan gambar dokumen tidak pernah masuk
  kode maupun situs (dijaga uji unit). Dokumen yang ingin dipublikasikan lembaga diunggah lewat portal (§4).
- **AdSense** (`docs/ADSENSE-BLUEPRINT.md` §23.7): akun utama `ca-pub-8212039662308316` + tumpukan, dibaca langsung dari
  `adsense-stack.json` saat build. Satu loader per halaman, Auto ads saja. Portal, halaman masuk, serta halaman baca dan
  latihan jenjang anak tidak memuat loader.
- **Selesai = live.** Setiap fase: PR → CI hijau → merge → deploy → diperiksa di alamat live.

## 2. Arsitektur

Satu Worker (Hono, HTML dirender server), aset statis di `yapida/public`, tanpa cron Cloudflare (batas akun) — pekerjaan
berkala lewat langkah latar saat ada kunjungan dan workflow terjadwal.

| Kunci R2 | Isi |
|---|---|
| `k/situs.json` | identitas, alamat, legalitas, organ, pendiri, sejarah, linimasa, donasi |
| `c/unit/<slug>.json` | satu lembaga; ringkasannya di customMetadata → daftar lembaga = satu operasi list |
| `c/halaman/<slug>.json` | halaman bebas (kebijakan privasi, syarat, …) |
| `c/<koleksi>/<id>.json` + `i/<koleksi>/…` | kabar, album, video, pustaka, soal, karya, agenda, dokumen, sdm, ppdb, pesan |
| `c/users/<id>.json`, `u/email/<hash>` | akun portal + penjaga e-mail unik |
| `l/<aliran>/…` | log hanya-tambah: audit, hitungan baca buku, suka |
| `k/seed.json` | versi isi awal yang sudah ditulis |

Domain: zona yapida.sch.id belum ada di Cloudflare. Situs online di `https://yapida-sch-id.axto.workers.dev` (noindex);
deploy harian memasang yapida.sch.id + www begitu zonanya aktif, lalu workers.dev dialihkan 301. TXT Search Console ada
di `.github/dns/google-site-verification.json` (dipasang `dns-records.yml` begitu zona ada).

## 3. Peran dan portal

| Peran | Cakupan | Boleh |
|---|---|---|
| Super admin | semua | segalanya: pengguna, pengaturan teknis, cadangan, log audit, semua lembaga |
| Ketua yayasan | semua isi | profil yayasan, menyetujui/menurunkan isi semua lembaga, melihat pengguna |
| Admin yayasan | semua isi | profil yayasan, SDM yayasan, isi tingkat yayasan, mengelola akun lembaga |
| Kepala lembaga | lembaganya | profil, struktur dan guru, semua isi lembaganya termasuk menayangkan |
| Admin lembaga | lembaganya | sama dengan kepala, kecuali mengelola akun |
| Kontributor (guru/ustadz) | lembaganya | menulis draf (karya, kabar, soal) → ditinjau admin lembaga |

Alur isi: draf → tinjau → tayang → arsip. Akun dibuat admin di atasnya dengan PIN sementara yang wajib diganti.

### 3a. Cara masuk (perintah 8)

- **Tidak ada tombol Login.** Pintu portal: ketuk logo di kepala situs **5×** beruntun → `/masuk`. Sekali ketuk tetap ke beranda.
- **Pilih akun dari daftar** (dikelompokkan: Yayasan, lalu per lembaga) — tidak perlu mengetik nama atau e-mail.
- **PIN 5 angka** diketuk di papan angka **bergambar** (angka digambar sebagai vektor dari huruf Fraunces, tidak ada sebagai teks)
  yang **letaknya diacak setiap kali**. Tombol hanya membawa nomor posisi; urutan acaknya disimpan di cookie HttpOnly
  bertanda tangan 10 menit. Lima angka terketuk → langsung masuk.
- Pengaman PIN pendek: hash PBKDF2 atas HMAC(PIN, rahasia server); **5× salah → akun terkunci 15 menit**, lalu 30, 60 … sampai
  24 jam; batas laju per IP; PIN lemah (sama semua/berurutan) ditolak; PIN sementara wajib diganti saat pertama masuk.
- **Pemasangan pertama** (pemilik, 15 Nov: „Username nya make dropdown, misal ketua yayasan dan seterusnya, jd g perlu
  ngisi“): selama belum ada akun, `/masuk` hanya meminta *kode pemasangan* (hanya hash-nya di repo; kodenya diserahkan
  kepada pemilik di luar repo) dan PIN Super Admin — tanpa isian nama. Saat itu juga semua akun bernama jabatan dibuat:
  Super Admin, Ketua Yayasan, Admin Yayasan, dan „Admin <lembaga>“ untuk ke-15 lembaga, PIN acaknya tampil sekali (bisa
  dicetak). Halaman masuk lalu cukup memilih nama jabatan dari daftar. Lembaga baru: tombol „Buat akun semua lembaga“
  membuat akun yang belum ada.

## 4. Modul isi (semua CRUD di portal, tayang di halaman publik)

- **Profil lembaga**: profil, sejarah, visi-misi, program, kelas, sarana, kontak, media sosial, sampul.
- **Struktur dan SDM** (perintah 6): setiap orang satu dokumen — nama, jabatan, bidang/mapel, foto (diunggah manual),
  riwayat singkat, lembaga. Halaman lembaga menampilkan struktur dan guru-gurunya; halaman yayasan menampilkan
  pembina-pengurus-pengawas **dan seluruh SDM semua lembaga**, masing-masing menaut ke lembaganya. Profil pendiri yayasan
  (H. Moh. Hilwani dan para pendiri menurut akta) sebagai halaman tersendiri.
- **PPDB** (perintah 4): per lembaga per tahun ajaran (2027/2028 dst.) — jadwal, syarat, biaya, kuota, alur, formulir
  pendaftaran daring; pendaftar masuk kotak masuk admin lembaga itu (data anak hanya terlihat admin lembaga dan di atasnya).
- **Kabar dan kegiatan**, **galeri foto** (foto dikecilkan di peramban sebelum diunggah, EXIF dibuang), **agenda**.
- **Video dan siaran langsung**: tautan YouTube, Facebook, TikTok diubah menjadi pemutar; video kanal YouTube lembaga
  ditarik otomatis dari umpan kanalnya; tombol „Sedang siaran“ memunculkan pita LIVE di seluruh situs.
- **Dokumen publik lembaga** (perintah 2): PDF diunggah admin lembaga (izin operasional, akreditasi, brosur, …).
- **Karya tulis**: dari lembaga, guru, sampai santri — diunggah admin lembaga, tampil dengan nama penulis dan kelasnya.
- **Pesan masuk**, **halaman bebas**, **pengaturan situs**.

## 5. Perpustakaan digital dan bank soal

- **Rak**: lembaga → kelas → program/mapel, ditambah rak **Guru & Ustadz** (bacaan pendidik) dan rak Umum.
- **Sumber** — hanya yang mengizinkan diserap tanpa izin; lisensi dan sumber tampil di setiap buku:
  kitab klasik domain publik (penulis wafat > 70 tahun; termasuk kitab yang diajarkan sejak 1967: Safinah, Jurumiyyah,
  Kailani, Tijan ad-Darari, Maraqil 'Ubudiyyah) dan Al-Qur'an lewat pustaka ulyah.com; buku sekolah BSE (izin tertulis di
  halaman hak cipta buku) lewat jenius.es; katalog besar domain publik dan CC BY/CC BY-SA (Project Gutenberg, Wikibooks,
  Wikisource, StoryWeaver, DOAB) dicari langsung dari katalog sumbernya dan disalin ke R2 saat dibaca. Buku berlisensi NC
  tidak dipakai (situs beriklan). Buku Kemenag/Kemendikdasmen yang lisensi terbit-ulangnya tidak tertulis hanya ditautkan
  ke halaman resminya. Tambah dengan buku milik lembaga sendiri (ditulis di portal — **tanpa PDF**, perintah 14).
  **Diperbarui 15 Nov (perintah 12–15)**: jenius.es dimatikan sebagai sumber (bermasalah, ditandai); tidak ada PDF dan
  tidak ada unduhan di seluruh perpustakaan.
- **Pembaca bersuara**: suara peramban per bahasa blok — Arab dilafalkan suara Arab, Inggris suara Inggris, Indonesia
  suara Indonesia; nada dan kecepatan menurut jenjang (RA, MI, MTs, dewasa). Putar sekali → kata disorot, gulir otomatis,
  halaman berganti sendiri, lanjut bab berikutnya sampai buku habis. Kecepatan, ukuran huruf, mode malam, posisi tersimpan.
- **Buku 3D**: sampul tipografi berornamen per jenjang (tanpa gambar makhluk bernyawa buatan), buku berdiri di rak, miring
  mengikuti kursor, terbuka saat dipilih; halaman membalik.
- **10 buku paling sering dibaca dan paling difavoritkan**: setiap baca dan suka = satu objek log; rekap berkala menulis
  peringkat (tanpa kunci panas).
- **Buku pelajaran interaktif**: kuis akhir bab, kartu hafalan, latihan menjodohkan, animasi langkah demi langkah.
- **Bank soal per lembaga**: paket soal per kelas dan mapel (pilihan ganda, isian), dikerjakan di situs dengan nilai,
  pembahasan, dan penghargaan; dibuat guru di portal.

## 5f. Buku interaktif tanpa PDF (perintah 11, 12, 14, 15)

- **Rak** (jelas per jenjang dan bahasa): RA/TK · Buku Cerita Anak (bahasa Indonesia) · **Buku Anak Berbahasa Inggris** ·
  **Buku Anak Berbahasa Arab** · TPQ · MI · MTs · Kitab Pesantren · Kisah · Hadits · Doa & Dzikir · Bahasa · Guru & Ustadz ·
  Umum. Rak besar dibagi halaman (48 buku) dengan saringan kelas dan mapel.
- **Isi bawaan** (dibuat ulang dari sumber di repo oleh `yapida/scripts/buat-pustaka.ts` saat uji dan deploy — tidak
  disimpan di git): kitab pesantren dan doa harian (ulyah.com), kisah para nabi dan kisah anak muslim (Indonesia dan
  Inggris), tokoh (nabi, sahabat, tabi'in, ulama), 12 kitab hadits dengan terjemah Indonesia (Bukhari, Muslim, Abu Dawud,
  Tirmidzi, Nasa'i, Ibnu Majah, Ahmad, Malik, Darimi, Riyadhus Shalihin, Arba'in Nawawi, Qudsi), karya yayasan, dan 53
  buku cerita bergambar Book Dash (CC BY 4.0; gambarnya disalin ke R2 media saat pertama dibuka). Saat ini 169 buku,
  1.922 bab, ±7,4 juta kata.
- **Tanpa PDF, tanpa unduhan**: semua buku berupa teks yang dirakit menjadi halaman bergaya buku — balik halaman 3D,
  geser/papan ketik, dua halaman di layar lebar, dibacakan dengan suara sesuai bahasa dan jenjang.
- **Aktivitas ala Wordwall di dalam buku** (ditulis di naskah dengan `::kuis`, `::kartu`, `::cocok`, `::adegan`): kuis
  pilihan dengan bunyi, bintang, dan petunjuk setelah dua kali salah; kartu hafalan berbalik; pasangkan kiri-kanan.
- **Adegan interaktif** (`yapida/public/assets/adegan.js`, SVG tanpa makhluk bernyawa): padi (seret gembor ke sawah →
  padi tumbuh 7 tahap sampai panen), hujan, langit siang–malam, masjid, kebun/buah (petik dan hitung), laut, waktu sholat,
  huruf hijaiyah. Benda bisa diseret, diketuk dua kali atau digulir untuk diputar, dan **↺ Kembalikan** mengembalikan
  semuanya ke tempat asal. Bab buku anak, cerita, dan kisah yang belum punya adegan otomatis diberi adegan sesuai tema
  katanya (sawah → padi, kapal → laut, subuh → waktu sholat, …).
- **Semua buku anak interaktif (perintah 16)** — `yapida/src/data/aktif.ts`: setiap bab buku anak (RA, cerita, kisah,
  buku anak berbahasa Inggris/Arab, TPQ) yang belum punya permainan tertulis otomatis diberi adegan di awal (sesuai tema,
  atau adegan cadangan gurun/gunung/rumah/kebun/langit) dan „🎮 Ayo Bermain!“ di akhir, dari isi bab itu sendiri:
  **kuis isian** (satu kata penting dihilangkan, pengecohnya kata lain dari bab yang sama), **Urutkan Cerita** (empat
  kejadian diacak, anak menyusunnya kembali), dan **kartu balik** Arab ↔ arti. Hasilnya tetap per bab. Nama Allah, nabi,
  dan sebutan mulia tidak pernah jadi jawaban/pengecoh; terjemah ayat dan kalimat berkutip tidak dijadikan permainan.
  Cakupan: 487 bab buku anak — semua ber-adegan, ±94% dengan permainan (±870 kuis, ±170 urutkan, ±125 kartu).
- **Adegan** kini 12: padi, hujan, langit, masjid, kebun, buah, laut, gurun (petik kurma, timba sumur), gunung (bendera
  ke puncak, gua bercahaya), rumah (pintu bersalam, jendela, siang/malam), waktu sholat, huruf.
- **Buku BSE dari PDF → buku interaktif (perintah 15, berikutnya)**: alur GitHub Actions bertahap — ambil PDF dari indeks
  BSE, periksa halaman hak cipta (hanya yang mengizinkan dialihmediakan), salin teksnya, pecah per bab, simpan di R2
  dengan indeks katalog; Worker menyajikannya sebagai buku interaktif di rak MI/MTs per kelas dan mapel. PDF-nya tidak
  pernah ditampilkan atau ditautkan.

## 5g. Dokumen lembaga: kop surat, sertifikat & piagam, kwitansi, surat (perintah 13, 17)

Semua di portal (menu **Dokumen & cetak**), CRUD per lembaga (admin lembaga ke atas; super admin semua lembaga), data di
R2 lewat mesin koleksi yang sama (`c/<kol>/…`). Setiap formulir punya **pratinjau langsung** (terisi otomatis saat
diketik) dan tombol **Cetak / simpan PDF** (dialog cetak peramban, ukuran kertas sudah diatur).
- **Kop surat** (`kop`): logo kiri (dan kanan, opsional), nama induk (yayasan), nama lembaga (+ nama Arab), keterangan
  (jenis/akreditasi), NSM/NPSN, alamat, kontak, 5 gaya tata letak × 4 warna; satu kop ditandai **utama** dan dipakai
  otomatis oleh surat, sertifikat, dan kwitansi lembaga itu. Tanpa kop tersimpan, kop dibangun dari profil lembaga.
- **Sertifikat & piagam** (`penghargaan`): jenis tahfidz, lomba, ranking kelas, kelulusan, siswa teladan, kehadiran,
  peserta, lainnya; **12 desain** (klasik zamrud–emas, safir, marun, arabesque, kaligrafi, minimal, hitam-emas, lavender,
  ceria, tosca, perkamen, mawar) dengan huruf premium Cinzel, Cormorant Garamond, Pinyon Script, Amiri (OFL, dihos
  sendiri); foto penerima, kelas, tahun pelajaran, capaian, predikat, kegiatan, dua penanda tangan, nomor otomatis
  (`<urut>/<JENIS>/<LEMBAGA>/<bulan Romawi>/<tahun>`), kalimat penghargaan terisi otomatis dari jenis (bisa diubah);
  A4 mendatar siap cetak; tautan verifikasi `/prestasi/<slug>`.
- **Kwitansi pembayaran** (`kwitansi`): nomor otomatis per lembaga per tahun (`KW/<LEMBAGA>/<tahun>/<urut>`), diterima
  dari, untuk pembayaran (SPP, pendaftaran, daftar ulang, seragam, buku, kegiatan, infaq, zakat, wakaf, lainnya),
  keterangan/periode, jumlah + **terbilang otomatis**, metode (tunai/transfer/QRIS), penerima; dicetak dua rangkap (asli
  untuk pembayar, arsip lembaga) di satu lembar A4 dengan garis potong. Tidak pernah tampil publik.
- **Surat berkop** (`surat`): nomor, lampiran, perihal, kepada, isi (Markdown), penanda tangan, tembusan; A4 tegak.
- **Menu Prestasi publik** `/prestasi` (+ `/prestasi/<slug>`): saringan lembaga, jenis, dan tahun; kartu berfoto;
  halaman detail menampilkan sertifikatnya; juga tampil di halaman lembaga dan pita beranda. Hanya penghargaan berstatus
  tayang dan dicentang „tampilkan di Prestasi“.

## 5a. Aplikasi ibadah (perintah 7)

Diambil dari cara ulyah.com menghitungnya, lalu dibuat lebih interaktif. Semua hitungan di perangkat pembaca; server hanya
mengirim kerangka halaman dan titik lokasi bawaan (pengaturan situs `lokasi`, bawaan Sukakarya).

| Aplikasi | Alamat | Isi |
|---|---|---|
| Pusat aplikasi | `/ibadah` | kartu dengan nilai langsung (sholat berikutnya, sudut kiblat, tanggal hijriah, hari menuju Ramadhan) |
| Jadwal Sholat | `/jadwal-sholat` | pustaka `adhan` (MIT, sama dengan ulyah.com): Subuh 20°, Isya 18°, Ashar Syafi'i, ihtiyat 2 menit; cincin hitung mundur ke adzan, busur matahari yang bergerak dan langit yang berganti fase, jadwal 30 hari yang bisa dicetak, lokasi perangkat atas izin pembaca |
| Arah Kiblat | `/kiblat` | sudut lingkaran besar ke Ka'bah + jarak; kompas mengikuti sensor HP, bergetar dan menyala saat tepat menghadap kiblat |
| Kalender Hijriah | `/kalender-hijriah` | Umm al-Qura bawaan peramban; hari besar, puasa sunnah (Senin-Kamis, Ayyamul Bidh, Tasu'a, Asyura, Arafah), daftar hari besar terdekat |
| Hitung mundur Ramadhan | beranda, `/ibadah`, `/kalender-hijriah#ramadhan` | hari-jam-menit-detik menuju 1 Ramadhan; saat Ramadhan berganti menjadi hitung mundur Idul Fitri |
| Radio Qur'an LIVE | `/radio-quran` + pemutar mini di setiap halaman | siaran 24 jam dari server (§5c): 114 surah berurutan, qari acak dari 150+ qari dunia, hitungan khatam; hanya nyala/mati per perangkat |
| Tasbih | tombol di setiap halaman | 33/100 dengan getar, urutan wirid tasbih → tahmid → takbir |
| Al-Qur'an mushaf Utsmani | `/quran`, `/quran/<surah>`, `/quran/halaman/<1–604>` | Rasm Utsmani Hafs KFGQPC v3 dengan **tata letak 604 halaman × 15 baris mushaf Madinah** (quran-text, CC BY 4.0) dan font KFGQPC HAFS Uthmanic Script v3 (disalin tanpa perubahan sesuai lisensinya); kepala surah berbingkai, basmalah, tanda waqaf & sajdah, simbol akhir ayat bernomor. Halaman dibalik tanpa memuat ulang (panah, geser, pilih surah/juz/halaman); ketuk kata → lembar ayat (terjemah, tafsir, murottal). Per surah: terjemah Indonesia & latin (quran-json, CC BY 4.0), **tafsir Kemenag RI** (equran.id, diambil sekali lalu disimpan di R2), murottal per ayat 5 qari (everyayah.com, cadangan cdn.islamic.network) dengan sorot ayat, ulangi 1–10×, lanjut otomatis; mode hafalan, penanda, salin, posisi terakhir dibaca (di perangkat) |

Jadwal dan kalender adalah hisab; halaman menyatakan bahwa penetapan resmi mengikuti Kementerian Agama dan masjid setempat.

## 5b. Perpustakaan ala Wordwall (perintah 7)

Setiap bahan ajar bisa dimainkan dalam beberapa bentuk dari satu isi yang sama (guru mengisi sekali, murid memilih
permainannya): kuis pilihan ganda, menjodohkan, kartu hafalan berbalik, benar-salah, susun huruf (anagram), cari kata,
roda putar, kelompokkan, isian rumpang, buka kotak. Ada pengatur waktu, nilai, bintang, papan peringkat per paket, dan
suara pembaca sesuai bahasa. Guru membuatnya di portal; paket contoh diberi tanda „contoh“.

## 5c. Radio Qur'an LIVE 24 jam (perintah 10)

- **Mesin di server, tidak pernah mati**: jadwal siaran ditentukan dari waktu, bukan dari pendengar. Satu putaran = surah
  1 sampai 114 berurutan = **satu khatam**; setiap surah dibacakan qari yang dipilih acak (deterministik per putaran) dari
  daftar qari seluruh dunia (mp3quran.net, riwayat Hafs, berkas 114 surah lengkap). Durasi tiap berkas dibaca dari kepala
  MP3 dan disimpan di R2, sehingga semua pendengar mendengar posisi yang sama seperti radio sungguhan.
- **Tanpa klik**: pendengar tidak memilih surah atau qari; hanya **nyala/mati di perangkatnya sendiri** (tersimpan di
  perangkat). Pemberitahuan „Kini dibacakan oleh …“ (layar kunci lewat Media Session + pita di halaman) dan **hitungan
  khatam** sejak radio pertama mengudara. Pemutar mini di seluruh situs.
- Batas peramban: di tab biasa suara baru boleh berbunyi setelah satu ketukan pertama; aplikasi yang dipasang di HP
  memutar langsung.

## 5d. Notifikasi adzan (perintah 10)

- **Web Push** (VAPID + enkripsi aes128gcm, ditulis sendiri di Worker) sehingga notifikasi adzan tetap datang walau
  aplikasi/peramban ditutup — Android (Chrome) dan iPhone (iOS 16.4+, aplikasi terpasang). Suara = suara notifikasi
  ponsel; ketuk notifikasi membuka halaman adzan.
- Langganan di R2 (satu objek per perangkat; lokasi dibulatkan ±1 km; waktu sholat dihitung server dengan `adhan`, metode
  sama dengan jadwal). Indeks per menit `i/adzan/<menit>/<langganan>` — setiap menit hanya satu daftar R2.
- Detak tiap menit: cron `* * * * *` milik Worker detektor-artikel di akun yang sama memanggil entrypoint RPC bernama di
  Worker yapida lewat service binding (tidak terbuka ke internet; kuota 5 cron akun sudah terpakai).
- Bisa dimatikan per perangkat dan per waktu sholat di halaman Jadwal Sholat; ada tombol uji notifikasi.

## 5e. Iqro interaktif & game muslim (perintah 10)

- **Iqro**: latihan buatan sendiri yang mengikuti urutan metode Iqro konvensional (bukan salinan buku Iqro): jilid 1 huruf
  berharakat fathah, 2 huruf sambung & mad, 3 kasrah, 4 dhammah/tanwin/sukun/qalqalah, 5 tasydid/waqaf/lam syamsiyah, 6
  tajwid ringan & ayat pendek. Setiap halaman: baris bacaan besar, ketuk untuk mendengar, mode guru-murid, uji per halaman,
  bintang, dan kemajuan tersimpan di perangkat.
- **Game** (anak sampai dewasa): tebak huruf, cocokkan Asmaul Husna, susun ayat, lanjutkan ayat, tebak surah, kuis Islami
  berjenjang — isi dari data yang sudah ada (Al-Qur'an, Asmaul Husna, doa) dan bank soal yang ditulis teliti.

## 6. Desain „Mihrab Zamrud“

Zamrud tua, emas, gading, merah lambang. Pola bintang delapan (khatam), lengkung mihrab, lentera, bulan sabit. Huruf:
Fraunces (judul), Plus Jakarta Sans (isi), Amiri (Arab) — semuanya OFL, dihos sendiri. Interaktif: langit berbintang yang
mengikuti kursor, kartu miring 3D, linimasa sejarah, saring lembaga, tasbih digital, tanggal hijriah, tema siang/malam.
Semua gerak menghormati `prefers-reduced-motion`; isi tetap terbaca tanpa JavaScript. CSS ditulis khusus situs ini.

## 7. SEO — niche tegas

Niche: **pendidikan Islam terpadu di Sukakarya, Bekasi** (RA, MI, MTs, pesantren, TPQ) + **perpustakaan dan bank soal
madrasah**. Setiap halaman: judul dan deskripsi unik, canonical, satu H1, JSON-LD (Organization, sekolah/masjid per
lembaga, BreadcrumbList), sitemap dari data, robots.txt yang tidak pernah menutup crawler Google. Tulisan untuk pembaca
dulu; tidak ada halaman pintu atau teks tersembunyi.

## 8. Aplikasi di HP (PWA)

Manifest + service worker. Spanduk „Pasang aplikasi“ di paling atas selama situs belum terpasang; hilang begitu
terpasang; muncul lagi bila aplikasinya dihapus. Di iPhone (Safari) spanduk memberi petunjuk „Tambah ke Layar Utama“.

## 9. Fase dan status

| Fase | Isi | Status |
|---|---|---|
| Y0 | AdSense tumpuk + akun ke-22, TXT Search Console | ✅ 14 Nov (PR #427) |
| Y1 | Kerangka: R2 store, isi awal dari dokumen, beranda, profil, 15 halaman lembaga, donasi, kontak, PWA, desain, deploy | ✅ 14 Nov (PR #428) — https://yapida-sch-id.axto.workers.dev |
| Y1b | Aplikasi ibadah | ✅ 15 Nov (PR #429) |
| Y2 | Portal: masuk (daftar akun + PIN acak bergambar + ketuk logo 5×), 6 peran, pengaturan situs, halaman, profil lembaga, struktur & SDM + foto, unggah media, log | 🔄 15 Nov |
| Y3 | Kabar, galeri (+ lihat besar), agenda, video + siaran langsung (pita LIVE, kanal YouTube otomatis), dokumen, karya tulis (+ dengarkan), pesan | 🔄 15 Nov |
| Y4 | PPDB per lembaga per tahun ajaran + formulir daring + pendaftar (CSV) | 🔄 15 Nov |
| Y5 | Perpustakaan: rak per jenjang & bahasa, buku 3D, pembaca bersuara multibahasa, peringkat 10 besar, aktivitas ala Wordwall dan adegan interaktif di dalam buku, tanpa PDF (§5f) | ✅ 15 Nov |
| Y5b | Buku BSE: teks PDF disalin → buku interaktif (§5f) | ⏳ |
| Y5c | Kop surat, sertifikat penghargaan, menu Prestasi (§5g) | ⏳ |
| Y6 | Bank soal dan buku pelajaran interaktif | ⏳ |
| Y7 | Katalog besar sumber terbuka, cadangan harian, audit | ⏳ |
| Y8 | Al-Qur'an mushaf Utsmani 604 halaman + terjemah + tafsir Kemenag + murottal per ayat | ✅ 15 Nov (PR #432) |
| Y8b | Radio Qur'an LIVE 24 jam: mesin di server, qari acak sedunia, hitung khatam (§5c) | ✅ 15 Nov (PR #433) |
| Y9 | Permainan ala Wordwall untuk setiap bahan ajar (§5b) | ⏳ |
