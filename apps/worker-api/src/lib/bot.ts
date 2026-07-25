/**
 * Tell a reader from a robot, server-side, from the User-Agent.
 *
 * This exists because the admin portal's visitor numbers were not real. On the
 * live database, 984 of 1,015 "devices" seen in 24 hours had produced exactly
 * one pageview each, and 967 of those came from one country's datacenters —
 * crawlers, each arriving with an empty localStorage and therefore a brand-new
 * device id. Counting them as visitors is what made the totals look invented.
 *
 * Deliberately conservative and deliberately simple: a User-Agent match, no
 * fingerprinting, no IP lists, no paid bot service. It will not catch a crawler
 * that lies about its User-Agent, and it is not meant to — the point is that
 * the honest majority of automated traffic (search engines, SEO scanners,
 * preview fetchers, headless browsers, HTTP libraries) stops being counted as
 * people. What it catches is recorded per row, so the admin can always see the
 * split rather than take a filtered number on faith.
 */

const BOT_RE =
  /(bot|crawl|spider|slurp|scrape|fetch|monitor|check|probe|scan|preview|archiver|wget|curl|python-requests|python-httpx|libwww|okhttp|java\/|go-http|axios|node-fetch|got \(|headless|phantomjs|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|pingdom|uptime|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|dataforseo|serpstat|screaming frog|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|embedly|quora link|redditbot|applebot|amazonbot|gptbot|claudebot|anthropic|ccbot|perplexity|google-extended|oai-searchbot|chatgpt-user)/i;

/**
 * Browsers all announce "Mozilla/5.0". A User-Agent that does not, or that is
 * missing entirely, is not a person browsing — nothing legitimate reaches these
 * beacons without one, because the beacon only runs inside a rendered page.
 */
export function isBotUA(ua: string | undefined | null): boolean {
  if (!ua) return true;
  const s = ua.trim();
  if (s.length < 12) return true;
  if (BOT_RE.test(s)) return true;
  if (!/mozilla\/5\.0/i.test(s)) return true;
  return false;
}

/** The referring site, host only — enough to see where readers arrive from,
 *  without keeping the full URL anyone came in on. */
export function refererHost(referer: string | undefined | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.replace(/^www\./, "").slice(0, 80) || null;
  } catch {
    return null;
  }
}
