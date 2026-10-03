# PANDUAN SETUP dawa.es — MANDIRI (lepas dari ekosistem ulyah.com)

> Dokumen ini ditulis untuk **manusia dan AI berikutnya**. Baca §0 dulu; di situ
> semua fakta penting dalam satu layar. Bagian lain adalah langkah rinci.

---

## 0. RINGKASAN UNTUK AI (baca ini dulu)

| Hal | Nilai |
|---|---|
| Situs | **dawa.es** — "Dawa — El Portal Islámico en Español". Satu bahasa: **Spanyol (`es`)**. |
| Asal | Dulu salah satu dari 5 tenant monorepo `p2nshooter/ulyah.com` (build `NEXT_PUBLIC_TENANT=dawa`). Backup ini adalah salinan penuh monorepo itu yang **sudah diputus** dari ulyah.com. |
| Stack | Next.js 15 + React 19 (via `@opennextjs/cloudflare`) · Hono · Cloudflare Workers · D1 · KV · R2 · Durable Objects · Workers AI · pnpm workspace · TypeScript |
| Node / pnpm | Node **22**, pnpm **10.33.0** (`packageManager` di package.json) |
| Worker web | **`dawa-web`** → `https://dawa.es`, `https://www.dawa.es` (folder `apps/web`) |
| Worker API | **`dawa-api`** → `https://api.dawa.es` (folder `apps/worker-api`), cron `*/15 * * * *` |
| D1 | **`dawa-db`** (binding `DB`) — skema: `packages/db-schema/migrations` (57 file: 56 identik dengan ulyah-db + `0057_dawa_standalone.sql`) |
| KV | **`dawa-cache`** (binding `CACHE_KV`) — hanya cache, boleh kosong |
| R2 | **`dawa-media`** (binding `MEDIA_R2`, di API) + **`dawa-next-cache`** (binding `NEXT_INC_CACHE_R2_BUCKET`, di web) |
| Durable Object | `KeyPoolCoordinator` (binding `KEY_POOL`, SQLite-backed — boleh di paket gratis) |
| Workers AI | binding `AI` (tidak perlu kunci; akun harus mengizinkan Workers AI) |
| Deploy | Otomatis: **push ke `main`** → `.github/workflows/deploy.yml` membuat D1/KV/R2 bila belum ada, migrasi, seed, secret, deploy API + web, pasang domain. |
| Secret wajib | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` (GitHub → Settings → Secrets → Actions) |
| Audio | **Tidak disimpan.** Murottal diputar langsung dari CDN qari — lihat `AUDIO-CDN.md`. |
| Database | Skema + seed lengkap ada di `dawa-es/packages/db-schema`. Deploy pertama membangunnya otomatis. Data live lama (terjemahan Spanyol, statistik, admin) bisa dibawa dengan `database/export-live-ulyah-db.sh` + `database/import-to-dawa-db.sh` (§8). |
| Admin | Klik logo **5× cepat (dalam 3 detik)** → login email/password bootstrap → pemilik wajib TOTP (Google Authenticator). |
| Iklan | Google AdSense saja. Konstanta di `apps/web/src/lib/ad-config.ts` (`AD_CLIENT_ID`, `AD_SLOT`). dawa.es harus disetujui di akun AdSense itu. |
| Nama paket internal | `@ulyah/web`, `@ulyah/shared`, dst. **Hanya nama namespace workspace**, bukan koneksi ke ulyah.com — sengaja tidak diganti (ratusan import). |
| Aturan konten pemilik | Satu bahasa per situs. Al-Qur'an & matan hadits **tidak pernah diterjemahkan mesin** (`lib/mt.ts` memasker teks Arab). Konten sumber ditulis dalam bahasa Indonesia/Inggris lalu diterjemahkan ke Spanyol & di-cache di `mt_cache`. |

**Sudah diuji pada salinan bersih backup ini (29 Sep 2026):**

| Uji | Hasil |
|---|---|
| `pnpm install --frozen-lockfile` | lulus |
| typecheck `@ulyah/worker-api` dan `@ulyah/web` | lulus |
| 32 pemeriksaan CI (`ci.yml`) | semua lulus |
| `opennextjs-cloudflare build` tenant dawa (tanpa env apa pun — dari `.env.production`) | lulus, 62 halaman statis |
| Cari `api.ulyah.com` di seluruh output build (server + klien) | 0 hasil |
| `restore-d1.sh --local` dari nol | 89 seed + 57 migrasi, 344 detik, DB 157 MB |
| restore digagalkan di tengah lalu dijalankan ulang | melanjutkan tepat dari file yang gagal; hasil identik |
| langkah seed Qur'an deploy.yml (versi lokal), terputus lalu diulang | melanjutkan; run berikutnya tidak mengimpor apa-apa |
| `wrangler dev` API mandiri + DB hasil restore | `/` → `dawa-api`; `/quran/surah/1?lang=es` → teks Spanyol; CORS menolak origin ulyah.com; audio → 302 ke `cdn.islamic.network` |
| `import-to-dawa-db.sh` dengan dump berformat `wrangler d1 export` | hanya baris dawa/`-es` yang masuk |

Yang **belum** bisa diuji dari sini: deploy sungguhan ke Cloudflare (butuh token
& akun Anda) dan ekspor live ulyah-db (butuh akses akun lama).

**Yang TIDAK boleh dilakukan AI berikutnya tanpa izin pemilik:**
menghapus seed/migrasi, mengganti nama binding (`DB`, `CACHE_KV`, `MEDIA_R2`,
`NEXT_INC_CACHE_R2_BUCKET`, `KEY_POOL`, `AI`), menyimpan audio murottal ke R2,
menambah bahasa lain di dawa.es, atau mengaktifkan kembali tautan ke ulyah.com.

---

## 1. Isi folder backup

```
dawa-es-backup/
├── README.md                       ← mulai di sini (indeks singkat)
├── PANDUAN-SETUP-DAWA-ES.md        ← dokumen ini
├── AUDIO-CDN.md                    ← semua sumber audio (CDN) + rumus URL, tanpa file audio
├── STANDALONE-CHANGES.md           ← daftar persis apa saja yang diubah untuk memutus ulyah.com
├── BACKUP-INFO.md                  ← tanggal, commit asal, jumlah file, sisa teks "ulyah.com"
├── CHECKSUMS.sha256                ← sha256 setiap file (cek keutuhan: sha256sum -c CHECKSUMS.sha256)
├── database/
│   ├── README.md                   ← ringkasan isi database & 3 jalur restore
│   ├── restore-d1.sh               ← bangun dawa-db dari nol (skema + SEMUA seed), lokal/remote
│   ├── export-live-ulyah-db.sh     ← ambil isi LIVE ulyah-db dari Cloudflare
│   ├── import-to-dawa-db.sh        ← gabungkan dump live ke dawa-db (buang data situs lain)
│   └── prune-for-dawa.sql          ← aturan buang-baris-bukan-dawa yang dipakai import
└── dawa-es/                        ← PROYEK LENGKAP (jadikan repo GitHub baru)
    ├── apps/web/                   ← Next.js (situs dawa.es + portal admin tersembunyi)
    ├── apps/worker-api/            ← Hono API (api.dawa.es) + Durable Object + cron
    ├── packages/shared/            ← tipe, kripto (AES-GCM, PBKDF2, TOTP), registri bahasa
    ├── packages/ai-engine/         ← pipeline konten AI
    ├── packages/key-pool/          ← validasi & penilaian kunci AI donasi
    ├── packages/db-schema/         ← migrations/ (skema D1) + seed/ (data, ±125 MB SQL)
    ├── scripts/                    ← generator seed, pemeriksa CI, perawatan D1, penerjemah
    ├── docs/                       ← CONTENT-POLICY.md, PANDUAN (salinan), SETUP.md
    └── .github/workflows/          ← deploy.yml (khusus dawa.es), ci.yml, perawatan
