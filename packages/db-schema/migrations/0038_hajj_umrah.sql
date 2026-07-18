-- Hajj & Umrah promotion page + its products, fully admin-managed. The
-- acquisition page advertises "every page is dynamic — donations, products,
-- Hajj & Umrah, kids' films" but the Hajj & Umrah page and its products did
-- not exist yet (owner: "dimana ini halaman promosi haji & umroh dan
-- produknya di ke dua website"). This adds the missing feature: one table,
-- tenant-scoped, edited/shown/hidden from the admin portal — nothing hardcoded.
--
-- A row is one package/product card. Text is stored in the tenant's own
-- language (each sibling admin curates its own site), matching how the rest of
-- the content works. `features` is a JSON array of bullet strings. `visible`
-- is the one-click show/hide flag; hidden rows stay stored but never render.
CREATE TABLE IF NOT EXISTS hajj_package (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant      TEXT NOT NULL,                       -- 'ulyah' | '1fr' | 'tilawa'
  kind        TEXT NOT NULL DEFAULT 'umrah',       -- 'hajj' | 'umrah'
  title       TEXT NOT NULL,
  provider    TEXT,                                -- travel operator / organiser
  description TEXT,
  price       TEXT,                                -- free text, e.g. "€4.990" / "Rp 35 jt"
  duration    TEXT,                                -- e.g. "14 Tage" / "12 hari"
  departure   TEXT,                                -- e.g. "Frankfurt · März 2026"
  image_url   TEXT,
  badge       TEXT,                                -- e.g. "Bestseller" / "Terlaris"
  features    TEXT,                                -- JSON array of bullet strings
  contact_url TEXT,                                -- wa.me / mailto: / https link
  sort_order  INTEGER NOT NULL DEFAULT 99,
  visible     INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_hajj_package_tenant ON hajj_package(tenant, visible, sort_order);

-- Starter examples per site, in each site's native language, so the page is
-- populated on first view. Providers are clearly-generic placeholders ("Beispiel
-- …", "Exemple …", "Contoh …") for the owner to replace — not real companies —
-- and contacts point at the site's own inbox. Everything here is editable or
-- removable from the admin portal.
INSERT INTO hajj_package (tenant, kind, title, provider, description, price, duration, departure, badge, features, contact_url, sort_order) VALUES
  -- ── ulyah.com (Indonesian) ─────────────────────────────────────────────
  ('ulyah', 'umrah', 'Umroh Reguler 9 Hari', 'Contoh Travel Amanah', 'Paket umroh hemat bimbingan ustadz berpengalaman, hotel dekat Masjidil Haram dan Masjid Nabawi.', 'Rp 28.500.000', '9 hari', 'Jakarta · Sepanjang tahun', 'Terlaris', '["Hotel ⭐⭐⭐⭐ dekat Haram","Bimbingan manasik lengkap","Tiket pesawat PP + visa","Muthawwif berbahasa Indonesia"]', 'mailto:info@ulyah.com', 1),
  ('ulyah', 'umrah', 'Umroh Plus Turki 12 Hari', 'Contoh Travel Amanah', 'Umroh dilengkapi ziarah sejarah Islam di Istanbul dan Bursa.', 'Rp 39.900.000', '12 hari', 'Jakarta · Musim liburan', NULL, '["Ziarah Istanbul & Bursa","Hotel ⭐⭐⭐⭐⭐","Semua transportasi darat","Makan 3x sehari"]', 'mailto:info@ulyah.com', 2),
  ('ulyah', 'hajj', 'Haji Khusus (ONH Plus)', 'Contoh Travel Amanah', 'Haji dengan kuota khusus, masa tunggu lebih singkat, layanan premium.', 'Mulai USD 12.500', '± 25 hari', 'Jakarta · Musim haji', 'Kuota Terbatas', '["Tenda Arafah-Mina ber-AC","Hotel bintang 5","Katering Indonesia","Pembimbing ibadah berpengalaman"]', 'mailto:info@ulyah.com', 3),
  -- ── tilawa.de (German) ─────────────────────────────────────────────────
  ('tilawa', 'umrah', 'Umrah Kompakt · 9 Tage', 'Beispiel-Reiseveranstalter', 'Günstige Umrah mit deutschsprachiger Begleitung, Hotels in Gehweite zur Heiligen Moschee.', '€1.890', '9 Tage', 'Frankfurt · ganzjährig', 'Beliebt', '["Hotel ⭐⭐⭐⭐ nahe Haram","Deutschsprachige Begleitung","Flug + Visum inklusive","Vollständige Manasik-Anleitung"]', 'mailto:salam@tilawa.de', 1),
  ('tilawa', 'umrah', 'Umrah & Medina · 12 Tage', 'Beispiel-Reiseveranstalter', 'Ausführliche Reise mit längerem Aufenthalt in Medina und Ziyarat der historischen Stätten.', '€2.490', '12 Tage', 'München · Schulferien', NULL, '["5 Nächte in Medina","Hotel ⭐⭐⭐⭐⭐","Ziyarat mit Reiseleiter","Halal-Vollpension"]', 'mailto:salam@tilawa.de', 2),
  ('tilawa', 'hajj', 'Hadsch 2026 · Premium', 'Beispiel-Reiseveranstalter', 'Hadsch mit klimatisierten Zelten in Mina und Arafat und deutschsprachiger religiöser Betreuung.', 'ab €9.800', 'ca. 24 Tage', 'Frankfurt · Hadsch-Saison', 'Begrenzte Plätze', '["Klimatisierte Zelte Arafat-Mina","5-Sterne-Hotels","Religiöse Betreuung auf Deutsch","Vollpension"]', 'mailto:salam@tilawa.de', 3),
  -- ── 1fr.fr (French) ────────────────────────────────────────────────────
  ('1fr', 'umrah', 'Omra Essentielle · 9 jours', 'Exemple d''agence', 'Omra économique avec accompagnement francophone, hôtels à quelques pas de la Mosquée sacrée.', '1 890 €', '9 jours', 'Paris · toute l''année', 'Populaire', '["Hôtel ⭐⭐⭐⭐ proche du Haram","Accompagnement francophone","Vol + visa inclus","Guide complet du manassik"]', 'mailto:salam@1fr.fr', 1),
  ('1fr', 'umrah', 'Omra & Médine · 12 jours', 'Exemple d''agence', 'Séjour prolongé à Médine avec ziyarat des lieux historiques de l''islam.', '2 490 €', '12 jours', 'Lyon · vacances scolaires', NULL, '["5 nuits à Médine","Hôtel ⭐⭐⭐⭐⭐","Ziyarat avec guide","Pension complète halal"]', 'mailto:salam@1fr.fr', 2),
  ('1fr', 'hajj', 'Hajj 2026 · Premium', 'Exemple d''agence', 'Hajj avec tentes climatisées à Mina et Arafat et encadrement religieux francophone.', 'à partir de 9 800 €', '± 24 jours', 'Paris · saison du Hajj', 'Places limitées', '["Tentes climatisées Arafat-Mina","Hôtels 5 étoiles","Encadrement religieux francophone","Pension complète"]', 'mailto:salam@1fr.fr', 3);
