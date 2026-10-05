# Blueprint inti: Ad Manager + pusat AI ulyah.com

> Dokumen ini adalah **sumber kebenaran** untuk otomasi iklan di semua situs
> pemilik. Ditulis 4 Okt 2026 atas permintaan pemilik:
>
> - "Tolong ini di catat dan di kembangkan dulu sebagai blueprint paling inti
>   dan paling kuat … betul2 bisa di implementasikan bukan logika sampah."
> - "Semua situs di kendalikan, terbaca traffiknya di admin ulyah.com kecuali
>   dawa.es."
> - "Setting API admanager … semua wajib full otomatis tanpa pengendali
>   setelah sy input api admanager, hanya bekerja di website yg sudah di
>   approve oleh adsense."
> - "Anda tetapkan logika inventory nya, campaign dll agar maximal … jd AI
>   tidak berfikir lagi, langsung eksekusi sesuai perintah."
> - "Apapun yg mau di laporkan, tampilkan di admin ulyah.com."
>
> Semua yang tertulis di sini sudah dicek terhadap kemampuan API Google yang
> sebenarnya (Okt 2026). Bagian yang **tidak bisa** diotomasi oleh API Google
> ditulis terang-terangan, beserta cara menanganinya.

---

## ⚠️ Keputusan pemilik 4 Okt 2026: Auto ads, TANPA slot manual

> "Hapus aja dan bersihkan slot AdSense nya di website manapun karena sy
> bikin otomatis (ingat kecuali dawa.es), cukup cuplikan AdSense, ads.txt &
> tag meta." — "Karena 27 situs ini masih pengajuan, bahkan baru input ulang
> kode AdSense nya."

Akibatnya, dikunci di kode sebagai `AD_PLACEMENT = "auto"`
(`apps/worker-api/src/lib/adops/plan.ts`):

1. Halaman tidak punya slot manual maupun tag GPT, jadi **ad unit Ad Manager
   tidak akan pernah bisa tayang**. Runner **tidak membuat inventory, tidak
   menghitung floor, dan tidak mematikan posisi** (§5–§7 menjadi rencana
   cadangan, hanya berlaku kalau suatu hari tag GPT dipasang lalu konstanta
   diubah ke `"gam"`).
2. Yang tetap berjalan otomatis setiap hari:
   - status persetujuan AdSense setiap situs (READY / sedang dicek / perlu ditinjau);
   - **saklar Auto ads per situs**. Situs yang sudah READY tapi Auto ads-nya
     mati ditandai merah di admin dan di log, karena tanpa slot manual situs
     itu tidak menghasilkan apa-apa. API AdSense tidak bisa menyalakannya,
     jadi pemilik cukup menyalakannya di AdSense → Iklan → Menurut situs;
   - **laporan AdSense 7 hari** (page view, permintaan iklan, tayangan, klik,
     pendapatan per situs × kelompok negara), disimpan di `adops_daily`
     dengan posisi `auto`, ditampilkan sebagai pendapatan dan RPM halaman di
     admin ulyah.com.
3. Kredensial yang dibutuhkan hanya OAuth AdSense (Client ID, Secret, lalu
   "Hubungkan AdSense"). Kredensial Ad Manager opsional; tidak ada yang
   dihapus kalau sudah diisi.
4. Penjaga: `scripts/check-ads.ts` (tidak ada `<ins class="adsbygoogle">`,
   `data-ad-slot`, `adsbygoogle.push`), `sites/_engine/check.mjs` (setiap
   halaman hasil build), `scripts/site-audit.mjs` (HTML server situs live),
   dan `scripts/check-adops.ts` (runner tidak membuat inventory di mode auto).

---

## 0. Ringkasan dalam satu layar

