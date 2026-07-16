-- Show/hide for the world catalogues (owner: list as MANY channels as
-- possible, then curate visibility manually from the admin portal — hidden
-- rows stay stored but never render publicly).
ALTER TABLE video_anak_channel ADD COLUMN visible INTEGER NOT NULL DEFAULT 1;
-- live_stream needs no new column: for kind='auto' rows, is_live doubles as
-- the show/hide flag (autos are "always live" by nature; hiding one simply
-- sets is_live=0 from the admin toggle).
