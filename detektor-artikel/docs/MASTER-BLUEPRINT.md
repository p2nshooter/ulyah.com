# xscan.es — Blueprint Induk (Master Specification)

**AI Article Detector & Competition Evaluation Platform**

Disusun 7 November 2026 dari dua file pemilik („Master_xscan“ dan „Xscan“) dan digabung dengan aplikasi yang sudah
berjalan di folder ini (`detektor-artikel/`, Worker `detektor-artikel`, domain xscan.es). Dokumen ini menggantikan
`docs/BLUEPRINT.html` (2 Nov 2026) sebagai acuan utama; isi lama yang masih berlaku dirujuk, tidak disalin ulang.

Perintah pemilik, 7 Nov 2026:

> „Untuk xscan.es pelajari 2 file itu, kembangkan dulu dengan project yg sudah ada dan catat sebagai blueprint,
> kombinasikan dengan project yg ada jadikan blue print sempurna terlebih dahulu termasuk artikel yg di butuhkan untuk
> pengajuan adsense. Kerjakan xscan.es dari blueprint jika pengerjaan pendaftaran adsense selesai di kerjakan.“

Urutan kerja: blueprint ini dulu → pekerjaan AdSense seluruh situs selesai sampai live (`docs/ADSENSE-BLUEPRINT.md`
§23 di akar repo) → membangun xscan.es fase demi fase (§17), satu fase sampai lulus uji sebelum fase berikutnya.

Tanda status: ✅ sudah ada dan teruji · 🟡 ada sebagian · ❌ belum ada · ⏳ dijadwalkan

---

## Daftar isi

1. Aturan tetap yang tidak boleh dilanggar
2. Keadaan sekarang (inventaris kode, 7 Nov 2026)
3. Peta kebutuhan pemilik → yang ada → yang dibangun
4. Kategori penulis/penerbit, jenis artikel, deteksi tambahan, tingkat keyakinan
5. Sistem laporan multi-kategori (A–I) + Competition & Contest Evaluation Report (J)
6. Modul analisis lanjutan (isi, mutu tulisan, struktur, SEO, sumber, orisinalitas)
7. Sumber masukan: teks, URL, sitemap, dokumen, massal
8. Smart AI Engine Router (model, harga terverifikasi, algoritma)
9. Dompet kredit: deposit Rupiah → kredit internal, reservasi, perlindungan saldo
10. Struktur menu: publik, member, admin
11. Peran dan hak akses
12. Kompetisi, juri, rubrik, peringkat
13. Data di R2 (pemetaan „tabel“ pemilik ke koleksi R2 — tanpa D1)
14. Keamanan, privasi, retensi
15. Uji, pemantauan, cadangan, deploy
16. Situs publik dan pengajuan AdSense: 70 artikel ID + EN
17. Tahapan pembangunan dan definisi selesai
18. Keputusan pemilik yang dibutuhkan
19. ascan.es — bisnis kembar dengan wajah, kata, dan CSS yang berbeda 100 %
20. Kuota gratis 10 halaman per minggu, anti-curang, dan iklan di area member
21. Pengetatan mesin: tidak bocor biaya, tidak melebar
22. Global: delapan bahasa, mesin multi-bahasa, bahasa bawaan menurut negara

---

## 1. Aturan tetap yang tidak boleh dilanggar

| No | Aturan | Sumber |
|---|---|---|
| 1 | **Penyimpanan hanya R2, tidak pernah D1.** Spesifikasi pemilik memakai kata „database/tabel“; di sini setiap „tabel“ menjadi koleksi R2 (§13) dengan desain R2 Store: satu objek JSON per dokumen, `If-None-Match: *` untuk nilai unik, compare-and-swap untuk perubahan, indeks dengan `customMetadata`, log append-only, tanpa kunci panas, cadangan harian 35 hari. | `CLAUDE.md` repo, 20 Okt 2026 |
| 2 | **Deteksi AI bukan bukti.** Laporan selalu menyebut tingkat keyakinan, keterbatasan metode, dan kemungkinan salah positif/negatif. Tidak pernah menulis „pasti ditulis AI“. | Master_xscan §55, Bagian 4 |
| 3 | **Tidak mengarang identitas.** Penulis, penerbit, tahun hanya diisi bila terbaca dari naskah atau metadata; selain itu „Tidak diketahui“. Hasil deteksi dibedakan dari perkiraan. | Xscan „Aturan sistem“ |
| 4 | **Plagiarisme tidak pernah dinyatakan pasti** tanpa sumber pembanding dan pemeriksaan yang memadai. | Xscan „Plagiarism & originality“ |
| 5 | **Nilai AI dalam lomba hanya rekomendasi.** Keputusan pemenang ada pada juri/penyelenggara. | Master_xscan §53, Bagian 13 |
| 6 | **Saldo tidak pernah negatif; tidak ada potongan ganda.** Reservasi atomik sebelum API dipanggil; idempotensi di setiap mutasi. | Master_xscan §51, Bagian 9–10 |
| 7 | **API dipanggil hanya bila saldo cukup.** Bila kurang: tidak ada panggilan API, tampil kekurangan dan rekomendasi deposit. | Master_xscan §51, Xscan §3 |
| 8 | **Kredit diberikan hanya setelah pembayaran terverifikasi** (webhook bertanda tangan atau persetujuan admin atas bukti transfer), tidak dari halaman redirect. | Master_xscan Bagian 16 |
| 9 | **Kunci API tidak pernah ke browser**, tidak ada di kode, log, atau prompt; tersimpan terenkripsi, diisi lewat portal admin. | Master_xscan §52 |
| 10 | **Rahasia perusahaan** (markup, modal, margin) tidak tampil ke member. | blueprint 2 Nov §Q |
| 11 | **AdSense di halaman yang berisi konten:** halaman publik (beranda, artikel, panduan, rubrik, alat) dan — sejak 7 Nov 2026 (§20.6) — halaman konten di area member gratis (ruang belajar, beranda member gratis, laporan gratis beserta panduannya). **Tidak pernah** di layar unggah, layar menunggu proses, pembayaran/isi saldo, masuk/daftar, pengaturan, error, versi cetak, admin, dan halaman member berbayar (bebas iklan). Auto ads saja; satu loader; 16 akun ditumpuk (`adsense-stack.json`). | `docs/ADSENSE-BLUEPRINT.md` §1, §23; §20 |
| 12 | **Artikel ditulis, bukan diterjemahkan mesin.** Versi Inggris setiap artikel ditulis sendiri (bukan auto-translate). Tidak ada fakta, angka, kutipan, atau studi karangan. | pemilik 7 Nov 2026 |
| 13 | **Tidak ada satu pun aturan yang memblokir crawler Google.** | pemilik 1 Nov 2026 |
| 14 | **Tanpa agent untuk menulis atau memperbaiki.** | `docs/ADSENSE-BLUEPRINT.md` §1 no. 13 |
| 15 | **Definition of Done** (Master_xscan Bagian 29): kode, data, API, izin, validasi, error handling, loading/error state, unit + integrasi + e2e lulus, cek keamanan, dokumentasi, tanpa placeholder yang tampak aktif. Bila belum: status tetap IN PROGRESS atau BLOCKED. | Master_xscan |

---

## 2. Keadaan sekarang (inventaris kode, 7 Nov 2026)

Dibaca dari kode di `detektor-artikel/src` dan uji e2e (`test/e2e.mjs`, „SEMUA LULUS“ 7 Nov 2026).

| Area | Yang sudah ada | Status |
|---|---|---|
| Situs publik | Beranda, cara kerja, akurasi, harga, contoh laporan, verifikasi laporan `/v/:kode`, kebijakan privasi, syarat, penggunaan etis; ID dan `/en`; sitemap, robots.txt (membuka semua crawler Google), `ads.txt` 16 akun | ✅ |
| Akun | Daftar, masuk, 2FA, sesi, peran `owner`/`admin`/`member`, afiliasi `/r/:code` | ✅ |
| Mesin deteksi | Pra-proses, stylometri, kemiripan, kaskade Haiku → Sonnet → Opus (`cascade.ts`), mode AUTO/Haiku/Sonnet/Opus/Forensik, fusi persen AI/Campuran/Manusia per kalimat, gerbang eskalasi | ✅ |
| Rubrik | 9 templat (lomba esai, esai umum, makalah, skripsi, berita, opini, SEO, cerpen, …) dengan kriteria terukur | ✅ |
| Laporan | Laporan layar, cetak A4/PDF dari browser, unduh HTML mandiri, unduh JSON bertanda tangan, QR + kode verifikasi, catatan member, permintaan tinjauan | ✅ |
| Lomba | Sesi massal, unggah banyak .docx/.txt, rekap peserta + peringkat, CSV | 🟡 belum ada peran juri manusia, bobot rubrik oleh penyelenggara, blind judging |
| Dompet | Token internal, reservasi → potong biaya nyata → kembalikan sisa (`wallet.ts`), deposit Rupiah → token (`deposit.ts`, jurnal operasi + pemulihan cron), buku besar, harga per mesin, prediksi halaman per mesin | ✅ |
| Pembayaran | Pesanan, bukti transfer + persetujuan admin, invoice IDR/USD | 🟡 gateway otomatis (webhook) belum |
| Admin | Anggota (aksi, deposit, kuota), harga, mesin (model per tingkat, uji), kunci API Claude (enkripsi + uji), biaya, benchmark, pesanan, pembayaran, laporan (cabut), afiliasi, audit, cadangan | ✅ |
| Penyimpanan | R2 saja (`lib/store.ts`), pembersihan otomatis 90 hari (`PURGE_DAYS`), cadangan | ✅ |
| Masukan | Teks tempel, unggah .docx/.txt/.md (diekstrak di browser) | 🟡 URL, sitemap, PDF, RTF, HTML belum |
| Artikel publik (blog) | — | ❌ (syarat AdSense, §16) |

---

## 3. Peta kebutuhan pemilik → yang ada → yang dibangun

| Kebutuhan dari file pemilik | Ada sekarang | Dibangun | Fase |
|---|---|---|---|
| 11 kategori penulis/penerbit + Unknown | ❌ | Klasifikator kategori + keyakinan + alasan + koreksi manual | X2 |
| 34 jenis artikel | 🟡 (rubrik per jenis) | Daftar lengkap §4.2, deteksi otomatis + manual, multi-kategori | X2 |
| Deteksi tambahan (topik, bahasa, gaya, tujuan, struktur, identitas, tahun, referensi) | 🟡 bahasa | Semua di §4.3 | X2–X3 |
| Laporan A–I per kategori | ❌ | Templat per kategori §5 | X3 |
| Competition & Contest Evaluation Report | 🟡 rekap | Laporan J §5.10, bukti pendukung lomba | X5 |
| Analisis lanjutan (isi, mutu, struktur, SEO, sumber, orisinalitas) | 🟡 rubrik, kesalahan bahasa | Modul §6 | X3–X4 |
| Skor lanjutan (Overall, Classification, Content, Readability, SEO, Originality, Source, Writing) | 🟡 | §6.7 | X3 |
| Ekspor PDF/TXT/DOCX/XLSX/CSV, salin, bagikan, bandingkan dua artikel | 🟡 PDF (cetak), HTML, JSON, CSV | TXT, DOCX, XLSX, tautan bagikan, bandingkan | X4 |
| Scan URL, sitemap, PDF/RTF/HTML, bulk | ✅ URL artikel, sitemap → sesi massal, unggah DOCX/PDF/RTF/HTML/TXT (8 Nov 2026) | §7 | X1 ✅ |
| Smart AI Engine Router termurah yang mampu | ✅ `src/engine/router.ts` (otomatis/manual, model bisa dimatikan) | Router berbasis kemampuan + biaya §8 | X1 ✅ |
| Fable 5.1 | ✅ mati bawaan; hanya bila dinyalakan, tidak untuk naskah rahasia | Tingkat banding §8 | X1 ✅ |
| Cek saldo sebelum API, reservasi, rekonsiliasi | ✅ + tombol darurat, batas per pemeriksaan & per member/hari, batas waktu 2 jam, cache hasil 7 hari | §9 | X1 ✅ |
| Deposit Rupiah → kredit (Rp1.000 = 1.000 kredit, diatur admin) | ✅ (kurs token diatur) | Tampilan „kredit“, kurs dicatat per transaksi | X1 |
| Peran: Super Admin, Admin, Moderator, Finance Admin, Organizer, Judge, Member, Guest | 🟡 3 peran | 8 peran + izin rinci §11 | X5 |
| Kompetisi lengkap (organizer, peserta, juri, rubrik berbobot, blind, multi-juri, tie-breaker, final approval) | 🟡 | §12 | X5 |
| Notifikasi | ❌ | Notifikasi di portal + e-mail | X6 |
| Payment gateway (webhook, idempotensi) | 🟡 manual | §9.6 | X6 |
| Monitoring + alert | 🟡 | §15 | X7 |
| 70 artikel ID + EN untuk AdSense | ❌ | §16 | X0 (sesudah AdSense live) |

---

## 4. Kategori, jenis artikel, deteksi tambahan, keyakinan

### 4.1 Kategori penulis/penerbit (11)

Pribadi/Individu · Organisasi · Lembaga · Pemerintahan · Pendidikan · Perusahaan · Media/Pers · Yayasan · Komunitas ·
Keagamaan · **Tidak Diketahui**.

### 4.2 Jenis artikel (34)

