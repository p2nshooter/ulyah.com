import { PRESENCE_HEARTBEAT_MS } from "@ulyah/shared/presence";

/**
 * At most one presence write per device per WRITE_GAP_MS, per isolate.
 *
 * The beacons now beat every PRESENCE_HEARTBEAT_MS (30s), but browsers keep
 * cached JavaScript for days, and six partner sites shipped a 3-second beat of
 * their own. Each of those pings was a D1 write, against a free plan that
 * allows 100,000 a day for the whole account. A visitor's isolate is reused
 * for their following requests far more often than not, so remembering the
 * last write here drops nine in ten of the old beats before they reach D1 —
 * while a current client, beating every 30s, is never held back.
 *
 * A change of `listening` is part of the key, so pressing play shows up on the
 * next beat rather than up to WRITE_GAP_MS later.
 */
const WRITE_GAP_MS = PRESENCE_HEARTBEAT_MS - 10_000;
const MAX_ENTRIES = 5000;
const lastWrite = new Map<string, number>();

export function presenceWriteDue(tenant: string, device: string, listening: boolean, now = Date.now()): boolean {
  const key = `${tenant}\u0000${device}\u0000${listening ? 1 : 0}`;
  const prev = lastWrite.get(key);
  if (prev !== undefined && now - prev < WRITE_GAP_MS) return false;
  if (lastWrite.size >= MAX_ENTRIES) {
    for (const [k, t] of lastWrite) if (now - t >= WRITE_GAP_MS) lastWrite.delete(k);
    if (lastWrite.size >= MAX_ENTRIES) lastWrite.clear();
  }
  lastWrite.set(key, now);
  return true;
}

/** After a "leave", the next ping from that device must be written at once. */
export function presenceForget(tenant: string, device: string): void {
  lastWrite.delete(`${tenant}\u0000${device}\u00000`);
  lastWrite.delete(`${tenant}\u0000${device}\u00001`);
}
