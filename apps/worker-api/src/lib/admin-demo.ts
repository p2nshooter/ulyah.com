import { SITES, SITE_IDS, isSiteId, type SiteId } from "./sites.js";
import type { SaleBucket } from "./site-sale.js";

/**
 * The read-only demo login of every site's admin portal (owner, 29 Oct 2026:
 * "kasih cara masuk admin panel nya dengan username dan password demo, mereka
 * hanya bisa melihat2"; docs/ADSENSE-BLUEPRINT.md §18).
 *
 * The username is demo@<domain>. The password is random, made once the first time
 * it is needed and kept in R2 — never in the repository:
 *   k/admin-demo/<site>.json   { password, enabled, updatedAt, updatedBy }
 * It is meant to be shown to prospective buyers (the sale page prints it), so it is
 * stored as written; what keeps the portal safe is that a demo session can only
 * read the promotion pages (lib/auth-middleware.ts), never change anything.
 * The ulyah owner can make a new password or switch a demo off from the admin.
 */
export interface DemoLogin {
  site: SiteId;
  email: string;
  password: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

interface DemoDoc { password: string; enabled: boolean; updatedAt: string; updatedBy: string }

const key = (site: SiteId) => `k/admin-demo/${site}.json`;
const JSON_TYPE = { contentType: "application/json" };

/** "demo@1fr.fr" → "1fr"; anything else → null. */
export function demoSiteOf(email: string): SiteId | null {
  const e = email.trim().toLowerCase();
  for (const id of SITE_IDS) if (e === `demo@${SITES[id].domain}`) return id;
  return null;
}

/**
 * Twelve readable characters in three groups (no 0/o/1/l): easy to type from a sale page.
 * 32 characters, so each random byte's low five bits pick one with equal chance (no modulo bias).
 */
export function newDemoPassword(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const chars = [...bytes].map((b) => alphabet[b & 31]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8).join("")}`;
}

async function read(b: SaleBucket, site: SiteId): Promise<{ doc: DemoDoc; etag: string } | null> {
  const o = await b.get(key(site));
  if (!o) return null;
  try {
    const doc = JSON.parse(await o.text()) as DemoDoc;
    if (typeof doc.password !== "string" || doc.password.length < 8) return null;
    return { doc: { password: doc.password, enabled: doc.enabled !== false, updatedAt: String(doc.updatedAt ?? ""), updatedBy: String(doc.updatedBy ?? "") }, etag: o.etag };
  } catch {
    return null;
  }
}

const view = (site: SiteId, d: DemoDoc): DemoLogin => ({ site, email: `demo@${SITES[site].domain}`, ...d });

/** The site's demo login, made (once, create-only) the first time it is asked for. */
export async function getDemo(b: SaleBucket, site: SiteId, nowMs = Date.now()): Promise<DemoLogin> {
  const cur = await read(b, site);
  if (cur) return view(site, cur.doc);
  const doc: DemoDoc = { password: newDemoPassword(), enabled: true, updatedAt: new Date(nowMs).toISOString(), updatedBy: "system" };
  if (await b.put(key(site), JSON.stringify(doc), { onlyIf: { etagDoesNotMatch: "*" }, httpMetadata: JSON_TYPE })) return view(site, doc);
  // Another request made it at the same moment: theirs stands.
  const again = await read(b, site);
  if (!again) throw new Error("The demo login could not be prepared.");
  return view(site, again.doc);
}

/** A new password and/or on/off, compare-and-swap. */
export async function updateDemo(b: SaleBucket, site: SiteId, patch: { rotate?: boolean; enabled?: boolean }, by: string, nowMs = Date.now()): Promise<DemoLogin> {
  await getDemo(b, site, nowMs);
  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await read(b, site);
    if (!cur) continue;
    const next: DemoDoc = {
      password: patch.rotate ? newDemoPassword() : cur.doc.password,
      enabled: typeof patch.enabled === "boolean" ? patch.enabled : cur.doc.enabled,
      updatedAt: new Date(nowMs).toISOString(),
      updatedBy: by,
    };
    if (await b.put(key(site), JSON.stringify(next), { onlyIf: { etagMatches: cur.etag }, httpMetadata: JSON_TYPE })) return view(site, next);
  }
  throw new Error("The demo login changed at the same moment — please try again.");
}

/** Constant-time comparison, so the answer time says nothing about the password. */
function same(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/**
 * The demo sign-in: the site whose demo login this is, or null (unknown e-mail,
 * switched off, wrong password). Never creates anything for an unknown site.
 */
export async function checkDemoLogin(b: SaleBucket | undefined, email: string, password: string): Promise<SiteId | null> {
  const site = demoSiteOf(email);
  if (!b || !site || !isSiteId(site)) return null;
  const cur = await read(b, site);
  if (!cur || !cur.doc.enabled) return null;
  return same(password, cur.doc.password) ? site : null;
}

/** A stable negative session id per site's demo, so it never collides with an admin_users row. */
export const demoSessionId = (site: SiteId) => -(SITE_IDS.indexOf(site) + 1);
