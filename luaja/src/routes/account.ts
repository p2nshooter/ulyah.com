/**
 * Akun & portal member: daftar, masuk, keluar, beranda portal, paket & tagihan (rekening hanya tampil kepada member yang
 * punya tagihan), unggah bukti bayar + dokumen promo (≤ 5 MB, JPG/PNG/WebP/PDF), riwayat latihan, akun.
 */
import { Hono } from 'hono';
import { html, raw, type Raw } from '../lib/html.ts';
import { csrfOk, csrfToken, endSession, setLangCookie, startSession, type Ctx, type HonoEnv } from '../lib/session.ts';
import { render } from '../lib/render.ts';
import { limit } from '../lib/ratelimit.ts';
import { timingSafeEqual, verifyPassword, hashPassword } from '../lib/crypto.ts';
import { fmtDate, isLang, LANG_NAME, LANGS, t, type Key, type Lang } from '../lib/i18n.ts';
import { createUser, EmailTakenError, findByEmail, getSubs, isAdmin, updateUser, hasAccess } from '../data/users.ts';
import { audit, event } from '../data/audit.ts';
import { getPayment, getPricing, getSite } from '../data/settings.ts';
import { cancelInvoice, createInvoice, getInvoice, listUserInvoices, proofKey, submitProof } from '../data/invoices.ts';
import { COURSE_META, COURSES, CURRENCIES, METHOD_KINDS, money, unitPrices, type Course, type Currency, type Invoice, type PayMethod, type ProofFile, type Tier, type User } from '../data/model.ts';
import { hasAnyWay, payOptions, waysLabel } from '../data/gateways.ts';
import { GW_META } from '../data/gw.ts';
import { tierLabel, tierNote, tierReq } from '../pages/info.ts';
import { getProgress, listAttempts } from '../data/progress.ts';
import { getSet, levelName } from '../practice/index.ts';
import { getLesson } from '../course/index.ts';
import { initials, icon } from '../pages/layout.ts';

/** Akun pemilik bersama (sama dengan ulyah.com / axto.io / xscan.es): hanya hash sandi di kode. */
const OWNER_SEED = { email: 'alghoniy2026@gmail.com', passwordHash: 'pbkdf2$100000$VOy29DR3UljFD-WLZEuH4w$Qsk_ukvOGQp2F8DVY4SqFqidY7f9aNa4a9_ubpqu22c' };

export const account = new Hono<HonoEnv>();

