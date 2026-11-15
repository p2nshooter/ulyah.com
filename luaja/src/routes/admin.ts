/**
 * Panel pengelola (/admin). Masuk lewat 5 ketukan logo atau /admin/masuk; hanya peran owner/admin. Semua tindakan
 * tercatat di audit. Persetujuan pembayaran idempoten (grantSubs per tagihan).
 */
import { Hono } from 'hono';
import { html, raw, type Raw } from '../lib/html.ts';
import { csrfOk, csrfToken, type Ctx, type HonoEnv } from '../lib/session.ts';
import { render } from '../lib/render.ts';
import { rp, fmtDate } from '../lib/i18n.ts';
import { hashPassword, newId } from '../lib/crypto.ts';
import { audit } from '../data/audit.ts';
import { getInvoice, listOpenInvoices, decideInvoice, listAllInvoices } from '../data/invoices.ts';
import { getUser, grantSubs, isAdmin, updateUser, getSubs } from '../data/users.ts';
import { getPayment, getPricing, getSite, saveDoc, PAYMENT_DOC, PRICING_DOC, SITE_DOC } from '../data/settings.ts';
import { COURSE_META, COURSES, CURRENCIES, money, type Currency, type Pricing, type Tier, type User } from '../data/model.ts';
import { getPaypalConfig, savePaypalConfig, registerWebhook, testConnection, paypalReady, PaypalError, type PaypalMode } from '../data/paypal.ts';
import { origin } from '../lib/render.ts';
import { icon } from '../pages/layout.ts';

export const admin = new Hono<HonoEnv>();

admin.use('/admin/*', async (c, next) => {
  if (c.req.path === '/admin/masuk') return next();
  if (!isAdmin(c.get('user'))) return c.redirect('/admin/masuk');
  await next();
});
admin.use('/admin', async (c, next) => {
  if (!isAdmin(c.get('user'))) return c.redirect('/admin/masuk');
  await next();
});

const TABS: [string, string][] = [['/admin', 'Ringkasan'], ['/admin/pembayaran', 'Pembayaran'], ['/admin/member', 'Member'], ['/admin/harga', 'Harga & promo'], ['/admin/rekening', 'Rekening'], ['/admin/paypal', 'PayPal'], ['/admin/konten', 'Konten situs'], ['/admin/audit', 'Audit']];
async function shell(c: Ctx, active: string, title: string, body: Raw): Promise<Response> {
  return render(c, {
    path: active, title: `${title} — Pengelola LUAJA`, desc: 'Panel pengelola.', noindex: true, noAds: true,
    body: html`<div class="admin-bar"><div class="wrap"><b>Panel pengelola</b><span>${c.get('user')!.email}</span><a href="/">Lihat situs</a><a href="/portal">Portal</a></div></div>
    <section class="section-tight"><div class="wrap"><nav class="tabs">${TABS.map(([h, l]) => html`<a href="${h}" ${h === active ? raw('aria-current="page"') : ''}>${l}</a>`)}</nav>
    ${c.req.query('ok') ? html`<div class="alert alert-ok">${c.req.query('ok')}</div>` : ''}${c.req.query('err') ? html`<div class="alert alert-bad">${c.req.query('err')}</div>` : ''}
    ${body}</div></section>`,
  });
}
const back = (c: Ctx, path: string, m: string, bad = false) => c.redirect(`${path}?${bad ? 'err' : 'ok'}=${encodeURIComponent(m)}`);
async function guard(c: Ctx): Promise<Record<string, unknown> | null> {
  const f = await c.req.parseBody();
  return (await csrfOk(c, c.get('user')!, String(f._csrf ?? ''))) ? f : null;
}

