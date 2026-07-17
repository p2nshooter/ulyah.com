-- Migration number: 0016    2026-07-10
-- Separates the Kisah (stories) library into its proper taxonomy — "25
-- Nabi" (id=1) and "Sahabat" (id=2) already existed from 0002_seed_static
-- but sat unused; this adds the three tiers the user explicitly asked to
-- see kept distinct: Tabi'in, Tabi'in Tabi'in, and world scholars by
-- country. No explicit `id` is given — the zero-hand content engine can
-- auto-create categories with `auto_created=1` at any id, so relying on a
-- hardcoded literal here could collide; `slug` is UNIQUE, so INSERT OR
-- IGNORE keyed on it is idempotent and collision-safe regardless of which
-- ids are already taken.

INSERT OR IGNORE INTO categories (name, slug, parent_id, auto_created) VALUES
  ('Kisah Tabi''in', 'kisah-tabiin', NULL, 0),
  ('Kisah Tabi''in Tabi''in', 'kisah-tabiin-tabiin', NULL, 0),
  ('Kisah Ulama Dunia', 'kisah-ulama-dunia', NULL, 0);