Karya Ilmiah · Jurnal Ilmiah · Skripsi · Tesis · Disertasi · Makalah · Paper Akademik · Esai · Opini · Editorial ·
Berita · Investigasi · Reportase · Artikel Pendidikan · Artikel Agama · Artikel Kesehatan · Artikel Teknologi ·
Artikel Sejarah · Artikel Hukum · Artikel Ekonomi · Tutorial/Panduan · Review/Ulasan · Biografi · Profil ·
Dokumentasi · Laporan · Wawancara · Cerita/Narasi · Puisi/Sastra · Promosi/Iklan · Resensi Buku · Lainnya ·
**Tidak Diketahui**.

Setiap jenis terhubung ke satu rubrik bawaan (9 rubrik yang ada + rubrik baru untuk jenis yang belum punya, ditulis di
fase X3). Jenis tanpa rubrik khusus memakai rubrik umum, dan laporan menyebutnya.

### 4.3 Deteksi tambahan

Topik utama dan pendukung · Bahasa · Gaya penulisan (akademik, profesional, informal, jurnalistik, kreatif) · Tujuan
penulisan (informasi, persuasi, hiburan, edukasi, promosi, dokumentasi) · Struktur artikel · Identitas penulis ·
Identitas penerbit · Tahun publikasi · Referensi/sumber · Orisinalitas (§6.6).

### 4.4 Cara mengklasifikasikan (aturan sistem)

1. **Auto Detect** adalah bawaan; member boleh memilih kategori/jenis secara manual sebelum atau sesudah pemeriksaan
   (koreksi manual dicatat di riwayat laporan, versi laporan naik).
2. **Multi-kategori:** satu artikel boleh punya lebih dari satu kategori/jenis, masing-masing dengan keyakinan.
3. **Bukti dulu, tebakan kemudian.** Pra-proses di Worker (tanpa biaya AI) mengumpulkan bukti: baris byline, kop, nama
   domain URL, metadata dokumen (author, organisasi, tanggal), kata kunci kelembagaan (mis. „Dinas“, „Kementerian“,
   „Universitas“, „PT“, „Yayasan“, „Redaksi“), struktur (abstrak, daftar pustaka). Model (Haiku) menerima bukti ini dan
   menjawab dengan skema terstruktur: `{ category, confidence, evidence[], alternatives[] }`.
4. **Tingkat keyakinan:**

| Tingkat | Rentang | Perilaku |
|---|---|---|
| High | 85–100 % | kategori ditetapkan; templat laporan kategori itu dipakai |
| Medium | 60–84 % | kategori ditetapkan dengan tanda „perkiraan“; member diminta konfirmasi (satu klik) |
| Low | 0–59 % | status **Uncertain** → kategori **Tidak Diketahui**, templat I (§5.9), saran pemeriksaan manual; analisis artikel tetap berjalan |

5. **Alasan selalu ditulis** (Detection Explanation): bukti mana yang dipakai.
6. **Dibedakan di laporan:** „terdeteksi“ (terbaca dari naskah/metadata) vs „perkiraan“ (disimpulkan model).
7. **Tidak mengarang:** bila nama penulis/penerbit/tahun tidak ada di naskah atau metadata, ditulis „Tidak diketahui“.

### 4.5 Format hasil deteksi (setiap laporan)

Author Category · Article Type · Topics · Language · Writing Style · Writing Purpose · Article Structure · Publisher ·
Author · Publication Year · Confidence Score · Detection Explanation · Manual Review Status.

---

## 5. Sistem laporan multi-kategori

Satu mesin laporan, banyak templat. Bagian bersama setiap laporan (Master_xscan Bagian 14): nomor laporan, ID
pemeriksaan, tanggal, versi, identitas dokumen, hasil, metodologi, catatan keterbatasan, identitas penerbit laporan
(xscan.es), QR verifikasi. Bagian khusus per kategori:

| Templat | Bagian khusus (urutan dari file pemilik) |
|---|---|
| **A. Personal/Individual** | Judul · Informasi penulis · Kategori · Jenis · Topik utama · Bahasa · Gaya · Skor mutu isi · Tata bahasa & ejaan · Kemiripan/orisinalitas · Kekuatan · Kelemahan · Rekomendasi · Kesimpulan |
| **B. Organization** | Nama organisasi · Profil · Judul · Penulis/kontributor · Kategori organisasi · Tujuan artikel · Relevansi dengan organisasi · Akurasi informasi · Mutu tulisan · Konsistensi isi · Mutu komunikasi publik · Kekuatan & kelemahan · Rekomendasi · Evaluasi akhir |
| **C. Institution** | Nama lembaga · Identitas · Informasi publikasi · Judul · Penulis · Relevansi kelembagaan · Kredibilitas isi · Mutu akademik/profesional · Analisis referensi · Mutu dokumentasi · Kelengkapan isi · Hasil evaluasi · Rekomendasi · Kesimpulan |
| **D. Government** | Instansi · Dinas/badan · Judul · Tanggal terbit · Relevansi informasi publik · Relevansi kebijakan · Akurasi informasi · Penilaian transparansi · Mutu komunikasi publik · Mutu bahasa · Manfaat publik · Hasil evaluasi · Rekomendasi · Kesimpulan |
| **E. Educational Institution** | Sekolah/kampus · Jenjang · Penulis/siswa · Mata pelajaran · Jenis artikel · Tujuan pembelajaran · Relevansi akademik · Metodologi · Mutu referensi · Struktur ilmiah · Mutu tulisan · Mutu isi · Kekuatan akademik · Kelemahan akademik · Rekomendasi perbaikan · Evaluasi akhir |
| **F. Company** | Nama perusahaan · Sektor · Judul · Tujuan konten · Relevansi merek · Relevansi produk/jasa · Mutu pemasaran · Analisis SEO · Relevansi audiens · Mutu tulisan profesional · Efektivitas konten · Rekomendasi · Evaluasi akhir |
| **G. Media/Press** | Nama media · Jurnalis/penulis · Judul · Tanggal terbit · Rubrik berita · Struktur berita · Verifikasi sumber · Cek fakta · Analisis netralitas · Keberimbangan informasi · Akurasi judul · Mutu tulisan jurnalistik · Indikator bias · Rekomendasi · Evaluasi akhir |
| **H. Foundation/Community/Religious** | Identitas organisasi · Judul · Penulis · Tujuan utama · Relevansi komunitas · Manfaat sosial · Relevansi edukasi/keagamaan · Akurasi informasi · Mutu tulisan · Kelengkapan isi · Nilai publik · Rekomendasi · Evaluasi akhir |
| **I. Unknown/Unclassified** | „Tidak Diketahui / Belum Terklasifikasi“ · alasan ketidakpastian · bukti yang ada · kemungkinan kategori (dengan keyakinan) · permintaan konfirmasi manual · analisis artikel tetap lengkap tanpa memaksakan kategori |

Catatan mutu:
- **Cek fakta (G)** dan **akurasi informasi (B, C, D, H)** berarti: klaim faktual diekstrak dan ditandai „perlu
  sumber“ / „didukung sumber yang dikutip“ / „bertentangan di dalam naskah“. Tanpa sumber pembanding dari luar, laporan
  tidak menilai benar/salahnya klaim di dunia nyata dan menyebutnya terang-terangan. Cek sumber web (opsional, §6.5)
  menambah pembanding.
- **Netralitas dan bias (G)** dilaporkan sebagai indikator (bahasa bermuatan, sumber satu pihak), bukan vonis.

### 5.10 J. Competition & Contest Evaluation Report

Dokumen pendukung lomba karya ilmiah, menulis, esai, jurnalistik, dan lomba lain. Bagian:

1. Identitas lomba (nama, penyelenggara, kategori, jenjang, periode) dan identitas karya (kode peserta; nama disembunyikan bila *blind judging*).
2. Rubrik yang dipakai, bobot setiap aspek (total harus 100 %), dan sumber rubrik (penyelenggara atau templat xscan).
3. Nilai setiap aspek: **nilai AI (rekomendasi)** dan **nilai juri** (bila ada), selisih, catatan juri.
4. Indikasi tulisan AI dengan keyakinan dan keterbatasan; kemiripan dengan karya peserta lain dalam lomba yang sama.
5. Kesesuaian dengan syarat lomba (jumlah kata, tema, format) — terukur.
6. Nilai akhir tertimbang, peringkat sementara, status: draf → dinilai juri → disahkan penyelenggara.
7. Pernyataan tetap: „Nilai AI adalah rekomendasi. Keputusan pemenang ada pada dewan juri dan penyelenggara.“
8. Riwayat perubahan nilai (siapa, kapan, alasan), QR verifikasi.

Laporan kompetisi tingkat lomba: rekap seluruh peserta, peringkat, perbandingan antarjuri, juri yang belum menilai,
konflik kepentingan yang dideklarasikan, keputusan akhir dan tanggal pengesahan.

---

## 6. Modul analisis lanjutan

| Modul | Isi | Tingkat model minimum |
|---|---|---|
| 6.1 Content analysis | Mutu artikel · relevansi · klaim faktual · kata kunci · topik utama/pendukung · poin penting · ringkasan · duplikasi dalam naskah · kemiripan semantik · kelengkapan | Haiku; Sonnet bila naskah akademik panjang |
| 6.2 Writing quality | Tata bahasa · ejaan · tanda baca · struktur kalimat dan paragraf · keterbacaan · konsistensi · gaya akademik/profesional/informal · pola teks AI | Haiku (kesalahan bahasa), Sonnet (penilaian gaya) |
| 6.3 Structure detection | Judul · subjudul · pendahuluan · abstrak · latar belakang · tujuan · metodologi · hasil · pembahasan · kesimpulan · referensi · daftar pustaka · info penulis — **hanya bagian yang ada; struktur tidak dipaksakan** | Worker (aturan) + Haiku |
| 6.4 SEO analysis | Judul SEO · meta description · kepadatan kata kunci · search intent · struktur heading · tautan internal/eksternal · alt gambar · skor optimasi · keterbacaan · relevansi | Worker (dari HTML URL) + Haiku |
| 6.5 Source & reference | Deteksi referensi dan sitasi · kredibilitas sumber (jenis domain, penerbit) · kelengkapan referensi · DOI · URL · format daftar pustaka (APA, MLA, Chicago, IEEE, Vancouver) · klaim tanpa dukungan · opsional: cek URL/DOI yang dikutip benar-benar ada | Worker + Haiku; Sonnet untuk akademik |
| 6.6 Plagiarism & originality | Kemiripan teks · paragraf/kalimat kembar · pencocokan sumber · verifikasi sitasi · penilaian orisinalitas — dengan pembanding: naskah lain di sesi yang sama, naskah member sendiri, sumber yang dikutip, dan (opsional, berbayar) pencarian web. Tanpa pembanding: „orisinalitas tidak bisa dinilai“ | Worker (shingle/MinHash) + Sonnet |
| 6.7 Advanced report scores | Overall Article · Classification · Content Quality · Readability · SEO · Originality Similarity · Source Reliability · Writing Quality · Detected Issues · Recommendations · Detailed Explanation | gabungan |

Ekspor & laporan: PDF (cetak + PDF server di X4), TXT, DOCX, XLSX (rekap), CSV, salin hasil, tautan bagikan
(bertanda tangan, kedaluwarsa, bisa dicabut), riwayat, **bandingkan dua artikel** (berdampingan: persen AI, skor,
kemiripan antar-keduanya).

---

## 7. Sumber masukan

| Masukan | Aturan |
|---|---|
| Teks tempel | sudah ada |
| Unggah dokumen | PDF, DOCX, TXT, RTF, HTML (+ .md). Validasi ekstensi, MIME, *magic bytes*, ukuran (bawaan 20 MB), jumlah berkas, berkas rusak/kosong, nama berkas disimpan aman (UUID), checksum SHA-256. Status: Pending → Uploading → Uploaded → Validating → Processing → Completed / Failed / Cancelled. Gagal unggah: tidak dianalisis, tidak dipotong kredit, pesan aman, coba ulang tanpa duplikat (kunci = checksum + uid). Berkas sementara dihapus. Berkas di R2 `UPLOADS`, tidak di dokumen data. |
| URL artikel | Hanya `https`/`http`; tolak IP privat/loopback/link-local/metadata (SSRF), resolusi DNS dicek ulang setelah redirect; maks. 5 redirect; timeout 15 s; maks. 5 MB; ekstraksi isi utama (buang menu, iklan, footer); hormati robots.txt; batas laju per domain |
| Sitemap XML | Validasi XML, sitemap bertingkat (maks. kedalaman 3), maks. URL per scan (diatur admin, bawaan 500), URL kembar dibuang, status per URL |
| Massal (bulk) | Antrean (Cloudflare Queues), konkurensi dibatasi, satu artikel gagal tidak menggagalkan batch, retry terbatas, pause/resume/cancel, laporan error, kredit per pekerjaan |

**Dibangun 8 Nov 2026** (`src/lib/extract.ts`, `POST /api/extract`, tombol „Ambil dari URL“ di formulir periksa):
http/https saja, tanpa kredensial, host internal/IP privat/metadata ditolak, port 80/443, setiap pengalihan diperiksa
ulang (maks. 5), 15 detik, 5 MB, robots.txt dihormati (agen `xscanbot`), isi utama dari `<article>`/`<main>` tanpa
menu/footer/skrip, judul/penulis/tanggal/bahasa dari meta. Mengambil teks tidak memanggil AI dan tidak memotong token
(30 per jam per member). Pembaca sitemap bertingkat (`collectSitemap`) sudah teruji; penyambungannya ke sesi massal,
unggah PDF/RTF/HTML, dan antrean menyusul. Uji: `test/extract.test.ts` (SSRF lewat pengalihan ke 169.254.169.254, robots,
ukuran, pengalihan berulang, bukan HTML, halaman kosong, sitemap) + e2e (alamat internal ditolak, naskah tidak tersentuh).

