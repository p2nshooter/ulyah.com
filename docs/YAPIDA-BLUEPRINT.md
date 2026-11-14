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

Alur isi: draf → tinjau → tayang → arsip. Akun dibuat admin di atasnya dengan sandi sementara yang wajib diganti.

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
  ke halaman resminya. Tambah dengan modul dan buku milik lembaga sendiri (unggah PDF atau tulis di portal).
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
| Y1 | Kerangka: R2 store, isi awal dari dokumen, beranda, profil, 15 halaman lembaga, donasi, kontak, PWA, desain, deploy | 🔄 14 Nov |
| Y2 | Portal: masuk, 6 peran, pengaturan situs, profil lembaga, SDM + foto, unggah media | ⏳ |
| Y3 | Kabar, galeri, agenda, video + siaran langsung, dokumen, karya tulis, pesan | ⏳ |
| Y4 | PPDB per lembaga per tahun ajaran | ⏳ |
| Y5 | Perpustakaan: rak, buku 3D, pembaca bersuara multibahasa, peringkat 10 besar | ⏳ |
| Y6 | Bank soal dan buku pelajaran interaktif | ⏳ |
| Y7 | Katalog besar sumber terbuka, cadangan harian, audit | ⏳ |
