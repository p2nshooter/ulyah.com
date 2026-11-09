#!/usr/bin/env bash
# Menjalankan pekerjaan berkala jenius.es tanpa cron Cloudflare (src/ops.ts): kunci acak sekali pakai, hanya hash-nya
# yang ditulis ke R2 (k/ops.json), lalu POST /api/ops/tick berulang sampai impor tidak punya pekerjaan lagi atau
# waktunya habis. Di akhir kunci dibatalkan. Dipakai deploy-jenius.yml dan jenius-ops.yml.
#   bash scripts/ops-tick.sh https://jenius.es 20     # paling lama 20 menit
set -euo pipefail
URL="${1:?URL situs}"
MAX_MIN="${2:-10}"
KEY="$(openssl rand -hex 32)"
put_hash() {
  printf '{"hash":"%s","at":%s}' "$1" "$(date +%s%3N)" > /tmp/jenius-ops.json
  npx wrangler r2 object put jenius-data/k/ops.json --file /tmp/jenius-ops.json --content-type application/json --remote >/dev/null
}
put_hash "$(printf %s "$KEY" | sha256sum | cut -d' ' -f1)"
trap 'put_hash "$(openssl rand -hex 32)" || true' EXIT
end=$(( $(date +%s) + MAX_MIN * 60 ))
n=0; idle=0; last=""
while [ "$(date +%s)" -lt "$end" ]; do
  r="$(curl -s -m 90 -X POST -H "x-ops-key: ${KEY}" "${URL}/api/ops/tick" || true)"
  n=$((n + 1))
  if echo "$r" | jq -e '.error' >/dev/null 2>&1; then echo "::error::tick ditolak: $r"; exit 1; fi
  if ! echo "$r" | jq -e '.import' >/dev/null 2>&1; then echo "tick $n: jawaban tidak terbaca (${r:0:120}) — coba lagi"; sleep 5; continue; fi
  last="$r"
  echo "tick $n: $(echo "$r" | jq -c '{worked: .import.worked, done: .import.done, failed: .import.failed, total: .import.total, summary, backup: (.backup.ok // null)}')"
  if [ "$(echo "$r" | jq -r '.import.worked // empty')" = "" ]; then idle=$((idle + 1)); else idle=0; fi
  # Dua langkah berturut-turut tanpa pekerjaan: semua buku selesai (atau gagal dan menunggu dicoba lagi besok).
  [ "$idle" -ge 2 ] && break
done
if [ -n "$last" ]; then
  echo "Selesai: $(echo "$last" | jq -r '"\(.import.done) dari \(.import.total) buku tersedia, \(.import.failed) gagal (dicoba lagi besok)"')"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    echo "- Impor buku: $(echo "$last" | jq -r '"\(.import.done)/\(.import.total) tersedia, \(.import.failed) gagal"') (${n} langkah)" >> "$GITHUB_STEP_SUMMARY"
  fi
fi
