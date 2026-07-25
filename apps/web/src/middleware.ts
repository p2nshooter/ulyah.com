import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_SITE, isValidLocale, localeCanonicalUrl } from "@ulyah/shared/i18n";
import { localizedRoute, canonicalRoute } from "@ulyah/shared/routes";
import { KNOWN_LOCALE_PREFIXES, isUsable, pickLocale } from "@/lib/locale-detect";

const LOCALE_COOKIE = "ulyah_locale";

// Dynamic page show/hide (sibling sites). The admin portal marks pages hidden;
// the middleware always runs per-request (unlike a statically-cached page), so
// it is the reliable place to keep a hidden page unreachable. The hidden set is
// fetched from the content API and cached per-isolate for 60s. Fails OPEN.
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT ?? "ulyah";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";
let hiddenCache: { paths: string[]; at: number } | null = null;
let hiddenRefreshing = false;

/**
 * NON-BLOCKING hidden-page lookup: always answers instantly from the
 * per-isolate cache and refreshes it in the background at most once per
 * minute. The old version AWAITED a cross-worker fetch inside the middleware
 * on cold isolates — request latency + CPU per request is exactly the diet
 * that keeps Error 1102 ("Worker exceeded resource limits") away. Fails OPEN.
 */
function hiddenPathsCached(): string[] {
  if (TENANT_ID === "ulyah") return [];
  const now = Date.now();
  if ((!hiddenCache || now - hiddenCache.at >= 60_000) && !hiddenRefreshing) {
    hiddenRefreshing = true;
    fetch(`${API_BASE}/content/site-pages?tenant=${TENANT_ID}`)
      .then(async (res) => {
        if (res.ok) {
          const j = (await res.json()) as { pages?: { path: string; visible: boolean }[] };
          hiddenCache = { paths: (j.pages ?? []).filter((p) => !p.visible).map((p) => p.path), at: Date.now() };
        }
      })
      .catch(() => {
        /* fail open — keep serving the page */
      })
      .finally(() => {
        hiddenRefreshing = false;
      });
  }
  return hiddenCache?.paths ?? [];
}

function pathIsHidden(hidden: string[], pageless: string): boolean {
  for (const h of hidden) {
    if (h === pageless) return true;
    if (h !== "/" && pageless.startsWith(h + "/")) return true;
  }
  return false;
}

/**
 * Which languages the owner has switched ON, from the admin portal.
 *
 * Same non-blocking shape as the hidden-page lookup above: answers instantly
 * from a per-isolate cache and refreshes in the background at most once a
 * minute, so this costs the edge nothing per request (awaiting a cross-worker
 * fetch inside middleware is exactly what invites Error 1102).
 *
 * Until the first refresh lands — and if the API is unreachable — we fall back
 * to the built-in gate, which offers only the site's own language and the
 * sibling domains. That fallback is deliberately the RESTRICTIVE one: a blip
 * must never re-expose a half-translated language.
 */
let localeCache: { codes: string[]; at: number } | null = null;
let localeRefreshing = false;

function enabledLocales(): string[] | null {
  const now = Date.now();
  if ((!localeCache || now - localeCache.at >= 60_000) && !localeRefreshing) {
    localeRefreshing = true;
    fetch(`${API_BASE}/content/locales`)
      .then(async (res) => {
        if (!res.ok) return;
        const j = (await res.json()) as { enabled?: string[]; ok?: boolean };
        if (j.ok && Array.isArray(j.enabled)) localeCache = { codes: j.enabled, at: Date.now() };
      })
      .catch(() => {
        /* keep the previous answer, or the built-in gate */
      })
      .finally(() => {
        localeRefreshing = false;
      });
  }
  return localeCache?.codes ?? null;
}

/** A language may only be served if it is in this build AND switched on. */
const usable = (code: string) => isUsable(code, enabledLocales());

/** The decision itself lives in lib/locale-detect so it can be run and checked
 *  outside a request — see scripts/check-locale-detect.ts. */
function detectLocale(req: NextRequest): string {
  return pickLocale({
    cookie: req.cookies.get(LOCALE_COOKIE)?.value,
    // Cloudflare appends this at the edge — no geo-IP service needed.
    country: req.headers.get("cf-ipcountry"),
    acceptLanguage: req.headers.get("accept-language"),
    enabled: enabledLocales(),
    tenant: TENANT_ID,
  });
}

/**
 * The language alternates for this page, as an HTTP Link header.
 *
 * They used to be a single constant in the root layout pointing at the five
 * HOME pages, which meant every one of the 6,333 pages told Google "my French
 * version is 1fr.fr" — the home page, not the matching article. hreflang that
 * is not reciprocal is discarded, so the whole ecosystem graph counted for
 * nothing beyond the front door.
 *
 * A Link header is Google's documented equivalent of the <link> tag and is the
 * only way to make this page-specific without dragging every page into dynamic
 * rendering (headers() in a layout would do exactly that, and a 10 ms CPU
 * budget does not survive it). Each language points at ITS OWN url, with the
 * slug in its own language: the French alternate of /jadwal-sholat is
 * 1fr.fr/horaires-priere.
 */
