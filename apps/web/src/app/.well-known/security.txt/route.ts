import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";

/**
 * https://<site>/.well-known/security.txt (RFC 9116) — where to report a security problem: the
 * address the legal pages already publish. Built on every deploy, so its expiry (just under a
 * year) moves along. dawa.es is no longer the owner's: its tenant gets nothing new.
 */
export const dynamic = "force-static";

export function GET() {
  if (TENANT.id === "dawa") return new Response("Not found\n", { status: 404 });
  const expires = new Date(Date.now() + 360 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, ".000Z");
  const text = [
    "Contact: mailto:salam@ulyah.com",
    `Expires: ${expires}`,
    `Preferred-Languages: ${[...new Set([DEFAULT_LOCALE, "en", "id"])].join(", ")}`,
    `Canonical: ${TENANT.siteUrl}/.well-known/security.txt`,
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
