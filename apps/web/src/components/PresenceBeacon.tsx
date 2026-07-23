"use client";

import { useEffect } from "react";
import { getDeviceId } from "@/lib/device-id";
import { sendPresencePing } from "@/lib/presence";
import { useRadioStore } from "@/lib/radio-store";
import { usePlayerStore } from "@/lib/player-store";

/**
 * Presence heartbeat — while this page is open the admin can see, within ~3
 * seconds, how many real devices are on each ecosystem site RIGHT NOW and how
 * many just left ("closed") — the owner's live per-device count, not page
 * views. On hide/close it fires a best-effort "leave" so the count drops
 * immediately.
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
// Beat every 3s so a device's last-seen is always ≤3s old — comfortably inside
// the admin's 5s "online now" window (no flicker), and it drops within ~5s of
// closing (owner: "online skrg kondisi detik ini, turun-naik ≤5 detik").
const HEARTBEAT_MS = 3000;

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
      sendPresencePing(true);
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
    // On hide: only mark "left" if NOTHING is playing. If audio is on, the
    // listener is still here — keep them online and let the audio ticker beat.
    const onVisibility = () => {
      if (document.visibilityState === "visible") ping();
      else if (!audioActive()) leave();
    };
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
