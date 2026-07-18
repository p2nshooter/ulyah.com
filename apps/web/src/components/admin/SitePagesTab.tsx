"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";

/**
 * Show / hide / rename any public page, per site — the owner's "semua dynamic
 * dari portal admin, jgn ada yg hardcode". The API stores only overrides; this
 * catalogue is the built-in list of pages. A sibling admin manages its own
 * site; the ulyah owner can switch between sites with the selector.
 */
const CATALOG: { path: string; label: string; group: string }[] = [
  { path: "/quran", label: "Read the Qur'an", group: "Al-Qur'an" },
  { path: "/quran/mushaf", label: "Mushaf Utsmani", group: "Al-Qur'an" },
  { path: "/radio", label: "Qur'an Radio", group: "Al-Qur'an" },
  { path: "/nasakh", label: "Nasakh & Mansukh", group: "Al-Qur'an" },
  { path: "/hadits", label: "Hadith Collections", group: "Hadith & Kitab" },
  { path: "/sanad", label: "Sanad Tree", group: "Hadith & Kitab" },
  { path: "/kitab", label: "Kitab Library", group: "Hadith & Kitab" },
  { path: "/kitab-pesantren", label: "Kitab Pesantren", group: "Hadith & Kitab" },
  { path: "/kisah", label: "Islamic Stories", group: "Stories & Audio" },
  { path: "/anak", label: "Kids' Animated Films", group: "Stories & Audio" },
  { path: "/audiobook", label: "Audiobook", group: "Stories & Audio" },
  { path: "/harian", label: "Daily Content", group: "Stories & Audio" },
  { path: "/haji-umroh", label: "Hajj & Umrah", group: "Worship & Tools" },
  { path: "/amalan", label: "Daily Practices", group: "Worship & Tools" },
  { path: "/jadwal-sholat", label: "Prayer Times", group: "Worship & Tools" },
  { path: "/imsakiyah", label: "Ramadan Imsakiyah", group: "Worship & Tools" },
  { path: "/kiblat", label: "Qibla Direction", group: "Worship & Tools" },
  { path: "/kalender-hijriyah", label: "Hijri Calendar", group: "Worship & Tools" },
  { path: "/zakat", label: "Zakat Calculator", group: "Worship & Tools" },
  { path: "/waris", label: "Inheritance (Faraid)", group: "Worship & Tools" },
  { path: "/live", label: "Live Streaming", group: "Other" },
  { path: "/tanya", label: "Ask the AI", group: "Other" },
  { path: "/widget", label: "Widget Store", group: "Other" },
  { path: "/tentang", label: "About", group: "Other" },
  { path: "/kontak", label: "Contact", group: "Other" },
  { path: "/donasi", label: "Donate", group: "Other" },
  { path: "/acquisition", label: "Acquisition (for sale)", group: "Other" },
];

interface Override {
  path: string;
  visible: boolean;
  label: string | null;
}

export function SitePagesTab() {
  const isUlyah = TENANT.id === "ulyah";
  const [tenant, setTenant] = useState<string>(isUlyah ? "1fr" : TENANT.id);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get<{ overrides: Override[] }>(`/admin/site-pages?tenant=${tenant}`);
      const map: Record<string, Override> = {};
      for (const o of r.overrides) map[o.path] = o;
      setOverrides(map);
    } catch {
      setOverrides({});
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  async function save(path: string, visible: boolean, label: string | null) {
    setMsg(null);
    try {
      await api.post("/admin/site-pages", { path, visible, label, tenant });
      setOverrides((m) => ({ ...m, [path]: { path, visible, label } }));
      setMsg(`Saved ${path}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function reset(path: string) {
    setMsg(null);
    try {
      await api.del(`/admin/site-pages?path=${encodeURIComponent(path)}&tenant=${tenant}`);
      setOverrides((m) => {
        const n = { ...m };
        delete n[path];
        return n;
      });
      setDrafts((d) => {
        const n = { ...d };
        delete n[path];
        return n;
      });
      setMsg(`Reset ${path} to default`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Reset failed");
    }
  }

  const groups = [...new Set(CATALOG.map((c) => c.group))];

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <h2 className="font-heading text-lg">🧭 Dynamic Pages — show / hide / rename</h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Turn any page off to remove it from the navigation and 404 it, or give it a custom name. Nothing is hardcoded.
        </p>
        {isUlyah && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-[var(--color-text-secondary)]">Site:</span>
            {["1fr", "tilawa"].map((t) => (
              <button
                key={t}
                onClick={() => setTenant(t)}
                className={`rounded-full px-3 py-1 text-xs ${tenant === t ? "bg-accent text-white" : "border border-[var(--color-border)]"}`}
              >
                {t === "1fr" ? "1fr.fr" : "tilawa.de"}
              </button>
            ))}
          </div>
        )}
        {!isUlyah && (
          <p className="mt-2 text-xs text-accent">Managing this site ({TENANT.siteName}).</p>
        )}
        {msg && <p className="mt-2 text-xs text-accent">{msg}</p>}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>
      ) : (
        groups.map((g) => (
          <div key={g} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{g}</p>
            <div className="space-y-2">
              {CATALOG.filter((c) => c.group === g).map((c) => {
                const ov = overrides[c.path];
                const visible = ov ? ov.visible : true;
                const label = drafts[c.path] ?? ov?.label ?? "";
                return (
                  <div key={c.path} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)]/60 p-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => save(c.path, e.target.checked, ov?.label ?? null)}
                      />
                      <span className={visible ? "" : "line-through opacity-60"}>{c.label}</span>
                      <code className="text-[10px] text-[var(--color-text-secondary)]">{c.path}</code>
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                      <input
                        value={label}
                        onChange={(e) => setDrafts((d) => ({ ...d, [c.path]: e.target.value }))}
                        placeholder="custom name (optional)"
                        className="w-44 rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => save(c.path, visible, label.trim() || null)}
                        className="rounded-md bg-accent px-2.5 py-1 text-xs text-white"
                      >
                        Save
                      </button>
                      {ov && (
                        <button
                          onClick={() => reset(c.path)}
                          className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
