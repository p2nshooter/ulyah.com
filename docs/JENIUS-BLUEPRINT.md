# jenius.es — Blueprint

**E-Book with Voice — perpustakaan baca bersuara untuk semua jenjang, gratis untuk umum, dengan portal guru dan kelas**

## 0. Perintah pemilik terbaru (8 Nov 2026) — MENGGANTIKAN keputusan lama yang bertentangan

Dicatat dulu sebelum dibangun (pemilik: „Jgn sampe lupa blueprint untuk jenius.es agar tidak ketinggalan catat dulu perintah
jenius.es yg ada di chat2 sebelumnya“). Bila bagian lama di bawah berbeda, **bagian 0 ini yang berlaku**.

### 0.1 Kutipan perintah

1. „Kembangkan dulu jenius.es … cari referensi artikel minimal 500 sumber github … Klasifikasikan kategorinya … TK, SD, SMP,
   sma, mahasiswa, s1, s2, s3 DR, PROFESOR, profesional sampai umum, termasuk buku pembelajaran bahasa asing“.
2. „design full A-Z termasuk animasi, cover, voice, dan seluruh AUTO nya … artikel interaktif beranimasi, auto slide, auto
   pindah halaman, dan auto voice … sampai satu bab buku habis atau sampai satu buku habis“.
3. „Referensikan situs xscan.es & ascan.es di dalam portal member untuk tugas2 lanjutan“.
4. „Project ini free untuk umum, dan buatkan fasilitas pendidikan untuk guru“: grup (guru mengundang murid ke grup), chat
   grup, berbagi buku rekomendasi, soal, berbagi tautan kelas, nilai, **nama kelas unik**, rekomendasi jenjang (SD/SMP/…)
   supaya buku sesuai.
5. „pastikan project ini 100% siap produksi tanpa bug … bukan project sampah … lalu ajukan ke adsense … kerjakan hati2 satu
   persatu termasuk artikelnya“.
6. „Catat semua ratusan referensi github & web sumber2 terbuka yg mengizinkan bukunya bisa di serap, klasifikasin, tarik
   apapun yg bisa di ambil termasuk animasi2nya jika menarik, jadikan blueprint agar lu ga lupa“ → **`docs/JENIUS-SOURCES.md`**
   (39 platform + 752 repositori GitHub, per jenjang, aturan lisensi).
7. „Pake 2 bahasa aja dulu, Indonesia & Inggris tp engine mampu mendeteksi seluruh bahasa global dunia“ → jenius.es
   **Indonesia + Inggris** (bukan Spanyol). Buku tetap dalam bahasa aslinya; antarmuka dan artikel ID/EN.
8. „Buatkan agar xscan dan ascan bisa di install di HP dengan logo gambar HP di paling atas, jika sudah d install hilangkan
   logonya, buatkan notifikasi …“ → berlaku juga untuk jenius.es: **PWA** dengan spanduk pasang di atas (hilang setelah
   terpasang), notifikasi untuk admin/guru (anggota baru, pesan grup, tugas).
9. Logo jenius.es dari pemilik (8 Nov 2026): logo utama „jenius.es — E-Book with Voice“, lencana bundar, ikon aplikasi
   persegi „j“ dengan gelombang suara. Disimpan di `jenius/public/assets/` saat J0.
10. Urutan pemilik: xscan.es disempurnakan → blueprint ascan.es → **jenius.es dikerjakan** („Jgn kerjakan ascan.es dulu tapi
    lanjut ke jenius.es“, „Kerjakan“). AdSense selalu didahulukan.

### 0.2 Yang berubah dari blueprint 7 Nov

| Hal | Lama | Sekarang |
|---|---|---|
| Pembaca | anak 4–12 tahun | **semua jenjang**: TK, SD, SMP, SMA, mahasiswa/S1, S2, S3/Dr, profesor, profesional, umum, + bahasa asing |
| Bahasa | Spanyol + Inggris | **Indonesia + Inggris** |
| Biaya | asisten guru mungkin berbayar | **gratis untuk umum** (membaca, suara, kelas, grup); biaya AI ditahan oleh batas harian dan model termurah (§7) |
| Sumber | 8 platform | `docs/JENIUS-SOURCES.md` (≥ 500 repositori GitHub + 39 platform) |
| Mode baca | pembaca + read-along | **AUTO penuh**: halaman berganti sendiri, suara lanjut per halaman sampai akhir bab/buku, slide/animasi otomatis |
| Guru | kelas + tugas | grup kelas dengan undangan, chat grup, berbagi buku/soal/tautan, nilai, nama kelas unik, rekomendasi jenjang |
| Tautan | xscan.es di artikel | xscan.es & ascan.es **di portal member** untuk tugas lanjutan (memeriksa tulisan/tugas) |
| Aplikasi | PWA baca offline | PWA terpasang di HP dengan spanduk pasang + notifikasi |

### 0.25 Konsep dari kami (pemilik, 8 Nov 2026: „Klo ide klasifikasi yg sy berikan kurang elegan dan kurang menarik, sy serahkan semua idenya dari sisi Anda dan kembangkan konsep portal guru, portal member umum, dll.. Inget ini project gratis jd ambil sumber yg gratis jg“)

**Prinsip:** semuanya **gratis** untuk pembaca, guru, dan sekolah; hanya sumber yang gratis dan berlisensi terbuka
(`docs/JENIUS-SOURCES.md`); tanpa layanan berbayar wajib — suara dari peramban + suara terbuka yang dirender sekali, AI hanya
Haiku dengan anggaran harian, dan situs hidup dari AdSense di halaman dewasa.

**Jalur Baca** — pengganti daftar jenjang yang kaku. Delapan jalur bernama, berwarna, dan berikon; jenjang pemilik tetap
tercatat di balik setiap jalur supaya rekomendasi kelas tepat.