```
            ┌──────────────────────── admin ulyah.com ────────────────────────┐
            │ Traffic semua situs · Status AdSense · Ad Manager · Laporan uang │
            │ Kredensial (terenkripsi) · Log aksi · Angka floor untuk dipasang  │
            └───────────────▲──────────────────────────────────▲──────────────┘
                            │ baca                              │ baca
   beacon /track ──► D1 site_pageviews              D1 adops_* (state + laporan)
                                                                ▲
                                                                │ tulis
   cron api.ulyah.com (tiap 15 mnt, tugas harian 1x/hari) ──► AdOps runner
        1. Registry situs (26 situs, dawa.es DIKECUALIKAN)
        2. AdSense Management API v2 → status situs (READY / GETTING_READY / …)
        3. GERBANG: hanya situs READY yang lanjut
        4. Ad Manager API v1 → buat/aktifkan ad unit sesuai RENCANA TETAP
        5. Ad Manager API v1 → laporan harian (impresi, klik, pendapatan, eCPM)
        6. Mesin yield (rumus tetap) → floor per segmen + nonaktifkan posisi lemah
        7. Pusat AI (Orchestra, kunci gratis, failover + checkpoint) → ringkasan
           laporan berbahasa Indonesia (AI TIDAK memutuskan apa pun)
```

**Mode kerja** (`ADOPS_MODE`): `off` → `dry-run` (bawaan: menghitung semua,
mencatat apa yang AKAN dilakukan, tidak mengubah apa pun di Google) → `live`
(mengeksekusi). Otomatis naik ke `live` hanya kalau kredensial lolos uji koneksi
dan pemilik menekan "Aktifkan" sekali di admin.

---

## 1. Prinsip yang tidak boleh dilanggar

