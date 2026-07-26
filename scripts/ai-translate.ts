import { decryptApiKey } from "../packages/shared/src/crypto";

/**
 * Translation through the donated AI key pool — 595 active keys, used in turn,
 * each one stepping aside the moment it is rate-limited (owner: "aktifkan
 * seluruh ai untuk menerjemahkan 1 bahasa secara bergantian, seluruh AI saling
 * menyambut klo limit").
 *
 * WHY THIS EXISTS ALONGSIDE gtx
 *
 * Google's free gtx endpoint is one anonymous bucket: it rate-limits the whole
 * runner at once and there is nothing to fail over to, which is why a warm pass
 * would stall for hours. The pool is 595 separate quotas. When one is spent the
 * next takes over, so the run keeps moving instead of waiting.
 *
 * It is also better at the job. gtx translates a sentence at a time with no
 * notion of what the text IS; a model that has been told it is looking at
 * Islamic scholarship keeps "sanad", "tafsir" and "radhiyallahu anhu" intact
 * instead of turning them into something else, and handles the long passages
 * gtx choked on.
 *
 * WHAT IT MUST NOT DO — see PROMPT below. Arabic scripture is reproduced, never
 * translated: the Qur'an has its own tafsir and is not something a language
 * model paraphrases (owner: "alquran jgn d terjemahin sembarangan, krn alquran
 * udah punya tafsirnya sendiri").
 */

export type PoolKey = {
  id: number;
  provider: string;
  key: string;
  /** Set when the key rate-limits, so it is skipped until this time passes. */
  coolUntil?: number;
  fails: number;
};

/**
 * The providers this translator knows how to call.
 *
 * hf-zerogpu is a Spaces GPU runner, not a chat api, and is deliberately not
 * pretended to be one. hf-inference is absent for the same reason: every
 * hf-inference key in the pool is registered under a non-text scope, and a key
 * this translator cannot use is better left visible as unused than quietly
 * counted as available.
 */
const SPEAKS: Record<string, "openai" | "gemini" | "anthropic"> = {
  groq: "openai",
  openrouter: "openai",
  "nvidia-nim": "openai",
  "google-ai-studio": "gemini",
  anthropic: "anthropic",
};

/** Exported so a check can assert which providers are callable without having
 *  to reach one. Read-only view of SPEAKS. */
export const PROVIDERS_SPOKEN: Readonly<Record<string, string>> = SPEAKS;

const ENDPOINT: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  "nvidia-nim": "https://integrate.api.nvidia.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
};

/**
 * The model used on each provider.
 *
 * Anthropic is here because the owner asked for it by name, and it is the one
 * entry that is not free: a key added under this provider is billed per token.
 * It is also the strongest translator of the set for this material — the failure
 * this job keeps hitting is a translator that does not know "nun sukun" is a
 * tajwid rule, and that is a comprehension problem rather than a vocabulary one.
 * Haiku is chosen over the larger models deliberately: translation is the kind
 * of work it is already good at, and this corpus is tens of thousands of strings
 * per language, where the price difference is the whole decision.
 *
 * No key ships here. The pool is read from D1, so a key exists only if somebody
 * adds one through the admin.
 */
const MODEL: Record<string, string> = {
  groq: "llama-3.3-70b-versatile",
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia-nim": "meta/llama-3.3-70b-instruct",
  "google-ai-studio": "gemini-2.0-flash",
  anthropic: "claude-haiku-4-5-20251001",
};

/** Language names the model will recognise. A code like "ps" means nothing to a
 *  model; "Pashto" does, and getting this wrong is how you end up with Persian. */
export const LANGUAGE_NAME: Record<string, string> = {
  id: "Indonesian", en: "English", ar: "Arabic", fr: "French", de: "German",
  es: "Spanish", ru: "Russian", zh: "Simplified Chinese", ja: "Japanese",
  ur: "Urdu", hi: "Hindi", bn: "Bengali", tr: "Turkish", fa: "Persian (Farsi)",
  ms: "Malay", sw: "Swahili", pt: "Portuguese", nl: "Dutch", it: "Italian",
  ta: "Tamil", ha: "Hausa", ps: "Pashto", th: "Thai", ko: "Korean",
  vi: "Vietnamese", uz: "Uzbek", so: "Somali", pl: "Polish",
};

