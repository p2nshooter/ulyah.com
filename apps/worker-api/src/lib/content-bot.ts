import type { Env } from "../env.js";
import { orchestrate } from "./orchestra.js";
import { extractJson } from "@ulyah/ai-engine";
import { countWords, readingMinutes, MIN_WORDS, MIN_WORDS_PER_LANG } from "./article-depth.js";

/**
 * Autonomous content bot — "biar g ada AI yg nganggur".
 *
 * The Orchestra key pool (controlled from the ulyah.com admin) writes an
 * original, on-theme article for one of the article sites and COMMITS it to
 * that site's repo, which auto-deploys — so publishing happens with no human
 * command ("jgn nunggu perintah post"). It runs from the scheduled tick, one
 * eligible site per tick, each site throttled so the flow is steady, not spam.
 *
 * Safety:
 *   - Completely inert unless GH_CONTENT_TOKEN (a GitHub token with
 *     contents:write on the repos) is set — the worker is always safe to ship.
 *   - Admin kill switch: KV key "contentbot:off" = "1" pauses everything.
 *   - It never edits code — it appends to a data file (content/auto-articles
 *     .json) each site already reads, so a malformed generation can never break
 *     a build. Generated articles are validated before commit.
 *   - Per-site throttle via KV timestamps; a site with no healthy key is simply
 *     skipped (orchestrate() returns ok:false), never blocking the others.
 */

type Schema = "article" | "blog" | "bilingual";

interface AutoSite {
  key: string; // internal id + KV throttle key
  repo: string; // "owner/repo"
  file: string; // path to the JSON data file in the repo
  schema: Schema;
  about: string; // what the site covers (for the prompt)
  categories: string[]; // allowed category (article/bilingual) or tag (blog) values
  author?: string; // byline for article/bilingual
  lang?: string; // second language name for bilingual (e.g. "Hindi")
}

// The sites the bot writes for. axto.io is intentionally omitted until its repo
// is attached to the pipeline. Keep `categories`/`schema` in sync with each
// repo's content types.
const SITES: AutoSite[] = [
  {
    key: "jai",
    repo: "p2nshooter/jai",
    file: "src/content/auto-articles.json",
    schema: "article",
    about: "jai.lat, an educational personal-finance magazine (investing, saving, income, money psychology, retirement) — jurisdiction-neutral, no tips, no get-rich, evergreen explainers only",
    categories: ["investing", "saving", "income", "mindset", "retirement"],
    author: "The Jai Desk",
  },
  {
    key: "lie",
    repo: "p2nshooter/lie",
    file: "src/content/auto-articles.json",
    schema: "article",
    about: "lie.skin, an evidence-informed skincare magazine — educational only, never medical advice, gentle and honest",
    categories: ["ingredients", "routine", "concerns", "sun", "myths"],
    author: "The Lie.skin Desk",
  },
  {
    key: "axtodev",
    repo: "p2nshooter/axtodev",
    file: "src/content/auto-articles.json",
    schema: "article",
    about: "axto.dev, a developer magazine of plain-English programming and infrastructure explainers",
    categories: ["languages", "web", "tools", "devops", "ai"],
    author: "The AXTO.dev Desk",
  },
  {
    key: "xaa",
    repo: "p2nshooter/xaa",
    file: "src/content/auto-articles.json",
    schema: "article",
    about: "xaa.es, an independent football magazine focused on the 2026 World Cup — evergreen explainers, previews and history; NEVER fabricate match results or scores",
    categories: ["world-cup-2026", "teams", "players", "tactics", "history", "culture"],
    author: "The Xaa Desk",
  },
  {
    key: "axto-us",
    repo: "p2nshooter/axto.us",
    file: "src/content/auto-blog-posts.json",
    schema: "blog",
    about: "axto.us, a blog for parents and teachers about children's reading, literacy and learning",
    categories: ["Parents", "Learning", "Schools", "Reading"],
  },
  {
    key: "oldco",
    repo: "p2nshooter/oldco.in",
    file: "src/content/auto-articles.json",
    schema: "bilingual",
    about: "oldco.in, a bilingual (Hindi + English) magazine on Indian numismatics (old coins) — 100% original, honest about value, scam-aware, legally careful about antiquities",
    categories: ["itihas", "british-india", "republic-india", "collecting", "market"],
    lang: "Hindi",
  },
  {
    key: "profity",
    repo: "p2nshooter/profity.in",
    file: "src/content/auto-articles.json",
    schema: "bilingual",
    about: "profity.in, a bilingual (Hindi + English) personal-finance magazine for India — educational, no tips, scam-aware",
    categories: ["nivesh", "bachat", "tax", "bima", "credit", "digital"],
    lang: "Hindi",
  },
];

