# ascan.es — Blueprint penerapan (dari xscan.es, wajah 100 % berbeda)

Pemilik, 8 Nov 2026: „Jika xscan.es sudah sempurna 100% … maka jadikan blueprint sempurna untuk di terapkan di ascan.es dengan
wajah 100% yg berbeda … Jgn kerjakan ascan.es dulu tapi lanjut ke jenius.es“. Dokumen ini adalah rencana kerja ascan.es;
**belum dibangun**. Induknya: `docs/MASTER-BLUEPRINT.md` (§19 kembar ascan, §20–§25 fitur yang sudah jalan di xscan).

---

## 1. Prinsip

1. **Satu mesin, dua wajah.** Semua logika bisnis xscan.es dipakai apa adanya (diuji sekali, berlaku untuk keduanya). Yang
   berbeda total: nama, logo, warna, tipografi, tata letak, URL, setiap kalimat, desain laporan, animasi, artikel.
2. **Merek dipilih saat build** (`src/brand.ts`, `wrangler.jsonc` env `ascan`, `__BRAND__="ascan"`), tidak pernah dari
   header permintaan. Worker `ascan-es`, data terpisah total: R2 `ascan-data`, `ascan-backups`, KV `ascan-rl`.
3. **Tayang hanya bila tidak ada isi kembar** dengan xscan.es (penjaga kemiripan §8). Sampai itu, `deploy-ascan.yml` hanya
   bisa dijalankan manual.
4. **Bahasa:** Indonesia + Inggris (pemilik: „Pake 2 bahasa aja dulu“). Kalimat ID dan EN ascan ditulis terpisah dari xscan.
5. **Aturan tetap** berlaku: R2 saja (tidak pernah D1), AdSense didahulukan sampai live, rahasia perusahaan tidak bocor,
   gratis/berbayar sama dengan xscan, uji e2e wajib lulus.

## 2. Yang diwarisi dari xscan.es (sudah jalan, tidak ditulis ulang)

| Bagian | Sumber di kode | Catatan untuk ascan |
|---|---|---|
| Mesin deteksi + kaskade Haiku → Sonnet → Opus, mode Fable 5.1 dengan konfirmasi | `src/engine/*` | sama |
| Router termurah yang mampu, tombol darurat, batas belanja, mesin nyala/mati („Segera hadir“) | `src/engine/router.ts`, `src/data/controls.ts` | sama; teks label ditulis ulang |
| Cek Gratis 1–20 halaman per minggu/bulan, tanda air logo | `src/data/free.ts`, `report.ts` | tanda air memakai logo ascan (`/assets/ascan/watermark*.webp`) |
| Token, paket + diskon, deposit + tukar, invoice IDR/USD, unggah bukti, persetujuan admin, afiliasi | `src/routes/payments.ts`, `src/data/*` | **pembayaran sama** (rekening ulyah.com); awalan invoice `AS` |
| Masukan: tempel, DOCX/PDF/RTF/HTML/TXT, URL, sitemap → sesi | `src/lib/extract.ts`, `app.js` | ascan menonjolkan **analisis domain** (sitemap) sesuai slogan „Article & Domain Analyzer“ |
| Keperluan laporan (umum, pendidikan, lomba, media, organisasi) | `src/lib/purpose.ts` | judul dokumen ditulis ulang untuk ascan |
| Cache hasil 7 hari, batas waktu 2 jam, rekonsiliasi | `checks.ts`, `cron.ts` | sama |
| Panduan A–Z bersuara member + admin | `src/pages/guide.ts` | **ditulis ulang** dengan kalimat ascan (§5) |
| PWA + spanduk „Pasang di HP“, notifikasi admin | `src/lib/pwa.ts`, `src/data/notify.ts` | ikon ascan sudah ada (`/assets/ascan/icon-*.png`) |
| Portal admin (fungsi) | `src/routes/admin.ts` | sama; label menu ditulis ulang |

## 3. Wajah ascan.es (berbeda 100 %)

| Unsur | xscan.es | ascan.es |
|---|---|---|
| Nama & slogan | AI Content Analyzer · Detect · Analyze · Verify | **ascan.es · Article & Domain Analyzer** |
| Logo | lencana gelap | logo pemilik: dokumen + kaca pembesar + grafik, bola dunia, biru–oranye (`/assets/ascan/*`) |
| Warna | navy gelap + biru | **biru kerajaan #0b3bb5 + oranye #ff8a00 di atas latar terang** |
| Tipografi | Plus Jakarta Sans | **Sora** (judul) + **Inter** (isi) |
| Bentuk | kartu membulat 18 px, bayangan lembut | kartu kaca bersudut 6 px, garis tipis, aksen garis oranye di kiri |
| Kepala halaman | lencana + nama | logo lebar + menu berbentuk pil |
| Animasi | tinta mengalir, membalik kertas | **berkas pemindai** melintas di hero, angka berputar, kartu kaca dengan pantulan bergerak, transisi melebur |
| Laporan | dokumen resmi A4 | **dasbor analitik**: kartu skor melingkar, peta panas kalimat, garis waktu analisis, lencana keyakinan, QR di kartu akhir; cetak lanskap |
| URL | `/cara-kerja`, `/harga`, `/contoh-laporan`, `/panduan` | `/metode`, `/biaya`, `/pratinjau-laporan`, `/bantuan` (EN `/en/method`, `/en/fees`, `/en/report-preview`, `/en/help`) |

