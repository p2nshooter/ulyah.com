/**
 * Resumable multi-step AI jobs (docs/ADMANAGER-BLUEPRINT.md §9).
 *
 * Owner: "api key AI yg di ulyah.com adalah gratisan, karena itu buat agar
 * smart scaling, nyari AI yg hidup tanpa harus membaca dari awal".
 *
 * Free keys die mid-job (rate limits, daily quotas). Orchestra already fails
 * over to the next live key within ONE call; this adds the other half: each
 * finished step of a multi-step job is saved in KV, so when a later step fails
 * on every key, the next run resumes at that step with whatever key is alive
 * then — it never re-reads or re-generates the steps already done.
 */
import type { Env } from "../../env.js";
import { orchestrate, type Capability } from "../orchestra.js";

export interface AiStep {
  id: string;
  capability: Capability;
  /** Builds the prompt from the outputs of the earlier steps (by id). */
  prompt: (done: Record<string, string>) => string;
  maxTokens?: number;
}

export interface CheckpointResult {
  ok: boolean;
  outputs: Record<string, string>;
  /** Steps finished in THIS run (the rest came from the checkpoint). */
  ranNow: string[];
  /** The step it stopped at when no key was alive, if any. */
  stoppedAt: string | null;
  servedBy: string[];
}

const TTL_SECONDS = 2 * 24 * 3600;

export async function runCheckpointed(env: Env, jobKey: string, steps: AiStep[]): Promise<CheckpointResult> {
  const kvKey = `adops:ai:${jobKey}`;
  let outputs: Record<string, string> = {};
  try {
    const saved = await env.CACHE_KV.get(kvKey);
    if (saved) outputs = JSON.parse(saved) as Record<string, string>;
  } catch {
    outputs = {};
  }
  const ranNow: string[] = [];
  const servedBy: string[] = [];
  for (const step of steps) {
    if (outputs[step.id] !== undefined) continue; // finished in an earlier run: do not redo it
    const r = await orchestrate(env, { capability: step.capability, prompt: step.prompt(outputs), maxTokens: step.maxTokens ?? 700 });
    if (!r.ok || !r.text?.trim()) {
      return { ok: false, outputs, ranNow, stoppedAt: step.id, servedBy };
    }
    outputs[step.id] = r.text.trim();
    ranNow.push(step.id);
    if (r.servedBy) servedBy.push(r.servedBy);
    await env.CACHE_KV.put(kvKey, JSON.stringify(outputs), { expirationTtl: TTL_SECONDS }).catch(() => undefined);
  }
  return { ok: true, outputs, ranNow, stoppedAt: null, servedBy };
}
