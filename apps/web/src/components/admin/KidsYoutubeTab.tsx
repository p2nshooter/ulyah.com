"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fill, type AdminWords } from "@/lib/admin-i18n";
import { sitePageUrl, type AdminSite } from "@/lib/admin-sites";

/**
 * YouTube anak — the kids' YouTube channels of a site's kids page, in the order shown
 * there (docs/ADSENSE-BLUEPRINT.md §18). Saved in R2 per site (PUT /admin/promo/kids);
 * until a site saves, it shows the shared list.
 */
interface Channel { channelId: string; title: string; country: string; language: string; visible: boolean }

const CHANNEL = /(?:channel\/)?(UC[\w-]{10,40})\/?$/;

function toChannels(raw: unknown): Channel[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((c): c is Channel => !!c && typeof c === "object" && typeof (c as Channel).channelId === "string")
    .map((c) => ({
      channelId: c.channelId,
      title: typeof c.title === "string" ? c.title : "",
      country: typeof c.country === "string" ? c.country : "",
      language: typeof c.language === "string" ? c.language : "",
      visible: c.visible !== false,
    }));
}

const channelOf = (v: string) => v.trim().match(CHANNEL)?.[1] ?? "";

export function KidsYoutubeTab({ t, site, readOnly }: { t: AdminWords; site: AdminSite; readOnly: boolean }) {
  const [rows, setRows] = useState<Channel[]>([]);
  const [own, setOwn] = useState(false);
  const [draft, setDraft] = useState({ title: "", url: "", country: "", language: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setMsg(null);
    api.get<{ kids?: { own?: unknown; items?: unknown } }>(`/admin/promo?site=${site.id}`)
      .then((r) => {
        if (!alive) return;
        setRows(toChannels(r?.kids?.items));
        setOwn(r?.kids?.own === true);
      })
      .catch((e) => alive && setMsg({ ok: false, text: e instanceof Error ? e.message : t.failed }));
    return () => {
      alive = false;
    };
  }, [site.id, t.failed]);

  function add() {
    const id = channelOf(draft.url);
    if (!draft.title.trim() || !draft.country.trim() || !draft.url.trim()) return setMsg({ ok: false, text: t.kids.missing });
    if (!id) return setMsg({ ok: false, text: t.kids.badUrl });
    if (rows.some((c) => c.channelId === id)) return setMsg({ ok: false, text: t.kids.dup });
    setRows((all) => [...all, { channelId: id, title: draft.title.trim(), country: draft.country.trim(), language: draft.language.trim(), visible: true }]);
    setDraft({ title: "", url: "", country: "", language: "" });
    setMsg(null);
  }

  const move = (i: number, d: -1 | 1) =>
    setRows((all) => {
      const j = i + d;
      if (j < 0 || j >= all.length) return all;
      const next = [...all];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.put<{ items?: unknown }>(`/admin/promo/kids?site=${site.id}`, { items: rows });
      setRows(toChannels(r?.items));
      setOwn(true);
      setMsg({ ok: true, text: t.saved });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : t.failed });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-hidden transition focus:border-accent";
  const small = "rounded-full border border-(--color-border) px-3 py-1 text-xs transition hover:border-accent disabled:opacity-40";

  return (
    <div className="space-y-6" data-testid="admin-kids-youtube">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">🧒 {t.kids.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">{t.kids.lead}</p>
          <p className="mt-2 text-xs text-text-secondary">{own ? t.ownList : t.sharedList}</p>
        </div>
        <a href={sitePageUrl(site, "/anak")} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">{t.viewOnSite}</a>
      </div>

      {msg && <p className={`rounded-xl px-4 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`} role={msg.ok ? "status" : "alert"}>{msg.text}</p>}

      {!readOnly && (
        <section className="rounded-3xl border border-(--color-border) p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-medium">{t.kids.fName}<input className={input} value={draft.title} maxLength={120} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="block text-xs font-medium lg:col-span-2">{t.kids.fUrl}<input className={input} value={draft.url} maxLength={300} inputMode="url" placeholder="https://www.youtube.com/channel/UC…" onChange={(e) => setDraft({ ...draft, url: e.target.value })} /></label>
            <label className="block text-xs font-medium">{t.kids.fCountry}<input className={input} value={draft.country} maxLength={40} onChange={(e) => setDraft({ ...draft, country: e.target.value })} /></label>
            <label className="block text-xs font-medium">{t.kids.fLang}<input className={input} value={draft.language} maxLength={20} onChange={(e) => setDraft({ ...draft, language: e.target.value })} /></label>
          </div>
          <button type="button" onClick={add} className="mt-4 rounded-full border border-accent px-5 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10" data-testid="kids-add">{t.kids.add}</button>
        </section>
      )}

      <section className="rounded-3xl border border-(--color-border)">
        <p className="border-b border-(--color-border) px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {fill(t.kids.count, { n: rows.length, v: rows.filter((r) => r.visible).length })}
        </p>
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-secondary">{t.kids.empty}</p>
        ) : (
          <ul className="divide-y divide-(--color-border)">
            {rows.map((c, i) => (
              <li key={c.channelId} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm" data-testid="kids-row">
                <span className="w-6 text-right text-xs text-text-secondary">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <a href={`https://www.youtube.com/channel/${c.channelId}`} target="_blank" rel="noopener noreferrer" className={`font-medium hover:underline ${c.visible ? "" : "text-text-secondary line-through"}`}>{c.title}</a>
                  <span className="block text-xs text-text-secondary">{[c.country, c.language].filter(Boolean).join(" · ")}</span>
                </div>
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={c.visible} disabled={readOnly} onChange={(e) => setRows((all) => all.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)))} />
                  {t.kids.fVisible}
                </label>
                {!readOnly && (
                  <div className="flex gap-1.5">
                    <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)} aria-label={t.kids.up}>↑</button>
                    <button type="button" className={small} disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label={t.kids.down}>↓</button>
                    <button type="button" className={small} onClick={() => setRows((all) => all.filter((_, j) => j !== i))}>{t.kids.remove}</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {readOnly ? (
        <p className="text-sm text-text-secondary">👁️ {t.readOnly}</p>
      ) : (
        <button type="button" onClick={save} disabled={busy} className="rounded-full bg-primary px-7 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60 dark:bg-accent dark:text-primary" data-testid="kids-save">
          {busy ? t.saving : t.save}
        </button>
      )}
    </div>
  );
}
