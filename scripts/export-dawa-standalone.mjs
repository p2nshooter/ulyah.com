#!/usr/bin/env node
/**
 * Backup dawa.es sebagai proyek MANDIRI — lepas dari ekosistem ulyah.com.
 *
 * Owner: "backup full 100% script domain dawa.es yg ada di ekosistem ulyah.com
 * dengan database nya … putuskan dulu koneksi2 yg terhubung ke ulyah.com agar
 * script ini nantinya di bangun mandiri tanpa terhubung dengan ulyah.com".
 *
 * dawa.es bukan repo sendiri: ia adalah satu build dari monorepo ini
 * (NEXT_PUBLIC_TENANT=dawa) yang memanggil API bersama di api.ulyah.com, yang
 * membaca D1 bersama (ulyah-db), KV bersama (ulyah-cache) dan R2 bersama
 * (ulyah-media). Skrip ini menyalin SELURUH monorepo (kecuali quantum/, yang
 * sistem bengkel lain dan tidak ada hubungannya dengan dawa.es), lalu memutus
 * setiap sambungan itu:
 *
 *   api.ulyah.com      -> api.dawa.es      (Worker API sendiri: dawa-api)
 *   ulyah-db           -> dawa-db          (D1 sendiri)
 *   ulyah-cache        -> dawa-cache       (KV sendiri)
 *   ulyah-media        -> dawa-media       (R2 sendiri)
 *   ulyah-next-cache   -> dawa-next-cache  (R2 cache halaman sendiri)
 *   CORS               -> hanya dawa.es / www.dawa.es
 *   tautan situs saudara, hreflang ekosistem, bot artikel ke repo lain -> dihapus
 *   salam@ulyah.com    -> salam@dawa.es
 *
 * Setiap suntingan spesifik MENEGASKAN teks yang dicarinya ada. Kalau kode
 * induknya berubah dan sebuah pola tidak ketemu lagi, skrip berhenti dengan
 * pesan jelas — lebih baik gagal keras daripada menghasilkan backup yang diam-
 * diam masih tersambung ke ulyah.com.
 *
 * Migrasi dan seed D1 (packages/db-schema) tidak kena penggantian global: itu
 * datanya, dan skema 0001–0056 harus identik dengan ulyah-db supaya dump live
 * bisa diimpor ke dawa-db tanpa konversi. Dua pengecualian yang disengaja dan
 * tercatat di EDITS/NEW_FILES: ID ebook kisah_nuh.sql (bentrok dengan Luqman),
 * dan migrasi baru 0057 yang membuang akun admin situs lain.
 *
 * Audio TIDAK ikut (memang tidak ada di repo): murottal diputar langsung dari
 * CDN para qari — lihat AUDIO-CDN.md di hasil backup.
 *
 * Pakai:
 *   node scripts/export-dawa-standalone.mjs            # -> dist/dawa-es-backup/
 *   node scripts/export-dawa-standalone.mjs --zip      # + dist/dawa-es-backup-<tgl>.zip
 *   node scripts/export-dawa-standalone.mjs --out=/path/ke/folder --zip
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);
const OUT = resolve(args.out ?? join(ROOT, "dist", "dawa-es-backup"));
const PROJECT = join(OUT, "dawa-es");
const GUIDE_SRC = join(ROOT, "docs", "dawa-standalone");

// ---------------------------------------------------------------------------
// 1. Salin file
// ---------------------------------------------------------------------------

/** Yang TIDAK ikut ke proyek mandiri, dan alasannya. */
const EXCLUDE = [
  [/^quantum\//, "sistem karoseri CV. Quantum — bukan bagian dari dawa.es"],
  [/^\.github\/workflows\/deploy-quantum\.yml$/, "deploy Quantum"],
  [/^\.github\/workflows\/deploy-partner-sites\.yml$/, "deploy profity.in/oldco.in — situs lain"],
  [/^docs\/dawa-standalone\//, "sumber panduan ini; disalin ke akar backup, bukan ke proyek"],
  [/^scripts\/export-dawa-standalone\.mjs$/, "generator backup ini sendiri"],
];

function gitFiles() {
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT,
    maxBuffer: 64 * 1024 * 1024,
  });
  return out
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter((f) => existsSync(join(ROOT, f)));
}

const TEXT_EXT = /\.(ts|tsx|js|mjs|cjs|jsx|json|jsonc|toml|ya?ml|md|txt|css|html|sh|py|sql|env|webmanifest|svg)$/i;
const isText = (f) => TEXT_EXT.test(f) || /(^|\/)\.[a-z]+$/.test(f) || !f.includes(".");

// ---------------------------------------------------------------------------
// 2. Penggantian global (semua file teks kecuali data D1)
// ---------------------------------------------------------------------------

/**
 * Nama sumber daya dan alamat yang, kalau tertinggal, membuat build dawa.es
 * diam-diam masih bicara dengan infrastruktur ulyah.com. Urutan penting:
 * yang lebih panjang dulu (ulyah-next-cache sebelum ulyah-cache).
 */
const GLOBAL = [
  ["api.ulyah.com", "api.dawa.es"],
  ["ulyah-next-cache", "dawa-next-cache"],
  ["ulyah-db", "dawa-db"],
  ["ulyah-cache", "dawa-cache"],
  ["ulyah-media", "dawa-media"],
  ["ulyah-api", "dawa-api"],
  ["ulyah-web", "dawa-web"],
  ["salam@ulyah\\.com", "salam@dawa\\.es"],
  ["salam@ulyah.com", "salam@dawa.es"],
  ['NEXT_PUBLIC_TENANT ?? "ulyah"', 'NEXT_PUBLIC_TENANT ?? "dawa"'],
  ['NEXT_PUBLIC_TENANT || "ulyah"', 'NEXT_PUBLIC_TENANT || "dawa"'],
  // uuid ulyah-db yang tertulis di komentar/skrip — D1 baru punya uuid baru.
  ["28800662-2034-456d-a91d-a6532c2a9abd", "<UUID-dawa-db>"],
];