```

Ukuran database hasil restore penuh dari seed: lihat `database/README.md`
(terukur saat backup dibuat).

---

## 2. Arsitektur

```
 Pengunjung ──► https://dawa.es ──► Worker dawa-web (Next.js/OpenNext)
                                         │  cache halaman: R2 dawa-next-cache
                                         │  fetch JSON
                                         ▼
                              https://api.dawa.es ──► Worker dawa-api (Hono)
                                         │               ├─ D1  dawa-db    (semua konten)
                                         │               ├─ KV  dawa-cache (cache, rate-limit, kursor)
                                         │               ├─ R2  dawa-media (isi kisah besar, PDF, upload)
                                         │               ├─ DO  KeyPoolCoordinator
                                         │               ├─ Workers AI (TTS/terjemah cadangan)
                                         │               └─ cron */15: key-pool, kompilasi konten, scaling
                                         │
 Audio murottal ◄── langsung dari CDN qari (cdn.islamic.network, everyayah.com, quranicaudio.com)
```

- **Tenant ditetapkan saat build**, bukan dari hostname: `apps/web/.env.production`
  berisi `NEXT_PUBLIC_TENANT=dawa` dan `NEXT_PUBLIC_API_URL=https://api.dawa.es`.
  Variabel dari shell/CI menang atas file itu.
