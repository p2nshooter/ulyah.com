-- Anonymous per-device token on pageviews, so the admin portal can show REAL
-- unique devices (not just raw page views) per site over 24h / 7d — owner:
-- "tampilkan real brp perangkat dalam 24 jam yg real yg menggunakan ekosistem
-- ulyah.com". It is the same random localStorage token the install tracker
-- already uses ("ulyah_device_id"), NOT a fingerprint. Nullable, so older
-- clients that send no device id still record their pageview.
ALTER TABLE analytics_pageviews ADD COLUMN device_id TEXT;
CREATE INDEX IF NOT EXISTS idx_pageviews_device ON analytics_pageviews(tenant, device_id, created_at);
