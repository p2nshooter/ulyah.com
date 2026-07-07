import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import type { Env } from "../env.js";
import { getSession, sessionCookieName } from "./session.js";

export async function requireAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const token =
    getCookie(c, sessionCookieName("admin")) ?? c.req.header("x-admin-session") ?? undefined;
  const session = await getSession(c.env, token);
  if (!session || session.subject !== "admin") {
    return c.json({ error: "Admin authentication required" }, 401);
  }
  c.set("admin" as never, session as never);
  await next();
}

export async function requireClient(c: Context<{ Bindings: Env }>, next: Next) {
  const token =
    getCookie(c, sessionCookieName("client")) ?? c.req.header("x-client-session") ?? undefined;
  const session = await getSession(c.env, token);
  if (!session || session.subject !== "client") {
    return c.json({ error: "Client authentication required" }, 401);
  }
  c.set("client" as never, session as never);
  await next();
}