| Jalur | Untuk | Jenjang pemilik | Isi khas | Suara bawaan |
|---|---|---|---|---|
| 🌱 **Tunas** | anak yang mulai membaca | TK, SD kelas 1–2 | buku bergambar, kata besar, satu kalimat per halaman | suara anak |
| 🌿 **Tumbuh** | pembaca muda | SD kelas 3–6 | cerita bab pendek, fabel, sains anak, kuis ringan | guru perempuan |
| 🔥 **Jelajah** | remaja | SMP, SMA | novel petualangan, sains populer, buku pelajaran terbuka | narator muda |
| 🎓 **Kampus** | mahasiswa | Mahasiswa, S1 | buku teks terbuka (OpenStax, Open Textbook), klasik dunia | narator |
| 🔬 **Cendekia** | peneliti | S2, S3/Dr, Profesor | monografi akses terbuka (DOAB, OAPEN), filsafat & sejarah klasik | narator tenang |
| 💼 **Profesi** | pekerja | Profesional | teknologi, data, bisnis, kepemimpinan | narator |
| ☕ **Santai** | semua orang | Umum | sastra, sejarah, pengembangan diri, puisi | pilihan pembaca |
| 🌍 **Lintas Bahasa** | belajar bahasa asing | semua jenjang | teks paralel, kalimat dua bahasa, buku kursus bahasa | penutur bahasa itu |

Setiap buku juga punya **Rak tema** (Petualangan, Sains & Alam, Sejarah & Tokoh, Budaya, Bahasa, Teknologi, Seni & Puisi,
Diri & Karier), **durasi dengar** (mis. „12 menit“), dan **tingkat 1–5 di dalam jalurnya**. „Lintas Bahasa“ bisa digabung
dengan jalur lain (mis. Tumbuh + Lintas Bahasa = cerita anak dua bahasa).

**Portal Pembaca (member umum, gratis):** Lanjutkan Mendengar (satu ketukan kembali ke halaman terakhir) · Rak Saya
(sedang dibaca, selesai, ingin dibaca) · Target harian (menit dengar/baca, rangkaian hari) · Sorotan & catatan · Lencana
per jalur · Rekomendasi „karena Anda menyelesaikan …“ · **Mode Keluarga** (profil anak di bawah akun orang tua, tanpa
e-mail anak, batas waktu layar) · bahasa antarmuka ID/EN.

**Ruang Guru (gratis):** Kelas dengan **nama unik** dan jalur kelas · Undangan (tautan, kode, QR) · **Grup & chat kelas**
(dimoderasi guru) · **Rak Kelas** (buku rekomendasi sesuai jalur) · **Bank Soal** (dibuat dari isi buku oleh Haiku, guru
menyunting) · **Tugas & Nilai** (tenggat, nilai otomatis untuk pilihan ganda, nilai guru untuk isian) · Rapor baca per
murid, ekspor CSV · **Tugas lanjutan**: periksa tulisan murid di xscan.es, analisis artikel/situs di ascan.es.

**Ruang Murid:** kelas saya, tugas dan tenggat, chat kelas, rapor baca, lencana.

**Portal Orang Tua:** profil anak, persetujuan bergabung ke kelas, laporan mingguan, batas waktu layar.

**Admin:** antrean impor dan persetujuan (lisensi dicek otomatis), katalog & jalur, suara, artikel, moderasi chat,
kunci API & anggaran harian AI, notifikasi (impor gagal, laporan chat, kelas baru), AdSense.

### 0.26 Buku pelajaran semua jenjang + buku umum + cerita anak (pemilik, 9 Nov 2026)

> „Cari lagi dari seluruh GitHub manapun, buku pelajaran dari SD, MI, SMP, Tsanawiyah, SMA, MA, SMK, MAK sampe ke Perguruan
> tinggi, dan seluruh buku2 umum, buku cerita anak SD berkebun dll“ — dan sebelumnya: „bukunya sederhana banget, voice nya ga
> keluar … harusnya bukunya puluhan sampe ratusan lembar, dengan animasi buku balik sendiri“.

Hasil penelusuran (detail per sumber: `docs/JENIUS-SOURCES.md` Bagian C):
- **BSE 2008–2011** (Buku Sekolah Elektronik; hak ciptanya dibeli Depdiknas, halaman hak cipta setiap buku mengizinkan buku
  „diunduh, digandakan, dicetak, dialihmediakan, atau difotokopi oleh masyarakat“): ±1.200 judul SD kelas 1 sampai SMA kelas 12,
  termasuk **613 judul SMK** (pertanian, budidaya tanaman, teknik, bisnis, pariwisata, kesehatan …). Indeks: GitHub
  `Hans5958/Indeks-BSE` (CC BY 4.0). **Dipakai**, dengan syarat yang dicek otomatis per PDF: kalimat izin itu harus ada di
  halaman hak cipta; buku tanpa kalimat itu tidak diimpor. Tidak dijual, atribusi Pusat Perbukuan & penulis tampil.
- **Kurikulum 2013 dan Kurikulum Merdeka (SIBI), Buku Teks Utama madrasah Kemenag:** gratis diunduh, tetapi tidak ditemukan
  izin tertulis untuk diterbitkan ulang di situs beriklan dan dialihsuarakan → **belum dipakai** sampai lisensinya jelas per buku
  (atau izin tertulis Kemendikdasmen/Kemenag); sementara itu katalog boleh menautkan ke halaman unduhan resminya.
- **Badan Bahasa (bahan bacaan literasi, cerita anak terjemahan):** lisensi per judul, sebagian CC BY-NC → hanya judul CC BY/CC0.
- **OpenStax:** dari 87 koleksi di 53 repositori `openstax/osbooks-*`, hanya **4 buku berbahasa Inggris yang CC BY** (Physics,
  Statistics, Life Liberty and the Pursuit of Happiness, Introduction to Intellectual Property); sisanya kini CC BY-NC-SA → ditolak.
- **African Storybook** (`global-asp/asp-source`, CC BY per cerita): 368 cerita berbahasa Inggris + teks paralel puluhan bahasa
  → jalur Tunas & Lintas Bahasa (termasuk cerita bertani/berkebun).
- **StoryWeaver, Let's Read, Bloom Library (YLAI):** cerita anak berbahasa Indonesia CC BY → importer berikutnya (API platform).

Rancangan tampilan: jalur baru **„Buku Pelajaran“** dengan rak jenjang **SD/MI · SMP/MTs · SMA/MA · SMK/MAK · Perguruan Tinggi**
dan rak mata pelajaran; madrasah memakai buku mata pelajaran umum yang sama (label MI/MTs/MA/MAK ikut jenjangnya). Konversi PDF
→ teks per bab berjalan di GitHub Actions (`pdftotext`), hasilnya diunggah ke R2 lewat endpoint ops berkunci; pembaca AUTO yang
sama (suara, lembar membalik, sampai akhir buku).

