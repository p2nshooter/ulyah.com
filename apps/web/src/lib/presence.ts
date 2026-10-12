"use client";

import { PRESENCE_HEARTBEAT_MS } from "@ulyah/shared/presence";
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
 *     would otherwise be counted "closed" once the online window lapsed. The audio clock is not
 *     throttled while it actually plays, so pinging from it keeps such a
 *     background listener correctly counted as ONLINE.
 *
 * Anonymous: the only thing sent is the random localStorage device token —
 * never a fingerprint. Body is text/plain so the cross-origin POST needs no
 * CORS preflight. Throttled to just under the shared heartbeat
 * (@ulyah/shared/presence) so the audio ticker, which fires several times a
 * second, still sends one ping per beat and never more.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";
const MIN_INTERVAL_MS = PRESENCE_HEARTBEAT_MS - 5000;

let lastSent = 0;

/**
 * Send a presence ping now, unless one was sent within the throttle window.
 *
 * `listening` marks a device that has audio playing — the radio or the ayah
 * player. It carries no extra information about the person; it only lets the
 * admin see that, say, 9 of 12 people online right now have the Qur'an on
 * rather than guessing.
 */
export function sendPresencePing(force = false, listening = false): void {
  const now = Date.now();
  if (!force && now - lastSent < MIN_INTERVAL_MS) return;
  const device = getDeviceId();
  if (!device) return;
  lastSent = now;
  fetch(`${API_BASE}/analytics/ping`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ device, listening }),
    keepalive: true,
  }).catch(() => {});
}
