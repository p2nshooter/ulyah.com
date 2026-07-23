/**
 * Deterministic "kitab cover" styling for the digital library. Every category
 * (and book) gets a stable, classical book-cover look — deep jewel tones with a
 * gold spine — chosen from a curated palette by a hash of its slug, so the same
 * kitab always wears the same cover and the shelf looks composed rather than
 * random. Pure data (inline styles + class strings); no global CSS, so it can't
 * collide with the ecosystem theme work.
 */

export interface Cover {
  /** full cover gradient (front of the book) */
  cover: string;
  /** darker spine strip down the binding edge */
  spine: string;
  /** warm foil colour for the title + hairlines */
  foil: string;
  /** soft ink colour for secondary text on the cover */
  ink: string;
}

// Classical binding colours: emerald, maroon, midnight, teal, plum, forest,
// indigo, burgundy, bronze, slate-blue. Each pairs a jewel tone with a gold
// foil so the Arabic title always reads like a tooled leather cover.
const PALETTE: Cover[] = [
  { cover: "linear-gradient(135deg,#0f5132 0%,#0a3d26 100%)", spine: "#072b1b", foil: "#e9c46a", ink: "#cfe6d8" },
  { cover: "linear-gradient(135deg,#6d1f2b 0%,#4a141d 100%)", spine: "#340d13", foil: "#f0c987", ink: "#eccdd0" },
  { cover: "linear-gradient(135deg,#14345c 0%,#0d2340 100%)", spine: "#081827", foil: "#e7c76a", ink: "#c6d5e8" },
  { cover: "linear-gradient(135deg,#0d5b57 0%,#083f3c 100%)", spine: "#052a28", foil: "#ecca6d", ink: "#c5e4e1" },
  { cover: "linear-gradient(135deg,#4b2c57 0%,#331c3c 100%)", spine: "#22122a", foil: "#e9c26a", ink: "#dccbe4" },
  { cover: "linear-gradient(135deg,#25462a 0%,#18301c 100%)", spine: "#0f2113", foil: "#e4c569", ink: "#c9dcc9" },
  { cover: "linear-gradient(135deg,#2c3775 0%,#1c244f 100%)", spine: "#121736", foil: "#e8c56b", ink: "#cad0ee" },
  { cover: "linear-gradient(135deg,#5c1f38 0%,#3f1427 100%)", spine: "#2a0d1a", foil: "#efc783", ink: "#eccdd8" },
  { cover: "linear-gradient(135deg,#6a4a1f 0%,#4a3214 100%)", spine: "#33220d", foil: "#f4d694", ink: "#ecdcc2" },
  { cover: "linear-gradient(135deg,#233a52 0%,#172838 100%)", spine: "#0e1a26", foil: "#e6c778", ink: "#c7d6e4" },
];

function hash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

export function coverFor(slug: string): Cover {
  return PALETTE[hash(slug) % PALETTE.length];
}
