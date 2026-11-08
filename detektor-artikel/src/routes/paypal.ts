/**
 * Rute PayPal (MASTER-BLUEPRINT §28.4): member membayar invoice USD lewat PayPal tanpa unggah bukti; webhook bertanda
 * tangan; Admin → PayPal (CRUD kredensial sandbox/live terenkripsi, uji koneksi, daftar webhook).
 */
import type { Hono } from 'hono';
import { html } from '../lib/html.ts';
import { tr, type Lang } from '../lib/i18n.ts';
import { pageHead, flash, tip } from '../pages/ui.ts';
import { portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import { orderKey, reviewKey, invoiceNo, OPEN, type Order } from '../data/orders.ts';
import { audit } from '../data/audit.ts';
import { credit } from '../data/wallet.ts';
import { B } from '../brand.ts';
import { completeOrder } from './payments.ts';
import {
  getPaypal, paypalReady, sealCreds, createPaypalOrder, capturePaypalOrder, verifyWebhook, registerWebhook, accessToken,
  isPaypalMode, PAYPAL_DOC, PaypalError, type PaypalDoc, type PaypalMode, seedPublicKey, checkPaypal, getPaypalOrder } from '../data/paypal.ts';
import { limit } from '../lib/ratelimit.ts';
import type { Store } from '../lib/store.ts';
import type { Env } from '../env.ts';

const originOf = (c: Ctx) => (c.env.CANONICAL_HOST ? `https://${c.env.CANONICAL_HOST}` : new URL(c.req.url).origin);
const ppIndex = (paypalOrderId: string) => `i/paypal/${paypalOrderId}`;
/** Order PayPal kita yang belum lunas — diperiksa sendiri oleh cron (pengganti webhook PayPal). */
export const openKey = (orderId: string) => `i/paypal-open/${orderId}`;
const hookUrlOf = (env: Env, fallbackOrigin: string) => `${env.CANONICAL_HOST ? `https://${env.CANONICAL_HOST}` : fallbackOrigin}/api/paypal/webhook`;

/** Lunasi pesanan setelah PayPal mengonfirmasi pembayaran — jalur yang sama dengan persetujuan admin, idempoten. */
export async function settlePaypal(store: Store, orderId: string, cap: { captureId: string; amount: string; currency: string; status: string; payerEmail?: string }, by: string): Promise<'credited' | 'mismatch' | 'not_found' | 'pending'> {
  const o0 = await store.get<Order>(orderKey(orderId));
  if (!o0) return 'not_found';
  if (cap.status !== 'COMPLETED') {
    await store.cas<Order>(orderKey(orderId), (o) => (o ? { ...o, paypal: { ...o.paypal, status: cap.status, at: Date.now() } } : null));
    return 'pending';
  }
  // Nominal & mata uang harus sama persis dengan invoice (formulir tidak pernah menentukan harga).
  if (cap.currency !== 'USD' || Math.abs(Number(cap.amount) - o0.priceUsd) > 0.005) {
    await audit(store, by, 'paypal.mismatch', { orderId, amount: cap.amount, currency: cap.currency, expected: o0.priceUsd });
    return 'mismatch';
  }
  await store.cas<Order>(orderKey(orderId), (o) => {
    if (!o) return null;
    const pp = { ...o.paypal, captureId: cap.captureId, status: cap.status, payerEmail: cap.payerEmail, amount: cap.amount, at: Date.now() };
    if (OPEN.includes(o.status)) return { ...o, status: 'credited', creditedAt: Date.now(), reviewedAt: Date.now(), by, method: 'paypal', paypal: pp };
    if (o.status === 'credited' && !o.paypal?.captureId) return { ...o, paypal: pp };
    return null;
  });
  const o = await store.get<Order>(orderKey(orderId));
  if (o?.status !== 'credited') return 'pending';
  await store.del(openKey(orderId));
  await completeOrder(store, o, by);
  await store.del(reviewKey(orderId));
  await audit(store, by, 'paypal.paid', { orderId, captureId: cap.captureId, amount: cap.amount });
  return 'credited';
}

/** Mulai pembayaran PayPal untuk pesanan USD milik member; mengembalikan URL persetujuan PayPal. */
export async function startPaypal(c: Ctx, o: Order): Promise<string> {
  const store = c.get('store');
  const d = await getPaypal(c.env, store);
  if (!paypalReady(d)) throw new PaypalError('not_configured', 'PayPal belum aktif.');
  const L = portalLang(c);
  const base = originOf(c);
  const created = await createPaypalOrder(c.env, d, {
    orderId: o.id,
    invoiceNo: invoiceNo(o),
    amountUsd: o.priceUsd,
    description: `${B.name} — ${o.kind === 'deposit' ? 'deposit' : `${o.pkgName?.en ?? o.pkg} · ${o.tokens} tokens`}`,
    brand: B.name,
    returnUrl: `${base}/app/paypal/kembali?o=${o.id}`,
    cancelUrl: `${base}/app/paypal/batal?o=${o.id}`,
    locale: L === 'en' ? 'en-US' : 'id-ID',
  });
  await store.cas<Order>(orderKey(o.id), (x) => (x ? { ...x, method: 'paypal', paypal: { ...x.paypal, orderId: created.id, mode: d.mode, status: 'CREATED', at: Date.now() } } : null));
  await store.put(ppIndex(created.id), { orderId: o.id, mode: d.mode });
  // Pemeriksaan otomatis (pemilik, 8 Nov 2026: „webhook di buat dari sisi anda, jadi ga perlu webhook dr paypal“).
  await store.put(openKey(o.id), {}, { at: Date.now(), next: Date.now() + 20_000 });
  return created.approveUrl;
}

/**
 * „Webhook dari sisi kita“: cron memeriksa sendiri order PayPal yang belum lunas (member menutup jendela sebelum kembali,
 * atau webhook PayPal tidak terpasang). Disetujui → capture → token masuk; sudah COMPLETED → dilunasi; > 72 jam → dilepas.
 * ID PayPal selalu yang tersimpan di pesanan kita. Jadwal mundur: tiap menit (10 menit pertama), tiap 3 menit (1 jam),
 * lalu tiap 20 menit.
 */
export async function reconcilePaypal(env: Env, store: Store, now = Date.now()): Promise<number> {
  const { items } = await store.list<{ at?: number; next?: number }>('i/paypal-open/', { limit: 25 });
  if (!items.length) return 0;
  const d = await getPaypal(env, store);
  let credited = 0;
  for (const it of items) {
    const at = Number(it.meta.at) || now;
    if ((Number(it.meta.next) || 0) > now) continue;
    const o = await store.get<Order>(orderKey(it.id));
    const ppId = o?.paypal?.orderId;
    if (!o || !ppId || !OPEN.includes(o.status)) {
      await store.del(openKey(it.id));
      continue;
    }
    if (now - at > 72 * 3600_000) {
      await store.del(openKey(it.id));
      await audit(store, 'paypal:auto', 'paypal.expired', { orderId: o.id });
      continue;
    }
    const age = now - at;
    const later = async (ms: number) => store.put(openKey(o.id), {}, { at, next: now + ms });
    const dm = { ...d, mode: o.paypal?.mode ?? d.mode };
    if (!dm[dm.mode]) {
      await later(20 * 60_000);
      continue;
    }
    try {
      let st = await getPaypalOrder(env, dm, ppId);
      if (st.status === 'APPROVED') st = await capturePaypalOrder(env, dm, ppId, o.id);
      if (st.status === 'COMPLETED') {
        if (st.customId && st.customId !== o.id) {
          await audit(store, 'paypal:auto', 'paypal.mismatch', { orderId: o.id, customId: st.customId });
          await store.del(openKey(o.id));
          continue;
        }
        if ((await settlePaypal(store, o.id, st, 'paypal:auto')) === 'credited') credited += 1;
        else await later(5 * 60_000);
      } else if (st.status === 'VOIDED' || st.status === 'DECLINED') {
        await store.del(openKey(o.id));
      } else {
        await later(age < 10 * 60_000 ? 60_000 : age < 3600_000 ? 3 * 60_000 : 20 * 60_000);
      }
    } catch (err) {
      if (err instanceof PaypalError && (err.code === 'RESOURCE_NOT_FOUND' || err.status === 404)) await store.del(openKey(o.id));
      else await later(5 * 60_000);
    }
  }
  return credited;
}

export function registerMemberPaypal(app: Hono<HonoEnv>): void {
  /** (Ulang) bayar invoice yang belum lunas dengan PayPal. */
  app.post('/app/pesanan/:id/paypal', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const o = await store.get<Order>(orderKey(c.req.param('id')));
    if (!o || o.uid !== user.id || !OPEN.includes(o.status) || o.currency !== 'USD') return c.redirect(`/app/pesanan/${c.req.param('id')}`);
    try {
      return c.redirect(await startPaypal(c as Ctx, o));
    } catch (err) {
      await audit(store, user.id, 'paypal.start_failed', { orderId: o.id, error: String(err instanceof Error ? err.message : err).slice(0, 200) });
      return c.redirect(`/app/pesanan/${o.id}?err=paypal`);
    }
  });

  /** Kembali dari PayPal setelah menyetujui: capture di server, lalu token masuk. */
  app.get('/app/paypal/kembali', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const id = c.req.query('o') ?? '';
    const token = c.req.query('token') ?? '';
    const o = await store.get<Order>(orderKey(id));
    if (!o || o.uid !== user.id) return c.redirect('/app/pesanan');
    if (o.status === 'credited') return c.redirect(`/app/pesanan/${o.id}?ok=paid`);
    if (!o.paypal?.orderId || o.paypal.orderId !== token) return c.redirect(`/app/pesanan/${o.id}?err=paypal`);
    // ID PayPal yang dipakai untuk capture selalu yang tersimpan di pesanan kita (dari jawaban PayPal saat dibuat),
    // bukan nilai dari alamat kembali — parameter `token` hanya dicocokkan.
    const ppOrderId = o.paypal.orderId;
    try {
      const d = await getPaypal(c.env, store);
      const cap = await capturePaypalOrder(c.env, { ...d, mode: o.paypal.mode ?? d.mode }, ppOrderId, o.id);
      if (cap.customId && cap.customId !== o.id) return c.redirect(`/app/pesanan/${o.id}?err=paypal`);
      const r = await settlePaypal(store, o.id, cap, `paypal:${user.id}`);
      return c.redirect(`/app/pesanan/${o.id}?${r === 'credited' ? 'ok=paid' : r === 'pending' ? 'ok=paypal-pending' : 'err=paypal'}`);
    } catch (err) {
      await audit(store, user.id, 'paypal.capture_failed', { orderId: o.id, error: String(err instanceof Error ? err.message : err).slice(0, 200) });
      return c.redirect(`/app/pesanan/${o.id}?err=paypal`);
    }
  });

  app.get('/app/paypal/batal', (c) => c.redirect(`/app/pesanan/${encodeURIComponent(c.req.query('o') ?? '')}?ok=paypal-cancel`));
}

