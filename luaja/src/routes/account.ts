/**
 * Akun & portal member: daftar, masuk, keluar, beranda portal, paket & tagihan (rekening hanya tampil kepada member yang
 * punya tagihan), unggah bukti bayar + dokumen promo (≤ 5 MB, JPG/PNG/WebP/PDF), riwayat latihan, akun.
 */
import { Hono } from 'hono';
import { html, raw, type Raw } from '../lib/html.ts';
import { csrfOk, csrfToken, endSession, startSession, type Ctx, type HonoEnv } from '../lib/session.ts';
import { render } from '../lib/render.ts';
import { limit } from '../lib/ratelimit.ts';
import { timingSafeEqual, verifyPassword, hashPassword } from '../lib/crypto.ts';
import { fmtDate } from '../lib/i18n.ts';
import { createUser, EmailTakenError, findByEmail, getSubs, isAdmin, updateUser, hasAccess } from '../data/users.ts';
import { audit, event } from '../data/audit.ts';
import { getPayment, getPricing } from '../data/settings.ts';
import { cancelInvoice, createInvoice, getInvoice, listUserInvoices, proofKey, submitProof } from '../data/invoices.ts';
import { COURSE_META, COURSES, CURRENCIES, money, unitPrices, type Course, type Currency, type Invoice, type ProofFile, type Tier, type User } from '../data/model.ts';
import { getPaypalConfig, paypalReady, PAYPAL_CURRENCIES } from '../data/paypal.ts';
import { getProgress, listAttempts } from '../data/progress.ts';
import { getSet, levelName } from '../practice/index.ts';
import { getLesson } from '../course/index.ts';
import { icon } from '../pages/layout.ts';

/** Akun pemilik bersama (sama dengan ulyah.com / axto.io / xscan.es): hanya hash sandi di kode. */
const OWNER_SEED = { email: 'alghoniy2026@gmail.com', passwordHash: 'pbkdf2$100000$VOy29DR3UljFD-WLZEuH4w$Qsk_ukvOGQp2F8DVY4SqFqidY7f9aNa4a9_ubpqu22c' };

export const account = new Hono<HonoEnv>();

