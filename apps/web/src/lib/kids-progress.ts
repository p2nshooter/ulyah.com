/**
 * Al-Qur'an Kids — progress, difficulty tiers and certificates.
 *
 * Everything lives in the child's own device storage. There is deliberately NO
 * account and NO server record: a children's product should not be collecting
 * names and ages, and a family can use this immediately without signing up.
 * The trade-off is honest and worth stating — progress is per-device, so a new
 * phone starts fresh.
 *
 * Difficulty runs across five tiers, from very easy to very hard. A tier is
 * unlocked by clearing the one before it, so a child always meets the next
 * step rather than a wall.
 */

export const TIERS = [0, 1, 2, 3, 4] as const;
export type Tier = (typeof TIERS)[number];

/** Rounds needed to clear a tier, and how many mistakes are forgiven. */
export const TIER_RULES: Record<Tier, { rounds: number; lives: number; choices: number }> = {
  0: { rounds: 5, lives: 5, choices: 2 }, // sangat mudah
  1: { rounds: 8, lives: 4, choices: 3 },
  2: { rounds: 10, lives: 3, choices: 4 },
  3: { rounds: 12, lives: 2, choices: 5 },
  4: { rounds: 15, lives: 1, choices: 6 }, // sangat sulit
};

export interface KidsProfile {
  name: string;
  age: number | null;
}

export interface GameRecord {
  /** Highest tier CLEARED (-1 = none yet), so tier `cleared + 1` is unlocked. */
  cleared: number;
  best: number;
  stars: number;
}

export interface KidsProgress {
  profile: KidsProfile;
  games: Record<string, GameRecord>;
  xp: number;
  /** Certificate ids the child has earned, e.g. "hijaiyah". */
  certificates: string[];
}

const KEY = "ulyah:kids:progress:v1";

const EMPTY: KidsProgress = { profile: { name: "", age: null }, games: {}, xp: 0, certificates: [] };

export function loadProgress(): KidsProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<KidsProgress>;
    return {
      profile: { name: p.profile?.name ?? "", age: p.profile?.age ?? null },
      games: p.games ?? {},
      xp: p.xp ?? 0,
      certificates: p.certificates ?? [],
    };
  } catch {
    return EMPTY; // corrupt or blocked storage — start clean rather than crash
  }
}

export function saveProgress(p: KidsProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full or blocked — play continues, it just isn't remembered */
  }
}

export function recordOf(p: KidsProgress, gameId: string): GameRecord {
  return p.games[gameId] ?? { cleared: -1, best: 0, stars: 0 };
}

/** Highest tier the child may currently attempt for a game. */
export function unlockedTier(p: KidsProgress, gameId: string): Tier {
  const cleared = recordOf(p, gameId).cleared;
  return Math.min(4, Math.max(0, cleared + 1)) as Tier;
}

/**
 * Record the end of a tier attempt. Clearing a tier for the first time banks
 * it (so the next one unlocks) and awards a star; replaying an already-cleared
 * tier can still improve the best score but never re-awards the star.
 */
export function recordResult(
  p: KidsProgress,
  gameId: string,
  tier: Tier,
  score: number,
  passed: boolean
): KidsProgress {
  const cur = recordOf(p, gameId);
  const firstClear = passed && tier > cur.cleared;
  const next: GameRecord = {
    cleared: firstClear ? tier : cur.cleared,
    best: Math.max(cur.best, score),
    stars: cur.stars + (firstClear ? 1 : 0),
  };
  return {
    ...p,
    games: { ...p.games, [gameId]: next },
    xp: p.xp + score,
  };
}

/** Every game that runs on the five-tier ladder. */
export const TIERED_GAMES = [
  "tebak-huruf",
  "cari-huruf",
  "pasangan",
  "urutan",
  "ingat",
  "cepat",
  "harakat",
  "tumbuh",
  "terbang",
] as const;

/**
 * The games that count toward the hijaiyah certificate: the ones that actually
 * prove the child can read a letter — recognise it by shape, by sound, with its
 * harakat, from memory, and assembled into a word. The pure-speed and card
 * games are fun but are not evidence of reading, so they stay out.
 */
export const HIJAIYAH_GAMES = ["tebak-huruf", "cari-huruf", "harakat", "ingat", "tumbuh", "terbang"] as const;

/** The certificate is earned once every core game has been cleared to the top tier. */
export function hijaiyahMastered(p: KidsProgress): boolean {
  return HIJAIYAH_GAMES.every((g) => recordOf(p, g).cleared >= 4);
}

export function totalStars(p: KidsProgress): number {
  return Object.values(p.games).reduce((n, g) => n + g.stars, 0);
}

/** Max stars available, so the UI can show "12 / 45" honestly. */
export const MAX_STARS = TIERED_GAMES.length * TIERS.length;
