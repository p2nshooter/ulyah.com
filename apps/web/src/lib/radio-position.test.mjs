/**
 * Where the station goes after a track ends.
 *
 * The radio now tries a whole-surah recording before the per-ayah stitch,
 * because stitching gives one gap per ayah and short surah are almost all gap
 * (owner: "jd putus2 dengernya kurang bagus"). That makes the advance
 * ambiguous in a way it never was before: finishing a surah file means jump to
 * the next SURAH, finishing an ayah means the next AYAH, and the same reciter
 * can do either depending on whether the surah file was actually there.
 *
 * The dangerous half is the surah file being MISSING. If the code advanced by
 * surah merely because a surah URL was offered, one 404 on Al-Baqarah would
 * play ayah 1 and skip the other 285. So the flag passed here is what the
 * player observed playing, and these cases pin that down.
 *
 * Ayah counts are the real ones: Al-Fatihah 7, Al-Baqarah 286, An-Nas 6.
 */
import assert from "node:assert/strict";
import { nextRadioPosition } from "./radio-store.ts";

const surahs = [
  { id: 1, ayah_count: 7 },
  { id: 2, ayah_count: 286 },
  { id: 113, ayah_count: 5 },
  { id: 114, ayah_count: 6 },
];
// An alquran.cloud reciter — the common case, and the one that gained
// whole-surah playback.
const R = "ar.alafasy";

// A finished SURAH file moves to the next surah, from ayah 1.
assert.deepEqual(
  nextRadioPosition({ reciterKey: R, surahId: 1, ayahNumber: 1 }, surahs, true),
  { reciterKey: R, surahId: 2, ayahNumber: 1 },
  "a whole surah that ended hands over to the next surah"
);

// The same position WITHOUT the flag — the surah file was missing and one ayah
// played — must not skip the rest of the surah.
assert.deepEqual(
  nextRadioPosition({ reciterKey: R, surahId: 2, ayahNumber: 1 }, surahs, false),
  { reciterKey: R, surahId: 2, ayahNumber: 2 },
  "a stitched ayah advances by one ayah, never past the rest of the surah"
);

// Walking off the end of a surah in stitched mode still rolls over.
assert.deepEqual(
  nextRadioPosition({ reciterKey: R, surahId: 1, ayahNumber: 7 }, surahs, false),
  { reciterKey: R, surahId: 2, ayahNumber: 1 },
  "the last ayah of a surah rolls into the next surah"
);

// Khatam wraps 114 → 1 in both modes, so the rotation hand-off still fires.
assert.deepEqual(
  nextRadioPosition({ reciterKey: R, surahId: 114, ayahNumber: 1 }, surahs, true),
  { reciterKey: R, surahId: 1, ayahNumber: 1 },
  "a finished An-Nas as one file wraps to Al-Fatihah"
);
assert.deepEqual(
  nextRadioPosition({ reciterKey: R, surahId: 114, ayahNumber: 6 }, surahs, false),
  { reciterKey: R, surahId: 1, ayahNumber: 1 },
  "the last ayah of An-Nas wraps to Al-Fatihah"
);

// A surah-only reciter (Muammar ZA) advances by surah with or without the
// flag — it has no per-ayah audio to fall back to.
const SURAH_ONLY = "id.muammar";
assert.deepEqual(
  nextRadioPosition({ reciterKey: SURAH_ONLY, surahId: 1, ayahNumber: 1 }, surahs, false),
  { reciterKey: SURAH_ONLY, surahId: 2, ayahNumber: 1 },
  "a surah-only reciter never advances by ayah"
);

// An unknown surah in stitched mode must not stall on the same ayah forever.
const moved = nextRadioPosition({ reciterKey: R, surahId: 99, ayahNumber: 3 }, surahs, false);
assert.notDeepEqual(moved, { reciterKey: R, surahId: 99, ayahNumber: 3 }, "the station always moves");

console.log("radio-position: ok — advance follows what actually played");
