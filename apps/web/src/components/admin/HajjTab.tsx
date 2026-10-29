"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fill, type AdminWords } from "@/lib/admin-i18n";
import { sitePageUrl, type AdminSite } from "@/lib/admin-sites";

/**
 * Hajj & Umrah packages of a site's /haji-umroh page (migration 0038), shown as the cards
 * visitors see, in the site's own language (docs/ADSENSE-BLUEPRINT.md §18). A site admin
 * manages its own site; the ulyah owner picks the site above. Demo accounts only look.
 */
interface PackageRow {
  id: number;
  kind: "hajj" | "umrah";
  title: string;
  provider: string | null;
  description: string | null;
  price: string | null;
  duration: string | null;
  departure: string | null;
  image_url: string | null;
  badge: string | null;
  features: string | null; // JSON string from the DB
  contact_url: string | null;
  sort_order: number;
  visible: number;
}

interface Draft {
  id?: number;
  kind: "hajj" | "umrah";
  title: string;
  provider: string;
  description: string;
  price: string;
  duration: string;
  departure: string;
  image_url: string;
  badge: string;
  featuresText: string; // one bullet per line
  contact_url: string;
  sort_order: number;
  /** Kept as it is when editing: saving a hidden package must not show it again. */
  visible: boolean;
}

const EMPTY: Draft = {
  kind: "umrah", title: "", provider: "", description: "", price: "", duration: "",
  departure: "", image_url: "", badge: "", featuresText: "", contact_url: "", sort_order: 99, visible: true,
};

function features(r: PackageRow): string[] {
  try {
    const p = r.features ? JSON.parse(r.features) : [];
    return Array.isArray(p) ? p.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function toRows(raw: unknown): PackageRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is PackageRow => !!r && typeof r === "object" && typeof (r as PackageRow).id === "number" && typeof (r as PackageRow).title === "string");
}

function toDraft(r: PackageRow): Draft {
  return {
    id: r.id, kind: r.kind, title: r.title, provider: r.provider ?? "", description: r.description ?? "",
    price: r.price ?? "", duration: r.duration ?? "", departure: r.departure ?? "", image_url: r.image_url ?? "",
    badge: r.badge ?? "", featuresText: features(r).join("\n"), contact_url: r.contact_url ?? "", sort_order: r.sort_order,
    visible: !!r.visible,
  };
}

