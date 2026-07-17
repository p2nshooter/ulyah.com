-- First-party ad analytics: our own count of how often ad units are shown
-- (impression) and probably clicked (click, best-effort — real ad clicks live
-- inside a cross-origin Google iframe we can't read, so a click is inferred
-- from a focus/blur heuristic and is an ESTIMATE). Real revenue/click figures
-- always come from the Google AdSense dashboard; these give the owner an
-- immediate in-house view (by page + country) and an earnings ESTIMATE
-- (impressions ÷ 1000 × a configurable eCPM set in the admin AdSense panel).
CREATE TABLE ad_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression','click')),
  page TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_ad_events_type_time ON ad_events (event_type, created_at);
CREATE INDEX idx_ad_events_country ON ad_events (country);