### 7.1 Fase X1 selesai (8 Nov 2026)

| Bagian | Kode | Uji |
|---|---|---|
| URL artikel (SSRF, robots.txt, 5 MB, 15 s, 5 pengalihan) | `src/lib/extract.ts`, `POST /api/extract` | `test/extract.test.ts`, e2e |
| Sitemap → sesi massal (bertingkat maks. 3, maks. 50 artikel sekali impor, 3 diambil bersamaan, kegagalan per URL dicatat) | `POST /api/sitemap`, halaman sesi | unit + e2e (alamat internal ditolak) |
| Unggah DOCX/PDF/RTF/HTML/TXT, tanda tangan berkas dicek, maks. 20 MB, PDF ≤ 300 halaman, PDF pindaian/terkunci diberi pesan | `public/assets/app.js` (di peramban, berkas tidak dikirim), pdf.js 6.4.299 lokal (`public/assets/vendor/pdfjs`, Apache-2.0) | e2e (PDF asli, RTF, HTML, PDF palsu) |
| Router termurah yang mampu, mode otomatis/manual, model bisa dimatikan, Fable mati bawaan | `src/engine/router.ts` | `test/router.test.ts`, e2e |
| Tombol darurat, batas token per pemeriksaan & per member per hari | `src/data/controls.ts`, Admin → Kendali biaya, audit log | unit + e2e |
| Pratinjau biaya: perkiraan, saldo, kekurangan + tautan isi saldo | `/api/estimate`, formulir periksa | e2e |
| Cache hasil: naskah + pengaturan sama dalam 7 hari → laporan lama, 0 token, 0 halaman kuota („Ajukan tinjauan“ tetap menilai ulang) | `cachedCheck` di `src/routes/checks.ts` | e2e |
| Batas waktu total 2 jam: pemeriksaan macet dihentikan, token/kuota kembali, idempoten | `sweep` di `src/cron.ts` | `test/deadline.test.ts` |

Belum di X1 (dicatat untuk fase berikutnya): Batch API diskon 50 % untuk pilihan „Hemat ≤24 jam“ dan antrean
Cloudflare Queues untuk sitemap > 50 artikel (X4/X6), deteksi semua bahasa dunia (§22 G4).

**Pratinjau sebelum memindai** (Xscan §4): jumlah halaman, jumlah artikel, token masuk dan keluar perkiraan (dihitung
dari isi yang sudah diekstrak, bukan dari jumlah halaman), mesin termurah yang memenuhi syarat, perkiraan kredit, saldo,
kekurangan. Tombol „Mulai“ hanya aktif bila saldo cukup.

---

## 8. Smart AI Engine Router

### 8.1 Model (diverifikasi 7 Nov 2026 dari referensi API Anthropic; diatur dan diuji ulang di Admin → Mesin)

| Label proyek | Model ID | Input / Output per 1 juta token | Cache read | Konteks | Peran di xscan.es |
|---|---|---|---|---|---|
| Haiku 5.5 | `claude-haiku-5-5` | US$0,10 / US$0,50 (prompt ≤100K token; di atas itu US$0,50 / US$2,50) | — | 1M | tingkat 1: klasifikasi, bahasa, jenis, kata kunci, kesalahan bahasa, deteksi per kalimat (mode Ultra) |
| Sonnet 5.5 | `claude-sonnet-5-5` | US$2 / US$10 | US$0,20 | 1M | tingkat 2: mutu isi, SEO, struktur, referensi, rubrik, kalimat yang diragukan Haiku |
| Opus 5.5 | `claude-opus-5-5` | US$4 / US$20 | US$0,20 | 1M | tingkat 3: analisis akademik mendalam, konsistensi faktual kompleks, penentuan juara |
| Fable 5.1 | `claude-fable-5-1` | US$10 / US$50 | US$0,25 | 1M | tingkat 4 (**mati bawaan**): banding/sengketa hasil, bila pemilik menyalakannya |

**Koreksi urutan pemilik.** File „Xscan“ mengusulkan prioritas Haiku → Sonnet → Fable → Opus. Menurut tarif saat ini
Fable 5.1 **lebih mahal** daripada Opus 5.5 (2,5×), jadi urutan menurut harga adalah **Haiku → Sonnet → Opus → Fable**.
File pemilik sendiri menyatakan urutan itu prioritas awal dan sistem wajib membandingkan tarif aktual; router mengurutkan
menurut harga yang tersimpan di Admin, bukan menurut daftar tetap.

Catatan teknis (berlaku untuk kode):
- Fable 5.1 mensyaratkan retensi data 30 hari di Anthropic (tidak tersedia untuk organisasi *zero data retention*);
  karena itu tingkat 4 tidak dipakai untuk naskah yang ditandai „rahasia“ oleh member.
- Opus 5.5, Sonnet 5.5, Fable 5.1 menolak `tool_choice` paksa; keluaran terstruktur memakai `output_config.format`.
- Thinking adaptif; kedalaman diatur `effort` (Haiku dan Opus bawaan `medium`). Effort per tugas diatur admin.
- Penolakan keamanan (`stop_reason: "refusal"`) ditangani: tidak ditagih ke member bila tidak ada hasil; fallback
  server-side diaktifkan untuk Opus/Sonnet/Fable.
- **Batch API (diskon 50 %)** untuk scan massal yang tidak mendesak (sitemap, lomba besar): pilihan „Hemat (selesai ≤24
  jam)“ di formulir.
- **Prompt caching** untuk prompt sistem dan rubrik yang sama di banyak naskah (sesi lomba).

### 8.2 Kemampuan minimum per tugas

| Tugas | Simple | Medium | Complex |
|---|---|---|---|
| Contoh | bahasa, jenis, kategori dengan bukti kuat, kata kunci, kesalahan bahasa | mutu isi, SEO, struktur, referensi, rubrik umum, kategori keyakinan sedang | skripsi/tesis/disertasi, cek konsistensi faktual, penentuan juara, banding |
| Model termurah yang memenuhi | Haiku 5.5 | Sonnet 5.5 | Opus 5.5 |

### 8.3 Algoritma (pseudocode)

```
route(task, content, member):
  tokensIn  = countTokens(content + prompt(task))         // token sungguhan, bukan jumlah kata
  tokensOut = expectedOutput(task, tokensIn)              // dari tabel kalibrasi di admin
  eligible  = activeModels()
                .filter(m => m.capabilities ⊇ need(task) and m.context ≥ tokensIn + tokensOut
                             and m.provider.available and not (m.requires30dRetention and content.confidential))
  if eligible kosong → tolak dengan pesan jelas, tanpa memanggil API
  for m in eligible: m.cost = tokensIn·m.in + tokensOut·m.out (+ cache, + biaya lain) → kredit (kurs + biaya layanan)
  pick = argmin(cost)                                     // termurah yang mampu, bukan urutan tetap
  need = pick.cost × 1,3 (cadangan)                       // batas atas yang direservasi
  if available(member) < need or need > member.limitPerScan → INSUFFICIENT (tanpa panggilan API)
  reserve(member, need, idem = scanId+task+pick)
  result = call(pick); usage = result.usage                // token nyata dari respons
  if not valid(result) or result.confidence < gate(pick):  // gerbang eskalasi (ada di cascade.ts)
      next = cheapest eligible yang lebih mampu dari pick
      if escalations < maxEscalations and available(member) ≥ cost(next): eskalasi (reservasi tambahan dulu)
      else: kembalikan hasil terbaik + tanda „keyakinan rendah“
  settle(member, actual(usage), idem); release(sisa)       // potong biaya nyata, kembalikan sisa
  log(model, alasan pemilihan, token in/out/cache, biaya USD, kredit, harga yang berlaku saat itu)
```

Batas: `maxEscalations` bawaan 2 per tugas; retry API maks. 2 untuk error 429/5xx/timeout; tidak ada retry untuk 4xx.
Setiap keputusan router dicatat (`ai_usage` §13) agar biaya bisa diaudit dengan harga pada saat transaksi.

### 8.4 Penghematan wajib (Xscan §6)

Pemilihan dinamis menurut harga terkini · anggaran token maks. per scan · batch kecil dengan cek saldo sebelum setiap
batch · eskalasi hanya bila perlu · **cache hasil** (isi + pengaturan sama → hasil lama dipakai, tanpa biaya) ·
deteksi isi kembar (tidak membayar dua kali) · pemantauan biaya per tugas · batas belanja per member dan per scan ·
emergency stop · tidak menagih permintaan gagal yang tidak ditagih provider · rekonsiliasi estimasi vs biaya nyata.

---

## 9. Dompet kredit

### 9.1 Tiga besaran yang tidak dicampur

| Besaran | Arti | Disimpan di |
|---|---|---|
| Deposit Rupiah | uang yang dibayar member | `deposits/` (jurnal + saldo) |
| Kredit internal (AI Credits) | satuan yang dipakai membayar layanan | `wallets/` + `ledger/` |
| Token API | token nyata yang ditagih Anthropic | `ai_usage/` |

### 9.2 Konversi

`Kredit = Deposit terverifikasi × kurs` — bawaan **Rp1.000 = 1.000 kredit**, diatur admin tanpa ubah kode; kurs yang
berlaku dicatat di setiap transaksi.

`Biaya API (USD) = token_in/1e6 × harga_in + token_out/1e6 × harga_out + cache + biaya lain` → IDR (kurs USD/IDR diatur
admin) → kredit → `+ biaya layanan` (persen, diatur admin, **rahasia** — member hanya melihat harga per mesin).

**Markup harga token: 5–500×** (harga = modal × markup; pemilik, 7 Nov 2026: „Dr 5-500 saja“, sebelumnya 10–500×).
Dibatasi di server; slider dan pilihan cepat 5×, 10×, 20×, 50×, 100×, 200×, 500× di Admin → Harga & token. Penjaga
„tidak rugi“ (uji `engine.test.ts`) memastikan pada 5× dengan diskon paket 50 % dan komisi afiliasi terbesar, token yang
direservasi tetap menutup biaya API terburuk.

### 9.3 Struktur dompet member

Deposit tunai · Kredit tersedia · Kredit direservasi · Kredit terpakai · Kredit dikembalikan · Kredit bonus/promo.
`tersedia` tidak pernah negatif; lima scan bersamaan tidak memakai saldo yang sama (reservasi atomik CAS).

### 9.4 Saldo tidak cukup

Tampil: saldo tersedia · perkiraan biaya · kekurangan · rekomendasi deposit (`kekurangan / kurs`, dibulatkan ke paket
deposit terdekat ≥ kekurangan) · tombol Deposit yang tersambung ke pembayaran sungguhan. Setelah pembayaran terverifikasi:
saldo diperbarui → kelayakan dihitung ulang → harga mesin dicek ulang → perkiraan dihitung ulang → member melanjutkan.

### 9.5 Reservasi dan pemulihan

Reservasi → jalankan → biaya nyata → potong → lepas sisa (sudah ada). Ditambah: cron 10 menit mencari reservasi
menggantung > 30 menit (Worker mati, timeout), mencocokkan dengan log `ai_usage`, menyelesaikan atau mengembalikan,
mencatatnya di audit. Idempotensi: satu kunci per (scan, tugas, model).

### 9.6 Pembayaran

Paket deposit Rp10.000 · 25.000 · 50.000 · 100.000 · 250.000 · 500.000 · jumlah bebas (min./maks. diatur admin).
Gateway (keputusan pemilik §18): webhook bertanda tangan, validasi nominal + mata uang, idempotensi webhook, rekonsiliasi
harian, refund. Transfer manual + bukti tetap ada sebagai cadangan.

### 9.7 Laporan keuangan admin

Total deposit · kredit diterbitkan · kredit terpakai · biaya API nyata · pendapatan · laba kotor (`pendapatan − biaya
API`) · biaya gateway · refund · kredit tercadang. **Kredit yang belum terpakai bukan laba.**

---

## 10. Struktur menu

| Publik | Member | Admin |
|---|---|---|
| Beranda ✅ · Tentang platform ❌ · Fitur AI Article Detector 🟡 · Pemeriksaan lewat URL ❌ · Pemeriksaan dokumen 🟡 · Kompetisi & lomba 🟡 · Harga ✅ · Panduan ❌ · FAQ 🟡 · **Artikel/Blog ❌ (§16)** · Alat gratis ❌ (§16.3) · Masuk/Daftar ✅ | Ringkasan ✅ · AI Article Detector ✅ · Scan URL ❌ · Scan sitemap ❌ · Scan dokumen 🟡 · Bulk scan 🟡 · Riwayat ✅ · Detail hasil ✅ · Laporan & unduhan 🟡 · Kompetisi tersedia ❌ · Pendaftaran lomba ❌ · Pengumpulan karya ❌ · Hasil penilaian 🟡 · Dompet kredit ✅ · Riwayat transaksi ✅ · Paket ✅ · Profil & pengaturan ✅ · Notifikasi ❌ · Bantuan ❌ | Statistik ✅ · Member ✅ · Admin & moderator ❌ · Kategori ❌ · Jenis artikel ❌ · Pengaturan AI engine ✅ · API provider ✅ · Smart Router 🟡 · Harga token ✅ · Kredit ✅ · Deposit & pembayaran ✅ · Riwayat pemakaian AI ✅ · Scan 🟡 · Kompetisi ❌ · Peserta ❌ · Juri ❌ · Rubrik 🟡 · Laporan kompetisi 🟡 · Sistem ✅ · Keamanan & audit log ✅ · **Artikel blog (penulisan, jadwal terbit) ❌** |