admin.get('/admin', async (c) => {
  const store = c.get('store');
  const [open, all, users] = await Promise.all([listOpenInvoices(store, 200), listAllInvoices(store, 500), store.list('i/users/', { limit: 1000 })]);
  const month = new Date().toISOString().slice(0, 7);
  const approved = all.filter((i) => i.status === 'approved');
  const monthItems = approved.filter((i) => i.decidedAt && new Date(i.decidedAt).toISOString().slice(0, 7) === month);
  const revenue = CURRENCIES.map((cur) => [cur, monthItems.filter((i) => (i.currency ?? 'IDR') === cur).reduce((n, i) => n + i.amount, 0)] as [Currency, number]).filter(([, v]) => v > 0);
  return shell(c, '/admin', 'Ringkasan', html`
  <div class="kpi"><div class="card"><b>${users.items.length}</b><span>akun terdaftar</span></div><div class="card"><b>${open.length}</b><span>bukti menunggu verifikasi</span></div><div class="card"><b>${approved.length}</b><span>pembayaran disetujui</span></div><div class="card"><b>${revenue.length ? revenue.map(([cur, v]) => money(v, cur)).join(' · ') : rp(0)}</b><span>pendapatan ${month}</span></div></div>
  ${open.length ? html`<p style="margin-top:20px"><a class="btn btn-gold" href="/admin/pembayaran">Verifikasi ${open.length} pembayaran →</a></p>` : html`<p class="muted" style="margin-top:20px">Tidak ada pembayaran yang menunggu.</p>`}`);
});

admin.get('/admin/pembayaran', async (c) => {
  const store = c.get('store');
  const [open, pricing] = await Promise.all([listOpenInvoices(store, 200), getPricing(store)]);
  const users = new Map<string, User | null>();
  await Promise.all([...new Set(open.map((i) => i.userId))].map(async (id) => users.set(id, await getUser(store, id))));
  const csrf = await csrfToken(c, c.get('user')!);
  return shell(c, '/admin/pembayaran', 'Pembayaran', html`
  <h1 style="font-size:var(--fs-5)">Verifikasi pembayaran</h1>
  ${open.length ? html`<div class="queue">${open.map((i) => { const u = users.get(i.userId); return html`<div class="qitem"><div><b>${i.number}</b> · ${money(i.amount, i.currency ?? 'IDR')} · ${pricing.tiers[i.tier]?.label ?? i.tier}<br><span class="muted">${u?.name ?? '—'} · ${u?.email ?? i.userId} · ${i.courses.map((k) => COURSE_META[k].name).join(', ')} · dikirim ${i.submittedAt ? fmtDate('id', i.submittedAt, true) : ''}</span>${i.note ? html`<p class="small" style="margin:6px 0 0"><b>Catatan:</b> ${i.note}</p>` : ''}
      <div class="files">${i.files.map((f, k) => html`<a href="/admin/berkas/${i.id}/${k}" target="_blank" rel="noopener">${icon('unggah')} ${f.kind === 'payment' ? 'Bukti transfer' : 'Dokumen promo'} (${Math.round(f.size / 1024)} KB)</a>`)}</div></div>
      <div class="actions" style="display:grid;gap:8px;min-width:220px"><form method="post" action="/admin/pembayaran/${i.id}/setujui"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-gold btn-sm" style="width:100%" type="submit">Setujui & aktifkan</button></form>
      <form method="post" action="/admin/pembayaran/${i.id}/tolak" class="stack" style="--stack:6px"><input type="hidden" name="_csrf" value="${csrf}"><input name="alasan" placeholder="Alasan penolakan" required maxlength="300"><button class="btn btn-ghost btn-sm" style="width:100%" type="submit">Tolak</button></form></div></div>`; })}</div>` : html`<div class="card"><p style="margin:0">Tidak ada bukti pembayaran yang menunggu.</p></div>`}`);
});

