export interface Env {
  /** R2 privat: semua dokumen situs (pengaturan, lembaga, kabar, pustaka, akun …). Tidak pernah D1. */
  DATA: R2Bucket;
  /** R2 berkas unggahan (foto, sampul, PDF). Dilayani lewat /f/… atau MEDIA_BASE bila domain media terpasang. */
  MEDIA: R2Bucket;
  /** R2 privat: cadangan harian, 35 hari. */
  BACKUPS?: R2Bucket;
  /** KV hanya untuk penghitung batas laju singkat — data tahan lama tidak pernah di KV. */
  RL?: KVNamespace;
  ASSETS: Fetcher;
  /** Domain kanonik setelah zona terpasang. Kosong = workers.dev (noindex). */
  CANONICAL_HOST?: string;
  /** Alamat publik bucket media (mis. https://media.yapida.sch.id). Kosong = dilayani Worker di /f/. */
  MEDIA_BASE?: string;
  /** Rahasia tanda tangan sesi (secret Worker). */
  SESSION_SECRET?: string;
  /** E-mail & sandi awal super admin (secret Worker, opsional). */
  OWNER_BOOTSTRAP_EMAIL?: string;
  OWNER_BOOTSTRAP_PASSWORD?: string;
  /** Hanya uji lokal: pengganti alamat YouTube/TikTok. */
  YT_BASE?: string;
}
