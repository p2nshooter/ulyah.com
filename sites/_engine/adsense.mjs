// The AdSense accounts a site declares (owner, 7 Nov 2026: "kode2 adsense ini di tumpuk aja di dusun yg rapih agar
// tidak saling bentrok dan tidak melanggar kebijakan adsense"). The list lives in one file at the root of the
// repository, adsense-stack.json, shared with apps/web, detektor-artikel and scripts/site-audit.mjs
// (docs/ADSENSE-BLUEPRINT.md §23).
//
//   primary  — the one account whose loader script runs on the page. Google ignores a second AdSense head tag on the
//              same page ("Only one AdSense head tag supported per page"), so there is never more than one loader.
//   accounts — every account the site authorises: the primary first, then the stack. Each gets its own
//              google-adsense-account meta tag and its own ads.txt line, so each account can verify the site.
//
// A domain the stack does not list (zufiq.de) keeps the single account in its site.json.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const STACK_FILE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "adsense-stack.json");
const CERT = "f08c47fec0942fa0"; // Google's certification authority id, the same for every AdSense publisher

let cache = null;
export function stack() {
  if (!cache) cache = JSON.parse(readFileSync(STACK_FILE, "utf8"));
  return cache;
}

/** { primary, accounts } for a domain, or null when it has no account at all. */
export function adsenseFor(domain, siteAdsense = "") {
  const s = stack();
  const primary = s.primary[domain];
  if (!primary) return siteAdsense ? { primary: siteAdsense, accounts: [siteAdsense], stacked: false } : null;
  return { primary, accounts: [...new Set([primary, ...s.stack])], stacked: true };
}

export const pubOf = (client) => client.replace(/^ca-/, "");
export const adsTxtLine = (client) => `google.com, ${pubOf(client)}, DIRECT, ${CERT}`;
export const adsTxt = (accounts) => `${accounts.map(adsTxtLine).join("\n")}\n`;
export const metaTag = (client) => `<meta name="google-adsense-account" content="${client}">`;
export const loaderTag = (client) =>
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`;

/** The text of sites/<domain>/ADSENSE.txt: the three snippets, as the owner pastes them into AdSense. */
export function snippetsText(domain, ad) {
  const lines = [
    `AdSense ${domain} — ${ad.accounts.length} akun (adsense-stack.json, docs/ADSENSE-BLUEPRINT.md §23)`,
    "",
    "Cuplikan adsense (di <head> setiap halaman — satu loader saja, akun utama)",
    `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ad.primary}"`,
    `     crossorigin="anonymous"></script>`,
    "",
    `Cuplikan ads.txt (https://${domain}/ads.txt)`,
    ...ad.accounts.map(adsTxtLine),
    "",
    "Tag meta (di <head> setiap halaman — satu per akun)",
    ...ad.accounts.map(metaTag),
    "",
  ];
  return lines.join("\n");
}
