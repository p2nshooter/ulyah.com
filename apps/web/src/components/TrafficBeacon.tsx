"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TENANT } from "@/lib/tenant";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

/**
 * Cookieless pageview beacon so ulyah.com AND every sibling (1fr.fr, tilawa.de,
 * dawa.es) show up in the admin "Network Traffic" panel — the same panel the
 * article sites already feed (owner: "pastiin semua situs bisa kelihatan
 * trafic-nya di portal"). Sends { site: TENANT.id, path } to /track on every
 * navigation. text/plain body is a CORS-safelisted type, so there is no
 * preflight; every failure is swallowed (analytics must never break a page).
 */
export function TrafficBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const body = JSON.stringify({ site: TENANT.id, path: pathname || "/" });
      const url = `${API_BASE}/track`;
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
      } else {
        fetch(url, {
          method: "POST",
          body,
          headers: { "Content-Type": "text/plain" },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* never break the page for analytics */
    }
  }, [pathname]);
  return null;
}
