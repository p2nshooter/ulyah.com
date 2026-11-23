"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Cek kunci GPU (owner, 22 Nov 2026: "cek jg setiap key gpu yg ada d portal admin, apakah masih aktif dan bisa di
 * test untuk membuat sebagian animasi axto.io yg lebih bagus"). Runs the Worker's check (lib/gpu-check.ts): the
 * provider's own auth probe, a capability probe, and — on request — one small real render on Hugging Face's free
 * tier. The last report is kept in R2 and shown here; no key is ever shown.
 */

interface Row {
  id: number;
  provider: string;
  scope: string;
  donor_label: string | null;
  alive: boolean;
  status: string;
  latency_ms: number;
  detail: string;
  capabilities: string[];
  render: { tried: boolean; ok: boolean; detail: string; image?: string } | null;
  forAxto: { usable: boolean; reason: string };
}
interface Report {
  at: string;
  checked: number;
  alive: number;
  usableForAxto: number;
  rows: Row[];
}

export function GpuCheckPanel() {
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState<"" | "check" | "render">("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ report: Report | null }>("/admin/keys/gpu-check")
      .then((r) => setReport(r.report ?? null))
      .catch(() => {});
  }, []);

  async function run(render: boolean) {
    setBusy(render ? "render" : "check");
    setErr(null);
    try {
      const r = await api.post<{ report: Report | null }>(`/admin/keys/gpu-check${render ? "?render=1" : ""}`);
      setReport(r.report ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menjalankan cek GPU");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="card-premium-static space-y-3 p-4" data-testid="gpu-check">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-base">🎮 Cek kunci GPU — untuk animasi axto.io</p>
          <p className="mt-1 max-w-2xl text-xs text-text-secondary">
            Setiap kunci GPU (Hugging Face, Replicate, Modal, Kaggle, NVIDIA) diuji: masih aktif atau mati, apa yang
            bisa dijalankan akunnya, dan — bila diminta — satu render gambar kecil sungguhan di jalur gratis Hugging
            Face. Hanya kunci yang aktif <b>dan</b> punya jalur render yang ditandai bisa dipakai untuk karya axto.io.
          </p>
        </div>
        <div className="btn-row">
          <button className="btn btn-sm btn-outline" disabled={busy !== ""} onClick={() => run(false)}>
            {busy === "check" ? "Menguji…" : "Cek semua kunci GPU"}
          </button>
          <button className="btn btn-sm btn-accent" disabled={busy !== ""} onClick={() => run(true)}>
            {busy === "render" ? "Merender…" : "Cek + uji render"}
          </button>
        </div>
      </div>
      {err && <p className="text-xs text-danger">{err}</p>}
      {report ? (
        <>
          <p className="text-xs text-text-secondary">
            Terakhir: {new Date(report.at).toLocaleString("id-ID")} · {report.checked} kunci GPU · <b className="text-success">{report.alive} aktif</b> ·{" "}
            <b className="text-accent">{report.usableForAxto} bisa untuk animasi axto.io</b>
          </p>
          {report.rows.length === 0 ? (
            <p className="text-xs text-text-secondary">Belum ada kunci GPU di pool.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="text-text-secondary">
                  <tr>
                    <th className="py-1 pr-2">#</th>
                    <th className="py-1 pr-2">Penyedia</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2">Kemampuan</th>
                    <th className="py-1 pr-2">Untuk axto.io</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r) => (
                    <tr key={r.id} className="border-t border-(--color-border) align-top">
                      <td className="py-1.5 pr-2 tabular-nums">{r.id}</td>
                      <td className="py-1.5 pr-2">
                        {r.provider}
                        {r.donor_label ? <span className="block text-text-secondary">{r.donor_label}</span> : null}
                      </td>
                      <td className="py-1.5 pr-2">
                        <span className={r.alive ? "text-success" : "text-danger"}>{r.alive ? "aktif" : r.status}</span>
                        <span className="block text-text-secondary">{r.latency_ms} ms</span>
                      </td>
                      <td className="py-1.5 pr-2">
                        {r.capabilities.length ? r.capabilities.join(" · ") : <span className="text-text-secondary">{r.detail}</span>}
                        {r.render ? (
                          <span className={`block ${r.render.ok ? "text-success" : "text-text-secondary"}`}>
                            Render: {r.render.ok ? "berhasil" : r.render.tried ? "gagal" : "tidak diuji"} — {r.render.detail}
                          </span>
                        ) : null}
                        {r.render?.ok && Number.isSafeInteger(r.id) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${api.base}/admin/keys/gpu-check/image/${Math.trunc(Number(r.id))}`}
                            alt=""
                            width={96}
                            height={96}
                            className="mt-1 rounded-lg border border-(--color-border)"
                          />
                        ) : null}
                      </td>
                      <td className="py-1.5 pr-2">
                        <span className={r.forAxto.usable ? "font-semibold text-accent" : "text-text-secondary"}>
                          {r.forAxto.usable ? "✓ bisa" : "✗ belum"}
                        </span>
                        <span className="block text-text-secondary">{r.forAxto.reason}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-text-secondary">Belum pernah dicek. Tekan „Cek semua kunci GPU".</p>
      )}
    </section>
  );
}
