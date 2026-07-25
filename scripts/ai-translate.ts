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

/** The providers this translator knows how to call. Between them they cover 487
 *  of the 595 active keys; hf-zerogpu is a Spaces GPU runner, not a chat api,
 *  and is deliberately not pretended to be one. */
const SPEAKS: Record<string, "openai" | "gemini"> = {
  groq: "openai",
  openrouter: "openai",
  "nvidia-nim": "openai",
  "google-ai-studio": "gemini",
};

const ENDPOINT: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  "nvidia-nim": "https://integrate.api.nvidia.com/v1/chat/completions",
};

/** Free, fast, and good enough for translation on each provider. */
const MODEL: Record<string, string> = {
  groq: "llama-3.3-70b-versatile",
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia-nim": "meta/llama-3.3-70b-instruct",
  "google-ai-studio": "gemini-2.0-flash",
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
7. Add nothing that is not in the source, and remove nothing that is. Do not comment on the content.`;
}

/** Load every usable key from the pool, decrypted, in a stable order. */
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
      const r = SPEAKS[k.provider] === "gemini" ? await callGemini(k, system, user) : await callOpenAi(k, system, user);
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
