"use client";

import { useEffect, useState } from "react";
import { pwaLabels } from "@/lib/pwa-labels";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALLED_KEY = "ulyah_pwa_installed";

/**
 * A quiet, permanent "Install App" button in the header — never a popup or
 * banner that reappears on every visit. Disappears entirely once the app is
 * actually installed (detected via the `appinstalled` event, standalone
 * display-mode, or a persisted flag from a previous install), so it never
 * re-offers something the visitor already has.
 */
export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [locale, setLocale] = useState("id");

  useEffect(() => {
    setLocale(document.documentElement.lang || "id");

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || window.localStorage.getItem(INSTALLED_KEY) === "1") {
      setInstalled(true);
      return;
    }

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      window.localStorage.setItem(INSTALLED_KEY, "1");
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferredPrompt && !isIOS) return null; // nothing installable to offer on this browser

  const t = pwaLabels(locale);

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null); // a captured prompt can only be used once
      if (choice.outcome === "accepted") {
        window.localStorage.setItem(INSTALLED_KEY, "1");
        setInstalled(true);
      }
    } else if (isIOS) {
      setShowIOSHint((v) => !v);
    }
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
      {showIOSHint && (
        <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-accent/25 bg-[var(--color-surface)] p-3 text-xs leading-relaxed shadow-2xl">
          {t.iosHint}
        </div>
      )}
    </div>
  );
}
