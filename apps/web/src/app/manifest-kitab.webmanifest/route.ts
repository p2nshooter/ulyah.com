import { NextResponse, type NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

// Generic fallback copy per locale — brand always the tenant's own.
const KITAB_COPY: Record<string, { name: string; desc: string; read: string }> = {
  id: {
    name: `Kitab Pesantren — ${TENANT.siteName}`,
    desc: "Kitab kuning digital lengkap: matan, terjemah, dan penjelasan — siap dipasang sebagai aplikasi tersendiri.",
    read: "Baca",
  },
  en: {
    name: `Kitab Library — ${TENANT.siteName}`,
    desc: "The complete digital classical texts: matn, translation, and explanation — installable as its own app.",
    read: "Read",
  },
  fr: {
    name: `Bibliothèque de Kitâb — ${TENANT.siteName}`,
    desc: "Les textes classiques numériques complets : matn, traduction et explication — installable comme application indépendante.",
    read: "Lire",
  },
  de: {
    name: `Kitāb-Bibliothek — ${TENANT.siteName}`,
    desc: "Die vollständigen klassischen Texte digital: Matn, Übersetzung und Erklärung — als eigene App installierbar.",
    read: "Lesen",
  },
  es: {
    name: `Biblioteca de Kitab — ${TENANT.siteName}`,
    desc: "Los textos clásicos digitales completos: matn, traducción y explicación — instalable como aplicación independiente.",
    read: "Leer",
  },
};

/**
 * Dynamic, PER-BOOK installable manifest for the Kitab Pesantren library —
 * "widget per buku" without needing a static manifest file for each of the
 * (growing) kitab collection. One flexible route, parameterised by
 * ?slug=<kitab-slug>&locale=<locale>, generates a real standalone-app
 * manifest named after that specific book, with its own install scope
 * (`/${locale}/kitab-pesantren/${slug}`) — so a visitor can put "Safinatun
 * Najah" on their home screen as its own icon, separate from "Ta'lim
 * Muta'allim" or any other widget, exactly like Radio/Sholat/Flipbook.
 *
 * The book title comes from the real API (never invented) — if the slug is
 * unknown the manifest still returns cleanly with a generic ULYAH name
 * rather than failing the whole page load.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("locale") ?? "";
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const slug = req.nextUrl.searchParams.get("slug") ?? "";

  const copy = KITAB_COPY[locale] ?? KITAB_COPY.en!;
  let name = copy.name;
  let shortName = "Kitab";
  let description = copy.desc;

  if (slug) {
    try {
      const res = await fetch(`${API_BASE}/content/pesantren/kitab/${slug}?lang=${locale}`, {
        // Manifests are fetched by the browser's install flow, not by a
        // visitor waiting on a page — a short cache keeps this cheap without
        // ever serving a badly-stale book title.
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = (await res.json()) as { kitab?: { title_id?: string; title_ar?: string } };
        if (data.kitab?.title_id) {
          name = `${data.kitab.title_id} — ${TENANT.siteName}`;
          shortName = data.kitab.title_id.length > 24 ? `${data.kitab.title_id.slice(0, 21)}…` : data.kitab.title_id;
          description = `${copy.read} ${data.kitab.title_id} (${data.kitab.title_ar ?? ""}) — matn, ${locale === "id" ? "terjemah, dan penjelasan, bisa didengarkan" : locale === "fr" ? "traduction et explication, avec audio" : locale === "de" ? "Übersetzung und Erklärung, mit Audio" : locale === "es" ? "traducción y explicación, con audio" : "translation, and explanation, with audio"}.`;
        }
      }
    } catch {
      /* fall through to the generic name below — never fail the manifest */
    }
  }

  const startUrl = slug ? `/${locale}/kitab-pesantren/${slug}` : `/${locale}/kitab-pesantren`;

  const manifest = {
    name,
    short_name: shortName,
    description,
    id: startUrl,
    start_url: startUrl,
    scope: startUrl,
    display: "standalone",
    orientation: "portrait",
    background_color: "#06251b",
    theme_color: "#0B3D2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["education", "books", "lifestyle"],
    lang: locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
