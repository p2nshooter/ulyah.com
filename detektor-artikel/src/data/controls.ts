/**
 * Kendali biaya (docs/MASTER-BLUEPRINT.md §8.3–§8.4, §9.5; file pemilik „Xscan“ §6): tombol darurat, router, model yang
 * dimatikan, batas belanja per pemeriksaan dan per member per hari. Satu dokumen `k/controls.json`, dibaca setiap
 * permintaan (tanpa cache), diubah hanya di Admin → Kendali biaya, setiap perubahan masuk audit log.
 */
import type { Store } from '../lib/store.ts';
import { CAPABILITY } from '../engine/router.ts';

export interface Controls {
  /** Tombol darurat: tidak ada panggilan AI baru; pemeriksaan yang berjalan dihentikan dan seluruh pesanannya kembali. */
  emergencyStop: boolean;
  stopNote: string;
  /** auto = termurah yang mampu per tingkat (bawaan, sesuai file pemilik); manual = pilihan Admin → Mesin. */
  router: 'auto' | 'manual';
  disabledModels: string[];
  /** Member boleh memilih Claude Fable 5.1 (dengan konfirmasi „Anda yakin?“). */
  fableEnabled: boolean;
  /** Router boleh memakai Fable sebagai pengganti bila Sonnet/Opus dimatikan (bawaan mati — biayanya tertinggi). */
  fableInRouter: boolean;
  /** Maks. token yang boleh dipesan satu pemeriksaan (0 = tanpa batas). */
  maxTokensPerCheck: number;
  /** Maks. token yang boleh dipesan satu member per hari WIB (0 = tanpa batas). Admin tidak dibatasi. */
  memberDailyTokens: number;
  updatedAt?: number;
  updatedBy?: string;
}

export const DEFAULT_CONTROLS: Controls = {
  emergencyStop: false,
  stopNote: '',
  router: 'auto',
  disabledModels: [],
  // Pemilik, 8 Nov 2026: „Fable 5 udah d pasang belum“ — tersedia bawaan, admin bisa mematikannya.
  fableEnabled: true,
  fableInRouter: false,
  maxTokensPerCheck: 0,
  memberDailyTokens: 0,
};

export const CONTROLS_DOC = 'k/controls.json';

export function normalizeControls(s: Partial<Controls> | null | undefined): Controls {
  const b = { ...DEFAULT_CONTROLS, ...(s ?? {}) };
  const int = (v: unknown, hi: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(hi, Math.max(0, n)) : 0;
  };
  return {
    emergencyStop: b.emergencyStop === true,
    stopNote: String(b.stopNote ?? '').slice(0, 300),
    router: b.router === 'manual' ? 'manual' : 'auto',
    // Hanya model yang dikenal router; Haiku tidak bisa dimatikan sendirian (Cek Gratis dan tingkat 1 butuh satu model
    // tingkat 1) — untuk menghentikan semuanya pakai tombol darurat.
    disabledModels: [...new Set((Array.isArray(b.disabledModels) ? b.disabledModels : []).filter((m) => m in CAPABILITY && m !== 'claude-haiku-5-5'))],
    fableEnabled: b.fableEnabled !== false,
    fableInRouter: b.fableInRouter === true,
    maxTokensPerCheck: int(b.maxTokensPerCheck, 10_000_000),
    memberDailyTokens: int(b.memberDailyTokens, 100_000_000),
    updatedAt: b.updatedAt,
    updatedBy: b.updatedBy,
  };
}

export async function getControls(store: Store): Promise<Controls> {
  return normalizeControls(await store.get<Partial<Controls>>(CONTROLS_DOC));
}

/** Token yang dipesan member hari ini (WIB) — satu dokumen per member per hari, diubah dengan CAS. */
export const memberDayKey = (uid: string, date: string) => `u/member-day/${date}/${uid}.json`;

export class SpendLimitError extends Error {
  constructor(public used: number, public limit: number) {
    super('member daily limit');
  }
}

/** Menambah pesanan hari ini bila masih di bawah batas; melempar SpendLimitError bila akan melewatinya. */
export async function addMemberDay(store: Store, uid: string, date: string, tokens: number, limit: number): Promise<void> {
  if (limit <= 0 || tokens <= 0) return;
  let over: { used: number } | null = null;
  await store.cas<{ tokens: number }>(memberDayKey(uid, date), (cur) => {
    const used = cur?.tokens ?? 0;
    if (used + tokens > limit) {
      over = { used };
      return null;
    }
    return { tokens: used + tokens };
  });
  if (over) throw new SpendLimitError((over as { used: number }).used, limit);
}

/**
 * Mesin yang boleh dipilih member saat ini (pemilik, 8 Nov 2026: „engine bisa di on/off di portal admin, misal fable 5 di
 * off mana seluruh website ini fable 5 di tandai comming soon atau off“). Satu sumber untuk formulir, halaman harga,
 * panduan, dan penolakan di server. Haiku selalu aktif (Cek Gratis dan tingkat 1 memakainya).
 */
export interface EngineAvailability { haiku: boolean; sonnet: boolean; opus: boolean; fable: boolean; forensic: boolean }
export function engineAvailability(c: Controls): EngineAvailability {
  const sonnet = !c.disabledModels.includes('claude-sonnet-5-5');
  const opus = !c.disabledModels.includes('claude-opus-5-5');
  return { haiku: true, sonnet, opus, fable: c.fableEnabled && !c.disabledModels.includes('claude-fable-5-1'), forensic: sonnet && opus };
}
