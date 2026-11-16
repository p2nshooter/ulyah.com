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
| 15 Nov 2026 | „Website ini menggunakan 3 bahasa, jika ip mendeteksi berasal dr indonesia, gunakan bhs Indonesia, jika … Jepang gunakan bahasa Jepang defolt nya, di luar itu gunakan bahasa Inggris, dan bisa d rubah manual dengan konsisten, jgn gunakan autotranslate, wajib di translate manual“ | ✅ §5.4: halaman publik `/`, `/en/…`, `/ja/…` + hreflang & sitemap tiga bahasa; kunjungan pertama ID→Indonesia, JP→Jepang, lainnya→Inggris; pilihan manual (ID · EN · 日本語) tersimpan di cookie **dan akun**, selalu menang; perayap tidak dialihkan; ±470 teks antarmuka ditulis manual tiga bahasa (`src/lib/i18n.ts`, uji kelengkapan); harga tampil IDR/USD/JPY sesuai bahasa |
| 15 Nov 2026 | „pastikan pembayaran menggunakan idr, yen dan USD serta PayPal untuk otomatis, buatkan invoice setiap pembayaran, dan untk PayPal buatkan webhook nya, jika sudah melakukan pembayaran langsung otomatis terbuka layananya, lihat rekening dari situs ulyah.com BNI dan panduanya jika TF dr luar negeri selain bisa menggunakan seabank. untuk PayPal admin input manual di portal admin, pastikan bisa live dan sanbox“ | ✅ harga & tagihan IDR/USD/JPY, PayPal Orders v2 + webhook terverifikasi (langganan aktif otomatis), invoice/kuitansi setiap tagihan, BNI multimata uang + panduan SWIFT, Admin → PayPal (live & sandbox, secret disegel MASTER_KEY di R2) |
| 15 Nov 2026 | Pemilik mengirim kredensial PayPal live & sandbox: „masukan ke R2 dan di encryption … Aktifkan LIVE jika sudah 100% siap“ | 🔄 kredensial tidak pernah ditulis ke repo/log; diisi lewat Admin → PayPal (disegel di R2). LIVE hanya bisa disimpan bila uji koneksi live berhasil |
| 15 Nov 2026 | „Jika selesai focus pada penyempurnaan dan kelengkapan belajar, baca ulang blueprint nya, agar betul2 kumplit setiap bahasa dan jenjang“ | ⏳ §2, §6, §11: setiap jenjang ketiga bahasa diisi modul, pelajaran dan paket latihan sampai lengkap (dikerjakan bertahap per jenjang setelah pembayaran & tiga bahasa) |
| 15 Nov 2026 | „Rekening termasuk PayPal wajib bisa di crud dr portal admin, dan masukan pembayaran international lainya tp di hide, hanya jika di input baru live.. Karena suatu saat bisa jadi bisnis ini sy jual“ · „Seperti stripe dll“ · „Xendit, midtrans dll“ | ✅ Admin → **Metode bayar** (tambah/ubah/hapus/urutkan rekening & layanan: bank, SWIFT, Wise, Payoneer, Revolut, Skrill, lainnya), Admin → **PayPal** (+ hapus kredensial), Admin → **Gerbang otomatis**: **Stripe, Xendit, Midtrans** — semuanya tersembunyi sampai data/kunci diisi dan diaktifkan; kunci disegel di R2; tidak ada rekening atau kunci yang wajib ada di kode (§3.1) |
| 15 Nov 2026 | „Karena ini menggunakan 3 bahasa, penutur bahasanya jg mengikuti bahasa yg d pilih atau yg otomatis terpilih karena IP negara“ | 🔄 antarmuka, portal, pembayaran, invoice, pesan latihan/kuis dan suara antarmuka mengikuti bahasa terpilih; ⏳ penjelasan, terjemahan dan pembahasan di **dalam** pelajaran & bank soal masih bahasa Indonesia — diterjemahkan manual ke Inggris & Jepang (lalu dibacakan dengan suara bahasa terpilih) sebagai PR berikutnya; sampai itu halaman EN/JA menampilkan catatan jujur |
| 15 Nov 2026 | „Masih banyak yg belum di kerjakan, tolong kerjakan dengan teliti, profesional, hati2 tapi kerjakan secara cepat tanpa agen … Cek ulang penggunaan kata2 di seluruh website ini agar seluruhnya sesuai tanpa miss informasi“ | ✅ salinan diperiksa ulang: klaim yang belum ada dihapus/ditandai „terbit bertahap“ (bukan „A1–C2 lengkap“, bukan „rekam & bandingkan“, bukan „TOEFL iBT Speaking/Writing“), audio disebut jujur sebagai mesin suara perangkat, jumlah pelajaran & soal dihitung otomatis, urutan „lulus kuis ≥ 80 % membuka pelajaran berikutnya“ kini **benar-benar ditegakkan** di server, FAQ menjelaskan materi yang sudah tersedia |
| 15 Nov 2026 | „Domain luaja.com masih blm bisa ke buka“ | ✅ record lama (A → parkir Namecheap, CNAME www → parkingpage.namecheap.com, diproksi) menghalangi custom domain (100117); deploy kini memasang **Worker route** `luaja.com/*` & `www.luaja.com/*` di record itu tanpa menghapus DNS — luaja.com menjawab dari Worker sejak 15 Nov 19:35 UTC (`scripts/cf-attach.sh`) |
| 15 Nov 2026 | „Lu baca panduan blueprint klo sudah hampir hilang ingatan untuk nyempurnain pembelajaran member, baik dr buku, voice, audio, KAMus dll, cari sumber dr github atau situs manapun, klo yg lu dpt PDF urai text nya dan jadikan lebih interaktif di portal member, pastikan admin punya link portal member full akses untuk admin sendiri menikmati layanan member... Jgn lupa film2 dr youtube dan situs manapun dll untuk menunjang pembelajaran member“ | ✅ admin: tautan „Portal member (akses penuh)“ di panel & kepala situs, semua materi terbuka untuk pengelola · ⏳ §4, §6.2–§6.4: pustaka interaktif (PDF/teks diurai jadi bacaan interaktif, tanpa unduhan), suara/audio, kamus, film/video (sematan resmi + kosakata) dari sumber berlisensi sah |
| 15 Nov 2026 | „Masih blm kumplit, g ada buku pelajaran yg sy minta setiap jenjang, bank soal juga bukan simulasi total soal saat mengambil sertifikat“ · „Lu cari dulu buku digitalnya, contoh soal latihan yg simulasi real setiap jenjang yg di ambil dari github, google dan dr situs manapun, lu cari listening, video, dll“ | 🔄 sumber terbuka diriset & diimpor (§4.1, §6.2); simulasi ujian penuh §6.5 |
| 16 Nov 2026 | „Tarik semua datanya, klo bentuk PDF lu urai kata2nya, ubah bentuk nya supaya enak di pelajarin di portal member, ubah warna CSS make yg terang tp indah aja, jgn gelap begitu“ | ✅ pustaka: **128 buku · 14.470 halaman · 2.332 soal berkunci · 1.127 audio/video · 11.430 kosakata · 32.577 kalimat ber-terjemahan Indonesia** (Grimm Grammar, Deutsch im Blick + 10 buku kerja PDF diurai, Tatoeba, Project Gutenberg, Aozora Bunko berfurigana, kosakata & kanji JLPT N5–N1, VOA Word Book + Let's Learn English) di pembaca interaktif `/pustaka` → `/baca/<id>`; ✅ tampilan **terang** (tanpa mode gelap otomatis, kepala halaman & kaki situs terang, suasana otomatis selalu siang cerah) |
| 16 Nov 2026 | „Klo ga lu bikinin bukunya, covernya daftar isi, minimal 50 halaman dan minimal 20 buku per jenjang, lu pelajarin dulu bagaimana panduan bertingkatnya, isinya apa aja setiap jenjang, dan lu bikinin simulasi soalnya, mulai dari total soal dll sampai penilaian dan kebijakan yang sesuai blueprint“ | ⏳ §6.4 — dikerjakan **setelah** sumber terbuka habis diserap (perintah berikut) |
| 16 Nov 2026 | „Bikin puluhan simulasi soal, satu simulasi wajib sesuai dengan total soal yg bakal di hadapi setiap siswa untuk mendapatkan sertifikat jenjang resminya“ | ⏳ §6.5 (jumlah soal, waktu, bagian, penilaian & batas lulus resmi tiap ujian) |
| 16 Nov 2026 | „Level nya yg jelas, contoh Jerman A1, A2, B1, B2, C1, C2 beserta bukunya, audio, video, Simulasi Bank Soal yg real bakal di hadapi ketika mengambil sertifikat resminya“ | ✅ halaman setiap jenjang memuat buku, audio & video jenjang itu (Jerman A1–C2 kini semuanya berisi buku) · ⏳ simulasi ujian penuh per sertifikat §6.5 |
| 16 Nov 2026 | „Luaja.com harus bisa di instal di HP, dan jika sudah d install halus tanda install nya, muncul lg klo yg di HP di hapus“ | ✅ PWA: manifest (`id`, ikon 192/512 maskable, standalone, pintasan Pustaka/Latihan/Portal, `related_applications` diri sendiri), service worker; tombol „Pasang aplikasi“ di kepala + spanduk di HP tampil **hanya** saat peramban menawarkan pemasangan, **hilang** setelah terpasang (event `appinstalled`, mode standalone, `getInstalledRelatedApps`), **muncul lagi** bila aplikasi dihapus (peramban kembali mengirim `beforeinstallprompt`); iPhone/iPad: panduan „Tambah ke Layar Utama“; tombol „Nanti“ menunda 7 hari · koreksi pemilik: „Kalimatnya jgn di HP anda, tp di perangkat anda“ → „Pasang LUAJA di perangkat Anda“ |
| 16 Nov 2026 | „Kerjain dulu hasil yg lu download, cari dulu sebanyak mungkin dari sumber2 buku terbuka dan contoh2 soal, klo itu sudah selesai baru yg lu bikin“ | ✅ urutan kerja: (1) impor sumber terbuka sebanyak mungkin, (2) baru buku & simulasi buatan LUAJA |
| 16 Nov 2026 | „Lu wajib inget satu hal, bikin yg interaktif, menyenangkan dan siswa betah lama2 belajar“ | ✅ aturan tetap desain (§8): setiap halaman belajar punya interaksi (dengar, ketuk kata, uji diri, kartu hafalan, latihan langsung dinilai), umpan balik positif, XP & runtun harian |
| 16 Nov 2026 | (Foto halaman buku) „Ini ga perlu ada kata2 kaya gini, ini rahasia perusahaan, jgn bongkar rahasia perusahaan“ | ✅ teks „tentang buku“ & catatan simulasi tidak lagi menyebut cara pembuatan (PDF diurai, data dibangkitkan, dsb.) — hanya manfaat bagi pelajar; atribusi lisensi tetap di bagian Sumber & lisensi |
| 16 Nov 2026 | „mana terjemahan bahasa Indonesia nya, atau bhs inggris atau bhs Jepang tergantung pelajar memilih bahasa induk website nya … jelaskan seluruh pelajaran menggunakan bahasa induk website yg di pilih … Kamus bukan di lempar ke website wiki tapi website ini wajib punya kamus besar kumplit 3 bahasa … langsung di tampilkan arti dari kata yg di pilih … larikan ke kamus nya agar lebih banyak arti … Ambil kamus besar 3 bahasa itu dari sumber manapun dan serap“ | ⏳ §6.6 kamus LUAJA (Jerman/Inggris/Jepang → Indonesia/Inggris/Jepang) dari data berlisensi terbuka; ketuk kata → arti langsung dalam bahasa antarmuka + tautan ke `/kamus/<kata>`; penjelasan pelajaran mengikuti bahasa antarmuka |
| 16 Nov 2026 | „Mana ada ujian resmi IELTS dan TOEFL cuma 15 soal... Bikin semua soal totalnya realistis sesuai dengan yg akan di hadapi siswa“ | 🔄 paket 15 soal kini berlabel **Latihan per bagian** (bukan simulasi); **Simulasi ujian resmi** berjumlah soal persis: JLPT N5 20 simulasi × 67 soal ✅; Goethe A1 (15+15+Schreiben+Sprechen) ⏳; TOEFL ITP 140 soal (50/40/50) & IELTS Academic (L40 · R40 · W2 · S3) ⏳ |
| 16 Nov 2026 | „Catat semua ini, Pelajari link2 ini … Seperti inilah yg lu bikin, lu pelajarin, masukin ke blueprint setiap link yg lu pelajarin, serap seluruh datanya dan masukin jadi media pembelajaran“ (IDP IELTS, parroto, englishversity, 8 repositori GitHub, topik b1) | ✅ dipelajari & dicatat §4.2; yang berlisensi terbuka diserap, yang tidak hanya dijadikan rujukan fitur |
| 16 Nov 2026 | „Ga ada logout nya lg, bikin portal admin dan member yg elegan, indah, estetik, nyaman di pake“ | ✅ menu akun di kepala situs (avatar → Portal · Pustaka · Akun · Panel pengelola · **Keluar**); portal: kartu profil, navigasi berikon, **bilah bawah di HP**, tombol Keluar selalu terlihat; panel pengelola: bilah atas terang dengan **Keluar**, tab berbentuk pil |

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
  sudah masuk, di halaman tagihannya (tidak di halaman publik), dan bisa diubah di Admin → Metode bayar.
- **Alur:** daftar → pilih bahasa + kategori harga → tagihan dibuat (nomor `LJ-…`) → transfer → **unggah bukti bayar**
  (dan surat keterangan pelajar / bukti juara bila memakai promo) → admin memeriksa → *disetujui* (masa aktif 365 hari
  dimulai) atau *ditolak dengan alasan* (member bisa mengunggah ulang). Manfaat member **tidak terbuka** sebelum disetujui.
- Bukti bayar dan dokumen promo disimpan **privat** di R2; hanya member pemilik dan admin yang bisa membukanya.

### 3.1 Metode pembayaran (semua dikelola dari admin — siap berpindah pemilik)

| Jenis | Isi | Kapan tampil kepada member |
|---|---|---|
| Transfer manual | Daftar **Metode bayar** di admin: bank domestik, bank internasional (SWIFT), Wise, Payoneer, Revolut, Skrill, lainnya — masing-masing dengan mata uang yang dilayani, nomor/akun, atas nama, data SWIFT, petunjuk sendiri; bisa ditambah, diubah, diurutkan dan dihapus | Aktif **dan** data wajib lengkap **dan** mata uang tagihan cocok. Templat Wise/Payoneer/Revolut/Skrill tersedia tetapi tersembunyi sampai diisi |
| PayPal (otomatis) | Live & sandbox, secret disegel MASTER_KEY, webhook terverifikasi; kredensial bisa dihapus | Diaktifkan + kredensial mode aktif ada; USD/JPY |
| Stripe (otomatis) | Checkout Session; webhook `Stripe-Signature` (HMAC, toleransi 5 menit) atau didaftarkan otomatis dari admin | Diaktifkan + kunci mode aktif; mata uang pilihan (IDR/USD/JPY) |
| Xendit (otomatis) | Invoice API (VA, QRIS, e-wallet, kartu); callback diverifikasi `x-callback-token`, status dibaca ulang dari API | Diaktifkan + kunci; IDR (USD opsional) |
| Midtrans (otomatis) | Snap (GoPay, QRIS, VA, kartu); notifikasi diverifikasi `signature_key` SHA-512, status dibaca ulang dari API | Diaktifkan + server key; IDR |

- Semua kunci rahasia disegel (AES-GCM, MASTER_KEY) di R2 dan tidak pernah ditampilkan ulang. Mode LIVE hanya tersimpan bila
  uji koneksi live berhasil; bila gagal, kembali ke mode uji.
- Pelunasan otomatis hanya bila status lunas **dan** id tagihan, mata uang serta nominal cocok; idempoten (kembali-dari-gerbang
  dan webhook boleh datang bersamaan). Mata uang tanpa satu pun cara bayar yang tayang tidak ditawarkan di halaman paket.
- Rekening dan nomor di kode hanya **nilai awal**; begitu disimpan dari admin, dokumen R2 yang berlaku. Dokumen versi pertama
  (SeaBank + BNI) diubah otomatis ke daftar metode.
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

### 4.1 Sumber yang sudah diimpor (angka nyata dari `luaja/scripts/pustaka/build.py`)

| Sumber | Lisensi | Isi di LUAJA | Jenjang |
|---|---|---|---|
| Grimm Grammar (COERLL, UT Austin) | CC BY 4.0 | 3 buku tata bahasa Jerman (A1, A2, B1): ±90 topik, contoh bersuara penutur asli, **1.002 latihan isian & pilihan ganda** dari kunci jawaban resminya | A1–B1 |
| Deutsch im Blick (COERLL, UT Austin) | CC BY 4.0 | Kosakata 10 bab (audio penutur asli per bagian), 268 video asli, 10 buku kerja PDF yang diurai per halaman | A1–A2 |
| Tatoeba | CC BY 2.0 FR | 31.583 kalimat Jerman/Inggris/Jepang ↔ Indonesia, 4 tingkat panjang kalimat, tautan ke kalimat asli | semua |
| Project Gutenberg | Domain publik (penulis wafat ≤ 1955) | 49 buku bacaan & tata bahasa: Jerman A1–C2 (Guerber, Spyri, Storm, Heyse, Kafka, Eichendorff, Hauff, Grimm, Fontane, Thomas Mann, Heine, Goethe, Schiller, Wustmann), Inggris Beginner–Proficiency (McGuffey Primer–Sixth Reader, Potter, Aesop, Baum, Carroll, Kipling, Doyle, London, Stevenson, Dickens, Austen, Wilde, Reed & Kellogg, Kittredge) | semua |
| Aozora Bunko | Domain publik | 13 karya berfurigana asli (Niimi Nankichi, Miyazawa Kenji, Akutagawa, Dazai, Natsume Sōseki) | N3–N1 |
| JLPT: daftar Jonathan Waller + JMdict, KANJIDIC2 + Kanji alive | CC BY / CC BY-SA 4.0 / CC BY 4.0 | Kosakata JLPT N5–N1 (bacaan, arti, contoh kalimat Tatoeba ber-terjemahan Indonesia) dan kanji N5–N1 (arti, on/kun, goresan, contoh kata, kuis per halaman) | N5–N1 |
| VOA Learning English | Domain publik (karya Pemerintah AS) | Word Book (±1.500 kata inti + definisi sederhana), Let's Learn English Level 1 (52 pelajaran video + audio) dan Level 2 (7 pelajaran pertama; sisanya menyusul) | Beginner–Elementary |

Antrean berikutnya: VOA Let's Learn English Level 2 pelajaran 8–30 dan seri video VOA (English in a Minute, Everyday Grammar
TV, English @ the Movies, News Words), FSI/DLI Japanese (domain publik AS), Wikibooks (CC BY-SA), kamus JMdict & Wiktionary.
Setiap halaman jenjang (mis. `/jerman/a1` … `/jerman/c2`) kini menampilkan **buku jenjang itu, audio & video, dan simulasi
ujiannya** di satu tempat. Soal ujian resmi (Goethe,
JLPT, ETS, IELTS, Cambridge) hanya **ditautkan** — tidak disalin.

