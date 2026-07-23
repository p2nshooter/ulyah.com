/**
 * Deterministic "kitab cover" art — the single source of truth shared by the
 * web app (the on-shelf library cards, via `coverCss`) and the worker-api
 * (the per-work Open Graph / share image, via `coverSvg`). Both derive the
 * SAME binding hue, gradient angle and tooled Islamic-geometry motif from a
 * hash of the slug, so a kitab's share image matches the cover a visitor sees
 * on the shelf, and no two works look alike. Pure, framework-agnostic TS: no
 * node/DOM/CSS globals beyond `encodeURIComponent`, so it bundles cleanly for
 * both Next.js and Cloudflare Workers.
 */

/** A family of independent 32-bit FNV-1a hashes off one slug (salted per param). */
function hash(slug: string, salt: string): number {
  let h = 2166136261 >>> 0;
  const s = salt + " " + slug;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function pick(slug: string, salt: string, min: number, max: number): number {
  return min + (hash(slug, salt) % (max - min + 1));
}

/** Resolved, uncorrelated visual parameters for one slug. */
export interface CoverPalette {
  h: number; // binding hue
  s: number; // jewel saturation %
  l1: number; // gradient top lightness %
  l2: number; // gradient bottom lightness %
  angle: number; // gradient angle (deg)
  foil: string; // warm gold hsl()
  spine: string; // dark binding edge hsl()
  ink: string; // soft secondary-text hsl()
  motif: number; // index into MOTIFS
  motifRot: number; // 0/90/180/270 (keeps the tile seamless)
  motifOpacity: number; // 0..1
}

export function coverPalette(slug: string): CoverPalette {
  const h = hash(slug, "hue") % 360;
  const s = pick(slug, "sat", 44, 58);
  const l1 = pick(slug, "l1", 26, 32);
  const l2 = l1 - pick(slug, "ld", 12, 16);
  const angle = pick(slug, "ang", 120, 160);
  const fh = pick(slug, "fh", 40, 48);
  const fl = pick(slug, "fl", 62, 70);
  return {
    h,
    s,
    l1,
    l2,
    angle,
    foil: `hsl(${fh},68%,${fl}%)`,
    spine: `hsl(${h},${s + 6}%,10%)`,
    ink: `hsl(${h},24%,83%)`,
    motif: hash(slug, "motif") % MOTIFS.length,
    motifRot: pick(slug, "rot", 0, 3) * 90,
    motifOpacity: pick(slug, "op", 16, 26) / 100,
  };
}

// Six edge-safe geometric motifs, each centred inside a 64×64 tile with a
// margin so the tile repeats seamlessly. All strokes/fills use the cover's own
// gold foil, kept faint so the motif reads as tooled leather. Returns the inner
// SVG markup for a given foil colour.
const MOTIFS: Array<(f: string) => string> = [
  (f) =>
    `<g fill="none" stroke="${f}" stroke-width="1.1"><rect x="20" y="20" width="24" height="24" transform="rotate(45 32 32)"/><rect x="20" y="20" width="24" height="24"/></g>`,
  (f) =>
    `<g fill="${f}"><circle cx="32" cy="32" r="2.2"/><circle cx="32" cy="16" r="1.6"/><circle cx="32" cy="48" r="1.6"/><circle cx="16" cy="32" r="1.6"/><circle cx="48" cy="32" r="1.6"/></g>`,
  (f) =>
    `<polygon points="32,14 48,23 48,41 32,50 16,41 16,23" fill="none" stroke="${f}" stroke-width="1.1"/>`,
  (f) =>
    `<g fill="none" stroke="${f}" stroke-width="1"><path d="M0 32 L32 0 L64 32 L32 64 Z"/><path d="M16 32 L32 16 L48 32 L32 48 Z"/></g>`,
  (f) => {
    const rays = Array.from({ length: 8 }, (_, k) => {
      const a = (k * Math.PI) / 8;
      const x = 32 + Math.cos(a) * 22;
      const y = 32 + Math.sin(a) * 22;
      return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(64 - x).toFixed(1)}" y2="${(64 - y).toFixed(1)}"/>`;
    }).join("");
    return `<g stroke="${f}" stroke-width="0.9">${rays}</g>`;
  },
  (f) =>
    `<g fill="none" stroke="${f}" stroke-width="1.1"><path d="M12 44 A20 20 0 0 1 52 44"/><path d="M20 44 A12 12 0 0 1 44 44"/></g>`,
];

/** Inner markup of one 64×64 motif tile, rotated + faded for this slug. */
function motifTile(p: CoverPalette): string {
  return `<g opacity="${p.motifOpacity.toFixed(2)}" transform="rotate(${p.motifRot} 32 32)">${MOTIFS[p.motif]!(p.foil)}</g>`;
}

export interface CoverCss {
  /** full cover background (tooled motif layer + jewel gradient) */
  cover: string;
  spine: string;
  foil: string;
  ink: string;
}

