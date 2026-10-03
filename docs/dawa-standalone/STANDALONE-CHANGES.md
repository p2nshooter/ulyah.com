# Perubahan dari monorepo ulyah.com → dawa.es mandiri

Semua perubahan dibuat oleh `scripts/export-dawa-standalone.mjs` di repo
ulyah.com (generator backup ini). Setiap suntingan spesifik di skrip itu
**menegaskan** teks yang dicarinya ada — kalau kode induk berubah, generator
berhenti alih-alih diam-diam menghasilkan backup yang masih tersambung.
Jumlah file yang terkena tiap penggantian global tercatat di `BACKUP-INFO.md`.

## 1. Tidak ikut disalin

| Path | Alasan |
|---|---|
| `quantum/` | sistem karoseri CV. Quantum Karya Bersama — aplikasi lain, bukan dawa.es |
| `.github/workflows/deploy-quantum.yml` | deploy Quantum |
| `.github/workflows/deploy-partner-sites.yml` | deploy profity.in + oldco.in |
| `node_modules/`, `.next/`, `.open-next/`, `.wrangler/` | hasil instalasi/build — dibuat ulang |

## 2. Penggantian global (semua file teks, KECUALI migrasi & seed D1)

| Dari | Ke |
|---|---|
| `api.ulyah.com` | `api.dawa.es` |
| `ulyah-db` | `dawa-db` |
| `ulyah-cache` | `dawa-cache` |
| `ulyah-media` | `dawa-media` |
| `ulyah-next-cache` | `dawa-next-cache` |
| `ulyah-api` / `ulyah-web` | `dawa-api` / `dawa-web` |
| `salam@ulyah.com` | `salam@dawa.es` |
| `NEXT_PUBLIC_TENANT ?? "ulyah"` / `\|\| "ulyah"` | `… "dawa"` (default tenant = dawa) |
| uuid ulyah-db `28800662-…` | `<UUID-dawa-db>` (D1 baru punya uuid baru) |
| User-Agent `… ulyah.com …` ke layanan luar | `… dawa.es …` |

## 3. Suntingan spesifik

### Bahasa & tautan ekosistem
- `packages/shared/src/i18n.ts`
  - `LOCALE_SITE` = hanya `{ es: "https://dawa.es" }` (dulu en→xad.es,
    de→tilawa.de, es→dawa.es, fr→1fr.fr).
  - `HUB_SITE` = `https://dawa.es`, `HUB_DEFAULT` = `es`.
  - `MT_TARGET_LANGS` = `["es"]` (dulu id/en/de/es/fr).
  - Tenant default saat `NEXT_PUBLIC_TENANT` kosong = `"all"` (build Worker API:
    daftar bahasa tidak dipersempit — perilaku API sama persis seperti dulu).
- `apps/web/src/middleware.ts` — hreflang hanya bahasa situs sendiri
  (dulu 5 domain); `x-default` menunjuk dawa.es.
- `apps/web/src/lib/tenant.ts` — peta `TENANTS` hanya berisi `dawa`, fallback
  `DAWA` (konfigurasi ulyah/1fr/tilawa/xad tidak lagi terbundel ke JS pengunjung).
- `apps/web/.env.production`, `apps/web/.env.development` (BARU) —
  `NEXT_PUBLIC_TENANT=dawa`, `NEXT_PUBLIC_API_URL=https://api.dawa.es`.

### Worker API
- `apps/worker-api/src/index.ts` — CORS hanya `https://dawa.es`,
  `https://www.dawa.es` (dulu + ulyah.com, 1fr.fr, tilawa.de, xad.es, axto.io/.dev/.us).
- `apps/worker-api/wrangler.toml` — `name = "dawa-api"`, domain `api.dawa.es`,
  `database_name = "dawa-db"`, `bucket_name = "dawa-media"` (dulu placeholder),
  `PUBLIC_SITE_URL = "https://dawa.es"`, `API_BASE_URL = "https://api.dawa.es"`.
- `routes/analytics.ts` — trafik tanpa Origin dikenali sebagai `dawa` (dulu `ulyah`).
- `routes/ai.ts`, `lib/orchestra.ts` — nama situs default asisten AI = "Dawa".
- `routes/admin.ts`, `routes/content.ts` — tenant default `dawa` untuk halaman
  admin, paket haji/umrah, dan sampul OG.
- `lib/content-bot.ts` — daftar situs bot artikel dikosongkan (dulu menulis ke
  repo jai.lat, lie.skin, axto.dev, xaa.es, axto.us, oldco.in, profity.in).
- `lib/paypal.ts`, `lib/nowpayments.ts` — deskripsi donasi
  "Donación Dawa (dawa.es)", `brand_name` PayPal "Dawa".
- `routes/grant.ts` — situs, logo, nama organisasi di proposal = dawa.es.

### Web
- `apps/web/wrangler.jsonc` — `name = "dawa-web"`, bucket `dawa-next-cache`,
  `NEXT_PUBLIC_API_URL = https://api.dawa.es`.