/** Webhook PayPal (tanpa sesi): hanya peristiwa yang tanda tangannya diverifikasi PayPal yang diproses. */
export function registerPaypalWebhook(app: Hono<HonoEnv>): void {
  // Kunci publik untuk mengenkripsi seed kredensial (paypal-seed.yml). Aman dibagikan: hanya kunci publik.
  app.get('/api/paypal/seed-key', async (c) => {
    if (!c.env.MASTER_KEY) return c.json({ error: 'unavailable' }, 503);
    return c.json(await seedPublicKey(c.env, c.get('store')), 200, { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' });
  });
  // Uji koneksi PayPal tanpa sesi (dipakai paypal-seed.yml setelah menanam kredensial). Paling sering sekali per menit;
  // hanya mengembalikan berhasil/gagal + pesan PayPal — tidak pernah kredensial.
  app.post('/api/paypal/check', async (c) => {
    if (!c.env.MASTER_KEY) return c.json({ error: 'unavailable' }, 503);
    if (!(await limit(c.env, 'paypal-check', 1, 60))) return c.json({ error: 'rate' }, 429);
    const d = await checkPaypal(c.env, c.get('store'), hookUrlOf(c.env, new URL(c.req.url).origin));
    return c.json({ enabled: d.enabled, mode: d.mode, ready: paypalReady(d), sandbox: d.tests?.sandbox ?? null, live: d.tests?.live ?? null, pendingActivate: d.pendingActivate ?? null }, 200, { 'cache-control': 'no-store' });
  });
  app.post('/api/paypal/webhook', async (c) => {
    const store = c.get('store');
    const raw = await c.req.text();
    if (raw.length > 200_000) return c.text('too large', 413);
    let event: { id?: string; event_type?: string; resource?: Record<string, unknown> };
    try {
      event = JSON.parse(raw);
    } catch {
      return c.text('bad json', 400);
    }
    const d = await getPaypal(c.env, store);
    let ok = false;
    try {
      ok = await verifyWebhook(c.env, d, c.req.raw.headers, event);
    } catch {
      ok = false;
    }
    if (!ok) return c.text('signature', 400);
    // Satu peristiwa diproses sekali (PayPal bisa mengirim ulang).
    if (event.id && !(await store.createOnce(`u/paypal-event/${event.id}`, { at: Date.now(), type: event.event_type }))) return c.text('ok');
    const res = event.resource ?? {};
    const related = (res.supplementary_data as { related_ids?: { order_id?: string } } | undefined)?.related_ids?.order_id;
    const ppOrderId = event.event_type === 'CHECKOUT.ORDER.APPROVED' ? String(res.id ?? '') : String(related ?? '');
    const idx = ppOrderId ? await store.get<{ orderId: string; mode: PaypalMode }>(ppIndex(ppOrderId)) : null;
    const orderId = String(res.custom_id ?? idx?.orderId ?? '');
    if (!orderId) return c.text('ok');
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' && ppOrderId) {
      // Member menyetujui tetapi menutup jendela sebelum kembali: capture dari server — hanya untuk pesanan kita yang memang
      // terhubung ke order PayPal ini, dan selalu memakai ID yang tersimpan di pesanan (bukan nilai dari isi webhook).
      const o = await store.get<Order>(orderKey(orderId));
      const stored = o?.paypal?.orderId;
      if (o && stored && stored === ppOrderId) {
        try {
          const cap = await capturePaypalOrder(c.env, { ...d, mode: o.paypal?.mode ?? idx?.mode ?? d.mode }, stored, o.id);
          await settlePaypal(store, o.id, cap, 'paypal:webhook');
        } catch {
          /* dicoba lagi lewat PAYMENT.CAPTURE.COMPLETED */
        }
      }
    } else if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const amount = res.amount as { value?: string; currency_code?: string } | undefined;
      await settlePaypal(store, orderId, { captureId: String(res.id ?? ''), amount: amount?.value ?? '', currency: amount?.currency_code ?? '', status: 'COMPLETED' }, 'paypal:webhook');
    } else if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED' || event.event_type === 'PAYMENT.CAPTURE.REVERSED') {
      // Dana kembali ke pembeli: tandai pesanan, tarik token yang belum terpakai (sebatas saldo), beri tahu admin.
      const o = await store.get<Order>(orderKey(orderId));
      if (o && !o.paypal?.refunded) {
        await store.cas<Order>(orderKey(orderId), (x) => (x ? { ...x, paypal: { ...x.paypal, refunded: true, status: event.event_type, at: Date.now() } } : null));
        if (o.kind !== 'deposit' && o.tokens > 0) await credit(store, o.uid, -o.tokens, 'admin', `PayPal ${event.event_type === 'PAYMENT.CAPTURE.REFUNDED' ? 'refund' : 'reversal'} ${invoiceNo(o)}`, `paypal-refund:${o.id}`, 'paypal');
        await audit(store, 'paypal:webhook', 'paypal.refund', { orderId, type: event.event_type });
        await store.createOnce(`i/loss/paypal-${orderId}`, {}, { at: Date.now(), refund: true });
      }
    }
    return c.text('ok');
  });
}

