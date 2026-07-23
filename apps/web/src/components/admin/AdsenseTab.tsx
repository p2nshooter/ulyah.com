"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SiteState {
  enabled: boolean;
  approved: boolean;
  adsterra: boolean;
}
interface Config {
  clientId: string;
  slots: Record<string, string>;
  sites: Record<string, SiteState>;
  adsterra?: boolean;
}

// One responsive unit id can drive every placement the network uses.
const PLACEMENTS = ["in_article", "in_article_1", "in_article_2", "list", "footer", "sidebar"];

const SITE_LABELS: { key: string; label: string; group: "ulyah" | "axto" | "es" }[] = [
  { key: "ulyah", label: "ulyah.com", group: "ulyah" },
  { key: "1fr", label: "1fr.fr", group: "ulyah" },
  { key: "tilawa", label: "tilawa.de", group: "ulyah" },
  { key: "dawa", label: "dawa.es", group: "ulyah" },
  // xad.es reads its ad config as tenant "xad" (TENANT.id) — without this row
  // the English ecosystem site could never be switched on from the admin.
  { key: "xad", label: "xad.es", group: "ulyah" },
  { key: "axto-io", label: "axto.io", group: "axto" },
  { key: "axto-dev", label: "axto.dev", group: "axto" },
  { key: "axto-us", label: "axto.us", group: "axto" },
  { key: "profity-in", label: "profity.in", group: "es" },
  { key: "oldco-in", label: "oldco.in", group: "es" },
  { key: "xaa-es", label: "xaa.es", group: "es" },
  { key: "xad-es", label: "xad.es (lama)", group: "es" },
  { key: "jai-lat", label: "jai.lat", group: "es" },
  { key: "lie-skin", label: "lie.skin", group: "es" },
];

// Only these ecosystem sites actually carry Adsterra inventory (matches the
// INVENTORY map in NetworkAd.tsx). The AXTO + article sites monetise with
// AdSense only, so an Adsterra toggle for them would do nothing — we list just
// the sites where the switch has a real effect.
const ADSTERRA_SITES = ["ulyah", "1fr", "tilawa", "dawa", "xad"];

function coerce(v: unknown): SiteState {
  // adsterra defaults ON so a site whose stored config predates the per-site
  // Adsterra toggle keeps showing its network ads until the owner turns it off.
  if (typeof v === "boolean") return { enabled: v, approved: false, adsterra: true };
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return { enabled: o.enabled === true, approved: o.approved === true, adsterra: o.adsterra !== false };
  }
  return { enabled: false, approved: false, adsterra: true };
}

/**
 * Central ad control for the WHOLE network. Every site reads /content/ad-config
 * from api.ulyah.com, so what is set here governs all of them. Flow the owner
 * asked for: (1) paste the ONE real ad-unit id once; (2) turn a site ON to
 * preview ad positions even before approval; (3) tick "ACC" on the sites
 * AdSense has approved — only ON + ACC sites serve live ads, so approving one
 * site never switches them all on at once. Ads never appear in any admin.
 */
