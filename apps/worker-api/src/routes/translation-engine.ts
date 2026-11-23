import type { Hono } from "hono";
import type { Env } from "../env.js";

/**
 * The translation engine's state for the admin portal (Languages tab) — read straight from R2.
 *
 * The engine (scripts/mesin-terjemah.ts) runs on GitHub Actions and is the only writer of `mt/_state.json`:
 * coverage per language measured by counting (done / total over the corpus), the corpus size, the last pass
 * (what it translated, what it refused and why) and the one-time move out of D1. Nothing here touches D1
 * (owner, 22 Nov 2026: „Jgn ke D1, pindah ke R2").
 */
export function registerTranslationEngineAdmin(app: Hono<{ Bindings: Env }>): void {
  app.get("/translation-engine", async (c) => {
    if (!c.env.MEDIA_R2) return c.json({ state: null, error: "r2_off" }, 503);
    try {
      const obj = await c.env.MEDIA_R2.get("mt/_state.json");
      const state = obj ? ((await obj.json()) as unknown) : null;
      return c.json({ state }, 200, { "cache-control": "no-store" });
    } catch {
      return c.json({ state: null, error: "unreadable" }, 200);
    }
  });
}