// Indonesian and the four languages that own a domain are always live. Any
// other language joins the moment the owner switches it on in the admin portal
// — the same list the routing above acts on, so a language is never served
// without being announced, or announced without being served.
const ALWAYS_LIVE = ["id", "en", "fr", "de", "es"];

function withHreflang(res: NextResponse, route: string): NextResponse {
  const clean = route === "/" ? "" : route.replace(/\/+$/, "");
  const codes = [...ALWAYS_LIVE, ...(enabledLocales() ?? []).filter((c) => !ALWAYS_LIVE.includes(c))];
  const parts = codes.map(
    (code) => `<${localeCanonicalUrl(code, localizedRoute(clean, code))}>; rel="alternate"; hreflang="${code}"`
  );
  parts.push(`<${localeCanonicalUrl("id", clean)}>; rel="alternate"; hreflang="x-default"`);
  // append, not set: Next.js puts its own preload hints in Link too.
  res.headers.append("Link", parts.join(", "));
  return res;
}

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
};

function withSecurity(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Force HTTPS ONLY when we can prove the *client* used plain HTTP. Inside a
  // Cloudflare Worker (OpenNext) the internal req.nextUrl.protocol is often
  // "http:" even for an HTTPS visitor, and workers.dev never sets
  // x-forwarded-proto — trusting either of those made every request redirect
  // to itself forever (ERR_TOO_MANY_REDIRECTS, owner screenshot). The only
  // header that reflects the true client scheme at Cloudflare is cf-visitor
  // ({"scheme":"https"|"http"}); x-forwarded-proto is the standard-proxy
  // fallback. If neither says "http", assume HTTPS and do NOT redirect.
  const cfScheme = (() => {
    try {
      const v = req.headers.get("cf-visitor");
      return v ? (JSON.parse(v).scheme as string | undefined) : undefined;
    } catch {
      return undefined;
    }
  })();
  const clientProto = cfScheme ?? req.headers.get("x-forwarded-proto") ?? undefined;
  if (clientProto === "http") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return withSecurity(NextResponse.redirect(url, 301));
  }

  // ONE host per site. www.<domain> is attached to the same Worker as the apex
  // (see the deploy's "attach custom domains" step), so every page had a www
  // twin answering 200 with byte-identical content — 6,333 of them per site,
  // five sites. And the site's own language deliberately emits NO canonical
  // tag, because there is meant to be exactly one url per page, so nothing at
  // all told Google which of the pair to keep. Apex wins: it is what the
  // sitemap, robots.txt, hreflang and every internal link already say.
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = `https://${host.slice(4)}${pathname}${req.nextUrl.search}`;
    return withSecurity(NextResponse.redirect(url, 301));
  }

  // Skip static assets, API proxy routes, and Next internals.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // files like /favicon.ico, /manifest.json
  ) {
    return NextResponse.next();
  }

  // Explicit escape hatch: ?lang=<code> forces a language and rewrites the
  // sticky cookie, whatever it used to say. Without this, a visitor who once
  // opened /th had no way back — the cookie kept redirecting every bare URL to
  // /th. A plain link like ulyah.com/?lang=id now always works, from anywhere.
  const forced = req.nextUrl.searchParams.get("lang");
  if (forced && usable(forced)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");
    const segs = pathname.split("/");
    const bare = isValidLocale(segs[1] ?? "") ? "/" + segs.slice(2).join("/") : pathname;
    const clean = bare === "/" || bare === "" ? "" : bare.replace(/\/$/, "");
    url.pathname = forced === DEFAULT_LOCALE ? clean || "/" : `/${forced}${clean}`;
    const res = withSecurity(NextResponse.redirect(url, 307));
    res.cookies.set(LOCALE_COOKIE, forced, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  }

  // ── URLs in the site's own language ────────────────────────────────────
  // Route folders are named in Indonesian because that is what ulyah.com is
  // written in, and that leaked into the sibling sites — dawa.es advertising
  // /jadwal-sholat, tilawa.de /kalender-hijriyah. The words in a URL are a
  // ranking signal AND they are shown in the search result itself, so a Spanish
  // reader was being offered a link they could not read.
  //
  // Two halves, and together they keep exactly ONE indexable url per page:
  //  · a localized slug is rewritten onto the Indonesian route internally, so
  //    no page file moves and nothing is duplicated on disk;
  //  · the Indonesian slug on a non-Indonesian site redirects permanently to
  //    the localized one, so old links and any internal <Link> still work while
  //    search engines consolidate on the localized url.
  if (DEFAULT_LOCALE !== "id") {
    const canonical = canonicalRoute(pathname, DEFAULT_LOCALE);
    if (canonical) {
      const url = req.nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}${canonical}`;
      return withHreflang(withSecurity(NextResponse.rewrite(url)), canonical);
    }
    const localized = localizedRoute(pathname, DEFAULT_LOCALE);
    if (localized !== pathname) {
      const url = req.nextUrl.clone();
      url.pathname = localized;
      return withSecurity(NextResponse.redirect(url, 301));
    }
    // A deep Indonesian path (/kisah/…) on a sibling: redirect the section.
    const cut = pathname.indexOf("/", 1);
    if (cut > 0) {
      const head = pathname.slice(0, cut);
      const headLocalized = localizedRoute(head, DEFAULT_LOCALE);
      if (headLocalized !== head) {
        const url = req.nextUrl.clone();
        url.pathname = headLocalized + pathname.slice(cut);
        return withSecurity(NextResponse.redirect(url, 301));
      }
    }
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  // A language that is still being finished is not served at all — it is not
  // enough to hide it from the switcher, because a bookmark, an old link or a
  // stale cookie would still land a reader on a half-translated page. Those
  // URLs go to the same page in the site's own language, and the sticky cookie
  // is rewritten on the way so the visitor stays there.
  //
  // 307, deliberately, NOT 301: every one of these languages comes back as soon
  // as its content is warmed, and a permanent redirect cached in browsers would
  // keep sending readers away long after the language was ready.
  if (maybeLocale && isValidLocale(maybeLocale) && !usable(maybeLocale)) {
    const url = req.nextUrl.clone();
    const rest = "/" + segments.slice(2).join("/");
    url.pathname = rest === "/" ? "/" : rest.replace(/\/$/, "");
    const res = withSecurity(NextResponse.redirect(url, 307));
    res.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  }

  if (maybeLocale && isValidLocale(maybeLocale)) {
    // The site's OWN language never carries a URL prefix (owner: "default
    // ulyah.com adalah berbahasa Indonesia, tidak perlu /id" — and the same
    // for each sibling's native language). Old prefixed URLs 301 to the bare
    // path so exactly ONE URL serves each page.
    if (maybeLocale === DEFAULT_LOCALE) {
      const url = req.nextUrl.clone();
      const rest = "/" + segments.slice(2).join("/");
      url.pathname = rest === "/" ? "/" : rest;
      const res = withSecurity(NextResponse.redirect(url, 301));
      res.cookies.set(LOCALE_COOKIE, maybeLocale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
      return res;
    }
    // A language that has its OWN domain is not served here — it lives there.
    // ulyah.com/en/quran was rendering a noindex English twin of xad.es/quran:
    // two urls for one page, and the twin can never rank because we tell Google
    // not to index it. Send the reader (and the crawler) to the real one, with
    // the slug in that language, so the pair collapses into a single url.
    const ownSite = LOCALE_SITE[maybeLocale];
    if (ownSite) {
      const rest = "/" + segments.slice(2).join("/");
      const route = rest === "/" ? "" : rest.replace(/\/$/, "");
      return withSecurity(NextResponse.redirect(`${ownSite}${localizedRoute(route, maybeLocale)}`, 301));
    }

    // A page the admin has hidden for this sibling is sent home (unreachable).
    if (TENANT_ID !== "ulyah") {
      const pageless = "/" + segments.slice(2).join("/");
      if (pathIsHidden(hiddenPathsCached(), pageless === "/" ? "/" : pageless.replace(/\/$/, ""))) {
        return withSecurity(NextResponse.redirect(new URL("/", req.url)));
      }
    }
    const res = withHreflang(NextResponse.next(), "/" + segments.slice(2).join("/"));
    res.cookies.set(LOCALE_COOKIE, maybeLocale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  }

  // A known-but-not-enabled locale prefix (old /en/… URL on a native-only
  // sibling build) is REPLACED, permanently — never stacked in front of.
  const staleLocale = Boolean(maybeLocale && KNOWN_LOCALE_PREFIXES.has(maybeLocale));
  const pageless = staleLocale ? "/" + segments.slice(2).join("/") : pathname;

  const locale = detectLocale(req);
  if (locale === DEFAULT_LOCALE && !staleLocale) {
    // Bare URL in the site's own language: serve it AT the bare URL via an
    // internal rewrite — the visitor (and Google) only ever see ulyah.com/…
    // without /id (and 1fr.fr/… without /fr, etc.).
    if (TENANT_ID !== "ulyah" && pathIsHidden(hiddenPathsCached(), pathname.replace(/\/$/, "") || "/")) {
      return withSecurity(NextResponse.redirect(new URL("/", req.url)));
    }
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    const res = withHreflang(withSecurity(NextResponse.rewrite(url)), pathname);
    res.cookies.set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  }

  const url = req.nextUrl.clone();
  url.pathname =
    locale === DEFAULT_LOCALE
      ? pageless === "/" ? "/" : pageless
      : `/${locale}${pageless === "/" ? "" : pageless}`;
  const res = withSecurity(NextResponse.redirect(url, staleLocale ? 301 : 307));
  res.cookies.set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
