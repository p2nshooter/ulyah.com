/**
 * Kartu paket bersama (beranda, Harga, portal → Token): harga Rupiah & USD (kurs harian), token yang didapat, perkiraan
 * halaman per mesin, dan mesin yang terbuka (MASTER-BLUEPRINT §28.3). Nama mesin hanya nama publik.
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { tr, fmtNum, type Lang } from '../lib/i18n.ts';
import type { BillingSettings, EngineSettings, TokenPackage } from '../data/settings.ts';
import { packagePrice, predictByMode, PUBLIC_NAME, type Mode } from '../engine/pricing.ts';
import { ENGINE_MIN_TIER, ENTERPRISE_RECOMMENDED, clampTier } from '../data/tiers.ts';
import { bi } from '../engine/rubrics.ts';

const ENGINE_ORDER: Mode[] = ['haiku', 'sonnet', 'opus', 'fable'];

export const usdText = (L: Lang, v: number) => `US$${fmtNum(L, v, Number.isInteger(v) ? 0 : 2)}`;

export function planCard(
  L: Lang,
  p: TokenPackage,
  b: BillingSettings,
  eng: EngineSettings,
  o: { usdFirst?: boolean; featured?: boolean; ribbon?: string; actions?: Raw; avail?: Partial<Record<Mode, boolean>> } = {},
): Raw {
  const pp = packagePrice(p, b, eng);
  const tier = clampTier(p.tier);
  const unlocked = ENGINE_ORDER.filter((m) => tier >= ENGINE_MIN_TIER[m]);
  const pages = new Map(predictByMode(pp.tokens, b, eng).map((x) => [x.mode, x.pages]));
  const idr = `Rp ${fmtNum(L, pp.idr)}`;
  const usd = usdText(L, pp.usd);
  const enterprise = tier >= 5;
  return html`<article class="plan reveal ${o.featured ? 'featured' : ''} ${enterprise ? 'enterprise' : ''}" data-plan="${p.key}" data-tier="${tier}">
    ${o.ribbon ? html`<span class="ribbon">${o.ribbon}</span>` : enterprise ? html`<span class="ribbon ribbon-ent">${tr(L, 'Semua mesin', 'All engines')}</span>` : ''}
    <h3>${bi(L, p.name)}</h3>
    <p class="price">${o.usdFirst ? usd : idr}</p><p class="price-alt">${o.usdFirst ? idr : usd}</p>
    ${p.discountPct > 0 ? html`<p class="pill p-hum">${p.targetIdr ? tr(L, `bonus token ${p.discountPct}%`, `${p.discountPct}% bonus tokens`) : tr(L, `hemat ${p.discountPct}%`, `save ${p.discountPct}%`)}</p>` : ''}
    <p class="plan-tokens"><b data-plan-tokens>${fmtNum(L, pp.tokens)}</b> ${tr(L, 'token didapat', 'tokens you get')}</p>
    <ul class="plan-pages" aria-label="${tr(L, 'Perkiraan halaman yang bisa diperiksa', 'Estimated pages you can check')}">
      ${unlocked.map((m) => {
        const pg = pages.get(m);
        return html`<li class="${enterprise && ENTERPRISE_RECOMMENDED.includes(m) ? 'rec' : ''}"><span>${PUBLIC_NAME[m]}${o.avail && o.avail[m] === false ? html` <em class="soon-tag">${m === 'fable' ? tr(L, 'segera hadir', 'coming soon') : tr(L, 'nonaktif', 'off')}</em>` : ''}</span><b>${pg ? `${fmtNum(L, pg.low)}–${fmtNum(L, pg.high)}` : '—'}</b> <small>${tr(L, 'hal.', 'pp.')}</small></li>`;
      })}
    </ul>
    <p class="plan-engines">${tr(L, 'Mesin terbuka:', 'Engines unlocked:')} <b>Smart Auto</b>${unlocked.map((m) => raw(` · ${PUBLIC_NAME[m]}`))}${tier >= ENGINE_MIN_TIER.forensic ? raw(' · Forensic Panel') : ''}</p>
    ${enterprise ? html`<p class="plan-rec">✦ ${tr(L, 'Disarankan: Expert & Elite untuk hasil paling memuaskan — mesin yang lebih hemat tetap bisa dipilih.', 'Recommended: Expert & Elite for the most satisfying results — cheaper engines remain available.')}</p>` : ''}
    <p class="muted">${bi(L, p.note)}</p>
    ${o.actions ?? ''}
  </article>`;
}

export function plansNote(L: Lang, b: BillingSettings): Raw {
  return html`<p class="muted small reveal">* ${tr(L, `Perkiraan, bukan janji: ±${b.wordsPerPage} kata per halaman dengan rubrik; pemakaian nyata tergantung mesin yang terpakai dan tingkat kesulitan naskah. Harga USD mengikuti kurs harian.`, `An estimate, not a promise: ±${b.wordsPerPage} words per page with a rubric; real usage depends on the engines used and the text’s difficulty. USD prices follow the daily exchange rate.`)}</p>`;
}
