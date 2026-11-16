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
import { getPayment, getPricing, getSite, saveDoc, updatePayment, PRICING_DOC, SITE_DOC } from '../data/settings.ts';
import { COURSE_META, COURSES, CURRENCIES, METHOD_KINDS, methodLive, money, type Currency, type MethodKind, type PayMethod, type Pricing, type Tier, type User } from '../data/model.ts';
import { clearPaypalMode, getPaypalConfig, savePaypalConfig, registerWebhook, testConnection, paypalReady, PaypalError, type PaypalMode } from '../data/paypal.ts';
import { GATEWAYS, GW_META, getAllGw, getGw, gwReady, gwTest, saveGw, stripeRegisterHook, GwError, STRIPE_EVENTS, type GwId, type GwMode } from '../data/gw.ts';
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

const TABS: [string, string][] = [['/admin', 'Ringkasan'], ['/admin/pembayaran', 'Pembayaran'], ['/admin/member', 'Member'], ['/admin/harga', 'Harga & promo'], ['/admin/rekening', 'Metode bayar'], ['/admin/paypal', 'PayPal'], ['/admin/gerbang', 'Gerbang otomatis'], ['/admin/konten', 'Konten situs'], ['/admin/audit', 'Audit']];
async function shell(c: Ctx, active: string, title: string, body: Raw): Promise<Response> {
  return render(c, {
    path: active, title: `${title} — Pengelola LUAJA`, desc: 'Panel pengelola.', noindex: true, noAds: true,
    body: html`<div class="admin-bar"><div class="wrap"><span class="ab-brand">${icon('bintang')} <b>Panel pengelola</b></span><span class="ab-who">${c.get('user')!.email}</span><span class="ab-links"><a href="/">Lihat situs</a><a href="/portal">Portal member (akses penuh)</a><a class="ab-out" href="/keluar">Keluar</a></span></div></div>
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

/* ── Metode bayar: tambah / ubah / hapus rekening dan layanan internasional ───────────────────────── */
const KINDS = Object.keys(METHOD_KINDS) as MethodKind[];
/** Alasan sebuah metode tidak tampil kepada member (kosong = tayang). */
function hiddenWhy(m: PayMethod): string {
  if (!m.enabled) return 'nonaktif';
  if (!m.account.trim()) return 'akun belum diisi';
  if (!m.currencies.length) return 'tanpa mata uang';
  if (METHOD_KINDS[m.kind].holderRequired && !m.holder.trim()) return 'atas nama belum diisi';
  if (m.kind === 'swift' && !m.swift.trim()) return 'SWIFT belum diisi';
  return '';
}

admin.get('/admin/rekening', async (c) => {
  const [p, pp, gws] = await Promise.all([getPayment(c.get('store')), getPaypalConfig(c.get('store')), getAllGw(c.get('store'))]);
  const csrf = await csrfToken(c, c.get('user')!);
  return shell(c, '/admin/rekening', 'Metode bayar', html`
  <div class="page-title"><h1 style="font-size:var(--fs-5)">Metode pembayaran</h1><a class="btn btn-gold btn-sm" href="/admin/rekening/baru">+ Tambah metode</a></div>
  <p class="muted">Semua rekening dan layanan pembayaran dapat ditambah, diubah dan dihapus di sini — tanpa mengubah kode. Sebuah metode hanya tampil kepada member yang membuka tagihan dengan mata uang yang sama, dan <b>hanya bila aktif serta datanya lengkap</b>; templat yang belum diisi tetap tersembunyi.</p>
  <div class="kpi" style="margin:14px 0 18px"><div class="card"><b>${paypalReady(pp) && c.env.MASTER_KEY ? `Tayang (${pp.mode})` : 'Tersembunyi'}</b><span><a href="/admin/paypal">PayPal otomatis</a></span></div>${GATEWAYS.map((g) => html`<div class="card"><b>${gwReady(gws[g]) && c.env.MASTER_KEY ? `Tayang (${gws[g].mode})` : 'Tersembunyi'}</b><span><a href="/admin/gerbang/${g}">${GW_META[g].name} otomatis</a></span></div>`)}<div class="card"><b>${p.methods.filter(methodLive).length} / ${p.methods.length}</b><span>metode manual tayang</span></div></div>
  <div class="table-wrap"><table class="table"><tr><th>Urutan</th><th>Nama</th><th>Jenis</th><th>Mata uang</th><th>Akun</th><th>Status</th><th></th></tr>
  ${p.methods.map((m, i) => { const why = hiddenWhy(m); return html`<tr><td><form method="post" action="/admin/rekening/${m.id}/naik" style="display:inline"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm" ${i === 0 ? raw('disabled') : ''} aria-label="Naikkan">↑</button></form></td><td><b>${m.name}</b></td><td>${METHOD_KINDS[m.kind]?.label ?? m.kind}</td><td>${m.currencies.join(', ') || '—'}</td><td>${m.account || html`<span class="muted">—</span>`}</td><td>${why ? html`<span class="pill pill-line">Tersembunyi · ${why}</span>` : html`<span class="pill pill-ok">Tayang</span>`}</td><td class="row" style="gap:6px;flex-wrap:nowrap"><a class="btn btn-ghost btn-sm" href="/admin/rekening/${m.id}">Ubah</a><form method="post" action="/admin/rekening/${m.id}/hapus" data-confirm="Hapus metode ${m.name}?"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Hapus</button></form></td></tr>`; })}
  </table></div>
  <form method="post" action="/admin/rekening/umum" class="card stack" style="max-width:640px;margin-top:22px"><input type="hidden" name="_csrf" value="${csrf}"><h3 style="margin:0">Pengaturan umum</h3>
    <div class="field"><label>Catatan di bawah rekening bank</label><input name="note" value="${p.note}" maxlength="240"></div>
    <div class="field"><label>WhatsApp layanan (opsional)</label><input name="whatsapp" value="${p.whatsapp}" placeholder="62812…"></div>
    <button class="btn btn-gold" type="submit">Simpan</button></form>`);
});

function methodForm(c: Ctx, csrf: string, m: PayMethod, isNew: boolean): Promise<Response> {
  const k = METHOD_KINDS[m.kind];
  return shell(c, '/admin/rekening', isNew ? 'Tambah metode' : `Ubah ${m.name}`, html`
  <p><a href="/admin/rekening">← Semua metode</a></p><h1 style="font-size:var(--fs-5)">${isNew ? 'Tambah metode pembayaran' : `Ubah: ${m.name}`}</h1>
  ${isNew ? html`<nav class="tabs" aria-label="Jenis">${KINDS.map((x) => html`<a href="/admin/rekening/baru?jenis=${x}" ${x === m.kind ? raw('aria-current="page"') : ''}>${METHOD_KINDS[x].label}</a>`)}</nav>` : ''}
  <form method="post" action="/admin/rekening/simpan" class="card stack" style="max-width:720px"><input type="hidden" name="_csrf" value="${csrf}"><input type="hidden" name="id" value="${isNew ? '' : m.id}">
    <div class="grid g2"><div class="field"><label>Jenis</label><select name="kind">${KINDS.map((x) => html`<option value="${x}" ${x === m.kind ? raw('selected') : ''}>${METHOD_KINDS[x].label}</option>`)}</select><span class="hint">${k.hint}</span></div>
    <div class="field"><label>Nama yang dilihat pembeli</label><input name="name" value="${m.name}" required maxlength="60" placeholder="mis. BCA, BNI (USD), Wise"></div></div>
    <div class="field"><span class="lbl">Mata uang tagihan yang dilayani</span><div class="row">${CURRENCIES.map((cur) => html`<label class="check" style="padding:8px 12px"><input type="checkbox" name="cur_${cur}" ${m.currencies.includes(cur) ? raw('checked') : ''}><span><b>${cur}</b></span></label>`)}</div></div>
    <div class="grid g2"><div class="field"><label>${k.account}</label><input name="account" value="${m.account}" maxlength="80" autocomplete="off"></div>
    <div class="field"><label>Atas nama ${k.holderRequired ? '' : html`<span class="muted">(opsional)</span>`}</label><input name="holder" value="${m.holder}" maxlength="80"></div></div>
    <fieldset class="card" style="box-shadow:none"><legend>Data bank (untuk transfer bank / SWIFT)</legend>
      <div class="field"><label>Nama resmi bank</label><input name="bankName" value="${m.bankName}" maxlength="120"></div>
      <div class="grid g3"><div class="field"><label>SWIFT/BIC</label><input name="swift" value="${m.swift}" maxlength="11"></div><div class="field"><label>Kode bank</label><input name="code" value="${m.code}" maxlength="10"></div><div class="field"><label>Alamat bank</label><input name="address" value="${m.address}" maxlength="160"></div></div></fieldset>
    <div class="field"><label>Petunjuk tambahan <span class="muted">(satu langkah per baris, opsional)</span></label><textarea name="instructions" maxlength="1200">${m.instructions}</textarea></div>
    <label class="check"><input type="checkbox" name="enabled" ${m.enabled ? raw('checked') : ''}><span><b>Aktif</b><small>Tampil kepada member hanya bila aktif dan data wajib lengkap.</small></span></label>
    <button class="btn btn-gold" type="submit">Simpan metode</button></form>`);
}

admin.get('/admin/rekening/baru', async (c) => {
  const kind = (KINDS as string[]).includes(c.req.query('jenis') ?? '') ? (c.req.query('jenis') as MethodKind) : 'bank';
  const blank: PayMethod = { id: '', kind, name: kind === 'bank' || kind === 'swift' || kind === 'other' ? '' : METHOD_KINDS[kind].label, currencies: kind === 'bank' ? ['IDR'] : ['USD'], account: '', holder: '', bankName: '', swift: '', code: '', address: '', instructions: '', enabled: true };
  return methodForm(c, await csrfToken(c, c.get('user')!), blank, true);
});
admin.get('/admin/rekening/:id', async (c) => {
  const m = (await getPayment(c.get('store'))).methods.find((x) => x.id === c.req.param('id'));
  if (!m) return back(c, '/admin/rekening', 'Metode tidak ditemukan.', true);
  return methodForm(c, await csrfToken(c, c.get('user')!), m, false);
});

admin.post('/admin/rekening/simpan', async (c) => {
  const f = await guard(c);
  if (!f) return back(c, '/admin/rekening', 'Sesi formulir kedaluwarsa.', true);
  const str = (k: string, max: number) => String(f[k] ?? '').trim().slice(0, max);
  const kind = (KINDS as string[]).includes(String(f.kind)) ? (String(f.kind) as MethodKind) : 'other';
  const name = str('name', 60);
  if (!name) return back(c, '/admin/rekening', 'Nama metode wajib diisi.', true);
  const id = str('id', 60) || `${name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'metode'}-${newId('m').slice(-6).toLowerCase()}`;
  const v: PayMethod = { id, kind, name, currencies: CURRENCIES.filter((cur) => Boolean(f[`cur_${cur}`])), account: str('account', 80), holder: str('holder', 80), bankName: str('bankName', 120), swift: str('swift', 11).toUpperCase().replace(/[^A-Z0-9]/g, ''), code: str('code', 10), address: str('address', 160), instructions: String(f.instructions ?? '').replace(/\r/g, '').trim().slice(0, 1200), enabled: Boolean(f.enabled) };
  let created = false;
  await updatePayment(c.get('store'), (p) => {
    const i = p.methods.findIndex((x) => x.id === id);
    if (i >= 0) p.methods[i] = v;
    else { p.methods.push(v); created = true; }
    return p;
  });
  await audit(c.get('store'), c.get('user')!.id, created ? 'payment.method.create' : 'payment.method.update', { id, kind, name, enabled: v.enabled, live: methodLive(v) });
  return back(c, '/admin/rekening', `${name} ${created ? 'ditambahkan' : 'tersimpan'}${methodLive(v) ? ' dan tayang' : ` — tersembunyi (${hiddenWhy(v)})`}.`);
});

admin.post('/admin/rekening/:id/hapus', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/rekening', 'Sesi formulir kedaluwarsa.', true);
  const id = c.req.param('id');
  let gone = '';
  await updatePayment(c.get('store'), (p) => ({ ...p, methods: p.methods.filter((m) => (m.id === id ? ((gone = m.name), false) : true)) }));
  if (!gone) return back(c, '/admin/rekening', 'Metode tidak ditemukan.', true);
  await audit(c.get('store'), c.get('user')!.id, 'payment.method.delete', { id, name: gone });
  return back(c, '/admin/rekening', `${gone} dihapus.`);
});

admin.post('/admin/rekening/:id/naik', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/rekening', 'Sesi formulir kedaluwarsa.', true);
  const id = c.req.param('id');
  await updatePayment(c.get('store'), (p) => {
    const i = p.methods.findIndex((m) => m.id === id);
    if (i > 0) [p.methods[i - 1], p.methods[i]] = [p.methods[i]!, p.methods[i - 1]!];
    return p;
  });
  return c.redirect('/admin/rekening');
});

admin.post('/admin/rekening/umum', async (c) => {
  const f = await guard(c);
  if (!f) return back(c, '/admin/rekening', 'Sesi formulir kedaluwarsa.', true);
  await updatePayment(c.get('store'), (p) => ({ ...p, note: String(f.note ?? '').trim().slice(0, 240), whatsapp: String(f.whatsapp ?? '').replace(/[^\d]/g, '').slice(0, 16) }));
  await audit(c.get('store'), c.get('user')!.id, 'payment.general', {});
  return back(c, '/admin/rekening', 'Pengaturan pembayaran tersimpan.');
});

admin.get('/admin/konten', async (c) => {
  const s = await getSite(c.get('store'));
  const { updatedAt: _u, ...editable } = s;
  const csrf = await csrfToken(c, c.get('user')!);
  return shell(c, '/admin/konten', 'Konten situs', html`
  <h1 style="font-size:var(--fs-5)">Konten situs</h1><p class="muted">Semua teks beranda, sapaan, keunggulan, langkah, FAQ dan kontak. Teks utama dalam bahasa Indonesia; terjemahan manual bahasa Inggris dan Jepang ada di <code>i18n.en</code> dan <code>i18n.ja</code>; halaman wajib dapat ditimpa per bahasa lewat <code>pages</code> (<code>tentang</code>, <code>tentang.en</code>, <code>tentang.ja</code>, …). Simpan untuk langsung tayang. Format JSON — struktur kunci jangan diubah.</p>
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
    <div class="row"><form method="post" action="/admin/paypal/uji"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Uji koneksi (mode aktif)</button></form><form method="post" action="/admin/paypal/webhook"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Daftarkan webhook (mode aktif)</button></form></div></div>
  <div class="card" style="margin-top:18px"><h3 style="margin-top:0">Hapus kredensial</h3><p class="small muted">Menghapus client ID, secret dan webhook ID satu mode (mis. saat akun PayPal berganti pemilik). Bila mode itu sedang aktif, PayPal langsung disembunyikan dari halaman tagihan.</p>
    <div class="row">${(['live', 'sandbox'] as const).map((m) => html`<form method="post" action="/admin/paypal/hapus/${m}" data-confirm="Hapus seluruh kredensial PayPal ${m}?"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm" ${cfg[m].clientId || cfg[m].secret ? '' : raw('disabled')}>Hapus kredensial ${m === 'live' ? 'LIVE' : 'sandbox'}</button></form>`)}</div></div>`);
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

admin.post('/admin/paypal/hapus/:mode', async (c) => {
  if (!(await guard(c))) return back(c, '/admin/paypal', 'Sesi formulir kedaluwarsa.', true);
  const mode: PaypalMode = c.req.param('mode') === 'live' ? 'live' : 'sandbox';
  const out = await clearPaypalMode(c.get('store'), mode);
  await audit(c.get('store'), c.get('user')!.id, 'paypal.clear', { mode, enabled: out.enabled });
  return back(c, '/admin/paypal', `Kredensial PayPal ${mode} dihapus${out.enabled ? '' : '; PayPal kini tersembunyi'}.`);
});

/* ── Gerbang otomatis: Stripe, Xendit, Midtrans (tersembunyi sampai kunci diisi dan diaktifkan) ─────── */
const gwOf = (c: Ctx): GwId | null => ((GATEWAYS as string[]).includes(c.req.param('gw') ?? '') ? (c.req.param('gw') as GwId) : null);

admin.get('/admin/gerbang', async (c) => {
  const gws = await getAllGw(c.get('store'));
  return shell(c, '/admin/gerbang', 'Gerbang otomatis', html`
  <h1 style="font-size:var(--fs-5)">Gerbang pembayaran otomatis</h1>
  <p class="muted">Setiap gerbang <b>tersembunyi</b> dari member sampai kuncinya diisi dan diaktifkan. Begitu pembayaran dikonfirmasi gerbang, tagihan lunas dan langganan aktif tanpa verifikasi manual. PayPal diatur di tab PayPal.</p>
  <div class="grid g3" style="margin-top:18px">${GATEWAYS.map((g) => { const k = gws[g], on = gwReady(k) && Boolean(c.env.MASTER_KEY); return html`<a class="card lift" href="/admin/gerbang/${g}" style="text-decoration:none;color:inherit"><h3 style="margin:0 0 6px">${GW_META[g].name}</h3><p class="small muted" style="margin:0 0 10px">${GW_META[g].buyer.id}</p><span class="pill ${on ? 'pill-ok' : 'pill-line'}">${on ? `Tayang · ${k.mode === 'live' ? 'LIVE' : 'uji'} · ${k.currencies.join(', ')}` : 'Tersembunyi'}</span></a>`; })}</div>`);
});

admin.get('/admin/gerbang/:gw', async (c) => {
  const g = gwOf(c);
  if (!g) return back(c, '/admin/gerbang', 'Gerbang tidak dikenal.', true);
  const meta = GW_META[g];
  const cfg = await getGw(c.get('store'), g);
  const csrf = await csrfToken(c, c.get('user')!);
  const hook = `${origin(c)}/api/bayar/${g}/webhook`;
  const row = (m: GwMode) => html`<fieldset class="card" style="box-shadow:none"><legend><b>${m === 'live' ? 'LIVE' : 'Mode uji (sandbox/test)'}</b></legend>
    <div class="field"><label>${meta.pub.label}</label><input name="${m}_pub" value="${cfg[m].pub}" autocomplete="off" spellcheck="false" placeholder="${meta.pub.example[m]}"></div>
    <div class="field"><label>${meta.secret.label} ${cfg[m].secret ? html`<span class="pill pill-ok">tersimpan terenkripsi</span>` : html`<span class="pill pill-line">belum ada</span>`}</label><input name="${m}_secret" type="password" autocomplete="new-password" placeholder="${cfg[m].secret ? 'Kosongkan bila tidak diganti' : meta.secret.example[m]}"></div>
    ${meta.hook ? html`<div class="field"><label>${meta.hook.label} ${cfg[m].hook ? html`<span class="pill pill-ok">tersimpan terenkripsi</span>` : html`<span class="pill pill-line">belum ada</span>`}</label><input name="${m}_hook" type="password" autocomplete="new-password" placeholder="${cfg[m].hook ? 'Kosongkan bila tidak diganti' : ''}"><span class="hint">${meta.hook.hint}</span></div>` : ''}</fieldset>`;
  return shell(c, '/admin/gerbang', meta.name, html`
  <p><a href="/admin/gerbang">← Semua gerbang</a></p>
  <h1 style="font-size:var(--fs-5)">${meta.name}</h1>
  <p class="muted">${meta.buyer.id} ${meta.setup}</p>
  ${c.env.MASTER_KEY ? '' : html`<div class="alert alert-bad">Kunci induk (MASTER_KEY) belum terpasang di server — kunci belum bisa disimpan.</div>`}
  <div class="kpi" style="margin-bottom:18px"><div class="card"><b>${cfg.mode === 'live' ? 'LIVE' : 'Uji'}</b><span>mode aktif</span></div><div class="card"><b>${gwReady(cfg) && c.env.MASTER_KEY ? 'Tayang' : 'Tersembunyi'}</b><span>status di halaman tagihan</span></div>${meta.hook ? html`<div class="card"><b>${cfg[cfg.mode].hook ? 'Terpasang' : 'Belum'}</b><span>webhook ${cfg.mode}</span></div>` : ''}</div>
  <form method="post" class="stack"><input type="hidden" name="_csrf" value="${csrf}">
    <label class="check"><input type="checkbox" name="enabled" ${cfg.enabled ? raw('checked') : ''}><span><b>Aktifkan ${meta.name} di halaman tagihan</b><small>Tombol pembayaran tampil untuk mata uang yang dipilih.</small></span></label>
    <div class="grid g2"><div class="field"><label>Mode</label><select name="mode"><option value="test" ${cfg.mode === 'test' ? raw('selected') : ''}>Uji (sandbox/test)</option><option value="live" ${cfg.mode === 'live' ? raw('selected') : ''}>LIVE (uang sungguhan)</option></select><span class="hint">LIVE hanya bisa disimpan bila uji koneksi live berhasil.</span></div>
    <div class="field"><span class="lbl">Mata uang</span><div class="row">${meta.supports.map((cur) => html`<label class="check" style="padding:8px 12px"><input type="checkbox" name="cur_${cur}" ${cfg.currencies.includes(cur) ? raw('checked') : ''}><span><b>${cur}</b></span></label>`)}</div></div></div>
    <div class="grid g2">${row('live')}${row('test')}</div>
    <button class="btn btn-gold" type="submit">Simpan ${meta.name}</button>
  </form>
  <div class="card" style="margin-top:18px"><h3 style="margin-top:0">Webhook / notifikasi</h3><p>URL: <code>${hook}</code></p>${g === 'stripe' ? html`<p class="small muted">Peristiwa: ${STRIPE_EVENTS.join(', ')}.</p>` : ''}
    <div class="row"><form method="post" action="/admin/gerbang/${g}/uji"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Uji koneksi (mode aktif)</button></form>${meta.autoHook ? html`<form method="post" action="/admin/gerbang/${g}/webhook"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm">Daftarkan webhook (mode aktif)</button></form>` : ''}</div></div>
  <div class="card" style="margin-top:18px"><h3 style="margin-top:0">Hapus kunci</h3><p class="small muted">Menghapus semua kunci satu mode (mis. saat akun berganti pemilik). Bila mode itu aktif, ${meta.name} langsung disembunyikan.</p>
    <div class="row">${(['live', 'test'] as const).map((m) => html`<form method="post" action="/admin/gerbang/${g}/hapus/${m}" data-confirm="Hapus seluruh kunci ${meta.name} ${m}?"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm" ${cfg[m].pub || cfg[m].secret ? '' : raw('disabled')}>Hapus kunci ${m === 'live' ? 'LIVE' : 'uji'}</button></form>`)}</div></div>`);
});

admin.post('/admin/gerbang/:gw', async (c) => {
  const g = gwOf(c);
  if (!g) return back(c, '/admin/gerbang', 'Gerbang tidak dikenal.', true);
  const path = `/admin/gerbang/${g}`;
  const f = await guard(c);
  if (!f) return back(c, path, 'Sesi formulir kedaluwarsa.', true);
  if (!c.env.MASTER_KEY) return back(c, path, 'MASTER_KEY belum terpasang di server.', true);
  const store = c.get('store');
  const mode: GwMode = f.mode === 'live' ? 'live' : 'test';
  const take = (m: GwMode) => ({ pub: String(f[`${m}_pub`] ?? ''), secret: String(f[`${m}_secret`] ?? ''), hook: String(f[`${m}_hook`] ?? '') });
  const currencies = CURRENCIES.filter((cur) => Boolean(f[`cur_${cur}`]));
  let saved;
  try {
    saved = await saveGw(store, c.env.MASTER_KEY, g, { enabled: Boolean(f.enabled), mode, currencies, live: take('live'), test: take('test') });
  } catch (err) {
    return back(c, path, err instanceof GwError ? err.message : 'Kunci tidak dapat disimpan.', true);
  }
  // LIVE hanya aktif bila kunci live diterima gerbang; bila gagal, kembali ke mode uji.
  if (saved.mode === 'live' && saved.enabled) {
    try {
      await gwTest(g, saved, c.env.MASTER_KEY);
    } catch (err) {
      const keep = (m: GwMode) => ({ pub: saved[m].pub, secret: '', hook: '' });
      await saveGw(store, c.env.MASTER_KEY, g, { enabled: saved.enabled, mode: 'test', currencies: saved.currencies, live: keep('live'), test: keep('test') });
      return back(c, path, `LIVE belum diaktifkan: ${(err as Error).message} Mode dikembalikan ke uji.`, true);
    }
  }
  await audit(store, c.get('user')!.id, `${g}.save`, { mode: saved.mode, enabled: saved.enabled, currencies: saved.currencies, live: Boolean(saved.live.secret), test: Boolean(saved.test.secret) });
  return back(c, path, `${GW_META[g].name} tersimpan (mode ${saved.mode === 'live' ? 'LIVE' : 'uji'}${saved.enabled ? ', aktif' : ', nonaktif'}).`);
});

admin.post('/admin/gerbang/:gw/uji', async (c) => {
  const g = gwOf(c);
  if (!g) return back(c, '/admin/gerbang', 'Gerbang tidak dikenal.', true);
  const path = `/admin/gerbang/${g}`;
  if (!(await guard(c))) return back(c, path, 'Sesi formulir kedaluwarsa.', true);
  if (!c.env.MASTER_KEY) return back(c, path, 'MASTER_KEY belum terpasang.', true);
  const cfg = await getGw(c.get('store'), g);
  try {
    await gwTest(g, cfg, c.env.MASTER_KEY);
    return back(c, path, `Koneksi ${GW_META[g].name} ${cfg.mode} berhasil.`);
  } catch (err) {
    return back(c, path, err instanceof GwError ? err.message : `${GW_META[g].name} tidak dapat dihubungi.`, true);
  }
});

admin.post('/admin/gerbang/:gw/webhook', async (c) => {
  const g = gwOf(c);
  if (g !== 'stripe') return back(c, '/admin/gerbang', 'Pendaftaran webhook otomatis hanya untuk Stripe.', true);
  const path = '/admin/gerbang/stripe';
  if (!(await guard(c))) return back(c, path, 'Sesi formulir kedaluwarsa.', true);
  if (!c.env.MASTER_KEY) return back(c, path, 'MASTER_KEY belum terpasang.', true);
  const store = c.get('store');
  const cfg = await getGw(store, g);
  try {
    await stripeRegisterHook(store, cfg, c.env.MASTER_KEY, `${origin(c)}/api/bayar/stripe/webhook`);
    await audit(store, c.get('user')!.id, 'stripe.webhook', { mode: cfg.mode });
    return back(c, path, `Webhook Stripe ${cfg.mode} terdaftar dan rahasianya tersimpan.`);
  } catch (err) {
    return back(c, path, err instanceof GwError ? err.message : 'Webhook gagal didaftarkan.', true);
  }
});

admin.post('/admin/gerbang/:gw/hapus/:mode', async (c) => {
  const g = gwOf(c);
  if (!g) return back(c, '/admin/gerbang', 'Gerbang tidak dikenal.', true);
  const path = `/admin/gerbang/${g}`;
  if (!(await guard(c))) return back(c, path, 'Sesi formulir kedaluwarsa.', true);
  if (!c.env.MASTER_KEY) return back(c, path, 'MASTER_KEY belum terpasang.', true);
  const mode: GwMode = c.req.param('mode') === 'live' ? 'live' : 'test';
  const cfg = await getGw(c.get('store'), g);
  const keep = (m: GwMode) => ({ pub: cfg[m].pub, secret: '', hook: '' });
  const out = await saveGw(c.get('store'), c.env.MASTER_KEY, g, { enabled: cfg.mode === mode ? false : cfg.enabled, mode: cfg.mode, currencies: cfg.currencies, live: keep('live'), test: keep('test') }, mode);
  await audit(c.get('store'), c.get('user')!.id, `${g}.clear`, { mode, enabled: out.enabled });
  return back(c, path, `Kunci ${GW_META[g].name} ${mode} dihapus${out.enabled ? '' : `; ${GW_META[g].name} kini tersembunyi`}.`);
});
