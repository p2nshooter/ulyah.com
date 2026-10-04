"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MiniBarChart } from "./MiniBarChart";

/**
 * Iklan & Ad Manager: the control room of docs/ADMANAGER-BLUEPRINT.md.
 *
 * Owner: "Apapun yg mau di laporkan, tampilkan di admin ulyah.com" and "full
 * otomatis tanpa pengendali setelah sy input api admanager, hanya bekerja di
 * website yg sudah di approve oleh adsense". So this panel shows, never asks:
 * which sites AdSense has approved (read from the AdSense API), what the
 * runner did (dry-run or live), the money, and the floor values to paste
 * (the one step Google offers no API for). dawa.es is not here: it is not the
 * owner's any more.
 */

interface SiteRow {
  domain: string;
  trackId: string;
  lang: string;
  built: boolean;
  adsenseState: string | null;
  adsenseChecked: string | null;
  readySince: string | null;
  autoAds: boolean | null;
  gamStatus: string;
  views7d: number;
  revenue30d: number;
  impressions30d: number;
  clicks30d: number;
  requests30d: number;
  pageViews30d: number;
}
interface FloorRow {
  site: string;
  position: string;
  tier: string;
  floor: number;
  previous_floor: number | null;
  reason: string | null;
  decided_at: string;
}
interface ActionRow {
  id: number;
  at: string;
  mode: string;
  kind: string;
  site: string | null;
  detail: string;
  ok: number;
}
interface Overview {
  config: {
    placement: "auto" | "gam";
    mode: "off" | "dry-run" | "live";
    networkCode: string | null;
    serviceAccountEmail: string | null;
    serviceAccountError: string | null;
    adsenseConnected: boolean;
    adsenseClientSet: boolean;
    publisher: string;
    redirectUri: string;
  };
  lastRun: { mode: string; ranAt: string; errors: number; actions: number } | null;
  sites: SiteRow[];
  daily: { day: string; revenue: number; impressions: number }[];
  floors: FloorRow[];
  actions: ActionRow[];
  positions: { id: string; label: string; sizes: string[] }[];
}

const STATE_LABEL: Record<string, [string, string]> = {
  READY: ["Siap tayang", "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"],
  GETTING_READY: ["Sedang dicek Google", "bg-amber-500/15 text-amber-700 dark:text-amber-300"],
  REQUIRES_REVIEW: ["Perlu ditinjau", "bg-amber-500/15 text-amber-700 dark:text-amber-300"],
  NEEDS_ATTENTION: ["Perlu perhatian", "bg-red-500/15 text-red-700 dark:text-red-300"],
};
const GAM_LABEL: Record<string, string> = { none: "—", live: "Ad unit aktif", paused: "Ad unit nonaktif" };
const TIER_LABEL: Record<string, string> = { T1: "T1 (US, DE, FR, GB, …)", T2: "T2 (ES, IT, JP, AE, …)", T3: "T3 (lainnya)" };
const usd = (n: number) => `$${(n ?? 0).toFixed(2)}`;

