"use client";

import { useEffect } from "react";
import { PRESENCE_HEARTBEAT_MS } from "@ulyah/shared/presence";
import { getDeviceId } from "@/lib/device-id";
import { sendPresencePing } from "@/lib/presence";
import { useRadioStore } from "@/lib/radio-store";
import { usePlayerStore } from "@/lib/player-store";

/**
 * Presence heartbeat — while this page is open the admin can see how many real
 * devices are on each ecosystem site RIGHT NOW and how many just left
 * ("closed") — the owner's live per-device count, not page views. On
 * hide/close it fires a best-effort "leave" so the count drops immediately.
 *
 * Background-audio aware: these are read-aloud sites (Qur'an radio, murottal,
 * TTS narration), so a visitor very often keeps LISTENING with the screen off
 * or the app in the background. When audio is actively playing we keep counting
 * that device as ONLINE instead of marking it "closed" on the first
 * visibilitychange. The reliable background ping while the screen is off comes
 * from the radio <audio> element's timeupdate (see GlobalRadioPlayer) — mobile
 * freezes plain timers once the tab is hidden; here we simply avoid sending the
 * premature "leave" so that audio ticker can keep the device alive.
 *
 * Anonymous: the only thing sent is the random localStorage device token (same
 * one the pageview/install beacons use) — never a fingerprint.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";
// One beat per PRESENCE_HEARTBEAT_MS (30s), inside the admin's
// PRESENCE_ONLINE_WINDOW_S (45s) "online now" window — see
// packages/shared/src/presence.ts for why it is no longer 3s: at 3s every open
// tab cost twenty Worker requests and twenty D1 writes a minute, against a
// free plan that allows 100,000 of each per day for the whole account.
const HEARTBEAT_MS = PRESENCE_HEARTBEAT_MS;

function audioActive(): boolean {
  try {
    return useRadioStore.getState().playing || usePlayerStore.getState().isPlaying;
  } catch {
    return false;
  }
}

export function PresenceBeacon() {
  useEffect(() => {
    const device = getDeviceId();
    if (!device) return;
    const body = JSON.stringify({ device });

    // Ping while the page is visible OR while audio is actively playing (a
    // background listener still counts as a real, online device).
    const ping = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible" && !audioActive()) return;
      sendPresencePing(true, audioActive());
    };
    const leave = () => {
      const blob = new Blob([body], { type: "text/plain" });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(`${API_BASE}/analytics/leave`, blob);
      } else {
        fetch(`${API_BASE}/analytics/leave`, { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {});
      }
    };

    // "Left" is only true when nothing is playing. On a phone, switching to
    // another app fires pagehide even though the browser stays open and the
    // audio keeps going — reporting a leave there is exactly what made a radio
    // listener vanish from the live count.
    const leaveIfSilent = () => {
      if (!audioActive()) leave();
    };

    ping();
    const timer = window.setInterval(ping, HEARTBEAT_MS);
    // On hide: only mark "left" if NOTHING is playing. If audio is on, the
    // listener is still here — keep them online and let the audio ticker beat.
    const onVisibility = () => {
      if (document.visibilityState === "visible") ping();
      else if (!audioActive()) leave();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leaveIfSilent);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leaveIfSilent);
    };
  }, []);

  return null;
}
