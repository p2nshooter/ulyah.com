-- Migration number: 0036    2026-07-17
-- Per-tenant analytics. One content database serves ulyah.com, 1fr.fr and
-- tilawa.de; every visitor beacon and PWA install is now tagged with the
-- tenant it came from (derived server-side from the request Origin, never
-- trusted from the body). Each sibling's admin portal shows only its own
-- numbers; ulyah.com's admin portal sees all three side by side.
-- Existing rows are ulyah's, so the column defaults to 'ulyah'.
ALTER TABLE analytics_pageviews ADD COLUMN tenant TEXT NOT NULL DEFAULT 'ulyah';
ALTER TABLE app_installs ADD COLUMN tenant TEXT NOT NULL DEFAULT 'ulyah';
CREATE INDEX IF NOT EXISTS idx_pageviews_tenant ON analytics_pageviews(tenant, created_at);
CREATE INDEX IF NOT EXISTS idx_app_installs_tenant ON app_installs(tenant);

-- Best-effort uninstall tracking. The web platform has no reliable
-- "uninstalled" event, so this is recorded when a device that previously
-- reported the app installed (localStorage flag) comes back NOT running
-- standalone and getInstalledRelatedApps reports none — an approximation,
-- surfaced as such in the admin portal.
CREATE TABLE IF NOT EXISTS app_uninstalls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT 'ulyah',
  app TEXT NOT NULL,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_app_uninstalls_tenant ON app_uninstalls(tenant, created_at);
