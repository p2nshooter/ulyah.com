-- Two additions:
--
-- 1) Auto-issued certificates for PayPal/NOWPayments donations. Bank
--    transfer stays manual (upload proof -> admin ACC), but a logged-in
--    donor's PayPal capture or NOWPayments IPN confirmation now issues a
--    certificate immediately, no review needed — the payment processor
--    itself is the proof. `donation_proofs` already models exactly what a
--    certificate needs (client_id, method, sender_name, amount, cert_no,
--    status), so it's reused rather than duplicated; two changes make that
--    safe: proof_r2_key becomes nullable (auto-issued certs have no
--    uploaded file) and donation_log_id links back to the donation_logs row
--    that triggered it (so a capture + webhook race can't double-issue).
--    SQLite/D1 requires a full table rebuild to change a NOT NULL column.
--
-- 2) `site_media`: small CRUD-able table for admin-uploaded images (the two
--    founder photos on /syukur, to start) — stored in R2, never hardcoded
--    into the repo, replaceable from the admin portal without a redeploy.

CREATE TABLE donation_proofs_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('bank','crypto','paypal','nowpayments','other')),
  sender_name TEXT NOT NULL,
  amount REAL,
  currency TEXT,
  transferred_at TEXT,
  message TEXT,
  proof_r2_key TEXT,                    -- NULL for auto-issued certs (paypal/nowpayments)
  donation_log_id INTEGER REFERENCES donation_logs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  cert_no TEXT UNIQUE,
  reviewed_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  review_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO donation_proofs_new (id, client_id, method, sender_name, amount, currency, transferred_at, message, proof_r2_key, status, cert_no, reviewed_by, reviewed_at, review_note, created_at)
  SELECT id, client_id, method, sender_name, amount, currency, transferred_at, message, proof_r2_key, status, cert_no, reviewed_by, reviewed_at, review_note, created_at FROM donation_proofs;
DROP TABLE donation_proofs;
ALTER TABLE donation_proofs_new RENAME TO donation_proofs;

CREATE INDEX idx_donation_proofs_client ON donation_proofs(client_id);
CREATE INDEX idx_donation_proofs_status ON donation_proofs(status);
CREATE UNIQUE INDEX idx_donation_proofs_donation_log ON donation_proofs(donation_log_id) WHERE donation_log_id IS NOT NULL;

CREATE TABLE site_media (
  key TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