admin.get('/admin/berkas/:id/:k', async (c) => {
  const inv = await getInvoice(c.get('store'), c.req.param('id'));
  const f = inv?.files[Number(c.req.param('k'))];
  if (!f) return c.notFound();
  const obj = await c.env.DATA.get(f.key);
  if (!obj) return c.notFound();
  return new Response(obj.body, { headers: { 'content-type': f.type, 'cache-control': 'private, no-store', 'content-disposition': `inline; filename="${f.kind}-${inv!.number}"`, 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" } });
});

admin.post('/admin/pembayaran/:id/setujui', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/pembayaran', 'Sesi formulir kedaluwarsa.', true);
  const store = c.get('store'), me = c.get('user')!;
  const pricing = await getPricing(store);
  const inv = await decideInvoice(store, c.req.param('id'), 'approved', me.id, '', pricing.days);
  if (!inv) return back(c, '/admin/pembayaran', 'Tagihan tidak ditemukan.', true);
  if (inv.status === 'approved') await grantSubs(store, inv.userId, inv.courses, pricing.days, inv.tier, inv.id);
  await audit(store, me.id, 'invoice.approve', { id: inv.id, number: inv.number, amount: inv.amount });
  return back(c, '/admin/pembayaran', `${inv.number} disetujui — langganan aktif.`);
});
admin.post('/admin/pembayaran/:id/tolak', async (c) => {
  const f = await guard(c);
  if (!f) return back(c, '/admin/pembayaran', 'Sesi formulir kedaluwarsa.', true);
  const store = c.get('store'), me = c.get('user')!;
  const inv = await decideInvoice(store, c.req.param('id'), 'rejected', me.id, String(f.alasan ?? '').trim() || 'Bukti tidak sesuai', 0);
  if (!inv) return back(c, '/admin/pembayaran', 'Tagihan tidak ditemukan.', true);
  await audit(store, me.id, 'invoice.reject', { id: inv.id, reason: inv.reason });
  return back(c, '/admin/pembayaran', `${inv.number} ditolak.`);
});

admin.get('/admin/member', async (c) => {
  const store = c.get('store');
  const q = (c.req.query('q') ?? '').trim().toLowerCase();
  const { items } = await store.list<{ email: string; name: string; role: string }>('i/users/', { limit: 500 });
  const rows = items.filter((i) => !q || `${i.meta.email} ${i.meta.name}`.toLowerCase().includes(q)).slice(0, 100);
  const subs = await Promise.all(rows.map((r) => getSubs(store, r.id)));
  const users = await Promise.all(rows.map((r) => getUser(store, r.id)));
  const csrf = await csrfToken(c, c.get('user')!);
  return shell(c, '/admin/member', 'Member', html`
  <div class="page-title"><h1 style="font-size:var(--fs-5)">Member</h1><form method="get" class="row"><input name="q" placeholder="Cari nama atau e-mail" value="${q}"><button class="btn btn-ghost btn-sm">Cari</button></form></div>
  <div class="table-wrap"><table class="table"><tr><th>Nama</th><th>E-mail</th><th>Peran</th><th>Langganan</th><th>Tindakan</th></tr>${rows.map((r, k) => { const s = subs[k]!; const u = users[k]; return html`<tr><td>${r.meta.name}</td><td>${r.meta.email}</td><td>${r.meta.role}${u?.suspended ? html` <span class="pill pill-bad">dibekukan</span>` : ''}</td><td>${COURSES.filter((x) => s[x] && s[x]!.until > Date.now()).map((x) => html`<span class="pill pill-ok">${COURSE_META[x].name} s.d. ${fmtDate('id', s[x]!.until)}</span> `)}</td><td class="actions">${u && u.role !== 'owner' ? html`<form method="post" action="/admin/member/${r.id}/beku"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">${u.suspended ? 'Aktifkan' : 'Bekukan'}</button></form><form method="post" action="/admin/member/${r.id}/sandi"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Setel ulang sandi</button></form>` : ''}</td></tr>`; })}</table></div>`);
});
admin.post('/admin/member/:id/beku', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/member', 'Sesi formulir kedaluwarsa.', true);
  const u = await updateUser(c.get('store'), c.req.param('id'), (x) => (x.role === 'owner' ? null : { ...x, suspended: !x.suspended, sv: x.sv + 1 }));
  await audit(c.get('store'), c.get('user')!.id, 'user.suspend', { id: c.req.param('id'), suspended: u?.suspended });
  return back(c, '/admin/member', u?.suspended ? 'Akun dibekukan.' : 'Akun diaktifkan.');
});
admin.post('/admin/member/:id/sandi', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/member', 'Sesi formulir kedaluwarsa.', true);
  const temp = `LJ-${newId('x').slice(-8)}`;
  const pass = await hashPassword(temp);
  const u = await updateUser(c.get('store'), c.req.param('id'), (x) => (x.role === 'owner' ? null : { ...x, pass, sv: x.sv + 1 }));
  if (!u || u.role === 'owner') return back(c, '/admin/member', 'Tidak dapat menyetel ulang akun ini.', true);
  await audit(c.get('store'), c.get('user')!.id, 'user.reset', { id: u.id });
  // Ditampilkan sekali di halaman ini (tidak lewat URL/riwayat peramban).
  return shell(c, '/admin/member', 'Member', html`<div class="alert alert-ok">Kata sandi sementara untuk <b>${u.email}</b>: <code>${temp}</code> — kirimkan ke pemilik akun dan minta segera menggantinya. Pesan ini hanya tampil sekali.</div><p><a class="btn btn-ghost" href="/admin/member">Kembali ke daftar member</a></p>`);
});