/**
 * How long a site waits between articles.
 *
 * Back to three hours. I had cut this to forty-five minutes to fill axto.dev
 * inside a week, and the owner's answer was "jgn andelin mesin, lu sendiri yg
 * ngetik" — do not lean on the machine, write it yourself. The speed-up existed
 * precisely to avoid writing by hand, so it goes.
 *
 * The bot still runs. It is a steady trickle on seven sites rather than the way
 * a library gets built, which is what it was for before I pressed it into
 * service as a substitute for the work.
 */
const THROTTLE_MS = 3 * 60 * 60 * 1000;
const GH_API = "https://api.github.com";

/**
 * How many times a short draft may be continued before it is abandoned.
 *
 * Two is deliberate. One is often not enough — a draft that lands at 1,100
 * words needs a substantial addition, and models undershoot a stated target.
 * Beyond two the returns fall off and the additions start circling material
 * the article already covers, which is worse than publishing nothing.
 */
const MAX_CONTINUATIONS = 2;

const b64encodeUtf8 = (s: string): string => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const b64decodeUtf8 = (b64: string): string => {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

const slugify = (t: string): string =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 70);

const ghHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "ulyah-content-bot",
  "X-GitHub-Api-Version": "2022-11-28",
});

interface GhFile {
  content: unknown[];
  sha: string | null;
}

/** Read the repo's auto-articles JSON (returns [] + null sha if it doesn't exist). */
async function readAutoFile(env: Env, site: AutoSite): Promise<GhFile | null> {
  const url = `${GH_API}/repos/${site.repo}/contents/${site.file}`;
  const res = await fetch(url, { headers: ghHeaders(env.GH_CONTENT_TOKEN!) }).catch(() => null);
  if (!res) return null;
  if (res.status === 404) return { content: [], sha: null };
  if (!res.ok) return null;
  const j = (await res.json()) as { content?: string; sha?: string };
  try {
    const parsed = JSON.parse(b64decodeUtf8(j.content ?? ""));
    return { content: Array.isArray(parsed) ? parsed : [], sha: j.sha ?? null };
  } catch {
    return { content: [], sha: j.sha ?? null };
  }
}

