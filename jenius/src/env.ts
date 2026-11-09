export interface Env {
  /** R2 privat: katalog, isi buku, gambar buku bergambar, akun, kelas (jenius-data). Tidak pernah D1. */
  DATA: R2Bucket;
  /** R2 privat: cadangan harian 35 hari (jenius-backups). */
  BACKUPS?: R2Bucket;
  /** KV hanya untuk penghitung batas laju singkat (jenius-rl) — data tahan lama tidak pernah di KV. */
  RL?: KVNamespace;
  ASSETS: Fetcher;
  /** Domain kanonik setelah domain sendiri terpasang. Kosong = workers.dev (noindex). */
  CANONICAL_HOST?: string;
  /** Kunci induk (secret Worker): menyegel kunci API & data rahasia di R2. */
  MASTER_KEY?: string;
  /** Rahasia tanda tangan sesi (secret Worker). */
  SESSION_SECRET?: string;
  /** E-mail & sandi awal super admin (secret Worker) — akun dibuat saat login pertama. */
  OWNER_BOOTSTRAP_EMAIL?: string;
  OWNER_BOOTSTRAP_PASSWORD?: string;
  /** Hanya uji lokal: sumber buku tiruan menggantikan raw.githubusercontent.com. */
  SOURCE_BASE?: string;
  /** Hanya uji lokal: daftar id sumber yang diimpor (dipisah koma) agar uji cepat. */
  IMPORT_ONLY?: string;
  /** Hanya uji lokal: server AI tiruan. */
  ANTHROPIC_BASE_URL?: string;
}
