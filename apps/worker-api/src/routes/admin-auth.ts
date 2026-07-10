import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { hashPassword, verifyPassword, generateTotpSecret, verifyTotp, totpOtpAuthUrl } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";
import { createSession, destroySession, sessionCookieName } from "../lib/session.js";
import { checkRateLimit, resetRateLimit } from "../lib/rate-limit.js";
import { logAdminAction } from "../lib/audit.js";
import { getCookie } from "hono/cookie";
import { getSession } from "../lib/session.js";

export const adminAuthRoute = new Hono<{ Bindings: Env }>();

interface AdminRow {
  id: number;
  email: string;
  password_hash: string;
  totp_secret: string | null;
}

/**
 * Self-heals `admin_users` from the bootstrap secrets on first login attempt.
 * Lets alghoniy2026@gmail.com log in immediately from any machine ("pastiin
 * bisa di rumah") without a separate manual seeding step — the password from
 * GitHub Secrets becomes the source of truth until changed from the portal.
 */
async function ensureAdminBootstrapped(env: Env): Promise<void> {
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM admin_users").first<{ n: number }>();
  if ((count?.n ?? 0) > 0) return;
  if (!env.ADMIN_BOOTSTRAP_EMAIL || !env.ADMIN_BOOTSTRAP_PASSWORD) return;

  const hash = await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD);
  await env.DB.prepare("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)")
    .bind(env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase(), hash)
    .run();
}

// KV rate-limiting must never be what stops a legitimate admin from logging in.
async function softRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    return (await checkRateLimit(env, key, limit, windowSeconds)).allowed;
  } catch (e) {
    console.error("admin rate-limit check failed (allowing through):", e);
    return true;
  }
}

// POST /admin/auth/login — step 1: email + password
adminAuthRoute.post("/login", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  if (!(await softRateLimit(c.env, `admin-login:${ip}`, 5, 60 * 10))) {
    return c.json({ error: "Too many attempts. Try again later." }, 429);
  }

  let body: { email?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid request body" }, 400);
  }
  const email = body.email?.trim();
  const password = body.password ?? "";
  if (!email || !password) return c.json({ error: "email and password required" }, 400);

  await ensureAdminBootstrapped(c.env);

  // If no admin exists and no bootstrap secret is configured, the owner simply
  // hasn't set ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD in GitHub
  // Secrets yet — surface that plainly instead of a misleading "Invalid
  // credentials". The admin portal is hidden, so this hint helps the owner far
  // more than it helps a prober.
  const adminCount = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM admin_users").first<{ n: number }>();
  if ((adminCount?.n ?? 0) === 0 && !c.env.ADMIN_BOOTSTRAP_EMAIL) {
    return c.json(
      {
        error:
          "Admin belum dikonfigurasi. Set ADMIN_BOOTSTRAP_EMAIL & ADMIN_BOOTSTRAP_PASSWORD di GitHub Secrets, lalu deploy ulang.",
        code: "admin_not_configured",
      },
      503
    );
  }

  const admin = await c.env.DB.prepare("SELECT * FROM admin_users WHERE email = ?")
    .bind(email.toLowerCase())
    .first<AdminRow>();

  const bootstrapMatch =
    !admin && email.toLowerCase() === c.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();

  if (!admin && !bootstrapMatch) {
    await logAdminAction(c.env, "login_failed", email, ip, { reason: "unknown_email" });
    return c.json({ error: "Email admin tidak dikenali.", code: "unknown_email" }, 401);
  }

  const valid = admin ? await verifyPassword(password, admin.password_hash) : password === c.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!valid) {
    await logAdminAction(c.env, "login_failed", email, ip, { reason: "bad_password" });
    return c.json({ error: "Kata sandi admin salah.", code: "wrong_password" }, 401);
  }

  await resetRateLimit(c.env, `admin-login:${ip}`);
  const row = admin ?? (await c.env.DB.prepare("SELECT * FROM admin_users WHERE email = ?").bind(email.toLowerCase()).first<AdminRow>())!;

  if (!row.totp_secret) {
    const secret = generateTotpSecret();
    // Carry the setup secret inside the signed pending token — no KV write,
    // so first-time TOTP enrollment works even when the KV budget is spent.
    const pendingToken = await createSession(c.env, {
      subject: "admin_pending_totp",
      id: row.id,
      email: row.email,
      totpSecret: secret,
    });
    return c.json({
      needsTotpSetup: true,
      pendingToken,
      otpauthUrl: totpOtpAuthUrl(secret, row.email),
      secret,
    });
  }

  // Already enrolled — issue a plain pending token (no secret embedded).
  const pendingToken = await createSession(c.env, {
    subject: "admin_pending_totp",
    id: row.id,
    email: row.email,
  });
  return c.json({ needsTotpCode: true, pendingToken });
});

