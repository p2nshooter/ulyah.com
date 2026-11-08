/**
 * Pembayaran manual & invoice (member + admin).
 * Member: pesan paket (IDR atau USD) → invoice + cara transfer (dalam & luar negeri) → unggah bukti transfer.
 * Admin: antrean verifikasi → lihat bukti → setujui (token masuk + komisi afiliasi, idempoten) atau tolak dengan alasan.
 */
import type { Hono } from 'hono';
import { html, raw, type Raw } from '../lib/html.ts';
import { tr, fmtNum, fmtDate, type Lang } from '../lib/i18n.ts';
import { page, pageHead, flash, empty, tip, LOGO, BRAND, TAGLINE } from '../pages/ui.ts';
import { portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import { getBilling, getEngine } from '../data/settings.ts';
import { packagePrice, tokenPriceIdr } from '../engine/pricing.ts';
import { bi } from '../engine/rubrics.ts';
import { credit } from '../data/wallet.ts';
import { getUser } from '../data/users.ts';
import { getAffiliateSettings, payCommission } from '../data/affiliate.ts';
import { addStats } from '../data/stats.ts';
import { audit } from '../data/audit.ts';
import { newId } from '../lib/crypto.ts';
import { invTs, type Store } from '../lib/store.ts';
import { limit } from '../lib/ratelimit.ts';
import { topUp, spendForTokens, DepositInsufficientError } from '../data/deposit.ts';
import { schedulePurge } from '../data/purge.ts';
import {
  orderKey, reviewKey, invoiceNo, currencyOf, amountOf, fmtMoney, isDeposit, sniffProof, getPayment, isCurrency,
  MAX_PROOFS, MAX_PROOF_BYTES, MAX_OPEN_ORDERS, OPEN, PAYMENT_DOC, DEFAULT_PAYMENT,
  type Order, type OrderStatus, type Proof, type Currency, type PaymentSettings,
} from '../data/orders.ts';

/* ── teks bersama ───────────────────────────────────────────────────── */

/** Pemberitahuan wajib (pemilik, 2 Nov 2026): saldo token tidak bisa diuangkan. */
export function noCashNotice(L: Lang): Raw {
  return html`<div class="notice-cash noprint" role="note"><b>ⓘ ${tr(L, 'Saldo token tidak bisa diuangkan.', 'Token balance cannot be cashed out.')}</b> ${tr(L, 'Token yang sudah dibeli, sisa saldo, dan token yang kembali dari pemeriksaan hanya bisa dipakai untuk memeriksa naskah di situs ini — tidak bisa ditukar menjadi uang, dikembalikan ke rekening, atau dipindahkan ke akun lain. (Komisi afiliasi berbeda: bisa dicairkan sesuai ketentuan program afiliasi.)', 'Purchased tokens, the remaining balance and tokens returned from checks can only be used to check texts on this site — they cannot be exchanged for money, refunded to a bank account or moved to another account. (Affiliate commission is different: it can be paid out under the affiliate programme rules.)')}</div>`;
}

export function statusPill(L: Lang, s: OrderStatus): Raw {
  const map: Record<OrderStatus, [string, string, string]> = {
    pending: ['p-mix', 'Menunggu pembayaran', 'Awaiting payment'],
    review: ['p-unk', 'Bukti sedang diperiksa', 'Proof under review'],
    credited: ['p-hum', 'LUNAS · token masuk', 'PAID · tokens added'],
    rejected: ['p-ai', 'Bukti ditolak — unggah ulang', 'Proof rejected — upload again'],
    cancelled: ['p-unk', 'Dibatalkan', 'Cancelled'],
  };
  const [cls, id, en] = map[s];
  return html`<span class="pill ${cls}">${tr(L, id, en)}</span>`;
}

const pkgLabel = (L: Lang, o: Order) => (o.kind === 'deposit' ? tr(L, 'Deposit Rupiah', 'Rupiah deposit') : o.pkgName ? bi(L, o.pkgName) : o.pkg);

/* ── invoice ────────────────────────────────────────────────────────── */

export function invoicePaper(L: Lang, o: Order, pay: PaymentSettings): Raw {
  const cur = currencyOf(o);
  const total = amountOf(o);
  const list = cur === 'USD' ? o.listUsd : o.listIdr;
  const disc = list && list > total ? list - total : 0;
  const paid = o.status === 'credited';
  return html`<article class="paper invoice" id="invoice">
  ${paid ? html`<div class="stamp" aria-hidden="true">${tr(L, 'LUNAS', 'PAID')}</div>` : ''}
  <header class="inv-head">
    <div class="inv-brand">${LOGO}<div><b>${BRAND}</b><small>xscan.es · ${TAGLINE}</small></div></div>
    <div class="inv-title"><h2>INVOICE</h2><p class="inv-no">${invoiceNo(o)}</p>${statusPill(L, o.status)}</div>
  </header>
  <div class="inv-parties">
    <div><h5 class="first">${tr(L, 'Dari', 'From')}</h5><p><b>xscan.es — ${BRAND}</b><br>hello@axto.io</p></div>
    <div><h5 class="first">${tr(L, 'Kepada', 'Bill to')}</h5><p><b>${o.name ?? o.email}</b><br>${o.email}</p></div>
    <div><h5 class="first">${tr(L, 'Rincian', 'Details')}</h5><dl class="kv tight"><dt>${tr(L, 'Tanggal', 'Date')}</dt><dd>${fmtDate(L, o.createdAt, false)}</dd><dt>${tr(L, 'No. pesanan', 'Order no.')}</dt><dd><small>${o.id}</small></dd><dt>${tr(L, 'Mata uang', 'Currency')}</dt><dd>${cur}</dd>${o.creditedAt ? html`<dt>${tr(L, 'Lunas', 'Paid')}</dt><dd>${fmtDate(L, o.creditedAt)}</dd>` : ''}</dl></div>
  </div>
  <table class="tbl inv-lines"><thead><tr><th>${tr(L, 'Uraian', 'Description')}</th><th class="n">${tr(L, 'Jumlah', 'Qty')}</th><th class="n">${tr(L, 'Nilai', 'Amount')}</th></tr></thead>
  <tbody>
    ${isDeposit(o)
      ? html`<tr><td><b>${tr(L, 'Isi saldo deposit Rupiah', 'Rupiah deposit top-up')}</b><br><small class="muted">${tr(L, 'Untuk membeli paket token atau ditukar menjadi token (tidak bisa diuangkan)', 'For buying token packages or converting into tokens (not cashable)')}</small></td><td class="n">1</td><td class="n">${fmtMoney(L, cur, total)}</td></tr>`
      : html`<tr><td><b>${tr(L, 'Paket token', 'Token package')} ${pkgLabel(L, o)}</b><br><small class="muted">${tr(L, 'Token pemeriksaan AI Content Analyzer (tidak bisa diuangkan)', 'AI Content Analyzer checking tokens (not cashable)')}</small></td><td class="n">${fmtNum(L, o.tokens)} token</td><td class="n">${fmtMoney(L, cur, list && list >= total ? list : total)}</td></tr>`}
    ${disc > 0 ? html`<tr><td>${tr(L, `Diskon paket ${o.discountPct ?? 0}%`, `Package discount ${o.discountPct ?? 0}%`)}</td><td></td><td class="n">− ${fmtMoney(L, cur, Math.round(disc * 100) / 100)}</td></tr>` : ''}
  </tbody>
  <tfoot><tr><th colspan="2">${tr(L, 'Total yang dibayar', 'Total due')}</th><th class="n inv-total">${fmtMoney(L, cur, total)}</th></tr>
  ${cur === 'USD' ? html`<tr><td colspan="3" class="muted small">${tr(L, `Bila dibayar dalam Rupiah lewat layanan kiriman uang: ${fmtMoney(L, 'IDR', o.priceIdr)}.`, `If paid in Rupiah through a money-transfer service: ${fmtMoney(L, 'IDR', o.priceIdr)}.`)}</td></tr>` : ''}</tfoot></table>
  <div class="inv-pay"><h5>${tr(L, 'Pembayaran', 'Payment')}</h5>
    <p>${tr(L, 'Transfer bank ke', 'Bank transfer to')} <b>${pay.bankName}</b> · ${tr(L, 'a.n.', 'beneficiary')} <b>${pay.beneficiary}</b> · ${cur === 'USD' ? html`USD <b>${pay.accountUsd}</b> · SWIFT <b>${pay.swift}</b>` : html`IDR <b>${pay.accountIdr}</b>`}</p>
    <p class="muted small">${isDeposit(o) ? tr(L, 'Saldo deposit bertambah setelah dana diverifikasi admin — tepat sekali, tercatat di riwayat deposit. Saldo deposit dan saldo token tidak bisa diuangkan. Invoice ini dibuat secara elektronik.', 'The deposit balance increases after the admin verifies the funds — exactly once, recorded in the deposit history. Deposit and token balances cannot be cashed out. This invoice was generated electronically.') : tr(L, 'Token masuk ke akun setelah dana diverifikasi admin — tepat sekali, tercatat di buku besar token. Saldo token tidak bisa diuangkan. Invoice ini dibuat secara elektronik.', 'Tokens are added after the admin verifies the funds — exactly once, recorded in the token ledger. Token balance cannot be cashed out. This invoice was generated electronically.')}</p>
  </div>
</article>`;
}

function copyRow(label: string, value: string, id: string): Raw {
  return html`<div class="copyrow"><span>${label}</span><code id="${id}">${value}</code><button type="button" class="btn btn-ghost btn-xs" data-copy="#${id}">⧉</button></div>`;
}

/** Cara membayar: rekening + langkah, berbeda untuk IDR (dalam negeri) dan USD (luar negeri). */
export function payGuide(L: Lang, o: Order, pay: PaymentSettings): Raw {
  const inv = invoiceNo(o);
  const cur = currencyOf(o);
  const wa = pay.whatsapp.replace(/\D/g, '');
  const idrBox = html`<div class="paybox">
    ${copyRow(tr(L, 'Bank', 'Bank'), `${pay.bankName}${pay.bankCode ? ` (${tr(L, 'kode', 'code')} ${pay.bankCode})` : ''}`, 'payBankI')}
    ${copyRow(tr(L, 'No. rekening IDR', 'IDR account no.'), pay.accountIdr, 'payAccI')}
    ${copyRow(tr(L, 'Atas nama', 'Account name'), pay.beneficiary, 'payNameI')}
    ${copyRow(tr(L, 'Nominal tepat', 'Exact amount'), String(o.priceIdr), 'payAmtI')}
    ${copyRow(tr(L, 'Berita / keterangan', 'Transfer note'), inv, 'payRefI')}
  </div>`;
  if (cur === 'IDR') {
    return html`<section class="card reveal noprint"><h3>💳 ${tr(L, 'Cara membayar (Rupiah)', 'How to pay (Rupiah)')}</h3>
    ${idrBox}
    <ol class="steps-mini">
      <li>${tr(L, 'Buka m-banking, internet banking, atau ATM bank apa pun. Pilih transfer ke bank lain (BI-FAST / online) — atau sesama BNI.', 'Open mobile banking, internet banking or any ATM. Choose transfer to another bank (BI-FAST / online) — or BNI-to-BNI.')}</li>
      <li>${raw(tr(L, `Masukkan rekening <b>${pay.accountIdr}</b> (BNI, a.n. <b>${pay.beneficiary}</b>). Pastikan nama penerima yang muncul sesuai.`, `Enter account <b>${pay.accountIdr}</b> (BNI, name <b>${pay.beneficiary}</b>). Check that the beneficiary name shown matches.`))}</li>
      <li>${raw(tr(L, `Transfer <b>tepat ${fmtMoney(L, 'IDR', o.priceIdr)}</b> dan tulis <b>${inv}</b> di berita transfer.`, `Transfer <b>exactly ${fmtMoney(L, 'IDR', o.priceIdr)}</b> and write <b>${inv}</b> in the transfer note.`))}</li>
      <li>${tr(L, 'Simpan bukti transfer (tangkapan layar atau PDF), lalu unggah di formulir di bawah. Admin memeriksa dana masuk, lalu token langsung masuk ke akun Anda.', 'Keep the transfer receipt (screenshot or PDF), then upload it with the form below. The admin checks the incoming funds, then the tokens go straight into your account.')}</li>
    </ol>
    ${wa ? html`<p class="muted small">${tr(L, 'Ada kendala? WhatsApp', 'Need help? WhatsApp')} <a href="https://wa.me/${wa}?text=${encodeURIComponent(inv)}" rel="noopener">+${wa}</a></p>` : ''}
    ${pay.note ? html`<p class="pre muted">${pay.note}</p>` : ''}
    </section>`;
  }
  return html`<section class="card reveal noprint"><h3>🌍 ${tr(L, 'Cara membayar dari luar negeri (USD)', 'How to pay from abroad (USD)')}</h3>
  <p class="muted">${tr(L, 'Pilih salah satu cara. Keduanya sampai ke rekening yang sama atas nama penerima di bawah.', 'Choose one way. Both reach the same beneficiary below.')}</p>
  <div class="grid g2">
    <div class="payopt"><h4>A · ${tr(L, 'Transfer bank internasional (SWIFT) dalam USD', 'International bank wire (SWIFT) in USD')}</h4>
      <div class="paybox">
        ${copyRow('Beneficiary name', pay.beneficiary, 'payNameU')}
        ${copyRow(tr(L, 'No. rekening USD', 'USD account no.'), pay.accountUsd, 'payAccU')}
        ${copyRow('Bank', pay.bankName, 'payBankU')}
        ${copyRow('SWIFT / BIC', pay.swift, 'paySwift')}
        ${pay.bankAddress ? copyRow(tr(L, 'Alamat bank', 'Bank address'), pay.bankAddress, 'payBankAddr') : ''}
        ${pay.beneficiaryAddress ? copyRow(tr(L, 'Alamat penerima', 'Beneficiary address'), pay.beneficiaryAddress, 'payBenAddr') : ''}
        ${copyRow(tr(L, 'Jumlah', 'Amount'), `USD ${o.priceUsd}`, 'payAmtU')}
        ${copyRow(tr(L, 'Referensi', 'Reference'), inv, 'payRefU')}
      </div>
      <ol class="steps-mini">
        <li>${tr(L, 'Di aplikasi atau kantor bank Anda, pilih International transfer / SWIFT wire, negara tujuan Indonesia, mata uang USD.', 'In your banking app or branch choose International transfer / SWIFT wire, destination country Indonesia, currency USD.')}</li>
        <li>${tr(L, 'Isi data penerima persis seperti kotak di atas (nama, nomor rekening USD, bank, SWIFT/BIC).', 'Fill in the beneficiary exactly as shown above (name, USD account number, bank, SWIFT/BIC).')}</li>
        <li>${raw(tr(L, `Pada pilihan biaya pilih <b>OUR</b> (pengirim menanggung semua biaya) supaya yang tiba tetap <b>US$${o.priceUsd}</b>. Bila bank Anda hanya menyediakan SHA/BEN, tambahkan biaya bank perantara agar jumlah yang tiba tidak kurang.`, `For charges choose <b>OUR</b> (sender pays all fees) so that <b>US$${o.priceUsd}</b> arrives in full. If your bank only offers SHA/BEN, add the intermediary bank fee so the amount received is not short.`))}</li>
        <li>${raw(tr(L, `Tulis <b>${inv}</b> di kolom referensi / remittance information.`, `Write <b>${inv}</b> in the reference / remittance information field.`))}</li>
        <li>${tr(L, 'Simpan bukti transfer (receipt atau MT103), lalu unggah di bawah. Transfer SWIFT biasanya tiba dalam 1–5 hari kerja.', 'Keep the transfer receipt (or MT103), then upload it below. SWIFT transfers usually arrive within 1–5 business days.')}</li>
      </ol>
    </div>
    <div class="payopt"><h4>B · ${tr(L, 'Layanan kiriman uang ke rekening Rupiah', 'Money-transfer service to the Rupiah account')}</h4>
      <p class="muted small">${tr(L, 'Untuk nominal kecil, layanan seperti Wise, Remitly, atau WorldRemit (kirim ke rekening bank di Indonesia) biasanya lebih murah daripada SWIFT.', 'For small amounts, services such as Wise, Remitly or WorldRemit (send to a bank account in Indonesia) are usually cheaper than SWIFT.')}</p>
      ${idrBox}
      <ol class="steps-mini">
        <li>${raw(tr(L, `Pilih kirim ke Indonesia, penerima menerima dalam <b>IDR</b> ke rekening bank BNI di atas.`, `Choose send to Indonesia, recipient gets <b>IDR</b> into the BNI bank account above.`))}</li>
        <li>${raw(tr(L, `Atur supaya penerima menerima <b>tepat ${fmtMoney(L, 'IDR', o.priceIdr)}</b> (setara tagihan US$${o.priceUsd}).`, `Set it so the recipient gets <b>exactly ${fmtMoney(L, 'IDR', o.priceIdr)}</b> (equal to the US$${o.priceUsd} invoice).`))}</li>
        <li>${raw(tr(L, `Tulis <b>${inv}</b> sebagai referensi bila tersedia, lalu unggah bukti transfernya di bawah.`, `Use <b>${inv}</b> as the reference if available, then upload the receipt below.`))}</li>
      </ol>
    </div>
  </div>
  <p class="muted small">${tr(L, 'Token masuk setelah dana yang tiba sesuai tagihan. Biaya transfer dan selisih kurs ditanggung pengirim.', 'Tokens are added once the funds received match the invoice. Transfer fees and exchange differences are borne by the sender.')}${wa ? html` ${tr(L, 'Ada kendala? WhatsApp', 'Need help? WhatsApp')} <a href="https://wa.me/${wa}?text=${encodeURIComponent(inv)}" rel="noopener">+${wa}</a>` : ''}</p>
  ${pay.note ? html`<p class="pre muted">${pay.note}</p>` : ''}
  </section>`;
}

function proofList(L: Lang, o: Order, base: string): Raw {
  const ps = o.proofs ?? [];
  if (!ps.length) return html`<p class="muted">${tr(L, 'Belum ada bukti transfer.', 'No transfer proof yet.')}</p>`;
  return html`<ul class="proofs">${ps.map((p, i) => html`<li>
    ${p.purged ? html`<span class="proof-thumb"><span>🗑</span></span>` : html`<a class="proof-thumb" href="${base}/bukti/${i}" target="_blank" rel="noopener">${p.type.startsWith('image/') ? html`<img src="${base}/bukti/${i}" alt="${tr(L, 'Bukti transfer', 'Transfer proof')} ${i + 1}" loading="lazy">` : html`<span>PDF</span>`}</a>`}
    <div><b>${fmtMoney(L, p.currency, p.amount)}</b> · ${p.via} <br><small class="muted">${tr(L, 'Pengirim', 'Sender')}: ${p.sender} · ${tr(L, 'tgl transfer', 'transfer date')} ${p.paidOn} · ${tr(L, 'diunggah', 'uploaded')} ${fmtDate(L, p.at)}</small>${p.note ? html`<br><small>${p.note}</small>` : ''}${p.purged ? html`<br><small class="muted">${tr(L, 'Berkas dihapus otomatis setelah 90 hari.', 'File deleted automatically after 90 days.')}</small>` : ''}</div>
  </li>`)}</ul>`;
}

function uploadForm(L: Lang, o: Order): Raw {
  const cur = currencyOf(o);
  return html`<form method="post" action="/app/pesanan/${o.id}/bukti" enctype="multipart/form-data" class="card form reveal" id="unggah">
  <h3>📤 ${tr(L, 'Unggah bukti transfer', 'Upload transfer proof')}</h3>
  <p class="muted">${tr(L, 'Gambar (JPG, PNG, WebP) atau PDF, maks. 5 MB. Pastikan nominal, tanggal, dan nama penerima terlihat jelas.', 'Image (JPG, PNG, WebP) or PDF, max 5 MB. Make sure the amount, date and beneficiary name are clearly visible.')}</p>
  <label class="field"><span>${tr(L, 'Berkas bukti', 'Proof file')}</span><input type="file" name="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></label>
  <div class="grid g2">
    <label class="field"><span>${tr(L, 'Nama pengirim (pemilik rekening asal)', 'Sender name (account holder)')}</span><input name="sender" maxlength="100" required autocomplete="name"></label>
    <label class="field"><span>${tr(L, 'Bank / aplikasi yang dipakai', 'Bank / app used')}</span><input name="via" maxlength="60" required placeholder="${cur === 'USD' ? 'SWIFT · Wise · Remitly …' : 'BCA · BRI · Mandiri · DANA …'}"></label>
    <label class="field"><span>${tr(L, 'Tanggal transfer', 'Transfer date')}</span><input type="date" name="paidOn" required></label>
    <label class="field"><span>${tr(L, 'Nominal yang dikirim', 'Amount sent')}</span><div class="input-group"><select name="currency" aria-label="${tr(L, 'Mata uang', 'Currency')}"><option value="${cur}" selected>${cur}</option><option value="${cur === 'USD' ? 'IDR' : 'USD'}">${cur === 'USD' ? 'IDR' : 'USD'}</option></select><input type="number" name="amount" min="0" step="any" required value="${amountOf(o)}"></div></label>
  </div>
  <label class="field"><span>${tr(L, 'Catatan untuk admin (opsional)', 'Note for the admin (optional)')}</span><textarea name="note" rows="2" maxlength="500"></textarea></label>
  <button class="btn btn-primary" type="submit">${tr(L, 'Kirim bukti', 'Send proof')}</button>
</form>`;
}

/* ── tuntaskan pesanan (dipakai admin) ──────────────────────────────── */

/** Pesanan lunas: token masuk + komisi afiliasi — keduanya idempoten per nomor pesanan. */
export async function completeOrder(store: Store, o: Order, by: string): Promise<void> {
  if (isDeposit(o)) await topUp(store, o.uid, o.priceIdr, o.id, `Invoice ${invoiceNo(o)}`);
  else await credit(store, o.uid, o.tokens, 'purchase', `Invoice ${invoiceNo(o)} (${o.pkg})`, `order:${o.id}`, by);
  // Rekap member (sekali per pesanan): uang masuk dan token dibeli.
  const usd = currencyOf(o) === 'USD';
  await addStats(store, o.uid, `ord:${o.id}`, { paidIdr: usd ? 0 : o.priceIdr, paidUsd: usd ? o.priceUsd : 0, tokensBought: isDeposit(o) ? 0 : o.tokens, depositTopupIdr: isDeposit(o) ? o.priceIdr : 0 });
  const buyer = await getUser(store, o.uid);
  const aff = await getAffiliateSettings(store);
  // Komisi dihitung dari nilai Rupiah tagihan (saldo afiliasi dalam Rupiah) — juga untuk pesanan USD.
  if (buyer?.ref && aff.enabled) {
    const com = await payCommission(store, buyer.ref, o.id, o.email, o.priceIdr, aff.ratePct);
    if (com > 0) await addStats(store, o.uid, `com:${o.id}`, { commissionIdr: com });
  }
}

/* ── portal member ─────────────────────────────────────────────────── */

function memberShell(c: Ctx, title: string, body: Raw): string {
  return page({ L: portalLang(c), title, body, user: c.get('user'), area: 'app', active: 'invoices' });
}

const ERRS: Record<string, [string, string]> = {
  pending: [`Masih ada ${MAX_OPEN_ORDERS} pesanan yang belum selesai. Selesaikan atau batalkan dulu.`, `You already have ${MAX_OPEN_ORDERS} unfinished orders. Complete or cancel one first.`],
  file: ['Berkas tidak dikenali. Unggah gambar JPG/PNG/WebP atau PDF.', 'File not recognised. Upload a JPG/PNG/WebP image or a PDF.'],
  size: ['Berkas lebih dari 5 MB.', 'The file is larger than 5 MB.'],
  fields: ['Lengkapi nama pengirim, bank/aplikasi, tanggal, dan nominal.', 'Fill in sender name, bank/app, date and amount.'],
  many: [`Maksimal ${MAX_PROOFS} bukti per pesanan.`, `At most ${MAX_PROOFS} proofs per order.`],
  closed: ['Pesanan ini sudah selesai atau dibatalkan.', 'This order is already completed or cancelled.'],
  rate: ['Terlalu banyak unggahan. Coba lagi nanti.', 'Too many uploads. Try again later.'],
  currency: ['Mata uang ini sedang tidak tersedia.', 'This currency is not available right now.'],
  amount: ['Nominal deposit di luar batas yang diizinkan.', 'The deposit amount is outside the allowed range.'],
  deposit: ['Saldo deposit tidak cukup.', 'Not enough deposit balance.'],
  convert: ['Nominal terlalu kecil untuk ditukar menjadi 1 token.', 'The amount is too small to convert into 1 token.'],
};

async function openOrders(store: Store, uid: string): Promise<number> {
  const { items: mine } = await store.list(`i/user-orders/${uid}/`, { limit: 30 });
  let open = 0;
  for (const it of mine) {
    const o = await store.get<Order>(orderKey(it.id));
    if (o && OPEN.includes(o.status)) open += 1;
  }
  return open;
}

async function saveOrder(store: Store, o: Order): Promise<void> {
  await store.put(orderKey(o.id), o);
  await store.createOnce(`i/user-orders/${o.uid}/${invTs(o.createdAt)}~${o.id}`, {}, { pkg: o.pkg, at: o.createdAt });
  await store.createOnce(`i/orders/${invTs(o.createdAt)}~${o.id}`, {}, { pkg: o.pkg, email: o.email, cur: currencyOf(o), amount: amountOf(o), at: o.createdAt });
}

/** Nomor operasi deposit dari formulir: dibuat sekali per tampilan halaman, jadi klik ganda tidak memotong dua kali. */
const opOf = (uid: string, raw: unknown) => (typeof raw === 'string' && /^dop_[0-9A-Z]{20}$/.test(raw) ? `${uid}-${raw}` : null);

export function payFlash(L: Lang, ok: string | null, err: string | null): Raw {
  return flash(L, ok, err && ERRS[err] ? tr(L, ERRS[err][0], ERRS[err][1]) : null);
}

export function registerMemberPayments(app: Hono<HonoEnv>): void {
  app.post('/app/deposit/isi', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const pay = await getPayment(store);
    if (!pay.idrEnabled) return c.redirect('/app/token?err=currency#deposit');
    const idr = Math.round(Number((await c.req.parseBody()).idr));
    if (!Number.isFinite(idr) || idr < pay.minDepositIdr || idr > pay.maxDepositIdr) return c.redirect('/app/token?err=amount#deposit');
    if ((await openOrders(store, user.id)) >= MAX_OPEN_ORDERS) return c.redirect('/app/token?err=pending#deposit');
    const o: Order = {
      id: newId('ord'), kind: 'deposit', uid: user.id, email: user.email, name: user.name, pkg: 'deposit', tokens: 0,
      currency: 'IDR', priceIdr: idr, priceUsd: 0, status: 'pending', createdAt: Date.now(), proofs: [],
    };
    await saveOrder(store, o);
    await audit(store, user.id, 'order.create', { id: o.id, kind: 'deposit', idr });
    return c.redirect(`/app/pesanan/${o.id}`);
  });

  app.post('/app/deposit/beli', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const f = await c.req.parseBody();
    const op = opOf(user.id, f.op);
    const [billing, eng] = await Promise.all([getBilling(store), getEngine(store)]);
    const p = billing.packages.find((x) => x.key === f.paket);
    if (!p || !op) return c.redirect('/app/token');
    const price = packagePrice(p, billing, eng).idr;
    try {
      await spendForTokens(store, user.id, op, price, p.tokens, 'buy', `Paket ${bi('id', p.name)} dari deposit`);
    } catch (err) {
      if (err instanceof DepositInsufficientError) return c.redirect('/app/token?err=deposit#deposit');
      throw err;
    }
    await audit(store, user.id, 'deposit.buy', { pkg: p.key, idr: price, tokens: p.tokens });
    return c.redirect('/app/token?ok=deposit-buy');
  });

  app.post('/app/deposit/tukar', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const f = await c.req.parseBody();
    const op = opOf(user.id, f.op);
    if (!op) return c.redirect('/app/token');
    const [billing, eng] = await Promise.all([getBilling(store), getEngine(store)]);
    // Harga tukar = harga 1 token yang berlaku (ikut markup perusahaan). Yang tampil ke member hanya "1 token = Rp X".
    const tp = Math.max(1, Math.ceil(tokenPriceIdr(billing, eng)));
    const want = Math.floor(Number(f.idr));
    const tokens = Number.isFinite(want) ? Math.floor(want / tp) : 0;
    if (tokens < 1) return c.redirect('/app/token?err=convert#deposit');
    try {
      await spendForTokens(store, user.id, op, tokens * tp, tokens, 'convert', 'Tukar saldo deposit');
    } catch (err) {
      if (err instanceof DepositInsufficientError) return c.redirect('/app/token?err=deposit#deposit');
      throw err;
    }
    await audit(store, user.id, 'deposit.convert', { idr: tokens * tp, tokens });
    return c.redirect('/app/token?ok=deposit-convert');
  });

  app.post('/app/token/pesan', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const [billing, eng, pay] = await Promise.all([getBilling(store), getEngine(store), getPayment(store)]);
    const f = await c.req.parseBody();
    const p = billing.packages.find((x) => x.key === f.paket);
    if (!p) return c.redirect('/app/token');
    const cur: Currency = isCurrency(f.cur) ? f.cur : 'IDR';
    if ((cur === 'IDR' && !pay.idrEnabled) || (cur === 'USD' && !pay.usdEnabled)) return c.redirect('/app/token?err=currency');
    if ((await openOrders(store, user.id)) >= MAX_OPEN_ORDERS) return c.redirect('/app/token?err=pending');
    const now = Date.now();
    // Harga dihitung di server dari markup yang berlaku lalu dibekukan di pesanan — formulir tidak bisa mengubahnya,
    // dan perubahan markup sesudahnya tidak mengubah tagihan ini.
    const pp = packagePrice(p, billing, eng);
    const list = packagePrice({ tokens: p.tokens, discountPct: 0 }, billing, eng);
    const o: Order = {
      id: newId('ord'), uid: user.id, email: user.email, name: user.name, pkg: p.key, pkgName: p.name, tokens: p.tokens,
      discountPct: p.discountPct, currency: cur, priceIdr: pp.idr, priceUsd: pp.usd, listIdr: list.idr, listUsd: list.usd,
      status: 'pending', createdAt: now, proofs: [],
    };
    await saveOrder(store, o);
    await audit(store, user.id, 'order.create', { id: o.id, cur, amount: amountOf(o) });
    return c.redirect(`/app/pesanan/${o.id}`);
  });

  app.get('/app/pesanan', async (c) => {
    const L = portalLang(c);
    const user = c.get('user')!;
    const store = c.get('store');
    const { items } = await store.list(`i/user-orders/${user.id}/`, { limit: 50 });
    const orders: Order[] = [];
    for (const it of items) {
      const o = await store.get<Order>(orderKey(it.id));
      if (o) orders.push(o);
    }
    const body = html`${pageHead(tr(L, 'Invoice & pembayaran', 'Invoices & payments'), tr(L, 'Semua pesanan token Anda. Buka untuk melihat invoice, cara transfer, dan mengunggah bukti.', 'All your token orders. Open one to see the invoice, how to pay and to upload proof.'), html`<a class="btn btn-primary" href="/app/token">◔ ${tr(L, 'Beli token', 'Buy tokens')}</a>`)}
    ${orders.length ? html`<section class="card reveal"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Invoice</th><th>${tr(L, 'Paket', 'Package')}</th><th class="n">${tr(L, 'Total', 'Total')}</th><th>Status</th></tr></thead><tbody>${orders.map((o) => html`<tr><td><a href="/app/pesanan/${o.id}"><b>${invoiceNo(o)}</b></a><br><small class="muted">${fmtDate(L, o.createdAt)}</small></td><td>${pkgLabel(L, o)} · ${fmtNum(L, o.tokens)} token</td><td class="n">${fmtMoney(L, currencyOf(o), amountOf(o))}</td><td>${statusPill(L, o.status)}</td></tr>`)}</tbody></table></div></section>` : empty('🧾', tr(L, 'Belum ada invoice', 'No invoices yet'), tr(L, 'Pesan paket token untuk mulai.', 'Order a token package to start.'), html`<a class="btn btn-primary" href="/app/token">${tr(L, 'Lihat paket', 'See packages')}</a>`)}
    ${noCashNotice(L)}`;
    return c.html(memberShell(c, tr(L, 'Invoice', 'Invoices'), body));
  });

  app.get('/app/pesanan/:id', async (c) => {
    const L = portalLang(c);
    const user = c.get('user')!;
    const store = c.get('store');
    const o = await store.get<Order>(orderKey(c.req.param('id')));
    if (!o || o.uid !== user.id) return c.notFound();
    const pay = await getPayment(store);
    const err = c.req.query('err');
    const ok = c.req.query('ok');
    const canUpload = (['pending', 'review', 'rejected'] as OrderStatus[]).includes(o.status) && (o.proofs?.length ?? 0) < MAX_PROOFS;
    const body = html`
    ${pageHead(`Invoice ${invoiceNo(o)}`, `${pkgLabel(L, o)} · ${fmtNum(L, o.tokens)} token · ${fmtMoney(L, currencyOf(o), amountOf(o))}`, html`<a class="btn btn-ghost" href="/app/pesanan">← ${tr(L, 'Semua invoice', 'All invoices')}</a><button class="btn btn-ghost" type="button" data-print>🖨 ${tr(L, 'Cetak / PDF', 'Print / PDF')}</button>`)}
    ${flash(L, ok === 'proof' ? tr(L, 'Bukti terkirim. Admin akan memeriksa dana masuk; token masuk otomatis setelah disetujui.', 'Proof sent. The admin will check the incoming funds; tokens are added automatically once approved.') : ok === 'cancel' ? tr(L, 'Pesanan dibatalkan.', 'Order cancelled.') : null, err && ERRS[err] ? tr(L, ERRS[err][0], ERRS[err][1]) : null)}
    ${o.status === 'rejected' && o.rejectReason ? html`<div class="flash err reveal">⚠ ${tr(L, 'Bukti ditolak admin', 'Proof rejected by the admin')}: <b>${o.rejectReason}</b> — ${tr(L, 'silakan unggah bukti yang benar.', 'please upload the correct proof.')}</div>` : ''}
    <ol class="paysteps reveal noprint" aria-label="${tr(L, 'Tahap pembayaran', 'Payment stages')}">
      <li class="${'done'}">${tr(L, 'Pesan', 'Order')}</li>
      <li class="${(o.proofs?.length ?? 0) > 0 ? 'done' : 'now'}">${tr(L, 'Transfer & unggah bukti', 'Transfer & upload proof')}</li>
      <li class="${o.status === 'credited' ? 'done' : o.status === 'review' ? 'now' : ''}">${tr(L, 'Admin memeriksa', 'Admin checks')}</li>
      <li class="${o.status === 'credited' ? 'done' : ''}">${tr(L, 'Token masuk', 'Tokens added')}</li>
    </ol>
    ${invoicePaper(L, o, pay)}
    ${o.status === 'pending' || o.status === 'rejected' || o.status === 'review' ? payGuide(L, o, pay) : ''}
    ${canUpload ? uploadForm(L, o) : ''}
    <section class="card reveal noprint"><h3>${tr(L, 'Bukti transfer terkirim', 'Transfer proofs sent')}</h3>${proofList(L, o, `/app/pesanan/${o.id}`)}</section>
    ${noCashNotice(L)}
    ${o.status === 'pending' || o.status === 'rejected' ? html`<form method="post" action="/app/pesanan/${o.id}/batal" class="reveal"><button class="btn btn-ghost btn-sm" type="submit" data-confirm="${tr(L, 'Batalkan pesanan ini?', 'Cancel this order?')}">${tr(L, 'Batalkan pesanan', 'Cancel order')}</button></form>` : ''}`;
    return c.html(memberShell(c, invoiceNo(o), body));
  });

  app.post('/app/pesanan/:id/bukti', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const id = c.req.param('id');
    const back = (q: string) => c.redirect(`/app/pesanan/${id}?${q}#unggah`);
    const cur = await store.get<Order>(orderKey(id));
    if (!cur || cur.uid !== user.id) return c.notFound();
    if (!(await limit(c.env, `proof:${user.id}`, 20, 3600))) return back('err=rate');
    const f = await c.req.parseBody();
    const file = f.file;
    if (!(file instanceof File) || file.size === 0) return back('err=file');
    if (file.size > MAX_PROOF_BYTES) return back('err=size');
    const sender = String(f.sender ?? '').trim().slice(0, 100);
    const via = String(f.via ?? '').trim().slice(0, 60);
    const paidOn = String(f.paidOn ?? '').trim();
    const amount = Number(f.amount);
    const currency: Currency = isCurrency(f.currency) ? f.currency : currencyOf(cur);
    const note = String(f.note ?? '').trim().slice(0, 500);
    if (!sender || !via || !/^\d{4}-\d{2}-\d{2}$/.test(paidOn) || !(amount > 0) || amount > 1e12) return back('err=fields');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffProof(bytes);
    if (!kind) return back('err=file');
    if (!(['pending', 'review', 'rejected'] as OrderStatus[]).includes(cur.status)) return back('err=closed');
    if ((cur.proofs?.length ?? 0) >= MAX_PROOFS) return back('err=many');
    const key = `f/proofs/${id}/${Date.now()}-${newId('p').slice(-8)}.${kind.ext}`;
    await c.env.DATA.put(key, bytes, { httpMetadata: { contentType: kind.type } });
    const proof: Proof = { key, name: file.name.slice(0, 120), type: kind.type, size: file.size, at: Date.now(), sender, via, paidOn, amount, currency, note };
    let added = false;
    let full = false;
    await store.cas<Order>(orderKey(id), (o) => {
      added = false;
      full = false;
      if (!o || !(['pending', 'review', 'rejected'] as OrderStatus[]).includes(o.status)) return null;
      if ((o.proofs?.length ?? 0) >= MAX_PROOFS) {
        full = true;
        return null;
      }
      added = true;
      return { ...o, status: 'review', rejectReason: undefined, proofs: [...(o.proofs ?? []), proof] };
    });
    if (!added) {
      await c.env.DATA.delete(key);
      return back(full ? 'err=many' : 'err=closed');
    }
    await store.put(reviewKey(id), {}, { email: user.email, cur: currencyOf(cur), amount: amountOf(cur), at: Date.now() });
    // Berkas bukti ikut pembersihan otomatis 90 hari (dihitung dari unggahan pertama pesanan ini).
    await schedulePurge(store, 'p', id, cur.proofs?.[0]?.at ?? proof.at);
    await audit(store, user.id, 'order.proof', { id, amount, currency });
    return c.redirect(`/app/pesanan/${id}?ok=proof`);
  });

  app.get('/app/pesanan/:id/bukti/:n', async (c) => {
    const user = c.get('user')!;
    const o = await c.get('store').get<Order>(orderKey(c.req.param('id')));
    if (!o || o.uid !== user.id) return c.notFound();
    return serveProof(c as Ctx, o, Number(c.req.param('n')));
  });

  app.post('/app/pesanan/:id/batal', async (c) => {
    const user = c.get('user')!;
    const store = c.get('store');
    const id = c.req.param('id');
    const o = await store.get<Order>(orderKey(id));
    if (!o || o.uid !== user.id) return c.notFound();
    let done = false;
    await store.cas<Order>(orderKey(id), (cur) => {
      done = false;
      if (!cur || (cur.status !== 'pending' && cur.status !== 'rejected')) return null;
      done = true;
      return { ...cur, status: 'cancelled', cancelledAt: Date.now(), by: user.id };
    });
    if (done) await store.del(reviewKey(id));
    return c.redirect(`/app/pesanan/${id}?${done ? 'ok=cancel' : 'err=closed'}`);
  });
}

