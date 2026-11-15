/**
 * Pembayaran otomatis PayPal (USD & JPY) dan gerbang redirect Stripe / Xendit / Midtrans, serta invoice setiap pembayaran.
 * - POST /api/paypal/order/:id    → buat order untuk tagihan milik member (custom_id = id tagihan)
 * - POST /api/paypal/capture/:id  → tangkap pembayaran; bila COMPLETED dan nominal/mata uang cocok → lunas + langganan aktif
 * - POST /api/paypal/webhook      → jalur cadangan yang diverifikasi ke PayPal (idempoten)
 * - POST /api/bayar/:gw/:id         → buat pembayaran di gerbang (referensi = id tagihan) lalu dialihkan ke halamannya
 * - GET  /api/bayar/:gw/kembali/:id → pembeli kembali; server menanyakan status ke API gerbang dan melunasi bila lunas
 * - POST /api/bayar/:gw/webhook     → notifikasi bertanda tangan/token; status dibaca ulang dari API — idempoten
 * - GET  /portal/tagihan/:id/invoice → invoice/kuitansi yang dapat dicetak atau diunduh
 */
import { Hono } from 'hono';
import { csrfOk, type HonoEnv, type Ctx } from '../lib/session.ts';
import { origin } from '../lib/render.ts';
import { limit } from '../lib/ratelimit.ts';
import { esc } from '../lib/html.ts';
import { attachGateway, attachPaypalOrder, getInvoice, markPaid } from '../data/invoices.ts';
import { getPricing, getSite } from '../data/settings.ts';
import { payOptions } from '../data/gateways.ts';
import { getUser, grantSubs, isAdmin } from '../data/users.ts';
import { audit, event } from '../data/audit.ts';
import { COURSE_META, METHOD_KINDS, money, type Invoice } from '../data/model.ts';
import { amountMatches, GATEWAYS, GW_META, getGw, gwCheckout, gwServes, gwStatus, gwWebhook, GwError, type GwId, type GwMode, type GwPaid } from '../data/gw.ts';
import { captureOrder, createOrder, getPaypalConfig, paypalReady, PaypalError, verifyWebhook, PAYPAL_CURRENCIES, type Captured } from '../data/paypal.ts';

export const pay = new Hono<HonoEnv>();

/** Lunaskan tagihan dari hasil tangkapan PayPal setelah semua pemeriksaan cocok. */
async function settle(c: Ctx, inv: Invoice, cap: Captured, orderId: string, mode: 'live' | 'sandbox', via: string): Promise<boolean> {
  const amountOk = Math.abs(cap.amount - inv.amount) < (inv.currency === 'JPY' ? 1 : 0.01);
  if (cap.status !== 'COMPLETED' || cap.invoiceId !== inv.id || cap.currency !== inv.currency || !amountOk) {
    await event(c.get('store'), 'paypal.mismatch', { inv: inv.id, status: cap.status, cur: cap.currency, amount: cap.amount, via });
    return false;
  }
  const store = c.get('store');
  const pricing = await getPricing(store);
  const done = await markPaid(store, inv.id, pricing.days, { method: 'paypal', paypal: { orderId, captureId: cap.captureId, mode, payer: cap.payer } });
  if (!done || done.status !== 'approved') return false;
  await grantSubs(store, done.userId, done.courses, pricing.days, done.tier, done.id);
  await audit(store, 'paypal', 'invoice.paid', { id: done.id, number: done.number, amount: done.amount, currency: done.currency, mode, via });
  return true;
}

const ownInvoice = async (c: Ctx, id: string): Promise<Invoice | null> => {
  const u = c.get('user');
  const inv = await getInvoice(c.get('store'), id);
  return u && inv && (inv.userId === u.id || isAdmin(u)) ? inv : null;
};

