"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

/**
 * Fires one lightweight, anonymous pageview beacon per navigation so the
 * admin portal's visitor analytics (daily/weekly/monthly/yearly, country
 * breakdown) reflect real traffic. Country is resolved server-side from
 * Cloudflare's own edge header — this beacon never sends personal data,
 * just the path and UI locale.
 */
export function AnalyticsBeacon({ locale }: { locale: string }) {
  const pathname = usePathname();

  useEffect(() => {
    api.post("/analytics/pageview", { path: pathname, locale }).catch(() => {});
  }, [pathname, locale]);

  return null;
}