### 4.2 Tautan yang dipelajari (perintah pemilik 16 Nov 2026)

| Tautan | Isi | Lisensi / status hak | Keputusan |
|---|---|---|---|
| ielts.idp.com/indonesia | Situs resmi IDP: format IELTS, jadwal, contoh soal resmi | Hak cipta IDP | Rujukan format & **tautan** ke latihan resmi; tidak disalin |
| parroto.app — IELTS 600 words, set IELTS 2025 | Aplikasi komersial kosakata & set latihan | Hak cipta pemiliknya | Rujukan fitur (kosakata bertema + audio + kuis); daftar kata tidak disalin |
| englishversity.sch.id/pages/tes-toefl-gratis | Tes TOEFL gratis daring | Hak cipta pemiliknya | Rujukan alur tes (berwaktu, skor skala) |
| github.com/w17714m/TOEFL-IELTS-Study-Material | 39 PDF buku persiapan komersial (mis. *Helpful Hints for IELTS*, *Answers to All TOEFL Essay Questions*) | Tanpa lisensi; buku berhak cipta penerbit | **Tidak diserap** (zona X) |
| github.com/fg0x0/IELTS-Materials | PDF/XLSX buku kosakata & writing komersial | Tanpa lisensi; berhak cipta | **Tidak diserap** (zona X) |
| github.com/sallowayma-git/IELTS-practice | Aplikasi latihan IELTS (reading/listening berwaktu, statistik, analisis kesalahan) | Kode GPL-3.0; **soal milik pemegang hak cipta**, README melarang distribusi publik/komersial | Hanya rujukan fitur (mode set lengkap, analisis kesalahan, riwayat) |
| github.com/ZekkCode/OnlineTest-TOEFL_DPW | TOEL.id: tes TOEFL daring (Listening, Structure, Reading, Full Test), skor otomatis, riwayat, papan peringkat, sertifikat digital | Kode MIT; asal bank soal tidak dinyatakan | Rujukan fitur (papan peringkat, sertifikat latihan); soal tidak disalin |
| github.com/hatwarsanskar95-web/japanese-JLPT-learner | Kuis JLPT harian, materi PDF | Tanpa lisensi | Rujukan fitur (kuis harian) |
| github.com/kananinirav/jlptbenkyo | Tautan ke jlptbenkyo.com (kosakata, kanji, tata bahasa N5–N1) | README saja | Rujukan struktur materi per jenjang |
| github.com/abdullahbutt/wordfeather | Materi Jerman A1–C2 & ujian tiruan | **CC BY-NC 4.0** (non-komersial) | Tidak diserap (zona D); rujukan struktur A1–C2 |
| github.com/yashvikram30/german-course | *Deutsch von Anfang an*: buku A1 orisinal 13 bab (±49.000 kata), ±90 latihan, ±600 kosakata, **4 Modelltest Goethe A1 lengkap** (Hören 3 Teile + transkrip, Lesen 3 Teile, Schreiben 2 Teile, Sprechen 3 Teile) dengan penilaian resmi | **MIT** | **Diserap** dengan atribusi: buku A1 ke Pustaka + 4 simulasi Goethe A1 penuh (PR berikutnya) |
| github.com/topics/b1 | Daftar repositori bertopik B1 | — | Ditelusuri; hanya yang berlisensi terbuka yang dipertimbangkan |

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

