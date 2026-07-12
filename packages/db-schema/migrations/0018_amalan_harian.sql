-- Amalan Harian — a tidy, voice-ready library of daily worship: du'a from
-- waking to sleeping, morning/evening & post-prayer dzikir, prophetic
-- medicine (thibbun nabawi, sahih only), and grooming/self-care sunnah
-- (fitrah). Every item carries Arabic + Latin transliteration + Indonesian
-- translation + an authentic source, so it reads and narrates cleanly.
--
-- Curated (each item checked against an authentic source — Qur'an, Sahih
-- al-Bukhari/Muslim, or Hisnul Muslim). Loaded once via the deploy workflow
-- from packages/db-schema/seed/amalan_harian.sql.

CREATE TABLE amalan_category (
  slug TEXT PRIMARY KEY,
  grp TEXT NOT NULL,                -- doa | dzikir | thibb | kecantikan
  name_id TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE amalan_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_slug TEXT NOT NULL REFERENCES amalan_category(slug) ON DELETE CASCADE,
  item_order INTEGER NOT NULL,
  title_id TEXT NOT NULL,
  arabic TEXT,                      -- the du'a / ayah / hadith matn (may be null for a pure adab note)
  latin TEXT,                       -- Indonesian transliteration
  translation_id TEXT,              -- terjemah / makna
  note_id TEXT,                     -- fadhilah / cara / manfaat
  repeat_count INTEGER,             -- e.g. 3, 33, 100 (null = once/not applicable)
  source TEXT,                      -- HR. Bukhari-Muslim, QS. An-Nahl 68-69, dll.
  UNIQUE (category_slug, item_order)
);
CREATE INDEX idx_amalan_item_cat ON amalan_item (category_slug, item_order);
