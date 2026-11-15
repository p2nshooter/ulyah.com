#!/usr/bin/env bash
# Sambungkan luaja.com (+ www) ke Worker `luaja-com` tanpa menghapus apa pun di DNS.
#
#   1. Custom domain lewat API (cara utama). Cloudflare menolaknya (kode 100117) bila host masih punya record
#      A/AAAA/CNAME lama — record itu TIDAK dihapus otomatis (keputusan pemilik), hanya dilaporkan.
#   2. Jalur cadangan: Worker route `<host>/*` di zona yang sama. Route berlaku untuk record lama yang diproksi Cloudflare
#      (awan oranye), sehingga situs langsung tampil tanpa mengubah DNS. Record „DNS only“ (awan abu-abu) dilaporkan.
#   3. Domain dianggap tersambung hanya bila https://<domain>/api/health benar-benar dijawab Worker ini.
#
# Pemakaian: cf-attach.sh            → langkah 1–3, menulis ATTACHED/ROUTED/PUBLIC_URL ke $GITHUB_ENV
#            cf-attach.sh routes     → hanya memastikan route (dipanggil lagi setelah deploy ulang)
# Butuh: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, DOMAIN. Tidak pernah mencetak token.
set -eu
MODE="${1:-all}"
SCRIPT="luaja-com"
CF="https://api.cloudflare.com/client/v4"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
JSON="Content-Type: application/json"
ENV_OUT="${GITHUB_ENV:-/dev/null}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/null}"
api() { curl -s --max-time 30 -H "$AUTH" "$@"; }

ZONE_RESP=$(api "$CF/zones?name=${DOMAIN}")
if [ "$(echo "$ZONE_RESP" | jq -r '.success')" != "true" ]; then
  echo "$ZONE_RESP" | jq -r '.errors[]? | "  CF error \(.code): \(.message)"' || true
  echo "::warning::Token tidak bisa membaca zona ${DOMAIN}. Situs tetap online di workers.dev."
  echo "ZONE_STATUS=token tanpa akses zona" >> "$ENV_OUT"; exit 0
fi
ZONE_ID=$(echo "$ZONE_RESP" | jq -r '.result[0]?.id // empty')
ZONE_STATUS=$(echo "$ZONE_RESP" | jq -r '.result[0]?.status // empty')
echo "ZONE_STATUS=${ZONE_STATUS:-belum ada}" >> "$ENV_OUT"
if [ -z "$ZONE_ID" ]; then echo "::warning::Zona ${DOMAIN} belum ada di akun ini. Situs tetap online di workers.dev."; exit 0; fi
if [ "$ZONE_STATUS" != "active" ]; then
  NS=$(echo "$ZONE_RESP" | jq -r '.result[0].name_servers // [] | join(", ")')
  echo "::warning::Zona ${DOMAIN} berstatus '${ZONE_STATUS}'. Arahkan nameserver ke: ${NS}."; exit 0
fi

# Route <host>/* → luaja-com (buat, atau arahkan ulang route yang polanya sama). Tidak menyentuh record DNS.
ensure_route() {
  local host="$1" pattern="$1/*" id resp
  id=$(api "$CF/zones/$ZONE_ID/workers/routes" | jq -r --arg p "$pattern" '.result[]? | select(.pattern==$p) | .id' | head -1)
  if [ -n "$id" ]; then
    resp=$(api -X PUT -H "$JSON" -d "{\"pattern\":\"$pattern\",\"script\":\"$SCRIPT\"}" "$CF/zones/$ZONE_ID/workers/routes/$id")
  else
    resp=$(api -X POST -H "$JSON" -d "{\"pattern\":\"$pattern\",\"script\":\"$SCRIPT\"}" "$CF/zones/$ZONE_ID/workers/routes")
  fi
  echo "route $pattern -> $SCRIPT: success=$(echo "$resp" | jq -r '.success') $(echo "$resp" | jq -c '.errors // []')"
  [ "$(echo "$resp" | jq -r '.success')" = "true" ]
}

if [ "$MODE" = "routes" ]; then
  for host in "${DOMAIN}" "www.${DOMAIN}"; do ensure_route "$host" || true; done
  exit 0
fi

attach() { api -X PUT -H "$JSON" -d "{\"zone_id\":\"$ZONE_ID\",\"hostname\":\"$1\",\"service\":\"$SCRIPT\",\"environment\":\"production\"}" "$CF/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/domains"; }
routed=""; blocked=""
for host in "${DOMAIN}" "www.${DOMAIN}"; do
  resp=$(attach "$host"); ok=$(echo "$resp" | jq -r '.success'); code=$(echo "$resp" | jq -r '.errors[0].code // 0')
  echo "custom domain $host -> $SCRIPT: success=$ok $(echo "$resp" | jq -c '.errors // []')"
  [ "$ok" = "true" ] && continue
  if [ "$code" = "100117" ]; then
    # Record lama dilaporkan (jenis, isi, status proksi) — tidak dihapus.
    recs=$(api "$CF/zones/$ZONE_ID/dns_records?name=$host&per_page=50" | jq -r '.result[]? | select(.type=="A" or .type=="AAAA" or .type=="CNAME") | "- \(.type) \(.name) → \(.content) · \(if .proxied then "diproksi (awan oranye)" else "DNS only (awan abu-abu)" end)"')
    echo "Record lama untuk $host:"; echo "${recs:-  (token tidak bisa membaca record DNS)}"
    { echo "### Record DNS lama pada \`$host\`"; echo "${recs:-(token tidak bisa membaca record DNS)}"; } >> "$SUMMARY"
    if ensure_route "$host"; then routed="$routed $host"; continue; fi
  fi
  blocked="$blocked $host"
done

# Tersambung hanya bila domain benar-benar dijawab Worker ini (sertifikat & route bisa butuh beberapa detik).
answered=no
for i in $(seq 1 12); do
  if curl -s --max-time 10 "https://${DOMAIN}/api/health" | grep -q '"service":"luaja.com"'; then answered=yes; break; fi
  sleep 5
done
echo "https://${DOMAIN}/api/health dijawab Worker: $answered"
if [ "$answered" = "yes" ]; then
  echo "PUBLIC_URL=https://${DOMAIN}" >> "$ENV_OUT"
  echo "ATTACHED=yes" >> "$ENV_OUT"
  [ -n "$routed" ] && echo "ROUTED=yes" >> "$ENV_OUT"
  echo "## ✅ ${DOMAIN} tersambung ke Worker ${SCRIPT}${routed:+ (lewat route:$routed)}" >> "$SUMMARY"
else
  {
    echo "## ⚠️ ${DOMAIN} belum menjawab dari Worker ${SCRIPT}"
    echo ""
    [ -n "$routed" ] && echo "Route sudah dipasang untuk:$routed — route hanya berlaku bila record DNS-nya **diproksi (awan oranye)**. Bila record di atas „DNS only“, nyalakan proksinya atau hapus record itu."
    [ -n "$blocked" ] && echo "Belum tersambung:$blocked."
    echo "Cara pasti: Cloudflare → ${DOMAIN} → DNS → hapus record A/AAAA/CNAME lama untuk \`${DOMAIN}\` dan \`www\` (MX/TXT biarkan), lalu jalankan ulang workflow ini."
  } >> "$SUMMARY"
  echo "::warning::${DOMAIN} belum menjawab dari Worker — lihat ringkasan run."
fi
