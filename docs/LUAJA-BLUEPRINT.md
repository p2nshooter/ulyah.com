# LUAJA.com — Blueprint, standar keberhasilan dan status

**LUAJA** = *Learning Universal for Achievement, Journey & Advancement* — „Learn Without Limits. A World of Languages. A
Future of Opportunities.“ Situs belajar bahasa **Jerman, Inggris dan Jepang** (+ persiapan **TOEFL** dan **IELTS**) untuk
penutur Indonesia: pelajaran interaktif berurutan, pustaka buku bebas yang bisa dibacakan dan diterjemahkan, video dengan
transkrip yang menjadi kosakata latihan, portal member berbayar dan portal admin.

Folder kode: `luaja/` (Cloudflare Worker `luaja-com`). Aturan tetap pemilik berlaku: **semua data di R2, tidak pernah D1**
(`docs/R2-DATA-BLUEPRINT.md` §3), AdSense tumpuk dari `adsense-stack.json`, tidak ada rahasia di repo.

---

## 0. Perintah pemilik (dicatat apa adanya)

| Tanggal | Perintah | Status |
|---|---|---|
| 13–14 Nov 2026 | „Tolong bikinin situs ini, berbayar buat member 500rb / thn per bahasa, untuk 3 bahasa 1,3jt.... cari dan serap sumber buku, audio dan youtube manapun yg bebas di serap tanpa perlu izin... Kembangkan agar jadi pembelajaran yg interaktif, komplex dan kumplit... Setiap buku seluruh bahasa wajib bisa di bacakan dan di translate ke bahasa Indonesia, setiap video dr sumber youtube atau apapun wajib kata2nya bisa di jadiin text di bawahnya sebagai vocabulary yg bisa di praktekan baik per kata maupun satu kalimat.... Logo, banner, vavicon hanya contoh, buatkan lagi yg lebih interaktif... Setiap pembelajaran wajib interaktif... Pemabayaran member ke rek Seabank … atas nama Yusron Efendi... Buatkan di portal member untuk upload bukti bayar sebelum member bisa mendapatkan manfaat. Gunakan website luaja.com dan website ini jg untuk pendaftaran adsense, buatkan SEO dan niche yg canggih dan luar biasa.“ + lampiran `Blueprint_Deutsch_Langkah_A1-C2.docx` (13 Nov 2026) | 🔄 §4–§9 |
| 14 Nov 2026 | „…jadikan luaja.com memiliki ratusan ribu buku pembelajaran setiap bahasa nya tapi wajib di kategorikan, wajib rapih, profesional, indah dan elegan“ | 🔄 §6.3 (angka jujur per sumber) |
| 14 Nov 2026 | „Berikan promo untuk luaja.com: Promo pelajar sampai dengan kelas 12 atau 3 SMK sederajat dengan membuktikan surat keterangan pelajar terbaru biaya per bahasa 350rb/thn dan 1jt/perthn untuk 3 bahasa. dan bagi yg juara kelas, juara 1,2 & 3 dengan melampirkan bukti juara kelas per tahun saat mendaftar mendapatkan harga 200rb/thn per bahasa dan 500rb/thn untuk 3 bahasa.“ | 🔄 §3 |
| 14 Nov 2026 | „Catat dulu dalam blueprint setiap aplikasi, standar keberhasilan setiap web aplikasi yg di buat termasuk SEO nya, rapikan dalam 1 file HTML offline yg bisa sy download... Catat standard setiap menu... Perbaiki CSS … seluruh CSS wajib super premium enterprice dan indah dengan font2 menarik, dan seluruh CSS wajib interaktif dan seluruh konten nya dynamic dari portal admin... Cara masuk portal admin ketik 5x dari logo seperti ulyah.com password dan username sama seluruhnya sama dengan ulyah.com dan axto.io“ | ✅ dokumen ini + `docs/BLUEPRINT-APLIKASI.html`; 🔄 §5, §8 |
| 14 Nov 2026 | „Inget hanya di catat sebagai rancangan di blueprint, focus 100% keberhasilan project luaja.com“ · „Jgn ngerjain apa2 dulu focus luaja.com“ | ✅ aplikasi lain hanya dicatat (§12); semua pekerjaan lain ditunda |
| 14 Nov 2026 | „Setelah luaja.com sudah sempurna tanpa membocorkan rahasia perusahaan, lanjut menyempurnakan xscan.es secara menyeluruh sampai ke homepage nya yg masih sangat standar dan kurang interaktif dan kurang mempromosikan kemampuan xscan.es“ | ⏳ §12.2 (setelah luaja.com) |
| 15 Nov 2026 | „Bikin CSS nya yg bagus, … sesuai nuansa negara tempat belajar dengan rupa2 kondisi, … indah, elegan, enak buat belajar nya“ | ✅ tema per negara (Berlin, London, Tokyo) × 9 suasana (pagi–malam, hujan, salju, sakura, gugur, kabut), `luaja/public/assets/app.css`, `src/pages/scene.ts` |
| 15 Nov 2026 | Foto pemandu dari pemilik: „Pakein orang ini jadi model … gayanya ngikutin keadaan“ · „Ubah jg foto bajunya, mungkin make tas, atau lg belajar atau megang buku ambil mukanya aja“ | ✅ potret (wajah + hijab) dipotong dari foto, busana & perlengkapan ilustrasi per negara/suasana (`src/pages/figure.ts`, `public/assets/pemandu/`) |
| 15 Nov 2026 | „Yg profesional, jgn ada bahasa bongkar rahasia perusahaan, pake bahasa yg elegan dan profesional, karena ini 100% untuk bisnis kursus“ | ✅ salinan situs ditulis ulang; tidak ada halaman internal/penjelasan mekanisme di publik |
| 15 Nov 2026 | „Setiap contoh soal atau latihan soal pastikan memiliki kunci jawaban, yg bisa di cocokan saat peserta sudah menjawab seluruh soal latihan, dan memiliki prediksi nilai sementara dan berikan kata2 penyemangat … bikin ratusan contoh soal latihan … sesuai real test masing2 jenjang … siswa tidak bisa melihat kunci jawaban jika belum selesai mengerjakan … bisa ganti ke contoh soal latihan berikutnya … yg bisa di download hanya report latihan soal setiap siswa“ | ✅ fase 1: 52 paket / 967 soal (Goethe A1–B1, Cambridge A1–A2, TOEFL ITP, IELTS Academic, JLPT N5–N4 + seri penguatan), kunci hanya di server, prediksi skala ujian, kata penyemangat, paket berikutnya, laporan unduhan (`luaja/src/practice/`) · 🔄 menambah paket per jenjang |
| 15 Nov 2026 | „… cocokan juga video dan audio latihan, dan download kamus2 besar setiap bahasa … jgn ada yg bisa di download bukunya, setiap buku … PDF urai dulu, dan ubah agar menjadi buku interaktif di portal member“ | ⏳ fase 2: pustaka interaktif tanpa unduhan + kamus berlisensi terbuka (dibangun di CI, disimpan di R2) |
| 15 Nov 2026 | „Pastiin jgn pernah ninggalin PR&merge, harus sampai bersih & live“ | ✅ aturan kerja: setiap PR luaja di-merge setelah CI hijau dan deploy terverifikasi |
| 15 Nov 2026 | „Website ini menggunakan 3 bahasa, jika ip mendeteksi berasal dr indonesia, gunakan bhs Indonesia, jika … Jepang gunakan bahasa Jepang defolt nya, di luar itu gunakan bahasa Inggris, dan bisa d rubah manual dengan konsisten, jgn gunakan autotranslate, wajib di translate manual“ | ⏳ PR berikutnya: /en & /ja + hreflang, IP → bahasa awal, pilihan manual tersimpan, terjemahan manual |
| 15 Nov 2026 | „pastikan pembayaran menggunakan idr, yen dan USD serta PayPal untuk otomatis, buatkan invoice setiap pembayaran, dan untk PayPal buatkan webhook nya, jika sudah melakukan pembayaran langsung otomatis terbuka layananya, lihat rekening dari situs ulyah.com BNI dan panduanya jika TF dr luar negeri selain bisa menggunakan seabank. untuk PayPal admin input manual di portal admin, pastikan bisa live dan sanbox“ | ✅ harga & tagihan IDR/USD/JPY, PayPal Orders v2 + webhook terverifikasi (langganan aktif otomatis), invoice/kuitansi setiap tagihan, BNI multimata uang + panduan SWIFT, Admin → PayPal (live & sandbox, secret disegel MASTER_KEY di R2) |
| 15 Nov 2026 | Pemilik mengirim kredensial PayPal live & sandbox: „masukan ke R2 dan di encryption … Aktifkan LIVE jika sudah 100% siap“ | 🔄 kredensial tidak pernah ditulis ke repo/log; diisi lewat Admin → PayPal (disegel di R2). LIVE hanya bisa disimpan bila uji koneksi live berhasil |

