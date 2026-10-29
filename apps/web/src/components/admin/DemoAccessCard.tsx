"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fill, type AdminWords } from "@/lib/admin-i18n";

/**
 * The ulyah owner's view of every site's read-only demo login (docs/ADSENSE-BLUEPRINT.md §18):
 * username, password, on/off, a new password. The same login is printed on that site's
 * sale page for prospective buyers. Stored in R2 by the API (lib/admin-demo.ts).
 */
interface Login { site: string; email: string; password: string; enabled: boolean; url: string }

function toLogins(raw: unknown): Login[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((l): l is Login => !!l && typeof l === "object" && typeof (l as Login).email === "string" && typeof (l as Login).password === "string")
    .map((l) => ({ ...l, enabled: l.enabled !== false, url: typeof l.url === "string" ? l.url : "" }));
}

export function DemoAccessCard({ t, names }: { t: AdminWords; names: Record<string, string> }) {
  const [logins, setLogins] = useState<Login[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ logins?: unknown }>("/admin/demo-logins")
      .then((r) => setLogins(toLogins(r?.logins)))
      .catch((e) => setError(e instanceof Error ? e.message : t.failed));
  }, [t.failed]);

  async function change(l: Login, patch: { rotate?: boolean; enabled?: boolean }) {
    if (patch.rotate && !window.confirm(fill(t.hub.demoRotateConfirm, { site: names[l.site] ?? l.site }))) return;
    setBusy(l.site);
    setError(null);
    try {
      const r = await api.put<{ login?: unknown }>(`/admin/demo-logins/${l.site}`, patch);
      const [next] = toLogins([r?.login]);
      if (next) setLogins((all) => all.map((x) => (x.site === l.site ? next : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.failed);
    } finally {
      setBusy(null);
    }
  }

  async function copy(l: Login) {
    try {
      await navigator.clipboard.writeText(`${l.url}\n${t.hub.demoUser}: ${l.email}\n${t.hub.demoPass}: ${l.password}`);
      setCopied(l.site);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* the text stays on screen to copy by hand */
    }
  }

  return (
    <section className="rounded-3xl border border-(--color-border) p-5 sm:p-6" data-testid="admin-demo-logins">
      <h3 className="font-heading text-lg">🔑 {t.hub.demoTitle}</h3>
      <p className="mt-1 text-sm text-text-secondary">{t.hub.demoLead}</p>
      {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {logins.map((l) => (
          <div key={l.site} className="rounded-2xl border border-(--color-border) p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">{names[l.site] ?? l.site} ↗</a>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.enabled ? "bg-success/15 text-success" : "bg-black/10 text-text-secondary dark:bg-white/10"}`}>
                {l.enabled ? t.hub.demoOn : t.hub.demoOff}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-text-secondary">{t.hub.demoUser}</dt>
              <dd className="break-all font-mono">{l.email}</dd>
              <dt className="text-text-secondary">{t.hub.demoPass}</dt>
              <dd className="break-all font-mono">{l.password}</dd>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => copy(l)} className="rounded-full border border-(--color-border) px-3 py-1 text-xs hover:border-accent">
                {copied === l.site ? t.hub.demoCopied : t.hub.demoCopy}
              </button>
              <button type="button" disabled={busy === l.site} onClick={() => change(l, { rotate: true })} className="rounded-full border border-(--color-border) px-3 py-1 text-xs hover:border-accent disabled:opacity-50">
                {t.hub.demoRotate}
              </button>
              <button type="button" disabled={busy === l.site} onClick={() => change(l, { enabled: !l.enabled })} className="rounded-full border border-(--color-border) px-3 py-1 text-xs hover:border-accent disabled:opacity-50">
                {l.enabled ? t.hub.demoDisable : t.hub.demoEnable}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
