"use client";

import { getDeviceId } from "./device-id";

/**
 * Shared presence heartbeat — one anonymous device ping to the live-presence
 * table. Two callers use it:
 *   - PresenceBeacon: every few seconds while the page is visible (or while
 *     audio is playing), the normal foreground signal.
 *   - GlobalRadioPlayer: on the radio <audio> element's `timeupdate`, which
 *     keeps firing WHILE audio plays even after the screen locks / the app is
 *     backgrounded. This is the reliable background ticker — plain setInterval
 *     is throttled to ~once/minute (or frozen) on mobile once the tab is
 *     hidden, so a listener who only keeps Qur'an radio on with the screen off
 *     would otherwise be counted "closed" within 5s. The audio clock is not
 *     throttled while it actually plays, so pinging from it keeps such a
 *     background listener correctly counted as ONLINE.
 *
 * Anonymous: the only thing sent is the random localStorage device token —
 * never a fingerprint. Body is text/plain so the cross-origin POST needs no
 * CORS preflight. Throttled to 3s so it comfortably refreshes the admin's 5s
 * "online now" window without spamming the API.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";
const MIN_INTERVAL_MS = 3000;

let lastSent = 0;

/** Send a presence ping now, unless one was sent within the throttle window. */
export function sendPresencePing(force = false): void {
  const now = Date.now();
  if (!force && now - lastSent < MIN_INTERVAL_MS) return;
  const device = getDeviceId();
  if (!device) return;
  lastSent = now;
  fetch(`${API_BASE}/analytics/ping`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ device }),
    keepalive: true,
  }).catch(() => {});
}
