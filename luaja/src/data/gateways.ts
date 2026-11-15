/**
 * Ringkasan cara bayar untuk satu mata uang: gerbang otomatis (PayPal, Stripe, Xendit, Midtrans) yang siap + metode manual yang tayang.
 * Dipakai halaman paket (mata uang tanpa cara bayar tidak ditawarkan), halaman tagihan dan invoice.
 */
import type { Store } from '../lib/store.ts';
import type { Env } from '../env.ts';
import { getPayment } from './settings.ts';
import { getPaypalConfig, paypalReady, PAYPAL_CURRENCIES, type PaypalConfig } from './paypal.ts';
import { GATEWAYS, GW_META, getAllGw, gwServes, type GwConfig, type GwId } from './gw.ts';
import { CURRENCIES, methodsFor, type Currency, type Payment, type PayMethod } from './model.ts';

export interface PayOptions {
  payment: Payment;
  paypal: PaypalConfig;
  gw: Record<GwId, GwConfig>;
  /** Per mata uang: otomatis yang siap + metode manual yang tayang. */
  by: Record<Currency, { paypal: boolean; gw: GwId[]; manual: PayMethod[] }>;
}

export async function payOptions(store: Store, env: Env): Promise<PayOptions> {
  const [payment, paypal, gw] = await Promise.all([getPayment(store), getPaypalConfig(store), getAllGw(store)]);
  const keyed = Boolean(env.MASTER_KEY);
  const by = Object.fromEntries(CURRENCIES.map((cur) => [cur, {
    paypal: keyed && paypalReady(paypal) && PAYPAL_CURRENCIES.includes(cur),
    gw: keyed ? GATEWAYS.filter((g) => gwServes(gw[g], cur)) : [],
    manual: methodsFor(payment, cur),
  }])) as PayOptions['by'];
  return { payment, paypal, gw, by };
}

export const hasAnyWay = (o: PayOptions, cur: Currency) => o.by[cur].paypal || o.by[cur].gw.length > 0 || o.by[cur].manual.length > 0;

/** Kalimat singkat cara bayar untuk pilihan mata uang di halaman paket. */
export function waysLabel(o: PayOptions, cur: Currency): string {
  const b = o.by[cur];
  const auto = [b.paypal ? 'PayPal' : '', ...b.gw.map((g) => GW_META[g].name)].filter(Boolean);
  const manual = [...new Set(b.manual.map((m) => m.name.replace(/\s*\((IDR|USD|JPY)\)$/, '')))];
  return [auto.length ? `${auto.join(' / ')} otomatis` : '', manual.length ? `transfer ${manual.join(' / ')}` : ''].filter(Boolean).join(' atau ');
}
