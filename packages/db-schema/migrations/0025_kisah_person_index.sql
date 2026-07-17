-- Kisah "person index" — the browsable name → full-story navigation the
-- owner asked for: click a Nabi's/Sahabat's/Ulama's NAME and land on their
-- own page. Before this, the /kisah listing only ever showed names that
-- already had a full multi-episode `stories` series (Yusuf, Musa, Nuh, …),
-- so all 25 prophets and every well-known companion who didn't yet have a
-- full series were simply invisible — there was no place to click them.
--
-- `full_story_slug` links to an EXISTING `stories` row when a full
-- multi-episode series already exists (reuses the current rich reader);
-- otherwise the person's own page renders `summary_id` — a real, complete
-- one-page profile (not a stub) — so no name is ever a dead end.

CREATE TABLE kisah_person (
  slug TEXT PRIMARY KEY,
  category_slug TEXT NOT NULL,     -- 'kisah-para-nabi' | 'kisah-sahabat' | 'kisah-ulama-dunia'
  name_id TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  title_id TEXT,                   -- short honorific/role, e.g. "Nabi & Rasul", "Khalifah ke-1"
  summary_id TEXT NOT NULL,        -- complete one-page profile shown when no full series exists yet
  full_story_slug TEXT,            -- REFERENCES stories(slug) when a rich multi-episode series exists
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_kisah_person_cat ON kisah_person (category_slug, sort_order);
