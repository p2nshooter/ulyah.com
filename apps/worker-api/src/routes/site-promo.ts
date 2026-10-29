import type { Context, Hono } from "hono";
import type { Env } from "../env.js";
import type { SessionData } from "../lib/session.js";
import { R2_OFF_MESSAGE } from "../lib/r2.js";
import { SITES, SITE_IDS, actingSite, isSiteId } from "../lib/sites.js";
import { getDemo, updateDemo } from "../lib/admin-demo.js";
import { PROMO_SLOTS, getKids, getYoutube, saveKids, saveYoutube, type KidsChannel, type PromoSlot } from "../lib/site-promo.js";

/**
 * The admin portal's promotion pages (docs/ADSENSE-BLUEPRINT.md §18), for every site:
 *   GET  /admin/promo?site=           the site's YouTube promo slots and kids' channels (its own, or the shared list it shows today)
 *   PUT  /admin/promo/youtube?site=   save the six promo slots      — the site's own list from now on
 *   PUT  /admin/promo/kids?site=      save the kids' YouTube channels
 * A sibling admin or demo is locked to its own site; the ulyah owner picks any. Demo
 * accounts only read (lib/auth-middleware.ts refuses every write).
 * The ulyah owner only:
 *   GET  /admin/demo-logins           the demo login of each site
 *   PUT  /admin/demo-logins/:site     { rotate?: true, enabled?: boolean }
 */

type AdminApp = Hono<{ Bindings: Env }>;
interface SharedLists {
  liveRows(env: Env): Promise<{ kind: string; slot: number; title: string | null; url: string | null; region: string | null; is_live: number }[]>;
  kidsRows(env: Env): Promise<{ title: string; channel_id: string; country: string; language: string | null; visible: number }[]>;
}

const sessionOf = (c: { get(k: never): unknown }) => c.get("admin" as never) as SessionData | undefined;

export function registerPromoAdmin(admin: AdminApp, shared: SharedLists): void {
  admin.get("/promo", async (c) => {
    const s = sessionOf(c);
    const site = actingSite(s, c.req.query("site"));
    const b = c.env.MEDIA_R2;
    const [ownYoutube, ownKids] = await Promise.all([getYoutube(b, site), getKids(b, site)]);

    // What the site shows today when it has no list of its own: the shared one.
    let youtube: PromoSlot[] = ownYoutube?.items ?? [];
    let kids: KidsChannel[] = ownKids?.items ?? [];
    if (!ownYoutube) {
      const rows = await shared.liveRows(c.env).catch(() => []);
      youtube = Array.from({ length: PROMO_SLOTS }, (_, i) => {
        const r = rows.find((x) => x.kind === "manual" && x.slot === i + 1);
        return { slot: i + 1, title: r?.title ?? "", url: r?.url ?? "", sponsor: r?.region ?? "", active: !!r?.url && r.is_live === 1 };
      });
    }
    if (!ownKids) {
      const rows = await shared.kidsRows(c.env).catch(() => []);
      kids = rows.map((r) => ({ channelId: r.channel_id, title: r.title, country: r.country, language: r.language ?? "", visible: r.visible === 1 }));
    }
    const owner = !!s && !s.tenant && s.role !== "demo";
    return c.json({
      site,
      info: SITES[site],
      sites: owner ? SITE_IDS.map((id) => SITES[id]) : [SITES[site]],
      storage: !!b,
      youtube: { own: !!ownYoutube, items: youtube, updatedAt: ownYoutube?.updatedAt ?? "" },
      kids: { own: !!ownKids, items: kids, updatedAt: ownKids?.updatedAt ?? "" },
    });
  });

  const saver = (kind: "youtube" | "kids") => async (c: Context<{ Bindings: Env }>) => {
    const s = sessionOf(c);
    if (!c.env.MEDIA_R2) return c.json({ error: R2_OFF_MESSAGE, code: "storage" }, 503);
    const site = actingSite(s, c.req.query("site"));
    const body = (await c.req.json<{ items?: unknown }>().catch(() => null)) ?? {};
    try {
      const doc = kind === "youtube"
        ? await saveYoutube(c.env.MEDIA_R2, site, body.items, s?.email ?? "admin")
        : await saveKids(c.env.MEDIA_R2, site, body.items, s?.email ?? "admin");
      return c.json({ ok: true, site, own: true, items: doc.items, updatedAt: doc.updatedAt });
    } catch (e) {
      return c.json({ error: String((e as Error).message || e) }, 409);
    }
  };
  admin.put("/promo/youtube", saver("youtube"));
  admin.put("/promo/kids", saver("kids"));

  const ownerOnly = (c: { get(k: never): unknown }) => {
    const s = sessionOf(c);
    return s && !s.tenant && s.role !== "demo" ? s : null;
  };

  admin.get("/demo-logins", async (c) => {
    if (!ownerOnly(c)) return c.json({ error: "Only the ulyah.com owner manages the demo logins." }, 403);
    const b = c.env.MEDIA_R2;
    if (!b) return c.json({ logins: [], storage: false });
    const logins = await Promise.all(SITE_IDS.map((id) => getDemo(b, id)));
    return c.json({ storage: true, logins: logins.map((l) => ({ ...l, url: `https://${SITES[l.site].domain}/admin` })) });
  });

  admin.put("/demo-logins/:site", async (c) => {
    const s = ownerOnly(c);
    if (!s) return c.json({ error: "Only the ulyah.com owner manages the demo logins." }, 403);
    if (!c.env.MEDIA_R2) return c.json({ error: R2_OFF_MESSAGE, code: "storage" }, 503);
    const site = c.req.param("site");
    if (!isSiteId(site)) return c.json({ error: "Unknown site." }, 404);
    const body = (await c.req.json<{ rotate?: unknown; enabled?: unknown }>().catch(() => null)) ?? {};
    try {
      const login = await updateDemo(c.env.MEDIA_R2, site, { rotate: body.rotate === true, enabled: typeof body.enabled === "boolean" ? body.enabled : undefined }, s.email);
      return c.json({ ok: true, login: { ...login, url: `https://${SITES[site].domain}/admin` } });
    } catch (e) {
      return c.json({ error: String((e as Error).message || e) }, 409);
    }
  });
}