/** Build the strict-JSON generation prompt for one site's schema. */
function buildPrompt(site: AutoSite, existingTitles: string[]): string {
  // Every title the site already has, not the last forty.
  //
  // Forty was fine at eight articles a day. At thirty-two it is not: the bot
  // would be shown a window narrower than a single day's output and would
  // start circling the same handful of topics, which on a site already refused
  // for low-value content is the worst possible failure. Titles are short, so
  // even a few hundred cost little in the prompt — and the cost of a
  // near-duplicate article is far higher than the cost of listing them.
  const avoid = existingTitles.join(" | ") || "(none yet)";
  const cats = site.categories.map((c) => `"${c}"`).join(", ");
  // LENGTH IS STATED, NOT SUGGESTED. Asked for "substantial", the model wrote
  // a median of 429 words and called it a 7-minute read, 32 times, and AdSense
  // came back with "Low value content". Anything under MIN_WORDS is now thrown
  // away by normalise(), so the prompt says the number and says what to fill it
  // with — depth, not padding. Nothing here loosens the honesty rules: an
  // invented benchmark would be worse than a short article.
  const common =
    `You are the editor of ${site.about}.\n` +
    `Write ONE brand-new, original, factual, evergreen article a real editor would be proud to publish.\n` +
    `LENGTH: at least ${MIN_WORDS} words of body prose. Articles below this are rejected and not published.\n` +
    `Reach that length with substance, never padding: explain the mechanism behind each claim, walk through a ` +
    `concrete worked example, name the trade-off, and say plainly when the advice does NOT apply. ` +
    `Assume the reader has already read the obvious introductory take and wants the part that is usually left out.\n` +
    `Rules: 100% original prose; do NOT fabricate statistics, quotes, prices or news; nothing illegal, defamatory, or unsafe. ` +
    `Do NOT repeat these already-published titles: ${avoid}.\n` +
    `Category MUST be exactly one of: [${cats}].\n` +
    `Output STRICT JSON ONLY — no markdown fences, no commentary before or after.\n`;

  if (site.schema === "blog") {
    return (
      common +
      `JSON shape: {"slug": "kebab-case-unique", "title": "...", "description": "one-sentence summary", ` +
      `"tag": one of [${cats}], ` +
      `"body": ["intro paragraph", "## Section heading", "paragraph", "## Another heading", "paragraph", ...]} ` +
      `where any array item beginning with "## " is a section heading. 22-30 body items. ` +
      `Reading time is measured from the text, so do not supply it.`
    );
  }
  if (site.schema === "bilingual") {
    return (
      common +
      `Write it in BOTH ${site.lang} and English, fully mirrored. ` +
      `JSON shape: {"slug": "kebab-case-unique", "category": one of [${cats}], ` +
      `"titleHi": "...", "titleEn": "...", "excerptHi": "...", "excerptEn": "...", ` +
      `"sections": [{"hHi": "", "hEn": "", "pHi": ["para", "para"], "pEn": ["para", "para"]}, ` +
      `{"hHi": "${site.lang} heading", "hEn": "English heading", "pHi": [...], "pEn": [...]}]} ` +
      `First section uses empty headings (the intro). 9-11 sections, 3-4 paragraphs each per language, ` +
      `each language reaching at least ${MIN_WORDS_PER_LANG} words on its own. Reading time is measured, so do not supply it.`
    );
  }
  // "article"
  return (
    common +
    `JSON shape: {"slug": "kebab-case-unique", "category": one of [${cats}], "title": "...", ` +
    `"excerpt": "one-sentence hook", "author": "${site.author}", ` +
    `"sections": [{"h": "", "p": ["intro para", "intro para"]}, {"h": "Section heading", "p": ["para", "para"]}]} ` +
    `First section uses h:"" (the intro). 9-11 sections, 3-4 substantial paragraphs each, ` +
    `every paragraph a full one of 90-130 words. ` +
    `Reading time is measured from the text, so do not supply it.`
  );
}

/**
 * Ask for the sections a short draft is missing.
 *
 * The floor moved from 900 words to 1,800 and the bot went silent for eleven
 * days, because one call was being asked to clear a bar it could not reach and
 * the result was thrown away whole. A short draft is not a bad draft — it is an
 * unfinished one — so it gets continued rather than discarded. The existing
 * headings go into the prompt so the continuation extends the piece instead of
 * restating it.
 */