### 0.27 Tampilan buku beranimasi, menu, empat portal (pemilik, 9 Nov 2026)

> „Cari jg css menarik, indah, full animasi dari situs2 yg menyajikan animasi2 buku termasuk menu2nya... Jgn lupa portal guru,
> portal pelajar dan portal umum serta portal super admin... Bikin website ini lebih interaktif dengan konsep yg sy berikan yg
> sh minta anda kembangkan“

- **Desain:** orisinal (aturan pemilik: CSS tiap situs berbeda, bukan salinan situs lain), memakai pustaka terbuka berlisensi
  bebas bila perlu — **StPageFlip** (MIT) untuk lembar melengkung seperti buku sungguhan (dua halaman di layar lebar, satu di HP,
  bisa ditarik dengan jari/tetikus), menu bergaya rak buku dengan animasi buka-tutup, sampul 3D yang miring mengikuti kursor,
  rak berputar di beranda, transisi halaman lembut; semua menghormati `prefers-reduced-motion`.
- **Empat portal (fase J-B):** *pelajar* (rak saya, lanjut baca, tugas kelas, nilai, lencana), *guru* (kelas nama unik,
  undangan tautan/kode/QR, chat moderasi, rak kelas, soal & nilai, ekspor, tautan xscan.es/ascan.es), *umum/keluarga* (rak
  keluarga, profil anak, rencana baca, statistik), *super admin* (kunci API terenkripsi, anggaran AI, moderasi, persetujuan
  impor, sumber buku, notifikasi, cadangan). Jenius tetap gratis.
- **Lebih interaktif:** kuis singkat di akhir bab, tantangan baca, lencana, pencarian instan, rekomendasi per jenjang.

### 0.28 Perpustakaan digital: serap sebanyak mungkin, kategori tepat, judul A–Z (pemilik, 9 Nov 2026)

> „Jadiin aja jenius.us perpustakaan digital... Cari lebih banyak buku serap semua, yg penting nyusun kategori nya tepat, Misal
> judul A-Z trus, umum, pelajar dan seterusnya“ (dibaca sebagai jenius.es; „.us“ dianggap salah ketik sampai pemilik
> menyebut sebaliknya).

- Halaman **Perpustakaan** (`/perpustakaan`, `/en/library`): seluruh buku dalam satu katalog dengan dua cara menelusuri —
  **Judul A–Z** (indeks huruf, lompat per huruf) dan **Kategori**: Anak (TK–SD) · Pelajar (SD/MI, SMP/MTs, SMA/MA, SMK/MAK) ·
  Mahasiswa & Akademik · Umum (novel, cerita, puisi) · Profesional · Bahasa Asing; di dalamnya rak tema & mata pelajaran.
- Ringkasan katalog satu dokumen R2 (`k/library.json`) diperbarui oleh langkah berkala, bukan dibaca ulang setiap kunjungan.
- Penyerapan diperluas terus: BSE 1.198 judul (berjalan per jam), Standard Ebooks (697 judul; hanya yang domain publik di
  Indonesia), African Storybook, OpenStax CC BY, StoryWeaver/Let's Read/Bloom (CC BY, berbahasa Indonesia) — setiap judul
  diklasifikasi otomatis ke kategori & jenjang saat impor.

### 0.29 Target 100 ribu → 1 juta buku, termasuk buku pelajaran pelajar WNA seluruh dunia; R2 100 GB (pemilik, 9 Nov 2026)

> „Klo bisa sampe punya 100rb buku“ — „Termasuk buku pelajaran dari pelajar WNA seluruh dunia.. Target 1jt buku, R2 100GB“

**Hanya sumber yang boleh tayang di situs beriklan dan dialihsuarakan** (domain publik di Indonesia, CC0, CC BY, CC BY-SA;
NC/ND/lisensi tidak jelas ditolak, dicek per judul). Perkiraan jumlah judul yang lolos:

| Fase | Sumber | Perkiraan | Lisensi / syarat | Cara serap |
|---|---|---|---|---|
| G1 | Project Gutenberg (60+ bahasa) | ±55–60 ribu | domain publik; di Indonesia hanya bila penulis/penerjemah wafat ≤ 1955 (tahun 2026) | katalog CSV mingguan `pg_catalog.csv` (CC0) + teks dari *mirror* resmi, jeda antarpermintaan sesuai kebijakan robot Gutenberg |
| G2 | StoryWeaver (Pratham Books) + `github.com/global-asp/pb-source` | ±20–50 ribu (19.400 buku, 233 bahasa pada 2020; terus bertambah) | CC BY 4.0 | sumber Markdown di GitHub + API StoryWeaver |
| G2 | African Storybook + Global-ASP, Bloom Library (Yayasan Literasi Anak Indonesia dll.), Let's Read | ±15–30 ribu | CC BY per judul | Markdown GitHub / API platform |
| G3 | Wikisource semua bahasa, Wikibooks (buku pelajaran multibahasa, termasuk id.wikibooks) | ratusan ribu teks | domain publik / CC BY-SA | dump Wikimedia + API, gerbang mutu |
| G4 | Buku pelajaran terbuka sedunia untuk pelajar WNA: OpenStax CC BY, BCcampus OpenEd, Open Textbook Library, LibreTexts & Pressbooks (judul CC BY saja) | ribuan | CC BY / CC BY-SA per judul | EPUB/HTML/XML resmi |
| G5 | Internet Archive teks domain publik (lolos aturan Indonesia), BSE Indonesia (1.198, berjalan) | menuju 1 juta | domain publik / izin BSE | OCR yang lolos gerbang mutu saja |

Catatan jujur: 100 ribu judul realistis dari G1–G2; 1 juta hanya tercapai dengan porsi besar G3 dan G5 (teks lebih pendek, mutu
OCR beragam) — hitungan nyata per sumber tampil di portal super admin, bukan angka perkiraan.

**Penyimpanan 100 GB:** satu objek per buku berisi semua bab, dikompres gzip (rata-rata ±100 KB per buku teks) → 1 juta buku
≈ 100 GB; gambar buku bergambar WebP (±60 KB per halaman, buku bergambar dibatasi); sampul dibuat SVG dari judul (tanpa
berkas). Satu tulisan R2 per buku (bukan per bab) agar biaya operasi rendah.
**Kategori:** setiap judul diklasifikasi saat impor ke kategori perpustakaan (§0.28: Anak, Pelajar per jenjang, Mahasiswa &
Akademik, Umum, Profesional, Bahasa Asing), bahasa, dan rak tema; indeks judul A–Z per bahasa.
**Urutan:** G1 Gutenberg dibangun pertama (pipeline GitHub Actions seperti BSE, unggah lewat endpoint ops), lalu G2, G3, G4, G5.

