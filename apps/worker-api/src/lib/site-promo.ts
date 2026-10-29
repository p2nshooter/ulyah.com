import { isYoutubeUrl, type SaleBucket } from "./site-sale.js";
import type { SiteId } from "./sites.js";

/**
 * Each site's own promotions (owner, 29 Oct 2026: "agar mandiri … mudah di gunakan
 * untuk promosi haji umroh, youtube anak, dan promo youtube"; docs/ADSENSE-BLUEPRINT.md §18).
 *
 * Until now the six YouTube slots of /live and the kids' YouTube channels were one
 * shared list for every site (D1). A site now keeps its own, in R2:
 *   k/promo/<site>/youtube.json   the six promo slots of its /live page
 *   k/promo/<site>/kids.json      its kids' YouTube channels
 *   l/promo/<site>/<ts>-<rand>.json   append-only log of every change
 * A site without its own document keeps showing the shared list, so nothing changes
 * for a visitor until that site's admin saves. Hajj & Umrah packages were already
 * per site. Writes are compare-and-swap (create-once for the first save); no hot key
 * — each document is written by that site's admin only.
 */

export const PROMO_SLOTS = 6;
export const MAX_KIDS_CHANNELS = 60;

export interface PromoSlot {
  slot: number;
  title: string;
  /** A YouTube channel, live, video or short link; empty = the slot is free (shows the "rent this slot" card). */
  url: string;
  /** Who the slot is shown for (a mosque, a channel, a travel agent). */
  sponsor: string;
  /** Shown as live on the site. */
  active: boolean;
}

export interface KidsChannel {
  channelId: string;
  title: string;
  country: string;
  language: string;
  visible: boolean;
}

export interface PromoDoc<T> { items: T[]; updatedAt: string; updatedBy: string }

type Kind = "youtube" | "kids";
const docKey = (site: SiteId, kind: Kind) => `k/promo/${site}/${kind}.json`;
const JSON_TYPE = { contentType: "application/json" };
const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

/** "https://www.youtube.com/channel/UC…" or a bare "UC…" id → the id; anything else → "". */
export function channelIdOf(v: unknown): string {
  const s = clean(v, 300);
  const m = s.match(/channel\/(UC[\w-]{10,40})/) ?? s.match(/^(UC[\w-]{10,40})$/);
  return m ? m[1]! : "";
}

/** Exactly six slots, numbered 1–6; a non-YouTube link is dropped, a slot without a link is never active. */
export function sanitizeSlots(input: unknown): PromoSlot[] {
  const list = Array.isArray(input) ? input : [];
  const bySlot = new Map<number, Record<string, unknown>>();
  list.forEach((raw, i) => {
    if (!raw || typeof raw !== "object") return;
    const r = raw as Record<string, unknown>;
    const n = Number(r.slot ?? i + 1);
    if (Number.isInteger(n) && n >= 1 && n <= PROMO_SLOTS && !bySlot.has(n)) bySlot.set(n, r);
  });
  return Array.from({ length: PROMO_SLOTS }, (_, i) => {
    const r = bySlot.get(i + 1) ?? {};
    const link = clean(r.url, 300);
    const url = link && isYoutubeUrl(link) ? link : "";
    return { slot: i + 1, title: clean(r.title, 120), url, sponsor: clean(r.sponsor, 120), active: !!url && r.active === true };
  });
}

/** Up to 60 channels, each a real UC… id once; title and country required. */
export function sanitizeKids(input: unknown): KidsChannel[] {
  const list = Array.isArray(input) ? input : [];
  const seen = new Set<string>();
  const out: KidsChannel[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const channelId = channelIdOf(r.channelId ?? r.url);
    const title = clean(r.title, 120);
    const country = clean(r.country, 40);
    if (!channelId || !title || !country || seen.has(channelId)) continue;
    seen.add(channelId);
    out.push({ channelId, title, country, language: clean(r.language, 20), visible: r.visible !== false });
    if (out.length >= MAX_KIDS_CHANNELS) break;
  }
  return out;
}

