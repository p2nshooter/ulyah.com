-- Migration number: 0039    2026-07-19
-- Per-DEVICE install accounting (owner: "klo satu HP install terus di
-- uninstall terus install lagi berarti harus jelas juga hitungannya jika
-- masih di HP yang sama"). Every install/uninstall beacon now carries a
-- stable anonymous device id (random, localStorage — no fingerprinting, no
-- personal data), so the admin report can show BOTH raw event counts and the
-- number of DISTINCT devices whose most recent event is an install ("truly
-- installed right now"), immune to install→uninstall→reinstall double
-- counting on one phone.

ALTER TABLE app_installs ADD COLUMN device_id TEXT;
ALTER TABLE app_uninstalls ADD COLUMN device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_app_installs_device ON app_installs(device_id);
CREATE INDEX IF NOT EXISTS idx_app_uninstalls_device ON app_uninstalls(device_id);
