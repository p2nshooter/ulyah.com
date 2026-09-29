#!/usr/bin/env bash
# ============================================================================
# import-to-dawa-db.sh — gabungkan dump live ulyah-db ke database dawa-db.
#
#   1. dump dimuat ke database STAGING LOKAL (sementara, di /tmp)
#   2. prune-for-dawa.sql membuang baris milik situs lain (mt_cache non-Spanyol,
#      statistik ulyah/1fr/tilawa/xad, admin situs lain, dst.)
#   3. data sisa diekspor ulang tanpa skema, INSERT diubah jadi
#      INSERT OR IGNORE (default) supaya TIDAK bentrok dengan baris seed
#   4. hasilnya dijalankan ke dawa-db (lokal atau remote)
#
# Jalankan SETELAH dawa-db punya skema (deploy pertama, atau restore-d1.sh).
#
# Pakai:
#   ./import-to-dawa-db.sh ulyah-db-dawa-20260930-0005.sql --local
#   ./import-to-dawa-db.sh ulyah-db-dawa-20260930-0005.sql --remote
#   ./import-to-dawa-db.sh dump.sql --remote --replace   # baris live MENIMPA seed
#
# --replace: hati-hati. Ada 15 relasi ON DELETE CASCADE di skema; REPLACE
# menghapus-lalu-menulis baris induk, jadi anaknya bisa ikut terhapus. Dan
# kisah yang isinya sudah dipindah ke R2 (body kosong + body_r2_key) akan
# menimpa isi dari seed — salin dulu R2 stories/body/ (lihat PANDUAN §8).
#
# Hasil antara disimpan: <dump>.dawa-merge.sql — bisa diperiksa/diulang.
# ============================================================================
set -euo pipefail

DUMP="${1:?Pakai: $0 <dump.sql> --local|--remote [--replace]}"
TARGET="${2:---local}"
STRATEGY="IGNORE"; [ "${3:-}" = "--replace" ] && STRATEGY="REPLACE"
case "$TARGET" in --local|--remote) ;; *) echo "Target harus --local atau --remote"; exit 2 ;; esac
[ -f "$DUMP" ] || { echo "Dump tidak ada: $DUMP"; exit 1; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMP="$(cd "$(dirname "$DUMP")" && pwd)/$(basename "$DUMP")"
PROJECT="${PROJECT:-$HERE/../dawa-es}"
DB="${D1_DATABASE_NAME:-dawa-db}"
MERGE="${DUMP%.sql}.dawa-merge.sql"
WR="npx --yes wrangler@4"
[ -x "$PROJECT/apps/worker-api/node_modules/.bin/wrangler" ] && WR="$PROJECT/apps/worker-api/node_modules/.bin/wrangler"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cat > "$STAGE/wrangler.toml" <<EOF
name = "dawa-stage-tmp"
compatibility_date = "2025-01-01"
[[d1_databases]]
binding = "DB"
database_name = "stage"
database_id = "00000000-0000-0000-0000-000000000000"
EOF

echo "=== 1. Muat dump ke staging lokal ($(du -h "$DUMP" | cut -f1)) ==="
(cd "$STAGE" && $WR d1 execute stage --local --file="$DUMP" > /dev/null)

echo "=== 2. Buang baris yang bukan milik dawa.es ==="
# Satu pernyataan per panggilan: tabel yang tidak ada di dump cukup dilewati.
grep -v '^\s*--' "$HERE/prune-for-dawa.sql" | tr '\n' ' ' | tr ';' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$' |
while IFS= read -r stmt; do
  if (cd "$STAGE" && $WR d1 execute stage --local --command="$stmt;" > /dev/null 2>&1); then
    echo "  ok    $stmt"
  else
    echo "  lewat $stmt (tabel tidak ada di dump)"
  fi
done

echo "=== 3. Ekspor data (tanpa skema), INSERT -> INSERT OR $STRATEGY ==="
(cd "$STAGE" && $WR d1 export stage --local --no-schema --output="$STAGE/data.sql" > /dev/null)
sed -E "s/^INSERT INTO /INSERT OR $STRATEGY INTO /" "$STAGE/data.sql" > "$MERGE"
echo "  $(grep -c '^INSERT OR' "$MERGE") baris -> $MERGE ($(du -h "$MERGE" | cut -f1))"

echo "=== 4. Terapkan ke $DB ($TARGET) ==="
cd "$PROJECT/apps/worker-api"
if [ "$TARGET" = "--remote" ] && grep -q "__D1_DATABASE_ID__" wrangler.toml; then
  ID=$($WR d1 list --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const d=JSON.parse(s).find(x=>x.name==='$DB');console.log(d?d.uuid:'')})")
  [ -n "$ID" ] || { echo "D1 $DB belum ada — deploy dulu atau jalankan restore-d1.sh --remote"; exit 1; }
  cp wrangler.toml wrangler.toml.bak
  trap 'mv -f wrangler.toml.bak wrangler.toml; rm -rf "$STAGE"' EXIT
  sed -i "s/__D1_DATABASE_ID__/$ID/" wrangler.toml
fi
$WR d1 execute "$DB" "$TARGET" --file="$MERGE" > /dev/null
$WR d1 execute "$DB" "$TARGET" --command="SELECT (SELECT COUNT(*) FROM mt_cache) AS mt_cache, (SELECT COUNT(*) FROM stories) AS stories, (SELECT COUNT(*) FROM admin_users) AS admin_users;"
echo "Selesai."