const STATUS: Record<Invoice['status'], [string, string]> = {
  unpaid: ['Menunggu pembayaran', 'pill-warn'], review: ['Sedang diverifikasi', 'pill-info'], approved: ['Aktif', 'pill-ok'], rejected: ['Ditolak — unggah ulang', 'pill-bad'], cancelled: ['Dibatalkan', 'pill-line'],
};
const TIER_ICON: Record<Tier, string> = { umum: 'dunia', pelajar: 'sekolah', juara: 'piala' };
const safeNext = (n: unknown) => (typeof n === 'string' && /^\/[a-z0-9/_?=&#%.-]*$/i.test(n) && !n.startsWith('//') ? n : '');

function authShell(title: string, body: Raw, aside?: Raw): Raw {
  return html`<section class="section"><div class="wrap auth-grid"><div class="auth card">${body}</div>${aside ?? html`<aside class="auth-aside"><h2>${title}</h2><ul class="goals"><li>Pelajaran interaktif Jerman, Inggris, Jepang</li><li>Bank latihan soal dengan prediksi nilai</li><li>Riwayat dan perkembangan tersimpan</li><li>Satu tahun akses penuh setelah terverifikasi</li></ul></aside>`}</div></section>`;
}
const flash = (err?: string, ok?: string) => html`${err ? html`<div class="alert alert-bad" role="alert">${err}</div>` : ''}${ok ? html`<div class="alert alert-ok" role="status">${ok}</div>` : ''}`;

function loginBody(err?: string, email = '', next = '', admin = false): Raw {
  return html`<p class="eyebrow">${admin ? 'Akses pengelola' : 'Portal member'}</p><h1 style="font-size:var(--fs-5)">${admin ? 'Masuk pengelola' : 'Masuk'}</h1>${flash(err)}
  <form method="post" action="${admin ? '/admin/masuk' : '/masuk'}" class="stack">
    <input type="hidden" name="lanjut" value="${next}">
    <div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" required value="${email}"></div>
    <div class="field"><label for="pw">Kata sandi</label><input id="pw" name="password" type="password" autocomplete="current-password" required minlength="8"></div>
    <button class="btn btn-gold btn-lg" style="width:100%" type="submit">Masuk</button>
  </form>${admin ? '' : html`<p class="small muted center" style="margin-top:16px">Belum punya akun? <a href="/daftar${next ? `?lanjut=${encodeURIComponent(next)}` : ''}">Daftar</a> · <a href="/lupa-sandi">Lupa kata sandi?</a></p>`}`;
}

async function doLogin(c: Ctx, admin: boolean): Promise<Response> {
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  const f = await c.req.parseBody();
  const next = safeNext(f.lanjut);
  const email = String(f.email ?? '').trim().toLowerCase();
  const password = String(f.password ?? '');
  if (!(await limit(c.env, `login:${ip}`, 20, 900))) return render(c, { path: c.req.path, title: 'Masuk — LUAJA', desc: 'Masuk ke portal.', noindex: true, noAds: true, body: authShell('Masuk', loginBody('Terlalu banyak percobaan. Coba lagi 15 menit lagi.', email, next, admin)) }, 429);
  const store = c.get('store');
  let user = await findByEmail(store, email);
  const seedOk = !user && email === OWNER_SEED.email && (await verifyPassword(password, OWNER_SEED.passwordHash));
  const secretOk = Boolean(!user && c.env.OWNER_BOOTSTRAP_EMAIL && c.env.OWNER_BOOTSTRAP_PASSWORD && email === c.env.OWNER_BOOTSTRAP_EMAIL.trim().toLowerCase() && timingSafeEqual(password, c.env.OWNER_BOOTSTRAP_PASSWORD));
  if (!user && (seedOk || secretOk)) {
    if (await store.createOnce('u/owner', { email, at: Date.now() })) {
      user = await createUser(store, { email, name: 'Pemilik', password, role: 'owner' });
      await audit(store, user.id, 'owner.bootstrap', {});
    }
  }
  if (!user || user.suspended || !(await verifyPassword(password, user.pass))) {
    return render(c, { path: c.req.path, title: 'Masuk — LUAJA', desc: 'Masuk ke portal.', noindex: true, noAds: true, body: authShell('Masuk', loginBody('E-mail atau kata sandi salah.', email, next, admin)) }, 401);
  }
  if (admin && !isAdmin(user)) return render(c, { path: c.req.path, title: 'Masuk — LUAJA', desc: 'Masuk.', noindex: true, noAds: true, body: authShell('Masuk', loginBody('Akun ini tidak memiliki akses pengelola.', email, next, admin)) }, 403);
  await updateUser(store, user.id, (u) => ({ ...u, lastLoginAt: Date.now() }));
  await startSession(c, user);
  return c.redirect(next || (isAdmin(user) ? '/admin' : '/portal'));
}

account.get('/masuk', (c) => {
  if (c.get('user')) return c.redirect('/portal');
  const next = safeNext(c.req.query('lanjut'));
  return render(c, { path: '/masuk', title: 'Masuk — LUAJA', desc: 'Masuk ke portal member LUAJA.', noindex: true, noAds: true, body: authShell('Selamat datang kembali', loginBody(undefined, '', next)) });
});
account.post('/masuk', (c) => doLogin(c, false));
account.get('/admin/masuk', (c) => {
  if (isAdmin(c.get('user'))) return c.redirect('/admin');
  return render(c, { path: '/admin/masuk', title: 'Pengelola — LUAJA', desc: 'Akses pengelola.', noindex: true, noAds: true, body: authShell('Pengelola', loginBody(undefined, '', '', true), html`<aside class="auth-aside"><h2>Panel pengelola</h2><p class="muted">Verifikasi pembayaran, member, harga, rekening dan konten situs.</p></aside>`) });
});
account.post('/admin/masuk', (c) => doLogin(c, true));

function registerBody(err?: string, v: { name?: string; email?: string } = {}, next = ''): Raw {
  return html`<p class="eyebrow">Akun baru</p><h1 style="font-size:var(--fs-5)">Daftar LUAJA</h1>${flash(err)}
  <form method="post" action="/daftar" class="stack">
    <input type="hidden" name="lanjut" value="${next}">
    <div class="field"><label for="name">Nama lengkap</label><input id="name" name="name" autocomplete="name" required maxlength="80" value="${v.name ?? ''}"></div>
    <div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" required value="${v.email ?? ''}"></div>
    <div class="field"><label for="pw">Kata sandi</label><input id="pw" name="password" type="password" autocomplete="new-password" required minlength="8"><span class="hint">Minimal 8 karakter.</span></div>
    <label class="check"><input type="checkbox" name="setuju" required><span>Saya menyetujui <a href="/syarat" target="_blank">syarat & ketentuan</a> dan <a href="/privasi" target="_blank">kebijakan privasi</a>.</span></label>
    <button class="btn btn-gold btn-lg" style="width:100%" type="submit">Buat akun</button>
  </form><p class="small muted center" style="margin-top:16px">Sudah punya akun? <a href="/masuk">Masuk</a></p>`;
}
account.get('/daftar', (c) => {
  if (c.get('user')) return c.redirect('/portal');
  const next = safeNext(c.req.query('lanjut')) || (c.req.query('paket') ? `/portal/paket?jumlah=${c.req.query('paket') === '3' ? 3 : 1}` : '');
  return render(c, { path: '/daftar', title: 'Daftar — LUAJA', desc: 'Buat akun LUAJA untuk menyimpan kemajuan belajar dan berlangganan.', noindex: true, noAds: true, body: authShell('Mulai perjalanan bahasa Anda', registerBody(undefined, {}, next)) });
});
account.post('/daftar', async (c) => {
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  const f = await c.req.parseBody();
  const v = { name: String(f.name ?? '').trim(), email: String(f.email ?? '').trim().toLowerCase() };
  const next = safeNext(f.lanjut);
  const pw = String(f.password ?? '');
  const fail = (m: string, s: 400 | 429 = 400) => render(c, { path: '/daftar', title: 'Daftar — LUAJA', desc: 'Daftar.', noindex: true, noAds: true, body: authShell('Daftar', registerBody(m, v, next)) }, s);
  if (!(await limit(c.env, `reg:${ip}`, 10, 3600))) return fail('Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.', 429);
  if (!v.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) || pw.length < 8 || !f.setuju) return fail('Lengkapi nama, e-mail yang valid, kata sandi minimal 8 karakter, dan persetujuan.');
  if (v.email === OWNER_SEED.email) return fail('E-mail ini sudah terdaftar. Silakan masuk.');
  try {
    const user = await createUser(c.get('store'), { email: v.email, name: v.name, password: pw });
    await event(c.get('store'), 'user.register', { uid: user.id });
    await startSession(c, user);
    return c.redirect(next || '/portal?baru=1');
  } catch (err) {
    if (err instanceof EmailTakenError) return fail('E-mail ini sudah terdaftar. Silakan masuk atau gunakan e-mail lain.');
    throw err;
  }
});
account.get('/lupa-sandi', async (c) => {
  const pay = await getPayment(c.get('store'));
  return render(c, { path: '/lupa-sandi', title: 'Lupa kata sandi — LUAJA', desc: 'Bantuan kata sandi.', noindex: true, noAds: true, body: authShell('Bantuan akun', html`<p class="eyebrow">Bantuan akun</p><h1 style="font-size:var(--fs-5)">Lupa kata sandi</h1><p>Demi keamanan, penyetelan ulang kata sandi dilakukan tim kami setelah verifikasi pemilik akun. Hubungi kami dari e-mail yang terdaftar:</p><p><a class="btn btn-ghost" href="mailto:halo@luaja.com?subject=Setel%20ulang%20kata%20sandi">${icon('surat')} halo@luaja.com</a>${pay.whatsapp ? html` <a class="btn btn-ghost" href="https://wa.me/${pay.whatsapp.replace(/\D/g, '')}">${icon('wa')} WhatsApp</a>` : ''}</p><p class="small muted">Sertakan nama lengkap dan e-mail akun. Kata sandi sementara dikirim ke e-mail tersebut.</p>`) });
});
account.post('/keluar', async (c) => {
  endSession(c);
  return c.redirect('/');
});
account.get('/keluar', (c) => {
  endSession(c);
  return c.redirect('/');
});

/* ── portal ──────────────────────────────────────────────────────────────── */
account.use('/portal/*', async (c, next) => {
  if (!c.get('user')) return c.redirect(`/masuk?lanjut=${encodeURIComponent(c.req.path)}`);
  await next();
});
account.use('/portal', async (c, next) => {
  if (!c.get('user')) return c.redirect('/masuk?lanjut=/portal');
  await next();
});

const NAV: [string, string, string][] = [['/portal', 'Beranda', 'tangga'], ['/portal/paket', 'Paket & pembayaran', 'kartu'], ['/portal/latihan', 'Riwayat latihan', 'ujian'], ['/portal/akun', 'Akun', 'masuk']];
function portal(c: Ctx, active: string, title: string, body: Raw): Promise<Response> {
  const u = c.get('user')!;
  return render(c, {
    path: active, title: `${title} — Portal LUAJA`, desc: 'Portal member LUAJA.', noindex: true, noAds: true,
    body: html`<div class="wrap portal"><nav class="side" aria-label="Portal"><div class="who"><b>${u.name}</b><small>${u.email}</small></div>${NAV.map(([href, label, ic]) => html`<a href="${href}" ${href === active ? raw('aria-current="page"') : ''}>${icon(ic)}${label}</a>`)}${isAdmin(u) ? html`<a href="/admin">${icon('bintang')}Panel pengelola</a>` : ''}<form method="post" action="/keluar"><button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px" type="submit">Keluar</button></form></nav><div>${body}</div></div>`,
  });
}

account.get('/portal', async (c) => {
  const u = c.get('user')!, store = c.get('store'), subs = c.get('subs');
  const [prog, invs, atts] = await Promise.all([getProgress(store, u.id), listUserInvoices(store, u.id), listAttempts(store, u.id, 6)]);
  const passed = Object.values(prog.lessons).filter((x) => x.passed).length;
  const last = prog.last ? getLesson(prog.last) : undefined;
  const pending = invs.find((i) => i.status === 'unpaid' || i.status === 'review' || i.status === 'rejected');
  return portal(c, '/portal', 'Beranda', html`
  ${c.req.query('baru') ? html`<div class="alert alert-ok">Selamat datang di LUAJA, ${u.name.split(' ')[0]}! Mulailah dari pelajaran gratis atau pilih paket untuk membuka seluruh materi.</div>` : ''}
  <div class="page-title"><h1>Halo, ${u.name.split(' ')[0]}</h1>${last ? html`<a class="btn btn-gold" href="/belajar/${last.code}">${icon('main')} Lanjutkan: ${last.title}</a>` : html`<a class="btn btn-gold" href="/coba">${icon('main')} Mulai pelajaran gratis</a>`}</div>
  ${pending ? html`<div class="notice" style="margin-bottom:18px">Tagihan <b>${pending.number}</b> — ${STATUS[pending.status][0]}. <a href="/portal/tagihan/${pending.id}">Buka tagihan</a></div>` : ''}
  <div class="kpi"><div class="card"><b>${passed}</b><span>pelajaran lulus</span></div><div class="card"><b>${atts.length}</b><span>latihan terakhir</span></div><div class="card"><b>${COURSES.filter((k) => hasAccess(subs, k, u)).length}</b><span>bahasa aktif</span></div></div>
  <h2 style="font-size:var(--fs-4);margin-top:28px">Langganan</h2>
  <div class="grid g3">${COURSES.map((k) => { const s = subs[k]; const on = hasAccess(subs, k, u); return html`<div class="card"><h3 style="margin:0 0 6px">${COURSE_META[k].name}</h3>${on ? html`<span class="pill pill-ok">Aktif${s ? ` s.d. ${fmtDate('id', s.until)}` : ''}</span><p style="margin:12px 0 0"><a href="/${COURSE_META[k].slug}">Buka jalur →</a></p>` : html`<span class="pill pill-line">Belum aktif</span><p style="margin:12px 0 0"><a href="/portal/paket">Pilih paket →</a></p>`}</div>`; })}</div>
  <h2 style="font-size:var(--fs-4);margin-top:28px">Latihan terakhir</h2>
  ${atts.length ? html`<div class="table-wrap"><table class="table"><tr><th>Paket</th><th>Nilai</th><th>Prediksi</th><th>Tanggal</th></tr>${atts.map((a) => { const s = getSet(a.set); return html`<tr><td><a href="/latihan/${a.set}">${s?.title ?? a.set}</a></td><td>${a.pct}%</td><td>${a.score}</td><td>${fmtDate('id', a.at, true)}</td></tr>`; })}</table></div>` : html`<p class="muted">Belum ada. <a href="/latihan">Mulai latihan soal</a>.</p>`}`);
});

account.get('/portal/paket', async (c) => {
  const store = c.get('store');
  const [pricing, invs] = await Promise.all([getPricing(store), listUserInvoices(store, c.get('user')!.id)]);
  const tiers = (Object.keys(pricing.tiers) as Tier[]).filter((t) => pricing.tiers[t].enabled);
  const preset3 = c.req.query('jumlah') === '3';
  const lang = c.get('lang') as string;
  const defCur: Currency = lang === 'ja' ? 'JPY' : lang === 'en' ? 'USD' : 'IDR';
  return portal(c, '/portal/paket', 'Paket & pembayaran', html`
  <div class="page-title"><h1>Pilih paket</h1><a class="btn btn-ghost btn-sm" href="/harga">Rincian harga</a></div>
  ${c.req.query('err') ? html`<div class="alert alert-bad">${c.req.query('err')}</div>` : ''}
  <form method="post" action="/portal/paket" class="card stack" data-buy>
    <input type="hidden" name="_csrf" value="${await csrfToken(c, c.get('user')!)}">
    <div class="field"><span class="lbl">1. Bahasa</span><div class="grid g3">${COURSES.map((k) => html`<label class="check"><input type="checkbox" name="bahasa" value="${k}" ${preset3 ? raw('checked') : ''}><span><b>${COURSE_META[k].name}</b><small>${COURSE_META[k].levels[0]!.name}–${COURSE_META[k].levels[COURSE_META[k].levels.length - 1]!.name}${k === 'en' ? ' + TOEFL & IELTS' : ''}</small></span></label>`)}</div></div>
    <div class="field"><span class="lbl">2. Mata uang</span><div class="grid g3">${CURRENCIES.map((cur) => html`<label class="check"><input type="radio" name="mata_uang" value="${cur}" ${cur === defCur ? raw('checked') : ''}><span><b>${cur === 'IDR' ? 'Rupiah (IDR)' : cur === 'USD' ? 'Dolar AS (USD)' : 'Yen (JPY)'}</b><small>${cur === 'IDR' ? 'Transfer SeaBank / BNI' : 'PayPal otomatis atau transfer bank internasional (SWIFT)'}</small></span></label>`)}</div></div>
    <div class="field"><span class="lbl">3. Kategori</span><div class="grid g3">${tiers.map((t, i) => html`<label class="check"><input type="radio" name="kategori" value="${t}" ${i === 0 ? raw('checked') : ''} ${raw(CURRENCIES.map((cur) => { const u = unitPrices(pricing.tiers[t], cur); return `data-one-${cur}="${u.one}" data-three-${cur}="${u.three}"`; }).join(' '))}><span><b>${icon(TIER_ICON[t])} ${pricing.tiers[t].label}</b><small data-tier-price="${t}">${money(unitPrices(pricing.tiers[t], defCur).one, defCur)}/bahasa · ${money(unitPrices(pricing.tiers[t], defCur).three, defCur)} tiga bahasa</small><small>${pricing.tiers[t].note}</small></span></label>`)}</div></div>
    <div class="row between total-bar"><div><small class="muted">Total per tahun</small><div class="amount" data-total>Rp0</div></div><button class="btn btn-gold btn-lg" type="submit">Buat tagihan</button></div>
    <p class="small muted" style="margin:0">Setelah tagihan dibuat, rekening tujuan dan nominal tampil di halaman tagihan. Akses terbuka setelah bukti pembayaran terverifikasi.</p>
  </form>
  <script src="/assets/bayar.js?v=1" defer></script>
  <h2 style="font-size:var(--fs-4);margin-top:28px">Tagihan saya</h2>
  ${invs.length ? html`<div class="table-wrap"><table class="table"><tr><th>Nomor</th><th>Bahasa</th><th>Kategori</th><th>Jumlah</th><th>Status</th><th></th></tr>${invs.map((i) => html`<tr><td>${i.number}</td><td>${i.courses.map((k) => COURSE_META[k].name).join(', ')}</td><td>${pricing.tiers[i.tier]?.label ?? i.tier}</td><td>${money(i.amount, i.currency ?? 'IDR')}</td><td><span class="pill ${STATUS[i.status][1]}">${STATUS[i.status][0]}</span></td><td><a href="/portal/tagihan/${i.id}">Buka</a></td></tr>`)}</table></div>` : html`<p class="muted">Belum ada tagihan.</p>`}`);
});

account.post('/portal/paket', async (c) => {
  const u = c.get('user')!, store = c.get('store');
  const f = await c.req.parseBody({ all: true });
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return c.text('Sesi formulir kedaluwarsa. Muat ulang halaman.', 403);
  const raw = f.bahasa;
  const courses = (Array.isArray(raw) ? raw : raw ? [raw] : []).map(String).filter((k): k is Course => (COURSES as readonly string[]).includes(k));
  const tier = String(f.kategori ?? 'umum') as Tier;
  const currency = (CURRENCIES as readonly string[]).includes(String(f.mata_uang)) ? (String(f.mata_uang) as Currency) : 'IDR';
  const pricing = await getPricing(store);
  if (!courses.length) return c.redirect(`/portal/paket?err=${encodeURIComponent('Pilih minimal satu bahasa.')}`);
  if (!pricing.tiers[tier]?.enabled) return c.redirect(`/portal/paket?err=${encodeURIComponent('Kategori tidak tersedia.')}`);
  if (!(await limit(c.env, `inv:${u.id}`, 10, 3600))) return c.redirect(`/portal/paket?err=${encodeURIComponent('Terlalu banyak tagihan dibuat. Coba lagi nanti.')}`);
  const inv = await createInvoice(store, u.id, courses, tier, pricing, currency);
  await event(store, 'invoice.create', { id: inv.id, amount: inv.amount, currency });
  return c.redirect(`/portal/tagihan/${inv.id}`);
});

const ACCEPT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };
const MAX = 5 * 1024 * 1024;

