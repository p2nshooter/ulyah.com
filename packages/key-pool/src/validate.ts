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
}

const PROBE_TIMEOUT_MS = 8000;

export async function testApiKey(providerId: string, rawKey: string): Promise<KeyTestResult> {
  const provider = getProvider(providerId);
  if (!provider) {
    return {
      passed: false,
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
        latencyMs,
        safetyScore: 0,
        optimal: false,
        detail: `Provider rejected credentials (HTTP ${res.status}) — key invalid or revoked.`,
      };
    }
    if (!res.ok) {
      return {
        passed: false,
        latencyMs,
        safetyScore: 0.2,
        optimal: false,
        detail: `Unexpected response HTTP ${res.status} from ${provider.label} probe endpoint.`,
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
