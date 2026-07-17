-- Migration number: 0005    2026-07-08
-- Sadaqah proof → admin approval → downloadable certificate flow.
-- Visitors may donate anonymously; only donors who WANT a keepsake
-- certificate need an account (registration stays optional otherwise).

CREATE TABLE donation_proofs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('bank','crypto','paypal','nowpayments','other')),
  sender_name TEXT NOT NULL,            -- name printed on the certificate
  amount REAL,
  currency TEXT,
  transferred_at TEXT,                  -- donor-provided transfer date (ISO)
  message TEXT,
  proof_r2_key TEXT NOT NULL,           -- uploaded receipt (image/pdf) in R2
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  cert_no TEXT UNIQUE,                  -- assigned on approval: ULYAH-<year>-<id, zero-padded>
  reviewed_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  review_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_donation_proofs_client ON donation_proofs(client_id);
CREATE INDEX idx_donation_proofs_status ON donation_proofs(status);
