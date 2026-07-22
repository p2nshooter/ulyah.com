import type { Metadata, Viewport } from "next";
import { LOCALES, getLocale, isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { TENANT, tenantTagline } from "@/lib/tenant";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlobalPlayerBar } from "@/components/GlobalPlayerBar";
import { GlobalRadioPlayer } from "@/components/GlobalRadioPlayer";
import { AdhanReminder } from "@/components/AdhanReminder";
import { GlobalReadAll } from "@/components/GlobalReadAll";
import { AdSlot } from "@/components/AdSlot";
import { FloatingAiChat } from "@/components/FloatingAiChat";
import { SwRegister } from "@/components/SwRegister";
import { TrafficBeacon } from "@/components/TrafficBeacon";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
// Modular CSS architecture (src/styles/README.md): tokens+base → shared
// animations → components → per-site themes (last, so tenant tokens win).
import "../globals.css";
import "@/styles/core/animations.css";
import "@/styles/components/mushaf.css";
import "@/styles/components/kids.css";
import "@/styles/components/sanad.css";
import "@/styles/components/ornaments.css";
import "@/styles/components/worldcup.css";
import "@/styles/themes/ulyah.css";
import "@/styles/themes/france.css";
import "@/styles/themes/germany.css";
import "@/styles/themes/spain.css";
import "@/styles/themes/xad.css";

// The ecosystem hreflang cluster (owner: Update Global Seluruh Portal §3):
// every page on every site declares its language siblings across DOMAINS —
// id → ulyah.com, en → xad.es, fr → 1fr.fr, de → tilawa.de, es → dawa.es,
// with ulyah.com as x-default. Google then treats the sites as translations
// of one another instead of flagging duplicates.
const HREFLANG_CLUSTER: Record<string, string> = {
  id: "https://ulyah.com",
  en: "https://xad.es",
  fr: "https://1fr.fr",
  de: "https://tilawa.de",
  es: "https://dawa.es",
  "x-default": "https://ulyah.com",
};

