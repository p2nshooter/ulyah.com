-- Live hub v2 (owner request): TikTok/Facebook slots removed entirely; six
-- manual YouTube slots; plus a new AUTO section — always-on 24h Islamic
-- broadcasts worldwide, embedded by CHANNEL (so they follow whatever the
-- channel is currently streaming, no per-session link updates). Auto rows
-- are data, not code: the admin can add/remove more world channels any time.
-- Every seeded channel ID below was verified against independent channel
-- registries before inclusion. Auto rows use slot numbers >= 101 so they can
-- never collide with the manual slots (UNIQUE(platform, slot)).

ALTER TABLE live_stream ADD COLUMN kind TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE live_stream ADD COLUMN region TEXT;

DELETE FROM live_stream WHERE platform IN ('tiktok', 'facebook');

INSERT OR IGNORE INTO live_stream (platform, slot, kind) VALUES ('youtube', 6, 'manual');

INSERT OR IGNORE INTO live_stream (platform, slot, kind, title, region, url, is_live) VALUES
  ('youtube', 101, 'auto', 'Masjidil Haram — Makkah', 'Arab Saudi', 'https://www.youtube.com/channel/UCos52azQNBgW63_9uDJoPDA', 1),
  ('youtube', 102, 'auto', 'Masjid Nabawi — Madinah', 'Arab Saudi', 'https://www.youtube.com/channel/UCROKYPep-UuODNwyipe6JMw', 1),
  ('youtube', 103, 'auto', 'Rodja TV — Kajian & Tilawah', 'Indonesia', 'https://www.youtube.com/channel/UCghNwGdNSxfTyIV-8Bz_EFg', 1),
  ('youtube', 104, 'auto', 'Madani Channel — Urdu Live', 'Pakistan · Global', 'https://www.youtube.com/channel/UCuUocUAnPTUkwGtC8GuNKow', 1),
  ('youtube', 105, 'auto', 'ARY Qtv — Islamic Content 24/7', 'Pakistan', 'https://www.youtube.com/channel/UCE2oY4S4wOu6WofU2YbfWsw', 1),
  ('youtube', 106, 'auto', 'Diyanet TV — Canlı Yayın', 'Turki', 'https://www.youtube.com/channel/UC3d1AdmvAP6Jq16-WpD086g', 1);