admin.get('/admin/harga', async (c) => {
  const p = await getPricing(c.get('store'));
  const csrf = await csrfToken(c, c.get('user')!);
  return shell(c, '/admin/harga', 'Harga & promo', html`
  <h1 style="font-size:var(--fs-5)">Harga & promo</h1>
  <form method="post" class="card stack"><input type="hidden" name="_csrf" value="${csrf}">
    ${(Object.keys(p.tiers) as Tier[]).map((t) => html`<fieldset class="card" style="box-shadow:none"><legend><b>${p.tiers[t].label}</b></legend><div class="grid g4"><div class="field"><label>Per bahasa / tahun (Rp)</label><input type="number" name="${t}_one" value="${p.tiers[t].one}" min="0" step="1000"></div><div class="field"><label>Tiga bahasa / tahun (Rp)</label><input type="number" name="${t}_three" value="${p.tiers[t].three}" min="0" step="1000"></div><div class="field"><label>Per bahasa (US$)</label><input type="number" name="${t}_usd_one" value="${p.tiers[t].usd.one}" min="0" step="0.01"></div><div class="field"><label>Tiga bahasa (US$)</label><input type="number" name="${t}_usd_three" value="${p.tiers[t].usd.three}" min="0" step="0.01"></div><div class="field"><label>Per bahasa (¥)</label><input type="number" name="${t}_jpy_one" value="${p.tiers[t].jpy.one}" min="0" step="1"></div><div class="field"><label>Tiga bahasa (¥)</label><input type="number" name="${t}_jpy_three" value="${p.tiers[t].jpy.three}" min="0" step="1"></div><div class="field"><label>Nama</label><input name="${t}_label" value="${p.tiers[t].label}"></div><label class="check"><input type="checkbox" name="${t}_on" ${p.tiers[t].enabled ? raw('checked') : ''}><span>Tampilkan</span></label></div><div class="field"><label>Keterangan</label><input name="${t}_note" value="${p.tiers[t].note}"></div></fieldset>`)}
    <div class="field" style="max-width:240px"><label>Masa aktif (hari)</label><input type="number" name="days" value="${p.days}" min="30" max="1100"></div>
    <button class="btn btn-gold" type="submit">Simpan harga</button></form>`);
});
admin.post('/admin/harga', async (c) => {
  const f = await guard(c);
  if (!f) return back(c, '/admin/harga', 'Sesi formulir kedaluwarsa.', true);
  const store = c.get('store');
  const p = await getPricing(store);
  const next: Pricing = structuredClone(p);
  for (const t of Object.keys(p.tiers) as Tier[]) {
    const one = Number(f[`${t}_one`]), three = Number(f[`${t}_three`]);
    if (!(one >= 0) || !(three >= 0)) return back(c, '/admin/harga', 'Harga tidak valid.', true);
    const num = (k: string, d: number) => { const v = Number(f[k]); return v >= 0 ? v : d; };
    next.tiers[t] = { ...p.tiers[t], usd: { one: Math.round(num(`${t}_usd_one`, p.tiers[t].usd.one) * 100) / 100, three: Math.round(num(`${t}_usd_three`, p.tiers[t].usd.three) * 100) / 100 }, jpy: { one: Math.round(num(`${t}_jpy_one`, p.tiers[t].jpy.one)), three: Math.round(num(`${t}_jpy_three`, p.tiers[t].jpy.three)) }, one: Math.round(one), three: Math.round(three), label: String(f[`${t}_label`] ?? p.tiers[t].label).slice(0, 40), note: String(f[`${t}_note`] ?? p.tiers[t].note).slice(0, 240), enabled: t === 'umum' ? true : Boolean(f[`${t}_on`]) };
  }
  next.days = Math.min(1100, Math.max(30, Math.round(Number(f.days) || p.days)));
  await saveDoc(store, PRICING_DOC, next);
  await audit(store, c.get('user')!.id, 'pricing.save', { tiers: Object.fromEntries(Object.entries(next.tiers).map(([k, v]) => [k, [v.one, v.three, v.enabled]])), days: next.days });
  return back(c, '/admin/harga', 'Harga tersimpan dan langsung berlaku.');
});

