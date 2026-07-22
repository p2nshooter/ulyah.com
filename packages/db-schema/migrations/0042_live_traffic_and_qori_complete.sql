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
-- audio_base_path. Idempotent: each INSERT adds its row only if missing.
--
-- NB: written as separate single-row INSERT ... WHERE NOT EXISTS statements on
-- purpose. The previous version used one INSERT ... SELECT ... UNION ALL ... in
-- a derived table with a correlated WHERE NOT EXISTS, which Cloudflare D1
-- rejected with "too many terms in compound SELECT (SQLITE_ERROR 7500)" and
-- failed the whole deploy. Plain statements have no compound-SELECT limit.

-- The importer + player use the folder 'fares'; the old seed row said 'abbad'.
UPDATE qori SET audio_base_path = 'audio/qori/fares'
 WHERE audio_base_path = 'audio/qori/abbad';

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Saud Al-Shuraim', 'audio/qori/shuraym', 'Saudi Arabia'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/shuraym');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Muhammad Ayyub', 'audio/qori/ayyoub', 'Saudi Arabia'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/ayyoub');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Abdullah Basfar', 'audio/qori/basfar', 'Saudi Arabia'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/basfar');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Al-Minshawi (Mujawwad)', 'audio/qori/minshawi-mujawwad', 'Egypt'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/minshawi-mujawwad');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Al-Husary (Mujawwad)', 'audio/qori/husary-mujawwad', 'Egypt'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/husary-mujawwad');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Khalifa Al-Tunaiji', 'audio/qori/tunaiji', 'United Arab Emirates'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/tunaiji');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Abdullah Al-Matroud', 'audio/qori/matroud', 'Saudi Arabia'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/matroud');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Abdullah Awad Al-Juhany', 'audio/qori/juhany', 'Saudi Arabia'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/juhany');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Ali Jaber', 'audio/qori/alijaber', 'Saudi Arabia'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/alijaber');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Mahmoud Ali Al-Banna', 'audio/qori/banna', 'Egypt'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/banna');

INSERT INTO qori (name, audio_base_path, country)
SELECT 'Fares Abbad', 'audio/qori/fares', 'Yemen'
WHERE NOT EXISTS (SELECT 1 FROM qori WHERE audio_base_path = 'audio/qori/fares');
