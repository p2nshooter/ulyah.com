/**
 * AdOps endpoints (docs/ADMANAGER-BLUEPRINT.md §8).
 *
 * Admin (behind requireAdmin, mounted by registerAdopsAdmin on adminRoute):
 *   GET  /admin/adops/overview      everything the admin panel shows
 *   POST /admin/adops/test          test the AdSense + Ad Manager connections
 *   POST /admin/adops/run           run the plan now (respects the mode)
 *   POST /admin/adops/mode          { mode: off | dry-run | live }
 *   POST /admin/adops/floors/applied { site?, position?, tier? } (none = all)
 *   GET  /admin/adops/adsense/connect → Google consent URL for the refresh token
 *
 * Public:
 *   GET  /adops/oauth/callback      Google redirects here after consent
 *   GET  /adops/site-config         ad slots of LIVE sites, for the build-time sync (no secrets)
 */
import { Hono, type Context } from "hono";
import type { Env } from "../env.js";
import { getSetting, setSetting } from "../lib/settings.js";
import { OWNER_SITES, EXCLUDED_TRACK_IDS, OWNER_ADSENSE_PUB } from "@ulyah/shared/owner-sites";
import { loadConfig, runAdOps, type AdOpsMode } from "../lib/adops/runner.js";
import { adManagerToken, adsenseConsentUrl, adsenseToken, exchangeAdsenseCode } from "../lib/adops/google.js";
import { listAdsenseSites } from "../lib/adops/adsense.js";
import { adManagerClient, getNetwork } from "../lib/adops/admanager.js";
import { AD_PLACEMENT, POSITIONS, POSITION_ORDER } from "../lib/adops/plan.js";

type Ctx = Context<{ Bindings: Env }>;
const adminEmail = (c: Ctx) => ((c.get("admin" as never) as { email?: string } | undefined)?.email ?? "admin");
const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10);
const redirectUri = (env: Env) => `${(env.API_BASE_URL || "https://api.ulyah.com").replace(/\/$/, "")}/adops/oauth/callback`;

/** Tables may not exist before migration 0057 is applied: read them softly. */
async function soft<T>(p: Promise<{ results?: T[] }>): Promise<T[]> {
  try {
    return (await p).results ?? [];
  } catch {
    return [];
  }
}

