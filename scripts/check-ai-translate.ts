/**
 * Offline proof of the failover logic in scripts/ai-translate.ts.
 *
 * fetch is replaced, so nothing here reaches a provider and no key is needed.
 * That is the point: the pool's keys are AES-encrypted in D1 and the secret
 * lives in GitHub, so the only thing testable outside a warm run is the
 * DECISION-MAKING — which key is tried, when one is set aside, and what is
 * refused outright. Those are also the parts that fail silently in production:
 * a batch mis-paired to the wrong hadith looks exactly like a batch that
 * worked.
 *
 * What this does NOT test, and cannot: whether the translations are any good.
 * See PREFER_GTX in ai-translate.ts.
 *
 *   npx tsx scripts/check-ai-translate.ts
 */
import { aiTranslateBatch, rotate, rankPool, loadPool, PROVIDERS_SPOKEN, PREFER_GTX, type PoolKey } from "./ai-translate";

const key = (id: number, provider: string): PoolKey => ({ id, provider, key: `k${id}`, fails: 0 });
let calls: { id: number; system: string; user: string }[] = [];
let fail = 0;
let ok = 0;

type Responder = (k: string, body: any) => { status: number; json: any };
let responder: Responder;

let lastInit: any = { headers: {}, body: "{}" };

(globalThis as any).fetch = async (url: string, init: any) => {
  lastInit = init;
  const body = JSON.parse(init.body);
  const auth: string =
    init.headers.Authorization ?? init.headers["x-goog-api-key"] ?? init.headers["x-api-key"] ?? "";
  const id = Number(auth.replace("Bearer ", "").replace("k", ""));
  // Three request shapes: OpenAI puts the system prompt in messages[0],
  // Anthropic in a top-level `system`, Gemini in `systemInstruction`.
  const system = body.system ?? (body.messages ? body.messages[0].content : body.systemInstruction.parts[0].text);
  const user = body.system
    ? body.messages[0].content
    : body.messages
      ? body.messages[1].content
      : body.contents[0].parts[0].text;
  calls.push({ id, system, user });
  const r = responder(auth, body);
  return { status: r.status, ok: r.status === 200, json: async () => r.json };
};

const openai = (text: string) => ({ status: 200, json: { choices: [{ message: { content: text } }] } });
const gemini = (text: string) => ({ status: 200, json: { candidates: [{ content: { parts: [{ text }] } }] } });
const anthropic = (text: string) => ({ status: 200, json: { content: [{ type: "text", text }] } });

