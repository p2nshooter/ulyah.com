import { chatComplete, extractJson } from "./adapter.js";
import { outlinePrompt, draftingPrompt, factCheckPrompt, autoCategorizePrompt, type OutlineInput } from "./prompts.js";

export interface StoryGenerationContext extends OutlineInput {
  existingCategories: { id: number; name: string }[];
}

export interface StoryDraft {
  title: string;
  slug: string;
  body: string;
  categoryExistingId: number | null;
  categoryNewName: string | null;
  tags: string[];
  confidence: number;
  factCheckVerdict: "pass" | "revise";
  unsupportedClaims: string[];
}

/**
 * Runs the full zero-hand pipeline (arsitektur doc §14.1, steps 1-5):
 * outline → draft → fact-check → auto-categorize. TTS (step 6) is invoked
 * separately by the caller since it needs a Workers-runtime AI binding.
 *
 * Every step is logged by the caller into `generation_jobs` — this function
 * is pure orchestration and stays environment-agnostic (no D1/KV access).
 */
export async function generateStoryDraft(
  provider: string,
  rawKey: string,
  ctx: StoryGenerationContext
): Promise<StoryDraft> {
  const outlineRes = await chatComplete(provider, rawKey, outlinePrompt(ctx));
  const outlineJson = extractJson<{ outline: string[] }>(outlineRes.text);
  const outline = outlineJson?.outline ?? [];
  if (outline.length === 0) {
    throw new Error("AI outline step returned no usable outline — aborting pipeline.");
  }

  const draftRes = await chatComplete(provider, rawKey, draftingPrompt(outline, ctx));
  const draftJson = extractJson<{ title: string; body: string }>(draftRes.text);
  if (!draftJson?.body) {
    throw new Error("AI drafting step returned no body — aborting pipeline.");
  }

  const factCheckRes = await chatComplete(
    provider,
    rawKey,
    factCheckPrompt(draftJson.body, `${ctx.tafsirSummary}\n${ctx.relatedHadits}`)
  );
  const factCheckJson = extractJson<{ unsupported_claims: string[]; verdict: "pass" | "revise" }>(
    factCheckRes.text
  );

  const categorizeRes = await chatComplete(
    provider,
    rawKey,
    autoCategorizePrompt(ctx.existingCategories, draftJson.title, draftJson.body.slice(0, 300))
  );
  const categorizeJson = extractJson<{
    title: string;
    slug: string;
    category_existing_id: number | null;
    category_new_name: string | null;
    tags: string[];
    confidence: number;
  }>(categorizeRes.text);

  return {
    title: categorizeJson?.title ?? draftJson.title,
    slug: categorizeJson?.slug ?? slugify(draftJson.title),
    body: draftJson.body,
    categoryExistingId: categorizeJson?.category_existing_id ?? null,
    categoryNewName: categorizeJson?.category_new_name ?? null,
    tags: categorizeJson?.tags ?? [],
    confidence: categorizeJson?.confidence ?? 0.5,
    factCheckVerdict: factCheckJson?.verdict ?? "revise",
    unsupportedClaims: factCheckJson?.unsupported_claims ?? [],
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