// POST /admin/auth/totp — step 2: 6-digit code (either confirming first-time
// setup, or a normal login) -> issues the real admin session cookie
adminAuthRoute.post("/totp", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const { pendingToken, code } = await c.req.json<{ pendingToken: string; code: string }>();
  const pending = await getSession(c.env, pendingToken);
  if (!pending || pending.subject !== "admin_pending_totp") {
    return c.json({ error: "Session expired, please log in again" }, 401);
  }

  const rl = await checkRateLimit(c.env, `admin-totp:${ip}`, 8, 60 * 10);
  if (!rl.allowed) return c.json({ error: "Too many attempts. Try again later." }, 429);

  // The first-time setup secret rides inside the signed pending token now
  // (no KV); a normal login has no embedded secret and verifies against the
  // one stored in admin_users.
  const setupSecret = pending.totpSecret ?? null;
  let secretToVerify = setupSecret;
  if (!secretToVerify) {
    const admin = await c.env.DB.prepare("SELECT totp_secret FROM admin_users WHERE id = ?")
      .bind(pending.id)
      .first<{ totp_secret: string | null }>();
    secretToVerify = admin?.totp_secret ?? null;
  }
  if (!secretToVerify) return c.json({ error: "No TOTP secret on record" }, 400);

  const ok = await verifyTotp(secretToVerify, code);
  if (!ok) {
    await logAdminAction(c.env, "totp_failed", pending.email, ip);
    return c.json({ error: "Invalid code" }, 401);
  }

  if (setupSecret) {
    await c.env.DB.prepare("UPDATE admin_users SET totp_secret = ? WHERE id = ?")
      .bind(setupSecret, pending.id)
      .run();
  }

  await c.env.DB.prepare("UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?")
    .bind(pending.id)
    .run();
  await destroySession(c.env, pendingToken);
  await resetRateLimit(c.env, `admin-totp:${ip}`);

  const fullToken = await createSession(c.env, { subject: "admin", id: pending.id, email: pending.email });
  setCookie(c, sessionCookieName("admin"), fullToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  await logAdminAction(c.env, "login_success", pending.email, ip);
  return c.json({ ok: true });
});

adminAuthRoute.post("/logout", async (c) => {
  const token = getCookie(c, sessionCookieName("admin"));
  if (token) await destroySession(c.env, token);
  deleteCookie(c, sessionCookieName("admin"), { path: "/" });
  return c.json({ ok: true });
});

adminAuthRoute.get("/me", async (c) => {
  const token = getCookie(c, sessionCookieName("admin"));
  const session = await getSession(c.env, token);
  if (!session || session.subject !== "admin") return c.json({ authenticated: false }, 401);
  return c.json({ authenticated: true, email: session.email });
});

/**
 * Changes the logged-in admin's email and/or password. This is the ONLY way
 * credentials change after first bootstrap — there is no hardcoded account
 * anywhere in the codebase; `admin_users` in D1 is the sole source of truth
 * from this point on, so the bootstrap secrets can safely be rotated or
 * removed in GitHub Secrets afterwards without locking anyone out.
 */
adminAuthRoute.post("/change-credentials", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const token = getCookie(c, sessionCookieName("admin"));
  const session = await getSession(c.env, token);
  if (!session || session.subject !== "admin") return c.json({ error: "Not authenticated" }, 401);

  const rl = await checkRateLimit(c.env, `admin-change-cred:${session.id}`, 5, 60 * 10);
  if (!rl.allowed) return c.json({ error: "Too many attempts. Try again later." }, 429);

  const { currentPassword, newEmail, newPassword } = await c.req.json<{
    currentPassword: string;
    newEmail?: string;
    newPassword?: string;
  }>();

  const admin = await c.env.DB.prepare("SELECT * FROM admin_users WHERE id = ?")
    .bind(session.id)
    .first<AdminRow>();
  if (!admin || !(await verifyPassword(currentPassword, admin.password_hash))) {
    await logAdminAction(c.env, "change_credentials_failed", session.email, ip);
    return c.json({ error: "Current password is incorrect" }, 401);
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  if (newEmail && newEmail.toLowerCase() !== admin.email) {
    updates.push("email = ?");
    values.push(newEmail.toLowerCase());
  }
  if (newPassword) {
    if (newPassword.length < 10) return c.json({ error: "New password must be at least 10 characters" }, 400);
    updates.push("password_hash = ?");
    values.push(await hashPassword(newPassword));
  }
  if (updates.length === 0) return c.json({ error: "Nothing to update" }, 400);

  values.push(session.id);
  await c.env.DB.prepare(`UPDATE admin_users SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  // Invalidate the current session so the new credentials must be used next time.
  if (token) await destroySession(c.env, token);
  deleteCookie(c, sessionCookieName("admin"), { path: "/" });

  await logAdminAction(c.env, "credentials_changed", newEmail ?? session.email, ip, {
    emailChanged: !!newEmail,
    passwordChanged: !!newPassword,
  });

  return c.json({ ok: true, mustLoginAgain: true });
});