admin.get('/admin/rekening', async (c) => {
  const p = await getPayment(c.get('store'));
  const csrf = await csrfToken(c, c.get('user')!);
  return shell(c, '/admin/rekening', 'Rekening', html`
  <h1 style="font-size:var(--fs-5)">Rekening pembayaran</h1><p class="muted">Ditampilkan hanya kepada member yang membuka tagihannya.</p>
  <form method="post" class="card stack" style="max-width:640px"><input type="hidden" name="_csrf" value="${csrf}">
    <h3 style="margin:0">Rekening Rupiah utama</h3><div class="field"><label>Bank</label><input name="bank" value="${p.bank}" required></div><div class="field"><label>Nomor rekening</label><input name="account" value="${p.account}" required></div><div class="field"><label>Atas nama</label><input name="holder" value="${p.holder}" required></div>
    <h3 style="margin:12px 0 0">BNI multimata uang (juga untuk transfer luar negeri)</h3><div class="field"><label>Nama bank</label><input name="bni_name" value="${p.bni.name}"></div><div class="grid g3"><div class="field"><label>SWIFT/BIC</label><input name="bni_swift" value="${p.bni.swift}"></div><div class="field"><label>Kode bank</label><input name="bni_code" value="${p.bni.code}"></div><div class="field"><label>Atas nama</label><input name="bni_holder" value="${p.bni.holder}"></div></div><div class="field"><label>Alamat bank</label><input name="bni_address" value="${p.bni.address}"></div><div class="grid g3">${CURRENCIES.map((cur) => html`<div class="field"><label>Rekening ${cur}</label><input name="bni_${cur}" value="${p.bni.accounts[cur]}"></div>`)}</div><div class="field"><label>Catatan transfer</label><input name="note" value="${p.note}"></div><div class="field"><label>WhatsApp layanan (opsional)</label><input name="whatsapp" value="${p.whatsapp}" placeholder="62812…"></div>
    <button class="btn btn-gold" type="submit">Simpan rekening</button></form>`);
});
admin.post('/admin/rekening', async (c) => {
  const f = await guard(c);
  if (!f) return back(c, '/admin/rekening', 'Sesi formulir kedaluwarsa.', true);
  const cur = await getPayment(c.get('store'));
  const clean = (k: string, d: string, max = 80) => (f[k] === undefined ? d : String(f[k]).trim().slice(0, max));
  const bni = { name: clean('bni_name', cur.bni.name, 120), swift: clean('bni_swift', cur.bni.swift, 11).toUpperCase(), code: clean('bni_code', cur.bni.code, 6), holder: clean('bni_holder', cur.bni.holder), address: clean('bni_address', cur.bni.address, 160), accounts: Object.fromEntries(CURRENCIES.map((x) => [x, clean(`bni_${x}`, cur.bni.accounts[x], 30).replace(/[^\d -]/g, '')])) as Record<Currency, string> };
  const v = { bni, bank: String(f.bank ?? '').trim().slice(0, 60), account: String(f.account ?? '').replace(/[^\d -]/g, '').trim().slice(0, 40), holder: String(f.holder ?? '').trim().slice(0, 80), note: String(f.note ?? '').trim().slice(0, 240), whatsapp: String(f.whatsapp ?? '').replace(/[^\d]/g, '').slice(0, 16) };
  if (!v.bank || !v.account || !v.holder) return back(c, '/admin/rekening', 'Bank, nomor dan atas nama wajib diisi.', true);
  await saveDoc(c.get('store'), PAYMENT_DOC, v);
  await audit(c.get('store'), c.get('user')!.id, 'payment.save', { bank: v.bank });
  return back(c, '/admin/rekening', 'Rekening tersimpan.');
});

