/**
 * Every site's admin portal (docs/ADSENSE-BLUEPRINT.md §18), against an in-memory R2 that
 * keeps R2's conditional writes (etagMatches / etagDoesNotMatch "*") and an in-memory KV:
 *
 *   - each site has one demo login, made once even when asked twice at the same moment,
 *     with a password that is never in the repository; a new password locks the old one out;
 *   - a demo signs in through the real login route, gets a read-only session for its site,
 *     and reads only the promotion pages — never donations, clients, keys, logs or offers;
 *   - a site's own admin manages its own promotions, packages and pages and nothing that
 *     belongs to the whole ecosystem; the ulyah owner manages any site (two paths, §18.4);
 *   - promo slots and kids' channels are sanitised, kept per site, and shown publicly in the
 *     shapes the /live and kids pages already read; a site without its own list shows the shared one.
 *
 *   npx tsx scripts/check-admin-portal.ts
 */
import assert from "node:assert/strict";
import { Hono } from "hono";
import { SITE_IDS, actingSite } from "../apps/worker-api/src/lib/sites.ts";
import { checkDemoLogin, demoSiteOf, getDemo, newDemoPassword, updateDemo } from "../apps/worker-api/src/lib/admin-demo.ts";
import { scopeRefusal, requireAdmin } from "../apps/worker-api/src/lib/auth-middleware.ts";
import { getKids, getYoutube, kidsAsChannels, sanitizeKids, sanitizeSlots, saveKids, saveYoutube, slotsAsStreams } from "../apps/worker-api/src/lib/site-promo.ts";
import { registerPromoAdmin } from "../apps/worker-api/src/routes/site-promo.ts";
import { adminAuthRoute } from "../apps/worker-api/src/routes/admin-auth.ts";
import { saleRoute } from "../apps/worker-api/src/routes/site-sale.ts";
import type { SaleBucket } from "../apps/worker-api/src/lib/site-sale.ts";

class FakeR2 implements SaleBucket {
  private objects = new Map<string, { body: string; etag: string; uploaded: Date }>();
  private n = 0;
  async get(key: string) {
    const o = this.objects.get(key);
    return o ? { etag: o.etag, text: async () => o.body } : null;
  }
  async put(key: string, value: string, options?: { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string } }) {
    await new Promise((r) => setTimeout(r, Math.random() * 3));   // let concurrent writers interleave
    const cur = this.objects.get(key);
    const c = options?.onlyIf;
    if (c?.etagDoesNotMatch === "*" && cur) return null;
    if (c?.etagMatches !== undefined && cur?.etag !== c.etagMatches) return null;
    this.objects.set(key, { body: value, etag: `e${++this.n}`, uploaded: new Date() });
    return {};
  }
  async list(options?: { prefix?: string }) {
    const objects = [...this.objects.entries()].filter(([k]) => k.startsWith(options?.prefix ?? "")).map(([key, o]) => ({ key, uploaded: o.uploaded }));
    return { objects, truncated: false };
  }
  keys() {
    return [...this.objects.keys()];
  }
}

const fakeKv = () => {
  const m = new Map<string, string>();
  return { get: async (k: string) => m.get(k) ?? null, put: async (k: string, v: string) => void m.set(k, v), delete: async (k: string) => void m.delete(k) };
};

let passed = 0;
const ok = (name: string) => { passed += 1; console.log(`  ok    ${name}`); };

