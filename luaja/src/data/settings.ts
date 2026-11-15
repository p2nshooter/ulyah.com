/** Pengaturan & konten situs dari R2 (semua teks publik dinamis dari admin), dengan bawaan di model.ts. */
import type { Store } from '../lib/store.ts';
import { DEFAULT_PAYMENT, DEFAULT_PRICING, DEFAULT_SITE, type Payment, type Pricing, type SiteContent } from './model.ts';

export const SITE_DOC = 'k/site.json';
export const PRICING_DOC = 'k/pricing.json';
export const PAYMENT_DOC = 'k/payment.json';

function merge<T extends object>(base: T, over: Partial<T> | null): T {
  if (!over) return structuredClone(base);
  const out = structuredClone(base) as Record<string, unknown>;
  for (const [k, v] of Object.entries(over)) {
    const cur = out[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && cur && typeof cur === 'object' && !Array.isArray(cur)) out[k] = merge(cur as object, v as object);
    else if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export async function getSite(store: Store): Promise<SiteContent> {
  return merge(DEFAULT_SITE, await store.get<Partial<SiteContent>>(SITE_DOC));
}

export async function getPricing(store: Store): Promise<Pricing> {
  return merge(DEFAULT_PRICING, await store.get<Partial<Pricing>>(PRICING_DOC));
}

export async function getPayment(store: Store): Promise<Payment> {
  return merge(DEFAULT_PAYMENT, await store.get<Partial<Payment>>(PAYMENT_DOC));
}

export async function saveDoc<T>(store: Store, key: string, value: T): Promise<void> {
  await store.put(key, { ...(value as object), updatedAt: Date.now() });
}
