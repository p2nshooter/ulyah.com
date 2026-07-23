-- Strongly-consistent home for the ONE network-wide ad configuration.
--
-- Why: the config used to live only in Workers KV. KV is eventually
-- consistent AND its edge read-cache serves the previous value for up to
-- ~60 s after a write, so toggling an ad switch (notably the Adsterra
-- show/hide) OFF and then refreshing the admin re-read the stale KV value and
-- the switch snapped back ON — "tidak ada save-nya". D1 is read-after-write
-- consistent, so the admin portal now reads/writes the config here and every
-- toggle sticks across a refresh. KV stays a best-effort cache for the public
-- per-site view. Single row, pinned to id = 1.
CREATE TABLE IF NOT EXISTS ad_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
