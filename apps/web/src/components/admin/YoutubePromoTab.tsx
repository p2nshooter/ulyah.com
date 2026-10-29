"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fill, type AdminWords } from "@/lib/admin-i18n";
import { sitePageUrl, type AdminSite } from "@/lib/admin-sites";

/**
 * Promo YouTube — the six slots of a site's Live page (docs/ADSENSE-BLUEPRINT.md §18).
 * Each slot shows a YouTube channel, live broadcast or video for whoever the site
 * promotes; a slot without a link shows the "rent this slot" card. Saved in R2 per site
 * (PUT /admin/promo/youtube); until a site saves, it shows the shared list.
 */
interface Slot { slot: number; title: string; url: string; sponsor: string; active: boolean }

const YOUTUBE = /^https:\/\/((www|m)\.)?youtube\.com\/|^https:\/\/youtu\.be\//i;

function toSlots(raw: unknown): Slot[] {
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: 6 }, (_, i) => {
    const r = (list.find((x) => x && typeof x === "object" && (x as Slot).slot === i + 1) ?? {}) as Partial<Slot>;
    return {
      slot: i + 1,
      title: typeof r.title === "string" ? r.title : "",
      url: typeof r.url === "string" ? r.url : "",
      sponsor: typeof r.sponsor === "string" ? r.sponsor : "",
      active: r.active === true,
    };
  });
}

/** The video id of a watch, live, short or youtu.be link — for a thumbnail. */
function videoId(url: string): string | null {
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    if (u.hostname === "youtu.be") return parts[0] ?? null;
    for (const k of ["live", "shorts", "embed"]) {
      const i = parts.indexOf(k);
      if (i >= 0 && parts[i + 1]) return parts[i + 1]!;
    }
  } catch {
    /* not a URL yet */
  }
  return null;
}

export function YoutubePromoTab({ t, site, readOnly }: { t: AdminWords; site: AdminSite; readOnly: boolean }) {
  const [slots, setSlots] = useState<Slot[]>(toSlots([]));
  const [own, setOwn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setMsg(null);
    api.get<{ youtube?: { own?: unknown; items?: unknown } }>(`/admin/promo?site=${site.id}`)
      .then((r) => {
        if (!alive) return;
        setSlots(toSlots(r?.youtube?.items));
        setOwn(r?.youtube?.own === true);
      })
      .catch((e) => alive && setMsg({ ok: false, text: e instanceof Error ? e.message : t.failed }));
    return () => {
      alive = false;
    };
  }, [site.id, t.failed]);

  const set = (i: number, patch: Partial<Slot>) => setSlots((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  async function save() {
    const bad = slots.find((s) => s.url.trim() && !YOUTUBE.test(s.url.trim()));
    if (bad) {
      setMsg({ ok: false, text: fill(t.yt.badUrl, { n: bad.slot }) });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const items = slots.map((s) => ({ ...s, url: s.url.trim(), title: s.title.trim(), sponsor: s.sponsor.trim(), active: s.active && !!s.url.trim() }));
      const r = await api.put<{ items?: unknown }>(`/admin/promo/youtube?site=${site.id}`, { items });
      setSlots(toSlots(r?.items));
      setOwn(true);
      setMsg({ ok: true, text: t.saved });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : t.failed });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-hidden transition focus:border-accent disabled:opacity-70";

  return (
    <div className="space-y-6" data-testid="admin-youtube-promo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">📺 {t.yt.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">{t.yt.lead}</p>
          <p className="mt-2 text-xs text-text-secondary">{own ? t.ownList : t.sharedList}</p>
        </div>
        <a href={sitePageUrl(site, "/live")} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">{t.viewOnSite}</a>
      </div>

      {msg && <p className={`rounded-xl px-4 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`} role={msg.ok ? "status" : "alert"}>{msg.text}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {slots.map((s, i) => {
          const vid = videoId(s.url);
          const filled = !!s.url.trim();
          return (
            <fieldset key={s.slot} disabled={readOnly} className="rounded-3xl border border-(--color-border) p-5" data-testid={`yt-slot-${s.slot}`}>
              <legend className="sr-only">{fill(t.yt.slot, { n: s.slot })}</legend>
              <div className="flex items-center justify-between gap-3">
                <span className="font-heading text-base" aria-hidden>{fill(t.yt.slot, { n: s.slot })}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${filled && s.active ? "bg-success/15 text-success" : "bg-black/5 text-text-secondary dark:bg-white/10"}`}>
                  {filled ? (s.active ? "● LIVE" : "○") : t.yt.free}
                </span>
              </div>
              <div className="mt-3 flex gap-4">
                <div className="hidden aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-black/80 sm:block" aria-label={t.yt.preview}>
                  {vid ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full place-items-center text-2xl text-white/70" aria-hidden>{filled ? "▶" : "＋"}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block text-xs font-medium">{t.yt.fTitle}<input className={input} value={s.title} maxLength={120} onChange={(e) => set(i, { title: e.target.value })} /></label>
                  <label className="block text-xs font-medium">{t.yt.fUrl}<input className={input} value={s.url} maxLength={300} inputMode="url" placeholder="https://www.youtube.com/…" onChange={(e) => set(i, { url: e.target.value })} /></label>
                  <label className="block text-xs font-medium">{t.yt.fSponsor}<input className={input} value={s.sponsor} maxLength={120} onChange={(e) => set(i, { sponsor: e.target.value })} /></label>
                  <label className="flex items-center gap-2 pt-1 text-sm">
                    <input type="checkbox" checked={s.active} disabled={readOnly || !filled} onChange={(e) => set(i, { active: e.target.checked })} />
                    {t.yt.fActive}
                  </label>
                </div>
              </div>
            </fieldset>
          );
        })}
      </div>

      {readOnly ? (
        <p className="text-sm text-text-secondary">👁️ {t.readOnly}</p>
      ) : (
        <button type="button" onClick={save} disabled={busy} className="rounded-full bg-primary px-7 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60 dark:bg-accent dark:text-primary" data-testid="yt-save">
          {busy ? t.saving : t.save}
        </button>
      )}
    </div>
  );
}
