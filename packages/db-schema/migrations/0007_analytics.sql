-- Migration number: 0007    2026-07-09
-- Visitor analytics (daily/weekly/monthly/yearly + country breakdown) and
-- donor country tracking, for the admin "smart scaling / central visibility"
-- requirement — everything happening on the site visible in one portal.

CREATE TABLE analytics_pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  country TEXT,              -- ISO 3166-1 alpha-2, from Cloudflare's cf-ipcountry edge header
  locale TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_pageviews_created ON analytics_pageviews(created_at);
CREATE INDEX idx_pageviews_country ON analytics_pageviews(country);

-- Donor country, captured at registration from the same edge header — powers
-- "sertifikat dikeluarkan dari negara mana" without guessing from IP later.
ALTER TABLE clients ADD COLUMN country TEXT;