- Semua rute URL berbahasa Indonesia di kode (folder `app/[locale]/jadwal-sholat`,
  dsb.) tetapi **dilokalkan ke Spanyol** untuk pengunjung oleh
  `packages/shared/src/routes.ts` + middleware.
- Worker API **tidak** menyempitkan daftar bahasa (tidak diberi
  `NEXT_PUBLIC_TENANT`), jadi perilakunya sama persis dengan API lama; gerbang
  terjemahan mesin (`MT_TARGET_LANGS`) hanya mengizinkan **`es`**.

---

## 3. Yang sudah diputus dari ulyah.com

Rinci per file: `STANDALONE-CHANGES.md`. Intinya:

| Dulu (ekosistem) | Sekarang (mandiri) |
|---|---|
| API bersama `api.ulyah.com` (worker `ulyah-api`) | `api.dawa.es` (worker `dawa-api`) |
| D1 `ulyah-db`, KV `ulyah-cache`, R2 `ulyah-media`, `ulyah-next-cache` | `dawa-db`, `dawa-cache`, `dawa-media`, `dawa-next-cache` |
| CORS menerima ulyah.com, 1fr.fr, tilawa.de, xad.es, axto.* | hanya `dawa.es`, `www.dawa.es` |
| hreflang + sitemap menunjuk 5 domain | hanya dawa.es |
| `LOCALE_SITE` (tautan ke situs saudara) | hanya `es → https://dawa.es` |
| Terjemahan mesin ke id/en/de/fr/es | hanya ke `es` |
| Bot artikel menulis ke 7 repo situs lain | dikosongkan (no-op) |
| Email kontak `salam@ulyah.com` | `salam@dawa.es` (siapkan Email Routing, §10) |
| PayPal/NOWPayments "Donasi ULYAH.COM" | "Donación Dawa (dawa.es)" |
| deploy.yml membangun 5 situs | hanya dawa.es |
| folder `quantum/`, deploy situs partner | tidak ikut (bukan dawa.es) |

Sisa teks "ulyah.com" di kode hanyalah: komentar, label/kamus yang
**di-rebrand otomatis saat runtime** menjadi "dawa.es"/"Dawa"
(`apps/web/src/lib/rebrand.ts`, `apps/web/src/dictionaries/index.ts`),
konfigurasi tenant lama yang tidak dirujuk, dan teks bantuan di panel admin.
Tidak ada satu pun permintaan jaringan ke ulyah.com. (Dibuktikan saat backup:
build produksi dawa.es tidak memuat `api.ulyah.com` sama sekali.)

---

## 4. Prasyarat

1. **Akun Cloudflare** (paket gratis cukup untuk mulai; batasnya di §12).
   - **R2 harus diaktifkan** (Dashboard → R2 → Enable). R2 butuh metode
     pembayaran terdaftar walau tetap gratis dalam kuota. Kalau R2 mati,
     deploy tetap jalan tanpa R2 (lihat §12) tapi PDF/isi kisah yang dipindah
     ke R2 tidak tersedia.
   - Workers AI aktif (default).
2. **Domain `dawa.es` sebagai zona aktif di Cloudflare** (nameserver di registrar
   diarahkan ke Cloudflare). Deploy bisa membuat zonanya sendiri (butuh izin
   Zone:Edit), tapi mengganti nameserver di registrar hanya bisa manual.
3. **Repo GitHub baru** (privat disarankan) berisi isi folder `dawa-es/`,
   dengan branch default **`main`**.
4. Untuk kerja lokal: Node 22, pnpm 10.33.0 (`corepack enable`), git.

---

## 5. API Token Cloudflare — izin yang WAJIB

Buat di **dash.cloudflare.com → My Profile → API Tokens → Create Token →
Create Custom Token**. Semua izin di bawah bernilai **Edit** kecuali yang
ditandai Read.

### Account permissions (Account Resources: akun Anda)

| Izin | Level | Dipakai untuk |
|---|---|---|
| **Workers Scripts** | **Edit** | deploy `dawa-api` + `dawa-web`, secret Worker, Durable Object, custom domain Worker |
| **D1** | **Edit** | membuat `dawa-db`, migrasi, seed, perawatan, ekspor |
| **Workers KV Storage** | **Edit** | membuat `dawa-cache`, hapus/isi kunci cache dari workflow |
| **Workers R2 Storage** | **Edit** | membuat `dawa-media` + `dawa-next-cache`, unggah PDF seed |
| Workers AI | Read (opsional) | hanya kalau skrip memanggil Workers AI lewat REST |
| Account Settings | Read | `wrangler` membaca info akun |
| Workers Tail | Read (opsional) | `wrangler tail` untuk melihat log |

### Zone permissions (Zone Resources: **Specific zone → dawa.es**)

