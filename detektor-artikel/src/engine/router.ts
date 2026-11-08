/**
 * Smart AI Engine Router (docs/MASTER-BLUEPRINT.md §8; file pemilik „Xscan“ §6 dan „Master_xscan“ bagian router).
 *
 * Aturan: untuk setiap tingkat, pakai model TERMURAH yang kemampuannya cukup, menurut harga yang tersimpan di
 * Admin → Mesin (bukan daftar tetap). Model yang dimatikan admin tidak pernah dipanggil. Fable 5.1 (lebih mahal dari
 * Opus, retensi 30 hari) hanya dipakai bila pemilik menyalakannya, dan tidak untuk naskah rahasia.
 */
import type { EngineSettings } from '../data/settings.ts';
import type { Controls } from '../data/controls.ts';

/** Kemampuan: 1 = sederhana, 2 = menengah, 3 = kompleks, 4 = banding. Hanya model generasi aktif yang dirutekan. */
export const CAPABILITY: Record<string, number> = {
  'claude-haiku-5-5': 1,
  'claude-sonnet-5-5': 2,
  'claude-opus-5-5': 3,
  'claude-fable-5-1': 4,
};
export const FABLE = 'claude-fable-5-1';
export const TIER_NEED = { t1: 1, t2: 2, t3: 3 } as const;
export type Tier = keyof typeof TIER_NEED;

/** Biaya pembanding per 1 juta token dengan bentuk pemakaian khas (3 token masuk : 1 token keluar). */
export const blended = (eng: EngineSettings, model: string) => {
  const p = eng.prices[model];
  return p ? 3 * p.in + p.out : Number.POSITIVE_INFINITY;
};

export function usable(model: string, c: Controls, confidential = false): boolean {
  if (c.disabledModels.includes(model)) return false;
  if (model === FABLE && (!c.fableInRouter || confidential)) return false;
  return true;
}

/** Model termurah yang aktif dan mampu `need`. null bila tidak ada (pemanggil menolak tanpa memanggil API). */
export function cheapestCapable(eng: EngineSettings, c: Controls, need: number, confidential = false): string | null {
  const cands = Object.keys(CAPABILITY)
    .filter((m) => CAPABILITY[m]! >= need && eng.prices[m] && usable(m, c, confidential))
    .sort((a, b) => blended(eng, a) - blended(eng, b) || CAPABILITY[a]! - CAPABILITY[b]!);
  return cands[0] ?? null;
}

export interface RouteNote {
  tier: Tier;
  configured: string;
  used: string;
  reason: 'configured' | 'cheaper' | 'disabled';
}

/**
 * Pengaturan mesin setelah router: `auto` memilih termurah yang mampu per tingkat; `manual` memakai pilihan admin,
 * kecuali model itu dimatikan (diganti termurah yang mampu). Tidak ada model aktif yang mampu → `blocked`.
 */
export function applyRouter(eng: EngineSettings, c: Controls): { eng: EngineSettings; notes: RouteNote[]; blocked: Tier[] } {
  const notes: RouteNote[] = [];
  const blocked: Tier[] = [];
  const models = { ...eng.models };
  for (const tier of Object.keys(TIER_NEED) as Tier[]) {
    const configured = eng.models[tier];
    const need = Math.max(TIER_NEED[tier], CAPABILITY[configured] ?? TIER_NEED[tier]);
    const okConfigured = usable(configured, c) && Boolean(eng.prices[configured]);
    let used = configured;
    let reason: RouteNote['reason'] = 'configured';
    if (c.router === 'auto' || !okConfigured) {
      const pick = cheapestCapable(eng, c, c.router === 'auto' ? TIER_NEED[tier] : need);
      if (!pick) {
        blocked.push(tier);
        continue;
      }
      if (pick !== configured) {
        used = pick;
        reason = okConfigured ? 'cheaper' : 'disabled';
      }
    }
    models[tier] = used;
    notes.push({ tier, configured, used, reason });
  }
  return { eng: { ...eng, models }, notes, blocked };
}
