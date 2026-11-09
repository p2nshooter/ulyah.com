#!/usr/bin/env node
// What is still untranslated in the English edition of a site: every piece of text the theme writes itself (menus,
// labels, buttons, footers, aria-labels, titles) that reads the same on an English page as on the original pages.
// A helper for writing theme/en.json (docs/ADSENSE-BLUEPRINT.md §29); check.mjs holds the gate.
//
//   node sites/_engine/i18n-todo.mjs xko.es
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { build } from "./build.mjs";

const domain = process.argv[2];
const { out, english } = await build(domain, { quiet: true });
if (!english) {
  console.error(`${domain} has no "en" block in site.json`);
  process.exit(2);
}
const files = [];
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) files.push(p);
  }
};
walk(out);
const pieces = (html) => {
  const body = html
    .replace(/<!--engine-content-->[\s\S]*?<!--\/engine-content-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, " ");
  const out = [];
  const head = (body.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  if (head) out.push(`<title> ${head}`);
  for (const m of body.matchAll(/<meta name="description" content="([^"]*)"/g)) out.push(`<meta> ${m[1]}`);
  const b = body.replace(/<head\b[\s\S]*?<\/head>/i, " ");
  for (const m of b.matchAll(/\b(aria-label|title|alt|placeholder)="([^"]*)"/g)) out.push(m[2]);
  for (const t of b.replace(/<[^>]+>/g, "\n").split("\n")) if (/\p{L}{2}/u.test(t)) out.push(t.trim());
  return out;
};
const original = new Set();
const english_ = new Map();
for (const f of files) {
  const rel = f.slice(out.length);
  const html = readFileSync(f, "utf8");
  for (const p of pieces(html)) {
    if (rel.startsWith("/en/")) english_.set(p, [...(english_.get(p) || []), rel]);
    else original.add(p);
  }
}
const todo = [...english_].filter(([p]) => original.has(p) || original.has(p.replace(/^<(title|meta)> /, "")) || /\b(de|la|el|los|las|und|der|die|das|mit|für|para|con|por)\b/.test(p));
for (const [p, where] of todo.sort((a, b) => b[1].length - a[1].length)) console.log(`${String(where.length).padStart(4)}×  ${p.slice(0, 160)}`);
console.log(`\n${todo.length} piece(s) to look at`);
