-- Migration number: 0028    2026-07-15
-- Character-animated educational stories for children (Kisah Anak) —
-- a scene-based animated storybook: an animated SVG character + scene
-- background per step, with narration driven by real speech (browser TTS,
-- multi-language, same zero-key engine used site-wide) rather than a fixed
-- timer, so pacing is always correct regardless of the reader's language.
-- `duration_ms` is only a fallback for when speech synthesis is unavailable.

CREATE TABLE kids_story (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_id TEXT NOT NULL,
  title_en TEXT,
  summary_id TEXT,
  summary_en TEXT,
  cover_variant TEXT NOT NULL DEFAULT 'boy' CHECK (cover_variant IN ('boy', 'girl')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE kids_story_scene (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL REFERENCES kids_story(id) ON DELETE CASCADE,
  scene_order INTEGER NOT NULL,
  time_of_day TEXT NOT NULL DEFAULT 'day' CHECK (time_of_day IN ('day', 'night')),
  character_variant TEXT NOT NULL DEFAULT 'boy' CHECK (character_variant IN ('boy', 'girl')),
  character_action TEXT NOT NULL DEFAULT 'idle' CHECK (character_action IN ('idle', 'wave', 'walk', 'jump', 'point', 'think', 'hug')),
  caption_id TEXT NOT NULL,
  caption_en TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 7000,
  UNIQUE (story_id, scene_order)
);
CREATE INDEX idx_kids_story_scene_story ON kids_story_scene(story_id, scene_order);
