import { TENANT } from "@/lib/tenant";

/**
 * Decorative flourishes for the core Islamic ecosystem sites — ulyah.com,
 * 1fr.fr and tilawa.de (owner request). Gated to these three tenants so the
 * football-themed dawa.es / xad.es keep their own World Cup ornament.
 *
 *   • EcoTopLine     — a slim, endlessly-scrolling multi-colour ribbon pinned
 *                      to the very top edge of the header.
 *   • UlyahWordmark  — the Arabic "عليه" wordmark rendered as live text (Amiri)
 *                      with a never-ending, cinema-marquee multi-colour gradient
 *                      that slides across the letters and cycles through dozens
 *                      of hues. ulyah.com only.
 *   • EcoOrnaments   — soft, slowly-drifting ambient ornaments (gold orbs + a
 *                      turning eight-point star) behind every page. Decorative
 *                      only: aria-hidden, pointer-events:none, very low opacity,
 *                      and fully stilled under prefers-reduced-motion (see
 *                      globals.css).
 */
const DECOR_TENANTS = new Set(["ulyah", "1fr", "tilawa"]);
const decorOn = () => DECOR_TENANTS.has(TENANT.id);

export function EcoTopLine() {
  if (!decorOn()) return null;
  return <span className="eco-topline" aria-hidden="true" />;
}

/** Animated Arabic wordmark for ulyah.com (replaces the static gold image). */
export function UlyahWordmark() {
  return (
    <span className="ulyah-wm font-arabic" role="img" aria-label="ulyah">
      عليه
    </span>
  );
}

export function EcoOrnaments() {
  if (!decorOn()) return null;
  return (
    <div className="eco-ornaments" aria-hidden="true">
      <span className="eco-orb eco-orb-1" />
      <span className="eco-orb eco-orb-2" />
      <span className="eco-star" />
    </div>
  );
}
