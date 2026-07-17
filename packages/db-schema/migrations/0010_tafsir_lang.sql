-- Tafsir/asbabun nuzul previously had no language column, so the ayah
-- bundle could only ever hold one language's worth of content (in practice:
-- almost nothing — 2 tafsir rows and 1 asbabun_nuzul row existed in the
-- entire database). Adding `lang` so a real bulk import (multiple editions,
-- multiple languages) can coexist and be filtered per visitor.

ALTER TABLE tafsir ADD COLUMN lang TEXT NOT NULL DEFAULT 'id';
ALTER TABLE asbabun_nuzul ADD COLUMN lang TEXT NOT NULL DEFAULT 'en';

CREATE INDEX idx_tafsir_ayah_lang ON tafsir(ayah_id, lang);
CREATE INDEX idx_asbabun_nuzul_ayah_lang ON asbabun_nuzul(ayah_id, lang);