- `components/GlobalRadioPlayer.tsx` — metadata Media Session (layar kunci
  ponsel) "Dawa", bukan "ULYAH.COM".
- `components/kids/KidsCertificate.tsx` — "dawa.es — Al-Qur'an Kids".
- `components/admin/GrantTab.tsx`, `KaggleGuideTab.tsx` — logo & situs dawa.es.
- `public/manifest.json` — ditulis ulang untuk Dawa (bahasa `es`, ikon dawa).

### Workflow
- `.github/workflows/deploy.yml` — dibuang: build/deploy/domain untuk ulyah.com,
  1fr.fr, tilawa.de, xad.es, dan pembuatan zona xad.es. Pembersihan DNS hanya
  zona dawa.es (+ api.dawa.es). Smoke test hanya dawa.es.
- `.github/workflows/ci.yml` — pemeriksaan bahasa & tautan internal hanya untuk
  tenant `dawa`; build web dengan `NEXT_PUBLIC_TENANT=dawa`. Dibuang (khusus
  ekosistem 5 situs): "no two sites recite in the same voice" dan "canonical
  urls and hreflang reciprocity".
- `.github/workflows/translate-content.yml`, `scripts/translate-pesantren.ts`,
  `scripts/warm-mt-cache.ts` — bahasa target default hanya `es`.

- `.github/workflows/deploy.yml`, langkah "Seed Qur'an…" — di induk semua-atau-
  tidak (hanya jalan kalau `surah` kosong), sehingga run yang terputus batas
  tulis harian D1 melewati sisa bahasa selamanya, dan Spanyol ada di urutan
  ke-6. Sekarang: teks Arab → **Spanyol** → 9 bahasa lain, tiap bahasa
  digerbang jumlah barisnya sendiri; hanya Arab + Spanyol yang menggagalkan deploy.

### Database
- `packages/db-schema/migrations/0057_dawa_standalone.sql` (BARU) — menghapus
  akun admin/demo 1fr.fr & tilawa.de (ditanam migrasi 0037) dan paket haji
  situs lain (0038), supaya akun situs lain tidak bisa login ke api.dawa.es.
  Migrasi 0001–0056 tidak diubah.

### Skrip
- `scripts/check-mt-targets.ts` — ditulis ulang untuk aturan satu bahasa (es).
- `scripts/check-murottal-cdn.ts` — "server kita" = dawa.es.
- `scripts/notify-search-engines.ts` — IndexNow hanya dawa.es.
- `scripts/measure-locale-content.ts` — uuid D1 dari env `D1_DATABASE_ID`.
- `scripts/generate-kisah-*-pdfs.ts` — header PDF "DAWA.ES — …".

### Data (satu-satunya seed yang disentuh)
- `packages/db-schema/seed/kisah_nuh.sql` — ID ebook Nabi Nuh dipindah dari
  400–413 ke **1400–1413**. `kisah_luqman.sql` juga memakai 400–409, sehingga di
  database baru `kisah_nuh.sql` gagal dengan
  `UNIQUE constraint failed: ebooks.id` (di ulyah-db produksi, langkah itu
  `continue-on-error`, jadi salah satunya diam-diam tidak masuk). ID dipindah
  di baris `ebooks` DAN di `pdf_ebook_id` kisahnya, jadi tautan PDF tetap benar.
  Seed & migrasi lain disalin byte-per-byte.

## 4. Sengaja TIDAK diubah

| Hal | Alasan |
|---|---|
| Nama paket `@ulyah/*` | namespace workspace; ratusan import. Bukan koneksi jaringan. |
| Cookie `ulyah_locale`, kunci localStorage `ulyah_*` | nama internal di peramban pengunjung |
| Teks "ulyah.com"/"Ulyah" di kamus & label | diganti otomatis saat runtime oleh `lib/rebrand.ts` / `dictionaries/index.ts` menjadi "dawa.es"/"Dawa" |
| Konfigurasi tenant ulyah/1fr/tilawa/xad di `tenant.ts`, `radio-clock.ts`, `qori-cdn.ts`, panel admin | kode multi-tenant yang tidak dirujuk build dawa; dibiarkan agar diff dengan induk tetap kecil |
| Teks bantuan panel admin (tab Grant, Orchestra, Kaggle, Backlog, Languages) | hanya terlihat pemilik; menjelaskan sejarah ekosistem |
| Migrasi D1 (termasuk `DEFAULT 'ulyah'` di beberapa kolom `tenant`) | skema harus identik dengan ulyah-db agar dump live bisa diimpor tanpa konversi; kode menulis `dawa` secara eksplisit |
| PDF kisah di `seed/assets` | file biner hasil render lama (header "ULYAH.COM"); render ulang dengan `npx tsx scripts/generate-kisah-*-pdfs.ts` kalau ingin header DAWA.ES |
