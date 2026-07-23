"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { fetchAdView, type AdView } from "@/lib/ad-config";

// Preview-box wording per site language (DEFAULT_LOCALE is the tenant's own
// language at build time). A sibling in "enabled but not yet approved" state
// must never show the Indonesian placeholder text.
const AD_L: Record<string, { label: string; pos: string; waiting: string; noId: string }> = {
  id: { label: "Ruang Iklan", pos: "posisi iklan", waiting: "menunggu ACC AdSense", noId: "belum ada ID iklan" },
  en: { label: "Ad space", pos: "ad position", waiting: "awaiting AdSense approval", noId: "no ad ID yet" },
  fr: { label: "Espace publicitaire", pos: "emplacement", waiting: "en attente d'approbation AdSense", noId: "pas encore d'ID d'annonce" },
  de: { label: "Werbefläche", pos: "Anzeigenplatz", waiting: "wartet auf AdSense-Freigabe", noId: "noch keine Anzeigen-ID" },
  es: { label: "Espacio publicitario", pos: "posición del anuncio", waiting: "esperando aprobación de AdSense", noId: "aún sin ID de anuncio" },
  ar: { label: "مساحة إعلانية", pos: "موضع الإعلان", waiting: "بانتظار موافقة AdSense", noId: "لا يوجد معرّف إعلان بعد" },
};

/**
 * A single, visitor-friendly ad placement. Reads the central config (edited
 * only from the ulyah.com admin) and:
 *   - renders NOTHING when this site is turned off (the default) or on the
 *     admin portal;
 *   - renders a tasteful PREVIEW box when the site is on but no real ad-unit
 *     id has been pasted yet, so positions can be checked before approval;
 *   - renders the real AdSense unit once the id is pasted.
 *
 * Placement guidance (owner: "ramah, tidak mengganggu; kamu yang hitung jarak"):
 * in-content ads sit BETWEEN finished blocks with generous spacing and a
 * reserved height so nothing ever shifts under the reader — never sticky,
 * never interstitial, never mid-sentence.
 */
export function AdSlot({
  placement = "in_article",
  className = "",
  label,
}: {
  placement?: "in_article" | "list" | "footer" | "sidebar";
  className?: string;
  label?: string;
}) {
  const adL = AD_L[DEFAULT_LOCALE] ?? AD_L.en!;
  const [view, setView] = useState<AdView | null>(null);
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    // Never show ads inside the admin portal.
    if (typeof window !== "undefined" && window.location.pathname.includes("/admin")) return;
    fetchAdView().then((v) => {
      if (alive) setView(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const slotId = view?.slots?.[placement] || "";
  // A slot serves a REAL ad only once the owner has ticked "approved" for this
  // site (AdSense has accepted it) AND pasted a unit id. Until then — enabled
  // but not approved, or no id yet — we ALWAYS render the dashed position
  // marker so the owner can see exactly where each ad will land before going
  // live (owner: "kasih kolom/tanda posisi saat iklan nanti muncul").
  const live = !!view?.approved && !!slotId && !!view?.clientId;

  useEffect(() => {
    if (!live || pushedRef.current) return;
    pushedRef.current = true;
    try {
      // Global adsbygoogle array is created by the loader script in layout head.
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ??= []).push({});
    } catch {
      /* ad blocker / not ready — the reserved space simply stays empty */
    }
  }, [live]);

  if (!view || !view.enabled) return null;

  // Real ad — approved + id present.
  if (live) {
    return (
      <div className={`my-8 flex justify-center ${className}`} aria-hidden={false}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: 90 }}
          data-ad-client={view.clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Position marker (site on, but not approved yet or no id) — lets the owner
  // see the exact spot/size the ad will occupy without violating policy (no
  // fake ad content, clearly labelled as a reserved preview slot).
  const stateNote = slotId ? adL.waiting : adL.noId;
  return (
    <div
      className={`my-8 flex min-h-[90px] flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-accent/50 bg-accent/5 text-center text-xs text-[var(--color-text-secondary)] ${className}`}
      data-ad-placeholder={placement}
    >
      <span className="font-medium opacity-80">▭ {label ?? adL.label}</span>
      <span className="text-[10px] opacity-60">
        {adL.pos} «{placement}» · {stateNote}
      </span>
    </div>
  );
}