| Izin | Level | Dipakai untuk |
|---|---|---|
| **Zone** | **Read** | mencari zone id dawa.es |
| **DNS** | **Edit** | menghapus record placeholder (penyebab error 522) sebelum domain Worker dipasang |
| **Workers Routes** | **Edit** | memasang `dawa.es`, `www.dawa.es`, `api.dawa.es` ke Worker |

### Opsional

| Izin | Kapan perlu |
|---|---|
| Zone → **Zone: Edit** dengan Zone Resources **All zones** | hanya jika ingin langkah "Ensure dawa.es zone exists" **membuat** zona dawa.es otomatis. Kalau zona sudah ada, tidak perlu. |
| User → Memberships: Read, User Details: Read | kalau `wrangler whoami` mengeluh; template "Edit Cloudflare Workers" sudah menyertakannya |

> Cara cepat: mulai dari template **"Edit Cloudflare Workers"**, lalu
> **tambahkan D1: Edit**, pastikan **Workers R2 Storage: Edit** dan
> **Workers KV Storage: Edit** ada, dan di Zone tambahkan **DNS: Edit** +
> **Zone: Read** untuk dawa.es.

Langkah pertama deploy memverifikasi token dan mencetak statusnya; pesan
galatnya menyebut izin mana yang kurang.

**Token R2 S3 (terpisah, opsional):** hanya untuk workflow mirror/purge
murottal dan untuk menyalin objek R2 lama dengan rclone (§8.4). Buat di
**R2 → Manage R2 API Tokens** (Object Read & Write), simpan sebagai secret
`R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY`.

---

## 6. GitHub Secrets & Variables

Repo baru → **Settings → Secrets and variables → Actions**.

### Wajib

| Secret | Isi |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token dari §5 |
| `CLOUDFLARE_ACCOUNT_ID` | ID akun (Dashboard → sidebar kanan halaman Overview mana pun) |
| `ADMIN_BOOTSTRAP_EMAIL` | email admin pertama (dipakai **sekali** untuk membuat baris `admin_users`) |
| `ADMIN_BOOTSTRAP_PASSWORD` | password admin pertama — ganti dari portal admin setelah login |

### Dibuat otomatis kalau kosong (tapi SIMPAN salinannya)

| Secret | Keterangan |
|---|---|
| `KEY_ENCRYPTION_SECRET` | base64 32 byte, mengenkripsi kunci AI donasi (AES-256-GCM). Kalau kosong, deploy membuatnya sekali dan menyimpannya hanya di Worker. **Kalau membawa tabel `ai_key_pool` dari ulyah-db, isi dengan nilai LAMA** — kalau tidak, kunci lama tidak bisa didekripsi (harus didonasikan ulang). |
| `ADMIN_SESSION_SECRET` | string acak untuk sesi admin. |

Buat sendiri: `openssl rand -base64 32` dan `openssl rand -base64 48`.

### Donasi (opsional — tanpa ini tombol donasi tetap tampil tapi pembayaran gagal)

| Secret | Isi |
|---|---|
| `PAYPAL_MODE` | `live` atau `sandbox` |
| `PAYPAL_CLIENT_ID_LIVE` / `PAYPAL_CLIENT_SECRET_LIVE` | developer.paypal.com → Apps |
| `PAYPAL_CLIENT_ID_SANDBOX` / `PAYPAL_CLIENT_SECRET_SANDBOX` | idem, sandbox |
| `PAYPAL_WEBHOOK_ID` | webhook ke `https://api.dawa.es/donate/paypal/webhook` (event `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`) |
| `NOWPAYMENTS_API_KEY` | NOWPayments → API keys (private) |
| `NOWPAYMENTS_IPN_SECRET` | NOWPayments → IPN secret; callback `https://api.dawa.es/donate/nowpayments/webhook` |

### Lain-lain (opsional)

| Secret | Isi |
|---|---|
| `RESEND_API_KEY`, `EMAIL_FROM` | kirim email dari tab Grant (domain dawa.es harus diverifikasi di resend.com). `EMAIL_FROM` mis. `salam@dawa.es` |
| `CORS_ALLOW_ORIGIN` | default `https://dawa.es` (dari `PUBLIC_SITE_URL`) — biarkan kosong |
| `AI_KEY_BULK_IMPORT` | kumpulan kunci NVIDIA/OpenRouter untuk dimasukkan ke Key Pool saat deploy |
| `GH_CONTENT_TOKEN` | **tidak perlu** — bot artikel sudah dikosongkan |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | hanya untuk workflow murottal R2 (tidak disarankan) |

### Repository Variables (opsional)

`CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_KV_NAMESPACE_ID` — isi hanya kalau
token tidak bisa **membaca daftar** D1/KV; deploy lalu memakai ID ini langsung.