pay.post('/api/paypal/order/:id', async (c) => {
  const inv = await ownInvoice(c, c.req.param('id'));
  if (!inv) return c.json({ error: 'Tagihan tidak ditemukan.' }, 404);
  if (inv.status === 'approved' || inv.status === 'cancelled') return c.json({ error: 'Tagihan ini sudah selesai.' }, 400);
  if (!PAYPAL_CURRENCIES.includes(inv.currency)) return c.json({ error: 'PayPal tersedia untuk tagihan USD dan JPY.' }, 400);
  if (!(await limit(c.env, `pp:${inv.userId}`, 20, 3600))) return c.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, 429);
  const cfg = await getPaypalConfig(c.get('store'));
  if (!c.env.MASTER_KEY || !paypalReady(cfg)) return c.json({ error: 'PayPal belum tersedia.' }, 503);
  try {
    const site = await getSite(c.get('store'));
    const o = await createOrder(cfg, c.env.MASTER_KEY, inv, site.name, `${origin(c)}/portal/tagihan/${inv.id}`);
    await attachPaypalOrder(c.get('store'), inv.id, o.id, cfg.mode);
    return c.json({ id: o.id });
  } catch (err) {
    return c.json({ error: err instanceof PaypalError ? err.message : 'PayPal sedang tidak dapat dihubungi.' }, 502);
  }
});

pay.post('/api/paypal/capture/:id', async (c) => {
  const inv = await ownInvoice(c, c.req.param('id'));
  if (!inv) return c.json({ error: 'Tagihan tidak ditemukan.' }, 404);
  if (inv.status === 'approved') return c.json({ ok: true, already: true });
  const b = (await c.req.json().catch(() => null)) as { orderId?: string } | null;
  const orderId = String(b?.orderId ?? '');
  if (!orderId || inv.paypal?.orderId !== orderId) return c.json({ error: 'Order tidak cocok dengan tagihan.' }, 400);
  const cfg = await getPaypalConfig(c.get('store'));
  if (!c.env.MASTER_KEY || !paypalReady(cfg)) return c.json({ error: 'PayPal belum tersedia.' }, 503);
  try {
    const cap = await captureOrder(cfg, c.env.MASTER_KEY, orderId);
    const ok = await settle(c, inv, cap, orderId, inv.paypal?.mode ?? cfg.mode, 'capture');
    return ok ? c.json({ ok: true }) : c.json({ error: 'Pembayaran belum selesai atau tidak cocok. Hubungi kami bila saldo sudah terpotong.' }, 409);
  } catch (err) {
    return c.json({ error: err instanceof PaypalError ? err.message : 'PayPal sedang tidak dapat dihubungi.' }, 502);
  }
});

pay.post('/api/paypal/webhook', async (c) => {
  const body = await c.req.text();
  const store = c.get('store');
  const cfg = await getPaypalConfig(store);
  if (!c.env.MASTER_KEY || !paypalReady(cfg)) return c.json({ ok: false }, 503);
  let ok = false;
  try {
    ok = await verifyWebhook(cfg, c.env.MASTER_KEY, c.req.raw.headers, body);
  } catch {
    ok = false;
  }
  if (!ok) {
    await event(store, 'paypal.webhook.rejected', {});
    return c.json({ ok: false }, 400);
  }
  const evt = JSON.parse(body) as { event_type?: string; resource?: Record<string, any> };
  const r = evt.resource ?? {};
  await event(store, 'paypal.webhook', { type: evt.event_type ?? '' });
  try {
    if (evt.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const invId = String(r.custom_id ?? '');
      const inv = invId ? await getInvoice(store, invId) : null;
      const orderId = String(r.supplementary_data?.related_ids?.order_id ?? inv?.paypal?.orderId ?? '');
      if (inv && inv.status !== 'approved') {
        await settle(c, inv, { status: String(r.status ?? ''), invoiceId: invId, amount: Number(r.amount?.value ?? 0), currency: String(r.amount?.currency_code ?? ''), captureId: String(r.id ?? '') }, orderId, cfg.mode, 'webhook');
      }
    } else if (evt.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const invId = String(r.purchase_units?.[0]?.custom_id ?? '');
      const inv = invId ? await getInvoice(store, invId) : null;
      if (inv && inv.status !== 'approved' && r.id) {
        const cap = await captureOrder(cfg, c.env.MASTER_KEY, String(r.id));
        await settle(c, inv, cap, String(r.id), cfg.mode, 'webhook-approved');
      }
    } else if (evt.event_type === 'PAYMENT.CAPTURE.REFUNDED' || evt.event_type === 'PAYMENT.CAPTURE.DENIED') {
      await audit(store, 'paypal', `paypal.${String(evt.event_type).toLowerCase()}`, { capture: String(r.id ?? ''), custom: String(r.custom_id ?? '') });
    }
  } catch {
    // PayPal akan mengirim ulang webhook; kegagalan sementara tidak boleh membuat kehilangan pembayaran.
    return c.json({ ok: false }, 500);
  }
  return c.json({ ok: true });
});

