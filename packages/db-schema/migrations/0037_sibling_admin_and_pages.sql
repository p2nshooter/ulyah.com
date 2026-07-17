-- Sibling admin roles + demo logins + per-tenant dynamic page visibility.
-- Supports the owner's request: each sibling (1fr.fr, tilawa.de) gets a REAL
-- admin login and a read-only DEMO login, and every page can be shown/hidden
-- and renamed from the admin portal (nothing hardcoded).

-- admin_users gains a role and an optional tenant scope.
--   role  : 'owner' | 'admin' | 'demo'   (demo = read-only, enforced at the API)
--   tenant: NULL = ulyah / global; '1fr' | 'tilawa' scope a sibling admin.
-- A sibling account (tenant set) skips the TOTP second factor so the owner can
-- hand over plain credentials; the ulyah owner account (tenant NULL) keeps it.
ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE admin_users ADD COLUMN tenant TEXT;

-- Per-tenant page catalogue. A row's ABSENCE means "visible, built-in label";
-- the admin portal inserts/updates rows only to hide or rename a page. The
-- (tenant, path) pair is unique. path is the locale-less route, e.g. "/kisah".
CREATE TABLE IF NOT EXISTS tenant_pages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant       TEXT NOT NULL,
  path         TEXT NOT NULL,
  visible      INTEGER NOT NULL DEFAULT 1,
  custom_label TEXT,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant, path)
);
CREATE INDEX IF NOT EXISTS idx_tenant_pages_tenant ON tenant_pages(tenant);

-- Seed the sibling admin + demo accounts (owner asked for real admin + demo
-- logins for each site). Passwords are PBKDF2-SHA256/100k hashes matching the
-- Worker's verifyPassword; the plaintext is delivered to the owner out-of-band.
-- Sibling admins can rotate their own password from the portal; demo accounts
-- are read-only (enforced at the API) and cannot. INSERT OR IGNORE keeps this
-- safe if an account already exists.
INSERT OR IGNORE INTO admin_users (email, password_hash, role, tenant) VALUES
  ('admin@1fr.fr', 'pbkdf2$100000$H2n3mJemgIfaIfdsbGfITA==$n4w+ttMNqRq2+0va1iHT+jATRAm4RlSDVj8bdgdVYVg=', 'admin', '1fr'),
  ('demo@1fr.fr', 'pbkdf2$100000$1VVDsFQm8MULRLX7aIBi2g==$uTr3erD13eXXS/rbpBGLfX9Vob48ZQnxFXwFu/wu7m4=', 'demo', '1fr'),
  ('admin@tilawa.de', 'pbkdf2$100000$jJhyUxNLEqpY2IUHjZPG/g==$iRWWn7mtglyJRY5F3jYixINvKA0TeBZ2HhMLbAi6KUo=', 'admin', 'tilawa'),
  ('demo@tilawa.de', 'pbkdf2$100000$/e7cJAhP2gvlrKJl8p9pfw==$ex5dC85mzbLEQFsCGaVaW5Qes0eS5lJJ1ZXZbuVtf3s=', 'demo', 'tilawa');
