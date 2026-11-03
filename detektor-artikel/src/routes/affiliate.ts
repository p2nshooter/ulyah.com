/** Halaman & aksi afiliasi: tautan /r/:kode, portal member, dan bagian admin. */
import type { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { html, type Raw } from '../lib/html.ts';
import { tr, fmtNum, fmtDate } from '../lib/i18n.ts';
import { page, pageHead, guide, flash, stat, empty, tip } from '../pages/ui.ts';
import { portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import {
  ensureAffiliate, getAffiliateSettings, uidForCode, debitAffiliate, requestPayout, creditAffiliateBack,
  DEFAULT_AFFILIATE, type Affiliate, type Payout, type AffiliateSettings,
} from '../data/affiliate.ts';
import { credit } from '../data/wallet.ts';
import { getBilling, getEngine } from '../data/settings.ts';
import { tokenPriceIdr } from '../engine/pricing.ts';
import { audit } from '../data/audit.ts';
import { newId } from '../lib/crypto.ts';

export function registerPublicAffiliate(r: Hono<HonoEnv>): void {
  r.get('/r/:code', async (c) => {
    const store = c.get('store');
    const s = await getAffiliateSettings(store);
    const code = c.req.param('code').toUpperCase();
    if (s.enabled && (await uidForCode(store, code))) {
      setCookie(c, 'tl_ref', code, { path: '/', secure: true, httpOnly: true, sameSite: 'Lax', maxAge: s.cookieDays * 86_400 });
    }
    return c.redirect(c.req.query('lang') === 'en' ? '/en' : '/');
  });
}

function shell(c: Ctx, title: string, body: Raw, active: string, area: 'app' | 'admin' = 'app'): string {
  return page({ L: portalLang(c), title, body, user: c.get('user'), area, active });
}

export function registerMemberAffiliate(app: Hono<HonoEnv>): void {
  app.get('/app/afiliasi', async (c) => {
    const L = portalLang(c);
    const user = c.get('user')!;
    const store = c.get('store');
    const s = await getAffiliateSettings(store);
    if (!s.enabled) return c.html(shell(c, tr(L, 'Afiliasi', 'Affiliate'), empty('🤝', tr(L, 'Program afiliasi sedang ditutup', 'The affiliate programme is closed'), tr(L, 'Silakan cek kembali nanti.', 'Please check back later.')), 'aff'));
    const a = await ensureAffiliate(store, user.id);
    const [billing, eng] = await Promise.all([getBilling(store), getEngine(store)]);
    const tp = Math.max(1, Math.ceil(tokenPriceIdr(billing, eng)));
    const link = `${new URL(c.req.url).origin}/r/${a.code}`;
    const { items } = await store.list(`l/aff/${user.id}/`, { limit: 30 });
    const entries: { at: number; kind: string; idr: number; note: string }[] = [];
    for (const it of items) {
      const e = await store.get<{ at: number; kind: string; idr: number; note: string }>(it.key);
      if (e) entries.push(e);
    }
    const ok = c.req.query('ok');
    const err = c.req.query('err');
    const body = html`
    ${pageHead(tr(L, 'Program afiliasi', 'Affiliate programme'), tr(L, `Dapatkan komisi ${s.ratePct}% dari setiap pembelian token oleh orang yang Anda ajak.`, `Earn ${s.ratePct}% commission on every token purchase by people you refer.`))}
    ${flash(L, ok === 'convert' ? tr(L, 'Komisi ditukar menjadi token.', 'Commission converted into tokens.') : ok === 'payout' ? tr(L, 'Permintaan pencairan terkirim ke admin.', 'Payout request sent to the admin.') : null, err === 'balance' ? tr(L, 'Saldo komisi tidak cukup.', 'Not enough commission balance.') : err === 'min' ? tr(L, `Minimal pencairan Rp ${fmtNum(L, s.minPayoutIdr)}.`, `Minimum payout Rp ${fmtNum(L, s.minPayoutIdr)}.`) : null)}
    ${guide(L, 'aff', tr(L, 'Cara kerja afiliasi', 'How the affiliate programme works'), [
      tr(L, 'Bagikan tautan Anda. Orang yang mendaftar lewat tautan itu (dalam 30 hari) terikat ke akun Anda.', 'Share your link. People who sign up through it (within 30 days) are linked to your account.'),
      tr(L, `Setiap kali mereka membeli token dan pembayarannya <b>lunas</b>, Anda mendapat <b>${s.ratePct}%</b> dari harganya.`, `Each time they buy tokens and the payment is <b>confirmed</b>, you earn <b>${s.ratePct}%</b> of the price.`),
      tr(L, 'Tukar komisi menjadi token kapan saja, atau ajukan pencairan ke rekening (diproses admin).', 'Convert commission into tokens any time, or request a payout to your bank (processed by the admin).'),
      tr(L, 'Mereferensikan akun sendiri tidak dihitung.', 'Referring your own account does not count.'),
    ])}
    <section class="card reveal"><h3>${tr(L, 'Tautan Anda', 'Your link')}</h3><div class="secret-box"><code id="refLink">${link}</code><button class="btn btn-primary btn-sm" type="button" data-copy="#refLink">${tr(L, 'Salin', 'Copy')}</button></div><p class="muted small">${tr(L, 'Kode', 'Code')}: <b>${a.code}</b></p></section>
    <div class="grid g4">
      ${stat(tr(L, 'Saldo komisi', 'Commission balance'), `Rp ${fmtNum(L, a.balanceIdr)}`)}
      ${stat(tr(L, 'Total komisi', 'Total earned'), `Rp ${fmtNum(L, a.totalIdr)}`)}
      ${stat(tr(L, 'Orang diajak', 'People referred'), fmtNum(L, a.referred))}
      ${stat(tr(L, 'Sudah dicairkan', 'Paid out'), `Rp ${fmtNum(L, a.paidIdr)}`)}
    </div>
    <div class="grid g2">
      <form method="post" action="/app/afiliasi/tukar" class="card form reveal"><h3>${tr(L, 'Tukar menjadi token', 'Convert into tokens')}</h3><p class="muted">${tr(L, `Rp ${fmtNum(L, tp)} = 1 token, langsung masuk.`, `Rp ${fmtNum(L, tp)} = 1 token, credited instantly.`)}</p><label class="field"><span>${tr(L, 'Jumlah (Rp)', 'Amount (Rp)')}</span><input type="number" name="idr" min="${tp}" max="${a.balanceIdr}" step="${tp}" required></label><button class="btn btn-primary" type="submit" ${a.balanceIdr < tp ? 'disabled' : ''}>${tr(L, 'Tukar', 'Convert')}</button></form>
      <form method="post" action="/app/afiliasi/cair" class="card form reveal"><h3>${tr(L, 'Cairkan ke rekening', 'Pay out to bank')} ${tip(tr(L, 'Admin memproses transfer lalu menandai lunas. Bila ditolak, saldo kembali.', 'The admin makes the transfer and marks it paid. If rejected, the balance returns.'))}</h3><label class="field"><span>${tr(L, 'Jumlah (Rp)', 'Amount (Rp)')}</span><input type="number" name="idr" min="${s.minPayoutIdr}" max="${a.balanceIdr}" step="1000" required></label><label class="field"><span>${tr(L, 'Bank, nomor rekening, nama pemilik', 'Bank, account number, holder name')}</span><textarea name="bank" rows="2" required maxlength="300"></textarea></label><button class="btn btn-ghost" type="submit" ${a.balanceIdr < s.minPayoutIdr ? 'disabled' : ''}>${tr(L, `Ajukan (min. Rp ${fmtNum(L, s.minPayoutIdr)})`, `Request (min. Rp ${fmtNum(L, s.minPayoutIdr)})`)}</button></form>
    </div>
    <section class="card reveal"><h3>${tr(L, 'Riwayat komisi', 'Commission history')}</h3>${entries.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Waktu', 'Time')}</th><th>${tr(L, 'Jenis', 'Kind')}</th><th class="n">Rp</th><th>${tr(L, 'Catatan', 'Note')}</th></tr></thead><tbody>${entries.map((e) => html`<tr><td><small>${fmtDate(L, e.at)}</small></td><td>${({ commission: tr(L, 'komisi', 'commission'), convert: tr(L, 'tukar token', 'to tokens'), payout: tr(L, 'pencairan', 'payout'), payout_rejected: tr(L, 'pencairan ditolak', 'payout rejected') } as Record<string, string>)[e.kind] ?? e.kind}</td><td class="n ${e.idr < 0 ? 'neg' : 'pos'}">${e.idr > 0 ? '+' : ''}${fmtNum(L, e.idr)}</td><td><small>${e.note}</small></td></tr>`)}</tbody></table></div>` : html`<p class="muted">${tr(L, 'Belum ada komisi. Bagikan tautan Anda.', 'No commission yet. Share your link.')}</p>`}</section>`;
    return c.html(shell(c, tr(L, 'Afiliasi', 'Affiliate'), body, 'aff'));
  });

  app.post('/app/afiliasi/tukar', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const [billing, eng] = await Promise.all([getBilling(store), getEngine(store)]);
    const tp = Math.max(1, Math.ceil(tokenPriceIdr(billing, eng)));
    const idrIn = Math.floor(Number((await c.req.parseBody()).idr ?? 0));
    const tokens = Math.floor(idrIn / tp);
    const idr = tokens * tp;
    const convId = newId('conv');
    if (tokens <= 0 || !(await debitAffiliate(store, user.id, idr, 'convertedIdr', `Tukar ${tokens} token (${convId})`))) return c.redirect('/app/afiliasi?err=balance');
    try {
      await credit(store, user.id, tokens, 'purchase', `Tukar komisi afiliasi Rp ${idr}`, convId);
    } catch (err) {
      // Token gagal masuk: kembalikan saldo komisi agar tidak ada yang hilang.
      await creditAffiliateBack(store, user.id, idr, `Tukar ${convId} dibatalkan`);
      throw err;
    }
    await audit(store, user.id, 'affiliate.convert', { idr, tokens });
    return c.redirect('/app/afiliasi?ok=convert');
  });

  app.post('/app/afiliasi/cair', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const s = await getAffiliateSettings(store);
    const f = await c.req.parseBody();
    const idr = Math.floor(Number(f.idr ?? 0));
    if (idr < s.minPayoutIdr) return c.redirect('/app/afiliasi?err=min');
    const p = await requestPayout(store, user.id, user.email, idr, String(f.bank ?? ''));
    if (!p) return c.redirect('/app/afiliasi?err=balance');
    await audit(store, user.id, 'affiliate.payout_requested', { id: p.id, idr });
    return c.redirect('/app/afiliasi?ok=payout');
  });
}

export function registerAdminAffiliate(admin: Hono<HonoEnv>): void {
  admin.get('/admin/afiliasi', async (c) => {
    const L = portalLang(c);
    const store = c.get('store');
    const s = await getAffiliateSettings(store);
    const { items } = await store.list('i/payouts/', { limit: 50 });
    const payouts: Payout[] = [];
    for (const it of items) {
      const p = await store.get<Payout>(`c/payouts/${it.id}.json`);
      if (p) payouts.push(p);
    }
    const body = html`
    ${pageHead(tr(L, 'Afiliasi', 'Affiliate'), tr(L, 'Komisi dihitung otomatis saat pesanan ditandai lunas — tepat sekali per pesanan.', 'Commission is computed automatically when an order is marked paid — exactly once per order.'))}
    ${flash(L, c.req.query('ok') ? tr(L, 'Tersimpan.', 'Saved.') : null, null)}
    <form method="post" action="/admin/afiliasi" class="card form reveal"><h3>${tr(L, 'Setelan program', 'Programme settings')}</h3>
      <div class="grid g4">
        <label class="check"><input type="checkbox" name="enabled" ${s.enabled ? 'checked' : ''}> <span>${tr(L, 'Program tampil & aktif', 'Programme shown & active')}</span></label>
        <label class="field"><span>${tr(L, 'Komisi (%)', 'Commission (%)')}</span><input type="number" name="ratePct" min="0" max="50" step="0.5" value="${s.ratePct}"></label>
        <label class="field"><span>${tr(L, 'Minimal pencairan (Rp)', 'Minimum payout (Rp)')}</span><input type="number" name="minPayoutIdr" min="0" step="1000" value="${s.minPayoutIdr}"></label>
        <label class="field"><span>${tr(L, 'Masa cookie (hari)', 'Cookie days')}</span><input type="number" name="cookieDays" min="1" max="365" value="${s.cookieDays}"></label>
      </div><button class="btn btn-primary" type="submit">${tr(L, 'Simpan', 'Save')}</button></form>
    <section class="card reveal"><h3>${tr(L, 'Permintaan pencairan', 'Payout requests')}</h3>
    ${payouts.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Tanggal', 'Date')}</th><th>E-mail</th><th class="n">Rp</th><th>${tr(L, 'Rekening', 'Bank')}</th><th>Status</th><th></th></tr></thead><tbody>${payouts.map((p) => html`<tr><td><small>${fmtDate(L, p.createdAt)}</small></td><td>${p.email}</td><td class="n">${fmtNum(L, p.idr)}</td><td><small>${p.bank}</small></td><td><span class="pill ${p.status === 'paid' ? 'p-hum' : p.status === 'rejected' ? 'p-unk' : 'p-mix'}">${p.status}</span></td><td>${p.status === 'requested' ? html`<form method="post" action="/admin/afiliasi/cair/${p.id}" class="btn-row"><button class="btn btn-primary btn-sm" name="act" value="paid" data-confirm="${tr(L, 'Transfer sudah dikirim?', 'Has the transfer been sent?')}">${tr(L, 'Sudah ditransfer', 'Mark paid')}</button><button class="btn btn-ghost btn-sm" name="act" value="reject">${tr(L, 'Tolak', 'Reject')}</button></form>` : ''}</td></tr>`)}</tbody></table></div>` : html`<p class="muted">${tr(L, 'Belum ada permintaan.', 'No requests yet.')}</p>`}</section>`;
    return c.html(shell(c, tr(L, 'Afiliasi', 'Affiliate'), body, 'aff', 'admin'));
  });

  admin.post('/admin/afiliasi', async (c) => {
    const store = c.get('store');
    const f = (await c.req.parseBody()) as Record<string, string>;
    const num = (k: string, d: number, lo: number, hi: number) => {
      const v = Number(f[k]);
      return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
    };
    const next: AffiliateSettings = {
      enabled: Boolean(f.enabled),
      ratePct: num('ratePct', DEFAULT_AFFILIATE.ratePct, 0, 50),
      minPayoutIdr: Math.round(num('minPayoutIdr', DEFAULT_AFFILIATE.minPayoutIdr, 0, 1e9)),
      cookieDays: Math.round(num('cookieDays', DEFAULT_AFFILIATE.cookieDays, 1, 365)),
    };
    await store.put('k/affiliate.json', next);
    await audit(store, c.get('user')!.id, 'affiliate.settings', { ...next });
    return c.redirect('/admin/afiliasi?ok=1');
  });

  admin.post('/admin/afiliasi/cair/:id', async (c) => {
    const store = c.get('store');
    const act = String((await c.req.parseBody()).act ?? '');
    let rejected: Payout | null = null;
    await store.cas<Payout>(`c/payouts/${c.req.param('id')}.json`, (p) => {
      rejected = null;
      if (!p || p.status !== 'requested') return null;
      if (act === 'reject') rejected = p;
      return { ...p, status: act === 'paid' ? 'paid' : 'rejected', doneAt: Date.now(), by: c.get('user')!.id };
    });
    const r = rejected as Payout | null;
    if (r) await creditAffiliateBack(store, r.uid, r.idr, `Pencairan ${r.id} ditolak`);
    await audit(store, c.get('user')!.id, `affiliate.payout_${act}`, { id: c.req.param('id') });
    return c.redirect('/admin/afiliasi?ok=1');
  });
}

export type { Affiliate };
