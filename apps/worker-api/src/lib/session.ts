import { randomToken } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";

export type SessionSubject = "admin" | "client" | "admin_pending_totp";

export interface SessionData {
  subject: SessionSubject;
  id: number;
  email: string;
}

const SESSION_PREFIX = "sess:";
const ADMIN_TTL = 60 * 60 * 8; // 8h
const PENDING_TTL = 60 * 5; // 5 min to complete TOTP enrollment/verification
const CLIENT_TTL = 60 * 60 * 24 * 14; // 14d

export async function createSession(env: Env, data: SessionData): Promise<string> {
  const token = randomToken(32);
  const ttl = data.subject === "client" ? CLIENT_TTL : data.subject === "admin" ? ADMIN_TTL : PENDING_TTL;
  await env.CACHE_KV.put(SESSION_PREFIX + token, JSON.stringify(data), { expirationTtl: ttl });
  return token;
}

export async function getSession(env: Env, token: string | undefined | null): Promise<SessionData | null> {
  if (!token) return null;
  const raw = await env.CACHE_KV.get(SESSION_PREFIX + token);
  if (!raw) return null;
  return JSON.parse(raw) as SessionData;
}

export async function destroySession(env: Env, token: string): Promise<void> {
  await env.CACHE_KV.delete(SESSION_PREFIX + token);
}

export function sessionCookieName(subject: "admin" | "client"): string {
  return subject === "admin" ? "ulyah_admin_sess" : "ulyah_client_sess";
}