function buildContinuePrompt(site: AutoSite, article: any, deficit: number): string {
  const headings: string[] =
    site.schema === "blog"
      ? (article.body as string[]).filter((s) => s.startsWith("## ")).map((s) => s.slice(3))
      : (article.sections as any[]).map((s) => String(s.hEn ?? s.h ?? "")).filter(Boolean);
  const title = String(article.title ?? article.titleEn ?? "");
  const common =
    `You are continuing an article you already wrote for ${site.about}.\n` +
    `TITLE: ${title}\n` +
    `SECTIONS ALREADY WRITTEN: ${headings.join(" | ") || "(intro only)"}\n` +
    `Write ONLY the additional sections needed to finish it — at least ${deficit} more words. ` +
    `Do NOT restate, summarise or rewrite anything above; go further into the subject: the mechanism ` +
    `behind a claim, a worked example, the trade-off, the case where it does not apply, what a reader ` +
    `should do differently on Monday morning.\n` +
    `Same rules as before: 100% original prose; no invented statistics, quotes, prices or news.\n` +
    `Output STRICT JSON ONLY — no markdown fences, no commentary.\n`;

  if (site.schema === "blog") {
    return (
      common +
      `JSON shape: {"body": ["## New heading", "paragraph", "## Another heading", "paragraph", ...]} ` +
      `— continuation items only, each heading prefixed "## ".`
    );
  }
  if (site.schema === "bilingual") {
    return (
      common +
      `Write both ${site.lang} and English, fully mirrored, each language carrying at least ${deficit} more words. ` +
      `JSON shape: {"sections": [{"hHi": "${site.lang} heading", "hEn": "English heading", ` +
      `"pHi": ["para", "para"], "pEn": ["para", "para"]}, ...]} — new sections only.`
    );
  }
  return (
    common +
    `JSON shape: {"sections": [{"h": "Section heading", "p": ["para", "para"]}, ...]} — new sections only, ` +
    `every paragraph a full one of 90-130 words.`
  );
}

/** How long the piece is, measured against the bar that applies to its schema. */
function articleLength(site: AutoSite, article: any): { words: number; need: number } {
  if (site.schema === "blog") {
    return { words: countWords(article.body), need: MIN_WORDS };
  }
  if (site.schema === "bilingual") {
    const hi = countWords(article.sections.flatMap((s: any) => [s.hHi, ...s.pHi]));
    const en = countWords(article.sections.flatMap((s: any) => [s.hEn, ...s.pEn]));
    // The shorter language is the one that decides — a full article in one and
    // a sketch in the other is a thin page for half the readers.
    return { words: Math.min(hi, en), need: MIN_WORDS_PER_LANG };
  }
  return { words: countWords(article.sections.flatMap((s: any) => [s.h, ...s.p])), need: MIN_WORDS };
}

/** Graft a continuation onto the raw draft. Returns false if it carried nothing usable. */
function appendContinuation(site: AutoSite, raw: any, extra: any): boolean {
  if (!extra || typeof extra !== "object") return false;
  if (site.schema === "blog") {
    const add = Array.isArray(extra.body) ? extra.body.map((s: unknown) => String(s)).filter(Boolean) : [];
    if (!add.length) return false;
    raw.body = [...(Array.isArray(raw.body) ? raw.body : []), ...add];
    return true;
  }
  const add = Array.isArray(extra.sections) ? extra.sections : [];
  const usable = add.filter((s: any) =>
    site.schema === "bilingual" ? Array.isArray(s?.pHi) && Array.isArray(s?.pEn) : Array.isArray(s?.p)
  );
  if (!usable.length) return false;
  raw.sections = [...(Array.isArray(raw.sections) ? raw.sections : []), ...usable];
  return true;
}

/**
 * Validate + normalise a generated article. Returns null if unusable.
 *
 * `lenient` skips only the length gate, so a draft can be measured and
 * continued before it is judged. Everything else — shape, category, slug —
 * is checked exactly the same way in both modes.
 */
