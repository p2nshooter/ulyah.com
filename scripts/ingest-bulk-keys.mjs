// Deploy-time bulk API-key ingestion — secure, idempotent, never stores keys
// in the repo. Reads a blob of keys from the AI_KEY_BULK_IMPORT env var (a
// GitHub Actions Secret) and the AES secret from KEY_ENCRYPTION_SECRET, then
// emits idempotent SQL INSERTs for every NEW key (skipping fingerprints that
// already exist in the pool). Encryption matches packages/shared/crypto.ts
// exactly (AES-256-GCM, 12-byte random IV, base64), so the worker can decrypt
// them with the same secret.
//
// Usage (inside the deploy workflow):
//   EXISTING_FP="<comma-separated existing fingerprints>" \
//   AI_KEY_BULK_IMPORT="..." KEY_ENCRYPTION_SECRET="..." \
//   node scripts/ingest-bulk-keys.mjs > /tmp/keys.sql
//
// The blob format is forgiving: it just scans for provider key tokens
// (nvapi-… → nvidia, sk-or-… → openrouter) anywhere in the text, and uses the
// nearest preceding non-empty "label" line as the human label. So the raw
// WhatsApp/notes export the owner already has can be pasted verbatim.

import { webcrypto as crypto } from "node:crypto";

const blob = process.env.AI_KEY_BULK_IMPORT ?? "";
const secretB64 = process.env.KEY_ENCRYPTION_SECRET ?? "";
const existing = new Set(
  (process.env.EXISTING_FP ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
);

if (!blob.trim()) {
  process.stderr.write("AI_KEY_BULK_IMPORT empty — nothing to ingest.\n");
  process.exit(0);
}
if (!secretB64.trim()) {
  process.stderr.write("KEY_ENCRYPTION_SECRET missing — cannot encrypt keys, aborting (non-fatal).\n");
  process.exit(0);
}

function fromB64(b64) {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}
function toB64(buf) {
  return Buffer.from(buf).toString("base64");
}

async function importAesKey(b64) {
  const raw = fromB64(b64);
  if (raw.length !== 32) throw new Error("KEY_ENCRYPTION_SECRET must decode to 32 bytes (AES-256)");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function encryptApiKey(rawKey, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(rawKey));
  return { ciphertext: toB64(ct), iv: toB64(iv) };
}
async function fingerprint(rawKey) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawKey));
  return Buffer.from(digest).toString("hex");
}

// Detect provider + a sensible default scope from the key prefix.
function classify(token) {
  if (token.startsWith("nvapi-")) return { provider: "nvidia", scope: "text" };
  if (token.startsWith("sk-or-")) return { provider: "openrouter", scope: "text" };
  return null;
}

// Scan the blob line-by-line, tracking the most recent "label-ish" line, and
// pull out every key token with its nearest label.
const lines = blob.split(/\r?\n/);
const TOKEN_RE = /(nvapi-[A-Za-z0-9_\-]{20,}|sk-or-v1-[A-Za-z0-9]{20,})/g;
// token -> best label seen for it. A CLEAN label (UPPER_SNAKE like
// NVIDIA_KEY_MAIN / OPENROUTER_KEY) always wins over a messy chat-line label.
const labelForToken = new Map();
const order = [];
let lastLabel = null;
const isCleanLabel = (s) => /^[A-Z][A-Z0-9_]{3,}$/.test(s);
for (const line of lines) {
  const tokens = line.match(TOKEN_RE);
  if (tokens) {
    for (const t of tokens) {
      if (!labelForToken.has(t)) order.push(t);
      const prev = labelForToken.get(t);
      // Take this label if we have none, or if the new one is a clean label
      // and the old one is not.
      if (!prev || (lastLabel && isCleanLabel(lastLabel) && !isCleanLabel(prev))) {
        if (lastLabel) labelForToken.set(t, lastLabel);
        else if (!prev) labelForToken.set(t, null);
      }
    }
  } else {
    const trimmed = line.trim();
    if (trimmed && trimmed.length <= 48 && !/[{}();=]/.test(trimmed)) {
      const cleaned = trimmed.replace(/^Value:\s*/i, "").replace(/[:：].*$/, "").trim();
      if (cleaned) lastLabel = cleaned;
    }
  }
}
const found = order.map((token) => ({ token, label: labelForToken.get(token) ?? null }));

const q = (v) => (v == null || v === "" ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const seen = new Set();
const out = [];
let added = 0;
let skipped = 0;

for (const { token, label } of found) {
  const cls = classify(token);
  if (!cls) continue;
  if (seen.has(token)) continue;
  seen.add(token);
  const fp = await fingerprint(token);
  if (existing.has(fp)) {
    skipped++;
    continue;
  }
  const { ciphertext, iv } = await encryptApiKey(token, await importAesKey(secretB64));
  const donorLabel = label ? `${label}` : `${cls.provider} key`;
  // Insert as 'active' so the smart engine can use it immediately; a bad key
  // is demoted automatically by the health-check / recordKeyUsage path.
  out.push(
    `INSERT INTO ai_key_pool (provider, scope, key_ref, key_iv, status, priority, donor_label, quota_used, latency_ms, last_health_check, key_fingerprint) ` +
      `VALUES (${q(cls.provider)}, ${q(cls.scope)}, ${q(ciphertext)}, ${q(iv)}, 'active', 5, ${q(donorLabel)}, 0, 0, datetime('now'), ${q(fp)});`
  );
  added++;
}

if (out.length > 0) {
  process.stdout.write(out.join("\n") + "\n");
}
process.stderr.write(`Bulk key ingest: ${added} new, ${skipped} already present, ${seen.size} unique tokens seen.\n`);
