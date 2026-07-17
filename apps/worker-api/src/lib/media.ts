import type { Env } from "../env.js";

// CRUD-able admin-uploaded images (founder photos on /syukur, to start).
// Deliberately NOT hardcoded into the repo as static assets — the admin
// portal can upload/replace them any time without a redeploy. Public,
// non-secret: served straight from R2 through GET /content/media/:key.
export const MANAGED_MEDIA: { key: string; label: string }[] = [
  { key: "founder_yusron_photo", label: "Foto Yusron Efendi" },
  { key: "founder_ulyah_photo", label: "Foto Ulyah Munayah" },
];

export interface MediaStatus {
  key: string;
  label: string;
  set: boolean;
  updatedAt: string | null;
}

export async function listMediaStatus(env: Env): Promise<MediaStatus[]> {
  const { results } = await env.DB.prepare("SELECT key, updated_at FROM site_media").all<{
    key: string;
    updated_at: string;
  }>();
  const byKey = new Map(results.map((r) => [r.key, r.updated_at]));
  return MANAGED_MEDIA.map((m) => ({ key: m.key, label: m.label, set: byKey.has(m.key), updatedAt: byKey.get(m.key) ?? null }));
}