async function serveProof(c: Ctx, o: Order, n: number): Promise<Response> {
  const p = o.proofs?.[n];
  if (!p || !Number.isInteger(n) || p.purged) return c.notFound();
  const obj = await c.env.DATA.get(p.key);
  if (!obj) return c.notFound();
  return new Response(obj.body, {
    headers: {
      'content-type': p.type,
      'content-disposition': `inline; filename="${invoiceNo(o)}-${n + 1}.${p.type === 'application/pdf' ? 'pdf' : p.type.split('/')[1]}"`,
      'cache-control': 'private, no-store',
    },
  });
}

/* ── portal admin ──────────────────────────────────────────────────── */

function adminShell(c: Ctx, title: string, body: Raw, active = 'orders'): string {
  return page({ L: portalLang(c), title, body, user: c.get('user'), area: 'admin', active });
}

const FILTERS: (OrderStatus | 'all')[] = ['review', 'pending', 'credited', 'rejected', 'cancelled', 'all'];

export function registerAdminPayments(admin: Hono<HonoEnv>): void {
  admin.get('/admin/pesanan', async (c) => {
    const L = portalLang(c);
    const store = c.get('store');
    const want = (FILTERS as string[]).includes(c.req.query('s') ?? '') ? (c.req.query('s') as OrderStatus | 'all') : 'review';
    const { items: queue } = await store.list('i/order-review/', { limit: 200 });
    const orders: Order[] = [];
    if (want === 'review') {
      for (const it of queue) {
        const o = await store.get<Order>(orderKey(it.id));
        if (o && o.status === 'review') orders.push(o);
      }
      orders.sort((a, b) => a.createdAt - b.createdAt);
    } else {
      const { items } = await store.list('i/orders/', { limit: 200 });
      for (const it of items) {
        const o = await store.get<Order>(orderKey(it.id));
        if (o && (want === 'all' || o.status === want)) orders.push(o);
      }
    }
    const names: Record<string, [string, string]> = {
      review: ['Perlu diperiksa', 'To review'], pending: ['Menunggu bayar', 'Awaiting payment'], credited: ['Lunas', 'Paid'],
      rejected: ['Ditolak', 'Rejected'], cancelled: ['Batal', 'Cancelled'], all: ['Semua', 'All'],
    };
    const body = html`
    ${pageHead(tr(L, 'Pesanan & pembayaran', 'Orders & payments'), tr(L, 'Periksa bukti transfer dengan mutasi rekening, lalu setujui (token masuk + komisi afiliasi, tepat sekali) atau tolak dengan alasan.', 'Check transfer proofs against the bank statement, then approve (tokens + affiliate commission, exactly once) or reject with a reason.'), html`<a class="btn btn-ghost" href="/admin/pembayaran">🏦 ${tr(L, 'Rekening & cara bayar', 'Accounts & payment info')}</a>`)}
    ${flash(L, c.req.query('ok') ? tr(L, 'Tersimpan.', 'Saved.') : null, null)}
    <nav class="tabs reveal">${FILTERS.map((s) => html`<a href="/admin/pesanan?s=${s}" class="${want === s ? 'on' : ''}">${tr(L, names[s]![0], names[s]![1])}${s === 'review' && queue.length ? html` <b class="badge">${queue.length}</b>` : ''}</a>`)}</nav>
    <section class="card reveal">
    ${orders.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Invoice</th><th>${tr(L, 'Pembeli', 'Buyer')}</th><th>${tr(L, 'Paket', 'Package')}</th><th class="n">${tr(L, 'Tagihan', 'Amount')}</th><th>${tr(L, 'Bukti', 'Proof')}</th><th>Status</th></tr></thead><tbody>${orders.map((o) => html`<tr><td><a href="/admin/pesanan/${o.id}"><b>${invoiceNo(o)}</b></a><br><small class="muted">${fmtDate(L, o.createdAt)}</small></td><td>${o.name ?? ''}<br><small class="muted">${o.email}</small></td><td>${pkgLabel(L, o)} · ${fmtNum(L, o.tokens)}</td><td class="n">${fmtMoney(L, currencyOf(o), amountOf(o))}</td><td>${fmtNum(L, o.proofs?.length ?? 0)}</td><td>${statusPill(L, o.status)} <a class="btn btn-ghost btn-xs" href="/admin/pesanan/${o.id}">${tr(L, 'Buka', 'Open')} →</a></td></tr>`)}</tbody></table></div>` : empty('🧾', tr(L, 'Tidak ada pesanan di sini', 'No orders here'), want === 'review' ? tr(L, 'Bukti transfer baru dari member muncul di sini.', 'New transfer proofs from members appear here.') : tr(L, 'Pesanan member muncul di sini.', 'Member orders appear here.'))}</section>`;
    return c.html(adminShell(c, tr(L, 'Pesanan', 'Orders'), body));
  });

  admin.get('/admin/pesanan/:id', async (c) => {
    const L = portalLang(c);
    const store = c.get('store');
    const o = await store.get<Order>(orderKey(c.req.param('id')));
    if (!o) return c.notFound();
    const pay = await getPayment(store);
    const buyer = await getUser(store, o.uid);
    const base = `/admin/pesanan/${o.id}`;
    const body = html`
    ${pageHead(`Invoice ${invoiceNo(o)}`, `${o.name ?? ''} · ${o.email}`, html`<a class="btn btn-ghost" href="/admin/pesanan">← ${tr(L, 'Semua pesanan', 'All orders')}</a><button class="btn btn-ghost" type="button" data-print>🖨 ${tr(L, 'Cetak / PDF', 'Print / PDF')}</button>`)}
    ${flash(L, c.req.query('ok') ? tr(L, 'Tersimpan.', 'Saved.') : null, c.req.query('err') === 'reason' ? tr(L, 'Tulis alasan penolakan.', 'Write a rejection reason.') : c.req.query('err') === 'state' ? tr(L, 'Status pesanan sudah berubah — muat ulang.', 'The order status has changed — reload.') : null)}
    <div class="grid g2 noprint">
      <section class="card reveal noprint"><h3>${tr(L, 'Periksa dana', 'Check the funds')}</h3>
        <dl class="kv"><dt>${tr(L, 'Tagihan', 'Invoice amount')}</dt><dd><b>${fmtMoney(L, currencyOf(o), amountOf(o))}</b>${currencyOf(o) === 'USD' ? html` <small class="muted">(${tr(L, 'atau', 'or')} ${fmtMoney(L, 'IDR', o.priceIdr)} ${tr(L, 'ke rekening IDR', 'to the IDR account')})</small>` : ''}</dd>
        <dt>${tr(L, 'Rekening tujuan', 'Destination')}</dt><dd>${currencyOf(o) === 'USD' ? `USD ${pay.accountUsd} / IDR ${pay.accountIdr}` : `IDR ${pay.accountIdr}`}</dd>
        <dt>${tr(L, 'Berita transfer', 'Reference')}</dt><dd><code>${invoiceNo(o)}</code></dd>
        <dt>${tr(L, 'Token', 'Tokens')}</dt><dd>${fmtNum(L, o.tokens)}</dd>
        <dt>${tr(L, 'Pereferensi', 'Referrer')}</dt><dd>${buyer?.ref ? tr(L, 'ada — komisi afiliasi dibayar saat disetujui', 'yes — affiliate commission paid on approval') : '—'}</dd>
        <dt>Status</dt><dd>${statusPill(L, o.status)}</dd></dl>
        ${o.status === 'review' || o.status === 'pending' || o.status === 'rejected' ? html`
        <form method="post" action="${base}" class="btn-row"><input type="hidden" name="act" value="approve"><button class="btn btn-primary" type="submit" data-confirm="${tr(L, 'Dana sudah masuk ke rekening sesuai tagihan? Token akan masuk ke akun member.', 'Have the funds arrived matching the invoice? Tokens will be added to the member.')}">✓ ${tr(L, 'Setujui — dana diterima', 'Approve — funds received')}</button></form>
        ${o.status === 'review' ? html`<form method="post" action="${base}" class="form"><input type="hidden" name="act" value="reject"><label class="field"><span>${tr(L, 'Alasan penolakan (dilihat member)', 'Rejection reason (shown to the member)')}</span><input name="reason" maxlength="300" required placeholder="${tr(L, 'Mis. dana belum masuk / nominal kurang / bukti tidak terbaca', 'E.g. funds not received / amount short / proof unreadable')}"></label><button class="btn btn-ghost" type="submit">✕ ${tr(L, 'Tolak bukti', 'Reject proof')}</button></form>` : ''}
        <form method="post" action="${base}"><input type="hidden" name="act" value="cancel"><button class="btn btn-ghost btn-sm" type="submit" data-confirm="${tr(L, 'Batalkan pesanan ini?', 'Cancel this order?')}">${tr(L, 'Batalkan pesanan', 'Cancel order')}</button></form>` : ''}
        ${o.status === 'credited' ? html`<form method="post" action="${base}"><input type="hidden" name="act" value="repair"><button class="btn btn-ghost btn-sm" type="submit" title="${tr(L, 'Aman diklik berulang: tidak pernah menambah ganda', 'Safe to click repeatedly: never adds twice')}">↻ ${tr(L, 'Pastikan token & komisi', 'Ensure tokens & commission')}</button></form>` : ''}
      </section>
      <section class="card reveal noprint"><h3>${tr(L, 'Bukti transfer', 'Transfer proofs')}</h3>${proofList(L, o, base)}</section>
    </div>
    ${invoicePaper(L, o, pay)}`;
    return c.html(adminShell(c, invoiceNo(o), body));
  });

  admin.get('/admin/pesanan/:id/bukti/:n', async (c) => {
    const o = await c.get('store').get<Order>(orderKey(c.req.param('id')));
    if (!o) return c.notFound();
    await audit(c.get('store'), c.get('user')!.id, 'order.proof.view', { id: o.id, n: Number(c.req.param('n')) });
    return serveProof(c as Ctx, o, Number(c.req.param('n')));
  });

  admin.post('/admin/pesanan/:id', async (c) => {
    const store = c.get('store');
    const by = c.get('user')!.id;
    const id = c.req.param('id');
    const f = await c.req.parseBody();
    const act = String(f.act ?? '');
    const reason = String(f.reason ?? '').trim().slice(0, 300);
    if (act === 'reject' && !reason) return c.redirect(`/admin/pesanan/${id}?err=reason`);
    let changed: Order | null = null;
    await store.cas<Order>(orderKey(id), (o) => {
      changed = null;
      if (!o) return null;
      const now = Date.now();
      let next: Order | null = null;
      if (act === 'approve' && OPEN.includes(o.status)) next = { ...o, status: 'credited', creditedAt: now, reviewedAt: now, by };
      else if (act === 'reject' && o.status === 'review') next = { ...o, status: 'rejected', rejectReason: reason, reviewedAt: now, by };
      else if (act === 'cancel' && OPEN.includes(o.status)) next = { ...o, status: 'cancelled', cancelledAt: now, by };
      changed = next;
      return next;
    });
    // Disetujui (atau klik ulang / "repair"): token & komisi dituntaskan — idempoten per nomor pesanan, tidak pernah ganda.
    const o = (changed as Order | null) ?? (act === 'approve' || act === 'repair' ? await store.get<Order>(orderKey(id)) : null);
    if (o && o.status === 'credited') await completeOrder(store, o, by);
    if (changed || (o && o.status !== 'review')) await store.del(reviewKey(id));
    if (!changed && act !== 'repair' && !(act === 'approve' && o?.status === 'credited')) return c.redirect(`/admin/pesanan/${id}?err=state`);
    await audit(store, by, `order.${act}`, { id, reason: reason || undefined });
    return c.redirect(`/admin/pesanan/${id}?ok=1`);
  });

  /* rekening & cara bayar */
  admin.get('/admin/pembayaran', async (c) => {
    const L = portalLang(c);
    const p = await getPayment(c.get('store'));
    const fld = (name: keyof PaymentSettings, label: string, hint = '', ph = '') => html`<label class="field"><span>${label}${hint ? html` ${tip(hint)}` : ''}</span><input name="${name}" value="${String(p[name])}" maxlength="200" placeholder="${ph}"></label>`;
    const body = html`
    ${pageHead(tr(L, 'Rekening & cara bayar', 'Accounts & payment info'), tr(L, 'Ditampilkan hanya kepada pembeli yang sudah masuk, di invoice-nya — tidak pernah di halaman publik.', 'Shown only to signed-in buyers on their invoice — never on public pages.'))}
    ${flash(L, c.req.query('ok') ? tr(L, 'Tersimpan. Invoice baru dan lama langsung memakai data ini.', 'Saved. New and existing invoices use this data right away.') : null, null)}
    <form method="post" action="/admin/pembayaran" class="card form reveal">
      <div class="grid g2">
        <label class="check"><input type="checkbox" name="idrEnabled" value="1" ${p.idrEnabled ? 'checked' : ''}> ${tr(L, 'Terima pembayaran Rupiah (IDR)', 'Accept Rupiah (IDR) payments')}</label>
        <label class="check"><input type="checkbox" name="usdEnabled" value="1" ${p.usdEnabled ? 'checked' : ''}> ${tr(L, 'Terima pembayaran Dolar AS (USD)', 'Accept US dollar (USD) payments')}</label>
      </div>
      <div class="grid g2">
        ${fld('bankName', tr(L, 'Nama bank', 'Bank name'))}
        ${fld('bankCode', tr(L, 'Kode bank', 'Bank code'))}
        ${fld('swift', 'SWIFT / BIC')}
        ${fld('bankAddress', tr(L, 'Alamat bank (untuk SWIFT)', 'Bank address (for SWIFT)'))}
        ${fld('beneficiary', tr(L, 'Nama penerima', 'Beneficiary name'))}
        ${fld('beneficiaryAddress', tr(L, 'Alamat penerima (opsional)', 'Beneficiary address (optional)'), tr(L, 'Sebagian bank luar negeri memintanya untuk SWIFT.', 'Some foreign banks ask for it on SWIFT wires.'))}
        ${fld('accountIdr', tr(L, 'No. rekening IDR', 'IDR account number'))}
        ${fld('accountUsd', tr(L, 'No. rekening USD', 'USD account number'))}
        ${fld('whatsapp', tr(L, 'WhatsApp bantuan pembayaran (opsional)', 'Payment help WhatsApp (optional)'), tr(L, 'Angka dengan kode negara, mis. 628…', 'Digits with country code, e.g. 628…'), '628…')}
        <label class="field"><span>${tr(L, 'Deposit minimum (Rp)', 'Minimum deposit (Rp)')}</span><input type="number" name="minDepositIdr" min="10000" step="1000" value="${p.minDepositIdr}"></label>
        <label class="field"><span>${tr(L, 'Deposit maksimum per pesanan (Rp)', 'Maximum deposit per order (Rp)')}</span><input type="number" name="maxDepositIdr" min="10000" step="1000" value="${p.maxDepositIdr}"></label>
      </div>
      <label class="field"><span>${tr(L, 'Catatan tambahan di invoice (opsional)', 'Extra note on invoices (optional)')}</span><textarea name="note" rows="3" maxlength="1000">${p.note}</textarea></label>
      <div class="btn-row"><button class="btn btn-primary" type="submit">${tr(L, 'Simpan', 'Save')}</button><button class="btn btn-ghost" type="submit" name="reset" value="1" data-confirm="${tr(L, 'Kembalikan ke rekening bawaan (sama dengan ulyah.com)?', 'Restore the default accounts (same as ulyah.com)?')}">${tr(L, 'Kembalikan bawaan', 'Restore defaults')}</button></div>
    </form>`;
    return c.html(adminShell(c, tr(L, 'Pembayaran', 'Payments'), body, 'payments'));
  });

  admin.post('/admin/pembayaran', async (c) => {
    const store = c.get('store');
    const f = await c.req.parseBody();
    const s = (k: string, max = 200) => String(f[k] ?? '').trim().slice(0, max);
    const next: PaymentSettings = f.reset
      ? { ...DEFAULT_PAYMENT }
      : {
          idrEnabled: f.idrEnabled === '1', usdEnabled: f.usdEnabled === '1',
          bankName: s('bankName'), bankAddress: s('bankAddress'), swift: s('swift', 20).toUpperCase(), bankCode: s('bankCode', 10),
          beneficiary: s('beneficiary'), beneficiaryAddress: s('beneficiaryAddress'), accountIdr: s('accountIdr', 40), accountUsd: s('accountUsd', 40),
          whatsapp: s('whatsapp', 20).replace(/\D/g, ''), note: s('note', 1000),
          minDepositIdr: Math.max(10_000, Math.round(Number(f.minDepositIdr) || DEFAULT_PAYMENT.minDepositIdr)),
          maxDepositIdr: Math.max(10_000, Math.round(Number(f.maxDepositIdr) || DEFAULT_PAYMENT.maxDepositIdr)),
        };
    if (next.maxDepositIdr < next.minDepositIdr) next.maxDepositIdr = next.minDepositIdr;
    if (!next.idrEnabled && !next.usdEnabled) next.idrEnabled = true;
    await store.put(PAYMENT_DOC, next);
    await audit(store, c.get('user')!.id, 'payment.settings', { idr: next.idrEnabled, usd: next.usdEnabled });
    return c.redirect('/admin/pembayaran?ok=1');
  });
}