1. **dawa.es dilepas dan dibiarkan mandiri** (pemilik, 4 Okt: "Lepas yg
   terkoneksi dengan dawa.es karena bukan milik sy lagi, biarkan dawa.es
   mandiri ini wajib di catat"). dawa.es tidak dikendalikan, tidak masuk Ad
   Manager, tidak tampil di laporan atau traffic admin, tidak ditautkan dari
   situs mana pun, dan tidak lagi dideploy dari repo ini. Rencana pelepasan
   lengkapnya ada di `docs/ADSENSE-BLUEPRINT.md` §10.
2. **Gerbang approval.** Ad Manager hanya bekerja pada situs yang statusnya
   `READY` di AdSense (dibaca otomatis dari API, bukan diketik manual).
3. **Deterministik.** Setiap keputusan (ad unit mana, ukuran apa, floor
   berapa, posisi mana dimatikan) dihitung oleh fungsi murni dengan rumus
   tetap di §5–§7. Masukan yang sama selalu menghasilkan keputusan yang sama.
   AI hanya menulis ringkasan, tidak pernah memutuskan.
4. **Idempoten.** Runner boleh jalan berkali-kali. Rencana dibandingkan dengan
   keadaan nyata di Ad Manager, dan hanya selisihnya yang dieksekusi.
5. **Semua aksi tercatat** (`adops_actions`): apa, kapan, situs mana, mode
   dry-run/live, hasil, dan pesan error. Semua tampil di admin.
6. **Kredensial tidak pernah di repo.** Disimpan terenkripsi AES-256-GCM di
   `admin_settings` (mekanisme yang sama dengan PayPal dan kunci AI).
7. **Kebijakan Google di atas segalanya**: tidak ada iklan di halaman legal,
   kontak, 404; maksimal 1 iklan per ±300 kata isi; tidak ada auto-refresh
   tanpa interaksi; tidak ada ajakan klik; tidak ada iklan yang menutupi isi;
   bot dan traffic palsu tidak dihitung.
8. **API key yang sudah diinput pemilik tidak pernah dihapus** (pemilik, 4 Okt:
   "jgn hapus API key yg sudah sy input"). Itu termasuk `ai_key_pool` dan
   `admin_settings`. Perbaikan logika admin boleh membongkar kode, tapi tidak
   pernah menghapus baris kunci. Kunci yang mati hanya ditandai statusnya.
9. **Desain** tetap mengikuti blueprint AdSense: setiap situs mewah bergaya
   istana Nabi Sulaiman, unik per situs, dengan animasi Spanyol juara Piala
   Dunia 2026. Slot iklan mengikuti gaya istana masing-masing situs dan
   **tidak boleh** menutupi animasi atau isi.

---

## 2. Registry situs (satu sumber)

File: `packages/shared/src/owner-sites.ts`. Dipakai oleh worker-api (cron),
admin (label traffic), dan `scripts/site-audit.mjs`.

| Situs | trackId (beacon) | Bahasa | Kode di | Masuk otomasi |
|---|---|---|---|---|
| ulyah.com | ulyah | id | ulyah.com · apps/web | ✅ |
| 1fr.fr | 1fr | fr | ulyah.com · apps/web | ✅ |
| tilawa.de | tilawa | de | ulyah.com · apps/web | ✅ |
| xad.es | xad | en | ulyah.com · apps/web | ✅ |
| axto.io | axto-io | en | guardian-ai | ✅ |
| xaa.es | xaa-es | es | xaa | ✅ |
| axto.us | axto-us | en | axto.us | ✅ |
| axto.dev | axto-dev | en | axtodev | ✅ |
| jai.lat | jai-lat | es | jai | ✅ |
| lie.skin | lie-skin | en | lie | ✅ |
| oldco.in | oldco-in | hi+en | oldco.in | ✅ |
| profity.in | profity-in | hi+en | profity.in | ✅ |
| dawo.es | dawo-es | es | ulyah.com · sites/ | ✅ |
| qkb.es | qkb-es | es | ulyah.com · sites/ | ✅ |
| xko.es | xko-es | es | ulyah.com · sites/ | ✅ |
| byodd.de | byodd-de | de | ulyah.com · sites/ | ✅ |
| byoxy.de | byoxy-de | de | ulyah.com · sites/ | ✅ |
| byoy.de, qarf.de, qulen.de, qurm.de, rubiy.de, zavik.de, zevok.de, zolun.de, zufiq.de, zuvik.de | `<nama>-de` | de+en | ulyah.com · sites/ (Fase 6) | ✅ saat dibuat |
| **dawa.es** | dawa | es | ulyah.com · apps/web | ❌ **dikecualikan** |

Semua situs memakai satu akun AdSense: **ca-pub-5693981744147503**.

---

## 3. Status AdSense otomatis (gerbang)

- **API:** AdSense Management API v2, `GET
  https://adsense.googleapis.com/v2/accounts/pub-5693981744147503/sites`.
  Setiap situs punya `state`: `REQUIRES_REVIEW`, `GETTING_READY`, `READY`,
  atau `NEEDS_ATTENTION`.
- **Otentikasi:** OAuth 2.0 milik pemilik (API AdSense tidak menerima service
  account). Pemilik memasukkan **Client ID**, **Client Secret**, dan **Refresh
  Token** sekali saja di admin. Scope: `https://www.googleapis.com/auth/adsense.readonly`.
- **Jadwal:** sekali sehari (dan bisa dipicu tombol "Cek sekarang").
- **Keputusan:** situs yang berubah menjadi `READY` otomatis masuk antrean
  pembuatan inventory (§5). Situs yang turun dari `READY` (misalnya
  `NEEDS_ATTENTION`) otomatis dinonaktifkan ad unit-nya dan ditandai merah di
  admin.
- **Tanpa kredensial AdSense** gerbang tetap aman: semua situs dianggap
  belum READY, jadi tidak ada yang dieksekusi.

---

## 4. Koneksi Ad Manager (yang benar-benar bisa)

| Kemampuan | API | Otomatis? |
|---|---|---|
| Info jaringan (network code, mata uang, zona waktu) | Ad Manager API v1 REST `networks.get` | ✅ |
| Membuat ad unit (satu atau banyak sekaligus) | v1 `networks.adUnits.create` / `batchCreate` | ✅ |
| Mengaktifkan / menonaktifkan ad unit | v1 `networks.adUnits.batchActivate` / `batchDeactivate` | ✅ |
| Membaca ad unit, line item, order | v1 `list` / `get` | ✅ (baca saja) |
| Laporan (impresi, klik, pendapatan, eCPM, fill) | v1 `networks.reports.create` + `run` + `results.fetchRows` | ✅ |
| **Pricing rules / floor harga** | **tidak ada di API Google** | ❌ → dihitung otomatis, dipasang pemilik (§6) |
| Membuat order/line item | v1 hanya baca; SOAP API berganti versi tiap kuartal | ❌ tidak dipakai (lihat §5.4) |

- **Endpoint:** `https://admanager.googleapis.com/v1/networks/{networkCode}/…`
- **Otentikasi:** service account Google Cloud (JSON key). Worker
  menandatangani JWT RS256 dengan WebCrypto, menukarnya di
  `https://oauth2.googleapis.com/token` dengan scope
  `https://www.googleapis.com/auth/admanager https://www.googleapis.com/auth/dfp`.
- **Syarat dari pemilik:** akses API dinyalakan di Ad Manager (Admin → Global
  settings → API access), lalu email service account ditambahkan sebagai user
  ber-role Administrator di jaringan Ad Manager.

---

## 5. Logika inventory (rencana tetap)

### 5.1 Pohon ad unit

```
(root jaringan)
└── <trackId situs>            contoh: xko-es
    ├── <trackId>-top          setelah judul artikel
    ├── <trackId>-in1          setelah ±30% isi artikel
    ├── <trackId>-in2          setelah ±65% isi artikel (hanya artikel ≥ 900 kata)
    ├── <trackId>-side         sidebar desktop (sticky di dalam kolomnya sendiri)
    └── <trackId>-end          sebelum artikel terkait
```

Kode ad unit = nama di atas (huruf kecil, angka, tanda minus). Nama tampilan =
`<domain> · <posisi>`.

### 5.2 Ukuran per posisi

| Posisi | Ukuran | Alasan |
|---|---|---|
| top | 728x90, 970x90, 336x280, 300x250, 320x100, 320x50, fluid | Di atas lipatan: viewability tinggi, campuran desktop/seluler |
| in1 | 336x280, 300x250, 580x400, fluid | Kotak sedang dalam teks: eCPM tertinggi untuk artikel |
| in2 | 336x280, 300x250, fluid | Sama, untuk artikel panjang |
| side | 300x600, 300x250, 160x600 | Skyscraper desktop saja; tidak dirender di bawah 1020 px |
| end | 728x90, 336x280, 300x250, fluid | Akhir baca; fill tinggi |

Batas: paling banyak 4 posisi terisi per halaman (top, in1, in2, end) plus
side di desktop. Halaman legal, kontak, kategori kosong, dan 404 **tidak**
memuat iklan.

### 5.3 Permintaan (demand)

1. **AdSense/AdX lewat dynamic allocation** pada setiap ad unit. Ini sumber
   uang utama, dan Google sendiri memilih iklan dengan bayaran tertinggi per
   tayangan, baik yang "mahal" maupun yang "murah tapi sering terisi".
   Sistem kita mengatur ruangnya: ukuran, posisi, dan floor.
2. **Floor per segmen** (§6) menjaga agar iklan murahan tidak menurunkan RPM.
3. **Posisi lemah dimatikan** (§7) supaya iklan yang tersisa lebih terlihat
   dan lebih mahal.

### 5.4 Yang sengaja TIDAK diotomasi

- **Order/line item langsung**: tidak ada pengiklan langsung, dan API v1
  hanya baca. SOAP API berganti versi setiap kuartal, jadi kode SOAP akan
  rusak sendiri dalam beberapa bulan.
- **Header bidding / Open Bidding**: butuh kontrak dengan SSP (persetujuan
  pihak ketiga). Dicatat sebagai fase berikutnya, tidak dipalsukan.

### 5.5 Tag di situs

Setelah situs `READY` **dan** ad unit-nya aktif, situs memuat GPT
(`securepubads.g.doubleclick.net/tag/js/gpt.js`) dengan slot
`/<networkCode>/<trackId>/<trackId>-<posisi>`. Konfigurasinya dibuat saat
build (bukan diambil saat runtime), karena pengaturan iklan runtime pernah
membuat iklan diam-diam mati berminggu-minggu (lihat
`apps/web/src/lib/ad-config.ts`):

- Workflow `adops-sync` (harian) membaca `GET /adops/site-config` (publik,
  tanpa rahasia: network code + daftar slot per situs READY), menulis
  `sites/<domain>/admanager.json` atau file setara di repo partner, lalu
  membuka PR yang di-merge otomatis setelah gate hijau. Deploy berjalan
  seperti biasa.
- Selama file itu belum ada, situs tetap memakai AdSense (loader, meta tag,
  ads.txt, dan Auto ads). Tidak ada keadaan "iklan mati".

---

## 6. Mesin floor (rumus tetap)

Tujuan: **RPM sebesar mungkin** (pendapatan per 1.000 permintaan iklan =
eCPM × fill). Itulah arti "iklan mahal atau murah tapi sering": yang dikejar
adalah uang per permintaan, bukan harga per iklan.

**Segmen** = situs × posisi × tier negara.

- T1: US, CA, GB, AU, NZ, DE, AT, CH, NL, BE, LU, IE, DK, SE, NO, FI, FR, IS
- T2: ES, IT, PT, JP, KR, SG, HK, TW, AE, SA, QA, KW, IL, PL, CZ
- T3: semua negara lain

**Floor awal** (USD, display): T1 0,50 · T2 0,25 · T3 0,05.

**Setiap 7 hari**, untuk setiap segmen dengan **≥ 2.000 permintaan iklan**
dalam 7 hari terakhir:

1. `rpm_now` = RPM 7 hari terakhir, `rpm_prev` = RPM 7 hari sebelumnya,
   `fill` = tayangan ÷ permintaan.
2. Jika `fill < 0,40` → floor × 0,85 (terlalu banyak permintaan tak terisi).
3. Selain itu, jika `rpm_now ≥ rpm_prev × 1,02` → lanjutkan arah langkah
   terakhir: floor × 1,10 jika terakhir naik, × 0,90 jika terakhir turun
   (langkah pertama: naik).
4. Selain itu, jika `rpm_now < rpm_prev × 0,98` → kembalikan floor sebelumnya
   lalu balik arah: × 0,90 jika terakhir naik, × 1,10 jika terakhir turun.
5. Selain itu (perubahan ±2%) → floor tetap.
6. Batas: 0,01 ≤ floor ≤ 5,00 USD, dibulatkan ke 0,01.
7. Segmen di bawah 2.000 permintaan: floor tidak diubah (data belum cukup).

Karena pricing rules tidak bisa diatur lewat API Google, hasilnya ditampilkan
di admin sebagai **daftar floor yang harus dipasang**: nama aturan, ad unit,
negara, dan nilai persis. Pemilik cukup menyalinnya ke Ad Manager → Inventory
→ Pricing rules. Begitu Google membuka API-nya, satu fungsi `applyFloors`
menggantikan langkah manual ini tanpa mengubah rumusnya.

---

## 7. Mematikan posisi lemah (otomatis lewat API)

Setiap 7 hari, untuk setiap ad unit dengan ≥ 5.000 permintaan dalam 28 hari:

- Jika `RPM posisi < 20% × RPM rata-rata situs` selama **4 minggu
  berturut-turut** → ad unit **dinonaktifkan** (`batchDeactivate`). Lebih
  sedikit iklan yang lebih terlihat menaikkan eCPM sisanya.
- Posisi `top` dan `in1` tidak pernah dimatikan (inti pendapatan).
- Ad unit yang dimatikan diaktifkan kembali otomatis setelah 8 minggu untuk
  diuji ulang.

---

## 8. Laporan di admin ulyah.com

Menu **Admin → Iklan & Ad Manager**:

1. **Status situs**: 26 situs (tanpa dawa.es), status AdSense (dari API),
   status Ad Manager (belum, aktif, nonaktif), dan traffic 7 hari.
2. **Pendapatan**: per hari dan per situs (pendapatan, impresi, klik, CTR,
   eCPM, RPM, fill), diambil dari laporan Ad Manager API.
3. **Floor**: nilai saat ini dan nilai baru per segmen, dengan tombol "Sudah
   dipasang".
4. **Log aksi**: semua yang dilakukan runner, dry-run atau live.
5. **Kredensial**: form terenkripsi plus tombol "Uji koneksi".
6. **Ringkasan AI**: satu paragraf bahasa Indonesia per hari dari pusat AI.

**Traffic** semua situs (kecuali dawa.es) tetap di menu traffic yang sudah
ada, dari beacon `/track` (tanpa cookie, bot dipisah).

---

## 9. Pusat AI ulyah.com (kunci gratis, smart scaling)

- Router: `apps/worker-api/src/lib/orchestra.ts`, yang sudah ada.
  Kemampuan → rantai provider (Gemini, Groq, NVIDIA NIM, OpenRouter, HF) →
  kunci donasi terbaik (`pickBestKey`, round-robin yang paling jarang dipakai)
  → cadangan Workers AI.
- **Tanpa membaca dari awal:** tugas AI dipecah menjadi langkah. Hasil setiap
  langkah disimpan sebagai checkpoint di KV (`adops:ai:<tugas>:<langkah>`,
  berlaku 2 hari). Kalau kunci mati di tengah jalan, runner berikutnya
  melanjutkan dari langkah terakhir yang berhasil dengan kunci lain, bukan
  dari awal.
- **Peran AI di AdOps:** hanya menulis ringkasan laporan. Kalau semua kunci
  mati, laporan tetap lengkap (angka dan tabel), hanya tanpa paragraf AI.

---

## 10. Data (D1, hemat tulis)

| Tabel | Isi | Volume |
|---|---|---|
| `adops_sites` | status AdSense, status Ad Manager, perubahan terakhir per situs | 26 baris |
| `adops_adunits` | ad unit yang dibuat (id Google, posisi, status, kapan dinonaktifkan) | ≤ 130 baris |
| `adops_daily` | laporan harian per situs × posisi × tier | ±400 baris/hari |
| `adops_floors` | floor per segmen + arah langkah terakhir | ≤ 400 baris |
| `adops_actions` | log aksi | ±50 baris/hari, dipangkas 90 hari |

Checkpoint AI dan kunci jadwal disimpan di KV, bukan di D1.

---

## 11. Langkah pemilik (sekali saja)

1. Daftar/masuk **Google Ad Manager** dengan akun Google yang memegang AdSense
   `pub-5693981744147503`. Catatan jujur: Google tidak selalu membuka Ad Manager
   untuk penerbit baru; biasanya butuh situs yang sudah di-ACC dan traffic
   nyata.
2. Di Google Cloud Console: buat project, aktifkan **Ad Manager API** dan
   **AdSense Management API**, buat **service account** dan unduh JSON key-nya.
3. Di Ad Manager: Admin → Global settings → **API access: Enabled**. Tambahkan
   email service account sebagai user Administrator.
4. Untuk AdSense: buat OAuth Client (tipe Web) dan ambil refresh token dengan
   scope `adsense.readonly` (tombol "Hubungkan AdSense" di admin memandu
   langkah ini).
5. Di admin ulyah.com → Iklan & Ad Manager → isi network code, JSON service
   account, dan kredensial OAuth AdSense → **Uji koneksi** → **Aktifkan**.

Setelah itu tidak ada pengendali manual lagi, kecuali memasang angka floor
(§6) yang memang belum bisa diatur lewat API Google.

---

## 12. Status implementasi

| # | Bagian | Status |
|---|---|---|
| 1 | Satu akun AdSense di semua situs (dawa.es dikecualikan) | ✅ 4 Okt (ulyah.com #296, repo partner) |
| 2 | Registry situs (§2) | ✅ `packages/shared/src/owner-sites.ts` (dawa.es tidak ada) |
| 3 | Fungsi murni: rencana inventory, mesin floor, posisi lemah, diff, dengan tes | ✅ `apps/worker-api/src/lib/adops/plan.ts`, `yield.ts`; 50 tes di `scripts/check-adops.ts` (CI) |
| 4 | Klien Google: JWT service account, OAuth refresh, AdSense v2, Ad Manager v1 | ✅ `google.ts`, `adsense.ts`, `admanager.ts` (bentuk dari proto resmi googleapis) |
| 5 | Runner cron + mode off/dry-run/live + log aksi | ✅ `runner.ts`, cron 15 menit → sekali sehari setelah 03.00 UTC |
| 6 | Endpoint admin + panel admin + kredensial terenkripsi | ✅ tab admin "📈 Ad Manager", Settings → "Ad Manager & AdSense", `/admin/adops/*`, `/adops/oauth/callback`, `/adops/site-config` |
| 7 | Traffic semua situs di admin (registry, tanpa dawa.es) | ✅ label dari registry; data dawa.es tidak disimpan & tidak ditampilkan |
| 8 | Ringkasan AI dengan checkpoint | ✅ `checkpoint.ts` + Orchestra |
| 9 | Tag GPT di situs + workflow adops-sync | ❌ dibatalkan: pemilik memilih Auto ads tanpa slot (lihat bagian ⚠️ di atas) |
| 11 | Mode Auto ads: saklar Auto ads per situs + laporan AdSense harian di admin | ✅ `adsense.ts` (reports:generate), `runner.ts`, tab admin |
| 10 | Header bidding | ⏸️ butuh kontrak SSP |
