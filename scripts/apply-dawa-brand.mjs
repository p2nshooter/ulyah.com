
import sharp from "sharp";
const up = "/root/.claude/uploads/c7c42d57-5ca9-5881-af1f-67820383f41e";
const out = "/home/user/ulyah.com/apps/web/public/brand/dawa";
// App icon (rounded-square artwork) -> manifest icons
await sharp(`${up}/ad629434-1000607992.png`).resize(512,512).png().toFile(`${out}/icon.png`);
await sharp(`${up}/ad629434-1000607992.png`).resize(512,512).png().toFile(`${out}/icon-512.png`);
await sharp(`${up}/ad629434-1000607992.png`).resize(192,192).png().toFile(`${out}/icon-192.png`);
await sharp(`${up}/ad629434-1000607992.png`).resize(180,180).png().toFile(`${out}/icon-180.png`);
// Round emblem -> favicon
await sharp(`${up}/220760d5-1000607991.png`).resize(64,64).png().toFile(`${out}/favicon.png`);
await sharp(`${up}/220760d5-1000607991.png`).resize(256,256).png().toFile(`${out}/favicon-256.png`);
// Wide banner
await sharp(`${up}/704a494f-1000607990.png`).resize({width:1600}).png({quality:90}).toFile(`${out}/banner.png`);
console.log("dawa brand assets replaced from owner-provided artwork");