account.get('/portal/tagihan/:id', async (c) => {
  const u = c.get('user')!, store = c.get('store');
  const inv = await getInvoice(store, c.req.param('id'));
  if (!inv || (inv.userId !== u.id && !isAdmin(u))) return c.notFound();
  const [pay, pricing, ppc] = await Promise.all([getPayment(store), getPricing(store), getPaypalConfig(store)]);
  const ppOn = Boolean(c.env.MASTER_KEY) && paypalReady(ppc) && PAYPAL_CURRENCIES.includes(inv.currency);
  const t = pricing.tiers[inv.tier];
  const canUpload = inv.status === 'unpaid' || inv.status === 'rejected';
  const csrf = await csrfToken(c, u);
  return portal(c, '/portal/paket', `Tagihan ${inv.number}`, html`
  <div class="page-title"><h1>Tagihan ${inv.number}</h1><span class="pill ${STATUS[inv.status][1]}">${STATUS[inv.status][0]}</span></div>
  ${c.req.query('ok') ? html`<div class="alert alert-ok">Bukti pembayaran terkirim. Tim kami memverifikasinya; akses terbuka otomatis setelah disetujui.</div>` : ''}
  ${c.req.query('err') ? html`<div class="alert alert-bad">${c.req.query('err')}</div>` : ''}
  ${inv.status === 'rejected' && inv.reason ? html`<div class="alert alert-bad"><b>Alasan penolakan:</b> ${inv.reason}. Silakan unggah ulang.</div>` : ''}
  <div class="grid g2" style="align-items:start">
    <div class="card"><h3 style="margin-top:0">Rincian</h3><table class="table" style="min-width:0"><tr><td>Bahasa</td><td>${inv.courses.map((k) => COURSE_META[k].name).join(', ')}</td></tr><tr><td>Kategori</td><td>${t?.label ?? inv.tier}</td></tr><tr><td>Masa aktif</td><td>${pricing.days} hari sejak disetujui</td></tr><tr><td>Dibuat</td><td>${fmtDate('id', inv.createdAt, true)}</td></tr>${inv.activeUntil ? html`<tr><td>Aktif sampai</td><td>${fmtDate('id', inv.activeUntil)}</td></tr>` : ''}</table>
      <div class="amount" style="margin-top:14px">${money(inv.amount, inv.currency)}</div>
      <p style="margin:12px 0 0"><a class="btn btn-ghost btn-sm" href="/portal/tagihan/${inv.id}/invoice" target="_blank" rel="noopener">${inv.status === 'approved' ? 'Lihat kuitansi' : 'Lihat invoice'}</a> <a class="btn btn-ghost btn-sm" href="/portal/tagihan/${inv.id}/invoice?unduh=1">Unduh</a></p></div>
    ${inv.status === 'approved' ? html`<div class="card card-tint"><h3 style="margin-top:0">${icon('cek')} Pembayaran terverifikasi</h3><p>Langganan Anda aktif. Selamat belajar!</p><a class="btn btn-gold" href="/${COURSE_META[inv.courses[0]!].slug}">Mulai belajar</a></div>` :
      inv.status === 'cancelled' ? html`<div class="card"><p>Tagihan dibatalkan. <a href="/portal/paket">Buat tagihan baru</a>.</p></div>` :
      html`<div class="stack" style="--stack:14px">
        ${ppOn ? html`<div class="card card-tint" data-paypal="${inv.id}" data-client="${ppc[ppc.mode].clientId}" data-currency="${inv.currency}"><h3 style="margin:0 0 6px">Bayar otomatis dengan PayPal</h3><p class="small muted" style="margin:0 0 12px">Kartu kredit/debit atau saldo PayPal. Langganan langsung aktif begitu pembayaran berhasil.${ppc.mode === 'sandbox' ? ' (mode uji/sandbox)' : ''}</p><div data-paypal-buttons></div><p class="small" data-paypal-msg></p></div>` : ''}
        ${inv.currency === 'IDR' ? html`<div class="bank"><small>Transfer ke rekening resmi LUAJA</small><b style="font-size:var(--fs-3)">${pay.bank}</b><div class="acct">${pay.account}<button class="btn btn-sm" type="button" data-copy="${pay.account}">Salin</button></div><span>a.n. <b>${pay.holder}</b></span><span>Atau BNI ${pay.bni.accounts.IDR} <button class="btn btn-sm" type="button" data-copy="${pay.bni.accounts.IDR}">Salin</button> a.n. ${pay.bni.holder}</span><span>Nominal tepat: <b>${money(inv.amount, inv.currency)}</b> <button class="btn btn-sm" type="button" data-copy="${String(inv.amount)}">Salin</button></span><small>${pay.note}</small></div>` :
          html`<div class="bank"><small>Transfer bank internasional (SWIFT) ke BNI</small><b style="font-size:var(--fs-3)">${pay.bni.name}</b><div class="acct">${pay.bni.accounts[inv.currency]}<button class="btn btn-sm" type="button" data-copy="${pay.bni.accounts[inv.currency]}">Salin</button></div><span>Rekening ${inv.currency} · a.n. <b>${pay.bni.holder}</b></span><span>SWIFT/BIC <b>${pay.bni.swift}</b> <button class="btn btn-sm" type="button" data-copy="${pay.bni.swift}">Salin</button> · kode bank ${pay.bni.code} · ${pay.bni.address}</span><span>Nominal tepat: <b>${money(inv.amount, inv.currency)}</b></span>
            <ol class="small" style="margin:6px 0 0;padding-left:18px"><li>Di aplikasi/kantor bank Anda pilih transfer internasional (SWIFT) dalam ${inv.currency}.</li><li>Isi bank penerima ${pay.bni.name}, SWIFT ${pay.bni.swift}, nomor rekening di atas, dan nama penerima ${pay.bni.holder}.</li><li>Tulis nomor tagihan <b>${inv.number}</b> pada berita/keterangan transfer. Biaya transfer ditanggung pengirim (OUR) agar nominal tiba utuh.</li><li>Unggah bukti transfer di bawah; akses aktif setelah dana diterima dan terverifikasi.</li></ol></div>`}
      </div>`}
  </div>
  ${canUpload ? html`<form class="card stack" method="post" action="/portal/tagihan/${inv.id}/bukti" enctype="multipart/form-data" style="margin-top:20px">
    <input type="hidden" name="_csrf" value="${csrf}">
    <h3 style="margin:0">Unggah bukti pembayaran</h3>
    <div class="field"><label for="bukti">Bukti transfer <span class="muted">(JPG/PNG/WebP/PDF, maks. 5 MB)</span></label><input id="bukti" name="bukti" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></div>
    ${t?.requires ? html`<div class="field"><label for="promo">${t.requires} <span class="muted">(wajib untuk ${t.label})</span></label><input id="promo" name="promo" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></div>` : ''}
    <div class="field"><label for="catatan">Catatan (opsional)</label><textarea id="catatan" name="catatan" maxlength="500" placeholder="Mis. nama pengirim rekening, tanggal transfer."></textarea></div>
    <button class="btn btn-gold btn-lg" type="submit">Kirim bukti pembayaran</button>
  </form>` : ''}
  ${inv.files.length ? html`<div class="card" style="margin-top:20px"><h3 style="margin-top:0">Berkas terkirim</h3><ul class="timeline">${inv.files.map((fl) => html`<li class="done">${fl.kind === 'payment' ? 'Bukti transfer' : 'Dokumen promo'} · ${fl.name} · ${fmtDate('id', fl.at, true)}</li>`)}</ul></div>` : ''}
  ${inv.status === 'unpaid' ? html`<form method="post" action="/portal/tagihan/${inv.id}/batal" style="margin-top:14px"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm" type="submit">Batalkan tagihan</button></form>` : ''}`);
});

account.post('/portal/tagihan/:id/bukti', async (c) => {
  const u = c.get('user')!, store = c.get('store');
  const inv = await getInvoice(store, c.req.param('id'));
  if (!inv || inv.userId !== u.id) return c.notFound();
  const back = (m: string) => c.redirect(`/portal/tagihan/${inv.id}?err=${encodeURIComponent(m)}`);
  const f = await c.req.parseBody();
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return back('Sesi formulir kedaluwarsa. Muat ulang halaman.');
  if (!(await limit(c.env, `up:${u.id}`, 20, 3600))) return back('Terlalu banyak unggahan. Coba lagi nanti.');
  const pricing = await getPricing(store);
  const needPromo = Boolean(pricing.tiers[inv.tier]?.requires);
  const files: ProofFile[] = [];
  for (const [field, kind] of [['bukti', 'payment'], ['promo', 'promo']] as const) {
    const file = f[field];
    if (!(file instanceof File) || file.size === 0) {
      if (kind === 'payment' || needPromo) return back(kind === 'payment' ? 'Lampirkan bukti transfer.' : `Lampirkan ${pricing.tiers[inv.tier]!.requires}.`);
      continue;
    }
    const ext = ACCEPT[file.type];
    if (!ext) return back('Format berkas harus JPG, PNG, WebP atau PDF.');
    if (file.size > MAX) return back('Ukuran berkas maksimal 5 MB.');
    const key = proofKey(inv.id, `${Date.now()}-${kind}.${ext}`);
    await c.env.DATA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type }, customMetadata: { uid: u.id } });
    files.push({ key, name: file.name.slice(0, 120), type: file.type, size: file.size, kind, at: Date.now() });
  }
  try {
    await submitProof(store, inv, files, String(f.catatan ?? ''));
  } catch (err) {
    return back((err as Error).message);
  }
  await audit(store, u.id, 'invoice.proof', { id: inv.id, files: files.length });
  return c.redirect(`/portal/tagihan/${inv.id}?ok=1`);
});

