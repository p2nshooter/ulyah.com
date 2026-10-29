/**
 * ulyah.com is for sale (owner, 28–29 Oct 2026; docs/ADSENSE-BLUEPRINT.md §17):
 * US$250,000, negotiable, offers from US$50,000, the price in the clearest place,
 * shown from the very top of the home page and a dedicated header menu, and the
 * 24-hour Makkah live link controlled from the admin portal.
 *
 * Storage is R2 only (CLAUDE.md "R2 only — never D1"), with the R2 Store rules of
 * docs/R2-DATA-BLUEPRINT.md §3:
 *   k/site-sale.json             the settings — compare-and-swap (etagMatches)
 *   c/sale-offers/<id>.json      one document per offer — create-once (etagDoesNotMatch *),
 *                                the id is derived from the offer so a double submit
 *                                never records it twice
 *   l/site-sale/<ts>-<rand>.json append-only log of every admin change
 * No hot key: offers and log entries are separate objects; only the settings
 * document is ever rewritten, by the admin.
 */

export interface SaleSettings {
  /** Shown on the site: home-page band, header menu, /acquisition. Default: shown. */
  visible: boolean;
  priceUsd: number;
  minOfferUsd: number;
  negotiable: boolean;
  /** Contact shown to buyers. */
  whatsapp: string;
  email: string;
  /** The 24-hour Makkah live (YouTube channel, live or video link). Empty = the Masjidil Haram channel of the /live hub. */
  makkahLiveUrl: string;
  updatedAt: string;
  updatedBy: string;
}

export const SALE_DEFAULTS: SaleSettings = {
  visible: true,
  priceUsd: 250_000,
  minOfferUsd: 50_000,
  negotiable: true,
  // The owner's number, already published on the /live page for "stream via ulyah".
  whatsapp: "+6285691234561",
  email: "salam@ulyah.com",
  makkahLiveUrl: "",
  updatedAt: "",
  updatedBy: "",
};

export type OfferStatus = "new" | "contacted" | "negotiating" | "declined" | "accepted";
export const OFFER_STATUSES: OfferStatus[] = ["new", "contacted", "negotiating", "declined", "accepted"];

export interface SaleOffer {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  country: string;
  amountUsd: number;
  message: string;
  status: OfferStatus;
  note: string;
  ipHash: string;
  createdAt: string;
  updatedAt: string;
}

/** The smallest structural slice of an R2 bucket this module needs (the Workers binding satisfies it; tests use a fake). */
export interface SaleBucket {
  get(key: string): Promise<{ etag: string; text(): Promise<string> } | null>;
  put(key: string, value: string, options?: { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string }; httpMetadata?: { contentType?: string } }): Promise<unknown | null>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{ objects: { key: string; uploaded: Date }[]; truncated: boolean; cursor?: string }>;
}

const SETTINGS_KEY = "k/site-sale.json";
const OFFER_PREFIX = "c/sale-offers/";
const LOG_PREFIX = "l/site-sale/";
const JSON_TYPE = { contentType: "application/json" };

/* ---- rules (pure) ------------------------------------------------------------ */

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").replace(/[ \t]+/g, " ").trim().slice(0, max);
/** Whole US dollars. A typed amount may use dots or commas as thousand separators ("250.000", "250,000"). */
const money = (v: unknown) => {
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : NaN;
  const digits = String(v ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : NaN;
};
export const isEmail = (v: string) => /^[^@\s]{1,64}@[^@\s]{1,190}\.[a-z]{2,}$/i.test(v);
const phone = (v: unknown) => clean(v, 24).replace(/[^\d+]/g, "");

/** Settings from any input: a missing or invalid value keeps the current one. */
export function sanitizeSettings(input: Partial<Record<keyof SaleSettings, unknown>>, base: SaleSettings = SALE_DEFAULTS): SaleSettings {
  const price = money(input.priceUsd);
  const min = money(input.minOfferUsd);
  const priceUsd = Number.isFinite(price) && price >= 1_000 && price <= 100_000_000 ? price : base.priceUsd;
  let minOfferUsd = Number.isFinite(min) && min >= 100 && min <= 100_000_000 ? min : base.minOfferUsd;
  if (minOfferUsd > priceUsd) minOfferUsd = priceUsd;   // a minimum above the asking price makes no sense
  const email = clean(input.email, 120).toLowerCase();
  const live = clean(input.makkahLiveUrl, 300);
  return {
    visible: typeof input.visible === "boolean" ? input.visible : base.visible,
    priceUsd,
    minOfferUsd,
    negotiable: typeof input.negotiable === "boolean" ? input.negotiable : base.negotiable,
    whatsapp: input.whatsapp === undefined ? base.whatsapp : phone(input.whatsapp),
    email: input.email === undefined ? base.email : isEmail(email) ? email : base.email,
    makkahLiveUrl: input.makkahLiveUrl === undefined ? base.makkahLiveUrl : !live || isYoutubeUrl(live) ? live : base.makkahLiveUrl,
    updatedAt: base.updatedAt,
    updatedBy: base.updatedBy,
  };
}

/** A YouTube channel, live, watch or short link — the only thing the live player can embed. */
export function isYoutubeUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && /(^|\.)youtube\.com$|^youtu\.be$/.test(u.hostname);
  } catch {
    return false;
  }
}

