-- Migration number: 0015    2026-07-10
-- Server-side install tracking for the installable PWAs (main ULYAH.COM app
-- and the standalone Jadwal Sholat mini-app) — the client only had a
-- localStorage flag before, invisible to the admin portal. This powers the
-- "berapa orang yg sudah install app & app apa saja" admin stat.

CREATE TABLE app_installs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app TEXT NOT NULL,        -- 'main' | 'sholat'
  country TEXT,             -- ISO 3166-1 alpha-2, from Cloudflare's cf-ipcountry edge header
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_app_installs_app ON app_installs(app);
CREATE INDEX idx_app_installs_created ON app_installs(created_at);
