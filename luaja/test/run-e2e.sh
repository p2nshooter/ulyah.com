#!/usr/bin/env bash
# Uji ujung-ke-ujung luaja.com: `wrangler dev` (R2 lokal) + Playwright (desktop & ponsel).
# Dipakai CI (.github/workflows/luaja-ci.yml) dan bisa dijalankan lokal: bash test/run-e2e.sh
set -euo pipefail
cd "$(dirname "$0")/.."
LOG_DIR="${OUT:-e2e-out}"
PORT="${PORT:-8799}"
mkdir -p "$LOG_DIR"
if curl -s -o /dev/null "http://127.0.0.1:${PORT}/api/health"; then
  echo "Port ${PORT} masih dipakai server lain — hentikan dulu."; exit 1
fi
rm -rf .wrangler/state
# Rahasia khusus uji (tidak pernah dipakai produksi): sesi + akun pemilik uji.
E2E_OWNER="e2e-owner@luaja.test"; E2E_PASS="e2e-owner-$(openssl rand -hex 6)"
setsid npx wrangler dev --port "$PORT" --ip 127.0.0.1 \
  --var "SESSION_SECRET:e2e-$(openssl rand -hex 16)" --var "OWNER_BOOTSTRAP_EMAIL:${E2E_OWNER}" --var "OWNER_BOOTSTRAP_PASSWORD:${E2E_PASS}" \
  > "$LOG_DIR/dev.log" 2>&1 &
DEV=$!
cleanup() { kill -- -"$DEV" 2>/dev/null || true; }
trap cleanup EXIT
for _ in $(seq 1 90); do curl -s -o /dev/null "http://127.0.0.1:${PORT}/api/health" && break; sleep 1; done
curl -sf "http://127.0.0.1:${PORT}/api/health" > /dev/null || { echo "wrangler dev tidak menyala"; tail -50 "$LOG_DIR/dev.log"; exit 1; }
BASE="http://127.0.0.1:${PORT}" OUT="$LOG_DIR" OWNER="$E2E_OWNER" OWNER_PASS="$E2E_PASS" node test/e2e.mjs
