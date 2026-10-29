import { Hono } from "hono";
import type { Env } from "../env.js";
import type { SessionData } from "../lib/session.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import { R2_OFF_MESSAGE } from "../lib/r2.js";
import {
  buildOffer, getSettings, listOffers, offerProblem, publicSettings, recentLog, recordOffer, saveSettings, updateOffer,
  type OfferInput, type SaleOffer,
} from "../lib/site-sale.js";

/**
 * ulyah.com is for sale (docs/ADSENSE-BLUEPRINT.md §17).
 *   GET  /sale          the public terms: shown?, price, minimum offer, negotiable, contact, Makkah live link
 *   POST /sale/offers   an offer (name, e-mail, WhatsApp, company, country, amount ≥ minimum, message)
 * Admin, ulyah owner only (sibling-site admins and demo accounts never see buyers' details):
 *   GET  /admin/site-sale              settings, every offer, the change log
 *   PUT  /admin/site-sale              save the settings
 *   PUT  /admin/site-sale/offers/:id   status (new · contacted · negotiating · declined · accepted) and note
 * Everything lives in R2 (lib/site-sale.ts) — no D1.
 */
export const saleRoute = new Hono<{ Bindings: Env }>();

const ip = (c: { req: { header(n: string): string | undefined } }) => c.req.header("cf-connecting-ip") ?? "";
const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

saleRoute.get("/", async (c) => {
  const s = await getSettings(c.env.MEDIA_R2);
  c.header("Cache-Control", "public, max-age=60");
  return c.json(publicSettings(s));
});

saleRoute.post("/offers", async (c) => {
  const b = (await c.req.json<OfferInput & { website?: unknown }>().catch(() => null)) ?? {};
  if ((b as { website?: unknown }).website) return c.json({ ok: true, created: false });   // honeypot: bots fill every field
  const rl = await checkRateLimit(c.env, `sale-offer:${ip(c) || "anon"}`, 5, 3600);
  if (!rl.allowed) return c.json({ error: "Too many offers — please try again later.", code: "rate" }, 429);
  if (!c.env.MEDIA_R2) return c.json({ error: R2_OFF_MESSAGE, code: "storage" }, 503);
  const s = await getSettings(c.env.MEDIA_R2);
  const problem = offerProblem(b, s);
  if (problem) {
    const msg = {
      hidden: "The site is not offered for sale at the moment.",
      name: "Please enter your name.",
      email: "Please enter a valid e-mail address.",
      country: "Please enter your country.",
      amount: `The minimum offer is ${usd(s.minOfferUsd)}.`,
    }[problem];
    return c.json({ error: msg, code: problem, minOfferUsd: s.minOfferUsd }, problem === "hidden" ? 404 : 400);
  }
  const offer = await buildOffer(b, ip(c));
  const { created } = await recordOffer(c.env.MEDIA_R2, offer);
  if (created) c.executionCtx.waitUntil(notifyOwner(c.env, s.email, offer).catch(() => undefined));
  return c.json({ ok: true, created, id: offer.id, amountUsd: offer.amountUsd });
});

/** One e-mail to the owner per new offer (when e-mail is configured); the offer is in the admin portal either way. */
async function notifyOwner(env: Env, to: string, o: SaleOffer): Promise<void> {
  if (!env.RESEND_API_KEY || !to) return;
  const from = env.EMAIL_FROM ?? "salam@ulyah.com";
  const rows: [string, string][] = [
    ["Name", o.name], ["E-mail", o.email], ["WhatsApp", o.whatsapp || "—"], ["Company", o.company || "—"], ["Country", o.country], ["Offer", usd(o.amountUsd)],
  ];
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a">
    <h2 style="color:#0B3D2E">New offer for ULYAH.COM — ${esc(usd(o.amountUsd))}</h2>
    <table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table>
    ${o.message ? `<blockquote style="border-left:3px solid #C9A227;margin:16px 0;padding:4px 12px;white-space:pre-wrap">${esc(o.message)}</blockquote>` : ""}
    <p style="color:#666;font-size:13px">Open the admin portal → Situs dijual to reply and track it.</p></div>`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `ULYAH.COM <${from}>`, to: [to], reply_to: o.email, subject: `[ULYAH.COM dijual] ${o.name} — ${usd(o.amountUsd)}`, html }),
  });
}

type AdminApp = Hono<{ Bindings: Env }>;

/** The ulyah owner's routes; sibling-site admins (tenant-scoped) and read-only demo accounts are refused. */
export function registerSiteSaleAdmin(admin: AdminApp): void {
  const owner = (c: { get(k: never): unknown }) => {
    const s = c.get("admin" as never) as SessionData;
    return !s.tenant && s.role !== "demo" ? s : null;
  };

  admin.get("/site-sale", async (c) => {
    const s = owner(c);
    if (!s) return c.json({ error: "Only the ulyah.com owner manages the sale." }, 403);
    const settings = await getSettings(c.env.MEDIA_R2);
    if (!c.env.MEDIA_R2) return c.json({ settings, offers: [], log: [], storage: false });
    const [offers, log] = await Promise.all([listOffers(c.env.MEDIA_R2), recentLog(c.env.MEDIA_R2)]);
    return c.json({ settings, offers, log, storage: true });
  });

  admin.put("/site-sale", async (c) => {
    const s = owner(c);
    if (!s) return c.json({ error: "Only the ulyah.com owner manages the sale." }, 403);
    if (!c.env.MEDIA_R2) return c.json({ error: R2_OFF_MESSAGE }, 503);
    const body = (await c.req.json<Record<string, unknown>>().catch(() => null)) ?? {};
    try {
      const settings = await saveSettings(c.env.MEDIA_R2, body, s.email);
      return c.json({ ok: true, settings });
    } catch (e) {
      return c.json({ error: String((e as Error).message || e) }, 409);
    }
  });

  admin.put("/site-sale/offers/:id", async (c) => {
    const s = owner(c);
    if (!s) return c.json({ error: "Only the ulyah.com owner manages the sale." }, 403);
    if (!c.env.MEDIA_R2) return c.json({ error: R2_OFF_MESSAGE }, 503);
    const body = (await c.req.json<{ status?: unknown; note?: unknown }>().catch(() => null)) ?? {};
    try {
      const offer = await updateOffer(c.env.MEDIA_R2, c.req.param("id"), body, s.email);
      return offer ? c.json({ ok: true, offer }) : c.json({ error: "Offer not found." }, 404);
    } catch (e) {
      return c.json({ error: String((e as Error).message || e) }, 409);
    }
  });
}