### 5.4 Tiga bahasa antarmuka

| Unsur | Standar |
|---|---|
| URL | Indonesia `/…`, Inggris `/en/…`, Jepang `/ja/…` untuk setiap halaman publik; portal, akun, admin, API tanpa awalan (bahasanya dari pilihan tersimpan) |
| Bahasa awal | Dari kode negara Cloudflare: ID → Indonesia, JP → Jepang, lainnya → Inggris. Hanya kunjungan manusia ke halaman HTML yang dialihkan; perayap (Googlebot, AdSense, dsb.) dan API tidak |
| Pilihan manual | Pemilih ID · EN · 日本語 di kepala & kaki situs dan di Portal → Akun; disimpan di cookie dan akun, selalu menang atas negara |
| SEO | Kanonik per bahasa, `hreflang` id/en/ja + x-default, sitemap tiga bahasa dengan alternatif, judul/deskripsi per bahasa |
| Terjemahan | Manual, tidak ada terjemahan mesin. Teks antarmuka di `src/lib/i18n.ts` (uji: setiap kunci terisi tiga bahasa dengan penanda sama); salinan beranda di `SiteContent.i18n` (dapat diubah admin); halaman wajib per bahasa |
| Mata uang tampilan | Indonesia → IDR, Inggris → USD, Jepang → JPY (pembeli tetap bebas memilih di portal) |
| Isi pelajaran | Penjelasan & pembahasan saat ini bahasa Indonesia; terjemahan manual EN/JA menyusul (catatan jujur tampil di halaman EN/JA) |

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
| Metode bayar | Tambah/ubah/hapus/urutkan rekening & layanan internasional; catatan transfer; WhatsApp | Hanya tampil kepada member yang punya tagihan; yang belum lengkap tersembunyi |
| PayPal · Gerbang otomatis | PayPal, Stripe, Xendit, Midtrans: kunci live & uji, mata uang, uji koneksi, webhook, hapus kunci | Tersembunyi sampai dikonfigurasi; LIVE hanya setelah uji koneksi berhasil |
| Portal member (akses penuh) | Tautan dari panel & kepala situs | Pengelola menikmati seluruh layanan member tanpa tagihan |
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
tema terang/gelap, lanjut otomatis ke bab berikutnya.

