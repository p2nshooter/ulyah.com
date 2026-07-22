/**
 * "Radio Qori Dunia" is meant to behave like a real broadcast: it never
 * pauses just because nobody's listening. A visitor who tunes in should
 * land wherever the station "currently is", not at Al-Fatihah ayah 1 — that
 * would make it feel like a personal bookmark instead of a live station.
 *
 * Since there's no always-on server process actually streaming audio (the
 * player is plain client-side <audio>), the "always running" behavior is
 * simulated with a shared virtual clock: a fixed epoch plus an assumed
 * average recitation pace per ayah. Every visitor computes the same
 * position from the same wall-clock time, so it's consistent across
 * devices without any server-side state.
 */

export interface AyahCountMeta {
  id: number;
  ayah_count: number;
}

// Fixed reference instant shared by every client — never changes, so the
// "broadcast" is always in the same place for everyone at any given moment.
// PER SITE: each domain's station starts from ITS OWN launch date with the
// khatam counter at 0 (owner: "radio quran harus mulai dari 0 masing-masing —
// 1fr.fr & tilawa.de jangan ngikutin ulyah.com"). Honest counters, no
// inherited history. NEXT_PUBLIC_TENANT is inlined at build time.
const RADIO_EPOCHS: Record<string, number> = {
  ulyah: Date.UTC(2026, 6, 10, 0, 0, 0), // ulyah.com launch
  "1fr": Date.UTC(2026, 6, 17, 0, 0, 0), // 1fr.fr go-live
  tilawa: Date.UTC(2026, 6, 17, 0, 0, 0), // tilawa.de go-live
  dawa: Date.UTC(2026, 6, 19, 0, 0, 0), // dawa.es go-live
  xad: Date.UTC(2026, 6, 22, 0, 0, 0), // xad.es joins the ecosystem — khatam from 0
};
const RADIO_EPOCH_MS = RADIO_EPOCHS[process.env.NEXT_PUBLIC_TENANT ?? "ulyah"] ?? RADIO_EPOCHS.ulyah!;

// Rough average tarteel pace. Not exact (individual ayah lengths vary a
// lot), but tuned so a full khatam (one loop through all ayah) takes
// roughly 9-10 hours — about 2-3 khatam every 24 hours, matching a mosque
// running the station nonstop all day.
const AVG_SECONDS_PER_AYAH = 5.5;

export interface LivePosition {
  surahId: number;
  ayahNumber: number;
}

export interface LiveBroadcast extends LivePosition {
  reciterKey: string;
  khatamIndex: number;
}

function totalAyahCount(surahs: AyahCountMeta[]): number {
  return surahs.reduce((sum, s) => sum + s.ayah_count, 0);
}

function ayahAtGlobalIndex(surahs: AyahCountMeta[], index: number): LivePosition {
  const ordered = [...surahs].sort((a, b) => a.id - b.id);
  let remaining = index;
  for (const s of ordered) {
    if (remaining < s.ayah_count) return { surahId: s.id, ayahNumber: remaining + 1 };
    remaining -= s.ayah_count;
  }
  return { surahId: 1, ayahNumber: 1 };
}

/** Deterministic "where is the broadcast right now" position, computed the
 * same way on every device from the current time — no server state needed.
 * Whether or not any visitor is actually listening never affects this: it's
 * a pure function of wall-clock time, so switching a player off only stops
 * audio on that one device — the "station" is never actually paused. */
export function computeLivePosition(surahs: AyahCountMeta[]): LivePosition {
  const total = totalAyahCount(surahs);
  if (surahs.length === 0 || total <= 0) return { surahId: 1, ayahNumber: 1 };
  const elapsedSeconds = Math.max(0, (Date.now() - RADIO_EPOCH_MS) / 1000);
  const globalIndex = Math.floor(elapsedSeconds / AVG_SECONDS_PER_AYAH) % total;
  return ayahAtGlobalIndex(surahs, globalIndex);
}

/** How many full khatam (complete loops through the whole Qur'an) have
 * elapsed since the station's fixed epoch — a pure function of wall-clock
 * time, so it keeps counting up for as long as the site exists, whether or
 * not anyone actually has the radio open right now. 0 means the very first
 * khatam is still in progress; the site's Nth khatam is in progress while
 * this returns N-1. */
export function computeKhatamIndex(surahs: AyahCountMeta[]): number {
  const total = totalAyahCount(surahs);
  if (surahs.length === 0 || total <= 0) return 0;
  const elapsedSeconds = Math.max(0, (Date.now() - RADIO_EPOCH_MS) / 1000);
  const khatamDurationSeconds = total * AVG_SECONDS_PER_AYAH;
  return Math.floor(elapsedSeconds / khatamDurationSeconds);
}

/** Same idea as computeLivePosition, but also picks which reciter is
 * "on air" right now: every completed khatam (one full loop through all
 * ayah) rotates to the next reciter in `reciterPool`, wrapping back to the
 * first reciter once every voice in the lineup has had its turn — so a
 * mosque leaving the default station running all day hears a rotating
 * lineup of world reciters forever, never stuck in one voice. */
export function computeLiveBroadcast(surahs: AyahCountMeta[], reciterPool: string[]): LiveBroadcast {
  const total = totalAyahCount(surahs);
  if (surahs.length === 0 || total <= 0 || reciterPool.length === 0) {
    return { reciterKey: reciterPool[0] ?? "", surahId: 1, ayahNumber: 1, khatamIndex: 0 };
  }
  const khatamDurationSeconds = total * AVG_SECONDS_PER_AYAH;
  const khatamIndex = computeKhatamIndex(surahs);
  const elapsedSeconds = Math.max(0, (Date.now() - RADIO_EPOCH_MS) / 1000);
  const withinKhatamSeconds = elapsedSeconds - khatamIndex * khatamDurationSeconds;
  const globalIndex = Math.floor(withinKhatamSeconds / AVG_SECONDS_PER_AYAH) % total;
  // Wraps back to reciterPool[0] once khatamIndex passes the last reciter —
  // "seluruh qori sudah baca -> balik ke yang paling atas, begitu selamanya".
  const reciterKey = reciterPool[khatamIndex % reciterPool.length]!;
  return { reciterKey, khatamIndex, ...ayahAtGlobalIndex(surahs, globalIndex) };
}
