import { TENANT } from "@/lib/tenant";

/**
 * World Cup 2026 header festoon: Spain, world champion. Every tenant carries
 * it (owner: "seluruh website … animasi pemenang piala Dunia 2026 Spanyol").
 * dawa.es is the original the others follow ("seperti dawa.es"): a trophy, a
 * ball bouncing back and forth beside it and a gold 2026 chip, now with a
 * small Spanish flag. Each tenant dresses it in its own palace style in
 * worldcup.css (pure CSS keyframes, reduced-motion aware): dawa & xad keep the
 * host-nation stripe, ulyah gets a gold-ink stroke, 1fr a mirror sweep and
 * tilawa a red-and-gold glow.
 */
const TITLE: Record<string, string> = {
  ulyah: "Spanyol juara Piala Dunia 2026",
  "1fr": "Espagne, championne du monde 2026",
  tilawa: "Spanien, Weltmeister 2026",
  dawa: "España, campeona del mundo 2026",
  xad: "España, campeona del mundo 2026",
};

export function WorldCup2026() {
  return (
    <span className="wc26-header" aria-hidden="true" title={TITLE[TENANT.id] ?? TITLE.dawa}>
      <span className="wc26-trophy">🏆</span>
      <span className="wc26-lane">
        <span className="wc26-ball-x">
          <span className="wc26-ball">⚽</span>
        </span>
      </span>
      <span className="wc26-badge">
        <span className="wc26-flag" />
        2026
      </span>
    </span>
  );
}

/** The shimmer stripe pinned to the top edge of the header — separate export
 * so the Header can pin it to its own positioned box. */
export function WorldCup2026Stripe() {
  return <span className="wc26-stripe" aria-hidden="true" />;
}
