-- Kitab library: a browsable catalogue of classical Islamic works grouped by
-- the traditional sciences (tafsir, hadith, the four madzhab, sirah, tarikh,
-- biographies of the 'ulama, language, …). Sourced from the public
-- Shamela-Library dataset — catalogue + prose description + topics per work,
-- every description narratable aloud. Bulk data loads via the deploy workflow
-- (packages/db-schema/seed/kitab_library.sql), gated so it runs only once.

CREATE TABLE kitab_category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_id TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE kitab_book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_slug TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  author TEXT,
  author_death_year TEXT,
  description_ar TEXT,
  topics_json TEXT,
  source TEXT,
  UNIQUE (category_slug, title_ar)
);
CREATE INDEX idx_kitab_book_cat ON kitab_book (category_slug);