### 0.3 Pengalaman baca AUTO (inti produk)

- **Mode Dengar-Baca:** tekan Putar sekali → suara membaca halaman, kata disorot, halaman berganti sendiri dengan animasi
  balik halaman, berlanjut sampai akhir bab (atau seluruh buku bila dipilih). Jeda/lanjut, kecepatan 0,75–1,5×, pilihan
  suara (anak, guru perempuan, guru laki-laki, narator). Posisi terakhir tersimpan; „lanjutkan dari halaman 37“.
- **Mode Slide:** buku bergambar tampil sebagai slide penuh layar dengan transisi; artikel interaktif tampil per bagian
  dengan animasi masuk (hormati `prefers-reduced-motion`).
- **Sampul:** dari sumber bila ada; bila tidak, sampul tipografi otomatis (judul, penulis, warna jenjang) — tanpa gambar
  makhluk bernyawa buatan AI (aturan ekosistem).
- **Suara:** jalur A pembaca suara perangkat (gratis, offline); jalur B suara sintetis terbuka yang dirender sekali per
  halaman dan disimpan (Kokoro/Piper, lisensi terbuka) sesuai anggaran R2 §8.5; LibriVox (suara manusia, domain publik)
  untuk judul yang tersedia.

### 0.4 Portal guru dan kelas

- Guru membuat **kelas dengan nama unik** (createOnce di R2: `cls/{slug}`), jenjang, mata pelajaran.
- **Undang murid:** tautan kelas + kode; murid bergabung tanpa e-mail (anak) atau dengan akun (dewasa); orang tua menyetujui
  untuk anak di bawah umur.
- **Grup & chat:** chat grup kelas (moderasi guru, saringan kata, tanpa berbagi data pribadi, pesan disimpan 90 hari).
- **Berbagi:** buku rekomendasi, soal (pilihan ganda/isian; bisa dibuat AI dari isi buku), tautan kelas.
- **Nilai:** nilai per soal/tugas, rekap kelas, ekspor CSV; progres baca per murid.
- **Rekomendasi jenjang:** katalog menyaring dan menyarankan buku sesuai jenjang kelas.
- **Tugas lanjutan:** tautan ke xscan.es (memeriksa tulisan murid) dan ascan.es (analisis artikel & domain) dari portal.


Disusun 7 November 2026. Perintah pemilik (dengan dua tangkapan layar konsep: *3. Digital Literacy & Reading AI*,
*4. AI Teacher Assistant*, *5. Smart Classroom*):

> „Untuk situs jenius.es buatkan website ini, ambil e-book dari sumber terbuka manapun yg mengizinkan bukunya di serap,
> cari dr github sber terbuka manapun, voice nya suara yg relevan, seperti pembaca nya anak2, anak perempuan kecil, suara
> guru yg bijak baik perempuan dan laki dll, pokoknya kembangin dulu dalam bentuk blueprint, jika memang memerlukan input
> api key sediakan di portal super admin untuk inputnya, dan berikan rekomendasi AI apa yg d gunakan, contoh haiku,
> sonnet, opus dll, tp dengan logika gunakan yg paling murah tp tetep optimal... Bikin blueprintnya dulu setelah selesai
> mengerjakan kode adsense“

Status (blueprint 7 Nov): **blueprint** (belum dibangun). Urutan: kode AdSense semua situs live (`docs/ADSENSE-BLUEPRINT.md` §23) →
blueprint ini → persetujuan pemilik atas keputusan di §15 → dibangun fase demi fase (§14).

**Status 9 Nov 2026 — fase J-A dibangun** (perintah pemilik: „Ga usah nanya lg, bikin aja jenius.es sesuai permintaan sy dari
awal sampai selesai, trus kerjain perintah artikel, bikin 2 bahasa semua situs artikel yg bukan make bhs Inggris“), folder
`jenius/` (Worker `jenius-es`, deploy `.github/workflows/deploy-jenius.yml`, uji `.github/workflows/jenius-ci.yml`):
- situs publik **Indonesia + Inggris** (hreflang, sitemap, JSON-LD, robots tanpa blokir crawler), 8 jalur baca, halaman buku,
  pencarian, 8 halaman wajib (tentang, kontak, privasi, cookie, syarat, aksesibilitas, penafian, panduan) + lisensi buku;
- **pembaca AUTO** (`jenius/public/assets/reader.js`): Putar sekali → suara sintetis perangkat membacakan, kata disorot,
  halaman berganti dengan animasi, lanjut sampai akhir bab atau akhir buku (bab berikutnya dibuka dan tetap diputar), mode
  slide layar penuh untuk buku bergambar, mode baca sendiri, suara per jalur (anak, guru perempuan, guru laki-laki,
  narator), kecepatan, huruf ramah disleksia, mode malam, kontras tinggi, keyboard & usap, posisi baca tersimpan;
- impor buku terbuka otomatis (cron tiap menit; Book Dash CC BY 4.0 + Standard Ebooks yang lolos domain publik Indonesia),
  cadangan harian R2 35 hari (`jenius/src/backup.ts`), data hanya di R2;
- 4 alat gratis (uji kecepatan baca, rencana baca mingguan, pemilih buku, kartu kosakata bersuara), 10 artikel pertama
  ID + EN dengan tombol „Dengarkan artikel ini“ (sorot paragraf + gulir otomatis);
- PWA (spanduk pasang, service worker, bisa dibaca tanpa internet);
- AdSense: akun utama ca-pub-6146217038829045 + tumpukan `adsense-stack.json`; loader hanya di halaman dewasa — pembaca
  buku dan jalur anak tanpa loader (tag meta tetap ada).
