-- AdOps: AdSense approval gate + Ad Manager automation + its reports.
-- docs/ADMANAGER-BLUEPRINT.md §10. Small on purpose (this database is on the
-- free plan): ~26 site rows, ≤130 ad units, ~400 report rows a day (one per
-- site × position × country tier), a short action log pruned after 90 days.
-- dawa.es never appears in any of these tables (blueprint §1.1).
-- Auto ads mode (plan.ts AD_PLACEMENT = "auto", the owner's choice): adops_daily
-- holds AdSense's own report under position 'auto'; no ad units, no floors.

-- One row per registry site: what AdSense and Ad Manager say about it.
CREATE TABLE IF NOT EXISTS adops_sites (
  track_id        TEXT PRIMARY KEY,           -- packages/shared owner-sites trackId
  domain          TEXT NOT NULL,
  adsense_state   TEXT,                       -- READY | GETTING_READY | REQUIRES_REVIEW | NEEDS_ATTENTION | NULL (unknown)
  adsense_checked TEXT,                       -- datetime of the last AdSense read
  ready_since     TEXT,                       -- when it first turned READY
  auto_ads        INTEGER,                    -- 1/0 = Auto ads on/off in AdSense for this site, NULL = unknown
  gam_status      TEXT NOT NULL DEFAULT 'none', -- none | live | paused
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- The ad units the runner created or found, by code.
CREATE TABLE IF NOT EXISTS adops_adunits (
  code        TEXT PRIMARY KEY,                -- e.g. xko-es-top
  site        TEXT NOT NULL,                   -- track_id
  position    TEXT,                            -- top | in1 | in2 | side | end | NULL (site node)
  name        TEXT,                            -- networks/<code>/adUnits/<id>
  status      TEXT,                            -- ACTIVE | INACTIVE | ARCHIVED
  parked_at   TEXT,                            -- set when the weak-position rule switched it off
  park_reason TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Daily report, rolled up per site × position × country tier.
CREATE TABLE IF NOT EXISTS adops_daily (
  day         TEXT NOT NULL,                   -- YYYY-MM-DD (network time zone)
  site        TEXT NOT NULL,
  position    TEXT NOT NULL,                   -- top | in1 | in2 | side | end | auto (AdSense Auto ads)
  tier        TEXT NOT NULL,                   -- T1 | T2 | T3
  page_views  INTEGER NOT NULL DEFAULT 0,      -- AdSense PAGE_VIEWS (auto mode)
  requests    INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks      INTEGER NOT NULL DEFAULT 0,
  revenue     REAL NOT NULL DEFAULT 0,         -- USD
  PRIMARY KEY (day, site, position, tier)
);
CREATE INDEX IF NOT EXISTS idx_adops_daily_site_day ON adops_daily (site, day);

-- Floor state per segment (site × position × tier), §6.
CREATE TABLE IF NOT EXISTS adops_floors (
  site           TEXT NOT NULL,
  position       TEXT NOT NULL,
  tier           TEXT NOT NULL,
  floor          REAL NOT NULL,                -- USD, the value to apply
  previous_floor REAL,
  last_step      TEXT,                         -- up | down | NULL
  reason         TEXT,
  decided_at     TEXT NOT NULL DEFAULT (datetime('now')),
  applied        INTEGER NOT NULL DEFAULT 0,   -- 1 once the owner confirmed it is set in Ad Manager
  PRIMARY KEY (site, position, tier)
);

-- Every action the runner decided, dry-run or live, with its outcome.
CREATE TABLE IF NOT EXISTS adops_actions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  at         TEXT NOT NULL DEFAULT (datetime('now')),
  mode       TEXT NOT NULL,                    -- dry-run | live
  kind       TEXT NOT NULL,                    -- adsense-sync | create-adunits | activate | deactivate | park | report | floors | summary | error
  site       TEXT,
  detail     TEXT,
  ok         INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_adops_actions_at ON adops_actions (at);
