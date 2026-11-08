/** Angka panduan dibaca dari Admin saat halaman dibuka (kuota gratis, harga 1 token, komisi afiliasi, masa simpan). */
import type { Store } from '../lib/store.ts';
import { getFree, getBilling, getEngine } from '../data/settings.ts';
import { tokenPriceIdr } from '../engine/pricing.ts';
import { getAffiliateSettings } from '../data/affiliate.ts';
import { PURGE_DAYS } from '../data/policy.ts';
import type { GuideValues } from './guide.ts';

const TZ: Record<string, readonly [string, string]> = {
  'Asia/Jakarta': ['waktu Indonesia bagian barat', 'Western Indonesia Time'],
  'Europe/Madrid': ['waktu Madrid', 'Madrid time'],
};

export async function guideValues(store: Store): Promise<GuideValues> {
  const [f, b, eng, aff] = await Promise.all([getFree(store), getBilling(store), getEngine(store), getAffiliateSettings(store)]);
  return {
    freeOn: f.enabled,
    freePages: f.pages,
    freePeriod: f.period,
    wordsPerPage: f.wordsPerPage,
    maxPerCheck: f.maxPerCheck,
    tokenIdr: Math.ceil(tokenPriceIdr(b, eng)),
    affPct: aff.enabled ? aff.ratePct : null,
    purgeDays: PURGE_DAYS,
    tz: TZ[f.resetTz] ?? [f.resetTz, f.resetTz],
  };
}
