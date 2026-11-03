#!/usr/bin/env bash
# Uji ujung-ke-ujung lengkap: server Anthropic tiruan + `wrangler dev` (R2 & KV lokal) + Playwright.
# Dipakai CI (.github/workflows/detektor-artikel-ci.yml) dan bisa dijalankan lokal: bash test/run-e2e.sh
set -euo pipefail
cd "$(dirname "$0")/.."
LOG_DIR="${OUT:-e2e-out}"
mkdir -p "$LOG_DIR"
# Rahasia khusus uji (bukan rahasia produksi): dibuat bila belum ada.
if [ ! -f .dev.vars ]; then
  cat > .dev.vars <<VARS
MASTER_KEY=dev-master-key-only-for-local-tests-0123456789
SESSION_SECRET=dev-session-secret-only-for-local-tests-0123456789
OWNER_BOOTSTRAP_EMAIL=owner@example.com
OWNER_BOOTSTRAP_PASSWORD=pemilik-rahasia-123
ANTHROPIC_BASE_URL=http://127.0.0.1:8788
VARS
fi
if curl -s -o /dev/null http://127.0.0.1:8787/api/health; then
  echo "Port 8787 masih dipakai server lain — hentikan dulu (uji ini butuh state lokal yang bersih)."; exit 1
fi
rm -rf .wrangler/state
# Setiap server di grup prosesnya sendiri (setsid) supaya workerd ikut berhenti saat uji selesai.
setsid node test/mock-anthropic.mjs 8788 > "$LOG_DIR/mock.log" 2>&1 &
MOCK=$!
setsid npx wrangler dev --port 8787 --ip 127.0.0.1 > "$LOG_DIR/dev.log" 2>&1 &
DEV=$!
cleanup() { kill -- -"$MOCK" -"$DEV" 2>/dev/null || true; }
trap cleanup EXIT
for _ in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:8787/api/health && break; sleep 1; done
curl -sf http://127.0.0.1:8787/api/health > /dev/null || { echo "wrangler dev tidak menyala"; tail -50 "$LOG_DIR/dev.log"; exit 1; }
OUT="$LOG_DIR" node test/e2e.mjs