---

## 11. Peran dan hak akses (least privilege)

| Peran | Bisa | Tidak bisa |
|---|---|---|
| Super Admin (`owner`) | semua, termasuk kunci API, harga, peran | — (setiap aksi dicatat) |
| Admin | member, scan, rubrik, kategori, artikel blog, kompetisi | kunci API, kurs/margin, peran admin |
| Moderator | tinjauan sengketa, cabut laporan, moderasi artikel | keuangan, kunci API |
| Finance Admin | deposit, pembayaran, refund, laporan keuangan | isi naskah member |
| Competition Organizer | lomba miliknya: syarat, jadwal, kuota, biaya, rubrik, juri, pengumuman, hasil | lomba orang lain |
| Competition Judge | karya yang ditugaskan (anonim bila blind), nilai, komentar, draf, submit | karya lain, identitas peserta saat blind |
| Member | naskah, laporan, dompet miliknya sendiri | data member lain (cek kepemilikan di setiap rute — anti-IDOR) |
| Guest | halaman publik, coba gratis terbatas | portal |

Setiap rute API menyatakan peran dan izin; aksi penting (saldo, harga, nilai yang disahkan, peran) masuk audit log.

---

## 12. Kompetisi

- **Penyelenggara:** buat lomba (nama, kategori, syarat, jadwal, kuota, biaya daftar, rubrik, juri, pengumuman),
  kelola peserta dan hasil.
- **Peserta:** daftar, unggah karya, revisi sesuai aturan, lihat status/pengumuman/hasil sesuai kebijakan penyelenggara.
- **Juri:** daftar karya yang ditugaskan, blind judging, rubrik, nilai per aspek, komentar, simpan draf, submit, riwayat.
- **Rubrik:** bobot diatur penyelenggara; validasi total 100 %. Contoh bawaan: Orisinalitas 20 · Kedalaman 20 · Akurasi
  20 · Struktur 15 · Bahasa 10 · Metodologi & referensi 15.
- **Penilaian:** AI-assisted (rekomendasi), juri manusia, multi-juri, rata-rata tertimbang, penanganan juri belum
  menilai, deklarasi konflik kepentingan, audit perubahan nilai, ranking, tie-breaker (urutan aspek yang ditetapkan
  penyelenggara, lalu Opus perbandingan berpasangan sebagai rekomendasi), **final approval** penyelenggara. Nilai yang
  sudah disahkan tidak berubah tanpa riwayat.

---

## 13. Data di R2 (tanpa D1)

Pemetaan daftar „tabel“ Master_xscan §54 dan Bagian 17 ke koleksi R2 (bucket `DATA`, berkas di `UPLOADS`, cadangan di
`BACKUPS` 35 hari). „Foreign key/unique/check constraint“ diwujudkan dengan: id deterministik, `createOnce` untuk nilai
unik, CAS untuk transisi status, validasi di server (bukan di frontend), indeks `i/…` dengan `customMetadata`.

| „Tabel“ pemilik | Koleksi R2 | Status |
|---|---|---|
| users, roles, permissions, user_roles | `users/`, `i/users/`, `roles.json` (definisi peran + izin) | 🟡 peran ditambah |
| articles, article_scans, scan_results, scan_reports | `checks/`, `reports/`, `i/checks/{uid}/` | ✅ |
| categories, article_types | `k/taxonomy.json` (diatur admin) | ❌ |
| ai_providers, ai_models, ai_price_history | `k/engine.json` + `l/prices/` (append-only, harga per tanggal) | 🟡 riwayat harga |
| ai_usage_logs | `l/ai_usage/{yyyy-mm}/` append-only | ✅ |
| wallets, wallet_transactions, wallet_reservations | `wallet/{uid}`, `l/ledger/{uid}/`, kunci reservasi di dokumen dompet | ✅ |
| deposits, orders, payments | `deposit/`, `orders/`, `pay-event/` (idempotensi) | ✅ |
| uploads, processing_jobs | `uploads/{id}` (metadata) + objek di `UPLOADS`, `jobs/{id}` | ❌ |
| competitions, competition_categories, participants, submissions, rubrics, judges, scores | `comp/{id}`, `comp/{id}/participants/`, `…/submissions/`, `…/judges/`, `…/scores/{judge}/{sub}`, `rubrics/` | 🟡 |
| notifications | `notif/{uid}/` | ❌ |
| audit_logs | `l/audit/` append-only | ✅ |
| articles blog (publik) | berkas Markdown di repo (`content/blog/{id,en}/`), dibangun saat deploy — bukan R2 | ❌ |

---

## 14. Keamanan, privasi, retensi

Hash sandi kuat · 2FA · kunci API terenkripsi (master key di secret Worker) dan tidak pernah dikirim ke browser · RBAC +
cek kepemilikan · rate limit · tanpa SQL (R2) · escape HTML di setiap keluaran (XSS) · token CSRF di formulir ·
validasi upload (§7) · anti-SSRF (§7) · anti path traversal · audit log admin · cadangan terenkripsi harian · retensi
(bawaan 90 hari, pilihan member) dan hapus permanen · data tidak dipakai melatih AI · kebijakan pemrosesan karya lomba ·
naskah privat tidak dikirim ke tingkat 4 (§8.1) · pesan error aman untuk pengguna (tanpa stack trace) dengan ID error.

---

## 15. Uji, pemantauan, cadangan, deploy

- **Uji:** unit (kalkulator token dan kredit, dompet, reservasi, router, skor, validasi) · integrasi (R2 palsu, API
  Anthropic tiruan, unggah, webhook, laporan, antrean) · e2e Playwright desktop + ponsel (alur §Bagian 33 pemilik:
  daftar → deposit → verifikasi → unggah → scan → laporan → lomba → juri → ranking → pengesahan) · keamanan (IDOR,
  manipulasi request, unggah berbahaya, SSRF, race condition dua transaksi bersamaan) · uji gagal (provider mati, timeout,
  webhook ganda, Worker mati, saldo kurang). Status uji ditulis jujur: PASS, FAIL, BLOCKED, IN PROGRESS, NOT TESTED.
- **Pemantauan:** waktu respons, error rate, keberhasilan unggah/scan, konsumsi token, kredit, pembayaran, kegagalan job;
  alert ke e-mail admin (saldo provider menipis, provider mati, lonjakan error, antrean menumpuk, selisih saldo, pembayaran
  belum terverifikasi).
- **Cadangan:** harian, terenkripsi, 35 hari, uji pulih bulanan.
- **Deploy:** CI (`detektor-artikel-ci.yml`) → merge → `deploy-detektor-artikel.yml` (uji asap: health, ads.txt 16 akun,
  tag meta, satu loader, robots) → audit live `site-audit.yml`.

---

## 16. Situs publik dan pengajuan AdSense

### 16.1 Kenapa perlu

AdSense menilai situs dari halaman publik yang bisa diindeks. xscan.es sekarang hanya punya halaman produk dan kebijakan
— terlalu tipis untuk ditinjau („konten tanpa manfaat“, lihat `docs/ADSENSE-BLUEPRINT.md` §22). Perintah pemilik 7 Nov:
**70 artikel**, masing-masing dengan **versi bahasa Inggris yang ditulis sendiri**.

### 16.2 Aturan artikel

- Bahasa Indonesia di `/artikel/{slug}`, Inggris di `/en/articles/{slug}`; pasangan hreflang `id`/`en`/`x-default`.
- ≥1.500 kata (Indonesia) dan versi Inggris setara isinya, **ditulis sebagai teks Inggris** (bukan terjemahan mesin).
- Satu artikel = satu maksud pencarian; judul memuat kata kunci secara alami; tanpa judul kembar.
- Tanpa angka, studi, kutipan, atau nama alat pihak lain yang dikarang; klaim tentang deteksi AI selalu menyebut
  keterbatasannya; tanpa menjelek-jelekkan pesaing.
- 2–4 sumber resmi/terpercaya per artikel bila relevan (pedoman PUEBI/EYD V Badan Bahasa, panduan sitasi gaya APA/MLA,
  kode etik jurnalistik Dewan Pers, pedoman Kemendikbudristek tentang AI, Google Search Central, UNESCO tentang AI di
  pendidikan) — dicek ulang tautannya.
- Tanggal jujur (hari terbit sebenarnya), terbit bertahap 2–3 per minggu (§22 A2), riwayat pembaruan.
- Tautan internal: setiap artikel menaut ke 2–3 artikel satu kluster, ke alat terkait (§16.3), dan ke halaman produk
  yang relevan; tautan antar-situs ekosistem hanya yang relevan topiknya (`docs/ADSENSE-BLUEPRINT.md` §15.4, §24).
- Auto ads hanya di halaman artikel, panduan, alat, beranda. Tidak di portal, laporan, cetak, pembayaran.

### 16.3 Alat gratis (bukti „alat yang autentik“, kriteria Google)

1. **Penghitung kata & waktu baca** (ID/EN, tanpa server).
2. **Pembuat daftar pustaka** APA 7 / MLA 9 / Chicago / IEEE dari isian manual.
3. **Pemeriksa struktur heading** (tempel HTML/Markdown → peta H1–H6, peringatan lompatan level).
4. **Kalkulator nilai rubrik lomba** (aspek + bobot → nilai akhir, validasi 100 %, ekspor CSV).
5. **Uji keterbacaan** (panjang kalimat, kalimat panjang, kata sulit — rumus dijelaskan apa adanya).

Semua berjalan di browser; isi Markdown halaman alat adalah penjelasan lengkap yang bisa dibaca crawler.

### 16.4 Daftar 70 artikel (7 kluster × 10)

Judul Indonesia → judul Inggris. Artikel pilar setiap kluster bertanda ★.

**A. Deteksi tulisan AI — cara kerja dan batasannya**
1. ★ Cara kerja detektor tulisan AI: sinyal, model, dan batas keyakinannya → How AI writing detectors work: signals, models and their limits of confidence
2. Mengapa detektor AI bisa salah: salah positif dan salah negatif → Why AI detectors get it wrong: false positives and false negatives
3. Membaca persen AI, campuran, dan manusia di laporan deteksi → Reading AI, mixed and human percentages in a detection report
4. Tulisan non-penutur asli dan risiko dicap AI → Non-native writers and the risk of being flagged as AI
5. Parafrase, penyuntingan, dan tulisan campuran manusia–AI → Paraphrasing, editing and mixed human–AI writing
6. Apa arti tingkat keyakinan tinggi, sedang, dan rendah → What high, medium and low confidence really mean
7. Deteksi AI untuk teks bahasa Indonesia: tantangan khusus → Detecting AI in Indonesian text: the particular challenges
8. Stilometri: membaca gaya menulis tanpa menebak penulisnya → Stylometry: reading writing style without guessing the author
9. Kapan hasil deteksi perlu pemeriksaan manual → When a detection result needs a manual review
10. Cara menanggapi tuduhan memakai AI secara adil → How to respond fairly to an accusation of AI use

**B. Menulis artikel yang baik**
11. ★ Struktur artikel yang jelas: dari judul sampai kesimpulan → A clear article structure: from headline to conclusion
12. Menulis pembuka yang membuat orang terus membaca → Writing an opening that keeps people reading
13. Paragraf yang efektif: satu gagasan, satu paragraf → Effective paragraphs: one idea, one paragraph
14. Kalimat efektif menurut EYD V → Effective sentences under the EYD V spelling rules
15. Kesalahan ejaan dan tanda baca yang paling sering → The most common spelling and punctuation mistakes
16. Menyunting tulisan sendiri: daftar periksa dua putaran → Editing your own writing: a two-pass checklist
17. Gaya akademik, profesional, dan populer: kapan memakai yang mana → Academic, professional and popular style: when to use which
18. Menulis ringkasan dan abstrak yang padat → Writing a tight summary and abstract
19. Keterbacaan: kalimat panjang, kata sulit, dan cara memperbaikinya → Readability: long sentences, hard words and how to fix them
20. Menulis jujur dengan bantuan AI: batas yang wajar → Writing honestly with AI assistance: sensible limits

**C. Lomba menulis dan penilaian**
21. ★ Cara juri menilai lomba menulis: rubrik, bobot, dan nilai akhir → How judges score a writing competition: rubrics, weights and final marks
22. Menyusun rubrik lomba esai yang adil → Building a fair essay-competition rubric
23. Blind judging: kenapa nama peserta disembunyikan → Blind judging: why entrants' names are hidden
24. Menangani nilai juri yang berbeda jauh → Handling judges whose scores differ widely
25. Aturan tie-breaker yang jelas sejak awal → Clear tie-breaker rules from the start
26. Syarat lomba yang sering dilanggar peserta → Competition requirements entrants break most often
27. Orisinalitas dalam lomba: kemiripan antarpeserta → Originality in competitions: similarity between entries
28. Peran AI dalam penilaian lomba: rekomendasi, bukan keputusan → AI in competition judging: a recommendation, not a verdict
29. Menulis esai lomba yang menonjol tanpa berlebihan → Writing a competition essay that stands out without overreaching
30. Laporan evaluasi lomba: apa saja isinya → A competition evaluation report: what goes in it

