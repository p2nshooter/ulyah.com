#!/usr/bin/env bash
# ============================================================================
# export-live-ulyah-db.sh — ambil ISI LIVE database lama (ulyah-db) dari
# Cloudflare, termasuk semua yang TIDAK ada di seed:
#   - mt_cache  : terjemahan Spanyol yang sudah dibuat (mt:<src>-es:<hash>)
#   - stories   : kisah hasil kompilasi/AI (sebagian isinya sudah pindah ke R2,
#                 lihat kolom body_r2_key — salin juga R2 stories/body/)
#   - pengaturan: admin_users, admin_settings, tenant_pages, hajj_package,
#                 affiliate_*, live_stream, video_anak, kids_audio, …
#   - statistik : site_pageviews, analytics_pageviews, ad_daily, …
#
# Hasil: file .sql (skema + data) yang bisa diimpor dengan import-to-dawa-db.sh.
#
# PERHATIAN — akun ulyah.com memakai Workers FREE plan:
#   * `wrangler d1 export` membaca SETIAP baris. Kuota baca D1 gratis = 5 juta
#     baris/hari untuk SELURUH akun, dan situs-situs ekosistem sudah memakainya.
#     Jalankan tepat setelah kuota di-reset (00:00 UTC = 07:00 WIB), dan pakai
#     --dawa-only kalau cukup tabel yang relevan untuk dawa.es.
#   * Selama ekspor berjalan database bisa tidak melayani query lain sebentar.
#
# Pakai:
#   npx wrangler login                          # atau set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
#   ./export-live-ulyah-db.sh                    # semua tabel  -> ulyah-db-full-<tgl>.sql
#   ./export-live-ulyah-db.sh --dawa-only        # tabel relevan -> ulyah-db-dawa-<tgl>.sql
#   SOURCE_DB=nama-lain ./export-live-ulyah-db.sh
#
# Token API (kalau tidak pakai `wrangler login`): Account → D1 → Read/Edit.
# ============================================================================
set -euo pipefail

SOURCE_DB="${SOURCE_DB:-ulyah-db}"
MODE="${1:-}"
STAMP="$(date -u +%Y%m%d-%H%M)"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTDIR="${OUTDIR:-$HERE}"
WR="npx --yes wrangler@4"

# Tabel yang datanya bermakna untuk dawa.es. Yang tidak ada di sini hanya
# berguna bagi situs ekosistem lain, atau sudah lengkap dari seed.
DAWA_TABLES=(
  d1_migrations
  mt_cache stories tafsir asbabun_nuzul ayah_hadits_map audio_transcript_sync
  kisah_person kisah_person_section kisah_anak video_anak video_anak_channel kids_audio
  kitab_book kitab_category pesantren_category pesantren_kitab pesantren_bab pesantren_matn
  pes_i18n pes_i18n_meta quran_morphology hadits hadits_collection
  admin_users admin_settings locale_settings tenant_pages hajj_package
  affiliate_shelf affiliate_tag live_stream site_media ebooks categories
  ai_key_pool voice_persona license_sources oss_source
  donation_logs donation_proofs donor proposal outreach_email clients
  site_pageviews analytics_pageviews ad_daily app_installs app_uninstalls
)

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "Mencari uuid D1 '$SOURCE_DB' ..."
ID=$($WR d1 list --json 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const d=JSON.parse(s).find(x=>x.name==='$SOURCE_DB');console.log(d?d.uuid:'')}catch{console.log('')}})")
[ -n "$ID" ] || { echo "D1 '$SOURCE_DB' tidak ditemukan. Sudah login ke akun yang benar (npx wrangler whoami)?"; exit 1; }
echo "  $SOURCE_DB = $ID"

cat > "$WORK/wrangler.toml" <<EOF
name = "dawa-export-tmp"
compatibility_date = "2025-01-01"
[[d1_databases]]
binding = "DB"
database_name = "$SOURCE_DB"
database_id = "$ID"
EOF

cd "$WORK"
if [ "$MODE" = "--dawa-only" ]; then
  OUT="$OUTDIR/ulyah-db-dawa-$STAMP.sql"
  TABLE_ARGS=()
  for t in "${DAWA_TABLES[@]}"; do TABLE_ARGS+=(--table "$t"); done
  echo "Ekspor ${#DAWA_TABLES[@]} tabel relevan dawa.es -> $OUT"
  $WR d1 export "$SOURCE_DB" --remote --output="$OUT" "${TABLE_ARGS[@]}"
else
  OUT="$OUTDIR/ulyah-db-full-$STAMP.sql"
  echo "Ekspor SELURUH database -> $OUT"
  $WR d1 export "$SOURCE_DB" --remote --output="$OUT"
fi

echo
ls -lh "$OUT"
sha256sum "$OUT" | tee "$OUT.sha256"
echo "Selesai. Lanjut: ./import-to-dawa-db.sh $OUT"
