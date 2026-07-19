"use client";

/**
 * Adhan (prayer-time) reminder — ON by default so a fresh visitor is reminded
 * of every prayer, but fully in the visitor's control: once they turn it OFF
 * it STAYS off across page navigation, reloads, and app open/close, until they
 * deliberately turn it back ON ("defoultnya aktif tp bisa dimatiin client, klo
 * dimatiin jgn hidup lg walaupun open close kecuali dihidupkan"). The persisted
 * value stores only the OFF intent; absence of the flag means the default ON.
 */
import { create } from "zustand";

const OFF_KEY = "ulyah_adhan_off";

function loadEnabled(): boolean {
  if (typeof window === "undefined") return true; // SSR default: on
  try {
    return window.localStorage.getItem(OFF_KEY) !== "1";
  } catch {
    return true;
  }
}
function saveEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (enabled) window.localStorage.removeItem(OFF_KEY);
    else window.localStorage.setItem(OFF_KEY, "1");
  } catch {
    /* private mode — in-memory intent still holds for this session */
  }
}

interface AdhanState {
  /** null until hydrated on the client, then true/false. Keeps SSR and the
   * first client render identical (both render nothing) to avoid a hydration
   * mismatch, same precaution as the radio/install controls. */
  enabled: boolean | null;
  hydrate: () => void;
  setEnabled: (v: boolean) => void;
}

export const useAdhanStore = create<AdhanState>((set) => ({
  enabled: null,
  hydrate: () => set({ enabled: loadEnabled() }),
  setEnabled: (v) => {
    saveEnabled(v);
    set({ enabled: v });
  },
}));