export function HajjTab({ t, site, readOnly }: { t: AdminWords; site: AdminSite; readOnly: boolean }) {
  const [rows, setRows] = useState<PackageRow[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get<{ packages?: unknown }>(`/admin/hajj-packages?tenant=${site.id}`);
      setRows(toRows(r?.packages));
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : t.failed });
    }
  }, [site.id, t.failed]);

  useEffect(() => {
    setDraft(null);
    setMsg(null);
    load();
  }, [load]);

  function payload(d: Draft) {
    return {
      tenant: site.id,
      kind: d.kind,
      title: d.title.trim(),
      provider: d.provider.trim() || null,
      description: d.description.trim() || null,
      // No price on the Hajj & Umrah cards for now (owner, 29 Oct 2026: "kosongin harganya"):
      // saving a package clears any price it had.
      price: null,
      duration: d.duration.trim() || null,
      departure: d.departure.trim() || null,
      image_url: d.image_url.trim() || null,
      badge: d.badge.trim() || null,
      features: d.featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
      contact_url: d.contact_url.trim() || null,
      sort_order: Number.isFinite(d.sort_order) ? d.sort_order : 99,
      visible: d.visible,
    };
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) return setMsg({ ok: false, text: t.hajj.needTitle });
    setBusy(true);
    setMsg(null);
    try {
      if (draft.id) await api.put(`/admin/hajj-packages/${draft.id}`, payload(draft));
      else await api.post("/admin/hajj-packages", payload(draft));
      setMsg({ ok: true, text: draft.id ? t.hajj.updated : t.hajj.added });
      setDraft(null);
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error && e.message ? e.message : t.failed });
    } finally {
      setBusy(false);
    }
  }

  async function toggle(r: PackageRow) {
    try {
      // The site goes in the query: the switch sends only { visible }.
      await api.put(`/admin/hajj-packages/${r.id}?tenant=${site.id}`, { visible: !r.visible });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : t.failed });
    }
  }

  async function remove(r: PackageRow) {
    if (!window.confirm(fill(t.hajj.removeConfirm, { title: r.title }))) return;
    try {
      await api.del(`/admin/hajj-packages/${r.id}?tenant=${site.id}`);
      setMsg({ ok: true, text: t.hajj.removed });
      if (draft?.id === r.id) setDraft(null);
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : t.failed });
    }
  }

  const input = "mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-hidden transition focus:border-accent";
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const visible = rows.filter((r) => r.visible).length;

  return (
    <div className="space-y-6" data-testid="admin-hajj">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">🕋 {t.hajj.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">{t.hajj.lead}</p>
          <p className="mt-2 text-xs text-text-secondary">{t.hajj.noPrice}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href={sitePageUrl(site, "/haji-umroh")} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">{t.viewOnSite}</a>
          {!readOnly && !draft && (
            <button type="button" onClick={() => setDraft({ ...EMPTY })} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 dark:bg-accent dark:text-primary" data-testid="hajj-new">
              {t.hajj.add}
            </button>
          )}
        </div>
      </div>

      {msg && <p className={`rounded-xl px-4 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`} role={msg.ok ? "status" : "alert"}>{msg.text}</p>}

      {draft && !readOnly && (
        <section className="rounded-3xl border border-accent/50 bg-accent/5 p-5 sm:p-6" data-testid="hajj-editor">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium">
              {t.hajj.kind}
              <select className={input} value={draft.kind} onChange={(e) => set({ kind: e.target.value === "hajj" ? "hajj" : "umrah" })}>
                <option value="umrah">{t.hajj.umrah}</option>
                <option value="hajj">{t.hajj.hajj}</option>
              </select>
            </label>
            <label className="block text-xs font-medium">{t.hajj.fTitle}<input className={input} value={draft.title} maxLength={160} onChange={(e) => set({ title: e.target.value })} data-testid="hajj-title" /></label>
            <label className="block text-xs font-medium">{t.hajj.fProvider}<input className={input} value={draft.provider} onChange={(e) => set({ provider: e.target.value })} /></label>
            <label className="block text-xs font-medium">{t.hajj.fBadge}<input className={input} value={draft.badge} onChange={(e) => set({ badge: e.target.value })} /></label>
            <label className="block text-xs font-medium sm:col-span-2">{t.hajj.fDesc}<textarea className={input} rows={2} value={draft.description} onChange={(e) => set({ description: e.target.value })} /></label>
            <label className="block text-xs font-medium">{t.hajj.fDuration}<input className={input} value={draft.duration} onChange={(e) => set({ duration: e.target.value })} /></label>
            <label className="block text-xs font-medium">{t.hajj.fDeparture}<input className={input} value={draft.departure} onChange={(e) => set({ departure: e.target.value })} /></label>
            <label className="block text-xs font-medium">{t.hajj.fSort}<input className={input} type="number" value={draft.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></label>
            <label className="block text-xs font-medium sm:col-span-2">{t.hajj.fContact}<input className={input} inputMode="url" value={draft.contact_url} onChange={(e) => set({ contact_url: e.target.value })} /></label>
            <label className="block text-xs font-medium sm:col-span-2">{t.hajj.fImage}<input className={input} inputMode="url" value={draft.image_url} onChange={(e) => set({ image_url: e.target.value })} /></label>
            <label className="block text-xs font-medium sm:col-span-2">
              {t.hajj.fFeatures}
              <textarea className={input} rows={4} value={draft.featuresText} placeholder={t.hajj.featuresHint} onChange={(e) => set({ featuresText: e.target.value })} />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={save} disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60 dark:bg-accent dark:text-primary" data-testid="hajj-save">
              {busy ? t.saving : t.save}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-(--color-border) px-6 py-2.5 text-sm">{t.hajj.cancel}</button>
          </div>
        </section>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{fill(t.hajj.count, { n: rows.length, v: visible })}</p>
      {rows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-(--color-border) px-5 py-8 text-center text-sm text-text-secondary">{t.hajj.empty}</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {rows.map((r) => {
            const list = features(r);
            return (
              <article key={r.id} className={`card-premium-static flex flex-col rounded-3xl p-5 ${r.visible ? "" : "opacity-60"}`} data-testid="hajj-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-accent/50 px-2.5 py-0.5 text-xs font-semibold text-accent">{r.kind === "hajj" ? t.hajj.hajj : t.hajj.umrah}</span>
                  {r.badge && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-primary">{r.badge}</span>}
                  <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs ${r.visible ? "bg-success/15 text-success" : "bg-black/5 text-text-secondary dark:bg-white/10"}`}>{r.visible ? t.hajj.shown : t.hajj.hidden}</span>
                </div>
                <h3 className="mt-3 font-heading text-lg leading-snug">{r.title}</h3>
                {r.provider && <p className="text-sm text-text-secondary">{r.provider}</p>}
                <p className="mt-2 w-fit rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{t.hajj.forRent}</p>
                <p className="mt-1 text-xs text-text-secondary">{[r.duration, r.departure].filter(Boolean).join(" · ")}</p>
                {list.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {list.slice(0, 4).map((f) => <li key={f} className="flex gap-2"><span className="text-accent" aria-hidden>✓</span>{f}</li>)}
                  </ul>
                )}
                {!readOnly && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-(--color-border) pt-4">
                    <button type="button" onClick={() => setDraft(toDraft(r))} className="rounded-full border border-(--color-border) px-3 py-1 text-xs hover:border-accent">{t.hajj.edit}</button>
                    <button type="button" onClick={() => toggle(r)} className="rounded-full border border-(--color-border) px-3 py-1 text-xs hover:border-accent">{r.visible ? t.hajj.hide : t.hajj.show}</button>
                    <button type="button" onClick={() => remove(r)} className="rounded-full border border-danger/40 px-3 py-1 text-xs text-danger">{t.hajj.remove}</button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {readOnly && <p className="text-sm text-text-secondary">👁️ {t.readOnly}</p>}
    </div>
  );
}
