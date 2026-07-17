"use client";

/**
 * The animated character for Kisah Anak (kids' animated stories) — a simple,
 * friendly, flat-design child in modest dress. Deliberately NOT a depiction
 * of any prophet, companion, or named historical figure (many Muslims
 * consider visually depicting them inappropriate); this is a generic child
 * teaching a value, not a sirah reenactment.
 *
 * `action` drives which CSS animation class plays on the arm/body — see
 * kids.css. Built as plain SVG + CSS keyframes (no animation library) so it
 * stays lightweight and renders identically everywhere.
 */
export type KidsAction = "idle" | "wave" | "walk" | "jump" | "point" | "think" | "hug";
export type KidsVariant = "boy" | "girl";

const SKIN = "#f2c9a0";
const BLUSH = "#f7a9a0";

export function KidsCharacter({ variant, action }: { variant: KidsVariant; action: KidsAction }) {
  const robeColor = variant === "boy" ? "#2c8f63" : "#c2578a";
  const robeLight = variant === "boy" ? "#4fc490" : "#e07aa8";
  const trimColor = "#F4D97B";

  return (
    <div className={`kids-character kids-action-${action}`}>
      <svg viewBox="0 0 180 220" width="100%" height="100%" role="img" aria-label={variant === "boy" ? "Karakter anak laki-laki" : "Karakter anak perempuan"}>
        <ellipse cx="90" cy="212" rx="45" ry="8" fill="rgba(0,0,0,0.2)" />

        <defs>
          <linearGradient id={`robeGrad-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={robeLight} />
            <stop offset="100%" stopColor={robeColor} />
          </linearGradient>
        </defs>

        {/* body/robe */}
        <path d="M90 70 C50 70 35 130 30 205 L150 205 C145 130 130 70 90 70 Z" fill={`url(#robeGrad-${variant})`} />
        <path d="M64 78 Q90 100 116 78" stroke={trimColor} strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* left arm (still) */}
        <g className="kids-arm-left">
          <path d="M55 95 Q25 110 22 150" stroke={robeColor} strokeWidth="20" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="150" r="12" fill={SKIN} />
        </g>
        {/* right arm (animated per action) */}
        <g className="kids-arm-right">
          <path d="M125 95 Q158 85 150 55" stroke={robeColor} strokeWidth="20" fill="none" strokeLinecap="round" />
          <circle cx="150" cy="55" r="12" fill={SKIN} />
        </g>

        {/* head */}
        <circle cx="90" cy="48" r="40" fill={SKIN} />
        <circle cx="50" cy="50" r="7" fill={SKIN} />
        <circle cx="130" cy="50" r="7" fill={SKIN} />

        {variant === "boy" ? (
          <>
            <path d="M52 30 Q90 -5 128 30 L128 20 Q90 -14 52 20 Z" fill="#1c1c1c" />
            <ellipse cx="90" cy="20" rx="38" ry="10" fill="#2a2a2a" />
          </>
        ) : (
          <>
            <path
              d="M46 55 Q40 5 90 2 Q140 5 134 55 Q134 90 120 100 Q128 60 118 35 Q90 20 62 35 Q52 60 60 100 Q46 90 46 55 Z"
              fill="#c2578a"
            />
            <path d="M60 35 Q90 18 118 35 Q120 26 90 12 Q60 26 60 35 Z" fill="#e07aa8" />
          </>
        )}

        <g className="kids-face">
          <circle cx="74" cy="52" r="6" fill="#26221c" />
          <circle cx="106" cy="52" r="6" fill="#26221c" />
          <circle cx="76" cy="50" r="2" fill="#fff" />
          <circle cx="108" cy="50" r="2" fill="#fff" />
          <path d="M74 44 Q78 40 82 44" stroke="#26221c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M98 44 Q102 40 106 44" stroke="#26221c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="65" cy="66" rx="8" ry="5" fill={BLUSH} opacity="0.6" />
          <ellipse cx="115" cy="66" rx="8" ry="5" fill={BLUSH} opacity="0.6" />
          <path d="M76 70 Q90 84 104 70" stroke="#8a4a2f" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
