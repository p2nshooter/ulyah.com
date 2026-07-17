-- ULYAH.COM — Initial D1 schema
-- Mirrors architecture doc §8 (core Quran/content tables) + §28.8 (audiobook extensions)
-- plus operational tables for donations, AI/GPU key pool, admin, and client accounts.

-- ── Qur'an core ──────────────────────────────────────────────────────────
CREATE TABLE surah (
  id INTEGER PRIMARY KEY,               -- 1..114
  name_ar TEXT NOT NULL,
  name_id TEXT NOT NULL,
  name_transliteration TEXT NOT NULL,
  revelation_place TEXT NOT NULL CHECK (revelation_place IN ('meccan','medinan')),
  ayah_count INTEGER NOT NULL
);

CREATE TABLE ayah (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surah_id INTEGER NOT NULL REFERENCES surah(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,              -- ayah number within surah
  text_ar TEXT NOT NULL,
  text_translit TEXT,
  UNIQUE (surah_id, number)
);
CREATE INDEX idx_ayah_surah ON ayah(surah_id);

CREATE TABLE translation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ayah_id INTEGER NOT NULL REFERENCES ayah(id) ON DELETE CASCADE,
  lang TEXT NOT NULL DEFAULT 'id',
  text TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'quran-json (CC-BY-4.0)'
);
CREATE INDEX idx_translation_ayah ON translation(ayah_id, lang);