**D. Akademik: skripsi, jurnal, sitasi**
31. ★ Struktur karya ilmiah: pendahuluan, metode, hasil, pembahasan → The structure of a scholarly paper: introduction, methods, results, discussion
32. Cara mengutip dengan APA 7 → Citing in APA 7
33. MLA, Chicago, dan IEEE: perbedaan gaya sitasi → MLA, Chicago and IEEE: how the citation styles differ
34. Parafrase yang benar dan kapan harus mengutip langsung → Paraphrasing properly, and when to quote directly
35. Plagiarisme: jenis, contoh, dan cara menghindarinya → Plagiarism: types, examples and how to avoid it
36. Menilai kredibilitas sumber rujukan → Judging the credibility of a source
37. DOI: apa itu dan cara memeriksanya → DOI: what it is and how to check one
38. Menulis tinjauan pustaka yang tidak sekadar daftar → Writing a literature review that is more than a list
39. Kebijakan kampus tentang AI dalam tugas akhir → University policies on AI in final theses
40. Daftar periksa sebelum mengumpulkan skripsi → A checklist before submitting a thesis

**E. Jurnalistik dan media**
41. ★ Struktur berita: piramida terbalik dan 5W+1H → News structure: the inverted pyramid and the 5Ws and H
42. Cek fakta untuk penulis dan redaksi kecil → Fact-checking for writers and small newsrooms
43. Netralitas dan bahasa bermuatan dalam berita → Neutrality and loaded language in news
44. Keberimbangan sumber: cover both sides → Balance of sources: covering both sides
45. Judul yang akurat vs judul umpan klik → Accurate headlines versus clickbait
46. Opini, editorial, dan berita: membedakannya → Opinion, editorial and news: telling them apart
47. Wawancara: dari persiapan sampai kutipan → Interviews: from preparation to the quote
48. Kode etik jurnalistik dan tulisan berbantuan AI → The journalism code of ethics and AI-assisted writing
49. Menulis rilis pers organisasi yang dibaca wartawan → Writing an organisation's press release that journalists read
50. Koreksi dan ralat: cara yang benar → Corrections and retractions: doing them right

**F. SEO dan konten web**
51. ★ SEO on-page untuk artikel: judul, meta, heading, tautan → On-page SEO for articles: title, meta, headings, links
52. Search intent: menulis untuk maksud pencarian → Search intent: writing for what people are looking for
53. Struktur heading H1–H6 yang benar → A correct H1–H6 heading structure
54. Meta description yang mengundang klik → Meta descriptions that earn the click
55. Tautan internal dan eksternal yang membantu pembaca → Internal and external links that help the reader
56. Teks alt gambar: aksesibilitas dulu → Image alt text: accessibility first
57. Konten tipis dan konten tanpa manfaat: ciri dan perbaikannya → Thin and low-value content: the signs and the fixes
58. E-E-A-T: pengalaman, keahlian, otoritas, dan kepercayaan → E-E-A-T: experience, expertise, authoritativeness and trust
59. Memperbarui artikel lama dengan jujur → Updating old articles honestly
60. Konten AI dan pedoman Google Search → AI content and Google Search's guidelines

**G. Etika dan kebijakan AI di sekolah, kampus, organisasi**
61. ★ Menyusun kebijakan penggunaan AI untuk sekolah → Drafting an AI-use policy for a school
62. Kebijakan AI untuk kampus dan dosen → AI policy for universities and lecturers
63. Kebijakan AI untuk redaksi dan media → AI policy for newsrooms and media
64. Kebijakan AI untuk perusahaan dan tim konten → AI policy for companies and content teams
65. Transparansi: kapan wajib menyebut bantuan AI → Transparency: when to disclose AI assistance
66. Privasi naskah saat memakai alat AI → Keeping your text private when using AI tools
67. Mengajar menulis di era AI → Teaching writing in the age of AI
68. Penilaian tugas yang tahan AI → Designing assignments that hold up to AI
69. Hak cipta dan tulisan yang dibantu AI → Copyright and AI-assisted writing
70. Literasi AI untuk orang tua dan siswa → AI literacy for parents and students

### 16.5 Urutan kerja artikel

1. Engine artikel di Worker (Markdown → HTML, sitemap, JSON-LD Article + BreadcrumbList, hreflang, jadwal terbit,
   riwayat pembaruan) + halaman `/artikel` dan `/en/articles` + alat §16.3.
2. Tujuh artikel pilar (★) ID + EN lebih dulu, lalu 9 artikel per kluster, terbit bertahap.
3. Gerbang CI: setiap artikel ID ≥1.500 kata, punya pasangan EN, judul unik, sumber valid, tanpa tanggal mundur.

---

## 17. Tahapan pembangunan dan definisi selesai

Satu fase sampai selesai: kode → uji → PR → CI hijau → merge → deploy → cek live. Laporan setiap fase memakai format
Master_xscan Bagian 32 (pekerjaan selesai, berkas, data, endpoint, uji dan hasilnya, bug, risiko, status kesiapan).

| Fase | Isi | Selesai bila | Status |
|---|---|---|---|
| X0 | Blueprint ini; artikel publik (§16) + alat gratis; AdSense 16 akun live | 70 artikel ID+EN terbit bertahap sesuai jadwal; `site-audit` OK | blueprint ✅ · AdSense ✅ kode · artikel ⏳ |
| X1 | Router berbasis biaya + kemampuan (§8), batas belanja, emergency stop, rekonsiliasi reservasi, masukan URL/sitemap/PDF/RTF/HTML (§7), pratinjau biaya | uji unit router & kredit, uji SSRF, e2e scan URL | ✅ 8 Nov 2026 (§7.1) |
| X2 | Klasifikasi kategori (11) + jenis (34) + deteksi tambahan + keyakinan + koreksi manual (§4) | set uji berlabel ≥200 naskah, akurasi dan kalibrasi dicatat jujur | ⏳ |
| X3 | Templat laporan A–I (§5), modul analisis §6.1–6.3, 6.7, rubrik untuk jenis baru | setiap templat punya contoh laporan publik; cetak 2 halaman rapi | ⏳ |
| X4 | SEO, sumber & referensi, orisinalitas (§6.4–6.6), ekspor TXT/DOCX/XLSX, PDF server, bagikan, bandingkan dua artikel | berkas benar-benar terbuka di Word/Excel/PDF reader | ⏳ |
| X5 | 8 peran (§11), modul kompetisi lengkap + laporan J (§12, §5.10) | alur penyelenggara → peserta → juri → ranking → pengesahan lulus e2e | ⏳ |
| X6 | Gateway pembayaran + webhook, notifikasi, bantuan | uji sandbox: kredit masuk otomatis sekali saja walau webhook ganda | ⏳ |
| X7 | Pemantauan & alert, uji beban, uji gagal, audit keamanan, Final Acceptance Test (Bagian 33 pemilik, termasuk skenario gagal) | semua skenario PASS dan dicatat | ⏳ |

---

## 18. Keputusan pemilik yang dibutuhkan

1. **Gateway pembayaran:** Xendit, Midtrans, Tripay, atau Duitku (+ PayPal untuk internasional) — atau tetap transfer
   manual dulu.
2. **Kurs kredit dan biaya layanan:** bawaan Rp1.000 = 1.000 kredit; persentase biaya layanan.
3. **Tingkat 4 Fable 5.1:** mati (usulan) atau nyala untuk banding.
4. **Pencarian web untuk orisinalitas** (biaya tambahan per scan): ya/tidak.
5. **Bahasa ketiga:** situs .es — tambah Spanyol nanti atau tetap ID + EN.
6. **Retensi bawaan:** 90 hari (sekarang) atau lain.

---

## 19. ascan.es — bisnis kembar dengan wajah, kata, dan CSS yang berbeda 100 %

Perintah pemilik, 7 Nov 2026:

> „untuk ascan.es bikin bisnis yg sama dengan xscan.es tp dengan kata2 yg berbeda, bentuk berbeda, pokoknya beda
> kalimatnya 100%. Pastikan ke dua report nya super premium, jgn sampe duplikate, pembayaran sama, logo berbeda, pokoknya
> bikin lebih full animasi ke duanya dan tetep dynamic page dari admin, warna berbeda, pokoknya bikin jgn sampe css dan
> kata2nya ada kemiripan“

### 19.1 Yang sama dan yang berbeda

| Sama (satu kode, diuji sekali) | Berbeda total (lapisan merek) |
|---|---|
| Mesin deteksi, kaskade, Smart Router (§8) | Nama, kepanjangan, slogan, logo (SVG digambar terpisah), favicon, gambar OG |
| Dompet kredit, reservasi, rekonsiliasi (§9) | Palet warna, tipografi, ikon, bentuk komponen (radius, bayangan, garis) |
| **Pembayaran sama**: gateway, rekening, alur verifikasi, invoice (nomor invoice berawalan per merek) | Struktur halaman: urutan bagian, tata letak, URL/slug (mis. xscan `/cara-kerja` ↔ ascan `/metodo`) |
| Rubrik dan kategori sebagai data | **Setiap kalimat** di UI, halaman publik, e-mail, laporan, FAQ, kebijakan, dan artikel ditulis terpisah |
| Keamanan, R2 Store, cadangan | Desain laporan (§19.3) dan sistem animasi (§19.4) |
| Portal admin (fungsi) | Data member terpisah per merek (bucket R2 sendiri: `ascan-data`, `ascan-uploads`, `ascan-backups`) supaya setiap situs bisa dijual sendiri |

Bahasa ascan.es: **Spanyol + Inggris** (domain .es, aturan ekosistem), xscan.es tetap **Indonesia + Inggris**. Versi
Inggris kedua situs ditulis terpisah dan tidak boleh mirip.

Identitas usulan (bisa diganti pemilik):
- **xscan.es** — „Telaah“: biru tinta + teal, nuansa kertas laporan resmi, serif untuk judul; animasi kalimat diberi warna.
- **ascan.es** — „Análisis con lupa“: kepanjangan **A**uditoría de **S**ignos, **C**alidad y **A**utoría de **N**arrativas;
  palet ungu-ametis + jingga koral di latar gelap, sans geometris; logo lensa/lupa bersudut; animasi gelombang pemindai
  dan partikel huruf.

### 19.2 Halaman dinamis dari admin (kedua situs)

Semua halaman publik (beranda, metode/cara kerja, harga, FAQ, tentang, kebijakan, artikel, alat) disusun dari **blok**
yang disimpan di R2 dan diedit di Admin → Halaman: hero, fitur, langkah, pratinjau laporan, testimoni (hanya yang
nyata), harga, FAQ, CTA, teks bebas, artikel terkait. Setiap blok punya versi ID/EN (xscan) atau ES/EN (ascan),
pratinjau sebelum terbit, riwayat versi dan kembalikan, jadwal terbit. Isi bawaan berasal dari repo (dibuat saat
pertama deploy, `createOnce`), lalu admin yang memegang. Menu dan kaki halaman juga diatur dari admin.

### 19.3 Laporan super premium, tidak saling menduplikasi

| | xscan.es | ascan.es |
|---|---|---|
| Bentuk | dokumen resmi A4: kop, nomor laporan, tabel rubrik, cap verifikasi, QR | dasbor analitik: kartu skor melingkar, peta panas kalimat, garis waktu analisis, lencana keyakinan, QR di kartu akhir |
| Urutan | identitas → ringkasan → komposisi AI/manusia → kalimat bertanda → rubrik → bahasa → rekomendasi → keterbatasan | skor utama → „mengapa skor ini“ → peta panas → dimensi (isi, gaya, struktur, sumber, SEO) → saran per paragraf → metode & batas |
| Tipografi & warna | serif + biru tinta | sans geometris + ametis/koral |
| Teks | kalimat ditulis untuk xscan | kalimat ditulis untuk ascan, berbeda seluruhnya |
| Cetak/PDF | 2 halaman A4 rapi | tata letak cetak sendiri (lanskap untuk dasbor, potret untuk lampiran) |

Animasi laporan di layar (keduanya): angka menghitung naik, kalimat muncul berurutan, grafik digambar — hanya sekali,
tidak mengganggu membaca, dimatikan oleh `prefers-reduced-motion`, dan tidak ada di versi cetak.

### 19.4 Animasi penuh (keduanya, masing-masing gaya sendiri)

- xscan: tinta mengalir pada garis bawah judul, kartu terangkat lembut, sorot kalimat bergulir, transisi halaman
  menyamping seperti membalik kertas.
- ascan: berkas pemindai melintas di hero, partikel huruf yang tersusun menjadi kata, kartu kaca dengan pantulan
  bergerak, transisi melebur.
- Aturan bersama: animasi tidak menutupi isi atau iklan, CSS/JS ringan (LCP < 2 s di ponsel), hormati
  `prefers-reduced-motion`, tanpa gambar makhluk bernyawa (aturan ekosistem §1 no. 9).

### 19.5 Penjaga „tidak mirip“ (CI, wajib lulus sebelum deploy)

- **Teks:** setiap string UI, blok halaman bawaan, templat e-mail/laporan, dan artikel xscan dibandingkan dengan ascan
  dalam bahasa yang sama (Inggris ↔ Inggris): kemiripan *shingle* 6 kata > 3 % → gagal; judul artikel yang maknanya sama
  → gagal (daftar topik ascan berbeda dari 70 topik xscan §16.4).
- **CSS:** stylesheet terpisah per merek; tidak ada nama kelas, variabel warna, atau deklarasi yang sama di luar reset
  dasar; uji membandingkan token warna dan deklarasi (> 5 % sama → gagal).
