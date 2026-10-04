#!/usr/bin/env node
// One-step backup of a site — everything a buyer needs, in one archive.
//
//   node sites/_engine/export.mjs dawo.es     → dawo.es-backup-YYYY-MM-DD.tar.gz
//
// The archive holds the engine, the site's folder (its content IS its
// database: there is no D1 behind these sites) and a README with the three
// commands that put it online on any Cloudflare account. Nothing in it points
// back at ulyah.com except the optional page-view beacon, which the README
// says how to remove.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ENGINE = dirname(fileURLToPath(import.meta.url));
const SITES = resolve(ENGINE, "..");
const domain = process.argv[2];
if (!domain || !existsSync(join(SITES, domain, "site.json"))) {
  console.error("usage: node sites/_engine/export.mjs <domain>   (a folder under sites/ with a site.json)");
  process.exit(2);
}

const day = new Date().toISOString().slice(0, 10);
const name = `${domain}-backup-${day}`;
const stage = mkdtempSync(join(tmpdir(), "site-export-"));
const root = join(stage, name);
cpSync(join(ENGINE), join(root, "_engine"), { recursive: true });
cpSync(join(SITES, domain), join(root, domain), {
  recursive: true,
  filter: (src) => !src.includes(`${domain}/dist`) && !src.includes("node_modules") && !src.includes(".wrangler"),
});
writeFileSync(
  join(root, "README.md"),
  `# ${domain} — complete site backup (${day})

Everything that makes ${domain} is in this folder:

- \`${domain}/content/articles/\` — every article (Markdown). This is the database.
- \`${domain}/content/pages/\` — about, contact, privacy, cookies, legal notice, terms, disclaimer.
- \`${domain}/theme/\` — the site's own HTML templates, CSS and JavaScript.
- \`${domain}/site.json\` — name, language, menus, categories and the AdSense publisher id.
- \`_engine/\` — the builder (Node 22, no dependencies).

## Put it online (any Cloudflare account)

\`\`\`bash
node _engine/check.mjs ${domain}          # build + AdSense readiness checks
npx wrangler login
npx wrangler deploy --config ${domain}/wrangler.jsonc
\`\`\`

Then add the domain in Cloudflare (Websites → Add a site), point its
nameservers there, and attach it to the Worker under Workers → ${domain.replace(/\./g, "-")} →
Settings → Domains & Routes.

## Hand-over checklist

- Change \`adsense\` in \`site.json\` to the new owner's publisher id (it feeds
  the meta tag, the loader and ads.txt) and rebuild.
- Change \`trackId\` or delete the one-line beacon in \`_engine/build.mjs\`
  (\`tail()\`), which counts page views in the previous owner's dashboard.
- Change the contact address in \`content/pages/contacto.md\` (or contact.md).
`
);
const archive = resolve(process.cwd(), `${name}.tar.gz`);
execFileSync("tar", ["-czf", archive, "-C", stage, name]);
rmSync(stage, { recursive: true, force: true });
console.log(`backup: ${archive}`);
