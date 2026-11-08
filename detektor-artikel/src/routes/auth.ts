/** Daftar, masuk, 2FA, keluar. Akun pemilik dibuat otomatis dari secret ADMIN_BOOTSTRAP_* (tanpa langkah manual). */
import { Hono } from 'hono';
import { html } from '../lib/html.ts';
import { tr, type Lang } from '../lib/i18n.ts';
import { page, flash, LOGO, BRAND } from '../pages/ui.ts';
import { createUser, EmailTakenError, findByEmail, getUser, isAdmin, updateUser, type User } from '../data/users.ts';
import { verifyPassword, timingSafeEqual, verifyTotp, newTotpSecret, seal, unseal, type Sealed } from '../lib/crypto.ts';
import { startSession, endSession, setPending2fa, readPending2fa, setLangCookie, portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import { limit } from '../lib/ratelimit.ts';
import { audit } from '../data/audit.ts';
import { getCookie, deleteCookie } from 'hono/cookie';
import { sha256Hex } from '../lib/crypto.ts';
import { getAffiliateSettings, noteReferral, uidForCode } from '../data/affiliate.ts';
import { getBilling } from '../data/settings.ts';
import { credit } from '../data/wallet.ts';

/**
 * Akun pemilik bawaan (pemilik, 2 Nov 2026). Repo ini PUBLIK: yang disimpan hanya hash PBKDF2-SHA256,
 * tidak pernah sandi aslinya (pola yang sama dengan repo xaa). Hash ini hanya dipakai sekali untuk membuat
 * akun pemilik saat pertama masuk; setelah itu sandi di akun yang berlaku dan bisa diganti di Pengaturan.
 */
const OWNER_SEED = {
  email: 'alghoniy2026@gmail.com',
  passwordHash: 'pbkdf2$100000$VOy29DR3UljFD-WLZEuH4w$Qsk_ukvOGQp2F8DVY4SqFqidY7f9aNa4a9_ubpqu22c',
};

const ipHashOf = async (c: Ctx) => (await sha256Hex(`ip:${c.req.header('cf-connecting-ip') ?? 'local'}`)).slice(0, 24);

export const auth = new Hono<HonoEnv>();

const langOf = (c: Ctx): Lang => (c.req.query('lang') === 'en' ? 'en' : portalLang(c));

function authShell(L: Lang, title: string, inner: ReturnType<typeof html>, side: { h: string; p: string; points: string[] }): string {
  return page({
    L,
    title,
    area: 'print',
    body: html`<div class="auth">
  <aside class="auth-side"><div class="aurora" aria-hidden="true"></div><a class="brand light" href="${L === 'en' ? '/en' : '/'}">${LOGO}<span>${BRAND}</span></a><div class="auth-copy"><img class="auth-badge" src="/assets/logo-badge-192.webp" width="120" height="120" alt=""><h2>${side.h}</h2><p>${side.p}</p><ul>${side.points.map((x) => html`<li>✓ ${x}</li>`)}</ul></div></aside>
  <section class="auth-main"><div class="auth-card reveal">${inner}</div></section>
</div>`,
  });
}

const sideCopy = (L: Lang) => ({
  h: tr(L, 'Periksa tulisan dengan tenang.', 'Check writing with confidence.'),
  p: tr(L, 'Persen AI per kalimat, rubrik siap juri, laporan yang bisa dicetak — Bahasa Indonesia & English.', 'Per-sentence AI percentages, judge-ready rubrics, printable reports — Indonesian & English.'),
  points: [tr(L, 'Bayar sesuai pemakaian — gagal tidak dipotong', 'Pay for what you use — failures are not deducted'), tr(L, 'Teks dienkripsi & terhapus otomatis', 'Texts encrypted & deleted automatically'), tr(L, 'Haiku → Sonnet → Opus, termurah dulu', 'Haiku → Sonnet → Opus, cheapest first')],
});

function loginForm(L: Lang, err?: string, email = ''): string {
  return authShell(
    L,
    tr(L, 'Masuk', 'Log in'),
    html`<h1>${tr(L, 'Selamat datang kembali', 'Welcome back')}</h1><p class="muted">${tr(L, 'Masuk untuk memeriksa naskah dan melihat laporan.', 'Log in to check texts and see your reports.')}</p>
    ${flash(L, null, err)}
    <form method="post" action="/masuk${L === 'en' ? '?lang=en' : ''}" class="form" data-busy-form>
      <label class="field"><span>E-mail</span><input type="email" name="email" value="${email}" autocomplete="email" required autofocus></label>
      <label class="field"><span>${tr(L, 'Sandi', 'Password')}</span><input type="password" name="password" autocomplete="current-password" required minlength="8"></label>
      <button class="btn btn-primary btn-block" type="submit" data-busy="${tr(L, 'Memeriksa…', 'Checking…')}">${tr(L, 'Masuk', 'Log in')}</button>
    </form>
    <p class="muted center">${tr(L, 'Belum punya akun?', 'No account yet?')} <a href="/daftar${L === 'en' ? '?lang=en' : ''}">${tr(L, 'Daftar', 'Sign up')}</a></p>`,
    sideCopy(L),
  );
}

auth.get('/masuk', (c) => {
  if (c.get('user')) return c.redirect('/app');
  return c.html(loginForm(langOf(c)));
});

auth.post('/masuk', async (c) => {
  const L = langOf(c);
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  if (!(await limit(c.env, `login:${ip}`, 20, 900))) return c.html(loginForm(L, tr(L, 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.', 'Too many attempts. Try again in 15 minutes.')), 429);
  const f = await c.req.parseBody();
  const email = String(f.email ?? '').trim().toLowerCase();
  const password = String(f.password ?? '');
  const store = c.get('store');
  let user = await findByEmail(store, email);
  // Pemilik pertama: akun pemilik bawaan (hanya hash di kode) atau secret ADMIN_BOOTSTRAP_* → OWNER_BOOTSTRAP_*.
  const seedOk = !user && email === OWNER_SEED.email && (await verifyPassword(password, OWNER_SEED.passwordHash));
  const secretOk = Boolean(c.env.OWNER_BOOTSTRAP_EMAIL && c.env.OWNER_BOOTSTRAP_PASSWORD && email === c.env.OWNER_BOOTSTRAP_EMAIL.trim().toLowerCase() && timingSafeEqual(password, c.env.OWNER_BOOTSTRAP_PASSWORD));
  if (!user && (seedOk || secretOk)) {
    const first = await store.createOnce('u/owner', { email, at: Date.now() });
    if (first) {
      user = await createUser(store, { email, name: 'Pemilik', password, lang: 'id', role: 'owner' });
      await audit(store, user.id, 'owner.bootstrap', { email });
    }
  }
  if (!user || !(await verifyPassword(password, user.pass)) || user.suspended) {
    return c.html(loginForm(L, tr(L, 'E-mail atau sandi salah.', 'Wrong e-mail or password.'), email), 401);
  }
  const ipHash = await ipHashOf(c);
  await updateUser(store, user.id, (u) => ({ ...u, lastLoginAt: Date.now(), ipHash }));
  if (user.totp) {
    await setPending2fa(c, user);
    return c.redirect('/masuk/2fa');
  }
  await startSession(c, user, false);
  return c.redirect(isAdmin(user) ? '/admin/2fa' : '/app');
});

function twofaForm(L: Lang, err?: string): string {
  return authShell(
    L,
    tr(L, 'Verifikasi 2 langkah', 'Two-step verification'),
    html`<h1>${tr(L, 'Kode dari aplikasi autentikator', 'Code from your authenticator app')}</h1><p class="muted">${tr(L, 'Buka Google Authenticator / Authy / 1Password lalu masukkan 6 angka untuk AI Content Analyzer.', 'Open Google Authenticator / Authy / 1Password and enter the 6 digits for AI Content Analyzer.')}</p>
    ${flash(L, null, err)}
    <form method="post" action="/masuk/2fa" class="form"><label class="field"><span>${tr(L, 'Kode 6 angka', '6-digit code')}</span><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" required autofocus class="otp"></label><button class="btn btn-primary btn-block" type="submit">${tr(L, 'Verifikasi', 'Verify')}</button></form>`,
    sideCopy(L),
  );
}

auth.get('/masuk/2fa', async (c) => {
  if (!(await readPending2fa(c))) return c.redirect('/masuk');
  return c.html(twofaForm(langOf(c)));
});

auth.post('/masuk/2fa', async (c) => {
  const L = langOf(c);
  const pend = await readPending2fa(c);
  if (!pend) return c.redirect('/masuk');
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  if (!(await limit(c.env, `2fa:${pend.u}:${ip}`, 10, 600))) return c.html(twofaForm(L, tr(L, 'Terlalu banyak percobaan.', 'Too many attempts.')), 429);
  const store = c.get('store');
  const user = await getUser(store, pend.u);
  if (!user || user.sv !== pend.v || !user.totp || !c.env.MASTER_KEY) return c.redirect('/masuk');
  const { secret } = await unseal<{ secret: string }>(c.env.MASTER_KEY, user.totp, 'totp');
  if (!(await verifyTotp(secret, String((await c.req.parseBody()).code ?? '')))) return c.html(twofaForm(L, tr(L, 'Kode salah atau kedaluwarsa.', 'Wrong or expired code.')), 401);
  await startSession(c, user, true);
  return c.redirect(isAdmin(user) ? '/admin' : '/app');
});

/** Pasang 2FA (wajib untuk admin, pilihan untuk member). */
auth.get('/2fa/pasang', async (c) => {
  const user = c.get('user');
  if (!user) return c.redirect('/masuk');
  const L = portalLang(c);
  if (!c.env.MASTER_KEY) return c.text('MASTER_KEY missing', 500);
  const secret = newTotpSecret();
  const sealed: Sealed = await seal(c.env.MASTER_KEY, { secret }, 'totp');
  await updateUser(c.get('store'), user.id, (u) => ({ ...u, totpPending: sealed }));
  const uri = `otpauth://totp/${encodeURIComponent(`${BRAND}:${user.email}`)}?secret=${secret}&issuer=${encodeURIComponent(BRAND)}&digits=6&period=30`;
  const err = c.req.query('err');
  return c.html(
    authShell(
      L,
      tr(L, 'Pasang verifikasi 2 langkah', 'Set up two-step verification'),
      html`<h1>${tr(L, 'Lindungi akun dengan 2FA', 'Protect your account with 2FA')}</h1>
      ${isAdmin(user) ? html`<div class="flash info">${tr(L, 'Wajib untuk akun admin sebelum membuka portal admin.', 'Required for admin accounts before opening the admin portal.')}</div>` : ''}
      ${flash(L, null, err ? tr(L, 'Kode salah. Coba lagi dengan kode terbaru.', 'Wrong code. Try again with the latest code.') : null)}
      <ol class="steps-mini">
        <li>${tr(L, 'Pasang aplikasi autentikator (Google Authenticator, Authy, 1Password).', 'Install an authenticator app (Google Authenticator, Authy, 1Password).')}</li>
        <li>${tr(L, 'Di ponsel: ketuk tautan ini, atau tambahkan akun secara manual dengan kunci di bawah.', 'On your phone: tap this link, or add an account manually with the key below.')} <a href="${uri}">${tr(L, 'Buka di aplikasi', 'Open in app')}</a></li>
        <li>${tr(L, 'Masukkan 6 angka yang muncul.', 'Enter the 6 digits shown.')}</li>
      </ol>
      <div class="secret-box"><code id="totpSecret">${secret.replace(/(.{4})/g, '$1 ').trim()}</code><button class="btn btn-ghost btn-sm" type="button" data-copy="#totpSecret">${tr(L, 'Salin', 'Copy')}</button></div>
      <form method="post" action="/2fa/pasang" class="form"><label class="field"><span>${tr(L, 'Kode 6 angka', '6-digit code')}</span><input name="code" inputmode="numeric" autocomplete="one-time-code" required class="otp"></label><button class="btn btn-primary btn-block" type="submit">${tr(L, 'Aktifkan 2FA', 'Turn on 2FA')}</button></form>`,
      sideCopy(L),
    ),
  );
});

auth.post('/2fa/pasang', async (c) => {
  const user = c.get('user');
  if (!user || !user.totpPending || !c.env.MASTER_KEY) return c.redirect('/masuk');
  const { secret } = await unseal<{ secret: string }>(c.env.MASTER_KEY, user.totpPending, 'totp');
  const code = String((await c.req.parseBody()).code ?? '');
  if (!(await verifyTotp(secret, code))) return c.redirect('/2fa/pasang?err=1');
  const store = c.get('store');
  const updated = await updateUser(store, user.id, (u) => ({ ...u, totp: u.totpPending, totpPending: undefined }));
  await audit(store, user.id, '2fa.enabled', {});
  if (updated) await startSession(c, updated, true);
  return c.redirect(isAdmin(user) ? '/admin' : '/app/pengaturan?ok=2fa');
});

function signupForm(L: Lang, err?: string, v: Record<string, string> = {}): string {
  return authShell(
    L,
    tr(L, 'Daftar', 'Sign up'),
    html`<h1>${tr(L, 'Buat akun', 'Create an account')}</h1><p class="muted">${tr(L, 'Setelah mendaftar, beli token lalu periksa naskah. Semua laporan tersimpan sebagai riwayat kerja.', 'After signing up, buy tokens and check texts. Every report is kept as work history.')}</p>
    ${flash(L, null, err)}
    <form method="post" action="/daftar${L === 'en' ? '?lang=en' : ''}" class="form" data-busy-form>
      <label class="field"><span>${tr(L, 'Nama', 'Name')}</span><input name="name" value="${v.name ?? ''}" autocomplete="name" required maxlength="80"></label>
      <label class="field"><span>E-mail</span><input type="email" name="email" value="${v.email ?? ''}" autocomplete="email" required></label>
      <label class="field"><span>${tr(L, 'Sandi (min. 8 karakter)', 'Password (min. 8 characters)')}</span><input type="password" name="password" autocomplete="new-password" required minlength="8" data-strength></label>
      <div class="strength" aria-hidden="true"><i></i></div>
      <label class="check"><input type="checkbox" name="agree" required> <span>${tr(L, 'Saya setuju dengan', 'I agree to the')} <a href="${L === 'en' ? '/en/terms' : '/syarat'}" target="_blank">${tr(L, 'syarat', 'terms')}</a> ${tr(L, 'dan', 'and')} <a href="${L === 'en' ? '/en/privacy' : '/kebijakan-privasi'}" target="_blank">${tr(L, 'kebijakan privasi', 'privacy policy')}</a>.</span></label>
      <input type="hidden" name="lang" value="${L}">
      <button class="btn btn-primary btn-block" type="submit" data-busy="${tr(L, 'Membuat akun…', 'Creating account…')}">${tr(L, 'Daftar & mulai', 'Sign up & start')}</button>
    </form>
    <p class="muted center">${tr(L, 'Sudah punya akun?', 'Already have an account?')} <a href="/masuk${L === 'en' ? '?lang=en' : ''}">${tr(L, 'Masuk', 'Log in')}</a></p>`,
    sideCopy(L),
  );
}

auth.get('/daftar', (c) => {
  if (c.get('user')) return c.redirect('/app');
  return c.html(signupForm(langOf(c)));
});

auth.post('/daftar', async (c) => {
  const L = langOf(c);
  const f = await c.req.parseBody();
  const v = { name: String(f.name ?? ''), email: String(f.email ?? '').trim().toLowerCase() };
  const password = String(f.password ?? '');
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  if (!(await limit(c.env, `signup:${ip}`, 5, 3600))) return c.html(signupForm(L, tr(L, 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.', 'Too many sign-ups from this network. Try later.'), v), 429);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return c.html(signupForm(L, tr(L, 'Format e-mail tidak sah.', 'Invalid e-mail format.'), v), 400);
  if (password.length < 8) return c.html(signupForm(L, tr(L, 'Sandi minimal 8 karakter.', 'Password must be at least 8 characters.'), v), 400);
  if (!f.agree) return c.html(signupForm(L, tr(L, 'Centang persetujuan syarat dan privasi.', 'Tick the terms and privacy agreement.'), v), 400);
  if (v.email === OWNER_SEED.email || (c.env.OWNER_BOOTSTRAP_EMAIL && v.email === c.env.OWNER_BOOTSTRAP_EMAIL.trim().toLowerCase())) {
    return c.html(signupForm(L, tr(L, 'E-mail ini dipakai akun pemilik — silakan masuk.', 'This e-mail belongs to the owner account — please log in.'), v), 400);
  }
  const store = c.get('store');
  const ipHash = await ipHashOf(c);
  // Referal afiliasi: diikat sekali saat daftar; referal-diri (IP sama dengan pemberi referal) tidak dihitung.
  let ref: string | undefined;
  const refCode = getCookie(c, 'tl_ref');
  if (refCode && (await getAffiliateSettings(store)).enabled) {
    const refUid = await uidForCode(store, refCode.toUpperCase());
    const refUser = refUid ? await getUser(store, refUid) : null;
    if (refUser && refUser.ipHash !== ipHash && refUser.email !== v.email) ref = refUser.id;
  }
  let user: User;
  try {
    user = await createUser(store, { email: v.email, name: v.name, password, lang: f.lang === 'en' ? 'en' : 'id', ref, ipHash });
  } catch (err) {
    if (err instanceof EmailTakenError) return c.html(signupForm(L, tr(L, 'E-mail sudah terdaftar. Silakan masuk.', 'E-mail already registered. Please log in.'), v), 409);
    throw err;
  }
  if (ref) await noteReferral(store, ref, user.id);
  deleteCookie(c, 'tl_ref', { path: '/', secure: true });
  const welcome = (await getBilling(store)).welcomeTokens;
  if (welcome > 0) await credit(store, user.id, welcome, 'welcome', 'Token sambutan akun baru', `welcome:${user.id}`);
  await startSession(c, user, false);
  return c.redirect('/app?welcome=1');
});

auth.post('/keluar', (c) => {
  endSession(c);
  return c.redirect('/');
});

auth.get('/lang', async (c) => {
  const to: Lang = c.req.query('to') === 'en' ? 'en' : 'id';
  setLangCookie(c, to);
  const user = c.get('user');
  if (user) await updateUser(c.get('store'), user.id, (u) => ({ ...u, lang: to }));
  // `next`: halaman yang sama dalam bahasa tujuan (tombol bahasa di halaman publik). Hanya jalur di situs ini.
  const next = c.req.query('next') ?? '';
  if (/^\/(?!\/)[^\s\\]*$/.test(next)) return c.redirect(next);
  const back = c.req.header('referer');
  return c.redirect(back && new URL(back).host === new URL(c.req.url).host ? back : '/app');
});
