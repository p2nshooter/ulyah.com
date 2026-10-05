/**
 * The yield engine (docs/ADMANAGER-BLUEPRINT.md §6 and §7).
 *
 * Pure, deterministic arithmetic. The objective is RPM (revenue per 1,000 ad
 * requests = eCPM × fill), which is what "iklan yg mahal dan sering atau
 * murah tp sering" means in money: the most revenue per request, whether it
 * comes from few expensive ads or many cheap ones.
 */

export type Tier = "T1" | "T2" | "T3";

const T1 = new Set(["US", "CA", "GB", "AU", "NZ", "DE", "AT", "CH", "NL", "BE", "LU", "IE", "DK", "SE", "NO", "FI", "FR", "IS"]);
const T2 = new Set(["ES", "IT", "PT", "JP", "KR", "SG", "HK", "TW", "AE", "SA", "QA", "KW", "IL", "PL", "CZ"]);

export function tierOf(countryCode: string | null | undefined): Tier {
  const c = (countryCode ?? "").toUpperCase();
  if (T1.has(c)) return "T1";
  if (T2.has(c)) return "T2";
  return "T3";
}

/** Starting floors in USD (§6). */
export const INITIAL_FLOOR: Readonly<Record<Tier, number>> = { T1: 0.5, T2: 0.25, T3: 0.05 };
export const FLOOR_MIN = 0.01;
export const FLOOR_MAX = 5;
/** Below this many ad requests in 7 days a segment's floor does not move. */
export const MIN_REQUESTS = 2000;

export interface SegmentMetrics {
  requests: number;
  impressions: number;
  revenue: number; // USD
}

export const rpm = (m: SegmentMetrics): number => (m.requests > 0 ? (m.revenue / m.requests) * 1000 : 0);
export const fill = (m: SegmentMetrics): number => (m.requests > 0 ? m.impressions / m.requests : 0);

export interface FloorState {
  floor: number;
  /** Floor before the last change (to revert to). */
  previousFloor: number | null;
  /** Direction of the last change. */
  lastStep: "up" | "down" | null;
}

export interface FloorDecision extends FloorState {
  changed: boolean;
  reason: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number) => Math.min(FLOOR_MAX, Math.max(FLOOR_MIN, round2(n)));

/**
 * One weekly step of the floor hill-climb for one segment.
 *
 * 1. fill < 40%                    → floor × 0.85 (too many unsold requests)
 * 2. RPM ≥ +2% vs previous week    → keep going: ×1.10 after an "up", ×0.90 after a "down" (first step: up)
 * 3. RPM ≤ −2% vs previous week    → revert to the previous floor, then step the other way
 * 4. otherwise                     → hold
 * Bounds 0.01–5.00 USD, two decimals. Under MIN_REQUESTS: hold (not enough data).
 */
export function nextFloor(state: FloorState, now: SegmentMetrics, prev: SegmentMetrics | null): FloorDecision {
  const hold = (reason: string): FloorDecision => ({ ...state, changed: false, reason });
  if (now.requests < MIN_REQUESTS) return hold(`data kurang (${now.requests} < ${MIN_REQUESTS} permintaan/7 hari)`);

  const move = (base: number, factor: number, step: "up" | "down", reason: string): FloorDecision => {
    const floor = clamp(base * factor);
    if (floor === state.floor) return hold(`${reason}; sudah di batas`);
    return { floor, previousFloor: state.floor, lastStep: step, changed: true, reason };
  };

  const f = fill(now);
  if (f < 0.4) return move(state.floor, 0.85, "down", `fill ${(f * 100).toFixed(1)}% < 40%: turunkan 15%`);

  if (!prev || prev.requests < MIN_REQUESTS) {
    // First measured week: open the climb upwards.
    return state.lastStep === null ? move(state.floor, 1.1, "up", "minggu pertama: naikkan 10%") : hold("minggu pembanding kurang data");
  }

  const r = rpm(now);
  const rp = rpm(prev);
  if (r >= rp * 1.02) {
    const step = state.lastStep ?? "up";
    return move(state.floor, step === "up" ? 1.1 : 0.9, step, `RPM naik ${pct(r, rp)}: lanjutkan arah ${step === "up" ? "naik" : "turun"}`);
  }
  if (r <= rp * 0.98) {
    const base = state.previousFloor ?? state.floor;
    const reverse = state.lastStep === "up" ? "down" : "up";
    return move(base, reverse === "up" ? 1.1 : 0.9, reverse, `RPM turun ${pct(r, rp)}: kembalikan floor lalu balik arah`);
  }
  return hold(`RPM stabil (${pct(r, rp)})`);
}

function pct(a: number, b: number): string {
  if (b <= 0) return "n/a";
  const d = ((a - b) / b) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`;
}

/** Weekly RPM history of one ad unit, newest first. */
export interface UnitWeeks {
  code: string;
  protected: boolean;
  /** Last 4 weeks, newest first. */
  weeks: { requests: number; revenue: number }[];
  /** Site-average RPM for the same 4 weeks, newest first. */
  siteRpm: number[];
}

/**
 * §7: an unprotected unit is parked when, for 4 weeks in a row, its RPM was
 * below 20% of its site's average, with at least 5,000 requests in total.
 */
export function shouldPark(u: UnitWeeks): { park: boolean; reason: string } {
  if (u.protected) return { park: false, reason: "posisi inti (top/in1) tidak pernah dimatikan" };
  if (u.weeks.length < 4 || u.siteRpm.length < 4) return { park: false, reason: "belum 4 minggu data" };
  const total = u.weeks.slice(0, 4).reduce((n, w) => n + w.requests, 0);
  if (total < 5000) return { park: false, reason: `data kurang (${total} < 5000 permintaan/28 hari)` };
  for (let i = 0; i < 4; i++) {
    const w = u.weeks[i]!;
    const unitRpm = w.requests > 0 ? (w.revenue / w.requests) * 1000 : 0;
    if (unitRpm >= 0.2 * u.siteRpm[i]!) return { park: false, reason: `minggu ke-${i + 1} masih ≥ 20% RPM situs` };
  }
  return { park: true, reason: "RPM < 20% rata-rata situs 4 minggu berturut-turut" };
}

/** A parked unit is reactivated for a retest after 8 weeks (§7). */
export const RETEST_AFTER_DAYS = 56;
