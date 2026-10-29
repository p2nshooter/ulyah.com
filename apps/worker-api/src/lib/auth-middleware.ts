import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import type { Env } from "../env.js";
import { getSession, sessionCookieName } from "./session.js";

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * What a site's own admin portal may reach (docs/ADSENSE-BLUEPRINT.md §18).
 *  - A demo account (shown to prospective buyers on the sale page) only READS the
 *    promotion and site pages: never donations, clients, keys, the audit log,
 *    analytics, settings or buyers' offers.
 *  - A sibling-site admin (tenant set) manages its own site's promotions, Hajj &
 *    Umrah packages and pages, and reads the shared lists; everything that belongs
 *    to the whole ecosystem stays with the ulyah owner.
 */
const SITE_READ = /^\/admin\/(promo|hajj-packages|site-pages|live-streams|kids-channels|kids-audio|library-stats|locales|store|media)(\/|$)/;
const SITE_WRITE = /^\/admin\/(promo|hajj-packages|site-pages)(\/|$)/;

/** Why a session may not make this request, or null when it may. */
export function scopeRefusal(session: { role?: string; tenant?: string | null }, method: string, path: string): { error: string; code: string } | null {
  const read = READ_METHODS.has(method);
  if (session.role === "demo") {
    if (!read) return { error: "This is a read-only demo account — changes are disabled.", code: "demo_readonly" };
    if (!SITE_READ.test(path)) return { error: "Not part of the demo.", code: "demo_hidden" };
    return null;
  }
  if (session.tenant && !(read ? SITE_READ : SITE_WRITE).test(path)) {
    return { error: "This belongs to the ulyah.com owner, not to a site admin.", code: "site_scope" };
  }
  return null;
}

export async function requireAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const token =
    getCookie(c, sessionCookieName("admin")) ?? c.req.header("x-admin-session") ?? undefined;
  const session = await getSession(c.env, token);
  if (!session || session.subject !== "admin") {
    return c.json({ error: "Admin authentication required" }, 401);
  }
  // Demo accounts and sibling-site admins are held to their part of the portal here,
  // the single choke point every admin route passes through.
  const refusal = scopeRefusal(session, c.req.method, c.req.path);
  if (refusal) return c.json(refusal, 403);
  c.set("admin" as never, session as never);
  await next();
}

export async function requireClient(c: Context<{ Bindings: Env }>, next: Next) {
  const token =
    getCookie(c, sessionCookieName("client")) ?? c.req.header("x-client-session") ?? undefined;
  const session = await getSession(c.env, token);
  if (!session || session.subject !== "client") {
    return c.json({ error: "Client authentication required" }, 401);
  }
  c.set("client" as never, session as never);
  await next();
}
