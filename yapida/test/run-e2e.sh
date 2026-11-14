#!/usr/bin/env bash
# Uji ujung-ke-ujung yapida.sch.id: `wrangler dev` (R2 lokal, isi awal ditulis saat permintaan pertama) + Playwright.
# Dipakai CI (.github/workflows/yapida-ci.yml) dan bisa dijalankan lokal: bash test/run-e2e.sh
set -euo pipefail
cd "$(dirname "$0")/.."
LOG_DIR="${OUT:-e2e-out}"
PORT="${PORT:-8797}"
mkdir -p "$LOG_DIR"
if curl -s -o /dev/null "http://127.0.0.1:${PORT}/api/health"; then
  echo "Port ${PORT} masih dipakai server lain — hentikan dulu."; exit 1
fi
rm -rf .wrangler/state
setsid npx wrangler dev --port "$PORT" --ip 127.0.0.1 > "$LOG_DIR/dev.log" 2>&1 &
DEV=$!
cleanup() { kill -- -"$DEV" 2>/dev/null || true; }
trap cleanup EXIT
for _ in $(seq 1 90); do curl -s -o /dev/null "http://127.0.0.1:${PORT}/api/health" && break; sleep 1; done
curl -sf "http://127.0.0.1:${PORT}/api/health" > /dev/null || { echo "wrangler dev tidak menyala"; tail -50 "$LOG_DIR/dev.log"; exit 1; }
BASE="http://127.0.0.1:${PORT}" OUT="$LOG_DIR" node test/e2e.mjs
