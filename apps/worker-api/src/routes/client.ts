import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { hashPassword, verifyPassword } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";
import { createSession, destroySession, sessionCookieName, getSession } from "../lib/session.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import { requireClient } from "../lib/auth-middleware.js";

export const clientRoute = new Hono<{ Bindings: Env }>();

// Optional donor/contributor account layer — NOT required for visitors
// (arsitektur doc §2 "Zero Login (User)" still holds for reading/listening).
// Lets a donor track their donations and AI/GPU key contributions.

clientRoute.post("/register", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `client-register:${ip}`, 5, 60 * 10);
  if (!rl.allowed) return c.json({ error: "Too many attempts. Try again later." }, 429);

  const { email, password, name } = await c.req.json<{ email: string; password: string; name?: string }>();
  if (!email || !password || password.length < 8) {
    return c.json({ error: "email and password (min 8 chars) required" }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT id FROM clients WHERE email = ?")
    .bind(email.toLowerCase())
    .first();
  if (existing) return c.json({ error: "Email already registered" }, 409);

  const hash = await hashPassword(password);
  const row = await c.env.DB.prepare(
    "INSERT INTO clients (email, password_hash, name) VALUES (?, ?, ?) RETURNING id"
  )
    .bind(email.toLowerCase(), hash, name ?? null)
    .first<{ id: number }>();

  const token = await createSession(c.env, { subject: "client", id: row!.id, email: email.toLowerCase() });
  setCookie(c, sessionCookieName("client"), token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return c.json({ ok: true, id: row!.id });
});

clientRoute.post("/login", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `client-login:${ip}`, 8, 60 * 10);
  if (!rl.allowed) return c.json({ error: "Too many attempts. Try again later." }, 429);

  const { email, password } = await c.req.json<{ email: string; password: string }>();
  const row = await c.env.DB.prepare("SELECT * FROM clients WHERE email = ?")
    .bind(email?.toLowerCase())
    .first<{ id: number; email: string; password_hash: string }>();

  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  await c.env.DB.prepare("UPDATE clients SET last_login_at = datetime('now') WHERE id = ?").bind(row.id).run();
  const token = await createSession(c.env, { subject: "client", id: row.id, email: row.email });
  setCookie(c, sessionCookieName("client"), token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return c.json({ ok: true });
});

clientRoute.post("/logout", async (c) => {
  const token = getCookie(c, sessionCookieName("client"));
  if (token) await destroySession(c.env, token);
  deleteCookie(c, sessionCookieName("client"), { path: "/" });
  return c.json({ ok: true });
});

clientRoute.get("/me", requireClient, async (c) => {
  const session = c.get("client" as never) as { id: number; email: string };
  const [donations, keys] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM donation_logs WHERE client_id = ? ORDER BY created_at DESC").bind(session.id).all(),
    c.env.DB.prepare(
      "SELECT id, provider, scope, status, donor_label, created_at FROM ai_key_pool WHERE donated_by_client_id = ? ORDER BY created_at DESC"
    )
      .bind(session.id)
      .all(),
  ]);
  return c.json({ email: session.email, donations: donations.results, keysDonated: keys.results });
});