/** Data D1 disalin persis — tidak disentuh penggantian apa pun. */
const DATA_UNTOUCHED = /^packages\/db-schema\/(migrations|seed)\//;

// ---------------------------------------------------------------------------
// 3. Suntingan spesifik (masing-masing wajib ketemu)
// ---------------------------------------------------------------------------

const EDITS = [
  // --- Bahasa & ekosistem ---------------------------------------------------
  {
    file: "packages/shared/src/i18n.ts",
    find: `export const LOCALE_SITE: Record<string, string> = {
  en: "https://xad.es",
  de: "https://tilawa.de",
  es: "https://dawa.es",
  fr: "https://1fr.fr",
};`,
    replace: `// MANDIRI: dawa.es tidak lagi punya situs saudara. Satu-satunya bahasa yang
// punya domain adalah Spanyol, di dawa.es sendiri — tidak ada tautan keluar ke
// xad.es / tilawa.de / 1fr.fr / ulyah.com.
export const LOCALE_SITE: Record<string, string> = {
  es: "https://dawa.es",
};`,
  },
  {
    file: "packages/shared/src/i18n.ts",
    find: `export const HUB_SITE = "https://ulyah.com";
const HUB_DEFAULT = "id";`,
    replace: `export const HUB_SITE = "https://dawa.es";
const HUB_DEFAULT = "es";`,
  },
  {
    file: "packages/shared/src/i18n.ts",
    find: `const TENANT_ID = (typeof process !== "undefined" && process?.env?.NEXT_PUBLIC_TENANT) || "ulyah";`,
    replace: `// Tidak di-set = build worker-api: TIDAK dipersempit, API tetap menerima semua
// kode bahasa (perilaku sama persis dengan API lama). Web dawa.es selalu
// di-build dengan NEXT_PUBLIC_TENANT=dawa (apps/web/.env.production).
const TENANT_ID = (typeof process !== "undefined" && process?.env?.NEXT_PUBLIC_TENANT) || "all";`,
  },
  {
    file: "packages/shared/src/i18n.ts",
    find: `export const MT_TARGET_LANGS: readonly string[] = Object.freeze([HUB_DEFAULT, ...Object.keys(LOCALE_SITE)]);`,
    replace: `// MANDIRI: hanya Spanyol — satu-satunya bahasa yang disajikan dawa.es.
export const MT_TARGET_LANGS: readonly string[] = Object.freeze([...new Set([HUB_DEFAULT, ...Object.keys(LOCALE_SITE)])]);`,
  },
  {
    file: "apps/web/src/middleware.ts",
    find: `const ALWAYS_LIVE = ["id", "en", "fr", "de", "es"];`,
    replace: `// MANDIRI: hanya dawa.es — tidak ada hreflang ke situs ekosistem lama.
const ALWAYS_LIVE = [DEFAULT_LOCALE];`,
  },
  {
    file: "apps/web/src/middleware.ts",
    find: `: localeCanonicalUrl("id", clean);`,
    replace: `: localeCanonicalUrl(DEFAULT_LOCALE, localizedRoute(clean, DEFAULT_LOCALE));`,
  },
  {
    // Hanya dawa di peta tenant: konfigurasi situs lain (dengan siteUrl
    // ulyah.com dsb.) tidak lagi ikut terbundel ke JavaScript pengunjung.
    file: "apps/web/src/lib/tenant.ts",
    find: `const TENANTS: Record<string, TenantConfig> = { "1fr": ONEFAITH, tilawa: TILAWA, dawa: DAWA, xad: XAD, ulyah: ULYAH };`,
    replace: `// MANDIRI: hanya dawa. ULYAH/ONEFAITH/TILAWA/XAD di atas tinggal sebagai
// arsip; tidak dirujuk, jadi dibuang oleh minifier dari bundle.
const TENANTS: Record<string, TenantConfig> = { dawa: DAWA };`,
  },
  {
    file: "apps/web/src/lib/tenant.ts",
    find: `export const TENANT: TenantConfig = TENANTS[process.env.NEXT_PUBLIC_TENANT ?? "dawa"] ?? ULYAH;`,
    replace: `// MANDIRI: default dan fallback = dawa. Konfigurasi tenant lain dibiarkan hanya
// sebagai sisa kode multi-tenant; build dawa.es tidak pernah memakainya.
export const TENANT: TenantConfig = TENANTS[process.env.NEXT_PUBLIC_TENANT ?? "dawa"] ?? DAWA;`,
  },
  {
    file: "apps/web/src/components/kids/KidsCertificate.tsx",
    find: `ulyah.com — Al-Qur&apos;an Kids`,
    replace: `dawa.es — Al-Qur&apos;an Kids`,
  },

  // --- Worker API -----------------------------------------------------------
  {
    file: "apps/worker-api/src/index.ts",
    find: /const SIBLING_ORIGINS = new Set\(\[[\s\S]*?\]\);/,
    replace: `// MANDIRI: API ini hanya melayani dawa.es. Tidak ada lagi origin ulyah.com,
// 1fr.fr, tilawa.de, xad.es atau jaringan AXTO.
const SIBLING_ORIGINS = new Set([
  "https://dawa.es", "https://www.dawa.es",
]);`,
  },
  {
    file: "apps/worker-api/src/routes/analytics.ts",
    find: `  if (src.includes("xad.es")) return "xad";
  return "ulyah";`,
    replace: `  if (src.includes("xad.es")) return "xad";
  // MANDIRI: semua trafik API ini milik dawa.es.
  return "dawa";`,
  },
  {
    file: "apps/worker-api/src/routes/ai.ts",
    find: `  if (h.includes("dawa.es")) return "Dawa";
  return "ULYAH.COM";`,
    replace: `  if (h.includes("dawa.es")) return "Dawa";
  // MANDIRI: API ini milik dawa.es.
  return "Dawa";`,
  },
  {
    file: "apps/worker-api/src/lib/content-bot.ts",
    find: /const SITES: AutoSite\[\] = \[\n[\s\S]*?\n\];/,
    replace: `// MANDIRI: bot artikel dulu menulis ke repo situs lain milik ekosistem
// (jai.lat, lie.skin, axto.dev, xaa.es, axto.us, oldco.in, profity.in). Semua
// itu bukan dawa.es, jadi daftarnya dikosongkan — bot menjadi no-op walaupun
// GH_CONTENT_TOKEN di-set.
const SITES: AutoSite[] = [];`,
  },
  {
    file: "apps/worker-api/src/routes/grant.ts",
    find: `  site: "https://ulyah.com",`,
    replace: `  site: "https://dawa.es",`,
  },
  {
    file: "apps/worker-api/src/routes/grant.ts",
    find: `<img src="https://ulyah.com/brand/ulyah-logo-dark.webp" alt="ULYAH.COM"`,
    replace: `<img src="https://dawa.es/brand/dawa/icon.png" alt="Dawa"`,
  },
  {
    // Nama bucket sudah pasti (dawa-media), jadi tidak perlu placeholder yang
    // diisi CI — dan placeholder itu membuat `wrangler … --local` menolak jalan.
    file: "apps/worker-api/wrangler.toml",
    find: `bucket_name = "__R2_BUCKET_NAME__"`,
    replace: `bucket_name = "dawa-media"`,
  },
  {
    file: "apps/worker-api/wrangler.toml",
    find: `PUBLIC_SITE_URL = "https://ulyah.com"`,
    replace: `PUBLIC_SITE_URL = "https://dawa.es"`,
  },
  {
    file: "apps/worker-api/wrangler.toml",
    find: `# Custom Domain (not a route): wrangler auto-creates the DNS record and
# certificate for api.dawa.es on deploy — no manual DNS step. Requires the
# ulyah.com zone`,
    replace: `# Custom Domain (not a route): wrangler auto-creates the DNS record and
# certificate for api.dawa.es on deploy — no manual DNS step. Requires the
# dawa.es zone`,
  },

  {
    file: "apps/worker-api/src/routes/admin.ts",
    find: `  return requested || "ulyah"; // ulyah owner — may target any site`,
    replace: `  return requested || "dawa"; // MANDIRI: pemilik dawa.es`,
  },
  {
    file: "apps/worker-api/src/routes/content.ts",
    find: `  const tenant = c.req.query("tenant") || "ulyah";`,
    replace: `  const tenant = c.req.query("tenant") || "dawa";`,
  },
  {
    file: "apps/worker-api/src/routes/content.ts",
    find: `  const slug = (c.req.query("slug") || "ulyah").slice(0, 120);`,
    replace: `  const slug = (c.req.query("slug") || "dawa").slice(0, 120);`,
  },

  // --- Merek yang terlihat pengunjung di luar lib/rebrand.ts ----------------
  {
    file: "apps/worker-api/src/lib/paypal.ts",
    find: `description: "Donasi ULYAH.COM" }],`,
    replace: `description: "Donación Dawa (dawa.es)" }],`,
  },
  { file: "apps/worker-api/src/lib/paypal.ts", find: `brand_name: "ULYAH.COM",`, replace: `brand_name: "Dawa",` },
  {
    file: "apps/worker-api/src/lib/nowpayments.ts",
    find: `order_description: "Donasi ULYAH.COM",`,
    replace: `order_description: "Donación Dawa (dawa.es)",`,
  },
  {
    file: "apps/worker-api/src/lib/orchestra.ts",
    find: `const site = (opts.site && opts.site.trim()) || "ULYAH.COM";`,
    replace: `const site = (opts.site && opts.site.trim()) || "Dawa";`,
  },
  { file: "apps/worker-api/src/routes/grant.ts", find: /ULYAH\.COM/g, replace: "DAWA.ES" },
  {
    file: "apps/web/src/components/GlobalRadioPlayer.tsx",
    find: `artist: rc?.name ?? "ULYAH.COM",`,
    replace: `artist: rc?.name ?? "Dawa",`,
  },
  { file: "apps/web/src/components/GlobalRadioPlayer.tsx", find: `album: "ULYAH.COM",`, replace: `album: "Dawa",` },
  {
    file: "scripts/check-murottal-cdn.ts",
    find: `(target.hostname === "ulyah.com" || target.hostname.endsWith(".ulyah.com"))`,
    replace: `(target.hostname === "dawa.es" || target.hostname.endsWith(".dawa.es"))`,
  },
  ...["yusuf-pdfs.ts", "musa-pdfs.ts", "nuh-pdfs.ts", "dzulqarnain-pdfs.ts", "ashabul-kahfi-pdfs.ts"].map((f) => ({
    file: `scripts/generate-kisah-${f}`,
    find: /"ULYAH\.COM — /g,
    replace: `"DAWA.ES — `,
  })),

  // --- Admin (hanya terlihat pemilik) ---------------------------------------
  {
    file: "apps/web/src/components/admin/GrantTab.tsx",
    find: /https:\/\/ulyah\.com\/brand\/ulyah-logo-dark\.webp/g,
    replace: "https://dawa.es/brand/dawa/icon.png",
  },
  { file: "apps/web/src/components/admin/GrantTab.tsx", find: /https:\/\/ulyah\.com/g, replace: "https://dawa.es" },
  { file: "apps/web/src/components/admin/GrantTab.tsx", find: /ULYAH\.COM/g, replace: "DAWA.ES" },
  {
    file: "apps/web/src/components/admin/KaggleGuideTab.tsx",
    find: /https:\/\/ulyah\.com\/brand\/ulyah-logo-dark\.webp/g,
    replace: "https://dawa.es/brand/dawa/icon.png",
  },

  // --- Skrip ----------------------------------------------------------------
  {
    file: "scripts/notify-search-engines.ts",
    find: `const SITES = [
  { host: "ulyah.com" },
  { host: "dawa.es" },
  { host: "1fr.fr" },
  { host: "tilawa.de" },
  { host: "xad.es" },
];`,
    replace: `const SITES = [{ host: "dawa.es" }];`,
  },
  {
    file: "scripts/measure-locale-content.ts",
    find: `const DB_ID = "<UUID-dawa-db>"; // dawa-db`,
    replace: `const DB_ID = process.env.D1_DATABASE_ID ?? ""; // uuid dawa-db (wrangler d1 info dawa-db)`,
  },
  {
    file: "scripts/check-mt-targets.ts",
    find: `check("MT_TARGET_LANGS", [...MT_TARGET_LANGS], ["id", "en", "de", "es", "fr"], "ulyah.com + the four sibling domains");`,
    replace: `check("MT_TARGET_LANGS", [...MT_TARGET_LANGS], ["es"], "dawa.es saja (mandiri)");`,
  },

  // Penerjemah konten: default hanya Spanyol (dulu fr/de/es untuk tiga situs).
  { file: ".github/workflows/translate-content.yml", find: /fr,de,es/g, replace: "es" },
  { file: "scripts/translate-pesantren.ts", find: /fr,de,es/g, replace: "es" },
  {
    file: "scripts/warm-mt-cache.ts",
    find: `const HADITH_WARM_LANGS = ["fr", "de", "es"];`,
    replace: `const HADITH_WARM_LANGS = ["es"];`,
  },

  // --- Perbaikan data: satu-satunya seed yang disentuh ---------------------
  // kisah_luqman.sql dan kisah_nuh.sql sama-sama memakai ebooks.id 400–409.
  // Di ulyah-db yang lebih dulu diimpor menang dan yang lain gagal (langkahnya
  // continue-on-error); di database BARU restore berhenti di kisah_nuh.sql
  // dengan "UNIQUE constraint failed: ebooks.id". Ebook Nabi Nuh dipindah ke
  // 1400–1413 (belum dipakai seed mana pun) — di baris ebooks dan di
  // pdf_ebook_id kisahnya, jadi tautan PDF-nya tetap benar.
  {
    file: "packages/db-schema/seed/kisah_nuh.sql",
    find: /(INTO ebooks \(id, [^)]*\) VALUES \()(4(?:0\d|1[0-3]))(,)/g,
    replace: "$11$2$3",
  },
  {
    file: "packages/db-schema/seed/kisah_nuh.sql",
    find: /(\), )(4(?:0\d|1[0-3]))(, datetime\('now'\))/g,
    replace: "$11$2$3",
  },

  // --- Paket akar -----------------------------------------------------------
  { file: "package.json", find: `"name": "ulyah",`, replace: `"name": "dawa-es",` },
  {
    file: "package.json",
    find: `"description": "ULYAH.COM — Islamic Audio, AI & Knowledge Platform",`,
    replace: `"description": "Dawa (dawa.es) — El Portal Islámico en Español. Mandiri, lepas dari ekosistem ulyah.com.",`,
  },
];

