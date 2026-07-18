"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Per-site page visibility + custom labels, controlled from the admin portal
 * (owner: "jgn ada yg hardcode, semua dynamic dari portal admin"). Resolved on
 * the client so it stays correct regardless of a page's static/dynamic build
 * mode; the API derives the tenant from the request Origin. Cached in memory +
 * localStorage so repeat views apply overrides with no flash. Fails OPEN.
 */
export interface PageOverrides {
  hidden: string[];
  labels: Record<string, string>;
}

const STORE_KEY = "ulyah:site-pages:v1";
let memo: PageOverrides | null = null;

function readCache(): PageOverrides | null {
  if (memo) return memo;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return (memo = JSON.parse(raw) as PageOverrides);
  } catch {
    /* ignore */
  }
  return null;
}

/** Client hook: returns the tenant's page overrides (empty until loaded). */
export function usePageOverrides(): PageOverrides {
  const [ov, setOv] = useState<PageOverrides>(() => readCache() ?? { hidden: [], labels: {} });

  useEffect(() => {
    let alive = true;
    api
      .get<{ pages: { path: string; visible: boolean; label: string | null }[] }>("/content/site-pages")
      .then((r) => {
        const next: PageOverrides = { hidden: [], labels: {} };
        for (const p of r.pages) {
          if (!p.visible) next.hidden.push(p.path);
          if (p.label) next.labels[p.path] = p.label;
        }
        memo = next;
        try {
          localStorage.setItem(STORE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        if (alive) setOv(next);
      })
      .catch(() => {
        /* fail open — keep whatever we have (usually empty = all visible) */
      });
    return () => {
      alive = false;
    };
  }, []);

  return ov;
}

/** Normalize an incoming request path to a locale-less page path, e.g.
 * "/de/kisah/foo" → "/kisah/foo". Shared with the middleware gate. */
export function stripLocale(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean);
  if (seg.length === 0) return "/";
  if (/^[a-z]{2}$/.test(seg[0]!)) seg.shift();
  return "/" + seg.join("/");
}

/** Is this page (or a parent of it) hidden? A hidden "/kisah" also hides
 * "/kisah/foo". */
export function isPathHidden(hidden: Iterable<string>, pagePath: string): boolean {
  for (const h of hidden) {
    if (h === pagePath) return true;
    if (h !== "/" && pagePath.startsWith(h + "/")) return true;
  }
  return false;
}
