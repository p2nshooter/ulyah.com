// Writes docs/ADSENSE-SEMUA-DOMAIN.txt from adsense-stack.json (owner, 7 Nov 2026: the sixteen stacked accounts).
// The owner reads this file; it lists, per domain, the one loader snippet, every meta tag and every ads.txt line.
//
//   node scripts/adsense-summary.mjs
import { readFileSync, writeFileSync } from "node:fs";

const S = JSON.parse(readFileSync(new URL("../adsense-stack.json", import.meta.url), "utf8"));
const REPO = {
  "axto.io": "guardian-ai · dashboard/lib/site.ts + public/ads.txt",
  "xaa.es": "xaa · src/lib/site.ts + public/ads.txt",
  "xscan.es": "ulyah.com · detektor-artikel/src/pages/ui.ts",
  "ulyah.com": "ulyah.com · apps/web (tenant ulyah) · src/lib/ad-config.ts",
  "tilawa.de": "ulyah.com · apps/web (tenant tilawa) · src/lib/ad-config.ts",
  "1fr.fr": "ulyah.com · apps/web (tenant 1fr) · src/lib/ad-config.ts",
  "xad.es": "ulyah.com · apps/web (tenant xad) · src/lib/ad-config.ts",
  "dawa.im": "ulyah.com · apps/web (tenant dawaim) · src/lib/ad-config.ts",
  "axto.dev": "axtodev · src/lib/site.ts + public/ads.txt",
  "oldco.in": "oldco.in · src/lib/adsense.ts + public/ads.txt",
  "profity.in": "profity.in · src/lib/adsense.ts + public/ads.txt",
  "jai.lat": "Jai · src/lib/site.ts + public/ads.txt",
  "lie.skin": "Lie · src/lib/site.ts + public/ads.txt",
  "axto.us": "axto.us · sites/axto.us (engine)",
  "ascan.es": "belum ada situs — kode siap, dipasang saat situsnya dibuat",
  "jenius.es": "ulyah.com · jenius/src/lib/adsense.ts (Worker jenius-es; ads.txt dari kode)",
};
const repoOf = (d) => REPO[d] || `ulyah.com · sites/${d} (engine)`;
const pub = (c) => c.replace(/^ca-/, "");
const ads = (c) => `google.com, ${pub(c)}, DIRECT, f08c47fec0942fa0`;
const meta = (c) => `<meta name="google-adsense-account" content="${c}">`;
const loader = (c) => `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${c}" crossorigin="anonymous"></script>`;
const domains = Object.keys(S.primary);
const L = [];
const rule = "=".repeat(69);
L.push(rule, ` KODE ADSENSE SEMUA DOMAIN — ditumpuk, data per ${S.since}`, rule, "");
L.push(` Domain dalam daftar pemilik : ${domains.length}`);
L.push(` Akun yang ditumpuk         : ${S.stack.length} (di setiap domain)`);
L.push(` Domain yang kodenya lama tetap dipakai (keep) : ${S.keep.length}`);
L.push("");
L.push(" Perintah pemilik, 7 Nov 2026: „kode2 adsense ini di tumpuk aja di dusun yg rapih agar tidak");
L.push(" saling bentrok dan tidak melanggar kebijakan adsense, maksudnya 1 website memakai beberapa kode");
L.push(" adsense dari akun yg berbeda“.");
L.push("");
L.push(" Cara menumpuk (rapi, tidak bentrok):");
L.push(`   • ads.txt   : SATU BARIS PER AKUN (akun utama dulu, lalu ${S.stack.length} akun). Boleh banyak baris.`);
L.push("   • tag meta  : SATU TAG PER AKUN di <head> setiap halaman, jadi setiap akun bisa");
L.push("                 memverifikasi situs dengan tag meta atau dengan ads.txt.");
L.push("   • loader    : HANYA SATU per halaman, yaitu akun utama domain itu. Google mengabaikan");
L.push("                 tag kepala AdSense kedua di halaman yang sama („Only one AdSense head tag");
L.push("                 supported per page“), jadi banyak loader hanya menambah error, bukan iklan.");
L.push("   • Auto ads saja, tanpa slot manual. Sumber tunggal: adsense-stack.json di repo ulyah.com.");
L.push("");
L.push("-".repeat(69), ` A. ${S.stack.length} AKUN YANG DITUMPUK DI SETIAP DOMAIN (urutan dari pemilik; ke-17 ditambah 8 Nov 2026)`, "-".repeat(69), "");
S.stack.forEach((c, i) => L.push(` ${String(i + 1).padStart(2)}. ${c}`));
L.push("", ` Baris ads.txt ke-${S.stack.length} akun (sama di setiap domain):`);
for (const c of S.stack) L.push(`   ${ads(c)}`);
L.push("", ` Tag meta ke-${S.stack.length} akun (sama di setiap domain):`);
for (const c of S.stack) L.push(`   ${meta(c)}`);
L.push("", "-".repeat(69), " B. PER DOMAIN: akun utama (satu-satunya loader) + akun tambahan", "-".repeat(69), "");
for (const d of domains) {
  const p = S.primary[d];
  const kept = S.keep.includes(d);
  const inStack = S.stack.includes(p);
  const all = [...new Set([p, ...S.stack])];
  L.push(`[${d}]   ${all.length} akun   (${repoOf(d)})`);
  L.push(`    akun utama : ${p}${kept ? "   ← kode lama, TETAP (daftar keep pemilik)" : inStack ? "   ← salah satu akun tumpukan" : ""}`);
  L.push(`    loader     : ${loader(p)}`);
  if (!inStack) {
    L.push(`    ads.txt    : ${ads(p)}   + ${S.stack.length} baris di bagian A`);
    L.push(`    meta       : ${meta(p)}   + ${S.stack.length} tag di bagian A`);
  } else {
    L.push(`    ads.txt    : ${S.stack.length} baris di bagian A (akun utama di baris pertama)`);
    L.push(`    meta       : ${S.stack.length} tag di bagian A (akun utama lebih dulu)`);
  }
  L.push("");
}
L.push("-".repeat(69), " C. TIDAK IKUT DITUMPUK", "-".repeat(69), "");
L.push("  dawa.es      ca-pub-6371903555702163   (sudah milik orang lain — tidak diubah)");
L.push("");
L.push("-".repeat(69), " Catatan", "-".repeat(69));
L.push("  • Kode lama yang DIHAPUS 7 Nov 2026 (domain di luar daftar keep, perintah pemilik „Domain yg lain");
L.push("    kode adsensenya boleh di hapus ikuti dengan perintah terbaru“): axto.io 8991272269211824,");
L.push("    xaa.es 6284085719914185, tilawa.de 5944786950535069, 1fr.fr 4548005919629272,");
L.push("    byodd.de 2228462932360966, byoy.de 1768325549147657, nexvilo.de 6908951782430508,");
L.push("    qulen.de 7516944260248026, qurm.de 8212039662308316 (kembali 8 Nov 2026 sebagai akun tumpukan ke-17), velnixo.de 7345352440829958,");
L.push("    zavik.de 5254913739159445, rough.es 4504974645924459, dai.lat 8469557036744946,");
L.push("    jai.lat 6019445914743449.");
L.push("  • Riwayat kode sebelum 7 Nov 2026: docs/ADSENSE-CODES.md.");
L.push("  • Kebijakan AdSense: satu orang hanya boleh punya SATU akun AdSense. Banyak akun di satu situs");
L.push("    diperbolehkan bila akun-akun itu milik orang/badan yang berbeda (mis. situs bagi hasil).");
L.push("    Jika akun-akun tumpukan milik satu orang yang sama, Google dapat menutup akun-akun tambahan.");
L.push("");
writeFileSync(new URL("../docs/ADSENSE-SEMUA-DOMAIN.txt", import.meta.url), L.join("\n"));
console.log(`wrote docs/ADSENSE-SEMUA-DOMAIN.txt (${domains.length} domains)`);