admin.get('/admin/konten', async (c) => {
  const s = await getSite(c.get('store'));
  const { updatedAt: _u, ...editable } = s;
  const csrf = await csrfToken(c, c.get('user')!);
  return shell(c, '/admin/konten', 'Konten situs', html`
  <h1 style="font-size:var(--fs-5)">Konten situs</h1><p class="muted">Semua teks beranda, sapaan, keunggulan, langkah, FAQ dan kontak. Simpan untuk langsung tayang. Format JSON — struktur kunci jangan diubah.</p>
  <form method="post" class="stack"><input type="hidden" name="_csrf" value="${csrf}"><textarea name="json" class="json-edit" spellcheck="false">${JSON.stringify(editable, null, 2)}</textarea><button class="btn btn-gold" type="submit">Simpan konten</button></form>`);
});
admin.post('/admin/konten', async (c) => {
  const f = await guard(c);
  if (!f) return back(c, '/admin/konten', 'Sesi formulir kedaluwarsa.', true);
  let v: Record<string, unknown>;
  try {
    v = JSON.parse(String(f.json ?? ''));
  } catch {
    return back(c, '/admin/konten', 'JSON tidak valid — periksa koma dan tanda kutip.', true);
  }
  const base = await getSite(c.get('store'));
  for (const k of Object.keys(v)) if (!(k in base)) return back(c, '/admin/konten', `Kunci tidak dikenal: ${k}`, true);
  if (typeof v.name !== 'string' || !Array.isArray(v.faq) || typeof v.hero !== 'object') return back(c, '/admin/konten', 'Struktur konten tidak lengkap.', true);
  await saveDoc(c.get('store'), SITE_DOC, v);
  await audit(c.get('store'), c.get('user')!.id, 'site.save', { keys: Object.keys(v).length });
  return back(c, '/admin/konten', 'Konten tersimpan dan langsung tayang.');
});

admin.get('/admin/audit', async (c) => {
  const store = c.get('store');
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const { items } = await store.list<{ by: string; action: string }>(`l/audit/${today}/`, { limit: 200 });
  return shell(c, '/admin/audit', 'Audit', html`<h1 style="font-size:var(--fs-5)">Audit hari ini (${today})</h1>
  ${items.length ? html`<div class="table-wrap"><table class="table"><tr><th>Waktu</th><th>Tindakan</th><th>Oleh</th></tr>${items.map((i) => html`<tr><td>${fmtDate('id', i.uploaded.getTime(), true)}</td><td>${i.meta.action}</td><td>${i.meta.by}</td></tr>`)}</table></div>` : html`<p class="muted">Belum ada tindakan hari ini.</p>`}`);
});

