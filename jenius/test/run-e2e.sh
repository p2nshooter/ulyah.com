#!/usr/bin/env bash
# Uji ujung-ke-ujung jenius.es: sumber buku tiruan + `wrangler dev --test-scheduled` (R2 lokal) + Playwright.
# Dipakai CI (.github/workflows/jenius-ci.yml) dan bisa dijalankan lokal: bash test/run-e2e.sh
set -euo pipefail
cd "$(dirname "$0")/.."
LOG_DIR="${OUT:-e2e-out}"
mkdir -p "$LOG_DIR"
if [ ! -f .dev.vars ]; then
  cat > .dev.vars <<VARS
SOURCE_BASE=http://127.0.0.1:8789
IMPORT_ONLY=bd-sleepy-mr-sloth,alices-adventures-in-wonderland
MASTER_KEY=dev-master-key-only-for-local-tests-0123456789
SESSION_SECRET=dev-session-secret-only-for-local-tests-0123456789
VARS
fi
if curl -s -o /dev/null http://127.0.0.1:8787/api/health; then
  echo "Port 8787 masih dipakai server lain — hentikan dulu."; exit 1
fi
rm -rf .wrangler/state
setsid node test/mock-source.mjs 8789 > "$LOG_DIR/mock.log" 2>&1 &
MOCK=$!
setsid npx wrangler dev --port 8787 --ip 127.0.0.1 --test-scheduled > "$LOG_DIR/dev.log" 2>&1 &
DEV=$!
cleanup() { kill -- -"$MOCK" -"$DEV" 2>/dev/null || true; }
trap cleanup EXIT
for _ in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:8787/api/health && break; sleep 1; done
curl -sf http://127.0.0.1:8787/api/health > /dev/null || { echo "wrangler dev tidak menyala"; tail -50 "$LOG_DIR/dev.log"; exit 1; }
# Impor buku tiruan lewat cron (satu buku per langkah; bab Standard Ebooks bertahap). Cron berjalan di latar
# (waitUntil), jadi tunggu sebentar di antara langkah sampai kedua buku tersedia.
for _ in $(seq 1 40); do
  curl -s "http://127.0.0.1:8787/__scheduled?cron=*+*+*+*+*" > /dev/null
  sleep 1.5
  if curl -sf -o /dev/null http://127.0.0.1:8787/api/book/bd-sleepy-mr-sloth && curl -sf -o /dev/null http://127.0.0.1:8787/api/book/alices-adventures-in-wonderland; then break; fi
done
OUT="$LOG_DIR" node test/e2e.mjs