Deploy pertama 9 Nov 2026: zona jenius.es aktif, Worker terpasang sebagai custom domain jenius.es + www, R2 `jenius-data`
dan `jenius-backups` serta KV `jenius-rl` dibuat sendiri, ads.txt 21 baris terverifikasi. **Cron ditolak Cloudflare**: akun
memakai paket Workers gratis dan batas 5 cron per akun sudah terpakai. Pengganti tanpa biaya (`jenius/src/ops.ts`):
`POST /api/ops/tick` dengan kunci acak sekali pakai (hanya hash-nya di R2, `k/ops.json`, berlaku 6 jam) dipanggil
`.github/workflows/jenius-ops.yml` tiap 30 menit dan sekali langsung setelah deploy, ditambah langkah latar saat ada
kunjungan (paling sering sekali per menit, klaim CAS `k/tick.json`). Bila akun pindah ke Workers Paid, cron bisa dipasang
lagi di `jenius/wrangler.jsonc`.
Berikutnya: J-B (akun, kelas dengan nama unik, undangan, chat, rak, soal, nilai, AI) lalu J-C (70 artikel).

Tangkapan layar hanya menampilkan butir 3–5 dan ekor butir 2 („Laporan perkembangan siswa. Informasi untuk murid“);
butir 1 tidak terlihat. Butir 2 ditafsirkan sebagai portal sekolah/orang tua (laporan perkembangan + informasi untuk
murid) dan masuk ke §6.4; bila maksud pemilik lain, cukup dikoreksi di sini.

---

## 1. Aturan tetap

| No | Aturan |
|---|---|
| 1 | **Penyimpanan R2 saja, tidak pernah D1** — desain R2 Store (`docs/R2-DATA-BLUEPRINT.md` §3). |
| 2 | **R2 harus kecil.** Pemilik menargetkan R2 situs islami di bawah 5 GB (7 Nov 2026) dan pernah mencapai 121 GB karena audiobook (§12 blueprint AdSense). jenius.es punya **anggaran penyimpanan sendiri** (§8.5) dan tidak pernah membuat audio massal tanpa batas. |
| 3 | **Hanya buku berlisensi terbuka yang mengizinkan pemakaian komersial dan turunan** (CC0, domain publik, CC BY, CC BY-SA). **Lisensi NC (non-komersial) tidak dipakai**, karena situs memuat iklan AdSense. Lisensi dicatat per buku; atribusi tampil di setiap buku. |
| 4 | **Data anak minimal.** Akun anak dibuat dan dikelola orang tua/guru, tanpa e-mail anak, tanpa foto, tanpa obrolan bebas yang disimpan lama. Persetujuan orang tua sesuai GDPR + LOPDGDD (Spanyol: di bawah 14 tahun). |
| 5 | **Tidak ada iklan di halaman anak.** AdSense hanya di halaman untuk orang dewasa (artikel untuk orang tua dan guru, beranda, panduan). Pembaca buku, kuis, dan dasbor anak bebas iklan; halaman yang ditujukan kepada anak tidak memuat loader. |
| 6 | **Suara sintetis disebut sintetis.** Tidak ada klaim bahwa pembacanya anak sungguhan; tidak ada kloning suara orang nyata (apalagi anak) tanpa izin tertulis. |
| 7 | **AI aman untuk anak:** jawaban hanya dari isi buku, kalimat pendek, tanpa tautan keluar, tanpa meminta data pribadi; percakapan disaring dan dibatasi. |
| 8 | **Kunci API hanya di portal super admin**, terenkripsi, tidak pernah ke browser. |
| 9 | **Artikel ditulis, bukan terjemahan mesin** (pemilik 7 Nov 2026); 70 artikel + versi Inggris (§11). |
| 10 | Tidak menyalin cerita atau artikel dari axto.us (situs cerita anak berbahasa Inggris dalam ekosistem): niche dibedakan (§2), tautan antar-situs hanya yang relevan. |

---

## 2. Posisi dan bahasa

- **jenius.es = perpustakaan baca interaktif berbahasa Spanyol** (domain .es, aturan ekosistem „satu situs, bahasa
  sesuai ekstensi“) **dengan versi Inggris** untuk semua halaman dan artikel (perintah pemilik 7 Nov). Buku tersedia dalam
  bahasa aslinya (Spanyol, Inggris; bahasa lain bila lisensinya ada).
- Pengguna: anak 4–12 tahun (membaca), orang tua, guru SD/TK, sekolah.
- Pembeda dari axto.us: axto.us adalah blog literasi + cerita berbahasa Inggris; jenius.es adalah aplikasi baca
  bersuara + asisten guru + kelas, berbahasa Spanyol.
- Kepanjangan usulan: **J**uegos, **E**scucha, **N**arración, **I**nteligencia, **U**nidos para **S**aber
  (permainan, mendengarkan, narasi, kecerdasan, belajar bersama) — bisa diganti pemilik.

---

## 3. Fitur (dari tangkapan layar pemilik)

### 3.1 Digital Literacy & Reading AI — perpustakaan digital interaktif

- **Ribuan bacaan edukatif:** katalog dengan saringan usia, tingkat baca (1–6), bahasa, tema, durasi, ilustrasi.
- **Buku dengan narasi suara:** pilih pembaca (§8), kecepatan 0,75×/1×/1,25×, *read-along* — kata yang sedang dibaca
  disorot; ketuk kata untuk mendengar kata itu saja.
- **AI untuk memahami isi bacaan:** tombol „Tanya tentang buku ini“ — pertanyaan anak dijawab hanya dari isi buku,
  dengan kalimat sesuai usia; bila jawabannya tidak ada di buku, AI mengatakannya.
- **Kuis setelah membaca:** 3–6 soal per buku (pilihan ganda, urutkan cerita, kosakata), dibuat sekali per buku dan
  diperiksa (§7.3), bukan dibuat ulang setiap anak membuka.
- **Poin dan penghargaan membaca:** poin per buku selesai dan kuis, lencana, *streak* harian, rak buku pribadi.
- Aksesibilitas: font ramah disleksia (opsi), ukuran huruf, kontras tinggi, mode malam, tanpa animasi bila
  `prefers-reduced-motion`.

### 3.2 AI Teacher Assistant — asisten digital untuk guru

- **Membuat modul ajar** dari buku pilihan + tujuan pembelajaran + jenjang.
- **Menyusun materi pembelajaran:** ringkasan, kosakata, kegiatan sebelum/selama/sesudah membaca, lembar kerja cetak.
- **Membuat soal dan rubrik** (pilihan ganda, isian, uraian, rubrik membaca nyaring/pemahaman).
- **Membantu analisis hasil ujian:** dari nilai kelas (CSV/isian) → butir yang sulit, siswa yang perlu bantuan, saran
  tindak lanjut. Hanya statistik dan saran; keputusan tetap pada guru.
