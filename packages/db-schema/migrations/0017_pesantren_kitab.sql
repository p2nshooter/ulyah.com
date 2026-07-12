-- Kitab Pesantren — a *readable* library of the classic matn taught in
-- Indonesian pesantren, kept deliberately separate from the 4,969-entry
-- Shamela *catalogue* (kitab_book): that one is metadata (title/author/
-- description) for breadth; this one is full readable content (chapter →
-- matan → Arabic + terjemah + penjelasan) for depth. Neatly structured so a
-- reader browses category → kitab (with its author) → bab (chapter) → matan,
-- never a jumble.
--
-- Data is curated (each matn hand-checked against the printed kitab), loaded
-- once via the deploy workflow from packages/db-schema/seed/pesantren_kitab.sql.

CREATE TABLE pesantren_category (
  slug TEXT PRIMARY KEY,
  name_id TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE pesantren_kitab (
  slug TEXT PRIMARY KEY,
  category_slug TEXT NOT NULL REFERENCES pesantren_category(slug),
  title_ar TEXT NOT NULL,
  title_id TEXT NOT NULL,
  author TEXT,
  author_death_year TEXT,
  description_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_pesantren_kitab_cat ON pesantren_kitab (category_slug, sort_order);

CREATE TABLE pesantren_bab (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kitab_slug TEXT NOT NULL REFERENCES pesantren_kitab(slug) ON DELETE CASCADE,
  bab_order INTEGER NOT NULL,
  name_id TEXT NOT NULL,
  name_ar TEXT,
  UNIQUE (kitab_slug, bab_order)
);
CREATE INDEX idx_pesantren_bab_kitab ON pesantren_bab (kitab_slug, bab_order);

CREATE TABLE pesantren_matn (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bab_id INTEGER NOT NULL REFERENCES pesantren_bab(id) ON DELETE CASCADE,
  matn_order INTEGER NOT NULL,
  title_id TEXT,
  title_ar TEXT,
  text_ar TEXT NOT NULL,          -- the matan (Arabic source text)
  translation_id TEXT,            -- terjemah
  explanation_id TEXT,            -- syarah/penjelasan ringkas
  quran_refs_json TEXT,           -- [{s,v,label}] linked ayat
  hadits_refs_json TEXT,          -- ["bukhari:8", …] linked hadith
  UNIQUE (bab_id, matn_order)
);
CREATE INDEX idx_pesantren_matn_bab ON pesantren_matn (bab_id, matn_order);
