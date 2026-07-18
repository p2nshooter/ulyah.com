"use client";

import { useEffect, useState } from "react";
import { pwaLabels } from "@/lib/pwa-labels";
import { api } from "@/lib/api";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorWithRelatedApps extends Navigator {
  getInstalledRelatedApps?: () => Promise<unknown[]>;
}

const INSTALLED_KEY = "ulyah_pwa_installed";

/**
 * A permanent "Install App" trigger — never a popup or banner that reappears
 * on every visit. Hides ONLY while genuinely running installed right now
 * (`display-mode: standalone`, checked fresh on every load) — deliberately
 * NOT via a remembered localStorage flag from a past visit. A flag set once
 * (e.g. the browser reported "accepted" but the shortcut never actually
 * landed, or the app was later uninstalled — neither has a reliable "undo"
 * event) used to hide this button forever afterward: it would flash visible
 * for an instant on mount, then vanish the moment the effect read the stale
 * flag, even on a device where the app plainly was NOT installed. Trusting
 * only the live standalone check means the worst case is offering to
 * install something already installed (harmless, and Chrome/Safari just
 * handle it) rather than silently hiding the only way to install at all.
 *
 * Chrome only fires `beforeinstallprompt` after its own engagement
 * heuristics are satisfied — sometimes not on a visitor's first visit, and
 * never at all in browsers that don't support it (Firefox, in-app WebViews,
 * desktop Safari). It always renders and falls back to manual "add to home
 * screen" instructions when there's no native prompt captured, so the
 * button is never silently invisible.
 *
 * `app` tags which installable PWA this instance offers (main site vs. the
 * standalone Jadwal Sholat mini-app) so the admin portal's install counter
 * can tell them apart. `labeled` swaps the quiet icon-only header form for a
 * bigger pill-with-text CTA, for use in a dedicated "Download App" section
 * rather than tucked in the header.
 */
export function InstallAppButton({
  app = "main",
  labeled = false,
  autoPrompt = false,
}: {
  app?: "main" | "sholat" | "radio" | "quran-flipbook" | "kitab";
  labeled?: boolean;
  /** Pulses the button to draw the eye — used when a visitor just navigated
   * here specifically to install (e.g. via ?install=1 from the homepage's
   * Download App card). Deliberately does NOT call prompt() automatically:
   * calling it without a fresh, in-page user gesture produced a broken,
   * content-less native install dialog on Android Chrome rather than a
   * working one — a real tap on this button is required either way. */
  autoPrompt?: boolean;
}) {
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
    // Only the MAIN app may hide itself on the generic standalone signal. For a
    // mini-app (radio, sholat, …) being inside the main app's standalone window
    // does NOT mean THIS widget is installed — treating it that way is exactly
    // why the Radio's install button never appeared once the main app was
    // installed. Each mini-app decides "installed" only from its own
    // getInstalledRelatedApps match + its appinstalled event.
    if (standalone && app === "main") {
      setInstalled(true);
      return;
    }

    // `display-mode: standalone` only proves "installed" when the visitor is
    // *currently inside* the installed app window — it says nothing when
    // they're back in a normal browser tab, which used to mean the button
    // kept offering to install an app that was already on the device. Where
    // Chrome supports it (desktop/Android, manifest declares itself via
    // `related_applications`), ask it directly instead of guessing.
    let cancelled = false;
    const nav = navigator as NavigatorWithRelatedApps;
    if (nav.getInstalledRelatedApps) {
      nav
        .getInstalledRelatedApps()
        .then((related) => {
          if (cancelled) return;
          if (related.length > 0) {
            setInstalled(true);
            return;
          }
          // Best-effort uninstall: getInstalledRelatedApps is supported and
          // reports none installed, yet we previously recorded an install for
          // this app on this device — treat it as an uninstall (fired once,
          // then the flag is cleared so it can't double-count).
          if (window.localStorage.getItem(`${INSTALLED_KEY}_${app}`) === "1") {
            window.localStorage.removeItem(`${INSTALLED_KEY}_${app}`);
            api.post("/analytics/uninstall", { app }).catch(() => {});
          }
        })
        .catch(() => {});
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
      cancelled = true;
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

  // Fixed, theme-independent tooltip colors. The old classes used
  // bg-[var(--color-surface)] + text-[var(--color-text-primary)] — but in
  // dark mode --color-text-primary flips to cream while --color-surface is
  // never overridden and STAYS cream, so the hint rendered as cream text on
  // a cream box: a blank rectangle ("g bisa download"). A dark-green tooltip
  // with cream text is readable on every page in both themes.
  const hintStyle: React.CSSProperties = {
    backgroundColor: "var(--color-primary-dark)",
    color: "#f4efe3",
    borderColor: "color-mix(in srgb, var(--color-accent) 45%, transparent)",
  };

  if (labeled) {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110 ${autoPrompt ? "animate-pulse" : ""}`}
        >
          📲 {t.installApp}
        </button>
        {showHint && (
          <div style={hintStyle} className="absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border p-3 text-xs leading-relaxed shadow-2xl">
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
        <div style={hintStyle} className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border p-3 text-xs leading-relaxed shadow-2xl">
          {hintText}
        </div>
      )}
    </div>
  );
}
