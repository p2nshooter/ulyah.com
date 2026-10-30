# Blueprint data R2 — ulyah.com, xad.es, 1fr.fr, tilawa.de dan situs mitra

Ditulis 20 Okt 2026 atas perintah pemilik. Desain penyimpanannya sama dengan axto.io dan xaa.es (repo guardian-ai dan
xaa, `docs/R2-DATA-BLUEPRINT.md`): satu pustaka „R2 Store" yang sama dan aturan tulis yang sama.

## 1. Perintah pemilik

> „Catat ya baik di axto.io maupun di xaa.es, ulyah.com  xad.es 1fr.fr tilawa.de dan semua yg membutuhkan penyimpanan,
> wajib ke R2, jgn pernah ke D1" — 20 Okt 2026

> „Database semuanya ke R2 ya, jgn ada yg ke d1... Manfaatin R2, penuhin disana" — 20 Okt 2026

> „Semua database wajib ke R2, pastikan hemat D1" — 30 Okt 2026

Aturan tetap (juga di `CLAUDE.md`): **semua penyimpanan ke R2, tidak pernah ke D1** — tidak ada database, tabel,
migrasi atau query D1 baru. Isi `ulyah-db` dipindah bertahap sampai binding D1 bisa dilepas.

## 2. Keadaan sekarang (diperiksa 20 Okt 2026)

