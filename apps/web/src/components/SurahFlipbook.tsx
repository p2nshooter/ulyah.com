"use client";

import { useEffect, useState } from "react";
import { TENANT } from "@/lib/tenant";
import { SURAH_NAMES } from "@/lib/surah-names";

/**
 * A little open Qur'an in the header whose page turns by itself — each turn
 * shows the next surah (Arabic name + number + transliteration), cycling
 * through all 114 and then starting again, forever (owner request). The
 * Arabic + transliteration read the same on every sibling site, so no
 * per-language copy is needed. Ecosystem sites only (ulyah.com, 1fr.fr,
 * tilawa.de); dawa.es / xad.es keep their football theme.
 *
 * The names are bundled (lib/surah-names.ts), not fetched: the book used to ask
 * the API on every page view of three sites, and on a day the API could not
 * answer it turned through "1. Surah 1" on every page.
 */
export const BOOK_TENANTS = new Set(["ulyah", "1fr", "tilawa"]);

export function SurahFlipbook({ className = "" }: { className?: string }) {
  const on = BOOK_TENANTS.has(TENANT.id);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!on) return;
    const t = window.setInterval(() => setI((p) => (p + 1) % SURAH_NAMES.length), 3400);
    return () => window.clearInterval(t);
  }, [on]);

  if (!on) return null;
  const cur = SURAH_NAMES[i]!;
  const num = cur.id;
  const ar = cur.ar;
  const latin = cur.latin;

  // ulyah.com wants the book a size smaller so it never crowds the Arabic
  // wordmark; the sibling sites keep the original size ("yg lain g usah ikut").
  const sizeClass = TENANT.id === "ulyah" ? "sf-sm" : "";

  return (
    <span className={`sf-book ${sizeClass} ${className}`} role="img" aria-label={`Al-Qur'an — surah ${num} ${latin}`} title="Al-Qur'an · 114 surah">
      {/* key={i} remounts the leaf so the page-turn animation replays each time */}
      <span className="sf-leaf" key={i}>
        <span className="sf-ar font-arabic">{ar}</span>
        <span className="sf-latin">
          {num}. {latin}
        </span>
      </span>
    </span>
  );
}
