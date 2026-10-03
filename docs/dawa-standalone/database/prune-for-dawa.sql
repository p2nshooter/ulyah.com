-- ============================================================================
-- prune-for-dawa.sql — buang dari dump ulyah-db semua baris yang BUKAN milik
-- dawa.es, sebelum digabung ke dawa-db. Dijalankan oleh import-to-dawa-db.sh
-- di database STAGING LOKAL (tidak pernah langsung ke produksi).
--
-- Setiap pernyataan dijalankan terpisah dan boleh gagal (tabelnya mungkin
-- tidak ikut di dump --dawa-only) tanpa menghentikan yang lain.
-- ============================================================================

-- Terjemahan mesin: dawa.es hanya membaca terjemahan KE Spanyol.
-- Kunci: mt:<bahasa-sumber>-<bahasa-target>:<hash>
DELETE FROM mt_cache WHERE k NOT LIKE 'mt:%-es:%';

-- Tabel per-situs: simpan hanya baris dawa.
DELETE FROM site_pageviews WHERE site <> 'dawa';
DELETE FROM ad_daily WHERE site <> 'dawa';
DELETE FROM analytics_pageviews WHERE tenant <> 'dawa';
DELETE FROM app_installs WHERE tenant <> 'dawa';
DELETE FROM app_uninstalls WHERE tenant <> 'dawa';
DELETE FROM hajj_package WHERE tenant <> 'dawa';
DELETE FROM tenant_pages WHERE tenant <> 'dawa';

-- Admin: tenant NULL = pemilik utama (tetap), admin situs lain dihapus.
DELETE FROM admin_users WHERE tenant IS NOT NULL AND tenant <> 'dawa';

-- Data sementara / milik situs di luar dawa.es.
DELETE FROM live_presence;
DELETE FROM site_hits;
DELETE FROM key_validation_log;
DELETE FROM ad_events;
