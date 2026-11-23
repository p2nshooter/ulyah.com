/**
 * The LUAJA guide for the article sites' ecosystem band (owner, 23 Nov 2026: „promosikan juga luaja.com, sederhana aja,
 * ambil animasi model di luaja.com dan tambahkan text promosi, bikin seperti banner berjalan").
 *
 * The same figure luaja.com draws (luaja/src/pages/figure.ts, pose "sapa": the LUAJA blazer, a book, a waving hand and
 * two twinkles), made into one self-contained SVG: the portrait is embedded (small edition, as data: URI) and the
 * wave/twinkle animation travels inside the file, so an <img> on any site shows it exactly as luaja.com does — no
 * request to luaja.com, nothing to break when a page is served from another domain. prefers-reduced-motion is honoured.
 *
 *   npx tsx scripts/build-eco-luaja.ts           write sites/_engine/assets/engine-luaja.svg
 *   npx tsx scripts/build-eco-luaja.ts --check   fail when the committed file differs from what luaja's figure draws
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { figure } from "../luaja/src/pages/figure.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "sites", "_engine", "assets", "engine-luaja.svg");
const PORTRAITS = join(ROOT, "luaja", "public", "assets", "pemandu");

const MOTION =
  "<style>" +
  "@media (prefers-reduced-motion:no-preference){" +
  ".sc-wave{animation:wave 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:bottom right}" +
  ".sc-twinkle{animation:twinkle var(--d,3s) ease-in-out infinite;animation-delay:var(--dl,0s);transform-box:fill-box;transform-origin:center}" +
  "}" +
  "@keyframes wave{0%,100%{transform:rotate(0)}30%{transform:rotate(-14deg)}60%{transform:rotate(8deg)}}" +
  "@keyframes twinkle{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}" +
  "</style>";

export function ecoLuajaSvg(): string {
  let svg = figure("sapa", { mood: "pagi", small: true });
  svg = svg.replace(/href="\/assets\/pemandu\/([a-z0-9-]+\.webp)"/g, (_, name: string) => {
    const b64 = readFileSync(join(PORTRAITS, name)).toString("base64");
    return `href="data:image/webp;base64,${b64}"`;
  });
  if (/href="\/assets\//.test(svg)) throw new Error("the figure still points at a luaja.com file");
  // The figure is drawn for an inline <svg> on luaja.com; as a file it needs its own animation and an explicit size.
  svg = svg.replace(/<svg ([^>]*)>/, (_, attrs: string) => `<svg ${attrs} width="520" height="560">${MOTION}`);
  return `${svg}\n`;
}

if (process.argv[1] && /(^|[\\/])build-eco-luaja\.ts$/.test(process.argv[1])) {
  const svg = ecoLuajaSvg();
  if (process.argv.includes("--check")) {
    let cur = "";
    try {
      cur = readFileSync(OUT, "utf8");
    } catch {
      /* missing */
    }
    if (cur !== svg) {
      console.error("sites/_engine/assets/engine-luaja.svg is out of step with luaja's figure — run: npx tsx scripts/build-eco-luaja.ts");
      process.exit(1);
    }
    console.log(`engine-luaja.svg: in step (${Math.round(svg.length / 1024)} KB)`);
  } else {
    writeFileSync(OUT, svg);
    console.log(`wrote ${OUT} (${Math.round(svg.length / 1024)} KB)`);
  }
}
