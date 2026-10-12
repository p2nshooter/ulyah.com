// Samples the content pages of the Islamic portals (one Next.js app, several
// tenants) and reports what a crawler reads on them: words of real text, the
// language that text is in, title / description / h1 / canonical / robots.
// The goal is the owner's "kontrol artikel" (12 Oct 2026): find thin pages,
// pages in the wrong language and pages hidden from search, section by
// section, without reading the whole database.
//
// Read-only and deliberately small: a handful of pages per sitemap file, one
// request at a time, so the D1 database behind the pages sees a few hundred
// row reads at most. Run from GitHub Actions, where the sites are reachable:
//
//   node scripts/content-audit.mjs ulyah.com=id 1fr.fr=fr tilawa.de=de xad.es=en
//   PER=8 ONLY=kitab,books node scripts/content-audit.mjs xad.es=en
const PER = Number(process.env.PER || 6);
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 content-audit";
const THIN = 300;
// SCHEME=http lets the script be tried against a local server first.
const SCHEME = process.env.SCHEME || "https";

// Small stop-word lists: enough to tell which language a page is written in.
const STOP = {
  id: ["yang", "dan", "di", "dengan", "untuk", "ini", "itu", "dari", "tidak", "dalam", "akan", "pada", "juga", "adalah", "kepada", "beliau", "mereka", "kami"],
  fr: ["le", "la", "les", "des", "et", "est", "une", "dans", "que", "qui", "pour", "pas", "sur", "par", "au", "avec", "il", "elle"],
  de: ["der", "die", "das", "und", "ist", "nicht", "mit", "den", "ein", "eine", "zu", "auf", "sich", "dem", "auch", "es", "von", "sie"],
  es: ["el", "la", "los", "las", "y", "que", "en", "es", "por", "con", "para", "una", "del", "su", "se", "lo", "como", "pero"],
  en: ["the", "and", "of", "to", "is", "in", "that", "it", "was", "for", "with", "his", "he", "they", "this", "be", "on", "are"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xml" }, redirect: "follow" });
    return { status: res.status, url: res.url, headers: res.headers, text: await res.text() };
  } catch (e) {
    return { status: 0, url, headers: new Headers(), text: "", error: String(e) };
  }
}

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
const attr = (html, re) => (html.match(re) || [])[1] || "";
const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

function mainText(html) {
  // Prefer <main>, then <article>; drop chrome, scripts and the Next.js payload.
  let body = (html.match(/<main[\s>][\s\S]*<\/main>/i) || html.match(/<article[\s>][\s\S]*<\/article>/i) || html.match(/<body[\s>][\s\S]*<\/body>/i) || [html])[0];
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|header|footer|aside|svg|form|button)[\s>][\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decode(body).replace(/\s+/g, " ").trim();
}

