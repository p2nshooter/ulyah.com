"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { qiblaLabels } from "@/lib/qibla-labels";
import { qiblaBearing, qiblaDistanceKm } from "@/lib/qibla";
import { AdSlot } from "@/components/AdSlot";

interface GeoResponse {
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Qibla compass — direction + distance to the Kaaba from the visitor's
 * IP-detected location, same zero-permission-prompt pattern PrayerTimesWidget
 * already uses (GET /geo/me) rather than requesting browser GPS. A static
 * compass rose with the qibla bearing marked is honest about its own
 * precision: IP geolocation is city-grade, so this is "which way to turn a
 * real compass," not a live magnetometer needle — see qiblaLabels.manualNote.
 */
export function QiblaCompass({ locale }: { locale: string }) {
  const t = qiblaLabels(locale);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityLabel, setCityLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get<GeoResponse>("/geo/me")
      .then((g) => {
        if (g.latitude && g.longitude) {
          setCoords({ lat: g.latitude, lng: g.longitude });
          setCityLabel(g.city ?? g.country ?? null);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-sm text-[var(--color-text-secondary)]">{t.locating}</p>;
  }
  if (failed || !coords) {
    return <p className="text-center text-sm text-danger">{t.errorLabel}</p>;
  }

  const bearing = qiblaBearing(coords.lat, coords.lng);
  const distanceKm = qiblaDistanceKm(coords.lat, coords.lng);

  return (
    <div className="space-y-6">
      {cityLabel && (
        <p className="text-center text-xs text-[var(--color-text-secondary)]">
          {t.locationLabel}: <span className="font-medium text-[var(--color-text-primary)]">{cityLabel}</span>
        </p>
      )}

      <div className="mx-auto flex w-full max-w-[280px] items-center justify-center">
        <div className="relative aspect-square w-full rounded-full border-4 border-accent/40 bg-gradient-to-br from-[#06251b] to-[#0B3D2E] shadow-xl">
          {/* Cardinal marks */}
          {[
            { label: "N", deg: 0 },
            { label: "E", deg: 90 },
            { label: "S", deg: 180 },
            { label: "W", deg: 270 },
          ].map((m) => (
            <span
              key={m.label}
              className="absolute left-1/2 top-1/2 text-xs font-semibold text-accent"
              style={{
                transform: `rotate(${m.deg}deg) translate(0, -118px) rotate(${-m.deg}deg) translate(-50%, -50%)`,
              }}
            >
              {m.label}
            </span>
          ))}
          {/* Qibla arrow, rotated to bearing (clockwise from North) */}
          <div
            className="absolute left-1/2 top-1/2 h-[42%] w-1 origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${bearing}deg)` }}
          >
            <div className="h-full w-full rounded-full bg-accent shadow-[0_0_12px_rgba(184,137,43,0.8)]" />
            <div className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-b-[12px] border-x-transparent border-b-accent" />
          </div>
          <div className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-sm">
            🕋
          </div>
        </div>
      </div>

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

      <AdSlot position="qibla-bottom" />
    </div>
  );
}
