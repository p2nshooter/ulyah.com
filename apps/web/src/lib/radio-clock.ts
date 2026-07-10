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
const RADIO_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

// Rough average tarteel pace. Not exact (individual ayah lengths vary a
// lot), but good enough to make the station feel continuously live rather
// than always restarting — a full 6,236-ayah loop takes roughly a day.
const AVG_SECONDS_PER_AYAH = 14;

export interface LivePosition {
  surahId: number;
  ayahNumber: number;
}

/** Deterministic "where is the broadcast right now" position, computed the
 * same way on every device from the current time — no server state needed. */
export function computeLivePosition(surahs: AyahCountMeta[]): LivePosition {
  if (surahs.length === 0) return { surahId: 1, ayahNumber: 1 };
  const ordered = [...surahs].sort((a, b) => a.id - b.id);
  const total = ordered.reduce((sum, s) => sum + s.ayah_count, 0);
  if (total <= 0) return { surahId: 1, ayahNumber: 1 };

  const elapsedSeconds = Math.max(0, (Date.now() - RADIO_EPOCH_MS) / 1000);
  let globalIndex = Math.floor(elapsedSeconds / AVG_SECONDS_PER_AYAH) % total;

  for (const s of ordered) {
    if (globalIndex < s.ayah_count) return { surahId: s.id, ayahNumber: globalIndex + 1 };
    globalIndex -= s.ayah_count;
  }
  return { surahId: 1, ayahNumber: 1 };
}
