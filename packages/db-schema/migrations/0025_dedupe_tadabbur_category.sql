-- Migration number: 0025    2026-07-15
-- Fixes a real duplicate seen live: "Tadabbur Al-Qur'an" appearing twice in
-- every category filter (audiobook, kisah listing, etc). Root cause: the
-- AI-driven content scheduler (lib/scaling.ts) could mint a brand-new
-- category row whenever it proposed a "new" category name that was really
-- just a differently-worded version of one that already existed — each
-- wording got its own slug, so the same category piled up multiple times.
-- scaling.ts now guards against this going forward (normalized-name dedupe
-- before creating a category); this migration cleans up whatever duplicate
-- rows already exist in production from before that fix.
--
-- Keeps the row with slug = 'tadabbur' (the one lib/compile.ts's
-- ensureCategory() actively writes to every run, so it is guaranteed to be
-- the one already carrying content) as canonical. Any other category whose
-- name normalizes to the same text (case/punctuation/diacritic-insensitive:
-- "Tadabbur Al-Qur'an", "Tadabbur Al-Quran", "tadabbur al qur an", …) has its
-- stories re-pointed to the canonical row, then is deleted. Written so it is
-- a correct no-op if no duplicate exists (e.g. a fresh database).

-- Ensure the canonical row exists at all (mirrors ensureCategory's own
-- insert, so this migration is safe to run before compile.ts ever has).
INSERT OR IGNORE INTO categories (name, slug, auto_created) VALUES ('Tadabbur Al-Qur''an', 'tadabbur', 1);

UPDATE stories
SET category_id = (SELECT id FROM categories WHERE slug = 'tadabbur')
WHERE category_id IN (
  SELECT id FROM categories
  WHERE slug <> 'tadabbur'
    AND replace(replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', ''), '’', '') IN (
      'tadabburalquran', 'tadabburalquranalkarim'
    )
);

DELETE FROM categories
WHERE slug <> 'tadabbur'
  AND replace(replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', ''), '’', '') IN (
    'tadabburalquran', 'tadabburalquranalkarim'
  );
