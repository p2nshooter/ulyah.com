/**
 * Mesin mengikuti pembelian (pemilik, 8 Nov 2026; MASTER-BLUEPRINT §28.3): „Engine aktif mengikuti pembelian, enterprice dan
 * super enterpeice aktif semua“.
 *
 * Tingkat member = paket tertinggi yang pernah lunas (isi deposit ≥ Rp10 jt = Enterprise, ≥ Rp20 jt = Super Enterprise),
 * dicatat di dokumen member (`tier`) saat pesanan lunas; admin bisa mengubahnya (`tierOverride`). Akun admin: semua mesin.
 * Setiap orang yang punya token minimal Starter (Essential + Smart Auto); Cek Gratis tetap untuk semua.
 */
import type { Store } from '../lib/store.ts';
import type { Mode } from '../engine/pricing.ts';
import { isAdmin, userKey, type User } from './users.ts';

export type TierLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const TIERS: Record<TierLevel, { key: string; id: string; en: string }> = {
  1: { key: 'starter', id: 'Starter', en: 'Starter' },
  2: { key: 'reguler', id: 'Reguler', en: 'Regular' },
  3: { key: 'pro', id: 'Pro', en: 'Pro' },
  4: { key: 'lembaga', id: 'Lembaga', en: 'Institution' },
  5: { key: 'enterprise', id: 'Enterprise', en: 'Enterprise' },
  6: { key: 'super-enterprise', id: 'Super Enterprise', en: 'Super Enterprise' },
  7: { key: 'vvip', id: 'VVIP', en: 'VVIP' },
};

/** Total pembayaran (setara Rupiah) yang membuka tingkat tinggi (MASTER-BLUEPRINT §28.6). */
export function tierFromTotal(paidIdrEq: number): TierLevel {
  return paidIdrEq >= 100_000_000 ? 7 : paidIdrEq >= 20_000_000 ? 6 : paidIdrEq >= 10_000_000 ? 5 : 1;
}

/** VVIP: tanpa batas token harian per member dan 3× pemeriksaan bersamaan. */
export const isVvip = (t: TierLevel): boolean => t >= 7;

/** Paket minimum tiap mesin. Smart Auto ada di semua paket tetapi hanya naik sampai mesin yang terbuka. */
export const ENGINE_MIN_TIER: Record<Mode, TierLevel> = { auto: 1, haiku: 1, sonnet: 2, opus: 3, forensic: 3, fable: 5 };

/** Mesin yang disarankan untuk Enterprise ke atas (pemilik: „sarankan … opus 5.5 dan fable 5.1 untuk hasil yg memuaskan“). */
export const ENTERPRISE_RECOMMENDED: Mode[] = ['opus', 'fable'];

export const clampTier = (n: unknown): TierLevel => Math.min(7, Math.max(1, Math.round(Number(n) || 1))) as TierLevel;

/** Tingkat yang berlaku untuk member ini. */
export function tierOf(user: Pick<User, 'role' | 'tier' | 'tierOverride'> | null | undefined): TierLevel {
  if (!user) return 1;
  if (isAdmin(user as User)) return 7;
  if (user.tierOverride) return clampTier(user.tierOverride);
  return clampTier(user.tier ?? 1);
}

/** Sampai tingkat AI mana Smart Auto boleh naik: 1 = Essential saja, 2 = + Advanced, 3 = + Expert. */
export function autoCeiling(tier: TierLevel): 1 | 2 | 3 {
  return tier >= ENGINE_MIN_TIER.opus ? 3 : tier >= ENGINE_MIN_TIER.sonnet ? 2 : 1;
}

export const modeAllowed = (mode: Mode, tier: TierLevel): boolean => tier >= ENGINE_MIN_TIER[mode];

/** Tingkat dari satu pesanan lunas: paket → tingkatnya; isi deposit besar → Enterprise / Super Enterprise. */
export function tierFromOrder(o: { kind?: string; pkg: string; priceIdr: number }, packages: { key: string; tier?: number }[]): TierLevel {
  if (o.kind === 'deposit') return o.priceIdr >= 20_000_000 ? 6 : o.priceIdr >= 10_000_000 ? 5 : 1;
  return clampTier(packages.find((p) => p.key === o.pkg)?.tier ?? 1);
}

/** Naikkan tingkat member (tidak pernah turun karena pesanan baru). */
export async function raiseTier(store: Store, uid: string, tier: TierLevel): Promise<void> {
  await store.cas<User>(userKey(uid), (u) => (u && (u.tier ?? 1) < tier ? { ...u, tier } : null), 'Tingkat member');
}
