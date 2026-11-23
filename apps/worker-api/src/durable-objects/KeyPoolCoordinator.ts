import { rankPool } from "@ulyah/key-pool";
import { decryptApiKey } from "@ulyah/shared/crypto";
import { testApiKey } from "@ulyah/key-pool";
import type { AiKeyPoolEntry } from "@ulyah/shared/types";
import type { Env } from "../env.js";
import { listKeySummaries, getKeyRow, setKeyState, logValidation } from "../lib/keypool-store.js";

/**
 * KeyPoolCoordinator — arsitektur doc §13. Single source of truth for
 * real-time AI/GPU key-pool load balancing, exposed over WebSocket
 * (Hibernation API, so idle admin dashboards cost nothing) to every worker
 * and to the admin dashboard's live "Key Pool Manager" view.
 *
 * R2 (`c/ai_key_pool/`, lib/keypool-store.ts) remains the durable source of truth for the keys
 * themselves; this Durable Object is the low-latency coordination + fan-out
 * layer on top of it (job queue, health-check ticks, broadcast).
 */
export class KeyPoolCoordinator implements DurableObject {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/connect")) {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket upgrade", { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.state.acceptWebSocket(server as WebSocket);
      const snapshot = await this.poolSnapshot();
      (server as WebSocket).send(JSON.stringify({ type: "snapshot", data: snapshot }));
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname.endsWith("/health-tick") && request.method === "POST") {
      const result = await this.runHealthTick();
      return Response.json(result);
    }

    if (url.pathname.endsWith("/broadcast") && request.method === "POST") {
      const payload = await request.json();
      this.broadcast(payload);
      return Response.json({ ok: true });
    }

    if (url.pathname.endsWith("/pick") && request.method === "POST") {
      const { scope, provider } = (await request.json()) as { scope: string; provider?: string };
      const snapshot = await this.poolSnapshot();
      const ranked = rankPool(snapshot as unknown as AiKeyPoolEntry[], scope as any).filter(
        (k) => !provider || k.provider === provider
      );
      return Response.json({ best: ranked[0] ?? null, ranked });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const msg = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message));
      if (msg.type === "job:submit") {
        // Queue submission is persisted in D1 (generation_jobs) by the caller
        // (ai-worker) before opening the socket; here we just fan the
        // "job accepted" ack back out for live dashboards.
        this.broadcast({ type: "job:status", jobId: msg.jobId, status: "queued" });
      } else if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
      }
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    try {
      ws.close(code, reason);
    } catch {
      // already closing
    }
  }

  private broadcast(payload: unknown) {
    const msg = JSON.stringify(payload);
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(msg);
      } catch {
        // dead socket, hibernation API will clean it up
      }
    }
  }

  private async poolSnapshot() {
    return (await listKeySummaries(this.env)).filter((k) => k.status !== "revoked");
  }

  /** Health Checker (§13.1) — pings the 25 least-recently-checked active/slow/pending keys (R2, keypool-store.ts). */
  async runHealthTick(): Promise<{ checked: number; changed: number }> {
    const results = (await listKeySummaries(this.env, { fresh: true }))
      .filter((k) => k.status === "active" || k.status === "slow" || k.status === "pending_verification")
      .sort((a, b) => (a.last_health_check ?? "").localeCompare(b.last_health_check ?? ""))
      .slice(0, 25);

    let changed = 0;
    for (const summary of results) {
      try {
        const row = await getKeyRow(this.env, summary.id);
        if (!row) continue;
        const rawKey = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, this.env.KEY_ENCRYPTION_SECRET);
        const test = await testApiKey(row.provider, rawKey);
        // Only a CONFIRMED invalid credential is permanently rejected; a
        // transient failure cools down as `exhausted` (auto-revived), never
        // killed — matches the admin retest / bulk-test classification.
        const newStatus = !test.passed
          ? test.dead
            ? "rejected"
            : "exhausted"
          : test.optimal
            ? "active"
            : "slow";
        if (newStatus !== row.status) changed++;
        await setKeyState(this.env, row.id, { status: newStatus, latency_ms: test.latencyMs, passed: test.passed });
        await logValidation(this.env, { key_id: row.id, test_type: "latency_probe", passed: test.passed, latency_ms: test.latencyMs, safety_score: test.safetyScore, detail: test.detail });
      } catch {
        // decryption/network failure — leave status as-is, will retry next tick
      }
    }

    this.broadcast({ type: "key:health", ts: Date.now(), checked: results.length, changed });
    return { checked: results.length, changed };
  }
}
