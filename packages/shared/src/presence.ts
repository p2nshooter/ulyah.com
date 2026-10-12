/**
 * One clock for "online now", shared by the beacon (apps/web) and the admin
 * queries (apps/worker-api), so the two can never drift apart.
 *
 * It used to be a 3-second heartbeat against a 5-second window (owner, earlier:
 * "online skrg … turun-naik ≤5 detik"). Every open tab therefore cost twenty
 * Worker requests and twenty D1 writes a minute. The Workers Free plan gives the
 * whole account 100,000 of each a day, so a few dozen readers with the site
 * open was enough to push every site in the ecosystem into Error 1027 or D1
 * code 7500 (owner, 12 Oct 2026: "pastikan seluruh website dan fitur berfungsi
 * 100%"). A site that is down has no one online to count.
 *
 * Thirty seconds is a tenth of that load and still a live number: a visitor
 * appears on the next beat and drops out within the window after they leave —
 * immediately when the tab closes, because the beacon also sends a "leave".
 */
export const PRESENCE_HEARTBEAT_MS = 30_000;

/** A device seen within this many seconds counts as online right now. */
export const PRESENCE_ONLINE_WINDOW_S = 45;