/* ── Gerbang redirect: Stripe, Xendit, Midtrans ───────────────────────────── */

const gwParam = (v: string): GwId | null => ((GATEWAYS as string[]).includes(v) ? (v as GwId) : null);

/** Lunaskan dari status gerbang setelah status lunas, tagihan, mata uang dan nominal cocok. */
async function settleGw(c: Ctx, g: GwId, inv: Invoice, paid: GwPaid, via: string): Promise<boolean> {
  if (!paid.paid || paid.invoiceId !== inv.id || paid.currency !== inv.currency || !amountMatches(paid.amount, inv)) {
    await event(c.get('store'), `${g}.mismatch`, { inv: inv.id, paid: paid.paid, cur: paid.currency, amount: paid.amount, via });
    return false;
  }
  const store = c.get('store');
  const pricing = await getPricing(store);
  const done = await markPaid(store, inv.id, pricing.days, { method: g, gateway: { id: g, ref: paid.ref, mode: paid.mode, payer: paid.payer } });
  if (!done || done.status !== 'approved') return false;
  await grantSubs(store, done.userId, done.courses, pricing.days, done.tier, done.id);
  await audit(store, g, 'invoice.paid', { id: done.id, number: done.number, amount: done.amount, currency: done.currency, mode: paid.mode, via });
  return true;
}

pay.post('/api/bayar/:gw/webhook', async (c) => {
  const g = gwParam(c.req.param('gw'));
  if (!g) return c.json({ ok: false }, 404);
  const body = await c.req.text();
  const store = c.get('store');
  const cfg = await getGw(store, g);
  if (!c.env.MASTER_KEY || !cfg[cfg.mode].secret) return c.json({ ok: false }, 503);
  let paid: GwPaid | null | false;
  try {
    paid = await gwWebhook(g, cfg, c.env.MASTER_KEY, c.req.raw.headers, body);
  } catch {
    // Gangguan sementara (API gerbang tidak menjawab): gerbang akan mengirim ulang notifikasinya.
    return c.json({ ok: false }, 500);
  }
  if (paid === false) {
    await event(store, `${g}.webhook.rejected`, {});
    return c.json({ ok: false }, 400);
  }
  await event(store, `${g}.webhook`, { paid: Boolean(paid?.paid) });
  if (paid) {
    const inv = paid.invoiceId ? await getInvoice(store, paid.invoiceId) : null;
    if (inv && inv.status !== 'approved') await settleGw(c, g, inv, paid, 'webhook');
  }
  return c.json({ ok: true });
});

pay.get('/api/bayar/:gw/kembali/:id', async (c) => {
  const g = gwParam(c.req.param('gw'));
  const inv = await ownInvoice(c, c.req.param('id'));
  if (!g || !inv) return c.notFound();
  const to = (q: string) => c.redirect(`/portal/tagihan/${inv.id}?${q}`);
  if (inv.status === 'approved') return to('lunas=1');
  const ref = inv.gateway?.id === g ? inv.gateway.ref : '';
  // Stripe mengirim ?ref=<sesi>; harus sama dengan sesi yang dibuat untuk tagihan ini.
  if (!ref || (c.req.query('ref') && c.req.query('ref') !== ref)) return to(`err=${encodeURIComponent('Pembayaran tidak cocok dengan tagihan.')}`);
  if (!c.env.MASTER_KEY) return to(`err=${encodeURIComponent('Pembayaran otomatis belum tersedia.')}`);
  try {
    const cfg = await getGw(c.get('store'), g);
    const paid = await gwStatus(g, cfg, c.env.MASTER_KEY, ref, inv.gateway!.mode as GwMode);
    if (await settleGw(c, g, inv, paid, 'return')) return to('lunas=1');
    return to(`err=${encodeURIComponent(paid.paid ? 'Pembayaran tidak cocok dengan tagihan. Hubungi kami bila dana sudah terpotong.' : 'Pembayaran belum selesai. Bila dana sudah terpotong, status diperbarui otomatis begitu gerbang mengonfirmasi.')}`);
  } catch (err) {
    return to(`err=${encodeURIComponent(err instanceof GwError ? err.message : 'Gerbang pembayaran sedang tidak dapat dihubungi.')}`);
  }
});