async function main() {
  // ── Demo logins ────────────────────────────────────────────────────────────
  const b = new FakeR2();
  assert.deepEqual(SITE_IDS.map((s) => demoSiteOf(`DEMO@${{ ulyah: "ulyah.com", "1fr": "1fr.fr", tilawa: "tilawa.de", dawaim: "dawa.im", xad: "xad.es" }[s]}`)), SITE_IDS);
  assert.equal(demoSiteOf("demo@dawa.es"), null, "dawa.es is not the owner's site");
  assert.equal(demoSiteOf("admin@1fr.fr"), null);
  const p1 = newDemoPassword();
  assert.match(p1, /^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
  assert.ok(!/[01lo]/.test(p1), "no look-alike characters");
  const counts = new Map<string, number>();
  for (let i = 0; i < 4000; i++) for (const ch of newDemoPassword().replace(/-/g, "")) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  assert.equal(counts.size, 32, "every character of the alphabet is used");
  assert.ok(Math.max(...counts.values()) / Math.min(...counts.values()) < 1.25, "no character is favoured (no modulo bias)");
  assert.notEqual(p1, newDemoPassword());
  const [a1, a2] = await Promise.all([getDemo(b, "1fr"), getDemo(b, "1fr")]);
  assert.equal(a1.password, a2.password, "made once, even when asked twice at the same moment");
  assert.equal(a1.email, "demo@1fr.fr");
  assert.equal(await checkDemoLogin(b, "demo@1fr.fr", a1.password), "1fr");
  assert.equal(await checkDemoLogin(b, "demo@1fr.fr", a1.password + "x"), null, "wrong password");
  assert.equal(await checkDemoLogin(b, "demo@tilawa.de", a1.password), null, "another site's demo is not made by a sign-in attempt");
  assert.ok(!b.keys().includes("k/admin-demo/tilawa.json"), "a failed sign-in creates nothing");
  const rotated = await updateDemo(b, "1fr", { rotate: true }, "owner@ulyah.com");
  assert.notEqual(rotated.password, a1.password);
  assert.equal(await checkDemoLogin(b, "demo@1fr.fr", a1.password), null, "the old password stops working");
  await updateDemo(b, "1fr", { enabled: false }, "owner@ulyah.com");
  assert.equal(await checkDemoLogin(b, "demo@1fr.fr", rotated.password), null, "a switched-off demo cannot sign in");
  await updateDemo(b, "1fr", { enabled: true }, "owner@ulyah.com");
  assert.equal(await checkDemoLogin(b, "demo@1fr.fr", rotated.password), "1fr");
  ok("one demo login per site: made once, rotatable, switchable, never in the repository");

  // ── Who may reach what ─────────────────────────────────────────────────────
  const demo = { role: "demo", tenant: "1fr" };
  const siteAdmin = { role: "admin", tenant: "tilawa" };
  const owner = { role: "owner", tenant: null };
  for (const path of ["/admin/promo", "/admin/hajj-packages", "/admin/site-pages", "/admin/live-streams", "/admin/kids-channels"]) {
    assert.equal(scopeRefusal(demo, "GET", path), null, `demo reads ${path}`);
  }
  for (const path of ["/admin/donations", "/admin/clients", "/admin/keys", "/admin/audit-log", "/admin/dashboard", "/admin/analytics", "/admin/site-sale", "/admin/settings", "/admin/demo-logins", "/ai/orchestra/health", "/grant/applications"]) {
    assert.equal(scopeRefusal(demo, "GET", path)?.code, "demo_hidden", `demo never reads ${path}`);
  }
  assert.equal(scopeRefusal(demo, "PUT", "/admin/promo/youtube")?.code, "demo_readonly");
  assert.equal(scopeRefusal(demo, "POST", "/admin/hajj-packages")?.code, "demo_readonly");
  assert.equal(scopeRefusal(siteAdmin, "PUT", "/admin/promo/kids"), null);
  assert.equal(scopeRefusal(siteAdmin, "POST", "/admin/hajj-packages"), null);
  assert.equal(scopeRefusal(siteAdmin, "GET", "/admin/live-streams"), null);
  assert.equal(scopeRefusal(siteAdmin, "PUT", "/admin/live-streams/3")?.code, "site_scope", "the shared list is the owner's");
  assert.equal(scopeRefusal(siteAdmin, "GET", "/admin/donations")?.code, "site_scope");
  assert.equal(scopeRefusal(siteAdmin, "GET", "/admin/demo-logins")?.code, "site_scope");
  assert.equal(scopeRefusal(owner, "DELETE", "/admin/keys/9"), null);
  assert.equal(actingSite(siteAdmin, "ulyah"), "tilawa", "a site admin is locked to its site");
  assert.equal(actingSite(demo, "xad"), "1fr");
  assert.equal(actingSite({ role: "demo", tenant: null }, "xad"), "ulyah", "ulyah's demo stays on ulyah");
  assert.equal(actingSite(owner, "dawaim"), "dawaim", "the owner picks any site");
  assert.equal(actingSite(owner, "dawa"), "ulyah", "never a site that is not the owner's");
  ok("demo reads promotions only; a site admin keeps to its site; the owner reaches every site");

  // ── Promo lists ────────────────────────────────────────────────────────────
  const slots = sanitizeSlots([
    { slot: 2, title: " Kajian ", url: "https://www.youtube.com/watch?v=abc123DEF45", sponsor: "Masjid", active: true },
    { slot: 3, title: "Bad", url: "https://evil.example/x", active: true },
    { slot: 2, title: "duplicate", url: "https://youtu.be/zzz" },
    { slot: 9, title: "out of range", url: "https://youtu.be/zzz" },
    { slot: 4, title: "No link", url: "", active: true },
  ]);
  assert.equal(slots.length, 6);
  assert.deepEqual(slots.map((s) => s.slot), [1, 2, 3, 4, 5, 6]);
  assert.equal(slots[1]!.title, "Kajian");
  assert.equal(slots[1]!.active, true);
  assert.equal(slots[2]!.url, "", "only YouTube links");
  assert.equal(slots[2]!.active, false);
  assert.equal(slots[3]!.active, false, "a slot without a link is never active");
  const kids = sanitizeKids([
    { title: "Omar & Hana", country: "Malaysia", url: "https://www.youtube.com/channel/UCa1b2c3d4e5f6g7h8i9j0", language: "ms" },
    { title: "dup", country: "X", channelId: "UCa1b2c3d4e5f6g7h8i9j0" },
    { title: "", country: "X", channelId: "UCzzzzzzzzzzzzzzzzzzzz" },
    { title: "Not a channel", country: "X", url: "https://www.youtube.com/@handle" },
    { title: "Hidden", country: "Türkiye", channelId: "UCyyyyyyyyyyyyyyyyyyyy", visible: false },
  ]);
  assert.deepEqual(kids.map((k) => k.channelId), ["UCa1b2c3d4e5f6g7h8i9j0", "UCyyyyyyyyyyyyyyyyyyyy"]);
  assert.equal(sanitizeKids(Array.from({ length: 80 }, (_, i) => ({ title: `c${i}`, country: "X", channelId: `UC${String(i).padStart(22, "0")}` }))).length, 60);
  assert.equal(await getYoutube(b, "xad"), null, "no own list yet: the shared one is shown");
  await Promise.all([saveYoutube(b, "xad", slots, "a@x"), saveKids(b, "xad", kids, "a@x")]);
  assert.equal((await getYoutube(b, "xad"))!.items[1]!.url, "https://www.youtube.com/watch?v=abc123DEF45");
  const [s1, s2] = await Promise.all([saveYoutube(b, "xad", [{ slot: 1, title: "A" }], "a@x"), saveYoutube(b, "xad", [{ slot: 1, title: "B" }], "b@x")]);
  assert.ok(s1 && s2, "two saves at the same moment both complete (compare-and-swap)");
  assert.ok(["A", "B"].includes((await getYoutube(b, "xad"))!.items[0]!.title));
  assert.equal(await getYoutube(b, "tilawa"), null, "one site's list is not another's");
  const rows = slotsAsStreams(slots);
  assert.deepEqual(Object.keys(rows[0]!).sort(), ["channel_id", "id", "is_live", "kind", "latest_video_id", "platform", "region", "slot", "title", "url", "video_id"]);
  assert.ok(rows.every((r) => r.kind === "manual" && r.id < 0), "manual rows with ids that are never D1 rows");
  assert.deepEqual(kidsAsChannels((await getKids(b, "xad"))!.items).map((c) => c.channel_id), ["UCa1b2c3d4e5f6g7h8i9j0"], "only visible channels are public");
  ok("promo slots and kids' channels: sanitised, per site, compare-and-swap, public shapes");

  // ── The routes, as the Worker serves them ──────────────────────────────────
  const env = { MEDIA_R2: new FakeR2(), CACHE_KV: fakeKv() } as never;
  const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as never;

  // The real login route: the demo signs in and gets a read-only session for its site.
  const demoLogin = await getDemo((env as { MEDIA_R2: FakeR2 }).MEDIA_R2, "dawaim");
  const login = await adminAuthRoute.request("/login", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.5" }, body: JSON.stringify({ email: "demo@dawa.im", password: demoLogin.password }) }, env, ctx);
  assert.equal(login.status, 200);
  const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0]!;
  assert.match(login.headers.get("set-cookie") ?? "", /HttpOnly/i);
  assert.match(login.headers.get("set-cookie") ?? "", /SameSite=Strict/i);
  const me = await (await adminAuthRoute.request("/me", { headers: { cookie } }, env, ctx)).json() as Record<string, unknown>;
  assert.deepEqual([me.role, me.tenant, me.readOnly, me.site, me.domain], ["demo", "dawaim", true, "dawaim", "dawa.im"]);

  // requireAdmin + the promo routes, with that cookie and with other sessions.
  const app = new Hono();
  app.use("/admin/*", requireAdmin as never);
  const admin = new Hono();
  registerPromoAdmin(admin as never, {
    liveRows: async () => [{ kind: "manual", slot: 1, title: "Shared slot", url: "https://www.youtube.com/watch?v=shared00001", region: "Masjid", is_live: 1 }],
    kidsRows: async () => [{ title: "Shared kids", channel_id: "UCssssssssssssssssssss", country: "Indonesia", language: "id", visible: 1 }],
  });
  admin.get("/donations", (c) => c.json({ donations: ["private"] }));
  app.route("/admin", admin);
  const call = (path: string, init: RequestInit = {}) => app.request(path, { ...init, headers: { cookie, "Content-Type": "application/json", ...(init.headers ?? {}) } }, env, ctx);

  const promo = await (await call("/admin/promo?site=ulyah")).json() as { site: string; sites: unknown[]; youtube: { own: boolean; items: { title: string }[] }; kids: { items: { title: string }[] } };
  assert.equal(promo.site, "dawaim", "the demo sees its own site, whatever it asks for");
  assert.equal(promo.sites.length, 1);
  assert.equal(promo.youtube.own, false);
  assert.equal(promo.youtube.items[0]!.title, "Shared slot", "the shared list until the site saves its own");
  assert.equal(promo.kids.items[0]!.title, "Shared kids");
  assert.equal((await call("/admin/donations")).status, 403, "never donations");
  assert.equal((await call("/admin/promo/youtube", { method: "PUT", body: JSON.stringify({ items: [] }) })).status, 403, "never a write");
  assert.equal((await call("/admin/demo-logins")).status, 403);

  // The owner manages any site; the site admin its own.
  const sessionApp = (session: Record<string, unknown>) => {
    const a = new Hono();
    a.use("*", async (c, next) => { c.set("admin" as never, session as never); await next(); });
    registerPromoAdmin(a as never, { liveRows: async () => [], kidsRows: async () => [] });
    return a;
  };
  const ownerApp = sessionApp({ subject: "admin", id: 1, email: "owner@ulyah.com", role: "owner", tenant: null });
  const xadAdmin = sessionApp({ subject: "admin", id: 7, email: "admin@xad.es", role: "admin", tenant: "xad" });
  const put = (a: Hono, path: string, body: unknown) => a.request(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, env, ctx);
  assert.equal((await put(ownerApp, "/promo/youtube?site=tilawa", { items: [{ slot: 1, title: "From ulyah.com", url: "https://youtu.be/abc", active: true }] })).status, 200);
  assert.equal((await put(xadAdmin, "/promo/kids?site=ulyah", { items: [{ title: "XAD kids", country: "UK", channelId: "UCxxxxxxxxxxxxxxxxxxxx" }] })).status, 200);
  assert.equal((await getYoutube((env as { MEDIA_R2: FakeR2 }).MEDIA_R2, "tilawa"))!.items[0]!.title, "From ulyah.com", "path 1: from ulyah.com");
  assert.equal((await getKids((env as { MEDIA_R2: FakeR2 }).MEDIA_R2, "xad"))!.items[0]!.title, "XAD kids", "path 2: the site's own admin, on its own site");
  assert.equal(await getKids((env as { MEDIA_R2: FakeR2 }).MEDIA_R2, "ulyah"), null, "a site admin never writes ulyah.com's list");
  const owners = await (await ownerApp.request("/promo", {}, env, ctx)).json() as { sites: unknown[] };
  assert.equal(owners.sites.length, 5, "the owner picks from all five sites");
  const logins = await (await ownerApp.request("/demo-logins", {}, env, ctx)).json() as { logins: { site: string; url: string }[] };
  assert.deepEqual(logins.logins.map((l) => l.site), SITE_IDS);
  assert.equal(logins.logins.find((l) => l.site === "1fr")!.url, "https://1fr.fr/admin");
  assert.equal((await xadAdmin.request("/demo-logins", {}, env, ctx)).status, 403);

  // The sale page reads the demo login publicly; switched off, nothing.
  const pub = await (await saleRoute.request("/demo?site=dawaim", {}, env, ctx)).json() as Record<string, unknown>;
  assert.deepEqual([pub.enabled, pub.url, pub.email, pub.password], [true, "https://dawa.im/admin", "demo@dawa.im", demoLogin.password]);
  await put(ownerApp, "/demo-logins/dawaim", { enabled: false });
  assert.equal(((await (await saleRoute.request("/demo?site=dawaim", {}, env, ctx)).json()) as { enabled?: boolean }).enabled, false);
  assert.equal((await saleRoute.request("/demo?site=dawa", {}, env, ctx)).status, 404);
  ok("routes: demo sign-in and read-only session, both control paths, demo logins, sale page");

  console.log(`\nALL OK (${passed} checks)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
