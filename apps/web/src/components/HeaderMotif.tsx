import { TENANT } from "@/lib/tenant";

/**
 * BookFlip — a small open book whose pages turn forever beside the logo
 * (owner request: "animasi seperti buku yg lembaran bergerak terus menerus di
 * header"). The colourful top-of-header ribbon and the ambient page ornaments
 * live in EcosystemDecor; this file owns only the turning book.
 *
 * Scoped to the three sites the owner named — ulyah.com, 1fr.fr, tilawa.de —
 * so dawa.es and xad.es keep their own distinct identities. Pure CSS (see
 * styles/core/animations.css), honours prefers-reduced-motion. TENANT is a
 * build-time constant, so the gate compiles away on every other tenant.
 */
const ANIMATED = new Set<string>(["ulyah", "1fr", "tilawa"]);
export const headerMotifOn = ANIMATED.has(TENANT.id);

export function BookFlip({ className = "" }: { className?: string }) {
  if (!headerMotifOn) return null;
  return (
    <span aria-hidden className={`book-flip ${className}`}>
      <span className="book-flip__page book-flip__page--left" />
      <span className="book-flip__page book-flip__page--right" />
      <span className="book-flip__leaf" />
      <span className="book-flip__leaf" />
      <span className="book-flip__leaf" />
    </span>
  );
}
