"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { qiblaLabels } from "@/lib/qibla-labels";
import { qiblaBearing, qiblaDistanceKm } from "@/lib/qibla";

interface GeoResponse {
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface OrientationEventWithCompass extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}
interface DeviceOrientationEventStatic {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
}

function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Qibla compass — direction + distance to the Kaaba from the visitor's
 * IP-detected location (same zero-permission GET /geo/me the prayer widget
 * uses), now with an optional LIVE compass that follows the phone's own
 * magnetometer: once enabled, the whole dial rotates with the device so the
 * gold qibla arrow points at the real qibla as you turn — "arah kiblatnya
 * yg bisa mengikuti gerak HP". The sensor needs a user gesture to start
 * (iOS also needs an explicit permission grant), so it's opt-in via a button;
 * without a sensor it falls back to the honest fixed bearing-from-North.
 */
export function QiblaCompass({ locale }: { locale: string }) {
  const t = qiblaLabels(locale);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityLabel, setCityLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [heading, setHeading] = useState<number | null>(null);
  const [compassOn, setCompassOn] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    let done = false;
    const useIp = () => {
      api
        .get<GeoResponse>("/geo/me")
        .then((g) => {
          if (done) return;
          if (g.latitude && g.longitude) {
            setCoords({ lat: g.latitude, lng: g.longitude });
            setCityLabel(g.city ?? g.country ?? null);
          } else {
            setFailed(true);
          }
        })
        .catch(() => !done && setFailed(true))
        .finally(() => !done && setLoading(false));
    };

    // Prefer REAL GPS position (where the person actually stands) — IP
    // geolocation is city-grade and often wrong behind VPN/proxy, which made
    // the qibla "ancur". Fall back to IP only if GPS is denied/unavailable.
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          done = true;
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCityLabel("📍 GPS");
          setLoading(false);
        },
        () => useIp(),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      useIp();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener("deviceorientationabsolute", listenerRef.current as EventListener);
        window.removeEventListener("deviceorientation", listenerRef.current as EventListener);
      }
    };
  }, []);

  async function enableCompass() {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setUnsupported(true);
      return;
    }
    // iOS 13+ requires an explicit permission grant from a user gesture.
    const DOE = window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
    if (typeof DOE.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          setUnsupported(true);
          return;
        }
      } catch {
        setUnsupported(true);
        return;
      }
    }
    let gotReading = false;
    const handler = (e: DeviceOrientationEvent) => {
      const ev = e as OrientationEventWithCompass;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === "number") {
        h = ev.webkitCompassHeading; // iOS: degrees clockwise from magnetic north
      } else if (ev.alpha != null) {
        // Standard: alpha is counter-clockwise from north, so heading = 360 - alpha.
        h = 360 - ev.alpha;
      }
      if (h != null) {
        gotReading = true;
        setHeading(norm(h));
      }
    };
    listenerRef.current = handler;
    window.addEventListener("deviceorientationabsolute", handler as EventListener);
    window.addEventListener("deviceorientation", handler as EventListener);
    setCompassOn(true);
    // If no reading arrives shortly, the device likely has no usable sensor.
    setTimeout(() => {
      if (!gotReading) setUnsupported(true);
    }, 2500);
  }

  if (loading) {
    return <p className="text-center text-sm text-[var(--color-text-secondary)]">{t.locating}</p>;
  }
  if (failed || !coords) {
    return <p className="text-center text-sm text-danger">{t.errorLabel}</p>;
  }

  const bearing = qiblaBearing(coords.lat, coords.lng);
  const distanceKm = qiblaDistanceKm(coords.lat, coords.lng);
  const live = compassOn && heading != null && !unsupported;
  // Rotate the whole dial (cardinal marks + arrow) by -heading so North tracks
  // real north and the arrow points at the real qibla relative to the phone.
  const dialRotation = live ? -heading! : 0;
  const relative = live ? norm(bearing - heading!) : null;
  const facing = relative != null && (relative <= 6 || relative >= 354);

  return (
    <div className="space-y-6">
      {cityLabel && (
        <p className="text-center text-xs text-[var(--color-text-secondary)]">
          {t.locationLabel}: <span className="font-medium text-[var(--color-text-primary)]">{cityLabel}</span>
        </p>
      )}

      <div className="mx-auto flex w-full max-w-[280px] items-center justify-center">
        <div className="relative aspect-square w-full">
          {/* Fixed forward marker at the top — the phone's own "ahead" line. */}
          <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 -translate-y-1 border-x-[8px] border-t-[12px] border-x-transparent border-t-accent" />
          <div className="relative aspect-square w-full rounded-full border-4 border-accent/40 bg-gradient-to-br from-[#06251b] to-[#0B3D2E] shadow-xl">
            {/* Rotating dial */}
            <div
              className="absolute inset-0"
              style={{ transform: `rotate(${dialRotation}deg)`, transition: "transform 0.15s ease-out" }}
            >
              {[
                { label: "N", deg: 0 },
                { label: "E", deg: 90 },
                { label: "S", deg: 180 },
                { label: "W", deg: 270 },
              ].map((m) => (
                <span
                  key={m.label}
                  className={`absolute left-1/2 top-1/2 text-xs font-semibold ${m.label === "N" ? "text-danger" : "text-accent"}`}
                  style={{
                    transform: `rotate(${m.deg}deg) translate(0, -118px) rotate(${-m.deg}deg) translate(-50%, -50%)`,
                  }}
                >
                  {m.label}
                </span>
              ))}
              {/* Qibla arrow, fixed at the bearing within the dial */}
              <div
                className="absolute left-1/2 top-1/2 h-[42%] w-1 origin-bottom"
                style={{ transform: `translate(-50%, -100%) rotate(${bearing}deg)` }}
              >
                <div className={`h-full w-full rounded-full shadow-[0_0_12px_rgba(184,137,43,0.8)] ${facing ? "bg-green-400" : "bg-accent"}`} />
                <div
                  className={`absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-b-[12px] border-x-transparent ${facing ? "border-b-green-400" : "border-b-accent"}`}
                />
              </div>
            </div>
            <div className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-sm">
              🕋
            </div>
          </div>
        </div>
      </div>

      {live ? (
        <p className={`text-center text-sm font-medium ${facing ? "text-green-500" : "text-accent"}`}>
          {facing ? t.facingKaaba : t.turnToKaaba}
        </p>
      ) : (
        <div className="text-center">
          <button
            onClick={enableCompass}
            className="rounded-full border border-accent/50 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/20"
          >
            🧭 {t.enableCompass}
          </button>
          {unsupported && <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{t.compassUnsupported}</p>}
        </div>
      )}
      {live && <p className="text-center text-[11px] text-[var(--color-text-secondary)]">{t.compassHint}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
          <p className="text-[11px] text-[var(--color-text-secondary)]">{t.bearingLabel}</p>
          <p className="mt-1 font-heading text-2xl text-accent tabular-nums">{bearing.toFixed(1)}°</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
          <p className="text-[11px] text-[var(--color-text-secondary)]">{t.distanceLabel}</p>
          <p className="mt-1 font-heading text-2xl text-accent tabular-nums">{Math.round(distanceKm).toLocaleString()} km</p>
        </div>
      </div>

      <p className="text-center text-xs leading-relaxed text-[var(--color-text-secondary)]">{t.howToUse}</p>
      <p className="text-center text-[11px] text-[var(--color-text-secondary)]/70">{t.manualNote}</p>

    </div>
  );
}
