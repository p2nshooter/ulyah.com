-- Grant & Fundraising Worker (Arsitektur_baru.txt): donor directory, generated
-- proposals, and outreach email log — the system that finds donors, drafts
-- polite multi-language proposals from live Ulyah.com stats, and sends them
-- from salam@ulyah.com with full tracking. All human-reviewable before send.

CREATE TABLE IF NOT EXISTS donor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_name TEXT NOT NULL,
  org_type TEXT,                 -- foundation | ngo | ministry | corporate-csr | university | philanthropy | individual
  country TEXT,
  city TEXT,
  website TEXT,
  email TEXT,
  contact_person TEXT,
  language TEXT DEFAULT 'en',    -- preferred correspondence language (per country)
  funding_field TEXT,
  funding_value TEXT,
  deadline TEXT,
  requirements TEXT,
  how_to_apply TEXT,
  status TEXT NOT NULL DEFAULT 'lead', -- lead | contacted | proposal_sent | replied | accepted | rejected | follow_up
  source TEXT DEFAULT 'manual',  -- manual | ai_suggested
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_donor_status ON donor(status);

CREATE TABLE IF NOT EXISTS proposal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_id INTEGER,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'id',
  body TEXT NOT NULL,            -- full proposal text (markdown-ish), generated
  stats_snapshot TEXT,          -- JSON of the live Ulyah stats used
  served_by TEXT,               -- which AI provider generated it
  status TEXT NOT NULL DEFAULT 'draft', -- draft | final | sent
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (donor_id) REFERENCES donor(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS outreach_email (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_id INTEGER,
  proposal_id INTEGER,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL DEFAULT 'salam@ulyah.com',
  language TEXT NOT NULL DEFAULT 'en',
  subject TEXT NOT NULL,
  body_id TEXT,                 -- Indonesian version for the admin to review
  body_target TEXT NOT NULL,    -- the version actually sent (recipient language)
  status TEXT NOT NULL DEFAULT 'draft', -- draft | sent | failed | scheduled
  provider_detail TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  sent_at TEXT,
  FOREIGN KEY (donor_id) REFERENCES donor(id) ON DELETE SET NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposal(id) ON DELETE SET NULL
);