Kode AdSense `pub-6701063918838796` (akun ke-22) sudah masuk `adsense-stack.json` pada 14 Nov 2026 (PR #427), sehingga
luaja.com membawanya sejak deploy pertama bersama 21 akun lainnya.

---

## 1. Identitas dan arah merek

| Unsur | Isi |
|---|---|
| Nama | LUAJA — Learning Universal for Achievement, Journey & Advancement |
| Slogan | Learn Without Limits. · A World of Languages. A Future of Opportunities. |
| Filosofi | Learning (belajar sepanjang hayat) · Universal (untuk semua orang) · Achievement (pencapaian) · Journey (perjalanan menuju penguasaan) · Advancement (kemajuan diri) |
| Arah merek | 1 German Language · 2 English Learning · 3 Japanese Language · 4 TOEFL Preparation · 5 IELTS Preparation · 6 Digital Books & Audiobooks · 7 AI Language Tutor |
| Warna | Biru tua kerajaan `#0b1f4d` → biru `#1746b8`, emas `#f5b301` → `#ffd766`, putih gading; aksen per bahasa: Jerman merah-emas, Inggris biru-merah, Jepang merah-putih |
| Huruf | Judul: **Fraunces** (serif tampilan); isi dan antarmuka: **Plus Jakarta Sans**; teks Jepang: huruf sistem (Noto Sans JP / Hiragino) |
| Logo, banner, favicon | Dibuat ulang sebagai **SVG hidup**: topi wisuda + bola dunia + orbit emas + buku terbuka + huruf L; orbit berputar, rumbai berayun, bola dunia mengikuti kursor/gyro. Favicon SVG + PNG 64/192/512, gambar OG 1200×630, ikon PWA maskable. Gambar contoh dari pemilik hanya rujukan bentuk. |

---

## 2. Struktur belajar

| Jalur | Jenjang | Catatan |
|---|---|---|
| Bahasa Jerman | A1 · A2 · B1 · B2 · C1 · C2 (CEFR) | Mengikuti `Blueprint_Deutsch_Langkah_A1-C2.docx`: 50 modul inti, 250 pelajaran; kode `A1-M03-L02` |
| Bahasa Inggris | 01 Beginner · 02 Elementary · 03 Pre-Intermediate · 04 Intermediate · 05 Upper-Intermediate · 06 Advanced · 07 Proficiency | Setara Pra-A1/A1 → C2 |
| Bahasa Jepang | N5 · N4 · N3 · N2 · N1 (JLPT) | Hiragana, katakana dan kanji bertahap; furigana bisa dinyalakan |
| TOEFL Preparation | Orientasi format → Reading → Listening → Speaking → Writing → simulasi | Termasuk paket Bahasa Inggris. Format dan skala skor mengikuti ketentuan ETS yang berlaku (diperiksa saat menulis materi) |
| IELTS Preparation | Academic dan General Training; Listening · Reading · Writing · Speaking; Band 0–9 | Termasuk paket Bahasa Inggris |

**Susunan tetap:** Jalur → Jenjang → Modul → Pelajaran → Langkah. Satu modul = 5 pelajaran + tes modul.

**Tujuh aturan „tidak lompat-lompat“** (dari dokumen pemilik): satu jalur berurutan; prasyarat eksplisit; tiga gerbang
nilai (kuis pelajaran ≥ 80 %, tes modul ≥ 75 %, tes jenjang ≥ 70 % dan tiap keterampilan ≥ 60 %); kosakata „i+1“; tata
bahasa berjenjang; satu kode satu sumber kebenaran; tes penempatan sekali lalu gerbang berlaku (mode *Ulas* membuka materi
lama tanpa mengubah progres).

**Sepuluh langkah pelajaran** (urutan tetap): 1 tujuan → 2 adegan/dialog → 3 teks & audio (pembaca: bahasa asli ⇄ +Indonesia)
→ 4 kosakata + kartu → 5 tata bahasa (penjelasan Indonesia) → 6 latihan terbimbing → 7 lafal + menirukan (shadowing)
→ 8 latihan mandiri (dengar · baca · tulis) → 9 kuis (gerbang ≥ 80 %) → 10 rekap + kosakata masuk antrean ulang harian.

---

## 3. Harga, promo dan pembayaran

| Paket (per tahun) | 1 bahasa | 2 bahasa | 3 bahasa |
|---|---|---|---|
| Umum | Rp500.000 | Rp1.000.000 *(turunan: 2 × harga satuan)* | **Rp1.300.000** |
| Promo pelajar (sampai kelas 12 / 3 SMK sederajat; surat keterangan pelajar terbaru) | Rp350.000 | Rp700.000 *(turunan)* | **Rp1.000.000** |
| Promo juara kelas (juara 1, 2, 3; bukti juara kelas tahun berjalan saat mendaftar) | Rp200.000 | Rp400.000 *(turunan)* | **Rp500.000** |

- TOEFL dan IELTS **termasuk** paket Bahasa Inggris. Harga 2 bahasa tidak disebut pemilik; dipakai 2 × harga satuan dan bisa
  diubah di Admin → Harga & promo.
- **Pembayaran:** transfer ke rekening **SeaBank a.n. Yusron Efendi**. Nomor rekening hanya tampil kepada member yang
  sudah masuk, di halaman tagihannya (tidak di halaman publik), dan bisa diubah di Admin → Rekening.
- **Alur:** daftar → pilih bahasa + kategori harga → tagihan dibuat (nomor `LJ-…`) → transfer → **unggah bukti bayar**
  (dan surat keterangan pelajar / bukti juara bila memakai promo) → admin memeriksa → *disetujui* (masa aktif 365 hari
  dimulai) atau *ditolak dengan alasan* (member bisa mengunggah ulang). Manfaat member **tidak terbuka** sebelum disetujui.
- Bukti bayar dan dokumen promo disimpan **privat** di R2; hanya member pemilik dan admin yang bisa membukanya.
- Promo diperiksa manusia (admin), berlaku satu tahun; perpanjangan tahun berikutnya memerlukan bukti baru.

---

## 4. Sumber konten: apa yang boleh diserap

Luaja.com **komersial** (langganan + iklan), jadi mengikuti aturan zona di dokumen pemilik:

| Zona | Lisensi | Perlakuan di luaja.com |
|---|---|---|
| A | Orisinal Luaja (naskah pelajaran, dialog, soal, penjelasan) | Tulang punggung semua jenjang |
| B | Domain publik · CC0 · CC BY | Diserap, dibacakan, diterjemahkan; atribusi di halaman buku dan `/kredit` |
| C | CC BY-SA | Diserap terpisah dengan lencana; turunannya (terjemahan Indonesia) tetap CC BY-SA |
| D | CC BY-NC / BY-NC-SA | **Tidak dipakai** (situs komersial) |
| X | Hak cipta penuh, ND, „gratis tapi tanpa lisensi terbuka“, repositori tanpa LICENSE | **Hanya tautan atau sematan resmi** — tidak disalin, tidak ditranskrip, tidak diterjemahkan |

**Media (audio/video) — empat rute:** L1 terbuka (CC BY / BY-SA / CC0 / domain publik, diverifikasi di sumber asli) dan L4
orisinal → transkrip penuh, terjemahan, **setiap kata menjadi kosakata**. L2 kemitraan (izin tertulis) → sesuai kontrak.
**L3 sematan** (YouTube standar, DW, Goethe, Easy German …) → hanya pemutar resmi + *kata kunci buatan editor* (≤ 20 per
video, tanpa mengutip kalimat). Ketentuan YouTube melarang mengunduh atau mengikis konten; label „Creative Commons“ pada
unggahan ulang tidak cukup.

**Domain publik di Indonesia:** seumur hidup pencipta + 70 tahun (UU 28/2014). Penulis **dan** penerjemah harus wafat ≥ 71
tahun sebelum tahun berjalan; judul yang tidak lolos tidak diimpor.

**Sumber pustaka yang dipakai mesin impor** (semua diambil dari repositori resmi/cermin di GitHub atau katalog resminya):

| Sumber | Bahasa | Lisensi | Ukuran (perkiraan; angka pasti dicatat saat impor) |
|---|---|---|---|
| Standard Ebooks | Inggris | CC0 (teks domain publik) | ± 1.300 judul tersunting rapi |
| Project Gutenberg (katalog resmi + cermin) | Inggris, Jerman, sedikit Jepang | Domain publik AS (disaring lagi dengan aturan Indonesia) | ± 76.000 judul semua bahasa; mayoritas Inggris, ± 2.000-an Jerman |
| Aozora Bunko | Jepang | Domain publik Jepang (disaring lagi dengan aturan Indonesia) | ± 17.000 karya |
| Book Dash, StoryWeaver, Global Digital Library | Inggris (+ lain) | CC BY | Ribuan buku bergambar tingkat pemula |
| Wikibooks, Wikisource, Wikipedia | Ketiganya | CC BY-SA (Zona C) | Buku teks dan bacaan bidang ilmu |
| Tatoeba (kalimat), Wiktionary, JMdict/KANJIDIC | Ketiganya | CC BY / CC BY-SA | Kalimat contoh dan kamus |
| LibriVox, Spoken Wikipedia, MLS | Inggris, Jerman | Domain publik / CC BY(-SA) | Audiobuku dan audio selaras teks |

**Kejujuran soal „ratusan ribu buku per bahasa“:** buku pelajaran bahasa yang *benar-benar bebas diserap* tidak sebanyak
itu. Yang bisa dicapai secara sah: Inggris puluhan ribu judul (Gutenberg + Standard Ebooks; jutaan lagi bila pindaian
domain publik Internet Archive ditambahkan pada fase lanjut), Jepang belasan ribu (Aozora), Jerman ribuan. Angka di
halaman pustaka selalu angka nyata hasil impor, bukan klaim. Kekurangan di jenjang pemula ditutup dengan **konten
orisinal** (Zona A), bukan dengan menyalin buku berhak cipta (Hueber, Klett, Cornelsen, Cambridge, Minna no Nihongo …).

---

## 5. Peta situs dan standar setiap menu

### 5.1 Halaman publik (terindeks, memuat AdSense)

| Menu / halaman | Isi | Standar keberhasilan |
|---|---|---|
| Beranda `/` | Hero hidup (logo beranimasi, sapaan berganti tiga bahasa yang bisa didengar), pemilih bahasa, tangga jenjang, „coba sekarang“ (mini-latihan langsung di beranda), cara kerja, pustaka & video, harga + promo, FAQ | LCP ≤ 2,5 dtk di HP; tidak ada pergeseran tata letak; mini-latihan bekerja tanpa masuk; semua teks bisa diubah dari admin |
| Jalur bahasa `/jerman` `/inggris` `/jepang` | Tangga jenjang, modul tiap jenjang, pelajaran contoh gratis, pustaka dan video bahasa itu | Setiap jenjang punya halaman sendiri dengan daftar modul, tujuan (*can-do*) dan estimasi jam |
| Jenjang `/jerman/a1` … | Modul → pelajaran (terkunci berurutan), kosakata jenjang, tes jenjang | Status kunci benar per member; pelajaran pertama tiap jenjang terbuka gratis |
| Pelajaran `/belajar/<kode>` | Pemutar 10 langkah | Lihat §6.1 |
| TOEFL `/toefl` · IELTS `/ielts` | Peta ujian, strategi per bagian, latihan, simulasi | Setiap bagian punya latihan interaktif dan penjelasan Indonesia |
| Pustaka `/pustaka` | Rak per bahasa → jenjang → kategori; cari; halaman buku | Setiap buku: sampul, penulis, lisensi/sumber, jenjang, tombol *Baca & dengarkan* |
| Pembaca `/buku/<id>` | Teks per bab, dibacakan, terjemahan per kalimat, ketuk kata | Lihat §6.2 |
| Video `/video` | Pustaka video per bahasa dan jenjang | Lihat §6.3 |
| Kosakata `/kosakata/<bahasa>/<jenjang>` | Daftar kata bertema dengan audio, arti, contoh | Setiap kata bisa didengar dan dilatih |
| Panduan `/panduan` | Artikel orisinal berbahasa Indonesia (cara belajar, ujian, kuliah/kerja di Jerman & Jepang, beasiswa) | ≥ 1.200 kata, sumber resmi, tanggal revisi; tidak ada artikel tipis |
| Harga `/harga` | Tabel paket + promo + cara bayar + FAQ pembayaran | Harga sama persis dengan Admin → Harga; nomor rekening **tidak** tampil di sini |
| Tentang · Kontak · Privasi · Ketentuan · Kredit & lisensi | Halaman wajib; `/kredit` memuat daftar sumber dan lisensi tiap koleksi | Lengkap, jujur (menyebut bantuan AI dan sumber), tertaut dari kaki halaman |

### 5.2 Portal member `/portal` (tidak terindeks, tanpa iklan)

| Menu | Isi | Standar keberhasilan |
|---|---|---|
| Daftar · Masuk · Lupa sandi | Formulir ringkas; sandi di-hash PBKDF2; batas percobaan | Pesan galat jelas; tidak membocorkan apakah e-mail terdaftar |
| Beranda portal | Lanjutkan belajar, progres per bahasa, runtun harian, kosakata jatuh tempo, status langganan | Satu ketukan untuk melanjutkan pelajaran terakhir |
| Paket & pembayaran | Pilih bahasa, kategori (umum / pelajar / juara kelas), ringkasan harga, rekening tujuan, **unggah bukti bayar** + dokumen promo, status (menunggu / disetujui / ditolak + alasan), riwayat | Akses belajar baru terbuka setelah admin menyetujui; unggahan ≤ 5 MB (JPG/PNG/WebP/PDF); bisa unggah ulang setelah ditolak |
| Belajar | Jalur yang dibeli; pelajaran berikutnya; ulas | Gerbang nilai berlaku; progres tersimpan di server |
| Kosakata saya | Antrean ulang berjarak (SRS), kata dari pelajaran, buku dan video | Jadwal ulang benar; bisa dilatih dengar/ketik/ucap |
| Pustaka & video saya | Terakhir dibaca/ditonton, penanda | Melanjutkan di kalimat terakhir |
| Akun | Nama, sandi, keluar dari semua perangkat | Ganti sandi meminta sandi lama |

### 5.3 Portal admin `/admin` (tersembunyi)

**Masuk:** ketuk logo **5 kali cepat** (≤ 4 detik) → jendela masuk admin; tidak ada tautan „admin“ di halaman publik. Akun
pemilik sama dengan ulyah.com / axto.io (hanya *hash* sandi di kode, pola yang sama dengan xscan.es; atau secret
`OWNER_BOOTSTRAP_*`).

| Menu | Isi | Standar keberhasilan |
|---|---|---|
| Ringkasan | Member aktif, tagihan menunggu, pendapatan bulan ini, pelajaran selesai | Angka dihitung dari log, bukan penghitung panas |
| Pembayaran | Antrean bukti bayar + dokumen promo; setujui / tolak dengan alasan | Persetujuan idempoten (dua klik tidak menggandakan masa aktif); tercatat di audit |
| Member | Cari, lihat langganan, perpanjang/bekukan, setel ulang sandi | Setiap tindakan tercatat |
| Harga & promo | Harga per kategori, masa aktif, nyalakan/matikan promo | Halaman `/harga` dan tagihan baru langsung ikut |
| Rekening | Bank, nomor, atas nama, catatan transfer | Hanya tampil kepada member yang punya tagihan |
| Konten situs | Semua teks beranda, FAQ, halaman wajib, menu, SEO per halaman | **Seluruh konten dinamis dari admin**; perubahan langsung tayang |
| Kurikulum | Modul dan pelajaran (JSON berskema), terbit/tarik | Validasi skema sebelum simpan |
| Pustaka | Sumber, impor, rak, terbit/tarik per buku, lisensi | Buku tanpa lisensi sah tidak bisa diterbitkan |
| Video | Tambah video (rute L1–L4), transkrip, kosakata kunci | Rute L3 tidak menerima transkrip |
| Panduan | Artikel SEO (Markdown) | Pratinjau, tanggal revisi |
| Pengaturan · Audit · Cadangan | AdSense nyala/mati, kontak, log audit, cadangan harian 35 hari | Cadangan bisa diunduh |

---

## 6. Mesin pembelajaran

### 6.1 Pelajaran interaktif

| Unsur | Standar |
|---|---|
| Dialog | Setiap baris: teks asli, terjemahan Indonesia (bisa disembunyikan), tombol dengar, tombol lambat 0,8× |
| Suara | Web Speech API dengan suara terbaik per bahasa (de-DE, en-GB/en-US, ja-JP); pilihan suara dan kecepatan; tanpa biaya server |
| Kosakata | Kartu bolak-balik; Jerman selalu dengan artikel + jamak dan warna gender; Jepang dengan kana + romaji + kanji |
| Jenis latihan | Pilihan ganda · isi rumpang · susun kata · jodohkan · dengar-lalu-ketik (dikte) · ucapkan (pengenal suara peramban, bila tersedia) · terjemahkan |
| Umpan balik | Langsung, dengan penjelasan berbahasa Indonesia; boleh mengulang |
| Kuis | 8 soal; dinilai **di server**; ≥ 80 % membuka pelajaran berikutnya |
| Progres | Tersimpan per member di R2; kosakata pelajaran masuk antrean ulang |
| Aksesibilitas | Bisa dipakai dengan papan ketik; target sentuh ≥ 44 px; `prefers-reduced-motion` dihormati |

### 6.2 Pembaca buku

Setiap buku di pustaka: dibacakan kalimat demi kalimat dengan sorot (suara sesuai bahasa buku), **terjemahan Indonesia per
kalimat** (ketuk kalimat), **ketuk kata** → arti + tambah ke *Kosakata saya*, mode dua bahasa berdampingan, ukuran huruf,
tema terang/gelap, lanjut otomatis ke bab berikutnya. Terjemahan mesin dibuat sekali lalu disimpan di R2 (tidak dihitung
ulang); terjemahan pelajaran inti ditulis tangan.

### 6.3 Video dan mesin kosakata

Setiap video punya halaman dengan pemutar dan **teks di bawahnya**:

| Rute | Yang tampil di bawah video |
|---|---|
| L1 terbuka / L4 orisinal | Transkrip penuh ber-waktu: kalimat aktif tersorot, ketuk kalimat untuk melompat; setiap kata bisa diketuk (arti, dengar, simpan); latihan per **kata** (dengar-ketik, ucap) dan per **kalimat** (menirukan, dikte, susun kata) |
| L3 sematan (YouTube standar) | Pemutar resmi + ≤ 20 kata kunci buatan editor dengan arti, contoh orisinal dan latihan; **tanpa** transkrip salinan |

---

## 7. Arsitektur

| Bagian | Pilihan |
|---|---|
| Runtime | Cloudflare Workers + Hono (TypeScript), aset statis di `public/` |
| Data | **R2 saja**: `luaja-data` (dokumen, indeks, log, unggahan privat), `luaja-media` (sampul, aset publik), `luaja-backups` (35 hari). Pola R2 Store: satu JSON per dokumen, *create-once* untuk keunikan, *compare-and-swap*, indeks dengan `customMetadata`, log hanya-tambah, tanpa kunci panas |
| KV | Hanya penghitung batas laju |
| Sesi | Cookie `__Host-` bertanda tangan HMAC; versi sesi di dokumen user |
| Terjemahan | Workers AI (m2m100) bila tersedia, cadangan MyMemory; hasil disimpan di R2 per kalimat; dibatasi per member |
| Impor pustaka | Skrip Node di GitHub Actions (katalog besar) + impor malas saat buku pertama dibuka; setiap judul melewati saringan lisensi |
| Deploy | `deploy-luaja.yml`: bucket + KV dibuat sendiri, `SESSION_SECRET` acak sekali, domain `luaja.com` dipasang begitu zonanya aktif; sebelum itu `workers.dev` (noindex) |
| Keamanan | CSP ketat, unggahan divalidasi jenis + ukuran, berkas privat lewat rute ber-otorisasi, batas laju masuk/daftar/unggah, audit log |

---

## 8. Desain

- **Super premium:** kaca berlapis di atas langit biru-malam berbintang, emas sebagai aksen tindakan, kartu berbayang lembut,
  tipografi besar; setiap bagian punya gerak yang *membantu* (bukan hiasan kosong).
- **Interaktif di mana-mana:** hero mengikuti kursor, kartu bahasa berbalik menampilkan contoh kalimat yang bisa didengar,
  tangga jenjang yang bisa dijelajahi, mini-latihan langsung di beranda, harga yang menghitung sendiri saat memilih bahasa
  dan kategori, angka yang naik saat terlihat.
- **Mobile dulu:** 360 px tanpa gulir samping; navigasi bawah di portal; PWA bisa dipasang.
- **Tema terang dan gelap**, `prefers-reduced-motion`, kontras AA.

---

## 9. SEO dan niche

**Niche:** „belajar bahasa asing untuk tujuan nyata orang Indonesia“ — kuliah & Ausbildung di Jerman, kerja & magang di
Jepang (JLPT, Tokutei Ginou), beasiswa dan karier global (TOEFL/IELTS) — dengan **alat belajar gratis** sebagai pembeda
(pelajaran contoh, kosakata bersuara, pembaca buku, latihan).

| Lapisan | Standar |
|---|---|
| Struktur | Hub per bahasa → jenjang → modul → pelajaran; hub ujian; pustaka; panduan. Setiap halaman publik punya satu topik dan satu kata kunci utama |
| Kata kunci inti | belajar bahasa Jerman online · kursus bahasa Jerman A1 · belajar bahasa Jepang JLPT N5 · belajar bahasa Inggris dari nol · persiapan TOEFL · persiapan IELTS · kosakata bahasa Jerman/Jepang/Inggris · Ausbildung Jerman · kuliah di Jerman · kerja di Jepang |
| Teknis | Judul ≤ 60 karakter, deskripsi 70–160, kanonik, Open Graph + Twitter, JSON-LD (`Organization`, `WebSite` + SearchAction, `Course`, `LearningResource`, `Book`, `FAQPage`, `BreadcrumbList`, `Article`), `sitemap.xml` otomatis, `robots.txt`, `llms.txt`, RSS panduan |
| Konten | Pelajaran contoh dan daftar kosakata **terbaca tanpa JavaScript**; tidak ada halaman kosong atau duplikat; `workers.dev` dan portal `noindex` |
| Kinerja | HTML dari tepi jaringan, CSS ≤ 60 kB, JS ditunda, huruf WOFF2 swap, gambar SVG/WebP ber-ukuran |
| AdSense | Tag meta tiap akun tumpukan + satu loader (akun utama) hanya di halaman konten publik; **tidak** di portal, masuk, pembayaran, kuis; `ads.txt` dari `adsense-stack.json`; pengajuan setelah halaman terindeks |

---

## 10. Standar keberhasilan luaja.com (daftar periksa rilis)

| # | Standar | Cara diperiksa |
|---|---|---|
| 1 | Daftar → tagihan → unggah bukti → admin menyetujui → akses terbuka; ditolak → unggah ulang | Uji e2e otomatis |
| 2 | Harga dan promo persis seperti §3; promo meminta dokumen | Uji unit + e2e |
| 3 | Pelajaran berbayar, pembaca penuh dan transkrip tidak bisa dibuka tanpa langganan aktif bahasa itu | Uji e2e (akses langsung ke URL/API ditolak) |
| 4 | Bukti bayar tidak bisa dibuka member lain atau publik | Uji e2e |
| 5 | Ketuk logo 5× membuka masuk admin; tidak ada tautan admin | Uji e2e |
| 6 | Setiap pelajaran terbit lolos skema: dialog, ≥ 10 kosakata, tata bahasa, ≥ 10 latihan dari ≥ 4 jenis, kuis 8 soal | Uji unit atas semua pelajaran |
| 7 | Setiap buku terbit bisa dibacakan dan diterjemahkan; lisensi tercantum | Uji unit + e2e dengan mesin suara tiruan |
| 8 | Halaman publik: judul, deskripsi, kanonik, JSON-LD sah, ada di sitemap | Uji unit SEO |
| 9 | Tidak ada galat konsol; 360 px dan 1280 px tanpa gulir samping | Playwright |
| 10 | `ads.txt`, tag meta dan satu loader sama dengan `adsense-stack.json`; portal tanpa loader | Uji unit + uji asap deploy |
| 11 | Semua data di R2; tidak ada D1; tidak ada rahasia di repo | Tinjauan kode + uji |
| 12 | `tsc --noEmit`, uji unit, e2e, CodeQL hijau sebelum merge | CI |

---

## 11. Fase kerja dan status

| Fase | Isi | Status |
|---|---|---|
| L1 | Fondasi: Worker + R2, desain, logo hidup, beranda, hub bahasa/jenjang, mesin pelajaran, **Modul 1 tiap bahasa** (15 pelajaran orisinal), orientasi TOEFL & IELTS, pembaca buku + pustaka awal dari sumber terverifikasi, mesin video/kosakata, portal member (paket, promo, unggah bukti), portal admin, SEO, AdSense tumpuk, PWA, uji, deploy | 🔄 |
| L2 | Katalog besar (Gutenberg + Aozora + Standard Ebooks lengkap, lewat GitHub Actions), rak dan kategori; A1 / Beginner / N5 lengkap; tes penempatan dan tes modul | ⏳ |
| L3 | A2–B1 / Elementary–Intermediate / N4–N3; bank soal TOEFL/IELTS; audio selaras (LibriVox, Spoken Wikipedia); panduan SEO 30+ | ⏳ |
| L4 | B2–C2 / Upper-Intermediate–Proficiency / N2–N1; jalur bidang ilmu; AI Language Tutor (dengan batas biaya); versi antarmuka Inggris | ⏳ |

---

## 12. Rancangan aplikasi lain (hanya dicatat — dikerjakan setelah luaja.com)

Urutan pemilik: **luaja.com → xscan.es → jenius.es → ascan.es → axto.io → xaa.es**, lalu situs artikel.

### 12.1 Standar bersama semua aplikasi

| Bidang | Standar |
|---|---|
| CSS | Super premium tingkat enterprise, huruf berkarakter (bukan huruf bawaan), setiap bagian interaktif, tanpa galat tata letak di 360–1440 px, tema terang/gelap |
| Konten | **Seluruh konten dinamis dari portal admin** (teks, menu, harga, FAQ, SEO per halaman) |
| Admin | Masuk lewat **5× ketuk logo**; akun pemilik yang sama di semua aplikasi; tidak ada tautan admin publik |
| Data & rahasia | R2 saja; tidak ada kredensial di repo, bundel klien, log, atau prompt AI |
| SEO | Judul/deskripsi/kanonik per halaman, JSON-LD, sitemap, kinerja inti web hijau, konten untuk manusia dulu |
| Mutu | Tanpa bug yang diketahui saat rilis; uji unit + e2e + peramban nyata; CI hijau |

### 12.2 xscan.es (AI Content Analyzer) — setelah luaja.com

| Menu | Rancangan / standar |
|---|---|
| Beranda | Dirombak: hero interaktif dengan **demo analisis langsung**, perbandingan sebelum/sesudah, kemampuan mesin ditunjukkan dengan contoh nyata, harga, bukti sosial yang jujur |
| Member: Periksa · Laporan · Sesi · Token · Kuota · Pengaturan | Tetap; tampilan disamakan dengan sistem desain baru |
| **Studio situs (VIP)** | Member VIP menghubungkan **repositori GitHub** miliknya (GitHub App / OAuth, izin hanya pada repo yang dipilih) dan mengubah situsnya lewat **obrolan bergaya Claude**: pilihan model AI, lampiran, riwayat, pratinjau *diff*, perubahan dikirim sebagai *pull request* — tidak pernah langsung ke cabang utama tanpa persetujuan member |
| Admin: Anggota · Audit · Benchmark · Biaya · Cadangan · Harga · Kendali · Keuangan · Kunci API · Kuota gratis · Kurs · Laporan · Mesin · Panduan | Tetap; ditambah Konten situs (semua teks publik) dan pengaturan Studio (model yang diizinkan, batas biaya per member) |

### 12.3 ascan.es

Mesin yang sama dengan xscan.es, **tampilan berbeda** dan **multibahasa seperti axto.io**; data terpisah (bucket sendiri);
mewarisi Studio situs + obrolan pilihan model.

### 12.4 jenius.es — dirombak menjadi perpustakaan gratis

| Bidang | Rancangan |
|---|---|
| Arah | **Perpustakaan gratis** buku pelajaran **TK sampai perguruan tinggi, semua bidang** — buku utuh, bukan modul |
| Portal | **Hanya portal admin**; portal guru dan member dihapus |
| Koleksi | Dari sumber yang bebas diserap (buku sekolah elektronik pemerintah berlisensi terbuka, OpenStax, Open Textbook Library, Wikibooks, domain publik); target ratusan ribu judul lewat katalog bersumber sah; setiap buku berkategori jenjang → mata pelajaran → kelas |
| Tampilan | CSS diperbaiki total mengikuti §12.1 |

### 12.5 axto.io dan xaa.es

CSS dan interaksi dinaikkan ke standar §12.1; seluruh konten publik dinamis dari admin; menu mengikuti
`docs/BUSINESS-MASTER-BLUEPRINT.md` di repo guardian-ai (portal member, admin, paket, afiliasi/reseller/white label yang bisa
ditampilkan atau disembunyikan).

### 12.6 Situs artikel („konten tanpa manfaat“)

Dikerjakan setelah luaja.com dan jenius.es. Rekomendasi: **bukan** menambah 30 artikel Inggris per situs secara massal dan
bukan terjemahan mesin, melainkan resep yang sudah terbukti di `docs/ADSENSE-BLUEPRINT.md` §22/§30 (alat interaktif, sumber
resmi, tanggal revisi, klaim jujur) + edisi Inggris tulisan tangan per situs (§29). Status: xko.es, velnixo.de, dawo.es
sudah live; qkb.es dan dai.lat selesai dan menunggu giliran rilis.
