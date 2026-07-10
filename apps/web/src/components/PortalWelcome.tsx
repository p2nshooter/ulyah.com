"use client";

import { useEffect } from "react";
import Link from "next/link";
import { portalLabels } from "@/lib/portal-labels";
import { speak, speechAvailable } from "@/lib/speech";

const WELCOMED_KEY = "ulyah_akun_welcomed";

/**
 * The first thing a donor (or prospective donor) hears and sees on entering
 * their dashboard — a short, warm welcome read aloud automatically, once per
 * browser session (sessionStorage, not localStorage, so it greets them again
 * next time they return rather than going silent forever after one login).
 * The full-length gratitude and the reward promised for supporting the syiar
 * live further down/elsewhere for anyone who wants to listen or read more.
 */
export function PortalWelcome({ locale }: { locale: string }) {
  const t = portalLabels(locale);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(WELCOMED_KEY) === "1") return;
    window.sessionStorage.setItem(WELCOMED_KEY, "1");
    if (!speechAvailable()) return;
    const timer = setTimeout(() => speak(t.welcomeShort, locale), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#06251b] p-6 text-[#f4efe3]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, rgba(184,137,43,0.6), transparent 60%)",
        }}
      />
      <div className="relative">
        <p className="font-heading text-lg text-accent">🌙 {t.welcomeTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-[#f4efe3]/85">{t.welcomeShort}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
          <Link href={`/${locale}/terima-kasih`} className="text-accent hover:underline">
            {t.linkThanks}
          </Link>
          <a href="#janji-pahala" className="text-accent hover:underline">
            {t.linkVirtues}
          </a>
        </div>
      </div>
    </section>
  );
}
