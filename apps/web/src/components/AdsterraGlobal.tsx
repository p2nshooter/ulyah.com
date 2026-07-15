"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide Adsterra units that load once per session rather than per placement:
 * the SocialBar (a slim docked bar) and the Popunder. Mounted once in the
 * locale layout. Deliberately NOT loaded on the admin portal ("kecuali portal
 * admin ga usah di taro") — the donor/member portals DO get them. Each script
 * is injected at most once, guarded by a data attribute, so client-side
 * navigation never stacks duplicates.
 */
const GLOBAL_SCRIPTS: { id: string; src: string }[] = [
  // SocialBar
  { id: "adsterra-socialbar", src: "https://pl30370134.effectivecpmnetwork.com/67/e2/33/67e233ef831ac79ecccde5df147bb2d4.js" },
  // Popunder
  { id: "adsterra-popunder", src: "https://pl30370132.effectivecpmnetwork.com/8c/38/14/8c381432627bc293ff2b9a39f056d84e.js" },
];

export function AdsterraGlobal() {
  const pathname = usePathname();
  const isAdmin = /\/admin(\/|$)/.test(pathname || "");

  useEffect(() => {
    if (isAdmin) return; // never on the admin portal
    for (const { id, src } of GLOBAL_SCRIPTS) {
      if (document.getElementById(id)) continue;
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.async = true;
      s.setAttribute("data-cfasync", "false");
      document.body.appendChild(s);
    }
  }, [isAdmin]);

  return null;
}
