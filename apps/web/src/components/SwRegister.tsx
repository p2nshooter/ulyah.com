"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so the site is installable as an app — and,
 * crucially, makes it AUTO-UPDATE. When a new deploy ships a new sw.js, the new
 * worker activates (skipWaiting) and claims the page, which fires
 * `controllerchange`; we then reload ONCE so the fresh HTML/CSS/JS is used
 * instead of the stale cached build. Without this, returning/installed users
 * could be stranded on old assets (old logo CSS, blank Mushaf from replaced
 * chunks) until they manually cleared the app's storage.
 */
export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Only auto-reload on a genuine UPDATE (a worker was already controlling the
    // page), never on the very first install — that would reload new visitors
    // needlessly. The guard also prevents a reload loop.
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    const onChange = () => {
      if (reloading || !hadController) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Proactively check for a newer worker on each load.
        reg.update().catch(() => {});
      })
      .catch(() => {});

    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);
  return null;
}
