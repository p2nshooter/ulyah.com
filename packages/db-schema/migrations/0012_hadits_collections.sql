-- Make the bulk-imported hadith browsable as full readable "kitab" (books),
-- not just search hits. `collection` is a stable slug; `hadith_number` is the
-- classical numbering within that book. Both are backfilled from the id
-- ranges the seed generator assigns (see scripts/generate-hadith-seed.ts),
-- which is a cheap UPDATE that never moves any of the large text columns.

ALTER TABLE hadits ADD COLUMN collection TEXT;
ALTER TABLE hadits ADD COLUMN hadith_number INTEGER;

CREATE INDEX IF NOT EXISTS idx_hadits_collection ON hadits (collection, hadith_number);

-- A small catalogue table for the reader's landing grid: display name, author,
-- ordering, and the id range each collection occupies. Populated idempotently.
CREATE TABLE IF NOT EXISTS hadits_collection (
  slug TEXT PRIMARY KEY,
  name_id TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  author TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  id_start INTEGER NOT NULL,
  id_end INTEGER NOT NULL,
  -- 1 = rows carry a native Indonesian text_id; 0 = only Arabic/English exist
  -- and the reader translates to Indonesian on demand (Arba'in / Qudsi).
  has_native_id INTEGER NOT NULL DEFAULT 1
);

INSERT OR REPLACE INTO hadits_collection (slug, name_id, name_ar, author, sort_order, id_start, id_end, has_native_id) VALUES
  ('bukhari',  'Shahih Bukhari',        'صحيح البخاري',        'Imam Bukhari',          1, 1001, 8999,   1),
  ('muslim',   'Shahih Muslim',         'صحيح مسلم',           'Imam Muslim',           2, 9001, 19999,  1),
  ('tirmidhi', 'Jami'' At-Tirmidzi',    'جامع الترمذي',        'Imam At-Tirmidzi',      3, 20001, 29999, 1),
  ('abudawud', 'Sunan Abu Dawud',       'سنن أبي داود',        'Imam Abu Dawud',        4, 30001, 39999, 1),
  ('nasai',    'Sunan An-Nasa''i',      'سنن النسائي',         'Imam An-Nasa''i',       5, 40001, 49999, 1),
  ('ibnmajah', 'Sunan Ibnu Majah',      'سنن ابن ماجه',        'Imam Ibnu Majah',       6, 50001, 59999, 1),
  ('malik',    'Muwatta Malik',         'موطأ مالك',           'Imam Malik',            7, 60001, 69999, 1),
  ('nawawi',   'Arba''in An-Nawawi',    'الأربعون النووية',    'Imam An-Nawawi',        8, 70001, 74999, 0),
  ('qudsi',    'Hadits Qudsi',          'الأحاديث القدسية',    'Kumpulan Hadits Qudsi', 9, 75001, 79999, 0);

-- Backfill collection + hadith_number for every already-imported row by range.
UPDATE hadits SET collection = 'bukhari',  hadith_number = id - 1000  WHERE id BETWEEN 1001 AND 8999   AND collection IS NULL;
UPDATE hadits SET collection = 'muslim',   hadith_number = id - 9000  WHERE id BETWEEN 9001 AND 19999  AND collection IS NULL;
UPDATE hadits SET collection = 'tirmidhi', hadith_number = id - 20000 WHERE id BETWEEN 20001 AND 29999 AND collection IS NULL;
UPDATE hadits SET collection = 'abudawud', hadith_number = id - 30000 WHERE id BETWEEN 30001 AND 39999 AND collection IS NULL;
UPDATE hadits SET collection = 'nasai',    hadith_number = id - 40000 WHERE id BETWEEN 40001 AND 49999 AND collection IS NULL;
UPDATE hadits SET collection = 'ibnmajah', hadith_number = id - 50000 WHERE id BETWEEN 50001 AND 59999 AND collection IS NULL;
UPDATE hadits SET collection = 'malik',    hadith_number = id - 60000 WHERE id BETWEEN 60001 AND 69999 AND collection IS NULL;
UPDATE hadits SET collection = 'nawawi',   hadith_number = id - 70000 WHERE id BETWEEN 70001 AND 74999 AND collection IS NULL;
UPDATE hadits SET collection = 'qudsi',    hadith_number = id - 75000 WHERE id BETWEEN 75001 AND 79999 AND collection IS NULL;
