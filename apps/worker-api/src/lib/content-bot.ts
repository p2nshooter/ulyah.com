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
 * Three hours meant eight a day. axto.dev needs about a hundred pieces at the
 * new length before its library stops being mostly thin, and at eight a day
 * that is a fortnight — with an AdSense review waiting on it. Forty-five
 * minutes gives roughly thirty-two a day per site, which brings it inside a
 * week.
 *
 * Not lower than that, deliberately. Each article is one Orchestra call and a
 * commit that triggers a deploy, so the floor is set by how fast a site can
 * sensibly rebuild, not by how fast text can be produced. And a site that
 * gains a hundred articles in a day looks exactly like what it would be.
 */
const THROTTLE_MS = 45 * 60 * 1000;
const GH_API = "https://api.github.com";

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

/** Validate + normalise a generated article. Returns null if unusable. */
function normalise(site: AutoSite, raw: any, existingSlugs: Set<string>): any | null {
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
    if (words < MIN_WORDS) return null;
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
    if (wordsHi < MIN_WORDS_PER_LANG || wordsEn < MIN_WORDS_PER_LANG) return null;
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
  if (words < MIN_WORDS) return null;
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
    maxTokens: 2200,
    timeoutMs: 45_000,
  });
  if (!r.ok || !r.text) return `${site.key}: no healthy key / generation failed`;

  let parsed: any;
  try {
    parsed = extractJson(r.text);
  } catch {
    return `${site.key}: model output was not valid JSON`;
  }
  const article = normalise(site, parsed, existingSlugs);
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
