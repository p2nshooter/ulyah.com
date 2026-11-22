# Mesin Penerjemah ulyah.com

## 1. Perintah pemilik

| Tanggal | Perintah |
|---|---|
| 22 Nov 2026 | „Bikinin engine penerjemah bahasa, cek di portal admin ulyah.com, bahasa apa aja yg blm di kerjakan, tolong bikin engine penerjemah nya, biar semuanya 100% setiap bahasa, tolong hati2 saat menerjemahkan alquran, kitab2 dan hadits2" |
| 22 Nov 2026 | „Jgn ke D1, pindah ke R2, jgn pernah memakai D1 sebagai database" |

Perintah ini menggantikan „terjemahin aja manual jgn make mesin" (job penghangat lama dimatikan karena itu dan karena
ia menulis ke D1).

## 2. Yang ditemukan di portal admin (22 Nov 2026)

Tab **Bahasa** menunjukkan UI 100% untuk semua bahasa, tetapi angka Konten tidak bisa dipercaya: ia dihitung dari baris
D1 `mt_cache` *relatif terhadap bahasa terbanyak* (es dianggap 100%), bukan terhadap jumlah tulisan yang sebenarnya.
Bahasa yang belum selesai: semua 23 bahasa yang tidak punya situs sendiri (bn, fa, ha, hi, it, ja, ko, ms, nl, pl, ps,
pt, ru, so, sw, ta, th, tr, ur, uz, vi, zh — antara 0,8% dan 18,7%), dan en/de/fr (97,6% / 93,5% / 95%). Job penghangat
dimatikan, menulis D1, dan punya satu fase yang menerjemahkan **matan hadits Arab** dengan mesin (ar→fr/de) — itu
dihapus.

## 3. Desain

| Bagian | Di mana | Isi |
|---|---|---|
| Terjemahan | R2 `mt/<src>-<tgt>/<2 huruf hash>.json` | `{ "mt:<src>-<tgt>:<hash>": "<terjemahan>" }` — pecahan yang sama yang dibaca Worker (`lib/mt-r2.ts`) |
| Korpus | R2 `mt/_corpus/<src>.json` | `{ hash: teks }` — semua tulisan situs yang diminta untuk diterjemahkan (sumber `id` dan `en`) |
| Permintaan | R2 `mt-want/<src>/<hash>.txt` | ditulis Worker **sekali** (create-once) saat sebuah halaman meminta teks yang belum ada; mesin memasukkannya ke korpus lalu menghapusnya |
| Status | R2 `mt/_state.json` | cakupan per bahasa (selesai/total, dihitung), ukuran korpus, pass terakhir (berapa diterjemahkan, berapa ditolak dan kenapa), pindahan dari D1 |
| Terjemahan manusia | repo `packages/db-schema/seed/translations/*.sql` | ditulis ke R2 setiap pass dengan „replace" — terjemahan orang selalu menang atas mesin |

- **Satu penulis per objek dengan compare-and-swap.** Mesin menulis pecahan dengan `If-Match: <etag>` (atau
  `If-None-Match: *` untuk pecahan baru); bila ada penulis lain di antaranya, pecahan dibaca ulang dan entri digabung —
  tidak ada terjemahan yang hilang. Entri yang sudah ada tidak ditimpa (kecuali terjemahan manusia).
- **Worker tidak pernah menulis pecahan.** Ia hanya membaca R2, menerjemahkan langsung bila perlu (Google → MyMemory →
  Workers AI, disimpan di memo isolate dan cache tepi), dan mencatat permintaan create-once. Tidak ada baca/tulis D1.
- **Semua bahasa** (`ENGINE_TARGET_LANGS`: semua kecuali Arab). Urutan: situs yang punya pembaca hari ini dulu
  (id, en, de, fr, es), lalu yang paling rendah. Setiap pass berjalan ≤ 4 jam, menyimpan hasil tiap 2.000 teks, lalu
  menyambung sendiri ke pass berikutnya sampai semua 100%; jadwal 3 jam sebagai jaring pengaman.
- **Penerjemah:** pool kunci AI donasi (dibaca dari R2 `c/ai_key_pool/`, didekripsi dengan `KEY_ENCRYPTION_SECRET`),
  dengan instruksi khusus perpustakaan Islam (`scripts/ai-translate.ts`); gtx sebagai cadangan.
- **Cakupan diukur, bukan ditaksir:** dari setiap teks di korpus yang bahasa sumbernya bukan bahasa target, berapa yang
  punya terjemahan tersimpan. Ditulis ke `mt/_state.json` dan `scripts/locale-content.json` → `locale-readiness.gen.ts`
  → portal admin. Portal admin membaca `mt/_state.json` langsung (`GET /admin/translation-engine`).

## 4. Al-Qur'an, kitab, hadits — penjaga

1. **Teks Arab tidak pernah diterjemahkan mesin.** Setiap rangkaian huruf Arab (ayat, matan hadits, kutipan kitab, doa,
   ﷺ) dan nama kitab hadits/imam diganti `@@n@@` sebelum dikirim, lalu dikembalikan byte demi byte.
2. Jawaban yang kehilangan, menambah, atau mengubah nomor penanda **ditolak**.
3. Jawaban yang memuat huruf Arab yang tidak ada di sumber (AI „menulis ayat sendiri") **ditolak**.
4. Teks bersumber Arab **tidak** diterjemahkan oleh mesin ini: terjemahan Al-Qur'an adalah terjemahan manusia berlisensi
   (`docs/CONTENT-POLICY.md`); hadits diterjemahkan dari terjemahan Indonesia/Inggris yang dikurasi, tidak dari matan
   Arab (`scripts/check-no-arabic-mt.mjs`). Permintaan bersumber Arab dibuang dan dihitung.
5. Jawaban yang sama persis dengan sumber hanya diterima untuk label pendek yang memang sama (mis. „Hadith"); jawaban
   yang jauh lebih pendek/panjang dari sumber (terpotong/mengarang) ditolak.
6. Satu bagian ditolak → seluruh teks menunggu pass berikutnya (tidak pernah setengah terjemahan).

Dibuktikan oleh `scripts/check-mesin-terjemah.ts` (CI) terhadap R2 tiruan yang menghormati If-Match/If-None-Match.

## 5. Pindahan sekali dari D1

`Mesin Penerjemah (R2)` → *Run workflow* → `move: true`: korpus dari tabel konten lama dan setiap baris `mt_cache`
disalin ke R2 dengan kunci yang sama, lalu setiap pasangan bahasa dibaca ulang dari R2 dan dicocokkan baris demi baris.
Hasilnya dicatat di `mt/_state.json` (`moved.mtCache.verified`). Setelah itu mesin dan Worker tidak membaca D1 lagi;
tabel `mt_cache` dikosongkan/dihapus 7 hari kemudian (`docs/R2-DATA-BLUEPRINT.md` §5).

## 6. Status

| Butir | Status |
|---|---|
| Perintah dicatat | ✅ 22 Nov |
| Mesin R2 + CAS + penjaga kitab suci + cek CI | ✅ 22 Nov |
| Worker: baca R2 saja, permintaan create-once, tanpa D1 | ✅ 22 Nov |
| Portal admin: status langsung dari R2, selesai/total per bahasa | ✅ 22 Nov |
| Pindahan sekali dari D1 (`move: true`) | ⏳ setelah tayang |
| Pool kunci AI di R2 (`c/ai_key_pool/`) | ⏳ — sampai pindah, mesin memakai gtx |
| Semua bahasa 100% | ⏳ berjalan sendiri, pass demi pass |
