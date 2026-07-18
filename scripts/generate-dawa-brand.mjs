import sharp from "sharp";
import { mkdirSync } from "node:fs";

const outDir = "/home/user/ulyah.com/apps/web/public/brand/dawa";
mkdirSync(outDir, { recursive: true });

// Andalusian 8-point star on a warm terracotta→orange gradient, olive ring —
// dawa.es "Warm Mediterranean" identity (same visual language as the theme).
const star = (cx, cy, r, fill, opacity = 1) => {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const ang = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" opacity="${opacity}"/>`;
};

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d35400"/>
      <stop offset="1" stop-color="#e67e22"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.28" cy="0.22" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect width="512" height="512" rx="96" fill="url(#sun)"/>
  <circle cx="256" cy="238" r="150" fill="none" stroke="#7d8f38" stroke-width="14" opacity="0.9"/>
  ${star(256, 238, 118, "#fff8f1", 0.97)}
  ${star(256, 238, 52, "#7d8f38", 0.95)}
  <circle cx="256" cy="238" r="20" fill="#fff8f1"/>
  <text x="256" y="452" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="86" font-weight="bold" fill="#fff8f1">Dawa</text>
</svg>`;

const bannerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="#c2470a"/>
      <stop offset="0.6" stop-color="#d35400"/>
      <stop offset="1" stop-color="#e67e22"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="400" fill="url(#bg)"/>
  ${Array.from({ length: 6 }, (_, i) => star(80 + i * 210, 60 + (i % 2) * 280, 34, "#fff8f1", 0.10)).join("")}
  ${star(1030, 200, 130, "#fff8f1", 0.16)}
  ${star(1030, 200, 96, "#7d8f38", 0.5)}
  ${star(1030, 200, 62, "#fff8f1", 0.9)}
  <text x="80" y="196" font-family="Georgia, 'Times New Roman', serif" font-size="120" font-weight="bold" fill="#fff8f1">Dawa</text>
  <text x="84" y="262" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="#ffe4c9">El Portal Islámico en Español</text>
  <text x="84" y="316" font-family="Verdana, sans-serif" font-size="26" fill="#f9d9b8">dawa.es</text>
</svg>`;

await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile(`${outDir}/icon.png`);
await sharp(Buffer.from(iconSvg)).resize(192, 192).png().toFile(`${outDir}/icon-192.png`);
await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile(`${outDir}/icon-512.png`);
await sharp(Buffer.from(iconSvg)).resize(180, 180).png().toFile(`${outDir}/icon-180.png`);
await sharp(Buffer.from(bannerSvg)).png().toFile(`${outDir}/banner.png`);
console.log("dawa brand assets written");
