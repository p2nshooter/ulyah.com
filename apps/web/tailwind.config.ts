import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0B3D2E", dark: "#06251b" },
        accent: "#B8892B",
        surface: "#F4EFE3",
        "text-primary": "#232323",
        "text-secondary": "#5A5A5A",
        success: "#2E7D4F",
        warning: "#C79A2B",
        danger: "#B23A3A",
      },
      fontFamily: {
        heading: ["Cambria", "Georgia", "serif"],
        arabic: ["Amiri", "Uthmani", "serif"],
        body: ["Inter", "Calibri", "system-ui", "sans-serif"],
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