account.post('/portal/tagihan/:id/batal', async (c) => {
  const u = c.get('user')!;
  const f = await c.req.parseBody();
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return c.text('Sesi formulir kedaluwarsa.', 403);
  await cancelInvoice(c.get('store'), c.req.param('id'), u.id);
  return c.redirect('/portal/paket');
});

account.get('/portal/latihan', async (c) => {
  const u = c.get('user')!;
  const atts = await listAttempts(c.get('store'), u.id, 100);
  // Prediksi sementara per jenjang: rata-rata 5 percobaan terakhir.
  const groups = new Map<string, { label: string; pcts: number[] }>();
  for (const a of atts) {
    const s = getSet(a.set);
    if (!s) continue;
    const key = `${s.course}-${s.level}`;
    const g = groups.get(key) ?? { label: `${COURSE_META[s.course].name} · ${levelName(s.course, s.level)}`, pcts: [] };
    if (g.pcts.length < 5) g.pcts.push(a.pct);
    groups.set(key, g);
  }
  return portal(c, '/portal/latihan', 'Riwayat latihan', html`
  <div class="page-title"><h1>Riwayat latihan</h1><a class="btn btn-gold btn-sm" href="/latihan">Latihan baru</a></div>
  ${groups.size ? html`<div class="kpi" style="margin-bottom:20px">${[...groups.values()].map((g) => { const avg = Math.round(g.pcts.reduce((a, b) => a + b, 0) / g.pcts.length); return html`<div class="card"><b>${avg}%</b><span>${g.label} · rata-rata ${g.pcts.length} latihan terakhir</span><div class="progress" style="margin-top:8px"><i style="--p:${avg}%"></i></div></div>`; })}</div>` : ''}
  ${atts.length ? html`<div class="table-wrap"><table class="table"><tr><th>Paket</th><th>Jenjang</th><th>Nilai</th><th>Prediksi</th><th>Tanggal</th></tr>${atts.map((a) => { const s = getSet(a.set); return html`<tr><td><a href="/latihan/${a.set}">${s?.title ?? a.set}</a></td><td>${s ? `${COURSE_META[s.course].name} ${levelName(s.course, s.level)}` : ''}</td><td><span class="pill ${a.pct >= 75 ? 'pill-ok' : a.pct >= 55 ? 'pill-warn' : 'pill-bad'}">${a.pct}%</span></td><td>${a.score}</td><td>${fmtDate('id', a.at, true)}</td></tr>`; })}</table></div>` : html`<div class="card"><p style="margin:0">Belum ada latihan tersimpan. <a href="/latihan">Kerjakan paket pertama Anda</a> — hasilnya muncul di sini lengkap dengan prediksi nilai.</p></div>`}`);
});

