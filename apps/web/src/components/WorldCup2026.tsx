import { TENANT } from "@/lib/tenant";

/**
 * World Cup 2026 header festoon — dawa.es & xad.es ONLY (owner: "css dawa.es
 * dan xad.es kasih ornamen dan animasi Piala Dunia 2026 … bola mantul-mantul
 * bolak-balik samping logo header sama tropi piala dunia"). A trophy, a ball
 * bouncing back and forth beside it, and a small gold 2026 chip; plus the
 * host-nation stripe across the very top of the header. All motion lives in
 * worldcup.css (pure CSS keyframes, reduced-motion aware). Renders nothing
 * at all on the other tenants, so their headers stay byte-identical.
 */
const WC26_TENANTS = new Set(["dawa", "xad"]);

export function WorldCup2026() {
  if (!WC26_TENANTS.has(TENANT.id)) return null;
  return (
    <span className="wc26-header" aria-hidden="true" title="World Cup 2026">
      <span className="wc26-trophy">🏆</span>
      <span className="wc26-lane">
        <span className="wc26-ball-x">
          <span className="wc26-ball">⚽</span>
        </span>
      </span>
      <span className="wc26-badge">2026</span>
    </span>
  );
}

/** The tricolour shimmer stripe pinned to the top edge of the header —
 * separate export so the Header can pin it to its own positioned box. */
export function WorldCup2026Stripe() {
  if (!WC26_TENANTS.has(TENANT.id)) return null;
  return <span className="wc26-stripe" aria-hidden="true" />;
}