const STATUS_PILL: Record<Invoice['status'], string> = { unpaid: 'pill-warn', review: 'pill-info', approved: 'pill-ok', rejected: 'pill-bad', cancelled: 'pill-line' };
const statusPill = (L: Lang, s: Invoice['status']) => html`<span class="pill ${STATUS_PILL[s]}">${t(L, `inv.status.${s}` as Key)}</span>`;
const langOf = (c: Ctx): Lang => c.get('lang');
const TIER_ICON: Record<Tier, string> = { umum: 'dunia', pelajar: 'sekolah', juara: 'piala' };
const safeNext = (n: unknown) => (typeof n === 'string' && /^\/[a-z0-9/_?=&#%.-]*$/i.test(n) && !n.startsWith('//') ? n : '');

function authShell(L: Lang, title: string, body: Raw, aside?: Raw): Raw {
  return html`<section class="section"><div class="wrap auth-grid"><div class="auth card">${body}</div>${aside ?? html`<aside class="auth-aside"><h2>${title}</h2><ul class="goals"><li>${t(L, 'auth.perk1')}</li><li>${t(L, 'auth.perk2')}</li><li>${t(L, 'auth.perk3')}</li><li>${t(L, 'auth.perk4')}</li></ul></aside>`}</div></section>`;
}
const flash = (err?: string, ok?: string) => html`${err ? html`<div class="alert alert-bad" role="alert">${err}</div>` : ''}${ok ? html`<div class="alert alert-ok" role="status">${ok}</div>` : ''}`;

function loginBody(L: Lang, err?: string, email = '', next = '', admin = false): Raw {
  return html`<p class="eyebrow">${admin ? t(L, 'auth.adminAccess') : t(L, 'auth.portal')}</p><h1 style="font-size:var(--fs-5)">${admin ? t(L, 'auth.signinAdmin') : t(L, 'auth.signin')}</h1>${flash(err)}
  <form method="post" action="${admin ? '/admin/masuk' : '/masuk'}" class="stack">
    <input type="hidden" name="lanjut" value="${next}">
    <div class="field"><label for="email">${t(L, 'auth.email')}</label><input id="email" name="email" type="email" autocomplete="email" required value="${email}"></div>
    <div class="field"><label for="pw">${t(L, 'auth.password')}</label><input id="pw" name="password" type="password" autocomplete="current-password" required minlength="8"></div>
    <button class="btn btn-gold btn-lg" style="width:100%" type="submit">${t(L, 'auth.signin')}</button>
  </form>${admin ? '' : html`<p class="small muted center" style="margin-top:16px">${t(L, 'auth.noAccount')} <a href="/daftar${next ? `?lanjut=${encodeURIComponent(next)}` : ''}">${t(L, 'auth.register')}</a> · <a href="/lupa-sandi">${t(L, 'auth.forgot')}</a></p>`}`;
}

async function doLogin(c: Ctx, admin: boolean): Promise<Response> {
  const L = langOf(c);
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  const page = (err: string, email: string, next: string) => ({ path: c.req.path, title: t(L, 'auth.signinTitle', { site: 'LUAJA' }), desc: t(L, 'auth.signinDesc', { site: 'LUAJA' }), noindex: true, noAds: true, body: authShell(L, t(L, 'auth.signin'), loginBody(L, err, email, next, admin)) });
  const f = await c.req.parseBody();
  const next = safeNext(f.lanjut);
  const email = String(f.email ?? '').trim().toLowerCase();
  const password = String(f.password ?? '');
  if (!(await limit(c.env, `login:${ip}`, 20, 900))) return render(c, page(t(L, 'auth.tooMany'), email, next), 429);
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
    return render(c, page(t(L, 'auth.wrong'), email, next), 401);
  }
  if (admin && !isAdmin(user)) return render(c, page(t(L, 'auth.notAdmin'), email, next), 403);
  await updateUser(store, user.id, (u) => ({ ...u, lastLoginAt: Date.now() }));
  await startSession(c, user);
  return c.redirect(next || (isAdmin(user) ? '/admin' : '/portal'));
}

account.get('/masuk', (c) => {
  if (c.get('user')) return c.redirect('/portal');
  const next = safeNext(c.req.query('lanjut')), L = langOf(c);
  return render(c, { path: '/masuk', title: t(L, 'auth.signinTitle', { site: 'LUAJA' }), desc: t(L, 'auth.signinDesc', { site: 'LUAJA' }), noindex: true, noAds: true, body: authShell(L, t(L, 'auth.welcomeBack'), loginBody(L, undefined, '', next)) });
});
account.post('/masuk', (c) => doLogin(c, false));
account.get('/admin/masuk', (c) => {
  if (isAdmin(c.get('user'))) return c.redirect('/admin');
  const L = langOf(c);
  return render(c, { path: '/admin/masuk', title: t(L, 'auth.adminTitle', { site: 'LUAJA' }), desc: t(L, 'auth.adminAccess'), noindex: true, noAds: true, body: authShell(L, t(L, 'auth.adminPanel'), loginBody(L, undefined, '', '', true), html`<aside class="auth-aside"><h2>${t(L, 'auth.adminPanel')}</h2><p class="muted">${t(L, 'auth.adminDesc')}</p></aside>`) });
});
account.post('/admin/masuk', (c) => doLogin(c, true));

function registerBody(L: Lang, err?: string, v: { name?: string; email?: string } = {}, next = ''): Raw {
  return html`<p class="eyebrow">${t(L, 'auth.newAccount')}</p><h1 style="font-size:var(--fs-5)">${t(L, 'auth.registerTitle', { site: 'LUAJA' })}</h1>${flash(err)}
  <form method="post" action="/daftar" class="stack">
    <input type="hidden" name="lanjut" value="${next}">
    <div class="field"><label for="name">${t(L, 'auth.name')}</label><input id="name" name="name" autocomplete="name" required maxlength="80" value="${v.name ?? ''}"></div>
    <div class="field"><label for="email">${t(L, 'auth.email')}</label><input id="email" name="email" type="email" autocomplete="email" required value="${v.email ?? ''}"></div>
    <div class="field"><label for="pw">${t(L, 'auth.password')}</label><input id="pw" name="password" type="password" autocomplete="new-password" required minlength="8"><span class="hint">${t(L, 'auth.minChars')}</span></div>
    <label class="check"><input type="checkbox" name="setuju" required><span>${raw(t(L, 'auth.agree', { terms: `<a href="/syarat" target="_blank">${t(L, 'auth.terms')}</a>`, privacy: `<a href="/privasi" target="_blank">${t(L, 'auth.privacy')}</a>` }))}</span></label>
    <button class="btn btn-gold btn-lg" style="width:100%" type="submit">${t(L, 'auth.create')}</button>
  </form><p class="small muted center" style="margin-top:16px">${t(L, 'auth.haveAccount')} <a href="/masuk">${t(L, 'auth.signin')}</a></p>`;
}
account.get('/daftar', (c) => {
  if (c.get('user')) return c.redirect('/portal');
  const next = safeNext(c.req.query('lanjut')) || (c.req.query('paket') ? `/portal/paket?jumlah=${c.req.query('paket') === '3' ? 3 : 1}` : '');
  const L = langOf(c);
  return render(c, { path: '/daftar', title: t(L, 'auth.registerPage', { site: 'LUAJA' }), desc: t(L, 'auth.registerDesc', { site: 'LUAJA' }), noindex: true, noAds: true, body: authShell(L, t(L, 'auth.journey'), registerBody(L, undefined, {}, next)) });
});
account.post('/daftar', async (c) => {
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  const f = await c.req.parseBody();
  const v = { name: String(f.name ?? '').trim(), email: String(f.email ?? '').trim().toLowerCase() };
  const next = safeNext(f.lanjut);
  const pw = String(f.password ?? '');
  const L = langOf(c);
  const fail = (m: string, s: 400 | 429 = 400) => render(c, { path: '/daftar', title: t(L, 'auth.registerPage', { site: 'LUAJA' }), desc: t(L, 'auth.registerDesc', { site: 'LUAJA' }), noindex: true, noAds: true, body: authShell(L, t(L, 'auth.register'), registerBody(L, m, v, next)) }, s);
  if (!(await limit(c.env, `reg:${ip}`, 10, 3600))) return fail(t(L, 'auth.regTooMany'), 429);
  if (!v.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) || pw.length < 8 || !f.setuju) return fail(t(L, 'auth.regInvalid'));
  if (v.email === OWNER_SEED.email) return fail(t(L, 'auth.emailTakenShort'));
  try {
    // Bahasa antarmuka saat mendaftar disimpan di akun dan dipakai di semua perangkat.
    const user = await createUser(c.get('store'), { email: v.email, name: v.name, password: pw, ui: L });
    await event(c.get('store'), 'user.register', { uid: user.id });
    await startSession(c, user);
    return c.redirect(next || '/portal?baru=1');
  } catch (err) {
    if (err instanceof EmailTakenError) return fail(t(L, 'auth.emailTaken'));
    throw err;
  }
});
account.get('/lupa-sandi', async (c) => {
  const [pay, site] = await Promise.all([getPayment(c.get('store')), getSite(c.get('store'))]);
  const mail = site.contact.email, L = langOf(c);
  return render(c, { path: '/lupa-sandi', title: t(L, 'auth.forgotPage', { site: site.name }), desc: t(L, 'auth.help'), noindex: true, noAds: true, site, body: authShell(L, t(L, 'auth.help'), html`<p class="eyebrow">${t(L, 'auth.help')}</p><h1 style="font-size:var(--fs-5)">${t(L, 'auth.forgotTitle')}</h1><p>${t(L, 'auth.forgotText')}</p><p><a class="btn btn-ghost" href="mailto:${mail}?subject=${encodeURIComponent(t(L, 'auth.forgotSubject'))}">${icon('surat')} ${mail}</a>${pay.whatsapp ? html` <a class="btn btn-ghost" href="https://wa.me/${pay.whatsapp.replace(/\D/g, '')}">${icon('wa')} WhatsApp</a>` : ''}</p><p class="small muted">${t(L, 'auth.forgotNote')}</p>`) });
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

const NAV: [string, Key, string][] = [['/portal', 'portal.home', 'tangga'], ['/pustaka', 'menu.library', 'buku'], ['/simulasi', 'sim.eyebrow', 'jam'], ['/portal/latihan', 'portal.history', 'ujian'], ['/portal/paket', 'portal.plans', 'kartu'], ['/portal/akun', 'portal.account', 'masuk']];
function portal(c: Ctx, active: string, title: string, body: Raw): Promise<Response> {
  const u = c.get('user')!, L = langOf(c);
  return render(c, {
    path: active, title: t(L, 'portal.title', { t: title, site: 'LUAJA' }), desc: t(L, 'portal.desc', { site: 'LUAJA' }), noindex: true, noAds: true,
    body: html`<div class="wrap portal"><nav class="side" aria-label="${t(L, 'portal.nav')}"><div class="who"><span class="avatar lg">${initials(u.name)}</span><div><b>${u.name}</b><small>${u.email}</small></div></div>${NAV.map(([href, key, ic]) => html`<a href="${href}" ${href === active ? raw('aria-current="page"') : ''}>${icon(ic)}<span>${t(L, key)}</span></a>`)}${isAdmin(u) ? html`<a href="/admin">${icon('bintang')}<span>${t(L, 'portal.adminPanel')}</span></a>` : ''}<a class="side-out" href="/keluar">${icon('panah')}<span>${t(L, 'portal.signout')}</span></a></nav><div class="portal-main">${body}</div></div>`,
  });
}

account.get('/portal', async (c) => {
  const u = c.get('user')!, store = c.get('store'), subs = c.get('subs');
  const [prog, invs, atts] = await Promise.all([getProgress(store, u.id), listUserInvoices(store, u.id), listAttempts(store, u.id, 6)]);
  const passed = Object.values(prog.lessons).filter((x) => x.passed).length;
  const last = prog.last ? getLesson(prog.last) : undefined;
  const pending = invs.find((i) => i.status === 'unpaid' || i.status === 'review' || i.status === 'rejected');
  const L = langOf(c), first = u.name.split(' ')[0] ?? '';
  return portal(c, '/portal', t(L, 'portal.home'), html`
  ${c.req.query('baru') ? html`<div class="alert alert-ok">${t(L, 'portal.welcome', { site: 'LUAJA', name: first })}</div>` : ''}
  <div class="page-title"><h1>${t(L, 'portal.hello', { name: first })}</h1>${last ? html`<a class="btn btn-gold" href="/belajar/${last.code}">${icon('main')} ${t(L, 'portal.continue', { t: last.title })}</a>` : html`<a class="btn btn-gold" href="/coba">${icon('main')} ${t(L, 'portal.startFree')}</a>`}</div>
  ${isAdmin(u) ? html`<div class="notice" style="margin-bottom:18px">${icon('bintang')} ${t(L, 'portal.adminMode')} <a href="/admin">${t(L, 'portal.backAdmin')}</a></div>` : ''}
  ${pending ? html`<div class="notice" style="margin-bottom:18px">${t(L, 'portal.invoice')} <b>${pending.number}</b> — ${t(L, `inv.status.${pending.status}` as Key)}. <a href="/portal/tagihan/${pending.id}">${t(L, 'portal.openInvoice')}</a></div>` : ''}
  <div class="kpi"><div class="card"><b>${passed}</b><span>${t(L, 'portal.kpi.passed')}</span></div><div class="card"><b>${atts.length}</b><span>${t(L, 'portal.kpi.attempts')}</span></div><div class="card"><b>${COURSES.filter((k) => hasAccess(subs, k, u)).length}</b><span>${t(L, 'portal.kpi.langs')}</span></div></div>
  <h2 style="font-size:var(--fs-4);margin-top:28px">${t(L, 'portal.subs')}</h2>
  <div class="grid g3">${COURSES.map((k) => { const s = subs[k]; const on = hasAccess(subs, k, u); return html`<div class="card"><h3 style="margin:0 0 6px">${COURSE_META[k].names[L]}</h3>${on ? html`<span class="pill pill-ok">${t(L, 'portal.active')}${s ? ` · ${t(L, 'portal.until', { d: fmtDate(L, s.until) })}` : ''}</span><p style="margin:12px 0 0"><a href="/${COURSE_META[k].slug}">${t(L, 'portal.openPath')}</a></p>` : html`<span class="pill pill-line">${t(L, 'portal.inactive')}</span><p style="margin:12px 0 0"><a href="/portal/paket">${t(L, 'portal.choosePlan')}</a></p>`}</div>`; })}</div>
  <h2 style="font-size:var(--fs-4);margin-top:28px">${t(L, 'portal.recent')}</h2>
  ${atts.length ? html`<div class="table-wrap"><table class="table"><tr><th>${t(L, 'portal.th.set')}</th><th>${t(L, 'portal.th.score')}</th><th>${t(L, 'portal.th.predict')}</th><th>${t(L, 'portal.th.date')}</th></tr>${atts.map((a) => { const s = getSet(a.set); return html`<tr><td><a href="/latihan/${a.set}">${s?.title ?? a.set}</a></td><td>${a.pct}%</td><td>${a.score}</td><td>${fmtDate(L, a.at, true)}</td></tr>`; })}</table></div>` : html`<p class="muted">${raw(t(L, 'portal.noAttempts', { link: `<a href="/latihan">${t(L, 'portal.startPractice')}</a>` }))}</p>`}`);
});

account.get('/portal/paket', async (c) => {
  const store = c.get('store');
  const [pricing, invs, ways] = await Promise.all([getPricing(store), listUserInvoices(store, c.get('user')!.id), payOptions(store, c.env)]);
  const tiers = (Object.keys(pricing.tiers) as Tier[]).filter((x) => pricing.tiers[x].enabled);
  const preset3 = c.req.query('jumlah') === '3';
  const lang = langOf(c), L = lang;
  // Mata uang tanpa satu pun cara bayar yang tayang tidak ditawarkan.
  const curs = CURRENCIES.filter((cur) => hasAnyWay(ways, cur));
  const want: Currency = lang === 'ja' ? 'JPY' : lang === 'en' ? 'USD' : 'IDR';
  const defCur: Currency = curs.includes(want) ? want : curs[0] ?? 'IDR';
  return portal(c, '/portal/paket', t(L, 'portal.plans'), html`
  <div class="page-title"><h1>${t(L, 'plan.title')}</h1><a class="btn btn-ghost btn-sm" href="/harga">${t(L, 'plan.details')}</a></div>
  ${c.req.query('err') ? html`<div class="alert alert-bad">${c.req.query('err')}</div>` : ''}
  <form method="post" action="/portal/paket" class="card stack" data-buy>
    <input type="hidden" name="_csrf" value="${await csrfToken(c, c.get('user')!)}">
    <div class="field"><span class="lbl">${t(L, 'plan.step1')}</span><div class="grid g3">${COURSES.map((k) => html`<label class="check"><input type="checkbox" name="bahasa" value="${k}" ${preset3 ? raw('checked') : ''}><span><b>${COURSE_META[k].names[L]}</b><small>${COURSE_META[k].levels[0]!.name}–${COURSE_META[k].levels[COURSE_META[k].levels.length - 1]!.name}${k === 'en' ? ' + TOEFL & IELTS' : ''}</small></span></label>`)}</div></div>
    <div class="field"><span class="lbl">${t(L, 'plan.step2')}</span><div class="grid g3">${curs.map((cur) => html`<label class="check"><input type="radio" name="mata_uang" value="${cur}" ${cur === defCur ? raw('checked') : ''}><span><b>${t(L, `plan.cur.${cur}` as Key)}</b><small>${waysLabel(ways, cur, L)}</small></span></label>`)}</div></div>
    <div class="field"><span class="lbl">${t(L, 'plan.step3')}</span><div class="grid g3">${tiers.map((x, i) => html`<label class="check"><input type="radio" name="kategori" value="${x}" ${i === 0 ? raw('checked') : ''} ${raw(CURRENCIES.map((cur) => { const u = unitPrices(pricing.tiers[x], cur); return `data-one-${cur}="${u.one}" data-three-${cur}="${u.three}"`; }).join(' '))}><span><b>${icon(TIER_ICON[x])} ${tierLabel(pricing, x, L)}</b><small data-tier-price="${x}">${money(unitPrices(pricing.tiers[x], defCur).one, defCur)}${t(L, 'common.perLang')} · ${money(unitPrices(pricing.tiers[x], defCur).three, defCur)} ${t(L, 'common.threeLangs')}</small><small>${tierNote(pricing, x, L)}</small></span></label>`)}</div></div>
    <div class="row between total-bar"><div><small class="muted">${t(L, 'plan.total')}</small><div class="amount" data-total>—</div></div><button class="btn btn-gold btn-lg" type="submit">${t(L, 'plan.create')}</button></div>
    <p class="small muted" style="margin:0">${t(L, 'plan.note')}</p>
  </form>
  <script src="/assets/bayar.js?v=3" defer></script>
  <h2 style="font-size:var(--fs-4);margin-top:28px">${t(L, 'plan.myInvoices')}</h2>
  ${invs.length ? html`<div class="table-wrap"><table class="table"><tr><th>${t(L, 'plan.th.no')}</th><th>${t(L, 'plan.th.lang')}</th><th>${t(L, 'plan.th.cat')}</th><th>${t(L, 'plan.th.amount')}</th><th>${t(L, 'plan.th.status')}</th><th></th></tr>${invs.map((i) => html`<tr><td>${i.number}</td><td>${i.courses.map((k) => COURSE_META[k].names[L]).join(', ')}</td><td>${tierLabel(pricing, i.tier, L)}</td><td>${money(i.amount, i.currency ?? 'IDR')}</td><td>${statusPill(L, i.status)}</td><td><a href="/portal/tagihan/${i.id}">${t(L, 'plan.open')}</a></td></tr>`)}</table></div>` : html`<p class="muted">${t(L, 'plan.none')}</p>`}`);
});

account.post('/portal/paket', async (c) => {
  const u = c.get('user')!, store = c.get('store');
  const f = await c.req.parseBody({ all: true });
  const L = langOf(c);
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return c.text(t(L, 'auth.csrf'), 403);
  const raw = f.bahasa;
  const courses = (Array.isArray(raw) ? raw : raw ? [raw] : []).map(String).filter((k): k is Course => (COURSES as readonly string[]).includes(k));
  const tier = String(f.kategori ?? 'umum') as Tier;
  const currency = (CURRENCIES as readonly string[]).includes(String(f.mata_uang)) ? (String(f.mata_uang) as Currency) : 'IDR';
  const [pricing, ways] = await Promise.all([getPricing(store), payOptions(store, c.env)]);
  if (!courses.length) return c.redirect(`/portal/paket?err=${encodeURIComponent(t(L, 'plan.pickLang'))}`);
  if (!hasAnyWay(ways, currency)) return c.redirect(`/portal/paket?err=${encodeURIComponent(t(L, 'plan.curNA'))}`);
  if (!pricing.tiers[tier]?.enabled) return c.redirect(`/portal/paket?err=${encodeURIComponent(t(L, 'plan.catNA'))}`);
  if (!(await limit(c.env, `inv:${u.id}`, 10, 3600))) return c.redirect(`/portal/paket?err=${encodeURIComponent(t(L, 'plan.tooMany'))}`);
  const inv = await createInvoice(store, u.id, courses, tier, pricing, currency);
  await event(store, 'invoice.create', { id: inv.id, amount: inv.amount, currency });
  return c.redirect(`/portal/tagihan/${inv.id}`);
});

const ACCEPT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };
const MAX = 5 * 1024 * 1024;

/** Kotak satu metode manual: nomor yang bisa disalin, data bank, nominal tepat, dan langkah transfer (bahasa antarmuka). */
function methodBox(L: Lang, m: PayMethod, inv: Invoice, note: string): Raw {
  const v = money(inv.amount, inv.currency);
  const steps: string[] = m.kind === 'swift'
    ? [t(L, 'inv.swift.1', { cur: inv.currency }), t(L, 'inv.swift.2', { bank: m.bankName || m.name, swift: m.swift, holder: m.holder }), t(L, 'inv.swift.3', { n: inv.number })]
    : m.kind === 'bank' ? [] : [t(L, 'inv.wallet.1', { v, name: m.name }), t(L, 'inv.wallet.2', { n: inv.number })];
  // Petunjuk tambahan ditulis pengelola (bahasa Indonesia) — ditampilkan apa adanya.
  const extra = m.instructions.split('\n').map((x) => x.trim()).filter(Boolean);
  const all = [...steps, ...extra, ...(steps.length || extra.length ? [t(L, 'inv.uploadStep')] : [])];
  return html`<div class="bank" data-method="${m.id}"><small>${m.kind === 'bank' ? t(L, 'inv.transferTo') : METHOD_KINDS[m.kind].label}</small><b style="font-size:var(--fs-3)">${m.name}</b>
    <div class="acct">${m.account}<button class="btn btn-sm" type="button" data-copy="${m.account}">${t(L, 'common.copy')}</button></div>
    ${m.holder ? html`<span>${t(L, 'inv.holder')} <b>${m.holder}</b></span>` : ''}
    ${m.kind === 'swift' ? html`<span>${m.bankName ? html`${m.bankName} · ` : ''}SWIFT/BIC <b>${m.swift}</b> <button class="btn btn-sm" type="button" data-copy="${m.swift}">${t(L, 'common.copy')}</button>${m.code ? html` · ${t(L, 'inv.bankCode', { c: m.code })}` : ''}${m.address ? html` · ${m.address}` : ''}</span>` : ''}
    <span>${t(L, 'inv.exact')} <b>${v}</b> <button class="btn btn-sm" type="button" data-copy="${String(inv.amount)}">${t(L, 'common.copy')}</button></span>
    ${all.length ? html`<ol class="small" style="margin:6px 0 0;padding-left:18px">${all.map((x) => html`<li>${x}</li>`)}</ol>` : ''}
    ${m.kind === 'bank' && note ? html`<small lang="id">${note}</small>` : ''}</div>`;
}

account.get('/portal/tagihan/:id', async (c) => {
  const u = c.get('user')!, store = c.get('store');
  const inv = await getInvoice(store, c.req.param('id'));
  if (!inv || (inv.userId !== u.id && !isAdmin(u))) return c.notFound();
  const [ways, pricing] = await Promise.all([payOptions(store, c.env), getPricing(store)]);
  const opt = ways.by[inv.currency], ppc = ways.paypal;
  const L = langOf(c), req = tierReq(pricing, inv.tier, L);
  const canUpload = inv.status === 'unpaid' || inv.status === 'rejected';
  const csrf = await csrfToken(c, u);
  return portal(c, '/portal/paket', t(L, 'inv.title', { n: inv.number }), html`
  <div class="page-title"><h1>${t(L, 'inv.title', { n: inv.number })}</h1>${statusPill(L, inv.status)}</div>
  ${c.req.query('ok') ? html`<div class="alert alert-ok">${t(L, 'inv.proofSent')}</div>` : ''}
  ${c.req.query('lunas') ? html`<div class="alert alert-ok">${t(L, 'inv.paidOk')}</div>` : ''}
  ${c.req.query('err') ? html`<div class="alert alert-bad">${c.req.query('err')}</div>` : ''}
  ${inv.status === 'rejected' && inv.reason ? html`<div class="alert alert-bad"><b>${t(L, 'inv.rejectReason')}</b> ${inv.reason}. ${t(L, 'inv.uploadAgain')}</div>` : ''}
  <div class="grid g2" style="align-items:start">
    <div class="card"><h3 style="margin-top:0">${t(L, 'inv.details')}</h3><table class="table" style="min-width:0"><tr><td>${t(L, 'inv.lang')}</td><td>${inv.courses.map((k) => COURSE_META[k].names[L]).join(', ')}</td></tr><tr><td>${t(L, 'inv.cat')}</td><td>${tierLabel(pricing, inv.tier, L)}</td></tr><tr><td>${t(L, 'inv.period')}</td><td>${t(L, 'inv.days', { d: pricing.days })}</td></tr><tr><td>${t(L, 'inv.created')}</td><td>${fmtDate(L, inv.createdAt, true)}</td></tr>${inv.activeUntil ? html`<tr><td>${t(L, 'inv.activeUntil')}</td><td>${fmtDate(L, inv.activeUntil)}</td></tr>` : ''}</table>
      <div class="amount" style="margin-top:14px">${money(inv.amount, inv.currency)}</div>
      <p style="margin:12px 0 0"><a class="btn btn-ghost btn-sm" href="/portal/tagihan/${inv.id}/invoice" target="_blank" rel="noopener">${inv.status === 'approved' ? t(L, 'inv.viewReceipt') : t(L, 'inv.viewInvoice')}</a> <a class="btn btn-ghost btn-sm" href="/portal/tagihan/${inv.id}/invoice?unduh=1">${t(L, 'inv.download')}</a></p></div>
    ${inv.status === 'approved' ? html`<div class="card card-tint"><h3 style="margin-top:0">${icon('cek')} ${t(L, 'inv.verified')}</h3><p>${t(L, 'inv.verifiedText')}</p><a class="btn btn-gold" href="/${COURSE_META[inv.courses[0]!].slug}">${t(L, 'inv.startLearning')}</a></div>` :
      inv.status === 'cancelled' ? html`<div class="card"><p>${raw(t(L, 'inv.cancelled', { link: `<a href="/portal/paket">${t(L, 'inv.newInvoice')}</a>` }))}</p></div>` :
      html`<div class="stack" style="--stack:14px">
        ${opt.paypal ? html`<div class="card card-tint" data-paypal="${inv.id}" data-client="${ppc[ppc.mode].clientId}" data-currency="${inv.currency}" data-locale="${L === 'ja' ? 'ja_JP' : L === 'en' ? 'en_US' : 'id_ID'}"><h3 style="margin:0 0 6px">${t(L, 'inv.paypal')}</h3><p class="small muted" style="margin:0 0 12px">${t(L, 'inv.paypalText')}${ppc.mode === 'sandbox' ? ` ${t(L, 'inv.sandbox')}` : ''}</p><div data-paypal-buttons></div><p class="small" data-paypal-msg></p></div>` : ''}
        ${opt.gw.map((g) => html`<form class="card card-tint" method="post" action="/api/bayar/${g}/${inv.id}" data-gw="${g}"><input type="hidden" name="_csrf" value="${csrf}"><h3 style="margin:0 0 6px">${t(L, 'inv.gw', { name: GW_META[g].name })}</h3><p class="small muted" style="margin:0 0 12px">${GW_META[g].buyer[L]} ${t(L, 'inv.gwActive')}${ways.gw[g].mode === 'test' ? ` ${t(L, 'inv.testMode')}` : ''}</p><button class="btn btn-gold" type="submit">${GW_META[g].button[L]} · ${money(inv.amount, inv.currency)}</button></form>`)}
        ${opt.manual.map((m) => methodBox(L, m, inv, ways.payment.note))}
        ${!opt.paypal && !opt.gw.length && !opt.manual.length ? html`<div class="card"><p>${t(L, 'inv.noWay', { cur: inv.currency })}</p></div>` : ''}
      </div>`}
  </div>
  ${canUpload ? html`<form class="card stack" method="post" action="/portal/tagihan/${inv.id}/bukti" enctype="multipart/form-data" style="margin-top:20px">
    <input type="hidden" name="_csrf" value="${csrf}">
    <h3 style="margin:0">${t(L, 'inv.upload')}</h3>
    <div class="field"><label for="bukti">${t(L, 'inv.proof')} <span class="muted">${t(L, 'inv.fileHint')}</span></label><input id="bukti" name="bukti" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></div>
    ${req ? html`<div class="field"><label for="promo">${req} <span class="muted">${t(L, 'inv.requiredFor', { t: tierLabel(pricing, inv.tier, L) })}</span></label><input id="promo" name="promo" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></div>` : ''}
    <div class="field"><label for="catatan">${t(L, 'inv.noteLabel')}</label><textarea id="catatan" name="catatan" maxlength="500" placeholder="${t(L, 'inv.notePh')}"></textarea></div>
    <button class="btn btn-gold btn-lg" type="submit">${t(L, 'inv.send')}</button>
  </form>` : ''}
  ${inv.files.length ? html`<div class="card" style="margin-top:20px"><h3 style="margin-top:0">${t(L, 'inv.filesSent')}</h3><ul class="timeline">${inv.files.map((fl) => html`<li class="done">${fl.kind === 'payment' ? t(L, 'inv.file.payment') : t(L, 'inv.file.promo')} · ${fl.name} · ${fmtDate(L, fl.at, true)}</li>`)}</ul></div>` : ''}
  ${inv.status === 'unpaid' ? html`<form method="post" action="/portal/tagihan/${inv.id}/batal" style="margin-top:14px"><input type="hidden" name="_csrf" value="${csrf}"><button class="btn btn-ghost btn-sm" type="submit">${t(L, 'inv.cancel')}</button></form>` : ''}`);
});

account.post('/portal/tagihan/:id/bukti', async (c) => {
  const u = c.get('user')!, store = c.get('store');
  const inv = await getInvoice(store, c.req.param('id'));
  if (!inv || inv.userId !== u.id) return c.notFound();
  const back = (m: string) => c.redirect(`/portal/tagihan/${inv.id}?err=${encodeURIComponent(m)}`);
  const L = langOf(c);
  const f = await c.req.parseBody();
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return back(t(L, 'auth.csrf'));
  if (!(await limit(c.env, `up:${u.id}`, 20, 3600))) return back(t(L, 'inv.err.tooMany'));
  const pricing = await getPricing(store);
  const needPromo = Boolean(pricing.tiers[inv.tier]?.requires);
  const files: ProofFile[] = [];
  for (const [field, kind] of [['bukti', 'payment'], ['promo', 'promo']] as const) {
    const file = f[field];
    if (!(file instanceof File) || file.size === 0) {
      if (kind === 'payment' || needPromo) return back(kind === 'payment' ? t(L, 'inv.err.proof') : t(L, 'inv.err.promo', { doc: tierReq(pricing, inv.tier, L) ?? '' }));
      continue;
    }
    const ext = ACCEPT[file.type];
    if (!ext) return back(t(L, 'inv.err.format'));
    if (file.size > MAX) return back(t(L, 'inv.err.size'));
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
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return c.text(t(langOf(c), 'auth.csrf'), 403);
  await cancelInvoice(c.get('store'), c.req.param('id'), u.id);
  return c.redirect('/portal/paket');
});

account.get('/portal/latihan', async (c) => {
  const u = c.get('user')!;
  const atts = await listAttempts(c.get('store'), u.id, 100);
  const L = langOf(c);
  // Prediksi sementara per jenjang: rata-rata 5 percobaan terakhir.
  const groups = new Map<string, { label: string; pcts: number[] }>();
  for (const a of atts) {
    const s = getSet(a.set);
    if (!s) continue;
    const key = `${s.course}-${s.level}`;
    const g = groups.get(key) ?? { label: `${COURSE_META[s.course].names[L]} · ${levelName(s.course, s.level)}`, pcts: [] };
    if (g.pcts.length < 5) g.pcts.push(a.pct);
    groups.set(key, g);
  }
  return portal(c, '/portal/latihan', t(L, 'portal.history'), html`
  <div class="page-title"><h1>${t(L, 'portal.history')}</h1><a class="btn btn-gold btn-sm" href="/latihan">${t(L, 'portal.newPractice')}</a></div>
  ${groups.size ? html`<div class="kpi" style="margin-bottom:20px">${[...groups.values()].map((g) => { const avg = Math.round(g.pcts.reduce((a, b) => a + b, 0) / g.pcts.length); return html`<div class="card"><b>${avg}%</b><span>${t(L, 'portal.avg', { label: g.label, n: g.pcts.length })}</span><div class="progress" style="margin-top:8px"><i style="--p:${avg}%"></i></div></div>`; })}</div>` : ''}
  ${atts.length ? html`<div class="table-wrap"><table class="table"><tr><th>${t(L, 'portal.th.set')}</th><th>${t(L, 'portal.th.level')}</th><th>${t(L, 'portal.th.score')}</th><th>${t(L, 'portal.th.predict')}</th><th>${t(L, 'portal.th.date')}</th></tr>${atts.map((a) => { const s = getSet(a.set); return html`<tr><td><a href="/latihan/${a.set}">${s?.title ?? a.set}</a></td><td>${s ? `${COURSE_META[s.course].names[L]} ${levelName(s.course, s.level)}` : ''}</td><td><span class="pill ${a.pct >= 75 ? 'pill-ok' : a.pct >= 55 ? 'pill-warn' : 'pill-bad'}">${a.pct}%</span></td><td>${a.score}</td><td>${fmtDate(L, a.at, true)}</td></tr>`; })}</table></div>` : html`<div class="card"><p style="margin:0">${raw(t(L, 'portal.noHistory', { link: `<a href="/latihan">${t(L, 'portal.firstSet')}</a>` }))}</p></div>`}`);
});

account.get('/portal/akun', async (c) => {
  const u = c.get('user')!, L = langOf(c);
  const csrf = await csrfToken(c, u);
  return portal(c, '/portal/akun', t(L, 'portal.account'), html`
  <div class="page-title"><h1>${t(L, 'portal.account')}</h1></div>
  ${c.req.query('ok') ? html`<div class="alert alert-ok">${c.req.query('ok')}</div>` : ''}${c.req.query('err') ? html`<div class="alert alert-bad">${c.req.query('err')}</div>` : ''}
  <div class="grid g2" style="align-items:start">
    <form class="card stack" method="post" action="/portal/akun/nama"><input type="hidden" name="_csrf" value="${csrf}"><h3 style="margin:0">${t(L, 'portal.profile')}</h3><div class="field"><label for="n">${t(L, 'portal.nameLabel')}</label><input id="n" name="name" value="${u.name}" maxlength="80" required></div><div class="field"><span class="lbl">${t(L, 'auth.email')}</span><span>${u.email}</span></div>
      <div class="field"><label for="ui">${t(L, 'portal.uiLang')}</label><select id="ui" name="ui">${LANGS.map((x) => html`<option value="${x}" ${x === L ? raw('selected') : ''}>${LANG_NAME[x]}</option>`)}</select></div><button class="btn btn-ghost" type="submit">${t(L, 'common.save')}</button></form>
    <form class="card stack" method="post" action="/portal/akun/sandi"><input type="hidden" name="_csrf" value="${csrf}"><h3 style="margin:0">${t(L, 'portal.changePw')}</h3><div class="field"><label for="o">${t(L, 'portal.oldPw')}</label><input id="o" name="old" type="password" autocomplete="current-password" required></div><div class="field"><label for="p">${t(L, 'portal.newPw')}</label><input id="p" name="password" type="password" autocomplete="new-password" minlength="8" required></div><button class="btn btn-ghost" type="submit">${t(L, 'portal.changePwBtn')}</button></form>
  </div>`);
});
account.post('/portal/akun/nama', async (c) => {
  const u = c.get('user')!;
  const f = await c.req.parseBody();
  const L0 = langOf(c);
  const go = (k: 'ok' | 'err', m: string) => c.redirect(`/portal/akun?${k}=${encodeURIComponent(m)}`);
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return go('err', t(L0, 'portal.sessionExpired'));
  const name = String(f.name ?? '').trim().slice(0, 80);
  const ui = isLang(f.ui) ? f.ui : u.ui;
  if (name || ui !== u.ui) await updateUser(c.get('store'), u.id, (x) => ({ ...x, name: name || x.name, ...(ui ? { ui } : {}) }));
  // Bahasa baru langsung berlaku: cookie ikut diperbarui.
  if (ui) setLangCookie(c, ui);
  return go('ok', t(ui ?? L0, ui && ui !== u.ui ? 'portal.uiLangSaved' : 'portal.profileSaved'));
});
account.post('/portal/akun/sandi', async (c) => {
  const u = c.get('user')!;
  const f = await c.req.parseBody();
  const L = langOf(c);
  const go = (k: 'ok' | 'err', m: string) => c.redirect(`/portal/akun?${k}=${encodeURIComponent(m)}`);
  if (!(await csrfOk(c, u, String(f._csrf ?? '')))) return go('err', t(L, 'portal.sessionExpired'));
  if (!(await verifyPassword(String(f.old ?? ''), u.pass))) return go('err', t(L, 'portal.oldPwWrong'));
  const pw = String(f.password ?? '');
  if (pw.length < 8) return go('err', t(L, 'portal.pwShort'));
  const pass = await hashPassword(pw);
  const next = await updateUser(c.get('store'), u.id, (x) => ({ ...x, pass, sv: x.sv + 1 }));
  if (next) await startSession(c, next as User);
  await audit(c.get('store'), u.id, 'user.password', {});
  return go('ok', t(L, 'portal.pwChanged'));
});

/** Akses belajar untuk sebuah bahasa (dipakai rute pelajaran & latihan). */
export const canLearn = (c: Ctx, course: Course): boolean => hasAccess(c.get('subs'), course, c.get('user'));
export { getSubs };