/* ── Admin → PayPal ───────────────────────────────────────────────────── */

const maskRow = (L: Lang, d: PaypalDoc, m: PaypalMode) => {
  const cr = d[m];
  return cr
    ? html`<p class="muted small">${tr(L, `Client ID •••• ${cr.idLast4} · Secret •••• ${cr.secretLast4} · disimpan ${new Date(cr.savedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC`, `Client ID •••• ${cr.idLast4} · Secret •••• ${cr.secretLast4} · saved ${new Date(cr.savedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC`)}</p>`
    : html`<p class="muted small">${tr(L, 'Belum diisi.', 'Not set yet.')}</p>`;
};

export function registerAdminPaypal(admin: Hono<HonoEnv>, shell: (c: Ctx, title: string, body: unknown, active: string) => string): void {
  admin.get('/admin/paypal', async (c) => {
    const L = portalLang(c);
    const store = c.get('store');
    const d = await getPaypal(c.env, store);
    const hook = `${originOf(c as Ctx)}/api/paypal/webhook`;
    const ok = c.req.query('ok');
    const err = c.req.query('err');
    const body = html`
    ${pageHead(tr(L, 'PayPal', 'PayPal'), tr(L, 'Bayar cepat tanpa unggah bukti. Kredensial disimpan terenkripsi; hanya 4 karakter terakhir yang ditampilkan. Disarankan untuk member luar negeri.', 'Fast payment without uploading proof. Credentials are stored encrypted; only the last 4 characters are shown. Suggested for members abroad.'))}
    ${flash(L, ok ? decodeURIComponent(ok) : null, err ? decodeURIComponent(err) : null)}
    <form method="post" action="/admin/paypal" class="card form reveal" data-paypal-settings>
      <input type="hidden" name="act" value="settings">
      <h3>${tr(L, 'Status', 'Status')}</h3>
      <label class="check"><input type="checkbox" name="enabled" value="1" ${d.enabled ? 'checked' : ''}> <span>${tr(L, 'Aktifkan PayPal untuk member', 'Enable PayPal for members')}</span></label>
      <div class="grid g2">
        <label class="check"><input type="radio" name="mode" value="sandbox" ${d.mode === 'sandbox' ? 'checked' : ''}> <span>Sandbox ${tr(L, '(uji coba, uang tiruan)', '(testing, fake money)')}</span></label>
        <label class="check"><input type="radio" name="mode" value="live" ${d.mode === 'live' ? 'checked' : ''}> <span>Live ${tr(L, '(uang sungguhan)', '(real money)')}</span></label>
      </div>
      <p class="${paypalReady(d) ? 'pos' : 'muted'}">${paypalReady(d) ? tr(L, `✓ PayPal aktif — mode ${d.mode}.`, `✓ PayPal is on — ${d.mode} mode.`) : tr(L, 'PayPal belum aktif (centang Aktifkan dan isi kredensial mode yang dipilih).', 'PayPal is off (tick Enable and fill in the credentials of the chosen mode).')}</p>
      <button class="btn btn-primary" type="submit">${tr(L, 'Simpan status', 'Save status')}</button>
    </form>
    <div class="grid g2">${(['sandbox', 'live'] as PaypalMode[]).map((m) => html`
      <section class="card reveal" data-paypal-mode="${m}">
        <h3>${m === 'sandbox' ? 'Sandbox' : 'Live'}</h3>
        ${maskRow(L, d, m)}
        ${d.tests?.[m] ? html`<p class="${d.tests[m]!.ok ? 'pos' : 'neg'} small" data-paypal-test="${m}">${d.tests[m]!.ok ? '✓' : '✗'} ${d.tests[m]!.msg} <span class="muted">(${new Date(d.tests[m]!.at).toISOString().slice(0, 16).replace('T', ' ')} UTC)</span></p>` : ''}
        <form method="post" action="/admin/paypal" class="form">
          <input type="hidden" name="act" value="save"><input type="hidden" name="m" value="${m}">
          <label class="field"><span>Client ID</span><input name="clientId" autocomplete="off" spellcheck="false" maxlength="200" placeholder="${d[m] ? `•••• ${d[m]!.idLast4}` : 'A…'}" required></label>
          <label class="field"><span>Secret ${tip(tr(L, 'Disegel dengan kunci Worker sebelum disimpan; tidak pernah dikirim ke peramban.', 'Sealed with the Worker key before storage; never sent to the browser.'))}</span><input name="secret" type="password" autocomplete="new-password" maxlength="200" required></label>
          <button class="btn btn-primary btn-sm" type="submit">${d[m] ? tr(L, 'Ganti kredensial', 'Replace credentials') : tr(L, 'Simpan kredensial', 'Save credentials')}</button>
        </form>
        <div class="btn-row">
          <form method="post" action="/admin/paypal"><input type="hidden" name="act" value="test"><input type="hidden" name="m" value="${m}"><button class="btn btn-ghost btn-sm" type="submit" ${d[m] ? '' : 'disabled'}>🔌 ${tr(L, 'Uji koneksi', 'Test connection')}</button></form>
          <form method="post" action="/admin/paypal"><input type="hidden" name="act" value="webhook"><input type="hidden" name="m" value="${m}"><button class="btn btn-ghost btn-sm" type="submit" ${d[m] ? '' : 'disabled'}>🔔 ${tr(L, 'Daftarkan webhook', 'Register webhook')}</button></form>
          <form method="post" action="/admin/paypal"><input type="hidden" name="act" value="delete"><input type="hidden" name="m" value="${m}"><button class="btn btn-ghost btn-sm" type="submit" ${d[m] ? '' : 'disabled'} data-confirm="${tr(L, `Hapus kredensial ${m}?`, `Delete the ${m} credentials?`)}">🗑 ${tr(L, 'Hapus', 'Delete')}</button></form>
        </div>
        <form method="post" action="/admin/paypal" class="row-form">
          <input type="hidden" name="act" value="hookid"><input type="hidden" name="m" value="${m}">
          <label class="field grow"><span>Webhook ID ${tip(tr(L, 'Terisi otomatis lewat tombol Daftarkan webhook, atau tempel dari dasbor PayPal.', 'Filled automatically by Register webhook, or paste it from the PayPal dashboard.'))}</span><input name="hookId" value="${d.webhook?.[m] ?? ''}" maxlength="60" pattern="[A-Za-z0-9-]*"></label>
          <button class="btn btn-ghost btn-sm" type="submit">${tr(L, 'Simpan', 'Save')}</button>
        </form>
      </section>`)}</div>
    <section class="card reveal" data-paypal-auto><h3>${tr(L, 'Konfirmasi pembayaran otomatis', 'Automatic payment confirmation')}</h3>
      <p>${tr(L, 'Webhook PayPal <b>tidak wajib</b>. xscan.es memeriksa sendiri setiap order PayPal yang belum lunas (tiap menit pada 10 menit pertama, lalu makin jarang hingga 72 jam): begitu pembeli menyetujui, server melakukan capture dan token langsung masuk — walau pembeli menutup jendela sebelum kembali.', 'A PayPal webhook is <b>not required</b>. xscan.es checks every unpaid PayPal order itself (every minute for the first 10 minutes, then less often up to 72 hours): as soon as the buyer approves, the server captures and the tokens arrive — even if the buyer closes the window before returning.')}</p>
      <form method="post" action="/admin/paypal"><input type="hidden" name="act" value="check"><button class="btn btn-primary btn-sm" type="submit">🔄 ${tr(L, 'Periksa koneksi & daftarkan webhook otomatis', 'Check connection & register webhook automatically')}</button></form>
    </section>
    <section class="card reveal"><h3>${tr(L, 'Alamat webhook (opsional)', 'Webhook URL (optional)')}</h3><p><code>${hook}</code></p>
      <p class="muted small">${tr(L, 'Peristiwa: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED, PAYMENT.CAPTURE.REVERSED, CHECKOUT.ORDER.APPROVED. Tanda tangan setiap peristiwa diverifikasi PayPal sebelum diproses.', 'Events: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED, PAYMENT.CAPTURE.REVERSED, CHECKOUT.ORDER.APPROVED. Every event’s signature is verified with PayPal before processing.')}</p></section>`;
    return c.html(shell(c as Ctx, 'PayPal', body, 'paypal'));
  });

  admin.post('/admin/paypal', async (c) => {
    const L = portalLang(c);
    const store = c.get('store');
    const me = c.get('user')!;
    const f = (await c.req.parseBody()) as Record<string, string>;
    const act = String(f.act ?? '');
    const m: PaypalMode = isPaypalMode(f.m) ? f.m : 'sandbox';
    const back = (ok: string | null, err?: string) => c.redirect(`/admin/paypal?${ok ? `ok=${encodeURIComponent(ok)}` : `err=${encodeURIComponent(err ?? 'Gagal')}`}`);
    const d = await getPaypal(c.env, store);
    const save = async (next: PaypalDoc) => store.put(PAYPAL_DOC, { ...next, updatedAt: Date.now(), updatedBy: me.id });
    if (act === 'settings') {
      await save({ ...d, enabled: f.enabled === '1', mode: isPaypalMode(f.mode) ? f.mode : d.mode });
      await audit(store, me.id, 'paypal.settings', { enabled: f.enabled === '1', mode: f.mode });
      return back(tr(L, 'Status PayPal tersimpan.', 'PayPal status saved.'));
    }
    if (act === 'save') {
      const id = String(f.clientId ?? '').trim();
      const secret = String(f.secret ?? '').trim();
      if (!/^[A-Za-z0-9_-]{20,200}$/.test(id) || !/^[A-Za-z0-9_-]{20,200}$/.test(secret)) return back(null, tr(L, 'Client ID atau Secret tidak sah.', 'Invalid Client ID or Secret.'));
      await save({ ...d, [m]: await sealCreds(c.env as Env, id, secret, me.id) });
      await audit(store, me.id, 'paypal.creds_saved', { mode: m, idLast4: id.slice(-4) });
      return back(tr(L, `Kredensial ${m} tersimpan terenkripsi.`, `${m} credentials saved encrypted.`));
    }
    if (act === 'delete') {
      const next = { ...d, [m]: null, webhook: { ...d.webhook, [m]: undefined } };
      if (d.mode === m) next.enabled = false;
      await save(next);
      await audit(store, me.id, 'paypal.creds_deleted', { mode: m });
      return back(tr(L, `Kredensial ${m} dihapus.`, `${m} credentials deleted.`));
    }
    if (act === 'hookid') {
      const id = String(f.hookId ?? '').trim();
      if (id && !/^[A-Za-z0-9-]{6,60}$/.test(id)) return back(null, tr(L, 'Webhook ID tidak sah.', 'Invalid webhook ID.'));
      await save({ ...d, webhook: { ...d.webhook, [m]: id || undefined } });
      await audit(store, me.id, 'paypal.webhook_id', { mode: m });
      return back(tr(L, 'Webhook ID tersimpan.', 'Webhook ID saved.'));
    }
    if (act === 'check') {
      const r = await checkPaypal(c.env as Env, store, `${originOf(c as Ctx)}/api/paypal/webhook`);
      await audit(store, me.id, 'paypal.checked', { sandbox: r.tests?.sandbox?.ok ?? null, live: r.tests?.live?.ok ?? null });
      const bad = (['sandbox', 'live'] as PaypalMode[]).filter((x) => r.tests?.[x] && !r.tests[x]!.ok);
      return bad.length ? back(null, `${bad.join(', ')}: ${bad.map((x) => r.tests![x]!.msg).join(' | ')}`.slice(0, 300)) : back(tr(L, 'Koneksi PayPal diperiksa — lihat hasil per mode.', 'PayPal connection checked — see the result per mode.'));
    }
    if (act === 'test' || act === 'webhook') {
      try {
        const dm = { ...d, mode: m };
        await accessToken(c.env as Env, dm);
        if (act === 'test') return back(tr(L, `Koneksi ${m} berhasil — kredensial diterima PayPal.`, `${m} connection works — PayPal accepted the credentials.`));
        const id = await registerWebhook(c.env as Env, dm, `${originOf(c as Ctx)}/api/paypal/webhook`);
        await save({ ...d, webhook: { ...d.webhook, [m]: id } });
        await audit(store, me.id, 'paypal.webhook_registered', { mode: m });
        return back(tr(L, `Webhook ${m} terdaftar (${id}).`, `${m} webhook registered (${id}).`));
      } catch (err) {
        return back(null, err instanceof Error ? err.message.slice(0, 200) : 'PayPal error');
      }
    }
    return back(null);
  });
}
