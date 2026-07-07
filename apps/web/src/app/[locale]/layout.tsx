import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LOCALES, getLocale, isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlobalPlayerBar } from "@/components/GlobalPlayerBar";
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
      languages: Object.fromEntries(LOCALES.map((l) => [l.code, `/${l.code}`])),
    },
    manifest: "/manifest.json",
    icons: { icon: "/favicon.ico" },
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
