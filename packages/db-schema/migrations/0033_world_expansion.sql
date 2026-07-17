-- World expansion round 2 (owner: "ratusan film, puluhan per negara" +
-- "live streaming sedunia yang banyak"). Every channel ID below verified
-- against an independent registry (vidIQ/HypeAuditor/Socialbakers) before
-- inclusion; candidates that could not be confidently verified as OFFICIAL
-- (e.g. Cairo Quran radio mirrors) were deliberately excluded rather than
-- risk embedding the wrong channel.

-- ── More always-on world live channels ────────────────────────────────────
INSERT OR IGNORE INTO live_stream (platform, slot, kind, title, region, url, is_live) VALUES
  ('youtube', 107, 'auto', 'Islam Channel', 'Inggris (UK)', 'https://www.youtube.com/channel/UCggJmYhtxBk1naIbZN541pw', 1),
  ('youtube', 108, 'auto', 'TV AlHijrah', 'Malaysia', 'https://www.youtube.com/channel/UCa5Go98H_EQOqwjYgx5-suw', 1),
  ('youtube', 109, 'auto', 'Toyor Aljanah Live — Anak', 'Yordania · Dunia Arab', 'https://www.youtube.com/channel/UCZbpK_Lgctew3YNELlG2ecw', 1);

-- ── More world kids channels (each = a whole library of films) ────────────
INSERT OR IGNORE INTO video_anak_channel (country, title, channel_id, language, sort_order) VALUES
  ('Indonesia', 'Nussa Official — Animasi Islami', 'UCV2jNjJEtO0Hr3b1Es3xPJg', 'id', 6),
  ('Indonesia', 'Riko The Series', 'UCHzkGRP2y-3QJQWzVkHNGgg', 'id', 7),
  ('Dunia Arab', 'Toyor Al-Janah — طيور الجنة', 'UCozAuGJZ5MPoijz8IE_1Gtw', 'ar', 8),
  ('Pakistan · Global', 'Kids Madani Channel', 'UCsNSt0fxMniSH9XHaNneZfw', 'ur', 9),
  ('Australia', 'One4Kids — Zaky & Friends', 'UC5vfWTTPnKdFp-8s0KbqJhw', 'en', 10);