account.get('/portal/akun', async (c) => {
  const u = c.get('user')!;
  const csrf = await csrfToken(c, u);
  return portal(c, '/portal/akun', 'Akun', html`
  <div class="page-title"><h1>Akun</h1></div>
  ${c.req.query('ok') ? html`<div class="alert alert-ok">${c.req.query('ok')}</div>` : ''}${c.req.query('err') ? html`<div class="alert alert-bad">${c.req.query('err')}</div>` : ''}
  <div class="grid g2" style="align-items:start">
    <form class="card stack" method="post" action="/portal/akun/nama"><input type="hidden" name="_csrf" value="${csrf}"><h3 style="margin:0">Profil</h3><div class="field"><label for="n">Nama</label><input id="n" name="name" value="${u.name}" maxlength="80" required></div><div class="field"><span class="lbl">E-mail</span><span>${u.email}</span></div><button class="btn btn-ghost" type="submit">Simpan</button></form>
    <form class="card stack" method="post" action="/portal/akun/sandi"><input type="hidden" name="_csrf" value="${csrf}"><h3 style="margin:0">Ganti kata sandi</h3><div class="field"><label for="o">Kata sandi lama</label><input id="o" name="old" type="password" autocomplete="current-password" required></div><div class="field"><label for="p">Kata sandi baru</label><input id="p" name="password" type="password" autocomplete="new-password" minlength="8" required></div><button class="btn btn-ghost" type="submit">Ganti & keluar dari perangkat lain</button></form>
  </div>`);
});
account.post('/portal/akun/nama', async (c) => {
  const u = c.get('user')!;
  const f = await c.req.parseBody();
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return c.redirect('/portal/akun?err=Sesi%20kedaluwarsa');
  const name = String(f.name ?? '').trim().slice(0, 80);
  if (name) await updateUser(c.get('store'), u.id, (x) => ({ ...x, name }));
  return c.redirect('/portal/akun?ok=Profil%20tersimpan');
});
account.post('/portal/akun/sandi', async (c) => {
  const u = c.get('user')!;
  const f = await c.req.parseBody();
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return c.redirect('/portal/akun?err=Sesi%20kedaluwarsa');
  if (!(await verifyPassword(String(f.old ?? ''), u.pass))) return c.redirect('/portal/akun?err=Kata%20sandi%20lama%20salah');
  const pw = String(f.password ?? '');
  if (pw.length < 8) return c.redirect('/portal/akun?err=Kata%20sandi%20minimal%208%20karakter');
  const pass = await hashPassword(pw);
  const next = await updateUser(c.get('store'), u.id, (x) => ({ ...x, pass, sv: x.sv + 1 }));
  if (next) await startSession(c, next as User);
  await audit(c.get('store'), u.id, 'user.password', {});
  return c.redirect('/portal/akun?ok=Kata%20sandi%20diganti');
});

/** Akses belajar untuk sebuah bahasa (dipakai rute pelajaran & latihan). */
export const canLearn = (c: Ctx, course: Course): boolean => hasAccess(c.get('subs'), course, c.get('user'));
export { getSubs };
