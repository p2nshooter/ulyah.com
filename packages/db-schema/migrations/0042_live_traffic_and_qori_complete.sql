-- ── Live traffic (admin portal, no manual refresh) ─────────────────────────
-- site_pageviews is aggregated per DAY, so it can never answer "berapa
-- pengunjung online SEKARANG, naik atau turun". site_hits is a small rolling
-- window: one row per /track beacon with a unix timestamp; the scheduled tick
-- prunes rows older than 30 minutes, and /admin/site-analytics counts the
-- last 5 minutes per site for the live "online sekarang" number.
CREATE TABLE IF NOT EXISTS site_hits (
  site TEXT NOT NULL,
  ts   INTEGER NOT NULL              -- unix seconds
);
CREATE INDEX IF NOT EXISTS idx_site_hits_ts ON site_hits(ts);
CREATE INDEX IF NOT EXISTS idx_site_hits_site_ts ON site_hits(site, ts);

-- ── Complete the qori registry ──────────────────────────────────────────────
-- Every per-ayah reciter the web player offers (apps/web/src/lib/qori-cdn.ts)
-- must have a qori row whose audio_base_path matches its R2 folder — the
-- /audio/qori cache-fill and the bulk importer both resolve qori_id through
-- audio_base_path. Idempotent: inserts only what is missing.

-- The importer + player use the folder 'fares'; the old seed row said 'abbad'.
UPDATE qori SET audio_base_path = 'audio/qori/fares'
 WHERE audio_base_path = 'audio/qori/abbad';

INSERT INTO qori (name, audio_base_path, country)
SELECT v.name, v.path, v.country FROM (
  SELECT 'Saud Al-Shuraim'            AS name, 'audio/qori/shuraym'           AS path, 'Saudi Arabia'          AS country
  UNION ALL SELECT 'Muhammad Ayyub',            'audio/qori/ayyoub',            'Saudi Arabia'
  UNION ALL SELECT 'Abdullah Basfar',           'audio/qori/basfar',            'Saudi Arabia'
  UNION ALL SELECT 'Al-Minshawi (Mujawwad)',    'audio/qori/minshawi-mujawwad', 'Egypt'
  UNION ALL SELECT 'Al-Husary (Mujawwad)',      'audio/qori/husary-mujawwad',   'Egypt'
  UNION ALL SELECT 'Khalifa Al-Tunaiji',        'audio/qori/tunaiji',           'United Arab Emirates'
  UNION ALL SELECT 'Abdullah Al-Matroud',       'audio/qori/matroud',           'Saudi Arabia'
  UNION ALL SELECT 'Abdullah Awad Al-Juhany',   'audio/qori/juhany',            'Saudi Arabia'
  UNION ALL SELECT 'Ali Jaber',                 'audio/qori/alijaber',          'Saudi Arabia'
  UNION ALL SELECT 'Mahmoud Ali Al-Banna',      'audio/qori/banna',             'Egypt'
  UNION ALL SELECT 'Fares Abbad',               'audio/qori/fares',             'Yemen'
) v
WHERE NOT EXISTS (SELECT 1 FROM qori q WHERE q.audio_base_path = v.path);
