-- Word-by-word morphology & grammar (nahwu-shorof) for the whole Qur'an.
-- Source: Quranic Arabic Corpus (QAC) morphology v0.4 — corpus.quran.com
-- (Kais Dukes, University of Leeds), distributed under the GNU General Public
-- License. One row per morphological SEGMENT (a word may split into several).
-- Imported once by scripts/import-morphology.mjs via .github/workflows/
-- import-morphology.yml — never edited by hand.
CREATE TABLE IF NOT EXISTS quran_morphology (
  surah    INTEGER NOT NULL,
  ayah     INTEGER NOT NULL,
  word     INTEGER NOT NULL,   -- word index within the ayah (1-based)
  segment  INTEGER NOT NULL,   -- segment index within the word (1-based)
  form     TEXT NOT NULL,      -- Arabic text of the segment (with diacritics)
  tag      TEXT NOT NULL,      -- broad POS tag (N / V / P ...)
  features TEXT NOT NULL,      -- raw pipe-delimited QAC features
  pos      TEXT,               -- fine POS code parsed from features (e.g. PN, DET, IMPF)
  root     TEXT,               -- triliteral root (e.g. كتب), null if none
  lemma    TEXT,               -- dictionary form
  PRIMARY KEY (surah, ayah, word, segment)
);
CREATE INDEX IF NOT EXISTS idx_morph_ayah ON quran_morphology (surah, ayah);
