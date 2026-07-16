-- Full multi-section biographies for kisah_person profiles.
-- Owner: "kisah2 para nabi ini sedikit banget, harusnya full seluruh kisahnya"
-- — the 25 prophet profiles only carried a ~400-char summary. Each person can
-- now have ordered story sections (lineage → mission → trials/miracles →
-- ending → lessons), every section anchored to explicit Qur'an references.
-- Seeded by packages/db-schema/seed/kisah_nabi_full.sql (count-gated in deploy).
CREATE TABLE IF NOT EXISTS kisah_person_section (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_slug TEXT NOT NULL REFERENCES kisah_person(slug),
  section_order INTEGER NOT NULL,
  heading_id TEXT NOT NULL,
  body_id TEXT NOT NULL,
  quran_refs TEXT, -- human-readable, e.g. 'QS Hud: 25–49 · QS Nuh: 1–28'
  UNIQUE (person_slug, section_order)
);
CREATE INDEX IF NOT EXISTS idx_kisah_person_section ON kisah_person_section (person_slug, section_order);
