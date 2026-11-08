/** Angka panduan dibaca dari Admin saat halaman dibuka (kuota gratis, harga 1 token, komisi afiliasi, masa simpan). */
import type { Store } from '../lib/store.ts';
import { getFree, getBilling, getEngine } from '../data/settings.ts';
import { tokenPriceIdr, packagePrice } from '../engine/pricing.ts';
import { getControls, engineAvailability } from '../data/controls.ts';
import { getAffiliateSettings } from '../data/affiliate.ts';
import { PURGE_DAYS } from '../data/policy.ts';
import type { GuideValues } from './guide.ts';

const TZ: Record<string, readonly [string, string]> = {
  'Asia/Jakarta': ['waktu Indonesia bagian barat', 'Western Indonesia Time'],
  'Europe/Madrid': ['waktu Madrid', 'Madrid time'],
};

export async function guideValues(store: Store): Promise<GuideValues> {
  const [f, b, eng, aff, k] = await Promise.all([getFree(store), getBilling(store), getEngine(store), getAffiliateSettings(store), getControls(store)]);
  const av = engineAvailability(k);
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
    engines: { sonnet: av.sonnet, opus: av.opus, fable: av.fable },
    packages: b.packages.map((p) => ({ name: [p.name.id, p.name.en] as const, tokens: p.tokens, discountPct: p.discountPct, idr: packagePrice(p, b, eng).idr })),
  };
}