export function generateStaticParams() {
  return LOCALES.map((l) => ({ locale: l.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  // Every non-default tenant (1fr, tilawa, …) must brand with its OWN siteName,
  // not the shared dictionary's (which still resolves to "ulyah" and leaked a
  // stray "ulyah — …" into the tilawa.de browser tab — owner screenshot).
  const siteName = TENANT.id !== "ulyah" ? TENANT.siteName : dict.common.siteName;
  const tagline = TENANT.id !== "ulyah" ? tenantTagline(locale, dict.common.tagline) : dict.common.tagline;
  return {
    // A tenant-scoped title template so EVERY child page's tab title carries
    // the right brand (never a stray "ULYAH.COM" on a sibling). Child pages
    // that return a plain-string title get "<their title> — <brand>"; the home
    // page uses `default`.
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s — ${TENANT.siteName}`,
    },
    description: dict.hero.description,
    metadataBase: new URL(TENANT.siteUrl),
    alternates: {
      // Self-referencing canonical on EVERY page ("./" resolves against the
      // current route) — the old `/${locale}` made every child page
      // canonicalize to the locale home, which is exactly the "Alternate
      // page with canonical" / "Duplicate without user-selected canonical"
      // mess Google Search Console reported. The DEFAULT locale is served at
      // BARE URLs (no /id — middleware rewrite) and its prefixed twins 301
      // there, so it emits no canonical at all: only one URL ever serves the
      // content.
      ...(locale === DEFAULT_LOCALE ? {} : { canonical: "./" }),
      languages: HREFLANG_CLUSTER,
    },
    // One language per DOMAIN. ulyah.com is Indonesian-only now — the other
    // languages each live on their own ecosystem domain (en→xad.es, fr→1fr.fr,
    // de→tilawa.de, es→dawa.es). ulyah.com's non-Indonesian locale routes still
    // render (so the header can show them struck-through) but must NOT be
    // indexed, or they'd duplicate the sibling domains and fail AdSense/Search
    // Console duplicate checks. Siblings serve only their own language, so this
    // only ever fires on the ulyah tenant.
    ...(TENANT.id === "ulyah" && locale !== DEFAULT_LOCALE
      ? { robots: { index: false, follow: true } }
      : {}),
    manifest: `/manifest.webmanifest?locale=${locale}`,
    icons:
      TENANT.id === "ulyah"
        ? {
            icon: [
              { url: "/favicon.ico" },
              { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
              { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
            apple: "/apple-touch-icon.png",
          }
        : TENANT.id === "dawa"
          ? {
              // Owner-provided round emblem as the browser-tab favicon, the
              // square artwork for home-screen/apple icons. The ?v= query busts
              // the browser's own favicon cache AND the service-worker png cache
              // (both key on the full URL) so a device that once fetched a
              // placeholder favicon re-fetches the real artwork — the reason the
              // owner kept seeing the old icon after it was already replaced.
              icon: [
                { url: "/brand/dawa/favicon.png?v=2", sizes: "64x64", type: "image/png" },
                { url: "/brand/dawa/favicon-256.png?v=2", sizes: "256x256", type: "image/png" },
              ],
              apple: "/brand/dawa/icon-180.png?v=2",
            }
          : TENANT.id === "xad"
            ? {
                // xad.es (English member) — its own crisp SVG emblem as the
                // browser-tab favicon + home-screen icon, so it reads as its own
                // product, not a clone of ulyah.com.
                icon: [
                  { url: "/brand/xad/favicon.svg", type: "image/svg+xml" },
                  { url: "/brand/xad/icon.svg", sizes: "512x512", type: "image/svg+xml" },
                ],
                apple: "/brand/xad/icon.svg",
              }
            : { icon: [{ url: TENANT.logoIcon, type: "image/png" }], apple: TENANT.logoIcon },
    openGraph: {
      title: `${siteName} — ${tagline}`,
      description: dict.hero.description,
      url: `${TENANT.siteUrl}/${locale}`,
      siteName: TENANT.siteName,
      images: [{ url: "/icon-512.png", width: 512, height: 512 }],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} — ${tagline}`,
      description: dict.hero.description,
      images: ["/icon-512.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    keywords: [
      "Al-Quran", "Quran audio", "murottal", "tafsir", "hadits", "kisah nabi",
      "Islamic audiobook", "listen to Quran", "Quran online", "kajian Islam",
    ],
  };
}

export const viewport: Viewport = {
  // The browser/PWA chrome colour must match EACH site (owner: "warna aplikasi
  // harus seimbang dengan website"), not a baked-in emerald: 1fr navy, tilawa
  // charcoal, dawa terracotta, ulyah emerald.
  themeColor:
    TENANT.id === "1fr"
      ? "#17294a"
      : TENANT.id === "tilawa"
        ? "#14181d"
        : TENANT.id === "dawa"
          ? "#8a3b12"
          : TENANT.id === "xad"
            ? "#281a4d"
            : "#0B3D2E",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const localeDef = getLocale(locale);
  const dict = getDictionary(locale);

  return (
    <html lang={locale} dir={localeDef.dir} data-tenant={TENANT.id} data-culture={locale} suppressHydrationWarning>
      <head>
        {/* Apply the theme class before paint — avoids a flash of the wrong
            theme and ensures Tailwind's `dark:` variant is correct from the
            very first frame (ThemeProvider's effect runs one tick later). */}
        <script
          dangerouslySetInnerHTML={{
            // Each sibling has a SIGNATURE default theme so it reads as its own
            // product on first paint: 1fr.fr opens light (ivory editorial),
            // tilawa.de opens dark (graphite technical), dawa.es opens light
            // (sunny Mediterranean), ulyah follows the OS. A saved preference
            // always wins.
            __html: `(function(){try{var el=document.documentElement;var tn=el.getAttribute("data-tenant");var def=tn==="1fr"?"light":tn==="tilawa"?"dark":tn==="dawa"?"light":(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var t=localStorage.getItem("ulyah_theme")||def;el.setAttribute("data-theme",t);el.classList.toggle("dark",t==="dark");}catch(e){}})();`,
          }}
        />
        {/* Per-tenant typography — each sibling site has its OWN type system so
            it reads as a different product: ulyah = Cinzel (classical/ornate),
            1fr.fr = Cormorant Garamond (elegant French editorial serif),
            tilawa.de = Space Grotesk (modern German geometric sans). Arabic
            (Scheherazade/Amiri) and the UI sans are shared. */}
        {/* Sitemap planted in the landing page itself, so the whole site is
            discoverable from just the root domain (owner: "sitemap-nya tanem di
            landing page, biar cukup https://tilawa.de & https://1fr.fr"). Both
            the XML and the robust plain-text list point at THIS tenant's URL. */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={
            TENANT.id === "1fr"
              ? "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&display=swap"
              : TENANT.id === "tilawa"
                ? "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
                : TENANT.id === "dawa"
                  ? "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;600;700&family=Marcellus&family=Nunito:wght@300;400;600;700;800&display=swap"
                  : "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;600;700&family=Cinzel:wght@400;600&family=Lato:wght@300;400;700&display=swap"
          }
          rel="stylesheet"
        />
        {/* Structured data for SEO — WebSite (with SearchAction) + Organization,
            both valid against Google's Rich Results Test. Page-level types
            (Article, Book, …) are emitted by the individual pages. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: TENANT.siteName,
              alternateName:
                TENANT.id === "1fr"
                  ? "1FR — One Faith France"
                  : TENANT.id === "tilawa"
                    ? "Tilawa — Islam hören"
                    : TENANT.id === "dawa"
                      ? "Dawa — El Islam en Español"
                      : "Ulyah — Listen to Islam",
              url: TENANT.siteUrl,
              inLanguage: LOCALES.map((l) => l.code),
              publisher: { "@type": "Organization", name: TENANT.siteName, url: TENANT.siteUrl },
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${TENANT.siteUrl}/${locale}/cari?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Organization schema is per-tenant — a sibling site must never
            declare itself as the ULYAH organization (branding leak). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: TENANT.siteName,
              url: TENANT.siteUrl,
              logo: `${TENANT.siteUrl}${TENANT.id === "ulyah" ? "/icon-512.png" : TENANT.logoIcon}`,
              description: dict.hero.description,
            }),
          }}
        />
        {/* Capture `beforeinstallprompt` the instant it fires. Android Chrome
            dispatches it during page load — BEFORE React hydrates and the
            InstallAppButton's effect can attach a listener — so the event was
            being missed on every visit and the install button only ever showed
            the manual "add to home screen" fallback ("ga bisa install app").
            Stashing the event on window here (runs in <head>, before hydration)
            means the button always finds a real prompt to fire. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){window.__bipEvent=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bipEvent=e;window.dispatchEvent(new Event('bip-ready'));});window.addEventListener('appinstalled',function(){window.__bipEvent=null;});})();`,
          }}
        />
        {/* Google AdSense on EVERY page of EVERY site (owner: Update Global
            Seluruh Portal §2). The async loader never blocks rendering. */}
        <meta name="google-adsense-account" content="ca-pub-6371903555702163" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6371903555702163"
          crossOrigin="anonymous"
        />
      </head>
      <body className={localeDef.dir === "rtl" ? "font-arabic-ui" : ""}>
        <SwRegister />
        <TrafficBeacon />
        <AnalyticsBeacon locale={locale} />
        <ThemeProvider>
          <Header locale={locale} dict={dict} />
          <main className="min-h-screen pb-24">{children}</main>
          {/* One tasteful ad above the footer on every page — off by default,
              controlled centrally from the ulyah.com admin (AdSlot renders
              nothing until the site is enabled + an ad-unit id is set). */}
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <AdSlot placement="footer" />
          </div>
          <Footer locale={locale} dict={dict} />
          <GlobalPlayerBar dict={dict} />
          {/* Owns the Radio Qori audio element so the broadcast survives
              in-app navigation (only a manual stop halts it). */}
          <GlobalRadioPlayer />
          {/* Adhan prayer-time reminder — default ON, remembered OFF. */}
          <AdhanReminder locale={locale} />
          {/* Universal "Baca Semua / Terjemahan / Arab" on every menu. Hides
              itself on pages that ship their own richer reader. */}
          <GlobalReadAll locale={locale} />
          {/* Floating "Tanya AI" bubble on every page (bottom-right). */}
          <FloatingAiChat locale={locale} />
        </ThemeProvider>
      </body>
    </html>
  );
}
