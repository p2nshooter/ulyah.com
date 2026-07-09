import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LOCALES, getLocale, isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlobalPlayerBar } from "@/components/GlobalPlayerBar";
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
  return {
    title: `${dict.common.siteName} — ${dict.common.tagline}`,
    description: dict.hero.description,
    metadataBase: new URL("https://ulyah.com"),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l.code, `/${l.code}`])),
    },
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: `${dict.common.siteName} — ${dict.common.tagline}`,
      description: dict.hero.description,
      url: `https://ulyah.com/${locale}`,
      siteName: "Ulyah",
      images: [{ url: "/icon-512.png", width: 512, height: 512 }],
      locale,
      type: "website",
    },
    robots: { index: true, follow: true },
    keywords: [
      "Al-Quran", "Quran audio", "murottal", "tafsir", "hadits", "kisah nabi",
      "Islamic audiobook", "listen to Quran", "Quran online", "kajian Islam",
    ],
    // AdSense site verification (also present as the <script> tag in <head>).
    other: { "google-adsense-account": "ca-pub-6371903555702163" },
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
    <html lang={locale} dir={localeDef.dir} suppressHydrationWarning>
      <head>
        {/* Apply the theme class before paint — avoids a flash of the wrong
            theme and ensures Tailwind's `dark:` variant is correct from the
            very first frame (ThemeProvider's effect runs one tick later). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ulyah_theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`,
          }}
        />
        {/* Premium typography: Quranic Arabic + classical serif + clean UI sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;600;700&family=Cinzel:wght@400;600&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ulyah",
              alternateName: "Ulyah — Listen to Islam",
              url: "https://ulyah.com",
              inLanguage: LOCALES.map((l) => l.code),
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `https://ulyah.com/${locale}/cari?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6371903555702163"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Ezoic */}
        <Script async src="//www.ezojs.com/ezoic/sa.min.js" strategy="afterInteractive" />
        <Script id="ezstandalone-init" strategy="afterInteractive">
          {`window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];`}
        </Script>
        <Script src="//ezoicanalytics.com/analytics.js" strategy="afterInteractive" />
      </head>
      <body className={localeDef.dir === "rtl" ? "font-arabic-ui" : ""}>
        <SwRegister />
        <AnalyticsBeacon locale={locale} />
        <ThemeProvider>
          <Header locale={locale} dict={dict} />
          <main className="min-h-screen pb-24">{children}</main>
          <Footer locale={locale} dict={dict} />
          <GlobalPlayerBar dict={dict} />
        </ThemeProvider>
      </body>
    </html>
  );
}