export function AdsenseTab() {
  const [config, setConfig] = useState<Config | null>(null);
  const [masterId, setMasterId] = useState("");
  const [sites, setSites] = useState<Record<string, SiteState>>({});
  const [adsterra, setAdsterra] = useState(true);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Config>("/admin/adsense-config")
      .then((cfg) => {
        setConfig(cfg);
        setMasterId(cfg.slots?.in_article ?? cfg.slots?.in_article_1 ?? "");
        setAdsterra(cfg.adsterra !== false);
        const s: Record<string, SiteState> = {};
        for (const { key } of SITE_LABELS) s[key] = coerce(cfg.sites?.[key]);
        setSites(s);
      })
      .catch(() => {});
  }, []);

  // The one write path. Persists an EXPLICIT sites snapshot + adsterra value so
  // an auto-save never races React's async state (using the closure `sites`
  // right after setSites would post the STALE value). Every toggle calls this,
  // so a change is saved the instant it's made — no "refresh reverts it".
  async function persist(nextSites: Record<string, SiteState>, adsterraNext: boolean) {
    setBusy(true);
    const id = masterId.replace(/[^0-9]/g, "").slice(0, 20);
    const slots: Record<string, string> = {};
    for (const p of PLACEMENTS) slots[p] = id;
    try {
      const next = await api.post<Config>("/admin/adsense-config", { slots, sites: nextSites, adsterra: adsterraNext });
      setConfig(next);
      setAdsterra(next.adsterra !== false);
      const s: Record<string, SiteState> = {};
      for (const { key } of SITE_LABELS) s[key] = coerce(next.sites?.[key]);
      setSites(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setBusy(false);
    }
  }

  // The explicit "Simpan" button (also saves the typed ad-unit id).
  function save(overrides?: { adsterra?: boolean }) {
    return persist(sites, overrides?.adsterra ?? adsterra);
  }

  // Each toggle computes the next snapshot, updates the UI, AND auto-saves it.
  function toggle(key: string) {
    const next = { ...sites, [key]: { ...coerce(sites[key]), enabled: !coerce(sites[key]).enabled } };
    setSites(next);
    persist(next, adsterra);
  }
  function toggleApproved(key: string) {
    const next = { ...sites, [key]: { ...coerce(sites[key]), approved: !coerce(sites[key]).approved } };
    setSites(next);
    persist(next, adsterra);
  }
  function toggleAdsterra(key: string) {
    const next = { ...sites, [key]: { ...coerce(sites[key]), adsterra: !coerce(sites[key]).adsterra } };
    setSites(next);
    persist(next, adsterra);
  }
  function setAll(field: "enabled" | "approved", v: boolean) {
    const next = { ...sites };
    for (const { key } of SITE_LABELS) next[key] = { ...coerce(next[key]), [field]: v };
    setSites(next);
    persist(next, adsterra);
  }
  function setAllAdsterra(v: boolean) {
    const next = { ...sites };
    for (const key of ADSTERRA_SITES) next[key] = { ...coerce(next[key]), adsterra: v };
    setSites(next);
    persist(next, adsterra);
  }

  if (!config) return <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>;

  const hasRealId = !!masterId.replace(/[^0-9]/g, "");
  const onCount = SITE_LABELS.filter(({ key }) => coerce(sites[key]).enabled).length;
  const liveCount = SITE_LABELS.filter(({ key }) => coerce(sites[key]).enabled && coerce(sites[key]).approved).length;
  const adsterraOnCount = ADSTERRA_SITES.filter((k) => coerce(sites[k]).adsterra).length;
  const labelOf = (key: string) => SITE_LABELS.find((s) => s.key === key)?.label ?? key;
  const groupIcon = (g: string) => (g === "axto" ? "🛰️" : g === "es" ? "📰" : "🕌");

  return (
    <div className="space-y-6">
      {/* Master ON/OFF for the Adsterra network ads across every site. OFF =
          every Adsterra unit hidden everywhere, no exception. Applies within
          ≤1 menit as each site re-reads /content/ad-config. */}
      <section
        className={`rounded-xl border p-4 ${
          adsterra ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-rose-500/40 bg-rose-500/[0.06]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-base">📣 Iklan Adsterra — Sakelar Utama</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              {adsterra
                ? "Iklan Adsterra AKTIF di semua situs. Matikan untuk menyembunyikan SEMUA iklan Adsterra tanpa kecuali."
                : "Iklan Adsterra MATI — tidak ada satu pun unit Adsterra yang tampil di situs mana pun."}
            </p>
          </div>
          <button
            onClick={() => {
              const next = !adsterra;
              setAdsterra(next);
              save({ adsterra: next });
            }}
            disabled={busy}
            role="switch"
            aria-checked={adsterra}
            className={`relative inline-flex h-9 w-20 shrink-0 items-center rounded-full px-1 text-xs font-bold transition disabled:opacity-60 ${
              adsterra ? "bg-emerald-500 text-white" : "bg-rose-500/80 text-white"
            }`}
          >
            <span
              className={`absolute inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--color-text-primary)] shadow transition-all ${
                adsterra ? "left-[calc(100%-1.85rem)]" : "left-1"
              }`}
            >
              {adsterra ? "ON" : "OFF"}
            </span>
            <span className={adsterra ? "pl-1.5" : "ml-auto pr-1.5"}>{adsterra ? "ON" : "OFF"}</span>
          </button>
        </div>
      </section>

      {/* Per-site Adsterra checklist — the owner asked for the SAME on/off
          checklist Adsterra has that AdSense already has ("adsterra harus punya
          checklist on/off per situs… semua halaman ga muncul klo di off di satu
          situs"). A site shows Adsterra only when the master switch above AND
          its own toggle here are both ON. Only the five ecosystem sites that
          carry Adsterra inventory are listed. */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-heading text-base">📣 Adsterra per Situs — Checklist ON/OFF</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              Matikan Adsterra untuk satu situs → semua halaman situs itu tidak menampilkan iklan Adsterra.{" "}
              {adsterra
                ? "Sakelar utama menyala, jadi setelan per-situs di bawah berlaku."
                : "Sakelar utama MATI, jadi semua Adsterra tetap tersembunyi apa pun setelan di bawah."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={() => setAllAdsterra(true)} disabled={busy} className="rounded-full border border-[var(--color-border)] px-3 py-1 hover:border-accent disabled:opacity-50">
              Semua ON
            </button>
            <button onClick={() => setAllAdsterra(false)} disabled={busy} className="rounded-full border border-[var(--color-border)] px-3 py-1 hover:border-accent disabled:opacity-50">
              Semua OFF
            </button>
          </div>
        </div>
        <div className={`mt-3 grid gap-2 sm:grid-cols-2 ${adsterra ? "" : "opacity-50"}`}>
          {ADSTERRA_SITES.map((key) => {
            const on = coerce(sites[key]).adsterra;
            return (
              <button
                key={key}
                onClick={() => toggleAdsterra(key)}
                disabled={busy}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition disabled:opacity-60 ${
                  on ? "border-emerald-500/50 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/[0.06]"
                }`}
              >
                <span>🕌 {labelOf(key)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    on ? "bg-emerald-500 text-white" : "bg-rose-500/80 text-white"
                  }`}
                >
                  {on ? "ON" : "OFF"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]/70">
          {adsterraOnCount} dari {ADSTERRA_SITES.length} situs menyalakan Adsterra. Setiap perubahan{" "}
          <b>otomatis tersimpan</b> dan berlaku ≤1 menit di situs. Situs lain (AXTO, artikel) tidak memakai Adsterra.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Kontrol Iklan Jaringan</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Satu tempat mengatur iklan untuk <b>seluruh situs</b> (ulyah.com + saudara, AXTO, dan situs artikel:
          profity.in, oldco.in, xaa.es, xad.es, jai.lat, lie.skin). Bawaan semua <b>mati</b>. Nyalakan situs untuk
          melihat posisi iklan (kotak putus-putus), isi ID unit iklan asli sekali, lalu <b>centang “ACC”</b> hanya
          pada situs yang sudah diterima AdSense — cuma situs ON + ACC yang menayangkan iklan asli, jadi tidak semua
          langsung aktif. Iklan tidak pernah muncul di portal admin.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">1 · ID Unit Iklan AdSense</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Publisher: <code className="rounded bg-black/10 px-1">{config.clientId}</code>. Tempel ID unit iklan
          responsif (angka saja) — dipakai semua posisi (in-article, sidebar, footer, dst.) di semua situs yang ACC.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
            placeholder="mis. 1234567890"
            inputMode="numeric"
            className="w-52 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          />
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${hasRealId ? "bg-success/15 text-success" : "bg-black/10 text-[var(--color-text-secondary)]"}`}
          >
            {hasRealId ? "● Ada ID — situs ON+ACC menayangkan iklan asli" : "○ Belum ada ID — situs ON tampil pratinjau"}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-heading text-base">2 · Aktif (tampil) & ACC (iklan asli) per Situs</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={() => setAll("enabled", true)} disabled={busy} className="rounded-full border border-[var(--color-border)] px-3 py-1 hover:border-accent disabled:opacity-50">
              Semua ON
            </button>
            <button onClick={() => setAll("enabled", false)} disabled={busy} className="rounded-full border border-[var(--color-border)] px-3 py-1 hover:border-accent disabled:opacity-50">
              Semua OFF
            </button>
            <button onClick={() => setAll("approved", false)} disabled={busy} className="rounded-full border border-[var(--color-border)] px-3 py-1 hover:border-accent disabled:opacity-50">
              Hapus semua ACC
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SITE_LABELS.map(({ key, label, group }) => {
            const st = coerce(sites[key]);
            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                  st.enabled ? "border-accent bg-accent/10" : "border-[var(--color-border)]"
                }`}
              >
                <button onClick={() => toggle(key)} disabled={busy} className="flex items-center gap-2 text-left disabled:opacity-60">
                  <span>{groupIcon(group)} {label}</span>
                  <span className={st.enabled ? "font-medium text-accent" : "text-[var(--color-text-secondary)]"}>
                    {st.enabled ? "ON" : "OFF"}
                  </span>
                </button>
                <label className={`flex cursor-pointer items-center gap-1.5 text-xs ${st.enabled ? "" : "opacity-40"}`}>
                  <input
                    type="checkbox"
                    checked={st.approved}
                    disabled={!st.enabled || busy}
                    onChange={() => toggleApproved(key)}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                  ACC{st.enabled && st.approved && hasRealId ? " ✓ live" : ""}
                </label>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]/70">
          {onCount} situs aktif · {liveCount} situs menayangkan iklan asli.
        </p>
      </section>

      <button
        onClick={() => save()}
        disabled={busy}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm text-white disabled:opacity-60 dark:bg-accent dark:text-primary"
      >
        {saved ? "Tersimpan ✓ — berlaku ≤1 menit di semua situs" : busy ? "Menyimpan…" : "Simpan ID unit iklan (sakelar ON/OFF sudah otomatis tersimpan)"}
      </button>
    </div>
  );
}
