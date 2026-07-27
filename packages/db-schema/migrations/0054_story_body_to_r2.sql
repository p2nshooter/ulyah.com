-- Story bodies move to R2; D1 keeps the key.
--
-- Owner: "yg di penuhin R2, klo D1 mah kunci2 aja" — said after the database
-- hit Cloudflare's 500 MB per-database cap and every write started failing,
-- including the admin's own two-step verification. The site could still be
-- read; nothing could be written.
--
-- `stories` is 84.9 MB across 2,298 rows — an average of 37 KB per body,
-- because these are the multi-volume kisah, not blog posts. It is the largest
-- thing in the database that is genuinely a FILE rather than a field, and the
-- codebase already has the pattern for exactly this: audio lives at
-- audio_r2_key, the PDF at ebooks.r2_key, a donation proof at proof_r2_key,
-- artwork at site_media.r2_key. D1 holds the pointer, R2 holds the bytes.
--
-- Nothing is dropped here. `body` stays, and the reader falls back to it
-- whenever body_r2_key is null, so this migration is inert until the mover
-- has actually put a body in R2 — and a story whose upload failed keeps
-- serving from D1 rather than going blank.
ALTER TABLE stories ADD COLUMN body_r2_key TEXT;

-- The mover looks up what it has not moved yet, over and over, and the table
-- is scanned by status/lang everywhere else. Partial index: only the rows
-- still holding a body in D1 are of interest, so it shrinks as work is done
-- and costs nothing once the migration is complete.
CREATE INDEX IF NOT EXISTS idx_stories_body_pending
  ON stories (id) WHERE body_r2_key IS NULL;
