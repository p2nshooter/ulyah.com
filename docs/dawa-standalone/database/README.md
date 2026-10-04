# Database dawa.es (Cloudflare D1: `dawa-db`)

## Di mana datanya

Seluruh database dawa.es tersimpan sebagai **SQL yang bisa dibangun ulang**:

| Folder | Isi |
|---|---|
| `dawa-es/packages/db-schema/migrations/` | **57 migrasi** — skema lengkap 66 tabel. 0001–0056 identik dengan ulyah-db; `0057_dawa_standalone.sql` menghapus akun admin & paket haji milik situs lain. |
| `dawa-es/packages/db-schema/seed/` | **89 file seed** (±125 MB SQL) + `seed/translations/` (terjemahan tulisan tangan) + `seed/assets/` (PDF kisah) |

Ini bukan salinan "kira-kira": deploy produksi ulyah.com membangun ulyah-db dari
file yang sama persis, dengan urutan yang sama.

## Terukur saat backup dibuat

Restore lokal **dari nol** dengan `restore-d1.sh --local` — berhasil untuk semua
file, 344 detik:

| Tabel | Baris |
|---|---|
| `surah` / `ayah` | 114 / 6.236 |
| `translation` (Qur'an, 11 bahasa) | 68.596 — termasuk **6.236 baris Spanyol** |
| `hadits` / `hadits_collection` | 38.492 / 13 kitab |
| `stories` (kisah, audiobook, anak) | 410 |
| `kisah_person` / `kisah_person_section` | 62 tokoh / 291 bab |
| `kitab_book` / `kitab_category` | 4.969 / 38 |
| `pesantren_kitab` / `pesantren_bab` / `pesantren_matn` | 32 / 1.280 / 7.843 |
| `amalan_item` | 149 |
| `ebooks` (PDF) | 118 |
| `mt_cache` (terjemahan tulisan tangan es/de/fr) | 2.628 |
| `video_anak`, `live_stream`, `qori`, `voice_persona`, `oss_source`, `donor` | 45, 15, 32, 20, 132, 30 |

**Ukuran file database: 157 MB** — jauh di bawah batas 500 MB paket gratis.
Terbesar: `hadits` 110 MB, `translation` 16 MB, `pesantren_matn` 13 MB,
`kitab_book` 10 MB.

Diuji juga: API mandiri (`wrangler dev`) menyajikan
`/quran/surah/1?lang=es` dengan terjemahan Spanyol dari database hasil restore.

## Tiga jalur (rinci di PANDUAN §8)

| Jalur | Perintah | Kapan |
|---|---|---|
| **A. Otomatis** | push ke `main` → `deploy.yml` | disarankan untuk mulai |
| **B. Manual** | `./restore-d1.sh --remote` (atau `--local`) | restore tanpa GitHub Actions, atau database lokal |
| **C. Data live** | `./export-live-ulyah-db.sh --dawa-only` (akun lama) → `./import-to-dawa-db.sh <dump> --remote` (akun baru) | membawa terjemahan Spanyol yang sudah jadi, admin, pengaturan, statistik dawa.es |

## Apa yang TIDAK ada di seed (hanya di ulyah-db live)

- `mt_cache` terjemahan mesin ke Spanyol (`mt:<src>-es:<hash>`) — dibuat ulang
  otomatis saat halaman dibuka, atau bawa lewat jalur C.
- Sesi hadits yang dikompilasi cron, konten yang dibuat pipeline AI.
- Akun admin + TOTP, `admin_settings`, `tenant_pages` (halaman yang disembunyikan),
  `hajj_package` dawa, `affiliate_*` (toko Amazon.es), `live_stream` yang diubah admin.
- Statistik: `site_pageviews`, `analytics_pageviews`, `ad_daily`, `app_installs`.
- `ai_key_pool` (terenkripsi — butuh `KEY_ENCRYPTION_SECRET` lama).

Jalur C menguji semua ini secara lokal saat backup dibuat, dengan dump berformat
asli `wrangler d1 export`: baris `mt:*-es:*` dipertahankan, `mt:*-fr:*` dan
`mt:*-id:*` dibuang, statistik situs lain dibuang, admin pemilik (tenant NULL)
dipertahankan, admin situs lain dibuang, migrasi tidak tersentuh.

## File di folder ini

| File | Guna |
|---|---|
| `restore-d1.sh` | skema + seluruh seed, urutan sama dengan deploy.yml |
| `export-live-ulyah-db.sh` | `wrangler d1 export` dari ulyah-db (semua tabel, atau `--dawa-only`) |
| `import-to-dawa-db.sh` | staging lokal → prune → `INSERT OR IGNORE` ke dawa-db |
| `prune-for-dawa.sql` | aturan buang-baris-bukan-dawa |

## Catatan

- **Kuota paket gratis:** baca 5 juta baris/hari, tulis 100 ribu baris/hari
  (seluruh akun; indeks ikut dihitung). Seed penuh menulis lebih dari itu, jadi
  di akun gratis butuh 2–3 hari. Keduanya bisa dilanjutkan:
  - **deploy.yml** menggerbang tiap langkah seed dengan jumlah barisnya
    (Qur'an per bahasa, Spanyol lebih dulu), jadi deploy berikutnya meneruskan;
  - **restore-d1.sh** mencatat tiap file di `_restore_log` dalam transaksi yang
    sama dengan isinya (satu file D1 = satu transaksi — diuji: file yang gagal
    tidak meninggalkan satu baris pun), jadi run berikutnya melanjutkan tepat
    dari file yang gagal.
  Banyak seed memakai `INSERT` biasa (bukan `OR IGNORE`), jadi JANGAN menjalankan
  file seed secara manual dua kali — pakai salah satu dari dua mekanisme di atas.
- `seed/kisah_nuh.sql` di backup ini memakai ID ebook 1400–1413 (di repo induk
  400–413, bentrok dengan Kisah Luqman). Lihat STANDALONE-CHANGES.md.
- Ukuran D1 dipantau `scripts/d1-ceiling.ts` (target 400 MB, batas 500 MB)
  oleh workflow D1 Maintenance setiap hari.
