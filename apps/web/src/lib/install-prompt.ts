// Singleton capture for the native `beforeinstallprompt` event, shared by
// every <InstallAppButton> instance (the header's icon-only button AND a
// page's own labelled button often mount at the same time — e.g. Header +
// the Jadwal Sholat page both render one). Chrome fires this event only
// ONCE per page load and only to listeners already attached at that moment;
// a listener registered inside a React "use client" component's useEffect
// attaches only after hydration, which is late enough that the event is
// regularly missed — the button then falls back to manual "Add to Home
// Screen" instructions forever, even though the browser DID support a
// native prompt. The tiny inline <script> in the root layout's <head> (see
// layout.tsx) runs before any React/Next JS, listens immediately, and
// stashes the event here — so no matter when a component mounts, it can
// just read what's already captured (or subscribe for it to arrive later).

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __ulyahInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const READY_EVENT = "ulyah:bip-ready";

/** Returns the captured event if it already arrived (possibly before this
 * module even loaded, thanks to the inline head script), otherwise null. */
export function getCapturedPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return window.__ulyahInstallPrompt ?? null;
}

/** Subscribes to the moment the prompt becomes available. Fires immediately
 * (synchronously, next microtask) if it's already captured, so callers don't
 * need to check getCapturedPrompt() separately first. Returns an unsubscribe
 * function. */
export function onPromptReady(cb: (e: BeforeInstallPromptEvent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const existing = getCapturedPrompt();
  if (existing) {
    Promise.resolve().then(() => cb(existing));
    return () => {};
  }
  const handler = () => {
    const e = getCapturedPrompt();
    if (e) cb(e);
  };
  window.addEventListener(READY_EVENT, handler);
  // Defense in depth: if the inline head script didn't run for some reason
  // (e.g. a CSP blocking inline scripts in some deployment), still listen
  // directly — this only helps if this component happens to mount before
  // the event fires, but costs nothing to also attach.
  const direct = (ev: Event) => {
    ev.preventDefault();
    const bip = ev as BeforeInstallPromptEvent;
    window.__ulyahInstallPrompt = bip;
    cb(bip);
  };
  window.addEventListener("beforeinstallprompt", direct);
  return () => {
    window.removeEventListener(READY_EVENT, handler);
    window.removeEventListener("beforeinstallprompt", direct);
  };
}

/** Call after a captured prompt has been used (native prompts are one-shot). */
export function clearCapturedPrompt() {
  if (typeof window !== "undefined") window.__ulyahInstallPrompt = null;
}
