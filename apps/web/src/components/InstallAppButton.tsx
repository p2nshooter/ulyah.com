"use client";

import { useEffect, useState } from "react";
import { pwaLabels } from "@/lib/pwa-labels";
import { api } from "@/lib/api";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALLED_KEY = "ulyah_pwa_installed";

/**
 * A permanent "Install App" trigger — never a popup or banner that reappears
 * on every visit. Disappears entirely once the app is actually installed
 * (detected via the `appinstalled` event, standalone display-mode, or a
 * persisted flag from a previous install), so it never re-offers something
 * the visitor already has.
 *
 * Chrome only fires `beforeinstallprompt` after its own engagement
 * heuristics are satisfied — sometimes not on a visitor's first visit, and
 * never at all in browsers that don't support it (Firefox, in-app WebViews,
 * desktop Safari). Previously this button simply rendered nothing at all
 * whenever that event hadn't fired, which made the whole "Download App"
 * section look broken rather than just quiet. It now always renders and
 * falls back to manual "add to home screen" instructions when there's no
 * native prompt captured, so the button is never silently invisible.
 *
 * `app` tags which installable PWA this instance offers (main site vs. the
 * standalone Jadwal Sholat mini-app) so the admin portal's install counter
 * can tell them apart. `labeled` swaps the quiet icon-only header form for a
 * bigger pill-with-text CTA, for use in a dedicated "Download App" section
 * rather than tucked in the header.
 */
export function InstallAppButton({ app = "main", labeled = false }: { app?: "main" | "sholat"; labeled?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [locale, setLocale] = useState("id");

  useEffect(() => {
    setLocale(document.documentElement.lang || "id");

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || window.localStorage.getItem(`${INSTALLED_KEY}_${app}`) === "1") {
      setInstalled(true);
      return;
    }

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      window.localStorage.setItem(`${INSTALLED_KEY}_${app}`, "1");
      setInstalled(true);
      setDeferredPrompt(null);
      api.post("/analytics/install", { app }).catch(() => {});
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [app]);

  if (installed) return null;

  const t = pwaLabels(locale);

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null); // a captured prompt can only be used once
      if (choice.outcome === "accepted") {
        window.localStorage.setItem(`${INSTALLED_KEY}_${app}`, "1");
        setInstalled(true);
        api.post("/analytics/install", { app }).catch(() => {});
      }
      return;
    }
    // No native prompt captured yet (or this browser never fires one) —
    // show manual instructions instead of doing nothing.
    setShowHint((v) => !v);
  }

  const hintText = isIOS ? t.iosHint : t.manualHint;

  if (labeled) {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
        >
          📲 {t.installApp}
        </button>
        {showHint && (
          <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border border-accent/25 bg-[var(--color-surface)] p-3 text-xs leading-relaxed text-[var(--color-text-primary)] shadow-2xl">
            {hintText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        aria-label={t.installApp}
        title={t.installApp}
        className="grid h-9 w-9 place-items-center rounded-full border border-accent/40 text-accent hover:border-accent"
      >
        📲
      </button>
      {showHint && (
        <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-accent/25 bg-[var(--color-surface)] p-3 text-xs leading-relaxed shadow-2xl">
          {hintText}
        </div>
      )}
    </div>
  );
}