---

## 7. Langkah setup (urut)

### 7.1 Jalur otomatis (disarankan)

1. Siapkan zona `dawa.es` di Cloudflare (§4) dan token (§5).
2. Buat repo GitHub baru, lalu:
   ```bash
   cd dawa-es
   git init -b main
   git add -A
   git commit -m "dawa.es mandiri — dari backup"
   git remote add origin git@github.com:<akun>/<repo-dawa>.git
   git push -u origin main
   ```
   (Push pertama memicu deploy; kalau secret belum ada, run pertama gagal di
   "Verify required secrets" — isi secret lalu **Actions → Deploy to Cloudflare
   → Run workflow**.)
3. Isi secret (§6).
4. Jalankan **Deploy to Cloudflare**. Urutan yang terjadi:
   verifikasi token → buat `dawa-db`/`dawa-cache`/`dawa-media`/`dawa-next-cache`
   bila belum ada → migrasi D1 → teks Al-Qur'an, lalu **terjemahan Spanyol
   lebih dulu**, lalu 9 bahasa lain (tiap bahasa digerbang sendiri) → semua seed
   hadits/kisah/kitab/pesantren/amalan (tiap langkah dicek dulu, bisa diulang)
   → unggah PDF kisah ke R2 → pastikan zona dawa.es → bersihkan DNS lama →
   deploy `dawa-api` (+ `api.dawa.es`) → push secret Worker → build web tenant
   dawa → deploy `dawa-web` → pasang `dawa.es` + `www.dawa.es` → smoke test →
   IndexNow → cek `https://api.dawa.es/health`.
   Run pertama pada database kosong memakan waktu lama (±125 MB seed).

   > **Paket gratis:** D1 gratis hanya mengizinkan **100.000 baris tulis per
   > hari**, sedangkan seed penuh (±131 ribu baris + indeks) melewatinya. Deploy
   > pertama akan memasukkan teks Arab + **Spanyol** dulu (itu yang wajib),
   > sisanya bisa berhenti dengan peringatan "batas tulis". Situs tetap
   > ter-deploy. Jalankan **Deploy to Cloudflare** lagi keesokan harinya (setelah
   > 00:00 UTC) — setiap langkah seed melanjutkan yang belum masuk. Biasanya 2–3
   > hari sampai lengkap. Dengan Workers Paid ($5/bln) selesai dalam sekali run.
5. Verifikasi (§9).

### 7.2 Jalur manual dari komputer sendiri

```bash
cd dawa-es
corepack enable && pnpm install --frozen-lockfile
npx wrangler login                                   # atau export CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID

# Sumber daya
npx wrangler d1 create dawa-db                       # catat database_id
npx wrangler kv namespace create dawa-cache          # catat id
npx wrangler r2 bucket create dawa-media
npx wrangler r2 bucket create dawa-next-cache

# Isi placeholder di apps/worker-api/wrangler.toml:
#   database_id = "__D1_DATABASE_ID__"  -> uuid dawa-db
#   id = "__KV_NAMESPACE_ID__"          -> id dawa-cache
# (JANGAN di-commit kalau repo publik; deploy.yml mengisinya sendiri di CI.)

# Database (skema + semua seed)
../database/restore-d1.sh --remote

# API
cd apps/worker-api
npx wrangler deploy
npx wrangler secret put ADMIN_BOOTSTRAP_EMAIL
npx wrangler secret put ADMIN_BOOTSTRAP_PASSWORD
npx wrangler secret put KEY_ENCRYPTION_SECRET        # openssl rand -base64 32
npx wrangler secret put ADMIN_SESSION_SECRET         # openssl rand -base64 48
cd ../web
npx opennextjs-cloudflare build                      # memakai .env.production (tenant dawa)
npx wrangler deploy --name dawa-web --var NEXT_INC_CACHE_R2_PREFIX:inc-dawa
```
Lalu di Dashboard → Workers → `dawa-web` → Settings → Domains & Routes →
tambahkan Custom Domain `dawa.es` dan `www.dawa.es` (api.dawa.es sudah dipasang
otomatis oleh `routes` di wrangler.toml API).

### 7.3 Pengembangan lokal

```bash
cd dawa-es && pnpm install
../database/restore-d1.sh --local                    # database lokal lengkap (±beberapa menit)
pnpm dev:api                                         # http://localhost:8787
# terminal lain — arahkan web ke API lokal:
echo "NEXT_PUBLIC_API_URL=http://localhost:8787" > apps/web/.env.development.local
pnpm dev:web                                         # http://localhost:3000
```

Pemeriksaan sebelum push (sama dengan CI): `pnpm typecheck`, lalu
langkah-langkah di `.github/workflows/ci.yml` (semua lulus saat backup dibuat).