function normalise(site: AutoSite, raw: any, existingSlugs: Set<string>, lenient = false): any | null {
  if (!raw || typeof raw !== "object") return null;
  const today = new Date().toISOString().slice(0, 10);
  const okCat = (c: unknown) => typeof c === "string" && site.categories.includes(c);
  const title = String(raw.title ?? raw.titleEn ?? "").trim();
  let slug = slugify(String(raw.slug ?? title));
  if (!slug) return null;
  if (existingSlugs.has(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  if (site.schema === "blog") {
    if (!title || !Array.isArray(raw.body) || raw.body.length < 4) return null;
    const tag = okCat(raw.tag) ? raw.tag : site.categories[0];
    const body = raw.body.map((s: unknown) => String(s)).filter(Boolean);
    const words = countWords(body);
    if (!lenient && words < MIN_WORDS) return null;
    return {
      slug,
      title,
      description: String(raw.description ?? "").slice(0, 300),
      date: today,
      tag,
      minutes: readingMinutes(words),
      body,
    };
  }
  if (site.schema === "bilingual") {
    if (!raw.titleHi || !raw.titleEn || !Array.isArray(raw.sections) || raw.sections.length < 2) return null;
    const sections = raw.sections
      .filter((s: any) => Array.isArray(s?.pHi) && Array.isArray(s?.pEn))
      .map((s: any) => ({
        hHi: String(s.hHi ?? ""),
        hEn: String(s.hEn ?? ""),
        pHi: s.pHi.map((p: unknown) => String(p)).filter(Boolean),
        pEn: s.pEn.map((p: unknown) => String(p)).filter(Boolean),
      }));
    if (sections.length < 2) return null;
    // Both halves have to stand on their own — a full article in one language
    // and a sketch in the other is a thin page for half the readers.
    const wordsHi = countWords(sections.flatMap((s: any) => [s.hHi, ...s.pHi]));
    const wordsEn = countWords(sections.flatMap((s: any) => [s.hEn, ...s.pEn]));
    if (!lenient && (wordsHi < MIN_WORDS_PER_LANG || wordsEn < MIN_WORDS_PER_LANG)) return null;
    return {
      slug,
      category: okCat(raw.category) ? raw.category : site.categories[0],
      titleHi: String(raw.titleHi),
      titleEn: String(raw.titleEn),
      excerptHi: String(raw.excerptHi ?? ""),
      excerptEn: String(raw.excerptEn ?? ""),
      date: today,
      // A reader reads one language, not both, so the time is for one pass.
      minutes: readingMinutes(Math.max(wordsHi, wordsEn)),
      sections,
    };
  }
  // article
  if (!title || !Array.isArray(raw.sections) || raw.sections.length < 2) return null;
  const sections = raw.sections
    .filter((s: any) => Array.isArray(s?.p))
    .map((s: any) => ({ h: String(s.h ?? ""), p: s.p.map((p: unknown) => String(p)).filter(Boolean) }));
  if (sections.length < 2) return null;
  const words = countWords(sections.flatMap((s: any) => [s.h, ...s.p]));
  if (!lenient && words < MIN_WORDS) return null;
  return {
    slug,
    category: okCat(raw.category) ? raw.category : site.categories[0],
    title,
    excerpt: String(raw.excerpt ?? "").slice(0, 300),
    date: today,
    minutes: readingMinutes(words),
    author: site.author ?? "Editorial Desk",
    sections,
  };
}

/** Generate + commit one article for one site. Returns a short status string. */
async function writeForSite(env: Env, site: AutoSite): Promise<string> {
  const existing = await readAutoFile(env, site);
  if (!existing) return `${site.key}: could not read repo (token/permission?)`;
  const existingSlugs = new Set(existing.content.map((a: any) => String(a?.slug)));
  const existingTitles = existing.content.map((a: any) => String(a?.title ?? a?.titleEn ?? "")).filter(Boolean);

  const r = await orchestrate(env, {
    capability: "content",
    prompt: buildPrompt(site, existingTitles),
    // 1,800 words of prose is roughly 2,400 tokens before the JSON scaffolding,
    // and a bilingual piece carries two of them. The old ceiling of 2,200 made
    // the floor unreachable: the reply was cut off mid-article, normalise()
    // discarded it for being short, and the bot published nothing at all for
    // eleven days. The ceiling has to sit above the bar it is measured against.
    maxTokens: site.schema === "bilingual" ? 8000 : 6000,
    timeoutMs: 60_000,
  });
  if (!r.ok || !r.text) return `${site.key}: no healthy key / generation failed`;

  let parsed: any;
  try {
    parsed = extractJson(r.text);
  } catch {
    return `${site.key}: model output was not valid JSON`;
  }
  // Measure first, judge last. A draft that is well-formed but short gets
  // continued; only a draft that is still short after the continuations is
  // thrown away, which is what the length floor was always meant to catch.
  let article = normalise(site, parsed, existingSlugs, true);
  if (!article) return `${site.key}: generated article failed validation`;
  // Pin the slug so the continuation rounds cannot re-roll its collision suffix.
  parsed.slug = article.slug;

  for (let round = 0; round < MAX_CONTINUATIONS; round += 1) {
    const { words, need } = articleLength(site, article);
    if (words >= need) break;
    const cont = await orchestrate(env, {
      capability: "content",
      prompt: buildContinuePrompt(site, article, need - words),
      maxTokens: site.schema === "bilingual" ? 6000 : 4000,
      timeoutMs: 60_000,
    });
    if (!cont.ok || !cont.text) break;
    let extra: any;
    try {
      extra = extractJson(cont.text);
    } catch {
      break;
    }
    const before = article;
    if (!appendContinuation(site, parsed, extra)) break;
    const grown = normalise(site, parsed, existingSlugs, true);
    // A continuation that broke the shape, or added nothing, ends the loop
    // rather than burning another key on the same ground.
    if (!grown || articleLength(site, grown).words <= articleLength(site, before).words) break;
    article = grown;
  }

  const measured = articleLength(site, article);
  if (measured.words < measured.need) {
    return `${site.key}: still ${measured.need - measured.words} words short after ${MAX_CONTINUATIONS} continuations — not published`;
  }
  // Re-normalise strictly, so the committed article goes through exactly the
  // same gate as before this change.
  article = normalise(site, parsed, existingSlugs);
  if (!article) return `${site.key}: generated article failed validation`;

  const next = [...existing.content, article];
  const body = {
    message: `content: auto-published "${article.title ?? article.titleEn}" (Orchestra)`,
    content: b64encodeUtf8(JSON.stringify(next, null, 2) + "\n"),
    ...(existing.sha ? { sha: existing.sha } : {}),
  };
  const put = await fetch(`${GH_API}/repos/${site.repo}/contents/${site.file}`, {
    method: "PUT",
    headers: { ...ghHeaders(env.GH_CONTENT_TOKEN!), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!put || !put.ok) return `${site.key}: commit failed (${put ? put.status : "network"})`;
  return `${site.key}: published "${article.title ?? article.titleEn}" via ${r.servedBy}`;
}

/**
 * Scheduled entry point — call from the worker's scheduled tick. Picks the one
 * site most overdue for a fresh article (respecting the per-site throttle) and
 * publishes to it. One site per tick keeps the flow steady and the key pool
 * unhurried.
 */
export async function contentBotTick(env: Env): Promise<void> {
  if (!env.GH_CONTENT_TOKEN) return; // inert until a token is configured
  const off = await env.CACHE_KV.get("contentbot:off").catch(() => null);
  if (off === "1") return; // admin kill switch

  const now = Date.now();
  let due: AutoSite | null = null;
  let oldest = Infinity;
  for (const site of SITES) {
    const lastRaw = await env.CACHE_KV.get(`contentbot:last:${site.key}`).catch(() => null);
    const last = lastRaw ? Number(lastRaw) : 0;
    if (now - last < THROTTLE_MS) continue; // still within its cooldown
    if (last < oldest) {
      oldest = last;
      due = site;
    }
  }
  if (!due) return; // every site posted recently — nothing to do this tick

  // Reserve the slot BEFORE generating, so a slow generation can't cause two
  // ticks to double-post the same site.
  await env.CACHE_KV.put(`contentbot:last:${due.key}`, String(now), { expirationTtl: 60 * 60 * 24 * 30 }).catch(() => {});
  const status = await writeForSite(env, due).catch((e) => `${due!.key}: error ${String(e).slice(0, 80)}`);
  await env.CACHE_KV.put("contentbot:lastrun", `${new Date().toISOString()} — ${status}`, { expirationTtl: 60 * 60 * 24 * 7 }).catch(() => {});
  console.log(`content-bot: ${status}`);
}
