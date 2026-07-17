-- Stories become language-aware, mirroring `translation` — required so a
-- "kisah" switches together with the rest of the site when the visitor
-- changes language, instead of silently staying in one language.
ALTER TABLE stories ADD COLUMN lang TEXT NOT NULL DEFAULT 'id';
ALTER TABLE stories ADD COLUMN series_key TEXT;   -- groups episodes across languages, e.g. "kisah-nabi-yusuf-01"
ALTER TABLE stories ADD COLUMN episode_number INTEGER;
ALTER TABLE stories ADD COLUMN pdf_ebook_id INTEGER REFERENCES ebooks(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_stories_slug_lang ON stories(slug, lang);
CREATE INDEX idx_stories_series ON stories(series_key, episode_number);