**Sudah berjalan (16 Nov 2026):** rak per bahasa → jenjang → kategori dengan angka nyata; halaman buku (sampul, daftar isi
bernomor halaman, sumber & lisensi, JSON-LD `Book`); pembaca `/baca/<id>`: halaman berbalik (tombol, panah, geser), bacakan
seluruh halaman dengan sorot, 🔊 per paragraf/kalimat/kata, ketuk kata → dengar · simpan · kamus (Wiktionary / jisho),
**uji diri** (arti diburamkan, ketuk untuk melihat), **kartu hafalan** per kelompok kosakata, latihan isian & pilihan ganda
langsung dinilai dengan skor halaman, audio & video asli, XP (+2 halaman baru, +3 jawaban benar) dan runtun harian tersimpan
di R2 (`c/reading/<uid>.json`). Tiga halaman pertama gratis; seluruh halaman untuk member bahasa itu dan pengelola — data
`/p/b/<id>.json` selalu lewat Worker (`assets.run_worker_first`). Terjemahan mesin dibuat sekali lalu disimpan di R2 (tidak dihitung
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
- **Terang dan indah** (pemilik, 16 Nov 2026: „make yg terang tp indah aja, jgn gelap“): tidak ada mode gelap otomatis; kepala
  halaman, kaki situs dan kartu memakai warna pastel cerah; suasana otomatis selalu siang. Mode gelap hanya lewat tombol ◐.
  `prefers-reduced-motion` dihormati, kontras AA.
- **Interaktif, menyenangkan, bikin betah** (pemilik, 16 Nov 2026): setiap halaman belajar punya interaksi, umpan balik
  langsung yang positif, dan kemajuan yang terlihat (XP, runtun, progres bab).

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