- **Logo dan gambar:** berkas berbeda (hash), bentuk berbeda.

### 19.6 Arsitektur kode

```
detektor-artikel/src/brands/xscan/  copy.id.ts copy.en.ts theme.css motion.js logo.svg report.ts pages.ts
detektor-artikel/src/brands/ascan/  copy.es.ts copy.en.ts theme.css motion.js logo.svg report.ts pages.ts
```

Worker yang sama dibangun dua kali (`wrangler.jsonc` env `xscan` dan env `ascan`), merek dipilih saat build (bukan dari
header permintaan), binding R2 berbeda per env. Admin satu fungsi, dua instans terpisah. AdSense ascan.es: akun utama
**ca-pub-9433622530024776** + 16 akun (`adsense-stack.json`); verifikasi Sedo sudah di DNS.

### 19.7 Artikel ascan.es

70 artikel **ES + EN** dengan topik yang **berbeda** dari xscan.es (bukan topik yang sama ditulis ulang), misalnya:
redacción en español (RAE, tildes, puntuación), escritura académica en universidades de habla hispana (TFG/TFM, normas
APA en español), periodismo y verificación en español, SEO en español, IA en la enseñanza secundaria y bachillerato,
concursos literarios y certámenes de ensayo en España y Latinoamérica, comunicación institucional y administración
pública. Daftar lengkap ditulis saat fase A0.

### 19.8 Tahapan ascan.es

| Fase | Isi |
|---|---|
| A0 | Lapisan merek (`src/brands/`), env build kedua, bucket R2 ascan, AdSense + halaman wajib (Aviso legal, Privacidad, Cookies, Términos), penjaga kemiripan CI |
| A1 | Halaman dinamis dari admin (§19.2) untuk kedua situs |
| A2 | Desain + animasi + laporan premium ascan (§19.3–19.4) dan penyegaran xscan |
| A3 | Artikel ES/EN bertahap + alat gratis versi ascan |
| A4 | Fase X1–X7 berlaku untuk kedua merek (satu mesin) |

---

## 20. Kuota gratis 10 halaman per minggu, anti-curang, dan iklan di area member

Perintah pemilik, 7 Nov 2026 (berlaku untuk xscan.es dan ascan.es):

> „Ascan.es dan xsca.es bikin gratis 10 halaman / minggu, reset setiap minggu, dan berikan jika sisa kuota halaman
> melebihi kuota dan saran kan untuk isi saldo, untuk gratis gunakan teknologi yg paling murah, haiku yg paling murah to
> tetep optimal, dan sarankan untuk berbayar jika ingin mendapatkan hasil yg lebih memuaskan, kembangin dulu logika ini
> agar lebih ketat dan member yg kuota halaman sisa sedikit namun upload banyak, atau di rata2 perkata di setiap halaman,
> agar client tidak upload halaman super panjang, maximal kertas legal, coba kembangkan dulu agar perusahaan tidak rugi,
> client tidak curang. Dan client bisa berlama2 di dalam, agar iklan dari adsense nanti nya bisa sisipkan di situ“

### 20.1 Satu „halaman“ diukur dari teks, bukan dari berkas

Jumlah halaman berkas (PDF/DOCX) **tidak dipercaya**: satu halaman bisa diperkecil hurufnya atau dipanjangkan. Yang
dihitung adalah **halaman normal** dari teks yang benar-benar dikirim ke model:

> 1 halaman normal = kertas **Legal** (8,5 × 14 inci), satu spasi, huruf 12 pt = **maks. 700 kata, atau 4.800 karakter
> (termasuk spasi), atau 1.600 token masukan — mana pun yang tercapai lebih dulu.**

`halaman = max(⌈kata/700⌉, ⌈karakter/5.600⌉, ⌈token/1.600⌉)` (5.600 karakter: satu halaman 700 kata bahasa Indonesia tidak terhitung dua), minimal 1 per pemeriksaan.

- Tiga ukuran sekaligus menutup celah: kata yang sangat panjang (karakter), teks tanpa spasi atau penuh simbol
  (karakter dan token), bahasa yang boros token (token).
- Teks dinormalkan dulu: spasi/baris kosong berlebih dipadatkan; teks tersembunyi DOCX (vanish, putih di atas putih,
  huruf < 4 pt) **tidak dianalisis dan tidak dihitung**, dan laporan menyebutnya („teks tersembunyi diabaikan“).
- Semua angka (700 / 4.800 / 1.600, minimal 1) diatur di Admin → Kuota gratis.

### 20.2 Kuota gratis

| Aturan | Nilai bawaan (diatur admin) |
|---|---|
| Kuota | **5 halaman normal per minggu** per akun terverifikasi — pemilik, 8 Nov 2026 („sudah sy rubah gratis 5 halaman perminggu“); awalnya 10. Angka ini hanya hidup di `k/free.json` (Admin → Kuota gratis) dan bawaan kode `DEFAULT_FREE`; semua teks member membacanya |
| Reset | setiap **Senin 00.00** waktu lokal situs (xscan.es: WIB, Asia/Jakarta; ascan.es: Europe/Madrid); tidak menumpuk ke minggu berikutnya, tidak bisa ditukar menjadi saldo, tidak bisa dipindahkan |
| Maks. per pemeriksaan | 5 halaman (dokumen panjang tidak bisa menghabiskan kuota dalam satu kali tanpa sadar) |
| Minimal per pemeriksaan | 1 halaman (memecah naskah menjadi potongan kecil tidak menghemat kuota) |
| Naskah sama dalam 7 hari | hasil lama ditampilkan, **0 halaman** (jujur kepada member, dan tidak membayar AI dua kali) |
| Batas laju | 5 pemeriksaan gratis per jam per akun; 20 per hari per jaringan |

**Bila naskah lebih panjang dari sisa kuota** (mis. naskah 14 halaman normal, sisa 3), sistem **tidak memotong diam-diam**.
Layar pratinjau menulis: butuh 14 halaman, sisa kuota 3, reset Senin 00.00 (tanggal), lalu tiga pilihan:
1. **Periksa 3 halaman pertama gratis** — laporan diberi tanda jelas „Sebagian: halaman 1–3 dari 14“;
2. **Isi saldo dan periksa semuanya** — perkiraan biaya per mesin (§8), kekurangan saldo, tombol Isi saldo (§9.4);
3. **Tunggu reset** — tanggal dan jam reset.

Bila sisa kuota ≤ 2 halaman, beranda member menampilkan pengingat yang sopan dengan saran isi saldo.

**Notifikasi naskah > kuota** (pemilik, 7 Nov 2026: „Berikan notif jika halaman yg di upload melebihi 10 halaman,
jika menggunakan kuota gratis“ — angka mengikuti kuota yang diatur admin, sekarang 5): begitu teks selesai diekstrak — sebelum apa pun dikirim ke AI — naskah yang lebih dari
**10 halaman normal** (seluruh kuota gratis seminggu) memunculkan pemberitahuan di layar pratinjau dan di daftar unggahan
massal per berkas: jumlah halaman normalnya, bahwa kuota gratis mingguan hanya 10 halaman (maks. 5 per pemeriksaan),
lalu tiga pilihan §20.2 dengan biaya Cek Lengkap untuk seluruh naskah dan tombol Isi saldo. Pemberitahuan yang sama
dikirim ke kotak notifikasi member, supaya tetap terlihat bila tab ditutup.

### 20.3 Mesin untuk pemeriksaan gratis: Haiku saja, satu lintasan

„Cek Gratis“ memakai **Claude Haiku 5.5** (`claude-haiku-5-5`, model termurah — US$0,10 / US$0,50 per 1 juta token),
**tanpa eskalasi** ke Sonnet/Opus. Pemilik, 7 Nov 2026: „Pastikan hanya menggunakan haiku yg paling murah yg menghampiri
gratis di kuota gratis member“ — dikunci di kode, bukan hanya di setelan:

- router mode gratis hanya menerima model Haiku yang aktif dengan harga termurah di daftar admin; Sonnet, Opus dan Fable
  tidak pernah menjadi kandidat, juga tidak sebagai fallback;
- bila Haiku sedang tidak tersedia, pemeriksaan gratis menunggu di antrean (pesan jujur) — tidak dialihkan ke model mahal;
- admin tidak bisa memilih model lain untuk mode gratis (validasi server); setiap panggilan gratis dicatat dengan modelnya
  dan uji e2e memeriksa tidak ada panggilan non-Haiku.

Isi Cek Gratis:

- satu lintasan per halaman normal, keluaran terstruktur: label AI/campuran/manusia **per paragraf**, persen keseluruhan,
  tiga kalimat yang paling „AI“, lima kesalahan bahasa teratas, tiga saran;
- prompt sistem di-*cache* (prompt caching); `max_tokens` keluaran dibatasi 900 per halaman; effort `low`;
- bila keyakinan rendah, laporan mengatakannya dan menyarankan Cek Lengkap (berbayar).

Perkiraan biaya maksimum dari harga daftar (biaya nyata dicatat per panggilan di `ai_usage`):
`masukan ≤ 2.800 token × US$0,10/1 jt + keluaran ≤ 900 token × US$0,50/1 jt ≈ US$0,0007 per halaman` →
**± US$0,007 per member per minggu** bila kuota habis dipakai.

**Cek Lengkap (berbayar)** — yang disarankan di setiap hasil gratis: kaskade Haiku → Sonnet → Opus (§8), analisis **per
kalimat**, rubrik dan laporan kategori A–J, kemiripan antar-naskah, QR verifikasi, ekspor DOCX/XLSX, **tanpa iklan**.
Hasil gratis menampilkan perbandingan singkat keduanya — tanpa membesar-besarkan akurasi.

### 20.4 Perusahaan tidak rugi

| Penjaga | Cara kerja |
|---|---|
| Anggaran gratis harian perusahaan | Admin menetapkan batas biaya AI untuk semua pemeriksaan gratis per hari (bawaan US$5 ≈ 7.000 halaman). Bila tercapai, pemeriksaan gratis baru masuk antrean hari berikutnya dengan pesan jujur; pemeriksaan berbayar tidak terpengaruh |
| Reservasi kuota | halaman gratis direservasi secara atomik (CAS pada `free/{uid}/{minggu}`) sebelum API dipanggil; dikembalikan bila proses gagal |
| Tidak ada eskalasi gratis | Haiku saja; tidak ada lintasan kedua |
| Batas keluaran | `max_tokens` dan jumlah bagian laporan dibatasi |
| Laporan | biaya gratis per hari, per situs, dan per sumber pendaftaran tampil di Admin → Biaya, berdampingan dengan pendapatan iklan yang dimasukkan admin, supaya terlihat apakah kuota gratis masih untung |

### 20.5 Member tidak curang

| Celah | Penutup |
|---|---|
| Banyak akun untuk banyak kuota | e-mail wajib diverifikasi; domain e-mail sekali pakai ditolak; Turnstile saat daftar dan setiap pemeriksaan gratis; maks. 2 akun baru per jaringan + perangkat (hash bergaram dari IP /24 dan user-agent, disimpan 30 hari) yang menerima kuota gratis per minggu — akun berikutnya bisa dipakai, tetapi tanpa kuota gratis |
| Halaman super panjang | halaman normal §20.1 |
| Memecah dokumen | minimal 1 halaman per pemeriksaan |
| Teks tersembunyi / trik format | teks dinormalkan; teks tersembunyi dibuang dan dilaporkan |
| Membuka banyak pemeriksaan bersamaan | reservasi atomik: dua permintaan bersamaan tidak memakai sisa kuota yang sama |
| Menyalahgunakan hasil gratis sebagai sertifikat | laporan gratis bertanda air „Cek Gratis“, tanpa tanda tangan JSON, QR menyebut statusnya |

### 20.6 Member betah di dalam, dan iklan yang patuh kebijakan

Agar member mau berlama-lama, area member gratis diberi **konten yang benar-benar berguna** — dan di halaman berisi
konten itulah loader AdSense dipasang (Auto ads):

| Halaman | Isi | Iklan |
|---|---|---|
| Beranda member gratis | sisa kuota, riwayat, „tips minggu ini“, artikel yang relevan dengan hasil terakhir | ya |
| **Ruang Belajar** (xscan) / **Sala de estudio** (ascan) | artikel §16/§19.7, panduan menulis, latihan kalimat efektif, alat gratis §16.3 | ya |
| Laporan Cek Gratis | hasil + „Cara membaca laporan ini“ + saran perbaikan per temuan + artikel terkait | ya |
| Layar unggah / formulir pemeriksaan baru | — | **tidak** |
| Layar menunggu proses | progres + tautan „baca sambil menunggu“ ke Ruang Belajar | **tidak** (Google melarang iklan di layar tanpa konten penerbit) |
| Isi saldo, pembayaran, invoice, masuk/daftar/2FA, pengaturan, error, cetak/PDF, admin | — | **tidak** |
| Semua halaman member berbayar | — | **tidak** (bebas iklan = salah satu alasan berbayar) |

Kepatuhan AdSense untuk iklan di balik login:
- atur **akses crawler** di AdSense (Pengaturan → Akses & otorisasi → Akses crawler) dengan akun khusus agar iklan
  relevan dengan isi halaman;
- iklan diberi label („Iklan“ / „Publicidad“), tidak menempel pada tombol, tidak ada ajakan mengeklik iklan, tidak ada
  waktu tunggu buatan atau progres palsu untuk menahan member;
