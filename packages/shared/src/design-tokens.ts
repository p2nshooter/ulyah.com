// Design System — arsitektur doc §24. Single source of truth consumed by
// apps/web's Tailwind config so admin, public site, and email templates stay
// visually consistent.

export const colors = {
  primary: "#0B3D2E", // Navy Green — header, judul, tombol utama
  primaryDark: "#06251b", // hero/dark-mode background (matches dark mockup)
  accent: "#B8892B", // Gold — aksen, highlight ayat aktif, CTA
  surface: "#F4EFE3", // Cream — latar kartu, mode baca
  textPrimary: "#232323",
  textSecondary: "#5A5A5A",
  success: "#2E7D4F",
  warning: "#C79A2B",
  danger: "#B23A3A",
} as const;

export const fonts = {
  heading: '"Cambria", Georgia, serif',
  arabic: '"Amiri", "Uthmani", serif',
  body: '"Inter", "Calibri", system-ui, sans-serif',
} as const;

/** Minor-third (1.25) type scale, px. */
export const typeScale = [12, 14, 16, 20, 24, 30, 36] as const;

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1536,
} as const;
