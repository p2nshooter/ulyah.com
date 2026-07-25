-- Make the visitor analytics real.
--
-- Two defects made the admin portal's numbers untrustworthy — the owner spotted
-- the symptom: "masa perangkat sama trafic, banyakan perangkat di hari yang
-- sama" (more devices than pageviews on the same day, which is impossible).
--
-- 1. WINDOW MISMATCH. "Today" was date(created_at) = date('now') — a UTC
--    calendar day — while "devices" was a rolling 24-hour window. Jakarta is
--    UTC+7, so at 08:00 WIB the UTC day is 1 hour old while the rolling window
--    still reaches a full day back. Measured on the live database at 01:20 UTC:
--    63 pageviews "today" against 1,015 devices "in 24h". Nothing was invented;
--    the two cards simply measured different spans of time.
--
-- 2. NO BOT FILTERING. Of those 1,015 devices, 984 produced exactly ONE
--    pageview and 967 of them came from a single country's datacenters. That is
--    crawler traffic, each hit arriving with an empty localStorage and thus a
--    brand-new device id. Counting them as visitors is what made the totals feel
--    invented.
--
-- This migration adds what is needed to tell a reader from a robot and to group
-- a reader's pageviews into a real visit.
ALTER TABLE analytics_pageviews ADD COLUMN ua TEXT;
ALTER TABLE analytics_pageviews ADD COLUMN is_bot INTEGER NOT NULL DEFAULT 0;
ALTER TABLE analytics_pageviews ADD COLUMN referer_host TEXT;

-- Rows written before bot classification existed cannot be judged after the
-- fact, so they are marked unknown (NULL) rather than guessed at. The admin
-- portal states plainly which window is fully classified.
UPDATE analytics_pageviews SET is_bot = NULL WHERE ua IS NULL;

CREATE INDEX IF NOT EXISTS idx_pv_created ON analytics_pageviews (created_at);
CREATE INDEX IF NOT EXISTS idx_pv_tenant_created ON analytics_pageviews (tenant, created_at);
CREATE INDEX IF NOT EXISTS idx_pv_human ON analytics_pageviews (is_bot, created_at);

-- External (non-ecosystem) sites report through /track, which only ever kept a
-- per-day counter. Give them the same honesty: humans and bots counted apart.
ALTER TABLE site_pageviews ADD COLUMN bot_count INTEGER NOT NULL DEFAULT 0;