CREATE TABLE tafsir (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ayah_id INTEGER NOT NULL REFERENCES ayah(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  text TEXT NOT NULL,
  ai_generated INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','pending_review','published','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_tafsir_ayah ON tafsir(ayah_id);

CREATE TABLE asbabun_nuzul (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ayah_id INTEGER NOT NULL REFERENCES ayah(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  source TEXT NOT NULL
);
CREATE INDEX idx_asbabun_nuzul_ayah ON asbabun_nuzul(ayah_id);

CREATE TABLE hadits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text_ar TEXT,
  text_id TEXT NOT NULL,
  narrator TEXT,
  grade TEXT,
  source TEXT NOT NULL
);

CREATE TABLE ayah_hadits_map (
  ayah_id INTEGER NOT NULL REFERENCES ayah(id) ON DELETE CASCADE,
  hadits_id INTEGER NOT NULL REFERENCES hadits(id) ON DELETE CASCADE,
  relevance_note TEXT,
  PRIMARY KEY (ayah_id, hadits_id)
);

-- ── Qori & audio ─────────────────────────────────────────────────────────
CREATE TABLE qori (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  audio_base_path TEXT NOT NULL         -- R2 key prefix
);

CREATE TABLE audio_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ayah_id INTEGER NOT NULL REFERENCES ayah(id) ON DELETE CASCADE,
  qori_id INTEGER NOT NULL REFERENCES qori(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  duration REAL,
  UNIQUE (ayah_id, qori_id)
);

-- ── Voice personas (§28.8) ───────────────────────────────────────────────
CREATE TABLE voice_persona (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male','female')),
  tone_desc TEXT,
  tts_engine TEXT NOT NULL,             -- edge-tts | piper | coqui | elevenlabs | azure
  sample_r2_key TEXT
);

-- ── Categories & Stories/Kisah ───────────────────────────────────────────
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  auto_created INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL, -- unique per (slug, lang) — see migration 0004
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  audio_r2_key TEXT,
  ai_generated INTEGER NOT NULL DEFAULT 0,
  voice_persona_id INTEGER REFERENCES voice_persona(id) ON DELETE SET NULL,
  qc_status TEXT NOT NULL DEFAULT 'draft_audio' CHECK (qc_status IN ('draft_audio','qc_pending','published')),
  source_format TEXT NOT NULL DEFAULT 'ai_original' CHECK (source_format IN ('pdf_native','pdf_scan','epub','docx','html','ai_original')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','published','rejected')),
  confidence_score REAL,
  related_ayah_id INTEGER REFERENCES ayah(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);
CREATE INDEX idx_stories_category ON stories(category_id);
CREATE INDEX idx_stories_status ON stories(status);

CREATE TABLE audio_transcript_sync (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  sentence_index INTEGER NOT NULL,
  start_ms INTEGER NOT NULL,
  end_ms INTEGER NOT NULL,
  text TEXT NOT NULL
);
CREATE INDEX idx_transcript_story ON audio_transcript_sync(story_id);

-- ── E-books ──────────────────────────────────────────────────────────────
CREATE TABLE ebooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT,
  r2_key TEXT NOT NULL,
  cover_r2_key TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  license_status TEXT NOT NULL DEFAULT 'unverified' CHECK (license_status IN ('unverified','public_domain','cc_licensed','original','rejected')),
  license_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_ebooks_license ON ebooks(license_status);

-- ── Lisensi Gate registry (§10.3) ────────────────────────────────────────
CREATE TABLE license_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT,
  license_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Clients / donors (optional account layer, NOT required for visitors) ─
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- ── Admin users (bootstrapped from Worker secret, see admin-worker) ──────
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- ── Donations ────────────────────────────────────────────────────────────
CREATE TABLE donation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL CHECK (provider IN ('paypal','nowpayments','api_key')),
  amount REAL,
  currency TEXT,
  type TEXT NOT NULL CHECK (type IN ('fiat','crypto','api_key_donation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed','refunded')),
  donor_name TEXT,
  donor_email TEXT,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  provider_ref TEXT,                    -- PayPal order id / NOWPayments payment id
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_donation_logs_status ON donation_logs(status);
CREATE INDEX idx_donation_logs_client ON donation_logs(client_id);

-- ── AI / GPU key pool (§11.4, §13) ───────────────────────────────────────
CREATE TABLE ai_key_pool (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,               -- openrouter | groq | google-ai-studio | workers-ai | hf-inference | hf-zerogpu | colab | kaggle | modal | replicate | elevenlabs | azure-tts
  scope TEXT NOT NULL DEFAULT 'text' CHECK (scope IN ('text','tts','gpu','image')),
  key_ref TEXT NOT NULL,                -- AES-GCM encrypted ciphertext (base64), never raw
  key_iv TEXT NOT NULL,                 -- AES-GCM IV (base64)
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification','active','slow','rate_limited','exhausted','revoked','rejected')),
  quota_used REAL NOT NULL DEFAULT 0,
  quota_limit REAL,
  latency_ms INTEGER,
  priority INTEGER NOT NULL DEFAULT 5,  -- 1 = highest
  donated_by_client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  donor_label TEXT,
  last_health_check TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_ai_key_pool_status ON ai_key_pool(provider, status);

-- Automated safety/optimality test results for every donated or added key
CREATE TABLE key_validation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_id INTEGER NOT NULL REFERENCES ai_key_pool(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,              -- auth_check | scope_check | latency_probe | quota_probe
  passed INTEGER NOT NULL,
  latency_ms INTEGER,
  safety_score REAL,                    -- 0.0-1.0 heuristic (broad-scope/write-access keys score lower)
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_key_validation_key ON key_validation_log(key_id);

-- ── Zero-hand generation pipeline (§14) ───────────────────────────────────
CREATE TABLE generation_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_type TEXT NOT NULL,               -- story | tafsir_summary | categorize | tts | fact_check
  prompt_template_id TEXT,
  target_table TEXT,
  target_id INTEGER,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','pending_review','done','failed')),
  key_id INTEGER REFERENCES ai_key_pool(id) ON DELETE SET NULL,
  priority INTEGER NOT NULL DEFAULT 5,
  output_ref TEXT,                      -- JSON blob of AI output / R2 key
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);

-- ── Smart-scaling metrics (Portal Admin dashboards) ───────────────────────
CREATE TABLE scaling_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_type TEXT NOT NULL,            -- content_coverage | key_pool_load | donation_budget | queue_depth
  value REAL NOT NULL,
  detail TEXT,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_scaling_metrics_type ON scaling_metrics(metric_type, recorded_at);

-- ── Audit log (append-only) ───────────────────────────────────────────────
CREATE TABLE admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  ip_hash TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_admin_audit_created ON admin_audit_log(created_at);