/* ── PayPal (live & sandbox; rahasia disegel MASTER_KEY di R2) ─────────────── */
admin.get('/admin/paypal', async (c) => {
  const cfg = await getPaypalConfig(c.get('store'));
  const csrf = await csrfToken(c, c.get('user')!);
  const hook = `${origin(c)}/api/paypal/webhook`;
  const row = (m: PaypalMode) => html`<fieldset class="card" style="box-shadow:none"><legend><b>${m === 'live' ? 'LIVE' : 'Sandbox'}</b></legend>
    <div class="field"><label>Client ID</label><input name="${m}_client" value="${cfg[m].clientId}" autocomplete="off" spellcheck="false"></div>
    <div class="field"><label>Secret ${cfg[m].secret ? html`<span class="pill pill-ok">tersimpan terenkripsi</span>` : html`<span class="pill pill-line">belum ada</span>`}</label><input name="${m}_secret" type="password" autocomplete="new-password" placeholder="${cfg[m].secret ? 'Kosongkan bila tidak diganti' : 'Tempel secret di sini'}"></div>
    <div class="field"><label>Webhook ID</label><input name="${m}_webhook" value="${cfg[m].webhookId}" autocomplete="off" spellcheck="false"><span class="hint">Isi otomatis dengan tombol „Daftarkan webhook“ di bawah.</span></div></fieldset>`;
  return shell(c, '/admin/paypal', 'PayPal', html`
  <h1 style="font-size:var(--fs-5)">PayPal</h1>
  <p class="muted">Pembayaran otomatis untuk tagihan USD dan JPY. Secret disegel dengan kunci induk server sebelum disimpan; tidak pernah ditampilkan kembali.</p>
  ${c.env.MASTER_KEY ? '' : html`<div class="alert alert-bad">Kunci induk (MASTER_KEY) belum terpasang di server — deploy berikutnya membuatnya otomatis. Secret belum bisa disimpan.</div>`}
  <div class="kpi" style="margin-bottom:18px"><div class="card"><b>${cfg.mode === 'live' ? 'LIVE' : 'Sandbox'}</b><span>mode aktif</span></div><div class="card"><b>${paypalReady(cfg) ? 'Siap' : 'Belum siap'}</b><span>status pembayaran otomatis</span></div></div>
  <form method="post" class="stack"><input type="hidden" name="_csrf" value="${csrf}">
    <label class="check"><input type="checkbox" name="enabled" ${cfg.enabled ? raw('checked') : ''}><span><b>Aktifkan PayPal di halaman tagihan</b><small>Tombol PayPal tampil untuk tagihan USD/JPY.</small></span></label>
    <div class="field" style="max-width:320px"><label>Mode</label><select name="mode"><option value="sandbox" ${cfg.mode === 'sandbox' ? raw('selected') : ''}>Sandbox (uji)</option><option value="live" ${cfg.mode === 'live' ? raw('selected') : ''}>LIVE (uang sungguhan)</option></select><span class="hint">LIVE hanya bisa disimpan bila uji koneksi live berhasil.</span></div>
    <div class="grid g2">${row('live')}${row('sandbox')}</div>
    <button class="btn btn-gold" type="submit">Simpan PayPal</button>
  </form>
  <div class="card" style="margin-top:18px"><h3 style="margin-top:0">Webhook</h3><p>URL webhook: <code>${hook}</code></p><p class="small muted">Peristiwa: PAYMENT.CAPTURE.COMPLETED, CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED.</p>
    <div class="row"><form method="post" action="/admin/paypal/uji"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Uji koneksi (mode aktif)</button></form><form method="post" action="/admin/paypal/webhook"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Daftarkan webhook (mode aktif)</button></form></div></div>`);
});