## 4. Halaman publik ascan (ditulis baru)

Beranda (hero pemindai + tiga kemampuan: artikel, domain, laporan), Metode, Ketepatan, Biaya (tabel mesin aktif + paket),
Pratinjau laporan (dasbor contoh), Bantuan (panduan bersuara versi ascan), Privasi, Ketentuan, Pemakaian bertanggung jawab,
Verifikasi. Setiap halaman: judul/deskripsi/canonical/hreflang ID↔EN, JSON-LD, sitemap. Semua kalimat baru — tidak satu
kalimat pun diambil dari xscan.

## 5. Teks portal member & admin

Setiap string `tr(L, id, en)` mendapat pasangan ascan (`tr(L, id, en, aid, aen)`), dimulai dari yang paling sering dilihat:
menu, judul halaman, tombol, pemberitahuan, e-mail, laporan, panduan. Target: 100 % string memiliki versi ascan sebelum tayang;
penjaga §8 menolak build bila ada string xscan yang tampil di ascan.

## 6. Laporan dasbor ascan

1. Kartu skor utama (persen AI/campuran/manusia sebagai cincin tiga warna oranye–biru–abu) + lencana keyakinan.
2. „Mengapa skor ini“ — tiga alasan teratas dengan kutipan.
3. Peta panas kalimat (warna per kalimat, ketuk untuk detail).
4. Dimensi: isi, gaya, struktur, sumber, SEO (untuk artikel web), bahasa.
5. Saran per paragraf.
6. Untuk analisis domain (sitemap): ringkasan per situs — sebaran skor semua artikel, artikel paling berisiko, tren.
7. Metode & batas, QR verifikasi di kartu akhir. Cetak: lanskap untuk dasbor, potret untuk lampiran kalimat.

## 7. Artikel ascan (ID + EN, ditulis tangan)

70 artikel bertopik **berbeda** dari 70 topik xscan (MASTER-BLUEPRINT §16.4): kualitas konten situs & SEO jujur, audit
artikel untuk penerbit dan agensi, menulis untuk mesin pencari tanpa AI berlebihan, kebijakan AI di redaksi, verifikasi
sumber di web, analisis domain sebelum membeli situs, menulis untuk UMKM dan pemasaran, etika konten AI di media sosial.

## 8. Penjaga „tidak mirip“ (CI, wajib lulus sebelum deploy)

- Teks: kemiripan shingle 6 kata ascan↔xscan (bahasa sama) > 3 % → gagal; judul artikel bermakna sama → gagal.
- CSS: `public/assets/ascan/ascan.css` terpisah; deklarasi yang sama > 5 % (di luar reset) → gagal.
- Logo/gambar: hash berbeda.
- Uji e2e versi ascan: build `--env ascan` + `wrangler dev --env ascan`, alur yang sama dengan xscan (daftar, Cek Gratis,
  beli token, laporan, Fable, PWA) memakai teks ascan.

## 9. AdSense & domain

Akun utama **ca-pub-9433622530024776** + 21 akun tumpukan (`adsense-stack.json`), satu loader. Verifikasi Sedo sudah ada di
DNS. Saat zona ascan.es aktif, `deploy-ascan.yml` memasang domain (ascan.es + www) dan `site-audit` menambah ascan.es.

## 10. Tahapan

| Fase | Isi | Selesai bila |
|---|---|---|
| A0 ✅ | lapisan merek (`src/brand.ts`), env `ascan`, bucket, aset logo/ikon/tanda air, workflow manual | build `--env ascan` berhasil |
| A1 | stylesheet ascan lengkap + kepala/kaki halaman + halaman publik ascan ID/EN | penjaga CSS & teks halaman publik lulus |
| A2 | laporan dasbor + animasi ascan | contoh laporan tampil & tercetak rapi |
| A3 | teks portal member/admin + panduan bersuara versi ascan | 100 % string punya versi ascan |
| A4 | 10 artikel pertama ID+EN, e2e versi ascan, deploy + `site-audit` OK | ascan.es tayang |
| A5 | 70 artikel, analisis domain lanjutan | |

Urutan pemilik (8 Nov 2026): **jenius.es dikerjakan lebih dulu**, ascan.es menyusul dengan blueprint ini.