- **Menyusun laporan pembelajaran:** laporan per siswa/kelas dari data baca dan kuis di platform.
- Semua keluaran bisa disunting guru, disimpan, dicetak, dibagikan ke kelas.

### 3.3 Smart Classroom — belajar jadi permainan

- Kelas dengan kode gabung (tanpa e-mail anak), guru menugaskan buku/rak.
- **Tantangan baca kelas** (seperti „Mrs. Johnson's Reading Challenge — TOTAL 2,180 of 5,000“ di tangkapan layar):
  target poin/menit/buku bersama, papan kemajuan kelas (tanpa peringkat publik yang mempermalukan anak; papan individu
  hanya terlihat oleh guru).
- Misi mingguan, lencana kelas, perayaan saat target tercapai.

### 3.4 Portal orang tua dan sekolah (butir 2)

- **Laporan perkembangan siswa:** buku dibaca, menit membaca, tingkat baca, hasil kuis, kosakata baru.
- **Informasi untuk murid/orang tua:** pengumuman guru, tugas baca, jadwal tantangan.
- Ekspor PDF laporan bulanan.

---

## 4. Sumber e-book terbuka

Hanya sumber yang lisensinya mengizinkan penyalinan, penyuaraan (karya turunan) dan pemakaian di situs beriklan.
**Lisensi dicek per buku saat impor**, karena satu platform bisa memuat lisensi berbeda.

| Sumber | Isi | Lisensi umum (dicek per buku) | Cara ambil | Catatan |
|---|---|---|---|---|
| **StoryWeaver** (Pratham Books) | ribuan cerita bergambar anak, ratusan bahasa termasuk Spanyol dan Inggris | sebagian besar CC BY 4.0 | unduhan per buku (ePub/PDF) dari situsnya | atribusi penulis, ilustrator, penerjemah, StoryWeaver |
| **Book Dash** | buku bergambar anak, Inggris dan bahasa Afrika Selatan | CC BY 4.0 | berkas sumber dan ePub dipublikasikan di GitHub (`bookdash`) | cocok untuk impor otomatis |
| **African Storybook** | cerita bergambar, Inggris dan banyak bahasa Afrika | CC BY 4.0 (sebagian NC — dibuang) | unduhan per buku | |
| **Let's Read** (The Asia Foundation) | cerita bergambar Asia, ada Spanyol untuk sebagian judul | per buku (CC BY 4.0 atau NC) | unduhan per buku | hanya yang CC BY/CC BY-SA |
| **Global Digital Library** | koleksi gabungan buku anak berlisensi terbuka | per buku | API/unduhan bila masih tersedia | status layanan dicek saat impor |
| **Project Gutenberg** | klasik domain publik (dongeng, fabel: Aesop, Grimm, Andersen, Perrault; teks Spanyol domain publik) | domain publik (AS) | ePub/teks | hapus merek „Project Gutenberg“ dari teks bila disajikan bukan sebagai eBook PG; cek domain publik untuk Spanyol (penulis wafat > 80 tahun untuk wafat sebelum 1987) |
| **Wikisource (es/en)** | teks domain publik (cuentos, fábulas, poesía) | domain publik | API MediaWiki | |
| **Wikibooks — Wikijunior** | buku nonfiksi anak | CC BY-SA 4.0 | API MediaWiki | turunan (audio) ikut CC BY-SA |

**Pipeline impor** (Worker + antrean, satu buku per pekerjaan):
1. Ambil metadata + berkas → 2. baca lisensi; tolak NC/ND/tidak jelas → 3. ekstrak teks per halaman dan gambar → 4.
kompres gambar (WebP ≤1600 px) → 5. klasifikasi usia/tingkat/tema (Haiku, batch) → 6. **antrean persetujuan admin**
(pratinjau, lisensi, atribusi, kepantasan untuk anak) → 7. terbit. Tidak ada buku yang tayang tanpa persetujuan.
Setiap buku menyimpan: judul, penulis, ilustrator, penerjemah, sumber URL, lisensi, tanggal impor, perubahan yang dibuat.

---

## 5. Arsitektur

- **Cloudflare Workers** (situs + API), **R2** (`jenius-data` dokumen JSON, `jenius-media` gambar/audio, `jenius-backups`
  35 hari), **KV** hanya cache dan rate limit, **Queues** untuk impor dan pembuatan audio, **Cron** untuk pembersihan.
- Desain R2 Store: satu dokumen per objek, `createOnce` untuk nilai unik (e-mail guru, kode kelas), CAS untuk progres
  dan poin (tanpa kunci panas: poin kelas dijumlah dari dokumen per siswa per hari, bukan satu dokumen yang ditulis
  setiap detik).
- Pembaca buku sebagai halaman statis + JavaScript ringan (bisa dibaca offline sebagai PWA untuk buku yang sudah dibuka).

---

## 6. Peran dan portal

| Peran | Portal |
|---|---|
| **Super Admin** | semua; **kunci API** (Anthropic, penyedia suara bila dipakai) dengan tombol Uji; pilihan model per tugas dan batas belanja; suara; antrean persetujuan buku; artikel; AdSense; audit |
| Admin konten | persetujuan buku, kuis, artikel, moderasi |
| Guru | kelas, tugas baca, tantangan, asisten guru AI, laporan |
| Orang tua | profil anak, persetujuan, laporan, batas waktu layar |
| Anak (profil) | rak, pembaca, kuis, lencana; tanpa e-mail, masuk lewat kode kelas/PIN gambar |
| Tamu | katalog dan buku contoh, artikel |

---

## 7. AI: model termurah yang tetap optimal

### 7.1 Model (harga Anthropic per 1 juta token, diverifikasi 7 Nov 2026; diatur dan diuji di portal super admin)

| Model | ID | Input / Output | Dipakai untuk |
|---|---|---|---|
| Haiku 5.5 | `claude-haiku-5-5` | US$0,10 / US$0,50 | **bawaan untuk hampir semua tugas anak**: tanya-jawab isi buku, klasifikasi tingkat baca, menyederhanakan kalimat, kosakata |
| Sonnet 5.5 | `claude-sonnet-5-5` | US$2 / US$10 | asisten guru (modul ajar, materi, soal + rubrik, analisis nilai, laporan); pembuatan kuis sekali per buku |
| Opus 5.5 | `claude-opus-5-5` | US$4 / US$20 | hanya atas permintaan guru: rencana pembelajaran satu semester dari banyak buku |
| Fable 5.1 | `claude-fable-5-1` | US$10 / US$50 | **tidak dipakai**: lebih mahal dari Opus dan mensyaratkan retensi data 30 hari di Anthropic — tidak cocok untuk data anak |

### 7.2 Logika pemilihan

1. Setiap tugas punya **model minimum** di tabel atas; router memilih yang **termurah di antara model yang memenuhi**
   dan aktif, menurut harga yang tersimpan di admin (bukan urutan tetap).
2. **Buat sekali, simpan, pakai berkali-kali:** kuis, ringkasan, kosakata dan tingkat baca dibuat **sekali per buku**
   lewat Batch API (diskon 50 %), disimpan di R2, lalu disajikan tanpa biaya AI. Biaya per buku menjadi sekali bayar.
3. **Tanya-jawab anak:** Haiku dengan teks buku sebagai konteks yang di-*cache* (prompt caching) — banyak anak bertanya
   tentang buku yang sama, jadi konteks yang sama dibaca dari cache.
4. **Eskalasi hanya bila perlu:** jawaban gagal validasi (mis. keluar dari isi buku, terlalu panjang untuk usia) → coba
   ulang sekali dengan Sonnet; bila tetap gagal, jawab „Aku tidak menemukan jawabannya di buku ini.“
5. **Batas belanja:** per hari, per guru, per kelas; *emergency stop* bila batas tercapai; semua pemakaian dicatat.
6. Effort rendah (`low`) untuk tanya-jawab anak, `medium` untuk materi guru.

### 7.3 Keamanan isi untuk anak

- Prompt sistem tetap: hanya dari isi buku, bahasa sesuai usia, tanpa tautan, tanpa meminta data pribadi, menolak topik di
  luar buku dengan ramah.
- Saringan masukan (kata kasar, data pribadi seperti alamat/telepon) sebelum ke model; saringan keluaran sebelum tampil.
- Kuis dan materi buatan AI **diperiksa admin/guru** sebelum dipakai anak (status draf → disetujui).
- Percakapan anak tidak disimpan lebih dari 24 jam; yang disimpan hanya statistik (jumlah pertanyaan per buku).

---

## 8. Suara pembaca

### 8.1 Pembaca yang diminta pemilik

| Pembaca | Bahasa | Kegunaan |
|---|---|---|
| Anak perempuan kecil („niña“) | es, en | cerita usia 4–7 |
| Anak laki-laki („niño“) | es, en | cerita usia 4–7 |
| Guru perempuan yang bijak („maestra“) | es, en | narasi utama, nonfiksi |
| Guru laki-laki yang bijak („maestro“) | es, en | narasi utama, fabel |
| Kakek/nenek pendongeng (opsional) | es | dongeng klasik |

### 8.2 Tiga jalur suara (dari yang paling murah)

| Jalur | Biaya | Penyimpanan | Mutu | Kapan |
|---|---|---|---|---|
| **A. Suara perangkat** (Web Speech API di browser) | 0 | 0 byte | tergantung perangkat; pilihan suara terbatas, umumnya tanpa suara anak | cadangan selalu tersedia; sama seperti narasi artikel di ulyah.com |
| **B. TTS open-source, dibuat sekali, disimpan** | 0 (CPU GitHub Actions/runner sendiri) | ±1 MB per 5 menit (Opus 24 kbps mono) | baik | **jalur utama** untuk buku yang sudah disetujui |
| **C. TTS cloud berbayar** | per karakter | sama dengan B | sangat baik, ada suara anak resmi | hanya untuk buku unggulan, bila pemilik menyalakan dan mengisi kuncinya di portal |

Jalur B — mesin yang lisensinya mengizinkan pemakaian komersial:
- **Kokoro-82M** (Apache-2.0): suara alami, mendukung Spanyol dan Inggris, berjalan di CPU.
- **Piper** (MIT, sudah dipakai di repo ini): sangat cepat, banyak suara Spanyol (es_ES, es_MX) dan Inggris; mutu sedikit
  di bawah Kokoro.
- Mesin dengan lisensi non-komersial (mis. Coqui XTTS di bawah CPML) **tidak dipakai**.
- Suara „anak“ di jalur B: pilih suara bernada tinggi yang lisensinya terbuka dan beri label „voz sintética infantil“;
  bila tidak ada yang layak untuk sebuah bahasa, pembaca anak memakai jalur C atau ditiadakan untuk bahasa itu —
  **tidak** memaksakan dengan mengubah pitch suara dewasa secara kasar.

Jalur C — penyedia dengan suara anak resmi untuk penggunaan komersial (kunci diisi di portal super admin, dicek syarat
lisensinya sebelum dinyalakan): Microsoft Azure Speech (ada suara anak neural), Amazon Polly (ada suara anak), Google
Cloud TTS. Pilihannya keputusan pemilik (§15).

### 8.3 Read-along (sorot kata)

Jalur B/C menghasilkan *timestamp* per kata (Kokoro/Piper: dari fonem; Azure/Polly: *word boundary/speech marks*),
disimpan sebagai JSON kecil di samping audio. Jalur A memakai event `boundary` dari Web Speech.

### 8.4 Kapan audio dibuat

- **Saat buku disetujui** hanya untuk **dua suara bawaan** (satu dewasa, satu anak) di bahasa buku itu.
- Suara lain dibuat **saat pertama kali diminta** (antrean), lalu disimpan — dan **dihapus bila 90 hari tidak diputar**
  (aturan siklus hidup R2), kecuali buku unggulan.

### 8.5 Anggaran penyimpanan R2 jenius.es

| Isi | Hitungan | Target |
|---|---|---|
| Gambar buku (WebP) | ±0,5 MB × 12 halaman × 1.000 buku | ±6 GB → **dipangkas: 1.200 px, kualitas 70 → ±2,5 GB** |
| Audio | 1 MB × 2 suara × 1.000 buku | ±2 GB |
| Data JSON | kecil | < 0,2 GB |

Dengan target R2 ekosistem yang ketat, peluncuran dibatasi **200 buku pilihan** (±1 GB total), lalu tumbuh bertahap
setelah pemilik menyetujui anggaran. Alternatif tanpa biaya penyimpanan: gambar dari sumber aslinya tidak disalin
(hotlink tidak dipakai — tidak sopan dan rapuh), jadi anggaran ini nyata dan dicatat di admin (penghitung GB per jenis).

---

## 9. Data di R2

`books/{id}` (metadata, lisensi, atribusi, tingkat) · `books/{id}/pages/{n}` · media `img/{book}/{n}.webp`,
`audio/{book}/{voice}.opus` + `.words.json` · `quiz/{book}` · `classes/{id}` · `classes/{id}/students/{sid}` ·
`progress/{sid}/{yyyy-mm-dd}` (per hari, bukan kunci panas) · `teachers/{id}` · `parents/{id}` · `consents/{sid}` ·
`ai_usage/{yyyy-mm}/` append-only · `audit/` append-only · `k/settings.json` (model, harga, batas, suara) ·
`k/secrets.enc` (kunci API terenkripsi dengan master key di secret Worker).

---

## 10. Privasi dan kepatuhan

- Persetujuan orang tua sebelum profil anak aktif; orang tua bisa melihat, mengekspor, dan menghapus data anak.
- Tidak ada pelacakan iklan di halaman anak (rule 5). Halaman dewasa memakai banner persetujuan cookie (CMP bersertifikat
  Google untuk EEA/UK, syarat AdSense di Eropa).
- Halaman wajib: Aviso legal (LSSI), Política de privacidad (dengan bagian anak), Política de cookies, Términos,
  Accesibilidad, Licencias y atribuciones (daftar semua buku dan lisensinya), Contacto.

---

## 11. Situs publik dan AdSense

- Kode AdSense sudah disiapkan: akun utama **ca-pub-6146217038829045** + 16 akun ditumpuk (`adsense-stack.json`),
  dipasang saat situs dibuat. Verifikasi Sedo sudah ada di DNS (7 Nov 2026).
- **Akun AdSense (8 Nov 2026):** akun utama ca-pub-6146217038829045 + 21 akun tumpukan (`adsense-stack.json`).
- **Iklan hanya di halaman dewasa** (§1 no. 5): beranda, artikel, panduan, halaman guru publik.
- **70 artikel** untuk orang tua, guru, pelajar, dan pembaca umum, **Indonesia + versi Inggris** yang ditulis (bukan terjemahan mesin, §0), ≥1.500 kata,
  sumber resmi (UNESCO, Ministerio de Educación y FP, OECD PISA, Instituto Cervantes, RAE untuk ejaan), terbit bertahap.

Kluster (10 artikel per kluster):
1. **Aprender a leer** — conciencia fonológica, método silábico vs global, leer en voz alta, etapas de lectura por edad.
2. **Hábito lector en casa** — rutinas, cuentos antes de dormir, bibliotecas en casa, pantallas y lectura.
3. **Comprensión lectora** — preguntas antes/durante/después, vocabulario, inferencias, resumir.
4. **Dificultades de lectura** — dislexia (señales, apoyos), TDAH y lectura, cuándo consultar a un especialista.
5. **Bilingüismo y lectura** — leer en español e inglés, familias bilingües, segundo idioma.
6. **Docentes y aula** — planes lectores, lectura en voz alta en clase, retos lectores, evaluación de la lectura.
7. **IA y educación con criterio** — cómo usar IA en el aula, privacidad de los niños, enseñar a leer con IA sin depender de ella.

Alat gratis untuk orang tua/guru (kriteria „alat yang autentik“): penghitung kata per menit (lectura en voz alta),
generator rencana baca mingguan, pemilih buku menurut usia dan tingkat, kartu kosakata cetak.

---

## 12. Tautan antar-situs (tanpa melanggar kebijakan)

Hanya tautan yang relevan untuk pembaca, dengan teks jangkar yang menyebut topik situs tujuan: axto.us (literasi anak
berbahasa Inggris), xscan.es (penilaian tulisan untuk guru), situs muslim ulyah.com/dawa.im hanya dari halaman yang
relevan (mis. cerita anak islami) — tidak ada pertukaran tautan massal, tidak ada blok tautan di kaki setiap halaman.

---

## 13. Uji

Unit (lisensi ditolak bila NC, router model, batas belanja, poin/streak tanpa kunci panas) · e2e (guru membuat kelas →
anak masuk dengan kode → membaca dengan suara → kuis → poin → laporan orang tua) di desktop dan ponsel · keamanan (anak
tidak bisa melihat kelas lain, kunci API tidak pernah di respons) · aksesibilitas (pembaca layar, kontras) · audit live
AdSense (`site-audit.yml`: halaman dewasa punya loader, halaman anak tidak).

---

## 14. Tahapan

| Fase | Isi | Selesai bila |
|---|---|---|
| J0 | Situs dasar + halaman wajib + AdSense 16 akun + 10 artikel pertama ES/EN + alat | `site-audit` OK, halaman wajib lengkap |
| J1 | Pipeline impor + persetujuan + 200 buku + pembaca + suara jalur A | 200 buku tayang dengan atribusi benar |
| J2 | Suara jalur B (Kokoro/Piper) + read-along + anggaran R2 | audio 2 suara untuk 200 buku, R2 jenius ≤ 1,5 GB |
| J3 | Akun guru/orang tua/anak, kelas, persetujuan orang tua | e2e kelas lulus |
| J4 | Kuis (sekali per buku, Batch) + poin, lencana, tantangan kelas | |
| J5 | Asisten guru AI (Sonnet) + tanya-jawab anak (Haiku) + portal super admin kunci API & batas | biaya per tugas tercatat; batas belanja diuji |
| J6 | Laporan perkembangan, portal orang tua, ekspor PDF | |
| J7 | 70 artikel lengkap, jalur C (bila disetujui), uji beban dan keamanan | |

---

## 15. Keputusan pemilik

1. **Bahasa:** Spanyol + Inggris (usulan) — atau tambah Indonesia.
2. **Anggaran R2 jenius.es:** 1,5 GB untuk peluncuran (usulan), naik setelah disetujui.
3. **Suara jalur C** (berbayar, ada suara anak resmi): tidak dulu (usulan) / Azure / Polly / Google.
4. **Model:** Haiku untuk anak, Sonnet untuk guru, Opus atas permintaan, Fable tidak dipakai (usulan).
5. **Biaya untuk guru/sekolah:** gratis untuk membaca; asisten guru AI berbayar (kredit) atau gratis dengan batas harian.
6. **Kepanjangan nama** jenius.es (§2).
