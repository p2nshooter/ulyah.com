-- Real-time presence, so the admin can see — within ~3 seconds — how many
-- devices are on each ecosystem site RIGHT NOW, and how many have just left
-- (owner: "hitungan maksimal 3 detik langsung live berapa yg lagi online dan
-- yg sudah closed ... real pengunjung tanpa page view"). One row per device
-- per site, refreshed by a lightweight heartbeat while the page is open; the
-- admin reads it as ONLINE (last_seen within ~20s) vs CLOSED/just-left
-- (20s..5min). device_id is the same anonymous localStorage token used
-- elsewhere — never a fingerprint. Rows older than a few minutes are pruned
-- opportunistically on read.
CREATE TABLE IF NOT EXISTS live_presence (
  tenant    TEXT    NOT NULL,
  device_id TEXT    NOT NULL,
  last_seen INTEGER NOT NULL,  -- unix seconds
  PRIMARY KEY (tenant, device_id)
);
CREATE INDEX IF NOT EXISTS idx_live_presence_seen ON live_presence(last_seen);
