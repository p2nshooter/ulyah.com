/**
 * ulyah.com for sale (docs/ADSENSE-BLUEPRINT.md §17): the rules and the R2 storage of
 * apps/worker-api/src/lib/site-sale.ts, against an in-memory bucket that keeps R2's
 * conditional-write semantics (etagMatches / etagDoesNotMatch "*").
 *
 *   - defaults: shown, US$250,000, negotiable, offers from US$50,000;
 *   - settings are sanitised (bad numbers, a minimum above the price, a non-YouTube live link);
 *   - an offer below the minimum, without a name, e-mail or country, or while hidden, is refused;
 *   - an offer is recorded once — a double submit is the same document;
 *   - two admins saving at the same moment both land (compare-and-swap, no lost update);
 *   - an offer's status and note change, every change is logged, newest first;
 *   - 1fr.fr, tilawa.de, dawa.im and xad.es: US$250,000 each, their own terms, ulyah.com's
 *     contacts, their own offers, all managed from the ulyah.com admin (§17.3).
 *
 *   npx tsx scripts/check-site-sale.ts
 */
import assert from "node:assert/strict";
import {
  SALE_DEFAULTS, buildOffer, getSettings, listOffers, offerProblem, publicSettings, recentLog, recordOffer, sanitizeSettings, saveSettings, updateOffer,
  type SaleBucket,
} from "../apps/worker-api/src/lib/site-sale.ts";
import { Hono } from "hono";
import { saleRoute, registerSiteSaleAdmin } from "../apps/worker-api/src/routes/site-sale.ts";

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
}

let passed = 0;
const ok = (name: string) => { passed += 1; console.log(`  ok    ${name}`); };

