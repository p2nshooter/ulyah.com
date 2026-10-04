#!/usr/bin/env bash
# ============================================================================
# restore-d1.sh — bangun database D1 `dawa-db` dari NOL:
#   skema (57 migrasi) + seluruh seed (Qur'an 11 bahasa, 12 kitab hadits,
#   kisah nabi/tokoh, perpustakaan kitab, pesantren, amalan, dll).
#
# Isinya sama dengan yang dibangun .github/workflows/deploy.yml saat push ke
# main (Spanyol diimpor tepat setelah teks Arab). Skrip ini untuk restore MANUAL
# atau untuk membangun database LOKAL (wrangler dev). Diuji: restore lokal dari
# nol, 89 file seed, ±6 menit, database 157 MB.
#
# Pakai (dari folder mana saja):
#   ./restore-d1.sh --local                  # database lokal (.wrangler/state)
#   ./restore-d1.sh --remote                 # database dawa-db di Cloudflare
#   PROJECT=/path/ke/dawa-es ./restore-d1.sh --remote
#
# Syarat --remote: `npx wrangler login` ATAU env CLOUDFLARE_API_TOKEN +
# CLOUDFLARE_ACCOUNT_ID (token butuh izin D1:Edit). Database `dawa-db` dibuat
# otomatis kalau belum ada.
#
# BISA DILANJUTKAN. Paket gratis D1 membatasi 100.000 baris tulis per hari dan
# seed penuh menulis lebih dari itu, jadi --remote di akun gratis bisa berhenti
# di tengah ("daily limit"). Jalankan lagi esok hari: setiap file yang sudah
# masuk dicatat di tabel _restore_log DALAM TRANSAKSI YANG SAMA dengan isinya
# (satu file D1 = satu transaksi), jadi file yang gagal tidak tercatat dan file
# yang sudah masuk tidak diulang.
#
# Untuk database yang dibangun deploy.yml (tanpa _restore_log) skrip ini tidak
# diperlukan dan menolak jalan — deploy sudah mengisinya.
# ============================================================================
set -euo pipefail

MODE="${1:---local}"
case "$MODE" in --local|--remote) ;; *) echo "Pakai: $0 --local|--remote"; exit 2 ;; esac

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="${PROJECT:-$HERE/../dawa-es}"
DB="${D1_DATABASE_NAME:-dawa-db}"
API="$PROJECT/apps/worker-api"
SEED="$PROJECT/packages/db-schema/seed"
[ -f "$API/wrangler.toml" ] || { echo "Tidak menemukan $API/wrangler.toml — set PROJECT=/path/ke/dawa-es"; exit 1; }
cd "$API"

WR="npx wrangler"
[ -x node_modules/.bin/wrangler ] && WR="node_modules/.bin/wrangler"

if [ "$MODE" = "--remote" ]; then
  # wrangler.toml menyimpan placeholder __D1_DATABASE_ID__ (deploy.yml mengisinya
  # saat CI). Untuk restore manual: cari/buat dawa-db lalu isi placeholder-nya.
  if grep -q "__D1_DATABASE_ID__" wrangler.toml; then
    ID=$($WR d1 list --json 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);const d=j.find(x=>x.name==='$DB');console.log(d?d.uuid:'')}catch{console.log('')}})")
    if [ -z "$ID" ]; then
      echo "Membuat D1 $DB ..."
      $WR d1 create "$DB"
      ID=$($WR d1 list --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.find(x=>x.name==='$DB').uuid)})")
    fi
    echo "D1 $DB = $ID"
    cp wrangler.toml wrangler.toml.bak
    sed -i "s/__D1_DATABASE_ID__/$ID/" wrangler.toml
  fi
fi

q() { # q "<SQL>" -> baris hasil, satu nilai kolom pertama per baris
  $WR d1 execute "$DB" "$MODE" --json --command="$1" 2>/dev/null \
    | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{for(const r of JSON.parse(s)[0].results)console.log(Object.values(r)[0])}catch(e){process.exit(1)}})"
}

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; [ -f wrangler.toml.bak ] && mv -f wrangler.toml.bak wrangler.toml; return 0; }
trap cleanup EXIT

run() {
  local f="$1" key
  key="${f#"$SEED"/}"
  [ -f "$f" ] || { echo "!! seed hilang: $f"; exit 1; }
  if grep -qxF "$key" <<<"$DONE"; then echo "✓ $key (sudah masuk)"; return 0; fi
  echo "→ $key ($(du -h "$f" | cut -f1))"
  # Isi file + penandanya dalam satu eksekusi = satu transaksi.
  cat "$f" > "$TMP/run.sql"
  printf "\nINSERT INTO _restore_log (file) VALUES ('%s');\n" "$key" >> "$TMP/run.sql"
  $WR d1 execute "$DB" "$MODE" --file="$TMP/run.sql" > /dev/null \
    || { echo "!! $key gagal. Kalau karena batas tulis harian D1, jalankan lagi besok — yang sudah masuk dilewati."; exit 1; }
}

