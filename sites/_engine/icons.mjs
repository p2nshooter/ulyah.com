#!/usr/bin/env node
// The raster icons search engines and phones ask for, drawn from the site's own
// favicon.svg and og.svg (owner, 27 Oct 2026: "perbaiki dulu seluruh SEO websitenya
// … file2 lain yg d butuhkan"). Google Search, Android and the manifest take an SVG
// icon, but iOS (apple-touch-icon), Facebook, X and LinkedIn (og:image) and older
// crawlers (/favicon.ico) only take raster images.
//
//   node sites/_engine/icons.mjs [<domain> …]      (all sites when none is named)
//
// Writes into sites/<domain>/public/, which build.mjs copies as it is:
//   apple-touch-icon.png  180×180, the icon on the theme colour (iOS fills transparency with black)
//   icon-192.png          192×192 } for site.webmanifest
//   icon-512.png          512×512 }
//   favicon.ico           48×48 PNG inside an ICO container
//   og.png                1200×630, the default share image
// Needs Playwright (a dev tool, never a build dependency): run it when a favicon.svg or
// og.svg changes and commit the PNGs. build.mjs links each file only when it exists.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITES = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire(import.meta.url)("playwright");

const page = (svg, size, w, h, bg, pad) =>
  `<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;background:${bg};display:grid;place-items:center">` +
  `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" style="width:${size}px;height:${size === w ? h : size}px;${pad ? "" : "display:block"}"></body></html>`;

// An ICO file holding one PNG image (Windows Vista+ and every browser read it).
function ico(png, size) {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
  head.writeUInt8(size >= 256 ? 0 : size, 6); head.writeUInt8(size >= 256 ? 0 : size, 7);
  head.writeUInt8(0, 8); head.writeUInt8(0, 9); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
  head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
  return Buffer.concat([head, png]);
}

const named = process.argv.slice(2);
const domains = named.length ? named : readdirSync(SITES).filter((d) => !d.startsWith("_") && existsSync(join(SITES, d, "site.json")));
const browser = await chromium.launch();
try {
  for (const domain of domains) {
    const dir = join(SITES, domain, "public");
    const site = JSON.parse(readFileSync(join(SITES, domain, "site.json"), "utf8"));
    const fav = join(dir, "favicon.svg");
    if (!existsSync(fav)) { console.log(`${domain}: no public/favicon.svg — skipped`); continue; }
    const svg = readFileSync(fav, "utf8");
    const shot = async (html, w, h, transparent) => {
      const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      await p.setContent(html);
      await p.waitForLoadState("networkidle");
      const buf = await p.screenshot({ type: "png", omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
      await p.close();
      return buf;
    };
    // The touch icon sits on a light tile with a margin, like the system icons around it.
    writeFileSync(join(dir, "apple-touch-icon.png"), await shot(page(svg, 140, 180, 180, "#ffffff", true), 180, 180, false));
    for (const n of [192, 512]) writeFileSync(join(dir, `icon-${n}.png`), await shot(page(svg, Math.round(n * 0.86), n, n, "transparent", true), n, n, true));
    writeFileSync(join(dir, "favicon.ico"), ico(await shot(page(svg, 48, 48, 48, "transparent", false), 48, 48, true), 48));
    const og = join(dir, "og.svg");
    if (existsSync(og)) writeFileSync(join(dir, "og.png"), await shot(page(readFileSync(og, "utf8"), 1200, 1200, 630, site.themeColor || "#000", false), 1200, 630, false));
    console.log(`${domain}: apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico${existsSync(og) ? ", og.png" : ""}`);
  }
} finally {
  await browser.close();
}
