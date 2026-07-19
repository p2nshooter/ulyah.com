-- Pre-translated kitab pesantren strings, one row per (kitab, lang, field).
-- Populated by scripts/translate-pesantren.ts running in GitHub Actions —
-- NOT by the Worker at request time. The Workers free plan caps subrequests
-- (50/request) and KV writes (1k/day), so the old in-Worker background
-- translation could never finish writing a whole-kitab blob; a sibling site
-- therefore kept serving Indonesian forever. Reading one D1 query per page
-- is free-plan safe and permanent (classical texts never change).
CREATE TABLE IF NOT EXISTS pes_i18n (
  slug TEXT NOT NULL,
  lang TEXT NOT NULL,
  k TEXT NOT NULL, -- entry key: k:title_id | b:<babId> | mt:<matnId> | tr:<matnId> | ex:<matnId>
  v TEXT NOT NULL, -- translated text
  PRIMARY KEY (slug, lang, k)
);

-- Per (kitab, lang) source fingerprint so the translator job can skip work
-- that is already up to date and re-translate only when the source changes.
CREATE TABLE IF NOT EXISTS pes_i18n_meta (
  slug TEXT NOT NULL,
  lang TEXT NOT NULL,
  src_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (slug, lang)
);