/**
 * The instruction. Written out rather than improvised, because a vague prompt is
 * how religious text gets quietly rewritten (owner: "pastiin AI sudah lu arahin
 * dan dengan bahasa yg benar, jgn asal2an").
 *
 * Every rule here answers a specific way this can go wrong:
 *  · rule 2 protects scripture, and is the one rule that DEPENDS ON DIRECTION —
 *    see below;
 *  · rule 3 keeps the terms a Muslim reader expects instead of an approximation
 *    invented by a translator ("chain of narration" for sanad, and so on);
 *  · rules 5-6 keep the output usable as data — one line in, one line out, no
 *    preamble, so a batch can be split back apart safely;
 *  · rule 7 exists because models like to be helpful. Nothing may be added.
 *
 * WHY RULE 2 IS NOT THE SAME IN BOTH DIRECTIONS
 *
 * This job warms two corpora. The stories are Indonesian with scripture QUOTED
 * inside them; the hadith corpus is Arabic that IS the text to translate. A
 * single "never translate Arabic script" rule is right for the first and
 * catastrophic for the second: told that, the model returns the hadith
 * unchanged, the caller sees output identical to its input and counts all 30,000
 * as failures — while the pool is spent and gtx never gets its turn, because a
 * non-null answer looks like success. Nothing about that is visible in a log
 * except a count of zero.
 *
 * So: translating INTO a language, embedded Arabic is quoted scripture and is
 * reproduced. Translating OUT of Arabic, the Arabic is the source — but a
 * Qur'anic verse quoted inside a hadith is still scripture and is still
 * reproduced rather than paraphrased. Hadith quote the Qur'an constantly, and
 * ﴿…﴾ is how those quotes are marked in this corpus, which gives the model
 * something it can actually recognise instead of a judgement call.
 */
function promptFor(targetName: string, sourceName: string, count: number, fromArabic: boolean): string {
  const scripture = fromArabic
    ? `2. The source is Arabic and you must translate it — EXCEPT for Qur'anic verses. A verse of the Qur'an quoted inside the text (usually written between ﴿ and ﴾) must be reproduced EXACTLY in Arabic, character for character, not translated and not paraphrased. The Qur'an has its own tafsir. Translate the narration around it normally.`
    : `2. ARABIC SCRIPT IS NEVER TRANSLATED. Any passage in Arabic letters (Qur'anic verses, hadith text, du'a) must be reproduced EXACTLY as given, character for character. The Qur'an has its own tafsir; you do not paraphrase it.`;
  return `You are translating text for an Islamic library website from ${sourceName} into ${targetName}.

Rules, all of them mandatory:

1. Translate into natural, fluent ${targetName} as a native speaker writes it — not word for word.
${scripture}
3. Keep Islamic terms in the form ${targetName} readers already use: Qur'an, hadith, sunnah, tafsir, fiqh, sanad, sirah, ihram, hijab, imam, surah, ayah, and the honorifics (ﷺ, radhiyallahu 'anhu, 'alayhis-salam). Do not replace them with invented equivalents.
4. Keep names of people, places and books as they are normally written in ${targetName}.
5. The input is ${count} item(s), one per line. Return EXACTLY ${count} line(s), in the same order, each the translation of the line at that position. Never merge or split lines.
6. Output the translation only. No numbering you were not given, no notes, no explanation, no apology, no quotation marks you were not given.
7. Add nothing that is not in the source, and remove nothing that is. Do not comment on the content.
8. A placeholder of the form @@0@@, @@1@@ and so on stands for text that has already been set aside — a name, or a passage of Arabic scripture. COPY EVERY PLACEHOLDER THROUGH UNCHANGED, in the same order, exactly as written. Never translate one, never renumber one, never drop one, never invent one. The number of placeholders in your answer must equal the number in the source.`;
}

/**
 * Load every usable key from the pool, decrypted, in a stable order.
 *
 * The PROVIDER decides usability, not the row's `scope` label — see the query
 * in warm-mt-cache.ts for why. A provider this translator cannot call is
 * skipped here, so a GPU runner or a Kaggle token can never reach a chat
 * endpoint however it happens to be labelled.
 */
export async function loadPool(
  rows: { id: number; provider: string; key_ref: string; key_iv: string }[],
  secretB64: string
): Promise<PoolKey[]> {
  const out: PoolKey[] = [];
  for (const r of rows) {
    if (!SPEAKS[r.provider]) continue;
    try {
      const key = await decryptApiKey({ ciphertext: r.key_ref, iv: r.key_iv }, secretB64);
      out.push({ id: r.id, provider: r.provider, key, fails: 0 });
    } catch {
      // A key that will not decrypt is a key we cannot use; skipping it is
      // better than failing the run over one bad row.
    }
  }
  return out;
}

type CallResult = { text: string | null; rateLimited: boolean };

