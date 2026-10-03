# Backup dawa.es — proyek mandiri

Backup penuh situs **dawa.es** (Dawa — El Portal Islámico en Español), diambil
dari ekosistem ulyah.com dan **sudah diputus** dari ulyah.com: API, database,
cache, penyimpanan, domain, CORS, tautan situs saudara, dan email semuanya kini
milik dawa.es sendiri.

## Mulai dari mana

| Kalau Anda… | Baca |
|---|---|
| ingin langsung men-setup / AI yang melanjutkan | **[PANDUAN-SETUP-DAWA-ES.md](./PANDUAN-SETUP-DAWA-ES.md)** — §0 berisi ringkasan satu layar |
| butuh izin API token Cloudflare | PANDUAN §5 |
| butuh daftar GitHub Secrets | PANDUAN §6 |
| mengurus database | [database/README.md](./database/README.md) + PANDUAN §8 |
| mencari file/URL audio | [AUDIO-CDN.md](./AUDIO-CDN.md) — tidak ada audio di backup; semuanya CDN |
| ingin tahu apa saja yang diubah dari aslinya | [STANDALONE-CHANGES.md](./STANDALONE-CHANGES.md) |
| ingin cek keutuhan file | `sha256sum -c CHECKSUMS.sha256` |

## Kalau backup diterima dalam 3 bagian

| File | Isi |
|---|---|
| `…-bagian1-kode-panduan.zip` | semua kode, panduan, migrasi D1, skrip database, aset |
| `…-bagian2-database-hadits.zip` | seed `hadith_*.sql` (13 kitab hadits) |
| `…-bagian3-database-lainnya.zip` | seed lain: Al-Qur'an 11 bahasa, kisah, kitab, pesantren, amalan, terjemahan, PDF |

Ekstrak **ketiganya ke folder yang sama** — hasilnya satu folder
`dawa-es-backup/` yang utuh. Cek kelengkapan:
`cd dawa-es-backup && sha256sum -c CHECKSUMS.sha256` (semua harus `OK`).
Tanpa bagian 2 dan 3, kode tetap lengkap tetapi database tidak bisa dibangun.

## Isi

- `dawa-es/` — seluruh kode (web Next.js, API Hono, paket bersama, skrip,
  workflow GitHub Actions) + **database lengkap dalam bentuk migrasi & seed**
  (`dawa-es/packages/db-schema/`, ±125 MB SQL: Al-Qur'an 11 bahasa, 12+ kitab
  hadits, kisah, kitab, pesantren, amalan).
- `database/` — skrip restore, ekspor data live dari ulyah-db, dan impor ke dawa-db.

## Tiga langkah tercepat

1. Buat repo GitHub baru dari isi `dawa-es/` (branch `main`).
2. Isi 4 secret: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
   `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`.
3. Jalankan workflow **Deploy to Cloudflare**. Database, KV, R2, API, web, dan
   domain dibuat semuanya otomatis.

Sebelum langkah 3, baca PANDUAN §10 bagian *"Memutus dawa.es dari repo
ulyah.com"* — kalau memakai akun Cloudflare yang sama, deploy ulyah.com bisa
menimpa worker `dawa-web`.
