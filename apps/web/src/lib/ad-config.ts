"use client";

import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";

export interface AdView {
  enabled: boolean;
  clientId: string;
  slots: Record<string, string>;
}

const EMPTY: AdView = { enabled: false, clientId: "", slots: {} };

// One fetch per page load, shared by every AdSlot (the config is tiny and
// identical for all slots on the page). api.base = https://api.ulyah.com, so
// every tenant reads the SAME central config edited from the ulyah admin.
let cached: Promise<AdView> | null = null;

export function fetchAdView(): Promise<AdView> {
  if (cached) return cached;
  cached = api
    .get<AdView>(`/content/ad-config?site=${encodeURIComponent(TENANT.id)}`)
    .then((v) => ({ enabled: !!v.enabled, clientId: v.clientId ?? "", slots: v.slots ?? {} }))
    .catch(() => EMPTY);
  return cached;
}