/** File yang ditulis ulang utuh di proyek mandiri. */
const WRITES = {
  // Manifest statis lama (bermerek ULYAH, bahasa Indonesia). Layout memakai
  // /manifest.webmanifest yang sadar-tenant; file ini hanya untuk peramban
  // yang masih meminta /manifest.json langsung.
  "apps/web/public/manifest.json":
    JSON.stringify(
      {
        name: "Dawa — El Islam en Español",
        short_name: "Dawa",
        description: "El Corán, el tafsir, los hadices y los relatos islámicos en una experiencia de audio serena.",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#fff8f1",
        theme_color: "#8a3b12",
        icons: [
          { src: "/brand/dawa/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
          { src: "/brand/dawa/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
          { src: "/brand/dawa/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        categories: ["education", "books", "lifestyle"],
        lang: "es",
        dir: "ltr",
        related_applications: [{ platform: "webapp", url: "https://dawa.es/manifest.webmanifest" }],
        prefer_related_applications: false,
      },
      null,
      2
    ) + "\n",

  // Versi dawa.es dari pemeriksaan gerbang terjemahan mesin.
  "scripts/check-mt-targets.ts": `/**
 * Ke bahasa apa terjemahan mesin boleh diarahkan — versi dawa.es mandiri.
 *
 * dawa.es ditulis dalam satu bahasa: Spanyol. Konten sumber (Indonesia, Inggris,
 * Arab untuk teks non-kitab suci) diterjemahkan KE Spanyol, dan tidak ke bahasa
 * lain. Al-Qur'an dan matan hadits tidak pernah diterjemahkan mesin (lib/mt.ts).
 *
 *   npx tsx scripts/check-mt-targets.ts
 */
import { MT_TARGET_LANGS, machineTranslationAllowed, LOCALE_SITE } from "../packages/shared/src/i18n";

let failed = 0;
function check(what: string, got: unknown, want: unknown, why: string) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(\`  \${ok ? "ok  " : "FAIL"}  \${what.padEnd(44)} → \${JSON.stringify(got)} (expected \${JSON.stringify(want)})\`);
  if (!ok) console.log(\`        \${why}\`);
}

console.log("=== satu bahasa: Spanyol ===");
check("MT_TARGET_LANGS", [...MT_TARGET_LANGS], ["es"], "dawa.es hanya menyajikan bahasa Spanyol");
check("LOCALE_SITE", LOCALE_SITE, { es: "https://dawa.es" }, "tidak ada lagi situs saudara");

console.log("\\n=== sumber apa pun → Spanyol boleh ===");
check("id → es", machineTranslationAllowed("es", "id"), true, "konten ditulis dalam bahasa Indonesia");
check("en → es", machineTranslationAllowed("es", "en"), true, "tafsir/asbabun nuzul edisi Inggris");
check("ar → es", machineTranslationAllowed("es", "ar"), true, "judul kitab Arab; kitab suci sendiri di-mask di lib/mt.ts");

console.log("\\n=== selain itu tidak ===");
for (const code of ["id", "en", "fr", "de", "ru", "ar", "zh", "ja"]) {
  check(\`id → \${code}\`, machineTranslationAllowed(code, code === "id" ? "en" : "id"), false, "dawa.es tidak dirender dalam bahasa ini");
}
check("target kosong", machineTranslationAllowed("", "id"), false, "lang kosong tidak boleh jatuh ke terjemahan");
check("es → es", machineTranslationAllowed("es", "es"), false, "bahasa sama bukan terjemahan");

console.log("\\n=== prune menyisakan persis yang dilayani ===");
const kept = (k: string) => MT_TARGET_LANGS.includes(k.slice(6, 8));
for (const [key, want] of [
  ["mt:id-es:abc123", true],
  ["mt:en-es:abc123", true],
  ["mt:ar-es:abc123", true],
  ["mt:en-id:abc123", false],
  ["mt:id-fr:abc123", false],
  ["mt:id-de:abc123", false],
] as [string, boolean][]) {
  check(\`\${key} bertahan\`, kept(key), want, "scripts/prune-mt-unserved.ts memakai predikat yang sama");
}

console.log(failed === 0 ? "\\nALL OK" : \`\\n\${failed} FAILED\`);
process.exit(failed === 0 ? 0 : 1);
`,
};

/**
 * File BARU di proyek mandiri. Migrasi 0001–0056 tetap identik dengan ulyah-db
 * (supaya dump live bisa diimpor); pembersihan khusus dawa.es menjadi migrasi
 * tambahan yang berjalan sekali, di database baru maupun hasil impor.
 */
const NEW_FILES = {
  "packages/db-schema/migrations/0057_dawa_standalone.sql": `-- dawa.es MANDIRI — lepas dari ekosistem ulyah.com.
--
-- Migrasi 0037 menanam akun admin + demo untuk 1fr.fr dan tilawa.de, dan 0038
-- menanam paket haji/umrah untuk ulyah, 1fr dan tilawa. Di dawa.es mandiri akun
-- situs lain tidak boleh bisa login ke api.dawa.es, dan paket situs lain tidak
-- pernah tampil (halaman memfilter tenant='dawa'). tenant NULL = pemilik utama,
-- tetap. Relasi ke admin_users memakai ON DELETE SET NULL, jadi aman.
DELETE FROM admin_users WHERE tenant IS NOT NULL AND tenant <> 'dawa';
DELETE FROM hajj_package WHERE tenant <> 'dawa';
DELETE FROM tenant_pages WHERE tenant <> 'dawa';
`,
};

// ---------------------------------------------------------------------------
// 4. Workflow deploy khusus dawa.es
// ---------------------------------------------------------------------------

function splitSteps(yml) {
  const lines = yml.split("\n");
  const at = lines.findIndex((l) => /^    steps:\s*$/.test(l));
  if (at < 0) throw new Error("deploy.yml: baris `steps:` tidak ditemukan");
  const head = lines.slice(0, at + 1);
  const steps = [];
  let pending = [];
  for (const l of lines.slice(at + 1)) {
    if (/^      - /.test(l)) {
      steps.push({ lines: [...pending, l] });
      pending = [];
    } else if (/^      #/.test(l) || l.trim() === "") {
      pending.push(l);
    } else if (steps.length) {
      steps[steps.length - 1].lines.push(...pending, l);
      pending = [];
    } else {
      head.push(...pending, l);
      pending = [];
    }
  }
  if (steps.length) steps[steps.length - 1].lines.push(...pending);
  for (const s of steps) {
    const m = s.lines.join("\n").match(/^      - name: (.+)$/m);
    s.name = m ? m[1].trim() : null;
  }
  return { head, steps };
}

const DROP_STEPS = [
  "Ensure xad.es zone exists in Cloudflare (create if missing)",
  "Build web (Next.js via OpenNext)",
  "Deploy web",
  "Attach ulyah.com custom domains to web worker (overrides stale DNS)",
  "Build web for 1fr.fr tenant (One Faith France)",
  "Deploy 1fr.fr web (onefaith-web worker)",
  "Attach 1fr.fr custom domains to onefaith-web",
  "Build web for tilawa.de tenant (Tilawa)",
  "Deploy tilawa.de web (tilawa-web worker)",
  "Attach tilawa.de custom domains to tilawa-web",
  "Build web for xad.es tenant (Ulyah English)",
  "Deploy xad.es web (xad-web worker)",
  "Attach xad.es custom domains to xad-web",
];

function buildDeployYml(original) {
  const { head, steps } = splitSteps(original);
  const names = new Set(steps.map((s) => s.name));
  for (const n of DROP_STEPS) if (!names.has(n)) throw new Error(`deploy.yml: step "${n}" tidak ditemukan`);
  const kept = steps.filter((s) => !DROP_STEPS.includes(s.name));

  const patch = (name, find, replace) => {
    const s = kept.find((x) => x.name === name);
    if (!s) throw new Error(`deploy.yml: step "${name}" tidak ditemukan`);
    const text = s.lines.join("\n");
    const found = typeof find === "string" ? text.includes(find) : find.test(text);
    if (!found) throw new Error(`deploy.yml: "${String(find).slice(0, 60)}…" tidak ada di step "${name}"`);
    // Fungsi pengganti: "$" di teks bash (mis. "$COUNT") tidak boleh dibaca
    // sebagai pola penggantian String.replace.
    s.lines = text.replace(find, () => replace).split("\n");
  };

  patch(
    "Clean stale DNS records so Custom Domains can attach (all zones)",
    `          clean_zone ulyah.com ulyah.com www.ulyah.com api.dawa.es
          clean_zone 1fr.fr 1fr.fr www.1fr.fr
          clean_zone tilawa.de tilawa.de www.tilawa.de
          clean_zone dawa.es dawa.es www.dawa.es
          clean_zone xad.es xad.es www.xad.es`,
    `          # MANDIRI: hanya zona dawa.es (situs + api).
          clean_zone dawa.es dawa.es www.dawa.es api.dawa.es`
  );
  // Seed Qur'an yang bisa DILANJUTKAN. Di induk langkah ini semua-atau-tidak:
  // hanya berjalan kalau tabel surah kosong. Di akun Cloudflare gratis yang
  // baru, 11 bahasa + indeks melewati batas 100.000 baris tulis/hari; run
  // pertama terputus di tengah, run berikutnya melihat surah sudah terisi dan
  // melewati sisa bahasa SELAMANYA — dan Spanyol ada di urutan ke-6. Di sini
  // Spanyol diimpor tepat setelah teks Arab, tiap bahasa digerbang oleh jumlah
  // barisnya sendiri (satu file D1 = satu transaksi, jadi tidak ada setengah
  // bahasa), dan hanya Arab+Spanyol yang menggagalkan deploy.
  patch(
    "Seed Qur'an text + translations + curated content (idempotent)",
    // Seluruh blok lama, dari hitung surah sampai "skipping bulk seed" — regex
    // agar teks induknya tidak perlu disalin utuh di sini.
    /^ {10}npx wrangler d1 execute dawa-db --remote --command="SELECT COUNT\(\*\) AS n FROM surah;"[\s\S]*?skipping bulk seed\."\n {10}fi$/m,
    `          SEED=../../packages/db-schema/seed
          # count "<SQL yang mengembalikan kolom n>" — -1 kalau query gagal.
          count () {
            npx wrangler d1 execute dawa-db --remote --command="$1" --json 2>/dev/null \\
              | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s)[0].results[0].n)}catch(e){console.log(-1)}})"
          }
          apply () { npx wrangler d1 execute dawa-db --remote --file="$SEED/$1"; }

          # Teks Arab + terjemahan Indonesia (tabel surah/ayah). Wajib.
          if [ "$(count "SELECT COUNT(*) AS n FROM surah;")" = "0" ]; then
            echo "Database kosong — teks Al-Qur'an."
            apply quran_seed.sql
          fi

          # Spanyol DULU (satu-satunya bahasa dawa.es, wajib), lalu sisanya.
          for lang in es en ru de fr zh bn sv tr ur; do
            N=$(count "SELECT COUNT(*) AS n FROM translation WHERE lang='\${lang}';")
            if [ "$N" = "0" ]; then
              echo "Terjemahan $lang — impor."
              if ! apply "quran_seed_\${lang}.sql"; then
                if [ "$lang" = "es" ]; then echo "::error::Terjemahan Spanyol gagal diimpor."; exit 1; fi
                echo "::warning::Terjemahan $lang belum masuk (kemungkinan batas tulis D1 harian) — deploy berikutnya melanjutkan."
              fi
            elif [ "$N" = "-1" ]; then
              echo "::warning::Jumlah terjemahan $lang tidak bisa dibaca (kuota D1?) — dilewati kali ini."
            else
              echo "Terjemahan $lang sudah ada ($N baris)."
            fi
          done

          if [ "$(count "SELECT COUNT(*) AS n FROM tafsir;")" = "0" ]; then
            apply curated_content.sql || echo "::warning::curated_content.sql belum masuk — dicoba lagi deploy berikutnya."
          fi
          if [ "$(count "SELECT COUNT(*) AS n FROM stories WHERE series_key='kisah-nabi-yusuf';")" = "0" ]; then
            apply kisah_yusuf.sql || echo "::warning::kisah_yusuf.sql belum masuk — dicoba lagi deploy berikutnya."
          fi`
  );
  patch(
    "Smoke test sibling domains (non-fatal while DNS settles)",
    `for site in https://1fr.fr https://tilawa.de https://dawa.es https://xad.es; do`,
    `for site in https://dawa.es https://www.dawa.es; do`
  );
  patch(
    "Deploy dawa.es web (dawa-web worker)",
    `        # --var NEXT_INC_CACHE_R2_PREFIX: the rendered-page cache lives in ONE R2
        # bucket shared by all five tenants, so each needs its own namespace in
        # it. OpenNext's key already includes the Next build id, which differs
        # per build today — but that is a default, not a guarantee: set
        # generateBuildId to the git SHA (a common thing to do) and all five
        # tenants would collide and start serving each other's HTML. Naming the
        # prefix makes the separation explicit instead of accidental.`,
    `        # --var NEXT_INC_CACHE_R2_PREFIX: namespace cache halaman di bucket
        # dawa-next-cache. Bucket-nya sudah milik dawa.es sendiri; prefix
        # dipertahankan agar struktur kunci sama dengan sistem lama.`
  );

  const header = `name: Deploy to Cloudflare

# ============================================================================
# dawa.es — DEPLOY MANDIRI (lepas dari ekosistem ulyah.com)
#
# Dihasilkan oleh scripts/export-dawa-standalone.mjs dari deploy.yml ulyah.com:
# langkah-langkah untuk ulyah.com, 1fr.fr, tilawa.de dan xad.es dibuang, semua
# sumber daya diganti nama menjadi milik dawa.es sendiri:
#
#   Worker API  : dawa-api   -> https://api.dawa.es   (apps/worker-api)
#   Worker web  : dawa-web   -> https://dawa.es, https://www.dawa.es (apps/web)
#   D1          : dawa-db
#   KV          : dawa-cache
#   R2          : dawa-media (media) + dawa-next-cache (cache halaman)
#
# Push ke main -> buat D1/KV/R2 kalau belum ada -> migrasi D1 -> seed
# (idempoten) -> secret Worker -> deploy dawa-api -> build & deploy dawa-web ->
# pasang custom domain -> smoke test. Lihat PANDUAN-SETUP-DAWA-ES.md.
# ============================================================================
`;
  const body = head.join("\n").replace(/^name: Deploy to Cloudflare\n/, "");
  return header + body + "\n" + kept.map((s) => s.lines.join("\n")).join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// 5. CI khusus dawa.es
// ---------------------------------------------------------------------------

/** Pemeriksaan CI induk yang khusus ekosistem lima situs — tidak berlaku lagi. */
const CI_DROP = [
  // Memastikan lima situs tidak memutar qari yang sama di detik yang sama.
  // Dengan satu situs, tidak ada yang bisa bertabrakan.
  "Check no two sites recite in the same voice at the same moment",
  // Resiprositas hreflang antar lima domain ekosistem.
  "Check canonical urls and hreflang reciprocity",
];

function buildCiYml(original) {
  const { head, steps } = splitSteps(original);
  const names = new Set(steps.map((s) => s.name));
  for (const n of CI_DROP) if (!names.has(n)) throw new Error(`ci.yml: step "${n}" tidak ditemukan`);
  let text = head.join("\n") + "\n" + steps.filter((s) => !CI_DROP.includes(s.name)).map((s) => s.lines.join("\n")).join("\n") + "\n";
  const swaps = [
    ["for t in ulyah dawa 1fr tilawa xad; do", "for t in dawa; do"],
    ["(all five sites)", "(dawa.es)"],
    ["      - name: Build web (Next.js)\n        run: pnpm --filter @ulyah/web build\n        env:\n          NEXT_PUBLIC_API_URL: https://api.dawa.es",
     "      - name: Build web (Next.js)\n        run: pnpm --filter @ulyah/web build\n        env:\n          NEXT_PUBLIC_API_URL: https://api.dawa.es\n          NEXT_PUBLIC_TENANT: dawa"],
  ];
  for (const [a, b] of swaps) {
    if (!text.includes(a)) throw new Error(`ci.yml: "${a.slice(0, 50)}…" tidak ditemukan`);
    text = text.split(a).join(b);
  }
  return text;
}

// ---------------------------------------------------------------------------
// Jalankan
// ---------------------------------------------------------------------------

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function main() {
  if (!existsSync(GUIDE_SRC)) throw new Error(`Folder panduan tidak ada: ${relative(ROOT, GUIDE_SRC)}`);
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(PROJECT, { recursive: true });

  const excluded = new Map();
  const files = [];
  for (const f of gitFiles()) {
    const hit = EXCLUDE.find(([re]) => re.test(f));
    if (hit) {
      excluded.set(hit[1], (excluded.get(hit[1]) ?? 0) + 1);
      continue;
    }
    files.push(f);
  }

  // Salin + penggantian global.
  const touched = new Map();
  for (const f of files) {
    const src = join(ROOT, f);
    const dst = join(PROJECT, f);
    mkdirSync(dirname(dst), { recursive: true });
    if (!isText(f) || DATA_UNTOUCHED.test(f)) {
      copyFileSync(src, dst);
      continue;
    }
    let s = readFileSync(src, "utf8");
    for (const [a, b] of GLOBAL) {
      if (s.includes(a)) {
        s = s.split(a).join(b);
        touched.set(a, (touched.get(a) ?? 0) + 1);
      }
    }
    // User-Agent yang dikirim ke layanan luar (Google Translate, MyMemory,
    // penyedia AI, …) memperkenalkan diri sebagai dawa.es, bukan ulyah.com.
    const afterGlobal = s;
    s = s
      .split("\n")
      .map((l) =>
        /user-agent/i.test(l)
          ? l.replace(/ulyah\.com/g, "dawa.es").replace(/ulyah-(content-bot|kids-audio)/g, "dawa-$1")
          : l
      )
      .join("\n");
    if (s !== afterGlobal) touched.set("User-Agent", (touched.get("User-Agent") ?? 0) + 1);
    writeFileSync(dst, s);
    if (statSync(src).mode & 0o111) chmodSync(dst, statSync(src).mode);
  }

  // Suntingan spesifik.
  for (const e of EDITS) {
    const p = join(PROJECT, e.file);
    const s = readFileSync(p, "utf8");
    const found = typeof e.find === "string" ? s.includes(e.find) : e.find.test(s);
    if (typeof e.find !== "string") e.find.lastIndex = 0;
    if (!found) throw new Error(`Pola tidak ditemukan di ${e.file}:\n${String(e.find).slice(0, 200)}`);
    const out = typeof e.find === "string" ? s.split(e.find).join(e.replace) : s.replace(e.find, e.replace);
    writeFileSync(p, out);
  }

  // File yang ditulis ulang utuh.
  for (const [file, body] of Object.entries(WRITES)) {
    if (!existsSync(join(PROJECT, file))) throw new Error(`File untuk ditulis ulang tidak ada: ${file}`);
    writeFileSync(join(PROJECT, file), body);
  }

  for (const [file, body] of Object.entries(NEW_FILES)) {
    if (existsSync(join(PROJECT, file))) throw new Error(`File baru sudah ada di induk: ${file}`);
    writeFileSync(join(PROJECT, file), body);
  }

  // Env build web: tenant dawa + API dawa, selalu — juga untuk `next dev`.
  const envBody = `# dawa.es mandiri — dibaca otomatis oleh Next.js saat build/dev.
# Variabel dari shell/CI tetap menang atas file ini.
NEXT_PUBLIC_TENANT=dawa
NEXT_PUBLIC_API_URL=https://api.dawa.es
`;
  writeFileSync(join(PROJECT, "apps/web/.env.production"), envBody);
  writeFileSync(join(PROJECT, "apps/web/.env.development"), envBody);

  // Workflow.
  writeFileSync(
    join(PROJECT, ".github/workflows/deploy.yml"),
    buildDeployYml(readFileSync(join(PROJECT, ".github/workflows/deploy.yml"), "utf8"))
  );
  writeFileSync(
    join(PROJECT, ".github/workflows/ci.yml"),
    buildCiYml(readFileSync(join(PROJECT, ".github/workflows/ci.yml"), "utf8"))
  );

  // Panduan & alat database ke akar backup; README proyek diganti.
  cpSync(GUIDE_SRC, OUT, { recursive: true });
  for (const f of ["database/restore-d1.sh", "database/export-live-ulyah-db.sh", "database/import-to-dawa-db.sh"]) {
    const p = join(OUT, f);
    if (existsSync(p)) chmodSync(p, 0o755);
  }
  copyFileSync(join(GUIDE_SRC, "README-PROYEK.md"), join(PROJECT, "README.md"));
  rmSync(join(OUT, "README-PROYEK.md"));
  copyFileSync(join(GUIDE_SRC, "PANDUAN-SETUP-DAWA-ES.md"), join(PROJECT, "docs", "PANDUAN-SETUP-DAWA-ES.md"));
  writeFileSync(
    join(PROJECT, "docs", "SETUP.md"),
    "# SETUP\n\nPanduan lengkap setup dawa.es mandiri: [PANDUAN-SETUP-DAWA-ES.md](./PANDUAN-SETUP-DAWA-ES.md).\n"
  );

  // Laporan sisa rujukan ulyah.com di KODE (bukan komentar, bukan data).
  const leftovers = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const rel = relative(PROJECT, p);
      if (statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      if (!isText(rel) || DATA_UNTOUCHED.test(rel) || /\.md$/.test(rel)) continue;
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((l, i) => {
        if (!/ulyah\.com/i.test(l)) return;
        if (/^\s*(\/\/|\*|\/\*|#|--)/.test(l)) return;
        leftovers.push(`${rel}:${i + 1}: ${l.trim().slice(0, 180)}`);
      });
    }
  };
  walk(PROJECT);

  // Manifest: asal, tanggal, checksum setiap file.
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT }).toString().trim();
  const manifest = [];
  const walkAll = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walkAll(p);
      else manifest.push(`${sha256(readFileSync(p))}  ${relative(OUT, p)}`);
    }
  };
  walkAll(OUT);
  const now = new Date().toISOString();
  writeFileSync(
    join(OUT, "BACKUP-INFO.md"),
    [
      "# Info backup dawa.es",
      "",
      `- Dibuat: ${now}`,
      `- Sumber: repo \`p2nshooter/ulyah.com\`, commit \`${commit}\``,
      `- Generator: \`scripts/export-dawa-standalone.mjs\` (repo ulyah.com)`,
      `- Jumlah file proyek: ${files.length}`,
      "",
      "## Tidak ikut disalin",
      "",
      ...[...excluded].map(([why, n]) => `- ${n} file — ${why}`),
      "- node_modules, .next, .open-next, .wrangler — hasil build/instalasi, dibuat ulang oleh `pnpm install` & build",
      "- Audio murottal — tidak pernah disimpan di repo; diputar dari CDN qari (lihat AUDIO-CDN.md)",
      "",
      "## Penggantian global yang dilakukan",
      "",
      ...GLOBAL.map(([a, b]) => `- \`${a}\` → \`${b}\` (${touched.get(a) ?? 0} file)`),
      "",
      "## Sisa teks `ulyah.com` di baris kode (bukan komentar)",
      "",
      leftovers.length
        ? "Semua di bawah ini BUKAN koneksi jaringan: teks label/kamus yang di-rebrand otomatis saat runtime menjadi dawa.es (lib/rebrand.ts, dictionaries/index.ts), konfigurasi tenant lain yang tidak dipakai build dawa, atau panel admin ekosistem yang otomatis menyaring ke dawa saja. Detail: STANDALONE-CHANGES.md."
        : "Tidak ada.",
      "",
      "```",
      ...leftovers,
      "```",
      "",
    ].join("\n")
  );
  writeFileSync(join(OUT, "CHECKSUMS.sha256"), manifest.join("\n") + "\n");

  console.log(`Proyek mandiri: ${relative(ROOT, PROJECT) || PROJECT} (${files.length} file)`);
  console.log(`Sisa teks ulyah.com di baris kode: ${leftovers.length} (lihat BACKUP-INFO.md)`);

  if (args.zip === "true") {
    const stamp = now.slice(0, 10).replace(/-/g, "");
    const cwd = dirname(OUT);
    const base = relative(cwd, OUT);
    const seedRel = `${base}/dawa-es/packages/db-schema/seed`;
    const zipIt = (name, zipArgs) => {
      const zip = join(cwd, `dawa-es-backup-${stamp}${name}.zip`);
      rmSync(zip, { force: true });
      execFileSync("zip", ["-rq9", zip, ...zipArgs], { cwd, stdio: "inherit" });
      console.log(`Zip: ${zip} (${(statSync(zip).size / 1048576).toFixed(1)} MB)`);
    };
    // Satu zip utuh (±42 MB) …
    zipIt("", [base]);
    // … dan tiga zip biasa yang masing-masing di bawah 30 MB, untuk saluran
    // yang membatasi ukuran unggahan. Diekstrak ke folder yang sama, ketiganya
    // menyatu menjadi folder dawa-es-backup/ yang identik dengan zip utuh.
    const hadith = readdirSync(join(OUT, "dawa-es/packages/db-schema/seed"))
      .filter((f) => /^hadith_.*\.sql$/.test(f))
      .map((f) => `${seedRel}/${f}`);
    zipIt("-bagian1-kode-panduan", [base, "-x", `${seedRel}/*`]);
    zipIt("-bagian2-database-hadits", hadith);
    zipIt("-bagian3-database-lainnya", [seedRel, "-x", `${seedRel}/hadith_*.sql`]);
  }
}

main();