export function registerAdopsAdmin(admin: Hono<{ Bindings: Env }>): void {
  admin.get("/adops/overview", async (c) => {
    const cfg = await loadConfig(c.env);
    const db = c.env.DB;
    const [siteRows, traffic, revenue, daily, floors, actions] = await Promise.all([
      soft(db.prepare("SELECT track_id, adsense_state, auto_ads, adsense_checked, ready_since, gam_status FROM adops_sites").all<{ track_id: string; adsense_state: string | null; auto_ads: number | null; adsense_checked: string | null; ready_since: string | null; gam_status: string }>()),
      soft(db.prepare("SELECT site, SUM(count) AS views FROM site_pageviews WHERE day >= ? GROUP BY site").bind(daysAgo(7)).all<{ site: string; views: number }>()),
      soft(
        db
          .prepare(
            `SELECT site, SUM(page_views) AS page_views, SUM(requests) AS requests, SUM(impressions) AS impressions, SUM(clicks) AS clicks, SUM(revenue) AS revenue
             FROM adops_daily WHERE day >= ? GROUP BY site`
          )
          .bind(daysAgo(30))
          .all<{ site: string; page_views: number; requests: number; impressions: number; clicks: number; revenue: number }>()
      ),
      soft(db.prepare("SELECT day, SUM(revenue) AS revenue, SUM(impressions) AS impressions FROM adops_daily WHERE day >= ? GROUP BY day ORDER BY day").bind(daysAgo(30)).all<{ day: string; revenue: number; impressions: number }>()),
      soft(db.prepare("SELECT site, position, tier, floor, previous_floor, reason, decided_at, applied FROM adops_floors WHERE applied = 0 ORDER BY site, position, tier LIMIT 400").all()),
      soft(db.prepare("SELECT id, at, mode, kind, site, detail, ok FROM adops_actions ORDER BY id DESC LIMIT 60").all()),
    ]);
    const state = new Map(siteRows.map((r) => [r.track_id, r]));
    const views = new Map<string, number>();
    for (const t of traffic) {
      if (EXCLUDED_TRACK_IDS.has(t.site)) continue;
      const id = t.site === "xad-es" ? "xad" : t.site;
      views.set(id, (views.get(id) ?? 0) + t.views);
    }
    const money = new Map(revenue.map((r) => [r.site, r]));
    const lastRun = await c.env.CACHE_KV.get("adops:last-run").catch(() => null);
    return c.json({
      config: {
        placement: AD_PLACEMENT,
        mode: cfg.mode,
        networkCode: cfg.networkCode,
        serviceAccountEmail: cfg.serviceAccount?.client_email ?? null,
        serviceAccountError: cfg.serviceAccountError,
        adsenseConnected: !!cfg.adsense,
        adsenseClientSet: !!(await getSetting(c.env, "ADSENSE_OAUTH_CLIENT_ID")),
        publisher: OWNER_ADSENSE_PUB,
        redirectUri: redirectUri(c.env),
      },
      lastRun: lastRun ? JSON.parse(lastRun) : null,
      sites: OWNER_SITES.map((s) => {
        const st = state.get(s.trackId);
        const m = money.get(s.trackId);
        return {
          domain: s.domain,
          trackId: s.trackId,
          lang: s.lang,
          built: s.built,
          adsenseState: st?.adsense_state ?? null,
          adsenseChecked: st?.adsense_checked ?? null,
          readySince: st?.ready_since ?? null,
          autoAds: st?.auto_ads == null ? null : st.auto_ads === 1,
          gamStatus: st?.gam_status ?? "none",
          views7d: views.get(s.trackId) ?? 0,
          revenue30d: m?.revenue ?? 0,
          impressions30d: m?.impressions ?? 0,
          clicks30d: m?.clicks ?? 0,
          requests30d: m?.requests ?? 0,
          pageViews30d: m?.page_views ?? 0,
        };
      }),
      daily,
      floors,
      actions,
      positions: POSITION_ORDER.map((p) => ({ id: p, label: POSITIONS[p].label, sizes: POSITIONS[p].sizes.map((s) => (s.sizeType === "FLUID" ? "fluid" : `${s.width}x${s.height}`)) })),
    });
  });

  admin.post("/adops/test", async (c) => {
    const cfg = await loadConfig(c.env);
    const out: { adsense: { ok: boolean; detail: string }; adManager: { ok: boolean; detail: string } } = {
      adsense: { ok: false, detail: "Belum dihubungkan (Client ID, Client Secret dan Refresh Token)." },
      adManager: { ok: false, detail: cfg.serviceAccountError ?? "Belum dihubungkan (Network Code dan Service Account JSON)." },
    };
    if (cfg.adsense) {
      try {
        const token = await adsenseToken(c.env, cfg.adsense.clientId, cfg.adsense.clientSecret, cfg.adsense.refreshToken);
        const sites = await listAdsenseSites(token, OWNER_ADSENSE_PUB);
        const ready = sites.filter((s) => s.state === "READY").map((s) => s.domain);
        out.adsense = { ok: true, detail: `${sites.length} situs di akun ${OWNER_ADSENSE_PUB}; READY: ${ready.length ? ready.join(", ") : "belum ada"}` };
      } catch (e) {
        out.adsense = { ok: false, detail: (e as Error).message };
      }
    }
    if (cfg.serviceAccount && cfg.networkCode) {
      try {
        const net = await getNetwork(adManagerClient(await adManagerToken(c.env, cfg.serviceAccount), cfg.networkCode));
        out.adManager = { ok: true, detail: `Terhubung ke jaringan ${net.displayName ?? net.networkCode} (${net.networkCode}), mata uang ${net.currencyCode ?? "?"}, zona waktu ${net.timeZone ?? "?"}` };
      } catch (e) {
        out.adManager = { ok: false, detail: (e as Error).message };
      }
    }
    return c.json(out);
  });

  admin.post("/adops/run", async (c) => {
    const report = await runAdOps(c.env);
    return c.json(report);
  });

  admin.post("/adops/mode", async (c) => {
    const { mode } = await c.req.json<{ mode?: string }>().catch(() => ({}) as { mode?: string });
    const m = (mode ?? "").toLowerCase() as AdOpsMode;
    if (!["off", "dry-run", "live"].includes(m)) return c.json({ error: "mode harus off, dry-run atau live" }, 400);
    if (m === "live" && AD_PLACEMENT === "auto") {
      // Auto ads mode only READS Google (approval, Auto ads flag, report), so
      // "live" just needs a working AdSense connection.
      const cfg = await loadConfig(c.env);
      if (!cfg.adsense) return c.json({ error: "Hubungkan AdSense dulu (Client ID, Secret, lalu Hubungkan AdSense)." }, 400);
      try {
        await listAdsenseSites(await adsenseToken(c.env, cfg.adsense.clientId, cfg.adsense.clientSecret, cfg.adsense.refreshToken), OWNER_ADSENSE_PUB);
      } catch (e) {
        return c.json({ error: `Koneksi AdSense gagal, mode live ditolak: ${(e as Error).message}` }, 400);
      }
    } else if (m === "live") {
      // Live only with a working Ad Manager connection: never "live" against nothing.
      const cfg = await loadConfig(c.env);
      if (!cfg.serviceAccount || !cfg.networkCode) return c.json({ error: "Isi Network Code dan Service Account JSON dulu, lalu Uji koneksi." }, 400);
      try {
        await getNetwork(adManagerClient(await adManagerToken(c.env, cfg.serviceAccount), cfg.networkCode));
      } catch (e) {
        return c.json({ error: `Koneksi Ad Manager gagal, mode live ditolak: ${(e as Error).message}` }, 400);
      }
    }
    await setSetting(c.env, "ADOPS_MODE", m, adminEmail(c));
    return c.json({ ok: true, mode: m });
  });

  admin.post("/adops/floors/applied", async (c) => {
    const b = await c.req.json<{ site?: string; position?: string; tier?: string }>().catch(() => ({}) as Record<string, string>);
    if (b.site && b.position && b.tier) {
      await c.env.DB.prepare("UPDATE adops_floors SET applied = 1 WHERE site = ? AND position = ? AND tier = ?").bind(b.site, b.position, b.tier).run();
    } else {
      await c.env.DB.prepare("UPDATE adops_floors SET applied = 1 WHERE applied = 0").run();
    }
    return c.json({ ok: true });
  });

  admin.get("/adops/adsense/connect", async (c) => {
    const clientId = await getSetting(c.env, "ADSENSE_OAUTH_CLIENT_ID");
    if (!clientId) return c.json({ error: "Isi AdSense OAuth Client ID dan Client Secret dulu di Pengaturan." }, 400);
    const state = crypto.randomUUID();
    await c.env.CACHE_KV.put(`adops:oauth-state:${state}`, adminEmail(c), { expirationTtl: 900 });
    return c.json({ url: adsenseConsentUrl(clientId, redirectUri(c.env), state), redirectUri: redirectUri(c.env) });
  });
}

