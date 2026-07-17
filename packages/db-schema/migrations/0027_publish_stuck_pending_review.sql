-- Migration number: 0027    2026-07-15
-- Root-cause fix for empty audiobook/category filter chips: `stories` rows
-- only ever reached the site when an admin manually worked the
-- `pending_review` queue, but this is a zero-hand platform — nobody does
-- that — so every AI-drafted story that had already passed fact-checking
-- (see scaling.ts) sat invisible forever, while its category chip still
-- showed up on /audiobook with nothing behind it. scaling.ts now publishes
-- those stories immediately going forward; this backfills whatever is
-- already stuck. Idempotent: a second run only ever matches zero rows.
UPDATE stories
SET status = 'published', published_at = COALESCE(published_at, datetime('now'))
WHERE status = 'pending_review';

-- Cosmetic cleanup: remove auto-created categories that ended up as pure
-- duplicates (e.g. the model proposing "Tadabbur Al-Qur'an" again under a
-- new slug when it already existed) and never had a single story of any
-- status attached. Never touches a category that anything references.
DELETE FROM categories
WHERE auto_created = 1
  AND id NOT IN (SELECT DISTINCT category_id FROM stories WHERE category_id IS NOT NULL)
  AND id NOT IN (SELECT DISTINCT category_id FROM ebooks WHERE category_id IS NOT NULL)
  AND id NOT IN (SELECT DISTINCT parent_id FROM categories WHERE parent_id IS NOT NULL);
