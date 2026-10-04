/**
 * The fixed inventory plan (docs/ADMANAGER-BLUEPRINT.md §5).
 *
 * Pure functions only: no I/O, no clock, no randomness. Given the same sites
 * and the same snapshot of Ad Manager, they always return the same actions.
 * That is what "AI tidak berfikir lagi, langsung eksekusi" means in code: the
 * runner executes what these functions decide and nothing else.
 */

/**
 * HOW ADS ARE PLACED ON THE PAGES — a fixed owner decision, not a setting.
 *
 * "auto": AdSense Auto ads. Owner, 4 Oct 2026: "Hapus aja dan bersihkan slot
 * AdSense nya di website manapun karena sy bikin otomatis … cukup cuplikan
 * AdSense, ads.txt & tag meta". No page carries a manual unit or a GPT tag, so
 * an Ad Manager ad unit would have nowhere to serve: in this mode the runner
 * creates NO Ad Manager inventory and sets NO floors. It syncs AdSense approval
 * (incl. whether Auto ads is on per site) and AdSense's own daily report.
 *
 * "gam": the Ad Manager plan below (positions, floors, parking). Only valid
 * once the pages carry the GPT tags for these positions — changing this
 * constant without that would create inventory nothing can fill.
 */
export const AD_PLACEMENT: "auto" | "gam" = "auto";

/** The position name Auto-ads rows are stored under in adops_daily. */
export const AUTO_POSITION = "auto";

export type Position = "top" | "in1" | "in2" | "side" | "end";

export interface PlanSize {
  width: number;
  height: number;
  /** FLUID = native-style "fluid" size; PIXEL = fixed creative size. */
  sizeType: "PIXEL" | "FLUID";
}

const px = (width: number, height: number): PlanSize => ({ width, height, sizeType: "PIXEL" });
const FLUID: PlanSize = { width: 1, height: 1, sizeType: "FLUID" };

/**
 * Positions and sizes (§5.2). `top` and `in1` carry the money and are never
 * switched off by the weak-position rule (§7).
 */
export const POSITIONS: Readonly<Record<Position, { label: string; sizes: PlanSize[]; protected: boolean }>> = {
  top: { label: "after the title", sizes: [px(728, 90), px(970, 90), px(336, 280), px(300, 250), px(320, 100), px(320, 50), FLUID], protected: true },
  in1: { label: "~30% into the article", sizes: [px(336, 280), px(300, 250), px(580, 400), FLUID], protected: true },
  in2: { label: "~65% into long articles", sizes: [px(336, 280), px(300, 250), FLUID], protected: false },
  side: { label: "desktop sidebar", sizes: [px(300, 600), px(300, 250), px(160, 600)], protected: false },
  end: { label: "before related articles", sizes: [px(728, 90), px(336, 280), px(300, 250), FLUID], protected: false },
};
export const POSITION_ORDER: readonly Position[] = ["top", "in1", "in2", "side", "end"];

/** One ad unit as we want it to exist in Ad Manager. */
export interface DesiredAdUnit {
  /** Ad unit code: `<trackId>` for the site node, `<trackId>-<position>` for a slot. */
  code: string;
  /** Parent ad unit code; null = the network's effective root. */
  parentCode: string | null;
  displayName: string;
  sizes: PlanSize[];
  site: string;
  position: Position | null;
}

/** The plan for a set of approved sites, site nodes first (parents before children). */
export function desiredAdUnits(sites: { trackId: string; domain: string }[]): DesiredAdUnit[] {
  const sorted = [...sites].sort((a, b) => a.trackId.localeCompare(b.trackId));
  const out: DesiredAdUnit[] = [];
  for (const s of sorted) {
    out.push({ code: s.trackId, parentCode: null, displayName: s.domain, sizes: [], site: s.trackId, position: null });
  }
  for (const s of sorted) {
    for (const p of POSITION_ORDER) {
      out.push({
        code: `${s.trackId}-${p}`,
        parentCode: s.trackId,
        displayName: `${s.domain} · ${p}`,
        sizes: POSITIONS[p].sizes,
        site: s.trackId,
        position: p,
      });
    }
  }
  return out;
}

/** What Ad Manager currently has, reduced to what the plan needs. */
export interface ActualAdUnit {
  /** Resource name, e.g. networks/123/adUnits/456. */
  name: string;
  code: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED" | string;
}

export interface AdUnitDiff {
  /** Units to create, in dependency order (a parent always precedes its children). */
  create: DesiredAdUnit[];
  /** Existing but inactive units the plan wants live (never ones the yield rule switched off). */
  activate: ActualAdUnit[];
  /** Live units of sites that are no longer approved. */
  deactivate: ActualAdUnit[];
}

/**
 * Compare the plan for the approved sites with Ad Manager.
 *
 * - A planned unit that does not exist is created.
 * - A planned unit that exists but is INACTIVE is activated, unless the yield
 *   rule parked it on purpose (`parkedCodes`).
 * - A unit that belongs to a registry site which is NOT approved any more is
 *   deactivated. Units we did not create (codes outside the registry) are
 *   never touched.
 * - ARCHIVED units are left alone: archiving is a human decision.
 */
export function diffAdUnits(
  approvedSites: { trackId: string; domain: string }[],
  allRegistryTrackIds: string[],
  actual: ActualAdUnit[],
  parkedCodes: ReadonlySet<string> = new Set()
): AdUnitDiff {
  const desired = desiredAdUnits(approvedSites);
  const byCode = new Map(actual.map((a) => [a.code, a]));
  const create = desired.filter((d) => !byCode.has(d.code));
  const activate = desired
    .map((d) => byCode.get(d.code))
    .filter((a): a is ActualAdUnit => !!a && a.status === "INACTIVE" && !parkedCodes.has(a.code));

  const approved = new Set(approvedSites.map((s) => s.trackId));
  const registry = new Set(allRegistryTrackIds);
  const deactivate = actual.filter((a) => {
    if (a.status !== "ACTIVE") return false;
    const site = siteOfCode(a.code, registry);
    return site !== null && !approved.has(site);
  });
  return { create, activate, deactivate };
}

/** The registry site an ad unit code belongs to (`xko-es` or `xko-es-top` → `xko-es`), or null. */
export function siteOfCode(code: string, registry: ReadonlySet<string>): string | null {
  if (registry.has(code)) return code;
  for (const p of POSITION_ORDER) {
    const suffix = `-${p}`;
    if (code.endsWith(suffix) && registry.has(code.slice(0, -suffix.length))) return code.slice(0, -suffix.length);
  }
  return null;
}

/** Split into batches the API accepts (max 100 objects per batch call). */
export function chunk<T>(items: T[], size = 100): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
