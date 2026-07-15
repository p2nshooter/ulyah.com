/**
 * This site carries no ads anywhere — no AdSense, no Adsterra. AdSlot is kept
 * as a no-op so the ~25 pages that already import it don't need touching:
 * every call site renders nothing, full stop. The AdSense verification meta
 * tag stays in layout.tsx (needed for account approval); this component is
 * deliberately NOT the thing that would light ads back up even if approved —
 * that requires a real, separate, explicit decision later.
 */
export function AdSlot(_props: {
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  minHeight?: number;
  label?: string;
  position?: string;
  className?: string;
}) {
  return null;
}