admin.post('/admin/paypal', async (c) => {
  const f = await guard(c);
  if (!f) return back(c, '/admin/paypal', 'Sesi formulir kedaluwarsa.', true);
  if (!c.env.MASTER_KEY) return back(c, '/admin/paypal', 'MASTER_KEY belum terpasang di server.', true);
  const store = c.get('store');
  const mode: PaypalMode = f.mode === 'live' ? 'live' : 'sandbox';
  const take = (m: PaypalMode) => ({ clientId: String(f[`${m}_client`] ?? ''), secret: String(f[`${m}_secret`] ?? ''), webhookId: String(f[`${m}_webhook`] ?? '') });
  const saved = await savePaypalConfig(store, c.env.MASTER_KEY, { enabled: Boolean(f.enabled), mode, live: take('live'), sandbox: take('sandbox') });
  // LIVE hanya diaktifkan bila kredensial live benar-benar diterima PayPal.
  if (saved.mode === 'live' && saved.enabled) {
    try {
      await testConnection(saved, c.env.MASTER_KEY);
    } catch (err) {
      await savePaypalConfig(store, c.env.MASTER_KEY, { enabled: saved.enabled, mode: 'sandbox', live: { ...take('live'), secret: '' }, sandbox: { ...take('sandbox'), secret: '' } });
      return back(c, '/admin/paypal', `LIVE belum diaktifkan: ${(err as Error).message} Mode dikembalikan ke sandbox.`, true);
    }
  }
  await audit(store, c.get('user')!.id, 'paypal.save', { mode: saved.mode, enabled: saved.enabled, live: Boolean(saved.live.secret), sandbox: Boolean(saved.sandbox.secret) });
  return back(c, '/admin/paypal', `PayPal tersimpan (mode ${saved.mode === 'live' ? 'LIVE' : 'sandbox'}${saved.enabled ? ', aktif' : ', nonaktif'}).`);
});

admin.post('/admin/paypal/uji', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/paypal', 'Sesi formulir kedaluwarsa.', true);
  if (!c.env.MASTER_KEY) return back(c, '/admin/paypal', 'MASTER_KEY belum terpasang.', true);
  const cfg = await getPaypalConfig(c.get('store'));
  try {
    await testConnection(cfg, c.env.MASTER_KEY);
    return back(c, '/admin/paypal', `Koneksi PayPal ${cfg.mode} berhasil.`);
  } catch (err) {
    return back(c, '/admin/paypal', err instanceof PaypalError ? err.message : 'PayPal tidak dapat dihubungi.', true);
  }
});

admin.post('/admin/paypal/webhook', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/paypal', 'Sesi formulir kedaluwarsa.', true);
  if (!c.env.MASTER_KEY) return back(c, '/admin/paypal', 'MASTER_KEY belum terpasang.', true);
  const store = c.get('store');
  const cfg = await getPaypalConfig(store);
  try {
    const id = await registerWebhook(cfg, c.env.MASTER_KEY, `${origin(c)}/api/paypal/webhook`);
    const keep = (m: PaypalMode) => ({ clientId: cfg[m].clientId, secret: '', webhookId: m === cfg.mode ? id : cfg[m].webhookId });
    await savePaypalConfig(store, c.env.MASTER_KEY, { enabled: cfg.enabled, mode: cfg.mode, live: keep('live'), sandbox: keep('sandbox') });
    await audit(store, c.get('user')!.id, 'paypal.webhook', { mode: cfg.mode });
    return back(c, '/admin/paypal', `Webhook ${cfg.mode} terdaftar.`);
  } catch (err) {
    return back(c, '/admin/paypal', err instanceof PaypalError ? err.message : 'Webhook gagal didaftarkan.', true);
  }
});