| Hal | Fakta |
|---|---|
| D1 | `ulyah-db` (±484 MB, 57 migrasi di `packages/db-schema/migrations`, 71 tabel), dipakai `apps/worker-api` (`ulyah-api`) untuk semua situs di repo ini |
| Masalah | Akun memakai Workers Free: kuota D1 harian (5 juta baca, 100 ribu tulis) dibagi semua database di akun; `ulyah-db` pemakai terbesar, dan D1 berhenti menerima tulisan di 500 MB (lihat README „Storage discipline") |
| R2 | Sudah dipakai untuk media dan cache halaman (`MEDIA_R2`, aturan siklus hidup di `.github/r2-lifecycle/`) |
| KV | `CACHE_KV` — cache saja; boleh tetap untuk data sementara ber-TTL |

### 2.1 Diukur lagi 30 Okt 2026

`ulyah-db` **498 MB dari batas 500 MB** (dan masih bertambah: +32 KB dalam beberapa menit). Saat penuh, D1 menolak
semua tulisan — termasuk yang bukan terjemahan. Perkiraan baris (`MAX(rowid)`, satu baca per tabel, supaya
pengukuran sendiri tidak menghabiskan kuota baca):

| Tabel | Baris | Sifat |
|---|---|---|
| `mt_cache` (cache terjemahan mesin) | ±1,9 juta | **penulis terbesar**: Worker menulis setiap terjemahan baru; baris terakhir di seluruh D1 ditulis di sini |
| `key_validation_log` | ±147 rb | log, terus bertambah |
| `quran_morphology` | ±130 rb | referensi, hanya-baca |
| `hadits` | ±100 rb | referensi, hanya-baca |
| `analytics_pageviews` | ±96 rb | event, terus bertambah |
| `translation` (terjemahan Al-Qur'an) | ±69 rb | referensi, hanya-baca |
| `live_presence`, `scaling_metrics`, `generation_jobs` | 15 rb, 12 rb, 7 rb | event/log |
| `pes_i18n` (terjemahan kitab pesantren) | ±12 rb | terjemahan; bahasa Inggris tidak lengkap |

## 3. Desain

Sama dengan blueprint axto.io/xaa.es §3: kunci `c/<koleksi>/<id>.json` (dokumen), `u/…` (penjaga keunikan,
If-None-Match), `i/…/<urut>~<id>` (index + ringkasan di customMetadata), `k/…` (pengaturan, rahasia terenkripsi
AES-GCM), `l/…` (log append-only), backup harian ke bucket privat (35 hari). Konten referensi yang hanya dibaca
(Al-Qur'an, terjemahan, tafsir, hadits, kitab) tidak perlu dokumen per baris: disimpan sebagai **pecahan JSON statis per
surah / per kitab / per bahasa** di R2 (atau di aset build), dibaca langsung oleh Worker dengan cache tepi — lebih
murah dan lebih cepat daripada D1.

## 4. Peta tabel → R2 (71 tabel)

| Kelompok | Tabel D1 | Bentuk di R2 |
|---|---|---|
| Al-Qur'an & audio | surah, ayah, translation, tafsir, quran_morphology, asbabun_nuzul, nasakh_mansukh, ayah_hadits_map, qori, audio_cache, audio_transcript_sync | pecahan JSON per surah × bahasa (`content/quran/<lang>/<surah>.json`), indeks qori; hanya-baca |
| Hadits | hadits, hadits_collection | pecahan JSON per koleksi/bab |
| Kitab & pesantren | kitab_book, kitab_category, pesantren_category, pesantren_kitab, pesantren_bab, pesantren_matn, pes_i18n, pes_i18n_meta, ebooks | pecahan JSON per kitab × bahasa + katalog |
| Kisah, anak, amalan | stories, kisah_person, kisah_person_section, kisah_anak, kids_audio, video_anak, video_anak_channel, amalan_category, amalan_item, categories, hajj_package, live_stream | dokumen per item + index per kategori |
| Terjemahan mesin | mt_cache | satu objek per kunci terjemahan (hash), lifecycle untuk yang tidak dibaca |
| Iklan & statistik | ad_config, ad_daily, ad_events, adops_actions, adops_adunits, adops_daily, adops_floors, adops_sites, analytics_pageviews, site_hits, site_pageviews, scaling_metrics, live_presence, app_installs, app_uninstalls | **satu objek event per kejadian** + rollup harian oleh cron (tidak ada kunci panas); konfigurasi = dokumen |
| Admin & situs | admin_users, admin_settings, admin_audit_log, locale_settings, tenant_pages, site_media, clients, proposal, outreach_email, license_sources, oss_source, affiliate_shelf, affiliate_tag, voice_persona | dokumen + penjaga keunikan (email admin); audit = log append-only |
| Donasi (uang) | donor, donation_logs, donation_proofs, donation_proofs_new | dokumen; status = transisi bersyarat (If-Match), ID deterministik — tidak pernah tercatat dua kali |
| Kunci AI | ai_key_pool, key_validation_log, generation_jobs | dokumen terenkripsi; log append-only |

## 5. Urutan pindah

Diurutkan ulang 30 Okt menurut ukuran dan tulis yang diukur (§2.1) — „hemat D1" dulu:

1. **Terjemahan → R2, tanpa tulis D1.**
   - `pes_i18n`: satu objek per kitab × bahasa (`pes-i18n/<kitab>/<bahasa>.json`); isi D1 disalin sekali dengan
     kunci yang sama dan dicek per objek; pekerjaan terjemahan menulis ke R2 saja (dan menyertakan bahasa Inggris).
   - `mt_cache`: Worker berhenti menulis ke D1; terjemahan baru disimpan di R2. Pekerjaan pemanasan menulis langsung ke
     pecahan R2 dan menghangatkan kunci yang benar-benar dibaca halaman (hadits dari teks yang dikurasi).
2. **Event dan log → R2:** `analytics_pageviews`, `live_presence`, `scaling_metrics`, `key_validation_log`, event iklan —
   satu objek per kejadian + rollup harian (tidak ada kunci panas).
3. **Konten referensi hanya-baca → pecahan JSON di R2:** hadits, morfologi, terjemahan Al-Qur'an, kitab, kisah.
4. **Admin, donasi, kunci AI** → koleksi R2 dengan migrasi sekali (ID sama, setiap baris diperiksa).
5. Setiap modul: D1 hanya-baca 7 hari sebagai cadangan, lalu tabelnya dikosongkan/dihapus; setelah modul terakhir,
   ekspor terakhir ke bucket backup dan binding D1 dilepas.

## 6. Status

| Butir | Status |
|---|---|
| Aturan dicatat (`CLAUDE.md`, blueprint ini) | ✅ 20 Okt |
| Pengukuran ulang + urutan „hemat D1" (§2.1, §5) | ✅ 30 Okt |
| 1. Terjemahan → R2 (`pes_i18n`, `mt_cache`) | 🔄 30 Okt |
| 1a. `pes_i18n` → `pes-i18n/<bahasa>/<kitab>.json` + `_index.json` | 🔄 PR — pekerjaan terjemahan menyalin isi D1 sekali (kunci sama, setiap objek dibaca ulang dan dicocokkan, total = jumlah baris D1), lalu hanya menulis R2, dengan bahasa Inggris; Worker membaca R2 dulu, D1 hanya cadangan hanya-baca 7 hari setelah tayang, lalu `pes_i18n` + `pes_i18n_meta` dihapus |
| 1b. `mt_cache` → R2 | ⏳ berikutnya |
| 2–5 | ⏳ berurutan setelah tahap 1 |