- Auto ads saja; loader hanya dirender di halaman bertanda „boleh iklan“ di kode (daftar putih), diuji e2e: halaman yang
  dilarang tidak memuat loader.

### 20.7 Admin

Admin → Kuota gratis: halaman per minggu, ukuran halaman normal (kata/karakter/token), maks./min. per pemeriksaan, hari
dan jam reset + zona waktu, batas laju, akun per jaringan, anggaran gratis harian, daftar domain e-mail sekali pakai,
saklar Cek Gratis per situs. Setiap perubahan masuk audit log. Laporan: pemakaian kuota per minggu, biaya gratis, konversi
gratis → berbayar.

### 20.8 Uji (wajib lulus sebelum tayang)

Hitung halaman normal (kata, karakter, token, teks tersembunyi) · reset mingguan di batas zona waktu · naskah > sisa kuota
(tiga pilihan, laporan sebagian bertanda) · dua pemeriksaan bersamaan dengan sisa 1 halaman (hanya satu lolos) ·
anggaran harian habis (antrean, berbayar tetap jalan) · akun ketiga dari jaringan yang sama (tanpa kuota) · Haiku saja
di mode gratis (mock Anthropic memastikan tidak ada panggilan Sonnet/Opus) · loader hanya di halaman yang diizinkan.

### 20.9 Prediksi biaya kuota gratis (pemilik, 7 Nov 2026)

Pemilik: „buatkan prediksi habis berapa rupiah/berapa token untuk gratis member 10 halaman, dan logika jika 100 member
menggunakan setiap minggu“.

Dihitung dengan fungsi harga aplikasi sendiri (`src/engine/pricing.ts`, nilai bawaan `src/data/settings.ts`): kurs
**Rp16.500 per US$**, **1 token internal = US$0,001 biaya API**, markup bawaan **20×** (harga jual 1 token = Rp330), harga
Claude Haiku 5.5 **US$0,10 masukan / US$0,50 keluaran / US$0,01 baca-cache per 1 juta token**.

**Satu halaman normal, Cek Gratis (Haiku, satu lintasan):**

| Kasus | Token AI masukan | Token AI keluaran | Biaya | Rupiah | Token internal |
|---|---|---|---|---|---|
| Khas (±500 kata, prompt sistem dari cache) | 1.000 + 1.200 dari cache | 600 | US$0,00041 | ±Rp7 | 1 |
| Terburuk (halaman Legal penuh, tanpa cache, keluaran maksimum) | 2.800 | 900 | US$0,00073 | ±Rp12 | 1 |

Sebagai pembanding, mode „Haiku“ yang sudah ada di aplikasi (analisis per kalimat, dua lintasan) memakai rata-rata
5 token untuk 700 kata. Cek Gratis satu lintasan 7–12× lebih murah; karena itu kuota gratis memakai desain ini, bukan
mode Haiku penuh.

**Satu member, kuota penuh 10 halaman per minggu:**

| | Khas | Terburuk |
|---|---|---|
| Biaya API per minggu | US$0,0041 → **Rp68** | US$0,0073 → **Rp120** |
| Token internal | 5 token | 8 token |
| Nilai jual setara (markup 20×, Rp330 per token) | ±Rp1.650 | ±Rp2.640 |

Nilai jual setara ditampilkan kepada member („kuota gratis Anda minggu ini senilai ±Rp2.640“), supaya ajakan berbayar
terasa wajar.

**Logika 100 member (dan skala lebih besar), semua menghabiskan 10 halaman setiap minggu:**

| Member aktif per minggu | Biaya per minggu (khas – terburuk) | Biaya per bulan (×52/12, terburuk) |
|---|---|---|
| 100 | Rp6.798 – **Rp12.045** | ±**Rp52.195** |
| 1.000 | Rp67.980 – Rp120.450 | ±Rp521.950 |
| 10.000 | Rp679.800 – Rp1.204.500 | ±Rp5.219.500 |

Kenyataannya lebih kecil: tidak semua member memakai seluruh kuota, naskah yang sama dalam 7 hari tidak dihitung lagi,
dan prompt sistem dibaca dari cache.

**Kapan biaya gratis tertutup (titik impas):**

- **Dari penjualan:** paket terkecil Starter 300 token = Rp99.000 dengan modal API maksimum Rp4.950 (laba kotor ±Rp94.050
  sebelum biaya gateway). Satu pembelian Starter per bulan menutup biaya gratis **±180 member aktif** dalam kasus terburuk
  (Rp94.050 ÷ Rp521,95 per member per bulan). Jadi cukup ±0,6 % member gratis yang membeli Starter sekali sebulan.
- **Dari iklan:** biaya terburuk Rp120 per member per minggu. Tayangan halaman ber-iklan yang dibutuhkan per member per
  minggu = `120 ÷ (RPM ÷ 1.000)`. RPM sebenarnya baru diketahui dari laporan AdSense; sebagai **contoh hitungan saja**:
  RPM Rp5.000 → 24 tayangan; RPM Rp15.000 → 8 tayangan; RPM Rp30.000 → 4 tayangan per minggu.
- **Anggaran gratis harian** bawaan US$5 = 6.849 halaman terburuk per hari = kuota mingguan ±4.800 member. Untuk 100
  member kebutuhan nyatanya hanya ±US$0,10 per hari; admin bisa menurunkan anggaran ke angka yang dipilih, dan dasbor
  Admin → Biaya menampilkan biaya gratis nyata per hari dan per minggu dari `ai_usage`, berdampingan dengan prediksi ini.

Semua angka berubah otomatis bila admin mengubah harga model, kurs, satuan token, markup (5–500×), atau ukuran halaman
normal: tabel ini dibuat dari rumus yang sama dan tampil di Admin → Kuota gratis sebagai „Prediksi biaya“.

Fase: masuk **X1** (sebelum ascan.es A0 tayang), untuk kedua merek.

### 20.10 Kuota gratis dinamis dari admin (pemilik, 7 Nov 2026) — ✅ dibangun

„Untuk gratis halaman sifatnya dynamic page ya, bisa d rubah dr portal admin, misal admin mau rubah 5 halaman perminggu,
atau 10 halaman perbulan, untuk gratis member, pastikan ketika admin rubah, semua ikut berubah jgn sampai ada miss dan
konflik, pastika dynamic page“.

- **Satu dokumen** `k/free.json` (`getFree`/`normalizeFree` di `src/data/settings.ts`): nyala/mati, halaman per **minggu
  atau bulan**, ukuran halaman normal (kata/karakter/token), maks. per pemeriksaan, anggaran harian, zona waktu reset.
- Dibaca di setiap permintaan, tanpa cache dan tanpa salinan angka di tempat lain. Prediksi biaya (Admin → Biaya API dan
  Admin → Kuota gratis) sudah membacanya; penegakan kuota, notifikasi > kuota, dan teks halaman publik/member di fase X1
  wajib membaca dokumen yang sama (tidak boleh menulis angka „10“ di teks).
- **Konflik dicegah di server:** setiap isian dibatasi; maks. per pemeriksaan tidak pernah melebihi kuota satu periode;
  periode/zona waktu yang tidak dikenal kembali ke bawaan.
- Setiap perubahan masuk audit log (nilai sebelum dan sesudah).
- Uji: unit (5/minggu, 10/bulan, halaman lebih kecil, isian bertentangan) dan e2e (admin menyimpan → Biaya API ikut berubah).

### 20.11 Cek Gratis X1 — ✅ dibangun (8 Nov 2026)

Pemilik, 8 Nov 2026: „untuk gratis kasih tanda air dengan logo domain“.

- **Penegakan kuota** (`src/data/free.ts`): halaman normal dari teks; dokumen CAS `free/{uid}/{periode}.json`, cadangan
  idempoten per pemeriksaan, kembali utuh bila pemeriksaan gagal; e-mail sekali pakai ditolak; maks. 2 akun per jaringan
  (IP /24 + perangkat) per periode; anggaran gratis harian (`k/free-spend/{tanggal}.json`) — bila habis, Cek Gratis
  menunggu hari berikutnya, Cek Lengkap tetap jalan.
- **Pemberitahuan** bila naskah > sisa kuota atau > maks. per pemeriksaan (409, kotak `[data-free-choice]`): periksa N
  halaman pertama gratis (laporan ditandai „sebagian: N dari M halaman“), periksa semuanya dengan Cek Lengkap (token),
  isi saldo, atau tunggu tanggal kuota baru. Persetujuan („Saya berhak…“) tetap tercentang saat formulir tampil lagi.
- **Mesin**: hanya Haiku termurah (`freeModel`), effort low, satu lintasan per paragraf, tanpa rubrik, tanpa eskalasi.
  Perkiraan token di formulir = 0; laporan gratis tidak menyebut token (kepala: „Cek Gratis · N halaman kuota“), tanpa
  rincian token dan tanpa unduhan JSON (403). Biaya API nyata tetap dicatat untuk admin (Biaya API, anggaran harian).
- **Tanda air logo domain** di setiap halaman laporan gratis: berkas pemilik (logo xscan.es yang dipudarkan) →
  `public/assets/watermark.webp` (+ `watermark-tile.webp`). Layar: ubin logo miring di bawah teks, bergerak pelan
  (berhenti bila `prefers-reduced-motion`). Cetak/PDF: satu logo besar `position: fixed` di setiap lembar. Label
  „CEK GRATIS“ dengan lencana logo di kepala laporan. ascan.es memakai logonya sendiri lewat konstanta `WATERMARK`.
- **Iklan**: loader AdSense hanya di laporan Cek Gratis (`ads: true`); halaman itu satu-satunya di area member yang
  mendapat CSP publik (penanda internal `x-ads-page`, diperiksa pola URL laporan). Formulir, layar proses, cetak, token,
  pembayaran, admin dan laporan berbayar tetap tanpa loader dan dengan CSP ketat. Pilihan Cek Gratis memberi tahu bahwa
  laporannya memuat iklan dan tanda air.
- **Uji**: unit `test/free.test.ts`; e2e dengan kuota pemilik 5/minggu (5 → 4 → 0, pemberitahuan naskah 8 halaman,
  sebagian 4 dari 8, pilihan gratis nonaktif saat habis, hanya Haiku effort low di mock, tanda air di setiap halaman +
  cetak, satu loader di laporan gratis, nol loader di formulir/cetak); admin mengubah ke 10/minggu dan 10/bulan → prediksi
  biaya ikut berubah.
- Berikutnya: beranda member gratis dan Ruang Belajar sebagai halaman konten ber-iklan (§20.6), laporan pemakaian kuota
  dan konversi gratis → berbayar di admin (§20.7).

---

## 21. Pengetatan mesin: tidak bocor biaya, tidak melebar

Perintah pemilik, 7 Nov 2026: „Perketat logika engine agar tidak bocor dan tidak melebar kemana2, tetep focus dan
memberikan hasil memuaskan ke customer, jgn sampe ada kebocoran biaya baik dari engine maupun dari kecurangan member,
perketat“.

### 21.1 Yang sudah ada (diaudit dari kode, 7 Nov 2026)

| Penjaga | Tempat |
|---|---|
| Token direservasi dulu sebesar **biaya terburuk** (`hardBoundUsd`) sebelum API dipanggil; uji tidak-rugi pada markup 5× dengan diskon 50 % dan komisi terbesar | `checks.ts`, `pricing.ts`, `engine.test.ts` |
| Biaya yang ditagih tidak melebihi reservasi; sisa dikembalikan idempoten | `cascade.ts` `settleCheck`, `wallet.ts` |
| `max_tokens` di setiap panggilan; jawaban terpotong **tidak diulang** (biaya tidak berlipat); maks. 4 percobaan dengan jeda bertambah; retry SDK 2 | `claude.ts`, `cascade.ts` |
| Opus hanya untuk maks. 40 kalimat yang diragukan (bukan seluruh naskah) | `settings.ts` `maxOpusSentences` |
| Naskah adalah **data**, bukan instruksi; upaya „abaikan instruksi“ ditandai `injection` | prompt sistem `claude.ts` |
| Karakter tak terlihat dibuang sebelum analisis | `preprocess.ts` |
| Maks. 20.000 kata per pemeriksaan; 30 pemeriksaan per jam; maks. pemeriksaan bersamaan per member | `checks.ts` |
| Peringatan rugi otomatis bila pendapatan < biaya nyata | `settleCheck` → `i/loss/` + audit |

### 21.2 Ditambah 7 Nov 2026 — ✅ dibangun dan diuji

| Celah | Penutup |
|---|---|
| Naskah/judul/penulis menulis `</naskah>` untuk keluar dari blok data | tag `<naskah>`, `<rubrik>`, `<target>`, `<konteks>` dipagari menjadi `‹naskah>` (teks tetap terbaca) |
| Genre dan jenjang berupa 30 karakter bebas di blok `<konteks>` di luar data | hanya nilai dari daftar resmi; selain itu `general`/`unknown` |
| Batas biaya harian dicek hanya dari pemeriksaan yang **sudah selesai**; banyak pemeriksaan bersamaan bisa melewatinya | gerbang menghitung juga **biaya terburuk semua pemeriksaan yang sedang berjalan** (`i/active/` menyimpan `worst`) |
| Pemeriksaan gagal tidak ditagih → member bisa sengaja membakar biaya AI | gagal setelah biaya AI terpakai dihitung; **3 kali dalam 24 jam → pemeriksaan baru dijeda**, audit `costly_failures` untuk admin |

