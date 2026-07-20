-- Cross-network traffic analytics. Every article/site in the ecosystem posts a
-- cookieless pageview beacon to /track; rows are aggregated per site + day +
-- path so the ulyah.com admin can show per-site traffic for the whole network
-- (owner: "semua website wajib punya analisa trafic di portal admin ulyah.com").
CREATE TABLE IF NOT EXISTS site_pageviews (
  site  TEXT NOT NULL,
  day   TEXT NOT NULL,          -- YYYY-MM-DD (UTC)
  path  TEXT NOT NULL DEFAULT '/',
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (site, day, path)
);
CREATE INDEX IF NOT EXISTS idx_site_pageviews_site_day ON site_pageviews(site, day);
