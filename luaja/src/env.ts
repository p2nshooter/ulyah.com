export interface Env {
  /** R2 privat: semua dokumen (pengaturan, akun, tagihan, bukti bayar, progres, kurikulum, pustaka, kosakata). Tidak pernah D1. */
  DATA: R2Bucket;
  /** R2 publik-lewat-Worker: sampul buku, aset yang boleh dilihat semua orang. */
  MEDIA: R2Bucket;
  /** R2 privat: cadangan harian, 35 hari. */
  BACKUPS?: R2Bucket;
  /** KV hanya untuk penghitung batas laju singkat — data tahan lama tidak pernah di KV. */
  RL?: KVNamespace;
  /** Workers AI untuk terjemahan mesin (opsional). */
  AI?: { run(model: string, input: Record<string, unknown>): Promise<unknown> };
  ASSETS: Fetcher;
  /** Domain kanonik setelah zona terpasang. Kosong = workers.dev (noindex). */
  CANONICAL_HOST?: string;
  /** Alamat publik bucket media bila domain media terpasang; kosong = dilayani Worker di /f/. */
  MEDIA_BASE?: string;
  /** Rahasia tanda tangan sesi (secret Worker, dibuat sekali oleh deploy). */
  SESSION_SECRET?: string;
  /** Token untuk POST /api/ops/tick (workflow GitHub). */
  OPS_TOKEN?: string;
  /** E-mail & sandi awal pemilik (secret Worker, opsional; pola yang sama dengan xscan.es). */
  OWNER_BOOTSTRAP_EMAIL?: string;
  OWNER_BOOTSTRAP_PASSWORD?: string;
}
