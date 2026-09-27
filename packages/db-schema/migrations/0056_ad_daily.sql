-- How often the ads were shown, filled and clicked — per site, per day.
--
-- Owner: "buatkan berapa kali tampil di seluruh pengunjung dan brp kali d klik
-- serta perkiraan pendapatan AdSense … semua settingan tampil di masing2 situs
-- tp seluruhnya tampil di ulyah.com sebagai control pusat."
--
-- ONE ROW PER SITE PER DAY, and that is deliberate. This database is on the
-- free plan — 500 MB and 100,000 row writes a day — and it has run out of
-- both. A row per impression would be the single fastest-growing table in it.
-- Instead each page tallies its own units in the browser and reports once when
-- the reader leaves; the server adds that tally to this row. Five sites is five
-- rows a day, whatever the traffic.
--
-- Two unit kinds, because the page is split between the account's two units
-- (apps/web/src/lib/ad-config.ts): `banner` for the lead and closing positions,
-- `flex` for the ones inside the reading column.
--
--   *_shown   units placed on a page a reader loaded — counted on every site,
--             approved or not, so a site awaiting approval still shows its
--             inventory
--   *_filled  AdSense served an ad into the unit — the impression it pays on
--   *_clicked clicks, detected from focus moving into the ad's iframe; an
--             estimate, and labelled as one wherever it is shown
CREATE TABLE IF NOT EXISTS ad_daily (
  site           TEXT NOT NULL,
  day            TEXT NOT NULL,   -- YYYY-MM-DD (UTC)
  banner_shown   INTEGER NOT NULL DEFAULT 0,
  banner_filled  INTEGER NOT NULL DEFAULT 0,
  banner_clicked INTEGER NOT NULL DEFAULT 0,
  flex_shown     INTEGER NOT NULL DEFAULT 0,
  flex_filled    INTEGER NOT NULL DEFAULT 0,
  flex_clicked   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (site, day)
);