function language(text) {
  const words = text.toLowerCase().match(/[a-zà-öø-ÿäöüßñçéèêëîïôûùœ]+/g) || [];
  const counts = {};
  for (const [l, list] of Object.entries(STOP)) {
    const set = new Set(list);
    counts[l] = words.filter((w) => set.has(w)).length;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return { lang: best[1] >= 5 ? best[0] : "?", latin: words.length };
}

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pick = (list, n) => {
  if (list.length <= n) return list;
  const out = [];
  for (let i = 0; i < n; i++) out.push(list[Math.round((i * (list.length - 1)) / (n - 1))]);
  return [...new Set(out)];
};

const report = [];
for (const arg of process.argv.slice(2)) {
  const [domain, want] = arg.split("=");
  console.log(`\n===== ${domain} (expected language: ${want})`);
  const index = await get(`${SCHEME}://${domain}/sitemap.xml`);
  const first = locs(index.text);
  const isIndex = /<sitemapindex/i.test(index.text);
  const files = isIndex ? first : [`${SCHEME}://${domain}/sitemap.xml`];
  console.log(`sitemap.xml ${index.status} · ${isIndex ? "index of " + files.length + " files" : first.length + " urls"}`);
  const titles = new Map();
  const only = (process.env.ONLY || "").split(",").filter(Boolean);
  for (const file of files) {
    if (only.length && !only.some((o) => file.includes(o))) continue;
    const sm = isIndex ? await get(file) : index;
    const urls = locs(sm.text);
    const name = file.replace(/^https?:\/\/[^/]+/, "");
    const rows = [];
    for (const url of pick(urls, PER)) {
      let r = await get(url);
      // A 1102 ("Worker exceeded resource limits") may be one unlucky isolate
      // or a page that can never render: ask twice more and record which.
      let tries = 1;
      while (r.status >= 500 && tries < 3) {
        await sleep(3000);
        r = await get(url);
        tries++;
      }
      const html = r.text;
      const text = mainText(html);
      const { lang, latin } = language(text);
      const arabic = (text.match(/[؀-ۿ]+/g) || []).length;
      const row = {
        url: url.replace(/^https?:\/\/[^/]+/, ""),
        status: r.status,
        finalPath: r.url.replace(/^https?:\/\/[^/]+/, ""),
        htmlLang: attr(html, /<html[^>]*\slang="([^"]+)"/i),
        title: decode(attr(html, /<title[^>]*>([^<]*)<\/title>/i)).trim(),
        desc: decode(attr(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i)),
        h1: decode((attr(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(),
        canonical: attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i),
        robots: attr(html, /<meta[^>]+name="robots"[^>]+content="([^"]+)"/i) + (r.headers.get("x-robots-tag") ? ` | header:${r.headers.get("x-robots-tag")}` : ""),
        words: latin,
        arabic,
        lang,
        tries,
      };
      rows.push(row);
      if (row.title) titles.set(row.title, (titles.get(row.title) || 0) + 1);
      await sleep(400);
    }
    const ok = rows.filter((x) => x.status === 200);
    const thin = ok.filter((x) => x.words < THIN);
    const wrong = ok.filter((x) => x.lang !== want && x.words >= THIN);
    const hidden = ok.filter((x) => /noindex/i.test(x.robots));
    const noDesc = ok.filter((x) => x.desc.length < 50);
    console.log(`\n-- ${name}: ${urls.length} urls, sampled ${rows.length}; median ${median(ok.map((x) => x.words))} words; thin(<${THIN}) ${thin.length}; wrong language ${wrong.length}; noindex ${hidden.length}; short/missing description ${noDesc.length}`);
    for (const x of rows) {
      console.log(`   ${String(x.status).padEnd(3)}${x.tries > 1 ? "(" + x.tries + " tries)" : ""} ${String(x.words).padStart(5)}w ar${String(x.arabic).padStart(4)} ${x.lang.padEnd(2)} lang=${x.htmlLang || "-"} ${x.url}${x.finalPath !== x.url ? " -> " + x.finalPath : ""}`);
      console.log(`        title(${x.title.length}) ${x.title.slice(0, 110)}`);
      console.log(`        desc(${x.desc.length}) ${x.desc.slice(0, 110)}`);
      console.log(`        h1 ${x.h1.slice(0, 100) || "(none)"} · canonical ${x.canonical ? (x.canonical.includes(domain) ? "ok" : x.canonical) : "(none)"}${x.robots ? " · robots " + x.robots : ""}`);
    }
    report.push({ domain, file: name, urls: urls.length, sampled: rows.length, median: median(ok.map((x) => x.words)), thin: thin.length, wrong: wrong.length, noindex: hidden.length, noDesc: noDesc.length, errors: rows.length - ok.length });
  }
  const dup = [...titles].filter(([, n]) => n > 1);
  if (dup.length) console.log(`\nduplicate titles in the sample: ${dup.map(([t, n]) => `${n}× ${t}`).join(" | ")}`);
}

console.log("\n===== Summary (per sitemap file)");
console.log("domain       file                                   urls  sampled median thin wrongLang noindex noDesc errors");
for (const r of report) {
  console.log(`${r.domain.padEnd(12)} ${r.file.padEnd(38)} ${String(r.urls).padStart(5)} ${String(r.sampled).padStart(7)} ${String(r.median).padStart(6)} ${String(r.thin).padStart(4)} ${String(r.wrong).padStart(9)} ${String(r.noindex).padStart(7)} ${String(r.noDesc).padStart(6)} ${String(r.errors).padStart(6)}`);
}