pay.post('/api/bayar/:gw/:id', async (c) => {
  const g = gwParam(c.req.param('gw'));
  const id = c.req.param('id');
  const back = (m: string) => c.redirect(`/portal/tagihan/${encodeURIComponent(id)}?err=${encodeURIComponent(m)}`);
  const u = c.get('user');
  const inv = await ownInvoice(c, id);
  if (!g || !u || !inv) return c.notFound();
  const f = await c.req.parseBody();
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return back('Sesi formulir kedaluwarsa. Muat ulang halaman.');
  if (inv.status === 'approved' || inv.status === 'cancelled') return back('Tagihan ini sudah selesai.');
  if (!(await limit(c.env, `gw:${inv.userId}`, 20, 3600))) return back('Terlalu banyak percobaan. Coba lagi nanti.');
  const store = c.get('store');
  const cfg = await getGw(store, g);
  if (!c.env.MASTER_KEY || !gwServes(cfg, inv.currency)) return back(`${GW_META[g].name} belum tersedia untuk tagihan ini.`);
  try {
    const [site, owner] = await Promise.all([getSite(store), getUser(store, inv.userId)]);
    const o = origin(c);
    const r = await gwCheckout(g, cfg, c.env.MASTER_KEY, inv, {
      brand: site.name, email: owner?.email ?? '', name: owner?.name ?? '', description: `${inv.number} · ${inv.courses.map((k) => COURSE_META[k].name).join(', ')}`,
      returnUrl: `${o}/api/bayar/${g}/kembali/${inv.id}`, cancelUrl: `${o}/portal/tagihan/${inv.id}`,
    });
    await attachGateway(store, inv.id, { id: g, ref: r.ref, mode: cfg.mode });
    return c.redirect(r.url, 303);
  } catch (err) {
    return back(err instanceof GwError ? err.message : `${GW_META[g].name} sedang tidak dapat dihubungi. Coba lagi.`);
  }
});