/** What a visitor may know: no internal fields. */
export function publicSettings(s: SaleSettings) {
  return { visible: s.visible, priceUsd: s.priceUsd, minOfferUsd: s.minOfferUsd, negotiable: s.negotiable, whatsapp: s.whatsapp, email: s.email, makkahLiveUrl: s.makkahLiveUrl };
}

export type OfferProblem = "hidden" | "name" | "email" | "amount" | "country";
export interface OfferInput { name?: unknown; email?: unknown; whatsapp?: unknown; company?: unknown; country?: unknown; amountUsd?: unknown; message?: unknown }

export function offerProblem(i: OfferInput, s: SaleSettings): OfferProblem | null {
  if (!s.visible) return "hidden";
  if (clean(i.name, 120).length < 2) return "name";
  if (!isEmail(clean(i.email, 254))) return "email";
  if (clean(i.country, 80).length < 2) return "country";
  const a = money(i.amountUsd);
  if (!Number.isFinite(a) || a < s.minOfferUsd || a > 100_000_000) return "amount";
  return null;
}

async function sha256Hex(s: string): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return [...h].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The offer document; its id comes from the day, the buyer and the amount, so a double submit is the same offer. */
export async function buildOffer(i: OfferInput, ip: string, nowMs = Date.now()): Promise<SaleOffer> {
  const at = new Date(nowMs).toISOString();
  const email = clean(i.email, 254).toLowerCase();
  const amountUsd = money(i.amountUsd);
  const message = String(i.message ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 3000);
  const digest = (await sha256Hex(`${at.slice(0, 10)}|${email}|${amountUsd}|${message}`)).slice(0, 16);
  return {
    id: `${at.slice(0, 10).replace(/-/g, "")}-${digest}`,
    name: clean(i.name, 120), email, whatsapp: phone(i.whatsapp), company: clean(i.company, 160), country: clean(i.country, 80),
    amountUsd, message, status: "new", note: "",
    ipHash: ip ? (await sha256Hex(`ulyah-sale|${ip}`)).slice(0, 20) : "",
    createdAt: at, updatedAt: at,
  };
}

/* ---- R2 ---------------------------------------------------------------------- */

async function readJson<T>(b: SaleBucket, key: string): Promise<{ value: T; etag: string } | null> {
  const o = await b.get(key);
  if (!o) return null;
  try {
    return { value: JSON.parse(await o.text()) as T, etag: o.etag };
  } catch {
    return null;
  }
}

export async function getSettings(b: SaleBucket | undefined): Promise<SaleSettings> {
  if (!b) return SALE_DEFAULTS;
  const r = await readJson<SaleSettings>(b, SETTINGS_KEY).catch(() => null);
  return r ? { ...sanitizeSettings(r.value), updatedAt: r.value.updatedAt || "", updatedBy: r.value.updatedBy || "" } : SALE_DEFAULTS;
}