echo "=== 1. Skema: migrasi packages/db-schema/migrations ==="
$WR d1 migrations apply "$DB" "$MODE"

$WR d1 execute "$DB" "$MODE" --command="CREATE TABLE IF NOT EXISTS _restore_log (file TEXT PRIMARY KEY, at TEXT NOT NULL DEFAULT (datetime('now')));" > /dev/null
DONE="$(q "SELECT file FROM _restore_log;" || true)"
if [ -z "$DONE" ] && [ "$(q "SELECT COUNT(*) FROM surah;")" != "0" ]; then
  echo "dawa-db sudah berisi Al-Qur'an tetapi tidak dibangun oleh skrip ini (kemungkinan oleh deploy.yml)."
  echo "Restore tidak diperlukan. Untuk membangun ulang dari nol: hapus lalu buat lagi D1 $DB."
  exit 1
fi

echo "=== 2. Al-Qur'an: teks Arab + Indonesia, lalu Spanyol, lalu 9 bahasa lain ==="
run "$SEED/quran_seed.sql"
for lang in es en ru de fr zh bn sv tr ur; do run "$SEED/quran_seed_${lang}.sql"; done
run "$SEED/curated_content.sql"
run "$SEED/kisah_yusuf.sql"

echo "=== 3. Hadits shahih pilihan + terjemahan tulisan tangan (es/de/fr) ==="
run "$SEED/hadith_shahih.sql"
for f in "$SEED"/translations/*.sql; do run "$f"; done

echo "=== 4. Kitab hadits (9 kitab + Arba'in, Qudsi, Dehlawi, Ahmad, Darimi, Riyadhus) ==="
for col in bukhari muslim tirmidhi abudawud nasai ibnmajah malik nawawi qudsi dehlawi; do
  run "$SEED/hadith_${col}.sql"
done
run "$SEED/hadith_ahmad_darimi_catalog.sql"
run "$SEED/hadith_ahmad.sql"
run "$SEED/hadith_darimi.sql"
run "$SEED/hadith_riyadhus.sql"

echo "=== 5. Kisah (nabi, umat terdahulu, tokoh) ==="
for k in musa dzulqarnain ashabul_kahfi luqman qarun ashabul_ukhdud ashabul_fil ashabul_qaryah \
         ashabul_jannah habil_qabil kaum_saba ashabus_sabt sapi_betina nuh maryam sulaiman ibrahim \
         adam idris hud salih lut ismail ishaq yaqub ayyub syuaib harun dzulkifli dawud ilyas ilyasa \
         yunus muhammad; do
  run "$SEED/kisah_${k}.sql"
done
run "$SEED/wali_songo.sql"
run "$SEED/ulama_nusantara.sql"

echo "=== 6. Perpustakaan kitab + kitab pesantren ==="
run "$SEED/kitab_library.sql"
run "$SEED/pesantren_kitab.sql"
run "$SEED/pesantren_desc_upgrade.sql"
run "$SEED/pesantren_aqidatul_full.sql"
run "$SEED/pesantren_full_texts.sql"
run "$SEED/pesantren_balaghah.sql"
run "$SEED/pesantren_faraidh_mantiq.sql"
run "$SEED/pesantren_full_texts_2.sql"

echo "=== 7. Amalan, Asmaul Husna, kisah anak, audiobook, indeks tokoh ==="
run "$SEED/amalan_harian.sql"
run "$SEED/asmaul_husna.sql"
run "$SEED/kisah_anak.sql"
run "$SEED/kisah_anak_batch2.sql"
run "$SEED/audiobook_library.sql"
for p in nabi sahabat ulama tabiin; do run "$SEED/kisah_person_${p}.sql"; done

echo "=== 8. Pesantren putaran 3-4, Sullam, Doa Mustajab ==="
run "$SEED/pesantren_full_texts_3.sql"
run "$SEED/pesantren_full_texts_4.sql"
run "$SEED/pesantren_sullamtaufiq.sql"
run "$SEED/amalan_doa_mustajab.sql"

echo "=== 9. Kisah lengkap berbab + Nasakh-Mansukh ==="
run "$SEED/kisah_nabi_full.sql"
run "$SEED/kisah_nabi_full_v2.sql"
run "$SEED/kisah_tokoh_full.sql"
run "$SEED/nasakh_mansukh.sql"

echo
echo "=== Selesai. Ringkasan: ==="
echo "File seed tercatat: $(q "SELECT COUNT(*) FROM _restore_log;")"
$WR d1 execute "$DB" "$MODE" --command="SELECT (SELECT COUNT(*) FROM surah) AS surah, (SELECT COUNT(*) FROM ayah) AS ayah, (SELECT COUNT(*) FROM translation WHERE lang='es') AS terjemah_es, (SELECT COUNT(*) FROM hadits) AS hadits, (SELECT COUNT(*) FROM stories) AS stories, (SELECT COUNT(*) FROM kitab_book) AS kitab, (SELECT COUNT(*) FROM mt_cache) AS mt_cache;"