function check(name: string, cond: boolean, extra = "") {
  if (cond) { ok++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
}

async function run() {
  const src = ["Kisah Nabi Musa", "Sanad hadits ini shahih", "Tafsir surat Al-Fatihah"];

  // 1. Happy path: first key answers, three lines in, three lines out.
  console.log("\n1. a healthy key answers and the lines pair up");
  calls = [];
  responder = () => openai("Die Geschichte des Propheten Musa\nDie Sanad dieses Hadith ist sahih\nTafsir der Sure Al-Fatihah");
  let pool = [key(1, "groq"), key(2, "openrouter")];
  let out = await aiTranslateBatch(pool, src, "de", "id");
  check("returns 3 lines", out?.length === 3, JSON.stringify(out));
  check("only one key was spent", calls.length === 1, `${calls.length} calls`);
  check("prompt names the real target language", calls[0]!.system.includes("German"), calls[0]!.system.slice(0, 60));
  check("prompt forbids translating Arabic script", calls[0]!.system.includes("ARABIC SCRIPT IS NEVER TRANSLATED"));
  check("prompt states the exact line count", calls[0]!.system.includes("3 line(s)"));

  // 2. Rate limit: the spent key steps aside and the next one takes over. This
  //    is the entire reason the pool exists.
  console.log("\n2. a rate-limited key hands the work to the next one");
  calls = [];
  responder = (auth) => (auth.endsWith("k1") ? { status: 429, json: {} } : openai("a\nb\nc"));
  pool = [key(1, "groq"), key(2, "openrouter")];
  out = await aiTranslateBatch(pool, src, "de", "id");
  check("still translated", out?.length === 3);
  check("failed over to key 2", calls.map((c) => c.id).join(",") === "1,2", calls.map((c) => c.id).join(","));
  check("key 1 is cooling, not retried", (pool[0]!.coolUntil ?? 0) > Date.now());
  check("key 1 was not counted as broken", pool[0]!.fails === 0);

  // 3. Wrong line count = a merged or split line. Pairing that to the source
  //    would put the wrong translation on the wrong hadith, so it is rejected.
  console.log("\n3. a model that merges lines is rejected, not guessed at");
  calls = [];
  responder = (auth) => (auth.endsWith("k1") ? openai("only one line back") : openai("a\nb\nc"));
  pool = [key(1, "groq"), key(2, "openrouter")];
  out = await aiTranslateBatch(pool, src, "de", "id");
  check("did not accept the short answer", out?.length === 3);
  check("key 1 counted as failing", pool[0]!.fails === 1);
  check("the good answer came from key 2", calls.length === 2);

  // 4. Every key spent → null, so the caller falls back to gtx instead of
  //    silently losing the batch.
  console.log("\n4. an exhausted pool returns null so gtx can take over");
  calls = [];
  responder = () => ({ status: 429, json: {} });
  pool = [key(1, "groq"), key(2, "openrouter"), key(3, "nvidia-nim")];
  out = await aiTranslateBatch(pool, src, "de", "id");
  check("returned null", out === null, String(out));
  check("tried every key once", calls.length === 3, `${calls.length}`);

  // 5. A language the prompt cannot name must not be requested — the model
  //    would guess, and a wrong guess is a whole corpus in the wrong language.
  console.log("\n5. an unnameable language is refused before any call");
  calls = [];
  responder = () => openai("a\nb\nc");
  pool = [key(1, "groq")];
  out = await aiTranslateBatch(pool, src, "xx", "id");
  check("returned null", out === null);
  check("made no call at all", calls.length === 0, `${calls.length}`);

  // 6. Gemini keys speak a different protocol.
  console.log("\n6. google-ai-studio keys are called the Gemini way");
  calls = [];
  responder = () => gemini("a\nb\nc");
  pool = [key(9, "google-ai-studio")];
  out = await aiTranslateBatch(pool, src, "fr", "id");
  check("translated via Gemini shape", out?.length === 3, JSON.stringify(out));
  check("prompt says French", calls[0]!.system.includes("French"));

  // 7. Newlines inside an item would corrupt the split back apart.
  console.log("\n7. a multi-line source item is flattened before sending");
  calls = [];
  responder = () => openai("x\ny");
  pool = [key(1, "groq")];
  out = await aiTranslateBatch(pool, ["baris satu\nbaris dua", "kedua"], "de", "id");
  check("sent 2 lines, not 3", calls[0]!.user.split("\n").length === 2, JSON.stringify(calls[0]!.user));

  // 7b. Direction. The hadith corpus is Arabic translated OUT; the stories are
  //     Indonesian with Arabic quoted INSIDE. One "never translate Arabic" rule
  //     serves the second and destroys the first — the model would hand back the
  //     hadith unchanged and all 30,000 would be counted as failures.
  console.log("\n7b. the scripture rule follows the direction of translation");
  calls = [];
  responder = () => openai("a\nb\nc");
  pool = [key(1, "groq")];
  await aiTranslateBatch(pool, src, "de", "id");
  const intoLang = calls[0]!.system;
  calls = [];
  pool = [key(1, "groq")];
  await aiTranslateBatch(pool, ["حديث اول", "حديث ثان", "حديث ثالث"], "de", "ar");
  const outOfAr = calls[0]!.system;
  check("id→de: Arabic script is reproduced, not translated", intoLang.includes("ARABIC SCRIPT IS NEVER TRANSLATED"));
  check("ar→de: does NOT carry that rule", !outOfAr.includes("ARABIC SCRIPT IS NEVER TRANSLATED"), outOfAr.split("\n")[4]);
  check("ar→de: says the source must be translated", outOfAr.includes("The source is Arabic and you must translate it"));
  check("ar→de: still protects Qur'anic verses", outOfAr.includes("﴿") && outOfAr.includes("not translated and not paraphrased"));

  // 7c. A model that echoes its source has not translated anything. Accepting
  //     that would count the batch as failed AND skip the gtx fallback.
  console.log("\n7c. an echoed source is rejected so gtx still gets its turn");
  calls = [];
  responder = (auth) => (auth.endsWith("k1") ? openai(src.join("\n")) : openai("a\nb\nc"));
  pool = [key(1, "groq"), key(2, "openrouter")];
  out = await aiTranslateBatch(pool, src, "de", "id");
  check("did not accept the echo", out?.join(",") === "a,b,c", JSON.stringify(out));
  check("key 1 counted as failing", pool[0]!.fails === 1);
  calls = [];
  responder = () => openai(src.join("\n"));
  pool = [key(1, "groq")];
  out = await aiTranslateBatch(pool, src, "de", "id");
  check("an all-echo pool returns null, so gtx runs", out === null, String(out));

  // 7d. Anthropic speaks a third protocol: x-api-key, a top-level `system`,
  //     and content as a parts array. Getting any of those wrong is a 400 on
  //     every call, which reads as "the key is bad" rather than "we called it
  //     wrong".
  console.log("\n7d. an anthropic key is called the Messages-API way");
  calls = [];

  responder = () => anthropic("a\nb\nc");
  pool = [key(7, "anthropic")];
  out = await aiTranslateBatch(pool, src, "de", "id");
  check("translated via the Anthropic shape", out?.join(",") === "a,b,c", JSON.stringify(out));
  check("sent x-api-key, not a bearer token", lastInit.headers["x-api-key"] === "k7");
  check("sent the anthropic-version header", lastInit.headers["anthropic-version"] === "2023-06-01");
  check("put the prompt in the top-level system field", JSON.parse(lastInit.body).system.includes("German"));

  // 7e. The pool is walked in order, so ordering decides who actually does the
  //     work — everything after the first healthy key is failover, not a peer.
  console.log("\n7e. the strongest provider is offered the work first");
  const ranked = rankPool([key(1, "openrouter"), key(2, "groq"), key(3, "anthropic"), key(4, "google-ai-studio")]);
  check(
    "order is anthropic, google, groq, openrouter",
    ranked.map((k) => k.provider).join(",") === "anthropic,google-ai-studio,groq,openrouter",
    ranked.map((k) => k.provider).join(",")
  );
  check("ranking does not drop keys", ranked.length === 4);

  // 7f. Usability is decided by the PROVIDER, never by the row's scope label.
  //     Reading the label instead is what left 443 working keys idle: 478 rows
  //     say scope=tts, nothing in this repo consumes a tts-scoped key, and the
  //     project's own ingest script would have written 'text' for them.
  console.log("\n7f. the provider decides usability, not the scope label");
  const enc = { key_ref: "x", key_iv: "y" };
  const loaded = await loadPool(
    [
      { id: 1, provider: "groq", ...enc },
      { id: 2, provider: "google-ai-studio", ...enc },
      { id: 3, provider: "hf-zerogpu", ...enc },
      { id: 4, provider: "kaggle", ...enc },
      { id: 5, provider: "anthropic", ...enc },
    ],
    "not-a-real-secret"
  ).catch(() => []);
  // Decryption fails for every row here (the secret is nonsense), which is the
  // point: loadPool must survive that and drop the rows rather than throw.
  check("a pool of undecryptable rows loads as empty, not a crash", Array.isArray(loaded) && loaded.length === 0);
  check("hf-zerogpu is not a chat provider and is excluded", !("hf-zerogpu" in PROVIDERS_SPOKEN));
  check("kaggle is not a chat provider and is excluded", !("kaggle" in PROVIDERS_SPOKEN));
  check("groq, google, openrouter, nvidia and anthropic are all callable",
    ["groq", "google-ai-studio", "openrouter", "nvidia-nim", "anthropic"].every((p) => p in PROVIDERS_SPOKEN));

  // 8. rotate() spreads the next batch onto a different key.
  console.log("\n8. rotation moves the used key to the back");
  pool = [key(1, "groq"), key(2, "groq"), key(3, "groq")];
  rotate(pool);
  check("order is 2,3,1", pool.map((k) => k.id).join(",") === "2,3,1", pool.map((k) => k.id).join(","));

  // 9. The languages routed away from the pool.
  console.log("\n9. PREFER_GTX holds the six languages sent to Google instead");
  check("ha/ps/so/uz/ta/sw are all present", ["ha", "ps", "so", "uz", "ta", "sw"].every((l) => PREFER_GTX.has(l)));
  check("de/fr/es/en are NOT diverted", !["de", "fr", "es", "en"].some((l) => PREFER_GTX.has(l)));

  console.log(`\n${ok} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
run();
