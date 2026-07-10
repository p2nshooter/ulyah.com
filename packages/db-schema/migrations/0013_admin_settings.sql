-- CRUD-able, encrypted runtime settings (PayPal / NOWPayments credentials,
-- etc.) so the admin portal can rotate secrets without a GitHub Secrets edit
-- + redeploy. Values are AES-256-GCM encrypted with the same
-- KEY_ENCRYPTION_SECRET already used for donated AI/GPU keys — never stored
-- in plaintext. When no row exists for a key, the Worker falls back to the
-- corresponding GitHub Secret env var, so nothing breaks for keys the admin
-- hasn't taken over yet (see lib/settings.ts).
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