/** Save the settings with compare-and-swap; a concurrent save is read again and re-applied. */
export async function saveSettings(b: SaleBucket, input: Partial<Record<keyof SaleSettings, unknown>>, by: string, nowMs = Date.now()): Promise<SaleSettings> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readJson<SaleSettings>(b, SETTINGS_KEY);
    const base = cur ? sanitizeSettings(cur.value) : SALE_DEFAULTS;
    const next: SaleSettings = { ...sanitizeSettings(input, base), updatedAt: new Date(nowMs).toISOString(), updatedBy: by };
    const ok = await b.put(SETTINGS_KEY, JSON.stringify(next), { onlyIf: cur ? { etagMatches: cur.etag } : { etagDoesNotMatch: "*" }, httpMetadata: JSON_TYPE });
    if (ok) {
      await appendLog(b, { action: "settings", by, changes: diff(base, next) }, nowMs);
      return next;
    }
  }
  throw new Error("The settings changed at the same moment — please try again.");
}

function diff(a: SaleSettings, b: SaleSettings): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(b) as (keyof SaleSettings)[]) if (k !== "updatedAt" && k !== "updatedBy" && a[k] !== b[k]) out[k] = b[k];
  return out;
}

/** Record an offer once. Answers `created: false` when the same offer was already recorded (a double submit). */
export async function recordOffer(b: SaleBucket, offer: SaleOffer): Promise<{ created: boolean }> {
  const ok = await b.put(`${OFFER_PREFIX}${offer.id}.json`, JSON.stringify(offer), { onlyIf: { etagDoesNotMatch: "*" }, httpMetadata: JSON_TYPE });
  return { created: !!ok };
}

/** Every offer, newest first (offers are few: one document each, read in full). */
export async function listOffers(b: SaleBucket, max = 500): Promise<SaleOffer[]> {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await b.list({ prefix: OFFER_PREFIX, cursor, limit: 1000 });
    keys.push(...page.objects.map((o) => o.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor && keys.length < max);
  const docs = await Promise.all(keys.slice(0, max).map((k) => readJson<SaleOffer>(b, k).then((r) => r?.value ?? null)));
  return docs.filter((d): d is SaleOffer => !!d).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

/** Move an offer to a status and/or note, compare-and-swap. */
export async function updateOffer(b: SaleBucket, id: string, patch: { status?: unknown; note?: unknown }, by: string, nowMs = Date.now()): Promise<SaleOffer | null> {
  if (!/^\d{8}-[0-9a-f]{16}$/.test(id)) return null;
  const key = `${OFFER_PREFIX}${id}.json`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readJson<SaleOffer>(b, key);
    if (!cur) return null;
    const status = OFFER_STATUSES.includes(patch.status as OfferStatus) ? (patch.status as OfferStatus) : cur.value.status;
    const note = patch.note === undefined ? cur.value.note : String(patch.note).slice(0, 1000);
    const next: SaleOffer = { ...cur.value, status, note, updatedAt: new Date(nowMs).toISOString() };
    if (await b.put(key, JSON.stringify(next), { onlyIf: { etagMatches: cur.etag }, httpMetadata: JSON_TYPE })) {
      await appendLog(b, { action: "offer", by, id, status, noteChanged: note !== cur.value.note }, nowMs);
      return next;
    }
  }
  throw new Error("The offer changed at the same moment — please try again.");
}

export async function appendLog(b: SaleBucket, entry: Record<string, unknown>, nowMs = Date.now()): Promise<void> {
  const rand = crypto.getRandomValues(new Uint8Array(4)).reduce((s, x) => s + x.toString(16).padStart(2, "0"), "");
  await b.put(`${LOG_PREFIX}${String(nowMs).padStart(15, "0")}-${rand}.json`, JSON.stringify({ ...entry, at: new Date(nowMs).toISOString() }), {
    onlyIf: { etagDoesNotMatch: "*" }, httpMetadata: JSON_TYPE,
  }).catch(() => undefined);
}

/** The latest admin changes, newest first. */
export async function recentLog(b: SaleBucket, max = 40): Promise<Record<string, unknown>[]> {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await b.list({ prefix: LOG_PREFIX, cursor, limit: 1000 });
    keys.push(...page.objects.map((o) => o.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor && keys.length < 5000);
  const latest = keys.sort().reverse().slice(0, max);
  const docs = await Promise.all(latest.map((k) => readJson<Record<string, unknown>>(b, k).then((r) => r?.value ?? null)));
  return docs.filter((d): d is Record<string, unknown> => !!d);
}
