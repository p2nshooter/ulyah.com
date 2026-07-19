import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Driven by per-tenant CSS variables (RGB triplets defined in
        // globals.css + src/styles/themes/*) so bg-primary / text-accent /
        // accent/40 etc. automatically wear EACH SITE'S palette — the footer
        // must never stay ulyah-emerald on the navy tilawa.de or terracotta
        // dawa.es (owner: "warna footer dan body tidak seimbang").
        primary: {
          DEFAULT: "rgb(var(--tw-primary) / <alpha-value>)",
          dark: "rgb(var(--tw-primary-dark) / <alpha-value>)",
        },
        accent: "rgb(var(--tw-accent) / <alpha-value>)",
        surface: "rgb(var(--tw-surface) / <alpha-value>)",
        "text-primary": "#232323",
        "text-secondary": "#5A5A5A",
        success: "#2E7D4F",
        warning: "#C79A2B",
        danger: "#B23A3A",
      },
      fontFamily: {
        heading: ["Cinzel", "Cambria", "Georgia", "serif"],
        arabic: ["'Scheherazade New'", "Amiri", "'Traditional Arabic'", "serif"],
        body: ["Lato", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "30px",
        "3xl": "36px",
      },
      screens: {
        tablet: "641px",
        desktop: "1025px",
        ultrawide: "1537px",
      },
    },
  },
  plugins: [],
} satisfies Config;
