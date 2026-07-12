// Faraid (Islamic inheritance) share calculator — mainstream Sunni fiqh as
// codified in Indonesia's Kompilasi Hukum Islam (KHI): fixed Qur'anic shares
// (fara'id) for spouse/parents/children/siblings, residue to asobah heirs,
// with the well-established Aul (proportional reduction when shares exceed
// the estate) and Radd (proportional top-up when shares fall short and no
// asobah heir remains) mechanisms.
//
// Deliberately scoped to the heir set that covers the vast majority of real
// cases: spouse, children, parents, and — only in kalalah (no children, no
// father) — full (kandung) and uterine (seibu) siblings. Grandparents,
// consanguine (seayah) siblings, and grandchildren-by-representation are
// NOT modelled; those cases have extra hijab (blocking) rules and, in the
// grandfather+siblings case, genuine khilafiyah among the classical schools.
// waris-labels.ts's disclaimer says so explicitly — never silently guess.

export interface WarisInput {
  deceasedGender: "male" | "female";
  wivesCount: number; // only used when deceasedGender === "male"
  hasHusband: boolean; // only used when deceasedGender === "female"
  sons: number;
  daughters: number;
  fatherAlive: boolean;
  motherAlive: boolean;
  fullBrothers: number;
  fullSisters: number;
  uterineSiblings: number; // saudara/i seibu — share is gender-blind
}

export interface WarisHeirShare {
  key: string;
  fraction: number; // share of the net estate, 0..1
}

export interface WarisResult {
  heirs: WarisHeirShare[];
  aul: boolean;
  radd: boolean;
  umariyyatain: boolean;
  noRecognizedHeir: boolean;
}

const EPSILON = 1e-9;

export function calculateWaris(input: WarisInput): WarisResult {
  const {
    deceasedGender,
    wivesCount,
    hasHusband,
    sons,
    daughters,
    fatherAlive,
    motherAlive,
    fullBrothers,
    fullSisters,
    uterineSiblings,
  } = input;

  const hasChildren = sons > 0 || daughters > 0;
  const kalalah = !hasChildren && !fatherAlive;

  const shares: Record<string, number> = {};
  let spouseShare = 0;
  let spouseKey: string | null = null;

  if (deceasedGender === "male" && wivesCount > 0) {
    spouseShare = hasChildren ? 1 / 8 : 1 / 4;
    spouseKey = "istri";
    shares[spouseKey] = spouseShare;
  } else if (deceasedGender === "female" && hasHusband) {
    spouseShare = hasChildren ? 1 / 4 : 1 / 2;
    spouseKey = "suami";
    shares[spouseKey] = spouseShare;
  }

  // Daughters-only fixed share (sons turn children into pure asobah, handled
  // with the residue below instead).
  if (sons === 0 && daughters > 0) {
    shares.anak_perempuan = daughters === 1 ? 1 / 2 : 2 / 3;
  }

  let fatherGetsResidue = false;
  if (fatherAlive) {
    if (hasChildren) {
      shares.ayah = (shares.ayah ?? 0) + 1 / 6;
      if (sons === 0) fatherGetsResidue = true; // 1/6 + asobah top-up
    } else {
      fatherGetsResidue = true; // pure asobah, no fixed portion
    }
  }

  let umariyyatain = false;
  if (motherAlive) {
    const siblingCount = fullBrothers + fullSisters + uterineSiblings;
    if (hasChildren || siblingCount >= 2) {
      shares.ibu = 1 / 6;
    } else if (fatherAlive && spouseKey && siblingCount === 0) {
      // Umariyyatain / gharrawain: mother gets 1/3 of the remainder after
      // the spouse's share, not 1/3 of the whole estate.
      umariyyatain = true;
      shares.ibu = (1 / 3) * (1 - spouseShare);
    } else {
      shares.ibu = 1 / 3;
    }
  }

  let siblingsGetResidue = false;
  if (kalalah) {
    if (uterineSiblings === 1) {
      shares.saudara_seibu = 1 / 6;
    } else if (uterineSiblings >= 2) {
      shares.saudara_seibu = 1 / 3;
    }

    if (fullBrothers > 0) {
      siblingsGetResidue = true; // asobah bin nafs with any full sisters, 2:1
    } else if (fullSisters === 1) {
      shares.saudari_kandung = 1 / 2;
    } else if (fullSisters >= 2) {
      shares.saudari_kandung = 2 / 3;
    }
  }

  const totalFixed = Object.values(shares).reduce((a, b) => a + b, 0);
  const residue = 1 - totalFixed;

  let aul = false;
  let radd = false;

  if (residue < -EPSILON) {
    // Aul: shares oversubscribed — scale every fixed share down proportionally.
    aul = true;
    const scale = 1 / totalFixed;
    for (const k of Object.keys(shares)) shares[k] *= scale;
  } else if (sons > 0) {
    const units = sons * 2 + daughters;
    const perUnit = residue / units;
    shares.anak_laki = perUnit * 2 * sons;
    if (daughters > 0) shares.anak_perempuan = (shares.anak_perempuan ?? 0) + perUnit * daughters;
  } else if (fatherGetsResidue) {
    shares.ayah = (shares.ayah ?? 0) + residue;
  } else if (siblingsGetResidue) {
    const units = fullBrothers * 2 + fullSisters;
    const perUnit = residue / units;
    shares.saudara_laki_kandung = perUnit * 2 * fullBrothers;
    if (fullSisters > 0) shares.saudari_kandung = (shares.saudari_kandung ?? 0) + perUnit * fullSisters;
  } else if (residue > EPSILON) {
    // Radd: shares undersubscribed and no asobah heir to absorb the rest —
    // return the remainder proportionally to every fixed-share heir except
    // the spouse (majority view: spouse never receives radd).
    const raddPoolKeys = Object.keys(shares).filter((k) => k !== spouseKey);
    const raddPoolTotal = raddPoolKeys.reduce((a, k) => a + shares[k]!, 0);
    if (raddPoolTotal > EPSILON) {
      radd = true;
      for (const k of raddPoolKeys) shares[k] += (shares[k]! / raddPoolTotal) * residue;
    } else if (spouseKey) {
      // Sole heir is the spouse — necessity: they take the whole estate.
      radd = true;
      shares[spouseKey] += residue;
    }
  }

  const heirs = Object.entries(shares)
    .filter(([, fraction]) => fraction > EPSILON)
    .map(([key, fraction]) => ({ key, fraction }));

  return {
    heirs,
    aul,
    radd,
    umariyyatain,
    noRecognizedHeir: heirs.length === 0,
  };
}