/** CSS-string cover for the web library cards (`style={{ background: cover }}`). */
export function coverCss(slug: string): CoverCss {
  const p = coverPalette(slug);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${motifTile(p)}</svg>`;
  const motifLayer = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return {
    cover:
      `${motifLayer},` +
      `linear-gradient(${p.angle}deg,hsl(${p.h},${p.s}%,${p.l1}%) 0%,hsl(${p.h},${p.s}%,${p.l2}%) 100%)`,
    spine: p.spine,
    foil: p.foil,
    ink: p.ink,
  };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Greedy word-wrap into at most `maxLines` lines of ~`maxChars`, ellipsised. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1]!;
    const consumed = lines.join(" ").length;
    if (consumed < text.trim().length && !last.endsWith("…")) lines[maxLines - 1] = last.replace(/[.,;:\s]*$/, "") + "…";
  }
  return lines;
}

export interface CoverSvgOpts {
  /** main title (Arabic for kitab, latin for kisah) */
  title: string;
  /** optional secondary line under the title */
  subtitle?: string;
  /** small kicker above the title, e.g. the site name */
  kicker?: string;
  /** true when `title` is Arabic/RTL so it renders right-to-left */
  rtl?: boolean;
  width?: number;
  height?: number;
}

/**
 * A standalone Open Graph / share image (default 1200×630) for one work —
 * the same jewel binding + tooled motif as its shelf cover, with the work's
 * title foil-stamped on it. Returned as a complete SVG document string; the
 * worker serves it as `image/svg+xml`. Pure function of its inputs, so it is
 * trivially edge-cacheable.
 */
export function coverSvg(slug: string, opts: CoverSvgOpts): string {
  const W = opts.width ?? 1200;
  const H = opts.height ?? 630;
  const p = coverPalette(slug);

  // gradient endpoints from the angle (same convention as CSS linear-gradient)
  const rad = ((p.angle - 90) * Math.PI) / 180;
  const cx = W / 2;
  const cy = H / 2;
  const dx = (Math.cos(rad) * W) / 2;
  const dy = (Math.sin(rad) * H) / 2;

  const titleLines = wrap(opts.title, opts.rtl ? 22 : 30, 2);
  const titleSize = titleLines.length > 1 || opts.title.length > 22 ? 76 : 96;
  const anchor = opts.rtl ? "end" : "start";
  const tx = opts.rtl ? W - 96 : 96;
  const dir = opts.rtl ? ` direction="rtl"` : "";

  // vertically centre the title block
  const blockH = titleLines.length * (titleSize + 12);
  let ty = cy - blockH / 2 + titleSize;

  const titleTspans = titleLines
    .map((ln) => {
      const t = `<text x="${tx}" y="${ty.toFixed(0)}" text-anchor="${anchor}"${dir} fill="${p.foil}" font-family="Georgia, 'Times New Roman', 'Amiri', serif" font-size="${titleSize}" font-weight="700">${esc(ln)}</text>`;
      ty += titleSize + 12;
      return t;
    })
    .join("");

  const kicker = opts.kicker
    ? `<text x="${tx}" y="${(cy - blockH / 2 - 28).toFixed(0)}" text-anchor="${anchor}"${dir} fill="${p.foil}" font-family="system-ui, sans-serif" font-size="26" font-weight="600" letter-spacing="4" opacity="0.85">${esc(opts.kicker.toUpperCase())}</text>`
    : "";

  const subtitle = opts.subtitle
    ? `<text x="${tx}" y="${(ty + 14).toFixed(0)}" text-anchor="${anchor}"${dir} fill="${p.ink}" font-family="system-ui, sans-serif" font-size="34" opacity="0.92">${esc(wrap(opts.subtitle, 46, 1)[0] ?? "")}</text>`
    : "";

  // a short gold rule under the block, on the title's leading edge
  const ruleX = opts.rtl ? W - 96 - 120 : 96;
  const rule = `<rect x="${ruleX}" y="${(ty + 44).toFixed(0)}" width="120" height="4" rx="2" fill="${p.foil}" opacity="0.8"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>` +
    `<linearGradient id="bg" x1="${(cx - dx).toFixed(1)}" y1="${(cy - dy).toFixed(1)}" x2="${(cx + dx).toFixed(1)}" y2="${(cy + dy).toFixed(1)}" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="hsl(${p.h},${p.s}%,${p.l1}%)"/><stop offset="1" stop-color="hsl(${p.h},${p.s}%,${p.l2}%)"/>` +
    `</linearGradient>` +
    `<pattern id="motif" patternUnits="userSpaceOnUse" width="64" height="64">${motifTile(p)}</pattern>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#motif)"/>` +
    `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="10" fill="none" stroke="${p.foil}" stroke-width="2" opacity="0.35"/>` +
    `<rect x="0" y="0" width="14" height="${H}" fill="${p.spine}"/>` +
    kicker +
    titleTspans +
    subtitle +
    rule +
    `</svg>`
  );
}