export const adopsPublicRoute = new Hono<{ Bindings: Env }>();

adopsPublicRoute.get("/oauth/callback", async (c) => {
  const page = (title: string, body: string) =>
    c.html(
      `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font-family:system-ui;max-width:560px;margin:60px auto;padding:0 16px;line-height:1.6"><h1 style="font-size:22px">${title}</h1><p>${body}</p><p><a href="https://ulyah.com/admin">Kembali ke admin</a></p></body></html>`
    );
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) return page("Gagal menghubungkan AdSense", "Google tidak mengirim kode otorisasi.");
  const who = await c.env.CACHE_KV.get(`adops:oauth-state:${state}`);
  if (!who) return page("Gagal menghubungkan AdSense", "Tautan sudah kedaluwarsa atau tidak dibuat dari admin. Ulangi dari tombol Hubungkan AdSense.");
  await c.env.CACHE_KV.delete(`adops:oauth-state:${state}`);
  const [clientId, clientSecret] = await Promise.all([getSetting(c.env, "ADSENSE_OAUTH_CLIENT_ID"), getSetting(c.env, "ADSENSE_OAUTH_CLIENT_SECRET")]);
  if (!clientId || !clientSecret) return page("Gagal menghubungkan AdSense", "Client ID atau Client Secret belum diisi.");
  try {
    const refresh = await exchangeAdsenseCode(clientId, clientSecret, code, redirectUri(c.env));
    await setSetting(c.env, "ADSENSE_REFRESH_TOKEN", refresh, who);
    return page("AdSense terhubung", "Refresh token tersimpan terenkripsi. Status semua situs akan dibaca otomatis setiap hari.");
  } catch (e) {
    return page("Gagal menghubungkan AdSense", (e as Error).message);
  }
});

/**
 * Ad slots of the sites whose Ad Manager inventory is live. In Auto ads mode
 * (AD_PLACEMENT = "auto", the owner's choice) there are none by definition:
 * the answer says so and lists no slot, so no build can ever inject one. Read by the daily
 * build-time sync (blueprint §5.5); contains no secret (a network code and ad
 * unit paths are public in every page that serves GPT ads anyway).
 */
adopsPublicRoute.get("/site-config", async (c) => {
  if (AD_PLACEMENT === "auto") {
    c.header("Cache-Control", "public, max-age=300");
    return c.json({ placement: "auto", networkCode: null, generatedAt: new Date().toISOString(), sites: [] });
  }
  const networkCode = (await getSetting(c.env, "ADMANAGER_NETWORK_CODE"))?.replace(/\D/g, "") || null;
  const rows = await soft(
    c.env.DB.prepare("SELECT site, position, status FROM adops_adunits WHERE position IS NOT NULL AND status = 'ACTIVE'").all<{ site: string; position: string; status: string }>()
  );
  const live = await soft(c.env.DB.prepare("SELECT track_id FROM adops_sites WHERE adsense_state = 'READY' AND gam_status = 'live'").all<{ track_id: string }>());
  const liveSet = new Set(live.map((r) => r.track_id));
  const sites = OWNER_SITES.filter((s) => liveSet.has(s.trackId)).map((s) => ({
    domain: s.domain,
    trackId: s.trackId,
    slots: rows
      .filter((r) => r.site === s.trackId)
      .map((r) => ({
        position: r.position,
        path: networkCode ? `/${networkCode}/${s.trackId}/${s.trackId}-${r.position}` : null,
        sizes: (POSITIONS[r.position as keyof typeof POSITIONS]?.sizes ?? []).map((z) => (z.sizeType === "FLUID" ? "fluid" : [z.width, z.height])),
      })),
  }));
  c.header("Cache-Control", "public, max-age=300");
  return c.json({ placement: "gam", networkCode, generatedAt: new Date().toISOString(), sites });
});
