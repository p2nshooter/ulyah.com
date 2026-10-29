"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { IS_SALE_SITE, SALE_DEFAULTS, toSaleTerms, type SaleTerms } from "@/lib/site-sale";

/**
 * The sale terms in the browser (the header pill on every page). One request per page
 * load, shared by every caller; until it answers — and whenever it cannot — the
 * published defaults stand, which are what the server-rendered HTML shows too.
 */
let pending: Promise<SaleTerms> | null = null;

export function useSaleTerms(): SaleTerms {
  const [terms, setTerms] = useState<SaleTerms>(SALE_DEFAULTS);
  useEffect(() => {
    if (!IS_SALE_SITE) return;
    let alive = true;
    pending ??= api.get<unknown>("/sale").then(toSaleTerms).catch(() => SALE_DEFAULTS);
    pending.then((t) => {
      if (alive) setTerms(t);
    });
    return () => {
      alive = false;
    };
  }, []);
  return terms;
}
