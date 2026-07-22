"use client";

import { useEffect, useState } from "react";
import { TENANT } from "@/lib/tenant";
import { api } from "@/lib/api";

/**
 * A little open Qur'an in the header whose page turns by itself — each turn
 * shows the next surah (Arabic name + number + transliteration), cycling
 * through all 114 and then starting again, forever (owner request). Names come
 * from the authoritative /quran/surah list, so they are always correct and the
 * same everywhere; the Arabic + transliteration read the same on every sibling
 * site, so no per-language copy is needed. Ecosystem sites only (ulyah.com,
 * 1fr.fr, tilawa.de); dawa.es / xad.es keep their football theme.
 */
const BOOK_TENANTS = new Set(["ulyah", "1fr", "tilawa"]);
type Surah = { id: number; ar: string; latin: string };

export function SurahFlipbook({ className = "" }: { className?: string }) {
  const on = BOOK_TENANTS.has(TENANT.id);
  const [list, setList] = useState<Surah[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!on) return;
    let alive = true;
    api
      .get<{ surah: { id: number; name_ar: string; name_transliteration: string }[] }>("/quran/surah")
      .then((r) => {
        if (alive && Array.isArray(r.surah) && r.surah.length)
          setList(r.surah.map((s) => ({ id: s.id, ar: s.name_ar, latin: s.name_transliteration })));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [on]);

  useEffect(() => {
    if (!on) return;
    const n = list.length || 114;
    const t = window.setInterval(() => setI((p) => (p + 1) % n), 3400);
    return () => window.clearInterval(t);
  }, [on, list.length]);

  if (!on) return null;
  const cur = list[i];
  const num = cur?.id ?? i + 1;
  const ar = cur?.ar ?? "";
  const latin = cur?.latin ?? `Surah ${num}`;

  return (
    <span className={`sf-book ${className}`} role="img" aria-label={`Al-Qur'an — surah ${num} ${latin}`} title="Al-Qur'an · 114 surah">
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
