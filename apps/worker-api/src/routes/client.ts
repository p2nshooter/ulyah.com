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
  const country = c.req.header("cf-ipcountry")?.toUpperCase() ?? null;
  const row = await c.env.DB.prepare(
    "INSERT INTO clients (email, password_hash, name, country) VALUES (?, ?, ?, ?) RETURNING id"
  )
    .bind(email.toLowerCase(), hash, name ?? null, country)
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
  const [donations, keys, proofs] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM donation_logs WHERE client_id = ? ORDER BY created_at DESC").bind(session.id).all(),
    c.env.DB.prepare(
      "SELECT id, provider, scope, status, donor_label, created_at FROM ai_key_pool WHERE donated_by_client_id = ? ORDER BY created_at DESC"
    )
      .bind(session.id)
      .all(),
    c.env.DB.prepare(
      "SELECT id, method, sender_name, amount, currency, status, cert_no, review_note, created_at FROM donation_proofs WHERE client_id = ? ORDER BY created_at DESC"
    )
      .bind(session.id)
      .all(),
  ]);
  return c.json({ email: session.email, donations: donations.results, keysDonated: keys.results, proofs: proofs.results });
});

// ── Sadaqah proof upload → admin review → certificate ────────────────────
// Registration is only REQUIRED for donors who want the keepsake
// certificate; anonymous donation stays possible everywhere else.

const PROOF_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
const PROOF_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const PROOF_METHODS = new Set(["bank", "crypto", "paypal", "nowpayments", "other"]);

clientRoute.post("/proofs", requireClient, async (c) => {
  const session = c.get("client" as never) as { id: number };
  const rl = await checkRateLimit(c.env, `proof-upload:${session.id}`, 6, 60 * 60);
  if (!rl.allowed) return c.json({ error: "Too many uploads. Try again later." }, 429);

  const form = await c.req.formData();
  const file = form.get("file");
  const method = String(form.get("method") ?? "");
  const senderName = String(form.get("sender_name") ?? "").trim();
  const amountRaw = String(form.get("amount") ?? "").trim();
  const currency = String(form.get("currency") ?? "").trim().toUpperCase().slice(0, 8);
  const transferredAt = String(form.get("transferred_at") ?? "").trim().slice(0, 10);
  const message = String(form.get("message") ?? "").trim().slice(0, 500);

  if (!(file instanceof File)) return c.json({ error: "proof file required" }, 400);
  if (!PROOF_METHODS.has(method)) return c.json({ error: "invalid method" }, 400);
  if (!senderName || senderName.length > 80) return c.json({ error: "sender_name required (max 80 chars)" }, 400);
  const ext = PROOF_TYPES[file.type];
  if (!ext) return c.json({ error: "file must be JPG, PNG, WEBP or PDF" }, 400);
  if (file.size > PROOF_MAX_BYTES) return c.json({ error: "file too large (max 5MB)" }, 400);
  const amount = amountRaw ? Number(amountRaw) : null;
  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) return c.json({ error: "invalid amount" }, 400);

  const r2Key = `proofs/${session.id}/${crypto.randomUUID()}.${ext}`;
  await c.env.MEDIA_R2.put(r2Key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

  const row = await c.env.DB.prepare(
    `INSERT INTO donation_proofs (client_id, method, sender_name, amount, currency, transferred_at, message, proof_r2_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
  )
    .bind(session.id, method, senderName, amount, currency || null, transferredAt || null, message || null, r2Key)
    .first<{ id: number }>();

  return c.json({ ok: true, id: row!.id, status: "pending" });
});

clientRoute.get("/proofs", requireClient, async (c) => {
  const session = c.get("client" as never) as { id: number };
  const { results } = await c.env.DB.prepare(
    "SELECT id, method, sender_name, amount, currency, transferred_at, status, cert_no, review_note, created_at FROM donation_proofs WHERE client_id = ? ORDER BY created_at DESC"
  )
    .bind(session.id)
    .all();
  return c.json({ proofs: results });
});

// Certificate data — only for the owner, only once approved. The web app
// renders this into the printable/downloadable certificate page; the
// browser's own text engine handles Arabic/CJK/Cyrillic shaping that a
// Worker-side PDF library cannot.
clientRoute.get("/certificate/:id", requireClient, async (c) => {
  const session = c.get("client" as never) as { id: number };
  const id = Number(c.req.param("id"));
  const row = await c.env.DB.prepare(
    `SELECT id, sender_name, amount, currency, method, transferred_at, status, cert_no, reviewed_at, created_at
     FROM donation_proofs WHERE id = ? AND client_id = ?`
  )
    .bind(id, session.id)
    .first<{ status: string; cert_no: string | null } & Record<string, unknown>>();
  if (!row) return c.json({ error: "not found" }, 404);
  if (row.status !== "approved" || !row.cert_no) return c.json({ error: "not approved yet" }, 403);
  return c.json({ certificate: row });
});