/** Invoice / kuitansi: dokumen mandiri yang rapi untuk dicetak atau disimpan (?unduh=1 → berkas .html). */
pay.get('/portal/tagihan/:id/invoice', async (c) => {
  const inv = await ownInvoice(c, c.req.param('id'));
  if (!inv) return c.notFound();
  const store = c.get('store');
  const [owner, site, pricing, ways] = await Promise.all([getUser(store, inv.userId), getSite(store), getPricing(store), payOptions(store, c.env)]);
  const paid = inv.status === 'approved';
  const tier = pricing.tiers[inv.tier];
  const d = (ms?: number) => (ms ? new Date(ms + 7 * 3600_000).toISOString().slice(0, 10) : '—');
  const method = inv.method === 'paypal' ? `PayPal (${inv.paypal?.mode === 'live' ? 'live' : 'sandbox'}) · ${inv.paypal?.captureId ?? ''}`
    : inv.gateway && inv.method === inv.gateway.id ? `${GW_META[inv.gateway.id].name} (${inv.gateway.mode === 'live' ? 'live' : 'uji'}) · ${inv.gateway.ref}`
      : inv.method === 'bank' || (paid && !inv.method) ? 'Transfer (terverifikasi)' : '—';
  const opt = ways.by[inv.currency];
  const unpaidWays = paid ? '' : [
    ...(opt.paypal ? ['PayPal (otomatis, di halaman tagihan)'] : []),
    ...opt.gw.map((g) => `${GW_META[g].name} (otomatis, di halaman tagihan)`),
    ...opt.manual.map((m) => `${m.name}${m.kind === 'bank' || m.kind === 'swift' ? '' : ` (${METHOD_KINDS[m.kind].label})`} ${m.account}${m.holder ? ` · a.n. ${m.holder}` : ''}${m.swift ? ` · SWIFT ${m.swift}` : ''}`),
  ].map((x) => `<br><span class="muted">${esc(x)}</span>`).join('');
  const statusTxt = paid ? 'LUNAS · PAID · 支払済' : inv.status === 'cancelled' ? 'DIBATALKAN · CANCELLED' : 'BELUM LUNAS · UNPAID · 未払い';
  const doc = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(paid ? 'Kuitansi' : 'Invoice')} ${esc(inv.number)} — ${esc(site.name)}</title>
<style>body{font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#121a2e;max-width:860px;margin:32px auto;padding:0 20px;background:#fff}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:3px solid #f5b301;padding-bottom:16px}.brand{font:700 28px Georgia,serif;color:#0b1f4d}.muted{color:#6b7390}h1{font:700 22px Georgia,serif;margin:0;color:#0b1f4d}.st{display:inline-block;padding:4px 12px;border-radius:999px;font-weight:700;font-size:13px;background:${paid ? '#e6f6ee;color:#1f8a5b' : '#fff5db;color:#7a5200'}}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border-bottom:1px solid #e6e2d7;text-align:left}th{background:#f1f5ff;font-size:12px;text-transform:uppercase;letter-spacing:.05em}td.r,th.r{text-align:right}.tot td{font-weight:700;font-size:18px;color:#0b1f4d}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:18px}.box{border:1px solid #e6e2d7;border-radius:12px;padding:14px}footer{margin-top:28px;font-size:12px;color:#6b7390}.noprint{margin-top:18px}@media print{.noprint{display:none}}</style></head><body>
<header><div><div class="brand">${esc(site.name)}</div><div class="muted">${esc(site.tagline)}<br>luaja.com · ${esc(site.contact.email)}</div></div><div style="text-align:right"><h1>${paid ? 'KUITANSI / RECEIPT' : 'INVOICE'}</h1><div>${esc(inv.number)}</div><div class="st">${statusTxt}</div></div></header>
<div class="grid"><div class="box"><b>Ditagihkan kepada · Bill to</b><br>${esc(owner?.name ?? '')}<br><span class="muted">${esc(owner?.email ?? '')}</span></div><div class="box"><b>Tanggal · Date</b><br>Dibuat: ${d(inv.createdAt)}<br>Dibayar: ${d(inv.paidAt ?? inv.decidedAt)}<br>Masa aktif: ${d(inv.activeFrom)} – ${d(inv.activeUntil)}</div></div>
<table><tr><th>Deskripsi · Description</th><th>Kategori</th><th class="r">Jumlah</th></tr>
<tr><td>Langganan ${pricing.days} hari · ${esc(inv.courses.map((k) => COURSE_META[k].name).join(', '))}</td><td>${esc(tier?.label ?? inv.tier)}</td><td class="r">${esc(money(inv.amount, inv.currency))}</td></tr>
<tr class="tot"><td colspan="2">Total (${esc(inv.currency)})</td><td class="r">${esc(money(inv.amount, inv.currency))}</td></tr></table>
<div class="box"><b>Pembayaran · Payment</b><br>${esc(method)}${unpaidWays}</div>
<footer>Dokumen ini dibuat otomatis oleh ${esc(site.name)} dan sah tanpa tanda tangan. · This document is system-generated and valid without signature.</footer>
<div class="noprint"><button onclick="window.print()">Cetak / Simpan PDF</button></div>
</body></html>`;
  const headers: Record<string, string> = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };
  if (c.req.query('unduh')) headers['content-disposition'] = `attachment; filename="${paid ? 'kuitansi' : 'invoice'}-${inv.number}.html"`;
  return new Response(doc, { headers });
});
