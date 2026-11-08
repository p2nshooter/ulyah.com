export interface Env {
  /** R2 privat: seluruh data aplikasi (detektor-data). */
  DATA: R2Bucket;
  /** R2 privat: backup harian, disimpan 35 hari (detektor-backups). */
  BACKUPS?: R2Bucket;
  /** KV hanya untuk penghitung batas laju (bukan data tahan lama). */
  RL?: KVNamespace;
  ASSETS: Fetcher;
  /** Rahasia Worker — dibuat workflow deploy, tidak pernah di repo. */
  MASTER_KEY?: string;
  SESSION_SECRET?: string;
  OWNER_BOOTSTRAP_EMAIL?: string;
  OWNER_BOOTSTRAP_PASSWORD?: string;
  /** Hanya untuk uji lokal (server tiruan); tidak dipasang di produksi. */
  ANTHROPIC_BASE_URL?: string;
  /** Kredensial PayPal awal (JSON {mode, clientId, secret}) dari alur kerja paypal-seed.yml — ditanam sekali ke R2 terenkripsi. */
  PAYPAL_SEED?: string;
  /** Hanya uji lokal: server PayPal / kurs tiruan. */
  PAYPAL_BASE_URL?: string;
  FX_URLS?: string;
  /** Domain kanonik setelah domain sendiri dipasang (mis. domain yang dibeli). Kosong = workers.dev, noindex. */
  CANONICAL_HOST?: string;
}
