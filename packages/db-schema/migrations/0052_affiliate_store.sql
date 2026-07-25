-- The Amazon store: clear categories, thousands of products behind each.
--
-- Owner: "produknya mah sebanyak-banyaknya, ga usah sy pilih, nanti milih
-- sendiri customer — yang penting kategorinya jelas banget."
--
-- So this stores SHELVES, not products. A shelf is a category we name and
-- describe ourselves, pointing at a filtered Amazon search carrying our tag.
-- The reader lands on Amazon with thousands of matching products and chooses.
--
-- Why not store the products themselves:
--
--   · Amazon's Associates agreement forbids scraping their pages, and the only
--     sanctioned source — the Product Advertising API — is not open to this
--     account yet (credentials come after three qualifying sales). There is no
--     legal way to hold thousands of products today.
--
--   · Even with the API, copying Amazon's own product descriptions would COST
--     ranking rather than add it. That text is identical across thousands of
--     affiliate sites; Google treats syndicated product copy as low-value and
--     names thin affiliate pages as a manual-penalty category. The words WE
--     write about a category exist nowhere else, and are the only part of this
--     page worth anything to a search engine.
--
-- ulyah.com has no shelf at all — Amazon does not operate in Indonesia (owner:
-- "jangan pasang di ulyah.com dulu"). Only the four sibling sites, each
-- pointing at the Amazon that already speaks its language.

-- One tracking tag per marketplace. ulyah-20 is a UNITED STATES tag and earns
-- nothing on amazon.de/fr/es, which each need their own Associates account. A
-- marketplace with no tag here shows no store: sending readers to Amazon
-- untagged is traffic given away for free.
CREATE TABLE IF NOT EXISTS affiliate_tag (
  marketplace TEXT PRIMARY KEY,          -- 'com' | 'fr' | 'de' | 'es'
  tag         TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS affiliate_shelf (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  marketplace TEXT NOT NULL,             -- which Amazon, and therefore which language
  -- Stable id used in the url and for ordering; the visible name is `label`.
  slug        TEXT NOT NULL,
  -- Written by the owner in that marketplace's language. Every row is bound to
  -- one marketplace, so the language is right by construction and nothing is
  -- ever machine-translated.
  label       TEXT NOT NULL,
  -- One or two original sentences about the category. This is the ONLY text on
  -- the page a search engine has not seen a thousand times before, so it is
  -- required rather than optional.
  blurb       TEXT NOT NULL,
  -- What to search for on that Amazon, in that Amazon's language: "coran" on
  -- amazon.fr, not "quran".
  keywords    TEXT NOT NULL,
  -- Optional Amazon department (search index), e.g. 'books', 'electronics'.
  -- Narrows a broad keyword to the right aisle.
  department  TEXT,
  icon        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  enabled     INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (marketplace, slug)
);

-- The one query the public page runs.
CREATE INDEX IF NOT EXISTS idx_affiliate_shelf_live
  ON affiliate_shelf (marketplace, enabled, sort_order);
