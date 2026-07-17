import type { Metadata, Viewport } from "next";
import { LOCALES, getLocale, isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { TENANT, tenantTagline } from "@/lib/tenant";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlobalPlayerBar } from "@/components/GlobalPlayerBar";
import { GlobalRadioPlayer } from "@/components/GlobalRadioPlayer";
import { FloatingAiChat } from "@/components/FloatingAiChat";
import { SwRegister } from "@/components/SwRegister";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import "../globals.css";

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
  const siteName = TENANT.id === "1fr" ? TENANT.siteName : dict.common.siteName;
  const tagline = TENANT.id === "1fr" ? tenantTagline(locale, dict.common.tagline) : dict.common.tagline;
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
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l.code, `/${l.code}`])),
    },
    manifest: "/manifest.json",
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
  themeColor: "#0B3D2E",
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
    <html lang={locale} dir={localeDef.dir} data-tenant={TENANT.id} suppressHydrationWarning>
      <head>
        {/* Apply the theme class before paint — avoids a flash of the wrong
            theme and ensures Tailwind's `dark:` variant is correct from the
            very first frame (ThemeProvider's effect runs one tick later). */}
        <script
          dangerouslySetInnerHTML={{
            // Each sibling has a SIGNATURE default theme so it reads as its own
            // product on first paint: 1fr.fr opens light (ivory editorial),
            // tilawa.de opens dark (graphite technical), ulyah follows the OS.
            // A saved preference always wins.
            __html: `(function(){try{var el=document.documentElement;var tn=el.getAttribute("data-tenant");var def=tn==="1fr"?"light":tn==="tilawa"?"dark":(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var t=localStorage.getItem("ulyah_theme")||def;el.setAttribute("data-theme",t);el.classList.toggle("dark",t==="dark");}catch(e){}})();`,
          }}
        />
        {/* Per-tenant typography — each sibling site has its OWN type system so
            it reads as a different product: ulyah = Cinzel (classical/ornate),
            1fr.fr = Cormorant Garamond (elegant French editorial serif),
            tilawa.de = Space Grotesk (modern German geometric sans). Arabic
            (Scheherazade/Amiri) and the UI sans are shared. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={
            TENANT.id === "1fr"
              ? "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&display=swap"
              : TENANT.id === "tilawa"
                ? "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
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
              alternateName: TENANT.id === "1fr" ? "1FR — One Faith France" : "Ulyah — Listen to Islam",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ULYAH.COM",
              url: "https://ulyah.com",
              logo: "https://ulyah.com/icon-512.png",
              description: "Al-Qur'an, tafsir, hadits, dan kisah Islami — dibaca dan didengarkan dengan suara.",
            }),
          }}
        />
        {/* This site shows NO ads anywhere — no AdSense, no Adsterra. This
            meta tag only proves domain ownership for a future AdSense
            application; it does not load any ad script and never will on its
            own. */}
        <meta name="google-adsense-account" content="ca-pub-6371903555702163" />
      </head>
      <body className={localeDef.dir === "rtl" ? "font-arabic-ui" : ""}>
        <SwRegister />
        <AnalyticsBeacon locale={locale} />
        <ThemeProvider>
          <Header locale={locale} dict={dict} />
          <main className="min-h-screen pb-24">{children}</main>
          <Footer locale={locale} dict={dict} />
          <GlobalPlayerBar dict={dict} />
          {/* Owns the Radio Qori audio element so the broadcast survives
              in-app navigation (only a manual stop halts it). */}
          <GlobalRadioPlayer />
          {/* Floating "Tanya AI" bubble on every page (bottom-right). */}
          <FloatingAiChat locale={locale} />
        </ThemeProvider>
      </body>
    </html>
  );
}
