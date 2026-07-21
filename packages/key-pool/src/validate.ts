import { getProvider } from "@ulyah/shared/providers";

/**
 * Automated "aman & optimal" key-donation test pipeline (arsitektur doc §15.3,
 * user requirement: every donated AI/GPU key is verified before activation).
 *
 * Rules followed to keep this safe for the donor:
 *  - Only ever calls read-only introspection endpoints (whoami / list-models /
 *    account-balance), never a generative/mutating call — so testing a
 *    donated key can never itself burn meaningful quota or take a destructive
 *    action on the donor's account.
 *  - Applies a short timeout so a hanging provider can't stall the queue.
 *  - Never logs the raw key — only the encrypted ref + this structured result.
 */
export interface KeyTestResult {
  passed: boolean;
  latencyMs: number;
  safetyScore: number; // 0.0 - 1.0
  optimal: boolean; // latency + quota headroom good enough for active rotation
  detail: string;
  quotaLimit?: number;
  quotaUsed?: number;
  /**
   * TRUE only when the failure is a CONFIRMED bad credential (revoked / invalid
   * key) — i.e. permanently dead, safe to mark `rejected`. FALSE for a
   * *transient* failure (rate limit, 5xx, timeout, network blip): the key is
   * probably fine and must NOT be permanently rejected — it should cool down
   * as `rate_limited` and be retried. Only meaningful when `passed` is false.
   *
   * The old code treated EVERY `passed:false` as `rejected`, so one momentary
   * HTTP 400/503 during a bulk retest permanently killed a working key and
   * dropped it out of rotation forever — the root cause of the ~280 keys that
   * verified OK yet sat stuck in `rejected`.
   */
  dead: boolean;
}

/** Provider-specific "this 400 really means the API key is invalid" markers.
 * Google AI Studio (Gemini) notoriously returns HTTP 400 with API_KEY_INVALID
 * — not 401 — for a bad key, so a plain status check would misread it as a
 * transient error. Everything else that isn't one of these markers is treated
 * as transient. */
function bodyLooksLikeInvalidKey(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("api_key_invalid") ||
    t.includes("api key not valid") ||
    t.includes("invalid api key") ||
    t.includes("invalid authentication") ||
    t.includes("permission_denied")
  );
}

const PROBE_TIMEOUT_MS = 8000;

export async function testApiKey(providerId: string, rawKey: string): Promise<KeyTestResult> {
  const provider = getProvider(providerId);
  if (!provider) {
    return {
      passed: false,
      dead: true, // an unknown provider can never work — safe to reject
      latencyMs: 0,
      safetyScore: 0,
      optimal: false,
      detail: `Unknown provider "${providerId}" — not in the supported registry.`,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const started = Date.now();

  try {
    const res = await fetch(provider.validation.url, {
      method: provider.validation.method,
      headers: {
        Accept: "application/json",
        "User-Agent": "ulyah.com key-pool validator (read-only probe)",
        ...provider.validation.authHeader(rawKey),
      },
      signal: controller.signal,
    });
    const latencyMs = Date.now() - started;

    if (res.status === 401 || res.status === 403) {
      return {
        passed: false,
        dead: true, // confirmed bad credential
        latencyMs,
        safetyScore: 0,
        optimal: false,
        detail: `Provider rejected credentials (HTTP ${res.status}) — key invalid or revoked.`,
      };
    }
    if (!res.ok) {
      // A 400 can mean "invalid key" (esp. Google's API_KEY_INVALID) OR a
      // transient/bad-probe error. Peek at the body to tell them apart; treat
      // 429 and all 5xx as transient (cool down, don't reject).
      let peek = "";
      try {
        peek = (await res.text()).slice(0, 2000);
      } catch {
        /* body unreadable — fall back to status heuristics below */
      }
      const invalidKey =
        (res.status === 400 || res.status === 404) && bodyLooksLikeInvalidKey(peek);
      return {
        passed: false,
        dead: invalidKey, // only a confirmed invalid-key body is permanently dead
        latencyMs,
        safetyScore: invalidKey ? 0 : 0.2,
        optimal: false,
        detail: invalidKey
          ? `Provider reported the key is invalid (HTTP ${res.status}) — revoked or wrong key.`
          : `Transient HTTP ${res.status} from ${provider.label} probe (rate limit / server error) — cooling down, not rejecting.`,
      };
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      // some providers 200 with empty body on auth-verify endpoints — fine.
    }

    const { safetyScore, detail: scopeDetail, quotaLimit, quotaUsed } = inspectScope(providerId, body);
    const optimal = latencyMs < 3000 && safetyScore >= 0.5;

    return {
      passed: true,
      dead: false,
      latencyMs,
      safetyScore,
      optimal,
      detail: `${provider.label} key verified OK in ${latencyMs}ms. ${scopeDetail}`,
      quotaLimit,
      quotaUsed,
    };
  } catch (err) {
    clearTimeout(timeout);
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      passed: false,
      dead: false, // timeout / network blip is transient, never a permanent reject
      latencyMs: Date.now() - started,
      safetyScore: 0,
      optimal: false,
      detail: isAbort
        ? `Timed out after ${PROBE_TIMEOUT_MS}ms — provider unreachable or too slow.`
        : `Probe failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** Provider-specific heuristics for scope/quota extraction from a successful probe response. */
function inspectScope(
  providerId: string,
  body: Record<string, unknown>
): { safetyScore: number; detail: string; quotaLimit?: number; quotaUsed?: number } {
  switch (providerId) {
    case "openrouter": {
      const data = (body.data ?? {}) as Record<string, unknown>;
      const isProvisioning = data.is_provisioning_key === true;
      const limit = typeof data.limit === "number" ? data.limit : undefined;
      const usage = typeof data.usage === "number" ? data.usage : undefined;
      return {
        // provisioning keys can create/delete other keys — score them lower for the shared pool.
        safetyScore: isProvisioning ? 0.4 : 0.95,
        detail: isProvisioning
          ? "WARNING: this is a provisioning key (can manage other keys), not a plain inference key."
          : "Inference-scoped key, safe for the shared pool.",
        quotaLimit: limit,
        quotaUsed: usage,
      };
    }
    case "replicate": {
      const account = body as Record<string, unknown>;
      return {
        safetyScore: 0.9,
        detail: `Account: ${(account.username as string) ?? "unknown"}.`,
      };
    }
    default:
      return { safetyScore: 0.8, detail: "Read-only introspection succeeded; no elevated-scope signal found." };
  }
}