---

## 8. Database

Rincian isi: `database/README.md`. Tiga jalur, pilih satu:

### 8.1 Jalur A — otomatis dari seed (DISARANKAN, paling aman)

Tidak perlu apa-apa: deploy pertama membangun `dawa-db` dari 57 migrasi + 89
file seed. Hasilnya: Al-Qur'an lengkap (114 surah, 6.236 ayat) + terjemahan
Spanyol & 10 bahasa lain, 12+ kitab hadits, kisah para nabi & tokoh, katalog
kitab, kitab pesantren, amalan, Asmaul Husna, audiobook, dst.

Yang **belum** ada di jalur A (dibuat ulang otomatis seiring waktu):
- terjemahan Spanyol untuk konten berbahasa Indonesia (`mt_cache`) — dibuat saat
  halaman pertama kali dibuka (penerjemah gratis gtx/MyMemory, lalu Key Pool),
  dan bisa dipanaskan dengan workflow **Warm Translation Cache**;
- sesi hadits hasil kompilasi (cron `*/15` di `dawa-api`);
- statistik, akun admin (dibuat dari secret bootstrap), pengaturan admin.

### 8.2 Jalur B — restore manual dengan skrip

```bash
database/restore-d1.sh --remote     # atau --local
```
Untuk database **kosong**. Isinya sama dengan hasil deploy.yml. Kalau terhenti
karena batas tulis harian, jalankan lagi esok hari: tiap file yang sudah masuk
dicatat di tabel `_restore_log` dalam transaksi yang sama dengan isinya, jadi
tidak ada yang dobel. Diuji saat backup dibuat: restore lokal dari nol berhasil
untuk seluruh 89 seed, dan restore yang sengaja digagalkan di tengah lalu
dijalankan ulang melanjutkan tepat dari file yang gagal (`database/README.md`).

### 8.3 Jalur C — bawa data LIVE dari ulyah-db

Untuk membawa terjemahan Spanyol yang sudah jadi, admin, pengaturan, statistik
dawa.es, dsb. Butuh akses ke akun Cloudflare **lama** (tempat `ulyah-db`).

```bash
# 1) Di akun LAMA — sebaiknya tepat setelah 00:00 UTC (07:00 WIB), kuota baca D1 baru reset
npx wrangler login
database/export-live-ulyah-db.sh --dawa-only      # -> ulyah-db-dawa-<tgl>.sql
#   (tanpa --dawa-only = seluruh database)

# 2) Di akun BARU, SETELAH dawa-db punya skema (jalur A atau B)
npx wrangler login
database/import-to-dawa-db.sh database/ulyah-db-dawa-<tgl>.sql --remote
```

`import-to-dawa-db.sh` memuat dump ke staging lokal, membuang baris bukan milik
dawa (`prune-for-dawa.sql`: `mt_cache` selain `*-es`, statistik situs lain,
admin situs lain, log sementara), lalu menggabungkan dengan
`INSERT OR IGNORE` — baris dari seed tidak ditimpa. Opsi `--replace` ada, tapi
baca peringatannya di kepala skrip.

**Catatan penting jalur C:**
- `ai_key_pool` terenkripsi dengan `KEY_ENCRYPTION_SECRET` lama. Pakai secret
  yang sama di dawa-api (ambil dari GitHub Secrets repo ulyah.com kalau pernah
  disimpan), atau abaikan tabel itu dan donasikan ulang kunci.
- Akun admin lama ikut terbawa (baris dengan `tenant` NULL = pemilik). TOTP-nya
  juga ikut.
- Paket gratis membatasi satu D1 = **500 MB**. Jangan impor dump PENUH ulyah-db
  (±500 MB) mentah-mentah; pakai `--dawa-only` + import (yang mem-prune).

### 8.4 Objek R2 lama (opsional)

Di `ulyah-media` ada objek non-audio yang dirujuk database:

| Prefix | Isi | Wajib? |
|---|---|---|
| `stories/body/{id}.md` | isi kisah yang dipindah dari D1 (kolom `stories.body_r2_key`) | Ya **jika** membawa tabel `stories` dari jalur C dengan `--replace`. Dengan jalur A/B isi kisah sudah ada di D1 dari seed. |
| `mt/{src}-es/{xx}.json` | pecahan cache terjemahan Spanyol | Tidak (dibuat ulang) |
| `ebooks/…` | PDF kisah | Tidak — PDF seed diunggah ulang oleh deploy dari `packages/db-schema/seed/assets` |
| `kids-audio/…`, `media/site/…`, `proofs/…` | upload admin & bukti donasi | Opsional |
| `audio/qori/`, `audio/qori2/` | murottal lama | **Jangan** — sudah diganti CDN |