Uji: `test/guards.test.ts` (4 uji) + e2e.

### 21.3 Fokus dan mutu hasil (tidak melebar)

- Setiap tahap model menjawab dengan **skema JSON terstruktur**; jawaban yang tidak sah tidak dipakai.
- Prompt hanya meminta penilaian yang diminta tahap itu; naskah tidak bisa menambah tugas.
- Mode gratis dikunci ke Haiku termurah (§20.3), tanpa eskalasi.
- Berikutnya (X1): batas waktu total per pemeriksaan; laporan menandai bagian yang dilewati alih-alih gagal seluruhnya
  (agar member tetap mendapat hasil, dan biaya tidak terbuang).

---

## 22. Global: delapan bahasa, mesin multi-bahasa, bahasa bawaan menurut negara

Perintah pemilik, 7 Nov 2026:

> „Gunakan beberapa bahasa, Indonesia Inggris Spanyol, Arab, German & Perancis, china dan India, dan untuk kemampuan engine
> multi bahasa seluruh dunia...pastikan ketika client merubah ke bhs lain, jgn pernah berubah sebelum d rubah manual oleh
> member di halaman manapun.. Catat bahwa project ini tidak hanya untuk Indonesia, tp global. Pembayaran lihat rekening di
> ulyah.com dan perhatikan upload manual client setelah membayar termasuk invoice... Hanya Indonesia defoul bahasa
> Indonesia, jika terdeteksi negara luar pastika defoultnya bahasa inggris“

**xscan.es dan ascan.es adalah produk global, bukan hanya untuk Indonesia.**

### 22.1 Bahasa bawaan dan pilihan manual — ✅ dibangun

- Urutan: **pilihan manual member** (akun, lalu cookie `tl_lang`) → bila belum pernah memilih, **negara pengunjung**
  (Cloudflare `cf-ipcountry`): Indonesia → bahasa Indonesia, **negara lain → bahasa Inggris**.
- Tombol bahasa di halaman publik dan portal menyimpan pilihan (`/lang?to=…&next=…`); setelah itu bahasa **tidak pernah
  berubah sendiri di halaman mana pun** sampai member memilih lagi.
- **Crawler tidak pernah dialihkan** (Googlebot, AdSense, Bing, dan sejenisnya), sehingga setiap versi bahasa tetap
  terindeks; hreflang menautkan semua versi. Pengalihan hanya untuk manusia (302).
- Uji e2e: pengunjung AS → `/en`; memilih Indonesia → tetap Indonesia di halaman lain walau negaranya AS; pengunjung
  Indonesia → Indonesia; memilih English → tetap English; Googlebot → tidak dialihkan.

### 22.2 Delapan bahasa antarmuka — ⏳ fase G1–G3

Bahasa: **Indonesia (id), Inggris (en), Spanyol (es), Arab (ar), Jerman (de), Prancis (fr), China (zh), Hindi (hi)**.

| Fase | Isi |
|---|---|
| G1 | Pindah dari pasangan `tr(L, id, en)` (1.175 teks) ke kamus per bahasa (`i18n/<lang>.ts`) dengan kunci; uji: setiap kunci ada di kedua bahasa lama; tidak ada perubahan tampilan |
| G2 | Teks enam bahasa baru **ditulis** (bukan terjemahan mesin otomatis yang ditempel tanpa diperiksa), diperiksa per bahasa; arah kanan-ke-kiri untuk Arab (`dir="rtl"`, tata letak dicerminkan); huruf Noto Sans Arabic / SC / Devanagari; format angka, tanggal, mata uang per bahasa; uji: setiap kunci ada di delapan bahasa |
| G3 | Halaman publik per bahasa dengan alamat sendiri (`/es/…`, `/ar/…`, …), hreflang untuk delapan bahasa + `x-default`, sitemap per bahasa; menu bahasa memuat delapan bahasa; bahasa bawaan per negara diperluas (mis. negara berbahasa Spanyol → es, negara Arab → ar, Jerman/Austria/Swiss-Jerman → de, Prancis/Belgia-Prancis → fr, China/Taiwan/Hong Kong/Singapura → zh, India → hi atau en, selain itu → en) — selalu kalah oleh pilihan manual |

Laporan, rubrik, e-mail, invoice, dan pesan error ikut kamus yang sama. Bahasa laporan bisa dipilih terpisah dari bahasa
antarmuka.

### 22.3 Mesin multi-bahasa seluruh dunia — ⏳ fase G4

- Sekarang: deteksi bahasa naskah `id`/`en`; bahasa lain ditolak dengan jujur.
- G4: pengenal bahasa untuk semua bahasa utama dunia; tahap Claude (Haiku/Sonnet/Opus) bekerja di bahasa naskah; sinyal
  stilometri dan ambang dikalibrasi **per bahasa** dengan set uji berlabel; bahasa tanpa kalibrasi diberi label
  „beta — akurasi belum diukur“ di laporan, tidak pernah diklaim setara.
- Delapan bahasa antarmuka dikalibrasi lebih dulu, lalu bahasa lain menurut permintaan.

### 22.4 Pembayaran global — ✅ sudah ada, dicatat

- Rekening bawaan sama dengan ulyah.com (BNI multicurrency „wondr“), IDR dan USD; invoice bernomor; member mengunggah
  bukti transfer; admin menyetujui; token masuk tepat sekali (diuji e2e).
- Ke depan (X6): gateway otomatis + PayPal untuk pembeli luar negeri; harga USD di halaman berbahasa selain Indonesia.


---

## 23. Panduan A–Z bersuara untuk member dan admin (pemilik, 8 Nov 2026) — ✅ dibangun

> „Buatkan panduan penggunaan xscan dan ascan secara detail dengan bahasa yg paling mudah d mengerti pengguna, gunakan
> voice juga … sampai ke pengisian saldo, konversi saldo, penggunaan token, upload file dll, dari A-Z … 2 bahasa
> Indonesia dan inggris termasuk voice nya“ · „Termasuk panduan untuk admin“

- **Member** — `/panduan` dan `/en/guide` (publik, terindeks, di menu atas, kaki halaman, dan menu samping portal):
  21 bagian A–U dari kenalan, daftar, Cek Gratis, token, beli paket (transfer + unggah bukti), bayar dari luar negeri,
  deposit dan tukar ke token, memasukkan naskah (tempel, unggah DOCX/PDF/RTF/HTML/TXT, ambil URL), keterangan & rubrik,
  mesin & perkiraan biaya, proses, membaca laporan, unduh/cetak/verifikasi, tinjauan, sesi lomba + sitemap, riwayat,
  afiliasi, pengaturan & 2FA, privasi, sampai mengatasi masalah. Data terstruktur `HowTo`.
- **Admin** — `/admin/panduan` (hanya admin, noindex; berisi markup, biaya, kendali = rahasia perusahaan): 12 bagian —
  prinsip, kunci API, mesin, kendali biaya & tombol darurat, harga & markup 5–500×, kuota gratis, pesanan & bukti TF,
  rekening, anggota, afiliasi, laporan/biaya/benchmark, audit & cadangan.
- **Suara**: pembaca suara bawaan peramban (Web Speech API), `id-ID` atau `en-US` mengikuti bahasa halaman, memilih
  suara alami bila ada; dibacakan per langkah, langkah aktif disorot dan digulir; „Dengarkan semua“ berlanjut sampai
  akhir; jeda, berhenti, kecepatan 0,85–1,3×; pemberitahuan bila perangkat tidak punya suara bahasa itu. Tanpa biaya.
- **Angka selalu benar**: kuota gratis, ukuran halaman, maks. per pemeriksaan, zona waktu reset, harga 1 token, komisi
  afiliasi, dan masa simpan dibaca dari Admin setiap kali halaman dibuka (`src/pages/guide-values.ts`).
- **ascan.es**: panduan ditulis ulang dengan kalimat sendiri di lapisan merek ascan (§19), bukan salinan.
- Uji e2e: 21 bagian, angka dari Admin, HowTo, suara ID dibacakan berurutan dari awal sampai akhir (mesin suara tiruan),
  satu bagian EN, sitemap, panduan admin hanya untuk admin dan noindex.

---

## 24. Fable 5.1 untuk member, keperluan laporan, dan „alat bantu, bukan pemutus“ (pemilik, 8 Nov 2026) — ✅ dibangun

> „Fable 5 udah d pasang belum, termasuk info nya … sangat mahal sekali … token cepat habis, tp make bahasa yg lebih
> elegan, dan kasih tombol anda yakin menggunakan fable 5 … penggunaan aplikasi ini pasti dari seluruh budak profesional,
> guru, panitia, organisasi, media dll bukan hanya untuk lomba, dan apakah sudah d bedakan report hasil nya, baik umum
> maupun untuk perlombaan, berikan notif bahwa xscan hanya membantu analisa dan tidak memutuskan hasil di portal member“
> · „Tp jgn di catat di laporan member kalimat seperti itu, cukup di portal member“

- **Claude Fable 5.1** (`claude-fable-5-1`, US$10/US$50 per 1 juta token, cache US$0,25; dicek dari referensi Claude API
  8 Nov 2026): mode mesin `fable` untuk Cek Lengkap. Kartu premium dengan kalimat elegan dan perbandingan biaya yang
  dihitung dari harga Admin (± kali Opus / kali Haiku). Memilihnya membuka jendela **„Anda yakin ingin memakai Claude
  Fable 5.1?“** — „Ya, saya yakin“ atau „Tidak, kembali ke AUTO“ (Esc = tidak). Server menolak Fable tanpa konfirmasi
  (`fable_ok=1` / `fableConfirm: true`). Satu model penuh seperti Sonnet/Opus, fallback sisi server aktif, tidak ditawarkan
  di sesi massal. Admin → Kendali biaya: „member boleh memilih Fable“ (bawaan nyala) terpisah dari „router boleh memakai
  Fable“ (bawaan mati), supaya router tidak pernah diam-diam beralih ke mesin termahal.
- **Keperluan laporan** (`src/lib/purpose.ts`): Umum · Pendidikan · Lomba · Media & redaksi · Organisasi. Laporan berbeda
  judul dokumen (mis. „Lembar Penilaian Naskah Lomba“, „Laporan Telaah Tugas Peserta Didik“), sebutan penulis (Peserta,
  Peserta didik, Penyusun, …), baris Keperluan, dan kolom tanda tangan (Juri + Ketua panitia, Guru pengampu, Editor +
  Pemimpin redaksi, …). Sesi massal punya keperluan sendiri (bawaan Lomba). Cache hasil memperhitungkan keperluan.
- **„Membantu, tidak memutuskan“** hanya di portal member (dasbor, formulir periksa, halaman laporan di portal) sebagai
  pemberitahuan di luar dokumen laporan; tidak pernah di laporan, halaman cetak, HTML/JSON unduhan. Kalimat sejenis di
  bagian metodologi laporan dihapus; metodologi tinggal menjelaskan cara memeriksa.
- Panduan member/admin (§23) ikut diperbarui. Uji e2e: laporan lomba, pemberitahuan hanya di portal, cetak tanpa
  pemberitahuan, jendela Fable (tidak/ya), penolakan server tanpa konfirmasi, panggilan `claude-fable-5-1` dengan fallback.
- Masih berlaku: templat laporan A–I per kategori penulis dan laporan kompetisi lengkap (J) adalah fase X3/X5.

---

## 25. PWA, notifikasi admin, mesin nyala/mati di seluruh situs, kuota gratis 1–20 (pemilik, 8 Nov 2026) — ✅ dibangun

> „Buatkan agar xscan dan ascan bisa di install di HP dengan logo gambar HP di paling atas, jika sudah d install hilangkan
> logonya, buatkan notifikasi jika ada pembayaran masuk yg belum di cek, atau ada yg baru di setiap menu masing2“ ·
> „engine bisa di on/off di portal admin, misal fable 5 di off mana seluruh website ini fable 5 di tandai comming soon atau
> off“ · „Penerapan komisi affiliate & diskon member wajib dynamic page … termasuk gratis 1-20 halaman / minggu … perubahan2
> wajib lu sesuai sampai ke panduan“

- **PWA** (`src/lib/pwa.ts`, merek dari `src/brand.ts`): manifest, service worker (hanya aset statis + halaman luring; data
  member tidak pernah di-cache di perangkat), spanduk „Pasang di HP“ di paling atas, hilang setelah terpasang.
- **Notifikasi admin** (`src/data/notify.ts`): lencana per menu tiap menit (bukti TF menunggu dicek; member/laporan/pencairan
  baru sejak menu terakhir dibuka), toast, notifikasi perangkat opsional, angka di judul tab.
- **Mesin nyala/mati** (`engineAvailability` di `src/data/controls.ts`, satu sumber): kartu mesin nonaktif tampil „Segera hadir“
  (Fable) / „Sedang nonaktif“ (Sonnet, Opus, Forensik) di formulir, halaman harga (tabel „Mesin AI yang tersedia“) dan
  panduan. **Server menolak** mode yang mesinnya dimatikan — tidak pernah dialihkan diam-diam ke mesin lain yang lebih mahal.
- **Kuota gratis 1–20 halaman** per periode dengan penggeser di Admin → Kuota gratis; maks. per pemeriksaan ikut dibatasi.
- **Panduan selalu sesuai**: kuota, ukuran halaman, harga token, **paket + diskon**, **komisi afiliasi**, status mesin dibaca
  dari Admin setiap kali halaman panduan dibuka; panduan member menambah „Pasang di HP“, panduan admin „Notifikasi“.
