-- World kids channels (owner: "film2 kartun seluruh dunia dari setiap
-- negara... di kelompokkan masing2 negara"). Each row is an OFFICIAL kids
-- channel embedded via its uploads playlist (channel id UCxxx → playlist
-- UUxxx), grouped by country on /anak. Every channel ID verified against
-- independent registries (vidIQ) before inclusion. The owner's own 45
-- videos stay in video_anak, now tagged with a country too.

ALTER TABLE video_anak ADD COLUMN country TEXT NOT NULL DEFAULT 'Indonesia';

CREATE TABLE video_anak_channel (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_id TEXT NOT NULL UNIQUE,
  language TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO video_anak_channel (country, title, channel_id, language, sort_order) VALUES
  ('Malaysia', 'Omar & Hana — Lagu Kanak-Kanak Islam', 'UCiZL26ScfRZDdEAkkPJgJbA', 'ms', 1),
  ('Indonesia', 'Omar & Hana Indonesia — Animasi Anak Islami', 'UCFjhhxye7eGjWXHfvQIAH0Q', 'id', 2),
  ('Global (English)', 'Omar & Hana — Islamic Cartoons for Kids', 'UC178EmfQAV3OT-UpuO6WUMg', 'en', 3),
  ('Dunia Arab', 'Omar & Hana Arabic — أناشيد ورسوم دينية للأطفال', 'UCr3XqrfFHRy25Dcrm7RVD0w', 'ar', 4),
  ('Pakistan (Urdu)', 'Omar & Hana Urdu', 'UCkoSwUjEOt1Y7MT61b4sVvw', 'ur', 5);
