/**
 * Generates committed static brand assets for apps/web/public:
 *  - icon.svg (master mark: gold crescent + open mushaf on deep emerald)
 *  - icon-192.png / icon-512.png / icon-maskable-512.png / apple-touch-icon.png / favicon.ico(png)
 *  - donate/qr-*.svg — QR codes for the direct crypto donation wallets
 *
 * Run: npx tsx scripts/generate-brand-assets.ts  (outputs are committed, not
 * generated at build time — keeps CI deterministic and fast.)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import QRCode from "qrcode";

const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "apps", "web", "public");

// Master icon: rounded emerald tile, gold crescent embracing an open book.
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="120%">
      <stop offset="0%" stop-color="#12503b"/>
      <stop offset="55%" stop-color="#0B3D2E"/>
      <stop offset="100%" stop-color="#06251b"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E8C96D"/>
      <stop offset="100%" stop-color="#B8892B"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>
  <circle cx="256" cy="216" r="118" fill="none" stroke="url(#gold)" stroke-width="14"
    stroke-dasharray="555 200" stroke-linecap="round" transform="rotate(-50 256 216)"/>
  <g fill="none" stroke="url(#gold)" stroke-width="13" stroke-linejoin="round" stroke-linecap="round">
    <path d="M148 322 q108 -44 108 6 q0 -50 108 -6 v96 q-108 -40 -108 4 q0 -44 -108 -4 z" fill="rgba(232,201,109,0.12)"/>
    <path d="M256 328 v96"/>
  </g>
  <circle cx="256" cy="152" r="14" fill="url(#gold)"/>
</svg>`;

const WALLETS = [
  { id: "btc", address: "1AzqohLY6XPGbabHmMhstYMPFUThoiBnya" },
  { id: "usdt-trc20", address: "TNo8jgJqmnUGAPUDb159cC8uhAeFDP8keW" },
  { id: "bnb-bep20", address: "0x1bed722b27b3d2bdab3dfe06ea75b84a3a824f3d" },
  { id: "sol", address: "CUnEGFRZvMu8xieLdiM9oHXa5dzS9xJVvNnEiyXRaogD" },
  { id: "doge", address: "DJUK77iDsus6URWcwNZnsqAyESUr426Df3" },
];

async function main() {
  mkdirSync(join(pub, "donate"), { recursive: true });
  writeFileSync(join(pub, "icon.svg"), ICON_SVG);

  const svgBuf = Buffer.from(ICON_SVG);
  await sharp(svgBuf).resize(192, 192).png().toFile(join(pub, "icon-192.png"));
  await sharp(svgBuf).resize(512, 512).png().toFile(join(pub, "icon-512.png"));
  await sharp(svgBuf).resize(180, 180).png().toFile(join(pub, "apple-touch-icon.png"));
  await sharp(svgBuf).resize(48, 48).png().toFile(join(pub, "favicon.ico")); // PNG-in-.ico works in all modern browsers
  // Maskable: same tile, safe-zone padding
  await sharp({
    create: { width: 640, height: 640, channels: 4, background: "#0B3D2E" },
  })
    .composite([{ input: await sharp(svgBuf).resize(512, 512).png().toBuffer(), left: 64, top: 64 }])
    .resize(512, 512)
    .png()
    .toFile(join(pub, "icon-maskable-512.png"));

  for (const w of WALLETS) {
    const svg = await QRCode.toString(w.address, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: { dark: "#0B3D2E", light: "#FFFFFF" },
    });
    writeFileSync(join(pub, "donate", `qr-${w.id}.svg`), svg);
  }
  console.log("Brand assets + donation QR codes written to apps/web/public");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