Salin dengan rclone (S3 API R2, token dari R2 → Manage R2 API Tokens di tiap akun):
```bash
rclone copy lama:ulyah-media/stories/body baru:dawa-media/stories/body --progress
rclone copy lama:ulyah-media/kids-audio   baru:dawa-media/kids-audio   --progress
```
Remote rclone tipe `s3`, provider `Cloudflare`, endpoint
`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

> Saat backup dibuat, R2 di akun ulyah.com sedang **nonaktif** (lihat
> deploy.yml, "Leave R2 out while it is not enabled"), jadi objek di atas baru
> bisa disalin setelah R2 akun lama diaktifkan kembali.

### 8.5 KV `dawa-cache`

Hanya cache (respons API, rate-limit, kursor kompilasi, bendera sekali-jalan).
**Tidak perlu dipindah** — terisi sendiri.

---

## 9. Verifikasi setelah deploy

```bash
curl -s https://api.dawa.es/health          # {"status":"ok",...}
curl -s https://api.dawa.es/                 # {"service":"dawa-api","status":"ok"}
curl -sI https://dawa.es | head -1           # HTTP/2 200
curl -s "https://api.dawa.es/quran/surah/1?lang=es" | head -c 300
```

Checklist di peramban:
- [ ] `https://dawa.es` tampil dalam bahasa Spanyol, tema terracotta.
- [ ] Tidak ada tombol/tautan ke ulyah.com, 1fr.fr, tilawa.de, xad.es.
- [ ] Buka satu surah → terjemahan Spanyol tampil, audio berbunyi (DevTools →
      Network: mp3 dari `cdn.islamic.network` / `everyayah.com`).
- [ ] Radio (`/radio`) memutar.
- [ ] DevTools → Network: semua XHR ke `api.dawa.es`, **tidak ada** ke `api.ulyah.com`.
- [ ] Klik logo 5× → login admin → pasang TOTP → dasbor tampil.
- [ ] `https://dawa.es/sitemap.xml` hanya berisi URL dawa.es.
- [ ] Iklan AdSense muncul (setelah dawa.es disetujui AdSense).

---

## 10. Setelah live

1. **Email `salam@dawa.es`** — Cloudflare → dawa.es → Email → Email Routing →
   buat alamat `salam@dawa.es` diteruskan ke inbox pemilik. Semua teks kontak
   situs memakai alamat ini.
2. **AdSense** — tambahkan `dawa.es` di akun AdSense (`AD_CLIENT_ID` di
   `apps/web/src/lib/ad-config.ts`). File `apps/web/public/ads.txt` sudah ada.
3. **Search Console / Bing** — daftarkan `https://dawa.es/sitemap.xml`. IndexNow
   berjalan otomatis di akhir deploy (kunci di `apps/web/public/indexnow-key.txt`).
4. **Key Pool AI** — portal admin → Key Pool: donasikan kunci (NVIDIA NIM,
   OpenRouter, Groq, Gemini, …) untuk penerjemah & asisten AI. Tanpa kunci pun
   terjemahan tetap jalan lewat gtx/MyMemory gratis.

### Memutus dawa.es dari repo ulyah.com (PENTING kalau satu akun Cloudflare)

Repo `p2nshooter/ulyah.com` **masih** membangun dan men-deploy worker bernama
`dawa-web` dan memasang domain `dawa.es` ke sana di setiap push ke `main`.
Kalau dawa.es mandiri dipasang **di akun Cloudflare yang sama**, deploy
ulyah.com berikutnya akan **menimpa** `dawa-web` mandiri dengan versi lama
(yang memanggil api.ulyah.com). Saat memindahkan:

1. Di repo ulyah.com, hapus dari `.github/workflows/deploy.yml` tiga langkah
   "Build web for dawa.es tenant", "Deploy dawa.es web (dawa-web worker)",
   "Attach dawa.es custom domains to dawa-web" (dan `clean_zone dawa.es …`).
2. Merge itu **sebelum** atau bersamaan dengan deploy pertama dawa.es mandiri.
3. Opsional di ulyah.com: hapus `es` dari `LOCALE_SITE` dan `dawa.es` dari CORS
   kalau ekosistem tidak lagi ingin menaut ke dawa.es.

Kalau dawa.es dipasang di **akun Cloudflare lain**, pindahkan zona dawa.es ke
akun baru (hapus zona di akun lama, tambahkan di akun baru, ganti nameserver di
registrar), lalu hapus langkah dawa dari deploy ulyah.com supaya tidak gagal.

---

## 11. Workflow yang ikut