async function callOpenAi(k: PoolKey, system: string, user: string): Promise<CallResult> {
  const res = await fetch(ENDPOINT[k.provider]!, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${k.key}` },
    body: JSON.stringify({
      model: MODEL[k.provider],
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (res.status === 429 || res.status === 402) return { text: null, rateLimited: true };
  if (!res.ok) return { text: null, rateLimited: false };
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return { text: j.choices?.[0]?.message?.content?.trim() ?? null, rateLimited: false };
}

async function callGemini(k: PoolKey, system: string, user: string): Promise<CallResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL[k.provider]}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": k.key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });
  if (res.status === 429) return { text: null, rateLimited: true };
  if (!res.ok) return { text: null, rateLimited: false };
  const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  return { text: text || null, rateLimited: false };
}

async function callAnthropic(k: PoolKey, system: string, user: string): Promise<CallResult> {
  const res = await fetch(ENDPOINT[k.provider]!, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": k.key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL[k.provider],
      // Generous, because the cap truncates rather than errors — and a
      // truncated answer loses its last lines, which the line-count check then
      // rejects as a merge. Better to pay for the headroom than to retry.
      max_tokens: 8192,
      temperature: 0.2,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  // 529 is Anthropic's "overloaded" — a wait-and-retry, same as a rate limit.
  if (res.status === 429 || res.status === 529) return { text: null, rateLimited: true };
  if (!res.ok) return { text: null, rateLimited: false };
  const j = (await res.json()) as { content?: { type?: string; text?: string }[] };
  const text = j.content
    ?.filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();
  return { text: text || null, rateLimited: false };
}

/** How long a rate-limited key sits out before being offered again. */
const COOLDOWN_MS = 90_000;
/** A key that keeps erroring for non-quota reasons is retired for the run. */
const MAX_FAILS = 3;

/**
 * Translate one batch of lines. Hands the work to key after key until one
 * answers — which is the entire point of a 595-key pool: no single quota can
 * stop the run, it only moves the work along.
 *
 * Returns null when every key was tried and none answered, so the caller can
 * fall back rather than silently losing the batch.
 */
export async function aiTranslateBatch(
  pool: PoolKey[],
  texts: string[],
  targetCode: string,
  sourceCode: string
): Promise<string[] | null> {
  if (pool.length === 0 || texts.length === 0) return null;
  const targetName = LANGUAGE_NAME[targetCode];
  const sourceName = LANGUAGE_NAME[sourceCode];
  // A language we cannot name is a language we must not ask for: the model
  // would guess, and a wrong guess is a whole corpus in the wrong language.
  if (!targetName || !sourceName) return null;

  // Newlines inside an item would corrupt the split back — flatten first, the
  // same rule the line-count instruction depends on.
  const flat = texts.map((t) => t.replace(/\s*\n\s*/g, " "));
  const system = promptFor(targetName, sourceName, flat.length, sourceCode === "ar");
  const user = flat.join("\n");

  const now = () => Date.now();
  let attempts = 0;
  for (let i = 0; i < pool.length && attempts < 12; i++) {
    // Least-recently-used order: the pool is rotated by the caller, so simply
    // walking it spreads load instead of hammering the first healthy key.
    const k = pool[i]!;
    if (k.fails >= MAX_FAILS) continue;
    if (k.coolUntil && k.coolUntil > now()) continue;
    attempts++;
    try {
      const speaks = SPEAKS[k.provider];
      const r =
        speaks === "gemini"
          ? await callGemini(k, system, user)
          : speaks === "anthropic"
            ? await callAnthropic(k, system, user)
            : await callOpenAi(k, system, user);
      if (r.rateLimited) {
        k.coolUntil = now() + COOLDOWN_MS;
        continue;
      }
      if (!r.text) {
        k.fails++;
        continue;
      }
      const lines = r.text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      // A model that returned the wrong number of lines has merged or split
      // something, and pairing those to the wrong source would put the wrong
      // translation on the wrong hadith. Reject the batch rather than guess.
      if (lines.length !== flat.length) {
        k.fails++;
        continue;
      }
      // An answer identical to its source is not a translation — it is a model
      // that read a "reproduce exactly" rule too broadly, or refused. The
      // caller stores only values that differ from the source, so returning
      // this would count the whole batch as failed AND deny gtx its turn,
      // which is the expensive way to cache nothing. Reject it so the fallback
      // actually runs. (A batch of proper nouns can echo legitimately; sending
      // that to gtx costs one call and reaches the same answer.)
      if (lines.every((l, idx) => l === flat[idx])) {
        k.fails++;
        continue;
      }
      return lines;
    } catch {
      k.fails++;
    }
  }
  return null;
}

/**
 * Languages where Google Translate beats the pool, and the run should not use
 * the pool at all.
 *
 * Not every language gains from a language model. Llama and Gemini have thin
 * training data for these, and what they produce is FLUENT AND WRONG — which is
 * worse than clumsy and right, because nobody on this project reads Hausa or
 * Pashto well enough to catch it. Google Translate is trained on parallel
 * corpora for exactly these pairs: stiffer, and correct.
 *
 * The other twenty-one go to the pool, where context is what matters and the
 * failures of a generic translator are already documented in this repo —
 * "nun sukun" rendered as a Catholic nun, "surat" as postal mail.
 *
 * This is a judgement, not a measurement: the keys are encrypted in D1 and the
 * secret lives in GitHub, so it could not be tested from a sandbox. It is the
 * SAFE default — the direction where being wrong costs least — and it should be
 * replaced by a side-by-side comparison on real sentences when one exists.
 */
export const PREFER_GTX = new Set(["ha", "ps", "so", "uz", "ta", "sw"]);

/**
 * Split the pool into `n` slices that share no key.
 *
 * This is what makes concurrency worth anything. A PoolKey carries mutable
 * state — `coolUntil` when it rate-limits, `fails` when it misbehaves — and if
 * two concurrent calls walk the same array they hand the same key the same work
 * at the same moment, spend one quota twice as fast, and each mark it cooling
 * for the other. Having 489 keys and using them one at a time is a queue; having
 * 489 keys and letting sixteen workers fight over the front of it is worse.
 *
 * Round-robin rather than contiguous, so every slice gets a mix of providers
 * instead of one slice inheriting all of a single provider's rate limit.
 */
export function splitPool(pool: PoolKey[], n: number): PoolKey[][] {
  const slices: PoolKey[][] = Array.from({ length: Math.max(1, n) }, () => []);
  pool.forEach((k, i) => slices[i % slices.length]!.push(k));
  return slices.filter((s) => s.length > 0);
}

/**
 * How many batches to translate at once.
 *
 * The corpus is ~88,000 paragraph translations. Serially, at roughly five
 * seconds a call, that is thirty hours; the limit is not quota — 489 keys is
 * far more than this needs — it is that the calls were waiting for each other.
 *
 * Four keys per worker is the floor: a worker needs somewhere to fail over to
 * when its first key is rate-limited, or concurrency just multiplies the
 * stalls. Sixteen is the ceiling because past that the D1 checkpoint writes,
 * not the translation, become the slow part.
 */
export function concurrencyFor(pool: PoolKey[]): number {
  return Math.max(1, Math.min(16, Math.floor(pool.length / 4)));
}

/**
 * Translate many batches at once, preserving order.
 *
 * Each worker owns a slice of the pool, so no two concurrent calls touch the
 * same key. Results are written back by batch index rather than pushed, because
 * a paragraph paired to the wrong translation is the one failure here that
 * looks completely normal on the page.
 */
export async function translateBatchesParallel(
  pool: PoolKey[],
  batches: string[][],
  targetCode: string,
  sourceCode: string,
  translateOne: (slice: PoolKey[], batch: string[]) => Promise<(string | null)[]>
): Promise<(string | null)[][]> {
  const out: (string | null)[][] = new Array(batches.length);
  const slices = splitPool(pool, concurrencyFor(pool));
  let next = 0; // single-threaded event loop: i++ needs no lock
  await Promise.all(
    slices.map(async (slice) => {
      for (;;) {
        const i = next++;
        if (i >= batches.length) return;
        out[i] = await translateOne(slice, batches[i]!);
      }
    })
  );
  return out;
}

/** Move the used key to the back, so the next batch starts on a different one. */
export function rotate(pool: PoolKey[]): void {
  const first = pool.shift();
  if (first) pool.push(first);
}

export function poolSummary(pool: PoolKey[]): string {
  const byProvider = new Map<string, number>();
  for (const k of pool) byProvider.set(k.provider, (byProvider.get(k.provider) ?? 0) + 1);
  return [...byProvider.entries()].map(([p, n]) => `${p} ${n}`).join(", ");
}

/**
 * Order the pool best-translator-first.
 *
 * The pool is walked in order and the first key that answers does the work, so
 * this ordering decides what actually translates the corpus — everything below
 * the first healthy key is failover, not a peer. Anthropic leads when a key
 * exists because it is the strongest of these at text that carries meaning it
 * must not lose; Gemini next; the Llama endpoints last, where they serve as the
 * broad free capacity that keeps a run moving when the better keys are spent.
 */
const PROVIDER_RANK: Record<string, number> = {
  anthropic: 0,
  "google-ai-studio": 1,
  groq: 2,
  "nvidia-nim": 3,
  openrouter: 4,
};
export function rankPool(pool: PoolKey[]): PoolKey[] {
  return [...pool].sort((a, b) => (PROVIDER_RANK[a.provider] ?? 9) - (PROVIDER_RANK[b.provider] ?? 9));
}
