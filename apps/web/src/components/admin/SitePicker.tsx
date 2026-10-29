"use client";

import type { AdminSite } from "@/lib/admin-sites";

/**
 * The ulyah owner manages every site from ulyah.com (owner, 29 Oct 2026: "2 jalur, bisa dari
 * ulyah.com maupun bisa mandiri"; docs/ADSENSE-BLUEPRINT.md §18.4). A site's own admin sees
 * only its site, so the picker is not shown.
 */
export function SitePicker({ label, sites, site, onChange }: { label: string; sites: AdminSite[]; site: string; onChange: (id: string) => void }) {
  if (sites.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={label} data-testid="admin-site-picker">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</span>
      {sites.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={site === s.id}
          onClick={() => onChange(s.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${site === s.id ? "bg-primary text-white dark:bg-accent dark:text-primary" : "border border-(--color-border) hover:border-accent"}`}
        >
          {s.domain}
        </button>
      ))}
    </div>
  );
}