| Workflow | Pemicu | Fungsi |
|---|---|---|
| `deploy.yml` | push `main`, manual | deploy penuh dawa.es (§7.1) |
| `ci.yml` | setiap push/PR | 32 pemeriksaan + typecheck + build |
| `db-maintenance.yml` | harian 00:20 UTC, manual | prune `mt_cache` salah/tak terpakai, pindah isi kisah ke R2, cek ukuran D1 (batas gratis 500 MB) |
| `warm-mt-cache.yml` | manual (berantai) | memanaskan terjemahan Spanyol |
| `translate-content.yml` | manual | pra-terjemah kitab pesantren ke `es` |
| `generate-audiobooks.yml` | manual | narasi MP3 kisah ke R2 (tanpa API key) |
| `import-morphology.yml` | manual | impor morfologi (nahwu-sharaf) Al-Qur'an |
| `fetch-kitab-sources.yml`, `clean-pesantren-text.yml`, `link-pesantren-hadits.yml` | manual | pengolahan korpus kitab |
| `i18n-consistency-patrol.yml` | jadwal | patroli konsistensi bahasa |
| `import-murottal.yml`, `purge-murottal-r2.yml` | manual | mirror/purge murottal R2 — **tidak disarankan** (AUDIO-CDN.md) |
| `codeql.yml` | jadwal, PR | analisis keamanan |

---

## 12. Batas paket gratis & masalah umum

| Gejala | Sebab | Jalan keluar |
|---|---|---|
| Error **1027** di semua halaman | kuota 100.000 request Workers/hari habis (satu akun) | tunggu reset 00:00 UTC; pastikan R2 `dawa-next-cache` aktif (cache halaman); atau Workers Paid ($5/bln) |
| Error **1102** | CPU/subrequest Worker melewati batas | API sudah memakai edge cache; kurangi rute dinamis |
| Admin tidak bisa login, situs tetap tampil | D1 **penuh 500 MB** → semua tulis gagal | jalankan **D1 Maintenance** (prune-mt-arabic, prune-mt-unserved, spill); `scripts/d1-ceiling.ts` memperingatkan di 400 MB |
| Deploy gagal kode **10136** / "Please enable R2" | R2 nonaktif di akun (biasanya metode bayar) | aktifkan R2; sementara itu deploy otomatis jalan tanpa binding R2 |
| **522** di dawa.es | record DNS placeholder menghalangi custom domain | token perlu DNS:Edit (deploy menghapusnya) atau hapus A/AAAA/CNAME `dawa.es`/`www` manual |
| "Cannot resolve the D1 database id" | token tanpa D1:Edit/Read | tambah izin atau set Variable `CLOUDFLARE_D1_DATABASE_ID` |
| Kuota baca D1 (kode 7500) | 5 juta baris/hari habis | jalankan pekerjaan berat tepat setelah 00:00 UTC |
| Seed berhenti, "daily limit"/batas tulis | 100 ribu baris tulis/hari (D1 gratis) | jalankan deploy / `restore-d1.sh` lagi esok hari — melanjutkan sendiri |
| Terjemahan Spanyol belum muncul | `mt_cache` masih kosong (jalur A) | buka halamannya sekali / jalankan Warm Translation Cache / bawa data (jalur C) |

---

## 13. Peta file penting

| File | Isi |
|---|---|
| `apps/web/src/lib/tenant.ts` | identitas situs (nama, logo, fitur) — hanya `dawa` |
| `apps/web/.env.production` | `NEXT_PUBLIC_TENANT=dawa`, `NEXT_PUBLIC_API_URL` |
| `packages/shared/src/i18n.ts` | registri bahasa, `LOCALE_SITE`, `MT_TARGET_LANGS` |
| `packages/shared/src/routes.ts` | slug URL per bahasa |
| `apps/web/src/middleware.ts` | bahasa, redirect, hreflang, header keamanan |
| `apps/web/src/lib/qori-cdn.ts` | daftar qari & URL CDN |
| `apps/web/src/lib/ad-config.ts` | akun & slot AdSense |
| `apps/web/src/styles/themes/spain.css` | tema visual dawa.es |
| `apps/web/public/brand/dawa/` | logo, ikon, banner dawa.es |
| `apps/worker-api/wrangler.toml` | nama worker, domain API, binding D1/KV/R2/DO/AI, cron |
| `apps/web/wrangler.jsonc` | worker web + R2 cache halaman |
| `apps/worker-api/src/index.ts` | router API, CORS, edge cache, cron |
| `apps/worker-api/src/lib/mt.ts` | penerjemah mesin + masker teks Arab |
| `apps/worker-api/src/env.ts` | daftar lengkap binding & secret yang dibaca Worker |
| `docs/CONTENT-POLICY.md` | kebijakan konten & lisensi |
