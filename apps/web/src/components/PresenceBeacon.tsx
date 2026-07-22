"use client";

import { useEffect } from "react";
import { getDeviceId } from "@/lib/device-id";

/**
 * Presence heartbeat — while this page is open and visible, it pings the API
 * every few seconds so the ulyah.com admin can show, within ~3 seconds, how
 * many real devices are on each ecosystem site RIGHT NOW and how many just
 * left ("closed") — the owner's live per-device count, not page views. On
 * hide/close it fires a best-effort "leave" so the count drops immediately.
 *
 * Anonymous: the only thing sent is the random localStorage device token
 * (same one the pageview/install beacons use) — never a fingerprint. Bodies
 * are text/plain so the cross-origin beacon needs no CORS preflight.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";
const HEARTBEAT_MS = 5000; // every 5s while visible → admin sees ≤~3s freshness on its own poll

export function PresenceBeacon() {
  useEffect(() => {
    const device = getDeviceId();
    if (!device) return;
    const body = JSON.stringify({ device });

    const ping = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      fetch(`${API_BASE}/analytics/ping`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body,
        keepalive: true,
      }).catch(() => {});
    };
    const leave = () => {
      const blob = new Blob([body], { type: "text/plain" });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(`${API_BASE}/analytics/leave`, blob);
      } else {
        fetch(`${API_BASE}/analytics/leave`, { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {});
      }
    };

    ping();
    const timer = window.setInterval(ping, HEARTBEAT_MS);
    const onVisibility = () => (document.visibilityState === "visible" ? ping() : leave());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
    };
  }, []);

  return null;
}