async function main() {
  // Defaults
  const b = new FakeR2();
  const d = await getSettings(b);
  assert.deepEqual([d.visible, d.priceUsd, d.minOfferUsd, d.negotiable], [true, 250_000, 50_000, true]);
  assert.deepEqual(await getSettings(undefined), SALE_DEFAULTS, "no R2 binding: the published defaults");
  assert.ok(!("updatedBy" in publicSettings(d)), "internal fields stay internal");
  ok("defaults: shown, US$250,000, negotiable, minimum US$50,000");

  // Sanitising
  const s1 = sanitizeSettings({ priceUsd: "300.000", minOfferUsd: 400_000, makkahLiveUrl: "https://evil.example/x", email: "nope" });
  assert.equal(s1.priceUsd, 300_000, "a price written with dots is read");
  assert.equal(s1.minOfferUsd, 300_000, "a minimum above the price is capped at the price");
  assert.equal(s1.makkahLiveUrl, "", "only a YouTube link is accepted for the live");
  assert.equal(s1.email, SALE_DEFAULTS.email, "an invalid e-mail keeps the current one");
  assert.equal(sanitizeSettings({ priceUsd: -5 }).priceUsd, 250_000);
  assert.equal(sanitizeSettings({ makkahLiveUrl: "https://www.youtube.com/channel/UCos52azQNBgW63_9uDJoPDA" }).makkahLiveUrl, "https://www.youtube.com/channel/UCos52azQNBgW63_9uDJoPDA");
  ok("settings are sanitised");

  // Offer rules
  const good = { name: "Ahmad Buyer", email: "ahmad@example.com", country: "Malaysia", amountUsd: 60_000, message: "Serious offer" };
  assert.equal(offerProblem(good, d), null);
  assert.equal(offerProblem({ ...good, amountUsd: 49_999 }, d), "amount", "below the minimum");
  assert.equal(offerProblem({ ...good, amountUsd: "50.000" }, d), null, "the minimum itself, written with dots");
  assert.equal(offerProblem({ ...good, name: "A" }, d), "name");
  assert.equal(offerProblem({ ...good, email: "x@" }, d), "email");
  assert.equal(offerProblem({ ...good, country: "" }, d), "country");
  assert.equal(offerProblem(good, { ...d, visible: false }), "hidden", "no offers while the sale is hidden");
  ok("offers below the minimum, incomplete or while hidden are refused");

  // Create-once
  const o1 = await buildOffer(good, "203.0.113.9", Date.UTC(2026, 9, 29, 9));
  const o2 = await buildOffer(good, "203.0.113.9", Date.UTC(2026, 9, 29, 9, 0, 3));
  assert.equal(o1.id, o2.id, "the same offer the same day has the same id");
  assert.ok(!o1.ipHash.includes("203.0.113.9"), "the address is stored only as a hash");
  assert.deepEqual(await recordOffer(b, o1), { created: true });
  assert.deepEqual(await recordOffer(b, o2), { created: false }, "a double submit is not a second offer");
  await recordOffer(b, await buildOffer({ ...good, amountUsd: 90_000, email: "second@example.com" }, "", Date.UTC(2026, 9, 29, 10)));
  const offers = await listOffers(b);
  assert.equal(offers.length, 2);
  assert.equal(offers[0]!.amountUsd, 90_000, "newest first");
  ok("an offer is recorded once; the list is newest first");

  // Compare-and-swap: two admins at the same moment
  await Promise.all([
    saveSettings(b, { priceUsd: 275_000 }, "admin-a@example.com"),
    saveSettings(b, { makkahLiveUrl: "https://www.youtube.com/watch?v=abc123DEF45" }, "admin-b@example.com"),
  ]);
  const after = await getSettings(b);
  assert.equal(after.priceUsd, 275_000, "the first save is not lost");
  assert.equal(after.makkahLiveUrl, "https://www.youtube.com/watch?v=abc123DEF45", "nor the second");
  ok("two concurrent saves both land (compare-and-swap)");

  // Status, note, log
  const u = await updateOffer(b, o1.id, { status: "negotiating", note: "Call on Monday" }, "owner@example.com");
  assert.equal(u?.status, "negotiating");
  assert.equal(u?.note, "Call on Monday");
  assert.equal((await updateOffer(b, o1.id, { status: "bogus" }, "owner@example.com"))?.status, "negotiating", "an unknown status changes nothing");
  assert.equal(await updateOffer(b, "../k/site-sale", { status: "accepted" }, "x"), null, "only offer ids are accepted");
  const log = await recentLog(b);
  assert.ok(log.length >= 4, "every change is logged");
  assert.ok(String(log[0]!.at) >= String(log[log.length - 1]!.at), "log newest first");
  ok("status and note change; every change is logged");

  // The HTTP routes, as the Worker serves them.
  const kv = new Map<string, string>();
  const env = {
    MEDIA_R2: new FakeR2(),
    CACHE_KV: { get: async (k: string) => kv.get(k) ?? null, put: async (k: string, v: string) => void kv.set(k, v), delete: async (k: string) => void kv.delete(k) },
  } as never;
  const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as never;
  const call = (app: Hono<never>, path: string, init?: RequestInit) => app.request(path, init, env, ctx);
  const post = (body: unknown, ip = "198.51.100.7") =>
    call(saleRoute as never, "/offers", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify(body) });

  const pub = await (await call(saleRoute as never, "/")).json() as Record<string, unknown>;
  assert.deepEqual([pub.visible, pub.priceUsd, pub.minOfferUsd], [true, 250_000, 50_000]);
  assert.ok(!("updatedBy" in pub));
  const low = await post({ ...good, amountUsd: 10_000 });
  assert.equal(low.status, 400);
  assert.equal(((await low.json()) as { code?: string }).code, "amount");
  const sent = await post(good);
  assert.equal(sent.status, 200);
  assert.equal(((await sent.json()) as { created?: boolean }).created, true);
  assert.equal(((await (await post(good)).json()) as { created?: boolean }).created, false, "a double submit is answered but not recorded twice");
  assert.equal(((await (await post({ ...good, website: "spam.example" })).json()) as { created?: boolean }).created, false, "the honeypot records nothing");
  for (let i = 0; i < 6; i++) await post({ ...good, email: `r${i}@example.com` }, "192.0.2.50");
  assert.equal((await post({ ...good, email: "r9@example.com" }, "192.0.2.50")).status, 429, "five offers an hour per address");
  ok("routes: public terms, minimum, double submit, honeypot, rate limit");

  // Admin: the ulyah owner only.
  const adminApp = (session: Record<string, unknown>) => {
    const a = new Hono();
    a.use("*", async (c, next) => { c.set("admin" as never, session as never); await next(); });
    registerSiteSaleAdmin(a as never);
    return a;
  };
  const owner = adminApp({ subject: "admin", id: 1, email: "owner@ulyah.com", role: "owner", tenant: null });
  const sibling = adminApp({ subject: "admin", id: 2, email: "admin@1fr.fr", role: "admin", tenant: "1fr" });
  const demo = adminApp({ subject: "admin", id: 3, email: "demo@ulyah.com", role: "demo", tenant: null });
  assert.equal((await call(sibling as never, "/site-sale")).status, 403, "a sibling-site admin never sees buyers");
  assert.equal((await call(demo as never, "/site-sale")).status, 403, "nor a read-only demo account");
  const view = await (await call(owner as never, "/site-sale")).json() as { offers: { id: string }[]; settings: { visible: boolean } };
  assert.ok(view.offers.length >= 1);
  const hide = await call(owner as never, "/site-sale", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: false }) });
  assert.equal(hide.status, 200);
  assert.equal(((await (await call(saleRoute as never, "/")).json()) as { visible?: boolean }).visible, false, "hidden for everyone");
  assert.equal((await post({ ...good, email: "late@example.com" }, "203.0.113.77")).status, 404, "no offers while hidden");
  const st = await call(owner as never, `/site-sale/offers/${view.offers[0]!.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "contacted", note: "WA sent" }) });
  assert.equal(((await st.json()) as { offer?: { status?: string } }).offer?.status, "contacted");
  ok("admin: owner only; hide takes effect at once; offer status");

  // The sibling sites (§17.3): same price, their own terms, ulyah.com's contacts, one admin.
  const nb = new FakeR2();
  await saveSettings(nb, { whatsapp: "+62811000111", email: "owner@ulyah.com" }, "owner@ulyah.com");
  const fr = await getSettings(nb, "1fr");
  assert.deepEqual([fr.visible, fr.priceUsd, fr.minOfferUsd, fr.negotiable], [true, 250_000, 50_000, true], "the owner: \"Harga sama $250k\"");
  assert.deepEqual([fr.whatsapp, fr.email], ["+62811000111", "owner@ulyah.com"], "a sibling uses ulyah.com's contacts");
  const savedFr = await saveSettings(nb, { priceUsd: 300_000, email: "someone@else.example", whatsapp: "+1555" }, "owner@ulyah.com", "1fr");
  assert.equal(savedFr.priceUsd, 300_000);
  assert.equal(savedFr.email, "owner@ulyah.com", "a sibling's contacts are never set per sibling");
  assert.equal((await getSettings(nb, "ulyah")).priceUsd, 250_000, "one site's price is not another's");
  assert.equal((await getSettings(nb, "tilawa")).priceUsd, 250_000);
  const plain = await buildOffer(good, "", Date.UTC(2026, 9, 29, 9));
  const asUlyah = await buildOffer({ ...good, site: "ulyah" }, "", Date.UTC(2026, 9, 29, 9));
  const asXad = await buildOffer({ ...good, site: "xad" }, "", Date.UTC(2026, 9, 29, 9));
  assert.equal(plain.id, o1.id, "ulyah.com's offer id is unchanged by the release");
  assert.equal(asUlyah.id, plain.id);
  assert.notEqual(asXad.id, plain.id, "the same buyer's offer for another site is another offer");
  assert.equal(asXad.site, "xad");
  assert.equal((await buildOffer({ ...good, site: "dawa" }, "", 0)).site, "ulyah", "never a site that is not the owner's");
  ok("siblings: US$250,000 each, own terms, ulyah.com's contacts, own offers");

  const env2 = { MEDIA_R2: new FakeR2(), CACHE_KV: { get: async () => null, put: async () => {}, delete: async () => {} } } as never;
  const net = await (await saleRoute.request("/network", {}, env2, ctx)).json() as { sites: { site: string; priceUsd: number }[] };
  assert.deepEqual(net.sites.map((x) => x.site), ["ulyah", "1fr", "tilawa", "dawaim", "xad"]);
  assert.ok(net.sites.every((x) => x.priceUsd === 250_000));
  const ownerApp2 = (() => {
    const a = new Hono();
    a.use("*", async (c, next) => { c.set("admin" as never, { subject: "admin", id: 1, email: "owner@ulyah.com", role: "owner", tenant: null } as never); await next(); });
    registerSiteSaleAdmin(a as never);
    return a;
  })();
  const hideXad = await ownerApp2.request("/site-sale?site=xad", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: false }) }, env2, ctx);
  assert.equal(((await hideXad.json()) as { site?: string }).site, "xad");
  const net2 = await (await saleRoute.request("/network", {}, env2, ctx)).json() as { sites: { site: string }[] };
  assert.ok(!net2.sites.some((x) => x.site === "xad") && net2.sites.some((x) => x.site === "ulyah"), "hiding one site hides only that site");
  const xadTerms = await (await saleRoute.request("/?site=xad", {}, env2, ctx)).json() as { visible?: boolean; site?: string };
  assert.deepEqual([xadTerms.visible, xadTerms.site], [false, "xad"]);
  const postTo = (site: string, amountUsd: number) => saleRoute.request("/offers", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": `198.51.100.${amountUsd % 200}` }, body: JSON.stringify({ ...good, site, amountUsd }) }, env2, ctx);
  assert.equal((await postTo("xad", 80_000)).status, 404, "no offers for a hidden site");
  assert.equal((await postTo("tilawa", 49_000)).status, 400, "the site's minimum applies");
  assert.equal((await postTo("tilawa", 120_000)).status, 200);
  const view2 = await (await ownerApp2.request("/site-sale", {}, env2, ctx)).json() as { sites: { site: string }[]; offers: { site: string; amountUsd: number }[] };
  assert.equal(view2.sites.length, 5, "the owner sees all five sites in one place");
  assert.deepEqual(view2.offers.map((x) => [x.site, x.amountUsd]), [["tilawa", 120_000]], "each offer says which site it is for");
  ok("routes: network of sites, per-site hide, per-site minimum, offers with their site");

  console.log(`\nALL OK (${passed} checks)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