async function readDoc<T>(b: SaleBucket, site: SiteId, kind: Kind): Promise<{ doc: PromoDoc<T>; etag: string } | null> {
  const o = await b.get(docKey(site, kind));
  if (!o) return null;
  try {
    const d = JSON.parse(await o.text()) as Partial<PromoDoc<T>>;
    return { doc: { items: Array.isArray(d.items) ? d.items : [], updatedAt: String(d.updatedAt ?? ""), updatedBy: String(d.updatedBy ?? "") }, etag: o.etag };
  } catch {
    return null;
  }
}

const sanitize = { youtube: sanitizeSlots, kids: sanitizeKids } as const;

/** The site's own list, or null when it still shows the shared one. Read failures count as "no own list". */
export async function getYoutube(b: SaleBucket | undefined, site: SiteId): Promise<PromoDoc<PromoSlot> | null> {
  if (!b) return null;
  const r = await readDoc<PromoSlot>(b, site, "youtube").catch(() => null);
  return r ? { ...r.doc, items: sanitizeSlots(r.doc.items) } : null;
}

export async function getKids(b: SaleBucket | undefined, site: SiteId): Promise<PromoDoc<KidsChannel> | null> {
  if (!b) return null;
  const r = await readDoc<KidsChannel>(b, site, "kids").catch(() => null);
  return r ? { ...r.doc, items: sanitizeKids(r.doc.items) } : null;
}

/** Save a site's list: create-once the first time, compare-and-swap after. */
async function save<T>(b: SaleBucket, site: SiteId, kind: Kind, items: unknown, by: string, nowMs: number): Promise<PromoDoc<T>> {
  const clean = sanitize[kind](items) as T[];
  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readDoc<T>(b, site, kind);
    const next: PromoDoc<T> = { items: clean, updatedAt: new Date(nowMs).toISOString(), updatedBy: by };
    const ok = await b.put(docKey(site, kind), JSON.stringify(next), { onlyIf: cur ? { etagMatches: cur.etag } : { etagDoesNotMatch: "*" }, httpMetadata: JSON_TYPE });
    if (ok) {
      await appendPromoLog(b, site, { kind, by, count: clean.length }, nowMs);
      return next;
    }
  }
  throw new Error("The list changed at the same moment — please try again.");
}

export const saveYoutube = (b: SaleBucket, site: SiteId, items: unknown, by: string, nowMs = Date.now()) => save<PromoSlot>(b, site, "youtube", items, by, nowMs);
export const saveKids = (b: SaleBucket, site: SiteId, items: unknown, by: string, nowMs = Date.now()) => save<KidsChannel>(b, site, "kids", items, by, nowMs);

async function appendPromoLog(b: SaleBucket, site: SiteId, entry: Record<string, unknown>, nowMs: number): Promise<void> {
  const rand = crypto.getRandomValues(new Uint8Array(4)).reduce((s, x) => s + x.toString(16).padStart(2, "0"), "");
  await b.put(`l/promo/${site}/${String(nowMs).padStart(15, "0")}-${rand}.json`, JSON.stringify({ ...entry, at: new Date(nowMs).toISOString() }), {
    onlyIf: { etagDoesNotMatch: "*" }, httpMetadata: JSON_TYPE,
  }).catch(() => undefined);
}

/* ---- the public shapes the /live page and the kids page already read ------------ */

/** A site's promo slots as /content/live-streams "manual" rows (negative ids: never a D1 row). */
export function slotsAsStreams(slots: PromoSlot[]) {
  return slots.map((s) => ({
    id: -s.slot, platform: "youtube" as const, slot: s.slot, kind: "manual" as const,
    region: s.sponsor || null, title: s.title || null, url: s.url || null, is_live: s.active ? 1 : 0,
    channel_id: null, video_id: null, latest_video_id: null,
  }));
}

/** A site's kids channels as /content/video-anak channel rows, visible ones only, in the admin's order. */
export function kidsAsChannels(channels: KidsChannel[]) {
  return channels.filter((c) => c.visible).map((c, i) => ({
    id: -(i + 1), country: c.country, title: c.title, channel_id: c.channelId, language: c.language || null, sort_order: i,
  }));
}