export function AdOpsTab() {
  const [data, setData] = useState<Overview | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [test, setTest] = useState<{ adsense: { ok: boolean; detail: string }; adManager: { ok: boolean; detail: string } } | null>(null);

  const load = useCallback(() => {
    api
      .get<Overview>("/admin/adops/overview")
      .then(setData)
      .catch((e) => setMsg(e instanceof Error ? e.message : "Gagal memuat"));
  }, []);
  useEffect(load, [load]);

  async function act(name: string, fn: () => Promise<void>) {
    setBusy(name);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(null);
      load();
    }
  }

  if (!data) return <p className="text-sm text-text-secondary">{msg ?? "Memuat…"}</p>;
  const { config: cfg } = data;
  const built = data.sites.filter((s) => s.built);
  const ready = built.filter((s) => s.adsenseState === "READY");
  const total30 = built.reduce((n, s) => n + s.revenue30d, 0);
  const imp30 = built.reduce((n, s) => n + s.impressions30d, 0);
  const req30 = built.reduce((n, s) => n + s.requests30d, 0);
  const pv30 = built.reduce((n, s) => n + s.pageViews30d, 0);
  const auto = cfg.placement === "auto";
  // Auto ads: page RPM (earnings per 1,000 page views, AdSense's own headline
  // number). Ad Manager: RPM per 1,000 ad requests.
  const rpmBase = auto ? pv30 : req30;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 p-5">
        <h2 className="font-heading text-xl">💰 Iklan & Ad Manager (otomatis)</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Satu akun AdSense <b>{cfg.publisher}</b> untuk semua situs (dawa.es tidak termasuk).{" "}
          {auto ? (
            <>
              Penempatan: <b>Auto ads</b> — halaman hanya memuat cuplikan AdSense, tag meta dan ads.txt, tanpa slot manual. Google menempatkan iklan sendiri
              setelah situs <b>Siap tayang</b>. Panel ini membaca status persetujuan, saklar Auto ads per situs, dan laporan pendapatan AdSense.
            </>
          ) : (
            <>
              Ad Manager hanya bekerja di situs yang statusnya <b>Siap tayang</b> di AdSense.
            </>
          )}{" "}
          Semua keputusan memakai aturan tetap (lihat <code>docs/ADMANAGER-BLUEPRINT.md</code>); AI hanya menulis ringkasan.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Situs siap tayang" value={`${ready.length} / ${built.length}`} />
          <Stat label="Pendapatan 30 hari" value={usd(total30)} />
          <Stat label="Tayangan 30 hari" value={imp30.toLocaleString("id-ID")} />
          <Stat label={auto ? "RPM halaman 30 hari" : "RPM 30 hari"} value={rpmBase ? usd((total30 / rpmBase) * 1000) : "—"} />
        </div>
      </header>

      {msg && <p className="rounded-sm bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">{msg}</p>}

      <section className="rounded-2xl border border-(--color-border) bg-(--color-card) p-5">
        <h3 className="text-sm font-semibold">Koneksi & mode</h3>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Conn
            ok={cfg.adsenseConnected}
            title="AdSense (status situs)"
            detail={
              cfg.adsenseConnected
                ? "Terhubung"
                : cfg.adsenseClientSet
                  ? "Client ID terisi, tekan Hubungkan AdSense"
                  : "Isi Client ID & Secret di Settings → Ad Manager & AdSense"
            }
          />
          <Conn
            ok={!!(cfg.networkCode && cfg.serviceAccountEmail)}
            title={auto ? "Ad Manager (tidak dipakai di mode Auto ads)" : "Ad Manager"}
            detail={
              cfg.serviceAccountError ??
              (cfg.networkCode && cfg.serviceAccountEmail
                ? `Jaringan ${cfg.networkCode} · ${cfg.serviceAccountEmail}`
                : auto
                  ? "Opsional. Tanpa slot di halaman, unit Ad Manager tidak bisa tayang."
                  : "Isi Network Code & Service Account JSON di Settings")
            }
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-secondary">Mode:</span>
          {(["off", "dry-run", "live"] as const).map((m) => (
            <button
              key={m}
              disabled={busy !== null}
              onClick={() => act(`mode-${m}`, async () => void (await api.post("/admin/adops/mode", { mode: m })))}
              className={`rounded-full px-3 py-1 text-xs ${cfg.mode === m ? "bg-accent text-white" : "border border-(--color-border)"}`}
            >
              {m === "off" ? "Mati" : m === "dry-run" ? "Uji (dry-run)" : "Live"}
            </button>
          ))}
          <span className="mx-2 h-4 w-px bg-(--color-border)" />
          <button
            disabled={busy !== null}
            onClick={() => act("test", async () => setTest(await api.post("/admin/adops/test")))}
            className="rounded-sm border border-(--color-border) px-3 py-1 text-xs"
          >
            {busy === "test" ? "Menguji…" : "Uji koneksi"}
          </button>
          <button
            disabled={busy !== null}
            onClick={() => act("run", async () => void (await api.post("/admin/adops/run")))}
            className="rounded-sm border border-(--color-border) px-3 py-1 text-xs"
          >
            {busy === "run" ? "Menjalankan…" : "Jalankan sekarang"}
          </button>
          {cfg.adsenseClientSet && (
            <button
              disabled={busy !== null}
              onClick={() =>
                act("connect", async () => {
                  const r = await api.get<{ url: string }>("/admin/adops/adsense/connect");
                  window.location.href = r.url;
                })
              }
              className="rounded-sm bg-primary px-3 py-1 text-xs text-white dark:bg-accent dark:text-primary"
            >
              Hubungkan AdSense
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-text-secondary">
          Redirect URI untuk OAuth client: <code>{cfg.redirectUri}</code>. Mode <b>Uji</b> membaca Google dan mencatat apa yang AKAN dilakukan tanpa mengubah
          apa pun. Mode <b>Live</b> hanya bisa dipilih kalau koneksi {auto ? "AdSense" : "Ad Manager"} berhasil. Jadwal otomatis: setiap hari setelah 03.00 UTC.
          {data.lastRun &&
            ` Terakhir jalan: ${new Date(data.lastRun.ranAt).toLocaleString("id-ID")} (${data.lastRun.mode}, ${data.lastRun.actions} aksi, ${data.lastRun.errors} error).`}
        </p>
        {test && (
          <div className="mt-3 space-y-1 text-xs">
            <p className={test.adsense.ok ? "text-emerald-600" : "text-red-600"}>AdSense: {test.adsense.detail}</p>
            <p className={test.adManager.ok ? "text-emerald-600" : "text-red-600"}>Ad Manager: {test.adManager.detail}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-card) p-5">
        <h3 className="text-sm font-semibold">Pendapatan per hari (30 hari, USD)</h3>
        <MiniBarChart data={data.daily.map((d) => ({ label: d.day.slice(5), value: d.revenue }))} />
      </section>

      <section className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-card) p-5">
        <h3 className="text-sm font-semibold">Semua situs</h3>
        <table className="mt-3 w-full min-w-[720px] text-left text-xs">
          <thead className="text-text-secondary">
            <tr>
              <th className="py-1">Situs</th>
              <th>Status AdSense</th>
              <th>{auto ? "Auto ads" : "Ad Manager"}</th>
              <th className="text-right">Pengunjung 7 hr</th>
              <th className="text-right">Tayangan 30 hr</th>
              <th className="text-right">Klik 30 hr</th>
              <th className="text-right">Pendapatan 30 hr</th>
            </tr>
          </thead>
          <tbody>
            {data.sites.map((s) => {
              const st = s.adsenseState ? STATE_LABEL[s.adsenseState] : null;
              return (
                <tr key={s.trackId} className="border-t border-(--color-border)">
                  <td className="py-1.5">
                    <b>{s.domain}</b> <span className="text-text-secondary">· {s.lang}</span>
                    {!s.built && <span className="ml-1 text-text-secondary">(belum dibuat)</span>}
                  </td>
                  <td>
                    {st ? (
                      <span className={`rounded-full px-2 py-0.5 ${st[1]}`}>{st[0]}</span>
                    ) : (
                      <span className="text-text-secondary">{cfg.adsenseConnected ? "Tidak ada di AdSense" : "Belum dibaca"}</span>
                    )}
                  </td>
                  <td>
                    {auto ? (
                      s.autoAds === null ? (
                        <span className="text-text-secondary">—</span>
                      ) : s.autoAds ? (
                        <span className="text-emerald-600">Aktif</span>
                      ) : (
                        <span className={s.adsenseState === "READY" ? "font-semibold text-red-600" : "text-text-secondary"}>Mati</span>
                      )
                    ) : (
                      (GAM_LABEL[s.gamStatus] ?? s.gamStatus)
                    )}
                  </td>
                  <td className="text-right">{s.views7d.toLocaleString("id-ID")}</td>
                  <td className="text-right">{s.impressions30d.toLocaleString("id-ID")}</td>
                  <td className="text-right">{s.clicks30d.toLocaleString("id-ID")}</td>
                  <td className="text-right">{usd(s.revenue30d)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {!auto && (
        <section className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-card) p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Floor yang perlu dipasang ({data.floors.length})</h3>
            {data.floors.length > 0 && (
              <button
                disabled={busy !== null}
                onClick={() => act("floors-all", async () => void (await api.post("/admin/adops/floors/applied", {})))}
                className="rounded-sm border border-(--color-border) px-3 py-1 text-xs"
              >
                Semua sudah dipasang
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-text-secondary">
            Google belum membuka API untuk pricing rules, jadi angka ini dipasang sekali di Ad Manager → Inventory → Pricing rules (nama aturan = kolom
            pertama). Angka dihitung otomatis tiap minggu dengan rumus tetap (§6).
          </p>
          {data.floors.length === 0 ? (
            <p className="mt-2 text-xs text-text-secondary">Tidak ada. Floor muncul setelah ada situs yang siap tayang.</p>
          ) : (
            <table className="mt-3 w-full min-w-[640px] text-left text-xs">
              <thead className="text-text-secondary">
                <tr>
                  <th className="py-1">Aturan / ad unit</th>
                  <th>Negara</th>
                  <th className="text-right">Floor</th>
                  <th>Alasan</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.floors.map((f) => (
                  <tr key={`${f.site}-${f.position}-${f.tier}`} className="border-t border-(--color-border)">
                    <td className="py-1.5 font-mono">{`${f.site}-${f.position}`}</td>
                    <td>{TIER_LABEL[f.tier] ?? f.tier}</td>
                    <td className="text-right font-semibold">{usd(f.floor)}</td>
                    <td className="text-text-secondary">{f.reason}</td>
                    <td className="text-right">
                      <button
                        disabled={busy !== null}
                        onClick={() =>
                          act(
                            `floor-${f.site}`,
                            async () => void (await api.post("/admin/adops/floors/applied", { site: f.site, position: f.position, tier: f.tier })),
                          )
                        }
                        className="rounded-sm border border-(--color-border) px-2 py-0.5"
                      >
                        Sudah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-(--color-border) bg-(--color-card) p-5">
        <h3 className="text-sm font-semibold">Log aksi</h3>
        {data.actions.length === 0 ? (
          <p className="mt-2 text-xs text-text-secondary">Belum ada. Runner berjalan otomatis setelah AdSense atau Ad Manager dihubungkan.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs">
            {data.actions.map((a) => (
              <li key={a.id} className={a.ok ? "" : "text-red-600"}>
                <span className="text-text-secondary">
                  {a.at} · {a.mode} · {a.kind}
                </span>{" "}
                {a.site ? <b>{a.site}</b> : null} {a.detail}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-card) p-5 text-xs">
        {auto ? (
          <>
            <h3 className="text-sm font-semibold">Penempatan iklan: Auto ads</h3>
            <p className="mt-2 text-text-secondary">
              Tidak ada slot manual di situs mana pun (dicek otomatis di CI). Setelah sebuah situs Siap tayang, cukup pastikan saklar Auto ads situs itu aktif
              di AdSense → Iklan → Menurut situs. Kolom Auto ads di tabel atas menandai merah situs yang sudah disetujui tapi Auto ads-nya mati.
            </p>
            <h3 className="mt-4 text-sm font-semibold">Langkah pemilik (sekali saja)</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-text-secondary">
              <li>Google Cloud Console (akun yang memegang AdSense {cfg.publisher}): aktifkan AdSense Management API.</li>
              <li>Buat OAuth client (tipe Web) dengan redirect URI di atas, isi Client ID & Secret di Settings, lalu tekan Hubungkan AdSense.</li>
              <li>Tekan Uji koneksi, lalu pilih mode Live. Selesai — status, saklar Auto ads dan pendapatan terbaca otomatis setiap hari.</li>
            </ol>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold">Rencana posisi iklan (tetap)</h3>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {data.positions.map((p) => (
                <li key={p.id}>
                  <b className="font-mono">{p.id}</b> · {p.label} · <span className="text-text-secondary">{p.sizes.join(", ")}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-semibold">Langkah pemilik (sekali saja)</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-text-secondary">
              <li>Masuk Google Ad Manager dengan akun yang memegang AdSense {cfg.publisher}.</li>
              <li>Google Cloud Console: aktifkan Ad Manager API dan AdSense Management API, buat service account, unduh JSON key.</li>
              <li>Ad Manager → Admin → Global settings: API access aktif, tambahkan email service account sebagai Administrator.</li>
              <li>Buat OAuth client (tipe Web) dengan redirect URI di atas, isi Client ID & Secret di Settings, lalu tekan Hubungkan AdSense.</li>
              <li>Isi Network Code dan Service Account JSON di Settings, tekan Uji koneksi, lalu pilih mode Live.</li>
            </ol>
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-(--color-card) px-3 py-2">
      <p className="text-[11px] text-text-secondary">{label}</p>
      <p className="font-heading text-lg">{value}</p>
    </div>
  );
}

function Conn({ ok, title, detail }: { ok: boolean; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-(--color-border) p-3">
      <p className="font-medium">
        <span className={ok ? "text-emerald-600" : "text-amber-600"}>{ok ? "●" : "○"}</span> {title}
      </p>
      <p className="text-[11px] text-text-secondary">{detail}</p>
    </div>
  );
}
